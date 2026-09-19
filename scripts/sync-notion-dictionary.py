#!/usr/bin/env python3
"""Generate YakuriLab dictionary pages from Published Notion records.

The script uses only Python's standard library. Set NOTION_TOKEN (or
NOTION_API_KEY), share the three databases with that integration, then run:

    python3 scripts/sync-notion-dictionary.py

Only records whose Status is Published and whose Slug is valid are emitted.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "dictionary"
OUTPUT_DIR = ROOT / "dictionary"
API_VERSION = "2025-09-03"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

SOURCES = {
    "drug-classes": {
        "id": "3dfa2d0d-cc9d-80f8-b10c-000b970d9299",
        "title": "薬効群",
        "relation_fields": {
            "Related Drugs": "drugs",
            "Related Keywords": "keywords",
        },
    },
    "drugs": {
        "id": "3dfa2d0d-cc9d-808a-adfc-000b3120331f",
        "title": "薬剤",
        "relation_fields": {
            "Drug Class": "drug-classes",
            "Related Keywords": "keywords",
        },
    },
    "keywords": {
        "id": "3dfa2d0d-cc9d-8013-aeef-000bdf1fb959",
        "title": "キーワード",
        "relation_fields": {
            "Related Drug Classes": "drug-classes",
            "Related Drugs": "drugs",
            "Related Keywords": "keywords",
        },
    },
}


def request_json(url: str, token: str, payload: dict | None = None) -> dict:
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": API_VERSION,
        "Content-Type": "application/json",
    }
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(url, data=body, headers=headers, method="POST" if body else "GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Notion API error {error.code}: {detail}") from error


def query_published(data_source_id: str, token: str) -> list[dict]:
    url = f"https://api.notion.com/v1/data_sources/{data_source_id}/query"
    payload = {
        "filter": {"property": "Status", "select": {"equals": "Published"}},
        "sorts": [
            {"property": "Order", "direction": "ascending"},
            {"timestamp": "created_time", "direction": "ascending"},
        ],
        "page_size": 100,
    }
    rows: list[dict] = []
    while True:
        result = request_json(url, token, payload)
        rows.extend(result.get("results", []))
        if not result.get("has_more"):
            return rows
        payload["start_cursor"] = result["next_cursor"]


def plain_text(items: list[dict] | None) -> str:
    return "".join(item.get("plain_text", "") for item in (items or [])).strip()


def property_value(prop: dict | None):
    prop = prop or {}
    kind = prop.get("type")
    if kind == "title":
        return plain_text(prop.get("title"))
    if kind == "rich_text":
        return plain_text(prop.get("rich_text"))
    if kind == "select":
        return (prop.get("select") or {}).get("name", "")
    if kind == "multi_select":
        return [item.get("name", "") for item in prop.get("multi_select", []) if item.get("name")]
    if kind == "number":
        return prop.get("number")
    if kind == "relation":
        return [item.get("id", "") for item in prop.get("relation", []) if item.get("id")]
    return ""


def normalize_row(kind: str, row: dict) -> dict:
    props = row.get("properties", {})
    record = {
        "notionId": row.get("id", ""),
        "name": property_value(props.get("Name")),
        "slug": property_value(props.get("Slug")),
        "status": property_value(props.get("Status")),
        "summary": property_value(props.get("Summary")),
        "english": property_value(props.get("English")),
        "abbreviation": property_value(props.get("Abbreviation")),
        "mainTarget": property_value(props.get("Main Target")),
        "order": property_value(props.get("Order")),
        "relations": {},
    }
    optional = {
        "keywords": {"type": "Type", "tags": "Tags"},
        "drug-classes": {"category": "大分類", "subcategories": "中分類"},
        "drugs": {"routes": "Routes", "dosageForms": "Dosage Forms", "brandExamples": "商品名例"},
    }
    for output_name, notion_name in optional[kind].items():
        record[output_name] = property_value(props.get(notion_name))
    for notion_name, target_kind in SOURCES[kind]["relation_fields"].items():
        record["relations"][target_kind] = property_value(props.get(notion_name))
    return record


def validate(records: dict[str, list[dict]]) -> None:
    errors: list[str] = []
    for kind, items in records.items():
        seen: set[str] = set()
        for item in items:
            slug = item["slug"]
            label = item["name"] or item["notionId"]
            if item["status"] != "Published":
                errors.append(f"{kind}/{label}: Status is not Published")
            if not slug or not SLUG_RE.fullmatch(slug):
                errors.append(f"{kind}/{label}: invalid Slug {slug!r}")
            elif slug in seen:
                errors.append(f"{kind}: duplicate Slug {slug!r}")
            seen.add(slug)
            if not item["name"]:
                errors.append(f"{kind}/{slug or label}: Name is empty")
            if not item["summary"]:
                errors.append(f"{kind}/{slug or label}: Summary is empty")
    if errors:
        raise ValueError("Notion dictionary validation failed:\n- " + "\n- ".join(errors))


def resolve_relations(records: dict[str, list[dict]]) -> None:
    lookup = {
        kind: {item["notionId"].replace("-", ""): item for item in items}
        for kind, items in records.items()
    }
    for items in records.values():
        for item in items:
            resolved: dict[str, list[dict]] = {}
            for target_kind, ids in item["relations"].items():
                linked = []
                for notion_id in ids:
                    target = lookup[target_kind].get(notion_id.replace("-", ""))
                    if target:
                        linked.append({"name": target["name"], "slug": target["slug"]})
                resolved[target_kind] = linked
            item["relations"] = resolved


def esc(value) -> str:
    return html.escape(str(value or ""), quote=True)


def header(active: str, depth: int) -> str:
    root = "../" * depth
    links = []
    for kind in ("keywords", "drug-classes", "drugs"):
        current = ' aria-current="page"' if kind == active else ""
        href = f"/dictionary/{kind}/"
        links.append(f'<a href="{href}"{current}>{SOURCES[kind]["title"]}</a>')
    return (
        '<header class="dictionary-topbar">'
        f'<a class="dictionary-brand" href="{root}index.html">YakuriLab</a>'
        f'<nav class="dictionary-nav" aria-label="辞書">{"".join(links)}</nav></header>'
    )


def document(title: str, body: str, depth: int) -> str:
    css = "../" * depth + "assets/css/dictionary.css"
    return f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)} | YakuriLab</title>
  <link rel="stylesheet" href="{css}">
</head>
<body>{body}</body>
</html>
'''


def relation_sections(item: dict, kind: str, depth: int) -> str:
    labels = {"keywords": "関連キーワード", "drug-classes": "関連する薬効群", "drugs": "関連する薬剤"}
    root = "../" * depth
    sections = []
    for target_kind in ("drug-classes", "drugs", "keywords"):
        links = item["relations"].get(target_kind, [])
        if not links or target_kind == kind:
            continue
        anchors = "".join(
            f'<a class="dictionary-link" href="{root}dictionary/{target_kind}/{esc(link["slug"])}/">{esc(link["name"])}</a>'
            for link in links
        )
        sections.append(f'<h2>{labels[target_kind]}</h2><div class="dictionary-links">{anchors}</div>')
    return "".join(sections)


def detail_body(kind: str, item: dict) -> str:
    subtype = item.get("type") or item.get("category") or ""
    reading_bits = [value for value in (item.get("english"), item.get("abbreviation"), subtype) if value]
    facts = []
    if item.get("mainTarget"):
        facts.append(("主な作用点", item["mainTarget"]))
    if item.get("subcategories"):
        facts.append(("分類", "、".join(item["subcategories"])))
    if item.get("routes"):
        facts.append(("主な投与経路", "、".join(item["routes"])))
    if item.get("dosageForms"):
        facts.append(("主な剤形", "、".join(item["dosageForms"])))
    if item.get("brandExamples"):
        facts.append(("商品名例", item["brandExamples"]))
    fact_html = "".join(f'<li><strong>{esc(label)}：</strong>{esc(value)}</li>' for label, value in facts)
    details = f'<section class="dictionary-section"><h2>基本情報</h2><ul class="dictionary-list">{fact_html}</ul></section>' if fact_html else ""
    return f'''{header(kind, 3)}
<main class="dictionary-main">
  <div class="dictionary-breadcrumb"><a href="../../">辞書</a> › <a href="../">{SOURCES[kind]["title"]}</a> › {esc(item["name"])}</div>
  <article class="dictionary-hero">
    <div class="dictionary-type">{SOURCES[kind]["title"]}</div>
    <h1>{esc(item["name"])}</h1>
    <div class="dictionary-reading">{esc(" ｜ ".join(reading_bits))}</div>
    <p class="dictionary-lead">{esc(item["summary"])}</p>
  </article>
  <div class="dictionary-grid">
    <div>{details}</div>
    <aside class="dictionary-side">{relation_sections(item, kind, 3) or '<h2>関連項目</h2><p>準備中です。</p>'}</aside>
  </div>
</main>'''


def build_site(records: dict[str, list[dict]], destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    cards = "".join(
        f'<a class="dictionary-index-card" href="/dictionary/{kind}/"><strong>{SOURCES[kind]["title"]}</strong><span>{len(records[kind])}件を公開中</span></a>'
        for kind in ("keywords", "drug-classes", "drugs")
    )
    landing = f'''{header("", 1)}<main class="dictionary-main"><div class="dictionary-breadcrumb"><a href="../index.html">YakuriLab</a> › 辞書</div><section class="dictionary-hero"><div class="dictionary-type">薬理学辞書</div><h1>講義から、必要な知識へ</h1><p class="dictionary-lead">Notionで公開された薬理学用語、薬効群、薬剤を相互にたどれます。</p></section><div class="dictionary-index-list">{cards}</div></main>'''
    (destination / "index.html").write_text(document("薬理学辞書", landing, 1), encoding="utf-8")

    for kind, items in records.items():
        kind_dir = destination / kind
        kind_dir.mkdir(parents=True, exist_ok=True)
        item_cards = "".join(
            f'<a class="dictionary-index-card" href="/dictionary/{kind}/{esc(item["slug"])}/"><strong>{esc(item["name"])}</strong><span>{esc(item["summary"])}</span></a>'
            for item in items
        ) or '<p>現在公開中の項目はありません。</p>'
        listing = f'''{header(kind, 2)}<main class="dictionary-main"><div class="dictionary-breadcrumb"><a href="../">辞書</a> › {SOURCES[kind]["title"]}</div><section class="dictionary-hero"><div class="dictionary-type">{SOURCES[kind]["title"]}</div><h1>{SOURCES[kind]["title"]}一覧</h1><p class="dictionary-lead">NotionでPublishedに設定された項目を掲載しています。</p></section><div class="dictionary-index-list">{item_cards}</div></main>'''
        (kind_dir / "index.html").write_text(document(SOURCES[kind]["title"], listing, 2), encoding="utf-8")
        for item in items:
            page_dir = kind_dir / item["slug"]
            page_dir.mkdir(parents=True, exist_ok=True)
            page = document(item["name"], detail_body(kind, item), 3)
            (page_dir / "index.html").write_text(page, encoding="utf-8")


def write_data(records: dict[str, list[dict]], generated_at: str) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for kind, items in records.items():
        (DATA_DIR / f"{kind}.json").write_text(
            json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    manifest = {
        "generatedAt": generated_at,
        "source": "Notion",
        "filter": {"Status": "Published"},
        "counts": {kind: len(items) for kind, items in records.items()},
    }
    (DATA_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate Notion data without writing files")
    args = parser.parse_args()
    token = os.environ.get("NOTION_TOKEN") or os.environ.get("NOTION_API_KEY")
    if not token:
        print("NOTION_TOKEN is not set. See NOTION_SYNC.md.", file=sys.stderr)
        return 2

    records = {
        kind: [normalize_row(kind, row) for row in query_published(spec["id"], token)]
        for kind, spec in SOURCES.items()
    }
    validate(records)
    resolve_relations(records)
    if args.check:
        print(json.dumps({kind: len(items) for kind, items in records.items()}, ensure_ascii=False))
        return 0

    generated_at = datetime.now(timezone.utc).isoformat()
    with tempfile.TemporaryDirectory(prefix="yakurilab-dictionary-") as temp:
        staging = Path(temp) / "dictionary"
        build_site(records, staging)
        backup = OUTPUT_DIR.with_name("dictionary.previous")
        if backup.exists():
            shutil.rmtree(backup)
        if OUTPUT_DIR.exists():
            OUTPUT_DIR.rename(backup)
        try:
            shutil.copytree(staging, OUTPUT_DIR)
        except Exception:
            if OUTPUT_DIR.exists():
                shutil.rmtree(OUTPUT_DIR)
            if backup.exists():
                backup.rename(OUTPUT_DIR)
            raise
        if backup.exists():
            shutil.rmtree(backup)
    write_data(records, generated_at)
    print("Generated:", ", ".join(f"{kind}={len(items)}" for kind, items in records.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

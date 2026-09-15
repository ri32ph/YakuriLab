"""Regenerate the static home pages and curriculum mapping; no runtime fetch required."""
from pathlib import Path
from html import escape as h
import json
p=Path(__file__).resolve().parents[1]
c=json.loads((p/'data/curriculum.json').read_text());labs=json.loads((p/'assets/js/catalog.js').read_text().split('=',1)[1].strip().rstrip(';'));byid={l['id']:l for l in labs}
def icon(name):return f'<img src="assets/icons/{name}.svg" width="28" height="28" alt="">'
def card(e):
 lab=byid[e['labId']];shared=e['status']=='shared'
 return f'<a class="lesson" href="{lab["href"]}"><div class="meta"><span>LAB {e["number"]:02}</span><span class="state">{"共通教材で学ぶ" if shared else "利用できます"}</span></div><h3>{h(e["title"])}</h3><p>{h(e["question"])}</p>'+ (f'<small>{h(e["note"])}</small>' if shared else '')+'<span class="go">教材を開く →</span></a>'
def planned(e):
 related=byid.get(e.get('relatedLabId'));link=f' <a href="{related["href"]}">関連する既存教材 →</a>' if related else ''
 return f'<li><span class="number">{e["number"]:02}</span><div><strong>{h(e["title"])}</strong><p>{h(e["question"])}</p>{link}</div><span class="planned-label">予定</span></li>'
s='''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>薬理シミュレーションラボ</title><meta name="description" content="薬が体に入るところから、細胞・臓器・病態まで。触って、動かして、確かめる薬理学。"><link rel="stylesheet" href="assets/css/home.css"></head><body><a class="skip-link" href="#basic">教材一覧へ</a><header><div class="container topbar"><a class="brand" href="index.html">＋ 薬理シミュレーションラボ</a><a href="#how-to">使い方</a></div></header><main class="container"><section class="hero"><span class="eyebrow">PHARMACOLOGY SIMULATION LAB</span><h1>薬が「なぜそうなるのか」を、<br>触って・動かして・確かめる。</h1><p class="lead">薬の動きから、細胞・臓器の変化へ。<br>看護学生・薬理学をはじめて学ぶ方のための、操作して学ぶ教材です。</p><span class="availability">27教材を利用できます</span><span class="scope">全15章・70テーマの学習マップ</span></section><nav class="entrances" aria-label="学び方を選ぶ">'''
for image,title,desc,href in [('Pill','はじめから学ぶ','01 薬の吸収から、一つずつ。',byid[1]['href']),('Network','人体・臓器から選ぶ','全身を見渡して、気になる臓器へ。','#chapter-6'),('Layers','テーマから探す','章ごとの目次から教材を選ぶ。','#basic')]:s+=f'<a href="{href}">{icon(image)}<div><strong>{title}</strong><span>{desc}</span></div><b aria-hidden="true">→</b></a>'
s+='''</nav><section class="story" aria-label="学びのつながり"><span>薬が体に入る</span><i>→</i><span>体内を動く</span><i>→</i><span>標的に届く</span><i>→</i><span>細胞・臓器が変わる</span><i>→</i><span>薬の作用点を考える</span></section><section id="how-to" class="how"><h2>このラボの使い方</h2><p>① 条件を変える　② 模式図・グラフを見る　③ 理由を読み、もう一度試す</p><small>学習用の単純化モデルです。数値は実際の検査値や投与量の判断には使えません。</small></section><section id="basic"><div class="section-intro"><span class="eyebrow">FOUNDATION · Ⅰ–Ⅶ</span><h2>基礎から、自律神経まで</h2><p>今使える教材を中心に表示しています。「共通教材」は複数テーマをまとめたページです。</p></div><nav class="chapter-nav" aria-label="基礎の章へ移動">'''
for j,ch in enumerate(c['chapters'][:7],1):s+=f'<a href="#chapter-{j}">{ch["roman"]} {h(ch["subtitle"])}</a>'
s+='</nav>'
for j,ch in enumerate(c['chapters'][:7],1):
 items=[e for e in c['items'] if ch['start']<=e['number']<=ch['end']];ready=[e for e in items if e['status']!='planned'];pending=[e for e in items if e['status']=='planned']
 aliases={1:'step-1',2:'step-3',4:'step-4',6:'next-labs'}
 if j in aliases:s+=f'<span id="{aliases[j]}" class="anchor"></span>'
 if j==1:s+='<span id="step-2" class="anchor"></span>'
 s+=f'<section class="chapter" id="chapter-{j}"><div class="chapter-heading">{icon(ch["icon"])}<div><span class="eyebrow">{ch["roman"]} · {h(ch["subtitle"])}</span><h2>{h(ch["title"])}</h2></div><span class="range">{ch["start"]:02}–{ch["end"]:02}</span></div><div class="lessons">'+''.join(card(e) for e in ready)+'</div>'
 if pending:s+=f'<details class="planned"><summary>この章の追加予定 · {len(pending)}テーマ</summary><ul>'+''.join(planned(e) for e in pending)+'</ul></details>'
 s+='</section>'
s+='''</section><section class="roadmap" id="roadmap"><span class="eyebrow">NEXT · Ⅷ–XV</span><h2>その先へ｜臓器・病態と薬</h2><p>ここからは今後の拡張計画です。章を開くと、予定しているテーマを確認できます。</p>'''
for ch in c['chapters'][7:]:
 items=[e for e in c['items'] if ch['start']<=e['number']<=ch['end']];ready=[e for e in items if e['status']!='planned'];pending=[e for e in items if e['status']=='planned']
 state=f'{len(ready)}教材を利用可' if ready else '今後の予定'
 s+=f'<details class="future" {"open" if ready else ""}><summary><span>{ch["roman"]}</span><strong>{h(ch["title"])}</strong><small>{ch["start"]:02}–{ch["end"]:02} · {state}</small></summary>'
 if ready:s+='<div class="lessons roadmap-lessons">'+''.join(card(e) for e in ready)+'</div>'
 if pending:s+='<ul>'+''.join(planned(e) for e in pending)+'</ul>'
 s+='</details>'
s+='</section></main><footer class="container"><p>薬の名前の前に、身体の変化を理解する。</p><a href="#">ページの先頭へ ↑</a></footer></body></html>'
for name in ['index.html','pharmacology_lab_index.html']:(p/name).write_text(s)
md='# 新目次と既存教材の対応\n\n表示番号は新目次、内部ID・既存URLは固定。共有教材は未実装範囲の完成を意味しません。\n\n| 新番号 | テーマ | 状態 | 既存URL／関連教材 |\n|---|---|---|---|\n'
for e in c['items']:
 lab=byid.get(e.get('labId')) or byid.get(e.get('relatedLabId'));link=f'[{lab["title"]}]({lab["href"]})' if lab else '—'
 md+=f'| {e["number"]:02} | {e["title"]} | '+{'ready':'利用可','shared':'共通教材・拡充予定','planned':'追加予定'}[e['status']]+f' | {link} |\n'
(p/'CURRICULUM.md').write_text(md)
print('Generated two static home pages and CURRICULUM.md from 70 themes.')

# Notion辞書同期

YakuriLabの辞書は、以下のNotion DBを元データとして生成できます。

- 薬理学｜キーワードDB
- 薬理学｜薬効群DB
- 薬理学｜薬剤DB

公開条件は各DBの `Status` が `Published` であり、有効な `Slug`、`Name`、`Summary` が設定されていることです。Notionページ自体をWeb公開する必要はありません。

## 初回設定

1. Notionで内部インテグレーションを作成し、読み取り権限を付ける。
2. 上記3つのDBをそのインテグレーションに共有する。
3. トークンを環境変数へ設定する。

```bash
export NOTION_TOKEN="secret_..."
```

トークンは `.env` やGit管理下のファイルへ記録しないでください。

## 同期

YakuriLabのルートで実行します。

```bash
python3 scripts/sync-notion-dictionary.py --check
python3 scripts/sync-notion-dictionary.py
```

最初のコマンドは検証だけを行い、ファイルを変更しません。2つ目のコマンドはPublishedの項目から次を更新します。

```text
data/dictionary/*.json
dictionary/index.html
dictionary/keywords/{slug}/index.html
dictionary/drug-classes/{slug}/index.html
dictionary/drugs/{slug}/index.html
```

Notionで `Draft` または `Review` に戻した項目は、次回同期時に公開HTMLから除外されます。同期後にVercelへデプロイすると公開サイトへ反映されます。

## Vercelで自動化する場合

VercelのEnvironment Variablesへ `NOTION_TOKEN` を登録し、Build Commandとして次を設定します。

```bash
python3 scripts/sync-notion-dictionary.py
```

設定前に、ローカルで `--check` と通常同期の両方が成功することを確認してください。

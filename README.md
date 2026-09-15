# 薬理シミュレーションラボ

看護学生・薬理学初学者向けの静的HTML教材です。トップページとLAB 03〜12を収録しています。

## 開き方

`index.html` をブラウザで開いてください。ビルドや外部サービスへの接続は不要です。元のトップページ名 `pharmacology_lab_index.html` でも開けます。

## 既存サイトへの追加

このディレクトリを既存サイトの静的ファイル公開場所へコピーし、既存ページから `pharmacology-lab/index.html` へのリンクを追加します。全リンクは相対パスです。既存サイトのリポジトリは未提供のため、本番への統合・公開は行っていません。

CSSとJavaScriptは各HTMLから読み込む構成です。既存サイトのページへCSSだけを直接読み込ませず、独立したページとして配置してください。元のプロトタイプファイルは変更していません。

## ファイル構成

- `index.html`：トップページ。元のトップページ名のHTMLも同じ内容です。
- `pharmacology_lab_*.html`：各LAB。元のファイル名を維持しています。
- `assets/css/common.css`：各LABに共通するスタイル。
- `assets/css/layout.css`：画面幅への対応、ナビゲーション、フォーカス表示。
- `assets/css/lab-*.css`：各LAB固有のスタイル。`dosing.css` はLAB 04〜06共通。
- `assets/js/common.js`：要素の取得、一次消失、グラフ座標の共通処理。
- `assets/js/repeated-dose.js`：LAB 05・06の反復投与モデル。
- `assets/js/lab-*.js`：各LAB固有の処理。
- `assets/js/catalog.js`：公開LABの一覧。前後の移動先を定義。
- `assets/js/navigation.js`：LAB間の移動と操作要素のアクセシビリティ設定。

## LABを増やすには

近い内容のHTML・CSS・JavaScriptを複製し、HTMLの `data-lab` と読み込み先を更新します。`catalog.js` に番号・タイトル・ファイル名を番号順で追加すると、前後のLABへの移動に反映されます。トップページ2ファイルの該当カードもリンクに変更してください。01・02・13〜16は現在「準備中」です。

## モデルの扱い

時間経過グラフは時間0から現在時刻まで履歴を追加します。標準条件はグレー破線、親薬物は赤、代謝物は黄で表します。濃度と量は学習用の相対値です。消失能力の割合はeGFR・CrCl・Child-Pughに直接対応しません。

反復投与は瞬時投与・一次消失を仮定しています。投与時刻まで正確に消失を計算し、その時刻の投与直前・直後の値を記録します。LAB 06の帯は現在条件の定常状態のピーク・トラフを示し、曲線とは別の目安です。定常値比は投与間隔内の同じ時点と比較します。

LAB 07・08の誘導・阻害はボタンで即時に切り替える模式モデルです。代謝物量は生成と消失の両方で決まり、生成が増えても、すべての時点で体内の代謝物量が多くなるとは限りません。LAB 09の代謝物生成は「その他の消失経路」が実際に占める割合で計算します。

受容体はON/OFFスイッチとして示します。図の個数は丸めており、実際の占有率と反応が必ずしも1対1ではないことを注記しています。

反復投与の参考： [Intermittent Drug Dosing Intervals Guided by the Operational Multiple Dosing Half Lives](https://pmc.ncbi.nlm.nih.gov/articles/PMC3677834/)。実装は単一の一次消失モデルに限定しています。

## 動作確認

`tests/browser.cjs` はPlaywrightとGoogle Chromeを使用します。`PLAYWRIGHT_PATH` にPlaywrightパッケージのパスを指定することもできます。

```sh
node tests/browser.cjs
node tests/models.cjs
```

1440px・390px・320px幅の全ページで、横方向のはみ出し、曲線の生成、操作、リセット、実行エラーを確認します。

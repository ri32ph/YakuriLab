# 薬理シミュレーションラボ

看護学生・薬理学初学者向けの静的HTML教材です。トップページとLAB 01〜18を収録しています。

## 開き方と公開先への配置

`index.html` をブラウザで開いてください。ビルドや外部サービスへの接続は不要です。`pharmacology_lab_index.html` も同じトップページです。

公開済みサイトは https://yakuri-lab.vercel.app/ です。この更新版の公開先への反映は行っていません。更新時は、HTMLだけでなく `assets` を含むフォルダ全体を使用してください。リンクは相対パスで、元のプロトタイプファイルは変更していません。

## 学習の順番

| 番号 | 教材 | 状態 |
| --- | --- | --- |
| 01 | 薬の吸収 | 作成済み |
| 02 | 薬の分布 | 作成済み |
| 03 | 肝臓・腎臓からの消失 | 作成済み |
| 04 | 半減期 | 作成済み |
| 05 | 反復投与と蓄積 | 作成済み |
| 06 | 定常状態 | 作成済み |
| 07 | CYP阻害 | 作成済み |
| 08 | CYP誘導 | 作成済み |
| 09 | 腎排泄と腎機能 | 作成済み |
| 10 | 薬力学的相互作用 | 作成済み |
| 11 | 活動電位と神経の伝導 | 新規作成 |
| 12 | シナプスでの伝達 | 新規作成 |
| 13 | 作動薬 | 旧11から変更 |
| 14 | 拮抗薬 | 旧12から変更 |
| 15 | α1受容体 | 旧13から変更 |
| 16 | β1受容体 | 作成済み |
| 17 | β2受容体 | 作成済み |
| 18 | 副交感神経 | 作成済み |

11〜14はSTEP 4「神経と薬の作用」です。基礎編の01〜14の後に、15以降の自律神経編へ進みます。

## 以前のURLも同じ教材を開きます

番号変更前の次のHTMLは、新しい番号の教材と同じ内容を持つ互換ページです。削除せずに配置してください。

| 以前のURL | 現在の教材・正規URL |
| --- | --- |
| `pharmacology_lab_11_agonist_explained.html` | 13：`pharmacology_lab_13_agonist.html` |
| `pharmacology_lab_12_antagonist.html` | 14：`pharmacology_lab_14_antagonist.html` |
| `pharmacology_lab_13_alpha1.html` | 15：`pharmacology_lab_15_alpha1.html` |

トップページ・LAB間ナビゲーションは正規URLを使用します。互換ページも同じCSS・JavaScriptを読み込みます。内容を修正するときは対応する正規ページと互換ページのHTMLを揃えてください。

## ファイル構成と追加方法

- `assets/css/index.css`：トップページ専用。各LABへ読み込ませません。
- `assets/css/common.css`、`layout.css`、`dosing.css`：既存LABの共通スタイル。
- `assets/css/neural.css`：11・12共通の表示。
- `assets/js/catalog.js`：公開教材の番号・タイトル・正規URL。前後の移動先を定義します。
- `assets/js/navigation.js`：移動リンクと操作要素のアクセシビリティ設定。
- `assets/js/neural-models.js`：活動電位・シナプスの計算。
- `assets/js/neural.js`：11・12共通の開始・停止・履歴描画。
- `assets/js/receptor-models.js`：15の競合的結合と模式的な血管収縮。
- `assets/js/lab-13.js`〜`lab-15.js`：作動薬・拮抗薬・α1受容体の操作処理。
- `assets/js/intro-models.js`、`intro.js`：01・02の計算・操作。
- `assets/js/repeated-dose.js`：05・06の反復投与。
- `assets/icons`：ローカル同梱のLucideアイコン。ライセンスは同フォルダの `LICENSE`。

新しいLABは、HTMLの `data-lab` と読み込み先を設定し、`catalog.js` に番号順で追加します。トップページ2ファイルの該当カードをリンクに変更してください。

## モデルの前提

時間経過グラフは、時間0から現在時刻まで履歴を追加します。標準はグレー破線、現在は実線です。薬物動態の親薬物は赤、代謝物は黄です。12の黄は神経伝達物質を示し、ページ内で明示しています。

01は全量吸収・初回通過効果なしの一次吸収／一次消失モデルです。02は吸収・消失を除いた2区画モデルで、血液と組織の合計量を100に保ちます。

05・06は瞬時投与・一次消失を仮定します。投与直前と直後の値を正しい投与時刻で記録し、06の定常値比は投与間隔内の同じ時点と比較します。

11は1回の活動電位の模式波形です。刺激の強さ50を学習用の閾値とし、閾値以上で一定振幅の波を各位置に遅れて発生させます。閾値未満の局所電位、連続発火、跳躍伝導は省略しています。膜電位の値は代表的な例、時間は引き延ばした相対単位です。

12は信号到達後の短い一定放出と一次除去を組み合わせています。受容体を介した局所反応を示し、次の細胞に必ず活動電位が生じるモデルではありません。除去機構を個別には計算していません。

15はα1作動薬と拮抗薬の可逆的競合モデルです。受容体のON、血管の内径、収縮の指標を示します。内径は説明用で、血圧や血管抵抗の実測値は算出しません。内因性の刺激や基礎的な血管緊張を省略しており、作動薬0では拮抗薬だけを増やしても血管は広がりません。実際の受容体占有率と反応は必ずしも1対1ではありません。

参考資料は各ページの補足解説に掲載しています。いずれも患者の投与設計には使用しません。

## 検証

Node.jsで次のテストを実行できます。

```sh
node tests/intro-models.cjs
node tests/intro-controls.cjs
node tests/neural.cjs
node tests/alpha1.cjs
node tests/autonomic.cjs
```

計算と、DOMを模した環境での操作・描画属性を確認します。ブラウザでの見た目や操作性を保証するテストではありません。

`tests/browser.cjs` と `tests/models.cjs` はPlaywright・Google Chromeを使う既存のブラウザテストです。今回の新規・改訂ページはローカルURLのブラウザ制限により画面確認を実施できていません。過去の表示確認結果は `tests/RESULTS.md` に実施範囲を分けて記載しています。

## LAB 16〜18

`autonomic-models.js` に競合的結合と臓器の相対指標、`autonomic.js` に共通の操作処理、`autonomic.css` に臓器表示を配置しています。受容体モデルは15と同じ結合の考え方を使いますが、臓器ごとの作用方向を変えています。

- 16：心拍の速さ・収縮力の増加。
- 17：気管支内径の増加。
- 18：心拍の速さ・気管支内径の低下、唾液分泌の増加。

指標1は追加刺激のない基準で、実測値ではありません。受容体がONになる割合から各指標への係数は説明用です。18のM2・M3は代表的な共通の結合式で示し、実際の臓器間の感受性差を計算していません。内因性の刺激は省略しているため、作動薬0で拮抗薬だけを増やしても基準からは変わりません。

心臓アイコンの動きは停止・再開でき、動きを減らす端末設定にも対応しています。動きの速さから実際の心拍数を読み取ることはできません。3ページのモデルと操作処理はテスト済みですが、画面確認とVercel公開先への反映は未実施です。

## 自律神経の全身シミュレーター（INTRO）

- `pharmacology_lab_autonomic_map.html` を14と15の間に配置。既存01〜18の番号とURLは維持。
- `catalog.js` のINTROエントリーと受容体LABのsemantic keyから、共通ナビゲーションと臓器別リンクを解決。
- `lab-15.css` のカード・操作パネル・36/64レイアウトを再利用。専用の `autonomic-map.css` は人体と動きを担当。
- `autonomic-map-model.js` は4つの独立した定性的シナリオ。数値は図形やアニメーション用で臨床指標ではない。`autonomic-map.js` が操作・説明・受容体表示・動きの開始停止を連動。
- 人体はローカルSVG、臓器操作はHTMLボタン。外部ライブラリや通信は不要。動きを減らす設定では停止して開始できる。
- 副交感神経操作で全身血管を変化させず、交感神経抑制時の気道径は一律に決めない。説明と参考資料はページ内に掲載。

## 全体目次の再編（71テーマ）

現在のトップページはⅠ〜XVの新目次に沿っています。34本の教材を利用可能として案内し、未実装テーマは「予定」として区別しています。

- `data/curriculum.json`：章・新しい表示番号・問い・実装状態・既存教材の対応。`ready` は利用可、`shared` は共通教材、`planned` は追加予定。
- `assets/js/catalog.js`：既存URLと内部IDを維持。`label` が新しい表示番号、`numbers` が対応テーマ番号。シミュレーションの `data-lab` は変更しないでください。
- `CURRICULUM.md`：71テーマの対応表。11に小児薬用量の推算を追加し、神経基礎編は14「細胞膜とNa⁺・K⁺」→15「Na⁺流入と脱分極」→16「活動電位と伝導」→17「シナプス伝達」の4段階です。既存URLと内部IDは維持しています。
- `scripts/build-home.py`：上記データからトップページ2ファイルと対応表を静的生成します。更新時は `python3 scripts/build-home.py` を実行してください。トップページでJavaScriptや通信は不要です。
- `assets/css/home.css`：新トップページ専用のスタイル。既存LABのCSSから分離しています。

新目次では小児薬用量の推算は11、薬力学的相互作用は12、自律神経の全身図は22です。番号を含む従来のファイル名は、既存リンクを保つため変更していません。旧トップページのアンカーも維持しています。

### LAB 11：薬用量をどう見積もる？

- 年齢・月齢・体重・身長・成人量を動かし、Young、Clark、Augsberger II、Crawford、von Harnack、中山の推算量を同時比較。
- 発展モードにAugsberger I、Fried、Lenart、Mosteller・Du Bois・藤本のBSA比較を収録。
- 換算表は年齢区分を段階適用し、区分間を補間しません。架空のmg/kg/日・最大量・分服例は古典的推算と分けて表示します。
- 計算ロジックは `pediatric-dose-model.js`、画面連動は `pediatric-dose.js`、専用表示は `pediatric-dose.css` に分離しています。

### 追加実装：LAB 10・12・13・19・20・25

- LAB 10：吸収・代謝・腎排泄を変え、標準条件と現在条件の濃度履歴・曝露量を比較。
- LAB 12：用量、Emax、EC50を変えて用量反応曲線を観察。
- LAB 13：細胞膜のNa⁺・K⁺、K⁺透過性、Na⁺/K⁺ポンプと膜内側の負電位を模式化。
- LAB 19：完全作動薬と部分作動薬の最大反応を比較。
- LAB 20：受容体・イオンチャネル・酵素・トランスポーターを選ぶ作用標的ハブ。
- LAB 25：β3作動薬・拮抗薬と膀胱排尿筋の弛緩・蓄尿方向を観察。
- 6教材は `expansion-labs.css`、`expansion-models.js`、`expansion-labs.js` を共有します。

### LAB 28：血圧を決めるもの

- `pharmacology_lab_28_blood_pressure.html`：心拍数、一回拍出量、血管の太さを操作する循環LAB。
- `blood-pressure-model.js`：CO = HR × SV、血管径から相対TPR、CO × TPRから血圧の方向を計算。実測血圧は算出しません。
- `blood-pressure.js`：心拍・血流粒子・血管径・指標・因果経路・3つのプリセット・発展モードを連動。
- `blood-pressure.css`：既存の `lab-15.css` に循環図とLAB 28固有表示を追加。PCは36/64、800px以下は1カラム。
- 発展モードでは循環血液量 → 前負荷 → SV、および心収縮力 → SVを追加。後負荷、反射、RAAS、腎臓の長期調節は計算しません。
- α1とβ1のリンクは `catalog.js` の受容体キーから解決します。

### LAB 13・14・15・20の動きと分割

- LAB 13：K⁺が漏洩チャネルを通って細胞外へ移る模式アニメーションを追加。K⁺の通りやすさで移動速度が変わります。
- LAB 14：`pharmacology_lab_14_depolarization.html` を追加。刺激 → 閾値 → Na⁺チャネル開口 → Na⁺流入 → 脱分極を1回ずつ観察します。
- LAB 15：既存の活動電位ページを伝導専用として表示し、LAB 14との共通表示を解消。既存URLと内部IDは維持しています。
- LAB 20：受容体への結合、チャネルを通るイオン、酵素反応、トランスポーターによる移動を、標的ごとに異なるアニメーションで表示します。標的のクリックまたは「もう一度動かす」で1回だけ再生し、ループしません。
- LAB 13は端末の「動きを減らす」設定で初期停止し、画面のボタンから開始できます。

### LAB 29：RAAS

- `pharmacology_lab_29_raas.html`：循環血液量を入口にした8段階の観察。人体、二方向の経路、7項目の相対変化、ON／OFF比較を表示。
- `assets/js/raas-model.js`：`RAAS_MODEL.state(volume, stage, enabled)`。血液量は0〜100（50が標準）、段階は0〜7。血管反応は段階5、体液保持は段階6から。実時間・臨床値・回復量は計算しません。
- `assets/js/raas-pathway.js`：`RAAS_PATHWAY.mount(element)`が返す`render(state)`で経路を段階表示。30でも同じモデル・描画を使用できます。`data-target`の`renin`、`angiotensin-i`、`ace`、`angiotensin-ii`、`at1`、`mr`を薬の作用点表示用に定義。薬効モデル自体は未実装です。
- `assets/js/raas.js`：スライダー、プリセット、タイマー、停止・再開・手動送り、ON／OFFと表示の同期。条件変更時はタイマーを破棄して観察をやり直します。
- `assets/css/raas.css`：28と同じ`lab-15.css`の36：64レイアウトを使い、800px以下で1カラム。循環の赤系、Na⁺保持の黄系、標準の青灰色を使用。
- 標準でもRAASの基礎活動はあります。ONは低下に対する追加反応、OFFは反応全体を外す仮想比較です。薬剤投与による完全遮断を意味しません。血液量の多い設定では活動が弱まる方向を定性的に表示します。
- 28の次リンク、カタログ、目次データ、生成トップページ2本・対応表を更新。30〜32は予定として維持しています。

検証：`node tests/raas.cjs`、`node tests/raas-browser.cjs`（PlaywrightとChromeが必要。`PLAYWRIGHT_PATH`でモジュールを指定可能）。2026-09-16に幅1440・1280・390・320px、ON／OFF、段階再生、リセット、reduced-motion、28からのナビゲーションを確認しました。画面画像は`tests/raas-1440.png`と`tests/raas-390.png`です。公開先への反映は行っていません。

### LAB 30：降圧薬

初期画面は心臓・血管・腎臓・RAASの調節マップです。「薬を選んで重ねる」を開くと、DHP系Ca拮抗薬、ACE阻害薬、ARB、サイアザイド系・類似利尿薬、β遮断薬を選べます。MRAは発展モードに配置しています。比較モードでは同じデータを左右独立に表示します。

- `pharmacology_lab_30_antihypertensives.html`：本体。PCは共通CSSの36：64、800px以下は1カラム。比較・発展・副作用・看護観察は主要部の下に配置。
- `assets/js/antihypertensive-model.js`：薬効群ごとの`organs`、`targets`、7指標、因果経路、注意点、観察項目。`state(id, compensate)`は表示用状態を返し、用量・臨床血圧・薬効順位は計算しません。
- `assets/js/circulation-map.js`：29の人体SVGと28の心臓・血管の視覚表現を使った共通描画。`CIRCULATION_MAP.mount(container).render(state)`。IDを共有せず、31・32や複数比較画面でも使える局所セレクター。
- `assets/js/raas-pathway.js`：29の段階表示を維持し、`mount(container, {mode:'drug'})`を追加。`render(state)`でACE、AT1、β1によるレニン分泌、MRにBLOCKを表示。ARBでもAng IIの生成は残します。AT1は血管・副腎への分岐の前に置いています。
- `assets/js/antihypertensive.js`：薬選択、比較プリセット、MRA、補正反応、リセット、薬別の注意点・看護観察を同期。
- `assets/css/antihypertensive.css`：循環マップ・比較・遮断位置の短いアニメーション。reduced-motionではアニメーションを省略。
- カタログ、目次データ、29→30リンク、共通ナビゲーションを更新。31・32は予定。トップページの教材数は`build-home.py`でカタログから求め、追加時に古い件数が残らないように修正。

#### 方向表示の前提

RAASの矢印は実効的な作用の方向であり、血中レニン・Ang II濃度ではありません。基本表示の→は変化をモデルに加えていない項目です。ACE阻害薬・ARBのCO↓は体液保持が弱まる寄与を示し、後負荷軽減などを含む実際のCO変化を断定しません。利尿薬は初期の体液量作用を表示し、長期のTPR低下は解説します。β遮断薬はβ1作用が中心で、下流の血管・体液量への寄与は経路図と説明で示します。補正反応ONはDHP系の反射性心拍数増加、利尿薬のRAAS活性化を例示します。

検証コマンド：`node tests/antihypertensive.cjs`、`node tests/antihypertensive-browser.cjs`。ブラウザテストはChromeとPlaywrightが必要で、`PLAYWRIGHT_PATH`でモジュールを指定できます。比較は併用ではなく、単剤同士の作用機序比較です。公開サイトへの反映は行っていません。

### LAB 31：心不全

- `pharmacology_lab_31_heart_failure.html`：ポンプ機能と「時間を進める」で、初期→代償期→持続を観察。PCは36：64、800px以下は1カラム。スマートフォンでは人体を大きく表示し、その下に二つの代償経路を配置。
- `assets/js/heart-failure-model.js`：`HEART_FAILURE_MODEL.state(pump, phase)`。pumpは20〜100の抽象指標でLVEFではありません。phaseは0〜2の説明段階で、実時間・臨床病期・予後を表しません。相対COは相対HR×相対SVで、代償期は初期より循環を補い、持続期は負担が増える一例を示します。
- `assets/js/heart-failure-map.js`：`HEART_FAILURE_MAP.mount(container).render(state, options)`。30の`CIRCULATION_MAP`から人体を再利用し、肺・下肢のうっ血、拍動、血管内腔、体液量、悪循環の戻り矢印を追加。
- `assets/js/heart-failure.js`：操作・時間・症状リンク・動きの停止・リセット・RAAS図を同期。条件変更時は初期に戻ります。
- `assets/css/heart-failure.css`：人体、独立ノード、動くループ、うっ血と灌流の別指標。端末の動きを減らす設定では初期停止し、手動開始・停止ができます。
- `assets/js/raas-pathway.js`：任意の`triggerLabel`を追加。31では「CO低下など → 有効動脈血液量・腎灌流↓方向」を指定。29・30の既定表示は維持。
- カタログ・目次、29/30→31のリンク、共通ナビゲーションを更新。32は予定として維持しています。

#### LAB 32への再利用

`state.nodes`と図上の`data-target`には、`heart`、`kidneys`、`sympathetic`、`raas`、`volume`、`vessels`、`congestion`、`load`を定義しています。描画オプションの`emphasis`に同じキーの真偽値を渡すと、それぞれを独立して強調できます。`focus`は症状からの注目先、`motion`は動きの開始・停止です。全DOM参照は描画先内に限定しています。32で薬の作用点を重ねるための構造であり、薬効モデルは31には含めていません。

肺・下肢のうっ血は持続時の例として同時に表示します。低灌流とうっ血は独立した値を持ち、必ず同時に同程度で現れるという意味ではありません。基本モデルは心不全全体を再現せず、HFpEF、前負荷、充満圧などの限界を発展解説に記載しています。

検証：`node tests/heart-failure.cjs`、`node tests/heart-failure-browser.cjs`。ブラウザテストはPlaywright・Chromeを使用し、1440・1280・390・320px、症状からの強調、リセット、reduced-motion、RAASの起点、30→31の移動を確認。公開先への反映は行っていません。

### LAB 32：心不全治療薬

主として慢性HFrEFを扱う作用機序教材です。31の悪循環を初期表示し、薬効群を選ぶと同じ図の作用点と下流の変化を更新します。ループ利尿薬は「主にうっ血・症状を改善する」枠に分けています。

- `pharmacology_lab_32_heart_failure_drugs.html`：単剤、追加モード、選択解除、治療前／後の切替、RAAS・NP系・尿細管の詳細、薬別の観察項目。
- `assets/js/hf-treatment-model.js`：`HF_TREATMENT_MODEL.drugs`に役割、作用点、介入ラベル、変化する経路、機序、観察理由を定義。`choose(current,id,append)`は単剤／追加を処理し、ARNI・ACE阻害薬・ARBを1枠として排他的に選択します。`state(ids,after)`は治療前と図示用の介入状態を生成。
- `assets/js/hf-treatment-map.js`：`HEART_FAILURE_MAP`をそのままマウントする表示レイヤー。31の人体・ノード・血管・体液量・肺／下肢うっ血・戻り矢印を使い、介入部分にBLOCK、NP作用増強、下流変化を重ねます。31の共有コンポーネント本体は変更していません。
- `assets/js/hf-treatment.js`：治療選択・追加・除外、治療前後、動き、詳細経路、看護観察を同期。29・30の`RAAS_PATHWAY`のdrugモードを再利用し、ARNIのNP系とSGLT2／NKCC2の尿細管表示を補足。
- `assets/css/hf-treatment.css`：既存36：64レイアウトに治療表示を追加。800px以下は1カラム。BLOCKの短いアニメーションはreduced-motionで省略し、拍動・矢印も初期停止。
- カタログ・目次データ・29/31→32リンク・共通ナビゲーションを更新。33は予定として一覧へ案内します。

#### 表示と医学的な前提

独立チャンネルは心拍数、交感神経作用、RAAS作用、Ang II、アルドステロン作用、血管、腎臓、Na⁺、体液量、肺うっ血、下肢浮腫、心負荷です。RAAS作用の低下はホルモン濃度の一律低下を意味しません。ARNIはAT1遮断＋NP系の作用増強、MRAはMR作用の遮断として表示します。

図形の薄まり・血管径・拍動速度は定性的な作用を見せる描画値です。薬効の強さ・用量・即時反応・予後は計算せず、COやEFの回復も予測しません。複数の薬で同じ経路に介入しても描画効果量を加算しません。SGLT2阻害薬の心不全への有益性を単なる利尿に還元せず、β遮断薬の短期作用と慢性的な過剰刺激抑制を区別しています。治療前への切替は選択を保持し、除外・リセット時は残存する強調を取り除きます。

検証：`node tests/hf-treatment.cjs`、`node tests/hf-treatment-browser.cjs`。Chrome／Playwrightを用い、単剤7選択肢、4群の追加、同一RAAS枠の入替、ループ追加、除外、治療前後、リセット、reduced-motion、4画面サイズ、31→32リンクを確認。公開サイトへの反映は未実施です。

### LAB 33｜虚血性心疾患

- `pharmacology_lab_33_ischemic_heart_disease.html`：需要と供給を先に比較し、運動・冠血流予備能低下・急な血流低下の3実験を用意。基本操作はHR・収縮力・冠動脈の通りやすさ、発展操作は壁応力・酸素運搬です。
- `assets/js/ischemia-model.js`：純粋関数 `ISCHEMIA_MODEL.state(input)`。`hr / contractility / narrowing / wall / oxygen / thrombus / drug` から、需要・供給・冠血流・拡張期・不足割合などを返します。正常予備能では運動時の供給も増え、低予備能では安静時と運動時で需給が変わります。狭窄率の臨床閾値は使いません。
- `assets/js/coronary-heart.js`：`CORONARY_HEART.mount(container).render(state, {motion})`。心筋・冠動脈・血栓・内腔・血流・酸素需給・壁応力・拡張期を独立した描画要素にし、34以降で再利用できます。セレクターはコンテナ内に限定し、複数インスタンスを独立して描画できます。
- `assets/js/ischemia.js`：プリセット、薬効群、時間記録を制御。0〜120の学習コマに実際のサンプルを追記し、条件変更で過去の記録を書き換えません。背景タブでは記録が進みません。開始／一時停止／再開／1コマ送り／記録消去／全リセットを用意。
- `assets/css/ischemia.css` と共通 `lab-15.css`：既存の赤い心臓・ピンクの血管・青い操作の視覚言語を継承。PCは36：64、800px以下は1列。動きを減らす設定では初期停止し、利用者の操作で開始できます。
- 薬効群データは `ISCHEMIA_MODEL.drugs`。β遮断薬、硝酸薬、DHP系／非DHP系Ca拮抗薬、抗血小板薬を区別。硝酸薬は前負荷・壁応力への作用、抗血小板薬は形成経路のBLOCKを示し、固定狭窄や既存血栓を消しません。
- 傷害表示 `advance(previous, state)` は不足の持続を説明する抽象モデルです。実時間・ATP値・梗塞診断を計算せず、高度持続時は「不可逆的傷害の可能性」と表示します。一度表示したリスクは需給の改善だけでは消しません。
- 32→33のリンク、カタログ、教材一覧、目次を更新。34は未実装のため予定一覧へ案内します。公開サイトへのデプロイは含みません。

検証：`node tests/ischemia.cjs`。ブラウザ検証：`PLAYWRIGHT_PATH=（Playwrightのパス） node tests/ischemia-browser.cjs`。Chromeが必要です。

### LAB 34｜不整脈

- `pharmacology_lab_34_arrhythmia.html`：最初は正常洞調律のSTARTから開始。洞結節の生成速度・AV伝導速度、1回の心室異所性刺激、AV遅延／一部途絶を操作。発展欄でリエントリー・AF・VT・VFを別々に観察します。
- `assets/js/rhythm-model.js`：`RHYTHM_MODEL.parameters(input)` と `create()`。エンジンは `reset(input)` / `step(dt,input)` / `snapshot()` / `ectopic()` を提供。各刺激の洞結節・心房・AV・心室への到達時刻と、その時点のパラメーターを保持し、ECG・電気点灯・遅れた機械的収縮を共通イベントから計算します。
- 時間は引き伸ばした学習用の0〜48。固定ステップでサンプルを追記します。設定変更で過去を書き換えず、モード切替だけは記録を消して待機。背景タブで経過時間をまとめて再生しません。
- `ventricularAP(age,drug)`：Na⁺立ち上がり・初期再分極・Ca²⁺を含むプラトー・K⁺再分極・静止を分離。`nodalAP(age,parameters)`：拡張期脱分極とCa²⁺主体の立ち上がりを持つ別モデル。薬の固定係数は臨床波形・効果量の予測ではありません。
- `assets/js/cardiac-electrical-view.js`：`CARDIAC_ELECTRICAL_VIEW.mountHeart(container)` / `mountECG(container)` / `mountAP(container)`。全てコンテナ内にセレクターを限定。ECGだけは `append(snapshot)` と `reset()` で管理します。APの灰色線は1周期の参考線で、色線・現在点・イオン表示が心臓のイベントと同期します。
- 33の `CORONARY_HEART.outline` を共有。既存の心臓外形を定数として公開しただけで、33の描画APIは維持。神経編の赤いNa⁺・黄色のCa²⁺・青いK⁺と、28のHR・SV・COの視覚言語を引き継ぎ、電気生理計算は神経・血圧モデルと混用しません。
- `assets/js/arrhythmia.js`：ページ操作と同期描画。初期は常に待機し、STARTまたはコマ送りで進みます。動きを減らす設定でも自動再生しません。PCは36：64、800px以下は1列。狭い画面のECGは内部横スクロール。
- `assets/css/arrhythmia.css`：34専用の表示。33→34と一覧・目次を更新。35は未実装のため予定の学習マップへ案内。
- AFは規則的なP波がなく、AVを通る一部の刺激に対して不規則な心室興奮を生成します。AFの時刻列は教材用の決定的な不規則パターンです。VT・VF・旋回では薬効の予測を行わず薬選択を無効化。AFで結節への作用を重ねても洞調律に自動変換しません。
- 一部AV途絶は2対1の通過例。補充調律や詳細な減衰伝導、全ての不応期特性は再現しません。ECG診断や患者の処方判断に使用できるモデルではありません。

検証：`node tests/rhythm.cjs`、`PLAYWRIGHT_PATH=（Playwrightのパス） node tests/rhythm-browser.cjs`。Chromeが必要です。

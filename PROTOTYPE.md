# COLDRAW Executive Dining Network — Web Prototype

スマートフォンで実際に触れる検証用プロトタイプ。企画書ではなく、
**「経営者がその場で秘書に転送するか」** を測るために作ってあります。

```
npm install
npm start
# → http://localhost:3000/dining/
```

`OPENAI_API_KEY` は不要です。プロトタイプは完全にクライアントサイドで動作し、
既存の `POST /ask`（OpenAI プロキシ）には一切依存していません。

スマートフォン実機で見るときは同じ LAN から `http://<PCのIP>:3000/dining/` を開いてください。

---

## 1. 検証する仮説

> 連日会食する人にとって、「飲まなくても会食の質を落とさない店」を選べることは、
> その場で秘書に転送するだけの価値があるか。

**最重要 KPI は `Share with my assistant`。** Like でも会員登録でもありません。
`You → Prototype instrumentation` に実測値が出ます（localStorage 集計）。

計測しているイベント:

| イベント | 意味 |
|---|---|
| `share_with_assistant` | **最重要。** 秘書への共有が実行された |
| `brief_opened` | 秘書が共有リンクを開いた |
| `request_booking` | 予約リクエストが押された |
| `find_search` / `ask_query` | 検索・照会の実行 |
| `view_restaurant` / `save_restaurant` / `follow_chef` | 関心の深さ |

---

## 2. 画面構成

ハッシュルーター。全画面が URL で直接開けるので、ユーザーテスト中に任意の地点から始められます。

| # | 画面 | URL |
|---|---|---|
| 1 | Executive Home | `#/` |
| 2 | Find a Dinner | `#/find` |
| 3 | Search Results | `#/results` |
| 4 | Restaurant Detail | `#/r/koan` |
| 5 | Share with Assistant | `#/share` |
| 6 | Assistant View | `#/brief/<token>` |
| 7 | Ask / Check a Restaurant | `#/ask` |
| 8 | Dietary Constraint View | `#/r/koan/dietary` |
| 9 | Concierge / DMC Mode | `#/concierge` |
| 10 | Post-Dinner → Patronage | `#/post/koan` |
| — | You（保存・フォロー・役割切替・計測） | `#/you` |

役割の切り替えは `#/you → Other views` から。経営者の画面を静かに保つため、
秘書 / Concierge モードは経営者側の導線には露出していません。

---

## 3. 情報設計の原則

### Disclosure ≠ Certification

プロトタイプ全体で守っている一線です。

- **COLDRAW verified** — Nature Pack / Nature Cocktail について確認された事実のみ。
  組成、アルコール、動物由来原料、アレルゲン、製造方法。
- **Restaurant reported** — 店舗のメニュー・厨房・代替対応に関する申告。日付付きで表示。

COLDRAW が「この店は Vegan / Halal / Allergen-free である」と認証する表現は
どの画面にも存在しません。Concierge Mode と Dietary View には、
何を述べられて何を述べられないかの明示ブロックを置いています。

### COLDRAW は Hero ではない

ユーザーの Hero は「明日のPerformanceを守りながら今夜のGuestを最高にもてなす自分」です。
COLDRAW は店舗詳細の下部に Quality Layer として一度だけ現れます。
「COLDRAW導入店を探す」導線は意図的に作っていません。

### 「飲まない」を Status に

禁酒・健康食・ノンアル専門・我慢・代替飲料・sober といった語は一切使っていません。
非飲酒は制約ではなく、8〜9杯の設計されたペアリングという **選択** として提示されます。

---

## 4. 仮データについて

`public/js/data.js` の店舗・料理人・体験は **すべて架空** です。
実在店舗について未確認の情報を書かないための方針です。エリア（銀座・丸の内・麻布台・
日本橋・京都）と価格帯のみ現実に即しています。

写真も同様の理由で使っていません。`public/js/art.js` が各店のパレットから
抽象的な静物をコード生成しています（実在しない店に他人の写真を当てないため）。

---

## 5. ファイル構成

```
public/
  index.html        アプリシェル
  styles.css        デザインシステム（Quiet / Editorial / Trusted）
  js/
    data.js         架空店舗データ、マッチング、制約アセスメント
    art.js          手続き型ビジュアル生成（SVG）
    store.js        localStorage 状態 + 計測
    app.js          ルーター + 全画面
server.js           /dining に静的マウント（既存の / と /ask はそのまま）
```

依存パッケージの追加はありません。ビルド不要。

---

## 6. 自己評価（Test 1–6）

| Test | 結果 |
|---|---|
| 1. 経営者が3秒で価値を理解できるか | **合格に近い。** 「Tomorrow matters. Dinner should still be extraordinary.」+ 8 houses / 5 districts / 4–9 glasses で、Job と範囲が同時に伝わる |
| 2. 「秘書に送ろう」という行動を起こせるか | **構造上は最大化済み。** Results / Detail / Dietary の3画面すべてで最優先CTA。ただし実行動の検証は実ユーザー待ち |
| 3. 秘書が受け取った後、検討できる情報があるか | **合格。** 条件・比較表（価格/個室/人数/ペアリング/静粛性/英語/リードタイム/最寄）・選定理由・予約導線が1画面に揃う |
| 4. Non-Alcohol が我慢でなく上質な選択に見えるか | **合格。** グラス1杯ずつの構成と対応コースを明示。禁酒・代替系の語彙は不使用 |
| 5. 店にとって掲載されたいブランドか | **概ね合格。** 掲載基準を明示し、「Nothing on this list pays to appear」と宣言。店舗側の画面は未着手 |
| 6. Patronage / Creator Network へ拡張できる構造か | **合格。** Chef を独立エンティティとして保持し、follow / dinners / patrons を計上。ただし Post-Dinner の二次レイヤーに留めている |

### 既知の限界

- 空き状況・予約は本物ではありません（リクエストはトースト表示のみ）
- 秘書への共有はデバイス内 localStorage。実機間での共有リンクは未実装
- Ask は決定的なルールベース。LLM ではないため想定外の言い回しは検索にフォールバックします
- 店舗8件のみ。データベースとしての規模検証はしていません

# UNDERCURRENT — Consumer Experience / Patronage Platform Prototype

COLDRAWから派生する Consumer事業の、事業設計・情報設計・Webプロトタイプ。

> **A network of extraordinary taste experiences.**
> 表に出る前の、味の話。

**⚠️ 登場する人物・店舗・数値・履歴は、すべて架空です。** 検証用プロトタイプのためのモックデータであり、
実在の人物・団体とは一切関係ありません。

---

## 起動

```bash
npm install
npm start
# → http://localhost:3000/
```

`.env` は任意です。`OPENAI_API_KEY` が無くてもプロトタイプは動きます
（既存の `POST /ask` だけが失敗します）。

---

## 何を検証するためのものか

「このサービスが本当に存在したら、Consumerは参加したくなるか」を、
言葉ではなく画面で問える状態にすること。

特に潰したい仮説は一つです ——
**食への熱量は非常に高いが、酒をあまり飲まない層は、飲料側の趣味・専門性・承認装置を求めているか。**

---

## 設計ドキュメント

| | |
|---|---|
| [`docs/01-strategy.md`](docs/01-strategy.md) | 事業設計。Value Proposition / Target / 最初の商品 / Recognition Design / Creator Economics / Social Design（依頼の A–F への回答） |
| [`docs/02-information-architecture.md`](docs/02-information-architecture.md) | 情報設計。状態遷移から導いたサイトマップ、画面ごとの設計意図、言語設計 |
| [`docs/03-design-language.md`](docs/03-design-language.md) | デザイン言語。色・書体・Taste Signature・禁止事項 |

### 結論だけ短く

- **課金理由は「美味しいドリンク」ではない。**「有名になる前からこの人を支えていた」という
  自分では言えないことを、履歴に言わせられること。
- **最初のターゲットは Gastro-Sober 層。** 食のヒエラルキーでは上位にいるのに、
  飲料のヒエラルキーでは常に最下層に置かれている人たち。
- **最初の商品は Discovery ではなく Patronage。** 在庫が無いほど価値が上がる方から始める。
- **Recognitionは得点ではなく記録。** 金額を計測しない。順位を出さない。最強の変数は日付。
- **Rewardは値引きではなくAccess。** 返すのは割引ではなく、作り手との距離。

---

## 画面

| Path | 画面 |
|---|---|
| `/` | Home — 先に「1年後の記録の完成形」を見せる |
| `/creators` | Discover Creators — 並び順は人気順ではなく `Now developing` 順 |
| `/creator?id=` | Creator Profile ＋ Supporter Register |
| `/pass?id=` | Creator Pass — 回数券に見せないための画面 |
| `/experiences`, `/experience?id=` | Experience 一覧・詳細 |
| `/table` | Creator's Table — 出会いを目的にしない設計 |
| `/lab` | COLDRAW Lab — 小伝馬町 / Founding Member 50名 |
| `/me` | My Record — Patronage / Taste / Access / Contributions |
| `/share?creator=` | Shareable Record |

---

## 実装

ビルド不要・依存ゼロ・外部リクエストゼロのES Modules。1枚のHTMLシェルで全画面を描画します。

```
public/
  index.html        シェル
  js/app.js         pathname によるルーティング
  js/pages.js       画面ごとの描画関数
  js/ui.js          共通chrome + コンポーネント
  js/data.js        モックデータ（すべて架空）
  js/signature.js   Taste Signature の生成（写真を使わないための視覚言語）
  css/app.css       デザインシステム
```

写真を一切使っていません。Creatorの視覚的な同一性は、5軸のTaste Profileから
決定論的に生成される **Taste Signature** が担っています。
これにより、架空の人物の偽の顔写真を作らずに済み、ストックフォトの既視感も避けられます。

### 意図的にやっていないこと

プログレスバー / ポイント / スタンプ / バッジ / レベル / 星評価 / 順位番号 /
金額ランキング / 「あと◯回で昇格」/ Passの「残り◯回」表示 / カウントダウン / 達成モーダル。

理由は [`docs/03-design-language.md`](docs/03-design-language.md) §7 と
[`docs/01-strategy.md`](docs/01-strategy.md) D にあります。

---

## 次のフェーズ

- P1: 予約・決済・Creator管理画面
- P2: Taste Passport（都市を巡る）/ 導入店Discovery — **供給が増えてから**

在庫が無い状態でDiscoveryを作ると、空のディレクトリができるだけです。

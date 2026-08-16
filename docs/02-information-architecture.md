# UNDERCURRENT — Information Architecture

---

## 1. 設計の出発点

機能一覧から始めない。**Consumerの状態遷移**から始める。

```
Guest → Participant → Co-creator → Ambassador
```

この4状態それぞれで、ユーザーが抱えている問いが違う。
画面はその問いに答えるために存在する。

| 状態 | ユーザーの問い | それに答える画面 |
|---|---|---|
| **Guest**（未参加） | これは何なのか。なぜ私が参加するのか | Home |
| | 誰がいるのか。私が好きになれる人はいるか | Discover Creators / Creator Profile |
| **Participant**（体験した） | 次に何ができるのか | Experience Detail / Creator's Table |
| | この人をもっと支えるには | Creator Pass |
| **Co-creator**（作り手側に入った） | 私は何をしてきたか | My Profile / Patron Status |
| | 私はこの人にとって何者か | Supporter Register |
| | まだ何ができるのか | COLDRAW Lab |
| **Ambassador**（人を連れてくる） | これをどう人に伝えるか | Shareable Record |

---

## 2. サイトマップ

```
/                          Home
│
├─ /creators               Discover Creators        一覧・Taste絞り込み
│   └─ /creator?id=        Creator Profile          作品・思想・Experiences
│       ├─ #experiences    Upcoming Experiences
│       ├─ #register       Supporter Register       ← Leaderboard の実装形
│       └─ /pass?id=       Creator Pass             支援の契約
│
├─ /experience?id=         Experience Detail        Dinner / Tasting / Prototype
│
├─ /table                  Creator's Table          少人数体験の思想と一覧
│
├─ /lab                    COLDRAW Lab              小伝馬町・Founding Member
│
└─ /me                     My Profile               Taste / Experiences / Contributions
    ├─ #patronage          Patron Status            誰をいつから、どのくらい
    └─ /share?...          Shareable Record         SNS共有用の組版
```

**階層は2層まで。** 3層目に入れたくなったら、それは別の画面ではなくセクションである。

---

## 3. 画面ごとの設計意図

### 3.1 Home

**唯一の仕事: 「これは何のサービスか」と「なぜ参加したいか」を、スクロール1画面目で成立させる。**

順序が最重要。多くのサービスがここを間違える。

| 順 | セクション | 内容 | なぜこの位置か |
|---|---|---|---|
| 1 | Hero | `A network of extraordinary taste experiences.` + 一文の定義 | 何のサービスかを3秒で |
| 2 | **The Record** | Patron Profileの完成形を**先に見せる** | ★ 最重要。「43 Experiences / Supporting since 2026 / Founding Supporter No.007」という**完成後の姿**を先に見せることでしか、この事業の価値は伝わらない。機能説明では絶対に伝わらない |
| 3 | The Loop | Support → Experience → Contribution → Recognition → Access → Co-creation | 循環構造を1枚で |
| 4 | Creators | 3〜4名を大きく | 具体的な人がいることの証明 |
| 5 | For you | 「食への熱量は高いが、酒は飲まない」への直接の呼びかけ | ターゲットに刺す。ここで初めてノンアルに言及する |
| 6 | Ways in | Lab / Pass / Table の3つの入口 | 最後に商品。最初ではない |

**Heroに機械（Brewer）を出さない。** 出すのは人と記録。

### 3.2 Discover Creators

- グリッドではなく**リスト寄りのカード**。1人あたりの情報量を厚くする。
- 各カードに出す: 名前 / 肩書 / 拠点 / Taste Signature / Supporter数 / **Supporting since の最古値**
- 絞り込みは「ジャンル」ではなく **Taste の軸**（苦味、酸、香り、余韻...）と **Discipline**（Chef / Bartender / Tea Producer / Sommelier）
- 並び順のデフォルトは**新着でも人気でもなく `Now developing`**（＝今まさに何か作っている人が上）
  - これが「まだ出来上がっていないものの中に入れる」という初期フェーズの価値（§14）をIAで表現する唯一の場所

### 3.3 Creator Profile

このサービスで**最も重要な画面**。ここでPassが売れるかが決まる。

構成順:
1. **名前と一文の思想**（料理のジャンル説明ではなく、何を信じているか）
2. Taste Signature（生成図形）+ 5軸
3. **Now developing** — 今開発中のもの。未完成であることを堂々と出す
4. Works — 代表作 3〜5点
5. Upcoming Experiences
6. **Supporter Register** — 支援者の台帳（下記 3.7）
7. Creator Pass への導線

**出さないもの:** 星の数、食べログ的スコア、価格帯アイコン、レビュー。

### 3.4 Experience Detail

種別を明示: `Dinner` / `Tasting` / `Prototype Session` / `Creator's Table` / `Lab Session`

- 日時・場所・定員・価格
- **「この会で何が起きるか」を散文で書く。** 箇条書きの設備説明にしない
- 同席者は**公開しない**（F-5）。代わりに「どういう人が集まる会か」を書く
- Prototype Session には `あなたの評価が商品化の判断に使われます` を明記

### 3.5 Creator Pass

**割引券に見せないための画面設計。**

| 出す | 出さない |
|---|---|
| 支援の意味（Creatorが何に使うか） | 1回あたり単価 |
| 含まれるAccess（新作の先行、開発の共有、Feedback Session） | 「◯円お得」 |
| Supporter Register への記載開始 | 「残り◯回」の大きな表示 |
| 発行上限と現在の発行数 | 期限のカウントダウン煽り |
| Creator本人からの一文 | 比較表 |

価格は**大きく出さない**。ページ下部に事務的に置く。

### 3.6 My Profile

タブではなく1枚のスクロール。上から:

1. **Register Entry**（自分の記録の要約。印刷物のような組版）
2. Taste Profile（5軸＋言語化されたTasteの特徴）
3. Creators supported（支援中のCreator一覧。since順）
4. Contributions（何をしてきたか。時系列の台帳）
5. Access available（今の状態で開いているAccess）
6. Shareable Record への導線

**進捗バー・次のレベルまでの残り・獲得ポイントは一切置かない。**

### 3.7 Supporter Register（Leaderboard の実装形）

「Leaderboard」という言葉をUIで使わない。使うのは **Register**。

- 並び順: 貢献度（D-3の重み付き）だが、**順位番号を振らない**
- 各行に出す: 名前 / since / Experiences / Introduced / 貢献の構成
- **金額は出さない**
- 上位は「Top Patrons」として**複数名を並列**に出す。1位を作らない
- `Founding Supporter No.` を持つ人は番号を表示。これは先着固定で、後から入れない
- 自分の行はハイライトするが、順位は見せない

### 3.8 COLDRAW Lab

小伝馬町の拠点。**「未完成の中に入れる」ことの商品化**。

- 場所と、そこで何が起きているか
- Founding Member 50名の枠と、現在の発行数
- 直近のSession（何を試作し、どちらが選ばれたか）の**実際の記録**
- 過去のSessionから商品化されたものの追跡（＝参加した人の貢献の証明）

### 3.9 Creator's Table

- 思想の説明が先（F-1〜F-3）。予約導線は後
- 「席順はこちらで決めます」を明記する。これは制約ではなく価値である
- テーブルに置かれる問いの実例を見せる

### 3.10 Shareable Record

- 縦長カード（1080×1350 想定）と横型（1200×630）
- 情報: Creator名 / since / Experiences / Introduced / Founding番号
- **金額・順位・スコアは出さない**
- 「シェアする」ボタンを目立たせない。作った本人が保存して使う設計

---

## 4. 言語設計（Naming Rules）

言葉がブランドを決める。以下を厳守する。

| 使う | 使わない | 理由 |
|---|---|---|
| Support / Supporter | 推す / 推し活 | アイドル的文脈を避ける（§19） |
| Patron / Patronage | 課金者 / VIP会員 | 支援の文化的伝統に接続する |
| Register | Leaderboard / ランキング | 競争ではなく記録 |
| Experience | イベント / 会 | 単発性を排す |
| Creator / Chef / Producer | インフルエンサー / 有名店 | 作り手であることを中心に |
| Record | 実績 / スコア | 評価ではなく事実 |
| Access | 特典 / 優待 | 値引きの連想を断つ |
| Now developing | 準備中 / Coming soon | 未完成を隠さない |
| Introduced | 招待コード / 友達紹介 | 紹介制度に見せない |

日本語UIでも **Support / Patron / Register / Access** は英語のまま使う。
訳すと途端に安くなる語がある。

---

## 5. ナビゲーション

グローバルナビは**4項目まで**。

```
Creators    Experiences    Lab    [自分の名前]
```

- `Experiences` は Table / Dinner / Tasting / Prototype を束ねる
- 商品（Pass）はナビに置かない。**Creatorの中からしか買えない**
  - これは意図的な制約。Passは「サービスの商品」ではなく「その人への支援」だから
- ログイン後は右端が自分の名前になる（アイコンではなく名前。人格を出す）

---

## 6. 実装フェーズ

| Phase | 画面 | 目的 |
|---|---|---|
| **P0（本プロトタイプ）** | Home / Creators / Creator / Experience / Pass / Me / Register / Lab / Table / Share | 概念が伝わるかの検証 |
| P1 | 予約・決済・Creator管理画面 | 実運用 |
| P2 | Taste Passport（都市を巡る）/ 導入店Discovery | 供給が増えてから |

**P2をP0でやらない。** 在庫がない状態でDiscoveryを作ると、空のディレクトリになる。

---

*本ドキュメント内の Creator名・数値・ユーザー履歴は、すべてプロトタイプ検証のための架空のものです。*

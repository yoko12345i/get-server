/* ============================================================
   UNDERCURRENT — Prototype data
   ------------------------------------------------------------
   ⚠️ この中の人物・店舗・数値・履歴は すべて架空 です。
   実在の人物・団体とは一切関係ありません。
   検証用プロトタイプのためのモックデータです。
   ============================================================ */

export const BRAND = {
  name: 'UNDERCURRENT',
  tagline: 'A network of extraordinary taste experiences.',
  taglineJa: '表に出る前の、味の話。',
  operator: 'Operated by sPods  ·  Brewing technology by COLDRAW',
  lab: '東京・小伝馬町'
};

export const AXES = [
  { key: 'aroma', ja: '香り', en: 'Aroma' },
  { key: 'acidity', ja: '酸', en: 'Acidity' },
  { key: 'bitterness', ja: '苦味', en: 'Bitterness' },
  { key: 'sweetness', ja: '甘み', en: 'Sweetness' },
  { key: 'finish', ja: '余韻', en: 'Finish' }
];

export const KINDS = {
  dinner: { en: 'Dinner', ja: 'Dinner', cls: '' },
  tasting: { en: 'Tasting', ja: 'Tasting', cls: '' },
  prototype: { en: 'Prototype Session', ja: 'Prototype Session', cls: 'kind--proto' },
  table: { en: "Creator's Table", ja: "Creator's Table", cls: 'kind--table' },
  lab: { en: 'Lab Session', ja: 'Lab Session', cls: 'kind--lab' }
};

/* ---------------------------------------------------------- */

export const creators = [
  {
    id: 'mori',
    name: '森 果穂',
    latin: 'Kaho Mori',
    discipline: 'Tea Producer',
    base: '静岡・本山',
    hue: 128,
    belief: '茶は嗜好品である前に、その年の天気の記録である。',
    bio: [
      '静岡・本山の山間で、祖父の代から残る在来種の茶園を継いだ。品種改良された「やぶきた」に植え替えず、実生の在来種——一本ずつ性質の違う木——を残し続けている。',
      '「同じ味を毎年作る」ことを目的にしていない。冷夏の年には冷夏の茶を、雨の多い年には雨の茶を出す。ロットごとに味が違うことを欠点として説明しない。',
      '2025年からCOLDRAWのBrewerを使い、湯で抽出すると出てこない領域——収穫直後の生葉に近い青い香りと、渋みの手前で止まる甘み——を取り出す試みを続けている。'
    ],
    taste: { aroma: 88, acidity: 42, bitterness: 61, sweetness: 55, finish: 92 },
    developing: '在来種7番木の単木抽出。渋みが立つ前に止める温度帯を探している。',
    works: [
      { title: '本山 在来 / 一番茶 低温抽出', year: '2025', note: '摘採から18時間以内の生葉を4℃で抽出。青海苔のような磯の香り。' },
      { title: '晩霜 2026', year: '2026', note: '4月の遅霜で傷んだ葉だけを集めたロット。傷が生む甘みを主題にした。' },
      { title: '秋冬番茶 × 焙じ差し', year: '2025', note: '焙煎した茎を後から差す二段構成。余韻だけが焙じ茶になる。' },
      { title: '7番木 単木 / prototype', year: '2026', note: '開発中。園内の一本の木だけで作る。年間で30本しか取れない。' }
    ],
    supporters: 214,
    sinceEarliest: '2026.02',
    foundingCap: 20,
    foundingIssued: 20,
    pass: {
      price: 96000,
      cap: 240,
      issued: 214,
      creatorNote:
        'お茶は、飲む人が育てる部分が大きいと思っています。「今年のは去年と違いますね」と言ってくれる人が何人いるかで、次に何を作れるかが決まります。売り先ではなく、証人が欲しいです。',
      includes: [
        '年10回、私のExperienceへの優先予約',
        '摘採期（4月・9月）の茶園への訪問権 年1回',
        '新しいロットを、出荷前に最初に飲む',
        '月に一度、園の状態と試作の記録が届く',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '倉田 詩織', latin: 'Shiori Kurata', no: 7, since: '2026.03', exp: 43, intro: 7, proto: 4, me: true },
      { name: '長谷川 亮', latin: 'Ryo Hasegawa', no: 2, since: '2026.02', exp: 51, intro: 9, proto: 6 },
      { name: '大西 由美', latin: 'Yumi Onishi', no: 1, since: '2026.02', exp: 47, intro: 12, proto: 5 },
      { name: '三宅 遼太', latin: 'Ryota Miyake', no: 11, since: '2026.04', exp: 38, intro: 6, proto: 4 },
      { name: '白石 かおる', latin: 'Kaoru Shiraishi', no: 4, since: '2026.02', exp: 36, intro: 5, proto: 3 },
      { name: '藤堂 蒼', latin: 'Ao Todo', no: 19, since: '2026.06', exp: 29, intro: 8, proto: 2 },
      { name: '小暮 千秋', latin: 'Chiaki Kogure', no: null, since: '2026.09', exp: 24, intro: 4, proto: 2 },
      { name: '安曇 徹', latin: 'Toru Azumi', no: null, since: '2026.11', exp: 19, intro: 3, proto: 1 },
      { name: '仁科 咲', latin: 'Saki Nishina', no: null, since: '2027.01', exp: 14, intro: 5, proto: 1 },
      { name: '堀井 悠', latin: 'Yu Horii', no: null, since: '2027.02', exp: 11, intro: 2, proto: 0 }
    ]
  },

  {
    id: 'arakawa',
    name: '荒川 実花',
    latin: 'Mika Arakawa',
    discipline: 'Beverage Creator',
    base: '東京・麻布台',
    hue: 196,
    belief: 'アルコールが抜けた分を、甘さで埋めるのは敗北だと思っている。',
    bio: [
      '10年間バーテンダーとして立ったのち、ノンアルコールの飲料設計に専念した。きっかけは「飲めない客に出すものが、いつも子供向けの飲み物だった」という自分への不満。',
      '「ノンアルコールカクテル」という言葉を使わない。アルコールの代用ではなく、独立した飲み物として設計する。苦味・渋み・塩・温度・粘度——酒がやっていた仕事を、別々の素材に分解して再構成する。',
      'COLDRAWのBrewerは、加熱すると壊れる香気成分を残せるため、素材そのものを主役にできる。「果汁を煮ない」ことが、この仕事の前提を変えた。'
    ],
    taste: { aroma: 74, acidity: 86, bitterness: 78, sweetness: 24, finish: 68 },
    developing: '塩と昆布出汁だけで「重さ」を出す試み。糖度を上げずに満足感を作れるか。',
    works: [
      { title: 'Bitter Melon / Kabosu', year: '2025', note: 'ゴーヤの青さとカボスの酸。砂糖ゼロ。3年目の定番。' },
      { title: '#12 Salt & Kombu', year: '2026', note: '開発中。甘みを一切使わずに、飲み終わりの満足感を作れるか。' },
      { title: 'Hojicha / Fig leaf', year: '2025', note: 'いちじくの葉のクマリン香。ミルクを使わずに乳のニュアンスを出す。' },
      { title: 'Green Tomato', year: '2024', note: '未熟トマトの青さと塩。食中に置くことを前提にした一杯。' }
    ],
    supporters: 168,
    sinceEarliest: '2026.03',
    foundingCap: 20,
    foundingIssued: 20,
    pass: {
      price: 120000,
      cap: 200,
      issued: 168,
      creatorNote:
        '試作の8割は失敗します。その失敗を見せられる相手がいると、開発の速度が変わります。完成したものだけを買ってくれる人より、途中を見てくれる人のほうが、私には価値があります。',
      includes: [
        '年10回、私のExperienceへの優先予約',
        '毎月のPrototype Tastingへの参加権（月1回、6名まで）',
        '商品化投票への参加',
        '試作の設計メモ（配合と失敗の記録）の共有',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '大西 由美', latin: 'Yumi Onishi', no: 3, since: '2026.03', exp: 44, intro: 11, proto: 14 },
      { name: '倉田 詩織', latin: 'Shiori Kurata', no: 9, since: '2026.05', exp: 31, intro: 5, proto: 9, me: true },
      { name: '瀬川 直人', latin: 'Naoto Segawa', no: 1, since: '2026.03', exp: 40, intro: 4, proto: 12 },
      { name: '古賀 美咲', latin: 'Misaki Koga', no: 6, since: '2026.04', exp: 33, intro: 7, proto: 8 },
      { name: '長谷川 亮', latin: 'Ryo Hasegawa', no: 14, since: '2026.07', exp: 27, intro: 6, proto: 6 },
      { name: '宮下 康平', latin: 'Kohei Miyashita', no: null, since: '2026.10', exp: 18, intro: 3, proto: 4 },
      { name: '芦田 環', latin: 'Tamaki Ashida', no: null, since: '2027.01', exp: 12, intro: 4, proto: 2 }
    ]
  },

  {
    id: 'tsuji',
    name: '辻 陽介',
    latin: 'Yosuke Tsuji',
    discipline: 'Chef',
    base: '東京・幡ヶ谷',
    hue: 84,
    belief: '山菜のえぐみは、抜くものではなく、置き場所を決めるものだ。',
    bio: [
      '幡ヶ谷のカウンター8席。年間の半分は東北・北陸の山に入り、自分で採った山菜と、地元の発酵食品だけで献立を組む。',
      '「えぐみ」「苦み」「渋み」を料理の中心に置く。抜く・和らげるのではなく、どこに置けば快感になるかを設計する。そのため飲み物との組み合わせが献立と同時に決まる。',
      'ワインのペアリングをやめ、2025年からドリンクを全て自家抽出に切り替えた。「酒を飲まない客に、二番目に良いものを出すのをやめたかった」。'
    ],
    taste: { aroma: 66, acidity: 48, bitterness: 94, sweetness: 30, finish: 80 },
    developing: '山ウドの皮だけで作る抽出液。捨てていた部分に一番強い香りがある。',
    works: [
      { title: '山ウド / 木の芽 / 発酵大豆', year: '2026', note: '春の定番。えぐみを最初の一皿に置く。' },
      { title: 'こごみと甘酒の椀', year: '2025', note: '甘酒を薄めず、苦味に対して真正面から置く。' },
      { title: '熊笹と山椒の抽出', year: '2026', note: '開発中。山内匠との共同開発。' },
      { title: '塩蔵ミズの茎 / 冷やし', year: '2025', note: '一年寝かせた塩蔵。塩を抜きすぎない。' }
    ],
    supporters: 302,
    sinceEarliest: '2026.02',
    foundingCap: 20,
    foundingIssued: 20,
    pass: {
      price: 150000,
      cap: 320,
      issued: 302,
      creatorNote:
        'うちは8席しかないので、来られる人の数は変わりません。だから「たくさん来てくれる人」より「山に一緒に入ってくれる人」を探しています。採るところから見た人は、皿の見え方が変わります。',
      includes: [
        '年10回、カウンターへの優先予約',
        '春・秋の採取同行 年1回（東北・北陸）',
        '献立確定前の試食会への参加',
        '新しい抽出の最初の試飲',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '長谷川 亮', latin: 'Ryo Hasegawa', no: 1, since: '2026.02', exp: 62, intro: 14, proto: 8 },
      { name: '三宅 遼太', latin: 'Ryota Miyake', no: 5, since: '2026.02', exp: 55, intro: 9, proto: 7 },
      { name: '倉田 詩織', latin: 'Shiori Kurata', no: 23, since: '2026.08', exp: 22, intro: 6, proto: 3, me: true },
      { name: '大西 由美', latin: 'Yumi Onishi', no: 8, since: '2026.03', exp: 41, intro: 8, proto: 5 },
      { name: '白石 かおる', latin: 'Kaoru Shiraishi', no: 12, since: '2026.04', exp: 34, intro: 4, proto: 4 },
      { name: '鵜飼 慎一', latin: 'Shinichi Ukai', no: null, since: '2026.12', exp: 16, intro: 2, proto: 1 },
      { name: '土井 麻里', latin: 'Mari Doi', no: null, since: '2027.02', exp: 9, intro: 3, proto: 0 }
    ]
  },

  {
    id: 'nakamura',
    name: '中村 澪',
    latin: 'Rei Nakamura',
    discipline: 'Beverage Director',
    base: '瀬戸内・尾道',
    hue: 40,
    belief: '柑橘は果汁より、皮と、その木が立っていた斜面の向きで決まる。',
    bio: [
      'ソムリエとして東京で12年働いたのち、瀬戸内に移り、島の柑橘農家を一軒ずつ回っている。',
      '同じ品種でも、南向きの斜面と北向きの斜面で香りが違うこと、収穫後3日で消える香りがあることを前提に、産地ではなく「区画」で飲料を作る。',
      'ワインの語彙を、酒を飲まない人にも使える形に翻訳することに関心がある。「テロワール」という概念は、アルコールの有無とは本来無関係である。'
    ],
    taste: { aroma: 91, acidity: 88, bitterness: 52, sweetness: 44, finish: 70 },
    developing: '同一品種・4区画の飲み比べ。斜面の向きだけが違う4本を並べる。',
    works: [
      { title: '因島 レモン / north-facing', year: '2026', note: '北斜面の一区画のみ。酸が硬く、香りが遅れて来る。' },
      { title: '橙 / 果皮のみ', year: '2025', note: '果汁を使わず、皮だけを低温で。苦味が主役。' },
      { title: '八朔 3days', year: '2026', note: '収穫後72時間以内に抽出。以降は別の飲み物になる。' },
      { title: '区画比較 4本組 / prototype', year: '2026', note: '開発中。同一品種・同一日・斜面違い。' }
    ],
    supporters: 97,
    sinceEarliest: '2026.06',
    foundingCap: 20,
    foundingIssued: 14,
    pass: {
      price: 84000,
      cap: 150,
      issued: 97,
      creatorNote:
        'ワインでいう「畑違いを飲み比べる」ことを、柑橘でやりたい。そのためには、違いが分かる人が一定数いてくれないと成立しません。人数は要りませんが、密度が要ります。',
      includes: [
        '年10回、Experienceへの優先予約',
        '収穫期（12月〜2月）の島への同行 年1回',
        '区画違いの飲み比べセットの先行提供',
        '各区画の記録（斜面・樹齢・収穫日）の共有',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '大西 由美', latin: 'Yumi Onishi', no: 2, since: '2026.06', exp: 28, intro: 9, proto: 5 },
      { name: '古賀 美咲', latin: 'Misaki Koga', no: 1, since: '2026.06', exp: 30, intro: 5, proto: 6 },
      { name: '藤堂 蒼', latin: 'Ao Todo', no: 4, since: '2026.07', exp: 24, intro: 7, proto: 4 },
      { name: '倉田 詩織', latin: 'Shiori Kurata', no: 12, since: '2027.01', exp: 8, intro: 3, proto: 1, me: true },
      { name: '仁科 咲', latin: 'Saki Nishina', no: 9, since: '2026.11', exp: 14, intro: 2, proto: 2 },
      { name: '安曇 徹', latin: 'Toru Azumi', no: null, since: '2027.02', exp: 6, intro: 1, proto: 0 }
    ]
  },

  {
    id: 'girard',
    name: 'Élise Girard',
    latin: 'Elise Girard',
    discipline: 'Pâtissière',
    base: '京都・西陣',
    hue: 22,
    belief: 'デザートに合う飲み物がない、のではなく、探されていないだけだ。',
    bio: [
      'リヨンで修業したのち京都に移り、8年。町家の一階で、コースの最後だけを担当する店を営む。',
      '砂糖を減らすことに関心はない。かわりに、甘みに対してぶつける苦味・渋み・酸を、飲み物側で作ることに関心がある。',
      '「食後にコーヒーか紅茶か」しか選択肢がない状況を、職業上の怠慢だと考えている。'
    ],
    taste: { aroma: 70, acidity: 58, bitterness: 82, sweetness: 66, finish: 86 },
    developing: 'カカオの外皮（カカオハスク）とほうじ茶の共抽出。捨てられる部分同士を合わせる。',
    works: [
      { title: 'Sarrasin / 蕎麦の実', year: '2025', note: '焦がした蕎麦の実。香ばしさだけで甘みを支える。' },
      { title: '山椒とホワイトチョコレート', year: '2026', note: '山内匠との共同。痺れを余韻に使う。' },
      { title: 'Husk / Hojicha', year: '2026', note: '開発中。' },
      { title: '無花果の葉のグラス', year: '2025', note: '葉だけを低温抽出。実は使わない。' }
    ],
    supporters: 58,
    sinceEarliest: '2026.10',
    foundingCap: 20,
    foundingIssued: 9,
    pass: {
      price: 72000,
      cap: 120,
      issued: 58,
      creatorNote:
        "I don't need more customers. I need people who will tell me, honestly, when something is too sweet. In Japan, people are too polite for that. Supporters who have paid to be here are, strangely, more honest.",
      includes: [
        '年10回、Experienceへの優先予約',
        '新作の試食（完成前）への参加',
        '「甘すぎるか」の判定への参加',
        '試作の記録の共有',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '古賀 美咲', latin: 'Misaki Koga', no: 1, since: '2026.10', exp: 16, intro: 4, proto: 5 },
      { name: '芦田 環', latin: 'Tamaki Ashida', no: 2, since: '2026.10', exp: 14, intro: 3, proto: 4 },
      { name: '小暮 千秋', latin: 'Chiaki Kogure', no: 5, since: '2026.12', exp: 10, intro: 2, proto: 2 },
      { name: '堀井 悠', latin: 'Yu Horii', no: 7, since: '2027.01', exp: 7, intro: 1, proto: 1 }
    ]
  },

  {
    id: 'yamauchi',
    name: '山内 匠',
    latin: 'Takumi Yamauchi',
    discipline: 'Chef',
    base: '大阪・空堀',
    hue: 348,
    belief: '痺れは味覚ではない。だから設計できる余地が、まだ大量に残っている。',
    bio: [
      '大阪・空堀の12席。中国四川と日本の山椒を、産地・収穫時期・部位で分けて使う。',
      '「辛い」と「痺れる」を混同しないことから始める。痺れは触覚に近く、持続時間が長い。だから料理の順番そのものを設計し直せる。',
      '飲み物で痺れを「終わらせる」のではなく「引き継ぐ」ことに取り組んでいる。COLDRAWの抽出は、山椒の揮発成分を熱で飛ばさずに取り出せる。'
    ],
    taste: { aroma: 80, acidity: 40, bitterness: 74, sweetness: 34, finish: 96 },
    developing: '青山椒の収穫3日違いを並べる。痺れの立ち上がりの速度が変わる。',
    works: [
      { title: '朝倉山椒 / 収穫3日違い', year: '2026', note: '開発中。' },
      { title: '痺れの引き継ぎ / 冷製', year: '2025', note: '皿の痺れを、次のグラスが受け取る構成。' },
      { title: '熊笹と山椒の抽出', year: '2026', note: '辻陽介との共同開発。' },
      { title: '花椒 / 乳', year: '2024', note: '乳脂肪で痺れの角を丸める。丸めすぎない量を探した。' }
    ],
    supporters: 143,
    sinceEarliest: '2026.05',
    foundingCap: 20,
    foundingIssued: 20,
    pass: {
      price: 108000,
      cap: 180,
      issued: 143,
      creatorNote:
        '痺れは、慣れます。だから同じ人に何度も来てもらわないと、正しい評価が取れません。初見の客は全員「強い」と言う。10回目の人の「今日は弱い」が、いちばん価値があります。',
      includes: [
        '年10回、カウンターへの優先予約',
        '産地違い・収穫日違いの比較試食への参加',
        '新しい抽出の最初の試飲',
        '痺れの強度評価への参加（回数を重ねた人のみ）',
        'Supporter Register への記載開始',
        '年1回、直接のFeedback Session'
      ]
    },
    register: [
      { name: '三宅 遼太', latin: 'Ryota Miyake', no: 1, since: '2026.05', exp: 39, intro: 8, proto: 9 },
      { name: '瀬川 直人', latin: 'Naoto Segawa', no: 3, since: '2026.05', exp: 35, intro: 5, proto: 7 },
      { name: '宮下 康平', latin: 'Kohei Miyashita', no: 6, since: '2026.06', exp: 30, intro: 6, proto: 6 },
      { name: '鵜飼 慎一', latin: 'Shinichi Ukai', no: 10, since: '2026.08', exp: 22, intro: 3, proto: 4 },
      { name: '土井 麻里', latin: 'Mari Doi', no: null, since: '2026.11', exp: 15, intro: 4, proto: 2 }
    ]
  }
];

/* ---------------------------------------------------------- */

export const experiences = [
  {
    id: 'x-mori-table-04',
    creatorId: 'mori',
    kind: 'table',
    title: '晩霜のロットを、8人で',
    date: '2027.04.18',
    time: '18:30 – 21:00',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 8,
    taken: 6,
    price: 24000,
    prose: [
      '4月の遅霜で傷んだ葉だけを集めたロットを、森果穂本人と8人で飲みます。傷んだ葉は本来なら出荷しません。それを商品にするべきかどうか、この日に決めます。',
      '席順はこちらで組みます。同じ人を支援していて、入口が違う人を隣にします。'
    ],
    prompt: '傷んだ葉から生まれた甘みを、あなたなら「欠点」と呼ぶか「特徴」と呼ぶか。理由を一つ。'
  },
  {
    id: 'x-mori-proto-11',
    creatorId: 'mori',
    kind: 'prototype',
    title: '7番木、単木抽出の温度帯を決める',
    date: '2027.03.29',
    time: '15:00 – 17:00',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 6,
    taken: 5,
    price: 0,
    passOnly: true,
    prose: [
      '園内の一本の木だけで作る茶を、4つの温度帯で抽出して並べます。年間30本しか取れないため、この日に決めた温度が、そのまま今年の商品になります。',
      'あなたの評価は、商品化の判断に直接使われます。'
    ],
    prompt: '4番と2番、どちらを今年の出荷にすべきか。'
  },
  {
    id: 'x-mori-visit',
    creatorId: 'mori',
    kind: 'tasting',
    title: '摘採期の茶園を歩く / 本山',
    date: '2027.04.26',
    time: '09:00 – 15:00',
    place: '静岡・本山',
    seats: 10,
    taken: 4,
    price: 32000,
    prose: [
      '一番茶の摘採期に、園を歩きます。木ごとに味が違うことを、飲む前に見ます。摘んだ葉をその場で抽出します。'
    ]
  },
  {
    id: 'x-arakawa-proto-12',
    creatorId: 'arakawa',
    kind: 'prototype',
    title: '#12 Salt & Kombu — 甘みなしで満足感は作れるか',
    date: '2027.03.22',
    time: '19:00 – 21:00',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 6,
    taken: 6,
    price: 0,
    passOnly: true,
    prose: [
      '糖度を上げずに「飲み終わった」という感覚を作れるか。塩分・出汁・粘度の組み合わせを変えた5案を並べます。',
      '荒川実花は、失敗した試作も含めて全部出します。配合メモも共有されます。'
    ],
    prompt: '5案のうち、どれが「もう一杯要らない」と思わせたか。'
  },
  {
    id: 'x-arakawa-table-09',
    creatorId: 'arakawa',
    kind: 'table',
    title: '酒を飲まない人の食卓を、10人で考える',
    date: '2027.04.11',
    time: '18:00 – 21:00',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 10,
    taken: 7,
    price: 26000,
    prose: [
      '参加者は全員、食への支出は高いがアルコールをほとんど飲まない人です。これは「ノンアルの会」ではありません。飲まない前提で食事を設計するとどうなるか、を実際に食べながら考える会です。'
    ],
    prompt: '店で「お酒は？」と聞かれたとき、あなたは何と答えているか。'
  },
  {
    id: 'x-tsuji-dinner-03',
    creatorId: 'tsuji',
    kind: 'dinner',
    title: '春の山菜、えぐみを最初に置く献立',
    date: '2027.04.05',
    time: '18:00 / 20:30',
    place: '幡ヶ谷 / カウンター8席',
    seats: 8,
    taken: 8,
    price: 38000,
    prose: [
      'その日の朝に山から届いた山菜だけで組みます。献立は当日まで決まりません。ドリンクは全て自家抽出で、料理と同時に設計されています。'
    ]
  },
  {
    id: 'x-tsuji-forage',
    creatorId: 'tsuji',
    kind: 'tasting',
    title: '採取同行 / 東北',
    date: '2027.05.16',
    time: '06:00 – 18:00',
    place: '山形県内（詳細は参加者に）',
    seats: 6,
    taken: 3,
    price: 45000,
    prose: [
      '辻陽介と一緒に山に入ります。採る、選ぶ、捨てる、を見ます。その日採ったものを夜に食べます。',
      '歩きます。装備の案内が事前に届きます。'
    ]
  },
  {
    id: 'x-nakamura-table-02',
    creatorId: 'nakamura',
    kind: 'table',
    title: '同じレモン、4つの斜面',
    date: '2027.04.20',
    time: '19:00 – 21:30',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 8,
    taken: 5,
    price: 22000,
    prose: [
      '因島の同一品種・同一収穫日・斜面の向きだけが違う4本を、ブラインドで並べます。当てる会ではありません。違いを言語化する会です。'
    ],
    prompt: '4本のうち、どれを「北向き」だと思ったか。なぜそう思ったか。'
  },
  {
    id: 'x-girard-proto-01',
    creatorId: 'girard',
    kind: 'prototype',
    title: 'Husk / Hojicha — 甘すぎるかを判定する',
    date: '2027.04.02',
    time: '15:00 – 17:00',
    place: '京都・西陣',
    seats: 6,
    taken: 2,
    price: 0,
    passOnly: true,
    prose: [
      'カカオの外皮とほうじ茶の共抽出。3段階の甘さで作ります。Élise が求めているのは感想ではなく判定です。'
    ],
    prompt: '3案のうち、どれが「甘すぎる」か。遠慮なく。'
  },
  {
    id: 'x-yamauchi-dinner-07',
    creatorId: 'yamauchi',
    kind: 'dinner',
    title: '青山椒、収穫3日違いを並べる',
    date: '2027.06.14',
    time: '18:30',
    place: '大阪・空堀 / 12席',
    seats: 12,
    taken: 9,
    price: 34000,
    prose: [
      '同じ木の、収穫日が3日違う青山椒を、同じ皿で並べます。痺れの立ち上がりの速度が変わることを、順番に体験します。'
    ]
  },
  {
    id: 'x-lab-session-24',
    creatorId: null,
    kind: 'lab',
    title: 'Lab Session #24 — 辻 陽介 × 山内 匠',
    date: '2027.04.09',
    time: '19:00 – 22:00',
    place: 'UNDERCURRENT Lab / 東京・小伝馬町',
    seats: 12,
    taken: 11,
    price: 0,
    labOnly: true,
    prose: [
      '熊笹と山椒の共同抽出。2人のChefが、それぞれの解釈で3案ずつ持ち寄ります。',
      'Founding Member 限定。投票結果はそのまま商品化の判断に使われます。'
    ],
    prompt: '6案のうち、商品化すべき2案を選ぶ。'
  }
];

/* ---------------------------------------------------------- */

export const labSessions = [
  {
    n: 26,
    date: '2027.04.09',
    title: '辻 陽介 × 山内 匠 — 熊笹と山椒',
    status: 'upcoming',
    note: '共同抽出6案。Founding Member 12名。'
  },
  {
    n: 25,
    date: '2027.02.19',
    title: '荒川 実花 — 甘みを使わない5案',
    status: 'done',
    outcome: '3番（塩・昆布・柚子皮）が商品化決定。2027年秋のSKUへ。',
    votes: '参加11名 / 3番 6票, 5番 4票, 1番 1票'
  },
  {
    n: 24,
    date: '2027.01.15',
    title: '森 果穂 — 晩霜ロットを出荷すべきか',
    status: 'done',
    outcome: '出荷決定。「晩霜 2026」として限定140本。参加者に最初に案内。',
    votes: '参加12名 / 出荷する 9票, しない 3票'
  },
  {
    n: 23,
    date: '2026.11.27',
    title: 'Élise Girard — カカオハスクの使い道',
    status: 'done',
    outcome: '保留。ほうじ茶との共抽出へ方向転換（#26で再提出予定）。',
    votes: '参加10名 / 継続 4票, 方向転換 6票'
  },
  {
    n: 22,
    date: '2026.10.09',
    title: '中村 澪 — 区画違いは伝わるか',
    status: 'done',
    outcome: '4区画の飲み比べセットとして商品化。Pass保持者へ先行提供済み。',
    votes: '参加12名 / 伝わる 10票, 伝わらない 2票'
  }
];

/* ---------------------------------------------------------- */

export const me = {
  name: '倉田 詩織',
  latin: 'Shiori Kurata',
  joined: '2026.03',
  labNo: 7,
  labMember: true,
  status: 'Patron',
  taste: { aroma: 84, acidity: 72, bitterness: 88, sweetness: 31, finish: 90 },
  tasteWords: [
    '苦味と余韻に強く反応する。甘みの高いものを繰り返し選ばない。',
    '同じ素材の「違い」を並べる会への参加率が高い（比較型）。',
    '初回より2回目以降の評価が厳しくなる（慣れの補正が効いている）。'
  ],
  introducedBy: '大西 由美',
  patronages: [
    { creatorId: 'mori', since: '2026.03', exp: 43, intro: 7, proto: 4, recipes: 3, downstream: 19, no: 7, status: 'Top Patron' },
    { creatorId: 'arakawa', since: '2026.05', exp: 31, intro: 5, proto: 9, recipes: 1, downstream: 12, no: 9, status: 'Patron' },
    { creatorId: 'tsuji', since: '2026.08', exp: 22, intro: 6, proto: 3, recipes: 0, downstream: 14, no: 23, status: 'Patron' },
    { creatorId: 'nakamura', since: '2027.01', exp: 8, intro: 3, proto: 1, recipes: 0, downstream: 5, no: 12, status: 'Supporter' }
  ],
  ledger: [
    { date: '2027.03.08', type: 'introduction', what: '瀬川 直人 を 森 果穂 のCreator\'s Tableに招待', who: 'Kaho Mori' },
    { date: '2027.02.19', type: 'prototype', what: 'Lab Session #25 — 甘みを使わない5案の評価', who: 'Mika Arakawa' },
    { date: '2027.02.11', type: 'experience', what: '春の山菜、えぐみを最初に置く献立', who: 'Yosuke Tsuji' },
    { date: '2027.01.28', type: 'feedback', what: '「余韻が塩で切れている」— Creatorが有用と評価', who: 'Mika Arakawa' },
    { date: '2027.01.15', type: 'recipe', what: '晩霜ロットの出荷判断に参加。商品化決定', who: 'Kaho Mori' },
    { date: '2027.01.09', type: 'support', what: '中村 澪 のCreator Pass を開始', who: 'Rei Nakamura' },
    { date: '2026.12.20', type: 'introduction', what: '土井 麻里 を 辻 陽介 のカウンターに招待', who: 'Yosuke Tsuji' },
    { date: '2026.11.27', type: 'prototype', what: 'Lab Session #23 — カカオハスクの使い道', who: 'Elise Girard' },
    { date: '2026.10.09', type: 'prototype', what: 'Lab Session #22 — 区画違いは伝わるか', who: 'Rei Nakamura' },
    { date: '2026.09.14', type: 'recipe', what: '秋冬番茶 × 焙じ差しの構成に関与。商品化', who: 'Kaho Mori' },
    { date: '2026.08.02', type: 'support', what: '辻 陽介 のCreator Pass を開始', who: 'Yosuke Tsuji' },
    { date: '2026.05.19', type: 'support', what: '荒川 実花 のCreator Pass を開始', who: 'Mika Arakawa' },
    { date: '2026.03.11', type: 'support', what: '森 果穂 のCreator Pass を開始', who: 'Kaho Mori' },
    { date: '2026.03.02', type: 'join', what: 'COLDRAW Lab Founding Member No.007 として参加', who: 'UNDERCURRENT' }
  ],
  access: [
    { label: '森 果穂 / 7番木の単木抽出', detail: '出荷前の最初の試飲。3月29日、Lab。', open: true },
    { label: '辻 陽介 / 採取同行 東北', detail: '5月16日。Pass保持者のみ。残席3。', open: true },
    { label: '荒川 実花 / Feedback Session', detail: '年1回の直接対話。次回は6月。', open: true },
    { label: '同伴 1名の招待枠', detail: 'Founding Member 年2枠のうち、残り1枠。', open: true },
    { label: '中村 澪 / 収穫期の島への同行', detail: '12月〜2月。支援開始から12ヶ月後に開く。', open: false }
  ],
  notices: [
    {
      date: '2027.03.14',
      body: '森 果穂 の「晩霜 2026」が、あなたが参加した Lab Session #24 の投票を経て出荷されました。あなたは出荷に賛成した9名の一人です。'
    }
  ]
};

/* ---------------------------------------------------------- */

export const LEDGER_LABELS = {
  experience: 'Experience',
  introduction: 'Introduction',
  prototype: 'Prototype',
  feedback: 'Feedback',
  recipe: 'Recipe',
  support: 'Support',
  join: 'Join'
};

export const getCreator = (id) => creators.find((c) => c.id === id);
export const experiencesOf = (id) => experiences.filter((x) => x.creatorId === id);
export const upcoming = () => experiences.slice();

/** 貢献度（金額を含まない）。docs/01-strategy.md D-3 の重み。 */
export const contribution = (r) => r.exp * 1 + r.intro * 4 + (r.proto || 0) * 3;

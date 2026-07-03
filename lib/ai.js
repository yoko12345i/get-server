import axios from 'axios';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';

const SYSTEM_PROMPT = `あなたは「石井ショップ」の目利き店員です。
お客様がスマホで適当に撮影した家の不用品の写真を見て、フリマアプリ（メルカリやラクマのような）で
すぐに出品できる魅力的な商品情報を日本語で作成します。

写真から読み取れる情報だけで判断し、分からない部分は一般的な範囲で自然に補完してください。
価格は日本円(JPY)の中古相場を意識した現実的な金額にしてください。
必ず次のJSON形式のみで返答してください（前後に説明文やコードブロックは付けない）。

{
  "title": "商品タイトル（30文字以内・検索されやすく魅力的に）",
  "description": "商品説明（100〜200文字程度。状態・特徴・おすすめポイントを丁寧に）",
  "category": "カテゴリ（例: 家電, ファッション, おもちゃ, インテリア, 本・雑誌, スポーツ など）",
  "brand": "推定ブランド名（不明ならnull）",
  "condition": "状態（例: 新品未使用 / 目立った傷や汚れなし / やや傷や汚れあり / 全体的に状態が悪い）",
  "suggestedPrice": 商品の推奨価格（整数のJPY）,
  "priceReason": "その価格にした理由（40文字以内）",
  "tags": ["検索用タグを3〜6個"]
}`;

function stripJson(text) {
  if (!text) return null;
  let t = text.trim();
  // ```json ... ``` を除去
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalize(obj) {
  const price = Number(obj.suggestedPrice);
  return {
    title: String(obj.title || 'お品物').slice(0, 40),
    description: String(obj.description || ''),
    category: String(obj.category || 'その他'),
    brand: obj.brand ? String(obj.brand) : null,
    condition: String(obj.condition || '状態は写真をご確認ください'),
    suggestedPrice: Number.isFinite(price) && price > 0 ? Math.round(price) : 1000,
    priceReason: String(obj.priceReason || ''),
    tags: Array.isArray(obj.tags) ? obj.tags.map(String).slice(0, 6) : [],
  };
}

// APIキーが無い / 失敗した時のデモ用フォールバック
function mockResult() {
  const samples = [
    {
      title: 'お家で眠っていた掘り出しモノ',
      description:
        'ご家庭で使われていたお品物です。写真の通り目立った大きなダメージは見当たりません。まだまだお使いいただけますので、気になる方はぜひこの機会にどうぞ！',
      category: 'その他',
      brand: null,
      condition: 'やや傷や汚れあり',
      suggestedPrice: 1200,
      priceReason: '中古相場を参考にお手頃価格に設定',
      tags: ['中古', 'お買い得', 'おうち整理'],
    },
  ];
  return { ...samples[0], _mock: true };
}

/**
 * 画像(data URL または base64)を解析して商品情報を生成する。
 * @param {string[]} images data URL 形式の画像配列
 * @param {string} [hint] ユーザーからの補足メモ
 */
export async function analyzeImages(images, hint = '') {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn('⚠️ OPENAI_API_KEY 未設定のためモックデータを返します');
    return mockResult();
  }

  const imageParts = (images || []).slice(0, 4).map((img) => ({
    type: 'image_url',
    image_url: { url: img, detail: 'low' },
  }));

  const userContent = [
    {
      type: 'text',
      text:
        '次の写真の不用品を出品用の商品情報にしてください。' +
        (hint ? `\n出品者からの補足: ${hint}` : ''),
    },
    ...imageParts,
  ];

  try {
    const res = await axios.post(
      OPENAI_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 700,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const text = res.data.choices?.[0]?.message?.content;
    const parsed = stripJson(text);
    if (!parsed) {
      console.error('❌ JSON解析に失敗しました:', text);
      return mockResult();
    }
    return normalize(parsed);
  } catch (err) {
    console.error('❌ OpenAI呼び出し失敗:', err.response?.data || err.message);
    return mockResult();
  }
}

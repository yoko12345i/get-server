import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
console.log('✅ 環境変数ロード完了');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.use(express.json());

/* ------------------------------------------------------------
   UNDERCURRENT — Consumer Experience Prototype
   静的ファイルと、SPAシェルへのフォールバック
   ------------------------------------------------------------ */

// 設計ドキュメント（プロトタイプのフッターから参照）
app.use('/docs', express.static(path.join(__dirname, 'docs'), { extensions: ['md'] }));

// css / js / index.html
app.use(express.static(PUBLIC_DIR));

// プロトタイプの画面パス。クライアント側の router が pathname で分岐する
const APP_ROUTES = [
  '/',
  '/creators',
  '/creator',
  '/pass',
  '/experiences',
  '/experience',
  '/table',
  '/lab',
  '/me',
  '/share'
];

app.get(APP_ROUTES, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

/* ------------------------------------------------------------
   API
   ------------------------------------------------------------ */

app.get('/api/health', (req, res) => {
  res.json({ status: '🌐 COLDRAW ChatGPTサーバーは稼働中です ✅' });
});

app.post('/ask', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('📩 受信プロンプト:', prompt);

  if (!prompt) {
    console.log('⚠️ プロンプトが空です');
    return res.status(400).json({ error: 'プロンプトが必要です' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'あなたは日本語で丁寧に返答するアシスタントです。' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ OpenAI応答:', JSON.stringify(response.data, null, 2));
    res.json({ reply: response.data.choices?.[0]?.message?.content || '返答が取得できませんでした' });

  } catch (err) {
    console.error('❌ API呼び出し失敗:', err.response?.data || err.message);
    res.status(500).json({ error: 'API呼び出しに失敗しました' });
  }
});

// 未知のパスは 404 のままシェルを返し、クライアント側で 404 画面を描画する
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ サーバーが http://localhost:${PORT} で起動しました`);
  console.log(`🌐 UNDERCURRENT プロトタイプ: http://localhost:${PORT}/`);
});

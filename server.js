import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
console.log('✅ 環境変数ロード完了', process.env.OPENAI_API_KEY);
const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🌐 COLDRAW Executive Dining Network — スマートフォン向けWebプロトタイプ
// 静的ファイルのみ。OPENAI_API_KEY が無くても /dining は完全に動作します。
app.use('/dining', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('🌐 COLDRAW ChatGPTサーバーは稼働中です ✅ / Dining Network プロトタイプ: /dining');
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
        // project: 'proj_XXXX...' ← 必要ならここに追記（今は不要でもOK）
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ サーバーが http://localhost:${PORT} で起動しました`);
  console.log(`🌐 Dining Network プロトタイプ: http://localhost:${PORT}/dining/`);
});

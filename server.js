import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🌐 COLDRAW ChatGPTサーバーは稼働中です ✅');
});

app.post('/ask', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('📩 受信プロンプト:', prompt);  // ログ追加

  if (!prompt) {
    console.log('⚠️ プロンプトが空です');
    return res.status(400).json({ error: 'プロンプトが必要です' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
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

    console.log('✅ OpenAI応答:', response.data);  // ログ追加
    res.json({ reply: response.data.choices[0].message.content });

  } catch (err) {
    console.error('❌ API呼び出し失敗:', err.response?.data || err.message);  // 詳細表示
    res.status(500).json({ error: 'API呼び出しに失敗しました' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ サーバーが http://localhost:${PORT} で起動しました`);
});

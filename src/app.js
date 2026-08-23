import express from 'express';
import path from 'node:path';
import axios from 'axios';
import { config } from './config.js';
import { api } from './api.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', api);

  // 従来のヘルスチェック（互換のため文言はそのまま）
  app.get('/health', (req, res) => {
    res.send('🌐 COLDRAW ChatGPTサーバーは稼働中です ✅');
  });

  // 従来の汎用プロンプトエンドポイント
  app.post('/ask', async (req, res) => {
    const prompt = req.body.prompt;
    console.log('📩 受信プロンプト:', prompt);

    if (!prompt) {
      console.log('⚠️ プロンプトが空です');
      return res.status(400).json({ error: 'プロンプトが必要です' });
    }

    try {
      const response = await axios.post(
        `${config.openai.baseUrl}/chat/completions`,
        {
          model: config.openai.askModel,
          messages: [
            { role: 'system', content: 'あなたは日本語で丁寧に返答するアシスタントです。' },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({ reply: response.data.choices?.[0]?.message?.content || '返答が取得できませんでした' });
    } catch (err) {
      console.error('❌ API呼び出し失敗:', err.response?.data || err.message);
      res.status(500).json({ error: 'API呼び出しに失敗しました' });
    }
  });

  // 専用アプリ本体（ルートで配信）
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  app.use((err, req, res, next) => {
    console.error('❌ サーバーエラー:', err.response?.data || err.message);
    res.status(500).json({ error: err.message || 'サーバー内部エラーが発生しました' });
  });

  return app;
}

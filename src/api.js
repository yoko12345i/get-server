// 優先度付き通知アプリの HTTP API
import express from 'express';
import { config } from './config.js';
import { listItems, getItem, setOverride, summary } from './store.js';
import { refresh } from './pipeline.js';
import { regenerateDraft, TONES } from './triage.js';
import { sourceStatuses, findSource } from './sources/index.js';
import { isLlmEnabled } from './llm.js';

export const api = express.Router();

const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

api.get('/health', (req, res) => {
  res.json({
    ok: true,
    llm: isLlmEnabled(),
    allowSend: config.allowSend,
    sources: sourceStatuses(),
    ...summary()
  });
});

api.get('/sources', (req, res) => {
  res.json({ sources: sourceStatuses(), allowSend: config.allowSend, tones: TONES });
});

api.get('/items', (req, res) => {
  const items = listItems({
    status: req.query.status || 'open',
    source: req.query.source || null,
    level: req.query.level || null,
    query: req.query.q || ''
  });
  res.json({ items, summary: summary() });
});

api.get('/items/:id', (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });
  res.json({ item });
});

api.post(
  '/refresh',
  wrap(async (req, res) => {
    const result = await refresh({ force: Boolean(req.body?.force) });
    res.json({ ...result, summary: summary() });
  })
);

// 返信文案をトーン指定で作り直す
api.post(
  '/items/:id/draft',
  wrap(async (req, res) => {
    const item = getItem(req.params.id);
    if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });

    const draft = await regenerateDraft(item, {
      tone: req.body?.tone || 'standard',
      instruction: req.body?.instruction || ''
    });
    setOverride(item.id, { draft });
    console.log(`✅ 返信文案を再生成しました: ${item.id}`);
    res.json({ draft });
  })
);

// 利用者が手で直した文案を保存する
api.put('/items/:id/draft', (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });
  if (typeof req.body?.text !== 'string') return res.status(400).json({ error: '文案テキストが必要です' });

  const draft = { ...(item.draft || {}), text: req.body.text, edited: true, editedAt: new Date().toISOString() };
  setOverride(item.id, { draft });
  res.json({ draft });
});

api.post('/items/:id/status', (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });

  const status = req.body?.status;
  if (!['open', 'done', 'snoozed'].includes(status)) {
    return res.status(400).json({ error: 'status は open / done / snoozed のいずれかです' });
  }

  const snoozeMinutes = Number(req.body?.snoozeMinutes) || 60;
  setOverride(item.id, {
    status,
    snoozedUntil: status === 'snoozed' ? new Date(Date.now() + snoozeMinutes * 60000).toISOString() : null
  });
  console.log(`✅ ステータス更新: ${item.id} → ${status}`);
  res.json({ item: getItem(item.id) });
});

api.post('/items/:id/pin', (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });
  setOverride(item.id, { pinned: Boolean(req.body?.pinned) });
  res.json({ item: getItem(item.id) });
});

// 実送信。既定では無効で、ALLOW_SEND=true のときだけ有効になる。
api.post(
  '/items/:id/send',
  wrap(async (req, res) => {
    if (!config.allowSend) {
      return res.status(403).json({ error: '送信機能は無効です（ALLOW_SEND=true で有効化できます）' });
    }

    const item = getItem(req.params.id);
    if (!item) return res.status(404).json({ error: '該当する通知が見つかりません' });
    if (item.isDemo) return res.status(400).json({ error: 'デモデータには送信できません' });

    const text = typeof req.body?.text === 'string' && req.body.text.trim() ? req.body.text : item.draft?.text;
    if (!text) return res.status(400).json({ error: '送信する本文がありません' });

    const source = findSource(item.source);
    if (!source?.send) return res.status(400).json({ error: `${item.sourceLabel} への送信には対応していません` });

    const result = await source.send(item, text);
    setOverride(item.id, { status: 'done', sentAt: new Date().toISOString(), draft: { ...item.draft, text } });
    console.log(`✅ 返信を送信しました: ${item.id}`);
    res.json({ ok: true, result, item: getItem(item.id) });
  })
);

import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// 設定は import 時に読み込まれるため、モジュール読み込み前に環境変数を確定させる
const stateFile = path.join(os.tmpdir(), `inbox-test-${process.pid}.json`);
process.env.STATE_FILE = stateFile;
process.env.DEMO_MODE = 'true';
process.env.OPENAI_API_KEY = '';
process.env.REFRESH_ON_BOOT = 'false';
process.env.REFRESH_INTERVAL_MS = '0';

const { createApp } = await import('../src/app.js');
const { refresh } = await import('../src/pipeline.js');
const { parseJsonLoose } = await import('../src/llm.js');

const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const get = async (path) => (await fetch(`${base}${path}`)).json();
const post = async (path, body) =>
  (await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })).json();

test.after(() => {
  server.close();
  fs.rmSync(stateFile, { force: true });
});

test('取り込むと優先度順の一覧が返る', async () => {
  await refresh({ force: true });
  const { items, summary } = await get('/api/items');

  assert.ok(items.length >= 5);
  assert.equal(summary.open, items.length);
  for (let i = 1; i < items.length; i += 1) {
    assert.ok(items[i - 1].priority.score >= items[i].priority.score, '降順に並んでいること');
  }
});

test('APIキーが無くてもすべての通知に返信文案が付く', async () => {
  const { items } = await get('/api/items');
  for (const item of items) {
    assert.ok(item.draft?.text?.length > 0, `${item.id} に文案が無い`);
  }
});

test('完了にすると未対応一覧から消える', async () => {
  const { items } = await get('/api/items');
  const target = items[0];

  await post(`/api/items/${encodeURIComponent(target.id)}/status`, { status: 'done' });

  const open = await get('/api/items?status=open');
  assert.ok(!open.items.some((item) => item.id === target.id));

  const done = await get('/api/items?status=done');
  assert.ok(done.items.some((item) => item.id === target.id));
});

test('手で編集した文案は保存され、再取り込みでも失われない', async () => {
  const { items } = await get('/api/items');
  const target = items[0];

  await fetch(`${base}/api/items/${encodeURIComponent(target.id)}/draft`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '編集後の文案です' })
  });

  await refresh({ force: true });
  const { item } = await get(`/api/items/${encodeURIComponent(target.id)}`);
  assert.equal(item.draft.text, '編集後の文案です');
  assert.equal(item.draft.edited, true);
});

test('送信は既定で無効', async () => {
  const { items } = await get('/api/items');
  const response = await fetch(`${base}/api/items/${encodeURIComponent(items[0].id)}/send`, { method: 'POST' });
  assert.equal(response.status, 403);
});

test('ソースで絞り込める', async () => {
  const { items } = await get('/api/items?source=slack&status=all');
  assert.ok(items.length > 0);
  assert.ok(items.every((item) => item.source === 'slack'));
});

test('LLM 応答が ```json で囲まれていても解釈できる', () => {
  assert.deepEqual(parseJsonLoose('```json\n{"results":[{"id":"a"}]}\n```'), { results: [{ id: 'a' }] });
  assert.equal(parseJsonLoose('壊れた出力'), null);
});

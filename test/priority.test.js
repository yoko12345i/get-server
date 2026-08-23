import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreItem, comparePriority, extractDeadline, levelOf } from '../src/priority.js';

const baseItem = (overrides = {}) => ({
  id: 'demo:1',
  source: 'slack',
  subject: '',
  body: '',
  from: { name: 'テスト太郎' },
  isDirect: false,
  participantCount: 3,
  receivedAt: new Date().toISOString(),
  ...overrides
});

test('至急のDMは緊急レベルになる', () => {
  const result = scoreItem(baseItem({ isDirect: true, body: '本番APIが落ちています。至急確認をお願いできますか？' }));
  assert.equal(result.level, 'urgent');
  assert.ok(result.score >= 78, `score=${result.score}`);
});

test('自動配信のメールは低優先度に下がる', () => {
  const result = scoreItem(
    baseItem({ source: 'gmail', subject: '週刊ニュースレター', body: 'このメールは送信専用アドレスから配信されています。配信停止はこちら。' })
  );
  assert.equal(result.level, 'low');
});

test('最後の発言が自分なら優先度が下がる', () => {
  const item = baseItem({ isDirect: true, body: 'ご確認をお願いします。' });
  const waiting = scoreItem({ ...item, lastMessageFromMe: true });
  const notWaiting = scoreItem(item);
  assert.ok(waiting.score < notWaiting.score);
});

test('期限超過は理由に含まれる', () => {
  const result = scoreItem(baseItem({ body: '確認をお願いします', deadline: new Date(Date.now() - 3600000).toISOString() }));
  assert.ok(result.reasons.includes('期限を過ぎている'));
});

test('本日中という表現から締切を推定する', () => {
  const now = new Date('2026-08-23T02:00:00.000Z');
  const deadline = extractDeadline('本日中にご返信ください', now);
  assert.ok(deadline, '締切が抽出されること');
  assert.equal(new Date(deadline).getHours(), 18);
});

test('日付指定（12/5 まで）を締切として抽出する', () => {
  const now = new Date('2026-12-01T09:00:00.000Z');
  const deadline = extractDeadline('12/5 までにご連絡ください', now);
  const parsed = new Date(deadline);
  assert.equal(parsed.getMonth(), 11);
  assert.equal(parsed.getDate(), 5);
});

test('スコアが同じ場合は締切が近い方を先に並べる', () => {
  const soon = { priority: { score: 60, deadline: new Date(Date.now() + 3600000).toISOString() }, receivedAt: new Date().toISOString() };
  const later = { priority: { score: 60, deadline: new Date(Date.now() + 86400000).toISOString() }, receivedAt: new Date().toISOString() };
  assert.deepEqual([later, soon].sort(comparePriority)[0], soon);
});

test('レベルの境界値', () => {
  assert.equal(levelOf(78).level, 'urgent');
  assert.equal(levelOf(77).level, 'high');
  assert.equal(levelOf(34).level, 'low');
});

test('再取り込み時のスコア再計算は LLM 判定を保ったまま時間要素を反映する', async () => {
  const { rescore } = await import('../src/triage.js');
  const item = baseItem({ isDirect: true, body: 'ご確認をお願いします。' });
  const previous = { llmScore: 90, reasons: ['顧客が回答を待っている'], deadline: null };

  const result = rescore(item, previous);
  assert.equal(result.triagedBy, 'llm');
  assert.equal(result.llmScore, 90);
  assert.ok(result.score > result.ruleScore, 'LLM 判定が高ければスコアも押し上げられる');
  assert.equal(result.reasons[0], '顧客が回答を待っている');
});

test('LLM 判定が無い通知はルール判定のみで再計算される', async () => {
  const { rescore } = await import('../src/triage.js');
  const item = baseItem({ body: 'よろしくお願いします' });
  assert.equal(rescore(item, { reasons: [] }).triagedBy, 'rules');
});

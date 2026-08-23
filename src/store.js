// 取り込んだ通知と、利用者の操作（完了 / スヌーズ / 下書き編集）を保持するストア。
// プロセス再起動でも状態が消えないよう JSON ファイルへ書き出す。
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';
import { comparePriority } from './priority.js';

const stateFile = path.resolve(process.cwd(), config.storage.stateFile);

const state = {
  items: new Map(),
  // 利用者の操作は取り込み直しても失わないよう、通知本体とは別に保持する
  overrides: new Map(),
  lastRefreshedAt: null,
  refreshing: false,
  progress: null,
  errors: []
};

let writeTimer = null;

export function loadState() {
  try {
    if (!fs.existsSync(stateFile)) return;
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    for (const item of raw.items || []) state.items.set(item.id, item);
    for (const [id, override] of Object.entries(raw.overrides || {})) state.overrides.set(id, override);
    state.lastRefreshedAt = raw.lastRefreshedAt || null;
    console.log(`✅ 保存済みの状態を読み込みました（${state.items.size}件）`);
  } catch (err) {
    console.error('⚠️ 状態ファイルの読み込みに失敗しました:', err.message);
  }
}

// 連続更新でディスクを叩きすぎないよう、書き出しは 500ms ぶんまとめる
export function persist() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    try {
      await fsp.mkdir(path.dirname(stateFile), { recursive: true });
      await fsp.writeFile(
        stateFile,
        JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            lastRefreshedAt: state.lastRefreshedAt,
            items: [...state.items.values()],
            overrides: Object.fromEntries(state.overrides)
          },
          null,
          2
        )
      );
    } catch (err) {
      console.error('⚠️ 状態の保存に失敗しました:', err.message);
    }
  }, 500);
  writeTimer.unref?.();
}

export const getRawItem = (id) => state.items.get(id) || null;

export const getOverride = (id) => state.overrides.get(id) || {};

export function setOverride(id, patch) {
  const next = { ...getOverride(id), ...patch, updatedAt: new Date().toISOString() };
  state.overrides.set(id, next);
  persist();
  return next;
}

export function upsertItems(items) {
  for (const item of items) state.items.set(item.id, item);
  persist();
}

export function replaceItems(items) {
  const next = new Map();
  for (const item of items) next.set(item.id, item);
  // 完了・スヌーズ済みの通知は、ソース側から消えても履歴として残す
  for (const [id, item] of state.items) {
    const override = getOverride(id);
    if (!next.has(id) && override.status && override.status !== 'open') next.set(id, item);
  }
  state.items = next;
  persist();
}

// 保存済みの通知と利用者の操作を合成した、表示用のオブジェクトを作る
function materialize(item) {
  const override = getOverride(item.id);
  const snoozedUntil = override.snoozedUntil || null;
  const snoozeExpired = snoozedUntil && new Date(snoozedUntil).getTime() <= Date.now();
  const status = snoozeExpired && override.status === 'snoozed' ? 'open' : override.status || 'open';

  return {
    ...item,
    status,
    snoozedUntil: status === 'snoozed' ? snoozedUntil : null,
    pinned: Boolean(override.pinned),
    sentAt: override.sentAt || null,
    draft: override.draft ? { ...item.draft, ...override.draft } : item.draft
  };
}

export function listItems({ status = 'open', source = null, level = null, query = '' } = {}) {
  const items = [...state.items.values()]
    .map(materialize)
    .filter((item) => (status === 'all' ? true : item.status === status))
    .filter((item) => (source ? item.source === source : true))
    .filter((item) => (level ? item.priority?.level === level : true))
    .filter((item) => {
      if (!query) return true;
      const haystack = `${item.subject} ${item.body} ${item.from?.name} ${item.channel}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

  // ピン留めは常に先頭、その他は優先度順
  return items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return comparePriority(a, b);
  });
}

export const getItem = (id) => {
  const item = state.items.get(id);
  return item ? materialize(item) : null;
};

export function summary() {
  const open = listItems({ status: 'open' });
  const counts = { urgent: 0, high: 0, normal: 0, low: 0 };
  for (const item of open) counts[item.priority?.level || 'low'] += 1;

  return {
    open: open.length,
    counts,
    topScore: open[0]?.priority?.score ?? 0,
    lastRefreshedAt: state.lastRefreshedAt,
    refreshing: state.refreshing,
    progress: state.progress,
    errors: state.errors
  };
}

export const meta = state;

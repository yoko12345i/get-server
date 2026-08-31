// 取り込み → 優先度判定 → 返信文案生成 の一連の流れ
import { collectAll } from './sources/index.js';
import { triageItems, rescore } from './triage.js';
import { meta, replaceItems, getRawItem, persist } from './store.js';
import { isLlmEnabled } from './llm.js';

// 同じ内容を何度も LLM に投げないための判定
const needsTriage = (incoming) => {
  const existing = getRawItem(incoming.id);
  if (!existing?.priority) return true;
  if (existing.body !== incoming.body) return true;
  if (existing.priority.triagedBy !== 'llm' && isLlmEnabled()) return true;
  return false;
};

let inFlight = null;

/** 全ソースから取り込んで再判定する。同時実行は 1 本にまとめる。 */
export function refresh({ force = false } = {}) {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    meta.refreshing = true;
    meta.progress = { phase: 'collect', done: 0, total: 0 };
    const startedAt = Date.now();

    try {
      const { items, errors } = await collectAll();
      meta.errors = errors;

      const fresh = force ? items : items.filter(needsTriage);
      // 再判定しない通知も、放置時間や締切までの残りは変わるためスコアだけ計算し直す
      const reused = force
        ? []
        : items
            .filter((item) => !needsTriage(item))
            .map((item) => {
              const existing = getRawItem(item.id);
              return { ...existing, ...item, priority: rescore(item, existing.priority), draft: existing.draft };
            });

      meta.progress = { phase: 'triage', done: 0, total: fresh.length };
      console.log(`📩 取り込み ${items.length}件 / 新規判定 ${fresh.length}件`);

      const triaged = fresh.length
        ? await triageItems(fresh, {
            onProgress: (done, total) => {
              meta.progress = { phase: 'triage', done, total };
            }
          })
        : [];

      replaceItems([...triaged, ...reused]);
      meta.lastRefreshedAt = new Date().toISOString();
      console.log(`✅ 優先度の更新が完了しました (${Date.now() - startedAt}ms)`);

      return { collected: items.length, triaged: triaged.length, errors };
    } finally {
      meta.refreshing = false;
      meta.progress = null;
      persist();
      inFlight = null;
    }
  })();

  return inFlight;
}

let timer = null;

export function startAutoRefresh(intervalMs) {
  if (!intervalMs || intervalMs <= 0) {
    console.log('⚠️ 自動取り込みは無効です（REFRESH_INTERVAL_MS=0）');
    return;
  }
  clearInterval(timer);
  timer = setInterval(() => {
    refresh().catch((err) => console.error('❌ 自動取り込みに失敗:', err.message));
  }, intervalMs);
  timer.unref?.();
  console.log(`✅ ${Math.round(intervalMs / 1000)}秒ごとに自動取り込みします`);
}

export function stopAutoRefresh() {
  clearInterval(timer);
  timer = null;
}

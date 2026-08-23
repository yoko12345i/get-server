// 各コネクタを束ねるレジストリ。1 つが落ちても他のソースは取り込めるようにする。
import { config } from '../config.js';
import * as slack from './slack.js';
import * as gmail from './gmail.js';
import * as notion from './notion.js';
import * as messenger from './messenger.js';
import * as demo from './demo.js';

export const SOURCES = { slack, gmail, notion, messenger, demo };

const realSources = () => [slack, gmail, notion, messenger].filter((source) => source.isConfigured());

/**
 * 有効なソース一覧。実サービスの設定が 1 つも無い場合はデモデータに自動でフォールバックする
 * （DEMO_MODE を明示していれば、その指定が優先される）。
 */
export function activeSources() {
  const configured = realSources();
  if (config.sources.demo.enabled === true) return [...configured, demo];
  if (config.sources.demo.enabled === false) return configured;
  return configured.length ? configured : [demo];
}

export function sourceStatuses() {
  const active = new Set(activeSources().map((source) => source.id));
  return Object.values(SOURCES).map((source) => ({
    id: source.id,
    label: source.label,
    configured: source.id === 'demo' ? active.has('demo') : source.isConfigured(),
    active: active.has(source.id),
    canSend: typeof source.send === 'function'
  }));
}

/** 有効な全ソースから並列で通知を取得し、正規化した配列にして返す */
export async function collectAll() {
  const sources = activeSources();
  const errors = [];

  const results = await Promise.all(
    sources.map(async (source) => {
      const startedAt = Date.now();
      try {
        const items = await source.fetchItems();
        console.log(`✅ ${source.label}: ${items.length}件 取得 (${Date.now() - startedAt}ms)`);
        return items.map((item) => normalize(item, source));
      } catch (err) {
        const message = err.response?.data?.error?.message || err.response?.data?.error || err.message;
        console.error(`❌ ${source.label} の取得に失敗:`, message);
        errors.push({ source: source.id, label: source.label, message: String(message) });
        return [];
      }
    })
  );

  return { items: results.flat(), errors };
}

function normalize(item, source) {
  const sourceId = item.source || source.id;
  return {
    id: `${sourceId}:${item.externalId}`,
    externalId: item.externalId,
    source: sourceId,
    sourceLabel: item.sourceLabel || source.label,
    channel: item.channel || '',
    subject: item.subject || '',
    from: item.from || { name: '不明' },
    body: item.body || '',
    isDirect: Boolean(item.isDirect),
    mentionsMe: Boolean(item.mentionsMe),
    participantCount: item.participantCount ?? null,
    lastMessageFromMe: Boolean(item.lastMessageFromMe),
    receivedAt: item.receivedAt || new Date().toISOString(),
    permalink: item.permalink || '',
    replyTarget: item.replyTarget || null,
    isDemo: Boolean(item.isDemo)
  };
}

export function findSource(id) {
  return SOURCES[id] || null;
}

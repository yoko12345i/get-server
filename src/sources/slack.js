// Slack 連携。DM / グループDM / 指定チャンネルの直近メッセージを取り込む。
import axios from 'axios';
import { config } from '../config.js';

export const id = 'slack';
export const label = 'Slack';

const API = 'https://slack.com/api';

export function isConfigured() {
  return Boolean(config.sources.slack.token);
}

const call = async (method, params) => {
  const { data } = await axios.get(`${API}/${method}`, {
    params,
    headers: { Authorization: `Bearer ${config.sources.slack.token}` },
    timeout: 20000
  });
  if (!data.ok) throw new Error(`Slack ${method}: ${data.error}`);
  return data;
};

const userCache = new Map();
const resolveUser = async (userId) => {
  if (!userId) return { name: '不明' };
  if (userCache.has(userId)) return userCache.get(userId);
  try {
    const { user } = await call('users.info', { user: userId });
    const profile = { name: user.profile?.display_name || user.real_name || user.name, handle: `@${user.name}` };
    userCache.set(userId, profile);
    return profile;
  } catch {
    return { name: userId, handle: `<@${userId}>` };
  }
};

export async function fetchItems() {
  const { slack } = config.sources;
  const oldest = (Date.now() - config.triage.lookbackHours * 3600 * 1000) / 1000;

  const { channels } = await call('users.conversations', {
    types: slack.includeChannelTypes,
    exclude_archived: true,
    limit: 200
  });

  const targets = channels.filter((channel) => {
    if (!slack.channels.length) return channel.is_im || channel.is_mpim;
    const name = channel.name ? `#${channel.name}` : '';
    return channel.is_im || channel.is_mpim || slack.channels.includes(name) || slack.channels.includes(channel.name);
  });

  const items = [];

  for (const channel of targets.slice(0, 40)) {
    let history;
    try {
      history = await call('conversations.history', { channel: channel.id, oldest, limit: 20 });
    } catch (err) {
      console.error('⚠️ Slack 履歴の取得に失敗:', channel.id, err.message);
      continue;
    }

    const messages = (history.messages || []).filter((message) => message.type === 'message' && !message.subtype);
    if (!messages.length) continue;

    // 最新メッセージが自分の発言なら「相手の返信待ち」としてフラグを立てる
    const latest = messages[0];
    const lastMessageFromMe = latest.user && latest.user === config.me.slackUserId;

    for (const message of messages.slice(0, 5)) {
      if (message.user && message.user === config.me.slackUserId) continue;
      const from = await resolveUser(message.user);
      const channelName = channel.is_im ? `DM: ${from.name}` : `#${channel.name || channel.id}`;

      items.push({
        externalId: `${channel.id}-${message.ts}`,
        source: id,
        sourceLabel: label,
        channel: channelName,
        subject: '',
        from,
        body: message.text || '',
        isDirect: Boolean(channel.is_im),
        mentionsMe: config.me.slackUserId ? String(message.text || '').includes(`<@${config.me.slackUserId}>`) : false,
        participantCount: channel.num_members || 2,
        lastMessageFromMe: lastMessageFromMe && message.ts !== latest.ts,
        receivedAt: new Date(Number(message.ts) * 1000).toISOString(),
        permalink: `https://slack.com/app_redirect?channel=${channel.id}`,
        replyTarget: { channel: channel.id, thread_ts: message.thread_ts || message.ts }
      });
    }
  }

  return items.slice(0, config.triage.maxItemsPerSource);
}

export async function send(item, text) {
  const target = item.replyTarget;
  if (!target?.channel) throw new Error('返信先チャンネルが不明です');
  const { data } = await axios.post(
    `${API}/chat.postMessage`,
    { channel: target.channel, thread_ts: target.thread_ts, text },
    { headers: { Authorization: `Bearer ${config.sources.slack.token}`, 'Content-Type': 'application/json' }, timeout: 20000 }
  );
  if (!data.ok) throw new Error(`Slack chat.postMessage: ${data.error}`);
  return { ok: true, ts: data.ts };
}

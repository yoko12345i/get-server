// Facebook Messenger 連携（ページ受信箱）。Graph API の conversations を取り込む。
import axios from 'axios';
import { config } from '../config.js';

export const id = 'messenger';
export const label = 'Messenger';

export function isConfigured() {
  return Boolean(config.sources.messenger.pageToken);
}

const base = () => `https://graph.facebook.com/${config.sources.messenger.apiVersion}`;

export async function fetchItems() {
  const { pageToken, pageId } = config.sources.messenger;
  const since = Date.now() - config.triage.lookbackHours * 3600 * 1000;

  const { data } = await axios.get(`${base()}/${pageId}/conversations`, {
    params: {
      fields: 'participants,updated_time,messages.limit(5){message,from,created_time,id}',
      limit: 25,
      access_token: pageToken
    },
    timeout: 20000
  });

  const items = [];

  for (const conversation of data.data || []) {
    const messages = conversation.messages?.data || [];
    if (!messages.length) continue;

    const participants = conversation.participants?.data || [];
    const latest = messages[0];
    const lastMessageFromMe = latest.from?.id === pageId || latest.from?.name === config.me.name;

    for (const message of messages) {
      const createdAt = new Date(message.created_time).getTime();
      if (createdAt < since) continue;
      if (message.from?.id === pageId) continue;
      if (!message.message) continue;

      items.push({
        externalId: message.id,
        source: id,
        sourceLabel: label,
        channel: participants.length > 2 ? 'グループチャット' : '個人チャット',
        subject: '',
        from: { name: message.from?.name || '不明', handle: message.from?.id || '' },
        body: message.message,
        isDirect: participants.length <= 2,
        participantCount: participants.length || 2,
        lastMessageFromMe: lastMessageFromMe && message.id !== latest.id,
        receivedAt: message.created_time,
        permalink: `https://www.messenger.com/t/${conversation.id}`,
        replyTarget: { recipientId: message.from?.id }
      });
    }
  }

  return items.slice(0, config.triage.maxItemsPerSource);
}

export async function send(item, text) {
  const recipientId = item.replyTarget?.recipientId;
  if (!recipientId) throw new Error('返信先ユーザーが不明です');
  const { data } = await axios.post(
    `${base()}/${config.sources.messenger.pageId}/messages`,
    { recipient: { id: recipientId }, message: { text }, messaging_type: 'RESPONSE' },
    { params: { access_token: config.sources.messenger.pageToken }, timeout: 20000 }
  );
  return { ok: true, id: data.message_id };
}

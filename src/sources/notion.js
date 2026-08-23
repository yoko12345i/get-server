// Notion 連携。最近更新されたページの未解決コメントを取り込む。
import axios from 'axios';
import { config } from '../config.js';

export const id = 'notion';
export const label = 'Notion';

const API = 'https://api.notion.com/v1';

export function isConfigured() {
  return Boolean(config.sources.notion.token);
}

const headers = () => ({
  Authorization: `Bearer ${config.sources.notion.token}`,
  'Notion-Version': config.sources.notion.version,
  'Content-Type': 'application/json'
});

const plainText = (richText = []) => richText.map((token) => token.plain_text || '').join('');

const pageTitle = (page) => {
  const properties = page.properties || {};
  for (const property of Object.values(properties)) {
    if (property.type === 'title') return plainText(property.title) || '無題';
  }
  return page.title ? plainText(page.title) : '無題';
};

const userCache = new Map();
const resolveUser = async (userId) => {
  if (!userId) return { name: '不明' };
  if (userCache.has(userId)) return userCache.get(userId);
  try {
    const { data } = await axios.get(`${API}/users/${userId}`, { headers: headers(), timeout: 20000 });
    const profile = { name: data.name || 'Notion ユーザー', handle: data.person?.email || '', email: data.person?.email || '' };
    userCache.set(userId, profile);
    return profile;
  } catch {
    return { name: 'Notion ユーザー' };
  }
};

export async function fetchItems() {
  const since = Date.now() - config.triage.lookbackHours * 3600 * 1000;

  const { data: search } = await axios.post(
    `${API}/search`,
    { filter: { property: 'object', value: 'page' }, sort: { direction: 'descending', timestamp: 'last_edited_time' }, page_size: 20 },
    { headers: headers(), timeout: 20000 }
  );

  const pages = (search.results || []).filter((page) => new Date(page.last_edited_time).getTime() >= since);
  const items = [];

  for (const page of pages) {
    let comments;
    try {
      const { data } = await axios.get(`${API}/comments`, {
        params: { block_id: page.id, page_size: 20 },
        headers: headers(),
        timeout: 20000
      });
      comments = data.results || [];
    } catch (err) {
      console.error('⚠️ Notion コメントの取得に失敗:', page.id, err.message);
      continue;
    }

    for (const comment of comments) {
      const createdAt = new Date(comment.created_time).getTime();
      if (createdAt < since) continue;
      const from = await resolveUser(comment.created_by?.id);
      const body = plainText(comment.rich_text);

      items.push({
        externalId: comment.id,
        source: id,
        sourceLabel: label,
        channel: `${pageTitle(page)} / コメント`,
        subject: `コメント: ${pageTitle(page)}`,
        from,
        body,
        isDirect: false,
        mentionsMe: (comment.rich_text || []).some(
          (token) => token.type === 'mention' && token.mention?.user?.name && token.mention.user.name === config.me.name
        ),
        participantCount: null,
        receivedAt: comment.created_time,
        permalink: page.url,
        replyTarget: { discussionId: comment.discussion_id }
      });
    }
  }

  return items.slice(0, config.triage.maxItemsPerSource);
}

export async function send(item, text) {
  const discussionId = item.replyTarget?.discussionId;
  if (!discussionId) throw new Error('返信先ディスカッションが不明です');
  const { data } = await axios.post(
    `${API}/comments`,
    { discussion_id: discussionId, rich_text: [{ type: 'text', text: { content: text } }] },
    { headers: headers(), timeout: 20000 }
  );
  return { ok: true, id: data.id };
}

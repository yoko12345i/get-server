// Gmail 連携。未読メールを取り込み、必要なら refresh token でアクセストークンを更新する。
import axios from 'axios';
import { config } from '../config.js';

export const id = 'gmail';
export const label = 'Gmail';

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

let cachedToken = { value: '', expiresAt: 0 };

export function isConfigured() {
  const gmail = config.sources.gmail;
  return Boolean(gmail.accessToken || (gmail.clientId && gmail.clientSecret && gmail.refreshToken));
}

async function accessToken() {
  const gmail = config.sources.gmail;
  if (gmail.accessToken) return gmail.accessToken;
  if (cachedToken.value && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const { data } = await axios.post(
    'https://oauth2.googleapis.com/token',
    new URLSearchParams({
      client_id: gmail.clientId,
      client_secret: gmail.clientSecret,
      refresh_token: gmail.refreshToken,
      grant_type: 'refresh_token'
    }),
    { timeout: 20000 }
  );

  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

const headerValue = (headers, name) =>
  headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value || '';

const parseFrom = (value) => {
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim() || match[2], handle: match[2], email: match[2] };
  return { name: value, handle: value, email: value };
};

// 本文（text/plain 優先）を再帰的に取り出す
const extractBody = (payload) => {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf8');
  }
  for (const part of payload.parts || []) {
    const text = extractBody(part);
    if (text) return text;
  }
  return '';
};

export async function fetchItems() {
  const token = await accessToken();
  const headers = { Authorization: `Bearer ${token}` };
  const after = Math.floor((Date.now() - config.triage.lookbackHours * 3600 * 1000) / 1000);

  const { data: list } = await axios.get(`${API}/messages`, {
    params: { q: `${config.sources.gmail.query} after:${after}`, maxResults: config.triage.maxItemsPerSource },
    headers,
    timeout: 20000
  });

  const items = [];
  for (const ref of list.messages || []) {
    const { data: message } = await axios.get(`${API}/messages/${ref.id}`, {
      params: { format: 'full' },
      headers,
      timeout: 20000
    });

    const messageHeaders = message.payload?.headers || [];
    const from = parseFrom(headerValue(messageHeaders, 'From'));
    const to = headerValue(messageHeaders, 'To');
    const body = (extractBody(message.payload) || message.snippet || '').slice(0, 4000);

    items.push({
      externalId: message.id,
      source: id,
      sourceLabel: label,
      channel: '受信トレイ',
      subject: headerValue(messageHeaders, 'Subject'),
      from,
      body,
      isDirect: config.me.email ? to.toLowerCase().includes(config.me.email.toLowerCase()) && !to.includes(',') : !to.includes(','),
      participantCount: to.split(',').length + 1,
      receivedAt: new Date(Number(message.internalDate)).toISOString(),
      permalink: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
      replyTarget: {
        threadId: message.threadId,
        messageId: headerValue(messageHeaders, 'Message-ID'),
        to: from.email,
        subject: headerValue(messageHeaders, 'Subject')
      }
    });
  }

  return items;
}

export async function send(item, text) {
  const token = await accessToken();
  const target = item.replyTarget || {};
  if (!target.to) throw new Error('返信先アドレスが不明です');

  const subject = target.subject?.startsWith('Re:') ? target.subject : `Re: ${target.subject || ''}`;
  const mime = [
    `To: ${target.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    target.messageId ? `In-Reply-To: ${target.messageId}` : '',
    target.messageId ? `References: ${target.messageId}` : '',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    text
  ]
    .filter(Boolean)
    .join('\r\n');

  const { data } = await axios.post(
    `${API}/messages/send`,
    { raw: Buffer.from(mime).toString('base64url'), threadId: target.threadId },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 20000 }
  );

  return { ok: true, id: data.id };
}

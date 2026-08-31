// デモ用ソース。API キーが 1 つも無くてもアプリ全体の動きを確認できるようにする。
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';

export const id = 'demo';
export const label = 'デモ';

export function isConfigured() {
  return config.sources.demo.enabled === true;
}

export async function fetchItems() {
  const file = path.resolve(process.cwd(), config.sources.demo.file);
  const raw = JSON.parse(await fs.readFile(file, 'utf8'));
  const now = Date.now();

  return (raw.items || []).map((item) => {
    const { receivedMinutesAgo, ...rest } = item;
    return {
      ...rest,
      receivedAt: new Date(now - (receivedMinutesAgo || 0) * 60000).toISOString(),
      isDemo: true
    };
  });
}

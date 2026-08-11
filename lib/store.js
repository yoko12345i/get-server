import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ITEMS_FILE);
  } catch {
    await fs.writeFile(ITEMS_FILE, '[]', 'utf-8');
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(ITEMS_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAll(items) {
  await ensureFile();
  await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function listItems() {
  const items = await readAll();
  // 新しい順
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getItem(id) {
  const items = await readAll();
  return items.find((i) => i.id === id) || null;
}

export async function createItem(data) {
  const items = await readAll();
  const item = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    status: 'on_sale', // on_sale | sold
    ...data,
  };
  items.push(item);
  await writeAll(items);
  return item;
}

export async function updateItem(id, patch) {
  const items = await readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  await writeAll(items);
  return items[idx];
}

export async function deleteItem(id) {
  const items = await readAll();
  const next = items.filter((i) => i.id !== id);
  await writeAll(next);
  return next.length !== items.length;
}

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

import { analyzeImages } from './lib/ai.js';
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from './lib/store.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');

const app = express();
app.use(express.json({ limit: '30mb' }));

// 静的ファイル（フロントエンド / アップロード画像）
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// data URL を画像ファイルとして保存し、公開URLを返す
async function saveDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  const ext = match[1].split('/')[1].replace('jpeg', 'jpg');
  const buf = Buffer.from(match[2], 'base64');
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

// ---- ヘルスチェック ----
app.get('/health', (req, res) => {
  res.json({ ok: true, ai: Boolean(process.env.OPENAI_API_KEY) });
});

// ---- 写真を解析して商品情報を生成 ----
app.post('/api/analyze', async (req, res) => {
  const { images, hint } = req.body || {};
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: '画像が必要です' });
  }
  console.log(`📸 解析リクエスト: ${images.length}枚`);
  try {
    const result = await analyzeImages(images, hint || '');
    res.json({ product: result });
  } catch (err) {
    console.error('❌ 解析エラー:', err.message);
    res.status(500).json({ error: '解析に失敗しました' });
  }
});

// ---- 出品（商品を保存）----
app.post('/api/items', async (req, res) => {
  const { product, images } = req.body || {};
  if (!product || !product.title) {
    return res.status(400).json({ error: '商品情報が不足しています' });
  }
  try {
    const imageList = Array.isArray(images) ? images.slice(0, 4) : [];
    const saved = [];
    for (const img of imageList) {
      const url = await saveDataUrl(img);
      if (url) saved.push(url);
    }
    const item = await createItem({
      title: product.title,
      description: product.description || '',
      category: product.category || 'その他',
      brand: product.brand || null,
      condition: product.condition || '',
      price: Number(product.suggestedPrice) || Number(product.price) || 1000,
      priceReason: product.priceReason || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
      images: saved,
    });
    console.log(`🛍️ 出品しました: ${item.title} (¥${item.price})`);
    res.status(201).json({ item });
  } catch (err) {
    console.error('❌ 出品エラー:', err.message);
    res.status(500).json({ error: '出品に失敗しました' });
  }
});

// ---- 商品一覧 ----
app.get('/api/items', async (req, res) => {
  const items = await listItems();
  res.json({ items });
});

// ---- 商品詳細 ----
app.get('/api/items/:id', async (req, res) => {
  const item = await getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '商品が見つかりません' });
  res.json({ item });
});

// ---- 購入（モック）----
app.post('/api/items/:id/buy', async (req, res) => {
  const item = await getItem(req.params.id);
  if (!item) return res.status(404).json({ error: '商品が見つかりません' });
  if (item.status === 'sold') {
    return res.status(409).json({ error: 'この商品は売り切れです' });
  }
  const updated = await updateItem(req.params.id, {
    status: 'sold',
    soldAt: Date.now(),
  });
  console.log(`💰 購入されました: ${updated.title}`);
  res.json({ item: updated });
});

// ---- 出品削除 ----
app.delete('/api/items/:id', async (req, res) => {
  const ok = await deleteItem(req.params.id);
  if (!ok) return res.status(404).json({ error: '商品が見つかりません' });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏪 石井ショップが http://localhost:${PORT} で起動しました`);
  console.log(`   AI解析: ${process.env.OPENAI_API_KEY ? '有効 ✅' : 'モックモード（APIキー未設定）⚠️'}`);
});

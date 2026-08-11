// ===== 石井ショップ フロントエンド =====

const state = {
  images: [], // data URL の配列（縮小済み）
};

const $ = (sel) => document.querySelector(sel);

// ---------- タブ切り替え ----------
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    tab.classList.add('active');
    const view = tab.dataset.view;
    $(`#view-${view}`).classList.add('active');
    if (view === 'shop') loadShop();
  });
});

// ---------- トースト ----------
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

// ---------- 画像縮小（base64を軽くする） ----------
function shrinkImage(dataUrl, maxSize = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- 動画から代表フレームを抽出 ----------
function extractFrames(file, count = 3) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const frames = [];
    let targets = [];
    let idx = 0;

    video.onloadedmetadata = () => {
      const dur = video.duration && isFinite(video.duration) ? video.duration : 1;
      // 全体に散らばるように数点サンプリング
      for (let i = 1; i <= count; i++) {
        targets.push((dur * i) / (count + 1));
      }
      video.currentTime = targets[0];
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.85));
      idx++;
      if (idx < targets.length) {
        video.currentTime = targets[idx];
      } else {
        URL.revokeObjectURL(url);
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
  });
}

// ---------- 画像プレビュー描画 ----------
function renderPreviews() {
  const box = $('#previews');
  box.innerHTML = '';
  state.images.forEach((src, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
    wrap.innerHTML = `<img src="${src}" alt="preview ${i + 1}" />`;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.onclick = () => {
      state.images.splice(i, 1);
      renderPreviews();
      if (state.images.length === 0) $('#hint-box').classList.add('hidden');
    };
    wrap.appendChild(del);
    box.appendChild(wrap);
  });
  $('#hint-box').classList.toggle('hidden', state.images.length === 0);
}

// ---------- 写真入力 ----------
$('#photo-input').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    const raw = await readFile(file);
    const small = await shrinkImage(raw);
    state.images.push(small);
  }
  if (state.images.length > 4) state.images = state.images.slice(0, 4);
  renderPreviews();
  e.target.value = '';
});

// ---------- 動画入力 ----------
$('#video-input').addEventListener('change', async (e) => {
  const file = (e.target.files || [])[0];
  if (!file) return;
  toast('動画からフレームを抽出中…');
  const frames = await extractFrames(file, 3);
  if (frames.length === 0) {
    toast('動画を読み込めませんでした');
    return;
  }
  for (const f of frames) {
    const small = await shrinkImage(f);
    state.images.push(small);
  }
  if (state.images.length > 4) state.images = state.images.slice(0, 4);
  renderPreviews();
  e.target.value = '';
});

// ---------- AI解析 ----------
$('#analyze-btn').addEventListener('click', async () => {
  if (state.images.length === 0) return;
  $('#hint-box').classList.add('hidden');
  $('#product-form').classList.add('hidden');
  $('#analyzing').classList.remove('hidden');

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: state.images, hint: $('#hint').value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '解析に失敗しました');
    fillForm(data.product);
    $('#product-form').classList.remove('hidden');
    if (data.product._mock) {
      toast('デモモード：サンプルの商品情報です');
    }
  } catch (err) {
    toast(err.message);
    $('#hint-box').classList.remove('hidden');
  } finally {
    $('#analyzing').classList.add('hidden');
  }
});

function fillForm(p) {
  $('#f-title').value = p.title || '';
  $('#f-price').value = p.suggestedPrice || p.price || '';
  $('#f-category').value = p.category || '';
  $('#f-condition').value = p.condition || '';
  $('#f-description').value = p.description || '';
  $('#f-tags').value = (p.tags || []).join(', ');
  const pr = $('#price-reason');
  if (p.priceReason) {
    pr.textContent = `💡 ${p.priceReason}`;
    pr.classList.remove('hidden');
  } else {
    pr.classList.add('hidden');
  }
}

// ---------- やり直す ----------
$('#cancel-btn').addEventListener('click', () => {
  $('#product-form').classList.add('hidden');
  $('#hint-box').classList.remove('hidden');
});

// ---------- 出品 ----------
$('#product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#list-btn');
  btn.disabled = true;
  btn.textContent = '出品中…';

  const product = {
    title: $('#f-title').value.trim(),
    suggestedPrice: Number($('#f-price').value),
    category: $('#f-category').value.trim(),
    condition: $('#f-condition').value.trim(),
    description: $('#f-description').value.trim(),
    tags: $('#f-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
    priceReason: '',
  };

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, images: state.images }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '出品に失敗しました');
    toast('🎉 出品しました！');
    resetSell();
    // ショップタブへ
    document.querySelector('.tab[data-view="shop"]').click();
  } catch (err) {
    toast(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'この内容で出品する';
  }
});

function resetSell() {
  state.images = [];
  $('#hint').value = '';
  renderPreviews();
  $('#product-form').classList.add('hidden');
  $('#hint-box').classList.add('hidden');
}

// ---------- ショップ読み込み ----------
async function loadShop() {
  const grid = $('#grid');
  const countEl = $('#shop-count');
  countEl.textContent = '読み込み中…';
  try {
    const res = await fetch('/api/items');
    const { items } = await res.json();
    grid.innerHTML = '';
    if (!items || items.length === 0) {
      $('#empty').classList.remove('hidden');
      countEl.textContent = '';
      return;
    }
    $('#empty').classList.add('hidden');
    const onSale = items.filter((i) => i.status !== 'sold').length;
    countEl.textContent = `${items.length}点の商品（販売中 ${onSale}点）`;
    items.forEach((item) => grid.appendChild(cardEl(item)));
  } catch {
    countEl.textContent = '読み込みに失敗しました';
  }
}

function cardEl(item) {
  const card = document.createElement('div');
  card.className = 'card';
  const img = item.images && item.images[0]
    ? `<img class="card-img" src="${item.images[0]}" alt="${escapeHtml(item.title)}" />`
    : `<div class="card-img no-img">📦</div>`;
  const sold = item.status === 'sold' ? `<span class="sold-badge">SOLD</span>` : '';
  card.innerHTML = `
    ${sold}
    ${img}
    <div class="card-body">
      <p class="card-title">${escapeHtml(item.title)}</p>
      <span class="card-price"><small>¥</small>${Number(item.price).toLocaleString()}</span>
    </div>`;
  card.onclick = () => openModal(item.id);
  return card;
}

// ---------- 商品詳細モーダル ----------
async function openModal(id) {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) return toast('商品が見つかりません');
  const { item } = await res.json();

  const imgs = (item.images || []).length
    ? `<div class="modal-imgs">${item.images.map((s) => `<img src="${s}" />`).join('')}</div>`
    : '';
  const tags = (item.tags || []).map((t) => `<span class="chip">#${escapeHtml(t)}</span>`).join('');
  const soldNote = item.status === 'sold' ? '<p style="color:#c0392b;font-weight:700">売り切れました</p>' : '';

  $('#modal-body').innerHTML = `
    ${imgs}
    <h2>${escapeHtml(item.title)}</h2>
    <p class="modal-price">¥${Number(item.price).toLocaleString()}</p>
    <div class="modal-meta">
      ${item.category ? `<span class="chip">${escapeHtml(item.category)}</span>` : ''}
      ${item.condition ? `<span class="chip">${escapeHtml(item.condition)}</span>` : ''}
      ${item.brand ? `<span class="chip">${escapeHtml(item.brand)}</span>` : ''}
    </div>
    <p class="modal-desc">${escapeHtml(item.description)}</p>
    <div class="modal-meta">${tags}</div>
    ${soldNote}
    <div class="modal-actions">
      <button class="primary-btn buy-btn" ${item.status === 'sold' ? 'disabled' : ''} data-buy="${item.id}">
        ${item.status === 'sold' ? '売り切れ' : '🛒 購入する'}
      </button>
      <button class="del-btn" data-del="${item.id}">削除</button>
    </div>`;

  const buyBtn = $('#modal-body [data-buy]');
  if (buyBtn) buyBtn.onclick = () => buy(item.id);
  $('#modal-body [data-del]').onclick = () => del(item.id);

  $('#modal').classList.remove('hidden');
}

$('#modal-close').onclick = () => $('#modal').classList.add('hidden');
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') $('#modal').classList.add('hidden');
});

async function buy(id) {
  const res = await fetch(`/api/items/${id}/buy`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) return toast(data.error || '購入に失敗しました');
  toast('💰 ご購入ありがとうございます！');
  $('#modal').classList.add('hidden');
  loadShop();
}

async function del(id) {
  if (!confirm('この商品を削除しますか？')) return;
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (!res.ok) return toast('削除に失敗しました');
  toast('削除しました');
  $('#modal').classList.add('hidden');
  loadShop();
}

// ---------- ユーティリティ ----------
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

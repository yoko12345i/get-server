/**
 * Procedural editorial imagery.
 *
 * Prototype 用の画像はすべてコード生成の抽象ビジュアルです。
 * Real restaurant photography is deliberately not used: every venue in this
 * prototype is fictional, so borrowed photographs would misrepresent a real
 * place. These compositions carry the tone (still, warm, low-light) without
 * claiming to depict anything.
 */

const rngFrom = (seed) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const defs = (uid, palette) => `
  <defs>
    <radialGradient id="pool-${uid}" cx="50%" cy="52%" r="62%">
      <stop offset="0%" stop-color="${palette[2]}" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="${palette[1]}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ground-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette[1]}" stop-opacity="0.30"/>
      <stop offset="48%" stop-color="${palette[0]}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${palette[0]}" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="liquid-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${palette[2]}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${palette[1]}" stop-opacity="0.85"/>
    </linearGradient>
    <filter id="soft-${uid}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="grain-${uid}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.14"/></feComponentTransfer>
    </filter>
  </defs>`;

function dish(rand, uid, palette) {
  const cx = 200 + (rand() - 0.5) * 24;
  const cy = 162 + (rand() - 0.5) * 12;
  const blobs = Array.from({ length: 3 }, (_, i) => {
    const a = rand() * Math.PI * 2;
    const rr = 22 + rand() * 26;
    const bx = cx + Math.cos(a) * rr;
    const by = cy + Math.sin(a) * rr * 0.42;
    const s = 9 + rand() * 13;
    return `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * 0.62).toFixed(1)}"
      fill="${i === 1 ? palette[2] : palette[1]}" opacity="${(0.5 + rand() * 0.4).toFixed(2)}"/>`;
  }).join('');
  return `
    <ellipse cx="${cx}" cy="${cy + 6}" rx="132" ry="46" fill="${palette[1]}" opacity="0.20" filter="url(#soft-${uid})"/>
    <ellipse cx="${cx}" cy="${cy}" rx="112" ry="38" fill="none" stroke="${palette[2]}" stroke-opacity="0.32" stroke-width="1"/>
    <ellipse cx="${cx}" cy="${cy}" rx="86" ry="29" fill="${palette[0]}" opacity="0.55"/>
    ${blobs}
    <path d="M ${cx - 96} ${cy - 22} q 96 -34 192 0" fill="none" stroke="${palette[2]}" stroke-opacity="0.18" stroke-width="1"/>`;
}

function glass(rand, uid, palette) {
  const cx = 200 + (rand() - 0.5) * 30;
  const top = 74;
  const bowlH = 72 + rand() * 12;
  const rx = 40;
  return `
    <ellipse cx="${cx}" cy="252" rx="96" ry="20" fill="${palette[1]}" opacity="0.26" filter="url(#soft-${uid})"/>
    <path d="M ${cx - rx} ${top} h ${rx * 2} a ${rx} ${bowlH} 0 0 1 ${-rx * 2} 0 z"
      fill="${palette[0]}" opacity="0.5" stroke="${palette[2]}" stroke-opacity="0.42" stroke-width="1.2"/>
    <path d="M ${cx - rx * 0.78} ${top + bowlH * 0.34} a ${rx * 0.78} ${bowlH * 0.62} 0 0 0 ${rx * 1.56} 0 z"
      fill="url(#liquid-${uid})" opacity="0.9"/>
    <ellipse cx="${cx}" cy="${top + bowlH * 0.34}" rx="${rx * 0.78}" ry="${rx * 0.2}" fill="${palette[2]}" opacity="0.55"/>
    <rect x="${cx - 2}" y="${top + bowlH + 2}" width="4" height="52" fill="${palette[2]}" opacity="0.38"/>
    <ellipse cx="${cx}" cy="${top + bowlH + 58}" rx="34" ry="9" fill="${palette[2]}" opacity="0.30"/>
    <path d="M ${cx - rx * 0.6} ${top + 12} q 6 30 2 58" fill="none" stroke="#fff" stroke-opacity="0.22" stroke-width="2"/>`;
}

function room(rand, uid, palette) {
  const horizon = 168 + (rand() - 0.5) * 16;
  const wx = 42 + rand() * 34;          // window
  const lx = 286 + (rand() - 0.5) * 30; // pendant
  const tx = 232 + (rand() - 0.5) * 24; // table
  const ty = horizon + 54;
  return `
    <rect x="0" y="0" width="400" height="${horizon}" fill="${palette[0]}"/>
    <rect x="0" y="${horizon}" width="400" height="${300 - horizon}" fill="${palette[1]}" opacity="0.12"/>
    <line x1="0" y1="${horizon}" x2="400" y2="${horizon}" stroke="${palette[2]}" stroke-opacity="0.14"/>

    <!-- window, warm from outside -->
    <rect x="${wx}" y="${horizon - 108}" width="84" height="104" fill="${palette[2]}" opacity="0.17"/>
    <rect x="${wx}" y="${horizon - 108}" width="84" height="104" fill="none" stroke="${palette[2]}" stroke-opacity="0.30"/>
    <line x1="${wx + 42}" y1="${horizon - 108}" x2="${wx + 42}" y2="${horizon - 4}" stroke="${palette[0]}" stroke-opacity="0.55"/>
    <rect x="${wx - 16}" y="${horizon - 116}" width="116" height="120" fill="${palette[2]}" opacity="0.10" filter="url(#soft-${uid})"/>

    <!-- pendant over the table -->
    <line x1="${lx}" y1="0" x2="${lx}" y2="${horizon - 96}" stroke="${palette[2]}" stroke-opacity="0.22"/>
    <path d="M ${lx - 13} ${horizon - 82} l 13 -16 l 13 16 z" fill="${palette[2]}" opacity="0.50"/>
    <circle cx="${lx}" cy="${horizon - 74}" r="38" fill="${palette[2]}" opacity="0.20" filter="url(#soft-${uid})"/>

    <!-- table, lit from above -->
    <ellipse cx="${tx}" cy="${ty}" rx="104" ry="30" fill="${palette[1]}" opacity="0.34"/>
    <ellipse cx="${tx}" cy="${ty - 3}" rx="104" ry="30" fill="none" stroke="${palette[2]}" stroke-opacity="0.42"/>
    <ellipse cx="${tx - 34}" cy="${ty - 4}" rx="17" ry="5.5" fill="${palette[2]}" opacity="0.42"/>
    <ellipse cx="${tx + 30}" cy="${ty + 3}" rx="17" ry="5.5" fill="${palette[2]}" opacity="0.34"/>
    <ellipse cx="${tx}" cy="${ty - 12}" rx="60" ry="14" fill="${palette[2]}" opacity="0.10" filter="url(#soft-${uid})"/>`;
}

function counter(rand, uid, palette) {
  const y = 168 + (rand() - 0.5) * 16;
  const seats = Array.from({ length: 4 }, (_, i) => {
    const x = 62 + i * 92 + (rand() - 0.5) * 12;
    return `<ellipse cx="${x.toFixed(0)}" cy="${(y - 8).toFixed(0)}" rx="26" ry="8" fill="${palette[2]}" opacity="0.22"/>
            <ellipse cx="${x.toFixed(0)}" cy="${(y - 10).toFixed(0)}" rx="13" ry="4" fill="${palette[2]}" opacity="0.4"/>`;
  }).join('');
  return `
    <rect x="0" y="0" width="400" height="${y - 30}" fill="${palette[0]}"/>
    <path d="M -20 ${y} L 420 ${y - 22} L 420 ${y + 40} L -20 ${y + 58} Z" fill="${palette[1]}" opacity="0.42"/>
    <path d="M -20 ${y} L 420 ${y - 22}" stroke="${palette[2]}" stroke-opacity="0.5" stroke-width="1.4" fill="none"/>
    ${seats}
    <rect x="0" y="${y - 96}" width="400" height="26" fill="${palette[2]}" opacity="0.12" filter="url(#soft-${uid})"/>`;
}

const SHAPES = { dish, glass, room, counter };

/**
 * @param {'dish'|'glass'|'room'|'counter'} kind
 * @param {string[]} palette [ground, mid, light]
 * @param {string} seed
 */
let uidCounter = 0;

export function art(kind, palette, seed) {
  // ids must be unique per document — two SVGs sharing a gradient id would
  // otherwise borrow each other's palette.
  const uid = ++uidCounter;
  const rand = rngFrom(seed + kind);
  const body = (SHAPES[kind] || dish)(rand, uid, palette);
  return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    ${defs(uid, palette)}
    <rect width="400" height="300" fill="url(#ground-${uid})"/>
    <rect width="400" height="300" fill="url(#pool-${uid})"/>
    ${body}
    <rect width="400" height="300" filter="url(#grain-${uid})" opacity="0.5"/>
  </svg>`;
}

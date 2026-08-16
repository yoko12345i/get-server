/* ============================================================
   UNDERCURRENT — router
   単一シェル（index.html）+ pathname によるルーティング
   ============================================================ */

import { mount } from './ui.js';
import * as P from './pages.js';

const ROUTES = {
  '/': { nav: 'home', title: 'Undercurrent — A network of extraordinary taste experiences', render: P.home },
  '/creators': { nav: 'creators', title: 'Discover Creators — Undercurrent', render: P.creatorsPage, bind: P.creatorsPageBind },
  '/creator': { nav: 'creators', title: 'Creator — Undercurrent', render: P.creatorPage },
  '/pass': { nav: 'creators', title: 'Creator Pass — Undercurrent', render: P.passPage },
  '/experiences': { nav: 'experiences', title: 'Experiences — Undercurrent', render: P.experiencesPage },
  '/experience': { nav: 'experiences', title: 'Experience — Undercurrent', render: P.experiencePage },
  '/table': { nav: 'experiences', title: "Creator's Table — Undercurrent", render: P.tablePage },
  '/lab': { nav: 'lab', title: 'COLDRAW Lab — Undercurrent', render: P.labPage },
  '/me': { nav: 'me', title: 'My Record — Undercurrent', render: P.mePage },
  '/share': { nav: 'me', title: 'Shareable Record — Undercurrent', render: P.sharePage }
};

function notFound() {
  return `<section class="section"><div class="wrap">
    <p class="label">404</p>
    <h1 class="h1" style="margin-top:18px">そのページはありません。</h1>
    <p style="margin-top:26px"><a class="textlink" href="/">Home へ戻る</a></p>
  </div></section>`;
}

function render() {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const route = ROUTES[path];

  document.title = route ? route.title : 'Not found — Undercurrent';
  mount(route ? route.nav : '', route ? route.render() : notFound());

  if (route && route.bind) route.bind();

  // ハッシュ指定があればそこへ
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

render();

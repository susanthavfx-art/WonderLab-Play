/* =========================================================
   WonderLab Play — Game Portal
   js/app.js  ·  Vanilla JS, Smart-TV & Multi-Device Ready
   ---------------------------------------------------------
   Sections:
   1. Config & seed data
   2. Local storage & Supabase Cloud Sync
   3. Utilities
   4. Rendering (grid, filters, categories, spotlight, stats)
   5. Search / filter / sort
   6. Modals
   7. Owner mode (login, add, edit, delete + cloud sync)
   8. Smart Launch, QR Bridge, Details, Play modal & Arcade
   9. Smart TV Mode & Remote D-Pad spatial navigation
   10. Ambient effects & init
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1. CONFIG & SEED DATA
   --------------------------------------------------------- */

const CONFIG = {
  // Owner password is "wonderlab2026" (verified via Supabase RPC + local hash fallback)
  ownerToken: '2f9d04b4', // djb2("wl$" + password)
  storageKey: 'wonderlab.games.v2',
  sessionKey: 'wonderlab.owner.v1',
  sessionPwKey: 'wonderlab.owner.pw.v1',
  tvModeKey: 'wonderlab.tv.v1',
  bestKey: 'wonderlab.arcade.best.v1',
  adminPasswordHint: 'wonderlab2026',

  // Supabase Cloud Sync (wonderlab.app project — public anon key + RLS)
  supabaseUrl: 'https://zptfctcsjauobncvenne.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdGZjdGNzamF1b2JuY3Zlbm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NTM2NjEsImV4cCI6MjEwODUyOTY2MX0.U3j4XIiK2HWEX_O4ZPT7RTJo9E8HpI7kBe_Cs5KKSCM',

  // Public GitHub Pages URL fallback when opened from local file://
  publicPortalUrl: 'https://susanthavfx-art.github.io/WonderLab-Play/'
};

const CATEGORIES = [
  { id: 'motion',    name: 'Motion',    emoji: '⚡', a: 'rgba(41,195,255,.55)',  b: '#29c3ff' },
  { id: 'kids',      name: 'Kids',      emoji: '🧸', a: 'rgba(255,79,216,.5)',   b: '#ff4fd8' },
  { id: 'adventure', name: 'Adventure', emoji: '🧭', a: 'rgba(139,92,246,.55)',  b: '#a78bfa' },
  { id: 'sports',    name: 'Sports',    emoji: '🏀', a: 'rgba(255,165,31,.5)',   b: '#ffa51f' },
  { id: 'web-ar',    name: 'Web AR',    emoji: '🪄', a: 'rgba(52,227,122,.45)',  b: '#34e37a' }
];

const SEED_GAMES = [
  {
    id: 'immersive-workout',
    title: 'Immersive Workout',
    desc: 'Jump, squat and stretch with your camera — your living room becomes a magic gym!',
    category: 'motion',
    cover: 'assets/covers/immersive-workout.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop'],
    badge: 'Featured',
    emoji: '⚡',
    players: '1 Player',
    time: '10 mins',
    createdAt: 1795300000000
  },
  {
    id: 'cosmic-bubble-pop',
    title: 'Cosmic Bubble Pop',
    desc: 'Pop shimmering space bubbles and chain starry sparkles across the galaxy.',
    category: 'kids',
    cover: 'assets/covers/cosmic-bubble-pop.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: 'Hot',
    emoji: '🫧',
    players: '1-2 Players',
    time: '5 mins',
    createdAt: 1794695200000
  },
  {
    id: 'dino-dash',
    title: 'Dino Dash',
    desc: 'Sprint through jungles with a tiny dino, grab gems and dodge wobbly rocks.',
    category: 'adventure',
    cover: 'assets/covers/dino-dash.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '🦖',
    players: '1 Player',
    time: '8 mins',
    createdAt: 1794090400000
  },
  {
    id: 'abc-star-quest',
    title: 'ABC Star Quest',
    desc: 'Fly a smiley rocket, collect letter stars and spell your very first words.',
    category: 'kids',
    cover: 'assets/covers/abc-star-quest.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: 'New',
    emoji: '🚀',
    players: '1 Player',
    time: '6 mins',
    createdAt: 1795100000000
  },
  {
    id: 'shape-builder-3d',
    title: 'Shape Builder 3D',
    desc: 'Stack glowing cubes and cones into castles, rockets and silly monsters.',
    category: 'kids',
    cover: 'assets/covers/shape-builder-3d.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '🧊',
    players: '1 Player',
    time: '7 mins',
    createdAt: 1793485600000
  },
  {
    id: 'space-hoops',
    title: 'Space Hoops',
    desc: 'Shoot glowing basketballs into floating hoops in zero gravity.',
    category: 'sports',
    cover: 'assets/covers/space-hoops.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '🏀',
    players: '1-2 Players',
    time: '5 mins',
    createdAt: 1792880800000
  },
  {
    id: 'magic-paint-ar',
    title: 'Magic Paint AR',
    desc: 'Wave your hands to paint rainbows that float right inside your room.',
    category: 'web-ar',
    cover: 'assets/covers/magic-paint-ar.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'fullscreen',
    devices: ['phone', 'laptop'],
    badge: '',
    emoji: '🪄',
    players: '1 Player',
    time: '6 mins',
    createdAt: 1792276000000
  },
  {
    id: 'monster-math',
    title: 'Monster Math',
    desc: 'Feed hungry monsters the right numbers before they get hangry!',
    category: 'kids',
    cover: 'assets/covers/monster-math.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '👾',
    players: '1 Player',
    time: '6 mins',
    createdAt: 1791671200000
  },
  {
    id: 'puzzle-planets',
    title: 'Puzzle Planets',
    desc: 'Snap glowing planets back together and rebuild the solar system.',
    category: 'adventure',
    cover: 'assets/covers/puzzle-planets.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '🪐',
    players: '1 Player',
    time: '9 mins',
    createdAt: 1791066400000
  },
  {
    id: 'ar-animal-safari',
    title: 'AR Animal Safari',
    desc: 'Bring friendly giraffes and elephants into your room and snap safari photos.',
    category: 'web-ar',
    cover: 'assets/covers/ar-animal-safari.jpg',
    link: '',
    phoneUrl: '',
    launchMode: 'fullscreen',
    devices: ['phone', 'laptop'],
    badge: '',
    emoji: '🦒',
    players: '1-2 Players',
    time: '8 mins',
    createdAt: 1790461600000
  },
  {
    id: 'super-sumo-smash',
    title: 'Super Sumo Smash',
    desc: 'Bounce, bump and wobble your way to the top of the bouncy sumo ring!',
    category: 'sports',
    cover: '',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '🥋',
    players: '2 Players',
    time: '4 mins',
    createdAt: 1789856800000
  },
  {
    id: 'story-spark',
    title: 'Story Spark',
    desc: 'Team up with a friendly dragon and build your own animated storybook.',
    category: 'adventure',
    cover: '',
    link: '',
    phoneUrl: '',
    launchMode: 'modal',
    devices: ['phone', 'laptop', 'tv'],
    badge: '',
    emoji: '📖',
    players: '1 Player',
    time: '12 mins',
    createdAt: 1789252000000
  }
];

function normalizeGame(raw) {
  const cat = raw.category || 'kids';
  const defaultDevices = (cat === 'web-ar' || cat === 'motion')
    ? ['phone', 'laptop']
    : ['phone', 'laptop', 'tv'];
  const devArr = Array.isArray(raw.devices) && raw.devices.length
    ? raw.devices
    : defaultDevices;
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'Untitled'),
    desc: String(raw.desc !== undefined ? raw.desc : (raw.description || '')),
    category: cat,
    cover: String(raw.cover || ''),
    link: String(raw.link || ''),
    phoneUrl: String(raw.phoneUrl !== undefined ? raw.phoneUrl : (raw.phone_url || '')),
    launchMode: String(raw.launchMode || raw.launch_mode || 'modal'),
    devices: devArr,
    badge: String(raw.badge || ''),
    emoji: String(raw.emoji || '🎮'),
    players: String(raw.players || ''),
    time: String(raw.time !== undefined ? raw.time : (raw.play_time || '')),
    sortOrder: Number(raw.sortOrder !== undefined ? raw.sortOrder : (raw.sort_order || 0)),
    createdAt: Number(raw.createdAt !== undefined ? raw.createdAt : (raw.created_at || Date.now()))
  };
}

/* ---------------------------------------------------------
   2. STORAGE & SUPABASE CLOUD SYNC
   --------------------------------------------------------- */

const store = {
  loadGames() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return SEED_GAMES.map(normalizeGame);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return SEED_GAMES.map(normalizeGame);
      return parsed.map(normalizeGame);
    } catch (e) {
      return SEED_GAMES.map(normalizeGame);
    }
  },
  saveGames(games) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(games));
      return true;
    } catch (e) {
      toast('Local cache is full — try a smaller cover image.', 'error');
      return false;
    }
  },
  isOwner() {
    try { return sessionStorage.getItem(CONFIG.sessionKey) === '1'; } catch (e) { return false; }
  },
  ownerPassword() {
    try { return sessionStorage.getItem(CONFIG.sessionPwKey) || ''; } catch (e) { return ''; }
  },
  setOwner(on, pw) {
    try {
      if (on) {
        sessionStorage.setItem(CONFIG.sessionKey, '1');
        if (pw) sessionStorage.setItem(CONFIG.sessionPwKey, pw);
      } else {
        sessionStorage.removeItem(CONFIG.sessionKey);
        sessionStorage.removeItem(CONFIG.sessionPwKey);
      }
    } catch (e) { /* ignore */ }
  },
  loadTvPref() {
    try { return localStorage.getItem(CONFIG.tvModeKey); } catch (e) { return null; }
  },
  saveTvPref(on) {
    try { localStorage.setItem(CONFIG.tvModeKey, on ? '1' : '0'); } catch (e) { /* ignore */ }
  },
  bestScore() {
    try { return Number(localStorage.getItem(CONFIG.bestKey)) || 0; } catch (e) { return 0; }
  },
  setBestScore(n) {
    try { localStorage.setItem(CONFIG.bestKey, String(n)); } catch (e) { /* ignore */ }
  }
};

const cloud = {
  enabled() {
    return Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && typeof fetch === 'function');
  },
  headers() {
    return {
      'apikey': CONFIG.supabaseAnonKey,
      'Authorization': 'Bearer ' + CONFIG.supabaseAnonKey,
      'Content-Type': 'application/json'
    };
  },
  fetchWithTimeout(url, options, ms) {
    const timeoutMs = ms || 6500;
    if (typeof AbortController === 'undefined') {
      return fetch(url, options);
    }
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, timeoutMs);
    const merged = Object.assign({}, options, { signal: ctrl.signal });
    return fetch(url, merged).finally(function () { clearTimeout(timer); });
  },
  async syncFromCloud(showToast) {
    if (!this.enabled()) {
      setSyncUi('offline');
      return false;
    }
    try {
      const url = CONFIG.supabaseUrl + '/rest/v1/portal_games?select=*&order=sort_order.asc,created_at.desc';
      const res = await this.fetchWithTimeout(url, { method: 'GET', headers: this.headers() }, 6500);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      if (Array.isArray(rows)) {
        const fresh = rows.map(normalizeGame);
        const changed = JSON.stringify(fresh) !== JSON.stringify(state.games);
        state.games = fresh;
        store.saveGames(state.games);
        setSyncUi('synced');
        if (changed) renderAll();
        if (showToast) toast('Synced ' + state.games.length + ' games from WonderLab Cloud.', 'success');
        return true;
      }
    } catch (e) {
      setSyncUi('offline');
      if (showToast) toast('Offline — showing cached games on this device.', 'info');
    }
    return false;
  },
  async verifyPassword(pass) {
    if (!this.enabled()) return tryLogin(pass);
    try {
      const res = await this.fetchWithTimeout(
        CONFIG.supabaseUrl + '/rest/v1/rpc/portal_verify_owner',
        { method: 'POST', headers: this.headers(), body: JSON.stringify({ p_pass: pass }) },
        5500
      );
      if (!res.ok) return tryLogin(pass);
      const ok = await res.json();
      return Boolean(ok);
    } catch (e) {
      return tryLogin(pass);
    }
  },
  async upsertGame(game) {
    const pw = store.ownerPassword() || CONFIG.adminPasswordHint;
    if (!this.enabled() || !pw) return { ok: false, offline: true };
    try {
      const res = await this.fetchWithTimeout(
        CONFIG.supabaseUrl + '/rest/v1/rpc/portal_upsert_game',
        { method: 'POST', headers: this.headers(), body: JSON.stringify({ p_pass: pw, p_game: game }) },
        8000
      );
      if (!res.ok) {
        const errBody = await res.text();
        return { ok: false, error: errBody };
      }
      const saved = await res.json();
      setSyncUi('synced');
      return { ok: true, row: normalizeGame(saved) };
    } catch (e) {
      setSyncUi('offline');
      return { ok: false, offline: true };
    }
  },
  async deleteGame(id) {
    const pw = store.ownerPassword() || CONFIG.adminPasswordHint;
    if (!this.enabled() || !pw) return { ok: false, offline: true };
    try {
      const res = await this.fetchWithTimeout(
        CONFIG.supabaseUrl + '/rest/v1/rpc/portal_delete_game',
        { method: 'POST', headers: this.headers(), body: JSON.stringify({ p_pass: pw, p_id: id }) },
        6500
      );
      if (!res.ok) return { ok: false };
      setSyncUi('synced');
      return { ok: true };
    } catch (e) {
      setSyncUi('offline');
      return { ok: false, offline: true };
    }
  }
};

/* ---------------------------------------------------------
   3. UTILITIES
   --------------------------------------------------------- */

const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

const state = {
  games: store.loadGames(),
  category: 'all',
  query: '',
  sort: 'featured',
  editingId: null,
  pendingDeleteId: null,
  coverDraft: '',
  lastFocus: null,
  tvMode: false,
  syncStatus: 'connecting',
  gridAnimatedOnce: false
};

function setSyncUi(mode) {
  state.syncStatus = mode;
  const ownerBadge = $('#cloudSyncBadge');
  const pubPill = $('#publicSyncPill');
  const isSynced = mode === 'synced';
  if (ownerBadge) {
    ownerBadge.textContent = isSynced ? '☁️ Cloud Synced' : '💾 Local Cache';
    ownerBadge.classList.toggle('is-offline', !isSynced);
  }
  if (pubPill) {
    pubPill.textContent = isSynced ? '☁️ Cloud Synced' : '💾 Cached';
    pubPill.classList.toggle('is-offline', !isSynced);
    pubPill.title = isSynced
      ? 'Live-synced with WonderLab Supabase Cloud across Phone, Laptop & Smart TV'
      : 'Using cached catalog on this browser';
  }
}

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) & 0xffffffff;
  }
  return (h >>> 0).toString(16);
}

function escapeHtml(str) {
  return String(str === undefined || str === null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlight(text, query) {
  const safe = escapeHtml(text);
  if (!query) return safe;
  const q = query.trim();
  if (!q) return safe;
  const pattern = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp('(' + pattern + ')', 'ig'), '<mark>$1</mark>');
}

function categoryOf(id) {
  return CATEGORIES.find(function (c) { return c.id === id; }) ||
    { id: id, name: id, emoji: '🎮', a: 'rgba(255,255,255,.4)', b: '#ffffff' };
}

function uid() {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function isNew(game) {
  const days = (Date.now() - Number(game.createdAt || 0)) / 86400000;
  return days >= 0 && days < 14;
}

function sanitizeUrl(url) {
  const v = String(url || '').trim();
  if (!v) return '';
  try {
    const u = new URL(v, window.location.href);
    if (u.protocol === 'http:' || u.protocol === 'https:') return v;
  } catch (e) { /* ignore */ }
  return '';
}

function portalUrlForShare(hashSuffix) {
  let base = CONFIG.publicPortalUrl;
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    base = window.location.origin + window.location.pathname;
  }
  return hashSuffix ? base + hashSuffix : base;
}

function qrTargetUrl(game) {
  if (!game) return portalUrlForShare('');
  if (game.phoneUrl) return game.phoneUrl;
  if (game.link) return game.link;
  return portalUrlForShare('#game=' + encodeURIComponent(game.id));
}

function deviceBadgesText(devices) {
  const d = Array.isArray(devices) ? devices : ['phone', 'laptop', 'tv'];
  const icons = [];
  if (d.indexOf('phone') > -1) icons.push('📱');
  if (d.indexOf('laptop') > -1) icons.push('💻');
  if (d.indexOf('tv') > -1) icons.push('📺');
  return icons.join(' ');
}

function toast(message, type) {
  const kind = type || 'success';
  const wrap = $('#toasts');
  if (!wrap) return;
  const icons = { success: '✓', error: '!', info: 'i' };
  const el = document.createElement('div');
  el.className = 'toast toast--' + kind;
  el.innerHTML = '<span class="toast-icon">' + (icons[kind] || '✓') + '</span><span>' + escapeHtml(message) + '</span>';
  wrap.appendChild(el);
  setTimeout(function () {
    el.classList.add('is-out');
    el.addEventListener('animationend', function () { el.remove(); }, { once: true });
  }, 2900);
}

function fileToCover(file) {
  return new Promise(function (resolve, reject) {
    if (!file.type || file.type.indexOf('image/') !== 0) return reject(new Error('Please choose an image file.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Image is too large (max 8 MB).'));
    const reader = new FileReader();
    reader.onerror = function () { reject(new Error('Could not read that file.')); };
    reader.onload = function () {
      const img = new Image();
      img.onerror = function () { reject(new Error('Could not open that image.')); };
      img.onload = function () {
        const maxW = 1000;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------
   4. RENDERING
   --------------------------------------------------------- */

function sortedGames() {
  const list = state.games.slice();
  if (state.sort === 'az') {
    list.sort(function (a, b) { return a.title.localeCompare(b.title); });
  } else if (state.sort === 'newest') {
    list.sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
  } else {
    list.sort(function (a, b) {
      const af = a.badge === 'Featured' ? 1 : 0;
      const bf = b.badge === 'Featured' ? 1 : 0;
      if (af !== bf) return bf - af;
      const ao = a.sortOrder || 9999;
      const bo = b.sortOrder || 9999;
      if (ao !== bo) return ao - bo;
      return Number(b.createdAt || 0) - Number(a.createdAt || 0);
    });
  }
  return list;
}

function visibleGames() {
  const q = state.query.trim().toLowerCase();
  return sortedGames().filter(function (game) {
    const catOk = state.category === 'all' || game.category === state.category;
    if (!catOk) return false;
    if (!q) return true;
    const cat = categoryOf(game.category);
    const haystack = [game.title, game.desc, cat.name, game.badge].join(' ').toLowerCase();
    return haystack.indexOf(q) > -1;
  });
}

function cardHTML(game, index) {
  const cat = categoryOf(game.category);
  const badges = [];
  if (game.badge === 'Featured') badges.push('<span class="badge badge--featured">★ Featured</span>');
  if (game.badge === 'New' || (!game.badge && isNew(game))) badges.push('<span class="badge badge--new">New</span>');
  if (game.badge === 'Hot') badges.push('<span class="badge badge--hot">🔥 Hot</span>');

  const devices = Array.isArray(game.devices) ? game.devices : ['phone', 'laptop', 'tv'];
  const tvSupported = devices.indexOf('tv') > -1;
  const playLabel = (state.tvMode && !tvSupported) ? 'Scan QR' : 'Play Now';

  const media = game.cover
    ? `<img src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.title)} cover" loading="${index < 4 ? 'eager' : 'lazy'}" onerror="this.style.display='none';this.nextElementSibling.hidden=false;" />
       <span class="card-fallback-emoji" hidden>${escapeHtml(game.emoji || cat.emoji)}</span>`
    : `<span class="card-fallback-emoji">${escapeHtml(game.emoji || cat.emoji)}</span>`;

  const animStyle = state.gridAnimatedOnce
    ? 'animation:none;'
    : `animation-delay:${Math.min(index, 10) * 45}ms`;

  return `
  <article class="card" tabindex="0" data-id="${escapeHtml(game.id)}" style="${animStyle}">
    <div class="card-media">
      ${media}
      <div class="card-badges">${badges.join('')}</div>
      <span class="card-cat">${cat.emoji} ${escapeHtml(cat.name)}</span>
      <button class="card-play-hover" type="button" tabindex="-1" data-play aria-label="Play ${escapeHtml(game.title)}">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>
          ${playLabel}
        </span>
      </button>
    </div>
    <div class="card-body">
      <h3 class="card-title">${highlight(game.title, state.query)}</h3>
      <p class="card-desc">${highlight(game.desc, state.query)}</p>
      <div class="card-meta">
        ${game.players ? `<span class="meta-pill">👤 ${escapeHtml(game.players)}</span>` : ''}
        ${game.time ? `<span class="meta-pill">⏱ ${escapeHtml(game.time)}</span>` : ''}
        <span class="meta-pill ${tvSupported ? 'meta-pill--devices' : 'meta-pill--cam'}" title="${tvSupported ? 'Works on Phone, Laptop & Smart TV' : 'Camera / AR game — Phone & Laptop (shows QR on TV)'}">
          ${tvSupported ? deviceBadgesText(devices) : '📷 Phone · Laptop'}
        </span>
      </div>
      <div class="card-foot">
        <button class="card-play" type="button" data-play>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg><span>${playLabel}</span>
        </button>
        <div class="card-actions-right">
          <button class="icon-btn icon-btn--qr" type="button" data-qr aria-label="Phone QR code for ${escapeHtml(game.title)}" title="Scan QR on Phone">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
              <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
              <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
              <path d="M14 14h3v3h-3zM18 14h2.5v2.5H18zM14 18h2.5v2.5H14zM17.5 17.5h3v3h-3z" fill="currentColor"/>
            </svg>
          </button>
          <div class="card-owner" ${store.isOwner() ? '' : 'hidden aria-hidden="true" tabindex="-1"'}>
            <button class="icon-btn" type="button" data-edit aria-label="Edit ${escapeHtml(game.title)}">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn icon-btn--danger" type="button" data-delete aria-label="Delete ${escapeHtml(game.title)}">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7m-7 0 1 12h8l1-12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const grid = $('#gameGrid');
  const list = visibleGames();
  const total = state.games.length;

  let html = list.map(function (g, i) { return cardHTML(g, i); }).join('');

  if (store.isOwner()) {
    html += `<button class="add-tile" type="button" data-open-add>
      <span class="add-tile-plus">＋</span>
      <span class="add-tile-title">Add New Game</span>
      <span class="add-tile-sub">Publish to Phone, Laptop &amp; TV</span>
    </button>`;
  }

  grid.innerHTML = html;
  state.gridAnimatedOnce = true;

  $('#emptyState').hidden = list.length !== 0;
  grid.hidden = list.length === 0 && !store.isOwner();

  const results = $('#resultsText');
  if (list.length === total && !state.query && state.category === 'all') {
    results.innerHTML = `Showing all <strong>${total}</strong> games`;
  } else {
    const catName = state.category === 'all' ? 'all categories' : categoryOf(state.category).name;
    results.innerHTML = `Found <strong>${list.length}</strong> of ${total} games in <strong>${escapeHtml(catName)}</strong>${state.query ? ` matching “${escapeHtml(state.query)}”` : ''}`;
  }

  $('#clearFilters').hidden = !(state.query || state.category !== 'all');
}

function renderFilters() {
  const wrap = $('#categoryFilters');
  const counts = {};
  state.games.forEach(function (g) { counts[g.category] = (counts[g.category] || 0) + 1; });

  const chips = [`<button class="filter-chip ${state.category === 'all' ? 'is-active' : ''}" data-filter="all" type="button">
      🌈 All <span class="chip-count">${state.games.length}</span>
    </button>`];

  CATEGORIES.forEach(function (cat) {
    chips.push(`<button class="filter-chip ${state.category === cat.id ? 'is-active' : ''}" data-filter="${cat.id}" type="button">
      ${cat.emoji} ${escapeHtml(cat.name)} <span class="chip-count">${counts[cat.id] || 0}</span>
    </button>`);
  });

  wrap.innerHTML = chips.join('');
}

function renderCategoryCards() {
  const wrap = $('#catCards');
  wrap.innerHTML = CATEGORIES.map(function (cat) {
    const count = state.games.filter(function (g) { return g.category === cat.id; }).length;
    return `
      <button class="cat-card" type="button" data-cat="${cat.id}" style="--cat-a:${cat.a};--cat-b:${cat.b}">
        <span class="cat-emoji">${cat.emoji}</span>
        <span class="cat-name">${escapeHtml(cat.name)}</span>
        <span class="cat-count">${count} game${count === 1 ? '' : 's'}</span>
        <span class="cat-arrow" aria-hidden="true">→</span>
      </button>`;
  }).join('');
}

function renderSpotlight() {
  const section = $('#spotlight');
  const card = $('#spotlightCard');
  const featured = sortedGames().find(function (g) { return g.badge === 'Featured'; }) || sortedGames()[0];
  if (!featured) { section.hidden = true; return; }

  const cat = categoryOf(featured.category);
  const devices = Array.isArray(featured.devices) ? featured.devices : ['phone', 'laptop', 'tv'];
  const tvSupported = devices.indexOf('tv') > -1;
  section.hidden = false;
  card.innerHTML = `
    <div class="spotlight-media">
      ${featured.cover
        ? `<img src="${escapeHtml(featured.cover)}" alt="${escapeHtml(featured.title)} cover" />`
        : `<div class="card-fallback-emoji" style="font-size:6rem">${escapeHtml(featured.emoji || cat.emoji)}</div>`}
    </div>
    <div class="spotlight-body">
      <span class="spotlight-flag">⭐ Game of the moment</span>
      <h2 class="spotlight-title">${escapeHtml(featured.title)}</h2>
      <p class="spotlight-desc">${escapeHtml(featured.desc)}</p>
      <div class="spotlight-meta">
        <span class="meta-pill">${cat.emoji} ${escapeHtml(cat.name)}</span>
        ${featured.players ? `<span class="meta-pill">👤 ${escapeHtml(featured.players)}</span>` : ''}
        ${featured.time ? `<span class="meta-pill">⏱ ${escapeHtml(featured.time)}</span>` : ''}
        <span class="meta-pill">${deviceBadgesText(devices)}</span>
      </div>
      <div class="spotlight-actions">
        <button class="btn btn--primary" type="button" data-play-game="${escapeHtml(featured.id)}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>
          ${state.tvMode && !tvSupported ? 'Scan Phone QR' : 'Play Now'}
        </button>
        <button class="btn btn--ghost" type="button" data-qr-game="${escapeHtml(featured.id)}">📱 Phone QR</button>
        <button class="btn btn--ghost" type="button" data-details-game="${escapeHtml(featured.id)}">More info</button>
      </div>
    </div>`;
}

function renderStats() {
  const gamesEl = $('[data-stat="games"]');
  if (gamesEl) gamesEl.textContent = state.games.length;
  const catsEl = $('[data-stat="cats"]');
  if (catsEl) catsEl.textContent = new Set(state.games.map(function (g) { return g.category; })).size;
}

function renderAll() {
  renderFilters();
  renderCategoryCards();
  renderGrid();
  renderSpotlight();
  renderStats();
  applyOwnerVisibility();
}

function applyOwnerVisibility() {
  const isOwner = store.isOwner();
  document.body.classList.toggle('is-owner', isOwner);
  $$('.admin-only').forEach(function (el) { el.hidden = !isOwner; });
  const bar = $('#ownerBar');
  if (bar) bar.hidden = !isOwner;
  const adminBtn = $('#adminBtn');
  if (adminBtn) adminBtn.classList.toggle('is-owner', isOwner);
}

/* ---------------------------------------------------------
   5. SEARCH / FILTER / SORT
   --------------------------------------------------------- */

function setCategory(id) {
  state.category = id;
  renderFilters();
  renderGrid();
}

let searchTimer = null;
function onSearchInput(value) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function () {
    state.query = value;
    renderGrid();
  }, 130);
}

/* ---------------------------------------------------------
   6. MODALS
   --------------------------------------------------------- */

const openModals = [];

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  if (openModals.indexOf(id) === -1) {
    state.lastFocus = document.activeElement;
    openModals.push(id);
  }
  modal.hidden = false;
  document.body.classList.add('modal-open');

  const focusTarget = modal.querySelector('input:not([type="hidden"]), textarea, select, button.btn--primary, .modal-close');
  if (focusTarget) {
    setTimeout(function () {
      focusTarget.focus({ preventScroll: true });
      if (state.tvMode) setTvHighlight(focusTarget);
    }, 60);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = true;
  if (id === 'playModal') closePlay();
  const idx = openModals.lastIndexOf(id);
  if (idx > -1) openModals.splice(idx, 1);
  if (!openModals.length) document.body.classList.remove('modal-open');
  if (state.lastFocus && document.contains(state.lastFocus)) {
    state.lastFocus.focus({ preventScroll: true });
    if (state.tvMode) setTvHighlight(state.lastFocus);
  }
}

function closeAllModals() {
  openModals.slice().forEach(closeModal);
}

document.addEventListener('click', function (e) {
  const closer = e.target.closest('[data-close]');
  if (closer) {
    const modal = closer.closest('.modal');
    if (modal) closeModal(modal.id);
  }
});

document.addEventListener('keydown', function (e) {
  // Escape or Smart TV Remote Back button closes topmost modal
  const isTvBack = e.keyCode === 461 || e.keyCode === 10009 || e.key === 'BrowserBack' || e.key === 'GoBack';
  const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
  const inField = tag === 'input' || tag === 'textarea' || tag === 'select';
  if ((e.key === 'Escape' || isTvBack || (state.tvMode && e.key === 'Backspace' && !inField)) && openModals.length) {
    e.preventDefault();
    closeModal(openModals[openModals.length - 1]);
    return;
  }
  // Focus trap
  if (e.key === 'Tab' && openModals.length) {
    const modal = document.getElementById(openModals[openModals.length - 1]);
    const focusables = $$('button:not([hidden]), [href], input:not([type="hidden"]), select, textarea', modal)
      .filter(function (el) { return el.offsetParent !== null && !el.disabled; });
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------------------------------------------------------
   7. OWNER MODE + SUPABASE WRITE SYNC
   --------------------------------------------------------- */

function tryLogin(password) {
  return djb2('wl$' + password) === CONFIG.ownerToken;
}

function openAdminLogin() {
  $('#adminForm').reset();
  $('#adminError').textContent = '';
  const af = $('#adminField');
  if (af) af.classList.remove('has-error');
  openModal('adminModal');
}

function enterOwnerMode(silent, pw) {
  store.setOwner(true, pw);
  closeModal('adminModal');
  applyOwnerVisibility();
  renderGrid();
  if (!silent) toast('Owner mode unlocked — changes sync to Cloud!', 'success');
}

function logoutOwner() {
  store.setOwner(false);
  applyOwnerVisibility();
  renderGrid();
  closeAllModals();
  toast('Logged out of owner mode.', 'info');
}

function setFormDevices(devices) {
  const d = Array.isArray(devices) ? devices : ['phone', 'laptop', 'tv'];
  $('#devPhone').checked = d.indexOf('phone') > -1;
  $('#devLaptop').checked = d.indexOf('laptop') > -1;
  $('#devTv').checked = d.indexOf('tv') > -1;
}

function getFormDevices() {
  const out = [];
  if ($('#devPhone').checked) out.push('phone');
  if ($('#devLaptop').checked) out.push('laptop');
  if ($('#devTv').checked) out.push('tv');
  return out.length ? out : ['phone', 'laptop'];
}

function resetGameForm() {
  state.editingId = null;
  state.coverDraft = '';
  $('#gameForm').reset();
  $('#gameId').value = '';
  $('#descCount').textContent = '0';
  $('#gameLaunchMode').value = 'modal';
  $('#gamePhoneUrl').value = '';
  setFormDevices(['phone', 'laptop', 'tv']);
  $$('.field-error').forEach(function (el) { el.textContent = ''; });
  $$('.field').forEach(function (el) { el.classList.remove('has-error'); });
  setCoverPreview('');
}

function fillCategorySelect() {
  $('#gameCategory').innerHTML = CATEGORIES
    .map(function (c) { return `<option value="${c.id}">${c.emoji} ${escapeHtml(c.name)}</option>`; })
    .join('');
}

function setCoverPreview(src) {
  const img = $('#coverPreviewImg');
  const empty = $('.cover-preview-empty');
  const clear = $('#coverPreviewClear');
  if (src) {
    img.src = src;
    img.hidden = false;
    empty.style.display = 'none';
    clear.hidden = false;
  } else {
    img.removeAttribute('src');
    img.hidden = true;
    empty.style.display = '';
    clear.hidden = true;
  }
}

function openAddGame() {
  if (!store.isOwner()) { openAdminLogin(); return; }
  resetGameForm();
  $('#gameModalTitle').textContent = 'Add New Game';
  $('#gameModalSub').textContent = 'Publish once — appears on Phone, Laptop & Smart TV.';
  $('#gameSaveBtn').textContent = 'Publish game';
  openModal('gameModal');
}

function openEditGame(id) {
  if (!store.isOwner()) return;
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;
  resetGameForm();
  state.editingId = id;
  state.coverDraft = game.cover || '';
  $('#gameModalTitle').textContent = 'Edit Game';
  $('#gameModalSub').textContent = 'Update the details and save your changes to WonderLab Cloud.';
  $('#gameSaveBtn').textContent = 'Save changes';
  $('#gameId').value = game.id;
  $('#gameTitle').value = game.title;
  $('#gameCategory').value = game.category;
  $('#gameDesc').value = game.desc;
  $('#descCount').textContent = String(game.desc.length);
  $('#gameCoverUrl').value = game.cover && game.cover.indexOf('data:') !== 0 && game.cover.indexOf('assets/') !== 0 ? game.cover : '';
  $('#gameLink').value = game.link || '';
  $('#gameLaunchMode').value = game.launchMode || 'modal';
  $('#gamePhoneUrl').value = game.phoneUrl || '';
  setFormDevices(game.devices);
  $('#gameBadge').value = game.badge || '';
  $('#gameEmoji').value = game.emoji || '';
  $('#gamePlayers').value = game.players || '';
  $('#gameTime').value = game.time || '';
  setCoverPreview(state.coverDraft);
  openModal('gameModal');
}

function validateGameForm() {
  let ok = true;
  const title = $('#gameTitle');
  const desc = $('#gameDesc');

  const setError = function (input, message) {
    const field = input.closest('.field');
    const err = field.querySelector('.field-error');
    if (message) {
      field.classList.add('has-error');
      if (err) err.textContent = message;
      ok = false;
    } else {
      field.classList.remove('has-error');
      if (err) err.textContent = '';
    }
  };

  setError(title, title.value.trim().length < 2 ? 'Give your game a title (at least 2 characters).' : '');
  setError(desc, desc.value.trim().length < 6 ? 'Add a short description so players know what it is.' : '');
  return ok;
}

async function saveGame(e) {
  e.preventDefault();
  if (!store.isOwner()) return;
  if (!validateGameForm()) return;

  const btn = $('#gameSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  const urlValue = sanitizeUrl($('#gameCoverUrl').value);
  const cover = state.coverDraft || urlValue;

  const data = {
    title: $('#gameTitle').value.trim().slice(0, 48),
    category: $('#gameCategory').value,
    desc: $('#gameDesc').value.trim().slice(0, 140),
    cover: cover,
    link: sanitizeUrl($('#gameLink').value),
    launchMode: $('#gameLaunchMode').value || 'modal',
    phoneUrl: sanitizeUrl($('#gamePhoneUrl').value),
    devices: getFormDevices(),
    badge: $('#gameBadge').value,
    emoji: $('#gameEmoji').value.trim().slice(0, 4) || '🎮',
    players: $('#gamePlayers').value.trim().slice(0, 18),
    time: $('#gameTime').value.trim().slice(0, 18)
  };

  let targetGame = null;
  const wasEditing = Boolean(state.editingId);

  if (wasEditing) {
    const idx = state.games.findIndex(function (g) { return g.id === state.editingId; });
    if (idx > -1) {
      targetGame = Object.assign({}, state.games[idx], data);
      state.games[idx] = targetGame;
    }
  } else {
    targetGame = normalizeGame(Object.assign({ id: uid(), createdAt: Date.now(), sortOrder: 0 }, data));
    state.games.unshift(targetGame);
  }

  store.saveGames(state.games);

  if (targetGame) {
    const cloudRes = await cloud.upsertGame(targetGame);
    if (cloudRes.ok) {
      toast(wasEditing ? `“${data.title}” synced to Cloud! ☁️` : `“${data.title}” published to Phone, Laptop & TV! 🎉`, 'success');
    } else {
      toast(wasEditing ? `“${data.title}” saved locally.` : `“${data.title}” published locally.`, 'info');
    }
  }

  btn.disabled = false;
  btn.textContent = wasEditing ? 'Save changes' : 'Publish game';
  closeModal('gameModal');
  renderAll();
}

function askDelete(id) {
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;
  state.pendingDeleteId = id;
  $('#confirmText').textContent = `“${game.title}” will be removed from Phone, Laptop & Smart TV.`;
  openModal('confirmModal');
}

async function doDelete() {
  const id = state.pendingDeleteId;
  if (!id) return;
  const game = state.games.find(function (g) { return g.id === id; });
  state.games = state.games.filter(function (g) { return g.id !== id; });
  store.saveGames(state.games);
  state.pendingDeleteId = null;
  closeModal('confirmModal');
  renderAll();
  await cloud.deleteGame(id);
  toast(`“${game ? game.title : 'Game'}” deleted.`, 'info');
}

/* ---------------------------------------------------------
   8. SMART LAUNCH, QR BRIDGE, DETAILS, PLAY MODAL & ARCADE
   --------------------------------------------------------- */

let detailsGameId = null;
let activePlayGameId = null;
let qrOverrideGameId = null;

function openQrModal(opts) {
  const url = opts.url || portalUrlForShare('');
  $('#qrReasonBadge').textContent = opts.badge || '📱 Scan with your Phone';
  $('#qrTitle').textContent = opts.title || 'Open on Phone';
  $('#qrSub').textContent = opts.sub || 'Point your phone camera at the QR code below to open instantly.';
  $('#qrUrlText').textContent = url;

  const wrap = $('#qrCanvasWrap');
  if (window.WonderQR && typeof window.WonderQR.toSvg === 'function') {
    try {
      wrap.innerHTML = window.WonderQR.toSvg(url, { margin: 3, dark: '#070a19', light: '#ffffff' });
    } catch (e) {
      wrap.innerHTML = '<p style="color:#070a19;font-weight:800;padding:12px">Link ready below</p>';
    }
  }

  const anywayBtn = $('#qrLaunchAnywayBtn');
  qrOverrideGameId = opts.overrideGameId || null;
  anywayBtn.hidden = !qrOverrideGameId;

  openModal('qrModal');
}

function openQrForGame(id, fromTvGate) {
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;
  const url = qrTargetUrl(game);
  const hasCompanion = Boolean(game.phoneUrl && game.phoneUrl !== game.link);

  openQrModal({
    badge: fromTvGate
      ? '📷 Camera / AR App — Scan with Phone'
      : (hasCompanion ? '🐠 Companion Phone Controller' : '📱 Play on Your Phone'),
    title: game.title,
    sub: fromTvGate
      ? 'Smart TVs usually have no camera. Scan this QR code with your phone to play with your camera!'
      : (hasCompanion
          ? 'Scan with your phone to use the companion scanner / controller while watching on the big screen.'
          : 'Scan with your phone camera to launch this game right in your mobile browser.'),
    url: url,
    overrideGameId: fromTvGate ? game.id : null
  });
}

function smartLaunch(id, opts) {
  const options = opts || {};
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;

  const devices = Array.isArray(game.devices) ? game.devices : ['phone', 'laptop', 'tv'];
  const tvSupported = devices.indexOf('tv') > -1;

  // Smart TV Camera/AR Gate: auto-pop QR code when TV Mode is active and game needs phone/laptop camera
  if (state.tvMode && !tvSupported && !options.forceHere) {
    openQrForGame(game.id, true);
    return;
  }

  if (game.link) {
    const mode = game.launchMode || 'modal';
    if (mode === 'fullscreen') {
      window.location.assign(game.link);
      return;
    }
    if (mode === 'newtab') {
      if (state.tvMode) {
        window.location.assign(game.link);
      } else {
        const w = window.open(game.link, '_blank', 'noopener');
        if (!w) window.location.assign(game.link);
      }
      return;
    }
  }

  openPlay(game.id);
}

function openDetails(id) {
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;
  detailsGameId = id;

  const cat = categoryOf(game.category);
  $('#detailsTitle').textContent = game.title;
  $('#detailsDesc').textContent = game.desc;
  $('#detailsCat').textContent = `${cat.emoji} ${cat.name}`;

  const cover = $('#detailsCover');
  const emoji = $('#detailsEmoji');
  if (game.cover) {
    cover.src = game.cover;
    cover.hidden = false;
    cover.onerror = function () { cover.hidden = true; emoji.hidden = false; };
    emoji.hidden = true;
    emoji.textContent = game.emoji || cat.emoji;
  } else {
    cover.removeAttribute('src');
    cover.hidden = true;
    emoji.hidden = false;
    emoji.textContent = game.emoji || cat.emoji;
  }

  const meta = [];
  if (game.players) meta.push(`<span class="meta-pill">👤 ${escapeHtml(game.players)}</span>`);
  if (game.time) meta.push(`<span class="meta-pill">⏱ ${escapeHtml(game.time)}</span>`);
  meta.push(`<span class="meta-pill">${deviceBadgesText(game.devices)}</span>`);
  meta.push(`<span class="meta-pill">${game.link ? '🔗 Live App' : '🕹 WonderLab Arcade'}</span>`);
  $('#detailsMeta').innerHTML = meta.join('');

  openModal('detailsModal');
}

let arcade = null;

function openPlay(id) {
  const game = state.games.find(function (g) { return g.id === id; });
  if (!game) return;
  activePlayGameId = id;

  const cat = categoryOf(game.category);
  $('#playTitle').textContent = game.title;
  $('#playDesc').textContent = game.desc;
  $('#playCat').textContent = `${cat.emoji} ${cat.name}`;

  const cover = $('#playCover');
  if (game.cover) {
    cover.src = game.cover;
    cover.style.display = '';
  } else {
    cover.removeAttribute('src');
    cover.style.display = 'none';
  }

  const stage = $('#playStage');
  const openLink = $('#playOpenLink');
  const fsBtn = $('#playFullscreenBtn');
  const hint = $('#playHint');
  stage.innerHTML = '';
  destroyArcade();

  if (game.link) {
    const loader = document.createElement('div');
    loader.className = 'arcade-overlay';
    loader.innerHTML = '<div class="arcade-overlay-card"><h3>Loading game…</h3><p>Setting up your arcade.</p></div>';
    stage.appendChild(loader);

    const frame = document.createElement('iframe');
    frame.src = game.link;
    frame.title = game.title;
    frame.allow = 'camera; microphone; fullscreen; autoplay; gyroscope; accelerometer; xr-spatial-tracking';
    frame.allowFullscreen = true;
    stage.appendChild(frame);
    frame.addEventListener('load', function () { loader.remove(); }, { once: true });
    setTimeout(function () { if (loader.isConnected) loader.remove(); }, 6000);

    openLink.href = game.link;
    openLink.hidden = false;
    fsBtn.hidden = false;
    hint.textContent = 'Tip: use Full screen for TV, or Phone QR to open on mobile.';
  } else {
    openLink.hidden = true;
    fsBtn.hidden = true;
    hint.textContent = 'WonderLab demo arcade — attach the real GitHub Pages link anytime in Owner mode.';
    startArcade(stage, game);
  }

  openModal('playModal');
}

function closePlay() {
  destroyArcade();
  const stage = $('#playStage');
  if (stage) stage.innerHTML = '';
}

/* ----- Bubble Pop: built-in canvas game (Touch, Mouse & TV Remote OK ready) ----- */

function destroyArcade() {
  if (arcade && arcade.raf) cancelAnimationFrame(arcade.raf);
  if (arcade && arcade.onKey) document.removeEventListener('keydown', arcade.onKey);
  arcade = null;
}

function startArcade(stage, game) {
  const accent = categoryOf(game.category).b || '#29c3ff';

  const wrap = document.createElement('div');
  wrap.className = 'arcade';
  wrap.innerHTML = `
    <div class="arcade-top">
      <span class="arcade-title">🫧 Bubble Pop — demo arcade</span>
      <span class="arcade-score">Score: <span id="arcadeScore">0</span></span>
    </div>
    <div class="arcade-canvas-wrap">
      <canvas id="arcadeCanvas" width="620" height="380" aria-label="Bubble pop mini game"></canvas>
      <div class="arcade-overlay" id="arcadeOverlay">
        <div class="arcade-overlay-card">
          <h3 id="arcadeOverlayTitle">Bubble Pop!</h3>
          <p id="arcadeOverlayText">Tap, click, or press OK / Space to pop bubbles before they float away!</p>
          <button class="btn btn--primary" type="button" id="arcadeStartBtn">Start game</button>
        </div>
      </div>
    </div>
    <div class="arcade-footer">
      <span class="arcade-hint">Tap / click bubbles — or press OK / Space on Smart TV remote</span>
    </div>`;
  stage.appendChild(wrap);

  const canvas = wrap.querySelector('#arcadeCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = wrap.querySelector('#arcadeScore');
  const overlay = wrap.querySelector('#arcadeOverlay');
  const overlayTitle = wrap.querySelector('#arcadeOverlayTitle');
  const overlayText = wrap.querySelector('#arcadeOverlayText');
  const startBtn = wrap.querySelector('#arcadeStartBtn');

  const W = 620;
  const H = 380;
  const DURATION = 30;
  const COLORS = ['#29c3ff', '#ff4fd8', '#ffa51f', '#a78bfa', '#34e37a'];

  let bubbles = [];
  let particles = [];
  let popTexts = [];
  let score = 0;
  let timeLeft = DURATION;
  let playing = false;
  let last = 0;
  let spawnTimer = 0;

  function reset() {
    bubbles = [];
    particles = [];
    popTexts = [];
    score = 0;
    timeLeft = DURATION;
    spawnTimer = 0;
    scoreEl.textContent = '0';
  }

  function spawn() {
    const r = 20 + Math.random() * 26;
    const colors = COLORS[Math.floor(Math.random() * COLORS.length)];
    bubbles.push({
      x: r + Math.random() * (W - r * 2),
      y: H + r,
      r: r,
      vy: 26 + Math.random() * 44 + (30 - timeLeft) * 2.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.2 + Math.random() * 1.6,
      amp: 8 + Math.random() * 18,
      color: colors,
      born: 0
    });
  }

  function burst(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.5;
      const speed = 60 + Math.random() * 160;
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 1,
        r: 2 + Math.random() * 4,
        color: color
      });
    }
  }

  function popBubbleIndex(i) {
    const b = bubbles[i];
    if (!b) return false;
    const bx = b.renderX !== undefined ? b.renderX : b.x;
    const points = Math.round(b.r);
    score += points;
    scoreEl.textContent = String(score);
    burst(bx, b.y, b.color);
    popTexts.push({ x: bx, y: b.y, text: '+' + points, life: 0.9 });
    bubbles.splice(i, 1);
    return true;
  }

  function popAt(px, py) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      const dx = px - (b.renderX !== undefined ? b.renderX : b.x);
      const dy = py - b.y;
      if (dx * dx + dy * dy <= (b.r + 6) * (b.r + 6)) {
        return popBubbleIndex(i);
      }
    }
    return false;
  }

  function popBestBubbleForRemote() {
    let bestIdx = -1;
    let bestVal = -1;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      if (b.y > 0 && b.y < H + b.r * 0.5 && b.r > bestVal) {
        bestVal = b.r;
        bestIdx = i;
      }
    }
    if (bestIdx > -1) popBubbleIndex(bestIdx);
  }

  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070b1c');
    g.addColorStop(1, '#0d0a24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < 42; i++) {
      const sx = ((i * 137.5) % W);
      const sy = ((i * 89.3) % H);
      const tw = 0.5 + 0.5 * Math.sin(t / 600 + i);
      ctx.globalAlpha = 0.15 + tw * 0.4;
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

    const glow = ctx.createRadialGradient(W / 2, H + 60, 40, W / 2, H + 60, 320);
    glow.addColorStop(0, accent + '33');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBubble(b) {
    ctx.save();
    ctx.translate(b.x, b.y);

    const grad = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.1, 0, 0, b.r);
    grad.addColorStop(0, '#ffffffdd');
    grad.addColorStop(0.32, b.color + 'cc');
    grad.addColorStop(1, b.color + '33');

    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = b.color;
    ctx.globalAlpha = 0.85;
    ctx.stroke();

    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(-b.r * 0.32, -b.r * 0.36, b.r * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  function loop(t) {
    if (!arcade) return;
    if (!last) last = t;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;

    if (playing) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
      }
      spawnTimer -= dt;
      const spawnEvery = Math.max(0.28, 0.75 - (DURATION - timeLeft) * 0.014);
      if (spawnTimer <= 0) {
        spawnTimer = spawnEvery;
        spawn();
      }
    }

    drawBackground(t);

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (playing) {
        b.y -= b.vy * dt;
        b.wobble += b.wobbleSpeed * dt;
        b.born += dt;
      }
      const bobX = Math.sin(b.wobble) * b.amp;
      b.renderX = b.x + bobX;
      if (b.y + b.r < -20) { bubbles.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(bobX, 0);
      drawBubble(b);
      ctx.restore();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (let i = popTexts.length - 1; i >= 0; i--) {
      const pt = popTexts[i];
      pt.y -= 46 * dt;
      pt.life -= dt;
      if (pt.life <= 0) { popTexts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, pt.life / 0.5);
      ctx.font = '800 18px "Baloo 2", system-ui, sans-serif';
      ctx.fillStyle = '#ffd54a';
      ctx.textAlign = 'center';
      ctx.fillText(pt.text, pt.x, pt.y);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,.08)';
    ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, (timeLeft / DURATION) * W, 5);

    if (playing) {
      ctx.font = '800 15px "Nunito", system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.textAlign = 'right';
      ctx.fillText('⏱ ' + Math.ceil(timeLeft) + 's', W - 14, 28);
    }

    arcade.raf = requestAnimationFrame(loop);
  }

  function startGame() {
    if (playing) return;
    reset();
    overlay.hidden = true;
    playing = true;
    last = 0;
    spawn();
    spawn();
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
  }

  function endGame() {
    playing = false;
    const best = Math.max(store.bestScore(), score);
    if (score > store.bestScore()) store.setBestScore(score);
    overlay.hidden = false;
    overlayTitle.textContent = score >= best && score > 0 ? '🏆 New best score!' : '⏰ Time’s up!';
    overlayText.textContent = `You popped your way to ${score} points. Best: ${best}.`;
    startBtn.textContent = 'Play again';
    startBtn.focus({ preventScroll: true });
  }

  startBtn.addEventListener('click', startGame);

  function coordsFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (!playing) return;
    e.preventDefault();
    const c = coordsFromEvent(e);
    popAt(c.x, c.y);
  });

  function onArcadeKey(e) {
    if (!playing) return;
    if (e.key === ' ' || e.key === 'Enter') {
      const active = document.activeElement;
      if (active && active.closest && active.closest('.play-foot')) return;
      e.preventDefault();
      popBestBubbleForRemote();
    }
  }
  document.addEventListener('keydown', onArcadeKey);

  arcade = { raf: null, onKey: onArcadeKey };
  last = 0;
  arcade.raf = requestAnimationFrame(loop);
}

/* ---------------------------------------------------------
   9. SMART TV MODE & REMOTE D-PAD SPATIAL NAVIGATION
   --------------------------------------------------------- */

function detectSmartTvBrowser() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tv') === '1') return true;
  } catch (e) { /* ignore */ }
  const ua = navigator.userAgent || '';
  return /(SmartTV|SMART-TV|Tizen|Web0S|webOS|BRAVIA|AFT|MIBOX|Android TV|GoogleTV|CrKey|Viera|NetCast|HbbTV)/i.test(ua);
}

function setTvHighlight(el) {
  $$('.tv-focused').forEach(function (prev) { prev.classList.remove('tv-focused'); });
  if (el) el.classList.add('tv-focused');
}

function setTvMode(on, silent) {
  state.tvMode = Boolean(on);
  document.body.classList.toggle('tv-mode', state.tvMode);
  const btn = $('#tvModeBtn');
  if (btn) {
    btn.classList.toggle('is-active', state.tvMode);
    btn.setAttribute('aria-pressed', state.tvMode ? 'true' : 'false');
  }
  const hud = $('#tvHud');
  if (hud) hud.hidden = !state.tvMode;
  store.saveTvPref(state.tvMode);
  renderGrid();
  renderSpotlight();

  if (state.tvMode) {
    const firstCard = $('.card') || $('.filter-chip');
    if (firstCard && !openModals.length) {
      firstCard.focus({ preventScroll: true });
      setTvHighlight(firstCard);
    }
    if (!silent) toast('Smart TV Mode ON — use remote arrow keys & OK!', 'info');
  } else {
    setTvHighlight(null);
    if (!silent) toast('Smart TV Mode OFF.', 'info');
  }
}

function getTvFocusables() {
  if (openModals.length) {
    const modal = document.getElementById(openModals[openModals.length - 1]);
    if (!modal) return [];
    return $$('button:not([hidden]), a[href]:not([hidden]), input:not([type="hidden"]), select, textarea', modal)
      .filter(function (el) { return el.offsetParent !== null && !el.disabled; });
  }
  const selector = [
    '.header-actions button:not([hidden])',
    '.owner-bar button:not([hidden])',
    '.hero-cta .btn',
    '.spotlight-actions .btn',
    '.filter-chip',
    '#sortSelect',
    '#gameGrid > .card',
    '#gameGrid > .add-tile',
    '.cat-card',
    '.about-cta .btn:not([hidden])',
    '.footer a',
    '.footer button'
  ].join(', ');
  return $$(selector).filter(function (el) {
    if (el.disabled || el.hidden) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

function moveTvFocus(dx, dy) {
  const items = getTvFocusables();
  if (!items.length) return;

  let current = document.activeElement;
  if (current && current.closest) {
    const parentCard = current.closest('.card');
    if (parentCard && items.indexOf(parentCard) > -1) current = parentCard;
  }

  if (!current || items.indexOf(current) === -1) {
    const start = items.find(function (el) { return el.classList.contains('card'); }) || items[0];
    start.focus({ preventScroll: true });
    start.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTvHighlight(start);
    return;
  }

  const cr = current.getBoundingClientRect();
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  let best = null;
  let bestScore = Infinity;

  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const vx = ex - cx;
    const vy = ey - cy;

    // Must lie in the requested half-plane
    if (dx !== 0 && vx * dx <= 4) continue;
    if (dy !== 0 && vy * dy <= 4) continue;

    const primary = dx !== 0 ? Math.abs(vx) : Math.abs(vy);
    const cross = dx !== 0 ? Math.abs(vy) : Math.abs(vx);
    // Weight cross-axis heavier so rows/columns align naturally on a grid
    const distScore = primary + cross * 2.6;
    if (distScore < bestScore) {
      bestScore = distScore;
      best = el;
    }
  }

  if (best) {
    best.focus({ preventScroll: true });
    best.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTvHighlight(best);
  }
}

function setupTvNavigation() {
  const savedPref = store.loadTvPref();
  const initialTv = savedPref !== null ? savedPref === '1' : detectSmartTvBrowser();
  if (initialTv) setTvMode(true, true);

  $('#tvModeBtn').addEventListener('click', function () {
    setTvMode(!state.tvMode, false);
  });
  $('#tvHudExit').addEventListener('click', function () {
    setTvMode(false, false);
  });

  document.addEventListener('keydown', function (e) {
    const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    const inText = tag === 'input' || tag === 'textarea' || tag === 'select';

    // Activate focused .card with Enter / Space
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('card')) {
      e.preventDefault();
      const id = document.activeElement.dataset.id;
      if (id) smartLaunch(id);
      return;
    }

    if (!state.tvMode || inText) return;

    if (e.key === 'ArrowRight') { e.preventDefault(); moveTvFocus(1, 0); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveTvFocus(-1, 0); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveTvFocus(0, 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveTvFocus(0, -1); }
  });
}

/* ---------------------------------------------------------
   10. AMBIENT EFFECTS, EVENTS & INIT
   --------------------------------------------------------- */

function makeBubbles() {
  const wrap = $('#bubbles');
  if (!wrap) return;
  const colors = ['', 'bubble--c', 'bubble--p', 'bubble--o'];
  const count = window.matchMedia('(max-width: 640px)').matches ? 12 : 22;
  let html = '';
  for (let i = 0; i < count; i++) {
    const size = 8 + Math.random() * 42;
    const left = Math.random() * 100;
    const delay = Math.random() * 22;
    const duration = 16 + Math.random() * 22;
    const drift = (Math.random() * 10 - 5).toFixed(1);
    const cls = colors[Math.floor(Math.random() * colors.length)];
    html += `<span class="bubble ${cls}" style="
      width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;
      left:${left.toFixed(1)}%;
      animation-duration:${duration.toFixed(1)}s;
      animation-delay:-${delay.toFixed(1)}s;
      --drift:${drift}vw;"></span>`;
  }
  wrap.innerHTML = html;
}

function setupReveal() {
  const targets = $$('.hero-copy, .hero-visual, .spotlight, .section-head, .cat-card, .about-inner');
  targets.forEach(function (el) { el.classList.add('reveal'); });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  targets.forEach(function (el) { io.observe(el); });
}

function setupHeader() {
  const header = $('#header');
  const onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupSearch() {
  const input = $('#searchInput');
  const box = $('.search');

  input.addEventListener('input', function () {
    onSearchInput(input.value);
    if (input.value.trim() && window.matchMedia('(max-width: 640px)').matches) {
      box.classList.remove('is-open');
      document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  input.addEventListener('search', function () { onSearchInput(input.value); });

  box.addEventListener('click', function () {
    if (window.matchMedia('(max-width: 640px)').matches && !box.classList.contains('is-open')) {
      box.classList.add('is-open');
      setTimeout(function () { input.focus(); }, 30);
    }
  });

  document.addEventListener('click', function (e) {
    if (box.classList.contains('is-open') && !box.contains(e.target) && !e.target.closest('.search')) {
      box.classList.remove('is-open');
      if (!input.value) state.query = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !openModals.length) {
      const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
      if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
        e.preventDefault();
        box.classList.add('is-open');
        input.focus();
      }
    }
  });
}

function handleDeepLink() {
  const hash = window.location.hash || '';
  const match = hash.match(/^#game=([^&]+)/);
  if (!match) return;
  const id = decodeURIComponent(match[1]);
  const game = state.games.find(function (g) { return g.id === id; });
  if (game) {
    setTimeout(function () { smartLaunch(game.id, { forceHere: true }); }, 200);
  }
}

function setupEvents() {
  // Category filter chips
  $('#categoryFilters').addEventListener('click', function (e) {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    setCategory(chip.dataset.filter);
  });

  // Category cards
  $('#catCards').addEventListener('click', function (e) {
    const card = e.target.closest('[data-cat]');
    if (!card) return;
    setCategory(card.dataset.cat);
    $('#library').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Grid: play / qr / edit / delete
  const grid = $('#gameGrid');
  grid.addEventListener('click', function (e) {
    const card = e.target.closest('.card');
    const tile = e.target.closest('.add-tile');
    if (tile) { openAddGame(); return; }
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('[data-qr]')) { openQrForGame(id, false); return; }
    if (e.target.closest('[data-edit]')) { openEditGame(id); return; }
    if (e.target.closest('[data-delete]')) { askDelete(id); return; }
    if (e.target.closest('[data-play]')) { smartLaunch(id); return; }

    smartLaunch(id);
  });

  // Spotlight buttons
  $('#spotlightCard').addEventListener('click', function (e) {
    const play = e.target.closest('[data-play-game]');
    if (play) { smartLaunch(play.dataset.playGame); return; }
    const qr = e.target.closest('[data-qr-game]');
    if (qr) { openQrForGame(qr.dataset.qrGame, false); return; }
    const details = e.target.closest('[data-details-game]');
    if (details) openDetails(details.dataset.detailsGame);
  });

  // Header Portal QR button
  $('#portalQrBtn').addEventListener('click', function () {
    openQrModal({
      badge: '🌐 WonderLab Play Portal',
      title: 'Open Portal on Phone',
      sub: 'Scan with your phone camera to open WonderLab Play on your mobile browser.',
      url: portalUrlForShare('')
    });
  });

  // QR Modal copy & launch-anyway buttons
  $('#qrCopyBtn').addEventListener('click', function () {
    const url = $('#qrUrlText').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast('Link copied to clipboard!', 'success');
      }).catch(function () { toast(url, 'info'); });
    } else {
      toast(url, 'info');
    }
  });

  $('#qrLaunchAnywayBtn').addEventListener('click', function () {
    const id = qrOverrideGameId;
    closeModal('qrModal');
    if (id) setTimeout(function () { smartLaunch(id, { forceHere: true }); }, 160);
  });

  // Play modal QR + Fullscreen buttons
  $('#playQrBtn').addEventListener('click', function () {
    if (!activePlayGameId) return;
    openQrForGame(activePlayGameId, false);
  });

  $('#playFullscreenBtn').addEventListener('click', function () {
    const stage = $('#playStage');
    const game = state.games.find(function (g) { return g.id === activePlayGameId; });
    if (stage && stage.requestFullscreen) {
      stage.requestFullscreen().catch(function () {
        if (game && game.link) window.location.assign(game.link);
      });
    } else if (game && game.link) {
      window.location.assign(game.link);
    }
  });

  // Details → play & QR
  $('#detailsPlay').addEventListener('click', function () {
    if (!detailsGameId) return;
    const id = detailsGameId;
    closeModal('detailsModal');
    setTimeout(function () { smartLaunch(id); }, 180);
  });

  $('#detailsQrBtn').addEventListener('click', function () {
    if (!detailsGameId) return;
    const id = detailsGameId;
    closeModal('detailsModal');
    setTimeout(function () { openQrForGame(id, false); }, 180);
  });

  // Sort
  $('#sortSelect').addEventListener('change', function (e) {
    state.sort = e.target.value;
    renderGrid();
  });

  // Clear filters
  $('#clearFilters').addEventListener('click', clearFilters);
  $('#emptyReset').addEventListener('click', clearFilters);

  function clearFilters() {
    state.query = '';
    state.category = 'all';
    $('#searchInput').value = '';
    renderFilters();
    renderGrid();
  }

  // Owner bar manual cloud sync
  $('#syncNowBtn').addEventListener('click', function () {
    cloud.syncFromCloud(true);
  });

  // Admin entry points
  $('#adminBtn').addEventListener('click', function () {
    if (store.isOwner()) {
      document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
      toast('You are already in owner mode.', 'info');
    } else {
      openAdminLogin();
    }
  });
  $('#footerAdminBtn').addEventListener('click', function () {
    if (store.isOwner()) logoutOwner();
    else openAdminLogin();
  });
  $('#logoutBtn').addEventListener('click', logoutOwner);

  // Admin login form (verifies with Supabase RPC + local hash fallback)
  $('#adminForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const pass = $('#adminPassword').value;
    const err = $('#adminError');
    const submitBtn = $('#adminForm button[type="submit"]');
    submitBtn.disabled = true;
    const ok = await cloud.verifyPassword(pass);
    submitBtn.disabled = false;

    if (ok) {
      enterOwnerMode(false, pass);
    } else {
      err.textContent = 'Wrong password — try again.';
      const card = $('#adminCard');
      if (typeof card.animate === 'function') {
        card.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
          { duration: 320, easing: 'ease-in-out' }
        );
      }
      $('#adminPassword').select();
    }
  });

  $('#togglePassword').addEventListener('click', function () {
    const input = $('#adminPassword');
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    $('#togglePassword').textContent = isPass ? '🙈' : '👁';
  });

  // Open add form
  $$('[data-open-add]').forEach(function (btn) { btn.addEventListener('click', openAddGame); });

  // Helpful device preset when switching category on a new game
  $('#gameCategory').addEventListener('change', function (e) {
    if (state.editingId) return;
    const cat = e.target.value;
    if (cat === 'web-ar' || cat === 'motion') {
      setFormDevices(['phone', 'laptop']);
    } else {
      setFormDevices(['phone', 'laptop', 'tv']);
    }
  });

  // Game form live error clear
  ['gameTitle', 'gameDesc'].forEach(function (id) {
    const input = document.getElementById(id);
    const rerun = function () {
      const field = input.closest('.field');
      if (!field.classList.contains('has-error')) return;
      if (id === 'gameDesc') $('#descCount').textContent = String(input.value.length);
      validateGameForm();
    };
    input.addEventListener('input', rerun);
  });

  fillCategorySelect();
  $('#gameDesc').addEventListener('input', function (e) {
    $('#descCount').textContent = String(e.target.value.length);
  });

  $('#gameCoverFile').addEventListener('change', async function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCover(file);
      state.coverDraft = dataUrl;
      $('#gameCoverUrl').value = '';
      setCoverPreview(dataUrl);
      toast('Cover image uploaded.', 'success');
    } catch (err) {
      toast(err.message || 'Could not use that image.', 'error');
      e.target.value = '';
    }
  });

  $('#gameCoverUrl').addEventListener('input', function (e) {
    const url = e.target.value.trim();
    if (url) {
      state.coverDraft = '';
      setCoverPreview(url);
    }
  });

  $('#coverPreviewClear').addEventListener('click', function () {
    state.coverDraft = '';
    $('#gameCoverUrl').value = '';
    $('#gameCoverFile').value = '';
    setCoverPreview('');
  });

  $('#gameForm').addEventListener('submit', saveGame);

  // Delete confirm
  $('#confirmDelete').addEventListener('click', doDelete);

  // Reset forms when gameModal closes via X/backdrop
  $('#gameModal').querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', function () { setTimeout(resetGameForm, 250); });
  });

  // Auto re-sync when user switches back to this tab on any device
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      cloud.syncFromCloud(false);
    }
  });
}

function init() {
  const staticTile = document.querySelector('.add-tile');
  if (staticTile) staticTile.remove();

  fillCategorySelect();
  setupEvents();
  setupHeader();
  setupSearch();
  makeBubbles();
  renderAll();
  setupTvNavigation();
  setupReveal();

  $('#year').textContent = String(new Date().getFullYear());

  if (store.isOwner()) {
    toast('Welcome back, owner. Owner mode is active.', 'info');
  }

  // Live Supabase Cloud Sync on startup, then handle any #game= deep link
  cloud.syncFromCloud(false).then(function () {
    handleDeepLink();
  });

  window.addEventListener('hashchange', handleDeepLink);

  window.addEventListener('resize', function () {
    if (window.innerWidth > 640) {
      const sr = $('.search');
      if (sr) sr.classList.remove('is-open');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

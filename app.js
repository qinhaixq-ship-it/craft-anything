/* Craft Anything — 一个存在浏览器里的手作画廊 */
(() => {
  'use strict';

  const STORE_KEY = 'craft-anything.v1';
  const CATS = ['陶艺', '木作', '织物', '纸艺', '金工', '数字手作'];

  /* ---------------- 程序化占位插画 ---------------- */
  const PALETTES = [
    { bg: '#f3e6d8', a: '#c4643c', b: '#2c2a26', c: '#e8bd88' },
    { bg: '#e8eee6', a: '#4f6b52', b: '#23302a', c: '#c6d5bb' },
    { bg: '#efe6ee', a: '#8a5a7a', b: '#2d2530', c: '#dcc7d9' },
    { bg: '#eae6dd', a: '#8c7a5b', b: '#2b2924', c: '#d9ceb6' },
    { bg: '#e5ecf1', a: '#3f6a85', b: '#1f2b33', c: '#bfd4e0' },
    { bg: '#f6e8e4', a: '#b8564f', b: '#2b2422', c: '#f0c6b7' }
  ];

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function blobPath(cx, cy, r, n, rnd) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n;
      const rr = r * (0.76 + rnd() * 0.46);
      pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const m = mid(p, pts[(i + 1) % n]);
      d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  function makeArt(seed, paletteIndex, ratio) {
    const pal = PALETTES[paletteIndex % PALETTES.length];
    const rnd = mulberry32(seed * 2654435761);
    const W = 520;
    const H = Math.round(W * ratio);
    const parts = [];

    parts.push(`<rect width="${W}" height="${H}" fill="${pal.bg}"/>`);
    parts.push(`<ellipse cx="${W * (0.2 + rnd() * 0.6)}" cy="${H * 0.2}" rx="${W * 0.55}" ry="${H * 0.4}" fill="${pal.c}" opacity=".55"/>`);
    parts.push(`<path d="${blobPath(W * (0.3 + rnd() * 0.4), H * (0.35 + rnd() * 0.3), Math.min(W, H) * 0.32, 7, rnd)}" fill="${pal.a}" opacity=".92"/>`);
    parts.push(`<path d="${blobPath(W * (0.25 + rnd() * 0.55), H * (0.45 + rnd() * 0.35), Math.min(W, H) * 0.16, 6, rnd)}" fill="${pal.b}" opacity=".8"/>`);

    // 细线弧
    const arcCount = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < arcCount; i++) {
      const cx = W * (0.1 + rnd() * 0.8);
      const cy = H * (0.1 + rnd() * 0.8);
      const r = Math.min(W, H) * (0.12 + rnd() * 0.42);
      const a0 = rnd() * Math.PI * 2;
      const a1 = a0 + 0.6 + rnd() * 2.2;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      parts.push(`<path d="M${x0.toFixed(1)},${y0.toFixed(1)}A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${pal.b}" stroke-width="${(1 + rnd() * 2.4).toFixed(1)}" opacity=".38"/>`);
    }

    // 网点
    const cols = 4 + Math.floor(rnd() * 4);
    const rows = 4 + Math.floor(rnd() * 4);
    const ox = W * (0.08 + rnd() * 0.25), oy = H * (0.6 + rnd() * 0.2);
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const r = 1.2 + rnd() * 2.2;
        parts.push(`<circle cx="${(ox + x * 26).toFixed(1)}" cy="${(oy + y * 26).toFixed(1)}" r="${r.toFixed(1)}" fill="${pal.b}" opacity=".3"/>`);
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- 初始作品 ---------------- */
  const SEED = [
    { id: 's1', title: '歪嘴陶罐 No.7', author: '林砚', cat: '陶艺', tags: ['手捏', '粗陶'], ratio: 1.26, seed: 3, pal: 0, likes: 86, date: '2026-11-08', materials: '粗陶、草木灰釉', desc: '拉坯时手一抖，口沿歪了。烧完发现歪得刚好，像一个不肯把话说清楚的人。' },
    { id: 's2', title: '榫卯边几', author: '陈默', cat: '木作', tags: ['无钉', '白蜡木'], ratio: 0.82, seed: 7, pal: 3, likes: 132, date: '2026-11-06', materials: '白蜡木、蜂蜡', desc: '整张桌子没有一颗钉子。拆开能装进后备箱，装好之后站得住一个成年人。' },
    { id: 's3', title: '蓝染方巾', author: '苏禾', cat: '织物', tags: ['扎染', '板蓝根'], ratio: 1.12, seed: 12, pal: 4, likes: 64, date: '2026-11-04', materials: '纯棉坯布、板蓝根发酵染液', desc: '染缸养了四十天。这一块是第七次下缸，蓝得最沉。' },
    { id: 's4', title: '折纸灯罩', author: '一木', cat: '纸艺', tags: ['和纸', '几何'], ratio: 1.3, seed: 21, pal: 1, likes: 97, date: '2026-11-01', materials: '和纸、竹骨、米糊', desc: '一百二十八个等分折痕，靠一把骨刀压出来。开灯时纸的纤维会发亮。' },
    { id: 's5', title: '铜锤纹杯', author: '阿岩', cat: '金工', tags: ['锻打', '黄铜'], ratio: 1.0, seed: 33, pal: 5, likes: 210, date: '2026-10-29', materials: '1.2mm 黄铜板、锡焊', desc: '锤了大概四千下。手心的茧到现在还没消，杯壁的坑是那几千下的记录。' },
    { id: 's6', title: '生成式织物图案', author: '灰阶', cat: '数字手作', tags: ['参数化', 'p5.js'], ratio: 0.78, seed: 44, pal: 2, likes: 158, date: '2026-10-27', materials: 'p5.js、喷墨真丝', desc: '一段三十行的噪声代码，迭代到第 914 帧时停手，印在真丝上。' },
    { id: 's7', title: '陶土香插', author: '林砚', cat: '陶艺', tags: ['泥条盘筑', '素烧'], ratio: 0.92, seed: 55, pal: 2, likes: 41, date: '2026-10-24', materials: '细陶、素烧 800℃', desc: '给一根线香做的小山。烟从缺口飘出来的时候很像雾。' },
    { id: 's8', title: '编织藤篮', author: '苏禾', cat: '织物', tags: ['藤条', '斜纹'], ratio: 1.22, seed: 66, pal: 3, likes: 73, date: '2026-10-21', materials: '玛瑙藤、水浸软化', desc: '藤条要先泡够八小时才听话。这只篮子的底收得有点急，算是个记号。' },
    { id: 's9', title: '木刻版画：夜航', author: '陈默', cat: '纸艺', tags: ['橡木版', '油墨'], ratio: 1.18, seed: 77, pal: 0, likes: 119, date: '2026-10-18', materials: '橡木版、水性油墨、版画纸', desc: '刻坏了两块版才印出这张。黑色部分留了刀痕，故意没磨平。' },
    { id: 's10', title: '银线耳饰', author: '阿岩', cat: '金工', tags: ['925银', '冷锻'], ratio: 1.05, seed: 88, pal: 4, likes: 55, date: '2026-10-15', materials: '925 银线 0.8mm', desc: '一根银线弯成的耳饰，不用焊点。重量轻到戴着会忘。' }
  ];

  /* ---------------- 状态 ---------------- */
  const state = {
    works: [],     // 用户自己上传的
    likes: {},     // { id: true }
    cat: '全部',
    q: '',
    sort: 'new'
  };

  const el = (id) => document.getElementById(id);
  const grid = el('grid');
  const emptyBox = el('empty');
  const chips = el('chips');
  const searchInput = el('search');
  const sortSelect = el('sort');

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const allWorks = () => SEED.concat(state.works);
  const likeCount = (w) => (w.likes || 0) + (state.likes[w.id] ? 1 : 0);
  const artUrl = (w) => w.image || makeArt(w.seed || 1, w.pal || 0, w.ratio || 1.1);

  /* ---------------- 存储 ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.works)) state.works = data.works;
      if (data.likes && typeof data.likes === 'object') state.likes = data.likes;
    } catch (e) {
      console.warn('读取本地数据失败', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ works: state.works, likes: state.likes }));
      return true;
    } catch (e) {
      toast('本地存储已满，图片可能太大。试试删掉几件旧作品。');
      return false;
    }
  }

  /* ---------------- 渲染 ---------------- */
  function categories() {
    const used = new Set(allWorks().map((w) => w.cat).filter(Boolean));
    return ['全部'].concat(CATS.filter((c) => used.has(c)))
      .concat([...used].filter((c) => !CATS.includes(c)));
  }

  function renderChips() {
    const list = categories();
    if (!list.includes(state.cat)) state.cat = '全部';
    chips.innerHTML = list.map((c) => (
      `<button class="chip" role="tab" aria-selected="${c === state.cat}" data-cat="${esc(c)}">${esc(c)}</button>`
    )).join('');
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = allWorks().filter((w) => {
      if (state.cat !== '全部' && w.cat !== state.cat) return false;
      if (!q) return true;
      const hay = [w.title, w.author, w.cat, w.desc, (w.tags || []).join(' ')].join(' ').toLowerCase();
      return hay.includes(q);
    });
    list.sort((a, b) => state.sort === 'hot'
      ? likeCount(b) - likeCount(a)
      : String(b.date || '').localeCompare(String(a.date || '')));
    return list;
  }

  function cardHTML(w) {
    const tags = (w.tags || []).slice(0, 3);
    return `
      <article class="card" tabindex="0" role="button" data-id="${esc(w.id)}" aria-label="${esc(w.title)}">
        <img src="${artUrl(w)}" alt="${esc(w.title)}" loading="lazy" />
        <div class="card-body">
          <h3 class="card-title">${esc(w.title)}</h3>
          <p class="card-author">${esc(w.author)} · ${esc(w.cat || '手作')}</p>
          <div class="card-foot">
            <div class="card-tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
            <button class="like" type="button" data-like="${esc(w.id)}" data-liked="${!!state.likes[w.id]}" aria-label="喜欢">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8.4 3.9 3.9 0 0 1 19 10.8C19 15.6 12 20 12 20z"/></svg>
              <span>${likeCount(w)}</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    renderChips();
    const list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    grid.hidden = list.length === 0;
    emptyBox.hidden = list.length > 0;
    renderStats();
  }

  function renderStats() {
    const works = allWorks();
    const makers = new Set(works.map((w) => w.author).filter(Boolean));
    const likes = works.reduce((sum, w) => sum + likeCount(w), 0);
    el('statWorks').textContent = works.length;
    el('statMakers').textContent = makers.size;
    el('statLikes').textContent = likes;
  }

  /* ---------------- 详情 ---------------- */
  let currentId = null;

  function openDetail(id) {
    const w = allWorks().find((x) => x.id === id);
    if (!w) return;
    currentId = id;
    el('detailImg').src = artUrl(w);
    el('detailImg').alt = w.title;
    el('detailCat').textContent = (w.cat || '手作').toUpperCase();
    el('detailTitle').textContent = w.title;
    el('detailAuthor').textContent = 'by ' + w.author;
    el('detailDesc').textContent = w.desc || '作者没有留下说明，只有作品本身。';
    el('detailMaterials').textContent = w.materials || '未记录';
    el('detailDate').textContent = w.date || '—';
    el('detailTags').innerHTML = (w.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    updateDetailLike(w);
    el('deleteBtn').hidden = !String(w.id).startsWith('u_');
    el('detailOverlay').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function updateDetailLike(w) {
    const btn = el('detailLike');
    btn.dataset.liked = String(!!state.likes[w.id]);
    el('detailLikeCount').textContent = likeCount(w);
  }

  function closeOverlay(id) {
    el(id).hidden = true;
    if (el('detailOverlay').hidden && el('uploadOverlay').hidden) {
      document.body.style.overflow = '';
    }
  }

  /* ---------------- 喜欢 ---------------- */
  function toggleLike(id) {
    if (state.likes[id]) delete state.likes[id];
    else state.likes[id] = true;
    save();
    // 局部刷新，避免整页重排打断滚动
    document.querySelectorAll(`[data-like="${CSS.escape(id)}"]`).forEach((btn) => {
      const w = allWorks().find((x) => x.id === id);
      btn.dataset.liked = String(!!state.likes[id]);
      const span = btn.querySelector('span');
      if (span && w) span.textContent = likeCount(w);
    });
    if (currentId === id) {
      const w = allWorks().find((x) => x.id === id);
      if (w) updateDetailLike(w);
    }
    renderStats();
  }

  /* ---------------- 上传 ---------------- */
  let pendingImage = '';

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('读取图片失败'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('图片格式不支持'));
        img.onload = () => {
          const max = 1280;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.82),
            ratio: canvas.height / canvas.width
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function fillCatSelect() {
    el('fCat').innerHTML = CATS.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('请选择图片文件');
      return;
    }
    try {
      const { dataUrl, ratio } = await compressImage(file);
      pendingImage = dataUrl;
      const preview = el('preview');
      preview.src = dataUrl;
      preview.hidden = false;
      const drop = el('drop');
      drop.querySelector('.drop-copy').style.display = 'none';
      drop.dataset.ratio = String(ratio);
    } catch (e) {
      toast(e.message || '图片处理失败');
    }
  }

  function resetUploadForm() {
    el('uploadForm').reset();
    pendingImage = '';
    const preview = el('preview');
    preview.hidden = true;
    preview.removeAttribute('src');
    el('drop').querySelector('.drop-copy').style.display = '';
    el('drop').dataset.ratio = '';
  }

  function submitUpload(ev) {
    ev.preventDefault();
    const title = el('fTitle').value.trim();
    const author = el('fAuthor').value.trim();
    if (!title) { toast('给作品起个名字吧'); el('fTitle').focus(); return; }
    if (!author) { toast('写下作者的名字'); el('fAuthor').focus(); return; }

    const tags = el('fTags').value.split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean).slice(0, 4);
    const ratio = Number(el('drop').dataset.ratio) || 1.1;

    const work = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      author,
      cat: el('fCat').value || '陶艺',
      tags,
      desc: el('fDesc').value.trim(),
      materials: el('fMaterials').value.trim(),
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      ratio,
      image: pendingImage || ''
    };
    if (!work.image) {
      work.seed = Math.floor(Math.random() * 9999) + 1;
      work.pal = Math.floor(Math.random() * PALETTES.length);
    }

    state.works.unshift(work);
    if (!save()) {
      state.works.shift();
      return;
    }
    closeOverlay('uploadOverlay');
    resetUploadForm();
    state.cat = '全部';
    state.q = '';
    searchInput.value = '';
    render();
    toast('作品已放进画廊');
    setTimeout(() => openDetail(work.id), 220);
  }

  /* ---------------- 导入导出 ---------------- */
  function exportJSON() {
    const payload = {
      app: 'craft-anything',
      version: 1,
      exportedAt: new Date().toISOString(),
      works: state.works,
      likes: state.likes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `craft-anything-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('已导出备份文件');
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const incoming = Array.isArray(data) ? data : (data.works || []);
        const existing = new Set(state.works.map((w) => w.id));
        let added = 0;
        incoming.forEach((w) => {
          if (w && w.id && !existing.has(w.id)) { state.works.push(w); added++; }
        });
        if (data.likes && typeof data.likes === 'object') {
          Object.assign(state.likes, data.likes);
        }
        save();
        render();
        toast(added ? `成功导入 ${added} 件作品` : '没有新作品可导入');
      } catch (e) {
        toast('文件解析失败，请确认是导出的 JSON');
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- 提示 ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const box = el('toast');
    box.textContent = msg;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 2600);
  }

  /* ---------------- 事件 ---------------- */
  function bind() {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat]');
      if (!chip) return;
      state.cat = chip.dataset.cat;
      render();
    });

    searchInput.addEventListener('input', () => {
      state.q = searchInput.value;
      render();
    });

    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      render();
    });

    grid.addEventListener('click', (e) => {
      const likeBtn = e.target.closest('[data-like]');
      if (likeBtn) {
        e.stopPropagation();
        toggleLike(likeBtn.dataset.like);
        return;
      }
      const card = e.target.closest('.card');
      if (card) openDetail(card.dataset.id);
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.card');
      if (!card) return;
      e.preventDefault();
      openDetail(card.dataset.id);
    });

    document.querySelectorAll('[data-open-upload]').forEach((btn) => {
      btn.addEventListener('click', () => {
        el('uploadOverlay').hidden = false;
        document.body.style.overflow = 'hidden';
        setTimeout(() => el('fTitle').focus(), 120);
      });
    });

    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeOverlay(btn.dataset.close));
    });

    document.querySelectorAll('.overlay').forEach((ov) => {
      ov.addEventListener('click', (e) => {
        if (e.target === ov) closeOverlay(ov.id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!el('detailOverlay').hidden) closeOverlay('detailOverlay');
        if (!el('uploadOverlay').hidden) { closeOverlay('uploadOverlay'); resetUploadForm(); }
      }
    });

    el('detailLike').addEventListener('click', () => {
      if (currentId) toggleLike(currentId);
    });

    el('deleteBtn').addEventListener('click', () => {
      if (!currentId || !currentId.startsWith('u_')) return;
      if (!confirm('确定删除这件作品？这个操作无法撤销。')) return;
      state.works = state.works.filter((w) => w.id !== currentId);
      delete state.likes[currentId];
      save();
      closeOverlay('detailOverlay');
      render();
      toast('已删除');
    });

    const drop = el('drop');
    el('fileInput').addEventListener('change', (e) => handleFile(e.target.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add('dragging');
    }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove('dragging');
    }));
    drop.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    });

    el('uploadForm').addEventListener('submit', submitUpload);
    el('exportBtn').addEventListener('click', exportJSON);
    el('importInput').addEventListener('change', (e) => {
      importJSON(e.target.files[0]);
      e.target.value = '';
    });
  }

  /* ---------------- 启动 ---------------- */
  load();
  fillCatSelect();
  bind();
  render();
})();

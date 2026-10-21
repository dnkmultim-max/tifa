/* Saytni CMS bilan ulash: kontent admin panelidan (Payload API) olinadi.
   CMS ishlamasa, sahifadagi namunaviy matnlar (fallback) oʻz joyida qoladi. */
(function () {
  const API = (window.CMS_API || 'http://localhost:3000/api').replace(/\/$/, '');
  const ORIGIN = API.replace(/\/api$/, '');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const lang = () => document.documentElement.lang || 'uz';
  const tt = (s) => (window.TIFA_T ? window.TIFA_T(s) : s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const LOCALES = { uz: 'uz-UZ', en: 'en-GB', ru: 'ru-RU', fr: 'fr-FR' };
  const PLACES = { uz: 'oʻrin', en: 'places', ru: 'мест', fr: 'places' };

  async function get(path, params) {
    const q = new URLSearchParams(Object.assign({ locale: lang(), depth: '1' }, params || {}));
    const r = await fetch(API + path + '?' + q);
    if (!r.ok) throw new Error(path + ' ' + r.status);
    return r.json();
  }
  const fmt = (iso, o) => {
    if (!iso) return '';
    if (lang() === 'uz') {
      // Intl oʻzbek oy nomlarini bermaydi, shuning uchun oʻzimiz yozamiz
      const d = new Date(iso);
      if (isNaN(d)) return String(iso).slice(0, 10);
      const M = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
      const m = M[d.getUTCMonth()];
      return o && o.month === 'short' ? d.getUTCDate() + ' ' + m.slice(0, 3) : d.getUTCDate() + ' ' + m + ' ' + d.getUTCFullYear();
    }
    try { return new Intl.DateTimeFormat(LOCALES[lang()] || 'uz-UZ', o || { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso)); } catch (e) { return String(iso).slice(0, 10); }
  };
  const fileUrl = (m, size) => {
    if (!m || typeof m !== 'object') return '';
    const u = (size && m.sizes && m.sizes[size] && m.sizes[size].url) || m.url || '';
    return u ? (u.startsWith('http') ? u : ORIGIN + u) : '';
  };

  /* HTML tozalash (CMS matni uchun) */
  const ALLOWED = new Set(['P', 'BR', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'A', 'B', 'STRONG', 'I', 'EM', 'U', 'BLOCKQUOTE', 'IMG', 'DIV', 'SPAN', 'HR']);
  function clean(html) {
    const doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    const walk = (node) => {
      [...node.children].forEach((el) => {
        if (!ALLOWED.has(el.tagName)) { el.replaceWith(...el.childNodes); return; }
        [...el.attributes].forEach((a) => {
          const n = a.name.toLowerCase(), v = a.value.trim().toLowerCase();
          const ok = (el.tagName === 'A' && (n === 'href' || n === 'target' || n === 'rel')) || (el.tagName === 'IMG' && (n === 'src' || n === 'alt')) || n === 'class';
          if (!ok || ((n === 'href' || n === 'src') && /^(javascript|data|vbscript):/.test(v))) el.removeAttribute(a.name);
        });
        if (el.tagName === 'A') { el.setAttribute('rel', 'noopener noreferrer'); }
        walk(el);
      });
    };
    walk(doc.body.firstElementChild);
    return doc.body.firstElementChild.innerHTML;
  }

  /* kartochka */
  const KIND = { news: 'Yangilik', notice: 'Eʼlon', event: 'Tadbir', journal: 'Jurnal' };
  const imgBox = (m, cls) => {
    const u = fileUrl(m, 'card');
    return u ? `<div class="img has-img" style="background-image:url('${esc(u)}');background-size:cover;background-position:center"></div>` : `<div class="img"><span>${esc(cls || '')}</span></div>`;
  };
  const newsCard = (n, i) => `<a class="card c${1 + (i % 6)}" data-type="${esc(n.type)}" href="yangilik.html?slug=${encodeURIComponent(n.slug)}">${imgBox(n.image)}<div class="cap"><span class="kind">${esc(tt(KIND[n.type] || 'Yangilik'))}</span><b>${esc(n.title)}</b><small class="date">${esc(fmt(n.publishedAt))}</small></div></a>`;
  const setText = (el, txt) => { if (el) { el.textContent = txt; el.classList.remove('ph'); } };
  const msg = (t) => `<p class="note" style="padding:14px 0">${esc(tt(t))}</p>`;

  /* ---------- sozlamalar: aloqa ---------- */
  async function settings() {
    const s = await get('/globals/site-settings');
    $$('[data-cms-field]').forEach((el) => {
      const v = s[el.dataset.cmsField];
      if (v) el.textContent = v;
    });
    $$('[data-cms-link=telegram]').forEach((a) => { if (s.telegramBotUrl) a.href = s.telegramBotUrl; });
    $$('[data-cms-link=portal]').forEach((a) => { if (s.portalUrl) a.href = s.portalUrl; });
    $$('[data-cms-phone]').forEach((el) => {
      if (!s.phone) return;
      el.textContent = s.phone;
      const link = el.closest('a');
      if (link) link.href = 'tel:' + s.phone.replace(/[^+\d]/g, '');
    });
  }

  /* ---------- bosh sahifa: dasturlar va yangiliklar ---------- */
  async function homePrograms(root) {
    const d = await get('/programs', { sort: 'level', limit: '12' });
    const LV = { bachelor: 'Bakalavriat', master: 'Magistratura', joint: 'Qoʻshma dastur', professional: 'Malaka oshirish' };
    root.innerHTML = d.docs.map((p) => `<article class="prog"><div class="top"></div><div class="body"><span class="tag">${esc(tt(LV[p.level] || 'Bakalavriat'))}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary || '')}</p><a class="more" href="dastur.html?slug=${encodeURIComponent(p.slug)}">${esc(tt('Dastur sahifasi →'))}</a></div></article>`).join('') || msg('Hozircha dasturlar yoʻq.');
  }
  async function homeNews(root) {
    const d = await get('/news', { sort: '-publishedAt', limit: '4', 'where[type][not_equals]': 'event' });
    const ev = await get('/news', { sort: 'eventDate', limit: '3', 'where[type][equals]': 'event', 'where[eventDate][greater_than_equal]': new Date().toISOString() });
    const [first, ...rest] = d.docs;
    const main = first
      ? `<a class="n-main" href="yangilik.html?slug=${encodeURIComponent(first.slug)}" style="${fileUrl(first.image, 'wide') ? `background:linear-gradient(0deg,rgba(40,8,20,.85),rgba(40,8,20,.25)),url('${esc(fileUrl(first.image, 'wide'))}') center/cover;` : ''}"><time>${esc(fmt(first.publishedAt))}</time><h3>${esc(first.title)}</h3><p style="color:#f3dfe4;font-size:.92rem">${esc(first.summary || '')}</p></a>`
      : `<article class="n-main"><h3>${esc(tt('Bu bo\'limda materiallar hali yo\'q.'))}</h3></article>`;
    const list = rest.map((n) => `<a class="n-item" href="yangilik.html?slug=${encodeURIComponent(n.slug)}" style="display:block"><time>${esc(fmt(n.publishedAt))}</time><b>${esc(n.title)}</b></a>`).join('');
    const events = ev.docs.map((e) => `<div class="ev"><b>${esc(e.title)}</b>${esc(fmt(e.eventDate))}</div>`).join('');
    root.innerHTML = `<div class="news">${main}<div class="n-list">${list}</div></div>${events ? `<div class="events">${events}</div>` : ''}`;
  }

  /* ---------- yangiliklar roʻyxati ---------- */
  function applyFilter(gal, empty, type, year) {
    let n = 0;
    $$('.card', gal).forEach((c) => {
      const ok = (!type || type === 'all' || c.dataset.type === type) && (!year || year === 'all' || c.dataset.year === year);
      c.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    if (empty) empty.style.display = n ? 'none' : 'block';
  }
  function bindFilters(gal, empty) {
    let type = 'all', year = 'all';
    $$('.pill').forEach((p) => { if (p.dataset.bound) return; p.dataset.bound = '1'; p.addEventListener('click', () => { $$('.pill').forEach((x) => x.classList.remove('on')); p.classList.add('on'); type = p.dataset.type; applyFilter(gal, empty, type, year); }); });
    const sel = $('#year');
    if (sel && !sel.dataset.bound) { sel.dataset.bound = '1'; sel.addEventListener('change', () => { year = sel.value; applyFilter(gal, empty, type, year); }); }
    const on = $('.pill.on'); if (on) type = on.dataset.type;
    if (sel) year = sel.value;
    applyFilter(gal, empty, type, year);
  }
  async function newsList(root) {
    const gal = $('#gal', root), empty = $('#empty', root);
    const d = await get('/news', { sort: '-publishedAt', limit: '60' });
    gal.innerHTML = d.docs.map(newsCard).join('');
    bindFilters(gal, empty);
    const evBox = $('#events');
    if (evBox) {
      const ev = await get('/news', { sort: 'eventDate', limit: '4', 'where[type][equals]': 'event', 'where[eventDate][greater_than_equal]': new Date().toISOString() });
      const rows = ev.docs.map((e) => `<div class="evt"><div class="d">${esc(fmt(e.eventDate, { day: 'numeric', month: 'short', timeZone: 'UTC' }))}</div><div><b>${esc(e.title)}</b></div></div>`).join('');
      $$('.evt, .note', evBox).forEach((x) => x.remove());
      const h = $('h3', evBox);
      if (h) h.insertAdjacentHTML('afterend', rows || msg('Yaqin tadbirlar yoʻq.'));
    }
  }

  /* ---------- maqola ---------- */
  async function article(root) {
    const slug = param('slug');
    const d = slug ? await get('/news', { 'where[slug][equals]': slug, limit: '1' }) : { docs: [] };
    const n = d.docs[0];
    const body = $('#a-body');
    if (!n) { $('#a-title').textContent = tt('Topilmadi'); if (body) body.innerHTML = msg('Bu bo\'limda materiallar hali yo\'q.'); return; }
    $('#a-title').textContent = n.title;
    $('#a-tag').textContent = tt(KIND[n.type] || 'Yangilik');
    $('#a-date').textContent = fmt(n.publishedAt) + (n.type === 'event' && n.eventDate ? ' · ' + fmt(n.eventDate) : '');
    const hero = $('#a-hero'), u = fileUrl(n.image, 'wide');
    if (u) { hero.style.background = `url('${u}') center/cover`; hero.textContent = ''; } else hero.style.display = n.image ? '' : 'none';
    body.innerHTML = (n.summary ? `<p><b>${esc(n.summary)}</b></p>` : '') + (n.bodyHtml ? clean(n.bodyHtml) : '');
    document.title = n.title + ' — TIFA';
    const rel = await get('/news', { sort: '-publishedAt', limit: '4', 'where[slug][not_equals]': slug });
    $('#a-related').innerHTML = rel.docs.slice(0, 3).map(newsCard).join('');
  }

  /* ---------- taʼlim dasturi ---------- */
  const LV = { bachelor: 'Bakalavriat', master: 'Magistratura', joint: 'Qoʻshma dastur', professional: 'Malaka oshirish' };
  async function program() {
    const slug = param('slug');
    const d = await get('/programs', Object.assign({ limit: '1' }, slug ? { 'where[slug][equals]': slug } : { sort: 'level' }));
    const p = d.docs[0];
    if (!p) return;
    setText($('#p-title'), p.title); setText($('#p-crumb'), p.title);
    $('#p-tag').textContent = tt(LV[p.level] || 'Bakalavriat');
    if (p.summary) $('#p-summary').textContent = p.summary;
    setText($('#p-level'), tt(LV[p.level] || 'Bakalavriat'));
    if (p.duration) setText($('#p-duration'), p.duration);
    if (p.teachingLanguage) setText($('#p-lang'), p.teachingLanguage);
    if (p.seats) setText($('#p-seats'), p.seats + ' ' + PLACES[lang()]);
    const desc = $('#p-desc');
    if (desc) desc.innerHTML = p.descriptionHtml ? clean(p.descriptionHtml) : esc(p.summary || '');
    document.title = p.title + ' — TIFA';
  }

  /* ---------- qabul ---------- */
  async function admission() {
    const a = await get('/globals/admission');
    $$('[data-cms-date]').forEach((el) => { const v = a[el.dataset.cmsDate]; if (v) setText(el, fmt(v)); });
    const ps = await get('/programs', { limit: '20', sort: 'level' });
    const fees = $('#fees');
    if (fees) {
      fees.innerHTML = ps.docs.map((p) => `<tr><td>${esc(p.title)}</td><td${p.annualFee ? '' : ' class="ph"'}>${esc(p.annualFee || tt('[tasdiqlansin]'))}</td></tr>`).join('');
    }
    const b = ps.docs.find((p) => p.level === 'bachelor' && p.seats);
    if (b) setText($('#q-seats'), b.seats + ' ' + PLACES[lang()]);
  }

  /* ---------- Showroom ---------- */
  const showCard = (s, i) => {
    const sub = s.kind === 'show' ? [fmt(s.eventDate), s.venue].filter(Boolean).join(' · ') : [s.authorName, s.year].filter(Boolean).join(' · ');
    const href = (s.kind === 'show' ? 'shou.html' : 'kolleksiya.html') + '?slug=' + encodeURIComponent(s.slug);
    return `<a class="card c${1 + (i % 6)}${s.kind === 'show' ? ' show' : ''}" data-type="${s.kind}" data-year="${esc(s.year || '')}" href="${href}">${imgBox(s.cover)}<div class="cap"><span class="kind">${esc(tt(s.kind === 'show' ? 'Shou' : 'Kolleksiya'))}</span><b>${esc(s.title)}</b><small>${esc(sub)}</small></div></a>`;
  };
  async function showroom(root) {
    const gal = $('#gal', root), empty = $('#empty', root);
    const d = await get('/showroom-items', { sort: '-year', limit: '100' });
    gal.innerHTML = d.docs.map(showCard).join('');
    const sel = $('#year');
    if (sel) {
      const cur = sel.value, years = [...new Set(d.docs.map((s) => s.year).filter(Boolean))].sort((a, b) => b - a);
      sel.innerHTML = `<option value="all">${esc(tt('Barcha yillar'))}</option>` + years.map((y) => `<option value="${y}">${y}</option>`).join('');
      if (years.map(String).includes(cur)) sel.value = cur;
    }
    bindFilters(gal, empty);
    const feat = $('.feature');
    if (feat) {
      const last = d.docs.filter((s) => s.kind === 'show').sort((a, b) => String(b.eventDate).localeCompare(String(a.eventDate)))[0];
      if (!last) { feat.style.display = 'none'; return; }
      feat.style.display = '';
      const u = fileUrl(last.cover, 'wide');
      const im = $('.img', feat); im.style.background = u ? `url('${u}') center/cover` : ''; im.textContent = u ? '' : '';
      $('h2', feat).textContent = last.title;
      $('p', feat).textContent = [fmt(last.eventDate), last.venue].filter(Boolean).join(' · ');
      $('a', feat).href = 'shou.html?slug=' + encodeURIComponent(last.slug);
    }
  }
  async function showItem(root) {
    const slug = param('slug');
    const d = slug ? await get('/showroom-items', { 'where[slug][equals]': slug, limit: '1' }) : { docs: [] };
    const s = d.docs[0];
    if (!s) { $('#s-title').textContent = tt('Topilmadi'); return; }
    $('#s-title').textContent = s.title;
    $('#s-sub').textContent = s.kind === 'show' ? [fmt(s.eventDate), s.venue].filter(Boolean).join(' · ') : [tt('Muallif:') + ' ' + (s.authorName || ''), s.program && s.program.title, s.year].filter(Boolean).join(' · ');
    const bd = $('#s-body'); if (bd) bd.innerHTML = s.descriptionHtml ? clean(s.descriptionHtml) : '';
    document.title = s.title + ' — TIFA';
    const imgs = [s.cover, ...((s.gallery || []).map((g) => g.image))].filter((m) => m && typeof m === 'object');
    const mos = $('.mosaic');
    if (mos) { if (imgs.length) mos.innerHTML = imgs.slice(0, 6).map((m) => `<div style="background:url('${esc(fileUrl(m, 'card'))}') center/cover"></div>`).join(''); }
    const vid = $('.video');
    if (vid) { if (s.videoUrl) { vid.innerHTML = `<a href="${esc(s.videoUrl)}" target="_blank" rel="noopener noreferrer" style="color:inherit">${esc(tt('Videoni ko\'rish'))} ↗</a>`; } else vid.style.display = 'none'; }
    const set = (id, v) => { const el = $(id); if (el && v) setText(el, v); };
    set('#s-author', s.authorName); set('#s-program', s.program && s.program.title); set('#s-year', s.year);
    set('#s-date', fmt(s.eventDate)); set('#s-venue', s.venue);
    const more = $('#s-collections'); if (more) more.style.display = 'none';
  }

  /* ---------- ochiqlik: hujjatlar ---------- */
  async function documents() {
    const d = await get('/documents', { sort: '-docDate', limit: '200' });
    const by = (k) => d.docs.filter((x) => x.kind === k);
    const dl = (x) => { const u = fileUrl(x.file); return u ? `<a class="doc-btn" href="${esc(u)}" target="_blank" rel="noopener">${esc(tt('Yuklab olish'))}</a>` : '<span class="note">—</span>'; };
    const empty = (cols) => `<tr><td colspan="${cols}" class="note">${esc(tt('Hozircha yoʻq.'))}</td></tr>`;
    const docs = by('document'), reps = by('report'), pr = by('procurement');
    const t1 = $('#doc-body'); if (t1) t1.innerHTML = docs.map((x) => `<tr><td>${esc(x.title)}</td><td>${esc(x.docDate ? String(x.docDate).slice(8, 10) + '.' + String(x.docDate).slice(5, 7) + '.' + String(x.docDate).slice(0, 4) : '')}</td><td>${esc(x.docNumber || '')}</td><td>${dl(x)}</td></tr>`).join('') || empty(4);
    const t2 = $('#rep-body'); if (t2) t2.innerHTML = reps.map((x) => `<tr><td>${esc(x.title)}</td><td>${esc(fmt(x.docDate))}</td><td>${dl(x)}</td></tr>`).join('') || empty(3);
    const t3 = $('#proc-body'); if (t3) t3.innerHTML = pr.map((x) => `<tr><td>${esc(x.title)}</td><td>${esc(fmt(x.deadline))}</td><td><span class="status">${esc(tt(x.procurementState === 'closed' ? 'Yakunlangan' : 'Ochiq'))}</span></td></tr>`).join('') || empty(3);
  }

  /* ---------- ishga tushirish ---------- */
  const MODULES = [
    ['[data-cms=programs-home]', homePrograms], ['[data-cms=home-news]', homeNews], ['[data-cms=news-list]', newsList], ['[data-cms=article]', article],
    ['[data-cms=program]', program], ['[data-cms=admission]', admission], ['[data-cms=showroom]', showroom], ['[data-cms=show-item]', showItem], ['[data-cms=documents]', documents],
  ];
  let seq = 0;
  async function run() {
    const my = ++seq;
    await Promise.all([[document.body, settings], ...MODULES.map(([sel, fn]) => [$(sel), fn])].filter(([el]) => el).map(async ([el, fn]) => {
      try { await fn(el); } catch (e) { if (my === seq) console.warn('CMS:', e.message || e); }
    }));
    document.documentElement.classList.add('cms-ready');
  }
  window.addEventListener('tifa:lang', run);
  run();
})();

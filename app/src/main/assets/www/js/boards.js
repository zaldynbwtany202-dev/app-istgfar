/* ════════════════════════════════════════════════════════════════
   وسن 5.1 · «لوحة الاستغفار» (تلوين المربّعات أو النقش الدائري) و«لوحة الهدية»
   ─ لوحة الاستغفار: فسيفساء إسلامية دائرية من مئة قطعة، تُضاء قطعةٌ مع كل استغفار
     من المركز إلى الخارج، وتكتمل بالنجمة الذهبية في وسطها. لكل يوم تصميم وألوان،
     وتُحفظ اللوحات المكتملة في معرضك.
   ─ لوحة الهدية: بطاقة دعاء وإهداء بمشهد من ثيمات وسن، ونصّ دعاء مأثور، وما ذكرتِه اليوم.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const IG_DESIGNS = [
  { n: 'زليج أندلسي', c: ['#1E7F74', '#D4A23A', '#2D4E9A', '#C4703E'], g: '#E8C067', bg: '#F3E6CF' },
  { n: 'لازورد أصفهان', c: ['#1F3F94', '#46C9CF', '#2A56B0', '#1E8C9A'], g: '#E8C067', bg: '#0C1A44' },
  { n: 'زمرّد وذهب', c: ['#1F7A4C', '#2E9A62', '#155C38', '#3FB57A'], g: '#F2D27A', bg: '#07140F' },
  { n: 'ورد وسن', c: ['#D6336C', '#EF6F96', '#B03A64', '#F4A6C1'], g: '#F6D6A0', bg: '#FFF0F3' },
  { n: 'فيروز إزنيك', c: ['#1B3C8E', '#3FB7B2', '#D2352A', '#3A6FD0'], g: '#E8C067', bg: '#F6F9FC' },
  { n: 'كهرمان الفوانيس', c: ['#E0761A', '#FFB23E', '#B8452E', '#F0564A'], g: '#FFE39A', bg: '#1E1030' },
  { n: 'ليل مكة', c: ['#2E2E36', '#8A6424', '#1D1D24', '#C99A3A'], g: '#F2D27A', bg: '#0B0B0E' },
];
const IG_RINGS = [4, 12, 20, 28, 36], IG_R = [18, 42, 68, 96, 126, 158];
const igDesign = d => IG_DESIGNS[Math.floor((d || new Date()).getTime() / 864e5) % IG_DESIGNS.length];
function igBoardSVG(n, D, cls, small) {
  const f = v => Math.round(v * 10) / 10, kh = (r, cx, cy) => { let s = ''; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i + Math.PI / 8, rr = i % 2 ? r * .7654 : r; s += (i ? 'L' : 'M') + f(cx + rr * Math.sin(a)) + ' ' + f(cy - rr * Math.cos(a)); } return s + 'Z'; };
  let s = '<svg class="' + (cls || 'igb') + '" viewBox="-164 -164 328 328" aria-hidden="true"><defs><radialGradient id="igG' + (small ? 's' : '') + '"><stop offset="0" stop-color="' + D.g + '" stop-opacity=".55"/><stop offset="1" stop-color="' + D.g + '" stop-opacity="0"/></radialGradient></defs>';
  s += '<circle r="162" fill="url(#igG' + (small ? 's' : '') + ')" class="ig-glow" opacity="' + (n >= 100 ? 1 : 0) + '"/>';
  let k = 0;
  IG_RINGS.forEach((cnt, ri) => { const r0 = IG_R[ri] + 1.8, r1 = IG_R[ri + 1] - 1.8, step = Math.PI * 2 / cnt, gap = Math.min(.05, step * .08), rot = ri % 2 ? step / 2 : 0;
    for (let j = 0; j < cnt; j++, k++) {
      const a0 = rot + j * step + gap, a1 = rot + (j + 1) * step - gap, P = (r, a) => f(r * Math.sin(a)) + ' ' + f(-r * Math.cos(a));
      const d = 'M' + P(r0, a0) + 'L' + P(r1, a0) + 'A' + r1 + ' ' + r1 + ' 0 0 1 ' + P(r1, a1) + 'L' + P(r0, a1) + 'A' + r0 + ' ' + r0 + ' 0 0 0 ' + P(r0, a0) + 'Z';
      const am = (a0 + a1) / 2, rm = (r0 + r1) / 2, cx = rm * Math.sin(am), cy = -rm * Math.cos(am), on = k < n, col = D.c[(j + ri) % D.c.length];
      s += '<g class="igt' + (on ? ' on' : '') + '" data-k="' + k + '"><path d="' + d + '" fill="' + (on ? col : 'none') + '" stroke="' + (on ? D.g : 'currentColor') + '" stroke-width="' + (on ? .8 : .6) + '"/>' +
        '<path d="' + kh(Math.min((r1 - r0) * .26, rm * step * .22), cx, cy) + '" fill="' + (on ? D.g : 'none') + '" stroke="' + (on ? 'none' : 'currentColor') + '" stroke-width=".4" opacity="' + (on ? .95 : .45) + '"/></g>';
    } });
  s += '<path d="' + kh(15, 0, 0) + '" class="ig-c" fill="' + (n >= 100 ? D.g : 'none') + '" stroke="' + D.g + '" stroke-width="1.2"/><circle r="' + IG_R[5] + '" fill="none" stroke="' + D.g + '" stroke-width="1" opacity=".6"/>';
  return s + '</svg>';
}
/* ═══════════ وسن 5.1 · «لوحة التلوين»: كل استغفار يلوّن مربّعًا من صورة أو كلمة تختارها ═══════════
   تبدأ اللوحة رمادية باهتة كصفحة تلوين، ومع كل «أستغفر الله» يتلوّن مربّع، حتى تظهر الصورة كاملة.
   الرسم على لوحة واحدة (canvas) لا على ألف عنصر — فتبقى خفيفة حتى مع ١٠٠٠ مربّع. */
const IGC_T = [100, 300, 1000];
const IGC_GRID = { 100: [10, 10], 300: [15, 20], 1000: [25, 40] };
const IGC_ORD = [['rnd', 'متفرّق'], ['sp', 'من المركز'], ['row', 'سطرًا سطرًا']];
const IGC_MODES = [['photo', 'صورة', 'image'], ['word', 'كلمة', 'edit'], ['mine', 'صورتي', 'upload'], ['ring', 'نقش اليوم', 'star8']];
const IGC_WORDS = ['أستغفر الله', 'الله', 'سبحان الله', 'الحمد لله', 'لا إله إلا الله', 'الله أكبر', 'محمد ﷺ', 'ربِّ اغفر لي'];
const IGC_PAL = [
  { n: 'ذهب وكحلي', bg: ['#0A1433', '#1D3272'], fg: ['#FFF1C4', '#E3B95B', '#A8752A'], pt: '#E8C067' },
  { n: 'زمرّد', bg: ['#03211A', '#0F5E40'], fg: ['#FFF4CF', '#E7C56F', '#B8862E'], pt: '#8FDDB4' },
  { n: 'ورد', bg: ['#FFF3F7', '#F4AFC6'], fg: ['#D23C74', '#A61E55', '#6E1038'], pt: '#E0507F' },
  { n: 'فيروز', bg: ['#F2FCFB', '#A9DED8'], fg: ['#2A63B8', '#123E8C', '#0A285F'], pt: '#2FA7A0' },
  { n: 'غروب', bg: ['#2A0B2A', '#D9661C'], fg: ['#FFF7DC', '#FFD27A', '#F0A43A'], pt: '#FFD27A' },
  { n: 'ليل', bg: ['#040407', '#1E1E2A'], fg: ['#F8E9BA', '#D9B45A', '#9E7A2E'], pt: '#C99A3A' },
];
const igcPhotos = () => Object.keys(THEMES).filter(k => THEMES[k].ph);
const igcRGBA = (h, a) => 'rgba(' + parseInt(h.slice(1, 3), 16) + ',' + parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16) + ',' + a + ')';
const IG = {
  st() { const s = Store.get('ig', { d: '', n: 0 }); if (s.d !== dayKey(new Date())) { s.d = dayKey(new Date()); s.n = 0; s.b = 0; s.sv = 0; } return s; },
  gal() { return Store.get('igGal', []); },
  cfg() {
    const c = Object.assign({ m: 'photo', s: '', w: IGC_WORDS[0], p: 0, t: 100, o: 'rnd', mine: '', v: 'end' }, Store.get('igCfg', {}));
    if (!['end', '33', 'off'].includes(c.v)) c.v = 'end';
    if (!IGC_GRID[c.t]) c.t = 100; if (!IGC_PAL[c.p]) c.p = 0; if (!IGC_ORD.find(x => x[0] === c.o)) c.o = 'rnd';
    if (!IGC_MODES.find(x => x[0] === c.m) || (c.m === 'mine' && !c.mine)) c.m = 'photo';
    if (!c.s || !THEMES[c.s] || !THEMES[c.s].ph) c.s = THEMES[uiTheme()] && THEMES[uiTheme()].ph ? uiTheme() : 'kmakkah';
    if (!String(c.w || '').trim()) c.w = IGC_WORDS[0];
    return c;
  },
  setCfg(p) { Store.set('igCfg', Object.assign(this.cfg(), p)); },
  target(c) { c = c || this.cfg(); return c.m === 'ring' ? 100 : c.t; },
  /** حفظ اللوحة المكتملة في المعرض (صورتك تُحفظ مصغّرة لأن ملفها يُستبدل عند اختيار غيرها) */
  done(s, c, th) {
    const g = this.gal(), id = s.d + '#' + (s.b || 0); if (g.find(x => (x.id || x.d) === id)) return;
    const e = { id, d: s.d, m: c.m, t: this.target(c) };
    if (c.m === 'ring') e.k = IG_DESIGNS.indexOf(igDesign()); else if (c.m === 'photo') e.s = c.s; else if (c.m === 'word') { e.w = c.w; e.p = c.p; } else if (th) e.th = th;
    g.push(e); let keep = 0; for (let i = g.length - 1; i >= 0; i--) if (g[i].th && ++keep > 40) delete g[i].th;
    Store.set('igGal', g.slice(-400));
  },
};
/** ترتيب تلوين المربّعات: متفرّق (ثابت لليوم)، أو دوائر من المركز، أو سطرًا سطرًا من اليمين */
function igcOrder(t, o, seed) {
  const [c, r] = IGC_GRID[t], n = c * r, a = Array.from({ length: n }, (_, i) => i);
  if (o === 'row') return a.map(i => Math.floor(i / c) * c + (c - 1 - i % c));
  if (o === 'sp') { const cx = (c - 1) / 2, cy = (r - 1) / 2, k = i => { const x = (i % c - cx) / c, y = (Math.floor(i / c) - cy) / r; return Math.round(Math.hypot(x, y) * 60) * 10 + Math.atan2(y, x) + Math.PI; }; return a.sort((p, q) => k(p) - k(q)); }
  let h = 2166136261; String(seed || '').split('').forEach(ch => { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; });
  const rnd = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
  return a;
}
/** لوحة الكلمة: خط أميري ذهبي على زخرفة نجمية ثمانية — تُرسم مرة وتُحفظ في الذاكرة */
const IGC_WC = {};
async function igcWordArt(w, p) {
  const key = w + '|' + p; if (IGC_WC[key]) return IGC_WC[key];
  const W = 1000, H = 1250, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), P = IGC_PAL[p] || IGC_PAL[0];
  try { await Promise.all([document.fonts.load('200px AmiriQ'), document.fonts.load('200px Amiri')]); } catch (e) {}
  let g = x.createRadialGradient(W / 2, H * .46, 40, W / 2, H / 2, H * .78); g.addColorStop(0, P.bg[1]); g.addColorStop(1, P.bg[0]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const star = (cx, cy, R, fill) => { x.beginPath(); for (let k = 0; k < 16; k++) { const rr = k % 2 ? R * .62 : R, a = Math.PI / 8 * k; x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); } x.closePath(); fill ? x.fill() : x.stroke(); };
  x.save(); x.strokeStyle = P.pt; x.lineWidth = 2; x.globalAlpha = .17;
  for (let yy = -1; yy < 12; yy++) for (let xx = -1; xx < 10; xx++) { const cx = xx * 125 + (yy % 2 ? 62.5 : 0), cy = yy * 110 + 30; star(cx, cy, 44); x.beginPath(); x.arc(cx, cy, 16, 0, Math.PI * 2); x.stroke(); }
  x.restore();
  g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 480); g.addColorStop(0, igcRGBA(P.fg[0], .3)); g.addColorStop(.6, igcRGBA(P.fg[0], .08)); g.addColorStop(1, igcRGBA(P.fg[0], 0)); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const gold = x.createLinearGradient(0, H * .3, 0, H * .7); gold.addColorStop(0, P.fg[0]); gold.addColorStop(.55, P.fg[1]); gold.addColorStop(1, P.fg[2]);
  x.strokeStyle = gold; x.lineWidth = 7; x.strokeRect(34, 34, W - 68, H - 68); x.globalAlpha = .55; x.lineWidth = 2.5; x.strokeRect(54, 54, W - 108, H - 108); x.globalAlpha = 1;
  x.fillStyle = gold; [[54, 54], [W - 54, 54], [54, H - 54], [W - 54, H - 54]].forEach(([a, bb]) => star(a, bb, 24, true));
  // الكلمة: سطر أو سطران متوازنان، بأكبر حجم يتّسع
  const txt = String(w).trim(), ws = txt.split(/\s+/); let lines = [txt];
  if (ws.length > 1 && txt.length > 7) { let best = null; for (let i = 1; i < ws.length; i++) { const a = ws.slice(0, i).join(' '), bb = ws.slice(i).join(' '), d = Math.abs(a.length - bb.length); if (!best || d < best[0]) best = [d, [a, bb]]; } lines = best[1]; }
  x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  let fs = 330; const fit = () => { x.font = fs + 'px AmiriQ, Amiri, serif'; return Math.max.apply(null, lines.map(l => x.measureText(l).width)); };
  while (fit() > W - 230 && fs > 70) fs -= 6;
  const lh = fs * 1.28, y0 = H / 2 + fs * .28 - (lines.length - 1) * lh / 2;
  x.save(); x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = 30; x.shadowOffsetY = 10; x.fillStyle = gold; lines.forEach((l, i) => x.fillText(l, W / 2, y0 + i * lh)); x.restore();
  x.lineWidth = 1.6; x.strokeStyle = igcRGBA('#FFFFFF', .4); lines.forEach((l, i) => x.strokeText(l, W / 2, y0 + i * lh));
  x.font = '600 30px Plex'; x.fillStyle = igcRGBA(P.fg[0], .7); x.fillText('وسن', W / 2, H - 92);
  return (IGC_WC[key] = cv);
}
/** مصدر صورة اللوحة: صورة ثيم، أو صورتك، أو لوحة كلمة مرسومة */
async function igcSource(c, forCanvas) {
  if (c.m === 'word') return igcWordArt(c.w, c.p);
  const src = c.m === 'mine' ? c.mine : 'img/th/' + c.s + '.webp';
  return new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = forCanvas ? canvasSrc(src) : src; });
}
/** رسم اللوحة: رمادية باهتة، والمربّعات الملوّنة بألوانها الحقيقية، وخطوط الشبكة */
function igcPaint(x, im, W, H, t, n, ord, full, dark) {
  const [c, r] = IGC_GRID[t], iw = im.width, ih = im.height, s = Math.max(W / iw, H / ih), sw = W / s, sh = H / s, sx = (iw - sw) / 2, sy = (ih - sh) / 2;
  const tw = W / c, th = H / r, fx = sw / W, fy = sh / H;
  x.clearRect(0, 0, W, H);
  if (!full) { // صفحة التلوين: نسخة رمادية فاتحة من الصورة أيًّا كانت عتمتها (مزج «screen» يرفع الظلال)
    try { x.filter = 'grayscale(1) contrast(.85)'; } catch (e) {} x.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); try { x.filter = 'none'; } catch (e) {}
    x.globalCompositeOperation = 'screen'; x.fillStyle = dark ? '#55525E' : '#BDB6AA'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
    if (dark) { x.fillStyle = 'rgba(30,28,36,.28)'; x.fillRect(0, 0, W, H); } }
  const cell = i => { const cx = i % c, cy = Math.floor(i / c), X0 = Math.round(cx * tw), Y0 = Math.round(cy * th), X1 = Math.round((cx + 1) * tw), Y1 = Math.round((cy + 1) * th);
    x.drawImage(im, sx + X0 * fx, sy + Y0 * fy, (X1 - X0) * fx, (Y1 - Y0) * fy, X0, Y0, X1 - X0, Y1 - Y0); };
  if (full) x.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); else for (let i = 0; i < Math.min(n, ord.length); i++) cell(ord[i]);
  return cell;
}
function igcGrid(x, W, H, t, dark) {
  const [c, r] = IGC_GRID[t]; x.save(); x.strokeStyle = dark ? 'rgba(255,255,255,.16)' : 'rgba(40,30,20,.14)'; x.lineWidth = Math.max(1, W / 900); x.beginPath();
  for (let i = 1; i < c; i++) { const X = Math.round(i * W / c) + .5; x.moveTo(X, 0); x.lineTo(X, H); }
  for (let j = 1; j < r; j++) { const Y = Math.round(j * H / r) + .5; x.moveTo(0, Y); x.lineTo(W, Y); }
  x.stroke(); x.restore();
}
/** صورة المشاركة: اللوحة كما هي الآن في إطار ذهبي، مع عدد الاستغفار والتاريخ */
async function igcShare() {
  const c = IG.cfg(), s = IG.st(), T = IG.target(c);
  if (c.m === 'ring') { Gift.share({ art: giftArtKey(), name: '', rel: 'self', what: 'ist', n: s.n, board: true }); return; }
  toast('جارٍ تجهيز اللوحة…', 1200);
  try {
    const im = await igcSource(c, true), W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
    try { await Promise.all([document.fonts.load('700 40px Plex'), document.fonts.load('60px Amiri')]); } catch (e) {}
    x.fillStyle = '#0D0C10'; x.fillRect(0, 0, W, H);
    const bw = 840, bh = 1050, bx = (W - bw) / 2, by = 96, bc = document.createElement('canvas'); bc.width = bw; bc.height = bh; const bx2 = bc.getContext('2d');
    bx2.fillStyle = '#F4EFE6'; bx2.fillRect(0, 0, bw, bh);
    const full = s.n >= T; igcPaint(bx2, im, bw, bh, T, s.n, igcOrder(T, c.o, s.d + ':' + T + ':' + (s.b || 0)), full); if (!full) igcGrid(bx2, bw, bh, T, false);
    x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 40; x.shadowOffsetY = 14; x.drawImage(bc, bx, by); x.restore();
    const gold = x.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#F6E3A8'); gold.addColorStop(.5, '#D4AF63'); gold.addColorStop(1, '#A8802F');
    x.strokeStyle = gold; x.lineWidth = 4; x.strokeRect(bx - 12, by - 12, bw + 24, bh + 24);
    x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#F2D27A'; x.font = '700 40px Plex';
    x.fillText(full ? 'اكتملت لوحة الاستغفار' : 'لوحة الاستغفار · ' + N(s.n) + ' من ' + N(T), W / 2, by + bh + 78);
    x.font = '400 26px Plex'; x.fillStyle = 'rgba(255,255,255,.7)'; let dt = ''; try { dt = fmtH(hijriOf(new Date())) + ' · ' + fmtG(new Date()); } catch (e) {}
    x.fillText(dt + ' · وسن', W / 2, by + bh + 124);
    const url = cv.toDataURL('image/png');
    if (Native.has('shareImage')) { Native.call('shareImage', url, 'لوحة الاستغفار — وسن'); return; }
    const w = window.open(); if (w) w.document.write('<img src="' + url + '" style="max-width:100%">'); else toast('المشاركة تعمل في التطبيق على الهاتف');
  } catch (e) { console.error(e); toast('تعذّر تجهيز اللوحة'); }
}
/** مصغّرة صورتك للمعرض */
async function igcThumb(c) {
  try { const im = await igcSource(c, true), cv = document.createElement('canvas'); cv.width = 96; cv.height = 120; const x = cv.getContext('2d');
    igcPaint(x, im, 96, 120, 100, 100, [], true); return cv.toDataURL('image/jpeg', .72); } catch (e) { return ''; }
}
/** اختيار صورة من الهاتف للوحة (خانة ig مستقلة عن صورة الصفحة الرئيسية) */
function igcPickMine(done) {
  const ok = r => { if (!r || !r.url) { toast('لم تُختر صورة'); return; } IG.setCfg({ m: 'mine', mine: r.url }); if (done) done(); };
  if (Native.has('pickImageFor')) { window.onPickedImage = r => { window.onPickedImage = null; ok(r); }; Native.call('pickImageFor', 'ig'); return; }
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'), k = Math.min(1, 1100 / Math.max(im.width, im.height)); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); ok({ url: cv.toDataURL('image/jpeg', .84) }); }; im.src = rd.result; };
    rd.readAsDataURL(f); };
  inp.click();
}
/** ورقة تخصيص اللوحة: الصورة أو الكلمة، وعدد المربّعات، وترتيب التلوين */
function igcSheet() {
  const draw = el => {
    const c = IG.cfg();
    let body = '';
    if (c.m === 'photo' || c.m === 'ring' || c.m === 'mine') body += '<div class="sh-l">صورة اللوحة</div><div class="gf-arts igs-ph">' + igcPhotos().map(k => '<button class="gf-art' + (c.m === 'photo' && k === c.s ? ' on' : '') + '" data-ph="' + k + '"><img src="img/th/' + k + '-t.webp" alt="" loading="lazy"><span>' + esc(THEMES[k].n) + '</span></button>').join('') +
      '<button class="gf-art igs-mine' + (c.m === 'mine' ? ' on' : '') + '" data-mine="1">' + (c.mine ? '<img src="' + esc(c.mine) + '" alt="">' : '<b>' + icon('upload') + '</b>') + '<span>' + (c.mine ? 'صورتي' : 'من هاتفك') + '</span></button></div>';
    if (c.m === 'word') body += '<div class="sh-l">الكلمة</div><div class="chips" id="igs-w" style="padding:0">' + IGC_WORDS.map(w => '<button class="chip' + (w === c.w ? ' on' : '') + '" data-v="' + esc(w) + '">' + esc(w) + '</button>').join('') + '</div>' +
      '<div class="form" style="margin-top:8px"><input id="igs-wi" maxlength="18" placeholder="أو اكتب كلمتك: اسم، دعاء قصير…" value="' + (IGC_WORDS.includes(c.w) ? '' : esc(c.w)) + '"></div>' +
      '<div class="sh-l">الألوان</div><div class="igs-pal">' + IGC_PAL.map((P, i) => '<button class="igs-sw' + (i === c.p ? ' on' : '') + '" data-p="' + i + '" style="background:linear-gradient(135deg,' + P.bg[1] + ',' + P.bg[0] + ');color:' + P.fg[1] + '" aria-label="' + esc(P.n) + '">ع</button>').join('') + '</div>';
    if (c.m !== 'ring') body += '<div class="sh-l">عدد المربّعات</div><div class="chips" id="igs-t" style="padding:0">' + IGC_T.map(v => '<button class="chip' + (v === c.t ? ' on' : '') + '" data-v="' + v + '">' + N(v) + ' مربّع</button>').join('') + '</div>' +
      '<div class="sh-l">ترتيب التلوين</div><div class="chips" id="igs-o" style="padding:0">' + IGC_ORD.map(([v, t]) => '<button class="chip' + (v === c.o ? ' on' : '') + '" data-v="' + v + '">' + t + '</button>').join('') + '</div>';
    el.innerHTML = '<div class="grab"></div><div class="sh-t">تخصيص لوحة الاستغفار</div><div class="sh-s">كل استغفار يلوّن مربّعًا، حتى تكتمل الصورة</div>' +
      '<div class="chips igs-m" id="igs-m" style="padding:0">' + IGC_MODES.map(([v, t, ic]) => '<button class="chip' + (v === c.m ? ' on' : '') + '" data-v="' + v + '">' + icon(ic) + t + '</button>').join('') + '</div>' + body +
      '<div class="sh-l">صوت الشيخ فارس عبّاد «أستغفر الله وأتوب إليه»</div><div class="chips" id="igs-v" style="padding:0">' + [['end', 'عند اكتمال اللوحة'], ['33', 'كل ٣٣ وعند الاكتمال'], ['off', 'بلا صوت']].map(([v, t]) => '<button class="chip' + (v === c.v ? ' on' : '') + '" data-v="' + v + '">' + t + '</button>').join('') + '</div>' +
      '<button class="btn gold block" id="igs-ok" style="margin-top:16px;height:50px">تم</button>';
    const on = (sel, fn) => { const n = $(sel, el); if (n) n.onclick = e => { const b = e.target.closest('[data-v],[data-ph],[data-mine],[data-p]'); if (b) fn(b); }; };
    on('#igs-m', b => { const v = b.dataset.v; if (v === 'mine' && !IG.cfg().mine) { igcPickMine(() => { draw(el); Router.refresh(); }); return; } IG.setCfg({ m: v }); draw(el); Router.refresh(); });
    on('.igs-ph', b => { if (b.dataset.mine) { igcPickMine(() => { draw(el); Router.refresh(); }); return; } IG.setCfg({ m: 'photo', s: b.dataset.ph }); draw(el); Router.refresh(); });
    on('#igs-w', b => { IG.setCfg({ w: b.dataset.v }); draw(el); Router.refresh(); });
    on('.igs-pal', b => { IG.setCfg({ p: +b.dataset.p }); draw(el); Router.refresh(); });
    on('#igs-t', b => { IG.setCfg({ t: +b.dataset.v }); draw(el); Router.refresh(); });
    on('#igs-o', b => { IG.setCfg({ o: b.dataset.v }); draw(el); Router.refresh(); });
    on('#igs-v', b => { IG.setCfg({ v: b.dataset.v }); draw(el); if (b.dataset.v !== 'off') DhikrVoice.play('is', .9); });
    const wi = $('#igs-wi', el); if (wi) wi.onchange = () => { const v = wi.value.trim().slice(0, 18); if (v) { IG.setCfg({ w: v }); draw(el); Router.refresh(); } };
    $('#igs-ok', el).onclick = () => Sheet.close();
  };
  Sheet.open('', el => draw(el));
}
SCREENS.istighfar = {
  parent: 'azkar',
  render() {
    const s = IG.st(), n = s.n, c = IG.cfg(), T = IG.target(c), gal = IG.gal(), D = igDesign();
    const board = c.m === 'ring'
      ? '<button class="igwrap" id="ig-g" aria-label="أستغفر الله">' + igBoardSVG(n, D) + '<span class="ig-n"><b class="num" id="ig-n">' + N(n) + '</b><small>من ' + N(100) + '</small></span></button>'
      : '<button class="igc' + (n >= T ? ' full' : '') + '" id="ig-g" aria-label="أستغفر الله"><canvas class="igc-cv" aria-hidden="true"></canvas><span class="igc-ld">' + icon('sparkle') + '</span><span class="igc-n"><b class="num" id="ig-n">' + N(Math.min(n, T)) + '</b><small>من ' + N(T) + '</small></span></button>';
    const sub = c.m === 'ring' ? 'تصميم اليوم: ' + esc(D.n) : c.m === 'word' ? 'لوّن «' + esc(c.w) + '» باستغفارك' : c.m === 'mine' ? 'لوّن صورتك باستغفارك' : 'لوّن «' + esc(THEMES[c.s].n) + '» باستغفارك';
    const galItem = x => { const m = x.m || 'ring', lab = '<span>' + esc(fmtDateShort(x.d)) + (x.t && x.t !== 100 ? ' · ' + N(x.t) : '') + '</span>';
      if (m === 'ring') return '<div class="ig-gi">' + igBoardSVG(100, IG_DESIGNS[x.k] || D, 'igm', true) + lab + '</div>';
      if (m === 'photo' && THEMES[x.s]) return '<div class="ig-gi igp"><img src="img/th/' + x.s + '-t.webp" alt="" loading="lazy">' + lab + '</div>';
      if (m === 'word') { const P = IGC_PAL[x.p] || IGC_PAL[0]; return '<div class="ig-gi igp igw" style="background:radial-gradient(circle at 50% 45%,' + P.bg[1] + ',' + P.bg[0] + ');color:' + P.fg[1] + '"><b>' + esc(x.w || '') + '</b>' + lab + '</div>'; }
      return '<div class="ig-gi igp">' + (x.th ? '<img src="' + x.th + '" alt="">' : '<i>' + icon('image') + '</i>') + lab + '</div>'; };
    return hdr('لوحة الاستغفار', '«إني لأستغفر الله في اليوم مئة مرة» — رواه مسلم', { back: true, compact: true, actions: [{ id: 'ig-cfg', icon: 'palette', label: 'تخصيص اللوحة' }, { id: 'ig-r', icon: 'refresh', label: 'إعادة' }] }) +
      '<div class="center" style="padding:14px 16px 0"><div style="font-family:var(--font-d);font-size:22px;line-height:1.8" class="gold">أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ</div><div class="faint" style="font-size:12.5px">' + sub + '</div></div>' +
      '<div class="chips igm-row" id="ig-m">' + IGC_MODES.map(([v, t, ic]) => '<button class="chip' + (v === c.m ? ' on' : '') + '" data-v="' + v + '">' + icon(ic) + t + '</button>').join('') + '</div>' +
      board +
      '<div class="mx mt"><button class="btn primary block" id="ig-b" style="height:56px;font-size:17px">' + icon('plus') + (n >= T ? 'لوحة جديدة' : 'أستغفر الله') + '</button></div>' +
      '<div class="row mx" style="gap:8px;margin-top:10px"><button class="btn ghost grow" id="ig-sh">' + icon('share') + 'شارك</button><button class="btn ghost grow" id="ig-cf2">' + icon('palette') + 'تخصيص</button><button class="btn ghost grow" data-go="gift">' + icon('sparkle') + 'الهدية</button></div>' +
      (gal.length ? sec('لوحاتك المكتملة · ' + N(gal.length)) + '<div class="ig-gal mx">' + gal.slice(-24).reverse().map(galItem).join('') + '</div>' : '');
  },
  mount(el) {
    const c = IG.cfg(), T = IG.target(c), ring = c.m === 'ring';
    let paintCell = null, ord = null, cv = null, ready = false, busy = false;
    const seed = () => { const s = IG.st(); return s.d + ':' + T + ':' + (s.b || 0); };
    // لوحة التلوين: نرسمها بحجم العرض الفعلي × كثافة الشاشة
    if (!ring) {
      cv = $('.igc-cv', el); const box = $('#ig-g', el);
      igcSource(c).then(im => {
        if (!cv.isConnected) return;
        const dpr = Math.min(2.5, window.devicePixelRatio || 1), W = Math.round(box.clientWidth * dpr), H = Math.round(box.clientHeight * dpr);
        cv.width = W; cv.height = H; const x = cv.getContext('2d'), s = IG.st(); ord = igcOrder(T, c.o, seed());
        const dk = document.documentElement.dataset.theme === 'dark'; paintCell = igcPaint(x, im, W, H, T, s.n, ord, s.n >= T, dk); ready = true; box.classList.add('ready');
        cv._grid = document.createElement('canvas'); cv._grid.className = 'igc-gl'; cv._grid.width = W; cv._grid.height = H; igcGrid(cv._grid.getContext('2d'), W, H, T, document.documentElement.dataset.theme === 'dark'); box.insertBefore(cv._grid, cv.nextSibling);
      }).catch(() => { toast('تعذّر فتح صورة اللوحة — اختر غيرها'); if (c.m === 'mine') IG.setCfg({ m: 'photo' }); });
    }
    const spark = i => { const [co, ro] = IGC_GRID[T], sp = document.createElement('i'); sp.className = 'igc-sp';
      sp.style.cssText = 'left:' + (i % co) / co * 100 + '%;top:' + Math.floor(i / co) / ro * 100 + '%;width:' + 100 / co + '%;height:' + 100 / ro + '%';
      $('#ig-g', el).appendChild(sp); setTimeout(() => sp.remove(), 700); };
    const finish = s => { vibrate(220); try { TasSound.play(null, true); } catch (e) {} if (c.v !== 'off') setTimeout(() => { try { DhikrVoice.play('is', 1); } catch (e) {} }, 380); const r = $('#ig-g', el).getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2); try { kwCelebrate(artKey()); } catch (e) {}
      toast('اكتملت اللوحة — غفر الله لك', 2600); };
    const add = () => {
      const s = IG.st();
      if (s.n >= T) { // اكتملت: نبدأ لوحة جديدة لليوم نفسه
        if (busy) return; busy = true; s.b = (s.b || 0) + 1; s.n = 0; s.sv = 0; Store.set('ig', s); Router.refresh(); return; }
      s.n++; Store.set('ig', s); Growth.add('ist', 1); if (s.n % 100 === 0) Habits.syncAuto();
      $('#ig-n', el).textContent = N(s.n);
      try { TasSound.play(); } catch (e) {}
      if (c.v === '33' && s.n % 33 === 0 && s.n < T) try { DhikrVoice.play('is', .9); } catch (e) {}   // وسن 6: «أستغفر الله وأتوب إليه» بصوت الشيخ
      if (ring) { const t = $('.igb .igt[data-k="' + (s.n - 1) + '"]', el), D = igDesign();
        if (t) { const ri = IG_RINGS.findIndex((cc, i) => s.n - 1 < IG_RINGS.slice(0, i + 1).reduce((a, bb) => a + bb, 0)); const j = s.n - 1 - IG_RINGS.slice(0, ri).reduce((a, bb) => a + bb, 0);
          const p = t.children; p[0].setAttribute('fill', D.c[(j + ri) % D.c.length]); p[0].setAttribute('stroke', D.g); p[0].setAttribute('stroke-width', '.8'); p[1].setAttribute('fill', D.g); p[1].setAttribute('stroke', 'none'); p[1].setAttribute('opacity', '.95');
          t.classList.add('on', 'pop'); }
        if (s.n === 100) { IG.done(s, c); const cc = $('.igb .ig-c', el); if (cc) cc.setAttribute('fill', D.g); const gl = $('.igb .ig-glow', el); if (gl) gl.setAttribute('opacity', '1'); finish(s); setTimeout(() => Router.refresh(), 2200); }
        else vibrate(12);
        return; }
      if (ready && paintCell) { const i = ord[s.n - 1]; paintCell(i); spark(i); }
      if (s.n >= T) { const box = $('#ig-g', el); box.classList.add('full'); if (cv && cv._grid) cv._grid.remove();
        if (ready) igcSource(c).then(im => { const x = cv.getContext('2d'); igcPaint(x, im, cv.width, cv.height, T, s.n, ord, true); }).catch(() => {});
        (c.m === 'mine' ? igcThumb(c) : Promise.resolve('')).then(th => IG.done(s, c, th));
        finish(s); $('#ig-b', el).innerHTML = icon('plus') + 'لوحة جديدة'; setTimeout(() => { if ($('#ig-g', el)) Router.refresh(); }, 2600); }
      else vibrate(12);
    };
    $('#ig-b', el).onclick = add;
    $('#ig-g', el).addEventListener('pointerdown', e => { e.preventDefault(); if (IG.st().n >= T) return; add(); });
    $('#ig-m', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v;
      if (v === 'mine' && !IG.cfg().mine) { igcPickMine(() => Router.refresh()); return; } if (v === IG.cfg().m && v !== 'ring') { igcSheet(); return; } IG.setCfg({ m: v }); Router.refresh(); };
    $('#ig-cfg', el).onclick = igcSheet; $('#ig-cf2', el).onclick = igcSheet;
    $('#ig-r', el).onclick = () => confirmSheet('إعادة لوحة اليوم؟', 'سيُصفَّر عدّاد اللوحة، ويبقى ما سُجّل من استغفارك في نموّك.', 'نعم، أعِدها', () => { const s = IG.st(); s.n = 0; s.sv = 0; Store.set('ig', s); Router.refresh(); });
    $('#ig-sh', el).onclick = igcShare;
  },
};

/* ═══════════════ لوحة الهدية ═══════════════ */
/* وسن 5: لوحة الهدية بصور الثيمات الحقيقية عالية الدقة */
const GIFT_ART = Object.keys(THEMES).filter(k => THEMES[k].ph && THEMES[k].g !== 'calm').map(k => [k, THEMES[k].n]);
const giftArtKey = () => THEMES[uiTheme()] && THEMES[uiTheme()].ph && THEMES[uiTheme()].g !== 'calm' ? uiTheme() : 'kmadinah';
/** صورة صالحة للرسم على لوحة (على الهاتف تُمرَّر عبر الجسر كي لا تتلوّث اللوحة فيتعذّر حفظها) */
function canvasSrc(src) {
  try { if (/^img\//.test(src) && Native.has('assetB64')) { const d = Native.call('assetB64', src); if (d) return d; }
    if (/^file:/.test(src) && Native.has('fileB64')) { const d = Native.call('fileB64', src); if (d) return d; } } catch (e) {}
  return src;
}
function drawCover(x, im, dx, dy, dw, dh, fy) {
  const r = Math.max(dw / im.width, dh / im.height), sw = dw / r, sh = dh / r, sx = (im.width - sw) / 2, sy = Math.max(0, Math.min(im.height - sh, (im.height - sh) * (fy == null ? 0.5 : fy)));
  x.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
}
const GIFT_REL = [
  ['dead_m', 'لروحه', 'اللهمّ اغفر له وارحمه، وعافِه واعفُ عنه، وأكرِم نُزُله، ووسّع مدخله', 'رواه مسلم'],
  ['dead_f', 'لروحها', 'اللهمّ اغفر لها وارحمها، وعافِها واعفُ عنها، وأكرِم نُزُلها، ووسّع مدخلها', 'رواه مسلم'],
  ['sick', 'للشفاء', 'أسألُ اللهَ العظيم، ربَّ العرش العظيم، أن يشفيك', 'رواه أبو داود والترمذي'],
  ['parents', 'لوالديّ', 'ربِّ ارحمهما كما ربّياني صغيرًا', 'الإسراء: ٢٤'],
  ['friend_m', 'لصديقي', 'جمعنا الله وإيّاك في الفردوس الأعلى، إخوانًا على سُرُرٍ متقابلين', ''],
  ['friend', 'لصديقتي', 'جمعنا الله وإيّاكِ في الفردوس الأعلى، إخوانًا على سُرُرٍ متقابلين', ''],
  ['self', 'عامّ', 'اللهمّ تقبّل منّا إنك أنت السميع العليم', 'البقرة: ١٢٧'],
];
const GIFT_WHAT = [['ist', 'استغفار اليوم'], ['tas', 'تسبيح اليوم'], ['quran', 'ورد القرآن اليوم'], ['dua', 'دعاء فقط']];
const Gift = {
  st: Object.assign({ art: 'kmadinah', name: '', rel: 'dead_m', what: 'ist', dua: '' }, Store.get('gift', {})),
  count(w) { const g = Growth.day(new Date()); return w === 'ist' ? Math.max(g.ist || 0, IG.st().n) : w === 'tas' ? (TB.today || 0) : w === 'quran' ? (g.q || 0) : 0; },
  line(o) { const n = o.n != null ? o.n : this.count(o.what); if (o.what === 'dua' || !n) return '';
    return o.what === 'ist' ? 'استغفرتُ الله ' + N(n) + ' مرة' : o.what === 'tas' ? 'سبّحتُ الله ' + N(n) + ' تسبيحة' : 'قرأتُ ' + N(n) + ' آية من كتاب الله'; },
  async render(o) {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    try { await Promise.all([document.fonts.load('60px Amiri'), document.fonts.load('700 40px Plex'), document.fonts.load('700 60px Display')]); } catch (e) {}
    const img = s => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = s; });
    const T = THEMES[o.art] || THEMES.kmadinah, dark = T.base === 'dark', sw = T.sw;
    const sky = (SKINS[o.art] && SKINS[o.art].sky && SKINS[o.art].sky[dark ? 'night' : 'day']) || { c: ['#0B3B3A', '#12544A', '#1D6A5A'] };
    let g = x.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, sky.c[0]); g.addColorStop(.6, sky.c[1]); g.addColorStop(1, sky.c[2]); x.fillStyle = g; x.fillRect(0, 0, W, 700);
    try { const h = await img(canvasSrc('img/th/' + (THEMES[o.art] ? o.art : 'kmadinah') + '.webp')); drawCover(x, h, 0, 0, W, 700, 0.42); } catch (e) {}
    // لوحة النص
    const panel = dark ? ['#0E0E14', sw[0]] : ['#FFFDF6', sw[0]];
    g = x.createLinearGradient(0, 640, 0, H); g.addColorStop(0, panel[0]); g.addColorStop(1, panel[1]); x.fillStyle = g;
    x.beginPath(); x.moveTo(0, 690); x.quadraticCurveTo(W / 2, 610, W, 690); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill();
    const gold = x.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#F6E3A8'); gold.addColorStop(.5, '#D4AF63'); gold.addColorStop(1, '#A8802F');
    x.strokeStyle = gold; x.lineWidth = 3; x.beginPath(); x.moveTo(60, 700); x.quadraticCurveTo(W / 2, 625, W - 60, 700); x.stroke();
    const rr = (a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
    x.lineWidth = 5; rr(34, 34, W - 68, H - 68, 40); x.stroke(); x.globalAlpha = .55; x.lineWidth = 2; rr(52, 52, W - 104, H - 104, 32); x.stroke(); x.globalAlpha = 1;
    const st8 = (cx, cy, R) => { x.beginPath(); for (let k = 0; k < 16; k++) { const rad = k % 2 ? R * .7654 : R, a = Math.PI / 8 * k + Math.PI / 8; x.lineTo(cx + rad * Math.sin(a), cy - rad * Math.cos(a)); } x.closePath(); x.fillStyle = gold; x.fill(); };
    [[52, 52], [W - 52, 52], [52, H - 52], [W - 52, H - 52]].forEach(([a, b]) => st8(a, b, 20));
    const wrap = (t, mw) => { const ws = String(t).split(/\s+/), out = []; let l = ''; ws.forEach(w => { const tt = l ? l + ' ' + w : w; if (x.measureText(tt).width > mw && l) { out.push(l); l = w; } else l = tt; }); if (l) out.push(l); return out; };
    x.direction = 'rtl'; x.textAlign = 'center';
    const tx = dark ? '#FFFFFF' : '#2A1E10', tx2 = dark ? 'rgba(255,255,255,.72)' : '#6E5A3E', gtx = dark ? '#F2D27A' : '#8A6220';
    const R = GIFT_REL.find(r => r[0] === o.rel) || GIFT_REL[5];
    let y = 770;
    x.font = '700 36px Plex'; x.fillStyle = gtx; x.fillText(o.board ? 'لوحة الاستغفار' : (o.rel === 'self' ? 'هديّةٌ من القلب' : 'إهداءٌ ودعاء'), W / 2, y);
    if (o.board) { y += 30; }
    if (o.name) { y += 84; x.font = '700 72px Display'; x.fillStyle = tx; x.fillText(o.name, W / 2, y); }
    const dua = o.dua || R[2];
    y += 90; let fs = 50; x.font = fs + 'px Amiri'; let ls = wrap(dua, W - 220); while (ls.length > 4 && fs > 34) { fs -= 3; x.font = fs + 'px Amiri'; ls = wrap(dua, W - 220); }
    x.fillStyle = tx; ls.forEach((l, i) => x.fillText(l, W / 2, y + i * fs * 1.7)); y += ls.length * fs * 1.7;
    if (!o.dua && R[3]) { x.font = '400 28px Plex'; x.fillStyle = tx2; x.fillText(R[3], W / 2, y - 6); y += 40; }
    const ln = this.line(o);
    if (ln) { y += 26; x.font = '700 34px Plex'; const tw = x.measureText(ln).width + 70; x.fillStyle = dark ? 'rgba(242,210,122,.14)' : 'rgba(184,134,46,.12)'; rr(W / 2 - tw / 2, y - 44, tw, 66, 33); x.fill(); x.fillStyle = gtx; x.fillText(ln, W / 2, y); y += 40; }
    x.font = '400 27px Plex'; x.fillStyle = tx2; let dt = ''; try { dt = fmtH(hijriOf(new Date())) + ' · ' + fmtG(new Date()); } catch (e) {} x.fillText(dt, W / 2, H - 150);
    x.font = '700 30px Display'; x.fillStyle = gtx; x.fillText('وسن · رفيقك في الصلاة والذكر', W / 2, H - 100);
    return c;
  },
  async share(o) {
    toast('جارٍ تجهيز اللوحة…', 1200);
    try { const c = await this.render(o), url = c.toDataURL('image/png');
      if (Native.has('shareImage')) { Native.call('shareImage', url, o.board ? 'لوحة الاستغفار — وسن' : 'إهداء ودعاء — وسن'); return; }
      const w = window.open(); if (w) w.document.write('<img src="' + url + '" style="max-width:100%">'); else toast('المشاركة تعمل في التطبيق على الهاتف');
    } catch (e) { toast('تعذّر تجهيز اللوحة'); }
  },
};
SCREENS.gift = {
  parent: 'more',
  render() {
    const o = Gift.st, R = GIFT_REL.find(r => r[0] === o.rel) || GIFT_REL[0];
    if (!o.artPick || !THEMES[o.art]) o.art = giftArtKey();   // وسن 5: تتبع صورة ثيمك ما لم تختاري غيرها
    return hdr('لوحة الهدية', 'أهدي دعاءك وذكرك بلوحة جميلة', { back: true, compact: true }) +
      '<div class="gf-pv mx mt"><canvas id="gf-c" width="1080" height="1350"></canvas></div>' +
      '<div class="mx form" style="margin-top:14px"><label>لمن الهدية؟</label><input id="gf-n" maxlength="40" value="' + esc(o.name) + '" placeholder="الاسم (اختياري) — مثال: أمي الحبيبة">' +
      '<label>المناسبة والدعاء</label><div class="chips" id="gf-r" style="padding:0">' + GIFT_REL.map(r => '<button class="chip ' + (r[0] === o.rel ? 'on' : '') + '" data-v="' + r[0] + '">' + r[1] + '</button>').join('') + '</div>' +
      '<textarea id="gf-d" rows="3" maxlength="240" placeholder="' + esc(R[2]) + '">' + esc(o.dua || '') + '</textarea>' +
      '<label>ما أهديه</label><div class="chips" id="gf-w" style="padding:0">' + GIFT_WHAT.map(([v, t]) => { const n = Gift.count(v); return '<button class="chip ' + (v === o.what ? 'on' : '') + '" data-v="' + v + '">' + t + (v !== 'dua' ? ' · ' + N(n) : '') + '</button>'; }).join('') + '</div>' +
      '<label>اللوحة</label><div class="gf-arts" id="gf-a">' + GIFT_ART.map(([k, t]) => '<button class="gf-art ' + (k === o.art ? 'on' : '') + '" data-v="' + k + '"><img src="img/th/' + k + '-t.webp" alt="" loading="lazy"><span>' + t + '</span></button>').join('') + '</div>' +
      '<button class="btn gold block" id="gf-s" style="margin-top:16px;height:54px">' + icon('share') + 'شارك اللوحة</button>' +
      '<div class="faint" style="font-size:12px;margin-top:8px;text-align:center">الأدعية من السنّة الصحيحة والقرآن الكريم · يمكنك كتابة دعائك الخاص</div></div>';
  },
  mount(el) {
    // وسن 7.1: لمعة هادئة مكان البطاقة إلى أن تكتمل (بدل إطار فارغ داكن)
    const pv = $('#gf-c', el) && $('#gf-c', el).parentElement; if (pv) pv.classList.add('m-ld');
    const draw = debounce(async () => { const c = $('#gf-c', el); if (!c) return; const r = await Gift.render(Gift.st); c.getContext('2d').drawImage(r, 0, 0); if (c.parentElement) c.parentElement.classList.remove('m-ld'); }, 250);
    const save = () => { Store.set('gift', Gift.st); draw(); };
    $('#gf-n', el).oninput = e => { Gift.st.name = e.target.value.trim(); save(); };
    $('#gf-d', el).oninput = e => { Gift.st.dua = e.target.value.trim(); save(); };
    const chips = (id, key) => { $(id, el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; Gift.st[key] = b.dataset.v; $$(id + ' [data-v]', el).forEach(x => x.classList.toggle('on', x === b));
      if (key === 'rel') { const R = GIFT_REL.find(r => r[0] === b.dataset.v); $('#gf-d', el).placeholder = R[2]; } save(); }; };
    chips('#gf-r', 'rel'); chips('#gf-w', 'what'); chips('#gf-a', 'art'); $('#gf-a', el).addEventListener('click', e => { if (e.target.closest('[data-v]')) { Gift.st.artPick = 1; Store.set('gift', Gift.st); } });
    $('#gf-s', el).onclick = () => Gift.share(Gift.st);
    draw();
  },
};
window.Gift = Gift;

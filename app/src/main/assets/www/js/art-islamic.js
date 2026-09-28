'use strict';
/* ════════════════════════════════════════════════════════════════
   وسن 4.8 · «ريشة وسن — الفخامة الإسلامية»
   تسعة ثيمات فاخرة مرسومة داخل التطبيق (بلا صور خارجية):
   ليل مكة · المدينة المنوّرة · قصر الحمراء · إزنيك العثماني · ذهب المماليك
   لازورد أصفهان · فوانيس رمضان · قبّة الصخرة · التذهيب
   كل ثيم: مشهد رئيسي، نقشة هندسية تتكرّر بلا فواصل، زينة زوايا، إطار للمسبحة،
   حبّات أحجار كريمة، فوانيس تتأرجح، وجزيئات ذهبية مع كل تسبيحة.
   يمدّ وحدة Art دون أن يمسّ الثيمات السابقة.
   ════════════════════════════════════════════════════════════════ */
(() => {
  if (typeof Art === 'undefined' || !Art._) return;
  const doc = Art._.doc, A = Art._;
  const f = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100;
  const rng = seed => { let s = (seed >>> 0) % 2147483647 || 7; return () => (s = s * 16807 % 2147483647) / 2147483647; };
  const RAD = Math.PI / 180;
  const stops = a => a.map(s => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>').join('');
  const LG = (x1, y1, x2, y2, st, us) => id => '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (us ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(st) + '</linearGradient>';
  const RG = (cx, cy, r, st) => id => '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stops(st) + '</radialGradient>';
  const TR = (x, y, s, r) => 'translate(' + f(x) + ' ' + f(y) + ')' + (r ? ' rotate(' + f(r) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f2(s) + ')' : '');
  const g = (x, y, s, r, body, ex) => '<g transform="' + TR(x, y, s, r) + '"' + (ex || '') + '>' + body + '</g>';
  const P = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join('') + 'Z';

  /* ───────── الذهب والتوهّج ───────── */
  const GOLD = { gold: ['#FFF6D2', '#F2D27A', '#C99A3A', '#8A6220'], rose: ['#FFF0E6', '#F2C3A6', '#C98A6A', '#8A5A44'], pale: ['#FFFDF2', '#F5E6B8', '#D9BE78', '#A8883E'] };
  const gold = (d, k, v) => { const c = GOLD[k || 'gold']; return v ? d.def('gdv' + (k || 'gold'), LG(0, 0, 0, 1, [[0, c[0]], [.4, c[1]], [.75, c[2]], [1, c[3]]])) : d.def('gd' + (k || 'gold'), LG(0, 0, 1, 1, [[0, c[0]], [.35, c[1]], [.7, c[2]], [1, c[3]]])); };
  const glow = (d, c, k) => d.def('gl' + (k || '') + c.slice(1), RG(.5, .5, .5, [[0, c, .85], [.35, c, .32], [1, c, 0]]));
  const lg = (d, k, c, h) => d.def(k, h ? LG(0, 0, 1, 0, c.map((x, i) => [i / (c.length - 1), x])) : LG(0, 0, 0, 1, c.map((x, i) => [i / (c.length - 1), x])));

  /* ───────── النجوم الهندسية ───────── */
  // نجمة بعدد رؤوس n: نصف قطر خارجي r1 وداخلي r2
  const starD = (n, r1, r2, cx, cy, rot) => { let s = ''; for (let i = 0; i < 2 * n; i++) { const a = (rot || 0) * RAD + i * Math.PI / n, r = i % 2 ? r2 : r1; s += (i ? 'L' : 'M') + f((cx || 0) + r * Math.sin(a)) + ' ' + f((cy || 0) - r * Math.cos(a)); } return s + 'Z'; };
  const khatam = (r, cx, cy) => starD(8, r, r * .7654, cx, cy, 22.5);          // النجمة الثمانية (خاتم سليمان/ربع الحزب)
  const sharp8 = (r, cx, cy) => starD(8, r, r * .52, cx, cy, 0);
  const rosette = (d, o) => {   // وردة زليج: نجمة ١٦ رأسًا مع حلقة ولبّ
    const c = o.c || ['#1E7F74', '#D4A23A', '#2D4E9A', '#FFFFFF'];
    return g(o.x, o.y, (o.r || 10) / 10, o.rot || 0, '<path d="' + starD(16, 10, 7.6) + '" fill="' + c[0] + '"/><path d="' + starD(8, 7.4, 5.2, 0, 0, 22.5) + '" fill="' + c[1] + '"/><path d="' + khatam(4.6) + '" fill="' + c[2] + '"/><circle r="1.8" fill="' + c[3] + '"/>', o.op != null ? ' opacity="' + o.op + '"' : '');
  };
  const gstar = (d, o) => {   // نجمة ذهبية ثمانية مجسّمة
    const gg = gold(d, o.pal || 'gold'), s = (o.s || 10) / 10;
    return g(o.x, o.y, s, o.r || 0, (o.glow ? '<circle r="24" fill="' + glow(d, o.gc || '#FFE3A0') + '"/>' : '') + '<path d="' + khatam(10) + '" fill="' + gg + '" stroke="' + (GOLD[o.pal || 'gold'][3]) + '" stroke-width=".7"/>' +
      '<path d="' + khatam(6.2) + '" fill="none" stroke="#FFF8DA" stroke-width=".6" opacity=".75"/><circle r="2" fill="#FFF8DA" opacity=".9"/>', o.op != null ? ' opacity="' + o.op + '"' : '');
  };

  /* ───────── القباب ───────── */
  function domeD(type, cx, by, w, h) {
    const X = v => f(cx + v * w), Y = v => f(by - v * h);
    if (type === 'onion') return 'M' + X(-.78) + ' ' + Y(0) + 'C' + X(-1.16) + ' ' + Y(.34) + ' ' + X(-1.04) + ' ' + Y(.64) + ' ' + X(-.44) + ' ' + Y(.83) + 'C' + X(-.16) + ' ' + Y(.9) + ' ' + X(-.04) + ' ' + Y(.95) + ' ' + X(0) + ' ' + Y(1) +
      'C' + X(.04) + ' ' + Y(.95) + ' ' + X(.16) + ' ' + Y(.9) + ' ' + X(.44) + ' ' + Y(.83) + 'C' + X(1.04) + ' ' + Y(.64) + ' ' + X(1.16) + ' ' + Y(.34) + ' ' + X(.78) + ' ' + Y(0) + 'Z';
    if (type === 'melon') return 'M' + X(-1) + ' ' + Y(0) + 'C' + X(-1.06) + ' ' + Y(.52) + ' ' + X(-.62) + ' ' + Y(.93) + ' ' + X(0) + ' ' + Y(1) + 'C' + X(.62) + ' ' + Y(.93) + ' ' + X(1.06) + ' ' + Y(.52) + ' ' + X(1) + ' ' + Y(0) + 'Z';
    if (type === 'pointed') return 'M' + X(-1) + ' ' + Y(0) + 'C' + X(-1) + ' ' + Y(.62) + ' ' + X(-.34) + ' ' + Y(.86) + ' ' + X(0) + ' ' + Y(1) + 'C' + X(.34) + ' ' + Y(.86) + ' ' + X(1) + ' ' + Y(.62) + ' ' + X(1) + ' ' + Y(0) + 'Z';
    if (type === 'golden') return 'M' + X(-1) + ' ' + Y(0) + 'C' + X(-1.04) + ' ' + Y(.6) + ' ' + X(-.52) + ' ' + Y(.97) + ' ' + X(0) + ' ' + Y(1) + 'C' + X(.52) + ' ' + Y(.97) + ' ' + X(1.04) + ' ' + Y(.6) + ' ' + X(1) + ' ' + Y(0) + 'Z';
    return 'M' + X(-1) + ' ' + Y(0) + 'C' + X(-1) + ' ' + Y(.56) + ' ' + X(-.56) + ' ' + Y(1) + ' ' + X(0) + ' ' + Y(1) + 'C' + X(.56) + ' ' + Y(1) + ' ' + X(1) + ' ' + Y(.56) + ' ' + X(1) + ' ' + Y(0) + 'Z';   // hemi
  }
  // ضلوع القبة (للقبة الخضراء والفارسية)
  function domeRibs(cx, by, w, h, n, col, op) {
    let s = ''; for (let i = 1; i < n; i++) { const t = i / n * 2 - 1, x = cx + t * w * .95;
      s += '<path d="M' + f(x) + ' ' + f(by) + 'Q' + f(cx + t * w * .78) + ' ' + f(by - h * .72) + ' ' + f(cx) + ' ' + f(by - h * .99) + '" fill="none" stroke="' + col + '" stroke-width=".7" opacity="' + (op || .35) + '"/>'; }
    return s;
  }
  // الذروة: كرات متراصّة وهلال
  function finial(d, x, y, s, col) {
    const gg = col || gold(d, 'gold', 1);
    return g(x, y, s || 1, 0, '<path d="M-.6 0V-14h1.2V0Z" fill="' + gg + '"/><circle cy="-3" r="2.1" fill="' + gg + '"/><circle cy="-7.6" r="1.7" fill="' + gg + '"/><ellipse cy="-11" rx="1.2" ry="1.5" fill="' + gg + '"/>' +
      '<path d="M-3.6 -17.4A4 4 0 0 0 3.6 -17.4A3.2 3.2 0 0 1 -3.6 -17.4Z" fill="' + gg + '" transform="translate(0 -1.2)"/>');
  }

  /* ───────── المآذن ───────── */
  function minaret(d, o) {
    const x = o.x, by = o.by, h = o.h, w = o.w || h * .07, t = o.type || 'pencil';
    const body = o.fill || '#2A2A30', edge = o.edge || 'rgba(255,255,255,.12)', lit = o.lit || '#FFD98A', gg = o.gold || gold(d, 'gold', 1);
    const rect = (y0, y1, ww, c) => '<path d="M' + f(x - ww / 2) + ' ' + f(by - y0) + 'V' + f(by - y1) + 'H' + f(x + ww / 2) + 'V' + f(by - y0) + 'Z" fill="' + (c || body) + '"/>';
    const balcony = (y, ww, c) => '<path d="M' + f(x - ww / 2) + ' ' + f(by - y) + 'h' + f(ww) + 'l' + f(-ww * .12) + ' ' + f(ww * .28) + 'h' + f(-ww * .76) + 'Z" fill="' + (c || body) + '"/><path d="M' + f(x - ww / 2) + ' ' + f(by - y) + 'h' + f(ww) + '" stroke="' + edge + '" stroke-width=".8"/>' +
      '<path d="M' + f(x - ww / 2 + .5) + ' ' + f(by - y - 1.6) + 'h' + f(ww - 1) + '" stroke="' + (o.rail || lit) + '" stroke-width=".7" stroke-dasharray="1 1.4" opacity=".75"/>';
    const win = (y, n) => { let s = ''; for (let i = 0; i < n; i++) s += '<rect x="' + f(x - w * .12) + '" y="' + f(by - y - i * h * .05) + '" width="' + f(w * .24) + '" height="' + f(h * .022) + '" rx="' + f(w * .12) + '" fill="' + lit + '" opacity=".8"/>'; return s; };
    let s = '';
    if (t === 'pencil') {   // عثمانية: جذع أسطواني، شرفات، ومخروط رصاصي حادّ
      s += rect(0, h * .8, w) + balcony(h * .42, w * 1.7) + balcony(h * .62, w * 1.55) + balcony(h * .78, w * 1.4);
      s += '<path d="M' + f(x - w * .56) + ' ' + f(by - h * .8) + 'L' + f(x) + ' ' + f(by - h) + 'L' + f(x + w * .56) + ' ' + f(by - h * .8) + 'Z" fill="' + (o.cap || body) + '"/>' + win(h * .2, 3);
      s += finial(d, x, by - h + 1, w * .09, gg);
    } else if (t === 'haram' || t === 'madinah') {   // مكية/مدنية: أدوار متناقصة، شرفات مضيئة، وقمّة بذروة ذهبية
      s += rect(0, h * .36, w * 1.18) + rect(h * .36, h * .62, w) + rect(h * .62, h * .8, w * .82) + balcony(h * .36, w * 1.7) + balcony(h * .62, w * 1.5) + balcony(h * .8, w * 1.3);
      s += '<path d="M' + f(x - w * .4) + ' ' + f(by - h * .8) + 'V' + f(by - h * .88) + 'H' + f(x + w * .4) + 'V' + f(by - h * .8) + 'Z" fill="' + lit + '" opacity=".55"/>';
      s += '<path d="' + domeD('pointed', x, by - h * .88, w * .5, h * .1) + '" fill="' + (t === 'madinah' ? (o.cap || '#2E8B57') : gg) + '"/>' + win(h * .1, 4) + win(h * .44, 2);
      s += finial(d, x, by - h * .98 + 1, w * .085, gg);
    } else if (t === 'mamluk') {   // مملوكية: مربّع ثم مثمّن ثم أسطوانة ثم جوسق بقبّة بصلية
      s += rect(0, h * .38, w * 1.25) + balcony(h * .38, w * 1.75) + rect(h * .38, h * .64, w) + balcony(h * .64, w * 1.5) + rect(h * .64, h * .8, w * .72) + balcony(h * .8, w * 1.2);
      for (let i = 0; i < 4; i++) s += '<rect x="' + f(x - w * .34 + i * w * .2) + '" y="' + f(by - h * .9) + '" width="' + f(w * .07) + '" height="' + f(h * .1) + '" fill="' + body + '"/>';
      s += '<path d="' + domeD('onion', x, by - h * .9, w * .44, h * .1) + '" fill="' + (o.cap || body) + '"/>' + win(h * .16, 3) + win(h * .5, 2);
      s += '<path d="M' + f(x - w * .6) + ' ' + f(by - h * .5) + 'h' + f(w * 1.2) + '" stroke="' + lit + '" stroke-width=".6" stroke-dasharray="2 1.2" opacity=".5"/>';
      s += finial(d, x, by - h + 1, w * .085, gg);
    } else if (t === 'persian') {   // فارسية: جذع رفيع بأحزمة فيروزية وشرفة مقرنصة
      s += rect(0, h * .86, w);
      for (let i = 1; i < 7; i++) s += '<rect x="' + f(x - w / 2) + '" y="' + f(by - h * (.12 * i)) + '" width="' + f(w) + '" height="' + f(h * .018) + '" fill="' + (o.band || '#3FC1C9') + '" opacity=".75"/>';
      s += '<path d="M' + f(x - w * .5) + ' ' + f(by - h * .8) + 'L' + f(x - w * .95) + ' ' + f(by - h * .86) + 'H' + f(x + w * .95) + 'L' + f(x + w * .5) + ' ' + f(by - h * .8) + 'Z" fill="' + (o.band || '#3FC1C9') + '"/>';
      s += rect(h * .86, h * .93, w * .8) + '<path d="' + domeD('onion', x, by - h * .93, w * .45, h * .07) + '" fill="' + (o.cap || '#3FC1C9') + '"/>' + finial(d, x, by - h + 1, w * .07, gg);
    } else if (t === 'tower') {   // برج أندلسي مربّع بشرفات مسنّنة
      s += rect(0, h, w, body);
      for (let i = 0; i < 4; i++) s += '<path d="M' + f(x - w / 2 + i * w / 4 + w * .03) + ' ' + f(by - h) + 'v' + f(-h * .06) + 'h' + f(w / 4 - w * .06) + 'v' + f(h * .06) + 'Z" fill="' + body + '"/>';
      s += '<path d="' + archD('horseshoe', x - w * .16, by - h * .62, w * .32, h * .16) + '" fill="' + lit + '" opacity=".7"/>';
    }
    return '<g>' + s + '</g>';
  }

  /* ───────── الأقواس ───────── */
  // فتحة قوس: يسار x، قاعدة by، عرض w، ارتفاع h
  function archD(type, x, by, w, h) {
    const sy = by - h * .62, top = by - h, cx = x + w / 2;
    if (type === 'horseshoe') { const r = w * .56; return 'M' + f(x + w * .1) + ' ' + f(by) + 'V' + f(sy + r * .2) + 'A' + f(r) + ' ' + f(r * 1.05) + ' 0 1 1 ' + f(x + w * .9) + ' ' + f(sy + r * .2) + 'V' + f(by) + 'Z'; }
    if (type === 'round') return 'M' + f(x) + ' ' + f(by) + 'V' + f(sy) + 'A' + f(w / 2) + ' ' + f(by - sy > 0 ? Math.min(w / 2, h - (by - sy)) + 0.01 : w / 2) + ' 0 0 1 ' + f(x + w) + ' ' + f(sy) + 'V' + f(by) + 'Z';
    if (type === 'multifoil') {   // قوس مفصّص (الحمراء): فصوص صغيرة على قوس مدبّب
      const n = 7; let s = 'M' + f(x) + ' ' + f(by) + 'V' + f(sy);
      const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, a = Math.PI * (1 - t); const px = cx + Math.cos(a) * w / 2, py = sy - Math.sin(a) * (top - sy) * -1; pts.push([px, sy - Math.sin(a) * (sy - top) * (1 + .12 * Math.sin(a * 2))]); }
      for (let i = 1; i < pts.length; i++) { const r = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * .55; s += 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(pts[i][0]) + ' ' + f(pts[i][1]); }
      return s + 'V' + f(by) + 'Z';
    }
    if (type === 'persian') { const r = w * .62; return 'M' + f(x) + ' ' + f(by) + 'V' + f(sy) + 'Q' + f(x) + ' ' + f(top + h * .12) + ' ' + f(cx) + ' ' + f(top) + 'Q' + f(x + w) + ' ' + f(top + h * .12) + ' ' + f(x + w) + ' ' + f(sy) + 'V' + f(by) + 'Z'; }
    const r = w * .82;   // مدبّب
    return 'M' + f(x) + ' ' + f(by) + 'V' + f(sy) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(cx) + ' ' + f(top) + 'A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(x + w) + ' ' + f(sy) + 'V' + f(by) + 'Z';
  }
  // رواق من الأقواس المضيئة بين أعمدة
  function arcade(d, o) {
    const n = o.n, W = (o.x1 - o.x0) / n, aw = W * (o.aw || .72), by = o.by, h = o.h, t = o.type || 'pointed';
    const litG = o.litG || d.def('arl' + (o.k || ''), LG(0, 0, 0, 1, [[0, o.lit[0]], [1, o.lit[1]]]));
    let s = '<rect x="' + f(o.x0) + '" y="' + f(by - h - (o.top || h * .35)) + '" width="' + f(o.x1 - o.x0) + '" height="' + f(h + (o.top || h * .35)) + '" fill="' + o.wall + '"/>';
    if (o.band) s += '<rect x="' + f(o.x0) + '" y="' + f(by - h - (o.top || h * .35)) + '" width="' + f(o.x1 - o.x0) + '" height="' + f(o.bandH || 3) + '" fill="' + o.band + '"/>';
    for (let i = 0; i < n; i++) { const x = o.x0 + i * W + (W - aw) / 2;
      s += '<path d="' + archD(t, x, by, aw, h) + '" fill="' + litG + '"/>';
      if (o.frame) s += '<path d="' + archD(t, x, by, aw, h) + '" fill="none" stroke="' + o.frame + '" stroke-width="' + (o.fw || .9) + '"/>';
      if (o.spandrel && i < n) s += '<path d="' + khatam(W * .09, o.x0 + (i + 1) * W, by - h * .95) + '" fill="' + o.spandrel + '" opacity=".8"/>';
    }
    if (o.floor) s += '<rect x="' + f(o.x0) + '" y="' + f(by - 1.2) + '" width="' + f(o.x1 - o.x0) + '" height="2" fill="' + o.floor + '"/>';
    return s;
  }

  /* ───────── الفانوس الرمضاني ───────── */
  const FAN = { amber: ['#FFE7A6', '#FFB23E', '#E0761A'], ruby: ['#FFC2B8', '#F0564A', '#A51F2C'], teal: ['#C8FFF4', '#3FD6C0', '#14887F'], lapis: ['#CFE0FF', '#5B8CFF', '#2A43B8'], emerald: ['#D6FFE0', '#4BD37A', '#1F8A4A'], rose: ['#FFE0EC', '#FF8FB8', '#D0457E'] };
  function fanous(d, o) {
    const s = o.s || 1, c = FAN[o.pal || 'amber'], gg = gold(d, 'gold', 1), gl = glow(d, c[1], 'f');
    const pane = d.def('fp' + (o.pal || 'amber'), LG(0, 0, 0, 1, [[0, c[0]], [.5, c[1]], [1, c[2]]]));
    const L = o.len || 0;
    let b = (L ? '<path d="M0 ' + f(-L) + 'V-18" stroke="' + (o.chain || '#C99A3A') + '" stroke-width="' + f(.9 / s) + '" stroke-dasharray="2 1.2"/>' : '') +
      '<circle cy="4" r="' + (o.night ? 34 : 22) + '" fill="' + gl + '"/>' +
      '<circle cy="-18" r="2.2" fill="none" stroke="' + gg + '" stroke-width="1.1"/>' +
      '<path d="M-6 -9Q0 -19 6 -9Z" fill="' + gg + '"/><path d="M-8.5 -9H8.5L7 -6H-7Z" fill="' + gg + '"/>' +
      '<path d="M-7 -6L-9.5 3L-7 12H7L9.5 3L7 -6Z" fill="' + pane + '"/>' +
      '<path d="M-7 -6L-9.5 3L-7 12M7 -6L9.5 3L7 12M-2.4 -6V12M2.4 -6V12M-9.5 3H9.5" fill="none" stroke="' + gg + '" stroke-width="1"/>' +
      '<path d="' + khatam(2.4, 0, 3) + '" fill="#FFF6D6" opacity=".9"/>' +
      '<path d="M-7 12H7L5 15H-5Z" fill="' + gg + '"/><path d="M-5 15Q0 22 5 15Z" fill="' + gg + '"/><circle cy="22" r="1.3" fill="' + gg + '"/>';
    return g(o.x, o.y, s, o.r || 0, o.sway ? '<g class="glan" style="animation-delay:-' + f(o.dl || 0) + 's">' + b + '</g>' : b);
  }
  // قنديل مملوكي زجاجي بثلاث سلاسل
  function mishkat(d, o) {
    const gg = gold(d, 'gold', 1), gl = glow(d, '#FFD27A', 'm'), gls = d.def('msk', LG(0, 0, 1, 0, [[0, '#E8D6B0', .9], [.5, '#FFF4DA', .95], [1, '#CDB88E', .9]]));
    const L = o.len || 30;
    const b = '<path d="M0 ' + f(-L) + 'L-8 -12M0 ' + f(-L) + 'L8 -12M0 ' + f(-L) + 'V-14" stroke="#B8923E" stroke-width=".6" fill="none"/><circle cy="0" r="' + (o.night ? 40 : 26) + '" fill="' + gl + '"/>' +
      '<path d="M-7 -12H7L5 -4Q12 0 11 6Q10 13 3 15L4 18H-4L-3 15Q-10 13 -11 6Q-12 0 -5 -4Z" fill="' + gls + '"/>' +
      '<path d="M-10.6 3H10.6" stroke="#1F4FA0" stroke-width="2.4" opacity=".8"/><path d="M-10.6 3H10.6" stroke="' + gg + '" stroke-width=".7" stroke-dasharray="1.4 1.2"/>' +
      '<path d="M-6 -9H6" stroke="#B0302A" stroke-width="1.6" opacity=".75"/><circle cx="-5" cy="9" r="1.2" fill="#B0302A" opacity=".8"/><circle cx="5" cy="9" r="1.2" fill="#B0302A" opacity=".8"/><circle cy="10" r="1.2" fill="#1F4FA0" opacity=".8"/>' +
      '<ellipse cy="7" rx="3.2" ry="4.4" fill="#FFE9A8" opacity=".8"/>';
    return g(o.x, o.y, o.s || 1, 0, o.sway ? '<g class="glan" style="animation-delay:-' + f(o.dl || 0) + 's">' + b + '</g>' : b);
  }
  // سرو أندلسي/فارسي
  const cypress = (x, by, h, w, c) => '<path d="M' + f(x) + ' ' + f(by - h) + 'C' + f(x + w * .7) + ' ' + f(by - h * .7) + ' ' + f(x + w * .62) + ' ' + f(by - h * .18) + ' ' + f(x + w * .2) + ' ' + f(by) + 'H' + f(x - w * .2) + 'C' + f(x - w * .62) + ' ' + f(by - h * .18) + ' ' + f(x - w * .7) + ' ' + f(by - h * .7) + ' ' + f(x) + ' ' + f(by - h) + 'Z" fill="' + c[0] + '"/>' +
    '<path d="M' + f(x) + ' ' + f(by - h) + 'C' + f(x + w * .7) + ' ' + f(by - h * .7) + ' ' + f(x + w * .62) + ' ' + f(by - h * .18) + ' ' + f(x + w * .2) + ' ' + f(by) + 'H' + f(x + w * .05) + 'C' + f(x + w * .3) + ' ' + f(by - h * .3) + ' ' + f(x + w * .25) + ' ' + f(by - h * .7) + ' ' + f(x) + ' ' + f(by - h) + 'Z" fill="' + c[1] + '" opacity=".6"/>';
  // حقل نجوم
  const starfield = (r, n, x0, x1, y0, y1, c) => { let s = '<g fill="' + (c || '#FFF6DA') + '">'; for (let i = 0; i < n; i++) s += '<circle cx="' + f(x0 + r() * (x1 - x0)) + '" cy="' + f(y0 + r() * (y1 - y0)) + '" r="' + f(.35 + r() * 1.05) + '" opacity="' + f2(.25 + r() * .65) + '"/>'; return s + '</g>'; };
  // خط كتابة ذهبي متموّج (يوحي بحزام الكسوة والأشرطة الخطّية دون كتابة نصّ فعلي)
  const callig = (x0, x1, y, hh, c, sw) => { let s = 'M' + f(x0) + ' ' + f(y); const n = Math.max(4, Math.round((x1 - x0) / (hh * 1.6))), step = (x1 - x0) / n;
    for (let i = 0; i < n; i++) { const xa = x0 + i * step; s += 'C' + f(xa + step * .2) + ' ' + f(y - hh) + ' ' + f(xa + step * .45) + ' ' + f(y - hh) + ' ' + f(xa + step * .5) + ' ' + f(y) + 'S' + f(xa + step * .8) + ' ' + f(y + hh * .35) + ' ' + f(xa + step) + ' ' + f(y); }
    let t = '<path d="' + s + '" fill="none" stroke="' + c + '" stroke-width="' + (sw || .8) + '" stroke-linecap="round"/>';
    for (let i = 0; i < n; i += 2) t += '<path d="M' + f(x0 + i * step + step * .3) + ' ' + f(y - hh * 1.25) + 'v' + f(hh * .5) + '" stroke="' + c + '" stroke-width="' + (sw || .8) + '"/>';
    return t; };

  /* ───────── الكعبة المشرّفة ───────── */
  function kaaba(d, o) {
    const s = o.s || 1, W = 62 * s, H = 64 * s, D = 26 * s, k = 10 * s, by = o.by, x = o.x - W / 2 + D / 2;   // x = الحافة اليسرى للوجه الأمامي
    const fr = d.def('kbf', LG(0, 0, 1, 1, [[0, '#2A2A30'], [.55, '#16161A'], [1, '#0C0C0F']])), sd = d.def('kbs', LG(1, 0, 0, 0, [[0, '#101013'], [1, '#060608']]));
    const gg = gold(d, 'gold', 1), bandY = by - H * .76, bh = 7.5 * s;
    const side = (y0, y1) => 'M' + f(x) + ' ' + f(y0) + 'V' + f(y1) + 'L' + f(x - D) + ' ' + f(y1 - k) + 'V' + f(y0 - k) + 'Z';
    let b = '<ellipse cx="' + f(x + W / 2 - D / 2) + '" cy="' + f(by + 2 * s) + '" rx="' + f(W * .92) + '" ry="' + f(8 * s) + '" fill="#000" opacity=".32"/>';
    b += '<path d="' + side(by, by - H) + '" fill="' + sd + '"/>';                                                      // الوجه الجانبي (يبتعد يسارًا)
    b += '<rect x="' + f(x) + '" y="' + f(by - H) + '" width="' + f(W) + '" height="' + f(H) + '" fill="' + fr + '"/>';        // الوجه الأمامي
    b += '<path d="M' + f(x) + ' ' + f(by - H) + 'H' + f(x + W) + 'L' + f(x + W - D) + ' ' + f(by - H - k) + 'H' + f(x - D) + 'Z" fill="#303036"/>';   // السطح
    // الحزام الذهبي على الوجهين
    b += '<path d="' + side(bandY + bh, bandY) + '" fill="#6A4E1E"/>';
    b += '<rect x="' + f(x) + '" y="' + f(bandY) + '" width="' + f(W) + '" height="' + f(bh) + '" fill="#8A6424"/>';
    b += callig(x + 2 * s, x + W - 2 * s, bandY + bh * .64, bh * .42, '#F6DE92', .75 * s);
    b += '<path d="M' + f(x) + ' ' + f(bandY) + 'h' + f(W) + 'M' + f(x) + ' ' + f(bandY + bh) + 'h' + f(W) + '" stroke="' + gg + '" stroke-width="' + f(.8 * s) + '"/>';
    b += '<path d="M' + f(x) + ' ' + f(bandY) + 'L' + f(x - D) + ' ' + f(bandY - k) + 'M' + f(x) + ' ' + f(bandY + bh) + 'L' + f(x - D) + ' ' + f(bandY + bh - k) + '" stroke="' + gg + '" stroke-width="' + f(.6 * s) + '" opacity=".8"/>';
    for (let i = 0; i < 5; i++) { const cx = x + W * (.12 + i * .19); b += '<path d="M' + f(cx - 3 * s) + ' ' + f(bandY + bh + 2 * s) + 'h' + f(6 * s) + 'v' + f(6 * s) + 'l' + f(-3 * s) + ' ' + f(2.6 * s) + 'l' + f(-3 * s) + ' ' + f(-2.6 * s) + 'Z" fill="none" stroke="#B89040" stroke-width="' + f(.6 * s) + '" opacity=".7"/>'; }
    // الباب الذهبي (مرتفع عن الأرض)
    const dx = x + W * .6, dw = W * .2, dtop = by - H * .54, dbot = by - H * .07;
    b += '<rect x="' + f(dx - 2 * s) + '" y="' + f(dtop - 3.2 * s) + '" width="' + f(dw + 4 * s) + '" height="' + f(dbot - dtop + 3.2 * s) + '" fill="#5A4218"/>';
    b += '<rect x="' + f(dx) + '" y="' + f(dtop) + '" width="' + f(dw) + '" height="' + f(dbot - dtop) + '" rx="' + f(1 * s) + '" fill="' + gg + '"/>';
    b += '<rect x="' + f(dx + dw * .12) + '" y="' + f(dtop + 2 * s) + '" width="' + f(dw * .76) + '" height="' + f(dbot - dtop - 4 * s) + '" fill="none" stroke="#8A6220" stroke-width="' + f(.6 * s) + '"/>';
    b += '<path d="M' + f(dx + dw / 2) + ' ' + f(dtop + 2 * s) + 'V' + f(dbot - 2 * s) + '" stroke="#8A6220" stroke-width="' + f(.5 * s) + '"/>';
    b += '<path d="' + khatam(2.2 * s, dx + dw * .3, dtop + (dbot - dtop) * .36) + khatam(2.2 * s, dx + dw * .7, dtop + (dbot - dtop) * .36) + '" fill="#FFF3C4" opacity=".8"/>';
    b += callig(dx - 1.5 * s, dx + dw + 1.5 * s, dtop - 4.6 * s, 1.5 * s, '#F6DE92', .5 * s);
    // قاعدة الشاذروان الرخامية
    b += '<rect x="' + f(x) + '" y="' + f(by - 3 * s) + '" width="' + f(W + 1.5 * s) + '" height="' + f(3.6 * s) + '" fill="#D6CFBF"/><path d="' + side(by + .6 * s, by - 3 * s) + '" fill="#A9A294"/>';
    // لمعة الحافة
    b += '<path d="M' + f(x) + ' ' + f(by - H) + 'V' + f(by - 3 * s) + '" stroke="rgba(255,240,200,.25)" stroke-width="' + f(.8 * s) + '"/>';
    // حِجر إسماعيل: جدار نصف دائري قصير بجوار الوجه الجانبي
    b += '<path d="M' + f(x - 3 * s) + ' ' + f(by + 3 * s) + 'C' + f(x - 30 * s) + ' ' + f(by + 12 * s) + ' ' + f(x - 46 * s) + ' ' + f(by - 2 * s) + ' ' + f(x - D - 2 * s) + ' ' + f(by - k - 1 * s) + '" fill="none" stroke="#EDE8DC" stroke-width="' + f(3.4 * s) + '" stroke-linecap="round"/>';
    return b;
  }

  /* ───────── النقوش الهندسية المتكرّرة (بلاطة 120×120 بلا فواصل) ───────── */
  function tileKhatam(c, sw, o2) {   // نجوم ثمانية في الزوايا والمركز، ومعيّنات بينها، وخطوط تشابك
    let s = '<g fill="none" stroke="' + c + '" stroke-width="' + sw + '">';
    [[0, 0], [120, 0], [0, 120], [120, 120], [60, 60]].forEach(([x, y]) => { s += '<path d="' + khatam(24, x, y) + '"/><path d="' + khatam(13, x, y) + '"/>'; });
    [[60, 0], [0, 60], [120, 60], [60, 120]].forEach(([x, y]) => { s += '<path d="' + starD(4, 12, 5, x, y, 0) + '"/>'; });
    s += '<path d="M24 0L36 24L60 36M96 0L84 24L60 36M0 24L24 36L36 60M120 24L96 36L84 60M24 120L36 96L60 84M96 120L84 96L60 84M0 96L24 84L36 60M120 96L96 84L84 60" opacity="' + (o2 || .7) + '"/>';
    return s + '</g>';
  }
  function tileQuatrefoil(c, sw) {   // دوائر متقاطعة (زهرة رباعية)
    let s = '<g fill="none" stroke="' + c + '" stroke-width="' + sw + '">';
    for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) s += '<circle cx="' + i * 60 + '" cy="' + j * 60 + '" r="42.4"/>';
    return s + '</g><g fill="' + c + '">' + [[30, 30], [90, 30], [30, 90], [90, 90]].map(([x, y]) => '<path d="' + khatam(4, x, y) + '"/>').join('') + '</g>';
  }
  function tileZellige(cols, op) {   // زليج ملوّن: وردة ١٦ في المركز والزوايا ونجوم ثمانية
    let s = '<g opacity="' + (op || 1) + '">';
    [[0, 0], [120, 0], [0, 120], [120, 120], [60, 60]].forEach(([x, y]) => { s += '<path d="' + starD(16, 22, 16.5, x, y, 0) + '" fill="' + cols[0] + '"/><path d="' + khatam(15, x, y) + '" fill="' + cols[1] + '"/><path d="' + khatam(8, x, y) + '" fill="' + cols[2] + '"/>'; });
    [[60, 0], [0, 60], [120, 60], [60, 120]].forEach(([x, y]) => { s += '<path d="' + khatam(12, x, y) + '" fill="' + cols[3] + '"/><path d="' + khatam(5.5, x, y) + '" fill="' + cols[1] + '"/>'; });
    return s + '</g>';
  }
  function tileArabesque(c, sw) {   // رُقش: أغصان حلزونية متصلة عبر حواف البلاطة
    let s = '<g fill="none" stroke="' + c + '" stroke-width="' + sw + '" stroke-linecap="round">';
    s += '<path d="M0 60C20 30 40 30 60 60S100 90 120 60"/><path d="M60 0C30 20 30 40 60 60S90 100 60 120"/>';
    [[30, 38, -40], [90, 82, 140], [38, 90, 50], [82, 30, 230]].forEach(([x, y, r]) => { s += '<path d="M' + x + ' ' + y + 'c6 -10 16 -8 14 2c-2 7 -10 6 -9 0" transform="rotate(' + r + ' ' + x + ' ' + y + ')"/>'; });
    s += '</g><g fill="' + c + '">' + [[60, 60], [0, 0], [120, 0], [0, 120], [120, 120]].map(([x, y]) => '<path d="' + starD(8, 5.5, 2.4, x, y, 0) + '"/>').join('') + '</g>';
    return s;
  }
  const patDef = (d, k, body, sz) => d.def(k, id => '<pattern id="' + id + '" width="120" height="120" patternUnits="userSpaceOnUse"' + (sz && sz !== 120 ? ' patternTransform="scale(' + f2(sz / 120) + ')"' : '') + '>' + body + '</pattern>');

  const fadeMask = (d, k, y0, y1, o0) => { const mg = d.def(k + 'g', LG(0, 0, 0, 1, [[0, '#FFFFFF', o0 == null ? 1 : o0], [y0, '#FFFFFF', .5], [y1, '#FFFFFF', 0]])); return d.def(k, id => '<mask id="' + id + '"><rect width="390" height="492" fill="' + mg + '"/></mask>'); };
  // ضوء يطوف: نقاط تتحرّك على مسار بيضوي (عكس عقارب الساعة كالطواف)
  const orbit = (cx, cy, rx, ry, n, dur, c, rr) => { const p = 'M' + f(cx - rx) + ' ' + f(cy) + 'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx + rx) + ' ' + f(cy) + 'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx - rx) + ' ' + f(cy);
    let s = ''; for (let i = 0; i < n; i++) s += '<circle r="' + f(rr || 1.1) + '" fill="' + c + '" opacity="' + f2(.45 + (i % 3) * .18) + '"><animateMotion dur="' + dur + 's" repeatCount="indefinite" begin="-' + f(dur * i / n) + 's" path="' + p + '"/></circle>';
    return s; };
  // نخلة ظلّية (للمشاهد الليلية)
  function palmSil(x, by, h, lean, c) {
    const tx = x + lean, ty = by - h; let s = '<path d="M' + f(x - 2.6) + ' ' + f(by) + 'Q' + f(x + lean * .3) + ' ' + f(by - h * .5) + ' ' + f(tx - 1.2) + ' ' + f(ty) + 'L' + f(tx + 1.2) + ' ' + f(ty) + 'Q' + f(x + lean * .3 + 3) + ' ' + f(by - h * .5) + ' ' + f(x + 2.6) + ' ' + f(by) + 'Z" fill="' + c + '"/>';
    [[-1, -.2, 1], [-1, .35, .85], [-.6, .75, .7], [1, -.25, 1], [1, .3, .9], [.55, .8, .7], [0, 1, .55]].forEach(([dx, dy, L]) => { const ex = tx + dx * h * .42 * L, ey = ty + dy * h * .2 * L + h * .05;
      s += '<path d="M' + f(tx) + ' ' + f(ty) + 'Q' + f(tx + dx * h * .22 * L) + ' ' + f(ty - h * .12 * L) + ' ' + f(ex) + ' ' + f(ey) + 'Q' + f(tx + dx * h * .2 * L) + ' ' + f(ty - h * .04) + ' ' + f(tx) + ' ' + f(ty + 2) + 'Z" fill="' + c + '"/>'; });
    return s; }
  // برج الساعة (ظلّ بعيد بساعة مضيئة)
  function clockTower(d, x, by, h, c) {
    const w = h * .2; let s = '<path d="M' + f(x - w * 1.6) + ' ' + f(by) + 'V' + f(by - h * .32) + 'H' + f(x - w) + 'V' + f(by - h * .72) + 'H' + f(x - w * .7) + 'V' + f(by - h * .86) + 'L' + f(x) + ' ' + f(by - h) + 'L' + f(x + w * .7) + ' ' + f(by - h * .86) + 'V' + f(by - h * .72) + 'H' + f(x + w) + 'V' + f(by - h * .32) + 'H' + f(x + w * 1.6) + 'V' + f(by) + 'Z" fill="' + c + '"/>';
    s += '<circle cx="' + f(x) + '" cy="' + f(by - h * .64) + '" r="' + f(w * .62) + '" fill="' + glow(d, '#EFFFF4', 'ct') + '"/><circle cx="' + f(x) + '" cy="' + f(by - h * .64) + '" r="' + f(w * .44) + '" fill="#F4FFF6" opacity=".85"/><circle cx="' + f(x) + '" cy="' + f(by - h * .64) + '" r="' + f(w * .44) + '" fill="none" stroke="#3FA66A" stroke-width=".8"/>';
    s += '<path d="M' + f(x) + ' ' + f(by - h * .64) + 'v' + f(-w * .3) + 'M' + f(x) + ' ' + f(by - h * .64) + 'h' + f(w * .22) + '" stroke="#2A5A3E" stroke-width=".8"/>';
    for (let i = 0; i < 8; i++) s += '<rect x="' + f(x - w * 1.3 + (i % 4) * w * .7) + '" y="' + f(by - h * (.08 + Math.floor(i / 4) * .1)) + '" width="' + f(w * .3) + '" height="' + f(h * .03) + '" fill="#FFE3A0" opacity=".5"/>';
    return s + finial(d, x, by - h + 1, .6, gold(d, 'gold', 1)); }
  // مظلّة المسجد النبوي (مفتوحة)
  function umbrella(d, x, by, w, lit) {
    const top = by - w * .78, cg = d.def('umg', LG(0, 0, 0, 1, [[0, '#FFFFFF'], [1, '#D9D4C7']]));
    return '<rect x="' + f(x - 1.2) + '" y="' + f(top) + '" width="2.4" height="' + f(by - top) + '" fill="#E9E5DA"/>' + (lit ? '<ellipse cx="' + f(x) + '" cy="' + f(top + 8) + '" rx="' + f(w * .7) + '" ry="' + f(w * .22) + '" fill="' + glow(d, '#FFF1C8', 'um') + '"/>' : '') +
      '<path d="M' + f(x - w) + ' ' + f(top - 3) + 'Q' + f(x - w * .5) + ' ' + f(top - 11) + ' ' + f(x) + ' ' + f(top - 4) + 'Q' + f(x + w * .5) + ' ' + f(top - 11) + ' ' + f(x + w) + ' ' + f(top - 3) + 'L' + f(x + w * .9) + ' ' + f(top + 2) + 'Q' + f(x + w * .5) + ' ' + f(top - 3.5) + ' ' + f(x) + ' ' + f(top + 3) + 'Q' + f(x - w * .5) + ' ' + f(top - 3.5) + ' ' + f(x - w * .9) + ' ' + f(top + 2) + 'Z" fill="' + cg + '"/>' +
      '<path d="M' + f(x) + ' ' + f(top + 2) + 'L' + f(x - w * .88) + ' ' + f(top) + 'M' + f(x) + ' ' + f(top + 2) + 'L' + f(x + w * .88) + ' ' + f(top) + 'M' + f(x) + ' ' + f(top + 2) + 'L' + f(x - w * .45) + ' ' + f(top - 4) + 'M' + f(x) + ' ' + f(top + 2) + 'L' + f(x + w * .45) + ' ' + f(top - 4) + '" stroke="#BDB6A6" stroke-width=".5"/>';
  }
  // إزنيك: تيوليب، قرنفل، وورقة ساز
  function tulip(d, o) {
    const red = d.def('tlr', LG(0, 0, 0, 1, [[0, '#F0584A'], [1, '#B42222']])), lf = d.def('tll', LG(0, 0, 1, 1, [[0, '#4FB06A'], [1, '#1F7A45']]));
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="M0 0Q-2 -14 0 -26" fill="none" stroke="#2E8A50" stroke-width="1.4"/><path d="M0 -6Q-12 -10 -14 -22Q-4 -16 0 -8Z" fill="' + lf + '"/><path d="M0 -10Q10 -14 11 -24Q3 -19 0 -12Z" fill="' + lf + '"/>' +
      '<path d="M0 -26C-7 -27 -8 -34 -6 -42C-4 -37 -2 -36 0 -40C2 -36 4 -37 6 -42C8 -34 7 -27 0 -26Z" fill="' + red + '" stroke="#FFFFFF" stroke-width=".8"/><path d="M0 -40V-29" stroke="#FFFFFF" stroke-width=".6" opacity=".7"/>');
  }
  function carnation(d, o) {
    const red = d.def('cnr', LG(0, 0, 0, 1, [[0, '#F0584A'], [1, '#B42222']]));
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="M0 0Q2 -12 0 -22" fill="none" stroke="#2E8A50" stroke-width="1.3"/><path d="M-3 -22H3L2 -27H-2Z" fill="#2E8A50"/>' +
      '<path d="M-2 -27C-12 -30 -13 -38 -10 -41L-7 -38L-6 -42L-3 -39L0 -43L3 -39L6 -42L7 -38L10 -41C13 -38 12 -30 2 -27Z" fill="' + red + '" stroke="#FFFFFF" stroke-width=".7"/><path d="M0 -28V-38M-4 -29L-6 -37M4 -29L6 -37" stroke="#FFFFFF" stroke-width=".5" opacity=".7"/>');
  }
  function saz(d, o) {
    const cb = d.def('szb', LG(0, 0, 1, 1, [[0, '#3A6FD0'], [1, '#1B3C8E']]));
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="M0 0C6 -14 14 -30 30 -40C24 -26 18 -12 2 2Z" fill="' + cb + '" stroke="#FFFFFF" stroke-width=".7"/><path d="M3 -3C9 -14 16 -26 26 -35" fill="none" stroke="#5FD3D0" stroke-width="1.6" opacity=".9"/>' +
      '<path d="M8 -12l-3 -1M13 -20l-3 -1M19 -28l-3 -1" stroke="#FFFFFF" stroke-width=".6"/>');
  }
  // زهرة تذهيب (خطوط ذهبية وتعبئة لازوردية/قرمزية)
  function tzFlower(d, o) {
    const gg = gold(d, 'gold'), c = o.c || '#2A4FA8';
    let p = ''; for (let i = 0; i < 6; i++) p += '<path d="M0 0C-3 -4 -3 -8 0 -10C3 -8 3 -4 0 0Z" transform="rotate(' + i * 60 + ')" fill="' + c + '" stroke="' + gg + '" stroke-width=".7"/>';
    return g(o.x, o.y, o.s || 1, o.r || 0, (o.stem ? '<path d="M0 0Q' + f(o.stem * .3) + ' ' + f(o.stem * .5) + ' 0 ' + f(o.stem) + '" fill="none" stroke="' + gg + '" stroke-width="1"/>' : '') + p + '<circle r="2.4" fill="' + gg + '"/><circle r="1" fill="#C2332A"/>');
  }
  // شمسة (ميدالية مذهّبة)
  function shamsa(d, o) {
    const gg = gold(d, 'gold'), lp = o.c || '#1F3F94';
    let s = '<path d="' + starD(32, 50, 43) + '" fill="' + gg + '"/><circle r="42" fill="' + lp + '"/><circle r="42" fill="none" stroke="' + gg + '" stroke-width="1.4"/>';
    s += '<path d="' + starD(16, 36, 26) + '" fill="none" stroke="' + gg + '" stroke-width="1.2"/><path d="' + khatam(22) + '" fill="' + gg + '" opacity=".85"/><path d="' + khatam(14) + '" fill="' + lp + '"/><circle r="6" fill="' + gg + '"/>';
    for (let i = 0; i < 16; i++) s += '<circle cx="' + f(Math.sin(i * Math.PI / 8) * 39) + '" cy="' + f(-Math.cos(i * Math.PI / 8) * 39) + '" r="1.3" fill="#FFF3C4"/>';
    return g(o.x, o.y, (o.r || 50) / 50, o.rot || 0, s, o.op != null ? ' opacity="' + o.op + '"' : '');
  }

  /* ════════════ المشاهد الرئيسية (390×492) ════════════ */
  const HERO = {
    /* ── ليل مكة: الكعبة المشرّفة، المطاف المضيء، أروقة الحرم، والمآذن ── */
    kmakkah(d, gr) {
      const r = rng(11), on = t => gr >= t; let s = '';
      s += '<rect width="390" height="300" fill="' + patDef(d, 'mkp', tileKhatam('#E8C067', .7)) + '" mask="' + fadeMask(d, 'mkm', .18, .55, .8) + '" opacity=".3"/>';
      s += starfield(r, 80, 0, 390, 0, 330);
      s += A.crescent(d, { x: 322, y: 90, r: 20, rot: -32 });
      s += '<path d="M0 356C40 338 70 350 104 338C140 326 172 344 212 336C252 328 292 346 330 334C360 326 380 336 390 332V430H0Z" fill="#101016"/>';
      s += clockTower(d, 346, 392, 150, '#15151B');
      s += arcade(d, { k: 'u', x0: -10, x1: 400, by: 398, n: 20, h: 15, type: 'pointed', wall: '#17171D', lit: ['#FFE9B8', '#B87E2A'], top: 5 });
      [[30, 424, 168], [92, 420, 138], [298, 420, 138], [362, 424, 168]].forEach(([x, by, h]) => { s += minaret(d, { x, by, h, w: h * .062, type: 'haram', fill: '#1D1D24', lit: '#FFE3A6', edge: 'rgba(255,230,170,.25)' }); });
      s += arcade(d, { k: 'l', x0: -10, x1: 400, by: 432, n: 13, h: 28, type: 'pointed', wall: '#1B1B22', lit: ['#FFE6A8', '#C98A2E'], top: 8, band: '#8A6424', bandH: 2, frame: 'rgba(255,225,160,.35)' });
      const mb = d.def('mtf', RG(.5, .3, .7, [[0, '#FFFFFF'], [.55, '#EDE8DC'], [1, '#B9B2A2']]));
      s += '<ellipse cx="195" cy="478" rx="260" ry="54" fill="' + mb + '"/>';
      [[150, 30], [190, 38], [226, 45]].forEach(([rx, ry], i) => { s += '<ellipse cx="195" cy="470" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="' + f2(.55 - i * .12) + '"/>'; });
      s += '<ellipse cx="195" cy="472" rx="150" ry="30" fill="' + glow(d, '#FFF4D6', 'mt') + '" opacity=".8"/>';
      s += orbit(195, 474, 128, 24, 16, 44, '#C9A45A', 1.3);
      if (on(.7)) s += orbit(195, 476, 168, 31, 20, 60, '#B08A48', 1.1);
      if (on(.85)) s += orbit(195, 478, 204, 38, 24, 76, '#9A7A44', 1);
      s += kaaba(d, { x: 200, by: 470, s: 1.38 });
      s += '<g transform="translate(292 478)"><ellipse cy="2" rx="7" ry="2" fill="#000" opacity=".2"/><path d="M-5 0V-9H5V0Z" fill="' + gold(d, 'gold', 1) + '"/><path d="' + domeD('hemi', 0, -9, 5.4, 6) + '" fill="' + gold(d, 'gold', 1) + '"/><path d="M-3 -1V-8M0 -1V-8M3 -1V-8" stroke="#6E5220" stroke-width=".6"/></g>';
      if (on(.6)) s += A.dove(d, { x: 84, y: 250, s: .42, r: -8, flap: true }) + A.dove(d, { x: 118, y: 232, s: .32, r: 6, flap: true });
      return s;
    },
    /* ── المدينة المنوّرة: القبّة الخضراء، المآذن، والمظلّات والنخيل ── */
    kmadinah(d, gr) {
      const r = rng(23), on = t => gr >= t; let s = '';
      s += '<rect width="390" height="300" fill="' + patDef(d, 'mdp', tileQuatrefoil('#E9D8A6', .6)) + '" mask="' + fadeMask(d, 'mdm', .16, .5, .7) + '" opacity=".22"/>';
      s += starfield(r, 60, 0, 390, 0, 320);
      s += A.crescent(d, { x: 64, y: 96, r: 19, rot: -26 });
      s += arcade(d, { k: 'md', x0: -10, x1: 400, by: 430, n: 16, h: 24, type: 'pointed', wall: '#E9E2D0', lit: ['#FFF2CC', '#D9A94E'], top: 16, band: '#C8B88E', bandH: 2, frame: 'rgba(120,90,40,.35)' });
      [[70, 390, 14, 12], [104, 390, 14, 12], [300, 390, 13, 11]].forEach(([x, by, w, h]) => { s += '<rect x="' + (x - w) + '" y="' + (by - 3) + '" width="' + (2 * w) + '" height="4" fill="#DCD4C0"/><path d="' + domeD('hemi', x, by - 3, w, h) + '" fill="' + lg(d, 'sdm', ['#F4F6F8', '#AEB6BE']) + '"/>' + finial(d, x, by - 3 - h + 1, .45); });
      const gd = d.def('gdm', LG(0, 0, 1, 0, [[0, '#1F7A4C'], [.45, '#3FB57A'], [.7, '#2E9A62'], [1, '#155C38']]));
      s += '<rect x="148" y="372" width="58" height="22" fill="#E3DAC4"/><rect x="148" y="372" width="58" height="3" fill="#C8B88E"/>';
      s += '<rect x="156" y="360" width="42" height="13" fill="' + d.def('gdb', LG(0, 0, 1, 0, [[0, '#1C6E45'], [.5, '#2F9C63'], [1, '#155C38']])) + '"/>';
      for (let i = 0; i < 5; i++) s += '<rect x="' + (160 + i * 8) + '" y="363" width="3" height="7" rx="1.5" fill="#E9F5E6" opacity=".7"/>';
      s += '<path d="' + domeD('melon', 177, 361, 23, 50) + '" fill="' + gd + '"/>' + domeRibs(177, 361, 23, 50, 8, '#0F4A2C', .45);
      s += '<path d="M166 330Q170 318 177 312" fill="none" stroke="#DFF7E6" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>';
      s += finial(d, 177, 312, .8);
      [[122, 424, 176], [238, 424, 196], [338, 424, 150]].forEach(([x, by, h]) => { s += minaret(d, { x, by, h, w: h * .06, type: 'madinah', fill: '#EDE6D4', lit: '#FFE3A6', edge: 'rgba(120,90,40,.35)', rail: '#B8923E', cap: '#2E9A62' }); });
      s += '<rect x="-10" y="430" width="410" height="70" fill="' + lg(d, 'mdf', ['#F3EFE6', '#CFC7B6']) + '"/>';
      s += '<path d="M-10 430H400" stroke="#BFB59E" stroke-width="1"/>';
      for (let i = 0; i < 9; i++) s += '<path d="M' + (i * 48 - 20) + ' 492L' + (i * 48 + 6) + ' 432" stroke="#D8D0BE" stroke-width=".8" opacity=".6"/>';
      s += palmSil(14, 446, 92, 8, '#1C3A2A') + palmSil(376, 446, 86, -8, '#1C3A2A');
      [[64, 470, 40], [150, 486, 46], [240, 486, 46], [326, 470, 40]].forEach(([x, by, w]) => { s += umbrella(d, x, by, w, true); });
      if (on(.6)) s += A.dove(d, { x: 300, y: 262, s: .38, r: 8, flap: true }) + A.dove(d, { x: 268, y: 244, s: .3, r: -4, flap: true });
      return s;
    },
    /* ── قصر الحمراء: رواق مفصّص، شبكة السبكة، نافورة وقناة ماء، وسرو ── */
    kalham(d, gr) {
      const on = t => gr >= t; let s = '';
      s += '<path d="M0 330L40 300L80 318L130 288L170 312L220 282L270 310L320 290L360 306L390 296V380H0Z" fill="#C9C2D8" opacity=".75"/><path d="M130 288L140 296L150 292L160 304L170 312L150 305ZM220 282L232 292L244 289L254 300Z" fill="#FFFFFF" opacity=".8"/>';
      s += '<path d="M-10 356H400V372H-10Z" fill="' + lg(d, 'alr', ['#C4703E', '#9A4E2A']) + '"/>';
      for (let i = 0; i < 42; i++) s += '<path d="M' + (i * 10 - 10) + ' 358v12" stroke="#7E3E22" stroke-width=".6" opacity=".6"/>';
      s += '<rect x="-10" y="372" width="410" height="30" fill="#F3E6CF"/>';
      s += '<rect x="-10" y="372" width="410" height="30" fill="' + patDef(d, 'alsb', '<path d="M0 60L30 0L60 60L30 120ZM60 60L90 0L120 60L90 120Z" fill="none" stroke="#CDB58E" stroke-width="2.4"/>', 20) + '" opacity=".9"/>';
      s += arcade(d, { k: 'al', x0: -10, x1: 400, by: 452, n: 9, h: 52, type: 'multifoil', aw: .78, wall: '#EFE0C4', lit: ['#8A6E4E', '#4E3A28'], top: 0, frame: '#C9A96E', fw: 1.1 });
      for (let i = 0; i <= 9; i++) { const x = -10 + i * 410 / 9; s += '<rect x="' + f(x - 2.4) + '" y="398" width="4.8" height="54" fill="#F8EEDA"/><rect x="' + f(x - 3.4) + '" y="396" width="6.8" height="4" fill="#D9C39A"/><rect x="' + f(x - 3.4) + '" y="449" width="6.8" height="3" fill="#D9C39A"/>'; }
      s += '<rect x="-10" y="452" width="410" height="40" fill="' + patDef(d, 'alz', tileZellige(['#1E7F74', '#F3E6CF', '#2D4E9A', '#D4A23A']), 30) + '"/>';
      s += '<rect x="-10" y="452" width="410" height="3" fill="#7E4A2A"/><rect x="-10" y="489" width="410" height="3" fill="#7E4A2A"/>';
      s += '<path d="M176 492L186 452H204L214 492Z" fill="' + lg(d, 'alw', ['#9ED8E6', '#3E98B8']) + '"/><path d="M189 470h12M187 480h16" stroke="#E6FAFF" stroke-width=".8" opacity=".8"/>';
      s += g(195, 452, 1.5, 0, A.fountain(d, { x: 0, y: 0, w: 30 }));
      s += cypress(22, 452, 120, 22, ['#24503A', '#3E7A55']) + cypress(368, 452, 120, 22, ['#24503A', '#3E7A55']);
      if (on(.7)) s += cypress(52, 452, 84, 16, ['#2A5C42', '#4A8A60']) + cypress(338, 452, 84, 16, ['#2A5C42', '#4A8A60']);
      return s;
    },
    /* ── إزنيك العثماني: جامع بقبّة ومآذن رصاصية على الماء، وإفريز خزامى وقرنفل ── */
    kiznik(d, gr) {
      const on = t => gr >= t; let s = '';
      const c1 = lg(d, 'izm', ['#8BA5C8', '#5E7FAA']), c2 = lg(d, 'izm2', ['#A9BEDA', '#7C98BE']);
      s += '<path d="M0 404Q60 396 120 402T240 400T390 402V430H0Z" fill="#9FB6D2" opacity=".7"/>';
      [[112, 424, 150], [142, 424, 176], [248, 424, 176], [278, 424, 150]].forEach(([x, by, h]) => { s += minaret(d, { x, by, h, w: 6, type: 'pencil', fill: c1, cap: '#4E6E98', lit: '#FFF3D0', edge: 'rgba(255,255,255,.35)', rail: '#E6EEF8' }); });
      s += '<rect x="130" y="394" width="130" height="30" fill="' + c1 + '"/>';
      [[152, 394, 18, 14], [238, 394, 18, 14]].forEach(([x, by, w, h]) => { s += '<path d="' + domeD('hemi', x, by, w, h) + '" fill="' + c2 + '"/>'; });
      s += '<path d="' + domeD('hemi', 172, 386, 22, 16) + domeD('hemi', 218, 386, 22, 16) + '" fill="' + c1 + '"/>';
      s += '<rect x="164" y="370" width="62" height="18" fill="' + c1 + '"/>';
      for (let i = 0; i < 9; i++) s += '<rect x="' + f(167 + i * 6.6) + '" y="374" width="2.6" height="8" rx="1.3" fill="#FFF3D0" opacity=".7"/>';
      s += '<path d="' + domeD('hemi', 195, 372, 34, 34) + '" fill="' + d.def('izd', LG(0, 0, 1, 0, [[0, '#6F8FB8'], [.4, '#9DB6D6'], [1, '#56769E']])) + '"/>' + finial(d, 195, 339, .7);
      for (let i = 0; i < 10; i++) s += '<rect x="' + f(134 + i * 12.6) + '" y="404" width="4" height="10" rx="2" fill="#FFF3D0" opacity=".55"/>';
      s += '<rect x="-10" y="424" width="410" height="40" fill="' + lg(d, 'izw', ['#7FA8D6', '#2F5E9E']) + '"/>';
      s += '<g opacity=".28" transform="translate(0 848) scale(1 -1)"><rect x="130" y="394" width="130" height="30" fill="#DDE8F6"/><path d="' + domeD('hemi', 195, 372, 34, 34) + '" fill="#DDE8F6"/></g>';
      for (let i = 0; i < 14; i++) s += '<path d="M' + (i * 30 - 6) + ' ' + (430 + (i % 4) * 8) + 'h' + (12 + (i % 3) * 6) + '" stroke="#FFFFFF" stroke-width=".9" opacity=".5"/>';
      s += '<rect x="-10" y="462" width="410" height="30" fill="#FBFBF7"/><rect x="-10" y="462" width="410" height="3" fill="#1B3C8E"/><rect x="-10" y="466" width="410" height="1.2" fill="#3FB7B2"/>';
      for (let i = 0; i < 10; i++) { const x = 18 + i * 40; s += (i % 2 ? carnation(d, { x, y: 490, s: .55 }) : tulip(d, { x, y: 490, s: .55 })) + saz(d, { x: x + 8, y: 489, s: .32, r: 20 }); }
      s += saz(d, { x: 14, y: 466, s: .8, r: -10 }) + tulip(d, { x: 30, y: 466, s: 1.1, r: -8 }) + carnation(d, { x: 58, y: 466, s: .8, r: 10 });
      s += saz(d, { x: 376, y: 466, s: .8, r: -80 }) + tulip(d, { x: 362, y: 466, s: 1.1, r: 8 }) + carnation(d, { x: 334, y: 466, s: .8, r: -10 });
      if (on(.6)) s += A.bird(d, { x: 70, y: 300, s: .3, pal: 'robin' }) + A.bird(d, { x: 100, y: 286, s: .24, pal: 'robin', flip: true });
      return s;
    },
    /* ── ذهب المماليك: قبّة منقوشة، مئذنة بطبقات، واجهة بمقرنص ومشربيات ── */
    kmamluk(d, gr) {
      const r = rng(41), on = t => gr >= t; let s = '';
      s += '<rect width="390" height="492" fill="' + patDef(d, 'mmp', tileArabesque('#D9B25A', .9)) + '" mask="' + fadeMask(d, 'mmm', .2, .6, .9) + '" opacity=".22"/>';
      s += starfield(r, 50, 0, 390, 0, 300, '#FFE7A8');
      const st = lg(d, 'mms', ['#2A2320', '#15110F']), gg = gold(d, 'gold', 1);
      s += '<rect x="-10" y="398" width="410" height="94" fill="' + st + '"/>';
      for (let i = 0; i < 10; i++) s += '<rect x="-10" y="' + (402 + i * 9) + '" width="410" height="1" fill="#3A302A" opacity=".8"/>';
      s += minaret(d, { x: 92, by: 400, h: 200, w: 15, type: 'mamluk', fill: lg(d, 'mmn', ['#2E2723', '#1A1512']), lit: '#FFD98A', edge: 'rgba(230,190,110,.35)', rail: '#E8C067' });
      s += '<rect x="148" y="332" width="110" height="68" fill="' + st + '"/><path d="M148 332h110" stroke="' + gg + '" stroke-width="1"/>';
      for (let i = 0; i < 7; i++) s += '<path d="M' + (152 + i * 15) + ' 332l7 -7l7 7" fill="#1F1916" stroke="' + gg + '" stroke-width=".6"/>';
      s += '<rect x="170" y="302" width="66" height="24" fill="' + st + '"/>';
      for (let i = 0; i < 6; i++) s += '<path d="' + archD('pointed', 174 + i * 10.4, 322, 5, 14) + '" fill="#FFD98A" opacity=".7"/>';
      const dp = domeD('pointed', 203, 302, 36, 74);
      s += '<path d="' + dp + '" fill="' + d.def('mmd', LG(0, 0, 1, 0, [[0, '#3A302A'], [.45, '#5A4A3E'], [1, '#221C19']])) + '"/>';
      s += '<clipPath id="mmclip"><path d="' + dp + '"/></clipPath><g clip-path="url(#mmclip)" fill="none" stroke="' + gg + '" stroke-width=".8" opacity=".85">';
      for (let i = -3; i <= 3; i++) s += '<path d="M' + (203 + i * 14) + ' 302Q' + (203 + i * 9) + ' 262 203 228"/>';
      for (let j = 0; j < 4; j++) for (let i = -3; i <= 3; i++) s += '<path d="' + khatam(3.2, 203 + i * 11 * (1 - j * .2), 294 - j * 16) + '"/>';
      s += '</g>' + finial(d, 203, 229, .9);
      s += '<path d="' + archD('pointed', 176, 400, 54, 60) + '" fill="#0F0C0B"/><path d="' + archD('pointed', 176, 400, 54, 60) + '" fill="none" stroke="' + gg + '" stroke-width="1.6"/>';
      for (let j = 0; j < 3; j++) for (let i = 0; i < 5 - j; i++) s += '<path d="M' + (184 + j * 4 + i * 9) + ' ' + (358 + j * 7) + 'q4.5 -6 9 0" fill="none" stroke="' + gg + '" stroke-width=".8" opacity=".85"/>';
      s += '<rect x="190" y="378" width="26" height="22" fill="#6E5220"/><path d="M203 378V400" stroke="' + gg + '" stroke-width=".8"/>';
      [[152, 350], [236, 350]].forEach(([x, y]) => { s += '<rect x="' + x + '" y="' + y + '" width="18" height="30" fill="#2A1E14"/><rect x="' + x + '" y="' + y + '" width="18" height="30" fill="' + patDef(d, 'msh', '<path d="M0 0L120 120M120 0L0 120M60 0V120M0 60H120" stroke="#E8C067" stroke-width="10"/>', 8) + '" opacity=".55"/><rect x="' + x + '" y="' + y + '" width="18" height="30" fill="none" stroke="' + gg + '" stroke-width=".8"/>'; });
      s += '<rect x="286" y="352" width="70" height="48" fill="' + st + '"/><path d="' + domeD('pointed', 321, 352, 22, 40) + '" fill="' + d.def('mmd2', LG(0, 0, 1, 0, [[0, '#3A302A'], [.5, '#544438'], [1, '#221C19']])) + '"/>' + finial(d, 321, 313, .6);
      s += '<path d="M-10 420H400" stroke="' + gg + '" stroke-width="1.2" opacity=".6"/>' + callig(-6, 396, 432, 3.4, '#E8C067', .9);
      s += '<path d="M-10 440H400" stroke="' + gg + '" stroke-width="1.2" opacity=".6"/>';
      if (on(.65)) s += mishkat(d, { x: 36, y: 330, s: .9, len: 40, night: true }) + mishkat(d, { x: 356, y: 322, s: .9, len: 40, night: true });
      return s;
    },
    /* ── لازورد أصفهان: إيوان بإطار من البلاط، قبّة فيروزية منقوشة، وبركة تعكس المشهد ── */
    klapis(d, gr) {
      const r = rng(57); let s = '';
      s += starfield(r, 90, 0, 390, 0, 340, '#FFF1C2');
      s += A.crescent(d, { x: 70, y: 84, r: 18, rot: -20 });
      const tq = d.def('lpd', LG(0, 0, 1, 0, [[0, '#1E8C9A'], [.45, '#46C9CF'], [1, '#156C78']]));
      const dp = domeD('onion', 300, 352, 38, 70);
      s += '<rect x="266" y="352" width="68" height="30" fill="#1D3F8A"/><rect x="266" y="356" width="68" height="3" fill="#E8C067"/>';
      s += '<path d="' + dp + '" fill="' + tq + '"/><clipPath id="lpclip"><path d="' + dp + '"/></clipPath><rect x="250" y="280" width="100" height="80" fill="' + patDef(d, 'lpar', tileArabesque('#FFF1C2', 5), 26) + '" clip-path="url(#lpclip)" opacity=".7"/>' + finial(d, 300, 283, .8);
      const pb = lg(d, 'lpp', ['#1F3F94', '#142C6E']);
      s += '<rect x="112" y="300" width="166" height="140" fill="' + pb + '"/>';
      s += '<rect x="112" y="300" width="166" height="140" fill="none" stroke="#E8C067" stroke-width="1.6"/><rect x="118" y="306" width="154" height="134" fill="none" stroke="#46C9CF" stroke-width="3"/>';
      s += '<rect x="118" y="306" width="154" height="10" fill="' + patDef(d, 'lpt', tileZellige(['#46C9CF', '#1F3F94', '#E8C067', '#FFFFFF']), 10) + '"/>';
      s += '<path d="' + archD('persian', 140, 440, 110, 116) + '" fill="#0C1A44"/><path d="' + archD('persian', 140, 440, 110, 116) + '" fill="none" stroke="#E8C067" stroke-width="1.4"/>';
      for (let j = 0; j < 4; j++) for (let i = 0; i < 6 - j; i++) s += '<path d="M' + (150 + j * 8 + i * 16) + ' ' + (350 + j * 10) + 'q8 -9 16 0" fill="none" stroke="#46C9CF" stroke-width=".9" opacity=".8"/>';
      s += '<path d="' + archD('pointed', 178, 440, 34, 44) + '" fill="#FFD98A" opacity=".75"/>';
      [[122, 300, 150], [268, 300, 150]].forEach(([x, by, h]) => { s += minaret(d, { x, by, h, w: 9, type: 'persian', fill: '#E6D3A8', band: '#46C9CF', cap: '#46C9CF' }); });
      s += cypress(40, 446, 110, 20, ['#10304A', '#1D4A66']) + cypress(356, 446, 104, 20, ['#10304A', '#1D4A66']);
      s += '<rect x="-10" y="440" width="410" height="8" fill="#D9C8A0"/>';
      s += '<rect x="-10" y="448" width="410" height="44" fill="' + lg(d, 'lpw', ['#1B4F8C', '#0D2A52']) + '"/>';
      s += '<g opacity=".3" transform="translate(0 896) scale(1 -1)"><rect x="112" y="400" width="166" height="40" fill="#46C9CF"/><path d="' + archD('persian', 140, 440, 110, 40) + '" fill="#0C1A44"/></g>';
      for (let i = 0; i < 12; i++) s += '<path d="M' + (i * 34) + ' ' + (456 + (i % 3) * 10) + 'h' + (14 + (i % 2) * 8) + '" stroke="#9FE3F0" stroke-width=".8" opacity=".45"/>';
      return s;
    },
    /* ── فوانيس رمضان: كثبان عند الغروب، هلال كبير، نخيل ومسجد بعيد، وفوانيس مضيئة ── */
    kfanous(d, gr) {
      const r = rng(63), on = t => gr >= t; let s = '';
      s += starfield(r, 70, 0, 390, 0, 330, '#FFF1C8');
      s += A.crescent(d, { x: 300, y: 110, r: 30, rot: -35 });
      s += '<path d="M0 392C60 368 120 376 180 364C240 352 300 372 390 358V492H0Z" fill="' + lg(d, 'fd1', ['#6A3E6E', '#3E2448']) + '"/>';
      s += '<g fill="#2C1834"><rect x="228" y="352" width="46" height="14"/><path d="' + domeD('onion', 251, 352, 13, 20) + '"/><rect x="280" y="318" width="4" height="48"/><path d="M279 318L282 310L285 318Z"/><rect x="222" y="330" width="3.4" height="36"/><path d="M221 330L223.7 324L226.4 330Z"/></g>';
      s += '<path d="M0 420C80 396 150 410 220 398C290 386 340 404 390 396V492H0Z" fill="' + lg(d, 'fd2', ['#A4566A', '#5E2E4A']) + '"/>';
      s += palmSil(34, 432, 110, 10, '#2A1428') + palmSil(62, 430, 76, -6, '#2A1428') + palmSil(360, 426, 96, -10, '#2A1428');
      s += '<path d="M0 452C90 432 170 446 250 436C320 428 360 440 390 436V492H0Z" fill="' + lg(d, 'fd3', ['#E0A070', '#B0605A']) + '"/>';
      s += '<path d="M40 380Q120 420 200 396Q280 372 350 392" fill="none" stroke="#E8C067" stroke-width=".7" opacity=".7"/>';
      const bz2 = (t) => { const p0 = [40, 380], p1 = [120, 420], p2 = [200, 396], q1 = [280, 372], q2 = [350, 392]; if (t < .5) { const u = t * 2; return [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]]; } const u = (t - .5) * 2; return [(1 - u) * (1 - u) * p2[0] + 2 * (1 - u) * u * q1[0] + u * u * q2[0], (1 - u) * (1 - u) * p2[1] + 2 * (1 - u) * u * q1[1] + u * u * q2[1]]; };
      for (let i = 0; i < 15; i++) { const [x, y] = bz2(i / 14); s += '<circle cx="' + f(x) + '" cy="' + f(y + 2) + '" r="5" fill="' + glow(d, '#FFE3A0', 'bl') + '"/><circle cx="' + f(x) + '" cy="' + f(y + 2) + '" r="1.6" fill="' + ['#FFD27A', '#FF8F7A', '#8FE3FF', '#B6FF9E'][i % 4] + '"/>'; }
      s += fanous(d, { x: 320, y: 448, s: 1.25, pal: 'ruby', night: true }) + fanous(d, { x: 350, y: 462, s: .85, pal: 'teal', night: true }) + fanous(d, { x: 110, y: 462, s: .9, pal: 'amber', night: true });
      if (on(.7)) s += fanous(d, { x: 140, y: 472, s: .6, pal: 'lapis', night: true });
      return s;
    },
    /* ── قبّة الصخرة: مثمّن بالبلاط الأزرق وقبّة ذهبية، والقناطر والسرو والزيتون ── */
    kaqsa(d, gr) {
      const r = rng(71); let s = '';
      s += starfield(r, 80, 0, 390, 0, 330);
      s += A.crescent(d, { x: 76, y: 92, r: 18, rot: -28 });
      s += '<path d="M0 392H30V380H44V392H80V372H96V392H300V376H312V364H322V392H390V420H0Z" fill="#12203E"/>';
      s += '<rect x="-10" y="440" width="410" height="52" fill="' + lg(d, 'aqf', ['#D9CDB4', '#A89A80']) + '"/>';
      for (let i = 0; i < 12; i++) s += '<path d="M' + (i * 36 - 10) + ' 440V492" stroke="#BFB195" stroke-width=".7" opacity=".6"/>';
      s += '<path d="M-10 440H400" stroke="#EFE6D2" stroke-width="1"/>';
      s += arcade(d, { k: 'aq', x0: 18, x1: 104, by: 440, n: 4, h: 30, type: 'pointed', aw: .7, wall: '#D2C6AA', lit: ['#1A2C52', '#0E1A36'], top: 6 });
      s += cypress(126, 440, 70, 14, ['#1B3A2E', '#2E5A44']) + cypress(284, 440, 66, 13, ['#1B3A2E', '#2E5A44']);
      [[330, 438, 20], [356, 440, 16]].forEach(([x, by, rr]) => { s += '<rect x="' + (x - 1.5) + '" y="' + (by - rr) + '" width="3" height="' + rr + '" fill="#4A3A2A"/><circle cx="' + x + '" cy="' + (by - rr - 6) + '" r="' + f(rr * .7) + '" fill="#4F6B4A"/><circle cx="' + (x - 6) + '" cy="' + (by - rr - 2) + '" r="' + f(rr * .5) + '" fill="#5F7E58"/>'; });
      const blue = d.def('aqb', LG(0, 0, 0, 1, [[0, '#3A6FD0'], [1, '#1B3C8E']]));
      s += '<path d="M150 440V398L128 392V436Z" fill="#B8AE98"/><path d="M240 440V398L262 392V436Z" fill="#B8AE98"/><rect x="150" y="398" width="90" height="42" fill="#E6DECB"/>';
      for (let i = 0; i < 5; i++) s += '<path d="' + archD('round', 154 + i * 17.4, 434, 9, 18) + '" fill="#2A3A5A"/>';
      s += '<path d="M150 398V372L128 368V392Z" fill="#244A9A"/><path d="M240 398V372L262 368V392Z" fill="#244A9A"/><rect x="150" y="372" width="90" height="26" fill="' + blue + '"/>';
      s += '<rect x="150" y="372" width="90" height="26" fill="' + patDef(d, 'aqt', tileKhatam('#9FD0FF', 6, .9), 13) + '" opacity=".55"/>';
      s += '<rect x="150" y="372" width="90" height="5" fill="#16307A"/>' + callig(152, 238, 376, 1.6, '#F2D27A', .6);
      for (let i = 0; i < 5; i++) s += '<path d="' + archD('pointed', 157 + i * 17.4, 396, 7, 14) + '" fill="#0E1A36" opacity=".85"/>';
      s += '<path d="M128 368L150 372H240L262 368L240 364H150Z" fill="#D9CDB4"/>';
      s += '<rect x="165" y="344" width="60" height="22" fill="' + blue + '"/><rect x="165" y="344" width="60" height="22" fill="' + patDef(d, 'aqt2', tileKhatam('#9FD0FF', 6, .9), 11) + '" opacity=".5"/>';
      for (let i = 0; i < 6; i++) s += '<rect x="' + f(169 + i * 9.4) + '" y="350" width="3.4" height="10" rx="1.7" fill="#FFE3A6" opacity=".7"/>';
      s += '<rect x="163" y="342" width="64" height="3" fill="#E8C067"/>';
      s += '<circle cx="195" cy="322" r="64" fill="' + glow(d, '#FFE3A0', 'aqgl') + '" opacity=".35"/>';
      s += '<path d="' + domeD('golden', 195, 343, 32, 46) + '" fill="' + d.def('aqg', LG(0, 0, 1, 0, [[0, '#B8862E'], [.35, '#FFE9A0'], [.55, '#F2C64E'], [1, '#8A6220']])) + '"/>';
      s += '<path d="M178 318Q184 304 195 298" fill="none" stroke="#FFF8DA" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
      s += finial(d, 195, 298, .95);
      return s;
    },
    /* ── التذهيب: شمسة مذهّبة، وزهور تذهيب، ولوحة سرلوح لازوردية بالذهب ── */
    ktazhib(d, gr) {
      const r = rng(83); let s = '';
      s += shamsa(d, { x: 195, y: 150, r: 120, op: .09 });
      s += '<rect width="390" height="492" fill="' + patDef(d, 'tzp', tileArabesque('#C99A3A', 1.1)) + '" mask="' + fadeMask(d, 'tzm', .15, .5, .8) + '" opacity=".16"/>';
      const gg = gold(d, 'gold'), lp = '#1F3F94';
      for (let i = 0; i < 14; i++) { const x = 14 + i * 28 + (r() - .5) * 10, st = 20 + r() * 50; s += tzFlower(d, { x, y: 408 - st, s: .7 + r() * .5, stem: st, c: ['#1F3F94', '#C2332A', '#1E8C9A'][i % 3], r: (r() - .5) * 30 }); }
      s += '<rect x="-10" y="404" width="410" height="88" fill="' + gg + '"/><rect x="-10" y="410" width="410" height="76" fill="' + lp + '"/>';
      s += '<rect x="-10" y="410" width="410" height="76" fill="' + patDef(d, 'tza', tileArabesque('#E8C067', 3), 38) + '" opacity=".9"/>';
      s += '<path d="M-10 407H400M-10 489H400" stroke="#FFF3C4" stroke-width=".8"/>';
      s += '<path d="M110 448C110 424 150 416 195 416C240 416 280 424 280 448C280 472 240 480 195 480C150 480 110 472 110 448Z" fill="' + gg + '"/><path d="M118 448C118 428 154 422 195 422C236 422 272 428 272 448C272 468 236 474 195 474C154 474 118 468 118 448Z" fill="#F6EEDA"/>';
      s += callig(134, 256, 452, 5, '#8A6220', 1.2);
      [[62, 448], [328, 448]].forEach(([x, y]) => { s += shamsa(d, { x, y, r: 22 }); });
      s += '<path d="M-10 404h410" stroke="#8A6220" stroke-width="1"/>';
      return s;
    },
  };

  /* ════════════ الرموز الصغيرة (عناوين الأقسام، التبويب، رأس المسبحة) ════════════ */
  const ICON = {
    kmakkah: d => '<circle r="11" fill="' + glow(d, '#FFE3A0', 'ic') + '"/>' + gstar(d, { x: 0, y: 0, s: 9.4 }),
    kmadinah: d => '<rect x="-7" y="4" width="14" height="5" fill="#E3DAC4"/><path d="' + domeD('melon', 0, 4.4, 6.4, 12) + '" fill="' + d.def('icg', LG(0, 0, 1, 0, [[0, '#1F7A4C'], [.5, '#3FB57A'], [1, '#155C38']])) + '"/>' + finial(d, 0, -7.2, .34),
    kalham: d => rosette(d, { x: 0, y: 0, r: 10.5 }),
    kiznik: d => tulip(d, { x: 0, y: 11, s: .5 }),
    kmamluk: d => mishkat(d, { x: 0, y: -1, s: .56, len: 18 }),
    klapis: d => '<rect x="-6" y="4" width="12" height="5" fill="#1D3F8A"/><path d="' + domeD('onion', 0, 4.4, 6.6, 13) + '" fill="' + d.def('icl', LG(0, 0, 1, 0, [[0, '#1E8C9A'], [.5, '#46C9CF'], [1, '#156C78']])) + '"/>' + finial(d, 0, -8.2, .32),
    kfanous: d => fanous(d, { x: 0, y: -1, s: .46 }),
    kaqsa: d => '<rect x="-7" y="3" width="14" height="6" fill="#2A56B0"/><path d="' + domeD('golden', 0, 3.4, 6.4, 10) + '" fill="' + gold(d, 'gold') + '"/>' + finial(d, 0, -6.2, .32),
    ktazhib: d => shamsa(d, { x: 0, y: 0, r: 11 }),
  };
  const icon = th => { const I = ICON[th]; if (!I) return ''; const d = doc('ii'); const b = I(d); return d.svg('-12 -12 24 24', b); };

  /* ════════════ زينة زوايا البطاقات (84×64) ════════════ */
  function cornerBase(d, pal, star) {
    const gg = gold(d, pal || 'gold');
    let s = '<path d="M5 62V18Q5 5 18 5H82" fill="none" stroke="' + gg + '" stroke-width="1.5"/><path d="M10 62V20Q10 10 20 10H82" fill="none" stroke="' + gg + '" stroke-width=".6" opacity=".7"/>';
    [[34, 5], [50, 5], [66, 5]].forEach(([x, y], i) => { s += '<path d="M' + x + ' ' + y + 'c3 -4 7 -4 8 0c-1 4 -5 4 -8 0Z" fill="' + gg + '" opacity="' + (.9 - i * .2) + '"/>'; });
    [[5, 32], [5, 46]].forEach(([x, y], i) => { s += '<path d="M' + x + ' ' + y + 'c-4 3 -4 7 0 8c4 -1 4 -5 0 -8Z" fill="' + gg + '" opacity="' + (.9 - i * .25) + '"/>'; });
    return s + (star === false ? '' : gstar(d, { x: 18, y: 18, s: 9, pal: pal || 'gold' }));
  }
  const CORNER = {
    kmakkah: d => cornerBase(d) + '<circle cx="80" cy="5" r="1.4" fill="#F2D27A"/>',
    kmadinah: d => cornerBase(d, 'gold', false) + g(18, 22, .9, 0, ICON.kmadinah(d)),
    kalham: d => cornerBase(d, 'gold', false) + rosette(d, { x: 18, y: 18, r: 12 }),
    kiznik: d => '<path d="M5 62V18Q5 5 18 5H82" fill="none" stroke="#1B3C8E" stroke-width="1.6"/><path d="M10 62V20Q10 10 20 10H82" fill="none" stroke="#3FB7B2" stroke-width=".9"/>' + saz(d, { x: 14, y: 40, s: .6, r: -20 }) + tulip(d, { x: 24, y: 40, s: .62, r: 20 }) + carnation(d, { x: 50, y: 20, s: .5, r: 80 }),
    kmamluk: d => cornerBase(d) + mishkat(d, { x: 58, y: 30, s: .55, len: 22 }),
    klapis: d => cornerBase(d, 'gold', false) + '<path d="' + khatam(10, 18, 18) + '" fill="#46C9CF" stroke="#E8C067" stroke-width="1"/><path d="' + khatam(5, 18, 18) + '" fill="#1F3F94"/>',
    kfanous: d => cornerBase(d, 'gold', false) + fanous(d, { x: 22, y: 34, s: .62, pal: 'ruby', len: 20 }) + fanous(d, { x: 52, y: 26, s: .44, pal: 'teal', len: 16 }),
    kaqsa: d => cornerBase(d, 'gold', false) + g(18, 20, .95, 0, ICON.kaqsa(d)),
    ktazhib: d => cornerBase(d, 'gold', false) + shamsa(d, { x: 18, y: 18, r: 13 }),
  };
  const corner = th => { const fn = CORNER[th]; if (!fn) return ''; const d = doc('ic'); const b = fn(d); return d.svg('0 0 84 64', b); };

  /* ════════════ نقشة خلفية الصفحات (120×120 تتكرّر بلا فواصل) ════════════ */
  const PATTERN = {
    kmakkah: d => '<g opacity=".13">' + tileKhatam('#D4AF63', .9) + '</g>',
    kmadinah: d => '<g opacity=".12">' + tileQuatrefoil('#B89A4E', .8) + '</g>',
    kalham: d => tileZellige(['#1E7F74', '#FFFFFF', '#2D4E9A', '#D4A23A'], .09),
    kiznik: d => '<g opacity=".1">' + tileQuatrefoil('#1B3C8E', .8) + '</g><g opacity=".12">' + tulip(d, { x: 60, y: 76, s: .42 }) + '</g>',
    kmamluk: d => '<g opacity=".12">' + tileArabesque('#D9B25A', 1.1) + '</g>',
    klapis: d => '<g opacity=".12">' + tileKhatam('#46C9CF', .9) + '</g>',
    kfanous: d => '<g opacity=".16">' + gstar(d, { x: 30, y: 30, s: 4 }) + gstar(d, { x: 90, y: 90, s: 3 }) + '</g><g opacity=".14">' + A.crescent(d, { x: 90, y: 28, r: 6, rot: -30, glow: false }) + '</g><g fill="#FFE3A0" opacity=".2"><circle cx="30" cy="92" r="1.2"/><circle cx="64" cy="58" r=".9"/></g>',
    kaqsa: d => '<g opacity=".12">' + tileKhatam('#7FB0FF', .9) + '</g>',
    ktazhib: d => '<g opacity=".12">' + tileArabesque('#B08738', 1.1) + '</g>',
  };
  const pattern = th => { const fn = PATTERN[th]; if (!fn) return ''; const d = doc('ip'); const b = fn(d); return d.svg('0 0 120 120', b); };

  /* ════════════ إطار المسبحة (340×340 حول الدائرة) ════════════ */
  function tbRing(d, pal, c2) {
    const gg = gold(d, pal || 'gold'); let s = '<circle cx="170" cy="170" r="152" fill="none" stroke="' + gg + '" stroke-width="1.3" opacity=".85"/><circle cx="170" cy="170" r="157" fill="none" stroke="' + gg + '" stroke-width=".5" stroke-dasharray="1.5 3" opacity=".7"/>';
    for (let i = 0; i < 16; i++) { if (i === 0) continue; const a = i * Math.PI / 8, x = 170 + Math.sin(a) * 152, y = 170 - Math.cos(a) * 152; s += '<path d="' + khatam(i % 2 ? 3 : 4.6, x, y) + '" fill="' + (i % 2 ? (c2 || gg) : gg) + '"/>'; }
    return s;
  }
  const TB = {
    kmakkah: d => tbRing(d) + gstar(d, { x: 26, y: 26, s: 10, glow: true }) + gstar(d, { x: 314, y: 314, s: 8, glow: true }) + A.crescent(d, { x: 312, y: 30, r: 11, rot: -30 }),
    kmadinah: d => tbRing(d, 'gold', '#3FB57A') + g(28, 318, 1.6, 0, ICON.kmadinah(d)) + palmSil(318, 336, 44, -6, '#2E6A48'),
    kalham: d => tbRing(d, 'gold', '#1E7F74') + [[24, 24], [316, 24], [24, 316], [316, 316]].map(([x, y]) => rosette(d, { x, y, r: 16 })).join(''),
    kiznik: d => tbRing(d, 'gold', '#1B3C8E') + saz(d, { x: 16, y: 336, s: 1, r: -14 }) + tulip(d, { x: 34, y: 338, s: 1.05, r: -12 }) + carnation(d, { x: 60, y: 338, s: .8, r: 12 }) + saz(d, { x: 324, y: 336, s: 1, r: -76 }) + tulip(d, { x: 306, y: 338, s: 1.05, r: 12 }) + carnation(d, { x: 280, y: 338, s: .8, r: -12 }),
    kmamluk: d => tbRing(d) + mishkat(d, { x: 28, y: 44, s: .9, len: 40 }) + mishkat(d, { x: 312, y: 44, s: .9, len: 40 }),
    klapis: d => tbRing(d, 'gold', '#46C9CF') + gstar(d, { x: 26, y: 26, s: 8, glow: true }) + gstar(d, { x: 314, y: 26, s: 6 }) + gstar(d, { x: 20, y: 316, s: 6 }) + gstar(d, { x: 318, y: 314, s: 8, glow: true }),
    kfanous: d => tbRing(d) + fanous(d, { x: 30, y: 46, s: 1, pal: 'ruby', len: 44, night: true }) + fanous(d, { x: 310, y: 40, s: .9, pal: 'teal', len: 38, night: true }) + A.crescent(d, { x: 318, y: 318, r: 12, rot: -40 }),
    kaqsa: d => tbRing(d, 'gold', '#3A6FD0') + g(26, 322, 1.7, 0, ICON.kaqsa(d)) + gstar(d, { x: 314, y: 26, s: 8, glow: true }),
    ktazhib: d => tbRing(d) + [[26, 26], [314, 26], [26, 314], [314, 314]].map(([x, y]) => shamsa(d, { x, y, r: 16 })).join(''),
  };
  const tbArt = th => { const fn = TB[th]; if (!fn) return ''; const d = doc('it'); const b = fn(d); return d.svg('0 0 340 340', b); };

  /* ════════════ صورة الثيم في قائمة السمات (160×118) ════════════ */
  const THUMB = {
    kmakkah: ['#07070B', '#15151E', '#2A2418'], kmadinah: ['#0B2A20', '#154A36', '#2F6A4A'], kalham: ['#F6D8A8', '#F3C9A0', '#EBD9C0'],
    kiznik: ['#BFD6F2', '#DCE8F7', '#F4F8FC'], kmamluk: ['#0B0908', '#1B1512', '#2E241C'], klapis: ['#0A1638', '#142C6E', '#1F3F94'],
    kfanous: ['#1E1030', '#4A2A5E', '#C0706E'], kaqsa: ['#081230', '#12245A', '#27407E'], ktazhib: ['#FBF4E2', '#F5E8C8', '#EFDDB2'],
  };
  const thumb = th => { const T = THUMB[th], H = HERO[th]; if (!T || !H) return ''; const d = doc('ib'); const bg = d.def('tbg', LG(0, 0, 0, 1, [[0, T[0]], [.55, T[1]], [1, T[2]]]));
    return d.svg('0 0 160 118', '<rect width="160" height="118" fill="' + bg + '"/><g transform="translate(0 -84) scale(.41)">' + H(d, 1) + '</g>', ' preserveAspectRatio="xMidYMid slice"'); };

  /* ════════════ زينة شريط العنوان (120×64) ════════════ */
  const HDRA = {
    kmakkah: d => gstar(d, { x: 40, y: 32, s: 12, glow: true, gc: '#FFF3C4' }) + gstar(d, { x: 78, y: 18, s: 6, pal: 'pale' }) + gstar(d, { x: 100, y: 46, s: 4, pal: 'pale' }),
    kmadinah: d => g(46, 38, 1.9, 0, ICON.kmadinah(d)) + gstar(d, { x: 90, y: 20, s: 5.4, pal: 'pale' }),
    kalham: d => rosette(d, { x: 40, y: 32, r: 16 }) + rosette(d, { x: 82, y: 22, r: 9 }) + rosette(d, { x: 104, y: 46, r: 6 }),
    kiznik: d => tulip(d, { x: 40, y: 60, s: .95, r: -6 }) + carnation(d, { x: 72, y: 60, s: .7, r: 10 }) + saz(d, { x: 20, y: 60, s: .7, r: -20 }),
    kmamluk: d => mishkat(d, { x: 44, y: 30, s: .95, len: 30 }) + gstar(d, { x: 90, y: 30, s: 5, pal: 'pale' }),
    klapis: d => gstar(d, { x: 40, y: 32, s: 11, glow: true }) + '<path d="' + khatam(7, 82, 22) + '" fill="#46C9CF" stroke="#FFF1C2" stroke-width=".8"/>' + gstar(d, { x: 104, y: 46, s: 4, pal: 'pale' }),
    kfanous: d => fanous(d, { x: 36, y: 34, s: .95, pal: 'amber', len: 30 }) + fanous(d, { x: 74, y: 26, s: .7, pal: 'ruby', len: 22 }) + fanous(d, { x: 104, y: 30, s: .55, pal: 'teal', len: 26 }),
    kaqsa: d => g(44, 40, 1.9, 0, ICON.kaqsa(d)) + gstar(d, { x: 92, y: 20, s: 5.4, pal: 'pale' }),
    ktazhib: d => shamsa(d, { x: 40, y: 32, r: 18 }) + tzFlower(d, { x: 82, y: 24, s: 1.2, c: '#C2332A' }) + tzFlower(d, { x: 104, y: 46, s: .9, c: '#1E8C9A' }),
  };
  const hdrArt = th => { const fn = HDRA[th]; if (!fn) return ''; const d = doc('ir'); const b = fn(d); return d.svg('0 0 120 64', b); };

  /* ════════════ مؤشّر الشمس على قوس اليوم ════════════ */
  function marker(th) {
    const d = doc('im'); let b = '<circle r="20" fill="' + glow(d, '#FFE7A8', 'mk') + '"/>';
    if (th === 'kfanous') b += fanous(d, { x: 0, y: -2, s: .55, pal: 'amber' });
    else if (th === 'kiznik') b += '<g class="spin">' + rosette(d, { x: 0, y: 0, r: 9, c: ['#1B3C8E', '#FFFFFF', '#C2332A', '#FFFFFF'] }) + '</g>';
    else if (th === 'kalham') b += '<g class="spin">' + rosette(d, { x: 0, y: 0, r: 9.5 }) + '</g>';
    else b += '<g class="spin">' + gstar(d, { x: 0, y: 0, s: 9 }) + '</g>';
    return '<defs>' + d.defs() + '</defs>' + b;
  }
  /* ════════════ حبّات من الأحجار الكريمة ════════════ */
  const RING = { kmakkah: '#C99A3A', kmamluk: '#E8C067', klapis: '#E8C067', kaqsa: '#E8C067', ktazhib: '#C99A3A', kmadinah: '#D9B25A' };
  function beads(th, pos, rr) {
    const rc = RING[th]; let s = '';
    pos.forEach(([x, y]) => { s += '<circle class="bd" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(rr) + '"/>' + (rc ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(rr) + '" fill="none" stroke="' + rc + '" stroke-width=".7" opacity=".7" pointer-events="none"/>' : '') +
      '<circle cx="' + f(x - rr * .32) + '" cy="' + f(y - rr * .34) + '" r="' + f(rr * .3) + '" fill="#FFFFFF" opacity=".42" pointer-events="none"/>'; });
    return s;
  }
  function beadTop(th, cx, cy, z) {
    const d = doc('ibt'); let b, vb = '-12 -12 24 24';
    if (th === 'kfanous') { b = fanous(d, { x: 0, y: -2, s: .5, pal: 'amber' }); }
    else if (th === 'kiznik') b = tulip(d, { x: 0, y: 11, s: .5 });
    else if (th === 'kalham') b = rosette(d, { x: 0, y: 0, r: 11 });
    else if (th === 'kmadinah' || th === 'kaqsa' || th === 'klapis') b = ICON[th](d);
    else b = '<circle r="12" fill="' + glow(d, '#FFE3A0', 'bt') + '"/>' + gstar(d, { x: 0, y: 0, s: 9.5 });
    return d.svg(vb, b).replace('<svg ', '<svg class="bd-top" x="' + f(cx - z / 2) + '" y="' + f(cy - z / 2) + '" width="' + f(z) + '" height="' + f(z) + '" ');
  }

  /* ════════════ الزينة المتحرّكة فوق المشهد ════════════ */
  const SPK = 'M0 -10C1 -3 3 -1 10 0C3 1 1 3 0 10C-1 3 -3 1 -10 0C-3 -1 -1 -3 0 -10Z';
  function sprites(th) {
    const r = rng(th.length * 173 + 11); let s = '';
    const tw = (n, c) => { for (let i = 0; i < n; i++) s += '<i class="kt" style="left:' + f(4 + r() * 88) + '%;top:' + f(6 + r() * 54) + '%;width:' + Math.round(7 + r() * 8) + 'px;animation-delay:-' + f(r() * 3) + 's;animation-duration:' + f(2.4 + r() * 2.2) + 's"><svg viewBox="-10 -10 20 20"><path d="' + SPK + '" fill="' + c + '"/></svg></i>'; };
    const hang = (items) => items.forEach(([x, L, z, mk]) => { const d = doc('ih'); const b = mk(d);
      s += '<i class="kh" style="left:' + x + '%;animation-delay:-' + f(r() * 3) + 's;animation-duration:' + f(3.4 + r() * 1.8) + 's"><b style="height:' + L + 'px"></b>' + d.svg('-14 -22 28 48', b, ' style="width:' + z + 'px;height:' + Math.round(z * 1.7) + 'px"') + '</i>'; });
    const doves = (n) => { for (let i = 0; i < n; i++) { const d = doc('iv'); const b = A.dove(d, { x: 0, y: 0, s: 1, flap: true }); const dur = 26 + r() * 12;
      s += '<i class="kf k' + (i % 5 + 1) + '" style="top:' + f(14 + r() * 40) + '%;animation-duration:' + f(dur) + 's;animation-delay:-' + f(r() * dur) + 's;width:' + Math.round(26 + r() * 10) + 'px;height:' + Math.round(18 + r() * 6) + 'px">' + d.svg('-26 -20 52 30', b) + '</i>'; } };
    const rise = (n, mk, w0) => { for (let i = 0; i < n; i++) { const d = doc('iq'); const b = mk(d, i);
      s += '<i class="kr" style="left:' + f(6 + r() * 88) + '%;width:' + Math.round((w0 || 9) + r() * 7) + 'px;animation-duration:' + f(9 + r() * 7) + 's;animation-delay:-' + f(r() * 14) + 's">' + d.svg('-11 -11 22 22', b) + '</i>'; } };
    const fall = (n, mk) => { for (let i = 0; i < n; i++) { const d = doc('ik'); const b = mk(d, i);
      s += '<i class="kb" style="left:' + f(r() * 100) + '%;width:' + Math.round(9 + r() * 8) + 'px;animation-duration:' + f(12 + r() * 8) + 's;animation-delay:-' + f(r() * 19) + 's;--dx:' + Math.round(30 + r() * 50) * (r() < .5 ? -1 : 1) + 'px;--r:' + Math.round(160 + r() * 260) + 'deg">' + d.svg('-11 -11 22 22', b) + '</i>'; } };
    const bokehs = (n, c) => { for (let i = 0; i < n; i++) { const z = Math.round(10 + r() * 22); s += '<i class="kbk" style="left:' + f(r() * 94) + '%;top:' + f(20 + r() * 60) + '%;width:' + z + 'px;height:' + z + 'px;--c:' + c[i % c.length] + ';animation-duration:' + f(9 + r() * 7) + 's;animation-delay:-' + f(r() * 14) + 's"></i>'; } };
    const shoot = () => { s += '<i class="ksh" style="top:12%;left:58%;animation-delay:-1s"></i><i class="ksh" style="top:26%;left:86%;animation-delay:-5.5s;animation-duration:9s"></i>'; };
    const petal = (c) => (d) => '<path d="M0 -8C4 -6 5 0 0 8C-5 0 -4 -6 0 -8Z" fill="' + c + '" opacity=".9"/>';
    if (th === 'kmakkah') { tw(14, '#FFE7A8'); doves(2); rise(6, d => gstar(d, { x: 0, y: 0, s: 8 }), 7); }
    else if (th === 'kmadinah') { tw(10, '#FFF6DA'); doves(3); bokehs(5, ['rgba(120,230,170,.35)', 'rgba(255,230,160,.4)']); }
    else if (th === 'kalham') { s += '<i class="kry" style="animation-delay:-2s"></i><i class="kry r2" style="animation-delay:-5s"></i>'; fall(12, (d, i) => A.sakura ? A.sakura(d, { x: 0, y: 0, r: 8, pal: 'white' }) : petal('#FFFFFF')(d)); bokehs(5, ['rgba(255,240,210,.55)', 'rgba(255,210,150,.4)']); }
    else if (th === 'kiznik') { fall(9, (d, i) => i % 3 ? petal('#E0463A')(d) : petal('#3A6FD0')(d)); tw(6, '#FFFFFF'); bokehs(4, ['rgba(255,255,255,.6)', 'rgba(170,210,255,.45)']); }
    else if (th === 'kmamluk') { hang([[12, 30, 20, d => mishkat(d, { x: 0, y: -4, s: .8, len: 16, night: true })], [36, 56, 24, d => mishkat(d, { x: 0, y: -4, s: .9, len: 16, night: true })], [66, 40, 22, d => mishkat(d, { x: 0, y: -4, s: .85, len: 16, night: true })], [88, 62, 20, d => mishkat(d, { x: 0, y: -4, s: .8, len: 16, night: true })]]); tw(10, '#FFE7A8'); rise(5, d => '<circle r="3" fill="' + glow(d, '#FFC56A', 'em') + '"/>', 6); }
    else if (th === 'klapis') { tw(16, '#FFF1C2'); shoot(); hang([[18, 40, 18, d => gstar(d, { x: 0, y: -8, s: 9 })], [44, 66, 14, d => '<path d="' + khatam(9, 0, -8) + '" fill="#46C9CF" stroke="#E8C067" stroke-width="1.2"/>'], [80, 48, 18, d => gstar(d, { x: 0, y: -8, s: 9 })]]); }
    else if (th === 'kfanous') { hang([[8, 26, 22, d => fanous(d, { x: 0, y: 0, s: .9, pal: 'ruby' })], [26, 58, 26, d => fanous(d, { x: 0, y: 0, s: 1, pal: 'amber' })], [48, 36, 20, d => fanous(d, { x: 0, y: 0, s: .85, pal: 'teal' })], [70, 64, 24, d => fanous(d, { x: 0, y: 0, s: .95, pal: 'emerald' })], [90, 30, 22, d => fanous(d, { x: 0, y: 0, s: .9, pal: 'lapis' })]]); tw(10, '#FFF1C8'); shoot(); }
    else if (th === 'kaqsa') { tw(14, '#FFF6DA'); doves(2); shoot(); }
    else if (th === 'ktazhib') { s += '<i class="kry" style="animation-delay:-3s"></i>'; rise(8, (d, i) => i % 2 ? gstar(d, { x: 0, y: 0, s: 8 }) : tzFlower(d, { x: 0, y: 0, s: .9, c: ['#1F3F94', '#C2332A'][i % 2] }), 9); bokehs(6, ['rgba(255,225,150,.5)', 'rgba(255,245,215,.6)']); }
    return s;
  }
  /* جزيء يطير من المسبحة مع كل تسبيحة */
  function particle(th) {
    const d = doc('iP'), R = Math.random(); let b, vb = '-11 -11 22 22';
    if (th === 'kfanous') { b = fanous(d, { x: 0, y: -2, s: .42, pal: ['amber', 'ruby', 'teal', 'emerald', 'lapis'][Math.floor(R * 5)] }); }
    else if (th === 'kiznik') b = R < .5 ? tulip(d, { x: 0, y: 10, s: .45 }) : carnation(d, { x: 0, y: 10, s: .45 });
    else if (th === 'kalham') b = rosette(d, { x: 0, y: 0, r: 9.5 });
    else if (th === 'ktazhib') b = R < .5 ? tzFlower(d, { x: 0, y: 0, s: .95, c: ['#1F3F94', '#C2332A', '#1E8C9A'][Math.floor(R * 6) % 3] }) : gstar(d, { x: 0, y: 0, s: 9 });
    else if (th === 'klapis') b = R < .5 ? '<path d="' + khatam(9.5) + '" fill="#46C9CF" stroke="#E8C067" stroke-width="1.2"/>' : gstar(d, { x: 0, y: 0, s: 9 });
    else if (th === 'kmadinah') b = R < .4 ? '<path d="' + khatam(9.5) + '" fill="#3FB57A" stroke="#E8C067" stroke-width="1.2"/>' : gstar(d, { x: 0, y: 0, s: 9 });
    else b = R < .7 ? gstar(d, { x: 0, y: 0, s: 9.5 }) : '<path d="' + SPK + '" fill="#FFF3C4"/>';
    return d.svg(vb, b);
  }

  /* ════════════ ربط الثيمات الجديدة بوحدة Art ════════════ */
  const MEMO = new Map();
  const uri = (k, mk) => { if (!MEMO.has(k)) { const svg = mk(); MEMO.set(k, svg ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) : ''); } return MEMO.get(k); };
  // يُرفع المشهد قليلًا كي لا يغطّي شريطُ المواقيت عناصرَه، وتُملأ الأرض أسفله بلون أرضية المشهد
  const FLOOR = { kmakkah: '#D9D2C2', kmadinah: '#D6CEBC', kalham: '#7E4A2A', kiznik: '#FBFBF7', kmamluk: '#15110F', klapis: '#0D2A52', kfanous: '#B0605A', kaqsa: '#A89A80', ktazhib: '#1F3F94' };
  const LIFT = 38;
  const hero = (th, gr) => { const d = doc('ih'); return d.svg('0 0 390 492', '<rect x="-10" y="400" width="410" height="100" fill="' + (FLOOR[th] || '#000') + '"/><g transform="translate(0 -' + LIFT + ')">' + HERO[th](d, gr == null ? 1 : gr) + '</g>', ' preserveAspectRatio="xMidYMax slice"'); };
  const B = Object.assign({}, Art), mine = th => !!HERO[th];
  const wrap = (name, fn) => { Art[name] = function (th) { return mine(th) ? fn.apply(null, arguments) : B[name].apply(null, arguments); }; };
  Art.has = th => mine(th) || B.has(th);
  wrap('hero', hero); wrap('icon', icon); wrap('marker', marker); wrap('corner', corner); wrap('pattern', pattern); wrap('tbArt', tbArt); wrap('thumb', thumb);
  wrap('beads', beads); wrap('beadTop', beadTop); wrap('sprites', sprites); wrap('particle', particle);
  wrap('heroURI', (th, L) => { const q = Math.round(Art.growth(L) * 20); return uri('h' + th + q, () => hero(th, q / 20)); });
  wrap('iconURI', th => uri('i' + th, () => icon(th))); wrap('cornerURI', th => uri('c' + th, () => corner(th))); wrap('patternURI', th => uri('p' + th, () => pattern(th)));
  wrap('tbURI', th => uri('t' + th, () => tbArt(th))); wrap('thumbURI', th => uri('b' + th, () => thumb(th))); wrap('hdrURI', th => uri('r' + th, () => hdrArt(th)));
  Art.islamic = Object.keys(HERO);
  Art._i = { khatam, starD, gstar, rosette, fanous, mishkat, tulip, carnation, saz, shamsa, tzFlower, tileKhatam, tileZellige, tileArabesque, tileQuatrefoil, patDef, gold, glow, doc, kaaba, domeD, minaret, archD, cypress, palmSil };
})();

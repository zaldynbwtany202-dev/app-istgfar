/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · «بستانك» — مولّد المشهد الإجرائي (1000 مستوى) · 4.5: ألوان المشهد وأشكاله من السمة
   وسن 4.7 · «البستان المرسوم»: مرج أزهار حقيقي يتنوّع مع النموّ، ممشى حجري ثم جسر خشبي، زنابق ولوتس على
   الجدول، نخيل بسعف وتمر، رمّان، فوانيس، طيور على السياج والمقعد، حمائم، نافورة، ويراعات — وشجرة تتمايل.
   كل مستوى يغيّر المشهد: يطول الجذع ويتفرّع، تكثر الأوراق، ثم تظهر الأزهار
   والثمار والطيور، وتنضمّ أشجار ونخيل وجدول ماء حتى تكتمل «الواحة الغنّاء».
   التوليد حتمي (بذرة ثابتة) فيبقى المشهد نفسه وينمو فقط مع كل مستوى.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const Garden = (() => {
  const STAGES = [
    { from: 1, name: 'بذرة', sub: 'البداية المباركة' },
    { from: 10, name: 'نبتة', sub: 'أول الغيث قطرة' },
    { from: 30, name: 'شتلة', sub: 'تشتدّ ساقها يومًا بعد يوم' },
    { from: 60, name: 'شجرة فتيّة', sub: 'تتفرّع أغصانها' },
    { from: 120, name: 'شجرة وارفة', sub: 'ظلّ ظليل' },
    { from: 200, name: 'شجرة مزهرة', sub: 'تتفتّح أزهارها' },
    { from: 300, name: 'شجرة مثمرة', sub: 'تؤتي أكلها كل حين' },
    { from: 450, name: 'بستان', sub: 'تنضمّ إليها أشجار ونخيل' },
    { from: 650, name: 'روضة', sub: 'يجري بينها الماء' },
    { from: 850, name: 'الواحة الغنّاء', sub: 'أصلها ثابت وفرعها في السماء' },
  ];
  const MAX = 1000;
  const stageOf = L => { let s = 0; for (let i = 0; i < STAGES.length; i++) if (L >= STAGES[i].from) s = i; return s; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = v => Math.round(v * 10) / 10;
  const mix = (c1, c2, t) => { const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    const r = Math.round(lerp(a >> 16, b >> 16, t)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1); };

  // درجات الأوراق المعروفة ← تدرّجات شعاعية (ضوء من الأعلى يمينًا)
  const LEAVES = ['#3A9A62', '#4BAE6E', '#62C07C', '#35915A', '#3B9A62', '#4DAE70', '#2F8455'];
  const LEAF_IX = {}; LEAVES.forEach((c, i) => { LEAF_IX[c] = i; });
  /* وسن 4.5 · «المشاهد»: G = ألوان المشهد وأشكاله من السمة (skins.js)؛ دونه يُرسم البستان كما كان حرفيًا */
  function leafDefs(id, G) {
    const lv = (G && G.leaves) || LEAVES, shade = (G && G.shade) || '#0B2A1A', lite = (G && G.light) || '#FFFFFF', b = (G && G.base) || ['#2F7D4E', '#1E5A38'];
    let d = lv.map((c, i) => '<radialGradient id="' + id + 'L' + i + '" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="' + mix(c, lite, 0.26) + '"/>' +
      '<stop offset=".62" stop-color="' + c + '"/><stop offset="1" stop-color="' + mix(c, shade, 0.28) + '"/></radialGradient>').join('');
    d += '<radialGradient id="' + id + 'B" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="' + b[0] + '"/><stop offset="1" stop-color="' + b[1] + '"/></radialGradient>';
    return d;
  }
  const leafIx = G => { if (!G || !G.leaves) return LEAF_IX; const m = {}; G.leaves.forEach((c, i) => { m[c] = i; }); return m; };
  const curG = () => { try { const k = typeof curSkin === 'function' ? curSkin() : null; return k && k.garden ? k.garden : null; } catch (e) { return null; } };
  function vgrad(id, c, top, bot) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mix(c, '#FFFFFF', top) + '"/><stop offset="1" stop-color="' + mix(c, '#0B1F14', bot) + '"/></linearGradient>';
  }
  const SKY = {
    night: ['#0A1A2A', '#15324A', '#1E4461'], dawn: ['#6D8FB8', '#E9B8A6', '#F8D9B4'], day: ['#7CC3E8', '#B9E3F4', '#EAF7FB'],
    golden: ['#8FC2DE', '#F4DDB0', '#FBE7C0'], sunset: ['#3C3566', '#C06C74', '#F2A774'],
  };

  /* ── الشجرة الرئيسية: تفرّع حتمي ينمو تدريجيًا ── */
  function tree(L, cx, gy, scale, seed, opts) {
    const R = rng(seed), out = { br: [], tips: [] };
    const g = cl((L - 10) / 480, 0, 1), gg = Math.pow(g, 0.62);
    const H = (22 + 78 * gg) * scale, W = (2.4 + 12.5 * gg) * scale;
    const depthF = 1 + 5.6 * Math.pow(g, 0.7);             // عمق التفرّع (عشري: الطبقة الأخيرة تنمو جزئيًا)
    const maxD = Math.ceil(depthF);
    const bark = opts.bark || '#6B4A2E';
    function grow(x, y, ang, len, wid, d) {
      const vis = cl(depthF - d + 1, 0, 1);
      if (vis <= 0) return;
      const l = len * (d === 1 ? 1 : (0.35 + 0.65 * vis));
      const bend = (R() - 0.5) * 0.3;
      const x2 = x + Math.sin(ang) * l, y2 = y - Math.cos(ang) * l;
      const mx = x + Math.sin(ang + bend) * l * 0.55, my = y - Math.cos(ang + bend) * l * 0.55;
      out.br.push({ d: 'M' + f1(x) + ' ' + f1(y) + 'Q' + f1(mx) + ' ' + f1(my) + ' ' + f1(x2) + ' ' + f1(y2), w: Math.max(0.8, wid * (d === 1 ? 1 : vis)) });
      const kids = d >= maxD || vis < 1 ? 0 : (d === 1 ? 3 : (R() < 0.3 ? 3 : 2));
      if (!kids) { out.tips.push({ x: x2, y: y2, s: d, v: vis }); return; }
      for (let k = 0; k < kids; k++) {
        const spread = (0.3 + R() * 0.26) * (kids === 3 ? [-1, 0.05, 1][k] : (k ? 1 : -1));
        grow(x2, y2, ang * 0.5 + spread, len * (0.72 + R() * 0.08), wid * 0.66, d + 1);
      }
    }
    grow(cx, gy, 0, H * 0.5, W, 1);
    const trunk = out.br.map(b => '<path d="' + b.d + '" stroke="' + bark + '" stroke-width="' + f1(b.w) + '" stroke-linecap="round" fill="none"/>').join('');
    // التاج: طبقة داكنة تملأ الفراغات + عناقيد أفتح + لمعات ضوء
    const leafR = (6.5 + 16 * gg) * scale;
    const greens = opts.greens || ['#3A9A62', '#4BAE6E', '#62C07C', '#35915A'];
    const base = opts.base || '#2A7447';
    const LX = opts.lix || LEAF_IX, hiC = opts.hi || '#C8F0B4';
    const lf = c => (opts.gid && LX[c] != null) ? 'url(#' + opts.gid + 'L' + LX[c] + ')' : c;   // تظليل حجمي للأوراق
    let under = '', leaves = '', hi = '';
    const lr = rng(seed + 99);
    out.tips.forEach((t, i) => {
      const k0 = 0.45 + 0.55 * t.v;
      under += '<circle cx="' + f1(t.x) + '" cy="' + f1(t.y + leafR * 0.25) + '" r="' + f1(leafR * 1.25 * k0) + '" fill="' + (opts.gid ? 'url(#' + opts.gid + 'B)' : base) + '"/>';
      const n = 3 + Math.floor(lr() * 2);
      for (let k = 0; k < n; k++) {
        const r = leafR * (0.5 + lr() * 0.45) * k0;
        const ox = (lr() - 0.5) * leafR * 1.4, oy = (lr() - 0.65) * leafR * 1.1;
        leaves += '<circle cx="' + f1(t.x + ox) + '" cy="' + f1(t.y + oy) + '" r="' + f1(r) + '" fill="' + lf(greens[(i + k) % greens.length]) + '"/>';
        if (k === 0 && lr() < (opts.gid ? 0.3 : 0.55)) hi += '<circle cx="' + f1(t.x + ox - r * 0.3) + '" cy="' + f1(t.y + oy - r * 0.35) + '" r="' + f1(r * 0.34) + '" fill="' + hiC + '" opacity="' + (opts.gid ? '.28' : '.45') + '"/>';
      }
    });
    return { svg: trunk, leaves: under + leaves + hi, tips: out.tips, leafR, H };
  }

  function palm(x, gy, h, lean, R) {
    const topx = x + lean, topy = gy - h;
    let s = '<path d="M' + f1(x) + ' ' + f1(gy) + 'Q' + f1(x + lean * 0.15) + ' ' + f1(gy - h * 0.55) + ' ' + f1(topx) + ' ' + f1(topy) + '" stroke="#8A6A42" stroke-width="' + f1(h * 0.075) + '" fill="none" stroke-linecap="round"/>';
    for (let k = 0; k < 6; k++) { const yy = gy - h * (0.12 + k * 0.14); s += '<path d="M' + f1(x + lean * (1 - (gy - yy) / h) * 0.2 - h * 0.035) + ' ' + f1(yy) + 'h' + f1(h * 0.07) + '" stroke="#6E5233" stroke-width="1" opacity=".5"/>'; }
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI * 1.05 + (k / 8) * Math.PI * 1.1 + (R() - 0.5) * 0.15, len = h * (0.52 + R() * 0.14);
      const ex = topx + Math.cos(a) * len, ey = topy + Math.sin(a) * len * 0.5 + len * 0.28;
      const qx = (topx + ex) / 2 + Math.cos(a - 1.2) * len * 0.12, qy = topy - len * 0.22;
      const w2 = h * 0.05;
      s += '<path d="M' + f1(topx) + ' ' + f1(topy) + 'Q' + f1(qx) + ' ' + f1(qy - w2) + ' ' + f1(ex) + ' ' + f1(ey) + 'Q' + f1(qx) + ' ' + f1(qy + w2) + ' ' + f1(topx) + ' ' + f1(topy + 1) + 'z" fill="' + (k % 2 ? '#3E9A5E' : '#2F8450') + '"/>';
    }
    for (let k = 0; k < 5; k++) s += '<circle cx="' + f1(topx - 4 + k * 2) + '" cy="' + f1(topy + 4 + (k % 2) * 2) + '" r="' + f1(h * 0.028 + 0.6) + '" fill="' + (k % 2 ? '#B8702A' : '#D08A35') + '"/>';
    return s;
  }

  function flower(x, y, r, c, mid) {
    let s = '';
    for (let k = 0; k < 5; k++) { const a = k * 1.2566; s += '<circle cx="' + f1(x + Math.cos(a) * r) + '" cy="' + f1(y + Math.sin(a) * r) + '" r="' + f1(r * 0.85) + '" fill="' + c + '"/>'; }
    return s + '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r * 0.7) + '" fill="' + (mid || '#F6D36B') + '"/>';
  }

  /* وسن 4.7 · مرج الأزهار: أنواع تظهر تباعًا مع نموّ البستان (أو أزهار الثيم إن وُجدت) */
  const MEADOW = [['daisy', 0], ['fmn', 100], ['tulip', 160], ['lav', 260], ['hyd', 350]];
  const PAL = { daisy: ['white', 'lemon', 'pink', 'lilac'], fmn: ['', 'pink', 'lilac'], tulip: ['pink', 'yellow', 'lilac', 'peach', 'red', 'white'], hyd: ['blue', 'pink', 'lilac', 'sky'], rose: ['red', 'pink', 'blush'], rtop: ['pink', 'blush', 'red'], sakura: ['pink', 'white', 'deep'] };
  function meadowItem(A, ad, type, pal, x, y, sc, k) {
    switch (type) {
      case 'daisy': return '<path d="M' + f1(x) + ' ' + f1(y) + 'v' + f1(-5 * sc) + '" stroke="#3E8A55" stroke-width="' + f1(0.8 * sc) + '"/>' + A.daisy(ad, { x, y: y - 5 * sc, r: 3.1 * sc, rot: k * 23, pal: pal || PAL.daisy[k % 4] });
      case 'fmn': return A.fmnCluster(ad, { x, y: y - 1.5 * sc, n: 4, spread: 4.2 * sc, r: 1.9 * sc, seed: 60 + k, pal: pal || PAL.fmn[k % 3] });
      case 'tulip': return A.tulip(ad, { x, y: y - 10 * sc, h: 10 * sc, bend: (k % 3 - 1) * 1.2, s: 0.34 * sc, pal: pal || PAL.tulip[k % 6] });
      case 'lav': return A.lavsprig(ad, { x, y, h: 13 * sc, bend: (k % 3 - 1) * 1.5, seed: 30 + k, s: 1 });
      case 'hyd': return A.hydrangea(ad, { x, y: y - 3 * sc, r: 4.6 * sc, pal: pal || PAL.hyd[k % 4] });
      case 'rose': return A.rose3(ad, { x, y: y - 3 * sc, r: 4.2 * sc, pal: pal || PAL.rose[k % 3] });
      case 'rtop': return A.rose(ad, { x, y: y - 2 * sc, r: 3.6 * sc, pal: pal || PAL.rtop[k % 3], rot: k * 37 });
      case 'bud': return A.rosebud(ad, { x, y: y - 6 * sc, s: 0.2 * sc, pal: pal || 'red', r: (k % 3 - 1) * 8 });
      case 'berry': return A.trileaf(ad, { x: x + 2 * sc, y: y - 1, s: 0.16 * sc, r: -30 + k * 17 }) + A.berry(ad, { x, y: y - 3 * sc, s: 0.1 * sc, r: (k % 3 - 1) * 12 });
      case 'blossom': return A.blossom(ad, { x, y: y - 3 * sc, s: 0.26 * sc, r: k * 19 });
      case 'star': return A.star(ad, { x, y: y - 4 * sc, s: 2.6 * sc, r: k * 13, glow: true, pal: pal || 'gold' });
      case 'sparkle': return A.sparkle(ad, { x, y: y - 4 * sc, s: 3.2 * sc, c: '#FFF3C4' });
      case 'sakura': return A.sakura(ad, { x, y: y - 3 * sc, r: 3.2 * sc, pal: pal || PAL.sakura[k % 3], rot: k * 29 });
    }
    return '';
  }
  const BFLY = ['lemon', 'pink', 'sky', 'lilac', 'morpho'];

  /** يرسم مشهد المستوى L. opts: {phase:'day|night|dawn|golden|sunset', w, h, id, lite} */
  function render(L, opts) {
    opts = opts || {};
    L = cl(Math.round(L) || 1, 1, MAX);
    const W = 360, H = 300, id = opts.id || 'g' + L, ph = opts.phase || 'day', bare = !!opts.bare, lite = !!opts.lite;
    const st = stageOf(L), R = rng(4242), sky = SKY[ph] || SKY.day, night = ph === 'night';
    const G = opts.skin !== undefined ? (opts.skin && opts.skin.garden) || null : curG(), gx = G && G.fx || {};
    // وسن 4.7: رسوم «ريشة وسن» للبستان (أزهار، نخيل، طيور، جسر، نافورة…) — وإن غابت يبقى البستان كما كان
    const A = (typeof Art !== 'undefined' && Art._ && Art._.palmTree) ? Art._ : null, ad = A ? A.doc(id + 'a') : null;
    const lix = leafIx(G), tOpts = G ? { greens: G.leaves.slice(0, 4), lix, bark: G.bark, hi: G.hi } : {};
    const lush = cl((L - 1) / 400, 0, 1);                                   // من أرض جافة إلى خضرة
    const hillA = mix('#B9A27A', G ? G.hillA : '#5BA86E', lush), hillB = mix('#A58E66', G ? G.hillB : '#3F8F5A', lush), ground = mix('#9C7B52', G ? G.ground : '#3E8A55', cl((L - 5) / 250, 0, 1));
    const zoom = 1 + 1.55 * Math.pow(1 - cl((L - 1) / 160, 0, 1), 1.4), vw = W / zoom, vh = H / zoom;
    // الشجرة الرئيسية تُحسب مرة واحدة (حتمية) — ويُستفاد منها لضبط «الكاميرا» في المشهد الحي
    const mainTree = L >= 10 ? tree(L, 180, 246, 1, 7, Object.assign({ gid: id }, tOpts)) : null;
    let vb = f1(180 - vw / 2) + ' ' + f1(Math.min(H - vh, 262 - vh * 0.84)) + ' ' + f1(vw) + ' ' + f1(vh);
    if (bare) {
      // لقطة واسعة كلما طالت الشجرة حتى لا تغطي النصوص فوقها (room = المساحة المتاحة بالبكسل)
      let z = 1 / zoom;
      if (mainTree) { const top = Math.min.apply(null, mainTree.tips.map(t => t.y)) - mainTree.leafR * 1.2; z = Math.max(z, (336 - top) * 1.0833 / (opts.room || 190)); }
      const vw2 = W * z, vh2 = H * z;
      vb = f1(180 - vw2 / 2) + ' ' + f1(336 - vh2) + ' ' + f1(vw2) + ' ' + f1(vh2);
    }
    const SK = (G && G.gsky && G.gsky[ph]) || sky;
    let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="' + (opts.par || 'xMidYMid slice') + '" class="garden-svg' + (bare ? ' bare' : '') + (lite ? ' lite' : '') + '">' +
      '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + SK[0] + '"/><stop offset=".6" stop-color="' + SK[1] + '"/><stop offset="1" stop-color="' + SK[2] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'glow"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".75"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6FC3E0"/><stop offset=".5" stop-color="#9EDCF0"/><stop offset="1" stop-color="#5DB2D2"/></linearGradient>' +
      leafDefs(id, G) + (G && G.defs ? G.defs(id) : '') + vgrad(id + 'hA', hillA, 0.16, 0.04) + vgrad(id + 'hB', hillB, 0.12, 0.08) + vgrad(id + 'gr', ground, 0.1, 0.14) + '</defs>' +
      (bare ? '' : '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 's)"/>');
    // النجوم والقمر ليلًا · الشمس نهارًا (في وضع «المشهد الحي» ترسمها السماء الحيّة)
    if (bare) { /* سماء شفافة */ }
    else if (night) {
      const sr = rng(77); for (let k = 0; k < 40; k++) s += '<circle cx="' + f1(sr() * W) + '" cy="' + f1(sr() * 150) + '" r="' + f1(0.4 + sr() * 1.1) + '" fill="#fff" opacity="' + f1(0.35 + sr() * 0.6) + '"' + (!lite && k % 5 === 0 ? ' class="gtw" style="animation-delay:-' + f1(sr() * 3) + 's"' : '') + '/>';
      s += '<path d="M292 44a20 20 0 1 0 14 34 16 16 0 0 1-14-34z" fill="#F4E3A6"/>';
    } else {
      const sy = { dawn: 118, day: 52, golden: 86, sunset: 132 }[ph] || 52;
      s += '<circle cx="292" cy="' + sy + '" r="54" fill="url(#' + id + 'glow)"/><circle cx="292" cy="' + sy + '" r="17" fill="#FFF1C4"/>';
      const cr = rng(13);
      if (A) { for (let k = 0; k < 3; k++) { const cx = 20 + cr() * 250, cy = 22 + cr() * 46; s += '<g class="gcl" style="animation-delay:-' + f1(k * 9) + 's">' + A.cloud(ad, { x: cx, y: cy, s: 0.42 + cr() * 0.22, c: ['#FFFFFF', '#E6F0F8'], k: 'gc', op: 0.92 }) + '</g>'; } }
      else for (let k = 0; k < 3; k++) { const cx = 40 + cr() * 260, cy = 30 + cr() * 50; s += '<g opacity=".85" fill="#fff"><ellipse cx="' + f1(cx) + '" cy="' + f1(cy) + '" rx="26" ry="9"/><ellipse cx="' + f1(cx + 12) + '" cy="' + f1(cy - 6) + '" rx="15" ry="9"/></g>'; }
      // حمائم بيضاء تطير في «الواحة الغنّاء» (850+)
      if (A && L >= 850 && !lite) s += A.dove(ad, { x: 74, y: 88, s: 0.42, r: -6, flap: true }) + A.dove(ad, { x: 112, y: 70, s: 0.34, r: 4, flap: true });
    }
    // التلال البعيدة
    s += '<path d="M-120 188 Q-40 170 0 196 Q60 150 130 178 T260 168 T360 180 Q420 166 480 186 V340 H-120Z" fill="url(#' + id + 'hA)" opacity=".8"/>';
    s += '<path d="M-120 210 Q-50 196 0 214 Q90 186 170 206 T360 198 Q420 190 480 206 V340 H-120Z" fill="url(#' + id + 'hB)" opacity=".92"/>';
    if (gx.hills) s += gx.hills({ L, id, rng, f1, mix, lush, night });
    // الأرض
    const GY = 246;
    s += '<path d="M-120 236 Q-60 228 0 232 Q180 214 360 232 Q420 228 480 236 V340 H-120Z" fill="url(#' + id + 'gr)"/>';
    // ممشى من حجارة (60+) يقود إلى الجسر لاحقًا
    if (A && L >= 60) {
      const path = [[190, 252], [198, 258], [208, 264], [217, 270.5], [228, 277], [239, 284], [251, 291], [263, 298]], n = cl(Math.floor((L - 60) / 18) + 2, 2, path.length);
      path.slice(0, n).forEach(([x, y], k) => { if (L >= 650 && y > 268) return; s += A.stone(ad, { x, y, s: 0.55 + (y - 250) / 60, r: (k % 2 ? 6 : -4) }); });
    }
    // جدول الماء (روضة 650+)
    if (L >= 650) {
      const wv = cl((L - 650) / 120, 0.25, 1);
      s += '<path d="M-130 286 Q-60 ' + f1(270 - 4 * wv) + ' -10 282 Q90 ' + f1(262 - 6 * wv) + ' 180 276 T370 268 Q430 ' + f1(262 - 4 * wv) + ' 490 272 V' + f1(284 + 10 * wv) + ' Q430 ' + f1(292 + 4 * wv) + ' 370 ' + f1(280 + 10 * wv) + ' Q270 ' + f1(292 + 4 * wv) + ' 180 290 T-10 300 Q-60 304 -130 302Z" fill="url(#' + id + 'w)" opacity=".92"/>';
      s += '<path class="gshim" d="M40 284 q10 -3 20 0 M150 283 q12 -3 24 0 M260 278 q10 -3 20 0 M92 290 q8 -2 16 0 M318 284 q9 -2 18 0" stroke="#fff" stroke-width="1.2" opacity=".7" fill="none"/>';
      // زنابق الماء (720+) ولوتس (850+)
      if (A && L >= 720) [[58, 287, 0.8], [120, 289, 0.7], [312, 281, 0.85], [22, 292, 0.6], [206, 286, 0.62]].forEach(([x, y, sc], k) => { if (k > 1 + Math.floor((L - 720) / 60)) return; s += A.lily(ad, { x, y, s: sc, flower: L >= 850 && k % 2 === 0, r: k * 40 }); });
      // جسر خشبي فوق الجدول (700+)
      if (A && L >= 700) s += A.bridge(ad, { x: 250, y: 283, w: 56, h: 9 });
    }
    // العشب (يكثر مع المستوى) — خصلات مرسومة
    const grassN = cl(Math.floor(L / 6), 0, lite ? 24 : 60), gr = rng(21), gc = mix('#6E8F4E', G ? G.grass : '#2F7A45', lush);
    for (let k = 0; k < grassN; k++) {
      const x = gr() * W, y = 234 + gr() * 50, h = 4 + gr() * 6;
      if (L >= 650 && y > 266) continue;
      if (A) s += A.tuft(ad, { x, y, h: h * 1.1, seed: k + 3, c: [mix(gc, '#FFFFFF', 0.35), gc, mix(gc, '#0B1F14', 0.3)] });
      else s += '<path d="M' + f1(x) + ' ' + f1(y) + 'l-2 ' + f1(-h) + 'M' + f1(x) + ' ' + f1(y) + 'l2 ' + f1(-h * 0.8) + 'M' + f1(x) + ' ' + f1(y) + 'l0 ' + f1(-h * 1.1) + '" stroke="' + gc + '" stroke-width="1.2" stroke-linecap="round"/>';
    }
    // أشجار ونخيل البستان (450+)
    const extra = [[450, 70, 0.55, 'tree'], [500, 300, 0.62, 'palm'], [560, 38, 0.5, 'palm'], [620, 318, 0.48, 'tree'], [700, 112, 0.42, 'palm'], [760, 250, 0.44, 'tree'], [880, 18, 0.46, 'tree'], [940, 342, 0.5, 'palm']];
    const back = [];
    extra.forEach(([lv, x, sc, kind], k) => {
      if (L < lv) return;
      const age = cl((L - lv) / 150, 0.35, 1);
      if (kind === 'palm' && !(G && G.palm === false)) back.push(A ? A.palmTree(ad, { x, y: GY - 6 + k % 2 * 4, h: 70 * sc * age + 20, lean: (k % 2 ? -1 : 1) * 10, seed: 500 + k, dates: L >= 300 }) : palm(x, GY - 6 + k % 2 * 4, 70 * sc * age + 20, (k % 2 ? -1 : 1) * 10, rng(500 + k)));
      else { const t = tree(Math.min(600, 150 + (L - lv) * 2), x, GY - 4, sc * (0.6 + 0.4 * age) * (kind === 'palm' ? 0.85 : 1), 900 + k, G ? Object.assign({ gid: id }, tOpts, { greens: G.leaves.slice(2, 5) }) : { greens: ['#3B9A62', '#4DAE70', '#2F8455'], gid: id });
        back.push(t.svg + t.leaves + (gx.tree ? gx.tree({ L: Math.min(600, 150 + (L - lv) * 2), tree: t, rng: rng, seed: 900 + k, f1, mix, night, id, small: true, A, ad }) : '')); }
    });
    s += back.join('');
    // سياج خشبي (250+) ومقعد (400+) — خلف الشجرة
    if (L >= 250) s += A ? A.fence(ad, { x: 12, y: 221, n: 8, sp: 8.6, h: 16 }) : (() => { let fx = ''; for (let k = 0; k < 7; k++) fx += '<rect x="' + (14 + k * 9) + '" y="222" width="3" height="16" rx="1" fill="#A07A4E"/>'; return fx + '<rect x="12" y="227" width="66" height="2.5" fill="#A07A4E"/><rect x="12" y="233" width="66" height="2.5" fill="#A07A4E"/>'; })();
    if (L >= 400) s += A ? A.bench(ad, { x: 262, y: 227 }) : '<g fill="#8A6440"><rect x="262" y="236" width="44" height="4" rx="1.5"/><rect x="264" y="240" width="3" height="9"/><rect x="301" y="240" width="3" height="9"/><rect x="262" y="228" width="44" height="3" rx="1.5"/></g>';
    // الشجرة الرئيسية (تتمايل بهدوء)
    const cx = 180;
    let topTip = null;
    if (L < 10) {
      // بذرة ثم برعم
      s += '<ellipse cx="' + cx + '" cy="' + (GY + 4) + '" rx="30" ry="9" fill="' + mix('#7E5E3C', '#5E7D45', L / 10) + '"/>';
      if (L < 3) s += '<circle cx="' + cx + '" cy="' + (GY - 4) + '" r="22" fill="url(#' + id + 'glow)" opacity=".55"/>';
      s += '<ellipse cx="' + cx + '" cy="' + (GY - 1) + '" rx="7" ry="5" fill="#8B5E34"/><ellipse cx="' + (cx - 2) + '" cy="' + (GY - 2.6) + '" rx="2.6" ry="1.3" fill="#D9B07A" opacity=".85"/>';
      if (L === 2) s += '<path d="M' + cx + ' ' + (GY - 5) + 'l1.5 -3" stroke="#6FB86A" stroke-width="1.6" stroke-linecap="round"/>';
      if (L >= 3) {
        const hh = 6 + L * 2.4;
        let sp = '<path d="M' + cx + ' ' + GY + 'q-1 ' + f1(-hh * 0.6) + ' 0 ' + f1(-hh) + '" stroke="#4E9A55" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
        const ls = 4 + L * 0.9;
        sp += '<path d="M' + cx + ' ' + f1(GY - hh) + 'c-' + f1(ls) + ' -' + f1(ls * 0.2) + ' -' + f1(ls * 1.3) + ' -' + f1(ls * 0.9) + ' -' + f1(ls * 1.6) + ' -' + f1(ls * 0.5) + 'c' + f1(ls * 0.4) + ' ' + f1(ls * 0.9) + ' ' + f1(ls) + ' ' + f1(ls) + ' ' + f1(ls * 1.6) + ' ' + f1(ls * 0.5) + 'z" fill="#5DBB6A"/>';
        if (L >= 6) sp += '<path d="M' + cx + ' ' + f1(GY - hh * 0.7) + 'c' + f1(ls) + ' -' + f1(ls * 0.2) + ' ' + f1(ls * 1.3) + ' -' + f1(ls * 0.9) + ' ' + f1(ls * 1.5) + ' -' + f1(ls * 0.4) + 'c-' + f1(ls * 0.4) + ' ' + f1(ls * 0.9) + ' -' + f1(ls) + ' ' + f1(ls) + ' -' + f1(ls * 1.5) + ' ' + f1(ls * 0.4) + 'z" fill="#4FA85D"/>';
        s += '<g class="gtree" style="transform-origin:' + cx + 'px ' + GY + 'px">' + sp + '</g>';
      }
    } else {
      const bigTree = mainTree || tree(L, cx, GY, 1, 7, { gid: id });
      s += '<ellipse cx="' + cx + '" cy="' + (GY + 3) + '" rx="' + f1(18 + bigTree.leafR * 2.2) + '" ry="' + f1(4 + bigTree.leafR * 0.35) + '" fill="#000" opacity=".12"/>';
      if (L >= 1000) s += '<circle cx="' + cx + '" cy="' + f1(GY - bigTree.H * 0.72) + '" r="' + f1(bigTree.H * 0.95) + '" fill="url(#' + id + 'glow)" opacity=".75"/>';
      let ts = bigTree.svg + bigTree.leaves;
      const tips = bigTree.tips;
      topTip = tips.length ? tips.slice().sort((a, b) => a.y - b.y)[0] : null;
      if (gx.tree) ts += gx.tree({ L, tree: bigTree, rng, seed: 7, f1, mix, night, id, A, ad });
      // الأزهار (200+) — أزهار كرز مرسومة بلون الثيم
      if (L >= 200 && tips.length && !(G && G.bloomArt === false)) {
        const n = cl(Math.floor((L - 200) / 2.5), 0, lite ? 24 : 60), fr = rng(333), cols = (G && G.bloom) || ['#FFD1DC', '#FFFFFF', '#FFC4D6', '#FFE3EC'], bp = (G && G.bloomArt) || ['pink', 'white', 'pink', 'deep'];
        for (let k = 0; k < n; k++) { const t = tips[Math.floor(fr() * tips.length)], x = t.x + (fr() - 0.5) * bigTree.leafR * 1.6, y = t.y + (fr() - 0.5) * bigTree.leafR * 1.2, rr = 1.6 + fr() * 1.2;
          ts += A ? A.sakura(ad, { x, y, r: rr * 1.35, pal: bp[k % bp.length], rot: k * 31 }) : flower(x, y, rr, cols[k % cols.length], G && G.bloomMid); }
      }
      // الثمار (300+) — رمّان
      if (L >= 300 && tips.length && !(G && G.fruit === false)) {
        const n = cl(Math.floor((L - 300) / 5), 0, lite ? 14 : 34), fr = rng(555), fc = (G && G.fruit) || ['#D9483B', '#E88A2A'];
        for (let k = 0; k < n; k++) { const t = tips[Math.floor(fr() * tips.length)], x = t.x + (fr() - 0.5) * bigTree.leafR * 1.5, y = t.y + (fr() - 0.2) * bigTree.leafR;
          ts += (A && !G) ? A.pomegranate(ad, { x, y, s: 0.3 + fr() * 0.06, r: (fr() - 0.5) * 30 }) : '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="3.1" fill="' + (k % 3 ? fc[0] : fc[1]) + '"/><circle cx="' + f1(x - 1) + '" cy="' + f1(y - 1) + '" r="1" fill="#fff" opacity=".6"/>'; }
      }
      // فوانيس معلّقة (150+ واحد · 380+ اثنان · 600+ ثلاثة)
      if (L >= 150 && tips.length > 3) {
        const srt = tips.slice().sort((a, b) => a.y - b.y), nL = L >= 600 ? 3 : L >= 380 ? 2 : 1;
        [0.7, 0.45, 0.88].slice(0, nL).forEach((q, j) => { const t = srt[Math.min(srt.length - 1, Math.floor(srt.length * q))];
          ts += A ? A.lantern(ad, { x: t.x, y: t.y, len: 10 + j * 3, glow: night || j === 0, night, dl: j * 1.3 }) : '<path d="M' + f1(t.x) + ' ' + f1(t.y) + 'v14" stroke="#7A5B35" stroke-width=".8"/><g transform="translate(' + f1(t.x - 4) + ' ' + f1(t.y + 14) + ')"><rect width="8" height="11" rx="2" fill="#F2C35B"/><rect x="1.8" y="2" width="4.4" height="7" rx="1" fill="#FFF1B8"/>' + (night ? '<circle cx="4" cy="5.5" r="14" fill="url(#' + id + 'glow)" opacity=".8"/>' : '') + '</g>'; });
      }
      s += '<g class="gtree" style="transform-origin:' + cx + 'px ' + GY + 'px">' + ts + '</g>';
    }
    // نافورة (900+)
    if (A && L >= 900) s += A.fountain(ad, { x: 102, y: 262, w: 30 });
    // مرج الأزهار الأرضية (40+) — بعمق: البعيد أصغر، والقريب أكبر
    const fl = cl(Math.floor((L - 40) / 7), 0, lite ? 22 : 46), frr = rng(88), fcol = (G && G.flowers) || ['#F7A6B5', '#F6D36B', '#B9A7F2', '#FFFFFF', '#F59C7A'];
    const types = G && G.meadow ? G.meadow : MEADOW.filter(m => L >= m[1]).map(m => m[0]);
    const items = [];
    for (let k = 0; k < fl; k++) {
      const x = 8 + frr() * 344, y = 238 + frr() * 38;
      if (Math.abs(x - cx) < 26 || (L >= 650 && y > 262) || (L >= 900 && Math.abs(x - 102) < 20 && y < 268)) continue;
      items.push([x, y, k]);
    }
    items.sort((a, b) => a[1] - b[1]).forEach(([x, y, k]) => {
      if (!A) { s += '<path d="M' + f1(x) + ' ' + f1(y) + 'v-6" stroke="' + (G && G.stem || '#3E8A55') + '" stroke-width="1"/>' + flower(x, y - 6, 1.7, fcol[k % fcol.length], G && G.flowerMid); return; }
      const tp = String(types[k % types.length]).split(':'), sc = 0.85 + (y - 238) / 38 * 0.6;
      s += meadowItem(A, ad, tp[0], tp[1] || '', x, y, sc, k);
    });
    if (gx.ground) s += gx.ground({ L, id, rng, f1, mix, night, cx, GY, W, A, ad });
    // طيور على السياج والمقعد وأعلى الشجرة (320+)
    if (A && L >= 320 && !lite && !night) {
      const bp = (G && G.birds) || ['robin', 'canary', 'blue'], nb = L >= 640 ? 3 : L >= 480 ? 2 : 1;
      const spots = [[44, 221.5, false], [293, 227.5, true], topTip ? [topTip.x + 4, topTip.y - (mainTree ? mainTree.leafR * 0.9 : 6), true] : null].filter(Boolean);
      spots.slice(0, nb).forEach(([x, y, fl2], j) => { s += A.bird(ad, { x, y: y - 4.6, s: 0.46, pal: bp[j % bp.length], flip: fl2, dl: j * 0.9 }); });
    }
    // فراشات (120+) — مرسومة وترفرف
    const bf = cl(Math.max(Math.floor((L - 110) / 90), G && G.bfMin || 0), 0, lite ? 2 : 5), br2 = rng(64), bfc = (G && G.bfly) || ['#F59C7A', '#B9A7F2', '#F6D36B', '#7FD3E6', '#F7A6B5'];
    const bpal = (G && G.bflyArt) || BFLY;
    for (let k = 0; k < bf; k++) { const x = 40 + br2() * 280, y = 120 + br2() * 90, c = bfc[k % bfc.length];
      if (A) s += '<g class="gbf2" style="animation-delay:-' + f1(k * 1.7) + 's">' + A.bfly(ad, { x, y, s: 0.062 + br2() * 0.018, r: (br2() - 0.5) * 40, pal: bpal[k % bpal.length], flap: !lite }) + '</g>';
      else s += '<g transform="translate(' + f1(x) + ' ' + f1(y) + ')" class="gbf"><ellipse cx="-3" cy="0" rx="3.4" ry="2.4" fill="' + c + '"/><ellipse cx="3" cy="0" rx="3.4" ry="2.4" fill="' + c + '"/><rect x="-.5" y="-2.4" width="1" height="4.8" fill="#3B2F23"/></g>'; }
    const birds = cl(Math.floor((L - 300) / 80), 0, 6), bb = rng(91);
    for (let k = 0; k < birds; k++) { const x = 30 + bb() * 300, y = 40 + bb() * 60; s += '<path class="gfly" style="animation-delay:-' + f1(k * 1.3) + 's" d="M' + f1(x) + ' ' + f1(y) + 'q4 -4 8 0 q4 -4 8 0" stroke="' + (night ? '#C9D6E2' : '#3D4A55') + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>'; }
    // أزهار أمامية في الزاويتين تؤطّر المشهد (200+)
    if (A && L >= 200 && !lite && !bare) {
      const ft = types.length ? types : ['daisy'];
      [[10, 298], [24, 292], [2, 288], [350, 298], [336, 293], [358, 288]].forEach(([x, y], j) => { const tp = String(ft[(j + 2) % ft.length]).split(':'); s += meadowItem(A, ad, tp[0], tp[1] || '', x, y, 2.1 - (j % 3) * 0.3, j + 7); });
    }
    // يراعات ليلية (600+)
    if (night && L >= 600) { const ff = rng(17); for (let k = 0; k < 14; k++) s += '<circle class="gff" style="animation-delay:-' + f1(ff() * 4) + 's" cx="' + f1(ff() * W) + '" cy="' + f1(150 + ff() * 110) + '" r="1.4" fill="#FFF3A8" opacity="' + f1(0.5 + ff() * 0.5) + '"/>'; }
    if (night && !bare) s += '<rect width="' + W + '" height="' + H + '" fill="' + (G && G.nightTint || '#0A1A2A') + '" opacity=".18"/>';
    s += '</svg>';
    if (ad) { const dd = ad.defs(); if (dd) s = s.replace('</defs>', dd + '</defs>'); }
    return s;
  }
  return { render, STAGES, MAX, stageOf };
})();

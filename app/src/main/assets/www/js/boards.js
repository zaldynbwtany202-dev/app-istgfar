/* ════════════════════════════════════════════════════════════════
   وسن 4.8 · «لوحة الاستغفار» و«لوحة الهدية»
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
const IG = {
  st() { const s = Store.get('ig', { d: '', n: 0 }); if (s.d !== dayKey(new Date())) { s.d = dayKey(new Date()); s.n = 0; } return s; },
  gal() { return Store.get('igGal', []); },
  done(d, di) { const g = this.gal(); if (!g.find(x => x.d === d)) { g.push({ d, k: di }); Store.set('igGal', g.slice(-400)); } },
};
SCREENS.istighfar = {
  parent: 'azkar',
  render() {
    const s = IG.st(), n = s.n, D = igDesign(), di = IG_DESIGNS.indexOf(D), gal = IG.gal();
    return hdr('لوحة الاستغفار', '«إني لأستغفر الله في اليوم مئة مرة» — رواه مسلم', { back: true, compact: true, actions: [{ id: 'ig-r', icon: 'refresh', label: 'إعادة' }] }) +
      '<div class="center" style="padding:18px 16px 0"><div style="font-family:var(--font-d);font-size:23px;line-height:1.8" class="gold">أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ</div><div class="faint" style="font-size:12.5px">تصميم اليوم: ' + esc(D.n) + '</div></div>' +
      '<button class="igwrap" id="ig-g" aria-label="أستغفر الله">' + igBoardSVG(n, D) + '<span class="ig-n"><b class="num" id="ig-n">' + N(n) + '</b><small>من ' + N(100) + '</small></span></button>' +
      '<div class="mx mt"><button class="btn primary block" id="ig-b" style="height:56px;font-size:17px">' + icon('plus') + 'أستغفر الله</button></div>' +
      '<div class="row mx" style="gap:10px;margin-top:10px"><button class="btn ghost grow" id="ig-sh">' + icon('share') + 'شاركي اللوحة</button><button class="btn ghost grow" data-go="gift">' + icon('sparkle') + 'لوحة الهدية</button></div>' +
      (gal.length ? sec('لوحاتك المكتملة · ' + N(gal.length)) + '<div class="ig-gal mx">' + gal.slice(-24).reverse().map(x => '<div class="ig-gi">' + igBoardSVG(100, IG_DESIGNS[x.k] || D, 'igm', true) + '<span>' + esc(fmtDateShort(x.d)) + '</span></div>').join('') + '</div>' : '');
  },
  mount(el) {
    const add = () => { const s = IG.st(); if (s.n >= 100) { toast('أتممتِ لوحة اليوم — تقبّل الله'); return; }
      s.n++; Store.set('ig', s); Growth.add('ist', 1); if (s.n === 100) Habits.syncAuto();
      $('#ig-n').textContent = N(s.n); const t = $('.igb .igt[data-k="' + (s.n - 1) + '"]', el), D = igDesign();
      if (t) { const ri = IG_RINGS.findIndex((c, i) => s.n - 1 < IG_RINGS.slice(0, i + 1).reduce((a, b) => a + b, 0)); const j = s.n - 1 - IG_RINGS.slice(0, ri).reduce((a, b) => a + b, 0);
        const p = t.children; p[0].setAttribute('fill', D.c[(j + ri) % D.c.length]); p[0].setAttribute('stroke', D.g); p[0].setAttribute('stroke-width', '.8'); p[1].setAttribute('fill', D.g); p[1].setAttribute('stroke', 'none'); p[1].setAttribute('opacity', '.95');
        t.classList.add('on', 'pop'); }
      try { TasSound.play(); } catch (e) {}
      vibrate(s.n === 100 ? 220 : 12);
      if (s.n === 100) { IG.done(s.d, IG_DESIGNS.indexOf(D)); const c = $('.igb .ig-c', el); if (c) c.setAttribute('fill', D.g); const gl = $('.igb .ig-glow', el); if (gl) gl.setAttribute('opacity', '1');
        try { TasSound.play(null, true); } catch (e) {} const r = $('#ig-g', el).getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2); try { kwCelebrate(artKey()); } catch (e) {}
        toast('اكتملت لوحة اليوم — غفر الله لكِ'); setTimeout(() => Router.refresh(), 2200); } };
    $('#ig-b', el).onclick = add; $('#ig-g', el).addEventListener('pointerdown', e => { e.preventDefault(); add(); });
    $('#ig-r', el).onclick = () => confirmSheet('إعادة لوحة اليوم؟', 'سيُصفَّر عدّاد استغفار اليوم.', 'نعم، أعيديها', () => { Store.set('ig', { d: dayKey(new Date()), n: 0 }); Router.refresh(); });
    $('#ig-sh', el).onclick = () => { const s = IG.st(); Gift.share({ art: giftArtKey(), name: '', rel: 'self', what: 'ist', n: s.n, board: true }); };
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
      '<button class="btn gold block" id="gf-s" style="margin-top:16px;height:54px">' + icon('share') + 'شاركي اللوحة</button>' +
      '<div class="faint" style="font-size:12px;margin-top:8px;text-align:center">الأدعية من السنّة الصحيحة والقرآن الكريم · يمكنك كتابة دعائك الخاص</div></div>';
  },
  mount(el) {
    const draw = debounce(async () => { const c = $('#gf-c', el); if (!c) return; const r = await Gift.render(Gift.st); c.getContext('2d').drawImage(r, 0, 0); }, 250);
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

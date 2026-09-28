/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · «السماء الحيّة» — بصمة وسن
   لون السماء يتبع مواقيت يومك الحقيقية لحظة بلحظة: عتمة الليل، زرقة ما قبل
   الفجر، وردية الشروق، صفاء الضحى، دفء العصر، حمرة المغرب… والقمر بطَوره
   الحقيقي حسب اليوم الهجري، والنجوم تتلألأ ليلًا فوق بستانك.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const LivingSky = (() => {
  // [أعلى، وسط، أفق] · نجوم (0..1) · توهّج
  const P = {
    night:     { c: ['#0A1330', '#122247', '#1D315C'], st: 1, g: 'rgba(196,212,255,.20)' },
    predawn:   { c: ['#141A42', '#2B3166', '#66558A'], st: 0.75, g: 'rgba(214,180,255,.24)' },
    dawn:      { c: ['#314B86', '#8A82B2', '#F0B39A'], st: 0.12, g: 'rgba(255,196,160,.55)' },
    morning:   { c: ['#4B8BCB', '#93C2E6', '#F2DDC6'], st: 0, g: 'rgba(255,240,205,.55)' },
    day:       { c: ['#3E8BD0', '#83BDE9', '#CDE8F7'], st: 0, g: 'rgba(255,248,222,.55)' },
    noon:      { c: ['#3886CE', '#7CB9E9', '#C9E6F6'], st: 0, g: 'rgba(255,250,230,.6)' },
    afternoon: { c: ['#4F8CC8', '#A0C6E2', '#EEDCB6'], st: 0, g: 'rgba(255,226,170,.55)' },
    golden:    { c: ['#56799F', '#CDA686', '#F3AB69'], st: 0, g: 'rgba(255,196,120,.62)' },
    sunset:    { c: ['#30356B', '#A4586F', '#EF8558'], st: 0.05, g: 'rgba(255,150,100,.62)' },
    dusk:      { c: ['#181F4D', '#40376B', '#8A546C'], st: 0.5, g: 'rgba(230,160,190,.28)' },
  };
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const toHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mixC = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
  const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const M = 60000;
  /* وسن 4.5 · «المشاهد»: ألوان السماء من السمة إن كان لها مشهد خاص (skins.js) */
  const skyP = () => { try { const k = typeof curSkin === 'function' ? curSkin() : null; return k && k.sky ? k.sky : P; } catch (e) { return P; } };
  function frames(now) {
    const t = Times.forDay(Times.locDay(now)), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), d1 = new Date(d0.getTime() + 864e5);
    const at = (base, min) => base && !isNaN(base) ? new Date(base.getTime() + min * M) : null;
    const f = [[d0, 'night'], [at(t.fajr, -50), 'night'], [t.fajr, 'predawn'], [at(t.sunrise, -18), 'dawn'], [at(t.sunrise, 24), 'morning'],
      [at(t.sunrise, 120), 'day'], [t.dhuhr, 'noon'], [t.asr, 'afternoon'], [at(t.maghrib, -45), 'golden'], [at(t.maghrib, -4), 'sunset'],
      [at(t.maghrib, 26), 'dusk'], [at(t.isha, 22), 'night'], [d1, 'night']];
    const ok = f.filter(x => x[0] && !isNaN(x[0]));
    // ضمان الترتيب الزمني (خطوط العرض العليا قد تُربك المواقيت)
    const out = []; ok.forEach(x => { if (!out.length || x[0] > out[out.length - 1][0]) out.push(x); });
    return out;
  }
  /** حالة السماء الآن: الألوان الثلاثة، الحبر المناسب للنص، كثافة النجوم، التوهّج، والطور */
  function at(now) {
    now = now || new Date();
    let a, b, fr;
    const lock = typeof skyLock === 'function' && skyLock();   // وسن 6.1: «مشرقة دائمًا»
    try { fr = lock ? null : frames(now); } catch (e) { fr = null; }
    if (lock) { a = b = [now, 'day']; }
    else if (!fr || fr.length < 2) { const h = now.getHours(); const k = h < 5 || h >= 20 ? 'night' : h < 7 ? 'dawn' : h < 16 ? 'day' : h < 18 ? 'golden' : 'sunset'; a = b = [now, k]; }
    else { for (let i = 0; i < fr.length - 1; i++) if (now >= fr[i][0] && now < fr[i + 1][0]) { a = fr[i]; b = fr[i + 1]; break; } if (!a) { a = b = fr[fr.length - 1]; } }
    const u = a === b ? 0 : (now - a[0]) / (b[0] - a[0]), s = u * u * (3 - 2 * u);   // انتقال ناعم
    const SP = skyP(), A = SP[a[1]] || P[a[1]], B = SP[b[1]] || P[b[1]];
    const c = A.c.map((x, i) => mixC(x, B.c[i], s));
    const stars = A.st + (B.st - A.st) * s;
    const ink = (lum(c[1]) * 0.6 + lum(c[0]) * 0.4) > 0.3 ? 'dark' : 'light';
    return { top: c[0], mid: c[1], low: c[2], stars, glow: s < 0.5 ? A.g : B.g, phase: s < 0.5 ? a[1] : b[1], ink, night: stars > 0.45 };
  }
  /** طور القمر من اليوم الهجري: الإضاءة (0..1) وهل هو متزايد */
  function moon(now) {
    now = now || new Date();
    let day = 15; try { day = hijriOf(now).day; } catch (e) {}
    const age = Math.max(0, day - 1 + now.getHours() / 24), ph = (age / 29.53) * 2 * Math.PI;
    return { age, illum: (1 - Math.cos(ph)) / 2, waxing: age < 14.77, phi: ph % (2 * Math.PI) };
  }
  /** رسم القمر بطَوره: قرص خافت + الجزء المضيء */
  function moonSVG(cx, cy, r, m) {
    const k = m.illum, phi = m.waxing ? Math.PI * k : Math.PI * k;   // زاوية الطور المكافئة
    const rx = Math.abs(Math.cos(Math.acos(1 - 2 * k))) * r;           // نصف قطر خط الفصل
    const gib = k > 0.5, top = (cx) + ' ' + (cy - r), bot = cx + ' ' + (cy + r);
    let d;
    if (m.waxing) d = 'M' + top + 'A' + r + ' ' + r + ' 0 0 1 ' + bot + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (gib ? 1 : 0) + ' ' + top + 'Z';
    else d = 'M' + top + 'A' + r + ' ' + r + ' 0 0 0 ' + bot + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (gib ? 0 : 1) + ' ' + top + 'Z';
    void phi;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 2.4) + '" fill="url(#mglow)"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#DCE4F7" opacity=".13"/>' +
      (k > 0.02 ? '<path d="' + d + '" fill="url(#mfill)"/>' : '');
  }
  /** نجوم متلألئة (حتمية التوزيع) */
  function starsHTML(n, seed) {
    let s = seed || 7, out = '';
    const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < n; i++) {
      const x = R() * 100, y = R() * 62, z = 0.8 + R() * 1.7, o = 0.35 + R() * 0.65, d = (R() * 5).toFixed(2), du = (2.6 + R() * 3.4).toFixed(2);
      out += '<i style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%;width:' + z.toFixed(2) + 'px;height:' + z.toFixed(2) + 'px;--o:' + o.toFixed(2) + ';animation-delay:-' + d + 's;animation-duration:' + du + 's"></i>';
    }
    return out + '<b class="shoot"></b>';
  }
  /** تطبيق ألوان السماء على عنصر (متغيرات CSS) */
  function paint(el, sky) {
    if (!el) return;
    el.style.setProperty('--s1', sky.top); el.style.setProperty('--s2', sky.mid); el.style.setProperty('--s3', sky.low);
    el.style.setProperty('--stars', sky.stars.toFixed(2)); el.style.setProperty('--sglow', sky.glow);
    el.classList.toggle('lite', sky.ink === 'dark'); el.dataset.ph = sky.phase; el.classList.toggle('night', sky.night);
  }
  return { at, moon, moonSVG, starsHTML, paint, P };
})();

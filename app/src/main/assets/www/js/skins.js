/* ════════════════════════════════════════════════════════════════
   وسن 4.5 · «المشاهد» — سمات كاملة للبنات، لا ألوانًا فقط
   كل مشهد يبدّل: ألوان «السماء الحيّة» في كل طور من اليوم (وتبقى تتبع مواقيتك)،
   وشجرة البستان وتلاله وأزهاره، وزينة متحرّكة ناعمة، وحبّات المسبحة.
   الهوية نفسها: السماء الحيّة + البستان + نجمة وسن — بثوب مختلف.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const SKINS = (() => {
  const f1 = v => Math.round(v * 10) / 10;
  /* ── وردة صغيرة (لمشهد «حديقة الورود») ── */
  function rose(x, y, r, gid, leaf) {
    return '<g transform="translate(' + f1(x) + ' ' + f1(y) + ')">' +
      (leaf ? '<path d="M' + f1(-r * 0.6) + ' ' + f1(r * 0.5) + 'q' + f1(-r * 1.3) + ' ' + f1(-r * 0.1) + ' ' + f1(-r * 1.7) + ' ' + f1(r * 0.9) + 'q' + f1(r * 1.1) + ' ' + f1(r * 0.5) + ' ' + f1(r * 1.7) + ' ' + f1(-r * 0.9) + 'z" fill="' + leaf + '"/>' : '') +
      '<circle r="' + f1(r) + '" fill="url(#' + gid + ')"/>' +
      '<path d="M' + f1(-r * 0.5) + ' ' + f1(-r * 0.05) + 'a' + f1(r * 0.5) + ' ' + f1(r * 0.5) + ' 0 1 1 ' + f1(r * 0.55) + ' ' + f1(r * 0.5) + 'a' + f1(r * 0.28) + ' ' + f1(r * 0.28) + ' 0 1 1 ' + f1(-r * 0.2) + ' ' + f1(-r * 0.52) + '" fill="none" stroke="rgba(90,10,40,.45)" stroke-width="' + f1(Math.max(0.5, r * 0.16)) + '" stroke-linecap="round"/>' +
      '<circle cx="' + f1(-r * 0.35) + '" cy="' + f1(-r * 0.4) + '" r="' + f1(r * 0.22) + '" fill="#fff" opacity=".35"/></g>';
  }
  const roseDefs = (id, cols) => cols.map((c, i) => '<radialGradient id="' + id + 'R' + i + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".6" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient>').join('');
  const ROSE_C = [['#FF8FB0', '#D6336C', '#8E1A45'], ['#FFC2D4', '#EF6F96', '#B03A64'], ['#FFF4F2', '#FFD3DF', '#E59AB1']];

  return {
    /* ─────────── أزهار الكرز · فاتح وردي ─────────── */
    sakura: {
      n: 'أزهار الكرز',
      sky: {
        night: { c: ['#231433', '#3A2150', '#5E3366'], st: 1, g: 'rgba(255,196,228,.22)' },
        predawn: { c: ['#2C1A45', '#50306A', '#94608C'], st: 0.72, g: 'rgba(255,190,225,.26)' },
        dawn: { c: ['#5E5A9E', '#C89AC4', '#FFCFC7'], st: 0.1, g: 'rgba(255,205,200,.6)' },
        morning: { c: ['#8FA2E2', '#D9C3EC', '#FFE1E8'], st: 0, g: 'rgba(255,236,240,.6)' },
        day: { c: ['#94ABEA', '#DCCBEF', '#FDE6EF'], st: 0, g: 'rgba(255,246,250,.6)' },
        noon: { c: ['#8DA8EA', '#D7CBF0', '#FBE8F2'], st: 0, g: 'rgba(255,250,252,.6)' },
        afternoon: { c: ['#98A6E2', '#E3C6E6', '#FFE2DC'], st: 0, g: 'rgba(255,228,220,.6)' },
        golden: { c: ['#9B8FD0', '#EDB2C8', '#FFD2BC'], st: 0, g: 'rgba(255,205,180,.62)' },
        sunset: { c: ['#4B3576', '#C96F9E', '#FFA7A0'], st: 0.05, g: 'rgba(255,160,170,.62)' },
        dusk: { c: ['#27183F', '#55336B', '#9A5A86'], st: 0.5, g: 'rgba(240,170,210,.3)' },
      },
      garden: {
        leaves: ['#F7C1D3', '#F3AEC6', '#FAD3E0', '#EE9DBA', '#F6C8D8', '#F2B7CC', '#E98FAF'],
        shade: '#8E3B63', light: '#FFFFFF', base: ['#E59AB8', '#C9759A'], hi: '#FFFFFF', bark: '#5B3A3F',
        hillA: '#DDBBD7', hillB: '#A9D1A0', ground: '#8CC286', grass: '#5FA868', stem: '#4E9A5E',
        bloom: ['#FFFFFF', '#FFE6EF', '#FFD3E2', '#FFF5F8'], bloomMid: '#F28CB0', fruit: false,
        flowers: ['#FFFFFF', '#F7A6C1', '#FFD6E4', '#F48FB1', '#FBE3EC'],
        bfly: ['#F7A6C1', '#FFFFFF', '#E7B6F0', '#FFD1DC', '#F48FB1'], bfMin: 3, palm: false, nightTint: '#2A1433',
        gsky: { day: ['#A9B8EE', '#E6D2F0', '#FDEAF1'], night: ['#231433', '#3A2150', '#5E3366'], dawn: ['#6C66A8', '#E0A9C6', '#FFD6CB'], golden: ['#A596D6', '#F2BDCD', '#FFD8C2'], sunset: ['#4B3576', '#C96F9E', '#FFA7A0'] },
        fx: {
          // بتلات متساقطة على العشب حول الشجرة
          ground({ rng, f1, cx, GY }) { const r = rng(515); let s = '';
            for (let k = 0; k < 34; k++) { const x = cx + (r() - 0.5) * 230, y = GY - 6 + r() * 30, a = Math.round(r() * 180);
              s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y) + '" rx="1.9" ry="1.1" fill="' + (k % 3 ? '#F7B8CC' : '#FFFFFF') + '" opacity=".9" transform="rotate(' + a + ' ' + f1(x) + ' ' + f1(y) + ')"/>'; }
            return s; },
        },
      },
      beads: ['#FFF3F7', '#F4B3C9', '#C4708F'],
      fx: 'petals', ink: ['#4A2140', 'rgba(74,33,64,.72)', 'rgba(74,33,64,.24)'],
    },
    /* ─────────── حديقة الورود · داكن وردي ذهبي ─────────── */
    roses: {
      n: 'حديقة الورود',
      sky: {
        night: { c: ['#170B1C', '#2E1430', '#4D2142'], st: 1, g: 'rgba(255,180,205,.2)' },
        predawn: { c: ['#1F0F28', '#3E1E44', '#7A3E62'], st: 0.75, g: 'rgba(255,175,210,.24)' },
        dawn: { c: ['#46295E', '#A9658E', '#F2AE9E'], st: 0.12, g: 'rgba(255,190,175,.55)' },
        morning: { c: ['#6F5B9E', '#C99BC0', '#F9D4D2'], st: 0, g: 'rgba(255,225,225,.55)' },
        day: { c: ['#7A6BB0', '#CFA7CC', '#F7DADF'], st: 0, g: 'rgba(255,238,240,.55)' },
        noon: { c: ['#7568B2', '#CBA8D0', '#F5DCE4'], st: 0, g: 'rgba(255,240,244,.55)' },
        afternoon: { c: ['#7C66A8', '#D6A6C2', '#F8D6CF'], st: 0, g: 'rgba(255,220,205,.55)' },
        golden: { c: ['#6E5594', '#D0909E', '#F6BE9A'], st: 0, g: 'rgba(255,195,160,.6)' },
        sunset: { c: ['#3A2152', '#B0577E', '#F08C84'], st: 0.05, g: 'rgba(255,150,150,.62)' },
        dusk: { c: ['#1E0E28', '#45224A', '#84405E'], st: 0.5, g: 'rgba(235,160,195,.3)' },
      },
      garden: {
        leaves: ['#2F7A55', '#3C8C62', '#4E9E70', '#2A6E4C', '#357F59', '#44946A', '#255F42'],
        shade: '#0B2418', light: '#FFFFFF', base: ['#24613F', '#163F29'], hi: '#CDEBC9', bark: '#4E3426',
        hillA: '#6E9C80', hillB: '#3F7A58', ground: '#356B4C', grass: '#2E6E48', stem: '#2F6B47',
        bloom: ['#FFD3DF', '#F7A6C1', '#FFFFFF', '#FFC0D0'], bloomMid: '#F6D36B', fruit: false,
        flowers: ['#D6336C', '#F28AA5', '#FFE3EC', '#E8577E'], flowerMid: '#FFD86B',
        bfly: ['#F28AA5', '#FFD3DF', '#E8577E'], bfMin: 2, palm: false, nightTint: '#1E0B1E',
        gsky: { day: ['#8A7BBE', '#D8B2D2', '#F8DDE2'], night: ['#170B1C', '#2E1430', '#4D2142'], dawn: ['#56367A', '#BC7596', '#F4B6A4'], golden: ['#7A62A0', '#D89CA8', '#F7C6A4'], sunset: ['#3A2152', '#B0577E', '#F08C84'] },
        defs: id => roseDefs(id, ROSE_C),
        fx: {
          // ورود متفتّحة في تاج الشجرة
          tree({ L, tree: t, rng, seed, id, small }) { if (!t.tips.length) return ''; const r = rng(seed + 61), n = small ? 5 : Math.min(40, 14 + Math.floor(L / 16)); let s = '';
            for (let k = 0; k < n; k++) { const p = t.tips[Math.floor(r() * t.tips.length)];
              s += rose(p.x + (r() - 0.5) * t.leafR * 1.5, p.y + (r() - 0.5) * t.leafR * 1.1, (small ? 2.6 : 3.3) + r() * 1.8, id + 'R' + (k % 3)); }
            return s; },
          // شجيرات ورد على الأرض
          ground({ rng, f1, id, cx, GY }) { const r = rng(717); let s = '';
            [[36, 0.9], [96, 0.75], [262, 0.85], [322, 1]].forEach(([x, k], j) => { if (Math.abs(x - cx) < 40) return; const w = 26 * k, h = 15 * k, y = GY + 4 + (j % 2) * 5;
              s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y - h * 0.4) + '" rx="' + f1(w * 0.6) + '" ry="' + f1(h * 0.62) + '" fill="#23603F"/><ellipse cx="' + f1(x - w * 0.18) + '" cy="' + f1(y - h * 0.62) + '" rx="' + f1(w * 0.36) + '" ry="' + f1(h * 0.42) + '" fill="#2F7A52"/>';
              for (let q = 0; q < 6; q++) s += rose(x + (r() - 0.5) * w, y - h * 0.3 - r() * h * 0.7, 2.4 + r() * 1.3, id + 'R' + ((q + j) % 3)); });
            return s; },
        },
      },
      beads: ['#FFEDE4', '#E6A996', '#9C5B4E'],
      fx: 'roses', ink: ['#3E1530', 'rgba(62,21,48,.72)', 'rgba(62,21,48,.24)'],
    },
    /* ─────────── حقل الخزامى · فاتح بنفسجي ─────────── */
    lavender: {
      n: 'حقل الخزامى',
      sky: {
        night: { c: ['#161431', '#28234F', '#433A75'], st: 1, g: 'rgba(205,190,255,.22)' },
        predawn: { c: ['#1D1A40', '#3B3268', '#7C62A0'], st: 0.72, g: 'rgba(215,190,255,.26)' },
        dawn: { c: ['#4F5AA0', '#A99AD0', '#FAD0D2'], st: 0.1, g: 'rgba(255,210,210,.55)' },
        morning: { c: ['#8793E0', '#C2B8EE', '#F1E3F7'], st: 0, g: 'rgba(245,240,255,.6)' },
        day: { c: ['#8A99E6', '#C6BDF1', '#EEE6FA'], st: 0, g: 'rgba(250,248,255,.6)' },
        noon: { c: ['#8396E6', '#C0BCF2', '#ECE8FB'], st: 0, g: 'rgba(250,250,255,.6)' },
        afternoon: { c: ['#8C94DE', '#CDB9EC', '#F6E2EC'], st: 0, g: 'rgba(255,235,225,.58)' },
        golden: { c: ['#8A82CC', '#D8B0D8', '#FFD4C2'], st: 0, g: 'rgba(255,205,175,.6)' },
        sunset: { c: ['#3E3478', '#A86BA6', '#F59F92'], st: 0.05, g: 'rgba(255,165,160,.6)' },
        dusk: { c: ['#1C1840', '#3E3270', '#7A5A92'], st: 0.5, g: 'rgba(215,180,240,.3)' },
      },
      garden: {
        leaves: ['#C9B3EE', '#B69AE6', '#D8C8F4', '#A68AE0', '#C2A9EC', '#BBA0E8', '#9F82DA'],
        shade: '#3E2A73', light: '#FFFFFF', base: ['#9A7FD6', '#7A5FBE'], hi: '#FFFFFF', bark: '#5A4636',
        hillA: '#CFC2EA', hillB: '#9FC79A', ground: '#8FBF88', grass: '#5E9C62', stem: '#4E8E58',
        bloom: ['#FFFFFF', '#EDE4FF', '#D9C9FA'], bloomMid: '#FFE08A', fruit: false,
        flowers: ['#B69AE6', '#FFFFFF', '#9C7BD8', '#E4D8FA', '#FFD6E4'],
        bfly: ['#FFFFFF', '#FFE08A', '#D9C9FA', '#F7C1D3', '#B69AE6'], bfMin: 4, palm: false, nightTint: '#1A1638',
        gsky: { day: ['#98A5EA', '#CFC6F3', '#F1EAFB'], night: ['#161431', '#28234F', '#433A75'], dawn: ['#5E68AA', '#B7A8D8', '#FBD6D6'], golden: ['#968ED2', '#DDB8DC', '#FFDAC8'], sunset: ['#3E3478', '#A86BA6', '#F59F92'] },
        fx: {
          // صفوف الخزامى على التلال القريبة
          hills({ f1 }) { let s = '';
            for (let k = 0; k < 6; k++) { const y = 200 + k * 6.2, amp = 3 + k * 0.6, off = k * 17;
              s += '<path d="M-120 ' + f1(y + 8) + ' Q' + f1(-40 + off) + ' ' + f1(y - amp) + ' ' + f1(40 + off) + ' ' + f1(y + 4) + ' T' + f1(200 + off) + ' ' + f1(y) + ' T' + f1(360 + off) + ' ' + f1(y + 3) + ' T480 ' + f1(y + 2) + '" fill="none" stroke="' + (k % 2 ? '#9C7BD8' : '#B395E6') + '" stroke-width="' + f1(2.4 + k * 0.35) + '" stroke-linecap="round" stroke-dasharray="0.1 ' + f1(3.6 + k * 0.3) + '" opacity="' + f1(0.55 + k * 0.07) + '"/>'; }
            return s; },
          // عناقيد متدلّية من أغصان الشجرة (وستارية)
          tree({ tree: t, rng, seed, f1, small }) { if (!t.tips.length) return ''; const r = rng(seed + 33); let s = '';
            const tips = t.tips.slice().sort((a, b) => b.y - a.y), n = small ? 4 : Math.min(18, 6 + Math.floor(tips.length / 2));
            for (let k = 0; k < n; k++) { const p = tips[k % tips.length], x0 = p.x + (r() - 0.5) * t.leafR * 1.4, y0 = p.y + t.leafR * 0.55, len = (small ? 9 : 15) + r() * (small ? 7 : 16), bend = (r() - 0.5) * 5;
              for (let q = 0; q < 8; q++) { const u = q / 7, rr = (small ? 2.1 : 3.0) * (1 - u * 0.6);
                s += '<circle cx="' + f1(x0 + bend * u * u) + '" cy="' + f1(y0 + len * u) + '" r="' + f1(rr) + '" fill="' + ['#7F58C6', '#8F6AD2', '#A07FDC', '#B395E4', '#C5ADEC', '#D7C6F3', '#E8DEF9', '#F6F1FD'][q] + '"/>'; } }
            return s; },
        },
      },
      beads: ['#F6F0FF', '#BFA6EC', '#6E52B4'],
      fx: 'bflies', ink: ['#2E2350', 'rgba(46,35,80,.72)', 'rgba(46,35,80,.24)'],
    },
  };
})();
window.SKINS = SKINS;
/** المشهد الفعّال الآن (من السمة المختارة) أو null */
/* وسن 4.6: مفتاح الثيم المرسوم (art.js) إن كانت السمة الحالية من «الثيمات الكاملة» */
function artKey() { try { const T = THEMES[uiTheme()]; return T && T.skin && typeof Art !== 'undefined' && Art.has(T.skin) ? T.skin : null; } catch (e) { return null; } }
function curSkin() { try { const T = THEMES[uiTheme()]; return T && T.skin ? SKINS[T.skin] || null : null; } catch (e) { return null; } }
/** الزينة المتحرّكة فوق المشهد: بتلات أو ورود أو فراشات (حتمية التوزيع) */
function skinFX(sk) {
  if (!sk || !sk.fx) return '';
  let s = 7, out = ''; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  if (sk.fx === 'petals' || sk.fx === 'roses') {
    const n = sk.fx === 'roses' ? 11 : 15;
    for (let i = 0; i < n; i++) out += '<i class="pt" style="left:' + (R() * 100).toFixed(1) + '%;animation-duration:' + (10 + R() * 8).toFixed(1) + 's;animation-delay:-' + (R() * 18).toFixed(1) + 's;--dx:' + Math.round(20 + R() * 50) * (R() < 0.5 ? -1 : 1) + 'px;--r:' + Math.round(120 + R() * 240) + 'deg;--s:' + (0.6 + R() * 0.7).toFixed(2) + '"></i>';
    if (sk.fx === 'roses') for (let i = 0; i < 9; i++) out += '<b class="sp" style="left:' + (R() * 100).toFixed(1) + '%;top:' + (8 + R() * 60).toFixed(1) + '%;animation-delay:-' + (R() * 4).toFixed(1) + 's;animation-duration:' + (2.4 + R() * 2.6).toFixed(1) + 's"></b>';
  } else if (sk.fx === 'bflies') {
    const C = [['#FFFFFF', '#E9DEFF'], ['#FFE08A', '#FFF2C4'], ['#F7C1D3', '#FFE3EC'], ['#D9C9FA', '#F3EDFF'], ['#B69AE6', '#E4D8FA']];
    for (let i = 0; i < 5; i++) { const c = C[i];
      out += '<i class="bf" style="top:' + (26 + R() * 44).toFixed(1) + '%;animation-duration:' + (20 + R() * 14).toFixed(1) + 's;animation-delay:-' + (R() * 30).toFixed(1) + 's"><svg viewBox="-11 -9 22 18">' +
        '<g class="w l"><path d="M0 0C-3-8-10-8-9.5-2.5-9 1-3 1.6 0 0z" fill="' + c[0] + '"/><path d="M0 0C-2 4-7 7.4-8 4.2-8.6 2-3 1 0 0z" fill="' + c[1] + '"/></g>' +
        '<g class="w r"><path d="M0 0C3-8 10-8 9.5-2.5 9 1 3 1.6 0 0z" fill="' + c[0] + '"/><path d="M0 0C2 4 7 7.4 8 4.2 8.6 2 3 1 0 0z" fill="' + c[1] + '"/></g>' +
        '<rect x="-.6" y="-3.6" width="1.2" height="7.4" rx=".6" fill="#4A3B5C"/></svg></i>'; }
    for (let i = 0; i < 7; i++) out += '<b class="sp lv" style="left:' + (R() * 100).toFixed(1) + '%;top:' + (10 + R() * 55).toFixed(1) + '%;animation-delay:-' + (R() * 4).toFixed(1) + 's"></b>';
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════
   وسن 4.5 · «ثيمات كاملة» — لكل ثيم تصميمه: الفراشات · الورد · النجمة · الفراولة · الأزهار
   وسن 4.6: المشاهد والزينة والمسبحة صارت رسومًا متجهية مرسومة خصيصًا (art.js)، والفراشات زرقاء
   الرموز ثلاثية الأبعاد: Fluent Emoji من مايكروسوفت (رخصة MIT) — img/emo/*.webp
   لا تُعرض أي رموز على صفحات المصحف احترامًا لكلام الله؛ يتغيّر لونها فقط.
   ════════════════════════════════════════════════════════════════ */
const emo = k => (window.__EMO && window.__EMO[k]) || 'img/emo/' + k + '.webp';
const emoImg = (k, st, cls) => '<img class="' + (cls || '') + '" src="' + emo(k) + '" alt="" draggable="false"' + (st ? ' style="' + st + '"' : '') + '>';
const KW = (() => {
  const f1 = v => Math.round(v * 10) / 10;
  const im = (k, x, y, s, cls, st) => '<image href="' + emo(k) + '" x="' + f1(x - s / 2) + '" y="' + f1(y - s / 2) + '" width="' + f1(s) + '" height="' + f1(s) + '"' + (cls ? ' class="gemo ' + cls + '"' : '') + (st ? ' style="' + st + '"' : '') + '/>';
  const pickTips = (t, n, r) => { const tp = t.tips.slice(); const out = []; for (let k = 0; k < n && tp.length; k++) out.push(tp.splice(Math.floor(r() * tp.length), 1)[0]); return out; };
  const HUE = { pink: 'filter:hue-rotate(300deg) saturate(1.15)', blue: 'filter:hue-rotate(190deg) saturate(1.1)', purple: 'filter:hue-rotate(245deg)', none: '' };
  const Q = ['book', 'moon', 'kaaba', 'beads', 'palms', 'sparkles', 'calendar'];
  return {
    kbfly: {
      n: 'الفراشات الزرقاء', e: 'butterfly', beads: ['#EAF5FF', '#7DB8FF', '#2D6FE0'],
      sky: {
        night: { c: ['#081436', '#10224E', '#1B3A74'], st: 1, g: 'rgba(170,205,255,.22)' }, predawn: { c: ['#0F1C4C', '#243F86', '#5A74B8'], st: 0.72, g: 'rgba(190,210,255,.26)' },
        dawn: { c: ['#3F66BC', '#94B6EA', '#F2D9E6'], st: 0.1, g: 'rgba(255,225,235,.55)' }, morning: { c: ['#5E9CEC', '#A8D0FF', '#EAF5FF'], st: 0, g: 'rgba(245,250,255,.6)' },
        day: { c: ['#5D9EEF', '#A6CFFF', '#E6F3FF'], st: 0, g: 'rgba(250,252,255,.6)' }, noon: { c: ['#5898EE', '#A2CCFF', '#E3F1FF'], st: 0, g: 'rgba(250,252,255,.62)' },
        afternoon: { c: ['#6198E8', '#A9CBF7', '#E8F0FF'], st: 0, g: 'rgba(245,248,255,.6)' }, golden: { c: ['#5F86D6', '#AFC0EC', '#F4DDE6'], st: 0, g: 'rgba(255,225,215,.6)' },
        sunset: { c: ['#34469A', '#8490CC', '#F1BACB'], st: 0.05, g: 'rgba(255,190,205,.6)' }, dusk: { c: ['#132457', '#2C4488', '#6A80C2'], st: 0.5, g: 'rgba(190,210,255,.3)' },
      },
      garden: {
        leaves: ['#5DBB72', '#6ECB80', '#86D694', '#4DAA64', '#62C078', '#78CF8A', '#44A05C'], shade: '#0E3A22', base: ['#3E9A5A', '#2C7A45'], hi: '#E6FFD8', bark: '#6B4A2E',
        hillA: '#C8D3F2', hillB: '#9ED6A2', ground: '#86CC8C', grass: '#4FA85E', stem: '#3E8A55', bloom: ['#FFFFFF', '#FFD6EC', '#D6DDFF', '#FFF0B8'], bloomMid: '#F6B3D3', fruit: false,
        flowers: ['#F7A6C1', '#FFFFFF', '#B9C4F7', '#FFE08A', '#D9B8F5'], bfMin: 0, palm: false, nightTint: '#141B45',
        gsky: { day: ['#8FB5F4', '#CBD9FA', '#F2E8FA'], night: ['#141B45', '#232C66', '#3E3F86'], dawn: ['#6070BE', '#B4B2E2', '#F8D6E4'], golden: ['#949FDE', '#DCC6EA', '#FFDED6'], sunset: ['#3E3E86', '#A77CB8', '#F5A7B0'] },
        fx: {
          tree({ tree: t, rng, seed, small }) { if (!t.tips.length || small) return ''; const r = rng(seed + 5); let s = '';   // وسن 4.6: فراشات مرسومة زرقاء
            if (typeof Art === 'undefined') return ''; const d = Art._.doc('gb'), pals = ['morpho', 'sky', 'royal', 'ice', 'morpho', 'sky'];
            pickTips(t, 6, r).forEach((p, k) => { s += '<g class="gemo fl" style="animation-delay:-' + (r() * 3).toFixed(1) + 's">' + Art._.bfly(d, { x: p.x + (r() - 0.5) * t.leafR * 2.2, y: p.y - t.leafR * (0.6 + r() * 0.8), s: (14 + r() * 5) / 170, r: (r() - 0.5) * 34, pal: pals[k] }) + '</g>'; });
            return '<defs>' + d.defs() + '</defs>' + s; },
          ground({ rng, cx, GY }) { const r = rng(91); let s = ''; if (typeof Art === 'undefined') return ''; const d = Art._.doc('gg'), ps = ['blue', 'sky', 'peri', 'blue', 'sky', 'peri', 'blue'];
            ps.forEach((pal, j) => { let x = 20 + j * 52 + (r() - 0.5) * 16; if (Math.abs(x - cx) < 34) x += 46; s += Art._.hydrangea(d, { x, y: GY + 4 + r() * 12, r: 11 + r() * 4, pal }); });
            return '<defs>' + d.defs() + '</defs>' + s; },
        },
      },
      beadEmo: ['butterfly'], beadHue: ['pink', 'blue', 'purple'], beadTop: 'sparkheart', ink: '#1F2350',
      fx: { type: 'fly', k: 'butterfly', n: 5, hue: ['pink', 'blue', 'purple', 'none', 'pink'], tw: ['sparkles'], tn: 5 },
      stickers: [{ k: 'butterfly', x: 22, y: 9, s: 30, r: -14, hue: 'pink' }, { k: 'butterfly', x: 10, y: 79, s: 44, r: -10, hue: 'blue' }, { k: 'tulip', x: 90, y: 80, s: 42, r: 8 }, { k: 'butterfly', x: 92, y: 45, s: 26, r: 16, hue: 'purple' }],
      wall: ['butterfly', 'sparkles', 'blossom'], wallHue: ['pink', 'none', 'none'], bullet: 'butterfly', bulletHue: 'pink', quick: Q.concat('butterfly'), quickHue: 'pink',
      cards: { strip: ['butterfly', 'pink'], ctx: ['blossom', ''], hdr: ['butterfly', 'blue'] },
    },
    // وسن 7 · الكتاكيت: سماء ربيعية صافية، ومرج أخضر، وعبّاد الشمس، وكتاكيت تمشي حول البستان
    kchick: {
      n: 'الكتاكيت', e: 'chick', beads: ['#FFF8D2', '#FFD54A', '#E39A0C'],
      sky: {
        night: { c: ['#10213F', '#1C3561', '#2F5186'], st: 1, g: 'rgba(255,230,160,.2)' }, predawn: { c: ['#1B2C58', '#3A5690', '#7D8FC0'], st: 0.72, g: 'rgba(255,225,180,.24)' },
        dawn: { c: ['#5E86C8', '#B9CFEA', '#FFE3C0'], st: 0.1, g: 'rgba(255,230,190,.55)' }, morning: { c: ['#6DB8EE', '#B9E1FA', '#FFF4D6'], st: 0, g: 'rgba(255,250,230,.6)' },
        day: { c: ['#63B3EE', '#B5DEFA', '#FFF6DC'], st: 0, g: 'rgba(255,252,236,.6)' }, noon: { c: ['#5FAEEC', '#B0DBF9', '#FFF7E0'], st: 0, g: 'rgba(255,252,238,.62)' },
        afternoon: { c: ['#6AB0E6', '#BCDDF4', '#FFF0D0'], st: 0, g: 'rgba(255,245,220,.6)' }, golden: { c: ['#6FA4DA', '#E2D2B8', '#FFD9A0'], st: 0, g: 'rgba(255,220,160,.62)' },
        sunset: { c: ['#3F4F98', '#D08A7C', '#FFC078'], st: 0.05, g: 'rgba(255,190,130,.62)' }, dusk: { c: ['#182B5C', '#34508E', '#7A8CC0'], st: 0.5, g: 'rgba(255,220,170,.3)' },
      },
      garden: {
        leaves: ['#7CC45E', '#8ED06C', '#A2DB7E', '#6AB74E', '#84CB64', '#98D674', '#5AA842'], shade: '#1E3A10', base: ['#5A9A3E', '#3E7A2A'], hi: '#F4FFD8', bark: '#7A5230',
        hillA: '#E4F2BE', hillB: '#A9D98A', ground: '#9BCF7C', grass: '#5DA848', stem: '#4E9A48', bloom: ['#FFF3B0', '#FFFFFF', '#FFE08A'], bloomMid: '#F2A516', fruit: false,
        flowers: ['#FFD84A', '#FFFFFF', '#FFB347', '#F7A6C1'], bfMin: 0, palm: false, nightTint: '#10213F',
        fx: {
          ground({ rng, cx, GY }) { if (typeof Art === 'undefined' || !Art._.chick) return ''; const r = rng(71), d = Art._.doc('gck'); let s = '';
            [[-118, 'yellow', 'stand'], [-72, 'lemon', 'peck'], [70, 'cream', 'stand'], [112, 'yellow', 'hop']].forEach(([dx, pal, pose], j) => { const x = cx + dx + (r() - 0.5) * 10;
              s += Art._.chick(d, { x, y: GY + 3 + r() * 6, s: 0.26 + r() * 0.05, pal, pose, flip: j % 2 === 1, eye: j === 2 ? 'happy' : 'o' }); });
            s += Art._.nest(d, { x: cx + 150, y: GY + 12, s: 0.36, eggs: [[-8, -3, .7, -12, 'cream'], [6, -4, .74, 10, 'brown']] });
            return '<defs>' + d.defs() + '</defs>' + s; },
        },
      },
      beadEmo: ['chick'], beadHue: ['none'], beadTop: 'chick', ink: '#3A2A0C',
      fx: { type: 'fly', k: 'butterfly', n: 3, hue: ['none', 'none', 'pink'], tw: ['sparkles'], tn: 4 },
      stickers: [{ k: 'chick', x: 16, y: 80, s: 40, r: -8 }, { k: 'hatch', x: 88, y: 82, s: 38, r: 6 }, { k: 'sunflower', x: 90, y: 40, s: 30, r: 10 }],
      wall: ['chick', 'sunflower', 'hatch'], wallHue: ['none', 'none', 'none'], bullet: 'chick', bulletHue: '', quick: Q.concat('chick'), quickHue: '',
      cards: { strip: ['chick', ''], ctx: ['sunflower', ''], hdr: ['hatch', ''] },
    },
    // وسن 7 · الأرانب: سماء ورديّة ليلكية، ومرج نعناعيّ، وجزر ونفل، وأرانب تجلس تحت الشجرة
    kbunny: {
      n: 'الأرانب', e: 'rabbit', beads: ['#FFF4FA', '#F4C2DA', '#C47AA6'],
      sky: {
        night: { c: ['#1E1638', '#33265A', '#523F86'], st: 1, g: 'rgba(230,200,255,.22)' }, predawn: { c: ['#2A1F4E', '#4E3D84', '#8E7BC0'], st: 0.72, g: 'rgba(240,210,255,.26)' },
        dawn: { c: ['#8A78C8', '#E0B8DA', '#FFDCD2'], st: 0.1, g: 'rgba(255,215,225,.55)' }, morning: { c: ['#C9A9EC', '#F2CFE6', '#FFF0F6'], st: 0, g: 'rgba(255,245,250,.6)' },
        day: { c: ['#C2A6EE', '#EFCFEA', '#FFF2F8'], st: 0, g: 'rgba(255,248,252,.62)' }, noon: { c: ['#BDA2EC', '#EDCDEA', '#FFF4FA'], st: 0, g: 'rgba(255,250,253,.62)' },
        afternoon: { c: ['#C4A4E6', '#F2C8E0', '#FFEEF2'], st: 0, g: 'rgba(255,240,246,.6)' }, golden: { c: ['#B494DE', '#F4BCD2', '#FFD8C8'], st: 0, g: 'rgba(255,215,200,.62)' },
        sunset: { c: ['#5B3E96', '#D987B8', '#FFB1A8'], st: 0.05, g: 'rgba(255,175,185,.62)' }, dusk: { c: ['#281D4C', '#4A3782', '#8A72BE'], st: 0.5, g: 'rgba(230,200,255,.3)' },
      },
      garden: {
        leaves: ['#6CC98E', '#7ED49C', '#94DEAE', '#5ABB7E', '#72CD94', '#88D8A6', '#4AAE70'], shade: '#12361F', base: ['#4E9E6C', '#357A50'], hi: '#E8FFF0', bark: '#7A5A48',
        hillA: '#EAD6F2', hillB: '#A8DFC0', ground: '#98D2B2', grass: '#55AE7A', stem: '#4E9A66', bloom: ['#FFE0EE', '#FFFFFF', '#F2D6FF'], bloomMid: '#F7A6C8', fruit: false,
        flowers: ['#F7A6C8', '#FFFFFF', '#D6BDF7', '#FFD3E4'], bfMin: 0, palm: false, nightTint: '#1E1638',
        fx: {
          ground({ rng, cx, GY }) { if (typeof Art === 'undefined' || !Art._.bunny) return ''; const r = rng(83), d = Art._.doc('gbn'); let s = '';
            [[-122, 'white', 'o'], [-80, 'grey', 'happy'], [86, 'cream', 'happy'], [128, 'caramel', 'o']].forEach(([dx, pal, eye], j) => { const x = cx + dx + (r() - 0.5) * 10;
              s += Art._.bunny(d, { x, y: GY + 2 + r() * 5, s: 0.2 + r() * 0.04, pal, eye, flip: j % 2 === 1, ear: j === 2 ? 'flop' : 'up' }); });
            [[-150, 0.36], [-140, 0.3], [154, 0.34]].forEach(([dx, z]) => { s += Art._.carrotTop(d, { x: cx + dx, y: GY + 12, s: z }); });
            return '<defs>' + d.defs() + '</defs>' + s; },
        },
      },
      beadEmo: ['rabbit'], beadHue: ['none'], beadTop: 'rabbit', ink: '#2C2140',
      fx: { type: 'fly', k: 'butterfly', n: 3, hue: ['pink', 'purple', 'pink'], tw: ['sparkles'], tn: 4 },
      stickers: [{ k: 'rabbit', x: 16, y: 80, s: 40, r: -8 }, { k: 'carrot', x: 88, y: 82, s: 34, r: 16 }, { k: 'clover', x: 90, y: 40, s: 28, r: 10 }],
      wall: ['rabbit', 'carrot', 'clover'], wallHue: ['none', 'none', 'none'], bullet: 'rabbit', bulletHue: '', quick: Q.concat('rabbit'), quickHue: '',
      cards: { strip: ['rabbit', ''], ctx: ['carrot', ''], hdr: ['clover', ''] },
    },
    krose: {
      n: 'الورد', e: 'rose', beads: ['#FFF1F5', '#F7A8C0', '#D6336C'],
      sky: {
        night: { c: ['#2A0E1E', '#4A1A33', '#7A2C4E'], st: 1, g: 'rgba(255,190,210,.2)' }, predawn: { c: ['#32142A', '#5A2445', '#9A4A6A'], st: 0.72, g: 'rgba(255,190,215,.24)' },
        dawn: { c: ['#7A4A86', '#E09AB6', '#FFD2C8'], st: 0.1, g: 'rgba(255,200,195,.6)' }, morning: { c: ['#E7A2C0', '#F6CAD8', '#FFE9EC'], st: 0, g: 'rgba(255,240,242,.62)' },
        day: { c: ['#EDA8C4', '#F8CFDC', '#FFECEF'], st: 0, g: 'rgba(255,245,247,.62)' }, noon: { c: ['#EBA4C2', '#F7CCDA', '#FFEDF1'], st: 0, g: 'rgba(255,248,250,.62)' },
        afternoon: { c: ['#E9A0B8', '#F7C6CF', '#FFE6DE'], st: 0, g: 'rgba(255,232,222,.6)' }, golden: { c: ['#D98AAE', '#F4B4BE', '#FFD4BE'], st: 0, g: 'rgba(255,200,170,.62)' },
        sunset: { c: ['#5A2A6A', '#D06A92', '#FFA2A0'], st: 0.05, g: 'rgba(255,160,165,.62)' }, dusk: { c: ['#321531', '#632A55', '#A04A72'], st: 0.5, g: 'rgba(240,170,200,.3)' },
      },
      garden: {
        leaves: ['#3E9A62', '#4DAA70', '#62BC80', '#358C58', '#45A268', '#58B478', '#2E7E50'], shade: '#0B2A18', base: ['#2F7D4E', '#1E5A38'], hi: '#DDF5D8', bark: '#5A3A2E',
        hillA: '#F2C4D2', hillB: '#8FC89A', ground: '#7ABE86', grass: '#4A9A5C', stem: '#3E8A55', bloom: ['#FFD3DF', '#FFFFFF', '#FFC0D0'], bloomMid: '#F6D36B', fruit: false,
        flowers: ['#E8577E', '#FFD3DF', '#FFFFFF', '#D6336C'], flowerMid: '#FFD86B', palm: false, nightTint: '#2A0E1E',
        gsky: { day: ['#EFB0C8', '#F9D4E0', '#FFEFF2'], night: ['#2A0E1E', '#4A1A33', '#7A2C4E'], dawn: ['#86569A', '#E6A6BE', '#FFD8CE'], golden: ['#DE94B4', '#F6BCC4', '#FFDAC4'], sunset: ['#5A2A6A', '#D06A92', '#FFA2A0'] },
        fx: {
          // وسن 4.7: ورود مرسومة في تاج الشجرة وشجيرات ورد على الأرض (بدل الرموز)
          tree({ tree: t, rng, seed, small, A, ad }) { if (!t.tips.length || !A) return ''; const r = rng(seed + 44); let s = ''; const n = small ? 4 : 16, P = ['red', 'pink', 'red', 'blush'];
            for (let k = 0; k < n; k++) { const p = t.tips[Math.floor(r() * t.tips.length)]; s += A.rose3(ad, { x: p.x + (r() - 0.5) * t.leafR * 1.4, y: p.y + (r() - 0.5) * t.leafR, r: (small ? 2.6 : 3.6) + r() * 1.2, pal: P[k % 4], rot: (r() - 0.5) * 30 }); }
            return s; },
          ground({ rng, cx, GY, A, ad }) { if (!A) return ''; const r = rng(717); let s = '';
            [[34, 0.95], [98, 0.8], [262, 0.85], [326, 1]].forEach(([x, k], j) => { if (Math.abs(x - cx) < 40) return; const w = 26 * k, h = 15 * k, y = GY + 5 + (j % 2) * 5;
              s += '<ellipse cx="' + f1(x) + '" cy="' + f1(y - h * 0.4) + '" rx="' + f1(w * 0.62) + '" ry="' + f1(h * 0.62) + '" fill="#2F7A52"/><ellipse cx="' + f1(x - w * 0.18) + '" cy="' + f1(y - h * 0.62) + '" rx="' + f1(w * 0.36) + '" ry="' + f1(h * 0.42) + '" fill="#3C8C60"/>';
              for (let q = 0; q < 4; q++) s += A.rose3(ad, { x: x + (r() - 0.5) * w * 0.9, y: y - h * 0.45 - r() * h * 0.6, r: 3.6 * k + r() * 1.2, pal: ['red', 'pink', 'blush', 'red'][(q + j) % 4] }); });
            return s; },
        },
      },
      beadEmo: ['rose'], beadTop: 'bouquet', ink: '#4A1428',
      fx: { type: 'fall', petals: 12, k: ['pinkheart'], n: 3 },
      stickers: [{ k: 'bouquet', x: 10, y: 79, s: 52, r: -10 }, { k: 'rose', x: 91, y: 79, s: 44, r: 12 }, { k: 'sparkheart', x: 22, y: 9, s: 28, r: -8 }, { k: 'pinkheart', x: 92, y: 45, s: 22, r: 14 }],
      wall: ['rose', 'pinkheart', 'sparkles'], bullet: 'rose', quick: Q.concat('rose'),
      cards: { strip: ['rose', ''], ctx: ['pinkheart', ''], hdr: ['rose', ''] },
    },
    kstar: {
      n: 'النجمة', e: 'star', beads: ['#FFF6C2', '#FFD95A', '#E89A12'],
      sky: {
        night: { c: ['#070A24', '#12164A', '#2A2470'], st: 1, g: 'rgba(255,225,150,.18)' }, predawn: { c: ['#0E1238', '#221F5E', '#4E3A86'], st: 0.9, g: 'rgba(230,200,255,.2)' },
        dawn: { c: ['#2A2A6E', '#6B4E9E', '#E0A0B8'], st: 0.55, g: 'rgba(255,200,190,.5)' }, morning: { c: ['#34388A', '#6A5EB4', '#C6A4D8'], st: 0.42, g: 'rgba(255,230,190,.45)' },
        day: { c: ['#3A40A0', '#6F66C4', '#C0A8E4'], st: 0.38, g: 'rgba(255,235,200,.45)' }, noon: { c: ['#3A42A6', '#6E6AC8', '#BDB0EA'], st: 0.35, g: 'rgba(255,240,210,.45)' },
        afternoon: { c: ['#3C3E9C', '#7462BE', '#CDA6D8'], st: 0.38, g: 'rgba(255,225,190,.45)' }, golden: { c: ['#35357E', '#8A5EA8', '#E6A2A8'], st: 0.45, g: 'rgba(255,200,150,.5)' },
        sunset: { c: ['#1E1C5A', '#5E3C8A', '#C86A8A'], st: 0.6, g: 'rgba(255,170,160,.5)' }, dusk: { c: ['#0C0E34', '#1E1A56', '#40306E'], st: 0.85, g: 'rgba(220,190,255,.25)' },
      },
      garden: {
        leaves: ['#2F6E7A', '#3A7E8A', '#4A8E9A', '#28606C', '#357684', '#43889A', '#225462'], shade: '#081E26', base: ['#24585F', '#163C44'], hi: '#CFEFF5', bark: '#4A3A48',
        hillA: '#3E3A7A', hillB: '#2A4A6A', ground: '#23405A', grass: '#2E5A6E', stem: '#2E5A6E', bloom: ['#FFF4C8', '#FFFFFF', '#FFE08A'], bloomMid: '#F5C94E', fruit: false,
        flowers: ['#FFE08A', '#FFFFFF', '#C9B8FF'], flowerMid: '#F5C94E', palm: false, nightTint: '#0A0C26',
        gsky: { day: ['#3A40A0', '#6F66C4', '#C0A8E4'], night: ['#070A24', '#12164A', '#2A2470'], dawn: ['#2A2A6E', '#6B4E9E', '#E0A0B8'], golden: ['#35357E', '#8A5EA8', '#E6A2A8'], sunset: ['#1E1C5A', '#5E3C8A', '#C86A8A'] },
        fx: {
          // وسن 4.7: نجوم ذهبية مرسومة معلّقة بخيوط، ونجمة كبرى في القمّة، وبريق على العشب
          tree({ tree: t, rng, seed, small, A, ad }) { if (!t.tips.length || !A) return ''; const r = rng(seed + 8); let s = '';
            pickTips(t, small ? 3 : 11, r).forEach((p, k) => { const x = p.x + (r() - 0.5) * t.leafR, y = p.y + t.leafR * (0.3 + r() * 0.5), L = 5 + r() * 7;
              s += '<path d="M' + f1(x) + ' ' + f1(y - L) + 'v' + f1(L - 3) + '" stroke="#F5E3A0" stroke-width=".5" opacity=".7"/><g class="gemo tw" style="animation-delay:-' + (r() * 3).toFixed(1) + 's">' + A.star(ad, { x, y, s: (small ? 3.2 : 4.4) + r() * 1.4, r: (r() - 0.5) * 30, glow: !small, pal: k % 4 === 3 ? 'silver' : 'gold' }) + '</g>'; });
            if (!small) { const top = t.tips.slice().sort((a, b) => a.y - b.y)[0]; if (top) s += '<g class="gemo tw">' + A.star(ad, { x: top.x, y: top.y - t.leafR * 1.1, s: 8.5, glow: true }) + '</g>'; }
            return s; },
          ground({ rng, cx, GY, A, ad }) { if (!A) return ''; const r = rng(33); let s = '';
            for (let j = 0; j < 6; j++) { let x = 24 + j * 62 + (r() - 0.5) * 20; if (Math.abs(x - cx) < 30) x += 40; s += '<g class="gemo tw" style="animation-delay:-' + (r() * 3).toFixed(1) + 's">' + A.sparkle(ad, { x, y: GY + 2 + r() * 18, s: 4 + r() * 2, c: '#FFF3C4' }) + '</g>'; }
            return s; },
        },
      },
      beadEmo: ['star'], beadTop: 'gstar', ink: '#FFFFFF',
      fx: { type: 'twinkle', k: ['star', 'sparkles', 'star', 'dizzy'], n: 10 },
      stickers: [{ k: 'gstar', x: 22, y: 9, s: 34, r: -10 }, { k: 'moon', x: 91, y: 78, s: 40, r: 18 }, { k: 'sparkles', x: 10, y: 80, s: 36, r: 0 }, { k: 'star', x: 92, y: 45, s: 24, r: 14 }],
      wall: ['star', 'sparkles', 'moon'], bullet: 'star', quick: ['book', 'moon', 'kaaba', 'beads', 'palms', 'gstar', 'calendar', 'star'],
      cards: { strip: ['gstar', ''], ctx: ['sparkles', ''], hdr: ['star', ''] },
    },
    kberry: {
      n: 'الفراولة', e: 'strawberry', beads: ['#FFB3BF', '#F24E66', '#B8142F'],
      sky: {
        night: { c: ['#2A0F1C', '#46182E', '#6E2844'], st: 1, g: 'rgba(255,190,210,.2)' }, predawn: { c: ['#35142A', '#5C2442', '#955070'], st: 0.7, g: 'rgba(255,190,215,.24)' },
        dawn: { c: ['#B45A7E', '#F2A5B8', '#FFE0D6'], st: 0.1, g: 'rgba(255,215,205,.6)' }, morning: { c: ['#FFB3C2', '#FFD6DE', '#FFF1EE'], st: 0, g: 'rgba(255,245,245,.62)' },
        day: { c: ['#FFB0C0', '#FFD5DE', '#FFF3F0'], st: 0, g: 'rgba(255,248,248,.62)' }, noon: { c: ['#FFAABB', '#FFD2DB', '#FFF2EF'], st: 0, g: 'rgba(255,250,250,.62)' },
        afternoon: { c: ['#FFA9B5', '#FFCFD2', '#FFEDE4'], st: 0, g: 'rgba(255,238,228,.6)' }, golden: { c: ['#F59AAE', '#FFC3BF', '#FFE2CC'], st: 0, g: 'rgba(255,210,180,.62)' },
        sunset: { c: ['#8E3A64', '#E07A92', '#FFB7A0'], st: 0.05, g: 'rgba(255,170,160,.62)' }, dusk: { c: ['#3A1530', '#6A2A4E', '#A14E72'], st: 0.5, g: 'rgba(240,170,200,.3)' },
      },
      garden: {
        leaves: ['#4DAE62', '#5EBE72', '#74CC84', '#3F9E56', '#56B86A', '#6AC67C', '#379050'], shade: '#0D3A1E', base: ['#3A9656', '#28743F'], hi: '#E0FFD4', bark: '#6B4A2E',
        hillA: '#F4C6CC', hillB: '#9AD39A', ground: '#86C886', grass: '#4AA25A', stem: '#3E8A55', bloom: ['#FFFFFF', '#FFF6D8'], bloomMid: '#F6D36B', fruit: false,
        flowers: ['#FFFFFF', '#F7A6B5', '#FFE08A'], palm: false, nightTint: '#241028',
        gsky: { day: ['#7CC0F2', '#C0E4FA', '#FFEDF1'], night: ['#241028', '#3E1A40', '#6A2A55'], dawn: ['#6A74B6', '#E6AEC0', '#FFDCCE'], golden: ['#98AEDA', '#F4CAC6', '#FFD6BA'], sunset: ['#4A3070', '#D0708A', '#FFA090'] },
        fx: {
          // وسن 4.7: فراولات مرسومة بين الأوراق وأزهار بيضاء، ومشاتل فراولة على الأرض
          tree({ tree: t, rng, seed, small, A, ad }) { if (!t.tips.length || !A) return ''; const r = rng(seed + 17); let s = ''; const n = small ? 4 : 16;
            for (let k = 0; k < n; k++) { const p = t.tips[Math.floor(r() * t.tips.length)], x = p.x + (r() - 0.5) * t.leafR * 1.5, y = p.y + (r() - 0.25) * t.leafR * 1.1;
              s += k % 3 === 2 ? A.blossom(ad, { x, y, s: small ? 0.2 : 0.28, r: k * 23 }) : A.berry(ad, { x, y, s: (small ? 0.09 : 0.12) + r() * 0.03, r: (r() - 0.5) * 30 }); }
            return s; },
          ground({ rng, cx, GY, A, ad }) { if (!A) return ''; const r = rng(515); let s = '';
            [[30, 1], [92, 0.85], [266, 0.9], [330, 1]].forEach(([x, k], j) => { if (Math.abs(x - cx) < 40) return; const y = GY + 6 + (j % 2) * 6;
              s += A.trileaf(ad, { x: x - 8 * k, y: y - 2, s: 0.36 * k, r: -40 }) + A.trileaf(ad, { x: x + 8 * k, y: y - 1, s: 0.32 * k, r: 40, pal: 'light' }) + A.trileaf(ad, { x, y: y - 4, s: 0.3 * k, r: 0 });
              for (let q = 0; q < 3; q++) s += A.berry(ad, { x: x + (q - 1) * 9 * k + (r() - 0.5) * 3, y: y + (r() - 0.3) * 4, s: 0.14 * k + r() * 0.03, r: (q - 1) * 14 }); });
            return s; },
        },
      },
      beadEmo: ['strawberry'], beadTop: 'ribbon', ink: '#3A1A1E',
      fx: { type: 'fall', petals: 0, k: ['strawberry', 'pinkheart', 'blossom'], n: 9 },
      stickers: [{ k: 'ribbon', x: 22, y: 9, s: 34, r: -14 }, { k: 'strawberry', x: 10, y: 79, s: 46, r: -12 }, { k: 'shortcake', x: 90, y: 80, s: 44, r: 8 }, { k: 'redheart', x: 92, y: 45, s: 20, r: 14 }],
      wall: ['strawberry', 'blossom', 'redheart'], bullet: 'strawberry', quick: Q.concat('strawberry'),
      cards: { strip: ['strawberry', ''], ctx: ['ribbon', ''], hdr: ['strawberry', ''] },
      gingham: 'rgba(229,72,95,.06)',
    },
    kbloom: {
      n: 'الأزهار', e: 'sakura', beads: ['#FFF1F6', '#F9B8D0', '#EC7FA9'],
      sky: {
        night: { c: ['#1C1636', '#2E2452', '#4A3A70'], st: 1, g: 'rgba(220,200,255,.2)' }, predawn: { c: ['#261C48', '#473A78', '#8A6EA8'], st: 0.7, g: 'rgba(225,205,255,.24)' },
        dawn: { c: ['#9A7AC8', '#F2B4C4', '#FFE2CC'], st: 0.1, g: 'rgba(255,215,200,.6)' }, morning: { c: ['#FFC4AE', '#FFDCE4', '#F1E6FF'], st: 0, g: 'rgba(255,245,240,.62)' },
        day: { c: ['#FFC6AE', '#FFDDE6', '#EFE3FF'], st: 0, g: 'rgba(255,248,245,.62)' }, noon: { c: ['#FFC2A8', '#FFDAE4', '#EDE2FF'], st: 0, g: 'rgba(255,250,248,.62)' },
        afternoon: { c: ['#FFBFA2', '#FFD6DC', '#F3E0F6'], st: 0, g: 'rgba(255,238,225,.6)' }, golden: { c: ['#FFB08E', '#FFC8C0', '#FFE0CC'], st: 0, g: 'rgba(255,205,170,.62)' },
        sunset: { c: ['#7A4A8A', '#E48CA0', '#FFB894'], st: 0.05, g: 'rgba(255,170,150,.62)' }, dusk: { c: ['#2A1E4A', '#4E3A70', '#8A6090'], st: 0.5, g: 'rgba(220,180,240,.3)' },
      },
      garden: {
        leaves: ['#8FD68A', '#A2DE98', '#B6E6AA', '#7CC878', '#98DA90', '#ACE2A2', '#6EBE6C'], shade: '#1E4A1E', base: ['#6CB868', '#4E9A4E'], hi: '#F4FFE8', bark: '#6B4A2E',
        hillA: '#FBD9C6', hillB: '#A8DC96', ground: '#94CE86', grass: '#5AAA5A', stem: '#4E9A5E', bloom: ['#FFFFFF', '#FFE3EC', '#FFF4C4'], bloomMid: '#F6A6C1', fruit: false,
        flowers: ['#F7A6C1', '#FFE08A', '#FFFFFF', '#C9A8F5', '#F59C7A'], palm: false, nightTint: '#1E1840',
        gsky: { day: ['#92CCF4', '#D2ECFA', '#FFF5EA'], night: ['#1E1840', '#342A62', '#5E4680'], dawn: ['#7680BE', '#E8BACE', '#FFE4CE'], golden: ['#A2BAE2', '#F8D8BC', '#FFDEB2'], sunset: ['#4E3A7A', '#D88A9A', '#FFB090'] },
        fx: {
          // وسن 4.7: أزهار كرز وأقحوان مرسومة في التاج (والمرج الأرضي من «meadow»)
          tree({ tree: t, rng, seed, small, A, ad }) { if (!t.tips.length || !A) return ''; const r = rng(seed + 29); let s = ''; const n = small ? 5 : 22, P = ['pink', 'white', 'deep', 'pink', 'peach'];
            for (let k = 0; k < n; k++) { const p = t.tips[Math.floor(r() * t.tips.length)], x = p.x + (r() - 0.5) * t.leafR * 1.6, y = p.y + (r() - 0.5) * t.leafR * 1.2;
              s += k % 5 === 4 ? A.daisy(ad, { x, y, r: small ? 2.4 : 3.2, rot: k * 17, pal: 'lemon' }) : A.sakura(ad, { x, y, r: (small ? 2.6 : 3.4) + r() * 1, pal: P[k % 5], rot: k * 29 }); }
            return s; },
        },
      },
      beadEmo: ['sakura', 'blossom'], beadTop: 'bouquet', ink: '#3A2A1E',
      fx: { type: 'fall', petals: 0, k: ['sakura', 'blossom', 'sakura'], n: 10 },
      stickers: [{ k: 'sakura', x: 22, y: 9, s: 30, r: -12 }, { k: 'tulip', x: 10, y: 79, s: 46, r: -10 }, { k: 'sunflower', x: 90, y: 80, s: 42, r: 10 }, { k: 'blossom', x: 92, y: 45, s: 24, r: 14 }],
      wall: ['sakura', 'blossom', 'tulip'], bullet: 'sakura', quick: Q.concat('bouquet'),
      cards: { strip: ['sakura', ''], ctx: ['tulip', ''], hdr: ['blossom', ''] },
    },
  };
})();
Object.assign(SKINS, KW);
/* وسن 4.7 · «البستان المرسوم» لكل ثيم: أزهار المرج، وأزهار الشجرة، والطيور والفراشات — وسماء البستان من سماء الثيم */
(function () {
  const M = {
    kbfly: { meadow: ['hyd:blue', 'fmn', 'daisy:white', 'hyd:sky', 'fmn', 'hyd:peri'], bloomArt: ['white', 'lilac', 'white'], birds: ['blue', 'blue', 'canary'], bflyArt: ['morpho', 'sky', 'royal', 'ice'] },
    kchick: { meadow: ['daisy:white', 'chick', 'tulip:yellow', 'daisy:lemon', 'sunflower', 'fmn', 'chick', 'daisy:white'], bloomArt: ['white', 'white', 'pink'], birds: ['canary', 'canary', 'robin'], bflyArt: ['lemon', 'sky', 'pink'] },
    kbunny: { meadow: ['clover', 'daisy:pink', 'carrot', 'tulip:pink', 'daisy:white', 'clover', 'tulip:lilac', 'bunny'], bloomArt: ['pink', 'white', 'pink'], birds: ['rose', 'blue', 'canary'], bflyArt: ['pink', 'lilac', 'sky'] },
    krose: { meadow: ['rose:red', 'rtop:pink', 'daisy:white', 'rose:pink', 'bud:red', 'rtop:blush'], bloomArt: ['pink', 'white'], birds: ['rose', 'robin', 'canary'], bflyArt: ['pink', 'lemon', 'pink'] },
    kstar: { meadow: ['star', 'fmn:lilac', 'sparkle', 'daisy:lilac'], bloomArt: false, birds: ['blue', 'canary', 'rose'], bflyArt: ['gold', 'lemon', 'lilac'] },
    kberry: { meadow: ['berry', 'blossom', 'berry', 'daisy:white'], bloomArt: ['white'], birds: ['robin', 'rose', 'canary'], bflyArt: ['pink', 'lemon', 'sky'] },
    kbloom: { meadow: ['tulip:pink', 'daisy:white', 'tulip:yellow', 'fmn:pink', 'tulip:lilac', 'daisy:lemon', 'sakura:pink'], bloomArt: ['pink', 'white', 'deep'], birds: ['canary', 'rose', 'blue'], bflyArt: ['pink', 'lemon', 'lilac', 'sky'] },
    sakura: { meadow: ['sakura:pink', 'daisy:white', 'fmn:pink', 'tulip:pink', 'daisy:pink'], bloomArt: ['white', 'pink'], birds: ['rose', 'canary', 'blue'], bflyArt: ['pink', 'lemon', 'lilac'] },
    roses: { meadow: ['rose:red', 'rtop:pink', 'bud:red', 'rose:wine', 'rtop:blush'], bloomArt: ['pink', 'deep'], birds: ['rose', 'robin', 'canary'], bflyArt: ['pink', 'lemon'] },
    lavender: { meadow: ['lav', 'daisy:white', 'fmn:lilac', 'lav', 'hyd:lilac'], bloomArt: ['lilac', 'white'], birds: ['blue', 'canary', 'rose'], bflyArt: ['lilac', 'lemon', 'pink'] },
  };
  Object.keys(M).forEach(k => { const g = SKINS[k] && SKINS[k].garden; if (!g) return; Object.assign(g, M[k]);
    const sk = SKINS[k].sky; if (sk && KW[k]) g.gsky = { day: sk.day.c, night: sk.night.c, dawn: sk.dawn.c, golden: sk.golden.c, sunset: sk.sunset.c }; });
})();
const KW_HUE = { pink: 'hue-rotate(300deg) saturate(1.15)', blue: 'hue-rotate(190deg) saturate(1.1)', purple: 'hue-rotate(245deg)', none: '' };
/* زينة الثيم على مستوى التطبيق: خلفية الرموز الصغيرة + ملصقات البطاقات + رمز العناوين */
function applySkinDeco() {
  const sk = curSkin(), kw = sk && sk.wall;
  let st = document.getElementById('skin-css'); if (!st) { st = document.createElement('style'); st.id = 'skin-css'; document.head.appendChild(st); }
  let wall = document.getElementById('skin-wall');
  const ak = artKey();
  if (ak) {   // وسن 4.6: زينة مرسومة — نقشة خلفية هادئة، ورمز العناوين، وزينة زوايا البطاقات وشريط العنوان
    if (wall) wall.remove();
    const U = u => 'url("' + u + '")', cn = U(Art.cornerURI(ak)), gh = sk.gingham;
    let c = '.sec h2::before{width:22px;height:22px;border-radius:0;background:' + U(Art.iconURI(ak)) + ' center/contain no-repeat}';
    c += 'body{background-image:' + U(Art.patternURI(ak)) + (gh ? ',linear-gradient(90deg,' + gh + ' 50%,transparent 50%),linear-gradient(' + gh + ' 50%,transparent 50%)' : '') + ';background-size:120px 120px' + (gh ? ',30px 30px,30px 30px' : '') + '}';
    c += 'body:has(.reader){background-image:none}';
    c += '.pstrip::after{content:"";position:absolute;top:-27px;left:-9px;width:76px;height:58px;z-index:3;pointer-events:none;background:' + cn + ' center/contain no-repeat}';
    c += '#h-ctx>.hc:first-child,#h-ctx>.sec:first-child+.hc{overflow:visible}#h-ctx>.hc:first-child::after,#h-ctx>.sec:first-child+.hc::after{content:"";position:absolute;top:-21px;left:2px;width:62px;height:47px;pointer-events:none;background:' + cn + ' center/contain no-repeat}';
    c += '.hdr>.bar{position:relative}.hdr>.bar::after{content:"";position:absolute;bottom:-20px;left:46px;width:78px;height:42px;z-index:2;pointer-events:none;background:' + U(Art.hdrURI(ak)) + ' center/contain no-repeat}';
    c += '.hdr>.bar .sub{margin-left:66px;text-wrap:balance}.hdr>.bar:not(:has(.ttl~.ibtn)) .sub{margin-left:112px}';   // وسن 4.8: لا يغطي الزخرف نهاية العنوان الفرعي
    c += '.azc .ic.ic-emo,.list .li .ic:has(img.kwi){background:var(--card-2)}';
    c += '.tab.on::after{width:17px;height:17px;top:-9px;background:' + U(Art.iconURI(ak)) + ' center/contain no-repeat;-webkit-mask:none;mask:none;animation:kwbob 3.2s ease-in-out infinite}';   // وسن 4.7
    st.textContent = c; return;
  }
  if (!kw) { st.textContent = ''; if (wall) wall.remove(); return; }
  const u = k => 'url("' + emo(k) + '")', hf = h => (h && KW_HUE[h]) ? 'filter:' + KW_HUE[h] + ';' : '';
  const stk = (sel, c, pos) => c ? sel + '::after{content:"";position:absolute;' + pos + 'background:' + u(c[0]) + ' center/contain no-repeat;pointer-events:none;' + hf(c[1]) + '}' : '';
  let css = '.sec h2::before{width:20px;height:20px;border-radius:0;background:' + u(sk.bullet) + ' center/contain no-repeat;' + hf(sk.bulletHue) + '}';
  css += stk('.pstrip', sk.cards.strip, 'top:-17px;left:-4px;width:36px;height:36px;transform:rotate(-14deg);z-index:3;');
  css += '#h-ctx>.hc:first-child{overflow:visible}' + stk('#h-ctx>.hc:first-child', sk.cards.ctx, 'top:-12px;left:8px;width:28px;height:28px;transform:rotate(10deg);');
  css += '.hdr>.bar{position:relative}' + stk('.hdr>.bar', sk.cards.hdr, 'bottom:-10px;left:56px;width:30px;height:30px;transform:rotate(-12deg);z-index:2;');
  css += '.azc .ic.ic-emo,.list .li .ic:has(img.kwi){background:var(--card-2)}';
  if (sk.gingham) css += 'body{background-image:linear-gradient(90deg,' + sk.gingham + ' 50%,transparent 50%),linear-gradient(' + sk.gingham + ' 50%,transparent 50%);background-size:30px 30px}';
  st.textContent = css;
  if (!wall) { wall = document.createElement('div'); wall.id = 'skin-wall'; wall.setAttribute('aria-hidden', 'true'); document.body.insertBefore(wall, document.body.firstChild); }
  if (wall.dataset.k === sk.n) return;
  wall.dataset.k = sk.n;
  let s = 3, h = ''; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const dark = THEMES[uiTheme()].base === 'dark', op = dark ? 0.26 : 0.2;
  for (let row = 0; row < 9; row++) for (let col = 0; col < 4; col++) {
    const k = kw[(row + col) % kw.length], hue = sk.wallHue ? sk.wallHue[(row + col) % kw.length] : '';
    const x = (col * 26 + (row % 2) * 13 + R() * 8).toFixed(1), y = (row * 11.5 + R() * 4).toFixed(1), z = Math.round(22 + R() * 14), r = Math.round((R() - 0.5) * 50);
    h += '<img src="' + emo(k) + '" alt="" style="left:' + x + '%;top:' + y + '%;width:' + z + 'px;height:' + z + 'px;opacity:' + op + ';transform:rotate(' + r + 'deg);' + (hue && KW_HUE[hue] ? 'filter:' + KW_HUE[hue] : '') + '">';
  }
  wall.innerHTML = h;
}
/* ملصقات المشهد والزينة المتحرّكة فوق الرئيسية */
function kwHero(sk) {
  const ak = artKey();
  if (ak) return '<div class="skin-fx fx-art fx-' + ak + '" aria-hidden="true">' + Art.sprites(ak) + '</div>';   // وسن 4.6: فراشات ترفرف، بتلات، نجوم معلّقة، قلوب، أزهار
  if (!sk || !sk.stickers) return '';
  let s = 11, fx = ''; const R = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }, F = sk.fx || {};
  if (F.type === 'fly') {
    for (let i = 0; i < F.n; i++) { const hu = F.hue && F.hue[i] ? KW_HUE[F.hue[i]] : '';
      fx += '<img class="fly' + (i % 2 ? ' fl2' : '') + '" src="' + emo(F.k) + '" alt="" style="top:' + (22 + R() * 46).toFixed(1) + '%;width:' + Math.round(18 + R() * 10) + 'px;animation-duration:' + (20 + R() * 12).toFixed(1) + 's;animation-delay:-' + (R() * 30).toFixed(1) + 's;' + (hu ? 'filter:' + hu : '') + '">'; }
    (F.tw || []).forEach(k => { for (let i = 0; i < (F.tn || 4); i++) fx += '<img class="tw" src="' + emo(k) + '" alt="" style="left:' + (R() * 92).toFixed(1) + '%;top:' + (12 + R() * 50).toFixed(1) + '%;width:' + Math.round(10 + R() * 8) + 'px;animation-delay:-' + (R() * 3).toFixed(1) + 's">'; });
  } else if (F.type === 'twinkle') {
    for (let i = 0; i < F.n; i++) fx += '<img class="tw" src="' + emo(F.k[i % F.k.length]) + '" alt="" style="left:' + (R() * 94).toFixed(1) + '%;top:' + (6 + R() * 56).toFixed(1) + '%;width:' + Math.round(10 + R() * 12) + 'px;animation-delay:-' + (R() * 3.4).toFixed(1) + 's;animation-duration:' + (2.6 + R() * 2).toFixed(1) + 's">';
  } else if (F.type === 'fall') {
    for (let i = 0; i < (F.petals || 0); i++) fx += '<i class="pt" style="left:' + (R() * 100).toFixed(1) + '%;animation-duration:' + (10 + R() * 8).toFixed(1) + 's;animation-delay:-' + (R() * 18).toFixed(1) + 's;--dx:' + Math.round(20 + R() * 50) * (R() < 0.5 ? -1 : 1) + 'px;--r:' + Math.round(120 + R() * 240) + 'deg;--s:' + (0.6 + R() * 0.7).toFixed(2) + '"></i>';
    for (let i = 0; i < (F.n || 0); i++) fx += '<img class="ef" src="' + emo(F.k[i % F.k.length]) + '" alt="" style="left:' + (R() * 94).toFixed(1) + '%;width:' + Math.round(14 + R() * 8) + 'px;animation-duration:' + (12 + R() * 8).toFixed(1) + 's;animation-delay:-' + (R() * 20).toFixed(1) + 's;--dx:' + Math.round(20 + R() * 40) * (R() < 0.5 ? -1 : 1) + 'px;--r:' + Math.round(60 + R() * 160) + 'deg;--s:1">';
  }
  const stk = sk.stickers.map(o => '<img class="bob" src="' + emo(o.k) + '" alt="" style="left:' + o.x + '%;top:' + o.y + '%;width:' + o.s + 'px;height:' + o.s + 'px;margin:-' + (o.s / 2) + 'px 0 0 -' + (o.s / 2) + 'px;--r:' + (o.r || 0) + 'deg;animation-delay:-' + (R() * 4).toFixed(1) + 's;' + (o.hue && KW_HUE[o.hue] ? 'filter:' + KW_HUE[o.hue] : '') + '">').join('');
  return '<div class="skin-fx fx-kw" aria-hidden="true">' + fx + '</div><div class="skin-stk" aria-hidden="true">' + stk + '</div>';
}

/* وسن 4.7 · حركة لطيفة برمز الثيم: رمز يطير من المسبحة مع كل تسبيحة (وباقة عند إتمام الدورة)،
   ورموز تتساقط احتفالًا حين تختار ثيمًا جديدًا — وتهدأ مع «تقليل الحركة» */
const reduceMotion = () => { try { if (typeof Motion !== 'undefined' && Motion.lvl === 'off') return true; if (Settings.motionSet) return false; return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };   // وسن 7.1: يتبع إعداد «الحركة»
/* وسن 4.8: زينة التسبيح لكل الثيمات — نجمة ذهبية، بتلة، قلب، أو لمعة حسب الثيم */
function tasParticleSVG() {
  const T = THEMES[uiTheme()] || {}, A = Art._, d = A.doc('tp'), R = Math.random(); let b;
  if (T.skin === 'sakura') b = A.sakura(d, { x: 0, y: 0, r: 10, pal: R < .5 ? 'pink' : 'white' });
  else if (T.skin === 'roses') b = R < .5 ? A.heart(d, { x: 0, y: 0, s: 10, pal: 'pink' }) : A.rose(d, { x: 0, y: 0, r: 10, pal: 'pink' });
  else if (T.skin === 'lavender') b = R < .5 ? A.sparkle(d, { x: 0, y: 0, s: 9, c: '#E6DAFF' }) : A.star(d, { x: 0, y: 0, s: 9, pal: 'pink' });
  else if (T.g === 'girls') b = R < .55 ? A.heart(d, { x: 0, y: 0, s: 10, pal: 'pink' }) : A.sparkle(d, { x: 0, y: 0, s: 9, c: '#FFD6E4' });
  else if (Art._i && R < .5) b = Art._i.gstar(d, { x: 0, y: 0, s: 9 });
  else b = R < .6 ? A.star(d, { x: 0, y: 0, s: 9 }) : A.sparkle(d, { x: 0, y: 0, s: 9, c: '#FFF3C4' });
  return d.svg('-11 -11 22 22', b);
}
function kwPop(th, burst) {
  if (typeof Art === 'undefined' || reduceMotion()) return;
  const mk = th && Art.particle ? () => Art.particle(th) : tasParticleSVG;
  const b = document.getElementById('t-btn'); if (!b) return;
  const rc = b.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height * 0.42, n = burst ? 16 : 1;
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i'); el.className = 'kwpt'; el.setAttribute('aria-hidden', 'true');
    const a = burst ? (i / n) * Math.PI * 2 : (-Math.PI / 2 + (Math.random() - 0.5) * 1.3), dist = burst ? 90 + Math.random() * 70 : 70 + Math.random() * 50, z = burst ? 18 + Math.random() * 12 : 16 + Math.random() * 8;
    el.style.cssText = 'left:' + (cx - z / 2) + 'px;top:' + (cy - z / 2) + 'px;width:' + z + 'px;height:' + z + 'px;--dx:' + Math.round(Math.cos(a) * dist) + 'px;--dy:' + Math.round(Math.sin(a) * dist - (burst ? 20 : 30)) + 'px;--r:' + Math.round((Math.random() - 0.5) * 120) + 'deg;animation-duration:' + (burst ? 1.4 : 1.05 + Math.random() * 0.3).toFixed(2) + 's';
    el.innerHTML = mk(); document.body.appendChild(el); setTimeout(() => el.remove(), 1600);
  }
}
function kwCelebrate(th) {
  if (!th || typeof Art === 'undefined' || !Art.particle || reduceMotion()) return;
  const W = window.innerWidth || 400;
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('i'); el.className = 'kwcel'; el.setAttribute('aria-hidden', 'true'); const z = 18 + Math.random() * 16;
    el.style.cssText = 'left:' + Math.round(Math.random() * (W - z)) + 'px;width:' + z + 'px;height:' + z + 'px;--dx:' + Math.round((Math.random() - 0.5) * 90) + 'px;--r:' + Math.round((Math.random() - 0.5) * 300) + 'deg;animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's;animation-duration:' + (2.2 + Math.random() * 1.2).toFixed(2) + 's';
    el.innerHTML = Art.particle(th); document.body.appendChild(el); setTimeout(() => el.remove(), 4400);
  }
}
setTimeout(() => { try { applySkinDeco(); } catch (e) { console.error(e); } }, 0);
/* أيقونة بصرية: رمز ثلاثي الأبعاد في الثيمات الكاملة، وأيقونة خطية في غيرها */
const KW_ICON = { sunrise: 'sunrise', sunset: 'sunset', mosque: 'mosque', moon: 'moon', sun: 'alarm', home: 'house', hands: 'palms', book: 'book', beads: 'beads', heart: 'sparkheart',
  star8: 'sparkles', kaaba: 'kaaba', calendar: 'calendar', moonstar: 'moon', prayer: 'beads' };
function kwIcon(name, key, size) {
  const sk = curSkin(), k = sk && sk.stickers ? KW_ICON[key || name] : null;
  return k ? emoImg(k, 'width:' + (size || 28) + 'px;height:' + (size || 28) + 'px;display:block', 'kwi') : icon(name);
}

'use strict';
/* ════════════════════════════════════════════════════════════════
   وسن 4.6 · «ريشة وسن» — رسومات الثيمات الكاملة
   رسوم متجهية مرسومة خصيصًا لوسن داخل التطبيق (بلا صور خارجية):
   فراشات زرقاء بأجنحة متلألئة، ورود متفتّحة، نجوم وهلال، فراولة، أزهار الربيع.
   كل مشهد يُولَّد بتوزيع ثابت، ويزداد امتلاءً كلما نما بستانك.
   ════════════════════════════════════════════════════════════════ */
const Art = (() => {
  const f = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = seed => { let s = (seed >>> 0) % 2147483647 || 7; return () => (s = s * 16807 % 2147483647) / 2147483647; };
  const P = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];            // قطبي: الزاوية 0 = للأعلى
  const pt = p => f(p[0]) + ' ' + f(p[1]);
  const RAD = Math.PI / 180;
  const bz = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
  const toward = (p, c, dist) => { const dx = c[0] - p[0], dy = c[1] - p[1], L = Math.hypot(dx, dy) || 1; return [p[0] + dx / L * dist, p[1] + dy / L * dist]; };
  let SEQ = 0;
  /** مستند رسم: سجلّ للتدرّجات والرموز بمعرّفات فريدة */
  function doc(px) {
    const pre = (px || 'a') + (++SEQ).toString(36) + '-', defs = new Map();
    return {
      def(k, mk) { if (!defs.has(k)) { defs.set(k, ''); defs.set(k, mk(pre + k)); } return 'url(#' + pre + k + ')'; },
      sym(k, mk) { if (!defs.has(k)) { defs.set(k, ''); defs.set(k, mk(pre + k)); } return '#' + pre + k; },
      defs() { return Array.from(defs.values()).join(''); },
      svg(vb, body, ex) { const dd = this.defs(); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"' + (ex || '') + '>' + (dd ? '<defs>' + dd + '</defs>' : '') + body + '</svg>'; },
    };
  }
  const stops = a => a.map(s => '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>').join('');
  const LG = (x1, y1, x2, y2, st, us) => id => '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (us ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(st) + '</linearGradient>';
  const RG = (cx, cy, r, st, fx, fy, us) => id => '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + (us ? ' gradientUnits="userSpaceOnUse"' : '') + '>' + stops(st) + '</radialGradient>';
  const TR = (x, y, s, r) => 'translate(' + f(x) + ' ' + f(y) + ')' + (r ? ' rotate(' + f(r) + ')' : '') + (Array.isArray(s) ? ' scale(' + f2(s[0]) + ' ' + f2(s[1]) + ')' : (s != null && s !== 1 ? ' scale(' + f2(s) + ')' : ''));
  const g = (x, y, s, r, body, ex) => '<g transform="' + TR(x, y, s, r) + '"' + (ex || '') + '>' + body + '</g>';
  const use = (h, x, y, s, r, ex) => '<use href="' + h + '" transform="' + TR(x, y, s, r) + '"' + (ex || '') + '/>';
  const op = o => (o.op != null ? ' opacity="' + o.op + '"' : '');

  /* ───────── الفراشة (مورفو زرقاء بأجنحة متلألئة) ───────── */
  const BF = {
    morpho: { g: ['#F0FCFF', '#A8E7FF', '#47AFFF', '#1E69E8', '#0E36A2', '#081D62'], edge: '#071440', vein: '#0A2A7A', b: ['#3A4670', '#0B1028'], sh: '#DFF8FF' },
    sky: { g: ['#FFFFFF', '#DFF4FF', '#9CD6FF', '#5AA9F4', '#3577D8', '#1F50B0'], edge: '#163A86', vein: '#2A5DB8', b: ['#43558A', '#18234E'], sh: '#FFFFFF' },
    ice: { g: ['#FFFFFF', '#F6FBFF', '#DDF0FF', '#B6DBFB', '#8BBEF0', '#6AA0E0'], edge: '#4E7CC6', vein: '#7AA4DC', b: ['#5C6DA0', '#2B3764'], sh: '#FFFFFF' },
    royal: { g: ['#E8F1FF', '#93BAFF', '#5381F2', '#3052CE', '#1F3194', '#131E60'], edge: '#0B1240', vein: '#1B2A7A', b: ['#353D6E', '#0D1130'], sh: '#CFE0FF' },
    pink: { g: ['#FFFFFF', '#FFEBF3', '#FFC3D9', '#F895BC', '#E4709F', '#C65487'], edge: '#A5436F', vein: '#C95A8A', b: ['#6E4260', '#3C2236'], sh: '#FFFFFF' },
    lemon: { g: ['#FFFFFF', '#FFFBE4', '#FFEFB0', '#FFDC78', '#F5BE4A', '#E09F2A'], edge: '#B77A1E', vein: '#D69A32', b: ['#6E5634', '#3C2C16'], sh: '#FFFFFF' },
    lilac: { g: ['#FFFFFF', '#F5EFFF', '#DDCCFF', '#BCA3F5', '#9C80E3', '#7D63C8'], edge: '#6450A8', vein: '#7E68C0', b: ['#5A4E7E', '#2E2748'], sh: '#FFFFFF' },
    gold: { g: ['#FFFDF0', '#FFF1C0', '#FFDB7A', '#F4B63C', '#D98E1A', '#A86508'], edge: '#5A3A08', vein: '#8A5A12', b: ['#5A4020', '#2A1C0A'], sh: '#FFFFFF' },
  };
  const FW = [[4, -8], [22, -44], [54, -70], [88, -72], [98, -72], [101, -62], [97, -50], [92, -35], [84, -20], [72, -6], [54, 3], [26, 3], [6, -2]];
  const HW = [[6, 0], [28, -4], [60, -2], [78, 10], [90, 20], [91, 40], [81, 54], [70, 68], [50, 76], [34, 70], [18, 64], [8, 40], [6, 0]];
  const cpath = a => 'M' + pt(a[0]) + a.slice(1).reduce((s, p, i) => s + (i % 3 === 0 ? 'C' : ' ') + pt(p), '') + 'Z';
  const FWd = cpath(FW), HWd = cpath(HW);
  const seg = (a, k) => [a[k * 3], a[k * 3 + 1], a[k * 3 + 2], a[k * 3 + 3]];
  const onSeg = (a, k, t) => { const s = seg(a, k); return bz(s[0], s[1], s[2], s[3], t); };
  const BFDOTS = (() => {
    const fc = [50, -34], hc = [44, 30], out = [];
    [[1, .3], [1, .62], [1, .95], [2, .16], [2, .34], [2, .52], [2, .7], [2, .88], [0, .86], [0, .95]].forEach(([k, t]) => out.push([toward(onSeg(FW, k, t), fc, 5.2), 1.55]));
    [[1, .55, 13], [2, .12, 13], [2, .38, 13.5], [1, .7, 21]].forEach(([k, t, d]) => out.push([toward(onSeg(FW, k, t), fc, d), k === 1 && d > 20 ? 2.1 : 2.7]));
    [[1, .14], [1, .44], [1, .74], [2, .06], [2, .36], [2, .66], [2, .92]].forEach(([k, t]) => out.push([toward(onSeg(HW, k, t), hc, 5), 1.5]));
    [[1, .36, 14], [1, .82, 14], [2, .3, 14], [2, .62, 13]].forEach(([k, t, d]) => out.push([toward(onSeg(HW, k, t), hc, d), 2.3]));
    return out;
  })();
  const BFVEIN = (() => {
    const v = (a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 3]; return 'M' + pt(a) + 'Q' + pt(m) + ' ' + pt(b); };
    const fb = [7, -5], hb = [8, 4];
    return [[0, .7], [1, .45], [2, .08], [2, .4], [2, .72], [3, .3]].map(([k, t]) => v(fb, onSeg(FW, k, t))).join('') +
      [[0, .8], [1, .3], [1, .75], [2, .2], [2, .6], [3, .2]].map(([k, t]) => v(hb, onSeg(HW, k, t))).join('');
  })();
  function bfWing(d, pal) {
    const c = BF[pal] || BF.morpho;
    return d.sym('bfw' + pal, id => {
      const gw = d.def('bfg' + pal, RG(8, -4, 104, [[0, c.g[0]], [.1, c.g[1]], [.3, c.g[2]], [.56, c.g[3]], [.8, c.g[4]], [1, c.g[5]]], null, null, true));
      const gs = d.def('bfs' + pal, RG(.5, .5, .5, [[0, c.sh, .6], [1, c.sh, 0]]));
      const cf = d.def('bfcf', id2 => '<clipPath id="' + id2 + '"><path d="' + FWd + '"/></clipPath>'), ch = d.def('bfch', id2 => '<clipPath id="' + id2 + '"><path d="' + HWd + '"/></clipPath>');
      const dots = BFDOTS.map(([p, r]) => '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + r + '"/>').join('');
      return '<g id="' + id + '">' +
        '<path d="' + HWd + '" fill="' + gw + '"/><g clip-path="' + ch + '"><path d="' + HWd + '" fill="none" stroke="' + c.edge + '" stroke-width="11"/>' +
        '<ellipse cx="40" cy="27" rx="22" ry="8" transform="rotate(36 40 27)" fill="' + gs + '"/></g>' +
        '<path d="' + FWd + '" fill="' + gw + '"/><g clip-path="' + cf + '"><path d="' + FWd + '" fill="none" stroke="' + c.edge + '" stroke-width="11"/>' +
        '<ellipse cx="40" cy="-33" rx="30" ry="9" transform="rotate(-38 40 -33)" fill="' + gs + '"/></g>' +
        '<path d="' + BFVEIN + '" fill="none" stroke="' + c.vein + '" stroke-width="1.1" opacity=".38"/>' +
        '<g fill="#FFFFFF" opacity=".95">' + dots + '</g></g>';
    });
  }
  function bfly(d, o) {
    const pal = o.pal || 'morpho', c = BF[pal] || BF.morpho, w = bfWing(d, pal);
    const bg = d.def('bfb' + pal, LG(0, 0, 1, 0, [[0, c.b[1]], [.45, c.b[0]], [1, c.b[1]]]));
    const wings = '<use href="' + w + '"/><use href="' + w + '" transform="scale(-1 1)"/>';
    const body = '<path d="M0 -4C3.6 -4 4.2 8 3.2 22C2.6 32 1.4 40 0 42C-1.4 40 -2.6 32 -3.2 22C-4.2 8 -3.6 -4 0 -4Z" fill="' + bg + '"/>' +
      '<ellipse cy="-9" rx="5" ry="9.5" fill="' + bg + '"/><circle cy="-20" r="4.6" fill="' + c.b[1] + '"/>' +
      '<path d="M-1.4 -23C-4 -35 -9 -45 -15 -53M1.4 -23C4 -35 9 -45 15 -53" fill="none" stroke="' + c.b[1] + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="-15" cy="-53" r="2.2" fill="' + c.b[1] + '"/><circle cx="15" cy="-53" r="2.2" fill="' + c.b[1] + '"/><circle cx="-1.6" cy="-21.4" r="1.1" fill="#fff" opacity=".55"/>';
    return g(o.x, o.y, o.s, o.r, (o.flap ? '<g class="wg">' + wings + '</g>' : wings) + body, op(o));
  }

  /* ───────── الوردة (منظر علوي بطبقات بتلات) ───────── */
  const RS = {
    red: ['#FFC4CF', '#FF7592', '#E8355B', '#B5173F', '#7C0A2A'],
    pink: ['#FFE9F0', '#FFBDCF', '#F786A8', '#DB5783', '#A8335D'],
    blush: ['#FFF8FA', '#FFE1E9', '#FBBFCF', '#EE97AF', '#C9728D'],
    white: ['#FFFFFF', '#FFF8F6', '#F8E6E8', '#EBC9CF', '#C99EA8'],
    peach: ['#FFF4EA', '#FFD7C0', '#FFB28F', '#F08A68', '#C66446'],
    coral: ['#FFE3DE', '#FFAA9D', '#FF776B', '#E04A4C', '#A62D35'],
    lilac: ['#FCF7FF', '#EADBFF', '#CFB4F6', '#AB89E1', '#7D5DB9'],
    wine: ['#F7B8C8', '#E0607F', '#B82850', '#86123A', '#560822'],
  };
  const RL = [[1.04, 5, 44, 0, 1, 3, .72], [.86, 5, 47, 36, 1, 3, .6], [.69, 4, 55, 14, 2, 3, .45], [.53, 4, 62, 58, 2, 4, .32], [.39, 3, 76, 24, 3, 4, .22], [.27, 3, 90, 84, 3, 4, 0]];
  const petalD = (R, hw, r0, w) => {
    const A = P(r0, -hw * .55), B = P(R * .88, -hw), C1 = P(R * (1.03 + w), -hw * .52), C2 = P(R * (1.05 - w), hw * .48), E2 = P(R * .88, hw), E = P(r0, hw * .55), qa = P(R * .72, -hw * 1.1), qb = P(R * .72, hw * 1.1);
    return ['M' + pt(A) + 'Q' + pt(qa) + ' ' + pt(B) + 'C' + pt(C1) + ' ' + pt(C2) + ' ' + pt(E2) + 'Q' + pt(qb) + ' ' + pt(E) + 'Q0 ' + f(-r0 * .4) + ' ' + pt(A) + 'Z',
      'M' + pt(B) + 'C' + pt(C1) + ' ' + pt(C2) + ' ' + pt(E2)];
  };
  function roseSym(d, pal) {
    const c = RS[pal] || RS.red;
    return d.sym('rs' + pal, id => {
      const r = rng(97);
      const gsh = d.def('rssh' + pal, RG(.5, .5, .5, [[0, c[4], .9], [.7, c[4], .5], [1, c[4], 0]]));
      let s = '<circle r="38" fill="' + gsh + '"/>';
      RL.forEach(([k, n, hw, off, oi, ii, eo], li) => {
        const gr = d.def('rsg' + pal + li, LG(0, 1, 0, 0, [[0, c[ii]], [.5, c[Math.min(4, oi + 1)]], [1, c[oi]]]));
        for (let i = 0; i < n; i++) {
          const [pd, ed] = petalD(50 * k * (.95 + r() * .1), hw * RAD * (.94 + r() * .12), 50 * k * .22, (r() - .5) * .08);
          s += '<g transform="rotate(' + f(off + i * 360 / n + (r() - .5) * 10) + ')"><path d="' + pd + '" fill="' + gr + '"/>' + (eo ? '<path d="' + ed + '" fill="none" stroke="' + c[0] + '" stroke-width="' + f(1.7 - li * .22) + '" stroke-linecap="round" opacity="' + eo + '"/>' : '') + '</g>';
        }
      });
      s += '<circle r="4.2" fill="' + c[4] + '"/><path d="M-4.2 1.2A4.2 4.2 0 0 1 3.2 -2.8" fill="none" stroke="' + c[3] + '" stroke-width="1.4" stroke-linecap="round"/>';
      return '<g id="' + id + '">' + s + '</g>';
    });
  }

  /* وردة بمنظر جانبي (كأس متفتّح بحلزون في القلب) */
  function rose3Sym(d, pal) {
    const c = RS[pal] || RS.red;
    return d.sym('r3' + pal, id => {
      const gB = d.def('r3b' + pal, LG(0, 0, .2, 1, [[0, c[2]], [.55, c[3]], [1, c[4]]])), gM = d.def('r3m' + pal, LG(0, 0, .3, 1, [[0, c[1]], [.55, c[2]], [1, c[3]]]));
      const gF = d.def('r3f' + pal, LG(0, 0, 0, 1, [[0, c[1]], [.4, c[2]], [1, c[4]]])), gC = d.def('r3c' + pal, LG(0, 0, 0, 1, [[0, c[1]], [.5, c[2]], [1, c[3]]]));
      const gI = d.def('r3i' + pal, RG(.5, .7, .7, [[0, c[4]], [1, c[3]]])), gS = d.def('r3s', LG(0, 0, 1, 1, [[0, '#8FD48A'], [1, '#2F7F45']]));
      const hi = (p, w, o2) => '<path d="' + p + '" fill="none" stroke="' + c[0] + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (o2 || .85) + '"/>';
      const sh = (p, o2) => '<path d="' + p + '" fill="none" stroke="' + c[4] + '" stroke-width="1.1" stroke-linecap="round" opacity="' + (o2 || .35) + '"/>';
      return '<g id="' + id + '">' +
        '<path d="M-6 30C-16 40 -30 40 -38 33C-28 32 -19 28 -12 24ZM6 30C16 40 30 40 38 33C28 32 19 28 12 24ZM-3.5 32C-2 43 2 43 3.5 32Z" fill="' + gS + '"/>' +
        // البتلات الخلفية
        '<path d="M-3 -38C-16 -54 -41 -49 -45 -29C-48 -14 -43 0 -35 6C-31 -10 -20 -26 -3 -38Z" fill="' + gB + '"/>' + hi('M-3 -38C-16 -54 -41 -49 -45 -29', 1.3, .6) +
        '<path d="M3 -38C16 -54 41 -49 45 -29C48 -14 43 0 35 6C31 -10 20 -26 3 -38Z" fill="' + gB + '"/>' + hi('M3 -38C16 -54 41 -49 45 -29', 1.3, .6) +
        '<path d="M-21 -37C-15 -55 15 -55 21 -37C12 -41 -12 -41 -21 -37Z" fill="' + gB + '"/>' + hi('M-21 -37C-15 -55 15 -55 21 -37', 1.2, .55) +
        // تجويف القلب والحلزون
        '<path d="M-36 -26C-30 -36 30 -36 36 -26C38 -10 30 6 0 10C-30 6 -38 -10 -36 -26Z" fill="' + c[4] + '"/>' +
        '<ellipse cy="-30" rx="23" ry="9.5" fill="' + gI + '"/>' +
        '<path d="M-14 -31C-12 -44 12 -46 15 -33C8 -39 -6 -39 -14 -31Z" fill="' + gM + '"/>' + hi('M-14 -31C-12 -44 12 -46 15 -33', 1.1, .7) +
        '<path d="M-6.5 -34C-5 -40.5 6 -40.5 7 -35C7.8 -30.8 1.8 -30 .2 -32.8" fill="none" stroke="' + c[1] + '" stroke-width="1.5" stroke-linecap="round"/>' +
        // البتلات الوسطى الملتفّة
        '<path d="M-31 -30C-33 -43 -19 -49 -6 -45C-16 -41 -22 -33 -21 -20C-26 -21 -30 -25 -31 -30Z" fill="' + gM + '"/>' + hi('M-31 -30C-33 -43 -19 -49 -6 -45', 1.3) +
        '<path d="M31 -30C33 -43 19 -49 6 -45C16 -41 22 -33 21 -20C26 -21 30 -25 31 -30Z" fill="' + gM + '"/>' + hi('M31 -30C33 -43 19 -49 6 -45', 1.3) +
        // البتلات الأمامية
        '<path d="M-43 -19C-49 4 -37 27 -10 34C-14 17 -16 -1 -24 -14C-30 -21 -38 -22 -43 -19Z" fill="' + gF + '"/>' + hi('M-43 -19C-38 -22 -30 -21 -24 -14', 1.8) + sh('M-36 -6C-36 8 -28 20 -16 28') +
        '<path d="M43 -19C49 4 37 27 10 34C14 17 16 -1 24 -14C30 -21 38 -22 43 -19Z" fill="' + gF + '"/>' + hi('M43 -19C38 -22 30 -21 24 -14', 1.8) + sh('M36 -6C36 8 28 20 16 28') +
        '<path d="M-25 -17C-27 7 -15 31 0 35C15 31 27 7 25 -17C17 -10 8 -12 0 -19C-8 -12 -17 -10 -25 -17Z" fill="' + gC + '"/>' +
        '<path d="M-25 -17C-17 -10 -8 -12 0 -19C8 -12 17 -10 25 -17C17 -7 8 -8.5 0 -14.5C-8 -8.5 -17 -7 -25 -17Z" fill="' + c[0] + '" opacity=".38"/>' + hi('M-25 -17C-17 -10 -8 -12 0 -19C8 -12 17 -10 25 -17', 1.6) +
        sh('M-10 4C-9 16 -5 25 0 30', .25) + sh('M11 2C10 14 6 24 1 30', .22) +
        '</g>';
    });
  }
  const rose3 = (d, o) => use(rose3Sym(d, o.pal || 'red'), o.x, o.y, (o.r || 24) / 48, o.rot || 0, op(o));
  const rose = (d, o) => use(roseSym(d, o.pal || 'red'), o.x, o.y, (o.r || 20) / 50, o.rot || 0, op(o));
  /* برعم وردة جانبي على ساق */
  function rosebud(d, o) {
    const c = RS[o.pal || 'red'], gb = d.def('rb' + (o.pal || 'red'), LG(0, 1, 0, 0, [[0, c[3]], [.6, c[2]], [1, c[1]]])), gl = d.def('lfgmint', LG(0, 0, 1, .3, [[0, '#A6E09A'], [.5, '#5DB56A'], [1, '#2F7F4A']]));
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="M0 0C0 14 1 26 -2 40" fill="none" stroke="#3E8A55" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M-7 -4C-9 -14 -3 -22 0 -24C3 -22 9 -14 7 -4C4 1 -4 1 -7 -4Z" fill="' + gb + '"/><path d="M-2 -20C1 -16 2 -10 0 -3" fill="none" stroke="' + c[4] + '" stroke-width="1" opacity=".5"/>' +
      '<path d="M0 0C-6 -1 -10 -5 -9 -10C-5 -7 -3 -4 0 -3C3 -4 5 -7 9 -10C10 -5 6 -1 0 0Z" fill="' + gl + '"/>', op(o));
  }

  /* ───────── الأوراق ───────── */
  const LV = { green: ['#A6E09A', '#5DB56A', '#2F7F4A'], deep: ['#7FC98A', '#3E9A5E', '#1F5E3A'], sage: ['#CDE8C4', '#90C59C', '#5A9170'], mint: ['#D2F4E0', '#92DBB2', '#4FAF80'], olive: ['#C8DE8E', '#8DB356', '#557A2A'] };
  function leafSym(d, pal) {
    const c = LV[pal] || LV.green;
    return d.sym('lf' + pal, id => {
      const gr = d.def('lfg' + pal, LG(0, 0, 1, .3, [[0, c[0]], [.5, c[1]], [1, c[2]]]));
      return '<g id="' + id + '"><path d="M0 0C9 -8 10 -30 0 -44C-10 -30 -9 -8 0 0Z" fill="' + gr + '"/><path d="M0 -2Q1.2 -22 0 -41" fill="none" stroke="' + c[0] + '" stroke-width="1" opacity=".75"/>' +
        '<path d="M.4 -12L5 -17M.5 -21L5.6 -27M.4 -30L4.2 -35M-.4 -12L-5 -17M-.5 -21L-5.6 -27M-.4 -30L-4.2 -35" stroke="' + c[0] + '" stroke-width=".7" opacity=".5" fill="none"/></g>';
    });
  }
  const leaf = (d, o) => use(leafSym(d, o.pal || 'green'), o.x, o.y, o.w ? [(o.l || 44) / 44 * o.w, (o.l || 44) / 44] : (o.l || 44) / 44, o.r || 0, op(o));

  /* ───────── الفراولة ───────── */
  const BERRY = [[0, -30], [18, -34], [32, -24], [31, -6], [30, 10], [18, 28], [3, 37]];
  const BERRYd = 'M0 -30C18 -34 32 -24 31 -6C30 10 18 28 3 37C1 38.2 -1 38.2 -3 37C-18 28 -30 10 -31 -6C-32 -24 -18 -34 0 -30Z';
  const SEEDS = (() => {
    const pts = []; for (let k = 0; k < 2; k++) for (let i = 0; i <= 24; i++) pts.push(onSeg(BERRY, k, i / 24));
    const hw = y => { let best = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) best = Math.max(best, a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])); } return best; };
    const out = []; let row = 0;
    for (let y = -23; y <= 31; y += 7.3, row++) { const w = hw(y) - 4.2; for (let x = row % 2 ? 4.3 : 0; x <= w; x += 8.6) { out.push([x, y, w]); if (x > 0) out.push([-x, y, w]); } }
    return out;
  })();
  function berrySym(d, mini) {
    return d.sym(mini ? 'sbm' : 'sb', id => {
      const gb = d.def('sbg', RG(.36, .27, .8, [[0, '#FF9AA9'], [.3, '#F7536C'], [.66, '#E02B48'], [1, '#B01530']]));
      const gs = d.def('sbs', LG(0, 0, 1, 1, [[0, '#7A0A20', 0], [.55, '#7A0A20', 0], [1, '#6A0418', .38]]));
      const gh = d.def('sbh', RG(.5, .5, .5, [[0, '#FFFFFF', .8], [1, '#FFFFFF', 0]]));
      const gl = d.def('sbl', LG(0, 0, 1, .4, [[0, '#9FE28C'], [.55, '#4FB150'], [1, '#2B7D3A']]));
      let s = '<path d="' + BERRYd + '" fill="' + gb + '"/><path d="' + BERRYd + '" fill="' + gs + '"/>';
      (mini ? SEEDS.filter((_, i) => i % 3 === 0) : SEEDS).forEach(([x, y, w]) => { const q = Math.abs(x) / Math.max(1, w + 4.2), sx = 1 - .45 * q * q, a = x / Math.max(1, w + 4.2) * 28;
        s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ') scale(' + f2(sx) + ' 1)">' + (mini ? '' : '<ellipse cy=".9" rx="1.7" ry="2.5" fill="#9A0A26" opacity=".36"/>') + '<ellipse rx="1.25" ry="2.1" fill="#FFE590"/></g>'; });
      s += '<ellipse cx="-12" cy="-14" rx="8.5" ry="5" transform="rotate(-32 -12 -14)" fill="' + gh + '"/><circle cx="-15.5" cy="-16" r="1.7" fill="#fff" opacity=".85"/>';
      const sep = 'M0 0C4.4 -4 4.6 -12 0 -18.5C-4.6 -12 -4.4 -4 0 0Z';
      [[-110, 1], [-74, 1.12], [-38, .98], [0, .8], [38, .98], [74, 1.12], [110, 1]].forEach(([a, k]) => { s += '<path d="' + sep + '" transform="translate(0 -29) rotate(' + a + ') scale(' + k + ')" fill="' + gl + '"/>'; });
      s += '<ellipse cy="-29" rx="4.5" ry="2.6" fill="#3F9A45"/><path d="M0 -30C.4 -37 2.4 -42 6 -46" fill="none" stroke="#3F8A3A" stroke-width="3.2" stroke-linecap="round"/>';
      return '<g id="' + id + '">' + s + '</g>';
    });
  }
  const berry = (d, o) => use(berrySym(d, o.mini), o.x, o.y, o.s || 1, o.r || 0, op(o));
  /* ورقة الفراولة الثلاثية المسنّنة */
  const LEAFLET = (() => {
    const L = 30, W = 12.5, N = 22, pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N, y = -L * t, w = W * Math.sin(Math.PI * Math.pow(t, .82)) * (1 - .12 * t), th = (i % 2 && t > .14 && t < .96) ? 1.7 : 0; pts.push([w + th, y]); }
    return 'M' + pts.map(pt).join('L') + 'L' + pts.slice().reverse().map(p => pt([-p[0], p[1]])).join('L') + 'Z';
  })();
  function trileafSym(d, pal) {
    return d.sym('tl' + (pal || 'g'), id => {
      const c = pal === 'light' ? ['#B8EBA3', '#6CC364', '#3E9A45'] : ['#96D987', '#48A94E', '#257236'];
      const gr = d.def('tlg' + (pal || 'g'), LG(0, 0, 1, .5, [[0, c[0]], [.5, c[1]], [1, c[2]]]));
      const one = a => '<g transform="rotate(' + a + ')"><path d="' + LEAFLET + '" fill="' + gr + '"/><path d="M0 -1L0 -28M0 -8L5 -12M0 -15L6 -20M0 -22L4.5 -26M0 -8L-5 -12M0 -15L-6 -20M0 -22L-4.5 -26" stroke="' + c[0] + '" stroke-width=".8" fill="none" opacity=".7"/></g>';
      return '<g id="' + id + '"><path d="M0 0L0 16" stroke="#3E8A45" stroke-width="2.2" stroke-linecap="round"/>' + one(-42) + one(42) + one(0) + '</g>';
    });
  }
  const trileaf = (d, o) => use(trileafSym(d, o.pal), o.x, o.y, o.s || 1, o.r || 0, op(o));
  /* زهرة الفراولة البيضاء */
  function blossomSym(d) {
    return d.sym('sbl5', id => {
      const gp = d.def('sblp', RG(.5, .9, .9, [[0, '#F3E6EA'], [.5, '#FFFFFF'], [1, '#FFFFFF']])), gc = d.def('sblc', RG(.4, .35, .7, [[0, '#FFF1A0'], [.6, '#FFD13E'], [1, '#E6A21E']]));
      let s = ''; for (let i = 0; i < 5; i++) s += '<path d="M0 0C-7.5 -3 -9.5 -14.5 0 -17.5C9.5 -14.5 7.5 -3 0 0Z" transform="rotate(' + (i * 72) + ')" fill="' + gp + '" stroke="#EBD8DE" stroke-width=".6"/>';
      s += '<circle r="4.2" fill="' + gc + '"/>'; for (let i = 0; i < 9; i++) { const p = P(3.1, i * 40 * RAD); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r=".62" fill="#D98C1E"/>'; }
      return '<g id="' + id + '">' + s + '</g>';
    });
  }
  const blossom = (d, o) => use(blossomSym(d), o.x, o.y, o.s || 1, o.r || 0, op(o));

  /* ───────── أزهار الكرز ───────── */
  const SAKd = 'M0 0C-5.6 -2.6 -6.3 -9.2 -2.1 -10.2Q-.8 -10.2 0 -8.7Q.8 -10.2 2.1 -10.2C6.3 -9.2 5.6 -2.6 0 0Z';
  const SAK = { pink: ['#FFF6F9', '#FFD6E4', '#F79FC0', '#DF6F9A'], white: ['#FFFFFF', '#FFF5F8', '#FCDDE8', '#EEAAC3'], deep: ['#FFE8F0', '#FFB8D0', '#F07FA8', '#CF4F82'], peach: ['#FFF7F1', '#FFE0CF', '#FFB896', '#EF8E6A'], lilac: ['#FBF7FF', '#ECDFFF', '#CDB5F5', '#A585DE'] };
  function sakuraSym(d, pal) {
    const c = SAK[pal] || SAK.pink;
    return d.sym('sk' + pal, id => {
      const gp = d.def('skg' + pal, LG(0, 1, 0, 0, [[0, c[2]], [.45, c[1]], [1, c[0]]]));
      let s = ''; for (let i = 0; i < 5; i++) s += '<path d="' + SAKd + '" transform="rotate(' + (i * 72) + ')" fill="' + gp + '"/>';
      s += '<circle r="2.1" fill="' + c[3] + '"/>';
      for (let i = 0; i < 8; i++) { const p = P(4.3, (i * 45 + 20) * RAD); s += '<path d="M0 0L' + pt(p) + '" stroke="' + c[3] + '" stroke-width=".45"/><circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r=".62" fill="#F6C14E"/>'; }
      return '<g id="' + id + '">' + s + '</g>';
    });
  }
  const sakura = (d, o) => use(sakuraSym(d, o.pal || 'pink'), o.x, o.y, (o.r || 10) / 10, o.rot || 0, op(o));
  const sbud = (d, o) => g(o.x, o.y, (o.r || 4) / 4, o.rot || 0, '<ellipse cy="-3" rx="2.6" ry="3.8" fill="' + (SAK[o.pal || 'pink'] || SAK.pink)[2] + '"/><ellipse cx="-.8" cy="-4" rx=".9" ry="1.6" fill="#fff" opacity=".45"/><path d="M-2.4 0Q0 1.8 2.4 0L0 2.6Z" fill="#6FA85A"/>', op(o));

  /* ───────── الأقحوان ───────── */
  const DZ = { white: ['#FFFFFF', '#F2E7EE', '#E5D5DF'], pink: ['#FFF3F8', '#FFC7DC', '#F29BBE'], lemon: ['#FFFEF2', '#FFF0B3', '#F7D66A'], lilac: ['#FBF8FF', '#E3D6FF', '#BFA6F0'] };
  function daisySym(d, pal) {
    const c = DZ[pal] || DZ.white;
    return d.sym('dz' + pal, id => {
      const gp = d.def('dzg' + pal, LG(0, 1, 0, 0, [[0, c[1]], [.5, c[0]], [1, c[0]]])), gc = d.def('dzc', RG(.4, .35, .7, [[0, '#FFF19A'], [.55, '#FFC83A'], [1, '#E3901A']]));
      let s = ''; for (let i = 0; i < 16; i++) s += '<ellipse cy="-5.7" rx="1.45" ry="4.5" transform="rotate(' + f(i * 22.5) + ')" fill="' + gp + '" stroke="' + c[2] + '" stroke-width=".25"/>';
      s += '<circle r="3.1" fill="' + gc + '"/>'; for (let i = 0; i < 10; i++) { const p = P(i % 2 ? 1.2 : 2.2, i * 36 * RAD); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r=".42" fill="#C9780E" opacity=".75"/>'; }
      return '<g id="' + id + '">' + s + '</g>';
    });
  }
  const daisy = (d, o) => use(daisySym(d, o.pal || 'white'), o.x, o.y, (o.r || 10) / 10, o.rot || 0, op(o));

  /* ───────── التوليب ───────── */
  const TU = { pink: ['#FFD6E5', '#FF98BC', '#E5588E', '#B8386C'], peach: ['#FFE6D4', '#FFB890', '#F28660', '#C66042'], yellow: ['#FFF8CF', '#FFE47E', '#F6BF3C', '#D6961E'], lilac: ['#F3E9FF', '#D0B6FF', '#A283EA', '#7759C0'], red: ['#FFC9C9', '#FF808C', '#E43E52', '#A82036'], white: ['#FFFFFF', '#FFF5F7', '#F3DDE4', '#D9B3C0'] };
  function tulipSym(d, pal) {
    const c = TU[pal] || TU.pink;
    return d.sym('tu' + pal, id => {
      const gb = d.def('tub' + pal, LG(0, 1, 0, 0, [[0, c[3]], [.6, c[2]], [1, c[1]]])), gf = d.def('tuf' + pal, LG(.2, 1, 0, 0, [[0, c[2]], [.55, c[1]], [1, c[0]]]));
      return '<g id="' + id + '"><path d="M-10 -6C-11 -18 -6.5 -26.5 -2.6 -21.5C-1 -25.5 1 -25.5 2.6 -21.5C6.5 -26.5 11 -18 10 -6C9 2 -9 2 -10 -6Z" fill="' + gb + '"/>' +
        '<path d="M-6.6 -3C-8.2 -13 -4.2 -22 0 -25.4C4.2 -22 8.2 -13 6.6 -3C4.6 2.2 -4.6 2.2 -6.6 -3Z" fill="' + gf + '"/><path d="M-2.2 -6C-3.2 -12 -2.2 -18 0 -21.5" fill="none" stroke="' + c[0] + '" stroke-width=".9" stroke-linecap="round" opacity=".8"/></g>';
    });
  }
  function tulip(d, o) {
    const gl = d.def('tulf', LG(0, 0, 1, 0, [[0, '#9EDB8E'], [.6, '#56B062'], [1, '#347F44']])), h = o.h || 50, b = o.bend || 0;
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="M0 0C' + f(b * .4) + ' ' + f(h * .4) + ' ' + f(b) + ' ' + f(h * .7) + ' ' + f(b * 1.1) + ' ' + h + '" fill="none" stroke="#4E9A55" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M' + f(b * 1.1) + ' ' + h + 'C' + f(b - 12) + ' ' + f(h * .7) + ' ' + f(b - 14) + ' ' + f(h * .45) + ' ' + f(b - 9) + ' ' + f(h * .3) + 'C' + f(b - 7) + ' ' + f(h * .55) + ' ' + f(b - 3) + ' ' + f(h * .78) + ' ' + f(b * 1.1) + ' ' + h + 'Z" fill="' + gl + '"/>' +
      '<use href="' + tulipSym(d, o.pal || 'pink') + '"/>', op(o));
  }

  /* ───────── الكوبية (هيدرانجيا) وأذن الفأر (لا تنسني) ───────── */
  const HY = { blue: ['#F3F8FF', '#CBE1FF', '#8FB7F7', '#5B87E0', '#3B62BF'], peri: ['#F6F4FF', '#DCD8FF', '#ABA8F6', '#807CE0', '#5D58BF'], sky: ['#F7FBFF', '#DAEFFF', '#A8D5FB', '#70B1EE', '#4A8ED8'], white: ['#FFFFFF', '#F7FAFF', '#E4EEFB', '#C8D8F0', '#A2B8DA'], pink: ['#FFF6FA', '#FFDCEB', '#FBB0CE', '#E985AE', '#C6628C'], lilac: ['#FAF6FF', '#E8DBFF', '#CBB2F5', '#A889E2', '#8165C4'] };
  function floretSym(d, pal, dark) {
    const c = HY[pal] || HY.blue;
    return d.sym('hf' + pal + (dark ? 'd' : ''), id => {
      const gp = d.def('hfg' + pal + (dark ? 'd' : ''), LG(0, 1, 0, 0, dark ? [[0, c[4]], [1, c[2]]] : [[0, c[3]], [.5, c[2]], [1, c[0]]]));
      let s = ''; for (let i = 0; i < 4; i++) s += '<path d="M0 0C2.5 -1.2 3.4 -5 0 -6.4C-3.4 -5 -2.5 -1.2 0 0Z" transform="rotate(' + (45 + i * 90) + ')" fill="' + gp + '"/>';
      return '<g id="' + id + '">' + s + '<circle r="1" fill="' + c[4] + '"/><circle cx="-.3" cy="-.3" r=".4" fill="#fff"/></g>';
    });
  }
  function hydrangea(d, o) {
    const R = o.r || 30, n = Math.max(15, Math.round(R * R / 34)), pal = o.pal || 'blue', c = HY[pal] || HY.blue, fs = [];
    for (let i = 0; i < n; i++) { const rr = R * Math.sqrt((i + .5) / n), a = i * 137.508 * RAD, x = rr * Math.cos(a), y = rr * Math.sin(a) * .86; fs.push([x, y, rr / R, i]); }
    fs.sort((a, b) => a[1] - b[1]);
    const sh = d.def('hysh' + pal, RG(.5, .5, .5, [[0, c[4], .55], [1, c[4], 0]]));
    let s = '<ellipse cy="' + f(R * .2) + '" rx="' + f(R * 1.08) + '" ry="' + f(R * .95) + '" fill="' + sh + '"/>';
    fs.forEach(([x, y, q, i]) => { const dark = y > R * .38 && q > .55; s += use(floretSym(d, pal, dark), x, y, R / 26 * (1.12 - .3 * q) * (.9 + (i % 3) * .08), (i * 47) % 90); });
    return g(o.x, o.y, 1, 0, s, op(o));
  }
  function fmnSym(d, pal) {
    const c = pal === 'pink' ? ['#FFF1F6', '#FFBCD4', '#F07FA8'] : pal === 'lilac' ? ['#F8F2FF', '#D6C2FF', '#9C7BE6'] : ['#EFF8FF', '#A2D2FF', '#5A9BEA'];
    return d.sym('fm' + (pal || 'b'), id => {
      const gp = d.def('fmg' + (pal || 'b'), RG(.5, .9, .95, [[0, c[0]], [.45, c[1]], [1, c[2]]]));
      let s = ''; for (let i = 0; i < 5; i++) { const p = P(2.5, i * 72 * RAD); s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="2.25" fill="' + gp + '"/>'; }
      return '<g id="' + id + '">' + s + '<circle r="1.25" fill="#FFFFFF"/><circle r=".6" fill="#FFCB45"/></g>';
    });
  }
  const fmn = (d, o) => use(fmnSym(d, o.pal), o.x, o.y, (o.r || 5) / 5, o.rot || 0, op(o));
  function fmnCluster(d, o) {
    const r = rng(o.seed || 5); let s = '';
    for (let i = 0; i < (o.n || 6); i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * (o.spread || 12); s += fmn(d, { x: rr * Math.cos(a), y: rr * Math.sin(a) * .7, r: (o.r || 4.2) * (.75 + r() * .45), rot: r() * 72, pal: o.pal }); }
    return g(o.x, o.y, 1, 0, s);
  }
  /* نَفَس الطفل: عناقيد بيضاء دقيقة على سيقان رفيعة */
  function babys(d, o) {
    const r = rng(o.seed || 9); let st = '', dots = '';
    for (let i = 0; i < (o.n || 5); i++) { const a = (-60 + r() * 120) * RAD, L = (o.h || 30) * (.6 + r() * .5), e = P(L, a), m = P(L * .5, a * .6);
      st += 'M0 0Q' + pt(m) + ' ' + pt(e);
      for (let j = 0; j < 6; j++) { const q = [e[0] + (r() - .5) * 9, e[1] + (r() - .5) * 7]; st += 'M' + pt(e) + 'L' + pt(q); dots += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="' + f(1.1 + r() * .9) + '"/>'; } }
    const gw = d.def('bbw', RG(.4, .35, .7, [[0, '#FFFFFF'], [1, '#E3EAF5']]));
    return g(o.x, o.y, o.s || 1, o.r || 0, '<path d="' + st + '" fill="none" stroke="#7FB28A" stroke-width=".7" opacity=".85"/><g fill="' + gw + '">' + dots + '</g>', op(o));
  }
  /* سنبلة خزامى */
  function lavsprig(d, o) {
    const h = o.h || 44, r = rng(o.seed || 3); let s = '<path d="M0 0Q' + f((o.bend || 0) * .5) + ' ' + f(-h * .5) + ' ' + f(o.bend || 0) + ' ' + f(-h) + '" fill="none" stroke="#6E9A62" stroke-width="1.4"/>';
    for (let i = 0; i < 9; i++) { const t = .45 + i * .065, x = (o.bend || 0) * t * t, y = -h * t; [-1, 1].forEach(sd => { s += '<ellipse cx="' + f(x + sd * 2) + '" cy="' + f(y) + '" rx="1.9" ry="3" transform="rotate(' + (sd * 28) + ' ' + f(x + sd * 2) + ' ' + f(y) + ')" fill="' + (i % 2 ? '#9B7FE0' : '#B39AF0') + '"/>'; }); }
    return g(o.x, o.y, o.s || 1, o.r || 0, s, op(o));
  }

  /* ───────── النجوم والهلال والسحاب ───────── */
  const SPK = 'M0 -10Q1.2 -1.2 10 0Q1.2 1.2 0 10Q-1.2 1.2 -10 0Q-1.2 -1.2 0 -10Z';
  function sparkle(d, o) {
    const c = o.c || '#FFFFFF', gg = d.def('spg' + c.slice(1), RG(.5, .5, .5, [[0, c, .85], [.35, c, .25], [1, c, 0]]));
    return g(o.x, o.y, (o.s || 6) / 10, o.r || 0, (o.glow !== false ? '<circle r="10" fill="' + gg + '"/>' : '') + '<path d="' + SPK + '" fill="' + c + '"/>', op(o));
  }
  const STAR5 = (() => { let s = ''; for (let i = 0; i < 10; i++) s += (i ? 'L' : 'M') + pt(P(i % 2 ? 4.4 : 10, i * 36 * RAD)); return s + 'Z'; })();
  const STP = { gold: ['#FFF7CC', '#FFDB5E', '#F5B41E', '#D18A08'], silver: ['#FFFFFF', '#EEF2FF', '#C9D2F2', '#9AA6D6'], pink: ['#FFF0F6', '#FFB8D2', '#F27BA8', '#C9507F'], blue: ['#F1F8FF', '#B8DCFF', '#6FB0F5', '#3F7FD6'] };
  function starSym(d, pal) {
    const c = STP[pal] || STP.gold;
    return d.sym('st' + pal, id => {
      const gs = d.def('stg' + pal, LG(.2, 0, .5, 1, [[0, c[0]], [.42, c[1]], [1, c[2]]]));
      return '<g id="' + id + '"><path d="' + STAR5 + '" fill="' + gs + '" stroke="' + c[3] + '" stroke-width="1.5" stroke-linejoin="round"/><path d="' + STAR5 + '" transform="translate(-.6 -.8) scale(.62)" fill="#FFFFFF" opacity=".22"/>' +
        '<ellipse cx="-2.6" cy="-3.9" rx="2" ry="1.05" transform="rotate(-34 -2.6 -3.9)" fill="#FFFFFF" opacity=".75"/></g>';
    });
  }
  function star(d, o) {
    const gg = o.glow ? d.def('stglow' + (o.pal || 'gold'), RG(.5, .5, .5, [[0, (STP[o.pal || 'gold'] || STP.gold)[1], .55], [1, (STP[o.pal || 'gold'] || STP.gold)[1], 0]])) : '';
    return g(o.x, o.y, (o.s || 10) / 10, o.r || 0, (o.glow ? '<circle r="22" fill="' + gg + '"/>' : '') + '<use href="' + starSym(d, o.pal || 'gold') + '"/>', op(o));
  }
  const CRES = (() => { const R = 10, dd = 4.5, r2 = 8.5, x = (dd * dd + R * R - r2 * r2) / (2 * dd), y = Math.sqrt(R * R - x * x);
    return 'M' + f(x) + ' ' + f(-y) + 'A' + R + ' ' + R + ' 0 1 0 ' + f(x) + ' ' + f(y) + 'A' + r2 + ' ' + r2 + ' 0 1 1 ' + f(x) + ' ' + f(-y) + 'Z'; })();
  function crescent(d, o) {
    const gm = d.def('crg', LG(0, 0, 1, 1, [[0, '#FFF8D6'], [.45, '#FFDF7A'], [1, '#F0A92A']])), gw = d.def('crw', RG(.5, .5, .5, [[0, '#FFE9A8', .5], [.5, '#FFE9A8', .12], [1, '#FFE9A8', 0]]));
    return g(o.x, o.y, (o.r || 20) / 10, o.rot || 0, (o.glow !== false ? '<circle cx="-2" r="26" fill="' + gw + '"/>' : '') + '<path d="' + CRES + '" fill="' + gm + '"/><path d="' + CRES + '" fill="none" stroke="#FFF6D0" stroke-width=".5" opacity=".7"/>' +
      '<circle cx="-6.2" cy="-1.5" r="1.2" fill="#E8A83A" opacity=".35"/><circle cx="-4.4" cy="4.2" r=".8" fill="#E8A83A" opacity=".3"/><circle cx="-7.2" cy="3" r=".6" fill="#E8A83A" opacity=".3"/>', op(o));
  }
  const CLOUDC = [[20, -12, 14], [40, -24, 20], [62, -22, 17], [80, -12, 13]];
  function cloud(d, o) {
    const k = o.k || 'w', gc = d.def('clg' + k, LG(0, -46, 0, 2, [[0, o.c[0]], [1, o.c[1]]], true));
    const body = CLOUDC.map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>').join('') + '<rect x="6" y="-15" width="88" height="15" rx="7.5"/>';
    return g(o.x, o.y, o.s || 1, 0, '<g fill="' + gc + '">' + body + '</g>' + (o.hi ? '<path d="M24 -24A14 14 0 0 1 40 -40A20 20 0 0 1 64 -36" fill="none" stroke="' + o.hi + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>' : ''), op(o));
  }
  function bokeh(d, o) {
    const c = o.c || '#FFFFFF', gb = d.def('bk' + c.slice(1), RG(.5, .5, .5, [[0, c, .75], [.55, c, .32], [1, c, 0]])), r = rng(o.seed || 21);
    let s = ''; for (let i = 0; i < (o.n || 10); i++) s += '<circle cx="' + f(o.x0 + r() * (o.x1 - o.x0)) + '" cy="' + f(o.y0 + r() * (o.y1 - o.y0)) + '" r="' + f(o.r0 + r() * (o.r1 - o.r0)) + '"/>';
    return '<g fill="' + gb + '"' + op(o) + '>' + s + '</g>';
  }
  const HEARTd = 'M0 9C-1 8 -10 2 -10 -3.5C-10 -7.5 -7 -10 -4 -10C-2 -10 -.6 -8.8 0 -7.6C.6 -8.8 2 -10 4 -10C7 -10 10 -7.5 10 -3.5C10 2 1 8 0 9Z';
  function heart(d, o) {
    const pal = o.pal || 'pink', c = pal === 'red' ? ['#FFC0C8', '#FF5E78', '#D81E46'] : ['#FFE0EA', '#FF8FB0', '#EA4C7E'];
    const gh = d.def('ht' + pal, RG(.36, .3, .85, [[0, c[0]], [.42, c[1]], [1, c[2]]]));
    return g(o.x, o.y, (o.s || 10) / 10, o.r || 0, '<path d="' + HEARTd + '" fill="' + gh + '"/><ellipse cx="-4.6" cy="-5" rx="2.4" ry="1.4" transform="rotate(-35 -4.6 -5)" fill="#fff" opacity=".7"/>', op(o));
  }
  function rays(d, o) {
    const gr = d.def('ray', LG(1, 0, 0, 1, [[0, '#FFFFFF', .7], [1, '#FFFFFF', 0]])); let s = '';
    (o.a || [[18, 30], [34, 44], [52, 60], [70, 78]]).forEach(([a0, a1]) => { const L = o.L || 560, p1 = [o.x - L * Math.cos(a0 * RAD), o.y + L * Math.sin(a0 * RAD)], p2 = [o.x - L * Math.cos(a1 * RAD), o.y + L * Math.sin(a1 * RAD)];
      s += '<path d="M' + pt([o.x, o.y]) + 'L' + pt(p1) + 'L' + pt(p2) + 'Z" fill="' + gr + '"/>'; });
    return '<g' + op(o) + '>' + s + '</g>';
  }
  function grass(d, o) {
    const r = rng(o.seed || 17), c = o.c || ['#7CC77F', '#4E9E5B', '#3A8448'], gg = d.def('gr' + c[1].slice(1), LG(0, 1, 0, 0, [[0, c[2]], [1, c[0]]]));
    let s = ''; for (let i = 0; i < (o.n || 40); i++) { const x = o.x0 + r() * (o.x1 - o.x0), h = o.h0 + r() * (o.h1 - o.h0), b = (r() - .5) * h * .5, y = o.y + r() * (o.dy || 6);
      s += '<path d="M' + f(x - 1.3) + ' ' + f(y) + 'Q' + f(x + b * .4) + ' ' + f(y - h * .6) + ' ' + f(x + b) + ' ' + f(y - h) + 'Q' + f(x + b * .3) + ' ' + f(y - h * .5) + ' ' + f(x + 1.3) + ' ' + f(y) + 'Z"/>'; }
    return '<g fill="' + gg + '"' + op(o) + '>' + s + '</g>';
  }
  const hill = (d, key, dPath, c) => '<path d="' + dPath + '" fill="' + d.def('hl' + key, LG(0, 0, 0, 1, [[0, c[0]], [1, c[1]]])) + '"/>';

  /* غصن متدرّج السماكة على منحنى بيزييه */
  function branch(d, pts, w0, w1, key) {
    const n = 26, L = [], Rr = [];
    for (let i = 0; i <= n; i++) { const t = i / n, p = bz(pts[0], pts[1], pts[2], pts[3], t), q = bz(pts[0], pts[1], pts[2], pts[3], Math.min(1, t + .01)), p0 = bz(pts[0], pts[1], pts[2], pts[3], Math.max(0, t - .01));
      const dx = q[0] - p0[0], dy = q[1] - p0[1], Ln = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t) / 2; L.push([p[0] - dy / Ln * w, p[1] + dx / Ln * w]); Rr.push([p[0] + dy / Ln * w, p[1] - dx / Ln * w]); }
    const gb = d.def('br' + (key || ''), LG(0, 0, 0, 1, key === 'l' ? [[0, '#A9785E'], [1, '#6E4634']] : [[0, '#94644C'], [1, '#5E3A2A']]));
    return '<path d="M' + L.map(pt).join('L') + 'L' + Rr.reverse().map(pt).join('L') + 'Z" fill="' + gb + '"/>';
  }
  const HERO = {
    /* ── الفراشات الزرقاء: حديقة كوبية زرقاء وفراشات مورفو وأشعة ضوء ── */
    kbfly(d, gr) {
      const on = t => gr >= t; let s = '';
      s += rays(d, { x: 404, y: -24, L: 600, a: [[19, 26], [31, 39], [45, 53], [60, 67]], op: .3 });
      s += bokeh(d, { x0: 0, x1: 390, y0: 16, y1: 330, r0: 5, r1: 19, n: 15, c: '#FFFFFF', seed: 31, op: .55 });
      s += hill(d, 'b1', 'M0 346C60 326 124 334 186 346C252 360 320 326 390 334L390 492L0 492Z', ['#DDEBFF', '#C4DAF7']);
      s += hill(d, 'b2', 'M0 376C70 358 140 364 210 376C280 388 332 364 390 368L390 492L0 492Z', ['#CFEFE2', '#ACDDC8']);
      [[40, 404, 44, -60], [98, 414, 40, 52], [236, 420, 42, -52], [292, 418, 40, 58], [340, 398, 40, -42], [392, 406, 42, 40], [150, 438, 36, -30], [196, 442, 34, 40], [14, 430, 36, 30]].forEach(([x, y, l, r], i) => { s += leaf(d, { x, y, l, r, pal: i % 2 ? 'deep' : 'green', w: 1.25 }); });
      [[140, 372, 38, 7, 0], [334, 356, 36, 11, .5], [232, 386, 30, 13, .62], [18, 364, 30, 17, .78]].forEach(([x, y, h, sd, t]) => { if (on(t)) s += babys(d, { x, y, h, n: 6, seed: sd }); });
      [[62, 408, 44, 'blue', 0], [266, 416, 40, 'peri', 0], [362, 396, 36, 'sky', .5], [172, 434, 30, 'blue', .6], [-6, 444, 32, 'sky', .8], [216, 458, 26, 'peri', .9]].forEach(([x, y, r, pal, t]) => { if (on(t)) s += hydrangea(d, { x, y, r, pal }); });
      [[124, 394, 7, 0], [208, 400, 6, .6], [316, 380, 7, 0], [24, 386, 6, .7], [240, 448, 6, .8], [112, 448, 6, .9]].forEach(([x, y, n, t], i) => { if (on(t)) s += fmnCluster(d, { x, y, n, spread: 13, r: 4.4, seed: 40 + i }); });
      [[98, 382, 9, 0], [300, 400, 8, .7], [190, 406, 7.5, .6], [352, 432, 8, .85]].forEach(([x, y, r, t], i) => { if (on(t)) s += daisy(d, { x, y, r, rot: i * 13 }); });
      s += grass(d, { x0: -4, x1: 394, y: 472, h0: 12, h1: 30, n: 70, seed: 7, c: ['#A6E2B8', '#5BB27E', '#3A8A5C'] });
      s += bfly(d, { x: 46, y: 234, s: .36, r: -18, pal: 'morpho' });
      s += bfly(d, { x: 348, y: 242, s: .29, r: 17, pal: 'sky' });
      s += bfly(d, { x: 112, y: 52, s: .17, r: 14, pal: 'ice' });
      s += bfly(d, { x: 272, y: 382, s: .21, r: -8, pal: 'royal' });
      if (on(.7)) s += bfly(d, { x: 118, y: 358, s: .15, r: 22, pal: 'sky' });
      [[82, 162, 5], [316, 128, 4], [300, 304, 4.5], [64, 308, 3.6], [182, 328, 4], [356, 192, 3]].forEach(([x, y, z]) => { s += sparkle(d, { x, y, s: z }); });
      return s;
    },
    /* ── الورد: إكليل ورد في الزاوية، وعنقود جانبي، وسياج ورد متفتّح ── */
    krose(d, gr) {
      const on = t => gr >= t; let s = '';
      s += bokeh(d, { x0: 0, x1: 390, y0: 16, y1: 330, r0: 5, r1: 18, n: 14, c: '#FFFFFF', seed: 12, op: .6 });
      s += bokeh(d, { x0: 0, x1: 390, y0: 40, y1: 300, r0: 4, r1: 12, n: 9, c: '#FF9EBB', seed: 19, op: .3 });
      s += hill(d, 'r1', 'M0 352C80 332 150 342 210 352C280 364 340 336 390 342L390 492L0 492Z', ['#FCDDE6', '#F7C8D6']);
      s += hill(d, 'r2', 'M0 386C90 370 170 380 240 388C300 394 350 378 390 382L390 492L0 492Z', ['#D5EDD7', '#B2DDB9']);
      s += '<path d="M156 4C124 12 98 20 74 30C50 42 30 60 20 84C12 104 10 128 4 158" fill="none" stroke="#4E9A5E" stroke-width="2" stroke-linecap="round"/>';
      [[142, 8, 20, 118], [118, 16, 22, 58], [98, 22, 22, 152], [66, 34, 24, 38], [50, 48, 24, 144], [34, 64, 24, 12], [20, 92, 24, 122], [14, 116, 22, -12], [10, 140, 20, 102]].forEach(([x, y, l, r], i) => { s += leaf(d, { x, y, l, r, pal: i % 2 ? 'deep' : 'green' }); });
      s += rose(d, { x: 124, y: 14, r: 9, pal: 'blush', rot: 20 }) + rose3(d, { x: 88, y: 26, r: 15, pal: 'pink', rot: 10 }) + rose(d, { x: 16, y: 126, r: 12, pal: 'pink', rot: 40 }) + rose3(d, { x: 30, y: 80, r: 20, pal: 'red', rot: -8 });
      s += rosebud(d, { x: 150, y: 12, s: .45, pal: 'pink', r: 76 }) + rosebud(d, { x: 8, y: 150, s: .42, pal: 'red', r: 196 });
      [[372, 206, 30, -110, 'green'], [360, 274, 26, -150, 'deep'], [388, 248, 28, -80, 'deep']].forEach(([x, y, l, r, pal]) => { s += leaf(d, { x, y, l, r, pal }); });
      s += rose(d, { x: 356, y: 258, r: 13, pal: 'blush', rot: 40 }) + rose(d, { x: 388, y: 276, r: 11, pal: 'pink' }) + rose3(d, { x: 378, y: 222, r: 22, pal: 'red', rot: -12 });
      const lv = rng(55); for (let i = 0; i < 17; i++) s += leaf(d, { x: 6 + i * 24 + (lv() - .5) * 10, y: 390 + lv() * 38, l: 30 + lv() * 14, r: -80 + lv() * 160, pal: i % 3 ? 'green' : 'deep' });
      [[62, 348, .6, 'red', -14, .55], [236, 346, .55, 'pink', 10, .75], [318, 342, .5, 'red', -6, .9]].forEach(([x, y, sc, pal, rr, t]) => { if (on(t)) s += rosebud(d, { x, y, s: sc, pal, r: rr }); });
      [[40, 368, 16, 'blush', 0], [120, 362, 14, 'pink', 0], [198, 372, 15, 'white', .6], [282, 360, 14, 'pink', .7], [352, 368, 16, 'blush', .5]].forEach(([x, y, r, pal, t]) => { if (on(t)) s += rose(d, { x, y, r, pal, rot: x }); });
      [[10, 414, 30, 'red', 1], [82, 406, 26, 'pink', 0], [150, 416, 28, 'red', 1], [222, 408, 26, 'blush', 0], [292, 414, 29, 'wine', 1], [364, 404, 27, 'pink', 0], [116, 450, 22, 'white', 0], [258, 452, 22, 'pink', 1]]
        .forEach(([x, y, r, pal, k]) => { s += k ? rose3(d, { x, y, r, pal }) : rose(d, { x, y, r, pal, rot: x * 3 }); });
      s += heart(d, { x: 86, y: 200, s: 7, r: -14, op: .9 }) + heart(d, { x: 318, y: 152, s: 6, r: 12, op: .85 }) + heart(d, { x: 58, y: 302, s: 5, r: 8, op: .8 });
      [[180, 322, 4], [302, 306, 4], [122, 262, 3], [252, 58, 3.5]].forEach(([x, y, z]) => { s += sparkle(d, { x, y, s: z }); });
      return s;
    },
    /* ── النجمة: ليل حالم، هلال ذهبي، درب التبّانة، كوكبة، وبحر من السحاب ── */
    kstar(d, gr) {
      const on = t => gr >= t, r = rng(77); let s = '';
      const neb = (x, y, rr, c, o) => '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + d.def('nb' + c.slice(1), RG(.5, .5, .5, [[0, c, o], [1, c, 0]])) + '"/>';
      s += neb(70, 120, 150, '#8A6CFF', .3) + neb(340, 210, 130, '#FF78C8', .17) + neb(210, 380, 170, '#4FA0FF', .2);
      s += '<ellipse cx="210" cy="200" rx="270" ry="46" transform="rotate(-28 210 200)" fill="' + d.def('mw', RG(.5, .5, .5, [[0, '#FFFFFF', .11], [1, '#FFFFFF', 0]])) + '"/>';
      let dots = ''; for (let i = 0; i < 120; i++) { const t = r(), x = t * 430 - 20, y = 340 - t * 260 + (r() - .5) * 96 * (1 - Math.abs(t - .5)); dots += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(.4 + r() * 1.1) + '" opacity="' + f2(.3 + r() * .6) + '"/>'; }
      for (let i = 0; i < 60; i++) dots += '<circle cx="' + f(r() * 390) + '" cy="' + f(r() * 370) + '" r="' + f(.4 + r() * .9) + '" opacity="' + f2(.25 + r() * .6) + '"/>';
      s += '<g fill="#FFFFFF">' + dots + '</g>';
      s += crescent(d, { x: 60, y: 112, r: 27, rot: -28 });
      const K = [[320, 206], [344, 218], [368, 208], [362, 240], [382, 264], [340, 258]];
      s += '<path d="M' + K.map(pt).join('L') + 'M362 240L340 258" fill="none" stroke="#DCE3FF" stroke-width=".8" opacity=".45"/>';
      K.forEach(([x, y], i) => { s += sparkle(d, { x, y, s: i % 2 ? 3.4 : 4.6 }); });
      [[30, 300, 7, -12], [364, 318, 8, 10], [150, 324, 5, 0], [254, 304, 6, 18], [96, 190, 5, 8]].forEach(([x, y, z, rr]) => { s += star(d, { x, y, s: z, r: rr, glow: true }); });
      [[302, 112, 4.2], [212, 322, 4], [22, 214, 3.6], [142, 64, 3.2], [206, 40, 3]].forEach(([x, y, z]) => { s += sparkle(d, { x, y, s: z }); });
      [[-44, 406, 1.7], [76, 412, 1.4], [194, 398, 1.8], [308, 406, 1.6]].forEach(([x, y, sc]) => { s += cloud(d, { x, y, s: sc, c: ['#4C4AAE', '#2C2A78'], k: 'n1' }); });
      [[70, 394, 9, -8, 0], [300, 402, 10, 12, 0], [190, 384, 7, 0, .6]].forEach(([x, y, z, rr, t]) => { if (on(t)) s += star(d, { x, y, s: z, r: rr, glow: true }); });
      [[-24, 440, 1.5], [96, 448, 1.3], [206, 436, 1.6], [318, 444, 1.5]].forEach(([x, y, sc]) => { s += cloud(d, { x, y, s: sc, c: ['#7D6BDA', '#5444A8'], k: 'n2', hi: '#A99AF4' }); });
      [[140, 430, 7, 20, .7], [358, 426, 6, -10, .8]].forEach(([x, y, z, rr, t]) => { if (on(t)) s += star(d, { x, y, s: z, r: rr, glow: true, pal: 'silver' }); });
      [[-34, 474, 1.6], [86, 482, 1.5], [196, 470, 1.7], [314, 478, 1.6]].forEach(([x, y, sc]) => { s += cloud(d, { x, y, s: sc, c: ['#BFB0F8', '#9280E4'], k: 'n3', hi: '#E8E0FF' }); });
      return s;
    },
    /* ── الفراولة: نقاط بيضاء ناعمة، عريشة فراولة، ومشتل فراولة ناضجة ── */
    kberry(d, gr) {
      const on = t => gr >= t; let s = '';
      const pd = d.def('pd', id => '<pattern id="' + id + '" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6.5" cy="6.5" r="2.6" fill="#FFFFFF"/><circle cx="19.5" cy="19.5" r="2.6" fill="#FFFFFF"/></pattern>');
      const mg = d.def('pdmg', LG(0, 0, 0, 1, [[0, '#FFFFFF', .95], [.55, '#FFFFFF', .3], [.74, '#FFFFFF', 0]]));
      const mk = d.def('pdm', id => '<mask id="' + id + '"><rect width="390" height="492" fill="' + mg + '"/></mask>');
      s += '<rect width="390" height="492" fill="' + pd + '" mask="' + mk + '" opacity=".6"/>';
      s += bokeh(d, { x0: 0, x1: 390, y0: 30, y1: 320, r0: 4, r1: 14, n: 10, c: '#FFFFFF', seed: 44, op: .5 });
      s += hill(d, 'k1', 'M0 356C70 336 140 346 200 356C270 368 330 340 390 346L390 492L0 492Z', ['#FFE3EA', '#FFD2DC']);
      s += hill(d, 'k2', 'M0 388C80 372 160 382 230 390C300 398 350 380 390 384L390 492L0 492Z', ['#D6EECB', '#B0DDA4']);
      s += '<path d="M-6 160C8 120 4 80 22 58C42 34 88 24 160 12" fill="none" stroke="#5DA84E" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M40 42C46 32 57 34 55 42C53 48 45 46 48 40M122 22C128 12 139 14 137 22C135 28 127 26 130 20M10 118C2 112 4 102 12 104C17 106 15 113 10 111" fill="none" stroke="#6CB85C" stroke-width="1.2" stroke-linecap="round"/>';
      s += '<path d="M72 44L72 58M106 30L106 42M24 122L24 136" stroke="#4E9A45" stroke-width="1.6" stroke-linecap="round"/>';
      [[32, 72, .62, -40], [92, 32, .56, 70], [144, 18, .46, 96], [6, 126, .52, -80]].forEach(([x, y, sc, rr], i) => { s += trileaf(d, { x, y, s: sc, r: rr, pal: i % 2 ? 'light' : '' }); });
      s += berry(d, { x: 72, y: 74, s: .38, r: 6 }) + berry(d, { x: 106, y: 52, s: .3, r: -6 }) + berry(d, { x: 24, y: 150, s: .34, r: 10 });
      s += blossom(d, { x: 58, y: 40, s: .8, r: 10 }) + blossom(d, { x: 120, y: 20, s: .6, r: 30 }) + blossom(d, { x: 14, y: 98, s: .7 });
      s += '<path d="M398 170C382 196 386 222 374 246" fill="none" stroke="#5DA84E" stroke-width="2.6" stroke-linecap="round"/>' + trileaf(d, { x: 382, y: 198, s: .5, r: -150 }) +
        berry(d, { x: 364, y: 262, s: .42, r: -8 }) + berry(d, { x: 390, y: 292, s: .3, r: 4 }) + blossom(d, { x: 352, y: 216, s: .7, r: 20 });
      const lr = rng(88); for (let i = 0; i < 13; i++) s += trileaf(d, { x: 6 + i * 31 + (lr() - .5) * 12, y: 424 + lr() * 30, s: .9 + lr() * .35, r: -60 + lr() * 120, pal: i % 2 ? 'light' : '' });
      [[80, 386, .9, 0], [240, 382, .8, 0], [330, 378, .7, .6], [12, 386, .7, .75], [170, 396, .6, .85]].forEach(([x, y, sc, t], i) => { if (on(t)) s += blossom(d, { x, y, s: sc, r: i * 17 }); });
      [[40, 412, .72, -14, 0], [118, 426, .6, 10, 0], [196, 406, .8, -4, 0], [276, 422, .64, 12, 0], [350, 408, .74, -10, 0], [160, 458, .5, 20, .7], [318, 460, .52, -16, .8]].forEach(([x, y, sc, rr, t]) => { if (on(t)) s += berry(d, { x, y, s: sc, r: rr }); });
      s += heart(d, { x: 88, y: 206, s: 7, r: -14, pal: 'red', op: .9 }) + heart(d, { x: 316, y: 154, s: 6, r: 12, op: .85 }) + heart(d, { x: 60, y: 302, s: 5, r: 8, pal: 'red', op: .8 });
      [[182, 324, 4], [300, 306, 4], [124, 262, 3], [250, 60, 3.5]].forEach(([x, y, z]) => { s += sparkle(d, { x, y, s: z }); });
      return s;
    },
    /* ── الأزهار: غصن كرز مزهر، ومرج ربيعي من التوليب والأقحوان ── */
    kbloom(d, gr) {
      const on = t => gr >= t; let s = '';
      s += bokeh(d, { x0: 0, x1: 390, y0: 16, y1: 330, r0: 5, r1: 18, n: 14, c: '#FFFFFF', seed: 63, op: .55 });
      s += bokeh(d, { x0: 0, x1: 390, y0: 40, y1: 300, r0: 4, r1: 12, n: 8, c: '#FFC2A6', seed: 67, op: .28 });
      s += hill(d, 'm1', 'M0 344C66 324 130 332 190 344C256 358 324 326 390 332L390 492L0 492Z', ['#FFE9DC', '#FFDCCB']);
      s += hill(d, 'm2', 'M0 370C74 354 146 362 214 372C284 382 334 360 390 364L390 492L0 492Z', ['#FFE4EE', '#FBD2E1']);
      s += hill(d, 'm3', 'M0 398C84 384 168 392 240 400C304 406 352 390 390 394L390 492L0 492Z', ['#D8F2DE', '#B6E4C4']);
      s += branch(d, [[-14, 66], [30, 32], [90, 26], [174, 14]], 10, 2.4) + branch(d, [[56, 38], [70, 46], [84, 58], [98, 76]], 4, 1.4, 'l') + branch(d, [[110, 26], [122, 32], [134, 40], [148, 54]], 3.4, 1.2, 'l') + branch(d, [[18, 52], [22, 66], [26, 84], [34, 106]], 4.4, 1.4, 'l');
      [[40, 44, 12, -20], [128, 40, 12, 40], [96, 84, 11, 150]].forEach(([x, y, l, rr]) => { s += leaf(d, { x, y, l, r: rr, pal: 'mint' }); });
      [[22, 52, 11, 'pink'], [48, 40, 9, 'white'], [74, 34, 12, 'pink'], [100, 28, 10, 'deep'], [130, 22, 8, 'white'], [156, 16, 7, 'pink'], [94, 66, 9, 'white'], [98, 80, 7, 'pink'], [140, 48, 7, 'pink'], [30, 96, 8, 'white'], [34, 108, 6, 'deep']].forEach(([x, y, rr, pal], i) => { s += sakura(d, { x, y, r: rr, pal, rot: i * 23 }); });
      [[62, 30, 3.6], [116, 22, 3.2], [168, 12, 3], [84, 50, 3], [26, 76, 3.4]].forEach(([x, y, rr], i) => { s += sbud(d, { x, y, r: rr, rot: -30 + i * 20 }); });
      s += branch(d, [[404, 256], [382, 244], [360, 232], [330, 216]], 5, 1.4, 'l');
      [[350, 222, 10, 'pink'], [372, 238, 12, 'white'], [338, 244, 7, 'deep'], [392, 250, 8, 'pink']].forEach(([x, y, rr, pal], i) => { s += sakura(d, { x, y, r: rr, pal, rot: i * 31 }); });
      [[20, 382, 7], [132, 378, 7], [268, 382, 7], [374, 378, 7]].forEach(([x, y, rr], i) => { s += daisy(d, { x, y, r: rr, rot: i * 17, pal: i % 2 ? 'white' : 'lemon' }); });
      [[90, 376, 'lilac'], [190, 372, 'pink'], [300, 374, 'lilac']].forEach(([x, y, pal], i) => { s += fmnCluster(d, { x, y, n: 6, spread: 12, r: 4, pal, seed: 80 + i }); });
      [[54, 382, 'peach', 30, 2], [196, 384, 'pink', 28, -2], [338, 380, 'peach', 30, 3]].forEach(([x, y, pal, h, b]) => { s += tulip(d, { x, y, pal, h, bend: b, s: .85 }); });
      [[210, 402, 42, 4, 0], [224, 406, 38, -5, .6]].forEach(([x, y, h, b, t], i) => { if (on(t)) s += lavsprig(d, { x, y, h, bend: b, seed: 5 + i }); });
      [[34, 392, 'pink', 46, 3, 0], [74, 404, 'yellow', 40, -2, 0], [114, 388, 'lilac', 50, 4, 0], [154, 408, 'peach', 38, -3, .6], [244, 396, 'red', 44, 2, 0], [280, 410, 'pink', 38, -4, .7], [320, 390, 'yellow', 48, 3, 0], [360, 402, 'lilac', 42, -2, .5]]
        .forEach(([x, y, pal, h, b, t]) => { if (on(t)) s += tulip(d, { x, y, pal, h, bend: b, s: 1.15 }); });
      [[56, 432, 'pink'], [250, 442, 'lilac'], [342, 426, 'pink']].forEach(([x, y, pal], i) => { s += fmnCluster(d, { x, y, n: 7, spread: 14, r: 4.6, pal, seed: 70 + i }); });
      [[94, 428, 11], [198, 422, 12], [302, 434, 10], [10, 434, 9], [382, 438, 10], [142, 446, 9]].forEach(([x, y, rr], i) => { s += daisy(d, { x, y, r: rr, rot: i * 11, pal: i === 1 ? 'pink' : i === 4 ? 'lemon' : 'white' }); });
      s += grass(d, { x0: -4, x1: 394, y: 474, h0: 10, h1: 26, n: 64, seed: 9, c: ['#B4E8C0', '#66BC84', '#3F9160'] });
      s += bfly(d, { x: 320, y: 252, s: .16, r: 14, pal: 'pink' }) + bfly(d, { x: 64, y: 254, s: .15, r: -12, pal: 'lemon' });
      [[82, 164, 4.4], [316, 130, 4], [300, 304, 4.2], [64, 310, 3.4], [182, 328, 4]].forEach(([x, y, z]) => { s += sparkle(d, { x, y, s: z }); });
      return s;
    },
  };

  /* ───────── رمز كل ثيم (للعناوين والمؤشّر والحبّة الكبرى) ───────── */
  const ICON = {
    kbfly: [d => bfly(d, { x: 0, y: 0, s: 1, pal: 'morpho' }), '-108 -82 216 162'],
    krose: [d => rose3(d, { x: 0, y: 0, r: 48, pal: 'red' }), '-50 -58 100 104'],
    kstar: [d => star(d, { x: 0, y: .6, s: 10 }), '-11.6 -11 23.2 23.2'],
    kberry: [d => berry(d, { x: 0, y: 0, s: 1 }), '-40 -50 80 90'],
    kbloom: [d => sakura(d, { x: 0, y: 0, r: 10, pal: 'pink' }), '-11 -11 22 22'],
  };
  function icon(th) { const I = ICON[th]; if (!I) return ''; const d = doc('i'); const b = I[0](d); return d.svg(I[1], b); }
  /* مؤشّر الشمس على قوس اليوم: فراشة ترفرف، وردة، نجمة، فراولة، زهرة */
  function marker(th) {
    const d = doc('m'); let b = '';
    const glow = c => '<circle r="19" fill="' + d.def('mkg', RG(.5, .5, .5, [[0, c, .75], [.45, c, .28], [1, c, 0]])) + '"/>';
    if (th === 'kbfly') b = glow('#FFFFFF') + bfly(d, { x: 0, y: 0, s: .15, r: -10, pal: 'morpho', flap: true });
    else if (th === 'krose') b = glow('#FFF1F4') + rose3(d, { x: 0, y: 1, r: 12, pal: 'red' });
    else if (th === 'kstar') b = glow('#FFE38A') + star(d, { x: 0, y: 0, s: 10 });
    else if (th === 'kberry') b = glow('#FFFFFF') + berry(d, { x: 0, y: 1.5, s: .3, r: -8 });
    else if (th === 'kbloom') b = glow('#FFFFFF') + '<g class="spin">' + sakura(d, { x: 0, y: 0, r: 11, pal: 'deep' }) + '</g>';
    return '<defs>' + d.defs() + '</defs>' + b;
  }
  /* زينة زاوية البطاقات */
  const CORNER = {
    kbfly: d => bfly(d, { x: 44, y: 32, s: .25, r: -14, pal: 'morpho' }) + sparkle(d, { x: 76, y: 10, s: 4.4, c: '#8FC4FF' }) + sparkle(d, { x: 10, y: 54, s: 3.2, c: '#8FC4FF' }),
    krose: d => leaf(d, { x: 20, y: 44, l: 26, r: -66 }) + leaf(d, { x: 64, y: 48, l: 22, r: 72, pal: 'deep' }) + rosebud(d, { x: 70, y: 18, s: .34, pal: 'pink', r: 30 }) + rose(d, { x: 60, y: 38, r: 10, pal: 'blush' }) + rose3(d, { x: 36, y: 32, r: 17, pal: 'red' }),
    kstar: d => star(d, { x: 32, y: 32, s: 13, r: -10, glow: true }) + star(d, { x: 62, y: 18, s: 7, r: 14, pal: 'silver' }) + sparkle(d, { x: 66, y: 48, s: 4.4, c: '#FFE9A8' }) + sparkle(d, { x: 10, y: 12, s: 3.2, c: '#FFE9A8' }),
    kberry: d => trileaf(d, { x: 26, y: 46, s: .5, r: -34 }) + trileaf(d, { x: 58, y: 50, s: .42, r: 40, pal: 'light' }) + blossom(d, { x: 68, y: 18, s: .52, r: 20 }) + berry(d, { x: 56, y: 40, s: .28, r: 14 }) + berry(d, { x: 32, y: 34, s: .36, r: -12 }),
    kbloom: d => leaf(d, { x: 18, y: 42, l: 16, r: -64, pal: 'mint' }) + leaf(d, { x: 60, y: 50, l: 14, r: 70, pal: 'mint' }) + sbud(d, { x: 66, y: 18, r: 3.6, rot: 20 }) + sakura(d, { x: 58, y: 40, r: 8.5, pal: 'white', rot: 20 }) + sakura(d, { x: 32, y: 30, r: 12, pal: 'pink' }) + sakura(d, { x: 12, y: 56, r: 5.5, pal: 'deep' }),
  };
  function corner(th) { const fn = CORNER[th]; if (!fn) return ''; const d = doc('c'); const b = fn(d); return d.svg('0 0 84 64', b); }
  /* نقشة خلفية الصفحات: رموز باهتة متباعدة */
  const PATTERN = {
    kbfly: d => '<g opacity=".17">' + bfly(d, { x: 26, y: 30, s: .12, r: -20, pal: 'sky' }) + bfly(d, { x: 92, y: 96, s: .09, r: 18, pal: 'ice' }) + '</g><g fill="#4F8FE8" opacity=".16"><circle cx="86" cy="28" r="1.6"/><circle cx="32" cy="92" r="1.3"/><circle cx="60" cy="62" r="1"/></g>',
    krose: d => '<g opacity=".2">' + rose(d, { x: 28, y: 30, r: 9, pal: 'pink' }) + rose(d, { x: 92, y: 94, r: 7, pal: 'blush', rot: 40 }) + heart(d, { x: 90, y: 28, s: 4.2 }) + '</g><g fill="#E36A8E" opacity=".16"><circle cx="30" cy="94" r="1.4"/><circle cx="62" cy="60" r="1"/></g>',
    kstar: d => '<g opacity=".5">' + sparkle(d, { x: 24, y: 28, s: 3.6, glow: false }) + sparkle(d, { x: 88, y: 92, s: 2.8, glow: false }) + '</g><g opacity=".4">' + star(d, { x: 92, y: 30, s: 3 }) + '</g><g fill="#FFFFFF" opacity=".35"><circle cx="58" cy="60" r=".9"/><circle cx="30" cy="96" r=".7"/><circle cx="110" cy="64" r=".6"/><circle cx="64" cy="12" r=".7"/></g>',
    kberry: d => '<g opacity=".2">' + berry(d, { x: 28, y: 32, s: .17, r: -12 }) + berry(d, { x: 92, y: 96, s: .14, r: 16 }) + blossom(d, { x: 92, y: 26, s: .32 }) + '</g>',
    kbloom: d => '<g opacity=".22">' + sakura(d, { x: 28, y: 30, r: 6.5, pal: 'pink' }) + daisy(d, { x: 92, y: 94, r: 6.5 }) + sakura(d, { x: 90, y: 26, r: 4.2, pal: 'white' }) + '</g><g fill="#EC7FA9" opacity=".16"><circle cx="30" cy="94" r="1.3"/><circle cx="60" cy="60" r="1"/></g>',
  };
  function pattern(th) { const fn = PATTERN[th]; if (!fn) return ''; const d = doc('p'); const b = fn(d); return d.svg('0 0 120 120', b); }
  /* زينة المسبحة حول الدائرة (خارج حلقة الحبّات) */
  const TB = {
    kbfly: d => leaf(d, { x: 22, y: 320, l: 34, r: -40 }) + leaf(d, { x: 96, y: 330, l: 30, r: 50, pal: 'deep' }) + hydrangea(d, { x: 44, y: 304, r: 27, pal: 'blue' }) + hydrangea(d, { x: 84, y: 322, r: 18, pal: 'sky' }) +
      fmnCluster(d, { x: 14, y: 330, n: 5, spread: 10, r: 4, seed: 3 }) + bfly(d, { x: 76, y: 272, s: .2, r: -22, pal: 'royal' }) + bfly(d, { x: 294, y: 46, s: .24, r: 18, pal: 'sky' }) + sparkle(d, { x: 322, y: 82, s: 4.4, c: '#8FC4FF' }) + sparkle(d, { x: 262, y: 22, s: 3.4, c: '#8FC4FF' }),
    krose: d => leaf(d, { x: 20, y: 322, l: 32, r: -50 }) + leaf(d, { x: 100, y: 330, l: 28, r: 60, pal: 'deep' }) + leaf(d, { x: 60, y: 336, l: 26, r: 180 }) + rose(d, { x: 84, y: 318, r: 13, pal: 'pink' }) + rose(d, { x: 20, y: 324, r: 9, pal: 'blush' }) + rose3(d, { x: 48, y: 298, r: 22, pal: 'red' }) +
      leaf(d, { x: 316, y: 30, l: 26, r: 150, pal: 'deep' }) + leaf(d, { x: 280, y: 60, l: 24, r: -120 }) + rose(d, { x: 318, y: 68, r: 9, pal: 'blush' }) + rose3(d, { x: 296, y: 44, r: 16, pal: 'pink' }),
    kstar: d => crescent(d, { x: 308, y: 34, r: 21, rot: -30 }) + star(d, { x: 328, y: 76, s: 6, r: 12 }) + sparkle(d, { x: 270, y: 16, s: 3.6 }) +
      star(d, { x: 46, y: 298, s: 12, r: -8, glow: true }) + star(d, { x: 82, y: 320, s: 7, r: 14, pal: 'silver' }) + sparkle(d, { x: 24, y: 268, s: 4.2 }) + sparkle(d, { x: 100, y: 292, s: 3 }) + sparkle(d, { x: 30, y: 330, s: 2.8 }),
    kberry: d => trileaf(d, { x: 36, y: 318, s: .72, r: -40 }) + trileaf(d, { x: 84, y: 330, s: .62, r: 34, pal: 'light' }) + blossom(d, { x: 20, y: 282, s: .6 }) + berry(d, { x: 88, y: 312, s: .38, r: 14 }) + berry(d, { x: 50, y: 298, s: .5, r: -12 }) +
      trileaf(d, { x: 306, y: 54, s: .5, r: 150 }) + blossom(d, { x: 320, y: 34, s: .55, r: 10 }) + berry(d, { x: 290, y: 60, s: .3, r: -8 }),
    kbloom: d => tulip(d, { x: 30, y: 292, pal: 'pink', h: 34, bend: 2, s: 1.1 }) + tulip(d, { x: 58, y: 304, pal: 'yellow', h: 28, bend: -2, s: 1 }) + fmnCluster(d, { x: 90, y: 322, n: 5, spread: 10, r: 4, pal: 'lilac', seed: 4 }) + daisy(d, { x: 72, y: 326, r: 9 }) + daisy(d, { x: 16, y: 328, r: 7, pal: 'lemon' }) +
      branch(d, [[352, 14], [330, 26], [306, 40], [282, 58]], 4.6, 1.4, 'l') + sakura(d, { x: 304, y: 42, r: 10, pal: 'pink' }) + sakura(d, { x: 326, y: 28, r: 8, pal: 'white', rot: 30 }) + sakura(d, { x: 286, y: 60, r: 7, pal: 'deep' }) + sbud(d, { x: 342, y: 16, r: 3.4, rot: 40 }),
  };
  function tbArt(th) { const fn = TB[th]; if (!fn) return ''; const d = doc('t'); const b = fn(d); return d.svg('0 0 340 340', b); }
  /* صورة الثيم في قائمة السمات */
  const THUMB = {
    kbfly: [['#6FAEF5', '#A9D2FF', '#E8F4FF'], d => rays(d, { x: 170, y: -10, L: 220, a: [[22, 30], [38, 46], [56, 64]], op: .35 }) + hill(d, 'tb1', 'M0 96C40 86 90 90 160 94L160 118L0 118Z', ['#CFEFE2', '#ACDDC8']) + leaf(d, { x: 16, y: 110, l: 26, r: -50 }) + leaf(d, { x: 146, y: 110, l: 24, r: 50, pal: 'deep' }) + hydrangea(d, { x: 26, y: 104, r: 22, pal: 'blue' }) + hydrangea(d, { x: 136, y: 108, r: 19, pal: 'peri' }) + bfly(d, { x: 82, y: 52, s: .34, r: -8, pal: 'morpho' }) + bfly(d, { x: 132, y: 26, s: .14, r: 18, pal: 'ice' }) + sparkle(d, { x: 30, y: 30, s: 4 }) + sparkle(d, { x: 118, y: 70, s: 3 })],
    krose: [['#F2A9C3', '#F9D3DF', '#FFF0F3'], d => bokeh(d, { x0: 0, x1: 160, y0: 0, y1: 80, r0: 3, r1: 10, n: 8, seed: 3, op: .6 }) + leaf(d, { x: 36, y: 96, l: 30, r: -70 }) + leaf(d, { x: 124, y: 98, l: 28, r: 72, pal: 'deep' }) + leaf(d, { x: 80, y: 112, l: 26, r: 180 }) + rose(d, { x: 46, y: 88, r: 16, pal: 'pink' }) + rose(d, { x: 116, y: 90, r: 14, pal: 'blush', rot: 30 }) + rose3(d, { x: 80, y: 68, r: 27, pal: 'red' }) + heart(d, { x: 132, y: 30, s: 6, r: 12 }) + heart(d, { x: 26, y: 40, s: 4.6, r: -12 }) + sparkle(d, { x: 108, y: 26, s: 3.4 })],
    kstar: [['#141A4A', '#2A2A78', '#4A3A9A'], d => { const r = rng(5); let s = '<g fill="#fff">'; for (let i = 0; i < 40; i++) s += '<circle cx="' + f(r() * 160) + '" cy="' + f(r() * 90) + '" r="' + f(.3 + r() * .8) + '" opacity="' + f2(.3 + r() * .6) + '"/>'; s += '</g>';
      return s + crescent(d, { x: 46, y: 42, r: 20, rot: -28 }) + star(d, { x: 112, y: 34, s: 10, r: 10, glow: true }) + star(d, { x: 136, y: 60, s: 6, r: -8, pal: 'silver' }) + sparkle(d, { x: 84, y: 22, s: 3.4 }) + cloud(d, { x: -14, y: 112, s: .9, c: ['#7D6BDA', '#5444A8'], k: 'n2', hi: '#A99AF4' }) + cloud(d, { x: 70, y: 116, s: 1, c: ['#BFB0F8', '#9280E4'], k: 'n3', hi: '#E8E0FF' }); }],
    kberry: [['#FFC4CF', '#FFE0E6', '#FFF4F0'], d => '<g fill="#fff" opacity=".6">' + Array.from({ length: 40 }, (_, i) => '<circle cx="' + ((i % 8) * 22 + (Math.floor(i / 8) % 2) * 11 + 4) + '" cy="' + (Math.floor(i / 8) * 22 + 6) + '" r="2.2"/>').join('') + '</g>' + trileaf(d, { x: 30, y: 108, s: .8, r: -40 }) + trileaf(d, { x: 132, y: 110, s: .72, r: 40, pal: 'light' }) + trileaf(d, { x: 84, y: 118, s: .7, r: 0 }) + blossom(d, { x: 124, y: 36, s: .6, r: 10 }) + berry(d, { x: 40, y: 86, s: .46, r: 14 }) + berry(d, { x: 122, y: 88, s: .42, r: -12 }) + berry(d, { x: 82, y: 70, s: .66, r: -6 }) + heart(d, { x: 30, y: 34, s: 5, pal: 'red' })],
    kbloom: [['#FFC6AE', '#FFDDE6', '#EFE3FF'], d => hill(d, 'tm', 'M0 92C50 82 110 86 160 90L160 118L0 118Z', ['#D8F2DE', '#B6E4C4']) + branch(d, [[-6, 22], [20, 12], [50, 12], [84, 6]], 5, 1.4) + sakura(d, { x: 18, y: 16, r: 8, pal: 'pink' }) + sakura(d, { x: 44, y: 12, r: 7, pal: 'white' }) + sakura(d, { x: 70, y: 8, r: 7.5, pal: 'deep' }) +
      tulip(d, { x: 40, y: 78, pal: 'pink', h: 34, bend: 2, s: 1.15 }) + tulip(d, { x: 80, y: 72, pal: 'yellow', h: 40, bend: -2, s: 1.2 }) + tulip(d, { x: 120, y: 80, pal: 'lilac', h: 32, bend: 3, s: 1.1 }) + daisy(d, { x: 22, y: 104, r: 9 }) + daisy(d, { x: 100, y: 106, r: 8, pal: 'pink' }) + daisy(d, { x: 144, y: 104, r: 8 }) + bfly(d, { x: 132, y: 34, s: .12, r: 14, pal: 'pink' })],
  };
  function thumb(th) { const T = THUMB[th]; if (!T) return ''; const d = doc('b'); const bg = d.def('tbg', LG(0, 0, 0, 1, [[0, T[0][0]], [.55, T[0][1]], [1, T[0][2]]])); const b = T[1](d); return d.svg('0 0 160 118', '<rect width="160" height="118" fill="' + bg + '"/>' + b, ' preserveAspectRatio="xMidYMid slice"'); }
  /* ───────── الحبّات ───────── */
  function beads(th, pos, rr) {
    const d = doc('bd'); let s = '';
    if (th === 'kstar') pos.forEach(([x, y]) => { s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f2(rr * 1.35 / 10) + ')"><path class="bd bd-sh" d="' + STAR5 + '"/></g>'; });
    else if (th === 'kberry') { const h = berrySym(d, true); pos.forEach(([x, y], i) => { s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + ((i % 5) * 9 - 18) + ') scale(' + f2(rr * 1.75 / 34) + ')"><use class="bd bd-u" href="' + h + '"/></g>'; }); }
    else pos.forEach(([x, y], i) => { s += '<circle class="bd' + (th === 'kbloom' ? ' b' + (i % 4) : '') + '" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f2(rr) + '"/>'; });
    return (d.defs() ? '<defs>' + d.defs() + '</defs>' : '') + s;
  }
  const BEADTOP = { kbfly: 'kbfly', krose: 'krose', kstar: 'kstar', kberry: 'kbloomw', kbloom: 'kbloom' };
  function beadTop(th, cx, cy, z) {
    let svg = th === 'kberry' ? (() => { const d = doc('bt'); const b = blossom(d, { x: 0, y: 0, s: 1 }); return d.svg('-19 -19 38 38', b); })() : th === 'kstar' ? (() => { const d = doc('bt'); const b = crescent(d, { x: 0, y: 0, r: 9, rot: -30, glow: false }); return d.svg('-11 -11 22 22', b); })() : icon(th);
    if (!svg) return '';
    return svg.replace('<svg ', '<svg class="bd-top" x="' + f(cx - z / 2) + '" y="' + f(cy - z / 2) + '" width="' + f(z) + '" height="' + f(z) + '" ');
  }
  /* ───────── الزينة المتحرّكة فوق المشهد ───────── */
  function sprites(th) {
    const r = rng(th.length * 131 + 7); let s = '';
    const tw = (n, c) => { for (let i = 0; i < n; i++) s += '<i class="kt" style="left:' + f(4 + r() * 88) + '%;top:' + f(8 + r() * 56) + '%;width:' + Math.round(8 + r() * 8) + 'px;animation-delay:-' + f(r() * 3) + 's;animation-duration:' + f(2.4 + r() * 2) + 's"><svg viewBox="-10 -10 20 20"><path d="' + SPK + '" fill="' + c + '"/></svg></i>'; };
    if (th === 'kbfly') {
      [['morpho', 'k1', 22, 30], ['sky', 'k2', 26, 42], ['ice', 'k3', 30, 74]].forEach(([pal, k, dur, top], i) => { const d = doc('f'); const b = bfly(d, { x: 0, y: 0, s: 1, pal, flap: true });
        s += '<i class="kf ' + k + '" style="top:' + top + '%;animation-duration:' + dur + 's;animation-delay:-' + f(r() * dur) + 's">' + d.svg('-108 -82 216 162', b) + '</i>'; });
      tw(6, '#FFFFFF');
    } else if (th === 'krose') {
      for (let i = 0; i < 12; i++) s += '<i class="pt kp" style="left:' + f(r() * 100) + '%;animation-duration:' + f(10 + r() * 8) + 's;animation-delay:-' + f(r() * 18) + 's;--dx:' + Math.round(20 + r() * 50) * (r() < .5 ? -1 : 1) + 'px;--r:' + Math.round(120 + r() * 240) + 'deg;--s:' + f2(.7 + r() * .7) + '"></i>';
      tw(4, '#FFFFFF');
    } else if (th === 'kstar') {
      [[20, 34, 9], [29, 60, 12], [40, 24, 7], [63, 50, 10], [72, 28, 7]].forEach(([x, L, z], i) => { const d = doc('h'); const b = star(d, { x: 0, y: 0, s: 10 });
        s += '<i class="kh" style="left:' + x + '%;animation-delay:-' + f(r() * 3) + 's;animation-duration:' + f(3.2 + r() * 1.6) + 's"><b style="height:' + L + 'px"></b>' + d.svg('-11 -11 22 22', b, ' style="width:' + (z * 2.2) + 'px;height:' + (z * 2.2) + 'px"') + '</i>'; });
      tw(10, '#FFF3C4');
    } else if (th === 'kberry') {
      for (let i = 0; i < 6; i++) { const d = doc('r'); const b = heart(d, { x: 0, y: 0, s: 10, pal: i % 2 ? 'red' : 'pink' });
        s += '<i class="kr" style="left:' + f(8 + r() * 84) + '%;width:' + Math.round(10 + r() * 7) + 'px;animation-duration:' + f(9 + r() * 6) + 's;animation-delay:-' + f(r() * 14) + 's">' + d.svg('-11 -11 22 21', b) + '</i>'; }
      tw(4, '#FFFFFF');
    } else if (th === 'kbloom') {
      for (let i = 0; i < 11; i++) { const d = doc('s'); const b = sakura(d, { x: 0, y: 0, r: 10, pal: i % 3 ? 'pink' : 'white' });
        s += '<i class="kb" style="left:' + f(r() * 100) + '%;width:' + Math.round(10 + r() * 8) + 'px;animation-duration:' + f(11 + r() * 8) + 's;animation-delay:-' + f(r() * 19) + 's;--dx:' + Math.round(30 + r() * 50) * (r() < .5 ? -1 : 1) + 'px;--r:' + Math.round(160 + r() * 260) + 'deg">' + d.svg('-11 -11 22 22', b) + '</i>'; }
      tw(4, '#FFFFFF');
    }
    return s;
  }

  /* زينة شريط العنوان الملوّن (ألوان أفتح لتظهر فوق لون الثيم) */
  const HDRA = {
    kbfly: d => bfly(d, { x: 42, y: 34, s: .24, r: -14, pal: 'ice' }) + bfly(d, { x: 92, y: 20, s: .13, r: 16, pal: 'sky' }) + sparkle(d, { x: 108, y: 48, s: 3.6 }) + sparkle(d, { x: 12, y: 12, s: 3 }),
    krose: d => leaf(d, { x: 26, y: 44, l: 24, r: -66, pal: 'mint' }) + leaf(d, { x: 76, y: 48, l: 22, r: 70, pal: 'mint' }) + rose(d, { x: 74, y: 36, r: 11, pal: 'white', rot: 30 }) + rose3(d, { x: 46, y: 32, r: 16, pal: 'blush' }) + sparkle(d, { x: 104, y: 16, s: 3.4 }),
    kstar: d => star(d, { x: 40, y: 32, s: 12, r: -10, glow: true }) + star(d, { x: 76, y: 18, s: 6.5, r: 14, pal: 'silver' }) + sparkle(d, { x: 98, y: 46, s: 4, c: '#FFF3C4' }) + sparkle(d, { x: 12, y: 14, s: 3, c: '#FFF3C4' }),
    kberry: d => trileaf(d, { x: 30, y: 48, s: .46, r: -34, pal: 'light' }) + trileaf(d, { x: 80, y: 50, s: .4, r: 40, pal: 'light' }) + blossom(d, { x: 36, y: 30, s: .62, r: 10 }) + blossom(d, { x: 94, y: 20, s: .46, r: 40 }) + berry(d, { x: 62, y: 38, s: .3, r: 12 }),
    kbloom: d => leaf(d, { x: 22, y: 44, l: 14, r: -64, pal: 'mint' }) + sakura(d, { x: 36, y: 32, r: 12, pal: 'white' }) + sakura(d, { x: 64, y: 42, r: 8.5, pal: 'pink', rot: 20 }) + daisy(d, { x: 90, y: 24, r: 8, pal: 'lemon' }) + sbud(d, { x: 108, y: 46, r: 3.4, pal: 'white', rot: 30 }),
  };
  function hdrArt(th) { const fn = HDRA[th]; if (!fn) return ''; const d = doc('r'); const b = fn(d); return d.svg('0 0 120 64', b); }
  /* ذاكرة مؤقتة لروابط الصور (تُرسم مرة واحدة) */
  const MEMO = new Map();
  const uri = (k, mk) => { if (!MEMO.has(k)) { const svg = mk(); MEMO.set(k, svg ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) : ''); } return MEMO.get(k); };
  function hero(th, gr) { const d = doc('h'); const fn = HERO[th]; return d.svg('0 0 390 492', fn ? fn(d, gr == null ? 1 : gr) : '', ' preserveAspectRatio="xMidYMax slice"'); }
  const growth = L => cl(.55 + (L || 1) / 1300, .55, 1);
  return {
    has: th => !!HERO[th], hero, icon, marker, corner, pattern, tbArt, thumb, beads, beadTop, sprites, growth,
    heroURI: (th, L) => { const q = Math.round(growth(L) * 20); return uri('h' + th + q, () => hero(th, q / 20)); },
    iconURI: th => uri('i' + th, () => icon(th)), cornerURI: th => uri('c' + th, () => corner(th)), patternURI: th => uri('p' + th, () => pattern(th)),
    tbURI: th => uri('t' + th, () => tbArt(th)), thumbURI: th => uri('b' + th, () => thumb(th)), hdrURI: th => uri('r' + th, () => hdrArt(th)),
    _: { doc, bfly, rose, rose3, berry, sakura, daisy, tulip, hydrangea, star, crescent, cloud, sparkle, heart, leaf },
  };
})();

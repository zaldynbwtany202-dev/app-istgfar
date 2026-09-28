/* ═════════ وسن 5 · «مسبحة حقيقية» — حبّات على خيط تُسحب بالإصبع وتسقط بالجاذبية وتطقطق كالحقيقية ═════════
   كل حبّة تُرسم مرة واحدة (نقش المادة + اللمعة + الظل) ثم تُنسخ سريعًا في كل إطار،
   والحلقة تتوقف تمامًا حين تسكن الحبّات — فلا استهلاك للبطارية وهي ساكنة. */
const MISBAHA_MATS = {
  wood:  { n: 'خشب الصندل', c: ['#E4B07A', '#A8683B', '#55301A'], cord: '#3A2618', snd: 'wood', tex: 'grain', gloss: .42 },
  amber: { n: 'كهرمان', c: ['#FFDB8E', '#E8962A', '#8C480B'], cord: '#4A2E0E', snd: 'resin', tex: 'glow', gloss: .85 },
  pearl: { n: 'لؤلؤ', c: ['#FFFFFF', '#F3EAE4', '#C2AFA2'], cord: '#B59F80', snd: 'pearl', tex: 'sheen', gloss: .8 },
  turq:  { n: 'فيروز', c: ['#A9F0E5', '#3BB5A8', '#106C66'], cord: '#2F2A24', snd: 'stone', tex: 'veins', gloss: .7 },
  agate: { n: 'عقيق يماني', c: ['#FFAC8A', '#CF452E', '#6A160D'], cord: '#2E1A12', snd: 'stone', tex: 'bands', gloss: .8 },
  onyx:  { n: 'أونيكس', c: ['#6E6E74', '#202026', '#050506'], cord: '#C9A45C', snd: 'onyx', tex: 'none', gloss: 1 },
  gold:  { n: 'ذهب الثيم', c: null, cord: '#3B2E1A', snd: 'metal', tex: 'metal', gloss: .95 },
};
// [تردّد الطقطقة، حدّتها، رنين الحبّة، مدّة الذيل، مقدار الرنين]
const MISB_SND = { wood: [1350, 5, 820, .05, .22], resin: [1900, 6, 1250, .042, .2], pearl: [2500, 7, 2050, .032, .18], stone: [3100, 8, 2650, .03, .3], onyx: [3700, 9, 3250, .032, .32], metal: [4100, 11, 3500, .09, .45] };
const BeadSound = {
  nb: null,
  noise(c) { if (this.nb && this.nb.sampleRate === c.sampleRate) return this.nb; const n = Math.floor(c.sampleRate * .06), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 5); return (this.nb = b); },
  click(kind, vol) {
    if (tasSnd() === 'off') return;
    const c = typeof TasSound !== 'undefined' ? TasSound.ac() : null; if (!c) return;
    const P = MISB_SND[kind] || MISB_SND.wood, t = c.currentTime, j = 1 + (Math.random() - .5) * .12;
    const out = c.createGain(); out.gain.value = Math.max(0.03, Math.min(1, vol)) * (+Settings.tasVol || .7) * .9; out.connect(c.destination);
    const wet = TasSound.reverb(c); if (wet) { const w = c.createGain(); w.gain.value = .35; out.connect(w); w.connect(wet); }
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = this.noise(c); bp.type = 'bandpass'; bp.frequency.value = P[0] * j; bp.Q.value = P[1];
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + P[3]); src.connect(bp); bp.connect(g); g.connect(out); src.start(t); src.stop(t + P[3] + .02);
    const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = P[2] * j; og.gain.setValueAtTime(P[4], t); og.gain.exponentialRampToValueAtTime(0.0008, t + P[3] * 1.6);
    o.connect(og); og.connect(out); o.start(t); o.stop(t + P[3] * 1.6 + .02);
  },
};
const Misbaha = {
  cv: null, x: null, raf: 0, on: false,
  init(cv, o) {
    this.destroy(); this.cv = cv; this.o = o || {};
    const R = cv.getBoundingClientRect(); this.W = Math.max(200, R.width); this.H = Math.max(260, R.height);
    this.dpr = Math.min(3, window.devicePixelRatio || 1); cv.width = Math.round(this.W * this.dpr); cv.height = Math.round(this.H * this.dpr);
    this.x = cv.getContext('2d'); this.r = Math.max(10, Math.min(13.5, this.W / 26)); this.gap = 1.1;
    this.yb = this.H * .44; this.fl = this.H * .87; this.cx = this.W * (this.o.cx || .5); this.G = 3000;
    this.setMat(this.o.mat || 'wood', true);
    // الحلقة: ٣٣ حبّة + فاصلتان بعد ١١ و٢٢ + الإمام (بشُرّابته) في آخر كل دورة
    const seq = []; for (let i = 0; i < 33; i++) { seq.push('b'); if (i === 10 || i === 21) seq.push('s'); } seq.push('i'); this.seq = seq;
    const c = ((this.o.count || 0) % 33 + 33) % 33; this.p = c + (c >= 11 ? 1 : 0) + (c >= 22 ? 1 : 0);
    this.up = []; this.mv = []; this.lo = []; this.sink = 0; this.drag = null; this.nu = this.p;
    let y = this.yb; for (let k = 0; y > -40; k++) { const e = this.mk(this.nu++); e.y = y - e.len / 2; y = e.y - e.len / 2 - this.gap; this.up.push(e); }
    let yl = this.fl; for (let k = 1; yl < this.H + 40; k++) { const e = this.mk(this.p - k); e.y = yl + e.len / 2; yl = e.y + e.len / 2 + this.gap; this.lo.push(e); }
    this.pd = e => this.down(e); this.pm = e => this.move(e); this.pu = e => this.up_(e);
    cv.addEventListener('pointerdown', this.pd); cv.addEventListener('pointermove', this.pm); cv.addEventListener('pointerup', this.pu); cv.addEventListener('pointercancel', this.pu);
    this.on = true; this.draw();
  },
  destroy() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.on = false;
    if (this.cv && this.pd) { this.cv.removeEventListener('pointerdown', this.pd); this.cv.removeEventListener('pointermove', this.pm); this.cv.removeEventListener('pointerup', this.pu); this.cv.removeEventListener('pointercancel', this.pu); }
    this.cv = null; },
  kindAt(i) { const n = this.seq.length; return this.seq[((i % n) + n) % n]; },
  mk(i) { const k = this.kindAt(i), r = this.r; return { k, i, y: 0, v: 0, a: (i * 1.7) % 6.28, len: k === 'i' ? r * 4.2 : k === 's' ? r * 2.3 : r * 2 }; },
  setMat(m, silent) {
    this.mat = MISBAHA_MATS[m] ? m : 'wood'; const M = Object.assign({}, MISBAHA_MATS[this.mat]);
    if (!M.c) { const cs = getComputedStyle(document.documentElement), gv = (v, d) => cs.getPropertyValue(v).trim() || d; M.c = [gv('--gold-2', '#F6DE92'), gv('--gold', '#D4AF63'), gv('--gold-3', '#9C7224')]; }
    this.M = M; this.spr = { b: this.sprite('b'), s: this.sprite('s'), i: this.sprite('i') };
    if (!silent) this.draw();
  },
  /* رسم الحبّة مرة واحدة: الجسم (بالنقش) يدور مع الحركة، واللمعة ثابتة كأن الضوء من أعلى اليمين */
  sprite(kind) {
    const r = this.r, dpr = this.dpr, M = this.M, sep = kind !== 'b';
    const w = kind === 'i' ? r * 1.7 : kind === 's' ? r * 1.4 : r * 2, h = kind === 'i' ? r * 4.2 : kind === 's' ? r * 2.3 : r * 2, pad = 6;
    const mk = () => { const c = document.createElement('canvas'); c.width = Math.ceil((w + pad * 2) * dpr); c.height = Math.ceil((h + pad * 2) * dpr); const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(pad + w / 2, pad + h / 2); return [c, x]; };
    const shape = x => { x.beginPath(); if (kind === 'b') x.arc(0, 0, r, 0, 6.2832); else x.ellipse(0, 0, w / 2, h / 2, 0, 0, 6.2832); };
    const col = kind === 's' ? ['#FFF1C4', '#D9AE52', '#7C5A1C'] : M.c;
    const [bc, bx] = mk(); shape(bx); bx.save(); bx.clip();
    let g = bx.createRadialGradient(-w * .2, -h * .24, Math.max(w, h) * .04, 0, 0, Math.max(w, h) * .62);
    g.addColorStop(0, col[0]); g.addColorStop(.56, col[1]); g.addColorStop(1, col[2]); bx.fillStyle = g; bx.fillRect(-w, -h, w * 2, h * 2);
    let s = 7 + kind.charCodeAt(0); const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const tex = kind === 's' ? 'metal' : M.tex;
    if (tex === 'grain') { bx.strokeStyle = 'rgba(58,30,12,.2)'; for (let i = 0; i < 11; i++) { bx.lineWidth = .5 + rnd() * .8; bx.beginPath(); const y0 = -h / 2 + i * h / 10 + rnd() * 2; bx.moveTo(-w, y0); for (let xx = -w; xx <= w; xx += 3) bx.lineTo(xx, y0 + Math.sin(xx * .35 + i) * 1.2); bx.stroke(); } }
    else if (tex === 'veins') { bx.strokeStyle = 'rgba(40,52,45,.42)'; for (let i = 0; i < 5; i++) { bx.lineWidth = .4 + rnd() * .7; bx.beginPath(); let px = (rnd() - .5) * w, py = (rnd() - .5) * h; bx.moveTo(px, py); for (let k = 0; k < 7; k++) { px += (rnd() - .5) * w * .5; py += (rnd() - .5) * h * .5; bx.lineTo(px, py); } bx.stroke(); } }
    else if (tex === 'bands') { for (let i = 5; i > 0; i--) { bx.beginPath(); bx.ellipse(w * .08, h * .1, w * .12 * i, h * .09 * i, .5, 0, 6.2832); bx.strokeStyle = i % 2 ? 'rgba(255,226,210,.16)' : 'rgba(60,10,5,.14)'; bx.lineWidth = 1.2; bx.stroke(); } }
    else if (tex === 'glow') { const q = bx.createRadialGradient(w * .14, h * .2, 0, w * .14, h * .2, r * .9); q.addColorStop(0, 'rgba(255,245,190,.55)'); q.addColorStop(1, 'rgba(255,245,190,0)'); bx.fillStyle = q; bx.fillRect(-w, -h, w * 2, h * 2);
      bx.fillStyle = 'rgba(120,60,10,.28)'; for (let i = 0; i < 4; i++) { bx.beginPath(); bx.arc((rnd() - .5) * w * .7, (rnd() - .5) * h * .7, .5 + rnd() * .7, 0, 6.28); bx.fill(); } }
    else if (tex === 'sheen') { const q = bx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); q.addColorStop(0, 'rgba(255,190,210,.14)'); q.addColorStop(.5, 'rgba(255,255,255,0)'); q.addColorStop(1, 'rgba(170,230,210,.14)'); bx.fillStyle = q; bx.fillRect(-w, -h, w * 2, h * 2); }
    else if (tex === 'metal') { for (let i = -6; i <= 6; i++) { bx.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)'; bx.fillRect(-w, i * h / 12, w * 2, h / 12); } }
    g = bx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); bx.fillStyle = g; bx.fillRect(-w, -h, w * 2, h * 2);
    bx.restore();
    const [hc, hx] = mk(); shape(hx); hx.save(); hx.clip();
    const gl = kind === 's' ? .95 : M.gloss;
    g = hx.createRadialGradient(-w * .27, -h * .3, 0, -w * .27, -h * .3, Math.min(w, h) * .44);
    g.addColorStop(0, 'rgba(255,255,255,' + (.95 * gl).toFixed(2) + ')'); g.addColorStop(.35, 'rgba(255,255,255,' + (.34 * gl).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
    hx.fillStyle = g; hx.fillRect(-w, -h, w * 2, h * 2);
    g = hx.createRadialGradient(w * .16, h * .22, Math.min(w, h) * .3, 0, 0, Math.max(w, h) * .6); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.86, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.2)');
    hx.fillStyle = g; hx.fillRect(-w, -h, w * 2, h * 2); hx.restore(); shape(hx); hx.strokeStyle = 'rgba(0,0,0,.22)'; hx.lineWidth = .6; hx.stroke();
    if (kind === 'i') { [-1, 1].forEach(sg => { hx.beginPath(); hx.ellipse(0, sg * h * .47, w * .32, r * .32, 0, 0, 6.2832); const q = hx.createLinearGradient(-w * .3, 0, w * .3, 0); q.addColorStop(0, '#7C5A1C'); q.addColorStop(.45, '#FFE9A8'); q.addColorStop(1, '#8A6420'); hx.fillStyle = q; hx.fill(); }); }
    const [sc, sx] = mk(); const q = sx.createRadialGradient(2, h * .1 + 3, 1, 2, h * .1 + 3, Math.max(w, h) * .62); q.addColorStop(0, 'rgba(0,0,0,.34)'); q.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = q; sx.beginPath(); sx.ellipse(2, 4, w * .62, h * .62, 0, 0, 6.2832); sx.fill();
    return { b: bc, h: hc, s: sc, w: w + pad * 2, hh: h + pad * 2, rot: !sep };
  },
  cordX(y) { return this.cx + Math.sin(y / this.H * 3.4 + .6) * this.r * .7; },
  wake() { if (!this.raf && this.on) { this.t = performance.now(); this.raf = requestAnimationFrame(t => this.frame(t)); } },
  frame(t) {
    this.raf = 0; if (!this.on) return; const dt = Math.min(.034, (t - this.t) / 1000); this.t = t;
    const busy = this.step(dt); this.draw(); if (busy) this.raf = requestAnimationFrame(tt => this.frame(tt));
  },
  step(dt) {
    let busy = false; const G = this.G, gap = this.gap;
    for (let i = 0; i < this.up.length; i++) {
      const e = this.up[i]; if (this.drag && this.drag.e === e) { busy = true; continue; }
      const rest = i === 0 ? this.yb - e.len / 2 : this.up[i - 1].y - this.up[i - 1].len / 2 - e.len / 2 - gap;
      if (e.y > rest + .05) { e.y -= (e.y - rest) * Math.min(1, dt * 16); e.v = 0; busy = true; if (e.y - rest < .1) e.y = rest; }
      else if (e.y < rest - .05 || e.v > 0) { e.v += G * dt; e.y += e.v * dt; busy = true; if (e.y >= rest) { if (i === 0 && e.v > 90) this.hit(e.v * .45, false); e.y = rest; e.v = 0; } }
    }
    const top = this.up[this.up.length - 1];
    if (top && top.y - top.len / 2 > -30) { const e = this.mk(this.nu++); e.y = top.y - top.len / 2 - e.len / 2 - gap; this.up.push(e); busy = true; }
    this.mv.sort((a, b) => b.y - a.y);
    for (let i = 0; i < this.mv.length; i++) {
      const m = this.mv[i]; m.v += G * dt; m.v *= (1 - .5 * dt); const dy = m.v * dt; m.y += dy; m.a += dy / this.r * .35; busy = true;
      const floorTop = i === 0 ? this.fl + this.sink : this.mv[i - 1].y - this.mv[i - 1].len / 2;
      if (m.y + m.len / 2 + gap >= floorTop) { m.y = floorTop - m.len / 2 - gap;
        if (i === 0) { this.hit(m.v, true); this.mv.shift(); i--; this.lo.unshift(m); this.sink -= m.len + gap; }
        else { m.v = this.mv[i - 1].v; } }
    }
    if (Math.abs(this.sink) > .15) { this.sink *= Math.exp(-dt * 8.5); busy = true; } else this.sink = 0;
    let yl = this.fl + this.sink; this.lo.forEach(e => { e.y = yl + e.len / 2; yl = e.y + e.len / 2 + gap; });
    while (this.lo.length > 2 && this.lo[this.lo.length - 1].y - this.lo[this.lo.length - 1].len / 2 > this.H + 30) this.lo.pop();
    return busy;
  },
  hit(v, main) {
    const vol = Math.min(1, v / 1500) * (main ? 1 : .45); if (vol < .03) return;
    try { BeadSound.click(this.M.snd, vol); } catch (e) {}
    if (main && Settings.vibrate !== false) try { Native.call('vibrate', 7); } catch (e) {}
  },
  /* تحرير الحبّة التالية: تُحسب تسبيحة، وتمرّ بعدها الفاصلة أو الإمام وحدهما */
  release(v0) {
    // إن كانت الفاصلة أو الإمام عند الإصبع تمرّ فورًا ثم تُسحب الحبّة التالية — فلا تضيع ضغطة
    while (this.up[0] && this.up[0].k !== 'b') { const s = this.up.shift(); s.v = 260; this.mv.push(s); this.p++; }
    const e = this.up[0]; if (!e) return false;
    this.up.shift(); e.v = Math.max(v0 || 0, 220); this.mv.push(e); this.p++;
    if (this.o.onCount) try { this.o.onCount(); } catch (er) { console.error(er); }
    this.chain(); this.wake(); return true;
  },
  chain() { clearTimeout(this._ch); const n = this.up[0]; if (!n || n.k === 'b') return;
    this._ch = setTimeout(() => { const s = this.up[0]; if (!s || s.k === 'b' || (this.drag && this.drag.e === s)) return; this.up.shift(); s.v = 160; this.mv.push(s); this.p++; this.wake(); this.chain(); }, 150); },
  ly(ev) { const r = this.cv.getBoundingClientRect(); return ev.clientY - r.top; },
  down(ev) { if (this.up[0] && this.up[0].k !== 'b') { this.release(300); return; } const e0 = this.up[0]; if (!e0) return; ev.preventDefault(); try { this.cv.setPointerCapture(ev.pointerId); } catch (er) {}
    const y = this.ly(ev), t = performance.now(); this.drag = { e: e0, off: e0.y - y, y0: y, t0: t, ly: y, lt: t, v: 0, moved: false }; this.wake(); },
  move(ev) { const d = this.drag; if (!d) return; const y = this.ly(ev), t = performance.now(), e = d.e;
    if (Math.abs(y - d.y0) > 6) d.moved = true;
    const dt = Math.max(1, t - d.lt) / 1000, dy = y - d.ly; d.v = d.v * .5 + (dy / dt) * .5; d.ly = y; d.lt = t;
    const rest = this.yb - e.len / 2; e.y = Math.max(rest - 8, Math.min(this.fl - e.len / 2 - 2, y + d.off)); e.a += dy / this.r * .3;
    if (e.y > this.yb + e.len * .12) { this.drag = null; this.release(Math.max(d.v, 260)); if (this.o.onFirst) this.o.onFirst(); }
    this.wake(); },
  up_(ev) { const d = this.drag; if (!d) return; this.drag = null;
    if (!d.moved && performance.now() - d.t0 < 380) { this.release(560); if (this.o.onFirst) this.o.onFirst(); }
    this.wake(); },
  draw() {
    const x = this.x; if (!x) return; const H = this.H, W = this.W, dpr = this.dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    x.beginPath(); for (let y = -12; y <= H + 12; y += 6) { const cx = this.cordX(y); y === -12 ? x.moveTo(cx, y) : x.lineTo(cx, y); }
    x.strokeStyle = this.M.cord; x.lineWidth = 2.2; x.lineCap = 'round'; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = .7; x.stroke();
    const all = this.up.concat(this.mv, this.lo).filter(e => e.y + e.len > -20 && e.y - e.len < H + 20).sort((a, b) => a.y - b.y);
    all.forEach(e => this.drawEl(e));
  },
  drawEl(e) {
    const x = this.x, S = this.spr[e.k], cx = this.cordX(e.y), w = S.w, h = S.hh;
    x.drawImage(S.s, cx - w / 2, e.y - h / 2, w, h);
    if (S.rot) { x.save(); x.translate(cx, e.y); x.rotate(e.a); x.drawImage(S.b, -w / 2, -h / 2, w, h); x.restore(); } else x.drawImage(S.b, cx - w / 2, e.y - h / 2, w, h);
    x.drawImage(S.h, cx - w / 2, e.y - h / 2, w, h);
    if (e.k === 'i') this.tassel(cx, e.y + e.len / 2);
  },
  /* الشُّرّابة: خيوط حريرية تتدلّى جانبًا من الإمام */
  tassel(cx, y) {
    const x = this.x, r = this.r, br = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#7A2B2B';
    x.save(); x.translate(cx, y); x.rotate(-.55);
    x.fillStyle = '#D9AE52'; x.beginPath(); x.ellipse(0, r * .5, r * .42, r * .55, 0, 0, 6.2832); x.fill();
    for (let i = -9; i <= 9; i++) { x.beginPath(); x.moveTo(i * .35, r * .9); x.quadraticCurveTo(i * 1.1, r * 3, i * 1.9, r * 5.2 + Math.abs(i) * .3); x.strokeStyle = i % 3 ? br : 'rgba(255,255,255,.35)'; x.globalAlpha = i % 3 ? .9 : .5; x.lineWidth = 1; x.stroke(); }
    x.globalAlpha = 1; x.restore();
  },
};
window.Misbaha = Misbaha;

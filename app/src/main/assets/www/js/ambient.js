/* ════════════════════════════════════════════════════════════════
   وسن 4.5 · أصوات الطبيعة أثناء القراءة
   حلقات هادئة مضمّنة في التطبيق (تعمل دون إنترنت): أمواج، مطر، عصافير، نسيم، جدول، ليل.
   ─ تشغيل بتلاشٍ ناعم، وتكرار متّصل بمزج عنصرين صوتيين (لا فجوة عند نهاية الحلقة)
   ─ تهدأ تلقائيًا عند تشغيل التلاوة (إيقاف مؤقت أو خفض أو بلا تغيير — حسب اختيارك)
   ════════════════════════════════════════════════════════════════ */
'use strict';
const AMBIENT = [
  ['waves', 'أمواج البحر', 'waves'],
  ['rain', 'مطر خفيف', 'rain'],
  ['birds', 'زقزقة العصافير', 'bird'],
  ['wind', 'نسيم وأوراق', 'wind'],
  ['stream', 'جدول ماء', 'drop'],
  ['night', 'ليل هادئ', 'moon'],
];
const Ambient = {
  els: [], cur: 0, id: '', next: '', on: false, g: 0, duck: 1, xf: 3, _t: 0, _rc: 0,
  name(id) { const x = AMBIENT.find(a => a[0] === (id || this.id)); return x ? x[1] : ''; },
  src(id) { return (window.__AMB && window.__AMB[id]) || 'snd/amb_' + id + '.ogg'; },   // __AMB: نسخة مضمّنة في المعاينة الحيّة
  vol() { return clamp(Settings.ambVol == null ? 0.55 : +Settings.ambVol, 0, 1); },
  target() { return this.on ? this.vol() * this.duck : 0; },
  ensure() { if (!this.els.length) this.els = [0, 1].map(() => { const a = new Audio(); a.preload = 'auto'; a.w = 0; a.volume = 0; return a; }); },
  kick(a) { try { const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} },
  swap(id) {
    this.els.forEach(a => { try { a.pause(); } catch (e) {} a.w = 0; a.volume = 0; a.src = this.src(id); });
    this.cur = 0; const a = this.els[0]; a.w = 1; this.id = id; this.kick(a);
  },
  play(id) {
    if (!AMBIENT.some(a => a[0] === id)) return;
    this.ensure();
    if (Settings.ambLast !== id) setSetting('ambLast', id);
    if (this.on && this.id === id && !this.next) return;
    const wasOn = this.on && this.g > 0.02; this.on = true;
    if (wasOn && this.id !== id) this.next = id;          // تلاشٍ للصوت الحالي ثم الانتقال
    else { this.next = ''; this.g = 0; this.swap(id); }
    this.id = this.next ? this.id : id;
    this.run(); Bus.emit('ambient');
  },
  stop() { if (!this.on && !this.next) return; this.on = false; this.next = ''; this.run(); Bus.emit('ambient'); },
  toggle(id) { if (this.on && (this.next || this.id) === id) this.stop(); else this.play(id); },
  playing() { return this.on; },
  current() { return this.next || this.id; },
  setVol(v) { setSetting('ambVol', clamp(+v, 0, 1)); this.run(); },
  /** تُستدعى من مشغّل التلاوة: on = بدأت التلاوة (مع تأخير عند التوقف كي لا يتذبذب الصوت بين الآيات) */
  recite(on) {
    clearTimeout(this._rc);
    const m = Settings.ambRecite || 'pause';
    const apply = v => { if (this.duck === v) return; this.duck = v; if (this.on) this.run(); };
    if (on) apply(m === 'pause' ? 0 : m === 'duck' ? 0.3 : 1);
    else this._rc = setTimeout(() => apply(1), 1500);
  },
  run() { if (!this._t) this._t = setInterval(() => this.step(), 100); },
  step() {
    const want = this.next ? 0 : this.target(), d = want - this.g, sp = 0.03;   // ≈ ثلاث ثوانٍ لتلاشٍ كامل
    this.g = Math.abs(d) <= sp ? want : this.g + Math.sign(d) * sp;
    if (this.next && this.g <= 0.001) { const n = this.next; this.next = ''; this.swap(n); }
    const A = this.els[this.cur], B = this.els[1 - this.cur];
    if (A && B && !A.paused && isFinite(A.duration) && A.duration > this.xf * 3) {
      const left = A.duration - A.currentTime;
      if (left <= this.xf) {
        if (B.paused) { try { B.currentTime = 0; } catch (e) {} this.kick(B); }
        const k = clamp(1 - left / this.xf, 0, 1); B.w = k; A.w = 1 - k;
      }
      if (left <= 0.06) { try { A.pause(); } catch (e) {} A.w = 0; B.w = 1; this.cur = 1 - this.cur; }
    } else if (A && B && A.ended && !B.paused) { A.w = 0; B.w = 1; this.cur = 1 - this.cur; }
    if (want === 0 && this.g <= 0.001) {
      this.els.forEach(a => { if (!a.paused) try { a.pause(); } catch (e) {} });
      if (!this.on && !this.next) { clearInterval(this._t); this._t = 0; }
    } else if (want > 0) { const C = this.els[this.cur]; if (C && C.paused) this.kick(C); }
    this.els.forEach(a => { try { a.volume = clamp(this.g * (a.w || 0), 0, 1); } catch (e) {} });
  },
  /** إيقاف فوري عند مغادرة التطبيق (يعود بتلاشٍ عند الرجوع) */
  hush() { this.g = 0; this.els.forEach(a => { try { a.pause(); a.volume = 0; } catch (e) {} }); },
};
document.addEventListener('visibilitychange', () => {
  if (!Ambient.on) return;
  if (document.hidden) { if (!(window.Player && Player.on)) Ambient.hush(); }
  else Ambient.run();
});
window.Ambient = Ambient;

function ambientSheet() {
  const chips = () => AMBIENT.map(([id, n, ic]) => '<button class="amb' + (Ambient.on && Ambient.current() === id ? ' on' : '') + '" data-amb="' + id + '"><span class="amb-ic">' + icon(ic) + '</span><span class="amb-n">' + n + '</span></button>').join('');
  const v0 = Math.round(Ambient.vol() * 100);
  const html = '<div class="sh-t">أصوات الطبيعة</div><div class="sh-s">خلفية هادئة تصاحبك أثناء القراءة والتدبّر · المس الصوت لتشغيله أو إيقافه</div>' +
    '<div class="amb-grid" id="amb-g">' + chips() + '</div>' +
    '<div class="mx"><div class="row" style="justify-content:space-between;margin-top:16px"><b>مستوى الصوت</b><span class="gold num" id="amb-v">' + N(v0) + '٪</span></div>' +
    '<input type="range" min="0" max="100" step="1" value="' + v0 + '" id="amb-vol">' +
    '<b style="display:block;margin:14px 0 8px">عند تشغيل التلاوة</b><div class="seg" id="amb-rc"><button data-v="pause">إيقاف مؤقت</button><button data-v="duck">خفض الصوت</button><button data-v="keep">بلا تغيير</button></div>' +
    '<button class="btn ghost block" id="amb-x" style="margin-top:16px"' + (Ambient.on ? '' : ' disabled') + '>' + icon('stop') + 'إيقاف الأصوات</button>' +
    '<div class="faint center" style="font-size:11.5px;margin-top:10px;line-height:1.7">تسجيلات طبيعية حرّة الترخيص، مضمّنة في التطبيق وتعمل دون إنترنت</div></div>';
  Sheet.open(html, el => {
    const g = $('#amb-g', el), vol = $('#amb-vol', el), x = $('#amb-x', el);
    const sync = () => { g.innerHTML = chips(); x.disabled = !Ambient.on; };
    g.onclick = e => { const b = e.target.closest('[data-amb]'); if (!b) return; Ambient.toggle(b.dataset.amb); vibrate(6); sync(); };
    const fill = () => vol.style.setProperty('--p', vol.value + '%'); fill();
    vol.addEventListener('input', () => { fill(); $('#amb-v', el).textContent = N(vol.value) + '٪'; Ambient.setVol(vol.value / 100); if (!Ambient.on && Settings.ambLast) Ambient.play(Settings.ambLast); sync(); });
    const rc = $('#amb-rc', el), mark = () => $$('button', rc).forEach(b => b.classList.toggle('on', b.dataset.v === (Settings.ambRecite || 'pause'))); mark();
    rc.onclick = e => { const b = e.target.closest('button'); if (!b) return; setSetting('ambRecite', b.dataset.v); mark(); if (window.Player && Player.playing) Ambient.recite(true); };
    x.onclick = () => { Ambient.stop(); sync(); };
  });
}

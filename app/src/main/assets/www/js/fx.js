/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · «نجمة لكل طاعة» — كل عمل صالح تسجّله يطير نجمةً إلى بستانك
   ════════════════════════════════════════════════════════════════ */
'use strict';
const FX = {
  last: null, acc: 0, busy: 0, reduce: false,
  init() {
    try { this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    document.addEventListener('pointerdown', e => { this.last = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
  },
  /** نقطة الوصول: أيقونة «بستاني» في شريط التنقل إن كان ظاهرًا */
  target() {
    const bar = document.getElementById('tabbar'); if (!bar || bar.classList.contains('hide')) return null;
    const tb = bar.querySelector('.tab[data-t="more"]'); if (!tb) return null;
    const r = tb.getBoundingClientRect(); if (!r.width) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 - 7, el: tb };
  },
  /** تُستدعى عند كل كسب للنقاط؛ تُطلق نجمة إذا كان الكسب ناتجًا عن لمسة حديثة */
  xp(v) {
    if (!(v > 0)) return;
    this.acc += v;
    const now = Date.now();
    if (this.acc < 1 || !this.last || now - this.last.t > 1600 || now - this.busy < 220) return;
    const n = Math.floor(this.acc); this.acc -= n; this.busy = now;
    this.fly(this.last.x, this.last.y, n);
  },
  fly(x0, y0, n) {
    const T = this.target(); if (!T) return;
    const s = document.createElement('div'); s.className = 'fx-star';
    s.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + starD(12, 12, 11, 0.76, Math.PI / 8) + '"/></svg>';
    document.body.appendChild(s);
    const x1 = T.x, y1 = T.y, mx = (x0 + x1) / 2 + (x0 < x1 ? -60 : 60), my = Math.min(y0, y1) - 120;
    const land = () => {
      s.remove();
      T.el.classList.remove('fx-hit'); void T.el.offsetWidth; T.el.classList.add('fx-hit');
      const p = document.createElement('div'); p.className = 'fx-plus num'; p.textContent = '+' + N(n);
      p.style.left = x1 + 'px'; p.style.top = (y1 - 14) + 'px'; document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    };
    if (this.reduce || !s.animate) { land(); return; }
    const kf = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, u = 1 - t;
      const x = u * u * x0 + 2 * u * t * mx + t * t * x1, y = u * u * y0 + 2 * u * t * my + t * t * y1;
      kf.push({ transform: 'translate(' + (x - 9).toFixed(1) + 'px,' + (y - 9).toFixed(1) + 'px) scale(' + (t < 0.15 ? 0.4 + t * 5 : 1.15 - t * 0.55).toFixed(2) + ') rotate(' + (t * 200).toFixed(0) + 'deg)', opacity: t > 0.92 ? 0.6 : 1 });
    }
    s.animate(kf, { duration: 760, easing: 'cubic-bezier(.45,.05,.35,1)' }).onfinish = land;
  },
  /** انفجار نجمي صغير (عند إتمام دورة تسبيح أو صلوات اليوم) */
  burst(x, y, cls) {
    if (this.reduce) return;
    const b = document.createElement('div'); b.className = 'fx-burst ' + (cls || ''); b.style.left = x + 'px'; b.style.top = y + 'px';
    b.innerHTML = Array.from({ length: 10 }, (_, i) => '<i style="--a:' + (i * 36) + 'deg;--d:' + (0.02 * (i % 3)).toFixed(2) + 's"></i>').join('');
    document.body.appendChild(b); setTimeout(() => b.remove(), 900);
  },
};

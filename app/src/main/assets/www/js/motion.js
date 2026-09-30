/* ════════════════════════════════════════════════════════════════
   وسن 7.1 · «الحركة» — نظام حركة احترافي خفيف
   • كل الحركات على transform/opacity فقط (تُرسم على معالج الرسوميات، بلا كلفة تخطيط)
   • انتقالات الصفحات: «محور مشترك» للأمام والرجوع، و«تلاشٍ عابر» بين التبويبات
     (View Transitions الأصلية في WebView الحديث، ومحاكاة CSS خفيفة في القديم)
   • ثلاثة مستويات يختارها المستخدم: كاملة · هادئة · بدون (توفير البطارية)
   ════════════════════════════════════════════════════════════════ */
'use strict';
const Motion = {
  lvl: 'full', _vt: null, _io: null, _cu: [], _cuRaf: 0,
  sysReduce() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } },
  level() {
    const v = Settings.motion;
    if (!Settings.motionSet && this.sysReduce()) return 'soft';      // احترام «تقليل الحركة» في النظام ما لم يختر المستخدم بنفسه
    return v === 'off' || v === 'soft' ? v : 'full';
  },
  apply() {
    this.lvl = this.level();
    document.documentElement.setAttribute('data-motion', this.lvl);
    if (typeof FX !== 'undefined') FX.reduce = this.lvl === 'off' || (!Settings.motionSet && this.sysReduce());
  },
  get full() { return this.lvl === 'full'; },
  get on() { return this.lvl !== 'off'; },
  canVT() { return this.lvl === 'full' && typeof document.startViewTransition === 'function' && !document.hidden; },

  /* ── انتقال الصفحات: يعيد true إن تولّى View Transitions تنفيذ run ── */
  page(how, run) {
    if (!how || how === 'none' || !this.canVT()) return false;
    const de = document.documentElement;
    try {
      de.setAttribute('data-vt', how);
      const vt = document.startViewTransition(run);
      this._vt = vt;
      // بعد الانتقال نُعيد إطلاق «التمرير» كي تتحدّث العناصر المعتمدة على موضع الشاشة (مثل سطر الجزء والحزب في المصحف)
      const done = () => { if (this._vt === vt) { this._vt = null; de.removeAttribute('data-vt'); requestAnimationFrame(() => window.dispatchEvent(new Event('scroll'))); } };
      vt.ready.catch(() => {}); vt.updateCallbackDone.catch(e => console.error(e));
      vt.finished.then(done, done);
      return true;
    } catch (e) { de.removeAttribute('data-vt'); return false; }
  },
  /** أصناف الصفحة الجديدة حسب اتجاه الحركة */
  cls(how, vt) {
    if (!how || how === 'none') return ' still';
    if (this.lvl === 'off') return ' still';
    if (this.lvl === 'soft') return ' m-fade';
    if (vt) return how === 'tab' ? ' still m-stg' : ' still';
    return ' m-' + (how === 'back' ? 'back' : how === 'tab' ? 'tab' : how === 'fade' ? 'fade' : 'fwd') + ' m-stg';
  },
  /** بعد تركيب الصفحة: رسم الحلقات، عدّ الأرقام، وإيقاف الزخارف خارج الشاشة */
  enter(el, how) {
    if (!el) return;
    this.watch(el);
    if (!this.full || !how || how === 'none') return;
    try { this.rings(el); this.countUp(el); } catch (e) { console.error(e); }
  },
  rings(el) {
    $$('.rfg', el).slice(0, 12).forEach(fg => {
      const to = fg.getAttribute('stroke-dashoffset'), full = fg.getAttribute('stroke-dasharray');
      if (to == null || full == null || Math.abs(parseFloat(to) - parseFloat(full)) < 0.5) return;
      const tr = fg.style.transition;
      fg.style.transition = 'none'; fg.setAttribute('stroke-dashoffset', full);
      fg.getBoundingClientRect();
      requestAnimationFrame(() => {
        fg.style.transition = 'stroke-dashoffset .95s cubic-bezier(.22,1,.36,1) .12s';
        fg.setAttribute('stroke-dashoffset', to);
        setTimeout(() => { fg.style.transition = tr; }, 1200);
      });
    });
  },
  /** عدّ تصاعدي للأرقام الظاهرة في البطاقات (يعود النص الأصلي حرفيًا في النهاية) */
  countUp(el) {
    const L = $$('.stile .v.num, .kring > .num, .dc-ring > span, [data-cu]', el).slice(0, 16);
    const now = performance.now();
    L.forEach(e => {
      if (e.children.length) return;
      const orig = e.textContent, lat = orig.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
      const m = /^(\D*?)(\d[\d,]*)(\D*)$/.exec(lat); if (!m) return;
      const v = parseInt(m[2].replace(/,/g, ''), 10); if (!(v > 1) || v > 1e7) return;
      const comma = m[2].indexOf(',') >= 0;
      const pre = orig.slice(0, m[1].length), suf = orig.slice(orig.length - m[3].length);
      this._cu.push({ e, orig, v, pre, suf, comma, t0: now + 90, d: Math.min(1100, 520 + Math.log10(v) * 160) });
    });
    if (this._cu.length && !this._cuRaf) this._cuRaf = requestAnimationFrame(t => this._cuTick(t));
  },
  _cuTick(t) {
    this._cu = this._cu.filter(c => {
      if (!c.e.isConnected) return false;
      const k = clamp((t - c.t0) / c.d, 0, 1), ez = 1 - Math.pow(1 - k, 3);
      if (k >= 1) { c.e.textContent = c.orig; return false; }
      const n = Math.round(c.v * ez);
      c.e.textContent = c.pre + N(c.comma ? n.toLocaleString('en-US') : String(n)) + c.suf;
      return true;
    });
    this._cuRaf = this._cu.length ? requestAnimationFrame(x => this._cuTick(x)) : 0;
  },
  /* ── إيقاف حركة الزخارف حين تخرج من الشاشة (توفير المعالج والبطارية) ── */
  watch(el) {
    if (!('IntersectionObserver' in window)) return;
    if (!this._io) this._io = new IntersectionObserver(es => es.forEach(x => x.target.classList.toggle('m-zz', !x.isIntersecting)), { rootMargin: '60px 0px' });
    $$('.scene, .garden-svg, .gart, .gprev, .dg-grid, .pstrip', el).slice(0, 24).forEach(x => this._io.observe(x));
  },

  /* ── مؤشّر شريط التنقل المنزلق ── */
  tabInd(instant) {
    const bar = document.getElementById('tabbar'); if (!bar) return;
    let ind = bar.querySelector('.tab-ind');
    if (!ind) { ind = document.createElement('i'); ind.className = 'tab-ind'; ind.setAttribute('aria-hidden', 'true'); bar.insertBefore(ind, bar.firstChild); bar.classList.add('has-ind'); instant = true; }
    const tabs = $$('.tab', bar), i = tabs.findIndex(t => t.classList.contains('on'));
    if (i < 0) { ind.classList.add('off'); return; }
    const t = tabs[i]; if (!t.offsetWidth) return;
    if (instant) ind.style.transition = 'none';
    ind.style.width = t.offsetWidth + 'px'; ind.style.height = t.offsetHeight + 'px';
    ind.style.transform = 'translate3d(' + t.offsetLeft + 'px,' + t.offsetTop + 'px,0)';
    ind.classList.remove('off');
    if (instant) { ind.getBoundingClientRect(); ind.style.transition = ''; }
    if (this._ti !== i) { this._ti = i; if (!instant && this.on) { ind.classList.remove('pop'); void ind.offsetWidth; ind.classList.add('pop'); } }
  },

  /* ── سحب الورقة السفلية إلى الأسفل لإغلاقها ── */
  sheetDrag(el, bg) {
    let y0 = 0, x0 = 0, dy = 0, t0 = 0, drag = false, skip = false;
    const NO = 'input,textarea,select,[contenteditable],.no-drag,canvas';
    el.addEventListener('touchstart', e => {
      skip = e.touches.length !== 1 || !!e.target.closest(NO); drag = false; dy = 0;
      if (skip) return; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = Date.now();
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (skip) return;
      const y = e.touches[0].clientY, x = e.touches[0].clientX;
      if (!drag) {
        const d = y - y0, dx = x - x0;
        if (Math.abs(d) < 7 && Math.abs(dx) < 7) return;
        if (d > 0 && Math.abs(d) > Math.abs(dx) * 1.2 && el.scrollTop <= 0) { drag = true; el.classList.add('drag'); y0 = y; t0 = Date.now(); }
        else { skip = true; return; }
      }
      dy = Math.max(0, y - y0);
      el.style.transform = 'translate3d(0,' + (dy < 0 ? 0 : dy) + 'px,0)';
      if (bg) bg.style.opacity = String(Math.max(0.15, 1 - dy / (el.offsetHeight * 1.1)));
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    const end = () => {
      if (!drag) return; drag = false; el.classList.remove('drag');
      const v = dy / Math.max(1, Date.now() - t0);
      if (dy > Math.min(150, el.offsetHeight * 0.28) || (v > 0.55 && dy > 36)) { vibrate(6); Sheet.close(); }
      else { el.style.transform = ''; if (bg) bg.style.opacity = ''; }
    };
    el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
  },

  /* ── تغيير الثيم بدائرة تتّسع من موضع اللمسة ── */
  reveal(ev, fn) {
    if (!this.canVT()) { fn(); return; }
    const x = ev && ev.clientX != null ? ev.clientX : innerWidth / 2, y = ev && ev.clientY != null ? ev.clientY : innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8, de = document.documentElement;
    try {
      if (this._vt) try { this._vt.skipTransition(); } catch (e) {}
      de.setAttribute('data-vt', 'reveal');
      const vt = document.startViewTransition(fn); this._vt = vt;
      vt.ready.then(() => {
        de.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      vt.updateCallbackDone.catch(e => console.error(e));
      const done = () => { if (this._vt === vt) { this._vt = null; de.removeAttribute('data-vt'); } };
      vt.finished.then(done, done);
    } catch (e) { de.removeAttribute('data-vt'); fn(); }
  },

  /* ── حبّة «المقطع» المنزلقة بين الخيارات (FLIP) ── */
  _segDown(e) {
    const b = e.target.closest && e.target.closest('.seg > button'); if (!b || b.classList.contains('on') || !this.on) return;
    const seg = b.parentElement, from = seg.querySelector(':scope > button.on'); if (!from) return;
    const fr = from.getBoundingClientRect();
    setTimeout(() => {
      if (!b.isConnected || !b.classList.contains('on') || from.classList.contains('on')) return;
      const tr = b.getBoundingClientRect(), sr = seg.getBoundingClientRect();
      const p = document.createElement('i'); p.className = 'seg-pill';
      p.style.cssText = 'left:' + (tr.left - sr.left) + 'px;top:' + (tr.top - sr.top) + 'px;width:' + tr.width + 'px;height:' + tr.height + 'px';
      seg.classList.add('seg-mv'); seg.appendChild(p); b.classList.add('seg-to');
      const a = p.animate([{ transform: 'translateX(' + (fr.left - tr.left) + 'px) scaleX(' + (fr.width / tr.width).toFixed(3) + ')' }, { transform: 'none' }],
        { duration: this.full ? 380 : 200, easing: 'cubic-bezier(.3,1.2,.5,1)' });
      const fin = () => { p.remove(); b.classList.remove('seg-to'); seg.classList.remove('seg-mv'); };
      a.onfinish = fin; a.oncancel = fin;
    }, 0);
  },

  /** افتتاحية: حين تتلاشى شاشة البداية تصعد أقسام الرئيسية بتتابع هادئ */
  intro() {
    if (!this.full) return; const s = document.querySelector('#view .screen'); if (!s) return;
    s.classList.remove('still'); s.classList.add('m-intro', 'm-stg');
  },
  init() {
    this.apply();
    Bus.on('settings', k => { if (k === 'motion') { Settings.motionSet = 1; Store.set('settings', Settings); this.apply(); }
      else if (k === 'uiScale') setTimeout(() => this.tabInd(true), 80); });
    try { window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => this.apply()); } catch (e) {}
    document.addEventListener('click', e => this._segDown(e), true);
    // علامة الإنجاز: نرسمها بعد أن يسجّل المعالج الأصلي الصلاة/العادة/المهمة
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('.chk, .hchk, .tchk'); if (!b || !this.on) return;
      setTimeout(() => { if (!b.isConnected) return; const row = b.closest('.hrow, .trow');
        if (!(b.classList.contains('on') || (row && (row.classList.contains('ok') || row.classList.contains('done'))))) return;
        b.classList.remove('m-pop'); void b.offsetWidth; b.classList.add('m-pop'); setTimeout(() => b.classList.remove('m-pop'), 700); }, 0);
    }, true);
    window.addEventListener('resize', debounce(() => this.tabInd(true), 120));
  },
};
window.Motion = Motion;

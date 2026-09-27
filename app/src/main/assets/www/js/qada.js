/* ════════════════════════════════════════════════════════════════
   وسن 4.2 · «القضاء» — فوائت الصلوات وأيام الصيام
   ─ لكل فريضة: ما بقي عليك وما قضيته، مع خطة يومية هادئة وتقدير لموعد الإتمام
   ─ «إضافة فوائت» دفعة واحدة: أيام أو أسابيع أو أشهر أو سنوات
   ─ قضاء الصيام: الأيام التي عليك، وعدّ تنازلي لرمضان القادم
   ─ كل قضاء يُسقي بستانك (+8 للصلاة، +20 ليوم الصيام)
   ════════════════════════════════════════════════════════════════ */
'use strict';
const QADA_P = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
/** الاسم المعدود بعد الرقم وفق قواعد العدد: 1 صلاة · 3 صلوات · 11 صلاة · 100 صلاة */
const unitOf = (n, one, two, few, many) => { const r = n % 100; return n === 1 ? one : n === 2 ? two : (r >= 3 && r <= 10) ? few : (n >= 100 && r <= 2) || n === 0 ? one : many; };
const AYAH_QADA = 'فَمَن كَانَ مِنكُم مَّرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ';
const Qada = {
  d: null,
  load() {
    if (this.d) return this.d;
    const x = Store.get('qada', {}), z = () => ({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, sawm: 0 });
    this.d = { o: Object.assign(z(), x.o || {}), dn: Object.assign(z(), x.dn || {}), plan: x.plan || 5, log: x.log || {}, hist: x.hist || [], tab: x.tab || 'pr' };
    return this.d;
  },
  save() {
    const d = this.d, ks = Object.keys(d.log).sort();
    if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(k => delete d.log[k]);
    if (d.hist.length > 30) d.hist = d.hist.slice(-30);
    Store.set('qada', d); Bus.emit('qada');
  },
  left(k) { const d = this.load(); return k ? (d.o[k] || 0) : QADA_P.reduce((a, x) => a + (d.o[x] || 0), 0); },
  done(k) { const d = this.load(); return k ? (d.dn[k] || 0) : QADA_P.reduce((a, x) => a + (d.dn[x] || 0), 0); },
  today() { return this.load().log[dayKey(new Date())] || 0; },
  any(kind) { return kind === 'sw' ? this.left('sawm') + this.done('sawm') > 0 : this.left() + this.done() > 0; },
  /** قضيت صلاة (أو يوم صيام) */
  makeUp(k) {
    const d = this.load(); if ((d.o[k] || 0) <= 0) return false;
    d.o[k]--; d.dn[k] = (d.dn[k] || 0) + 1; d.hist.push(k);
    if (k !== 'sawm') { const t = dayKey(new Date()); d.log[t] = (d.log[t] || 0) + 1; }
    this.save(); Growth.add(k === 'sawm' ? 'qds' : 'qd', 1); return true;
  },
  /** التراجع عن آخر قضاء في القسم المعروض */
  undo(kind) {
    const d = this.load(), sw = kind === 'sw';
    for (let j = d.hist.length - 1; j >= 0; j--) {
      const k = d.hist[j]; if ((k === 'sawm') !== sw) continue;
      d.hist.splice(j, 1); if ((d.dn[k] || 0) <= 0) return null;
      d.dn[k]--; d.o[k] = (d.o[k] || 0) + 1;
      if (k !== 'sawm') { const t = dayKey(new Date()); if (d.log[t]) d.log[t]--; }
      this.save(); Growth.add(k === 'sawm' ? 'qds' : 'qd', -1); return k;
    }
    return null;
  },
  canUndo(kind) { const sw = kind === 'sw'; return this.load().hist.some(k => (k === 'sawm') === sw); },
  addOwed(k, n) { const d = this.load(); d.o[k] = clamp(Math.round((d.o[k] || 0) + n), 0, 999999); this.save(); },
  setOwed(k, n) { const d = this.load(); d.o[k] = clamp(Math.round(+n || 0), 0, 999999); this.save(); },
};
/** مدة تقريبية بالكلمات: أيام · أشهر · سنوات */
function durWords(days) {
  if (days <= 31) return pD(Math.max(1, days));
  if (days < 350) { const m = Math.max(1, Math.round(days / 30)); return (m === 1 ? 'شهر' : plural(m, 'شهر', 'شهرين', 'أشهر', 'شهرًا')) + ' تقريبًا'; }
  const y = Math.round(days / 365 * 2) / 2, w = Math.floor(y), half = y - w >= 0.5;
  let s = w ? (w === 1 ? 'سنة' : plural(w, 'سنة', 'سنتين', 'سنوات', 'سنة')) : '';
  if (half) s = w ? s + ' ونصف' : 'نصف سنة';
  return s + ' تقريبًا';
}
/** رمضان القادم (أو الحالي) بالتقويم الهجري */
let _nrC = null;
function nextRamadan(from) {
  from = from || new Date(); const key = dayKey(from) + '|' + Settings.hijriOffset;
  if (_nrC && _nrC.k === key) return _nrC.v;
  let v = null; const h0 = hijriOf(from);
  if (h0.month === 9) v = { days: 0, now: true, left: 30 - h0.day };
  else for (let i = 1; i < 400; i++) { const d = addDays(from, i), h = hijriOf(d); if (h.month === 9 && h.day === 1) { v = { days: i, date: d, h }; break; } }
  _nrC = { k: key, v }; return v;
}

SCREENS.qada = {
  parent: 'more',
  render() {
    const d = Qada.load(), sw = d.tab === 'sw';
    return hdr('القضاء', 'فوائت الصلوات وأيام الصيام بخطة يومية هادئة', { back: true, compact: true, actions: [{ id: 'qa-ed', icon: 'edit', label: 'تعديل الأعداد' }] }) +
      '<div class="mx" style="margin-top:14px"><div class="seg" id="qa-tab"><button data-v="pr" class="' + (sw ? '' : 'on') + '">فوائت الصلوات</button>' +
      '<button data-v="sw" class="' + (sw ? 'on' : '') + '">قضاء الصيام</button></div></div>' +
      (sw ? this.sawm() : this.prayers());
  },
  hero(ring, big, unit, lines, extra) {
    return '<div class="hc mt qa-hero"><div class="row" style="gap:16px;align-items:center">' + ring +
      '<div class="grow"><div class="muted" style="font-size:12.5px">المتبقّي عليك</div><div class="qa-big"><b class="num">' + big + '</b> ' + unit + '</div>' +
      '<div class="muted" style="font-size:12.5px;line-height:1.7">' + lines + '</div></div></div>' + (extra || '') + '</div>';
  },
  ring(frac) {
    return '<div class="ring qa-ring">' + ringSVG(92, 8, frac, 'var(--gold)') + '<div class="ctr"><b class="num" style="font-size:19px">' + N(Math.floor(frac * 100)) + '٪</b>' +
      '<span class="faint" style="font-size:10.5px">أُنجز</span></div></div>';
  },
  prayers() {
    const d = Qada.load(), left = Qada.left(), done = Qada.done();
    const foot = '<div class="foot-note">«من نسي صلاةً أو نام عنها فكفّارتها أن يصلّيها إذا ذكرها» — رواه مسلم<br>اقضِ ما تستطيع كل يوم، فأحبّ الأعمال إلى الله أدومها وإن قلّ.</div>';
    if (!left && !done) return '<div class="mx mt"><div class="emptyc qa-empty"><div class="ic">' + icon('history') + '</div><div class="t">لا فوائت مسجّلة</div>' +
      '<div class="s">إن كانت عليك صلوات فائتة فأضف عددها — ولو تقديرًا — وسيُعينك وسن على قضائها بخطة يومية.</div>' +
      '<button class="btn gold" id="qa-add">' + icon('plus') + 'إضافة فوائت</button></div></div>' + foot;
    const today = Qada.today(), plan = d.plan;
    const lines = 'قضيت <b class="gold num">' + fmtInt(done) + '</b>' + (left ? ' · تتمّها خلال ' + durWords(Math.ceil(left / plan)) : ' · أتممت ما سجّلته، تقبّل الله');
    const planRow = '<button class="qa-plan" id="qa-plan"><span>خطتك اليومية</span><b class="num">' + N(today) + ' / ' + N(plan) + '</b>' + icon('chev') + '</button>' +
      '<div class="gtrack" style="height:7px;margin-top:8px"><i style="width:' + (clamp(today / plan, 0, 1) * 100).toFixed(1) + '%"></i></div>';
    return this.hero(this.ring(done / Math.max(1, done + left)), fmtInt(left), unitOf(left, 'صلاة', 'صلاتان', 'صلوات', 'صلاة'), lines, planRow) +
      sec('قضيت صلاة؟ سجّلها') + '<div class="list mx" id="qa-l">' + QADA_P.map(k => {
        const o = d.o[k] || 0;
        return '<div class="li qa-row"><div class="ic">' + icon(PICON[k]) + '</div><div class="grow"><div class="t">' + PNAME[k] + '</div>' +
          '<div class="s">متبقٍّ <b class="num">' + fmtInt(o) + '</b> · قضيت <span class="num">' + fmtInt(d.dn[k] || 0) + '</span></div></div>' +
          '<button class="qa-btn" data-k="' + k + '"' + (o ? '' : ' disabled') + '>' + icon('check') + 'قضيت</button></div>';
      }).join('') + '</div>' +
      '<div class="mx mt qa-acts"><button class="btn ghost" id="qa-add">' + icon('plus') + 'إضافة فوائت</button>' +
      '<button class="btn ghost" id="qa-undo"' + (Qada.canUndo('pr') ? '' : ' disabled') + '>' + icon('undo') + 'تراجع</button></div>' + foot;
  },
  sawm() {
    const left = Qada.left('sawm'), done = Qada.done('sawm'), nr = nextRamadan();
    const rl = nr ? (nr.now ? 'نحن في شهر رمضان — تقبّل الله صيامك' : 'رمضان القادم بعد ' + pD(nr.days) + (left ? '، فبادر بالقضاء قبله' : '')) : '';
    const foot = '<div class="foot-note"><span class="qa-ay">﴿' + qd(AYAH_QADA) + '﴾</span><br>[البقرة: ' + N(184) + ']</div>';
    if (!left && !done) return '<div class="mx mt"><div class="emptyc qa-empty"><div class="ic">' + icon('moon') + '</div><div class="t">هل عليك أيام من رمضان؟</div>' +
      '<div class="s">إن أفطرت أيامًا لعذر فأضف عددها، وتابع قضاءها يومًا بيوم قبل رمضان القادم.' + (rl ? '<br>' + rl : '') + '</div>' +
      '<button class="btn gold" id="qa-add">' + icon('plus') + 'إضافة أيام</button></div></div>' + foot;
    const lines = 'قضيت <b class="gold num">' + fmtInt(done) + '</b>' + (left ? '' : ' · أتممت ما سجّلته، تقبّل الله') + (rl ? '<br>' + rl : '');
    return this.hero(this.ring(done / Math.max(1, done + left)), fmtInt(left), unitOf(left, 'يوم', 'يومان', 'أيام', 'يومًا'), lines) +
      '<div class="mx mt"><button class="btn primary block qa-sw" id="qa-sw"' + (left ? '' : ' disabled') + '>' + icon('check') + 'قضيت يومًا</button></div>' +
      '<div class="mx mt qa-acts"><button class="btn ghost" id="qa-add">' + icon('plus') + 'إضافة أيام</button>' +
      '<button class="btn ghost" id="qa-undo"' + (Qada.canUndo('sw') ? '' : ' disabled') + '>' + icon('undo') + 'تراجع</button></div>' + foot;
  },
  mount(el) {
    const d = Qada.load(), sw = d.tab === 'sw';
    $('#qa-tab', el).onclick = e => { const b = e.target.closest('button'); if (!b || b.dataset.v === d.tab) return; d.tab = b.dataset.v; Qada.save(); Router.refresh(); };
    $('#qa-ed', el).onclick = () => qadaEditSheet(sw ? 'sw' : 'pr');
    const add = $('#qa-add', el); if (add) add.onclick = () => qadaAddSheet(sw ? 'sw' : 'pr');
    const un = $('#qa-undo', el); if (un) un.onclick = () => { const k = Qada.undo(sw ? 'sw' : 'pr'); if (k) { toast('تم التراجع عن آخر قضاء'); vibrate(8); Router.refresh(); } };
    const pl = $('#qa-plan', el); if (pl) pl.onclick = () => pickSheet('خطتك اليومية', 'كم صلاة فائتة تقضي كل يوم؟', [
      { v: 1, t: 'صلاة واحدة' }, { v: 2, t: 'صلاتان' }, { v: 3, t: plural(3, '', '', 'صلوات', '') }, { v: 5, t: plural(5, '', '', 'صلوات', ''), s: 'فريضة فائتة مع كل فريضة حاضرة' },
      { v: 10, t: plural(10, '', '', 'صلوات', ''), s: 'يومان من الفوائت كل يوم' }, { v: 15, t: plural(15, '', '', '', 'صلاة') }, { v: 25, t: plural(25, '', '', '', 'صلاة'), s: 'خمسة أيام من الفوائت كل يوم' }],
      d.plan, v => { d.plan = v; Qada.save(); Router.refresh(); });
    const l = $('#qa-l', el); if (l) l.onclick = e => {
      const b = e.target.closest('.qa-btn'); if (!b || b.disabled) return;
      const was = Qada.today();
      if (!Qada.makeUp(b.dataset.k)) return;
      vibrate(18);
      if (!Qada.left()) toast('أتممت قضاء ما سجّلته — تقبّل الله منك', 3200);
      else if (was < d.plan && Qada.today() >= d.plan) toast('أتممت خطة اليوم — بارك الله فيك', 2800);
      Router.refresh();
    };
    const s = $('#qa-sw', el); if (s) s.onclick = () => { if (!Qada.makeUp('sawm')) return; vibrate(22); toast(Qada.left('sawm') ? 'تقبّل الله صيامك' : 'أتممت قضاء ما عليك — تقبّل الله', 2600); Router.refresh(); };
  },
};

/** إضافة فوائت: الصلوات بالمدة (أيام/أسابيع/أشهر/سنوات) أو أيام صيام */
function qadaAddSheet(kind) {
  const sw = kind === 'sw', U = [['1', 'يوم'], ['7', 'أسبوع'], ['30', 'شهر'], ['365', 'سنة']];
  let n = 1, u = 1; const sel = new Set(QADA_P);
  const html = '<div class="sh-t">' + (sw ? 'إضافة أيام صيام' : 'إضافة فوائت') + '</div>' +
    '<div class="sh-s">' + (sw ? 'عدد الأيام التي أفطرتها وعليك قضاؤها' : 'أضف فوائت مدة كاملة دفعة واحدة — ولو تقديرًا، ويمكنك التعديل لاحقًا') + '</div>' +
    '<div class="mx"><div class="stepper qa-stp"><button id="qs-m" aria-label="إنقاص">' + icon('minus') + '</button><input id="qs-n" type="number" inputmode="numeric" min="1" max="99999" value="1"><button id="qs-p" aria-label="زيادة">' + icon('plus') + '</button></div>' +
    (sw ? '' : '<div class="seg mt" id="qs-u">' + U.map(([v, t]) => '<button data-v="' + v + '" class="' + (v === '1' ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      '<div class="qa-pick mt" id="qs-k">' + QADA_P.map(k => '<button data-k="' + k + '" class="on">' + PNAME[k] + '</button>').join('') + '</div>') +
    '<div class="qa-prev" id="qs-pv"></div><button class="btn gold block" id="qs-ok">' + icon('plus') + 'إضافة</button></div>';
  Sheet.open(html, el => {
    const inp = $('#qs-n', el), pv = $('#qs-pv', el);
    const val = () => clamp(Math.round(+inp.value || 0), 0, 99999);
    const paint = () => {
      n = val();
      if (sw) { pv.innerHTML = n ? 'سيُضاف <b class="num">' + fmtInt(n) + '</b> ' + unitOf(n, 'يوم', 'يومان', 'أيام', 'يومًا') : 'أدخل عدد الأيام'; return; }
      const days = n * u, tot = days * sel.size;
      pv.innerHTML = tot ? 'سيُضاف <b class="num">' + fmtInt(tot) + '</b> ' + unitOf(tot, 'صلاة', 'صلاتان', 'صلوات', 'صلاة') + (sel.size > 1 ? ' — <span class="num">' + fmtInt(days) + '</span> لكل فريضة' : '') : 'اختر المدة والصلوات';
    };
    paint();
    inp.oninput = paint;
    $('#qs-m', el).onclick = () => { inp.value = Math.max(1, val() - 1); paint(); };
    $('#qs-p', el).onclick = () => { inp.value = Math.min(99999, val() + 1); paint(); };
    const us = $('#qs-u', el); if (us) us.onclick = e => { const b = e.target.closest('button'); if (!b) return; u = +b.dataset.v; $$('button', us).forEach(x => x.classList.toggle('on', x === b)); paint(); };
    const ks = $('#qs-k', el); if (ks) ks.onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k;
      if (sel.has(k)) { if (sel.size > 1) sel.delete(k); } else sel.add(k); b.classList.toggle('on', sel.has(k)); paint(); };
    $('#qs-ok', el).onclick = () => {
      n = val(); if (!n) { toast('أدخل عددًا صحيحًا'); return; }
      if (sw) Qada.addOwed('sawm', n); else sel.forEach(k => Qada.addOwed(k, n * u));
      Sheet.close(() => { toast('أُضيفت — أعانك الله على قضائها'); Router.refresh(); });
    };
  });
}

/** تعديل الأعداد يدويًا */
function qadaEditSheet(kind) {
  const sw = kind === 'sw', keys = sw ? ['sawm'] : QADA_P, d = Qada.load();
  const html = '<div class="sh-t">تعديل الأعداد</div><div class="sh-s">' + (sw ? 'عدد أيام الصيام المتبقية عليك' : 'عدد الصلوات المتبقية عليك لكل فريضة') + '</div>' +
    '<div class="list mx qa-ed">' + keys.map(k => '<div class="li"><div class="grow"><div class="t">' + (k === 'sawm' ? 'أيام الصيام' : PNAME[k]) + '</div></div>' +
      '<div class="stepper"><button data-k="' + k + '" data-s="-1" aria-label="إنقاص">' + icon('minus') + '</button><input type="number" inputmode="numeric" min="0" max="999999" data-k="' + k + '" value="' + (d.o[k] || 0) + '"><button data-k="' + k + '" data-s="1" aria-label="زيادة">' + icon('plus') + '</button></div></div>').join('') + '</div>' +
    '<div class="mx mt"><button class="btn gold block" id="qe-ok">حفظ</button></div>';
  Sheet.open(html, el => {
    el.addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (!b) return; const i = $('input[data-k="' + b.dataset.k + '"]', el);
      i.value = clamp(Math.round(+i.value || 0) + +b.dataset.s, 0, 999999); });
    $('#qe-ok', el).onclick = () => { $$('input[data-k]', el).forEach(i => Qada.setOwed(i.dataset.k, i.value)); Sheet.close(() => { toast('حُفظت الأعداد'); Router.refresh(); }); };
  });
}
window.Qada = Qada;

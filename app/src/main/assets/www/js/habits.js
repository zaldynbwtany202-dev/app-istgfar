/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · العادات والمهام
   ─ عادات جاهزة مرتبطة بنشاطك في التطبيق (تكتمل تلقائيًا) أو يدوية بعدد وأيام وتذكير.
   ─ مهام بتاريخ ووقت وأولوية وقائمة، مع تذكير في وقتها.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WD1 = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const HICONS = ['sun', 'moon', 'book', 'mosque', 'heart', 'hands', 'moonstar', 'calendar', 'star8', 'beads', 'target', 'lamp', 'flame', 'sparkle', 'check', 'clock'];
const HHUES = ['emerald', 'teal', 'gold', 'indigo', 'plum', 'amber', 'rose', 'slate'];
/* أمثلة جاهزة — auto: تكتمل من نشاطك داخل التطبيق */
const HABIT_PRESETS = [
  { name: 'أذكار الصباح', ic: 'sun', hue: 'amber', auto: 'azm', target: 1 },
  { name: 'أذكار المساء', ic: 'moon', hue: 'indigo', auto: 'aze', target: 1 },
  { name: 'ورد القرآن اليومي', ic: 'book', hue: 'emerald', auto: 'quran', target: 20, unit: 'آية' },
  { name: 'الصلوات الخمس', ic: 'mosque', hue: 'teal', auto: 'prayers', target: 5, unit: 'صلوات' },
  { name: 'الاستغفار', ic: 'heart', hue: 'rose', auto: 'ist', target: 100, unit: 'مرة' },
  { name: 'صلاة الضحى', ic: 'sun', hue: 'gold', target: 1 },
  { name: 'قيام الليل والوتر', ic: 'moonstar', hue: 'plum', target: 1 },
  { name: 'صيام الاثنين والخميس', ic: 'calendar', hue: 'slate', target: 1, days: [1, 4] },
  { name: 'صدقة اليوم', ic: 'hands', hue: 'emerald', target: 1 },
  { name: 'صلة الرحم', ic: 'heart', hue: 'amber', target: 1, days: [5] },
  { name: 'قراءة كتاب نافع', ic: 'lamp', hue: 'teal', target: 1 },
  { name: 'رياضة ومشي', ic: 'flame', hue: 'rose', target: 1 },
  { name: 'شرب الماء', ic: 'sparkle', hue: 'indigo', target: 8, unit: 'أكواب' },
];
const AUTO = {
  azm: { t: 'يكتمل بإتمام أذكار الصباح', v: d => ((Growth.day(d).azs || {}).morning ? 1 : 0) },
  aze: { t: 'يكتمل بإتمام أذكار المساء', v: d => ((Growth.day(d).azs || {}).evening ? 1 : 0) },
  quran: { t: 'يُحسب من الآيات التي تقرؤها', v: d => Growth.day(d).q || 0 },
  prayers: { t: 'يُحسب من متابعة الصلوات', v: d => Tracker.count(d) },
  ist: { t: 'يُحسب من ورد الاستغفار', v: d => Growth.day(d).ist || 0 },
};

const Habits = {
  list: Store.get('habits', []),
  log: Store.get('hlog', {}),
  save() { Store.set('habits', this.list); Store.set('hlog', this.log); Notif.schedule(); Bus.emit('habits'); },
  active() { return this.list.filter(h => !h.arch); },
  due(h, d) { return !h.days || !h.days.length || h.days.includes(d.getDay()); },
  today(d) { d = d || new Date(); return this.active().filter(h => this.due(h, d)); },
  val(h, d) { d = d || new Date(); return h.auto && AUTO[h.auto] ? AUTO[h.auto].v(d) : ((this.log[dayKey(d)] || {})[h.id] || 0); },
  done(h, d) { return this.val(h, d) >= (h.target || 1); },
  /** للعادات اليدوية: +1 حتى الهدف ثم يعود للصفر عند اللمس مجددًا */
  tap(h, d) {
    d = d || new Date(); if (h.auto) { toast(AUTO[h.auto].t); return; }
    const k = dayKey(d), day = this.log[k] || (this.log[k] = {}), was = this.done(h, d), tg = h.target || 1;
    day[h.id] = (day[h.id] || 0) >= tg ? 0 : (day[h.id] || 0) + 1;
    const now = this.done(h, d);
    if (!was && now) { Growth.add('hab', 1); vibrate(18); } else if (was && !now) Growth.add('hab', -1); else vibrate(8);
    this.save();
  },
  /** عادات تلقائية: تُمنح نقاطها مرة واحدة عند اكتمالها */
  syncAuto() {
    const d = new Date(), k = dayKey(d), day = this.log[k] || (this.log[k] = {});
    let changed = false;
    this.today(d).forEach(h => { if (!h.auto) return; const key = '_a' + h.id; if (this.done(h, d) && !day[key]) { day[key] = 1; Growth.add('hab', 1); changed = true; } });
    if (changed) Store.set('hlog', this.log);
  },
  streak(h) {
    let s = 0, d = new Date();
    if (!this.done(h, d)) d = addDays(d, -1);
    for (let i = 0; i < 1000; i++) { if (!this.due(h, d)) { d = addDays(d, -1); continue; } if (!this.done(h, d)) break; s++; d = addDays(d, -1); }
    return s;
  },
  rate(h, n) { let due = 0, ok = 0; for (let i = 0; i < n; i++) { const d = addDays(new Date(), -i); if (!this.due(h, d)) continue; due++; if (this.done(h, d)) ok++; } return due ? ok / due : 0; },
  add(h) { h.id = uid(); h.created = dayKey(new Date()); this.list.push(h); this.save(); },
  update(id, patch) { const h = this.list.find(x => x.id === id); if (h) Object.assign(h, patch); this.save(); },
  remove(id) { this.list = this.list.filter(x => x.id !== id); this.save(); },
};

const Todo = {
  list: Store.get('todos', []),
  save() { Store.set('todos', this.list); Notif.schedule(); Bus.emit('todos'); },
  LISTS: [['worship', 'عبادة', 'emerald'], ['personal', 'شخصي', 'amber'], ['work', 'عمل', 'indigo'], ['study', 'دراسة', 'teal'], ['home', 'المنزل', 'rose']],
  listOf(k) { return this.LISTS.find(x => x[0] === k) || this.LISTS[1]; },
  todayKey() { return dayKey(new Date()); },
  bucket(t) {
    if (t.done) return 'done';
    const tk = this.todayKey();
    if (!t.due) return 'today';
    if (t.due < tk) return 'late';
    return t.due === tk ? 'today' : 'next';
  },
  sorted(filter) {
    const pr = t => (t.done ? 1e13 : 0) + (t.due ? new Date(t.due + 'T' + (t.time || '23:59')).getTime() / 1000 : 9e9) - (t.pri || 0) * 1e10;
    return this.list.filter(filter).sort((a, b) => filter === Todo.fDone ? (b.done - a.done) : (pr(a) - pr(b)));
  },
  fToday: t => !t.done && ['today', 'late'].includes(Todo.bucket(t)),
  fNext: t => !t.done && Todo.bucket(t) === 'next',
  fDone: t => !!t.done,
  toggle(id) {
    const t = this.list.find(x => x.id === id); if (!t) return;
    t.done = t.done ? 0 : Date.now();
    Growth.add('todo', t.done ? 1 : -1); vibrate(t.done ? 18 : 8);
    this.save();
  },
  add(t) { t.id = uid(); t.created = Date.now(); t.done = 0; this.list.push(t); this.save(); },
  update(id, patch) { const t = this.list.find(x => x.id === id); if (t) Object.assign(t, patch); this.save(); },
  remove(id) { this.list = this.list.filter(x => x.id !== id); this.save(); },
  clearDone() { this.list = this.list.filter(x => !x.done); this.save(); },
};

/* ── عناصر العرض ── */
function habitRow(h, d) {
  const v = Habits.val(h, d), tg = h.target || 1, ok = v >= tg, frac = clamp(v / tg, 0, 1);
  const sub = h.auto ? AUTO[h.auto].t : (tg > 1 ? N(Math.min(v, tg)) + ' / ' + N(tg) + (h.unit ? ' ' + h.unit : '') : (h.days && h.days.length ? h.days.map(x => WD[x]).join('، ') : 'يوميًا'));
  const st = Habits.streak(h);
  return '<div class="hrow ' + (ok ? 'ok' : '') + '" data-h="' + h.id + '"><button class="hic" style="' + hueVars(h.hue) + '" data-hedit="' + h.id + '">' + icon(h.ic || 'check') + '</button>' +
    '<div class="grow" data-hedit="' + h.id + '"><div class="t">' + esc(h.name) + (h.auto ? ' <span class="pill">تلقائي</span>' : '') + '</div><div class="s">' + esc(sub) + '</div>' +
    (tg > 1 && !ok ? '<div class="hbar"><i style="width:' + (frac * 100).toFixed(0) + '%"></i></div>' : '') + '</div>' +
    (st > 1 ? '<span class="hstreak" title="أيام متتالية">' + icon('flame') + '<b class="num">' + N(st) + '</b></span>' : '') +
    '<button class="hchk" data-hchk="' + h.id + '" aria-label="تم">' + (ok ? icon('check') : (tg > 1 ? '<b class="num">' + N(Math.min(v, tg)) + '</b>' : '')) + '</button></div>';
}
function todoRow(t) {
  const b = Todo.bucket(t), L = Todo.listOf(t.list);
  const when = t.due ? (t.due === Todo.todayKey() ? 'اليوم' : (t.due === dayKey(addDays(new Date(), 1)) ? 'غدًا' : fmtDateShort(t.due))) + (t.time ? ' · ' + fmtClock(t.time) : '') : '';
  return '<div class="trow ' + (t.done ? 'done ' : '') + (b === 'late' ? 'late' : '') + '" data-t="' + t.id + '"><button class="tchk p' + (t.pri || 0) + '" data-tchk="' + t.id + '" aria-label="إنجاز">' + (t.done ? icon('check') : '') + '</button>' +
    '<div class="grow" data-tedit="' + t.id + '"><div class="t">' + esc(t.t) + '</div><div class="s"><span class="tl" style="' + hueVars(L[2]) + '">' + esc(L[1]) + '</span>' +
    (when ? '<span class="' + (b === 'late' ? 'bad' : '') + '">' + icon('clock') + esc(when) + '</span>' : '') + (t.note ? '<span>' + icon('text') + '</span>' : '') + '</div></div></div>';
}
function fmtDateShort(k) { const d = new Date(k + 'T12:00'); return N(d.getDate()) + ' ' + GM_SHORT[d.getMonth()]; }
const GM_SHORT = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
function fmtClock(hm) { const [h, m] = hm.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return fmtTime(d); }
function bindHabitRows(el, rerender) {
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-hchk]'); if (c) { const h = Habits.list.find(x => x.id === c.dataset.hchk); if (h) { Habits.tap(h); rerender(); } return; }
    const ed = e.target.closest('[data-hedit]'); if (ed) { const h = Habits.list.find(x => x.id === ed.dataset.hedit); if (h) habitSheet(h); }
  });
}
function bindTodoRows(el, rerender) {
  el.addEventListener('click', e => {
    const c = e.target.closest('[data-tchk]'); if (c) { Todo.toggle(c.dataset.tchk); rerender(); return; }
    const ed = e.target.closest('[data-tedit]'); if (ed) { const t = Todo.list.find(x => x.id === ed.dataset.tedit); if (t) todoSheet(t); }
  });
}

/* ── ورقة العادة (إضافة/تعديل) ── */
function habitSheet(h) {
  const isNew = !h;
  const f = Object.assign({ name: '', ic: 'check', hue: 'emerald', target: 1, days: [], unit: '', rem: '', auto: '' }, h || {});
  const draw = () => '<div class="sh-t">' + (isNew ? 'عادة جديدة' : 'تعديل العادة') + '</div>' +
    (isNew ? '<div class="mx"><div class="faint" style="font-size:12.5px;margin-bottom:8px">اختر من الأمثلة أو أنشئ عادتك</div><div class="chips" id="hs-pre">' +
      HABIT_PRESETS.map((p, i) => '<button class="chip" data-p="' + i + '">' + icon(p.ic) + esc(p.name) + '</button>').join('') + '</div></div>' : '') +
    '<div class="mx form"><label>الاسم</label><input id="hs-n" maxlength="40" value="' + esc(f.name) + '" placeholder="مثال: قراءة صفحة من كتاب">' +
    (f.auto ? '<div class="note">' + icon('sparkle') + esc(AUTO[f.auto].t) + '</div>' : '') +
    '<label>الأيقونة واللون</label><div class="icgrid" id="hs-ic">' + HICONS.map(ic => '<button class="' + (ic === f.ic ? 'on' : '') + '" data-ic="' + ic + '">' + icon(ic) + '</button>').join('') + '</div>' +
    '<div class="hues" id="hs-hue">' + HHUES.map(hu => '<button class="' + (hu === f.hue ? 'on' : '') + '" data-hue="' + hu + '" style="' + hueVars(hu) + '"></button>').join('') + '</div>' +
    '<label>الهدف اليومي</label><div class="stepper"><button id="hs-m">' + icon('minus') + '</button><b class="num" id="hs-t">' + N(f.target) + '</b><button id="hs-p">' + icon('plus') + '</button>' +
    '<input id="hs-u" maxlength="12" value="' + esc(f.unit || '') + '" placeholder="الوحدة (مرة، صفحة…)"></div>' +
    '<label>الأيام</label><div class="wd" id="hs-d">' + WD1.map((x, i) => '<button class="' + (!f.days.length || f.days.includes(i) ? 'on' : '') + '" data-d="' + i + '">' + x + '</button>').join('') + '</div>' +
    '<label>تذكير (اختياري)</label><input type="time" id="hs-r" value="' + esc(f.rem || '') + '">' +
    '<div class="row" style="gap:10px;margin-top:16px"><button class="btn gold grow" id="hs-s">' + icon('check') + (isNew ? 'إضافة العادة' : 'حفظ') + '</button>' +
    (isNew ? '' : '<button class="btn ghost" id="hs-x" style="color:var(--bad)">' + icon('trash') + '</button>') + '</div></div>';
  Sheet.open(draw(), el => {
    const tg = () => { $('#hs-t', el).textContent = N(f.target); };
    const pre = $('#hs-pre', el);
    if (pre) pre.onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; const p = HABIT_PRESETS[+b.dataset.p];
      Object.assign(f, { name: p.name, ic: p.ic, hue: p.hue, target: p.target || 1, days: p.days ? p.days.slice() : [], unit: p.unit || '', auto: p.auto || '' });
      el.innerHTML = '<div class="grab"></div>' + draw(); bind(); };
    const bind = () => {
      $('#hs-n', el).oninput = e => { f.name = e.target.value; };
      $('#hs-ic', el).onclick = e => { const b = e.target.closest('[data-ic]'); if (!b) return; f.ic = b.dataset.ic; $$('#hs-ic button', el).forEach(x => x.classList.toggle('on', x === b)); };
      $('#hs-hue', el).onclick = e => { const b = e.target.closest('[data-hue]'); if (!b) return; f.hue = b.dataset.hue; $$('#hs-hue button', el).forEach(x => x.classList.toggle('on', x === b)); };
      $('#hs-m', el).onclick = () => { f.target = Math.max(1, f.target - (f.target > 20 ? 5 : 1)); tg(); };
      $('#hs-p', el).onclick = () => { f.target = Math.min(1000, f.target + (f.target >= 20 ? 5 : 1)); tg(); };
      $('#hs-u', el).oninput = e => { f.unit = e.target.value; };
      $('#hs-d', el).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; b.classList.toggle('on');
        const on = $$('#hs-d button', el).filter(x => x.classList.contains('on')).map(x => +x.dataset.d); f.days = on.length === 7 ? [] : on; };
      $('#hs-r', el).onchange = e => { f.rem = e.target.value; };
      $('#hs-s', el).onclick = () => {
        if (!f.name.trim()) { toast('اكتب اسم العادة'); return; }
        if (f.days.length === 0 && $$('#hs-d button.on', el).length === 0) { toast('اختر يومًا واحدًا على الأقل'); return; }
        const rec = { name: f.name.trim(), ic: f.ic, hue: f.hue, target: f.target, days: f.days, unit: f.unit.trim(), rem: f.rem, auto: f.auto };
        if (isNew) Habits.add(rec); else Habits.update(h.id, rec);
        Sheet.close(() => { toast(isNew ? 'أُضيفت العادة' : 'حُفظت التعديلات'); Router.refresh(); });
      };
      const x = $('#hs-x', el); if (x) x.onclick = () => { Habits.remove(h.id); Sheet.close(() => { toast('حُذفت العادة'); Router.refresh(); }); };
    };
    bind();
  });
}

/* ── ورقة المهمة (إضافة/تعديل) ── */
function todoSheet(t, preset) {
  const isNew = !t;
  const f = Object.assign({ t: '', note: '', due: dayKey(new Date()), time: '', pri: 0, list: 'personal' }, preset || {}, t || {});
  const tk = dayKey(new Date()), tm = dayKey(addDays(new Date(), 1));
  const html = '<div class="sh-t">' + (isNew ? 'مهمة جديدة' : 'تعديل المهمة') + '</div><div class="mx form">' +
    '<input id="ts-t" maxlength="90" value="' + esc(f.t) + '" placeholder="ماذا تريد أن تنجز؟" class="big">' +
    '<textarea id="ts-n" rows="2" maxlength="300" placeholder="ملاحظة (اختياري)">' + esc(f.note || '') + '</textarea>' +
    '<label>الموعد</label><div class="chips" id="ts-dq"><button class="chip" data-v="' + tk + '">اليوم</button><button class="chip" data-v="' + tm + '">غدًا</button><button class="chip" data-v="">بدون موعد</button></div>' +
    '<div class="row" style="gap:10px;margin-top:8px"><input type="date" id="ts-d" value="' + esc(f.due || '') + '" class="grow"><input type="time" id="ts-h" value="' + esc(f.time || '') + '" class="grow"></div>' +
    '<label>الأولوية</label><div class="seg" id="ts-p"><button data-v="0">عادية</button><button data-v="1">مهمة</button><button data-v="2">عاجلة</button></div>' +
    '<label>القائمة</label><div class="chips" id="ts-l">' + Todo.LISTS.map(([k, n, hu]) => '<button class="chip" data-v="' + k + '" style="' + hueVars(hu) + '">' + esc(n) + '</button>').join('') + '</div>' +
    '<div class="row" style="gap:10px;margin-top:16px"><button class="btn gold grow" id="ts-s">' + icon('check') + (isNew ? 'إضافة' : 'حفظ') + '</button>' +
    (isNew ? '' : '<button class="btn ghost" id="ts-x" style="color:var(--bad)">' + icon('trash') + '</button>') + '</div></div>';
  Sheet.open(html, el => {
    const mark = () => {
      $$('#ts-dq .chip', el).forEach(b => b.classList.toggle('on', b.dataset.v === (f.due || '')));
      $$('#ts-p button', el).forEach(b => b.classList.toggle('on', +b.dataset.v === (f.pri || 0)));
      $$('#ts-l .chip', el).forEach(b => b.classList.toggle('on', b.dataset.v === f.list));
      $('#ts-d', el).value = f.due || '';
    };
    mark();
    $('#ts-dq', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; f.due = b.dataset.v; if (!f.due) f.time = '', $('#ts-h', el).value = ''; mark(); };
    $('#ts-d', el).onchange = e => { f.due = e.target.value; mark(); };
    $('#ts-h', el).onchange = e => { f.time = e.target.value; if (f.time && !f.due) { f.due = tk; mark(); } };
    $('#ts-p', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; f.pri = +b.dataset.v; mark(); };
    $('#ts-l', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; f.list = b.dataset.v; mark(); };
    $('#ts-s', el).onclick = () => {
      f.t = $('#ts-t', el).value.trim(); f.note = $('#ts-n', el).value.trim();
      if (!f.t) { toast('اكتب عنوان المهمة'); return; }
      const rec = { t: f.t, note: f.note, due: f.due || '', time: f.due ? (f.time || '') : '', pri: f.pri || 0, list: f.list };
      if (isNew) Todo.add(rec); else Todo.update(t.id, rec);
      Sheet.close(() => { toast(isNew ? 'أُضيفت المهمة' : 'حُفظت المهمة'); Router.refresh(); });
    };
    const x = $('#ts-x', el); if (x) x.onclick = () => { Todo.remove(t.id); Sheet.close(() => { toast('حُذفت المهمة'); Router.refresh(); }); };
    if (isNew) setTimeout(() => { const i = $('#ts-t', el); if (i) i.focus(); }, 350);
  });
}

/* ═══════════════ شاشة العادات ═══════════════ */
SCREENS.habits = {
  parent: 'more',
  render() {
    Habits.syncAuto();
    const d = new Date(), today = Habits.today(d), others = Habits.active().filter(h => !Habits.due(h, d));
    const done = today.filter(h => Habits.done(h, d)).length;
    const week = Array.from({ length: 7 }, (_, i) => addDays(d, i - 6));
    const grid = Habits.active().length ? '<div class="hgrid">' + '<div class="hg-h"><span></span>' + week.map(x => '<span>' + WD1[x.getDay()] + '</span>').join('') + '</div>' +
      Habits.active().map(h => '<div class="hg-r"><span class="n">' + esc(h.name) + '</span>' + week.map(x => '<span class="c ' + (!Habits.due(h, x) ? 'off' : Habits.done(h, x) ? 'ok' : '') + '"></span>').join('') + '</div>').join('') + '</div>' : '';
    return hdr('العادات', N(done) + ' من ' + N(today.length) + ' لليوم', { back: true, compact: true, actions: [{ id: 'hb-add', icon: 'plus', label: 'عادة جديدة' }] }) +
      (today.length ? '<div class="hc mt"><div class="row" style="gap:14px;align-items:center"><div class="kring">' + ringSVG(70, 7, today.length ? done / today.length : 0, 'var(--ok)') + '<span class="num">' + N(done) + '/' + N(today.length) + '</span></div>' +
        '<div class="grow"><div style="font-weight:700">' + (done === today.length ? 'أتممت عاداتك اليوم' : 'واصل — كل عادة تسقي بستانك') + '</div><div class="muted" style="font-size:13px">+' + N(XP.hab) + ' نقاط لكل عادة مكتملة</div></div></div></div>' : '') +
      sec('عادات اليوم') + (today.length ? '<div class="hlist mx" id="hb-l">' + today.map(h => habitRow(h, d)).join('') + '</div>' :
        '<div class="emptyc mx"><div class="ic">' + icon('target') + '</div><div class="t">ابدأ بعادة صغيرة</div><div class="s">«أحبّ الأعمال إلى الله أدومها وإن قلّ»</div><button class="btn gold" id="hb-add2">' + icon('plus') + 'أضف عادة</button></div>') +
      (others.length ? sec('ليست مجدولة اليوم') + '<div class="hlist mx dim" id="hb-o">' + others.map(h => habitRow(h, d)).join('') + '</div>' : '') +
      (grid ? sec('آخر سبعة أيام') + '<div class="hc">' + grid + '</div>' : '') +
      (Habits.active().length ? sec('معدّل الالتزام · ٣٠ يومًا') + '<div class="list mx">' + Habits.active().map(h => { const r = Habits.rate(h, 30);
        return '<div class="li"><div class="ic" style="' + hueVars(h.hue) + '">' + icon(h.ic) + '</div><div class="grow"><div class="t">' + esc(h.name) + '</div><div class="hbar"><i style="width:' + (r * 100).toFixed(0) + '%"></i></div></div><div class="end num" style="font-weight:700">' + N(Math.round(r * 100)) + '٪</div></div>'; }).join('') + '</div>' : '');
  },
  mount(el) {
    const add = () => habitSheet(null);
    const a = $('#hb-add', el); if (a) a.onclick = add; const a2 = $('#hb-add2', el); if (a2) a2.onclick = add;
    ['#hb-l', '#hb-o'].forEach(id => { const l = $(id, el); if (l) bindHabitRows(l, () => Router.refresh()); });
  },
};

/* ═══════════════ شاشة المهام ═══════════════ */
const TS = { tab: 'today' };
SCREENS.todo = {
  parent: 'more',
  render() {
    const cnt = { today: Todo.list.filter(Todo.fToday).length, next: Todo.list.filter(Todo.fNext).length, done: Todo.list.filter(Todo.fDone).length };
    const arr = Todo.sorted(TS.tab === 'today' ? Todo.fToday : TS.tab === 'next' ? Todo.fNext : Todo.fDone);
    const tabs = [['today', 'اليوم'], ['next', 'القادمة'], ['done', 'المنجزة']];
    return hdr('المهام', cnt.today ? N(cnt.today) + ' مهمة لليوم' : 'نظّم يومك وبارك الله في وقتك', { back: true, compact: true, actions: [{ id: 'td-add', icon: 'plus', label: 'مهمة جديدة' }] }) +
      '<div class="mx mt"><div class="quickadd"><input id="td-q" maxlength="90" placeholder="أضف مهمة سريعة لليوم…"><button id="td-qb" aria-label="إضافة">' + icon('plus') + '</button></div></div>' +
      '<div class="mx" style="margin-top:12px"><div class="seg" id="td-tabs">' + tabs.map(([k, n]) => '<button data-v="' + k + '" class="' + (TS.tab === k ? 'on' : '') + '">' + n + (cnt[k] ? ' <span class="num">' + N(cnt[k]) + '</span>' : '') + '</button>').join('') + '</div></div>' +
      (arr.length ? '<div class="tlist mx mt" id="td-l">' + arr.map(todoRow).join('') + '</div>' +
        (TS.tab === 'done' ? '<div class="center" style="margin-top:12px"><button class="btn ghost" id="td-clr">' + icon('trash') + 'مسح المنجزة</button></div>' : '') :
        '<div class="emptyc mx mt"><div class="ic">' + icon(TS.tab === 'done' ? 'check' : 'list') + '</div><div class="t">' + (TS.tab === 'done' ? 'لا مهام منجزة بعد' : TS.tab === 'next' ? 'لا مهام قادمة' : 'لا مهام لليوم') + '</div>' +
        '<div class="s">' + (TS.tab === 'done' ? 'أنجز مهمة لتظهر هنا' : 'أضف مهمة وحدّد لها موعدًا وتذكيرًا') + '</div></div>');
  },
  mount(el) {
    $('#td-add', el).onclick = () => todoSheet(null, TS.tab === 'next' ? { due: dayKey(addDays(new Date(), 1)) } : null);
    $('#td-tabs', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; TS.tab = b.dataset.v; Router.refresh(); };
    const q = $('#td-q', el), qa = () => { const v = q.value.trim(); if (!v) return; Todo.add({ t: v, note: '', due: dayKey(new Date()), time: '', pri: 0, list: 'personal' }); q.value = ''; TS.tab = 'today'; Router.refresh(); };
    $('#td-qb', el).onclick = qa; q.addEventListener('keydown', e => { if (e.key === 'Enter') qa(); });
    const l = $('#td-l', el); if (l) bindTodoRows(l, () => Router.refresh());
    const c = $('#td-clr', el); if (c) c.onclick = () => { Todo.clearDone(); Router.refresh(); };
  },
};

window.Habits = Habits; window.Todo = Todo;

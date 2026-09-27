/* ════════════════════════════════════════════════════════════════
   وسن 4.3 · رمضان — متابعة الصيام يومًا بيوم
   ─ بطاقة في الرئيسية طوال الشهر: الإمساك والإفطار وعدّ تنازلي حيّ.
   ─ «صمت اليوم» يسقي البستان · «أفطرت لعذر» يُضيف يومًا إلى قضاء الصيام.
   ─ قبل رمضان بثلاثين يومًا: بطاقة «اللهم بلّغنا رمضان».
   ════════════════════════════════════════════════════════════════ */
'use strict';
const Ramadan = {
  d: null,
  load() { if (!this.d) this.d = Object.assign({ y: {} }, Store.get('ramadan', {})); if (!this.d.y) this.d.y = {}; return this.d; },
  save() { Store.set('ramadan', this.d); Bus.emit('ramadan'); },
  get(hy, day) { const y = this.load().y[hy]; return (y && y[day]) || 0; },
  /** v: 1 صمت · -1 أفطر لعذر (يُضاف للقضاء) · 0 بلا تسجيل */
  set(hy, day, v) {
    const d = this.load(), y = d.y[hy] || (d.y[hy] = {}), prev = y[day] || 0;
    if (prev === v) return;
    if (prev === 1) Growth.add('rs', -1);
    if (prev === -1 && typeof Qada !== 'undefined') Qada.addOwed('sawm', -1);
    if (v) y[day] = v; else delete y[day];
    this.save();
    if (v === 1) Growth.add('rs', 1);
    if (v === -1 && typeof Qada !== 'undefined') Qada.addOwed('sawm', 1);
  },
  count(hy, v) { const y = this.load().y[hy] || {}; return Object.keys(y).filter(k => y[k] === v).length; },
  total() { const d = this.load(); let n = 0; Object.keys(d.y).forEach(hy => { n += this.count(hy, 1); }); return n; },
};
/* أوقات البطاقة: الإمساك · الإفطار · وجهة العدّ التنازلي */
function ramadanTarget(now) {
  const t = Times.forDay(now);
  if (now < t.imsak) return { l: 'على الإمساك', at: t.imsak };
  if (now < t.maghrib) return { l: 'على الإفطار', at: t.maghrib };
  const d2 = addDays(now, 1), h2 = hijriOf(d2);
  if (h2.month === 9) return { l: 'على إمساك الغد', at: Times.forDay(d2).imsak };
  return { l: 'عيد مبارك', at: null };
}
function ramadanCard(now) {
  const h = hijriOf(now);
  if (h.month !== 9) {
    const nr = typeof nextRamadan === 'function' ? nextRamadan(now) : null;
    if (!nr || nr.now || nr.days > 30) return '';
    return '<button class="hc mt rmd rmd-soon" data-go="calendar"><div class="row"><div class="rmd-moon">' + icon('moonstar') + '</div>' +
      '<div class="grow"><div class="rmd-t">' + (nr.days === 1 ? 'رمضان غدًا بإذن الله' : 'رمضان بعد ' + pD(nr.days)) + '</div>' +
      '<div class="rmd-s">«اللهم بلّغنا رمضان» — هيّئ قلبك ونيّتك، واقضِ ما عليك من صيام</div></div>' + icon('chev', 'faint') + '</div></button>';
  }
  const days = NoorEngine.hijriMonthDays(now, Settings.hijriOffset), n = days.length || 30, t = Times.forDay(now), tg = ramadanTarget(now);
  const st = Ramadan.get(h.year, h.day), fasted = Ramadan.count(h.year, 1), exc = Ramadan.count(h.year, -1);
  const cells = Array.from({ length: n }, (_, i) => { const dd = i + 1, v = Ramadan.get(h.year, dd);
    return '<button class="rmd-c' + (v === 1 ? ' f' : v === -1 ? ' x' : '') + (dd === h.day ? ' t' : '') + (dd > h.day ? ' fu' : '') + '" data-rd="' + dd + '"' + (dd > h.day ? ' disabled' : '') + '>' + N(dd) + '</button>'; }).join('');
  return '<div class="hc mt rmd" id="h-rmd"><div class="row rmd-top"><div class="rmd-moon">' + icon('moonstar') + '</div>' +
    '<div class="grow"><div class="rmd-t">رمضان كريم · اليوم ' + N(h.day) + '</div>' +
    '<div class="rmd-s">' + ([fasted ? 'صمت ' + pD(fasted) : '', exc ? pD(exc) + ' للقضاء' : ''].filter(Boolean).join(' · ') || 'سجّل صيامك يومًا بيوم') + '</div></div></div>' +
    '<div class="rmd-times"><div><span>الإمساك</span><b class="num">' + fmtTime(t.imsak) + '</b></div>' +
    '<div class="rmd-cd"><span id="h-rmd-l">' + tg.l + '</span><b class="num" id="h-rmd-cd">' + (tg.at ? fmtCountdown(tg.at - now) : '') + '</b></div>' +
    '<div><span>الإفطار</span><b class="num">' + fmtTime(t.maghrib) + '</b></div></div>' +
    '<div class="rmd-acts"><button class="rmd-b' + (st === 1 ? ' on' : '') + '" data-rs="1">' + icon('check') + (st === 1 ? 'صمت اليوم — تقبّل الله' : 'صمت اليوم') + '</button>' +
    '<button class="rmd-b alt' + (st === -1 ? ' on' : '') + '" data-rs="-1">' + (st === -1 ? 'أفطرت لعذر · للقضاء' : 'أفطرت لعذر') + '</button></div>' +
    '<div class="rmd-grid">' + cells + '</div></div>';
}
function bindRamadanCard(box) {
  const card = box && box.querySelector('#h-rmd'); if (!card) return;
  const redraw = () => { const c = $('#h-rmd'); if (c) { c.outerHTML = ramadanCard(new Date()); bindRamadanCard(box); } };
  card.addEventListener('click', e => {
    const now = new Date(), h = hijriOf(now);
    const b = e.target.closest('[data-rs]');
    if (b) {
      const v = +b.dataset.rs, cur = Ramadan.get(h.year, h.day);
      if (cur === v) { Ramadan.set(h.year, h.day, 0); redraw(); return; }
      if (v === -1) { confirmSheet('أفطرت اليوم لعذر؟', 'سيُضاف يوم إلى «قضاء الصيام» لتقضيه بعد رمضان. يمكنك التراجع بلمس الزر مرة أخرى.', 'نعم، أضِفه للقضاء', () => { Ramadan.set(h.year, h.day, -1); redraw(); }); return; }
      Ramadan.set(h.year, h.day, 1); vibrate(25); toast('تقبّل الله صيامك'); redraw(); return;
    }
    const c = e.target.closest('[data-rd]'); if (!c || c.disabled) return;
    const dd = +c.dataset.rd, cur = Ramadan.get(h.year, dd);
    pickSheet('اليوم ' + N(dd) + ' من رمضان', '', [{ v: 1, t: 'صمتُ هذا اليوم' }, { v: -1, t: 'أفطرتُ لعذر', s: 'يُضاف يوم إلى قضاء الصيام' }, { v: 0, t: 'بلا تسجيل' }], cur,
      v => { Ramadan.set(h.year, dd, v); redraw(); });
  });
}
function tickRamadan(now) {
  const el = $('#h-rmd-cd'); if (!el) return;
  const tg = ramadanTarget(now), l = $('#h-rmd-l');
  if (l && l.textContent !== tg.l) l.textContent = tg.l;
  el.textContent = tg.at ? fmtCountdown(tg.at - now) : '';
}
window.Ramadan = Ramadan;

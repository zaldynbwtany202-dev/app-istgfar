/* ════════════════════════════════════════════════════════════════
   وسن 4.8 · «المنبّه»
   ─ منبّهات بوقت ثابت وأيام تكرار + منبّهات إسلامية تتبع مواقيتك كل يوم:
     «قبل الفجر» بفارق تختارينه، و«قيام الليل» مع بداية الثلث الأخير.
   ─ يرنّ في الهاتف بشاشة كاملة فوق القفل، بصوت يعلو تدريجيًّا، مع «غفوة» و«إيقاف».
   ─ الجدولة والرنين في النواة الأصلية (WasanAlarm.kt) فيعمل والتطبيق مغلق.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const ALARM_SOUNDS = [
  ['g', 'بصوت بشري'], ['voice:sl', '«اللهم صلّ وسلّم على نبينا محمد»'], ['voice:is', '«أستغفر الله وأتوب إليه»'], ['voice:tk', '«الله أكبر، الله أكبر»'],
  ['g', 'التكبير (مقطع قصير يتكرّر)'], ['takbir:v1', 'تكبير · أذان هادئ'], ['takbir:v2', 'تكبير · المسجد النبوي'], ['takbir:v3', 'تكبير · صباح فخري'], ['takbir:v4', 'تكبير · أذان صافٍ'], ['takbir:v5', 'تكبير · أذان خاشع'],
  ['g', 'الأذان كاملًا'], ['adhan:v1', 'أذان هادئ'], ['adhan:v2', 'من المسجد النبوي'], ['adhan:v3', 'صباح فخري'], ['adhan:v4', 'أذان صافٍ'], ['adhan:v5', 'أذان خاشع'],
  ['g', 'أصوات الطبيعة الهادئة'], ['amb:birds', 'زقزقة العصافير'], ['amb:stream', 'جدول ماء'], ['amb:rain', 'مطر هادئ'], ['amb:waves', 'أمواج البحر'],
  ['g', 'نغمات'], ['chime', 'نغمة وسن'], ['tone', 'نغمة منبّه الهاتف'],
];
const alarmSoundName = v => (ALARM_SOUNDS.find(x => x[0] === v) || [0, 'نغمة منبّه الهاتف'])[1];
const ALARM_DEF = () => [
  { id: 'fajr', type: 'fajr', off: -20, on: false, label: 'منبّه الفجر', sound: 'takbir:v1', days: [], vib: true, ramp: true, snooze: 5, ring: 5 },
  { id: 'qiyam', type: 'qiyam', off: 0, on: false, label: 'قيام الليل', sound: 'amb:stream', days: [], vib: true, ramp: true, snooze: 10, ring: 3 },
];
const Alarms = {
  list: Store.get('alarms', null) || ALARM_DEF(),
  next: {},
  save() { Store.set('alarms', this.list); this.sync(); Bus.emit('alarms'); },
  sync() { if (Native.has('setAlarms')) Native.call('setAlarms', JSON.stringify(this.list)); },
  /** يقرأ الحالة من الهاتف: المنبّه غير المتكرر يتوقف بعد رنينه، والمواعيد التالية */
  pull() {
    if (!Native.has('alarmState')) return;
    try { const s = JSON.parse(Native.call('alarmState') || '{}'); this.next = s.next || {};
      (s.list || []).forEach(n => { const a = this.list.find(x => x.id === n.id); if (a && a.on !== n.on) a.on = n.on; }); Store.set('alarms', this.list); } catch (e) {}
  },
  get(id) { return this.list.find(x => x.id === id); },
  upd(id, patch) { const a = this.get(id); if (a) Object.assign(a, patch); this.save(); },
  add(a) { a.id = uid(); this.list.push(a); this.save(); return a; },
  remove(id) { this.list = this.list.filter(x => x.id !== id); this.save(); },
  /** الموعد التالي محسوبًا في الواجهة (للعرض) */
  at(a, now) {
    now = now || new Date(); if (!a.on) return null;
    const nat = this.next[a.id]; if (nat && nat > now.getTime()) return new Date(nat);
    for (let i = -1; i <= 9; i++) {
      const d = addDays(now, i); let at;
      try {
        if (a.type === 'fajr') { const t = Times.forDay(d); if (!t.fajr) continue; at = new Date(t.fajr.getTime() + (a.off || 0) * 60000); }
        else if (a.type === 'qiyam') { const t = Times.forDay(d); if (!t.lastThird) continue; at = new Date(t.lastThird.getTime() + (a.off || 0) * 60000); }
        else { const [h, m] = (a.time || '06:00').split(':').map(Number); at = new Date(d); at.setHours(h, m, 0, 0); }
      } catch (e) { continue; }
      if (at <= now) continue;
      if (a.days && a.days.length && !a.days.includes(at.getDay())) continue;
      return at;
    }
    return null;
  },
  soonest() { const now = new Date(); let best = null; this.list.forEach(a => { const t = this.at(a, now); if (t && (!best || t < best.t)) best = { a, t }; }); return best; },
};
setTimeout(() => { try { Alarms.pull(); Alarms.sync(); } catch (e) {} }, 1800);
Bus.on('resume', () => { try { Alarms.pull(); if (Router.cur && Router.cur.r === 'alarms') Router.refresh(); } catch (e) {} });

const alarmDays = a => !a.days || !a.days.length ? (a.type === 'fixed' ? 'مرة واحدة' : 'كل يوم') : a.days.length === 7 ? 'كل يوم' :
  (a.days.length === 5 && [0, 1, 2, 3, 4].every(x => a.days.includes(x)) ? 'الأحد إلى الخميس' : WDAYS.filter(([d]) => a.days.includes(d)).map(w => w[1]).join('، '));
const offTxt = (m, what) => !m ? 'مع ' + what : (m < 0 ? 'قبل ' : 'بعد ') + what + ' بـ' + pM(Math.abs(m));
function untilTxt(t) { const ms = t - Date.now(), h = Math.floor(ms / 3600000), m = Math.round((ms % 3600000) / 60000); return 'بعد ' + (h ? pH(h) + (m ? ' و' + pM(m) : '') : pM(Math.max(1, m))); }

function alarmSheet(a, preset) {
  const isNew = !a;
  const f = Object.assign({ type: 'fixed', time: '06:30', label: '', days: [], on: true, sound: 'amb:birds', vib: true, ramp: true, snooze: 5, ring: 5, off: -20, msg: '' }, preset || {}, a || {});
  const draw = () => '<div class="sh-t">' + (isNew ? 'منبّه جديد' : f.type === 'fajr' ? 'منبّه الفجر' : f.type === 'qiyam' ? 'منبّه قيام الليل' : 'تعديل المنبّه') + '</div><div class="mx form">' +
    (f.type === 'fixed' ? '<input type="time" id="al-t" class="field big al-time" value="' + esc(f.time) + '">' :
      '<label>' + (f.type === 'fajr' ? 'الفارق عن أذان الفجر' : 'الفارق عن بداية الثلث الأخير') + '</label><div class="stepper"><button id="al-m">' + icon('minus') + '</button><b class="num" id="al-o">' + esc(offTxt(f.off, f.type === 'fajr' ? 'الفجر' : 'الثلث الأخير')) + '</b><button id="al-p">' + icon('plus') + '</button></div>') +
    '<label>الاسم</label><input id="al-l" maxlength="30" value="' + esc(f.label) + '" placeholder="مثال: الاستيقاظ للدراسة">' +
    '<label>التكرار</label><div class="wdp" id="al-d">' + WDAYS.map(([d, t]) => '<button class="' + (f.days.includes(d) ? 'on' : '') + '" data-d="' + d + '">' + t.slice(0, 2) + '</button>').join('') + '</div>' +
    '<div class="chips" id="al-dq" style="padding:6px 0 0"><button class="chip" data-q="all">كل يوم</button><button class="chip" data-q="wk">الأحد–الخميس</button>' + (f.type === 'fixed' ? '<button class="chip" data-q="once">مرة واحدة</button>' : '') + '</div>' +
    '<label>الصوت</label><button class="li al-snd" id="al-s"><div class="ic">' + icon('vol') + '</div><div class="grow"><div class="t" id="al-sn">' + esc(alarmSoundName(f.sound)) + '</div><div class="s">يعلو الصوت تدريجيًّا ليوقظك بلطف</div></div>' + icon('chev', 'faint') + '</button>' +
    '<label>الغفوة</label><div class="seg" id="al-z">' + [5, 10, 15].map(v => '<button data-v="' + v + '" class="' + (f.snooze === v ? 'on' : '') + '">' + N(v) + ' د</button>').join('') + '</div>' +
    '<div class="list" style="margin-top:12px"><div class="li"><div class="ic">' + icon('vib') + '</div><div class="grow"><div class="t">اهتزاز</div></div><button class="switch ' + (f.vib ? 'on' : '') + '" id="al-v"></button></div>' +
    '<div class="li"><div class="ic">' + icon('wave') + '</div><div class="grow"><div class="t">صوت يعلو تدريجيًّا</div></div><button class="switch ' + (f.ramp ? 'on' : '') + '" id="al-r"></button></div></div>' +
    '<div class="row" style="gap:10px;margin-top:16px"><button class="btn gold grow" id="al-ok">' + icon('check') + (isNew ? 'إضافة المنبّه' : 'حفظ') + '</button>' +
    '<button class="btn ghost" id="al-try">' + icon('play') + 'جرّبي</button>' + (!isNew && f.type === 'fixed' ? '<button class="btn ghost" id="al-x" style="color:var(--bad)">' + icon('trash') + '</button>' : '') + '</div></div>';
  Sheet.open(draw(), el => {
    const oT = () => { const o = $('#al-o', el); if (o) o.textContent = offTxt(f.off, f.type === 'fajr' ? 'الفجر' : 'الثلث الأخير'); };
    const qOf = () => f.days.length === 7 ? 'all' : (f.days.length === 5 && [0, 1, 2, 3, 4].every(x => f.days.includes(x))) ? 'wk' : !f.days.length ? 'once' : '';
    const mk = () => { $$('#al-d button', el).forEach(b => b.classList.toggle('on', f.days.includes(+b.dataset.d))); const q = qOf(); $$('#al-dq [data-q]', el).forEach(b => b.classList.toggle('on', b.dataset.q === q)); };
    mk();
    const t = $('#al-t', el); if (t) t.onchange = e => { f.time = e.target.value || f.time; };
    const m = $('#al-m', el); if (m) m.onclick = () => { f.off = Math.max(f.type === 'fajr' ? -90 : -60, f.off - 5); oT(); };
    const p = $('#al-p', el); if (p) p.onclick = () => { f.off = Math.min(f.type === 'fajr' ? 30 : 90, f.off + 5); oT(); };
    $('#al-l', el).oninput = e => { f.label = e.target.value; };
    $('#al-d', el).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; const d = +b.dataset.d; f.days = f.days.includes(d) ? f.days.filter(x => x !== d) : f.days.concat(d); if (f.days.length === 7) f.days = [0, 1, 2, 3, 4, 5, 6]; mk(); };
    $('#al-dq', el).onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; f.days = b.dataset.q === 'all' ? [0, 1, 2, 3, 4, 5, 6] : b.dataset.q === 'wk' ? [0, 1, 2, 3, 4] : []; mk(); };
    $('#al-z', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; f.snooze = +b.dataset.v; $$('#al-z button', el).forEach(x => x.classList.toggle('on', x === b)); };
    $('#al-v', el).onclick = e => { f.vib = !f.vib; e.currentTarget.classList.toggle('on', f.vib); };
    $('#al-r', el).onclick = e => { f.ramp = !f.ramp; e.currentTarget.classList.toggle('on', f.ramp); };
    $('#al-s', el).onclick = () => alarmSoundSheet(f.sound, v => { f.sound = v; const n = $('#al-sn', el); if (n) n.textContent = alarmSoundName(v); });
    $('#al-try', el).onclick = () => { if (!Native.has('testAlarm')) { toast('تجربة الرنين تعمل في التطبيق على الهاتف'); return; } Native.call('testAlarm', JSON.stringify(Object.assign({}, f, { label: f.label || 'تجربة المنبّه', ring: 1 }))); };
    $('#al-ok', el).onclick = () => {
      const rec = { type: f.type, time: f.time, label: f.label.trim() || (f.type === 'fajr' ? 'منبّه الفجر' : f.type === 'qiyam' ? 'قيام الليل' : 'المنبّه'), days: f.days.length === 7 ? [] : f.days, on: true, sound: f.sound, vib: f.vib, ramp: f.ramp, snooze: f.snooze, ring: f.ring, off: f.off };
      if (f.type !== 'fixed' && f.days.length === 7) rec.days = [];
      if (isNew) Alarms.add(rec); else Alarms.upd(a.id, rec);
      const nx = Alarms.at(Object.assign({}, rec, { id: isNew ? '' : a.id }));
      Sheet.close(() => { toast(nx ? 'سيرنّ المنبّه ' + untilTxt(nx) : 'حُفظ المنبّه'); Router.refresh(); });
    };
    const x = $('#al-x', el); if (x) x.onclick = () => { Alarms.remove(a.id); Sheet.close(() => { toast('حُذف المنبّه'); Router.refresh(); }); };
  });
}
function alarmSoundSheet(cur, pick) {
  let au = null;
  const stop = () => { try { if (au) au.pause(); } catch (e) {} au = null; };
  const html = '<div class="sh-t">صوت المنبّه</div><div class="sh-s">اضغطي ▶ لسماع الأصوات المتاحة داخل التطبيق</div><div class="list mx al-sl">' + ALARM_SOUNDS.map(([v, t]) => v === 'g' ? '<div class="al-sg">' + t + '</div>' :
    '<div class="li opt ' + (v === cur ? 'on' : '') + '" data-v="' + v + '"><div class="grow"><div class="t">' + esc(t) + '</div></div>' + (/^(amb|voice):/.test(v) ? '<button class="act pv" data-pv="' + v + '" aria-label="استماع">' + icon('play') + '</button>' : '') + '<span class="rad"></span></div>').join('') + '</div>';
  Sheet.open(html, el => {
    el.addEventListener('click', e => {
      const pv = e.target.closest('[data-pv]');
      if (pv) { e.stopPropagation(); const v = pv.dataset.pv; stop(); const [k, n] = v.split(':'); au = new Audio(k === 'amb' ? 'snd/amb_' + n + '.ogg' : 'snd/dhikr/' + n + '.ogg'); au.volume = .9; const p = au.play(); if (p && p.catch) p.catch(() => {}); setTimeout(stop, 9000); return; }
      const o = e.target.closest('[data-v]'); if (!o) return; stop(); pick(o.dataset.v); Sheet.close();
    });
  }, stop);
}
SCREENS.alarms = {
  parent: 'more',
  render() {
    Alarms.pull();
    const now = new Date(), s = Alarms.soonest(), isl = Alarms.list.filter(a => a.type !== 'fixed'), mine = Alarms.list.filter(a => a.type === 'fixed');
    const ex = Native.has('canExactAlarm') ? !!Native.call('canExactAlarm') : true, fs = Native.has('canFullScreen') ? !!Native.call('canFullScreen') : true;
    const card = a => { const t = Alarms.at(a.on ? a : Object.assign({}, a, { on: true }), now), w = a.type === 'fajr' ? 'الفجر' : a.type === 'qiyam' ? 'الثلث الأخير' : '';
      return '<div class="alc' + (a.on ? ' on' : '') + '" data-al="' + a.id + '"><div class="grow" data-ed="' + a.id + '"><div class="al-h"><b class="num">' + (a.type === 'fixed' ? fmtClock(a.time) : (t ? fmtTime(t) : '—')) + '</b>' +
        (a.type !== 'fixed' ? '<span class="al-k">' + icon(a.type === 'fajr' ? 'fajr' : 'moonstar') + esc(offTxt(a.off, w)) + '</span>' : '') + '</div>' +
        '<div class="al-n">' + esc(a.label) + '</div><div class="al-s">' + esc(alarmDays(a)) + ' · ' + esc(alarmSoundName(a.sound)) + (a.on && t ? ' · ' + untilTxt(t) : ' · متوقّف') + '</div></div>' +
        '<button class="switch ' + (a.on ? 'on' : '') + '" data-sw="' + a.id + '" aria-label="تفعيل"></button></div>'; };
    return hdr('المنبّه', s ? 'التالي ' + untilTxt(s.t) : 'منبّهات تتبع مواقيتك', { back: true, compact: true, actions: [{ id: 'al-add', icon: 'plus', label: 'منبّه جديد' }] }) +
      '<div class="hc mt al-hero"><div class="al-hi">' + icon('alarm') + '</div><div class="grow"><div class="t">' + (s ? esc(s.a.label) + ' · ' + fmtTime(s.t) : 'لا منبّه مفعّل') + '</div>' +
        '<div class="s">' + (s ? untilTxt(s.t) + ' — ' + (s.t.toDateString() === now.toDateString() ? 'اليوم' : 'غدًا أو بعده') : 'فعّلي منبّه الفجر ليوقظك قبل الأذان كل يوم') + '</div></div></div>' +
      (!ex ? '<div class="li pz-warn mx mt"><div class="ic">' + icon('warn') + '</div><div class="grow"><div class="t">اسمحي بالمنبّهات الدقيقة</div><div class="s">كي يرنّ المنبّه في وقته تمامًا</div></div><button class="act" id="al-ex">السماح</button></div>' : '') +
      (!fs ? '<div class="li pz-warn mx mt"><div class="ic">' + icon('warn') + '</div><div class="grow"><div class="t">اسمحي بالشاشة الكاملة</div><div class="s">لتظهر شاشة المنبّه فوق قفل الهاتف</div></div><button class="act" id="al-fs">السماح</button></div>' : '') +
      sec('منبّهات تتبع المواقيت') + '<div class="mx al-list">' + isl.map(card).join('') + '</div>' +
      sec('منبّهاتي') + '<div class="mx al-list">' + (mine.length ? mine.map(card).join('') : '<button class="emptyc" id="al-add2" style="width:100%"><div class="ic">' + icon('alarm') + '</div><div class="t">أضيفي منبّهًا</div><div class="s">للاستيقاظ أو الدراسة أو أي موعد — مع أيام التكرار</div></button>') + '</div>' +
      '<div class="pz-foot mx">' + icon('info') + '<span>منبّه الفجر وقيام الليل يتغيّران كل يوم مع مواقيت مدينتك. يرنّ المنبّه حتى لو كان الهاتف صامتًا (على مستوى صوت المنبّه).</span></div>';
  },
  mount(el) {
    const add = () => alarmSheet(null);
    $('#al-add', el).onclick = add; const a2 = $('#al-add2', el); if (a2) a2.onclick = add;
    const e1 = $('#al-ex', el); if (e1) e1.onclick = () => Native.call('requestExactAlarm');
    const e2 = $('#al-fs', el); if (e2) e2.onclick = () => Native.call('requestFullScreen');
    el.addEventListener('click', e => {
      const sw = e.target.closest('[data-sw]');
      if (sw) { const a = Alarms.get(sw.dataset.sw); if (!a) return; Alarms.upd(a.id, { on: !a.on }); if (!a.on) {} const t = Alarms.at(a); if (a.on && t) toast('سيرنّ ' + untilTxt(t)); if (a.on) Native.call('ensureNotifPermission'); Router.refresh(); return; }
      const ed = e.target.closest('[data-ed]'); if (ed) { const a = Alarms.get(ed.dataset.ed); if (a) alarmSheet(a); }
    });
  },
};
window.Alarms = Alarms;

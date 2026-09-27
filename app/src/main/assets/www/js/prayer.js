/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · الموقع · المواقيت · متابعة الصلوات · التنبيهات
   ════════════════════════════════════════════════════════════════ */
'use strict';

const FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PNAME = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
  midnight: 'منتصف الليل', lastThird: 'الثلث الأخير من الليل', imsak: 'الإمساك' };
const PICON = { fajr: 'fajr', sunrise: 'sunrise', dhuhr: 'sun', asr: 'asr', maghrib: 'sunset', isha: 'isha', midnight: 'moon', lastThird: 'moonstar', imsak: 'clock' };
const pname = (k, d) => (k === 'dhuhr' && d && d.getDay() === 5) ? 'الجمعة' : PNAME[k];
const DEFAULT_LOC = { lat: 21.4225, lng: 39.8262, label: 'مكة المكرمة', cc: 'SA', src: 'default' };

/* ───────── الموقع ───────── */
const Loc = {
  _v: Store.get('loc', null),
  get() { return this._v; },
  eff() { return this._v || DEFAULT_LOC; },
  set(v, silent) {
    this._v = v; Store.set('loc', v); Times.clear();
    if (!silent) Bus.emit('loc', v);
    Notif.schedule();
  },
  nearest(lat, lng) {
    let best = null, bd = 1e9;
    (window.NOOR_CITIES || []).forEach(c => { const d = NoorEngine.distanceKm(lat, lng, c[2], c[3]); if (d < bd) { bd = d; best = c; } });
    return best ? { name: best[0], cc: best[1], d: bd } : null;
  },
  fromCoords(lat, lng, src, label) {
    const nc = this.nearest(lat, lng);
    let lb = label || null;
    if (!lb) lb = !nc ? 'موقعي الحالي' : nc.d < 25 ? nc.name : nc.d < 90 ? 'قرب ' + nc.name : 'موقعي الحالي';
    this.set({ lat: +(+lat).toFixed(5), lng: +(+lng).toFixed(5), label: lb, cc: nc && nc.d < 400 ? nc.cc : null, src: src || 'gps', ts: Date.now() });
  },
  /* طلب الموقع من أفضل مصدر متاح */
  request(onDone) {
    Loc._cb = onDone || null; Loc._pending = true;
    if (Native.has('requestLocation')) { Native.call('requestLocation'); return; }              // الجسر الجديد
    if (Native.has('detectLocation')) { Loc._awaitOld = true; Native.call('detectLocation'); // الجسر القديم
      setTimeout(() => { if (Loc._awaitOld) { Loc._awaitOld = false; Loc._finish(false); } }, 12000); return; }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => { Loc.fromCoords(p.coords.latitude, p.coords.longitude, 'gps'); Loc._finish(true); },
        () => Loc._finish(false), { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
      return;
    }
    Loc._finish(false);
  },
  _finish(ok) { const cb = Loc._cb; Loc._cb = null; Loc._pending = false; if (cb) cb(ok); else if (!ok) toast('تعذّر تحديد الموقع — اختر مدينتك يدويًا'); },
};

/* ── استرجاع الإحداثيات من الجسر القديم عبر (اتجاه القبلة + المسافة) ── */
const QProbe = {
  active: false, res: [], cb: null,
  run(cb) {
    if (!Native.has('setQiblaActive')) { cb(null); return; }
    this.active = true; this.res = []; this.cb = cb;
    let n = 0;
    const once = () => { Native.call('setQiblaActive', true); Native.call('setQiblaActive', false); if (++n < 3) setTimeout(once, 150); else setTimeout(() => this.finish(), 500); };
    once();
  },
  finish() {
    this.active = false; const cb = this.cb; this.cb = null; if (!cb) return;
    const cnt = {}; let best = null;
    this.res.forEach(([b, d]) => { const k = b.toFixed(6) + '|' + d.toFixed(4); cnt[k] = (cnt[k] || 0) + 1; if (!best || cnt[k] > cnt[best]) best = k; });
    if (!best) { cb(null); return; }
    const p = best.split('|').map(Number); this.best = p;
    cb(NoorEngine.locateFromQibla(p[0], p[1]), p);
  },
};
window.applyQibla = function (b, d) { if (QProbe.active) { QProbe.res.push([+b, +d]); return; } if (window._qOld) window._qOld(+b); };

/* ── ردود النواة الأصلية (متوافقة مع الإصدار القديم والجديد) ── */
window.applyPrayers = function (p) {
  // الإصدار القديم يرسل مواقيت بطريقة ثابتة؛ نستخدمه فقط كإشارة إلى تحديث الموقع.
  if (!p || Native.has('getLocation')) return;
  const real = p.city && p.city !== 'المدينة المنورة';
  const cur = Loc.get();
  if (!real) { if (Loc._awaitOld) { Loc._awaitOld = false; Loc._finish(false); } return; }
  if (cur && cur.src === 'city' && !Loc._awaitOld) return;   // اختيار يدوي يبقى كما هو
  QProbe.run(ll => {
    const wasAwait = Loc._awaitOld; Loc._awaitOld = false;
    if (ll) { const moved = !cur || NoorEngine.distanceKm(cur.lat, cur.lng, ll.lat, ll.lng) > 2 || cur.src !== 'gps';
      if (moved) Loc.fromCoords(ll.lat, ll.lng, 'gps'); }
    if (wasAwait) Loc._finish(!!ll);
  });
};
window.applyHijri = function () { /* يُحسب محليًا (أم القرى) */ };
window.onNativeLocation = function (j) {
  try { if (typeof j === 'string') j = JSON.parse(j); } catch (e) { j = null; }
  const asked = !!Loc._pending;
  if (j && j.lat != null && !j.isDefault && j.ok !== false) {
    const cur = Loc.get();
    // تحديث صامت عند الإقلاع، ولا يُمس اختيار المدينة اليدوي إلا بطلب صريح من المستخدم
    if (!cur || cur.src !== 'city' || asked) Loc.fromCoords(j.lat, j.lng, 'gps', j.label || null);
    if (asked) Loc._finish(true);
  } else if (asked) Loc._finish(false);
};

/* ───────── المواقيت ───────── */
const Times = {
  cache: {},
  clear() { this.cache = {}; },
  method() { const l = Loc.get(); return Settings.method || (l && NoorEngine.COUNTRY_METHOD[l.cc]) || 'mwl'; },
  methodName() { const m = NoorEngine.METHODS[this.method()]; return m ? m.name : ''; },
  forDay(d) {
    const k = dayKey(d); if (this.cache[k]) return this.cache[k];
    const l = Loc.eff(); const h = hijriOf(d);
    const T = NoorEngine.prayerTimes(startOfDay(d), { lat: l.lat, lng: l.lng, method: this.method(), asr: Settings.asr, highLat: Settings.highLat, adjust: Settings.adjust, ramadan: h.month === 9 });
    const o = {};
    ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'lastThird'].forEach(x => { o[x] = NoorEngine.toDate(startOfDay(d), T[x]); });
    return (this.cache[k] = o);
  },
  next(now) {
    const t = this.forDay(now);
    for (const k of FIVE) if (t[k] && t[k] > now) return { key: k, time: t[k], day: now };
    const d2 = addDays(now, 1); return { key: 'fajr', time: this.forDay(d2).fajr, day: d2, tomorrow: true };
  },
  prev(now) {
    const t = this.forDay(now); let p = null;
    for (const k of FIVE) if (t[k] && t[k] <= now) p = { key: k, time: t[k] };
    if (!p) p = { key: 'isha', time: this.forDay(addDays(now, -1)).isha };
    return p;
  },
  phase(now) {
    const t = this.forDay(now);
    if (now < t.fajr) return 'night';
    if (now < t.sunrise) return 'dawn';
    if (now < t.asr) return 'day';
    if (now < t.maghrib) return 'afternoon';
    if (now < t.isha) return 'sunset';
    return 'night';
  },
};
Bus.on('settings', k => { if (['method', 'asr', 'highLat', 'adjust', 'hijriOffset'].includes(k)) { Times.clear(); Notif.schedule(); } if (k === 'notif' || k === 'preNotif' || k === 'clock') Notif.schedule(); });
Bus.on('day', () => { Times.clear(); Notif.schedule(); });

/* ───────── متابعة الصلوات ───────── */
const Tracker = {
  data: Store.get('track', {}),
  get(d) { return this.data[dayKey(d)] || 0; },
  has(d, i) { return !!(this.get(d) & (1 << i)); },
  toggle(d, i) { const k = dayKey(d); this.data[k] = (this.data[k] || 0) ^ (1 << i); Store.set('track', this.data); const on = !!(this.data[k] & (1 << i));
    if ((typeof Growth !== 'undefined' && Growth)) { Growth.add('pr', on ? 1 : -1); if ((typeof Habits !== 'undefined' && Habits)) Habits.syncAuto(); } return on; },
  set(d, i, v) { if (this.has(d, i) !== !!v) this.toggle(d, i); },
  count(d) { let m = this.get(d), c = 0; while (m) { c += m & 1; m >>= 1; } return c; },
  streak(now) { let s = 0, d = now; if (this.count(d) < 5) d = addDays(d, -1); while (this.count(d) === 5 && s < 3650) { s++; d = addDays(d, -1); } return s; },
};

/* ───────── التنبيهات (تتطلب النواة الأصلية الجديدة) ───────── */
const DUA_ADHAN = 'اللهمّ ربَّ هذه الدعوة التامّة، والصلاة القائمة، آتِ محمدًا الوسيلة والفضيلة، وابعثه مقامًا محمودًا الذي وعدته';
const Notif = {
  supported() { return Native.has('scheduleAdhan'); },
  schedule: debounce(function () {
    if (!Notif.supported()) return;
    const now = new Date(), list = [], l = Loc.eff(), R = Settings.remind || {};
    const push = (at, o) => { if (at && at > now) list.push(Object.assign({ at: at.getTime() }, o)); };
    const at = (d, hm) => { const [h, m] = String(hm).split(':').map(Number); const x = new Date(d); x.setHours(h || 0, m || 0, 0, 0); return x; };
    // وسن 4.3: الأذان لثلاثين يومًا (يكفي لو لم يُفتح التطبيق طويلًا) والتذكيرات لأسبوعين
    for (let i = 0; i < 30; i++) {
      const d = addDays(now, i), t = Times.forDay(d), h = hijriOf(d), wd = d.getDay();
      FIVE.forEach(k => {
        if (!Settings.notif[k]) return;
        const nm = pname(k, d);
        push(t[k], { title: 'حان الآن وقت صلاة ' + nm, body: l.label + ' · ' + fmtTime(t[k]), key: k, name: nm, ch: 'adhan', route: 'prayer', args: '{"adhan":"' + k + '","at":' + t[k].getTime() + '}' });
        if (Settings.preNotif > 0) push(new Date(t[k].getTime() - Settings.preNotif * 60000), { title: 'اقترب وقت صلاة ' + nm, body: 'بعد ' + pM(Settings.preNotif) + ' · ' + fmtTime(t[k]), key: k + '_pre', name: nm, pre: 1, ch: 'pre', route: 'prayer' });
      });
      if (i >= 14) continue;
      // التذكيرات اليومية
      if (R.azm) push(new Date(t.fajr.getTime() + (Settings.remAzm || 30) * 60000), { title: 'أذكار الصباح', body: 'حصّن يومك بأذكار الصباح — «فسبحان الله حين تمسون وحين تصبحون»', key: 'r_azm', ch: 'remind', route: 'azkarList', args: '{"id":"morning"}' });
      if (R.aze) push(new Date(t.asr.getTime() + (Settings.remAze || 30) * 60000), { title: 'أذكار المساء', body: 'لا تنسَ أذكار المساء قبل غروب الشمس', key: 'r_aze', ch: 'remind', route: 'azkarList', args: '{"id":"evening"}' });
      if (R.kahf && wd === 5) push(at(d, '10:00'), { title: 'سورة الكهف', body: '«من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين»', key: 'r_kahf', ch: 'remind', route: 'reader', args: '{"s":18}' });
      if (R.jumua && wd === 5) push(new Date(t.dhuhr.getTime() - (Settings.remJumua || 45) * 60000), { title: 'صلاة الجمعة', body: 'بعد ' + pM(Settings.remJumua || 45) + ' — اغتسل وتطيّب وبكّر إلى الجمعة، وأكثر من الصلاة على النبي ﷺ', key: 'r_jumua', ch: 'remind', route: 'prayer' });
      if (R.fast && (wd === 0 || wd === 3)) push(at(d, '21:00'), { title: 'صيام ' + (wd === 0 ? 'الاثنين' : 'الخميس') + ' غدًا', body: 'تُعرض الأعمال يومي الاثنين والخميس — انوِ الصيام وتسحّر', key: 'r_fast', ch: 'remind', route: 'calendar' });
      if (R.white && h.day === 12) push(at(d, '21:00'), { title: 'الأيام البيض تبدأ غدًا', body: 'يُستحب صيام الأيام 13 و14 و15 من الشهر الهجري', key: 'r_white', ch: 'remind', route: 'calendar' });
      if (R.qiyam && t.lastThird) push(t.lastThird, { title: 'الثلث الأخير من الليل', body: '«ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر»', key: 'r_qiyam', ch: 'remind', route: 'azkar' });
      if (R.sleep) push(at(d, Settings.remSleep || '22:30'), { title: 'أذكار النوم', body: 'اختم يومك بأذكار النوم وآية الكرسي', key: 'r_sleep', ch: 'remind', route: 'azkarList', args: '{"id":"sleep"}' });
      // تذكيرات العادات
      if ((typeof Habits !== 'undefined' && Habits)) Habits.today(d).forEach(hb => { if (hb.rem) push(at(d, hb.rem), { title: hb.name, body: 'وقت عادتك اليومية — كل خطوة تسقي بستانك', key: 'h_' + hb.id, ch: 'remind', route: 'habits' }); });
    }
    // تذكيرات المهام
    if ((typeof Todo !== 'undefined' && Todo)) Todo.list.forEach(tk => { if (!tk.done && tk.due && tk.time) push(new Date(tk.due + 'T' + tk.time), { title: 'مهمة: ' + tk.t, body: tk.note || 'حان موعد مهمتك', key: 't_' + tk.id, ch: 'remind', route: 'todo' }); });
    list.sort((a, b) => a.at - b.at);
    Native.call('scheduleAdhan', JSON.stringify(list.slice(0, 800)));
    // وسن 4.3: إعدادات الحساب للنواة كي تمدّد جدول الأذان وحدها إن لم يُفتح التطبيق
    if (Native.has('setAdhanConfig')) try { Native.call('setAdhanConfig', JSON.stringify(Notif.config())); } catch (e) { console.warn('cfg', e); }
    WidgetSync.push();
  }, 700),
  /** إعدادات المواقيت كما تحسبها الواجهة — تستعملها النواة (WasanTimes) لتمديد الجدول */
  config() {
    const l = Loc.eff(), m = NoorEngine.METHODS[Times.method()] || NoorEngine.METHODS.mwl, now = new Date(), R = Settings.remind || {};
    const ram = []; for (let i = 0; i < 90; i++) { const d = addDays(now, i); if (hijriOf(d).month === 9) ram.push(dayKey(d)); }
    const white = []; if (R.white) for (let i = 0; i < 90; i++) { const d = addDays(now, i); if (hijriOf(d).day === 12) white.push(dayKey(d)); }
    return {
      v: 1, lat: l.lat, lng: l.lng, label: l.label,
      fajr: m.fajr, isha: typeof m.isha === 'number' ? m.isha : null, ishaMin: typeof m.isha === 'object' ? m.isha.min : 0,
      ramIshaMin: m.ramadanIsha ? m.ramadanIsha.min : 0, maghrib: typeof m.maghrib === 'number' ? m.maghrib : 0, jafari: m.midnight === 'jafari',
      asr: Settings.asr === 'hanafi' ? 2 : 1, highLat: Settings.highLat || 'angle', adjust: Object.assign({}, Settings.adjust),
      notif: Object.assign({}, Settings.notif), pre: Settings.preNotif || 0, preTxt: Settings.preNotif ? 'بعد ' + pM(Settings.preNotif) : '',
      clock: Settings.clock, digits: Settings.digits,
      names: { fajr: PNAME.fajr, dhuhr: PNAME.dhuhr, asr: PNAME.asr, maghrib: PNAME.maghrib, isha: PNAME.isha, jumua: 'الجمعة' },
      rem: { azm: !!R.azm, aze: !!R.aze, kahf: !!R.kahf, jumua: !!R.jumua, fast: !!R.fast, qiyam: !!R.qiyam, sleep: !!R.sleep,
        remAzm: Settings.remAzm || 30, remAze: Settings.remAze || 30, remSleep: Settings.remSleep || '22:30', remJumua: Settings.remJumua || 45,
        jumuaTxt: 'بعد ' + pM(Settings.remJumua || 45) },
      ram, white,
    };
  },
};

/* ── وسن 4.3 · صحة التنبيهات: هل سيصل الأذان في وقته؟ ── */
const NotifHealth = {
  state() {
    const q = (f, d) => { if (!Native.has(f)) return d; const v = Native.call(f); return v == null ? d : !!v; };
    return { sup: Notif.supported(), notif: q('notifEnabled', true), exact: q('canExactAlarm', true), battery: q('batteryExempt', true),
      any: FIVE.some(k => Settings.notif[k]) };
  },
  broken(s) { s = s || this.state(); return !!(s.sup && s.any && (!s.notif || !s.exact)); },
  weak(s) { s = s || this.state(); return !!(s.sup && s.any && !this.broken(s) && !s.battery); },
};
function notifHealthSheet() {
  const row = (ok, ic, t, okS, badS, btn, id) => '<div class="li nh-row ' + (ok ? 'ok' : 'bad') + '"><div class="ic">' + icon(ok ? 'check' : ic) + '</div><div class="grow"><div class="t">' + t + '</div>' +
    '<div class="s">' + (ok ? okS : badS) + '</div></div>' + (ok ? '' : '<button class="act" id="' + id + '">' + btn + '</button>') + '</div>';
  const draw = () => {
    const s = NotifHealth.state(), bad = NotifHealth.broken(s);
    return '<div id="nh-sheet"><div class="sh-t">وصول الأذان في وقته</div><div class="sh-s">' + (bad ? 'بعض الأذونات ناقصة، وقد يتأخر الأذان أو لا يصل' : s.battery ? 'كل شيء جاهز — سيصلك الأذان بإذن الله' : 'جاهز، وننصح باستثناء وسن من توفير البطارية') + '</div>' +
      '<div class="list mx">' + row(s.notif, 'belloff', 'الإشعارات', 'مسموحة', 'غير مسموحة — لن يظهر الأذان', 'السماح', 'nh-n') +
      row(s.exact, 'alarm', 'المنبّهات الدقيقة', 'مسموحة — الأذان في دقيقته', 'غير مسموحة — قد يتأخر الأذان دقائق', 'السماح', 'nh-e') +
      row(s.battery, 'battery', 'توفير البطارية', 'وسن مستثنى — يعمل في الخلفية', 'قد يؤخّر النظام الأذان أو يوقفه', 'استثناء', 'nh-b') + '</div>' +
      '<div class="nh-tip">' + icon('info') + '<span>في بعض الهواتف (شاومي، أوبو، ريلمي، هواوي، سامسونج) فعّل «التشغيل التلقائي» لوسن، واختر «بلا قيود» في إعدادات البطارية.</span></div>' +
      (Native.has('testAdhan') ? '<div class="mx" style="margin-top:12px"><button class="btn gold block" id="nh-t">' + icon('bell') + 'جرّب الأذان الآن</button></div>' : '') + '</div>';
  };
  const bind = el => {
    const b = id => el.querySelector('#' + id);
    if (b('nh-n')) b('nh-n').onclick = () => { Native.call('ensureNotifPermission'); setTimeout(() => { if (!NotifHealth.state().notif) Native.call('openChannelSettings', 'adhan'); }, 1600); };
    if (b('nh-e')) b('nh-e').onclick = () => Native.call('requestExactAlarm');
    if (b('nh-b')) b('nh-b').onclick = () => Native.call('requestBatteryExemption');
    if (b('nh-t')) b('nh-t').onclick = () => { Native.call('ensureNotifPermission'); Native.call('testAdhan'); toast('سيصلك أذان تجريبي بعد ٥ ثوانٍ — يمكنك إطفاء الشاشة', 4200); };
  };
  Sheet.open(draw(), el => {
    bind(el);
    NotifHealth._redraw = () => { const box = Sheet.el && Sheet.el.querySelector('#nh-sheet'); if (!box) { NotifHealth._redraw = null; return; } box.outerHTML = draw(); bind(Sheet.el); };
  });
}
Bus.on('resume', () => { if (NotifHealth._redraw) NotifHealth._redraw(); });

/* ── وسن 4.4 · شريط «الأذان يُرفع الآن» مع زر الإيقاف حين يكون التطبيق مفتوحًا ── */
const AdhanPill = {
  el: null, _t: 0,
  set(on, name) {
    clearInterval(this._t);
    if (!on) { if (this.el) { const e = this.el; this.el = null; e.classList.remove('show'); setTimeout(() => e.remove(), 320); } return; }
    if (!this.el) {
      const e = document.createElement('div'); e.className = 'adpill'; e.setAttribute('role', 'status');
      e.innerHTML = '<span class="adp-ic">' + icon('minaret') + '</span><span class="t">الأذان يُرفع الآن</span><button class="adp-x" aria-label="إيقاف الأذان">' + icon('stop') + 'إيقاف</button>';
      document.body.appendChild(e); this.el = e; requestAnimationFrame(() => e.classList.add('show'));
      e.querySelector('.adp-x').onclick = () => { Native.call('stopAdhan'); this.set(false); const s = $('#pd-stop'); if (s) s.hidden = true; };
    }
    if (name) this.el.querySelector('.t').textContent = name === 'تجربة' ? 'تجربة الأذان' : 'أذان صلاة ' + name;
    this._t = setInterval(() => { if (!Native.call('adhanPlaying')) this.set(false); }, 2000);
  },
  check() { if (Native.has('adhanPlaying')) this.set(!!Native.call('adhanPlaying')); },
};
window.onAdhanState = function (j) {
  try { if (typeof j === 'string') j = JSON.parse(j); } catch (e) { j = {}; }
  const on = !!(j && j.playing); AdhanPill.set(on, j && j.name);
  const s = $('#pd-stop'); if (s) s.hidden = !on;
};
Bus.on('resume', () => AdhanPill.check());

/* ── أدوات الشاشة الرئيسية: نرسل مواقيت ١٤ يومًا بالطريقة والتعديلات المختارة ── */
const WidgetSync = {
  push() {
    if (!Native.has('setWidgetData')) return;
    const l = Loc.eff(), now = new Date(), days = [];
    const keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (let i = 0; i < 14; i++) {
      const d = addDays(now, i), t = Times.forDay(d);
      days.push({ d: dayKey(d), h: fmtH(hijriOf(d)), at: keys.map(k => t[k].getTime()), f: keys.map(k => fmtTime(t[k])), n: keys.map(k => pname(k, d)) });
    }
    Native.call('setWidgetData', JSON.stringify({ city: l.label, days }));
  },
};

/* ── «صلّيت» من إشعار الأذان ← متابعة الصلوات ── */
const PrayedSync = {
  take() {
    if (!Native.has('takePrayed')) return;
    try {
      const arr = JSON.parse(Native.call('takePrayed') || '[]');
      if (!arr.length) return;
      arr.forEach(x => { const i = FIVE.indexOf(x.key); if (i >= 0) Tracker.set(new Date(x.day + 'T12:00'), i, true); });
      toast('سُجّلت صلاتك — تقبّل الله');
      if (Router.cur && ['home', 'tracker', 'more'].includes(Router.cur.r)) Router.refresh();
    } catch (e) { console.warn('prayed', e); }
  },
};

/* ═══════════════ شاشة المواقيت ═══════════════ */
const PS = { off: 0 };
function prayerRows(d, now, withBell) {
  const t = Times.forDay(d);
  const isToday = daysBetween(now, d) === 0;
  const nx = isToday ? Times.next(now) : null;
  const keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let html = keys.map(k => {
    const minor = k === 'sunrise';
    const cur = nx && !nx.tomorrow && nx.key === k;
    const past = isToday && t[k] < now && !cur;
    const bell = withBell && !minor ? '<button class="bl ' + (Settings.notif[k] ? 'on' : '') + '" data-bell="' + k + '" aria-label="تنبيه">' + icon(Settings.notif[k] ? 'bell' : 'belloff') + '</button>' : '';
    return '<div class="prow ' + (cur ? 'cur ' : '') + (past ? 'past ' : '') + (minor ? 'minor' : '') + '"><div class="ic">' + icon(PICON[k]) + '</div>' +
      '<div><div class="nm">' + pname(k, d) + '</div>' + (cur ? '<div class="sb">الصلاة القادمة</div>' : '') + '</div>' +
      '<div class="tm num">' + fmtTime(t[k]) + '</div>' + bell + '</div>';
  }).join('');
  const h = hijriOf(d);
  const extra = [['midnight', 'منتصف الليل'], ['lastThird', 'الثلث الأخير']];
  if (h.month === 9) extra.unshift(['imsak', 'الإمساك']);
  html += extra.map(([k, n]) => '<div class="prow minor"><div class="ic">' + icon(PICON[k]) + '</div><div><div class="nm">' + n + '</div></div><div class="tm num">' + fmtTime(t[k]) + '</div>' + (withBell ? '<span class="bl"></span>' : '') + '</div>').join('');
  return html;
}
/* ── وسن 4.4 · بعد الأذان: دعاء ما بعد الأذان خلال نصف ساعة من دخول الوقت ── */
function adhanNow(now, a) {
  if (a && a.adhan && FIVE.includes(a.adhan) && a.at && now - a.at < 3 * 3600e3 && now - a.at > -120e3) return { key: a.adhan, time: new Date(+a.at) };
  const pv = Times.prev(now);
  return pv && now - pv.time < 30 * 60e3 && now - pv.time >= 0 ? pv : null;
}
function duaCard(now, ad) {
  const i = FIVE.indexOf(ad.key), done = Tracker.has(ad.time, i), ago = Math.max(0, Math.round((now - ad.time) / 60000));
  const playing = Native.has('adhanPlaying') && !!Native.call('adhanPlaying');
  return '<div class="hc mt dua-card" id="p-dua"><div class="row" style="gap:12px"><div class="dua-ic">' + icon('minaret') + '</div>' +
    '<div class="grow"><div class="dua-k">دخل وقت صلاة ' + pname(ad.key, ad.time) + (ago ? ' · منذ ' + pM(ago) : ' · الآن') + '</div><div class="dua-t">دعاء ما بعد الأذان</div></div></div>' +
    '<div class="dua-pre">ردّد مع المؤذّن، ثم صلِّ على النبي ﷺ، ثم قل:</div>' +
    '<div class="dua-x">«' + DUA_ADHAN + '»</div>' +
    '<div class="dua-src">رواه البخاري — «حلّت له شفاعتي يوم القيامة»</div>' +
    '<div class="dua-acts"><button class="act' + (done ? ' on' : '') + '" id="pd-pr">' + icon('check') + (done ? 'سُجّلت صلاتك' : 'صلّيت') + '</button>' +
    '<button class="act" id="pd-stop"' + (playing ? '' : ' hidden') + '>' + icon('stop') + 'إيقاف الأذان</button>' +
    '<button class="act dua-cp" id="pd-cp" aria-label="نسخ الدعاء">' + icon('copy') + '</button></div></div>';
}
SCREENS.prayer = {
  tab: 'prayer',
  render(a) {
    const now = new Date(), d = addDays(now, PS.off), l = Loc.eff();
    const ad = PS.off === 0 ? adhanNow(now, a) : null;
    const h = hijriOf(d);
    const dateLbl = PS.off === 0 ? 'اليوم' : PS.off === 1 ? 'غدًا' : PS.off === -1 ? 'أمس' : weekday(d);
    const extra = '<div class="dnav"><button class="ibtn" id="pd-prev" aria-label="اليوم السابق">' + icon('back') + '</button>' +
      '<div class="d"><b>' + dateLbl + ' · ' + weekday(d) + '</b><span>' + fmtH(h) + ' — ' + fmtG(d) + '</span></div>' +
      '<button class="ibtn" id="pd-next" aria-label="اليوم التالي">' + icon('fwd') + '</button></div>';
    const bells = Notif.supported();
    return hdr('مواقيت الصلاة', icon('pin', '', 'width:14px;height:14px;display:inline-block;vertical-align:-2px') + ' ' + esc(l.label) + (Loc.get() ? '' : ' (افتراضي)'),
        { actions: [{ id: 'p-loc', icon: 'gps', label: 'تحديد الموقع' }], extra }) +
      '<div class="ptoday">' + (PS.off === 0 ? '<div class="nextc" id="p-next"></div>' : '') + '</div>' +
      (PS.off === 0 && bells && NotifHealth.broken() ? '<button class="nh-warn" id="p-nh">' + icon('warn') + '<div class="grow"><b>قد لا يصلك الأذان في وقته</b><span>بعض أذونات التنبيه ناقصة — اضغط للإصلاح</span></div>' + icon('chev') + '</button>' : '') +
      (ad ? duaCard(now, ad) : '') +
      '<div class="list ptl" id="p-list">' + prayerRows(d, now, bells) + '</div>' +
      '<div class="row mx mt" style="gap:10px"><button class="btn ghost grow" data-go="month">' + icon('calendar') + 'جدول الشهر</button>' +
      '<button class="btn ghost grow" id="p-meth">' + icon('gear') + 'الإعدادات</button></div>' +
      sec('إعدادات الحساب') +
      '<div class="list mx">' +
      '<button class="li" id="p-m"><div class="ic">' + icon('globe') + '</div><div class="grow"><div class="t">طريقة الحساب</div><div class="s">' + esc(Times.methodName()) + (Settings.method ? '' : ' · تلقائي') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="p-asr"><div class="ic">' + icon('asr') + '</div><div class="grow"><div class="t">وقت العصر</div><div class="s">' + (Settings.asr === 'hanafi' ? 'المذهب الحنفي (ظل المثلين)' : 'الجمهور (ظل المثل)') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="p-adj"><div class="ic">' + icon('clock') + '</div><div class="grow"><div class="t">تعديل يدوي للأوقات</div><div class="s">' + adjSummary() + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="location"><div class="ic">' + icon('pin') + '</div><div class="grow"><div class="t">الموقع</div><div class="s">' + esc(l.label) + ' · ' + N(l.lat.toFixed(3)) + '، ' + N(l.lng.toFixed(3)) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '</div>' + (bells ? '' : '<div class="foot-note">' + icon('info', '', 'width:15px;height:15px;display:inline-block;vertical-align:-3px') + ' لتفعيل تنبيهات الأذان ثبّت الإصدار الكامل من التطبيق (النواة الأصلية 2.0).</div>');
  },
  mount(el, a) {
    $('#pd-prev', el).onclick = () => { PS.off--; Router.refresh(); };
    const nh = $('#p-nh', el); if (nh) nh.onclick = () => notifHealthSheet();
    const dc = $('#p-dua', el);
    if (dc) {
      const ad = adhanNow(new Date(), a);
      $('#pd-pr', el).onclick = e => { if (!ad) return; const i = FIVE.indexOf(ad.key); if (!Tracker.has(ad.time, i)) { Tracker.set(ad.time, i, true); vibrate(25); toast('تقبّل الله صلاتك'); }
        e.currentTarget.classList.add('on'); e.currentTarget.innerHTML = icon('check') + 'سُجّلت صلاتك'; };
      $('#pd-stop', el).onclick = e => { Native.call('stopAdhan'); e.currentTarget.hidden = true; AdhanPill.set(false); };
      $('#pd-cp', el).onclick = () => copyText(DUA_ADHAN);
    }
    $('#pd-next', el).onclick = () => { PS.off++; Router.refresh(); };
    $('#p-loc', el).onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request(ok => { toast(ok ? 'تم تحديث الموقع' : 'تعذّر تحديد الموقع'); Router.refresh(); }); };
    $('#p-meth', el).onclick = () => Router.go('settings');
    $('#p-m', el).onclick = () => methodSheet(() => Router.refresh());
    $('#p-asr', el).onclick = () => pickSheet('وقت العصر', 'يختلف حسب المذهب الفقهي', [
      { v: 'shafii', t: 'الجمهور', s: 'الشافعي والمالكي والحنبلي — ظل الشيء مثله' }, { v: 'hanafi', t: 'الحنفي', s: 'ظل الشيء مثلاه' }],
      Settings.asr, v => { setSetting('asr', v); Router.refresh(); });
    $('#p-adj', el).onclick = () => adjustSheet(() => Router.refresh());
    $$('[data-bell]', el).forEach(b => b.onclick = () => {
      const k = b.dataset.bell; const n = Object.assign({}, Settings.notif); n[k] = !n[k]; setSetting('notif', n);
      b.classList.toggle('on', n[k]); b.innerHTML = icon(n[k] ? 'bell' : 'belloff');
      toast(n[k] ? 'تم تفعيل تنبيه ' + PNAME[k] : 'تم إيقاف تنبيه ' + PNAME[k]);
      if (n[k] && Native.has('ensureNotifPermission')) Native.call('ensureNotifPermission');
    });
    this.tick(new Date(), true);
  },
  leave() { PS.off = 0; },
  tick(now, first) {
    const box = $('#p-next'); if (!box) return;
    const nx = Times.next(now), pv = Times.prev(now);
    const span = nx.time - pv.time, frac = span > 0 ? 1 - (nx.time - now) / span : 0;
    if (first || !box.firstChild) {
      box.innerHTML = '<div class="ring">' + ringSVG(84, 7, frac, 'var(--gold)') + '<div class="ctr">' + icon(PICON[nx.key], 'gold', 'width:26px;height:26px') + '</div></div>' +
        '<div class="grow"><div class="faint" style="font-size:12.5px">الصلاة القادمة' + (nx.tomorrow ? ' · غدًا' : '') + '</div>' +
        '<div style="font-size:26px;font-weight:700;line-height:1.3" id="pn-n">' + pname(nx.key, nx.day) + ' <span class="gold num" style="font-size:18px">' + fmtTime(nx.time) + '</span></div>' +
        '<div class="muted num" id="pn-c" style="font-size:14px;font-weight:600"></div></div>';
    }
    const c = $('#pn-c'); if (c) c.textContent = 'بعد ' + fmtCountdown(nx.time - now);
    setRing($('.ring svg', box), frac);
    if (this._lastKey && this._lastKey !== nx.key) { this._lastKey = nx.key; Router.refresh(); return; }
    this._lastKey = nx.key;
  },
};
function adjSummary() {
  const a = Settings.adjust; const ch = Object.keys(a).filter(k => a[k]);
  return ch.length ? ch.map(k => PNAME[k] + ' ' + (a[k] > 0 ? '+' : '') + N(a[k])).join('، ') : 'بدون تعديل';
}
function methodSheet(done) {
  const M = NoorEngine.METHODS;
  const desc = k => { const m = M[k]; const f = 'الفجر ' + N(m.fajr) + '°'; const i = typeof m.isha === 'number' ? 'العشاء ' + N(m.isha) + '°' : 'العشاء ' + N(m.isha.min) + ' دقيقة بعد المغرب'; return f + ' · ' + i; };
  const l = Loc.get(); const auto = (l && NoorEngine.COUNTRY_METHOD[l.cc]) || 'mwl';
  const opts = [{ v: '', t: 'تلقائي حسب البلد', s: M[auto].name }].concat(NoorEngine.METHOD_ORDER.map(k => ({ v: k, t: M[k].name, s: desc(k) })));
  pickSheet('طريقة الحساب', 'اختر الطريقة المعتمدة في بلدك', opts, Settings.method, v => { setSetting('method', v); toast('تم تحديث طريقة الحساب'); if (done) done(); });
}
function adjustSheet(done) {
  const keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const html = '<div class="sh-t">تعديل يدوي للأوقات</div><div class="sh-s">أضف أو أنقص دقائق لمطابقة التقويم المحلي لمسجدك</div>' +
    keys.map(k => '<div class="li"><div class="ic">' + icon(PICON[k]) + '</div><div class="grow"><div class="t">' + PNAME[k] + '</div></div>' +
      '<button class="ibtn plain" data-adj="' + k + '" data-d="-1">' + icon('minus') + '</button><b class="num" style="min-width:44px;text-align:center" id="adj-' + k + '">' + fmtAdj(Settings.adjust[k]) + '</b>' +
      '<button class="ibtn plain" data-adj="' + k + '" data-d="1">' + icon('plus') + '</button></div>').join('') +
    '<div class="mx mt"><button class="btn ghost block" id="adj-reset">إعادة الضبط</button></div>';
  Sheet.open(html, el => {
    $$('[data-adj]', el).forEach(b => b.onclick = () => {
      const k = b.dataset.adj; const a = Object.assign({}, Settings.adjust); a[k] = clamp((a[k] || 0) + (+b.dataset.d), -30, 30);
      setSetting('adjust', a); $('#adj-' + k, el).textContent = fmtAdj(a[k]); if (done) Sheet.after = done;
    });
    $('#adj-reset', el).onclick = () => { setSetting('adjust', Object.assign({}, DEFAULTS.adjust)); Sheet.close(done); };
  });
}
const fmtAdj = v => v ? (v > 0 ? '+' : '−') + N(Math.abs(v)) : N(0);

/* ═══════════════ جدول الشهر ═══════════════ */
const MS = { y: null, m: null };
SCREENS.month = {
  parent: 'prayer',
  render() {
    const now = new Date(); if (MS.y == null) { MS.y = now.getFullYear(); MS.m = now.getMonth(); }
    const first = new Date(MS.y, MS.m, 1), days = new Date(MS.y, MS.m + 1, 0).getDate();
    let rows = '';
    for (let i = 1; i <= days; i++) {
      const d = new Date(MS.y, MS.m, i), t = Times.forDay(d), h = hijriOf(d);
      const today = daysBetween(now, d) === 0;
      rows += '<tr class="' + (today ? 'today' : '') + '"><td class="dd">' + weekday(d).replace('ال', '') + ' ' + N(i) + '<small>' + N(h.day) + ' ' + NoorEngine.HMONTHS[h.month - 1] + '</small></td>' +
        ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => '<td>' + fmtTime(t[k], false) + '</td>').join('') + '</tr>';
    }
    const extra = '<div class="dnav"><button class="ibtn" id="m-prev">' + icon('back') + '</button><div class="d"><b>' + gMonthNames()[MS.m] + ' ' + N(MS.y) + '</b><span>' + esc(Loc.eff().label) + ' · ' + esc(Times.methodName()) + '</span></div><button class="ibtn" id="m-next">' + icon('fwd') + '</button></div>';
    void first;
    return hdr('جدول المواقيت الشهري', '', { back: true, compact: true, extra }) +
      '<div class="card mx mt" style="overflow:hidden"><table class="tt"><thead><tr><th>اليوم</th><th>الفجر</th><th>الشروق</th><th>الظهر</th><th>العصر</th><th>المغرب</th><th>العشاء</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="mx mt"><button class="btn ghost block" id="m-share">' + icon('share') + 'مشاركة الجدول</button></div>';
  },
  mount(el) {
    $('#m-prev', el).onclick = () => { MS.m--; if (MS.m < 0) { MS.m = 11; MS.y--; } Router.refresh(); };
    $('#m-next', el).onclick = () => { MS.m++; if (MS.m > 11) { MS.m = 0; MS.y++; } Router.refresh(); };
    $('#m-share', el).onclick = () => {
      const days = new Date(MS.y, MS.m + 1, 0).getDate(); let s = 'مواقيت الصلاة — ' + Loc.eff().label + ' — ' + gMonthNames()[MS.m] + ' ' + MS.y + '\n(الفجر، الشروق، الظهر، العصر، المغرب، العشاء)\n';
      for (let i = 1; i <= days; i++) { const d = new Date(MS.y, MS.m, i), t = Times.forDay(d); s += N(i) + ': ' + ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(k => fmtTime(t[k], false)).join(' · ') + '\n'; }
      shareText(s + '\nعبر تطبيق وسن');
    };
    const tr = $('tr.today', el); if (tr) setTimeout(() => tr.scrollIntoView({ block: 'center' }), 60);
  },
  leave() { MS.y = null; },
};

/* ═══════════════ اختيار الموقع ═══════════════ */
SCREENS.location = {
  parent: 'prayer',
  render() {
    const l = Loc.eff();
    const src = { gps: 'تحديد تلقائي', city: 'اختيار يدوي', default: 'افتراضي' }[l.src] || '';
    return hdr('الموقع', 'لمواقيت دقيقة واتجاه قبلة صحيح', { back: true, compact: true }) +
      '<div class="card mx mt pad"><div class="row"><div class="icbox">' + icon('pin') + '</div>' +
      '<div class="grow"><div style="font-weight:700;font-size:16px">' + esc(l.label) + '</div><div class="faint num" style="font-size:12.5px">' + N(l.lat.toFixed(4)) + '، ' + N(l.lng.toFixed(4)) + ' · ' + src + '</div></div></div>' +
      '<button class="btn primary block mt" id="l-gps">' + icon('gps') + 'تحديد موقعي تلقائيًا</button></div>' +
      '<div class="mx mt"><div class="search">' + icon('search') + '<input id="l-q" placeholder="ابحث عن مدينة أو ولاية…" autocomplete="off"></div></div>' +
      '<div class="list mx mt" id="l-list"></div>';
  },
  mount(el) {
    const draw = q => {
      const nq = normAr(q || ''); const cc = (Loc.get() || {}).cc || 'DZ';
      let arr = (window.NOOR_CITIES || []).map((c, i) => ({ c, i }));
      if (nq) arr = arr.filter(x => normAr(x.c[0]).includes(nq) || normAr(NOOR_COUNTRIES[x.c[1]] || '').includes(nq));
      else arr.sort((a, b) => (a.c[1] === cc ? 0 : 1) - (b.c[1] === cc ? 0 : 1));
      arr = arr.slice(0, nq ? 60 : 80);
      $('#l-list', el).innerHTML = arr.length ? arr.map(x => '<button class="li" data-city="' + x.i + '"><div class="ic">' + icon('pin') + '</div><div class="grow"><div class="t">' + esc(x.c[0]) + '</div><div class="s">' + esc(NOOR_COUNTRIES[x.c[1]] || '') + '</div></div><div class="end">' + icon('chev') + '</div></button>').join('')
        : '<div class="empty">لا توجد نتائج — جرّب اسمًا آخر أو استخدم التحديد التلقائي</div>';
    };
    draw('');
    $('#l-q', el).addEventListener('input', debounce(e => draw(e.target.value), 180));
    $('#l-list', el).addEventListener('click', e => {
      const b = e.target.closest('[data-city]'); if (!b) return;
      const c = NOOR_CITIES[+b.dataset.city];
      Loc.set({ lat: c[2], lng: c[3], label: c[0], cc: c[1], src: 'city', ts: Date.now() });
      toast('تم اختيار ' + c[0]); Router.back();
    });
    $('#l-gps', el).onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request(ok => { if (ok) { toast('تم تحديد موقعك: ' + Loc.eff().label); Router.refresh(); } else toast('تعذّر التحديد التلقائي — اختر مدينتك من القائمة'); }); };
  },
};

/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · الموقع · المواقيت · متابعة الصلوات · التنبيهات
   ════════════════════════════════════════════════════════════════ */
'use strict';

const FIVE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PNAME = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
  midnight: 'منتصف الليل', lastThird: 'الثلث الأخير من الليل', imsak: 'الإمساك' };
const PICON = { fajr: 'fajr', sunrise: 'sunrise', dhuhr: 'sun', asr: 'asr', maghrib: 'sunset', isha: 'isha', midnight: 'moon', lastThird: 'moonstar', imsak: 'clock' };
const pname = (k, d) => (k === 'dhuhr' && d && d.getDay() === 5) ? 'الجمعة' : PNAME[k];
const DEFAULT_LOC = { lat: 21.4225, lng: 39.8262, label: 'مكة المكرمة', cc: 'SA', tz: 'Asia/Riyadh', src: 'default' };

/* ───────── وسن 5.1 · الموقع حول العالم: الدولة والمنطقة الزمنية دون إنترنت ─────────
   ─ الدولة (لطريقة الحساب): من الهاتف، ثم أقرب مدينة معروفة، ثم منطقة الهاتف الزمنية، ثم أقرب منطقة زمنية.
   ─ المنطقة الزمنية: الموقع الحالي يتبع ساعة الهاتف دائمًا؛ والمدينة المختارة يدويًا تُحسب بتوقيتها هي
     (مع التوقيت الصيفي عبر Intl)، فمن اختار مدينة بعيدة يرى مواقيتها بساعتها المحلية. */
const Geo = {
  _f: {},
  devTz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } },
  canon(tz) { return (window.NOOR_TZA && NOOR_TZA[tz]) || tz; },
  zone(tz) { tz = this.canon(tz); return tz ? (window.NOOR_TZ || []).find(z => z[0] === tz) || null : null; },
  devZone() { return this.zone(this.devTz()); },
  nearestZone(lat, lng, cc) { let best = null, bd = 1e9; (window.NOOR_TZ || []).forEach(z => { if (cc && z[1] !== cc) return; const d = NoorEngine.distanceKm(lat, lng, z[2], z[3]); if (d < bd) { bd = d; best = z; } }); return best ? { z: best, d: bd } : null; },
  /** أجزاء الوقت (سنة، شهر، يوم، ساعة، دقيقة) في منطقة زمنية */
  parts(tz, at) {
    let f = this._f[tz];
    if (f === undefined) { try { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }); } catch (e) { f = null; } this._f[tz] = f; }
    if (!f) return null; const o = {}; f.formatToParts(at).forEach(x => { if (x.type !== 'literal') o[x.type] = +x.value; }); if (o.hour === 24) o.hour = 0; return o;
  },
  /** فرق التوقيت بالساعات لمنطقة زمنية في لحظة معيّنة (يراعي التوقيت الصيفي) */
  offset(tz, at) { const p = this.parts(tz, at || new Date()); if (!p) return null; const t = at || new Date(); return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(t.getTime() / 1000) * 1000) / 60000) / 60; },
  devOffset(at) { return -(at || new Date()).getTimezoneOffset() / 60; },
  ccFor(lat, lng, hint, src) {
    if (hint && /^[A-Z]{2}$/.test(hint)) return hint;
    const nc = Loc.nearest(lat, lng); if (nc && nc.d < 120) return nc.cc;
    // الموقع الحالي: دولة منطقة الهاتف الزمنية إن كان لها منطقة قريبة من الموقع (أدقّ من «أقرب نقطة» قرب الحدود)
    const dz = this.devZone(); if (dz && (src === 'gps' || src === 'default' || src == null)) { const near = this.nearestZone(lat, lng, dz[1]); if (near && (near.d < 1200 || NoorEngine.distanceKm(lat, lng, dz[2], dz[3]) < 700)) return dz[1]; }
    const nz = this.nearestZone(lat, lng);
    if (nc && (!nz || nc.d <= nz.d) && nc.d < 600) return nc.cc;
    return nz && nz.d < 1500 ? nz.z[1] : null;
  },
  tzFor(lat, lng, cc, src) {
    const dev = this.devTz(); if (src === 'gps' || src === 'default') return dev || null;
    const dz = this.devZone(), nz = this.nearestZone(lat, lng, cc) || this.nearestZone(lat, lng);
    if (dz && nz && (dz[0] === nz.z[0] || (dz[1] === nz.z[1] && Math.abs(this.offset(nz.z[0]) - this.devOffset()) < .01))) return dev;
    return nz ? nz.z[0] : dev || null;
  },
  fmtOff(h) { if (h == null) return ''; const s = h < 0 ? '−' : '+', a = Math.abs(h), hh = Math.floor(a), mm = Math.round((a - hh) * 60); return 'GMT' + s + hh + (mm ? ':' + String(mm).padStart(2, '0') : ''); },
  /** موقع افتراضي قبل إذن الموقع: عاصمة منطقتك الزمنية بدل مكة (مواقيت تقريبية صحيحة لبلدك) */
  guess() {
    const z = this.devZone(); if (!z) return DEFAULT_LOC;
    // وسن 6.3: أكبر مدينة قرب نقطة المنطقة الزمنية (العاصمة غالبًا) لا أقرب ضاحية
    const nc = Loc.major(z[2], z[3], 60) || Loc.nearest(z[2], z[3]), en = z[0].split('/').pop().replace(/_/g, ' ');
    const at = nc && nc.d < 150 && nc.lat != null ? { lat: nc.lat, lng: nc.lng } : { lat: z[2], lng: z[3] };
    return { lat: at.lat, lng: at.lng, label: nc && nc.d < 150 ? nc.name : en, cc: z[1], tz: this.devTz(), src: 'default' };
  },
};

/* ───────── الموقع ───────── */
const Loc = {
  _v: Store.get('loc', null),
  get() { return this._v; },
  /** موقع اختارته المستخدمة بنفسها (مدينة أو إحداثيات) — لا يغيّره التحديد التلقائي الصامت */
  pinned() { return !!this._v && (this._v.src === 'city' || this._v.src === 'manual'); },
  eff() { return this._v || this._g || (this._g = Geo.guess()); },
  set(v, silent) {
    if (v && v.lat != null) { if (!v.cc) v.cc = Geo.ccFor(v.lat, v.lng, null, v.src); if (!v.tz || v.src === 'gps') v.tz = Geo.tzFor(v.lat, v.lng, v.cc, v.src); }
    this._v = v; Store.set('loc', v); Times.clear();
    if (!silent) Bus.emit('loc', v);
    Notif.schedule();
  },
  nearest(lat, lng) {
    let best = null, bd = 1e9;
    (window.NOOR_CITIES || []).forEach(c => { const d = NoorEngine.distanceKm(lat, lng, c[2], c[3]); if (d < bd) { bd = d; best = c; } });
    return best ? { name: best[0], cc: best[1], d: bd, lat: best[2], lng: best[3] } : null;
  },
  /** وسن 6.3: أكبر مدينة ضمن نطاق (القائمة مرتّبة بعدد السكان) */
  major(lat, lng, km) {
    const C = window.NOOR_CITIES || [];
    for (let i = 0; i < C.length; i++) { const c = C[i], d = NoorEngine.distanceKm(lat, lng, c[2], c[3]); if (d < km) return { name: c[0], cc: c[1], d, lat: c[2], lng: c[3] }; }
    return null;
  },
  fromCoords(lat, lng, src, label, cc) {
    const nc = this.nearest(lat, lng);
    let lb = label || null;
    const far = src === 'manual' ? 'موقع مخصّص' : 'موقعي الحالي';
    if (!lb) lb = !nc ? far : nc.d < 25 ? nc.name : nc.d < 90 ? 'قرب ' + nc.name : far;
    const c = Geo.ccFor(lat, lng, cc, src || 'gps');
    this.set({ lat: +(+lat).toFixed(5), lng: +(+lng).toFixed(5), label: lb, cc: c, src: src || 'gps', ts: Date.now() });
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
  _finish(ok, why) {
    const cb = Loc._cb; Loc._cb = null; Loc._pending = false; Loc.why = ok ? '' : (why || 'timeout');
    if (cb) cb(ok, Loc.why); else if (!ok && Loc.why === 'timeout') toast('تعذّر تحديد الموقع — اختر مدينتك يدويًا');
    // وسن 6.3: سبب واضح وزرّ إصلاح بدل رسالة عامة
    if (!ok && (Loc.why === 'off' || Loc.why === 'denied')) setTimeout(() => locFailSheet(Loc.why), 200);
  },
  /** رسالة الفشل المناسبة (لا نكرّرها إن ظهرت نافذة الإصلاح) */
  failMsg(why, t) { if (why !== 'off' && why !== 'denied') toast(t || 'تعذّر التحديد التلقائي — اختر مدينتك من القائمة'); },
};

/* ───────── وسن 6.3 · البحث في مدن العالم (٧٣٠٠ مدينة، بالعربية أو اللاتينية) ───────── */
const CitySearch = {
  lat(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'`‘ʻʼ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); },
  cc() { return (Loc.get() || {}).cc || (Geo.devZone() || [])[1] || 'SA'; },
  _idx() {
    if (this._n) return;
    const C = window.NOOR_CITIES || [];
    this._n = C.map(c => normAr(c[0])); this._l = C.map(c => this.lat(c[5] || (/[a-z]/i.test(c[0]) ? c[0] : '')));
  },
  find(q, limit) {
    const C = window.NOOR_CITIES || [], cc = this.cc(), lim = limit || 60;
    const nq = normAr(q || '').trim(), lq = this.lat(q);
    if (!nq && !lq) { const out = []; for (let i = 0; i < C.length && out.length < 80; i++) if (C[i][1] === cc) out.push(i); return out; }
    this._idx(); const sc = [], ar = /[\u0600-\u06ff]/.test(nq);
    for (let i = 0; i < C.length; i++) {
      let s = -1;
      if (ar) { const an = this._n[i]; if (an === nq) s = 100; else if (an === 'ال' + nq) s = 97; else if (an.startsWith(nq)) s = 80; else if ((' ' + an).includes(' ' + nq) || (' ' + an + ' ').includes(' ال' + nq + ' ')) s = 70; else if (nq.length > 2 && an.includes(nq)) s = 40;
        else { const cn = normAr(NOOR_COUNTRIES[C[i][1]] || ''); if (cn === nq) s = 35; else if (nq.length > 2 && cn.startsWith(nq)) s = 30; } }
      else if (lq.length >= 2) { const ln = this._l[i]; if (ln) { if (ln === lq) s = 95; else if (ln.startsWith(lq)) s = 75; else if ((' ' + ln).includes(' ' + lq)) s = 65; else if (lq.length > 2 && ln.includes(lq)) s = 40; } }
      if (s >= 0) sc.push([s + (C[i][1] === cc ? 12 : 0) - i / 1e5, i]);
    }
    sc.sort((a, b) => b[0] - a[0]); return sc.slice(0, lim).map(x => x[1]);
  },
  loc(i) { const c = NOOR_CITIES[i], tz = (window.NOOR_TZL || [])[c[4]]; const v = { lat: c[2], lng: c[3], label: c[0], cc: c[1], src: 'city', ts: Date.now() }; if (tz) v.tz = tz; return v; },
  row(i, attr, chev) {
    const c = NOOR_CITIES[i], en = c[5] && /[\u0600-\u06ff]/.test(c[0]) ? ' · <span dir="ltr">' + esc(c[5]) + '</span>' : '';
    return '<button class="li" ' + attr + '="' + i + '"><div class="ic">' + icon('pin') + '</div><div class="grow"><div class="t">' + esc(c[0]) + '</div><div class="s">' + esc(NOOR_COUNTRIES[c[1]] || c[1]) + en + '</div></div>' + (chev === false ? '' : '<div class="end">' + icon('chev') + '</div>') + '</button>';
  },
};

/* وسن 6.3: فشل تحديد الموقع — السبب وزرّ الإصلاح */
function locFailSheet(why) {
  const off = why === 'off';
  Sheet.open('<div class="sh-t">' + (off ? 'خدمة الموقع مغلقة في هاتفك' : 'لم يُسمح لوسن باستخدام الموقع') + '</div><div class="sh-s">' +
    (off ? 'فعّل «الموقع» من إعدادات الهاتف ثم عُد إلى التطبيق، وسنحدّد موقعك تلقائيًا لحساب المواقيت بدقة.' : 'افتح إعدادات التطبيق ← الأذونات ← الموقع واختر «السماح أثناء استخدام التطبيق»، أو اختر مدينتك من القائمة.') + '</div>' +
    '<div class="mx" style="display:grid;gap:10px;margin-top:8px"><button class="btn gold block" id="lf-go">' + icon(off ? 'gps' : 'gear') + (off ? 'افتح إعدادات الموقع' : 'افتح إعدادات التطبيق') + '</button>' +
    '<button class="btn ghost block" id="lf-city">' + icon('search') + 'اختر مدينتك من القائمة</button></div>', el => {
      $('#lf-go', el).onclick = () => { Loc._retry = true; Native.call(off ? 'openLocationSettings' : 'openAppSettings'); Sheet.close(); };
      $('#lf-city', el).onclick = () => { Sheet.close(); if (typeof Onboarding !== 'undefined' && Onboarding.el) { const q = document.getElementById('o-q'); if (q) q.focus(); return; } Router.go('location'); };
    });
}
/* بعد العودة من إعدادات الموقع/الأذونات نعيد المحاولة مرة واحدة */
function locRetry() {
  if (!Loc._retry) return; Loc._retry = false;
  if (Native.has('locationPermitted') && !Native.call('locationPermitted')) return;
  if (Native.has('locationEnabled') && !Native.call('locationEnabled')) return;
  toast('جارٍ تحديد موقعك…');
  Loc.request(ok => {
    if (ok) toast('تم تحديد موقعك: ' + Loc.eff().label); else Loc.failMsg(Loc.why);
    try { if (typeof Onboarding !== 'undefined' && Onboarding.el) { if (ok && Onboarding.step === 1) { Onboarding.step = 2; Onboarding.draw(); } } else Router.refresh(); } catch (e) {}
  });
}
window.onLocSettingsBack = () => locRetry();
Bus.on('resume', () => setTimeout(locRetry, 400));

/* ترحيل 5.1: موقع محفوظ من إصدار سابق بلا دولة أو منطقة زمنية */
try { const v = Loc._v; if (v && v.lat != null && (!v.tz || !v.cc)) { if (!v.cc) v.cc = Geo.ccFor(v.lat, v.lng, null, v.src); if (!v.tz) v.tz = Geo.tzFor(v.lat, v.lng, v.cc, v.src); Store.set('loc', v); } } catch (e) { console.error(e); }

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
  if (cur && Loc.pinned() && !Loc._awaitOld) return;   // اختيار يدوي يبقى كما هو
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
    if (!cur || !Loc.pinned() || asked) Loc.fromCoords(j.lat, j.lng, 'gps', j.label || null, j.cc || null);
    if (asked) Loc._finish(true);
  } else if (asked) Loc._finish(false, j && j.reason);
};

/* ───────── المواقيت ───────── */
const Times = {
  cache: {}, _tz: undefined,
  clear() { this.cache = {}; this._tz = undefined; },
  method() { const l = Loc.eff(); return Settings.method || (l && l.cc ? NoorEngine.methodFor(l.cc) : 'mwl'); },
  /** وسن 6.3: «ضبط المواقيت» على تقويم مسجدك — يُطبَّق قرب مكان الضبط فقط (٦٠ كم) */
  calib() {
    const c = Settings.calib; if (!c || typeof c.fajr !== 'number') return null;
    const l = Loc.eff(); if (c.at && l && NoorEngine.distanceKm(l.lat, l.lng, c.at.lat, c.at.lng) > 60) return null;
    return c;
  },
  calibAway() { const c = Settings.calib; return !!(c && typeof c.fajr === 'number' && !this.calib()); },
  custom() { const c = this.calib(); return c ? NoorEngine.calibMethod(c) : null; },
  /** طريقة الحساب الفعلية (بعد الضبط إن وُجد) */
  eff() { return this.custom() || NoorEngine.METHODS[this.method()] || NoorEngine.METHODS.mwl; },
  asr() { const c = this.calib(); return c ? c.asr : Settings.asr; },
  methodName() { if (this.calib()) return 'مضبوطة على مواقيت ' + (Settings.calib.src || 'مسجدك'); const m = NoorEngine.METHODS[this.method()]; return m ? m.name : ''; },
  /** وسن 5.1: منطقة زمنية للمدينة المختارة إن اختلفت عن ساعة الهاتف (وإلا null فتُحسب بساعة الهاتف) */
  tz() {
    if (this._tz !== undefined) return this._tz;
    const l = Loc.eff(); let r = null;
    if (l && l.tz && l.src !== 'gps' && l.src !== 'default' && Geo.canon(l.tz) !== Geo.canon(Geo.devTz())) { const o = Geo.offset(l.tz); if (o != null && Math.abs(o - Geo.devOffset()) > .01) r = l.tz; }
    return (this._tz = r);
  },
  tzNote() { const z = this.tz(); return z ? 'بتوقيت ' + Loc.eff().label + ' (' + Geo.fmtOff(Geo.offset(z)) + ')' : ''; },
  /** «اليوم» بتقويم الموقع (يختلف عن تقويم الهاتف فقط للمدن البعيدة قرب منتصف الليل) */
  locDay(now) { const z = this.tz(); if (!z) return now; const p = Geo.parts(z, now); return p ? new Date(p.year, p.month - 1, p.day, 12) : now; },
  forDay(d) {
    const k = dayKey(d); if (this.cache[k]) return this.cache[k];
    const l = Loc.eff(); const h = hijriOf(d), z = this.tz();
    const opt = { lat: l.lat, lng: l.lng, method: this.method(), custom: this.custom(), asr: this.asr(), highLat: Settings.highLat, adjust: Settings.adjust, ramadan: h.month === 9 };
    const o = {}, KS = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'midnight', 'lastThird'];
    if (z) {  // مدينة بمنطقة زمنية أخرى: نحسب بتوقيتها، ونحوّل إلى لحظات مطلقة
      const u0 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), off = Geo.offset(z, new Date(u0 + 12 * 3600e3));
      const T = NoorEngine.prayerTimes(startOfDay(d), Object.assign(opt, { tz: off }));
      KS.forEach(x => { if (T[x] == null || isNaN(T[x])) { o[x] = null; return; } const t = new Date(u0 + Math.round((T[x] - off) * 60) * 60000); t._tz = z; o[x] = t; });
      o.polar = !!T.polar;
    } else {
      const T = NoorEngine.prayerTimes(startOfDay(d), opt);
      KS.forEach(x => { o[x] = NoorEngine.toDate(startOfDay(d), T[x]); });
      o.polar = !!T.polar;
    }
    return (this.cache[k] = o);
  },
  next(now) {
    const day = this.locDay(now), t = this.forDay(day);
    for (const k of FIVE) if (t[k] && t[k] > now) return { key: k, time: t[k], day };
    const d2 = addDays(day, 1); return { key: 'fajr', time: this.forDay(d2).fajr, day: d2, tomorrow: true };
  },
  prev(now) {
    const day = this.locDay(now), t = this.forDay(day); let p = null;
    for (const k of FIVE) if (t[k] && t[k] <= now) p = { key: k, time: t[k] };
    if (!p) p = { key: 'isha', time: this.forDay(addDays(day, -1)).isha };
    return p;
  },
  /** تنبيه: ساعة الهاتف لا تطابق منطقة موقعك (في الدول ذات المنطقة الزمنية الواحدة فقط، تجنّبًا للإنذار الكاذب) */
  tzMismatch() {
    const l = Loc.get(); if (!l || l.src !== 'gps' || !l.cc) return null;
    const zs = (window.NOOR_TZ || []).filter(z => z[1] === l.cc); if (!zs.length) return null;
    const now = new Date(), offs = zs.map(z => Geo.offset(z[0], now)).filter(x => x != null); if (!offs.length || offs.some(x => Math.abs(x - offs[0]) > .01)) return null;
    const dev = Geo.devOffset(now); return Math.abs(offs[0] - dev) >= 1 ? { want: offs[0], dev } : null;
  },
  phase(now) {
    const t = this.forDay(this.locDay(now));
    if (now < t.fajr) return 'night';
    if (now < t.sunrise) return 'dawn';
    if (now < t.asr) return 'day';
    if (now < t.maghrib) return 'afternoon';
    if (now < t.isha) return 'sunset';
    return 'night';
  },
};
Bus.on('settings', k => { if (['method', 'asr', 'highLat', 'adjust', 'hijriOffset', 'calib'].includes(k)) { Times.clear(); Notif.schedule(); } if (k === 'notif' || k === 'preNotif' || k === 'clock') Notif.schedule(); });
Bus.on('day', () => { Times.clear(); Notif.schedule(); });
/* وسن 5.1: عند السفر يغيّر الهاتف منطقته الزمنية — نعيد الحساب فورًا عند العودة للتطبيق */
let _devTzSig = Geo.devTz() + '|' + Geo.devOffset();
Bus.on('resume', () => {
  const sig = Geo.devTz() + '|' + Geo.devOffset(); if (sig === _devTzSig) return; _devTzSig = sig;
  Times.clear(); Loc._g = null; const v = Loc.get(); if (v && (v.src === 'gps' || v.src === 'default')) { v.tz = Geo.devTz() || v.tz; Store.set('loc', v); }
  Notif.schedule(); try { Router.refresh(); } catch (e) {}
});

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
    const l = Loc.eff(), m = Times.eff(), now = new Date(), R = Settings.remind || {};
    // وسن 6.3: فروق الجهة الرسمية/الضبط + تعديل المستخدم = تعديل واحد تفهمه النواة (WasanTimes)
    const adj = {}; ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(k => { adj[k] = (+(Settings.adjust || {})[k] || 0) + (+(m.off || {})[k] || 0); });
    const ram = []; for (let i = 0; i < 90; i++) { const d = addDays(now, i); if (hijriOf(d).month === 9) ram.push(dayKey(d)); }
    const white = []; if (R.white) for (let i = 0; i < 90; i++) { const d = addDays(now, i); if (hijriOf(d).day === 12) white.push(dayKey(d)); }
    return {
      v: 1, lat: l.lat, lng: l.lng, label: l.label,
      fajr: m.fajr, isha: typeof m.isha === 'number' ? m.isha : null, ishaMin: typeof m.isha === 'object' ? m.isha.min : 0,
      ramIshaMin: m.ramadanIsha ? m.ramadanIsha.min : 0, maghrib: typeof m.maghrib === 'number' ? m.maghrib : 0, jafari: m.midnight === 'jafari',
      asr: Times.asr() === 'hanafi' ? 2 : 1, highLat: Settings.highLat || 'angle', adjust: adj,
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

/* ── وسن 4.3 → 6.3 · صحة التنبيهات: هل سيصل الأذان في وقته؟ ── */
const OEM_AUTO = { xiaomi: 'شاومي', redmi: 'شاومي', poco: 'بوكو', oppo: 'أوبو', realme: 'ريلمي', oneplus: 'ون بلس', vivo: 'فيفو', iqoo: 'فيفو', huawei: 'هواوي', honor: 'أونر', samsung: 'سامسونج', asus: 'أسوس', tecno: 'تكنو', infinix: 'إنفينكس', itel: 'آيتل', letv: 'ليإيكو' };
const NotifHealth = {
  state() {
    const q = (f, d) => { if (!Native.has(f)) return d; const v = Native.call(f); return v == null ? d : !!v; };
    const oem = Native.has('oem') ? String(Native.call('oem') || '') : '';
    return { sup: Notif.supported(), notif: q('notifEnabled', true), exact: q('canExactAlarm', true), battery: q('batteryExempt', true),
      any: FIVE.some(k => Settings.notif[k]), loc: !!Loc.get(), strong: q('adhanStrong', true), oem, oemName: OEM_AUTO[oem] || '',
      mode: Native.has('adhanMode') ? String(Native.call('adhanMode') || '') : '' };
  },
  broken(s) { s = s || this.state(); return !!(s.sup && s.any && (!s.notif || !s.exact)); },
  weak(s) { s = s || this.state(); return !!(s.sup && s.any && !this.broken(s) && !s.battery); },
  /** آخر ما وصل من الأذان (للتحقق من الدقة) */
  log() { try { const a = JSON.parse(Native.call('adhanLog') || '[]'); return Array.isArray(a) ? a.filter(x => x && x.at).reverse() : []; } catch (e) { return []; } },
  /** وسن 6.3: نسأل مرة كل ثلاثة أيام على الأكثر إن كان الأذان لن يصل في وقته */
  maybeAsk() {
    try {
      if (!Store.get('onboarded', 0) || (typeof Onboarding !== 'undefined' && Onboarding.el) || Sheet.el) return;
      const s = this.state(); if (!this.broken(s) && s.loc) return;
      const last = +Store.get('nhAsk', 0); if (Date.now() - last < 3 * 864e5) return;
      Store.set('nhAsk', Date.now()); notifHealthSheet(true);
    } catch (e) { console.error(e); }
  },
};
/* نتيجة نافذة إذن الإشعارات: إن رُفض (أو رُفض سابقًا نهائيًا) نفتح إعدادات الإشعارات */
window.onNotifPerm = ok => {
  const cb = NotifHealth._onPerm; NotifHealth._onPerm = null;
  if (!ok && NotifHealth._wantNotif) Native.call(Native.has('openNotifSettings') ? 'openNotifSettings' : 'openChannelSettings', 'adhan');
  NotifHealth._wantNotif = false;
  if (cb) try { cb(ok); } catch (e) { console.error(e); }
  if (NotifHealth._redraw) NotifHealth._redraw();
  Notif.schedule();
};
/** يطلب إذن الإشعارات (النافذة أو الإعدادات) ثم يتابع */
function askNotif(then) {
  NotifHealth._wantNotif = true; NotifHealth._onPerm = then || null;
  if (Native.has('notifAskable') && !Native.call('notifAskable')) {   // مسموحة أصلًا (أندرويد ≤ ١٢) أو قناة مغلقة
    NotifHealth._wantNotif = false;
    if (!NotifHealth.state().notif) Native.call(Native.has('openNotifSettings') ? 'openNotifSettings' : 'openChannelSettings', 'adhan');
    NotifHealth._onPerm = null; if (then) setTimeout(() => then(NotifHealth.state().notif), 300); return;
  }
  Native.call('ensureNotifPermission');
  if (!Native.has('notifAskable')) { NotifHealth._onPerm = null; if (then) setTimeout(() => then(NotifHealth.state().notif), 1600); }
}
function fmtDayShort(d) { const k = daysBetween(new Date(), d); return k === 0 ? 'اليوم' : k === -1 ? 'أمس' : weekday(d); }
function fmtLate(ms) {
  const s = Math.round(ms / 1000);
  if (Math.abs(s) < 60) return 'في وقته تمامًا';
  const m = Math.round(s / 60); return m > 0 ? 'متأخرًا ' + pM(m) : 'مبكرًا ' + pM(-m);
}
function notifHealthSheet(auto) {
  const row = (ok, ic, t, okS, badS, btn, id, soft) => '<div class="li nh-row ' + (ok ? 'ok' : soft ? 'soft' : 'bad') + '"><div class="ic">' + icon(ok ? 'check' : ic) + '</div><div class="grow"><div class="t">' + t + '</div>' +
    '<div class="s">' + (ok ? okS : badS) + '</div></div>' + (ok || !btn ? '' : '<button class="act" id="' + id + '">' + btn + '</button>') + '</div>';
  const draw = () => {
    const s = NotifHealth.state(), bad = NotifHealth.broken(s), l = Loc.eff(), lg = NotifHealth.log().slice(0, 4);
    const sdk = Native.has('sdkInt') ? +Native.call('sdkInt') : 0;
    const head = bad ? 'خطوة واحدة ليصلك الأذان في وقته' : !s.loc ? 'حدّد موقعك لمواقيت دقيقة' : s.battery ? 'كل شيء جاهز — سيصلك الأذان بإذن الله' : 'جاهز، وننصح باستثناء وسن من توفير البطارية';
    const sub = bad ? 'بعض الأذونات ناقصة، فقد يتأخر الأذان أو لا يصل. اضغط «السماح» بجانب كل بند ثم عُد إلى هنا.' : !s.loc ? 'المواقيت الآن تقريبية لـ«' + esc(l.label) + '» حسب منطقتك الزمنية.' : 'راجع البنود أدناه متى شئت.';
    return '<div id="nh-sheet"><div class="sh-t">' + head + '</div><div class="sh-s">' + sub + '</div>' +
      '<div class="list mx">' +
      row(s.loc, 'pin', 'الموقع', esc(l.label) + ' — مواقيت دقيقة لمكانك', 'تقريبي (' + esc(l.label) + ') — حدّد موقعك', 'تحديد', 'nh-l') +
      row(s.notif, 'belloff', 'الإشعارات', 'مسموحة', 'غير مسموحة — لن يظهر الأذان ولن يُرفع صوته', 'السماح', 'nh-n') +
      (sdk === 0 || sdk >= 31 ? row(s.exact, 'alarm', 'المنبّهات والتذكيرات', 'مسموحة — الأذان في دقيقته', 'غير مسموحة — قد يتأخر الأذان حتى ساعة', 'السماح', 'nh-e') : '') +
      row(s.battery, 'battery', 'البطارية', 'غير مقيّد — يعمل في الخلفية', 'مقيّد — ' + (sdk >= 31 ? 'اضغط «البطارية» ثم اختر «غير مقيّد»' : 'قد يؤخّر النظام الأذان'), 'فتح', 'nh-b', true) +
      (s.oemName ? row(false, 'shield', 'التشغيل التلقائي (' + s.oemName + ')', '', 'فعّل «التشغيل التلقائي» لوسن كي لا يوقفه الهاتف', 'فتح', 'nh-a', true) : '') +
      '</div>' +
      (Native.has('setAdhanStrong') ? '<div class="list mx" style="margin-top:10px"><button class="li" id="nh-s"><div class="ic">' + icon('alarm') + '</div><div class="grow"><div class="t">أذان بأولوية المنبّه</div><div class="s">' +
        (s.strong ? 'مفعّل — أقوى ضمان للوقت (يظهر رمز منبّه صغير في شريط الحالة)' : 'معطّل — قد يؤخّر توفير البطارية الأذان في بعض الهواتف') + '</div></div><span class="switch ' + (s.strong ? 'on' : '') + '"></span></button></div>' : '') +
      (lg.length ? '<div class="nh-log mx"><div class="nh-lt">' + icon('clock') + 'آخر ما وصل</div>' + lg.map(x => {
        const late = (x.f || x.at) - x.at, ok = Math.abs(late) < 60000;
        return '<div class="nh-li ' + (ok ? 'ok' : 'late') + '"><b>' + esc(x.k === 'test' ? 'أذان تجريبي' : (x.ch === 'pre' ? 'قبل ' : '') + (x.n || PNAME[x.k] || '')) + '</b><span>' + fmtDayShort(new Date(x.at)) + ' · ' + fmtTime(new Date(x.at)) + '</span><i>' + fmtLate(late) + '</i></div>';
      }).join('') + '</div>' : '') +
      (Native.has('testAdhan') ? '<div class="mx" style="margin-top:12px"><button class="btn gold block" id="nh-t">' + icon('bell') + 'جرّب الأذان الآن</button></div>' : '') +
      (auto ? '<div class="mx" style="margin-top:8px"><button class="btn ghost block" id="nh-x">لاحقًا</button></div>' : '') + '</div>';
  };
  const bind = el => {
    const b = id => el.querySelector('#' + id);
    if (b('nh-l')) b('nh-l').onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request((ok, why) => { if (ok) toast('تم تحديد موقعك: ' + Loc.eff().label); else Loc.failMsg(why); if (NotifHealth._redraw) NotifHealth._redraw(); }); };
    if (b('nh-n')) b('nh-n').onclick = () => askNotif(ok => { if (ok && !NotifHealth.state().exact) Native.call('requestExactAlarm'); });
    if (b('nh-e')) b('nh-e').onclick = () => Native.call('requestExactAlarm');
    if (b('nh-b')) b('nh-b').onclick = () => Native.call('requestBatteryExemption');
    if (b('nh-a')) b('nh-a').onclick = () => Native.call('openAutostart');
    if (b('nh-s')) b('nh-s').onclick = () => { const on = !NotifHealth.state().strong; Native.call('setAdhanStrong', on); toast(on ? 'الأذان بأولوية المنبّه' : 'الأذان بمنبّه دقيق عادي'); NotifHealth._redraw && NotifHealth._redraw(); };
    if (b('nh-t')) b('nh-t').onclick = () => { askNotif(); Native.call('testAdhan'); toast('سيصلك أذان تجريبي بعد ٥ ثوانٍ — يمكنك إطفاء الشاشة', 4200); };
    if (b('nh-x')) b('nh-x').onclick = () => Sheet.close();
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
/** وسن 5.1: ملاحظات الموقع حول العالم — توقيت مدينة بعيدة، وساعة هاتف لا تطابق الموقع، والمناطق القطبية */
function geoNotes(d) {
  let s = ''; const note = (ic, b, t, id) => '<' + (id ? 'button id="' + id + '" data-go="location"' : 'div') + ' class="geo-n mx">' + icon(ic) + '<div class="grow"><b>' + b + '</b>' + (t ? '<span>' + t + '</span>' : '') + '</div>' + (id ? icon('chev') + '</button>' : '</div>');
  const tn = Times.tzNote(); if (tn) s += note('globe', esc(tn), 'المواقيت معروضة بالساعة المحلية للمدينة المختارة، والأذان يصلك في لحظته الصحيحة', 'p-tzn');
  const mm = Times.tzMismatch(); if (mm) s += note('warn', 'ساعة هاتفك (' + Geo.fmtOff(mm.dev) + ') لا تطابق منطقة موقعك (' + Geo.fmtOff(mm.want) + ')', 'صحّح «المنطقة الزمنية» من إعدادات الهاتف لتظهر المواقيت بساعتك الصحيحة');
  if (Times.forDay(d).polar) s += note('info', 'موقعك قرب القطب: الشمس لا تغيب أو لا تشرق هذه الأيام', 'حُسبت المواقيت بأقرب خط عرض تتعاقب فيه الشمس (٦٠°) — ويمكنك مطابقتها بتقويم مسجدك من «تعديل يدوي»');
  return s;
}
SCREENS.prayer = {
  tab: 'prayer',
  render(a) {
    const now = new Date(), d = addDays(Times.locDay(now), PS.off), l = Loc.eff();
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
      (PS.off === 0 && !Loc.get() ? '<button class="nh-warn gloc" id="p-nl">' + icon('pin') + '<div class="grow"><b>المواقيت تقريبية لـ«' + esc(l.label) + '»</b><span>حدّد موقعك ليُحسب الأذان لمكانك بالدقيقة</span></div>' + icon('gps') + '</button>' : '') +
      (PS.off === 0 && Times.calibAway() ? '<button class="nh-warn soft" id="p-ca">' + icon('info') + '<div class="grow"><b>ضبط المواقيت محفوظ لـ«' + esc(Settings.calib.label || '') + '»</b><span>أنت الآن بعيد عنه، فنحسب بطريقة بلدك — اضغط لضبط جديد</span></div>' + icon('chev') + '</button>' : '') +
      (ad ? duaCard(now, ad) : '') + geoNotes(d) +
      '<div class="list ptl" id="p-list">' + prayerRows(d, now, bells) + '</div>' +
      '<div class="row mx mt" style="gap:10px"><button class="btn ghost grow" data-go="month">' + icon('calendar') + 'جدول الشهر</button>' +
      '<button class="btn ghost grow" id="p-meth">' + icon('gear') + 'الإعدادات</button></div>' +
      sec('إعدادات الحساب') +
      '<div class="list mx">' +
      '<button class="li" id="p-m"><div class="ic">' + icon('globe') + '</div><div class="grow"><div class="t">طريقة الحساب</div><div class="s">' + esc(Times.methodName()) + (Settings.method ? '' : ' · تلقائي') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="p-cal"><div class="ic g">' + icon('target') + '</div><div class="grow"><div class="t">ضبط المواقيت على مسجدك</div><div class="s">' + (Times.calib() ? 'مفعّل · ' + esc(calibSummary(Settings.calib)) : 'أدخل مواقيت اليوم الرسمية فنحسب بها كل الأيام') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="p-asr"><div class="ic">' + icon('asr') + '</div><div class="grow"><div class="t">وقت العصر</div><div class="s">' + (Times.asr() === 'hanafi' ? 'المذهب الحنفي (ظل المثلين)' : 'الجمهور (ظل المثل)') + (Times.calib() ? ' · من الضبط' : '') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="p-adj"><div class="ic">' + icon('clock') + '</div><div class="grow"><div class="t">تعديل يدوي للأوقات</div><div class="s">' + adjSummary() + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="location"><div class="ic">' + icon('pin') + '</div><div class="grow"><div class="t">الموقع</div><div class="s">' + esc(l.label) + ' · ' + N(l.lat.toFixed(3)) + '، ' + N(l.lng.toFixed(3)) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '</div>' + (bells ? '' : '<div class="foot-note">' + icon('info', '', 'width:15px;height:15px;display:inline-block;vertical-align:-3px') + ' لتفعيل تنبيهات الأذان ثبّت الإصدار الكامل من التطبيق (النواة الأصلية 2.0).</div>');
  },
  mount(el, a) {
    $('#pd-prev', el).onclick = () => { PS.off--; Router.refresh(); };
    const nh = $('#p-nh', el); if (nh) nh.onclick = () => notifHealthSheet();
    const nl = $('#p-nl', el); if (nl) nl.onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request((ok, why) => { if (ok) toast('تم تحديد موقعك: ' + Loc.eff().label); else Loc.failMsg(why); Router.refresh(); }); };
    const ca = $('#p-ca', el); if (ca) ca.onclick = () => Router.go('calib');
    $('#p-cal', el).onclick = () => Router.go('calib');
    const dc = $('#p-dua', el);
    if (dc) {
      const ad = adhanNow(new Date(), a);
      $('#pd-pr', el).onclick = e => { if (!ad) return; const i = FIVE.indexOf(ad.key); if (!Tracker.has(ad.time, i)) { Tracker.set(ad.time, i, true); vibrate(25); toast('تقبّل الله صلاتك'); }
        e.currentTarget.classList.add('on'); e.currentTarget.innerHTML = icon('check') + 'سُجّلت صلاتك'; };
      $('#pd-stop', el).onclick = e => { Native.call('stopAdhan'); e.currentTarget.hidden = true; AdhanPill.set(false); };
      $('#pd-cp', el).onclick = () => copyText(DUA_ADHAN);
    }
    $('#pd-next', el).onclick = () => { PS.off++; Router.refresh(); };
    $('#p-loc', el).onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request((ok, why) => { if (ok) toast('تم تحديث الموقع: ' + Loc.eff().label); else Loc.failMsg(why, 'تعذّر تحديد الموقع'); Router.refresh(); }); };
    $('#p-meth', el).onclick = () => Router.go('settings');
    $('#p-m', el).onclick = () => methodSheet(() => Router.refresh());
    $('#p-asr', el).onclick = () => Times.calib() ? toast('وقت العصر مأخوذ من ضبط المواقيت — عدّله من «ضبط المواقيت»') : pickSheet('وقت العصر', 'يختلف حسب المذهب الفقهي', [
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
  pickSheet('طريقة الحساب', Times.calib() ? 'اختيار طريقة يلغي «ضبط المواقيت» الحالي' : 'اختر الطريقة المعتمدة في بلدك', opts, Times.calib() ? '\u0000' : Settings.method, v => {
    if (Settings.calib) setSetting('calib', null);
    setSetting('method', v); toast('تم تحديث طريقة الحساب'); if (done) done(); });
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

/* ═══════════════ وسن 6.3 · ضبط المواقيت على تقويم مسجدك أو الجهة الرسمية ═══════════════
   تُدخل المستخدمة مواقيت يوم (أو أيام) كما في تقويم مسجدها، فنستنتج زاويتي الفجر والعشاء ومذهب العصر
   وفروق الدقائق، ثم تُحسب بها مواقيت كل الأيام — ويصل الأذان (حتى والتطبيق مغلق) بالضبط نفسه. */
const CAL_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const fmtDeg = x => '\u2066' + N((+x).toFixed(1).replace(/\.0$/, '')) + '°\u2069';
const sgnMin = v => '\u2066' + (v > 0 ? '+' : '−') + N(Math.abs(v)) + '\u2069';
function calibSummary(c) {
  if (!c) return '';
  const o = c.off || {}, offs = CAL_KEYS.filter(k => o[k]).map(k => PNAME[k] + ' ' + sgnMin(o[k]));
  return 'الفجر ' + fmtDeg(c.fajr) + ' · العشاء ' + (typeof c.isha === 'number' ? fmtDeg(c.isha) : N(c.ishaMin) + ' د بعد المغرب') + (offs.length ? ' · ' + offs.join('، ') : '');
}
/** «HH:MM» بساعة الموقع (لخانات الوقت) */
function hm24(d) { if (!d || isNaN(d)) return ''; let h = d.getHours(), m = d.getMinutes(); if (d._tz) { const p = Geo.parts(d._tz, d); if (p) { h = p.hour; m = p.minute; } } return pad2(h) + ':' + pad2(m); }
const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const fmtDateLong = d => N(d.getDate()) + ' ' + gMonthNames()[d.getMonth()] + ' ' + N(d.getFullYear());
const CS = {
  refs: null, mode: 'auto', src: 'مسجدك', res: null,
  init() { const d = new Date(); this.refs = [this.blank(d)]; this.res = null; },
  blank(d) { const t = Times.forDay(d), o = {}; CAL_KEYS.forEach(k => o[k] = hm24(t[k])); return { d: ymd(d), t: o, ed: {} }; },
  tzAt(date) { const z = Times.tz(); return z ? Geo.offset(z, date) : -date.getTimezoneOffset() / 60; },
  day(s) { const p = String(s || '').split('-').map(Number); return p.length === 3 && p[0] ? new Date(p[0], p[1] - 1, p[2], 12) : null; },
};
function calPreview(res) {
  const l = Loc.eff(), cm = NoorEngine.calibMethod(res), z = Times.tz(), now = new Date(), fmtH = h => {
    if (h == null || isNaN(h)) return '--:--'; const m = ((Math.round(h * 60) % 1440) + 1440) % 1440; let hh = Math.floor(m / 60); const mm = m % 60;
    if (Settings.clock === '12') { hh = hh % 12 || 12; return N(hh + ':' + pad2(mm)); } return N(pad2(hh) + ':' + pad2(mm)); };
  let rows = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(Times.locDay(now), i), T = NoorEngine.prayerTimes(startOfDay(d), { lat: l.lat, lng: l.lng, tz: z ? Geo.offset(z, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)) : -new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTimezoneOffset() / 60,
      custom: cm, asr: res.asr, highLat: Settings.highLat, ramadan: hijriOf(d).month === 9 });
    rows += '<tr' + (i === 0 ? ' class="today"' : '') + '><td class="dd">' + (i === 0 ? 'اليوم' : weekday(d).replace('ال', '')) + ' <small>' + N(d.getDate()) + '/' + N(d.getMonth() + 1) + '</small></td>' + CAL_KEYS.map(k => '<td>' + fmtH(T[k]) + '</td>').join('') + '</tr>';
  }
  return '<div class="cb-tab"><table class="tt"><thead><tr><th></th>' + CAL_KEYS.map(k => '<th>' + PNAME[k] + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}
const CAL_WARN = {
  fajr: 'زاوية الفجر الناتجة غير معتادة — تأكد من وقت الفجر المُدخل',
  isha: 'وقت العشاء الناتج غير معتاد — تأكد من الوقت المُدخل',
  asr: 'فرق العصر كبير — تأكد من الوقت أو من المذهب',
  sunrise: 'فرق الشروق كبير — غالبًا الموقع غير دقيق أو التقويم لمدينة أخرى',
  dhuhr: 'فرق الظهر كبير — غالبًا الموقع غير دقيق أو التقويم لمدينة أخرى',
  maghrib: 'فرق المغرب كبير — غالبًا الموقع غير دقيق أو التقويم لمدينة أخرى',
};
function calResult(res) {
  if (!res) return '';
  const o = res.off || {}, fit = res.fit || [], offs = ['sunrise', 'dhuhr', 'asr', 'maghrib'].filter(k => o[k]);
  const bad = []; fit.forEach((f, i) => Object.keys(f).forEach(k => { if (f[k]) bad.push((fit.length > 1 ? 'اليوم ' + N(i + 1) + ': ' : '') + PNAME[k] + ' ' + sgnMin(f[k])); }));
  const line = (ic, t, v) => '<div class="cb-l">' + icon(ic) + '<span>' + t + '</span><b>' + v + '</b></div>';
  return '<div class="card mx mt pad cb-res"><div class="cb-rt">' + icon('check') + 'النتيجة</div>' +
    line('fajr', 'الفجر', 'زاوية ' + fmtDeg(res.fajr) + (o.fajr ? ' ' + sgnMin(o.fajr) + ' د' : '')) +
    line('isha', 'العشاء', typeof res.isha === 'number' ? 'زاوية ' + fmtDeg(res.isha) : N(res.ishaMin) + ' دقيقة بعد المغرب' + (res.ramIshaMin ? ' (' + N(res.ramIshaMin) + ' في رمضان)' : '')) +
    line('asr', 'العصر', res.asr === 'hanafi' ? 'الحنفي (ظل المثلين)' : 'الجمهور (ظل المثل)') +
    line('clock', 'فروق بالدقائق', offs.length ? offs.map(k => PNAME[k] + ' ' + sgnMin(o[k])).join('، ') : 'لا فروق') +
    '<div class="cb-ok ' + (bad.length ? 'warn' : '') + '">' + icon(bad.length ? 'info' : 'check') + (bad.length ? 'قريب جدًا مما أدخلته (فروق طفيفة: ' + bad.join('، ') + ')' : 'يطابق ما أدخلته تمامًا') + '</div>' +
    (res.warn || []).map(k => '<div class="cb-w">' + icon('warn') + CAL_WARN[k] + '</div>').join('') +
    '<div class="cb-pt">مواقيت الأيام السبعة القادمة بهذا الضبط</div>' + calPreview(res) +
    '<button class="btn gold block" id="cb-ok" style="margin-top:14px">' + icon('check') + 'اعتمد هذا الضبط لكل الأيام</button></div>';
}
SCREENS.calib = {
  parent: 'prayer',
  render() {
    if (!CS.refs) CS.init();
    const l = Loc.eff(), c = Times.calib();
    const day = (r, i) => '<div class="card mx mt pad cb-day"><div class="cb-dh"><b>' + (CS.refs.length > 1 ? 'اليوم ' + N(i + 1) : 'مواقيت يوم') + '</b>' +
      '<input type="date" class="field cb-date" data-d="' + i + '" value="' + esc(r.d) + '">' + (i > 0 ? '<button class="ibtn plain" data-rm="' + i + '" aria-label="حذف">' + icon('x') + '</button>' : '') + '</div>' +
      '<div class="cb-grid">' + CAL_KEYS.map(k => '<label class="cb-f"><span>' + icon(PICON[k]) + PNAME[k] + '</span><input type="time" dir="ltr" data-i="' + i + '" data-k="' + k + '" value="' + esc(r.t[k] || '') + '"></label>').join('') + '</div></div>';
    return hdr('ضبط المواقيت', 'على تقويم مسجدك أو الجهة الرسمية', { back: true, compact: true }) +
      (c ? '<div class="card mx mt pad cb-on"><div class="cb-rt">' + icon('check') + 'الضبط مفعّل لـ«' + esc(c.label || l.label) + '»</div><div class="faint" style="font-size:13px;line-height:1.8">' + esc(calibSummary(c)) + '<br>منذ ' + esc(fmtDateLong(new Date(c.ts || Date.now()))) + '</div>' +
        '<button class="btn ghost block" id="cb-off" style="margin-top:10px">' + icon('refresh') + 'إلغاء الضبط والعودة لطريقة بلدك</button></div>' : '') +
      '<div class="nh-tip">' + icon('info') + '<span>انقل مواقيت اليوم كما في <b>تقويم مسجدك</b> أو <b>موقع الوزارة/الأوقاف</b> في بلدك (عدّل المختلف منها فقط)، واضغط «احسب»: نستنتج زاويتي الفجر والعشاء ومذهب العصر وفروق الدقائق، ثم تُحسب بها مواقيت كل الأيام والأذان.</span></div>' +
      (Loc.get() ? '' : '<button class="nh-warn gloc" id="cb-loc">' + icon('pin') + '<div class="grow"><b>حدّد موقعك أولًا</b><span>الضبط يُحسب لمكانك — الموقع الآن تقريبي (' + esc(l.label) + ')</span></div>' + icon('gps') + '</button>') +
      '<div class="mx mt faint" style="font-size:12.5px">' + icon('pin', '', 'width:14px;height:14px;display:inline-block;vertical-align:-2px') + ' ' + esc(l.label) + ' · ' + esc(Times.methodName()) + '</div>' +
      CS.refs.map(day).join('') +
      (CS.refs.length < 3 ? '<button class="btn ghost block cb-add" id="cb-add">' + icon('plus') + 'أضف يومًا آخر من التقويم (اختياري — أدقّ على مدار السنة)</button>' : '') +
      '<div class="mx mt form"><label>العشاء في تقويمك</label><div class="seg" id="cb-mode">' + [['auto', 'تلقائي'], ['angle', 'بالزاوية'], ['min', 'دقائق بعد المغرب']].map(([v, t]) => '<button data-v="' + v + '" class="' + (CS.mode === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      '<label>مصدر المواقيت</label><div class="seg" id="cb-src">' + ['مسجدك', 'التقويم الرسمي'].map(v => '<button data-v="' + v + '" class="' + (CS.src === v ? 'on' : '') + '">' + (v === 'مسجدك' ? 'مسجدي' : v) + '</button>').join('') + '</div></div>' +
      '<div class="mx mt"><button class="btn primary block" id="cb-go">' + icon('target') + 'احسب الضبط</button></div>' +
      '<div id="cb-res">' + calResult(CS.res) + '</div><div style="height:28px"></div>';
  },
  mount(el) {
    const R = () => Router.refresh();
    el.addEventListener('change', e => {
      const t = e.target;
      if (t.matches('input[type=time]')) { const r = CS.refs[+t.dataset.i]; r.t[t.dataset.k] = t.value; r.ed[t.dataset.k] = 1; CS.res = null; const box = $('#cb-res', el); if (box) box.innerHTML = ''; }
      if (t.matches('.cb-date')) { const i = +t.dataset.d, d = CS.day(t.value); if (!d) return; const r = CS.refs[i], b = CS.blank(d); r.d = t.value; CAL_KEYS.forEach(k => { if (!r.ed[k]) r.t[k] = b.t[k]; }); CS.res = null; R(); }
    });
    $$('[data-rm]', el).forEach(b => b.onclick = () => { CS.refs.splice(+b.dataset.rm, 1); CS.res = null; R(); });
    const add = $('#cb-add', el); if (add) add.onclick = () => { const last = CS.day(CS.refs[CS.refs.length - 1].d) || new Date(); CS.refs.push(CS.blank(addDays(last, 90))); CS.res = null; R(); };
    $$('#cb-mode button', el).forEach(b => b.onclick = () => { CS.mode = b.dataset.v; CS.res = null; R(); });
    $$('#cb-src button', el).forEach(b => b.onclick = () => { CS.src = b.dataset.v; $$('#cb-src button', el).forEach(x => x.classList.toggle('on', x === b)); });
    const off = $('#cb-off', el); if (off) off.onclick = () => { setSetting('calib', null); CS.init(); toast('أُلغي الضبط — نحسب بطريقة ' + Times.methodName()); R(); };
    const lc = $('#cb-loc', el); if (lc) lc.onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request((ok, why) => { if (ok) { toast('تم تحديد موقعك: ' + Loc.eff().label); CS.init(); R(); } else Loc.failMsg(why); }); };
    $('#cb-go', el).onclick = () => {
      const l = Loc.eff(), refs = [];
      for (let i = 0; i < CS.refs.length; i++) {
        const r = CS.refs[i], date = CS.day(r.d); if (!date) { toast('اختر تاريخ اليوم ' + N(i + 1)); return; }
        const t = {}; let prev = -1, order = true;
        CAL_KEYS.forEach(k => { const v = String(r.t[k] || ''); if (!/^\d{1,2}:\d{2}$/.test(v)) { t[k] = null; return; } const [h, m] = v.split(':').map(Number); t[k] = h + m / 60; if (t[k] <= prev) order = false; prev = t[k]; });
        if (!order) { toast('تحقّق من ترتيب المواقيت (الفجر ثم الشروق ثم الظهر…)', 3200); return; }
        if (t.fajr == null && t.isha == null && t.dhuhr == null) { toast('أدخل مواقيت الصلاة أولًا'); return; }
        refs.push({ date, tz: CS.tzAt(date), t });
      }
      const res = NoorEngine.calibrate(refs, { lat: l.lat, lng: l.lng, method: Times.method(), highLat: Settings.highLat, ishaMode: CS.mode });
      if (!res) { toast('تعذّر الحساب — تحقّق من المواقيت'); return; }
      CS.res = res; const box = $('#cb-res', el); box.innerHTML = calResult(res); bindOk(); setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    };
    const bindOk = () => { const ok = $('#cb-ok', el); if (!ok) return; ok.onclick = () => {
      const l = Loc.eff(), res = CS.res; if (!res) return;
      const c = Object.assign({}, res, { at: { lat: +l.lat, lng: +l.lng }, label: l.label, src: CS.src, ts: Date.now(), refs: CS.refs.map(r => ({ d: r.d, t: Object.assign({}, r.t) })) });
      delete c.fit;
      setSetting('adjust', Object.assign({}, DEFAULTS.adjust));
      setSetting('calib', c); vibrate(30);
      toast('تم ضبط المواقيت — تُحسب بها كل الأيام ويصل بها الأذان', 3600); CS.res = null; Router.back();
    }; };
    bindOk();
  },
};

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
    const src = { gps: 'تحديد تلقائي', city: 'اختيار يدوي', manual: 'إحداثيات يدوية', default: 'تقريبي حسب منطقتك الزمنية' }[l.src] || '';
    return hdr('الموقع', 'لمواقيت دقيقة واتجاه قبلة صحيح', { back: true, compact: true }) +
      '<div class="card mx mt pad"><div class="row"><div class="icbox">' + icon('pin') + '</div>' +
      '<div class="grow"><div style="font-weight:700;font-size:16px">' + esc(l.label) + (l.cc && NOOR_COUNTRIES[l.cc] ? ' <span class="faint" style="font-size:13px;font-weight:500">· ' + esc(NOOR_COUNTRIES[l.cc]) + '</span>' : '') + '</div><div class="faint num" style="font-size:12.5px">' + N(l.lat.toFixed(4)) + '، ' + N(l.lng.toFixed(4)) + ' · ' + src + '</div>' +
      '<div class="faint" style="font-size:12px;margin-top:2px">' + esc(Times.methodName()) + (Settings.method ? '' : ' (تلقائي)') + ' · ' + esc(Geo.fmtOff(Times.tz() ? Geo.offset(Times.tz()) : Geo.devOffset())) + (Times.tz() ? ' · بتوقيت المدينة' : '') + '</div></div></div>' +
      '<button class="btn primary block mt" id="l-gps">' + icon('gps') + 'تحديد موقعي تلقائيًا</button>' +
      '<button class="btn ghost block" id="l-ll" style="margin-top:8px">' + icon('marker') + 'إدخال الإحداثيات يدويًا</button></div>' +
      '<div class="mx mt"><div class="search">' + icon('search') + '<input id="l-q" placeholder="ابحث عن مدينة أو ولاية…" autocomplete="off"></div></div>' +
      '<div class="list mx mt" id="l-list"></div>';
  },
  mount(el) {
    const draw = q => {
      const arr = CitySearch.find(q, 60);
      $('#l-list', el).innerHTML = arr.length ? arr.map(i => CitySearch.row(i, 'data-city')).join('')
        : '<div class="empty">لا توجد نتائج — جرّب الاسم بالعربية أو اللاتينية، أو استخدم التحديد التلقائي أو الإحداثيات</div>';
    };
    draw('');
    $('#l-q', el).addEventListener('input', debounce(e => draw(e.target.value), 180));
    $('#l-list', el).addEventListener('click', e => {
      const b = e.target.closest('[data-city]'); if (!b) return;
      const v = CitySearch.loc(+b.dataset.city);
      Loc.set(v); toast('تم اختيار ' + v.label); Router.back();
    });
    $('#l-gps', el).onclick = () => { toast('جارٍ تحديد موقعك…'); Loc.request((ok, why) => { if (ok) { toast('تم تحديد موقعك: ' + Loc.eff().label); Router.refresh(); } else Loc.failMsg(why); }); };
    // وسن 5.1: أي مكان في العالم — بالإحداثيات مباشرة
    $('#l-ll', el).onclick = () => {
      const c = Loc.eff();
      Sheet.open('<div class="sh-t">إدخال الإحداثيات</div><div class="sh-s">لأي مكان في العالم — من خرائط الهاتف (اضغط مطوّلًا على المكان وانسخ الرقمين)</div>' +
        '<div class="form"><label>خط العرض (−90 إلى 90)</label><input id="ll-a" inputmode="decimal" dir="ltr" value="' + (+c.lat).toFixed(4) + '">' +
        '<label>خط الطول (−180 إلى 180)</label><input id="ll-o" inputmode="decimal" dir="ltr" value="' + (+c.lng).toFixed(4) + '">' +
        '<label>اسم المكان (اختياري)</label><input id="ll-n" maxlength="40" placeholder="مثال: بيتي"></div>' +
        '<button class="btn gold block" id="ll-ok" style="margin-top:14px">حفظ الموقع</button>', sh => {
          const ai = $('#ll-a', sh); ai.addEventListener('paste', ev => { const t = (ev.clipboardData || window.clipboardData).getData('text') || ''; const m = t.match(/(-?\d+(?:\.\d+)?)\s*[,،\s]\s*(-?\d+(?:\.\d+)?)/); if (m) { ev.preventDefault(); ai.value = m[1]; $('#ll-o', sh).value = m[2]; } });
          $('#ll-ok', sh).onclick = () => {
            const num = v => parseFloat(String(v).replace(/[٠-٩]/g, x => '٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace('٫', '.').replace(',', '.'));
            const la = num($('#ll-a', sh).value), lo = num($('#ll-o', sh).value), nm = $('#ll-n', sh).value.trim();
            if (!(la >= -90 && la <= 90) || !(lo >= -180 && lo <= 180) || isNaN(la) || isNaN(lo)) { toast('تحقّق من الرقمين'); return; }
            Loc.fromCoords(la, lo, 'manual', nm || null); Sheet.close(); toast('تم حفظ الموقع: ' + Loc.eff().label); setTimeout(() => Router.refresh(), 350);
          };
        });
    };
  },
};

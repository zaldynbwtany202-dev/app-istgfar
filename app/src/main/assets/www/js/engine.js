/* ════════════════════════════════════════════════════════════════
   وسن 5.1 · المحرّك الفلكي (مواقيت الصلاة · التقويم الهجري · القبلة) — لكل دول العالم
   يعمل دون إنترنت وبلا أي مكتبات خارجية.
   ─ مواقيت: خوارزمية فلكية قياسية مع تكرار للتدقيق، وطرق حساب متعددة
     (زاوية أو دقائق للعشاء/المغرب)، ومعالجة خطوط العرض العليا.
   ─ الهجري: تقويم أم القرى عبر Intl مع تعديل يدوي، واحتياطي حسابي.
   ─ القبلة: الاتجاه الابتدائي على الدائرة العظمى + المسافة.
   ════════════════════════════════════════════════════════════════ */
'use strict';

const NoorEngine = (() => {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const sin = d => Math.sin(d * D2R), cos = d => Math.cos(d * D2R), tan = d => Math.tan(d * D2R);
  const asin = x => R2D * Math.asin(x), acos = x => R2D * Math.acos(x);
  const atan2 = (y, x) => R2D * Math.atan2(y, x), acot = x => R2D * Math.atan(1 / x);
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const fixAngle = a => fix(a, 360), fixHour = a => fix(a, 24);

  const KAABA = { lat: 21.422487, lng: 39.826206 };

  /* ─────────────── طرق الحساب ───────────────
     fajr/isha: زاوية بالدرجات، أو {min: دقائق بعد المغرب} للعشاء.
     maghrib: 0 = الغروب، أو زاوية، أو {min}.  */
  const METHODS = {
    algeria:  { name: 'الجزائر — وزارة الشؤون الدينية', fajr: 18,   isha: 17 },
    mwl:      { name: 'رابطة العالم الإسلامي',          fajr: 18,   isha: 17 },
    makkah:   { name: 'أم القرى — مكة المكرمة',          fajr: 18.5, isha: { min: 90 }, ramadanIsha: { min: 120 } },
    egypt:    { name: 'الهيئة المصرية العامة للمساحة',   fajr: 19.5, isha: 17.5 },
    morocco:  { name: 'المغرب — وزارة الأوقاف',          fajr: 19,   isha: 17 },
    tunisia:  { name: 'تونس',                            fajr: 18,   isha: 18 },
    karachi:  { name: 'جامعة العلوم الإسلامية بكراتشي',  fajr: 18,   isha: 18 },
    gulf:     { name: 'الخليج — دبي',                    fajr: 18.2, isha: 18.2 },
    kuwait:   { name: 'الكويت',                          fajr: 18,   isha: 17.5 },
    qatar:    { name: 'قطر',                             fajr: 18,   isha: { min: 90 } },
    turkey:   { name: 'تركيا — رئاسة الشؤون الدينية',     fajr: 18,   isha: 17 },
    singapore:{ name: 'سنغافورة وماليزيا وإندونيسيا',    fajr: 20,   isha: 18 },
    russia:   { name: 'روسيا — الإدارة الدينية لمسلمي روسيا', fajr: 16, isha: 15 },
    france:   { name: 'فرنسا — اتحاد المنظمات (12°)',     fajr: 12,   isha: 12 },
    isna:     { name: 'أمريكا الشمالية ISNA',             fajr: 15,   isha: 15 },
    tehran:   { name: 'معهد الجيوفيزياء — طهران',        fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'jafari' },
    jafari:   { name: 'الجعفري — مؤسسة ليفا',            fajr: 16,   isha: 14, maghrib: 4,   midnight: 'jafari' },
  };
  const METHOD_ORDER = ['algeria','mwl','makkah','egypt','morocco','tunisia','karachi','gulf','kuwait','qatar','turkey','singapore','russia','france','isna','tehran','jafari'];
  /* الطريقة المقترحة حسب الدولة — وسن 5.1: لكل دول العالم (ما لم يُذكر هنا فرابطة العالم الإسلامي) */
  const COUNTRY_METHOD = { DZ:'algeria', MA:'morocco', TN:'tunisia', LY:'egypt', EG:'egypt', SD:'egypt', SS:'egypt', SA:'makkah', YE:'makkah',
    AE:'gulf', OM:'gulf', BH:'gulf', QA:'qatar', KW:'kuwait', IQ:'mwl', SY:'egypt', JO:'egypt', LB:'egypt', PS:'egypt', IL:'egypt',
    TR:'turkey', CY:'turkey', AZ:'turkey', BA:'turkey', AL:'turkey', XK:'turkey', MK:'turkey', ME:'turkey', RS:'turkey', BG:'turkey',
    PK:'karachi', IN:'karachi', BD:'karachi', AF:'karachi', LK:'karachi', NP:'karachi', MV:'karachi', BT:'karachi',
    MY:'singapore', SG:'singapore', ID:'singapore', BN:'singapore', TH:'singapore', PH:'singapore', MM:'singapore', KH:'singapore', VN:'singapore', LA:'singapore', TL:'singapore',
    IR:'tehran', RU:'russia', US:'isna', CA:'isna', FR:'france', MR:'mwl' };
  const methodFor = cc => COUNTRY_METHOD[cc] || 'mwl';

  /* ─────────────── الفلك ─────────────── */
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    const eqt = q / 15 - fixHour(RA);
    const decl = asin(sin(e) * sin(L));
    return { decl, eqt };
  }

  /**
   * يحسب مواقيت يوم معيّن.
   * @param {Date} date      اليوم (يُؤخذ التاريخ فقط)
   * @param {object} o       {lat, lng, tz, method, asr: 'shafii'|'hanafi', highLat, adjust:{fajr..isha}, ramadan}
   * @returns ساعات عشرية محلية لكل وقت + midnight + lastThird
   */
  function prayerTimes(date, o) {
    // وسن 5.1: في المناطق القطبية (نهار أو ليل متصل) نأخذ مواقيت أقرب خط عرض تتعاقب فيه الشمس
    const T = calcTimes(date, o);
    if ((isNaN(T.sunrise) || isNaN(T.sunset)) && Math.abs(+o.lat) > 60) { const P = calcTimes(date, Object.assign({}, o, { lat: Math.sign(+o.lat) * 60 })); P.polar = true; return P; }
    return T;
  }
  function calcTimes(date, o) {
    const lat = +o.lat, lng = +o.lng;
    const tz = (o.tz != null) ? o.tz : -date.getTimezoneOffset() / 60;
    const m = METHODS[o.method] || METHODS.mwl;
    const asrF = o.asr === 'hanafi' ? 2 : 1;
    const jDate = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);

    const midDay = t => fixHour(12 - sunPosition(jDate + t).eqt);
    const sunAngleTime = (angle, t, ccw) => {
      const decl = sunPosition(jDate + t).decl;
      const noon = midDay(t);
      const v = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
      if (v < -1 || v > 1) return NaN;
      const T = acos(v) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (factor, t) => {
      const decl = sunPosition(jDate + t).decl;
      const angle = -acot(factor + tan(Math.abs(lat - decl)));
      return sunAngleTime(angle, t);
    };

    // تخمين أولي ثم تكرار مرتين للتدقيق
    let T = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, maghrib: 18, isha: 18 };
    const ishaIsAngle = typeof m.isha === 'number';
    const ishaSpec = (o.ramadan && m.ramadanIsha) ? m.ramadanIsha : m.isha;
    for (let it = 0; it < 2; it++) {
      const p = {}; for (const k in T) p[k] = T[k] / 24;
      T = {
        fajr: sunAngleTime(m.fajr, p.fajr, true),
        sunrise: sunAngleTime(0.833, p.sunrise, true),
        dhuhr: midDay(p.dhuhr),
        asr: asrTime(asrF, p.asr),
        sunset: sunAngleTime(0.833, p.sunset),
        maghrib: (typeof m.maghrib === 'number' && m.maghrib > 0) ? sunAngleTime(m.maghrib, p.maghrib) : sunAngleTime(0.833, p.maghrib),
        isha: ishaIsAngle ? sunAngleTime(ishaSpec, p.isha) : NaN,
      };
    }

    // تحويل من التوقيت الشمسي إلى التوقيت المحلي
    for (const k in T) T[k] += tz - lng / 15;

    // العشاء بالدقائق بعد المغرب (أم القرى، قطر)
    if (!ishaIsAngle || typeof ishaSpec === 'object') T.isha = T.maghrib + ishaSpec.min / 60;

    // خطوط العرض العليا: تعديل الفجر والعشاء عند تعذّر الحساب أو المبالغة
    const night = timeDiff(T.sunset, T.sunrise);
    const rule = o.highLat || 'angle';
    const portion = angle => rule === 'middle' ? 0.5 : rule === 'seventh' ? 1 / 7 : angle / 60;
    if (typeof m.fajr === 'number') {
      const lim = portion(m.fajr) * night;
      if (isNaN(T.fajr) || timeDiff(T.fajr, T.sunrise) > lim) T.fajr = T.sunrise - lim;
    }
    if (ishaIsAngle && typeof ishaSpec === 'number') {
      const lim = portion(ishaSpec) * night;
      if (isNaN(T.isha) || timeDiff(T.sunset, T.isha) > lim) T.isha = T.sunset + lim;
    }

    // تعديلات يدوية بالدقائق
    const adj = o.adjust || {};
    for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) if (adj[k]) T[k] += adj[k] / 60;

    // منتصف الليل والثلث الأخير
    const nightStart = T.maghrib;
    const fajrNext = T.fajr + 24;
    const nightLen = (m.midnight === 'jafari' ? fajrNext : T.sunrise + 24) - T.sunset;
    T.midnight = T.sunset + nightLen / 2;
    T.lastThird = T.sunset + nightLen * 2 / 3;
    T.imsak = T.fajr - 10 / 60;
    void nightStart;
    return T;
  }
  function timeDiff(a, b) { return fixHour(b - a); }

  /** يحوّل ساعة عشرية إلى كائن Date في اليوم المحدد */
  function toDate(day, hours) {
    if (hours == null || isNaN(hours)) return null;
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    return new Date(d.getTime() + Math.round(hours * 3600) * 1000);
  }

  /* ─────────────── القبلة ─────────────── */
  function qibla(lat, lng) {
    const dl = KAABA.lng - lng;
    const y = sin(dl);
    const x = cos(lat) * tan(KAABA.lat) - sin(lat) * cos(dl);
    return fixAngle(atan2(y, x));
  }
  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371.0088;
    const dp = (lat2 - lat1) * D2R, dl = (lng2 - lng1) * D2R;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  const kaabaDistance = (lat, lng) => distanceKm(lat, lng, KAABA.lat, KAABA.lng);

  /**
   * يستنتج الإحداثيات من (اتجاه القبلة، المسافة إلى الكعبة) — يُستخدم مع
   * الجسر الأصلي القديم الذي لا يرسل الإحداثيات مباشرة. حلّ مثلثي دقيق.
   */
  function locateFromQibla(bearing, distKm) {
    // ثوابت مطابقة للكود الأصلي (Kotlin) لضمان استرجاع دقيق
    const K = { lat: 21.4225, lng: 39.8262 };
    const R = 6371.0, d = distKm / R;             // بالراديان
    const bK = K.lat * D2R, th = bearing * D2R;
    // sin(latK) = cos(x)cos(d) + sin(x)sin(d)cos(θ) ؛ x = 90° - lat
    const A = Math.cos(d), B = Math.sin(d) * Math.cos(th), C = Math.sin(bK);
    const Rr = Math.hypot(A, B);
    if (Rr < 1e-12 || Math.abs(C / Rr) > 1) return null;
    const base = Math.atan2(B, A), del = Math.acos(C / Rr);
    let best = null;
    for (const x of [base + del, base - del]) {
      if (x <= 0 || x >= Math.PI) continue;
      const la = 90 - x * R2D;
      const cdl = (Math.cos(d) - Math.sin(la * D2R) * C) / (Math.cos(la * D2R) * Math.cos(bK));
      if (Math.abs(cdl) > 1.0000001) continue;
      let dL = Math.acos(Math.max(-1, Math.min(1, cdl))) * R2D;
      if (Math.sin(th) < 0) dL = -dL;
      let lo = K.lng - dL; lo = ((lo + 540) % 360) - 180;
      const err = Math.abs(((qibla(la, lo) - bearing + 540) % 360) - 180) + Math.abs(kaabaDistance(la, lo) - distKm) / 10;
      if (!best || err < best.err) best = { lat: la, lng: lo, err };
    }
    return best && best.err < 0.5 ? { lat: best.lat, lng: best.lng } : null;
  }

  /* ─────────────── التقويم الهجري ─────────────── */
  const HMONTHS = ['مُحرَّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'];
  const GMONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const GMONTHS_DZ = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  let _fmt = null;
  try {
    _fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const t = _fmt.formatToParts(new Date(Date.UTC(2026, 8, 25, 12)));
    const y = +t.find(p => p.type === 'year').value.replace(/\D/g, '');
    if (!(y > 1400 && y < 1500)) _fmt = null;
  } catch (e) { _fmt = null; }

  function hijriArithmetic(date) {
    // تقويم هجري جدولي (احتياطي)
    const jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) + 0.5;
    const l0 = Math.floor(jd) - 1948440 + 10632;
    const n = Math.floor((l0 - 1) / 10631);
    let l = l0 - 10631 * n + 354;
    const j = Math.floor((10985 - l) / 5316) * Math.floor(50 * l / 17719) + Math.floor(l / 5670) * Math.floor(43 * l / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
    const m = Math.floor(24 * l / 709);
    const d = l - Math.floor(709 * m / 24);
    const y = 30 * n + j - 30;
    return { year: y, month: m, day: d };
  }
  /** التاريخ الهجري ليوم ميلادي مع إزاحة (±أيام) */
  function hijri(date, offset) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + (offset || 0), 12));
    if (_fmt) {
      try {
        const parts = _fmt.formatToParts(d);
        const g = t => +parts.find(p => p.type === t).value.replace(/\D/g, '');
        return { year: g('year'), month: g('month'), day: g('day') };
      } catch (e) { /* احتياطي */ }
    }
    return hijriArithmetic(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  /** أيام الشهر الهجري الذي يحوي التاريخ المعطى: [{date, h}] */
  function hijriMonthDays(date, offset) {
    const h0 = hijri(date, offset);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (h0.day - 1));
    const days = [];
    for (let i = 0; i < 31; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const h = hijri(dt, offset);
      if (h.month !== h0.month) { if (i > 26) break; else continue; }
      days.push({ date: dt, h });
    }
    return days;
  }

  /* ─────────────── المناسبات ─────────────── */
  const OCCASIONS = [
    { m: 1, d: 1, t: 'رأس السنة الهجرية', n: 'بداية عام هجري جديد' },
    { m: 1, d: 9, t: 'تاسوعاء', n: 'يُستحب صيامه مع عاشوراء' },
    { m: 1, d: 10, t: 'يوم عاشوراء', n: 'صيامه يكفّر السنة التي قبله' },
    { m: 3, d: 12, t: 'المولد النبوي الشريف', n: 'ذكرى مولد النبي ﷺ' },
    { m: 7, d: 27, t: 'ذكرى الإسراء والمعراج', n: '' },
    { m: 8, d: 15, t: 'النصف من شعبان', n: '' },
    { m: 9, d: 1, t: 'بداية شهر رمضان', n: 'شهر الصيام والقيام' },
    { m: 9, d: 21, t: 'العشر الأواخر', n: 'تُلتمس فيها ليلة القدر' },
    { m: 10, d: 1, t: 'عيد الفطر المبارك', n: 'تقبّل الله منا ومنكم' },
    { m: 12, d: 1, t: 'العشر من ذي الحجة', n: 'أفضل أيام الدنيا' },
    { m: 12, d: 8, t: 'يوم التروية', n: '' },
    { m: 12, d: 9, t: 'يوم عرفة', n: 'صيامه يكفّر سنتين' },
    { m: 12, d: 10, t: 'عيد الأضحى المبارك', n: 'يوم النحر' },
    { m: 12, d: 11, t: 'أيام التشريق', n: 'أيام أكل وشرب وذكر لله' },
  ];
  const occasionOn = h => OCCASIONS.find(o => o.m === h.month && o.d === h.day) || null;

  return {
    METHODS, METHOD_ORDER, COUNTRY_METHOD, methodFor, KAABA,
    prayerTimes, toDate, qibla, kaabaDistance, distanceKm, locateFromQibla,
    hijri, hijriMonthDays, HMONTHS, GMONTHS, GMONTHS_DZ, WEEKDAYS, OCCASIONS, occasionOn,
    usesUmmAlQura: !!_fmt,
  };
})();

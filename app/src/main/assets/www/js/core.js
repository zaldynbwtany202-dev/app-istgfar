/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · النواة: أدوات · تخزين · إعدادات · تنسيق · الجسر · التوجيه
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* ───────── أدوات ───────── */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2, '0');
const dayKey = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
function debounce(fn, ms) { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }
function throttle(fn, ms) { let t = 0, tm = null; return function () { const now = Date.now(); const a = arguments;
  if (now - t >= ms) { t = now; fn.apply(this, a); } else { clearTimeout(tm); tm = setTimeout(() => { t = Date.now(); fn.apply(this, a); }, ms - (now - t)); } }; }

/* ───────── التخزين ───────── */
const Store = {
  P: 'noor2.',
  get(k, d) { try { const v = localStorage.getItem(this.P + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(this.P + k, JSON.stringify(v)); } catch (e) { /* ممتلئ */ } },
  del(k) { try { localStorage.removeItem(this.P + k); } catch (e) {} },
};

/* ───────── الإعدادات ───────── */
const DEFAULTS = {
  theme: 'dark', digits: 'latn', clock: '24', gmonths: 'auto',
  method: '', asr: 'shafii', highLat: 'angle', hijriOffset: 0,
  adjust: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  qfs: 27, zfs: 21, readTheme: 'night', readMode: 'surah',
  notif: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, preNotif: 0,
  vibrate: true, currency: '',
  // وسن 3.0
  accent: 'emerald', warm: 'off',
  // وسن 4.2
  hifz: false,
  reciter: 'Alafasy_128kbps', qRepeat: 1, qRate: 1, qCont: false,
  remind: { azm: true, aze: true, kahf: true, jumua: true, fast: false, white: false, qiyam: false, sleep: false },
  remAzm: 30, remAze: 30, remSleep: '22:30',
  // وسن 4.4
  remJumua: 45,
  // وسن 4.5
  accentHex: '', uiScale: 1, readDim: 0, qlh: 2.3, qalign: 'justify', qfont: 'hafs', readFull: false, hifzMode: 'all',
  ambVol: 0.45, ambRecite: 'pause', ambLast: '', libReciter: '', qSrc: 'ayah', sleepMin: 0, asSpeed: 4,
  // وسن 6.3: ضبط المواقيت على تقويم مسجدك (null = طريقة البلد)
  calib: null,
};
const Settings = Object.assign({}, DEFAULTS, Store.get('settings', {}));
Settings.adjust = Object.assign({}, DEFAULTS.adjust, Settings.adjust || {});
Settings.notif = Object.assign({}, DEFAULTS.notif, Settings.notif || {});
Settings.remind = Object.assign({}, DEFAULTS.remind, Settings.remind || {});
function setSetting(k, v) { Settings[k] = v; Store.set('settings', Settings); Bus.emit('settings', k); }

/* ───────── ناقل أحداث بسيط ───────── */
const Bus = { h: {}, on(e, f) { (this.h[e] = this.h[e] || []).push(f); }, emit(e, x) { (this.h[e] || []).forEach(f => { try { f(x); } catch (er) { console.error(er); } }); } };

/* ───────── التنسيق ───────── */
const AR_DIG = '٠١٢٣٤٥٦٧٨٩';
const N = x => { const s = String(x); return Settings.digits === 'arab' ? s.replace(/[0-9]/g, d => AR_DIG[d]) : s; };
const arDigits = x => String(x).replace(/[0-9]/g, d => AR_DIG[d]);
const fmtInt = n => N(Math.round(n).toLocaleString('en-US'));
function fmtTime(date, withSuffix) {
  if (!date || isNaN(date)) return '--:--';
  let h = date.getHours(), m = date.getMinutes();
  // وسن 5.1: مواقيت مدينة بمنطقة زمنية أخرى تُعرض بساعتها المحلية
  if (date._tz && typeof Geo !== 'undefined') { const p = Geo.parts(date._tz, date); if (p) { h = p.hour; m = p.minute; } }
  if (Settings.clock === '12') { const suf = h < 12 ? 'ص' : 'م'; h = h % 12 || 12; return N(h + ':' + pad2(m)) + (withSuffix === false ? '' : ' ' + suf); }
  return N(pad2(h) + ':' + pad2(m));
}
function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return N(pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s % 3600 / 60)) + ':' + pad2(s % 60));
}
/* جمع عربي سليم: ساعة/ساعتان/3 ساعات/11 ساعة */
function plural(n, one, two, few, many) {
  if (n === 1) return one; if (n === 2) return two;
  const r = n % 100;
  // 3–10 جمع · 11–99 تمييز منصوب · 100، 1000… (وما بعدها بواحد أو اثنين) مفرد مجرور: «100 يوم»
  return N(n) + ' ' + ((r >= 3 && r <= 10) ? few : (n >= 100 && r <= 2) ? one : many);
}
const pH = n => plural(n, 'ساعة', 'ساعتان', 'ساعات', 'ساعة');
const pM = n => plural(n, 'دقيقة', 'دقيقتان', 'دقائق', 'دقيقة');
const pD = n => plural(n, 'يوم', 'يومان', 'أيام', 'يومًا');
function fmtDurWords(ms) {
  const mins = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(mins / 60), m = mins % 60;
  if (!h) return m ? pM(m) : 'أقل من دقيقة';
  return m ? pH(h) + ' و' + pM(m) : pH(h);
}
function gMonthNames() {
  let mode = Settings.gmonths;
  if (mode === 'auto') { const cc = (Loc.get() || {}).cc; mode = (cc === 'DZ' || cc === 'TN') ? 'dz' : 'std'; }
  return mode === 'dz' ? NoorEngine.GMONTHS_DZ : NoorEngine.GMONTHS;
}
const fmtG = d => N(d.getDate()) + ' ' + gMonthNames()[d.getMonth()] + ' ' + N(d.getFullYear());
const hijriOf = d => NoorEngine.hijri(d, Settings.hijriOffset);
const fmtH = h => N(h.day) + ' ' + NoorEngine.HMONTHS[h.month - 1] + ' ' + N(h.year) + ' هـ';
const weekday = d => NoorEngine.WEEKDAYS[d.getDay()];

/* ───────── التطبيع العربي (للبحث) ───────── */
const TASHKEEL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
function normAr(s) {
  return String(s).replace(TASHKEEL, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').trim();
}

/* ───────── الجسر الأصلي (Android) ───────── */
const Native = {
  get ok() { return !!window.NoorBridge; },
  has(fn) { return !!(window.NoorBridge && typeof window.NoorBridge[fn] === 'function'); },
  call(fn) {
    if (!this.has(fn)) return undefined;
    try { return window.NoorBridge[fn].apply(window.NoorBridge, Array.prototype.slice.call(arguments, 1)); }
    catch (e) { console.warn('bridge', fn, e); return undefined; }
  },
};
function vibrate(ms) {
  if (!Settings.vibrate) return;
  if (Native.has('vibrate')) Native.call('vibrate', ms); else if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {}
}
function copyText(text) {
  if (Native.has('copyText')) { Native.call('copyText', text); toast('تم النسخ'); return; }
  const done = () => toast('تم النسخ');
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('تعذّر النسخ'); } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
}
function shareText(text) {
  if (Native.has('shareText')) { Native.call('shareText', text); return; }
  if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
  copyText(text);
}
function statusBar(color, lightIcons) { Native.call('setStatusBar', color, !!lightIcons); }

/* ───────── التنبيه العابر ───────── */
let _toastT = null;
function toast(msg, ms) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_toastT); _toastT = setTimeout(() => t.classList.remove('show'), ms || 2200);
}


/* ───────── الشعار الكتابي «وسن»: خط كوفي هندسي، ونقطة النون نجمة وسن ───────── */
/* وسن 5 · الشعار: «وسن» بخط النستعليق (Noto Nastaliq Urdu — رخصة OFL) وقد صارت نقطة النون نجمة ثمانية يحضنها قوس النون كالهلال */
const WM = { vb: '-6 -831 1917 1226', d: 'M280 371Q200 371 141.0 337.5Q82 304 50.0 239.5Q18 175 18 83Q18 -11 42.5 -113.0Q67 -215 122 -321L156 -310Q126 -239 114.0 -180.5Q102 -122 102 -75Q102 -18 118.5 22.5Q135 63 166.0 88.0Q197 113 240.5 124.5Q284 136 338 136Q428 136 494.0 106.0Q560 76 604.5 23.0Q649 -30 673 -98Q693 -154 703.5 -250.0Q714 -346 716 -482L739 -488Q766 -480 800 -480Q822 -480 831.0 -457.5Q840 -435 840 -400Q840 -348 821.5 -319.0Q803 -290 771 -290H763Q759 -215 745.0 -136.0Q731 -57 706.0 18.5Q681 94 643.5 158.5Q606 223 553 270Q498 319 430.0 345.0Q362 371 280 371ZM766 -290Q745 -290 735.5 -314.5Q726 -339 726 -370Q726 -426 748.0 -453.0Q770 -480 800 -480Q853 -480 898.5 -508.0Q944 -536 978 -590Q988 -605 995.0 -616.0Q1002 -627 1007.5 -635.0Q1013 -643 1017 -648Q1025 -658 1032.0 -660.5Q1039 -663 1049 -663Q1064 -663 1083 -654Q1093 -650 1103.5 -647.5Q1114 -645 1125 -645Q1157 -645 1181.0 -662.5Q1205 -680 1222 -711L1236 -714Q1245 -707 1261.0 -703.5Q1277 -700 1294 -700Q1327 -700 1350.0 -728.5Q1373 -757 1385 -807L1421 -803Q1404 -702 1380.5 -641.0Q1357 -580 1326.5 -553.5Q1296 -527 1258 -527Q1248 -527 1234.0 -529.5Q1220 -532 1203 -538Q1175 -487 1143.0 -471.0Q1111 -455 1088 -455Q1055 -455 1028 -474Q1003 -492 991 -492Q977 -492 948 -439Q931 -408 912.5 -381.5Q894 -355 873 -335Q851 -314 824.5 -302.0Q798 -290 766 -290ZM1486 99 1478 74Q1525 51 1578.0 19.0Q1631 -13 1689 -53Q1747 -93 1778.5 -132.5Q1810 -172 1816 -210Q1815 -210 1814.0 -210.5Q1813 -211 1811 -211Q1796 -203 1774.5 -197.5Q1753 -192 1724 -192Q1697 -192 1672.0 -203.5Q1647 -215 1631.0 -237.0Q1615 -259 1615 -288Q1615 -306 1621.0 -330.0Q1627 -354 1640 -382L1680 -463Q1710 -524 1767 -524Q1811 -524 1837.5 -493.0Q1864 -462 1875.5 -413.5Q1887 -365 1887 -311Q1887 -259 1873.5 -208.0Q1860 -157 1840.5 -114.5Q1821 -72 1802.5 -43.5Q1784 -15 1773 -6Q1760 4 1724.5 19.5Q1689 35 1644.0 51.0Q1599 67 1556.5 80.0Q1514 93 1486 99Z', star: 'M457.8 -337.6 L476.0 -285.5 L528.1 -267.3 L504.2 -217.5 L528.1 -167.7 L476.0 -149.5 L457.8 -97.4 L408.0 -121.3 L358.2 -97.4 L340.0 -149.5 L287.9 -167.7 L311.8 -217.5 L287.9 -267.3 L340.0 -285.5 L358.2 -337.6 L408.0 -313.7 Z' };
let _wmN = 0;
function wordmark(cls, ink) {
  const id = 'wmg' + (++_wmN);
  return '<svg class="wm ' + (cls || '') + '" viewBox="' + WM.vb + '" role="img" aria-label="وسن"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#FCE9B4"/><stop offset="1" stop-color="#C9953F"/></linearGradient></defs><path d="' + WM.d + '" fill="' + (ink || 'currentColor') + '"/>' +
    '<path class="wm-star" d="' + WM.star + '" fill="url(#' + id + ')"/></svg>';
}

/* ───────── الورقة السفلية (مع زر الرجوع) ───────── */
const Sheet = {
  el: null, bg: null, after: null,
  open(html, onMount, onClose) {
    if (this.el) this._remove();
    this.onClose = onClose || null;
    const bg = document.createElement('div'); bg.className = 'sheet-bg';
    const el = document.createElement('div'); el.className = 'sheet';
    el.innerHTML = '<div class="grab"></div>' + html;
    document.body.appendChild(bg); document.body.appendChild(el);
    this.el = el; this.bg = bg;
    bg.addEventListener('click', () => this.close());
    requestAnimationFrame(() => { bg.classList.add('open'); el.classList.add('open'); });
    Router.depth++; history.pushState({ d: Router.depth, r: Router.cur.r, a: Router.cur.a || null, sheet: 1 }, '');
    if (onMount) try { onMount(el); } catch (e) { console.error(e); }
    return el;
  },
  close(then) { if (!this.el) { if (then) then(); return; } this.after = then || null; history.back(); },
  _remove() {
    const el = this.el, bg = this.bg; this.el = this.bg = null;
    const oc = this.onClose; this.onClose = null; if (oc) try { oc(); } catch (e) { console.error(e); }
    if (!el) return;
    el.classList.remove('open'); bg.classList.remove('open');
    setTimeout(() => { el.remove(); bg.remove(); }, 320);
  },
};

/* وسن 4.2 · ورقة تأكيد للأفعال التي تغيّر البيانات */
function confirmSheet(title, sub, okText, onOk, opts) {
  opts = opts || {};
  const html = '<div class="sh-t">' + esc(title) + '</div>' + (sub ? '<div class="sh-s" style="line-height:1.75">' + esc(sub) + '</div>' : '') +
    '<div class="cf-acts"><button class="btn ' + (opts.danger ? 'danger' : 'gold') + ' block" id="cf-ok">' + esc(okText || 'تأكيد') + '</button>' +
    '<button class="btn ghost block" id="cf-no">إلغاء</button></div>';
  Sheet.open(html, el => {
    $('#cf-ok', el).onclick = () => Sheet.close(() => { if (onOk) onOk(); });
    $('#cf-no', el).onclick = () => Sheet.close();
  });
}
/* خيارات سريعة داخل ورقة */
function pickSheet(title, sub, options, current, onPick) {
  const html = '<div class="sh-t">' + esc(title) + '</div>' + (sub ? '<div class="sh-s">' + esc(sub) + '</div>' : '') +
    '<div>' + options.map((o, i) => '<button class="li opt ' + (o.v === current ? 'on' : '') + '" data-i="' + i + '"><div class="grow"><div class="t">' + esc(o.t) + '</div>' +
      (o.s ? '<div class="s">' + esc(o.s) + '</div>' : '') + '</div><span class="rad"></span></button>').join('') + '</div>';
  Sheet.open(html, el => $$('.opt', el).forEach(b => b.addEventListener('click', () => {
    const o = options[+b.dataset.i]; Sheet.close(() => onPick(o.v));
  })));
}

/* ───────── التوجيه (مع دعم زر الرجوع في أندرويد) ───────── */
const SCREENS = {};
const Router = {
  depth: 0, cur: null, pending: null,
  init(r, a) {
    history.replaceState({ d: 0, r, a: a || null }, '');
    window.addEventListener('popstate', e => this.onPop(e.state));
    this.show(r, a);
  },
  onPop(st) {
    st = st || { d: 0, r: 'home' };
    if (Sheet.el) {
      Sheet._remove(); this.depth = st.d;
      const after = Sheet.after; Sheet.after = null;
      if (after) setTimeout(after, 30);
      if (!this.pending) return;
    }
    this.depth = st.d;
    if (this.pending) {
      const p = this.pending; this.pending = null;
      if (p.r !== 'home') { this.depth++; history.pushState({ d: this.depth, r: p.r, a: p.a || null }, ''); }
      this.show(p.r, p.a); return;
    }
    this.show(st.r, st.a);
  },
  go(r, a) { this.depth++; history.pushState({ d: this.depth, r, a: a || null }, ''); this.show(r, a); },
  replace(r, a) { history.replaceState({ d: this.depth, r, a: a || null }, ''); this.show(r, a); },
  tab(r) {
    if (this.cur && this.cur.r === r) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (this.depth === 0) { if (r === 'home') this.show('home'); else this.go(r); return; }
    this.pending = { r }; history.go(-this.depth);
  },
  back() { if (this.depth > 0) history.back(); else this.show('home'); },
  refresh() { if (this.cur) this.show(this.cur.r, this.cur.a, true); },
  show(r, a, keepScroll) {
    const S = SCREENS[r] || SCREENS.home;
    if (this.cur && this.cur.s && this.cur.s.leave) try { this.cur.s.leave(); } catch (e) { console.error(e); }
    const y = window.scrollY;
    this.cur = { r, a: a || null, s: S };
    const v = $('#view');
    v.className = S.nav === false ? 'no-nav' : '';
    let html;
    try { html = S.render(a || {}); } catch (e) { console.error(e); html = '<div class="empty">حدث خطأ غير متوقع</div>'; }
    v.innerHTML = '<div class="screen ' + (S.tab ? '' : 'sub') + (keepScroll ? '" style="animation:none' : '') + '">' + html + '</div>';
    window.scrollTo(0, keepScroll ? y : 0);
    $('#tabbar').classList.toggle('hide', S.nav === false);
    const tb = S.tab || S.parent;
    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.t === tb));
    if (S.mount) try { S.mount(v.firstElementChild, a || {}); } catch (e) { console.error(e); }
    const sbar = typeof S.statusBar === 'function' ? (function () { try { return S.statusBar(); } catch (e) { return null; } })() : null;
    if (sbar) statusBar(sbar[0], sbar[1]);
    else statusBar(S.status || (getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#0B5D4B'), false);
    Native.call('keepScreenOn', !!S.keepOn);
  },
};
window.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-tab],[data-back]');
  if (!t) return;
  if (t.hasAttribute('data-back')) { Router.back(); return; }
  if (t.dataset.tab) { Router.tab(t.dataset.tab); return; }
  let a = null; if (t.dataset.a) { try { a = JSON.parse(t.dataset.a); } catch (er) { a = null; } }
  Router.go(t.dataset.go, a);
});

/* ───────── مكوّنات HTML مشتركة ───────── */
function hdr(title, sub, opts) {
  opts = opts || {};
  const back = opts.back ? '<button class="ibtn" data-back aria-label="رجوع">' + icon('back') + '</button>' : '';
  const acts = (opts.actions || []).map(a => '<button class="ibtn" id="' + a.id + '" aria-label="' + esc(a.label || '') + '">' + icon(a.icon) + '</button>').join('');
  return '<header class="hdr ' + (opts.compact ? 'compact' : '') + '"><div class="bar">' + back +
    '<div class="ttl"><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub" id="' + (opts.subId || '') + '">' + sub + '</div>' : '') + '</div>' + acts + '</div>' +
    (opts.extra || '') + '</header>';
}
function sec(title, link) {
  return '<div class="sec"><h2>' + esc(title) + '</h2>' + (link ? '<button class="link" ' + link.attr + '>' + esc(link.t) + icon('chev') + '</button>' : '') + '</div>';
}
/* ───────── «نجمة وسن» — العنصر البصري المميّز (نجمة ثمانية) ───────── */
/** مسار نجمة ثمانية: R نصف القطر الخارجي، k نسبة العمق (0.765 = مربّعان متداخلان كلاسيكيًا) */
function starD(cx, cy, R, k, rot) {
  k = k || 0.765; rot = rot == null ? 0 : rot;
  let d = '';
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + rot + i * Math.PI / 8, r = i % 2 ? R * k : R;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2);
  }
  return d + 'Z';
}
/** حلقة تقدّم: نجمة ثمانية للأحجام الكبيرة (بصمة وسن)، ودائرة للصغيرة */
function ringSVG(size, stroke, frac, color, track, shape) {
  const star = shape ? shape === 'star' : size >= 54;
  const f = clamp(frac, 0, 1), h = size / 2;
  if (star) {
    const d = starD(h, h, h - stroke / 2 - 0.5, 0.86, Math.PI / 8);
    return '<svg class="sring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<path d="' + d + '" fill="none" stroke="' + (track || 'var(--card-3)') + '" stroke-width="' + stroke + '" stroke-linejoin="round"/>' +
      '<path class="rfg" d="' + d + '" pathLength="100" fill="none" stroke="' + (color || 'var(--gold)') + '" stroke-width="' + stroke +
      '" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="' + (100 * (1 - f)).toFixed(2) + '" style="transition:stroke-dashoffset .6s var(--ease)"/></svg>';
  }
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + h + '" cy="' + h + '" r="' + r +
    '" fill="none" stroke="' + (track || 'var(--card-3)') + '" stroke-width="' + stroke + '"/><circle class="rfg" cx="' + h + '" cy="' + h + '" r="' + r +
    '" fill="none" stroke="' + (color || 'var(--gold)') + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) +
    '" stroke-dashoffset="' + (c * (1 - f)).toFixed(2) + '" style="transition:stroke-dashoffset .5s var(--ease)"/></svg>';
}
function setRing(svgEl, frac) {
  const fg = svgEl && svgEl.querySelector('.rfg'); if (!fg) return;
  const c = parseFloat(fg.getAttribute('stroke-dasharray'));
  fg.setAttribute('stroke-dashoffset', (c * (1 - clamp(frac, 0, 1))).toFixed(2));
}
function surahBadge(n) {
  return '<div class="sno"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.3"><path d="' + STAR_BADGE + '"/></svg><span>' + N(n) + '</span></div>';
}
/* ألوان البلاطات حسب السمة */
const HUES = {
  // وسن 4.1 · «لوحة الجواهر»: درجات عميقة هادئة متناغمة، وأيقونات بذهب واحد في الوضع الداكن
  emerald: ['#1B5B4A', '#0D342B', '#E9D4A0', '#0F5E4C'], teal: ['#1B4E57', '#0D2D33', '#E9D4A0', '#1D6470'],
  gold: ['#5E4B22', '#33280F', '#F0DDA8', '#8C6A2A'], indigo: ['#2C3661', '#171C38', '#E9D4A0', '#3D4C86'],
  plum: ['#4D2C48', '#2A1628', '#E9D4A0', '#76406E'], amber: ['#5F401F', '#35220E', '#EFD8A2', '#96601F'],
  slate: ['#294A50', '#15292D', '#E9D4A0', '#2F5C63'], neutral: ['#2B3A36', '#17211E', '#E9D4A0', '#4A605A'],
  rose: ['#5B2F39', '#321820', '#E9D4A0', '#94475A'],
};
function hueVars(h) {
  const c = HUES[h] || HUES.emerald;
  if (themeBase() !== 'dark') return '--qbg:' + c[3] + '1A;--qfg:' + c[3] + ';--qsh:transparent';
  return '--qbg:linear-gradient(160deg,' + c[0] + ',' + c[1] + ');--qfg:' + c[2] + ';--qsh:' + c[1] + '66';
}
const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
/* السمة الفعلية: داكن · فاتح · دافئ — «حسب المواقيت» داكنة من المغرب إلى الشروق */
function isNightNow() {
  try { const now = new Date(), t = Times.forDay(Times.locDay(now)); return now < t.sunrise || now >= t.maghrib; } catch (e) { const h = new Date().getHours(); return h < 6 || h >= 19; }
}
/* وسن 6.1 · «مشرقة دائمًا»: مشاهد الثيمات الفاتحة تبقى نهارية مشرقة (الافتراضي)، أو تتبع الوقت ليلًا ونهارًا كما في 4.6 */
function skyLock() { try { return Settings.skyMode !== 'live' && THEMES[uiTheme()].base === 'light'; } catch (e) { return false; } }
/* ═══ وسن 4.5 · السمات: كل سمة = أساس (داكن/فاتح) + نغمة ألوان + لون مقترح ═══ */
const THEMES = {
  dark: { n: 'داكن هادئ', base: 'dark', g: 'calm', bar: '#0C1513', sw: ['#0C1513', '#182724', '#0B5D4B', '#D4AF63'] },
  light: { n: 'فاتح', base: 'light', g: 'calm', bar: '#F4F1EA', sw: ['#F4F1EA', '#FFFFFF', '#0B5D4B', '#B08738'] },
  sepia: { n: 'دافئ مريح للعين', base: 'light', tone: 'sepia', g: 'calm', bar: '#EFE6D6', sw: ['#EFE6D6', '#F8F1E4', '#2F6B55', '#8A6424'] },
  blush: { n: 'وردي ناعم', base: 'light', tone: 'blush', g: 'girls', acc: 'pink', bar: '#FBEFF3', sw: ['#FBEFF3', '#FFFFFF', '#C2587A', '#D4879B'] },
  rosenight: { n: 'ليل وردي', base: 'dark', tone: 'rosenight', g: 'girls', acc: 'pink', bar: '#170D13', sw: ['#170D13', '#2A1822', '#C2587A', '#E8A3B7'] },
  lavender: { n: 'لافندر', base: 'light', tone: 'lavender', g: 'girls', acc: 'lilac', bar: '#F3EFFA', sw: ['#F3EFFA', '#FFFFFF', '#7E63B8', '#B79BE0'] },
  peach: { n: 'خوخي', base: 'light', tone: 'peach', g: 'girls', acc: 'coral', bar: '#FFF2EB', sw: ['#FFF2EB', '#FFFFFF', '#D0694E', '#EFA07E'] },
  rosegold: { n: 'ذهبي وردي', base: 'light', tone: 'rosegold', g: 'girls', acc: 'rosegold', bar: '#F8EEEA', sw: ['#F8EEEA', '#FFFCFA', '#B06A74', '#D3A08E'] },
  violet: { n: 'بنفسجي حالم', base: 'dark', tone: 'violet', g: 'girls', acc: 'lilac', bar: '#110E1F', sw: ['#110E1F', '#211B38', '#7E63B8', '#C9B3F2'] },
  // وسن 4.6 · «ثيمات كاملة» برسوم «ريشة وسن» (art.js): لكل ثيم مشهده المرسوم وألوانه وزينة بطاقاته ومسبحته — skins.js
  kbfly: { n: 'الفراشات الزرقاء', base: 'light', tone: 'bfly', g: 'kawaii', acc: 'morpho', skin: 'kbfly', rt: 'sky', bar: '#EEF5FF', sw: ['#EEF5FF', '#A9D2FF', '#2D6FE0', '#7FC6FF'] },
  kmorpho: { n: 'فراشة المورفو', base: 'dark', g: 'islamic', acc: 'kmorpho', bar: '#08110F', sw: ['#08110F', '#172120', '#3D82D6', '#A0D4F7'], ph: 1, ink: 'w', top: '#141906', hb: '#202D21' },   // وسن 6: فراشة 5.0 بصورتها الحقيقية
  krose: { n: 'الورد', base: 'light', tone: 'rosy', g: 'kawaii', acc: 'rosered', skin: 'krose', rt: 'pink', bar: '#FFF0F3', sw: ['#FFF0F3', '#F8CFDC', '#D6336C', '#8FC89A'] },
  kstar: { n: 'النجمة', base: 'dark', tone: 'starry', g: 'kawaii', acc: 'starry', skin: 'kstar', rt: 'blue', bar: '#0E1130', sw: ['#0E1130', '#1F2454', '#5B4FC4', '#F5C94E'] },
  kberry: { n: 'الفراولة', base: 'light', tone: 'berry', g: 'kawaii', acc: 'berry', skin: 'kberry', rt: 'pink', bar: '#FFF6F1', sw: ['#FFF6F1', '#FFD2DB', '#E5485F', '#6CC070'] },
  kbloom: { n: 'الأزهار', base: 'light', tone: 'bloom', g: 'kawaii', acc: 'bloom', skin: 'kbloom', rt: 'cream', bar: '#FFF8EF', sw: ['#FFF8EF', '#FFDDE6', '#EC7FA9', '#F5BE3F'] },
  // وسن 4.5 · «المشاهد»: سمات كاملة (السماء والبستان والزينة والمسبحة) — skins.js
  sakura: { n: 'أزهار الكرز', base: 'light', tone: 'blush', g: 'scene', acc: 'pink', skin: 'sakura', rt: 'pink', bar: '#FBEFF3', sw: ['#FDE6EF', '#F7C1D3', '#C2587A', '#9BCB8E'] },
  roses: { n: 'حديقة الورود', base: 'dark', tone: 'rosenight', g: 'scene', acc: 'pink', skin: 'roses', rt: 'plum', bar: '#170D13', sw: ['#170B1C', '#4D2142', '#D6336C', '#E6A996'] },
  lavfield: { n: 'حقل الخزامى', base: 'light', tone: 'lavender', g: 'scene', acc: 'lilac', skin: 'lavender', rt: 'lavender', bar: '#F3EFFA', sw: ['#EEE6FA', '#C6BDF1', '#7E63B8', '#9FC79A'] },
  amoled: { n: 'ليل حالك', base: 'dark', tone: 'amoled', g: 'more', bar: '#000000', sw: ['#000000', '#111614', '#0B5D4B', '#D4AF63'] },
  dawn: { n: 'فجر', base: 'dark', tone: 'dawn', g: 'more', acc: 'indigo', bar: '#0A1020', sw: ['#0A1020', '#16213B', '#3A4B8A', '#E4C98A'] },
  ocean: { n: 'بحري', base: 'dark', tone: 'ocean', g: 'more', acc: 'teal', bar: '#06141A', sw: ['#06141A', '#102832', '#12707E', '#D4AF63'] },
  olive: { n: 'زيتوني', base: 'dark', tone: 'olive', g: 'more', acc: 'olive', bar: '#0F120B', sw: ['#0F120B', '#1E2517', '#5E6B2E', '#DCC784'] },
  coffee: { n: 'قهوة', base: 'dark', tone: 'coffee', g: 'more', acc: 'coffee', bar: '#14100C', sw: ['#14100C', '#261E18', '#7A5236', '#E2C18A'] },
  sand: { n: 'رمال', base: 'light', tone: 'sand', g: 'more', acc: 'amber', bar: '#EFDFC3', sw: ['#EFDFC3', '#FAF0DE', '#8A6224', '#8A5F1C'] },
  bright: { n: 'ناصع', base: 'light', tone: 'bright', g: 'more', bar: '#FFFFFF', sw: ['#FFFFFF', '#F3F5F4', '#0B5D4B', '#7A5A14'] },
  // وسن 5.1 · فخامة إسلامية بالصور: ١٠ صور حقيقية بأعلى دقة متاحة (img/th/<key>.webp) وألوان مشتقة منها (css/themes.css)
  kmakkah: { n: 'مكة المكرمة', base: 'dark', g: 'islamic', acc: 'kmakkah', bar: '#0A0A0D', sw: ['#0A0A0D', '#1B1A1B', '#A8843F', '#E3C27A'], ph: 1, ink: 'w', top: '#3C3836', hb: '#06070E' },
  kmadinah: { n: 'المدينة المنوّرة', base: 'light', g: 'islamic', acc: 'kmadinah', bar: '#F3F0E8', sw: ['#F3F0E8', '#FCFCFA', '#1E6B4A', '#B08A3E'], ph: 1, ink: 'w', top: '#323E4D', hb: '#2E6C5B' },
  kaqsa: { n: 'المسجد الأقصى', base: 'dark', g: 'islamic', acc: 'kaqsa', bar: '#0A1322', sw: ['#0A1322', '#1A212E', '#3C66AA', '#DDB45E'], ph: 1, ink: 'w', top: '#141F2F', hb: '#1C2B42' },
  kalham: { n: 'قصر الحمراء', base: 'dark', g: 'islamic', acc: 'kalham', bar: '#110B07', sw: ['#110B07', '#211B16', '#A8743A', '#E4C08A'], ph: 1, ink: 'w', top: '#372C1D', hb: '#332517' },
  kiznik: { n: 'غروب إسطنبول', base: 'dark', g: 'islamic', acc: 'kiznik', bar: '#130908', sw: ['#130908', '#231816', '#C25A2C', '#F0A860'], ph: 1, ink: 'w', top: '#623016', hb: '#713619' },
  klapis: { n: 'قبّة أصفهان', base: 'dark', g: 'islamic', acc: 'klapis', bar: '#0E0C08', sw: ['#0E0C08', '#1F1C17', '#B08D3E', '#E9D18E'], ph: 1, ink: 'w', top: '#2E2715', hb: '#403720' },
  kfanous: { n: 'فانوس رمضان', base: 'dark', g: 'islamic', acc: 'kfanous', bar: '#0B0605', sw: ['#0B0605', '#1C1513', '#B4232C', '#EBA65E'], ph: 1, ink: 'w', top: '#010100', hb: '#060302' },
  kalger: { n: 'جامع الجزائر', base: 'dark', g: 'islamic', acc: 'kalger', bar: '#07090A', sw: ['#07090A', '#171918', '#1D7A57', '#D8B36C'], ph: 1, ink: 'w', top: '#010203', hb: '#0A0A09' },
  kcordoba: { n: 'أقواس قرطبة', base: 'dark', g: 'islamic', acc: 'kcordoba', bar: '#120B07', sw: ['#120B07', '#221B16', '#A8482F', '#E6C8A0'], ph: 1, ink: 'w', top: '#190F08', hb: '#231914' },
  knasir: { n: 'المسجد الوردي', base: 'light', g: 'islamic', acc: 'knasir', bar: '#F7EFF2', sw: ['#F7EFF2', '#FDFCFC', '#94476B', '#C29A5C'], ph: 1, ink: 'w', top: '#2F292A', hb: '#7E425C' },
  // وسن 5.1 · ثيمات حيّة متحركة (css/anim.css + js/anim.js): حركة ناعمة بالمعالج الرسومي وتتوقف حين لا تُرى
  awave: { n: 'موج', base: 'light', g: 'anim', anim: 'wave', acc: 'awave', bar: '#ECF6F7', sw: ['#ECF6F7', '#1C5F7E', '#177E8E', '#E6AC62'], ink: 'w', top: '#1C5F7E' },
  acloud: { n: 'غيم', base: 'light', g: 'anim', anim: 'cloud', acc: 'acloud', bar: '#EEF3FA', sw: ['#EEF3FA', '#3F73B4', '#4879BF', '#EDB977'], ink: 'w', top: '#3F73B4' },
  aleaf: { n: 'أوراق الشجر', base: 'light', g: 'anim', anim: 'leaf', acc: 'aleaf', bar: '#F1F6EC', sw: ['#F1F6EC', '#1F3F1C', '#3C7835', '#D4AA4A'], ink: 'w', top: '#1F3F1C' },
  arain: { n: 'مطر', base: 'dark', g: 'anim', anim: 'rain', acc: 'arain', bar: '#0C141D', sw: ['#0C141D', '#0A1320', '#4C7EAA', '#A9C7E2'], ink: 'w', top: '#0A1320' },
  aaurora: { n: 'شفق', base: 'dark', g: 'anim', anim: 'aurora', acc: 'aaurora', bar: '#060B16', sw: ['#060B16', '#050A16', '#22A07F', '#B39AF0'], ink: 'w', top: '#050A16' },
  // وسن 6 · ثيمات حيّة جديدة
  astar: { n: 'ليلة النجوم', base: 'dark', g: 'anim', anim: 'star', acc: 'astar', bar: '#070B18', sw: ['#070B18', '#0D1838', '#4F63C9', '#E8C66A'], ink: 'w', top: '#0D1838' },
  alant: { n: 'فوانيس', base: 'dark', g: 'anim', anim: 'lant', acc: 'alant', bar: '#120A10', sw: ['#120A10', '#2A1340', '#B8472F', '#F2B45A'], ink: 'w', top: '#2A1340' },
  asnow: { n: 'ثلج', base: 'light', g: 'anim', anim: 'snow', acc: 'asnow', bar: '#EEF3F8', sw: ['#EEF3F8', '#26405F', '#3E6E9E', '#D9A45E'], ink: 'w', top: '#26405F' },
  apetal: { n: 'بتلات الورد', base: 'light', g: 'anim', anim: 'petal', acc: 'apetal', bar: '#FBF1F4', sw: ['#FBF1F4', '#4B2150', '#B84C78', '#D79A6B'], ink: 'w', top: '#4B2150' },
  // وسن 6.1 · ثيمات حيّة مشرقة (نهارية، بكتابة داكنة)
  lbfly: { n: 'حديقة الفراشات', base: 'light', g: 'live', anim: 'bgarden', acc: 'lbfly', bar: '#EFF7FD', sw: ['#EFF7FD', '#8CCBF3', '#2F78D8', '#F2AE35'], rt: 'sky', ink: 'd', top: '#8CCBF3' },
  lbubble: { n: 'فقاعات', base: 'light', g: 'live', anim: 'bubble', acc: 'lbubble', bar: '#FAF5FB', sw: ['#FAF5FB', '#F8D2E4', '#A652B8', '#E88FB4'], rt: 'lavender', ink: 'd', top: '#F8D2E4' },
  lrainbow: { n: 'قوس قزح', base: 'light', g: 'live', anim: 'rainbow', acc: 'lrainbow', bar: '#F2F8FD', sw: ['#F2F8FD', '#7EC4F1', '#6D56D0', '#F2B33D'], rt: 'sky', ink: 'd', top: '#7EC4F1' },
  lsakura: { n: 'ربيع الكرز', base: 'light', g: 'live', anim: 'sakura', acc: 'lsakura', bar: '#FDF5F8', sw: ['#FDF5F8', '#9FD3F3', '#C84A7C', '#E4A15A'], rt: 'pink', ink: 'd', top: '#9FD3F3' },
  lballoon: { n: 'بالونات', base: 'light', g: 'live', anim: 'balloon', acc: 'lballoon', bar: '#FEF5F3', sw: ['#FEF5F3', '#9AD4F5', '#E2574C', '#F2B33D'], rt: 'cream', ink: 'd', top: '#9AD4F5' },
  lbeach: { n: 'بحر مشمس', base: 'light', g: 'live', anim: 'beach', acc: 'lbeach', bar: '#EDF9FB', sw: ['#EDF9FB', '#5FBBEF', '#0E8FAA', '#F0AE3C'], rt: 'sky', ink: 'd', top: '#5FBBEF' }
};
/* المفتاح الفعلي للسمة الآن (auto/prayer يختاران بين الداكن والفاتح) */
function uiTheme() {
  const t = Settings.theme;
  if (t === 'auto') return prefersDark() ? 'dark' : 'light';
  if (t === 'prayer') return isNightNow() ? 'dark' : 'light';
  return THEMES[t] ? t : (THEME_ALIAS[t] || 'dark');
}
const THEME_ALIAS = { kmamluk: 'kalham', ktazhib: 'kmadinah' };   // ثيمات 5.0 التي لم تبقَ
const ACC_OK = new Set(["alham", "amber", "aqsa", "berry", "bloom", "coffee", "coral", "custom", "emerald", "fanous", "indigo", "iznik", "lapis", "lilac", "madinah", "makkah", "mamluk", "morpho", "ocean", "olive", "peri", "pink", "plum", "rose", "rosegold", "rosered", "starry", "tazhib", "teal"].concat(Object.values(THEMES).map(t => t.acc).filter(Boolean)));
const themeBase = () => THEMES[uiTheme()].base;
const domTheme = () => uiTheme();
const THEME_BARS = Object.fromEntries(Object.entries(THEMES).map(([k, v]) => [k, v.bar]));
/* لون حرّ: درجات مشتقة من لون واحد */
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s * 100, l * 100];
}
function hslToHex(h, s, l) {
  s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0');
  return '#' + f(0) + f(8) + f(4);
}
function customAccentVars(hex, base) {
  const [h, s, l] = hexToHsl(hex);
  return { '--brand': hex, '--brand-2': hslToHex(h, s, Math.min(l + 6, 62)), '--brand-3': hslToHex(h, s, Math.min(l + 18, 72)),
    '--brand-deep': hslToHex(h, s, Math.max(l - 13, 10)), '--brand-tx': base === 'dark' ? hslToHex(h, Math.min(s + 5, 80), 70) : hex,
    '--soft-2': 'color-mix(in srgb,' + hex + ' 12%,transparent)' };
}
const CUSTOM_VARS = ['--brand', '--brand-2', '--brand-3', '--brand-deep', '--brand-tx', '--soft-2'];
function applyTheme() {
  const k = uiTheme(), T = THEMES[k], de = document.documentElement;
  de.setAttribute('data-theme', T.base);
  if (T.tone) de.setAttribute('data-tone', T.tone); else de.removeAttribute('data-tone');
  de.setAttribute('data-tkey', k);
  if (T.skin) de.setAttribute('data-skin', T.skin); else de.removeAttribute('data-skin');
  if (T.anim) de.setAttribute('data-anim', T.anim); else de.removeAttribute('data-anim');
  // وسن 5: رأس كل صفحة يحمل شريطًا ناعمًا مموّهًا من صورة الثيم (مرسوم مسبقًا — بلا كلفة تشغيل)
  de.toggleAttribute('data-ph', !!T.ph);
  de.style.setProperty('--th-h', T.ph ? 'url("' + new URL('img/th/' + k + '-h.webp', document.baseURI).href + '")' : 'none');
  // ترحيل لمرة واحدة: ألوان كل ثيم مشتقة من صورته (ما لم تختاري لونًا حرًّا)
  // ترحيل 5.1: عادت الثيمات القديمة بألوانها — نصحّح لون الإبراز إن كان من ثيمات 5.0 المحذوفة
  if (Settings.v51 !== 1) { Settings.v51 = 1; if (Settings.accent !== 'custom' && (Settings.accentAuto || !ACC_OK.has(Settings.accent))) { Settings.accent = T.acc || 'emerald'; Settings.accentAuto = !!T.acc; }
    if (Settings.heroMode && Settings.heroMode !== 'mine') Settings.heroMode = 'theme'; Store.set('settings', Settings); }
  if (typeof applySkinDeco === 'function') try { applySkinDeco(); } catch (e) { console.error(e); }
  const acc = Settings.accent || 'emerald';
  de.setAttribute('data-accent', acc);
  CUSTOM_VARS.forEach(v => de.style.removeProperty(v));
  if (acc === 'custom' && /^#[0-9a-f]{6}$/i.test(Settings.accentHex || '')) { const cv = customAccentVars(Settings.accentHex, T.base); Object.keys(cv).forEach(v => de.style.setProperty(v, cv[v])); }
  const warm = Settings.warm === 'on' || (Settings.warm === 'night' && isNightNow());
  de.toggleAttribute('data-warm', !!warm);
  Native.call('setNavBar', T.bar, T.base !== 'dark');
  de.dataset.qf = Settings.qfont === 'amiri' ? 'amiri' : 'hafs';
  applyUiScale();
}
/* حجم خط التطبيق: في الهاتف عبر تكبير نص الواجهة، وفي المتصفح عبر zoom */
function applyUiScale() {
  const s = +Settings.uiScale || 1;
  if (Native.has('setTextZoom')) Native.call('setTextZoom', Math.round(s * 100));
  else document.body && (document.body.style.zoom = s === 1 ? '' : String(s));
}
/* فتح وجهة من إشعار أو اختصار أو أداة: {r, a} */
window.openRoute = function (o) {
  try {
    if (typeof o === 'string') o = JSON.parse(o);
    if (!o || !o.r) return;
    if (Sheet.el) Sheet._remove();
    if (o.r === 'continue') { const lr = (typeof LastRead !== 'undefined' && LastRead) && LastRead.get(); if (lr) Router.go('reader', { s: 0, i: lr.i, mode: lr.mode }); else Router.tab('quran'); return; }
    if (['home', 'quran', 'prayer', 'azkar', 'more'].includes(o.r) && !o.a) { Router.tab(o.r); return; }
    if (SCREENS[o.r]) Router.go(o.r, o.a || {});
  } catch (e) { console.warn('route', e); }
};

/* ───────── المؤقّت العام ───────── */
const Ticker = {
  fns: new Set(), t: null, lastDay: dayKey(new Date()),
  start() { if (this.t) return; this.t = setInterval(() => this.tick(), 1000); },
  tick() {
    const now = new Date();
    const dk = dayKey(now);
    if (dk !== this.lastDay) { this.lastDay = dk; Bus.emit('day', now); }
    if (Router.cur && Router.cur.s && Router.cur.s.tick) try { Router.cur.s.tick(now); } catch (e) { console.error(e); }
    this.fns.forEach(f => { try { f(now); } catch (e) {} });
  },
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) { Ticker.tick(); Bus.emit('resume'); } });

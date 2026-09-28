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
  ambVol: 0.55, ambRecite: 'pause', ambLast: '', libReciter: '', qSrc: 'ayah', sleepMin: 0, asSpeed: 4,
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
  let h = date.getHours(); const m = date.getMinutes();
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
const WM = { vb: '5 490 1495 734', d: 'M364.0 1000.0V860.0H510.0V1000.0H364.0ZM223.0 1204.0Q186.0 1204.0 150.5 1191.5Q115.0 1179.0 86.5 1153.5Q58.0 1128.0 41.5 1090.0Q25.0 1052.0 25.0 1000.0Q25.0 956.0 43.5 916.0Q62.0 876.0 91.0 844.5Q120.0 813.0 151.0 793.0Q153.0 812.0 148.0 830.5Q143.0 849.0 131.0 865.0Q142.0 870.0 149.5 885.0Q157.0 900.0 160.0 916.0Q163.0 932.0 160.0 942.0Q150.0 934.0 140.0 930.0Q130.0 926.0 120.0 926.0Q98.0 926.0 82.0 947.5Q66.0 969.0 66.0 1000.0Q66.0 1044.0 83.0 1073.5Q100.0 1103.0 127.0 1117.0Q154.0 1131.0 184.0 1131.0Q216.0 1131.0 245.0 1115.5Q274.0 1100.0 292.5 1069.5Q311.0 1039.0 311.0 994.0Q311.0 972.0 304.5 950.5Q298.0 929.0 288.5 909.0Q279.0 889.0 269.0 874.0L337.0 738.0Q375.0 784.0 405.0 845.5Q435.0 907.0 435.0 995.0Q435.0 1063.0 404.0 1110.0Q373.0 1157.0 324.5 1180.5Q276.0 1204.0 223.0 1204.0Z M470.0 1000.0V860.0H550.0V691.0L690.0 660.0V860.0H750.0V691.0L890.0 660.0V860.0H950.0V691.0L1090.0 660.0V977.0Q1090.0 989.0 1080.0 994.0Q1070.0 999.0 1060.0 999.5Q1050.0 1000.0 1050.0 1000.0H470.0Z M1175.0 1132.0Q1232.0 1147.0 1265.5 1140.5Q1299.0 1134.0 1315.0 1116.0Q1331.0 1098.0 1335.5 1079.5Q1340.0 1061.0 1340.0 1052.0V872.0L1480.0 830.0V1022.0Q1480.0 1081.183334350586 1455.0 1118.591667175293Q1430.0 1156.0 1391.5 1173.5Q1353.0 1191.0 1310.5 1191.0Q1268.0 1191.0 1231.5 1175.5Q1195.0 1160.0 1175.0 1132.0ZM1480.0 830.0 1311.0 660.0Q1324.0 660.0 1348.0 658.5Q1372.0 657.0 1398.5 651.5Q1425.0 646.0 1447.5 634.5Q1470.0 623.0 1480.0 604.0V830.0ZM1311.259994506836 1000.0Q1264.520004272461 1000.0 1225.7600021362305 977.0Q1187.0 954.0 1163.5 915.1875Q1140.0 876.375 1140.0 830.25Q1140.0 783.0 1163.5091743469238 744.2777709960938Q1187.0183486938477 705.5555419921875 1226.0091705322266 682.7777709960938Q1265.0 660.0 1311.5 660.0Q1358.0 660.0 1396.0 683.0Q1434.0 706.0 1457.0 744.3272705078125Q1480.0 782.654541015625 1480.0 830.0Q1480.0 877.0 1457.0 915.5Q1434.0 954.0 1396.0 977.0Q1358.0 1000.0 1311.259994506836 1000.0ZM1310.9859161376953 860.0Q1324.0 860.0 1332.0 851.3000030517578Q1340.0 842.6000061035156 1340.0 830.0Q1340.0 817.3999938964844 1332.0 808.6999969482422Q1324.0 800.0 1310.9859161376953 800.0Q1297.9718322753906 800.0 1288.9859161376953 808.6999969482422Q1280.0 817.3999938964844 1280.0 830.0Q1280.0 842.6000061035156 1288.9859161376953 851.3000030517578Q1297.9718322753906 860.0 1310.9859161376953 860.0Z', star: 'M264.6 516.4 L279.0 551.0 L313.6 565.4 L299.3 600.0 L313.6 634.6 L279.0 649.0 L264.6 683.6 L230.0 669.3 L195.4 683.6 L181.0 649.0 L146.4 634.6 L160.7 600.0 L146.4 565.4 L181.0 551.0 L195.4 516.4 L230.0 530.7Z' };
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
  try { const now = new Date(), t = Times.forDay(now); return now < t.sunrise || now >= t.maghrib; } catch (e) { const h = new Date().getHours(); return h < 6 || h >= 19; }
}
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
};
/* المفتاح الفعلي للسمة الآن (auto/prayer يختاران بين الداكن والفاتح) */
function uiTheme() {
  const t = Settings.theme;
  if (t === 'auto') return prefersDark() ? 'dark' : 'light';
  if (t === 'prayer') return isNightNow() ? 'dark' : 'light';
  return THEMES[t] ? t : 'dark';
}
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

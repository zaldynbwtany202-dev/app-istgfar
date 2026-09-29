/* ════════════════════════════════════════════════════════════════
   وسن 5.1 · التلاوة الصوتية (مع تظليل الآية — ومتابعة تقريبية لمن لا توقيت له) · التفسير الميسّر · بطاقات المشاركة
   الصوت: everyayah.com (آية بآية) — يحتاج اتصالًا بالإنترنت.
   التفسير: التفسير الميسّر (مجمّع الملك فهد) عبر api.alquran.cloud ويُحفظ محليًا بعد أول تحميل.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const RECITERS = [
  ['Alafasy_128kbps', 'مشاري راشد العفاسي'], ['Husary_128kbps', 'محمود خليل الحصري'], ['Husary_Muallim_128kbps', 'الحصري · المصحف المعلّم'],
  ['Minshawy_Murattal_128kbps', 'محمد صديق المنشاوي'], ['Abdul_Basit_Murattal_192kbps', 'عبد الباسط عبد الصمد'], ['Maher_AlMuaiqly_64kbps', 'ماهر المعيقلي'],
  ['Abdurrahmaan_As-Sudais_192kbps', 'عبد الرحمن السديس'], ['Saood_ash-Shuraym_128kbps', 'سعود الشريم'], ['Yasser_Ad-Dussary_128kbps', 'ياسر الدوسري'],
  ['Nasser_Alqatami_128kbps', 'ناصر القطامي'], ['Abu_Bakr_Ash-Shaatree_128kbps', 'أبو بكر الشاطري'], ['Hudhaify_128kbps', 'علي الحذيفي'],
  ['Muhammad_Ayyoub_128kbps', 'محمد أيوب'], ['Ghamadi_40kbps', 'سعد الغامدي'], ['Hani_Rifai_192kbps', 'هاني الرفاعي'],
  ['Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net', 'أحمد بن علي العجمي'], ['Fares_Abbad_64kbps', 'فارس عبّاد'], ['Muhammad_Jibreel_128kbps', 'محمد جبريل'],
  // وسن 7: ٢٤ قارئًا جديدًا آية بآية (everyayah.com) — المصحف كاملًا بمتابعة دقيقة لكل آية
  ['Abdul_Basit_Mujawwad_128kbps', 'عبد الباسط عبد الصمد · مجوّد'], ['Husary_128kbps_Mujawwad', 'الحصري · مجوّد'], ['Minshawy_Mujawwad_192kbps', 'المنشاوي · مجوّد'],
  ['Mohammad_al_Tablaway_128kbps', 'محمد محمود الطبلاوي'], ['mahmoud_ali_al_banna_32kbps', 'محمود علي البنا'], ['Ahmed_Neana_128kbps', 'أحمد نعينع'],
  ['Abdullah_Basfar_192kbps', 'عبدالله بصفر'], ['Abdullaah_3awwaad_Al-Juhaynee_128kbps', 'عبدالله عواد الجهني'], ['Abdullah_Matroud_128kbps', 'عبدالله المطرود'],
  ['Salah_Al_Budair_128kbps', 'صلاح البدير'], ['Muhsin_Al_Qasim_192kbps', 'عبدالمحسن القاسم'], ['Khaalid_Abdullaah_al-Qahtaanee_192kbps', 'خالد القحطاني'],
  ['Ali_Jaber_64kbps', 'علي جابر'], ['Salaah_AbdulRahman_Bukhatir_128kbps', 'صلاح بو خاطر'], ['Yaser_Salamah_128kbps', 'ياسر سلامة'],
  ['Akram_AlAlaqimy_128kbps', 'أكرم العلاقمي'], ['Ali_Hajjaj_AlSuesy_128kbps', 'علي حجاج السويسي'], ['Sahl_Yassin_128kbps', 'سهل ياسين'],
  ['Muhammad_AbdulKareem_128kbps', 'محمد عبدالكريم'], ['khalefa_al_tunaiji_64kbps', 'خليفة الطنيجي'], ['Ayman_Sowaid_64kbps', 'أيمن سويد'],
  ['aziz_alili_128kbps', 'عزيز عليلي'], ['Karim_Mansoori_40kbps', 'كريم منصوري'], ['Parhizgar_48kbps', 'شهريار پرهيزگار'],
];
const pad3 = n => String(n).padStart(3, '0');
/** عدد السور بصيغة عربية سليمة: سورة واحدة · سورتان · 3 سور · 65 سورة · 102 سورة */
const pSur = n => n === 1 ? 'سورة واحدة' : plural(n, 'سورة', 'سورتان', 'سور', 'سورة');
/* ── وسن 4.5 · مكتبة القرّاء (mp3quran.net): سورة كاملة، مع متابعة الآيات لمن تتوفّر توقيتاته، وتنزيل دون إنترنت ── */
const LIB = () => window.WASAN_RECITERS || [];
/** وسن 6.3: الأشهر والأحدث (بالترتيب) */
const FEAT = () => (window.WASAN_FEATURED || []).map(id => LIB().find(x => x.id === id)).filter(Boolean);
/* ── وسن 4.8 · قرّاء مدمجون داخل التطبيق: تعمل دون إنترنت ولا تحتاج تنزيلًا ──
   [رقم السورة، الملف، (من آية، إلى آية) للمقاطع، المدة بالثواني] — المصدر: أرشيف الإنترنت archive.org */
const OFFLINE = [
  { id: 'khedr', n: 'أحمد خضر', f: [[1,'001',43],[18,'018',1911],[36,'036',1038],[55,'055',670],[56,'056',741],[67,'067',448],[78,'078',308],[89,'089',255],[90,'090',131],[91,'091',96],[97,'097',45],[110,'110',88]] },
  { id: 'shaaban', n: 'عبدالله شعبان', f: [[18,'018',1986],[36,'036',1015],[55,'055',579],[56,'056',577],[67,'067',471],[78,'078',261],[87,'087',98],[88,'088',124],[93,'093',55],[94,'094',36],[95,'095',56],[96,'096',84],[97,'097',41],[98,'098',123],[99,'099',52],[100,'100',56],[101,'101',51],[102,'102',47],[103,'103',25],[104,'104',46],[105,'105',35],[106,'106',31],[107,'107',42],[108,'108',20],[109,'109',41],[110,'110',29],[111,'111',32],[112,'112',17],[113,'113',27],[114,'114',32]] },
  { id: 'mosad', n: 'عبدالرحمن مسعد', f: [[1,'001',49],[3,'003_1-14',1,14,331],[10,'010_3-25',3,25,868],[12,'012_102-111',102,111,252],[14,'014_42-47',42,47,143],[16,'016_90-99',90,99,289],[19,'019_65-98',65,98,399],[32,'032',608],[49,'049',653],[73,'073',343],[78,'078',333],[87,'087',110],[88,'088',155],[100,'100',88],[107,'107',49]] },
  { id: 'shahat', n: 'محمود الشحات أنور', f: [[1,'001',293],[36,'036',2081],[55,'055',1225],[67,'067',1054],[93,'093',120],[102,'102',97],[103,'103',48],[105,'105',70],[106,'106',60],[107,'107',83],[108,'108',43],[109,'109',89],[110,'110',57],[111,'111',60],[112,'112',31],[113,'113',56],[114,'114',58]] },
];
const offOf = id => { const m = /^o:(\w+)$/.exec(id || ''); if (!m) return null; const o = OFFLINE.find(x => x.id === m[1]); if (!o) return null;
  if (!o.lib) { const by = {}; o.f.forEach(e => { if (!by[e[0]]) by[e[0]] = e; });
    // وسن 6: بقية سور القارئ من أرشيف الإنترنت (بثّ أو تنزيل)، مع توقيتات آيات محسوبة من التسجيل نفسه
    const net = ((window.WASAN_XREC || {})[o.id]) || {}, all = new Set(Object.keys(by).concat(Object.keys(net)).map(Number));
    const rt = (window.WASAN_RTIMES || {})[o.id] || {};
    o.lib = { id: 'o:' + o.id, off: true, n: o.n, k: '', s: 'recit/' + o.id + '/', t: !!(rt.b || rt.n), rt, net, c: all.size, nb: Object.keys(by).length, l: [...all].sort((a, b) => a - b).join(','), by,
      min: Math.round(o.f.reduce((a, e) => a + e[e.length - 1], 0) / 60) }; }
  return o.lib; };
/** مصدر السورة: ملف مدمج، أو رابط الأرشيف، أو خادم المكتبة */
const srcUrl = (m, sn) => { const n = m.net && m.net[sn]; return n ? (Array.isArray(n) ? n[0] : n) : m.s + pad3(sn) + '.mp3'; };
/** توقيتات محسوبة (مدمجة في التطبيق) لقارئ وسورة: ملف مدمج (b) أو ملف الأرشيف (n) */
function rtFor(m, sn, bundled) {
  if (!m || !m.rt) return null; const e0 = bundled && m.by && m.by[sn], k = e0 ? e0[1] : String(sn), arr = (e0 ? m.rt.b : m.rt.n) && (e0 ? m.rt.b : m.rt.n)[k];
  if (!arr || !arr.length) return null;
  return arr.map(x => ({ ayah: x[0], st: x[1] * 10, en: x[2] * 10 }));
}
/** سورة متابعتها تقريبية (تلاوة مجوّدة فيها تكرار)؟ */
const rtLow = (m, sn, bundled) => { if (!m || !m.rt || !m.rt.lo) return false; const e0 = bundled && m.by && m.by[sn]; return m.rt.lo.includes(e0 ? 'b:' + e0[1] : 'n:' + sn); };
// وسن 6.3: مقطع «ما تيسّر» من ملف مدمج [سورة، ملف، من، إلى، مدة] أو من الأرشيف [رابط، من، إلى]
const offPart = (m, sn) => { const e = m && m.by && m.by[sn]; if (e) return e.length > 4 ? [e[2], e[3]] : null; const n = m && m.net && m.net[sn]; return Array.isArray(n) ? [n[1], n[2]] : null; };
const libOf = id => { const o = offOf(id); if (o) return o; const m = /^m:(\d+)$/.exec(id || ''); return m ? LIB().find(x => x.id === +m[1]) || null : null; };
const libHas = (m, sn) => !m.l || m.l.split(',').includes(String(sn));
/* ── وسن 7 · «المصحف كاملًا» مع كل قارئ: السورة التي لا يوجد لها تسجيل بصوت قارئك تُتلى تلقائيًا
   بصوت قارئ قريب من أسلوبه (أو من تختاره أنت)، ثم يعود «وسن» إلى قارئك في السورة التالية ── */
const FILL_PAIR = { 'o:shahat': 90010, 'o:khedr': 112, 'o:shaaban': 92, 'o:mosad': 253 };
const recFillOn = () => Settings.recFill !== false;
function fillFor(main, sn) {
  if (!main || libHas(main, sn)) return null;
  const mj = /مجو/.test(main.k || '') || main.id === 'o:shahat', ids = [];
  const w = /^m:(\d+)$/.exec(Settings.recFillWith || ''); if (w) ids.push(+w[1]);
  if (FILL_PAIR[main.id]) ids.push(FILL_PAIR[main.id]);
  ids.push(...(mj ? [119, 51, 122, 118] : [112, 118, 123, 92]));
  for (const id of ids) { const x = LIB().find(y => y.id === id); if (x && x !== main && libHas(x, sn)) return 'm:' + x.id; }
  return null;
}
/** اسم القارئ المكمِّل لقارئ ما (للعرض) */
function fillWho(main) { if (!main || !main.l) return ''; const miss = [...Array(114)].map((_, i) => i + 1).find(n => !libHas(main, n)); const f = miss && fillFor(main, miss); return f ? reciterName(f).split(' · ')[0] : ''; }
const YT_RECITERS = ['أحمد خضر', 'عبدالله شعبان', 'عبدالرحمن مسعد', 'محمود الشحات أنور'];
function reciterName(id) { const m = libOf(id); if (m) return m.n + (m.k ? ' · ' + m.k : ''); return (RECITERS.find(r => r[0] === id) || RECITERS[0])[1]; }
/* توقيتات الآيات: تُحفظ بعد أول تحميل فتعمل دون إنترنت */
const Timings = {
  key: (id, sn) => 'tm.' + id + '.' + sn,
  cached(id, sn) { return Store.get(this.key(id, sn), null); },
  get(id, sn) {
    const c = this.cached(id, sn); if (c) return Promise.resolve(c);
    return Net.get('https://www.mp3quran.net/api/v3/ayat_timing?surah=' + sn + '&read=' + id).then(t => {
      const j = JSON.parse(t), tm = (Array.isArray(j) ? j : []).map(x => ({ ayah: +x.ayah, st: +x.start_time, en: +x.end_time })).filter(x => x.en > x.st).sort((a, b) => a.st - b.st);
      if (!tm.length) throw new Error('empty'); Store.set(this.key(id, sn), tm); return tm;
    });
  },
};
/* ── وسن 5.1 · «متابعة تقريبية» للقرّاء الذين لا تتوفّر لهم توقيتات الآيات (ومنهم القرّاء المدمجون) ──
   نأخذ نِسَب آيات السورة من قارئ مرجعي موقَّت من الأسلوب نفسه (مرتّل/مجوّد) ونمدّها على مدة تلاوة القارئ،
   وإن لم تتوفّر (دون إنترنت) فبطول كل آية بالحروف مع وقفة بين الآيات. فتبدأ التلاوة من الآية المختارة،
   وتُظلَّل الآية المتلوّة وتنتقل الصفحات، كسائر القرّاء. */
const EstT = {
  // قرّاء مرجعيون توقيتاتهم منتظمة (قيس ذلك على سور عدّة؛ استُبعد من اختلّت توقيتاته)
  REF: { mj: [51, 122, 288], d: [123, 31, 112] },
  refIds(m) { const k = (m && m.k) || ''; return k.includes('مجو') ? this.REF.mj : this.REF.d; },
  letters(s) { const x = String(s || '').match(/[\u0621-\u063A\u0641-\u064A\u0670\u0671]/g); return x ? x.length : 1; },
  refsCached(m, sn) { return this.refIds(m).map(id => Timings.cached(id, sn)).filter(c => c && c.length > 1); },
  refFetch(m, sn) { return Promise.all(this.refIds(m).map(id => Timings.get(id, sn).catch(() => null))); },
  /** تقدير أولي: طول الآيات بالحروف، ممزوجًا بمتوسط نِسَب القرّاء المرجعيين إن توفّرت */
  build(sn, dur, part, refs) {
    const S = Q.S[sn - 1]; if (!S || !(dur > 0) || !isFinite(dur)) return null;
    const D = dur * 1000, a0 = part ? part[0] : 1, a1 = part ? part[1] : S.n, P = 2, items = [];
    if (a0 === 1 && sn !== 1 && sn !== 9) items.push([0, 19 + P]);   // البسملة
    for (let a = a0; a <= a1; a++) items.push([a, this.letters(Q.t[S.start + a - 1]) + P]);
    const lead = Math.min(1200, D * .01), tot = items.reduce((s, x) => s + x[1], 0); let t = lead; const out = [];
    items.forEach(([a, w]) => { const d = (D - lead) * w / tot; out.push({ ayah: a, st: t, en: t + Math.max(200, d - 250) }); t += d; });
    if (part || !refs || !refs.length) return out;
    const med = v => { const s = v.slice().sort((p, q) => p - q), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
    const norm = refs.map(r => { const T = r[r.length - 1].en, o = {}; r.forEach(x => { o[x.ayah] = [x.st / T, x.en / T]; }); return o; });
    out.forEach(x => { const v = norm.map(o => o[x.ayah]).filter(Boolean); if (!v.length) return; x.st = (x.st + med(v.map(p => p[0])) * D) / 2; x.en = (x.en + med(v.map(p => p[1])) * D) / 2; });
    out.sort((p, q) => p.st - q.st); return out;
  },
  /* تصحيحات المستمعة: «الشيخ يقرأ هذه الآية الآن» — تُحفظ لكل قارئ وسورة فتتحسّن المتابعة كل مرة */
  akey: (id, sn) => 'tma.' + id + '.' + sn,
  anchors(id, sn) { return Store.get(this.akey(id, sn), []); },
  addAnchor(id, sn, a, t) {
    let L = this.anchors(id, sn).filter(x => x.a !== a && !(x.a < a && x.t >= t) && !(x.a > a && x.t <= t));
    L.push({ a, t: Math.round(t) }); L.sort((p, q) => p.a - q.a); Store.set(this.akey(id, sn), L.slice(-60)); return L;
  },
  /** تمديد التقدير بين نقاط التصحيح (خطّي قطعةً قطعة) */
  warp(tm, L, D) {
    if (!tm || !L || !L.length) return tm;
    const E = {}; tm.forEach(x => { E[x.ayah] = x.st; });
    let pts = L.filter(x => E[x.a] != null).map(x => [E[x.a], x.t]);
    if (!pts.length) return tm;
    pts = [[0, 0]].concat(pts).concat([[D, D]]).sort((p, q) => p[0] - q[0]);
    const f = s => { for (let i = 1; i < pts.length; i++) if (s <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return x1 > x0 ? y0 + (s - x0) * (y1 - y0) / (x1 - x0) : y1; } return s; };
    return tm.map(x => ({ ayah: x.ayah, st: f(x.st), en: Math.max(f(x.st) + 200, f(x.en)) }));
  },
};
/* التنزيلات: ملف لكل سورة في مساحة التطبيق (بلا أذونات) عبر مدير التنزيلات في أندرويد */
const Downloads = {
  st: Store.get('dl', {}),
  ok() { return Native.has('dlStart'); },
  key: (id, sn) => 'm' + String(id).replace(/[^a-z0-9]/gi, '') + '_' + pad3(sn),
  rel: (id, sn) => 'm' + String(id).replace(/[^a-z0-9]/gi, '') + '/' + pad3(sn) + '.mp3',
  save() { Store.set('dl', this.st); Bus.emit('dl'); },
  state(id, sn) { const x = this.st[this.key(id, sn)]; return x ? x.s : ''; },
  path(id, sn) { if (this.state(id, sn) !== 'done' || !this.ok()) return ''; const p = Native.call('dlPath', this.rel(id, sn)); if (!p) { delete this.st[this.key(id, sn)]; this.save(); } return p || ''; },
  start(m, sn) {
    if (!this.ok()) { toast('التنزيل يعمل في التطبيق على الهاتف'); return; }
    if (!libHas(m, sn)) return;
    const k = this.key(m.id, sn), s = Q.S[sn - 1];
    this.st[k] = { s: 'run', ts: Date.now(), p: 0 }; this.save();
    Native.call('dlStart', k, srcUrl(m, sn), this.rel(m.id, sn), 'سورة ' + (s ? s.name : sn) + ' — ' + m.n);
    if (m.off) { if (!rtFor(m, sn, false)) EstT.refFetch(m, sn).catch(() => {}); } else if (m.t) Timings.get(m.rd || m.id, sn).catch(() => {}); else EstT.refFetch(m, sn).catch(() => {});   // لتعمل المتابعة دون إنترنت
    this.watch();
  },
  cancel(id, sn) { const k = this.key(id, sn); Native.call('dlCancel', k, this.rel(id, sn)); delete this.st[k]; this.save(); },
  remove(id, sn) { const k = this.key(id, sn); Native.call('dlDelete', this.rel(id, sn)); delete this.st[k]; this.save(); },
  running() { return Object.keys(this.st).filter(k => this.st[k].s === 'run'); },
  count(id) { const p = 'm' + id + '_'; return Object.keys(this.st).filter(k => k.startsWith(p) && this.st[k].s === 'done').length; },
  refresh() {
    const ks = this.running(); if (!ks.length || !this.ok()) return false;
    let changed = false, prog = false, fails = 0;
    try {
      const r = JSON.parse(Native.call('dlStatus', JSON.stringify(ks)) || '{}');
      ks.forEach(k => { const x = r[k]; if (!x) return;
        if (x.s === 'done') { this.st[k] = { s: 'done', ts: Date.now(), z: x.z || 0 }; changed = true; }
        else if (x.s === 'fail' || x.s === 'none') { delete this.st[k]; changed = true; if (x.s === 'fail') fails++; }
        else if ((this.st[k].p || 0) !== (x.p || 0)) { this.st[k].p = x.p || 0; prog = true; } });
      if (changed) this.save(); else if (prog) { Store.set('dl', this.st); Bus.emit('dlp'); }
      if (fails) toast(fails > 1 ? 'تعذّر تنزيل بعض السور — تحقّق من الاتصال' : 'تعذّر تنزيل إحدى السور — تحقّق من الاتصال');
    } catch (e) {}
    return this.running().length > 0;
  },
  watch() { clearInterval(this._t); this._t = setInterval(() => { if (!this.refresh()) clearInterval(this._t); }, 1500); },
};
if (Downloads.running().length) setTimeout(() => Downloads.watch(), 2500);
window.onDlDone = function (k, ok) { const x = Downloads.st[k]; if (!x) return; if (ok) { Downloads.st[k] = { s: 'done', ts: Date.now() }; } else delete Downloads.st[k]; Downloads.save(); };

const Player = {
  a: null, pre: null, i: -1, end: -1, left: 1, on: false, playing: false, loading: false, basm: false, el: null, alt: null,
  base() { return 'https://everyayah.com/data/' + (Settings.reciter || RECITERS[0][0]) + '/'; },
  file(i) { return this.base() + pad3(Q.s[i]) + pad3(Q.a[i]) + '.mp3'; },
  reps() { return Settings.qRepeat == null ? 1 : Settings.qRepeat; },
  lib() { return libOf(this.alt || Settings.reciter); },
  /** وسن 7: تنبيه لطيف حين تُتلى سورة بصوت القارئ المكمِّل */
  fillTip(sn) { if (!this.alt || !Q.ready) return; toast('سورة ' + Q.S[sn - 1].name + ' بصوت ' + reciterName(this.alt).split(' · ')[0] + ' — ليكتمل لك المصحف', 3400); },   // alt: قارئ بديل مؤقت لسورة غير متوفرة بصوت القارئ المختار
  start(i, opts) {
    if (!Q.ready) return;
    opts = opts || {};
    this.sm = false; this.sleepEnd = false;
    if (this.lib()) { this.startLib(i); return; }
    const s = surahOf(i);
    this.i = i; this.end = Settings.qCont ? Q.t.length - 1 : s.start + s.n - 1;
    this.on = true; this.left = this.reps(); this.ensureUI();
    if (Q.a[i] === 1 && Q.s[i] !== 1 && Q.s[i] !== 9 && !opts.noBasm) { this.highlight(); this.playUrl(this.base() + '001001.mp3', true); }
    else this.play(i);
    Native.call('keepScreenOn', true); this.armSleep();
  },
  play(i) { this.i = i; this.playUrl(this.file(i), false); this.highlight(); this.preload(); },
  /* ── سورة كاملة من المكتبة ── */
  startLib(i) {
    const sn = Q.s[i], s = surahOf(i), main = libOf(Settings.reciter);
    if (this.alt && (!main || libHas(main, sn))) this.alt = null;   // العودة إلى القارئ المختار متى توفّرت السورة بصوته
    const m = this.lib(); if (!m) { this.alt = null; this.start(i); return; }
    if (!libHas(m, sn)) { const f = recFillOn() && fillFor(main || m, sn); if (f && f !== this.alt) { this.alt = f; this.fillTip(sn); this.startLib(i); return; } missSheet(m, i); return; }
    this.on = true; this.sm = true; this.left = this.reps(); this.ensureUI();
    this.end = Settings.qCont ? Q.t.length - 1 : s.start + s.n - 1;
    this.loadSurah(sn, Q.a[i]);
    Native.call('keepScreenOn', true); this.armSleep();
  },
  loadSurah(sn, ayah) {
    const m = this.lib(); if (!m) return;
    this.cs = sn; this.tm = null; this.cur = -1; this.basm = false;
    const bundled = !!(m.off && m.by && m.by[sn]), pr = m.off ? offPart(m, sn) : null, a = this.audio(); let want = ayah || 1; const local = bundled ? '' : Downloads.path(m.id, sn);
    if (pr) want = pr[0];
    this.remote = bundled ? m.s + m.by[sn][1] + '.ogg' : srcUrl(m, sn); this.local = !!local; this.part = pr; this.adj = false;
    if (!bundled && !local && navigator.onLine === false) toast('هذه السورة تحتاج اتصالًا — أو نزّلها للاستماع دون إنترنت', 3200);
    this.loading = true; a.src = local || this.remote; a.playbackRate = Settings.qRate || 1;
    const seek = () => { const e = this.tm && this.tm.find(x => x.ayah === want); if (e && want > 1) try { a.currentTime = e.st / 1000; } catch (er) {} };
    this.est = false;
    // وسن 5.1: توقيتات تقديرية حين لا تتوفّر الدقيقة — تُبنى متى عُرفت مدة الملف
    const est = () => {
      if (this.cs !== sn || !this.on || this.tm) return;
      const e0 = m.off && m.by[sn], dur = e0 && !pr ? e0[e0.length - 1] : (isFinite(a.duration) && a.duration > 0 ? a.duration : pr && e0 ? e0[e0.length - 1] : 0);
      const base = EstT.build(sn, dur, pr, pr ? null : EstT.refsCached(m, sn)); if (!base) return;
      this.tmBase = base; this.tmDur = dur * 1000; this.tm = EstT.warp(base, EstT.anchors(m.id, sn), this.tmDur); this.est = true; seek();
      if (!Store.get('estTip', 0)) { Store.set('estTip', 1); toast('متابعة الآيات مع هذا القارئ تقريبية', 2600); }
    };
    const estSoon = () => {
      const go = () => { if (m.off || (a.readyState >= 1 && isFinite(a.duration) && a.duration > 0)) est(); else { a.addEventListener('loadedmetadata', est, { once: true }); a.addEventListener('durationchange', est, { once: true }); } };
      if (pr || EstT.refsCached(m, sn).length) { go(); return; }
      let done = false; const fin = () => { if (!done) { done = true; go(); } }; EstT.refFetch(m, sn).then(fin, fin); setTimeout(fin, 3500);
    };
    const rt = m.off ? rtFor(m, sn, bundled) : null;
    if (rt) {   // وسن 6: توقيتات محسوبة من التسجيل نفسه — مع تصحيحات المستمعة إن وُجدت
      const D = rt[rt.length - 1].en + 1500; this.tmBase = rt; this.tmDur = D; this.tm = EstT.warp(rt, EstT.anchors(m.id, sn), D); this.adj = true;
      if (rtLow(m, sn, bundled) && !EstT.anchors(m.id, sn).length) setTimeout(() => { if (this.cs === sn && this.on) toast('المتابعة في هذه السورة تقريبية (تلاوة مجوّدة) — إن سبقت أو تأخرت فاضغط الآية التي يقرؤها الشيخ ثم «الشيخ يقرأ هذه الآن»', 4200); }, 1800);
      if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true });
    }
    else if (m.t && !m.off) Timings.get(m.rd || m.id, sn).then(tm => { if (this.cs !== sn || !this.on) return; this.tm = tm; if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true }); }).catch(estSoon);
    else estSoon();
    const p = a.play(); if (p && p.catch) p.catch(e => { if (e && e.name !== 'AbortError') this.fail(); });
    this.i = Q.S[sn - 1].start + (want - 1); this.highlight(); this.sync();
  },
  /* متابعة الآية المتلوّة من التوقيتات + تكرار الآية */
  tick() {
    if (!this.sm || !this.tm || !this.on || !this.a) return;
    const t = this.a.currentTime * 1000, tm = this.tm; let k = -1;
    for (let j = 0; j < tm.length; j++) { if (tm[j].st <= t + 40) k = j; else break; }
    if (k < 0) return;
    const e = tm[k], r = this.reps();
    if (!this.est && this.cur === e.ayah && e.ayah > 0 && (r === 0 || this.left > 1) && t >= e.en - 140) { if (r !== 0) this.left--; this.a.currentTime = e.st / 1000; return; }
    if (e.ayah !== this.cur) {
      if (this.cur > 0) Growth.add('ql', 1);
      this.cur = e.ayah; this.left = r; this.basm = e.ayah === 0;
      this.i = Q.S[this.cs - 1].start + Math.max(0, e.ayah - 1); this.highlight(); this.sync();
    }
  },
  libEnded() {
    if (!this.tm) Growth.add('ql', this.part ? this.part[1] - this.part[0] + 1 : Q.S[this.cs - 1].n); else if (this.cur > 0) Growth.add('ql', 1);
    if (this.sleepEnd) { this.sleepDone(); return; }
    if (Settings.qCont && this.cs < 114) { let n = this.cs + 1; const main = libOf(Settings.reciter);
      if (main && !libHas(main, n) && recFillOn()) { const f = fillFor(main, n); if (f) { this.alt = f; this.fillTip(n); this.loadSurah(n, 1); this.sync(); return; } }
      if (this.alt && main && libHas(main, n)) this.alt = null;
      const m = this.lib(); while (n <= 114 && !libHas(m, n)) n++; if (n <= 114) { this.loadSurah(n, 1); return; } }
    this.stop(); toast('انتهت التلاوة — تقبّل الله');
  },
  libStep(d) {
    if (this.tm) { const k = this.tm.findIndex(x => x.ayah === this.cur), e = this.tm[k + d]; if (k >= 0 && e) { this.left = this.reps(); this.a.currentTime = e.st / 1000; return; } }
    const main = libOf(Settings.reciter); let n = this.cs + d;
    if (main && recFillOn() && n >= 1 && n <= 114) { if (libHas(main, n)) this.alt = null; else { const f = fillFor(main, n); if (f) { this.alt = f; this.fillTip(n); this.loadSurah(n, 1); this.sync(); return; } } }
    const m = this.lib(); while (n >= 1 && n <= 114 && !libHas(m, n)) n += d;
    if (n >= 1 && n <= 114) this.loadSurah(n, 1); else toast(d > 0 ? 'آخر سورة' : 'أول سورة');
  },
  /** وسن 5.1: تصحيح المتابعة التقريبية — «الشيخ يقرأ هذه الآية الآن» */
  resync(ayah) {
    const m = this.lib(); if (!m || !(this.est || this.adj) || !this.a || !this.tmBase) return false;
    const t = Math.max(0, this.a.currentTime * 1000 - 700);   // نطرح زمن ردّ الفعل
    const L = EstT.addAnchor(m.id, this.cs, ayah, t); this.tm = EstT.warp(this.tmBase, L, this.tmDur); this.cur = -1; this.tick(); return true;
  },
  /* ── مؤقّت النوم ── */
  armSleep() {
    clearTimeout(this._sl); clearInterval(this._fade); this.sleepEnd = false; this.sleepAt = 0;
    const v = +Settings.sleepMin || 0; if (!v || !this.on) return;
    if (v < 0) { this.sleepEnd = true; return; }
    this.sleepAt = Date.now() + v * 60000;
    this._sl = setTimeout(() => this.fadeStop(), v * 60000);
  },
  sleepDone() { this.stop(); if (typeof Ambient !== 'undefined') Ambient.stop(); toast('انتهى مؤقّت النوم — تصبح على خير'); },
  fadeStop() {
    if (!this.a || !this.on) return; let vol = 1; clearInterval(this._fade);
    this._fade = setInterval(() => { vol -= 0.08; if (vol <= 0.05) { clearInterval(this._fade); this.sleepDone(); if (this.a) this.a.volume = 1; return; } try { this.a.volume = vol; } catch (e) {} }, 600);
  },
  audio() {
    if (this.a) return this.a;
    const a = this.a = new Audio(); a.preload = 'auto';
    a.addEventListener('ended', () => this.ended());
    a.addEventListener('error', () => {
      // وسن 4.5: إن تعذّر تشغيل الملف المنزَّل نعود إلى البث من الإنترنت مرة واحدة
      if (this.on && this.sm && this.local && this.remote) { const t = a.currentTime; this.local = false; a.src = this.remote; try { if (t) a.currentTime = t; } catch (e) {} const p = a.play(); if (p && p.catch) p.catch(() => {}); return; }
      if (this.on && a.src) this.fail(); });
    a.addEventListener('playing', () => { this.playing = true; this.loading = false; this.sync(); });
    a.addEventListener('pause', () => { this.playing = false; this.sync(); });
    a.addEventListener('waiting', () => { this.loading = true; this.sync(); });
    a.addEventListener('timeupdate', () => { if (this.sm) this.tick(); });
    a.addEventListener('playing', () => { if (typeof Ambient !== 'undefined') Ambient.recite(true); });
    a.addEventListener('pause', () => { if (typeof Ambient !== 'undefined') Ambient.recite(false); });
    return a;
  },
  playUrl(u, basm) {
    const a = this.audio(); this.basm = basm; this.loading = true;
    a.src = u; a.playbackRate = Settings.qRate || 1;
    const p = a.play(); if (p && p.catch) p.catch(e => { if (e && e.name !== 'AbortError') this.fail(); });
    this.sync();
  },
  preload() { const n = this.i + 1; if (n <= this.end && n < Q.t.length) { this.pre = new Audio(); this.pre.preload = 'auto'; this.pre.src = this.file(n); } },
  ended() {
    if (!this.on) return;
    if (this.sm) { this.libEnded(); return; }
    if (this.basm) { this.play(this.i); return; }
    Growth.add('ql', 1);
    const r = this.reps();
    if (r === 0 || this.left > 1) { if (r !== 0) this.left--; this.a.currentTime = 0; this.a.play(); return; }
    this.next(true);
  },
  next(auto) {
    if (this.sm) { this.libStep(1); return; }
    const n = this.i + 1;
    if (this.sleepEnd && auto && Q.a[n] === 1) { this.sleepDone(); return; }
    if (n > this.end || n >= Q.t.length) { this.stop(); toast(auto ? 'انتهت التلاوة — تقبّل الله' : 'آخر آية'); return; }
    this.left = this.reps();
    if (Q.a[n] === 1 && Q.s[n] !== 1 && Q.s[n] !== 9) { this.i = n; this.highlight(); this.playUrl(this.base() + '001001.mp3', true); return; }
    this.play(n);
  },
  prev() { if (this.sm) { this.libStep(-1); return; } if (this.a && this.a.currentTime > 2.5 && !this.basm) { this.a.currentTime = 0; return; } const p = Math.max(0, this.i - 1); this.left = this.reps(); this.play(p); },
  toggle() { if (!this.a) return; if (this.a.paused) { const p = this.a.play(); if (p && p.catch) p.catch(() => this.fail()); } else this.a.pause(); },
  cmd(c) { if (c === 'toggle') this.toggle(); else if (c === 'next') this.next(); else if (c === 'prev') this.prev(); else if (c === 'stop') this.stop(); },
  stop() {
    this.on = false; this.playing = false; this.loading = false; this.sm = false;
    clearTimeout(this._sl); clearInterval(this._fade); this.sleepAt = 0; this.sleepEnd = false;
    if (typeof Ambient !== 'undefined') Ambient.recite(false);
    if (this.a) { try { this.a.pause(); this.a.removeAttribute('src'); this.a.load(); } catch (e) {} }
    $$('.ay.playing').forEach(x => x.classList.remove('playing'));
    if (this.el) { this.el.classList.remove('show'); const e = this.el; setTimeout(() => e.remove(), 300); this.el = null; }
    Native.call('audioState', JSON.stringify({ active: false }));
    Native.call('keepScreenOn', !!(Router.cur && Router.cur.s && Router.cur.s.keepOn));
  },
  fail() {
    const off = navigator.onLine === false && !(this.lib() && this.lib().off);
    this.stop();
    toast(off ? 'التلاوة تحتاج اتصالًا بالإنترنت' : 'تعذّر تشغيل التلاوة — حاول مجددًا', 3200);
  },
  highlight() {
    $$('.ay.playing').forEach(x => x.classList.remove('playing'));
    if (!this.on || !Router.cur || Router.cur.r !== 'reader') return;
    if (RS.mode === 'page' && Q.p[this.i] !== RS.p) { RS.p = Q.p[this.i]; SCREENS.reader.draw(); }
    else if (RS.mode !== 'page' && Q.s[this.i] !== RS.s) { RS.s = Q.s[this.i]; SCREENS.reader.draw(this.i); }
    const sp = $('.ay[data-i="' + this.i + '"]');
    if (sp) {
      sp.classList.add('playing');
      const r = sp.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 150) window.scrollTo({ top: r.top + window.scrollY - window.innerHeight * 0.33, behavior: 'smooth' });
    }
  },
  label() { const s = surahOf(this.i); if (this.sm && this.part) return 'سورة ' + s.name + ' · الآيات ' + N(this.part[0]) + '–' + N(this.part[1]); if (this.sm && !this.tm) return 'سورة ' + s.name; return 'سورة ' + s.name + ' · ' + (this.basm ? 'البسملة' : 'الآية ' + N(Q.a[this.i])); },
  ensureUI() {
    if (this.el) return;
    const el = this.el = document.createElement('div'); el.className = 'pbar';
    el.innerHTML = '<button class="pb-i" data-p="menu" aria-label="القارئ">' + icon('headphones') + '</button>' +
      '<div class="pb-t" data-p="menu"><b id="pb-t1"></b><span id="pb-t2"></span></div>' +
      '<div class="pb-ctl"><button class="pb-b" data-p="prev" aria-label="السابقة">' + icon('skipb') + '</button>' +
      '<button class="pb-b pb-play" data-p="toggle" aria-label="تشغيل/إيقاف">' + icon('pause') + '</button>' +
      '<button class="pb-b" data-p="next" aria-label="التالية">' + icon('skipf') + '</button></div>' +
      '<button class="pb-b pb-x" data-p="stop" aria-label="إيقاف">' + icon('x') + '</button>';
    document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; const p = b.dataset.p; if (p === 'menu') playerSheet(); else this.cmd(p); });
    requestAnimationFrame(() => el.classList.add('show'));
  },
  sync() {
    if (!this.el) return;
    $('#pb-t1', this.el).textContent = this.label();
    $('#pb-t2', this.el).textContent = reciterName(this.alt || Settings.reciter) + (this.reps() !== 1 ? ' · تكرار ' + (this.reps() === 0 ? '∞' : N(this.reps())) : '');
    const pb = $('.pb-play', this.el); pb.innerHTML = this.loading ? '<span class="spin"></span>' : icon(this.playing ? 'pause' : 'play');
    Native.call('audioState', JSON.stringify({ active: this.on, playing: this.playing || this.loading, title: this.label(), sub: reciterName(this.alt || Settings.reciter) }));
    try { if (navigator.mediaSession && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: this.label(), artist: reciterName(this.alt || Settings.reciter), album: 'وسن' }); } catch (e) {}
  },
};

function playerSheet(startI) {
  const reps = [[1, 'بدون'], [2, '٢'], [3, '٣'], [5, '٥'], [10, '١٠'], [0, '∞']], rates = [[0.75, '0.75×'], [1, '1×'], [1.25, '1.25×'], [1.5, '1.5×']];
  const sleeps = [[0, 'بدون'], [15, '١٥ د'], [30, '٣٠ د'], [60, 'ساعة'], [-1, 'نهاية السورة']];
  const m = libOf(Settings.reciter), si = startI != null ? startI : (Player.on ? Player.i : (typeof RS !== 'undefined' && Q.ready ? Q.S[RS.s - 1].start : 0)), sn = Q.ready ? Q.s[si] : 1;
  const dlRow = () => {
    if (!m) return '<div class="ps-note">' + icon('info') + '<span>للاستماع دون إنترنت اختر قارئًا من «مكتبة القرّاء» ثم نزّل السور.</span></div>';
    if (m.off) { const pr = offPart(m, sn), nm = Q.ready ? Q.S[sn - 1].name : '', bd = !!(m.by && m.by[sn]), av = libHas(m, sn), st = bd ? '' : Downloads.state(m.id, sn);
      const fw = !av && recFillOn() ? fillFor(m, sn) : null;
      const sub = !av ? (fw ? 'تُتلى بصوت ' + reciterName(fw).split(' · ')[0] + ' ليكتمل لك المصحف' : 'غير متوفرة بصوته — ' + pSur(m.c) + ' متاحة') : bd ? 'تعمل دون إنترنت' : st === 'done' ? 'منزّلة — تعمل دون إنترنت' : st === 'run' ? 'جارٍ التنزيل…' : 'تُسمَع عبر الإنترنت — نزّلها لتعمل دونه';
      const end = !av ? '' : bd || st === 'done' ? '<span class="ok">' + icon('check') + '</span>' : st === 'run' ? '<span class="spin"></span>' : '<button class="act" id="ps-dlb">' + icon('save') + 'نزّلها</button>';
      return '<div class="ps-dl" id="ps-dl"><div class="grow"><b>سورة ' + esc(nm) + (pr ? ' · الآيات ' + N(pr[0]) + '–' + N(pr[1]) : '') + '</b><span>' + sub + '</span></div>' + end + '</div>' +
        '<button class="btn ghost block" id="ps-off" style="margin-top:8px">' + icon('layers') + 'كل سور ' + esc(m.n) + ' (' + N(m.c) + ')</button>'; }
    const st = Downloads.state(m.id, sn), nm = Q.ready ? Q.S[sn - 1].name : '';
    return '<div class="ps-dl" id="ps-dl"><div class="grow"><b>سورة ' + esc(nm) + '</b><span>' + (st === 'done' ? 'منزّلة — تعمل دون إنترنت' : st === 'run' ? 'جارٍ التنزيل…' : libHas(m, sn) ? 'تُسمَع عبر الإنترنت' : 'غير متوفرة بصوت هذا القارئ') + '</span></div>' +
      (st === 'done' ? '<span class="ok">' + icon('check') + '</span>' : st === 'run' ? '<span class="spin"></span>' : libHas(m, sn) ? '<button class="act" id="ps-dlb">' + icon('save') + 'نزّلها</button>' : '') +
      '</div><button class="btn ghost block" data-go="downloads" style="margin-top:8px">' + icon('layers') + 'كل التنزيلات</button>';
  };
  const html = '<div class="sh-t">التلاوة</div><div class="sh-s">' + (Q.ready ? esc(ayahRef(si)) : '') + '</div>' +
    '<div class="mx"><b class="lbl2">القارئ</b><button class="li ps-rec" id="ps-rec"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(reciterName(Settings.reciter)) + '</div>' +
    '<div class="s">' + (m ? (m.off ? pSur(m.c) + ' بصوته' + (recFillOn() ? ' · المصحف كاملًا' : '') + ' · متابعة الآيات' : (m.t ? 'سورة كاملة مع متابعة الآيات' : 'سورة كاملة مع متابعة تقريبية للآيات') + ' · ' + (m.c < 114 ? pSur(m.c) : 'المصحف كاملًا')) : 'آية بآية · متابعة دقيقة') + '</div></div><span class="link">تغيير</span></button>' +
    dlRow() +
    '<b class="lbl2">تكرار كل آية</b><div class="seg" id="ps-rep">' + reps.map(([v, t]) => '<button data-v="' + v + '" class="' + (Player.reps() === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    (m && !m.t ? '<div class="faint" style="font-size:11.5px;margin-top:4px">تكرار الآية يحتاج توقيتًا دقيقًا — يعمل مع القرّاء الموسومين «متابعة دقيقة»</div>' : '') +
    '<b class="lbl2">السرعة</b><div class="seg" id="ps-rate">' + rates.map(([v, t]) => '<button data-v="' + v + '" class="' + ((Settings.qRate || 1) === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    '<b class="lbl2">عند نهاية السورة</b><div class="seg" id="ps-cont"><button data-v="0" class="' + (!Settings.qCont ? 'on' : '') + '">توقف</button><button data-v="1" class="' + (Settings.qCont ? 'on' : '') + '">تابع للسورة التالية</button></div>' +
    '<b class="lbl2">مؤقّت النوم</b><div class="seg" id="ps-sl">' + sleeps.map(([v, t]) => '<button data-v="' + v + '" class="' + ((+Settings.sleepMin || 0) === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    (startI != null || !Player.on ? '<button class="btn gold block" id="ps-go" style="margin-top:16px">' + icon('play') + 'ابدأ الاستماع</button>' : '') +
    '<div class="faint" style="font-size:12px;margin-top:10px;text-align:center">' + (m ? (m.off ? 'المصدر: أرشيف الإنترنت archive.org' + (m.id === 'o:mosad' ? ' و way2quran.com' : '') : m.src === 'archive' ? 'التسجيلات من أرشيف الإنترنت archive.org' : m.src === 'qa' ? 'التسجيلات من quranicaudio.com' : 'التسجيلات من mp3quran.net') : 'التسجيلات من everyayah.com') + '</div></div>';
  Sheet.open(html, el => {
    const seg = (id, key, conv, after) => { const s = $(id, el); s.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setSetting(key, conv(b.dataset.v)); $$('button', s).forEach(x => x.classList.toggle('on', x === b)); Player.sync(); if (after) after(); }; };
    seg('#ps-rep', 'qRepeat', Number, () => { Player.left = Player.reps(); }); seg('#ps-rate', 'qRate', Number, () => { if (Player.a) Player.a.playbackRate = Settings.qRate; });
    seg('#ps-cont', 'qCont', v => v === '1'); seg('#ps-sl', 'sleepMin', Number, () => { Player.armSleep(); const v = +Settings.sleepMin; if (v) toast(v < 0 ? 'تتوقف التلاوة بنهاية السورة' : 'تتوقف التلاوة بعد ' + pM(v)); });
    $('#ps-rec', el).onclick = () => Sheet.close(() => reciterSheet(() => playerSheet(startI)));
    const dlb = $('#ps-dlb', el); if (dlb) dlb.onclick = () => { Downloads.start(m, sn); toast('بدأ تنزيل السورة — تجده في الإشعارات'); Sheet.close(); };
    const go = $('#ps-go', el); if (go) go.onclick = () => Sheet.close(() => Player.start(si));
    const po = $('#ps-off', el); if (po) po.onclick = () => Sheet.close(() => offlineSheet(m.id.slice(2)));
  });
}

/* ── وسن 6: سورة غير متوفرة بصوت القارئ المختار — بديل مؤقت بمتابعة دقيقة، ثم العودة تلقائيًا ── */
function missSheet(m, i) {
  const sn = Q.s[i], s = surahOf(i), mj = m.id === 'o:shahat';
  const alts = (mj ? [[119, 'محمود خليل الحصري', 'مجوّد'], [51, 'عبدالباسط عبدالصمد', 'مجوّد']] : [])
    .concat([[118, 'محمود خليل الحصري', ''], [123, 'مشاري العفاسي', ''], [112, 'محمد صديق المنشاوي', '']])
    .filter(a => LIB().some(x => x.id === a[0] && libHas(x, sn))).slice(0, 3);
  const html = '<div class="sh-t">سورة ' + esc(s.name) + '</div><div class="sh-s">غير متوفرة بصوت ' + esc(m.n) + (m.c ? ' — تتوفّر له ' + pSur(m.c) : '') + '</div>' +
    '<div class="mx"><div class="ps-note">' + icon('info') + '<span>لم نجد تسجيلًا موثوقًا لهذه السورة بصوته. استمع إليها بصوت قارئ آخر هذه المرة فقط، ويعود «وسن» إلى قارئك المختار تلقائيًا في السورة التالية.</span></div></div>' +
    '<div class="list mx" style="margin-top:10px">' + alts.map(a => '<button class="li" data-alt="' + a[0] + '"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(a[1]) + (a[2] ? ' <span class="rk">' + esc(a[2]) + '</span>' : '') + '</div><div class="s">متابعة الآيات دقيقة · عبر الإنترنت</div></div>' + icon('play', 'faint') + '</button>').join('') + '</div>' +
    '<div class="mx">' + (m.off ? '<button class="btn ghost block" id="ms-list" style="margin-top:10px">' + icon('layers') + 'سور ' + esc(m.n) + ' المتاحة (' + N(m.c) + ')</button>' : '') +
    '<button class="btn ghost block" id="ms-rec" style="margin-top:8px">' + icon('headphones') + 'غيّر القارئ</button>' +
    '<button class="btn gold block" id="ms-auto" style="margin-top:8px">' + icon('layers') + 'أكمل السور الناقصة تلقائيًا دائمًا</button></div>';
  Sheet.open(html, el => {
    $$('[data-alt]', el).forEach(b => b.onclick = () => Sheet.close(() => { if (navigator.onLine === false) { toast('الاستماع بصوت قارئ آخر يحتاج اتصالًا بالإنترنت'); return; } Player.alt = 'm:' + b.dataset.alt; Player.start(i); }));
    const l = $('#ms-list', el); if (l) l.onclick = () => Sheet.close(() => offlineSheet(m.id.slice(2)));
    $('#ms-rec', el).onclick = () => Sheet.close(() => reciterSheet(() => Player.start(i)));
    $('#ms-auto', el).onclick = () => Sheet.close(() => { setSetting('recFill', true); Player.alt = null; Player.start(i); });
  });
}

/* ── اختيار القارئ · وسن 7: كل القرّاء بالمصحف كاملًا، وتصفية سريعة، وتراويح الحرمين ── */
const RS_CHIPS = [['all', 'الكل'], ['full', 'المصحف كاملًا بصوته'], ['t', 'متابعة دقيقة'], ['mj', 'مجوّد'], ['tr', 'تراويح الحرمين'], ['dl', 'منزّل عندي']];
function reciterSheet(done) {
  const cur = Settings.reciter || RECITERS[0][0], fill = recFillOn();
  const rowA = ([id, n]) => '<button class="li opt ' + (id === cur ? 'on' : '') + '" data-r="' + id + '" data-q="' + esc(n) + '" data-full="1" data-t="1"' + (/مجو/.test(n) ? ' data-mj="1"' : '') + '><div class="grow"><div class="t">' + esc(n) + '</div><div class="s">آية بآية · المصحف كاملًا · متابعة دقيقة</div></div><span class="rad"></span></button>';
  const rowL = (x, feat) => { const id = 'm:' + x.id, dn = Downloads.count(x.id);
    return '<button class="li opt ' + (id === cur ? 'on' : '') + '" data-r="' + id + '" data-q="' + esc(x.n + ' ' + x.k) + '"' + (feat ? ' data-f="1"' : '') + (x.c >= 114 ? ' data-full="1"' : '') + (x.t ? ' data-t="1"' : '') + (/مجو/.test(x.k || '') ? ' data-mj="1"' : '') + (x.tr ? ' data-tr="1"' : '') + (dn ? ' data-dl="1"' : '') + '><div class="grow"><div class="t">' + esc(x.n) + (x.k ? ' <span class="rk">' + esc(x.k) + '</span>' : '') + (x.nw ? ' <span class="rk nw">جديد</span>' : '') + '</div>' +
      '<div class="s">' + (x.t ? 'متابعة دقيقة' : 'متابعة تقريبية') + ' · ' + (x.c < 114 ? pSur(x.c) + ' بصوته' + (fill ? ' · يكتمل المصحف تلقائيًا' : '') : 'المصحف كاملًا') + (dn ? ' · ' + N(dn) + ' منزّلة' : '') + '</div></div><span class="rad"></span></button>'; };
  const TR = LIB().filter(x => x.tr), ML = LIB().filter(x => !x.tr);
  const total = RECITERS.length + LIB().length + OFFLINE.length;
  const html = '<div class="sh-t">القارئ</div><div class="sh-s">' + N(total) + ' تلاوة · المصحف كاملًا مع كل قارئ</div>' +
    '<div class="mx"><div class="search rs-q">' + icon('search') + '<input id="rq" placeholder="ابحث عن قارئ…" autocomplete="off"></div></div>' +
    '<div class="chips rs-ch" id="rs-ch">' + RS_CHIPS.map(([k, t], i) => '<button class="chip' + (i ? '' : ' on') + '" data-c="' + k + '">' + t + '</button>').join('') + '</div>' +
    '<div class="mx"><div class="li rs-fill"><div class="ic g">' + icon('layers') + '</div><div class="grow"><div class="t">إكمال المصحف تلقائيًا</div><div class="s">السورة التي لا تسجيل لها بصوت قارئك تُتلى بصوت قارئ قريب من أسلوبه، ثم يعود إليه</div></div><button class="switch ' + (fill ? 'on' : '') + '" id="rs-fill"></button></div></div>' +
    '<div class="rs-g" data-g="o">قرّاؤك المختارون</div><div class="rs-list">' + OFFLINE.map(o => { const m = offOf('o:' + o.id), fw = fill ? fillWho(m) : '';
      return '<div class="li-wrap"><button class="li opt ' + (m.id === cur ? 'on' : '') + '" data-r="' + m.id + '" data-q="' + esc(o.n) + '" data-t="1"' + (o.id === 'shahat' ? ' data-mj="1"' : '') + '><div class="ic ic-off">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(o.n) + '</div>' +
        '<div class="s">' + pSur(m.c) + ' بصوته' + (fw ? ' · والبقية بصوت ' + esc(fw) : '') + ' · متابعة الآيات</div></div><span class="rad"></span></button><button class="act rs-ls" data-ol="' + o.id + '">السور</button></div>'; }).join('') + '</div>' +
    // وسن 6.3: الأشهر والأحدث أولًا
    (FEAT().length ? '<div class="rs-g" data-g="f">الأشهر والأحدث</div><div class="rs-list">' + FEAT().map(x => rowL(x, true)).join('') + '</div>' : '') +
    (TR.length ? '<div class="rs-g" data-g="h">من صلاة التراويح في الحرمين الشريفين · المصحف كاملًا</div><div class="rs-list">' + TR.map(x => rowL(x)).join('') + '</div>' : '') +
    '<div class="rs-g" data-g="a">تلاوة آية بآية</div><div class="rs-list">' + RECITERS.map(rowA).join('') + '</div>' +
    '<div class="rs-g" data-g="l">مكتبة القرّاء · سورة كاملة وتنزيل دون إنترنت</div><div class="rs-list" id="rs-l">' + ML.map(x => rowL(x)).join('') + '</div>' +
    '<div class="rs-g" data-g="y">على يوتيوب</div><div class="rs-list">' + YT_RECITERS.map(n => '<button class="li" data-yt="' + esc(n) + '" data-q="' + esc(n) + '"><div class="ic">' + icon('play') + '</div><div class="grow"><div class="t">' + esc(n) + '</div><div class="s">يفتح تلاواته في يوتيوب</div></div>' + icon('chev', 'faint') + '</button>').join('') + '</div>' +
    '<div class="rs-empty faint" id="rs-e" hidden>لا نتائج — جرّب اسمًا آخر أو تصفية أخرى</div>';
  Sheet.open(html, el => {
    const q = $('#rq', el); let chip = 'all';
    const apply = () => { const v = normAr(q.value.trim()); let shown = 0;
      $$('[data-r],[data-yt]', el).forEach(b => { const t = normAr(b.dataset.q || b.textContent);
        const okC = chip === 'all' || (!!b.dataset[chip === 'full' ? 'full' : chip] && !b.dataset.yt);
        const ok = (!v || t.includes(v)) && okC && !((v || chip !== 'all') && b.dataset.f);
        b.style.display = ok ? '' : 'none'; const w = b.closest('.li-wrap'); if (w) w.style.display = ok ? '' : 'none'; if (ok) shown++; });
      $$('.rs-g', el).forEach(g => { g.style.display = v || chip !== 'all' ? 'none' : ''; });
      const e = $('#rs-e', el); if (e) e.hidden = shown > 0; };
    q.addEventListener('input', debounce(apply, 180));
    $('#rs-ch', el).onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; chip = b.dataset.c; $$('#rs-ch .chip', el).forEach(x => x.classList.toggle('on', x === b)); vibrate(6); apply(); };
    $('#rs-fill', el).onclick = e => { e.stopPropagation(); const on = !recFillOn(); setSetting('recFill', on); e.currentTarget.classList.toggle('on', on); vibrate(8); toast(on ? 'يكتمل المصحف تلقائيًا مع كل قارئ' : 'السور غير المتوفرة بصوت قارئك ستسألك قبل التشغيل'); };
    el.addEventListener('click', e => {
      const ol = e.target.closest('[data-ol]'); if (ol) { Sheet.close(() => offlineSheet(ol.dataset.ol)); return; }
      const y = e.target.closest('[data-yt]');
      if (y) { const s = (Router.cur && Router.cur.r === 'reader' && Q.ready) ? 'سورة ' + Q.S[RS.s - 1].name + ' ' : '';
        const u = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s + y.dataset.yt); if (Native.has('openUrl')) Native.call('openUrl', u); else window.open(u, '_blank'); return; }
      const b = e.target.closest('[data-r]'); if (!b) return;
      Player.alt = null; setSetting('reciter', b.dataset.r); vibrate(8);
      const wasOn = Player.on, i = Player.i; if (wasOn) Player.stop();
      Sheet.close(() => { if (wasOn) Player.start(i); if (done) done(); else if (Router.cur && Router.cur.r === 'settings') Router.refresh(); });
    });
    const on = $('.opt.on', el); if (on) setTimeout(() => on.scrollIntoView({ block: 'center' }), 60);
  });
}

/* ── وسن 7 · القارئ المكمِّل: من يتلو السور التي لا تسجيل لها بصوت قارئك ── */
function fillWithSheet(done) {
  const cur = Settings.recFillWith || '';
  const top = [112, 118, 119, 123, 53, 51, 92, 17, 62, 102, 133, 122].map(id => LIB().find(x => x.id === id)).filter(x => x && x.c >= 114);
  const row = (id, t, s) => '<button class="li opt ' + (id === cur ? 'on' : '') + '" data-w="' + id + '"><div class="grow"><div class="t">' + esc(t) + '</div><div class="s">' + esc(s) + '</div></div><span class="rad"></span></button>';
  const html = '<div class="sh-t">القارئ المكمِّل</div><div class="sh-s">يتلو السور التي لا يوجد لها تسجيل بصوت قارئك، ثم يعود «وسن» إلى قارئك تلقائيًا</div><div class="list mx">' +
    row('', 'تلقائي — الأقرب إلى أسلوب قارئك', 'مرتّل مع المرتّل، ومجوّد مع المجوّد') + top.map(x => row('m:' + x.id, x.n + (x.k ? ' · ' + x.k : ''), (x.t ? 'متابعة دقيقة' : 'متابعة تقريبية') + ' · المصحف كاملًا')).join('') + '</div>';
  Sheet.open(html, el => el.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (!b) return; setSetting('recFillWith', b.dataset.w); vibrate(8); Sheet.close(() => { if (done) done(); }); }));
}

/* ── وسن 4.8 · سور القارئ المدمجة: قائمة تُشغَّل مباشرة دون إنترنت ── */
function offlineSheet(rid) {
  const m = offOf('o:' + rid); if (!m) return;
  const go = () => {
    const o = OFFLINE.find(x => x.id === rid), fm = t => { const mm = Math.floor(t / 60), ss = Math.round(t % 60); return N(mm) + ':' + String(ss).padStart(2, '0').replace(/\d/g, d => N(+d)); };
    const own = m.l.split(',').map(Number), fill = recFillOn(), list = fill ? Q.S.map(s => s.id) : own;
    const row = sn => { const S = Q.S[sn - 1], e = m.by[sn], part = e && e.length > 4, st = e ? 'b' : Downloads.state(m.id, sn), np = !e ? offPart(m, sn) : null;
      if (!libHas(m, sn)) { const fw = fillFor(m, sn); return '<div class="li os-fill" data-os="' + sn + '"><div class="ic">' + surahBadge(sn) + '</div><div class="grow"><div class="t">سورة ' + esc(S.name) + '</div><div class="s">' + (fw ? 'بصوت ' + esc(reciterName(fw).split(' · ')[0]) + ' ليكتمل لك المصحف' : 'لا يوجد لها تسجيل بعد') + '</div></div>' + icon('play', '', 'width:20px;height:20px;color:var(--tx-3)') + '</div>'; }
      const tag = e ? '<span class="rk">دون إنترنت</span>' : st === 'done' ? '<span class="rk">منزّلة</span>' : '<span class="rk faint">من الإنترنت</span>';
      const sub = e ? (part ? 'الآيات ' + N(e[2]) + '–' + N(e[3]) : 'السورة كاملة') + ' · ' + fm(e[e.length - 1]) : (np ? 'الآيات ' + N(np[0]) + '–' + N(np[1]) + ' · ' : '') + (st === 'run' ? 'جارٍ التنزيل…' : st === 'done' ? 'تعمل دون إنترنت' : 'بثّ مباشر — أو نزّلها');
      const dl = !e && Downloads.ok() ? (st === 'done' ? '' : st === 'run' ? '<span class="faint" style="font-size:12px">' + N(Downloads.st[Downloads.key(m.id, sn)].p || 0) + '٪</span>' : '<button class="ibtn plain" data-dl="' + sn + '" aria-label="تنزيل">' + icon('down') + '</button>') : '';
      return '<div class="li" data-os="' + sn + '"><div class="ic">' + surahBadge(sn) + '</div><div class="grow"><div class="t">سورة ' + esc(S.name) + ' ' + tag + '</div><div class="s">' + sub + '</div></div>' + dl + icon('play', '', 'width:20px;height:20px;color:var(--gold)') + '</div>'; };
    const html = () => '<div class="sh-t">' + esc(m.n) + '</div><div class="sh-s">' + pSur(m.c) + ' بصوته' + (m.nb ? ' · ' + N(m.nb) + ' تعمل دون إنترنت' : '') + (fill ? ' · والبقية بصوت قارئ قريب من أسلوبه ليكتمل المصحف' : '') + ' · مع متابعة الآيات</div>' +
      (m.c > m.nb && Downloads.ok() ? '<div class="mx" style="margin:6px 16px 0"><button class="btn ghost block" id="os-all">' + icon('down') + 'تنزيل كل السور للاستماع دون إنترنت</button></div>' : '') +
      '<div class="list mx" id="os-l">' + list.map(row).join('') + '</div><div class="faint" style="font-size:12px;margin:12px 16px;text-align:center">المصدر: أرشيف الإنترنت archive.org — كل ما وُجد من تسجيلاته للسور كاملة. توقيت الآيات محسوب من التسجيل نفسه، ويمكنك تصحيحه بلمسة: «الشيخ يقرأ هذه الآن»</div>';
    Sheet.open(html(), el => {
      const refresh = () => { const l = $('#os-l', el); if (l) l.outerHTML = '<div class="list mx" id="os-l">' + list.map(row).join('') + '</div>'; bind(); };
      const bind = () => { const l = $('#os-l', el); if (!l) return; l.onclick = e => {
        const d = e.target.closest('[data-dl]'); if (d) { e.stopPropagation(); Downloads.start(m, +d.dataset.dl); toast('بدأ تنزيل السورة'); setTimeout(refresh, 400); return; }
        const b = e.target.closest('[data-os]'); if (!b) return; const sn = +b.dataset.os;
        Player.alt = null; setSetting('reciter', m.id); vibrate(8); const wasOn = Player.on; if (wasOn) Player.stop();
        Sheet.close(() => Player.start(Q.S[sn - 1].start)); }; };
      bind();
      const all = $('#os-all', el); if (all) all.onclick = () => { let n = 0; own.forEach(sn => { if (!m.by[sn] && !Downloads.state(m.id, sn)) { Downloads.start(m, sn); n++; } }); toast(n ? 'بدأ تنزيل ' + pSur(n) + ' — التقدّم في الإشعارات' : 'كل السور منزّلة'); setTimeout(refresh, 500); };
      const onDl = () => refresh(); Bus.on('dlp', onDl); Bus.on('dl', onDl);
    });
  };
  if (Q.ready) go(); else loadQuran().then(go).catch(() => toast('تعذّر تحميل المصحف'));
}

/* ── شبكة: الجسر الأصلي أولًا ثم fetch ── */
const Net = {
  n: 0, wait: {},
  get(url) {
    if (Native.has('httpGet')) return new Promise((res, rej) => {
      const id = 'h' + (++this.n); this.wait[id] = { res, rej, t: setTimeout(() => { delete this.wait[id]; rej(new Error('timeout')); }, 20000) };
      Native.call('httpGet', id, url);
    });
    return fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  },
};
window.onNativeHttp = function (id, code, body) {
  const w = Net.wait[id]; if (!w) return; delete Net.wait[id]; clearTimeout(w.t);
  if (code >= 200 && code < 300) w.res(body); else w.rej(new Error(String(code)));
};

const Tafsir = {
  cache: Store.get('tafsir', {}), order: Store.get('tafsirOrder', []),
  get(i) {
    const k = Q.s[i] + ':' + Q.a[i];
    if (this.cache[k]) return Promise.resolve(this.cache[k]);
    return Net.get('https://api.alquran.cloud/v1/ayah/' + k + '/ar.muyassar').then(txt => {
      const j = JSON.parse(txt), t = j && j.data && j.data.text; if (!t) throw new Error('empty');
      this.cache[k] = t; this.order.push(k);
      while (this.order.length > 600) delete this.cache[this.order.shift()];
      Store.set('tafsir', this.cache); Store.set('tafsirOrder', this.order);
      return t;
    });
  },
};
function tafsirSheet(i) {
  const html = '<div class="sh-t">التفسير الميسّر</div><div class="sh-s">' + esc(ayahRef(i)) + '</div>' +
    '<div class="tf-ay">' + esc(qd(Q.t[i])) + ' <span class="an gold">' + ayNum(Q.a[i]) + '</span></div>' +
    '<div class="tf-tx" id="tf-tx"><div class="skel" style="height:16px;margin:8px 0"></div><div class="skel" style="height:16px;margin:8px 0;width:80%"></div><div class="skel" style="height:16px;margin:8px 0;width:60%"></div></div>' +
    '<div class="acts" style="padding:0 16px"><button class="act" id="tf-c">' + icon('copy') + 'نسخ التفسير</button><button class="act" id="tf-p">' + icon('play') + 'استماع للآية</button></div>' +
    '<div class="faint" style="font-size:11.5px;text-align:center;padding:8px 20px 0">التفسير الميسّر — مجمّع الملك فهد لطباعة المصحف الشريف</div>';
  Sheet.open(html, el => {
    let text = '';
    Tafsir.get(i).then(t => { text = t; const b = $('#tf-tx', el); if (b) b.textContent = t; })
      .catch(() => { const b = $('#tf-tx', el); if (b) b.innerHTML = '<div class="empty" style="padding:14px 0">تعذّر تحميل التفسير — تحقّق من اتصالك بالإنترنت، ويُحفظ بعد أول تحميل.</div>'; });
    $('#tf-c', el).onclick = () => { if (text) copyText('﴿' + Q.t[i] + '﴾ [' + surahOf(i).name + ': ' + Q.a[i] + ']\nالتفسير الميسّر: ' + text); };
    $('#tf-p', el).onclick = () => Sheet.close(() => Player.start(i, { noBasm: true }));
  });
}

/* ── بطاقات المشاركة (صورة) ── */
const ShareCard = {
  async render(o) {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const qFont = o.kind === 'ayah' ? 'Hafs' : (o.kind === 'name' ? 'Display' : 'Amiri');
    try { await Promise.all([document.fonts.load('60px ' + qFont), document.fonts.load('700 40px Plex'), document.fonts.load('700 60px Display')]); } catch (e) {}
    const g = x.createRadialGradient(W / 2, H * 0.28, 60, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, '#12735C'); g.addColorStop(0.55, '#0A4A3C'); g.addColorStop(1, '#052A22');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // نقش خفيف
    x.save(); x.globalAlpha = 0.06; x.strokeStyle = '#E9CD86'; x.lineWidth = 2;
    for (let yy = -60; yy < H + 60; yy += 120) for (let xx = -60; xx < W + 60; xx += 120) { star(x, xx, yy, 44, 33); x.stroke(); }
    x.restore();
    // إطار ذهبي مزدوج
    const gold = x.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#F6E3A8'); gold.addColorStop(0.5, '#D4AF63'); gold.addColorStop(1, '#A8802F');
    x.strokeStyle = gold; x.lineWidth = 4; rr(x, 48, 48, W - 96, H - 96, 42); x.stroke(); x.globalAlpha = 0.5; x.lineWidth = 2; rr(x, 64, 64, W - 128, H - 128, 34); x.stroke(); x.globalAlpha = 1;
    // الشعار
    try { const img = await loadImg('img/mark.svg'); x.drawImage(img, W / 2 - 55, 104, 110, 110); } catch (e) {}
    x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#E9D8A6';
    x.font = '700 38px Plex'; x.fillText(o.title || '', W / 2, 272);
    // النص الرئيسي بحجم يتكيّف مع طوله
    const text = o.kind === 'ayah' ? qd(o.text) : o.text;
    let fs = o.kind === 'name' ? 150 : 66, lines;
    for (; fs >= 30; fs -= 2) { x.font = (o.kind === 'name' ? '700 ' : '') + fs + 'px ' + qFont; lines = wrap(x, text, W - 240); if (lines.length * fs * 1.9 <= H - 700) break; }
    const lh = fs * (o.kind === 'ayah' ? 1.95 : 1.75), top = (H - lines.length * lh) / 2 + fs * 0.35 + 30;
    x.fillStyle = '#FFFFFF'; x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 12;
    lines.forEach((l, k) => x.fillText(l, W / 2, top + k * lh));
    x.shadowBlur = 0;
    if (o.ref) { x.font = '600 34px Plex'; x.fillStyle = '#D4AF63'; x.fillText(o.ref, W / 2, top + lines.length * lh + 26); }
    if (o.sub) { x.font = '400 30px Plex'; x.fillStyle = 'rgba(255,255,255,.72)'; wrap(x, o.sub, W - 260).slice(0, 3).forEach((l, k) => x.fillText(l, W / 2, top + lines.length * lh + 90 + k * 46)); }
    // التوقيع
    try {   // الشعار الكتابي «وسن» بنجمته — مسار متجهي
      const v = WM.vb.split(' ').map(Number), hh = 66, sc = hh / v[3], ww = v[2] * sc;
      x.save(); x.translate(W / 2 - ww / 2 - v[0] * sc, H - 204 - v[1] * sc); x.scale(sc, sc);
      x.fillStyle = '#F4E7C2'; x.fill(new Path2D(WM.d));
      const sg = x.createLinearGradient(v[0], v[1], v[0] + v[2], v[1] + v[3]); sg.addColorStop(0, '#FCE9B4'); sg.addColorStop(1, '#C9953F');
      x.fillStyle = sg; x.fill(new Path2D(WM.star)); x.restore();
    } catch (e) { x.font = '700 52px Display'; x.fillStyle = gold; x.fillText('وسن', W / 2, H - 132); }
    x.font = '400 26px Plex'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText('رفيقك في الصلاة والذكر', W / 2, H - 92);
    return c;
    function star(ctx, cx, cy, R, r2) { ctx.beginPath(); for (let k = 0; k < 16; k++) { const rad = k % 2 ? r2 : R, a = Math.PI / 8 * k - Math.PI / 2; ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } ctx.closePath(); }
    function rr(ctx, a, b, w, h, r) { ctx.beginPath(); ctx.moveTo(a + r, b); ctx.arcTo(a + w, b, a + w, b + h, r); ctx.arcTo(a + w, b + h, a, b + h, r); ctx.arcTo(a, b + h, a, b, r); ctx.arcTo(a, b, a + w, b, r); ctx.closePath(); }
    function wrap(ctx, t, maxW) { const words = String(t).split(/\s+/), out = []; let line = ''; words.forEach(w => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test; }); if (line) out.push(line); return out; }
    function loadImg(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
  },
  async share(o, text) {
    toast('جارٍ تجهيز الصورة…', 1200);
    const c = await this.render(o), url = c.toDataURL('image/png');
    if (Native.has('shareImage')) { Native.call('shareImage', url, text || ''); return; }
    Sheet.open('<div class="sh-t">بطاقة للمشاركة</div><div class="mx"><img src="' + url + '" style="width:100%;border-radius:18px;display:block" alt=""><a class="btn gold block" style="margin-top:12px" download="wasan.png" href="' + url + '">' + icon('share') + 'حفظ الصورة</a></div>');
  },
};

window.Player = Player; window.Tafsir = Tafsir; window.ShareCard = ShareCard;

/* ═══════════════ تنزيلات التلاوة ═══════════════ */
const dlCountTxt = n => n === 0 ? 'لم تُنزَّل سور بعد' : n === 2 ? 'سورتان منزّلتان' : pSur(n) + ' منزّلة';
const fmtMB = b => N((b / 1048576).toFixed(b > 104857600 ? 0 : 1)) + ' م.ب';
SCREENS.downloads = {
  parent: 'quran',
  render() {
    const m0 = libOf(Settings.reciter), m = m0 && !m0.off ? m0 : null, ok = Downloads.ok();
    const others = [...new Set(Object.keys(Downloads.st).filter(k => Downloads.st[k].s === 'done').map(k => +k.slice(1).split('_')[0]))].filter(id => !m || id !== m.id).map(id => LIB().find(x => x.id === id)).filter(Boolean);
    const used = ok ? +(Native.call('dlUsage') || 0) : 0;
    let h = hdr('تنزيلات التلاوة', 'استمع دون إنترنت', { back: true, compact: true });
    // وسن 4.8: قرّاء مدمجون لا يحتاجون تنزيلًا
    h += sec('قرّاؤك المختارون') + '<div class="list mx" id="dl-off">' + OFFLINE.map(o => { const x = offOf('o:' + o.id);
      return '<button class="li" data-ol="' + o.id + '"><div class="ic ic-off">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(o.n) + '</div><div class="s">' + pSur(x.c) + ' بصوته · ' + N(x.nb) + ' تعمل دون إنترنت · ' + N(Downloads.count(x.id)) + ' منزّلة</div></div>' + icon('chev', 'faint') + '</button>'; }).join('') + '</div>';
    if (!ok) h += '<div class="ps-note mx mt">' + icon('info') + '<span>التنزيل يعمل في التطبيق على الهاتف؛ هنا معاينة فقط.</span></div>';
    h += '<div class="hc mt dl-hero"><div class="row" style="gap:12px"><div class="dua-ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + (m ? esc(reciterName(Settings.reciter)) : 'اختر قارئًا من المكتبة') + '</div>' +
      '<div class="s">' + (m ? dlCountTxt(Downloads.count(m.id)) + (used ? ' · المساحة ' + fmtMB(used) : '') : 'قرّاء «آية بآية» يُسمَعون عبر الإنترنت فقط') + '</div></div>' +
      '<button class="act" id="dl-rec">تغيير</button></div>' +
      (m ? '<div class="dl-acts"><button class="act" id="dl-all">' + icon('save') + 'نزّل كل السور</button><button class="act" id="dl-del">' + icon('trash') + 'احذف تنزيلاته</button></div>' : '') + '</div>';
    if (others.length) h += sec('قرّاء لديك تنزيلات لهم') + '<div class="list mx">' + others.map(x => '<button class="li" data-sw="' + x.id + '"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(x.n) + '</div><div class="s">' + dlCountTxt(Downloads.count(x.id)) + '</div></div>' + icon('chev', 'faint') + '</button>').join('') + '</div>';
    if (m && Q.ready) {
      h += sec('السور') + '<div class="list mx" id="dl-list">' + Q.S.map(s => {
        const st = Downloads.state(m.id, s.id), av = libHas(m, s.id), x = Downloads.st[Downloads.key(m.id, s.id)];
        const end = !av ? '<span class="faint" style="font-size:12px">غير متوفرة</span>' : st === 'done' ? '<button class="act dl-x" data-rm="' + s.id + '" aria-label="حذف">' + icon('trash') + '</button><span class="ok">' + icon('check') + '</span>'
          : st === 'run' ? '<span class="dl-p num" data-pk="' + Downloads.key(m.id, s.id) + '">' + N(Math.round((x.p || 0) * 100)) + '٪</span><button class="act dl-x" data-cn="' + s.id + '" aria-label="إلغاء">' + icon('x') + '</button>' : '<button class="act" data-dl="' + s.id + '">' + icon('save') + '</button>';
        return '<div class="li dl-row' + (av ? '' : ' na') + '">' + surahBadge(s.id) + '<div class="grow"><div class="t">' + esc(s.name) + '</div><div class="s">' + surahMeta(s) + '</div></div>' + end + '</div>'; }).join('') + '</div>';
    }
    return h + '<div class="foot-note">التسجيلات من mp3quran.net · تُحفظ داخل مساحة التطبيق وتُحذف بحذفه</div>';
  },
  mount(el) {
    const dof = $('#dl-off', el); if (dof) dof.onclick = e => { const b = e.target.closest('[data-ol]'); if (b) offlineSheet(b.dataset.ol); };
    if (!Q.ready) loadQuran().then(() => { if (Router.cur.r === 'downloads') Router.refresh(); });
    const m = libOf(Settings.reciter);
    $('#dl-rec', el).onclick = () => reciterSheet(() => Router.refresh());
    const all = $('#dl-all', el); if (all) all.onclick = () => confirmSheet('تنزيل كل سور القارئ؟', 'قد يستهلك التنزيل كاملًا مساحة كبيرة (قرابة ١ إلى ٢ غيغابايت) وبيانات إنترنت كثيرة. يُفضَّل استعمال الواي فاي.', 'نعم، ابدأ التنزيل', () => {
      let n = 0; Q.S.forEach(s => { if (libHas(m, s.id) && !Downloads.state(m.id, s.id)) { Downloads.start(m, s.id); n++; } }); toast(n ? 'بدأ تنزيل ' + plural(n, 'سورة', 'سورتين', 'سور', 'سورة') : 'كل السور منزّلة'); Router.refresh(); });
    const del = $('#dl-del', el); if (del) del.onclick = () => confirmSheet('حذف تنزيلات هذا القارئ؟', 'ستُحذف السور المنزّلة من هاتفك، ويمكنك تنزيلها مجددًا متى شئت.', 'احذف', () => {
      Q.S.forEach(s => { const st = Downloads.state(m.id, s.id); if (st === 'done') Downloads.remove(m.id, s.id); else if (st === 'run') Downloads.cancel(m.id, s.id); }); Router.refresh(); }, { danger: true });
    el.addEventListener('click', e => {
      const sw = e.target.closest('[data-sw]'); if (sw) { Player.alt = null; setSetting('reciter', 'm:' + sw.dataset.sw); Router.refresh(); return; }
      const d = e.target.closest('[data-dl]'); if (d) { Downloads.start(m, +d.dataset.dl); Router.refresh(); return; }
      const r = e.target.closest('[data-rm]'); if (r) { Downloads.remove(m.id, +r.dataset.rm); Router.refresh(); return; }
      const c = e.target.closest('[data-cn]'); if (c) { Downloads.cancel(m.id, +c.dataset.cn); Router.refresh(); }
    });
    if (Downloads.running().length) Downloads.watch();
    this._h = () => { if (Router.cur && Router.cur.r === 'downloads' && !Sheet.el) Router.refresh(); };
    this._p = () => $$('[data-pk]', el).forEach(sp => { const x = Downloads.st[sp.dataset.pk]; if (x) sp.textContent = N(Math.round((x.p || 0) * 100)) + '٪'; });
    Bus.on('dl', this._h); Bus.on('dlp', this._p);
  },
  leave() { ['dl', 'dlp'].forEach(n => { const h = Bus.h[n]; if (h) Bus.h[n] = h.filter(f => f !== this._h && f !== this._p); }); },
};

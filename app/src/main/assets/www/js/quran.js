/* ════════════════════════════════════════════════════════════════
   وسن 4.5 · القرآن الكريم: الفهرس · البحث · القارئ · العلامات · التظليل والتدبّر · الختمة
   ════════════════════════════════════════════════════════════════ */
'use strict';

const BANNER_SVG = '<svg viewBox="0 0 340 62" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M34 31 52 7h236l18 24-18 24H52z"/><path d="M42 31 56 12h228l14 19-14 19H56z" stroke-width=".8" opacity=".7"/><path d="M19.00 18.00L22.81 21.81L28.19 21.81L28.19 27.19L32.00 31.00L28.19 34.81L28.19 40.19L22.81 40.19L19.00 44.00L15.19 40.19L9.81 40.19L9.81 34.81L6.00 31.00L9.81 27.19L9.81 21.81L15.19 21.81Z" stroke-width="1.2"/><path d="M321.00 18.00L324.81 21.81L330.19 21.81L330.19 27.19L334.00 31.00L330.19 34.81L330.19 40.19L324.81 40.19L321.00 44.00L317.19 40.19L311.81 40.19L311.81 34.81L308.00 31.00L311.81 27.19L311.81 21.81L317.19 21.81Z" stroke-width="1.2"/><path d="M21.10 25.92L21.98 28.02L24.08 28.90L23.21 31.00L24.08 33.10L21.98 33.98L21.10 36.08L19.00 35.21L16.90 36.08L16.02 33.98L13.92 33.10L14.79 31.00L13.92 28.90L16.02 28.02L16.90 25.92L19.00 26.79Z" stroke-width=".9"/><path d="M323.10 25.92L323.98 28.02L326.08 28.90L325.21 31.00L326.08 33.10L323.98 33.98L323.10 36.08L321.00 35.21L318.90 36.08L318.02 33.98L315.92 33.10L316.79 31.00L315.92 28.90L318.02 28.02L318.90 25.92L321.00 26.79Z" stroke-width=".9"/></svg>';
const Q = { ready: false, loading: null, S: [], J: [], t: [], s: [], a: [], p: [], j: [], h: [], pStart: [], qStart: null, idx: null, idxN: null };

function loadJson(path, fn) {
  if (Native.has(fn)) {
    try { const raw = Native.call(fn); if (raw) return Promise.resolve(JSON.parse(raw)); } catch (e) { console.warn('bridge json', e); }
  }
  return fetch(path).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
}
function loadQuran() {
  if (Q.loading) return Q.loading;
  Q.loading = Promise.all([loadJson('../db/Surah.json', 'getSurahs'), loadJson('../db/Ayah.json', 'getAyahs')]).then(([sj, aj]) => {
    Q.S = sj.filter(x => x.type === 'Surah').map(x => ({ id: +x.id, name: x.name, en: x.nameTranslate, n: +x.ayahCount, mk: x.mecca === '1', page: +x.page, start: +x.jumpAyahId - 1 }))
      .sort((a, b) => a.id - b.id);
    Q.J = sj.filter(x => x.type === 'Juz').map(x => ({ id: +x.id, s: +x.surahId, a: +x.ayahIndex, start: +x.jumpAyahId - 1, page: +x.page })).sort((a, b) => a.id - b.id);
    aj.sort((a, b) => a.id - b.id);
    const L = aj.length; Q.qStart = new Set();
    for (let i = 0; i < L; i++) {
      const r = aj[i];
      Q.t[i] = r.text; Q.s[i] = +r.surahId; Q.a[i] = +r.ayahIndex; Q.p[i] = +r.page; Q.j[i] = +r.juzId; Q.h[i] = +r.hizbId;
      if (i === 0 || Q.p[i] !== Q.p[i - 1]) Q.pStart[Q.p[i]] = i;
      if (i > 0 && Q.h[i] !== Q.h[i - 1] && Q.a[i] !== 1) Q.qStart.add(i);
    }
    Q.pStart[605] = L; Q.ready = true; Bus.emit('quran');
  }).catch(e => { console.error('quran load', e); Q.loading = null; throw e; });
  return Q.loading;
}
/* عرض المصحف بخط مجمّع الملك فهد (KFGQPC Hafs): النص المخزّن بترميز Tanzil، والخط يتبع ترميز المجمّع؛
   السكون ← رأس الخاء (U+06E1)، والصفر المستدير ← U+0652 (يرسمه الخط دائرة صغيرة)، وتُحذف السين الصغيرة السفلية
   (موضع واحد 52:37) لأن الخط لا يرسمها. النسخ والمشاركة تبقى بالنص القياسي الأصلي. */
const qdH = t => String(t).replace(/\u0652/g, '\u06E1').replace(/\u06DF/g, '\u0652').replace(/\u06E3/g, '');
/* وسن 4.5 · خط «أميري قرآن» يقرأ ترميز Tanzil مباشرة */
const qd = t => Settings.qfont === 'amiri' ? String(t).replace(/\u0652/g, '\u06E1') : qdH(t);
/** رقم الآية: خط المدينة يرسم الزخرفة حول الأرقام تلقائيًا، وأميري يحتاج علامة نهاية الآية U+06DD قبلها */
const ayNum = n => Settings.qfont === 'amiri' ? '\u06DD' + arDigits(n) : arDigits(n);
const surahOf = i => Q.S[Q.s[i] - 1];
const gIndex = (s, a) => Q.S[s - 1].start + (a - 1);
const surahMeta = s => (s.mk ? 'مكية' : 'مدنية') + ' · ' + plural(s.n, 'آية', 'آيتان', 'آيات', 'آية');
const hizbLbl = i => { const q = Q.h[i]; const hz = Math.ceil(q / 4), r = (q - 1) % 4; return 'الحزب ' + N(hz) + (r ? ' · ' + ['', 'ربع', 'نصف', 'ثلاثة أرباع'][r] : ''); };
const ayahRef = i => 'سورة ' + surahOf(i).name + ' · الآية ' + N(Q.a[i]);
const BASMALA_U = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
function quranText(s, a, b) { const out = []; for (let k = a; k <= b; k++) { const i = gIndex(s, k); out.push(Q.t[i] + ' ' + arDigits(k)); } return out; }

/* ───────── وسن 4.5 · مواضع السجود · التظليل الملوّن · ملاحظات التدبّر ───────── */
const SAJDA = new Set([1159, 1721, 1950, 2137, 2307, 2612, 2671, 2914, 3184, 3517, 3993, 4255, 4845, 5904, 6124]);
const HL_COLORS = [['y', 'أصفر', '#F2C94C'], ['g', 'أخضر', '#5FC48D'], ['b', 'أزرق', '#64A6E8'], ['p', 'وردي', '#F08DB5'], ['v', 'بنفسجي', '#AE93E6']];
const Marks = {
  hl: Store.get('qhl', {}), nt: Store.get('qnt', {}),
  setHl(i, c) { if (c) this.hl[i] = c; else delete this.hl[i]; Store.set('qhl', this.hl); },
  setNote(i, t) { t = String(t || '').trim(); if (t) this.nt[i] = { t, ts: Date.now() }; else delete this.nt[i]; Store.set('qnt', this.nt); },
  hlList() { return Object.keys(this.hl).map(Number).filter(i => i >= 0 && i < 6236).sort((a, b) => a - b); },
  ntList() { return Object.keys(this.nt).map(Number).filter(i => i >= 0 && i < 6236).sort((a, b) => this.nt[b].ts - this.nt[a].ts); },
};
/** إعادة رسم آية واحدة في القارئ بعد تغيير تظليلها أو ملاحظتها (دون تحريك الصفحة) */
function refreshAyah(i) {
  const sp = $('.ay[data-i="' + i + '"]'); if (!sp) return;
  HL_COLORS.forEach(([c]) => sp.classList.remove('hc-' + c)); if (Marks.hl[i]) sp.classList.add('hc-' + Marks.hl[i]);
  let n = sp.nextElementSibling; while (n && !n.classList.contains('an')) n = n.nextElementSibling;
  const has = n && n.nextElementSibling && n.nextElementSibling.classList.contains('ntm');
  if (Marks.nt[i] && !has && n) n.insertAdjacentHTML('afterend', '<span class="ntm" data-nt="' + i + '" role="button" aria-label="ملاحظة تدبّر"></span>');
  if (!Marks.nt[i] && has) n.nextElementSibling.remove();
}

/* ───────── العلامات · آخر قراءة · الختمة ───────── */
const Bookmarks = {
  list: Store.get('bm', []),
  has(i) { return this.list.some(b => b.i === i); },
  toggle(i) { if (this.has(i)) this.list = this.list.filter(b => b.i !== i); else this.list.unshift({ i, ts: Date.now() }); Store.set('bm', this.list); return this.has(i); },
};
const LastRead = {
  get() { return Store.get('lastRead', null); },
  set(i, mode) { const v = { i, mode: mode || 'surah', ts: Date.now() }; Store.set('lastRead', v); Khatma.touch(Q.p[i]); },
};
const Khatma = {
  get() { return Store.get('khatma', null); },
  start(days) { Store.set('khatma', { start: dayKey(new Date()), days, done: {} }); },
  stop() { Store.del('khatma'); },
  per(k) { return Math.ceil(604 / k.days); },
  dayIndex(k, now) { const [y, m, d] = k.start.split('-').map(Number); return daysBetween(new Date(y, m - 1, d), now) + 1; },
  range(k, day) { const n = this.per(k); const a = (day - 1) * n + 1; return [Math.min(a, 604), Math.min(day * n, 604)]; },
  doneCount(k) { return Object.keys(k.done || {}).length; },
  toggle(day) { const k = this.get(); if (!k) return; k.done = k.done || {}; if (k.done[day]) delete k.done[day]; else k.done[day] = 1; Store.set('khatma', k); },
  touch(page) {
    const k = this.get(); if (!k) return; const d = this.dayIndex(k, new Date()); if (d < 1 || d > k.days) return;
    const [, b] = this.range(k, d); if (page >= b && !k.done[d]) { k.done[d] = 1; Store.set('khatma', k); toast('أتممتَ وِرد اليوم — تقبّل الله'); }
  },
};

/* ═══════════════ فهرس القرآن ═══════════════ */
const QS = { tab: 'surah', q: '' };
SCREENS.quran = {
  tab: 'quran',
  render() {
    const lr = LastRead.get();
    const extra = '<div class="big"><div class="search">' + icon('search') + '<input id="q-q" placeholder="ابحث باسم السورة أو نص الآية أو رقمها (2:255)" value="' + esc(QS.q) + '" autocomplete="off"></div></div>';
    return hdr('القرآن الكريم', N(114) + ' سورة · ' + N(6236) + ' آية · ' + N(30) + ' جزءًا', { actions: [{ id: 'q-kh', icon: 'target', label: 'الختمة' }], extra }) +
      '<div id="q-cont">' + (lr && Q.ready ? contCard(lr) : '') + '</div>' +
      '<div class="qtabs"><div class="seg" id="q-seg"><button data-t="surah">السور</button><button data-t="juz">الأجزاء</button><button data-t="saved">المحفوظات</button></div></div>' +
      '<div id="q-body"><div class="mx">' + '<div class="skel"></div>'.repeat(7) + '</div></div>';
  },
  mount(el) {
    const seg = $('#q-seg', el);
    const setSeg = () => $$('button', seg).forEach(b => b.classList.toggle('on', b.dataset.t === QS.tab));
    setSeg();
    seg.onclick = e => { const b = e.target.closest('button'); if (!b) return; QS.tab = b.dataset.t; setSeg(); drawQBody(); };
    $('#q-kh', el).onclick = () => Router.go('khatma');
    const inp = $('#q-q', el);
    inp.addEventListener('input', debounce(() => { QS.q = inp.value.trim(); drawQBody(); }, 260));
    const go = () => { const lr = LastRead.get(); $('#q-cont', el).innerHTML = lr ? contCard(lr) : ''; drawQBody(); };
    if (Q.ready) go(); else loadQuran().then(go).catch(() => { $('#q-body', el).innerHTML = '<div class="empty">تعذّر تحميل بيانات المصحف</div>'; });
  },
};
function contCard(lr) {
  if (!Q.ready || lr.i == null || !Q.t[lr.i]) return '';
  const s = surahOf(lr.i);
  return '<button class="cont" style="width:calc(100% - 32px);text-align:right" data-go="reader" data-a=\'' + JSON.stringify({ s: s.id, i: lr.i, mode: lr.mode }) + '\'>' +
    '<div class="ico">' + icon('bookmarkf') + '</div><div class="grow"><div class="faint" style="font-size:12px">تابع القراءة</div>' +
    '<div style="font-weight:700;font-size:15.5px">سورة ' + esc(s.name) + ' · الآية ' + N(Q.a[lr.i]) + '</div>' +
    '<div class="faint" style="font-size:12px">الجزء ' + N(Q.j[lr.i]) + ' · الصفحة ' + N(Q.p[lr.i]) + '</div></div>' + icon('chev', 'gold') + '</button>';
}
function surahRow(s) {
  return '<button class="srow" data-go="reader" data-a=\'{"s":' + s.id + '}\'>' + surahBadge(s.id) +
    '<div class="grow"><div class="sname">' + esc(s.name) + '</div><div class="smeta">' + surahMeta(s) + ' · ص ' + N(s.page) + '</div></div>' +
    icon('chev', 'schev') + '</button>';
}
function drawQBody() {
  const box = $('#q-body'); if (!box || !Q.ready) return;
  if (QS.q) { box.innerHTML = searchResults(QS.q); return; }
  if (QS.tab === 'surah') { box.innerHTML = '<div class="list mx">' + Q.S.map(surahRow).join('') + '</div>'; return; }
  if (QS.tab === 'juz') {
    box.innerHTML = '<div class="list mx">' + Q.J.map(j => {
      const s = Q.S[j.s - 1];
      return '<button class="li juz-row" data-go="reader" data-a=\'{"s":' + j.s + ',"i":' + j.start + '}\'><div class="jn">' + N(j.id) + '</div><div class="grow"><div class="t">الجزء ' + N(j.id) + '</div>' +
        '<div class="s">يبدأ من سورة ' + esc(s.name) + ' · الآية ' + N(j.a) + ' · ص ' + N(j.page) + '</div></div><div class="end">' + icon('chev') + '</div></button>';
    }).join('') + '</div>';
    return;
  }
  const bm = Bookmarks.list, nts = Marks.ntList(), hls = Marks.hlList();
  if (!bm.length && !nts.length && !hls.length) { box.innerHTML = '<div class="empty">' + icon('bookmark') + 'لا توجد آيات محفوظة بعد.<br>المس أي آية أثناء القراءة لحفظها أو تظليلها أو كتابة تدبّرك.</div>'; return; }
  const link = i => 'data-go="reader" data-a=\'{"s":' + Q.s[i] + ',"i":' + i + '}\'';
  const snip = i => esc(qd(Q.t[i]).split(' ').slice(0, 9).join(' ')) + '…';
  let h = '';
  if (bm.length) h += sec('العلامات · ' + N(bm.length)) + '<div class="list mx">' + bm.map(b =>
    '<button class="li" ' + link(b.i) + '><div class="ic">' + icon('bookmarkf') + '</div><div class="grow"><div class="t">' + ayahRef(b.i) + '</div>' +
    '<div class="s" style="font-family:var(--font-q);font-size:15px">' + snip(b.i) + '</div></div><div class="end">' + icon('chev') + '</div></button>').join('') + '</div>';
  if (nts.length) h += sec('تدبّراتي · ' + N(nts.length)) + '<div class="list mx">' + nts.map(i =>
    '<button class="li" ' + link(i) + '><div class="ic">' + icon('edit') + '</div><div class="grow"><div class="t">' + ayahRef(i) + '</div>' +
    '<div class="s nt-snip">' + esc(Marks.nt[i].t) + '</div></div><div class="end">' + icon('chev') + '</div></button>').join('') + '</div>';
  if (hls.length) h += sec('الآيات المظلّلة · ' + N(hls.length)) + '<div class="list mx">' + hls.map(i => { const c = HL_COLORS.find(z => z[0] === Marks.hl[i]) || HL_COLORS[0];
    return '<button class="li" ' + link(i) + '><div class="ic hl-ic" style="--c:' + c[2] + '">' + icon('marker') + '</div><div class="grow"><div class="t">' + ayahRef(i) + '</div>' +
      '<div class="s" style="font-family:var(--font-q);font-size:15px">' + snip(i) + '</div></div><div class="end">' + icon('chev') + '</div></button>'; }).join('') + '</div>';
  box.innerHTML = h;
}

/* ───────── البحث ───────── */
function ensureSearchIndex() {
  if (Q.idxN) return Promise.resolve();
  const build = () => { Q.idx = window.NOOR_SEARCH || []; Q.idxN = Q.idx.map(normAr); };
  if (window.NOOR_SEARCH) { build(); return Promise.resolve(); }
  if (Q._idxP) return Q._idxP;
  Q._idxP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'js/search-index.js'; s.onload = () => { build(); res(); }; s.onerror = rej; document.head.appendChild(s); });
  return Q._idxP;
}
function normMap(s) { const n = [], m = []; for (let k = 0; k < s.length; k++) { const c = s[k]; if (TASHKEEL.test(c)) { TASHKEEL.lastIndex = 0; continue; } TASHKEEL.lastIndex = 0; n.push(normAr(c) || c); m.push(k); } return { n: n.join(''), m }; }
function highlight(text, nq) {
  const mp = normMap(text); const at = mp.n.indexOf(nq); if (at < 0) return esc(text);
  const a = mp.m[at], b = mp.m[at + nq.length - 1] + 1;
  return esc(text.slice(0, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>' + esc(text.slice(b));
}
const latinDigits = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
function searchResults(q) {
  const ql = latinDigits(q).trim();
  let m = ql.match(/^(\d{1,3})\s*[:：\/\-\.\s]\s*(\d{1,3})$/);
  if (m) { const s = +m[1], a = +m[2];
    if (s >= 1 && s <= 114 && a >= 1 && a <= Q.S[s - 1].n) { const i = gIndex(s, a);
      return '<div class="list mx"><button class="li" data-go="reader" data-a=\'{"s":' + s + ',"i":' + i + '}\'><div class="ic">' + icon('book') + '</div><div class="grow"><div class="t">' + ayahRef(i) + '</div><div class="s res-ay">' + esc(qd(Q.t[i])) + '</div></div></button></div>'; }
  }
  m = ql.match(/^\d{1,3}$/);
  if (m && +ql >= 1 && +ql <= 114) return '<div class="list mx">' + surahRow(Q.S[+ql - 1]) + '</div>';
  const nq = normAr(q).replace(/^سوره\s+/, '');
  const sm = Q.S.filter(s => normAr(s.name).includes(nq) || s.en.toLowerCase().includes(q.toLowerCase()));
  let html = sm.length ? '<div class="list mx">' + sm.slice(0, 8).map(surahRow).join('') + '</div>' : '';
  if (nq.length < 3) return html || '<div class="empty">اكتب ثلاثة أحرف على الأقل للبحث في نص الآيات</div>';
  if (!Q.idxN) { ensureSearchIndex().then(drawQBody); return html + '<div class="mx mt">' + '<div class="skel"></div>'.repeat(3) + '</div>'; }
  const hits = []; for (let i = 0; i < Q.idxN.length; i++) if (Q.idxN[i].includes(nq)) hits.push(i);
  html += sec('نتائج الآيات · ' + N(hits.length) + (hits.length > 60 ? ' (أول ' + N(60) + ')' : ''));
  html += hits.length ? '<div class="list mx">' + hits.slice(0, 60).map(i =>
    '<button class="li" data-go="reader" data-a=\'{"s":' + Q.s[i] + ',"i":' + i + '}\'><div class="grow"><div class="s gold" style="font-weight:600">' + ayahRef(i) + '</div>' +
    '<div class="res-ay" style="font-family:var(--font);font-size:15px;line-height:1.9">' + highlight(Q.idx[i], nq) + '</div></div></button>').join('') + '</div>'
    : '<div class="empty">لا توجد آيات مطابقة</div>';
  return html;
}

/* ═══════════════ القارئ ═══════════════ */
const RS = { mode: 'surah', s: 1, p: 1 };
function bannerHTML(s) {
  return '<div class="sbanner">' + BANNER_SVG + '<div class="nm">سورة ' + esc(s.name) + '</div><div class="mt">' + (s.mk ? 'مكية' : 'مدنية') + ' · آياتها ' + arDigits(s.n) + '</div></div>';
}
function ayahSpan(i) {
  let t = esc(qd(Q.t[i])); const sp = t.indexOf(' ');
  t = sp > 0 ? '<span class="fw">' + t.slice(0, sp) + '</span>' + t.slice(sp) : '<span class="fw">' + t + '</span>';
  const sj = SAJDA.has(i); if (sj) t = t.replace('\u06E9', '<span class="sjm">\u06E9</span>');
  const c = Marks.hl[i];
  return (Q.qStart.has(i) ? '<span class="an">۞</span> ' : '') + '<span class="ay' + (c ? ' hc-' + c : '') + '" data-i="' + i + '">' + t + '</span> <span class="an">' + ayNum(Q.a[i]) + '</span>' +
    (Marks.nt[i] ? '<span class="ntm" data-nt="' + i + '" role="button" aria-label="ملاحظة تدبّر"></span>' : '') + (sj ? '<span class="sjd">سجدة</span>' : '') + ' ';
}
SCREENS.reader = {
  parent: 'quran', nav: false, keepOn: true,
  render() {
    const cls = 'reader' + (Settings.hifz ? ' hifz' : '') + (Settings.hifzMode === 'first' ? ' hz-first' : '') + (Settings.readFull ? ' full' : '');
    return '<div class="' + cls + '" id="reader" data-rt="' + Settings.readTheme + '" data-qa="' + (Settings.qalign || 'justify') + '" style="--qfs:' + Settings.qfs + 'px;--qlh:' + (+Settings.qlh || 2.3) + '">' +
      '<div class="rbar"><button class="ibtn" data-back aria-label="رجوع">' + icon('back') + '</button>' +
      '<div class="ttl"><div class="t1" id="r-t1">…</div><div class="t2 num" id="r-t2"></div></div>' +
      '<button class="ibtn' + (window.Ambient && Ambient.on ? ' on' : '') + '" id="r-amb" aria-label="أصوات الطبيعة">' + icon('leaf') + '</button>' +
      '<button class="ibtn" id="r-play" aria-label="استماع">' + icon('headphones') + '</button>' +
      '<button class="ibtn" id="r-set" aria-label="إعدادات القراءة">' + icon('text') + '</button></div>' +
      '<div class="rbody" id="rb"><div class="empty">جارٍ تحميل المصحف…</div></div><div id="r-nav"></div></div>';
  },
  mount(el, a) {
    this.el = el;
    const start = () => {
      RS.mode = a.mode || Settings.readMode;
      RS.s = a.s || (a.i != null ? Q.s[a.i] : 1);
      RS.p = a.p || (a.i != null ? Q.p[a.i] : Q.S[RS.s - 1].page);
      this.draw(a.i);
    };
    this.applyBg();
    if (Q.ready) start(); else loadQuran().then(start).catch(() => { $('#rb').innerHTML = '<div class="empty">تعذّر تحميل المصحف</div>'; });
    $('#r-set', el).onclick = () => readerSettings();
    $('#r-amb', el).onclick = () => ambientSheet();
    $('#r-play', el).onclick = () => { if (!Q.ready) return; if (Player.on) { playerSheet(); return; } Player.start(this.topAyah()); };
    this._amb = () => { const b = $('#r-amb'); if (b) b.classList.toggle('on', Ambient.on); };
    Bus.on('ambient', this._amb);
    clearTimeout(Ambient._lv);
    // طبقة تخفيف السطوع: تُلحق بجسم الصفحة كي تغطي الشاشة كلها
    const dim = this.dim = document.createElement('div'); dim.className = 'rdim'; dim.id = 'rdim'; dim.style.opacity = +Settings.readDim || 0;
    document.body.appendChild(dim);
    this.fullMode(!!Settings.readFull, true);
    $('#rb', el).addEventListener('click', e => {
      const nt = e.target.closest('[data-nt]'); if (nt) { noteSheet(+nt.dataset.nt); return; }
      if (AutoScroll.on) AutoScroll.nudge();
      const s = e.target.closest('.ay');
      if (!s) { if (Settings.readFull) this.showBar(!this.barOn); return; }
      // وضع الحفظ: اللمسة الأولى تُظهر الآية، والثانية تفتح خياراتها
      if (Settings.hifz && !s.classList.contains('rv')) { s.classList.add('rv'); vibrate(6); return; }
      $$('.ay.sel').forEach(x => x.classList.remove('sel')); s.classList.add('sel'); ayahSheet(+s.dataset.i, s); });
    // شريط وضع الحفظ: يُلحق بجسم الصفحة (لا داخل الشاشة المتحرّكة) ليبقى ثابتًا أسفل الشاشة
    const hb = this.hb = document.createElement('div'); hb.className = 'hzbar' + (Settings.hifz ? ' on' : ''); hb.id = 'hzbar';
    hb.innerHTML = '<span class="hz-l">' + icon('eyeoff') + 'وضع الحفظ</span><button data-hz="all">إظهار الكل</button><button data-hz="hide">إخفاء الكل</button>' +
      '<button data-hz="off" class="hz-x" aria-label="إنهاء وضع الحفظ">' + icon('x') + '</button>';
    document.body.appendChild(hb);
    hb.addEventListener('click', e => { const b = e.target.closest('[data-hz]'); if (!b) return; const v = b.dataset.hz;
      if (v === 'all') $$('.ay', el).forEach(x => x.classList.add('rv'));
      else if (v === 'hide') $$('.ay.rv', el).forEach(x => x.classList.remove('rv'));
      else setHifz(false); });
    this.onScroll = throttle(() => {
      this.track();
      if (Settings.readFull) { const y = window.scrollY, d = y - (this.lastY || 0); if (y < 60) this.showBar(true); else if (d > 14) this.showBar(false); else if (d < -24) this.showBar(true); this.lastY = y; }
    }, 200);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    let sx = 0, sy = 0;
    const rb = $('#rb', el);
    rb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    rb.addEventListener('touchend', e => {
      if (RS.mode !== 'page') return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 50) this.page(dx > 0 ? 1 : -1);
    }, { passive: true });
  },
  leave() {
    if (this.hb) { this.hb.remove(); this.hb = null; }
    if (this.dim) { this.dim.remove(); this.dim = null; }
    AutoScroll.stop(true);
    window.removeEventListener('scroll', this.onScroll); document.body.style.background = ''; ReadTrack.detach(); $$('.ay.playing').forEach(x => x.classList.remove('playing'));
    const h = Bus.h.ambient; if (h && this._amb) Bus.h.ambient = h.filter(f => f !== this._amb);
    if (Settings.readFull) Native.call('setImmersive', false);
    // أصوات الطبيعة ترافق المصحف فقط: تتلاشى عند مغادرته (لا عند إعادة الرسم)
    clearTimeout(Ambient._lv); Ambient._lv = setTimeout(() => { if (!Router.cur || Router.cur.r !== 'reader') Ambient.stop(); }, 500);
  },
  /** وضع القراءة الكاملة: إخفاء أشرطة النظام، وشريط القارئ يختفي عند التمرير للأسفل ويظهر عند الصعود أو اللمس */
  fullMode(on, init) {
    const r = $('#reader'); if (r) r.classList.toggle('full', on);
    if (on || !init) Native.call('setImmersive', on);
    this.lastY = window.scrollY; this.showBar(true);
    if (!init) toast(on ? 'وضع القراءة الكاملة · المس الصفحة لإظهار الشريط' : 'أُنهي وضع القراءة الكاملة');
  },
  showBar(on) { this.barOn = on; const r = $('#reader'); if (r) r.classList.toggle('bar-off', !on && !!Settings.readFull); },
  /** أول آية ظاهرة أعلى الشاشة (لبدء الاستماع من موضع القراءة) */
  topAyah() {
    if (RS.mode === 'page') { const a0 = Q.pStart[RS.p]; for (const sp of $$('.ay')) { const r = sp.getBoundingClientRect(); if (r.bottom > 90) return +sp.dataset.i; } return a0; }
    for (const sp of $$('.ay')) { const r = sp.getBoundingClientRect(); if (r.bottom > 100) return +sp.dataset.i; }
    return Q.S[RS.s - 1].start;
  },
  applyBg() { const r = $('#reader'); if (r) document.body.style.background = getComputedStyle(r).getPropertyValue('--rbg'); },
  /** إعادة رسم النص في موضعه (بعد تغيير الخط مثلًا) */
  redraw() { if (!Q.ready || !$('#rb')) return; this.draw(this.topAyah(), true); },
  draw(focusI, quiet) {
    const rb = $('#rb'); if (!rb) return;
    if (RS.mode === 'page') this.drawPage(rb); else this.drawSurah(rb);
    if (focusI != null) {
      const sp = $('.ay[data-i="' + focusI + '"]');
      if (sp) { setTimeout(() => { window.scrollTo({ top: sp.getBoundingClientRect().top + window.scrollY - 120 }); if (!quiet) sp.classList.add('hl'); }, 40); }
    } else window.scrollTo(0, 0);
    setTimeout(() => this.track(), 120);
    ReadTrack.attach(rb);
    if (Player.on) setTimeout(() => Player.highlight(), 60);
  },
  drawSurah(rb) {
    const s = Q.S[RS.s - 1];
    let h = bannerHTML(s) + (s.id !== 1 && s.id !== 9 ? '<div class="basm">' + qd(BASMALA_U) + '</div>' : '') + '<div class="rtext">';
    for (let i = s.start; i < s.start + s.n; i++) h += ayahSpan(i);
    rb.innerHTML = h + '</div><div class="pgfoot"><span class="ln"></span>صدق الله العظيم<span class="ln"></span></div>';
    $('#r-t1').textContent = 'سورة ' + s.name;
    const prev = s.id > 1 ? Q.S[s.id - 2] : null, next = s.id < 114 ? Q.S[s.id] : null;
    $('#r-nav').innerHTML = '<div class="rnav">' + (prev ? '<button class="btn ghost" id="r-prev">' + icon('back') + esc(prev.name) + '</button>' : '') +
      (next ? '<button class="btn ghost" id="r-next">' + esc(next.name) + icon('fwd') + '</button>' : '') + '</div>';
    if (prev) $('#r-prev').onclick = () => { RS.s = prev.id; this.draw(); };
    if (next) $('#r-next').onclick = () => { RS.s = next.id; this.draw(); };
  },
  drawPage(rb) {
    const p = RS.p, a0 = Q.pStart[p], a1 = Q.pStart[p + 1];
    const names = []; for (let i = a0; i < a1; i++) { const nm = surahOf(i).name; if (!names.includes(nm)) names.push(nm); }
    let h = '<div class="pagebox"><div class="pghead"><span>' + names.map(n => 'سورة ' + esc(n)).join(' · ') + '</span><span>الجزء ' + arDigits(Q.j[a0]) + '</span></div>';
    let open = false;
    for (let i = a0; i < a1; i++) {
      if (Q.a[i] === 1) { if (open) { h += '</div>'; open = false; } const s = surahOf(i); h += bannerHTML(s) + (s.id !== 1 && s.id !== 9 ? '<div class="basm">' + qd(BASMALA_U) + '</div>' : ''); }
      if (!open) { h += '<div class="rtext">'; open = true; }
      h += ayahSpan(i);
    }
    if (open) h += '</div>';
    rb.innerHTML = h + '<div class="pgfoot"><span class="ln"></span>' + arDigits(p) + '<span class="ln"></span></div></div>';
    $('#r-t1').textContent = names.length ? 'سورة ' + names[0] : '';
    $('#r-nav').innerHTML = '<div class="rnav"><button class="btn ghost" id="r-pp" ' + (p <= 1 ? 'disabled style="opacity:.4"' : '') + '>' + icon('back') + 'السابقة</button>' +
      '<button class="btn ghost" id="r-np" ' + (p >= 604 ? 'disabled style="opacity:.4"' : '') + '>التالية' + icon('fwd') + '</button></div>';
    $('#r-pp').onclick = () => this.page(-1); $('#r-np').onclick = () => this.page(1);
    LastRead.set(a0, 'page');
  },
  page(d) { const np = clamp(RS.p + d, 1, 604); if (np === RS.p) return; RS.p = np; this.draw(); vibrate(8); },
  track() {
    if (!Q.ready || !$('#rb')) return;
    let i;
    if (RS.mode === 'page') i = Q.pStart[RS.p];
    else {
      const x = window.innerWidth / 2; let el = null;
      for (const y of [120, 150, 190, 240]) { const hit = document.elementFromPoint(x, y); el = hit && hit.closest && hit.closest('.ay'); if (el) break; }
      if (!el) return; i = +el.dataset.i; LastRead.set(i, 'surah');
    }
    const t2 = $('#r-t2'); if (t2) t2.textContent = 'الجزء ' + N(Q.j[i]) + ' · ' + hizbLbl(i) + ' · الصفحة ' + N(Q.p[i]);
  },
};
function ayahSheet(i, span) {
  const bm = Bookmarks.has(i), hc = Marks.hl[i], nt = Marks.nt[i];
  const hlRow = '<div class="hl-row" id="hl-row"><span class="hl-l">' + icon('marker') + 'تظليل</span>' +
    HL_COLORS.map(([c, n, col]) => '<button class="hl-c' + (hc === c ? ' on' : '') + '" data-hc="' + c + '" style="--c:' + col + '" aria-label="' + n + '"></button>').join('') +
    '<button class="hl-c none' + (hc ? '' : ' on') + '" data-hc="" aria-label="بلا تظليل">' + icon('x') + '</button></div>';
  const html = '<div class="sh-t">' + ayahRef(i) + '</div><div class="sh-s">الجزء ' + N(Q.j[i]) + ' · ' + hizbLbl(i) + ' · الصفحة ' + N(Q.p[i]) +
    (SAJDA.has(i) ? ' · <b class="gold">موضع سجدة تلاوة ۩</b>' : '') + '</div>' +
    '<div style="font-family:var(--font-q);font-size:21px;line-height:2.1;text-align:center;padding:2px 22px 14px">' + esc(qd(Q.t[i])) + ' <span class="an gold">' + ayNum(Q.a[i]) + '</span></div>' +
    '<div class="acts" style="flex-wrap:wrap;padding:0 16px 6px">' +
    '<button class="act" data-x="copy">' + icon('copy') + 'نسخ</button><button class="act" data-x="share">' + icon('share') + 'مشاركة</button>' +
    '<button class="act" data-x="bm">' + icon(bm ? 'bookmarkf' : 'bookmark') + (bm ? 'إزالة العلامة' : 'حفظ علامة') + '</button>' +
    '<button class="act" data-x="last">' + icon('pin') + 'موضع التوقف</button>' +
    '<button class="act" data-x="play">' + icon('headphones') + 'استماع من هنا</button><button class="act" data-x="tafsir">' + icon('tafsir') + 'التفسير</button>' +
    '<button class="act" data-x="img">' + icon('image') + 'صورة</button>' +
    '<button class="act" data-x="note">' + icon('edit') + (nt ? 'ملاحظتي' : 'تدبّر') + '</button></div>' + hlRow +
    (nt ? '<button class="nt-pv mx" data-x="note"><b>' + icon('edit') + 'تدبّري</b><span>' + esc(nt.t) + '</span></button>' : '');
  const txt = () => '﴿' + Q.t[i] + '﴾ [' + surahOf(i).name + ': ' + Q.a[i] + ']';
  Sheet.open(html, el => el.addEventListener('click', e => {
    const hb = e.target.closest('[data-hc]');
    if (hb) { const c = hb.dataset.hc; Marks.setHl(i, c); refreshAyah(i); $$('.hl-c', el).forEach(z => z.classList.toggle('on', z === hb)); vibrate(6);
      toast(c ? 'ظُلّلت الآية باللون ' + HL_COLORS.find(z => z[0] === c)[1] : 'أُزيل التظليل'); return; }
    const b = e.target.closest('[data-x]'); if (!b) return; const x = b.dataset.x;
    if (x === 'copy') { copyText(txt()); Sheet.close(); }
    else if (x === 'share') { Sheet.close(() => shareText(txt() + '\n— عبر تطبيق وسن')); }
    else if (x === 'bm') { const on = Bookmarks.toggle(i); toast(on ? 'تم حفظ العلامة' : 'أُزيلت العلامة'); Sheet.close(); }
    else if (x === 'last') { LastRead.set(i, RS.mode); toast('تم حفظ موضع التوقف'); Sheet.close(); }
    else if (x === 'play') { Sheet.close(() => Player.start(i, { noBasm: Q.a[i] !== 1 })); }
    else if (x === 'tafsir') { Sheet.close(() => tafsirSheet(i)); }
    else if (x === 'note') { Sheet.close(() => noteSheet(i)); }
    else if (x === 'img') { Sheet.close(() => ShareCard.share({ kind: 'ayah', title: 'سورة ' + surahOf(i).name, text: Q.t[i], ref: '[' + surahOf(i).name + ': ' + arDigits(Q.a[i]) + ']' }, txt())); }
  }));
  const clear = () => { if (span) span.classList.remove('sel'); };
  const prevAfter = Sheet.after; void prevAfter;
  const bg = Sheet.bg; if (bg) bg.addEventListener('click', clear);
  setTimeout(() => { const obs = setInterval(() => { if (!Sheet.el) { clear(); clearInterval(obs); } }, 300); }, 300);
}
/** وسن 4.2 · وضع الحفظ: إخفاء نص الآيات حتى تُلمس */
function setHifz(on) {
  setSetting('hifz', !!on);
  const r = $('#reader'); if (r) { r.classList.toggle('hifz', !!on); if (!on) $$('.ay.rv', r).forEach(x => x.classList.remove('rv')); }
  const hb = $('#hzbar'); if (hb) hb.classList.toggle('on', !!on);
  toast(on ? 'وضع الحفظ: المس الآية لإظهارها' : 'أُنهي وضع الحفظ');
}
/* ───────── وسن 4.5 · إعدادات القراءة الموسّعة ───────── */
const READ_BGS = [['night', 'ليلي', '#08120F', '#EEF1EB'], ['black', 'حالك', '#000000', '#E8ECE9'], ['blue', 'كحلي', '#0D1628', '#E3E9F5'],
  ['paper', 'ورقي', '#F8F1E1', '#2B2215'], ['sand', 'رملي', '#EAD8B3', '#2E2210'], ['white', 'أبيض', '#FFFFFF', '#141414'],
  ['green', 'عشبي', '#E7F0E4', '#1D2A1D'], ['pink', 'وردي', '#FCEEF3', '#3B1F2B'], ['lavender', 'لافندر', '#F1ECFA', '#261F3D'], ['plum', 'ورد الليل', '#1A0F18', '#F3E6EC'], ['cream', 'كريمي', '#FFF8EE', '#3A2A1E'], ['sky', 'سماوي', '#EEF5FF', '#14264D']];
const READ_BG_NAMES = Object.fromEntries(READ_BGS.map(b => [b[0], b[1]]));
const READ_DEF = { qfs: 27, qfont: 'hafs', qlh: 2.3, qalign: 'justify', readTheme: 'night', readDim: 0, readFull: false, hifzMode: 'all', asSpeed: 4 };
const rsSeg = (title, key, opts) => '<b class="rs-h">' + title + '</b><div class="seg" data-k="' + key + '">' +
  opts.map(([v, t]) => '<button data-v="' + v + '" class="' + (String(Settings[key]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
const rsSwitch = (id, t, s, on) => '<div class="row hz-row"><div class="grow"><b>' + t + '</b><div class="faint" style="font-size:12.5px;margin-top:2px;line-height:1.6">' + s + '</div></div>' +
  '<button class="switch' + (on ? ' on' : '') + '" id="' + id + '" aria-label="' + t + '"></button></div>';
function readerSummary() {
  return (READ_BG_NAMES[Settings.readTheme] || 'ليلي') + ' · ' + (Settings.qfont === 'amiri' ? 'خط أميري' : 'خط مصحف المدينة') + ' · حجم ' + N(Settings.qfs);
}
function readerSettings() {
  const inReader = !!$('#reader');
  const bgs = READ_BGS.map(([v, n, bg, tx]) => '<button class="rtb' + (Settings.readTheme === v ? ' on' : '') + '" data-bg="' + v + '"><span style="background:' + bg + ';color:' + tx + '">ب</span><small>' + n + '</small></button>').join('');
  const html = '<div class="sh-t">إعدادات القراءة</div><div class="sh-s">تُحفظ تلقائيًا وتظهر فورًا</div><div class="mx rs">' +
    '<div class="reader rs-pv" id="rs-pv" data-rt="' + Settings.readTheme + '" data-qa="' + (Settings.qalign || 'justify') + '" style="--qfs:' + Settings.qfs + 'px;--qlh:' + (+Settings.qlh || 2.3) + '">' +
      '<div class="rtext">' + esc(qd(Q.ready ? Q.t[1] : BASMALA_U)) + ' <span class="an">' + ayNum(2) + '</span></div></div>' +
    '<div class="row" style="justify-content:space-between;margin-top:12px"><b>حجم الخط</b><span class="gold num" id="rs-v">' + N(Settings.qfs) + '</span></div>' +
    '<input type="range" min="20" max="42" step="1" value="' + Settings.qfs + '" id="rs-fs">' +
    rsSeg('نوع الخط', 'qfont', [['hafs', 'مصحف المدينة'], ['amiri', 'أميري']]) +
    rsSeg('تباعد الأسطر', 'qlh', [['2', 'متقارب'], ['2.3', 'عادي'], ['2.7', 'واسع']]) +
    rsSeg('محاذاة النص', 'qalign', [['justify', 'مضبوط'], ['center', 'في الوسط'], ['right', 'إلى اليمين']]) +
    '<b class="rs-h">خلفية القراءة</b><div class="rtb-grid" id="rs-bg">' + bgs + '</div>' +
    '<div class="row" style="justify-content:space-between;margin-top:16px"><b>تخفيف السطوع</b><span class="gold num" id="rs-dv">' + N(Math.round((+Settings.readDim || 0) * 100)) + '٪</span></div>' +
    '<input type="range" min="0" max="60" step="1" value="' + Math.round((+Settings.readDim || 0) * 100) + '" id="rs-dim">' +
    rsSeg('طريقة العرض', 'readMode', [['surah', 'سورة كاملة'], ['page', 'صفحات المصحف']]) +
    rsSwitch('rs-full', 'القراءة الكاملة', 'تختفي الأشرطة لتتفرّغ للقراءة، والمس الصفحة لإظهارها', !!Settings.readFull) +
    (inReader ? '<button class="btn ghost block" id="rs-as" style="margin-top:14px">' + icon('scroll') + (AutoScroll.on ? 'إيقاف التمرير التلقائي' : 'التمرير التلقائي للصفحة') + '</button>' : '') +
    rsSwitch('rs-hz', 'وضع الحفظ', 'تُخفى الآيات لتختبر حفظك، والمس الآية لإظهارها', !!Settings.hifz) +
    '<div id="rs-hzm"' + (Settings.hifz ? '' : ' hidden') + '>' + rsSeg('ما يُخفى', 'hifzMode', [['all', 'الآية كاملة'], ['first', 'ما بعد أول كلمة']]) + '</div>' +
    (inReader ? '<button class="li rs-amb" id="rs-amb"><div class="ic">' + icon('leaf') + '</div><div class="grow"><div class="t">أصوات الطبيعة</div><div class="s">' + (Ambient.on ? 'يعمل الآن: ' + Ambient.name() : 'أمواج، مطر، عصافير، نسيم…') + '</div></div><div class="end">' + icon('chev') + '</div></button>' : '') +
    '<button class="btn ghost block" id="rs-reset" style="margin-top:14px">' + icon('reset') + 'استعادة الإعدادات الافتراضية</button></div>';
  Sheet.open(html, el => {
    const R = () => $('#reader'), pv = $('#rs-pv', el);
    const range = (inp, min, max) => { const f = () => inp.style.setProperty('--p', ((inp.value - min) / (max - min) * 100) + '%'); f(); return f; };
    const fs = $('#rs-fs', el), fsf = range(fs, 20, 42);
    fs.addEventListener('input', () => { const v = +fs.value; fsf(); $('#rs-v', el).textContent = N(v); pv.style.setProperty('--qfs', v + 'px');
      const r = R(); if (r) r.style.setProperty('--qfs', v + 'px'); setSetting('qfs', v); });
    const dm = $('#rs-dim', el), dmf = range(dm, 0, 60);
    dm.addEventListener('input', () => { dmf(); const v = +dm.value / 100; $('#rs-dv', el).textContent = N(dm.value) + '٪'; const d = $('#rdim'); if (d) d.style.opacity = v; setSetting('readDim', v); });
    el.addEventListener('click', e => {
      const sb = e.target.closest('.seg[data-k] button');
      if (sb) {
        const k = sb.parentElement.dataset.k, raw = sb.dataset.v, v = k === 'qlh' ? +raw : raw;
        $$('button', sb.parentElement).forEach(b => b.classList.toggle('on', b === sb));
        if (k === 'readMode') {
          const cur = LastRead.get(); const i = cur ? cur.i : Q.S[RS.s - 1].start; setSetting('readMode', v);
          if (inReader) { RS.mode = v; RS.s = Q.s[i]; RS.p = Q.p[i]; Sheet.close(() => SCREENS.reader.draw(v === 'surah' ? i : null)); }
          return;
        }
        setSetting(k, v); const r = R();
        if (k === 'qfont') { document.documentElement.dataset.qf = v === 'amiri' ? 'amiri' : 'hafs'; $('.rtext', pv).innerHTML = esc(qd(Q.ready ? Q.t[1] : BASMALA_U)) + ' <span class="an">' + ayNum(2) + '</span>'; if (r) SCREENS.reader.redraw(); }
        else if (k === 'qlh') { pv.style.setProperty('--qlh', v); if (r) r.style.setProperty('--qlh', v); }
        else if (k === 'qalign') { pv.dataset.qa = v; if (r) r.dataset.qa = v; }
        else if (k === 'hifzMode') { if (r) r.classList.toggle('hz-first', v === 'first'); }
        return;
      }
      const bg = e.target.closest('[data-bg]');
      if (bg) { const v = bg.dataset.bg; setSetting('readTheme', v); $$('.rtb', el).forEach(b => b.classList.toggle('on', b === bg)); pv.dataset.rt = v;
        const r = R(); if (r) { r.dataset.rt = v; SCREENS.reader.applyBg(); } return; }
      const t = e.target.closest('button'); if (!t) return;
      if (t.id === 'rs-full') { const on = !Settings.readFull; setSetting('readFull', on); t.classList.toggle('on', on); if (inReader) SCREENS.reader.fullMode(on); }
      else if (t.id === 'rs-hz') { setHifz(!Settings.hifz); t.classList.toggle('on', Settings.hifz); $('#rs-hzm', el).hidden = !Settings.hifz; }
      else if (t.id === 'rs-as') Sheet.close(() => AutoScroll.on ? AutoScroll.stop() : AutoScroll.start());
      else if (t.id === 'rs-amb') Sheet.close(() => ambientSheet());
      else if (t.id === 'rs-reset') {
        Object.keys(READ_DEF).forEach(k => { Settings[k] = READ_DEF[k]; }); Store.set('settings', Settings); Bus.emit('settings', 'reader');
        document.documentElement.dataset.qf = 'hafs';
        Sheet.close(() => { if (inReader) { Native.call('setImmersive', false); Router.refresh(); } toast('استُعيدت إعدادات القراءة الافتراضية'); });
      }
    });
  }, () => { if (!inReader && Router.cur && Router.cur.r === 'settings') setTimeout(() => Router.refresh(), 30); });
}

/* ───────── وسن 4.5 · التمرير التلقائي (يتوقّف عند اللمس ويكمل بعدها، ويقلب الصفحة في وضع الصفحات) ───────── */
const AS_SPEEDS = [0, 7, 10, 14, 18, 23, 29, 36, 45, 56];   // بكسل في الثانية
const AutoScroll = {
  on: false, paused: false, raf: 0, last: 0, acc: 0, hold: 0, el: null, turning: false,
  v() { return clamp(+Settings.asSpeed || 4, 1, 9); },
  start() {
    if (this.on || !$('#reader')) return;
    this.on = true; this.paused = false; this.last = 0; this.acc = 0; this.hold = Date.now() + 600;
    this.ui();
    if (Settings.readFull) SCREENS.reader.showBar(false);
    this._touch = () => { this.hold = Date.now() + 1800; };
    window.addEventListener('touchstart', this._touch, { passive: true }); window.addEventListener('wheel', this._touch, { passive: true });
    this.loop(); toast('التمرير التلقائي · المس الشاشة ليتوقّف لحظة');
  },
  loop() {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(t => {
      if (!this.on) return;
      const dt = this.last ? Math.min(0.1, (t - this.last) / 1000) : 0; this.last = t;
      if (!this.paused && !Sheet.el && Date.now() > this.hold && !this.turning) {
        this.acc += dt * AS_SPEEDS[this.v()];
        const d = Math.floor(this.acc); if (d >= 1) { this.acc -= d; window.scrollBy(0, d); }
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) this.atEnd();
      }
      this.loop();
    });
  },
  atEnd() {
    if (RS.mode === 'page' && RS.p < 604) { this.turning = true; setTimeout(() => { this.turning = false; this.hold = Date.now() + 1500; if (this.on) SCREENS.reader.page(1); }, 2200); return; }
    this.stop(); toast(RS.mode === 'page' ? 'بلغتَ آخر صفحة في المصحف' : 'بلغتَ نهاية السورة');
  },
  nudge() { this.hold = Date.now() + 1500; },
  toggle() { this.paused = !this.paused; this.hold = 0; this.ui(); },
  speed(d) { setSetting('asSpeed', clamp(this.v() + d, 1, 9)); this.ui(); },
  stop() {
    if (!this.on) return; this.on = false; cancelAnimationFrame(this.raf); this.turning = false;
    window.removeEventListener('touchstart', this._touch); window.removeEventListener('wheel', this._touch);
    if (this.el) { this.el.remove(); this.el = null; }
  },
  ui() {
    if (!this.el) {
      const b = this.el = document.createElement('div'); b.className = 'asbar'; b.id = 'asbar'; document.body.appendChild(b);
      b.addEventListener('click', e => { const x = e.target.closest('[data-as]'); if (!x) return; const k = x.dataset.as; vibrate(5);
        if (k === 'x') this.stop(); else if (k === 'p') this.toggle(); else this.speed(k === '+' ? 1 : -1); });
    }
    this.el.innerHTML = '<button data-as="x" class="as-x" aria-label="إيقاف التمرير">' + icon('x') + '</button>' +
      '<button data-as="-" aria-label="أبطأ">' + icon('minus') + '</button><span class="as-v"><b class="num">' + N(this.v()) + '</b><small>السرعة</small></span>' +
      '<button data-as="+" aria-label="أسرع">' + icon('plus') + '</button>' +
      '<button data-as="p" class="as-p" aria-label="' + (this.paused ? 'متابعة' : 'إيقاف مؤقت') + '">' + icon(this.paused ? 'play' : 'pause') + '</button>';
  },
};

/* ───────── وسن 4.5 · ملاحظة التدبّر ───────── */
function noteSheet(i) {
  const cur = Marks.nt[i];
  const html = '<div class="sh-t">تدبّر الآية</div><div class="sh-s">' + ayahRef(i) + '</div>' +
    '<div class="tf-ay">' + esc(qd(Q.t[i])) + ' <span class="an gold">' + ayNum(Q.a[i]) + '</span></div>' +
    '<div class="mx"><textarea id="nt-t" class="note-ta" rows="5" maxlength="3000" placeholder="اكتب ما وقع في قلبك من معنى أو عبرة أو دعاء…">' + esc(cur ? cur.t : '') + '</textarea>' +
    '<div class="row" style="gap:10px;margin-top:12px"><button class="btn gold grow" id="nt-s">' + icon('check') + 'حفظ</button>' +
    (cur ? '<button class="btn ghost" id="nt-d">' + icon('trash') + 'حذف</button>' : '') + '</div>' +
    (cur ? '<div class="faint center" style="font-size:11.5px;margin-top:8px">آخر تعديل: ' + fmtG(new Date(cur.ts)) + '</div>' : '') + '</div>';
  Sheet.open(html, el => {
    const ta = $('#nt-t', el);
    $('#nt-s', el).onclick = () => { const had = !!Marks.nt[i]; Marks.setNote(i, ta.value); refreshAyah(i); Sheet.close(); toast(ta.value.trim() ? 'حُفظت ملاحظة التدبّر' : had ? 'حُذفت الملاحظة' : 'لم تُكتب ملاحظة'); };
    const d = $('#nt-d', el); if (d) d.onclick = () => { Marks.setNote(i, ''); refreshAyah(i); Sheet.close(); toast('حُذفت الملاحظة'); };
  });
}

/* ═══════════════ الختمة ═══════════════ */
SCREENS.khatma = {
  parent: 'quran',
  render() {
    const k = Khatma.get();
    if (!k) {
      return hdr('ختمة القرآن', 'خطة يومية لختم المصحف', { back: true, compact: true }) +
        '<div class="hc feature-hc mt" style="margin-top:16px"><div class="cr"><div class="ico">' + icon('target') + '</div><div class="grow">' +
        '<div style="font-weight:700;font-size:17px">اجعل لك وِردًا يوميًا</div><div class="muted" style="font-size:13px;line-height:1.7">اختر مدة الختمة، وسنقسّم لك المصحف (' + N(604) + ' صفحة) إلى أوراد يومية متساوية مع متابعة تقدّمك تلقائيًا أثناء القراءة.</div></div></div></div>' +
        sec('مدة الختمة') + '<div class="chips" id="kh-d" style="flex-wrap:wrap">' + [7, 10, 15, 20, 30, 40, 60].map(d => '<button class="chip ' + (d === 30 ? 'on' : '') + '" data-d="' + d + '">' + pD(d) + '</button>').join('') + '</div>' +
        '<div class="mx mt faint center" id="kh-per" style="font-size:13px"></div>' +
        '<div class="mx mt"><button class="btn gold block" id="kh-go">' + icon('flame') + 'ابدأ الختمة</button></div>';
    }
    const now = new Date(), day = clamp(Khatma.dayIndex(k, now), 1, k.days), [pa, pb] = Khatma.range(k, day);
    const done = Khatma.doneCount(k), frac = done / k.days;
    let grid = '';
    for (let d = 1; d <= k.days; d++) grid += '<button class="wd ' + (d === day ? 'today' : '') + '" data-day="' + d + '"><div class="ring">' + ringSVG(34, 4, k.done[d] ? 1 : 0, 'var(--ok)') + '<b>' + N(d) + '</b></div></button>';
    return hdr('ختمة القرآن', 'اليوم ' + N(day) + ' من ' + N(k.days), { back: true, compact: true }) +
      '<div class="card mx mt pad"><div class="row"><div class="ring">' + ringSVG(92, 8, frac, 'var(--gold)') + '<div class="ctr"><b style="font-size:20px" class="num">' + N(Math.round(frac * 100)) + '%</b></div></div>' +
      '<div class="grow"><div class="faint" style="font-size:12.5px">وِرد اليوم</div><div style="font-weight:700;font-size:18px">الصفحات ' + N(pa) + ' – ' + N(pb) + '</div>' +
      '<div class="muted" style="font-size:13px">' + (Q.ready ? 'من سورة ' + esc(surahOf(Q.pStart[pa]).name) + ' · الجزء ' + N(Q.j[Q.pStart[pa]]) : '') + '</div></div></div>' +
      '<div class="row mt" style="gap:10px"><button class="btn primary grow" data-go="reader" data-a=\'{"mode":"page","p":' + pa + '}\'>' + icon('book') + 'اقرأ الورد</button>' +
      '<button class="btn ghost" id="kh-t">' + icon('check') + (k.done[day] ? 'تم' : 'أتممته') + '</button></div></div>' +
      sec('أيام الختمة') + '<div class="card mx pad"><div class="week" style="grid-template-columns:repeat(7,1fr);row-gap:12px">' + grid + '</div></div>' +
      '<div class="mx mt"><button class="btn ghost block" id="kh-x">' + icon('trash') + 'إنهاء الخطة الحالية</button></div>';
  },
  mount(el) {
    const k = Khatma.get();
    if (!k) {
      let days = 30; const per = () => { $('#kh-per', el).textContent = 'بمعدّل ' + N(Math.ceil(604 / days)) + ' صفحة يوميًا تقريبًا (≈ ' + N((604 / days / 20).toFixed(1)) + ' جزء)'; }; per();
      $('#kh-d', el).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; days = +b.dataset.d; $$('.chip', el).forEach(c => c.classList.toggle('on', c === b)); per(); };
      $('#kh-go', el).onclick = () => { Khatma.start(days); toast('بارك الله لك — بدأت الختمة'); Router.refresh(); };
      return;
    }
    if (!Q.ready) loadQuran().then(() => Router.refresh());
    const day = clamp(Khatma.dayIndex(k, new Date()), 1, k.days);
    $('#kh-t', el).onclick = () => { Khatma.toggle(day); Router.refresh(); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (b) { Khatma.toggle(+b.dataset.day); Router.refresh(); } });
    $('#kh-x', el).onclick = () => { Khatma.stop(); toast('تم إنهاء الخطة'); Router.refresh(); };
  },
};

/* ════════════════════════════════════════════════════════════════
   وسن 4.2 · «أوسمتي» — أوسمة على شكل نجمة وسن تُكافئ المداومة على الخير
   ─ 16 وسامًا × 4 درجات: برونزي · فضي · ذهبي · زمرّدي (64 وسامًا)
   ─ تُحسب من سجلّاتك الحالية (النقاط، الصلوات، القراءة، الأذكار…) فلا بيانات جديدة
   ─ احتفال هادئ عند نيل وسام جديد، وبطاقة في «بستاني»
   ════════════════════════════════════════════════════════════════ */
'use strict';
const BADGE_TIERS = [
  // النجمة الخارجية (c) · القرص الداخلي (d) · الحافة (rim) · لون الرمز المنقوش (g)
  { n: 'برونزي', c: ['#F0C59C', '#955A2E'], d: ['#F8D6B4', '#B7743F'], rim: '#FCE3C9', g: '#5A3116' },
  { n: 'فضي', c: ['#FFFFFF', '#95A1AB'], d: ['#FFFFFF', '#B6C0C8'], rim: '#FFFFFF', g: '#44505A' },
  { n: 'ذهبي', c: ['#FBE7AC', '#B5872E'], d: ['#FFF3CD', '#D6A84A'], rim: '#FFF6D9', g: '#664409' },
  { n: 'زمرّدي', c: ['#F8E2A0', '#B08738'], d: ['#2EA17C', '#0A3E30'], rim: '#FFF3CB', g: '#F7DF98' },
];
const _tot = k => (Growth.d.tot && Growth.d.tot[k]) || 0;
/** أطول سلسلة أيام متتالية تحقّق الشرط (مفاتيح الأيام بصيغة YYYY-MM-DD) */
function bestRun(keys, ok) {
  const ds = keys.filter(ok).sort(); let best = 0, run = 0, prev = null;
  ds.forEach(k => { const t = Date.parse(k + 'T12:00:00'); run = prev != null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; prev = t; if (run > best) best = run; });
  return best;
}
const _P = (n, a, b, c, d) => n === 1 ? a : plural(n, a, b, c, d);
const BADGES = [
  { id: 'pr', cat: 'الصلاة', ic: 'mosque', name: 'المحافظ', t: [5, 50, 500, 2500], m: () => _tot('pr'),
    w: n => ['سجّل ' + _P(n, 'صلاة', 'صلاتين', 'صلوات', 'صلاة') + ' في وقتها', 'سجّلت ' + _P(n, 'صلاة', 'صلاتين', 'صلوات', 'صلاة') + ' في وقتها'] },
  { id: 'five', cat: 'الصلاة', ic: 'check', name: 'الخمس كاملة', t: [3, 7, 30, 100], m: () => bestRun(Object.keys(Tracker.data), k => (Tracker.data[k] & 31) === 31),
    w: n => ['الصلوات الخمس كاملة لمدة ' + pD(n) + ' دون انقطاع', 'حافظت على الصلوات الخمس لمدة ' + pD(n) + ' دون انقطاع'] },
  { id: 'qd', cat: 'الصلاة', ic: 'history', name: 'قضاء الفوائت', t: [5, 50, 500, 2500], m: () => (typeof Qada !== 'undefined' ? Qada.done() : 0),
    w: n => ['اقضِ ' + _P(n, 'صلاة فائتة', 'صلاتين', 'صلوات فائتة', 'صلاة فائتة'), 'قضيت ' + _P(n, 'صلاة فائتة', 'صلاتين', 'صلوات فائتة', 'صلاة فائتة')] },
  { id: 'q', cat: 'القرآن الكريم', ic: 'book', name: 'رفيق القرآن', t: [50, 600, 3000, 10000], m: () => _tot('q'),
    w: n => ['اقرأ ' + _P(n, 'آية', 'آيتين', 'آيات', 'آية'), 'قرأت ' + _P(n, 'آية', 'آيتين', 'آيات', 'آية')] },
  { id: 'kh', cat: 'القرآن الكريم', ic: 'star8', name: 'الختمات', t: [1, 3, 10, 30], m: () => Math.max(QRead.d.kh || 0, _tot('kh')),
    w: n => n === 1 ? ['اختم القرآن الكريم كاملًا', 'ختمت القرآن الكريم كاملًا'] : ['اختم القرآن ' + plural(n, 'مرة', 'مرتين', 'مرات', 'مرة'), 'ختمت القرآن ' + plural(n, 'مرة', 'مرتين', 'مرات', 'مرة')] },
  { id: 'ql', cat: 'القرآن الكريم', ic: 'headphones', name: 'حسن الاستماع', t: [50, 500, 3000, 10000], m: () => _tot('ql'),
    w: n => ['استمع إلى ' + _P(n, 'آية', 'آيتين', 'آيات', 'آية'), 'استمعت إلى ' + _P(n, 'آية', 'آيتين', 'آيات', 'آية')] },
  { id: 'azs', cat: 'الذكر', ic: 'sun', name: 'الذاكر', t: [1, 20, 100, 500], m: () => _tot('azs'),
    w: n => n === 1 ? ['أتمّ أول جلسة أذكار', 'أتممت أول جلسة أذكار'] : ['أتمّ ' + plural(n, 'جلسة', 'جلستين', 'جلسات', 'جلسة') + ' أذكار', 'أتممت ' + plural(n, 'جلسة', 'جلستين', 'جلسات', 'جلسة') + ' أذكار'] },
  { id: 'tas', cat: 'الذكر', ic: 'beads', name: 'المسبّح', t: [100, 1000, 10000, 100000], m: () => _tot('tas'),
    w: n => ['سبّح ' + _P(n, 'تسبيحة', 'تسبيحتين', 'تسبيحات', 'تسبيحة'), 'سبّحت ' + _P(n, 'تسبيحة', 'تسبيحتين', 'تسبيحات', 'تسبيحة')] },
  { id: 'ist', cat: 'الذكر', ic: 'heart', name: 'المستغفر', t: [100, 1000, 10000, 50000], m: () => _tot('ist'),
    w: n => ['استغفر الله ' + plural(n, 'مرة', 'مرتين', 'مرات', 'مرة'), 'استغفرت الله ' + plural(n, 'مرة', 'مرتين', 'مرات', 'مرة')] },
  { id: 'streak', cat: 'المداومة', ic: 'flame', name: 'المداومة', t: [3, 7, 30, 100], m: () => bestRun(Object.keys(Growth.d.days), k => (Growth.d.days[k].xp || 0) > 0),
    w: n => ['داوم على الخير لمدة ' + pD(n) + ' دون انقطاع', 'داومت على الخير لمدة ' + pD(n) + ' دون انقطاع'] },
  { id: 'days', cat: 'المداومة', ic: 'calendar', name: 'أيام الخير', t: [7, 30, 100, 365], m: () => Growth.activeDays(),
    w: n => ['اجمع ' + pD(n) + ' من أيام الخير', 'جمعت ' + pD(n) + ' من أيام الخير'] },
  { id: 'lvl', cat: 'المداومة', ic: 'sprout', name: 'البستاني', t: [10, 60, 200, 450], m: () => Growth.level(),
    w: n => { const st = Garden.STAGES[Garden.stageOf(n)].name; return ['ارتقِ ببستانك إلى المستوى ' + N(n) + ' · ' + st, 'بلغ بستانك المستوى ' + N(n) + ' · ' + st]; } },
  { id: 'rsw', cat: 'الصيام', ic: 'moonstar', name: 'صائم رمضان', t: [1, 10, 30, 90], m: () => (typeof Ramadan !== 'undefined' ? Ramadan.total() : 0),
    w: n => ['صُم ' + pD(n) + ' من رمضان وسجّلها', 'صمت ' + pD(n) + ' من رمضان'] },
  { id: 'qsw', cat: 'الصيام', ic: 'moon', name: 'قضاء الصيام', t: [1, 5, 15, 30], m: () => (typeof Qada !== 'undefined' ? Qada.done('sawm') : 0),
    w: n => ['اقضِ ' + pD(n) + ' من الصيام', 'قضيت ' + pD(n) + ' من الصيام'] },
  { id: 'hab', cat: 'العادات والمهام', ic: 'target', name: 'العادات الطيبة', t: [10, 100, 500, 2000], m: () => _tot('hab'),
    w: n => ['أنجز ' + _P(n, 'عادة', 'عادتين', 'عادات', 'عادة'), 'أنجزت ' + _P(n, 'عادة', 'عادتين', 'عادات', 'عادة')] },
  { id: 'todo', cat: 'العادات والمهام', ic: 'list', name: 'المُنجِز', t: [5, 50, 250, 1000], m: () => _tot('todo'),
    w: n => ['أنجز ' + _P(n, 'مهمة', 'مهمتين', 'مهام', 'مهمة'), 'أنجزت ' + _P(n, 'مهمة', 'مهمتين', 'مهام', 'مهمة')] },
];
const BADGE_TOTAL = BADGES.length * 4;
const MEDAL_STAR = starD(50, 50, 47, 0.83, Math.PI / 8);
let _mdId = 0;
/** وسام بشكل نجمة وسن: tier 1..4، أو مقفل (0) */
function medalSVG(tier, size, ic) {
  const z = size || 64;
  if (!tier) return '<div class="medal lock" style="--mz:' + z + 'px"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="' + MEDAL_STAR + '" class="m-o"/>' +
    '<circle cx="50" cy="50" r="29.5" class="m-i"/></svg><span class="mi">' + icon(ic) + '</span></div>';
  const T = BADGE_TIERS[tier - 1], id = 'md' + (++_mdId);
  return '<div class="medal t' + tier + '" style="--mz:' + z + 'px"><svg viewBox="0 0 100 100" aria-hidden="true"><defs>' +
    '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + T.c[0] + '"/><stop offset="1" stop-color="' + T.c[1] + '"/></linearGradient>' +
    '<radialGradient id="' + id + 'b" cx=".38" cy=".32" r=".85"><stop offset="0" stop-color="' + T.d[0] + '"/><stop offset="1" stop-color="' + T.d[1] + '"/></radialGradient></defs>' +
    '<path d="' + MEDAL_STAR + '" fill="url(#' + id + 'a)" stroke="' + T.rim + '" stroke-opacity=".75" stroke-width="1.3"/>' +
    '<circle cx="50" cy="50" r="30" fill="url(#' + id + 'b)" stroke="' + T.rim + '" stroke-opacity=".6" stroke-width="1.5"/>' +
    '<path d="M29.5 41A22 22 0 0 1 58.5 29.5" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.6" stroke-linecap="round"/></svg>' +
    '<span class="mi" style="color:' + T.g + '">' + icon(ic) + '</span></div>';
}
const pipsHTML = t => '<div class="pips">' + [1, 2, 3, 4].map(k => '<i class="' + (k <= t ? 'on' : '') + '"></i>').join('') + '</div>';

const Badges = {
  st: null,
  load() { if (!this.st) this.st = Object.assign({ seen: {}, at: {}, init: 0, fresh: 0 }, Store.get('badges', {})); return this.st; },
  save() { Store.set('badges', this.st); },
  val(b) { try { return Math.max(0, +b.m() || 0); } catch (e) { return 0; } },
  tierOf(b, v) { let t = 0; while (t < b.t.length && v >= b.t[t]) t++; return t; },
  /** الحالة الحالية لكل وسام: القيمة والدرجة (لا تنقص درجة نالها صاحبها) */
  all() {
    const st = this.load();
    return BADGES.map(b => { const v = this.val(b), t = Math.max(this.tierOf(b, v), st.seen[b.id] || 0); return { b, v, t, next: b.t[t] }; });
  },
  earned(list) { return (list || this.all()).reduce((a, x) => a + x.t, 0); },
  /** أقرب وسام إلى النيل (أعلى نسبة تقدّم نحو الدرجة التالية) */
  closest(list) {
    let best = null;
    (list || this.all()).forEach(x => { if (x.t >= 4) return; const lo = x.t ? x.b.t[x.t - 1] : 0, f = (x.v - lo) / Math.max(1, x.next - lo);
      if (!best || f > best.f) best = Object.assign({ f }, x); });
    return best;
  },
  /** أحدث الأوسمة المنالة (أعلى درجة لكل وسام) */
  recent(n) {
    const st = this.load(), by = {};
    Object.keys(st.at).forEach(k => { const m = k.match(/^(.*?)(\d)$/); if (!m) return; const id = m[1], t = +m[2];
      if (!by[id] || t > by[id].t) by[id] = { id, t, at: st.at[k] }; });
    return Object.values(by).sort((a, b) => (b.at - a.at) || (b.t - a.t)).slice(0, n).map(r => Object.assign(r, { b: BADGES.find(b => b.id === r.id) })).filter(r => r.b);
  },
  check(silent) {
    const st = this.load(), fresh = [], now = Date.now();
    BADGES.forEach(b => { const v = this.val(b), t = this.tierOf(b, v), was = st.seen[b.id] || 0;
      if (t > was) { for (let k = was + 1; k <= t; k++) st.at[b.id + k] = now; st.seen[b.id] = t; fresh.push({ b, v, t }); } });
    if (!st.init) { st.init = now; st.fresh = fresh.reduce((a, x) => a + x.t, 0); this.save(); Bus.emit('badges'); return; }
    if (!fresh.length) return;
    st.fresh = (st.fresh || 0) + fresh.length; this.save(); Bus.emit('badges');
    if (!silent) this.celebrate(fresh);
  },
  celebrate(list) {
    this._q = (this._q || []).concat(list);
    const busy = document.getElementById('splash') || document.querySelector('.onb') || document.querySelector('.lvlup') || Sheet.el;
    if (busy) { clearTimeout(this._t); this._t = setTimeout(() => this.celebrate([]), 1800); return; }
    const q = this._q; this._q = []; if (!q.length) return;
    const x = q.slice().sort((a, b) => b.t - a.t)[0], T = BADGE_TIERS[x.t - 1], more = q.length - 1;
    vibrate(35);
    const o = document.createElement('div'); o.className = 'lvlup bdgup';
    o.innerHTML = '<div class="lv-card"><div class="bd-art"><div class="bd-rays"></div>' + medalSVG(x.t, 124, x.b.ic) + '</div>' +
      '<div class="lv-k">وسام جديد</div><div class="lv-n">' + esc(x.b.name) + '</div><div class="bd-tier t' + x.t + '">الدرجة ' + ['الأولى', 'الثانية', 'الثالثة', 'الرابعة'][x.t - 1] + ' · ' + T.n + '</div>' +
      '<div class="lv-s">' + esc(x.b.w(x.b.t[x.t - 1])[1]) + (more ? '<br><span class="gold">و' + (more === 1 ? 'وسام آخر' : more === 2 ? 'وسامان آخران' : plural(more, '', '', 'أوسمة أخرى', 'وسامًا آخر')) + '</span>' : '') + '</div>' +
      '<button class="btn gold block" id="bd-ok">الحمد لله</button><button class="bd-all" id="bd-all">عرض أوسمتي</button></div>';
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add('show'));
    const close = go => { clearTimeout(tm); o.classList.remove('show'); setTimeout(() => o.remove(), 350); if (go) setTimeout(() => Router.go('badges'), 200); };
    o.addEventListener('click', e => { if (e.target.id === 'bd-all') close(true); else if (e.target.id === 'bd-ok' || e.target === o) close(false); });
    const tm = setTimeout(() => close(false), 7000);
  },
};

/** بطاقة «أوسمتي» في بستاني */
function badgesCard() {
  const list = Badges.all(), earned = Badges.earned(list), st = Badges.load(), rec = Badges.recent(4);
  const strip = rec.length ? rec.map(r => medalSVG(r.t, 40, r.b.ic)).join('') : BADGES.slice(0, 3).map(b => medalSVG(0, 40, b.ic)).join('');
  return '<button class="hc mt bdcard" data-go="badges"><div class="bd-strip">' + strip + '</div><div class="grow"><div class="t">أوسمتي' +
    (st.fresh ? '<span class="bd-new">' + (st.fresh === 1 ? 'جديد' : N(st.fresh) + ' جديدة') + '</span>' : '') + '</div>' +
    '<div class="s">' + (earned ? N(earned) + ' من ' + N(BADGE_TOTAL) + ' وسامًا' : 'أوسمة تُكافئ مداومتك على الخير') + '</div></div>' + icon('chev', 'faint') + '</button>';
}

/* ═══════════════ شاشة «أوسمتي» ═══════════════ */
SCREENS.badges = {
  parent: 'more',
  render() {
    const list = Badges.all(), earned = Badges.earned(list), cl = Badges.closest(list);
    const cats = [];
    list.forEach(x => { let c = cats.find(c => c.n === x.b.cat); if (!c) cats.push(c = { n: x.b.cat, xs: [] }); c.xs.push(x); });
    const tile = x => { const lo = x.t ? x.b.t[x.t - 1] : 0, f = x.t >= 4 ? 1 : clamp((x.v - lo) / Math.max(1, x.next - lo), 0, 1);
      return '<button class="bdg' + (x.t ? '' : ' off') + '" data-b="' + x.b.id + '">' + medalSVG(x.t, 58, x.b.ic) + pipsHTML(x.t) +
        '<div class="bn">' + esc(x.b.name) + '</div><div class="bt">' + (x.t ? BADGE_TIERS[x.t - 1].n : 'لم يُنَل بعد') + '</div>' +
        '<div class="bpr"><i style="width:' + (f * 100).toFixed(1) + '%"></i></div></button>'; };
    return hdr('أوسمتي', 'كل وسام علامة على خطوة في طريق الخير', { back: true, compact: true }) +
      '<div class="hc mt bd-hero"><div class="row" style="gap:16px;align-items:center"><div class="ring">' + ringSVG(92, 8, earned / BADGE_TOTAL, 'var(--gold)') +
      '<div class="ctr"><b class="num" style="font-size:22px">' + N(earned) + '</b><span class="faint" style="font-size:10.5px">من ' + N(BADGE_TOTAL) + '</span></div></div>' +
      '<div class="grow"><div style="font-weight:700;font-size:16px">' + (earned ? 'بارك الله في سعيك' : 'رحلتك تبدأ الآن') + '</div>' +
      '<div class="muted" style="font-size:12.5px;line-height:1.7">' + N(BADGES.length) + ' وسامًا، لكلٍّ أربع درجات: برونزي، فضي، ذهبي، زمرّدي</div>' +
      (cl ? '<div class="bd-next">الأقرب إليك: <b>' + esc(cl.b.name) + '</b> — ' + esc(cl.b.w(cl.next)[0]) + '</div>' : '<div class="bd-next">أتممت كل الأوسمة — ما شاء الله</div>') +
      '</div></div></div>' +
      cats.map(c => sec(c.n) + '<div class="bdgrid mx">' + c.xs.map(tile).join('') + '</div>').join('') +
      '<div class="foot-note">«إنما الأعمال بالنيات» — الأوسمة تحفيز على الخير، لا ميزان للأعمال</div>';
  },
  mount(el) {
    const st = Badges.load(); if (st.fresh) { st.fresh = 0; Badges.save(); }
    el.addEventListener('click', e => { const b = e.target.closest('.bdg'); if (b) badgeSheet(b.dataset.b); });
  },
};
function badgeSheet(id) {
  const x = Badges.all().find(y => y.b.id === id); if (!x) return;
  const st = Badges.load();
  const rows = x.b.t.map((th, k) => { const t = k + 1, got = x.t >= t, at = st.at[x.b.id + t];
    return '<div class="li bd-row"><div class="bd-mini">' + medalSVG(got ? t : 0, 42, x.b.ic) + '</div><div class="grow"><div class="t">' + BADGE_TIERS[k].n + '</div>' +
      '<div class="s">' + esc(x.b.w(th)[0]) + '</div></div><div class="end">' + (got ? '<span class="bd-ok">' + icon('check') + (at ? fmtG(new Date(at)) : '') + '</span>' :
      '<span class="num">' + fmtInt(Math.min(x.v, th)) + ' / ' + fmtInt(th) + '</span>') + '</div></div>'; }).join('');
  Sheet.open('<div class="center bd-sh">' + medalSVG(x.t, 96, x.b.ic) + '</div><div class="sh-t center">' + esc(x.b.name) + '</div>' +
    '<div class="sh-s center">' + esc(x.b.cat) + (x.t ? ' · ' + 'الدرجة الحالية: ' + BADGE_TIERS[x.t - 1].n : '') + '</div><div class="list mx">' + rows + '</div>');
}

/* المراقبة: كل تغيّر في النقاط أو القضاء يُراجع الأوسمة بهدوء */
const _bdCheck = debounce(() => { try { Badges.check(); } catch (e) { console.error(e); } }, 900);
Bus.on('growth', _bdCheck); Bus.on('qada', _bdCheck); Bus.on('ramadan', _bdCheck);
setTimeout(() => { try { Badges.check(true); } catch (e) { console.error(e); } }, 1200);
window.Badges = Badges;

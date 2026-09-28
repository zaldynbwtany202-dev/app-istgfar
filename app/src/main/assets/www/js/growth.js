/* ════════════════════════════════════════════════════════════════
   وسن 4.2 · النموّ: النقاط والمستويات (1000) · تتبّع التلاوة والختمات · الإحصاءات
   ════════════════════════════════════════════════════════════════ */
'use strict';
/* نقاط كل عمل — والسقف اليومي يمنع التضخيم (التسبيح والاستغفار) */
const XP = { pr: 10, az: 2, azs: 15, q: 0.4, ql: 0.2, kh: 300, ist: 0.1, tas: 0.1, hab: 8, todo: 5, qd: 8, qds: 20, rs: 30 };
const XP_CAP = { ist: 40, tas: 40, q: 400, ql: 150, qd: 80, qds: 60, rs: 30 };
const DAILY_GOAL = 100;
const XP_INFO = [['mosque', 'صلاة في وقتها (تسجيلها)', 10], ['sun', 'إتمام جلسة أذكار', 15], ['moonstar', 'كل ذكر مكتمل', 2], ['book', 'كل آية تقرؤها', 0.4],
  ['play', 'كل آية تستمع إليها', 0.2], ['star8', 'ختم القرآن كاملًا', 300], ['heart', 'كل عشر استغفارات', 1], ['beads', 'كل عشر تسبيحات', 1],
  ['check', 'إنجاز عادة', 8], ['list', 'إنجاز مهمة', 5], ['history', 'قضاء صلاة فائتة', 8], ['moon', 'قضاء يوم من الصيام', 20], ['moonstar', 'صيام يوم من رمضان', 30]];

const Growth = {
  d: Object.assign({ xp: 0, lvl: 1, days: {}, tot: {} }, Store.get('growth', {})),
  C(L) { return L <= 1 ? 0 : Math.floor(6 * Math.pow(L - 1, 1.55)); },
  levelOf(xp) { let lo = 1, hi = Garden.MAX; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.C(m) <= xp) lo = m; else hi = m - 1; } return lo; },
  level() { return this.levelOf(this.d.xp); },
  info() {
    const L = this.level(), a = this.C(L), b = L >= Garden.MAX ? a : this.C(L + 1);
    return { L, xp: this.d.xp, cur: this.d.xp - a, need: b - a, frac: L >= Garden.MAX ? 1 : (this.d.xp - a) / (b - a), stage: Garden.stageOf(L) };
  },
  day(d) { return this.d.days[dayKey(d || new Date())] || {}; },
  _day() { const k = dayKey(new Date()); return this.d.days[k] || (this.d.days[k] = {}); },
  add(kind, n) {
    n = n == null ? 1 : n; if (!n) return;
    const day = this._day();
    day[kind] = Math.max(0, (day[kind] || 0) + n);
    this.d.tot[kind] = Math.max(0, (this.d.tot[kind] || 0) + n);
    let xp = (XP[kind] || 0) * n;
    const cap = XP_CAP[kind];
    if (cap && xp > 0) { const used = day['x_' + kind] || 0; xp = Math.max(0, Math.min(xp, cap - used)); day['x_' + kind] = used + xp; }
    else if (cap && xp < 0) { const used = day['x_' + kind] || 0; xp = -Math.min(-xp, used); day['x_' + kind] = used + xp; }
    if (xp) this.gain(xp); else { this.save(); Bus.emit('growth'); }
  },
  /** إتمام جلسة أذكار (مرة واحدة لكل قسم في اليوم) */
  session(cat) {
    const day = this._day(); day.azs = day.azs || {};
    if (day.azs[cat]) return false;
    day.azs[cat] = 1; this.d.tot.azs = (this.d.tot.azs || 0) + 1; this.d.tot['azs_' + cat] = (this.d.tot['azs_' + cat] || 0) + 1;
    this.gain(XP.azs); return true;
  },
  gain(xp) {
    const prev = this.d.lvl || 1;
    this.d.xp = Math.max(0, Math.round((this.d.xp + xp) * 10) / 10);
    const day = this._day(); day.xp = Math.max(0, Math.round(((day.xp || 0) + xp) * 10) / 10);
    const L = this.level();
    this.d.lvl = L; this.save();
    if (L > prev) this.levelUp(L, Garden.stageOf(L) > Garden.stageOf(prev));
    if (xp > 0 && typeof FX !== 'undefined') try { FX.xp(xp); } catch (e) {}
    Bus.emit('growth');
  },
  save() { Store.set('growth', this.d); },
  /** غرس البذرة في جولة الترحيب: تبدأ الرحلة بنبتة صغيرة (المستوى 2) */
  plant() { if ((this.d.xp || 0) < this.C(2)) { this.d.xp = this.C(2); this.d.lvl = this.level(); this.save(); Bus.emit('growth'); } },
  streak() {
    let s = 0, d = new Date();
    if (!(this.day(d).xp > 0)) d = addDays(d, -1);
    while ((this.day(d).xp || 0) > 0 && s < 5000) { s++; d = addDays(d, -1); }
    return s;
  },
  activeDays() { return Object.values(this.d.days).filter(x => (x.xp || 0) > 0).length; },
  levelUp(L, newStage) {
    // لا نعرض الاحتفال فوق شاشة الافتتاح أو أثناء ورقة مفتوحة — نؤجّله لحظات
    if (document.getElementById('splash') || document.querySelector('.onb')) { clearTimeout(this._lvT); this._lvT = setTimeout(() => this.levelUp(Math.max(L, this.level()), newStage), 1800); return; }
    // احتفال وسام مفتوح؟ ننتظره ثم نحتفل بالمستوى — أما احتفال مستوى آخر فيكفي واحد
    if (document.querySelector('.lvlup.bdgup')) { clearTimeout(this._lvT); this._lvT = setTimeout(() => this.levelUp(Math.max(L, this.level()), newStage), 2200); return; }
    if (document.querySelector('.lvlup')) return;
    const st = Garden.STAGES[Garden.stageOf(L)];
    vibrate(30);
    const o = document.createElement('div'); o.className = 'lvlup';
    const conf = Array.from({ length: 26 }, (_, i) => '<i style="--x:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (Math.random() * .6).toFixed(2) + 's;--c:' +
      ['#F3D98F', '#7FD3A8', '#F7A6B5', '#9EC9FF', '#FFFFFF'][i % 5] + '"></i>').join('');
    o.innerHTML = '<div class="conf">' + conf + '</div><div class="lv-card"><div class="lv-art">' + Garden.render(L, { phase: gardenPhase(new Date()), id: 'lvu' }) + '</div>' +
      '<div class="lv-k">' + (newStage ? 'مرحلة جديدة · ' + esc(st.name) : 'ارتقى بستانك') + '</div><div class="lv-n">المستوى <b class="num">' + N(L) + '</b></div>' +
      '<div class="lv-s">' + esc(newStage ? st.sub : 'بارك الله في سعيك — استمرّ') + '</div><button class="btn gold block" id="lv-ok">الحمد لله</button></div>';
    document.body.appendChild(o);
    requestAnimationFrame(() => o.classList.add('show'));
    const close = () => { o.classList.remove('show'); setTimeout(() => o.remove(), 350); };
    o.addEventListener('click', e => { if (e.target.id === 'lv-ok' || e.target === o) close(); });
    setTimeout(close, 6000);
  },
};

/* ── تتبّع ختمة القرآن: كل آية تُقرأ فعلًا (ظاهرة على الشاشة لثوانٍ) تُسجَّل مرة في الختمة الحالية ── */
const QRead = {
  d: Object.assign({ b: '', n: 0, kh: 0, last: 0 }, Store.get('qread', {})),
  bits: null,
  load() {
    if (this.bits) return;
    this.bits = new Uint8Array(780);
    try { const raw = this.d.b ? atob(this.d.b) : ''; for (let i = 0; i < raw.length && i < 780; i++) this.bits[i] = raw.charCodeAt(i); } catch (e) { /* تجاهل */ }
  },
  has(i) { this.load(); return !!(this.bits[i >> 3] & (1 << (i & 7))); },
  mark(list) {
    this.load(); let added = 0;
    for (const i of list) { if (i < 0 || i >= 6236) continue; const m = 1 << (i & 7); if (!(this.bits[i >> 3] & m)) { this.bits[i >> 3] |= m; added++; } }
    if (!added) return 0;
    this.d.n += added; this.d.last = Date.now();
    Growth.add('q', added);
    if (this.d.n >= 6236) {
      this.d.kh++; this.d.n = 0; this.bits.fill(0); Growth.add('kh', 1);
      setTimeout(() => toast('مبارك! أتممت ختمة القرآن الكريم — اللهم تقبّل', 4200), 400);
    }
    this.persist(); return added;
  },
  persist: debounce(function () { let s = ''; for (let i = 0; i < 780; i++) s += String.fromCharCode(QRead.bits[i]); QRead.d.b = btoa(s); Store.set('qread', QRead.d); }, 700),
  progress() { return this.d.n / 6236; },
};

/* يراقب الآيات الظاهرة في القارئ: الآية تُحتسب بعد بقائها ظاهرة ثانيتين ونصف */
const ReadTrack = {
  obs: null, seen: new Map(), timer: null,
  attach(root) {
    this.detach();
    if (!window.IntersectionObserver || !root) return;
    this.obs = new IntersectionObserver(ents => ents.forEach(e => {
      const i = +e.target.dataset.i;
      if (e.isIntersecting && e.intersectionRatio >= 0.55) { if (!this.seen.has(i)) this.seen.set(i, Date.now()); }
      else this.seen.delete(i);
    }), { threshold: [0, 0.55, 1] });
    $$('.ay', root).forEach(el => this.obs.observe(el));
    this.timer = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now(), done = [];
      // وضع الحفظ: لا تُحتسب الآية إلا بعد إظهارها
      const hz = document.querySelector('.reader.hifz');
      this.seen.forEach((t, i) => { if (now - t >= 2500 && (!hz || hz.querySelector('.ay.rv[data-i="' + i + '"]'))) done.push(i); });
      if (done.length) { done.forEach(i => this.seen.set(i, Infinity)); QRead.mark(done); }
    }, 1000);
  },
  detach() { if (this.obs) this.obs.disconnect(); this.obs = null; this.seen.clear(); clearInterval(this.timer); this.timer = null; },
};

function gardenPhase(now) {
  if (typeof skyLock === 'function' && skyLock()) return 'day';   // وسن 6.1: «مشرقة دائمًا»
  try {
    const t = Times.forDay(Times.locDay(now));
    if (now < t.fajr || now >= t.isha) return 'night';
    if (now < new Date(t.sunrise.getTime() + 30 * 60000)) return 'dawn';
    if (now < t.asr) return 'day';
    if (now < new Date(t.maghrib.getTime() - 25 * 60000)) return 'golden';
    return 'sunset';
  } catch (e) { return 'day'; }
}

/* ── عناصر الواجهة المشتركة ── */
function gardenCard(opts) {
  opts = opts || {};
  const g = Growth.info(), st = Garden.STAGES[g.stage], today = Growth.day().xp || 0;
  const water = clamp(today / DAILY_GOAL, 0, 1);
  return '<div class="gcard ' + (opts.big ? 'big' : '') + '" ' + (opts.go ? 'data-go="garden"' : '') + '>' +
    '<div class="gart">' + Garden.render(g.L, { phase: gardenPhase(new Date()), id: opts.id || 'gc' }) + '</div>' +
    '<div class="gov"><div class="gchip"><span class="lv num">' + N(g.L) + '</span><span><b>' + esc(st.name) + '</b><small>المستوى ' + N(g.L) + ' من ' + N(Garden.MAX) + '</small></span></div>' +
    '<div class="gwater" title="سقاية اليوم">' + ringSVG(44, 5, water, '#7FD3E6', 'rgba(255,255,255,.22)') + '<span><b class="num">' + N(Math.round(water * 100)) + '٪</b></span></div></div>' +
    '<div class="gbar"><div class="gtrack"><i style="width:' + (g.frac * 100).toFixed(1) + '%"></i></div><div class="gnums"><span class="num">' + N(Math.floor(g.cur)) + ' / ' + N(g.need) + ' نقطة</span>' +
    '<span>' + (g.L >= Garden.MAX ? 'اكتمل بستانك' : 'إلى المستوى ' + N(g.L + 1)) + '</span></div></div></div>';
}

/* ═══════════════ شاشة «بستانك» ═══════════════ */

/* ═══ وسن 4.7 · «حديقة أيامك»: نبتة لكل يوم من الثلاثين الماضية، تنمو بقدر ما سقيتَه ═══ */
const STAGE_NEW = ['بذرة تحت التراب', 'أول ورقتين', 'ممشى من حجارة', 'أغصان وفراشات', 'فانوس معلّق', 'أزهار وسياج', 'رمّان وطيور', 'نخيل ومقعد', 'جدول وجسر وزنابق', 'لوتس وحمائم ونافورة'];
const dayLevel = xp => xp <= 0 ? 0 : xp < 30 ? 1 : xp < 70 ? 2 : xp < DAILY_GOAL ? 3 : 4;
const DG_NAMES = ['بذرة', 'نبتة', 'برعم', 'زهرة', 'ازدهار'];
function dayPlant(A, d, lv, th, glow, k) {
  let s = '<ellipse cx="20" cy="41" rx="12" ry="3.4" fill="#8A6A48" opacity=".35"/>';
  if (lv === 0) return s + '<ellipse cx="20" cy="39.5" rx="3.6" ry="2.6" fill="#8B5E34"/><ellipse cx="19" cy="38.6" rx="1.4" ry=".7" fill="#D9B07A" opacity=".8"/>';
  const h = [0, 9, 16, 22, 26][lv];
  s += '<path d="M20 41Q19 ' + (41 - h * .6) + ' 20 ' + (41 - h) + '" fill="none" stroke="#4E9A55" stroke-width="1.6" stroke-linecap="round"/>';
  if (lv >= 1) s += A.leaf(d, { x: 20, y: 41 - h * .45, l: 8 + lv, r: -58, pal: 'green' }) + A.leaf(d, { x: 20, y: 41 - h * .6, l: 7 + lv, r: 62, pal: 'deep' });
  if (lv === 2) s += '<ellipse cx="20" cy="' + (41 - h - 2.5) + '" rx="2.6" ry="3.8" fill="#F29CB8"/><path d="M17.6 ' + (41 - h) + 'Q20 ' + (41 - h + 1.8) + ' 22.4 ' + (41 - h) + 'L20 ' + (41 - h + 2.4) + 'Z" fill="#6FA85A"/>';
  if (lv >= 3) {
    const y = 41 - h - 3, big = lv === 4, sc = big ? 1.25 : 0.95;
    if (th === 'kbfly') s += A.hydrangea(d, { x: 20, y, r: 6.5 * sc, pal: ['blue', 'sky', 'peri'][k % 3] });
    else if (th === 'krose') s += A.rose3(d, { x: 20, y, r: 6.5 * sc, pal: ['red', 'pink'][k % 2] });
    else if (th === 'kstar') s += A.star(d, { x: 20, y, s: 5.6 * sc, glow: big });
    else if (th === 'kberry') s += A.berry(d, { x: 20, y: y + 2, s: 0.2 * sc, r: (k % 3 - 1) * 10 });
    else if (th === 'kbloom') s += A.tulip(d, { x: 20, y: y - 3, h: 1, s: 0.42 * sc, pal: ['pink', 'yellow', 'lilac'][k % 3] });
    else s += A.daisy(d, { x: 20, y, r: 6 * sc, pal: ['white', 'lemon', 'pink'][k % 3] });
  }
  if (glow) s += A.sparkle(d, { x: 31, y: 12, s: 3.4, c: '#FFE38A' }) + A.sparkle(d, { x: 9, y: 18, s: 2.4, c: '#FFE38A' });
  return s;
}
function daysGarden() {
  if (typeof Art === 'undefined' || !Art._ || !Art._.leaf) return '';
  const A = Art._, d = A.doc('dg'), th = artKey(), now = new Date();
  let cells = '';
  for (let i = 29; i >= 0; i--) {
    const day = addDays(now, -i), g = Growth.day(day), xp = g.xp || 0, lv = dayLevel(xp), pr = Tracker.count(day);
    cells += '<button class="dg-c' + (i === 0 ? ' today' : '') + ' l' + lv + '" data-dg="' + dayKey(day) + '" data-x="' + Math.round(xp) + '" data-p="' + pr + '" aria-label="' + esc(fmtG(day)) + '">' +
      '<svg viewBox="0 2 40 42" class="dg-svg">' + dayPlant(A, d, lv, th, pr === 5 && lv >= 3, i) + '</svg><span class="num">' + N(day.getDate()) + '</span></button>';
  }
  const legend = DG_NAMES.map((n, lv) => '<span><svg viewBox="0 2 40 42" class="dg-svg">' + dayPlant(A, d, lv, th, false, lv) + '</svg>' + n + '</span>').join('');
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + d.defs() + '</defs></svg>' +
    '<div class="hc dgw"><div class="dg-grid" id="dg">' + cells + '</div><div class="dgl">' + legend + '</div>' +
    '<div class="faint" style="font-size:12px;margin-top:8px;line-height:1.7">كل نبتة يومٌ من أيامك: تنمو بقدر ما جمعتَ من نقاط، وتلمع إن صلّيت الخمس في وقتها</div></div>';
}
SCREENS.garden = {
  parent: 'more',
  render() {
    const g = Growth.info(), today = Growth.day(), st = g.stage;
    const road = Garden.STAGES.map((s, i) => {
      const open = g.L >= s.from, lv = open ? Math.min(g.L, (Garden.STAGES[i + 1] || { from: 1001 }).from - 1) : s.from;
      return '<div class="gstage ' + (open ? 'open' : 'lock') + (i === st ? ' cur' : '') + '"><div class="gs-art">' + Garden.render(lv, { phase: 'day', id: 'st' + i, lite: true }) +
        (open ? '' : '<div class="gs-lock">' + icon('target') + '</div>') + '</div><div class="gs-t">' + esc(s.name) + '</div><div class="gs-s num">' +
        (open ? (i === st ? 'أنت هنا' : 'تمّت') : 'من المستوى ' + N(s.from)) + '</div><div class="gs-n">' + esc(STAGE_NEW[i] || '') + '</div></div>';
    }).join('');
    return hdr('بستانك', 'كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ', { back: true, compact: true }) +
      '<div class="mx mt">' + gardenCard({ big: true, id: 'gbig' }) + '</div>' +
      '<div class="hc mt"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="t" style="font-weight:700">سقاية اليوم</div>' +
      '<div class="muted" style="font-size:13px">اجمع ' + N(DAILY_GOAL) + ' نقطة يوميًا ليزهر بستانك</div></div><div class="gold num" style="font-size:22px;font-weight:700">' + N(Math.floor(today.xp || 0)) + '</div></div>' +
      '<div class="gtrack mt" style="height:9px"><i style="width:' + (clamp((today.xp || 0) / DAILY_GOAL, 0, 1) * 100).toFixed(1) + '%;background:linear-gradient(90deg,#5CC4DF,#8FE0C0)"></i></div>' +
      '<div class="row" style="gap:18px;margin-top:12px;font-size:13px" ><span>' + icon('flame', '', 'width:16px;height:16px;color:var(--warn)') + ' <b class="num">' + N(Growth.streak()) + '</b> ' + 'أيام متتالية</span>' +
      '<span>' + icon('calendar', '', 'width:16px;height:16px') + ' <b class="num">' + N(Growth.activeDays()) + '</b> يوم نشاط</span></div></div>' +
      sec('حديقة أيامك') + daysGarden() +
      sec('استعرض رحلتك') + '<div class="hc"><div class="gprev" id="g-prev">' + Garden.render(g.L, { phase: gardenPhase(new Date()), id: 'gpv' }) + '</div>' +
      '<div class="row" style="justify-content:space-between;margin-top:10px"><b id="g-pl">المستوى ' + N(g.L) + '</b><span class="muted" id="g-ps">' + esc(Garden.STAGES[st].name) + '</span></div>' +
      '<input type="range" id="g-rng" min="1" max="' + g.L + '" value="' + g.L + '" ' + (g.L < 2 ? 'disabled' : '') + '><div class="faint" style="font-size:12px;margin-top:4px">اسحب لترى كيف نما بستانك منذ البذرة</div></div>' +
      sec('مراحل النموّ') + '<div class="groad">' + road + '</div>' +
      sec('كيف ينمو بستانك؟') + '<div class="list mx">' + XP_INFO.map(([ic, t, v]) => '<div class="li"><div class="ic">' + icon(ic) + '</div><div class="grow"><div class="t">' + t + '</div></div><div class="end gold num" style="font-weight:700">+' + N(v) + '</div></div>').join('') + '</div>' +
      '<div class="foot-note">النقاط تحفيز على الخير لا ميزان للأعمال · «أحبّ الأعمال إلى الله أدومها وإن قلّ»</div>';
  },
  mount(el) {
    const dg = $('#dg', el);
    if (dg) dg.onclick = e => { const b = e.target.closest('[data-dg]'); if (!b) return; const dd = new Date(b.dataset.dg + 'T12:00:00'), x = +b.dataset.x, p = +b.dataset.p;
      vibrate(6); toast(weekday(dd) + ' ' + fmtG(dd) + ' · ' + (x ? N(x) + ' نقطة' : 'لم يُسقَ') + ' · ' + N(p) + '/' + N(5) + ' صلوات', 3200); };
    const rg = $('#g-rng', el); if (!rg) return;
    // وسن 4.7: أثناء السحب نرسم نسخة خفيفة، ثم التفاصيل كاملة حين يتوقف الإصبع
    const draw = lite => { const L = +rg.value; $('#g-prev', el).innerHTML = Garden.render(L, { phase: gardenPhase(new Date()), id: 'gpv', lite });
      $('#g-pl', el).textContent = 'المستوى ' + N(L); $('#g-ps', el).textContent = Garden.STAGES[Garden.stageOf(L)].name; };
    const upd = debounce(() => draw(true), 30), full = debounce(() => draw(false), 260);
    const paint = () => rg.style.setProperty('--p', ((rg.value - 1) / Math.max(1, rg.max - 1) * 100) + '%');
    paint(); rg.addEventListener('input', () => { paint(); upd(); full(); });
  },
};

/* ═══════════════ شاشة «إحصاءاتي» ═══════════════ */
function barsSVG(vals, labels, color) {
  const W = 320, H = 120, n = vals.length, max = Math.max(1, ...vals), bw = W / n * 0.56;
  let s = '<svg viewBox="0 0 ' + W + ' ' + (H + 22) + '" class="bars">';
  vals.forEach((v, i) => { const h = Math.max(2, v / max * H), x = i * W / n + (W / n - bw) / 2;
    s += '<rect x="' + x.toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="6" fill="' + (i === n - 1 ? 'var(--gold)' : color) + '"/>' +
      '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H + 16) + '" text-anchor="middle" class="bl">' + esc(labels[i]) + '</text>' +
      (v ? '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - h - 5).toFixed(1) + '" text-anchor="middle" class="bv">' + N(Math.round(v)) + '</text>' : ''); });
  return s + '</svg>';
}
function heatSVG(weeks) {
  const cell = 13, gap = 3, now = new Date(), start = addDays(now, -(weeks * 7 - 1) - now.getDay());
  let s = '<svg viewBox="0 0 ' + (weeks * (cell + gap)) + ' ' + (7 * (cell + gap)) + '" class="heat">';
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
    const day = addDays(start, w * 7 + d); if (day > now) continue;
    const v = Growth.day(day).xp || 0, lv = v <= 0 ? 0 : v < 30 ? 1 : v < 70 ? 2 : v < 120 ? 3 : 4;
    s += '<rect x="' + ((weeks - 1 - w) * (cell + gap)) + '" y="' + (d * (cell + gap)) + '" width="' + cell + '" height="' + cell + '" rx="3.5" class="h' + lv + '"/>';
  }
  return s + '</svg>';
}
SCREENS.stats = {
  parent: 'more',
  render() {
    const t = Growth.d.tot, kh = QRead.d.kh, prog = QRead.progress();
    const now = new Date(), days = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6));
    const DN = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const tile = (ic, hu, v, l, s) => '<div class="stile" style="' + hueVars(hu) + '"><div class="ic">' + icon(ic) + '</div><div class="v num">' + v + '</div><div class="l">' + l + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>';
    const cats = (NOOR_DATA.AZKAR || []).map(c => [c.title, t['azs_' + c.id] || 0]).filter(x => x[1] > 0);
    return hdr('إحصاءاتي', 'رحلتك مع الطاعات بالأرقام', { back: true, compact: true }) +
      '<div class="hc mt khc"><div class="row" style="gap:14px;align-items:center"><div class="kring">' + ringSVG(86, 8, prog, 'var(--gold)') + '<span class="num">' + N(Math.floor(prog * 100)) + '٪</span></div>' +
      '<div class="grow"><div class="muted" style="font-size:13px">الختمة الحالية</div><div style="font-size:19px;font-weight:700;margin:2px 0">' + N(QRead.d.n) + ' / ' + N(6236) + ' آية</div>' +
      '<div class="muted" style="font-size:13px">الختمات المكتملة: <b class="gold num">' + N(kh) + '</b></div></div></div></div>' +
      '<div class="sgrid mx mt">' +
      tile('book', 'emerald', N(t.q || 0), 'آية قرأتها', 'منذ البداية') + tile('play', 'teal', N(t.ql || 0), 'آية استمعت إليها', '') +
      tile('sun', 'amber', N(t.azs || 0), 'جلسة أذكار', N(t.az || 0) + ' ذكرًا مكتملًا') + tile('heart', 'rose', N(t.ist || 0), 'استغفار', '') +
      tile('beads', 'plum', N(t.tas || 0), 'تسبيحة', '') + tile('mosque', 'indigo', N(t.pr || 0), 'صلاة مسجّلة', '') +
      tile('check', 'slate', N(t.hab || 0), 'عادة أنجزتها', '') + tile('list', 'gold', N(t.todo || 0), 'مهمة أنجزتها', '') + '</div>' +
      sec('نقاط آخر سبعة أيام') + '<div class="hc">' + barsSVG(days.map(d => Growth.day(d).xp || 0), days.map(d => DN[d.getDay()]), 'var(--brand-3)') + '</div>' +
      sec('أيام النشاط · ١٦ أسبوعًا') + '<div class="hc">' + heatSVG(16) + '<div class="row faint" style="justify-content:flex-end;gap:6px;font-size:11px;margin-top:8px">أقل<span class="hlg h1"></span><span class="hlg h2"></span><span class="hlg h3"></span><span class="hlg h4"></span>أكثر</div></div>' +
      (cats.length ? sec('جلسات الأذكار المكتملة') + '<div class="list mx">' + cats.map(([n, v]) => '<div class="li"><div class="grow"><div class="t">' + esc(n) + '</div></div><div class="end gold num" style="font-weight:700">' + N(v) + '</div></div>').join('') + '</div>' : '') +
      '<div class="foot-note">«سدّدوا وقاربوا، واعلموا أن لن يُدخِلَ أحدَكم عملُه الجنة، وأنّ أحبّ الأعمال إلى الله أدومها وإن قلّ» — رواه البخاري</div>';
  },
};

window.Growth = Growth; window.QRead = QRead;

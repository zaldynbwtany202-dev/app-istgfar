/* ════════════════════════════════════════════════════════════════
   وسن 4.0 · التلاوة الصوتية (مع تظليل الآية) · التفسير الميسّر · بطاقات المشاركة
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
];
const pad3 = n => String(n).padStart(3, '0');
/** عدد السور بصيغة عربية سليمة: سورة واحدة · سورتان · 3 سور · 65 سورة · 102 سورة */
const pSur = n => n === 1 ? 'سورة واحدة' : plural(n, 'سورة', 'سورتان', 'سور', 'سورة');
/* ── وسن 4.5 · مكتبة القرّاء (mp3quran.net): سورة كاملة، مع متابعة الآيات لمن تتوفّر توقيتاته، وتنزيل دون إنترنت ── */
const LIB = () => window.WASAN_RECITERS || [];
const libOf = id => { const m = /^m:(\d+)$/.exec(id || ''); return m ? LIB().find(x => x.id === +m[1]) || null : null; };
const libHas = (m, sn) => !m.l || m.l.split(',').includes(String(sn));
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
/* التنزيلات: ملف لكل سورة في مساحة التطبيق (بلا أذونات) عبر مدير التنزيلات في أندرويد */
const Downloads = {
  st: Store.get('dl', {}),
  ok() { return Native.has('dlStart'); },
  key: (id, sn) => 'm' + id + '_' + pad3(sn),
  rel: (id, sn) => 'm' + id + '/' + pad3(sn) + '.mp3',
  save() { Store.set('dl', this.st); Bus.emit('dl'); },
  state(id, sn) { const x = this.st[this.key(id, sn)]; return x ? x.s : ''; },
  path(id, sn) { if (this.state(id, sn) !== 'done' || !this.ok()) return ''; const p = Native.call('dlPath', this.rel(id, sn)); if (!p) { delete this.st[this.key(id, sn)]; this.save(); } return p || ''; },
  start(m, sn) {
    if (!this.ok()) { toast('التنزيل يعمل في التطبيق على الهاتف'); return; }
    if (!libHas(m, sn)) return;
    const k = this.key(m.id, sn), s = Q.S[sn - 1];
    this.st[k] = { s: 'run', ts: Date.now(), p: 0 }; this.save();
    Native.call('dlStart', k, m.s + pad3(sn) + '.mp3', this.rel(m.id, sn), 'سورة ' + (s ? s.name : sn) + ' — ' + m.n);
    if (m.t) Timings.get(m.id, sn).catch(() => {});
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
  a: null, pre: null, i: -1, end: -1, left: 1, on: false, playing: false, loading: false, basm: false, el: null,
  base() { return 'https://everyayah.com/data/' + (Settings.reciter || RECITERS[0][0]) + '/'; },
  file(i) { return this.base() + pad3(Q.s[i]) + pad3(Q.a[i]) + '.mp3'; },
  reps() { return Settings.qRepeat == null ? 1 : Settings.qRepeat; },
  lib() { return libOf(Settings.reciter); },
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
    const m = this.lib(), sn = Q.s[i], s = surahOf(i);
    if (!libHas(m, sn)) { toast('سورة ' + s.name + ' غير متوفرة بصوت ' + m.n); return; }
    this.on = true; this.sm = true; this.left = this.reps(); this.ensureUI();
    this.end = Settings.qCont ? Q.t.length - 1 : s.start + s.n - 1;
    this.loadSurah(sn, Q.a[i]);
    Native.call('keepScreenOn', true); this.armSleep();
  },
  loadSurah(sn, ayah) {
    const m = this.lib(); if (!m) return;
    this.cs = sn; this.tm = null; this.cur = -1; this.basm = false;
    const a = this.audio(), want = ayah || 1, local = Downloads.path(m.id, sn);
    this.remote = m.s + pad3(sn) + '.mp3'; this.local = !!local;
    this.loading = true; a.src = local || this.remote; a.playbackRate = Settings.qRate || 1;
    const seek = () => { const e = this.tm && this.tm.find(x => x.ayah === want); if (e && want > 1) try { a.currentTime = e.st / 1000; } catch (er) {} };
    if (m.t) Timings.get(m.id, sn).then(tm => { if (this.cs !== sn || !this.on) return; this.tm = tm; if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true }); }).catch(() => {});
    else if (want > 1) toast('هذا القارئ يُسمَع من أول السورة');
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
    if (this.cur === e.ayah && e.ayah > 0 && (r === 0 || this.left > 1) && t >= e.en - 140) { if (r !== 0) this.left--; this.a.currentTime = e.st / 1000; return; }
    if (e.ayah !== this.cur) {
      if (this.cur > 0) Growth.add('ql', 1);
      this.cur = e.ayah; this.left = r; this.basm = e.ayah === 0;
      this.i = Q.S[this.cs - 1].start + Math.max(0, e.ayah - 1); this.highlight(); this.sync();
    }
  },
  libEnded() {
    if (!this.tm) Growth.add('ql', Q.S[this.cs - 1].n); else if (this.cur > 0) Growth.add('ql', 1);
    if (this.sleepEnd) { this.sleepDone(); return; }
    if (Settings.qCont && this.cs < 114) { const m = this.lib(); let n = this.cs + 1; while (n <= 114 && !libHas(m, n)) n++; if (n <= 114) { this.loadSurah(n, 1); return; } }
    this.stop(); toast('انتهت التلاوة — تقبّل الله');
  },
  libStep(d) {
    if (this.tm) { const k = this.tm.findIndex(x => x.ayah === this.cur), e = this.tm[k + d]; if (k >= 0 && e) { this.left = this.reps(); this.a.currentTime = e.st / 1000; return; } }
    const m = this.lib(); let n = this.cs + d; while (n >= 1 && n <= 114 && !libHas(m, n)) n += d;
    if (n >= 1 && n <= 114) this.loadSurah(n, 1); else toast(d > 0 ? 'آخر سورة' : 'أول سورة');
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
    const off = navigator.onLine === false;
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
  label() { const s = surahOf(this.i); if (this.sm && !this.tm) return 'سورة ' + s.name; return 'سورة ' + s.name + ' · ' + (this.basm ? 'البسملة' : 'الآية ' + N(Q.a[this.i])); },
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
    $('#pb-t2', this.el).textContent = reciterName(Settings.reciter) + (this.reps() !== 1 ? ' · تكرار ' + (this.reps() === 0 ? '∞' : N(this.reps())) : '');
    const pb = $('.pb-play', this.el); pb.innerHTML = this.loading ? '<span class="spin"></span>' : icon(this.playing ? 'pause' : 'play');
    Native.call('audioState', JSON.stringify({ active: this.on, playing: this.playing || this.loading, title: this.label(), sub: reciterName(Settings.reciter) }));
    try { if (navigator.mediaSession && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: this.label(), artist: reciterName(Settings.reciter), album: 'وسن' }); } catch (e) {}
  },
};

function playerSheet(startI) {
  const reps = [[1, 'بدون'], [2, '٢'], [3, '٣'], [5, '٥'], [10, '١٠'], [0, '∞']], rates = [[0.75, '0.75×'], [1, '1×'], [1.25, '1.25×'], [1.5, '1.5×']];
  const sleeps = [[0, 'بدون'], [15, '١٥ د'], [30, '٣٠ د'], [60, 'ساعة'], [-1, 'نهاية السورة']];
  const m = libOf(Settings.reciter), si = startI != null ? startI : (Player.on ? Player.i : (typeof RS !== 'undefined' && Q.ready ? Q.S[RS.s - 1].start : 0)), sn = Q.ready ? Q.s[si] : 1;
  const dlRow = () => {
    if (!m) return '<div class="ps-note">' + icon('info') + '<span>للاستماع دون إنترنت اختر قارئًا من «مكتبة القرّاء» ثم نزّل السور.</span></div>';
    const st = Downloads.state(m.id, sn), nm = Q.ready ? Q.S[sn - 1].name : '';
    return '<div class="ps-dl" id="ps-dl"><div class="grow"><b>سورة ' + esc(nm) + '</b><span>' + (st === 'done' ? 'منزّلة — تعمل دون إنترنت' : st === 'run' ? 'جارٍ التنزيل…' : libHas(m, sn) ? 'تُسمَع عبر الإنترنت' : 'غير متوفرة بصوت هذا القارئ') + '</span></div>' +
      (st === 'done' ? '<span class="ok">' + icon('check') + '</span>' : st === 'run' ? '<span class="spin"></span>' : libHas(m, sn) ? '<button class="act" id="ps-dlb">' + icon('save') + 'نزّلها</button>' : '') +
      '</div><button class="btn ghost block" data-go="downloads" style="margin-top:8px">' + icon('layers') + 'كل التنزيلات</button>';
  };
  const html = '<div class="sh-t">التلاوة</div><div class="sh-s">' + (Q.ready ? esc(ayahRef(si)) : '') + '</div>' +
    '<div class="mx"><b class="lbl2">القارئ</b><button class="li ps-rec" id="ps-rec"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(reciterName(Settings.reciter)) + '</div>' +
    '<div class="s">' + (m ? (m.t ? 'سورة كاملة مع متابعة الآيات' : 'سورة كاملة') + ' · ' + (m.c < 114 ? pSur(m.c) : 'المصحف كاملًا') : 'آية بآية · متابعة دقيقة') + '</div></div><span class="link">تغيير</span></button>' +
    dlRow() +
    '<b class="lbl2">تكرار كل آية</b><div class="seg" id="ps-rep">' + reps.map(([v, t]) => '<button data-v="' + v + '" class="' + (Player.reps() === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    (m && !m.t ? '<div class="faint" style="font-size:11.5px;margin-top:4px">التكرار يعمل مع القرّاء الذين تتوفّر لهم متابعة الآيات</div>' : '') +
    '<b class="lbl2">السرعة</b><div class="seg" id="ps-rate">' + rates.map(([v, t]) => '<button data-v="' + v + '" class="' + ((Settings.qRate || 1) === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    '<b class="lbl2">عند نهاية السورة</b><div class="seg" id="ps-cont"><button data-v="0" class="' + (!Settings.qCont ? 'on' : '') + '">توقف</button><button data-v="1" class="' + (Settings.qCont ? 'on' : '') + '">تابع للسورة التالية</button></div>' +
    '<b class="lbl2">مؤقّت النوم</b><div class="seg" id="ps-sl">' + sleeps.map(([v, t]) => '<button data-v="' + v + '" class="' + ((+Settings.sleepMin || 0) === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    (startI != null || !Player.on ? '<button class="btn gold block" id="ps-go" style="margin-top:16px">' + icon('play') + 'ابدأ الاستماع</button>' : '') +
    '<div class="faint" style="font-size:12px;margin-top:10px;text-align:center">' + (m ? 'التسجيلات من mp3quran.net' : 'التسجيلات من everyayah.com') + '</div></div>';
  Sheet.open(html, el => {
    const seg = (id, key, conv, after) => { const s = $(id, el); s.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setSetting(key, conv(b.dataset.v)); $$('button', s).forEach(x => x.classList.toggle('on', x === b)); Player.sync(); if (after) after(); }; };
    seg('#ps-rep', 'qRepeat', Number, () => { Player.left = Player.reps(); }); seg('#ps-rate', 'qRate', Number, () => { if (Player.a) Player.a.playbackRate = Settings.qRate; });
    seg('#ps-cont', 'qCont', v => v === '1'); seg('#ps-sl', 'sleepMin', Number, () => { Player.armSleep(); const v = +Settings.sleepMin; if (v) toast(v < 0 ? 'تتوقف التلاوة بنهاية السورة' : 'تتوقف التلاوة بعد ' + pM(v)); });
    $('#ps-rec', el).onclick = () => Sheet.close(() => reciterSheet(() => playerSheet(startI)));
    const dlb = $('#ps-dlb', el); if (dlb) dlb.onclick = () => { Downloads.start(m, sn); toast('بدأ تنزيل السورة — تجده في الإشعارات'); Sheet.close(); };
    const go = $('#ps-go', el); if (go) go.onclick = () => Sheet.close(() => Player.start(si));
  });
}

/* ── اختيار القارئ: آية بآية · مكتبة القرّاء · على يوتيوب ── */
function reciterSheet(done) {
  const cur = Settings.reciter || RECITERS[0][0];
  const rowA = ([id, n]) => '<button class="li opt ' + (id === cur ? 'on' : '') + '" data-r="' + id + '"><div class="grow"><div class="t">' + esc(n) + '</div><div class="s">آية بآية · متابعة دقيقة</div></div><span class="rad"></span></button>';
  const rowL = x => { const id = 'm:' + x.id, dn = Downloads.count(x.id);
    return '<button class="li opt ' + (id === cur ? 'on' : '') + '" data-r="' + id + '" data-q="' + esc(x.n + ' ' + x.k) + '"><div class="grow"><div class="t">' + esc(x.n) + (x.k ? ' <span class="rk">' + esc(x.k) + '</span>' : '') + '</div>' +
      '<div class="s">' + (x.t ? 'متابعة الآيات' : 'سورة كاملة') + ' · ' + (x.c < 114 ? pSur(x.c) : 'المصحف كاملًا') + (dn ? ' · ' + N(dn) + ' منزّلة' : '') + '</div></div><span class="rad"></span></button>'; };
  const html = '<div class="sh-t">القارئ</div><div class="sh-s">' + N(RECITERS.length + LIB().length) + ' تلاوة · ابحث بالاسم</div>' +
    '<div class="mx"><div class="search rs-q">' + icon('search') + '<input id="rq" placeholder="ابحث عن قارئ…" autocomplete="off"></div></div>' +
    '<div class="rs-g" data-g="a">تلاوة آية بآية</div><div class="rs-list">' + RECITERS.map(rowA).join('') + '</div>' +
    '<div class="rs-g" data-g="l">مكتبة القرّاء · سورة كاملة وتنزيل دون إنترنت</div><div class="rs-list" id="rs-l">' + LIB().map(rowL).join('') + '</div>' +
    '<div class="rs-g" data-g="y">على يوتيوب</div><div class="rs-list">' + YT_RECITERS.map(n => '<button class="li" data-yt="' + esc(n) + '" data-q="' + esc(n) + '"><div class="ic">' + icon('play') + '</div><div class="grow"><div class="t">' + esc(n) + '</div><div class="s">يفتح تلاواته في يوتيوب</div></div>' + icon('chev', 'faint') + '</button>').join('') + '</div>';
  Sheet.open(html, el => {
    const q = $('#rq', el);
    q.addEventListener('input', debounce(() => { const v = normAr(q.value.trim());
      $$('[data-r],[data-yt]', el).forEach(b => { const t = normAr(b.dataset.q || b.textContent); b.style.display = !v || t.includes(v) ? '' : 'none'; });
      $$('.rs-g', el).forEach(g => { g.style.display = v ? 'none' : ''; }); }, 180));
    el.addEventListener('click', e => {
      const y = e.target.closest('[data-yt]');
      if (y) { const s = (Router.cur && Router.cur.r === 'reader' && Q.ready) ? 'سورة ' + Q.S[RS.s - 1].name + ' ' : '';
        const u = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s + y.dataset.yt); if (Native.has('openUrl')) Native.call('openUrl', u); else window.open(u, '_blank'); return; }
      const b = e.target.closest('[data-r]'); if (!b) return;
      setSetting('reciter', b.dataset.r); vibrate(8);
      const wasOn = Player.on, i = Player.i; if (wasOn) Player.stop();
      Sheet.close(() => { if (wasOn) Player.start(i); if (done) done(); else if (Router.cur && Router.cur.r === 'settings') Router.refresh(); });
    });
    const on = $('.opt.on', el); if (on) setTimeout(() => on.scrollIntoView({ block: 'center' }), 60);
  });
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
    const m = libOf(Settings.reciter), ok = Downloads.ok();
    const others = [...new Set(Object.keys(Downloads.st).filter(k => Downloads.st[k].s === 'done').map(k => +k.slice(1).split('_')[0]))].filter(id => !m || id !== m.id).map(id => LIB().find(x => x.id === id)).filter(Boolean);
    const used = ok ? +(Native.call('dlUsage') || 0) : 0;
    let h = hdr('تنزيلات التلاوة', 'استمع دون إنترنت', { back: true, compact: true });
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
    if (!Q.ready) loadQuran().then(() => { if (Router.cur.r === 'downloads') Router.refresh(); });
    const m = libOf(Settings.reciter);
    $('#dl-rec', el).onclick = () => reciterSheet(() => Router.refresh());
    const all = $('#dl-all', el); if (all) all.onclick = () => confirmSheet('تنزيل كل سور القارئ؟', 'قد يستهلك التنزيل كاملًا مساحة كبيرة (قرابة ١ إلى ٢ غيغابايت) وبيانات إنترنت كثيرة. يُفضَّل استعمال الواي فاي.', 'نعم، ابدأ التنزيل', () => {
      let n = 0; Q.S.forEach(s => { if (libHas(m, s.id) && !Downloads.state(m.id, s.id)) { Downloads.start(m, s.id); n++; } }); toast(n ? 'بدأ تنزيل ' + plural(n, 'سورة', 'سورتين', 'سور', 'سورة') : 'كل السور منزّلة'); Router.refresh(); });
    const del = $('#dl-del', el); if (del) del.onclick = () => confirmSheet('حذف تنزيلات هذا القارئ؟', 'ستُحذف السور المنزّلة من هاتفك، ويمكنك تنزيلها مجددًا متى شئت.', 'احذف', () => {
      Q.S.forEach(s => { const st = Downloads.state(m.id, s.id); if (st === 'done') Downloads.remove(m.id, s.id); else if (st === 'run') Downloads.cancel(m.id, s.id); }); Router.refresh(); }, { danger: true });
    el.addEventListener('click', e => {
      const sw = e.target.closest('[data-sw]'); if (sw) { setSetting('reciter', 'm:' + sw.dataset.sw); Router.refresh(); return; }
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

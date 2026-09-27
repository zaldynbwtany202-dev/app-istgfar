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
const reciterName = id => (RECITERS.find(r => r[0] === id) || RECITERS[0])[1];

const Player = {
  a: null, pre: null, i: -1, end: -1, left: 1, on: false, playing: false, loading: false, basm: false, el: null,
  base() { return 'https://everyayah.com/data/' + (Settings.reciter || RECITERS[0][0]) + '/'; },
  file(i) { return this.base() + pad3(Q.s[i]) + pad3(Q.a[i]) + '.mp3'; },
  reps() { return Settings.qRepeat == null ? 1 : Settings.qRepeat; },
  start(i, opts) {
    if (!Q.ready) return;
    opts = opts || {};
    const s = surahOf(i);
    this.i = i; this.end = Settings.qCont ? Q.t.length - 1 : s.start + s.n - 1;
    this.on = true; this.left = this.reps(); this.ensureUI();
    if (Q.a[i] === 1 && Q.s[i] !== 1 && Q.s[i] !== 9 && !opts.noBasm) { this.highlight(); this.playUrl(this.base() + '001001.mp3', true); }
    else this.play(i);
    Native.call('keepScreenOn', true);
  },
  play(i) { this.i = i; this.playUrl(this.file(i), false); this.highlight(); this.preload(); },
  audio() {
    if (this.a) return this.a;
    const a = this.a = new Audio(); a.preload = 'auto';
    a.addEventListener('ended', () => this.ended());
    a.addEventListener('error', () => { if (this.on && a.src) this.fail(); });
    a.addEventListener('playing', () => { this.playing = true; this.loading = false; this.sync(); });
    a.addEventListener('pause', () => { this.playing = false; this.sync(); });
    a.addEventListener('waiting', () => { this.loading = true; this.sync(); });
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
    if (this.basm) { this.play(this.i); return; }
    Growth.add('ql', 1);
    const r = this.reps();
    if (r === 0 || this.left > 1) { if (r !== 0) this.left--; this.a.currentTime = 0; this.a.play(); return; }
    this.next(true);
  },
  next(auto) {
    const n = this.i + 1;
    if (n > this.end || n >= Q.t.length) { this.stop(); toast(auto ? 'انتهت التلاوة — تقبّل الله' : 'آخر آية'); return; }
    this.left = this.reps();
    if (Q.a[n] === 1 && Q.s[n] !== 1 && Q.s[n] !== 9) { this.i = n; this.highlight(); this.playUrl(this.base() + '001001.mp3', true); return; }
    this.play(n);
  },
  prev() { if (this.a && this.a.currentTime > 2.5 && !this.basm) { this.a.currentTime = 0; return; } const p = Math.max(0, this.i - 1); this.left = this.reps(); this.play(p); },
  toggle() { if (!this.a) return; if (this.a.paused) { const p = this.a.play(); if (p && p.catch) p.catch(() => this.fail()); } else this.a.pause(); },
  cmd(c) { if (c === 'toggle') this.toggle(); else if (c === 'next') this.next(); else if (c === 'prev') this.prev(); else if (c === 'stop') this.stop(); },
  stop() {
    this.on = false; this.playing = false; this.loading = false;
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
  label() { const s = surahOf(this.i); return 'سورة ' + s.name + ' · ' + (this.basm ? 'البسملة' : 'الآية ' + N(Q.a[this.i])); },
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
  const html = '<div class="sh-t">التلاوة</div><div class="sh-s">' + (startI != null ? esc(ayahRef(startI)) : (Player.on ? esc(Player.label()) : '')) + '</div>' +
    '<div class="mx"><b class="lbl2">القارئ</b><div class="rlist" id="ps-r">' + RECITERS.map(([id, n]) => '<button class="li opt ' + (id === (Settings.reciter || RECITERS[0][0]) ? 'on' : '') + '" data-r="' + id + '"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">' + esc(n) + '</div></div><span class="rad"></span></button>').join('') + '</div>' +
    '<b class="lbl2">تكرار كل آية</b><div class="seg" id="ps-rep">' + reps.map(([v, t]) => '<button data-v="' + v + '" class="' + (Player.reps() === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    '<b class="lbl2">السرعة</b><div class="seg" id="ps-rate">' + rates.map(([v, t]) => '<button data-v="' + v + '" class="' + ((Settings.qRate || 1) === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
    '<b class="lbl2">عند نهاية السورة</b><div class="seg" id="ps-cont"><button data-v="0" class="' + (!Settings.qCont ? 'on' : '') + '">توقف</button><button data-v="1" class="' + (Settings.qCont ? 'on' : '') + '">تابع للسورة التالية</button></div>' +
    (startI != null ? '<button class="btn gold block" id="ps-go" style="margin-top:16px">' + icon('play') + 'ابدأ الاستماع</button>' : '') +
    '<div class="faint" style="font-size:12px;margin-top:10px;text-align:center">التلاوة تحتاج اتصالًا بالإنترنت · التسجيلات من everyayah.com</div></div>';
  Sheet.open(html, el => {
    const seg = (id, key, conv) => { const s = $(id, el); s.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setSetting(key, conv(b.dataset.v)); $$('button', s).forEach(x => x.classList.toggle('on', x === b)); Player.sync(); if (key === 'qRate' && Player.a) Player.a.playbackRate = Settings.qRate; if (key === 'qRepeat') Player.left = Player.reps(); }; };
    seg('#ps-rep', 'qRepeat', Number); seg('#ps-rate', 'qRate', Number); seg('#ps-cont', 'qCont', v => v === '1');
    $('#ps-r', el).onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; setSetting('reciter', b.dataset.r); $$('#ps-r .opt', el).forEach(x => x.classList.toggle('on', x === b));
      if (Player.on) { const i = Player.i; Player.left = Player.reps(); Player.play(i); } };
    const go = $('#ps-go', el); if (go) go.onclick = () => Sheet.close(() => Player.start(startI));
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
    '<div class="tf-ay">' + esc(qd(Q.t[i])) + ' <span class="an gold">' + arDigits(Q.a[i]) + '</span></div>' +
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

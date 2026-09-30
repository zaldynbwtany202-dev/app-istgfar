/* ════════════════════════════════════════════════════════════════
   وسن 4.2 · الشاشات: الرئيسية · الأذكار · المسبحة · القبلة · المزيد …
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* آيات مختارة لبطاقة «آية اليوم»: [سورة، من، إلى] */
const DAILY_VERSES = [[24,35,35],[2,152,152],[2,153,153],[2,186,186],[3,139,139],[3,173,173],[7,56,56],[9,51,51],[12,87,87],[13,28,28],[14,7,7],
  [16,97,97],[16,128,128],[18,46,46],[25,63,63],[29,69,69],[33,41,41],[39,10,10],[39,53,53],[40,60,60],[41,34,34],[49,10,10],[49,13,13],
  [50,16,16],[55,13,13],[59,18,18],[64,11,11],[65,3,3],[67,2,2],[93,5,5],[94,5,6],[2,45,45],[3,31,31],[4,28,28],[6,162,162],[10,62,62],
  [15,49,49],[16,18,18],[20,46,46],[26,80,80],[30,21,21],[42,19,19],[47,7,7],[51,56,56],[52,48,48],[73,8,8],[87,14,15],[89,27,30],[99,7,8],[103,1,3],[2,286,286]];
const dayNo = d => Math.floor((startOfDay(d).getTime() - new Date(2020, 0, 1).getTime()) / 86400000);

const SKY = {
  night: { a: '#0B3B3A', b: '#071D26', g: 'rgba(186,208,255,.26)' },
  dawn: { a: '#1D4A56', b: '#6B4A5C', g: 'rgba(255,183,140,.55)' },
  day: { a: '#0E6A56', b: '#15806A', g: 'rgba(255,241,200,.5)' },
  afternoon: { a: '#2C5C45', b: '#8C6630', g: 'rgba(255,209,130,.55)' },
  sunset: { a: '#4B3A50', b: '#A9503C', g: 'rgba(255,140,90,.58)' },
};
const ARC = { p0: [334, 104], p1: [180, -22], p2: [26, 104] };
const bez = (t) => { const u = 1 - t; return [u * u * ARC.p0[0] + 2 * u * t * ARC.p1[0] + t * t * ARC.p2[0], u * u * ARC.p0[1] + 2 * u * t * ARC.p1[1] + t * t * ARC.p2[1]]; };

function currentAzkarCat(now) {
  const t = Times.forDay(Times.locDay(now));
  if (now >= t.fajr && now < t.dhuhr) return 'morning';
  if (now >= t.asr && now < t.isha) return 'evening';
  if (now >= t.isha || now < t.fajr) return 'sleep';
  return 'prayer';
}

/* أيقونة طور القمر الصغيرة بجانب التاريخ الهجري */
function moonIcon(m) {
  const r = 6.2, cx = 8, cy = 8, k = m.illum, rx = Math.abs(1 - 2 * k) * r, gib = k > 0.5, top = cx + ' ' + (cy - r), bot = cx + ' ' + (cy + r);
  const d = m.waxing ? 'M' + top + 'A' + r + ' ' + r + ' 0 0 1 ' + bot + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (gib ? 1 : 0) + ' ' + top + 'Z'
    : 'M' + top + 'A' + r + ' ' + r + ' 0 0 0 ' + bot + 'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (gib ? 0 : 1) + ' ' + top + 'Z';
  return '<svg class="mph" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2" fill="currentColor" opacity=".22"/>' + (k > 0.02 ? '<path d="' + d + '" fill="currentColor"/>' : '') + '</svg>';
}
SCREENS.home = {
  tab: 'home',
  render() {
    const now = new Date(), l = Loc.eff(), t = Times.forDay(Times.locDay(now)), h = hijriOf(now);
    const occ = NoorEngine.occasionOn(h);
    const g = Growth.info(), gst = Garden.STAGES[g.stage], mn = LivingSky.moon(now);
    const hk = heroKind(), T0 = THEMES[uiTheme()] || {};   // وسن 5.1: صورة (ثيم الصور أو صورتك) · مشهد حيّ متحرك · السماء والبستان للثيمات القديمة
    const hero = '<section class="scene' + (hk === 'photo' ? ' photo ink-' + heroInk() : hk === 'anim' ? ' anim an-' + T0.anim + ' ink-' + heroInk() : '') + hmCls() + '" id="hero">' +
      (hk === 'photo' ? heroPhotoLayer() : hk === 'anim' ? AnimScene.html(T0.anim) : '<div class="sky-tex"></div><div class="sky-stars" aria-hidden="true">' + LivingSky.starsHTML(46, 11) + '</div>' +
      '<div class="clouds" aria-hidden="true"><i></i><i></i><i></i></div><div class="glow" id="h-glow"></div>') +
      '<div class="top"><div class="brandmark">' + heroBrand() +
      (hmOn('loc') ? '<button class="loc" data-go="location">' + icon('pin') + '<span>' + esc(l.label) + '</span></button>' : '') + '</div>' +
      '<button class="ibtn glassy" data-go="settings" aria-label="الإعدادات">' + icon('gear') + '</button></div>' +
      '<div class="arcwrap"><svg viewBox="0 0 360 118" id="h-arc">' +
      '<defs><radialGradient id="sunG"><stop offset="0" stop-color="#FFF8E1"/><stop offset=".55" stop-color="#FFE6A6"/><stop offset="1" stop-color="#F5C46A"/></radialGradient>' +
      '<radialGradient id="mglow"><stop offset="0" stop-color="#E6EDFF" stop-opacity=".35"/><stop offset="1" stop-color="#E6EDFF" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="mfill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFBEA"/><stop offset="1" stop-color="#E9DDB4"/></linearGradient>' +
      '<radialGradient id="sunGl"><stop offset="0" stop-color="#FFE6A6" stop-opacity=".62"/><stop offset="1" stop-color="#FFE6A6" stop-opacity="0"/></radialGradient></defs>' +
      '<path d="M' + ARC.p0 + ' Q' + ARC.p1 + ' ' + ARC.p2 + '" fill="none" stroke="var(--arc)" stroke-width="1.3" stroke-dasharray="2 6" stroke-linecap="round"/>' +
      '<path id="h-done" d="" fill="none" stroke="var(--arc-on)" stroke-width="2" stroke-linecap="round"/>' +
      '<g id="h-body"></g></svg>' +
      '<div class="arc-lbl" id="h-l1" style="right:0"></div><div class="arc-lbl" id="h-l2" style="left:0"></div></div>' +
      '<div class="np"><div class="lbl" id="h-lbl">الصلاة القادمة</div><div class="name" id="h-nn">—</div><div class="at num" id="h-nt"></div>' +
      '<div class="cd num" id="h-cd">' + icon('clock') + '<span></span></div></div>' +
      '<div class="dates"><span>' + weekday(now) + '</span><i class="dot"></i><span class="hj">' + moonIcon(mn) + fmtH(h) + '</span><i class="dot"></i><span>' + fmtG(now) + '</span></div>' +
      (occ ? '<div class="dates"><span class="occ">' + icon('sparkle', '', 'width:14px;height:14px;display:inline-block;vertical-align:-2px') + ' ' + esc(occ.t) + '</span></div>' : '') +
      (hk !== 'sky' ? '' : artKey() ? '<div class="kw-artw" aria-hidden="true"><img class="kw-art" src="' + Art.heroURI(artKey(), g.L) + '" alt="" draggable="false"></div><div class="land kw-hit" data-go="garden" aria-label="بستانك"></div>'
        : '<div class="land" data-go="garden" aria-label="بستانك">' + Garden.render(g.L, { bare: true, phase: gardenPhase(now), id: 'hl', par: 'xMidYMax slice' }) + '</div>') +
      (hk === 'sky' && curSkin() ? (curSkin().stickers ? kwHero(curSkin()) : '<div class="skin-fx fx-' + curSkin().fx + '" aria-hidden="true">' + skinFX(curSkin()) + '</div>') : '') +
      '<button class="lvchip" data-go="garden"><svg viewBox="0 0 24 24"><path d="' + starD(12, 12, 11, 0.76, Math.PI / 8) + '"/></svg><b class="num">' + N(g.L) + '</b><span>' + esc(gst.name) + '</span></button>' +
      '</section>';
    const strip = '<div class="pstrip' + (hmOn('strip') ? '' : ' hm-off') + '" id="h-strip">' + FIVE.map((k, i) =>
      '<div class="pcell" data-k="' + k + '">' + icon(PICON[k]) + '<div class="pn">' + pname(k, now) + '</div><div class="pt num">' + fmtTime(t[k], false) + '</div>' +
      '<button class="chk ' + (Tracker.has(now, i) ? 'on' : '') + '" data-trk="' + i + '" aria-label="تسجيل الصلاة">' + icon('check') + '</button></div>').join('') + '</div>';
    return hero + strip + '<div id="h-ctx" class="stagger' + (hmOn('ctx') ? '' : ' hm-off') + '"></div>' + (hmOn('day') ? homeGrowth() : '') + (hmOn('quick') ? sec('الوصول السريع', { t: 'تخصيص', attr: 'data-go="homecfg"' }) + quickGrid() : '') + '<div id="h-more"></div>' +
      '<div class="hm-edit mx"><button class="btn ghost block" data-go="homecfg">' + icon('edit') + 'تخصيص الشاشة الرئيسية</button></div>';
  },
  mount(el) {
    this.paintSky(new Date(), true);
    // عمق المشهد: الأرض والسماء تتحرّكان أبطأ من المحتوى عند التمرير
    const hero = $('#hero', el), land = hero && (hero.querySelector('.ph-w') || hero.querySelector('.an-par') || hero.querySelector('.kw-artw') || hero.querySelector('.land')), np = hero && hero.querySelector('.np'), sky = hero && hero.querySelector('.sky-stars');
    // وسن 5.1: تتوقف حركة المشهد حين يخرج من الشاشة (توفير البطارية)
    if (hero && 'IntersectionObserver' in window) { this._io = new IntersectionObserver(es => es.forEach(e => hero.classList.toggle('paused', !e.isIntersecting)), { threshold: 0.02 }); this._io.observe(hero); }
    let raf = 0;
    this._par = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const y = Math.max(0, Math.min(window.scrollY, 520));
      if (land) land.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
      if (sky) sky.style.transform = 'translate3d(0,' + (y * 0.45).toFixed(1) + 'px,0)';
      if (np) { np.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)'; np.style.opacity = String(Math.max(0, 1 - y / 340).toFixed(3)); } }); };
    window.addEventListener('scroll', this._par, { passive: true });
    $('#h-strip', el).addEventListener('click', e => {
      const b = e.target.closest('[data-trk]'); if (!b) return;
      const i = +b.dataset.trk, now = new Date(), t = Times.forDay(Times.locDay(now));
      if (t[FIVE[i]] > now && !Tracker.has(now, i)) { toast('لم يحن وقت صلاة ' + PNAME[FIVE[i]] + ' بعد'); return; }
      const on = Tracker.toggle(now, i); b.classList.toggle('on', on); vibrate(on ? 25 : 10);
      if (on) toast(Tracker.count(now) === 5 ? 'ما شاء الله! أتممت صلوات اليوم' : 'تقبّل الله صلاتك');
      const tc = $('#h-track'); if (tc) tc.outerHTML = trackerCard(now);
    });
    this.drawCtx(); this.drawMore();
    if (!Q.ready) loadQuran().then(() => { if (Router.cur.r === 'home') this.drawMore(); }).catch(() => {});
  },
  target(now) {
    const t = Times.forDay(Times.locDay(now));
    if (now >= t.fajr && now < t.sunrise) return { key: 'sunrise', time: t.sunrise, day: now, label: 'ينتهي وقت الفجر', name: 'الشروق' };
    const nx = Times.next(now); nx.label = nx.tomorrow ? 'الصلاة القادمة · غدًا' : 'الصلاة القادمة'; nx.name = pname(nx.key, nx.day); return nx;
  },
  tick(now) {
    const nx = this.target(now);
    const c = $('#h-cd span'); if (c) c.textContent = 'بعد ' + fmtCountdown(nx.time - now);
    if (typeof tickRamadan === 'function') tickRamadan(now);
    if (now.getSeconds() === 0 || this._k !== nx.key) this.paintSky(now);
  },
  paintSky(now, first) {
    const hero = $('#hero'); if (!hero) return;
    const t = Times.forDay(Times.locDay(now)), nx = Times.next(now), tg = this.target(now), sky = LivingSky.at(now);
    this._k = tg.key;
    const own = hero.classList.contains('photo') || hero.classList.contains('anim');
    if (!own) LivingSky.paint(hero, sky);
    if (Router.cur && Router.cur.r === 'home') { if (own) statusBar(heroTop(), heroInk() === 'd'); else statusBar(sky.top, sky.ink === 'dark'); }
    $('#h-lbl').textContent = tg.label; $('#h-nn').textContent = tg.name; $('#h-nt').textContent = fmtTime(tg.time);
    const c = $('#h-cd span'); if (c) c.textContent = 'بعد ' + fmtCountdown(tg.time - now);
    let a, b, la, lb, frac, sun = true;
    if (now >= t.sunrise && now < t.maghrib) { a = t.sunrise; b = t.maghrib; la = ['الشروق', t.sunrise]; lb = ['المغرب', t.maghrib]; }
    else if (now >= t.fajr && now < t.sunrise) { a = t.fajr; b = t.sunrise; la = ['الفجر', t.fajr]; lb = ['الشروق', t.sunrise]; sun = true; }
    else { sun = false; if (now >= t.maghrib) { a = t.maghrib; b = Times.forDay(addDays(Times.locDay(now), 1)).fajr; } else { a = Times.forDay(addDays(Times.locDay(now), -1)).maghrib; b = t.fajr; }
      la = ['المغرب', a]; lb = ['الفجر', b]; }
    frac = clamp((now - a) / (b - a), 0, 1);
    if (now >= t.fajr && now < t.sunrise) frac = 0.02 + frac * 0.05;
    const [x, y] = bez(frac);
    const ak = own ? null : artKey();
    $('#h-body').innerHTML = ak ? '<g class="kw-mk" transform="translate(' + (+x).toFixed(1) + ' ' + (+y).toFixed(1) + ')">' + Art.marker(ak) + '</g>' : sun
      ? '<circle cx="' + x + '" cy="' + y + '" r="22" fill="url(#sunGl)"/><circle cx="' + x + '" cy="' + y + '" r="9.5" fill="url(#sunG)"/>'
      : LivingSky.moonSVG(+x.toFixed(1), +y.toFixed(1), 9, LivingSky.moon(now));
    const steps = 24; let d = 'M' + ARC.p0; for (let k = 1; k <= steps; k++) { const p = bez(frac * k / steps); d += ' L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    $('#h-done').setAttribute('d', d);
    const g = $('#h-glow'); if (g) { g.style.left = (x / 360 * 100) + '%'; g.style.top = (58 + y) + 'px'; }
    $('#h-l1').innerHTML = la[0] + '<b class="num">' + fmtTime(la[1]) + '</b>'; $('#h-l2').innerHTML = lb[0] + '<b class="num">' + fmtTime(lb[1]) + '</b>';
    $$('.pcell').forEach(p => { const k = p.dataset.k; p.classList.toggle('next', k === nx.key && !nx.tomorrow); p.classList.toggle('past', t[k] < now && !(k === nx.key && !nx.tomorrow)); });
    if (nx.tomorrow) { const f = $('.pcell[data-k="fajr"]'); if (f) f.classList.add('next'); }
    // إعادة رسم الأرض عند تغيّر طور اليوم فقط
    const ph = gardenPhase(now), land = $('#hero .land');
    if (land && land.dataset.ph && land.dataset.ph !== ph) land.innerHTML = Garden.render(Growth.level(), { bare: true, phase: ph, id: 'hl', par: 'xMidYMax slice' });
    if (land) land.dataset.ph = ph;
    void first;
  },
  statusBar() { if (heroKind() !== 'sky') return [heroTop(), heroInk() === 'd']; const s = LivingSky.at(new Date()); return [s.top, s.ink === 'dark']; },
  leave() { if (this._par) window.removeEventListener('scroll', this._par); this._par = null; if (this._io) { this._io.disconnect(); this._io = null; } },
  drawCtx() {
    const box = $('#h-ctx'); if (!box) return;
    const now = new Date(), h = hijriOf(now), cat = currentAzkarCat(now);
    const A = NOOR_DATA.AZKAR.find(x => x.id === cat); const pr = Azkar.progress(A);
    let html = '<div class="sec"><h2>وقتك الآن</h2></div>';
    const rc = typeof ramadanCard === 'function' ? ramadanCard(now).replace('class="hc mt rmd', 'class="hc rmd') : '';
    html += rc + '<button class="hc' + (rc ? ' mt' : '') + '" style="display:block;width:calc(100% - 32px);text-align:right" data-go="azkarList" data-a=\'{"id":"' + cat + '"}\'>' +
      '<div class="row"><div class="q" style="flex:none"><div class="qi' + (curSkin() && curSkin().stickers ? ' qi-emo' : '') + '" style="' + hueVars(A.hue) + ';width:52px;height:52px;border-radius:18px">' + kwIcon(A.icon, A.id === 'prayer' ? 'prayer' : null, 32) + '</div></div>' +
      '<div class="grow"><div style="font-weight:700;font-size:16px">' + esc(A.title) + '</div><div class="faint" style="font-size:12.5px">' + (pr.done ? 'أتممت ' + N(pr.done) + ' من ' + N(pr.total) : A.sub + ' · ' + N(pr.total) + ' ذكرًا') + '</div>' +
      '<div class="progress g" style="margin-top:9px"><i style="width:' + Math.round(pr.done / pr.total * 100) + '%"></i></div></div>' + icon('chev', 'faint') + '</div></button>';
    const dow = now.getDay(), t = Times.forDay(Times.locDay(now));
    if (dow === 5 || (dow === 4 && now >= t.maghrib)) {
      html += '<button class="hc mt" style="display:block;width:calc(100% - 32px);text-align:right" data-go="reader" data-a=\'{"s":18}\'><div class="row">' +
        '<div class="q" style="flex:none"><div class="qi" style="' + hueVars('gold') + ';width:52px;height:52px;border-radius:18px">' + icon('book') + '</div></div>' +
        '<div class="grow"><div style="font-weight:700;font-size:16px">' + (dow === 5 ? 'جمعة مباركة — سورة الكهف' : 'ليلة الجمعة — سورة الكهف') + '</div>' +
        '<div class="faint" style="font-size:12.5px;line-height:1.6">«من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين» — وأكثروا من الصلاة على النبي ﷺ</div></div>' + icon('chev', 'faint') + '</div></button>';
    }
    const up = upcomingOccasions(now, 3)[0];
    if (up || [13, 14, 15].includes(h.day)) {
      const title = up ? (up.days === 0 ? 'اليوم: ' + up.o.t : (up.days === 1 ? 'غدًا: ' : 'بعد ' + pD(up.days) + ': ') + up.o.t) : 'الأيام البيض';
      const sub = up ? (up.o.n || fmtH(up.h)) : 'يُستحب صيام الأيام ' + N(13) + ' و' + N(14) + ' و' + N(15) + ' من كل شهر هجري';
      html += '<button class="hc mt" style="display:block;width:calc(100% - 32px);text-align:right" data-go="calendar"><div class="row">' +
        '<div class="q" style="flex:none"><div class="qi" style="' + hueVars('plum') + ';width:52px;height:52px;border-radius:18px">' + icon('calendar') + '</div></div>' +
        '<div class="grow"><div style="font-weight:700;font-size:16px">' + esc(title) + '</div><div class="faint" style="font-size:12.5px">' + esc(sub) + '</div></div>' + icon('chev', 'faint') + '</div></button>';
    }
    box.innerHTML = html;
    if (typeof bindRamadanCard === 'function') bindRamadanCard(box);
  },
  drawMore() {
    const box = $('#h-more'); if (!box) return;
    const now = new Date(); let html = '';
    const lr = LastRead.get(), k = Khatma.get();
    if (Q.ready && (lr || k) && hmOn('wird')) {
      html += sec('وردك من القرآن', { t: 'الختمة', attr: 'data-go="khatma"' });
      if (lr && Q.t[lr.i]) {
        const s = surahOf(lr.i), pg = Q.p[lr.i];
        html += '<button class="hc feature-hc" style="display:block;width:calc(100% - 32px);text-align:right" data-go="reader" data-a=\'' + JSON.stringify({ s: s.id, i: lr.i, mode: lr.mode }) + '\'>' +
          '<div class="cr"><div class="ico">' + icon('book') + '</div><div class="grow"><div class="muted" style="font-size:12px">تابع من حيث توقفت</div><div class="nm">سورة ' + esc(s.name) + '</div>' +
          '<div class="muted" style="font-size:12.5px">الآية ' + N(Q.a[lr.i]) + ' · الجزء ' + N(Q.j[lr.i]) + ' · الصفحة ' + N(pg) + '</div></div>' + icon('chev') + '</div>' +
          '<div class="row" style="margin-top:12px;gap:10px"><div class="progress grow"><i style="width:' + (pg / 604 * 100).toFixed(1) + '%"></i></div><span class="num" style="font-size:12px;color:var(--gold-2)">' + N(Math.round(pg / 604 * 100)) + '%</span></div></button>';
      }
      if (k) {
        const day = clamp(Khatma.dayIndex(k, now), 1, k.days), [pa, pb] = Khatma.range(k, day);
        html += '<button class="hc mt" style="display:block;width:calc(100% - 32px);text-align:right" data-go="khatma"><div class="row"><div class="ring">' + ringSVG(54, 5, Khatma.doneCount(k) / k.days, 'var(--gold)') +
          '<div class="ctr"><b class="num" style="font-size:12px">' + N(day) + '/' + N(k.days) + '</b></div></div><div class="grow"><div style="font-weight:700">وِرد اليوم' + (k.done[day] ? ' ✓' : '') + '</div>' +
          '<div class="faint" style="font-size:12.5px">الصفحات ' + N(pa) + ' – ' + N(pb) + '</div></div>' + icon('chev', 'faint') + '</div></button>';
      }
    }
    if (Q.ready && hmOn('ayah')) {
      const v = DAILY_VERSES[dayNo(now) % DAILY_VERSES.length];
      const txt = quranText(v[0], v[1], v[2]);
      html += sec('آية اليوم') + '<div class="hc"><div class="verse">' + txt.map(x => { const p = x.lastIndexOf(' '); return esc(qd(x.slice(0, p))) + ' <span class="an">' + x.slice(p + 1) + '</span>'; }).join(' ') + '</div>' +
        '<div class="vref"><span class="pill">' + icon('book') + 'سورة ' + esc(Q.S[v[0] - 1].name) + ' · ' + N(v[1]) + (v[2] > v[1] ? '–' + N(v[2]) : '') + '</span></div>' +
        '<div class="acts"><button class="act" id="v-open">' + icon('book') + 'فتح في المصحف</button><button class="act" id="v-copy">' + icon('copy') + 'نسخ</button><button class="act" id="v-share">' + icon('share') + 'مشاركة</button><button class="act" id="v-img">' + icon('image') + 'صورة</button></div></div>';
      this._verse = v; this._vtxt = '﴿' + txt.map(x => x.slice(0, x.lastIndexOf(' '))).join(' ') + '﴾ [' + Q.S[v[0] - 1].name + ': ' + v[1] + (v[2] > v[1] ? '-' + v[2] : '') + ']';
    }
    const w = NOOR_DATA.DAILY_WISDOM[dayNo(now) % NOOR_DATA.DAILY_WISDOM.length];
    if (hmOn('hadith')) html += sec('من هدي النبي ﷺ') + '<div class="hc"><div style="font-family:var(--font-d);font-size:19px;line-height:1.95;text-align:center">«' + esc(w.t) + '»</div>' +
      '<div class="vref"><span class="pill green">' + esc(w.src) + '</span></div></div>';
    if (hmOn('week')) html += sec('صلواتك هذا الأسبوع', { t: 'التفاصيل', attr: 'data-go="tracker"' }) + trackerCard(now);
    box.innerHTML = html;
    const vb = $('#v-open'); if (vb) vb.onclick = () => Router.go('reader', { s: this._verse[0], i: gIndex(this._verse[0], this._verse[1]) });
    const vc = $('#v-copy'); if (vc) vc.onclick = () => copyText(this._vtxt);
    const vs = $('#v-share'); if (vs) vs.onclick = () => shareText(this._vtxt + '\n— عبر تطبيق وسن');
    const vi = $('#v-img'); if (vi) vi.onclick = () => { const v = this._verse, tx = quranText(v[0], v[1], v[2]).map(x => x.slice(0, x.lastIndexOf(' '))).join(' ');
      ShareCard.share({ kind: 'ayah', title: 'آية اليوم', text: tx, ref: '[' + Q.S[v[0] - 1].name + ': ' + arDigits(v[1]) + (v[2] > v[1] ? '–' + arDigits(v[2]) : '') + ']' }, this._vtxt); };
  },
};
function homeGrowth() {
  const now = new Date(), hs = Habits.today(now), hd = hs.filter(h => Habits.done(h, now)).length, td = Todo.list.filter(Todo.fToday).length;
  const xp = Math.floor(Growth.day().xp || 0), water = clamp(xp / DAILY_GOAL, 0, 1), sk = Growth.streak();
  return sec('يومك', { t: 'إحصاءاتي', attr: 'data-go="stats"' }) +
    '<button class="hc daycard" data-go="garden" id="h-day"><div class="dc-ring">' + ringSVG(76, 7, water, 'var(--gold)') + '<span class="num">' + N(Math.round(water * 100)) + '٪</span></div>' +
    '<div class="dc-t"><b>' + (water >= 1 ? 'ارتوى بستانك اليوم' : 'سقاية بستانك اليوم') + '</b><span class="num">' + N(xp) + ' من ' + N(DAILY_GOAL) + ' نقطة</span>' +
    (sk > 1 ? '<em>' + icon('flame') + N(sk) + ' أيام متتالية من العطاء</em>' : '<em>' + icon('sprout') + 'كل طاعة تسقي بستانك</em>') + '</div>' + icon('chev', 'faint') + '</button>' +
    '<div class="daychips mx"><button data-go="habits">' + icon('target') + '<span>العادات</span><b class="num">' + N(hd) + '/' + N(hs.length) + '</b></button>' +
    '<button data-go="todo">' + icon('list') + '<span>المهام</span><b class="num">' + N(td) + '</b></button>' +
    '<button data-go="tasbih">' + icon('beads') + '<span>المسبحة</span><b class="num">' + N((typeof TB !== 'undefined' && TB.today) || 0) + '</b></button></div>';
}
/* تحديث المشهد عند تغيّر المستوى وأنت على الرئيسية */
Bus.on('growth', () => {
  if (!Router.cur || Router.cur.r !== 'home') return;
  const L = Growth.level(), chip = $('#hero .lvchip'); if (!chip) return;
  const b = chip.querySelector('b'); if (b && b.textContent === N(L)) return;
  const st = Garden.STAGES[Garden.stageOf(L)];
  if (b) b.textContent = N(L); const s = chip.querySelector('span'); if (s) s.textContent = st.name;
  const land = $('#hero .land'); if (land) land.innerHTML = Garden.render(L, { bare: true, phase: gardenPhase(new Date()), id: 'hl', par: 'xMidYMax slice' });
});
/* ═══════════════ وسن 7 · تخصيص الشاشة الرئيسية: كل جزء يظهر أو يختفي، والاختصارات كما تحب ═══════════════ */
const hmOn = k => !(Settings.home && Settings.home[k] === false);
const HOME_TOP = [['loc', 'اسم المدينة', 'زرّ الموقع تحت الشعار'], ['arc', 'قوس الشمس', 'مسار الشمس بين الصلوات'], ['cd', 'العدّ التنازلي', 'الوقت الباقي للصلاة القادمة'],
  ['dates', 'التاريخ', 'اليوم والتاريخان الهجري والميلادي'], ['occ', 'المناسبات', 'تذكير بالمناسبات والأيام الفاضلة'], ['art', 'رسومات المشهد', 'البستان وزينة الثيم المتحرّكة'], ['lv', 'شارة البستان', 'مستوى بستانك في أسفل المشهد']];
const HOME_SECS = [['strip', 'الصلوات الخمس', 'شريط المواقيت مع تسجيل الصلاة'], ['ctx', 'وقتك الآن', 'أذكار الوقت والجمعة والمناسبات'], ['day', 'يومك', 'سقاية البستان والعادات والمهام'],
  ['quick', 'الوصول السريع', 'اختصاراتك المفضّلة'], ['wird', 'وردك من القرآن', 'تابع من حيث توقفت ووِرد الختمة'], ['ayah', 'آية اليوم', ''], ['hadith', 'من هدي النبي ﷺ', ''], ['week', 'صلواتك هذا الأسبوع', '']];
const HOME_BRAND = [['logo', 'شعار «وسن»'], ['greet', 'تحية حسب الوقت'], ['salam', 'السلام عليكم'], ['name', 'اسمك'], ['none', 'بلا شيء']];
/** [مفتاح، الاسم، الرمز، اللون، الوجهة، رمز الثيمات الكاملة] */
const QUICK_ALL = [['quran', 'القرآن', 'book', 'emerald', 'data-tab="quran"', 'book'], ['azkar', 'الأذكار', 'moonstar', 'teal', 'data-tab="azkar"', 'moon'],
  ['qibla', 'القبلة', 'kaaba', 'gold', 'data-go="qibla"', 'kaaba'], ['tasbih', 'المسبحة', 'beads', 'indigo', 'data-go="tasbih"', 'beads'],
  ['duas', 'الأدعية', 'hands', 'plum', 'data-go="azkarList" data-a=\'{"id":"qduas"}\'', 'palms'], ['names', 'الأسماء الحسنى', 'star8', 'amber', 'data-go="names"', 'sparkles'],
  ['calendar', 'التقويم', 'calendar', 'slate', 'data-go="calendar"', 'calendar'], ['khatma', 'الختمة', 'target', 'emerald', 'data-go="khatma"', 'books'],
  ['tracker', 'سجل الصلوات', 'chart', 'teal', 'data-go="tracker"', 'mosque'], ['habits', 'العادات', 'sprout', 'gold', 'data-go="habits"', 'seedling'],
  ['todo', 'المهام', 'list', 'indigo', 'data-go="todo"', 'ribbon'], ['istighfar', 'الاستغفار', 'heart', 'rose', 'data-go="istighfar"', 'sparkheart'],
  ['qada', 'قضاء الفوائت', 'history', 'plum', 'data-go="qada"', 'alarm'], ['alarms', 'المنبّه', 'alarm', 'amber', 'data-go="alarms"', 'bell'],
  ['zakat', 'الزكاة', 'calc', 'indigo', 'data-go="zakat"', 'gem'], ['stats', 'إحصاءاتي', 'chart', 'slate', 'data-go="stats"', 'star'],
  ['gift', 'لوحة الهدية', 'sparkle', 'plum', 'data-go="gift"', 'ribbonheart'], ['downloads', 'التلاوات', 'headphones', 'teal', 'data-go="downloads"', 'books'],
  ['more', 'المزيد', 'grid', 'neutral', 'data-tab="more"', '*']];
const QUICK_DEF = ['quran', 'azkar', 'qibla', 'tasbih', 'duas', 'names', 'calendar', 'more'];
function quickKeys() { const q = Array.isArray(Settings.quick) ? Settings.quick.filter(k => QUICK_ALL.some(x => x[0] === k)) : null; return q && q.length ? q : QUICK_DEF; }
function hmCls() { return ['arc', 'cd', 'dates', 'occ', 'art', 'lv'].filter(k => !hmOn(k)).map(k => ' hm-x-' + k).join(''); }
function heroBrand() {
  const b = (Settings.home && Settings.home.brand) || 'logo', nm = String(Settings.userName || '').trim();
  if (b === 'none') return '';
  if (b === 'logo') return wordmark('wm-hero');
  const hr = new Date().getHours(), gr = hr >= 4 && hr < 12 ? 'صباح الخير' : 'مساء الخير';
  const t = b === 'salam' ? 'السلام عليكم' + (nm ? '، ' + nm : '') : b === 'greet' ? gr + (nm ? '، ' + nm : '') : (nm || 'وسن');
  return '<div class="hero-greet">' + esc(t) + '</div>';
}
function quickGrid() {
  const sk = curSkin(), qe = sk && sk.quick;   // وسن 4.5: رموز ثلاثية الأبعاد في الثيمات الكاملة
  const items = quickKeys().map(k => QUICK_ALL.find(x => x[0] === k));
  const n = items.length; return '<div class="qgrid stagger' + (n === 6 || n === 9 ? ' qg-3' : n === 5 || n === 10 ? ' qg-5' : '') + '">' + items.map(([k, t, ic, hu, at, em]) => {
    const di = QUICK_DEF.indexOf(k), e = qe ? (em === '*' ? qe[7] : di >= 0 && di < 7 ? qe[di] : em) : null;
    return '<button class="q" ' + at + '>' + (e ? '<div class="qi qi-emo">' + emoImg(e, k === 'more' && sk.quickHue && KW_HUE[sk.quickHue] ? 'filter:' + KW_HUE[sk.quickHue] : '') + '</div>' : '<div class="qi" style="' + hueVars(hu) + '">' + icon(ic) + '</div>') + t + '</button>'; }).join('') + '</div>';
}
function setHome(k, v) { const h = Object.assign({}, Settings.home || {}); if (v === true && k !== 'brand') delete h[k]; else h[k] = v; setSetting('home', h); }
/** ملخّص قصير لشكل الرئيسية (في الإعدادات) */
function homeSummary() {
  const b = (Settings.home && Settings.home.brand) || 'logo', off = HOME_TOP.concat(HOME_SECS).filter(([k]) => !hmOn(k)).length;
  return (HOME_BRAND.find(x => x[0] === b) || HOME_BRAND[0])[1] + ' · ' + N(quickKeys().length) + ' اختصارات' + (off ? ' · ' + N(off) + ' مخفي' : ' · كل الأقسام ظاهرة');
}
SCREENS.homecfg = {
  parent: 'settings',
  render() {
    const b = (Settings.home && Settings.home.brand) || 'logo', qk = quickKeys();
    const sw = ([k, t, s]) => '<div class="li"><div class="grow"><div class="t">' + t + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div><button class="switch ' + (hmOn(k) ? 'on' : '') + '" data-hm="' + k + '"></button></div>';
    return hdr('تخصيص الرئيسية', 'اختر ما يظهر في شاشتك الأولى', { back: true, compact: true }) +
      sec('أعلى الشاشة') + '<div class="list mx"><div class="li" style="flex-wrap:wrap"><div class="grow" style="min-width:100%"><div class="t">ما يظهر مكان الشعار</div><div class="s">شعار «وسن» أو تحية أو اسمك — أو اتركه فارغًا</div></div>' +
        '<div class="seg hm-br" id="hm-br" style="margin-top:10px;width:100%">' + HOME_BRAND.map(([k, t]) => '<button class="' + (k === b ? 'on' : '') + '" data-v="' + k + '">' + t + '</button>').join('') + '</div></div>' +
        (b === 'name' || b === 'greet' || b === 'salam' ? '<div class="li"><div class="grow"><div class="t">اسمك</div><div class="s">يظهر في التحية أعلى الشاشة (اختياري)</div></div><input class="hm-nm" id="hm-nm" maxlength="24" placeholder="اكتب اسمك" value="' + esc(Settings.userName || '') + '"></div>' : '') +
        HOME_TOP.map(sw).join('') + '</div>' +
      sec('الأقسام') + '<div class="list mx">' + HOME_SECS.map(sw).join('') + '</div>' +
      sec('الوصول السريع', { t: 'الافتراضي', attr: 'id="hm-qd"' }) + '<div class="sh-s mx" style="margin:-4px 16px 10px">اضغط لإضافة اختصار أو إزالته — يظهر بالترتيب الذي تختاره (من ٤ إلى ١٢)</div>' +
        '<div class="hm-q mx" id="hm-q">' + QUICK_ALL.map(([k, t, ic, hu]) => { const i = qk.indexOf(k);
          return '<button class="hm-qi' + (i >= 0 ? ' on' : '') + '" data-q="' + k + '"><span class="qi" style="' + hueVars(hu) + '">' + icon(ic) + '</span><b>' + t + '</b>' + (i >= 0 ? '<i class="num">' + N(i + 1) + '</i>' : '') + '</button>'; }).join('') + '</div>' +
      '<div class="mx" style="margin-top:18px"><button class="btn gold block" data-go="home">' + icon('home') + 'عرض الشاشة الرئيسية</button>' +
      '<button class="btn ghost block" id="hm-rs" style="margin-top:8px">' + icon('reset') + 'استعادة الشكل الافتراضي</button></div>';
  },
  mount(el) {
    $$('[data-hm]', el).forEach(b => b.onclick = () => { const k = b.dataset.hm, on = !hmOn(k); setHome(k, on); b.classList.toggle('on', on); vibrate(8); });
    $('#hm-br', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setHome('brand', b.dataset.v); vibrate(8); Router.refresh(); };
    const nm = $('#hm-nm', el); if (nm) nm.addEventListener('input', debounce(() => setSetting('userName', nm.value.trim().slice(0, 24)), 300));
    $('#hm-q', el).onclick = e => { const b = e.target.closest('[data-q]'); if (!b) return; const k = b.dataset.q; let q = quickKeys().slice(); const i = q.indexOf(k);
      if (i >= 0) { if (q.length <= 4) { toast('أبقِ ٤ اختصارات على الأقل'); return; } q.splice(i, 1); } else { if (q.length >= 12) { toast('١٢ اختصارًا هو الحد الأقصى'); return; } q.push(k); }
      setSetting('quick', q); vibrate(8); Router.refresh(); };
    const qd = $('#hm-qd', el); if (qd) qd.onclick = () => { setSetting('quick', null); Router.refresh(); };
    $('#hm-rs', el).onclick = () => confirmSheet('استعادة الشكل الافتراضي؟', 'تعود كل أجزاء الشاشة الرئيسية للظهور، والشعار، والاختصارات الأصلية.', 'نعم، استعد', () => { setSetting('home', {}); setSetting('quick', null); Router.refresh(); toast('عادت الرئيسية لشكلها الافتراضي'); });
  },
};
const shortDay = d => ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()];
function trackerCard(now) {
  let cells = '';
  for (let k = 6; k >= 0; k--) {
    const d = addDays(now, -k), c = Tracker.count(d);
    cells += '<div class="wd ' + (k === 0 ? 'today' : '') + '"><div class="ring">' + ringSVG(34, 4, c / 5, c === 5 ? 'var(--ok)' : 'var(--gold)') + '<b class="num">' + N(c) + '</b></div>' + shortDay(d) + '</div>';
  }
  const st = Tracker.streak(now);
  return '<div class="hc" id="h-track"><div class="week">' + cells + '</div><div class="row" style="margin-top:12px;justify-content:space-between;font-size:13px">' +
    '<span class="muted">' + icon('flame', '', 'width:16px;height:16px;display:inline-block;vertical-align:-3px;color:var(--warn)') + ' سلسلة متتالية: <b class="gold">' + (st ? pD(st) : N(0)) + '</b></span>' +
    '<button class="link gold" data-go="tracker" style="font-weight:600">سجل الصلوات</button></div></div>';
}
function upcomingOccasions(now, horizon) {
  const out = [];
  for (let k = 0; k <= horizon; k++) { const d = addDays(now, k), h = hijriOf(d), o = NoorEngine.occasionOn(h); if (o) out.push({ o, days: k, d, h }); }
  return out;
}

/* ═══════════════ الأذكار ═══════════════ */
const Azkar = {
  key() { return 'az.' + dayKey(new Date()); },
  st() { if (!this._s || this._k !== this.key()) { this._k = this.key(); this._s = Store.get(this._k, {}); } return this._s; },
  save() { Store.set(this._k, this._s); },
  left(cat, idx, n) { const c = this.st()[cat]; return c && c[idx] != null ? c[idx] : n; },
  setLeft(cat, idx, v) { const s = this.st(); s[cat] = s[cat] || {}; s[cat][idx] = v; this.save(); },
  reset(cat) { const s = this.st(); delete s[cat]; this.save(); },
  progress(A) { let done = 0; A.items.forEach((it, i) => { if (this.left(A.id, i, it.n) <= 0) done++; }); return { done, total: A.items.length }; },
  cleanup() { try { const keep = 'noor2.' + this.key(); Object.keys(localStorage).forEach(k => { if (k.startsWith('noor2.az.') && k !== keep) localStorage.removeItem(k); }); } catch (e) {} },
};
SCREENS.azkar = {
  tab: 'azkar',
  render() {
    const now = new Date(), cur = currentAzkarCat(now);
    const cats = NOOR_DATA.AZKAR;
    const big = cats.find(c => c.id === cur), pr = Azkar.progress(big);
    return hdr('الأذكار والأدعية', 'من الكتاب والسنّة الصحيحة — حصن المسلم') +
      '<button class="hc feature-hc" style="display:block;width:calc(100% - 32px);text-align:right;margin-top:16px" data-go="azkarList" data-a=\'{"id":"' + big.id + '"}\'>' +
      '<div class="cr"><div class="ico">' + kwIcon(big.icon, big.id === 'prayer' ? 'prayer' : null, 30) + '</div><div class="grow"><div class="muted" style="font-size:12px">المناسب لوقتك الآن</div>' +
      '<div style="font-weight:700;font-size:19px">' + esc(big.title) + '</div><div class="muted" style="font-size:12.5px">' + esc(big.sub) + '</div></div>' + icon('chev') + '</div>' +
      '<div class="row" style="margin-top:12px;gap:10px"><div class="progress grow"><i style="width:' + Math.round(pr.done / pr.total * 100) + '%"></i></div><span class="num" style="font-size:12px;color:var(--gold-2)">' + N(pr.done) + '/' + N(pr.total) + '</span></div></button>' +
      sec('جميع الأقسام') + '<div class="azc-grid stagger">' + cats.map(c => {
        const p = Azkar.progress(c);
        return '<button class="azc" data-go="azkarList" data-a=\'{"id":"' + c.id + '"}\' style="' + hueVars(c.hue) + '"><div class="ic' + (curSkin() && curSkin().stickers ? ' ic-emo' : '') + '">' + kwIcon(c.icon, c.id === 'prayer' ? 'prayer' : null, 28) + '</div>' +
          (p.done ? '<span class="prog num">' + N(p.done) + '/' + N(p.total) + '</span>' : '') + '<div><div class="t">' + esc(c.title) + '</div><div class="s">' + esc(c.sub) + '</div></div></button>';
      }).join('') + '</div>' +
      sec('أدوات الذكر') + '<div class="list mx">' +
      '<button class="li" data-go="tasbih"><div class="ic">' + kwIcon('beads') + '</div><div class="grow"><div class="t">المسبحة الإلكترونية</div><div class="s">عدّاد مع أهداف وإحصاءات يومية</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="popz"><div class="ic g">' + icon('bell') + '</div><div class="grow"><div class="t">الأذكار المنبثقة</div><div class="s">' + esc(PopZ.get().on ? PopZ.status() : 'ذكرٌ لطيف يظهر لك في أوقات تختارها') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="istighfar"><div class="ic g">' + kwIcon('heart') + '</div><div class="grow"><div class="t">وِرد الاستغفار</div><div class="s">مئة استغفار يوميًا</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="names"><div class="ic">' + kwIcon('star8') + '</div><div class="grow"><div class="t">أسماء الله الحسنى</div><div class="s">تسعة وتسعون اسمًا مع معانيها</div></div><div class="end">' + icon('chev') + '</div></button></div>';
  },
};
SCREENS.azkarList = {
  parent: 'azkar',
  render(a) {
    const A = NOOR_DATA.AZKAR.find(x => x.id === a.id) || NOOR_DATA.AZKAR[0];
    this.A = A;
    const needQ = A.items.some(it => it.q);
    if (needQ && !Q.ready) return hdr(A.title, A.sub, { back: true, compact: true }) + '<div class="mx mt">' + '<div class="skel" style="height:140px"></div>'.repeat(3) + '</div>';
    const pr = Azkar.progress(A);
    return hdr(A.title, N(A.items.length) + ' ذكرًا · ' + esc(A.sub), { back: true, compact: true, actions: [{ id: 'z-fs', icon: 'text', label: 'حجم الخط' }] }) +
      '<div class="zbar"><div class="progress g"><i id="z-p" style="width:' + (pr.done / pr.total * 100) + '%"></i></div><span class="num faint" id="z-c" style="font-size:12.5px;font-weight:700">' + N(pr.done) + '/' + N(pr.total) + '</span></div>' +
      '<div id="z-list" style="--zfs:' + Settings.zfs + 'px">' + A.items.map((it, i) => zkCard(A, it, i)).join('') + '</div>' +
      '<div class="mx" style="margin-bottom:10px"><button class="btn ghost block" id="z-reset">' + icon('refresh') + 'إعادة القراءة من البداية</button></div>';
  },
  mount(el, a) {
    const A = this.A;
    if (A.items.some(it => it.q) && !Q.ready) { loadQuran().then(() => Router.refresh()); return; }
    $('#z-list', el).addEventListener('click', e => {
      const b = e.target.closest('[data-z]'); if (!b) return;
      const i = +b.dataset.z, it = A.items[i]; let left = Azkar.left(A.id, i, it.n);
      if (left <= 0) return;
      left--; Azkar.setLeft(A.id, i, left); vibrate(left ? 12 : 45);
      const card = b.closest('.zk');
      b.innerHTML = left ? '<span class="num">' + N(left) + '</span>' : icon('check');
      if (!left) Growth.add('az', 1);
      if (!left) { card.classList.add('done'); const nx = card.nextElementSibling; if (nx) setTimeout(() => window.scrollTo({ top: nx.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' }), 260); }
      const pr = Azkar.progress(A); $('#z-p').style.width = (pr.done / pr.total * 100) + '%'; $('#z-c').textContent = N(pr.done) + '/' + N(pr.total);
      if (pr.done === pr.total && !left) { toast('أتممت ' + A.title + ' — تقبّل الله منك'); if (Growth.session(A.id)) Habits.syncAuto(); }
    });
    $('#z-list', el).addEventListener('click', e => {
      const b = e.target.closest('[data-zc]'); if (!b) return; const it = A.items[+b.dataset.zc];
      copyText(zkText(it) + (it.src ? '\n[' + it.src + ']' : ''));
    });
    $('#z-reset', el).onclick = () => { Azkar.reset(A.id); Router.refresh(); window.scrollTo(0, 0); };
    $('#z-fs', el).onclick = () => {
      const html = '<div class="sh-t">حجم خط الأذكار</div><div class="mx"><input type="range" min="16" max="30" value="' + Settings.zfs + '" id="zf"><div id="zpv" style="font-family:var(--font-d);font-size:' + Settings.zfs + 'px;text-align:center;line-height:2">سُبْحَانَ اللَّهِ وَبِحَمْدِهِ</div></div>';
      Sheet.open(html, sh => { const r = $('#zf', sh); const u = () => r.style.setProperty('--p', ((r.value - 16) / 14 * 100) + '%'); u();
        r.oninput = () => { u(); setSetting('zfs', +r.value); $('#zpv', sh).style.fontSize = r.value + 'px'; const zl = $('#z-list'); if (zl) zl.style.setProperty('--zfs', r.value + 'px'); }; });
    };
  },
};
function zkText(it) { return it.q ? quranText(it.q[0], it.q[1], it.q[2]).join(' ') : it.t; }
function zkCard(A, it, i) {
  const left = Azkar.left(A.id, i, it.n), done = left <= 0;
  let body;
  if (it.q) { const parts = quranText(it.q[0], it.q[1], it.q[2]);
    body = (it.pre ? '<div class="pre">' + esc(it.pre) + '</div>' : '') + '<div class="tx qt">' + parts.map(x => { const p = x.lastIndexOf(' '); return esc(qd(x.slice(0, p))) + ' <span class="an gold">' + x.slice(p + 1) + '</span>'; }).join(' ') + '</div>' +
      '<div class="faint center" style="font-size:11.5px;margin-top:2px">[' + esc(Q.S[it.q[0] - 1].name) + ': ' + N(it.q[1]) + (it.q[2] > it.q[1] ? '–' + N(it.q[2]) : '') + ']</div>';
  } else body = '<div class="tx">' + esc(it.t) + '</div>';
  return '<div class="zk ' + (done ? 'done' : '') + '">' + (it.title ? '<div class="zt">' + icon('sparkle', '', 'width:15px;height:15px') + esc(it.title) + '</div>' : '') + body +
    (it.fadl ? '<div class="fd">' + icon('info', '', 'width:15px;height:15px;display:inline-block;vertical-align:-3px;color:var(--brand-tx)') + ' ' + esc(it.fadl) + '</div>' : '') +
    '<div class="ft"><div class="src">' + (it.n > 1 ? '<span class="pill">' + plural(it.n, 'مرة', 'مرتان', 'مرات', 'مرة') + '</span> ' : '') + esc(it.src || '') + '</div>' +
    '<button class="act" data-zc="' + i + '" aria-label="نسخ">' + icon('copy') + '</button>' +
    '<button class="cnt" data-z="' + i + '">' + (done ? icon('check') : '<span class="num">' + N(left) + '</span>') + '</button></div></div>';
}

/* ═══════════════ المسبحة ═══════════════ */
/** وسن 6 · صوت المسبحة: أصوات طبيعية، وصوت الشيخ عند تمام الدورة، ومستوى الصوت، وتنبيه إن كان صوت الوسائط مكتومًا */
Bus.on('resume', () => { if (Settings.tasVolKey && Router.cur && Router.cur.r === 'tasbih' && Native.has('setVolumeCount')) Native.call('setVolumeCount', true); });
function stripTashkeel(s) { return String(s || '').replace(/[\u064B-\u0652\u0670]/g, ''); }
function tasSoundSheet(done) {
  const draw = sh => {
    const cur = tasSnd(), mv = Native.has('mediaVolume') ? +Native.call('mediaVolume') : -1, vo = Settings.tasVoice !== false;
    sh.innerHTML = '<div class="grab"></div><div class="sh-t">صوت المسبحة</div><div class="sh-s">أصوات طبيعية هادئة كحبّات المسبحة في يدك — بلا موسيقى</div>' +
      (mv === 0 ? '<div class="geo-n mx">' + icon('warn') + '<div class="grow"><b>صوت الوسائط في هاتفك مكتوم</b><span>ارفعه بزرّ الصوت الجانبي — أزرار الصوت داخل وسن تضبطه مباشرة</span></div></div>' : '') +
      '<div class="list mx" id="tss-l" style="margin-top:10px">' + Object.keys(TAS_SND).map(v => '<button class="li opt' + (v === cur ? ' on' : '') + '" data-v="' + v + '"><div class="ic">' + icon(v === 'off' ? 'x' : 'vol') + '</div><div class="grow"><div class="t">' + TAS_SND[v] + '</div></div>' + (v === cur ? icon('check') : '') + '</button>').join('') + '</div>' +
      '<div class="list mx" style="margin-top:10px"><button class="li" id="tss-v"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">صوت الشيخ فارس عبّاد عند تمام الدورة</div><div class="s">يقول الذكر نفسه (أستغفر الله، الحمد لله، الله أكبر، سبحان الله وبحمده، الصلاة على النبي ﷺ)</div></div>' +
      '<span class="switch ' + (vo ? 'on' : '') + '"></span></button></div>' +
      '<div class="mx form" style="margin-top:12px"><label>مستوى الصوت</label><input type="range" id="tss-vol" min="0.1" max="1" step="0.05" value="' + (+Settings.tasVol || 0.7) + '"></div>' +
      '<div class="row mx" style="gap:10px;margin-top:14px"><button class="btn ghost grow" id="tss-try">' + icon('play') + 'تجربة</button><button class="btn gold grow" id="tss-ok">تم</button></div>';
    $('#tss-l', sh).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setSetting('tasSnd', b.dataset.v); TasSound.play(b.dataset.v); draw(sh); };
    $('#tss-v', sh).onclick = () => { setSetting('tasVoice', !(Settings.tasVoice !== false)); draw(sh); if (Settings.tasVoice !== false) DhikrVoice.play('hm', +Settings.tasVol || .9); };
    $('#tss-vol', sh).oninput = e => { Settings.tasVol = +e.target.value; };
    $('#tss-vol', sh).onchange = e => { setSetting('tasVol', +e.target.value); TasSound.play(); };
    $('#tss-try', sh).onclick = () => { TasSound.play(); setTimeout(() => TasSound.play(), 260); setTimeout(() => TasSound.play(null, true), 620); };
    $('#tss-ok', sh).onclick = () => Sheet.close(done);
  };
  Sheet.open('', sh => draw(sh), done);
}
const TAS_SND = { bead: 'حبّة خشبية', clack: 'حبّتان', stone: 'حبّة حجرية', knock: 'طرقة خشب', drop: 'قطرة ماء', soft: 'نقرة ناعمة', off: 'بلا صوت' };   // وسن 6: لا نغمات موسيقية
// وسن 4.8: ثلاثة أشكال للمسبحة
const TAS_STY = { ring: ['دائرة الحبّات', 'اضغط على الدائرة'], real: ['مسبحة حقيقية', 'اسحب الحبّة بإصبعك كما في يدك'], string: ['خيط الحبّات', 'اسحب الحبّة للأسفل أو اضغط'], press: ['عدّاد كبير', 'اضغط في أي مكان من البطاقة'] };
const tasSty = () => TAS_STY[Settings.tasStyle] ? Settings.tasStyle : 'ring';
const TB = Object.assign({ sel: 0, count: 0, cycles: 0, total: 0, today: 0, day: '', custom: [], targets: {} }, Store.get('tasbih', {}));
(function migrateOld() { try { const o = localStorage.getItem('noor_tasbih'); if (o && !Store.get('tasbih', null)) { const v = JSON.parse(o); TB.total = v.total || 0; TB.cycles = v.cycles || 0; } } catch (e) {} })();
const tbSave = () => Store.set('tasbih', TB);
const tbList = () => NOOR_DATA.TASBIH.concat(TB.custom || []);
const tbTarget = () => { const d = tbList()[TB.sel] || tbList()[0]; if (Settings.tasSeq && TB.sel <= 2) return d.n; const t = TB.targets[TB.sel]; return t != null ? t : d.n; };
/* ── مسبحة الحبّات: خيط عمودي، حبّات تنزلق من الأعلى إلى الأسفل، وفواصل ذهبية بعد ١١ و٢٢ ── */
const STR = { n: 22, r: 14, sp: 1.5, gt: 132, gb: 238, cx: 150 };
function tbsCols() {
  const sk = curSkin(), b = sk && (sk.strand || sk.beads), dark = themeBase() === 'dark';
  return b || (dark ? ['#FFE7B8', '#D9A04A', '#8A5A1E'] : ['#F6E2C8', '#B8834E', '#6E4526']);
}
function strandSVG() {
  const c = tbsCols(), S = STR; let s = '<svg class="tbs-svg" viewBox="0 0 300 370" id="t-str" aria-hidden="true"><defs>' +
    '<radialGradient id="sbG" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient>' +
    '<radialGradient id="sbS" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF8DA"/><stop offset=".5" stop-color="#E8C067"/><stop offset="1" stop-color="#8A6220"/></radialGradient>' +
    '<linearGradient id="sbM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<mask id="sbK"><rect width="300" height="370" fill="url(#sbM)"/></mask></defs><g mask="url(#sbK)">' +
    '<path class="tbs-cord" d="M150 -10C146 120 154 250 150 380"/>';
  for (let k = 0; k < S.n; k++) s += '<g class="sb" data-k="' + k + '"><circle class="sbb" r="' + S.r + '" fill="url(#sbG)"/><ellipse cx="-4.6" cy="-5.4" rx="4.4" ry="3.2" fill="#fff" opacity=".5"/><circle r="' + S.r + '" fill="none" stroke="rgba(0,0,0,.18)" stroke-width=".8"/></g>';
  return s + '</g><path class="tbs-gap" d="M122 ' + (S.gt + 8) + 'Q150 ' + ((S.gt + S.gb) / 2) + ' 178 ' + (S.gb - 8) + '" /></svg>';
}
SCREENS.tasbih = {
  parent: 'more',
  render(a) {
    if (TB.day !== dayKey(new Date())) { TB.day = dayKey(new Date()); TB.today = 0; tbSave(); }
    // وسن 4.7: فتح المسبحة من «الأذكار المنبثقة» على الذكر نفسه وبعدده (مرة واحدة لكل فتح)
    if (a && a.t && !a._on) { a._on = 1; const k = normAr(a.t); let i = tbList().findIndex(x => normAr(x.t) === k);
      if (i < 0) { TB.custom = (TB.custom || []).concat([{ t: a.t, n: +a.n || 0 }]); i = tbList().length - 1; }
      TB.sel = i; if (+a.n) TB.targets[i] = +a.n; TB.count = 0; tbSave(); }
    const L = tbList(); if (TB.sel >= L.length) TB.sel = 0;
    const d = L[TB.sel], tg = tbTarget(), st = tasSty(), cnt = '<span class="cn" id="t-n">' + N(TB.count) + '</span><span class="ct" id="t-t">' + (tg ? 'من ' + N(tg) : 'بلا حدّ') + '</span><span class="lp" id="t-loop"></span>';
    let main;
    if (st === 'string') main = '<div class="tbs" id="t-btn" role="button" tabindex="0" aria-label="تسبيح">' + strandSVG() + '<span class="ripple" id="t-rip"></span><div class="tbs-c">' + cnt + '</div></div>';
    else if (st === 'real') { const bm = MISBAHA_MATS[Settings.beadMat] ? Settings.beadMat : 'wood';
      main = '<div class="tbr" id="t-btn" role="button" tabindex="0" aria-label="تسبيح"><canvas id="t-real"></canvas><div class="tbr-c">' + cnt + '</div>' +
        (Settings.mbHint ? '' : '<div class="tbr-hint" id="t-hint">' + icon('chev', '', 'transform:rotate(-90deg)') + 'اسحب الحبّة للأسفل</div>') + '</div>' +
        '<div class="chips tbr-mats" id="t-mat">' + Object.keys(MISBAHA_MATS).map(k => '<button class="chip ' + (k === bm ? 'on' : '') + '" data-m="' + k + '"><i class="mdot mdot-' + k + '"></i>' + MISBAHA_MATS[k].n + '</button>').join('') + '</div>'; }
    else if (st === 'press') main = '<button class="tbp" id="t-btn" aria-label="تسبيح"><span class="ripple" id="t-rip"></span>' + cnt + '<span class="tbp-h">' + icon('beads') + 'اضغط للتسبيح</span></button>';
    else main = '<button class="counter" id="t-btn" aria-label="تسبيح">' + (artKey() ? '<img class="kw-tb" src="' + Art.tbURI(artKey()) + '" alt="" aria-hidden="true" draggable="false">' : '') + beadsSVG(tbBeads(tg)) + '<span class="ripple" id="t-rip"></span>' + cnt + '</button>';
    return hdr('المسبحة', TAS_STY[st][1], { back: true, compact: true, actions: [{ id: 't-reset', icon: 'refresh', label: 'تصفير' }] }) +
      '<div class="chips" id="t-chips" style="margin-top:14px">' + L.map((x, i) => '<button class="chip ' + (i === TB.sel ? 'on' : '') + '" data-i="' + i + '">' + esc(x.t) + '</button>').join('') +
      '<button class="chip" id="t-add">' + icon('plus', '', 'width:16px;height:16px') + 'ذكر خاص</button></div>' +
      '<div class="seg tb-sty mx" id="t-sty">' + Object.keys(TAS_STY).map(k => '<button data-v="' + k + '" class="' + (k === st ? 'on' : '') + '">' + TAS_STY[k][0] + '</button>').join('') + '</div>' +
      '<div class="tb-wrap tb-' + st + '"><div class="tb-dhikr" id="t-d">' + esc(d.t) + '</div>' + main + '</div>' +
      '<div class="stat3 mx" style="margin-top:22px"><div class="stat"><b class="num" id="t-cy">' + N(TB.cycles) + '</b><span>الدورات</span></div>' +
      '<div class="stat"><b class="num" id="t-td">' + fmtInt(TB.today) + '</b><span>اليوم</span></div><div class="stat"><b class="num" id="t-tt">' + fmtInt(TB.total) + '</b><span>الإجمالي</span></div></div>' +
      '<div class="tb-tools"><button class="act' + (Settings.tasSeq ? ' on' : '') + '" id="t-seq">' + icon('list') + 'دبر الصلاة</button><button class="act" id="t-undo">' + icon('undo') + 'تراجع</button>' + (Native.has('setVolumeCount') ? '<button class="act' + (Settings.tasVolKey ? ' on' : '') + '" id="t-vk">' + icon('vol') + 'العدّ بزر الصوت</button>' : '') + '<button class="act" id="t-tg">' + icon('target') + 'الهدف</button><button class="act" id="t-sd">' + icon('vol') + (TAS_SND[tasSnd()] || TAS_SND.off) + '</button><button class="act" id="t-vb">' + icon('vib') + (Settings.vibrate ? 'الاهتزاز مفعّل' : 'الاهتزاز متوقف') + '</button></div>';
  },
  mount(el) {
    const st = tasSty(), btn = $('#t-btn', el);
    this._o = 0;
    if (st === 'string') { this.layout(false); this.bindStrand(btn); }
    else if (st === 'real') {   // وسن 5: مسبحة حقيقية بالفيزياء
      Misbaha.init($('#t-real', el), { count: TB.count, mat: Settings.beadMat || 'wood', cx: .58, onCount: () => this.inc(), onFirst: () => { if (!Settings.mbHint) { setSetting('mbHint', 1); const h = $('#t-hint'); if (h) h.remove(); } } });
      btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Misbaha.release(560); } });
      $('#t-mat', el).onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; setSetting('beadMat', b.dataset.m); Misbaha.setMat(b.dataset.m); $$('#t-mat .chip', el).forEach(x => x.classList.toggle('on', x === b)); try { BeadSound.click(MISBAHA_MATS[b.dataset.m].snd, .7); } catch (er) {} vibrate(6); };
    }
    else btn.addEventListener('pointerdown', e => { e.preventDefault(); this.inc(); });
    this.paint();
    $('#t-chips', el).onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; TB.sel = +b.dataset.i; TB.count = 0; tbSave(); Router.refresh(); };
    $('#t-sty', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; setSetting('tasStyle', b.dataset.v); vibrate(8); Router.refresh(); };
    $('#t-reset', el).onclick = () => { TB.count = 0; tbSave(); this.paint(); toast('تم تصفير العدّاد'); };
    // وسن 6: تسبيح دبر الصلاة (٣٣ + ٣٣ + ٣٤ تلقائيًّا)، والتراجع عن ضغطة خاطئة، والعدّ بأزرار الصوت
    $('#t-seq', el).onclick = () => { const on = !Settings.tasSeq; setSetting('tasSeq', on); if (on) { TB.sel = 0; TB.count = 0; tbSave(); toast('تسبيح دبر الصلاة: سبحان الله ٣٣، الحمد لله ٣٣، الله أكبر ٣٤'); } Router.refresh(); };
    $('#t-undo', el).onclick = () => { if (TB.count <= 0) { toast('لا شيء للتراجع عنه'); return; } TB.count--; TB.today = Math.max(0, TB.today - 1); TB.total = Math.max(0, TB.total - 1); try { Growth.add('tas', -1); } catch (e) {} tbSave(); vibrate(8);
      if (tasSty() === 'real') Router.refresh(); else { if (tasSty() === 'string') { this._o = (this._o || 0) - 1; this.layout(false); } this.paint(); } };
    const vk = $('#t-vk', el); if (vk) vk.onclick = () => { const on = !Settings.tasVolKey; setSetting('tasVolKey', on); Native.call('setVolumeCount', on); toast(on ? 'اضغط زر الصوت للتسبيح دون النظر إلى الشاشة' : 'عادت أزرار الصوت لضبط الصوت'); Router.refresh(); };
    if (Settings.tasVolKey) Native.call('setVolumeCount', true);
    window.onVolKey = () => { if (!(Router.cur && Router.cur.r === 'tasbih')) return; if (tasSty() === 'real') { try { Misbaha.release(560); } catch (e) { this.inc(); } } else this.inc(); };
    Native.call('keepScreenOn', true);
    $('#t-vb', el).onclick = () => { setSetting('vibrate', !Settings.vibrate); Router.refresh(); };
    $('#t-sd', el).onclick = () => tasSoundSheet(() => Router.refresh());
    $('#t-tg', el).onclick = () => pickSheet('الهدف', 'عدد التسبيحات في الدورة الواحدة', [33, 34, 99, 100, 500, 1000, 0].map(v => ({ v, t: v ? N(v) + ' تسبيحة' : 'بلا حدّ (عدّ مفتوح)' })), tbTarget(),
      v => { TB.targets[TB.sel] = v; TB.count = 0; tbSave(); Router.refresh(); });
    $('#t-add', el).onclick = () => {
      Sheet.open('<div class="sh-t">إضافة ذكر خاص</div><div class="mx form-g"><div><label>نص الذكر</label><input class="field" id="c-t" placeholder="مثال: سبحان الله العظيم"></div>' +
        '<div><label>العدد المستهدف</label><input class="field" id="c-n" type="number" inputmode="numeric" value="100"></div><button class="btn primary block" id="c-ok">إضافة</button></div>', sh => {
        $('#c-ok', sh).onclick = () => { const t = $('#c-t', sh).value.trim(), n = clamp(parseInt($('#c-n', sh).value, 10) || 0, 0, 100000); if (!t) { toast('اكتب نص الذكر'); return; }
          TB.custom = (TB.custom || []).concat([{ t, n }]); TB.sel = tbList().length - 1; TB.count = 0; tbSave(); Sheet.close(() => Router.refresh()); };
      });
    };
  },
  /* سحب الحبّة: ضغطة قصيرة = تسبيحة، والسحب للأسفل = تسبيحة لكل مسافة حبّة */
  bindStrand(btn) {
    let y0 = null, acc = 0, moved = false;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); y0 = e.clientY; acc = 0; moved = false; try { btn.setPointerCapture(e.pointerId); } catch (er) {} });
    btn.addEventListener('pointermove', e => { if (y0 == null) return; const dy = e.clientY - y0; if (Math.abs(dy) > 8) moved = true;
      if (dy > 0) { const step = STR.r * 2.4; while (dy - acc >= step) { acc += step; this.inc(); } } });
    const up = () => { if (y0 != null && !moved) this.inc(); y0 = null; };
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', () => { y0 = null; });
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.inc(); } });
  },
  /* مواضع الحبّات: p < 0 فوق الفجوة، p ≥ 0 تحتها. كل تسبيحة تنقل الحبّة الأولى عبر الفجوة */
  layout(anim) {
    const S = STR, gs = $$('#t-str .sb'); if (!gs.length) return;
    const half = S.n / 2, o = this._o || 0, c0 = TB.total;
    gs.forEach((g, k) => {
      let p = ((k + o) % S.n + S.n) % S.n - half;               // −half … half−1
      const y = p < 0 ? S.gt - S.r - (-p - 1) * (2 * S.r + S.sp) : S.gb + S.r + p * (2 * S.r + S.sp);
      const num = p < 0 ? c0 + (-p - 1) : c0 - 1 - p, sep = ((num % 33) + 33) % 33 === 10 || ((num % 33) + 33) % 33 === 21;
      const prev = g.dataset.p != null ? +g.dataset.p : null, wrap = prev != null && prev > p;   // حبّة عادت إلى الأعلى (إعادة تدوير بلا حركة)
      g.classList.toggle('x', !!anim && p === 0 && prev === -1); g.classList.toggle('nt', !anim || wrap);
      g.classList.toggle('sep', sep); g.dataset.p = p;
      g.style.transform = 'translate(' + S.cx + 'px,' + y.toFixed(1) + 'px)' + (sep ? ' scale(1.08)' : '');
      const b = g.querySelector('.sbb'); if (b) b.setAttribute('fill', sep ? 'url(#sbS)' : 'url(#sbG)');
    });
  },
  inc() {
    const tg = tbTarget(); TB.count++; TB.today++; TB.total++; Growth.add('tas', 1);
    let done = false; if (tg && TB.count >= tg) { TB.cycles++; done = true; TB.count = 0; }
    tbSave(); clearTimeout(this._hold);
    if (tasSty() === 'string') { this._o = (this._o || 0) + 1; this.layout(true); }
    this.paint(done, done ? tg : null);
    const real = tasSty() === 'real';
    if (!real && !done) try { TasSound.play(); } catch (e) {}   // في المسبحة الحقيقية تكفي طقطقة الحبّات
    if (done) { const vk = Settings.tasVoice === false ? '' : voiceKeyOf((tbList()[TB.sel] || {}).t);   // وسن 6: تمام الدورة بصوت الشيخ فارس عبّاد
      try { TasSound.play(null, true); } catch (e) {} if (vk && tasSnd() !== 'off') setTimeout(() => DhikrVoice.play(vk, +Settings.tasVol || .9), 420); }
    if (!real) try { kwPop(artKey(), done); } catch (e) {}
    const rp = $('#t-rip'); if (rp) { rp.classList.remove('go'); void rp.offsetWidth; rp.classList.add('go'); }
    const b = $('#t-btn'); if (b) { b.classList.remove('tap'); void b.offsetWidth; b.classList.add('tap'); }
    if (done) { vibrate(220); if (b) { b.classList.remove('done'); void b.offsetWidth; b.classList.add('done'); }
      if (Settings.tasSeq && TB.sel <= 2) {   // الانتقال التلقائي في تسبيح دبر الصلاة
        const L = tbList();
        if (TB.sel < 2) { TB.sel++; tbSave(); toast('أحسنت — التالي: ' + stripTashkeel(L[TB.sel].t)); setTimeout(() => Router.refresh(), 900); }
        else { TB.sel = 0; tbSave(); toast('تمّت المئة — «لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»', 5200); setTimeout(() => Router.refresh(), 1400); }
      } else toast('أتممت ' + N(tg) + ' — بارك الله فيك');
      this._hold = setTimeout(() => this.paint(), 650); }
    else if (!real) vibrate(14);
  },
  leave() { try { Misbaha.destroy(); } catch (e) {} if (Native.has('setVolumeCount')) Native.call('setVolumeCount', false); window.onVolKey = null; if (!(window.Player && Player.on)) Native.call('keepScreenOn', false); },
  paint(done, show) {
    const tg = tbTarget(), n = $('#t-n'); if (!n) return;
    const c = show != null ? show : TB.count;
    n.textContent = N(c);
    const nb = tbBeads(tg), lit = c === 0 ? 0 : (c % nb === 0 ? nb : c % nb);
    $$('#t-btn .bd').forEach((b, i) => { b.classList.toggle('on', i < lit); b.classList.toggle('cur', i === lit - 1); });
    const lp = $('#t-loop'); if (lp) lp.textContent = tg && tg > nb && tasSty() === 'ring' ? 'الجولة ' + N(Math.min(Math.ceil(c / nb) || 1, Math.ceil(tg / nb))) + ' من ' + N(Math.ceil(tg / nb)) : (tg && tasSty() !== 'ring' ? N(Math.round(c / tg * 100)) + '٪' : '');
    if (done) { const s = $('#t-btn'); if (s) { s.classList.remove('bloom'); void s.offsetWidth; s.classList.add('bloom'); const r = s.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2); } }
    $('#t-cy').textContent = N(TB.cycles); $('#t-td').textContent = fmtInt(TB.today); $('#t-tt').textContent = fmtInt(TB.total);
  },
};
/* عدد حبّات المسبحة المرسومة حسب الهدف */
function tbBeads(tg) { if (tg && tg <= 40) return tg; if (tg && tg % 33 === 0) return 33; if (tg && tg % 25 === 0) return 25; return 33; }
/* حبّات المسبحة حول الدائرة، تبدأ من «نجمة وسن» في الأعلى وتدور عكس عقارب الساعة */
function beadsSVG(n) {
  const R = 141, slots = n + 1, r = Math.min(8.4, Math.PI * R / slots * 0.62);
  const cs = getComputedStyle(document.documentElement), gv = (v, d) => cs.getPropertyValue(v).trim() || d;
  const bc = (curSkin() && curSkin().beads) || [gv('--gold-2', '#FFF4CF'), gv('--gold', '#E6C274'), gv('--gold-3', '#A97E30')];   // وسن 5: ذهب الثيم نفسه   // وسن 4.5: حبّات بلون المشهد (لؤلؤ وردي، ذهب وردي، جمشت)
  let s = '<svg class="ringsvg beads" viewBox="0 0 300 300"><defs><radialGradient id="bdG" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + bc[0] + '"/><stop offset=".55" stop-color="' + bc[1] + '"/><stop offset="1" stop-color="' + bc[2] + '"/></radialGradient></defs>';
  const ak = artKey();   // وسن 4.6: حبّات مرسومة — لؤلؤ أزرق، لؤلؤ وردي، نجوم ذهبية، فراولات صغيرة، لؤلؤ ملوّن
  if (ak) {
    if (ak === 'kbloom') s = s.replace('</defs>', [['#FFFBE6', '#FFE08A', '#F2B53A'], ['#F7F1FF', '#D6C2FF', '#9E7BE6'], ['#F0FFF6', '#B5EBCB', '#5FBF8A']].map((c, j) => '<radialGradient id="bdG' + (j + 1) + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></radialGradient>').join('') + '</defs>');
    const pos = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - (i + 1) * 2 * Math.PI / slots; pos.push([150 + R * Math.cos(a), 150 + R * Math.sin(a)]); }
    return s + Art.beads(ak, pos, r) + Art.beadTop(ak, 150, 150 - R, ak === 'kstar' ? 26 : 31) + '</svg>';
  }
  const sk = curSkin(), be = sk && sk.beadEmo;   // وسن 4.5: حبّات على هيئة رمز الثيم (فراولة، نجوم، ورود، أزهار، فراشات)
  if (be) { const z = 30; s += '<image class="bd-top" href="' + emo(sk.beadTop || be[0]) + '" x="' + (150 - z / 2) + '" y="' + (150 - R - z / 2) + '" width="' + z + '" height="' + z + '"/>'; }
  else s += '<path class="bd-star" d="' + starD(150, 150 - R, 11.5, 0.76, Math.PI / 8) + '"/>';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 - (i + 1) * 2 * Math.PI / slots, x = 150 + R * Math.cos(a), y = 150 + R * Math.sin(a);
    if (be) { const z = Math.min(24, r * 2.9), hu = sk.beadHue ? KW_HUE[sk.beadHue[i % sk.beadHue.length]] : '';
      s += '<image class="bd" href="' + emo(be[i % be.length]) + '" x="' + (x - z / 2).toFixed(1) + '" y="' + (y - z / 2).toFixed(1) + '" width="' + z.toFixed(1) + '" height="' + z.toFixed(1) + '"' + (hu ? ' style="--hf:' + hu + '"' : '') + '/>'; }
    else s += '<circle class="bd" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '"/>';
  }
  return s + '</svg>';
}

/* ═══════════════ القبلة ═══════════════ */
const QB = { heading: null, acc: 0, last: null, src: '', qn: null, aligned: false, onDev: null };
function dialSVG(qb) {
  let tk = '';
  for (let d = 0; d < 360; d += 5) {
    const long = d % 30 === 0, r1 = 139, r2 = long ? 126 : 132, a = (d - 90) * Math.PI / 180;
    tk += '<line x1="' + (150 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (150 + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (150 + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (150 + r2 * Math.sin(a)).toFixed(1) +
      '" stroke="' + (long ? 'var(--gold)' : 'var(--line-2)') + '" stroke-width="' + (long ? 2 : 1.2) + '" stroke-linecap="round"/>';
    if (long && d % 90) { const r = 112; tk += '<text x="' + (150 + r * Math.cos(a)).toFixed(1) + '" y="' + (150 + r * Math.sin(a) + 4).toFixed(1) + '" text-anchor="middle" font-size="11" fill="var(--tx-3)" font-family="Plex">' + N(d) + '</text>'; }
  }
  const card = [['ش', 0, '#E0675C'], ['ق', 90, 'var(--tx-2)'], ['ج', 180, 'var(--tx-2)'], ['غ', 270, 'var(--tx-2)']].map(([t, d, c]) => {
    const a = (d - 90) * Math.PI / 180, r = 110; return '<text x="' + (150 + r * Math.cos(a)).toFixed(1) + '" y="' + (150 + r * Math.sin(a) + 6).toFixed(1) + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + c + '" font-family="Plex">' + t + '</text>';
  }).join('');
  const kaaba = '<g transform="rotate(' + qb.toFixed(2) + ' 150 150)"><line x1="150" y1="150" x2="150" y2="62" stroke="url(#qn)" stroke-width="5" stroke-linecap="round"/>' +
    '<g transform="translate(131 20)"><rect x="0" y="0" width="38" height="38" rx="11" fill="#0B5D4B" stroke="var(--gold)" stroke-width="1.6"/>' +
    '<g transform="translate(7 7) scale(1)" fill="none" stroke="#F0DCA3" stroke-width="1.8" stroke-linejoin="round">' + ICONS.kaaba + '</g></g></g>';
  return '<svg viewBox="0 0 300 300"><defs><linearGradient id="qn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#B08738" stop-opacity=".2"/><stop offset="1" stop-color="#EAD39B"/></linearGradient>' +
    '<radialGradient id="dg" cx=".5" cy=".45"><stop offset="0" stop-color="var(--card-2)"/><stop offset="1" stop-color="var(--card)"/></radialGradient></defs>' +
    '<circle cx="150" cy="150" r="148" fill="url(#dg)" stroke="var(--line-2)" stroke-width="1.5"/><circle cx="150" cy="150" r="96" fill="none" stroke="var(--line)" stroke-dasharray="2 5"/>' +
    '<g class="rose" id="q-rose" style="transform-origin:150px 150px">' + tk + card + kaaba + '</g>' +
    '<path d="M150 2 l9 15 h-18z" fill="var(--gold)" id="q-ptr"/><circle cx="150" cy="150" r="9" fill="var(--gold)"/><circle cx="150" cy="150" r="4" fill="var(--card)"/></svg>';
}
SCREENS.qibla = {
  parent: 'more',
  render() {
    const l = Loc.eff(), qb = NoorEngine.qibla(l.lat, l.lng), dist = NoorEngine.kaabaDistance(l.lat, l.lng);
    const dirs = ['الشمال', 'الشمال الشرقي', 'الشرق', 'الجنوب الشرقي', 'الجنوب', 'الجنوب الغربي', 'الغرب', 'الشمال الغربي'];
    this.qb = qb;
    return hdr('اتجاه القبلة', 'نحو الكعبة المشرّفة', { back: true, compact: true }) +
      '<div class="qibla" id="q-wrap"><div class="dial" id="q-dial">' + dialSVG(qb) + '</div>' +
      '<div class="qstatus"><div class="qdeg num" id="q-deg">' + N(Math.round(qb)) + '°</div><div class="qhint" id="q-hint">' + (Loc.get() ? 'جارٍ تشغيل البوصلة…' : 'حدّد موقعك لاتجاه دقيق') + '</div></div>' +
      '<div class="qinfo"><div class="stat"><b>' + dirs[Math.round(qb / 45) % 8].replace('ال', '') + '</b><span>الاتجاه</span></div>' +
      '<div class="stat"><b class="num">' + fmtInt(dist) + '</b><span>كم إلى مكة</span></div><div class="stat"><b style="font-size:14px;line-height:1.7">' + esc(l.label) + '</b><span>موقعك</span></div></div>' +
      '<div class="calib">' + icon('refresh') + '<span>لدقّة أفضل: أبعد الهاتف عن المعادن والمغناطيس، وحرّكه على شكل الرقم 8 لمعايرة البوصلة.</span></div>' +
      (Loc.get() ? '' : '<button class="btn primary block mt" data-go="location">' + icon('pin') + 'تحديد الموقع</button>') + '</div>';
  },
  mount() {
    QB.heading = null; QB.acc = null; QB.src = ''; QB.aligned = false;
    const got = h => this.onHeading(h);
    if (Native.has('startCompass')) { QB.src = 'native'; window.onHeading = got; Native.call('startCompass'); }
    else {
      const evName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
      QB.onDev = e => { if (e.alpha == null) return; if (evName === 'deviceorientation' && !e.absolute && e.webkitCompassHeading == null) return;
        const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (360 - e.alpha) % 360; QB.src = 'web'; got(h); };
      window.addEventListener(evName, QB.onDev, true);
      setTimeout(() => {
        if (QB.src || Router.cur.r !== 'qibla') return;
        if (Native.has('setQiblaActive')) {           // الجسر القديم: اتجاه نسبي
          QProbe.run((ll, p) => {
            QB.qn = p ? p[0] : null;
            if (QB.qn == null) { this.static(); return; }
            QB.src = 'old'; window._qOld = rel => got(((QB.qn - rel) % 360 + 360) % 360);
            Native.call('setQiblaActive', true);
          });
        } else this.static();
      }, 1400);
    }
  },
  static() { const h = $('#q-hint'); if (h) h.textContent = 'البوصلة غير متاحة — القبلة بزاوية ' + N(Math.round(this.qb)) + '° من الشمال باتجاه عقارب الساعة'; },
  onHeading(h) {
    if (h == null || isNaN(h)) return;
    // تنعيم ودوران متصل بلا قفزات عند 0/360
    if (QB.acc == null) QB.acc = h; else { let d = ((h - (QB.acc % 360)) % 360 + 540) % 360 - 180; QB.acc += d * 0.35; }
    QB.heading = ((QB.acc % 360) + 360) % 360;
    const rose = $('#q-rose'); if (!rose) return;
    rose.style.transform = 'rotate(' + (-QB.acc).toFixed(2) + 'deg)';
    const delta = ((this.qb - QB.heading) % 360 + 540) % 360 - 180;
    const al = Math.abs(delta) < 4;
    $('#q-wrap').classList.toggle('aligned', al);
    $('#q-hint').textContent = al ? 'أنت في اتجاه القبلة ✓' : (delta > 0 ? 'استدر يمينًا ' : 'استدر يسارًا ') + N(Math.round(Math.abs(delta))) + '°';
    if (al && !QB.aligned) vibrate(60); QB.aligned = al;
  },
  leave() {
    if (QB.onDev) { window.removeEventListener('deviceorientationabsolute', QB.onDev, true); window.removeEventListener('deviceorientation', QB.onDev, true); QB.onDev = null; }
    Native.call('stopCompass'); if (QB.src === 'old') Native.call('setQiblaActive', false);
    window.onHeading = null; window._qOld = null; QB.src = '';
  },
};

/* ═══════════════ الأسماء الحسنى ═══════════════ */
SCREENS.names = {
  parent: 'more',
  render() {
    return hdr('أسماء الله الحسنى', '﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا﴾', { back: true, compact: true }) +
      '<div class="names">' + NOOR_DATA.NAMES.map((n, i) => '<button class="nm-c" data-n="' + i + '"><div class="ar">' + esc(n[0]) + '</div><div class="no num">' + N(i + 1) + '</div></button>').join('') + '</div>' +
      '<div class="foot-note">«إنّ لله تسعةً وتسعين اسمًا، مئةً إلا واحدًا، من أحصاها دخل الجنة» — متفق عليه</div>';
  },
  mount(el) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-n]'); if (!b) return; const i = +b.dataset.n, n = NOOR_DATA.NAMES[i];
      Sheet.open('<div class="center" style="padding:6px 20px 0"><span class="pill num">' + N(i + 1) + ' من ' + N(99) + '</span><div class="bigname">' + esc(n[0]) + '</div>' +
        '<div style="font-size:16px;line-height:1.9;color:var(--tx-2);margin:4px 0 16px">' + esc(n[1]) + '</div></div>' +
        '<div class="acts" style="padding-bottom:6px"><button class="act" id="n-cp">' + icon('copy') + 'نسخ</button><button class="act" id="n-sh">' + icon('share') + 'مشاركة</button><button class="act" id="n-im">' + icon('image') + 'صورة</button>' +
        (i < 98 ? '<button class="act" id="n-nx">التالي' + icon('fwd') + '</button>' : '') + '</div>', sh => {
        const txt = n[0] + ' — ' + n[1];
        $('#n-cp', sh).onclick = () => copyText(txt); $('#n-sh', sh).onclick = () => shareText(txt + '\n— من أسماء الله الحسنى · تطبيق وسن');
        $('#n-im', sh).onclick = () => ShareCard.share({ kind: 'name', title: 'من أسماء الله الحسنى', text: n[0], sub: n[1] }, txt);
        const nx = $('#n-nx', sh); if (nx) nx.onclick = () => Sheet.close(() => { const nb = $('[data-n="' + (i + 1) + '"]'); if (nb) nb.click(); });
      });
    });
  },
};

/* ═══════════════ التقويم الهجري ═══════════════ */
const CAL = { ref: null };
SCREENS.calendar = {
  parent: 'more',
  render() {
    const now = new Date(); if (!CAL.ref) CAL.ref = now;
    const days = NoorEngine.hijriMonthDays(CAL.ref, Settings.hijriOffset); const h0 = days[0].h;
    const lead = (days[0].date.getDay() + 1) % 7;   // الأسبوع يبدأ السبت
    const wk = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    let g = wk.map(w => '<div class="wh">' + w.replace(/^ال/, '') + '</div>').join('') + '<div></div>'.repeat(lead);
    days.forEach(x => {
      const occ = NoorEngine.occasionOn(x.h), today = daysBetween(now, x.date) === 0;
      g += '<div class="cd2 ' + (today ? 'today ' : '') + (occ ? 'occ ' : '') + ([13, 14, 15].includes(x.h.day) ? 'white ' : '') + (x.date.getDay() === 5 ? 'fri' : '') + '"' + (occ ? ' title="' + esc(occ.t) + '"' : '') + '>' +
        N(x.h.day) + '<small>' + N(x.date.getDate()) + '</small></div>';
    });
    const g1 = days[0].date, g2 = days[days.length - 1].date, gm = gMonthNames();
    const occs = days.map(x => ({ x, o: NoorEngine.occasionOn(x.h) })).filter(y => y.o);
    const ups = [];
    for (let k = 0; k < 400 && ups.length < 6; k++) { const d = addDays(now, k), h = hijriOf(d), o = NoorEngine.occasionOn(h); if (o) ups.push({ d, h, o, k }); }
    return hdr('التقويم الهجري', NoorEngine.usesUmmAlQura ? 'تقويم أم القرى' + (Settings.hijriOffset ? ' · معدّل ' + (Settings.hijriOffset > 0 ? '+' : '') + N(Settings.hijriOffset) : '') : 'حساب فلكي', { back: true, compact: true }) +
      '<div class="cal mt" style="margin-top:16px"><div class="cal-h"><button class="ibtn plain" id="c-prev">' + icon('back') + '</button><div class="mn"><b>' + NoorEngine.HMONTHS[h0.month - 1] + ' ' + N(h0.year) + ' هـ</b>' +
      '<span>' + gm[g1.getMonth()] + (g1.getMonth() !== g2.getMonth() ? ' – ' + gm[g2.getMonth()] : '') + ' ' + N(g2.getFullYear()) + '</span></div><button class="ibtn plain" id="c-next">' + icon('fwd') + '</button></div>' +
      '<div class="cal-g">' + g + '</div></div>' +
      '<div class="row mx mt" style="gap:8px;justify-content:center"><button class="act" id="c-today">' + icon('target') + 'اليوم</button><button class="act" id="c-adj">' + icon('edit') + 'تعديل التاريخ</button></div>' +
      (occs.length ? sec('مناسبات هذا الشهر') + '<div class="list mx">' + occs.map(y => occRow(y.o, y.x.h, y.x.date)).join('') + '</div>' : '') +
      sec('المناسبات القادمة') + '<div class="list mx">' + ups.map(u => occRow(u.o, u.h, u.d, u.k)).join('') + '</div>' +
      '<div class="foot-note">قد يختلف التاريخ يومًا عن بلدك تبعًا لرؤية الهلال؛ استخدم «تعديل التاريخ» للمطابقة.</div>';
  },
  mount(el) {
    const shift = dir => { const days = NoorEngine.hijriMonthDays(CAL.ref, Settings.hijriOffset); CAL.ref = dir > 0 ? addDays(days[days.length - 1].date, 2) : addDays(days[0].date, -2); Router.refresh(); };
    $('#c-prev', el).onclick = () => shift(-1); $('#c-next', el).onclick = () => shift(1);
    $('#c-today', el).onclick = () => { CAL.ref = new Date(); Router.refresh(); };
    $('#c-adj', el).onclick = () => hijriAdjSheet(() => Router.refresh());
  },
  leave() { CAL.ref = null; },
};
function occRow(o, h, d, k) {
  return '<div class="li"><div class="ic">' + icon('sparkle') + '</div><div class="grow"><div class="t">' + esc(o.t) + '</div><div class="s">' + fmtH(h) + ' · ' + weekday(d) + ' ' + fmtG(d) + (o.n ? ' · ' + esc(o.n) : '') + '</div></div>' +
    (k != null ? '<div class="end"><span class="pill ' + (k === 0 ? 'green' : '') + '">' + (k === 0 ? 'اليوم' : k === 1 ? 'غدًا' : 'بعد ' + pD(k)) + '</span></div>' : '') + '</div>';
}
function hijriAdjSheet(done) {
  const opts = [-2, -1, 0, 1, 2].map(v => ({ v, t: v === 0 ? 'بدون تعديل' : (v > 0 ? '+' : '−') + N(Math.abs(v)) + (Math.abs(v) === 1 ? ' يوم' : ' يومان'), s: fmtH(NoorEngine.hijri(new Date(), v)) }));
  pickSheet('تعديل التاريخ الهجري', 'لمطابقة إعلان رؤية الهلال في بلدك', opts, Settings.hijriOffset, v => { setSetting('hijriOffset', v); if (done) done(); });
}

/* ═══════════════ حاسبة الزكاة ═══════════════ */
SCREENS.zakat = {
  parent: 'more',
  render() {
    const z = Store.get('zakat', { cash: '', gold: '', goldP: '', silver: '', silverP: '', trade: '', recv: '', debt: '', nisab: 'gold' });
    const cur = Settings.currency || ({ DZ: 'د.ج', MA: 'د.م', TN: 'د.ت', SA: 'ر.س', EG: 'ج.م', AE: 'د.إ', KW: 'د.ك', QA: 'ر.ق', LY: 'د.ل', JO: 'د.أ' }[(Loc.get() || {}).cc] || '');
    this.cur = cur;
    const f = (id, lbl, ph) => '<div><label>' + lbl + '</label><input class="field num" inputmode="decimal" id="z-' + id + '" value="' + esc(z[id]) + '" placeholder="' + (ph || '0') + '"></div>';
    return hdr('حاسبة الزكاة', 'زكاة المال والذهب والفضة وعروض التجارة', { back: true, compact: true }) +
      '<div class="zres mx mt" style="margin-top:16px"><div style="font-size:13px;opacity:.8">الزكاة الواجبة (' + N('2.5') + '٪)</div><div class="big num" id="zr-z">0</div><div style="font-size:12.5px;opacity:.8" id="zr-s"></div></div>' +
      '<div class="card mx mt pad form-g">' + f('cash', 'النقود والأرصدة البنكية (' + cur + ')') + '<div class="row" style="gap:10px">' + f('gold', 'الذهب (غرام)') + f('goldP', 'سعر غرام الذهب') + '</div>' +
      '<div class="row" style="gap:10px">' + f('silver', 'الفضة (غرام)') + f('silverP', 'سعر غرام الفضة') + '</div>' + f('trade', 'قيمة عروض التجارة') + f('recv', 'ديون مرجوّة لك') + f('debt', 'ديون حالّة عليك') +
      '<div><label>حساب النصاب على أساس</label><div class="seg" id="z-nis"><button data-v="gold">الذهب (' + N(85) + ' غرامًا)</button><button data-v="silver">الفضة (' + N(595) + ' غرامًا)</button></div></div></div>' +
      '<div class="card mx mt pad" id="z-sum"></div>' +
      '<div class="foot-note">تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول الهجري. أدخل أسعار الذهب والفضة الحالية في بلدك؛ الحاسبة للتقريب، وللحالات الخاصة يُرجع إلى أهل العلم.</div>';
  },
  mount(el) {
    const ids = ['cash', 'gold', 'goldP', 'silver', 'silverP', 'trade', 'recv', 'debt'];
    const st = Store.get('zakat', { nisab: 'gold' });
    const seg = $('#z-nis', el);
    const calc = () => {
      const v = {}; ids.forEach(k => { v[k] = parseFloat(latinDigits($('#z-' + k, el).value).replace(/[^\d.]/g, '')) || 0; st[k] = $('#z-' + k, el).value; });
      Store.set('zakat', st);
      const wealth = v.cash + v.gold * v.goldP + v.silver * v.silverP + v.trade + v.recv - v.debt;
      const nisab = st.nisab === 'silver' ? 595 * v.silverP : 85 * v.goldP;
      const due = nisab > 0 && wealth >= nisab ? wealth * 0.025 : 0;
      $('#zr-z').textContent = fmtInt(due) + ' ' + this.cur;
      $('#zr-s').textContent = !nisab ? 'أدخل سعر ' + (st.nisab === 'silver' ? 'الفضة' : 'الذهب') + ' لحساب النصاب' : (wealth >= nisab ? 'بلغ مالك النصاب' : 'لم يبلغ مالك النصاب بعد');
      $('#z-sum', el).innerHTML = '<div class="kv"><span class="muted">إجمالي الأموال الزكوية</span><b class="num">' + fmtInt(Math.max(wealth, 0)) + ' ' + this.cur + '</b></div>' +
        '<div class="kv"><span class="muted">قيمة النصاب</span><b class="num">' + (nisab ? fmtInt(nisab) + ' ' + this.cur : '—') + '</b></div>' +
        '<div class="kv"><span class="muted">الزكاة المستحقة</span><b class="num gold">' + fmtInt(due) + ' ' + this.cur + '</b></div>';
    };
    const mark = () => $$('button', seg).forEach(b => b.classList.toggle('on', b.dataset.v === (st.nisab || 'gold')));
    mark(); seg.onclick = e => { const b = e.target.closest('button'); if (!b) return; st.nisab = b.dataset.v; mark(); calc(); };
    ids.forEach(k => $('#z-' + k, el).addEventListener('input', calc)); calc();
  },
};

/* ═══════════════ سجل الصلوات ═══════════════ */
SCREENS.tracker = {
  parent: 'more',
  render() {
    const now = new Date(); let rows = '', wk = 0, total = 0;
    for (let k = 0; k < 14; k++) {
      const d = addDays(now, -k), t = Times.forDay(d);
      rows += '<div class="li" style="min-height:56px"><div class="grow"><div class="t" style="font-size:14px">' + (k === 0 ? 'اليوم' : k === 1 ? 'أمس' : weekday(d)) + '</div><div class="s">' + fmtG(d) + '</div></div>' +
        FIVE.map((p, i) => { const on = Tracker.has(d, i), fut = k === 0 && t[p] > now && !on;
          return '<button class="pcell" style="padding:4px 1px;gap:2px" data-d="' + k + '" data-p="' + i + '" ' + (fut ? 'disabled' : '') + '><span class="pn" style="font-size:10.5px">' + PNAME[p] + '</span><span class="chk ' + (on ? 'on' : '') + '" style="' + (fut ? 'opacity:.35' : '') + '">' + icon('check') + '</span></button>';
        }).join('') + '</div>';
      const c = Tracker.count(d); total += c; if (k < 7) wk += c;
    }
    return hdr('سجل الصلوات', 'تابع محافظتك على الصلوات الخمس', { back: true, compact: true }) +
      '<div class="stat3 mx mt" style="margin-top:16px"><div class="stat"><b class="num">' + N(Tracker.streak(now)) + '</b><span>أيام متتالية</span></div>' +
      '<div class="stat"><b class="num">' + N(Math.round(wk / 35 * 100)) + '%</b><span>هذا الأسبوع</span></div><div class="stat"><b class="num">' + N(total) + '</b><span>صلاة في ' + N(14) + ' يومًا</span></div></div>' +
      sec('آخر ' + N(14) + ' يومًا') + '<div class="list mx" id="tr-l">' + rows + '</div><div class="foot-note">اضغط على أي صلاة لتسجيلها أو إلغاء تسجيلها. يمكنك أيضًا التسجيل من الرئيسية.</div>' +
      '<button class="hc mt statlink" data-go="qada" style="display:flex;width:calc(100% - 32px)"><div class="ic">' + icon('history') + '</div><div class="grow"><div class="t">قضاء الفوائت</div>' +
      '<div class="s">' + (Qada.left() ? 'متبقٍّ عليك ' + fmtInt(Qada.left()) + ' ' + unitOf(Qada.left(), 'صلاة', 'صلاتان', 'صلوات', 'صلاة') : 'إن فاتتك صلوات فسجّلها واقضِها بخطة يومية') + '</div></div>' + icon('chev', 'faint') + '</button>';
  },
  mount(el) {
    $('#tr-l', el).addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b || b.disabled) return;
      const on = Tracker.toggle(addDays(new Date(), -(+b.dataset.d)), +b.dataset.p); vibrate(on ? 20 : 8); Router.refresh(); });
  },
};

/* وسن 4.8: «لوحة الاستغفار» انتقلت إلى boards.js */

/* ═══════════════ المزيد ═══════════════ */
SCREENS.more = {
  tab: 'more',
  render() {
    const tiles = [['القبلة', 'kaaba', 'gold', 'qibla', 'بوصلة نحو الكعبة'], ['المسبحة', 'beads', 'indigo', 'tasbih', 'عدّاد التسبيح'],
      ['ختمة القرآن', 'target', 'emerald', 'khatma', 'وِرد يومي منظّم'], ['سجل الصلوات', 'chart', 'teal', 'tracker', 'تابع محافظتك'],
      ['قضاء الفوائت', 'history', 'plum', 'qada', 'الصلوات وأيام الصيام'], ['التقويم الهجري', 'calendar', 'slate', 'calendar', 'المناسبات والأيام البيض'],
      ['الأسماء الحسنى', 'star8', 'amber', 'names', N(99) + ' اسمًا ومعانيها'], ['حاسبة الزكاة', 'calc', 'indigo', 'zakat', 'احسب زكاة مالك'],
      ['المنبّه', 'alarm', 'amber', 'alarms', 'قبل الفجر · قيام الليل · منبّهاتك'], ['لوحة الاستغفار', 'heart', 'rose', 'istighfar', 'لوحة تكتمل مع كل استغفار'],
      ['لوحة الهدية', 'sparkle', 'plum', 'gift', 'أهدِ ثواب ذكرك بلوحة جميلة'], ['النسخ الاحتياطي', 'save', 'emerald', 'backup', 'احفظ بستانك في ملف']];
    Habits.syncAuto();
    const d = new Date(), hs = Habits.today(d).slice(0, 6), tds = Todo.sorted(Todo.fToday).slice(0, 5), g = Growth.day(d);
    const chip = (ic, v, l) => '<div class="tchip">' + icon(ic) + '<b class="num">' + v + '</b><span>' + l + '</span></div>';
    return hdr('بستاني', 'نموّك اليومي في الطاعات والعادات', { actions: [{ id: 'm-set', icon: 'gear', label: 'الإعدادات' }] }) +
      '<div class="mx mt">' + gardenCard({ go: true, id: 'gm' }) + '</div>' +
      '<div class="tchips mx">' + chip('mosque', N(Tracker.count(d)) + '/' + N(5), 'الصلوات') + chip('sun', N(Object.keys(g.azs || {}).length), 'أذكار') +
      chip('book', N(g.q || 0), 'آية') + chip('heart', N(g.ist || 0), 'استغفار') + '</div>' +
      badgesCard() +
      sec('عادات اليوم', { t: 'كل العادات', attr: 'data-go="habits"' }) +
      (hs.length ? '<div class="hlist mx" id="m-hl">' + hs.map(h => habitRow(h, d)).join('') + '</div>' :
        '<button class="emptyc mx" data-go="habits" style="width:calc(100% - 32px)"><div class="ic">' + icon('target') + '</div><div class="t">أضف عاداتك اليومية</div><div class="s">أذكار، ورد قرآن، صيام، رياضة… وتابع التزامك</div></button>') +
      sec('مهام اليوم', { t: 'كل المهام', attr: 'data-go="todo"' }) +
      '<div class="mx"><div class="quickadd"><input id="m-q" maxlength="90" placeholder="أضف مهمة لليوم…"><button id="m-qb" aria-label="إضافة">' + icon('plus') + '</button></div></div>' +
      (tds.length ? '<div class="tlist mx mt" id="m-tl">' + tds.map(todoRow).join('') + '</div>' : '') +
      '<button class="hc mt statlink" data-go="stats" style="display:flex;width:calc(100% - 32px)"><div class="ic">' + icon('chart') + '</div><div class="grow"><div class="t">إحصاءاتي</div>' +
      '<div class="s">الختمات · الأذكار · الاستغفار · التسبيح · أيام النشاط</div></div>' + icon('chev', 'faint') + '</button>' +
      sec('الأدوات') + '<div class="azc-grid stagger">' + tiles.map(([t, ic, hu, go, s]) => '<button class="azc" data-go="' + go + '" style="' + hueVars(hu) + ';min-height:112px"><div class="ic">' + icon(ic) + '</div><div><div class="t">' + t + '</div><div class="s">' + s + '</div></div></button>').join('') + '</div>' +
      sec('التطبيق') + '<div class="list mx">' +
      '<button class="li" data-go="settings"><div class="ic">' + icon('gear') + '</div><div class="grow"><div class="t">الإعدادات</div><div class="s">المظهر · المواقيت · التنبيهات · التلاوة</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="m-share"><div class="ic g">' + icon('share') + '</div><div class="grow"><div class="t">شارك التطبيق</div><div class="s">الدالّ على الخير كفاعله</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="about"><div class="ic">' + icon('info') + '</div><div class="grow"><div class="t">عن وسن</div><div class="s">الإصدار ' + APP_VERSION + '</div></div><div class="end">' + icon('chev') + '</div></button></div>';
  },
  mount(el) {
    $('#m-set', el).onclick = () => Router.go('settings');
    $('#m-share', el).onclick = () => { if (Native.has('shareApp') && !Native.has('shareText')) Native.call('shareApp'); else shareText('تطبيق «وسن» — رفيقك في الصلاة والذكر: القرآن الكريم مع التلاوة، مواقيت الصلاة والأذان، القبلة، الأذكار، العادات والمهام في تطبيق واحد أنيق.'); };
    const hl = $('#m-hl', el); if (hl) bindHabitRows(hl, () => Router.refresh());
    const tl = $('#m-tl', el); if (tl) bindTodoRows(tl, () => Router.refresh());
    const q = $('#m-q', el), qa = () => { const v = q.value.trim(); if (!v) return; Todo.add({ t: v, note: '', due: dayKey(new Date()), time: '', pri: 0, list: 'personal' }); Router.refresh(); };
    $('#m-qb', el).onclick = qa; q.addEventListener('keydown', e => { if (e.key === 'Enter') qa(); });
  },
};

/* ═══════════════ الإعدادات ═══════════════ */
function segRow(title, sub, key, opts) {
  return '<div class="li" style="flex-wrap:wrap"><div class="grow" style="min-width:140px"><div class="t">' + title + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>' +
    '<div class="seg" data-seg="' + key + '" style="flex:1 1 170px">' + opts.map(([v, t]) => '<button data-v="' + v + '" class="' + (String(Settings[key]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div></div>';
}
const THEME_NAMES = Object.assign({ auto: 'حسب النظام', prayer: 'تلقائي حسب المواقيت' }, Object.fromEntries(Object.entries(THEMES).map(([k, v]) => [k, v.n])));
// وسن 6.1: ثيمات 4.6 أولًا وبترتيبها نفسه، ثم الحيّة المشرقة، ثم البقية
const THEME_GROUPS = [['kawaii', 'ثيمات كاملة مرسومة'], ['men', 'ثيمات رجالية · جديد'], ['islamic', 'بالصور الحقيقية'], ['live', 'حيّة مشرقة'], ['anim', 'حيّة متحركة'], ['scene', 'مشاهد'], ['girls', 'ناعمة وردية'], ['calm', 'هادئة'], ['more', 'مختلفة']];
/* وسن 5.1 · الثيمات: القديمة كما كانت (المشاهد والرسوم) + فخامة إسلامية بالصور + ثيمات حيّة متحركة، وخلفية الرئيسية: مشهد الثيم أو صورتك */
const HERO_MODES = [['theme', 'مشهد الثيم'], ['mine', 'صورتي']];
function themeSheet() {
  const card = k => { const T = THEMES[k];
    if (T.ph || T.anim) return '<button class="thm thm-ph' + (Settings.theme === k ? ' on' : '') + '" data-th="' + k + '"><span class="thm-img"><img src="img/th/' + k + '-t.webp" alt="" loading="lazy" decoding="async" draggable="false">' +
      '<i style="background:' + T.sw[2] + '"></i>' + (T.anim ? '<b class="thm-live">' + icon('sparkle') + 'حيّ</b>' : '') + (T.nw ? '<b class="thm-nw">جديد</b>' : '') + '</span><span class="thm-n">' + T.n + '</span></button>';
    const sw = T.sw;
    if (T.skin && typeof Art !== 'undefined' && Art.has(T.skin)) return '<button class="thm' + (Settings.theme === k ? ' on' : '') + '" data-th="' + k + '"><span class="thm-kw thm-art"><img src="' + Art.thumbURI(T.skin) + '" alt="" draggable="false">' +
      '<i style="position:absolute;left:0;right:0;bottom:0;height:5px;background:' + sw[2] + '"></i>' + (T.nw ? '<b class="thm-nw">جديد</b>' : '') + '</span><span class="thm-n">' + T.n + '</span></button>';
    if (T.skin && SKINS[T.skin] && SKINS[T.skin].stickers) { const K = SKINS[T.skin], w = K.wall || [K.e];
      return '<button class="thm' + (Settings.theme === k ? ' on' : '') + '" data-th="' + k + '"><span class="thm-kw" style="background:linear-gradient(160deg,' + sw[0] + ',' + sw[1] + ')">' +
        emoImg(K.e, 'left:50%;top:50%;width:46%;margin:-23% 0 0 -23%;filter:drop-shadow(0 3px 5px rgba(0,0,0,.18))' + (K.bulletHue ? ' ' + KW_HUE[K.bulletHue] : '')) +
        emoImg(w[1] || K.e, 'left:8%;top:10%;width:22%;transform:rotate(-14deg);opacity:.9') + emoImg(w[2] || K.e, 'right:8%;bottom:9%;width:20%;transform:rotate(12deg);opacity:.9') +
        '<i style="position:absolute;left:0;right:0;bottom:0;height:5px;background:' + sw[2] + '"></i></span><span class="thm-n">' + T.n + '</span></button>'; }
    if (T.skin && SKINS[T.skin]) return '<button class="thm thm-scene' + (Settings.theme === k ? ' on' : '') + '" data-th="' + k + '"><span class="thm-sc">' +
      Garden.render(260, { skin: SKINS[T.skin], phase: T.base === 'dark' ? 'night' : 'day', id: 'ts' + k, par: 'xMidYMax slice' }) + '</span><span class="thm-n">' + T.n + '</span></button>';
    return '<button class="thm' + (Settings.theme === k ? ' on' : '') + '" data-th="' + k + '"><span class="thm-sw" style="background:' + sw[0] + '"><i style="background:' + sw[1] + '"></i><b style="background:' + sw[2] + '"></b><s style="background:' + sw[3] + '"></s></span><span class="thm-n">' + T.n + '</span></button>'; };
  const draw = () => { const hm = heroMode();
    return '<div class="sh-t">الثيمات</div><div class="sh-s">اختر ما يريح عينيك ويناسب ذوقك</div>' +
      '<div class="thm-g">خلفية الصفحة الرئيسية</div><div class="seg hm-seg" id="hm-seg">' + HERO_MODES.map(([v, t]) => '<button data-hm="' + v + '" class="' + (hm === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      '<div class="thm-g">سماء المشهد</div><div class="seg hm-seg" id="sky-seg">' + [['bright', 'مشرقة دائمًا'], ['live', 'تتبع الوقت: ليل ونهار']].map(([v, t]) => '<button data-sky="' + v + '" class="' + ((Settings.skyMode === 'live' ? 'live' : 'bright') === v ? 'on' : '') + '">' + t + '</button>').join('') + '</div>' +
      '<div class="hm-hint faint">' + (Settings.skyMode === 'live' ? 'تُظلم السماء بعد المغرب وتُشرق مع الفجر كما في 4.6' : 'مشاهد الثيمات الفاتحة تبقى نهارية مشرقة في كل وقت') + '</div>' +
      (Settings.heroImg ? '<div class="hm-mine' + (hm === 'mine' ? ' on' : '') + '"><img src="' + esc(Settings.heroImg) + '" alt=""><div class="grow"><div class="t">صورتك من الهاتف</div><div class="s">حرّكها واضبط تعتيمها لتبقى الكتابة واضحة</div></div>' +
        '<button class="btn sm" data-hm-act="adjust">ضبط</button><button class="btn sm ghost" data-hm-act="pick">تغيير</button></div>' : '<div class="hm-hint faint">اختر «صورتي» لتضع صورة من معرض هاتفك</div>') +
      THEME_GROUPS.map(([g, t]) => '<div class="thm-g">' + t + '</div><div class="thm-grid">' + Object.keys(THEMES).filter(k => THEMES[k].g === g).map(card).join('') + '</div>').join('') +
      '<div class="thm-g">تلقائي</div><div class="list mx">' + [['prayer', 'داكن من المغرب إلى الشروق وفاتح نهارًا'], ['auto', 'يتبع إعداد الهاتف']].map(([v, s]) =>
        '<button class="li opt ' + (Settings.theme === v ? 'on' : '') + '" data-th="' + v + '"><div class="grow"><div class="t">' + THEME_NAMES[v] + '</div><div class="s">' + s + '</div></div><span class="rad"></span></button>').join('') + '</div>'; };
  Sheet.open(draw(), el => {
    const redraw = () => { const sy = el.scrollTop; el.innerHTML = '<div class="grab"></div>' + draw(); el.scrollTop = sy; };
    el.addEventListener('click', e => {
      const sk = e.target.closest('[data-sky]'); if (sk) { setSetting('skyMode', sk.dataset.sky); redraw(); vibrate(8); return; }
      const h = e.target.closest('[data-hm]');
      if (h) { const v = h.dataset.hm; if (v === 'mine' && !Settings.heroImg) { pickHeroImage(() => redraw()); return; } setSetting('heroMode', v); redraw(); vibrate(8); return; }
      const a = e.target.closest('[data-hm-act]');
      if (a) { if (a.dataset.hmAct === 'pick') pickHeroImage(() => redraw()); else heroAdjustSheet(); return; }
      const b = e.target.closest('[data-th]'); if (!b) return; const k = b.dataset.th, T = THEMES[k];
      setSetting('theme', k);
      if (Settings.accent !== 'custom') {
        if (T && T.acc) { setSetting('accent', T.acc); setSetting('accentAuto', true); }
        else if (Settings.accentAuto) { setSetting('accent', 'emerald'); setSetting('accentAuto', false); }
      }
      if (T && T.rt) setSetting('readTheme', T.rt);   // وسن 6.1: والثيمات الحيّة المشرقة أيضًا تفتح المصحف بلون مشرق
      if (Settings.heroMode === 'mine') setSetting('heroMode', 'theme');   // اختيار ثيم = عرض مشهده (وتبقى صورتك محفوظة لتعودي إليها)
      const paint = () => { applyTheme(); $$('[data-th]', el).forEach(x => x.classList.toggle('on', x === b)); };
      if (typeof Motion !== 'undefined') Motion.reveal(e, paint); else paint(); vibrate(8);   // وسن 7.1: الثيم الجديد يتّسع كدائرة من موضع لمستك
      try { if (T && T.skin) kwCelebrate(T.skin); } catch (er) {}
    });
  }, () => Router.refresh());
}
/* ── خلفية الصفحة الرئيسية ── */
function heroMode() { return Settings.heroMode === 'mine' && Settings.heroImg ? 'mine' : 'theme'; }
function heroKind() { if (heroMode() === 'mine') return 'photo'; const T = THEMES[uiTheme()] || {}; return T.ph ? 'photo' : T.anim ? 'anim' : 'sky'; }
function heroInk() { return heroMode() === 'mine' ? (Settings.heroInk === 'd' ? 'd' : 'w') : ((THEMES[uiTheme()] || {}).ink === 'd' ? 'd' : 'w'); }
function heroTop() {
  if (heroMode() === 'mine') { const d = +Settings.heroDim || 0, ink = heroInk(), t = /^#[0-9a-f]{6}$/i.test(Settings.heroTop || '') ? Settings.heroTop : '#222222';
    return mixHex(t, ink === 'd' ? '#FFFFFF' : '#000000', Math.min(0.9, 0.42 + d * 0.8)); }
  return (THEMES[uiTheme()] || {}).top || '#111111';
}
function mixHex(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function heroPhotoLayer() {
  if (heroMode() === 'mine') { const p = Settings.heroPos || { x: 50, y: 50 }, z = Math.max(1, Math.min(2, +Settings.heroZoom || 1)), d = Math.max(0, Math.min(0.7, +Settings.heroDim || 0));
    return '<div class="ph-w"><img class="ph" id="h-ph" src="' + esc(Settings.heroImg) + '" alt="" decoding="async" draggable="false" style="object-position:' + (+p.x) + '% ' + (+p.y) + '%;transform:scale(' + z + ')"></div>' +
      '<div class="ph-dim" style="opacity:' + d + '"></div><div class="ph-sh"></div>'; }
  return '<div class="ph-w"><img class="ph" id="h-ph" src="img/th/' + uiTheme() + '.webp" alt="" decoding="async" draggable="false"></div><div class="ph-sh"></div>';
}
/** اختيار صورة من الهاتف (منتقي الصور الآمن في أندرويد، أو ملف في المتصفح) */
function pickHeroImage(done) {
  const apply = r => {
    if (!r || !r.url) { toast('لم تُختر صورة'); return; }
    setSetting('heroImg', r.url); setSetting('heroTop', r.top || '#333333'); setSetting('heroLum', +r.lum || 0.4);
    setSetting('heroPos', { x: 50, y: 50 }); setSetting('heroZoom', 1);
    const lum = +r.lum || 0.4; setSetting('heroInk', lum > 0.66 ? 'd' : 'w'); setSetting('heroDim', lum > 0.66 ? 0.12 : lum > 0.45 ? 0.16 : 0.06);
    setSetting('heroMode', 'mine'); if (done) done(); heroAdjustSheet();
  };
  if (Native.has('pickImage')) { window.onPickedImage = r => { window.onPickedImage = null; apply(r); }; Native.call('pickImage'); return; }
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'), s = Math.min(1, 1440 / Math.min(im.width, im.height)); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height); const d = x.getImageData(0, 0, c.width, Math.max(1, Math.round(c.height * 0.12))).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 64) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } r /= n; g /= n; b /= n;
      apply({ url: c.toDataURL('image/jpeg', 0.86), top: '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''), lum: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 }); }; im.src = rd.result; };
    rd.readAsDataURL(f); };
  inp.click();
}
/** ضبط صورتك: السحب لتحريكها، والتكبير، والتعتيم، ولون الكتابة */
function heroAdjustSheet() {
  if (!Settings.heroImg) { pickHeroImage(); return; }
  const st = { p: Object.assign({ x: 50, y: 50 }, Settings.heroPos || {}), z: +Settings.heroZoom || 1, d: +Settings.heroDim || 0, ink: Settings.heroInk === 'd' ? 'd' : 'w' };
  const html = '<div class="sh-t">ضبط صورة الصفحة الرئيسية</div><div class="sh-s">اسحب الصورة لتحريكها</div>' +
    '<div class="ha-prev scene photo ink-' + st.ink + '" id="ha-p"><div class="ph-w"><img class="ph" id="ha-img" src="' + esc(Settings.heroImg) + '" alt="" draggable="false"></div><div class="ph-dim" id="ha-dim"></div><div class="ph-sh"></div>' +
    '<div class="ha-demo"><div class="lbl">الصلاة القادمة</div><div class="name">العصر</div><div class="at num">15:41</div></div></div>' +
    '<div class="mx form"><label>التكبير</label><input type="range" id="ha-z" min="100" max="200" step="1" value="' + Math.round(st.z * 100) + '">' +
    '<label>التعتيم لوضوح الكتابة</label><input type="range" id="ha-d" min="0" max="70" step="1" value="' + Math.round(st.d * 100) + '">' +
    '<label>لون الكتابة فوق الصورة</label><div class="seg" id="ha-ink"><button data-v="w" class="' + (st.ink === 'w' ? 'on' : '') + '">أبيض</button><button data-v="d" class="' + (st.ink === 'd' ? 'on' : '') + '">داكن</button></div>' +
    '<div class="row mt" style="gap:10px"><button class="btn primary grow" id="ha-ok">حفظ</button><button class="btn ghost" id="ha-rm">إزالة الصورة</button></div></div>';
  Sheet.open(html, el => {
    const img = $('#ha-img', el), dim = $('#ha-dim', el), box = $('#ha-p', el);
    const paint = () => { img.style.objectPosition = st.p.x + '% ' + st.p.y + '%'; img.style.transform = 'scale(' + st.z + ')'; dim.style.opacity = st.d; box.classList.toggle('ink-d', st.ink === 'd'); box.classList.toggle('ink-w', st.ink !== 'd'); };
    paint();
    let drag = null;
    box.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, p: Object.assign({}, st.p) }; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', e => { if (!drag) return; const r = box.getBoundingClientRect(), k = 100 / st.z;
      st.p.x = clamp(drag.p.x - (e.clientX - drag.x) / r.width * k * 1.6, 0, 100); st.p.y = clamp(drag.p.y - (e.clientY - drag.y) / r.height * k * 1.6, 0, 100); paint(); });
    const end = () => { drag = null; }; box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    $('#ha-z', el).oninput = e => { st.z = +e.target.value / 100; paint(); };
    $('#ha-d', el).oninput = e => { st.d = +e.target.value / 100; paint(); };
    $('#ha-ink', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; st.ink = b.dataset.v; $$('#ha-ink button', el).forEach(x => x.classList.toggle('on', x === b)); paint(); };
    $('#ha-ok', el).onclick = () => { setSetting('heroPos', { x: Math.round(st.p.x), y: Math.round(st.p.y) }); setSetting('heroZoom', +st.z.toFixed(2)); setSetting('heroDim', +st.d.toFixed(2)); setSetting('heroInk', st.ink); setSetting('heroMode', 'mine'); Sheet.close(); Router.refresh(); toast('تم حفظ صورتك'); };
    $('#ha-rm', el).onclick = () => { if (Native.has('clearPickedImage')) Native.call('clearPickedImage'); setSetting('heroImg', ''); setSetting('heroMode', 'photo'); Sheet.close(); Router.refresh(); toast('عادت صورة الثيم'); };
  });
}
function accentSheet() {
  let [h] = /^#[0-9a-f]{6}$/i.test(Settings.accentHex || '') ? hexToHsl(Settings.accentHex) : [330];
  let tone = Settings.accentTone || 'bright';
  const TONE = { soft: [34, 46], bright: [56, 45], deep: [48, 30] };
  const col = () => hslToHex(h, TONE[tone][0], TONE[tone][1]);
  const html = '<div class="sh-t">لون من اختيارك</div><div class="sh-s">حرّك الشريط لتختار اللون، ثم درجته</div>' +
    '<div class="mx"><div class="acc-pv" id="ac-pv"><span></span><b>وسن</b></div>' +
    '<input type="range" min="0" max="359" value="' + Math.round(h) + '" id="ac-h" class="hue">' +
    '<div class="seg" id="ac-t" style="margin-top:14px"><button data-v="soft">هادئ</button><button data-v="bright">زاهٍ</button><button data-v="deep">عميق</button></div>' +
    '<button class="btn gold block" id="ac-ok" style="margin-top:16px">' + icon('check') + 'اعتمد هذا اللون</button></div>';
  Sheet.open(html, el => {
    const upd = () => { const c = col(), pv = $('#ac-pv', el); pv.style.setProperty('--c', c); $$('#ac-t button', el).forEach(b => b.classList.toggle('on', b.dataset.v === tone)); };
    $('#ac-h', el).oninput = e => { h = +e.target.value; upd(); };
    $('#ac-t', el).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; tone = b.dataset.v; upd(); };
    $('#ac-ok', el).onclick = () => { setSetting('accentHex', col()); setSetting('accentTone', tone); setSetting('accent', 'custom'); setSetting('accentAuto', false); applyTheme(); Sheet.close(() => Router.refresh()); };
    upd();
  });
}
const ACCENTS = [['emerald', '#0B5D4B', 'زمردي'], ['teal', '#12707E', 'فيروزي'], ['ocean', '#1F6F8B', 'بحري'], ['indigo', '#3A4B8A', 'أزرق ليلي'], ['plum', '#7A3F71', 'بنفسجي'], ['lilac', '#7E63B8', 'ليلكي'],
  ['pink', '#C2587A', 'وردي'], ['rosegold', '#B06A74', 'ذهبي وردي'], ['rose', '#9A4658', 'عنّابي'], ['coral', '#D0694E', 'مرجاني'], ['amber', '#8A6224', 'عسلي'], ['coffee', '#7A5236', 'قهوة'], ['olive', '#5E6B2E', 'زيتوني'], ['morpho', '#2D6FE0', 'أزرق']];
const SOUND_NAMES = { adhan: 'الأذان كاملًا', takbir: 'التكبير فقط', system: 'نغمة الإشعارات الافتراضية', chime: 'نغمة وسن', custom: 'نغمة من هاتفك', silent: 'اهتزاز فقط' };
/* وسن 7.1 · بحث فوري في الإعدادات: يُظهر الصفوف المطابقة وعناوين أقسامها فقط */
function settingsSearch(el) {
  const q = $('#s-q', el); if (!q) return;
  const box = q.closest('.set-q'), rows = $$('.list > .li', el), lists = $$('.list', el);
  const txt = rows.map(r => normAr((r.querySelector('.t') || r).textContent + ' ' + ((r.querySelector('.s') || {}).textContent || '')));
  const run = () => {
    const s = normAr(q.value.trim()); let any = false;
    box.classList.toggle('has', !!s);
    rows.forEach((r, i) => { const l = r.parentElement, p = l && l.previousElementSibling, st = p && p.classList.contains('sec') ? normAr(p.textContent) : '';
      const hit = !s || txt[i].includes(s) || (s.length > 2 && st.includes(s)); r.classList.toggle('m-hide', !hit); if (hit) any = true; });
    lists.forEach(l => { const vis = !s || !!l.querySelector(':scope > .li:not(.m-hide)'); l.classList.toggle('m-hide', !vis);
      const p = l.previousElementSibling; if (p && p.classList.contains('sec')) p.classList.toggle('m-hide', !vis); });
    $$('.foot-note', el).forEach(f => f.classList.toggle('m-hide', !!s));
    box.classList.toggle('none', !!s && !any);
  };
  q.addEventListener('input', run);
  $('#s-qx', el).onclick = () => { q.value = ''; run(); q.focus(); };
}
SCREENS.settings = {
  parent: 'more',
  render() {
    const n = Notif.supported();
    const hl = { angle: 'حسب الزاوية', middle: 'منتصف الليل', seventh: 'سُبع الليل' }[Settings.highLat];
    if (!Settings.motionSet && typeof Motion !== 'undefined') Settings.motion = Motion.lvl;
    return hdr('الإعدادات', 'خصّص وسن كما تحب', { back: true, compact: true }) +
      // وسن 7.1: ابحث في كل الإعدادات
      '<div class="set-q"><div class="search">' + icon('search') + '<input id="s-q" type="search" placeholder="ابحث في الإعدادات… (الأذان، الخط، الحركة)" autocomplete="off"><button class="x" id="s-qx" aria-label="مسح">' + icon('x') + '</button></div></div>' +
      '<div class="set-empty">لا يوجد إعداد بهذا الاسم</div>' +
      sec('المظهر') + '<div class="list mx">' +
      '<button class="li" id="s-th"><div class="ic">' + icon('palette') + '</div><div class="grow"><div class="t">السمة</div><div class="s">' + THEME_NAMES[Settings.theme] + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      // وسن 7: الشاشة الرئيسية كما تحب — وإظهار الشعار أو إخفاؤه بلمسة
      '<button class="li" data-go="homecfg"><div class="ic g">' + icon('home') + '</div><div class="grow"><div class="t">تخصيص الشاشة الرئيسية</div><div class="s">' + esc(homeSummary()) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<div class="li"><div class="ic">' + icon('eye') + '</div><div class="grow"><div class="t">إظهار شعار «وسن»</div><div class="s">أعلى الشاشة الرئيسية فوق المواقيت</div></div><button class="switch ' + (((Settings.home && Settings.home.brand) || 'logo') === 'logo' ? 'on' : '') + '" id="s-logo"></button></div>' +
      '<div class="li" style="flex-wrap:wrap"><div class="grow" style="min-width:120px"><div class="t">لون التطبيق</div><div class="s">' + (Settings.accent === 'custom' ? 'لون من اختيارك' : (ACCENTS.find(a => a[0] === Settings.accent) || [0, 0, 'لون الثيم'])[2]) + '</div></div>' +
      '<div class="accents" id="s-acc">' + ACCENTS.map(([k, c]) => '<button class="' + (Settings.accent === k ? 'on' : '') + '" data-acc="' + k + '" style="background:' + c + '" aria-label="' + k + '"></button>').join('') +
      '<button class="acc-any' + (Settings.accent === 'custom' ? ' on' : '') + '" id="s-acc-c" aria-label="لون من اختيارك"' + (Settings.accent === 'custom' ? ' style="--c:' + Settings.accentHex + '"' : '') + '>' + icon('plus') + '</button></div></div>' +
      segRow('حجم خط التطبيق', 'يكبّر كل النصوص — مريح للعين', 'uiScale', [['0.9', 'صغير'], ['1', 'عادي'], ['1.12', 'كبير'], ['1.25', 'أكبر']]) +
      segRow('الحركة والانتقالات', 'انتقالات ناعمة لا تُثقل الهاتف · «بدون» يوفّر البطارية', 'motion', [['full', 'كاملة'], ['soft', 'هادئة'], ['off', 'بدون']]) +
      segRow('مرشّح الضوء الدافئ', 'يقلّل الضوء الأزرق لراحة العين', 'warm', [['off', 'متوقف'], ['night', 'ليلًا'], ['on', 'دائمًا']]) +
      segRow('الأرقام', '', 'digits', [['latn', '123'], ['arab', '١٢٣']]) +
      segRow('صيغة الوقت', '', 'clock', [['24', '24 ساعة'], ['12', '12 ساعة']]) +
      segRow('أسماء الأشهر الميلادية', '', 'gmonths', [['auto', 'تلقائي'], ['std', 'يناير'], ['dz', 'جانفي']]) + '</div>' +
      sec('المواقيت') + '<div class="list mx">' +
      '<button class="li" id="s-m"><div class="ic">' + icon('globe') + '</div><div class="grow"><div class="t">طريقة الحساب</div><div class="s">' + esc(Times.methodName()) + (Settings.method ? '' : ' · تلقائي') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      segRow('وقت العصر', '', 'asr', [['shafii', 'الجمهور'], ['hanafi', 'الحنفي']]) +
      '<button class="li" id="s-hl"><div class="ic">' + icon('moon') + '</div><div class="grow"><div class="t">خطوط العرض العليا</div><div class="s">' + hl + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="calib"><div class="ic g">' + icon('target') + '</div><div class="grow"><div class="t">ضبط المواقيت على مسجدك</div><div class="s">' + (Times.calib() ? 'مفعّل · ' + esc(calibSummary(Settings.calib)) : 'أدخل مواقيت اليوم الرسمية فنحسب بها كل الأيام') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="s-adj"><div class="ic">' + icon('clock') + '</div><div class="grow"><div class="t">تعديل يدوي للأوقات</div><div class="s">' + adjSummary() + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" id="s-hj"><div class="ic">' + icon('calendar') + '</div><div class="grow"><div class="t">تعديل التاريخ الهجري</div><div class="s">' + fmtH(hijriOf(new Date())) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="location"><div class="ic">' + icon('pin') + '</div><div class="grow"><div class="t">الموقع</div><div class="s">' + esc(Loc.eff().label) + '</div></div><div class="end">' + icon('chev') + '</div></button></div>' +
      (n ? sec('تنبيهات الأذان') + '<div class="list mx">' + FIVE.map(k => '<div class="li"><div class="ic">' + icon(PICON[k]) + '</div><div class="grow"><div class="t">' + PNAME[k] + '</div></div><button class="switch ' + (Settings.notif[k] ? 'on' : '') + '" data-nt="' + k + '"></button></div>').join('') +
        '<button class="li" id="s-pre"><div class="ic">' + icon('bell') + '</div><div class="grow"><div class="t">تذكير قبل الصلاة</div><div class="s">' + (Settings.preNotif ? 'قبل ' + pM(Settings.preNotif) : 'متوقف') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
        '<button class="li" id="s-snd"><div class="ic">' + icon('vol') + '</div><div class="grow"><div class="t">صوت الأذان</div><div class="s" id="s-snd-s">' + esc(soundTitle()) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
        (() => { const hs = NotifHealth.state(), bad = NotifHealth.broken(hs), weak = NotifHealth.weak(hs);
          return '<button class="li" id="s-perm"><div class="ic g">' + icon('shield') + '</div><div class="grow"><div class="t">وصول الأذان في وقته' + (bad || weak ? '<span class="nh-dot' + (bad ? '' : ' w') + '"></span>' : '') + '</div><div class="s">' +
            (bad ? 'بعض الأذونات ناقصة — اضغط للإصلاح' : weak ? 'جاهز · ننصح باستثناء وسن من توفير البطارية' : 'كل الأذونات جاهزة · جرّب الأذان') + '</div></div><div class="end">' + icon('chev') + '</div></button></div>'; })() +
        sec('التذكيرات') + '<div class="list mx">' +
          '<button class="li" data-go="popz"><div class="ic g">' + icon('bell') + '</div><div class="grow"><div class="t">الأذكار المنبثقة</div><div class="s">' + esc(PopZ.status()) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
          remindVoiceRow() + REMINDERS.map(([k, ic, t, s]) => '<div class="li"><div class="ic">' + icon(ic) + '</div><div class="grow" ' + (['azm', 'aze', 'sleep', 'jumua'].includes(k) ? 'data-rt="' + k + '"' : '') + '><div class="t">' + t + '</div><div class="s">' + s() + '</div></div><button class="switch ' + (Settings.remind[k] ? 'on' : '') + '" data-rm="' + k + '"></button></div>').join('') + '</div>' : '') +
      (Native.has('pinWidget') ? sec('أدوات الشاشة الرئيسية') + '<div class="list mx">' +
        '<button class="li" data-pin="day"><div class="ic">' + icon('widget') + '</div><div class="grow"><div class="t">«مواقيت اليوم»</div><div class="s">الصلاة القادمة وعدّ تنازلي والصلوات الخمس (4×2)</div></div><div class="end">' + icon('plus') + '</div></button>' +
        '<button class="li" data-pin="next"><div class="ic">' + icon('clock') + '</div><div class="grow"><div class="t">«الصلاة القادمة»</div><div class="s">أداة صغيرة بعدّ تنازلي حيّ (2×1)</div></div><div class="end">' + icon('plus') + '</div></button></div>' : '') +
      sec('القراءة') + '<div class="list mx">' +
      '<button class="li" id="s-rd"><div class="ic">' + icon('text') + '</div><div class="grow"><div class="t">مظهر المصحف</div><div class="s">' + esc(readerSummary()) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      segRow('طريقة العرض', '', 'readMode', [['surah', 'سورة'], ['page', 'صفحات']]) +
      '<button class="li" id="s-rec"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">القارئ</div><div class="s">' + esc(reciterName(Settings.reciter)) + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<div class="li"><div class="ic">' + icon('layers') + '</div><div class="grow"><div class="t">إكمال المصحف تلقائيًا</div><div class="s">السورة التي لا تسجيل لها بصوت قارئك تُتلى بصوت قارئ قريب من أسلوبه</div></div><button class="switch ' + (Settings.recFill !== false ? 'on' : '') + '" id="s-fill"></button></div>' +
      (Settings.recFill !== false ? '<button class="li" id="s-fillw"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">القارئ المكمِّل</div><div class="s">' + esc(Settings.recFillWith ? reciterName(Settings.recFillWith) : 'تلقائي — الأقرب إلى أسلوب قارئك') + '</div></div><div class="end">' + icon('chev') + '</div></button>' : '') +
      '<button class="li" data-go="downloads"><div class="ic">' + icon('save') + '</div><div class="grow"><div class="t">تنزيلات التلاوة</div><div class="s">استمع دون إنترنت</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '</div>' +
      sec('بياناتك') + '<div class="list mx">' +
      '<button class="li" data-go="backup"><div class="ic">' + icon('save') + '</div><div class="grow"><div class="t">النسخ الاحتياطي والاستعادة</div><div class="s">' +
        (Backup.lastAt() ? 'آخر نسخة: ' + fmtG(new Date(Backup.lastAt())) : 'احفظ بستانك وسجلّاتك في ملف') + '</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="qada"><div class="ic">' + icon('history') + '</div><div class="grow"><div class="t">قضاء الفوائت</div><div class="s">الصلوات الفائتة وأيام الصيام</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="badges"><div class="ic">' + icon('medal') + '</div><div class="grow"><div class="t">أوسمتي</div><div class="s">' + N(Badges.earned()) + ' من ' + N(BADGE_TOTAL) + '</div></div><div class="end">' + icon('chev') + '</div></button></div>' +
      sec('عام') + '<div class="list mx"><div class="li"><div class="ic">' + icon('vib') + '</div><div class="grow"><div class="t">الاهتزاز</div><div class="s">عند التسبيح وعدّ الأذكار</div></div><button class="switch ' + (Settings.vibrate ? 'on' : '') + '" id="s-vib"></button></div>' +
      '<button class="li" id="s-onb"><div class="ic">' + icon('sparkle') + '</div><div class="grow"><div class="t">إعادة جولة الترحيب</div></div><div class="end">' + icon('chev') + '</div></button>' +
      '<button class="li" data-go="about"><div class="ic">' + icon('info') + '</div><div class="grow"><div class="t">عن التطبيق</div><div class="s">الإصدار ' + APP_VERSION + '</div></div><div class="end">' + icon('chev') + '</div></button></div>';
  },
  mount(el) {
    settingsSearch(el);
    $$('[data-seg]', el).forEach(s => s.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const k = s.dataset.seg; let v = b.dataset.v;
      if (k === 'hijriOffset') v = +v;
      setSetting(k, v); $$('button', s).forEach(x => x.classList.toggle('on', x === b));
      if (k === 'theme' || k === 'warm') { applyTheme(); Router.refresh(); } else if (k === 'uiScale') { applyUiScale(); } else if (['digits', 'clock', 'gmonths', 'asr'].includes(k)) Router.refresh();
    }));
    $('#s-m', el).onclick = () => methodSheet(() => Router.refresh());
    $('#s-hl', el).onclick = () => pickSheet('خطوط العرض العليا', 'لتقدير الفجر والعشاء حين لا تغيب الشفق (شمال أوروبا مثلًا)', [
      { v: 'angle', t: 'حسب الزاوية', s: 'الأدق غالبًا' }, { v: 'middle', t: 'منتصف الليل', s: '' }, { v: 'seventh', t: 'سُبع الليل', s: '' }], Settings.highLat, v => { setSetting('highLat', v); Router.refresh(); });
    $('#s-adj', el).onclick = () => adjustSheet(() => Router.refresh());
    $('#s-hj', el).onclick = () => hijriAdjSheet(() => Router.refresh());
    $('#s-rd', el).onclick = () => loadQuran().then(() => readerSettings()).catch(() => readerSettings());
    $('#s-vib', el).onclick = e => { setSetting('vibrate', !Settings.vibrate); e.currentTarget.classList.toggle('on', Settings.vibrate); if (Settings.vibrate) vibrate(30); };
    $('#s-onb', el).onclick = () => Onboarding.show();
    $$('[data-nt]', el).forEach(b => b.onclick = () => { const k = b.dataset.nt, nt = Object.assign({}, Settings.notif); nt[k] = !nt[k]; setSetting('notif', nt); b.classList.toggle('on', nt[k]);
      if (nt[k]) Native.call('ensureNotifPermission'); });
    const pre = $('#s-pre', el); if (pre) pre.onclick = () => pickSheet('تذكير قبل الصلاة', '', [0, 5, 10, 15, 20, 30].map(v => ({ v, t: v ? 'قبل ' + pM(v) : 'بدون تذكير' })), Settings.preNotif, v => { setSetting('preNotif', v); Router.refresh(); });
    const pm = $('#s-perm', el); if (pm) pm.onclick = () => notifHealthSheet();
    $('#s-th', el).onclick = () => themeSheet();
    $('#s-acc', el).onclick = e => { if (e.target.closest('#s-acc-c')) { accentSheet(); return; } const b = e.target.closest('[data-acc]'); if (!b) return; setSetting('accent', b.dataset.acc); setSetting('accentAuto', false); vibrate(6);
      const go = () => { applyTheme(); Router.refresh(); }; if (typeof Motion !== 'undefined') Motion.reveal(e, go); else go(); };
    const snd = $('#s-snd', el); if (snd) snd.onclick = () => soundSheet();
    $$('[data-rm]', el).forEach(b => b.onclick = () => { const k = b.dataset.rm, rm = Object.assign({}, Settings.remind); rm[k] = !rm[k]; setSetting('remind', rm); b.classList.toggle('on', rm[k]);
      if (rm[k]) Native.call('ensureNotifPermission'); Notif.schedule(); });
    $$('[data-rt]', el).forEach(b => b.onclick = () => {
      const k = b.dataset.rt;
      if (k === 'jumua') { pickSheet('تذكير صلاة الجمعة', 'قبل دخول وقت الظهر يوم الجمعة', [30, 45, 60, 90, 120].map(v => ({ v, t: 'قبل وقت الجمعة بـ ' + pM(v) })), Settings.remJumua || 45, v => { setSetting('remJumua', v); Notif.schedule(); Router.refresh(); }); return; }
      if (k === 'sleep') { pickSheet('وقت أذكار النوم', '', ['21:30', '22:00', '22:30', '23:00', '23:30', '00:00'].map(v => ({ v, t: fmtClock(v) })), Settings.remSleep, v => { setSetting('remSleep', v); Notif.schedule(); Router.refresh(); }); return; }
      const key = k === 'azm' ? 'remAzm' : 'remAze', base = k === 'azm' ? 'الفجر' : 'العصر';
      pickSheet('موعد التذكير', 'بعد ' + base, [10, 20, 30, 45, 60, 90].map(v => ({ v, t: 'بعد ' + base + ' بـ ' + pM(v) })), Settings[key], v => { setSetting(key, v); Notif.schedule(); Router.refresh(); });
    });
    $$('[data-pin]', el).forEach(b => b.onclick = () => { const ok = Native.has('canPinWidget') && Native.call('canPinWidget') && Native.call('pinWidget', b.dataset.pin);
      if (!ok) toast('اضغط مطوّلًا على الشاشة الرئيسية ← الأدوات (Widgets) ← وسن', 4200); });
    const rec = $('#s-rec', el); if (rec) rec.onclick = () => reciterSheet(() => Router.refresh());
    const lg = $('#s-logo', el); if (lg) lg.onclick = () => { const on = ((Settings.home && Settings.home.brand) || 'logo') !== 'logo'; setHome('brand', on ? 'logo' : 'none'); lg.classList.toggle('on', on); vibrate(8); toast(on ? 'سيظهر شعار «وسن» في الرئيسية' : 'أُخفي الشعار من الرئيسية'); };
    const fl = $('#s-fill', el); if (fl) fl.onclick = () => { setSetting('recFill', Settings.recFill === false); vibrate(8); Router.refresh(); };
    const fw = $('#s-fillw', el); if (fw) fw.onclick = () => fillWithSheet(() => Router.refresh());
    bindRemindVoice(el); if ($('#rv-tts', el) && Settings.remVoice && Native.has('ttsCheck')) Native.call('ttsCheck');
  },
};
const REMINDERS = [
  ['azm', 'sun', 'أذكار الصباح', () => 'بعد الفجر بـ ' + pM(Settings.remAzm || 30)],
  ['aze', 'moon', 'أذكار المساء', () => 'بعد العصر بـ ' + pM(Settings.remAze || 30)],
  ['kahf', 'book', 'سورة الكهف', () => 'يوم الجمعة ' + fmtClock('10:00')],
  ['jumua', 'mosque', 'صلاة الجمعة', () => 'قبل وقت الجمعة بـ ' + pM(Settings.remJumua || 45)],
  ['fast', 'calendar', 'صيام الاثنين والخميس', () => 'تذكير في الليلة السابقة'],
  ['white', 'moonstar', 'الأيام البيض', () => 'قبل 13 من كل شهر هجري'],
  ['qiyam', 'star8', 'قيام الليل', () => 'عند بدء الثلث الأخير'],
  ['sleep', 'moon', 'أذكار النوم', () => fmtClock(Settings.remSleep || '22:30')],
];
function soundTitle() {
  try { if (Native.has('soundInfo')) { const j = JSON.parse(Native.call('soundInfo') || '{}'); if (j.title) return j.title; } } catch (e) {}
  return SOUND_NAMES.adhan;
}
/* وسن 4.4 · صوت الأذان: الأذان كاملًا بصوت مؤذّن حقيقي، أو التكبير فقط، أو نغمة */
const ADHAN_VOICES = [['v1', 'أذان هادئ', 'صوت رخيم بإيقاع متأنٍّ'], ['v2', 'من المسجد النبوي', 'تسجيل بصدى المسجد'], ['v3', 'صباح فخري', 'أذان بمقام شامي أصيل'], ['v4', 'أذان صافٍ', 'تسجيل نقيّ واضح · أقصر'], ['v5', 'أذان خاشع', 'صوت دافئ متأنٍّ']];
function soundSheet() {
  let info = { mode: 'adhan', voice: 'v1' };
  try { info = Object.assign(info, JSON.parse(Native.call('soundInfo') || '{}')); } catch (e) {}
  const pv = v => v === 'custom' || v === 'silent' ? '' : '<button class="act pv" data-pv="' + v + '" aria-label="استماع">' + icon('play') + '</button>';
  const opt = (v, t, s) => '<div class="li opt ' + (v === info.mode ? 'on' : '') + '" data-v="' + v + '"><div class="grow"><div class="t">' + t + '</div><div class="s">' + s + '</div></div>' + pv(v) + '<span class="rad"></span></div>';
  const voices = '<div class="snd-voice" id="sd-vo"' + (['adhan', 'takbir'].includes(info.mode) ? '' : ' hidden') + '><div class="snd-vl">' + icon('wave') + 'المؤذّن · اضغط للاستماع</div><div class="snd-vg">' +
    ADHAN_VOICES.map(([v, t, sb]) => '<button data-vo="' + v + '" class="' + (v === info.voice ? 'on' : '') + '"><b>' + t + '</b><small>' + sb + '</small></button>').join('') + '</div></div>';
  const html = '<div class="sh-t">صوت الأذان</div><div class="sh-s">يُرفع عند دخول وقت كل صلاة فعّلت تنبيهها</div>' +
    '<div class="snd-g">الأذان</div>' + opt('adhan', 'الأذان كاملًا', 'بصوت المؤذّن حتى نهايته، مع زر «إيقاف» في الإشعار') + opt('takbir', 'التكبير فقط', '«الله أكبر» الأولى ثم يسكت — تنبيه قصير') + voices +
    '<div class="snd-g">نغمات</div>' + opt('chime', 'نغمة وسن', 'نغمة هادئة خاصة بالتطبيق') + opt('system', 'نغمة الإشعارات الافتراضية', 'نغمة هاتفك المعتادة') +
    opt('custom', 'اختر من نغمات هاتفك', 'نغمة أو أذان محفوظ في هاتفك') + opt('silent', 'اهتزاز فقط', 'بدون صوت') +
    '<div class="snd-note">' + icon('info') + '<span>يحترم الأذانُ الوضعَ الصامت و«عدم الإزعاج»، ويتوقف عند مكالمة. في الفجر يُستعمل التسجيل نفسه.</span></div>' +
    '<div class="mx" style="margin-top:10px"><button class="btn ghost block" id="sd-ch">' + icon('gear') + 'إعدادات القناة في النظام</button></div>';
  let playing = null;
  const setPv = (el, v) => { playing = v; $$('[data-pv]', el).forEach(b => { const on = b.dataset.pv === v; b.classList.toggle('on', on); b.innerHTML = icon(on ? 'stop' : 'play'); }); };
  Sheet.open(html, el => {
    window.onPreviewEnd = () => { if (Sheet.el === el) setPv(el, null); };
    el.addEventListener('click', e => {
      const p = e.target.closest('[data-pv]');
      if (p) { e.stopPropagation(); const v = p.dataset.pv;
        if (playing === v) { Native.call('stopPreview'); setPv(el, null); } else { Native.call('previewSound', v); setPv(el, v); } return; }
      const vo = e.target.closest('[data-vo]');
      if (vo) { e.stopPropagation(); Native.call('setAdhanVoice', vo.dataset.vo); $$('[data-vo]', el).forEach(x => x.classList.toggle('on', x === vo));
        info.voice = vo.dataset.vo; Native.call('previewSound', 'takbir'); setPv(el, 'takbir');
        const s = $('#s-snd-s'); if (s) s.textContent = soundTitle(); Notif.schedule(); return; }
      const o = e.target.closest('[data-v]'); if (!o) return;
      const v = o.dataset.v;
      if (v === 'custom') { Native.call('stopPreview'); Sheet.close(() => Native.call('pickAdhanSound')); return; }
      Native.call('setAdhanSound', v); info.mode = v; $$('.opt', el).forEach(x => x.classList.toggle('on', x === o));
      const vb = $('#sd-vo', el); if (vb) vb.hidden = !['adhan', 'takbir'].includes(v);
      const s = $('#s-snd-s'); if (s) s.textContent = soundTitle(); Notif.schedule();
    });
    $('#sd-ch', el).onclick = () => Native.call('openChannelSettings', 'adhan');
  }, () => { Native.call('stopPreview'); window.onPreviewEnd = null; });
}
window.onAdhanSound = function (j) { try { const s = $('#s-snd-s'); if (s) s.textContent = j.title || SOUND_NAMES[j.mode] || ''; toast('صوت الأذان: ' + (j.title || '')); } catch (e) {} };

/* ═══════════════ عن التطبيق ═══════════════ */
const APP_VERSION = (window.NoorBridge && typeof NoorBridge.appVersion === 'function' && (() => { try { return NoorBridge.appVersion(); } catch (e) { return ''; } })()) || '7.1';
const WHATS_NEW = [
  ['7.1', [['sparkle', 'حركة احترافية في كل التطبيق', 'انتقالات ناعمة بين الصفحات تعرف اتجاهك (للأمام والرجوع والتبويبات)، وأقسام تظهر بتتابع هادئ، ومؤشّر ينزلق في شريط التنقل، وأرقام تعدّ وحلقات تُرسم وعلامة إنجاز تُخطّ — وكلها خفيفة لا تُثقل الهاتف'],
    ['palette', 'الثيم الجديد يتّسع كدائرة', 'حين تختار ثيمًا أو لونًا ينتشر الجديد كدائرة من موضع لمستك نفسه'],
    ['layers', 'أوراق تُسحب لتُغلق', 'كل ورقة سفلية تصعد بنابض ناعم، وتُغلقها بسحبها إلى الأسفل كما في تطبيقات أندرويد الحديثة'],
    ['gear', 'تحكّم كامل بالحركة', 'من الإعدادات: «كاملة» أو «هادئة» أو «بدون» — و«بدون» يوقف الزخارف المتحركة ويوفّر البطارية'],
    ['search', 'بحث في الإعدادات', 'اكتب ما تريد (الأذان، الخط، القارئ، الحركة…) فتظهر الإعدادات المطابقة فورًا'],
    ['flame', 'أسرع وأثبت', 'صفحة «بستانك» تفتح أسرع بنحو ١٥ مرة، والرجوع يعيدك إلى موضعك في القائمة، وإصلاح النقرات السريعة المتتالية على التبويبات وزر الرجوع وأزرار الإغلاق']]],
  ['7.0', [['palette', 'الكتاكيت والأرانب', 'ثيمان كاملان مرسومان بالكامل مثل الفراشات: كتاكيت تمشي على العشب وتفقس من البيض بين عبّاد الشمس، وأرانب تقفز في مرج ليلكيّ مع الجزر والنفل — بمسبحتهما وزينتهما وبستانهما'],
    ['star8', 'ثيمات رجالية بصور حقيقية', 'صقر الصحراء، والخيل العربية، والأسد، وليل الصحراء بدرب التبّانة، والربع الخالي، وشراع الغروب، وجبل شمس، والقمر، وحافة العالم — بألوان مشتقة من كل صورة'],
    ['home', 'الشاشة الرئيسية كما تحب', 'أظهر شعار «وسن» أو أخفِه أو ضع مكانه تحية باسمك، وأخفِ أي جزء من الرئيسية (قوس الشمس، العدّ التنازلي، التاريخ، الأقسام…) واختر اختصاراتك من ٤ إلى ١٢ بالترتيب الذي تريده'],
    ['headphones', 'المصحف كاملًا مع كل قارئ', 'السورة التي لا يوجد لها تسجيل بصوت قارئك تُتلى تلقائيًا بصوت قارئ قريب من أسلوبه (أو من تختاره) ثم يعود إلى قارئك — و٢٤ قارئًا جديدًا آية بآية، وتراويح الحرمين كاملة من ١٤٤٢ إلى ١٤٤٧ هـ، والشحات محمد أنور وعزيز عليلي ومحمد حسان وعبدالرزاق الدليمي، مع تصفية سريعة للقرّاء']]],
  ['6.3', [['bell', 'الأذان في دقيقته تمامًا', 'يُرفع الأذان الآن بأولوية المنبّه فلا يؤخّره توفير البطارية، ويُضبط على الدقيقة المعروضة نفسها. وإن نقص إذن نعرض لك خطوة الإصلاح بوضوح (الإشعارات، المنبّهات، البطارية، التشغيل التلقائي) مع سجلّ «آخر ما وصل» لتتأكد بنفسك'],
    ['target', 'ضبط المواقيت على مسجدك', 'أدخل مواقيت اليوم كما في تقويم مسجدك أو وزارة بلدك، فيستنتج وسن زاويتي الفجر والعشاء وفروق الدقائق ويحسب بها مواقيت كل الأيام والأذان'],
    ['globe', 'مواقيت دقيقة في كل البلدان', 'طرق الحساب الرسمية بفروقها (الأردن وفلسطين، تركيا، المغرب، الإمارات…) مطابقة للجهات الرسمية بالدقيقة، و٧٣٠٠ مدينة في ٢٤٤ دولة بالعربية واللاتينية، وتحديد الموقع يخبرك بالسبب إن تعذّر (الموقع مغلق أو الإذن مرفوض) مع زرّ الإصلاح'],
    ['headphones', 'قرّاء أكثر', 'عبدالله أحمد شعبان صار ٥٧ سورة (منها البقرة ويوسف ومريم وطه)، وعبدالرحمن مسعد ٣٦ (منها هود والإسراء والفرقان)، و٣٠ قارئًا جديدًا منهم عبدالعزيز التركي وأحمد عيسى المعصراوي وإبراهيم الدوسري وعبدالله الجهني وطارق محمد — مع قسم «الأشهر والأحدث»']]],
  ['6.2', [['shield', 'جاهز لمتجر Google Play وأندرويد 16', 'يستهدف أندرويد 16 كما يشترط المتجر، وتتلوّن أشرطة النظام مع ثيمك في كل إصدارات أندرويد، ولوحة المفاتيح لا تغطي الحقول — وأذونات أقل: إذن المنبّهات الدقيقة يُطلب منك عند الحاجة فقط']]],
  ['6.1', [['palette', 'ثيمات 4.6 المشرقة في المقدمة', 'الفراشات الزرقاء، والورد، والنجمة، والفراولة، والأزهار، ثم المشاهد (أزهار الكرز، حديقة الورود، حقل الخزامى) والناعمة الوردية — برسومها وألوانها وترتيبها كما كانت في 4.6 تمامًا، في أول قائمة الثيمات'],
    ['sun', 'مشرقة دائمًا', 'مشاهد الثيمات الفاتحة تبقى نهارية مشرقة حتى في الليل — ومن «الثيمات ← سماء المشهد» اختر «تتبع الوقت» إن أحببت أن تُظلم السماء بعد المغرب كما في 4.6'],
    ['sparkle', 'ستة ثيمات حيّة مشرقة', 'حديقة الفراشات (فراشات ملوّنة ترفرف وتطير)، وفقاعات، وقوس قزح، وربيع الكرز، وبالونات، وبحر مشمس — نهارية بكتابة داكنة واضحة، وتتوقف حركتها حين لا تظهر لتبقى البطارية بخير']]],
  ['6.0', [['headphones', 'سور أكثر بأصوات قرّائك — مع متابعة الآيات', 'أحمد خضر ٦٩ سورة، ومحمود الشحات أنور ٦٤، وعبدالرحمن مسعد ١٧، وعبدالله شعبان ٣٠ — تُسمَع من أرشيف الإنترنت أو تُنزَّل لتعمل دون إنترنت، وتوقيت كل آية محسوب من التسجيل نفسه فيتابعها المصحف. وإن لم تتوفّر سورة بصوت قارئك اقترحنا لها وحدها صوتًا بديلًا ثم نعود إلى قارئك'],
    ['palette', 'الفراشات كما كانت — وثيمات حيّة جديدة', 'عاد ثيم الفراشات الزرقاء بحركته وألوانه الأصلية تمامًا، ومعه «فراشة المورفو» بصورتها الحقيقية، وأربعة ثيمات حيّة جديدة: ليلة النجوم بشهبها، والفوانيس، والثلج، وبتلات الورد'],
    ['vol', 'مؤثرات صوتية تعمل فعلًا', 'صوت الحبّات والنقر صار بمحرّك الصوت الأصلي في الهاتف، فيعمل دائمًا وبلا تأخير — مع تنبيه إن كان صوت الوسائط صامتًا'],
    ['grid', 'لوحة الاستغفار بلا موسيقى', 'حُذفت الرنّة الموسيقية: مع كل استغفار صوت حبّة هادئ، وعند اكتمال اللوحة يقول الشيخ فارس عبّاد «أستغفر الله وأتوب إليه» — ويمكنك جعله كل ٣٣ أو إيقافه'],
    ['beads', 'مسبحة أذكى', 'تسبيح «دبر الصلاة» تلقائيًّا ٣٣ / ٣٣ / ٣٤، وزرّ «تراجع» للعدّة الخاطئة، والعدّ بزرّ الصوت دون النظر إلى الشاشة، وصوت الشيخ بالذكر نفسه عند تمام كل دورة، وأصوات حبّات طبيعية بلا نغمات — والشاشة لا تنطفئ أثناء التسبيح']]],
  ['5.1', [['palette', 'عادت ثيماتك القديمة — وأجمل', 'رجعت الثيمات المرسومة التي أحببتِها (الفراشات، الساكورا، الوردي، الليلي…) كما كانت بمشاهدها، ومعها ١٠ صور إسلامية بأعلى دقة متاحة'],
    ['waves', 'ثيمات متحرّكة', 'موج، وغيم، وأوراق الشجر، ومطر، وشفق قطبي — حركة ناعمة تتوقف تلقائيًّا حين لا تظهر لتبقى البطارية بخير'],
    ['grid', 'لوحة الاستغفار بالتلوين', 'اختر صورة أو كلمة (أستغفر الله، الله، اسمٌ تحبّه…) فتبدأ رمادية كصفحة تلوين، ومع كل استغفار يتلوّن مربّع حتى تكتمل الصورة — ١٠٠ أو ٣٠٠ أو ١٠٠٠ مربّع'],
    ['globe', 'المواقيت لكل العالم', 'طريقة الحساب تُختار تلقائيًّا لكل دول العالم، وتوقيت المدينة البعيدة بساعتها المحلية، ومعالجة المناطق القطبية، وإدخال الإحداثيات يدويًّا، وتحديث الموقع عند السفر — و٣٧٠ مدينة في ١٣٧ دولة'],
    ['headphones', 'كل القرّاء مع المصحف', 'القرّاء الذين لا توقيت لهم (ومنهم قرّاؤك المختارون) صاروا يبدؤون من الآية التي تختارها ويتابعون الآيات والصفحات — وإن تقدّمت المتابعة أو تأخّرت فاضغط على الآية: «الشيخ يقرأ هذه الآن»']]],
  ['5.0', [['palette', 'ثيمات بصور حقيقية عالية الدقة', '٣٦ ثيمًا بصور فوتوغرافية فائقة الوضوح: مكة المكرمة، المدينة المنوّرة، المسجد الأقصى، جامع الجزائر، أقواس قرطبة، قبّة أصفهان، المسجد الوردي… وألوان كل ثيم مأخوذة من صورته نفسها'],
    ['image', 'صورتك من الهاتف', 'ضع أي صورة من معرض هاتفك خلفيةً للصفحة الرئيسية، ثم حرّكها وكبّرها واضبط تعتيمها ولون الكتابة فوقها'],
    ['beads', 'مسبحة حقيقية', 'حبّات على خيط تسحبها بإصبعك فتسقط وتطقطق كالمسبحة في يدك، مع الفواصل والإمام والشُّرّابة — خشب الصندل، الكهرمان، اللؤلؤ، الفيروز، العقيق اليماني، الأونيكس، وذهب الثيم'],
    ['sparkle', 'شعار جديد', '«وسن» بخط النستعليق، وقد صارت نقطة النون نجمة ثمانية يحضنها قوس النون كالهلال'],
    ['leaf', 'أهدأ وأخفّ وأسلس', 'لا حركة دائمة في الخلفيات ولا ضبابية مكلفة: المعالج يرتاح وأنت على الصفحة الرئيسية، والتمرير أنعم، والبطارية تدوم أطول'],
    ['heart', 'لوحة الهدية بالصور', 'لوحات الهدية صارت بصور الثيمات الحقيقية، وتتبع ثيمك تلقائيًّا']]],
  ['4.8', [['palette', 'تسعة ثيمات فخمة إسلامية', 'ليل مكة، المدينة المنوّرة، قبّة الصخرة، قصر الحمراء، إزنيك العثماني، ذهب المماليك، لازورد أصفهان، فوانيس رمضان، والتذهيب — لكل ثيم مشهده المرسوم ونقشته وحبّاته'],
    ['headphones', 'قرّاؤك المختارون دون إنترنت', 'أحمد خضر، عبدالله شعبان، عبدالرحمن مسعد، ومحمود الشحات أنور — أكثر من ست ساعات من التلاوة تعمل دون إنترنت ودون تنزيل'],
    ['vol', 'صوت بشري حقيقي للأذكار', 'اختر الأذكار التي تُقرأ بصوت الشيخ فارس عبّاد حين تظهر («اللهم صلّ وسلّم على نبينا محمد»، «أستغفر الله وأتوب إليه»، «سبحان الله وبحمده»…) وتبقى البقية بنغمتها الهادئة'],
    ['beads', 'مسبحة بثلاثة أشكال', 'دائرة الحبّات، ومسبحة حبّات حقيقية تُحرّك حبّاتها بإصبعك، وعدّاد كبير — مع نغمة هادئة مريحة وزينة الثيم مع كل تسبيحة'],
    ['alarm', 'المنبّه', 'منبّه قبل الفجر يتغيّر مع المواقيت كل يوم، ومنبّه قيام الليل، ومنبّهاتك بأيام التكرار — بشاشة كاملة فوق القفل وصوت يعلو بلطف وغفوة'],
    ['minaret', 'ثلاثة أصوات جديدة للأذان', 'صباح فخري، وأذان صافٍ، وأذان خاشع — مع التكبير القصير لكل صوت'],
    ['heart', 'لوحة الاستغفار', 'فسيفساء إسلامية من مئة قطعة تُضاء مع كل استغفار وتكتمل بنجمة ذهبية — لكل يوم تصميم، ومعرضٌ للوحاتك المكتملة'],
    ['sparkle', 'لوحة الهدية', 'بطاقة دعاء وإهداء بمشهد من ثيمات وسن وأدعية مأثورة لمن تحبّ — شاركها صورةً جميلة'],
    ['target', 'العادات والمهام أذكى', 'عادات الصباح والمساء، وبطاقة لكل عادة بأطول سلسلة ونسبة الالتزام وخريطة ١٢ أسبوعًا — ومهام بخطوات وتكرار وبحث وقسم للمتأخرة']]],
  ['4.7', [['bell', 'الأذكار المنبثقة', 'ذكرٌ لطيف يظهر لك كل مدة تختارها (من… إلى…) وفي الأيام التي تحدّدها، مع عدد التكرار — إشعارًا منبثقًا أو نافذة عائمة فيها زرّ للعدّ'],
    ['vol', 'التذكير الصوتي', 'يُقرأ الذكر أو عنوان التذكير بصوت هادئ (أذكار الصباح والمساء، الكهف، العادات…) — بصوت النطق العربي في هاتفك'],
    ['leaf', 'أصوات مريحة أثناء القراءة', 'تسجيلات جديدة هادئة نُقّيت من الحدّة، بمستوى أخفض وبدء أنعم، وصوت جديد «هدوء عميق»'],
    ['sprout', 'البستان المرسوم', 'مرج أزهار يتنوّع مع النموّ، ممشى وجسر، زنابق ولوتس، نخيل وتمر، رمّان، فوانيس، طيور وحمائم، ونافورة — و«حديقة أيامك»'],
    ['sparkle', 'حركة أجمل في الثيمات', 'فراشات أكثر، وأشعة ضوء، وشهب، وقلوب وبتلات، ورمز الثيم يطير من المسبحة مع كل تسبيحة'],
    ['beads', 'أصوات المسبحة', 'حبّة خشبية أو قطرة ماء أو نقرة ناعمة — ونغمة لطيفة عند إتمام الدورة (اختيارية)']]],
  ['4.6', [['palette', 'خمسة ثيمات كاملة برسوم خاصة', 'الفراشات الزرقاء، الورد، النجمة، الفراولة، الأزهار — لكل ثيم مشهده المرسوم وألوانه وزينة بطاقاته'],
    ['beads', 'مسبحة بطابع كل ثيم', 'لؤلؤ أزرق ووردي، نجوم ذهبية، فراولات صغيرة، ولؤلؤ ملوّن حول الدائرة'],
    ['sparkle', 'زينة متحرّكة هادئة', 'فراشات ترفرف، بتلات تتساقط، نجوم معلّقة، وقلوب صغيرة — وتهدأ ليلًا'],
    ['book', 'المصحف بلا زينة', 'تتغيّر ألوان الصفحة فقط احترامًا لكلام الله']]],
  ['4.5', [['palette', 'سمات جديدة ناعمة ومختلفة', 'وردي ناعم، ليل وردي، لافندر، خوخي، ذهبي وردي، بنفسجي حالم وغيرها — مع لون من اختيارك'],
    ['headphones', 'أكثر من ٢٣٠ قارئًا', 'سورة كاملة مع متابعة الآيات، وتنزيل السور للاستماع دون إنترنت'],
    ['leaf', 'أصوات الطبيعة أثناء القراءة', 'أمواج ومطر وعصافير ونسيم وجدول وليل هادئ، تهدأ وحدها عند التلاوة'],
    ['marker', 'تظليل الآيات وتدوين التدبّر', 'خمسة ألوان للتظليل، وملاحظة لكل آية تجدها في «المحفوظات»'],
    ['text', 'إعدادات أوسع للمصحف', 'خطّان، تسع خلفيات، تباعد ومحاذاة، تخفيف السطوع، قراءة كاملة، تمرير تلقائي، ومواضع السجود'],
    ['clock', 'مؤقّت النوم وحجم خط التطبيق', 'تتوقّف التلاوة بهدوء بعد المدة التي تختارها']]],
  ['4.4', [['minaret', 'الأذان كاملًا بصوت مؤذّن حقيقي', 'صوتان للاختيار، وزر «إيقاف» في الإشعار وداخل التطبيق'], ['hands', 'دعاء ما بعد الأذان', 'يظهر في المواقيت بعد دخول الوقت مع زر «صلّيت»'],
    ['mosque', 'تذكير صلاة الجمعة', 'قبل وقت الجمعة بالمدة التي تختارها'], ['shield', 'تجربة الأذان', 'تأكّد بنفسك أن الأذان يصلك في وقته']]],
  ['4.3', [['moonstar', 'رمضان يومًا بيوم', 'الإمساك والإفطار وعدّ تنازلي وتسجيل الصيام'], ['bell', 'أذان أوثق', 'جدولة ثلاثين يومًا تتجدّد وحدها حتى لو لم تفتح التطبيق'],
    ['beads', 'إصلاحات', 'المسبحة وسجلّ الأسبوع وأزرار آية اليوم على الشاشات الصغيرة']]],
];
SCREENS.about = {
  parent: 'more',
  mount(el) { const b = $('#ab-ph', el); if (b) b.onclick = () => photoCreditsSheet(); },
  render() {
    return hdr('عن وسن', '', { back: true, compact: true }) +
      '<div class="center" style="padding:28px 20px 6px"><img class="about-logo" src="img/icon.png" alt="">' + wordmark('wm-about') + '' +
      '<div class="faint">الإصدار ' + APP_VERSION + '</div><p class="muted" style="margin-top:12px;line-height:1.9;font-size:14px">رفيقك اليومي للصلاة والقرآن والذكر: مواقيت دقيقة بطرق حساب متعددة، مصحف كامل بالرسم العثماني مع البحث والعلامات والختمة، أذكار من الكتاب والسنة، قبلة، مسبحة، تقويم هجري وحاسبة زكاة — كل ذلك دون إنترنت ودون إعلانات.</p></div>' +
      WHATS_NEW.map(([v, xs], vi) => sec('ما الجديد في ' + N(v)) + '<div class="list mx' + (vi ? ' wn-old' : '') + '">' + xs.map(([ic, t, s]) => '<div class="li"><div class="ic' + (vi ? '' : ' g') + '">' + icon(ic) + '</div><div class="grow"><div class="t">' + t + '</div><div class="s">' + s + '</div></div></div>').join('') + '</div>').join('') +
      sec('المصادر والتراخيص') + '<div class="list mx">' +
      '<div class="li"><div class="ic">' + icon('book') + '</div><div class="grow"><div class="t">نص القرآن الكريم</div><div class="s">الرسم العثماني برواية حفص عن عاصم، بخط مجمّع الملك فهد (KFGQPC Uthmanic Hafs)</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('text') + '</div><div class="grow"><div class="t">الخطوط</div><div class="s">IBM Plex Sans Arabic وReem Kufi وAmiri وAmiri Quran — رخصة SIL Open Font License 1.1</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('palette') + '</div><div class="grow"><div class="t">الرسوم والرموز</div><div class="s">رسوم البستان مرسومة خصيصًا لوسن، والرموز ثلاثية الأبعاد من Fluent Emoji (مايكروسوفت) برخصة MIT</div></div></div>' +
      '<button class="li" id="ab-ph"><div class="ic">' + icon('image') + '</div><div class="grow"><div class="t">صور الثيمات</div><div class="s">١١ صورة بأعلى دقة من ويكيميديا كومنز برخص حرّة (CC0، ملك عام، CC BY، CC BY-SA) — اضغط لرؤية اسم كل مصوّر ورخصته</div></div>' + icon('chev', 'faint') + '</button>' +
      '<div class="li"><div class="ic">' + icon('sparkle') + '</div><div class="grow"><div class="t">الشعار (5.0)</div><div class="s">«وسن» بخط Noto Nastaliq Urdu من Google برخصة SIL Open Font License</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('globe') + '</div><div class="grow"><div class="t">بيانات المدن</div><div class="s">إحداثيات المدن ومناطقها الزمنية من GeoNames.org برخصة CC BY 4.0، وأسماؤها العربية من ويكي بيانات Wikidata (CC0)</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('hands') + '</div><div class="grow"><div class="t">الأذكار والأدعية</div><div class="s">من كتاب «حصن المسلم» وكتب السنة مع ذكر المصدر لكل ذكر</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('clock') + '</div><div class="grow"><div class="t">المواقيت والتقويم</div><div class="s">حساب فلكي محلي، والتاريخ الهجري وفق تقويم أم القرى مع إمكانية التعديل</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('minaret') + '</div><div class="grow"><div class="t">تسجيلات الأذان</div><div class="s">«أذان هادئ»: Adam-synagda — ملك عام CC0 · «من المسجد النبوي»: ejaz215 (Freesound) — CC BY 3.0 · «صباح فخري»: ملك عام · «أذان صافٍ»: Aaqib Azeez عبر Atcovi — CC BY-SA 4.0 · «أذان خاشع»: Andrewler — CC BY-SA 4.0 · كلها عبر ويكيميديا كومنز</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('vol') + '</div><div class="grow"><div class="t">الصوت البشري للأذكار (4.8)</div><div class="s">مقاطع قصيرة من تسجيل «أذكار الصباح والمساء» بصوت الشيخ فارس عبّاد، ومن دعائه «الله أكبر الله أكبر مما نخاف ونحذر» — من أرشيف الإنترنت archive.org (موسومة بعلامة الملكية العامة من رافعها)</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">تلاوات قرّائك المختارين (4.8)</div><div class="s">أحمد خضر · عبدالله شعبان · عبدالرحمن مسعد · محمود الشحات أنور — من مجموعات منشورة للاستماع العام في أرشيف الإنترنت archive.org (وبقية سور عبدالرحمن مسعد من way2quran.com، وعبدالله الجهني وطارق محمد من الأرشيف)، ضُغطت داخل وسن أو تُسمع منها مباشرة. الحقوق لأصحابها، وسنحذف أي تلاوة إن طلب صاحبها ذلك.</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('headphones') + '</div><div class="grow"><div class="t">التلاوات</div><div class="s">«آية بآية» من EveryAyah.com، والسور الكاملة وتوقيتات الآيات من mp3quran.net</div></div></div>' +
      '<div class="li"><div class="ic">' + icon('leaf') + '</div><div class="grow"><div class="t">أصوات الطبيعة (4.7)</div><div class="s">من Freesound وSoundBible عبر مشروع Blanket، ونقّاها وسن من الحدّة: العصافير: kvgarlic (CC0) · الجدول: gluckose (CC0) · النسيم: felix.blume (CC0) · المطر: alex36917 (CC BY) · الأمواج: Luftrum (CC BY) · صراصير الليل: Lisa Redfern (ملك عام) · «هدوء عميق» ونغمة الأذكار المنبثقة وأصوات المسبحة: مولّدة داخل وسن</div></div></div></div>' +
      '<div class="foot-note">صُنع بحبّ لخدمة المسلمين · اللهم اجعله خالصًا لوجهك الكريم</div>';
  },
};

/* ═══════════════ جولة الترحيب ═══════════════ */
const Onboarding = {
  el: null, step: 0,
  show() { this.step = 0; if (this.el) this.el.remove(); this.el = document.createElement('div'); this.el.className = 'onb'; document.body.appendChild(this.el); this.draw(); },
  done() { Store.set('onboarded', 1); if (this.el) { this.el.style.transition = 'opacity .4s'; this.el.style.opacity = '0'; const e = this.el; setTimeout(() => e.remove(), 420); this.el = null; } Router.refresh(); },
  dots() { return '<div class="dots">' + [0, 1, 2, 3, 4].map(i => '<i class="' + (i === this.step ? 'on' : '') + '"></i>').join('') + '</div>'; },
  draw() {
    const e = this.el; if (!e) return;
    if (this.step === 0) {
      e.innerHTML = '<div class="art"><img src="img/icon.png" alt="" class="onb-ic">' + wordmark('wm-onb', '#fff') + '<h2 class="onb-h">أهلًا بك</h2><p>رفيقك اليومي للصلاة والقرآن والذكر — سماءٌ تتبدّل مع مواقيتك، وبستانٌ يكبر مع كل طاعة.</p>' +
        '<div class="feat"><div>' + icon('mosque') + 'مواقيت دقيقة</div><div>' + icon('book') + 'مصحف وتلاوة</div><div>' + icon('moonstar') + 'أذكار ومسبحة</div><div>' + icon('sprout') + 'بستان بـ1000 مستوى</div></div></div>' +
        this.dots() + '<button class="btn gold block" id="o-n">ابدأ</button>';
      $('#o-n', e).onclick = () => { this.step = 1; this.draw(); };
    } else if (this.step === 1) {
      e.innerHTML = '<div class="art" style="flex:none;min-height:0;padding-top:48px"><div class="q"><div class="qi" style="' + hueVars('gold') + ';width:84px;height:84px;border-radius:28px">' + icon('pin', '', 'width:40px;height:40px') + '</div></div>' +
        '<h2>حدّد موقعك</h2><p>نحتاج موقعك لحساب مواقيت الصلاة واتجاه القبلة بدقة. لا يُرسل موقعك إلى أي جهة.</p></div>' +
        '<button class="btn gold block" id="o-gps" style="margin-top:18px">' + icon('gps') + 'استخدم موقعي الحالي</button>' +
        '<div class="search" style="margin-top:14px;background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.16);color:#fff">' + icon('search') + '<input id="o-q" placeholder="أو ابحث عن مدينتك…" autocomplete="off"></div>' +
        '<div class="list" id="o-l" style="margin-top:10px"></div>' + this.dots() + '<button class="btn ghost block" id="o-skip">لاحقًا</button>';
      // وسن 6.3: مدن العالم (عربي/لاتيني)، وتبدأ القائمة بمدن بلد الهاتف
      const draw = q => { const arr = CitySearch.find(q, 40);
        $('#o-l', e).innerHTML = arr.length ? arr.map(i => CitySearch.row(i, 'data-c', false)).join('') : '<div class="empty" style="color:rgba(255,255,255,.75)">لا نتائج — جرّب الاسم بالعربية أو اللاتينية</div>'; };
      draw('');
      $('#o-q', e).addEventListener('input', debounce(ev => draw(ev.target.value), 160));
      $('#o-l', e).onclick = ev => { const b = ev.target.closest('[data-c]'); if (!b) return;
        Loc.set(CitySearch.loc(+b.dataset.c)); this.step = 2; this.draw(); };
      $('#o-gps', e).onclick = () => { const b = $('#o-gps', e); b.innerHTML = icon('refresh', '', 'animation:spin 1s linear infinite') + 'جارٍ التحديد…';
        Loc.request((ok, why) => { if (ok) { toast('موقعك: ' + Loc.eff().label); this.step = 2; this.draw(); } else { b.innerHTML = icon('gps') + 'حاول مجددًا'; if (why === 'off' || why === 'denied') return; toast('تعذّر التحديد التلقائي — اختر مدينتك من القائمة'); } }); };
      $('#o-skip', e).onclick = () => { this.step = 2; this.draw(); };
    } else if (this.step === 2) {
      const M = NoorEngine.METHODS, sug = (Loc.get() && NoorEngine.COUNTRY_METHOD[Loc.get().cc]) || 'mwl';
      e.innerHTML = '<div class="art" style="flex:none;min-height:0;padding-top:48px"><div class="q"><div class="qi" style="' + hueVars('emerald') + ';width:84px;height:84px;border-radius:28px">' + icon('mosque', '', 'width:40px;height:40px') + '</div></div>' +
        '<h2>طريقة الحساب</h2><p>اقترحنا الطريقة المعتمدة في بلدك، ويمكنك تغييرها لاحقًا من الإعدادات.</p></div>' +
        '<div class="list" style="margin-top:16px">' + [sug].concat(NoorEngine.METHOD_ORDER.filter(k => k !== sug).slice(0, 5)).map((k, i) =>
          '<button class="li opt ' + (i === 0 ? 'on' : '') + '" data-m="' + k + '"><div class="grow"><div class="t">' + esc(M[k].name) + '</div>' + (i === 0 ? '<div class="s">مُقترحة لموقعك</div>' : '') + '</div><span class="rad"></span></button>').join('') + '</div>' +
        this.dots() + '<button class="btn gold block" id="o-done">' + icon('check') + 'التالي</button>';
      let pick = sug;
      $$('[data-m]', e).forEach(b => b.onclick = () => { pick = b.dataset.m; $$('[data-m]', e).forEach(x => x.classList.toggle('on', x === b)); });
      $('#o-done', e).onclick = () => { setSetting('method', pick === sug ? '' : pick); this.step = Notif.supported() ? 3 : 4; this.draw(); };
    } else if (this.step === 3) {
      // وسن 6.3: «ليصلك الأذان في وقته» — الإشعارات ثم المنبّهات الدقيقة (أندرويد 13/14+ يمنعهما افتراضيًا)
      const s = NotifHealth.state(), sdk = Native.has('sdkInt') ? +Native.call('sdkInt') : 0, needE = sdk === 0 || sdk >= 31, ready = s.notif && (s.exact || !needE);
      const st = (ok, t, d) => '<div class="li onb-perm ' + (ok ? 'ok' : '') + '"><div class="ic">' + icon(ok ? 'check' : 'bell') + '</div><div class="grow"><div class="t">' + t + '</div><div class="s">' + d + '</div></div></div>';
      e.innerHTML = '<div class="art" style="flex:none;min-height:0;padding-top:48px"><div class="q"><div class="qi" style="' + hueVars('gold') + ';width:84px;height:84px;border-radius:28px">' + icon('bell', '', 'width:40px;height:40px') + '</div></div>' +
        '<h2>ليصلك الأذان في وقته</h2><p>اسمح لوسن بالإشعارات والمنبّهات الدقيقة، فيُرفع الأذان عند دخول الوقت تمامًا ولو كان التطبيق مغلقًا.</p></div>' +
        '<div class="list" style="margin-top:14px">' + st(s.notif, 'الإشعارات', s.notif ? 'مسموحة' : 'لإظهار الأذان والتذكيرات') + (needE ? st(s.exact, 'المنبّهات والتذكيرات', s.exact ? 'مسموحة — الأذان في دقيقته' : 'ليُرفع الأذان في الدقيقة نفسها') : '') + '</div>' +
        this.dots() + (ready ? '<button class="btn gold block" id="o-nx">' + icon('check') + 'التالي</button>' :
        '<button class="btn gold block" id="o-al">' + icon('bell') + 'السماح الآن</button><button class="btn ghost block" id="o-nx">لاحقًا</button>');
      const nx = () => { Onboarding._perm = null; this.step = 4; this.draw(); };
      $('#o-nx', e).onclick = nx;
      const al = $('#o-al', e);
      if (al) al.onclick = () => {
        Onboarding._perm = true;
        const exact = () => { if (needE && !NotifHealth.state().exact) Native.call('requestExactAlarm'); else this.draw(); };
        if (!NotifHealth.state().notif) askNotif(ok => { if (this.el && this.step === 3) { this.draw(); if (ok) setTimeout(exact, 350); } }); else exact();
      };
    } else {
      // «ازرع بذرتك الأولى» — لحظة البداية (تحت سماء الفجر: بداية جديدة)
      const ph = 'dawn';
      e.innerHTML = '<div class="art" style="flex:none;min-height:0;padding-top:34px"><h2>ازرع بذرتك الأولى</h2>' +
        '<p id="o-pt">اضغط مطوّلًا على البذرة. ستكبر مع كل صلاة وذكر وتلاوة، عبر ألف مستوى حتى تصير واحةً غنّاء.</p></div>' +
        '<div class="plant"><div class="pl-art" id="o-art">' + Garden.render(1, { phase: ph, id: 'pl' }) + '</div>' +
        '<button class="pl-btn" id="o-hold" aria-label="ازرع البذرة">' + ringSVG(92, 6, 0, 'var(--gold-2)', 'rgba(255,255,255,.18)', 'star') + icon('sprout') + '</button>' +
        '<div class="pl-h" id="o-hint">اضغط مطوّلًا</div></div>' +
        this.dots() + '<button class="btn gold block hidden" id="o-go">' + icon('check') + 'ادخل إلى بستانك</button>';
      const hold = $('#o-hold', e), ring = hold.querySelector('svg');
      let t0 = 0, raf = 0, planted = false;
      const reset = () => { cancelAnimationFrame(raf); t0 = 0; if (!planted) { setRing(ring, 0); hold.classList.remove('press'); } };
      const step = () => {
        const f = Math.min(1, (performance.now() - t0) / 1100); setRing(ring, f);
        if (f >= 1) { planted = true; plantNow(); return; }
        raf = requestAnimationFrame(step);
      };
      const plantNow = () => {
        hold.classList.remove('press'); hold.classList.add('done'); vibrate(40);
        Growth.plant();
        const art = $('#o-art', e); art.classList.add('grow');
        setTimeout(() => { art.innerHTML = Garden.render(2, { phase: ph, id: 'pl2' }); const r = art.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height * 0.78); }, 260);
        $('#o-pt', e).textContent = 'بارك الله لك — نبتت بذرتك. اسقِها كل يوم بطاعة، وستراها تكبر وتزهر وتثمر.';
        $('#o-hint', e).textContent = 'المستوى ' + N(2) + ' من ' + N(Garden.MAX);
        $('#o-go', e).classList.remove('hidden');
      };
      hold.addEventListener('pointerdown', ev => { if (planted) return; ev.preventDefault(); hold.classList.add('press'); t0 = performance.now(); raf = requestAnimationFrame(step); vibrate(12); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => hold.addEventListener(n, reset));
      $('#o-go', e).onclick = () => this.done();
    }
  },
};

/* وسن 6.3: عند العودة من إعدادات الأذونات نحدّث خطوة «الأذان في وقته» */
Bus.on('resume', () => { try { if (Onboarding.el && Onboarding.step === 3) setTimeout(() => Onboarding.draw(), 250); } catch (e) {} });

/* ── وسن 6.1: «ما الجديد» مرة واحدة بعد التحديث، مع زرّ مباشر إلى الثيمات ── */
function whatsNewSheet() {
  if (document.querySelector('.onb') || document.getElementById('splash') || Sheet.el) { setTimeout(whatsNewSheet, 2500); return; }
  if (!Router.cur || Router.cur.r !== 'home') { setTimeout(whatsNewSheet, 4000); return; }
  Store.set('wnSeen', '7.1');
  const items = WHATS_NEW[0][1];
  const bad = (() => { try { const s = NotifHealth.state(); return NotifHealth.broken(s) || !s.loc; } catch (e) { return false; } })();
  const html = '<div class="sh-t">الجديد في وسن ' + N('7.1') + '</div><div class="sh-s">حركة احترافية خفيفة، وتنظيم أوضح، وأداء أسرع</div>' +
    '<div class="list mx">' + items.map(([ic, t, s]) => '<div class="li"><div class="ic g">' + icon(ic) + '</div><div class="grow"><div class="t">' + t + '</div><div class="s">' + s + '</div></div></div>').join('') + '</div>' +
    '<div class="mx" style="margin-top:14px"><button class="btn gold block" id="wn-th">' + icon('palette') + 'جرّب تغيير الثيم بالحركة الجديدة</button>' +
    '<button class="btn primary block" id="wn-hm" style="margin-top:8px">' + icon('gear') + 'اضبط الحركة من الإعدادات</button>' +
    (bad ? '<button class="btn ghost block" id="wn-nh" style="margin-top:8px">' + icon('bell') + 'تأكّد أن الأذان سيصلك في وقته</button>' : '') +
    '<button class="btn ghost block" id="wn-x" style="margin-top:8px">لاحقًا</button></div>';
  Sheet.open(html, el => { const nh = $('#wn-nh', el); if (nh) nh.onclick = () => Sheet.close(() => notifHealthSheet());
    $('#wn-th', el).onclick = () => Sheet.close(() => themeSheet()); $('#wn-hm', el).onclick = () => Sheet.close(() => Router.go('settings')); $('#wn-x', el).onclick = () => Sheet.close(); });
}

/* ════════════════════════════════════════════════════════════════
   وسن 4.7 · «الأذكار المنبثقة» + «التذكير الصوتي» + «أصوات المسبحة»
   ─ ذكرٌ لطيف يظهر لك على فترات تختارها داخل نافذة زمنية (من… إلى…)، في الأيام
     التي تحدّدها، مع عدد التكرار (قلها 3 مرات…) — إشعارًا منبثقًا أو نافذة عائمة.
   ─ الصوت: نغمة هادئة، أو تذكير صوتي يقرأ الذكر (محرّك النطق العربي في الهاتف)، أو صامت.
   ─ الجدولة في النواة الأصلية (DhikrPop.kt) فتعمل ولو لم يُفتح التطبيق أيامًا.
   ─ ما تذكره من الإشعار أو النافذة يُضاف إلى مسبحتك وبستانك عند فتح التطبيق.
   ════════════════════════════════════════════════════════════════ */
'use strict';
const POP_ADHKAR = [
  { id: 'sh', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', f: 'من قالها مئة مرة حُطّت خطاياه وإن كانت مثل زبد البحر', src: 'متفق عليه' },
  { id: 'kl', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', f: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن', src: 'متفق عليه' },
  { id: 'bq', t: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', f: 'أحبّ الكلام إلى الله', src: 'رواه مسلم' },
  { id: 'is', t: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', f: 'كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة', src: 'رواه البخاري' },
  { id: 'sl', t: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', f: 'من صلّى عليّ صلاةً صلّى الله عليه بها عشرًا', src: 'رواه مسلم' },
  { id: 'hw', t: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', f: 'كنزٌ من كنوز الجنة', src: 'متفق عليه' },
  { id: 'hm', t: 'الْحَمْدُ لِلَّهِ', f: '«والحمد لله تملأ الميزان»', src: 'رواه مسلم' },
  { id: 'th', t: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', f: 'من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل', src: 'متفق عليه' },
  { id: 'ak', t: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا', f: '«عجبتُ لها، فُتحت لها أبواب السماء»', src: 'رواه مسلم' },
  { id: 'hs', t: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', f: 'قالها إبراهيم عليه السلام حين أُلقي في النار', src: 'رواه البخاري' },
  { id: 'yn', t: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', f: 'لم يدعُ بها مسلم في شيء قطّ إلا استجاب الله له', src: 'رواه الترمذي' },
  { id: 'rd', t: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', v: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', f: 'وجبت له الجنة', src: 'رواه أبو داود' },
  { id: 'ad', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ', f: 'كلماتٌ تعدل ذكرًا طويلًا', src: 'رواه مسلم' },
];
const POP_DEF = { on: false, from: '08:00', to: '22:00', every: 60, days: [0, 1, 2, 3, 4, 5, 6], style: 'notif', sound: 'soft', vib: true, count: 3, order: 'cycle',
  sel: ['sh', 'is', 'sl', 'hw', 'bq', 'hm'], custom: [], secs: 15, keep: 20, rate: 0.85 };
const POP_EVERY = [[15, 'd15'], [30, 'd30'], [60, 'ساعة'], [120, 'ساعتان'], [180, 'h3']];
const popLbl = t => t === 'd15' ? N(15) + ' د' : t === 'd30' ? N(30) + ' د' : t === 'h3' ? N(3) + ' ساعات' : t;
const POP_COUNTS = [1, 3, 7, 10, 33, 100];
const WDAYS = [[6, 'سبت'], [0, 'أحد'], [1, 'إثنين'], [2, 'ثلاثاء'], [3, 'أربعاء'], [4, 'خميس'], [5, 'جمعة']];

const PopZ = {
  get() { return Object.assign({}, POP_DEF, Settings.pop || {}); },
  set(patch) { const c = Object.assign(this.get(), patch); setSetting('pop', c); this.sync(); return c; },
  items(c) {
    c = c || this.get();
    const pre = POP_ADHKAR.filter(a => c.sel.includes(a.id)).map(a => ({ t: a.t, n: c.count, f: a.f, v: a.v || a.t }));
    const cus = (c.custom || []).filter(x => x.on !== false).map(x => ({ t: x.t, n: x.n || c.count, f: '', v: x.t }));
    return pre.concat(cus);
  },
  mins(hm) { const [h, m] = String(hm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); },
  perDay(c) { c = c || this.get(); let a = this.mins(c.from), b = this.mins(c.to); if (b <= a) b += 1440; return Math.floor((b - a) / Math.max(5, c.every)) + 1; },
  sync() {
    const c = this.get();
    if (!Native.has('setDhikrPop')) return;
    const cfg = { on: !!c.on, from: c.from, to: c.to, every: c.every, days: c.days, style: c.style, sound: c.sound, vib: !!c.vib, count: c.count, order: c.order,
      secs: c.secs, keep: c.keep, rate: c.rate, digits: Settings.digits, items: this.items(c) };
    if (!cfg.items.length) cfg.on = false;
    Native.call('setDhikrPop', JSON.stringify(cfg));
  },
  /** ما ذُكر من الإشعار أو النافذة العائمة ← المسبحة والبستان */
  take() {
    if (!Native.has('takeDhikrDone')) return;
    let o = {}; try { o = JSON.parse(Native.call('takeDhikrDone') || '{}'); } catch (e) { return; }
    let n = 0; Object.keys(o).forEach(k => { n += +o[k] || 0; });
    if (!n) return;
    try { TB.total += n; if (TB.day === dayKey(new Date())) TB.today += n; else { TB.day = dayKey(new Date()); TB.today = n; } tbSave(); } catch (e) {}
    try { Growth.add('tas', n); } catch (e) {}
    setTimeout(() => toast('أُضيف ' + plural(n, 'ذكر', 'ذكران', 'أذكار', 'ذكرًا') + ' من الأذكار المنبثقة إلى مسبحتك'), 1200);
  },
  status(c) {
    c = c || this.get();
    if (!c.on) return 'متوقفة';
    const ev = (POP_EVERY.find(e => e[0] === c.every) || [0, pM(c.every)])[1];
    return 'كل ' + (c.every >= 60 ? (c.every === 60 ? 'ساعة' : c.every === 120 ? 'ساعتين' : pH(c.every / 60)) : pM(c.every)) + ' · من ' + fmtClock(c.from) + ' إلى ' + fmtClock(c.to);
  },
};
const popTimes = n => n === 1 ? 'مرة واحدة' : n === 2 ? 'مرتين' : plural(n, 'مرة', 'مرتين', 'مرات', 'مرة');
Bus.on('resume', () => { try { PopZ.take(); } catch (e) {} });
setTimeout(() => { try { PopZ.take(); PopZ.sync(); } catch (e) {} }, 1500);

/* ═══ الشاشة ═══ */
function popTimeSheet(title, cur, onPick) {
  Sheet.open('<div class="sh-t">' + esc(title) + '</div><div class="mx form-g"><input class="field big" type="time" id="pt-v" value="' + esc(cur) + '" style="text-align:center;font-size:24px">' +
    '<div class="chips" style="padding:0;justify-content:center">' + ['05:00', '06:00', '08:00', '09:00', '12:00', '18:00', '21:00', '22:00', '23:00'].map(v => '<button class="chip" data-t="' + v + '">' + fmtClock(v) + '</button>').join('') + '</div>' +
    '<button class="btn primary block" id="pt-ok">حفظ</button></div>', el => {
    $$('[data-t]', el).forEach(b => b.onclick = () => { $('#pt-v', el).value = b.dataset.t; });
    $('#pt-ok', el).onclick = () => { const v = $('#pt-v', el).value; if (!/^\d{2}:\d{2}$/.test(v)) { toast('اختر الوقت'); return; } Sheet.close(() => onPick(v)); };
  });
}
function popPreview(c) {
  const it = PopZ.items(c)[0] || { t: POP_ADHKAR[0].t, n: c.count, f: POP_ADHKAR[0].f };
  const art = artKey();
  return '<div class="pz-demo" aria-hidden="true"><div class="pz-phone"><div class="pz-bar"><span></span></div>' +
    '<div class="pz-card' + (c.style === 'overlay' ? ' ov' : '') + '"><div class="pz-h"><img src="img/icon.png" alt=""><b>وسن · ذكرٌ لطيف</b><i>✕</i></div>' +
    '<div class="pz-t">' + esc(it.t) + '</div><div class="pz-s">قلها ' + esc(popTimes(it.n)) + (it.f ? ' · ' + esc(it.f) : '') + '</div>' +
    (c.style === 'overlay' ? '<div class="pz-r"><span class="pz-c num">' + N(it.n) + '</span><span class="pz-hint">المس للعدّ</span></div>' : '<div class="pz-acts"><span>ذكرتُ ✓</span><span>المسبحة</span><span>إيقاف اليوم</span></div>') +
    '</div>' + (art ? '<img class="pz-art" src="' + Art.iconURI(art) + '" alt="">' : '') + '</div></div>';
}
SCREENS.popz = {
  parent: 'azkar',
  render() {
    const c = PopZ.get(), nat = Native.has('setDhikrPop'), per = PopZ.perDay(c), items = PopZ.items(c);
    const ov = Native.has('canOverlay') ? !!Native.call('canOverlay') : false;
    const muted = Native.has('dhikrMuted') ? +Native.call('dhikrMuted') || 0 : 0;
    const nx = Native.has('dhikrNext') ? +Native.call('dhikrNext') || 0 : 0;
    const seg = (id, opts, cur) => '<div class="seg" data-pz="' + id + '">' + opts.map(([v, t]) => '<button data-v="' + v + '" class="' + (String(cur) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
    const srow = (t, sb, sg, raw) => '<div class="li pz-sr"><div class="grow"><div class="t">' + t + '</div>' + (sb ? '<div class="s">' + (raw ? sb : esc(sb)) + '</div>' : '') + '</div>' + sg + '</div>';
    const row = (ic, t, s, end, attr) => '<' + (attr ? 'button' : 'div') + ' class="li" ' + (attr || '') + '><div class="ic">' + icon(ic) + '</div><div class="grow"><div class="t">' + t + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>' + (end || '') + '</' + (attr ? 'button' : 'div') + '>';
    return hdr('الأذكار المنبثقة', 'ذكرٌ لطيف يظهر لك في الأوقات التي تختارها', { back: true, compact: true }) +
      popPreview(c) +
      (nat ? '' : '<div class="pz-note mx">' + icon('info') + '<span>تعمل الأذكار المنبثقة في تطبيق وسن على أندرويد — يمكنك ضبطها هنا وستُفعَّل في الهاتف.</span></div>') +
      '<div class="list mx pz-main"><div class="li"><div class="ic g">' + icon('bell') + '</div><div class="grow"><div class="t">تفعيل الأذكار المنبثقة</div><div class="s" id="pz-st">' +
        (c.on ? '≈ ' + plural(per, 'ذكر', 'ذكران', 'أذكار', 'ذكرًا') + ' في اليوم' + (nx && !muted ? ' · التالي ' + fmtTime(new Date(nx)) : '') : 'متوقفة') + '</div></div><button class="switch ' + (c.on ? 'on' : '') + '" id="pz-on"></button></div>' +
        (muted ? '<div class="li pz-muted"><div class="ic">' + icon('belloff') + '</div><div class="grow"><div class="t">موقوفة لبقية اليوم</div><div class="s">حتى ' + fmtG(new Date(muted)) + '</div></div><button class="act" id="pz-um">استئناف</button></div>' : '') + '</div>' +
      sec('التوقيت') + '<div class="list mx">' +
        row('sunrise', 'من الساعة', fmtClock(c.from), '<div class="end">' + icon('chev') + '</div>', 'id="pz-from"') +
        row('sunset', 'إلى الساعة', fmtClock(c.to) + (PopZ.mins(c.to) <= PopZ.mins(c.from) ? ' (من الغد)' : ''), '<div class="end">' + icon('chev') + '</div>', 'id="pz-to"') +
        srow('كل', 'المدة بين ذكر وآخر', seg('every', POP_EVERY.map(([v, t]) => [v, popLbl(t)]), c.every)) +
        '<div class="li" style="flex-wrap:wrap"><div class="grow" style="min-width:100%"><div class="t">الأيام</div></div><div class="pz-days" id="pz-days">' +
          WDAYS.map(([d, t]) => '<button class="' + (c.days.includes(d) ? 'on' : '') + '" data-d="' + d + '">' + t + '</button>').join('') + '</div></div></div>' +
      sec('التكرار') + '<div class="list mx">' +
        '<div class="li" style="flex-wrap:wrap"><div class="grow" style="min-width:100%"><div class="t">عدد مرات الذكر</div><div class="s">«قلها ' + esc(popTimes(c.count)) + '» — يظهر في التذكير مع زرّ للعدّ</div></div>' +
          '<div class="pz-days" id="pz-cnt">' + POP_COUNTS.map(v => '<button class="num ' + (c.count === v ? 'on' : '') + '" data-n="' + v + '">' + N(v) + '</button>').join('') + '</div></div>' +
        srow('ترتيب الأذكار', '', seg('order', [['cycle', 'بالتناوب'], ['random', 'عشوائي']], c.order)) + '</div>' +
      sec('طريقة الظهور') + '<div class="list mx">' +
        srow('شكل التذكير', c.style === 'overlay' ? 'بطاقة عائمة فوق أي تطبيق، فيها زرّ للعدّ، وتختفي وحدها' : 'إشعار ينبثق أعلى الشاشة مع «ذكرتُ ✓» و«إيقاف اليوم»', seg('style', [['notif', 'إشعار منبثق'], ['overlay', 'نافذة عائمة']], c.style)) +
        (c.style === 'overlay' ? (nat && !ov ? '<div class="li pz-warn"><div class="ic">' + icon('warn') + '</div><div class="grow"><div class="t">اسمح بالظهور فوق التطبيقات</div><div class="s">دون هذا الإذن يظهر الذكر إشعارًا منبثقًا</div></div><button class="act" id="pz-ov">السماح</button></div>' : '') +
          srow('مدة بقائها على الشاشة', '', seg('secs', [[10, N(10) + ' ث'], [15, N(15) + ' ث'], [30, N(30) + ' ث'], [60, 'دقيقة']], c.secs)) : '') + '</div>' +
      sec('الصوت') + '<div class="list mx">' +
        srow('مع كل ذكر', ({ soft: 'نغمة قصيرة هادئة', voice: 'يُقرأ الذكر بصوت هادئ (صوت النطق العربي في هاتفك)', silent: 'بلا صوت' })[c.sound], seg('sound', [['soft', 'نغمة هادئة'], ['voice', 'تذكير صوتي'], ['silent', 'صامت']], c.sound)) +
        (c.sound === 'voice' ? srow('سرعة القراءة', '<span id="pz-tts">' + (nat ? 'جارٍ التحقق من الصوت العربي…' : 'يعمل في تطبيق أندرويد') + '</span>', seg('rate', [[0.7, 'متأنّية'], [0.85, 'هادئة'], [1, 'عادية']], c.rate), true) : '') +
        '<div class="li"><div class="ic">' + icon('vib') + '</div><div class="grow"><div class="t">اهتزاز خفيف</div></div><button class="switch ' + (c.vib ? 'on' : '') + '" id="pz-vib"></button></div></div>' +
      '<div class="mx pz-test"><button class="btn gold block" id="pz-try"' + (nat ? '' : ' disabled') + '>' + icon('play') + 'جرّب الآن</button>' +
        (c.sound === 'voice' ? '<button class="btn ghost block" id="pz-say">' + icon('vol') + 'استمع إلى الصوت</button>' : '') + '</div>' +
      sec('الأذكار') + '<div class="list mx pz-list">' + POP_ADHKAR.map(a => '<div class="li pz-it"><div class="grow"><div class="t zq">' + esc(a.t) + '</div><div class="s">' + esc(a.f) + ' · ' + esc(a.src) + '</div></div><button class="switch ' + (c.sel.includes(a.id) ? 'on' : '') + '" data-sel="' + a.id + '"></button></div>').join('') +
        (c.custom || []).map((x, i) => '<div class="li pz-it"><div class="grow"><div class="t zq">' + esc(x.t) + '</div><div class="s">ذكر خاص · ' + N(x.n || c.count) + '</div></div><button class="act" data-del="' + i + '" aria-label="حذف">' + icon('trash') + '</button><button class="switch ' + (x.on !== false ? 'on' : '') + '" data-cus="' + i + '"></button></div>').join('') +
        '<button class="li" id="pz-add"><div class="ic">' + icon('plus') + '</div><div class="grow"><div class="t">إضافة ذكر خاص</div><div class="s">اكتب ذكرك أو دعاءك المفضّل</div></div></button></div>' +
      '<div class="pz-foot mx">' + icon('info') + '<span>' + N(items.length) + ' ' + (items.length === 1 ? 'ذكر مختار' : 'أذكار مختارة') + ' — تظهر بالتناوب. يمكنك إيقافها لبقية اليوم من الإشعار نفسه، وما تعدّه يُضاف إلى مسبحتك وبستانك.</span></div>';
  },
  mount(el) {
    const re = () => Router.refresh();
    $('#pz-on', el).onclick = () => { const c = PopZ.get(); if (!c.on && !PopZ.items(c).length) { toast('اختر ذكرًا واحدًا على الأقل'); return; }
      PopZ.set({ on: !c.on }); if (!c.on) { Native.call('ensureNotifPermission'); toast('ستصلك الأذكار ' + PopZ.status()); } re(); };
    const um = $('#pz-um', el); if (um) um.onclick = () => { Native.call('unmuteDhikr'); PopZ.sync(); re(); };
    $('#pz-from', el).onclick = () => popTimeSheet('من الساعة', PopZ.get().from, v => { PopZ.set({ from: v }); re(); });
    $('#pz-to', el).onclick = () => popTimeSheet('إلى الساعة', PopZ.get().to, v => { PopZ.set({ to: v }); re(); });
    $$('[data-pz]', el).forEach(s => s.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const k = s.dataset.pz; let v = b.dataset.v;
      if (['every', 'secs'].includes(k)) v = +v; if (k === 'rate') v = parseFloat(v);
      PopZ.set({ [k]: v }); if (k === 'style' && v === 'overlay' && Native.has('canOverlay') && !Native.call('canOverlay')) toast('اسمح لوسن بالظهور فوق التطبيقات', 3200); re(); }));
    $('#pz-days', el).onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; const d = +b.dataset.d, c = PopZ.get(); let days = c.days.slice();
      days = days.includes(d) ? days.filter(x => x !== d) : days.concat(d); if (!days.length) { toast('اختر يومًا واحدًا على الأقل'); return; } PopZ.set({ days }); b.classList.toggle('on'); };
    $('#pz-cnt', el).onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; PopZ.set({ count: +b.dataset.n }); re(); };
    $('#pz-vib', el).onclick = e => { const c = PopZ.get(); PopZ.set({ vib: !c.vib }); e.currentTarget.classList.toggle('on', !c.vib); if (!c.vib) vibrate(30); };
    const ov = $('#pz-ov', el); if (ov) ov.onclick = () => Native.call('requestOverlay');
    const tr = $('#pz-try', el); if (tr) tr.onclick = () => { const c = PopZ.get(); if (!PopZ.items(c).length) { toast('اختر ذكرًا واحدًا على الأقل'); return; }
      PopZ.sync(); Native.call('ensureNotifPermission'); Native.call('testDhikrPop'); toast(c.style === 'overlay' && !Native.call('canOverlay') ? 'سيظهر إشعارًا — اسمح بالظهور فوق التطبيقات للنافذة العائمة' : 'هكذا سيظهر لك الذكر', 3000); };
    const sy = $('#pz-say', el); if (sy) sy.onclick = () => { const it = PopZ.items()[0]; if (!it) return; if (!Native.has('ttsSpeak')) { toast('التذكير الصوتي يعمل في تطبيق أندرويد'); return; } Native.call('ttsSpeak', it.v || it.t); };
    if ($('#pz-tts', el) && Native.has('ttsCheck')) Native.call('ttsCheck');
    $$('[data-sel]', el).forEach(b => b.onclick = () => { const id = b.dataset.sel, c = PopZ.get(); const sel = c.sel.includes(id) ? c.sel.filter(x => x !== id) : c.sel.concat(id);
      PopZ.set({ sel }); b.classList.toggle('on', sel.includes(id)); });
    $$('[data-cus]', el).forEach(b => b.onclick = () => { const i = +b.dataset.cus, c = PopZ.get(), cu = (c.custom || []).slice(); cu[i] = Object.assign({}, cu[i], { on: cu[i].on === false }); PopZ.set({ custom: cu }); b.classList.toggle('on', cu[i].on !== false); });
    $$('[data-del]', el).forEach(b => b.onclick = () => { const i = +b.dataset.del, c = PopZ.get(), cu = (c.custom || []).slice(); cu.splice(i, 1); PopZ.set({ custom: cu }); re(); });
    $('#pz-add', el).onclick = () => Sheet.open('<div class="sh-t">ذكر خاص</div><div class="mx form-g"><div><label>نص الذكر أو الدعاء</label><textarea class="field" id="pc-t" rows="3" placeholder="مثال: اللهم إنك عفوّ تحب العفو فاعفُ عنّي"></textarea></div>' +
      '<div><label>عدد المرات</label><input class="field" id="pc-n" type="number" inputmode="numeric" value="' + PopZ.get().count + '"></div><button class="btn primary block" id="pc-ok">إضافة</button></div>', sh => {
      $('#pc-ok', sh).onclick = () => { const t = $('#pc-t', sh).value.trim(), n = clamp(parseInt($('#pc-n', sh).value, 10) || 1, 1, 1000); if (!t) { toast('اكتب نص الذكر'); return; }
        const c = PopZ.get(); PopZ.set({ custom: (c.custom || []).concat([{ t, n, on: true }]) }); Sheet.close(() => re()); };
    });
  },
};
window.onTtsState = function (st) {
  const el = $('#pz-tts') || $('#rv-tts'); if (!el) return;
  if (st === 'ok') el.textContent = 'الصوت العربي جاهز في هاتفك';
  else { el.innerHTML = (st === 'missing' ? 'الصوت العربي غير مثبّت في هاتفك' : 'لا يوجد محرّك نطق في هاتفك') + ' — <button class="link" id="tts-fix">تثبيته</button>';
    const b = $('#tts-fix'); if (b) b.onclick = () => Native.call('openTtsSettings'); }
};

/* ═══ «التذكير الصوتي» للتذكيرات اليومية (أذكار الصباح والمساء، الكهف، العادات…) ═══ */
function remindVoiceRow() {
  if (!Native.has('setRemindVoice')) return '';
  const on = !!Settings.remVoice;
  return '<div class="li"><div class="ic">' + icon('vol') + '</div><div class="grow"><div class="t">التذكير الصوتي</div><div class="s" id="rv-tts">يُقرأ عنوان التذكير بصوت هادئ مع الإشعار</div></div>' +
    (on ? '<button class="act" id="rv-try" aria-label="استماع">' + icon('play') + '</button>' : '') + '<button class="switch ' + (on ? 'on' : '') + '" id="rv-on"></button></div>';
}
function bindRemindVoice(el) {
  const b = $('#rv-on', el); if (!b) return;
  b.onclick = () => { const on = !Settings.remVoice; setSetting('remVoice', on); Native.call('setRemindVoice', on); if (on) { Native.call('ttsSpeak', 'تذكيرٌ لطيف: أذكار الصباح'); } Router.refresh(); };
  const t = $('#rv-try', el); if (t) t.onclick = () => Native.call('ttsSpeak', 'تذكيرٌ لطيف: أذكار المساء');
}
setTimeout(() => { try { if (Native.has('setRemindVoice')) Native.call('setRemindVoice', !!Settings.remVoice); } catch (e) {} }, 1600);

/* ═══ أصوات المسبحة: حبّة خشبية هادئة · قطرة ماء · بلا صوت (تُولَّد في الجهاز، بلا ملفات) ═══ */
const TasSound = {
  ctx: null,
  ac() { if (!this.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; try { this.ctx = new A(); } catch (e) { return null; } }
    if (this.ctx.state === 'suspended') try { this.ctx.resume(); } catch (e) {} return this.ctx; },
  play(kind, done) {
    kind = kind || Settings.tasSnd || 'off'; if (kind === 'off') return;
    const c = this.ac(); if (!c) return; const t = c.currentTime, out = c.createGain(); out.gain.value = 0.55; out.connect(c.destination);
    const tone = (f, a, d, type, f2) => { const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d * 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.02); };
    if (done) { [[659.3, 0], [880, 0.12], [1318.5, 0.24]].forEach(([f, dl]) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + dl); g.gain.exponentialRampToValueAtTime(0.09, t + dl + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dl + 0.9); o.connect(g); g.connect(out); o.start(t + dl); o.stop(t + dl + 1); }); return; }
    if (kind === 'bead') {
      // «طَق» خشبي ناعم: نقرة قصيرة مرشّحة + نغمة خشبية منخفضة
      const n = Math.floor(c.sampleRate * 0.03), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6);
      const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 2.2; g.gain.value = 0.22;
      src.connect(bp); bp.connect(g); g.connect(out); src.start(t);
      tone(520, 0.07, 0.09, 'triangle'); tone(1040, 0.018, 0.05, 'sine');
    } else if (kind === 'drop') { tone(780, 0.06, 0.16, 'sine', 1320); }
    else if (kind === 'soft') { tone(440, 0.05, 0.22, 'sine'); tone(880, 0.012, 0.12, 'sine'); }
  },
};
window.TasSound = TasSound;

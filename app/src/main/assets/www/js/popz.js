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
  { id: 'sh', au: 'sh', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', f: 'من قالها مئة مرة حُطّت خطاياه وإن كانت مثل زبد البحر', src: 'متفق عليه' },
  { id: 'kl', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', f: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن', src: 'متفق عليه' },
  { id: 'bq', t: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', f: 'أحبّ الكلام إلى الله', src: 'رواه مسلم' },
  { id: 'is', au: 'is', t: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', f: 'كان النبي ﷺ يستغفر الله في اليوم أكثر من سبعين مرة', src: 'رواه البخاري' },
  { id: 'sl', au: 'sl', t: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', f: 'من صلّى عليّ صلاةً صلّى الله عليه بها عشرًا', src: 'رواه مسلم' },
  { id: 'hw', t: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', f: 'كنزٌ من كنوز الجنة', src: 'متفق عليه' },
  { id: 'hm', au: 'hm', t: 'الْحَمْدُ لِلَّهِ', f: '«والحمد لله تملأ الميزان»', src: 'رواه مسلم' },
  { id: 'th', au: 'th', t: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', f: 'من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل', src: 'متفق عليه' },
  { id: 'ak', t: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا', f: '«عجبتُ لها، فُتحت لها أبواب السماء»', src: 'رواه مسلم' },
  { id: 'hs', t: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', f: 'قالها إبراهيم عليه السلام حين أُلقي في النار', src: 'رواه البخاري' },
  { id: 'yn', t: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', f: 'لم يدعُ بها مسلم في شيء قطّ إلا استجاب الله له', src: 'رواه الترمذي' },
  { id: 'rd', au: 'rd', t: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', v: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا', f: 'وجبت له الجنة', src: 'رواه أبو داود' },
  { id: 'ad', au: 'ad', t: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ', f: 'كلماتٌ تعدل ذكرًا طويلًا', src: 'رواه مسلم' },
  // وسن 4.8: أذكار جديدة مسجّلة بصوت بشري
  { id: 'hb', au: 'hb', t: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', f: 'من قالها سبع مرات صباحًا ومساءً كفاه الله ما أهمّه', src: 'رواه أبو داود' },
  { id: 'yq', au: 'yq', t: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ', f: 'أوصى بها النبي ﷺ فاطمة رضي الله عنها صباحًا ومساءً', src: 'رواه النسائي والحاكم' },
  { id: 'bs', au: 'bs', t: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ', f: 'من قالها ثلاثًا لم يضرّه شيء', src: 'رواه أبو داود والترمذي' },
  { id: 'aw', au: 'aw', t: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', f: 'من قالها لم يضرّه شيء حتى يرتحل من منزله', src: 'رواه مسلم' },
  { id: 'tk', au: 'tk', t: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ', f: '«والله أكبر» من الباقيات الصالحات وأحبّ الكلام إلى الله', src: 'رواه مسلم' },
];
// وسن 4.8: «صوت بشري» حقيقي — تسجيلات الشيخ فارس عبّاد لهذه الأذكار (مدمجة في التطبيق)
const POP_VOICED = POP_ADHKAR.filter(a => a.au).map(a => a.id);
const VOICE_BY = 'الشيخ فارس عبّاد';
const POP_DEF = { on: false, from: '08:00', to: '22:00', every: 60, days: [0, 1, 2, 3, 4, 5, 6], style: 'notif', sound: 'soft', vib: true, count: 3, order: 'cycle',
  sel: ['sh', 'is', 'sl', 'hw', 'bq', 'hm'], custom: [], secs: 15, keep: 20, rate: 0.85, hv: true, voice: ['sl', 'is', 'sh'] };
const POP_EVERY = [[15, 'd15'], [30, 'd30'], [60, 'ساعة'], [120, 'ساعتان'], [180, 'h3']];
const popLbl = t => t === 'd15' ? N(15) + ' د' : t === 'd30' ? N(30) + ' د' : t === 'h3' ? N(3) + ' ساعات' : t;
const POP_COUNTS = [1, 3, 7, 10, 33, 100];
const WDAYS = [[6, 'سبت'], [0, 'أحد'], [1, 'إثنين'], [2, 'ثلاثاء'], [3, 'أربعاء'], [4, 'خميس'], [5, 'جمعة']];

const PopZ = {
  get() { const c = Object.assign({}, POP_DEF, Settings.pop || {}); if (c.sound === 'voice') c.sound = 'tts'; return c; },
  set(patch) { const c = Object.assign(this.get(), patch); setSetting('pop', c); this.sync(); return c; },
  items(c) {
    c = c || this.get();
    const vo = c.hv !== false ? (c.voice || []) : [];
    const pre = POP_ADHKAR.filter(a => c.sel.includes(a.id)).map(a => ({ t: a.t, n: c.count, f: a.f, v: a.v || a.t, a: a.au && vo.includes(a.id) ? a.au : '' }));
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

/* وسن 4.8: استماع مسبق للصوت البشري داخل التطبيق */
let _pzA = null;
function popVoice(key, btn) {
  try { if (_pzA) { _pzA.pause(); _pzA = null; } $$('.pz-pl.on').forEach(x => { x.classList.remove('on'); x.innerHTML = icon('play'); });
    if (!/^[a-z0-9]{1,8}$/.test(key || '')) return;
    const a = _pzA = new Audio('snd/dhikr/' + key + '.ogg'); a.volume = 1;
    if (btn) { btn.classList.add('on'); btn.innerHTML = icon('stop'); }
    a.onended = a.onerror = () => { if (btn) { btn.classList.remove('on'); btn.innerHTML = icon('play'); } if (_pzA === a) _pzA = null; };
    const p = a.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
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
        '<div class="li pz-hv"><div class="ic g">' + icon('vol') + '</div><div class="grow"><div class="t">صوت بشري للأذكار</div><div class="s">تسجيل حقيقي بصوت ' + VOICE_BY + ' — ليس صوتًا آليًّا. اختاري من القائمة أدناه الأذكار التي تُقرأ بصوته (' + N((c.voice || []).length) + ' مختارة)</div></div><button class="switch ' + (c.hv !== false ? 'on' : '') + '" id="pz-hvs"></button></div>' +
        srow('الأذكار الأخرى', ({ soft: 'تظهر بنغمة قصيرة هادئة', tts: 'يقرؤها صوت النطق الآلي في هاتفك', silent: 'تظهر بلا صوت' })[c.sound] || '', seg('sound', [['soft', 'نغمة هادئة'], ['silent', 'صامتة'], ['tts', 'صوت الهاتف']], c.sound)) +
        (c.sound === 'tts' ? srow('سرعة القراءة', '<span id="pz-tts">' + (nat ? 'جارٍ التحقق من الصوت العربي…' : 'يعمل في تطبيق أندرويد') + '</span>', seg('rate', [[0.7, 'متأنّية'], [0.85, 'هادئة'], [1, 'عادية']], c.rate), true) : '') +
        '<div class="li"><div class="ic">' + icon('vib') + '</div><div class="grow"><div class="t">اهتزاز خفيف</div></div><button class="switch ' + (c.vib ? 'on' : '') + '" id="pz-vib"></button></div></div>' +
      '<div class="mx pz-test"><button class="btn gold block" id="pz-try"' + (nat ? '' : ' disabled') + '>' + icon('play') + 'جرّب الآن</button>' +
        (c.sound === 'tts' ? '<button class="btn ghost block" id="pz-say">' + icon('vol') + 'استمعي إلى صوت الهاتف</button>' : '') + '</div>' +
      sec('الأذكار') + '<div class="pz-vnote mx">' + icon('vol') + '<span>الأذكار التي بجانبها «بصوت» يمكن أن تُقرأ بصوت ' + VOICE_BY + ' حين تظهر — فعّليها لما تحبّين، وتبقى البقية بنغمتها الهادئة.</span></div>' +
        '<div class="list mx pz-list">' + POP_ADHKAR.map(a => { const von = c.hv !== false && (c.voice || []).includes(a.id);
          return '<div class="li pz-it"><div class="grow"><div class="t zq">' + esc(a.t) + '</div><div class="s">' + esc(a.f) + (a.src ? ' · ' + esc(a.src) : '') + '</div>' +
            (a.au ? '<div class="pz-vrow"><button class="pz-vo' + (von ? ' on' : '') + '" data-vo="' + a.id + '">' + icon('vol') + (von ? 'بصوت ' + VOICE_BY : 'بصوت؟') + '</button><button class="pz-pl" data-pl="' + a.au + '" aria-label="استماع">' + icon('play') + '</button></div>' : '') +
            '</div><button class="switch ' + (c.sel.includes(a.id) ? 'on' : '') + '" data-sel="' + a.id + '"></button></div>'; }).join('') +
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
    // وسن 4.8: الصوت البشري — مفتاح عام، واختيار الأذكار التي تُقرأ بصوته، واستماع مسبق
    const hvs = $('#pz-hvs', el); if (hvs) hvs.onclick = () => { const c = PopZ.get(); PopZ.set({ hv: c.hv === false }); re(); };
    $$('[data-vo]', el).forEach(b => b.onclick = () => { const id = b.dataset.vo, c = PopZ.get(); let vo = (c.voice || []).slice();
      vo = vo.includes(id) ? vo.filter(x => x !== id) : vo.concat(id); const patch = { voice: vo }; if (vo.includes(id)) { patch.hv = true; if (!c.sel.includes(id)) patch.sel = c.sel.concat(id); }
      PopZ.set(patch); if (vo.includes(id)) popVoice(POP_ADHKAR.find(a => a.id === id).au); re(); });
    $$('[data-pl]', el).forEach(b => b.onclick = () => popVoice(b.dataset.pl, b));
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

/* ═══ وسن 6 · أصوات المسبحة: طبيعية غير موسيقية (حبّات، خشب، ماء) ═══
   تُشغَّل بالمشغّل الأصلي في أندرويد (SoundPool) فتعمل دائمًا وبلا تأخير، وفي المتصفح تُولَّد بديلًا.
   وعند تمام الدورة: صوت الشيخ فارس عبّاد بالذكر نفسه إن توفّر، وإلا طقطقة حبّتين والإمام. */
const Sfx = {
  play(name, vol, rate) {
    if (!Native.has('sfx')) return false;
    try { return Native.call('sfx', name, Math.max(0, Math.min(1, +vol || 0.7)), rate || 1) === true; } catch (e) { return false; }
  },
};
window.Sfx = Sfx;
const SFX_OF = { bead: 'bead_wood', clack: 'clack', knock: 'knock', stone: 'bead_stone', drop: 'drop', soft: 'tick' };
const TasSound = {
  ctx: null,
  ac() {
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
    if (this.ctx && this.ctx.state === 'closed') this.ctx = null;
    if (!this.ctx) { try { this.ctx = new A(); } catch (e) { return null; } }
    if (this.ctx.state !== 'running') try { this.ctx.resume(); } catch (e) {}
    return this.ctx;
  },
  reverb() { return null; },   // لم يعد هناك صدى موسيقي
  play(kind, done) {
    kind = kind || tasSnd(); if (kind === 'off') return;
    const vol = (+Settings.tasVol || 0.7);
    if (Sfx.play(done ? 'done' : (SFX_OF[kind] || 'bead_wood'), vol, done ? 1 : 0.95 + Math.random() * 0.1)) return;
    // بديل المتصفح: نقرات مولَّدة (ضوضاء مرشَّحة ورنين قصير غير موسيقي)
    const c = this.ac(); if (!c) return; const t = c.currentTime, out = c.createGain(); out.gain.value = vol * 0.8; out.connect(c.destination);
    const click = (fq, q, a, at, len) => { const n = Math.floor(c.sampleRate * (len || 0.03)), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6);
      const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q; g.gain.value = a;
      src.connect(bp); bp.connect(g); g.connect(out); src.start(t + (at || 0)); };
    const thud = (f, a, d, at) => { const o = c.createOscillator(), g = c.createGain(), t0 = t + (at || 0); o.type = 'sine'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 0.6, t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(a, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + 0.02); };
    if (done) { click(2200, 2.4, 0.2, 0, 0.02); click(2000, 2.4, 0.15, 0.07, 0.02); thud(300, 0.12, 0.25, 0.16); return; }
    if (kind === 'clack') { click(2300, 2.6, 0.2, 0, 0.018); click(2000, 2.4, 0.13, 0.045, 0.016); }
    else if (kind === 'knock') { click(900, 1.5, 0.18, 0, 0.02); thud(245, 0.14, 0.12); }
    else if (kind === 'stone') { click(3100, 7, 0.25, 0, 0.02); }
    else if (kind === 'drop') { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(850, t); o.frequency.exponentialRampToValueAtTime(2100, t + 0.03);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.12); }
    else if (kind === 'soft') { click(1100, 1.2, 0.12, 0, 0.008); }
    else { click(1900, 2.2, 0.22, 0, 0.03); thud(820, 0.05, 0.06); }
  },
};
// إيقاظ الصوت عند أول لمسة، وبعد العودة من الخلفية (أندرويد يعلّق سياق الصوت أحيانًا)
document.addEventListener('pointerdown', () => { const c = TasSound.ctx; if (c && c.state !== 'running') try { c.resume(); } catch (e) {} }, { passive: true, capture: true });
Bus.on('resume', () => { const c = TasSound.ctx; if (!c) return; if (c.state !== 'running') { try { c.resume().catch(() => { TasSound.ctx = null; }); } catch (e) { TasSound.ctx = null; } } });
// الافتراضي: حبّة خشبية (لا موسيقى)
function tasSnd() { const v = Settings.tasSnd; return v == null || v === 'harp' || v === 'bell' || v === 'wood' ? 'bead' : v; }
window.TasSound = TasSound;
/* صوت الذكر بصوت الشيخ فارس عبّاد (مقطع واحد في كل مرة) */
const DhikrVoice = {
  a: null,
  play(key, vol) { if (!/^[a-z]{2}$/.test(key || '')) return false;
    try { if (this.a) { this.a.pause(); this.a = null; } const a = this.a = new Audio('snd/dhikr/' + key + '.ogg'); a.volume = Math.max(0.2, Math.min(1, vol || 1)); const p = a.play(); if (p && p.catch) p.catch(() => {}); return true; } catch (e) { return false; } },
};
window.DhikrVoice = DhikrVoice;
/** مفتاح صوت الذكر من نصّه (للمقاطع المتوفّرة) */
function voiceKeyOf(t) { const n = typeof normAr === 'function' ? normAr(String(t || '')) : String(t || '');
  if (/استغفر/.test(n)) return 'is'; if (/سبحان الله وبحمده/.test(n)) return 'sh'; if (/الحمد لله/.test(n)) return 'hm'; if (/الله اكبر/.test(n)) return 'tk'; if (/صل/.test(n) && /محمد|النبي|نبينا/.test(n)) return 'sl'; return ''; }

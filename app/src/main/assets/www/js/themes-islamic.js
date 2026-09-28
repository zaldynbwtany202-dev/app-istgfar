/* ════════════════════════════════════════════════════════════════
   وسن 4.8 · «ثيمات فخمة إسلامية» — تسعة ثيمات كاملة (المشهد في art-islamic.js)
   لكل ثيم: سماء تتبع مواقيتك بدرجاته، ألوان بستان، حبّات أحجار كريمة،
   وخلفية مصحف تناسبه.
   ════════════════════════════════════════════════════════════════ */
'use strict';
(() => {
  if (typeof SKINS === 'undefined' || typeof THEMES === 'undefined') return;
  // سماء ليلية فاخرة تتدرّج مع أطوار اليوم (للثيمات الداكنة التي تحمل نجومها في المشهد)
  const nightSky = (n, dawn, day, sunset, glowC) => ({
    night: { c: n, st: 1, g: glowC || 'rgba(255,225,160,.16)' }, predawn: { c: [n[0], n[1], dawn[1]], st: .85, g: 'rgba(230,200,255,.2)' },
    dawn: { c: dawn, st: .5, g: 'rgba(255,200,170,.42)' }, morning: { c: day, st: .35, g: 'rgba(255,235,190,.4)' }, day: { c: day, st: .3, g: 'rgba(255,240,205,.4)' },
    noon: { c: day, st: .3, g: 'rgba(255,245,215,.42)' }, afternoon: { c: day, st: .34, g: 'rgba(255,225,180,.42)' }, golden: { c: sunset.map((x, i) => i ? x : day[0]), st: .4, g: 'rgba(255,195,130,.48)' },
    sunset: { c: sunset, st: .5, g: 'rgba(255,160,120,.5)' }, dusk: { c: [n[0], n[1], sunset[1]], st: .8, g: 'rgba(230,180,210,.26)' },
  });
  const gsky = s => ({ day: s.day.c, night: s.night.c, dawn: s.dawn.c, golden: s.golden.c, sunset: s.sunset.c });
  const garden = (o) => Object.assign({ fruit: false, palm: false, bloom: ['#FFF2C4', '#FFFFFF', '#E8C067'], bloomMid: '#E8C067', flowers: ['#E8C067', '#FFFFFF', '#FFE3A6'], flowerMid: '#C99A3A', hi: '#F2F8E8', bark: '#4A3A2A' }, o);
  const SK = {};
  /* ─── ليل مكة ─── */
  SK.kmakkah = { n: 'ليل مكة', e: 'kaaba', beads: ['#FFF6D2', '#E8C067', '#8A6220'], ink: '#FFFFFF', stickers: [], quick: ['book', 'kaaba', 'moon', 'beads', 'mosque', 'starcrescent', 'calendar', 'gem'],
    sky: nightSky(['#050507', '#0E0E14', '#1C1A20'], ['#141222', '#3A2E3E', '#8A6A5A'], ['#0C0C14', '#1A1A26', '#2E2A30'], ['#0E0C14', '#3A2430', '#8A5A3E']) };
  SK.kmakkah.garden = garden({ leaves: ['#2F5E3A', '#3A6E45', '#4A7E52', '#27543A', '#35684A', '#43785A', '#1F4A30'], shade: '#0A1A10', base: ['#2A5A3A', '#1A3E28'], hillA: '#24242C', hillB: '#1C241F', ground: '#23302A', grass: '#2E4A3A', stem: '#2E4A3A', palm: true, nightTint: '#07070B', gsky: gsky(SK.kmakkah.sky) });
  /* ─── المدينة المنوّرة ─── */
  SK.kmadinah = { n: 'المدينة المنوّرة', e: 'mosque', beads: ['#E6FFF0', '#3FB57A', '#155C38'], ink: '#FFFFFF', stickers: [], quick: ['book', 'mosque', 'moon', 'beads', 'palms', 'starcrescent', 'calendar', 'herb'],
    sky: nightSky(['#04130D', '#0A2A1E', '#164A36'], ['#0E2A2A', '#2E5A52', '#9A8A6A'], ['#08201A', '#123A2C', '#245A44'], ['#0A1E18', '#3A3A2A', '#8A6A42']) };
  SK.kmadinah.garden = garden({ leaves: ['#2E8A58', '#3A9A64', '#4AAA72', '#257A4C', '#35905E', '#43A06C', '#1F6A40'], shade: '#062014', base: ['#2A7A4E', '#1A5A38'], hillA: '#E3DAC4', hillB: '#1E4A36', ground: '#2A5A42', grass: '#3A7A52', stem: '#2E6A48', palm: true, nightTint: '#04130D', gsky: gsky(SK.kmadinah.sky) });
  /* ─── قصر الحمراء (فاتح) ─── */
  SK.kalham = { n: 'قصر الحمراء', e: 'mosque', beads: ['#FFE7C2', '#D4A23A', '#9A5A1E'], ink: '#3A2618', stickers: [], quick: ['book', 'mosque', 'sunrise', 'beads', 'herb', 'gem', 'calendar', 'star'],
    sky: { night: { c: ['#141A36', '#23294E', '#3E3A5E'], st: 1, g: 'rgba(255,220,180,.18)' }, predawn: { c: ['#1E2248', '#3E3A6A', '#8A6A7A'], st: .7, g: 'rgba(255,200,190,.24)' },
      dawn: { c: ['#6A6A9E', '#D89A8A', '#FFD2A8'], st: .08, g: 'rgba(255,205,170,.6)' }, morning: { c: ['#8AB2DA', '#F2D2B0', '#FFE8CC'], st: 0, g: 'rgba(255,238,210,.6)' },
      day: { c: ['#7FB0DE', '#E9D6BC', '#FBEBD4'], st: 0, g: 'rgba(255,245,225,.6)' }, noon: { c: ['#78AADC', '#E6D6C0', '#FAEDDA'], st: 0, g: 'rgba(255,248,232,.6)' },
      afternoon: { c: ['#86A8D2', '#EDCFAA', '#FBE2C0'], st: 0, g: 'rgba(255,230,190,.6)' }, golden: { c: ['#8E8EB8', '#F0B488', '#FFD29E'], st: 0, g: 'rgba(255,200,140,.62)' },
      sunset: { c: ['#4A3E72', '#D0786A', '#FFB078'], st: .05, g: 'rgba(255,160,110,.62)' }, dusk: { c: ['#1E2046', '#4A3A62', '#9A6A6E'], st: .5, g: 'rgba(240,180,170,.3)' } } };
  SK.kalham.garden = garden({ leaves: ['#4A8A5A', '#5A9A68', '#6AAA76', '#3E7A4E', '#52905E', '#62A06C', '#346A44'], shade: '#16301E', base: ['#4A8A5A', '#2E6A40'], hillA: '#E9D6BC', hillB: '#A9C98E', ground: '#9AB87E', grass: '#5E9A5E', stem: '#4E8A55', bloom: ['#FFFFFF', '#FFF4E0', '#FFE0B8'], bloomMid: '#E8A84E', flowers: ['#FFFFFF', '#F2B04E', '#E8704E'], flowerMid: '#D4A23A', fruit: true, nightTint: '#141A36', gsky: gsky(SK.kalham.sky) });
  /* ─── إزنيك العثماني (فاتح) ─── */
  SK.kiznik = { n: 'إزنيك العثماني', e: 'tulip', beads: ['#E6FFFD', '#3FB7B2', '#1B6E78'], ink: '#14234A', stickers: [], quick: ['book', 'mosque', 'tulip', 'beads', 'moon', 'gem', 'calendar', 'star'],
    sky: { night: { c: ['#0C1636', '#16264E', '#2A3E6A'], st: 1, g: 'rgba(200,220,255,.2)' }, predawn: { c: ['#16204A', '#2E3E72', '#6A6E9A'], st: .7, g: 'rgba(210,200,255,.24)' },
      dawn: { c: ['#4A6AA8', '#A8A8D0', '#F5C8B8'], st: .1, g: 'rgba(255,210,195,.55)' }, morning: { c: ['#6A9AD8', '#B8D2F0', '#EAF2FC'], st: 0, g: 'rgba(255,248,235,.55)' },
      day: { c: ['#5E94D8', '#AECDF0', '#E8F1FC'], st: 0, g: 'rgba(255,252,242,.55)' }, noon: { c: ['#5890D8', '#A8CAF0', '#E6F0FC'], st: 0, g: 'rgba(255,252,245,.6)' },
      afternoon: { c: ['#6A94CE', '#B8CCE6', '#F2E8DA'], st: 0, g: 'rgba(255,238,210,.55)' }, golden: { c: ['#7A8CBE', '#D8B8B0', '#F8D2B0'], st: 0, g: 'rgba(255,210,160,.6)' },
      sunset: { c: ['#3A4480', '#B87888', '#F6A88A'], st: .05, g: 'rgba(255,165,130,.6)' }, dusk: { c: ['#141E48', '#34386A', '#7A6A8A'], st: .5, g: 'rgba(220,190,230,.28)' } } };
  SK.kiznik.garden = garden({ leaves: ['#2E8A50', '#3A9A5E', '#4AAA6C', '#257A46', '#35905A', '#43A068', '#1F6A3E'], shade: '#0E2A1A', base: ['#2E8A50', '#1F6A3E'], hillA: '#CFE0F5', hillB: '#9FC8A8', ground: '#8FBF98', grass: '#4E9A62', stem: '#2E8A50', bloom: ['#FFFFFF', '#FFE0DC', '#E0463A'], bloomMid: '#D2352A', flowers: ['#D2352A', '#FFFFFF', '#3A6FD0'], flowerMid: '#1B3C8E', nightTint: '#0C1636', gsky: gsky(SK.kiznik.sky) });
  /* ─── ذهب المماليك ─── */
  SK.kmamluk = { n: 'ذهب المماليك', e: 'mosque', beads: ['#FFF3C4', '#E8C067', '#8A6220'], ink: '#FFFFFF', stickers: [], quick: ['book', 'mosque', 'moon', 'beads', 'crown', 'gem', 'calendar', 'starcrescent'],
    sky: nightSky(['#07060A', '#120E10', '#241A16'], ['#161018', '#3A2A2A', '#7A5A42'], ['#0E0B0C', '#1E1714', '#34281E'], ['#100C0E', '#3A2018', '#7A4A2A'], 'rgba(255,205,130,.16)') };
  SK.kmamluk.garden = garden({ leaves: ['#4E6A3A', '#5A7A44', '#6A8A50', '#445E32', '#52703E', '#62804A', '#3A522A'], shade: '#141A0C', base: ['#4E6A3A', '#344A26'], hillA: '#2A221E', hillB: '#1E1A14', ground: '#2A2418', grass: '#3E4A2A', stem: '#3E4A2A', palm: true, nightTint: '#07060A', gsky: gsky(SK.kmamluk.sky) });
  /* ─── لازورد أصفهان ─── */
  SK.klapis = { n: 'لازورد أصفهان', e: 'mosque', beads: ['#DFF0FF', '#3A6FD0', '#142C6E'], ink: '#FFFFFF', stickers: [], quick: ['book', 'mosque', 'moon', 'beads', 'gem', 'milkyway', 'calendar', 'star'],
    sky: nightSky(['#050B24', '#0C1A44', '#1A3068'], ['#12163E', '#3A3A72', '#8A7A9A'], ['#0A1840', '#16307A', '#2A4C96'], ['#0C1238', '#3A2E6A', '#8A5A7A']) };
  SK.klapis.garden = garden({ leaves: ['#1E7A7E', '#268A8E', '#3A9A9E', '#1A6A6E', '#22808A', '#349098', '#145A5E'], shade: '#061E22', base: ['#1E7A7E', '#145A5E'], hillA: '#1F3F94', hillB: '#16306E', ground: '#1A3060', grass: '#1E4A6A', stem: '#1E4A6A', bloom: ['#FFF1C2', '#FFFFFF', '#46C9CF'], bloomMid: '#E8C067', flowers: ['#46C9CF', '#FFF1C2', '#E8C067'], nightTint: '#050B24', gsky: gsky(SK.klapis.sky) });
  /* ─── فوانيس رمضان ─── */
  SK.kfanous = { n: 'فوانيس رمضان', e: 'starcrescent', beads: ['#FFE7A6', '#FFB23E', '#B8561A'], ink: '#FFFFFF', stickers: [], quick: ['book', 'starcrescent', 'moon', 'beads', 'palms', 'gem', 'calendar', 'sparkles'],
    sky: nightSky(['#120A22', '#2A1840', '#4A2A5E'], ['#1E1236', '#5A3A6A', '#C07A7A'], ['#1A1030', '#3A2452', '#6A3E6E'], ['#1A0E2A', '#6A3060', '#D07A6A'], 'rgba(255,200,140,.2)') };
  SK.kfanous.garden = garden({ leaves: ['#3E7A4A', '#4A8A56', '#5A9A62', '#346A40', '#44804E', '#52905C', '#2A5A36'], shade: '#10200E', base: ['#3E7A4A', '#2A5A36'], hillA: '#A4566A', hillB: '#6A3E6E', ground: '#7A4A5A', grass: '#5A4A5A', stem: '#4A5A42', palm: true, bloom: ['#FFE7A6', '#FFFFFF', '#FFB23E'], bloomMid: '#FFB23E', flowers: ['#FFB23E', '#F0564A', '#3FD6C0'], nightTint: '#120A22', gsky: gsky(SK.kfanous.sky) });
  /* ─── قبّة الصخرة ─── */
  SK.kaqsa = { n: 'قبّة الصخرة', e: 'mosque', beads: ['#FFF6D2', '#F2C64E', '#8A6220'], ink: '#FFFFFF', stickers: [], quick: ['book', 'mosque', 'moon', 'beads', 'herb', 'starcrescent', 'calendar', 'gem'],
    sky: nightSky(['#040A1E', '#0A1638', '#16285A'], ['#0E1438', '#34386A', '#8A7A8A'], ['#081434', '#12245A', '#22407E'], ['#0A1030', '#342A5E', '#8A5A6A']) };
  SK.kaqsa.garden = garden({ leaves: ['#4F6B4A', '#5F7E58', '#6E8E66', '#465E42', '#56744E', '#66865E', '#3A5236'], shade: '#141E12', base: ['#4F6B4A', '#3A5236'], hillA: '#D9CDB4', hillB: '#2A3A5A', ground: '#3A4A5A', grass: '#3E5A4A', stem: '#3E5A4A', bloom: ['#FFF6D2', '#FFFFFF', '#F2C64E'], bloomMid: '#F2C64E', fruit: true, nightTint: '#040A1E', gsky: gsky(SK.kaqsa.sky) });
  /* ─── التذهيب (فاتح) ─── */
  SK.ktazhib = { n: 'التذهيب', e: 'book', beads: ['#FFFDF2', '#E6CE8A', '#A8883E'], ink: '#2A1E10', stickers: [], quick: ['book', 'books', 'gem', 'beads', 'crown', 'starcrescent', 'calendar', 'sparkles'],
    sky: { night: { c: ['#0A1638', '#142C6E', '#2A4A8A'], st: .9, g: 'rgba(255,225,160,.2)' }, predawn: { c: ['#16225A', '#3A4A7A', '#9A8A7A'], st: .6, g: 'rgba(255,215,170,.25)' },
      dawn: { c: ['#E6D2B0', '#F6E4C4', '#FCEFD8'], st: 0, g: 'rgba(255,225,170,.55)' }, morning: { c: ['#F2E4C4', '#F8EDD6', '#FCF5E6'], st: 0, g: 'rgba(255,240,205,.55)' },
      day: { c: ['#F4E8CC', '#FAF1DE', '#FDF8EC'], st: 0, g: 'rgba(255,245,215,.55)' }, noon: { c: ['#F4EAD0', '#FAF3E2', '#FEFAF0'], st: 0, g: 'rgba(255,248,225,.55)' },
      afternoon: { c: ['#F0E0BC', '#F8EBD0', '#FCF3E2'], st: 0, g: 'rgba(255,232,190,.55)' }, golden: { c: ['#EAD2A2', '#F4DFB6', '#FAEBCC'], st: 0, g: 'rgba(255,215,150,.58)' },
      sunset: { c: ['#C8A078', '#E8C09A', '#F6D8B4'], st: 0, g: 'rgba(255,190,130,.58)' }, dusk: { c: ['#2A3A6A', '#6A6A8A', '#B89A7A'], st: .4, g: 'rgba(255,210,160,.3)' } } };
  SK.ktazhib.garden = garden({ leaves: ['#4E7A5A', '#5A8A66', '#6A9A74', '#446E50', '#52805E', '#62906C', '#3A6046'], shade: '#16261A', base: ['#4E7A5A', '#3A6046'], hillA: '#F1E4C6', hillB: '#C8D8A8', ground: '#B8C898', grass: '#6A9A6A', stem: '#4E7A5A', bloom: ['#FFFFFF', '#F6EEDA', '#C2332A'], bloomMid: '#B8862E', flowers: ['#1F3F94', '#C2332A', '#B8862E'], flowerMid: '#B8862E', nightTint: '#0A1638', gsky: gsky(SK.ktazhib.sky) });
  // وسن 4.8: أحجار «مسبحة الحبّات» لكل ثيم (أونيكس، زمرّد، كهرمان، فيروز، عقيق، لازورد، زجاج الفانوس، خشب الزيتون، لؤلؤ)
  const STRAND = { kmakkah: ['#6A6A74', '#1E1E24', '#050507'], kmadinah: ['#9FE8BF', '#2E9A62', '#0F4A2C'], kalham: ['#FFE2A8', '#D08A3A', '#7A3E14'], kiznik: ['#C8FFF8', '#3FB7B2', '#146A6E'],
    kmamluk: ['#FFC4A8', '#B8452E', '#5A1A10'], klapis: ['#A8C4FF', '#2A56B0', '#0C1E5A'], kfanous: ['#FFE7A6', '#FF9A2E', '#8A3A0A'], kaqsa: ['#D8C8A0', '#8A7A4A', '#3E3420'], ktazhib: ['#FFFFFF', '#EDE3CC', '#B8A57E'] };
  Object.keys(STRAND).forEach(k => { SK[k].strand = STRAND[k]; });
  Object.assign(SKINS, SK);

  // مفاتيح السمات: g = مجموعة «فخمة إسلامية»، rt = خلفية المصحف المناسبة
  const TT = {
    kmakkah: { n: 'ليل مكة', base: 'dark', tone: 'makkah', g: 'islamic', acc: 'makkah', skin: 'kmakkah', rt: 'black', bar: '#0B0B0E', sw: ['#0B0B0E', '#1D1D23', '#9C7024', '#E8C067'] },
    kmadinah: { n: 'المدينة المنوّرة', base: 'dark', tone: 'madinah', g: 'islamic', acc: 'madinah', skin: 'kmadinah', rt: 'green', bar: '#07140F', sw: ['#07140F', '#132D22', '#1F7A4C', '#E0C27A'] },
    kaqsa: { n: 'قبّة الصخرة', base: 'dark', tone: 'aqsa', g: 'islamic', acc: 'aqsa', skin: 'kaqsa', rt: 'blue', bar: '#081028', sw: ['#081028', '#16264C', '#2A56B0', '#F2C64E'] },
    kalham: { n: 'قصر الحمراء', base: 'light', tone: 'alham', g: 'islamic', acc: 'alham', skin: 'kalham', rt: 'sand', bar: '#FAF3E6', sw: ['#FAF3E6', '#F1E4CC', '#1E7F74', '#C4703E'] },
    kiznik: { n: 'إزنيك العثماني', base: 'light', tone: 'iznik', g: 'islamic', acc: 'iznik', skin: 'kiznik', rt: 'white', bar: '#F6F9FC', sw: ['#F6F9FC', '#E6EEF8', '#1B3C8E', '#D2352A'] },
    kmamluk: { n: 'ذهب المماليك', base: 'dark', tone: 'mamluk', g: 'islamic', acc: 'mamluk', skin: 'kmamluk', rt: 'black', bar: '#0C0A09', sw: ['#0C0A09', '#221C18', '#9A2E26', '#E8C067'] },
    klapis: { n: 'لازورد أصفهان', base: 'dark', tone: 'lapis', g: 'islamic', acc: 'lapis', skin: 'klapis', rt: 'blue', bar: '#081230', sw: ['#081230', '#152856', '#1E8C9A', '#E8C067'] },
    kfanous: { n: 'فوانيس رمضان', base: 'dark', tone: 'fanous', g: 'islamic', acc: 'fanous', skin: 'kfanous', rt: 'plum', bar: '#140B1E', sw: ['#140B1E', '#2B1A3E', '#B8452E', '#FFB23E'] },
    ktazhib: { n: 'التذهيب', base: 'light', tone: 'tazhib', g: 'islamic', acc: 'tazhib', skin: 'ktazhib', rt: 'paper', bar: '#FBF5E6', sw: ['#FBF5E6', '#F1E4C6', '#1F3F94', '#B8862E'] },
  };
  Object.assign(THEMES, TT);
  if (typeof THEME_BARS !== 'undefined') Object.keys(TT).forEach(k => { THEME_BARS[k] = TT[k].bar; });
})();

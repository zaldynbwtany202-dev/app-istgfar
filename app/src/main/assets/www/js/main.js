/* ════════════════════════════════════════════════════════════════
   وسن 4.4 · الإقلاع
   ════════════════════════════════════════════════════════════════ */
'use strict';
(function boot() {
  applyTheme();
  try { FX.init(); } catch (e) {}
  const TABS = [['home', 'home', 'الرئيسية'], ['quran', 'book', 'القرآن'], ['prayer', 'mosque', 'المواقيت'], ['azkar', 'moonstar', 'الأذكار'], ['more', 'sprout', 'بستاني']];
  $('#tabbar').innerHTML = TABS.map(([t, ic, n]) => '<button class="tab" data-t="' + t + '" data-tab="' + t + '">' + icon(ic) + '<span>' + n + '</span></button>').join('');

  // ترحيل بيانات الإصدار الأول (1.0) إن وُجدت
  try {
    if (!Store.get('migrated', 0)) {
      const oldLoc = JSON.parse(localStorage.getItem('noor_loc') || 'null');
      if (oldLoc && oldLoc.lat && !Store.get('loc', null) && !(Math.abs(oldLoc.lat - 21.4225) < 1e-3)) Loc.fromCoords(oldLoc.lat, oldLoc.lng, 'gps');
      const fs = JSON.parse(localStorage.getItem('noor_fontSize') || 'null'); if (fs) setSetting('qfs', clamp(fs + 3, 20, 42));
      const dark = JSON.parse(localStorage.getItem('noor_dark') || 'null'); if (dark === false) setSetting('theme', 'light');
      if (oldLoc || fs || dark !== null) Store.set('onboarded', 1);
      Store.set('migrated', 1);
    }
  } catch (e) { /* تجاهل */ }
  applyTheme();
  Azkar.cleanup();

  Router.init('home');
  // وجهة التشغيل من إشعار أو اختصار أو أداة
  try { const lr = Native.has('takeLaunchRoute') && Native.call('takeLaunchRoute'); if (lr) setTimeout(() => openRoute(lr), 60); } catch (e) {}
  Ticker.start();
  setTimeout(() => loadQuran().catch(() => {}), 250);

  // الموقع من النواة الأصلية
  if (Native.has('getLocation')) {
    try { const j = JSON.parse(Native.call('getLocation') || 'null'); if (j && j.lat != null && !j.isDefault) { const cur = Loc.get(); if (!cur || !Loc.pinned()) Loc.fromCoords(j.lat, j.lng, 'gps', j.label || null, j.cc || null); } } catch (e) {}
  } else if (Native.has('requestPrayers')) {
    Native.call('requestPrayers');     // الجسر القديم ← applyPrayers ← استرجاع الإحداثيات
  }

  Bus.on('loc', () => { if (Router.cur && ['home', 'prayer', 'qibla', 'location'].includes(Router.cur.r)) Router.refresh(); });
  Bus.on('day', () => { if (Router.cur && Router.cur.r === 'home') Router.refresh(); });
  Bus.on('resume', () => {
    PrayedSync.take(); Habits.syncAuto();
    if (domTheme() !== document.documentElement.getAttribute('data-tkey')) { applyTheme(); Router.refresh(); }
    if (Router.cur && Router.cur.r === 'home') { SCREENS.home.paintSky(new Date()); SCREENS.home.drawCtx(); }
    // وسن 4.3: بعد العودة من إعدادات النظام تتحدّث حالة الأذونات
    else if (Router.cur && ['prayer', 'settings'].includes(Router.cur.r) && !Sheet.el) Router.refresh();
    Notif.schedule();
  });
  // السمة «حسب المواقيت» والمرشّح الليلي: تحقّق كل دقيقة
  setInterval(() => { const t = domTheme(), warm = Settings.warm === 'on' || (Settings.warm === 'night' && isNightNow());
    if (t !== document.documentElement.getAttribute('data-tkey') || warm !== document.documentElement.hasAttribute('data-warm')) { applyTheme(); if (!Sheet.el) Router.refresh(); } }, 60000);
  PrayedSync.take();
  Habits.syncAuto();
  Notif.schedule();
  try { AdhanPill.check(); } catch (e) {}
  WidgetSync.push();
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (Settings.theme === 'auto') { applyTheme(); Router.refresh(); } }); } catch (e) {}

  const sp = $('#splash');
  setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 600); }, 850);
  if (!Store.get('onboarded', 0)) { Store.set('wnSeen', '7.0'); setTimeout(() => Onboarding.show(), 900); }
  else if (Store.get('wnSeen', '') !== '7.0') setTimeout(() => { try { whatsNewSheet(); } catch (e) { console.error(e); } }, 2400);   // وسن 6.1
  // وسن 6.3: إن كان الأذان لن يصل في وقته (أذونات ناقصة أو موقع تقريبي) نعرض خطوات الإصلاح — مرة كل ثلاثة أيام على الأكثر
  else setTimeout(() => { try { NotifHealth.maybeAsk(); } catch (e) { console.error(e); } }, 4200);
})();

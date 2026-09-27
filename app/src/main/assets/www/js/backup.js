/* ════════════════════════════════════════════════════════════════
   وسن 4.2 · «النسخ الاحتياطي» — بستانك وسجلّاتك في ملف واحد
   ─ لا خوادم: الملف يُحفظ حيث تختار (الهاتف، Google Drive، أو ترسله لنفسك)
   ─ الاستعادة تستبدل البيانات الحالية بعد التأكيد، مع إمكانية التراجع عنها مرة
   ════════════════════════════════════════════════════════════════ */
'use strict';
const Backup = {
  SKIP: ['tafsir', 'migrated', 'seeded'],   // مخابئ مؤقتة لا داعي لحفظها
  UNDO: 'wasan.beforeRestore',
  collect() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || k.indexOf(Store.P) !== 0) continue;
      const s = k.slice(Store.P.length); if (this.SKIP.includes(s)) continue;
      data[s] = localStorage.getItem(k);
    }
    return { app: 'wasan', kind: 'backup', v: 1, ver: APP_VERSION || '', at: new Date().toISOString(), lvl: Growth.level(), data };
  },
  fileName() { return 'wasan-backup-' + dayKey(new Date()) + '.json'; },
  lastAt() { return Store.get('backupAt', 0); },
  save() {
    const text = JSON.stringify(this.collect());
    const ok = () => { Store.set('backupAt', Date.now()); toast('حُفظت النسخة الاحتياطية', 2600); if (Router.cur && Router.cur.r === 'backup') Router.refresh(); };
    if (Native.has('saveBackup')) {
      window.onBackupSaved = (done, cancelled) => { if (done) ok(); else if (!cancelled) toast('تعذّر حفظ الملف — جرّب مكانًا آخر'); };
      Native.call('saveBackup', this.fileName(), text); return;
    }
    try {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = this.fileName();
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); ok();
    } catch (e) { copyText(text); }
  },
  pick() {
    if (Native.has('pickBackup')) { window.onBackupPicked = t => { if (t != null) this.review(t); }; Native.call('pickBackup'); return; }
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json,text/plain';
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => this.review(String(r.result || '')); r.readAsText(f); };
    inp.click();
  },
  parse(text) {
    let o = null; try { o = JSON.parse(text); } catch (e) { return null; }
    return o && o.app === 'wasan' && o.data && typeof o.data === 'object' ? o : null;
  },
  review(text) {
    const o = this.parse(text);
    if (!o) { toast('هذا الملف ليس نسخة احتياطية من وسن', 2800); return; }
    let lvl = +o.lvl || 0;
    if (!lvl) try { lvl = Growth.levelOf((JSON.parse(o.data.growth || '{}').xp) || 0); } catch (e) { lvl = 1; }
    const at = new Date(o.at), when = isNaN(at) ? '' : 'نسخة بتاريخ ' + fmtG(at) + ' · ';
    confirmSheet('استعادة النسخة الاحتياطية؟', when + 'بستان بالمستوى ' + N(lvl) + '. ستحلّ محلّ بياناتك الحالية (بستانك الآن بالمستوى ' + N(Growth.level()) + ')، ويمكنك التراجع عنها لاحقًا من هذه الصفحة.',
      'استعادة', () => this.apply(o));
  },
  write(data) {
    const cur = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(Store.P) === 0) cur.push(k); }
    cur.forEach(k => { if (!this.SKIP.includes(k.slice(Store.P.length))) localStorage.removeItem(k); });
    Object.keys(data).forEach(s => { if (typeof data[s] === 'string' && !this.SKIP.includes(s)) try { localStorage.setItem(Store.P + s, data[s]); } catch (e) {} });
    Store.set('onboarded', 1);
  },
  apply(o) {
    try { localStorage.setItem(this.UNDO, JSON.stringify(this.collect())); } catch (e) {}
    this.write(o.data);
    toast('تمت الاستعادة — يُعاد فتح وسن…', 2400);
    setTimeout(() => location.reload(), 900);
  },
  canUndo() { try { return !!localStorage.getItem(this.UNDO); } catch (e) { return false; } },
  undo() {
    const o = this.parse(localStorage.getItem(this.UNDO) || ''); if (!o) return;
    confirmSheet('التراجع عن الاستعادة؟', 'تعود بياناتك كما كانت قبل آخر استعادة (بستان بالمستوى ' + N(+o.lvl || 1) + ').', 'تراجع', () => {
      this.write(o.data); try { localStorage.removeItem(this.UNDO); } catch (e) {}
      toast('عادت بياناتك كما كانت', 2200); setTimeout(() => location.reload(), 900);
    });
  },
};

/* ═══════════════ شاشة «النسخ الاحتياطي» ═══════════════ */
SCREENS.backup = {
  parent: 'more',
  render() {
    const g = Growth.info(), st = Garden.STAGES[g.stage], last = Backup.lastAt();
    const hab = (typeof Habits !== 'undefined' ? Habits.list.length : 0), td = (typeof Todo !== 'undefined' ? Todo.list.length : 0);
    const bm = (typeof Bookmarks !== 'undefined' ? Bookmarks.list.length : 0), days = Object.keys(Tracker.data).length;
    const row = (ic, t, s) => '<div class="li"><div class="ic">' + icon(ic) + '</div><div class="grow"><div class="t">' + t + '</div><div class="s">' + s + '</div></div></div>';
    return hdr('النسخ الاحتياطي', 'احفظ بستانك وتقدّمك في ملف', { back: true, compact: true }) +
      '<div class="hc mt bk-hero"><div class="bk-ic">' + icon('save') + '</div><div class="grow"><div class="t">بياناتك على هاتفك وحده</div>' +
      '<div class="s">وسن لا يرفع شيئًا إلى أي خادم. احفظ نسخة في ملف — على الهاتف أو في Google Drive أو أرسلها لنفسك — واستعدها عند تغيير الهاتف أو إعادة تثبيت التطبيق.</div></div></div>' +
      '<div class="mx mt"><button class="btn gold block" id="bk-save">' + icon('save') + 'حفظ نسخة احتياطية</button></div>' +
      '<div class="mx" style="margin-top:10px"><button class="btn ghost block" id="bk-load">' + icon('upload') + 'استعادة من ملف</button></div>' +
      '<div class="bk-last">' + (last ? 'آخر نسخة: ' + fmtG(new Date(last)) : 'لم تحفظ نسخة بعد') + '</div>' +
      sec('ما تتضمّنه النسخة') + '<div class="list mx">' +
      row('sprout', 'بستانك', 'المستوى ' + N(g.L) + ' · ' + esc(st.name) + ' · ' + fmtInt(Math.floor(g.xp)) + ' ' + unitOf(Math.floor(g.xp), 'نقطة', 'نقطتان', 'نقاط', 'نقطة')) +
      row('mosque', 'سجل الصلوات والقضاء', days ? pD(days) + ' في السجل' : 'لا أيام مسجّلة بعد') +
      row('book', 'القرآن الكريم', 'الختمة ' + N(Math.floor(QRead.progress() * 100)) + '٪ · ' + (bm ? plural(bm, 'علامة واحدة', 'علامتان', 'علامات', 'علامة') : 'بلا علامات') + ' · موضع التوقف') +
      row('target', 'العادات والمهام', (hab ? plural(hab, 'عادة واحدة', 'عادتان', 'عادات', 'عادة') : 'لا عادات') + ' · ' + (td ? plural(td, 'مهمة واحدة', 'مهمتان', 'مهام', 'مهمة') : 'لا مهام')) +
      row('medal', 'الأوسمة والإحصاءات', (Badges.earned() ? plural(Badges.earned(), 'وسام واحد', 'وسامان', 'أوسمة', 'وسامًا') : 'لا أوسمة بعد') + ' · أيام النشاط والتسبيح والاستغفار') +
      row('gear', 'الإعدادات', 'الموقع، وطريقة الحساب، والسمة، والتنبيهات') + '</div>' +
      (Backup.canUndo() ? '<div class="list mx mt"><button class="li" id="bk-undo"><div class="ic">' + icon('undo') + '</div><div class="grow"><div class="t">التراجع عن آخر استعادة</div>' +
        '<div class="s">أعِد بياناتك كما كانت قبل الاستعادة</div></div><div class="end">' + icon('chev') + '</div></button></div>' : '') +
      '<div class="foot-note">نصيحة: احفظ نسخة كل شهر، أو قبل تغيير الهاتف.</div>';
  },
  mount(el) {
    $('#bk-save', el).onclick = () => Backup.save();
    $('#bk-load', el).onclick = () => Backup.pick();
    const u = $('#bk-undo', el); if (u) u.onclick = () => Backup.undo();
  },
};
window.Backup = Backup;

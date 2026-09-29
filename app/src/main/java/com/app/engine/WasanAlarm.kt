package com.noor.app.engine

import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import android.app.Activity
import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.noor.app.R
import com.noor.app.ui.screens.MainActivity
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.Calendar
import java.util.Locale

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.8 · «المنبّه»
 *  ─ منبّهات بوقت ثابت وأيام تكرار، ومنبّهات تتبع المواقيت كل يوم:
 *    «قبل الفجر» (بفارق دقائق تختارها) و«قيام الليل» (بداية الثلث الأخير).
 *  ─ يُجدول بـ setAlarmClock (أدقّ منبّه في أندرويد، ويظهر رمزه في شريط الحالة).
 *  ─ يرنّ بخدمة أمامية: صوت يعلو تدريجيًّا (تكبير/أذان/نغمة وسن/طبيعة/نغمة الهاتف)،
 *    واهتزاز، وشاشة كاملة تظهر فوق قفل الشاشة مع «غفوة» و«إيقاف».
 *  ─ يُعاد جدولته بعد إعادة التشغيل وتغيير الوقت والمنطقة الزمنية.
 * ════════════════════════════════════════════════════════════════
 */
object WasanAlarm {
    private const val TAG = "WasanAlarm"
    private const val PREFS = "wasan_alarm"
    const val ACTION_FIRE = "com.noor.app.ALARM_FIRE"
    const val ACTION_STOP = "com.noor.app.ALARM_STOP"
    const val ACTION_SNOOZE = "com.noor.app.ALARM_SNOOZE"
    const val CH = "wasan_alarm_ring"
    const val NID = 7601

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun save(ctx: Context, json: String) {
        try { JSONArray(json) } catch (_: Exception) { return }
        prefs(ctx).edit().putString("list", json).apply()
        scheduleAll(ctx)
    }

    fun list(ctx: Context): JSONArray = try { JSONArray(prefs(ctx).getString("list", "[]")) } catch (_: Exception) { JSONArray() }
    private fun find(ctx: Context, id: String): JSONObject? { val a = list(ctx); for (i in 0 until a.length()) { val o = a.optJSONObject(i); if (o?.optString("id") == id) return o }; return null }

    private fun setOn(ctx: Context, id: String, on: Boolean) {
        val a = list(ctx); for (i in 0 until a.length()) { val o = a.optJSONObject(i) ?: continue; if (o.optString("id") == id) o.put("on", on) }
        prefs(ctx).edit().putString("list", a.toString()).apply()
    }

    /** حالة للواجهة: القائمة (قد يتغيّر «مفعّل» للمنبّه غير المتكرر بعد رنينه) والمواعيد القادمة */
    fun state(ctx: Context): String = JSONObject().put("list", list(ctx)).put("next", try { JSONObject(prefs(ctx).getString("next", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }).toString()

    private fun times(ctx: Context, cal: Calendar): Map<String, Long?>? {
        val c = AdhanScheduler.config(ctx) ?: return null
        if (!c.has("lat")) return null
        return try { WasanTimes.forDay(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH), AdhanPlan.params(c), false) } catch (_: Exception) { null }
    }

    private fun hm(cal: Calendar, s: String): Long {
        val p = s.split(":"); val x = cal.clone() as Calendar
        x.set(Calendar.HOUR_OF_DAY, p.getOrNull(0)?.toIntOrNull() ?: 6); x.set(Calendar.MINUTE, p.getOrNull(1)?.toIntOrNull() ?: 0)
        x.set(Calendar.SECOND, 0); x.set(Calendar.MILLISECOND, 0); return x.timeInMillis
    }

    /** الموعد التالي للمنبّه بعد «الآن» */
    fun nextFor(ctx: Context, o: JSONObject, now: Long): Long? {
        if (!o.optBoolean("on", false)) return null
        val type = o.optString("type", "fixed")
        val da = o.optJSONArray("days"); val days = HashSet<Int>()
        if (da != null) for (i in 0 until da.length()) days.add(da.optInt(i))
        val off = o.optInt("off", 0) * 60_000L
        for (i in -1..9) {
            val cal = Calendar.getInstance(); cal.timeInMillis = now; cal.add(Calendar.DAY_OF_MONTH, i)
            val at: Long = when (type) {
                "fajr" -> (times(ctx, cal)?.get("fajr") ?: continue) + off
                "qiyam" -> (times(ctx, cal)?.get("lastThird") ?: continue) + off
                else -> hm(cal, o.optString("time", "06:00"))
            }
            if (at <= now + 1500) continue
            if (days.isNotEmpty()) { val c2 = Calendar.getInstance(); c2.timeInMillis = at; if ((c2.get(Calendar.DAY_OF_WEEK) - 1) !in days) continue }
            return at
        }
        return null
    }

    private fun reqOf(id: String) = 8000 + (id.hashCode() and 0x3ff) * 2
    private fun firePI(ctx: Context, id: String, snz: Boolean = false): PendingIntent {
        val i = Intent(ctx, BootReceiver::class.java).setAction(ACTION_FIRE).putExtra("id", id).putExtra("tk", AdhanScheduler.token(ctx)).putExtra("snz", snz)
        return PendingIntent.getBroadcast(ctx, reqOf(id), i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
    private fun showPI(ctx: Context): PendingIntent {
        val i = Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(MainActivity.EXTRA_ROUTE, "alarms").putExtra(MainActivity.EXTRA_ARGS, "{}")
        return PendingIntent.getActivity(ctx, 7990, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun scheduleAll(ctx: Context) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val a = list(ctx); val now = System.currentTimeMillis(); val p = prefs(ctx)
        val prev = p.getStringSet("ids", emptySet()) ?: emptySet()
        val ids = HashSet<String>(); val next = JSONObject()
        for (i in 0 until a.length()) {
            val o = a.optJSONObject(i) ?: continue
            val id = o.optString("id"); if (id.isBlank()) continue
            ids.add(id)
            val snzAt = p.getLong("snz_$id", 0L)
            val snoozed = snzAt > now && o.optBoolean("on", false)
            val at = if (snoozed) snzAt else nextFor(ctx, o, now)
            val pi = firePI(ctx, id, snoozed)
            if (at == null) { am.cancel(pi); continue }
            try { am.setAlarmClock(AlarmManager.AlarmClockInfo(at, showPI(ctx)), pi) }
            catch (e: SecurityException) {
                try { if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi) else am.set(AlarmManager.RTC_WAKEUP, at, pi) } catch (_: Exception) { }
            }
            next.put(id, at)
        }
        for (old in prev) if (old !in ids) am.cancel(firePI(ctx, old))
        p.edit().putStringSet("ids", ids).putString("next", next.toString()).apply()
    }

    fun fire(ctx: Context, intent: Intent) {
        if (intent.getStringExtra("tk") != AdhanScheduler.token(ctx)) return
        val id = intent.getStringExtra("id") ?: return
        val o = find(ctx, id) ?: return
        val p = prefs(ctx); p.edit().remove("snz_$id").apply()
        val da = o.optJSONArray("days")
        if (o.optString("type", "fixed") == "fixed" && (da == null || da.length() == 0) && !intent.getBooleanExtra("snz", false)) setOn(ctx, id, false)
        ring(ctx, o)
        scheduleAll(ctx)
    }

    fun ring(ctx: Context, o: JSONObject) {
        val svc = Intent(ctx, AlarmService::class.java).putExtra("json", o.toString())
        try { if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(svc) else ctx.startService(svc) } catch (e: Exception) { Log.w(TAG, "ring", e) }
    }

    fun snooze(ctx: Context, id: String, min: Int) {
        if (id.isBlank() || id == "test") return
        prefs(ctx).edit().putLong("snz_$id", System.currentTimeMillis() + min.coerceIn(1, 30) * 60_000L).apply()
        val a = list(ctx); for (i in 0 until a.length()) { val o = a.optJSONObject(i) ?: continue; if (o.optString("id") == id) o.put("on", true) }
        prefs(ctx).edit().putString("list", a.toString()).apply()
        scheduleAll(ctx)
    }

    fun ensureChannel(ctx: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        try {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (nm.getNotificationChannel(CH) != null) return
            val ch = NotificationChannel(CH, "المنبّه", NotificationManager.IMPORTANCE_HIGH)
            ch.description = "رنين المنبّه وشاشة الإيقاف والغفوة"
            ch.setSound(null, null); ch.enableVibration(false); ch.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            nm.createNotificationChannel(ch)
        } catch (_: Exception) { }
    }

    fun canFullScreen(ctx: Context): Boolean = if (Build.VERSION.SDK_INT >= 34) try { (ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).canUseFullScreenIntent() } catch (_: Exception) { true } else true

    private val AR = "٠١٢٣٤٥٦٧٨٩"
    fun clock(ctx: Context, at: Long, arab: Boolean = true): String {
        val cal = Calendar.getInstance().apply { timeInMillis = at }
        val s = "%d:%02d".format(Locale.US, cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE))
        return if (arab) s.map { ch -> if (ch in '0'..'9') AR[ch - '0'] else ch }.joinToString("") else s
    }

    /** نص الذكر المناسب لنوع المنبّه */
    fun msgFor(o: JSONObject): String = o.optString("msg").ifBlank {
        when (o.optString("type")) {
            "fajr" -> "«ركعتا الفجر خيرٌ من الدنيا وما فيها» — رواه مسلم"
            "qiyam" -> "«ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر» — متفق عليه"
            else -> "الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور"
        }
    }
}

/* ─────────── خدمة الرنين ─────────── */
class AlarmService : Service() {
    private var mp: MediaPlayer? = null
    private var vib: Vibrator? = null
    private var wl: PowerManager.WakeLock? = null
    private val h = Handler(Looper.getMainLooper())
    private var cur: JSONObject = JSONObject()
    private var vol = 0.12f

    override fun onBind(i: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            WasanAlarm.ACTION_STOP -> { stopAll(); return START_NOT_STICKY }
            WasanAlarm.ACTION_SNOOZE -> { WasanAlarm.snooze(this, cur.optString("id"), cur.optInt("snooze", 5)); stopAll(); return START_NOT_STICKY }
        }
        val o = try { JSONObject(intent?.getStringExtra("json") ?: "{}") } catch (_: Exception) { JSONObject() }
        stopSound()
        cur = o
        WasanAlarm.ensureChannel(this)
        val n = notif(o)
        try { if (Build.VERSION.SDK_INT >= 29) startForeground(WasanAlarm.NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK) else startForeground(WasanAlarm.NID, n) }
        catch (e: Exception) { Log.w("WasanAlarm", "fg", e); stopSelf(); return START_NOT_STICKY }
        try { wl = (getSystemService(Context.POWER_SERVICE) as PowerManager).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "wasan:alarm").apply { acquire(10 * 60_000L) } } catch (_: Exception) { }
        play(o); buzz(o)
        // الشاشة الكاملة: تُفتح مباشرة إن أمكن (وإلا تظهر عبر إشعار الشاشة الكاملة)
        try { startActivity(Intent(this, AlarmActivity::class.java).putExtra("json", o.toString()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)) } catch (_: Exception) { }
        h.postDelayed({ stopAll() }, o.optInt("ring", 5).coerceIn(1, 15) * 60_000L)
        return START_NOT_STICKY
    }

    private fun pi(action: String, req: Int): PendingIntent = PendingIntent.getService(this, req, Intent(this, AlarmService::class.java).setAction(action), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    private fun notif(o: JSONObject): Notification {
        val full = PendingIntent.getActivity(this, 7602, Intent(this, AlarmActivity::class.java).putExtra("json", o.toString()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val label = o.optString("label").ifBlank { "المنبّه" }
        return NotificationCompat.Builder(this, WasanAlarm.CH)
            .setSmallIcon(R.drawable.ic_stat_wasan)
            .setContentTitle(label + " · " + WasanAlarm.clock(this, System.currentTimeMillis()))
            .setContentText(WasanAlarm.msgFor(o))
            .setStyle(NotificationCompat.BigTextStyle().bigText(WasanAlarm.msgFor(o)))
            .setColor(0xFF0B5D4B.toInt())
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true).setAutoCancel(false)
            .setFullScreenIntent(full, true).setContentIntent(full)
            .addAction(0, "غفوة " + o.optInt("snooze", 5) + " د", pi(WasanAlarm.ACTION_SNOOZE, 7603))
            .addAction(0, "إيقاف", pi(WasanAlarm.ACTION_STOP, 7604))
            .setSound(null)
            .build()
    }

    private fun source(p: MediaPlayer, snd: String): Boolean {
        return try {
            when {
                snd == "chime" -> { p.setDataSource(this, raw(R.raw.wasan_chime)); true }
                snd.startsWith("takbir:") -> { p.setDataSource(this, raw(AdhanScheduler.takbirRes(snd.substringAfter(':')))); true }
                snd.startsWith("adhan:") -> { p.setDataSource(this, raw(AdhanScheduler.adhanRes(snd.substringAfter(':')))); true }
                snd.startsWith("amb:") -> { val k = snd.substringAfter(':').filter { it.isLetter() }; assets.openFd("www/snd/amb_$k.ogg").use { fd -> p.setDataSource(fd.fileDescriptor, fd.startOffset, fd.length) }; true }
                snd.startsWith("voice:") -> { val r = DhikrPop.voiceRes(this, snd.substringAfter(':')); if (r == 0) false else { p.setDataSource(this, raw(r)); true } }
                else -> { val u = RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM) ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM) ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE); p.setDataSource(this, u); true }
            }
        } catch (e: Exception) { Log.w("WasanAlarm", "src $snd", e); false }
    }
    private fun raw(res: Int): Uri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + packageName + "/" + res)

    private fun play(o: JSONObject, fallback: Boolean = false) {
        try {
            val p = MediaPlayer()
            p.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
            if (!source(p, if (fallback) "tone" else o.optString("sound", "takbir:v1"))) { p.release(); if (!fallback) play(o, true); return }
            p.isLooping = true
            val ramp = o.optBoolean("ramp", true)
            vol = if (ramp) 0.12f else 1f
            p.setVolume(vol, vol)
            p.setOnErrorListener { mp2, _, _ -> try { mp2.release() } catch (_: Exception) { }; if (mp === mp2) { mp = null; if (!fallback) play(o, true) }; true }
            p.setOnPreparedListener { it.start() }
            mp = p
            p.prepareAsync()
            if (ramp) h.post(object : Runnable { override fun run() { val m = mp ?: return; vol = (vol + 0.03f).coerceAtMost(1f); try { m.setVolume(vol, vol) } catch (_: Exception) { }; if (vol < 1f) h.postDelayed(this, 1000) } })
        } catch (e: Exception) { Log.w("WasanAlarm", "play", e) }
    }

    private fun buzz(o: JSONObject) {
        if (!o.optBoolean("vib", true)) return
        try {
            val v = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
            vib = v
            val pat = longArrayOf(0, 500, 700, 500, 1400)
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(pat, 1)) else @Suppress("DEPRECATION") v.vibrate(pat, 1)
        } catch (_: Exception) { }
    }

    private fun stopSound() {
        h.removeCallbacksAndMessages(null)
        try { mp?.stop() } catch (_: Exception) { }
        try { mp?.release() } catch (_: Exception) { }
        mp = null
        try { vib?.cancel() } catch (_: Exception) { }
    }

    private fun stopAll() {
        stopSound()
        try { wl?.let { if (it.isHeld) it.release() } } catch (_: Exception) { }
        wl = null
        AlarmActivity.close()
        try { if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE) else @Suppress("DEPRECATION") stopForeground(true) } catch (_: Exception) { }
        stopSelf()
    }

    override fun onDestroy() { stopSound(); super.onDestroy() }
}

/* ─────────── شاشة المنبّه (فوق قفل الشاشة) ─────────── */
class AlarmActivity : Activity() {
    companion object {
        private var ref: WeakReference<AlarmActivity>? = null
        fun close() { try { ref?.get()?.let { a -> a.runOnUiThread { a.finish() } } } catch (_: Exception) { } }
    }
    private val h = Handler(Looper.getMainLooper())

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        ref = WeakReference(this)
        if (Build.VERSION.SDK_INT >= 27) { setShowWhenLocked(true); setTurnScreenOn(true) }
        else @Suppress("DEPRECATION") window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        try { window.statusBarColor = Color.parseColor("#071D26"); window.navigationBarColor = Color.parseColor("#071D26") } catch (_: Exception) { }
        val o = try { JSONObject(intent?.getStringExtra("json") ?: "{}") } catch (_: Exception) { JSONObject() }
        val v = build(o)
        // وسن 6.2 (targetSdk 36): الخلفية تمتد تحت الأشرطة، والمحتوى يُزاح عنها
        if (Build.VERSION.SDK_INT >= 35) ViewCompat.setOnApplyWindowInsetsListener(v) { view, ins -> val b = ins.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()); view.setPadding(b.left, b.top, b.right, b.bottom); ins }
        setContentView(v)
    }

    private fun dp(v: Float) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, resources.displayMetrics)
    private fun tv(t: String, sp: Float, col: String, bold: Boolean = false) = TextView(this).apply {
        text = t; setTextSize(TypedValue.COMPLEX_UNIT_SP, sp); setTextColor(Color.parseColor(col)); gravity = Gravity.CENTER
        if (bold) typeface = Typeface.DEFAULT_BOLD; setLineSpacing(0f, 1.25f)
    }

    private fun build(o: JSONObject): View {
        val root = FrameLayout(this)
        root.background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(Color.parseColor("#0B3B3A"), Color.parseColor("#071D26"), Color.parseColor("#050E14")))
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL; setPadding(dp(28f).toInt(), dp(70f).toInt(), dp(28f).toInt(), dp(40f).toInt()) }
        col.addView(tv("✦  وسن · المنبّه  ✦", 15f, "#E8C067"))
        val time = tv(WasanAlarm.clock(this, System.currentTimeMillis()), 84f, "#FFFFFF", true)
        col.addView(time, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(26f).toInt() })
        h.post(object : Runnable { override fun run() { time.text = WasanAlarm.clock(this@AlarmActivity, System.currentTimeMillis()); h.postDelayed(this, 15_000) } })
        col.addView(tv(o.optString("label").ifBlank { "المنبّه" }, 24f, "#F4F1EA", true), LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(6f).toInt() })
        val card = tv(WasanAlarm.msgFor(o), 18f, "#F6E7C0")
        card.background = GradientDrawable().apply { cornerRadius = dp(22f); setColor(Color.parseColor("#1AFFFFFF")); setStroke(dp(1f).toInt(), Color.parseColor("#40E8C067")) }
        card.setPadding(dp(20f).toInt(), dp(18f).toInt(), dp(20f).toInt(), dp(18f).toInt())
        col.addView(card, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(34f).toInt() })
        val sp = View(this); col.addView(sp, LinearLayout.LayoutParams(-1, 0, 1f))
        fun btn(t: String, fill: String, txt: String, stroke: String?, act: () -> Unit) = Button(this).apply {
            text = t; isAllCaps = false; setTextSize(TypedValue.COMPLEX_UNIT_SP, 19f); setTextColor(Color.parseColor(txt)); typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply { cornerRadius = dp(30f); setColor(Color.parseColor(fill)); if (stroke != null) setStroke(dp(1.5f).toInt(), Color.parseColor(stroke)) }
            stateListAnimator = null; setOnClickListener { act() }
        }
        val sn = o.optInt("snooze", 5)
        col.addView(btn("غفوة " + sn + " دقائق", "#00000000", "#F4F1EA", "#80F4F1EA") { send(WasanAlarm.ACTION_SNOOZE) }, LinearLayout.LayoutParams(-1, dp(62f).toInt()))
        col.addView(btn("إيقاف", "#E8C067", "#1A1206", null) { send(WasanAlarm.ACTION_STOP) }, LinearLayout.LayoutParams(-1, dp(62f).toInt()).apply { topMargin = dp(14f).toInt() })
        root.addView(col, FrameLayout.LayoutParams(-1, -1))
        root.layoutDirection = View.LAYOUT_DIRECTION_RTL
        return root
    }

    private fun send(action: String) {
        try { startService(Intent(this, AlarmService::class.java).setAction(action)) } catch (_: Exception) { }
        finish()
    }

    @Deprecated("") override fun onBackPressed() { /* لا يُغلق بالرجوع — استعملي «إيقاف» أو «غفوة» */ }
    override fun onDestroy() { h.removeCallbacksAndMessages(null); if (ref?.get() === this) ref = null; super.onDestroy() }
}

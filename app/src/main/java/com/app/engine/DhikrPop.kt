package com.noor.app.engine

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.noor.app.R
import com.noor.app.ui.screens.MainActivity
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import kotlin.math.abs

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.7 · «الأذكار المنبثقة»
 *  ذكرٌ لطيف يظهر لك على فترات تختارها، داخل نافذة زمنية تحدّدها (مثلًا كل ساعة
 *  من 8:00 إلى 22:00)، في الأيام التي تختارها، مع عدد التكرار (قلها 3 مرات…).
 *  ─ طريقة الظهور: إشعار منبثق أعلى الشاشة، أو نافذة عائمة فوق التطبيقات (PopOverlay).
 *  ─ الصوت: نغمة هادئة، أو «تذكير صوتي» يقرأ الذكر (WasanVoice)، أو صامت.
 *  ─ لا تحتاج قائمة مواعيد: نحسب الموعد التالي من الإعدادات مباشرة، فتستمر
 *    ولو لم يُفتح التطبيق أيامًا، وتعود بعد إعادة التشغيل (BootReceiver).
 *  ─ «ذكرتُ ✓» و«إيقاف اليوم» من الإشعار · وعدّ النافذة العائمة يُضاف إلى مسبحتك وبستانك.
 * ════════════════════════════════════════════════════════════════
 */
object DhikrPop {
    const val ACTION_POP = "com.noor.app.action.DHIKR_POP"
    const val ACTION_DONE = "com.noor.app.action.DHIKR_DONE"
    const val ACTION_MUTE = "com.noor.app.action.DHIKR_MUTE"
    private const val TAG = "WasanPop"
    private const val PREFS = "wasan_pop"
    private const val REQ = 7210
    const val NID = 7320
    const val CH_SOFT = "wasan_pop_soft"
    const val CH_QUIET = "wasan_pop_quiet"

    data class Item(val t: String, val n: Int, val f: String, val v: String)

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun save(ctx: Context, json: String) {
        try { JSONObject(json) } catch (e: Exception) { Log.w(TAG, "invalid pop json"); return }
        prefs(ctx).edit().putString("cfg", json).apply()
        ensureChannels(ctx)
        scheduleNext(ctx)
    }

    fun config(ctx: Context): JSONObject? = try { prefs(ctx).getString("cfg", null)?.let { JSONObject(it) } } catch (_: Exception) { null }

    private fun hm(s: String?, def: Int): Int {
        if (s.isNullOrBlank()) return def
        val p = s.split(":"); return try { (p[0].toInt() * 60 + (p.getOrNull(1)?.toInt() ?: 0)).coerceIn(0, 24 * 60) } catch (_: Exception) { def }
    }

    private fun items(c: JSONObject): List<Item> {
        val a = c.optJSONArray("items") ?: JSONArray()
        val out = ArrayList<Item>()
        for (i in 0 until a.length()) {
            val o = a.optJSONObject(i) ?: continue
            val t = o.optString("t"); if (t.isBlank()) continue
            out.add(Item(t, o.optInt("n", c.optInt("count", 3)).coerceIn(1, 1000), o.optString("f"), o.optString("v").ifBlank { t }))
        }
        return out
    }

    /** الموعد التالي بعد «الآن» حسب النافذة الزمنية والفاصل والأيام (تدعم نافذة تعبر منتصف الليل) */
    fun nextAt(c: JSONObject, now: Long, muteUntil: Long): Long? {
        if (!c.optBoolean("on", false)) return null
        val every = c.optInt("every", 60).coerceIn(5, 24 * 60)
        val from = hm(c.optString("from"), 8 * 60)
        var to = hm(c.optString("to"), 22 * 60)
        if (to <= from) to += 24 * 60
        val daysArr = c.optJSONArray("days")
        val days = HashSet<Int>()
        if (daysArr == null || daysArr.length() == 0) (0..6).forEach { days.add(it) } else for (i in 0 until daysArr.length()) days.add(daysArr.optInt(i))
        val floor = maxOf(now + 5_000L, muteUntil)
        val cal = Calendar.getInstance()
        for (d in -1..8) {
            cal.timeInMillis = now
            cal.add(Calendar.DAY_OF_MONTH, d)
            cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
            val wd = cal.get(Calendar.DAY_OF_WEEK) - 1          // 0 = الأحد (مثل JS)
            if (wd !in days) continue
            val base = cal.timeInMillis
            var m = from
            while (m <= to) {
                val at = base + m * 60_000L
                if (at > floor) return at
                m += every
            }
        }
        return null
    }

    private fun alarmPI(ctx: Context): PendingIntent {
        val i = Intent(ctx, BootReceiver::class.java).setAction(ACTION_POP).putExtra("token", AdhanScheduler.token(ctx))
        return PendingIntent.getBroadcast(ctx, REQ, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun scheduleNext(ctx: Context) {
        try {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val c = config(ctx)
            val at = c?.let { nextAt(it, System.currentTimeMillis(), prefs(ctx).getLong("muteUntil", 0L)) }
            if (at == null) { am.cancel(alarmPI(ctx)); prefs(ctx).edit().remove("nextAt").apply(); return }
            val pi = alarmPI(ctx)
            if (AdhanScheduler.canExact(ctx)) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            prefs(ctx).edit().putLong("nextAt", at).apply()
        } catch (e: Exception) { Log.w(TAG, "schedule", e) }
    }

    fun nextInfo(ctx: Context): Long = prefs(ctx).getLong("nextAt", 0L)

    /** الذكر التالي بالتناوب (أو عشوائيًا) */
    private fun pick(ctx: Context, c: JSONObject): Item? {
        val list = items(c); if (list.isEmpty()) return null
        val p = prefs(ctx)
        val i = if (c.optString("order") == "random") {
            var r = (Math.random() * list.size).toInt().coerceIn(0, list.size - 1)
            if (list.size > 1 && r == p.getInt("last", -1)) r = (r + 1) % list.size
            r
        } else (p.getInt("idx", -1) + 1).mod(list.size)
        p.edit().putInt("idx", i).putInt("last", i).apply()
        return list[i]
    }

    /** يُستدعى من المنبّه — pending يُنهى بعد انتهاء الصوت كي تبقى العملية حيّة للكلام */
    fun fire(ctx: Context, intent: Intent, done: () -> Unit) {
        var async = false
        try {
            if (intent.getStringExtra("token") != AdhanScheduler.token(ctx)) return
            val c = config(ctx) ?: return
            if (!c.optBoolean("on", false)) return
            // لا نُظهر الذكر فوق الأذان وهو يُرفع
            if (AdhanService.playing) return
            val item = pick(ctx, c) ?: return
            async = present(ctx, c, item, done)
        } catch (e: Exception) { Log.w(TAG, "fire", e) }
        finally {
            scheduleNext(ctx)
            if (!async) done()
        }
    }

    /** تجربة فورية من الإعدادات */
    fun test(ctx: Context) {
        val c = config(ctx) ?: return
        val item = items(c).firstOrNull() ?: Item("سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", c.optInt("count", 3), "", "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ")
        present(ctx, c, item) { }
    }

    /** يعرض الذكر ويُرجع true إن بقي عمل غير متزامن (الكلام) */
    private fun present(ctx: Context, c: JSONObject, item: Item, done: () -> Unit): Boolean {
        ensureChannels(ctx)
        val style = c.optString("style", "notif")
        val sound = c.optString("sound", "soft")
        val overlay = style == "overlay" && PopOverlay.can(ctx)
        if (overlay) PopOverlay.show(ctx, item, c.optInt("secs", 15).coerceIn(6, 120))
        if (!overlay || c.optBoolean("alsoNotif", false)) post(ctx, item, c, sound)
        else if (sound == "soft") playSoft(ctx)
        if (c.optBoolean("vib", true)) buzz(ctx)
        if (sound == "voice" && AdhanScheduler.canPlayAloud(ctx)) {
            WasanVoice.speak(ctx.applicationContext, item.v, c.optDouble("rate", 0.85).toFloat()) { done() }
            return true
        }
        return false
    }

    private fun buzz(ctx: Context) {
        try {
            val v = ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 40, 90, 40), -1))
            else @Suppress("DEPRECATION") v.vibrate(longArrayOf(0, 40, 90, 40), -1)
        } catch (_: Exception) { }
    }

    fun softUri(ctx: Context): Uri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + ctx.packageName + "/" + R.raw.wasan_pop)

    /** النغمة الهادئة وحدها (مع النافذة العائمة دون إشعار) */
    private fun playSoft(ctx: Context) {
        if (!AdhanScheduler.canPlayAloud(ctx)) return
        try {
            val p = android.media.MediaPlayer()
            p.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
            p.setDataSource(ctx, softUri(ctx))
            p.setOnCompletionListener { it.release() }
            p.setOnErrorListener { mp, _, _ -> mp.release(); true }
            p.setOnPreparedListener { it.start() }
            p.prepareAsync()
        } catch (e: Exception) { Log.w(TAG, "soft", e) }
    }

    fun ensureChannels(ctx: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        try {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            if (nm.getNotificationChannel(CH_SOFT) == null) {
                val ch = NotificationChannel(CH_SOFT, "الأذكار المنبثقة · نغمة هادئة", NotificationManager.IMPORTANCE_HIGH)
                ch.description = "ذكر لطيف يظهر أعلى الشاشة في الأوقات التي تختارها"
                ch.setSound(softUri(ctx), attrs); ch.enableVibration(false)
                nm.createNotificationChannel(ch)
            }
            if (nm.getNotificationChannel(CH_QUIET) == null) {
                val ch = NotificationChannel(CH_QUIET, "الأذكار المنبثقة · بلا نغمة", NotificationManager.IMPORTANCE_HIGH)
                ch.description = "للتذكير الصوتي أو الصامت"
                ch.setSound(null, null); ch.enableVibration(false)
                nm.createNotificationChannel(ch)
            }
        } catch (e: Exception) { Log.w(TAG, "channels", e) }
    }

    private fun pi(ctx: Context, action: String, req: Int, item: Item): PendingIntent {
        val i = Intent(ctx, BootReceiver::class.java).setAction(action).putExtra("token", AdhanScheduler.token(ctx)).putExtra("t", item.t).putExtra("n", item.n)
        return PendingIntent.getBroadcast(ctx, req, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun openTasbih(ctx: Context, item: Item, req: Int): PendingIntent {
        val i = Intent(ctx, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(MainActivity.EXTRA_ROUTE, "tasbih").putExtra(MainActivity.EXTRA_ARGS, JSONObject().put("t", item.t).put("n", item.n).toString())
        return PendingIntent.getActivity(ctx, req, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun times(n: Int): String = when {
        n == 1 -> "مرة واحدة"
        n == 2 -> "مرتين"
        n in 3..10 -> "$n مرات"
        else -> "$n مرة"
    }

    private fun post(ctx: Context, item: Item, c: JSONObject, sound: String) {
        if (!AdhanScheduler.notificationsEnabled(ctx)) return
        val ch = if (sound == "soft") CH_SOFT else CH_QUIET
        val body = "قلها " + times(item.n) + (if (item.f.isNotBlank()) " · " + item.f else "")
        val b = NotificationCompat.Builder(ctx, ch)
            .setSmallIcon(R.drawable.ic_stat_wasan)
            .setContentTitle(item.t)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setColor(0xFF0B5D4B.toInt())
            .setAutoCancel(true)
            .setOnlyAlertOnce(false)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(openTasbih(ctx, item, 7521))
            .setShowWhen(true)
            .setTimeoutAfter(c.optInt("keep", 20).coerceIn(1, 240) * 60_000L)
            .addAction(0, "ذكرتُ ✓", pi(ctx, ACTION_DONE, 7522, item))
            .addAction(0, "المسبحة", openTasbih(ctx, item, 7523))
            .addAction(0, "إيقاف اليوم", pi(ctx, ACTION_MUTE, 7524, item))
        if (Build.VERSION.SDK_INT < 26) { if (sound == "soft") b.setSound(softUri(ctx)) }
        try { ctx.assets.open("www/img/icon.png").use { BitmapFactory.decodeStream(it) }?.let { b.setLargeIcon(it) } } catch (_: Exception) { }
        try { NotificationManagerCompat.from(ctx).notify(NID, b.build()) } catch (se: SecurityException) { Log.w(TAG, "no notif permission") }
    }

    // ────────── ما ذكرتَه من الإشعار/النافذة: يُضاف إلى المسبحة والبستان عند فتح التطبيق ──────────
    fun addDone(ctx: Context, t: String, n: Int) {
        val p = prefs(ctx)
        val o = try { JSONObject(p.getString("done", "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
        o.put(t, o.optInt(t, 0) + n)
        p.edit().putString("done", o.toString()).apply()
    }

    fun markDone(ctx: Context, intent: Intent) {
        if (intent.getStringExtra("token") != AdhanScheduler.token(ctx)) return
        addDone(ctx, intent.getStringExtra("t") ?: "", intent.getIntExtra("n", 1))
        try { NotificationManagerCompat.from(ctx).cancel(NID) } catch (_: Exception) { }
    }

    /** إيقاف حتى صباح الغد */
    fun mute(ctx: Context, intent: Intent?) {
        if (intent != null && intent.getStringExtra("token") != AdhanScheduler.token(ctx)) return
        val cal = Calendar.getInstance(); cal.add(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
        prefs(ctx).edit().putLong("muteUntil", cal.timeInMillis).apply()
        try { NotificationManagerCompat.from(ctx).cancel(NID) } catch (_: Exception) { }
        PopOverlay.hide()
        scheduleNext(ctx)
    }

    fun unmute(ctx: Context) { prefs(ctx).edit().remove("muteUntil").apply(); scheduleNext(ctx) }
    fun mutedUntil(ctx: Context): Long = prefs(ctx).getLong("muteUntil", 0L).let { if (it > System.currentTimeMillis()) it else 0L }

    fun takeDone(ctx: Context): String {
        val p = prefs(ctx); val s = p.getString("done", "{}") ?: "{}"
        p.edit().remove("done").apply(); return s
    }
}

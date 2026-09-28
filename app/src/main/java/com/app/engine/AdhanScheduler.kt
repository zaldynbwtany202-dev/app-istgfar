package com.noor.app.engine

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ComponentName
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.service.quicksettings.TileService
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.noor.app.R
import com.noor.app.ui.screens.MainActivity
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.UUID
import kotlin.math.abs

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.4 · جدولة التنبيهات (الأذان · التذكير قبل الصلاة · التذكيرات اليومية)
 *  الواجهة (JS) تحسب المواقيت بإعدادات المستخدم وترسل ثلاثين يومًا إلى هنا،
 *  ومعها إعدادات الحساب (setAdhanConfig). نحفظ القائمة ونجدول «المنبّه التالي»
 *  فقط، وعند رنينه نعرض الإشعار ونجدول الذي يليه — وبعد إعادة التشغيل يعيد
 *  BootReceiver الجدولة. إن اقترب الجدول من نهايته ولم يُفتح التطبيق، نمدّده
 *  وحدنا بمحرّك WasanTimes المطابق للواجهة.
 *
 *  كل عنصر: {at, title, body, key, name, ch:"adhan|pre|remind", route, args, pre}
 *  ─ صوت الأذان: adhan (الأذان كاملًا بخدمة AdhanService) | takbir (التكبير فقط)
 *    | chime (نغمة وسن) | system | custom (نغمة من الهاتف) | silent (اهتزاز فقط).
 *    قنوات أندرويد لا يُغيَّر صوتها بعد إنشائها، لذا لكل صوت قناة بمعرّف خاص.
 * ════════════════════════════════════════════════════════════════
 */
object AdhanScheduler {
    const val ACTION_ALARM = "com.noor.app.action.ADHAN"
    const val ACTION_PRAYED = "com.noor.app.action.PRAYED"
    private const val TAG = "WasanAdhan"
    private const val CH_PRE = "noor_remind"          // التذكير قبل الصلاة (معرّف 2.0 محفوظ)
    private const val CH_DAILY = "wasan_daily"         // الأذكار · الكهف · الصيام
    private const val CH_ADHAN_PREFIX = "wasan_adhan_"
    private const val LEGACY_ADHAN = "noor_adhan"
    private const val PREFS = "noor_adhan"
    private const val REQ_ALARM = 7201
    const val NID_ADHAN = 7301
    private const val NID_PRE = 7302
    val FIVE = AdhanPlan.FIVE
    const val DUA = "اللهمّ ربَّ هذه الدعوة التامّة، والصلاة القائمة، آتِ محمدًا الوسيلة والفضيلة، وابعثه مقامًا محمودًا الذي وعدته"
    // وسن 4.8: ثلاثة أصوات جديدة (صباح فخري · عاقب عزيز · أذان خاشع) — تسجيلات مرخّصة من ويكيميديا كومنز
    val VOICES = linkedMapOf("v1" to "أذان هادئ", "v2" to "من المسجد النبوي", "v3" to "صباح فخري", "v4" to "أذان صافٍ", "v5" to "أذان خاشع")


    private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun token(ctx: Context): String {
        val p = prefs(ctx)
        val t = p.getString("token", null)
        if (t != null) return t
        val n = UUID.randomUUID().toString()
        p.edit().putString("token", n).apply()
        return n
    }

    // ────────────────── القائمة ──────────────────

    fun save(ctx: Context, json: String) {
        try { JSONArray(json) } catch (e: Exception) { Log.w(TAG, "invalid schedule json"); return }
        prefs(ctx).edit().putString("list", json).apply()
        scheduleNext(ctx)
    }

    /** وسن 4.3: إعدادات الحساب من الواجهة (لتمديد الجدول وإعادة الحساب بعد تغيّر المنطقة الزمنية) */
    fun saveConfig(ctx: Context, json: String) {
        try { JSONObject(json) } catch (e: Exception) { Log.w(TAG, "invalid config json"); return }
        prefs(ctx).edit().putString("cfg", json).apply()
    }

    fun config(ctx: Context): JSONObject? =
        try { prefs(ctx).getString("cfg", null)?.let { JSONObject(it) } } catch (_: Exception) { null }

    fun entries(ctx: Context): List<AdhanEntry> {
        val base = parse(prefs(ctx).getString("list", null)).filter { it.key != "test" }
        val t = testEntry(ctx) ?: return base
        return (base + t).sortedBy { it.at }
    }

    /** الأذان التجريبي محفوظ وحده كي لا تمحوه إعادة الجدولة من الواجهة خلال الثواني الخمس */
    private fun testEntry(ctx: Context): AdhanEntry? {
        val raw = prefs(ctx).getString("test", null) ?: return null
        val e = parse(raw).firstOrNull() ?: return null
        if (System.currentTimeMillis() - e.at > 20 * 60_000L) { prefs(ctx).edit().remove("test").apply(); return null }
        return e
    }

    private fun parse(raw: String?): List<AdhanEntry> {
        if (raw == null) return emptyList()
        return try {
            val a = JSONArray(raw)
            val out = ArrayList<AdhanEntry>(a.length())
            for (i in 0 until a.length()) {
                val o = a.optJSONObject(i) ?: continue
                val pre = o.optInt("pre", 0) == 1
                val key = o.optString("key")
                out.add(AdhanEntry(
                    o.optLong("at"), o.optString("title"), o.optString("body"), key,
                    o.optString("name").ifBlank { PrayerEngine.prayerNameAr(key.removeSuffix("_pre")) },
                    pre, o.optString("ch").ifBlank { if (pre) "pre" else "adhan" },
                    o.optString("route"), o.optString("args")
                ))
            }
            out.sortedBy { it.at }
        } catch (e: Exception) { emptyList() }
    }

    private fun toJson(list: List<AdhanEntry>): String {
        val a = JSONArray()
        list.forEach { e ->
            a.put(JSONObject().put("at", e.at).put("title", e.title).put("body", e.body).put("key", e.key).put("name", e.name)
                .put("pre", if (e.pre) 1 else 0).put("ch", e.ch).put("route", e.route).put("args", e.args))
        }
        return a.toString()
    }

    // ────────────────── التمديد الذاتي (WasanTimes) ──────────────────

    /** يمدّد الجدول عشرة أيام إذا بقي فيه أقل من ثلاثة أيام من الأذان */
    fun ensureAhead(ctx: Context, list: List<AdhanEntry>): List<AdhanEntry> {
        return try {
            val c = config(ctx) ?: return list
            if (FIVE.none { (c.optJSONObject("notif") ?: JSONObject()).optBoolean(it, true) }) return list
            val now = System.currentTimeMillis()
            val lastAdhan = list.filter { it.ch == "adhan" && it.key in FIVE }.maxOfOrNull { it.at } ?: 0L
            if (lastAdhan > now + 3 * 86_400_000L) return list
            val from = Calendar.getInstance()
            if (lastAdhan > now) { from.timeInMillis = lastAdhan; from.add(Calendar.DAY_OF_MONTH, 1) }
            from.set(Calendar.HOUR_OF_DAY, 0); from.set(Calendar.MINUTE, 0); from.set(Calendar.SECOND, 0); from.set(Calendar.MILLISECOND, 0)
            val merged = (list.filter { it.at > now - 3_600_000L && it.key != "test" } + AdhanPlan.generate(c, from, 10, now)).sortedBy { it.at }.take(900)
            prefs(ctx).edit().putString("list", toJson(merged)).putLong("extendedAt", now).apply()
            Log.i(TAG, "schedule extended natively: +" + (merged.size - list.size))
            (merged + listOfNotNull(testEntry(ctx))).sortedBy { it.at }
        } catch (e: Exception) { Log.w(TAG, "ensureAhead", e); list }
    }

    /** بعد تغيّر المنطقة الزمنية: نعيد حساب الأذان من الإعدادات (القائمة القديمة بتوقيت خاطئ) */
    fun rebuild(ctx: Context) {
        try {
            val c = config(ctx) ?: return
            val now = System.currentTimeMillis()
            val keep = entries(ctx).filter { it.ch == "remind" && it.key.startsWith("t_") && it.at > now }   // المهام بمواعيد مطلقة
            val from = Calendar.getInstance(TimeZone.getDefault())
            from.set(Calendar.HOUR_OF_DAY, 0); from.set(Calendar.MINUTE, 0); from.set(Calendar.SECOND, 0); from.set(Calendar.MILLISECOND, 0)
            val list = (keep + AdhanPlan.generate(c, from, 14, now)).sortedBy { it.at }
            prefs(ctx).edit().putString("list", toJson(list)).apply()
        } catch (e: Exception) { Log.w(TAG, "rebuild", e) }
    }

    /** وسن 4.3: أذان تجريبي بعد خمس ثوانٍ عبر المسار الحقيقي نفسه (المنبّه ← الإشعار ← الصوت) */
    fun test(ctx: Context) {
        val c = config(ctx)
        val at = System.currentTimeMillis() + 5_000L
        val label = c?.optString("label").orEmpty()
        val e = AdhanEntry(at, "تجربة الأذان — وسن", (if (label.isNotBlank()) "$label · " else "") + "هكذا سيصلك الأذان عند دخول وقت الصلاة", "test", "تجربة",
            false, "adhan", "prayer", "")
        prefs(ctx).edit().putString("test", toJson(listOf(e))).apply()
        scheduleNext(ctx)
    }

    fun canExact(ctx: Context): Boolean {
        if (Build.VERSION.SDK_INT < 31) return true
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return false
        return try { am.canScheduleExactAlarms() } catch (_: Exception) { false }
    }

    fun notificationsEnabled(ctx: Context): Boolean =
        try { NotificationManagerCompat.from(ctx).areNotificationsEnabled() } catch (_: Exception) { false }

    private fun alarmIntent(ctx: Context, at: Long): PendingIntent {
        val i = Intent(ctx, BootReceiver::class.java).setAction(ACTION_ALARM)
            .putExtra("at", at).putExtra("token", token(ctx))
        return PendingIntent.getBroadcast(ctx, REQ_ALARM, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun scheduleNext(ctx: Context) {
        try {
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val now = System.currentTimeMillis()
            val all = ensureAhead(ctx, entries(ctx))
            val next = all.firstOrNull { it.at > now + 1500 }
            val ed = prefs(ctx).edit()
            if (next == null) {
                am.cancel(alarmIntent(ctx, 0L))
                ed.remove("nextAt").remove("nextKey").remove("nextName").apply()
                updateTile(ctx)
                return
            }
            val pi = alarmIntent(ctx, next.at)
            if (canExact(ctx)) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.at, pi)
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.at, pi)
            val np = all.firstOrNull { it.at > now && it.ch == "adhan" && it.key != "test" }
            if (np != null) ed.putLong("nextAt", np.at).putString("nextKey", np.key).putString("nextName", np.name)
            ed.apply()
            updateTile(ctx)
        } catch (e: Exception) {
            Log.w(TAG, "schedule failed", e)
        }
    }

    /** يُرجع نصًّا يُقرأ بالصوت (وسن 4.7: «التذكير الصوتي» للتذكيرات اليومية) أو null */
    fun fire(ctx: Context, intent: Intent): String? {
        var speak: String? = null
        try {
            if (intent.getStringExtra("token") != token(ctx)) return null
            val at = intent.getLongExtra("at", 0L)
            val now = System.currentTimeMillis()
            // عنصر أذان واحد فقط يُشغَّل صوته؛ البقية (تذكيرات في الدقيقة نفسها) إشعارات عادية
            val due = entries(ctx).filter { abs(it.at - at) < 60_000 && now - it.at < 20 * 60_000 }
            if (due.any { it.key == "test" }) prefs(ctx).edit().remove("test").apply()
            due.forEach { show(ctx, it) }
            if (voiceRemind(ctx) && canPlayAloud(ctx) && !AdhanService.playing) {
                val r = due.filter { it.ch == "remind" }
                if (r.isNotEmpty()) speak = "تذكيرٌ لطيف: " + r.joinToString("، ") { it.title }
            }
        } catch (e: Exception) {
            Log.w(TAG, "fire failed", e)
        } finally {
            scheduleNext(ctx)
            PrayerWidgets.updateAll(ctx)
        }
        return speak
    }

    // ── وسن 4.7 · التذكير الصوتي للتذكيرات اليومية (أذكار الصباح والمساء، الكهف، العادات…) ──
    fun setVoiceRemind(ctx: Context, on: Boolean) { prefs(ctx).edit().putBoolean("voiceRemind", on).apply() }
    fun voiceRemind(ctx: Context): Boolean = prefs(ctx).getBoolean("voiceRemind", false)

    // ────────────────── صوت الأذان والقنوات ──────────────────

    private val MODES = listOf("adhan", "takbir", "system", "chime", "custom", "silent")

    fun setSound(ctx: Context, mode: String, uri: String?) {
        val m = if (mode in MODES) mode else "adhan"
        val ed = prefs(ctx).edit().putString("sound", m)
        if (m == "custom" && !uri.isNullOrBlank()) ed.putString("soundUri", uri)
        ed.apply()
        ensureChannels(ctx)
    }

    fun setVoice(ctx: Context, v: String) {
        prefs(ctx).edit().putString("voice", if (v in VOICES.keys) v else "v1").apply()
        ensureChannels(ctx)
    }

    /** وسن 4.4: الافتراضي «الأذان كاملًا» */
    fun soundMode(ctx: Context): String = prefs(ctx).getString("sound", "adhan")?.takeIf { it in MODES } ?: "adhan"
    fun voice(ctx: Context): String = prefs(ctx).getString("voice", "v1")?.takeIf { it in VOICES.keys } ?: "v1"
    fun soundUri(ctx: Context): String? = prefs(ctx).getString("soundUri", null)

    fun soundTitle(ctx: Context): String = when (soundMode(ctx)) {
        "adhan" -> "الأذان كاملًا · " + VOICES[voice(ctx)]
        "takbir" -> "التكبير فقط · " + VOICES[voice(ctx)]
        "chime" -> "نغمة وسن"
        "silent" -> "اهتزاز فقط"
        "custom" -> try {
            RingtoneManager.getRingtone(ctx, Uri.parse(soundUri(ctx)))?.getTitle(ctx) ?: "نغمة مخصّصة"
        } catch (_: Exception) { "نغمة مخصّصة" }
        else -> "نغمة الإشعارات الافتراضية"
    }

    fun rawUri(ctx: Context, res: Int): Uri = Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + ctx.packageName + "/" + res)
    fun chimeUri(ctx: Context): Uri = rawUri(ctx, R.raw.wasan_chime)
    fun adhanRes(v: String): Int = when (v) { "v2" -> R.raw.wasan_adhan_2; "v3" -> R.raw.wasan_adhan_3; "v4" -> R.raw.wasan_adhan_4; "v5" -> R.raw.wasan_adhan_5; else -> R.raw.wasan_adhan_1 }
    fun takbirRes(v: String): Int = when (v) { "v2" -> R.raw.wasan_takbir_2; "v3" -> R.raw.wasan_takbir_3; "v4" -> R.raw.wasan_takbir_4; "v5" -> R.raw.wasan_takbir_5; else -> R.raw.wasan_takbir_1 }

    private fun channelFor(ctx: Context, m: String): String = when (m) {
        "adhan" -> CH_ADHAN_PREFIX + "full"
        "takbir" -> CH_ADHAN_PREFIX + "takbir_" + voice(ctx)
        "custom" -> CH_ADHAN_PREFIX + "custom_" + Integer.toHexString((soundUri(ctx) ?: "").hashCode())
        else -> CH_ADHAN_PREFIX + m
    }

    fun adhanChannelId(ctx: Context): String = channelFor(ctx, soundMode(ctx))
    /** قناة احتياطية للأذان الكامل: التكبير بصوت المؤذّن نفسه إن تعذّر تشغيل الخدمة */
    fun fallbackChannelId(ctx: Context): String = channelFor(ctx, "takbir")

    fun ensureChannels(ctx: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        try {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            val mode = soundMode(ctx)
            val keep = HashSet<String>().apply { add(adhanChannelId(ctx)); if (mode == "adhan") add(fallbackChannelId(ctx)) }
            // احذف قنوات الأذان القديمة (قناة 2.0 وأي صوت سابق) كي لا تتكرّر في إعدادات النظام
            for (c in nm.notificationChannels) {
                if ((c.id.startsWith(CH_ADHAN_PREFIX) || c.id == LEGACY_ADHAN) && c.id !in keep) nm.deleteNotificationChannel(c.id)
            }
            val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            for (id in keep) {
                if (nm.getNotificationChannel(id) != null) continue
                val full = id == CH_ADHAN_PREFIX + "full"
                val backup = mode == "adhan" && id == fallbackChannelId(ctx)
                val ch = NotificationChannel(id, if (backup) "الأذان · تنبيه احتياطي" else "الأذان · دخول وقت الصلاة", NotificationManager.IMPORTANCE_HIGH)
                ch.description = if (full) "إشعار الأذان — الصوت يُرفع كاملًا من التطبيق" else "تنبيه عند دخول وقت كل صلاة"
                ch.enableVibration(true)
                ch.vibrationPattern = longArrayOf(0, 450, 250, 450, 250, 700)
                ch.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                val m = when {
                    full -> "silent"
                    id.startsWith(CH_ADHAN_PREFIX + "takbir_") -> "takbir"
                    id.startsWith(CH_ADHAN_PREFIX + "custom_") -> "custom"
                    else -> id.removePrefix(CH_ADHAN_PREFIX)
                }
                when (m) {
                    "silent" -> ch.setSound(null, null)
                    "takbir" -> ch.setSound(rawUri(ctx, takbirRes(id.substringAfterLast('_'))), attrs)
                    "chime" -> ch.setSound(chimeUri(ctx), attrs)
                    "custom" -> ch.setSound(soundUri(ctx)?.let { Uri.parse(it) } ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), attrs)
                    else -> ch.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), attrs)
                }
                nm.createNotificationChannel(ch)
            }
            if (nm.getNotificationChannel(CH_PRE) == null) {
                val ch = NotificationChannel(CH_PRE, "تذكير قبل الصلاة", NotificationManager.IMPORTANCE_DEFAULT)
                ch.description = "تذكير قبل دخول الوقت بدقائق"
                nm.createNotificationChannel(ch)
            }
            if (nm.getNotificationChannel(CH_DAILY) == null) {
                val ch = NotificationChannel(CH_DAILY, "التذكيرات اليومية", NotificationManager.IMPORTANCE_DEFAULT)
                ch.description = "أذكار الصباح والمساء · سورة الكهف · صلاة الجمعة · صيام التطوّع · قيام الليل"
                nm.createNotificationChannel(ch)
            }
        } catch (e: Exception) {
            Log.w(TAG, "channels", e)
        }
    }

    /** هل يُرفع الأذان بصوت عالٍ الآن؟ نحترم الوضع الصامت/الاهتزاز و«عدم الإزعاج» */
    fun canPlayAloud(ctx: Context): Boolean {
        try {
            val am = ctx.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            if (am != null && am.ringerMode != AudioManager.RINGER_MODE_NORMAL) return false
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            val dnd = Build.VERSION.SDK_INT >= 23 && nm != null && nm.currentInterruptionFilter > NotificationManager.INTERRUPTION_FILTER_ALL
            return !dnd
        } catch (_: Exception) { return true }
    }

    // ────────────────── العرض ──────────────────

    private fun bitmap(ctx: Context, path: String): Bitmap? =
        try { ctx.assets.open(path).use { BitmapFactory.decodeStream(it) } } catch (_: Exception) { null }

    private fun dayKey(at: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(at))

    fun openIntent(ctx: Context, e: AdhanEntry, req: Int): PendingIntent {
        val i = Intent(ctx, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val route = e.route.ifBlank { if (e.ch == "adhan" || e.ch == "pre") "prayer" else "" }
        if (route.isNotBlank()) i.putExtra(MainActivity.EXTRA_ROUTE, route).putExtra(MainActivity.EXTRA_ARGS, e.args.ifBlank { "{}" })
        return PendingIntent.getActivity(ctx, req, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun prayedIntent(ctx: Context, e: AdhanEntry, nid: Int): PendingIntent? {
        if (e.key !in PrayerEngine.OBLIGATORY) return null
        val pi = Intent(ctx, BootReceiver::class.java).setAction(ACTION_PRAYED)
            .putExtra("key", e.key).putExtra("day", dayKey(e.at)).putExtra("nid", nid).putExtra("token", token(ctx))
        return PendingIntent.getBroadcast(ctx, 7600 + PrayerEngine.OBLIGATORY.indexOf(e.key), pi,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    /** نص الإشعار الموسّع للأذان: الموقع والوقت ثم دعاء ما بعد الأذان */
    fun adhanBigText(e: AdhanEntry): String = if (e.key in PrayerEngine.OBLIGATORY) e.body + "\n\nدعاء ما بعد الأذان:\n«" + DUA + "»" else e.body

    /** بنّاء إشعار الأذان (يستعمله العرض العادي وخدمة الأذان الكامل) */
    fun adhanBuilder(ctx: Context, e: AdhanEntry, channel: String): NotificationCompat.Builder {
        val b = NotificationCompat.Builder(ctx, channel)
            .setSmallIcon(R.drawable.ic_stat_wasan)
            .setContentTitle(e.title)
            .setContentText(e.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(adhanBigText(e)))
            .setColor(0xFF0B5D4B.toInt())
            .setContentIntent(openIntent(ctx, e, 7500 + NID_ADHAN))
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setWhen(e.at)
            .setShowWhen(true)
        bitmap(ctx, "www/img/icon.png")?.let { b.setLargeIcon(it) }
        return b
    }

    fun show(ctx: Context, e: AdhanEntry) {
        ensureChannels(ctx)
        if (!notificationsEnabled(ctx)) return
        // وسن 4.4: الأذان كاملًا — خدمة في المقدّمة تُشغّل صوت المؤذّن حتى النهاية مع زر «إيقاف»
        if (e.ch == "adhan" && soundMode(ctx) == "adhan" && canPlayAloud(ctx)) {
            if (AdhanService.start(ctx, e)) return
            Log.w(TAG, "full adhan service could not start — fallback to takbir channel")
            post(ctx, e, fallbackChannelId(ctx)); return
        }
        post(ctx, e, null)
    }

    /** إشعار عادي؛ channelOverride لقناة احتياطية */
    fun post(ctx: Context, e: AdhanEntry, channelOverride: String?) {
        val nid = when (e.ch) { "adhan" -> NID_ADHAN; "pre" -> NID_PRE; else -> 7400 + (abs(e.key.hashCode()) % 90) }
        val channel = channelOverride ?: when (e.ch) { "adhan" -> adhanChannelId(ctx); "pre" -> CH_PRE; else -> CH_DAILY }
        val b = if (e.ch == "adhan") adhanBuilder(ctx, e, channel).setAutoCancel(true) else NotificationCompat.Builder(ctx, channel)
            .setSmallIcon(R.drawable.ic_stat_wasan)
            .setContentTitle(e.title)
            .setContentText(e.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(e.body))
            .setColor(0xFF0B5D4B.toInt())
            .setAutoCancel(true)
            .setContentIntent(openIntent(ctx, e, 7500 + nid))
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setWhen(e.at)
            .setShowWhen(true).also { bb -> bitmap(ctx, "www/img/icon.png")?.let { bb.setLargeIcon(it) } }
        if (Build.VERSION.SDK_INT < 26 && e.ch == "adhan") {
            when (soundMode(ctx)) {
                "silent" -> b.setDefaults(NotificationCompat.DEFAULT_VIBRATE)
                "adhan", "takbir" -> b.setSound(rawUri(ctx, takbirRes(voice(ctx)))).setVibrate(longArrayOf(0, 450, 250, 450))
                "chime" -> b.setSound(chimeUri(ctx)).setVibrate(longArrayOf(0, 450, 250, 450))
                "custom" -> b.setSound(soundUri(ctx)?.let { Uri.parse(it) }).setVibrate(longArrayOf(0, 450, 250, 450))
                else -> b.setDefaults(NotificationCompat.DEFAULT_ALL)
            }
        }
        if (e.ch == "adhan") prayedIntent(ctx, e, nid)?.let { b.addAction(0, "صلّيت ✓", it) }
        try {
            NotificationManagerCompat.from(ctx).notify(nid, b.build())
        } catch (se: SecurityException) {
            Log.w(TAG, "notification permission missing")
        }
    }

    // ────────────────── «صلّيت» من الإشعار ──────────────────

    fun markPrayed(ctx: Context, intent: Intent) {
        if (intent.getStringExtra("token") != token(ctx)) return
        val key = intent.getStringExtra("key") ?: return
        val day = intent.getStringExtra("day") ?: return
        val p = prefs(ctx)
        val arr = try { JSONArray(p.getString("prayed", "[]")) } catch (_: Exception) { JSONArray() }
        arr.put(JSONObject().put("day", day).put("key", key))
        p.edit().putString("prayed", arr.toString()).apply()
        // «صلّيت» أثناء الأذان يوقفه أيضًا
        if (AdhanService.playing) AdhanService.stop(ctx, true)
        try { NotificationManagerCompat.from(ctx).cancel(intent.getIntExtra("nid", NID_ADHAN)) } catch (_: Exception) { }
    }

    /** تُستدعى من الواجهة عند العودة: تُعيد العلامات المسجّلة من الإشعارات ثم تمسحها */
    fun takePrayed(ctx: Context): String {
        val p = prefs(ctx)
        val s = p.getString("prayed", "[]") ?: "[]"
        p.edit().remove("prayed").apply()
        return s
    }

    private fun updateTile(ctx: Context) {
        if (Build.VERSION.SDK_INT < 24) return
        try { TileService.requestListeningState(ctx, ComponentName(ctx, NextPrayerTile::class.java)) } catch (_: Exception) { }
    }
}

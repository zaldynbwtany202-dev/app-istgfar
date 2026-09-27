package com.noor.app.engine

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.SystemClock
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import com.noor.app.R
import com.noor.app.ui.screens.MainActivity
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 3.0 · أدوات الشاشة الرئيسية (Widgets)
 *  ─ «مواقيت اليوم» (4×2): الصلاة القادمة + عدّ تنازلي حيّ + الصلوات الخمس.
 *  ─ «الصلاة القادمة» (2×1 / 3×1): الاسم والوقت والعدّ التنازلي.
 *  المواقيت تأتي من الواجهة (نفس الطريقة والتعديلات التي يختارها المستخدم) لأربعة عشر
 *  يومًا، مع احتياط بالمحرك الأصلي إن لم تتوفر. تتحدّث تلقائيًا عند كل صلاة ومنتصف الليل.
 * ════════════════════════════════════════════════════════════════
 */
object PrayerWidgets {
    private const val TAG = "WasanWidget"
    private const val PREFS = "wasan_widget"
    const val ACTION_TICK = "com.noor.app.action.WIDGET_TICK"
    private const val REQ_TICK = 7801
    private const val REQ_OPEN = 7802
    private val NAMES = listOf("الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء")
    private val FIVE = intArrayOf(0, 2, 3, 4, 5)

    private class Day(val date: String, val at: LongArray, val fmt: Array<String>, val names: Array<String>, val hijri: String)
    private class State(val city: String, val day: Day?, val nextIdx: Int, val nextAt: Long, val boundary: Long)

    fun save(ctx: Context, json: String) {
        try { JSONObject(json) } catch (e: Exception) { Log.w(TAG, "bad widget json"); return }
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("data", json).apply()
        updateAll(ctx)
    }

    private fun dayKey(t: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(t))

    private fun loadDays(ctx: Context): Pair<String, List<Day>> {
        val raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", null)
        if (raw != null) try {
            val o = JSONObject(raw)
            val arr = o.optJSONArray("days")
            val out = ArrayList<Day>()
            if (arr != null) for (i in 0 until arr.length()) {
                val d = arr.optJSONObject(i) ?: continue
                val at = d.optJSONArray("at") ?: continue
                val f = d.optJSONArray("f"); val n = d.optJSONArray("n")
                if (at.length() < 6) continue
                out.add(Day(d.optString("d"), LongArray(6) { at.optLong(it) },
                    Array(6) { f?.optString(it) ?: "" }, Array(6) { n?.optString(it)?.ifBlank { NAMES[it] } ?: NAMES[it] },
                    d.optString("h")))
            }
            if (out.isNotEmpty()) return o.optString("city") to out
        } catch (e: Exception) { Log.w(TAG, "parse", e) }
        return fallbackDays(ctx)
    }

    /** احتياط: حساب محلي بالمحرك الأصلي من آخر موقع معروف (إن لم تُرسل الواجهة بياناتها بعد) */
    private fun fallbackDays(ctx: Context): Pair<String, List<Day>> {
        val p = ctx.getSharedPreferences("noor_native", Context.MODE_PRIVATE)
        if (!p.contains("lat")) return "" to emptyList()
        val lat = java.lang.Double.longBitsToDouble(p.getLong("lat", 0))
        val lng = java.lang.Double.longBitsToDouble(p.getLong("lng", 0))
        val method = CalcMethod.fromKey(p.getString("method", null))
        val out = ArrayList<Day>()
        val fmt = SimpleDateFormat("HH:mm", Locale.US)
        for (k in 0..1) {
            val cal = Calendar.getInstance(); cal.add(Calendar.DAY_OF_MONTH, k)
            val y = cal.get(Calendar.YEAR); val m = cal.get(Calendar.MONTH) + 1; val d = cal.get(Calendar.DAY_OF_MONTH)
            val tz = TimeZone.getDefault().getOffset(cal.timeInMillis) / 3600000.0
            val pt = PrayerEngine.compute(y, m, d, lat, lng, tz, method).list()
            val base = Calendar.getInstance().apply { set(y, m - 1, d, 0, 0, 0); set(Calendar.MILLISECOND, 0) }.timeInMillis
            val at = LongArray(6) { base + (pt[it].second * 3600_000.0).toLong() }
            out.add(Day(dayKey(base), at, Array(6) { fmt.format(Date(at[it])) }, NAMES.toTypedArray(), ""))
        }
        return (p.getString("label", null) ?: "") to out
    }

    private fun state(ctx: Context): State {
        val (city, days) = loadDays(ctx)
        val now = System.currentTimeMillis()
        val today = dayKey(now)
        val idx = days.indexOfFirst { it.date == today }
        if (idx < 0) return State(city, null, -1, 0L, nextMidnight(now))
        val d = days[idx]
        for (k in FIVE) if (d.at[k] > now) return State(city, d, k, d.at[k], minOf(d.at[k] + 1000, nextMidnight(now)))
        val tm = days.getOrNull(idx + 1)
        return if (tm != null) State(city, tm, 0, tm.at[0], minOf(tm.at[0] + 1000, nextMidnight(now)))
        else State(city, d, -1, 0L, nextMidnight(now))
    }

    private fun nextMidnight(now: Long): Long = Calendar.getInstance().apply {
        timeInMillis = now; add(Calendar.DAY_OF_MONTH, 1); set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 5); set(Calendar.MILLISECOND, 0)
    }.timeInMillis

    private fun remainText(ms: Long): String {
        val m = ((ms + 59_999) / 60_000).toInt()
        val h = m / 60; val mm = m % 60
        return when {
            h > 0 && mm > 0 -> "بعد $h س $mm د"
            h > 0 -> "بعد $h س"
            else -> "بعد $mm د"
        }
    }

    private fun openApp(ctx: Context): PendingIntent {
        val i = Intent(ctx, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(MainActivity.EXTRA_ROUTE, "prayer").putExtra(MainActivity.EXTRA_ARGS, "{}")
        return PendingIntent.getActivity(ctx, REQ_OPEN, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun countdown(v: RemoteViews, st: State) {
        if (st.nextAt <= 0L) {
            v.setViewVisibility(R.id.w_cd, View.GONE); v.setViewVisibility(R.id.w_cdtxt, View.GONE); return
        }
        val left = st.nextAt - System.currentTimeMillis()
        if (Build.VERSION.SDK_INT >= 24) {
            v.setViewVisibility(R.id.w_cd, View.VISIBLE); v.setViewVisibility(R.id.w_cdtxt, View.GONE)
            v.setChronometer(R.id.w_cd, SystemClock.elapsedRealtime() + left, "بعد %s", true)
            v.setChronometerCountDown(R.id.w_cd, true)
        } else {
            v.setViewVisibility(R.id.w_cd, View.GONE); v.setViewVisibility(R.id.w_cdtxt, View.VISIBLE)
            v.setTextViewText(R.id.w_cdtxt, remainText(left))
        }
    }

    private fun buildDay(ctx: Context, st: State): RemoteViews {
        val v = RemoteViews(ctx.packageName, R.layout.widget_day)
        v.setOnClickPendingIntent(R.id.w_root, openApp(ctx))
        val d = st.day
        v.setTextViewText(R.id.w_city, listOf(st.city, d?.hijri ?: "").filter { it.isNotBlank() }.joinToString(" · "))
        if (d == null) {
            v.setTextViewText(R.id.w_next, "افتح وسن"); v.setTextViewText(R.id.w_time, "")
            v.setTextViewText(R.id.w_lbl, "لتحديد موقعك ومواقيتك")
            countdown(v, st)
            return v
        }
        v.setTextViewText(R.id.w_lbl, "الصلاة القادمة")
        if (st.nextIdx >= 0) { v.setTextViewText(R.id.w_next, d.names[st.nextIdx]); v.setTextViewText(R.id.w_time, d.fmt[st.nextIdx]) }
        else { v.setTextViewText(R.id.w_next, "أتممت يومك"); v.setTextViewText(R.id.w_time, "") }
        countdown(v, st)
        val cols = intArrayOf(R.id.w_c0, R.id.w_c1, R.id.w_c2, R.id.w_c3, R.id.w_c4)
        val nms = intArrayOf(R.id.w_n0, R.id.w_n1, R.id.w_n2, R.id.w_n3, R.id.w_n4)
        val tms = intArrayOf(R.id.w_t0, R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4)
        val now = System.currentTimeMillis()
        for ((c, k) in FIVE.withIndex()) {
            val on = k == st.nextIdx
            val past = d.at[k] <= now
            v.setTextViewText(nms[c], d.names[k]); v.setTextViewText(tms[c], d.fmt[k])
            v.setInt(cols[c], "setBackgroundResource", if (on) R.drawable.widget_cell_on else R.drawable.widget_cell)
            v.setTextColor(nms[c], if (on) 0xFFF3D98F.toInt() else if (past) 0x99CFE3DB.toInt() else 0xFFCFE3DB.toInt())
            v.setTextColor(tms[c], if (on) 0xFFFFFFFF.toInt() else if (past) 0x99FFFFFF.toInt() else 0xFFFFFFFF.toInt())
        }
        return v
    }

    private fun buildNext(ctx: Context, st: State): RemoteViews {
        val v = RemoteViews(ctx.packageName, R.layout.widget_next)
        v.setOnClickPendingIntent(R.id.w_root, openApp(ctx))
        val d = st.day
        if (d == null || st.nextIdx < 0) {
            v.setTextViewText(R.id.w_next, if (d == null) "افتح وسن" else "أتممت يومك")
            v.setTextViewText(R.id.w_time, "")
        } else {
            v.setTextViewText(R.id.w_next, d.names[st.nextIdx]); v.setTextViewText(R.id.w_time, d.fmt[st.nextIdx])
        }
        countdown(v, st)
        return v
    }

    fun updateAll(ctx: Context) {
        try {
            val mgr = AppWidgetManager.getInstance(ctx) ?: return
            val dayIds = mgr.getAppWidgetIds(ComponentName(ctx, PrayerWidgetDay::class.java))
            val nextIds = mgr.getAppWidgetIds(ComponentName(ctx, PrayerWidgetNext::class.java))
            if (dayIds.isEmpty() && nextIds.isEmpty()) { cancelTick(ctx); return }
            val st = state(ctx)
            for (id in dayIds) mgr.updateAppWidget(id, buildDay(ctx, st))
            for (id in nextIds) mgr.updateAppWidget(id, buildNext(ctx, st))
            scheduleTick(ctx, st.boundary)
        } catch (e: Exception) { Log.w(TAG, "update", e) }
    }

    private fun tickIntent(ctx: Context): PendingIntent {
        val i = Intent(ctx, PrayerWidgetDay::class.java).setAction(ACTION_TICK)
        return PendingIntent.getBroadcast(ctx, REQ_TICK, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun scheduleTick(ctx: Context, at: Long) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        try {
            if (AdhanScheduler.canExact(ctx)) am.setExactAndAllowWhileIdle(AlarmManager.RTC, at, tickIntent(ctx))
            else am.setAndAllowWhileIdle(AlarmManager.RTC, at, tickIntent(ctx))
        } catch (e: Exception) { Log.w(TAG, "tick", e) }
    }

    private fun cancelTick(ctx: Context) {
        try { (ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(tickIntent(ctx)) } catch (_: Exception) { }
    }

    fun canPin(ctx: Context): Boolean =
        Build.VERSION.SDK_INT >= 26 && (AppWidgetManager.getInstance(ctx)?.isRequestPinAppWidgetSupported == true)

    fun requestPin(ctx: Context, kind: String): Boolean {
        if (Build.VERSION.SDK_INT < 26) return false
        return try {
            val mgr = AppWidgetManager.getInstance(ctx) ?: return false
            val cls = if (kind == "next") PrayerWidgetNext::class.java else PrayerWidgetDay::class.java
            mgr.requestPinAppWidget(ComponentName(ctx, cls), null, null)
        } catch (e: Exception) { false }
    }
}

/** «مواقيت اليوم» */
class PrayerWidgetDay : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) = PrayerWidgets.updateAll(context)
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            PrayerWidgets.ACTION_TICK, Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED -> PrayerWidgets.updateAll(context)
        }
    }
    override fun onDisabled(context: Context) = PrayerWidgets.updateAll(context)
}

/** «الصلاة القادمة» */
class PrayerWidgetNext : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) = PrayerWidgets.updateAll(context)
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED -> PrayerWidgets.updateAll(context)
        }
    }
    override fun onDisabled(context: Context) = PrayerWidgets.updateAll(context)
}

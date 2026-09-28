package com.noor.app.engine

import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.Locale

/** عنصر في جدول التنبيهات */
data class AdhanEntry(
    val at: Long, val title: String, val body: String, val key: String, val name: String,
    val pre: Boolean, val ch: String, val route: String, val args: String
)

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.4 · AdhanPlan — توليد جدول الأذان والتذكيرات من إعدادات الواجهة
 *  (بلا اعتماد على أندرويد؛ يطابق نصوص Notif.schedule في prayer.js ومواقيتها)
 * ════════════════════════════════════════════════════════════════
 */
object AdhanPlan {
    val FIVE = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")
    private val NAMES = mapOf("fajr" to "الفجر", "dhuhr" to "الظهر", "asr" to "العصر", "maghrib" to "المغرب", "isha" to "العشاء")

    fun params(c: JSONObject): WasanTimes.Params {
        val adj = HashMap<String, Double>()
        c.optJSONObject("adjust")?.let { o -> o.keys().forEach { k -> adj[k] = o.optDouble(k, 0.0) } }
        return WasanTimes.Params(
            c.optDouble("lat"), c.optDouble("lng"), c.optDouble("fajr", 18.0),
            if (c.isNull("isha") || !c.has("isha")) null else c.optDouble("isha", 17.0),
            c.optDouble("ishaMin", 0.0), c.optDouble("ramIshaMin", 0.0), c.optDouble("maghrib", 0.0),
            c.optBoolean("jafari", false), c.optDouble("asr", 1.0), c.optString("highLat", "angle"), adj
        )
    }

    private val AR = "٠١٢٣٤٥٦٧٨٩"
    private fun digits(c: JSONObject, s: String) = if (c.optString("digits") == "arab") s.map { ch -> if (ch in '0'..'9') AR[ch - '0'] else ch }.joinToString("") else s

    fun fmtTime(c: JSONObject, at: Long): String {
        val cal = Calendar.getInstance().apply { timeInMillis = at }
        val h = cal.get(Calendar.HOUR_OF_DAY); val m = cal.get(Calendar.MINUTE)
        return if (c.optString("clock") == "12") digits(c, "${if (h % 12 == 0) 12 else h % 12}:${"%02d".format(Locale.US, m)}") + " " + (if (h < 12) "ص" else "م")
        else digits(c, "%02d:%02d".format(Locale.US, h, m))
    }

    private fun dayKeyOf(cal: Calendar) = "%04d-%02d-%02d".format(Locale.US, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH))

    private fun strSet(a: JSONArray?): Set<String> { val s = HashSet<String>(); if (a != null) for (i in 0 until a.length()) s.add(a.optString(i)); return s }

    /** يولّد أذان/تذكيرات الأيام [fromDay, fromDay+days) من الإعدادات المحفوظة */
    fun generate(c: JSONObject, from: Calendar, days: Int, now: Long): List<AdhanEntry> {
        val out = ArrayList<AdhanEntry>()
        val p = params(c)
        val notif = c.optJSONObject("notif") ?: JSONObject()
        val names = c.optJSONObject("names") ?: JSONObject()
        val rem = c.optJSONObject("rem") ?: JSONObject()
        val ram = strSet(c.optJSONArray("ram")); val white = strSet(c.optJSONArray("white"))
        val label = c.optString("label", "")
        val pre = c.optInt("pre", 0); val preTxt = c.optString("preTxt", "")
        val cal = from.clone() as Calendar
        fun push(at: Long?, e: (Long) -> AdhanEntry) { if (at != null && at > now) out.add(e(at)) }
        fun hm(base: Calendar, s: String): Long {
            val parts = s.split(":"); val x = base.clone() as Calendar
            x.set(Calendar.HOUR_OF_DAY, parts.getOrNull(0)?.toIntOrNull() ?: 0); x.set(Calendar.MINUTE, parts.getOrNull(1)?.toIntOrNull() ?: 0)
            x.set(Calendar.SECOND, 0); x.set(Calendar.MILLISECOND, 0); return x.timeInMillis
        }
        for (i in 0 until days) {
            val y = cal.get(Calendar.YEAR); val m = cal.get(Calendar.MONTH) + 1; val d = cal.get(Calendar.DAY_OF_MONTH)
            val wd = cal.get(Calendar.DAY_OF_WEEK) - 1   // 0 = الأحد كما في JS
            val t = WasanTimes.forDay(y, m, d, p, ram.contains(dayKeyOf(cal)))
            for (k in FIVE) {
                if (!notif.optBoolean(k, true)) continue
                val at = t[k] ?: continue
                val nm = if (k == "dhuhr" && wd == 5) names.optString("jumua", "الجمعة") else names.optString(k, NAMES[k] ?: k)
                push(at) { AdhanEntry(it, "حان الآن وقت صلاة $nm", "$label · ${fmtTime(c, it)}", k, nm, false, "adhan", "prayer", "{\"adhan\":\"$k\",\"at\":$it}") }
                if (pre > 0) push(at - pre * 60_000L) { AdhanEntry(it, "اقترب وقت صلاة $nm", "$preTxt · ${fmtTime(c, at)}", k + "_pre", nm, true, "pre", "prayer", "") }
            }
            val fajr = t["fajr"]; val asr = t["asr"]; val dhuhr = t["dhuhr"]
            if (rem.optBoolean("azm") && fajr != null) push(fajr + rem.optInt("remAzm", 30) * 60_000L) { AdhanEntry(it, "أذكار الصباح", "حصّن يومك بأذكار الصباح — «فسبحان الله حين تمسون وحين تصبحون»", "r_azm", "", false, "remind", "azkarList", "{\"id\":\"morning\"}") }
            if (rem.optBoolean("aze") && asr != null) push(asr + rem.optInt("remAze", 30) * 60_000L) { AdhanEntry(it, "أذكار المساء", "لا تنسَ أذكار المساء قبل غروب الشمس", "r_aze", "", false, "remind", "azkarList", "{\"id\":\"evening\"}") }
            if (rem.optBoolean("kahf") && wd == 5) push(hm(cal, "10:00")) { AdhanEntry(it, "سورة الكهف", "«من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين»", "r_kahf", "", false, "remind", "reader", "{\"s\":18}") }
            if (rem.optBoolean("jumua") && wd == 5 && dhuhr != null) push(dhuhr - rem.optInt("remJumua", 45) * 60_000L) { AdhanEntry(it, "صلاة الجمعة", rem.optString("jumuaTxt", "") + " — اغتسل وتطيّب وبكّر إلى الجمعة، وأكثر من الصلاة على النبي ﷺ", "r_jumua", "", false, "remind", "prayer", "") }
            if (rem.optBoolean("fast") && (wd == 0 || wd == 3)) push(hm(cal, "21:00")) { AdhanEntry(it, "صيام " + (if (wd == 0) "الاثنين" else "الخميس") + " غدًا", "تُعرض الأعمال يومي الاثنين والخميس — انوِ الصيام وتسحّر", "r_fast", "", false, "remind", "calendar", "") }
            if (white.contains(dayKeyOf(cal))) push(hm(cal, "21:00")) { AdhanEntry(it, "الأيام البيض تبدأ غدًا", "يُستحب صيام الأيام 13 و14 و15 من الشهر الهجري", "r_white", "", false, "remind", "calendar", "") }
            if (rem.optBoolean("qiyam")) push(t["lastThird"]) { AdhanEntry(it, "الثلث الأخير من الليل", "«ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر»", "r_qiyam", "", false, "remind", "azkar", "") }
            if (rem.optBoolean("sleep")) push(hm(cal, rem.optString("remSleep", "22:30"))) { AdhanEntry(it, "أذكار النوم", "اختم يومك بأذكار النوم وآية الكرسي", "r_sleep", "", false, "remind", "azkarList", "{\"id\":\"sleep\"}") }
            cal.add(Calendar.DAY_OF_MONTH, 1)
        }
        return out
    }

}

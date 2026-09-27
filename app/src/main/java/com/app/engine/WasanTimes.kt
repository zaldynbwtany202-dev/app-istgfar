package com.noor.app.engine

import java.util.Calendar
import java.util.TimeZone
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.acos
import kotlin.math.asin
import kotlin.math.atan
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.sin
import kotlin.math.tan

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.3 · WasanTimes — نسخة أصلية مطابقة لمحرّك الواجهة (engine.js)
 *  تُستعمل لتمديد جدول الأذان وحدها حين لا يُفتح التطبيق طويلًا، أو لإعادة
 *  الحساب بعد تغيّر المنطقة الزمنية. الإعدادات (الطريقة/العصر/التعديلات…)
 *  تصل من الواجهة عبر setAdhanConfig فتبقى النتائج مطابقة لما تعرضه.
 * ════════════════════════════════════════════════════════════════
 */
object WasanTimes {
    private const val D2R = PI / 180.0
    private const val R2D = 180.0 / PI
    private fun sn(d: Double) = sin(d * D2R)
    private fun cs(d: Double) = cos(d * D2R)
    private fun tn(d: Double) = tan(d * D2R)
    private fun asinD(x: Double) = R2D * asin(x)
    private fun acosD(x: Double) = R2D * acos(x)
    private fun atan2D(y: Double, x: Double) = R2D * atan2(y, x)
    private fun acotD(x: Double) = R2D * atan(1.0 / x)
    private fun fix(a0: Double, b: Double): Double { val a = a0 - b * floor(a0 / b); return if (a < 0) a + b else a }
    private fun fixAngle(a: Double) = fix(a, 360.0)
    private fun fixHour(a: Double) = fix(a, 24.0)
    private fun timeDiff(a: Double, b: Double) = fixHour(b - a)

    /** إعدادات الحساب كما ترسلها الواجهة */
    data class Params(
        val lat: Double, val lng: Double,
        val fajr: Double, val isha: Double?, val ishaMin: Double, val ramIshaMin: Double,
        val maghrib: Double, val jafari: Boolean, val asr: Double, val highLat: String,
        val adjust: Map<String, Double>
    )

    fun julian(y0: Int, m0: Int, d: Int): Double {
        var y = y0; var m = m0
        if (m <= 2) { y -= 1; m += 12 }
        val a = floor(y / 100.0); val b = 2 - a + floor(a / 4.0)
        return floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + d + b - 1524.5
    }

    private class Sun(val decl: Double, val eqt: Double)

    private fun sunPosition(jd: Double): Sun {
        val dd = jd - 2451545.0
        val g = fixAngle(357.529 + 0.98560028 * dd)
        val q = fixAngle(280.459 + 0.98564736 * dd)
        val l = fixAngle(q + 1.915 * sn(g) + 0.020 * sn(2 * g))
        val e = 23.439 - 0.00000036 * dd
        val ra = atan2D(cs(e) * sn(l), cs(l)) / 15.0
        val eqt = q / 15.0 - fixHour(ra)
        val decl = asinD(sn(e) * sn(l))
        return Sun(decl, eqt)
    }

    /** ساعات عشرية محلية: fajr sunrise dhuhr asr sunset maghrib isha midnight lastThird imsak */
    fun hours(y: Int, m: Int, d: Int, tz: Double, p: Params, ramadan: Boolean): Map<String, Double> {
        val lat = p.lat; val lng = p.lng
        val jDate = julian(y, m, d) - lng / (15.0 * 24.0)
        fun midDay(t: Double) = fixHour(12 - sunPosition(jDate + t).eqt)
        fun sunAngleTime(angle: Double, t: Double, ccw: Boolean = false): Double {
            val decl = sunPosition(jDate + t).decl
            val noon = midDay(t)
            val v = (-sn(angle) - sn(decl) * sn(lat)) / (cs(decl) * cs(lat))
            if (v < -1 || v > 1 || v.isNaN()) return Double.NaN
            val tt = acosD(v) / 15.0
            return noon + (if (ccw) -tt else tt)
        }
        fun asrTime(factor: Double, t: Double): Double {
            val decl = sunPosition(jDate + t).decl
            val angle = -acotD(factor + tn(abs(lat - decl)))
            return sunAngleTime(angle, t)
        }
        val ishaIsAngle = p.isha != null
        val ramMin = ramadan && p.ramIshaMin > 0
        val ishaAngle = if (ishaIsAngle && !ramMin) p.isha!! else Double.NaN
        val ishaMins = if (ramMin) p.ramIshaMin else p.ishaMin

        var fajr = 5.0; var sunrise = 6.0; var dhuhr = 12.0; var asr = 13.0; var sunset = 18.0; var maghrib = 18.0; var isha = 18.0
        for (it in 0 until 2) {
            val pf = fajr / 24; val ps = sunrise / 24; val pd = dhuhr / 24; val pa = asr / 24; val pss = sunset / 24; val pm = maghrib / 24; val pi = isha / 24
            fajr = sunAngleTime(p.fajr, pf, true)
            sunrise = sunAngleTime(0.833, ps, true)
            dhuhr = midDay(pd)
            asr = asrTime(p.asr, pa)
            sunset = sunAngleTime(0.833, pss)
            maghrib = if (p.maghrib > 0) sunAngleTime(p.maghrib, pm) else sunAngleTime(0.833, pm)
            isha = if (ishaIsAngle && !ramMin) sunAngleTime(ishaAngle, pi) else Double.NaN
        }
        val shift = tz - lng / 15.0
        fajr += shift; sunrise += shift; dhuhr += shift; asr += shift; sunset += shift; maghrib += shift; isha += shift
        if (!ishaIsAngle || ramMin) isha = maghrib + ishaMins / 60.0

        val night = timeDiff(sunset, sunrise)
        val rule = p.highLat
        fun portion(angle: Double) = when (rule) { "middle" -> 0.5; "seventh" -> 1.0 / 7.0; else -> angle / 60.0 }
        run {
            val lim = portion(p.fajr) * night
            if (fajr.isNaN() || timeDiff(fajr, sunrise) > lim) fajr = sunrise - lim
        }
        if (ishaIsAngle && !ramMin) {
            val lim = portion(ishaAngle) * night
            if (isha.isNaN() || timeDiff(sunset, isha) > lim) isha = sunset + lim
        }
        val adj = p.adjust
        fun a(k: String) = (adj[k] ?: 0.0) / 60.0
        fajr += a("fajr"); sunrise += a("sunrise"); dhuhr += a("dhuhr"); asr += a("asr"); maghrib += a("maghrib"); isha += a("isha")

        val nightLen = (if (p.jafari) fajr + 24 else sunrise + 24) - sunset
        return mapOf(
            "fajr" to fajr, "sunrise" to sunrise, "dhuhr" to dhuhr, "asr" to asr, "sunset" to sunset,
            "maghrib" to maghrib, "isha" to isha,
            "midnight" to sunset + nightLen / 2, "lastThird" to sunset + nightLen * 2 / 3, "imsak" to fajr - 10.0 / 60.0
        )
    }

    /** بداية اليوم المحلي بالمللي ثانية */
    fun midnight(y: Int, m: Int, d: Int, zone: TimeZone = TimeZone.getDefault()): Long {
        val c = Calendar.getInstance(zone)
        c.clear(); c.set(y, m - 1, d, 0, 0, 0); c.set(Calendar.MILLISECOND, 0)
        return c.timeInMillis
    }

    /** مواقيت يوم بالمللي ثانية (مطابق لـ toDate في الواجهة) — null إن تعذّر الحساب */
    fun forDay(y: Int, m: Int, d: Int, p: Params, ramadan: Boolean, zone: TimeZone = TimeZone.getDefault()): Map<String, Long?> {
        val mid = midnight(y, m, d, zone)
        val tz = zone.getOffset(mid) / 3600000.0
        return hours(y, m, d, tz, p, ramadan).mapValues { (_, h) -> if (h.isNaN()) null else mid + Math.round(h * 3600) * 1000L }
    }
}

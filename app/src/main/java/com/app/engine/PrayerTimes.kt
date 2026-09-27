package com.noor.app.engine

import android.location.Location
import kotlin.math.*

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن · مواقيت الصلاة — Prayers Times Engine
 *  تنفيذ كامل لطرق الحساب الرئيسية (MWL, ISNA, Egypt, Makkah, Karachi, Jafari)
 *  يعمل دون إنترنت — مدخلاته خط العرض وخط الطول فقط.
 * ════════════════════════════════════════════════════════════════
 */

/** طرق الحساب المعتمدة في التطبيق */
enum class CalcMethod(
    val key: String,
    val arName: String,
    val fajrAngle: Double,
    val ishaAngle: Double,
    val maghribOffset: Double = 0.0,   // العشاء: دقائق بعد المغرب (أم القرى)
) {
    ALGERIA("algeria", "الجزائر — وزارة الشؤون الدينية", 18.0, 17.0),
    MWL("mwl", "رابطة العالم الإسلامي", 18.0, 17.0),
    ISNA("isna", "أمريكا الشمالية", 15.0, 15.0),
    EGYPT("egypt", "الهيئة المصرية العامة", 19.5, 17.5),
    MAKKAH("makkah", "أم القرى - مكة", 18.5, 0.0, 90.0),
    KARACHI("karachi", "جامعة كراتشي", 18.0, 18.0),
    JAFARI("jafari", "الشيعة الجعفرية", 16.0, 14.0);

    companion object {
        fun fromKey(k: String?) = entries.firstOrNull { it.key == k } ?: ALGERIA
    }
}

/** زاوية العصر: حنفي = 2 ، جمهور = 1 */
enum class AsrMadhhab(val key: String, val arName: String, val shadowFactor: Double) {
    SHAFII("shafii", "الجمهور (الشافعي)", 1.0),
    HANAFI("hanafi", "الحنفي", 2.0);

    companion object { fun fromKey(k: String?) = entries.firstOrNull { it.key == k } ?: SHAFII }
}

data class PrayerTimes(
    val fajr: Double, val sunrise: Double, val dhuhr: Double,
    val asr: Double, val maghrib: Double, val isha: Double,
) {
    /** قائمة موحدة بالأسماء بالترتيب الزمني */
    fun list(): List<Pair<String, Double>> = listOf(
        "fajr" to fajr, "sunrise" to sunrise, "dhuhr" to dhuhr,
        "asr" to asr, "maghrib" to maghrib, "isha" to isha,
    )
}

object PrayerEngine {

    private const val KAABA_LAT = 21.4225
    private const val KAABA_LNG = 39.8262

    /**
     * يحسب المواقيت ليوم معيّن على إحداثيات معيّنة.
     * @param year, month, day  بالتقويم الميلادي
     * @param lat, lng  بالدرجات
     */
    fun compute(
        year: Int, month: Int, day: Int,
        lat: Double, lng: Double,
        timeZoneHours: Double,
        method: CalcMethod = CalcMethod.MWL,
        asr: AsrMadhhab = AsrMadhhab.SHAFII,
    ): PrayerTimes {

        val jDate = julianDate(year, month, day) - lng / (15.0 * 24.0)

        val decl = sunDeclination(jDate)
        val eqt = equationOfTime(jDate)

        val dhuhr = computeDhuhr(lng, timeZoneHours, eqt)
        val sunrise = computeSunrise(lat, decl, dhuhr)
        val fajr = computeSunAngleTime(method.fajrAngle, lat, decl, dhuhr, true)
        val maghrib = sunset(lat, decl, dhuhr)
        val ishaRaw = computeSunAngleTime(method.ishaAngle, lat, decl, dhuhr, false)
        // إصلاح 2.0: العشاء بالدقائق تُحسب بعد المغرب (لا بعد الظهر كما في 1.0)
        val isha = if (method.maghribOffset > 0.0) maghrib + method.maghribOffset / 60.0 else ishaRaw
        val asrTime = computeAsr(asr.shadowFactor, lat, decl, dhuhr)

        return PrayerTimes(fajr, sunrise, dhuhr, asrTime, maghrib, isha)
    }

    // ────────────────── أدوات الزوايا ──────────────────

    private fun computeSunAngleTime(angle: Double, lat: Double, decl: Double, dhuhr: Double, isFajr: Boolean): Double {
        val r = toRad(angle)
        val phi = toRad(lat)
        val d = toRad(decl)
        // cos(H) = -tan(lat)·tan(decl) - sin(angle)/cos(lat)/cos(decl)
        val cosH = -tan(phi) * tan(d) - sin(r) / (cos(phi) * cos(d))
        val h = if (isFajr) fromRad(acos(cosH)) else -fromRad(acos(cosH))
        return dhuhr - h / 15.0
    }

    private fun computeSunrise(lat: Double, decl: Double, dhuhr: Double) =
        computeSunAngleTime(0.833, lat, decl, dhuhr, true)

    private fun sunset(lat: Double, decl: Double, dhuhr: Double) =
        computeSunAngleTime(0.833, lat, decl, dhuhr, false)

    private fun computeAsr(shadow: Double, lat: Double, decl: Double, dhuhr: Double): Double {
        val phi = toRad(lat)
        val d = toRad(decl)
        val a = -atan(1.0 / (shadow + tan(abs(phi - d))))
        return computeSunAngleTime(fromRad(a), lat, decl, dhuhr, false)
    }

    private fun computeDhuhr(lng: Double, tz: Double, eqt: Double): Double {
        // الظهر = 12 + فرق التوقيت - خط الطول/15 - معادلة الزمن
        return 12.0 + tz - lng / 15.0 - eqt / 60.0
    }

    // ────────────────── الفلك ──────────────────

    private fun julianDate(y: Int, m: Int, d: Int): Double {
        var year = y
        var month = m
        if (m <= 2) { year -= 1; month += 12 }
        val a = floor(year / 100.0)
        val b = 2 - a + floor(a / 4.0)
        return floor(365.25 * (year + 4716)) + floor(30.6001 * (month + 1)) + d + b - 1524.5
    }

    private fun sunDeclination(jd: Double): Double {
        val d = jd - 2451545.0
        val l = mod(280.460 + 0.9856474 * d, 360.0)
        val g = mod(357.528 + 0.9856003 * d, 360.0)
        val lambda = l + 1.915 * sin(toRad(g)) + 0.020 * sin(toRad(2 * g))
        val eps = 23.439 - 0.0000004 * d
        return fromRad(asin(sin(toRad(eps)) * sin(toRad(lambda))))
    }

    private fun equationOfTime(jd: Double): Double {
        val d = jd - 2451545.0
        val l = mod(280.460 + 0.9856474 * d, 360.0)
        val g = mod(357.528 + 0.9856003 * d, 360.0)
        val e = -1.914 * sin(toRad(g)) - 0.020 * sin(toRad(2 * g)) + 2.466 * sin(toRad(2 * l)) - 0.005 * sin(toRad(4 * l))
        return e * 4.0
    }

    // ────────────────── القبلة ──────────────────

    /** زاوية القبلة بالدرجات (0 = شمال، يدور مع عقارب الساعة) */
    fun qiblaBearing(lat: Double, lng: Double): Double {
        val phi1 = toRad(lat); val phi2 = toRad(KAABA_LAT)
        val dl = toRad(KAABA_LNG - lng)
        val y = sin(dl)
        val x = cos(phi1) * tan(phi2) - sin(phi1) * cos(dl)
        return (mod(fromRad(atan2(y, x)) + 360.0, 360.0))
    }

    /** المسافة إلى الكعبة بالكيلومتر (دائرة عظمى) */
    fun distanceToKaaba(lat: Double, lng: Double): Double {
        val r = 6371.0
        val phi1 = toRad(lat); val phi2 = toRad(KAABA_LAT)
        val dl = toRad(KAABA_LNG - lng)
        val a = sin((phi2 - phi1) / 2).pow(2) + cos(phi1) * cos(phi2) * sin(dl / 2).pow(2)
        return 2 * r * asin(sqrt(a))
    }

    // ────────────────── أدوات ──────────────────

    private fun toRad(d: Double) = d * PI / 180.0
    private fun fromRad(r: Double) = r * 180.0 / PI
    private fun mod(a: Double, b: Double) = ((a % b) + b) % b

    /** تحويل ساعات عشرية (18.5) إلى نص (18:30) */
    fun formatHour(h: Double): String {
        val hh = (floor(h)).toInt()
        val mm = round((h - hh) * 60.0).toInt()
        val (d, m) = if (mm == 60) ((hh + 1) % 24) to 0 else hh to mm
        return String.format("%02d:%02d", d, m)
    }

    /** اسم الصلاة بالعربية من المفتاح */
    fun prayerNameAr(key: String): String = when (key) {
        "fajr" -> "الفجر"; "sunrise" -> "الشروق"; "dhuhr" -> "الظهر"
        "asr" -> "العصر"; "maghrib" -> "المغرب"; "isha" -> "العشاء"
        else -> key
    }

    /** أوقات الصلوات الخمس فقط (بدون الشروق) */
    val OBLIGATORY = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")
}

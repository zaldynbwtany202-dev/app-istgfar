package com.noor.app.engine

import java.util.Calendar
import java.util.GregorianCalendar
import kotlin.math.floor

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن · التقويم الهجري
 *  خوارزمية كوندوفيتش (Kundi/Fliegel) المعتمدة في حساب الأمم المتحدة.
 *  دقة ±1 يوم تقريباً (تُحدَّث محلياً برؤية الهلال).
 * ════════════════════════════════════════════════════════════════
 */
object HijriCalendar {

    /** تاريخ ثابت لبداية التقويم الهجري (1 محرّم سنة 1) — Calendrical Calculations */
    private const val ISLAMIC_EPOCH = 227014


    val MONTHS_AR = arrayOf(
        "محرّم", "صفر", "ربيع الأول", "ربيع الآخر",
        "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
        "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
    )

    val MONTHS_AR_FULL = arrayOf(
        "مُحرَّم", "صَفَر", "ربيع الأوّل", "ربيع الآخِر",
        "جمادى الأُولى", "جمادى الآخِرة", "رجب", "شعبان",
        "رمضان", "شوّال", "ذو القَعدة", "ذو الحِجّة",
    )

    data class HijriDate(val year: Int, val month: Int, val day: Int) {
        val monthName get() = MONTHS_AR[month - 1]
        val monthNameFull get() = MONTHS_AR_FULL[month - 1]

        /** "12 رمضان 1447 هـ" */
        override fun toString() = "$day $monthName $year هـ"
    }

    /** يحوّل تاريخاً ميلادياً إلى هجري (خوارزمية Reingold & Dershowitz) */
    fun fromGregorian(year: Int, month: Int, day: Int): HijriDate {
        val fixed = fixedFromGregorian(year, month, day)
        val hYear = floor((30.0 * (fixed - ISLAMIC_EPOCH) + 10646.0) / 10631.0).toInt()
        val priorDays = fixed - islamicToFixed(hYear, 1, 1)
        val hMonth = (floor(priorDays / 29.5).toInt() + 1).coerceIn(1, 12)
        val hDay = (fixed - islamicToFixed(hYear, hMonth, 1) + 1).coerceAtLeast(1)
        return HijriDate(hYear, hMonth, hDay)
    }

    private fun fixedFromGregorian(y: Int, m: Int, d: Int): Int =
        floor(gregorianToJulian(y, m, d) - 1721424.5).toInt()

    /** تاريخ ثابت (fixed date) لبداية السنة/الشهر الهجري */
    private fun islamicToFixed(y: Int, m: Int, d: Int): Int =
        (ISLAMIC_EPOCH - 1) + (y - 1) * 354 +
                floor((3 + 11 * y) / 30.0).toInt() +
                ceil(29.5 * (m - 1)).toInt() + d

    fun fromCalendar(cal: Calendar): HijriDate =
        fromGregorian(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH))

    private fun gregorianToJulian(y: Int, m: Int, d: Int): Double {
        var year = y
        var month = m
        if (month < 3) { year -= 1; month += 12 }
        val a = floor(year / 100.0)
        val b = 2 - a + floor(a / 4.0)
        return floor(365.25 * (year + 4716)) + floor(30.6001 * (month + 1)) + d + b - 1524.5
    }

    // ────────────────── المناسبات ──────────────────

    data class Occasion(val month: Int, val day: Int, val title: String, val note: String)

    val OCCASIONS = listOf(
        Occasion(1, 1, "رأس السنة الهجرية", "بداية العام الهجري"),
        Occasion(1, 10, "يوم عاشوراء", "صيامٌ مستحب"),
        Occasion(3, 12, "المولد النبوي الشريف", "ذكرى مولد النبي ﷺ"),
        Occasion(7, 27, "الإسراء والمعراج", "معجزة الإسراء والمعراج"),
        Occasion(8, 15, "ليلة النصف من شعبان", "ليلة مباركة"),
        Occasion(9, 1, "بداية شهر رمضان", "شهر الصيام"),
        Occasion(9, 27, "ليلة القدر", "خيرٌ من ألف شهر"),
        Occasion(10, 1, "عيد الفطر", "عيد المسلمين بعد رمضان"),
        Occasion(12, 9, "يوم عرفة", "أفضل أيام السنة"),
        Occasion(12, 10, "عيد الأضحى", "عيد النحر"),
    )

    /** مناسبات الشهر الحالي */
    fun occasionsInMonth(hijri: HijriDate): List<Occasion> =
        OCCASIONS.filter { it.month == hijri.month }

    /** هل اليوم الحالي مناسبة؟ */
    fun occasionToday(hijri: HijriDate): Occasion? =
        OCCASIONS.firstOrNull { it.month == hijri.month && it.day == hijri.day }

    private fun ceil(d: Double) = kotlin.math.ceil(d)
}

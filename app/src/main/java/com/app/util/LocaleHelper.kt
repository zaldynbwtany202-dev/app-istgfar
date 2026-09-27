package com.noor.app.util

import android.content.Context
import android.content.res.Configuration
import androidx.appcompat.app.AppCompatDelegate
import java.util.Locale

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن · أداة اللغة — تُبقي الواجهة عربية RTL
 *  ولو كانت لغة الجهاز مختلفة.
 * ════════════════════════════════════════════════════════════════
 */
object LocaleHelper {

    fun wrap(context: Context): Context {
        val locale = Locale("ar")
        Locale.setDefault(locale)
        val config = Configuration(context.resources.configuration)
        config.setLocale(locale)
        // RTL صريح
        config.setLayoutDirection(locale)
        return context.createConfigurationContext(config)
    }

    /** هل الواجهة في وضع RTL الآن؟ */
    fun isRtl(context: Context): Boolean =
        context.resources.configuration.layoutDirection == android.view.View.LAYOUT_DIRECTION_RTL
}

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن · أداة الوقت — تنسيق الساعات والدقائق بالعربية
 * ════════════════════════════════════════════════════════════════
 */
object TimeHelper {

    /** "18:30" -> "6:30 م" */
    fun formatArabicTime(hour: Double): String {
        val h = ((hour + 24) % 24)
        val hh = h.toInt()
        val mm = ((h - hh) * 60).roundToInt()
        val (h12, suffix) = when {
            hh == 0 -> 12 to "ص"
            hh == 12 -> 12 to "م"
            hh > 12 -> (hh - 12) to "م"
            else -> hh to "ص"
        }
        return String.format(Locale("ar"), "%d:%02d %s", h12, mm, suffix)
    }

    /** فرق بين وقتين بالدقائق كنص: "3 ساعات و20 دقيقة" */
    fun durationArabic(minutes: Long): String {
        if (minutes < 0) return durationArabic(0)
        if (minutes == 0L) return "0"
        val h = minutes / 60
        val m = minutes % 60
        return when {
            h == 0L -> "$m دقيقة"
            m == 0L -> "$h ساعة"
            else -> "$h ساعة و$m دقيقة"
        }
    }

    private fun Double.roundToInt() = kotlin.math.round(this).toInt()
}

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن · أداة ضبط الوضع الليلي
 * ════════════════════════════════════════════════════════════════
 */
object DarkModeHelper {

    const val AUTO = -1
    const val LIGHT = 0
    const val DARK = 1

    /** يطبّق الوضع الليلي على النشاط الحالي دون إعادة تشغيل */
    fun apply(activity: android.app.Activity, mode: Int) {
        when (mode) {
            LIGHT -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
            DARK -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
            else -> AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        }
    }
}

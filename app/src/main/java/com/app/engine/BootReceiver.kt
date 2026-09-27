package com.noor.app.engine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.4 · مستقبل النظام
 *  ─ منبّه الأذان/التذكير (صريح ومحمي برمز سري) ← عرض الإشعار وجدولة التالي.
 *  ─ «صلّيت» من إشعار الأذان ← تسجيل الصلاة في متابعة الصلوات.
 *  ─ إقلاع الجهاز (ومنه الإقلاع السريع في بعض الهواتف) أو تحديث التطبيق ← إعادة الجدولة.
 *  ─ تغيير الساعة ← إعادة الجدولة · تغيير المنطقة الزمنية ← إعادة حساب الأذان (WasanTimes).
 * ════════════════════════════════════════════════════════════════
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            AdhanScheduler.ACTION_ALARM -> AdhanScheduler.fire(context, intent)
            AdhanScheduler.ACTION_PRAYED -> AdhanScheduler.markPrayed(context, intent)
            Intent.ACTION_TIMEZONE_CHANGED -> {
                AdhanScheduler.rebuild(context)
                AdhanScheduler.scheduleNext(context)
                PrayerWidgets.updateAll(context)
            }
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIME_CHANGED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON" -> {
                AdhanScheduler.ensureChannels(context)
                AdhanScheduler.scheduleNext(context)
                PrayerWidgets.updateAll(context)
            }
        }
    }
}

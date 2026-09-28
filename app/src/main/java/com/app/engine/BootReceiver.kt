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
 *  ─ وسن 4.7: منبّه «الأذكار المنبثقة» وزرّا «ذكرتُ ✓» و«إيقاف اليوم»، والتذكير الصوتي.
 * ════════════════════════════════════════════════════════════════
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            AdhanScheduler.ACTION_ALARM -> {
                // وسن 4.7: نُبقي المستقبل حيًّا ثوانيَ قليلة إن كان هناك تذكير صوتي
                val pr = goAsync()
                val say = AdhanScheduler.fire(context, intent)
                if (say == null) pr.finish()
                else WasanVoice.speak(context.applicationContext, say, 0.9f) { try { pr.finish() } catch (_: Exception) { } }
            }
            AdhanScheduler.ACTION_PRAYED -> AdhanScheduler.markPrayed(context, intent)
            // وسن 4.7 · الأذكار المنبثقة
            DhikrPop.ACTION_POP -> { val pr = goAsync(); DhikrPop.fire(context, intent) { try { pr.finish() } catch (_: Exception) { } } }
            DhikrPop.ACTION_DONE -> DhikrPop.markDone(context, intent)
            DhikrPop.ACTION_MUTE -> DhikrPop.mute(context, intent)
            Intent.ACTION_TIMEZONE_CHANGED -> {
                AdhanScheduler.rebuild(context)
                AdhanScheduler.scheduleNext(context)
                DhikrPop.scheduleNext(context)
                PrayerWidgets.updateAll(context)
            }
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIME_CHANGED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON" -> {
                AdhanScheduler.ensureChannels(context)
                AdhanScheduler.scheduleNext(context)
                DhikrPop.ensureChannels(context)
                DhikrPop.scheduleNext(context)
                PrayerWidgets.updateAll(context)
            }
        }
    }
}

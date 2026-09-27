package com.noor.app

import android.app.Application
import android.util.Log
import com.noor.app.engine.AdhanScheduler

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 3.0 · فئة التطبيق
 *  تسجّل الأعطال ثم تمرّرها للمعالج الافتراضي (بدل ابتلاعها وتجميد
 *  التطبيق)، وتُنشئ قنوات الإشعارات مبكرًا.
 * ════════════════════════════════════════════════════════════════
 */
class NoorApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val previous = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e("WasanApp", "Uncaught on ${thread.name}", throwable)
            previous?.uncaughtException(thread, throwable)
        }
        try { AdhanScheduler.ensureChannels(this) } catch (_: Exception) { }
    }
}

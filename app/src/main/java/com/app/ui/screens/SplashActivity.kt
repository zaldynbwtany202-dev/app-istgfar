package com.noor.app.ui.screens

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 3.0 · شاشة الافتتاح
 *  انتقال سلس للواجهة الموحّدة (WebView) مع تمرير وجهة الاختصار إن وُجدت
 *  (اختصارات الأيقونة: القرآن · القبلة · المسبحة · الأذكار).
 * ════════════════════════════════════════════════════════════════
 */
class SplashActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val next = Intent(this, MainActivity::class.java)
        intent?.getStringExtra(MainActivity.EXTRA_ROUTE)?.let {
            next.putExtra(MainActivity.EXTRA_ROUTE, it)
            next.putExtra(MainActivity.EXTRA_ARGS, intent.getStringExtra(MainActivity.EXTRA_ARGS) ?: "{}")
        }
        startActivity(next)
        @Suppress("DEPRECATION")
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }
}

package com.noor.app.engine

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.noor.app.R
import com.noor.app.ui.screens.MainActivity

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 3.0 · خدمة التلاوة (Foreground · mediaPlayback)
 *  التلاوة تُشغَّل داخل الواجهة؛ هذه الخدمة تُبقي التطبيق «في المقدّمة» أثناء التشغيل
 *  كي تستمر التلاوة عند إطفاء الشاشة، وتعرض إشعار تحكّم (السابقة · إيقاف مؤقت · التالية · إيقاف).
 * ════════════════════════════════════════════════════════════════
 */
class RecitationService : Service() {
    companion object {
        private const val TAG = "WasanAudio"
        private const val CH = "wasan_audio"
        private const val NID = 7901
        const val ACTION_UPDATE = "com.noor.app.action.REC_UPDATE"
        const val ACTION_CMD = "com.noor.app.action.REC_CMD"
        @Volatile var running = false
        /** يضبطه MainActivity: يمرّر أوامر الإشعار (toggle/next/prev/stop) إلى المشغّل في الواجهة */
        @Volatile var listener: ((String) -> Unit)? = null

        fun update(ctx: Context, title: String, sub: String, playing: Boolean) {
            val i = Intent(ctx, RecitationService::class.java).setAction(ACTION_UPDATE)
                .putExtra("title", title).putExtra("sub", sub).putExtra("playing", playing)
            try {
                if (running) ctx.startService(i) else ContextCompat.startForegroundService(ctx, i)
            } catch (e: Exception) { Log.w(TAG, "start", e) }
        }

        fun stop(ctx: Context) {
            try { ctx.stopService(Intent(ctx, RecitationService::class.java)) } catch (_: Exception) { }
            running = false
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun channel() {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(CH) == null) {
            val ch = NotificationChannel(CH, "التلاوة", NotificationManager.IMPORTANCE_LOW)
            ch.description = "التحكّم في تلاوة القرآن أثناء التشغيل"
            ch.setShowBadge(false)
            nm.createNotificationChannel(ch)
        }
    }

    private fun cmdIntent(cmd: String, req: Int): PendingIntent {
        val i = Intent(this, RecitationService::class.java).setAction(ACTION_CMD).putExtra("cmd", cmd)
        return PendingIntent.getService(this, req, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun build(title: String, sub: String, playing: Boolean): Notification {
        val open = PendingIntent.getActivity(this, 7910,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CH)
            .setSmallIcon(R.drawable.ic_stat_wasan)
            .setContentTitle(title)
            .setContentText(sub)
            .setColor(0xFF0B5D4B.toInt())
            .setContentIntent(open)
            .setOngoing(playing)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(0, "السابقة", cmdIntent("prev", 7911))
            .addAction(0, if (playing) "إيقاف مؤقت" else "متابعة", cmdIntent("toggle", 7912))
            .addAction(0, "التالية", cmdIntent("next", 7913))
            .addAction(0, "إيقاف", cmdIntent("stop", 7914))
            .build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        channel()
        when (intent?.action) {
            ACTION_UPDATE -> {
                val n = build(intent.getStringExtra("title") ?: "تلاوة", intent.getStringExtra("sub") ?: "", intent.getBooleanExtra("playing", true))
                try {
                    if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
                    else startForeground(NID, n)
                    running = true
                } catch (e: Exception) {
                    Log.w(TAG, "startForeground", e)
                    try { NotificationManagerCompat.from(this).notify(NID, n) } catch (_: SecurityException) { }
                }
            }
            ACTION_CMD -> {
                val cmd = intent.getStringExtra("cmd") ?: ""
                listener?.invoke(cmd)
                if (cmd == "stop") { stopSelfSafely(); return START_NOT_STICKY }
            }
            else -> if (!running) { stopSelfSafely(); return START_NOT_STICKY }
        }
        return START_NOT_STICKY
    }

    private fun stopSelfSafely() {
        running = false
        try {
            if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE) else @Suppress("DEPRECATION") stopForeground(true)
        } catch (_: Exception) { }
        stopSelf()
    }

    /** وسن 4.3: إغلاق التطبيق من قائمة التطبيقات الأخيرة يُنهي الواجهة (ومعها التلاوة) — نزيل إشعار التحكّم */
    override fun onTaskRemoved(rootIntent: Intent?) {
        stopSelfSafely()
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() { running = false; super.onDestroy() }
}

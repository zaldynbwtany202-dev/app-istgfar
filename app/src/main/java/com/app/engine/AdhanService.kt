package com.noor.app.engine

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.4 · خدمة «الأذان كاملًا»
 *  تبدأ من منبّه الأذان الدقيق، فتعرض إشعار الأذان في المقدّمة وتُشغّل صوت
 *  المؤذّن حتى نهايته (مجرى المنبّه، فلا يُقطع كما تُقطع نغمات الإشعارات).
 *  ─ «إيقاف الأذان» في الإشعار أو داخل التطبيق · «صلّيت ✓» يسجّل الصلاة ويوقفه.
 *  ─ يتوقف تلقائيًا عند مكالمة أو إذا طلب تطبيق آخر الصوت.
 *  ─ بعد انتهائه يبقى الإشعار مع دعاء ما بعد الأذان.
 * ════════════════════════════════════════════════════════════════
 */
class AdhanService : Service(), AudioManager.OnAudioFocusChangeListener {
    companion object {
        private const val TAG = "WasanAdhanSvc"
        const val ACTION_PLAY = "com.noor.app.action.ADHAN_PLAY"
        const val ACTION_STOP = "com.noor.app.action.ADHAN_STOP"
        @Volatile var playing = false
        @Volatile var playingName: String? = null
        /** يضبطه MainActivity لإظهار شريط «الأذان يُرفع الآن» داخل الواجهة */
        @Volatile var listener: ((Boolean, String?) -> Unit)? = null

        fun start(ctx: Context, e: AdhanEntry): Boolean {
            val i = Intent(ctx, AdhanService::class.java).setAction(ACTION_PLAY)
                .putExtra("at", e.at).putExtra("title", e.title).putExtra("body", e.body).putExtra("key", e.key)
                .putExtra("name", e.name).putExtra("route", e.route).putExtra("args", e.args)
            return try { ContextCompat.startForegroundService(ctx, i); true } catch (ex: Exception) { Log.w(TAG, "start", ex); false }
        }

        /** dismiss = إزالة الإشعار تمامًا (مثل «صلّيت») بدل إبقائه مع الدعاء */
        fun stop(ctx: Context, dismiss: Boolean = false) {
            try { ctx.startService(Intent(ctx, AdhanService::class.java).setAction(ACTION_STOP).putExtra("dismiss", dismiss)) }
            catch (_: Exception) { try { ctx.stopService(Intent(ctx, AdhanService::class.java)) } catch (_: Exception) { } }
        }
    }

    private var mp: MediaPlayer? = null
    private var entry: AdhanEntry? = null
    private var focus: AudioFocusRequest? = null
    private var wake: PowerManager.WakeLock? = null
    private val main = Handler(Looper.getMainLooper())
    private val guard = Runnable { finish(false) }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun svcIntent(action: String, req: Int, dismiss: Boolean = false): PendingIntent =
        PendingIntent.getService(this, req, Intent(this, AdhanService::class.java).setAction(action).putExtra("dismiss", dismiss),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    private fun build(e: AdhanEntry, live: Boolean): android.app.Notification {
        AdhanScheduler.ensureChannels(this)
        val ch = AdhanScheduler.adhanChannelId(this)
        val b = AdhanScheduler.adhanBuilder(this, e, ch)
        if (live) {
            b.setOngoing(true).setOnlyAlertOnce(true)
                .setSubText("الأذان يُرفع الآن")
                .addAction(0, "إيقاف الأذان", svcIntent(ACTION_STOP, 7621))
                .setDeleteIntent(svcIntent(ACTION_STOP, 7622, true))
        } else b.setAutoCancel(true).setOnlyAlertOnce(true).setSilent(true)
        AdhanScheduler.prayedIntent(this, e, AdhanScheduler.NID_ADHAN)?.let { b.addAction(0, "صلّيت ✓", it) }
        return b.build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PLAY -> {
                val e = AdhanEntry(
                    intent.getLongExtra("at", System.currentTimeMillis()), intent.getStringExtra("title") ?: "حان وقت الصلاة",
                    intent.getStringExtra("body") ?: "", intent.getStringExtra("key") ?: "", intent.getStringExtra("name") ?: "",
                    false, "adhan", intent.getStringExtra("route") ?: "prayer", intent.getStringExtra("args") ?: ""
                )
                releasePlayer()
                entry = e
                try {
                    val n = build(e, true)
                    if (Build.VERSION.SDK_INT >= 29) startForeground(AdhanScheduler.NID_ADHAN, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
                    else startForeground(AdhanScheduler.NID_ADHAN, n)
                } catch (ex: Exception) {
                    Log.w(TAG, "startForeground refused — fallback", ex)
                    AdhanScheduler.post(this, e, AdhanScheduler.fallbackChannelId(this))
                    stopSelf(); return START_NOT_STICKY
                }
                if (!play()) { finish(false); return START_NOT_STICKY }
            }
            ACTION_STOP -> { finish(intent.getBooleanExtra("dismiss", false)); return START_NOT_STICKY }
            else -> if (!playing) { stopSelf(); return START_NOT_STICKY }
        }
        return START_NOT_STICKY
    }

    private fun play(): Boolean {
        return try {
            val am = getSystemService(AUDIO_SERVICE) as AudioManager
            val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            if (Build.VERSION.SDK_INT >= 26) {
                val fr = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener(this, main).build()
                focus = fr
                am.requestAudioFocus(fr)
            } else @Suppress("DEPRECATION") am.requestAudioFocus(this, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            // أثناء مكالمة لا نرفع الأذان
            if (am.mode == AudioManager.MODE_IN_CALL || am.mode == AudioManager.MODE_IN_COMMUNICATION) return false
            val p = MediaPlayer()
            p.setAudioAttributes(attrs)
            p.setDataSource(this, AdhanScheduler.rawUri(this, AdhanScheduler.adhanRes(AdhanScheduler.voice(this))))
            p.setOnCompletionListener { finish(false) }
            p.setOnErrorListener { _, _, _ -> finish(false); true }
            p.prepare()
            p.start()
            mp = p
            try {
                wake = (getSystemService(POWER_SERVICE) as PowerManager).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "wasan:adhan").apply { acquire(6 * 60_000L) }
            } catch (_: Exception) { }
            main.removeCallbacks(guard); main.postDelayed(guard, 6 * 60_000L)
            playing = true; playingName = entry?.name
            listener?.invoke(true, playingName)
            true
        } catch (ex: Exception) { Log.w(TAG, "play", ex); false }
    }

    private fun releasePlayer() {
        main.removeCallbacks(guard)
        try { mp?.stop() } catch (_: Exception) { }
        try { mp?.release() } catch (_: Exception) { }
        mp = null
        try { wake?.let { if (it.isHeld) it.release() } } catch (_: Exception) { }
        wake = null
        try {
            val am = getSystemService(AUDIO_SERVICE) as AudioManager
            if (Build.VERSION.SDK_INT >= 26) focus?.let { am.abandonAudioFocusRequest(it) } else @Suppress("DEPRECATION") am.abandonAudioFocus(this)
        } catch (_: Exception) { }
        focus = null
    }

    /** إنهاء الأذان: نُبقي الإشعار (مع الدعاء و«صلّيت») إلا إذا طُلب إخفاؤه */
    private fun finish(dismiss: Boolean) {
        val was = playing
        releasePlayer()
        playing = false; playingName = null
        if (was) listener?.invoke(false, null)
        val e = entry; entry = null
        try {
            if (Build.VERSION.SDK_INT >= 24) stopForeground(if (dismiss) STOP_FOREGROUND_REMOVE else STOP_FOREGROUND_DETACH)
            else @Suppress("DEPRECATION") stopForeground(dismiss)
        } catch (_: Exception) { }
        try {
            val nm = NotificationManagerCompat.from(this)
            if (dismiss || e == null) nm.cancel(AdhanScheduler.NID_ADHAN) else nm.notify(AdhanScheduler.NID_ADHAN, build(e, false))
        } catch (_: SecurityException) { } catch (_: Exception) { }
        stopSelf()
    }

    override fun onAudioFocusChange(change: Int) {
        if (change == AudioManager.AUDIOFOCUS_LOSS || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) finish(false)
    }

    override fun onDestroy() {
        releasePlayer()
        if (playing) { playing = false; playingName = null; listener?.invoke(false, null) }
        super.onDestroy()
    }
}

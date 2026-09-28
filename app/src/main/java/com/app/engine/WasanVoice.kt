package com.noor.app.engine

import android.content.Context
import android.media.AudioAttributes
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.Locale

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.7 · «التذكير الصوتي»
 *  يقرأ الذكر أو عنوان التذكير بصوت هادئ عبر محرّك النطق في الهاتف (العربية).
 *  ─ يحترم الوضع الصامت و«عدم الإزعاج» (يتحقّق المستدعي عبر canPlayAloud).
 *  ─ يبدأ المحرّك عند الحاجة ويُغلق بعد نصف دقيقة من الهدوء (لا يستهلك البطارية).
 *  ─ إن لم يكن الصوت العربي مثبّتًا يُبلّغ الواجهة لتدلّ المستخدم على تثبيته.
 * ════════════════════════════════════════════════════════════════
 */
object WasanVoice {
    private const val TAG = "WasanVoice"
    private var tts: TextToSpeech? = null
    @Volatile private var ready = false
    @Volatile var state: String = "unknown"      // ok | missing | none | unknown
        private set
    private val main = Handler(Looper.getMainLooper())
    private val waiting = ArrayList<Req>()
    private val cbs = HashMap<String, Once>()
    private var seq = 0
    private val idle = Runnable { shutdown() }

    private class Once(private val f: (() -> Unit)?) { private var d = false; fun run() { if (!d) { d = true; try { f?.invoke() } catch (_: Exception) { } } } }
    private class Req(val text: String, val rate: Float, val done: Once)

    /** يقرأ النص؛ done تُستدعى مرة واحدة عند الانتهاء أو الفشل أو بعد 9 ثوانٍ كحدّ أقصى */
    fun speak(ctx: Context, text: String, rate: Float = 0.85f, done: (() -> Unit)? = null) {
        val once = Once(done)
        main.postDelayed({ once.run() }, 9_000L)
        main.post {
            main.removeCallbacks(idle)
            val t = tts
            if (t != null && ready) { say(t, Req(text, rate, once)); return@post }
            waiting.add(Req(text, rate, once))
            if (t == null) init(ctx.applicationContext)
        }
    }

    /** يفحص توفّر الصوت العربي ثم يُرجع الحالة (ok · missing · none) */
    fun check(ctx: Context, cb: (String) -> Unit) {
        main.post {
            if (tts != null && ready) { cb(state); schedIdle(); return@post }
            waiting.add(Req("", 1f, Once { cb(state) }))
            if (tts == null) init(ctx.applicationContext)
        }
    }

    private fun init(app: Context) {
        ready = false
        try {
            tts = TextToSpeech(app) { status -> main.post { onInit(status) } }
        } catch (e: Exception) { Log.w(TAG, "init", e); state = "none"; flush() }
    }

    private fun onInit(status: Int) {
        val t = tts
        if (t == null || status != TextToSpeech.SUCCESS) { state = "none"; flush(); shutdown(); return }
        val r = try { t.setLanguage(Locale("ar")) } catch (_: Exception) { TextToSpeech.LANG_NOT_SUPPORTED }
        if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) { state = "missing"; flush(); shutdown(); return }
        state = "ok"; ready = true
        try {
            t.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
        } catch (_: Exception) { }
        t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {}
            override fun onDone(id: String?) { main.post { cbs.remove(id)?.run(); schedIdle() } }
            @Deprecated("deprecated in API") override fun onError(id: String?) { main.post { cbs.remove(id)?.run(); schedIdle() } }
            override fun onError(id: String?, code: Int) { main.post { cbs.remove(id)?.run(); schedIdle() } }
        })
        val list = ArrayList(waiting); waiting.clear()
        list.forEach { if (it.text.isBlank()) it.done.run() else say(t, it) }
        schedIdle()
    }

    private fun say(t: TextToSpeech, r: Req) {
        if (r.text.isBlank()) { r.done.run(); return }
        try {
            t.setSpeechRate(r.rate.coerceIn(0.5f, 1.3f)); t.setPitch(1.0f)
            val id = "w" + (++seq)
            cbs[id] = r.done
            val p = Bundle(); p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 0.9f)
            if (t.speak(r.text, TextToSpeech.QUEUE_ADD, p, id) != TextToSpeech.SUCCESS) { cbs.remove(id); r.done.run() }
        } catch (e: Exception) { Log.w(TAG, "speak", e); r.done.run() }
    }

    private fun flush() { val list = ArrayList(waiting); waiting.clear(); list.forEach { it.done.run() } }
    private fun schedIdle() { main.removeCallbacks(idle); main.postDelayed(idle, 30_000L) }

    fun stop() { main.post { try { tts?.stop() } catch (_: Exception) { } } }

    private fun shutdown() {
        main.removeCallbacks(idle)
        try { tts?.shutdown() } catch (_: Exception) { }
        tts = null; ready = false
        val c = ArrayList(cbs.values); cbs.clear(); c.forEach { it.run() }
    }
}

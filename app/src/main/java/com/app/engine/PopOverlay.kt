package com.noor.app.engine

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.math.abs

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.7 · النافذة العائمة للأذكار المنبثقة (فوق التطبيقات)
 *  بطاقة زمرّدية هادئة أعلى الشاشة: الذكر بخط أميري، وعدد التكرار،
 *  وزرّ عدّ ذهبي (المس لتعدّ)، ثم «تقبّل الله منك» وتختفي وحدها.
 *  ─ لا تسرق التركيز ولا تمنع اللمس خارجها · اسحبها للأعلى أو المس ✕ لإخفائها.
 *  ─ المس نص الذكر لفتح المسبحة على الذكر نفسه وبعدده.
 *  تحتاج إذن «الظهور فوق التطبيقات»؛ ودونه يُعرض إشعار منبثق بدلًا منها.
 * ════════════════════════════════════════════════════════════════
 */
object PopOverlay {
    private const val TAG = "WasanOverlay"
    private var view: View? = null
    private var card: View? = null
    private var wm: WindowManager? = null
    private val main = Handler(Looper.getMainLooper())
    private val auto = Runnable { hide() }
    private var typeQ: Typeface? = null
    private var typeUi: Typeface? = null

    fun can(ctx: Context): Boolean = Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(ctx)

    private fun dp(ctx: Context, v: Float) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, ctx.resources.displayMetrics)
    private fun digits(s: String, arab: Boolean): String = if (!arab) s else s.map { if (it in '0'..'9') ('٠' + (it - '0')) else it }.joinToString("")
    private fun times(n: Int): String = when { n == 1 -> "مرة واحدة"; n == 2 -> "مرتين"; n in 3..10 -> "$n مرات"; else -> "$n مرة" }

    fun show(ctx0: Context, item: DhikrPop.Item, secs: Int) { main.post { try { build(ctx0.applicationContext, item, secs) } catch (e: Exception) { Log.w(TAG, "show", e) } } }

    fun hide() {
        main.post {
            main.removeCallbacks(auto)
            val v = view ?: return@post; val c = card
            view = null; card = null
            val done = Runnable { try { wm?.removeView(v) } catch (_: Exception) { } }
            if (c != null) c.animate().alpha(0f).translationY(-dp(v.context, 26f)).setDuration(220).withEndAction(done).start() else done.run()
        }
    }

    @SuppressLint("ClickableViewAccessibility", "SetTextI18n")
    private fun build(ctx: Context, item: DhikrPop.Item, secs: Int) {
        if (!can(ctx)) return
        view?.let { try { wm?.removeView(it) } catch (_: Exception) { } }
        view = null
        val w = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager; wm = w
        val arab = DhikrPop.config(ctx)?.optString("digits") == "arab"
        if (typeQ == null) typeQ = try { Typeface.createFromAsset(ctx.assets, "fonts/amiri_regular.ttf") } catch (_: Exception) { Typeface.SERIF }
        if (typeUi == null) typeUi = try { Typeface.createFromAsset(ctx.assets, "fonts/plex_arabic_500.ttf") } catch (_: Exception) { Typeface.DEFAULT }
        val gold = 0xFFE9D4A0.toInt(); val soft = 0xFFBFD8CE.toInt()

        val root = FrameLayout(ctx)
        root.layoutDirection = View.LAYOUT_DIRECTION_RTL
        val box = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            layoutDirection = View.LAYOUT_DIRECTION_RTL
            val pad = dp(ctx, 16f).toInt(); setPadding(pad, dp(ctx, 12f).toInt(), pad, dp(ctx, 14f).toInt())
            background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(0xF4154A3D.toInt(), 0xF70B211C.toInt())).apply {
                cornerRadius = dp(ctx, 26f); setStroke(dp(ctx, 1f).toInt(), 0x66D4AF63)
            }
            elevation = dp(ctx, 14f)
        }
        // الترويسة: أيقونة وسن · العنوان · إغلاق
        val head = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; layoutDirection = View.LAYOUT_DIRECTION_RTL }
        val ic = ImageView(ctx).apply {
            try { ctx.assets.open("www/img/icon.png").use { s -> setImageBitmap(BitmapFactory.decodeStream(s)) } } catch (_: Exception) { }
            clipToOutline = true
            background = GradientDrawable().apply { cornerRadius = dp(ctx, 8f); setColor(0xFF0B5D4B.toInt()) }
        }
        head.addView(ic, LinearLayout.LayoutParams(dp(ctx, 24f).toInt(), dp(ctx, 24f).toInt()))
        val ttl = TextView(ctx).apply { text = "وسن · ذكرٌ لطيف"; setTextColor(gold); textSize = 12.5f; typeface = typeUi; setPadding(dp(ctx, 8f).toInt(), 0, dp(ctx, 8f).toInt(), 0) }
        head.addView(ttl, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        val x = TextView(ctx).apply { text = "✕"; setTextColor(0xFFB8CFC6.toInt()); textSize = 15f; gravity = Gravity.CENTER; setPadding(dp(ctx, 10f).toInt(), dp(ctx, 4f).toInt(), dp(ctx, 10f).toInt(), dp(ctx, 4f).toInt()) }
        x.setOnClickListener { hide() }
        head.addView(x)
        box.addView(head)
        // نص الذكر
        val tx = TextView(ctx).apply {
            text = item.t; setTextColor(0xFFFFFFFF.toInt()); textSize = if (item.t.length > 60) 19f else if (item.t.length > 32) 22f else 26f
            typeface = typeQ; gravity = Gravity.CENTER; setLineSpacing(0f, 1.18f); textDirection = View.TEXT_DIRECTION_RTL
            setPadding(dp(ctx, 4f).toInt(), dp(ctx, 8f).toInt(), dp(ctx, 4f).toInt(), dp(ctx, 2f).toInt())
        }
        tx.setOnClickListener { try { DhikrPop.openTasbih(ctx, item, 7531).send() } catch (_: Exception) { }; hide() }
        box.addView(tx)
        val sub = TextView(ctx).apply {
            text = digits("قلها " + times(item.n), arab) + (if (item.f.isNotBlank()) " · " + item.f else "")
            setTextColor(soft); textSize = 12.5f; typeface = typeUi; gravity = Gravity.CENTER; maxLines = 3; setLineSpacing(0f, 1.15f)
            setPadding(0, dp(ctx, 2f).toInt(), 0, dp(ctx, 10f).toInt())
        }
        box.addView(sub)
        // زر العدّ الذهبي
        val row = LinearLayout(ctx).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER; layoutDirection = View.LAYOUT_DIRECTION_RTL }
        var left = item.n
        val cnt = TextView(ctx).apply {
            text = digits(left.toString(), arab); setTextColor(0xFF2A1E05.toInt()); textSize = if (left > 99) 15f else 19f; typeface = Typeface.create(typeUi, Typeface.BOLD); gravity = Gravity.CENTER
            background = GradientDrawable(GradientDrawable.Orientation.TL_BR, intArrayOf(0xFFF7E3A6.toInt(), 0xFFC9953F.toInt())).apply { shape = GradientDrawable.OVAL }
            elevation = dp(ctx, 4f)
        }
        row.addView(cnt, LinearLayout.LayoutParams(dp(ctx, 54f).toInt(), dp(ctx, 54f).toInt()))
        val hint = TextView(ctx).apply { text = "المس للعدّ"; setTextColor(soft); textSize = 12f; typeface = typeUi; setPadding(dp(ctx, 12f).toInt(), 0, dp(ctx, 12f).toInt(), 0) }
        row.addView(hint)
        box.addView(row)
        val vib = ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        val stay = maxOf(secs, 8) * 1000L
        cnt.setOnClickListener {
            if (left <= 0) return@setOnClickListener
            left--
            try { if (Build.VERSION.SDK_INT >= 26) vib?.vibrate(VibrationEffect.createOneShot(12, 60)) else @Suppress("DEPRECATION") vib?.vibrate(12) } catch (_: Exception) { }
            cnt.animate().scaleX(0.9f).scaleY(0.9f).setDuration(70).withEndAction { cnt.animate().scaleX(1f).scaleY(1f).setDuration(120).start() }.start()
            main.removeCallbacks(auto)
            if (left == 0) {
                cnt.text = "✓"; hint.text = "تقبّل الله منك"; sub.text = "أتممتَ الذكر — زادك الله نورًا"
                DhikrPop.addDone(ctx, item.t, item.n)
                main.postDelayed(auto, 1600)
            } else { cnt.text = digits(left.toString(), arab); main.postDelayed(auto, stay) }
        }
        // سحب للأعلى للإخفاء
        var y0 = 0f
        box.setOnTouchListener { v, e ->
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN -> { y0 = e.rawY; false }
                MotionEvent.ACTION_MOVE -> { val dy = e.rawY - y0; if (dy < 0) v.translationY = dy; false }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> { val dy = e.rawY - y0; if (dy < -dp(ctx, 46f)) hide() else if (abs(dy) > 2) v.animate().translationY(0f).setDuration(160).start(); false }
                else -> false
            }
        }
        val m = dp(ctx, 12f).toInt()
        root.addView(box, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT).apply { setMargins(m, m, m, m) })
        val dm = ctx.resources.displayMetrics
        val width = minOf(dm.widthPixels, dp(ctx, 440f).toInt())
        @Suppress("DEPRECATION")
        val type = if (Build.VERSION.SDK_INT >= 26) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else WindowManager.LayoutParams.TYPE_PHONE
        val lp = WindowManager.LayoutParams(width, WindowManager.LayoutParams.WRAP_CONTENT, type,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT)
        lp.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        lp.y = dp(ctx, 26f).toInt()
        box.alpha = 0f; box.translationY = -dp(ctx, 40f)
        w.addView(root, lp)
        view = root; card = box
        box.animate().alpha(1f).translationY(0f).setDuration(340).setInterpolator(DecelerateInterpolator()).start()
        main.removeCallbacks(auto); main.postDelayed(auto, stay)
    }
}

package com.noor.app.ui.screens

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentResolver
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.hardware.GeomagneticField
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Geocoder
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import android.media.AudioManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import androidx.activity.result.PickVisualMediaRequest
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.noor.app.engine.AdhanScheduler
import com.noor.app.engine.AdhanService
import com.noor.app.engine.CalcMethod
import com.noor.app.engine.DhikrPop
import com.noor.app.engine.WasanAlarm
import com.noor.app.engine.AlarmService
import com.noor.app.engine.PopOverlay
import com.noor.app.engine.WasanVoice
import com.noor.app.engine.HijriCalendar
import com.noor.app.engine.NoorLocation
import com.noor.app.engine.PrayerEngine
import com.noor.app.engine.PrayerWidgets
import com.noor.app.engine.RecitationService
import com.noor.app.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 4.5 · الواجهة الموحّدة (WebView SPA) + الجسر الأصلي NoorBridge
 *  ─ الواجهة كاملة في assets/www (HTML/CSS/JS) وتعمل دون إنترنت.
 *  ─ الجسر يوفّر: الموقع، البوصلة (شمال حقيقي)، تنبيهات الأذان،
 *    المشاركة/النسخ، ألوان أشرطة النظام، إبقاء الشاشة مضاءة…
 *  ─ متوافق مع دوال الإصدار 1.0 (applyPrayers/applyQibla) للاحتياط.
 * ════════════════════════════════════════════════════════════════
 */
class MainActivity : AppCompatActivity(), SensorEventListener {

    companion object {
        /** وجهة داخل الواجهة تُفتح عند التشغيل (من إشعار أو اختصار أو أداة) */
        const val EXTRA_ROUTE = "wasan_route"
        const val EXTRA_ARGS = "wasan_args"
        private val HTTP_ALLOW = listOf("https://api.alquran.cloud/", "https://www.mp3quran.net/api/", "https://mp3quran.net/api/")
    }

    // ── وسن 6 · مؤثرات صوتية أصلية (SoundPool): حبّات المسبحة ونقرات العدّاد — تعمل دائمًا مهما كانت حالة صوت الواجهة ──
    private var sfxPool: SoundPool? = null
    private val sfxIds = java.util.concurrent.ConcurrentHashMap<String, Int>()
    private val sfxReady = java.util.concurrent.ConcurrentHashMap<Int, Boolean>()
    private fun initSfx() {
        try {
            val p = SoundPool.Builder().setMaxStreams(8).setAudioAttributes(
                AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()).build()
            p.setOnLoadCompleteListener { _, id, status -> if (status == 0) sfxReady[id] = true }
            val list = listOf("bead_wood" to R.raw.sfx_bead_wood, "bead_resin" to R.raw.sfx_bead_resin, "bead_pearl" to R.raw.sfx_bead_pearl, "bead_stone" to R.raw.sfx_bead_stone, "bead_onyx" to R.raw.sfx_bead_onyx, "bead_metal" to R.raw.sfx_bead_metal, "clack" to R.raw.sfx_clack, "knock" to R.raw.sfx_knock, "drop" to R.raw.sfx_drop, "tick" to R.raw.sfx_tick, "done" to R.raw.sfx_done)
            for ((n, res) in list) sfxIds[n] = p.load(this, res, 1)
            sfxPool = p
        } catch (e: Exception) { Log.w("NoorSfx", "init", e) }
    }
    private var pendingRoute: String? = null
    private var pageReady = false
    @Volatile private var audioActive = false
    private var chime: MediaPlayer? = null

    private lateinit var web: WebView
    private var coords: NoorLocation.Coords = NoorLocation.Coords.DEFAULT
    private var realLocation = false
    private var geoLabel: String? = null
    @Volatile private var geoCC: String? = null
    @Volatile private var lastLocAt = 0L
    private var method: CalcMethod = CalcMethod.MWL

    // ── البوصلة ──
    private var sensorMgr: SensorManager? = null
    private var rotation: Sensor? = null
    private var accel: Sensor? = null
    private var magnet: Sensor? = null
    private val accelValues = FloatArray(3)
    private val magnetValues = FloatArray(3)
    private var hasAccel = false
    private var hasMagnet = false
    private var compassOn = false      // الواجهة الجديدة: onHeading(azimuth)
    private var qiblaLegacy = false    // واجهة 1.0: applyQibla(relative, dist)
    private var lastSent = 0L
    private var declination = 0f

    private var pendingGeo: Pair<String, GeolocationPermissions.Callback>? = null
    private var awaitingUserLocation = false

    private val locationPerm = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { res ->
        val granted = res.values.any { it }
        pendingGeo?.let { (origin, cb) -> cb.invoke(origin, granted, false) }
        pendingGeo = null
        if (granted) refreshLocation() else if (awaitingUserLocation) { awaitingUserLocation = false; notifyLocation(false) }
    }

    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    /** وسن 5 · صورة الصفحة الرئيسية من معرض الهاتف (منتقي الصور الآمن — دون أي إذن إضافي) */
    private val photoPicker = registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        val slot = pickSlot
        if (uri == null) js("window.onPickedImage&&onPickedImage(null)") else Thread { savePickedImage(uri, slot) }.start()
    }
    /** لكل استعمال خانته: bg للصفحة الرئيسية، ig للوحة الاستغفار — فلا تحذف صورةٌ الأخرى */
    @Volatile private var pickSlot = "bg"
    @Volatile private var volCount = false

    private fun savePickedImage(uri: Uri, slot: String) {
        try {
            val cr = contentResolver
            val bo = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            cr.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bo) }
            if (bo.outWidth <= 0 || bo.outHeight <= 0) { js("window.onPickedImage&&onPickedImage(null)"); return }
            var sample = 1
            while (minOf(bo.outWidth, bo.outHeight) / (sample * 2) >= 1440) sample *= 2
            val opts = BitmapFactory.Options().apply { inSampleSize = sample }
            var bmp: Bitmap = cr.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) } ?: run { js("window.onPickedImage&&onPickedImage(null)"); return }
            try {
                if (Build.VERSION.SDK_INT >= 24) {
                    val o = cr.openInputStream(uri)?.use { ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL) } ?: ExifInterface.ORIENTATION_NORMAL
                    val deg = when (o) { ExifInterface.ORIENTATION_ROTATE_90 -> 90f; ExifInterface.ORIENTATION_ROTATE_180 -> 180f; ExifInterface.ORIENTATION_ROTATE_270 -> 270f; else -> 0f }
                    if (deg != 0f) { val m = Matrix(); m.postRotate(deg); val r = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true); if (r !== bmp) bmp.recycle(); bmp = r }
                }
            } catch (_: Exception) { }
            val sc = minOf(1f, 1440f / minOf(bmp.width, bmp.height), 2560f / maxOf(bmp.width, bmp.height))
            if (sc < 0.999f) { val r = Bitmap.createScaledBitmap(bmp, (bmp.width * sc).toInt().coerceAtLeast(1), (bmp.height * sc).toInt().coerceAtLeast(1), true); if (r !== bmp) bmp.recycle(); bmp = r }
            val w = bmp.width; val h = bmp.height; val band = (h * 0.12f).toInt().coerceAtLeast(1)
            var rs = 0L; var gs = 0L; var bs = 0L; var n = 0L
            var y = 0
            while (y < band) { var x = 0; while (x < w) { val c = bmp.getPixel(x, y); rs += (c shr 16) and 255; gs += (c shr 8) and 255; bs += c and 255; n++; x += 12 }; y += 6 }
            if (n == 0L) n = 1
            val ra = (rs / n).toInt(); val ga = (gs / n).toInt(); val ba = (bs / n).toInt()
            val lum = (0.2126 * ra + 0.7152 * ga + 0.0722 * ba) / 255.0
            val dir = File(filesDir, "userbg").apply { mkdirs() }
            dir.listFiles()?.filter { it.name.startsWith(slot + "_") }?.forEach { it.delete() }
            val f = File(dir, slot + "_" + System.currentTimeMillis() + ".jpg")
            f.outputStream().use { bmp.compress(Bitmap.CompressFormat.JPEG, 88, it) }
            val ratio = w.toDouble() / h
            bmp.recycle()
            val top = String.format(java.util.Locale.US, "#%02X%02X%02X", ra, ga, ba)
            js("window.onPickedImage&&onPickedImage({url:'file://" + f.absolutePath + "',top:'" + top + "',lum:" + String.format(java.util.Locale.US, "%.3f", lum) + ",ratio:" + String.format(java.util.Locale.US, "%.4f", ratio) + "})")
        } catch (e: Throwable) {
            Log.e("NoorWeb", "pick image failed", e)
            js("window.onPickedImage&&onPickedImage(null)")
        }
    }

    /** اختيار نغمة الأذان من نغمات الهاتف */
    private val ringtonePicker = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { res ->
        val uri: Uri? = try {
            @Suppress("DEPRECATION")
            res.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
        } catch (_: Exception) { null }
        if (res.resultCode == RESULT_OK && uri != null) {
            AdhanScheduler.setSound(this, "custom", uri.toString())
            AdhanScheduler.scheduleNext(this)
        }
        js("try{window.onAdhanSound&&onAdhanSound(${soundJson()})}catch(e){}")
    }

    // ── وسن 4.2 · النسخ الاحتياطي: حفظ ملف JSON واستعادته عبر منتقي الملفات في النظام ──
    private var pendingBackup: String? = null

    private val backupSaver = registerForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri: Uri? ->
        val text = pendingBackup
        pendingBackup = null
        if (uri == null || text == null) {
            js("try{window.onBackupSaved&&onBackupSaved(false,true)}catch(e){}")
            return@registerForActivityResult
        }
        Thread {
            val ok = try {
                val os = (try { contentResolver.openOutputStream(uri, "wt") } catch (_: Exception) { null }) ?: contentResolver.openOutputStream(uri)
                if (os == null) false else { os.use { it.write(text.toByteArray(Charsets.UTF_8)) }; true }
            } catch (_: Exception) { false }
            js("try{window.onBackupSaved&&onBackupSaved($ok,false)}catch(e){}")
        }.start()
    }

    private val backupPicker = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        if (uri == null) {
            js("try{window.onBackupPicked&&onBackupPicked(null)}catch(e){}")
            return@registerForActivityResult
        }
        Thread {
            val text = try {
                contentResolver.openInputStream(uri)?.use { s -> s.readBytes().takeIf { it.size <= 8 * 1024 * 1024 }?.toString(Charsets.UTF_8) }
            } catch (_: Exception) { null }
            val q = if (text == null) "null" else JSONObject.quote(text)
            js("try{window.onBackupPicked&&onBackupPicked($q)}catch(e){}")
        }.start()
    }

    private fun soundJson(): String = JSONObject().apply {
        put("mode", AdhanScheduler.soundMode(this@MainActivity)); put("title", AdhanScheduler.soundTitle(this@MainActivity))
        put("voice", AdhanScheduler.voice(this@MainActivity))
    }.toString()

    private fun captureRoute(i: Intent?) {
        val r = i?.getStringExtra(EXTRA_ROUTE) ?: return
        val a = i.getStringExtra(EXTRA_ARGS) ?: "{}"
        pendingRoute = JSONObject().put("r", r).put("a", try { JSONObject(a) } catch (_: Exception) { JSONObject() }).toString()
        i.removeExtra(EXTRA_ROUTE)
    }

    private fun deliverRoute() {
        val r = pendingRoute ?: return
        if (!pageReady) return
        pendingRoute = null
        js("try{window.openRoute&&openRoute($r)}catch(e){}")
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        captureRoute(intent)
        deliverRoute()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        method = CalcMethod.fromKey(prefs().getString("method", null))
        restoreCoords()
        captureRoute(intent)
        RecitationService.listener = { cmd -> js("try{window.Player&&Player.cmd('" + cmd.replace("'", "") + "')}catch(e){}") }
        // وسن 4.4: حالة «الأذان يُرفع الآن» ← شريط الإيقاف في الواجهة
        AdhanService.listener = { on, name ->
            val j = JSONObject().put("playing", on).put("name", name ?: "")
            js("try{window.onAdhanState&&onAdhanState($j)}catch(e){}")
        }
        styleSystemBars(0xFF0B5D4B.toInt(), false, 0xFF07110E.toInt(), false)

        web = WebView(this).also {
            val s = it.settings
            s.javaScriptEnabled = true
            s.domStorageEnabled = true
            s.allowFileAccess = true
            s.allowContentAccess = true
            s.setGeolocationEnabled(true)
            s.mediaPlaybackRequiresUserGesture = false
            s.textZoom = 100
            s.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            it.isVerticalScrollBarEnabled = false
            it.isHorizontalScrollBarEnabled = false
            it.overScrollMode = View.OVER_SCROLL_NEVER
            it.setBackgroundColor(0xFF0A4A3C.toInt())
            it.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, url: String) {
                    pageReady = true
                    deliverRoute()
                }
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val u = request.url
                    if (u.scheme == "http" || u.scheme == "https" || u.scheme == "mailto" || u.scheme == "geo") {
                        openExternal(u); return true
                    }
                    return false
                }
            }
            it.webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(cm: ConsoleMessage): Boolean {
                    Log.println(
                        when (cm.messageLevel()) {
                            ConsoleMessage.MessageLevel.ERROR -> Log.ERROR
                            ConsoleMessage.MessageLevel.WARNING -> Log.WARN
                            else -> Log.DEBUG
                        }, "NoorWeb", "[${cm.lineNumber()}] ${cm.message()}"
                    )
                    return true
                }

                override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                    if (NoorLocation.hasPermission(this@MainActivity)) callback.invoke(origin, true, false)
                    else { pendingGeo = origin to callback; askLocationPermission() }
                }
            }
            it.addJavascriptInterface(NoorBridge(), "NoorBridge")
        }
        setContentView(web)
        web.loadUrl("file:///android_asset/www/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        sensorMgr = getSystemService(SENSOR_SERVICE) as? SensorManager
        rotation = sensorMgr?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        accel = sensorMgr?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        magnet = sensorMgr?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

        volumeControlStream = AudioManager.STREAM_MUSIC   // أزرار الصوت تضبط صوت التطبيق
        initSfx()
        // لا نطلب الإذن عند الإقلاع — تطلبه الواجهة بعد شرح السبب (جولة الترحيب)
        if (NoorLocation.hasPermission(this)) refreshLocation()
        AdhanScheduler.ensureChannels(this)
        AdhanScheduler.scheduleNext(this)
    }

    override fun onKeyDown(keyCode: Int, event: android.view.KeyEvent?): Boolean {
        if (volCount && (keyCode == android.view.KeyEvent.KEYCODE_VOLUME_UP || keyCode == android.view.KeyEvent.KEYCODE_VOLUME_DOWN)) {
            if (event == null || event.repeatCount == 0) js("try{window.onVolKey&&onVolKey()}catch(e){}")
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
    override fun onKeyUp(keyCode: Int, event: android.view.KeyEvent?): Boolean {
        if (volCount && (keyCode == android.view.KeyEvent.KEYCODE_VOLUME_UP || keyCode == android.view.KeyEvent.KEYCODE_VOLUME_DOWN)) return true
        return super.onKeyUp(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        web.onResume()
        if (compassOn || qiblaLegacy) registerSensors()
        // وسن 5.1: تحديث صامت للموقع عند العودة للتطبيق (كل ٣٠ دقيقة على الأكثر) — للمسافرين حول العالم
        if (lastLocAt > 0 && SystemClock.elapsedRealtime() - lastLocAt > 30 * 60_000L && NoorLocation.hasPermission(this)) refreshLocation()
    }

    override fun onPause() {
        volCount = false
        unregisterSensors()
        releasePreview(false)
        // أثناء التلاوة لا نوقف الواجهة كي يستمر الصوت عند إطفاء الشاشة (خدمة التلاوة تُبقي التطبيق حيًّا)
        if (!audioActive) web.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        try { sfxPool?.release() } catch (_: Exception) { }; sfxPool = null
        RecitationService.listener = null
        AdhanService.listener = null
        if (audioActive) RecitationService.stop(this)
        releasePreview(false)
        try { web.removeJavascriptInterface("NoorBridge"); web.destroy() } catch (_: Exception) { }
        super.onDestroy()
    }

    // ────────────────── أشرطة النظام ──────────────────

    private fun styleSystemBars(status: Int, lightStatus: Boolean, nav: Int, lightNav: Boolean) {
        try {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            window.statusBarColor = status
            window.navigationBarColor = nav
            val ctl = WindowInsetsControllerCompat(window, window.decorView)
            ctl.isAppearanceLightStatusBars = lightStatus
            ctl.isAppearanceLightNavigationBars = lightNav
        } catch (e: Exception) {
            Log.w("Noor", "system bars", e)
        }
    }

    /** إيقاف معاينة الصوت؛ notify = إبلاغ الواجهة بانتهائها */
    private fun releasePreview(notify: Boolean) {
        val p = chime; chime = null
        try { p?.stop() } catch (_: Exception) { }
        try { p?.release() } catch (_: Exception) { }
        if (notify) js("try{window.onPreviewEnd&&onPreviewEnd()}catch(e){}")
    }

    private fun parseColor(c: String?, def: Int): Int = try { Color.parseColor(c) } catch (_: Exception) { def }

    // ────────────────── الموقع ──────────────────

    private fun prefs() = getSharedPreferences("noor_native", MODE_PRIVATE)

    private fun restoreCoords() {
        val p = prefs()
        if (p.contains("lat") && p.contains("lng")) {
            coords = NoorLocation.Coords(
                java.lang.Double.longBitsToDouble(p.getLong("lat", 0)),
                java.lang.Double.longBitsToDouble(p.getLong("lng", 0))
            )
            geoLabel = p.getString("label", null)
            geoCC = p.getString("cc", null)
            realLocation = true
        }
    }

    private fun askLocationPermission() {
        runOnUiThread {
            try {
                locationPerm.launch(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION))
            } catch (e: Exception) { Log.w("Noor", "perm", e); notifyLocation(false) }
        }
    }

    private fun refreshLocation() {
        lastLocAt = SystemClock.elapsedRealtime()
        CoroutineScope(Dispatchers.IO).launch {
            val c = try { NoorLocation.getLastKnownLocation(this@MainActivity) } catch (e: Exception) { null }
            if (c != null) {
                coords = c
                realLocation = true
                geoCC = null   // لا نُبقي دولة قديمة إن تعذّر التعرّف بعد السفر
                geoLabel = reverseGeocode(c.lat, c.lng)
                prefs().edit()
                    .putLong("lat", java.lang.Double.doubleToRawLongBits(c.lat))
                    .putLong("lng", java.lang.Double.doubleToRawLongBits(c.lng))
                    .putString("label", geoLabel)
                    .putString("cc", geoCC)
                    .apply()
                updateDeclination()
            }
            awaitingUserLocation = false
            notifyLocation(c != null)
            sendPrayers()
        }
    }

    @Suppress("DEPRECATION")
    private fun reverseGeocode(lat: Double, lng: Double): String? = try {
        if (!Geocoder.isPresent()) null
        else Geocoder(this, Locale("ar")).getFromLocation(lat, lng, 1)?.firstOrNull()?.let {
            // وسن 5.1: رمز الدولة لاختيار طريقة الحساب تلقائيًا في أي بلد
            geoCC = it.countryCode?.uppercase(Locale.US)?.takeIf { c -> Regex("^[A-Z]{2}$").matches(c) }
            it.locality ?: it.subAdminArea ?: it.adminArea
        }
    } catch (_: Exception) { null }

    private fun locationJson(ok: Boolean = true): String = JSONObject().apply {
        put("ok", ok)
        put("lat", coords.lat)
        put("lng", coords.lng)
        put("isDefault", !realLocation)
        if (geoLabel != null) put("label", geoLabel)
        geoCC?.let { put("cc", it) }
    }.toString()

    private fun notifyLocation(ok: Boolean) {
        val j = locationJson(ok)
        js("try{window.onNativeLocation&&onNativeLocation($j)}catch(e){}")
    }

    private fun js(code: String) {
        runOnUiThread { try { web.evaluateJavascript(code, null) } catch (_: Exception) { } }
    }

    /** للتوافق مع واجهة 1.0 */
    private fun sendPrayers() {
        val cal = Calendar.getInstance()
        val tz = TimeZone.getDefault().getOffset(cal.timeInMillis) / 3600000.0
        val pt = PrayerEngine.compute(
            cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH),
            coords.lat, coords.lng, tz, method
        )
        val arr = JSONArray()
        PrayerEngine.OBLIGATORY.forEach { key -> arr.put(PrayerEngine.formatHour(pt.list().first { p -> p.first == key }.second)) }
        val json = JSONObject().apply {
            put("list", arr); put("methodName", method.arName)
            put("city", if (realLocation) (geoLabel ?: "موقعك الحالي") else "المدينة المنورة")
            put("tzHours", tz); put("lat", coords.lat); put("lng", coords.lng)
        }
        js("try{window.applyPrayers&&applyPrayers($json)}catch(e){}")
    }

    // ────────────────── البوصلة ──────────────────

    private fun updateDeclination() {
        declination = try {
            GeomagneticField(coords.lat.toFloat(), coords.lng.toFloat(), 0f, System.currentTimeMillis()).declination
        } catch (_: Exception) { 0f }
    }

    private fun registerSensors() {
        val sm = sensorMgr ?: return
        updateDeclination()
        if (rotation != null) sm.registerListener(this, rotation, SensorManager.SENSOR_DELAY_GAME)
        else {
            if (accel != null) sm.registerListener(this, accel, SensorManager.SENSOR_DELAY_GAME)
            if (magnet != null) sm.registerListener(this, magnet, SensorManager.SENSOR_DELAY_GAME)
        }
    }

    private fun unregisterSensors() { try { sensorMgr?.unregisterListener(this) } catch (_: Exception) { } }

    override fun onSensorChanged(e: SensorEvent) {
        val r = FloatArray(9)
        when (e.sensor.type) {
            Sensor.TYPE_ROTATION_VECTOR -> {
                try { SensorManager.getRotationMatrixFromVector(r, e.values) } catch (_: Exception) { return }
            }
            Sensor.TYPE_ACCELEROMETER -> {
                System.arraycopy(e.values, 0, accelValues, 0, 3); hasAccel = true
                if (!hasMagnet || !SensorManager.getRotationMatrix(r, null, accelValues, magnetValues)) return
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                System.arraycopy(e.values, 0, magnetValues, 0, 3); hasMagnet = true; return
            }
            else -> return
        }
        val now = SystemClock.uptimeMillis()
        if (now - lastSent < 45) return
        lastSent = now
        val o = FloatArray(3)
        SensorManager.getOrientation(r, o)
        val magnetic = (Math.toDegrees(o[0].toDouble()) + 360.0) % 360.0
        val trueHeading = (magnetic + declination + 360.0) % 360.0
        if (compassOn) js("try{window.onHeading&&onHeading($trueHeading)}catch(e){}")
        if (qiblaLegacy) {
            val q = PrayerEngine.qiblaBearing(coords.lat, coords.lng)
            val rel = ((q - trueHeading) % 360 + 360) % 360
            val dist = PrayerEngine.distanceToKaaba(coords.lat, coords.lng)
            js("try{window.applyQibla&&applyQibla($rel,$dist)}catch(e){}")
        }
    }

    override fun onAccuracyChanged(s: Sensor?, a: Int) {}

    private fun openExternal(u: Uri) {
        try { startActivity(Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } catch (_: Exception) { }
    }

    // ────────────────── الجسر ↔ JavaScript ──────────────────

    // ────────────────── تنزيلات التلاوة (وسن 4.5) ──────────────────
    private val dlPrefs by lazy { getSharedPreferences("wasan_dl", MODE_PRIVATE) }
    private val REL_OK = Regex("^m[a-z0-9]{1,16}/\\d{3}\\.mp3$")
    private fun recitBase(): File? = getExternalFilesDir("recit")
    private fun recitFile(rel: String): File? = if (REL_OK.matches(rel)) recitBase()?.let { File(it, rel) } else null
    private fun dlForget(k: String) { dlPrefs.edit().remove(k).remove("$k.rel").apply() }
    private fun dlFail(k: String) { dlForget(k); js("try{window.onDlDone&&onDlDone(${JSONObject.quote(k)},false)}catch(e){}") }

    inner class NoorBridge {

        private fun readAsset(path: String): String = try {
            assets.open(path).use { it.readBytes().toString(Charsets.UTF_8) }
        } catch (e: Exception) { Log.e("NoorWeb", "asset read failed: $path", e); "" }

        /** وسن 5 · اختيار صورة من الهاتف للصفحة الرئيسية */
        @JavascriptInterface fun pickImage() { pickImageFor("bg") }
        @JavascriptInterface fun pickImageFor(slot: String) {
            pickSlot = if (Regex("^[a-z]{1,8}$").matches(slot)) slot else "bg"
            runOnUiThread {
                try { photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }
                catch (e: Exception) { js("window.onPickedImage&&onPickedImage(null)") }
            }
        }
        @JavascriptInterface fun clearPickedImage() { clearPickedImageFor("bg") }
        @JavascriptInterface fun clearPickedImageFor(slot: String) { try { File(filesDir, "userbg").listFiles()?.filter { it.name.startsWith(slot + "_") }?.forEach { it.delete() } } catch (_: Exception) { } }
        /** صورة من مجلد صور التطبيق كرابط data: لرسمها على لوحة مشاركة (مجلد img فقط) */
        @JavascriptInterface fun assetB64(path: String): String = try {
            val p = path.trimStart('/')
            if (!p.startsWith("img/") || p.contains("..")) "" else {
                val bytes = assets.open("www/$p").use { it.readBytes() }
                val mime = if (p.endsWith(".webp")) "image/webp" else if (p.endsWith(".png")) "image/png" else "image/jpeg"
                "data:$mime;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
            }
        } catch (e: Exception) { "" }
        /** صورتك المختارة كرابط data: (من مجلد صور المستخدمة فقط) */
        @JavascriptInterface fun fileB64(url: String): String = try {
            val f = File(url.removePrefix("file://")); val dir = File(filesDir, "userbg")
            if (f.exists() && f.canonicalPath.startsWith(dir.canonicalPath)) "data:image/jpeg;base64," + Base64.encodeToString(f.readBytes(), Base64.NO_WRAP) else ""
        } catch (e: Exception) { "" }

        @JavascriptInterface fun getSurahs(): String = readAsset("db/Surah.json")
        @JavascriptInterface fun getAyahs(): String = readAsset("db/Ayah.json")
        @JavascriptInterface fun getJuz(): String = readAsset("db/Juz.json")
        @JavascriptInterface fun appVersion(): String = try {
            @Suppress("DEPRECATION")
            packageManager.getPackageInfo(packageName, 0).versionName ?: "3.0"
        } catch (_: Exception) { "3.0" }

        /** وجهة التشغيل (إشعار/اختصار/أداة) — تُقرأ مرة واحدة عند الإقلاع */
        @JavascriptInterface fun takeLaunchRoute(): String { pageReady = true; val r = pendingRoute ?: ""; pendingRoute = null; return r }

        // ── الموقع ──
        @JavascriptInterface fun getLocation(): String = locationJson(realLocation)

        @JavascriptInterface fun requestLocation() {
            awaitingUserLocation = true
            if (NoorLocation.hasPermission(this@MainActivity)) refreshLocation() else askLocationPermission()
        }

        @JavascriptInterface fun detectLocation() = requestLocation()
        /** وسن 6: العدّ بأزرار الصوت في المسبحة (يُفعَّل من الواجهة ويُلغى عند مغادرتها) */
        @JavascriptInterface fun setVolumeCount(on: Boolean) { volCount = on }
        /** وسن 6: تشغيل مؤثّر قصير (يعيد false إن لم يجهز بعد فتستعمل الواجهة بديلها) */
        @JavascriptInterface fun sfx(name: String, vol: Double, rate: Double): Boolean {
            val p = sfxPool ?: return false; val id = sfxIds[name] ?: return false
            if (sfxReady[id] != true) return false
            val v = vol.toFloat().coerceIn(0f, 1f)
            return try { p.play(id, v, v, 1, 0, rate.toFloat().coerceIn(0.5f, 2f)) != 0 } catch (_: Exception) { false }
        }
        /** مستوى صوت الوسائط الحالي (٠–١) لتنبيه المستخدمة إن كان مكتومًا */
        @JavascriptInterface fun mediaVolume(): Double = try { val am = getSystemService(AUDIO_SERVICE) as AudioManager
            am.getStreamVolume(AudioManager.STREAM_MUSIC).toDouble() / am.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1) } catch (_: Exception) { -1.0 }
        @JavascriptInterface fun requestPrayers() = sendPrayers()
        @JavascriptInterface fun requestHijri() {
            val h = HijriCalendar.fromCalendar(Calendar.getInstance())
            val j = JSONObject().apply { put("date", "${h.day} ${h.monthNameFull} ${h.year} هـ") }
            js("try{window.applyHijri&&applyHijri($j)}catch(e){}")
        }

        // ── البوصلة ──
        @JavascriptInterface fun startCompass() { compassOn = true; runOnUiThread { registerSensors() } }
        @JavascriptInterface fun stopCompass() { compassOn = false; if (!qiblaLegacy) runOnUiThread { unregisterSensors() } }

        @JavascriptInterface fun setQiblaActive(active: Boolean) {
            qiblaLegacy = active
            if (active) {
                val q = PrayerEngine.qiblaBearing(coords.lat, coords.lng)
                val dist = PrayerEngine.distanceToKaaba(coords.lat, coords.lng)
                js("try{window.applyQibla&&applyQibla($q,$dist)}catch(e){}")
                runOnUiThread { registerSensors() }
            } else if (!compassOn) runOnUiThread { unregisterSensors() }
        }

        @JavascriptInterface fun updateQibla() = setQiblaActive(true)

        // ── تنبيهات الأذان ──
        @JavascriptInterface fun scheduleAdhan(json: String) {
            AdhanScheduler.save(this@MainActivity, json)
        }

        /** وسن 4.3: إعدادات الحساب كي تمدّد النواة الجدول وحدها */
        @JavascriptInterface fun setAdhanConfig(json: String) {
            AdhanScheduler.saveConfig(this@MainActivity, json)
        }

        @JavascriptInterface fun batteryExempt(): Boolean = try {
            Build.VERSION.SDK_INT < 23 || (getSystemService(POWER_SERVICE) as PowerManager).isIgnoringBatteryOptimizations(packageName)
        } catch (_: Exception) { true }

        @SuppressLint("BatteryLife")
        @JavascriptInterface fun requestBatteryExemption() {
            if (Build.VERSION.SDK_INT < 23) return
            runOnUiThread {
                try { startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName"))) }
                catch (_: Exception) { try { startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)) } catch (_: Exception) { } }
            }
        }

        /** أذان تجريبي بعد خمس ثوانٍ عبر المسار الحقيقي */
        @JavascriptInterface fun testAdhan() {
            AdhanScheduler.ensureChannels(this@MainActivity)
            AdhanScheduler.test(this@MainActivity)
        }

        // ── وسن 4.4 · الأذان كاملًا ──
        @JavascriptInterface fun adhanPlaying(): Boolean = AdhanService.playing
        @JavascriptInterface fun stopAdhan() = AdhanService.stop(this@MainActivity)
        @JavascriptInterface fun setAdhanVoice(v: String) {
            AdhanScheduler.setVoice(this@MainActivity, v)
            AdhanScheduler.scheduleNext(this@MainActivity)
        }

        @JavascriptInterface fun ensureNotifPermission() {
            AdhanScheduler.ensureChannels(this@MainActivity)
            if (Build.VERSION.SDK_INT >= 33 &&
                ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) runOnUiThread { try { notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS) } catch (_: Exception) { } }
        }

        @JavascriptInterface fun canExactAlarm(): Boolean = AdhanScheduler.canExact(this@MainActivity)

        @JavascriptInterface fun requestExactAlarm() {
            if (Build.VERSION.SDK_INT >= 31 && !AdhanScheduler.canExact(this@MainActivity)) runOnUiThread {
                try {
                    startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName")))
                } catch (_: Exception) { }
            }
        }

        @JavascriptInterface fun notifEnabled(): Boolean = AdhanScheduler.notificationsEnabled(this@MainActivity)

        // ── وسن 4.7 · الأذكار المنبثقة ──
        // ── وسن 4.8 · المنبّه ──
        @JavascriptInterface fun setAlarms(json: String) = WasanAlarm.save(this@MainActivity, json)
        @JavascriptInterface fun alarmState(): String = WasanAlarm.state(this@MainActivity)
        @JavascriptInterface fun testAlarm(json: String) { WasanAlarm.ensureChannel(this@MainActivity); try { WasanAlarm.ring(this@MainActivity, org.json.JSONObject(json).put("id", "test")) } catch (_: Exception) { } }
        @JavascriptInterface fun stopAlarm() { try { startService(Intent(this@MainActivity, AlarmService::class.java).setAction(WasanAlarm.ACTION_STOP)) } catch (_: Exception) { } }
        @JavascriptInterface fun canFullScreen(): Boolean = WasanAlarm.canFullScreen(this@MainActivity)
        @JavascriptInterface fun requestFullScreen() {
            if (Build.VERSION.SDK_INT < 34) return
            runOnUiThread { try { startActivity(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:$packageName"))) } catch (_: Exception) { } }
        }
        @JavascriptInterface fun setDhikrPop(json: String) = DhikrPop.save(this@MainActivity, json)
        @JavascriptInterface fun testDhikrPop() { DhikrPop.ensureChannels(this@MainActivity); DhikrPop.test(this@MainActivity) }
        @JavascriptInterface fun dhikrNext(): Double = DhikrPop.nextInfo(this@MainActivity).toDouble()
        @JavascriptInterface fun dhikrMuted(): Double = DhikrPop.mutedUntil(this@MainActivity).toDouble()
        @JavascriptInterface fun unmuteDhikr() = DhikrPop.unmute(this@MainActivity)
        @JavascriptInterface fun takeDhikrDone(): String = DhikrPop.takeDone(this@MainActivity)
        @JavascriptInterface fun canOverlay(): Boolean = PopOverlay.can(this@MainActivity)
        @JavascriptInterface fun requestOverlay() {
            if (Build.VERSION.SDK_INT < 23) return
            runOnUiThread {
                try { startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))) }
                catch (_: Exception) { try { startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName"))) } catch (_: Exception) { } }
            }
        }

        // ── وسن 4.7 · التذكير الصوتي (محرّك النطق العربي في الهاتف) ──
        @JavascriptInterface fun ttsSpeak(text: String) {
            WasanVoice.speak(applicationContext, text, 0.85f) { js("try{window.onTtsDone&&onTtsDone()}catch(e){}") }
            WasanVoice.check(applicationContext) { st -> js("try{window.onTtsState&&onTtsState(" + JSONObject.quote(st) + ")}catch(e){}") }
        }
        @JavascriptInterface fun ttsCheck() { WasanVoice.check(applicationContext) { st -> js("try{window.onTtsState&&onTtsState(" + JSONObject.quote(st) + ")}catch(e){}") } }
        @JavascriptInterface fun ttsStop() = WasanVoice.stop()
        @JavascriptInterface fun openTtsSettings() {
            runOnUiThread {
                try { startActivity(Intent("com.android.settings.TTS_SETTINGS").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                catch (_: Exception) { try { startActivity(Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)) } catch (_: Exception) { } }
            }
        }
        @JavascriptInterface fun setRemindVoice(on: Boolean) = AdhanScheduler.setVoiceRemind(this@MainActivity, on)
        @JavascriptInterface fun remindVoice(): Boolean = AdhanScheduler.voiceRemind(this@MainActivity)

        /** «صلّيت» المسجّلة من إشعارات الأذان منذ آخر فتح */
        @JavascriptInterface fun takePrayed(): String = AdhanScheduler.takePrayed(this@MainActivity)

        // ── صوت الأذان ──
        @JavascriptInterface fun soundInfo(): String = soundJson()

        @JavascriptInterface fun setAdhanSound(mode: String) {
            AdhanScheduler.setSound(this@MainActivity, mode, null)
            AdhanScheduler.scheduleNext(this@MainActivity)
        }

        @JavascriptInterface fun pickAdhanSound() {
            runOnUiThread {
                try {
                    val i = Intent(RingtoneManager.ACTION_RINGTONE_PICKER)
                        .putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_NOTIFICATION or RingtoneManager.TYPE_ALARM or RingtoneManager.TYPE_RINGTONE)
                        .putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "صوت الأذان")
                        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
                        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
                    AdhanScheduler.soundUri(this@MainActivity)?.let { i.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(it)) }
                    ringtonePicker.launch(i)
                } catch (e: Exception) { Log.w("Wasan", "picker", e) }
            }
        }

        /** معاينة الصوت كما سيُسمع فعلًا: الأذان على مجرى المنبّه، والنغمات على مجرى الإشعارات */
        @JavascriptInterface fun previewSound(mode: String) {
            runOnUiThread {
                try {
                    releasePreview(false)
                    val ctx = this@MainActivity
                    val v = AdhanScheduler.voice(ctx)
                    val uri = when (mode) {
                        "adhan" -> AdhanScheduler.rawUri(ctx, AdhanScheduler.adhanRes(v))
                        "takbir" -> AdhanScheduler.rawUri(ctx, AdhanScheduler.takbirRes(v))
                        "chime" -> AdhanScheduler.chimeUri(ctx)
                        "custom" -> AdhanScheduler.soundUri(ctx)?.let { Uri.parse(it) }
                        "system" -> RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                        else -> null
                    } ?: return@runOnUiThread
                    val usage = if (mode == "adhan") AudioAttributes.USAGE_ALARM else AudioAttributes.USAGE_NOTIFICATION
                    val p = MediaPlayer()
                    p.setAudioAttributes(AudioAttributes.Builder().setUsage(usage).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                    p.setDataSource(ctx, uri)
                    p.setOnCompletionListener { if (chime === it) releasePreview(true) else it.release() }
                    p.setOnErrorListener { mp, _, _ -> if (chime === mp) releasePreview(true); true }
                    p.setOnPreparedListener { it.start() }
                    chime = p
                    p.prepareAsync()
                } catch (e: Exception) { Log.w("Wasan", "preview", e); releasePreview(true) }
            }
        }

        @JavascriptInterface fun stopPreview() { runOnUiThread { releasePreview(false) } }

        @JavascriptInterface fun openChannelSettings(kind: String) {
            runOnUiThread {
                try {
                    val i = if (Build.VERSION.SDK_INT >= 26) {
                        AdhanScheduler.ensureChannels(this@MainActivity)
                        val ch = if (kind == "daily") "wasan_daily" else AdhanScheduler.adhanChannelId(this@MainActivity)
                        Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName).putExtra(Settings.EXTRA_CHANNEL_ID, ch)
                    } else Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName"))
                    startActivity(i)
                } catch (_: Exception) { }
            }
        }

        // ── أدوات الشاشة الرئيسية ──
        @JavascriptInterface fun setWidgetData(json: String) = PrayerWidgets.save(this@MainActivity, json)
        @JavascriptInterface fun canPinWidget(): Boolean = PrayerWidgets.canPin(this@MainActivity)
        @JavascriptInterface fun pinWidget(kind: String): Boolean = PrayerWidgets.requestPin(this@MainActivity, kind)

        // ── التلاوة (حالة المشغّل في الواجهة) ──
        @JavascriptInterface fun audioState(json: String) {
            try {
                val o = JSONObject(json)
                val active = o.optBoolean("active", false)
                audioActive = active
                if (active) RecitationService.update(this@MainActivity, o.optString("title", "تلاوة"), o.optString("sub", ""), o.optBoolean("playing", true))
                else RecitationService.stop(this@MainActivity)
            } catch (e: Exception) { Log.w("Wasan", "audioState", e) }
        }

        // ── مشاركة صورة (بطاقة آية/ذكر) ──
        @JavascriptInterface fun shareImage(b64: String, text: String) {
            try {
                val data = Base64.decode(b64.substringAfter(","), Base64.DEFAULT)
                val dir = File(cacheDir, "share").apply { mkdirs() }
                dir.listFiles()?.forEach { if (System.currentTimeMillis() - it.lastModified() > 3600_000) it.delete() }
                val f = File(dir, "wasan_" + System.currentTimeMillis() + ".png")
                f.writeBytes(data)
                val uri = FileProvider.getUriForFile(this@MainActivity, "$packageName.fileprovider", f)
                runOnUiThread {
                    try {
                        val send = Intent(Intent.ACTION_SEND).apply {
                            type = "image/png"; putExtra(Intent.EXTRA_STREAM, uri)
                            if (text.isNotBlank()) putExtra(Intent.EXTRA_TEXT, text)
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        startActivity(Intent.createChooser(send, "مشاركة الصورة"))
                    } catch (_: Exception) { }
                }
            } catch (e: Exception) { Log.w("Wasan", "shareImage", e) }
        }

        // ── وسن 4.5 · القراءة الكاملة: إخفاء شريطي الحالة والتنقّل (يظهران مؤقتًا بالسحب من الحافة) ──
        @JavascriptInterface fun setImmersive(on: Boolean) {
            runOnUiThread {
                try {
                    val c = WindowInsetsControllerCompat(window, window.decorView)
                    if (on) {
                        c.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                        c.hide(WindowInsetsCompat.Type.systemBars())
                    } else c.show(WindowInsetsCompat.Type.systemBars())
                } catch (e: Exception) { Log.w("Wasan", "immersive", e) }
            }
        }

        // ── وسن 4.5 · حجم خط الواجهة ──
        @JavascriptInterface fun setTextZoom(p: Int) { runOnUiThread { try { web.settings.textZoom = p.coerceIn(70, 160) } catch (_: Exception) { } } }

        // ── وسن 4.5 · تنزيل التلاوات (مدير التنزيلات ← مجلد التطبيق الخاص، بلا أذونات) ──
        @JavascriptInterface fun dlStart(k: String, url: String, rel: String, title: String) {
            try {
                val host = try { Uri.parse(url).host ?: "" } catch (_: Exception) { "" }
                if (!url.startsWith("https://") || !(host.endsWith("mp3quran.net") || host == "archive.org" || host.endsWith(".archive.org"))) { dlFail(k); return }
                val f = recitFile(rel) ?: run { dlFail(k); return }
                f.parentFile?.mkdirs()
                if (f.exists()) f.delete()
                val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
                val old = dlPrefs.getLong(k, -1L)
                if (old >= 0) try { dm.remove(old) } catch (_: Exception) { }
                val req = DownloadManager.Request(Uri.parse(url))
                    .setTitle(title)
                    .setDescription("وسن · تنزيل التلاوة للاستماع دون إنترنت")
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
                    .setDestinationInExternalFilesDir(this@MainActivity, "recit", rel)
                    .setAllowedOverMetered(true)
                    .setAllowedOverRoaming(true)
                req.addRequestHeader("User-Agent", "Wasan/6.0 (Android)")
                val id = dm.enqueue(req)
                dlPrefs.edit().putLong(k, id).putString("$k.rel", rel).apply()
            } catch (e: Exception) { Log.w("Wasan", "dlStart", e); dlFail(k) }
        }

        /** حالة التنزيلات: {k:{s:'run'|'done'|'fail'|'none', p:0..1, z:bytes}} */
        @JavascriptInterface fun dlStatus(json: String): String {
            val out = JSONObject()
            try {
                val keys = JSONArray(json)
                val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
                for (i in 0 until keys.length()) {
                    val k = keys.optString(i)
                    val id = dlPrefs.getLong(k, -1L)
                    val rel = dlPrefs.getString("$k.rel", null)
                    val o = JSONObject()
                    if (id < 0) {
                        val f = rel?.let { recitFile(it) }
                        if (f != null && f.exists() && f.length() > 1024) o.put("s", "done").put("z", f.length()) else o.put("s", "none")
                        out.put(k, o); continue
                    }
                    val c = dm.query(DownloadManager.Query().setFilterById(id))
                    if (c == null) { o.put("s", "run").put("p", 0); out.put(k, o); continue }
                    c.use {
                        if (!it.moveToFirst()) { o.put("s", "none"); dlForget(k) }
                        else {
                            val st = it.getInt(it.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                            val got = it.getLong(it.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
                            val tot = it.getLong(it.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
                            when (st) {
                                DownloadManager.STATUS_SUCCESSFUL -> {
                                    // إن غيّر النظام اسم الملف (مثل 001-1.mp3) نعيده إلى الاسم المتوقَّع
                                    val want = rel?.let { r -> recitFile(r) }
                                    try {
                                        val lp = it.getString(it.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI))?.let { u -> Uri.parse(u).path }
                                        if (want != null && lp != null && lp != want.absolutePath) { val lf = File(lp); if (lf.exists()) { want.delete(); lf.renameTo(want) } }
                                    } catch (_: Exception) { }
                                    if (want != null && want.exists() && want.length() > 1024) o.put("s", "done").put("z", want.length())
                                    else o.put("s", "fail")
                                    dlForget(k)
                                }
                                DownloadManager.STATUS_FAILED -> { o.put("s", "fail"); try { dm.remove(id) } catch (_: Exception) { }; dlForget(k) }
                                else -> o.put("s", "run").put("p", if (tot > 0) (got.toDouble() / tot).coerceIn(0.0, 1.0) else 0.0)
                            }
                        }
                    }
                    out.put(k, o)
                }
            } catch (e: Exception) { Log.w("Wasan", "dlStatus", e) }
            return out.toString()
        }

        @JavascriptInterface fun dlCancel(k: String, rel: String) {
            try {
                val id = dlPrefs.getLong(k, -1L)
                if (id >= 0) (getSystemService(DOWNLOAD_SERVICE) as DownloadManager).remove(id)
            } catch (_: Exception) { }
            dlForget(k)
            recitFile(rel)?.let { if (it.exists()) it.delete() }
        }

        @JavascriptInterface fun dlDelete(rel: String) {
            recitFile(rel)?.let { f -> if (f.exists()) f.delete(); f.parentFile?.let { d -> if (d.list()?.isEmpty() == true) d.delete() } }
        }

        /** مسار الملف المنزَّل (file://) أو "" إن لم يوجد */
        @JavascriptInterface fun dlPath(rel: String): String {
            val f = recitFile(rel) ?: return ""
            return if (f.exists() && f.length() > 1024) Uri.fromFile(f).toString() else ""
        }

        /** مجموع حجم التنزيلات بالبايت */
        @JavascriptInterface fun dlUsage(): Long = try { recitBase()?.walkTopDown()?.filter { it.isFile }?.sumOf { it.length() } ?: 0L } catch (_: Exception) { 0L }

        // ── طلب شبكة محدود (التفسير) — للمضيفات المسموح بها فقط ──
        @JavascriptInterface fun httpGet(id: String, url: String) {
            if (HTTP_ALLOW.none { url.startsWith(it) }) { js("try{window.onNativeHttp&&onNativeHttp(${JSONObject.quote(id)},0,'')}catch(e){}"); return }
            Thread {
                var code = 0; var body = ""
                try {
                    val c = URL(url).openConnection() as HttpURLConnection
                    c.connectTimeout = 10_000; c.readTimeout = 15_000
                    c.setRequestProperty("Accept", "application/json")
                    code = c.responseCode
                    body = (if (code in 200..299) c.inputStream else c.errorStream)?.use { it.readBytes().toString(Charsets.UTF_8) } ?: ""
                    c.disconnect()
                } catch (_: Exception) { code = 0 }
                js("try{window.onNativeHttp&&onNativeHttp(${JSONObject.quote(id)},$code,${JSONObject.quote(body)})}catch(e){}")
            }.start()
        }

        // ── أدوات ──
        @JavascriptInterface fun vibrate(ms: Long) {
            try {
                val v = getSystemService(VIBRATOR_SERVICE) as? Vibrator ?: return
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(ms.coerceIn(1, 1000), VibrationEffect.DEFAULT_AMPLITUDE))
                else @Suppress("DEPRECATION") v.vibrate(ms)
            } catch (_: Exception) { }
        }

        @JavascriptInterface fun shareText(text: String) {
            runOnUiThread {
                try {
                    val send = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, text) }
                    startActivity(Intent.createChooser(send, "مشاركة عبر"))
                } catch (_: Exception) { }
            }
        }

        @JavascriptInterface fun shareApp() = shareText("تطبيق «وسن» — رفيقك في الصلاة والذكر: القرآن الكريم مع التلاوة، مواقيت الصلاة، القبلة، الأذكار، العادات والمهام.")

        @JavascriptInterface fun copyText(text: String) {
            runOnUiThread {
                try {
                    val cm = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                    cm.setPrimaryClip(ClipData.newPlainText("وسن", text))
                } catch (_: Exception) { }
            }
        }

        // ── وسن 4.2 · النسخ الاحتياطي ──
        @JavascriptInterface fun saveBackup(name: String, text: String) {
            runOnUiThread {
                pendingBackup = text
                try { backupSaver.launch(name) } catch (_: Exception) {
                    pendingBackup = null
                    js("try{window.onBackupSaved&&onBackupSaved(false,false)}catch(e){}")
                }
            }
        }

        @JavascriptInterface fun pickBackup() {
            runOnUiThread {
                try { backupPicker.launch(arrayOf("application/json", "text/plain", "application/octet-stream", "*/*")) } catch (_: Exception) {
                    js("try{window.onBackupPicked&&onBackupPicked(null)}catch(e){}")
                }
            }
        }

        @JavascriptInterface fun toast(text: String) {
            runOnUiThread { Toast.makeText(this@MainActivity, text, Toast.LENGTH_SHORT).show() }
        }

        @JavascriptInterface fun setStatusBar(color: String, lightIcons: Boolean) {
            runOnUiThread {
                try {
                    window.statusBarColor = parseColor(color, 0xFF0B5D4B.toInt())
                    WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = lightIcons
                } catch (_: Exception) { }
            }
        }

        @JavascriptInterface fun setNavBar(color: String, lightIcons: Boolean) {
            runOnUiThread {
                try {
                    val c = parseColor(color, 0xFF07110E.toInt())
                    window.navigationBarColor = c
                    WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightNavigationBars = lightIcons
                    web.setBackgroundColor(c)
                } catch (_: Exception) { }
            }
        }

        @JavascriptInterface fun keepScreenOn(on: Boolean) {
            runOnUiThread {
                if (on) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }

        @JavascriptInterface fun openUrl(url: String) { runOnUiThread { openExternal(Uri.parse(url)) } }

        /** للتوافق مع 1.0: اختيار طريقة الحساب للمحرك الأصلي (تُحفظ الآن) */
        @JavascriptInterface fun pickMethod() {
            val items = CalcMethod.entries.map { it.arName }.toTypedArray()
            runOnUiThread {
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("طريقة الحساب")
                    .setItems(items) { _, which ->
                        method = CalcMethod.entries[which]
                        prefs().edit().putString("method", method.key).apply()
                        sendPrayers()
                    }.show()
            }
        }
    }
}

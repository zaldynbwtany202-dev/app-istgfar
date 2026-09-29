package com.noor.app.engine

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/*
 * ═════════════════════════════ GPS خفيف ─════════════════════════════
 *  وسن 3.0:
 *  ─ يستعمل آخر موقع معروف إن كان حديثاً (أقل من ساعتين).
 *  ─ وإلا يطلب قراءة واحدة جديدة من الشبكة و GPS معاً (أيهما أسرع)
 *    بمهلة 10 ثوانٍ، ثم يُلغي الاستماع دائماً (لا استنزاف للبطارية).
 *  ─ إن فشلت القراءة الجديدة يعود لآخر موقع معروف ولو كان قديماً.
 *  مصغّر عمداً: لا FusedLocationProvider، لا Google Play Services —
 *  يعمل على WSA والأجهزة دون خدمات جوجل.
 * ═════════════════════════════════════════════════════════════════════
 */
object NoorLocation {

    data class Coords(val lat: Double, val lng: Double, val label: String? = null) {
        companion object {
            // المدينة المنورة افتراضياً — لا تُفرض إذناً عند أول تشغيل.
            // (مكة نفسها تُعطي زاوية قبلة ٠° ومسافة ٠، فلا يُفهم منها شيء)
            val DEFAULT = Coords(24.4683, 39.6105, "المدينة المنورة")
        }
    }

    private const val FRESH_MS = 2 * 60 * 60 * 1000L
    private const val TIMEOUT_MS = 10_000L
    /** وسن 6.3: طلب صريح من المستخدم — مهلة أطول (التقاط GPS داخل المباني قد يتأخر) */
    const val USER_TIMEOUT_MS = 22_000L

    /** هل خدمة الموقع (GPS/الشبكة) مفعّلة في الهاتف؟ */
    fun isEnabled(ctx: Context): Boolean {
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return false
        return try {
            if (android.os.Build.VERSION.SDK_INT >= 28) lm.isLocationEnabled
            else lm.isProviderEnabled(LocationManager.GPS_PROVIDER) || lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
        } catch (_: Exception) { true }
    }

    fun hasPermission(ctx: Context): Boolean =
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_COARSE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED

    @SuppressLint("MissingPermission")
    suspend fun getLastKnownLocation(context: Context, timeoutMs: Long = TIMEOUT_MS, freshMs: Long = FRESH_MS): Coords? {
        if (!hasPermission(context)) return null
        val lm = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null

        // 1) أحدث موقع معروف (الأحدث زمناً، ثم الأدق)
        var best: Location? = null
        val enabled = try { lm.getProviders(true) } catch (_: Exception) { emptyList<String>() }
        for (p in enabled) {
            val l = try { lm.getLastKnownLocation(p) } catch (_: Exception) { null } ?: continue
            val b = best
            if (b == null || l.time > b.time + 60_000L || (Math.abs(l.time - b.time) <= 60_000L && l.accuracy < b.accuracy)) best = l
        }
        val last = best
        if (last != null && System.currentTimeMillis() - last.time < freshMs) return Coords(last.latitude, last.longitude)

        // 2) قراءة جديدة واحدة، ثم الرجوع للقديم عند الفشل
        val live = requestSingle(lm, enabled, timeoutMs)
        if (live != null) return Coords(live.latitude, live.longitude)
        return last?.let { Coords(it.latitude, it.longitude) }
    }

    @SuppressLint("MissingPermission")
    private suspend fun requestSingle(lm: LocationManager, enabled: List<String>, timeoutMs: Long): Location? =
        suspendCancellableCoroutine { cont ->
            // وسن 6.3: «fused» (أندرويد 12+) يجمع الشبكة والـGPS والواي فاي — أسرع وأدق داخل المباني
            val order = listOf("fused", LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER).filter { it in enabled }
            if (order.isEmpty()) { cont.resume(null); return@suspendCancellableCoroutine }
            val main = Handler(Looper.getMainLooper())
            val listeners = ArrayList<LocationListener>()
            var done = false
            fun finish(l: Location?) {            // يُستدعى دائماً على الخيط الرئيسي
                if (done) return
                done = true
                main.removeCallbacksAndMessages(null)
                for (x in listeners) try { lm.removeUpdates(x) } catch (_: Exception) { }
                listeners.clear()
                if (cont.isActive) cont.resume(l)
            }
            main.post {
                for (p in order) {
                    val ls = object : LocationListener {
                        override fun onLocationChanged(l: Location) { finish(l) }
                        @Deprecated("legacy")
                        override fun onStatusChanged(p: String?, s: Int, e: Bundle?) {}
                        override fun onProviderEnabled(p: String) {}
                        override fun onProviderDisabled(p: String) {}
                    }
                    try { lm.requestLocationUpdates(p, 0L, 0f, ls, Looper.getMainLooper()); listeners.add(ls) }
                    catch (_: Exception) { }
                }
                if (listeners.isEmpty()) finish(null)
                else main.postDelayed({ finish(null) }, timeoutMs)
            }
            cont.invokeOnCancellation { main.post { finish(null) } }
        }
}

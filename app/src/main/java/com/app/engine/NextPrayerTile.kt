package com.noor.app.engine

import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.util.Log
import com.noor.app.ui.screens.MainActivity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/*
 * ════════════════════════════════════════════════════════════════
 *  وسن 3.0 · بلاطة «الصلاة القادمة» في الإعدادات السريعة
 * ════════════════════════════════════════════════════════════════
 */
class NextPrayerTile : TileService() {
    override fun onStartListening() {
        super.onStartListening()
        val tile = qsTile ?: return
        try {
            val p = getSharedPreferences("noor_adhan", MODE_PRIVATE)
            val at = p.getLong("nextAt", 0L)
            val name = p.getString("nextName", null)?.takeIf { it.isNotBlank() }
                ?: p.getString("nextKey", null)?.let { PrayerEngine.prayerNameAr(it) }?.takeIf { it.isNotBlank() }
            if (at > System.currentTimeMillis() && name != null) {
                tile.label = name + " " + SimpleDateFormat("HH:mm", Locale.US).format(Date(at))
                if (Build.VERSION.SDK_INT >= 29) tile.subtitle = "الصلاة القادمة"
            } else {
                tile.label = "وسن"
                if (Build.VERSION.SDK_INT >= 29) tile.subtitle = "مواقيت الصلاة"
            }
            tile.contentDescription = "الصلاة القادمة"
            tile.state = Tile.STATE_ACTIVE
            tile.updateTile()
        } catch (e: Exception) {
            Log.e("WasanTile", "تعذّر تحديث البلاطة", e)
        }
    }

    override fun onClick() {
        super.onClick()
        val i = Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startActivityAndCollapse(PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_IMMUTABLE))
            } else {
                @Suppress("DEPRECATION")
                startActivityAndCollapse(i)
            }
        } catch (_: Exception) { }
    }
}

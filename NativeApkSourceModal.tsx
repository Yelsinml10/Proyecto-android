import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NativeApkSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeApkSourceModal: React.FC<NativeApkSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'manifest' | 'service' | 'bridge' | 'guide'>('service');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.netvpn.proxy">

    <!-- Permisos requeridos para VPN real en Android -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NET VPN PROXY"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Servicio Nativo VpnService -->
        <service
            android:name=".services.NetVpnService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.net.VpnService"/>
            </intent-filter>
        </service>

    </application>
</manifest>`;

  const serviceCode = `package com.netvpn.proxy.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat

class NetVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == "STOP_VPN") {
            stopVpn()
            return START_NOT_STICKY
        }

        startForeground(1001, createNotification("Conectado a NET VPN PROXY"))
        startVpnTunnel(
            serverHost = intent?.getStringExtra("SERVER_HOST") ?: "104.21.45.1",
            localPort = intent?.getIntExtra("LOCAL_PORT", 1080) ?: 1080
        )

        return START_STICKY
    }

    private fun startVpnTunnel(serverHost: String, localPort: Int) {
        if (isRunning) return
        isRunning = true

        val builder = Builder()
            .setSession("NET VPN PROXY Tunnel")
            .setMtu(1500)
            .addAddress("10.8.0.2", 24)
            .addDnsServer("8.8.8.8")
            .addDnsServer("1.1.1.1")
            .addRoute("0.0.0.0", 0) // Enruta todo el tráfico de internet

        vpnInterface = builder.establish()

        // Ejecuta el motor tun2socks en segundo plano
        Thread {
            try {
                val fd = vpnInterface?.fd ?: return@Thread
                Tun2SocksBridge.runTun2Socks(
                    vpnFd = fd,
                    socksServer = "127.0.0.1:$localPort",
                    dnsServer = "8.8.8.8:53",
                    udpgwServer = "127.0.0.1:7300"
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }.start()
    }

    private fun stopVpn() {
        isRunning = false
        vpnInterface?.close()
        vpnInterface = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun createNotification(text: String): Notification {
        val channelId = "net_vpn_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(channelId, "NET VPN Service", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(chan)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("NET VPN PROXY Activo")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .build()
    }
}`;

  const bridgeCode = `package com.netvpn.proxy.services

object Tun2SocksBridge {
    init {
        // Carga la librería nativa C++ compilada
        System.loadLibrary("tun2socks")
    }

    external fun runTun2Socks(
        vpnFd: Int,
        socksServer: String,
        dnsServer: String,
        udpgwServer: String
    ): Int

    external fun stopTun2Socks(): Int
}`;

  const guideText = `# 🚀 Guía de Compilación APK Nativa con Android Studio

1. **Exportar el Proyecto**:
   - Descarga el código ZIP desde Google AI Studio (Settings > Export to ZIP).
   - Descomprímelo en tu PC.

2. **Preparar Capacitor Android**:
   \`\`\`bash
   npm install
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "NET VPN PROXY" "com.netvpn.proxy" --web-dir dist
   npm run build
   npx cap add android
   npx cap open android
   \`\`\`

3. **Copiar los Archivos Nativos**:
   - Pega el código de **AndroidManifest.xml** en \`android/app/src/main/AndroidManifest.xml\`.
   - Pega **NetVpnService.kt** en \`android/app/src/main/java/com/netvpn/proxy/services/\`.

4. **Compilar en Android Studio**:
   - En Android Studio ve al menú: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - ¡Tu APK real con servicio VPN estará lista en la carpeta \`app/build/outputs/apk/debug/\`!`;

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'manifest':
        return manifestCode;
      case 'service':
        return serviceCode;
      case 'bridge':
        return bridgeCode;
      case 'guide':
        return guideText;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  Código Fuente para Compilar APK Nativa Real
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  Android VpnService + tun2socks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archivos Kotlin y configuración requerida para crear el túnel VPN en Android Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('service')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'service'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              NetVpnService.kt
            </button>

            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'manifest'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              AndroidManifest.xml
            </button>

            <button
              onClick={() => setActiveTab('bridge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bridge'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Tun2SocksBridge.kt
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-purple-500 text-white shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Guía Android Studio
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Archivo'}</span>
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-950/90 font-mono text-xs text-cyan-300 leading-relaxed">
          <pre className="whitespace-pre-wrap selection:bg-cyan-500 selection:text-slate-950">
            {getCurrentCode()}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Compatible con Android 8.0 hasta Android 15 (Sin necesidad de Root).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

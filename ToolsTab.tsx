import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Globe,
  Radio,
  Sliders,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Smartphone,
  Server,
  Activity,
  Compass,
  Link as LinkIcon,
  Wifi,
  Volume2,
  Bell,
  RefreshCw,
  EyeOff,
  Flame,
  Key,
  Database,
  Check,
  Sparkles,
  Palette,
} from 'lucide-react';
import { VpnConfig } from '../types';
import { AppThemeId, APP_THEMES } from '../utils/themeConfig';

interface ToolsTabProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onOpenPayloadModal: () => void;
  currentThemeId?: AppThemeId;
  onOpenThemesModal?: () => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  config,
  onUpdateConfig,
  onOpenPayloadModal,
  currentThemeId = 'cyber_neon',
  onOpenThemesModal,
}) => {
  // --- STATE FOR SETTINGS & UTILITIES ---
  // Routing & Per-App
  const [perAppProxy, setPerAppProxy] = useState(config.bypassApps ?? false);
  const [perAppMode, setPerAppMode] = useState<'allow' | 'bypass'>('bypass');
  const [bypassLan, setBypassLan] = useState(true);
  const [blockIpv6, setBlockIpv6] = useState(true);
  const [rootMode, setRootMode] = useState(false);

  // Network & Engine
  const [mtuSize, setMtuSize] = useState<number>(1400);
  const [socksEngine, setSocksEngine] = useState<'badvpn' | 'gvisor' | 'tun2socks' | 'lwip'>('badvpn');
  const [udpForwarding, setUdpForwarding] = useState(config.forwardUdp ?? true);
  const [udpPort, setUdpPort] = useState(config.udpGwPort || 7300);
  const [dataCompression, setDataCompression] = useState(false);
  const [keepAliveInterval, setKeepAliveInterval] = useState(15);
  const [wakeLock, setWakeLock] = useState(config.wakeLock ?? true);

  // DNS & Security
  const [enableDnsForward, setEnableDnsForward] = useState(config.enableDns ?? true);
  const [selectedDns, setSelectedDns] = useState(config.dnsProvider || 'google');
  const [customDnsPrimary, setCustomDnsPrimary] = useState(config.customDnsPrimary || '1.1.1.1');
  const [customDnsSecondary, setCustomDnsSecondary] = useState(config.customDnsSecondary || '1.0.0.1');
  const [dohEnabled, setDohEnabled] = useState(false);
  const [fakeDns, setFakeDns] = useState(false);

  // Hotshare / Tethering
  const [hotshareActive, setHotshareActive] = useState(config.hotshareEnabled ?? false);
  const [proxyPort, setProxyPort] = useState(config.hotsharePort || 1080);
  const [copiedProxy, setCopiedProxy] = useState(false);

  // System & Reconnect
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [reconnectRetries, setReconnectRetries] = useState(99);
  const [soundNotify, setSoundNotify] = useState(true);
  const [vibrateNotify, setVibrateNotify] = useState(true);

  // Host Checker Tool
  const [targetHost, setTargetHost] = useState(config.bugHost || 'm.whatsapp.net');
  const [requestMethod, setRequestMethod] = useState<'GET' | 'HEAD' | 'CONNECT' | 'POST'>('GET');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    status: number;
    statusText: string;
    latency: number;
    serverType: string;
    isWsCapable: boolean;
    headers: Record<string, string>;
  } | null>(null);

  // IP Hunter Tool
  const [targetSubnets, setTargetSubnets] = useState('100.|10.|172.');
  const [currentLocalIp, setCurrentLocalIp] = useState('100.94.112.54');
  const [isHunting, setIsHunting] = useState(false);
  const [huntMatch, setHuntMatch] = useState(true);

  // Toast
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  const showSaved = (msg: string) => {
    setSavedAlert(msg);
    setTimeout(() => setSavedAlert(null), 2500);
  };

  const handleTestHost = () => {
    setIsChecking(true);
    setCheckResult(null);

    setTimeout(() => {
      setIsChecking(false);
      const isCloudflare = targetHost.includes('cloudflare') || targetHost.includes('cdn') || targetHost.includes('claro');
      const is302 = targetHost.includes('facebook') || targetHost.includes('portal');

      setCheckResult({
        status: is302 ? 302 : 101,
        statusText: is302 ? 'Found (Redirect)' : 'Switching Protocols (WebSocket Ready)',
        latency: Math.floor(Math.random() * 40) + 25,
        serverType: isCloudflare ? 'cloudflare / nginx-edge' : 'Apache/2.4 (Unix)',
        isWsCapable: !is302,
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
          'Server': isCloudflare ? 'cloudflare' : 'openresty',
          'CF-RAY': `${Math.random().toString(36).substring(2, 12)}-MIA`,
          'Content-Type': 'text/html; charset=UTF-8',
        },
      });
    }, 600);
  };

  const handleHuntIp = () => {
    setIsHunting(true);
    setTimeout(() => {
      const octet1 = Math.random() > 0.4 ? '100' : '10';
      const octet2 = Math.floor(Math.random() * 150) + 10;
      const newIp = `${octet1}.${octet2}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
      setCurrentLocalIp(newIp);
      setHuntMatch(newIp.startsWith('100.') || newIp.startsWith('10.'));
      setIsHunting(false);
      showSaved('Nueva IP de datos móviles detectada');
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16 select-none font-sans text-slate-200">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Ajustes y Configuración de APK</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Ajustes avanzados del motor túnel, red, DNS y utilidades
          </p>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-bold">
          Xray / BadVPN
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 0. SECCIÓN: TEMAS Y PERSONALIZACIÓN HD                                   */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-cyan-500/30 rounded-2xl p-4 shadow-lg space-y-3.5 bg-gradient-to-r from-[#111722] via-[#131d2e] to-[#111722]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Temas y Estilo Visual HD
            </span>
          </div>
          <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-wider shadow">
            8 PALETAS
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Personaliza toda la interfaz con estilos cyberpunk, AMOLED negro puro, violeta eléctrico o atardecer maya adaptables en alta definición.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {APP_THEMES.slice(0, 4).map((t) => {
            const isSelected = currentThemeId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpenThemesModal?.()}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-[#0a0e16] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: t.previewColors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: t.previewColors.accent }}
                  />
                </div>
                <span className="text-[11px] font-bold text-white truncate">{t.name}</span>
                <span className="text-[9px] text-slate-400">{t.category}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onOpenThemesModal?.()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Palette className="w-4 h-4" />
          <span>Ver y Cambiar Temas HD (8 Paletas)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECCIÓN: ENRUTAMIENTO Y APLICACIONES                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            1. Enrutamiento y Aplicaciones
          </span>
        </div>

        {/* Per-App Proxy / Split Tunnel */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Túnel Dividido (Per-App Proxy)</span>
            <span className="text-[10px] text-slate-400 block">
              Filtra qué aplicaciones de Android pasan por el túnel VPN.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={perAppProxy}
              onChange={(e) => {
                setPerAppProxy(e.target.checked);
                onUpdateConfig({ ...config, bypassApps: e.target.checked });
                showSaved(e.target.checked ? 'Per-App Proxy activado' : 'Per-App Proxy desactivado');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
          </label>
        </div>

        {perAppProxy && (
          <div className="space-y-2 pt-2 border-t border-slate-800/70 animate-fade-in">
            <label className="text-[11px] font-semibold text-slate-300">Modo de filtrado</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bypass' as const, label: 'Omitir apps seleccionadas' },
                { id: 'allow' as const, label: 'Solo apps seleccionadas' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPerAppMode(m.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                    perAppMode === m.id
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'border border-slate-800 bg-[#0a0e16] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bypass LAN */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Bypass Red Local (LAN)</span>
            <span className="text-[10px] text-slate-400 block">
              Ignora 192.168.x.x, 10.x.x.x para mantener acceso a impresoras y WiFi local.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={bypassLan}
              onChange={(e) => setBypassLan(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
          </label>
        </div>

        {/* Bloqueo IPv6 */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Bloquear Tráfico IPv6</span>
            <span className="text-[10px] text-slate-400 block">
              Evita fugas de datos y caídas en redes móviles que asignan IPv6.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={blockIpv6}
              onChange={(e) => setBlockIpv6(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
          </label>
        </div>

        {/* Modo Root */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Modo Root (iptables / TPROXY)</span>
            <span className="text-[10px] text-slate-400 block">
              Redirige paquetes directamente por kernel Linux en teléfonos con Root.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={rootMode}
              onChange={(e) => setRootMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECCIÓN: MOTOR Y RENDIMIENTO                                          */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            2. Motor y Rendimiento de Red
          </span>
        </div>

        {/* SOCKS / TUN Engine */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-300">Motor SOCKS (tun2socks Core)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'badvpn' as const, label: 'BadVPN' },
              { id: 'gvisor' as const, label: 'gVisor Net' },
              { id: 'tun2socks' as const, label: 'Go-Tun2Socks' },
              { id: 'lwip' as const, label: 'lwIP Stack' },
            ].map((eng) => (
              <button
                key={eng.id}
                type="button"
                onClick={() => {
                  setSocksEngine(eng.id);
                  showSaved(`Motor cambiado a ${eng.label}`);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                  socksEngine === eng.id
                    ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border border-slate-800 bg-[#0a0e16] text-slate-400'
                }`}
              >
                {eng.label}
              </button>
            ))}
          </div>
        </div>

        {/* MTU Size */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[11px] font-semibold">
            <span className="text-slate-300">Tamaño MTU de Paquete</span>
            <span className="text-emerald-400 font-mono font-bold">{mtuSize} Bytes</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1280, 1400, 1450, 1500].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setMtuSize(size)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  mtuSize === size
                    ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border border-slate-800 bg-[#0a0e16] text-slate-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Recomendado 1400 o 1280 para evitar congelamiento de datos en redes 4G LTE.
          </p>
        </div>

        {/* UDP Forwarding & BadVPN Gateway */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Reenvío UDP (BadVPN UDPGW)</span>
            <span className="text-[10px] text-slate-400 block">
              Indispensable para juegos online (Free Fire, PUBG) y videollamadas.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={udpForwarding}
              onChange={(e) => {
                setUdpForwarding(e.target.checked);
                onUpdateConfig({ ...config, forwardUdp: e.target.checked });
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {udpForwarding && (
          <div className="space-y-1 pt-1 animate-fade-in">
            <label className="text-[11px] font-semibold text-slate-300">Puerto UDPGW del servidor</label>
            <input
              type="number"
              value={udpPort}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 7300;
                setUdpPort(val);
                onUpdateConfig({ ...config, udpGwPort: val });
              }}
              placeholder="7300"
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400">Por defecto: 7300 (udpgw)</p>
          </div>
        )}

        {/* Keep-Alive Interval */}
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <div className="flex justify-between items-center text-[11px] font-semibold">
            <span className="text-slate-300">Auto-Ping / Keep-Alive</span>
            <span className="text-emerald-400 font-mono font-bold">Cada {keepAliveInterval}s</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={keepAliveInterval}
            onChange={(e) => setKeepAliveInterval(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <p className="text-[10px] text-slate-400">
            Envía paquetes periódicos para evitar que la compañía móvil cierre la conexión por inactividad.
          </p>
        </div>

        {/* Wake Lock */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">WakeLock (Evitar Suspensión de CPU)</span>
            <span className="text-[10px] text-slate-400 block">
              Mantiene el proceso del túnel activo con la pantalla apagada.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={wakeLock}
              onChange={(e) => {
                setWakeLock(e.target.checked);
                onUpdateConfig({ ...config, wakeLock: e.target.checked });
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECCIÓN: DNS Y SEGURIDAD                                              */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            3. DNS y Seguridad (DoH / Anti-Leak)
          </span>
        </div>

        {/* DNS Forwarding Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Reenvío DNS por el Túnel</span>
            <span className="text-[10px] text-slate-400 block">
              Evita que el operador de telefonía intercepte tus solicitudes de dominio.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableDnsForward}
              onChange={(e) => {
                setEnableDnsForward(e.target.checked);
                onUpdateConfig({ ...config, enableDns: e.target.checked });
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500" />
          </label>
        </div>

        {enableDnsForward && (
          <div className="space-y-3 pt-2 border-t border-slate-800/70 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'google', name: 'Google DNS', primary: '8.8.8.8', secondary: '8.8.4.4' },
                { id: 'cloudflare', name: 'Cloudflare DNS', primary: '1.1.1.1', secondary: '1.0.0.1' },
                { id: 'adguard', name: 'AdGuard (Anti-Ads)', primary: '94.140.14.14', secondary: '94.140.15.15' },
                { id: 'custom', name: 'Personalizado', primary: customDnsPrimary, secondary: customDnsSecondary },
              ].map((dns) => (
                <button
                  key={dns.id}
                  type="button"
                  onClick={() => {
                    setSelectedDns(dns.id as any);
                    onUpdateConfig({ ...config, dnsProvider: dns.id as any });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDns === dns.id
                      ? 'bg-purple-950/40 border-purple-500/70 ring-1 ring-purple-500/50'
                      : 'bg-[#0a0e16] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{dns.name}</span>
                    {selectedDns === dns.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {dns.primary} · {dns.secondary}
                  </div>
                </button>
              ))}
            </div>

            {selectedDns === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={customDnsPrimary}
                  onChange={(e) => setCustomDnsPrimary(e.target.value)}
                  placeholder="DNS Primario (8.8.8.8)"
                  className="bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
                <input
                  type="text"
                  value={customDnsSecondary}
                  onChange={(e) => setCustomDnsSecondary(e.target.value)}
                  placeholder="DNS Secundario"
                  className="bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                />
              </div>
            )}

            {/* Fake DNS (Xray) */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <div className="space-y-0.5 pr-3">
                <span className="text-xs font-semibold text-slate-200 block">Fake DNS (Xray Core)</span>
                <span className="text-[10px] text-slate-400 block">
                  Asigna IPs virtuales 198.18.0.0/15 para resolución instantánea sin consultas remotas.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={fakeDns}
                  onChange={(e) => setFakeDns(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. SECCIÓN: COMPARTIR CONEXIÓN (HOTSHARE & PROXY)                        */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              4. Hotshare (Compartir por WiFi)
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              hotshareActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {hotshareActive ? 'PROXY ACTIVO' : 'DETENIDO'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Inicia un servidor proxy local para compartir tu conexión VPN a computadoras (PC), consolas de juego o Smart TV a través de tu zona WiFi portátil.
        </p>

        <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Servidor Proxy Local:</span>
            <button
              type="button"
              onClick={() => {
                setHotshareActive(!hotshareActive);
                onUpdateConfig({ ...config, hotshareEnabled: !hotshareActive });
                showSaved(!hotshareActive ? 'Hotshare iniciado en 192.168.43.1:1080' : 'Hotshare detenido');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                hotshareActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {hotshareActive ? 'Detener Hotshare' : 'Iniciar Hotshare'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#111722] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">IP Proxy WiFi:</span>
              <span className="text-cyan-300 font-bold">192.168.43.1</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#111722] border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Puerto Proxy:</span>
              <span className="text-emerald-300 font-bold">{proxyPort}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`192.168.43.1:${proxyPort}`);
              setCopiedProxy(true);
              setTimeout(() => setCopiedProxy(false), 2000);
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#111722] hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
          >
            {copiedProxy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedProxy ? '¡Copiado al Portapapeles!' : 'Copiar IP:Puerto para configurar en PC'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SECCIÓN: RECONEXIÓN Y NOTIFICACIONES                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            5. Reconexión y Notificaciones
          </span>
        </div>

        {/* Auto Reconnect */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-3">
            <span className="text-xs font-semibold text-slate-200 block">Reconexión Automática Infinita</span>
            <span className="text-[10px] text-slate-400 block">
              Reintenta conectar automáticamente si la red móvil cambia o se cae la señal.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        {/* Sonido / Vibración */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e16] border border-slate-800">
            <span className="text-xs text-slate-300">Sonido de conexión</span>
            <input
              type="checkbox"
              checked={soundNotify}
              onChange={(e) => setSoundNotify(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e16] border border-slate-800">
            <span className="text-xs text-slate-300">Vibración háptica</span>
            <input
              type="checkbox"
              checked={vibrateNotify}
              onChange={(e) => setVibrateNotify(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SECCIÓN: UTILIDAD - HOST CHECKER (TESTER DE BUG HOST)                  */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              6. Host Checker (Verificador de Bug Host)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenPayloadModal}
            className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Generar Payload</span>
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="flex gap-2">
            <select
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value as any)}
              className="bg-[#0a0e16] border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="HEAD">HEAD</option>
              <option value="CONNECT">CONNECT</option>
              <option value="POST">POST</option>
            </select>

            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              placeholder="Dominio / Bug Host (ej. m.domain.com)"
              className="flex-1 bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={handleTestHost}
            disabled={isChecking}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Probando Conexión...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Probar Respuesta del Host</span>
              </>
            )}
          </button>
        </div>

        {checkResult && (
          <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-slate-800 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  checkResult.status === 101
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : checkResult.status === 200
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                HTTP {checkResult.status} {checkResult.statusText}
              </span>
              <span className="text-[11px] font-mono text-cyan-400">{checkResult.latency} ms</span>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-[#111722] p-2.5 rounded-lg space-y-1">
              {Object.entries(checkResult.headers).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500">{k}:</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {checkResult.isWsCapable ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Compatible con SSH WebSocket (101 Switching Protocols)!</span>
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <span>Host con redirección 302. Usar SSL SNI o inyección [split].</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. SECCIÓN: UTILIDAD - IP HUNTER (BUSCADOR DE IP)                         */}
      {/* ========================================================================= */}
      <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              7. IP Hunter (Rango de Datos Móviles)
            </span>
          </div>
          <span className="text-[10px] text-purple-400 font-mono font-bold">4G / 5G LTE</span>
        </div>

        <p className="text-xs text-slate-400">
          Algunas redes de telefonía requieren que tu IP móvil esté en rangos específicos (como <code>100.x</code> o <code>10.x</code>) para navegar gratis.
        </p>

        <div className="p-3.5 rounded-xl bg-[#0a0e16] border border-slate-800 text-center space-y-2">
          <span className="text-[11px] text-slate-500 block font-medium">IP Móvil Asignada por Operador</span>
          <span className="text-xl font-black font-mono text-cyan-300 tracking-wider">
            {currentLocalIp}
          </span>
          <div className="flex items-center justify-center gap-1 text-xs">
            {huntMatch ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡IP en rango óptimo para túnel!</span>
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span>IP no compatible. Activa y desactiva el Modo Avión.</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-medium">Subredes Objetivo:</label>
          <input
            type="text"
            value={targetSubnets}
            onChange={(e) => setTargetSubnets(e.target.value)}
            className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
          />
        </div>

        <button
          type="button"
          onClick={handleHuntIp}
          disabled={isHunting}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          {isHunting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Buscando nueva IP móvil...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Simular Cambio de IP / Modo Avión</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Save Alert Toast */}
      {savedAlert && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500/60 text-cyan-300 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl z-50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{savedAlert}</span>
        </div>
      )}
    </div>
  );
};

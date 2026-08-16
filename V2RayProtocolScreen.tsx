import React, { useState } from 'react';
import {
  Menu,
  MoreVertical,
  Clipboard,
  Code,
  Check,
  Plus,
  ArrowLeft,
  Server,
  Key,
  SlidersHorizontal,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { VpnConfig, V2RayType, V2RayNetwork } from '../../types';
import { parseV2rayLink } from '../../utils/v2rayParser';

interface V2RayProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const V2RayProtocolScreen: React.FC<V2RayProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [v2rayType, setV2rayType] = useState<V2RayType>(config.v2rayType || 'vless');
  const [transportType, setTransportType] = useState<V2RayNetwork>(config.network || 'ws');
  const [securityEnabled, setSecurityEnabled] = useState<boolean>(config.v2rayTls ?? true);
  const [securityType, setSecurityType] = useState<'tls' | 'reality'>(
    (config.securityType as any) || (config.security === 'reality' ? 'reality' : 'tls')
  );
  const [fingerprint, setFingerprint] = useState<string>('chrome');
  const [alpn, setAlpn] = useState<string>('h2, http/1.1');
  const [flow, setFlow] = useState<string>(config.v2rayFlow || 'none');
  const [headerType, setHeaderType] = useState<string>(config.v2rayHeaderType || 'none');
  const [kcpSeed, setKcpSeed] = useState<string>(config.kcpSeed || '');
  const [quicSecurity, setQuicSecurity] = useState<string>(config.quicSecurity || 'none');
  const [quicKey, setQuicKey] = useState<string>(config.quicKey || '');
  const [grpcMode, setGrpcMode] = useState<'gun' | 'multi'>('gun');
  const [shadowsocksMethod, setShadowsocksMethod] = useState<string>(config.ssMethod || 'aes-256-gcm');
  const [allowInsecure, setAllowInsecure] = useState<boolean>(false);
  const [echConfig, setEchConfig] = useState<string>('');
  const [pinnedCert, setPinnedCert] = useState<string>('');
  const [muxEnabled, setMuxEnabled] = useState<boolean>(true);
  const [muxConcurrency, setMuxConcurrency] = useState<string>('');
  const [xudpConcurrency, setXudpConcurrency] = useState<string>('allow');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  // Paste from clipboard & auto-parse
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('vless://') || text.startsWith('vmess://') || text.startsWith('trojan://') || text.startsWith('ss://'))) {
        const parsed = parseV2rayLink(text);
        if (parsed) {
          onUpdateConfig({
            ...config,
            ...parsed,
            v2rayLink: text.trim(),
          });
          if (parsed.v2rayType) setV2rayType(parsed.v2rayType);
          setCopiedNotification(`¡Enlace ${parsed.v2rayType?.toUpperCase()} importado y configurado!`);
          setTimeout(() => setCopiedNotification(null), 3000);
          return;
        }
      }
      setCopiedNotification('Texto copiado, pero no es un enlace V2Ray válido.');
      setTimeout(() => setCopiedNotification(null), 3000);
    } catch (e) {
      setCopiedNotification('No se pudo acceder al portapapeles.');
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  // Transports allowed per protocol
  const getTransportsForProtocol = (proto: V2RayType): { id: V2RayNetwork; label: string }[] => {
    switch (proto) {
      case 'vless':
        return [
          { id: 'tcp', label: 'TCP (Reality/Direct)' },
          { id: 'ws', label: 'WebSocket (WS)' },
          { id: 'grpc', label: 'gRPC' },
          { id: 'http', label: 'HTTP/2 (h2)' },
          { id: 'upgrade', label: 'HTTPUpgrade' },
          { id: 'splithttp', label: 'SplitHTTP (xhttp)' },
          { id: 'kcp', label: 'mKCP' },
          { id: 'quic', label: 'QUIC' },
        ];
      case 'vmess':
        return [
          { id: 'ws', label: 'WebSocket (WS)' },
          { id: 'tcp', label: 'TCP' },
          { id: 'grpc', label: 'gRPC' },
          { id: 'http', label: 'HTTP/2 (h2)' },
          { id: 'upgrade', label: 'HTTPUpgrade' },
          { id: 'kcp', label: 'mKCP' },
          { id: 'quic', label: 'QUIC' },
        ];
      case 'trojan':
        return [
          { id: 'tcp', label: 'TCP (Estándar)' },
          { id: 'ws', label: 'WebSocket (WS)' },
          { id: 'grpc', label: 'gRPC' },
          { id: 'http', label: 'HTTP/2 (h2)' },
        ];
      case 'shadowsocks':
        return [
          { id: 'tcp', label: 'TCP' },
          { id: 'ws', label: 'WebSocket (WS)' },
          { id: 'kcp', label: 'mKCP' },
        ];
      case 'socks':
        return [{ id: 'tcp', label: 'TCP' }];
      case 'wireguard':
        return [{ id: 'quic', label: 'UDP / WireGuard' }];
      default:
        return [{ id: 'ws', label: 'WebSocket' }, { id: 'tcp', label: 'TCP' }];
    }
  };

  const handleProtocolSelect = (pId: V2RayType) => {
    setV2rayType(pId);
    // VLESS supports Reality & TLS. VMess & Trojan support TLS. Socks & Wireguard don't use standard TLS switch.
    if (pId !== 'vless' && securityType === 'reality') {
      setSecurityType('tls');
    }
    if (pId === 'socks' || pId === 'wireguard') {
      setSecurityEnabled(false);
      onUpdateConfig({ ...config, v2rayType: pId, v2rayTls: false });
    } else {
      if (pId === 'vless' || pId === 'trojan') {
        setSecurityEnabled(true);
      }
    }

    const allowed = getTransportsForProtocol(pId);
    if (!allowed.some((t) => t.id === transportType)) {
      const defaultTrans = allowed[0].id;
      setTransportType(defaultTrans);
      onUpdateConfig({ ...config, v2rayType: pId, network: defaultTrans });
    } else {
      onUpdateConfig({ ...config, v2rayType: pId });
    }
  };

  return (
    <div className="min-h-full bg-[#0a0e16] text-slate-200 pb-24 select-none">
      {/* Top App Bar (Exact HTTP Custom V2Ray Style - Video 00:19) */}
      <div className="sticky top-0 z-20 bg-[#0f141c] border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenDrawer}
              className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-base font-bold text-white tracking-wide">V2Ray</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Clipboard Paste Icon */}
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-lg active:bg-slate-800 transition-colors"
            title="Pegar enlace V2Ray del portapapeles"
          >
            <Clipboard className="w-5 h-5" />
          </button>

          {/* Code / Raw Icon */}
          <button
            type="button"
            onClick={() => {
              const uri = prompt('Ingresa enlace V2Ray (vless://, vmess:// o trojan://):');
              if (uri) {
                const parsed = parseV2rayLink(uri);
                if (parsed) {
                  onUpdateConfig({ ...config, ...parsed, v2rayLink: uri });
                  if (parsed.v2rayType) setV2rayType(parsed.v2rayType);
                }
              }
            }}
            className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-lg active:bg-slate-800 transition-colors"
            title="Ingresar URI manual"
          >
            <Code className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="max-w-xl mx-auto px-4 pt-3">
          <div className="p-3 bg-cyan-950/80 border border-cyan-700/80 rounded-xl text-xs text-cyan-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{copiedNotification}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. SECCIÓN: SERVIDOR (Video 00:19 - 00:20)                                */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Servidor</span>
          </div>

          {/* Protocol Type Selector Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Protocolo V2Ray / Xray
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'vless' as const, label: 'VLESS' },
                { id: 'vmess' as const, label: 'VMess' },
                { id: 'trojan' as const, label: 'Trojan' },
                { id: 'shadowsocks' as const, label: 'Shadowsocks' },
                { id: 'socks' as const, label: 'Socks5' },
                { id: 'wireguard' as const, label: 'WireGuard' },
              ].map((p) => {
                const isSelected = v2rayType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProtocolSelect(p.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                        : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host:puerto del servidor */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Host:puerto del servidor
            </label>
            <input
              type="text"
              placeholder="paquetes1.miclaro.com.hn:80"
              value={config.server ? `${config.server}:${config.port || 443}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(':')) {
                  const parts = val.split(':');
                  onUpdateConfig({
                    ...config,
                    server: parts[0],
                    port: parseInt(parts[1]) || 443,
                  });
                } else {
                  onUpdateConfig({
                    ...config,
                    server: val,
                  });
                }
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400">
              Usa host:puerto, por ejemplo v2ray.example.com:443 o [2001:db8::1]:443
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SECCIÓN: CUENTA                                                        */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Cuenta ({v2rayType.toUpperCase()})
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              {v2rayType === 'trojan'
                ? 'Contraseña Trojan'
                : v2rayType === 'shadowsocks'
                ? 'Contraseña / Secret'
                : v2rayType === 'socks'
                ? 'Usuario:Contraseña (Opcional)'
                : v2rayType === 'wireguard'
                ? 'Private Key (WireGuard)'
                : 'ID de usuario (UUID)'}
            </label>
            <input
              type="text"
              placeholder={
                v2rayType === 'trojan'
                  ? 'Contraseña'
                  : v2rayType === 'shadowsocks'
                  ? 'Password'
                  : v2rayType === 'wireguard'
                  ? 'aBcDeFg123456789... (Base64 Private Key)'
                  : 'b831381d-6324-4d53-ad4f-8cda48b30811'
              }
              value={config.uuid || ''}
              onChange={(e) => onUpdateConfig({ ...config, uuid: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {v2rayType === 'shadowsocks' && (
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Método de Cifrado Shadowsocks
              </label>
              <select
                value={shadowsocksMethod}
                onChange={(e) => {
                  setShadowsocksMethod(e.target.value);
                  onUpdateConfig({ ...config, ssMethod: e.target.value });
                }}
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="aes-256-gcm">aes-256-gcm (Recomendado)</option>
                <option value="aes-128-gcm">aes-128-gcm</option>
                <option value="chacha20-poly1305">chacha20-poly1305</option>
                <option value="2022-blake3-aes-128-gcm">2022-blake3-aes-128-gcm</option>
                <option value="2022-blake3-aes-256-gcm">2022-blake3-aes-256-gcm</option>
                <option value="2022-blake3-chacha20-poly1305">2022-blake3-chacha20-poly1305</option>
                <option value="none">none (sin cifrado)</option>
              </select>
            </div>
          )}

          {v2rayType === 'vmess' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">AlterId</label>
                <input
                  type="number"
                  placeholder="0"
                  value={config.v2rayAlterId ?? 0}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      v2rayAlterId: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Cifrado VMess</label>
                <select
                  value={config.security || 'auto'}
                  onChange={(e) => onUpdateConfig({ ...config, security: e.target.value })}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="auto">auto</option>
                  <option value="aes-128-gcm">aes-128-gcm</option>
                  <option value="chacha20-poly1305">chacha20-poly1305</option>
                  <option value="none">none</option>
                  <option value="zero">zero</option>
                </select>
              </div>
            </div>
          )}

          {v2rayType === 'vless' && (
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Flujo Xray (Flow)
              </label>
              <select
                value={flow}
                onChange={(e) => {
                  setFlow(e.target.value);
                  onUpdateConfig({ ...config, v2rayFlow: e.target.value === 'none' ? undefined : e.target.value });
                }}
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="none">Ninguno (Estándar)</option>
                <option value="xtls-rprx-vision">xtls-rprx-vision (Reality / TCP)</option>
                <option value="xtls-rprx-vision-udp443">xtls-rprx-vision-udp443</option>
              </select>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. SECCIÓN: TRANSPORTE                                                    */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Transporte de Red (Stream Settings)
            </span>
          </div>

          {/* Transport Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {getTransportsForProtocol(v2rayType).map((t) => {
              const isSelected = transportType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTransportType(t.id);
                    onUpdateConfig({ ...config, network: t.id });
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                      : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional parameters based on transport */}
          {(transportType === 'ws' || transportType === 'http' || transportType === 'upgrade' || transportType === 'splithttp') && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Ruta (Path)</label>
                <input
                  type="text"
                  placeholder="/v2ray-ws"
                  value={config.v2rayPath || '/'}
                  onChange={(e) => onUpdateConfig({ ...config, v2rayPath: e.target.value })}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">Vacío = /</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Encabezado Host</label>
                <input
                  type="text"
                  placeholder="ej. cdn.dominio.com o bug host"
                  value={config.sni || config.bugHost || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateConfig({ ...config, sni: val, bugHost: val });
                  }}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {transportType === 'grpc' && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  ServiceName (gRPC)
                </label>
                <input
                  type="text"
                  placeholder="grpc-service"
                  value={config.grpcServiceName || config.v2rayPath || 'grpc-service'}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      grpcServiceName: e.target.value,
                      v2rayPath: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Modo gRPC</label>
                <div className="flex gap-2">
                  {[
                    { id: 'gun' as const, label: 'gun (Estándar)' },
                    { id: 'multi' as const, label: 'multi' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setGrpcMode(m.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold ${
                        grpcMode === m.id
                          ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'border border-slate-800 bg-[#0d121b] text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {transportType === 'tcp' && (
            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-semibold text-slate-300">
                Tipo de Encabezado TCP (Header Type)
              </label>
              <select
                value={headerType}
                onChange={(e) => {
                  setHeaderType(e.target.value);
                  onUpdateConfig({ ...config, v2rayHeaderType: e.target.value });
                }}
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="none">none (Sin ofuscación)</option>
                <option value="http">http (Ofuscación HTTP Fake)</option>
              </select>
            </div>
          )}

          {transportType === 'kcp' && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Tipo de Encabezado mKCP
                </label>
                <select
                  value={headerType}
                  onChange={(e) => {
                    setHeaderType(e.target.value);
                    onUpdateConfig({ ...config, v2rayHeaderType: e.target.value });
                  }}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="none">none</option>
                  <option value="srtp">srtp (Video llamada)</option>
                  <option value="utp">utp (BitTorrent)</option>
                  <option value="wechat-video">wechat-video</option>
                  <option value="dtls">dtls</option>
                  <option value="wireguard">wireguard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  KCP Seed (Clave de ofuscación)
                </label>
                <input
                  type="text"
                  placeholder="KCP Seed (Opcional)"
                  value={kcpSeed}
                  onChange={(e) => {
                    setKcpSeed(e.target.value);
                    onUpdateConfig({ ...config, kcpSeed: e.target.value });
                  }}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {transportType === 'quic' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Seguridad QUIC</label>
                <select
                  value={quicSecurity}
                  onChange={(e) => {
                    setQuicSecurity(e.target.value);
                    onUpdateConfig({ ...config, quicSecurity: e.target.value });
                  }}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="none">none</option>
                  <option value="aes-128-gcm">aes-128-gcm</option>
                  <option value="chacha20-poly1305">chacha20-poly1305</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Clave QUIC</label>
                <input
                  type="text"
                  placeholder="Key"
                  value={quicKey}
                  onChange={(e) => {
                    setQuicKey(e.target.value);
                    onUpdateConfig({ ...config, quicKey: e.target.value });
                  }}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. SECCIÓN: SEGURIDAD (Video 00:22 - 00:35)                               */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Seguridad
              </span>
            </div>
          </div>

          {/* Activar Seguridad Switch */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Activar seguridad</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityEnabled}
                onChange={(e) => {
                  setSecurityEnabled(e.target.checked);
                  onUpdateConfig({ ...config, v2rayTls: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          {securityEnabled && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-fade-in">
              {/* Security Type Selector (Reality is only supported by VLESS) */}
              <div className="flex gap-2">
                {[
                  { id: 'tls' as const, label: 'TLS (Estándar)' },
                  ...(v2rayType === 'vless' ? [{ id: 'reality' as const, label: 'Reality (Xray)' }] : []),
                ].map((s) => {
                  const isSelected = securityType === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSecurityType(s.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                          : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SNI (Server Name Indication) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  SNI (Server Name Indication)
                </label>
                <input
                  type="text"
                  placeholder="ej. start.freenethn.org o vacio"
                  value={config.sni || ''}
                  onChange={(e) => onUpdateConfig({ ...config, sni: e.target.value })}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">
                  Vacío = usa la dirección del servidor
                </p>
              </div>

              {/* Fingerprint (uTLS) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Fingerprint (uTLS)
                </label>
                <select
                  value={fingerprint}
                  onChange={(e) => setFingerprint(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="chrome">chrome</option>
                  <option value="firefox">firefox</option>
                  <option value="safari">safari</option>
                  <option value="ios">ios</option>
                  <option value="random">random</option>
                  <option value="none">none (sin huella)</option>
                </select>
                <p className="text-[10px] text-slate-400">None = sin huella uTLS</p>
              </div>

              {/* ALPN */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">ALPN</label>
                <input
                  type="text"
                  placeholder="h2, http/1.1"
                  value={alpn}
                  onChange={(e) => setAlpn(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">Vacío = h2, http/1.1</p>
              </div>

              {/* Permitir inseguro */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5 pr-3">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Permitir inseguro
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Omite la verificación del certificado del servidor. Activalo solo si confías en el servidor.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={allowInsecure}
                    onChange={(e) => setAllowInsecure(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                </label>
              </div>

              {/* Reality Parameters (when security is reality) */}
              {securityType === 'reality' && (
                <div className="space-y-3 p-3 bg-[#0a0e16]/80 border border-cyan-500/30 rounded-xl animate-fade-in">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Parámetros VLESS / Reality</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Public Key (pbk)
                    </label>
                    <input
                      type="text"
                      placeholder="ej. 6a7b8c... (Clave pública Reality)"
                      value={config.realityPublicKey || ''}
                      onChange={(e) => onUpdateConfig({ ...config, realityPublicKey: e.target.value })}
                      className="w-full bg-[#0a0e16] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Short ID (sid)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. 0123456789abcdef"
                        value={config.realityShortId || ''}
                        onChange={(e) => onUpdateConfig({ ...config, realityShortId: e.target.value })}
                        className="w-full bg-[#0a0e16] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        SpiderX (spx)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. / o vacío"
                        value={config.realitySpiderX || ''}
                        onChange={(e) => onUpdateConfig({ ...config, realitySpiderX: e.target.value })}
                        className="w-full bg-[#0a0e16] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de configuración ECH */}
              <div className="space-y-1 pt-1">
                <input
                  type="text"
                  placeholder="Lista de configuración ECH"
                  value={echConfig}
                  onChange={(e) => setEchConfig(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">
                  Opcional — completá solo si tu proveedor te lo da
                </p>
              </div>

              {/* Certificado fijado (SHA-256) */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Certificado fijado (SHA-256)"
                  value={pinnedCert}
                  onChange={(e) => setPinnedCert(e.target.value)}
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">
                  Opcional — completá solo si tu proveedor te lo da
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. SECCIÓN: MUX (Para VLESS, VMess y Trojan)                              */}
        {/* ========================================================================= */}
        {(v2rayType === 'vless' || v2rayType === 'vmess' || v2rayType === 'trojan') && (
          <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Mux</span>
            </div>

            {/* Activar Mux Switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-3">
                <span className="text-xs font-semibold text-slate-200 block">Activar Mux</span>
                <span className="text-[10px] text-slate-400 block">
                  Multiplexa varias conexiones sobre una sola conexión outbound.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={muxEnabled}
                  onChange={(e) => setMuxEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>

            {muxEnabled && (
              <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fade-in">
                {/* Concurrencia Mux */}
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Concurrencia Mux"
                    value={muxConcurrency}
                    onChange={(e) => setMuxConcurrency(e.target.value)}
                    className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400">Vacío = 8</p>
                </div>

                {/* Concurrencia XUDP */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Concurrencia XUDP
                  </label>
                  <select
                    value={xudpConcurrency}
                    onChange={(e) => setXudpConcurrency(e.target.value)}
                    className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="allow">allow</option>
                    <option value="reject">reject</option>
                    <option value="skip">skip</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Opcional — completá solo si tu proveedor te lo da · XUDP para UDP 443
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil V2Ray guardado correctamente</span>
        </div>
      )}

      {/* Floating Action Button '+' */}
      <div className="fixed bottom-20 right-5 z-30">
        <button
          type="button"
          onClick={() => {
            setSavedToast(true);
            setTimeout(() => setSavedToast(false), 2500);
          }}
          className="w-13 h-13 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all ring-4 ring-sky-500/20"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

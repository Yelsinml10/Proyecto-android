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
  Shield,
  Zap,
  Sliders,
  Eye,
  EyeOff,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface HysteriaProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const HysteriaProtocolScreen: React.FC<HysteriaProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [version, setVersion] = useState<1 | 2>(config.hysteriaVersion || 2);
  const [showPassword, setShowPassword] = useState(false);
  const [obfsType, setObfsType] = useState<'salamander' | 'none'>(config.obfsType || 'none');
  const [allowInsecure, setAllowInsecure] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Paste & parse Hysteria v1 and v2 links & configs
  const handlePasteHy = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setNotification('Portapapeles vacío. Copia un enlace hy2:// o hysteria://');
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      const clean = text.trim();

      // Case 1: Hysteria 2 URI (hy2:// or hysteria2://)
      if (clean.startsWith('hy2://') || clean.startsWith('hysteria2://')) {
        try {
          const parsedUrl = new URL(clean);
          const auth = decodeURIComponent(parsedUrl.username || parsedUrl.password || '');
          const host = parsedUrl.hostname;
          const portStr = parsedUrl.port;
          const sni = parsedUrl.searchParams.get('sni') || parsedUrl.searchParams.get('peer') || host;
          const obfs = parsedUrl.searchParams.get('obfs');
          const obfsPassword = parsedUrl.searchParams.get('obfs-password') || '';
          const insecure = parsedUrl.searchParams.get('insecure') === '1' || parsedUrl.searchParams.get('allowInsecure') === '1';
          const up = parsedUrl.searchParams.get('up') || parsedUrl.searchParams.get('upmbps');
          const down = parsedUrl.searchParams.get('down') || parsedUrl.searchParams.get('downmbps');

          const isPortHopping = portStr && (portStr.includes('-') || portStr.includes(','));

          setVersion(2);
          setObfsType(obfs === 'salamander' ? 'salamander' : 'none');
          setAllowInsecure(insecure);

          onUpdateConfig({
            ...config,
            protocol: 'hysteria_v2',
            hysteriaVersion: 2,
            server: host,
            port: isPortHopping ? 443 : parseInt(portStr) || 443,
            portHopping: isPortHopping ? portStr : undefined,
            authPassword: auth,
            sni: sni,
            obfsType: obfs === 'salamander' ? 'salamander' : 'none',
            obfsKey: obfsPassword,
            upMbps: up ? parseInt(up) : config.upMbps,
            downMbps: down ? parseInt(down) : config.downMbps,
            hy2Uri: clean,
          });

          setNotification('✓ ¡Enlace Hysteria v2 importado con éxito!');
          setTimeout(() => setNotification(null), 3000);
          return;
        } catch (e) {
          // fallthrough
        }
      }

      // Case 2: Hysteria 1 URI (hysteria://)
      if (clean.startsWith('hysteria://')) {
        try {
          const parsedUrl = new URL(clean);
          const authParam = parsedUrl.searchParams.get('auth') || parsedUrl.searchParams.get('auth_str');
          const auth = decodeURIComponent(parsedUrl.username || parsedUrl.password || authParam || '');
          const host = parsedUrl.hostname;
          const portStr = parsedUrl.port;
          const sni = parsedUrl.searchParams.get('peer') || parsedUrl.searchParams.get('sni') || host;
          const obfs = parsedUrl.searchParams.get('obfs') || '';
          const up = parsedUrl.searchParams.get('upmbps') || parsedUrl.searchParams.get('up');
          const down = parsedUrl.searchParams.get('downmbps') || parsedUrl.searchParams.get('down');
          const insecure = parsedUrl.searchParams.get('insecure') === '1';

          setVersion(1);
          setObfsType(obfs ? 'salamander' : 'none');
          setAllowInsecure(insecure);

          onUpdateConfig({
            ...config,
            protocol: 'hysteria_v1',
            hysteriaVersion: 1,
            server: host,
            port: parseInt(portStr) || 443,
            portHopping: undefined,
            authPassword: auth,
            sni: sni,
            obfsType: obfs ? 'salamander' : 'none',
            obfsKey: obfs,
            upMbps: up ? parseInt(up) : config.upMbps,
            downMbps: down ? parseInt(down) : config.downMbps,
          });

          setNotification('✓ ¡Enlace Hysteria v1 importado con éxito!');
          setTimeout(() => setNotification(null), 3000);
          return;
        } catch (e) {
          // fallthrough
        }
      }

      // Case 3: JSON Config
      if (clean.startsWith('{') && clean.endsWith('}')) {
        try {
          const json = JSON.parse(clean);
          const isV2 = Boolean(json.auth || json.obfs?.type || json.tls);
          const serverStr = json.server || '';
          const [host, port] = serverStr.split(':');

          setVersion(isV2 ? 2 : 1);

          onUpdateConfig({
            ...config,
            protocol: isV2 ? 'hysteria_v2' : 'hysteria_v1',
            hysteriaVersion: isV2 ? 2 : 1,
            server: host || config.server,
            port: parseInt(port) || config.port || 443,
            authPassword: json.auth || json.auth_str || config.authPassword,
            sni: json.tls?.sni || json.server_name || config.sni,
            obfsType: json.obfs?.type === 'salamander' || json.obfs ? 'salamander' : 'none',
            obfsKey: json.obfs?.salamander?.password || json.obfs || '',
            upMbps: json.bandwidth?.up ? parseInt(json.bandwidth.up) : json.up_mbps,
            downMbps: json.bandwidth?.down ? parseInt(json.bandwidth.down) : json.down_mbps,
          });

          setNotification(`✓ Configuración JSON Hysteria v${isV2 ? '2' : '1'} importada`);
          setTimeout(() => setNotification(null), 3000);
          return;
        } catch {
          // fallthrough
        }
      }

      setNotification('Formato no reconocido. Usa un enlace hy2://, hysteria:// o JSON');
      setTimeout(() => setNotification(null), 3500);
    } catch {
      setNotification('No se pudo acceder al portapapeles');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="min-h-full bg-[#0a0e16] text-slate-200 pb-24 select-none">
      {/* Top App Bar */}
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
          <h1 className="text-base font-bold text-white tracking-wide">Hysteria UDP</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePasteHy}
            className="p-1.5 text-slate-300 hover:text-cyan-400 rounded-lg active:bg-slate-800 transition-colors"
            title="Pegar URI hy2://, hysteria:// o JSON"
          >
            <Clipboard className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {notification && (
        <div className="max-w-xl mx-auto px-4 pt-3">
          <div className="p-3 bg-cyan-950/80 border border-cyan-700/80 rounded-xl text-xs text-cyan-300 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Versión de Hysteria */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Versión del Protocolo
            </span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 2 as const, label: 'Hysteria v2 (Recomendado QUIC)' },
              { id: 1 as const, label: 'Hysteria v1' },
            ].map((v) => {
              const isSelected = version === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVersion(v.id);
                    onUpdateConfig({
                      ...config,
                      hysteriaVersion: v.id,
                      protocol: v.id === 2 ? 'hysteria_v2' : 'hysteria_v1',
                    });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                      : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. SECCIÓN: SERVIDOR */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Servidor</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Host:puerto / Port Hopping
            </label>
            <input
              type="text"
              placeholder="hy2.servidor.com:443 o hy2.servidor.com:20000-50000"
              value={
                config.server
                  ? `${config.server}:${config.portHopping || config.port || 443}`
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(':')) {
                  const parts = val.split(':');
                  const portPart = parts[1];
                  if (portPart.includes('-') || portPart.includes(',')) {
                    onUpdateConfig({
                      ...config,
                      server: parts[0],
                      portHopping: portPart,
                    });
                  } else {
                    onUpdateConfig({
                      ...config,
                      server: parts[0],
                      port: parseInt(portPart) || 443,
                      portHopping: undefined,
                    });
                  }
                } else {
                  onUpdateConfig({ ...config, server: val });
                }
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400">
              Soporta puerto único (443) o rango de port hopping (ej. 20000-50000).
            </p>
          </div>
        </div>

        {/* 2. SECCIÓN: AUTENTICACIÓN */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Autenticación
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Contraseña / Auth Token
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Auth password / token"
                value={config.authPassword || ''}
                onChange={(e) => onUpdateConfig({ ...config, authPassword: e.target.value })}
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN: OFUSCACIÓN (OBFS) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ofuscación (Obfs)
            </span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'none' as const, label: 'Sin ofuscación' },
              { id: 'salamander' as const, label: 'Salamander Obfs' },
            ].map((o) => {
              const isSelected = obfsType === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setObfsType(o.id);
                    onUpdateConfig({ ...config, obfsType: o.id });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                      : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>

          {obfsType === 'salamander' && (
            <div className="space-y-1 pt-1 animate-fade-in">
              <label className="text-[11px] font-semibold text-slate-300">
                Clave Salamander
              </label>
              <input
                type="text"
                placeholder="Clave de ofuscación"
                value={config.obfsKey || ''}
                onChange={(e) => onUpdateConfig({ ...config, obfsKey: e.target.value })}
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* 4. SECCIÓN: TLS / SNI */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              TLS / SNI
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              SNI (Server Name Indication)
            </label>
            <input
              type="text"
              placeholder="ej. paquetes1.miclaro.com.hn o dejar vacío"
              value={config.sni || ''}
              onChange={(e) => onUpdateConfig({ ...config, sni: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-semibold text-slate-200 block">Permitir inseguro</span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                Ignorar verificación del certificado SSL/TLS.
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
        </div>

        {/* 5. SECCIÓN: LÍMITES DE VELOCIDAD (OPCIONAL) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ancho de Banda (Mbps)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Subida (Up Mbps)</label>
              <input
                type="number"
                placeholder="50"
                value={config.upMbps || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    upMbps: parseInt(e.target.value) || undefined,
                  })
                }
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Bajada (Down Mbps)</label>
              <input
                type="number"
                placeholder="100"
                value={config.downMbps || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    downMbps: parseInt(e.target.value) || undefined,
                  })
                }
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil Hysteria guardado</span>
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

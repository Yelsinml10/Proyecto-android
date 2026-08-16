import React, { useState } from 'react';
import {
  Menu,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  ArrowLeft,
  Sparkles,
  Server,
  Key,
  User,
  Shield,
  Radio,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface SshProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
  onOpenPayloadModal?: () => void;
}

export const SshProtocolScreen: React.FC<SshProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
  onOpenPayloadModal,
}) => {
  const [usePayload, setUsePayload] = useState(config.enablePayload ?? true);
  const [isPayloadCollapsed, setIsPayloadCollapsed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'enhanced' | 'tls'>(
    config.enableSni ? 'tls' : 'enhanced'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [remoteProxy, setRemoteProxy] = useState(config.remoteProxy || '');
  const [savedToast, setSavedToast] = useState(false);

  const defaultPayload =
    config.payload ||
    'HEAD / HTTP/1.1[lf]Host: [host][lf][lf]GET / HTTP/1.1[lf]Host: [rotate=start.freenethn.org][lf]Connection: Upgrade[lf]User-Agent:[lf]Upgrade:';

  return (
    <div className="min-h-full bg-[#0a0e16] text-slate-200 pb-24 select-none">
      {/* Top App Bar (Exact HTTP Custom SSH Style) */}
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
          <h1 className="text-base font-bold text-white tracking-wide">SSH</h1>
        </div>

        <button
          type="button"
          className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Usar payload Toggle Card (Video 00:05) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Usar payload</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPayloadCollapsed(!isPayloadCollapsed)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                {isPayloadCollapsed ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePayload}
                  onChange={(e) => {
                    setUsePayload(e.target.checked);
                    onUpdateConfig({ ...config, enablePayload: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>
          </div>

          {!isPayloadCollapsed && usePayload && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-fade-in">
              {/* Método Chips (Enhanced / TLS) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Método</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'enhanced', label: 'Enhanced' },
                    { id: 'tls', label: 'TLS' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(m.id as any);
                        if (m.id === 'tls') {
                          onUpdateConfig({ ...config, enableSni: true });
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedMethod === m.id
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm'
                          : 'border-slate-800 bg-[#0d121b] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SNI (Server Name Indication) - Shown when TLS method is selected */}
              {selectedMethod === 'tls' && (
                <div className="space-y-1.5 p-3 bg-[#0d131d] border border-cyan-500/30 rounded-xl animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SNI (Server Name Indication)</span>
                    </label>
                    <span className="text-[10px] text-cyan-400/80 font-mono">TLS SSL</span>
                  </div>
                  <input
                    type="text"
                    placeholder="ej. start.freenethn.org o paquetes1.miclaro.com.hn"
                    value={config.sni || ''}
                    onChange={(e) => onUpdateConfig({ ...config, sni: e.target.value })}
                    className="w-full bg-[#0a0e16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Host SNI para el protocolo TLS/SSL (Bug Host o CDN).
                  </p>
                </div>
              )}

              {/* Payload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                    <span>Payload</span>
                  </label>
                  {onOpenPayloadModal && (
                    <button
                      type="button"
                      onClick={onOpenPayloadModal}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Generar</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">
                    Payload personalizado
                  </label>
                  <textarea
                    rows={4}
                    value={config.payload ?? defaultPayload}
                    onChange={(e) => onUpdateConfig({ ...config, payload: e.target.value })}
                    className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                {/* Proxy Remoto */}
                <div className="space-y-1 pt-1">
                  <input
                    type="text"
                    placeholder="Proxy remoto"
                    value={remoteProxy}
                    onChange={(e) => {
                      setRemoteProxy(e.target.value);
                      onUpdateConfig({ ...config, remoteProxy: e.target.value });
                    }}
                    className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Usa host:puerto. Agrega usuario:contraseña@ antes del host si hace falta. IPv6: [2001:db8::1]:80 o usuario:contraseña@[2001:db8::1]:80.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cuenta Section (Video 00:08 - 00:10) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cuenta</span>
          </div>

          {/* Host:puerto SSH */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Host:puerto SSH</label>
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
              Usa host:puerto, por ejemplo ssh.example.com:22 o [2001:db8::1]:22
            </p>
          </div>

          {/* Usuario SSH */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Usuario SSH</label>
            <input
              type="text"
              placeholder="Abiel"
              value={config.sshUser || config.username || ''}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  sshUser: e.target.value,
                  username: e.target.value,
                })
              }
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Contraseña SSH */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Contraseña SSH</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={config.sshPassword || config.password || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    sshPassword: e.target.value,
                    password: e.target.value,
                  })
                }
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil SSH guardado correctamente</span>
        </div>
      )}

      {/* Floating Action Button '+' (Video 00:05) */}
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

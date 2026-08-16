import React, { useState } from 'react';
import {
  Menu,
  MoreVertical,
  Eye,
  EyeOff,
  Plus,
  ArrowLeft,
  Server,
  Key,
  User,
  Shield,
  Lock,
  Sliders,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface UdpCustomProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const UdpCustomProtocolScreen: React.FC<UdpCustomProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [autoSni, setAutoSni] = useState(true);
  const [allowInsecure, setAllowInsecure] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  return (
    <div className="min-h-full bg-[#0a0e16] text-slate-200 pb-24 select-none">
      {/* Top App Bar (Exact HTTP Custom UDP Custom Style - Video 00:54) */}
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
          <h1 className="text-base font-bold text-white tracking-wide">UDP Custom</h1>
        </div>

        <button
          type="button"
          className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* ========================================================================= */}
        {/* 1. SECCIÓN: SERVIDOR (Video 00:54)                                        */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Servidor</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Host:puerto del servidor
            </label>
            <input
              type="text"
              placeholder="paquetes1.miclaro.com.hn:7300"
              value={config.server ? `${config.server}:${config.port || 7300}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(':')) {
                  const parts = val.split(':');
                  onUpdateConfig({
                    ...config,
                    server: parts[0],
                    port: parseInt(parts[1]) || 7300,
                  });
                } else {
                  onUpdateConfig({ ...config, server: val });
                }
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Usa host:puerto, lista/rango de puertos o IPv6 entre corchetes. Ejemplo: example.com:1234,5000-6000 o [2001:db8::1]:36712
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SECCIÓN: CUENTA (Video 00:54)                                          */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cuenta</span>
          </div>

          {/* Usuario */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Usuario</label>
            <input
              type="text"
              placeholder="Usuario"
              value={config.sshUser || config.username || ''}
              onChange={(e) =>
                onUpdateConfig({
                  ...config,
                  sshUser: e.target.value,
                  username: e.target.value,
                })
              }
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={config.sshPassword || config.password || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    sshPassword: e.target.value,
                    password: e.target.value,
                  })
                }
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

        {/* ========================================================================= */}
        {/* 3. SECCIÓN: TLS (Video 00:56)                                             */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">TLS</span>
          </div>

          {/* SNI (Server Name Indication) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              SNI (Server Name Indication)
            </label>
            <input
              type="text"
              placeholder="Usando el host del servidor como SNI."
              value={config.sni || ''}
              onChange={(e) => onUpdateConfig({ ...config, sni: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400">Usando el host del servidor como SNI.</p>
          </div>

          {/* SNI automático Switch */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-semibold text-slate-200 block">SNI automático</span>
              <span className="text-[10px] text-slate-400 block">
                Usa el host del servidor cuando SNI está vacío.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSni}
                onChange={(e) => setAutoSni(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          {/* Permitir inseguro Switch */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-semibold text-slate-200 block">Permitir inseguro</span>
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
        </div>

        {/* ========================================================================= */}
        {/* 4. SECCIÓN: AJUSTES AVANZADOS UDP                                         */}
        {/* ========================================================================= */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Ajustes UDP</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">UDP Buffer (KB)</label>
              <input
                type="number"
                placeholder="4096"
                value={config.udpBuffer || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    udpBuffer: parseInt(e.target.value) || undefined,
                  })
                }
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">MTU UDP</label>
              <input
                type="number"
                placeholder="1500"
                value={config.udpMtu || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    udpMtu: parseInt(e.target.value) || undefined,
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
          <span>✓ Perfil UDP Custom guardado</span>
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

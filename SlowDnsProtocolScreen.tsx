import React, { useState } from 'react';
import {
  Menu,
  MoreVertical,
  Radio,
  Key,
  Globe,
  Plus,
  ArrowLeft,
  Server,
  SlidersHorizontal,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface SlowDnsProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const SlowDnsProtocolScreen: React.FC<SlowDnsProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
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
          <h1 className="text-base font-bold text-white tracking-wide">SlowDNS (DNSTT)</h1>
        </div>

        <button
          type="button"
          className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* 1. Resolver DNS (Arriba) */}
        <div className="bg-[#111722] border border-cyan-800/50 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Servidor DNS (Resolver)
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">DNS Server</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              IP del Servidor DNS Resolver
            </label>
            <input
              type="text"
              placeholder="ej. 8.8.8.8 o 1.1.1.1"
              value={config.dnsTargetResolver || '8.8.8.8'}
              onChange={(e) => onUpdateConfig({ ...config, dnsTargetResolver: e.target.value })}
              className="w-full bg-[#0a0e16] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[10px] text-slate-400">
              IP del servidor DNS que reenviará las consultas hacia tu túnel.
            </p>
          </div>
        </div>

        {/* 2. Registro NS Section (Requerido) */}
        <div className="bg-[#111722] border border-amber-800/50 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Registro NS (Nameserver)
              </span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Requerido</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-amber-300">
              Subdominio / Registro NS
            </label>
            <input
              type="text"
              placeholder="ej. ns1.tudominio.com o dns.servidor.net"
              value={config.dnsNameServer || ''}
              onChange={(e) => onUpdateConfig({ ...config, dnsNameServer: e.target.value })}
              className="w-full bg-[#0a0e16] border border-amber-600/70 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-400">
              Apunta el registro tipo NS de tu subdominio a la IP de tu túnel DNSTT.
            </p>
          </div>
        </div>

        {/* 3. Clave Pública DNSTT */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Clave Pública DNSTT (64 Hex)
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="text"
              placeholder="8a3f4e2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f"
              value={config.dnsPubKey || ''}
              onChange={(e) => onUpdateConfig({ ...config, dnsPubKey: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 4. Cuenta Section (Usuario y Contraseña) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Cuenta SlowDNS
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Usuario SlowDNS / SSH
              </label>
              <input
                type="text"
                placeholder="ej. usuario1 o slowdns_user"
                value={config.username || config.sshUser || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    username: e.target.value,
                    sshUser: e.target.value,
                  })
                }
                className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={config.password || config.sshPassword || ''}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      password: e.target.value,
                      sshPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil SlowDNS guardado</span>
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

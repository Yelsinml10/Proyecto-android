import React, { useState } from 'react';
import {
  Menu,
  MoreVertical,
  Plus,
  ArrowLeft,
  Server,
  Key,
  User,
  Shield,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface OpenVPNProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const OpenVPNProtocolScreen: React.FC<OpenVPNProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [ovpnProto, setOvpnProto] = useState<'udp' | 'tcp'>(config.ovpnProtocol || 'tcp');
  const [savedToast, setSavedToast] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onUpdateConfig({
            ...config,
            ovpnConfig: text,
          });
        }
      };
      reader.readAsText(file);
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
          <h1 className="text-base font-bold text-white tracking-wide">OpenVPN</h1>
        </div>

        <button
          type="button"
          className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Protocolo Transporte */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Transporte OpenVPN
            </span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'tcp' as const, label: 'OpenVPN TCP (Recomendado para Payload / SSL)' },
              { id: 'udp' as const, label: 'OpenVPN UDP' },
            ].map((p) => {
              const isSelected = ovpnProto === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setOvpnProto(p.id);
                    onUpdateConfig({ ...config, ovpnProtocol: p.id });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                      : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                  <span>{p.label}</span>
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
              Host:puerto OpenVPN
            </label>
            <input
              type="text"
              placeholder="vpn.example.com:1194"
              value={config.server ? `${config.server}:${config.port || 1194}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(':')) {
                  const parts = val.split(':');
                  onUpdateConfig({
                    ...config,
                    server: parts[0],
                    port: parseInt(parts[1]) || 1194,
                  });
                } else {
                  onUpdateConfig({ ...config, server: val });
                }
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 2. SECCIÓN: CUENTA */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cuenta OpenVPN</span>
          </div>

          {/* Usuario */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Usuario</label>
            <input
              type="text"
              placeholder="Usuario OpenVPN"
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

        {/* 3. SECCIÓN: PROXY REMOTO (HTTP / SSL) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Proxy Remoto / Encabezado
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Proxy Remoto (IP:Puerto)
            </label>
            <input
              type="text"
              placeholder="ej. 104.22.4.2:80 o proxy.example.com:8080"
              value={config.remoteProxy || ''}
              onChange={(e) => onUpdateConfig({ ...config, remoteProxy: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400">
              Usa host:puerto para hacer túnel OpenVPN a través de Squid/HTTP Proxy.
            </p>
          </div>
        </div>

        {/* 4. SECCIÓN: ARCHIVO DE CONFIGURACIÓN (.OVPN) */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Configuración .ovpn
              </span>
            </div>

            <label className="cursor-pointer px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 rounded-lg text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5 active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar .ovpn</span>
              <input
                type="file"
                accept=".ovpn,.txt,.conf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={5}
            placeholder={`client\ndev tun\nproto tcp\nremote 104.22.4.2 1194\nresolv-retry infinite\nnobind\npersist-key\npersist-tun\nauth-user-pass`}
            value={config.ovpnConfig || ''}
            onChange={(e) => onUpdateConfig({ ...config, ovpnConfig: e.target.value })}
            className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil OpenVPN guardado</span>
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

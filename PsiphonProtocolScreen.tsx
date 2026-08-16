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
  Eye,
  EyeOff,
  Globe,
  Sliders,
  Check,
} from 'lucide-react';
import { VpnConfig } from '../../types';

interface PsiphonProtocolScreenProps {
  config: VpnConfig;
  onUpdateConfig: (updated: VpnConfig) => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export const PsiphonProtocolScreen: React.FC<PsiphonProtocolScreenProps> = ({
  config,
  onUpdateConfig,
  onBack,
  onOpenDrawer,
}) => {
  const [region, setRegion] = useState(config.country || 'US');
  const [tunnelMode, setTunnelMode] = useState<'ssl' | 'udp'>(config.ziMode || 'ssl');
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
          <h1 className="text-base font-bold text-white tracking-wide">Psiphon / ZiVPN</h1>
        </div>

        <button
          type="button"
          className="p-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Modo de Túnel */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Modo de Transporte
            </span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'ssl' as const, label: 'SSL / TLS Fronting' },
              { id: 'udp' as const, label: 'ZiVPN UDP Hybla' },
            ].map((m) => {
              const isSelected = tunnelMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setTunnelMode(m.id);
                    onUpdateConfig({ ...config, ziMode: m.id });
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                      : 'border border-slate-800 bg-[#0d121b] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Región de Salida */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Región de Salida
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              País del servidor
            </label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                onUpdateConfig({ ...config, country: e.target.value });
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="AUTO">Mejor rendimiento (Automático)</option>
              <option value="US">Estados Unidos (US)</option>
              <option value="CA">Canadá (CA)</option>
              <option value="DE">Alemania (DE)</option>
              <option value="GB">Reino Unido (GB)</option>
              <option value="NL">Países Bajos (NL)</option>
              <option value="SG">Singapur (SG)</option>
              <option value="JP">Japón (JP)</option>
            </select>
          </div>
        </div>

        {/* Encabezados y Bug Host */}
        <div className="bg-[#111722] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-800/80">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Encabezados HTTP / SNI
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Bug Host / Dominio SNI Fronting
            </label>
            <input
              type="text"
              placeholder="paquetes1.miclaro.com.hn"
              value={config.sni || config.bugHost || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateConfig({ ...config, sni: val, bugHost: val });
              }}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-400">
              Host para bypass de proxy o TLS fronting
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              ZiVPN Key / Token de autenticación (Opcional)
            </label>
            <input
              type="text"
              placeholder="zi-key-auth-token-..."
              value={config.ziKey || ''}
              onChange={(e) => onUpdateConfig({ ...config, ziKey: e.target.value })}
              className="w-full bg-[#0a0e16] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-300 border border-emerald-600/80 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          <span>✓ Perfil Psiphon/ZiVPN guardado</span>
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

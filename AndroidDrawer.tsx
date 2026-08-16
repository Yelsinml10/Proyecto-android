import React from 'react';
import {
  X,
  Smartphone,
  Info,
} from 'lucide-react';
import { VpnProtocol } from '../types';
import { AppTheme } from '../utils/themeConfig';

interface AndroidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProtocol: VpnProtocol;
  onSelectProtocol: (protocol: VpnProtocol) => void;
  onOpenDeviceId: () => void;
  onOpenAbout: () => void;
  theme?: AppTheme;
}

export const AndroidDrawer: React.FC<AndroidDrawerProps> = ({
  isOpen,
  onClose,
  currentProtocol,
  onSelectProtocol,
  onOpenDeviceId,
  onOpenAbout,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className="relative w-72 max-w-[80vw] text-slate-200 h-full shadow-2xl flex flex-col z-10 animate-slide-right overflow-y-auto border-r"
        style={{
          backgroundColor: theme?.previewColors.card || '#111722',
          borderColor: theme?.previewColors.border || '#1e293b',
        }}
      >
        {/* Drawer Header (Exact Video 00:01) */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{
            backgroundColor: theme?.previewColors.bg || '#0a0e16',
            borderColor: theme?.previewColors.border || '#1e293b',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hexagon Logo */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg font-black text-xl"
              style={{
                backgroundColor: theme?.previewColors.primary || '#f59e0b',
                boxShadow: `0 8px 16px -4px ${theme?.glowColor || 'rgba(245, 158, 11, 0.3)'}`,
              }}
            >
              ⬡
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>VPN PROXY HN</span>
                <span
                  className="text-[10px] px-1 rounded border font-mono font-bold"
                  style={{
                    color: theme?.previewColors.primary || '#22d3ee',
                    backgroundColor: `${theme?.previewColors.primary || '#06b6d4'}20`,
                    borderColor: `${theme?.previewColors.primary || '#06b6d4'}50`,
                  }}
                >
                  v7.9
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                2026 © ePro Dev Team • Patch 2 (763)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Body */}
        <div className="flex-1 py-3 px-2 space-y-4 text-xs font-medium">
          {/* Section: Conexión */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Seleccionar Protocolo
            </span>

            {/* Protocol Buttons with Square Badges */}
            {[
              { id: 'ssh_ws' as const, label: 'SSH', badge: 'S' },
              { id: 'v2ray_xray' as const, label: 'V2Ray', badge: 'V' },
              { id: 'zivpn' as const, label: 'Psiphon', badge: 'P' },
              { id: 'openvpn' as const, label: 'OpenVPN', badge: 'O' },
              { id: 'udp_custom' as const, label: 'UDP Custom', badge: 'U' },
              { id: 'slowdns' as const, label: 'SlowDNS', badge: 'D' },
              { id: 'hysteria_v2' as const, label: 'Hysteria', badge: 'H' },
            ].map((p) => {
              const isSelected = currentProtocol === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectProtocol(p.id);
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20'
                      : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono font-black text-slate-300 flex items-center justify-center">
                      {p.badge}
                    </span>
                    <span>{p.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Section: Dispositivo */}
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dispositivo
            </span>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeviceId();
              }}
              className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/70 flex items-center gap-3.5 text-slate-300 hover:text-white transition-colors"
            >
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>ID del dispositivo</span>
            </button>
          </div>
        </div>

        {/* Drawer Footer: Acerca de */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0e131d]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAbout();
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800/70 flex items-center gap-3.5 text-slate-300 hover:text-white transition-colors text-xs"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>Acerca de</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { VpnProtocol } from '../types';
import {
  Globe,
  Shield,
  Zap,
  Radio,
  Flame,
  Gauge,
  Layers,
  KeyRound,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { getProtocolDisplayName, getProtocolBadgeColor } from '../utils/formatters';

interface ProtocolSelectorProps {
  selectedProtocol: VpnProtocol;
  onSelectProtocol: (protocol: VpnProtocol) => void;
  onOpenProtocolModal?: () => void;
}

const QUICK_PROTOCOLS: { id: VpnProtocol; label: string; icon: React.ElementType; badge: string }[] = [
  { id: 'ssh_ws', label: 'SSH WS', icon: Globe, badge: 'HTTP/CDN' },
  { id: 'ssh_ssl', label: 'SSL/TLS', icon: Shield, badge: 'SNI Direct' },
  { id: 'v2ray_xray', label: 'V2Ray', icon: Zap, badge: 'Reality' },
  { id: 'slowdns', label: 'SlowDNS', icon: Radio, badge: 'Sin Saldo' },
  { id: 'hysteria_v2', label: 'Hysteria2', icon: Flame, badge: 'QUIC' },
  { id: 'udp_custom', label: 'UDP Custom', icon: Gauge, badge: '7300' },
  { id: 'zivpn', label: 'ZiVPN', icon: KeyRound, badge: 'ZiKey' },
];

export const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({
  selectedProtocol,
  onSelectProtocol,
  onOpenProtocolModal,
}) => {
  const badgeColors = getProtocolBadgeColor(selectedProtocol);

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 space-y-3 shadow-lg">
      {/* Top bar: Active protocol info & change button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Protocolo de Túnel Activo
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                8 Integrados
              </span>
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{getProtocolDisplayName(selectedProtocol)}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
              >
                Configurado
              </span>
            </div>
          </div>
        </div>

        {/* Change Protocol Button (Opens Modal from here too) */}
        {onOpenProtocolModal && (
          <button
            onClick={onOpenProtocolModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Abrir lista de todos los protocolos"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Todos / Cambiar</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Scrollable Protocol Pills for 1-click access */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {QUICK_PROTOCOLS.map((p) => {
          const IconComp = p.icon;
          const isSelected = selectedProtocol === p.id;

          return (
            <button
              key={p.id}
              onClick={() => onSelectProtocol(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm font-bold ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800/80'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{p.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-500'
                }`}
              >
                {p.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

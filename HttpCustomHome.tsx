import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Globe,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
} from 'lucide-react';
import { VpnConfig, VpnProtocol, ConnectionStatus, NetworkStats } from '../types';

interface HttpCustomHomeProps {
  config: VpnConfig;
  status: ConnectionStatus;
  networkStats: NetworkStats;
  onUpdateConfig: (updated: VpnConfig) => void;
  onToggleConnect: () => void;
  onOpenProtocolModal: () => void;
  onOpenPayloadModal: () => void;
  onOpenConfigModal: () => void;
  onSelectProtocol: (protocol: VpnProtocol) => void;
  onOpenProtocolView: (protocol: VpnProtocol) => void;
}

export const HttpCustomHome: React.FC<HttpCustomHomeProps> = ({
  config,
  status,
  networkStats,
  onToggleConnect,
  onOpenConfigModal,
  onSelectProtocol,
  onOpenProtocolView,
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const isConnected = status === 'CONNECTED';
  const isConnecting =
    status === 'CONNECTING' || status === 'AUTHENTICATING' || status === 'HANDSHAKE';

  // Format speed string like "0 B/s", "124 KB/s", "1.5 MB/s"
  const formatSpeed = (kbps: number) => {
    if (!isConnected || kbps === 0) return '0 B/s';
    if (kbps < 1024) return `${kbps.toFixed(0)} KB/s`;
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  };

  const getProtocolLabel = (proto: VpnProtocol) => {
    switch (proto) {
      case 'ssh_ws':
      case 'ssh_ssl':
        return 'SSH';
      case 'v2ray_xray':
        return 'V2Ray';
      case 'zivpn':
        return 'Psiphon';
      case 'udp_custom':
        return 'UDP Custom';
      case 'slowdns':
        return 'SlowDNS';
      case 'hysteria_v2':
      case 'hysteria_v1':
        return 'Hysteria';
      default:
        return 'SSH';
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-16 select-none">
      {/* ========================================================================= */}
      {/* 1. SPEED & NETWORK STATUS MONITOR (Exact Video 00:00 & 00:06)              */}
      {/* ========================================================================= */}
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between px-2">
          {/* Download Speed */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <ArrowDown className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
              <span>Descarga</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {formatSpeed(networkStats.downloadSpeed)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Pico {formatSpeed(networkStats.downloadSpeed > 0 ? networkStats.downloadSpeed * 1.2 : 0)}
            </div>
          </div>

          {/* Connection Status Pill Badge (Center) */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={onToggleConnect}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border shadow-lg transition-all active:scale-95 ${
                isConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 animate-pulse'
                  : isConnecting
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600/70 animate-pulse'
                  : 'bg-[#151c28] text-slate-400 border-slate-700/80 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : isConnecting
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-slate-500'
                }`}
              />
              <span>
                {isConnected
                  ? 'Conectado'
                  : isConnecting
                  ? 'Conectando'
                  : 'Inactivo'}
              </span>
            </button>
          </div>

          {/* Upload Speed */}
          <div className="space-y-0.5 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-rose-400 font-bold">
              <span>Subida</span>
              <ArrowUp className="w-4 h-4 text-rose-400 stroke-[2.5]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {formatSpeed(networkStats.uploadSpeed)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Pico {formatSpeed(networkStats.uploadSpeed > 0 ? networkStats.uploadSpeed * 1.2 : 0)}
            </div>
          </div>
        </div>

        {/* Local IP Badge at Bottom Right (Exact Video 00:00) */}
        <div className="flex justify-end items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-2 pr-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{networkStats.virtualIp || '192.168.1.77'}</span>
        </div>
      </div>

      <div className="h-px bg-slate-800/80 w-full" />

      {/* ========================================================================= */}
      {/* 2. ACCORDION: CONEXIÓN PRINCIPAL (Exact Video 00:00 & 00:14 - 00:15)       */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Accordion Toggle Header */}
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full py-2 px-1 flex items-center justify-between text-slate-200 hover:text-white transition-colors text-xs font-bold"
        >
          <span className="text-sm font-semibold text-slate-200">
            Conexión principal
          </span>
          {isAccordionOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Protocol Selector Pills (When Accordion is Open - Video 00:14 - 00:15) */}
        {isAccordionOpen && (
          <div className="space-y-3 animate-fade-in">
            {/* Grid of Rounded Protocol Pills for all 7 Protocols */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { id: 'ssh_ws' as const, label: 'SSH' },
                { id: 'v2ray_xray' as const, label: 'V2Ray' },
                { id: 'zivpn' as const, label: 'Psiphon' },
                { id: 'openvpn' as const, label: 'OpenVPN' },
                { id: 'udp_custom' as const, label: 'UDP Custom' },
                { id: 'slowdns' as const, label: 'SlowDNS' },
                { id: 'hysteria_v2' as const, label: 'Hysteria' },
              ].map((p) => {
                const isActive = config.protocol === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProtocol(p.id);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all active:scale-95 ${
                      isActive
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                        : 'border-slate-700/80 bg-[#141b26] hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Protocol Bar with "Ver" link (Video 00:04, 00:18, 00:44, 00:53) */}
        <div className="px-3 py-2.5 bg-[#121824] border border-slate-800/90 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Túnel único</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-bold text-slate-200">
              <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
              <span>{getProtocolLabel(config.protocol)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenProtocolView(config.protocol)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800"
          >
            <span>Ver</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

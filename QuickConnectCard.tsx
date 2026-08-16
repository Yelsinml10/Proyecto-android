import React from 'react';
import { Power, Activity, ArrowUp, ArrowDown, Clock, ShieldCheck, ChevronRight, Wifi, Lock } from 'lucide-react';
import { ConnectionStatus, VpnConfig, NetworkStats } from '../types';
import { formatBytes, formatSpeed, formatDuration, getProtocolDisplayName } from '../utils/formatters';

interface QuickConnectCardProps {
  status: ConnectionStatus;
  currentServer: VpnConfig;
  networkStats: NetworkStats;
  onToggleConnect: () => void;
  onOpenPayloadModal: () => void;
}

export const QuickConnectCard: React.FC<QuickConnectCardProps> = ({
  status,
  currentServer,
  networkStats,
  onToggleConnect,
  onOpenPayloadModal,
}) => {
  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING' || status === 'AUTHENTICATING' || status === 'HANDSHAKE';

  const getStatusLabel = () => {
    switch (status) {
      case 'CONNECTED':
        return 'CONECTADO Y PROTEGIDO';
      case 'CONNECTING':
        return 'INICIANDO TÚNEL...';
      case 'AUTHENTICATING':
        return 'AUTENTICANDO CREDENCIALES...';
      case 'HANDSHAKE':
        return 'ESTABLECIENDO HANDSHAKE...';
      case 'DISCONNECTING':
        return 'DESCONECTANDO...';
      case 'RECONNECTING':
        return 'RECONECTANDO...';
      default:
        return 'DESCONECTADO';
    }
  };

  const getStatusColorClass = () => {
    if (isConnected) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (isConnecting) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-slate-400 bg-slate-800/80 border-slate-700/50';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl backdrop-blur-md">
      {/* Background Decorative Gradient Orbs */}
      <div className={`absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
        isConnected ? 'bg-emerald-500' : isConnecting ? 'bg-cyan-500' : 'bg-blue-600'
      }`} />
      <div className={`absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
        isConnected ? 'bg-cyan-500' : isConnecting ? 'bg-purple-500' : 'bg-slate-700'
      }`} />

      <div className="relative z-10 flex flex-col items-center">

        {/* Custom Server Endpoint Header */}
        <div className="w-full mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-800/50">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white font-mono">
                  {currentServer.server || 'Servidor Personalizado'}
                </span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800/40">
                  :{currentServer.port}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Protocolo: <b className="text-slate-300 font-mono">{currentServer.protocol.toUpperCase()}</b></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Listo</span>
          </div>
        </div>

        {/* Main Central Connect Button */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated Glow Rings */}
          {isConnected && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75 pointer-events-none" />
          )}
          {isConnecting && (
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-spin border-2 border-dashed border-cyan-400 pointer-events-none" />
          )}

          <button
            onClick={onToggleConnect}
            className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 shadow-2xl transition-all duration-300 group ${
              isConnected
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400 text-white shadow-emerald-500/40 hover:scale-105'
                : isConnecting
                ? 'bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-300 text-white shadow-cyan-500/40'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-white hover:shadow-cyan-500/20 hover:scale-105'
            }`}
          >
            <Power className={`w-12 h-12 transition-transform duration-300 ${
              isConnected ? 'scale-110 drop-shadow' : 'group-hover:rotate-12'
            }`} />
            <span className="text-[11px] font-extrabold uppercase tracking-widest mt-1">
              {isConnected ? 'DESCONECTAR' : isConnecting ? 'CONECTANDO' : 'CONECTAR'}
            </span>
          </button>
        </div>

        {/* Status Label & Timer */}
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
          <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide flex items-center gap-1.5 ${getStatusColorClass()}`}>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{getStatusLabel()}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-sm font-semibold text-slate-200">
              {formatDuration(networkStats.connectionTimeSeconds)}
            </span>
            <span>•</span>
            <span className="font-mono text-xs text-cyan-400">
              IP: {isConnected ? networkStats.virtualIp : 'Sin Protección'}
            </span>
          </div>
        </div>

        {/* Live Network Speed & Data Meter */}
        <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Descarga</div>
              <div className="text-sm font-bold font-mono text-white">
                {formatSpeed(networkStats.downloadSpeed)}
              </div>
              <div className="text-[10px] text-slate-400">
                Total: {formatBytes(networkStats.bytesReceived)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Subida</div>
              <div className="text-sm font-bold font-mono text-white">
                {formatSpeed(networkStats.uploadSpeed)}
              </div>
              <div className="text-[10px] text-slate-400">
                Total: {formatBytes(networkStats.bytesSent)}
              </div>
            </div>
          </div>
        </div>

        {/* Protocol & Payload Summary Strip */}
        <div className="w-full mt-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium text-slate-300">Túnel:</span>
            <span className="text-cyan-300 font-mono truncate">{getProtocolDisplayName(currentServer.protocol)}</span>
          </div>
          <button
            onClick={onOpenPayloadModal}
            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-2 shrink-0 ml-2"
          >
            Editar Payload
          </button>
        </div>

      </div>
    </div>
  );
};

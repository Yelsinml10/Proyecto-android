import React, { useState } from 'react';
import {
  X,
  Layers,
  Globe,
  Shield,
  Zap,
  Radio,
  Flame,
  Gauge,
  KeyRound,
  Check,
  ArrowRight,
  Search,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { VpnProtocol } from '../types';

interface ProtocolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProtocol: VpnProtocol;
  onSelectProtocol: (protocol: VpnProtocol) => void;
}

export interface ProtocolDef {
  id: VpnProtocol;
  title: string;
  badge: string;
  category: 'SSH' | 'V2Ray' | 'DNS' | 'UDP/QUIC' | 'Propietario';
  description: string;
  icon: React.ElementType;
  accentColor: string;
  borderGlow: string;
  badgeBg: string;
  popularFor: string;
  defaultPort: string;
}

export const PROTOCOLS_LIST: ProtocolDef[] = [
  {
    id: 'ssh_ws',
    title: 'SSH WebSocket',
    badge: 'HTTP / CDN',
    category: 'SSH',
    description: 'Inyección de Payload HTTP con soporte de proxy Cloudflare y CDN Directing.',
    icon: Globe,
    accentColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
    borderGlow: 'border-emerald-500/50 hover:border-emerald-400 ring-emerald-500/30',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    popularFor: 'Inyección HTTP / CDN (Puerto 80/8080)',
    defaultPort: '80 / 8080',
  },
  {
    id: 'ssh_ssl',
    title: 'SSH SSL / TLS',
    badge: 'SNI Direct',
    category: 'SSH',
    description: 'Conexión cifrada SSL/TLS directa con falsificación de nombre SNI (Server Name Indication).',
    icon: Shield,
    accentColor: 'from-cyan-500/20 to-blue-500/10 text-cyan-400',
    borderGlow: 'border-cyan-500/50 hover:border-cyan-400 ring-cyan-500/30',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    popularFor: 'Host SNI SSL (Puerto 443/8443)',
    defaultPort: '443 / 8443',
  },
  {
    id: 'v2ray_xray',
    title: 'V2Ray / Xray',
    badge: 'VMess / VLess / Trojan',
    category: 'V2Ray',
    description: 'Protocolo de evasión avanzada con transporte gRPC, WS, TCP y TLS / Reality.',
    icon: Zap,
    accentColor: 'from-purple-500/20 to-indigo-500/10 text-purple-400',
    borderGlow: 'border-purple-500/50 hover:border-purple-400 ring-purple-500/30',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    popularFor: 'Ultra Velocidad & Anti-Bloqueo DPI',
    defaultPort: '443 (Reality)',
  },
  {
    id: 'slowdns',
    title: 'SlowDNS / DNSTT',
    badge: 'Sin Saldo / Sin Datos',
    category: 'DNS',
    description: 'Túnel DNS mediante registros TXT/MX sobre servidores DNS como 8.8.8.8 o 1.1.1.1.',
    icon: Radio,
    accentColor: 'from-amber-500/20 to-yellow-500/10 text-amber-400',
    borderGlow: 'border-amber-500/50 hover:border-amber-400 ring-amber-500/30',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    popularFor: 'Funciona sin plan de datos ni saldo',
    defaultPort: '53 (UDP)',
  },
  {
    id: 'hysteria_v1',
    title: 'Hysteria v1',
    badge: 'UDP Fast',
    category: 'UDP/QUIC',
    description: 'Túnel basado en UDP con control de congestión BBR para conexiones inestables.',
    icon: Flame,
    accentColor: 'from-rose-500/20 to-pink-500/10 text-rose-400',
    borderGlow: 'border-rose-500/50 hover:border-rose-400 ring-rose-500/30',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    popularFor: 'Streaming HD y redes lentas',
    defaultPort: '36712 (UDP)',
  },
  {
    id: 'hysteria_v2',
    title: 'Hysteria v2',
    badge: 'QUIC + Port Hopping',
    category: 'UDP/QUIC',
    description: 'Protocolo QUIC de ultra baja latencia con Port Hopping dinámico y ofuscación Salamander.',
    icon: Flame,
    accentColor: 'from-red-500/20 to-rose-600/10 text-red-400',
    borderGlow: 'border-red-500/50 hover:border-red-400 ring-red-500/30',
    badgeBg: 'bg-red-950/80 text-red-300 border-red-800/60',
    popularFor: 'Gaming online & Evasión de Bloqueos UDP',
    defaultPort: '20000-50000',
  },
  {
    id: 'udp_custom',
    title: 'UDP Custom',
    badge: 'Pasarela 7300',
    category: 'UDP/QUIC',
    description: 'Inyección de cabeceras UDP Custom con servidor pasarela y búfer de alta velocidad.',
    icon: Gauge,
    accentColor: 'from-blue-500/20 to-sky-500/10 text-blue-400',
    borderGlow: 'border-blue-500/50 hover:border-blue-400 ring-blue-500/30',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    popularFor: 'Tigo, Entel, Personal UDP (Puerto 7300)',
    defaultPort: '7300 (Custom)',
  },
  {
    id: 'zivpn',
    title: 'ZiVPN Protocol',
    badge: 'ZiKey UDP / SSL',
    category: 'Propietario',
    description: 'Túnel propietario ZiVPN con autenticación ZiKey, compresión de paquetes y modo Express.',
    icon: KeyRound,
    accentColor: 'from-indigo-500/20 to-violet-500/10 text-indigo-400',
    borderGlow: 'border-indigo-500/50 hover:border-indigo-400 ring-indigo-500/30',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    popularFor: 'Vivo, TIM, Digicel ZiVPN',
    defaultPort: '443 / 80',
  },
  {
    id: 'openvpn',
    title: 'OpenVPN TCP / UDP',
    badge: 'SSL / Proxy .ovpn',
    category: 'Propietario',
    description: 'Túnel estándar OpenVPN con soporte para credenciales de usuario, proxy remoto y archivos .ovpn.',
    icon: Shield,
    accentColor: 'from-orange-500/20 to-amber-500/10 text-orange-400',
    borderGlow: 'border-orange-500/50 hover:border-orange-400 ring-orange-500/30',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    popularFor: 'Túneles corporativos, perfiles .ovpn y Proxies',
    defaultPort: '1194 / 443',
  },
];

export const ProtocolSelectorModal: React.FC<ProtocolSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedProtocol,
  onSelectProtocol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'SSH', 'V2Ray', 'DNS', 'UDP/QUIC', 'Propietario'];

  const filteredProtocols = PROTOCOLS_LIST.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.popularFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (id: VpnProtocol) => {
    onSelectProtocol(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Seleccionar Protocolo de Túnel
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  8 Protocolos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Haz clic en el protocolo deseado para cargar automáticamente sus parámetros y opciones de conexión
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar protocolo, operador (Claro, Movistar...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                {cat === 'ALL' ? 'Todos (8)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Protocol Grid List */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-900/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredProtocols.map((p) => {
              const IconComponent = p.icon;
              const isSelected = selectedProtocol === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  className={`relative flex flex-col justify-between text-left p-4 rounded-2xl border transition-all group ${
                    isSelected
                      ? `bg-gradient-to-br ${p.accentColor} shadow-xl ring-2 ${p.borderGlow}`
                      : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/80 text-slate-300 hover:shadow-lg'
                  }`}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>ACTIVO</span>
                    </span>
                  )}

                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSelected
                            ? 'bg-slate-950/80 shadow-inner'
                            : 'bg-slate-900 border border-slate-800 group-hover:border-slate-700'
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${
                            isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'
                          }`}
                        />
                      </div>

                      <div className="pr-16">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold text-sm ${
                              isSelected ? 'text-white' : 'text-slate-100 group-hover:text-white'
                            }`}
                          >
                            {p.title}
                          </h3>
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${p.badgeBg}`}
                        >
                          {p.badge}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      {p.description}
                    </p>
                  </div>

                  {/* Bottom Meta Bar */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate text-slate-300 font-medium">
                        {p.popularFor}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-cyan-400/90 text-[10px] font-bold shrink-0">
                      <span>Puerto: {p.defaultPort}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProtocols.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No se encontraron protocolos con "{searchTerm}"</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('ALL');
                }}
                className="text-xs text-cyan-400 underline font-semibold"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Al seleccionar un protocolo, los formularios inferiores se ajustarán de inmediato.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { VpnConfig, VpnProtocol } from '../types';
import { Settings, Server, Key, Globe, Shield, Zap, Radio, Flame, Gauge, KeyRound, Copy, Check, Sparkles } from 'lucide-react';
import { parseV2rayLink } from '../utils/v2rayParser';

interface ProtocolFormProps {
  config: VpnConfig;
  onChangeConfig: (updated: VpnConfig) => void;
  onOpenPayloadModal: () => void;
}

export const ProtocolForm: React.FC<ProtocolFormProps> = ({
  config,
  onChangeConfig,
  onOpenPayloadModal,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const updateField = (field: keyof VpnConfig, value: any) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-5">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Parámetros de Configuración del Túnel
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
          {config.protocol.toUpperCase()}
        </span>
      </div>

      {/* Common Server & Port Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Servidor / Host Remote</span>
          </label>
          <input
            type="text"
            value={config.server}
            onChange={(e) => updateField('server', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            placeholder="us1.netvpnproxy.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Puerto</label>
          <input
            type="number"
            value={config.port}
            onChange={(e) => updateField('port', parseInt(e.target.value) || 80)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            placeholder="80 / 443"
          />
        </div>
      </div>

      {/* --- PROTOCOL SPECIFIC FIELDS --- */}

      {/* 1. SSH WebSocket & 2. SSH SSL */}
      {(config.protocol === 'ssh_ws' || config.protocol === 'ssh_ssl') && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Usuario SSH</span>
              </label>
              <input
                type="text"
                value={config.sshUser || ''}
                onChange={(e) => updateField('sshUser', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                placeholder="netvpn_user"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña SSH</label>
              <input
                type="password"
                value={config.sshPassword || ''}
                onChange={(e) => updateField('sshPassword', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bug Host / SNI</span>
              </label>
              <input
                type="text"
                value={config.bugHost || ''}
                onChange={(e) => {
                  updateField('bugHost', e.target.value);
                  updateField('sni', e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                placeholder="subdomain.operador.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <span>Payload HTTP HTTP Injector</span>
              </label>
              <button
                type="button"
                onClick={onOpenPayloadModal}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generar Payload Automático</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={config.payload || ''}
              onChange={(e) => updateField('payload', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              placeholder="GET / HTTP/1.1[crlf]Host: subdomain.com[crlf]Upgrade: websocket[crlf][crlf]"
            />
          </div>
        </div>
      )}

      {/* 3. V2Ray / Xray */}
      {config.protocol === 'v2ray_xray' && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          {/* Quick Paste Link Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300">
                Pegar Enlace V2Ray (Detecta VMess, VLESS o Trojan)
              </label>
              {config.v2rayType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                  {config.v2rayType}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="vless://b831381d... o vmess://eyadd... o trojan://..."
                value={config.v2rayLink || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField('v2rayLink', val);
                  if (val.trim()) {
                    const parsed = parseV2rayLink(val);
                    if (parsed) {
                      onChangeConfig({
                        ...config,
                        ...parsed,
                        v2rayLink: val,
                      });
                    }
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">UUID / Passkey</label>
              <input
                type="text"
                value={config.uuid || ''}
                onChange={(e) => updateField('uuid', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                placeholder="9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transporte (Network)</label>
              <select
                value={config.network || 'ws'}
                onChange={(e) => updateField('network', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ws">WebSocket (WS)</option>
                <option value="grpc">gRPC</option>
                <option value="tcp">TCP / Reality</option>
                <option value="http">HTTP/2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SNI (Server Name Indication)</label>
              <input
                type="text"
                value={config.sni || ''}
                onChange={(e) => updateField('sni', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                placeholder="cdn.auth.google.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Path / ServiceName</label>
              <input
                type="text"
                value={config.v2rayPath || ''}
                onChange={(e) => updateField('v2rayPath', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                placeholder="/v2ray-ws"
              />
            </div>
          </div>

          {config.v2rayLink && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Enlace Importado URI V2Ray</label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.v2rayLink || '')}
                  className="text-[11px] text-purple-400 flex items-center gap-1 font-semibold"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar URI'}</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={config.v2rayLink}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 select-all"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. SlowDNS / DNSTT */}
      {config.protocol === 'slowdns' && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Registro NS (Nameserver / Subdominio NS Requerido)</span>
            </label>
            <input
              type="text"
              value={config.dnsNameServer || ''}
              onChange={(e) => updateField('dnsNameServer', e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/60 rounded-lg px-3 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              placeholder="ej. ns1.tudominio.com o dns.servidor.net"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Subdominio configurado con registro tipo NS apuntando a la IP de tu servidor DNSTT.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <span>Clave Pública DNSTT (Public Key - 64 Hex)</span>
            </label>
            <input
              type="text"
              value={config.dnsPubKey || ''}
              onChange={(e) => updateField('dnsPubKey', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              placeholder="e8f7a6b5c4d3e2f10987654321..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Resolver DNS Destino</label>
              <input
                type="text"
                value={config.dnsTargetResolver || '8.8.8.8'}
                onChange={(e) => updateField('dnsTargetResolver', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="8.8.8.8 / 1.1.1.1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Modo de Consulta DNS</label>
              <select
                value={config.dnsMode || 'TXT'}
                onChange={(e) => updateField('dnsMode', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              >
                <option value="TXT">TXT Query (Recomendado)</option>
                <option value="A">A Record</option>
                <option value="MX">MX Query</option>
                <option value="AAAA">AAAA IPv6</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">MTU Paquete DNS ({config.dnsMtu || 1230} B)</label>
            <input
              type="range"
              min={1000}
              max={1400}
              step={10}
              value={config.dnsMtu || 1230}
              onChange={(e) => updateField('dnsMtu', parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* 5. Hysteria v1 & v2 */}
      {(config.protocol === 'hysteria_v1' || config.protocol === 'hysteria_v2') && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Versión Hysteria</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('protocol', 'hysteria_v1')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    config.protocol === 'hysteria_v1'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  v1 (UDP)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('protocol', 'hysteria_v2')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    config.protocol === 'hysteria_v2'
                      ? 'bg-red-500/20 text-red-300 border-red-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  v2 (QUIC)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Auth Password / Token</label>
              <input
                type="text"
                value={config.authPassword || ''}
                onChange={(e) => updateField('authPassword', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                placeholder="hy2_secret_pass"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Port Hopping Range</label>
              <input
                type="text"
                value={config.portHopping || '20000-50000'}
                onChange={(e) => updateField('portHopping', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                placeholder="20000-50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Clave Ofuscación Salamander</label>
              <input
                type="text"
                value={config.obfsKey || ''}
                onChange={(e) => updateField('obfsKey', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                placeholder="salamander_netvpn_secret"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">SNI (Server Name Indication)</label>
              <input
                type="text"
                value={config.sni || ''}
                onChange={(e) => updateField('sni', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                placeholder="cloudflare.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Límite Subida (Mbps)</label>
              <input
                type="number"
                value={config.upMbps || 100}
                onChange={(e) => updateField('upMbps', parseInt(e.target.value) || 50)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Límite Descarga (Mbps)</label>
              <input
                type="number"
                value={config.downMbps || 200}
                onChange={(e) => updateField('downMbps', parseInt(e.target.value) || 100)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. UDP Custom */}
      {config.protocol === 'udp_custom' && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>Servidor Pasarela UDP (UDP Gateway)</span>
              </label>
              <input
                type="text"
                value={config.udpGwServer || ''}
                onChange={(e) => updateField('udpGwServer', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                placeholder="pe1.udpcustom.netvpnproxy.com:7300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Puerto Pasarela GW</label>
              <input
                type="number"
                value={config.udpGwPort || 7300}
                onChange={(e) => updateField('udpGwPort', parseInt(e.target.value) || 7300)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Custom UDP Header Payload</label>
            <textarea
              rows={2}
              value={config.udpHeaderPayload || ''}
              onChange={(e) => updateField('udpHeaderPayload', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
              placeholder="UDP-CUSTOM-HEADER v2.4\r\nHost: operador.com\r\n\r\n"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tamaño Buffer UDP (Bytes)</label>
              <input
                type="number"
                value={config.udpBuffer || 8192}
                onChange={(e) => updateField('udpBuffer', parseInt(e.target.value) || 8192)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">MTU UDP (1400/1500)</label>
              <input
                type="number"
                value={config.udpMtu || 1400}
                onChange={(e) => updateField('udpMtu', parseInt(e.target.value) || 1400)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. ZiVPN Protocol */}
      {config.protocol === 'zivpn' && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>ZiVPN Master Key (ZiKey)</span>
              </label>
              <input
                type="text"
                value={config.ziKey || ''}
                onChange={(e) => updateField('ziKey', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                placeholder="zi_key_chile_fast_99"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Puerto ZiVPN</label>
              <input
                type="number"
                value={config.ziPort || 5666}
                onChange={(e) => updateField('ziPort', parseInt(e.target.value) || 5666)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña ZiPass</label>
              <input
                type="password"
                value={config.ziPass || ''}
                onChange={(e) => updateField('ziPass', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Modo de Transporte ZiVPN</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('ziMode', 'udp')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    config.ziMode === 'udp'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  ZiVPN UDP
                </button>
                <button
                  type="button"
                  onClick={() => updateField('ziMode', 'ssl')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                    config.ziMode === 'ssl'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  ZiVPN SSL
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Payload ZiVPN Personalizado</label>
            <textarea
              rows={2}
              value={config.ziPayload || ''}
              onChange={(e) => updateField('ziPayload', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
              placeholder="GET /zivpn HTTP/1.1\r\nHost: cdn.operador.com\r\nUpgrade: zivpn\r\n\r\n"
            />
          </div>
        </div>
      )}
    </div>
  );
};

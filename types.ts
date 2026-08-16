export type VpnProtocol =
  | 'ssh_ws'
  | 'ssh_ssl'
  | 'openvpn'
  | 'v2ray_xray'
  | 'slowdns'
  | 'hysteria_v1'
  | 'hysteria_v2'
  | 'udp_custom'
  | 'zivpn';

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'AUTHENTICATING'
  | 'HANDSHAKE'
  | 'CONNECTED'
  | 'DISCONNECTING'
  | 'RECONNECTING';

export type V2RayType = 'vless' | 'vmess' | 'trojan' | 'shadowsocks' | 'socks' | 'wireguard' | 'dokodemo-door';
export type V2RayNetwork = 'ws' | 'grpc' | 'tcp' | 'http' | 'h2' | 'quic' | 'kcp' | 'splithttp' | 'upgrade';

export type ActiveTab = 'home' | 'tools' | 'logs' | 'configs' | 'ai';
export type AppThemeId =
  | 'cyber_neon'
  | 'amoled_black'
  | 'electric_violet'
  | 'aurora_borealis'
  | 'sunset_honduras'
  | 'emerald_matrix'
  | 'crimson_blood'
  | 'ocean_depths';

export interface VpnConfig {
  id: string;
  name: string;
  protocol: VpnProtocol;
  server: string;
  port: number;
  flag: string;
  country: string;
  ping: number;
  load: number;
  isPremium?: boolean;

  // HTTP Custom Core Switches
  autoPing?: boolean;
  enableDns?: boolean;
  dnsProvider?: 'google' | 'cloudflare' | 'adguard' | 'custom';
  customDnsPrimary?: string;
  customDnsSecondary?: string;
  forwardUdp?: boolean;
  udpGwPort?: number;
  wakeLock?: boolean;
  enablePayload?: boolean;
  enableSni?: boolean;
  bypassApps?: boolean;
  hotshareEnabled?: boolean;
  hotsharePort?: number;

  // Generic Credentials
  username?: string;
  password?: string;
  remoteProxy?: string;

  // SSH WS / SSL
  sshUser?: string;
  sshPassword?: string;
  bugHost?: string;
  sni?: string;
  payload?: string;
  wsPath?: string;
  customHeaders?: string;

  // OpenVPN
  ovpnConfig?: string;
  ovpnProtocol?: 'tcp' | 'udp';
  ovpnAuthType?: 'user_pass' | 'certificate' | 'both';
  ovpnProxyType?: 'none' | 'http' | 'ssl';

  // V2Ray / Xray
  v2rayType?: V2RayType;
  uuid?: string;
  security?: string;
  securityType?: 'none' | 'tls' | 'reality';
  realityPublicKey?: string;
  realityShortId?: string;
  realitySpiderX?: string;
  network?: V2RayNetwork;
  v2rayPath?: string;
  grpcServiceName?: string;
  v2rayTls?: boolean;
  v2rayFlow?: string;
  v2rayAlterId?: number;
  v2rayHeaderType?: string;
  ssMethod?: string;
  kcpSeed?: string;
  quicSecurity?: string;
  quicKey?: string;
  v2rayLink?: string;

  // SlowDNS
  dnsPubKey?: string;
  dnsNameServer?: string;
  dnsTargetResolver?: string;
  dnsMode?: 'TXT' | 'MX' | 'AAAA';
  dnsMtu?: number;

  // Hysteria v1 & v2
  hysteriaVersion?: 1 | 2;
  authPassword?: string;
  portHopping?: string; // e.g. "20000-50000"
  obfsKey?: string;
  obfsType?: 'salamander' | 'none';
  upMbps?: number;
  downMbps?: number;
  alpn?: string;
  hy2Uri?: string;

  // UDP Custom
  udpGwServer?: string;
  udpHeaderPayload?: string;
  udpBuffer?: number;
  udpMtu?: number;

  // ZiVPN
  ziKey?: string;
  ziPort?: number;
  ziPass?: string;
  ziMode?: 'udp' | 'ssl';
  ziPayload?: string;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  protocol?: VpnProtocol;
}

export interface AbiSecurityOptions {
  isLocked?: boolean;
  lockNote?: string;
  expiryDate?: string;
  lockHwid?: string;
  blockRoot?: boolean;
  passwordProtected?: boolean;
  password?: string;
}

export interface AbiConfigFile {
  app: 'VPN PROXY HN' | 'NET VPN PROXY';
  format: 'ABI_CONFIG_V1';
  fileExt: '.abi';
  version: string;
  exportedAt: string;
  config: VpnConfig;
  security?: AbiSecurityOptions;
}

export interface NetworkStats {
  bytesSent: number;
  bytesReceived: number;
  uploadSpeed: number; // KB/s
  downloadSpeed: number; // KB/s
  latencyMs: number;
  virtualIp: string;
  connectionTimeSeconds: number;
}


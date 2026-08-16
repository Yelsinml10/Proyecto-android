import { VpnConfig, V2RayNetwork, V2RayType } from '../types';

export function parseV2rayLink(link: string): Partial<VpnConfig> | null {
  const trimmed = link.trim();
  if (!trimmed) return null;

  try {
    // 1. VMESS (Base64 JSON or Standard URI)
    if (trimmed.startsWith('vmess://')) {
      const b64 = trimmed.slice(8);
      try {
        const decoded = atob(b64);
        const json = JSON.parse(decoded);

        const isTls = json.tls === 'tls' || json.tls === '1' || json.tls === true;
        const net = (json.net || 'ws').toLowerCase();
        const host = json.host || json.sni || '';
        const path = json.path || '/';

        return {
          protocol: 'v2ray_xray',
          v2rayType: 'vmess',
          name: json.ps || 'VMess Server',
          server: json.add || '',
          port: parseInt(json.port) || 443,
          uuid: json.id || '', // ID de usuario
          v2rayAlterId: parseInt(json.aid) || 0,
          sni: json.sni || host,
          bugHost: host || json.sni || '',
          v2rayPath: path,
          grpcServiceName: net === 'grpc' ? path : undefined,
          network: net as V2RayNetwork,
          v2rayTls: isTls,
          security: isTls ? 'tls' : 'none',
          v2rayHeaderType: json.type || 'none',
        };
      } catch {
        // Fallback for query-string formatted vmess
        const url = new URL(trimmed);
        const uuid = url.username;
        const server = url.hostname;
        const port = parseInt(url.port) || 443;
        const params = url.searchParams;
        const tag = decodeURIComponent(url.hash.replace('#', '')) || 'VMess Server';
        const net = (params.get('type') || params.get('net') || 'ws').toLowerCase() as V2RayNetwork;
        const security = params.get('security') || 'none';
        const isTls = security === 'tls';

        return {
          protocol: 'v2ray_xray',
          v2rayType: 'vmess',
          name: tag,
          server,
          port,
          uuid,
          sni: params.get('sni') || params.get('host') || '',
          bugHost: params.get('host') || params.get('sni') || '',
          v2rayPath: params.get('path') || '/',
          grpcServiceName: params.get('serviceName') || '',
          network: net,
          v2rayTls: isTls,
          security,
        };
      }
    }

    // 2. VLESS (vless://uuid@host:port?params#name)
    if (trimmed.startsWith('vless://')) {
      const url = new URL(trimmed);
      const uuid = url.username; // ID de usuario VLESS
      const server = url.hostname;
      const port = parseInt(url.port) || 443;
      const params = url.searchParams;
      const tag = decodeURIComponent(url.hash.replace('#', '')) || 'VLESS Server';

      const security = (params.get('security') as any) || (params.get('pbk') ? 'reality' : 'tls');
      const network = (params.get('type') || params.get('net') || 'ws').toLowerCase() as V2RayNetwork;
      const sni = params.get('sni') || params.get('host') || '';
      const path = params.get('path') || params.get('serviceName') || '/';
      const pbk = params.get('pbk') || ''; // Reality Public Key
      const sid = params.get('sid') || ''; // Reality Short ID
      const spx = params.get('spx') || ''; // Reality SpiderX
      const flow = params.get('flow') || ''; // e.g. xtls-rprx-vision
      const headerType = params.get('headerType') || 'none';

      return {
        protocol: 'v2ray_xray',
        v2rayType: 'vless',
        name: tag,
        server,
        port,
        uuid,
        sni,
        bugHost: sni,
        v2rayPath: path,
        grpcServiceName: network === 'grpc' ? (params.get('serviceName') || path) : undefined,
        network,
        security,
        securityType: security === 'reality' ? 'reality' : security === 'tls' ? 'tls' : 'none',
        realityPublicKey: pbk,
        realityShortId: sid,
        realitySpiderX: spx,
        v2rayFlow: flow,
        v2rayHeaderType: headerType,
        v2rayTls: security === 'tls' || security === 'reality',
      };
    }

    // 3. TROJAN (trojan://password@host:port?params#name)
    if (trimmed.startsWith('trojan://')) {
      const url = new URL(trimmed);
      const password = url.username || url.password; // Contraseña Trojan
      const server = url.hostname;
      const port = parseInt(url.port) || 443;
      const params = url.searchParams;
      const tag = decodeURIComponent(url.hash.replace('#', '')) || 'Trojan Server';

      const sni = params.get('sni') || params.get('peer') || params.get('host') || '';
      const network = (params.get('type') || params.get('net') || 'tcp').toLowerCase() as V2RayNetwork;
      const path = params.get('path') || params.get('serviceName') || '/';
      const security = params.get('security') || 'tls';

      return {
        protocol: 'v2ray_xray',
        v2rayType: 'trojan',
        name: tag,
        server,
        port,
        uuid: password,
        sni,
        bugHost: sni,
        v2rayPath: path,
        grpcServiceName: network === 'grpc' ? (params.get('serviceName') || path) : undefined,
        network,
        v2rayTls: security === 'tls',
        security,
      };
    }

    // 4. SHADOWSOCKS (ss://...)
    if (trimmed.startsWith('ss://')) {
      const tag = trimmed.includes('#') ? decodeURIComponent(trimmed.split('#')[1]) : 'Shadowsocks Server';
      const base = trimmed.split('#')[0].replace('ss://', '');

      let server = '';
      let port = 8388;
      let password = '';
      let method = 'aes-256-gcm';

      if (base.includes('@')) {
        const [auth, hostPort] = base.split('@');
        const [h, p] = hostPort.split(':');
        server = h;
        port = parseInt(p) || 8388;
        if (auth.includes(':')) {
          const [m, pwd] = auth.split(':');
          method = m;
          password = pwd;
        } else {
          password = auth;
        }
      } else {
        const decoded = atob(base);
        const [methodPass, hostPort] = decoded.split('@');
        const [h, p] = hostPort.split(':');
        server = h;
        port = parseInt(p) || 8388;
        if (methodPass.includes(':')) {
          const [m, pwd] = methodPass.split(':');
          method = m;
          password = pwd;
        } else {
          password = methodPass;
        }
      }

      return {
        protocol: 'v2ray_xray',
        v2rayType: 'shadowsocks',
        name: tag,
        server,
        port,
        uuid: password,
        ssMethod: method,
        network: 'tcp',
      };
    }

    // 5. SOCKS5 / SOCKS (socks:// or socks5://)
    if (trimmed.startsWith('socks://') || trimmed.startsWith('socks5://')) {
      const url = new URL(trimmed);
      const tag = decodeURIComponent(url.hash.replace('#', '')) || 'Socks5 Server';
      return {
        protocol: 'v2ray_xray',
        v2rayType: 'socks',
        name: tag,
        server: url.hostname,
        port: parseInt(url.port) || 1080,
        username: url.username || '',
        password: url.password || '',
        uuid: url.username ? `${url.username}:${url.password}` : '',
        network: 'tcp',
      };
    }

    // 6. WIREGUARD (wireguard:// or wg://)
    if (trimmed.startsWith('wireguard://') || trimmed.startsWith('wg://')) {
      const url = new URL(trimmed.replace('wg://', 'wireguard://'));
      const tag = decodeURIComponent(url.hash.replace('#', '')) || 'WireGuard Xray';
      return {
        protocol: 'v2ray_xray',
        v2rayType: 'wireguard',
        name: tag,
        server: url.hostname,
        port: parseInt(url.port) || 51820,
        uuid: url.searchParams.get('private_key') || url.username || '',
        realityPublicKey: url.searchParams.get('public_key') || '',
        network: 'quic',
      };
    }

    return null;
  } catch (err) {
    console.error('Error parsing v2ray link:', err);
    return null;
  }
}

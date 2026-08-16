export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatSpeed(kbps: number): string {
  if (kbps < 1024) {
    return `${kbps.toFixed(1)} KB/s`;
  }
  return `${(kbps / 1024).toFixed(2)} MB/s`;
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function getProtocolDisplayName(protocol: string): string {
  switch (protocol) {
    case 'ssh_ws':
      return 'SSH WebSocket';
    case 'ssh_ssl':
      return 'SSH SSL/TLS';
    case 'v2ray_xray':
      return 'V2Ray / Xray';
    case 'slowdns':
      return 'SlowDNS / DNSTT';
    case 'hysteria_v1':
      return 'Hysteria v1';
    case 'hysteria_v2':
      return 'Hysteria v2';
    case 'udp_custom':
      return 'UDP Custom';
    case 'zivpn':
      return 'ZiVPN Protocol';
    default:
      return protocol.toUpperCase();
  }
}

export function getProtocolBadgeColor(protocol: string): { bg: string; text: string; border: string } {
  switch (protocol) {
    case 'ssh_ws':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'ssh_ssl':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'v2ray_xray':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'slowdns':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'hysteria_v1':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'hysteria_v2':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
    case 'udp_custom':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'zivpn':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
}

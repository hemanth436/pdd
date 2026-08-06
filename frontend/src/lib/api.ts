import { Capacitor } from '@capacitor/core';

/**
 * Dynamic API URL and WebSocket URL Resolver for Web and Android/iOS Mobile Environments
 */
export function getApiUrl(): string {
  // 1. If running inside Capacitor Native Mobile App (Android/iOS)
  if (typeof window !== 'undefined' && typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
    // Mac host IP address on local network
    const hostIp = '10.71.157.20';
    return `http://${hostIp}:5001`;
  }

  // 2. Client-side dynamic host resolution (works for mobile browsers on Wi-Fi or custom domains)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
  }

  // 3. Environment variable override
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 4. Default fallback for local desktop web development
  return 'http://localhost:5001';
}

export function getSocketUrl(): string {
  return getApiUrl();
}

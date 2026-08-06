import { Capacitor } from '@capacitor/core';

/**
 * Dynamic API URL and WebSocket URL Resolver for Web and Mobile (Capacitor) Environments
 */
export function getApiUrl(): string {
  // 1. Prioritize environment variable override (Live Render Backend: https://skillmobile-app.onrender.com)
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Fallback for Capacitor Native Mobile App when env var isn't present
  if (typeof window !== 'undefined' && typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
    return 'https://skillmobile-app.onrender.com';
  }

  // 3. Client-side dynamic host resolution for custom domains / Wi-Fi IP
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
  }

  // 4. Default fallback
  return 'http://localhost:5001';
}

export function getSocketUrl(): string {
  return getApiUrl();
}

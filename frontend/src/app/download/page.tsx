'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Shield, Smartphone, CheckCircle, ArrowLeft, ExternalLink, Share } from 'lucide-react';

export default function DownloadAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on your phone:\n- iPhone: Tap Share -> Add to Home Screen\n- Android: Tap 3 dots -> Install App / Add to Home Screen');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-gray-100 flex flex-col justify-between p-6 md:p-12">
      
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl font-outfit text-indigo-600 dark:text-indigo-400">
          <Shield className="w-6 h-6" />
          SkillSwap<span>Exchange</span>
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-500 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </header>

      {/* Main Download Card */}
      <main className="max-w-xl w-full mx-auto my-12 glass-panel p-8 md:p-10 rounded-3xl text-center shadow-2xl border border-indigo-500/20">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-indigo-500/25">
          <Smartphone className="w-10 h-10 animate-bounce" />
        </div>

        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white mb-2">
          Install Mobile App
        </h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
          Download and install SkillSwap Exchange directly on your iOS or Android device.
        </p>

        {isInstalled ? (
          <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5" /> App Successfully Installed!
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2.5 text-base transition-all hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" /> Install App on Mobile
            </button>

            <Link
              href="/explore"
              className="w-full py-3.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-200 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors block"
            >
              <ExternalLink className="w-4 h-4" /> Explore Web App Marketplace
            </Link>
          </div>
        )}

        {/* Device Instructions */}
        <div className="text-left border-t border-slate-200 dark:border-slate-800/80 pt-6 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Quick Installation Instructions:</h3>
          
          <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <strong className="text-xs font-bold text-indigo-500 block">📱 iPhone (Safari):</strong>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-indigo-400" /> at the bottom bar → Tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
            <strong className="text-xs font-bold text-purple-500 block">🤖 Android (Chrome):</strong>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Tap the <strong>3 Dots menu</strong> (⋮) top right → Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        © 2026 SkillSwap Exchange Inc. All rights reserved.
      </footer>
    </div>
  );
}

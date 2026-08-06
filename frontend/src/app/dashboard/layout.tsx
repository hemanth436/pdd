'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  User, 
  FolderPlus, 
  HelpCircle, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  PhoneCall, 
  Palette,
  Menu,
  X
} from 'lucide-react';
import io from 'socket.io-client';
import { getSocketUrl } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);
  const [globalIncomingCall, setGlobalIncomingCall] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState('cyber-midnight');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Restore saved background theme preference
    const savedBg = localStorage.getItem('sep_bg_theme') || 'cyber-midnight';
    setCurrentTheme(savedBg);
    document.documentElement.setAttribute('data-bg-theme', savedBg);

    // Session authorization checks
    const stored = localStorage.getItem('sep_user');
    if (!stored) {
      router.push('/login');
    } else {
      const user = JSON.parse(stored);
      setActiveUser(user);

      // Listen for incoming call notifications across entire dashboard
      const userId = user.id || user._id;
      const socket = io(getSocketUrl());

      socket.on('incoming_call', (callData: any) => {
        const { receiverId } = callData;
        if (!receiverId || receiverId === userId || receiverId?.toString() === userId?.toString()) {
          setGlobalIncomingCall(callData);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const changeTheme = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('sep_bg_theme', newTheme);
    document.documentElement.setAttribute('data-bg-theme', newTheme);
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('sep_token');
    localStorage.removeItem('sep_user');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'My Skills', path: '/dashboard/skills', icon: FolderPlus },
    { name: 'Requests', path: '/dashboard/requests', icon: HelpCircle },
    { name: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { name: 'Messages', path: '/dashboard/messages', icon: Mail },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skills', path: '/dashboard/skills', icon: FolderPlus },
    { name: 'Requests', path: '/dashboard/requests', icon: HelpCircle },
    { name: 'Sessions', path: '/dashboard/sessions', icon: Calendar },
    { name: 'Messages', path: '/dashboard/messages', icon: Mail },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#0B0F19] relative transition-colors duration-500 pb-16 md:pb-0">
      {/* Global Incoming Call Ringing Notification Overlay */}
      {globalIncomingCall && pathname !== '/dashboard/sessions' && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm glass-panel p-8 rounded-3xl text-center space-y-6 border border-indigo-500/40 shadow-2xl relative overflow-hidden text-white bg-[#0D121F]">
            <div className="relative w-24 h-24 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-400">
              <PhoneCall className="w-10 h-10 text-indigo-400 animate-bounce" />
              <span className="absolute inset-0 rounded-full border-4 border-indigo-500/40 animate-ping"></span>
            </div>
            
            <div>
              <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                Incoming Video Call Ringing...
              </span>
              <h3 className="text-xl font-extrabold mt-3 text-white font-outfit">
                {globalIncomingCall.senderName || 'Peer Instructor'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Wants to start session: <span className="font-bold text-indigo-400">{globalIncomingCall.sessionObj?.topic || 'Skill Swap Video Session'}</span>
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => setGlobalIncomingCall(null)} 
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
              >
                Decline
              </button>
              <button 
                onClick={() => {
                  setGlobalIncomingCall(null);
                  router.push('/dashboard/sessions');
                }} 
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                Attend Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Header (Android & Small Screens) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-[#0D121F]/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-base font-outfit text-indigo-600 dark:text-indigo-400">
          <Shield className="w-5 h-5" />
          SkillSwap<span>Exchange</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed, Mobile Slide-over Drawer) */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50 w-72 md:w-64 border-r border-slate-200/50 dark:border-slate-800/60 
        bg-white dark:bg-[#0D121F] p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-lg font-outfit text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5.5 h-5.5" />
              SkillSwap<span>Exchange</span>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin toggle check */}
            {activeUser?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <Shield className="w-4.5 h-4.5" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
          {/* Quick Background Theme Switcher Widget */}
          <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" /> Theme Mode
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'cyber-midnight', bg: 'bg-[#0B0F19]', name: 'Cyber' },
                { id: 'obsidian-space', bg: 'bg-[#04060E]', name: 'Obsidian' },
                { id: 'emerald-nebula', bg: 'bg-[#03120E]', name: 'Emerald' },
                { id: 'amethyst-violet', bg: 'bg-[#0C0719]', name: 'Violet' },
                { id: 'clean-light', bg: 'bg-[#F8FAFC]', name: 'Light' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={`Set ${t.name} Background Theme`}
                  className={`h-6 rounded-lg border transition-all ${t.bg} ${
                    currentTheme === t.id ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-110' : 'border-slate-700/50 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={activeUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50'}
              className="w-9 h-9 rounded-full object-cover border border-indigo-500"
              alt="avatar"
            />
            <div className="overflow-hidden">
              <strong className="text-xs block text-slate-800 dark:text-gray-200 truncate">{activeUser?.fullName || 'Active User'}</strong>
              <span className="text-xxs text-slate-400 block truncate">{activeUser?.email}</span>
            </div>
          </div>

          <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Center Viewport */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="p-4 sm:p-8 md:p-12 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Android & Mobile Bottom Fixed Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D121F]/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800/60 px-2 py-1.5 flex justify-around items-center">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-indigo-500 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

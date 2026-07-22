'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, FolderPlus, HelpCircle, Mail, Calendar, Settings, LogOut, LayoutDashboard, Shield, PhoneCall, PhoneOff } from 'lucide-react';
import io from 'socket.io-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);
  const [globalIncomingCall, setGlobalIncomingCall] = useState<any>(null);

  const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';

  useEffect(() => {
    // Session authorization checks
    const stored = localStorage.getItem('sep_user');
    if (!stored) {
      router.push('/login');
    } else {
      const user = JSON.parse(stored);
      setActiveUser(user);

      // Listen for incoming call notifications across entire dashboard
      const userId = user.id || user._id;
      const socket = io(apiUri);

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
  ];

  return (
    <div className="flex-1 flex min-h-screen bg-slate-50 dark:bg-[#0B0F19] relative">
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

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] p-6 flex flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg font-outfit text-indigo-600 dark:text-indigo-400 mb-8">
            <Shield className="w-5.5 h-5.5" />
            SkillSwap<span>Exchange</span>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
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

        <div className="space-y-4">
          <div className="flex items-center gap-3 border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
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
        <main className="p-8 md:p-12 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

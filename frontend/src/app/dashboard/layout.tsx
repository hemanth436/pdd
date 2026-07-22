'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, FolderPlus, HelpCircle, Mail, Calendar, Settings, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    // Session authorization checks
    const stored = localStorage.getItem('sep_user');
    if (!stored) {
      router.push('/login');
    } else {
      setActiveUser(JSON.parse(stored));
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
    <div className="flex-1 flex min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
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

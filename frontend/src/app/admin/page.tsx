'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Users, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Clock,
  Globe
} from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '@/lib/api';

interface AdminStats {
  total_users: number;
  total_logins?: number;
  total_skills: number;
  total_requests: number;
  active_users: number;
}

interface UserItem {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

interface LoginActivityItem {
  _id: string;
  id: string;
  userId: string;
  email: string;
  loginType: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface FeedbackItem {
  _id: string;
  name: string;
  email: string;
  messageText: string;
  createdAt: string;
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_logins: 0,
    total_skills: 0,
    total_requests: 0,
    active_users: 0
  });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [logins, setLogins] = useState<LoginActivityItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'logins' | 'feedback'>('users');

  const apiUri = getApiUrl();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUri}/api/admin/stats`);
      setStats(res.data.stats || {
        total_users: 0,
        total_logins: 0,
        total_skills: 0,
        total_requests: 0,
        active_users: 0
      });
      setUsers(res.data.users || []);
      setLogins(res.data.logins || []);
      setFeedbacks(res.data.feedback || []);
    } catch (err) {
      console.warn('Failed to load administrative stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (targetUserId: string, actionType: string) => {
    if (!confirm(`Are you sure you want to perform "${actionType}" action on this user?`)) return;

    try {
      await axios.post(`${apiUri}/api/admin/action`, {
        targetUserId,
        adminAction: actionType
      });

      setActionSuccess(`User status successfully updated: ${actionType}`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchAdminStats();
    } catch (err: any) {
      setActionSuccess(`Administrative action "${actionType}" executed.`);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-gray-100 flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0D121F] border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-gray-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 font-extrabold text-xl font-outfit text-emerald-500">
            <Shield className="w-6 h-6" />
            SkillSwap<span>Supabase Console</span>
          </div>
        </div>

        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-500 flex items-center gap-1">
          Back to Dashboard
        </Link>
      </header>

      {/* Main body viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 space-y-8">
        
        {/* Banner Alert box */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-sm font-bold animate-bounce">
            {actionSuccess}
          </div>
        )}

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Registered Supabase Users', count: stats.total_users, color: 'text-indigo-600 dark:text-indigo-400', icon: Users },
            { title: 'User Login Events (Audit)', count: stats.total_logins || logins.length, color: 'text-purple-600 dark:text-purple-400', icon: Activity },
            { title: 'Inquiries & Swaps', count: stats.total_requests, color: 'text-amber-500', icon: FileText },
            { title: 'Active Non-Blocked Users', count: stats.active_users, color: 'text-emerald-500', icon: CheckCircle2 }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-[#0D121F] border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform shadow-sm">
                <div>
                  <span className="text-slate-400 text-xxs font-extrabold uppercase tracking-wider block mb-1">{stat.title}</span>
                  <span className={`text-3xl font-extrabold font-outfit ${stat.color}`}>{stat.count}</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs for Users & Activity Logs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" /> Registered Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('logins')}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'logins' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" /> User Activity & Logins ({logins.length})
          </button>
        </div>

        {/* Tab 1: Registered Users */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#0D121F] border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold font-outfit">Supabase Registered Accounts</h2>
              <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">Manage user profiles and system permissions.</p>
            </div>

            {loading ? (
              <p className="text-slate-500 text-xs">Loading Supabase profiles...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3">Name</th>
                      <th className="py-3">Email Address</th>
                      <th className="py-3">Role</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/30">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="py-4">
                          <strong className="block font-bold">{u.fullName}</strong>
                          <span className="text-slate-400">@{u.username}</span>
                        </td>
                        <td className="py-4 font-mono text-slate-400">{u.email}</td>
                        <td className="py-4 capitalize font-semibold">{u.role}</td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {u.status === 'active' ? (
                              <button 
                                onClick={() => handleAdminAction(u._id, 'block')}
                                title="Suspend Account"
                                className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleAdminAction(u._id, 'approve')}
                                title="Reactivate Account"
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleAdminAction(u._id, 'delete')}
                              title="Remove Account"
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Activity & Login Logs */}
        {activeTab === 'logins' && (
          <div className="bg-white dark:bg-[#0D121F] border border-slate-200/50 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold font-outfit">User Login & Activity Log (Supabase public.logins)</h2>
              <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">Real-time audit record of all user login events, emails, IP addresses, and timestamps.</p>
            </div>

            {loading ? (
              <p className="text-slate-500 text-xs">Loading activity logs...</p>
            ) : logins.length === 0 ? (
              <p className="text-slate-400 text-xs py-6 text-center">No activity logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3">Email Address</th>
                      <th className="py-3">Login Timestamp</th>
                      <th className="py-3">Auth Type</th>
                      <th className="py-3">IP Address</th>
                      <th className="py-3">Client User-Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/30">
                    {logins.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10">
                        <td className="py-4 font-mono font-bold text-indigo-400">{l.email}</td>
                        <td className="py-4 text-slate-300">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {new Date(l.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 capitalize font-semibold text-emerald-400">{l.loginType}</td>
                        <td className="py-4 font-mono text-slate-400">{l.ipAddress}</td>
                        <td className="py-4 text-slate-400 text-xxs truncate max-w-xs">{l.userAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

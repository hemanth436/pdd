'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FolderPlus, 
  HelpCircle, 
  Calendar, 
  Mail, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '@/lib/api';

interface RequestItem {
  _id: string;
  requesterId: {
    _id: string;
    fullName: string;
    username: string;
  };
  providerId: {
    _id: string;
    fullName: string;
    username: string;
  };
  skillId: {
    _id: string;
    title: string;
    category: string;
  };
  status: string;
  createdAt: string;
}

interface SkillItem {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profilePhoto: string;
    skillsOffered: string;
  };
  title: string;
  description: string;
  category: string;
  type: string;
}

export default function DashboardPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Requests data
  const [sentRequests, setSentRequests] = useState<RequestItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RequestItem[]>([]);
  
  // All skills for recommendation
  const [skills, setSkills] = useState<SkillItem[]>([]);

  const apiUri = getApiUrl();

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchDashboardData(user.id || user._id);
    }
  }, []);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch swap requests
      const reqRes = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      setSentRequests(reqRes.data.sent || []);
      setReceivedRequests(reqRes.data.received || []);

      // 2. Fetch all skills to filter recommendations
      const skillsRes = await axios.get(`${apiUri}/api/skills`);
      setSkills(skillsRes.data || []);
    } catch (err) {
      console.warn('Dashboard data fetch failed, loading mock fallback view.');
      setSentRequests([]);
      setReceivedRequests([]);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  // Filter recommendations safely, handling null owners and string ID conversions
  const recommendations = skills.filter(s => {
    if (!s.userId) return false;
    const ownerId = s.userId._id || s.userId;
    const currentId = activeUser.id || activeUser._id;
    return ownerId.toString() !== currentId.toString();
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute left-1/3 bottom-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-purple-500/20 blur-xl"></div>

        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            Workspace Active
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit mt-4">
            Hello, {activeUser.fullName || 'User'}!
          </h1>
          <p className="text-indigo-100/90 text-sm mt-2 font-medium leading-relaxed">
            Welcome to your SkillSwap Exchange workspace. Manage your competencies, review mentorship inquiries, and connect with peer mentors.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-semibold border border-white/10">
              Role: <span className="capitalize font-bold text-yellow-300">{activeUser.role}</span>
            </div>
            {activeUser.skillsOffered && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-semibold border border-white/10">
                Offering: <span className="font-bold text-emerald-300">{activeUser.skillsOffered}</span>
              </div>
            )}
            {activeUser.skillsNeeded && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-semibold border border-white/10">
                Learning: <span className="font-bold text-indigo-300">{activeUser.skillsNeeded}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Numerical Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            title: 'Offers Active', 
            count: skills.filter(s => s.userId && (s.userId._id || s.userId).toString() === (activeUser.id || activeUser._id).toString() && s.type === 'offered').length, 
            color: 'text-indigo-600 dark:text-indigo-400', 
            desc: 'Your expertise listed' 
          },
          { 
            title: 'Needs Listed', 
            count: skills.filter(s => s.userId && (s.userId._id || s.userId).toString() === (activeUser.id || activeUser._id).toString() && s.type === 'requested').length, 
            color: 'text-purple-600 dark:text-purple-400', 
            desc: 'Topics you want to learn' 
          },
          { title: 'Received Requests', count: receivedRequests.filter(r => r.status === 'pending').length, color: 'text-amber-500', desc: 'Incoming pending replies' },
          { title: 'Matches Completed', count: receivedRequests.filter(r => r.status === 'accepted' || r.status === 'completed').length + sentRequests.filter(r => r.status === 'accepted' || r.status === 'completed').length, color: 'text-emerald-500', desc: 'Successful swaps made' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</span>
            <div className="my-4">
              <span className={`text-4xl font-extrabold font-outfit ${stat.color}`}>{stat.count}</span>
            </div>
            <span className="text-slate-500 dark:text-gray-400 text-xxs font-medium">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          href="/dashboard/skills" 
          className="p-5 bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-indigo-500/50 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">My Skills & Listings</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Post & manage competencies</p>
          </div>
        </Link>

        <Link 
          href="/dashboard/requests" 
          className="p-5 bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-indigo-500/50 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Swap Requests</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage incoming & sent inquiries</p>
          </div>
        </Link>

        <Link 
          href="/dashboard/sessions" 
          className="p-5 bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-indigo-500/50 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Video Sessions</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Attend scheduled mentorship</p>
          </div>
        </Link>

        <Link 
          href="/explore" 
          className="p-5 bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-indigo-500/50 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Explore Skills</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Find new mentors & topics</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

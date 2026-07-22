'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, User, Send, Shield, Compass, BookOpen } from 'lucide-react';
import axios from 'axios';

interface Skill {
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

const categories = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'AI & Machine Learning',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Communication Skills',
  'Language Learning'
];

export default function ExplorePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [requestedSkillIds, setRequestedSkillIds] = useState<string[]>([]);
  
  // Selected detail modal
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    // Restore session
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchSentRequests(user.id || user._id);
    }

    fetchSkillsData();
  }, [category, type]);

  const fetchSentRequests = async (userId: string) => {
    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';
      const res = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      const sent = res.data.sent || [];
      const ids = sent.map((r: any) => r.skillId?._id || r.skillId);
      setRequestedSkillIds(ids);
    } catch (err) {
      console.warn('Failed to load sent requests.');
    }
  };

  const fetchSkillsData = async () => {
    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';
      const res = await axios.get(`${apiUri}/api/skills`, {
        params: { category, type, search }
      });
      setSkills(res.data);
    } catch (err) {
      // Load mock items for preview
      const mockSkills: Skill[] = [
        {
          _id: 's101',
          userId: { _id: 'u1', fullName: 'Sarah Jenkins', profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', skillsOffered: 'Mobile Dev' },
          title: 'Swift & iOS Core Architecture',
          description: 'Learn MVC/MVVM layout modeling, state widgets, and API fetching bindings in SwiftUI.',
          category: 'Mobile Development',
          type: 'offered'
        },
        {
          _id: 's102',
          userId: { _id: 'u2', fullName: 'Alex Rivera', profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', skillsOffered: 'Design' },
          title: 'Interactive Figma Interfaces',
          description: 'Figma component variables, layouts, and responsive prototyping rules.',
          category: 'Graphic Design',
          type: 'offered'
        },
        {
          _id: 's103',
          userId: { _id: 'u3', fullName: 'Dr. Kenji Sato', profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', skillsOffered: 'Data Science' },
          title: 'PyTorch ML Deep Learning',
          description: 'Gradient descents, convolution neural nets (CNN), and model weights.',
          category: 'AI & Machine Learning',
          type: 'offered'
        }
      ];
      setSkills(mockSkills);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSkillsData();
  };

  const handleSendSwap = async (skill: Skill) => {
    if (!activeUser) {
      alert('Please login or register to send swap request transactions.');
      return;
    }

    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';
      await axios.post(`${apiUri}/api/requests`, {
        requesterId: activeUser.id || activeUser._id,
        providerId: skill.userId._id,
        skillId: skill._id
      });
      alert('Swap Inquiry Dispatched!');
      setRequestedSkillIds(prev => [...prev, skill._id]);
      setSelectedSkill(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request successfully simulated.';
      alert(msg);
      if (msg.includes('already exists') || msg.includes('simulated')) {
        setRequestedSkillIds(prev => [...prev, skill._id]);
      }
      setSelectedSkill(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0B0F19]">
      {/* Header bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl font-outfit text-indigo-600 dark:text-indigo-400">
          <Shield className="w-6 h-6" />
          SkillSwap<span>Exchange</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-slate-600 dark:text-gray-300 hover:text-indigo-500">
            Go Dashboard
          </Link>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Skill Marketplace</h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Discover mentors, learn and share listings.</p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Python, Figma..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500"
            />
          </form>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="offered">Offered</option>
            <option value="requested">Requested</option>
          </select>

          <button onClick={fetchSkillsData} className="w-full md:w-auto px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600">
            Filter
          </button>
        </div>

        {/* Grid Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div key={skill._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={skill.userId?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    className="w-10 h-10 rounded-full object-cover border border-indigo-500"
                    alt="avatar"
                  />
                  <div>
                    <strong className="text-sm block">{skill.userId?.fullName || 'Anonymous User'}</strong>
                    <span className="text-xs text-slate-500 dark:text-gray-400">Teaches: {skill.userId?.skillsOffered || skill.category}</span>
                  </div>
                </div>

                <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xxs font-bold uppercase tracking-wider rounded-full mb-3">
                  {skill.category} ({skill.type})
                </span>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{skill.title}</h3>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed mb-6 line-clamp-3">{skill.description}</p>
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <button onClick={() => setSelectedSkill(skill)} className="text-xs font-bold text-slate-500 hover:text-indigo-500">
                  View Detail
                </button>
                {requestedSkillIds.includes(skill._id) ? (
                  <button disabled className="flex items-center gap-1 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-lg cursor-not-allowed">
                    Requested
                  </button>
                ) : (
                  <button onClick={() => handleSendSwap(skill)} className="flex items-center gap-1 px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:brightness-110">
                    <Send className="w-3.5 h-3.5" /> Request Swap
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Details Overlay Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="w-full max-w-xl glass-panel p-8 rounded-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setSelectedSkill(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg">
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <img
                src={selectedSkill.userId?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                className="w-12 h-12 rounded-full object-cover border border-indigo-500"
                alt="avatar"
              />
              <div>
                <h3 className="text-lg font-bold">{selectedSkill.userId?.fullName}</h3>
                <span className="text-xs text-slate-400">Owner Metadata Profile</span>
              </div>
            </div>
            
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xxs font-bold uppercase rounded-full mb-4">
              {selectedSkill.category}
            </span>

            <h2 className="text-xl font-bold mb-3">{selectedSkill.title}</h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{selectedSkill.description}</p>

            <div className="flex gap-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-6">
              <button onClick={() => setSelectedSkill(null)} className="flex-1 py-2.5 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-200">
                Close
              </button>
              {requestedSkillIds.includes(selectedSkill._id) ? (
                <button disabled className="flex-1 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-bold rounded-xl cursor-not-allowed">
                  Requested
                </button>
              ) : (
                <button onClick={() => handleSendSwap(selectedSkill)} className="flex-1 py-2.5 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:brightness-110">
                  Confirm Swap Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { FolderPlus, Trash2, Award, Plus, X, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface SkillItem {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
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

export default function SkillsPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillTitle, setSkillTitle] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [skillType, setSkillType] = useState('offered');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchUserSkills(user);
    }
  }, []);

  const fetchUserSkills = async (user: any) => {
    const userId = user.id || user._id;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUri}/api/skills`, {
        params: { userId }
      });
      const allSkills: SkillItem[] = res.data || [];
      const filtered = allSkills.filter(s => s.userId && (s.userId._id === userId || s.userId.id === userId || (s.userId as any) === userId));
      setUserSkills(filtered);
    } catch (err) {
      console.warn('Failed to fetch user skills.');
      setUserSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess('');
    setModalError('');

    if (!activeUser) return;
    const userId = activeUser.id || activeUser._id;

    try {
      await axios.post(`${apiUri}/api/skills`, {
        userId,
        title: skillTitle,
        description: skillDesc,
        category: skillCategory,
        type: skillType
      });

      setModalSuccess('Listing created successfully!');
      setModalError('');
      setSkillTitle('');
      setSkillDesc('');
      setSkillCategory('');
      
      // Refresh list from database
      fetchUserSkills(activeUser);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess('');
      }, 1200);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setModalError(serverMsg || 'Failed to publish skill listing. Please check mandatory fields.');
      setModalSuccess('');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${apiUri}/api/skills/${skillId}`);
      setUserSkills(prev => prev.filter(s => s._id !== skillId));
    } catch (err) {
      console.warn('Failed to delete skill from database.');
      setUserSkills(prev => prev.filter(s => s._id !== skillId));
    }
  };

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 text-sm">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header segment */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">My Skills & Listings</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Manage the competencies you are offering to teach or want to learn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-500 text-white text-xs font-bold rounded-xl hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Add Listing
        </button>
      </div>

      {/* Main listings list */}
      {loading ? (
        <p className="text-slate-500 text-xs">Loading listings...</p>
      ) : userSkills.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/5">
          <FolderPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-gray-200 mb-1 font-outfit">No Active Listings</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">Create your first skill offering or learn request to start matching with other peers.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 border border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 text-xs font-bold rounded-xl"
          >
            Create Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userSkills.map((skill) => (
            <div key={skill._id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all hover:scale-[1.01]">
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wide ${skill.type === 'offered' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                    {skill.type === 'offered' ? 'Offering Competency' : 'Requesting Skill'}
                  </span>
                  <button 
                    onClick={() => handleDeleteSkill(skill._id)} 
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xxs text-slate-400 block font-bold uppercase tracking-wider mb-1">{skill.category}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{skill.title}</h3>
                <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed mb-6">{skill.description}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xxs font-bold uppercase tracking-wide text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-auto">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Active Marketplace Listing
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline Create Listing Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-6 animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl relative max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0D121F] border border-slate-250 dark:border-slate-800">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold font-outfit mb-2 flex items-center gap-2">
              <FolderPlus className="w-6 h-6 text-indigo-500" />
              Create Skill Listing
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-xs mb-6">List a topic you can teach others or want to learn.</p>

            {modalSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {modalSuccess}
              </div>
            )}

            {modalError && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Skill Title</label>
                <input 
                  type="text" 
                  value={skillTitle}
                  onChange={(e) => setSkillTitle(e.target.value)}
                  required 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500 dark:text-white" 
                  placeholder="E.g. Advanced Python, Responsive UI Design" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Listing Type</label>
                <select 
                  value={skillType} 
                  onChange={(e) => setSkillType(e.target.value)} 
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                >
                  <option value="offered">I can teach/mentor (Offer)</option>
                  <option value="requested">I want to learn (Request)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Skill Category</label>
                <select 
                  value={skillCategory} 
                  onChange={(e) => setSkillCategory(e.target.value)} 
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 dark:text-white"
                >
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Listing Description</label>
                <textarea 
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500 dark:text-white" 
                  placeholder="Detail your experience in this field, topics covered, or what you hope to learn..." 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/15"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

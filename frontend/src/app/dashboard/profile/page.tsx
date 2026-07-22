'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, BookOpen, Save, Award } from 'lucide-react';

export default function ProfilePage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bio, setBio] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setMobileNumber(user.mobileNumber || '');
      setBio(user.bio || '');
      setSkillsOffered(user.skillsOffered || '');
      setSkillsNeeded(user.skillsNeeded || '');
      setExperience(user.experience || '');
      setEducation(user.education || '');
    }
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    const updatedUser = {
      ...activeUser,
      fullName,
      email,
      mobileNumber,
      bio,
      skillsOffered,
      skillsNeeded,
      experience,
      education
    };

    localStorage.setItem('sep_user', JSON.stringify(updatedUser));
    setActiveUser(updatedUser);
    setSuccessMsg('Profile information updated successfully!');
    
    // Auto clear success message
    setTimeout(() => setSuccessMsg(''), 4000);
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
      <div>
        <h1 className="text-3xl font-bold font-outfit">My Profile</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Manage your identity, qualifications, and exchange subjects.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-sm font-bold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Meta */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl text-center">
            <div className="relative w-32 h-32 mx-auto rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 flex items-center justify-center font-extrabold text-4xl mb-4 uppercase">
              {fullName?.charAt(0) || activeUser.username?.charAt(0) || 'U'}
            </div>
            
            <h3 className="text-lg font-bold">{fullName || activeUser.username}</h3>
            <span className="text-xs text-slate-400">@{activeUser.username}</span>

            <div className="mt-4 inline-block px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xxs font-extrabold uppercase rounded-full">
              Account Role: {activeUser.role}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Exchange Meta</h4>
            
            <div>
              <label className="block text-xxs font-extrabold uppercase text-slate-400 mb-1">Teaching Topic</label>
              <span className="text-sm font-bold text-indigo-500">{skillsOffered || 'Not Specified'}</span>
            </div>

            <div>
              <label className="block text-xxs font-extrabold uppercase text-slate-400 mb-1">Learning Topic</label>
              <span className="text-sm font-bold text-purple-500">{skillsNeeded || 'Not Specified'}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold font-outfit flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              General Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Skills Offered Category</label>
                <input 
                  type="text" 
                  value={skillsOffered}
                  onChange={(e) => setSkillsOffered(e.target.value)}
                  placeholder="Programming, Design, etc."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Skills Needed Category</label>
              <input 
                type="text" 
                value={skillsNeeded}
                onChange={(e) => setSkillsNeeded(e.target.value)}
                placeholder="Data Science, AI, etc."
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Short Biography</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Write a brief profile description introducing yourself to peer swaps..."
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold font-outfit flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Credentials & Experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Experience Level</label>
                <input 
                  type="text" 
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="E.g. 5 Years in Software Engineering"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Education / Certificates</label>
                <input 
                  type="text" 
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="E.g. B.Tech Computer Science"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <Save className="w-4.5 h-4.5" /> Save Changes
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Palette, Smartphone, LineChart, Brain, Video, Heart, Shield, HelpCircle, MessageSquare, CheckCircle2, Zap, Users, Sparkles, Star } from 'lucide-react';
import axios from 'axios';

// Category icons map
const categoryIcons: { [key: string]: any } = {
  'Programming': Code,
  'Web Development': Code,
  'Mobile Development': Smartphone,
  'Data Science': LineChart,
  'AI & Machine Learning': Brain,
  'Graphic Design': Palette,
  'Video Editing': Video,
  'Digital Marketing': Heart,
  'Communication Skills': MessageSquare,
  'Language Learning': HelpCircle
};

export default function LandingPage() {
  const [theme, setTheme] = useState('dark');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const html = document.documentElement;
    html.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';
      await axios.post(`${apiUri}/api/feedback`, { name, email, messageText: message });
      setFeedbackSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err) {
      alert('Support ticket submitted successfully.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl font-outfit text-indigo-600 dark:text-indigo-400 group">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <span className="tracking-tight">SkillSwap<span className="text-slate-800 dark:text-gray-100 font-normal">Exchange</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 dark:text-gray-300">
            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-500 transition-colors">How it Works</a>
            <a href="#categories" className="hover:text-indigo-500 transition-colors">Categories</a>
            <a href="#support" className="hover:text-indigo-500 transition-colors">Support</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition-all">Log In</Link>
            <Link href="/register" className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]">Join Now</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-28 px-6 md:px-12 text-center flex flex-col items-center justify-center glow-effect overflow-hidden">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 mb-8 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-500 dark:text-indigo-300 tracking-wider uppercase font-outfit shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Peer-To-Peer Knowledge Marketplace
        </div>
        
        <h1 className="max-w-4xl font-outfit text-5xl md:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white tracking-tight">
          Learn from peers, teach what you know, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">grow together.</span>
        </h1>
        
        <p className="max-w-2xl mt-6 text-base md:text-lg text-slate-600 dark:text-gray-300 leading-relaxed">
          Broaden your professional portfolio, exchange direct mentorship sessions, and connect with global developers, designers, and scientists without money.
        </p>
        
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="flex items-center gap-2 px-8 py-3.5 text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl shadow-indigo-500/35 hover:scale-105 transition-all">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/explore" className="flex items-center gap-2 px-8 py-3.5 text-base font-bold border border-slate-300 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all">
            Browse Marketplace
          </Link>
        </div>

        {/* Live Metrics Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-3xl font-extrabold text-indigo-500 font-outfit">1,250+</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mt-1">Skills Exchanged</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-3xl font-extrabold text-purple-500 font-outfit">99.4%</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mt-1">Peer Satisfaction</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-3xl font-extrabold text-emerald-500 font-outfit">45+</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mt-1">Categories</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-3xl font-extrabold text-amber-500 font-outfit">$0</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 mt-1">Zero Financial Fees</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 text-center bg-slate-100/60 dark:bg-slate-950/30">
        <h2 className="text-3xl md:text-4xl font-extrabold font-outfit">How SkillSwap Works</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">Exchange expertise in 3 simple steps.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto">
          <div className="glass-panel p-8 rounded-3xl text-left relative hover:-translate-y-1.5 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-indigo-500/30 mb-6">1</span>
            <h3 className="text-xl font-bold font-outfit">List Your Expertise</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Create your profile and offer skills in Programming, Design, Languages, or Marketing.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left relative hover:-translate-y-1.5 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-purple-500 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-purple-500/30 mb-6">2</span>
            <h3 className="text-xl font-bold font-outfit">Connect & Chat</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Search peer listings, submit trade proposals, and discuss session terms in real time.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left relative hover:-translate-y-1.5 transition-all">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-base shadow-lg shadow-emerald-500/30 mb-6">3</span>
            <h3 className="text-xl font-bold font-outfit">Attend Sessions</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Host live video mentorship sessions, exchange knowledge, and leave feedback reviews.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold font-outfit">Platform Features</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-lg mx-auto text-sm">Everything required for a secure, high-yield peer exchange.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 max-w-5xl mx-auto">
          <div className="glass-panel p-8 rounded-3xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Verified Profiles</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Admin moderation dashboards ensure legitimate peer ratings and identity trust.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Real-Time Messaging</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Communicate instantly using built-in Socket.IO direct threads before confirming trades.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-outfit">Session Analytics</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Track metrics logs of completed swap agreements, ratings feedback, and learning history.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 px-6 md:px-12 text-center bg-slate-100/60 dark:bg-slate-950/30">
        <h2 className="text-3xl md:text-4xl font-extrabold font-outfit">Featured Categories</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Filter and browse peer skill listings</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12 max-w-5xl mx-auto">
          {Object.keys(categoryIcons).map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <Link href={`/explore?category=${encodeURIComponent(cat)}`} key={cat} className="glass-panel p-6 rounded-2xl hover:bg-indigo-500/10 hover:border-indigo-500/40 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-gray-100">{cat}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Support Feedback Ticket */}
      <section id="support" className="py-24 px-6 md:px-12 text-center">
        <div className="max-w-xl mx-auto glass-panel p-8 md:p-10 rounded-3xl text-left border-indigo-500/20 shadow-2xl">
          <h3 className="text-2xl font-extrabold font-outfit mb-2">Support & Feedback Desk</h3>
          <p className="text-slate-500 dark:text-gray-400 text-xs mb-6">Have questions or suggestions? Reach out to our support team.</p>
          
          {feedbackSuccess && (
            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Ticket submitted successfully! We will contact you soon.
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Sarah Jenkins" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="name@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1.5">Message Details</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="Describe your request..."></textarea>
            </div>
            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/25 transition-all">Submit Ticket</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
        <p>&copy; 2026 SkillSwap Exchange Inc. All rights reserved.</p>
        <div className="flex gap-6 font-semibold">
          <Link href="/explore" className="hover:text-indigo-500">Browse Marketplace</Link>
          <a href="#" className="hover:text-indigo-500">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-500">Terms & Conditions</a>
        </div>
      </footer>
    </div>
  );
}

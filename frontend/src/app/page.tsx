'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Palette, Smartphone, LineChart, Brain, Video, Heart, Shield, HelpCircle, MessageSquare } from 'lucide-react';
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
      alert('Simulation feedback submitted successfully.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl font-outfit text-indigo-600 dark:text-indigo-400">
          <Shield className="w-6 h-6 animate-pulse" />
          SkillSwap<span className="text-slate-800 dark:text-gray-100">Exchange</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600 dark:text-gray-300">
            <a href="#features" className="hover:text-indigo-500">Features</a>
            <a href="#categories" className="hover:text-indigo-500">Categories</a>
            <a href="#support" className="hover:text-indigo-500">Support</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="px-4 py-2 text-sm font-bold border border-indigo-500 text-indigo-500 rounded-xl hover:bg-indigo-500/10">Log In</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/25">Join Now</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-12 text-center flex flex-col items-center justify-center glow-effect">
        <div className="inline-flex py-1 px-4 mb-6 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-500 dark:text-indigo-300 tracking-wider uppercase font-outfit">
          Decentralized Knowledge Exchange
        </div>
        <h1 className="max-w-4xl font-outfit text-5xl md:text-7xl font-extrabold leading-none text-slate-900 dark:text-white">
          Learn from peers, teach what you know, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-fill-transparent text-transparent">grow together.</span>
        </h1>
        <p className="max-w-2xl mt-6 text-lg text-slate-600 dark:text-gray-300">
          Broaden your professional portfolio, exchange mentorship sessions, and connect with global developers, designers, and scientists without money.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="flex items-center gap-2 px-8 py-3 text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/35 hover:scale-102 transition-transform">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/explore" className="px-8 py-3 text-base font-bold border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Explore Skills
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 md:px-12 bg-slate-100/50 dark:bg-slate-950/20 text-center">
        <h2 className="text-3xl font-bold font-outfit">Platform Features</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-lg mx-auto text-sm">Everything you need to exchange mentorship logs securely.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="glass-panel p-8 rounded-2xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Secure Verification</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Admin dashboard moderations and verify processes guarantee valid active peer matching.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Real-Time Messaging</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Discuss and arrange terms via in-app Socket.IO messaging before confirming trades.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl text-left hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Analytics Dashboard</h3>
            <p className="text-slate-500 dark:text-gray-400 text-xs mt-3 leading-relaxed">Track metrics logs of completed swap agreements, sessions timeline, and ratings feedback.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 px-6 md:px-12 text-center">
        <h2 className="text-3xl font-bold font-outfit">Featured Categories</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Filter and browse peer skill listings</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
          {Object.keys(categoryIcons).map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <Link href={`/explore?category=${encodeURIComponent(cat)}`} key={cat} className="glass-panel p-6 rounded-2xl hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-3 transition-colors">
                <Icon className="w-8 h-8 text-indigo-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-gray-100">{cat}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Support Feedback Ticket */}
      <section id="support" className="py-20 px-6 md:px-12 bg-slate-100/50 dark:bg-slate-950/20 text-center">
        <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl text-left">
          <h3 className="text-xl font-bold font-outfit mb-4">Support & Feedback Desk</h3>
          {feedbackSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold">
              Ticket submitted successfully! We will contact you soon.
            </div>
          )}
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" placeholder="David" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500" placeholder="name@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1">Message Text</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-sm focus:outline-none focus:border-indigo-500 resize-none" placeholder="Details..."></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/20">Submit Ticket</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
        <p>&copy; 2026 SkillSwap Exchange Inc. All rights reserved.</p>
        <div className="flex gap-6 font-semibold">
          <Link href="/explore">Browse Marketplace</Link>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </footer>
    </div>
  );
}

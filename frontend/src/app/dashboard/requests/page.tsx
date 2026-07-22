'use client';

import React, { useEffect, useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Clock, Sparkles, MessageSquare, Video, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

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

export default function RequestsPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [sentRequests, setSentRequests] = useState<RequestItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchRequests(user);
    }
  }, []);

  const fetchRequests = async (user: any) => {
    const userId = user.id || user._id;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      setSentRequests(res.data.sent || []);
      setReceivedRequests(res.data.received || []);
    } catch (err) {
      console.warn('Failed to fetch requests.');
      setSentRequests([]);
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoRequests = () => {
    if (!activeUser) return;
    const userId = activeUser.id || activeUser._id;
    
    setSentRequests([
      {
        _id: 'demo_req_1',
        requesterId: { _id: userId, fullName: activeUser.fullName, username: activeUser.username },
        providerId: { _id: 'u1', fullName: 'Sarah Jenkins', username: 'sarah_j' },
        skillId: { _id: 's101', title: 'Swift & iOS Core Architecture', category: 'Mobile Development' },
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]);
    
    setReceivedRequests([
      {
        _id: 'demo_req_2',
        requesterId: { _id: 'u2', fullName: 'Alex Rivera', username: 'alex_r' },
        providerId: { _id: userId, fullName: activeUser.fullName, username: activeUser.username },
        skillId: { _id: 's202', title: 'Interactive Figma Prototyping', category: 'Graphic Design' },
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  };

  const handleUpdateRequest = async (requestId: string, newStatus: string) => {
    if (!activeUser) return;
    const userId = activeUser.id || activeUser._id;

    try {
      await axios.put(`${apiUri}/api/requests/${requestId}`, {
        status: newStatus
      });
      fetchRequests(userId);
    } catch (err) {
      // Offline fallback state updater
      setReceivedRequests(prev => 
        prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r)
      );
      setSentRequests(prev => 
        prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r)
      );
    }
  };

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 text-sm">Loading user session...</p>
      </div>
    );
  }

  const hasNoRequests = sentRequests.length === 0 && receivedRequests.length === 0;

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Swap Inquiries & Requests</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Review connection requests from peers requesting to swap learning sessions.</p>
        </div>

        {hasNoRequests && !loading && (
          <button 
            onClick={seedDemoRequests}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:brightness-110 flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" /> Generate Demo Requests
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Received requests list */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800/80">
          <h2 className="text-xl font-bold font-outfit mb-1">Received Requests</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs mb-6">Users wanting to connect with you.</p>

          {loading ? (
            <p className="text-slate-500 text-xs">Loading received requests...</p>
          ) : receivedRequests.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/5">
              <Clock className="w-10 h-10 text-slate-350 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-slate-850 dark:text-gray-300 mb-1">No Received Requests</h4>
              <p className="text-slate-400 text-xxs max-w-xs mx-auto">When other peers request to learn your skills, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((req) => (
                <div key={req._id} className="p-5 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl bg-slate-100/10 flex flex-col justify-between gap-4 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <strong className="text-sm block font-bold">{req.requesterId?.fullName}</strong>
                        <span className="text-xxs text-slate-450 block">@{req.requesterId?.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <span className="text-xxs text-slate-400 block uppercase tracking-wider font-extrabold">{req.skillId?.category || 'Exchange Topic'}</span>
                    <span className="text-xs text-slate-650 dark:text-gray-300 block">
                      Wants to swap for: <span className="font-bold text-indigo-500">{req.skillId?.title}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 mt-2">
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2 w-full justify-end">
                        <button 
                          onClick={() => handleUpdateRequest(req._id, 'rejected')}
                          className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleUpdateRequest(req._id, 'accepted')}
                          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept Swap
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className={`px-3 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wide ${req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                          Status: {req.status}
                        </span>

                        {req.status === 'accepted' && (
                          <div className="flex items-center gap-2">
                            <Link href="/dashboard/messages" className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/15" title="Go to Chat">
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                            <Link href="/dashboard/sessions" className="p-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-xl border border-purple-500/15" title="Go to Video Call">
                              <Video className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent requests list */}
        <div className="glass-panel p-6 rounded-2xl border-slate-200 dark:border-slate-800/80">
          <h2 className="text-xl font-bold font-outfit mb-1">Sent Requests</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs mb-6">Inquiries you sent to peer instructors.</p>

          {loading ? (
            <p className="text-slate-500 text-xs">Loading sent requests...</p>
          ) : sentRequests.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/5">
              <Clock className="w-10 h-10 text-slate-350 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-slate-850 dark:text-gray-300 mb-1">No Sent Requests</h4>
              <p className="text-slate-400 text-xxs max-w-xs mx-auto">When you request swap sessions from the marketplace, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((req) => (
                <div key={req._id} className="p-5 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl bg-slate-100/10 flex flex-col justify-between gap-4 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <strong className="text-sm block font-bold">Recipient: {req.providerId?.fullName}</strong>
                        <span className="text-xxs text-slate-450 block">@{req.providerId?.username}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="text-xxs text-slate-400 block uppercase tracking-wider font-extrabold">{req.skillId?.category || 'Exchange Topic'}</span>
                    <span className="text-xs text-slate-655 dark:text-gray-300 block">
                      Topic requested: <span className="font-bold text-indigo-500">{req.skillId?.title}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xxs font-extrabold uppercase tracking-wide ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                      Status: {req.status}
                    </span>

                    {req.status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        <Link href="/dashboard/messages" className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/15" title="Go to Chat">
                          <MessageSquare className="w-4 h-4" />
                        </Link>
                        <Link href="/dashboard/sessions" className="p-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 rounded-xl border border-purple-500/15" title="Go to Video Call">
                          <Video className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

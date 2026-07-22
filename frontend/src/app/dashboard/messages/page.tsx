'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Mail, Send, User } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import Link from 'next/link';

interface MessageItem {
  _id?: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  createdAt: string;
}

interface PeerItem {
  id: string;
  fullName: string;
  username: string;
  category: string;
}

export default function MessagesPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [peers, setPeers] = useState<PeerItem[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchActivePeers(user);
    }
  }, []);

  const fetchActivePeers = async (user: any) => {
    const userId = user.id || user._id;
    try {
      const res = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      const sent = res.data.sent || [];
      const received = res.data.received || [];
      const allRequests = [...sent, ...received];
      
      // Filter for accepted requests (active matches)
      const accepted = allRequests.filter(r => r.status === 'accepted');

      // Map accepted requests to PeerItem list
      const dbPeers: PeerItem[] = accepted.map(r => {
        const isRequester = r.requesterId && (r.requesterId._id === userId || r.requesterId === userId);
        const partner = isRequester ? r.providerId : r.requesterId;
        const partnerName = partner ? (partner.fullName || `@${partner.username}`) : 'Peer';
        const partnerUsername = partner ? (partner.username || 'peer') : 'peer';
        const partnerId = partner ? (partner._id || partner) : 'unknown';
        const category = r.skillId ? r.skillId.category : 'Exchange Topic';

        return {
          id: partnerId,
          fullName: partnerName,
          username: partnerUsername,
          category
        };
      });

      // Filter unique peers
      const uniquePeers = dbPeers.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setPeers(uniquePeers);
    } catch (err) {
      console.warn('Failed to load active peers.');
      setPeers([]);
    }
  };

  // Connect to Socket.IO and fetch messages on peer selection
  useEffect(() => {
    if (!activeUser || !selectedPeer) return;

    // Connect to websocket server
    const socket = io(apiUri);
    socketRef.current = socket;

    const userId = activeUser.id || activeUser._id;
    socket.emit('join_room', { userId, roomPartnerId: selectedPeer.id });

    // Listen for live messages
    socket.on('receive_message', (msg: MessageItem) => {
      setMessages(prev => [...prev, msg]);
    });

    // Fetch REST history
    fetchMessageHistory(userId, selectedPeer.id);

    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedPeer]);

  // Scroll chats down on message additions
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessageHistory = async (userId: string, peerId: string) => {
    try {
      const res = await axios.get(`${apiUri}/api/messages`, {
        params: { userId, peerId }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.warn('Failed to load message history via REST API.');
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !selectedPeer) return;

    const userId = activeUser.id || activeUser._id;
    const msgData = {
      senderId: userId,
      receiverId: selectedPeer.id,
      messageText: newMessage,
      createdAt: new Date().toISOString()
    };

    // Emit live to socket room
    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    try {
      // Save permanently to DB
      await axios.post(`${apiUri}/api/messages`, msgData);
      
      // If server does not broadcast back to self via socket, append locally:
      setMessages(prev => {
        // Avoid duplicate appends if socket already broadcasted it
        const exists = prev.some(m => m.messageText === msgData.messageText && m.senderId === userId && (new Date(m.createdAt).getTime() - new Date(msgData.createdAt).getTime() < 1000));
        return exists ? prev : [...prev, msgData];
      });
    } catch (err) {
      // Offline fallback append
      setMessages(prev => [...prev, msgData]);
    }

    setNewMessage('');
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
        <h1 className="text-3xl font-bold font-outfit">Messages</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Chat in real-time with peer instructors to schedule your swap sessions.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[60vh] max-h-[70vh]">
        
        {/* Chat sidebar: Peer thread lists */}
        <div className="w-full md:w-80 border-r border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] p-4 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Active Conversations</h3>
          
          <div className="space-y-1.5 overflow-y-auto flex-1">
            {peers.length === 0 ? (
              <div className="text-center py-8 px-3 border border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl bg-slate-100/5">
                <span className="text-[10px] font-semibold text-slate-400 block mb-3 leading-relaxed">
                  No active conversations found. Connect with peers in the marketplace or accept swap requests to start chatting!
                </span>
                <Link href="/explore" className="inline-block px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-[10px] font-bold text-white rounded-lg transition-transform hover:scale-[1.02]">
                  Find Peers
                </Link>
              </div>
            ) : (
              peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                return (
                  <button
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                      {peer.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden font-outfit">
                      <span className="text-xs font-bold block truncate">{peer.fullName}</span>
                      <span className={`text-xxs block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {peer.category}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat thread view window */}
        <div className="flex-1 flex flex-col bg-slate-100/5 dark:bg-[#0A0D16]">
          {selectedPeer ? (
            <>
              {/* Active thread header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                  {selectedPeer.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{selectedPeer.fullName}</h4>
                  <span className="text-xxs text-slate-400 block">Active Exchange discussion</span>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                  const isSelf = msg.senderId === (activeUser.id || activeUser._id);
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-gray-200 rounded-tl-none'}`}>
                        <p>{msg.messageText}</p>
                        <span className={`text-[9px] block text-right mt-1.5 ${isSelf ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Form input messaging bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] flex gap-3">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Send a secure message to ${selectedPeer.fullName}...`}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-xs focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="p-2.5 bg-indigo-500 text-white rounded-xl hover:brightness-110 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Mail className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-850 dark:text-gray-200 mb-1">Your Chat Inbox</h3>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">Select a conversation thread on the sidebar to read history and send real-time exchange messages.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

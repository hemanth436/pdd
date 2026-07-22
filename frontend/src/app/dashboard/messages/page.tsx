'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Mail, Send, User, Bell, CheckCircle2, Circle } from 'lucide-react';
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
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [notificationToast, setNotificationToast] = useState<{ senderName: string; text: string; peerObj: PeerItem } | null>(null);

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUri = process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5001' && process.env.NEXT_PUBLIC_API_URL !== 'http://localhost:5000' ? process.env.NEXT_PUBLIC_API_URL : '';

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchAcceptedPeers(user);
    }
  }, []);

  // Global socket connection for online status & global message notifications
  useEffect(() => {
    if (!activeUser) return;
    const userId = activeUser.id || activeUser._id;

    const socket = io(apiUri);
    socketRef.current = socket;

    // Register active user online status
    socket.emit('user_online', { userId });
    socket.emit('get_online_users');

    // Listen for online users updates
    socket.on('online_users_list', (list: string[]) => {
      setOnlineUserIds(list || []);
    });

    // Listen for global message notifications from peers
    socket.on('message_notification', (msg: MessageItem) => {
      if (msg.receiverId === userId || msg.receiverId?.toString() === userId?.toString()) {
        const peerMatch = peers.find(p => p.id === msg.senderId || p.id.toString() === msg.senderId.toString());
        const senderName = peerMatch ? peerMatch.fullName : 'Peer Instructor';
        
        setNotificationToast({
          senderName,
          text: msg.messageText,
          peerObj: peerMatch || { id: msg.senderId, fullName: senderName, username: 'peer', category: 'Swap Session' }
        });

        // Auto-dismiss notification toast after 4 seconds
        setTimeout(() => setNotificationToast(null), 4000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeUser, peers]);

  const fetchAcceptedPeers = async (user: any) => {
    const userId = user.id || user._id;
    try {
      const res = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      const sent = res.data.sent || [];
      const received = res.data.received || [];
      const allRequests = [...sent,...received];
      
      // Filter strictly for accepted swap requests
      const accepted = allRequests.filter(r => r.status === 'accepted');

      // Map accepted requests to PeerItem list
      const dbPeers: PeerItem[] = accepted.map(r => {
        const isRequester = r.requesterId && (r.requesterId._id === userId || r.requesterId === userId);
        const partner = isRequester ? r.providerId : r.requesterId;
        const partnerName = partner ? (partner.fullName || `@${partner.username}`) : 'Peer Instructor';
        const partnerUsername = partner ? (partner.username || 'peer') : 'peer';
        const partnerId = partner ? (partner._id || partner.id || partner) : 'unknown';
        const category = r.skillId ? r.skillId.category : 'Accepted Swap Session';

        return {
          id: partnerId,
          fullName: partnerName,
          username: partnerUsername,
          category
        };
      });

      // Default peer contact if user has no accepted swap requests yet
      const defaultPeers: PeerItem[] = [
        {
          id: '65b2f2d9-c12b-4b27-a812-345678901234',
          fullName: 'Hemanth Reddy (Admin)',
          username: 'admin',
          category: 'Web Development Swap'
        },
        {
          id: '65b2f2d9-c12b-4b27-a812-345678901235',
          fullName: 'Sarah Jenkins',
          username: 'demo',
          category: 'Mobile Application Swap'
        }
      ];

      const combinedPeers = [...dbPeers, ...defaultPeers];
      const uniquePeers = combinedPeers.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setPeers(uniquePeers);
    } catch (err) {
      console.warn('Failed to load accepted peers.');
      setPeers([]);
    }
  };

  // Connect to Socket.IO thread room and fetch messages on peer selection
  useEffect(() => {
    if (!activeUser || !selectedPeer || !socketRef.current) return;

    const userId = activeUser.id || activeUser._id;
    const socket = socketRef.current;

    socket.emit('join_room', { userId, roomPartnerId: selectedPeer.id });

    // Listen for live messages in current room
    socket.off('receive_message');
    socket.on('receive_message', (msg: MessageItem) => {
      if (msg.senderId === selectedPeer.id || msg.receiverId === selectedPeer.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    // Fetch REST history
    fetchMessageHistory(userId, selectedPeer.id);
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
    const msgData: MessageItem = {
      senderId: userId,
      receiverId: selectedPeer.id,
      messageText: newMessage,
      createdAt: new Date().toISOString()
    };

    // Emit live to socket room
    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    setMessages(prev => [...prev, msgData]);
    setNewMessage('');

    try {
      // Save permanently to Supabase DB
      await axios.post(`${apiUri}/api/messages`, msgData);
    } catch (err) {
      console.warn('Message saved locally.');
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
    <div className="space-y-8 relative">
      {/* Floating Message Notification Toast */}
      {notificationToast && (
        <div className="fixed top-6 right-6 z-[100] glass-panel bg-[#0D121F] border border-indigo-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white max-w-sm animate-bounce">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <strong className="text-xs font-bold block truncate">{notificationToast.senderName}</strong>
            <p className="text-xxs text-slate-300 truncate mt-0.5">{notificationToast.text}</p>
          </div>
          <button 
            onClick={() => {
              setSelectedPeer(notificationToast.peerObj);
              setNotificationToast(null);
            }} 
            className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-lg"
          >
            Reply
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold font-outfit">Messages</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Chat in real-time with peers who accepted your swap requests.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[65vh] max-h-[75vh]">
        
        {/* Chat sidebar: Accepted peer thread lists with Online Status */}
        <div className="w-full md:w-80 border-r border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] p-4 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Accepted Swap Contacts</h3>
          
          <div className="space-y-1.5 overflow-y-auto flex-1">
            {peers.length === 0 ? (
              <div className="text-center py-8 px-3 border border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl bg-slate-100/5">
                <span className="text-[10px] font-semibold text-slate-400 block mb-3 leading-relaxed">
                  No accepted swap contacts found yet. Accept swap requests to start chatting!
                </span>
                <Link href="/dashboard/requests" className="inline-block px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-[10px] font-bold text-white rounded-lg transition-transform hover:scale-[1.02]">
                  View Requests
                </Link>
              </div>
            ) : (
              peers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                const isOnline = onlineUserIds.some(id => id.toString() === peer.id.toString() || id.toString() === peer.username.toString());

                return (
                  <button
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>
                          {peer.fullName.charAt(0)}
                        </div>
                        {/* Real-time Online Indicator Badge */}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${isSelected ? 'border-indigo-500' : 'border-[#0D121F]'} ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      </div>

                      <div className="overflow-hidden font-outfit">
                        <span className="text-xs font-bold block truncate">{peer.fullName}</span>
                        <span className={`text-xxs block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {peer.category}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isOnline ? (isSelected ? 'bg-emerald-400/20 text-emerald-200' : 'bg-emerald-500/10 text-emerald-400') : 'text-slate-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
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
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs uppercase">
                      {selectedPeer.fullName.charAt(0)}
                    </div>
                    {/* Header Online Status Badge */}
                    {onlineUserIds.some(id => id.toString() === selectedPeer.id.toString() || id.toString() === selectedPeer.username.toString()) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0D121F]"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{selectedPeer.fullName}</h4>
                    <span className="text-xxs text-slate-400 block">
                      {selectedPeer.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase ${onlineUserIds.some(id => id.toString() === selectedPeer.id.toString() || id.toString() === selectedPeer.username.toString()) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    {onlineUserIds.some(id => id.toString() === selectedPeer.id.toString() || id.toString() === selectedPeer.username.toString()) ? '🟢 Online Now' : '⚪ Offline'}
                  </span>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <p className="font-semibold text-slate-300">No previous messages.</p>
                    <p className="text-xxs text-slate-500 mt-1">Send a message to start real-time chat with {selectedPeer.fullName}!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.senderId === (activeUser.id || activeUser._id);
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${isSelf ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 text-slate-800 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
                          <p>{msg.messageText}</p>
                          <span className={`text-[9px] block text-right mt-1.5 ${isSelf ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form input messaging bar */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-[#0D121F] flex gap-3">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type a message to ${selectedPeer.fullName}...`}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent text-xs focus:outline-none focus:border-indigo-500 dark:text-white"
                />
                <button type="submit" className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:brightness-110 flex items-center justify-center shadow-lg shadow-indigo-500/15">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Mail className="w-12 h-12 text-indigo-400/60 mb-3" />
              <h3 className="text-base font-bold text-slate-850 dark:text-gray-200 mb-1">Your Chat Inbox</h3>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">Select an accepted peer contact on the sidebar to view online status and start real-time messaging.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

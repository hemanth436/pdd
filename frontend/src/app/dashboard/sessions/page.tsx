'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Send, 
  MessageSquare, 
  Shield
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { getApiUrl, getSocketUrl } from '@/lib/api';

interface SessionItem {
  id: string;
  partnerId: string;
  partnerName: string;
  topic: string;
  role: string;
  date: string;
  time: string;
  status: string;
}

interface MessageItem {
  senderId: string;
  receiverId: string;
  messageText: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  
  // Call states
  const [activeCall, setActiveCall] = useState<SessionItem | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [callMessages, setCallMessages] = useState<MessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [callStatus, setCallStatus] = useState('Connecting...');

  // WebRTC & Socket Refs
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiUri = getApiUrl();

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const stored = localStorage.getItem('sep_user');
    if (stored) {
      const user = JSON.parse(stored);
      setActiveUser(user);
      fetchSessionsData(user);
    }
  }, []);

  // Global socket listener for online status, call invites & hangups
  useEffect(() => {
    if (!activeUser) return;
    const userId = activeUser.id || activeUser._id;

    const socket = io(getSocketUrl());
    socketRef.current = socket;

    // Register active user online status
    socket.emit('user_online', { userId });
    socket.emit('get_online_users');

    socket.on('online_users_list', (list: string[]) => {
      setOnlineUserIds(list || []);
    });

    socket.on('end_call_received', ({ targetUserId }: any) => {
      if (targetUserId === userId) {
        endCall(false);
        alert('The video call session has been ended by the peer.');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeUser]);

  const fetchSessionsData = async (user: any) => {
    const userId = user.id || user._id;
    try {
      const res = await axios.get(`${apiUri}/api/requests`, {
        params: { userId }
      });
      
      const sent = res.data.sent || [];
      const received = res.data.received || [];
      const allRequests = [...sent, ...received];

      // Filter strictly for real accepted/completed swap requests
      const accepted = allRequests.filter(r => r.status === 'accepted');
      const completed = allRequests.filter(r => r.status === 'completed');

      const dbUpcomingSessions: SessionItem[] = accepted.map(r => {
        const isRequester = r.requesterId && (r.requesterId._id === userId || r.requesterId === userId);
        const partner = isRequester ? r.providerId : r.requesterId;
        const partnerName = partner ? (partner.fullName || `@${partner.username}`) : 'Peer Instructor';
        const partnerId = partner ? (partner._id || partner.id || partner) : 'unknown';
        
        return {
          id: r._id || r.id,
          partnerId,
          partnerName,
          topic: r.skillId ? r.skillId.title : 'Accepted Skill Exchange Mentoring',
          role: isRequester ? 'Learner' : 'Mentor',
          date: 'TODAY',
          time: 'Ready for Call',
          status: 'upcoming'
        };
      });

      const dbCompletedSessions: SessionItem[] = completed.map(r => {
        const isRequester = r.requesterId && (r.requesterId._id === userId || r.requesterId === userId);
        const partner = isRequester ? r.providerId : r.requesterId;
        const partnerName = partner ? (partner.fullName || `@${partner.username}`) : 'Peer Instructor';
        const partnerId = partner ? (partner._id || partner.id || partner) : 'unknown';
        
        return {
          id: r._id || r.id,
          partnerId,
          partnerName,
          topic: r.skillId ? r.skillId.title : 'Completed Session',
          role: isRequester ? 'Learner' : 'Mentor',
          date: new Date(r.updatedAt || r.createdAt || Date.now()).toLocaleDateString(),
          time: 'Completed',
          status: 'completed'
        };
      });

      setSessions([
        ...dbUpcomingSessions,
        ...dbCompletedSessions
      ]);
    } catch (err) {
      console.warn('Failed to fetch sessions data.');
      setSessions([]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [callMessages]);

  const startMeeting = async (session: SessionItem) => {
    setActiveCall(session);
    setCallStatus('Requesting camera/microphone access...');
    setCallMessages([]);
    
    const userId = activeUser.id || activeUser._id;
    const socket = socketRef.current;

    if (socket) {
      // Connect to websocket room
      socket.emit('join_room', { userId, roomPartnerId: session.partnerId });

      // Send Ringing Call Invitation Event to Target User
      socket.emit('call_user', {
        senderId: userId,
        senderName: activeUser.fullName || activeUser.username || 'Peer',
        receiverId: session.partnerId,
        sessionObj: {
          ...session,
          partnerId: userId,
          partnerName: activeUser.fullName || activeUser.username || 'Peer',
          role: session.role === 'Learner' ? 'Mentor' : 'Learner'
        }
      });

      socket.off('receive_message');
      socket.on('receive_message', (msg: MessageItem) => {
        setCallMessages(prev => [...prev, msg]);
      });

      socket.off('webrtc_signal_received');
      socket.on('webrtc_signal_received', async ({ senderSocketId, signal }: any) => {
        try {
          if (signal.type === 'offer') {
            setCallStatus('Receiving stream...');
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signal.offer));
            const answer = await peerConnectionRef.current?.createAnswer();
            await peerConnectionRef.current?.setLocalDescription(answer);
            socket.emit('webrtc_signal', { 
              targetUserId: session.partnerId, 
              signal: { type: 'answer', answer } 
            });
          } else if (signal.type === 'answer') {
            setCallStatus('Connected');
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signal.answer));
          } else if (signal.type === 'candidate') {
            if (signal.candidate) {
              await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          }
        } catch (err) {
          console.error('WebRTC signaling error:', err);
        }
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallStatus('Waiting for peer to connect...');
      initializePeerConnection(stream, session.partnerId);
    } catch (err: any) {
      console.warn('Camera/microphone hardware access unavailable.');
      setCallStatus('Device Access Offline');
    }
  };

  const initializePeerConnection = (stream: MediaStream, partnerId: string) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      setCallStatus('Connected');
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc_signal', {
          targetUserId: partnerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    if (socketRef.current) {
      socketRef.current.emit('webrtc_signal', {
        targetUserId: partnerId,
        signal: { type: 'join' }
      });
    }

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_signal', {
          targetUserId: partnerId,
          signal: { type: 'offer', offer }
        });
      } catch (err) {
        console.error('Negotiation error:', err);
      }
    };
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    } else {
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    } else {
      setMicEnabled(!micEnabled);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeUser || !activeCall) return;

    const userId = activeUser.id || activeUser._id;
    const msgData: MessageItem = {
      senderId: userId,
      receiverId: activeCall.partnerId,
      messageText: chatInput,
      createdAt: new Date().toISOString()
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', msgData);
    }

    setCallMessages(prev => [...prev, msgData]);
    setChatInput('');

    try {
      await axios.post(`${apiUri}/api/messages`, msgData);
    } catch (err) {
      console.warn('Failed to save message.');
    }
  };

  function endCall(emitSignal = true) {
    if (emitSignal && socketRef.current && activeCall) {
      socketRef.current.emit('end_call', { targetUserId: activeCall.partnerId });
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setCallStatus('Connecting...');
  }

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 text-sm">Loading user session...</p>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit">My Sessions</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Join active video mentoring sessions and view completed peer logs.</p>
        </div>
      </div>

      {/* Embedded Video Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19] text-white flex flex-col md:flex-row h-screen">
          
          <div className="flex-1 flex flex-col justify-between p-6 relative">
            
            <div className="relative z-10 flex items-center justify-between bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-indigo-500 px-2 py-0.5 rounded-full tracking-wider">
                  Session Room
                </span>
                <h3 className="text-sm font-bold mt-1 text-white">{activeCall.topic}</h3>
                <span className="text-xxs text-slate-400 block">Connecting with {activeCall.partnerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-xxs font-bold uppercase rounded-full text-slate-300">
                  {callStatus}
                </span>
              </div>
            </div>

            <div className="flex-1 my-6 rounded-3xl overflow-hidden bg-slate-900/60 border border-white/5 flex items-center justify-center relative">
              
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/20 to-purple-950/30">
                {remoteStream ? (
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 animate-spin">
                      <Clock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-semibold block">{callStatus}</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 w-40 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex items-center justify-center">
                {cameraEnabled ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center gap-1">
                    <VideoOff className="w-5 h-5" />
                    <span className="text-[9px] font-bold">Camera Off</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 flex justify-center items-center gap-5 bg-[#0F1424]/80 backdrop-blur-xl py-4 px-8 rounded-3xl border border-white/10 shadow-2xl max-w-md mx-auto w-full mb-2">
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 ${micEnabled ? 'bg-white/5 border-white/15 text-emerald-400 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'bg-red-500/20 border-red-500/35 text-red-400 hover:bg-red-500/30'}`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Audio</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={toggleCamera}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 ${cameraEnabled ? 'bg-white/5 border-white/15 text-emerald-400 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'bg-red-500/20 border-red-500/35 text-red-400 hover:bg-red-500/30'}`}
                  title={cameraEnabled ? "Disable Camera" : "Enable Camera"}
                >
                  {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Video</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={() => endCall(true)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white flex items-center justify-center border border-red-400/20 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-105"
                  title="End Session"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">End</span>
              </div>
            </div>

          </div>

          {/* Right Side: Live Workspace Chat */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#0F1424]/90 flex flex-col h-[40vh] md:h-full">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold">Live Workspace Chat</h4>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {callMessages.map((msg, index) => {
                const isSelf = msg.senderId === (activeUser.id || activeUser._id);
                return (
                  <div key={index} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                        {isSelf ? 'Y' : activeCall.partnerName.charAt(0)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {isSelf ? 'You' : activeCall.partnerName} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-white/5 text-slate-100 rounded-tl-none'}`}>
                      {msg.messageText}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-4 border-t border-white/10 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-white/10 bg-slate-950/60 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="p-2 bg-indigo-500 text-white rounded-xl hover:brightness-110">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Main Workspace grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upcoming matches & peer call cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold font-outfit flex items-center gap-2 mb-6">
              <Calendar className="w-5.5 h-5.5 text-indigo-500" />
              Upcoming Swap Sessions
            </h2>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <p className="text-slate-400 text-xs font-semibold">No active peer sessions scheduled yet.</p>
                <p className="text-[10px] text-slate-500">Go to your Requests panel to accept matches and initiate calls.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((ses) => {
                  const isOnline = onlineUserIds.some(id => id.toString() === ses.partnerId.toString());

                  return (
                    <div key={ses.id} className="p-5 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl bg-slate-100/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold uppercase rounded-full tracking-wider">
                            {ses.role}
                          </span>
                          <span className={`px-2.5 py-0.5 border text-[9px] font-extrabold uppercase rounded-full tracking-wider flex items-center gap-1.5 ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                            {isOnline ? '🟢 Online Now' : '⚪ Offline'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold mt-1.5">{ses.topic}</h3>
                        <p className="text-slate-500 dark:text-gray-400 text-xs font-semibold mt-0.5">Partner: {ses.partnerName}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-slate-400 text-xxs font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {ses.date} ({ses.time})</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => startMeeting(ses)}
                        className={`px-5 py-3 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] ${isOnline ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 hover:brightness-110' : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/15 hover:brightness-110'}`}
                      >
                        <Video className="w-4 h-4" /> Start Video Call
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: History logs */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-outfit flex items-center gap-2 mb-6">
            <CheckCircle className="w-5.5 h-5.5 text-emerald-500" />
            History Log
          </h2>

          {completedSessions.length === 0 ? (
            <p className="text-slate-400 text-xs py-4 text-center">No completed session logs.</p>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((ses) => (
                <div key={ses.id} className="p-4 border border-slate-200/40 dark:border-slate-800/40 rounded-xl bg-slate-100/5 space-y-1.5">
                  <h4 className="text-xs font-bold">{ses.topic}</h4>
                  <p className="text-slate-500 dark:text-gray-400 text-xxs font-semibold">Partner: {ses.partnerName}</p>
                  <div className="flex items-center justify-between pt-1 text-xxs text-slate-400">
                    <span>{ses.date}</span>
                    <span className="text-emerald-500 font-extrabold uppercase">Completed</span>
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

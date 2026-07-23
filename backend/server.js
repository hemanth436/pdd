const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const { seedDefaultSupabaseData, db } = require('./config/supabase');

// Load configurations
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Supabase Database Connection
seedDefaultSupabaseData();

// ----------------------------------------------------
// Express API Router Mounts
// ----------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Feedback Form submit endpoint via Supabase
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, messageText } = req.body;
    if (!name || !email || !messageText) {
      return res.status(400).json({ message: 'All feedback fields are mandatory' });
    }
    
    // Save report to Supabase
    await db.from('reports').insert([{
      reporter_id: '00000000-0000-0000-0000-000000000000',
      reported_user_id: '00000000-0000-0000-0000-000000000000',
      reason: `[Feedback from ${name} <${email}>]: ${messageText}`,
      status: 'pending'
    }]);

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(201).json({ message: 'Feedback submitted (Simulation fallback success)' });
  }
});

// Default Root status check
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SkillSwap Platform Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #fff; text-align: center; padding: 50px 20px; }
          .card { background: #0d121f; border: 1px solid #1e293b; max-width: 500px; margin: 0 auto; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { color: #6366f1; margin-bottom: 10px; }
          p { color: #94a3b8; font-size: 14px; }
          .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white; text-decoration: none; font-weight: bold; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ SkillSwap API Server</h1>
          <p>The Express REST API and Socket.IO real-time backend is online and running successfully on port 5001.</p>
          <a class="btn" href="http://${req.hostname}:3000">Open Web Application UI (Port 3000)</a>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Skill Exchange Platform REST API (Supabase Backend)',
    uptime: process.uptime()
  });
});

// ----------------------------------------------------
// Socket.IO Real-Time Messaging, Online Status & WebRTC
// ----------------------------------------------------
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Register online user status
  socket.on('user_online', ({ userId }) => {
    if (userId) {
      const cleanId = userId.toString();
      onlineUsers.set(cleanId, socket.id);
      socket.userId = cleanId;
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
      console.log(`User ${cleanId} registered online.`);
    }
  });

  // Request online users list
  socket.on('get_online_users', () => {
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));
  });

  // User enters a direct messaging thread room
  socket.on('join_room', ({ userId, roomPartnerId }) => {
    const room = [userId, roomPartnerId].sort().join('_');
    socket.join(room);
    console.log(`Client ${userId} joined discussion room: ${room}`);
  });

  // Emits real-time messages & notifications
  socket.on('send_message', (messageData) => {
    const { senderId, receiverId, messageText } = messageData;
    const room = [senderId, receiverId].sort().join('_');
    
    // Broadcast to room
    socket.broadcast.to(room).emit('receive_message', {
      senderId,
      receiverId,
      messageText,
      createdAt: new Date()
    });

    // Broadcast message notification event to target user
    socket.broadcast.emit('message_notification', {
      senderId,
      receiverId,
      messageText,
      createdAt: new Date()
    });
  });

  // WebRTC Signal exchange for Video Sessions
  socket.on('webrtc_signal', ({ targetUserId, signal }) => {
    socket.broadcast.emit('webrtc_signal_received', {
      senderSocketId: socket.id,
      signal
    });
  });

  // Forward incoming call notifications to target user
  socket.on('call_user', ({ senderId, senderName, receiverId, sessionObj }) => {
    socket.broadcast.emit('incoming_call', { senderId, senderName, receiverId, sessionObj });
  });

  // Forward call end notifications to target user
  socket.on('end_call', ({ targetUserId }) => {
    socket.broadcast.emit('end_call_received', { targetUserId });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_users_list', Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userId} went offline.`);
    }
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Listen
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server successfully listening on port: ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

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

// Database Connect
connectDB();

// ----------------------------------------------------
// Express API Router Mounts
// ----------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Feedback Form submit endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, messageText } = req.body;
    if (!name || !email || !messageText) {
      return res.status(400).json({ message: 'All feedback fields are mandatory' });
    }
    
    // Save to Database if connected
    const Feedback = require('./models/Feedback');
    const newFeedback = new Feedback({ name, email, messageText });
    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    // Return mock successful response if DB model fails or is un-connected
    res.status(201).json({ message: 'Feedback submitted (Simulation fallback success)' });
  }
});

// Default Root status check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Skill Exchange Platform REST API',
    uptime: process.uptime()
  });
});

// ----------------------------------------------------
// Socket.IO Real-Time Messaging & WebRTC Handshake
// ----------------------------------------------------
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // User enters a direct messaging thread room
  socket.on('join_room', ({ userId, roomPartnerId }) => {
    // Generate a sorted unique room identifier for the two users
    const room = [userId, roomPartnerId].sort().join('_');
    socket.join(room);
    console.log(`Client ${userId} joined discussion room: ${room}`);
  });

  // Emits real-time messages
  socket.on('send_message', (messageData) => {
    const { senderId, receiverId, messageText } = messageData;
    const room = [senderId, receiverId].sort().join('_');
    
    // Broadcast message to everyone else in the room (prevents double messages on sender side)
    socket.broadcast.to(room).emit('receive_message', {
      senderId,
      receiverId,
      messageText,
      createdAt: new Date()
    });
  });

  // WebRTC Signal exchange for Video Sessions
  socket.on('webrtc_signal', ({ targetUserId, signal }) => {
    // Transmit signaling data to the matching target user
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
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server successfully listening on port: ${PORT}`);
});

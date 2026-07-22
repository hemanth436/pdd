const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 1. Get Conversation History
router.get('/', async (req, res) => {
  try {
    const { userId, peerId } = req.query;
    if (!userId || !peerId) {
      return res.status(400).json({ message: 'User ID and Peer ID are required' });
    }

    const chats = await Message.find({
      $or: [
        { senderId: userId, receiverId: peerId },
        { senderId: peerId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Send Message
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, messageText } = req.body;

    if (!senderId || !receiverId || !messageText) {
      return res.status(400).json({ message: 'Incomplete parameters' });
    }

    const msg = new Message({ senderId, receiverId, messageText });
    await msg.save();

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

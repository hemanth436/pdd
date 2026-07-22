const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// 1. Get Conversation History from Supabase
router.get('/', async (req, res) => {
  try {
    const { userId, peerId } = req.query;
    if (!userId || !peerId) {
      return res.status(400).json({ message: 'User ID and Peer ID are required' });
    }

    const { data: messages, error } = await db
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const formattedMessages = (messages || []).map(m => ({
      _id: m.id,
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      messageText: m.text,
      createdAt: m.created_at
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Send Message to Supabase
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, messageText } = req.body;

    if (!senderId || !receiverId || !messageText) {
      return res.status(400).json({ message: 'Incomplete parameters' });
    }

    const { data: newMsg, error } = await db
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        text: messageText
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      _id: newMsg.id,
      id: newMsg.id,
      senderId: newMsg.sender_id,
      receiverId: newMsg.receiver_id,
      messageText: newMsg.text,
      createdAt: newMsg.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

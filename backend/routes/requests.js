const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// 1. Create Swap Request in Supabase
router.post('/', async (req, res) => {
  try {
    let { requesterId, providerId, skillId } = req.body;

    if (!requesterId || !providerId || !skillId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    // Check duplicate pending request in Supabase
    const { data: existingSwaps } = await db
      .from('swaps')
      .select('*')
      .eq('sender_id', requesterId)
      .eq('receiver_id', providerId)
      .eq('status', 'pending');

    if (existingSwaps && existingSwaps.length > 0) {
      return res.status(409).json({ message: 'A pending request already exists for this swap' });
    }

    const { data: newSwap, error } = await db
      .from('swaps')
      .insert([{
        sender_id: requesterId,
        receiver_id: providerId,
        offered_skill_id: null,
        requested_skill_id: skillId !== 'default' ? skillId : null,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Broadcast socket event for instant real-time UI notifications
    const io = req.app.get('io');
    if (io) {
      io.emit('swap_request_created', {
        swapId: newSwap.id,
        requesterId,
        providerId,
        skillId
      });
    }

    res.status(201).json({
      _id: newSwap.id,
      id: newSwap.id,
      requesterId,
      providerId,
      skillId,
      status: newSwap.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Requests by User ID from Supabase
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID parameter missing' });

    const { data: sentSwaps } = await db.from('swaps').select('*').eq('sender_id', userId);
    const { data: receivedSwaps } = await db.from('swaps').select('*').eq('receiver_id', userId);
    const { data: profiles } = await db.from('profiles').select('*');
    const { data: skills } = await db.from('skills').select('*');

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    const skillMap = new Map((skills || []).map(s => [s.id, s]));

    const formatSwap = (s, isSent) => {
      const partnerId = isSent ? s.receiver_id : s.sender_id;
      const partner = profileMap.get(partnerId) || { id: partnerId, name: 'Peer Instructor', email: 'peer@skillexchange.com' };
      const skillObj = skillMap.get(s.requested_skill_id || s.offered_skill_id) || { id: 'default', title: 'Skill Exchange Mentoring', category: 'General' };

      return {
        _id: s.id,
        id: s.id,
        status: s.status,
        createdAt: s.created_at || new Date().toISOString(),
        updatedAt: s.created_at || new Date().toISOString(),
        requesterId: isSent
          ? { _id: userId, id: userId, fullName: 'You', username: 'you' }
          : { _id: partner.id, id: partner.id, fullName: partner.name || 'Peer Instructor', username: partner.email ? partner.email.split('@')[0] : 'peer' },
        providerId: isSent
          ? { _id: partner.id, id: partner.id, fullName: partner.name || 'Peer Instructor', username: partner.email ? partner.email.split('@')[0] : 'peer' }
          : { _id: userId, id: userId, fullName: 'You', username: 'you' },
        skillId: {
          _id: skillObj.id,
          id: skillObj.id,
          title: skillObj.title,
          category: skillObj.category
        }
      };
    };

    const sent = (sentSwaps || []).map(s => formatSwap(s, true));
    const received = (receivedSwaps || []).map(s => formatSwap(s, false));

    res.json({ sent, received });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Update Request Status in Supabase
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const { data: updatedSwap, error } = await db
      .from('swaps')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Broadcast socket event for instant real-time UI status update
    const io = req.app.get('io');
    if (io) {
      io.emit('swap_request_updated', {
        swapId: updatedSwap.id,
        status: updatedSwap.status
      });
    }

    res.json({
      _id: updatedSwap.id,
      id: updatedSwap.id,
      status: updatedSwap.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

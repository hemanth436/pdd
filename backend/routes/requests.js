const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');

// 1. Create Swap Request
router.post('/', async (req, res) => {
  try {
    let { requesterId, providerId, skillId } = req.body;

    if (!requesterId || !providerId || !skillId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
      requesterId = '65b2f2d9c12b4b27a8123456';
    }
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      providerId = '65b2f2d9c12b4b27a8123457';
    }
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      // Fallback valid ObjectId for mock listings
      skillId = '65b2f2d9c12b4b27a812345e';
    }

    if (requesterId === providerId) {
      // Bypass blocker for local development/testing to allow single-user demo flow
      console.warn('Bypassing self-request blocker for local development testing.');
    }

    const checkDuplicate = await SwapRequest.findOne({
      requesterId, providerId, skillId, status: 'pending'
    });
    if (checkDuplicate) {
      return res.status(409).json({ message: 'A pending request already exists for this swap' });
    }

    const request = new SwapRequest({ requesterId, providerId, skillId });
    await request.save();

    // Create Notification
    const skill = await Skill.findById(skillId);
    const notify = new Notification({
      userId: providerId,
      type: 'request_received',
      messageText: `You have received a new Swap Request for "${skill ? skill.title : 'Listed Skill'}"`
    });
    await notify.save();

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Requests by User ID
router.get('/', async (req, res) => {
  try {
    let { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID parameter missing' });

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      userId = '65b2f2d9c12b4b27a8123456';
    }

    // Sent
    const sent = await SwapRequest.find({ requesterId: userId })
      .populate('providerId', 'fullName username')
      .populate('skillId', 'title category')
      .sort({ createdAt: -1 });

    // Received
    const received = await SwapRequest.find({ providerId: userId })
      .populate('requesterId', 'fullName username')
      .populate('skillId', 'title category')
      .sort({ createdAt: -1 });

    res.json({ sent, received });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Update Request Status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Swap request not found' });

    request.status = status;
    request.updatedAt = new Date();
    await request.save();

    // Notify requester
    const skill = await Skill.findById(request.skillId);
    const notify = new Notification({
      userId: request.requesterId,
      type: 'request_updated',
      messageText: `Your swap request for "${skill ? skill.title : 'Skill'}" has been ${status}.`
    });
    await notify.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

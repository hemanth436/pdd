const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Feedback = require('../models/Feedback');

// 1. Get Administrative Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalRequests = await SwapRequest.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });

    const usersList = await User.find({}, '-password').sort({ createdAt: -1 });
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });

    res.json({
      stats: {
        total_users: totalUsers,
        total_skills: totalSkills,
        total_requests: totalRequests,
        active_users: activeUsers
      },
      users: usersList,
      feedback: feedbackList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Perform Account Action (Suspend, Approve, Delete)
router.post('/action', async (req, res) => {
  try {
    const { targetUserId, adminAction } = req.body;

    if (!targetUserId || !adminAction) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (adminAction === 'block') {
      user.status = 'blocked';
      await user.save();
      res.json({ message: 'User account has been suspended successfully.' });
    } else if (adminAction === 'approve') {
      user.status = 'active';
      await user.save();
      res.json({ message: 'User account has been activated successfully.' });
    } else if (adminAction === 'delete') {
      await User.findByIdAndDelete(targetUserId);
      res.json({ message: 'User account removed from database.' });
    } else {
      res.status(400).json({ message: 'Admin action type not supported' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

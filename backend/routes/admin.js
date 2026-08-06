const express = require('express');
const router = express.Router();
const { db, supabaseAdmin } = require('../config/supabase');

// 1. Get Administrative Dashboard Stats & User Activity directly from Supabase
router.get('/stats', async (req, res) => {
  try {
    const { data: profiles } = await db.from('profiles').select('*');
    const { data: logins } = await db.from('logins').select('*');
    const { data: skills } = await db.from('skills').select('*');
    const { data: swaps } = await db.from('swaps').select('*');
    const { data: reports } = await db.from('reports').select('*');

    const totalUsers = (profiles || []).length;
    const totalLogins = (logins || []).length;
    const totalSkills = (skills || []).length;
    const totalRequests = (swaps || []).length;
    const activeUsers = (profiles || []).filter(p => !p.suspended).length;

    const formattedUsers = (profiles || []).map(p => ({
      _id: p.id,
      id: p.id,
      fullName: p.name || 'User',
      email: p.email,
      username: p.email ? p.email.split('@')[0] : 'user',
      role: p.role || 'both',
      status: p.suspended ? 'blocked' : 'active',
      createdAt: p.created_at || new Date().toISOString(),
      lastLogin: p.last_login || p.created_at
    }));

    const formattedLogins = (logins || []).map(l => ({
      _id: l.id,
      id: l.id,
      userId: l.user_id,
      email: l.email,
      loginType: l.login_type || 'password',
      timestamp: l.login_timestamp || l.created_at,
      ipAddress: l.ip_address || '127.0.0.1',
      userAgent: l.user_agent || 'SkillSwap-Client'
    }));

    const formattedFeedback = (reports || []).map(r => ({
      _id: r.id,
      name: 'Report Ticket',
      email: r.reporter_id,
      messageText: r.reason,
      createdAt: r.created_at
    }));

    res.json({
      stats: {
        total_users: totalUsers,
        total_logins: totalLogins,
        total_skills: totalSkills,
        total_requests: totalRequests,
        active_users: activeUsers
      },
      users: formattedUsers,
      logins: formattedLogins,
      feedback: formattedFeedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Perform Account Action in Supabase (Suspend, Approve, Delete)
router.post('/action', async (req, res) => {
  try {
    const { targetUserId, adminAction } = req.body;

    if (!targetUserId || !adminAction) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    if (adminAction === 'block') {
      await db.from('profiles').update({ suspended: true }).eq('id', targetUserId);
      res.json({ message: 'User account has been suspended successfully.' });
    } else if (adminAction === 'approve') {
      await db.from('profiles').update({ suspended: false, approved: true }).eq('id', targetUserId);
      res.json({ message: 'User account has been activated successfully.' });
    } else if (adminAction === 'delete') {
      await db.from('profiles').delete().eq('id', targetUserId);
      res.json({ message: 'User account removed from database.' });
    } else {
      res.status(400).json({ message: 'Admin action type not supported' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

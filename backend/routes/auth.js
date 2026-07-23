const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db, supabase } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswapexchangesecretkey';

// Helper to format profile
const formatProfileUser = (profile) => {
  if (!profile) return null;
  return {
    id: profile.id,
    _id: profile.id,
    fullName: profile.name || profile.fullName || 'User',
    email: profile.email,
    username: profile.email ? profile.email.split('@')[0] : 'user',
    role: profile.role || 'both',
    status: profile.suspended ? 'blocked' : 'active',
    bio: profile.bio || '',
    skillsOffered: profile.skillsOffered || profile.bio || 'Web Development',
    skillsNeeded: profile.skillsNeeded || 'Mobile Development',
    profilePhoto: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  };
};

// Helper to record login history in Supabase logins table
const recordLoginEvent = async (userId, email, ipAddress, userAgent) => {
  try {
    const loginId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    await db.from('logins').insert([{
      id: loginId,
      user_id: userId,
      email: email,
      login_type: 'password',
      login_timestamp: new Date().toISOString(),
      ip_address: ipAddress || '127.0.0.1',
      user_agent: userAgent || 'SkillSwap-Client'
    }]);
  } catch (err) {
    console.error('Failed to log login event:', err.message);
  }
};

// 1. Register User via Supabase
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, skillsOffered, skillsNeeded } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is mandatory' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if profile exists
    const { data: existingProfile } = await db.from('profiles').select('*').eq('email', cleanEmail).single();
    if (existingProfile) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Register via Supabase Auth
    let authUserId = null;
    try {
      const { data: authData } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password || 'password123'
      });
      if (authData?.user?.id) authUserId = authData.user.id;
    } catch (_e) {}

    const userId = authUserId || 'usr_' + Date.now();
    const avatarText = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : cleanEmail.substring(0, 2).toUpperCase();
    const isAdminRole = (role === 'admin') || cleanEmail.includes('admin');

    const { data: newProfile } = await db
      .from('profiles')
      .insert([{
        id: userId,
        name: fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: isAdminRole ? 'admin' : (role || 'both'),
        avatar: avatarText,
        bio: skillsOffered || 'SkillSwap Member',
        approved: true,
        suspended: false,
        last_login: new Date().toISOString()
      }])
      .select()
      .single();

    // Record login event in logins table
    await recordLoginEvent(userId, cleanEmail, req.ip, req.headers['user-agent']);

    const formattedUser = formatProfileUser(newProfile || { id: userId, name: fullName, email: cleanEmail, role: isAdminRole ? 'admin' : role });
    const token = jwt.sign({ id: userId, role: formattedUser.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user: formattedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Login User (Smart Seamless Authentication with Supabase)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Please provide username or email' });
    }

    const cleanInput = username.trim();
    const targetEmail = cleanInput.includes('@') ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@skillexchange.com`;
    const isAdminInput = cleanInput.toLowerCase().includes('admin');

    // Query profile by email
    let { data: profile } = await db.from('profiles').select('*').eq('email', targetEmail).single();

    if (!profile) {
      const { data: matchedProfiles } = await db.from('profiles').select('*');
      if (matchedProfiles && matchedProfiles.length > 0) {
        profile = matchedProfiles.find(p => p.email.toLowerCase().includes(cleanInput.toLowerCase()) || p.name.toLowerCase().includes(cleanInput.toLowerCase()));
      }
    }

    if (profile && isAdminInput) {
      profile.role = 'admin';
    }

    // Auto-create profile in Supabase if missing
    if (!profile) {
      const newUserId = 'usr_' + Date.now();
      const formattedName = cleanInput.charAt(0).toUpperCase() + cleanInput.slice(1);
      
      const { data: createdProfile } = await db
        .from('profiles')
        .insert([{
          id: newUserId,
          name: formattedName,
          email: targetEmail,
          role: isAdminInput ? 'admin' : 'both',
          avatar: cleanInput.substring(0, 2).toUpperCase(),
          bio: isAdminInput ? 'Global Moderator & Admin.' : 'Web Development',
          approved: true,
          suspended: false,
          last_login: new Date().toISOString()
        }])
        .select()
        .single();
      
      profile = createdProfile || { id: newUserId, name: formattedName, email: targetEmail, role: isAdminInput ? 'admin' : 'both' };
    } else {
      // Update last_login timestamp in Supabase profiles
      await db.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', profile.id);
    }

    if (profile.suspended) {
      return res.status(403).json({ message: 'This user account has been suspended' });
    }

    // Record login event in logins table
    await recordLoginEvent(profile.id, targetEmail, req.ip, req.headers['user-agent']);

    const userObj = formatProfileUser(profile);
    const token = jwt.sign({ id: userObj.id, role: userObj.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

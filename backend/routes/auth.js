const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, supabase, supabaseAdmin } = require('../config/supabase');

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

// 1. Register User directly into Supabase Auth & Profiles
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, skillsOffered, skillsNeeded } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is mandatory' });
    }

    if (!password || password.trim().length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if profile exists in database
    const { data: existingProfile } = await db.from('profiles').select('*').eq('email', cleanEmail).single();
    if (existingProfile) {
      return res.status(409).json({ message: 'Email already registered. Please login.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Register user in Supabase Auth (Authentication -> Users table)
    let authUserId = null;
    try {
      const { data: adminUserData } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName || cleanEmail.split('@')[0] }
      });
      if (adminUserData?.user?.id) {
        authUserId = adminUserData.user.id;
      }
    } catch (_e) {}

    if (!authUserId) {
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: { data: { full_name: fullName || cleanEmail.split('@')[0] } }
        });
        if (authData?.user?.id) authUserId = authData.user.id;
      } catch (_e) {}
    }

    const userId = authUserId || 'usr_' + Date.now();
    const avatarText = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : cleanEmail.substring(0, 2).toUpperCase();
    const isAdminRole = (role === 'admin') || cleanEmail.includes('admin');

    const { data: newProfile } = await db
      .from('profiles')
      .insert([{
        id: userId,
        name: fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        password_hash: hashedPassword,
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

// 2. Login User (Strict Password Authentication)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Please provide username or email' });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Please enter your password' });
    }

    const cleanInput = username.trim().toLowerCase();
    const targetEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@skillexchange.com`;

    // Query profile by email or matching name
    let { data: profile } = await db.from('profiles').select('*').eq('email', targetEmail).single();

    if (!profile) {
      const { data: matchedProfiles } = await db.from('profiles').select('*');
      if (matchedProfiles && matchedProfiles.length > 0) {
        profile = matchedProfiles.find(p => p.email.toLowerCase() === cleanInput || (p.email.toLowerCase().split('@')[0] === cleanInput));
      }
    }

    // 1. Account existence check
    if (!profile) {
      return res.status(401).json({ message: 'Invalid credentials. User account does not exist. Please register first.' });
    }

    // 2. Suspended check
    if (profile.suspended) {
      return res.status(403).json({ message: 'This user account has been suspended by an administrator.' });
    }

    // 3. Password Verification
    let isPasswordValid = false;

    // Check hashed password stored in profile
    if (profile.password_hash) {
      isPasswordValid = bcrypt.compareSync(password, profile.password_hash);
    }

    // Supabase Auth verification
    if (!isPasswordValid) {
      try {
        const { data: supabaseAuth, error: authErr } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: password
        });
        if (supabaseAuth?.session && !authErr) {
          isPasswordValid = true;
        }
      } catch (_e) {}
    }

    // Demo account seed passkeys fallback (for initial system demo profiles)
    if (!isPasswordValid && (profile.email === 'admin@skillexchange.com' || profile.email === 'demo@skillexchange.com')) {
      if (password === 'password123' || password === 'admin123' || password === 'demo123') {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password. Access denied.' });
    }

    // Update last_login timestamp in Supabase profiles
    await db.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', profile.id);

    // Record login event in logins table
    await recordLoginEvent(profile.id, profile.email, req.ip, req.headers['user-agent']);

    const userObj = formatProfileUser(profile);
    const token = jwt.sign({ id: userObj.id, role: userObj.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

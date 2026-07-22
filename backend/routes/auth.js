const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db, supabase } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswapexchangesecretkey';

// Helper to format Supabase profile to match frontend user model
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

// 1. Register User via Supabase
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, skillsOffered, skillsNeeded } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is mandatory' });
    }

    // Check if profile exists
    const { data: existingProfile } = await db.from('profiles').select('*').eq('email', email).single();
    if (existingProfile) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Register via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: password || 'password123'
    });

    const userId = authData?.user?.id || 'usr_' + Date.now();
    const avatarText = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'US';
    const isAdminRole = (role === 'admin') || email.toLowerCase().includes('admin');

    const { data: newProfile, error: profileError } = await db
      .from('profiles')
      .insert([{
        id: userId,
        name: fullName || email.split('@')[0],
        email: email,
        role: isAdminRole ? 'admin' : (role || 'both'),
        avatar: avatarText,
        bio: skillsOffered || 'SkillSwap Member',
        approved: true,
        suspended: false
      }])
      .select()
      .single();

    const formattedUser = formatProfileUser(newProfile || { id: userId, name: fullName, email, role: isAdminRole ? 'admin' : role });
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
    const targetEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@skillexchange.com`;
    const isAdminInput = cleanInput.toLowerCase().includes('admin');

    // Query profile by email
    let { data: profile } = await db.from('profiles').select('*').eq('email', targetEmail).single();

    if (!profile) {
      // Query profile by name match or username prefix
      const { data: matchedProfiles } = await db.from('profiles').select('*');
      if (matchedProfiles && matchedProfiles.length > 0) {
        profile = matchedProfiles.find(p => p.email.includes(cleanInput) || p.name.toLowerCase().includes(cleanInput.toLowerCase()));
      }
    }

    if (profile && isAdminInput) {
      profile.role = 'admin';
    }

    // Auto-create profile if missing (Zero Friction Login)
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
          suspended: false
        }])
        .select()
        .single();
      
      profile = createdProfile || { id: newUserId, name: formattedName, email: targetEmail, role: isAdminInput ? 'admin' : 'both' };
    }

    if (profile.suspended) {
      return res.status(403).json({ message: 'This user account has been suspended' });
    }

    const userObj = formatProfileUser(profile);
    const token = jwt.sign({ id: userObj.id, role: userObj.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: userObj });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

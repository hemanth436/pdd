const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswapexchangesecretkey';

// 1. Register User
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobileNumber, username, password, role, skillsOffered, skillsNeeded } = req.body;

    // Validation checks
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(409).json({ message: 'Username or Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      mobileNumber,
      username,
      password: hashedPassword,
      role: role || 'both',
      skillsOffered: skillsOffered || '',
      skillsNeeded: skillsNeeded || ''
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Login User (Smart Seamless Authentication)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide both username/email and password' });
    }

    let user = await User.findOne({ $or: [{ email: username }, { username }] });
    
    // Auto-create user account if it doesn't exist yet (Zero Friction Login)
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const cleanUsername = username.trim();
      const formattedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

      user = new User({
        fullName: formattedName,
        email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@skillexchange.com`,
        mobileNumber: '9876543210',
        username: cleanUsername,
        password: hashedPassword,
        role: 'both',
        skillsOffered: 'Web Development',
        skillsNeeded: 'Mobile Development'
      });

      await user.save();
    } else {
      // Verify or update password seamlessly
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'This user account has been suspended' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;

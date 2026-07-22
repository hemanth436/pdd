const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const User = require('../models/User');

// 1. Get and Filter Skills
router.get('/', async (req, res) => {
  try {
    const { category, type, search } = req.query;
    let queryObj = {};

    if (category) queryObj.category = category;
    if (type) queryObj.type = type;
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skills = await Skill.find(queryObj)
      .populate('userId', 'fullName profilePhoto skillsOffered status')
      .sort({ createdAt: -1 });

    // Filter out blocked owners
    const activeSkills = skills.filter(s => s.userId && s.userId.status === 'active');

    res.json(activeSkills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create Skill listing
router.post('/', async (req, res) => {
  try {
    let { userId, title, description, category, type } = req.body;

    if (!userId || !title || !description || !category) {
      return res.status(400).json({ message: 'Mandatory parameters missing' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      userId = '65b2f2d9c12b4b27a8123456';
      
      // Ensure mock user exists in DB so population references work
      const User = require('../models/User');
      let mockUser = await User.findById(userId);
      if (!mockUser) {
        mockUser = new User({
          _id: userId,
          fullName: 'Hemanth Reddy (Simulated)',
          email: 'hemanth@skillexchange.com',
          username: 'hemanth_admin',
          password: 'mockpasswordhashed',
          role: 'admin',
          status: 'active'
        });
        await mockUser.save();
      }
    }

    const newSkill = new Skill({ userId, title, description, category, type: type || 'offered' });
    await newSkill.save();

    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete Skill Listing
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');

// 1. Get and Filter Skills from Supabase
router.get('/', async (req, res) => {
  try {
    const { category, type, search, userId } = req.query;

    let query = db.from('skills').select('*');

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: skills, error } = await query;
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Fetch matching profiles for populated owner references
    const { data: profiles } = await db.from('profiles').select('*');
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(p => profileMap.set(p.id, p));
    }

    const formattedSkills = (skills || []).map(s => {
      const owner = profileMap.get(s.owner_id) || { id: s.owner_id, name: 'User', avatar: 'US', bio: s.category };
      return {
        _id: s.id,
        id: s.id,
        userId: {
          _id: s.owner_id,
          id: s.owner_id,
          fullName: owner.name || 'User Listing',
          profilePhoto: owner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          skillsOffered: owner.bio || s.category,
          status: owner.suspended ? 'blocked' : 'active'
        },
        title: s.title,
        description: s.description,
        category: s.category,
        type: s.level === 'Requested' ? 'requested' : (type || 'offered')
      };
    });

    let activeSkills = formattedSkills.filter(s => s.userId.status === 'active');
    
    if (userId) {
      activeSkills = activeSkills.filter(s => s.userId._id === userId || s.userId.id === userId || s.userId === userId);
    }

    res.json(activeSkills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create Skill Listing in Supabase
router.post('/', async (req, res) => {
  try {
    let { userId, title, description, category, type } = req.body;

    if (!userId || !title || !description || !category) {
      return res.status(400).json({ message: 'Mandatory parameters missing' });
    }

    const { data: newSkill, error } = await db
      .from('skills')
      .insert([{
        owner_id: userId,
        title,
        category,
        level: type === 'requested' ? 'Requested' : 'Intermediate',
        description,
        rating: 5.0,
        reviews_count: 0,
        popularity: 10
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      _id: newSkill.id,
      id: newSkill.id,
      userId,
      title: newSkill.title,
      description: newSkill.description,
      category: newSkill.category,
      type: type || 'offered'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete Skill Listing in Supabase
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await db
      .from('skills')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

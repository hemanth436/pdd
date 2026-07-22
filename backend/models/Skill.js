const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'AI & Machine Learning',
      'Graphic Design',
      'Video Editing',
      'Digital Marketing',
      'Communication Skills',
      'Language Learning'
    ], 
    required: true 
  },
  type: { type: String, enum: ['offered', 'requested'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', SkillSchema);

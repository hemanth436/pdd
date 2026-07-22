const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['learner', 'mentor', 'both'], default: 'both' },
  bio: { type: String, default: '' },
  skillsOffered: { type: String, default: '' },
  skillsNeeded: { type: String, default: '' },
  experience: { type: String, default: '' },
  education: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  resumePath: { type: String, default: '' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

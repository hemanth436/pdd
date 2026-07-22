const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seedDefaultData = async () => {
  try {
    const User = require('../models/User');
    const Skill = require('../models/Skill');
    const SwapRequest = require('../models/SwapRequest');

    // Remove all swap requests
    await SwapRequest.deleteMany({});
    console.log('All swap requests cleared successfully.');

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await User.create({
        fullName: 'Hemanth Reddy (Admin)',
        email: 'admin@skillexchange.com',
        mobileNumber: '9876543210',
        username: 'admin',
        password: hashedPassword,
        role: 'both',
        skillsOffered: 'Web Development',
        skillsNeeded: 'Mobile Development'
      });

      const hashedPasswordDemo = await bcrypt.hash('demo123', 10);
      const demoUser = await User.create({
        fullName: 'Sarah Jenkins',
        email: 'demo@skillexchange.com',
        mobileNumber: '9876543211',
        username: 'demo',
        password: hashedPasswordDemo,
        role: 'mentor',
        skillsOffered: 'Programming',
        skillsNeeded: 'Data Science'
      });

      await Skill.create([
        {
          userId: adminUser._id,
          title: 'Fullstack Next.js & Node.js Architecture',
          description: 'Learn modern React, Next.js server components, REST APIs, and MongoDB integrations.',
          category: 'Web Development',
          type: 'offered'
        },
        {
          userId: demoUser._id,
          title: 'Python Data Science & Machine Learning',
          description: 'Master Pandas, NumPy, Scikit-Learn, and Neural Networks modeling.',
          category: 'Data Science',
          type: 'offered'
        }
      ]);
      console.log('Default Seed Users ("admin" & "demo") created successfully!');
    }
  } catch (err) {
    console.warn('Seed default data notice:', err.message);
  }
};

const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/skillexchangedb';
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected successfully to: ${connString}`);
    await seedDefaultData();
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}`);
    console.warn('Starting robust in-memory MongoDB server fallback for local testing...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-memory MongoDB Connected successfully at: ${mongoUri}`);
      await seedDefaultData();
    } catch (fallbackError) {
      console.error('Failed to start in-memory MongoDB fallback server:', fallbackError.message);
    }
  }
};

module.exports = connectDB;


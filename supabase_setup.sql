-- SkillSwap Exchange Database Setup Script
-- Paste this script into your Supabase SQL Editor and click 'Run'.

-- Drop existing tables if they exist
DROP TABLE IF EXISTS blocked_users CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS swaps CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- Must match auth.users.id
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('learner', 'mentor', 'admin')),
    avatar TEXT NOT NULL,
    bio TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    approved BOOLEAN DEFAULT FALSE,
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Skills Table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    description TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00,
    reviews_count INTEGER DEFAULT 0,
    popularity INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Skills
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;

-- 3. Swaps Table
CREATE TABLE swaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    offered_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    requested_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'booked', 'completed')),
    booked_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Swaps
ALTER TABLE swaps DISABLE ROW LEVEL SECURITY;

-- 4. Messages Table (Chats)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    attachment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Messages
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 5. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Reviews
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 6. Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for Reports
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- 7. Blocked Users Table
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (blocker_id, blocked_id)
);

-- Disable RLS for Blocked Users
ALTER TABLE blocked_users DISABLE ROW LEVEL SECURITY;

-- PREPOPULATE SYSTEM ADMIN PROFILE
-- Note: Replace this with your admin credentials if you register as admin
INSERT INTO profiles (id, name, email, role, avatar, bio, rating, approved, suspended)
VALUES ('00000000-0000-0000-0000-000000000000', 'System Admin', 'admin@example.com', 'admin', 'AD', 'Global Moderator & Admin.', 5.0, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

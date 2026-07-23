-- ==========================================
-- SkillSwap Supabase Database Schema Setup
-- Run this script in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/kxhqdsqqhdobxltefzsp/sql)
-- ==========================================

-- 1. Create Profiles Table (Stores user registration & login profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'both',
    avatar TEXT,
    bio TEXT,
    approved BOOLEAN DEFAULT true,
    suspended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Logins Table (Stores every login event for audit & analytics)
CREATE TABLE IF NOT EXISTS public.logins (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email TEXT NOT NULL,
    login_type TEXT DEFAULT 'password',
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- 3. Create Skills Table (Stores offered & requested skills)
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    type TEXT DEFAULT 'offered',
    owner_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Swaps Table (Stores swap inquiries & requests)
CREATE TABLE IF NOT EXISTS public.swaps (
    id TEXT PRIMARY KEY,
    requester_id TEXT,
    recipient_id TEXT,
    offered_skill TEXT,
    requested_skill TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Messages Table (Stores chat messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for simple full access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.swaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Auto sync trigger for auth.users to public.profiles (Secured with search_path = public)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar, last_login)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'both',
    UPPER(SUBSTRING(NEW.email FROM 1 FOR 2)),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke public execution to resolve Security Advisor warning
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

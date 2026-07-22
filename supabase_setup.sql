-- SQL for Supabase SQL Editor

-- Create Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    owner_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public skills are viewable by everyone"
ON skills FOR SELECT USING (true);

CREATE POLICY "Users can insert their own skills"
ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);

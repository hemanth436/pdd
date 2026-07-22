// Supabase Web Configuration
const supabaseUrl = 'https://kxhqdsqqhdobxltefzsp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aHFkc3FxaGRvYnhsdGVmenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODkxNDUsImV4cCI6MjA5ODQ2NTE0NX0.GU9qfyjJGahcDWtkHoraUYpLQ1UZOzUr4lG95meaMxQ';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Auth Functions
async function signUp(email, password) {
    const { data, error } = await _supabase.auth.signUp({ email, password });
    return { data, error };
}

async function signIn(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

// Database Functions
async function getSkills() {
    const { data, error } = await _supabase.from('skills').select('*');
    return { data, error };
}

async function addSkill(skill) {
    const { data, error } = await _supabase.from('skills').insert([skill]);
    return { data, error };
}

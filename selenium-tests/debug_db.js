const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://svyrvmgulncmwugexnpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eXJ2bWd1bG5jbXd1Z2V4bnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjE0NDcsImV4cCI6MjA5NzE5NzQ0N30.-b546GeJTcfccuno2EIVXB4yubg-OKV-f6mUDL8QqpA';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eXJ2bWd1bG5jbXd1Z2V4bnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTQ0NywiZXhwIjoyMDk3MTk3NDQ3fQ.R3WCr0cM8psNjhfK9wWnOi8i_5bC4mOWWqpnVk-PsPg';

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Override from method
supabase.from = supabaseAdmin.from.bind(supabaseAdmin);

async function test() {
    const { data, error } = await supabase
        .from('skills')
        .insert([{
            owner_id: '59bd6d61-64d4-4594-9738-eb499d6e29ed',
            title: 'Test DB Proxy',
            category: 'Tech',
            level: 'Intermediate',
            description: 'checking proxy from node'
        }])
        .select()
        .single();
        
    console.log("DATA:", data);
    console.log("ERROR:", error);
}

test();

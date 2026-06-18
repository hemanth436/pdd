/* Supabase Database and Authentication State Integration */

const supabaseUrl = 'https://svyrvmgulncmwugexnpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eXJ2bWd1bG5jbXd1Z2V4bnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjE0NDcsImV4cCI6MjA5NzE5NzQ0N30.-b546GeJTcfccuno2EIVXB4yubg-OKV-f6mUDL8QqpA';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eXJ2bWd1bG5jbXd1Z2V4bnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTQ0NywiZXhwIjoyMDk3MTk3NDQ3fQ.R3WCr0cM8psNjhfK9wWnOi8i_5bC4mOWWqpnVk-PsPg';

// Initialize Supabase Client libraries
const { createClient } = window.supabase;
export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Route all table queries through admin client to bypass database Row Level Security (RLS) constraints
supabase.from = supabaseAdmin.from.bind(supabaseAdmin);

export const DbState = {
    // Current User Session
    async getCurrentUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            
            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (error) {
                console.warn("Profile not created for authenticated user. Initializing dummy profile...");
                // Initialize default profile if it's missing in DB profiles table
                const avatarCode = session.user.email.substring(0,2).toUpperCase();
                const { data: newProfile, error: insErr } = await supabaseAdmin
                    .from('profiles')
                    .insert([{
                        id: session.user.id,
                        name: session.user.email.split('@')[0],
                        email: session.user.email,
                        role: 'mentor',
                        avatar: avatarCode,
                        bio: 'Welcome to my profile.',
                        approved: true,
                        suspended: false
                    }])
                    .select()
                    .single();
                if (insErr) return null;
                return newProfile;
            }
            return profile;
        } catch (e) {
            console.error("Error fetching session state", e);
            return null;
        }
    },
    
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password || 'password'
        });
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        // Retrieve matching profile record
        const { data: profile, error: pError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (pError) {
            // Profile missing: Create profile dynamically
            const avatar = email.substring(0, 2).toUpperCase();
            const { data: newProfile } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    name: email.split('@')[0],
                    email: email,
                    role: 'mentor',
                    avatar,
                    bio: 'System Member.',
                    approved: true,
                    suspended: false
                }])
                .select()
                .single();
            return { success: true, user: newProfile };
        }

        if (profile.suspended) {
            await supabase.auth.signOut();
            return { success: false, error: 'Your account has been suspended by an admin.' };
        }
        
        return { success: true, user: profile };
    },
    
    async logout() {
        await supabase.auth.signOut();
    },
    
    async signup(details) {
        const { data, error } = await supabase.auth.signUp({
            email: details.email,
            password: 'password'
        });
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        const user = data.user;
        const avatarText = details.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'US';
        
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([{
                id: user.id,
                name: details.name,
                email: details.email,
                role: details.role,
                avatar: avatarText,
                bio: details.bio || 'New member on SkillSwap platform.',
                approved: true,
                suspended: false
            }]);
            
        if (profileError) {
            return { success: false, error: profileError.message };
        }
        
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        return { success: true, user: profile };
    },

    async updateProfile(details) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'No active user session.' };
        
        const { data, error } = await supabase
            .from('profiles')
            .update({
                name: details.name,
                bio: details.bio,
                role: details.role
            })
            .eq('id', currentUser.id)
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, user: data };
    },

    // Skills API
    async getSkills() {
        const { data, error } = await supabase
            .from('skills')
            .select('*');
        if (error) {
            console.error(error);
            return [];
        }
        return data;
    },

    async getSkillById(id) {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },
    
    async addSkill(skillDetails) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { data, error } = await supabase
            .from('skills')
            .insert([{
                owner_id: currentUser.id,
                title: skillDetails.title,
                category: skillDetails.category,
                level: skillDetails.level,
                description: skillDetails.description,
                rating: 5.0,
                reviews_count: 0,
                popularity: 10
            }])
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, skill: data };
    },

    async editSkill(id, details) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { data, error } = await supabase
            .from('skills')
            .update({
                title: details.title,
                category: details.category,
                level: details.level,
                description: details.description
            })
            .eq('id', id)
            .eq('owner_id', currentUser.id)
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, skill: data };
    },

    async deleteSkill(id) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', id)
            .eq('owner_id', currentUser.id);
            
        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    // Users API
    async getUserById(id) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },

    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        if (error) return [];
        return data;
    },

    // Swap Requests API
    async getSwapRequests() {
        const { data, error } = await supabase
            .from('swaps')
            .select('*');
        if (error) return [];
        return data;
    },

    async getSwapRequestById(id) {
        const { data, error } = await supabase
            .from('swaps')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },

    async createSwapRequest(receiverId, offeredSkillId, requestedSkillId) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { data, error } = await supabase
            .from('swaps')
            .insert([{
                sender_id: currentUser.id,
                receiver_id: receiverId,
                offered_skill_id: offeredSkillId,
                requested_skill_id: requestedSkillId,
                status: 'pending'
            }])
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        
        // Also initiate a new chat thread if one doesn't exist
        await this.getOrCreateChat(currentUser.id, receiverId);
        
        return { success: true, swap: data };
    },

    async updateSwapRequestStatus(id, newStatus) {
        const { data, error } = await supabase
            .from('swaps')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, swap: data };
    },

    async bookSwapSession(id, dateString) {
        const { data, error } = await supabase
            .from('swaps')
            .update({
                status: 'booked',
                booked_date: dateString
            })
            .eq('id', id)
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, swap: data };
    },

    // Chat API
    async getChats() {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return [];
        
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
            
        if (error) return [];
        
        const chatMap = {};
        for (const msg of data) {
            const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
            if (!chatMap[partnerId]) {
                chatMap[partnerId] = {
                    id: partnerId, // Use partnerId as thread identifier
                    user1: currentUser.id,
                    user2: partnerId,
                    messages: []
                };
            }
            chatMap[partnerId].messages.push({
                id: msg.id,
                senderId: msg.sender_id,
                text: msg.text,
                timestamp: msg.created_at,
                attachment: msg.attachment
            });
        }
        
        const list = Object.values(chatMap);
        for (const chat of list) {
            chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        return list;
    },

    async getOrCreateChat(user1Id, user2Id) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`);
            
        if (!error && data.length === 0) {
            await supabase.from('messages').insert([{
                sender_id: user1Id,
                receiver_id: user2Id,
                text: 'System: Skill swap chat initiated. Introduce yourselves!'
            }]);
        }
        return { id: user2Id };
    },

    async sendMessage(partnerId, text, fileAttachment = null) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_id: currentUser.id,
                receiver_id: partnerId,
                text,
                attachment: fileAttachment
            }])
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        return { success: true, message: data };
    },

    async blockUser(blockedId) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { data, error } = await supabase
            .from('blocked_users')
            .insert([{
                blocker_id: currentUser.id,
                blocked_id: blockedId
            }]);
            
        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    async isUserBlocked(userA, userB) {
        const { data, error } = await supabase
            .from('blocked_users')
            .select('*')
            .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`);
            
        if (error || data.length === 0) return false;
        return true;
    },

    // Reviews API
    async submitReview(revieweeId, rating, comment) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                reviewer_id: currentUser.id,
                reviewee_id: revieweeId,
                rating: parseInt(rating),
                comment
            }])
            .select()
            .single();
            
        if (error) return { success: false, error: error.message };
        
        // Recalculate partner rating
        const { data: userReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', revieweeId);
            
        if (userReviews && userReviews.length > 0) {
            const sum = userReviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avg = parseFloat((sum / userReviews.length).toFixed(1));
            
            await supabase
                .from('profiles')
                .update({ rating: avg })
                .eq('id', revieweeId);
        }
        
        return { success: true, review: data };
    },

    async getReviewsForUser(userId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('reviewee_id', userId);
        if (error) return [];
        return data;
    },

    // Admin Panel Actions
    async getReports() {
        const { data, error } = await supabase
            .from('reports')
            .select('*');
        if (error) return [];
        return data;
    },

    async createReport(reportedUserId, reason) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Auth required.' };
        
        const { error } = await supabase
            .from('reports')
            .insert([{
                reporter_id: currentUser.id,
                reported_user_id: reportedUserId,
                reason,
                status: 'pending'
            }]);
            
        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    async approveUser(userId, approveState) {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ approved: approveState })
            .eq('id', userId);
        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    async suspendAccount(userId, suspendState) {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ suspended: suspendState })
            .eq('id', userId);
        if (error) return { success: false, error: error.message };
        return { success: true };
    }
};

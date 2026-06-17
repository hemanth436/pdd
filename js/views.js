/* Async views rendering and Supabase Action Handlers */

import { DbState } from './state.js';
import { Router } from './router.js';

const viewContainer = document.getElementById('app-view-container');
const modalOverlay = document.getElementById('global-modal-overlay');
const modalBody = document.getElementById('global-modal-body');
const modalClose = document.getElementById('global-modal-close');

// Register global modal closer
modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

export const Views = {
    // Helper to display dynamic toast alerts
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-triangle';
        if (type === 'warning') iconName = 'alert-circle';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 50);
        
        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // Helper to open modal with custom markup and bind events
    openModal(htmlContent, onBind = null) {
        modalBody.innerHTML = htmlContent;
        modalOverlay.classList.add('active');
        lucide.createIcons();
        if (onBind) {
            onBind(modalBody);
        }
    },

    closeModal() {
        modalOverlay.classList.remove('active');
    },

    renderPageLoader() {
        viewContainer.innerHTML = `
            <div class="page-loader">
                <div class="spinner"></div>
            </div>
        `;
    },

    // ==========================================================================
    // 1. LANDING PAGE
    // ==========================================================================
    async renderLanding() {
        this.renderPageLoader();
        
        const markup = `
            <section class="hero-section">
                <div class="hero-container">
                    <div class="hero-badge">
                        <i data-lucide="sparkles"></i> Peer-to-Peer Decentralized Exchange
                    </div>
                    <h1 class="hero-title">Learn Any Skill.<br>Swap with <span>Your Own.</span></h1>
                    <p class="hero-subtitle">Connect with global mentors, swap expertise, and expand your horizons. No subscriptions. No financial transactions. Just direct knowledge swap.</p>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-cta-green" id="hero-get-started"><i data-lucide="play-circle"></i> Get Started</button>
                        <button class="btn btn-secondary" id="hero-explore-skills"><i data-lucide="search"></i> Explore Skills</button>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="landing-section" id="how-it-works">
                <div class="section-header">
                    <h2 class="section-title">How It Works</h2>
                    <p class="section-subtitle">Swap skills in 4 easy steps without spending a single dollar.</p>
                </div>
                <div class="features-grid">
                    <div class="glass-card feature-card">
                        <div class="feature-icon"><i data-lucide="user-plus"></i></div>
                        <h3>1. Register Account</h3>
                        <p>Create a profile, mention your target learning fields, and catalog the unique skills you can offer.</p>
                    </div>
                    <div class="glass-card feature-card">
                        <div class="feature-icon"><i data-lucide="search"></i></div>
                        <h3>2. Explore & Match</h3>
                        <p>Browse skills listed by mentors worldwide. Filter by category, language, and teacher ratings.</p>
                    </div>
                    <div class="glass-card feature-card">
                        <div class="feature-icon"><i data-lucide="refresh-cw"></i></div>
                        <h3>3. Propose a Swap</h3>
                        <p>Request a match. Offer to teach your skill in exchange for learning their specialty.</p>
                    </div>
                    <div class="glass-card feature-card">
                        <div class="feature-icon"><i data-lucide="video"></i></div>
                        <h3>4. Learn & Grow</h3>
                        <p>Once accepted, schedule a session using our interactive virtual workspace to teach each other.</p>
                    </div>
                </div>
            </section>

            <!-- Categories Section -->
            <section class="landing-section">
                <div class="section-header">
                    <h2 class="section-title">Browse Categories</h2>
                    <p class="section-subtitle">Discover diverse topics offered by community mentors.</p>
                </div>
                <div class="categories-grid">
                    <div class="category-card" data-cat="Tech">
                        <i data-lucide="code"></i>
                        <h3>Technology</h3>
                        <p class="text-muted">Coding, DevOps, Database</p>
                    </div>
                    <div class="category-card" data-cat="Music">
                        <i data-lucide="music"></i>
                        <h3>Music</h3>
                        <p class="text-muted">Guitar, Piano, Vocal training</p>
                    </div>
                    <div class="category-card" data-cat="Marketing">
                        <i data-lucide="trending-up"></i>
                        <h3>Marketing</h3>
                        <p class="text-muted">SEO, Social Media, Growth</p>
                    </div>
                    <div class="category-card" data-cat="Languages">
                        <i data-lucide="languages"></i>
                        <h3>Languages</h3>
                        <p class="text-muted">Spanish, French, Mandarin</p>
                    </div>
                    <div class="category-card" data-cat="Design">
                        <i data-lucide="palette"></i>
                        <h3>Design & UX</h3>
                        <p class="text-muted">Figma, UI, Illustration</p>
                    </div>
                    <div class="category-card" data-cat="Business">
                        <i data-lucide="briefcase"></i>
                        <h3>Business</h3>
                        <p class="text-muted">Startup Pitching, Accounting</p>
                    </div>
                </div>
            </section>

            <!-- Bottom CTA Section -->
            <section class="landing-section" style="background: radial-gradient(circle at bottom, rgba(139, 92, 246, 0.08), transparent 70%);">
                <div class="glass-card" style="max-width: 900px; margin: 0 auto; text-align: center; padding: 4rem 2rem;">
                    <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Ready to Unlock Collaborative Learning?</h2>
                    <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 2rem;">Join a global collective of software developers, musicians, translators, and creative strategists exchanging knowledge.</p>
                    <button class="btn btn-primary btn-cta-green" id="landing-join-btn"><i data-lucide="user-plus"></i> Become a Mentor / Learner</button>
                </div>
            </section>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Bind Landing Page Actions
        document.getElementById('hero-get-started').addEventListener('click', () => Router.navigate('auth'));
        document.getElementById('hero-explore-skills').addEventListener('click', () => Router.navigate('explore'));
        document.getElementById('landing-join-btn').addEventListener('click', () => Router.navigate('auth'));
        
        // Category Card clicks
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = card.getAttribute('data-cat');
                Router.navigate(`explore?category=${cat}`);
            });
        });
    },

    // ==========================================================================
    // 2. AUTHENTICATION PAGE (LOGIN & SIGN UP)
    // ==========================================================================
    async renderAuth(activeTab = 'login') {
        this.renderPageLoader();
        
        const markup = `
            <div class="auth-wrapper">
                <div class="auth-container">
                    <div class="glass-card auth-card">
                        <div class="auth-tabs">
                            <button class="auth-tab ${activeTab === 'login' ? 'active' : ''}" id="tab-login-btn">Login</button>
                            <button class="auth-tab ${activeTab === 'signup' ? 'active' : ''}" id="tab-signup-btn">Sign Up</button>
                        </div>
                        
                        <!-- Login Tab Form -->
                        <div class="auth-form-content" id="login-form-container" style="display: ${activeTab === 'login' ? 'block' : 'none'};">
                            <div class="auth-header">
                                <h2>Welcome Back</h2>
                                <p class="text-muted">Enter credentials to access your dashboard</p>
                            </div>
                            
                            <div class="auth-social">
                                <button class="btn btn-secondary" id="auth-google-login">
                                    <svg style="width:18px;height:18px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.714 5.714 0 0 1 8.28 12.886a5.714 5.714 0 0 1 5.71-5.714c1.623 0 3.012.615 4.093 1.625l3.207-3.2A10.206 10.206 0 0 0 13.99 2A10.002 10.002 0 0 0 4 12c0 5.523 4.477 10 10 10 5.727 0 9.5-4.023 9.5-9.682 0-.648-.068-1.284-.2-2.033H12.24z"/></svg>
                                    Continue with Google
                                </button>
                                <button class="btn btn-secondary" id="auth-email-login-sso">
                                    <i data-lucide="mail"></i> Continue with Email
                                </button>
                            </div>
                            
                            <div class="divider">or use passwords</div>

                            <form id="login-form">
                                <div class="form-group">
                                    <label class="form-label" for="login-email">Email Address</label>
                                    <input class="form-input" id="login-email" type="email" placeholder="you@example.com" required value="sarah@example.com">
                                </div>
                                <div class="form-group">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <label class="form-label" for="login-password">Password</label>
                                        <button type="button" class="footer-btn-link" style="font-size:0.8rem;" id="login-forgot-pwd">Forgot Password?</button>
                                    </div>
                                    <input class="form-input" id="login-password" type="password" placeholder="••••••••" required value="password">
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;" id="login-submit-btn">Login</button>
                            </form>
                            
                            <div class="auth-footer-links">
                                <button class="footer-btn-link" id="auth-back-btn-1"><i data-lucide="arrow-left" style="width:14px;height:14px;display:inline;"></i> Back to Home</button>
                            </div>
                        </div>

                        <!-- Sign Up Tab Form -->
                        <div class="auth-form-content" id="signup-form-container" style="display: ${activeTab === 'signup' ? 'block' : 'none'};">
                            <div class="auth-header">
                                <h2>Create Account</h2>
                                <p class="text-muted">Start exchanging skills in our ecosystem</p>
                            </div>
                            
                            <form id="signup-form">
                                <div class="form-group">
                                    <label class="form-label" for="signup-name">Full Name</label>
                                    <input class="form-input" id="signup-name" type="text" placeholder="Sarah Connor" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="signup-email">Email Address</label>
                                    <input class="form-input" id="signup-email" type="email" placeholder="sarah@example.com" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Register As</label>
                                    <div style="display:flex; gap:1rem;">
                                        <label class="form-checkbox-group" style="flex:1; padding:0.5rem; border:1px solid var(--card-border); border-radius:var(--radius-md); justify-content:center;">
                                            <input type="radio" name="signup-role" value="learner" checked> Learner
                                        </label>
                                        <label class="form-checkbox-group" style="flex:1; padding:0.5rem; border:1px solid var(--card-border); border-radius:var(--radius-md); justify-content:center;">
                                            <input type="radio" name="signup-role" value="mentor"> Mentor
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="signup-bio">Bio (What you teach or want to learn)</label>
                                    <textarea class="form-textarea" id="signup-bio" placeholder="Write a short summary..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Profile Picture (Mock upload)</label>
                                    <button type="button" class="btn btn-secondary" style="font-size:0.85rem;" id="signup-upload-btn"><i data-lucide="upload-cloud"></i> Upload Profile Image</button>
                                </div>
                                <div class="form-group">
                                    <label class="form-checkbox-group">
                                        <input type="checkbox" id="signup-terms" required> I agree to the Privacy Policy & Terms.
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;" id="signup-submit-btn">Create Account</button>
                            </form>
                            
                            <div style="text-align:center; margin-top:1.5rem; display:flex; justify-content:space-around;">
                                <button class="footer-btn-link" style="font-size:0.85rem;" id="signup-verify-email"><i data-lucide="check-circle" style="width:14px;height:14px;display:inline;"></i> Verify Email mock</button>
                                <button class="footer-btn-link" style="font-size:0.85rem;" id="auth-back-btn-2"><i data-lucide="arrow-left" style="width:14px;height:14px;display:inline;"></i> Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Register Tab Switchers
        const tabLogin = document.getElementById('tab-login-btn');
        const tabSignup = document.getElementById('tab-signup-btn');
        const loginForm = document.getElementById('login-form-container');
        const signupForm = document.getElementById('signup-form-container');

        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        });

        tabSignup.addEventListener('click', () => {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        });

        // Submit Login Form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const res = await DbState.login(email, password);
            if (res.success) {
                this.showToast(`Logged in successfully as ${res.user.name}!`, 'success');
                window.dispatchEvent(new Event('authChange'));
                if (res.user.role === 'admin') {
                    Router.navigate('admin');
                } else {
                    Router.navigate('dashboard');
                }
            } else {
                this.showToast(res.error, 'error');
            }
        });

        // Submit Sign Up Form
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const bio = document.getElementById('signup-bio').value;
            const role = document.querySelector('input[name="signup-role"]:checked').value;
            
            const res = await DbState.signup({ name, email, bio, role });
            if (res.success) {
                this.showToast(`Account successfully registered! Logged in as ${res.user.name}.`, 'success');
                window.dispatchEvent(new Event('authChange'));
                Router.navigate('dashboard');
            } else {
                this.showToast(res.error, 'error');
            }
        });

        // Other auth actions
        document.getElementById('auth-google-login').addEventListener('click', () => {
            this.showToast('Continuing with Google OAuth (Simulation)...', 'info');
        });
        document.getElementById('auth-email-login-sso').addEventListener('click', () => {
            this.showToast('Enter code sent to your email (Simulation)...', 'info');
        });
        document.getElementById('login-forgot-pwd').addEventListener('click', () => {
            this.showToast('Forgot password link sent to input email address (Simulation).', 'warning');
        });
        document.getElementById('signup-upload-btn').addEventListener('click', () => {
            this.showToast('Profile image uploaded mock state (Simulation).', 'success');
        });
        document.getElementById('signup-verify-email').addEventListener('click', () => {
            this.showToast('Confirmation code verified! Your account email is authenticated.', 'success');
        });
        
        const backBtn1 = document.getElementById('auth-back-btn-1');
        const backBtn2 = document.getElementById('auth-back-btn-2');
        if (backBtn1) backBtn1.addEventListener('click', () => Router.navigate('home'));
        if (backBtn2) backBtn2.addEventListener('click', () => Router.navigate('home'));
    },

    // ==========================================================================
    // 3. DASHBOARD PAGE
    // ==========================================================================
    async renderDashboard(activeSubSection = 'overview') {
        const user = await DbState.getCurrentUser();
        if (!user) {
            Router.navigate('auth');
            this.showToast('Please login first to view dashboard', 'warning');
            return;
        }

        this.renderPageLoader();

        // Calculate stats
        const allSkills = await DbState.getSkills();
        const mySkillsCount = allSkills.filter(s => s.owner_id === user.id).length;
        
        const allSwaps = await DbState.getSwapRequests();
        const myRequests = allSwaps.filter(sw => sw.sender_id === user.id || sw.receiver_id === user.id);
        const bookedSessions = myRequests.filter(sw => sw.status === 'booked');
        
        const markup = `
            <div class="dashboard-container">
                <!-- Dashboard Left Sidebar -->
                <aside class="dashboard-sidebar">
                    <div class="glass-card user-profile-summary">
                        <div class="user-avatar-lg">${user.avatar}</div>
                        <h3>${user.name}</h3>
                        <span class="badge ${user.role === 'mentor' ? 'badge-primary' : 'badge-success'}">${user.role.toUpperCase()}</span>
                        <p class="text-muted" style="font-size:0.85rem;">Average Rating: <i data-lucide="star" style="width:12px;height:12px;fill:var(--color-warning);color:var(--color-warning);display:inline;"></i> ${user.rating}</p>
                        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.5rem;">${user.bio}</p>
                    </div>

                    <div class="glass-card sidebar-menu">
                        <button class="sidebar-btn ${activeSubSection === 'overview' ? 'active' : ''}" id="sidebar-overview-btn"><i data-lucide="layout-dashboard"></i> Overview</button>
                        <button class="sidebar-btn ${activeSubSection === 'profile' ? 'active' : ''}" id="sidebar-profile-btn"><i data-lucide="user"></i> My Profile</button>
                        <button class="sidebar-btn ${activeSubSection === 'requests' ? 'active' : ''}" id="sidebar-requests-btn"><i data-lucide="repeat"></i> My Requests (${myRequests.length})</button>
                        <button class="sidebar-btn ${activeSubSection === 'sessions' ? 'active' : ''}" id="sidebar-sessions-btn"><i data-lucide="calendar"></i> My Sessions (${bookedSessions.length})</button>
                        <button class="sidebar-btn" id="sidebar-explore-btn"><i data-lucide="search"></i> Search Skills</button>
                        <button class="sidebar-btn" id="sidebar-notifications-btn"><i data-lucide="bell"></i> Notifications</button>
                        <button class="sidebar-btn" id="sidebar-messages-btn"><i data-lucide="message-square"></i> Messages</button>
                        <button class="sidebar-btn" style="color:var(--color-danger);" id="sidebar-logout-btn"><i data-lucide="log-out"></i> Logout</button>
                    </div>
                </aside>

                <!-- Dashboard Main Content Area -->
                <main class="dashboard-main" id="dashboard-content-area">
                    <!-- Loaded dynamically via renderDashboardSubSection() -->
                </main>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Bind Sidebar Buttons
        document.getElementById('sidebar-overview-btn').addEventListener('click', () => this.renderDashboardSubSection('overview'));
        document.getElementById('sidebar-profile-btn').addEventListener('click', () => this.renderDashboardSubSection('profile'));
        document.getElementById('sidebar-requests-btn').addEventListener('click', () => this.renderDashboardSubSection('requests'));
        document.getElementById('sidebar-sessions-btn').addEventListener('click', () => this.renderDashboardSubSection('sessions'));
        document.getElementById('sidebar-explore-btn').addEventListener('click', () => Router.navigate('explore'));
        
        document.getElementById('sidebar-notifications-btn').addEventListener('click', () => {
            this.showToast('You have no unread notifications.', 'info');
        });
        
        document.getElementById('sidebar-messages-btn').addEventListener('click', () => Router.navigate('chat'));
        
        document.getElementById('sidebar-logout-btn').addEventListener('click', async () => {
            await DbState.logout();
            this.showToast('Logged out successfully.', 'info');
            window.dispatchEvent(new Event('authChange'));
            Router.navigate('home');
        });

        // Initialize Subsection
        await this.renderDashboardSubSection(activeSubSection);
    },

    async renderDashboardSubSection(subSectionName) {
        const user = await DbState.getCurrentUser();
        const area = document.getElementById('dashboard-content-area');
        if (!area) return;

        // Toggle active styling in sidebar
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            if (btn.id === `sidebar-${subSectionName}-btn`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        let markup = '';

        if (subSectionName === 'overview') {
            const allSkills = await DbState.getSkills();
            const mySkills = allSkills.filter(s => s.owner_id === user.id);
            const allSwaps = await DbState.getSwapRequests();
            const mySwaps = allSwaps.filter(sw => sw.sender_id === user.id || sw.receiver_id === user.id);
            const pendingSwaps = mySwaps.filter(sw => sw.status === 'pending');
            const bookedSwaps = mySwaps.filter(sw => sw.status === 'booked' || sw.status === 'accepted');

            // Map pending swap items asynchronously
            const pendingIncoming = pendingSwaps.filter(sw => sw.receiver_id === user.id);
            const incomingItems = await Promise.all(pendingIncoming.map(async (sw) => {
                const sender = await DbState.getUserById(sw.sender_id);
                const reqSkill = await DbState.getSkillById(sw.requested_skill_id);
                const offSkill = await DbState.getSkillById(sw.offered_skill_id);
                return { sw, sender, reqSkill, offSkill };
            }));

            const pendingOutgoing = pendingSwaps.filter(sw => sw.sender_id === user.id);
            const outgoingItems = await Promise.all(pendingOutgoing.map(async (sw) => {
                const receiver = await DbState.getUserById(sw.receiver_id);
                const reqSkill = await DbState.getSkillById(sw.requested_skill_id);
                return { sw, receiver, reqSkill };
            }));

            markup = `
                <h2>Dashboard Overview</h2>
                
                <!-- Quick Stats Grid -->
                <div class="stats-bar">
                    <div class="glass-card stat-card">
                        <div class="stat-value">${mySkills.length}</div>
                        <div class="stat-label">My Offered Skills</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${pendingSwaps.length}</div>
                        <div class="stat-label">Pending Swaps</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${bookedSwaps.length}</div>
                        <div class="stat-label">Upcoming Sessions</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${user.rating}</div>
                        <div class="stat-label">User Rating</div>
                    </div>
                </div>

                <!-- Section: My Skills Offered -->
                <div class="glass-card">
                    <div class="dashboard-card-header">
                        <h3>My Listed Skills</h3>
                        <button class="btn btn-primary" id="dash-add-skill-btn"><i data-lucide="plus"></i> Add New Skill</button>
                    </div>
                    <div class="list-items">
                        ${mySkills.length === 0 ? '<p class="text-muted">You have not listed any skills yet.</p>' : 
                          mySkills.map(skill => `
                            <div class="list-item">
                                <div class="list-item-info">
                                    <div class="list-item-icon"><i data-lucide="book-open"></i></div>
                                    <div class="list-item-details">
                                        <h5>${skill.title}</h5>
                                        <p>${skill.category} &bull; ${skill.level}</p>
                                    </div>
                                </div>
                                <div class="list-item-actions">
                                    <button class="btn btn-secondary" onclick="window.appActions.editSkill('${skill.id}')"><i data-lucide="edit-3"></i> Edit Skill</button>
                                    <button class="btn btn-danger" onclick="window.appActions.deleteSkill('${skill.id}')"><i data-lucide="trash-2"></i> Delete Skill</button>
                                </div>
                            </div>
                          `).join('')
                        }
                    </div>
                </div>

                <!-- Swap requests -->
                <div class="dashboard-row">
                    <!-- Incoming requests -->
                    <div class="glass-card">
                        <div class="dashboard-card-header">
                            <h3>Incoming Proposals</h3>
                        </div>
                        <div class="list-items">
                            ${incomingItems.length === 0 ? 
                              '<p class="text-muted">No pending incoming swap proposals.</p>' : 
                              incomingItems.map(item => `
                                <div class="list-item">
                                    <div class="list-item-details">
                                        <h5>${item.sender ? item.sender.name : 'User'} wants ${item.reqSkill ? item.reqSkill.title : 'Skill'}</h5>
                                        <p>Offering: ${item.offSkill ? item.offSkill.title : 'Skill'}</p>
                                    </div>
                                    <div class="list-item-actions" style="margin-top:0.5rem; flex-direction:column; gap:0.25rem;">
                                        <button class="btn btn-primary" onclick="window.appActions.viewSwap('${item.sw.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="eye" style="width:12px;height:12px;"></i> View Details</button>
                                        <button class="btn btn-success" onclick="window.appActions.acceptSwap('${item.sw.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="check" style="width:12px;height:12px;"></i> Accept Exchange</button>
                                        <button class="btn btn-danger" onclick="window.appActions.rejectSwap('${item.sw.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="x" style="width:12px;height:12px;"></i> Reject Exchange</button>
                                    </div>
                                </div>
                              `).join('')
                            }
                        </div>
                    </div>

                    <!-- Outgoing requests -->
                    <div class="glass-card">
                        <div class="dashboard-card-header">
                            <h3>Outgoing Requests</h3>
                        </div>
                        <div class="list-items">
                            ${outgoingItems.length === 0 ? 
                              '<p class="text-muted">No pending outgoing swap proposals.</p>' : 
                              outgoingItems.map(item => `
                                <div class="list-item">
                                    <div class="list-item-details">
                                        <h5>Requested from ${item.receiver ? item.receiver.name : 'User'}</h5>
                                        <p>Skill: ${item.reqSkill ? item.reqSkill.title : 'Skill'}</p>
                                    </div>
                                    <div class="list-item-actions">
                                        <button class="btn btn-secondary" onclick="window.appActions.viewSwap('${item.sw.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="eye" style="width:12px;height:12px;"></i> View Details</button>
                                        <button class="btn btn-danger" onclick="window.appActions.cancelSwap('${item.sw.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i> Cancel Request</button>
                                    </div>
                                </div>
                              `).join('')
                            }
                        </div>
                    </div>
                </div>
            `;
        } 
        
        else if (subSectionName === 'profile') {
            markup = `
                <h2>My Profile Settings</h2>
                <div class="glass-card">
                    <form id="edit-profile-form">
                        <div class="form-group">
                            <label class="form-label" for="profile-name">Full Name</label>
                            <input class="form-input" id="profile-name" type="text" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Account Role Type</label>
                            <div style="display:flex; gap:1rem;">
                                <label class="form-checkbox-group" style="flex:1; padding:0.5rem; border:1px solid var(--card-border); border-radius:var(--radius-md); justify-content:center;">
                                    <input type="radio" name="profile-role" value="learner" ${user.role === 'learner' ? 'checked' : ''}> Learner
                                </label>
                                <label class="form-checkbox-group" style="flex:1; padding:0.5rem; border:1px solid var(--card-border); border-radius:var(--radius-md); justify-content:center;">
                                    <input type="radio" name="profile-role" value="mentor" ${user.role === 'mentor' ? 'checked' : ''}> Mentor
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="profile-bio">Profile Bio</label>
                            <textarea class="form-textarea" id="profile-bio" required>${user.bio}</textarea>
                        </div>
                        <div style="display:flex; gap:1rem; margin-top:1.5rem;">
                            <button type="submit" class="btn btn-primary" id="save-profile-btn"><i data-lucide="save"></i> Edit Profile</button>
                        </div>
                    </form>
                </div>
            `;
        } 
        
        else if (subSectionName === 'requests') {
            const allSwaps = await DbState.getSwapRequests();
            const mySwaps = allSwaps.filter(sw => sw.sender_id === user.id || sw.receiver_id === user.id);

            const requestsItems = await Promise.all(mySwaps.map(async (sw) => {
                const isSender = sw.sender_id === user.id;
                const partner = await DbState.getUserById(isSender ? sw.receiver_id : sw.sender_id);
                const reqSkill = await DbState.getSkillById(sw.requested_skill_id);
                return { sw, isSender, partner, reqSkill };
            }));

            markup = `
                <div class="dashboard-card-header">
                    <h2>My Swap Requests History</h2>
                </div>
                <div class="glass-card">
                    <div class="list-items">
                        ${requestsItems.length === 0 ? '<p class="text-muted">You have no requests recorded.</p>' : 
                          requestsItems.map(item => {
                              let badgeClass = 'badge-warning';
                              if (item.sw.status === 'accepted' || item.sw.status === 'booked') badgeClass = 'badge-success';
                              if (item.sw.status === 'rejected') badgeClass = 'badge-danger';
                              
                              return `
                                <div class="list-item">
                                    <div class="list-item-details">
                                        <h5>${item.isSender ? `Proposal Sent to ${item.partner ? item.partner.name : 'User'}` : `Proposal Received from ${item.partner ? item.partner.name : 'User'}`}</h5>
                                        <p>Target Skill: ${item.reqSkill ? item.reqSkill.title : 'Skill'} &bull; Status: <span class="badge ${badgeClass}">${item.sw.status.toUpperCase()}</span></p>
                                    </div>
                                    <div class="list-item-actions">
                                        <button class="btn btn-secondary" onclick="window.appActions.viewSwap('${item.sw.id}')"><i data-lucide="eye"></i> View Details</button>
                                        ${item.sw.status === 'pending' && item.isSender ? `<button class="btn btn-danger" onclick="window.appActions.cancelSwap('${item.sw.id}')"><i data-lucide="trash-2"></i> Cancel Request</button>` : ''}
                                        ${item.sw.status === 'pending' && !item.isSender ? `
                                            <button class="btn btn-success" onclick="window.appActions.acceptSwap('${item.sw.id}')"><i data-lucide="check"></i> Accept</button>
                                            <button class="btn btn-danger" onclick="window.appActions.rejectSwap('${item.sw.id}')"><i data-lucide="x"></i> Reject</button>
                                        ` : ''}
                                    </div>
                                </div>
                              `;
                          }).join('')
                        }
                    </div>
                </div>
            `;
        } 
        
        else if (subSectionName === 'sessions') {
            const allSwaps = await DbState.getSwapRequests();
            const bookedSessions = allSwaps.filter(sw => (sw.sender_id === user.id || sw.receiver_id === user.id) && sw.status === 'booked');

            const sessionItems = await Promise.all(bookedSessions.map(async (sw) => {
                const isSender = sw.sender_id === user.id;
                const partner = await DbState.getUserById(isSender ? sw.receiver_id : sw.sender_id);
                const reqSkill = await DbState.getSkillById(sw.requested_skill_id);
                const offSkill = await DbState.getSkillById(sw.offered_skill_id);
                return { sw, isSender, partner, reqSkill, offSkill };
            }));

            markup = `
                <h2>My Booked Swap Sessions</h2>
                <div class="glass-card">
                    <div class="list-items">
                        ${sessionItems.length === 0 ? '<p class="text-muted">You have no upcoming booked sessions.</p>' : 
                          sessionItems.map(item => `
                                <div class="list-item">
                                    <div class="list-item-details">
                                        <h5>Learning: ${item.isSender ? (item.reqSkill ? item.reqSkill.title : '') : (item.offSkill ? item.offSkill.title : '')}</h5>
                                        <p>Teacher: ${item.partner ? item.partner.name : 'User'} &bull; Date: <strong>${new Date(item.sw.booked_date).toLocaleString()}</strong></p>
                                    </div>
                                    <div class="list-item-actions">
                                        <button class="btn btn-primary" onclick="window.appActions.joinSession('${item.sw.id}')"><i data-lucide="video"></i> Join Session</button>
                                        <button class="btn btn-danger" onclick="window.appActions.cancelSwap('${item.sw.id}')"><i data-lucide="calendar-x"></i> Cancel Request</button>
                                        <button class="btn btn-secondary" onclick="window.appActions.openReviewModal('${item.partner ? item.partner.id : ''}')"><i data-lucide="star"></i> Rate User</button>
                                    </div>
                                </div>
                              `).join('')
                        }
                    </div>
                </div>
            `;
        }

        area.innerHTML = markup;
        lucide.createIcons();

        // Sub-section forms listeners
        if (subSectionName === 'overview') {
            document.getElementById('dash-add-skill-btn').addEventListener('click', () => Router.navigate('list-skill'));
        } else if (subSectionName === 'profile') {
            document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('profile-name').value;
                const bio = document.getElementById('profile-bio').value;
                const role = document.querySelector('input[name="profile-role"]:checked').value;
                
                const res = await DbState.updateProfile({ name, bio, role });
                if (res.success) {
                    this.showToast('Profile updated successfully!', 'success');
                    await this.renderDashboard('profile');
                } else {
                    this.showToast(res.error, 'error');
                }
            });
        }
    },

    // ==========================================================================
    // 4. SKILL EXCHANGE DETAILS PAGE
    // ==========================================================================
    async renderSwapDetails(swapId) {
        this.renderPageLoader();
        
        const swap = await DbState.getSwapRequestById(swapId);
        if (!swap) {
            viewContainer.innerHTML = `<div class="glass-card" style="padding:4rem; text-align:center;"><h2>Request Not Found</h2><p class="text-muted">This proposal does not exist or was deleted.</p><button class="btn btn-secondary" onclick="Router.navigate('dashboard')">Back</button></div>`;
            return;
        }

        const sender = await DbState.getUserById(swap.sender_id);
        const receiver = await DbState.getUserById(swap.receiver_id);
        const reqSkill = await DbState.getSkillById(swap.requested_skill_id);
        const offSkill = await DbState.getSkillById(swap.offered_skill_id);
        const currentUser = await DbState.getCurrentUser();
        
        let statusBadgeClass = 'badge-warning';
        if (swap.status === 'accepted' || swap.status === 'booked') statusBadgeClass = 'badge-success';
        if (swap.status === 'rejected') statusBadgeClass = 'badge-danger';

        const markup = `
            <div class="auth-wrapper" style="background:none;">
                <div class="glass-card" style="width:100%; max-width:800px; padding:3rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; border-bottom:1px solid var(--card-border); padding-bottom:1rem;">
                        <h2>Skill Swap Proposal</h2>
                        <span class="badge ${statusBadgeClass}" style="font-size:1rem; padding:0.4rem 1rem;">${swap.status.toUpperCase()}</span>
                    </div>

                    <!-- Visual Swap Flow comparison row -->
                    <div style="display:grid; grid-template-columns:1fr 80px 1fr; gap:1.5rem; text-align:center; align-items:center; margin-bottom:3rem;">
                        <div class="glass-card" style="padding:1.5rem; background:rgba(0,0,0,0.15)">
                            <div class="user-avatar-lg" style="margin:0 auto 1rem;">${sender ? sender.avatar : 'U'}</div>
                            <h3>${sender ? sender.name : 'Sender'}</h3>
                            <p class="text-muted">Proposing Skill:</p>
                            <h4 style="color:var(--color-primary); margin-top:0.25rem;">${offSkill ? offSkill.title : 'Skill Offered'}</h4>
                        </div>
                        
                        <div>
                            <i data-lucide="refresh-cw" style="width:40px; height:40px; color:var(--color-primary); animation: spin 12s linear infinite;"></i>
                        </div>
                        
                        <div class="glass-card" style="padding:1.5rem; background:rgba(0,0,0,0.15)">
                            <div class="user-avatar-lg" style="margin:0 auto 1rem;">${receiver ? receiver.avatar : 'U'}</div>
                            <h3>${receiver ? receiver.name : 'Receiver'}</h3>
                            <p class="text-muted">Requesting Skill:</p>
                            <h4 style="color:var(--color-secondary); margin-top:0.25rem;">${reqSkill ? reqSkill.title : 'Skill Wanted'}</h4>
                        </div>
                    </div>

                    <!-- Swap Status Details -->
                    <div style="background:var(--badge-bg); border-radius:var(--radius-md); padding:1.5rem; margin-bottom:2rem;">
                        <h4 style="margin-bottom:0.5rem;"><i data-lucide="info" style="display:inline; width:16px; height:16px;"></i> Proposal Information</h4>
                        <p><strong>Created:</strong> ${new Date(swap.created_at).toLocaleDateString()}</p>
                        ${swap.booked_date ? `<p><strong>Scheduled Meeting Time:</strong> ${new Date(swap.booked_date).toLocaleString()}</p>` : ''}
                        <p style="margin-top:0.5rem;"><strong>Description:</strong> Direct matching swap session. Both parties agree to exchange structured knowledge sessions.</p>
                    </div>

                    <!-- Interactive Buttons dynamically populated -->
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                        <button class="btn btn-secondary" onclick="Router.navigate('dashboard')"><i data-lucide="arrow-left"></i> Back</button>
                        <div style="display:flex; gap:1rem;">
                            <!-- Action triggers based on status and user identity -->
                            ${swap.status === 'pending' && currentUser && currentUser.id === swap.receiver_id ? `
                                <button class="btn btn-success" id="swap-accept-btn"><i data-lucide="check"></i> Accept Exchange</button>
                                <button class="btn btn-danger" id="swap-reject-btn"><i data-lucide="x"></i> Reject Exchange</button>
                            ` : ''}

                            ${swap.status === 'pending' && currentUser && currentUser.id === swap.sender_id ? `
                                <button class="btn btn-danger" id="swap-cancel-btn"><i data-lucide="trash-2"></i> Cancel Request</button>
                            ` : ''}

                            ${swap.status === 'accepted' ? `
                                <button class="btn btn-primary btn-cta-green" id="swap-book-btn"><i data-lucide="calendar"></i> Book Session</button>
                                <button class="btn btn-danger" id="swap-reject-btn"><i data-lucide="x"></i> Reject Exchange</button>
                            ` : ''}

                            ${swap.status === 'booked' ? `
                                <button class="btn btn-primary btn-cta-green" id="swap-join-btn"><i data-lucide="video"></i> Join Session</button>
                                <button class="btn btn-danger" id="swap-cancel-btn"><i data-lucide="calendar-x"></i> Cancel Request</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Bind interactive event buttons
        const acceptBtn = document.getElementById('swap-accept-btn');
        const rejectBtn = document.getElementById('swap-reject-btn');
        const cancelBtn = document.getElementById('swap-cancel-btn');
        const bookBtn = document.getElementById('swap-book-btn');
        const joinBtn = document.getElementById('swap-join-btn');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', async () => {
                await DbState.updateSwapRequestStatus(swapId, 'accepted');
                this.showToast('Swap proposal accepted! You can now book the session.', 'success');
                await this.renderSwapDetails(swapId);
            });
        }
        if (rejectBtn) {
            rejectBtn.addEventListener('click', async () => {
                await DbState.updateSwapRequestStatus(swapId, 'rejected');
                this.showToast('Swap proposal declined.', 'warning');
                Router.navigate('dashboard');
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', async () => {
                await DbState.updateSwapRequestStatus(swapId, 'rejected');
                this.showToast('Swap request cancelled.', 'info');
                Router.navigate('dashboard');
            });
        }
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                // Open scheduling booking modal
                const modalHtml = `
                    <h3 style="margin-bottom:1.5rem;"><i data-lucide="calendar"></i> Schedule Swap Meeting</h3>
                    <form id="book-meeting-form">
                        <div class="form-group">
                            <label class="form-label" for="meeting-datetime">Select Date & Time</label>
                            <input class="form-input" id="meeting-datetime" type="datetime-local" required>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2rem;">
                            <button type="button" class="btn btn-secondary" onclick="Views.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary btn-cta-green" id="meeting-book-submit">Book Session</button>
                        </div>
                    </form>
                `;
                this.openModal(modalHtml, (modalEl) => {
                    modalEl.querySelector('#book-meeting-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const time = modalEl.querySelector('#meeting-datetime').value;
                        await DbState.bookSwapSession(swapId, time);
                        this.closeModal();
                        this.showToast('Session booked successfully! Video room links created.', 'success');
                        await this.renderSwapDetails(swapId);
                    });
                });
            });
        }
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                this.launchVideoCallMockup(swapId);
            });
        }
    },

    // Mock video call interface overlay
    launchVideoCallMockup(swapId) {
        const overlay = document.createElement('div');
        overlay.className = 'video-call-overlay';
        overlay.innerHTML = `
            <div class="video-grid">
                <div class="video-feed">
                    <span>Active Feed: Remote Partner (Video Streaming)</span>
                </div>
                <div class="video-feed" style="background:#0f172a;">
                    <span>Active Feed: Me (Local Camera preview)</span>
                </div>
            </div>
            <div class="video-controls">
                <button class="control-btn" id="vc-mic" title="Mute/Unmute Mic"><i data-lucide="mic"></i></button>
                <button class="control-btn" id="vc-cam" title="Toggle Cam"><i data-lucide="video"></i></button>
                <button class="control-btn" id="vc-share" title="Attach file"><i data-lucide="share-2"></i></button>
                <button class="control-btn btn-hangup" id="vc-hangup" title="Hangup Call"><i data-lucide="phone-off"></i></button>
            </div>
        `;
        document.body.appendChild(overlay);
        lucide.createIcons();

        // Control binds
        let micOn = true;
        let camOn = true;
        document.getElementById('vc-mic').addEventListener('click', (e) => {
            micOn = !micOn;
            const btn = e.currentTarget;
            btn.innerHTML = micOn ? `<i data-lucide="mic"></i>` : `<i data-lucide="mic-off" style="color:var(--color-danger)"></i>`;
            Views.showToast(micOn ? 'Microphone enabled.' : 'Microphone muted.', 'info');
            lucide.createIcons();
        });
        document.getElementById('vc-cam').addEventListener('click', (e) => {
            camOn = !camOn;
            const btn = e.currentTarget;
            btn.innerHTML = camOn ? `<i data-lucide="video"></i>` : `<i data-lucide="video-off" style="color:var(--color-danger)"></i>`;
            Views.showToast(camOn ? 'Camera preview enabled.' : 'Camera muted.', 'info');
            lucide.createIcons();
        });
        document.getElementById('vc-share').addEventListener('click', () => {
            Views.showToast('Select file or document from local drive to share in video channel.', 'info');
        });
        document.getElementById('vc-hangup').addEventListener('click', async () => {
            overlay.remove();
            Views.showToast('Call ended. Please write a review for your partner!', 'success');
            // Complete swap status and redirect to review modal
            const swap = await DbState.getSwapRequestById(swapId);
            if (swap) {
                await DbState.updateSwapRequestStatus(swapId, 'completed');
                const user = await DbState.getCurrentUser();
                const partnerId = user.id === swap.sender_id ? swap.receiver_id : swap.sender_id;
                await Views.openReviewModal(partnerId);
            }
        });
    },

    // ==========================================================================
    // 5. SKILL LISTING PAGE (ADD / EDIT SKILLS)
    // ==========================================================================
    async renderSkillListing(skillId = null) {
        this.renderPageLoader();
        
        const currentUser = await DbState.getCurrentUser();
        if (!currentUser) {
            Router.navigate('auth');
            return;
        }

        const isEditing = skillId !== null;
        let skill = null;
        if (isEditing) {
            skill = await DbState.getSkillById(skillId);
            if (!skill || skill.owner_id !== currentUser.id) {
                this.showToast('Unauthorized access to list editor.', 'error');
                Router.navigate('dashboard');
                return;
            }
        }

        const markup = `
            <div class="auth-wrapper" style="background:none;">
                <div class="glass-card" style="width:100%; max-width:650px;">
                    <div style="margin-bottom:2rem; border-bottom:1px solid var(--card-border); padding-bottom:1rem;">
                        <h2>${isEditing ? 'Edit Skill Listing' : 'Add New Skill Listing'}</h2>
                        <p class="text-muted">Describe the skill area you want to share with other community learners.</p>
                    </div>

                    <form id="skill-listing-form">
                        <div class="form-group">
                            <label class="form-label" for="skill-title">Skill Title</label>
                            <input class="form-input" id="skill-title" type="text" placeholder="e.g. Intermediate Web Design with Figma" required value="${isEditing ? skill.title : ''}">
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
                            <div class="form-group">
                                <label class="form-label" for="skill-category">Skill Category</label>
                                <select class="form-select" id="skill-category">
                                    <option value="Tech" ${isEditing && skill.category === 'Tech' ? 'selected' : ''}>Technology / Coding</option>
                                    <option value="Music" ${isEditing && skill.category === 'Music' ? 'selected' : ''}>Music & Arts</option>
                                    <option value="Marketing" ${isEditing && skill.category === 'Marketing' ? 'selected' : ''}>Marketing / SEO</option>
                                    <option value="Languages" ${isEditing && skill.category === 'Languages' ? 'selected' : ''}>Languages & Translating</option>
                                    <option value="Design" ${isEditing && skill.category === 'Design' ? 'selected' : ''}>Design & UX</option>
                                    <option value="Business" ${isEditing && skill.category === 'Business' ? 'selected' : ''}>Business / Startup</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="skill-level">Proficiency Level</label>
                                <select class="form-select" id="skill-level">
                                    <option value="Beginner" ${isEditing && skill.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                                    <option value="Intermediate" ${isEditing && skill.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option value="Advanced" ${isEditing && skill.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="skill-desc">Description (Outline topics, lessons format & requirements)</label>
                            <textarea class="form-textarea" id="skill-desc" placeholder="I offer help in..." style="min-height:150px;" required>${isEditing ? skill.description : ''}</textarea>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2.5rem; flex-wrap:wrap; gap:1.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="Router.navigate('dashboard')">Cancel</button>
                            <div style="display:flex; gap:1rem;">
                                ${isEditing ? `
                                    <button type="button" class="btn btn-danger" id="skill-delete-btn"><i data-lucide="trash-2"></i> Delete Skill</button>
                                    <button type="submit" class="btn btn-primary" id="skill-save-btn"><i data-lucide="save"></i> Save Skill</button>
                                ` : `
                                    <button type="submit" class="btn btn-primary btn-cta-green" id="skill-create-btn"><i data-lucide="plus-circle"></i> Add New Skill</button>
                                `}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Bind Save/Submit actions
        const form = document.getElementById('skill-listing-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const details = {
                title: document.getElementById('skill-title').value,
                category: document.getElementById('skill-category').value,
                level: document.getElementById('skill-level').value,
                description: document.getElementById('skill-desc').value
            };

            if (isEditing) {
                const res = await DbState.editSkill(skillId, details);
                if (res.success) {
                    this.showToast('Skill details saved successfully!', 'success');
                    Router.navigate('dashboard');
                } else {
                    this.showToast(res.error, 'error');
                }
            } else {
                const res = await DbState.addSkill(details);
                if (res.success) {
                    this.showToast('New skill listing published!', 'success');
                    Router.navigate('dashboard');
                } else {
                    this.showToast(res.error, 'error');
                }
            }
        });

        if (isEditing) {
            document.getElementById('skill-delete-btn').addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this skill listing?')) {
                    const res = await DbState.deleteSkill(skillId);
                    if (res.success) {
                        this.showToast('Skill listing deleted.', 'info');
                        Router.navigate('dashboard');
                    } else {
                        this.showToast(res.error, 'error');
                    }
                }
            });
        }
    },

    // ==========================================================================
    // 6. SEARCH & FILTER / EXPLORE PAGE
    // ==========================================================================
    async renderExplore(filters = {}) {
        this.renderPageLoader();
        
        const currentUser = await DbState.getCurrentUser();
        const allSkills = await DbState.getSkills();
        
        // Populate inputs
        const currentCat = filters.category || '';
        const currentSearch = filters.search || '';
        const currentLevel = filters.level || '';
        const currentSort = filters.sort || 'popularity';

        const markup = `
            <div class="search-explore-layout">
                <!-- Search & Filters Sidebar -->
                <aside class="glass-card filter-sidebar">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--card-border); padding-bottom:0.75rem;">
                        <h3>Filters</h3>
                        <button class="footer-btn-link" style="font-size:0.85rem;" id="clear-filters-btn">Clear Filter</button>
                    </div>

                    <!-- Category Filter -->
                    <div class="filter-section">
                        <h4>Category</h4>
                        <div class="filter-options">
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="" ${currentCat === '' ? 'checked' : ''}> All Categories
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Tech" ${currentCat === 'Tech' ? 'checked' : ''}> Tech / Coding
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Music" ${currentCat === 'Music' ? 'checked' : ''}> Music & Arts
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Marketing" ${currentCat === 'Marketing' ? 'checked' : ''}> Marketing
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Languages" ${currentCat === 'Languages' ? 'checked' : ''}> Languages
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Design" ${currentCat === 'Design' ? 'checked' : ''}> Design / UX
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-cat" value="Business" ${currentCat === 'Business' ? 'checked' : ''}> Business
                            </label>
                        </div>
                    </div>

                    <!-- Proficiency Level -->
                    <div class="filter-section">
                        <h4>Proficiency Level</h4>
                        <div class="filter-options">
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-level" value="" ${currentLevel === '' ? 'checked' : ''}> Any Level
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-level" value="Beginner" ${currentLevel === 'Beginner' ? 'checked' : ''}> Beginner
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-level" value="Intermediate" ${currentLevel === 'Intermediate' ? 'checked' : ''}> Intermediate
                            </label>
                            <label class="form-checkbox-group">
                                <input type="radio" name="filter-level" value="Advanced" ${currentLevel === 'Advanced' ? 'checked' : ''}> Advanced
                            </label>
                        </div>
                    </div>

                    <button class="btn btn-primary" style="width:100%; margin-top:1.5rem;" id="apply-filters-btn"><i data-lucide="sliders"></i> Apply Filter</button>
                </aside>

                <!-- Search Results Area -->
                <main class="explore-results-main">
                    <!-- Top Search Header panel -->
                    <div class="search-header">
                        <div class="search-bar-row">
                            <div class="search-input-wrapper">
                                <i data-lucide="search"></i>
                                <input class="form-input" id="search-input-box" type="text" placeholder="Search skills, topics or keywords..." value="${currentSearch}">
                            </div>
                            <button class="btn btn-primary" id="search-action-btn"><i data-lucide="search"></i> Search</button>
                        </div>

                        <div class="search-meta-row">
                            <span class="text-muted" id="results-count-span">Matching Skills</span>
                            <div class="sort-select-wrapper">
                                <span class="form-label" style="margin-bottom:0;">Sort:</span>
                                <select class="form-select" id="sort-select" style="width:auto; padding:0.4rem 1.5rem 0.4rem 0.8rem; font-size:0.9rem;">
                                    <option value="popularity" ${currentSort === 'popularity' ? 'selected' : ''}>Sort by Popularity</option>
                                    <option value="rating" ${currentSort === 'rating' ? 'selected' : ''}>Sort by Rating</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Skills Card grid -->
                    <div class="skills-list-grid" id="explore-skills-grid">
                        <!-- Loaded dynamically via filter calculations -->
                    </div>
                </main>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Perform filter computation
        const executeSearch = async () => {
            const searchVal = document.getElementById('search-input-box').value.toLowerCase();
            const catVal = document.querySelector('input[name="filter-cat"]:checked').value;
            const levelVal = document.querySelector('input[name="filter-level"]:checked').value;
            const sortVal = document.getElementById('sort-select').value;

            let filtered = allSkills;

            // Search text match
            if (searchVal) {
                filtered = filtered.filter(s => 
                    s.title.toLowerCase().includes(searchVal) || 
                    s.description.toLowerCase().includes(searchVal)
                );
            }

            // Category filter
            if (catVal) {
                filtered = filtered.filter(s => s.category === catVal);
            }

            // Level filter
            if (levelVal) {
                filtered = filtered.filter(s => s.level === levelVal);
            }

            // Sorting
            if (sortVal === 'rating') {
                filtered.sort((a, b) => b.rating - a.rating);
            } else {
                filtered.sort((a, b) => b.popularity - a.popularity);
            }

            // Render count
            document.getElementById('results-count-span').innerText = `Found ${filtered.length} matching skills`;

            // Load owners details asynchronously
            const cardItems = await Promise.all(filtered.map(async (skill) => {
                const owner = await DbState.getUserById(skill.owner_id);
                return { skill, owner };
            }));

            // Render cards
            const grid = document.getElementById('explore-skills-grid');
            if (cardItems.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:4rem;"><i data-lucide="frown" style="width:48px;height:48px;color:var(--text-muted);"></i><h3 style="margin-top:1rem;">No Skills Found</h3><p class="text-muted">Try adjusting your filters or search keywords.</p></div>`;
                lucide.createIcons();
                return;
            }

            grid.innerHTML = cardItems.map(item => {
                const isMine = currentUser && currentUser.id === item.skill.owner_id;
                
                return `
                    <div class="glass-card skill-card">
                        <div class="skill-card-body">
                            <div class="skill-owner">
                                <div class="skill-owner-avatar">${item.owner ? item.owner.avatar : 'U'}</div>
                                <span>${item.owner ? item.owner.name : 'Unknown Mentor'} &bull; <i data-lucide="star" style="width:11px;height:11px;fill:var(--color-warning);color:var(--color-warning);display:inline;"></i> ${item.skill.rating}</span>
                            </div>
                            <h3 style="font-size:1.15rem; margin-top:0.25rem;">${item.skill.title}</h3>
                            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.25rem;">
                                <span class="badge badge-primary">${item.skill.category}</span>
                                <span class="badge badge-success">${item.skill.level}</span>
                            </div>
                            <p class="text-secondary" style="font-size:0.875rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;">${item.skill.description}</p>
                        </div>
                        <div class="skill-card-footer">
                            <div style="display:flex; gap:0.25rem;">
                                <button class="btn btn-secondary" onclick="window.appActions.viewSkillDetails('${item.skill.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;" title="View Skill"><i data-lucide="eye" style="width:14px;height:14px;"></i> View</button>
                                <button class="btn btn-secondary" onclick="window.appActions.saveSkill('${item.skill.id}')" style="padding:0.4rem; border-radius:var(--radius-md);" title="Save Skill"><i data-lucide="bookmark" style="width:14px;height:14px;"></i></button>
                                <button class="btn btn-secondary" onclick="window.appActions.shareSkill('${item.skill.id}')" style="padding:0.4rem; border-radius:var(--radius-md);" title="Share Skill"><i data-lucide="share-2" style="width:14px;height:14px;"></i></button>
                            </div>
                            ${isMine ? '<span class="text-muted" style="font-size:0.8rem; font-weight:600;">My Listing</span>' : `
                                <button class="btn btn-primary" onclick="window.appActions.proposeSwap('${item.skill.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i data-lucide="refresh-cw" style="width:12px;height:12px;"></i> Swap Skills</button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        };

        // Bind interactive filter button clicks
        document.getElementById('apply-filters-btn').addEventListener('click', executeSearch);
        document.getElementById('search-action-btn').addEventListener('click', executeSearch);
        document.getElementById('sort-select').addEventListener('change', executeSearch);
        
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
            document.querySelectorAll('input[name="filter-cat"]')[0].checked = true;
            document.querySelectorAll('input[name="filter-level"]')[0].checked = true;
            document.getElementById('search-input-box').value = '';
            executeSearch();
        });

        // Trigger initial filter load
        await executeSearch();
    },

    // ==========================================================================
    // 7. CHAT / COMMUNICATION PAGE
    // ==========================================================================
    async renderChat(activeChatId = null) {
        this.renderPageLoader();
        
        const currentUser = await DbState.getCurrentUser();
        if (!currentUser) {
            Router.navigate('auth');
            return;
        }

        const chats = await DbState.getChats();
        let activeChat = null;
        if (activeChatId) {
            activeChat = chats.find(c => c.id === activeChatId);
        } else if (chats.length > 0) {
            activeChat = chats[0];
            activeChatId = activeChat.id;
        }

        // Fetch partner details for each conversation sidebar card
        const chatItems = await Promise.all(chats.map(async (c) => {
            const partnerId = c.user1 === currentUser.id ? c.user2 : c.user1;
            const partner = await DbState.getUserById(partnerId);
            return { c, partner };
        }));

        const markup = `
            <div class="chat-page-container">
                <!-- Chats Sidebar Contacts list -->
                <aside class="glass-card chat-contacts-panel">
                    <div class="contacts-header">
                        <h3>Conversations</h3>
                    </div>
                    <div class="contacts-list">
                        ${chatItems.length === 0 ? '<p class="text-muted" style="text-align:center; margin-top:2rem;">No active chats yet. Start one by proposing a skill swap!</p>' : 
                          chatItems.map(item => {
                              const lastMsg = item.c.messages[item.c.messages.length - 1];
                              const activeClass = item.c.id === activeChatId ? 'active' : '';
                              return `
                                <div class="contact-card ${activeClass}" onclick="window.appActions.openChat('${item.c.id}')">
                                    <div class="contact-avatar online">${item.partner ? item.partner.avatar : 'U'}</div>
                                    <div class="contact-info">
                                        <div class="contact-name-row">
                                            <span class="contact-name">${item.partner ? item.partner.name : 'Unknown User'}</span>
                                            <span class="contact-time">${lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                        </div>
                                        <div class="contact-last-msg">${lastMsg ? lastMsg.text : 'No messages yet.'}</div>
                                    </div>
                                </div>
                              `;
                          }).join('')
                        }
                    </div>
                </aside>

                <!-- Active Chat Bubble View Pane -->
                <main class="glass-card chat-main-panel">
                    ${!activeChat ? `
                        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem; text-align:center;">
                            <i data-lucide="message-square" style="width:64px;height:64px;color:var(--text-muted);margin-bottom:1.5rem;"></i>
                            <h3>No Active Chat Selected</h3>
                            <p class="text-muted">Select an ongoing discussion from the sidebar contacts list.</p>
                        </div>
                    ` : await (async () => {
                        const partnerId = activeChat.user1 === currentUser.id ? activeChat.user2 : activeChat.user1;
                        const partner = await DbState.getUserById(partnerId);
                        
                        return `
                            <!-- Chat pane Header -->
                            <div class="chat-pane-header">
                                <div class="chat-header-user">
                                    <div class="contact-avatar online">${partner ? partner.avatar : 'U'}</div>
                                    <div>
                                        <h4 style="margin:0;">${partner ? partner.name : 'Unknown'}</h4>
                                        <small class="text-muted">${partner ? partner.role.toUpperCase() : 'USER'}</small>
                                    </div>
                                </div>
                                <div class="chat-header-actions">
                                    <button class="btn btn-secondary" id="chat-video-call-btn" title="Start Video Call"><i data-lucide="video"></i> Start Video Call</button>
                                    <button class="btn btn-secondary" id="chat-schedule-btn" title="Schedule Meeting"><i data-lucide="calendar"></i> Schedule Meeting</button>
                                    <button class="btn btn-secondary" style="color:var(--color-danger);" id="chat-block-btn" title="Block User"><i data-lucide="shield-alert"></i> Block User</button>
                                </div>
                            </div>

                            <!-- Chat messages history -->
                            <div class="chat-messages-body" id="chat-messages-scroll-area">
                                ${activeChat.messages.length === 0 ? '<div class="text-muted" style="text-align:center; margin-top:2rem;">Start the conversion by writing a message below.</div>' : 
                                  activeChat.messages.map(msg => {
                                      const isMe = msg.senderId === currentUser.id;
                                      return `
                                        <div class="msg-bubble-wrapper ${isMe ? 'sent' : 'received'}">
                                            <div class="msg-bubble">
                                                ${msg.text}
                                                ${msg.attachment ? `
                                                    <div style="margin-top:0.5rem; display:flex; align-items:center; gap:0.5rem; background:rgba(0,0,0,0.2); padding:0.5rem; border-radius:var(--radius-sm); border:1px solid var(--card-border);">
                                                        <i data-lucide="file-text"></i>
                                                        <span style="font-size:0.8rem;">${msg.attachment}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                            <span class="msg-meta">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                      `;
                                  }).join('')
                                }
                            </div>

                            <!-- Chat Input text field compose area -->
                            <div class="chat-pane-footer">
                                <form id="chat-message-send-form">
                                    <div class="chat-input-row">
                                        <button type="button" class="btn btn-secondary" style="padding:0.75rem;" id="chat-attach-file-btn" title="Attach File"><i data-lucide="paperclip"></i> Attach File</button>
                                        <input class="form-input" id="chat-input-message-text" type="text" placeholder="Type message..." required style="flex-grow:1;">
                                        <button type="submit" class="btn btn-primary" id="chat-send-btn"><i data-lucide="send"></i> Send Message</button>
                                    </div>
                                </form>
                            </div>
                        `;
                    })()}
                </main>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Scroll to bottom of message panel
        const scrollArea = document.getElementById('chat-messages-scroll-area');
        if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
        }

        // Bind composer handlers
        if (activeChat) {
            const partnerId = activeChat.user1 === currentUser.id ? activeChat.user2 : activeChat.user1;
            const partner = await DbState.getUserById(partnerId);
            const form = document.getElementById('chat-message-send-form');
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const textInput = document.getElementById('chat-input-message-text');
                const text = textInput.value.trim();
                if (!text) return;
                
                const res = await DbState.sendMessage(partnerId, text);
                if (res.success) {
                    textInput.value = '';
                    await this.renderChat(activeChatId);
                } else {
                    this.showToast(res.error, 'error');
                }
            });

            document.getElementById('chat-attach-file-btn').addEventListener('click', async () => {
                const attachFileMock = 'lesson_syllabus_outline.pdf';
                const res = await DbState.sendMessage(partnerId, '[Shared a document attachment]', attachFileMock);
                if (res.success) {
                    this.showToast('Document attached and uploaded successfully!', 'success');
                    await this.renderChat(activeChatId);
                }
            });

            document.getElementById('chat-video-call-btn').addEventListener('click', async () => {
                const swaps = await DbState.getSwapRequests();
                const matchedSwap = swaps.find(sw => 
                    ((sw.sender_id === currentUser.id && sw.receiver_id === partnerId) || 
                     (sw.sender_id === partnerId && sw.receiver_id === currentUser.id)) && 
                     (sw.status === 'booked' || sw.status === 'accepted')
                );
                
                if (matchedSwap) {
                    this.launchVideoCallMockup(matchedSwap.id);
                } else {
                    this.showToast('You must establish an active booked Swap proposal before opening video calls.', 'warning');
                }
            });

            document.getElementById('chat-schedule-btn').addEventListener('click', async () => {
                const swaps = await DbState.getSwapRequests();
                const matchedSwap = swaps.find(sw => 
                    ((sw.sender_id === currentUser.id && sw.receiver_id === partnerId) || 
                     (sw.sender_id === partnerId && sw.receiver_id === currentUser.id)) && 
                     (sw.status === 'accepted' || sw.status === 'pending')
                );
                
                if (matchedSwap) {
                    const modalHtml = `
                        <h3 style="margin-bottom:1.5rem;"><i data-lucide="calendar"></i> Schedule Swap Session</h3>
                        <form id="chat-schedule-form">
                            <div class="form-group">
                                <label class="form-label" for="chat-meeting-time">Select Date & Time</label>
                                <input class="form-input" id="chat-meeting-time" type="datetime-local" required>
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2rem;">
                                <button type="button" class="btn btn-secondary" onclick="Views.closeModal()">Cancel</button>
                                <button type="submit" class="btn btn-primary" id="chat-schedule-submit-btn">Schedule Meeting</button>
                            </div>
                        </form>
                    `;
                    this.openModal(modalHtml, (modalEl) => {
                        modalEl.querySelector('#chat-schedule-form').addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const val = modalEl.querySelector('#chat-meeting-time').value;
                            await DbState.bookSwapSession(matchedSwap.id, val);
                            this.closeModal();
                            this.showToast('Session scheduled! Conversation update sent.', 'success');
                            await DbState.sendMessage(partnerId, `[Meeting Session Scheduled for: ${new Date(val).toLocaleString()}]`);
                            await this.renderChat(activeChatId);
                        });
                    });
                } else {
                    this.showToast('No active accepted swap proposals found to schedule. Propose a swap first.', 'warning');
                }
            });

            document.getElementById('chat-block-btn').addEventListener('click', async () => {
                if (confirm(`Are you sure you want to block communications with ${partner.name}?`)) {
                    await DbState.blockUser(partnerId);
                    this.showToast(`${partner.name} has been blocked.`, 'warning');
                    Router.navigate('dashboard');
                }
            });
        }
    },

    // ==========================================================================
    // 8. REVIEWS & RATINGS MODAL
    // ==========================================================================
    async openReviewModal(partnerId) {
        const partner = await DbState.getUserById(partnerId);
        if (!partner) return;

        const modalHtml = `
            <div style="text-align:center;">
                <h3 style="margin-bottom:0.5rem;"><i data-lucide="star" style="color:var(--color-warning); fill:var(--color-warning); display:inline;"></i> Submit Feedback & Rating</h3>
                <p class="text-muted">Rate your swap session with ${partner.name}</p>
                
                <form id="user-review-modal-form" style="margin-top:1.5rem;">
                    <div class="rating-stars-row">
                        <button type="button" class="rating-star-btn active" data-rating="1"><i data-lucide="star" style="width:28px;height:28px;fill:currentColor;"></i></button>
                        <button type="button" class="rating-star-btn active" data-rating="2"><i data-lucide="star" style="width:28px;height:28px;fill:currentColor;"></i></button>
                        <button type="button" class="rating-star-btn active" data-rating="3"><i data-lucide="star" style="width:28px;height:28px;fill:currentColor;"></i></button>
                        <button type="button" class="rating-star-btn active" data-rating="4"><i data-lucide="star" style="width:28px;height:28px;fill:currentColor;"></i></button>
                        <button type="button" class="rating-star-btn active" data-rating="5"><i data-lucide="star" style="width:28px;height:28px;fill:currentColor;"></i></button>
                    </div>
                    <input type="hidden" id="selected-rating-val" value="5">

                    <div class="form-group" style="margin-top:1.5rem;">
                        <label class="form-label" for="review-modal-comment" style="text-align:left;">Write Review Details</label>
                        <textarea class="form-textarea" id="review-modal-comment" placeholder="What topics did you cover? Did they teach structured content?" required style="min-height:100px;"></textarea>
                    </div>
                    
                    <div style="display:flex; justify-content:space-around; align-items:center; margin-top:2rem;">
                        <button type="button" class="btn btn-secondary" id="review-modal-report-btn" style="color:var(--color-danger); border-color:rgba(239,68,68,0.3);"><i data-lucide="flag"></i> Report User</button>
                        <div style="display:flex; gap:0.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="Views.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="review-modal-submit-btn"><i data-lucide="check"></i> Submit Feedback</button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        this.openModal(modalHtml, (modalEl) => {
            const starBtns = modalEl.querySelectorAll('.rating-star-btn');
            const ratingInput = modalEl.querySelector('#selected-rating-val');
            
            starBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const rating = parseInt(btn.getAttribute('data-rating'));
                    ratingInput.value = rating;
                    
                    starBtns.forEach(b => {
                        const bVal = parseInt(b.getAttribute('data-rating'));
                        if (bVal <= rating) {
                            b.classList.add('active');
                        } else {
                            b.classList.remove('active');
                        }
                    });
                });
            });

            // Submission Listeners
            modalEl.querySelector('#user-review-modal-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const rating = ratingInput.value;
                const comment = modalEl.querySelector('#review-modal-comment').value;
                
                await DbState.submitReview(partnerId, rating, comment);
                this.closeModal();
                this.showToast('Your rating feedback was submitted successfully. Thank you!', 'success');
                if (Router.getRoute() === 'dashboard') {
                    await this.renderDashboard('sessions');
                }
            });

            modalEl.querySelector('#review-modal-report-btn').addEventListener('click', async () => {
                const reportReason = prompt(`Explain why you wish to report ${partner.name}:`);
                if (reportReason && reportReason.trim()) {
                    await DbState.createReport(partnerId, reportReason.trim());
                    this.closeModal();
                    this.showToast('User reported. System moderators will review the incident.', 'warning');
                }
            });
        });
    },

    // ==========================================================================
    // 9. ADMIN PANEL PAGE
    // ==========================================================================
    async renderAdmin() {
        this.renderPageLoader();
        
        const currentUser = await DbState.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            Router.navigate('auth');
            this.showToast('Unauthorized. Admin credential required.', 'error');
            return;
        }

        const users = await DbState.getAllUsers();
        const reports = await DbState.getReports();
        const swaps = await DbState.getSwapRequests();

        // Load reporter/reported info asynchronously
        const reportItems = await Promise.all(reports.map(async (r) => {
            const reporter = await DbState.getUserById(r.reporter_id);
            const reported = await DbState.getUserById(r.reported_user_id);
            return { r, reporter, reported };
        }));

        const markup = `
            <div class="dashboard-container" style="grid-template-columns:1fr; max-width:1100px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--card-border); padding-bottom:1rem; margin-bottom:2rem;">
                    <h2>Administration Control Panel</h2>
                    <button class="btn btn-secondary" id="admin-generate-report-btn"><i data-lucide="download"></i> Generate Report</button>
                </div>

                <!-- Stats counters -->
                <div class="stats-bar" style="margin-bottom:2rem;">
                    <div class="glass-card stat-card">
                        <div class="stat-value">${users.length}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${swaps.length}</div>
                        <div class="stat-label">Total Skill Swaps</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${reports.filter(r => r.status === 'pending').length}</div>
                        <div class="stat-label">Unresolved Reports</div>
                    </div>
                    <div class="glass-card stat-card">
                        <div class="stat-value">${users.filter(u => !u.approved).length}</div>
                        <div class="stat-label">Pending Approvals</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr; gap:2.5rem;">
                    <!-- User Management approvals -->
                    <div class="glass-card">
                        <h3 style="margin-bottom:1.5rem;"><i data-lucide="users" style="display:inline; width:18px; height:18px;"></i> User Directory & Account Approvals</h3>
                        <div class="admin-table-container">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role Type</th>
                                        <th>Status Approval</th>
                                        <th>Suspended Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.map(u => `
                                        <tr>
                                            <td><strong>${u.name}</strong></td>
                                            <td>${u.email}</td>
                                            <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}">${u.role.toUpperCase()}</span></td>
                                            <td>
                                                <label class="switch-container">
                                                    <input type="checkbox" class="switch-input" ${u.approved ? 'checked' : ''} onchange="window.appActions.adminToggleApproval('${u.id}', this.checked)">
                                                    <div class="switch-track"><div class="switch-thumb"></div></div>
                                                    <span>${u.approved ? 'Approved' : 'Pending'}</span>
                                                </label>
                                            </td>
                                            <td>
                                                <label class="switch-container">
                                                    <input type="checkbox" class="switch-input" ${u.suspended ? 'checked' : ''} onchange="window.appActions.adminToggleSuspension('${u.id}', this.checked)">
                                                    <div class="switch-track" style="border-color:${u.suspended ? 'var(--color-danger)' : ''};"><div class="switch-thumb" style="background:${u.suspended ? 'var(--color-danger)' : ''};"></div></div>
                                                    <span style="color:${u.suspended ? 'var(--color-danger)' : ''}; font-weight:${u.suspended ? '600' : ''};">${u.suspended ? 'Suspended' : 'Active'}</span>
                                                </label>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Moderation reports -->
                    <div class="glass-card">
                        <div class="dashboard-card-header">
                            <h3><i data-lucide="shield-alert" style="display:inline; width:18px; height:18px;"></i> View Reports</h3>
                            <button class="footer-btn-link" onclick="window.appActions.adminManageSkills()">Manage Skills Category Tags</button>
                        </div>
                        <div class="list-items">
                            ${reportItems.length === 0 ? '<p class="text-muted">No system abuse reports filed.</p>' : 
                              reportItems.map(item => `
                                    <div class="list-item" style="border-left:4px solid var(--color-danger);">
                                        <div class="list-item-details">
                                            <h5>Reported: ${item.reported ? item.reported.name : 'Unknown User'}</h5>
                                            <p>Reason: "${item.r.reason}" &bull; Filed By: ${item.reporter ? item.reporter.name : 'User'}</p>
                                        </div>
                                        <div class="list-item-actions">
                                            <button class="btn btn-secondary" onclick="window.appActions.adminResolveReport('${item.r.id}')"><i data-lucide="check"></i> Dismiss Report</button>
                                            <button class="btn btn-danger" onclick="window.appActions.adminSuspendUser('${item.reported ? item.reported.id : ''}')"><i data-lucide="user-minus"></i> Suspend Account</button>
                                        </div>
                                    </div>
                                  `).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        viewContainer.innerHTML = markup;
        lucide.createIcons();

        // Bind generating report
        document.getElementById('admin-generate-report-btn').addEventListener('click', () => {
            this.showToast('Platform transaction audit report compiled and downloaded to dashboard (Simulation)!', 'success');
        });
    }
};

// Expose Action callback listeners globally for dynamic rendering templates
window.appActions = {
    async proposeSwap(skillId) {
        const user = await DbState.getCurrentUser();
        if (!user) {
            Router.navigate('auth');
            Views.showToast('Please login first to submit swap request proposals.', 'warning');
            return;
        }

        const skill = await DbState.getSkillById(skillId);
        const owner = await DbState.getUserById(skill.owner_id);

        const allSkills = await DbState.getSkills();
        const mySkills = allSkills.filter(s => s.owner_id === user.id);

        if (mySkills.length === 0) {
            Views.showToast('You must add a skill listing first to swap with this mentor.', 'warning');
            Router.navigate('list-skill');
            return;
        }

        const modalHtml = `
            <h3><i data-lucide="refresh-cw"></i> Swap Skills Proposal</h3>
            <p class="text-muted" style="margin-bottom:1.5rem;">Offer one of your listed skills to <strong>${owner.name}</strong> in exchange for <strong>${skill.title}</strong>.</p>
            
            <form id="swap-proposal-modal-form">
                <div class="form-group">
                    <label class="form-label" for="offer-skill-select">Select Your Offered Skill</label>
                    <select class="form-select" id="offer-skill-select">
                        ${mySkills.map(s => `<option value="${s.id}">${s.title} (${s.level})</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2.5rem;">
                    <button type="button" class="btn btn-secondary" onclick="Views.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-cta-green" id="propose-submit-btn"><i data-lucide="send"></i> Send Request</button>
                </div>
            </form>
        `;

        Views.openModal(modalHtml, (modalEl) => {
            modalEl.querySelector('#swap-proposal-modal-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const offeredSkillId = modalEl.querySelector('#offer-skill-select').value;
                const res = await DbState.createSwapRequest(skill.owner_id, offeredSkillId, skillId);
                if (res.success) {
                    Views.closeModal();
                    Views.showToast('Swap request sent to mentor. Check requests tab for changes!', 'success');
                    Router.navigate('dashboard');
                } else {
                    Views.showToast(res.error, 'error');
                }
            });
        });
    },

    async viewSkillDetails(skillId) {
        const skill = await DbState.getSkillById(skillId);
        const owner = await DbState.getUserById(skill.owner_id);
        const currentUser = await DbState.getCurrentUser();
        const isMine = currentUser && currentUser.id === skill.owner_id;

        const modalHtml = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span class="badge badge-primary">${skill.category}</span>
                    <span class="badge badge-success">${skill.level}</span>
                </div>
                <h3 style="margin-bottom:1rem;">${skill.title}</h3>
                
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem; background:var(--badge-bg); padding:0.75rem; border-radius:var(--radius-md);">
                    <div class="skill-owner-avatar">${owner ? owner.avatar : 'U'}</div>
                    <div>
                        <strong style="font-size:0.9rem;">${owner ? owner.name : 'Unknown User'}</strong>
                        <div style="font-size:0.75rem; color:var(--text-secondary);">User Rating: <i data-lucide="star" style="width:10px;height:10px;fill:var(--color-warning);color:var(--color-warning);display:inline;"></i> ${skill.rating}</div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description & Syllabus</label>
                    <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.5;">${skill.description}</p>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2.5rem; border-top:1px solid var(--card-border); padding-top:1.5rem;">
                    <button class="btn btn-secondary" onclick="Views.closeModal()">Close</button>
                    ${isMine ? '' : `
                        <button class="btn btn-primary btn-cta-green" onclick="Views.closeModal(); window.appActions.proposeSwap('${skill.id}')"><i data-lucide="refresh-cw"></i> Propose Swap</button>
                    `}
                </div>
            </div>
        `;
        Views.openModal(modalHtml);
    },

    saveSkill(skillId) {
        Views.showToast('Skill saved to bookmarks list!', 'success');
    },

    shareSkill(skillId) {
        Views.showToast('Copied skill sharing link to clipboard.', 'success');
    },

    viewSwap(swapId) {
        Views.closeModal();
        Router.navigate(`swap?id=${swapId}`);
    },

    async acceptSwap(swapId) {
        await DbState.updateSwapRequestStatus(swapId, 'accepted');
        Views.showToast('Swap request proposal accepted successfully.', 'success');
        if (Router.getRoute() === 'dashboard') {
            await Views.renderDashboard('requests');
        } else {
            Router.navigate('dashboard');
        }
    },

    async rejectSwap(swapId) {
        if (confirm('Decline this swap request proposal?')) {
            await DbState.updateSwapRequestStatus(swapId, 'rejected');
            Views.showToast('Swap request proposal declined.', 'info');
            if (Router.getRoute() === 'dashboard') {
                await Views.renderDashboard('requests');
            } else {
                Router.navigate('dashboard');
            }
        }
    },

    async cancelSwap(swapId) {
        if (confirm('Cancel this swap request proposal?')) {
            await DbState.updateSwapRequestStatus(swapId, 'rejected');
            Views.showToast('Swap proposal has been cancelled.', 'info');
            if (Router.getRoute() === 'dashboard') {
                await Views.renderDashboard('overview');
            } else {
                Router.navigate('dashboard');
            }
        }
    },

    editSkill(skillId) {
        Router.navigate(`list-skill?id=${skillId}`);
    },

    async deleteSkill(skillId) {
        if (confirm('Delete this skill listing?')) {
            const res = await DbState.deleteSkill(skillId);
            if (res.success) {
                Views.showToast('Skill listing deleted.', 'info');
                await Views.renderDashboard('overview');
            } else {
                Views.showToast(res.error, 'error');
            }
        }
    },

    joinSession(swapId) {
        Views.launchVideoCallMockup(swapId);
    },

    openChat(chatId) {
        Views.renderChat(chatId);
    },

    openReviewModal(userId) {
        Views.openReviewModal(userId);
    },

    // Admin table togglers
    async adminToggleApproval(userId, stateValue) {
        const res = await DbState.approveUser(userId, stateValue);
        if (res.success) {
            Views.showToast(stateValue ? 'User account approved.' : 'User account pending approval state.', 'success');
            await Views.renderAdmin();
        }
    },

    async adminToggleSuspension(userId, stateValue) {
        const res = await DbState.suspendAccount(userId, stateValue);
        if (res.success) {
            Views.showToast(stateValue ? 'User account suspended.' : 'User account suspension lifted.', 'warning');
            await Views.renderAdmin();
        }
    },

    adminResolveReport(reportId) {
        Views.showToast('Report dismissed. No violation recorded.', 'info');
    },

    async adminSuspendUser(userId) {
        if (userId) {
            await DbState.suspendAccount(userId, true);
            Views.showToast('Report handled. User has been suspended.', 'warning');
            await Views.renderAdmin();
        }
    },

    adminManageSkills() {
        const modalHtml = `
            <h3><i data-lucide="tag"></i> Manage Skill Categories</h3>
            <p class="text-muted" style="margin-bottom:1.5rem;">Configure the primary platform browse directories.</p>
            <div class="list-items" style="max-height:200px; overflow-y:auto; margin-bottom:1.5rem;">
                <div class="list-item"><span>Technology / Coding</span><button class="footer-btn-link" style="color:var(--color-danger);">Delete</button></div>
                <div class="list-item"><span>Music & Arts</span><button class="footer-btn-link" style="color:var(--color-danger);">Delete</button></div>
                <div class="list-item"><span>Languages & Translation</span><button class="footer-btn-link" style="color:var(--color-danger);">Delete</button></div>
                <div class="list-item"><span>Design / UX UI</span><button class="footer-btn-link" style="color:var(--color-danger);">Delete</button></div>
            </div>
            <form id="admin-add-cat-form" style="display:flex; gap:0.5rem;">
                <input class="form-input" placeholder="New Category Tag Name..." required>
                <button type="submit" class="btn btn-primary"><i data-lucide="plus"></i> Add Tag</button>
            </form>
            <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
                <button class="btn btn-secondary" onclick="Views.closeModal()">Close</button>
            </div>
        `;
        Views.openModal(modalHtml, (modalEl) => {
            modalEl.querySelector('#admin-add-cat-form').addEventListener('submit', (e) => {
                e.preventDefault();
                Views.showToast('Category created!', 'success');
                Views.closeModal();
            });
        });
    }
};

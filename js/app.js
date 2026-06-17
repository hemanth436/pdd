/* Asynchronous Application Bootstrap and Global Event Wireup */

import { DbState, supabase } from './state.js';
import { Router } from './router.js';
import { Views } from './views.js';

// Initialize Theme Selection
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    toggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (!icon) return;
    if (theme === 'dark') {
        icon.setAttribute('data-lucide', 'sun');
    } else {
        icon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

// Coordinate dynamic navigation tabs updates based on Auth state
async function initNavigation() {
    const navMenu = document.getElementById('nav-menu');
    const navActions = document.getElementById('nav-actions');
    const user = await DbState.getCurrentUser();

    if (user) {
        // Logged in layout
        let links = `
            <a href="#home" class="nav-link" data-page="home"><i data-lucide="home"></i> Home</a>
            <a href="#explore" class="nav-link" data-page="explore"><i data-lucide="search"></i> Explore Skills</a>
            <a href="#dashboard" class="nav-link" data-page="dashboard"><i data-lucide="layout-dashboard"></i> Dashboard</a>
            <a href="#chat" class="nav-link" data-page="chat"><i data-lucide="message-square"></i> Chat</a>
        `;
        if (user.role === 'admin') {
            links += `<a href="#admin" class="nav-link" data-page="admin"><i data-lucide="shield"></i> Admin Panel</a>`;
        }
        navMenu.innerHTML = links;

        navActions.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="skill-owner-avatar" style="cursor:pointer;" onclick="Router.navigate('dashboard')">${user.avatar}</div>
                <button class="btn btn-secondary" id="nav-logout-btn" style="padding:0.4rem 0.8rem; font-size:0.85rem;"><i data-lucide="log-out"></i> Logout</button>
            </div>
        `;
        
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await DbState.logout();
                Views.showToast('Logged out successfully.', 'info');
                window.dispatchEvent(new Event('authChange'));
                Router.navigate('home');
            });
        }
    } else {
        // Logged out layout
        navMenu.innerHTML = `
            <a href="#home" class="nav-link" data-page="home"><i data-lucide="home"></i> Home</a>
            <a href="#explore" class="nav-link" data-page="explore"><i data-lucide="search"></i> Explore Skills</a>
        `;
        navActions.innerHTML = `
            <button class="btn btn-secondary" id="nav-login-btn"><i data-lucide="log-in"></i> Login</button>
            <button class="btn btn-primary" id="nav-signup-btn"><i data-lucide="user-plus"></i> Join Now</button>
        `;

        document.getElementById('nav-login-btn').addEventListener('click', () => {
            Router.navigate('auth');
            setTimeout(() => {
                const tabBtn = document.getElementById('tab-login-btn');
                if (tabBtn) tabBtn.click();
            }, 50);
        });

        document.getElementById('nav-signup-btn').addEventListener('click', () => {
            Router.navigate('auth');
            setTimeout(() => {
                const tabBtn = document.getElementById('tab-signup-btn');
                if (tabBtn) tabBtn.click();
            }, 50);
        });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Close menu when clicking nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const icon = mobileToggle?.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    });

    lucide.createIcons();
}

// Bind footer buttons that open overlay modals
function initFooterButtons() {
    const aboutBtn = document.getElementById('footer-about-btn');
    const helpBtn = document.getElementById('footer-help-btn');
    const faqBtn = document.getElementById('footer-faq-btn');
    const privacyBtn = document.getElementById('footer-privacy-btn');
    const termsBtn = document.getElementById('footer-terms-btn');

    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            Views.openModal(`
                <h3>About SkillSwap Exchange</h3>
                <p style="margin-top:1rem; line-height:1.6; color:var(--text-secondary);">
                    SkillSwap Exchange is a modern peer-to-peer knowledge sharing application built to connect students, teachers, creators, and professionals. 
                    We believe education and skill acquisition should be accessible to everyone. Our platform removes the financial barrier by substituting transactions with mutual knowledge swaps.
                </p>
                <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
                    <button class="btn btn-primary" onclick="Views.closeModal()">Close</button>
                </div>
            `);
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            Views.openModal(`
                <h3>Help Center</h3>
                <p style="margin-top:1rem; color:var(--text-secondary);">Welcome to our user support center. Here are quick answers to troubleshoot issues:</p>
                <ul style="margin:1rem 0 1.5rem 1.5rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.5rem;">
                    <li><strong>How to propose a swap:</strong> Click 'Swap Skills' on any active card inside the Explore page.</li>
                    <li><strong>Scheduling meetings:</strong> Go to dashboard requests panel, click 'Book Session' once a user accepts.</li>
                    <li><strong>Blocking users:</strong> Access the user communication window, click the 'Block User' toggle in the header.</li>
                </ul>
                <div style="display:flex; justify-content:flex-end;">
                    <button class="btn btn-primary" onclick="Views.closeModal()">Close</button>
                </div>
            `);
        });
    }

    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            Views.openModal(`
                <h3>Frequently Asked Questions</h3>
                <div style="margin-top:1rem; display:flex; flex-direction:column; gap:1.25rem; max-height:300px; overflow-y:auto; padding-right:0.5rem;">
                    <div>
                        <strong>Q: Are swap sessions recorded?</strong>
                        <p class="text-secondary" style="font-size:0.9rem;">A: No, meetings run over real-time private channels. Your privacy is fully secured.</p>
                    </div>
                    <div>
                        <strong>Q: Can I offer multiple skills?</strong>
                        <p class="text-secondary" style="font-size:0.9rem;">A: Yes! You can add and edit as many skills as you are comfortable tutoring.</p>
                    </div>
                    <div>
                        <strong>Q: What if the swap partner does not show up?</strong>
                        <p class="text-secondary" style="font-size:0.9rem;">A: You can report user profiles directly from the session details panel.</p>
                    </div>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:2rem; border-top:1px solid var(--card-border); padding-top:1rem;">
                    <button class="btn btn-primary" onclick="Views.closeModal()">Close</button>
                </div>
            `);
        });
    }

    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            Views.openModal(`
                <h3>Privacy Policy</h3>
                <p style="margin-top:1rem; line-height:1.5; color:var(--text-secondary);">
                    Your data safety is our priority. We collect basic details (name, email, profile descriptions) solely to establish matching profiles. We do not sell user data to advertising third parties.
                </p>
                <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
                    <button class="btn btn-primary" onclick="Views.closeModal()">Close</button>
                </div>
            `);
        });
    }

    if (termsBtn) {
        termsBtn.addEventListener('click', () => {
            Views.openModal(`
                <h3>Terms & Conditions</h3>
                <p style="margin-top:1rem; line-height:1.5; color:var(--text-secondary);">
                    By using SkillSwap, you agree to treat swap partners with absolute respect. Spamming, posting malicious scripts, or conducting financial scams are strictly prohibited and result in immediate profile suspension.
                </p>
                <div style="display:flex; justify-content:flex-end; margin-top:2rem;">
                    <button class="btn btn-primary" onclick="Views.closeModal()">Close</button>
                </div>
            `);
        });
    }
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Bootstrap router mapping
    Router
        .add('home', () => Views.renderLanding())
        .add('explore', (params) => Views.renderExplore(params))
        .add('auth', () => Views.renderAuth())
        .add('dashboard', () => Views.renderDashboard())
        .add('swap', (params) => Views.renderSwapDetails(params.id))
        .add('list-skill', (params) => Views.renderSkillListing(params ? params.id : null))
        .add('chat', (params) => Views.renderChat(params ? params.id : null))
        .add('admin', () => Views.renderAdmin());

    // Init theme and headers
    initTheme();
    await initNavigation();
    initFooterButtons();

    // Hook session change listener
    window.addEventListener('authChange', async () => {
        await initNavigation();
    });

    // Listen to real Supabase auth state change triggers
    supabase.auth.onAuthStateChange(async (event, session) => {
        window.dispatchEvent(new Event('authChange'));
    });

    // Start router
    Router.init('home');
});

/* Simple Hash-Based Client-Side Router */

class ClientRouter {
    constructor() {
        this.routes = {};
        this.defaultRoute = 'home';
        this.currentRoute = null;
    }

    add(path, callback) {
        this.routes[path] = callback;
        return this;
    }

    init(defaultRoute = 'home') {
        this.defaultRoute = defaultRoute;
        
        window.addEventListener('hashchange', () => this.handleRoute());
        // Handle initial load
        this.handleRoute();
    }

    navigate(hash) {
        window.location.hash = hash;
    }

    handleRoute() {
        let hash = window.location.hash.substring(1) || this.defaultRoute;
        
        // Parse params if any (e.g., #swap?id=123)
        let params = {};
        if (hash.includes('?')) {
            const parts = hash.split('?');
            hash = parts[0];
            const query = parts[1];
            const queryParams = new URLSearchParams(query);
            for (const [key, value] of queryParams) {
                params[key] = value;
            }
        }

        this.currentRoute = hash;

        // Trigger dynamic view highlight in global header/nav
        this.updateNavLinks(hash);

        // Execute route callback
        const callback = this.routes[hash];
        if (callback) {
            callback(params);
        } else {
            // Fallback to home if route not found
            console.warn(`Route not found: #${hash}. Redirecting to home.`);
            this.navigate(this.defaultRoute);
        }
    }

    updateNavLinks(activeHash) {
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            const dataPage = link.getAttribute('data-page');
            if (activeHash === dataPage || (activeHash === 'home' && dataPage === 'home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    getRoute() {
        return this.currentRoute;
    }
}

export const Router = new ClientRouter();

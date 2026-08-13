// index.js
import { $ } from './lib/lib.js'
import { Error as ErrorPage } from "./error.js";
import { DocumentViewer } from "./component/otherComponent/Document.js";
import { Retrieval } from "./AccountRetrival/retrival.js";

const componentCache = new Map();

const lazyLoad = async (componentPath, componentName) => {
    const cacheKey = `${componentPath}:${componentName}`;

    if (componentCache.has(cacheKey)) {
        return componentCache.get(cacheKey);
    }

    try {
        const module = await import(componentPath);
        const component = module[componentName] || module.default;
        componentCache.set(cacheKey, component);
        return component;
    } catch (error) {
        console.error(`Failed to load ${componentName} from ${componentPath}:`, error);
        return ErrorPage;
    }
};

const LazyLogin = async () => {
    const LoginPage = await lazyLoad('/client/component/login.js', 'LoginPage');
    return LoginPage;
};

const LazyAdmin = async () => {
    const AdminPanel = await lazyLoad('/client/component/admin.js', 'AdminPanel');
    return AdminPanel;
};

const LazyUser = async () => {
    const UserPanel = await lazyLoad('/client/component/user.js', 'UserPanel');
    return UserPanel;
};

const LazyExtensionChair = async () => {
    const ExtensionUserPanel = await lazyLoad('/client/component/extensionUser.js', 'ExtensionUserPanel');
    return ExtensionUserPanel;
};

const LazyEvaluator = async () => {
    const Evaluator = await lazyLoad('/client/component/evaluator.js', 'Evaluator');
    return Evaluator;
};

const LazyRdeOffice = async () => {
    const RdeOffice = await lazyLoad('/client/component/rdeStaff/script/rde.js', 'RdeOffice');
    return RdeOffice;
};

const LazyScanner = async () => {
    const Scanner = await lazyLoad('/client/component/scanner.js', 'Scanner');
    return Scanner;
};

const renderWithLoading = async (componentLoader, container) => {
    const loadingEl = $({
        tag: 'div',
        style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#6c757d',
            fontSize: '18px'
        },
        child: [
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-spinner fa-spin' },
                style: { marginRight: '12px', fontSize: '24px', color: '#0d6efd' }
            }),
            $({
                tag: 'span',
                text: 'Loading...'
            })
        ]
    });

    container.appendChild(loadingEl);

    try {
        const Component = await componentLoader();
        loadingEl.remove();
        const instance = Component();
        container.appendChild(instance);
        return instance;
    } catch (error) {
        console.error('Error loading component:', error);
        loadingEl.innerHTML = `
            <div style="color: #dc3545; text-align: center;">
                <span class="fa-solid fa-circle-exclamation" style="font-size: 32px; display: block; margin-bottom: 12px;"></span>
                <div style="font-size: 20px; font-weight: 500;">Failed to load page</div>
                <div style="font-size: 14px; margin-top: 8px;">${error.message || 'Please try again'}</div>
            </div>
        `;
        return null;
    }
};

const routes = {
    public: {
        '/account/Login': { loader: LazyLogin },
        '/account/Signup': { loader: LazyLogin },
        '/accountSupport': { component: Retrieval },
        '/view': { component: DocumentViewer }
    },
    protected: {
        '/admin': { loader: LazyAdmin },
        '/user': { loader: LazyUser },
        '/research-chair': { loader: LazyUser },
        '/extension-chair': { loader: LazyExtensionChair },
        '/evaluator': { loader: LazyEvaluator },
        '/rdeOffice': { loader: LazyRdeOffice },
        '/researcher': { loader: LazyEvaluator },
        '/external': { loader: LazyRdeOffice }
    }
};

async function checkAndProtectSession() {
    try {
        const response = await fetch('/sessionCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'sessionChecker=1'
        });

        const data = await response.json();

        if (data.status === true || data.redirect === true) {
            console.log('Session invalid, redirecting to login...');
            window.location.href = '/account/Login';
            return false;
        }

        const userResponse = await fetch('/sessionCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'getUserName=1'
        });

        const userData = await userResponse.json();

        if (userData.redirect === true || userData.username === 'UNKNOWN' || userData.username === '') {
            console.log('UNKNOWN username detected, redirecting to login...');
            window.location.href = '/account/Login';
            return false;
        }

        return true;

    } catch (error) {
        console.error('Session protection error:', error);
        window.location.href = '/account/Login';
        return false;
    }
}

// Mobile detection removed for cleaner code

window.addEventListener('DOMContentLoaded', async () => {
    const urlPath = window.location.href.replace(window.location.origin, '');
    const root = document.getElementById('root');

    const publicRoute = Object.entries(routes.public).find(([path]) => urlPath.startsWith(path));

    if (publicRoute) {
        const [path, route] = publicRoute;

        if (route.loader) {
            await renderWithLoading(route.loader, root);
        } else if (route.component) {
            root.appendChild(route.component());
        }
        return;
    }

    const protectedRoute = Object.entries(routes.protected).find(([path]) => urlPath.startsWith(path));

    if (!protectedRoute) {
        root.appendChild(ErrorPage());
        return;
    }

    const isSessionValid = await checkAndProtectSession();

    if (!isSessionValid) {
        return;
    }

    const [, route] = protectedRoute;
    await renderWithLoading(route.loader, root);
});

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        console.log('Hot module reloaded');
        componentCache.clear();
        const urlPath = window.location.href.replace(window.location.origin, '');
        const root = document.getElementById('root');
        root.innerHTML = '';
        window.dispatchEvent(new Event('DOMContentLoaded'));
    });
}

export {
    lazyLoad,
    componentCache,
    renderWithLoading,
    routes
};
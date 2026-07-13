import { $ } from './lib/lib.js'
import { Error as ErrorPage } from "./error.js";
import { DocumentViewer } from "./component/otherComponent/Document.js";
import { Retrieval } from "./AccountRetrival/retrival.js";

const componentCache = new Map();

const lazyLoad = async (componentPath, componentName) => {
    const cacheKey = `${componentPath}:${componentName}`;

    // Check if component is already cached
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

const LazyResearchChair = async () => {
    const ResearchChairPanel = await lazyLoad('/client/component/researchChair.js', 'ResearchChairPanel');
    return ResearchChairPanel;
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

// ========== RENDER FUNCTION WITH LOADING STATE ==========
const renderWithLoading = async (componentLoader, container) => {
    // Show loading indicator
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

        // Remove loading indicator
        loadingEl.remove();

        // Render the component
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
        '/account/Login': { loader: LazyLogin, renderParticles: true },
        '/account/Signup': { loader: LazyLogin, renderParticles: true },
        '/accountSupport': { component: Retrieval },
        '/view': { component: DocumentViewer }
    },
    protected: {
        '/admin': { loader: LazyAdmin },
        '/user': { loader: LazyUser },
        '/research-chair': { loader: LazyResearchChair },
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

const renderParticles = () => {
    document.body.appendChild($({
        tag: 'div',
        att: { id: 'particles-js' },
        style: {
            height: '99%',
            width: '100%',
            position: 'absolute',
            zIndex: '-1',
        }
    }));
    document.body.appendChild($({
        tag: 'script',
        att: { src: '/particle/particles.js' }
    }));
    setTimeout(() => {
        document.body.appendChild($({
            tag: 'script',
            att: { src: '/particle/app.js' }
        }));
    }, 100);
};


(function (a, b) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
        document.body.innerHTML = ''
        alert("The system currently unavailable for mobile devices...")
    }
})(navigator.userAgent || navigator.vendor || window.opera, 'http://detectmobilebrowser.com/mobile');


window.addEventListener('DOMContentLoaded', async () => {
    const urlPath = window.location.href.replace(window.location.origin, '');
    const root = document.getElementById('root');

    // Handle Login and Signup pages with particles
    if (urlPath.startsWith('/account/Login') || urlPath.startsWith('/account/Signup')) {
        renderParticles();
    }

    const publicRoute = Object.entries(routes.public).find(([path]) => urlPath.startsWith(path));

    if (publicRoute) {
        const [path, route] = publicRoute;

        // Render public route
        if (route.loader) {
            await renderWithLoading(route.loader, root);
        } else if (route.component) {
            root.appendChild(route.component());
        }
        return;
    }

    const protectedRoute = Object.entries(routes.protected).find(([path]) => urlPath.startsWith(path));

    if (!protectedRoute) {
        // 404 - Page not found
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
        // Clear cache for reloaded modules
        componentCache.clear();
        // Reload current route
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
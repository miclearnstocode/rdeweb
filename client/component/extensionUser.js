import { $, UnderConstruction } from '../lib/lib.js';
import { NavBar } from "./extensionComponent/supportComponents/navigation.js";
import { Frame } from "./extensionComponent/supportComponents/userFrame.js";
import { Button } from "./extensionComponent/supportComponents/navigation.js";
import { Extension } from "./extensionComponent/extension.js";
import { Error } from "../error.js";
import { Header } from "./otherComponent/header.js";
import { ExtensionSettings } from "./extensionComponent/supportComponents/settings.js";
import { Create } from "./extensionComponent/supportComponents/create.js";
import { Files } from "./extensionComponent/supportComponents/Files.js";
import { ReqButton } from "./extensionComponent/supportComponents/Request.js";
import { Publication } from "./extensionComponent/supportComponents/publicationUser.js";
import { PatentUM } from "./extensionComponent/supportComponents/patentUMuser.js";
import { Utilization } from './extensionComponent/supportComponents/utilizationUser.js';

// Map of tab IDs to their components and configurations
const tabs = {
    'research-tab': {
        url: '/extension-chair/submittedDocs/submittedFiles',
        urlPattern: '/extension-chair/',
        label: 'Event/Activity Documents',
        icon: 'fa fa-calendar',
        page: Extension,
        disabled: false,
        index: 0
    },

    'proposal-tab': {
        url: '/extension-chair/create/share',
        urlPattern: '/extension-chair/create/',
        label: 'Activity Proposal',
        icon: 'fa fa-file-text',
        page: Create,
        disabled: false,
        index: 1
    },

    'communication-tab': {
        url: '/extension-chair/systemFiles',
        urlPattern: '/extension-chair/systemFiles',
        label: 'Communication',
        icon: 'fa fa-paper-plane-o',
        page: Files,
        disabled: false,
        index: 2
    },
    'settings-tab': {
        url: '/extension-chair/settings/userInfo',
        urlPattern: '/extension-chair/settings/',
        label: 'Settings',
        icon: 'fa fa-sliders',
        page: ExtensionSettings,
        disabled: false,
        index: 6
    }
}

// Order of tabs for display (using IDs)
const tabOrder = ['research-tab', 'proposal-tab', 'communication-tab', 'settings-tab'];

//Logo of CAPSU
export const ExtensionUserPanel = () => {

    const currentPath = window.location.pathname;

    let needsRedirect = false;
    let redirectUrl = '/extension-chair/submittedDocs/submittedFiles'; // Default to research tab

    Object.entries(tabs).forEach(([tabId, tab]) => {
        if (currentPath.startsWith(tab.urlPattern) && tab.disabled) {
            console.warn(`⚠ Visiting disabled tab URL: ${tabId} (${tab.label}). Redirecting to research tab.`);
            needsRedirect = true;
        }
    });

    // Also redirect from base /user path to research tab
    if (currentPath === '/extension-chair' || currentPath === '/extension-chair/') {
        needsRedirect = true;
    }

    if (needsRedirect) {
        window.location.replace(redirectUrl);
        return null; // Return null to prevent rendering
    }

    // Determine active tab based on URL pattern matching
    let activeTabId = 'research-tab'; // Default to research tab

    // Find which tab matches the current URL (only check enabled tabs)
    Object.entries(tabs).forEach(([tabId, tab]) => {
        if (!tab.disabled && currentPath.startsWith(tab.urlPattern)) {
            activeTabId = tabId;
        }
    });

    // DOUBLE CHECK: If somehow activeTabId is a disabled tab, force it to research-tab
    if (tabs[activeTabId]?.disabled) {
        activeTabId = 'research-tab';
    }

    const Props = {
        getNav: (nav) => {
            nav.appendChild($({
                tag: 'div',
                att: {
                    className: 'modern-logo'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'logo-container'
                        },
                        child: [
                            $({
                                tag: 'img',
                                att: {
                                    src: '/client/images/cap.png',
                                    alt: 'CAPSU Logo',
                                    className: 'capsu-logo'
                                },
                                style: {
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'contain'
                                }
                            })
                        ]
                    })
                ]
            }))

            nav.appendChild(ReqButton());

            // Render tabs in the specified order
            tabOrder.forEach((tabId) => {
                const tab = tabs[tabId];
                if (!tab) return;

                // Create the button
                const button = Button({
                    icon: {
                        type: 'icon',
                        text: tab.icon,
                        class: 'tabsIcon'
                    },
                    label: {
                        type: 'label',
                        text: tab.label,
                        class: 'tabsButton'
                    },
                    eventHandler: () => {
                        if (tab.disabled) {
                            document.body.appendChild(UnderConstruction({
                                message: `${tab.label} feature is currently under construction`,
                            }));
                        } else {
                            window.location.assign(tab.url);
                        }
                    }
                });

                // Remove any existing classes
                button.className = button.className
                    .replace(/active-nav/g, '')
                    .replace(/userAnimate/g, '')
                    .replace(/disabled-tab/g, '')
                    .trim();

                // disabled class if tab is disabled
                if (tab.disabled) {
                    button.classList.add('disabled-tab');
                }

                // active class ONLY if this is the active tab AND it's not disabled
                if (tabId === activeTabId && !tab.disabled) {
                    button.classList.add('active-nav');
                }

                const buttonWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'nav-item-wrapper',
                        'data-tab-id': tabId
                    },
                    child: [button]
                });

                nav.appendChild(buttonWrapper);
            });

            const activeButtons = nav.querySelectorAll('.active-nav');
            if (activeButtons.length > 1) {
                for (let i = 1; i < activeButtons.length; i++) {
                    activeButtons[i].classList.remove('active-nav');
                }
            }
        },
        getFrame: (frame) => {
            frame.className = 'modern-frame';

            let activeTab = tabs[activeTabId];

            if (activeTab?.disabled) {
                activeTabId = 'research-tab';
                activeTab = tabs['research-tab'];
            }

            if (activeTab && !activeTab.disabled) {
                const pageWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'page-wrapper'
                    },
                    child: [activeTab.page()]
                });
                frame.appendChild(pageWrapper);
            } else {
                // Ultimate fallback
                frame.appendChild(Error());
            }
        }
    }

    // Only Header if root element exists
    const root = document.getElementById('root');
    if (root) {
        root.appendChild(Header());
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/component/userComponent/userComponentStyle/user.css',
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'modern-user-panel'
                },
                child: [
                    NavBar(Props),
                    Frame(Props)
                ]
            })
        ]
    }))
}
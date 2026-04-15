import { $, UnderConstruction } from '../lib/lib.js';
import { NavBar } from "./userComponent/script/navigation.js";
import { Frame } from "./userComponent/script/userFrame.js";
import { Button } from "./userComponent/script/navigation.js";
import { Research } from "./userComponent/script/research.js";
import { Error } from "../error.js";
import { Header } from "./otherComponent/header.js";
import { Settings } from "./userComponent/script/settings.js";
import { Create } from "./userComponent/script/create.js";
import { Files } from "./userComponent/script/Files.js";
import { ReqButton } from "./userComponent/script/Request.js";
import { Publication } from "./userComponent/script/publicationUser.js";
import { PatentUM } from "./userComponent/script/patentUMuser.js";
import { Utilization } from './userComponent/script/utilizationUser.js';
// Map of tab IDs to their components and configurations
const tabs = {
    'research-tab': {
        url: '/user/research/submittedDocs/submittedFiles',
        urlPattern: '/user/research/',
        label: 'Event/Activity Documents',
        icon: 'fa fa-calendar',
        page: Research,
        disabled: false,
        index: 0
    },

    'proposal-tab': {
        url: '/user/create/share',
        urlPattern: '/user/create/',
        label: 'Activity Proposal',
        icon: 'fa fa-file-text',
        page: Create,
        disabled: false,
        index: 1
    },

    'communication-tab': {
        url: '/user/systemFiles',
        urlPattern: '/user/systemFiles',
        label: 'Communication',
        icon: 'fa fa-paper-plane-o',
        page: Files,
        disabled: false,
        index: 2
    },
    /*'publication-tab': {
        url: '/user/publication',
        urlPattern: '/user/publication',
        label: 'Publication',
        icon: 'fa fa-book',
        page: Publication,
        disabled: false,
        index: 3
    },
    'patent-tab': {
        url: '/user/patent',
        urlPattern: '/user/patent',
        label: 'Patent',
        icon: 'fa fa-trademark',
        page: PatentUM,
        disabled: false,
        index: 4
    },
    'utilization-tab': {
        url: '/user/utilization',
        urlPattern: '/user/utilization',
        label: 'Utilization',
        icon: 'fa fa-handshake-o',
        page: Utilization,
        disabled: false,
        index: 5
    },*/
    'settings-tab': {
        url: '/user/settings/userInfo',
        urlPattern: '/user/settings/',
        label: 'Settings',
        icon: 'fa fa-sliders',
        page: Settings,
        disabled: false,
        index: 6
    }
}

// Order of tabs for display (using IDs)
const tabOrder = ['research-tab', 'proposal-tab', 'communication-tab',/* 'publication-tab', 'patent-tab', 'utilization-tab',*/ 'settings-tab'];

//Logo of RDE
export const UserPanel = () => {

    const currentPath = window.location.pathname;

    let needsRedirect = false;
    let redirectUrl = '/user/research/submittedDocs/submittedFiles'; // Default to research tab

    Object.entries(tabs).forEach(([tabId, tab]) => {
        if (currentPath.startsWith(tab.urlPattern) && tab.disabled) {
            console.warn(`⚠ Visiting disabled tab URL: ${tabId} (${tab.label}). Redirecting to research tab.`);
            needsRedirect = true;
        }
    });

    // Also redirect from base /user path to research tab
    if (currentPath === '/user' || currentPath === '/user/') {
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
        const matches = !tab.disabled && currentPath.startsWith(tab.urlPattern);

        if (!tab.disabled && currentPath.startsWith(tab.urlPattern)) {
            activeTabId = tabId;
            //console.log(`✓ Setting active tab to: ${tabId} (${tab.label})`);
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
                                tag: 'span',
                                att: {
                                    className: 'logo-r'
                                },
                                text: 'R'
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    className: 'logo-d'
                                },
                                text: 'D'
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    className: 'logo-e'
                                },
                                text: 'E'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'logo-text'
                        },
                        text: 'Research Development and Extension'
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

                // CRITICAL: Force remove any existing active classes
                button.className = button.className
                    .replace(/userAnimate/g, '')
                    .replace(/disabled-tab/g, '')
                    .trim();

                // Add disabled class if tab is disabled
                if (tab.disabled) {
                    button.className += ' disabled-tab';
                }

                // Add active class ONLY if this is the active tab AND it's not disabled
                if (tabId === activeTabId && !tab.disabled) {
                    button.className += ' userAnimate';
                } else {
                    // not active
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
        },
        getFrame: (frame) => {
            frame.className = 'modern-frame';

            // Get the active tab by ID - ensure it's not disabled
            let activeTab = tabs[activeTabId];

            // If active tab is disabled, force to research tab
            if (activeTab?.disabled) {
                activeTabId = 'research-tab';
                activeTab = tabs['research-tab'];
            }

            //console.log('Rendering frame for tab:', activeTabId, activeTab?.label);

            if (activeTab && !activeTab.disabled) {
                const pageWrapper = $({
                    tag: 'div',
                    att: {
                        className: 'page-wrapper'
                    },
                    child: [activeTab.page()]
                });
                frame.appendChild(pageWrapper);
                //console.log(`✅ Rendered page for: ${activeTab.label}`);
            } else {
                // Ultimate fallback
                //console.error('❌ No valid tab found, showing error');
                frame.appendChild(Error());
            }
        }
    }

    // Only add Header if root element exists
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
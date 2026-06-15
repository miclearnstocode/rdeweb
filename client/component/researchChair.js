import { $, UnderConstruction } from '../lib/lib.js';
import { NavBar } from "./researchChairComponent/supportComponents/researchChairNavigation.js";
import { Frame } from "./researchChairComponent/supportComponents/researchChairFrame.js";
import { Button } from "./researchChairComponent/supportComponents/researchChairNavigation.js";
import { ResearchChairSubmission } from "./researchChairComponent/researchChairSubmission.js"; 
import { Error } from "../error.js";
import { Header } from "./otherComponent/header.js";
import { ResearchChairSettings } from "./researchChairComponent/supportComponents/settings.js";

const tabs = {
    'event-documents-tab': {
        url: '/research-chair/submissions',
        urlPattern: '/research-chair/submissions',
        label: 'Event/Activity Documents',
        icon: 'fa fa-file-alt',
        page: ResearchChairSubmission,
        disabled: false,
        index: 0
    },
    'settings-tab': {
        url: '/research-chair/settings',
        urlPattern: '/research-chair/settings',
        label: 'Settings',
        icon: 'fa fa-sliders',
        page: ResearchChairSettings,
        disabled: false,
        index: 1
    }
}

// Order of tabs for display
const tabOrder = ['event-documents-tab', 'settings-tab'];

export const ResearchChairPanel = () => {

    const currentPath = window.location.pathname;

    let needsRedirect = false;
    let redirectUrl = '/research-chair/submissions';

    Object.entries(tabs).forEach(([tabId, tab]) => {
        if (currentPath.startsWith(tab.urlPattern) && tab.disabled) {
            console.warn(`⚠ Visiting disabled tab URL: ${tabId} (${tab.label}). Redirecting to event documents tab.`);
            needsRedirect = true;
        }
    });

    if (currentPath === '/research-chair' || currentPath === '/research-chair/') {
        needsRedirect = true;
    }

    if (needsRedirect) {
        window.location.replace(redirectUrl);
        return null;
    }

    let activeTabId = 'event-documents-tab';

    Object.entries(tabs).forEach(([tabId, tab]) => {
        if (!tab.disabled && currentPath.startsWith(tab.urlPattern)) {
            activeTabId = tabId;
        }
    });

    if (tabs[activeTabId]?.disabled) {
        activeTabId = 'event-documents-tab';
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

            //Research Chair specific header text
            nav.appendChild($({
                tag: 'div',
                att: {
                    className: 'research-chair-badge'
                },
                style: {
                    textAlign: 'center',
                    padding: '10px',
                    marginBottom: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                },
                child: [
                    $({
                        tag: 'h3',
                        text: 'Research Chair Panel',
                        style: {
                            color: '#000000',
                            fontSize: '16px',
                            margin: 0
                        }
                    }),
                    $({
                        tag: 'p',
                        text: 'Event & Activity Document Management',
                        style: {
                            color: '#888',
                            fontSize: '12px',
                            margin: '5px 0 0 0'
                        }
                    })
                ]
            }));

            tabOrder.forEach((tabId) => {
                const tab = tabs[tabId];
                if (!tab) return;

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

                button.className = button.className
                    .replace(/active-nav/g, '')
                    .replace(/userAnimate/g, '')
                    .replace(/disabled-tab/g, '')
                    .trim();

                if (tab.disabled) {
                    button.classList.add('disabled-tab');
                }

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
                activeTabId = 'event-documents-tab';
                activeTab = tabs['event-documents-tab'];
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
                frame.appendChild(Error());
            }
        }
    }

    const root = document.getElementById('root');
    if (root) {
        root.appendChild(Header());
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/component/researchChairComponent/studentStyle/researchChair.css',
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
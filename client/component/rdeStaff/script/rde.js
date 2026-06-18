import { $ } from "../../../lib/lib.js";
import { Header } from "../../otherComponent/header.js";
import { RdeDashboard } from "./rdeDashboard.js";

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
        console.error(`Failed to load ${componentName}:`, error);
        return null;
    }
};


const loaders = {
    Communication: () => lazyLoad('./communication.js', 'Communication'),
    ResearchMain: () => lazyLoad('./mainResearch.js', 'ResearchMain'),
    CompletedResearch: () => lazyLoad('./completedResearch.js', 'CompletedResearch'),
    ProposedResearch: () => lazyLoad('./proposedResearch.js', 'ProposedResearch'),
    Utilization: () => lazyLoad('./utilization.js', 'Utilization'),
    CertificationResearch: () => lazyLoad('./certificationResearch.js', 'CertificationResearch'),
    SummaryAccomplishment: () => lazyLoad('./summaryAccomplishment.js', 'SummaryAccomplishment'),
    QuarterlyMonitoringComponent: () => lazyLoad('./quarterlyMonitoring.js', 'QuarterlyMonitoringComponent'),
    Summary: () => lazyLoad('./researchSummary.js', 'Summary'),
    internallyFundedResearch: () => lazyLoad('./internallyFunded.js', 'internallyFundedResearch')
};


const routes = [
    {
        url: '/rdeOffice/research',
        label: 'Event/Activity',
        icon: 'fas fa-calendar-alt',
        loader: loaders.ResearchMain
    },
    {
        url: '/rdeOffice/proposedResearch',
        label: 'Proposed Research',
        icon: 'fas fa-file-alt',
        loader: loaders.ProposedResearch
    },
    {
        url: '/rdeOffice/internallyfunded',
        label: 'Internally Funded Research',
        icon: 'fas fa-university',
        loader: loaders.internallyFundedResearch
    },
    {
        url: '/rdeOffice/completedResearch',
        label: 'Completed Research',
        icon: 'fas fa-check-circle',
        loader: loaders.CompletedResearch
    },
    {
        url: '/rdeOffice/quarterlyMonitoring',
        label: 'Monitoring',
        icon: 'fas fa-chart-line',
        loader: loaders.QuarterlyMonitoringComponent
    },
    {
        url: '/rdeOffice/accomplishmentReport',
        label: 'Accomplishments',
        icon: 'fas fa-trophy',
        loader: loaders.SummaryAccomplishment
    },
    {
        url: '/rdeOffice/utilization',
        label: 'Research Utilization',
        icon: 'fas fa-handshake',
        loader: loaders.Utilization
    },
    {
        url: '/rdeOffice/summary',
        label: 'Summary',
        icon: 'fas fa-chart-bar',
        loader: loaders.Summary
    },
    {
        url: '/rdeOffice/certification',
        label: 'Certifications',
        icon: 'fas fa-certificate',
        loader: loaders.CertificationResearch
    }
];


const createLoadingIndicator = () => {
    return $({
        tag: 'div',
        style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '400px',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#6c757d'
        },
        child: [
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-spinner fa-pulse' },
                style: {
                    fontSize: '48px',
                    color: '#0d6efd',
                    marginBottom: '16px'
                }
            }),
            $({
                tag: 'div',
                text: 'Loading...',
                style: {
                    fontSize: '16px',
                    fontWeight: '500'
                }
            })
        ]
    });
};


const createErrorIndicator = (message) => {
    return $({
        tag: 'div',
        style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '400px',
            fontFamily: 'Segoe UI, sans-serif',
            color: '#dc3545',
            padding: '20px',
            textAlign: 'center'
        },
        child: [
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-circle-exclamation' },
                style: {
                    fontSize: '48px',
                    marginBottom: '16px'
                }
            }),
            $({
                tag: 'div',
                text: 'Failed to Load Component',
                style: {
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '8px'
                }
            }),
            $({
                tag: 'div',
                text: message || 'Please try refreshing the page',
                style: {
                    fontSize: '14px',
                    color: '#6c757d'
                }
            }),
            $({
                tag: 'button',
                text: 'Retry',
                style: {
                    marginTop: '20px',
                    padding: '10px 24px',
                    backgroundColor: '#0d6efd',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: () => {
                        window.location.reload();
                    }
                },
                event2: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.target.style.backgroundColor = '#0b5ed7';
                    }
                },
                event3: {
                    type: 'mouseleave',
                    method: (e) => {
                        e.target.style.backgroundColor = '#0d6efd';
                    }
                }
            })
        ]
    });
};


const button = ({ label, event, url, icon }) => {
    const getB = (b) => {
        let current = window.location.href.replace(window.location.origin, '');
        let me = current.split('/')[2];
        let urls = url.replace(window.location.origin, '');
        if (me === urls.split('/')[2]) {
            b.classList.add('activeStaffBot');
        }
    };

    return ($({
        tag: 'div',
        style: {
            padding: '14px 20px',
            margin: '6px 12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        },
        att: {
            className: 'mainButton'
        },
        event: {
            type: 'click',
            method: event
        },
        elementHandler: getB,
        child: [
            $({
                tag: 'i',
                att: {
                    className: icon || 'fas fa-folder'
                },
                style: {
                    fontSize: '18px',
                    width: '24px',
                    textAlign: 'center'
                }
            }),
            $({
                tag: 'div',
                style: {
                    flex: 1,
                    fontFamily: 'Inter, Segoe UI, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    letterSpacing: '0.3px'
                },
                text: label
            })
        ]
    }));
};

const Body = () => {
    let mainBody;
    let currentComponentInstance = null;
    let isLoading = false;
    let isInitialLoad = true; // Track initial load

    const getComponent = async (el) => {
        mainBody = el;
        let current = window.location.href.replace(window.location.origin, '');
        let me = current.split('/')[2];

        let matchedRoute = routes.find(route => {
            let url = route.url.replace(window.location.origin, '');
            return me === url.split('/')[2];
        });

        el.innerHTML = '';

        if (!matchedRoute) {
            try {
                const DashboardComponent = RdeDashboard();
                if (DashboardComponent instanceof Node) {
                    el.appendChild(DashboardComponent);
                }
            } catch (error) {
                console.error('Failed to load dashboard:', error);
                el.appendChild(createErrorIndicator('Dashboard failed to load'));
            }
            return;
        }

        // Only show loading indicator if NOT the initial load
        // Because index.js already shows a loading indicator
        if (!isInitialLoad) {
            el.appendChild(createLoadingIndicator());
        }

        try {
            const Component = await matchedRoute.loader();
            
            if (!Component) {
                throw new Error(`Failed to load ${matchedRoute.label}`);
            }

            el.innerHTML = '';

            const componentInstance = Component();
            if (componentInstance instanceof Node) {
                el.appendChild(componentInstance);
                currentComponentInstance = componentInstance;
            } else {
                throw new Error(`Component ${matchedRoute.label} did not return a valid DOM Node`);
            }

        } catch (error) {
            console.error(`Error loading ${matchedRoute.label}:`, error);
            el.innerHTML = '';
            el.appendChild(createErrorIndicator(error.message || 'Failed to load component'));
        } finally {
            isInitialLoad = false; // Mark as loaded
        }
    };

    const getBotHolder = (botHolder) => {
        routes.forEach(route => {
            botHolder.appendChild(button({
                label: route.label,
                icon: route.icon,
                event: (event) => {
                    window.location.assign(route.url);
                },
                url: route.url
            }));
        });
    };

    const Tabs = () => {
        const logoSection = $({
            tag: 'div',
            style: {
                padding: '24px 16px',
                marginBottom: '20px',
                borderBottom: '1px solid #e8e8e8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            },
            event: {
                type: 'click',
                method: () => window.location.assign('/rdeOffice/dashboard')
            },
            child: [
                $({
                    tag: 'img',
                    att: {
                        src: '/client/images/cap.png',
                        alt: 'CAPSU Logo',
                        className: 'capsu-logo-sidebar'
                    },
                    style: {
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        textAlign: 'center',
                        fontFamily: 'Inter, Segoe UI, sans-serif'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'RDE Office',
                            style: {
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#212529'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Research, Development & Extension',
                            style: {
                                fontSize: '11px',
                                color: '#6c757d',
                                fontWeight: '400',
                                letterSpacing: '0.3px'
                            }
                        })
                    ]
                })
            ]
        });

        return ($({
            tag: 'div',
            style: {
                width: '280px',
                margin: '0',
                height: '100%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
                borderRight: '1px solid #e8e8e8',
                flexShrink: '0'
            },
            child: [
                logoSection,
                $({
                    tag: 'div',
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '8px 0',
                        background: '#ffffff'
                    },
                    elementHandler: (el) => {
                        const style = document.createElement('style');
                        style.textContent = `
                            .tabs-scroll-container::-webkit-scrollbar {
                                width: 4px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 4px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-thumb {
                                background: #4caf50;
                                border-radius: 4px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-thumb:hover {
                                background: #2e7d32;
                            }
                            .mainButton {
                                color: #495057;
                            }
                            .mainButton:hover {
                                background: #f8f9fa;
                                color: #0d6efd;
                            }
                            .mainButton:hover i {
                                color: #0d6efd;
                            }
                            .mainButton.activeStaffBot {
                                background: #e7f1ff;
                                color: #0d6efd;
                                font-weight: 600;
                            }
                            .mainButton.activeStaffBot i {
                                color: #0d6efd;
                            }
                        `;
                        document.head.appendChild(style);
                        el.className = 'tabs-scroll-container';
                        getBotHolder(el);
                    }
                })
            ]
        }));
    };

    return ($({
        tag: 'div',
        style: {
            height: 'calc(100% - 70px)',
            width: '100%',
            display: 'flex',
            backgroundColor: 'transparent'
        },
        child: [
            Tabs(),
            $({
                tag: 'div',
                style: {
                    flex: 1,
                    overflow: 'auto',
                    padding: '24px',
                    backgroundColor: '#f8f9fa'
                },
                elementHandler: (el) => {
                    getComponent(el);
                }
            })
        ]
    }));
};


export const RdeOffice = () => {
    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: 'transparent'
        },
        externalStyle: '/client/component/rdeStaff/style/rdeOffice.css',
        child: [
            Header(),
            Body()
        ]
    }));
};

export {
    componentCache,
    routes,
    loaders,
    lazyLoad
};

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        console.log('RDE Office hot module reloaded');
        // Clear cache for RDE components
        componentCache.clear();
        // Refresh the current route
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/rdeOffice')) {
            window.location.reload();
        }
    });
}
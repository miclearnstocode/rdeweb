import { $ } from "../../../lib/lib.js";
import { Header } from "../../otherComponent/header.js";
import { Communication } from "./communication.js";
import { ResearchMain } from "./mainResearch.js";
import { CompletedResearch } from "./completedResearch.js";
import { ProposedResearch } from "./proposedResearch.js";
import { Utilization } from "./utilization.js";
import { CertificationResearch } from "./certificationResearch.js";
import { SummaryAccomplishment } from "./summaryAccomplishment.js";
import { QuarterlyMonitoringComponent } from "./quarterlyMonitoring.js";
import { Summary } from "./researchSummary.js";
import { RdeDashboard } from "./rdeDashboard.js";
import { internallyFundedResearch } from "./internallyFunded.js";

const button = ({ label, event, url }) => {
    const getB = (b) => {
        let current = window.location.href.replace(window.location.origin, '')
        let me = current.split('/')[2];
        let urls = url.replace(window.location.origin, '')
        if (me === urls.split('/')[2]) {
            b.classList.add('activeStaffBot')
        }
    }

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
                    className: getIconForLabel(label)
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
    }))
}

// Helper function to get icon for each label
const getIconForLabel = (label) => {
    const icons = {
        'Event/Activity': 'fas fa-calendar-alt',
        'Proposed Research': 'fas fa-file-alt',
        'Internally Funded Research': 'fas fa-university',
        'Completed Research': 'fas fa-check-circle',
        'Monitoring': 'fas fa-chart-line',
        'Accomplishments': 'fas fa-trophy',
        'Research Utilization': 'fas fa-handshake',
        'Summary': 'fas fa-chart-bar',
        'Certifications': 'fas fa-certificate'
    };
    return icons[label] || 'fas fa-folder';
}

const Body = () => {
    let mainBody
    const botArray = []

    botArray.push({
        url: '/rdeOffice/research',
        label: 'Event/Activity',
        button: button,
        page: ResearchMain
    })
    botArray.push({
        url: '/rdeOffice/proposedResearch',
        label: 'Proposed Research',
        button: button,
        page: ProposedResearch
    })
    botArray.push({
        url: '/rdeOffice/internallyfunded',
        label: 'Internally Funded Research',
        button: button,
        page: internallyFundedResearch
    })
    botArray.push({
        url: '/rdeOffice/completedResearch',
        label: 'Completed Research',
        button: button,
        page: CompletedResearch
    })
    botArray.push({
        url: '/rdeOffice/quarterlyMonitoring',
        label: 'Monitoring',
        button: button,
        page: QuarterlyMonitoringComponent
    })
    botArray.push({
        url: '/rdeOffice/accomplishmentReport',
        label: 'Accomplishments',
        button: button,
        page: SummaryAccomplishment
    })
    botArray.push({
        url: '/rdeOffice/utilization',
        label: 'Research Utilization',
        button: button,
        page: Utilization
    })
    botArray.push({
        url: '/rdeOffice/summary',
        label: 'Summary',
        button: button,
        page: Summary
    })
    botArray.push({
        url: '/rdeOffice/certification',
        label: 'Certifications',
        button: button,
        page: CertificationResearch
    })

    const Tabs = () => {
        const logoSection = $({
            tag: 'div',
            style: {
                padding: '24px 16px',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
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
                })
            ]
        })

        return ($({
            tag: 'div',
            style: {
                width: '280px',
                margin: '0',
                height: '100%',
                background: 'transparent',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
                borderRight: '1px solid rgba(0,0,0,0.05)'
            },
            child: [
                logoSection,
                $({
                    tag: 'div',
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '8px 0'
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
                        `;
                        document.head.appendChild(style);
                        el.className = 'tabs-scroll-container';
                        getBotHolder(el);
                    }
                })
            ]
        }))
    }

    const getComponent = (el) => {
        mainBody = el
        let current = window.location.href.replace(window.location.origin, '')
        let me = current.split('/')[2];

        let matched = false;
        botArray.forEach(val => {
            let url = val.url.replace(window.location.origin, '')
            if (me === url.split('/')[2]) {
                matched = true;
                const component = val.page();
                if (component instanceof Node) {
                    el.appendChild(component);
                } else {
                    console.error(`Component mounting failed: ${val.label} did not return a valid DOM Node.`, component);
                    el.innerHTML = `<div style="padding: 50px; text-align: center; color: #ff6b6b; font-family: sans-serif;">
                        <h3>Failed to Load Component</h3>
                        <p>The ${val.label} module encountered an initialization error.</p>
                    </div>`;
                }
            }
        })

        if (!matched) {
            const dashboard = RdeDashboard();
            if (dashboard instanceof Node) el.appendChild(dashboard);
        }
    }

    const getBotHolder = (botHolder) => {
        botArray.forEach(val => {
            botHolder.appendChild(val.button({
                label: val.label,
                event: (event) => {
                    window.location.assign(val.url)
                },
                url: val.url
            }))
        })
    }

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
                    backgroundColor: 'transparent'
                },
                elementHandler: getComponent
            })
        ]
    }))
}

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
    }))
}
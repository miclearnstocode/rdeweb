
import { $ } from "../../../lib/lib.js";
import { Header } from "../../otherComponent/header.js";
import { Communication } from "./communication.js";
import { ResearchMain } from "./mainResearch.js";
import { CompletedResearch } from "./completedResearch.js";
import { ProposedResearch } from "./proposedResearch.js";
import { PresentationResearch } from "./presentationResearch.js";
import { Publication } from "./publication.js";
import { PatentUM } from "./patentUM.js";
import { Utilization } from "./utilization.js";
import { CertificationResearch } from "./certificationResearch.js";
import { MonitoringComponent } from "./monitoring.js";
import { QuarterlyMonitoringComponent } from "./quarterlyMonitoring.js";
import { Summary } from "./researchSummary.js";
import { RdeDashboard } from "./rdeDashboard.js";

const button = ({ label, event, url }) => {
    const getB = (b) => {
        let current = window.location.href.replace(window.location.origin, '')
        let me = current.split('/')[2];
        let urls = url.replace(window.location.origin, '')
        if (me === urls.split('/')[2]) {
            b.className += ' activeStaffBot'
        }
    }

    return ($({
        tag: 'div',
        style: {
            height: '10vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1px',
            cursor: 'pointer',
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
                tag: 'div',
                style: {
                    width: 'fit-content',
                    height: 'fit-content',
                    margin: 'auto',
                    fontFamily: 'arial black,sans-serif',
                    fontSize: label.length > 20 ? '10px' : '15px'
                },
                text: label
            })
        ]
    }))
}

const Body = () => {
    let mainBody
    const botArray = []

    /*botArray.push({
        url: '/rdeOffice/communication',
        label: 'Communication',
        button: button,
        page: Communication
    })*/

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
        url: '/rdeOffice/researchMonitoring',
        label: 'Internally Funded Research Monitoring',
        button: button,
        page: MonitoringComponent
    })
    botArray.push({
        url: '/rdeOffice/completedResearch',
        label: 'Completed Research',
        button: button,
        page: CompletedResearch
    })
    botArray.push({
        url: '/rdeOffice/quarterlyMonitoring',
        label: 'Quarterly Monitoring',
        button: button,
        page: QuarterlyMonitoringComponent
    })
    botArray.push({
        url: '/rdeOffice/presentationResearch',
        label: 'Presented Research',
        button: button,
        page: PresentationResearch
    })
    botArray.push({
        url: '/rdeOffice/publication',
        label: 'Publications',
        button: button,
        page: Publication
    })
    botArray.push({
        url: '/rdeOffice/patentUM',
        label: 'IP Assets',
        button: button,
        page: PatentUM
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
        const label = $({
            tag: 'div', style: {
                fontFamily: 'arial black,sans-serif', fontSize: '1.5vw', color: 'deepskyblue',
                height: '10vh', margin: 'auto', width: '100%', display: 'flex',
                justifyContent: 'center', backgroundColor: '#666',
                borderBottom: '1px solid #777', position: 'sticky', top: '0', zIndex: '100',
                cursor: 'pointer'
            },
            event: { type: 'click', method: () => window.location.assign('/rdeOffice/dashboard') },
            child: [$({
                tag: 'div', text: 'RDE OFFICE',
                style: { margin: 'auto', height: 'fit-content', width: 'fit-content' }
            })]
        })

        return ($({
            tag: 'div',
            style: {
                width: '15%',
                margin: 'auto',
                marginLeft: '0',
                height: '100%',
                backgroundColor: '#666',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Hide overflow on the container
            },
            child: [
                label,
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: 'calc(100% - 10vh)', // Subtract label height
                        overflowY: 'auto', // Add vertical scroll
                        overflowX: 'hidden', // Hide horizontal scroll
                        paddingTop: '1vh',
                        paddingBottom: '1vh',
                        // Custom scrollbar styling
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#888 #444',
                    },
                    elementHandler: (el) => {
                        // Add custom scrollbar styles for webkit browsers
                        const style = document.createElement('style');
                        style.textContent = `
                            .tabs-scroll-container::-webkit-scrollbar {
                                width: 6px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-track {
                                background: #444;
                                border-radius: 3px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-thumb {
                                background: #888;
                                border-radius: 3px;
                            }
                            .tabs-scroll-container::-webkit-scrollbar-thumb:hover {
                                background: #aaa;
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

        // If no route matched, default to Dashboard
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
            height: '94.5%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
        },
        child: [
            Tabs(),
            $({
                tag: 'div',
                style: {
                    width: '84.8%',
                    marginLeft: '0',
                    overflow: 'hidden' // Prevent main content from overflowing
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
            height: '99.8vh',
        },
        externalStyle: '/client/component/rdeStaff/style/rdeOffice.css',
        child: [
            Header(),
            Body()
        ]
    }))
}
import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting, CustomModal } from "../../../lib/lib.js";
import { Print } from "../../otherComponent/comment.js";
import { PrintSummary } from "../../otherComponent/ReviewTemplate.js";
import { Route, Router } from "../../../lib/Router.js";
import { RankDocs } from "./src/docsRank.js";
import { FinalRanking, RankPerCriteria, ScoreRankAVe } from "./src/rankAlgo.js";
import { Summary } from "./src/Summary.js";
import { PrintResearch } from "../../otherComponent/researchSummary.js";
import { Forwarded } from "./src/forwarded.js";


//add certification attachment when there is title changes
export const ResearchMain = () => {
    let mainFrame, leftPdiv
    const getMainFrame = (el) => {
        mainFrame = el
    }
    const getLeftDiv = (el) => {
        leftPdiv = el
    }
    let serch

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }
    const Incoming = () => {
        let bodyContent, docQue
        let currentTab = 'faculty'

        const label = $({
            tag: 'div',
            style: {
                height: 'fit-content',
                width: 'fit-content',
                fontFamily: 'arial black,sans-serif',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '1vh auto auto',
                fontSize: '1.2vw',
                letterSpacing: '1px'
            },
            text: 'Incoming Entry Submissions'
        })

        // Tab buttons
        const createTabs = () => {
            const tabsContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '1vw',
                    margin: '1vh auto',
                    width: 'fit-content',
                    backgroundColor: 'transparent',
                    padding: '0.5rem',
                    borderRadius: '12px'
                },
                child: []
            })

            const tabs = [
                { id: 'faculty', label: 'Faculty', icon: 'fa-solid fa-chalkboard-user' },
                { id: 'undergraduate', label: 'Undergraduate', icon: 'fa-solid fa-graduation-cap' },
                { id: 'graduate', label: 'Graduate', icon: 'fa-solid fa-user-graduate' }
            ]

            tabs.forEach(tab => {
                const tabBtn = $({
                    tag: 'button',
                    att: { className: `tab-btn-${tab.id}` },
                    style: {
                        padding: '8px 20px',
                        backgroundColor: currentTab === tab.id ? 'deepskyblue' : 'transparent',
                        color: currentTab === tab.id ? '#fff' : '#666',
                        border: `1px solid ${currentTab === tab.id ? 'deepskyblue' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9vw',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    child: [
                        $({ tag: 'span', att: { className: tab.icon }, style: { fontSize: '1vw' } }),
                        $({ tag: 'span', text: tab.label })
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            currentTab = tab.id
                            // Update button styles
                            tabs.forEach(t => {
                                const btn = document.querySelector(`.tab-btn-${t.id}`)
                                if (btn) {
                                    if (t.id === currentTab) {
                                        btn.style.backgroundColor = 'deepskyblue'
                                        btn.style.color = '#fff'
                                        btn.style.borderColor = 'deepskyblue'
                                    } else {
                                        btn.style.backgroundColor = 'transparent'
                                        btn.style.color = '#666'
                                        btn.style.borderColor = '#e0e0e0'
                                    }
                                }
                            })
                            // Refresh content
                            loadContent()
                        }
                    }
                })
                tabsContainer.appendChild(tabBtn)
            })

            return tabsContainer
        }

        const search = $({
            tag: 'div',
            style: {
                height: '44px',
                width: 'fit-content',
                minWidth: '280px',
                margin: '0',
                backgroundColor: '#ffffff',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                cursor: 'text'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '0 16px',
                        gap: '8px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-magnifying-glass' },
                            style: {
                                color: '#adb5bd',
                                fontSize: '16px',
                                flexShrink: '0',
                                transition: 'color 0.2s ease'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'text',
                                className: 'searchInput',
                                placeholder: 'Search submissions...'
                            },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                padding: '0',
                                color: '#2c3e50',
                                width: '200px',
                                height: '100%',
                                fontSize: '14px',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'input',
                                method: (ev) => {
                                    SearchMethod({
                                        nodeList: bodyContent?.childNodes || [],
                                        textArray: ev.target.value.toUpperCase().split(' '),
                                        display: 'flex'
                                    })
                                },
                                type2: 'focus',
                                method2: (e) => {
                                    e.target.style.width = '280px';
                                    const searchIcon = e.target.parentElement?.querySelector('.fa-magnifying-glass');
                                    if (searchIcon) searchIcon.style.color = '#0d6efd';
                                },
                                type3: 'blur',
                                method3: (e) => {
                                    e.target.style.width = '200px';
                                    const searchIcon = e.target.parentElement?.querySelector('.fa-magnifying-glass');
                                    if (searchIcon) searchIcon.style.color = '#adb5bd';
                                }
                            }
                        }),
                        // Optional clear button
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-circle-xmark',
                                title: 'Clear search'
                            },
                            style: {
                                color: '#adb5bd',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'none',
                                transition: 'color 0.2s ease',
                                flexShrink: '0'
                            },
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation();
                                    const input = e.target.parentElement?.querySelector('input');
                                    if (input) {
                                        input.value = '';
                                        // Trigger input event to update search
                                        const inputEvent = new Event('input', { bubbles: true });
                                        input.dispatchEvent(inputEvent);
                                    }
                                    e.target.style.display = 'none';
                                }
                            },
                            mouseenter: (e) => {
                                e.target.style.color = '#dc3545';
                            },
                            mouseleave: (e) => {
                                e.target.style.color = '#adb5bd';
                            }
                        })
                    ]
                })
            ],
            elementHandler: (el) => {
                // Add focus effect to the container
                const input = el.querySelector('input');
                const clearBtn = el.querySelector('.fa-circle-xmark');

                if (input) {
                    // Show/hide clear button based on input value
                    input.addEventListener('input', (e) => {
                        if (clearBtn) {
                            clearBtn.style.display = e.target.value.length > 0 ? 'block' : 'none';
                        }
                    });

                    input.addEventListener('focus', () => {
                        el.style.borderColor = '#0d6efd';
                        el.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                    });

                    input.addEventListener('blur', () => {
                        el.style.borderColor = '#e9ecef';
                        el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                    });
                }

                // Make entire container clickable to focus input
                el.addEventListener('click', () => {
                    if (input) input.focus();
                });
            }
        });

        const loadContent = () => {
            if (!bodyContent) return

            bodyContent.innerHTML = ''

            // Show loading indicator
            bodyContent.appendChild($({
                tag: 'div',
                style: { textAlign: 'center', padding: '40px', color: '#bbb' },
                text: 'Loading...'
            }))

            const form = new FormData()

            if (currentTab === 'faculty') {
                form.append('incomingEndorsement', 'true')
            } else if (currentTab === 'undergraduate') {
                form.append('incomingStudentResearch', 'true')
                form.append('paper_type', 'undergraduate')
            } else if (currentTab === 'graduate') {
                form.append('incomingStudentResearch', 'true')
                form.append('paper_type', 'graduate')
            }

            fetch('/getresearch', {
                method: 'POST',
                body: form
            }).then(res => res.json())
                .then(data => {
                    bodyContent.innerHTML = ''
                    if (docQue) docQue.innerText = `  ${data.length}  `

                    if (data.length === 0) {
                        bodyContent.appendChild($({
                            tag: 'div',
                            style: { textAlign: 'center', padding: '40px', color: '#888', fontSize: '1.1vw' },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-inbox' }, style: { fontSize: '3vw', display: 'block', marginBottom: '10px' } }),
                                $({ tag: 'div', text: `No pending ${currentTab === 'faculty' ? 'faculty research' : currentTab === 'undergraduate' ? 'undergraduate' : 'graduate'} submissions found` })
                            ]
                        }))
                        return
                    }

                    data.forEach(val => {
                        if (currentTab === 'faculty') {
                            bodyContent.appendChild(docsFaculty({
                                date: val.date,
                                campus: val.campus,
                                center: val.center,
                                locationType: val.locationType,
                                eventType: val.event,
                                file: val.file,
                                research: val.researchDocs,
                                docId: val.id,
                                sender: val.senderType,
                                smail: val.senderEmail
                            }))
                        } else {
                            // For undergraduate and graduate
                            bodyContent.appendChild(docsStudent({
                                id: val.id,
                                title: val.title,
                                author: val.author,
                                coauthor: val.coauthor,
                                presenter: val.presenter,
                                category: val.category,
                                campus: val.campus,
                                event: val.event,
                                paper_type: val.paper_type,
                                status: val.status,
                                created_at: val.created_at,
                                sender_type: val.sender_type,
                                sender_email: val.sender_email,
                                research_file: val.research_file,
                                endorsement_file: val.endorsement_file
                            }))
                        }
                    })
                })
                .catch(err => {
                    bodyContent.innerHTML = ''
                    bodyContent.appendChild($({
                        tag: 'div',
                        style: { textAlign: 'center', padding: '40px', color: '#888', fontSize: '1.1vw' },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-inbox' }, style: { fontSize: '3vw', display: 'block', marginBottom: '10px' } }),
                            $({ tag: 'div', text: `No pending ${currentTab === 'faculty' ? 'faculty research' : currentTab === 'undergraduate' ? 'undergraduate' : 'graduate'} submissions found` })
                        ]
                    }))
                })
        }


        // Faculty Research Document Component
        const docsFaculty = ({ date, eventType, file, research, docId, status, sender, smail, center, campus, locationType }) => {
            let category, titleEntry
            let programFile = null
            let certificateFile = null
            let localInhouseData = null
            let endorsementLetterUrl = null
            let inhouseSource = null // For university symposium source
            let paperTrailNo = null
            let isNewTitle = false
            let fundsource = null
            let titleCertificateFile = null

            research.forEach(val => {
                category = val.category;
                if (val.final_symposium_title) {
                    titleEntry = val.final_symposium_title;
                    isNewTitle = true; 
                } else {
                    titleEntry = val.title;
                    isNewTitle = false;
                }
                if (val.programFile && val.programFile.hasFile) {
                    programFile = val.programFile;
                }
                if (val.certificateFile && val.certificateFile.hasFile) {
                    certificateFile = val.certificateFile;
                }
                if (val.titleCertificateFile && val.titleCertificateFile.hasFile) { 
                    titleCertificateFile = val.titleCertificateFile;
                }
                if (val.document_title) {
                    localInhouseData = val;
                }

                if (val.inhouse_source) {
                    inhouseSource = val.inhouse_source;
                }
                if (val.paper_trail_no) {
                    paperTrailNo = val.paper_trail_no;
                }
                if (val.fundsource) { // ADD THIS
                    fundsource = val.fundsource;
                }
            });

            // Get endorsement letter URL from the main file object
            if (typeof file === 'object' && file !== null) {
                endorsementLetterUrl = file.drive_view_url || file.viewUrl || file.fileUrl || file.file || file.legacyFile || ''
            } else if (typeof file === 'string') {
                try {
                    if (file.includes('{') && file.includes('}')) {
                        const parsed = JSON.parse(file);
                        endorsementLetterUrl = parsed.drive_view_url || parsed.viewUrl || parsed.fileUrl || parsed.file || file;
                    } else {
                        endorsementLetterUrl = file;
                    }
                } catch (e) {
                    endorsementLetterUrl = file;
                }
            }

            const isExtension = center === 'Extension (Extension)' || center === 'Extension'
            const isSymposium = eventType && (eventType.toLowerCase().includes('symposium') || eventType.toLowerCase().includes('rde'))
            const isInHouse = eventType && (eventType.toLowerCase().includes('in-house') || eventType.toLowerCase().includes('in house'))
            const isUniversitySymposium = isSymposium && !localInhouseData // No local_inhouse data means it's a university symposium

            let researchFileLabel = ''
            if (isExtension) {
                if (isSymposium) researchFileLabel = 'Extension Paper'
                else if (isInHouse) researchFileLabel = 'Extension Proposal'
                else researchFileLabel = 'Extension Document'
            } else {
                if (isSymposium) researchFileLabel = 'Research Paper'
                else if (isInHouse) researchFileLabel = 'Research Proposal'
                else researchFileLabel = 'Research Document'
            }

            const formatDate = (dateStr) => {
                if (!dateStr) return 'N/A';
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            };

            // Modern file viewer using CustomModal
            const openFileInModal = (fileData, title, fileType) => {
                let driveViewUrl = ''

                if (typeof fileData === 'object' && fileData !== null) {
                    driveViewUrl = fileData.drive_view_url || fileData.viewUrl || fileData.fileUrl || fileData.file || fileData.legacyFile || ''
                } else if (typeof fileData === 'string') {
                    try {
                        if (fileData.includes('{') && fileData.includes('}')) {
                            const parsed = JSON.parse(fileData)
                            driveViewUrl = parsed.drive_view_url || parsed.viewUrl || parsed.fileUrl || parsed.file || fileData
                        } else {
                            driveViewUrl = fileData
                        }
                    } catch (e) {
                        driveViewUrl = fileData
                    }
                }

                // If no valid URL found
                if (!driveViewUrl) {
                    alert(`No ${fileType} file available`);
                    return;
                }

                const createViewerContent = () => {
                    const container = $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '100%',
                            minHeight: '500px',
                            position: 'relative'
                        }
                    });

                    const isGoogleDriveUrl = driveViewUrl && driveViewUrl.includes('drive.google.com');

                    if (isGoogleDriveUrl) {
                        let fileId = null;
                        const patterns = [
                            /\/d\/([a-zA-Z0-9_-]+)/,
                            /id=([a-zA-Z0-9_-]+)/,
                            /open\?id=([a-zA-Z0-9_-]+)/,
                            /\/file\/d\/([a-zA-Z0-9_-]+)/,
                            /([a-zA-Z0-9_-]{25,})/
                        ];

                        for (let pattern of patterns) {
                            const match = driveViewUrl.match(pattern);
                            if (match && match[1]) {
                                fileId = match[1];
                                break;
                            }
                        }

                        if (fileId) {
                            fileId = fileId.split('?')[0].split('&')[0];
                            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

                            const loadingIndicator = $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    zIndex: 10
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-spinner fa-pulse' },
                                        style: { fontSize: '32px', color: '#0d6efd', marginBottom: '12px', display: 'block' }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Loading ${fileType}...`,
                                        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6c757d' }
                                    })
                                ]
                            });
                            container.appendChild(loadingIndicator);

                            const iframe = document.createElement('iframe');
                            iframe.src = embedUrl;
                            iframe.style.width = '100%';
                            iframe.style.height = '100%';
                            iframe.style.border = 'none';
                            iframe.style.position = 'absolute';
                            iframe.style.top = '0';
                            iframe.style.left = '0';
                            iframe.allow = 'autoplay; fullscreen';
                            iframe.allowFullscreen = true;

                            iframe.onload = () => loadingIndicator.remove();
                            iframe.onerror = () => {
                                loadingIndicator.remove();
                                container.innerHTML = `
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                <span class="fa-solid fa-circle-exclamation" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load ${fileType}</h3>
                                <a href="${driveViewUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Open in Google Drive</a>
                            </div>
                        `;
                            };

                            container.appendChild(iframe);
                        } else {
                            container.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                            <span class="fa-solid fa-link-slash" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                            <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Invalid Google Drive URL</h3>
                            <p style="font-family: Inter, sans-serif; color: #6c757d;">Could not extract file ID from the URL.</p>
                        </div>
                    `;
                        }
                    } else if (driveViewUrl) {
                        const objectEl = $({
                            tag: 'object',
                            att: {
                                data: driveViewUrl.startsWith('/') ? driveViewUrl : '/' + driveViewUrl,
                                type: 'application/pdf'
                            },
                            style: {
                                width: '100%',
                                height: '100%',
                                minHeight: '500px',
                                border: 'none',
                                borderRadius: '8px'
                            },
                            elementHandler: (obj) => {
                                obj.onerror = () => {
                                    obj.innerHTML = `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                    <span class="fa-solid fa-file-pdf" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                    <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load PDF</h3>
                                    <a href="${driveViewUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Download PDF</a>
                                </div>
                            `;
                                };
                            }
                        });
                        container.appendChild(objectEl);
                    } else {
                        container.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                        <span class="fa-solid fa-link-slash" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                        <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">No valid file available</h3>
                        <p style="font-family: Inter, sans-serif; color: #6c757d;">The ${fileType} file could not be found.</p>
                    </div>
                `;
                    }

                    return container;
                };

                CustomModal({
                    title: `${fileType} - ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`,
                    size: 'large',
                    content: createViewerContent,
                    showCloseButton: true,
                    closeOnOverlayClick: true
                });
            };

            const viewDocs = () => {
                const DetailsPanel = () => {
                const researchBot = ({ dataURLResearch, title, titleLabel, category, author, coAuthor, presenter, center, campus, programFile, certificateFile, titleCertificateFile, inhouseSource, localInhouseData, paperTrailNo, fundsource }) => {
                    const labelDetails = (label, data, highlight = false) => {
                        return $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: highlight ? '#fff3cd' : '#f8f9fa',
                                borderRadius: '8px',
                                border: highlight ? '1px solid #ffc107' : 'none'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: `${label}:`,
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: highlight ? '#856404' : '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: data || 'N/A',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        color: highlight ? '#856404' : '#2c3e50',
                                        fontSize: '13px',
                                        flex: '1'
                                    }
                                })
                            ]
                        });
                    }

                    const CoAuthorList = () => {
                        let coauthors = []
                        try {
                            if (coAuthor && coAuthor !== '[]' && coauthor !== 'null') {  // FIX: use coauthor variable, not coAuthor
                                coauthors = JSON.parse(coAuthor)
                            }
                        } catch (e) {
                            coauthors = []
                        }

                        if (coauthors.length === 0) return null

                        return $({
                            tag: 'div',
                            style: {
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Co-Authors:',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px',
                                        display: 'block',
                                        marginBottom: '8px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: { marginLeft: '120px' },
                                    elementHandler: (el) => {
                                        coauthors.forEach(val => {
                                            el.appendChild($({
                                                tag: 'div',
                                                text: `• ${val}`,
                                                style: {
                                                    fontFamily: 'Inter, sans-serif',
                                                    color: '#2c3e50',
                                                    fontSize: '13px',
                                                    marginBottom: '4px'
                                                }
                                            }))
                                        })
                                    }
                                })
                            ]
                        })
                    }

                    const isResearchExtension = !center || center === '' || center === 'Extension (Extension)' || center === 'Extension'
                    const locationLabel = isResearchExtension ? 'Campus' : 'Center'
                    const locationValue = isResearchExtension ? (campus || 'N/A') : (center || 'N/A')

                    // Build research details array - filter out null values
                    const researchDetails = [
                        labelDetails(titleLabel || "Title", title),
                        labelDetails("Author", author),
                        CoAuthorList(),
                        labelDetails("Presenter", presenter),
                        (locationValue && locationValue !== 'N/A' && locationValue !== '') ? labelDetails(locationLabel, locationValue) : null,
                        labelDetails("Category", category),
                        (fundsource && fundsource !== '' && fundsource !== 'N/A') ? labelDetails("Fund Source", fundsource) : null
                    ].filter(item => item !== null);

                        // If this is a symposium submission with in-house source, add the source info
                        if (inhouseSource) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #1976D2'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-link' },
                                                    style: { color: '#1976D2', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Source University In-House Review:',
                                                    style: {
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontWeight: '600',
                                                        color: '#1976D2',
                                                        fontSize: '13px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: paperTrailNo || 'N/A',
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
                                                        color: '#1976D2',
                                                        backgroundColor: '#bbdefb',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }
                                                })
                                            ]
                                        }),
                                        labelDetails("In-House Title", inhouseSource.title || 'N/A', true),
                                        labelDetails("In-House Event", inhouseSource.event || inhouseSource.event_name || 'N/A', true),
                                        labelDetails("In-House Author", inhouseSource.author || 'N/A', true)
                                    ]
                                })
                            )
                        }

                        // If this is a local in-house submission, show local data
                        if (localInhouseData) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #4caf50'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-file-lines' },
                                                    style: { color: '#4caf50', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Source Local In-House Review:',
                                                    style: {
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontWeight: '600',
                                                        color: '#4caf50',
                                                        fontSize: '13px'
                                                    }
                                                }),
                                                ...(localInhouseData.paper_trail_no ? [
                                                    $({
                                                        tag: 'span',
                                                        text: localInhouseData.paper_trail_no,
                                                        style: {
                                                            fontFamily: 'monospace',
                                                            fontSize: '12px',
                                                            color: '#4caf50',
                                                            backgroundColor: '#c8e6c9',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px'
                                                        }
                                                    })
                                                ] : [])
                                            ]
                                        }),
                                        labelDetails("Document Title", localInhouseData.document_title || 'N/A', true),
                                        labelDetails("Local Event", localInhouseData.local_eventname || 'N/A', true),
                                        labelDetails("Main Author", localInhouseData.main_author || 'N/A', true),
                                        labelDetails("Campus", localInhouseData.campus || 'N/A', true),
                                        labelDetails("Category", localInhouseData.category || 'N/A', true)
                                    ]
                                })
                            )
                        }

                        // Add paper trail number display
                        if (paperTrailNo && !inhouseSource && !localInhouseData) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '8px',
                                        padding: '4px 12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: 'Paper Trail No: ',
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: '500',
                                                color: '#6c757d',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: paperTrailNo,
                                            style: {
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                color: '#2c3e50'
                                            }
                                        })
                                    ]
                                })
                            )
                        }

                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '20px',
                                marginBottom: '16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                            },
                            child: researchDetails
                        })
                    }

                    const Button = ({ Label, Event, isAccept = false }) => {
                        const colors = isAccept
                            ? { bg: '#28a745', hover: '#218838' }
                            : { bg: '#dc3545', hover: '#c82333' }

                        return $({
                            tag: 'button',
                            style: {
                                padding: '12px 24px',
                                backgroundColor: colors.bg,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                flex: '1'
                            },
                            text: Label,
                            event: {
                                type: 'click',
                                method: Event
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = colors.hover;
                                e.target.style.transform = 'translateY(-1px)';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = colors.bg;
                                e.target.style.transform = 'translateY(0)';
                            }
                        })
                    }

                    const showRejectModal = () => {
                        let rejectReason = ''

                        const modalContent = ({ closeModal }) => {
                            return $({
                                tag: 'div',
                                style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                                        child: [
                                            $({
                                                tag: 'label',
                                                text: 'Reason for Rejection',
                                                style: {
                                                    color: '#495057',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    fontFamily: 'Inter, sans-serif'
                                                }
                                            }),
                                            $({
                                                tag: 'textarea',
                                                att: { placeholder: 'Please provide a detailed reason for rejecting this document...' },
                                                style: {
                                                    width: '100%',
                                                    minHeight: '150px',
                                                    padding: '12px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '8px',
                                                    color: '#2c3e50',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease'
                                                },
                                                event: {
                                                    type: 'input',
                                                    method: (e) => { rejectReason = e.target.value },
                                                    focus: (e) => { e.target.style.borderColor = '#0d6efd' },
                                                    blur: (e) => { e.target.style.borderColor = '#dee2e6' }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            })
                        }

                        const modalFooter = ({ closeModal }) => {
                            return $({
                                tag: 'div',
                                style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                                child: [
                                    $({
                                        tag: 'button',
                                        text: 'Cancel',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '8px',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            mouseenter: (e) => { e.target.style.backgroundColor = '#f8f9fa' },
                                            mouseleave: (e) => { e.target.style.backgroundColor = '#ffffff' }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Submit Rejection',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#dc3545',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: async () => {
                                                if (!rejectReason.trim()) {
                                                    alert('Please provide a reason for rejection')
                                                    return
                                                }
                                                closeModal()

                                                let loading = Waiting()
                                                document.body.appendChild(loading)

                                                const form = new FormData()
                                                form.append('docId', docId)
                                                form.append('reasonEnd', rejectReason)
                                                form.append('rejectIndorse', 'true')
                                                form.append('fileType', `EndorsementLetter:${eventType}`)

                                                await fetch('/getresearch', {
                                                    method: 'POST',
                                                    body: form
                                                }).then(res => res.json())
                                                    .then(dat => {
                                                        loading.remove()
                                                        if (dat?.status) {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => window.location.reload()))
                                                        } else {
                                                            document.body.appendChild(ConfirmationAlert(dat?.message || 'Error processing request', () => window.location.reload()))
                                                        }
                                                    }).catch(() => {
                                                        loading.remove()
                                                    })
                                            },
                                            mouseenter: (e) => { e.target.style.backgroundColor = '#c82333' },
                                            mouseleave: (e) => { e.target.style.backgroundColor = '#dc3545' }
                                        }
                                    })
                                ]
                            })
                        }

                        return CustomModal({
                            title: 'Reject Document',
                            size: 'medium',
                            content: modalContent,
                            footer: modalFooter,
                            closeOnOverlayClick: true
                        })
                    }

                    const Controller = () => {
                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '20px',
                                backgroundColor: '#ffffff',
                                borderTop: '1px solid #e9ecef',
                                display: 'flex',
                                gap: '12px'
                            },
                            child: [
                                Button({
                                    Label: '✓ ACCEPT',
                                    Event: async () => {
                                        if (confirm("Are you sure you want to accept this document?")) {
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const req = new Request('/getresearch')
                                            req.Post([
                                                { name: 'acceptRequest', value: '1' },
                                                { name: 'docId', value: docId },
                                                { name: 'campus', value: campus },
                                                { name: 'eventType', value: eventType }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                loading.remove()
                                                if (data.status) {
                                                    document.body.appendChild(ConfirmationAlert("Document Accepted Successfully!", () => window.location.reload()))
                                                } else {
                                                    alert(data.message || "Failed to accept document")
                                                }
                                            }).catch(() => loading.remove())
                                        }
                                    },
                                    isAccept: true
                                }),
                                Button({
                                    Label: '✗ REJECT',
                                    Event: () => {
                                        if (confirm("Are you sure you want to reject this document?")) showRejectModal()
                                    },
                                    isAccept: false
                                })
                            ]
                        })
                    }

                    const getClickBot = (el) => {
                        const holder = $({
                            tag: 'div',
                            style: {
                                flex: '1',
                                overflowY: 'auto',
                                padding: '20px',
                                backgroundColor: '#f8f9fa'
                            }
                        })

                        research.forEach(val => {
                            holder.appendChild(researchBot({
                                dataURLResearch: val.file,
                                title: val.final_symposium_title || val.title,
                                category: val.category,
                                author: val.author,
                                coAuthor: val.coauthor,
                                presenter: val.presenter,
                                center: val.center,
                                campus: val.campus || val.local_campus,
                                programFile: val.programFile,
                                certificateFile: val.certificateFile,
                                titleCertificateFile: val.titleCertificateFile,
                                inhouseSource: val.inhouse_source,
                                localInhouseData: val.local_inhouse_data || (val.document_title ? val : null),
                                paperTrailNo: val.paper_trail_no,
                                fundsource: val.fundsource
                            }))
                        })

                        el.appendChild(holder)
                        el.appendChild(Controller())
                    }

                    return $({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #e9ecef'
                        },
                        elementHandler: getClickBot
                    })
                }

                const RightPanel = () => {
                    const extractFileUrl = (fileData) => {
                        if (!fileData) return null;

                        if (typeof fileData === 'string') return fileData;

                        if (typeof fileData === 'object') {
                            if (fileData.driveViewUrl) return fileData.driveViewUrl;
                            if (fileData.drive_view_url) return fileData.drive_view_url;
                            if (fileData.viewUrl) return fileData.viewUrl;
                            if (fileData.fileUrl) return fileData.fileUrl;
                            if (fileData.driveDownloadUrl) return fileData.driveDownloadUrl;
                            if (fileData.downloadUrl) return fileData.downloadUrl;
                            if (fileData.file) return fileData.file;
                            if (fileData.legacyFile) return fileData.legacyFile;
                        }

                        return null;
                    };

                    const hasViewableFile = (fileData) => {
                        if (!fileData) return false;

                        if (typeof fileData === 'object' && fileData.hasFile !== undefined) {
                            return fileData.hasFile === true;
                        }

                        const url = extractFileUrl(fileData);
                        return url !== null && url !== '';
                    };

                    const researchFile = research.length > 0 ? research[0].file : null;
                    const programFileData = research.length > 0 ? research[0].programFile : null;
                    const certificateFileData = research.length > 0 ? research[0].certificateFile : null;
                    const titleCertificateFileData = research.length > 0 ? research[0].titleCertificateFile : null;

                    // ===== DETERMINE IN-HOUSE SOURCE TYPE =====
                    const hasUniversityInhouse = research.some(val => val.inhouse_source !== null && val.inhouse_source !== undefined);
                    const hasLocalInhouse = research.some(val => val.local_inhouse_data !== null && val.local_inhouse_data !== undefined);
                    
                    let inhouseType = 'none';
                    let inhouseTypeLabel = '';
                    let inhouseTypeColor = '';
                    let inhouseTypeIcon = '';
                    let inhouseHeaderBadge = null;
                    
                    if (hasUniversityInhouse) {
                        inhouseType = 'university';
                        inhouseTypeLabel = 'University In-House Review';
                        inhouseTypeColor = '#1976D2';
                        inhouseTypeIcon = 'fa-solid fa-university';
                        inhouseHeaderBadge = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                marginBottom: '16px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '10px',
                                border: '1px solid #bbdefb',
                                justifyContent: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-university' },
                                    style: { color: '#1976D2', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'University In-House Review',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#1565C0'
                                    }
                                })
                            ]
                        });
                    } else if (hasLocalInhouse) {
                        inhouseType = 'local';
                        inhouseTypeLabel = 'Local In-House Review';
                        inhouseTypeColor = '#4caf50';
                        inhouseTypeIcon = 'fa-solid fa-building';
                        inhouseHeaderBadge = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                marginBottom: '16px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '10px',
                                border: '1px solid #c8e6c9',
                                justifyContent: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building' },
                                    style: { color: '#2e7d32', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Local In-House Review',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#1b5e20'
                                    }
                                })
                            ]
                        });
                    }

                    const actionButton = ({ icon, label, onClick, color, description, disabled = false }) => {
                        return $({
                            tag: 'div',
                            style: {
                                marginBottom: '24px',
                                opacity: disabled ? '0.5' : '1',
                                pointerEvents: disabled ? 'none' : 'auto'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '12px',
                                        paddingBottom: '12px',
                                        borderBottom: '1px solid #e9ecef'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: icon },
                                            style: { fontSize: '18px', color: color }
                                        }),
                                        $({
                                            tag: 'h4',
                                            text: label,
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#1a1a2e',
                                                margin: '0'
                                            }
                                        }),
                                        ...(disabled ? [
                                            $({
                                                tag: 'span',
                                                text: '(No file)',
                                                style: {
                                                    fontFamily: 'Inter, sans-serif',
                                                    fontSize: '11px',
                                                    color: '#dc3545',
                                                    fontWeight: '400'
                                                }
                                            })
                                        ] : [])
                                    ]
                                }),
                                $({
                                    tag: 'p',
                                    text: description,
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        margin: '0 0 16px 0',
                                        lineHeight: '1.5'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        width: '100%',
                                        padding: '12px 20px',
                                        backgroundColor: '#ffffff',
                                        border: `1px solid ${color}`,
                                        borderRadius: '10px',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: disabled ? '#adb5bd' : color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({ tag: 'span', att: { className: disabled ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye' }, style: { fontSize: '14px' } }),
                                        $({ tag: 'span', text: disabled ? `${label} Unavailable` : `View ${label}` })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: disabled ? () => alert(`${label} file is not available.`) : onClick
                                    },
                                    mouseenter: !disabled ? (e) => {
                                        e.target.style.backgroundColor = `${color}10`;
                                        e.target.style.transform = 'translateY(-2px)';
                                    } : null,
                                    mouseleave: !disabled ? (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.transform = 'translateY(0)';
                                    } : null
                                })
                            ]
                        })
                    };

                    // ===== LOCAL IN-HOUSE ATTACHMENTS SECTION =====
                    const LocalInhouseAttachments = () => {
                        const hasProgram = hasViewableFile(programFileData);
                        const hasCertificate = hasViewableFile(certificateFileData);
                        
                        // Only show if there's at least one file
                        if (!hasProgram && !hasCertificate) return null;
                        
                        return $({
                            tag: 'div',
                            style: {
                                marginTop: '8px',
                                marginBottom: '16px',
                                padding: '16px',
                                backgroundColor: '#f1f8e9',
                                borderRadius: '12px',
                                border: '1px solid #c8e6c9'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '12px',
                                        paddingBottom: '8px',
                                        borderBottom: '1px solid #c8e6c9'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-paperclip' },
                                            style: { color: '#2e7d32', fontSize: '14px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Local In-House Attachments',
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#1b5e20'
                                            }
                                        })
                                    ]
                                }),
                                ...(hasProgram ? [actionButton({
                                    icon: 'fa-solid fa-file-alt',
                                    label: isExtension ? 'Local Program File' : 'Program File',
                                    description: isExtension
                                        ? 'The local program document associated with this extension submission.'
                                        : 'The program file document associated with this research submission.',
                                    onClick: () => openFileInModal(programFileData, titleEntry || research[0]?.title || 'Program File', isExtension ? 'Local Program File' : 'Program File'),
                                    color: '#fd7e14',
                                    disabled: !hasProgram
                                })] : []),
                                ...(hasCertificate ? [actionButton({
                                    icon: 'fa-solid fa-certificate',
                                    label: isExtension ? 'Local Certificate File' : 'Certificate File',
                                    description: isExtension
                                        ? 'The certificate document associated with this extension submission.'
                                        : 'The certificate document associated with this research submission.',
                                    onClick: () => openFileInModal(certificateFileData, titleEntry || research[0]?.title || 'Certificate File', isExtension ? 'Local Certificate File' : 'Certificate File'),
                                    color: '#28a745',
                                    disabled: !hasCertificate
                                })] : [])
                            ]
                        });
                    };

                    let researchLabel = '';
                    let researchDescription = '';
                    let researchColor = '#0d6efd';
                    let researchIcon = 'fa-solid fa-file-pdf';

                    if (isExtension) {
                        if (isSymposium) {
                            researchLabel = 'Extension Paper';
                            researchDescription = 'The extension paper document submitted for review and evaluation at the symposium.';
                        } else if (isInHouse) {
                            researchLabel = 'Extension Proposal';
                            researchDescription = 'The extension proposal document submitted for in-house review and feedback.';
                        } else {
                            researchLabel = 'Extension Document';
                            researchDescription = 'The complete extension document submitted for review and evaluation.';
                        }
                    } else {
                        if (isSymposium) {
                            researchLabel = 'Research Paper';
                            researchDescription = 'The complete research paper submitted for review and evaluation at the symposium.';
                        } else if (isInHouse) {
                            researchLabel = 'Research Proposal';
                            researchDescription = 'The research proposal document submitted for in-house review and feedback.';
                        } else {
                            researchLabel = 'Research Document';
                            researchDescription = 'The research document submitted for review and evaluation.';
                        }
                    }

                    const endorsementDescription = 'The faculty endorsement letter confirming the validity of this research submission and recommending it for review.';

                    const hasResearchFile = hasViewableFile(researchFile);
                    const hasProgramFile = hasViewableFile(programFileData);
                    const hasCertificateFile = hasViewableFile(certificateFileData);
                    const hasTitleCertificateFile = hasViewableFile(titleCertificateFileData);
                    const hasEndorsementFile = hasViewableFile(file);

                    return $({
                        tag: 'div',
                        style: {
                            width: '30%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            borderLeft: '1px solid #e9ecef',
                            overflowY: 'auto'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    padding: '24px 20px'
                                },
                                child: [
                                    // In-house type indicator header
                                    ...(inhouseHeaderBadge ? [inhouseHeaderBadge] : []),
                                    
                                    // Endorsement Letter
                                    actionButton({
                                        icon: 'fa-regular fa-file-pdf',
                                        label: 'Endorsement Letter',
                                        description: endorsementDescription,
                                        onClick: () => openFileInModal(file, titleEntry || research[0]?.title || 'Document', 'Endorsement Letter'),
                                        color: '#0d6efd',
                                        disabled: !hasEndorsementFile
                                    }),
                                    
                                    // Research Paper (no badge)
                                    actionButton({
                                        icon: researchIcon,
                                        label: researchLabel,
                                        description: researchDescription,
                                        onClick: () => {
                                            if (hasResearchFile) {
                                                openFileInModal(researchFile, titleEntry || research[0]?.title || 'Document', researchLabel);
                                            } else {
                                                alert(`${researchLabel} file is not available.`);
                                            }
                                        },
                                        color: researchColor,
                                        disabled: !hasResearchFile
                                    }),
                                    
                                    // LOCAL IN-HOUSE ATTACHMENTS SECTION (only for local in-house)
                                    ...(hasLocalInhouse ? [LocalInhouseAttachments()] : []),
                                    
                                    // Title Certificate of Change (show always, outside local attachments)
                                    ...(titleCertificateFileData ? [actionButton({
                                        icon: 'fa-solid fa-file-pen',
                                        label: 'Title Certificate of Change',
                                        description: 'The certificate document confirming the title change approval for this research submission.',
                                        onClick: () => openFileInModal(titleCertificateFileData, titleEntry || research[0]?.title || 'Document', 'Title Certificate of Change'),
                                        color: '#9c27b0',
                                        disabled: !hasTitleCertificateFile
                                    })] : [])
                                ]
                            })
                        ]
                    });
                };

                CustomModal({
                    title: `Document Review - ${eventType}`,
                    size: 'full',
                    content: ({ closeModal }) => {
                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '70vh',
                                display: 'flex',
                                backgroundColor: '#ffffff'
                            },
                            child: [
                                DetailsPanel(),
                                RightPanel()
                            ]
                        })
                    },
                    showCloseButton: true,
                    closeOnOverlayClick: true
                });
            }

            const icon = $({
                tag: 'div',
                att: { className: 'fa-solid fa-chalkboard-user' },
                style: {
                    fontSize: '28px',
                    margin: 'auto',
                    color: '#dc3545',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff5f5',
                    borderRadius: '12px'
                }
            })

            const leftBox = () => {
                const details = (label, data) => $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        marginBottom: '8px',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: `${label}:`,
                            style: {
                                color: '#6c757d',
                                fontWeight: '500',
                                minWidth: '100px'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: data || 'N/A',
                            style: {
                                color: '#2c3e50',
                                flex: '1'
                            }
                        })
                    ]
                })

                let [datePart, timePart] = (date || '').split(' ')
                let timeFormat = timePart ? TimeConvert(timePart.split(":")) : 'N/A'

                const locationLabel = isExtension ? 'Campus' : 'Center'
                const locationValue = isExtension ? (campus || 'N/A') : (research.length > 0 ? research[0].center : center || 'N/A')
                // Determine title label based on source
                const titleLabel = isNewTitle ? 'New Title' : 'Title';
                const titleDisplay = (titleEntry || 'N/A')?.substring(0, 60) + ((titleEntry || '').length > 60 ? '...' : '');

                const detailItems = [
                    details(titleLabel, titleDisplay),
                    details("Sender", sender),
                    details("Category", category),
                    ...(locationValue && locationValue !== 'N/A' && locationValue !== '' ? [details(locationLabel, locationValue)] : []),
                    ...(fundsource && fundsource !== '' && fundsource !== 'N/A' ? [details("Fund Source", fundsource)] : []),
                    details("Event Type", eventType),
                    details("Sender Email", smail),
                    details("Date Submitted", `${formatDate(datePart)} at ${timeFormat}`)
                ]

                // ===== ADD IN-HOUSE SOURCE TITLE (NOT PAPER TRAIL NO) =====
                if (inhouseSource && inhouseSource.title) {
                    detailItems.push(
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '4px',
                                padding: '6px 10px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontFamily: 'Inter, sans-serif',
                                borderLeft: '3px solid #1976D2'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-link' },
                                    style: { color: '#1976D2', marginRight: '8px', fontSize: '12px' }
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        color: '#1565C0',
                                        fontWeight: '500',
                                        flex: '1'
                                    },
                                    elementHandler: (el) => {
                                        // Display the in-house title with a label
                                        const titleText = inhouseSource.title || 'N/A';
                                        const truncatedTitle = titleText.length > 45 ? titleText.substring(0, 45) + '...' : titleText;
                                        el.innerHTML = `<span style="color:#6c757d;font-weight:400;">In-House:</span> ${truncatedTitle}`;
                                    }
                                })
                            ]
                        })
                    )
                    // Also add paper trail no as a separate line but with label
                    if (paperTrailNo) {
                        detailItems.push(
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    marginBottom: '4px',
                                    padding: '2px 10px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    color: '#6c757d'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: `Paper Trail: ${paperTrailNo}`,
                                        style: {
                                            color: '#6c757d'
                                        }
                                    })
                                ]
                            })
                        )
                    }
                }

                // ===== ADD LOCAL IN-HOUSE TITLE (NOT PAPER TRAIL NO) =====
                if (localInhouseData && localInhouseData.document_title) {
                    detailItems.push(
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '4px',
                                padding: '6px 10px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontFamily: 'Inter, sans-serif',
                                borderLeft: '3px solid #4caf50'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-lines' },
                                    style: { color: '#4caf50', marginRight: '8px', fontSize: '12px' }
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        color: '#2e7d32',
                                        fontWeight: '500',
                                        flex: '1'
                                    },
                                    elementHandler: (el) => {
                                        const titleText = localInhouseData.document_title || 'N/A';
                                        const truncatedTitle = titleText.length > 45 ? titleText.substring(0, 45) + '...' : titleText;
                                        el.innerHTML = `<span style="color:#6c757d;font-weight:400;">Local:</span> ${truncatedTitle}`;
                                    }
                                })
                            ]
                        })
                    )
                    // Also add local paper trail no if available
                    if (localInhouseData.paper_trail_no) {
                        detailItems.push(
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    marginBottom: '4px',
                                    padding: '2px 10px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    color: '#6c757d'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: `Paper Trail: ${localInhouseData.paper_trail_no}`,
                                        style: {
                                            color: '#6c757d'
                                        }
                                    })
                                ]
                            })
                        )
                    }
                }

                // ===== IF NO SOURCE, SHOW PAPER TRAIL NO ONLY =====
                if (paperTrailNo && !inhouseSource && !localInhouseData) {
                    detailItems.push(
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '4px',
                                padding: '2px 10px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: '#6c757d'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: `Paper Trail: ${paperTrailNo}`,
                                    style: {
                                        color: '#6c757d'
                                    }
                                })
                            ]
                        })
                    )
                }

                return $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        padding: '12px 16px'
                    },
                    child: detailItems
                })
            }

            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    marginBottom: '12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                },
                att: { className: 'endorseIncoming' },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            padding: '16px',
                            gap: '16px',
                            alignItems: 'center'
                        },
                        child: [
                            icon,
                            leftBox(),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-chevron-right' },
                                        style: { fontSize: '14px', color: '#adb5bd' }
                                    })
                                ]
                            })
                        ]
                    })
                ],
                event: {
                    type: 'click',
                    method: () => viewDocs(),
                    mouseenter: (e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    mouseleave: (e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            })
        }

        // Student Research Document
        const docsStudent = ({ id, title, author, coauthor, presenter, category, campus, event, paper_type, created_at, sender_type, sender_email, research_file, endorsement_file }) => {

            const formatDate = (dateStr) => {
                if (!dateStr) return 'N/A';
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            };

            const formatDateTime = (dateStr) => {
                if (!dateStr) return 'N/A';
                let [datePart, timePart] = dateStr.split(' ');
                let timeFormat = TimeConvert(timePart ? timePart.split(":") : "00:00:00".split(":"));
                return formatDate(datePart) + " at " + timeFormat;
            };

            const openFileInModal = (fileData, title, fileType) => {
                let fileUrl = '';

                if (typeof fileData === 'object' && fileData !== null) {
                    fileUrl = fileData.drive_view_url || fileData.viewUrl || fileData.fileUrl || fileData.file || fileData.legacyFile || '';
                } else if (typeof fileData === 'string') {
                    fileUrl = fileData;
                }

                if (!fileUrl) {
                    alert(`No ${fileType} file available`);
                    return;
                }

                const createViewerContent = () => {
                    const container = $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '100%',
                            minHeight: '500px',
                            position: 'relative'
                        }
                    });

                    const isGoogleDriveUrl = fileUrl && typeof fileUrl === 'string' && (fileUrl.includes('drive.google.com') || fileUrl.includes('/d/'));

                    if (isGoogleDriveUrl) {
                        let fileId = null;
                        const patterns = [
                            /\/d\/([a-zA-Z0-9_-]+)/,
                            /id=([a-zA-Z0-9_-]+)/,
                            /open\?id=([a-zA-Z0-9_-]+)/,
                            /\/file\/d\/([a-zA-Z0-9_-]+)/,
                            /([a-zA-Z0-9_-]{25,})/
                        ];

                        for (let pattern of patterns) {
                            const match = fileUrl.match(pattern);
                            if (match && match[1]) {
                                fileId = match[1];
                                break;
                            }
                        }

                        if (fileId) {
                            fileId = fileId.split('?')[0].split('&')[0];
                            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

                            const loadingIndicator = $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    zIndex: 10
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-spinner fa-pulse' },
                                        style: { fontSize: '32px', color: '#0d6efd', marginBottom: '12px', display: 'block' }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Loading ${fileType}...`,
                                        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6c757d' }
                                    })
                                ]
                            });
                            container.appendChild(loadingIndicator);

                            const iframe = document.createElement('iframe');
                            iframe.src = embedUrl;
                            iframe.style.width = '100%';
                            iframe.style.height = '100%';
                            iframe.style.border = 'none';
                            iframe.style.position = 'absolute';
                            iframe.style.top = '0';
                            iframe.style.left = '0';
                            iframe.allow = 'autoplay; fullscreen';
                            iframe.allowFullscreen = true;

                            iframe.onload = () => loadingIndicator.remove();
                            iframe.onerror = () => {
                                loadingIndicator.remove();
                                container.innerHTML = `
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                        <span class="fa-solid fa-circle-exclamation" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                        <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load ${fileType}</h3>
                                        <a href="${fileUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Open in Google Drive</a>
                                    </div>
                                `;
                            };

                            container.appendChild(iframe);
                        } else {
                            container.innerHTML = `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                    <span class="fa-solid fa-link-slash" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                    <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Invalid Google Drive URL</h3>
                                    <p style="font-family: Inter, sans-serif; color: #6c757d;">Could not extract file ID from the URL.</p>
                                </div>
                            `;
                        }
                    } else if (fileUrl && typeof fileUrl === 'string' && (fileUrl.endsWith('.pdf') || fileUrl.includes('/uploads/'))) {
                        const objectEl = $({
                            tag: 'object',
                            att: {
                                data: fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl,
                                type: 'application/pdf'
                            },
                            style: {
                                width: '100%',
                                height: '100%',
                                minHeight: '500px',
                                border: 'none',
                                borderRadius: '8px'
                            },
                            elementHandler: (obj) => {
                                obj.onerror = () => {
                                    obj.innerHTML = `
                                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                            <span class="fa-solid fa-file-pdf" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                            <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load PDF</h3>
                                            <a href="${fileUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Download PDF</a>
                                        </div>
                                    `;
                                };
                            }
                        });
                        container.appendChild(objectEl);
                    } else {
                        container.innerHTML = `
                            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px;">
                                <span class="fa-solid fa-link-slash" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">No valid file available</h3>
                                <p style="font-family: Inter, sans-serif; color: #6c757d;">The ${fileType} file could not be found.</p>
                            </div>
                        `;
                    }

                    return container;
                };

                CustomModal({
                    title: `${fileType} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`,
                    size: 'large',
                    content: createViewerContent,
                    showCloseButton: true,
                    closeOnOverlayClick: true
                });
            };

            const viewStudentDocs = () => {
                // Details Panel (Left side - 70%)
                const DetailsPanel = () => {
                const researchBot = ({ dataURLResearch, title, titleLabel, category, author, coAuthor, presenter, center, campus, programFile, certificateFile, titleCertificateFile, inhouseSource, localInhouseData, paperTrailNo, fundsource }) => {
                    const labelDetails = (label, data, highlight = false) => {
                        return $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: highlight ? '#fff3cd' : '#f8f9fa',
                                borderRadius: '8px',
                                border: highlight ? '1px solid #ffc107' : 'none'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: `${label}:`,
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: highlight ? '#856404' : '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: data || 'N/A',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        color: highlight ? '#856404' : '#2c3e50',
                                        fontSize: '13px',
                                        flex: '1'
                                    }
                                })
                            ]
                        });
                    }

                    const CoAuthorList = () => {
                        let coauthors = []
                        try {
                            if (coAuthor && coAuthor !== '[]' && coauthor !== 'null') {  // FIX: use coauthor variable, not coAuthor
                                coauthors = JSON.parse(coAuthor)
                            }
                        } catch (e) {
                            coauthors = []
                        }

                        if (coauthors.length === 0) return null

                        return $({
                            tag: 'div',
                            style: {
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Co-Authors:',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px',
                                        display: 'block',
                                        marginBottom: '8px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: { marginLeft: '120px' },
                                    elementHandler: (el) => {
                                        coauthors.forEach(val => {
                                            el.appendChild($({
                                                tag: 'div',
                                                text: `• ${val}`,
                                                style: {
                                                    fontFamily: 'Inter, sans-serif',
                                                    color: '#2c3e50',
                                                    fontSize: '13px',
                                                    marginBottom: '4px'
                                                }
                                            }))
                                        })
                                    }
                                })
                            ]
                        })
                    }

                    const isResearchExtension = !center || center === '' || center === 'Extension (Extension)' || center === 'Extension'
                    const locationLabel = isResearchExtension ? 'Campus' : 'Center'
                    const locationValue = isResearchExtension ? (campus || 'N/A') : (center || 'N/A')

                    // Build research details array - filter out null values
                    const researchDetails = [
                        labelDetails(titleLabel || "Title", title),
                        labelDetails("Author", author),
                        CoAuthorList(),
                        labelDetails("Presenter", presenter),
                        (locationValue && locationValue !== 'N/A' && locationValue !== '') ? labelDetails(locationLabel, locationValue) : null,
                        labelDetails("Category", category),
                        (fundsource && fundsource !== '' && fundsource !== 'N/A') ? labelDetails("Fund Source", fundsource) : null
                    ].filter(item => item !== null);

                        // If this is a symposium submission with in-house source, add the source info
                        if (inhouseSource) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #1976D2'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-link' },
                                                    style: { color: '#1976D2', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Source University In-House Review:',
                                                    style: {
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontWeight: '600',
                                                        color: '#1976D2',
                                                        fontSize: '13px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: paperTrailNo || 'N/A',
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
                                                        color: '#1976D2',
                                                        backgroundColor: '#bbdefb',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px'
                                                    }
                                                })
                                            ]
                                        }),
                                        labelDetails("In-House Title", inhouseSource.title || 'N/A', true),
                                        labelDetails("In-House Event", inhouseSource.event || inhouseSource.event_name || 'N/A', true),
                                        labelDetails("In-House Author", inhouseSource.author || 'N/A', true)
                                    ]
                                })
                            )
                        }

                        // If this is a local in-house submission, show local data
                        if (localInhouseData) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #4caf50'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-file-lines' },
                                                    style: { color: '#4caf50', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Source Local In-House Review:',
                                                    style: {
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontWeight: '600',
                                                        color: '#4caf50',
                                                        fontSize: '13px'
                                                    }
                                                }),
                                                ...(localInhouseData.paper_trail_no ? [
                                                    $({
                                                        tag: 'span',
                                                        text: localInhouseData.paper_trail_no,
                                                        style: {
                                                            fontFamily: 'monospace',
                                                            fontSize: '12px',
                                                            color: '#4caf50',
                                                            backgroundColor: '#c8e6c9',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px'
                                                        }
                                                    })
                                                ] : [])
                                            ]
                                        }),
                                        labelDetails("Document Title", localInhouseData.document_title || 'N/A', true),
                                        labelDetails("Local Event", localInhouseData.local_eventname || 'N/A', true),
                                        labelDetails("Main Author", localInhouseData.main_author || 'N/A', true),
                                        labelDetails("Campus", localInhouseData.campus || 'N/A', true),
                                        labelDetails("Category", localInhouseData.category || 'N/A', true)
                                    ]
                                })
                            )
                        }

                        // Add paper trail number display
                        if (paperTrailNo && !inhouseSource && !localInhouseData) {
                            researchDetails.push(
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '8px',
                                        padding: '4px 12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: 'Paper Trail No: ',
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: '500',
                                                color: '#6c757d',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: paperTrailNo,
                                            style: {
                                                fontFamily: 'monospace',
                                                fontSize: '12px',
                                                color: '#2c3e50'
                                            }
                                        })
                                    ]
                                })
                            )
                        }

                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '20px',
                                marginBottom: '16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                            },
                            child: researchDetails
                        })
                    }
                    const labelDetails = (label, data) => {
                        return $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: `${label}:`,
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: data || 'N/A',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        color: '#2c3e50',
                                        fontSize: '13px',
                                        flex: '1'
                                    }
                                })
                            ]
                        });
                    }

                    const CoAuthorList = () => {
                        let coauthors = []
                        try {
                            if (coauthor && coauthor !== '[]' && coauthor !== 'null') {
                                coauthors = JSON.parse(coauthor)
                            }
                        } catch (e) {
                            coauthors = []
                        }

                        if (coauthors.length === 0) return null

                        return $({
                            tag: 'div',
                            style: {
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Co-Authors:',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '600',
                                        color: '#0d6efd',
                                        fontSize: '13px',
                                        minWidth: '120px',
                                        display: 'block',
                                        marginBottom: '8px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: { marginLeft: '120px' },
                                    elementHandler: (el) => {
                                        coauthors.forEach(val => {
                                            el.appendChild($({
                                                tag: 'div',
                                                text: `• ${val}`,
                                                style: {
                                                    fontFamily: 'Inter, sans-serif',
                                                    color: '#2c3e50',
                                                    fontSize: '13px',
                                                    marginBottom: '4px'
                                                }
                                            }))
                                        })
                                    }
                                })
                            ]
                        })
                    }

                    const Button = ({ Label, Event, isAccept = false }) => {
                        const colors = isAccept
                            ? { bg: '#28a745', hover: '#218838' }
                            : { bg: '#dc3545', hover: '#c82333' }

                        return $({
                            tag: 'button',
                            style: {
                                padding: '12px 24px',
                                backgroundColor: colors.bg,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                flex: '1'
                            },
                            text: Label,
                            event: {
                                type: 'click',
                                method: Event
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = colors.hover;
                                e.target.style.transform = 'translateY(-1px)';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = colors.bg;
                                e.target.style.transform = 'translateY(0)';
                            }
                        })
                    }

                    const showRejectModal = () => {
                        let rejectReason = ''

                        const modalContent = ({ closeModal }) => {
                            return $({
                                tag: 'div',
                                style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                                        child: [
                                            $({
                                                tag: 'label',
                                                text: 'Reason for Rejection',
                                                style: {
                                                    color: '#495057',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    fontFamily: 'Inter, sans-serif'
                                                }
                                            }),
                                            $({
                                                tag: 'textarea',
                                                att: { placeholder: 'Please provide a detailed reason for rejecting this document...' },
                                                style: {
                                                    width: '100%',
                                                    minHeight: '150px',
                                                    padding: '12px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '8px',
                                                    color: '#2c3e50',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease'
                                                },
                                                event: {
                                                    type: 'input',
                                                    method: (e) => { rejectReason = e.target.value },
                                                    focus: (e) => { e.target.style.borderColor = '#0d6efd' },
                                                    blur: (e) => { e.target.style.borderColor = '#dee2e6' }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            })
                        }

                        const modalFooter = ({ closeModal }) => {
                            return $({
                                tag: 'div',
                                style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                                child: [
                                    $({
                                        tag: 'button',
                                        text: 'Cancel',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '8px',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            mouseenter: (e) => { e.target.style.backgroundColor = '#f8f9fa' },
                                            mouseleave: (e) => { e.target.style.backgroundColor = '#ffffff' }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Submit Rejection',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#dc3545',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: async () => {
                                                if (!rejectReason.trim()) {
                                                    alert('Please provide a reason for rejection')
                                                    return
                                                }
                                                closeModal()

                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                const req = new Request('/getresearch')
                                                req.Post([
                                                    { name: 'rejectStudentResearch', value: '1' },
                                                    { name: 'paperId', value: id },
                                                    { name: 'reason', value: rejectReason }
                                                ])
                                                req.Json()
                                                req.Send().then(data => {
                                                    loading.remove()
                                                    if (data.status) {
                                                        document.body.appendChild(ConfirmationAlert(data.message, () => window.location.reload()))
                                                    } else {
                                                        alert(data.message)
                                                    }
                                                }).catch(() => loading.remove())
                                            },
                                            mouseenter: (e) => { e.target.style.backgroundColor = '#c82333' },
                                            mouseleave: (e) => { e.target.style.backgroundColor = '#dc3545' }
                                        }
                                    })
                                ]
                            })
                        }

                        CustomModal({
                            title: 'Reject Document',
                            size: 'medium',
                            content: modalContent,
                            footer: modalFooter,
                            closeOnOverlayClick: true
                        })
                    }

                    const Controller = () => {
                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '20px',
                                backgroundColor: '#ffffff',
                                borderTop: '1px solid #e9ecef',
                                display: 'flex',
                                gap: '12px'
                            },
                            child: [
                                Button({
                                    Label: '✓ ACCEPT',
                                    Event: async () => {
                                        if (confirm("Are you sure you want to accept this research paper?")) {
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const req = new Request('/getresearch')
                                            req.Post([
                                                { name: 'acceptStudentResearch', value: '1' },
                                                { name: 'paperId', value: id },
                                                { name: 'campus', value: campus },
                                                { name: 'eventType', value: event }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                loading.remove()
                                                if (data.status) {
                                                    document.body.appendChild(ConfirmationAlert("Research paper accepted successfully!", () => window.location.reload()))
                                                } else {
                                                    alert(data.message || "Failed to accept research paper")
                                                }
                                            }).catch(() => loading.remove())
                                        }
                                    },
                                    isAccept: true
                                }),
                                Button({
                                    Label: '✗ REJECT',
                                    Event: () => {
                                        if (confirm("Are you sure you want to reject this document?")) showRejectModal()
                                    },
                                    isAccept: false
                                })
                            ]
                        })
                    }

                    const getClickBot = (el) => {
                        const holder = $({
                            tag: 'div',
                            style: {
                                flex: '1',
                                overflowY: 'auto',
                                padding: '20px',
                                backgroundColor: '#f8f9fa'
                            }
                        })

                        // Use the document props directly instead of undefined 'research' variable
                        const displayTitle = title;;
                        
                        holder.appendChild(researchBot({
                            dataURLResearch: research_file,
                            title: displayTitle,
                            category: category,
                            author: author,
                            coAuthor: coauthor,
                            presenter: presenter,
                            campus: campus,
                            inhouseSource: null,
                            localInhouseData: null,
                            paperTrailNo: null
                        }))

                        el.appendChild(holder)
                        el.appendChild(Controller())
                    }

                    return $({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #e9ecef'
                        },
                        elementHandler: getClickBot
                    })
                }

                const RightPanel = () => {

                    const extractFileUrl = (fileData) => {
                        if (!fileData) return null;


                        if (typeof fileData === 'string') return fileData;
                        if (typeof fileData === 'object') {
                            if (fileData.driveViewUrl) return fileData.driveViewUrl;
                            if (fileData.drive_view_url) return fileData.drive_view_url;
                            if (fileData.viewUrl) return fileData.viewUrl;
                            if (fileData.fileUrl) return fileData.fileUrl;
                            if (fileData.driveDownloadUrl) return fileData.driveDownloadUrl;
                            if (fileData.downloadUrl) return fileData.downloadUrl;
                            if (fileData.file) return fileData.file;
                            if (fileData.legacyFile) return fileData.legacyFile;
                        }

                        return null;
                    };


                    const hasViewableFile = (fileData) => {
                        if (!fileData) return false;


                        if (typeof fileData === 'object' && fileData.hasFile !== undefined) {
                            return fileData.hasFile === true;
                        }

                        const url = extractFileUrl(fileData);
                        return url !== null && url !== '';
                    };

                    const actionButton = ({ icon, label, onClick, color, description, disabled = false }) => {
                        return $({
                            tag: 'div',
                            style: {
                                marginBottom: '24px',
                                opacity: disabled ? '0.5' : '1',
                                pointerEvents: disabled ? 'none' : 'auto'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '12px',
                                        paddingBottom: '12px',
                                        borderBottom: '1px solid #e9ecef'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: icon },
                                            style: { fontSize: '18px', color: color }
                                        }),
                                        $({
                                            tag: 'h4',
                                            text: label,
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#1a1a2e',
                                                margin: '0'
                                            }
                                        }),
                                        // Add a small indicator if file is missing
                                        ...(disabled ? [
                                            $({
                                                tag: 'span',
                                                text: '(No file)',
                                                style: {
                                                    fontFamily: 'Inter, sans-serif',
                                                    fontSize: '11px',
                                                    color: '#dc3545',
                                                    fontWeight: '400'
                                                }
                                            })
                                        ] : [])
                                    ]
                                }),
                                $({
                                    tag: 'p',
                                    text: description,
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        margin: '0 0 16px 0',
                                        lineHeight: '1.5'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        width: '100%',
                                        padding: '12px 20px',
                                        backgroundColor: '#ffffff',
                                        border: `1px solid ${color}`,
                                        borderRadius: '10px',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: disabled ? '#adb5bd' : color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({ tag: 'span', att: { className: disabled ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye' }, style: { fontSize: '14px' } }),
                                        $({ tag: 'span', text: disabled ? `${label} Unavailable` : `View ${label}` })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: disabled ? () => alert(`${label} file is not available.`) : onClick
                                    },
                                    mouseenter: !disabled ? (e) => {
                                        e.target.style.backgroundColor = `${color}10`;
                                        e.target.style.transform = 'translateY(-2px)';
                                    } : null,
                                    mouseleave: !disabled ? (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.transform = 'translateY(0)';
                                    } : null
                                })
                            ]
                        })
                    };

                    // Check if files exist
                    const hasResearchFile = hasViewableFile(research_file);
                    const hasEndorsementFile = hasViewableFile(endorsement_file);

                    // Endorsement Letter description
                    const endorsementDescription = 'Faculty endorsement letter confirming the validity of this research submission and recommending it for review.';

                    // Research Paper description
                    const researchDescription = 'The complete research paper document submitted for review and evaluation.';

                    return $({
                        tag: 'div',
                        style: {
                            width: '30%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            borderLeft: '1px solid #e9ecef',
                            overflowY: 'auto'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    padding: '24px 20px'
                                },
                                child: [
                                    // Endorsement Letter Button
                                    actionButton({
                                        icon: 'fa-regular fa-file-pdf',
                                        label: 'Endorsement Letter',
                                        description: endorsementDescription,
                                        onClick: () => {
                                            if (hasEndorsementFile) {
                                                openFileInModal(endorsement_file, title, 'Endorsement Letter');
                                            } else {
                                                alert('Endorsement Letter file is not available.');
                                            }
                                        },
                                        color: '#0d6efd',
                                        disabled: !hasEndorsementFile
                                    }),

                                    // Research Paper Button
                                    actionButton({
                                        icon: 'fa-solid fa-file-pdf',
                                        label: 'Research Paper',
                                        description: researchDescription,
                                        onClick: () => {
                                            if (hasResearchFile) {
                                                openFileInModal(research_file, title, 'Research Paper');
                                            } else {
                                                alert('Research Paper file is not available.');
                                            }
                                        },
                                        color: '#28a745',
                                        disabled: !hasResearchFile
                                    })
                                ]
                            })
                        ]
                    });
                }

                // Open modal using CustomModal
                CustomModal({
                    title: `Research Document Review - ${event}`,
                    size: 'full',
                    content: ({ closeModal }) => {
                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '70vh',
                                display: 'flex',
                                backgroundColor: '#ffffff'
                            },
                            child: [
                                DetailsPanel(),
                                RightPanel()
                            ]
                        })
                    },
                    showCloseButton: true,
                    closeOnOverlayClick: true
                });
            };

            const icon = $({
                tag: 'div',
                att: {
                    className: paper_type === 'undergraduate' ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-user-graduate'
                },
                style: {
                    fontSize: '32px',
                    margin: 'auto',
                    color: paper_type === 'undergraduate' ? '#28a745' : '#fd7e14',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: paper_type === 'undergraduate' ? '#e8f5e9' : '#fff3e0',
                    borderRadius: '12px'
                }
            })

            // Left box content for card preview
            const leftBox = () => {
                const details = (label, data) => $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        marginBottom: '8px',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: `${label}:`,
                            style: {
                                color: '#6c757d',
                                fontWeight: '500',
                                minWidth: '100px'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: data || 'N/A',
                            style: {
                                color: '#2c3e50',
                                flex: '1'
                            }
                        })
                    ]
                })

                const detailItems = [
                    details("Title", title.substring(0, 60) + (title.length > 60 ? '...' : '')),
                    details("Sender Type", sender_type),
                    details("Category", category),
                    details("Campus", campus),
                    details("Event Type", event),
                    details("Sender Email", sender_email || 'N/A'),
                    details("Date Submitted", formatDate(created_at))
                ]

                return $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        padding: '12px 16px'
                    },
                    child: detailItems
                })
            }

            // Main card return
            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    marginBottom: '12px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    overflow: 'hidden'
                },
                att: { className: 'studentResearchItem' },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            padding: '16px',
                            gap: '16px',
                            alignItems: 'center'
                        },
                        child: [
                            icon,
                            leftBox(),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-chevron-right' },
                                        style: { fontSize: '14px', color: '#adb5bd' }
                                    })
                                ]
                            })
                        ]
                    })
                ],
                event: {
                    type: 'click',
                    method: () => viewStudentDocs(),
                    mouseenter: (e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    mouseleave: (e) => {
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            })
        }

        const bodyPanel = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '98%',
                    margin: '1vh auto auto',
                    height: '80%',
                    backgroundColor: 'rgba(10,10,10,0.3)',
                    overflowY: 'auto',
                    boxShadow: 'inset .3vw .3vw 2vh .5vh black',
                    borderRadius: '12px'
                },
                elementHandler: async (el) => {
                    bodyContent = el
                    loadContent()
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '49.9%',
                height: '100%',
                backgroundColor: '#ffffff',
                margin: 'auto',
                marginLeft: '0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e9ecef'
            },
            child: [
                label,
                createTabs(),
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 20px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                        gap: '16px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        search,
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#ffffff',
                                borderRadius: '10px',
                                border: '1px solid #e9ecef',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-regular fa-clock' },
                                    style: { fontSize: '14px', color: '#0d6efd' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Pending submission(s):',
                                    style: {
                                        fontSize: '13px',
                                        fontFamily: 'Inter, sans-serif',
                                        color: '#495057',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        color: '#0d6efd',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        marginLeft: '4px',
                                        backgroundColor: '#e7f1ff',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        minWidth: '30px',
                                        textAlign: 'center'
                                    },
                                    elementHandler: (el) => {
                                        docQue = el
                                    },
                                    text: '0'
                                })
                            ]
                        })
                    ]
                }),
                bodyPanel()
            ]
        }))
    }

    const ScoreSummary = () => {
        let Anchor, EventName
        const safePath = (index) => {
            const path = Path(index);
            return path && path !== 'undefined' ? path : null;
        };

        function ChangeId(eventId, eventName) {
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const scoreSummaryIndex = pathParts.indexOf('scoreSummary');

            if (scoreSummaryIndex !== -1) {
                pathParts[scoreSummaryIndex + 1] = eventId;
                if (pathParts.length > scoreSummaryIndex + 2) {
                    pathParts.splice(scoreSummaryIndex + 2, pathParts.length - (scoreSummaryIndex + 2));
                }
                window.location.href = pathParts.join('/');
            } else {
                window.location.href = `/rdeOffice/research/scoreSummary/${eventId}`;
            }
        }

        const Top = () => {
            const FilterEvent = () => {
                return $({
                    tag: 'div',
                    style: {
                        margin: 'auto',
                        marginRight: '0',
                        marginLeft: 'auto',
                        width: 'fit-content',
                        height: 'fit-content',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 14px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#6c757d',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-rotate' },
                                    style: { fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Refresh',
                                    style: { fontSize: '13px', fontFamily: 'Inter, sans-serif' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    const currentPath = window.location.pathname;
                                    window.location.href = currentPath;
                                }
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#e9ecef';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                            }
                        }),
                        $({
                            tag: 'select',
                            style: {
                                width: '220px',
                                height: '40px',
                                fontSize: '13px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '8px',
                                color: '#2c3e50',
                                outline: 'none',
                                padding: '0 12px',
                                fontFamily: 'Inter, sans-serif',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                appearance: 'auto'
                            },
                            event: {
                                type: 'change',
                                method: (ev) => {
                                    const eventId = ev.target.value;
                                    if (eventId && eventId !== 'Select Event') {
                                        const currentPath = window.location.pathname;
                                        const pathParts = currentPath.split('/');

                                        if (pathParts.includes('scoreSummary')) {
                                            pathParts[4] = eventId;
                                            if (pathParts.length > 5) {
                                                pathParts.splice(5, pathParts.length - 5);
                                            }
                                            window.location.href = pathParts.join('/');
                                        } else {
                                            window.location.href = `/rdeOffice/research/scoreSummary/${eventId}`;
                                        }
                                    }
                                },
                                focus: (e) => {
                                    e.target.style.borderColor = '#0d6efd';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                                },
                                blur: (e) => {
                                    e.target.style.borderColor = '#e9ecef';
                                    e.target.style.boxShadow = 'none';
                                }
                            },
                            child: [
                                $({
                                    tag: 'option',
                                    att: {
                                        selected: true,
                                        disabled: true,
                                        value: ''
                                    },
                                    text: 'Select Event',
                                    style: { color: '#adb5bd' }
                                })
                            ],
                            elementHandler: (el) => {
                                const req = new Request('/eventRequest')
                                req.Post([{ name: 'getEventAdmin', value: '1' }])
                                req.Json()
                                req.Send().then(data => {
                                    data.forEach(val => {
                                        const option = $({
                                            tag: 'option',
                                            att: { value: val.id },
                                            text: val.name,
                                            style: {
                                                padding: '8px',
                                                fontFamily: 'Inter, sans-serif'
                                            }
                                        })

                                        const currentPath = window.location.pathname;
                                        const pathParts = currentPath.split('/');
                                        if (pathParts.includes('scoreSummary') && pathParts[4]) {
                                            if (pathParts[4] == val.id) {
                                                option.selected = true;
                                            }
                                        }
                                        el.appendChild(option);
                                    })
                                }).catch(err => {
                                    console.error('Error loading events:', err);
                                })
                            }
                        })
                    ]
                })
            }

            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'fit-content',
                    padding: '16px 24px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #e9ecef',
                    gap: '16px'
                },
                child: [
                    $({
                        tag: 'button',
                        style: {
                            padding: '8px 16px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            color: '#495057'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-arrow-left' },
                                style: { fontSize: '14px' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Back',
                                style: { fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                window.location.href = '/rdeOffice/research/research';
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#e9ecef';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-chart-simple' },
                                style: { fontSize: '20px', color: '#0d6efd' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Score Summary & Ranking',
                                style: {
                                    fontSize: '18px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: '600',
                                    color: '#1a1a2e',
                                    letterSpacing: '-0.3px'
                                }
                            })
                        ]
                    }),
                    FilterEvent()
                ]
            })
        }

        const BodySum = () => {
            let activeTab = null;
            let tabContentContainer = null;
            let tabsContainer = null;
            let selectedCategoryId = null;
            let selectedCategoryName = null;

            const loadTabContent = (categoryId, categoryName) => {
                if (!tabContentContainer) return;

                // Show loading state
                tabContentContainer.innerHTML = '';
                tabContentContainer.appendChild($({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 40px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e9ecef',
                        minHeight: '300px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-spinner fa-pulse' },
                            style: {
                                fontSize: '40px',
                                color: '#0d6efd',
                                marginBottom: '16px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: `Loading scores for ${categoryName}...`,
                            style: {
                                fontSize: '15px',
                                color: '#6c757d',
                                fontFamily: 'Inter, sans-serif'
                            }
                        })
                    ]
                }));

                // Fetch data for the selected category
                const request = new Request('/ranking')
                request.Post([
                    { name: 'getEval', value: '1' },
                    { name: 'eventId', value: Path(4) ? parseInt(Path(4)) : 0 },
                    { name: 'categoryId', value: categoryId }
                ])
                request.Json()
                request.Send().then((data) => {
                    tabContentContainer.innerHTML = '';

                    if (!data || !Array.isArray(data) || data.length === 0) {
                        tabContentContainer.appendChild($({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 40px',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                border: '1px solid #e9ecef',
                                minHeight: '300px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-circle-exclamation' },
                                    style: {
                                        fontSize: '56px',
                                        color: '#ced4da',
                                        marginBottom: '20px'
                                    }
                                }),
                                $({
                                    tag: 'h3',
                                    text: 'No Scored Documents Yet',
                                    style: {
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        color: '#2c3e50',
                                        marginBottom: '10px',
                                        fontFamily: 'Inter, sans-serif'
                                    }
                                }),
                                $({
                                    tag: 'p',
                                    text: 'There are no evaluated documents for this category/center. Scores will appear here once evaluators have completed their assessments.',
                                    style: {
                                        fontSize: '15px',
                                        color: '#6c757d',
                                        maxWidth: '520px',
                                        textAlign: 'center',
                                        lineHeight: '1.7',
                                        fontFamily: 'Inter, sans-serif'
                                    }
                                })
                            ]
                        }));
                        return;
                    }

                    let Titles = [];
                    let docSet = [];
                    let allDocs = [];

                    // Create a container for all content
                    const contentWrapper = $({
                        tag: 'div',
                        style: {
                            width: '100%'
                        }
                    });

                    // Add category header
                    contentWrapper.appendChild($({
                        tag: 'div',
                        style: {
                            padding: '16px 20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid #e9ecef'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: `Showing scores for: `,
                                style: {
                                    fontSize: '14px',
                                    color: '#6c757d',
                                    fontFamily: 'Inter, sans-serif'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: categoryName,
                                style: {
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#0d6efd',
                                    fontFamily: 'Inter, sans-serif'
                                }
                            })
                        ]
                    }));

                    // Process and display each evaluator's scores
                    data.forEach(val => {
                        if (val.docs && val.docs.length > 0) {
                            const Order = val.docs.sort((a, b) => {
                                const scoreA = parseFloat(a.TotalScore) || 0;
                                const scoreB = parseFloat(b.TotalScore) || 0;
                                return scoreB - scoreA;
                            });
                            let SortCrit = RankPerCriteria(Order, val.evaluator.fullname);
                            Titles.push(SortCrit);

                            Order.forEach(doc => {
                                if (doc.file && doc.file.id) {
                                    const existingDoc = allDocs.find(d => d.docId === doc.file.id);
                                    if (!existingDoc) {
                                        allDocs.push({
                                            docId: doc.file.id,
                                            title: doc.file.title,
                                            author: doc.file.author,
                                            campus: doc.file.campus,
                                            category: doc.file.category,
                                            center: doc.file.center
                                        });
                                    }
                                    docSet.push({
                                        docId: doc.file.id,
                                        title: doc.file.title,
                                        author: doc.file.author,
                                        campus: doc.file.campus,
                                        totalScore: doc.TotalScore,
                                        evaluatorName: val.evaluator.fullname
                                    });
                                }
                            });

                            // Display this evaluator's scores
                            contentWrapper.appendChild(RankDocs({
                                evalName: val.evaluator.fullname,
                                docList: Order
                            }));
                        }
                    });

                    // Calculate and display overall ranking if there are documents
                    if (allDocs.length > 0) {
                        const docAverages = allDocs.map(doc => {
                            const docScores = docSet.filter(d => d.docId === doc.docId);
                            const totalScore = docScores.reduce((sum, d) => sum + (parseFloat(d.totalScore) || 0), 0);
                            const averageScore = docScores.length > 0 ? totalScore / docScores.length : 0;

                            return {
                                ...doc,
                                averageScore: averageScore,
                                totalEvaluators: docScores.length
                            };
                        });

                        const rankedByScore = docAverages
                            .sort((a, b) => b.averageScore - a.averageScore)
                            .map((doc, index) => ({
                                ...doc,
                                scoreRank: index + 1
                            }));

                        // Add overall ranking summary
                        contentWrapper.appendChild($({
                            tag: 'div',
                            style: {
                                marginTop: '24px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                            },
                            child: [
                                $({
                                    tag: 'h4',
                                    text: '📊 Overall Ranking Summary',
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1a1a2e',
                                        fontFamily: 'Inter, sans-serif',
                                        marginBottom: '12px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '10px'
                                    },
                                    elementHandler: (el) => {
                                        rankedByScore.forEach((doc, index) => {
                                            const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#0d6efd', '#6c757d'];
                                            const color = index < 3 ? rankColors[index] : rankColors[3];
                                            
                                            el.appendChild($({
                                                tag: 'div',
                                                style: {
                                                    padding: '12px 16px',
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e9ecef',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        text: `#${index + 1}`,
                                                        style: {
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: color,
                                                            minWidth: '32px'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'div',
                                                        style: {
                                                            flex: '1'
                                                        },
                                                        child: [
                                                            $({
                                                                tag: 'div',
                                                                text: doc.title || 'Untitled',
                                                                style: {
                                                                    fontSize: '13px',
                                                                    fontWeight: '500',
                                                                    color: '#2c3e50',
                                                                    fontFamily: 'Inter, sans-serif'
                                                                }
                                                            }),
                                                            $({
                                                                tag: 'div',
                                                                style: {
                                                                    display: 'flex',
                                                                    gap: '12px',
                                                                    fontSize: '12px',
                                                                    color: '#6c757d',
                                                                    fontFamily: 'Inter, sans-serif',
                                                                    marginTop: '2px'
                                                                },
                                                                child: [
                                                                    $({
                                                                        tag: 'span',
                                                                        text: `Author: ${doc.author || 'N/A'}`
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        text: `Score: ${doc.averageScore.toFixed(2)}`
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        text: `(${doc.totalEvaluators} evaluator${doc.totalEvaluators > 1 ? 's' : ''})`
                                                                    })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }));
                                        });
                                    }
                                })
                            ]
                        }));

                        // Store report data
                        const FinalRank = rankedByScore.map(doc => ({
                            title: doc,
                            averageScore: doc.averageScore,
                            rankAverage: doc.scoreRank
                        }));

                        const RankAve = FinalRanking(FinalRank);
                        const ScoreRank = ScoreRankAVe(FinalRank);

                        // Store for report generation
                        window._reportData = {
                            scoreRank: ScoreRank,
                            rankAve: RankAve,
                            RankPerCrit: Titles
                        };
                    }

                    tabContentContainer.appendChild(contentWrapper);

                }).catch(error => {
                    console.error('Error fetching ranking data:', error);
                    tabContentContainer.innerHTML = '';
                    tabContentContainer.appendChild($({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 40px',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #f8d7da',
                            minHeight: '300px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-triangle-exclamation' },
                                style: {
                                    fontSize: '56px',
                                    color: '#dc3545',
                                    marginBottom: '16px'
                                }
                            }),
                            $({
                                tag: 'h3',
                                text: 'Error Loading Data',
                                style: {
                                    fontSize: '22px',
                                    fontWeight: '600',
                                    color: '#dc3545',
                                    marginBottom: '8px',
                                    fontFamily: 'Inter, sans-serif'
                                }
                            }),
                            $({
                                tag: 'p',
                                text: 'Failed to load scoring data. Please try again.',
                                style: {
                                    fontSize: '15px',
                                    color: '#6c757d',
                                    maxWidth: '500px',
                                    textAlign: 'center',
                                    lineHeight: '1.7',
                                    fontFamily: 'Inter, sans-serif'
                                }
                            }),
                            $({
                                tag: 'button',
                                text: 'Retry',
                                style: {
                                    marginTop: '20px',
                                    padding: '10px 28px',
                                    backgroundColor: '#0d6efd',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        loadTabContent(categoryId, categoryName);
                                    }
                                }
                            })
                        ]
                    }));
                });
            };

            const LabelEvent = (text, url) => {
                return $({
                    tag: 'div',
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        margin: '0'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                textDecoration: 'none',
                                color: '#2c3e50',
                                padding: '12px 20px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.25s ease',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                minWidth: '160px',
                                height: '44px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                position: 'relative',
                                overflow: 'hidden',
                                gap: '12px',
                                cursor: 'pointer'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: text,
                                    style: {
                                        flex: '1',
                                        textAlign: 'left'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chevron-right' },
                                    style: {
                                        fontSize: '11px',
                                        color: '#adb5bd',
                                        transition: 'all 0.25s ease',
                                        flexShrink: '0'
                                    }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    // Update selected category
                                    selectedCategoryId = url;
                                    selectedCategoryName = text;
                                    
                                    // Update all tab buttons
                                    const allButtons = document.querySelectorAll('.category-tab-btn');
                                    allButtons.forEach(btn => {
                                        const btnUrl = btn.getAttribute('data-url');
                                        if (btnUrl === url) {
                                            btn.style.borderColor = '#0d6efd';
                                            btn.style.backgroundColor = '#f0f7ff';
                                            btn.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.15)';
                                            const arrow = btn.querySelector('.fa-chevron-right');
                                            if (arrow) arrow.style.color = '#0d6efd';
                                        } else {
                                            btn.style.borderColor = '#e9ecef';
                                            btn.style.backgroundColor = '#ffffff';
                                            btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                                            const arrow = btn.querySelector('.fa-chevron-right');
                                            if (arrow) arrow.style.color = '#adb5bd';
                                        }
                                    });

                                    // Update the indicator in the footer
                                    const indicator = document.querySelector('.footer-indicator');
                                    if (indicator && indicator._updateIndicator) {
                                        indicator._updateIndicator();
                                    }

                                    // Load content for the selected tab
                                    loadTabContent(url, text);
                                }
                            },
                            elementHandler: (el) => {
                                el.setAttribute('data-url', url);
                                el.classList.add('category-tab-btn');
                                
                                // Hover effects
                                el.addEventListener('mouseenter', () => {
                                    if (selectedCategoryId !== url) {
                                        el.style.borderColor = '#0d6efd';
                                        el.style.boxShadow = '0 4px 16px rgba(13,110,253,0.12)';
                                        el.style.transform = 'translateY(-2px)';
                                        el.style.backgroundColor = '#f8f9ff';
                                        const arrow = el.querySelector('.fa-chevron-right');
                                        if (arrow) arrow.style.color = '#0d6efd';
                                    }
                                });
                                el.addEventListener('mouseleave', () => {
                                    if (selectedCategoryId !== url) {
                                        el.style.borderColor = '#e9ecef';
                                        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                                        el.style.transform = 'translateY(0)';
                                        el.style.backgroundColor = '#ffffff';
                                        const arrow = el.querySelector('.fa-chevron-right');
                                        if (arrow) arrow.style.color = '#adb5bd';
                                    }
                                });
                            }
                        })
                    ]
                });
            };

            // Update the SummaryPanel to use tabs
            const SummaryPanel = () => {
                let Report;

                const getReportData = () => {
                    // Get the current active tab's data
                    if (selectedCategoryId && window._reportData) {
                        return window._reportData;
                    }
                    return null;
                };

                return $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    child: [
                        // Header with Event Name only
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                backgroundColor: '#ffffff',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #e9ecef',
                                gap: '16px',
                                flexShrink: '0'
                            },
                            elementHandler: (el) => {
                                // Event name header
                                const getEventNameReq = new Request('/score_rank');
                                getEventNameReq.Post([
                                    { name: 'getEventName', value: '1' },
                                    { name: 'eventId', value: Path(4) }
                                ]);
                                getEventNameReq.Json();
                                getEventNameReq.Send().then(eventData => {
                                    const eventName = eventData.length > 0 ? eventData[0].name : 'Unknown Event';
                                    
                                    const headerText = $({
                                        tag: 'div',
                                        style: {
                                            fontSize: '18px',
                                            color: '#1a1a2e',
                                            fontWeight: '600',
                                            fontFamily: 'Inter, sans-serif',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-chart-simple' },
                                                style: { color: '#0d6efd', fontSize: '20px' }
                                            }),
                                            $({
                                                tag: 'span',
                                                text: eventName,
                                                style: { color: '#495057', fontWeight: '400' }
                                            }),
                                            $({
                                                tag: 'span',
                                                style: { color: '#adb5bd' }
                                            }),
                                            $({
                                                tag: 'span',
                                                text: 'Score Summary',
                                                style: { color: '#0d6efd' }
                                            })
                                        ]
                                    });

                                    el.appendChild(headerText);
                                });
                            }
                        }),
                        // Category tabs row
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '16px 24px',
                                backgroundColor: '#ffffff',
                                borderBottom: '1px solid #e9ecef',
                                flexShrink: '0'
                            },
                            elementHandler: (el) => {
                                tabsContainer = el;
                                
                                const container = $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center'
                                    }
                                });

                                const req = new Request('/score_rank');
                                req.Post([
                                    { name: 'scoreRank', value: '1' },
                                    { name: 'getEventId', value: Path(4) + '' }
                                ]);
                                req.Json();
                                req.Send().then(data => {
                                    if (data && data.items && data.items.length > 0) {
                                        // Use categories from the response (not centers)
                                        data.items.forEach(val => {
                                            container.appendChild(LabelEvent(val.name, val.id));
                                        });
                                    } else {
                                        container.appendChild($({
                                            tag: 'div',
                                            text: 'No categories available',
                                            style: {
                                                color: '#6c757d',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                padding: '8px 0'
                                            }
                                        }));
                                    }
                                    el.appendChild(container);
                                }).catch(err => {
                                    console.error('Error loading categories:', err);
                                    el.appendChild($({
                                        tag: 'div',
                                        text: 'Error loading categories',
                                        style: {
                                            color: '#dc3545',
                                            fontSize: '14px',
                                            fontFamily: 'Inter, sans-serif'
                                        }
                                    }));
                                });
                            }
                        }),
                        // Tab content area
                        $({
                            tag: 'div',
                            style: {
                                flex: '1',
                                overflowY: 'auto',
                                padding: '20px 24px',
                                backgroundColor: '#f8f9fa'
                            },
                            elementHandler: (el) => {
                                tabContentContainer = el;
                                // Show initial message
                                tabContentContainer.appendChild($({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '80px 40px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '16px',
                                        border: '1px solid #e9ecef',
                                        minHeight: '300px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-hand-pointer' },
                                            style: {
                                                fontSize: '56px',
                                                color: '#ced4da',
                                                marginBottom: '20px'
                                            }
                                        }),
                                        $({
                                            tag: 'h3',
                                            text: 'Select a Category',
                                            style: {
                                                fontSize: '22px',
                                                fontWeight: '600',
                                                color: '#2c3e50',
                                                marginBottom: '10px',
                                                fontFamily: 'Inter, sans-serif'
                                            }
                                        }),
                                        $({
                                            tag: 'p',
                                            text: 'Click on any category button above to view scores and rankings.',
                                            style: {
                                                fontSize: '15px',
                                                color: '#6c757d',
                                                maxWidth: '400px',
                                                textAlign: 'center',
                                                lineHeight: '1.7',
                                                fontFamily: 'Inter, sans-serif'
                                            }
                                        })
                                    ]
                                }));
                            }
                        }),
                        // Footer with Generate Report button and indicator
                        $({
                            tag: 'div',
                            style: {
                                height: '72px',
                                width: '100%',
                                backgroundColor: '#ffffff',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderTop: '1px solid #e9ecef',
                                padding: '0 24px',
                                flexShrink: '0',
                                gap: '16px'
                            },
                            child: [
                                // Selected tab indicator
                                $({
                                    tag: 'div',
                                    att: { className: 'footer-indicator' },
                                    style: {
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        fontFamily: 'Inter, sans-serif',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    },
                                    elementHandler: (el) => {
                                        // This will be updated when a tab is selected
                                        const updateIndicator = () => {
                                            if (selectedCategoryName) {
                                                el.innerHTML = `
                                                    <span style="color: #0d6efd; font-weight: 500;">Active:</span>
                                                    <span style="background: #e9ecef; padding: 2px 12px; border-radius: 12px; font-size: 12px; color: #2c3e50;">${selectedCategoryName}</span>
                                                `;
                                            } else {
                                                el.innerHTML = `
                                                    <span style="color: #adb5bd;">No category selected</span>
                                                `;
                                            }
                                        };
                                        updateIndicator();
                                        // Store reference for updates
                                        el._updateIndicator = updateIndicator;
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        padding: '12px 32px',
                                        fontSize: '15px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#ffffff',
                                        backgroundColor: '#0d6efd',
                                        fontWeight: '600',
                                        fontFamily: 'Inter, sans-serif',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        boxShadow: '0 2px 8px rgba(13,110,253,0.25)'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-file-pdf' },
                                            style: { fontSize: '16px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Generate Summary Report'
                                        })
                                    ],
                                    elementHandler: (el) => {
                                        Report = el;
                                        el.addEventListener('click', () => {
                                            const reportData = getReportData();
                                            if (reportData && selectedCategoryId) {
                                                // Pass the eventId and categoryId to Summary
                                                const eventId = Path(4) || '';
                                                mainFrame.appendChild(Summary(eventId, selectedCategoryId));
                                            } else if (!selectedCategoryId) {
                                                alert('Please select a category/center first.');
                                            } else {
                                                alert('No scored documents available for the selected category/center.');
                                            }
                                        });
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#0b5ed7';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(13,110,253,0.35)';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#0d6efd';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(13,110,253,0.25)';
                                    }
                                })
                            ]
                        })
                    ]
                });
            };

            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'calc(100% - 72px)',
                    backgroundColor: '#f8f9fa'
                },
                child: [
                    SummaryPanel()
                ]
            });
        }

        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                left: '0',
                top: '0',
                display: (Path(3) === 'scoreSummary') ? 'block' : 'none',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                overflow: 'hidden'
            },
            elementHandler: (el) => {
                setTimeout(() => {
                    const path = Path(3);
                    if (path === undefined) {
                        el.remove()
                    }
                }, 50)
            },
            child: [
                Top(),
                BodySum()
            ]
        })
    }
    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '99%',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        elementHandler: getMainFrame,
        child: [
            Incoming(),
            Forwarded(mainFrame, leftPdiv),
            ScoreSummary()
        ]
    }))
}
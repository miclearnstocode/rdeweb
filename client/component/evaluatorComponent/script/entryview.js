import { $, baseCheck, Request, CustomModal, Toast } from '../../../lib/lib.js'
import { ScoreBoard } from "./score.js";
import { CommentBoard } from "./commentpanel.js";

// Global container for EntryView to prevent multiple instances
let entryViewContainer = null;
let activeModalInstance = null;

export const EntryView = ({ docId, title, eventId, centerId, categoryId, userType }) => {
    let mainPanel, sidePanelScore, sidePanelComment
    let docTitle = title || 'Loading...';
    let currentFileData = null;
    let closeState = null;
    let fileData = null;
    const panelState = {
        comment: false,
        score: false
    }
    const urlParams = new URLSearchParams(window.location.search);
    const urlEventId = urlParams.get('eventId');
    
    // Use the passed eventId or the one from URL
    const finalEventId = eventId || urlEventId;

    // Clean up previous instance if it exists
    const cleanup = () => {
        if (activeModalInstance && activeModalInstance.closeModal) {
            activeModalInstance.closeModal();
            activeModalInstance = null;
        }
        if (entryViewContainer) {
            const existingContainer = document.getElementById('entry-view-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            entryViewContainer = null;
        }
        document.querySelectorAll('.custom-modal-overlay').forEach(el => el.remove());
    };

    // Fetch document title from server - prioritizes final_symposium_title
    const fetchDocTitle = async (docId) => {
        try {
            const form = new FormData();
            form.append('getDocTitle', '1');
            form.append('docId', docId);
            
            const response = await fetch('/uploadResearchFile', {
                method: 'POST',
                body: form
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status && data.title) {
                return data.title;
            }
            return null;
        } catch (error) {
            console.error('Error fetching document title:', error);
            return null;
        }
    };

    function ChangePanel({ name }) {
        if (name === 'comment') {
            panelState.comment = !panelState.comment
            if (panelState.comment) {
                sidePanelComment.className = 'commentboard'
                if (panelState.score) {
                    mainPanel.style.width = '20%'
                } else {
                    mainPanel.style.width = '60%'
                }
            } else {
                sidePanelComment.className = 'commentboardClose'
                if (panelState.score) {
                    mainPanel.style.width = '60%'
                } else {
                    mainPanel.style.width = '100%'
                }
            }
        }
        if (name === 'score') {
            panelState.score = !panelState.score
            if (panelState.score) {
                sidePanelScore.className = 'scoreboard'
                if (panelState.comment) {
                    mainPanel.style.width = '20%'
                } else {
                    mainPanel.style.width = '60%'
                }
            } else {
                sidePanelScore.className = 'scoreboardClose'
                if (panelState.comment) {
                    mainPanel.style.width = '60%'
                } else {
                    mainPanel.style.width = '100%'
                }
            }
        }
    }
    
    const CloseState = ({ base, raw }) => {
        closeState = { base, raw }
    }

    // Show error modal
    const showErrorModal = (errorMessage) => {
        cleanup();
        
        const errorContent = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        color: '#ef4444'
                    },
                    text: '⚠️'
                }),
                $({
                    tag: 'h3',
                    style: {
                        color: '#0f172a',
                        marginBottom: '12px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '20px'
                    },
                    text: 'Error Loading Entry'
                }),
                $({
                    tag: 'p',
                    style: {
                        color: '#64748b',
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        marginBottom: '8px',
                        maxWidth: '500px',
                        lineHeight: '1.6'
                    },
                    text: errorMessage || 'An error occurred while loading this entry. Please try refreshing the page.'
                }),
                $({
                    tag: 'p',
                    style: {
                        color: '#94a3b8',
                        fontSize: '13px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        marginTop: '8px'
                    },
                    text: 'Document ID: ' + docId
                })
            ]
        });

        activeModalInstance = CustomModal({
            title: 'Error',
            content: errorContent,
            size: 'medium',
            closeOnOverlayClick: false,
            footer: ({ closeModal }) => {
                return $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', justifyContent: 'center' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Try Again',
                            style: {
                                padding: '8px 24px',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    closeModal();
                                    activeModalInstance = null;
                                    window.location.reload();
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Go Back',
                            style: {
                                padding: '8px 24px',
                                backgroundColor: '#ef4444',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    closeModal();
                                    activeModalInstance = null;
                                    window.location.replace('/evaluator');
                                }
                            }
                        })
                    ]
                });
            }
        });
    };

    const MainPanel = (fileData) => {
        // Store file data for reference
        fileData = fileData;
        
        // Get the file path
        const file = fileData.data || fileData.local_file || '';
        const isGoogleDrive = file && (file.includes('drive.google.com') || file.includes('/d/'));
        const isPDF = file && file.toLowerCase().includes('.pdf');
        
        let displayContent;

        // If there's a file, display it directly
        if (file) {
            let cleanFile = file;
            
            // For Google Drive files - extract embed URL
            if (isGoogleDrive) {
                let fileId = null;
                const patterns = [
                    /\/d\/([a-zA-Z0-9_-]+)/,
                    /id=([a-zA-Z0-9_-]+)/,
                    /open\?id=([a-zA-Z0-9_-]+)/,
                    /\/file\/d\/([a-zA-Z0-9_-]+)/,
                    /([a-zA-Z0-9_-]{25,})/
                ];
                
                for (let pattern of patterns) {
                    const match = file.match(pattern);
                    if (match && match[1]) {
                        fileId = match[1];
                        break;
                    }
                }
                
                if (!fileId && file.includes('drive.google.com')) {
                    const urlParts = file.split('/');
                    for (let i = 0; i < urlParts.length; i++) {
                        if (urlParts[i] === 'd' && urlParts[i + 1]) {
                            fileId = urlParts[i + 1];
                            break;
                        }
                    }
                }
                
                if (fileId) {
                    fileId = fileId.split('?')[0].split('&')[0];
                    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
                    cleanFile = embedUrl;
                }
            } else {
                // For local files - clean the path
                cleanFile = file.replace(/\.\.\//g, '');
                if (!cleanFile.startsWith('/') && !cleanFile.startsWith('http')) {
                    cleanFile = '/' + cleanFile;
                }
            }
            
            // Display the file directly using iframe or embed
            displayContent = $({
                tag: 'iframe',
                att: {
                    src: cleanFile,
                    frameborder: '0',
                    allowfullscreen: 'true'
                },
                style: {
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc'
                },
                elementHandler: (el) => {
                    mainPanel = el;
                    
                    // Handle load error
                    el.onerror = function() {
                        // Try using embed as fallback
                        const parent = this.parentNode;
                        const embed = document.createElement('embed');
                        embed.src = cleanFile;
                        embed.type = 'application/pdf';
                        embed.style.cssText = 'width:100%;height:100%;border:none;border-radius:8px;';
                        parent.replaceChild(embed, this);
                        mainPanel = embed;
                        
                        embed.onerror = () => {
                            embed.innerHTML = `
                                <div style="
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100%;
                                    text-align: center;
                                    padding: 40px;
                                    background: #f8fafc;
                                ">
                                    <span class="fa-solid fa-file-pdf" style="font-size: 64px; color: #dc3545; margin-bottom: 16px;"></span>
                                    <h3 style="font-family: Inter, sans-serif; color: #1a1a2e; margin-bottom: 8px;">Unable to load document</h3>
                                    <p style="font-family: Inter, sans-serif; color: #6c757d; margin-bottom: 16px;">The document could not be loaded.</p>
                                    <a href="${cleanFile}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px;">Download Document</a>
                                </div>
                            `;
                        };
                    };
                }
            });
        } 
        // No file available
        else {
            displayContent = $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '64px',
                            marginBottom: '16px',
                            color: '#cbd5e1'
                        },
                        text: '📭'
                    }),
                    $({
                        tag: 'h3',
                        style: {
                            color: '#475569',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        },
                        text: 'No File Available'
                    }),
                    $({
                        tag: 'p',
                        style: {
                            color: '#94a3b8',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        },
                        text: 'This document does not have an associated file.'
                    })
                ],
                elementHandler: (el) => {
                    mainPanel = el
                }
            });
        }

        return ($({
            tag: 'div',
            style: {
                width: '90vw',
                height: '85vh',
                backgroundColor: '#ffffff',
                margin: 'auto',
                border: '1px solid #e8ecf1',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                overflowY: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                zIndex: '20'
            },
            child: [
                displayContent,
                $({
                    tag: 'div',
                    att: {
                        className: 'scoreboardClose '
                    },
                    elementHandler: (el) => {
                        sidePanelScore = el
                    },
                    child: [
                        ScoreBoard({
                            resId: docId,
                            eventId: eventId,
                            center: centerId,
                            categoryId: categoryId,
                            userType: userType
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    att: {
                        className: 'commentboardClose'
                    },
                    elementHandler: (el) => {
                        sidePanelComment = el
                    },
                    child: [
                        CommentBoard({
                            title: docTitle,
                            docId: docId,
                            eventId: finalEventId, 
                            closeState: CloseState
                        })
                    ]
                }),
            ]
        }))
    }

    const SideTools = () => {
        let BotComState = false;
        let scoreBotState = false;

        const Close = () => {
            const closeContainer = document.createElement('div');
            closeContainer.style.cssText = `
                width: 80px;
                height: fit-content;
                margin: auto;
                margin-top: 3vh;
                font-size: 24px;
                color: #64748b;
                cursor: pointer;
                border: 1px solid #e2e8f0;
                padding: 8px;
                background-color: #ffffff;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            closeContainer.setAttribute('title', 'Close Entry');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-xmark';
            icon.style.cssText = 'font-size: 28px;';

            const label = document.createElement('div');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Close';

            closeContainer.addEventListener('mouseenter', () => {
                closeContainer.style.borderColor = '#ef4444';
                closeContainer.style.boxShadow = '0 4px 12px rgba(239,68,68,0.15)';
                closeContainer.querySelector('span').style.color = '#ef4444';
                closeContainer.querySelector('div:last-child').style.color = '#ef4444';
            });
            closeContainer.addEventListener('mouseleave', () => {
                closeContainer.style.borderColor = '#e2e8f0';
                closeContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                closeContainer.querySelector('span').style.color = '#64748b';
                closeContainer.querySelector('div:last-child').style.color = '#64748b';
            });

            closeContainer.addEventListener('click', () => {
                let saveState = true;
                if (closeState && baseCheck(closeState.base, closeState.raw)) {
                    saveState = confirm("Do you want to exit without saving your data?")
                }
                if (saveState) {
                    cleanup();
                    window.location.replace('/evaluator')
                }
            });

            closeContainer.appendChild(icon);
            closeContainer.appendChild(label);

            return closeContainer;
        }

        const Comment = () => {
            const commentContainer = document.createElement('div');
            commentContainer.style.cssText = `
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                color: #64748b;
                outline: none;
                font-size: 24px;
                text-align: center;
                width: 80px;
                height: auto;
                border-radius: 10px;
                margin-top: 2vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            commentContainer.setAttribute('title', 'Open/Close Comments Panel');
            commentContainer.setAttribute('name', 'comment');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-comment';
            icon.style.cssText = 'font-size: 26px;';

            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Comments';

            commentContainer.addEventListener('mouseenter', () => {
                commentContainer.style.borderColor = '#3b82f6';
                commentContainer.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
                commentContainer.querySelector('span:first-child').style.color = '#3b82f6';
                commentContainer.querySelector('span:last-child').style.color = '#3b82f6';
            });
            commentContainer.addEventListener('mouseleave', () => {
                if (!BotComState) {
                    commentContainer.style.borderColor = '#e2e8f0';
                    commentContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    commentContainer.querySelector('span:first-child').style.color = '#64748b';
                    commentContainer.querySelector('span:last-child').style.color = '#64748b';
                }
            });

            commentContainer.addEventListener('click', (e) => {
                BotComState = !BotComState;

                if (BotComState) {
                    commentContainer.style.borderColor = '#3b82f6';
                    commentContainer.style.boxShadow = '0 4px 12px rgba(59,130,246,0.2)';
                    commentContainer.querySelector('span:first-child').style.color = '#3b82f6';
                    commentContainer.querySelector('span:last-child').style.color = '#3b82f6';
                } else {
                    commentContainer.style.borderColor = '#e2e8f0';
                    commentContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    commentContainer.querySelector('span:first-child').style.color = '#64748b';
                    commentContainer.querySelector('span:last-child').style.color = '#64748b';
                }

                ChangePanel({ name: 'comment' });
            });

            commentContainer.appendChild(icon);
            commentContainer.appendChild(label);

            return commentContainer;
        }

        const ScoreBoardButton = () => {
            const scoreContainer = document.createElement('div');
            scoreContainer.style.cssText = `
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                color: #64748b;
                outline: none;
                font-size: 24px;
                text-align: center;
                width: 80px;
                height: auto;
                border-radius: 10px;
                margin-top: 2vh;
                margin-bottom: 3vh;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            `;
            scoreContainer.setAttribute('title', 'Open/Close Scoreboard Panel');
            scoreContainer.setAttribute('name', 'score');

            const icon = document.createElement('span');
            icon.className = 'fa-solid fa-star';
            icon.style.cssText = 'font-size: 26px;';

            const label = document.createElement('span');
            label.style.cssText = `
                font-size: 11px;
                font-weight: 500;
                margin-top: 4px;
                color: #64748b;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            label.textContent = 'Score';

            scoreContainer.addEventListener('mouseenter', () => {
                scoreContainer.style.borderColor = '#8b5cf6';
                scoreContainer.style.boxShadow = '0 4px 12px rgba(139,92,246,0.15)';
                scoreContainer.querySelector('span:first-child').style.color = '#8b5cf6';
                scoreContainer.querySelector('span:last-child').style.color = '#8b5cf6';
            });
            scoreContainer.addEventListener('mouseleave', () => {
                if (!scoreBotState) {
                    scoreContainer.style.borderColor = '#e2e8f0';
                    scoreContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    scoreContainer.querySelector('span:first-child').style.color = '#64748b';
                    scoreContainer.querySelector('span:last-child').style.color = '#64748b';
                }
            });

            scoreContainer.addEventListener('click', (e) => {
                scoreBotState = !scoreBotState;

                if (scoreBotState) {
                    scoreContainer.style.borderColor = '#8b5cf6';
                    scoreContainer.style.boxShadow = '0 4px 12px rgba(139,92,246,0.2)';
                    scoreContainer.querySelector('span:first-child').style.color = '#8b5cf6';
                    scoreContainer.querySelector('span:last-child').style.color = '#8b5cf6';
                } else {
                    scoreContainer.style.borderColor = '#e2e8f0';
                    scoreContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    scoreContainer.querySelector('span:first-child').style.color = '#64748b';
                    scoreContainer.querySelector('span:last-child').style.color = '#64748b';
                }

                ChangePanel({ name: 'score' });
            });

            scoreContainer.appendChild(icon);
            scoreContainer.appendChild(label);

            return scoreContainer;
        }

        const Spacer = () => {
            const spacer = document.createElement('div');
            spacer.style.height = '8px';
            return spacer;
        }

        const container = document.createElement('div');
        container.style.cssText = `
            width: fit-content;
            background-color: #ffffff;
            height: fit-content;
            margin: auto;
            border: 1px solid #e8ecf1;
            display: flex;
            border-radius: 14px;
            overflow-y: hidden;
            padding: 12px 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        `;

        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = `
            width: fit-content;
            margin: auto;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        innerContainer.appendChild(Close());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(Comment());
        innerContainer.appendChild(Spacer());
        innerContainer.appendChild(ScoreBoardButton());

        container.appendChild(innerContainer);

        return container;
    }

    // Main render function - cleanup and create new instance
    const renderEntryView = (el) => {
        cleanup();
        
        const req = new Request('/uploadResearchFile')
        req.Post([
            {
                name: 'viewDocReq',
                value: '1'
            },
            {
                name: 'docId',
                value: docId
            }
        ])
        req.Json()
        req.Send().then(data => {
            if (data.status && data.data) {
                // Store file data
                fileData = data;
                fileData.docId = docId;
                
                fetchDocTitle(docId).then(fetchedTitle => {
                    if (fetchedTitle) {
                        docTitle = fetchedTitle;
                    }
                    el.appendChild(MainPanel(data))
                    el.appendChild(SideTools())
                });
            } else {
                const errorMsg = data.message || 'Document not found or no file available.';
                showErrorModal(errorMsg + ' (Document ID: ' + docId + ')');
            }
        }).catch(err => {
            console.error('Error loading entry view:', err)
            const errorMsg = err.message || 'Network error or server connection failed.';
            showErrorModal(errorMsg + ' (Document ID: ' + docId + ')');
        })
    };

    // Return a single container with cleanup on unmount
    return ($({
        tag: 'div',
        att: { id: 'entry-view-container' },
        style: {
            width: '100%',
            height: '100%',
            position: 'fixed',
            top: '0',
            left: '0',
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: '1000',
            alignItems: 'center',
            justifyContent: 'center'
        },
        elementHandler: (el) => {
            entryViewContainer = el;
            renderEntryView(el);
        }
    }))
}
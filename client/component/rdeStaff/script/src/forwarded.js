import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting, CustomModal } from "../../../../lib/lib.js";
import { Print } from "../../../otherComponent/comment.js";
import { PrintSummary } from "../../../otherComponent/ReviewTemplate.js";
import { Route, Router } from "../../../../lib/Router.js";
import { RankDocs } from "./docsRank.js";
import { FinalRanking, RankPerCriteria, ScoreRankAVe } from "./rankAlgo.js";
import { Summary } from "./Summary.js";
import { PrintResearch } from "../../../otherComponent/researchSummary.js";
import { Content } from "./entrySummary.js";
import { PosterForwarded } from './posterForwarded.js'

export const Forwarded = (mainFrame, leftPDiv = null) => {
        let researchBody, endorseBody, serch, Bod

        const ResearchDocs = ({category, center,file, docId, title, author, eventTYpe, deleteRequest, campus,endorseId, mainFrame}) => {
            const resDetails = () => {
                const details = (label, data) => {
                    return $({
                        tag: 'div',
                        text: label,
                        style: {
                            width: '100%',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            color: '#6c757d',
                            display: 'flex',
                            marginBottom: '8px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: data,
                                style: {
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#2c3e50',
                                    fontSize: '13px',
                                    marginLeft: '8px',
                                    fontWeight: '500',
                                    width: '100%',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }
                            })
                        ]
                    })
                }

                const actionButtonModern = ({ icon, label, onClick, color }) => {
                    return $({
                        tag: 'button',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            backgroundColor: '#ffffff',
                            border: `1px solid ${color}30`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: color,
                            transition: 'all 0.2s ease'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: icon },
                                style: { fontSize: '12px' }
                            }),
                            $({
                                tag: 'span',
                                text: label
                            })
                        ],
                        event: {
                            type: 'click',
                            method: onClick
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = `${color}10`;
                            e.target.style.borderColor = color;
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = `${color}30`;
                        }
                    })
                }

                return $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        marginBottom: '12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    },
                    elementHandler: (card) => {
                        card.addEventListener('mouseenter', () => {
                            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            card.style.transform = 'translateY(-2px)';
                        });
                        card.addEventListener('mouseleave', () => {
                            card.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                            card.style.transform = 'translateY(0)';
                        });
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px',
                                display: 'flex',
                                gap: '16px'
                            },
                            child: [
                                // Left side - PDF Icon with gradient background
                                $({
                                    tag: 'div',
                                    style: {
                                        flexShrink: '0'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '56px',
                                                height: '56px',
                                                background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-file-pdf' },
                                                    style: {
                                                        fontSize: '28px',
                                                        color: '#dc3545'
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                
                                // Right side - Content
                                $({
                                    tag: 'div',
                                    style: {
                                        flex: '1',
                                        minWidth: '0'
                                    },
                                    child: [
                                        // Title
                                        $({
                                            tag: 'h4',
                                            text: title,
                                            style: {
                                                margin: '0 0 8px 0',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#1a1a2e',
                                                lineHeight: '1.4'
                                            }
                                        }),
                                        
                                        // Author and Event row
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                flexWrap: 'wrap',
                                                marginBottom: '12px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    },
                                                    child: [
                                                        $({ tag: 'span', att: { className: 'fa-regular fa-user' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                        $({ tag: 'span', text: author, style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#495057' } })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    },
                                                    child: [
                                                        $({ tag: 'span', att: { className: 'fa-regular fa-calendar' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                        $({ tag: 'span', text: eventTYpe, style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#495057' } })
                                                    ]
                                                })
                                            ]
                                        }),
                                        
                                        // Category, Campus, Center chips
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                flexWrap: 'wrap',
                                                marginBottom: '16px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    text: category,
                                                    style: {
                                                        padding: '4px 10px',
                                                        backgroundColor: '#e7f1ff',
                                                        borderRadius: '20px',
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        color: '#0d6efd'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: campus,
                                                    style: {
                                                        padding: '4px 10px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '20px',
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        color: '#6c757d'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: center,
                                                    style: {
                                                        padding: '4px 10px',
                                                        backgroundColor: '#e8f5e9',
                                                        borderRadius: '20px',
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        color: '#28a745'
                                                    }
                                                })
                                            ]
                                        }),
                                        
                                        // Action Buttons
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                flexWrap: 'wrap'
                                            },
                                            child: [
                                                // Comments
                                                actionButtonModern({
                                                    icon: 'fa-regular fa-comment',
                                                    label: 'Comments',
                                                    onClick: async () => {
                                                        try {
                                                            const form = new FormData()
                                                            form.append('commentRequest', 'true')
                                                            form.append('docId', docId)
                                                            
                                                            const response = await fetch('/comments', {
                                                                method: "POST",
                                                                body: form
                                                            })
                                                            
                                                            if (!response.ok) {
                                                                throw new Error(`HTTP error! status: ${response.status}`)
                                                            }
                                                            
                                                            const contentType = response.headers.get('content-type')
                                                            if (!contentType || !contentType.includes('application/json')) {
                                                                // If not JSON, try to get text or show error
                                                                const text = await response.text()
                                                                console.error('Non-JSON response:', text)
                                                                alert('Server returned an invalid response. Please try again.')
                                                                return
                                                            }
                                                            
                                                            const data = await response.json()
                                                            
                                                            if (data && (Array.isArray(data) || typeof data === 'object')) {
                                                                const commentsModal = comments(data)
                                                                if (mainFrame && typeof mainFrame.appendChild === 'function') {
                                                                    mainFrame.appendChild(commentsModal)
                                                                } else {
                                                                    document.body.appendChild(commentsModal)
                                                                }
                                                            } else {
                                                                alert('No comments data available')
                                                            }
                                                        } catch (error) {
                                                            console.error('Error fetching comments:', error)
                                                            alert('Failed to load comments. Please try again.')
                                                        }
                                                    },
                                                    color: '#0d6efd'
                                                }),

                                                // Open File Button
                                                actionButtonModern({
                                                    icon: 'fa-regular fa-folder-open',
                                                    label: 'Open',
                                                    onClick: () => {
                                                        // Create content for the modal
                                                        const createViewerContent = ({ closeModal }) => {
                                                            const container = $({
                                                                tag: 'div',
                                                                style: {
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    minHeight: '500px',
                                                                    position: 'relative'
                                                                }
                                                            });
                                                            
                                                            // Check if it's a Google Drive URL
                                                            const isGoogleDriveUrl = file && (file.includes('drive.google.com') || file.includes('/d/'));
                                                            
                                                            if (isGoogleDriveUrl) {
                                                                // Extract file ID from URL
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
                                                                    
                                                                    // Add loading indicator
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
                                                                                text: 'Loading document...',
                                                                                style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6c757d' }
                                                                            })
                                                                        ]
                                                                    });
                                                                    container.appendChild(loadingIndicator);
                                                                    
                                                                    // Create iframe
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
                                                                    iframe.referrerPolicy = 'no-referrer';
                                                                    iframe.title = 'Document Viewer';
                                                                    
                                                                    iframe.onload = () => {
                                                                        if (loadingIndicator && loadingIndicator.remove) {
                                                                            loadingIndicator.remove();
                                                                        }
                                                                    };
                                                                    
                                                                    iframe.onerror = () => {
                                                                        if (loadingIndicator && loadingIndicator.remove) {
                                                                            loadingIndicator.remove();
                                                                        }
                                                                        container.innerHTML = `
                                                                            <div style="
                                                                                display: flex;
                                                                                flex-direction: column;
                                                                                align-items: center;
                                                                                justify-content: center;
                                                                                height: 100%;
                                                                                text-align: center;
                                                                                padding: 40px;
                                                                            ">
                                                                                <span class="fa-solid fa-circle-exclamation" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                                                                <h3 style="font-family: Inter, sans-serif; color: #1a1a2e; margin-bottom: 8px;">Unable to load document</h3>
                                                                                <p style="font-family: Inter, sans-serif; color: #6c757d; margin-bottom: 20px;">The document may require permission or the link may be invalid.</p>
                                                                                <a href="${file}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; font-family: Inter, sans-serif;">Open in Google Drive</a>
                                                                            </div>
                                                                        `;
                                                                    };
                                                                    
                                                                    container.appendChild(iframe);
                                                                } else {
                                                                    container.innerHTML = `
                                                                        <div style="
                                                                            display: flex;
                                                                            flex-direction: column;
                                                                            align-items: center;
                                                                            justify-content: center;
                                                                            height: 100%;
                                                                            text-align: center;
                                                                            padding: 40px;
                                                                        ">
                                                                            <span class="fa-solid fa-link-slash" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                                                            <h3 style="font-family: Inter, sans-serif; color: #1a1a2e; margin-bottom: 8px;">Invalid Document URL</h3>
                                                                            <p style="font-family: Inter, sans-serif; color: #6c757d;">The document URL could not be parsed.</p>
                                                                        </div>
                                                                    `;
                                                                }
                                                            } else {
                                                                // For local PDF files
                                                                const objectEl = $({
                                                                    tag: 'object',
                                                                    att: {
                                                                        data: '/' + file,
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
                                                                                <div style="
                                                                                    display: flex;
                                                                                    flex-direction: column;
                                                                                    align-items: center;
                                                                                    justify-content: center;
                                                                                    height: 100%;
                                                                                    text-align: center;
                                                                                    padding: 40px;
                                                                                ">
                                                                                    <span class="fa-solid fa-file-pdf" style="font-size: 48px; color: #dc3545; margin-bottom: 16px;"></span>
                                                                                    <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load PDF</h3>
                                                                                    <p style="font-family: Inter, sans-serif; color: #6c757d; margin-bottom: 16px;">The PDF file could not be loaded.</p>
                                                                                    <a href="/${file}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px;">Download PDF</a>
                                                                                </div>
                                                                            `;
                                                                        };
                                                                    }
                                                                });
                                                                container.appendChild(objectEl);
                                                            }
                                                            
                                                            return container;
                                                        };
                                                        
                                                        // Open CustomModal
                                                        CustomModal({
                                                            title: 'Document Viewer',
                                                            size: 'large',
                                                            content: createViewerContent,
                                                            showCloseButton: true,
                                                            closeOnOverlayClick: true,
                                                            onClose: () => {
                                                                console.log('Modal closed');
                                                            }
                                                        });
                                                    },
                                                    color: '#28a745'
                                                }),
                                                
                                                // Cancel Button
                                                actionButtonModern({
                                                    icon: 'fa fa-window-close',
                                                    label: 'Cancel',
                                                    onClick: () => {
                                                        if (confirm("This entry will be transferred for re-evaluation. Do you want to continue?")) {
                                                            const req = new Request('/endorsement')
                                                            req.Post([
                                                                { name: 'returnDocs', value: '1' },
                                                                { name: 'docId', value: endorseId }
                                                            ])
                                                            req.Json()
                                                            req.Send().then(res => {
                                                                if (res.status) {
                                                                    window.location.reload();
                                                                } else {
                                                                    alert(res.message)
                                                                }
                                                            })
                                                        }
                                                    },
                                                    color: '#dc3545'
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            }

            const comments = (Review) => {
                let comm
                const getComment = (el) => {
                    comm = el
                }
                let printBody
                const closeModal = () => {
                    if (comm && comm.remove) {
                        comm.remove()
                    }
                }
                
                const Controller = () => {
                    const button = ({ label, icon, onClick, color }) => {
                        return $({
                            tag: 'button',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: color,
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#ffffff',
                                transition: 'all 0.2s ease',
                                marginBottom: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: icon },
                                    style: { fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: label
                                })
                            ],
                            event: {
                                type: 'click',
                                method: onClick
                            },
                            mouseenter: (e) => {
                                e.target.style.opacity = '0.9';
                                e.target.style.transform = 'translateY(-1px)';
                            },
                            mouseleave: (e) => {
                                e.target.style.opacity = '1';
                                e.target.style.transform = 'translateY(0)';
                            }
                        })
                    }
                    
                    return $({
                        tag: 'div',
                        style: {
                            width: '280px',
                            height: '100%',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #e9ecef',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '20px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    marginTop: 'auto'
                                },
                                child: [
                                    button({
                                        label: 'Print Comments',
                                        icon: 'fa-solid fa-print',
                                        onClick: () => {
                                            const printPage = document.getElementById('commentPDF')
                                            if (!printPage || !printPage.innerHTML) {
                                                alert('No content to print')
                                                return
                                            }
                                            let WinPrint = window.open('', '_blank', 'toolbar=0,scrollbars=0,status=0');
                                            if (WinPrint) {
                                                WinPrint.document.write('<html><head><title>Print Comments</title><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head><body>')
                                                WinPrint.document.write(printPage.innerHTML);
                                                WinPrint.document.write('</body></html>');
                                                WinPrint.document.close();
                                                WinPrint.focus();
                                                WinPrint.print();
                                                WinPrint.close();
                                            } else {
                                                alert('Popup blocked! Please allow popups for this site.')
                                            }
                                        },
                                        color: '#0d6efd'
                                    }),
                                    button({
                                        label: 'Close',
                                        icon: 'fa-solid fa-xmark',
                                        onClick: () => {
                                            closeModal()
                                        },
                                        color: '#6c757d'
                                    })
                                ]
                            })
                        ]
                    })
                }
                
                const isValidReview = Review && (Array.isArray(Review) ? Review.length > 0 : Object.keys(Review).length > 0)
                
                const print = $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        overflowY: 'auto',
                        userSelect: 'text',
                        padding: '20px',
                        backgroundColor: '#f8f9fa'
                    },
                    child: [
                        Print({
                            title: title || 'Untitled',
                            campus: campus || 'N/A',
                            author: author || 'Unknown',
                            category: category || 'Uncategorized',
                            date: new Date().toLocaleDateString(),
                            review: isValidReview ? Review : { error: 'No review data available' },
                            getHandler: (el) => {
                                printBody = el
                            }
                        })
                    ]
                })
                
                return $({
                    tag: 'div',
                    style: {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    },
                    elementHandler: (overlay) => {
                        getComment(overlay)
                   
                        overlay.addEventListener('click', (e) => {
                            if (e.target === overlay) {
                                closeModal()
                            }
                        })
                    
                        const handleEsc = (e) => {
                            if (e.key === 'Escape') {
                                closeModal()
                                document.removeEventListener('keydown', handleEsc)
                            }
                        }
                        document.addEventListener('keydown', handleEsc)
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '90%',
                                maxWidth: '1200px',
                                height: '85vh',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                display: 'flex',
                                overflow: 'hidden'
                            },
                            child: [
                                Controller(),
                                print
                            ]
                        })
                    ]
                })
            }
            return resDetails()
        }
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
            text: 'Accepted Documents'
        })
        const searchInput = (value) => {
            SearchMethod({
                nodeList: researchBody ? researchBody.childNodes : [],
                textArray: value.target.value.toUpperCase().split(' '),
                display: 'flex',
            })
        }

        const search = ({tools, searchEvent}) => {
            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'fit-content',
                    display: 'flex',
                    position: 'relative',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '0 20px',
                    marginBottom: '20px'
                },
                elementHandler: (el) => {
                    // Search container with modern styling
                    const searchContainer = $({
                        tag: 'div',
                        style: {
                            height: '46px',
                            width: '100%',
                            maxWidth: '400px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e9ecef',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            cursor: 'text'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-magnifying-glass',
                                            title: 'Search Event Document'
                                        },
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
                                            placeholder: 'Search by title, author, or category...'
                                        },
                                        event: {
                                            type: 'input',
                                            method: searchEvent
                                        },
                                        style: {
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            padding: '0',
                                            color: '#2c3e50',
                                            height: '100%',
                                            width: '100%',
                                            fontSize: '14px',
                                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                            fontWeight: '400'
                                        },
                                        elementHandler: (el) => {
                                            serch = el
                                        }
                                    }),
                                    // Optional clear button (appears when text is entered)
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
                                            transition: 'color 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                e.stopPropagation()
                                                if (serch) {
                                                    serch.value = ''
                                                    // Trigger search event with empty value
                                                    const inputEvent = new Event('input', { bubbles: true })
                                                    serch.dispatchEvent(inputEvent)
                                                }
                                                e.target.style.display = 'none'
                                            }
                                        },
                                        elementHandler: (clearBtn) => {
                                            // Show/hide clear button based on input
                                            if (serch) {
                                                const originalOnInput = searchEvent
                                                const newOnInput = (e) => {
                                                    if (e.target.value.length > 0) {
                                                        clearBtn.style.display = 'block'
                                                    } else {
                                                        clearBtn.style.display = 'none'
                                                    }
                                                    if (originalOnInput) originalOnInput(e)
                                                }
                                                serch.addEventListener('input', newOnInput)
                                            }
                                        }
                                    })
                                ]
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                if (serch) serch.focus()
                            }
                        }
                    })
                    
                    // Add focus/blur effects with proper event handling
                    const searchInputField = searchContainer.querySelector('.searchInput')
                    if (searchInputField) {
                        searchInputField.addEventListener('focus', () => {
                            searchContainer.style.borderColor = '#0d6efd'
                            searchContainer.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)'
                            const searchIcon = searchContainer.querySelector('.fa-magnifying-glass')
                            if (searchIcon) searchIcon.style.color = '#0d6efd'
                        })
                        
                        searchInputField.addEventListener('blur', () => {
                            searchContainer.style.borderColor = '#e9ecef'
                            searchContainer.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'
                            const searchIcon = searchContainer.querySelector('.fa-magnifying-glass')
                            if (searchIcon) searchIcon.style.color = '#adb5bd'
                        })
                    }
                    
                    el.appendChild(searchContainer)
                    
                    if (tools) {
                        el.appendChild(tools)
                    }
                }
            }))
        }

        let printerPanel
        const getPrinterPanel = (el) => {
            printerPanel = el
        }

        const tools = () => {
            let toolBox
            const printPane = () => {
                let filter = null
                let category = null
                const getCategory = (value) => {
                    category = value
                }
                const getFilter = (value) => {
                    filter = value
                }
                let print
                const getPrintable = (el) => {
                    print = el
                }
                let samp
                const left = $({
                    tag: 'div',
                    style: {
                        width: '20%',
                        height: '100%',
                        backgroundColor: '#f8f9fa',
                        justifyContent: 'center',
                        display: 'flex',
                        borderRight: '1px solid #e9ecef'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '90%',
                                height: 'fit-content',
                                margin: 'auto'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Filter',
                                    style: {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#2c3e50',
                                        marginBottom: '16px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '40px',
                                        margin: 'auto',
                                        marginBottom: '12px'
                                    },
                                    child: [
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                backgroundColor: '#ffffff',
                                                height: '100%',
                                                fontSize: '14px',
                                                outline: 'none',
                                                textAlign: 'center',
                                                color: '#2c3e50',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            },
                                            elementHandler: async (el) => {
                                                el.appendChild($({
                                                    tag: 'option',
                                                    text: '-- Select Event type --',
                                                    att: {
                                                        disabled: true,
                                                        selected: true
                                                    },
                                                    style: {
                                                        backgroundColor: '#ffffff',
                                                        color: '#6c757d'
                                                    }
                                                }))
                                                const req = new Request('/eventRequest')
                                                req.Post([{
                                                    name: 'getEventAdmin',
                                                    value: '1'
                                                }])
                                                req.Json()
                                                req.Send().then(data => {
                                                    data.forEach(val => {
                                                        el.appendChild($({
                                                            tag: 'option',
                                                            text: val.name,
                                                            att: {
                                                                id: val.id
                                                            },
                                                            style: {
                                                                backgroundColor: '#ffffff',
                                                                color: '#2c3e50',
                                                                height: '36px',
                                                                fontSize: '14px'
                                                            }
                                                        }))
                                                    })
                                                })
                                            },
                                            event: {
                                                type: 'change',
                                                method: (event) => {
                                                    getFilter(event.target.value)
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '40px',
                                        margin: '12px auto'
                                    },
                                    child: [
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                backgroundColor: '#ffffff',
                                                height: '100%',
                                                fontSize: '14px',
                                                outline: 'none',
                                                textAlign: 'center',
                                                color: '#2c3e50',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            },
                                            child: [
                                                $({
                                                    tag: 'option',
                                                    text: '-- Select Center --',
                                                    att: {
                                                        disabled: true,
                                                        selected: true
                                                    },
                                                    style: { backgroundColor: '#ffffff', color: '#6c757d' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Print All Category',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Crop Science Research & Developement Center (CSRDC)',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Livestock Research & Development Center (LRDC)',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Fisheries Research & Development Center (FRDC)',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Food and Industrial Technology Research & Development Center (FIRDC) ',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Social Science Research & Development Center (SSRDC)',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Machinery and Agricultural Technology Engineering Center (MATEC)     ',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Coconut Research and Development Center (Coco RDC)',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Extension ',
                                                    style: { backgroundColor: '#ffffff', fontSize: '14px' }
                                                }),
                                            ],
                                            event: {
                                                type: 'change',
                                                method: (event) => {
                                                    getCategory(event.target.value)
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '40px',
                                        margin: '20px auto auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#0d6efd',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    att: {
                                        className: 'printAllReload'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-arrow-rotate-right',
                                                title: 'Load Request'
                                            },
                                            style: {
                                                fontSize: '14px',
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                                marginLeft: '8px',
                                                color: '#ffffff'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                height: 'fit-content',
                                                width: '100%',
                                                fontFamily: 'Inter, sans-serif',
                                                margin: 'auto',
                                                marginLeft: '8px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            },
                                            text: 'Load Request'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            const form = new FormData()
                                            form.append('commentRequest', 'true')
                                            form.append('eventType', filter)
                                            form.append('category', category)
                                            await fetch('/comments', {
                                                method: 'POST',
                                                body: form
                                            }).then(res => res.json())
                                                .then(data => {
                                                    print.innerHTML = ''
                                                    if (data && data.length > 0) {
                                                        data.forEach(val => {
                                                            if(val.comments && val.comments.length > 0){
                                                                print.appendChild(Print({
                                                                    title: val.title,
                                                                    review: val.comments,
                                                                    category: val.category,
                                                                    campus: val.campus,
                                                                    date: val.date ? val.date.split(' ')[0] : '',
                                                                    author: val.author,
                                                                    all: true,
                                                                    getHandler: (el) => {
                                                                        samp = el
                                                                    }
                                                                }))
                                                            }
                                                        })
                                                    } else {
                                                        print.innerHTML = '<div style="text-align:center;padding:40px;color:#6c757d;">No comments found</div>'
                                                    }
                                                })
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '40px',
                                        margin: '12px auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#28a745',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    att: {
                                        className: 'printAllReload'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-print',
                                                title: 'Print'
                                            },
                                            style: {
                                                fontSize: '14px',
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                                marginLeft: '8px',
                                                color: '#ffffff'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                height: 'fit-content',
                                                width: '100% ',
                                                fontFamily: 'Inter, sans-serif',
                                                margin: 'auto',
                                                marginLeft: '8px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            },
                                            text: 'Print'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            const nodes = print.childNodes;
                                            if (!nodes || nodes.length === 0) {
                                                alert('No content to print. Please load data first.')
                                                return
                                            }
                                            
                                            let WinPrint = window.open('', '_blank', 'toolbar=0,scrollbars=0,status=0');
                                            if (!WinPrint) {
                                                alert('Popup blocked! Please allow popups for this site.')
                                                return
                                            }
                                            
                                            let htmlContent = `
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <title>Print Comments</title>
                                                    <style>
                                                        body {
                                                            margin: 0;
                                                            padding: 0;
                                                            font-family: Arial, sans-serif;
                                                            -webkit-print-color-adjust: exact !important;
                                                            print-color-adjust: exact !important;
                                                        }
                                                        @page {
                                                            margin: 0;
                                                            size: letter;
                                                        }
                                                        .page-container {
                                                            position: relative;
                                                            width: 100%;
                                                            height: 100vh;
                                                            page-break-after: always;
                                                            page-break-inside: avoid;
                                                        }
                                                        .page-container:last-child {
                                                            page-break-after: auto;
                                                        }
                                                        .page-background {
                                                            position: absolute;
                                                            top: 0;
                                                            left: 0;
                                                            width: 100%;
                                                            height: 100%;
                                                            z-index: 0;
                                                        }
                                                        .page-background img {
                                                            width: 100%;
                                                            height: 100%;
                                                            object-fit: fill;
                                                            display: block;
                                                        }
                                                        .page-content {
                                                            position: absolute;
                                                            top: 95px;
                                                            left: 0.75in;
                                                            right: 0.75in;
                                                            bottom: 93px;
                                                            z-index: 1;
                                                            overflow: visible;
                                                        }
                                                        * {
                                                            box-sizing: border-box;
                                                        }
                                                    </style>
                                                </head>
                                                <body>
                                            `;
                                            
                                            for (let x = 0; x < nodes.length; x++) {
                                                htmlContent += `
                                                    <div class="page-container">
                                                        <div class="page-background">
                                                            <img src="/client/images/header.png" alt="Header and Footer">
                                                        </div>
                                                        <div class="page-content">
                                                            ${nodes[x].innerHTML}
                                                        </div>
                                                    </div>`;
                                            }
                                            
                                            htmlContent += `
                                                </body>
                                                </html>`;
                                            
                                            WinPrint.document.write(htmlContent);
                                            WinPrint.document.close();
                                            
                                            WinPrint.onload = function() {
                                                setTimeout(() => {
                                                    WinPrint.focus();
                                                    WinPrint.print();
                                                    WinPrint.close();
                                                }, 1000);
                                            };
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '40px',
                                        margin: '12px auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#6c757d',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    att: {
                                        className: 'printAllReload'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-arrow-left',
                                                title: 'Go back'
                                            },
                                            style: {
                                                margin: 'auto',
                                                width: 'fit-content',
                                                marginLeft: '8px',
                                                marginRight: '8px',
                                                color: '#ffffff'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                fontFamily: 'Inter, sans-serif',
                                                margin: 'auto',
                                                width: '100%',
                                                marginLeft: '8px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            },
                                            text: 'Back'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            if (printerPanel && printerPanel.parentNode) {
                                                printerPanel.parentNode.removeChild(printerPanel)
                                            }
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
                const right = $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        height: '100%',
                        backgroundColor: '#ffffff',
                        overflowY: 'auto',
                        padding: '20px'
                    },
                    att: {
                        className: 'sample'
                    },
                    elementHandler: getPrintable
                })

                return ($({
                    tag: 'div',
                    style: {
                        width: '90%',
                        height: '90%',
                        backgroundColor: '#ffffff',
                        position: 'fixed',
                        top: '5%',
                        left: '5%',
                        display: 'flex',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        zIndex: 1000,
                        overflow: 'hidden'
                    },
                    elementHandler: getPrinterPanel,
                    child: [
                        left,
                        right
                    ]
                }))
            }
            
            return ($({
                tag: 'div',
                style: {
                    position: 'absolute',
                    right: '20px',
                    top: '0',
                    bottom: '0',
                    margin: 'auto',
                    height: 'fit-content',
                    width: 'fit-content',
                    backgroundColor: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                },
                elementHandler: (el) => {
                    toolBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            color: '#0d6efd',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-print' },
                                style: { fontSize: '14px' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Print All Comments'
                            })
                        ]
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        // Fix: Use the correct container to append to
                        // Try mainFrame first, fallback to document.body
                        const targetContainer = mainFrame || document.body
                        if (targetContainer && typeof targetContainer.appendChild === 'function') {
                            targetContainer.appendChild(printPane())
                        } else {
                            console.error('No valid container found for print panel')
                            document.body.appendChild(printPane())
                        }
                    }
                }
            }))
        }
        return ($({
            tag: 'div',
            style: {
                width: '49.9%',
                height: '100%',
                backgroundColor: '#f8f9fa',
                margin: 'auto',
                marginRight: '0',
                position:'relative',
                borderRadius: '15px',
            },
            child: [
                label,
                Content(mainFrame, leftPDiv),
            ]
        }))
    }
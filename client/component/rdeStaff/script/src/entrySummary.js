// entrySummary.js
import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting, CustomModal } from "../../../../lib/lib.js";
import { Print } from "../../../otherComponent/comment.js";
import { PrintSummary } from "../../../otherComponent/ReviewTemplate.js";
import { Route, Router } from "../../../../lib/Router.js";
import { RankDocs } from "./docsRank.js";
import { FinalRanking, RankPerCriteria, ScoreRankAVe } from "./rankAlgo.js";
import { Summary } from "./Summary.js";
import { PrintResearch } from "../../../otherComponent/researchSummary.js";
import { PosterForwarded } from "./posterForwarded.js"

export const Content = (mainFrame, leftPDiv = null) => {
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
                                                        
                                                        const isGoogleDriveUrl = file && (file.includes('drive.google.com') || file.includes('/d/'));
                                                        
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
                                                const inputEvent = new Event('input', { bubbles: true })
                                                serch.dispatchEvent(inputEvent)
                                            }
                                            e.target.style.display = 'none'
                                        }
                                    },
                                    elementHandler: (clearBtn) => {
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
    
    const ContentComponent = () => {
        const Report = () => {
            const ReportPanel = () => {
                let bodCon, eventTypeName
                
                const contain = ({ category, total, eventType }) => {
                    return ($({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: 'fit-content',
                            marginTop: '4px',
                            marginBottom: '4px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #f0f0f0',
                            transition: 'all 0.2s ease',
                            overflow: 'hidden'
                        },
                        elementHandler: (el) => {
                            el.addEventListener('mouseenter', () => {
                                el.style.borderColor = '#dee2e6';
                                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                            });
                            el.addEventListener('mouseleave', () => {
                                el.style.borderColor = '#f0f0f0';
                                el.style.boxShadow = 'none';
                            });
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    width: '100%',
                                    height: 'fit-content',
                                    padding: '14px 20px',
                                    alignItems: 'center',
                                    backgroundColor: '#ffffff'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-circle'
                                        },
                                        style: {
                                            width: '5%',
                                            textAlign: 'center',
                                            fontSize: '10px',
                                            color: total > 0 ? '#28a745' : '#dee2e6'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            width: '45%',
                                            margin: 'auto',
                                            fontSize: '14px',
                                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                            color: '#2c3e50',
                                            fontWeight: '500',
                                            padding: '4px 0'
                                        },
                                        text: category
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            width: '50%',
                                            margin: 'auto',
                                            fontSize: '14px',
                                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                            color: total > 0 ? '#28a745' : '#adb5bd',
                                            fontWeight: total > 0 ? '600' : '400',
                                            padding: '4px 0',
                                            textAlign: 'center'
                                        },
                                        text: total.toString()
                                    })
                                ]
                            })
                        ]
                    }))
                }
                
                const printSummary = (eventDetails) => {
                    return ($({
                        tag: 'div',
                        style: {
                            marginTop: '20px',
                            width: '100%',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#0d6efd',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '500',
                            padding: '12px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: '#f8f9fa'
                        },
                        text: 'Print Accepted Summary',
                        event: {
                            type: 'click',
                            method: () => {
                                // Show loading indicator
                                let loading = Waiting();
                                document.body.appendChild(loading);
                                
                                const req = new Request('/entrycount')
                                req.Post([
                                    {
                                        name: 'printSum',
                                        value: '1'
                                    },
                                    {
                                        name: 'eventName',
                                        value: eventDetails.name
                                    }
                                ])
                                req.Json();
                                req.Send().then(data => {
                                    // Remove loading
                                    if (loading && loading.parentNode) {
                                        loading.parentNode.removeChild(loading);
                                    }
                                    
                                    // Check if this is a symposium event
                                    const isSymposium = eventDetails.name && 
                                        eventDetails.name.toLowerCase().includes('symposium');
                                    
                                    let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                                    
                                    if (!WinPrint) {
                                        alert('Popup blocked! Please allow popups for this site.');
                                        return;
                                    }
                                    
                                    // Determine the title based on event type
                                    const summaryTitle = isSymposium 
                                        ? `Symposium Summary - ${eventDetails.name}`
                                        : `Research Summary - ${eventDetails.name}`;
                                    
                                    // Get the PrintSummary component with event type detection
                                    const summaryHTML = PrintSummary(data, eventDetails.name);
                                    
                                    WinPrint.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>${summaryTitle}</title>
                                            <link rel="stylesheet" href="/client/component/otherComponent/style/review.css">
                                            <style>
                                                /* Print styles */
                                                @page {
                                                    size: A4;
                                                    margin: 0;
                                                }
                                                body {
                                                    margin: 0;
                                                    padding: 0;
                                                    -webkit-print-color-adjust: exact !important;
                                                    print-color-adjust: exact !important;
                                                }
                                                .print-summary-container {
                                                    width: 100%;
                                                    min-height: 100vh;
                                                }
                                                /* Ensure table borders print properly */
                                                .summary-table td,
                                                .summary-table th {
                                                    border-color: #000 !important;
                                                }
                                                /* Ensure background colors print */
                                                .summary-table th {
                                                    -webkit-print-color-adjust: exact !important;
                                                    print-color-adjust: exact !important;
                                                }
                                                /* Ensure the background image prints */
                                                .print-header-bg {
                                                    -webkit-print-color-adjust: exact !important;
                                                    print-color-adjust: exact !important;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="print-summary-container">
                                                ${summaryHTML.innerHTML}
                                            </div>
                                        </body>
                                        </html>
                                    `)
                                    
                                    WinPrint.document.close();
                                    
                                    WinPrint.onload = function() {
                                        setTimeout(() => {
                                            WinPrint.focus();
                                            WinPrint.print();
                                        }, 800);
                                    };
                                    
                                }).catch(error => {
                                    // Remove loading on error
                                    if (loading && loading.parentNode) {
                                        loading.parentNode.removeChild(loading);
                                    }
                                    console.error('Error loading summary data:', error);
                                    alert('Error loading summary data. Please try again.');
                                });
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#e7f1ff';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(13,110,253,0.15)';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }
                    }))
                }
                
                const createPrintModal = (eventDetails) => {
                    const content = () => {
                        const container = $({
                            tag: 'div',
                            style: {
                                padding: '8px 0'
                            }
                        });
                        
                        const fields = [
                            { id: 'dateToBeHeld', label: 'Date to be held:', placeholder: 'e.g., March 2-3, 2026' },
                            { id: 'venue', label: 'Venue:', placeholder: 'e.g., Roxas City Campus, Fuentes Drive, Roxas City, Capiz' },
                            { id: 'pptDeadline', label: 'PPT Deadline:', placeholder: 'e.g., March 01, 2026, 3:00 p.m.' },
                            { id: 'driveLink', label: 'Drive link:', placeholder: 'e.g., https://bit.ly/38thIHR_PPTs' }
                        ];
                        
                        fields.forEach(field => {
                            const fieldDiv = $({
                                tag: 'div',
                                style: {
                                    marginBottom: '20px',
                                    width: '100%'
                                }
                            });
                            
                            const label = $({
                                tag: 'label',
                                att: { htmlFor: field.id },
                                style: {
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#495057',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: '500'
                                },
                                text: field.label
                            });
                            fieldDiv.appendChild(label);
                            
                            const input = $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    id: field.id,
                                    placeholder: field.placeholder
                                },
                                style: {
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }
                            });
                            
                            input.addEventListener('focus', () => {
                                input.style.borderColor = '#0d6efd';
                                input.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                            });
                            input.addEventListener('blur', () => {
                                input.style.borderColor = '#dee2e6';
                                input.style.boxShadow = 'none';
                            });
                            
                            fieldDiv.appendChild(input);
                            container.appendChild(fieldDiv);
                        });
                        
                        return container;
                    };
                    
                    const footer = ({ closeModal }) => {
                        return $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                padding: '16px 0 0 0',
                                borderTop: '1px solid #e9ecef',
                                marginTop: '8px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        padding: '10px 20px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        backgroundColor: '#ffffff',
                                        color: '#6c757d',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#ced4da';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        padding: '10px 24px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        backgroundColor: '#0d6efd',
                                        color: '#ffffff',
                                        transition: 'all 0.2s ease',
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
                                            text: 'Print'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            const formData = {
                                                dateToBeHeld: document.getElementById('dateToBeHeld')?.value || '',
                                                venue: document.getElementById('venue')?.value || '',
                                                pptDeadline: document.getElementById('pptDeadline')?.value || '',
                                                driveLink: document.getElementById('driveLink')?.value || ''
                                            };
                                            
                                            if (!formData.dateToBeHeld || !formData.venue || !formData.pptDeadline || !formData.driveLink) {
                                                alert('Please fill in all fields before printing');
                                                return;
                                            }
                                            
                                            closeModal();
                                            printResearchSummary(eventDetails, formData);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#0b5ed7';
                                        e.target.style.transform = 'translateY(-1px)';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#0d6efd';
                                        e.target.style.transform = 'translateY(0)';
                                    }
                                })
                            ]
                        });
                    };
                    
                    CustomModal({
                        title: 'Print Research Entry Summary',
                        size: 'medium',
                        content: content,
                        footer: footer,
                        showCloseButton: true,
                        closeOnOverlayClick: true
                    });
                }
                
                const createCertificateModal = (eventDetails) => {
                    const content = () => {
                        const container = $({
                            tag: 'div',
                            style: {
                                padding: '8px 0'
                            }
                        });
                        
                        const eventInfo = $({
                            tag: 'div',
                            style: {
                                marginBottom: '20px',
                                padding: '12px 16px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                color: '#2c3e50',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                borderLeft: '3px solid #ffc107'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Event: ',
                                    style: { fontWeight: '600' }
                                }),
                                $({
                                    tag: 'span',
                                    text: eventDetails.name
                                })
                            ]
                        });
                        container.appendChild(eventInfo);
                        
                        const fields = [
                            { id: 'certDateToBeHeld', label: 'Date of Event:', placeholder: 'e.g., March 2-3, 2026' },
                            { id: 'certVenue', label: 'Venue:', placeholder: 'e.g., CAPSU Conference Room, Roxas City, Capiz' }
                        ];
                        
                        fields.forEach(field => {
                            const fieldDiv = $({
                                tag: 'div',
                                style: {
                                    marginBottom: '20px',
                                    width: '100%'
                                }
                            });
                            
                            const label = $({
                                tag: 'label',
                                att: { htmlFor: field.id },
                                style: {
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#495057',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: '500'
                                },
                                text: field.label
                            });
                            fieldDiv.appendChild(label);
                            
                            const input = $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    id: field.id,
                                    placeholder: field.placeholder
                                },
                                style: {
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }
                            });
                            
                            input.addEventListener('focus', () => {
                                input.style.borderColor = '#ffc107';
                                input.style.boxShadow = '0 0 0 3px rgba(255,193,7,0.15)';
                            });
                            input.addEventListener('blur', () => {
                                input.style.borderColor = '#dee2e6';
                                input.style.boxShadow = 'none';
                            });
                            
                            fieldDiv.appendChild(input);
                            container.appendChild(fieldDiv);
                        });
                        
                        return container;
                    };
                    
                    const footer = ({ closeModal }) => {
                        return $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                padding: '16px 0 0 0',
                                borderTop: '1px solid #e9ecef',
                                marginTop: '8px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        padding: '10px 20px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        backgroundColor: '#ffffff',
                                        color: '#6c757d',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#ced4da';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        padding: '10px 24px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        backgroundColor: '#ffc107',
                                        color: '#2c3e50',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-certificate' },
                                            style: { fontSize: '14px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Generate Certificates'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            const formData = {
                                                dateToBeHeld: document.getElementById('certDateToBeHeld')?.value || '',
                                                venue: document.getElementById('certVenue')?.value || ''
                                            };
                                            
                                            if (!formData.dateToBeHeld || !formData.venue) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }
                                            
                                            closeModal();
                                            generateCertificates(eventDetails, formData);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#e0a800';
                                        e.target.style.transform = 'translateY(-1px)';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffc107';
                                        e.target.style.transform = 'translateY(0)';
                                    }
                                })
                            ]
                        });
                    };
                    
                    CustomModal({
                        title: 'Print Presentor Certificates',
                        size: 'medium',
                        content: content,
                        footer: footer,
                        showCloseButton: true,
                        closeOnOverlayClick: true
                    });
                }
                
                const generateCertificates = (eventDetails, formData) => {
                    let loading = Waiting();
                    document.body.appendChild(loading);
                    
                    const removeLoading = () => {
                        if (loading && loading.parentNode) {
                            loading.parentNode.removeChild(loading);
                        }
                    };
                    
                    const req = new Request('/entrycount');
                    req.Post([
                        { name: 'getCertificates', value: '1' },
                        { name: 'eventName', value: eventDetails.name }
                    ]);
                    req.Json();
                    
                    req.Send().then(response => {
                        if (!response) {
                            removeLoading();
                            alert('No response from server');
                            return;
                        }
                        
                        if (response.status === 'error') {
                            removeLoading();
                            alert('Error: ' + (response.message || 'Failed to load certificate data'));
                            return;
                        }
                        
                        if (!response.data || response.data.length === 0) {
                            removeLoading();
                            alert('No accepted research files found for this event');
                            return;
                        }
                        
                        let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                        
                        if (!WinPrint) {
                            removeLoading();
                            alert('Popup blocked! Please allow popups for this site and try again.');
                            return;
                        }
                        
                        const checkWindowClosed = setInterval(() => {
                            if (WinPrint.closed) {
                                clearInterval(checkWindowClosed);
                                removeLoading();
                            }
                        }, 500);
                        
                        WinPrint.onunload = function() {
                            clearInterval(checkWindowClosed);
                            removeLoading();
                        };
                        
                        WinPrint.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Certificates - ${eventDetails.name}</title>
                                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        background-color: #333;
                                        font-family: Arial, sans-serif;
                                    }
                                    @media print {
                                        body {
                                            background-color: white;
                                        }
                                        .no-print {
                                            display: none !important;
                                        }
                                    }
                                    .print-controls {
                                        position: fixed;
                                        bottom: 20px;
                                        right: 20px;
                                        z-index: 1000;
                                        display: flex;
                                        gap: 10px;
                                    }
                                    .print-btn {
                                        padding: 12px 24px;
                                        background-color: #FFD700;
                                        color: #2a2a2a;
                                        border: none;
                                        border-radius: 5px;
                                        font-size: 16px;
                                        font-weight: bold;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                                    }
                                    .print-btn:hover {
                                        background-color: #FFC800;
                                    }
                                    .certificate-container {
                                        padding: 20px;
                                    }
                                    .certificate-page {
                                        position: relative;
                                        width: 29.7cm;
                                        height: 21cm;
                                        page-break-after: always;
                                        page-break-inside: avoid;
                                        margin: 0 auto;
                                        overflow: hidden;
                                        background: white;
                                    }
                                    .certificate-background {
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        z-index: 1;
                                    }
                                    .certificate-background img {
                                        width: 100%;
                                        height: 100%;
                                        object-fit: cover;
                                        display: block;
                                    }
                                    .certificate-content {
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        z-index: 2;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        align-items: center;
                                        text-align: center;
                                        font-family: 'Times New Roman', serif;
                                        box-sizing: border-box;
                                        padding: 20px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="print-controls no-print">
                                    <button class="print-btn" onclick="window.print()">
                                        <i class="fa-solid fa-print"></i> Print Certificates
                                    </button>
                                </div>
                                <div id="certificate-container" class="certificate-container"></div>
                                
                                <script src="/client/component/otherComponent/researchCertificates.js?v=${Date.now()}"></script>
                                <script>
                                    function renderCertificatesWithRetry() {
                                        if (window.renderCertificates) {
                                            window.renderCertificates(
                                                document.getElementById('certificate-container'),
                                                ${JSON.stringify(response.data)},
                                                {
                                                    event: ${JSON.stringify(eventDetails.name)},
                                                    date: ${JSON.stringify(formData.dateToBeHeld)},
                                                    venue: ${JSON.stringify(formData.venue)},
                                                    backgroundImage: '/client/images/certBackground.png'
                                                }
                                            );
                                            
                                            setTimeout(function() {
                                                window.print();
                                            }, 1500);
                                        } else {
                                            setTimeout(renderCertificatesWithRetry, 100);
                                        }
                                    }
                                    
                                    setTimeout(renderCertificatesWithRetry, 300);
                                </script>
                            </body>
                            </html>
                        `);
                        
                        WinPrint.document.close();
                        
                    }).catch(error => {
                        removeLoading();
                        alert('Error: ' + error.message);
                    });
                };
                
                const printResearchSummary = (eventDetails, formData) => {
                    let loading = Waiting();
                    document.body.appendChild(loading);
                    
                    const removeLoading = () => {
                        if (loading && loading.parentNode) {
                            loading.parentNode.removeChild(loading);
                        }
                    };
                    
                    const req = new Request('/entrycount');
                    req.Post([
                        { name: 'printEntry', value: '1' },
                        { name: 'eventName', value: eventDetails.name }
                    ]);
                    req.Json();
                    
                    req.Send().then(data => {
                        removeLoading();
                        
                        let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                        
                        WinPrint.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Research Entries - ${eventDetails.name}</title>
                                <link rel="stylesheet" href="/client/component/otherComponent/style/review.css">
                                <style>
                                    @page { size: A4; margin: 0; }
                                </style>
                            </head>
                            <body>
                                ${PrintResearch({
                                    eventName: eventDetails.name,
                                    data: data,
                                    formData: formData
                                }).innerHTML}
                            </body>
                            </html>
                        `);
                        
                        WinPrint.document.close();
                        
                        WinPrint.onload = function() {
                            setTimeout(() => {
                                WinPrint.focus();
                                WinPrint.print();
                            }, 500);
                        };
                    }).catch(error => {
                        removeLoading();
                        alert('Error loading research entries. Please try again.');
                    });
                };
                
                const researchEntry = (eventDetails) => {
                    return ($({
                        tag: 'div',
                        style: {
                            marginTop: '2vh',
                            width: '100%',
                            textAlign: 'center',
                            fontSize: '1.1vw',
                            color: 'deepskyblue',
                            cursor: 'pointer',
                            fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '20px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #0d6efd',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#0d6efd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-print'
                                        },
                                        style: {
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Print Research Entry Summary'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation();
                                        createPrintModal(eventDetails);
                                    }
                                },
                                mouseenter: (e) => {
                                    e.target.style.backgroundColor = '#0d6efd';
                                    e.target.style.color = '#ffffff';
                                    const icon = e.target.querySelector('.fa-print');
                                    if (icon) icon.style.color = '#ffffff';
                                },
                                mouseleave: (e) => {
                                    e.target.style.backgroundColor = '#ffffff';
                                    e.target.style.color = '#0d6efd';
                                    const icon = e.target.querySelector('.fa-print');
                                    if (icon) icon.style.color = '#0d6efd';
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #ffc107',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#ffc107',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-certificate'
                                        },
                                        style: {
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Print Presentor Certificates'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation();
                                        createCertificateModal(eventDetails);
                                    }
                                },
                                mouseenter: (e) => {
                                    e.target.style.backgroundColor = '#ffc107';
                                    e.target.style.color = '#ffffff';
                                    const icon = e.target.querySelector('.fa-certificate');
                                    if (icon) icon.style.color = '#ffffff';
                                },
                                mouseleave: (e) => {
                                    e.target.style.backgroundColor = '#ffffff';
                                    e.target.style.color = '#ffc107';
                                    const icon = e.target.querySelector('.fa-certificate');
                                    if (icon) icon.style.color = '#ffc107';
                                }
                            })
                        ]
                    }))
                }
                
                const SelectEvent = () => {
                    let selVal
                    
                    return ($({
                        tag: 'div',
                        style: {
                            width: '100%',
                            marginTop: '0',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            backgroundColor: '#ffffff',
                            padding: '20px 24px',
                            borderRadius: '16px',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s ease'
                        },
                        child: [
                            $({
                                tag: "div",
                                att: {
                                    className: 'fa-solid fa-calendar-check'
                                },
                                style: {
                                    color: "#0d6efd",
                                    fontSize: '20px',
                                    margin: 'auto',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#e7f1ff',
                                    borderRadius: '12px',
                                    flexShrink: '0'
                                }
                            }),
                            $({
                                tag: 'select',
                                style: {
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '12px',
                                    width: '100%',
                                    height: '46px',
                                    outline: 'none',
                                    color: '#2c3e50',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px',
                                    padding: '0 16px',
                                    transition: 'all 0.2s ease',
                                    flex: '1'
                                },
                                elementHandler: (el) => {
                                    selVal = el
                                    
                                    el.addEventListener('focus', () => {
                                        el.style.borderColor = '#0d6efd';
                                        el.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                                    });
                                    el.addEventListener('blur', () => {
                                        el.style.borderColor = '#dee2e6';
                                        el.style.boxShadow = 'none';
                                    });
                                    
                                    const req = new Request('/eventRequest')
                                    req.Post([
                                        {
                                            name: 'getEventAdmin',
                                            value: '1'
                                        }
                                    ])
                                    req.Json()
                                    req.Send().then(data => {
                                        el.appendChild($({
                                            tag: 'option',
                                            text: '📋 Select Event',
                                            att: {
                                                disabled: true,
                                                selected: true
                                            },
                                            style: {
                                                backgroundColor: '#ffffff',
                                                color: '#6c757d',
                                                fontSize: '14px'
                                            }
                                        }))
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
                                                    fontSize: '14px',
                                                    padding: '8px'
                                                }
                                            }))
                                        })
                                    })
                                }
                            }),
                            $({
                                tag: "button",
                                att: {
                                    title: 'Load Event Data'
                                },
                                style: {
                                    padding: '10px 28px',
                                    backgroundColor: '#0d6efd',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    margin: '0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    flexShrink: '0'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-arrows-rotate'
                                        },
                                        style: {
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Load Data'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: () => {
                                        if (selVal.selectedIndex === 0) {
                                            alert('Please select an event first')
                                            return
                                        }
                                        
                                        let eventType = selVal.childNodes[selVal.selectedIndex].innerText
                                        eventTypeName = {
                                            name: eventType,
                                            eventId: selVal.childNodes[selVal.selectedIndex].id
                                        }
                                        
                                        bodCon.innerHTML = $({
                                            tag: 'div',
                                            style: {
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#6c757d',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-spinner fa-pulse' },
                                                    style: { fontSize: '24px', color: '#0d6efd', display: 'block', marginBottom: '12px' }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: 'Loading data...'
                                                })
                                            ]
                                        }).outerHTML
                                        
                                        const req = new Request('/entrycount')
                                        req.Post([
                                            {
                                                name: 'entryCounter',
                                                value: '1',
                                            },
                                            {
                                                name: 'eventType',
                                                value: eventType
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            bodCon.innerHTML = ''
                                            
                                            if (!data || data.length === 0) {
                                                bodCon.appendChild($({
                                                    tag: 'div',
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '40px',
                                                        color: '#6c757d',
                                                        fontSize: '14px',
                                                        fontFamily: 'Inter, sans-serif'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            att: { className: 'fa-solid fa-inbox' },
                                                            style: { fontSize: '32px', color: '#adb5bd', display: 'block', marginBottom: '12px' }
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            text: 'No data available for this event'
                                                        })
                                                    ]
                                                }))
                                                return
                                            }
                                    
                                            data.forEach(category => {
                                                bodCon.appendChild(contain({
                                                    category: category.name,
                                                    total: category.total,
                                                    eventType: eventType
                                                }))
                                            })
                                            
                                            bodCon.appendChild(printSummary(eventTypeName))
                                            bodCon.appendChild(researchEntry(eventTypeName))
                                        }).catch(error => {
                                            bodCon.innerHTML = ''
                                            bodCon.appendChild($({
                                                tag: 'div',
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    color: '#dc3545',
                                                    fontSize: '14px',
                                                    fontFamily: 'Inter, sans-serif'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: { className: 'fa-solid fa-circle-exclamation' },
                                                        style: { fontSize: '32px', color: '#dc3545', display: 'block', marginBottom: '12px' }
                                                    }),
                                                    $({
                                                        tag: 'div',
                                                        text: 'Error loading data. Please try again.'
                                                    })
                                                ]
                                            }))
                                        })
                                    }
                                },
                                mouseenter: (e) => {
                                    e.target.style.backgroundColor = '#0b5ed7';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(13,110,253,0.3)';
                                },
                                mouseleave: (e) => {
                                    e.target.style.backgroundColor = '#0d6efd';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }
                            })
                        ]
                    }))
                }
                
                const bod = () => {
                    const leb = (text) => {
                        return ($({
                            tag: 'div',
                            style: {
                                width: '50%',
                                height: 'fit-content',
                                margin: 'auto',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                color: '#495057',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            },
                            text: text
                        }))
                    }
                    return ($({
                        tag: 'div',
                        style: {
                            width: '100%',
                            margin: '0',
                            border: '1px solid #e9ecef',
                            backgroundColor: '#ffffff',
                            height: 'calc(85vh - 200px)',
                            minHeight: '400px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    height: '48px',
                                    width: '100%',
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    borderBottom: '1px solid #e9ecef'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            width: '5%',
                                            margin: 'auto',
                                            textAlign: 'center'
                                        }
                                    }),
                                    leb("CATEGORY"),
                                    leb("TOTAL ENTRIES"),
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    height: 'calc(100% - 40px)',
                                    width: '100%',
                                    overflowY: 'auto',
                                    padding: '10px 0 20px 0'
                                },
                                elementHandler: (el) => {
                                    bodCon = el
                                }
                            })
                        ]
                    }))
                }
                
                // Return the panel content WITHOUT header (CustomModal provides the title)
                return $({
                    tag: 'div',
                    style: {
                        padding: '0 4px'
                    },
                    child: [
                        SelectEvent(),
                        $({
                            tag: 'div',
                            style: { marginTop: '20px' },
                            child: [bod()]
                        })
                    ]
                })
            }
            
            // Return the button that opens the modal using CustomModal
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e9ecef',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#495057',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                },
                child: [
                    $({
                        tag: 'button',
                        att: {
                            title: 'View Summary by Category'
                        },
                        style: {
                            fontSize: '14px',
                            backgroundColor: '#ffffff',
                            border: 'none',
                            outline: 'none',
                            width: 'fit-content',
                            height: 'fit-content',
                            cursor: 'pointer',
                            color: '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 18px',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderRadius: '10px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-chart-pie' },
                                style: {
                                    fontSize: '14px',
                                    color: '#0d6efd',
                                    transition: 'color 0.2s ease'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Entry Summary',
                                style: {
                                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-chevron-right' },
                                style: {
                                    fontSize: '11px',
                                    color: '#adb5bd',
                                    transition: 'transform 0.2s ease, color 0.2s ease',
                                    marginLeft: '4px'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                CustomModal({
                                    title: 'Entries Summary By Category',
                                    size: 'large',
                                    content: ReportPanel,
                                    showCloseButton: true,
                                    closeOnOverlayClick: true
                                });
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.color = '#0d6efd';
                            const pieIcon = e.target.querySelector('.fa-chart-pie');
                            if (pieIcon) pieIcon.style.color = '#0d6efd';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.color = '#495057';
                            const pieIcon = e.target.querySelector('.fa-chart-pie');
                            if (pieIcon) pieIcon.style.color = '#0d6efd';
                        }
                    })
                ]
            }))
        }
        
        const Filter = () => {
            let currentPage = 1;
            let currentEventId = '0';
            let isLoading = false;
            let hasMore = true;
            let totalDocuments = 0;
            
            return $({
                tag: 'div',
                style: {
                    width: 'auto',
                    display: 'inline-flex'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: 'fit-content',
                            height: 'fit-content',
                            border: '1px solid #e9ecef',
                            margin: '0',
                            padding: '4px',
                            borderRadius: '12px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            alignItems: 'center',
                            gap: '4px'
                        },
                        child: [
                            $({
                                tag: 'select',
                                att: {
                                    id: 'eventSelectFilter'
                                },
                                style: {
                                    backgroundColor: '#ffffff',
                                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '10px',
                                    outline: 'none',
                                    color: '#2c3e50',
                                    width: '200px',
                                    height: '38px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                },
                                elementHandler: (el) => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: '📋 All Events',
                                        style: {
                                            backgroundColor: '#ffffff',
                                            color: '#2c3e50',
                                            fontSize: '14px',
                                            padding: '8px'
                                        },
                                        att: {
                                            value: '0',
                                            selected: true
                                        }
                                    }))
                                    
                                    const req = new Request('/eventRequest');
                                    req.Post([
                                        {
                                            name: 'getEventAdmin',
                                            value: '1'
                                        }
                                    ]);
                                    req.Json();
                                    req.Send().then(data => {
                                        if (data && Array.isArray(data)) {
                                            data.forEach(val => {
                                                el.appendChild($({
                                                    tag: 'option',
                                                    text: val.name,
                                                    style: {
                                                        backgroundColor: '#ffffff',
                                                        color: '#2c3e50',
                                                        fontSize: '14px',
                                                        padding: '8px'
                                                    },
                                                    att: {
                                                        value: val.id
                                                    }
                                                }))
                                            })
                                        }
                                    })
                                },
                                event: {
                                    type: 'change',
                                    method: (e) => {
                                        currentPage = 1;
                                        currentEventId = e.target.value || '0';
                                        
                                        if (serch && serch.value) {
                                            serch.value = '';
                                        }
                                        
                                        loadDocuments(currentEventId, 1);
                                    }
                                },
                                mouseenter: (e) => {
                                    e.target.style.borderColor = '#0d6efd';
                                },
                                mouseleave: (e) => {
                                    e.target.style.borderColor = '#e9ecef';
                                }
                            }),
                            $({
                                tag: 'div',
                                att: {
                                    className: 'fa-solid fa-arrows-rotate',
                                    title: 'Refresh Documents',
                                    id: 'refreshBtn'
                                },
                                style: {
                                    margin: '0',
                                    fontSize: '14px',
                                    color: '#6c757d',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8f9fa'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        currentPage = 1;
                                        
                                        const eventSelect = document.getElementById('eventSelectFilter');
                                        
                                        if (!eventSelect) {
                                            console.error('Could not find event select element!');
                                            return;
                                        }
                                        
                                        currentEventId = eventSelect.value || '0';
                                        
                                        if (serch && serch.value) {
                                            serch.value = '';
                                        }
                                        
                                        loadDocuments(currentEventId, 1);
                                    }
                                },
                                mouseenter: (e) => {
                                    e.target.style.backgroundColor = '#e7f1ff';
                                    e.target.style.color = '#0d6efd';
                                    e.target.style.transform = 'rotate(15deg)';
                                },
                                mouseleave: (e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.color = '#6c757d';
                                    e.target.style.transform = 'rotate(0deg)';
                                }
                            })
                        ]
                    })
                ],
            });
            
            function loadDocuments(eventId, page) {
                if (isLoading) return;
                
                isLoading = true;

                if (researchBody) {
                    researchBody.innerHTML = '';
                    researchBody.appendChild($({
                        tag: 'div',
                        att: { id: 'loadingIndicator' },
                        style: {
                            textAlign: 'center',
                            padding: '40px',
                            color: '#6c757d',
                            fontSize: '14px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            margin: '20px',
                            border: '1px solid #f0f0f0',
                            fontFamily: 'Inter, sans-serif'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-spinner fa-pulse' },
                                        style: { fontSize: '24px', color: '#0d6efd' }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'Loading documents...'
                                    })
                                ]
                            })
                        ]
                    }));
                }
                
                const formData = new FormData();
                formData.append('requestEventRDE', '1');
                formData.append('eventId', eventId);
                formData.append('page', page);
                formData.append('limit', 10);
                
                fetch('/eventRequest', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(response => {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.remove();
                    }
                    
                    if (response.error) {
                        showError('Server error: ' + response.error);
                        return;
                    }
                    
                    if (!response.data || !Array.isArray(response.data)) {
                        showError('Invalid response format from server');
                        return;
                    }
                    
                    const data = response.data;
                    hasMore = response.hasMore;
                    totalDocuments = response.total;
                    currentPage = page;
                    
                    if (researchBody) {
                        researchBody.innerHTML = '';
                    }
                    
                    if (data.length === 0) {
                        const eventSelect = document.getElementById('eventSelectFilter');
                        const selectedText = eventSelect ? eventSelect.options[eventSelect.selectedIndex].text : 'Selected event';
                        
                        if (researchBody) {
                            researchBody.appendChild($({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#6c757d',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    margin: '20px',
                                    border: '1px solid #f0f0f0',
                                    fontFamily: 'Inter, sans-serif'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-folder-open' },
                                        style: { fontSize: '48px', color: '#adb5bd', marginBottom: '16px', display: 'block' }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `No documents found for "${selectedText}"`
                                    })
                                ]
                            }));
                        }
                    } else {
                        const navDiv = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                color: '#0d6efd',
                                fontSize: '13px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '10px',
                                margin: '0 0 16px 0',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '500'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', alignItems: 'center', gap: '8px' },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-chart-simple' }, style: { fontSize: '12px' } }),
                                        $({ tag: 'span', text: `Page ${page} of ${response.totalPages || '?'}` })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', alignItems: 'center', gap: '8px' },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-file-lines' }, style: { fontSize: '12px' } }),
                                        $({ tag: 'span', text: `Total: ${totalDocuments} document(s)` })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d' },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-eye' }, style: { fontSize: '12px' } }),
                                        $({ tag: 'span', text: `Showing ${((page - 1) * 10) + 1} to ${Math.min(page * 10, totalDocuments)}` })
                                    ]
                                })
                            ]
                        });
                        
                        if (researchBody) {
                            researchBody.appendChild(navDiv);
                            
                            data.forEach((val, index) => {
                                researchBody.appendChild(ResearchDocs({
                                    category: val.category,
                                    center: val.center,
                                    title: val.title,
                                    author: val.author,
                                    file: val.file,
                                    eventTYpe: val.event,
                                    campus: val.campus,
                                    deleteRequest: val.deletestate,
                                    docId: val.id,
                                    endorseId: val.endorsId,
                                    mainFrame: mainFrame 
                                }));
                            });
                            
                            const paginationDiv = $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '12px',
                                    margin: '24px auto',
                                    padding: '16px'
                                },
                                child: []
                            });
                            
                            if (page > 1) {
                                const prevBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '8px 20px',
                                        backgroundColor: '#ffffff',
                                        color: '#0d6efd',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-chevron-left' }, style: { fontSize: '11px' } }),
                                        $({ tag: 'span', text: 'Previous' })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            loadDocuments(currentEventId, page - 1);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#0d6efd';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                });
                                paginationDiv.appendChild(prevBtn);
                            }
                            
                            const totalPages = response.totalPages || 1;
                            const maxVisible = 5;
                            let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            if (endPage - startPage + 1 < maxVisible) {
                                startPage = Math.max(1, endPage - maxVisible + 1);
                            }
                            
                            for (let i = startPage; i <= endPage; i++) {
                                const pageBtn = $({
                                    tag: 'button',
                                    text: i.toString(),
                                    style: {
                                        padding: '8px 14px',
                                        backgroundColor: i === page ? '#0d6efd' : '#ffffff',
                                        color: i === page ? '#ffffff' : '#495057',
                                        border: i === page ? '1px solid #0d6efd' : '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: i === page ? '600' : '400'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            if (i !== page) {
                                                loadDocuments(currentEventId, i);
                                            }
                                        }
                                    },
                                    mouseenter: (e) => {
                                        if (i !== page) {
                                            e.target.style.backgroundColor = '#f8f9fa';
                                            e.target.style.borderColor = '#0d6efd';
                                        }
                                    },
                                    mouseleave: (e) => {
                                        if (i !== page) {
                                            e.target.style.backgroundColor = '#ffffff';
                                            e.target.style.borderColor = '#dee2e6';
                                        }
                                    }
                                });
                                paginationDiv.appendChild(pageBtn);
                            }
                            
                            if (hasMore && page < totalPages) {
                                const nextBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '8px 20px',
                                        backgroundColor: '#ffffff',
                                        color: '#0d6efd',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    },
                                    child: [
                                        $({ tag: 'span', text: 'Next' }),
                                        $({ tag: 'span', att: { className: 'fa-solid fa-chevron-right' }, style: { fontSize: '11px' } })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            loadDocuments(currentEventId, page + 1);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#0d6efd';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                });
                                paginationDiv.appendChild(nextBtn);
                            }
                            
                            researchBody.appendChild(paginationDiv);
                            
                            if (totalPages > 5) {
                                const pageNavDiv = $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginTop: '16px',
                                        padding: '12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '10px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            style: { color: '#6c757d', fontSize: '13px', fontFamily: 'Inter, sans-serif' },
                                            text: 'Go to page:'
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'number',
                                                min: '1',
                                                max: totalPages,
                                                value: page
                                            },
                                            style: {
                                                width: '70px',
                                                padding: '6px 10px',
                                                backgroundColor: '#ffffff',
                                                color: '#2c3e50',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                                fontSize: '13px',
                                                fontFamily: 'Inter, sans-serif'
                                            },
                                            event: {
                                                type: 'change',
                                                method: (e) => {
                                                    const goToPage = parseInt(e.target.value);
                                                    if (goToPage >= 1 && goToPage <= totalPages) {
                                                        loadDocuments(currentEventId, goToPage);
                                                    } else {
                                                        e.target.value = page;
                                                    }
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            style: { color: '#adb5bd', fontSize: '13px', fontFamily: 'Inter, sans-serif' },
                                            text: `of ${totalPages}`
                                        })
                                    ]
                                });
                                researchBody.appendChild(pageNavDiv);
                            }
                        }
                    }
                    
                    isLoading = false;
                })
                .catch(error => {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.remove();
                    }
                    
                    showError('Error: ' + error.message);
                    isLoading = false;
                });
            }
            
            function showError(message) {
                if (researchBody) {
                    researchBody.innerHTML = '';
                    researchBody.appendChild($({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#dc3545',
                            fontSize: '14px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            margin: '20px',
                            border: '1px solid #ffe5e5',
                            fontFamily: 'Inter, sans-serif'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-circle-exclamation' },
                                style: { fontSize: '48px', color: '#dc3545', marginBottom: '16px', display: 'block' }
                            }),
                            $({ tag: 'div', text: message })
                        ]
                    }));
                }
            }
        }
        
        const Score = () => {
            return ($({
                tag: 'div',
                style: {
                    margin: '0',
                    display: 'inline-flex'
                },
                child: [
                    $({
                        tag: 'a',
                        att: {
                            href: '/rdeOffice/research/scoreSummary',
                            title: 'View Score Summary'
                        },
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 18px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e9ecef',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#495057',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-ranking-star' },
                                style: {
                                    fontSize: '14px',
                                    color: '#ffc107',
                                    transition: 'color 0.2s ease'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Score Summary'
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-chevron-right' },
                                style: {
                                    fontSize: '11px',
                                    color: '#adb5bd',
                                    transition: 'transform 0.2s ease, color 0.2s ease',
                                    marginLeft: '4px'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                console.log('Navigating to Score Summary');
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#0d6efd';
                            e.target.style.color = '#0d6efd';
                            const chevron = e.target.querySelector('.fa-chevron-right');
                            if (chevron) {
                                chevron.style.color = '#0d6efd';
                                chevron.style.transform = 'translateX(3px)';
                            }
                            const starIcon = e.target.querySelector('.fa-ranking-star');
                            if (starIcon) starIcon.style.color = '#0d6efd';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#e9ecef';
                            e.target.style.color = '#495057';
                            const chevron = e.target.querySelector('.fa-chevron-right');
                            if (chevron) {
                                chevron.style.color = '#adb5bd';
                                chevron.style.transform = 'translateX(0)';
                            }
                            const starIcon = e.target.querySelector('.fa-ranking-star');
                            if (starIcon) starIcon.style.color = '#ffc107';
                        }
                    })
                ]
            }))
        }
        
        const EndorsementPanel = () => {
            let currentPage = 1
            let isLoading = false
            let hasMore = true
            let totalEndorsements = 0
            let totalPages = 1
            
            const File = ({camp, eventName, date, id, research, resStat}) => {
                let dropList, stateDrop = false
                
                const openFileInModal = (fileUrl) => {
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
                        
                        const isGoogleDriveUrl = fileUrl && (fileUrl.includes('drive.google.com') || fileUrl.includes('/d/'));
                        
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
                            
                            if (!fileId && fileUrl.includes('drive.google.com')) {
                                const urlParts = fileUrl.split('/');
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
                                            <h3 style="font-family: Inter, sans-serif; color: #1a1a2e;">Unable to load document</h3>
                                            <a href="${fileUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Open in Google Drive</a>
                                        </div>
                                    `;
                                };
                                
                                container.appendChild(iframe);
                            }
                        } else {
                            const objectEl = $({
                                tag: 'object',
                                att: {
                                    data: '/' + fileUrl,
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
                                                <a href="/${fileUrl}" target="_blank" style="padding: 10px 20px; background: #0d6efd; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">Download PDF</a>
                                            </div>
                                        `;
                                    };
                                }
                            });
                            container.appendChild(objectEl);
                        }
                        
                        return container;
                    };
                    
                    CustomModal({
                        title: 'Document Viewer',
                        size: 'large',
                        content: createViewerContent,
                        showCloseButton: true,
                        closeOnOverlayClick: true
                    });
                };
                
                const ViewEn = () => {
                    let main
                    
                    const innerPanel = (src) => {
                        const closeButton = $({
                            tag: 'button',
                            att: {
                                'aria-label': 'Close',
                                'title': 'Close'
                            },
                            style: {
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                width: '36px',
                                height: '36px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                zIndex: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-xmark' },
                                    style: { fontSize: '20px', color: '#6c757d' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => main.remove()
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                                e.target.style.borderColor = '#dee2e6';
                                const icon = e.target.querySelector('.fa-xmark');
                                if (icon) icon.style.color = '#dc3545';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.borderColor = '#e9ecef';
                                const icon = e.target.querySelector('.fa-xmark');
                                if (icon) icon.style.color = '#6c757d';
                            }
                        });
                        
                        openFileInModal(src);
                        return null;
                    };
                    
                    const SaveResearch = () => {
                        return $({
                            tag: 'button',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#28a745',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-save' }, style: { fontSize: '14px' } }),
                                $({ tag: 'span', text: 'Save all documents' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    (async function (endorsementId) {
                                        let loading = Waiting()
                                        document.body.appendChild(loading)
                                        const remove = () => loading.remove()
                                        
                                        const form = new FormData()
                                        form.append('saveResearchPer', 'true')
                                        form.append('endorseId', endorsementId)
                                        form.append('campus', camp)
                                        form.append('eventType', eventName)
                                        
                                        await fetch('/uploadResearchFile', {
                                            method: 'POST',
                                            body: form
                                        }).then(res => {
                                            if (res.ok) {
                                                remove()
                                                return res.json()
                                            }
                                        }).then(dat => {
                                            if (dat && dat.status) {
                                                document.body.appendChild(ConfirmationAlert("Success..!", () => window.location.reload()))
                                            } else if (dat) {
                                                alert(dat.message)
                                            }
                                        }).catch(err => {
                                            remove()
                                            alert('Error saving documents. Please try again.')
                                        })
                                    })(id)
                                }
                            },
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#218838';
                                e.target.style.transform = 'translateY(-1px)';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.transform = 'translateY(0)';
                            }
                        })
                    }
                    
                    const Return = () => {
                        return $({
                            tag: 'button',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#dc3545',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-arrow-left' }, style: { fontSize: '14px' } }),
                                $({ tag: 'span', text: 'Return' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    const req = new Request('/endorsement')
                                    req.Post([
                                        { name: 'returnDocs', value: '1' },
                                        { name: 'docId', value: id }
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
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#c82333';
                                e.target.style.transform = 'translateY(-1px)';
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#dc3545';
                                e.target.style.transform = 'translateY(0)';
                            }
                        })
                    }
                    
                    const fetchAndOpenFile = async () => {
                        const form = new FormData();
                        form.append('requestFileEndorse', 'true');
                        form.append('docId', id);
                        
                        const response = await fetch('/endorsement', {
                            method: 'POST',
                            body: form
                        });
                        const data = await response.json();
                        if (data.res && data.res.fileUrl) {
                            openFileInModal(data.res.fileUrl);
                        }
                    };
                    
                    fetchAndOpenFile();
                    return null;
                }
                
                const open = () => {
                    return $({
                        tag: 'button',
                        att: {
                            className: "fa-regular fa-folder-open",
                            title: "Open Document"
                        },
                        style: {
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: '#0d6efd',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                ViewEn();
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#0d6efd';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#e9ecef';
                        }
                    })
                }
                
                const dropDown = () => {
                    let lis
                    
                    const ListRes = () => {
                        return $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                                marginTop: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            },
                            elementHandler: (el) => {
                                lis = el
                                research.forEach(val => {
                                    el.appendChild($({
                                        tag: "div",
                                        style: {
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '13px',
                                            fontFamily: 'Inter, sans-serif',
                                            color: '#2c3e50'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: { marginBottom: '4px' },
                                                child: [
                                                    $({ tag: 'span', text: 'Author: ', style: { fontWeight: '600', color: '#0d6efd' } }),
                                                    $({ tag: 'span', text: val.author })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: { marginBottom: '4px' },
                                                child: [
                                                    $({ tag: 'span', text: 'Category: ', style: { fontWeight: '600', color: '#0d6efd' } }),
                                                    $({ tag: 'span', text: val.category })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                child: [
                                                    $({ tag: 'span', text: 'Title: ', style: { fontWeight: '600', color: '#0d6efd' } }),
                                                    $({ tag: 'span', text: val.title })
                                                ]
                                            })
                                        ]
                                    }))
                                })
                            }
                        })
                    }
                    
                    return $({
                        tag: 'button',
                        att: {
                            className: 'fa-solid fa-chevron-down',
                            title: 'Toggle Details'
                        },
                        style: {
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#6c757d',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        event: {
                            type: 'click',
                            method: (eve) => {
                                stateDrop = !stateDrop
                                if (stateDrop) {
                                    eve.target.className = 'fa-solid fa-chevron-up'
                                    const listRes = ListRes()
                                    dropList.appendChild(listRes)
                                } else {
                                    eve.target.className = 'fa-solid fa-chevron-down'
                                    if (dropList.firstChild) dropList.removeChild(dropList.firstChild)
                                }
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa';
                            e.target.style.borderColor = '#0d6efd';
                            e.target.style.color = '#0d6efd';
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.borderColor = '#e9ecef';
                            e.target.style.color = '#6c757d';
                        }
                    })
                }
                
                const campusEl = $({
                    tag: 'div',
                    style: {
                        fontSize: '13px',
                        width: '15%',
                        padding: '0 8px',
                        fontFamily: 'Inter, sans-serif',
                        color: '#495057',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    },
                    text: camp
                })
                
                const eventTypeEl = $({
                    tag: 'div',
                    style: {
                        fontSize: '13px',
                        padding: '0 8px',
                        width: '40%',
                        fontFamily: 'Inter, sans-serif',
                        color: '#495057',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    },
                    text: eventName
                })
                
                const dateEn = $({
                    tag: 'div',
                    style: {
                        fontSize: '13px',
                        padding: '0 8px',
                        width: '15%',
                        fontFamily: 'Inter, sans-serif',
                        color: '#6c757d'
                    },
                    text: date
                })
                
                return $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: 'fit-content',
                        marginBottom: '12px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: resStat * 1 !== 0 ? '#f8f9fa' : '#ffffff',
                                border: '1px solid #e9ecef',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            },
                            att: { className: 'endorsFile' },
                            elementHandler: (el) => {
                                el.addEventListener('mouseenter', () => {
                                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                });
                                el.addEventListener('mouseleave', () => {
                                    el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                                });
                            },
                            child: [
                                dropDown(),
                                open(),
                                campusEl,
                                eventTypeEl,
                                dateEn
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: 'calc(100% - 32px)',
                                marginLeft: '32px',
                                marginTop: '8px'
                            },
                            elementHandler: (el) => {
                                dropList = el
                            }
                        })
                    ]
                })
            }
            
            function loadEndorsements(page) {
                if (isLoading) return;
                
                isLoading = true;
                currentPage = page;
                
                if (endorseBody) {
                    endorseBody.innerHTML = '';
                    endorseBody.appendChild($({
                        tag: 'div',
                        att: { id: 'loadingIndicator' },
                        style: {
                            textAlign: 'center',
                            padding: '60px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e9ecef'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
                                child: [
                                    $({ tag: 'span', att: { className: 'fa-solid fa-spinner fa-pulse' }, style: { fontSize: '32px', color: '#0d6efd' } }),
                                    $({ tag: 'div', text: 'Loading endorsements...', style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6c757d' } })
                                ]
                            })
                        ]
                    }));
                }
                
                const form = new FormData();
                form.append('endorsementList', 'true');
                form.append('page', page);
                form.append('limit', 10);
                
                fetch('/endorsement', {
                    method: 'POST',
                    body: form
                })
                .then(response => response.json())
                .then(response => {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    if (loadingIndicator) loadingIndicator.remove();
                    
                    if (response.error) {
                        showEndorsementError('Server error: ' + response.error);
                        return;
                    }
                    
                    if (!response.data || !Array.isArray(response.data)) {
                        showEndorsementError('Invalid response format from server');
                        return;
                    }
                    
                    const data = response.data;
                    totalPages = response.totalPages;
                    totalEndorsements = response.total;
                    
                    if (endorseBody) endorseBody.innerHTML = '';
                    
                    if (data.length === 0) {
                        if (endorseBody) {
                            endorseBody.appendChild($({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    padding: '60px',
                                    color: '#6c757d',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    border: '1px solid #e9ecef'
                                },
                                child: [
                                    $({ tag: 'span', att: { className: 'fa-solid fa-inbox' }, style: { fontSize: '48px', color: '#adb5bd', marginBottom: '16px', display: 'block' } }),
                                    $({ tag: 'div', text: 'No endorsements found' })
                                ]
                            }));
                        }
                    } else {
                        if (endorseBody) {
                            endorseBody.appendChild($({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '10px',
                                    marginBottom: '20px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '13px'
                                },
                                child: [
                                    $({ tag: 'span', text: `Page ${currentPage} of ${totalPages}`, style: { color: '#0d6efd', fontWeight: '500' } }),
                                    $({ tag: 'span', text: `Total: ${totalEndorsements} endorsement(s)`, style: { color: '#28a745', fontWeight: '500' } }),
                                    $({ tag: 'span', text: `Showing ${((currentPage - 1) * 10) + 1} to ${Math.min(currentPage * 10, totalEndorsements)}`, style: { color: '#6c757d' } })
                                ]
                            }));
                            
                            data.forEach(val => {
                                endorseBody.appendChild(File({
                                    camp: val.campus,
                                    eventName: val.event,
                                    date: val.date?.split(' ')[0] || '',
                                    id: val.id,
                                    research: val.research || [],
                                    resStat: val.resStat
                                }));
                            });
                            
                            const paginationDiv = $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '12px',
                                    margin: '24px auto',
                                    padding: '16px'
                                },
                                child: []
                            });
                            
                            if (currentPage > 1) {
                                const prevBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '8px 20px',
                                        backgroundColor: '#ffffff',
                                        color: '#0d6efd',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500'
                                    },
                                    text: '← Previous',
                                    event: {
                                        type: 'click',
                                        method: () => loadEndorsements(currentPage - 1)
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#0d6efd';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                });
                                paginationDiv.appendChild(prevBtn);
                            }
                            
                            for (let i = 1; i <= Math.min(totalPages, 5); i++) {
                                const pageBtn = $({
                                    tag: 'button',
                                    text: i.toString(),
                                    style: {
                                        padding: '8px 14px',
                                        backgroundColor: i === currentPage ? '#0d6efd' : '#ffffff',
                                        color: i === currentPage ? '#ffffff' : '#495057',
                                        border: i === currentPage ? '1px solid #0d6efd' : '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: i === currentPage ? '600' : '400'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            if (i !== currentPage) loadEndorsements(i);
                                        }
                                    }
                                });
                                paginationDiv.appendChild(pageBtn);
                            }
                            
                            if (currentPage < totalPages) {
                                const nextBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '8px 20px',
                                        backgroundColor: '#ffffff',
                                        color: '#0d6efd',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500'
                                    },
                                    text: 'Next →',
                                    event: {
                                        type: 'click',
                                        method: () => loadEndorsements(currentPage + 1)
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#0d6efd';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#dee2e6';
                                    }
                                });
                                paginationDiv.appendChild(nextBtn);
                            }
                            
                            endorseBody.appendChild(paginationDiv);
                        }
                    }
                    
                    isLoading = false;
                })
                .catch(error => {
                    const loadingIndicator = document.getElementById('loadingIndicator');
                    if (loadingIndicator) loadingIndicator.remove();
                    showEndorsementError('Error: ' + error.message);
                    isLoading = false;
                });
            }
            
            function showEndorsementError(message) {
                if (endorseBody) {
                    endorseBody.innerHTML = '';
                    endorseBody.appendChild($({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            padding: '60px',
                            color: '#dc3545',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #ffe5e5'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-circle-exclamation' }, style: { fontSize: '48px', color: '#dc3545', marginBottom: '16px', display: 'block' } }),
                            $({ tag: 'div', text: message })
                        ]
                    }));
                }
            }
            
            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    margin: '0',
                    padding: '0',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    overflowY: 'auto',
                    minHeight: '400px'
                },
                elementHandler: (el) => {
                    endorseBody = el;
                    loadEndorsements(1);
                }
            })
        }
        
        const ResearchPanel = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '98%',
                    margin: '1vh auto auto',
                    height: '82%',
                    backgroundColor: 'ghostwhite',
                    overflowY: 'auto',
                    boxShadow: 'inset .3vw .3vw 2vh .1vh black',
                },
                elementHandler: async (el) => {
                    researchBody = el
                    const form = new FormData()
                    form.append('researchDocsNew', 'true')
                    await fetch('/uploadResearchFile', {
                        method: 'POST',
                        body: form
                    }).then(res => res.json())
                        .then(data => {
                            data.forEach(val => {
                                el.appendChild(ResearchDocs({
                                    category: val.category,
                                    center: val.center,
                                    title: val.title,
                                    author: val.author,
                                    file: val.file,
                                    eventTYpe: val.event,
                                    campus: val.campus,
                                    deleteRequest: val.deletestate,
                                    docId: val.id,
                                    endorseId:val.endorsId,
                                    mainFrame: mainFrame
                                }))
                            })
                        })
                },
            }))
        }
        
        let Bod
        const ButtonsTabs = []
        let enBot, resBot
        const getBot = {
            getEndorse: (el) => {
                enBot = el
            },
            getResdoc: (el) => {
                resBot = el
            }
        }
        const tabs = [
            { id: 'entrylist', label: 'Entry List', icon: 'fa-solid fa-file-lines' },
            { id: 'endorsement', label: 'Endorsement', icon: 'fa-solid fa-pen-to-square' },
            { id: 'poster', label: 'Poster', icon: 'fa-solid fa-image' }
        ]

        let currentTab = 'entrylist'

        const TabsContainer = () => {
            return $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'fit-content',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 20px',
                    borderBottom: '1px solid #e9ecef'
                },
                elementHandler: (container) => {
                    tabs.forEach(tab => {
                        const tabBtn = $({
                            tag: 'button',
                            att: { className: `modern-tab-${tab.id}` },
                            style: {
                                padding: '8px 24px',
                                backgroundColor: currentTab === tab.id ? '#0d6efd' : '#ffffff',
                                color: currentTab === tab.id ? '#ffffff' : '#6c757d',
                                border: `1px solid ${currentTab === tab.id ? '#0d6efd' : '#dee2e6'}`,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: currentTab === tab.id ? '600' : '400',
                                boxShadow: currentTab === tab.id ? '0 2px 4px rgba(13,110,253,0.2)' : 'none'
                            },
                            child: [
                                $({ 
                                    tag: 'span', 
                                    att: { className: tab.icon }, 
                                    style: { fontSize: '14px' } 
                                }),
                                $({ 
                                    tag: 'span', 
                                    text: tab.label,
                                    style: { fontWeight: 'inherit' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    currentTab = tab.id
                                    
                                    tabs.forEach(t => {
                                        const btn = document.querySelector(`.modern-tab-${t.id}`)
                                        if (btn) {
                                            if (t.id === currentTab) {
                                                btn.style.backgroundColor = '#0d6efd'
                                                btn.style.color = '#ffffff'
                                                btn.style.borderColor = '#0d6efd'
                                                btn.style.fontWeight = '600'
                                                btn.style.boxShadow = '0 2px 4px rgba(13,110,253,0.2)'
                                            } else {
                                                btn.style.backgroundColor = '#ffffff'
                                                btn.style.color = '#6c757d'
                                                btn.style.borderColor = '#dee2e6'
                                                btn.style.fontWeight = '400'
                                                btn.style.boxShadow = 'none'
                                            }
                                        }
                                    })
                                    
                                    if (!Bod) {
                                        console.warn('Bod container not initialized yet')
                                        return
                                    }
                                    
                                    Bod.innerHTML = ''
                                    
                                    if (currentTab === 'entrylist') {
                                        Bod.appendChild(search({
                                            tools: tools(),
                                            searchEvent: searchInput
                                        }))
                                        Bod.appendChild($({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                width: '100%',
                                                height: 'fit-content',
                                                marginTop: '12px',
                                                gap: '12px',
                                                padding: '0 8px'
                                            },
                                            child: [
                                                Filter(),
                                                Score(),
                                                Report()
                                            ]
                                        }))
                                        Bod.appendChild(ResearchPanel())
                                    } else if (currentTab === 'endorsement') {
                                        Bod.appendChild(search({
                                            searchEvent: (value) => {
                                                if (!endorseBody) return
                                                let input = value.target.value.toUpperCase().replace(' ', '')
                                                const child = endorseBody.childNodes
                                                for (let x = 0; x < child.length; x++) {
                                                    let chl = child[x].innerText.toUpperCase().replace(' ', '')
                                                    if (!chl.includes(input)) {
                                                        child[x].style.display = 'none'
                                                    } else {
                                                        child[x].style.display = 'block'
                                                    }
                                                    if (input.value === '') {
                                                        child[x].style.display = 'block'
                                                    }
                                                }
                                            }
                                        }))
                                        Bod.appendChild(EndorsementPanel())
                                    } else if (currentTab === 'poster') {
                                        // ===== POSTER TAB =====
                                        // Clear Bod
                                        Bod.innerHTML = ''
                                        Bod.style.padding = '0'
                                        Bod.style.margin = '0'
                                        Bod.style.height = '100%'
                                        Bod.style.width = '100%'
                                        Bod.style.overflow = 'hidden'
                                        Bod.style.backgroundColor = '#f8f9fa'
                                        
                                        // Create a full-size container for the poster view
                                        const posterContainer = $({
                                            tag: 'div',
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                minHeight: 'calc(100vh - 250px)',
                                                overflow: 'auto',
                                                padding: '0',
                                                margin: '0'
                                            },
                                            elementHandler: (el) => {
                                                // Load the PosterForwarded component
                                                try {
                                                    const posterView = PosterForwarded(mainFrame, leftPDiv)
                                                    el.appendChild(posterView)
                                                } catch (error) {
                                                    console.error('Error loading PosterForwarded:', error)
                                                    el.innerHTML = `
                                                        <div style="text-align:center;padding:40px;color:#ef4444;">
                                                            <i class="fas fa-exclamation-triangle" style="font-size:32px;display:block;margin-bottom:16px;"></i>
                                                            <div style="font-size:16px;font-weight:500;">Failed to load posters</div>
                                                            <div style="font-size:13px;color:#94a3b8;margin-top:8px;">${error.message}</div>
                                                            <button onclick="location.reload()" style="margin-top:16px;padding:8px 24px;background:#1976D2;color:white;border:none;border-radius:8px;cursor:pointer;">Refresh</button>
                                                        </div>
                                                    `
                                                }
                                            }
                                        })
                                        Bod.appendChild(posterContainer)
                                    }
                                }
                            }
                        })
                        container.appendChild(tabBtn)
                    })
                }
            })
        }

        const Tabs = () => {
            return TabsContainer()
        }
        
        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                Tabs(),
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        flex: '1',
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa',
                        padding: '16px'
                    },
                    elementHandler: (el) => {
                        Bod = el
                        // Initial load - Entry List
                        Bod.appendChild(search({
                            tools: tools(),
                            searchEvent: searchInput
                        }))
                        Bod.appendChild($({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%',
                                height: 'fit-content',
                                marginTop: '12px',
                                gap: '12px',
                                padding: '0 8px'
                            },
                            child: [
                                Filter(),
                                Score(),
                                Report()
                            ]
                        }))
                        Bod.appendChild(ResearchPanel())
                    }
                })
            ]
        }))
    }
    
    return ContentComponent()
}
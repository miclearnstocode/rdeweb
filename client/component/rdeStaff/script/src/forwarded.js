import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting, CustomModal } from "../../../../lib/lib.js";
import { Print } from "../../../otherComponent/comment.js";
import { PrintSummary } from "../../../otherComponent/ReviewTemplate.js";
import { Route, Router } from "../../../../lib/Router.js";
import { RankDocs } from "./docsRank.js";
import { FinalRanking, RankPerCriteria, ScoreRankAVe } from "./rankAlgo.js";
import { Summary } from "./Summary.js";
import { PrintResearch } from "../../../otherComponent/researchSummary.js";

export const Forwarded = (mainFrame, leftPDiv = null) => { //position at the right panel
        let researchBody, endorseBody, serch, Bod

        const ResearchDocs = ({category, center,file, docId, title, author, eventTYpe, deleteRequest, campus,endorseId, mainFrame}) => {
            const resDetails = () => {
                const details = (label, data) => {
                    return ($({
                        tag: 'div',
                        text: label,
                        style: {
                            width: '100%',
                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize: '1vw',
                            color: 'deepskyblue',
                            display: 'flex'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: data,
                                style: {
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif ',
                                    color: '#ddd',
                                    fontSize: '1vw',
                                    marginLeft: '.5vw',
                                    fontWeight: 'normal',
                                    width: '100%',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }
                            })
                        ]
                    }))
                }
                // Get the appropriate file display - handle both formats
                const displayFile = file ? 
                    (typeof file === 'string' ? file : 
                        (file.drive_view_url || file.viewUrl || file.fileUrl || file.legacyFile || 'No file')) 
                    : 'No file';

                const bot = ({label, event,tooltip}) => {
                    return ($({
                        tag: 'div',
                        style: {
                            width: 'fit-content',
                            paddingRight: '1vw',
                            paddingLeft: '1vw',
                            //     fontFamily: 'arial black,sans-serif',
                            cursor: 'pointer',
                            fontSize: '1.5vw'
                        },
                        att: {
                            className: `botMe ${label}`,
                            title:tooltip
                        },
                        event: {
                            type: 'click',
                            method: event
                        }
                    }))
                }
                const getDel = (el) => {
                    if (deleteRequest !== null) {
                        el.style.color = 'ghostwhite'
                    }
                }
                let recDelP
                const getrecDel = (el) => {
                    recDelP = el
                }
                const deletePanel = () => {
                    const messagePanel = () => {
                        const Reason = $({
                            tag: 'textarea',
                            style: {
                                height: '40vh',
                                width: '40vw',
                                color: '#bbb',
                                fontSize: '1.2vw',
                                fontFamily: 'monospace',
                                backgroundColor: '#333',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                padding: '.5rem'
                            },
                            att: {
                                placeholder: 'Insert text here'
                            }
                        })
                        const Controller = () => {
                            const Button = ({label, method}) => {
                                return ($({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '50%',
                                        margin: 'auto',
                                        cursor: 'pointer',
                                    },
                                    att: {
                                        className: 'delRecBot'
                                    },
                                    event: {
                                        type: 'click',
                                        method: method
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                margin: 'auto',
                                                height: 'fit-content',
                                                width: 'ft-content',
                                                fontFamily: 'arial black,sans-serif',
                                                fontSize: '1.3vw',
                                                color: 'deepskyblue'
                                            },
                                            text: label
                                        })
                                    ]
                                }))
                            }
                            return ($({
                                tag: 'div',
                                style: {
                                    height: '7vh',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    margin: '.5vh auto auto'
                                },
                                child: [
                                    Button({
                                        label: 'Cancel',
                                        method: () => {
                                            recDelP.remove()
                                        }
                                    }),
                                    Button({
                                        label: 'Submit',
                                        method: async () => {
                                            if (confirm("Are you sure you want to permanently delete this file?...")) {
                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                const remove = () => {
                                                    loading.remove()
                                                }
                                                const form = new FormData()
                                                form.append('docId', docId)
                                                form.append('fileLocation', file)
                                                form.append('reason', '')
                                                form.append('title', title)
                                                form.append('eventName', eventTYpe)
                                                form.append('campus', campus)
                                                form.append('grantDeleteResearchRequest', 'true')
                                                await fetch('/uploadResearchFile', {
                                                    method: 'POST',
                                                    body: form
                                                }).then(res => {
                                                    if (res.ok) {
                                                        remove()
                                                        return res.json()
                                                    }
                                                }).then(dat => {
                                                    if (dat.status) {
                                                        document.body.appendChild(ConfirmationAlert("Saved successfully...!", () => {
                                                            window.location.reload()
                                                        }))
                                                    } else {
                                                        alert(dat.message)
                                                    }
                                                })
                                            }
                                        }
                                    }),
                                ]
                            }))
                        }
                        return ($({
                            tag: 'div',
                            style: {
                                width: 'fit-content',
                                height: 'fit-content',
                                margin: 'auto',
                                backgroundColor: '#555',
                                border: 'solid thin #999',
                                padding: '.3rem'
                            },
                            child: [
                                Reason,
                                Controller()
                            ]
                        }))
                    }
                    return ($({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            left: '0',
                            top: '0',
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                            display: 'flex',
                            justifyContent: 'center'
                        },
                        elementHandler: getrecDel,
                        child: [
                            messagePanel()
                        ]
                    }))
                }
                return ($({
                    tag: 'div',
                    style: {
                        width: '82%',
                        margin: 'auto',
                    },
                    child: [
                        details("Category : ", category),
                        details("Center : ", center),
                        details("Title : ", `" ${title}  "`),
                        details("Author : ", author),
                        details("Campus : ", campus),
                        details("Event : ", eventTYpe),
                        $({
                            tag: 'div',
                            style: {
                                width: 'fit-content',
                                height: '100%',
                                display: 'flex',
                                marginLeft: 'auto',
                                marginRight: '0'
                            },
                            child: [
                                bot({
                                    label: 'fa-solid fa-comment-dots',
                                    event: () => {
                                        const form = new FormData()
                                        form.append('commentRequest', 'true')
                                        form.append('docId', docId)
                                        fetch('/uploadResearchFile', {
                                            method: "POST",
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                // Check if mainFrame exists before using it
                                                if (mainFrame && typeof mainFrame.appendChild === 'function') {
                                                    mainFrame.appendChild(comments(data))
                                                } else {
                                                    console.error('mainFrame is undefined or not a valid DOM element');
                                                    // Fallback: append to body or show alert
                                                    document.body.appendChild(comments(data))
                                                }
                                            })
                                    },
                                    tooltip:'View Comments'
                                }),
                                bot({
                                    label: 'fa-solid fa-folder-open',
                                    event: () => {
                                        // Check if mainFrame exists before using it
                                        if (mainFrame && typeof mainFrame.appendChild === 'function') {
                                            mainFrame.appendChild(Viewer())
                                        } else {
                                            console.error('mainFrame is undefined or not a valid DOM element');
                                            // Fallback: append to body or show alert
                                            document.body.appendChild(Viewer())
                                        }
                                    },
                                    tooltip:'Open File'
                                }),
                                bot({
                                    label: 'fa-solid fa-file-excel',
                                    event:() => {
                                        if(confirm("This entry will be transfer for re-evaluation. Do you want to continue?")){
                                            const req = new Request('/endorsement')
                                            req.Post([
                                                {
                                                    name: 'returnDocs',
                                                    value: '1'
                                                },
                                                {
                                                    name: 'docId',
                                                    value: endorseId
                                                }
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
                                    tooltip:'Cancel Docs'
                                }),
                            ]
                        })
                    ]
                }))
            }
            const Viewer = () => {
                let viewerMain
                const getViewer = (el) => {
                    viewerMain = el
                }
                const closeView = $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        margin: 'auto',
                        marginTop: '1vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: ' Close',
                            att: {
                                className: 'fa-solid fa-right-from-bracket',
                            },
                            style: {
                                fontSize: '2vw',
                                cursor: 'pointer',
                                color: 'deepskyblue'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    viewerMain.remove()
                                }
                            }
                        })
                    ],
                })

                // Check if it's a Google Drive URL
                const isGoogleDriveUrl = file && (file.includes('drive.google.com') || file.includes('/d/'))
                
                let frame
                
                if (isGoogleDriveUrl) {
                    // Create a container for the viewer with loading indicator
                    frame = $({
                        tag: 'div',
                        style: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            marginTop: '1vh',
                            position: 'relative',
                            backgroundColor: '#f5f5f5'
                        },
                        elementHandler: (el) => {
                            // Create the embed URL properly - handle multiple URL formats
                            let fileId = null;
                            let embedUrl = file;
                            
                            // Try different patterns to extract file ID
                            const patterns = [
                                /\/d\/([a-zA-Z0-9_-]+)/,                     // /d/FILE_ID/
                                /id=([a-zA-Z0-9_-]+)/,                       // id=FILE_ID
                                /open\?id=([a-zA-Z0-9_-]+)/,                 // open?id=FILE_ID
                                /\/file\/d\/([a-zA-Z0-9_-]+)/,               // /file/d/FILE_ID/
                                /([a-zA-Z0-9_-]{25,})/                       // Any long ID (Google Drive IDs are usually long)
                            ];
                            
                            for (let pattern of patterns) {
                                const match = file.match(pattern);
                                if (match && match[1]) {
                                    fileId = match[1];
                                    break;
                                }
                            }
                            
                            // If no fileId found in patterns, try to extract from URL path
                            if (!fileId && file.includes('drive.google.com')) {
                                const urlParts = file.split('/');
                                for (let i = 0; i < urlParts.length; i++) {
                                    if (urlParts[i] === 'd' && urlParts[i + 1]) {
                                        fileId = urlParts[i + 1];
                                        break;
                                    }
                                }
                            }
                            
                            if (isGoogleDriveUrl) {
                                // Clean the fileId (remove query parameters if any)
                                fileId = fileId.split('?')[0].split('&')[0];
                                embedUrl = `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
                                
                                // Add loading indicator
                                const loadingIndicator = document.createElement('div');
                                loadingIndicator.innerHTML = `
                                    <div style="
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                        text-align: center;
                                        color: #666;
                                        font-family: Arial, sans-serif;
                                    ">
                                        <div style="
                                            font-size: 24px;
                                            margin-bottom: 10px;
                                            animation: spin 1s linear infinite;
                                        ">⏳</div>
                                        <div>Loading Google Drive document...</div>
                                        <div style="font-size: 12px; margin-top: 10px; color: #999;">
                                            If this takes too long, the document may require permission
                                        </div>
                                    </div>
                                `;
                                el.appendChild(loadingIndicator);
                                
                                // Create iframe with proper attributes
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
                                iframe.title = 'Google Drive Document Viewer';
                                
                                
                                // Add style for spinner animation
                                const style = document.createElement('style');
                                style.textContent = `
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `;
                                document.head.appendChild(style);
                                
                                // Handle successful load
                                iframe.onload = () => {
                                    // Remove loading indicator
                                    if (loadingIndicator.parentNode === el) {
                                        el.removeChild(loadingIndicator);
                                    }
                                    window.addEventListener('message', (event) => {
                                    })
                                }
                                
                                // Handle load error
                                iframe.onerror = () => {
                                    // Remove loading indicator
                                    if (loadingIndicator.parentNode === el) {
                                        el.removeChild(loadingIndicator);
                                    }
                                    // Show alternative options
                                    showAlternativeOptions(el, file, fileId);
                                };
                                
                                // Add timeout in case iframe hangs
                                setTimeout(() => {
                                    if (loadingIndicator.parentNode === el) {
                                        el.removeChild(loadingIndicator);
                                        // Show alternative options
                                        showAlternativeOptions(el, file, fileId);
                                    }
                                }, 10000); // 10 second timeout
                                
                                el.appendChild(iframe);
                                
                            } else {
                                el.innerHTML = `
                                    <div style="
                                        color: #666; 
                                        text-align: center;
                                        padding: 40px;
                                        font-family: Arial, sans-serif;
                                    ">
                                        <h3>Unable to load document</h3>
                                        <p>Invalid Google Drive URL format.</p>
                                        <div style="margin: 20px 0;">
                                            <a href="${file}" 
                                            target="_blank" 
                                            style="
                                                display: inline-block;
                                                padding: 10px 20px;
                                                background: deepskyblue;
                                                color: white;
                                                text-decoration: none;
                                                border-radius: 5px;
                                                margin: 5px;
                                            ">
                                                Open in Google Drive
                                            </a>
                                        </div>
                                    </div>
                                `;
                            }
                            
                            // Function to show alternative options
                            function showAlternativeOptions(containerElement, originalUrl, fileId) {
                                const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
                                const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
                                
                                containerElement.innerHTML = `
                                    <div style="
                                        color: white; 
                                        font-family: Arial, sans-serif; 
                                        padding: 40px;
                                        text-align: center;
                                        background: rgba(0,0,0,0.8);
                                        border-radius: 10px;
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                        width: 80%;
                                        max-width: 500px;
                                    ">
                                        <h3>Document Access Required</h3>
                                        <p>This Google Drive document may require permission to view.</p>
                                        <div style="margin: 30px 0;">
                                            <a href="${originalUrl}" 
                                            target="_blank" 
                                            style="
                                                display: block;
                                                padding: 12px 24px;
                                                background: deepskyblue;
                                                color: white;
                                                text-decoration: none;
                                                border-radius: 5px;
                                                margin: 10px;
                                            ">
                                                🔗 Open in Google Drive (New Tab)
                                            </a>
                                            <a href="${viewUrl}" 
                                            target="_blank" 
                                            style="
                                                display: block;
                                                padding: 12px 24px;
                                                background: #4CAF50;
                                                color: white;
                                                text-decoration: none;
                                                border-radius: 5px;
                                                margin: 10px;
                                            ">
                                                👁️ View Document (Alternative)
                                            </a>
                                            <a href="${directUrl}" 
                                            target="_blank" 
                                            style="
                                                display: block;
                                                padding: 12px 24px;
                                                background: #FF9800;
                                                color: white;
                                                text-decoration: none;
                                                border-radius: 5px;
                                                margin: 10px;
                                            ">
                                                ⬇️ Download Document
                                            </a>
                                            <button onclick="location.reload()" 
                                                    style="
                                                        padding: 12px 24px;
                                                        background: #555;
                                                        color: white;
                                                        border: none;
                                                        border-radius: 5px;
                                                        margin: 10px;
                                                        cursor: pointer;
                                                        width: 100%;
                                                    ">
                                                🔄 Try Again
                                            </button>
                                        </div>
                                        <p style="font-size: 12px; color: #ccc; margin-top: 20px;">
                                            <strong>Note:</strong> You may need to:<br>
                                            1. Sign in with the appropriate Google account<br>
                                            2. Request access from the document owner<br>
                                            3. Check your internet connection
                                        </p>
                                    </div>
                                `;
                            }
                        }
                    })
                } else {
                    // For local PDF files
                    frame = $({
                        tag: 'object',
                        att: {
                            className: 'frameViewer',
                            data: '/' + file,
                            type: 'application/pdf'
                        },
                        style: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            marginTop: '1vh'
                        }
                    })
                }
                
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        zIndex: '3',
                        backgroundColor: '#333',
                        top: '0',
                        left: '0',
                        textAlign: 'center'
                    },
                    elementHandler: getViewer,
                    child: [
                        frame,
                        closeView,
                    ]
                }))
            }
            const comments = (Review) => {
                let comm
                const getComment = (el) => {
                    comm = el
                }
                let printBody
                const Controller = () => {
                    const bot = ({label, eventHandler, style}) => {
                        return ($({
                            tag: 'div',
                            style: style,
                            event: {
                                type: 'click',
                                method: eventHandler
                            },
                            att: {
                                className: 'botPr'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: label,
                                    style: {
                                        margin: 'auto',
                                        width: 'fit-content',
                                        height: 'fit-content'
                                    }
                                })
                            ]
                        }))
                    }
                    return ($({
                        tag: 'div',
                        style: {
                            backgroundColor: '#555',
                            width: '10%',
                            height: '100%',
                            margin: 'auto',
                            marginLeft: '0',
                            position: 'relative'
                        },
                        child: [
                            bot({
                                label: 'Printout',
                                eventHandler: () => {
                                    const printPage = document.getElementById('commentPDF')
                                    let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');
                                    WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')
                                    WinPrint.document.write(printPage.innerHTML);
                                    WinPrint.document.close();
                                    WinPrint.focus();
                                    WinPrint.print();
                                    WinPrint.close();
                                },
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    bottom: '5vh',
                                    top: 'auto',
                                    height: '5vh',
                                    backgroundColor: '#444',
                                    width: '100%',
                                    cursor: 'pointer'
                                }
                            }),
                            bot({
                                label: 'CLOSE',
                                eventHandler: () => {
                                    comm.remove()
                                },
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    bottom: '0',
                                    top: 'auto',
                                    height: '5vh',
                                    backgroundColor: '#444',
                                    width: '100%',
                                    cursor: 'pointer'
                                },
                            })
                        ]
                    }))
                }
                const print = $({
                    tag: 'div',
                    style: {
                        height: '100%',
                        justifyContent: 'center',
                        display: 'flex',
                        width: '100%',
                        overflowY: 'auto',
                        userSelect: 'text'
                    },
                    child: [
                        Print({
                            title: title,
                            campus: campus,
                            author: author,
                            category: category,
                            date: '1-21-2022',
                            review: Review,
                            getHandler: (el) => {
                                printBody = el
                            }
                        })
                    ]

                })

                return ($({

                    tag: 'div',

                    style: {

                        position: 'absolute',

                        left: '0',

                        top: '0',

                        width: '100%',

                        height: '100%',

                        backgroundColor: '#333',

                        justifyContent: 'center',

                        display: 'flex'

                    },

                    elementHandler: getComment,

                    child: [

                        Controller(),

                        print

                    ]

                }))

            }
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1vh auto',
                    width: '94%',
                    padding: '.5rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
                att: {
                    className: 'resFilist'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-file-pdf'
                        },
                        style: {
                            margin: 'auto',
                            fontSize: '3vw',
                            width: 'fit-content',
                            height: 'fit-content',
                            paddingLeft: '1vw',
                            paddingRight: '1vw',
                            color: '#555',
                            textShadow: '-.2vw .2vh .5vw black',
                        }
                    }),
                    resDetails()
                ]
            }))
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
        const Content = () => {
            const Report=()=>{
                const ReportPanel=()=>{
                    let panBo, bodCon, eventTypeName
                    // Main container for center and its categories
                    const contain = ({center, total, categories, eventType}) => {
                        let dropDownState, dropPan
                        return ($({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                marginTop: '.5vh',
                                marginBottom: '.5vh',
                            },
                            child: [
                                // Main Center Row
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        width: '100%',
                                        height: 'fit-content',
                                        borderBottom: '1px solid #e9ecef',
                                        cursor: 'pointer',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '0',
                                        marginBottom: '0',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        // Dropdown icon
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: dropDownState ? 'fa-solid fa-square-caret-down' : 'fa-solid fa-square-caret-right'
                                            },
                                            style: {
                                                width: '5%',
                                                textAlign: 'center',
                                                margin: 'auto',
                                                fontSize: '1.2vw',
                                                color: 'deepskyblue',
                                                padding: '10px 0',
                                                cursor: 'pointer'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (eve) => {
                                                    dropPan.innerHTML = ''
                                                    dropDownState = !dropDownState
                                                    
                                                    if (dropDownState) {
                                                        eve.target.className = 'fa-solid fa-square-caret-down'
                                                        
                                                        // Create categories container
                                                        const categoriesDiv = $({
                                                            tag: 'div',
                                                            style: {
                                                                width: '100%',
                                                                padding: '10px',
                                                                backgroundColor: '#1a1a1a',
                                                                borderRadius: '0 0 5px 5px'
                                                            }
                                                        })
                                                        
                                                        // Add ALL categories (including zeros)
                                                        categories.forEach(cat => {
                                                            categoriesDiv.appendChild(createCategoryRow({
                                                                category: cat.name,
                                                                total: cat.total
                                                            }))
                                                        })
                                                        
                                                        dropPan.appendChild(categoriesDiv)
                                                    } else {
                                                        eve.target.className = 'fa-solid fa-square-caret-right'
                                                    }
                                                }
                                            }
                                        }),
                                        // Center Name
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '45%',
                                                margin: 'auto',
                                                fontSize: '1vw',
                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color: 'deepskyblue',
                                                fontWeight: 'bold',
                                                padding: '10px 0'
                                            },
                                            text: center
                                        }),
                                        // Total Entries for Center - THIS WILL SHOW ZERO
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '50%',
                                                margin: 'auto',
                                                fontSize: '1vw',
                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color: total > 0 ? '#4CAF50' : '#888',
                                                fontWeight: 'bold',
                                                padding: '10px 0',
                                                textAlign: 'center'
                                            },
                                            text: total.toString() // Ensure it's converted to string
                                        })
                                    ]
                                }),
                                // Dropdown Container for Categories
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        marginLeft: '5%'
                                    },
                                    elementHandler: (el) => {
                                        dropPan = el
                                        
                                        // Populate categories on initial render
                                        if (dropDownState && categories && categories.length > 0) {
                                            const categoriesDiv = $({
                                                tag: 'div',
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: '#1a1a1a',
                                                    borderRadius: '0 0 5px 5px'
                                                }
                                            })
                                            
                                            categories.forEach(cat => {
                                                categoriesDiv.appendChild(createCategoryRow({
                                                    category: cat.name,
                                                    total: cat.total
                                                }))
                                            })
                                            
                                            dropPan.appendChild(categoriesDiv)
                                        }
                                    }
                                })
                            ]
                        }))
                    }
                    // Category row showing category name and its total (including zeros)
                    const createCategoryRow = ({category, total}) => {
                        return ($({
                            tag: 'div',
                            style: {
                                width: '95%',
                                marginBottom: '4px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        width: '100%',
                                        padding: '8px 0',
                                        borderBottom: '1px dotted #444'
                                    },
                                    child: [
                                        // Bullet point indicator
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-circle'
                                            },
                                            style: {
                                                width: '5%',
                                                textAlign: 'center',
                                                fontSize: '0.6vw',
                                                color: total > 0 ? '#FF9800' : '#666',
                                                marginLeft: '2%',
                                                marginTop: '5px'
                                            }
                                        }),
                                        // Category Name
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '45%',
                                                fontSize: '0.95vw',
                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color: total > 0 ? '#FF9800' : '#777',
                                                marginLeft: '2%',
                                                fontWeight: total > 0 ? 'bold' : 'normal'
                                            },
                                            text: category
                                        }),
                                        // Category Total - THIS WILL SHOW ZERO
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '45%',
                                                fontSize: '0.95vw',
                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color: total > 0 ? '#4CAF50' : '#777',
                                                fontWeight: total > 0 ? 'bold' : 'normal',
                                                textAlign: 'center',
                                                paddingRight: '10px'
                                            },
                                            text: total.toString() // Ensure it's converted to string
                                        })
                                    ]
                                })
                            ]
                        }))
                    }
                    //print summary
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
                                        // Create print window
                                        let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                                        
                                        WinPrint.document.write(`
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                                <title>Research Summary - ${eventDetails.name}</title>
                                                <link rel="stylesheet" href="/client/component/otherComponent/style/review.css">
                                            </head>
                                            <body>
                                                <div class="print-summary-container">
                                                    ${PrintSummary(data, eventDetails.name).innerHTML} <!-- Pass eventName here -->
                                                </div>
                                            </body>
                                            </html>
                                        `)
                                        
                                        WinPrint.document.close();
                                        
                                        // Wait for content to load before printing
                                        WinPrint.onload = function() {
                                            setTimeout(() => {
                                                WinPrint.focus()
                                                WinPrint.print()
                                            }, 500)
                                        }
                                    }).catch(error => {
                                        alert('Error loading summary data. Please try again.');
                                    })
                                }
                            }
                        }))
                    }
                    const createPrintModal = (eventDetails) => {
                        const existingModal = document.getElementById('printResearchModal')
                        if (existingModal && existingModal.remove) {
                            existingModal.remove()
                        }

                        let modalOverlayElement = null;
                        
                        const modalOverlay = $({
                            tag: 'div',
                            att: { id: 'printResearchModal' },
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
                                zIndex: '1000'
                            },
                            elementHandler: (overlay) => {
                                modalOverlayElement = overlay;
                                
                                overlay.addEventListener('click', (e) => {
                                    if (e.target === overlay) {
                                        // Clean up and remove
                                        if (modalOverlayElement && modalOverlayElement.remove) {
                                            modalOverlayElement.remove();
                                        }
                                    }
                                });
                                
                                const handleEsc = (e) => {
                                    if (e.key === 'Escape') {
                                        if (modalOverlayElement && modalOverlayElement.remove) {
                                            modalOverlayElement.remove();
                                        }
                                        document.removeEventListener('keydown', handleEsc);
                                    }
                                };
                                document.addEventListener('keydown', handleEsc);
                            }
                        });
                        
                        // Modal content
                        const modalContent = $({
                            tag: 'div',
                            style: {
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                width: '500px',
                                maxWidth: '90%',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                position: 'relative',
                                overflow: 'hidden'
                            }
                        });
                        
                        // Header
                        const header = $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid #e9ecef',
                                backgroundColor: '#ffffff'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    },
                                    child: [
                                        $({
                                            tag: 'h2',
                                            text: 'Print Research Entry Summary',
                                            style: {
                                                margin: '0',
                                                color: '#1a1a2e',
                                                fontSize: '18px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: '600'
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            att: {
                                                'aria-label': 'Close',
                                                'title': 'Close'
                                            },
                                            style: {
                                                width: '32px',
                                                height: '32px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: {
                                                        className: 'fa-solid fa-xmark',
                                                        'aria-hidden': 'true'
                                                    },
                                                    style: {
                                                        fontSize: '18px',
                                                        color: '#adb5bd',
                                                        transition: 'all 0.2s ease'
                                                    }
                                                })
                                            ],
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation();
                                                    // Properly remove the modal overlay
                                                    if (modalOverlayElement && modalOverlayElement.remove) {
                                                        modalOverlayElement.remove();
                                                    }
                                                }
                                            },
                                            mouseenter: (e) => {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                                const icon = e.target.querySelector('.fa-xmark');
                                                if (icon) icon.style.color = '#dc3545';
                                            },
                                            mouseleave: (e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                const icon = e.target.querySelector('.fa-xmark');
                                                if (icon) icon.style.color = '#adb5bd';
                                            }
                                        })
                                    ]
                                })
                            ]
                        });
                        
                        modalContent.appendChild(header);
                        
                        // Body
                        const body = $({
                            tag: 'div',
                            style: {
                                padding: '24px',
                                backgroundColor: '#ffffff'
                            }
                        });
                        
                        // Form fields
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
                            
                            // Add focus/blur events
                            input.addEventListener('focus', () => {
                                input.style.borderColor = '#0d6efd';
                                input.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)';
                            });
                            input.addEventListener('blur', () => {
                                input.style.borderColor = '#dee2e6';
                                input.style.boxShadow = 'none';
                            });
                            
                            fieldDiv.appendChild(input);
                            body.appendChild(fieldDiv);
                        });
                        
                        // Buttons
                        const buttonDiv = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                marginTop: '24px'
                            }
                        });
                        
                        // Cancel button
                        const cancelBtn = $({
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
                                method: (e) => {
                                    e.stopPropagation();
                                    // Properly remove the modal overlay
                                    if (modalOverlayElement && modalOverlayElement.remove) {
                                        modalOverlayElement.remove();
                                    }
                                }
                            }
                        });
                        
                        // Add hover effects for cancel button
                        cancelBtn.addEventListener('mouseenter', () => {
                            cancelBtn.style.backgroundColor = '#f8f9fa';
                            cancelBtn.style.borderColor = '#ced4da';
                        });
                        cancelBtn.addEventListener('mouseleave', () => {
                            cancelBtn.style.backgroundColor = '#ffffff';
                            cancelBtn.style.borderColor = '#dee2e6';
                        });
                        
                        buttonDiv.appendChild(cancelBtn);
                        
                        // Print button
                        const printBtn = $({
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
                                    e.stopPropagation();
                                    
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
                                    
                                    // Remove modal first
                                    if (modalOverlayElement && modalOverlayElement.remove) {
                                        modalOverlayElement.remove();
                                    }
                                    
                                    // Call print function
                                    printResearchSummary(eventDetails, formData);
                                }
                            }
                        });
                        
                        // Add hover effects for print button
                        printBtn.addEventListener('mouseenter', () => {
                            printBtn.style.backgroundColor = '#0b5ed7';
                            printBtn.style.transform = 'translateY(-1px)';
                        });
                        printBtn.addEventListener('mouseleave', () => {
                            printBtn.style.backgroundColor = '#0d6efd';
                            printBtn.style.transform = 'translateY(0)';
                        });
                        
                        buttonDiv.appendChild(printBtn);
                        body.appendChild(buttonDiv);
                        modalContent.appendChild(body);
                        modalOverlay.appendChild(modalContent);
                        
                        // Append to document body
                        document.body.appendChild(modalOverlay);
                        
                        return modalOverlay;
                    }
                    const createCertificateModal = (eventDetails) => {
                        // Remove existing modal if any
                        const existingModal = document.getElementById('certificateModal');
                        if (existingModal && existingModal.parentNode) {
                            existingModal.parentNode.removeChild(existingModal);
                        }
                        
                        // Create modal overlay using your library
                        const modalOverlay = $({
                            tag: 'div',
                            att: { id: 'certificateModal' },
                            style: {
                                position: 'fixed',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: '1000'
                            }
                        });
                        
                        // Modal content
                        const modalContent = $({
                            tag: 'div',
                            style: {
                                backgroundColor: '#2a2a2a',
                                padding: '30px',
                                borderRadius: '8px',
                                width: '500px',
                                maxWidth: '90%',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                position: 'relative',
                                zIndex: '1001',
                                border: '1px solid #FFD700'
                            }
                        });
                        
                        // Header
                        const header = $({
                            tag: 'h2',
                            style: {
                                margin: '0 0 20px 0',
                                color: '#FFD700',
                                fontSize: '22px',
                                borderBottom: '2px solid #FFD700',
                                paddingBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            },
                            html: '<span class="fa-solid fa-certificate"></span> Print Certificates'
                        });
                        modalContent.appendChild(header);
                        
                        // Event info
                        const eventInfo = $({
                            tag: 'div',
                            style: {
                                marginBottom: '20px',
                                padding: '10px',
                                backgroundColor: '#333',
                                borderRadius: '5px',
                                color: '#bbb',
                                fontSize: '14px',
                                borderLeft: '3px solid #FFD700'
                            },
                            html: `<strong>Event:</strong> ${eventDetails.name}`
                        });
                        modalContent.appendChild(eventInfo);
                        
                        // Form fields - Only date and venue (president is in background)
                        const fields = [
                            { id: 'certDateToBeHeld', label: 'Date of Event:', placeholder: 'e.g., March 2-3, 2026' },
                            { id: 'certVenue', label: 'Venue:', placeholder: 'e.g., CAPSU Conference Room, Roxas City, Capiz' }
                        ];
                        
                        fields.forEach(field => {
                            const fieldDiv = $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px',
                                    width: '100%'
                                }
                            });
                            
                            const label = $({
                                tag: 'label',
                                att: { htmlFor: field.id },
                                style: {
                                    display: 'block',
                                    marginBottom: '5px',
                                    color: '#FFD700',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                },
                                text: field.label
                            });
                            fieldDiv.appendChild(label);
                            
                            const input = $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    id: field.id,
                                    placeholder: field.placeholder,
                                    value: field.value || ''
                                },
                                style: {
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    backgroundColor: '#333',
                                    color: '#fff'
                                }
                            });
                            fieldDiv.appendChild(input);
                            modalContent.appendChild(fieldDiv);
                        });
                        
                        // Button container
                        const buttonDiv = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '20px'
                            }
                        });
                        
                        // Cancel button
                        const cancelBtn = $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                backgroundColor: '#444',
                                color: '#bbb',
                                transition: 'all 0.3s'
                            },
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation();
                                    if (modalOverlay.parentNode) {
                                        modalOverlay.parentNode.removeChild(modalOverlay);
                                    }
                                }
                            }
                        });
                        buttonDiv.appendChild(cancelBtn);
                        
                        // Print button
                        const printBtn = $({
                            tag: 'button',
                            style: {
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                backgroundColor: '#FFD700',
                                color: '#2a2a2a',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            html: '<span class="fa-solid fa-print"></span> Generate Certificates',
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation();
                                    
                                    // Get form data - only date and venue
                                    const formData = {
                                        dateToBeHeld: document.getElementById('certDateToBeHeld')?.value || '',
                                        venue: document.getElementById('certVenue')?.value || ''
                                    };
                                    
                                    // Validate required fields
                                    if (!formData.dateToBeHeld || !formData.venue) {
                                        alert('Please fill in all required fields');
                                        return;
                                    }
                                    
                                    // Remove modal
                                    if (modalOverlay.parentNode) {
                                        modalOverlay.parentNode.removeChild(modalOverlay);
                                    }
                                    
                                    // Call certificate generation function
                                    generateCertificates(eventDetails, formData);
                                }
                            }
                        });
                        buttonDiv.appendChild(printBtn);
                        modalContent.appendChild(buttonDiv);
                        modalOverlay.appendChild(modalContent);
                        
                        // Close on overlay click
                        modalOverlay.event = {
                            type: 'click',
                            method: (e) => {
                                if (e.target === modalOverlay) {
                                    if (modalOverlay.parentNode) {
                                        modalOverlay.parentNode.removeChild(modalOverlay);
                                    }
                                }
                            }
                        };
                        
                        return modalOverlay;
                    };
                    const generateCertificates = (eventDetails, formData) => {
                        // Show loading using Waiting() function
                        let loading = Waiting();
                        document.body.appendChild(loading);
                        
                        // Define remove function
                        const removeLoading = () => {
                            if (loading && loading.parentNode) {
                                loading.parentNode.removeChild(loading);
                            }
                        };
                        
                        // Fetch certificate data
                        const req = new Request('/entrycount');
                        req.Post([
                            { name: 'getCertificates', value: '1' },
                            { name: 'eventName', value: eventDetails.name }
                        ]);
                        req.Json();
                        
                        req.Send().then(response => {
                            // Check if response is valid
                            if (!response) {
                                removeLoading();
                                alert('No response from server');
                                return;
                            }
                            
                            // Check for error status
                            if (response.status === 'error') {
                                removeLoading();
                                alert('Error: ' + (response.message || 'Failed to load certificate data'));
                                return;
                            }
                            
                            // Check if data exists
                            if (!response.data || response.data.length === 0) {
                                removeLoading();
                                alert('No accepted research files found for this event');
                                return;
                            }
                            
                            // Open print window
                            let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                            
                            if (!WinPrint) {
                                removeLoading();
                                alert('Popup blocked! Please allow popups for this site and try again.');
                                return;
                            }
                            
                            // Set up interval to check when print window is closed
                            const checkWindowClosed = setInterval(() => {
                                if (WinPrint.closed) {
                                    clearInterval(checkWindowClosed);
                                    removeLoading();
                                    console.log('Print window closed - loading removed');
                                }
                            }, 500);
                            
                            // Also handle unload event
                            WinPrint.onunload = function() {
                                clearInterval(checkWindowClosed);
                                removeLoading();
                            };
                            
                            // Write HTML with script reference
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
                                        // Wait for script to load then render certificates
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
                                                
                                                // Automatically show print dialog after a short delay
                                                setTimeout(function() {
                                                    window.print();
                                                }, 1500);
                                            } else {
                                                // Retry after a short delay
                                                setTimeout(renderCertificatesWithRetry, 100);
                                            }
                                        }
                                        
                                        // Start rendering
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
                                // Print Research Entry Summary button
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
                                            const modal = createPrintModal(eventDetails);
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
                                // Print Certificates button
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
                                            const certModal = createCertificateModal(eventDetails);
                                            document.body.appendChild(certModal);
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
                                backgroundColor: '#f8f9fa',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                            },
                            child: [
                                $({
                                    tag: "div",
                                    att: {
                                        className: 'fa-solid fa-calendar-check'
                                    },
                                    style: {
                                        color: "deepskyblue",
                                        fontSize: '1.2vw',
                                        margin: 'auto'
                                    }
                                }),
                                $({
                                    tag: 'select',
                                    style: {
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        width: '100%',
                                        height: '42px',
                                        outline: 'none',
                                        color: '#2c3e50',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '14px',
                                        padding: '0 16px'
                                    },
                                    elementHandler: (el) => {
                                        selVal = el
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
                                                text: '- - Select Event - -',
                                                att: {
                                                    disabled: true,
                                                    selected: true
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
                                                        backgroundColor: '#222',
                                                        fontSize: '1vw'
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
                                        padding: '10px 24px',
                                        backgroundColor: '#0d6efd',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        margin: '0',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
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
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            // Check if an event is selected
                                            if (selVal.selectedIndex === 0) {
                                                alert('Please select an event first')
                                                return
                                            }
                                            
                                            let eventType = selVal.childNodes[selVal.selectedIndex].innerText
                                            eventTypeName = {
                                                name: eventType,
                                                eventId: selVal.childNodes[selVal.selectedIndex].id
                                            }
                                            
                                            // Show loading
                                            bodCon.innerHTML = $({
                                                tag: 'div',
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#bbb',
                                                    fontSize: '1.2vw'
                                                },
                                                text: 'Loading data...'
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
                                                // Clear the container
                                                bodCon.innerHTML = ''
                                                
                                                // Check if data exists
                                                if (!data || data.length === 0) {
                                                    bodCon.appendChild($({
                                                        tag: 'div',
                                                        style: {
                                                            textAlign: 'center',
                                                            padding: '20px',
                                                            color: '#888',
                                                            fontSize: '1vw'
                                                        },
                                                        text: 'No data available for this event'
                                                    }))
                                                    return
                                                }
                                                
                        
                                                data.forEach(center => {
                                                    bodCon.appendChild(contain({
                                                        center: center.name,
                                                        total: center.total,
                                                        categories: center.categories || [],
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
                                                        padding: '20px',
                                                        color: '#ff4444',
                                                        fontSize: '1vw'
                                                    },
                                                    text: 'Error loading data. Please try again.'
                                                }))
                                            })
                                        }
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
                                // Header
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
                                        leb("RESEARCH CENTER"),
                                        leb("TOTAL ENTRIES"),
                                    ]
                                }),
                                // Body
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
                    return ($({
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
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 99
                        },
                        elementHandler: (overlay) => {
                            // Store reference to the overlay for removal
                            overlay._overlayElement = overlay;
                            
                            overlay.addEventListener('click', (e) => {
                                if (e.target === overlay) {
                                    overlay.remove();  // Remove the entire overlay
                                }
                            });
                            
                            // Handle escape key
                            const handleEsc = (e) => {
                                if (e.key === 'Escape') {
                                    overlay.remove();
                                    document.removeEventListener('keydown', handleEsc);
                                }
                            };
                            document.addEventListener('keydown', handleEsc);
                            
                            // Store cleanup function
                            overlay._cleanup = () => {
                                document.removeEventListener('keydown', handleEsc);
                            };
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '90%',
                                    maxWidth: '900px',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                },
                                elementHandler: (el) => {
                                    panBo = el;  // This is now the inner content, not the overlay
                                },
                                child: [
                                    // Simplified Header
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            borderBottom: '1px solid #e9ecef',
                                            backgroundColor: '#ffffff'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: { className: 'fa-regular fa-chart-bar' },
                                                        style: {
                                                            fontSize: '20px',
                                                            color: '#0d6efd'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'h3',
                                                        text: 'Entries Summary By Center',
                                                        style: {
                                                            fontFamily: 'Inter, sans-serif',
                                                            fontSize: '18px',
                                                            fontWeight: '600',
                                                            color: '#1a1a2e',
                                                            margin: '0'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'button',
                                                att: {
                                                    'aria-label': 'Close modal',
                                                    'title': 'Close'
                                                },
                                                style: {
                                                    width: '28px',
                                                    height: '28px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-xmark',
                                                            'aria-hidden': 'true'
                                                        },
                                                        style: {
                                                            fontSize: '16px',
                                                            color: '#adb5bd',
                                                            transition: 'all 0.2s ease'
                                                        }
                                                    })
                                                ],
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        // Find and remove the parent overlay
                                                        const overlayDiv = document.querySelector('#reportModalOverlay');
                                                        if (overlayDiv) {
                                                            overlayDiv.remove();
                                                        } else {
                                                            // Fallback: find the closest fixed position parent
                                                            let parent = panBo.parentElement;
                                                            while (parent) {
                                                                if (parent.style.position === 'fixed') {
                                                                    parent.remove();
                                                                    break;
                                                                }
                                                                parent = parent.parentElement;
                                                            }
                                                        }
                                                    }
                                                },
                                                mouseenter: (e) => {
                                                    e.target.style.backgroundColor = '#f8f9fa';
                                                    const icon = e.target.querySelector('.fa-xmark');
                                                    if (icon) icon.style.color = '#dc3545';
                                                },
                                                mouseleave: (e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                    const icon = e.target.querySelector('.fa-xmark');
                                                    if (icon) icon.style.color = '#adb5bd';
                                                }
                                            })
                                        ]
                                    }),
                                    // Body
                                    $({
                                        tag: 'div',
                                        style: {
                                            padding: '20px',
                                            overflowY: 'auto',
                                            backgroundColor: '#ffffff'
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
                                ]
                            })
                        ]
                    }))
                }
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
                                title: 'View Summary by Center'
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
                                    // Check if leftPDiv exists and is a valid DOM element
                                    if (leftPDiv && typeof leftPDiv.appendChild === 'function') {
                                        leftPDiv.appendChild(ReportPanel());
                                    } else if (mainFrame && typeof mainFrame.appendChild === 'function') {
                                        mainFrame.appendChild(ReportPanel());
                                    } else {
                                        document.body.appendChild(ReportPanel());
                                    }
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
                // Track pagination state
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
                                        // Add default "All Event" option
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
                                        
                                        // Load events
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
                                            // Auto-load when selection changes
                                            currentPage = 1;
                                            currentEventId = e.target.value || '0';
                                            
                                            // Clear search if it exists
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
                                            // Reset to page 1
                                            currentPage = 1;
                                            
                                            // Get the select element by ID
                                            const eventSelect = document.getElementById('eventSelectFilter');
                                            
                                            if (!eventSelect) {
                                                console.error('Could not find event select element!');
                                                return;
                                            }
                                            
                                            // Get the selected value
                                            currentEventId = eventSelect.value || '0';
                                            
                                            // Clear search if it exists
                                            if (serch && serch.value) {
                                                serch.value = '';
                                            }
                                            
                                            // Load first page (this will replace any existing content)
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
                    
                    // Make the request
                    const formData = new FormData();
                    formData.append('requestEventRDE', '1');
                    formData.append('eventId', eventId);
                    formData.append('page', page);
                    formData.append('limit', 10); // Load 10 at a time
                    
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
                        // Remove loading indicator
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
                            // Show page navigation info
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
                                
                                // Add documents (only current batch)
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
                                
                                // Previous button
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
                                
                                // Page buttons
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
                                
                                // Next button
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
                                
                                // Add page number input for direct navigation (optional)
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
                        // Remove loading indicator
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
                                    // Optional: Add any pre-navigation logic here
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
                // Track pagination state
                let currentPage = 1
                let isLoading = false
                let hasMore = true
                let totalEndorsements = 0
                let totalPages = 1
                const File = ({camp, eventName, date, id, research,resStat}) => {
                    let dropList, stateDrop = false
                    const ViewEn = () => {
                        let main
                        const innerPanel = (src) => {
                            const Remove = $({
                                tag: 'div',
                                att: {
                                    className: 'fa-solid fa-circle-xmark'
                                },
                                style: {
                                    fontSize: '3vw',
                                    color: 'deepskyblue',
                                    position: 'absolute',
                                    left: '-5vw',
                                    top: '0',
                                    padding: '.5rem',
                                    borderRadius: '40vw',
                                    cursor: 'pointer'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        main.remove()
                                    }
                                }
                            })

                            // Check if it's a Google Drive URL - FIXED: use src instead of file
                            const isGoogleDriveUrl = src && (src.includes('drive.google.com') || src.includes('/d/') || (typeof src === 'object' && src.drive_view_url));
                            
                            let fileViewer;
                            
                            if (isGoogleDriveUrl) {
                                // Create a container for the viewer with loading indicator
                                fileViewer = $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        margin: 'auto',
                                        position: 'relative',
                                        backgroundColor: '#f5f5f5'
                                    },
                                    elementHandler: (el) => {
                                        // Extract the actual file URL from the source
                                        let fileUrl = src;
                                        
                                        // Handle both string URL and object format
                                        if (typeof src === 'object' && src.drive_view_url) {
                                            fileUrl = src.drive_view_url;
                                        } else if (typeof src === 'string' && src.includes('{')) {
                                            try {
                                                const parsed = JSON.parse(src);
                                                if (parsed.drive_view_url) {
                                                    fileUrl = parsed.drive_view_url;
                                                }
                                            } catch (e) {
                                                console.log("JSON parse error:", e);
                                            }
                                        }
                                        
                                        // Create the embed URL properly - handle multiple URL formats
                                        let fileId = null;
                                        let embedUrl = fileUrl;
                                        
                                        //console.log('Google Drive URL:', fileUrl);
                                        
                                        // Try different patterns to extract file ID
                                        const patterns = [
                                            /\/d\/([a-zA-Z0-9_-]+)/,                     // /d/FILE_ID/
                                            /id=([a-zA-Z0-9_-]+)/,                       // id=FILE_ID
                                            /open\?id=([a-zA-Z0-9_-]+)/,                 // open?id=FILE_ID
                                            /\/file\/d\/([a-zA-Z0-9_-]+)/,               // /file/d/FILE_ID/
                                            /([a-zA-Z0-9_-]{25,})/                       // Any long ID (Google Drive IDs are usually long)
                                        ];
                                        
                                        for (let pattern of patterns) {
                                            const match = fileUrl.match(pattern);
                                            if (match && match[1]) {
                                                fileId = match[1];
                                                break;
                                            }
                                        }
                                        
                                        // If no fileId found in patterns, try to extract from URL path
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
                                            // Clean the fileId (remove query parameters if any)
                                            fileId = fileId.split('?')[0].split('&')[0];
                                            embedUrl = `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
                                            
                                            //console.log('Final Embed URL:', embedUrl);
                                            
                                            // Add loading indicator
                                            const loadingIndicator = document.createElement('div');
                                            loadingIndicator.innerHTML = `
                                                <div style="
                                                    position: absolute;
                                                    top: 50%;
                                                    left: 50%;
                                                    transform: translate(-50%, -50%);
                                                    text-align: center;
                                                    color: #666;
                                                    font-family: Arial, sans-serif;
                                                ">
                                                    <div style="
                                                        font-size: 24px;
                                                        margin-bottom: 10px;
                                                        animation: spin 1s linear infinite;
                                                    ">⏳</div>
                                                    <div>Loading Google Drive document...</div>
                                                    <div style="font-size: 12px; margin-top: 10px; color: #999;">
                                                        If this takes too long, the document may require permission
                                                    </div>
                                                </div>
                                            `;
                                            el.appendChild(loadingIndicator);
                                            
                                            // Add style for spinner animation
                                            const style = document.createElement('style');
                                            style.textContent = `
                                                @keyframes spin {
                                                    0% { transform: rotate(0deg); }
                                                    100% { transform: rotate(360deg); }
                                                }
                                            `;
                                            document.head.appendChild(style);
                                            
                                            // Create iframe with proper attributes
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
                                            iframe.title = 'Google Drive Document Viewer';
                                            
                                            // Handle successful load
                                            iframe.onload = () => {
                                                //console.log('Google Drive iframe loaded successfully');
                                                // Remove loading indicator
                                                if (loadingIndicator.parentNode === el) {
                                                    el.removeChild(loadingIndicator);
                                                }
                                            };
                                            
                                            // Handle load error
                                            iframe.onerror = () => {
                                                //console.log('Google Drive iframe failed to load');
                                                // Remove loading indicator
                                                if (loadingIndicator.parentNode === el) {
                                                    el.removeChild(loadingIndicator);
                                                }
                                                // Show alternative options
                                                showAlternativeOptions(el, fileUrl, fileId);
                                            };
                                            
                                            // Add timeout in case iframe hangs
                                            setTimeout(() => {
                                                if (loadingIndicator.parentNode === el) {
                                                    //console.log('Google Drive iframe loading timeout');
                                                    el.removeChild(loadingIndicator);
                                                    // Show alternative options
                                                    showAlternativeOptions(el, fileUrl, fileId);
                                                }
                                            }, 10000); // 10 second timeout
                                            
                                            el.appendChild(iframe);
                                            
                                        } else {
                                            // Invalid Google Drive URL format
                                            //console.log('Invalid Google Drive URL format:', fileUrl);
                                            el.innerHTML = `
                                                <div style="
                                                    color: #666; 
                                                    text-align: center;
                                                    padding: 40px;
                                                    font-family: Arial, sans-serif;
                                                ">
                                                    <h3>Unable to load document</h3>
                                                    <p>Invalid Google Drive URL format.</p>
                                                    <div style="margin: 20px 0;">
                                                        <a href="${fileUrl}" 
                                                        target="_blank" 
                                                        style="
                                                            display: inline-block;
                                                            padding: 10px 20px;
                                                            background: deepskyblue;
                                                            color: white;
                                                            text-decoration: none;
                                                            border-radius: 5px;
                                                            margin: 5px;
                                                        ">
                                                            Open in Google Drive
                                                        </a>
                                                    </div>
                                                </div>
                                            `;
                                        }
                                        
                                        // Function to show alternative options
                                        function showAlternativeOptions(containerElement, originalUrl, fileId) {
                                            const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
                                            const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
                                            
                                            containerElement.innerHTML = `
                                                <div style="
                                                    color: white; 
                                                    font-family: Arial, sans-serif; 
                                                    padding: 40px;
                                                    text-align: center;
                                                    background: rgba(0,0,0,0.8);
                                                    border-radius: 10px;
                                                    position: absolute;
                                                    top: 50%;
                                                    left: 50%;
                                                    transform: translate(-50%, -50%);
                                                    width: 80%;
                                                    max-width: 500px;
                                                ">
                                                    <h3>Document Access Required</h3>
                                                    <p>This Google Drive document may require permission to view.</p>
                                                    <div style="margin: 30px 0;">
                                                        <a href="${originalUrl}" 
                                                        target="_blank" 
                                                        style="
                                                            display: block;
                                                            padding: 12px 24px;
                                                            background: deepskyblue;
                                                            color: white;
                                                            text-decoration: none;
                                                            border-radius: 5px;
                                                            margin: 10px;
                                                        ">
                                                            🔗 Open in Google Drive (New Tab)
                                                        </a>
                                                        <a href="${viewUrl}" 
                                                        target="_blank" 
                                                        style="
                                                            display: block;
                                                            padding: 12px 24px;
                                                            background: #4CAF50;
                                                            color: white;
                                                            text-decoration: none;
                                                            border-radius: 5px;
                                                            margin: 10px;
                                                        ">
                                                            👁️ View Document (Alternative)
                                                        </a>
                                                        <a href="${directUrl}" 
                                                        target="_blank" 
                                                        style="
                                                            display: block;
                                                            padding: 12px 24px;
                                                            background: #FF9800;
                                                            color: white;
                                                            text-decoration: none;
                                                            border-radius: 5px;
                                                            margin: 10px;
                                                        ">
                                                            ⬇️ Download Document
                                                        </a>
                                                        <button onclick="location.reload()" 
                                                                style="
                                                                    padding: 12px 24px;
                                                                    background: #555;
                                                                    color: white;
                                                                    border: none;
                                                                    border-radius: 5px;
                                                                    margin: 10px;
                                                                    cursor: pointer;
                                                                    width: 100%;
                                                                ">
                                                            🔄 Try Again
                                                        </button>
                                                    </div>
                                                    <p style="font-size: 12px; color: #ccc; margin-top: 20px;">
                                                        <strong>Note:</strong> You may need to:<br>
                                                        1. Sign in with the appropriate Google account<br>
                                                        2. Request access from the document owner<br>
                                                        3. Check your internet connection
                                                    </p>
                                                </div>
                                            `;
                                        }
                                    }
                                });
                                
                            } else {
                                // For local PDF files
                                fileViewer = $({
                                    tag: 'object',
                                    style: {
                                        width: '100%',
                                        height: '100%'
                                    },
                                    att: {
                                        data: '/' + src,
                                        type: 'application/pdf'
                                    }
                                })
                            }

                            return ($({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    border: 'solid thin grey',
                                    position: 'relative'
                                },
                                child: [
                                    Remove,
                                    fileViewer
                                ]
                            }))
                        }
                        const SaveResearch = () => {
                            return ($({
                                tag: 'div',
                                style: {
                                    width: 'fit-content',
                                    height: 'fit-content',
                                    paddingRight: '2vw',
                                    paddingLeft: '2vw',
                                    margin: 'auto',
                                    paddingTop: '1vh',
                                    paddingBottom: '1vh',
                                    borderRadius: '1vw',
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    fontWeight: 'bolder',
                                    fontSize: '1.2vw',
                                    cursor: 'pointer'
                                },
                                att: {
                                    className: 'saveBotEn'
                                },
                                text: 'Save all documents ',
                                event: {
                                    type: 'click',
                                    method: () => {
                                        (async function (endorsementId) {
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const remove = () => {
                                                loading.remove()
                                            }
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
                                            })
                                                .then(dat => {
                                                    if (dat && dat.status) {
                                                        document.body.appendChild(ConfirmationAlert("Success..!", () => {
                                                            window.location.reload()
                                                        }))
                                                    } else if (dat) {
                                                        alert(dat.message)
                                                    }
                                                })
                                                .catch(err => {
                                                    remove()
                                                    //console.error('Error saving research documents:', err)
                                                    alert('Error saving documents. Please try again. Check console for details.')
                                                })
                                        })(id)
                                    }
                                }
                            }))
                        }
                        const Return = () => {

                            return ($({

                                tag: 'div',

                                style: {

                                    width: 'fit-content',

                                    height: 'fit-content',

                                    paddingRight: '2vw',

                                    paddingLeft: '2vw',

                                    margin: 'auto',

                                    paddingTop: '1vh',

                                    paddingBottom: '1vh',

                                    borderRadius: '1vw',

                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                    fontWeight: 'bolder',

                                    fontSize: '1.2vw',

                                    cursor: 'pointer'

                                },

                                att: {

                                    className: 'saveBotEn'

                                },

                                text: 'Return',

                                event: {

                                    type: 'click',

                                    method: () => {

                                        const req = new Request('/endorsement')

                                        req.Post([

                                            {

                                                name: 'returnDocs',

                                                value: '1'

                                            },

                                            {

                                                name: 'docId',

                                                value: id

                                            }

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

                                }

                            }))

                        }


                        return ($({

                            tag: 'div',

                            style: {

                                width: '100%',

                                height: '100%',

                                position: 'absolute',

                                backgroundColor: '#333',

                            },

                            elementHandler: (el) => {

                                main = el

                            },

                            child: [

                                $({

                                    tag: 'div',

                                    style: {

                                        width: '80%',

                                        height: '90%',

                                        margin: 'auto',

                                        border: 'solid thin grey',

                                        position: 'relative'

                                    },

                                    elementHandler: async (el) => {

                                        const form = new FormData();

                                        form.append('requestFileEndorse', 'true')

                                        form.append('docId', id)

                                        await fetch('/endorsement', {

                                            method: 'POST',

                                            body: form

                                        }).then(res => res.json())

                                            .then(data => {

                                                el.appendChild(innerPanel(data.res.fileUrl))

                                            })

                                    }

                                }),

                                $({

                                    tag: 'div',

                                    style: {

                                        height: '9.8%',

                                        width: '100%',

                                        display: 'flex',

                                        justifyContent: 'center',

                                    },

                                    child: [

                                        SaveResearch(),

                                        Return()

                                    ]

                                })

                            ],


                        }))

                    }

                    const open = () => {
                        return ($({
                            tag: 'button',
                            att: {
                                className: "fa-solid fa-folder-open"
                            },
                            style: {
                                width: '5%',
                                margin: 'auto',
                                cursor: 'pointer',
                                textAlign: 'center',
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                fontSize: '1vw',
                                borderRadius: '.2vw'
                            },
                            event: {

                                type: 'click',

                                method: () => {

                                    mainFrame.appendChild(ViewEn())

                                }

                            }
                        }))
                    }
                    const dropDown = () => {

                        let lis

                        const ListRes = ({category, author,}) => {

                            return ($({
                                tag: 'ul',
                                style: {
                                    width: '100%',
                                    fontFamily: ' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color: '#999',
                                    borderLeft: 'solid thin deepskyblue',
                                    borderRight: 'solid thin deepskyblue',
                                    borderBottom: 'solid thin deepskyblue',
                                    fontSize:'1vw'
                                },
                                elementHandler: (el) => {
                                    lis = el
                                    research.forEach(val => {
                                        el.appendChild($({
                                            tag: "li",
                                            style: {
                                                borderBottom: 'solid thin deepskyblue'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        innerHTML: `<span style="color:deepskyblue">Author:</span> ${val.author}`
                                                    },
                                                }),
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        innerHTML: `<span style="color:deepskyblue">Category:</span> ${val.category}`
                                                    },
                                                }),
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        innerHTML: `<span style="color:deepskyblue">Title:</span> ${val.title}`
                                                    },
                                                })
                                            ]
                                        }))
                                    })
                                }
                            }))
                        }

                        return ($({
                            tag: 'button',
                            att: {
                                className: 'fa-solid fa-square-caret-down'
                            },
                            style: {
                                width: '5%',
                                margin: 'auto',
                                cursor: 'pointer',
                                textAlign: 'center',
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                fontSize: '1vw',
                                borderRadius: '.2vw'
                            },
                            event: {
                                type: 'click',
                                method: (eve) => {

                                    stateDrop = !stateDrop

                                    if (stateDrop) {
                                        eve.target.className = 'fa-solid fa-square-caret-up'
                                        dropList.appendChild(ListRes({}))
                                    } else {
                                        dropList.innerHTML = ''
                                        eve.target.className = 'fa-solid fa-square-caret-down'
                                        lis.remove()

                                    }

                                }
                            }

                        }))
                    }
                    const campus = $({

                        tag: 'div',

                        style: {

                            fontSize: '1vw',

                            width: '20%',

                            paddingLeft: '.5vw',

                            paddingRight: '.5vw',


                        },

                        text: camp

                    })

                    const eventType = $({

                        tag: 'div',

                        style: {

                            fontSize: '1vw',

                            paddingLeft: '.5vw',

                            paddingRight: '.5vw',

                            width: '48%',

                            whiteSpace: 'nowrap',

                            textOverflow: 'ellipsis',

                            overflow: 'hidden'

                        },

                        text: eventName

                    })

                    const dateEn = $({

                        tag: 'div',

                        style: {

                            fontSize: '1vw',

                            paddingLeft: '.5vw',

                            paddingRight: '.5vw',

                        },

                        text: date

                    })

                    return ($({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: 'fit-content'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '95%',
                                    height: 'fit-content',
                                    margin: '.5vh auto',
                                    padding: '.3rem',
                                    display: 'flex',
                                    fontSize: '1vw',
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    position: 'relative',
                                    cursor: '',
                                },
                                att: {
                                    className: 'endorsFile'
                                },
                                child: [
                                    dropDown(),
                                    open(),
                                    campus,
                                    eventType,
                                    dateEn
                                ],
                                elementHandler:(ev)=>{
                                    if(resStat*1!==0){
                                        ev.style.backgroundColor= '#222'
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '80%',
                                    margin: 'auto',
                                },
                                elementHandler: (el) => {
                                    dropList = el
                                },
                            })
                        ]
                    }))
                }
                function loadEndorsements(page) {
                    if (isLoading) return;
                    
                    isLoading = true;
                    currentPage = page;
                    
                    // ALWAYS clear and show loading - REPLACE, don't append
                    endorseBody.innerHTML = '';
                    endorseBody.appendChild($({
                        tag: 'div',
                        att: { id: 'loadingIndicator' },
                        style: {
                            textAlign: 'center',
                            padding: '20px',
                            color: '#bbb',
                            fontSize: '1.2vw',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: '5px',
                            margin: '20px'
                        },
                        text: 'Loading endorsements...'
                    }));
                    
                    // Make paginated request
                    const form = new FormData();
                    form.append('endorsementList', 'true');
                    form.append('page', page);
                    form.append('limit', 10); // Load exactly 10 per page
                    
                    fetch('/endorsement', {
                        method: 'POST',
                        body: form
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(response => {
                        // Remove loading indicator
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
                        
                        // ALWAYS clear and replace content
                        endorseBody.innerHTML = '';
                        
                        if (data.length === 0) {
                            endorseBody.appendChild($({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#bbb',
                                    fontSize: '1.2vw',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '5px',
                                    margin: '20px'
                                },
                                text: 'No endorsements found'
                            }));
                        } else {
                            // Add page navigation info at the TOP
                            endorseBody.appendChild($({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    color: '#4CAF50',
                                    fontSize: '1vw',
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    borderRadius: '5px',
                                    margin: '10px',
                                    marginBottom: '20px'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        text: `Page ${currentPage} of ${totalPages}`
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Total: ${totalEndorsements} endorsement(s)`
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Showing ${((currentPage - 1) * 10) + 1} to ${Math.min(currentPage * 10, totalEndorsements)}`
                                    })
                                ]
                            }));
                            
                            // Add ONLY the current page's endorsements
                            data.forEach(val => {
                                if(val.resStat*1===0){
                                    endorseBody.appendChild(File({
                                        camp: val.campus,
                                        eventName: val.event,
                                        date: val.date.split(' ')[0],
                                        id: val.id,
                                        research: val.research,
                                        resStat: val.resStat
                                    }));
                                } else {
                                    endorseBody.appendChild(File({
                                        camp: val.campus,
                                        eventName: val.event,
                                        date: val.date.split(' ')[0],
                                        id: val.id,
                                        research: val.research,
                                        resStat: val.resStat
                                    }));
                                }
                            });
                            
                            // Add pagination controls at the BOTTOM
                            const paginationDiv = $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    margin: '20px auto',
                                    padding: '10px'
                                },
                                child: []
                            });
                            
                            // Previous button
                            if (currentPage > 1) {
                                const prevBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '10px 20px',
                                        backgroundColor: 'rgba(0, 100, 255, 0.2)',
                                        color: 'deepskyblue',
                                        border: '1px solid deepskyblue',
                                        borderRadius: '5px',
                                        fontSize: '1vw',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    },
                                    text: '← Previous',
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            loadEndorsements(currentPage - 1);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = 'rgba(0, 100, 255, 0.3)';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = 'rgba(0, 100, 255, 0.2)';
                                    }
                                });
                                paginationDiv.appendChild(prevBtn);
                            }
                            
                            // Page indicator - with dropdown for quick navigation
                            const pageSelect = $({
                                tag: 'select',
                                style: {
                                    padding: '8px 15px',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    color: '#bbb',
                                    border: '1px solid #555',
                                    borderRadius: '3px',
                                    fontSize: '1vw',
                                    textAlign: 'center'
                                },
                                event: {
                                    type: 'change',
                                    method: (e) => {
                                        const goToPage = parseInt(e.target.value);
                                        if (goToPage >= 1 && goToPage <= totalPages) {
                                            loadEndorsements(goToPage);
                                        }
                                    }
                                }
                            });
                            
                            for (let i = 1; i <= totalPages; i++) {
                                const option = document.createElement('option');
                                option.value = i;
                                option.textContent = i;
                                if (i === currentPage) {
                                    option.selected = true;
                                }
                                pageSelect.appendChild(option);
                            }
                            
                            paginationDiv.appendChild(pageSelect);
                            
                            // Next button
                            if (currentPage < totalPages) {
                                const nextBtn = $({
                                    tag: 'button',
                                    style: {
                                        padding: '10px 20px',
                                        backgroundColor: 'rgba(0, 100, 255, 0.2)',
                                        color: 'deepskyblue',
                                        border: '1px solid deepskyblue',
                                        borderRadius: '5px',
                                        fontSize: '1vw',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    },
                                    text: 'Next →',
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            loadEndorsements(currentPage + 1);
                                        }
                                    },
                                    mouseenter: (e) => {
                                        e.target.style.backgroundColor = 'rgba(0, 100, 255, 0.3)';
                                    },
                                    mouseleave: (e) => {
                                        e.target.style.backgroundColor = 'rgba(0, 100, 255, 0.2)';
                                    }
                                });
                                paginationDiv.appendChild(nextBtn);
                            }
                            
                            endorseBody.appendChild(paginationDiv);
                        }
                        
                        isLoading = false;
                    })
                    .catch(error => {
                        //console.error('Error loading endorsements:', error);
                        
                        // Remove loading indicator
                        const loadingIndicator = document.getElementById('loadingIndicator');
                        if (loadingIndicator) loadingIndicator.remove();
                        
                        showEndorsementError('Error: ' + error.message);
                        isLoading = false;
                    });
                }
                
                function showEndorsementError(message) {
                    endorseBody.innerHTML = '';
                    endorseBody.appendChild($({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            padding: '20px',
                            color: '#ff4444',
                            fontSize: '1.2vw'
                        },
                        text: message
                    }));
                }
                
                return ($({
                    tag: 'div',
                    style: {
                        width: '98%',
                        margin: '1vh auto auto',
                        height: '92%',
                        backgroundColor: 'rgb(10,10,10,0.3)',
                        boxShadow: 'inset .3vw .3vw 2vh .1vh black',
                        overflowY: 'auto'
                    },
                    elementHandler: (el) => {
                        endorseBody = el;
                        // Load first page
                        loadEndorsements(1);
                    }
                }))
            }
            const ResearchPanel = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '98%',
                        margin: '1vh auto auto',
                        height: '82%',
                        backgroundColor: 'rgb(10,10,10,0.3)',
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
            // Define tabs array
            const tabs = [
                { id: 'entrylist', label: 'Entry List', icon: 'fa-solid fa-file-lines' },
                { id: 'endorsement', label: 'Endorsement', icon: 'fa-solid fa-pen-to-square' }
            ]

            // Keep track of current tab
            let currentTab = 'entrylist'

            // Create tabs container
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
                                        
                                        // Update button styles
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
                                        
                                        // Check if Bod exists before trying to use it
                                        if (!Bod) {
                                            console.warn('Bod container not initialized yet')
                                            return
                                        }
                                        
                                        // Refresh content based on selected tab
                                        Bod.innerHTML = ''
                                        
                                        if (currentTab === 'entrylist') {
                                            // Show Entry List content
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
                                        } else {
                                            // Show Endorsement content
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
                Content(),
            ]
        }))
    }
import {
    $,
    Base,
    ConfirmationAlert,
    Current,
    Path,
    Request,
    SearchMethod,
    TimeConvert,
    Waiting } from "../../../lib/lib.js";

import {Print} from "../../otherComponent/comment.js";
import {PrintSummary} from "../../otherComponent/ReviewTemplate.js";
import {Route, Router} from "../../../lib/Router.js";
import {TableScore} from "./src/docsScoreTable.js";
import {ScoreRank} from "./src/RankingController.js";
import {RankDocs} from "./src/docsRank.js";
import {SummaryDocs} from "./src/RankSummary.js";
import {FinalRanking, RankPerCriteria, ScoreRankAVe} from "./src/rankAlgo.js";
import {Summary} from "./src/Summary.js";
import {PrintResearch} from "../../otherComponent/researchSummary.js";



export const ResearchMain = () => {
    let mainFrame, leftPdiv
    const getMainFrame = (el) => {
        mainFrame = el
    }
    let serch
    const Incoming = () => {
        let bodyContent, docQue
        const label = $({
            tag: 'div',
            style: {
                height: 'fit-content',
                width: 'fit-content',
                fontFamily: 'arial black,sans-serif',
                color: '#bbb',
                margin: '1vh auto auto',
                fontSize: '1.2vw',
            },
            text: 'Endorsement Letter'
        })

        const search = $({
            tag: 'div',
            style: {
                height: '4vh',
                width: 'fit-content',
                marginLeft: '2vw',
                borderBottom: 'solid thin rgba(100,100,100,0.3)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '.2rem',
                borderRadius: '1vw',
                display: 'flex',
                justifyContent: 'center'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        margin: 'auto'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-magnifying-glass',
                                title: 'Search Endorsement Docs'
                            },
                            style: {
                                color: 'deepskyblue',
                                fontSize: '1.5vw'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'text',
                                className: 'searchInput',
                                placeholder: 'Search Endorsement Docs',
                            },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                paddingLeft: '.5vw',
                                paddingRight: '.5vw',
                                color: '#bbb',
                                height: '100%',
                                fontSize: '1.1vw'
                            },
                            event: {
                                type: 'input',
                                method: (ev) => {
                                    SearchMethod({
                                        nodeList:bodyContent.childNodes,
                                        textArray:ev.target.value.toUpperCase().split(' '),
                                        display:'flex'
                                    })
                                }
                            }
                        })
                    ]
                }),
            ]
        })
        const bodyPanel = () => {
            const docs = ({date, campus, eventType, file, research, docId, status, sender, smail}) => {
                let category
                research.forEach(val=>{
                    category=val.category
                })
                const viewDocs = () => {
                    let frm, viewerPanel
                    // Parse the file data - it could be JSON string or direct URL
                    let fileData = file;
                    let driveViewUrl = '';
                    
                    // Handle the new object format
                    if (typeof file === 'object' && file !== null) {
                        // Get the view URL from the object
                        if (file.viewUrl) {
                            driveViewUrl = file.viewUrl;
                        } else if (file.fileUrl) {
                            driveViewUrl = file.fileUrl;
                        } else if (file.legacyFile) {
                            driveViewUrl = file.legacyFile;
                        }
                        
                        // Store the full object for reference
                        fileData = file;
                    } else if (typeof file === 'string') {
                        // Old string format - try to parse as JSON or use as is
                        try {
                            if (file.includes('{')) {
                                const parsed = JSON.parse(file);
                                if (parsed.viewUrl || parsed.fileUrl || parsed.legacyFile) {
                                    fileData = parsed;
                                    driveViewUrl = parsed.viewUrl || parsed.fileUrl || parsed.legacyFile || file;
                                } else {
                                    driveViewUrl = file;
                                }
                            } else {
                                driveViewUrl = file;
                            }
                        } catch (e) {
                            console.log("Could not parse file as JSON, using as direct URL:", e);
                            driveViewUrl = file;
                        }
                    }
                    
                    // Clean up the URL (remove double slashes from your example)
                    if (typeof driveViewUrl === 'string') {
                        driveViewUrl = driveViewUrl.replace(/\/\//g, '/').replace('https:/drive.google.com', 'https://drive.google.com');
                    }
                    

                    const object = ({dataURL, title}) => {
                        let object
                        const getObject = (el) => {
                            object = el
                        }
                        
                        return ($({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                left: '0',
                                top: '0',
                                width: '100%',
                                height: '99.5%',
                                textAlign: 'center',
                                backgroundColor: '#222'
                            },
                            elementHandler: getObject,
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '5%',
                                        backgroundColor: '#444',
                                        justifyContent: 'center',
                                        color: '#bbb',
                                        display: 'flex'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: 'fit-content',
                                                height: 'fit-content',
                                                margin: 'auto',
                                                display: 'flex'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    object.remove()
                                                }
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        className: 'fa-solid fa-caret-left'
                                                    },
                                                    style: {
                                                        fontSize: '2vw',
                                                        margin: 'auto',
                                                        height: 'fit-content',
                                                        width: 'fit-content',
                                                        color: 'deepskyblue',
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        fontSize: '1.2vw',
                                                        color: 'deepskyblue',
                                                        fontFamily: 'arial black,sans-serif',
                                                        cursor: 'pointer',
                                                        margin: 'auto'
                                                    },
                                                    text: 'Back'
                                                }),
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                margin: 'auto',
                                                marginLeft: '2vw',
                                                height: 'fit-content',
                                                width: '80%',
                                                textAlign: 'left',
                                                display: 'flex',
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontSize: '1vw',
                                                        color: 'deepskyblue',
                                                        fontWeight: 'bold',
                                                        margin: 'auto'
                                                    },
                                                    text: 'Title: '
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: `"${title}"`,
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontSize: '1vw',
                                                        color: '#bbb',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        width: '100%',
                                                        margin: 'auto'
                                                    }
                                                })
                                            ]
                                        }),
                                    ]
                                }),
                                $({
                                    tag: 'iframe',
                                    att: {
                                        src: dataURL,
                                        type: 'application/pdf',
                                        sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                        allow: 'autoplay'
                                    },
                                    style: {
                                        width: '80%',
                                        height: '95%',
                                        margin: 'auto',
                                        border: 'none'
                                    }
                                }),
                            ]
                        }))
                    }
                    const getViewer = (el) => {
                        viewerPanel = el
                    }
                    const frameView = $({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '100%',
                        },
                        elementHandler: async (el) => {
                            frm = el;
                            
                            let fileId = null;
                            
                            // Extract file ID from the JSON string
                            if (typeof file === 'string') {
                                // Method 1: Try to parse as JSON first
                                try {
                                    const cleanJson = file.replace(/\\\//g, '/');
                                    const parsed = JSON.parse(cleanJson);
                                    
                                    if (parsed.drive_file_id) {
                                        fileId = parsed.drive_file_id;
                                    } else if (parsed.drive_view_url) {
                                        // Extract from drive_view_url
                                        const match = parsed.drive_view_url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                        if (match) fileId = match[1];
                                    }
                                } catch (e) {
                                    // Method 2: Direct regex extraction
                                    const idMatch = file.match(/"drive_file_id"\s*:\s*"([^"]+)"/);
                                    if (idMatch) {
                                        fileId = idMatch[1];
                                    } else {
                                        // Method 3: Look for any file ID pattern
                                        const patternMatch = file.match(/(1[a-zA-Z0-9_-]{10,})/);
                                        if (patternMatch) {
                                            fileId = patternMatch[1];
                                        }
                                    }
                                }
                            }
                            
                            if (fileId) {
                                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                console.log("Loading:", embedUrl);
                                
                                el.appendChild($({
                                    tag: 'iframe',
                                    att: {
                                        src: embedUrl,
                                        type: 'application/pdf',
                                        sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                        allow: 'autoplay'
                                    },
                                    style: {
                                        width: '98%',
                                        height: '99%',
                                        border: 'none',
                                        backgroundColor: '#fff'
                                    }
                                }));
                            } else {
                                // Show error
                                el.appendChild($({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: '#fff'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Could not extract Google Drive file ID',
                                            style: {
                                                fontSize: '1.5vw',
                                                color: '#f44'
                                            }
                                        })
                                    ]
                                }));
                            }
                        }
                    })

                    const DetailsViewer = () => {
                        const endorsement = $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'center',
                                height: '5%',
                                width: '100%',
                                backgroundColor: '#666',
                                borderBottom: 'solid thin #999'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        margin: 'auto',
                                        color: 'deepskyblue',
                                        display: 'flex',
                                        height: 'fit-content',
                                        width: 'fit-content',
                                        cursor: 'pointer',
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-caret-left'
                                            },
                                            style: {
                                                fontSize: '1.7vw',
                                                margin: 'auto'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Back',
                                            style: {
                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                fontSize: '1.5vw',
                                                fontWeight: 'bold',
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            viewerPanel.remove()
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Endorsement Letter',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        fontFamily: 'arial black,san-serif',
                                        fontSize: '1.4vw',
                                        color: '#bbb',
                                    }
                                })
                            ]
                        })
                        const researchBot = ({id, dataURLResearch, title, category, author, coAuthor, center, programFile, programDriveViewUrl}) => {
                            const labelDetails = (label, data) => {
                                return ($({
                                    tag: 'div',
                                    att: {
                                        innerHTML: `<span style="font-family: 'Arial Black',sans-serif; color: lightblue">${label}</span> <span>${data}</span>`
                                    },
                                    style: {
                                        fontSize: '1vw',
                                        fontFamily: 'monospace',
                                        color: '#ccc',
                                    }
                                }))
                            }
                            
                            const CoAuthorList = () => {
                                return ($({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: 'fit-content'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: "Co-Author :",
                                            style: {
                                                fontFamily: 'arial black,sans-serif',
                                                color: 'lightblue',
                                                fontSize: '1vw',
                                            }
                                        }),
                                        $({
                                            tag: 'ul',
                                            style: {
                                                marginTop: '0'
                                            },
                                            elementHandler: (el) => {
                                                JSON.parse(coAuthor).forEach(val => {
                                                    el.appendChild($({
                                                        tag: 'li',
                                                        text: val,
                                                        style: {
                                                            color: '#bbb',
                                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                            fontSize: '1vw',
                                                            fontWeight: 'bolder',
                                                        }
                                                    }))
                                                })
                                            }
                                        })
                                    ]
                                }))
                            }
                            
                            // Function to open Google Drive files
                            const openDriveFile = (fileUrl, fileTitle) => {
                                let embedUrl = fileUrl;
                                
                                // If it's a Google Drive URL, convert to embed URL
                                if (fileUrl && fileUrl.includes('drive.google.com') && !fileUrl.includes('/preview')) {
                                    const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                    if (fileIdMatch && fileIdMatch[1]) {
                                        embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                                    }
                                }
                                
                                if (embedUrl) {
                                    mainFrame.appendChild(object({dataURL: embedUrl, title: fileTitle}));
                                } else {
                                    alert('No file available');
                                }
                            }
                            
                            return ($({
                                tag: 'div',
                                style: {
                                    width: '95%',
                                    margin: '1vh auto',
                                    paddingLeft: '.2rem',
                                    paddingRight: '.2rem',
                                    backgroundColor: '#555',
                                    paddingBottom: '1vh',
                                    paddingTop: '1vh',
                                    borderRadius: '.5rem',
                                    userSelect: 'text'
                                },
                                att: {
                                    className: 'botRes..'
                                },
                                child: [
                                    labelDetails("Title : ", title),
                                    labelDetails("Author : ", author),
                                    CoAuthorList(),
                                    labelDetails("Center : ", center),
                                    labelDetails("Category : ", category),

                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'row', // Align horizontally
                                            gap: '2vw', // Space between buttons
                                            marginTop: '1vh',
                                            marginBottom: '1vh',
                                            marginLeft: '3vw'
                                        },
                                        child: [
                                            // Open Entry Button
                                            $({
                                                tag: 'div',
                                                text: 'Open entry',
                                                att: {
                                                    className: 'botRes'
                                                },
                                                style: {
                                                    fontSize: '1vw',
                                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                    width: 'fit-content',
                                                    fontWeight: 'bold',
                                                    color: 'deepskyblue',
                                                    cursor: 'pointer',
                                                    padding: '0.5vh 1vw',
                                                    userSelect: 'none',
                                                    border: 'solid thin deepskyblue',
                                                    borderRadius: '0.3vw',
                                                    backgroundColor: 'rgba(0, 191, 255, 0.1)'
                                                },
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        // Handle Google Drive URL
                                                        const researchFile = dataURLResearch;
                                                        let embedUrl = researchFile;
                                                        
                                                        // If it's a Google Drive URL, convert to embed URL
                                                        if (researchFile.includes('drive.google.com') && !researchFile.includes('/preview')) {
                                                            const fileIdMatch = researchFile.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                                            if (fileIdMatch && fileIdMatch[1]) {
                                                                embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                                                            }
                                                        }
                                                        
                                                        mainFrame.appendChild(object({dataURL: embedUrl, title: title}))
                                                    }
                                                },
                                            }),
                                            
                                            // Open Program Button (conditionally shown)
                                            ...(programDriveViewUrl ? [
                                                $({
                                                    tag: 'div',
                                                    text: 'Open program',
                                                    att: {
                                                        className: 'botRes'
                                                    },
                                                    style: {
                                                        fontSize: '1vw',
                                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                        width: 'fit-content',
                                                        fontWeight: 'bold',
                                                        color: '#FF9800', // Orange color
                                                        cursor: 'pointer',
                                                        padding: '0.5vh 1vw',
                                                        userSelect: 'none',
                                                        border: 'solid thin #FF9800',
                                                        borderRadius: '0.3vw',
                                                        backgroundColor: 'rgba(255, 152, 0, 0.1)'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            // Handle Google Drive URL for program
                                                            const programFile = programDriveViewUrl;
                                                            let embedUrl = programFile;
                                                            
                                                            // If it's a Google Drive URL, convert to embed URL
                                                            if (programFile.includes('drive.google.com') && !programFile.includes('/preview')) {
                                                                const fileIdMatch = programFile.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                                                if (fileIdMatch && fileIdMatch[1]) {
                                                                    embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                                                                }
                                                            }
                                                            
                                                            mainFrame.appendChild(object({dataURL: embedUrl, title: `Program: ${title}`}))
                                                        }
                                                    },
                                                })
                                            ] : [])
                                        ]
                                    })
                                ]
                            }))
                        }
                        const Button = ({Label, Event}) => {
                            return ($({
                                tag: 'div',
                                style: {
                                    height: '99%',
                                    width: '49%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    margin: 'auto'
                                },
                                att: {
                                    className: 'botControllStaff'
                                },
                                event: {
                                    type: 'click',
                                    method: Event
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        text: Label,
                                        style: {
                                            margin: 'auto',
                                            width: 'fit-content',
                                            height: 'fit-content',
                                            fontFamily: 'arial black,sans-serif',
                                            color: 'deepskyblue'
                                        }
                                    })
                                ]
                            }))
                        }
                        const Controller = () => {
                            const rejectReason = () => {
                                let resJ, inputres
                                const Cancel = () => {
                                    resJ.remove()
                                }
                                const resBot = ({label, eventHandler}) => {
                                    return ($({
                                        tag: 'div',
                                        style: {
                                            width: '50%',
                                            height: '100%',
                                            margin: 'auto',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        },
                                        event: {
                                            type: 'click',
                                            method: eventHandler
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                text: label,
                                                style: {
                                                    width: 'fit-content',
                                                    height: 'fit-content',
                                                    margin: 'auto',
                                                    fontFamily: 'arial black, sans-serif'
                                                }
                                            })
                                        ],
                                        att: {
                                            className: 'resBotCan'
                                        }
                                    }))
                                }
                                return ($({
                                    tag: 'div',
                                    style: {
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        left: '0',
                                        top: '0',
                                        backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    },
                                    elementHandler: (el) => {
                                        resJ = el
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                                border: 'solid thin deepskyblue',
                                                backgroundColor: '#333',
                                                textAlign: 'center',
                                                padding: '.5rem'
                                            },
                                            child: [
                                                $({
                                                    tag: 'textarea',
                                                    style: {
                                                        outline: 'none',
                                                        border: 'none',
                                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                                        resize: 'none',
                                                        height: '40vh',
                                                        width: '45vw',
                                                        margin: '1vh auto auto',
                                                        color: '#bbb',
                                                        fontFamily: 'monospace',
                                                        fontSize: '1.1vw',
                                                        padding: '.5rem'
                                                    },
                                                    att: {
                                                        placeholder: 'Enter text here...'
                                                    },
                                                    event: {
                                                        type: 'input',
                                                        method: (event) => {
                                                            inputres = event.target.value
                                                        }
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        height: '5vh',
                                                        width: '45vw',
                                                        padding: '.5rem',
                                                        margin: 'auto',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                    },
                                                    child: [
                                                        resBot({
                                                            label: 'CANCEL',
                                                            eventHandler: Cancel
                                                        }),
                                                        resBot({
                                                            label: 'SUBMIT   ',
                                                            eventHandler: async () => {
                                                                if (confirm("Click OK to confirm")) {
                                                                    let loading = Waiting()
                                                                    document.body.appendChild(loading)
                                                                    const remove = () => {
                                                                        loading.remove()
                                                                    }
                                                                    const form = new FormData()
                                                                    form.append('docId', docId)
                                                                    form.append('fileUrl', drive_view_url || file)
                                                                    form.append('reasonEnd', inputres)
                                                                    form.append('rejectIndorse', 'true')
                                                                    form.append('fileType', `EndorsementLetter:${eventType}`)
                                                                    await fetch('/getresearch', {
                                                                        method: 'POST',
                                                                        body: form
                                                                    }).then(res => {
                                                                        if (res.ok) {
                                                                            remove()
                                                                            return res.json()
                                                                        }
                                                                    })
                                                                        .then(dat => {
                                                                            if (dat.status) {
                                                                                document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                                    window.location.reload()
                                                                                }))
                                                                            } else {
                                                                                document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                                    window.location.reload()
                                                                                }))
                                                                            }
                                                                        })
                                                                }
                                                            }
                                                        }),
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
                                    width: '100%',
                                    height: '20%',
                                    position: 'absolute',
                                    bottom: '0',
                                    backgroundColor: 'deepskyblue',
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            width: '100%',
                                            height: '50%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                        },
                                        child: [
                                            Button({
                                                Label: 'ACCEPT',
                                                Event: async () => {
                                                    if (confirm("Are you sure you want to accept this documents?")) {
                                                        let loading = Waiting()
                                                        document.body.appendChild(loading)
                                                        const req = new Request('/uploadResearchFile')
                                                        req.Post([

                                                            {

                                                                name: 'acceptRequest',

                                                                value: '1'

                                                            },

                                                            {

                                                                name: 'docId',

                                                                value: docId

                                                            },

                                                            {

                                                                name: 'campus',

                                                                value: campus

                                                            },

                                                            {

                                                                name: 'eventType',

                                                                value: eventType

                                                            }

                                                        ])

                                                        req.Json()

                                                        req.Send().then(data => {

                                                            if (data.status) {

                                                                loading.remove();

                                                                setTimeout(() => {

                                                                    alert("Document Accepted...!")

                                                                }, 100)

                                                                window.location.reload()

                                                            } else {

                                                                alert(data.message)

                                                            }

                                                        })

                                                    }

                                                }

                                            }),

                                            Button({

                                                Label: 'REJECT',

                                                Event: () => {

                                                    if (confirm("Are you sure you want to reject this documents?")) {

                                                        mainFrame.appendChild(rejectReason())

                                                    }

                                                }

                                            }),


                                        ]

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            height: '50%',

                                            width: '100%',

                                            display: 'flex',

                                            justifyContent: 'center',

                                        },

                                        child: [

                                            $({

                                                tag: 'div',

                                                att: {

                                                    className: 'botControllStaff'

                                                },

                                                style: {

                                                    width: '99%',

                                                    height: '90%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    margin: '1% auto auto'

                                                },
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        viewerPanel.remove()
                                                        // window.location.reload()
                                                    }
                                                },

                                                child: [

                                                    $({

                                                        tag: 'div',

                                                        text: 'Close',

                                                        style: {

                                                            width: 'fit-content',

                                                            height: 'fit-content',

                                                            fontFamily: 'arial black,sans-serif',

                                                            margin: 'auto',

                                                            fontSize: '1.4vw',

                                                            color: 'deepskyblue'

                                                        }

                                                    })

                                                ]

                                            })

                                        ]

                                    })

                                ]

                            }))

                        }


                        const getClickBot = (el) => {
                            const holder = $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '65%',
                                    overflowY: 'auto',
                                    backgroundColor: '#333'
                                }
                            })
                            el.appendChild(endorsement)
                            el.appendChild($({
                                tag: 'div',
                                text: 'Documents',
                                style: {
                                    margin: '1vh auto',
                                    fontFamily: 'arial black, sans-serif',
                                    fontSize: '1.2vw',
                                    color: '#bbb'
                                }
                            }))
                            el.appendChild($({
                                tag: 'div',
                                style: {
                                    color: '#bbb',
                                    fontWeight: 'bold',
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'
                                },
                                att: {
                                    innerHTML: `<span style="font-size:1vw;color:deepskyblue">Entries:</span> ${research.length}`
                                }
                            }))
                            //    $research->id=$v['id'];

                            //                 $research->senderid=$v['senderid'];

                            //                 $research->author=$v['author'];

                            //                 $research->title=$v['title'];

                            //                 $research->file=$v['file'];

                            //                 $research->event=$v['event'];

                            //                 $research->status=$v['status'];

                            //                 $research->campus=$v['campus'];

                            //                 $research->category=$v['category'];

                            research.forEach(val => {
                                holder.appendChild(researchBot({
                                    dataURLResearch: val.file,
                                    title: val.title,
                                    category: val.category,
                                    author: val.author,
                                    coAuthor: val.coauthor,
                                    center: val.center,
                                    programFile: val.programFile,
                                    programDriveViewUrl: val.program_drive_view_url 
                                }))
                            })
                            el.appendChild(holder)
                            el.appendChild(Controller())
                        }
                        return ($({
                            tag: 'div',
                            style: {
                                width: '29.5%',
                                height: '100%',
                                margin: 'auto',
                                borderRight: 'solid thin #bbb',
                                position: 'relative'
                            },
                            elementHandler: getClickBot
                        }))
                    }
                    return ($({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            left: '0',
                            top: '0',
                            display: 'flex',
                            justifyContent: 'center',
                            backgroundColor: '#555'
                        },
                        elementHandler: getViewer,
                        child: [
                            DetailsViewer(),
                            frameView
                        ]
                    }))
                }


                const icon = $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-file-pdf'
                    },
                    style: {
                        fontSize: '3vw',
                        margin: 'auto',
                        color: '#999',
                        textShadow: '-.2vw .5vh .5vw black'
                    }
                })
                const leftBox = () => {
                    const details = (label, data) => {
                        return ($({
                            tag: 'div',
                            style: {
                                width: 'fit-content',
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: label,
                                    style: {
                                        color: 'lightskyblue',
                                        fontSize: '1vw',
                                        fontFamily: 'arial black'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: data,
                                    style: {
                                        color: '#bbb',
                                        fontSize: '1vw',
                                        fontFamily: 'arial,sans-serif'
                                    }
                                })
                            ]
                        }))
                    }
                    let [Date,Time]=date.split(' ')
                    let TimeFormat=TimeConvert(Time.split(":"))
                    return ($({
                        tag: 'div',
                        style: {
                            margin: 'auto',
                            width: '90%',
                        },
                        child: [
                            details("Date: ", Date+" || "+TimeFormat),
                            details("Campus: ", campus),
                            details("Sender: ", sender),
                            details("Sender email: ", smail),
                            details("Event type: ", eventType),
                            details("Category: ", category),]
                    }))
                }
                return ($({
                    tag: 'button',
                    style: {
                        width: '95%',
                        margin: '.5vw auto',
                        padding: '.3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        border: 'solid thin #999'
                    },
                    att: {
                        className: 'endorseIncoming'
                    },
                    child: [
                        icon,
                        leftBox()
                    ],

                    event: {
                        type: 'click',
                        method: () => {
                            mainFrame.appendChild(viewDocs())
                        }
                    },
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    width: '98%',
                    margin: '1vh auto auto',
                    height: '86%',
                    backgroundColor: 'rgb(10,10,10,0.3)',
                    overflowY: 'auto',
                    boxShadow: 'inset .3vw .3vw 2vh .5vh black'
                },

                elementHandler: async (el) => {
                    bodyContent = el
                    const form = new FormData()
                    form.append('incomingEndorsement', 'true')
                    await fetch('/uploadResearchFile', {
                        method: 'POST',
                        body: form
                    }).then(res => res.json())
                        .then(data => {
                            docQue.innerText = `  ${data.length}  `
                            data.forEach(val => {
                                el.appendChild(docs({
                                    date: val.date,
                                    campus: val.campus,
                                    eventType: val.event,
                                    file: val.file,
                                    research: val.researchDocs,
                                    docId: val.id,
                                    sender: val.senderType,
                                    smail: val.senderEmail
                                }))
                            })
                        })
                }
            }))
        }
        return ($({
            tag: 'div',
            style: {
                width: '49.9%',
                height: '100%',
                backgroundColor: 'rgba(100,100,100,0.2)',
                margin: 'auto',
                marginLeft: '0',
            },
            child: [
                label,
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        height: 'fit-content',
                        marginTop: '1vh'
                    },
                    child: [
                        search,
                        $({
                            tag: 'div',
                            style: {
                                width: '15vw',
                                height: 'fit-content',
                                margin: "auto",
                                marginRight: '1vw',
                                whiteSpace: 'nowrap',
                                fontSize: '1vw',
                                color: 'deepskyblue',
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Submitted document(s):',
                                    style: {
                                        fontSize: '1.2vw'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        color: '#bbb'
                                    },
                                    elementHandler: (el) => {
                                        docQue = el
                                    }
                                }),
                            ]
                        })
                    ],
                }),
                bodyPanel()
            ]
        }))
    }
    const Forwarded = () => { //position at the right panel
        let researchBody, endorseBody
        const ResearchDocs = ({category, center,file, docId, title, author, eventTYpe, deleteRequest, campus,endorseId}) => {
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
                                                mainFrame.appendChild(comments(data))
                                            })
                                    },
                                    tooltip:'View Comments'
                                }),
                                bot({
                                    label: 'fa-solid fa-folder-open',
                                    event: () => {
                                        mainFrame.appendChild(Viewer())
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
                // Handle different file formats
                const getFileUrl = (fileData) => {
                    if (!fileData) return null;
                    
                    // If it's already a string URL
                    if (typeof fileData === 'string') {
                        return fileData;
                    }
                    
                    // If it's an object with Google Drive URLs
                    if (typeof fileData === 'object') {
                        // Check for Google Drive URLs first
                        if (fileData.drive_view_url) return fileData.drive_view_url;
                        if (fileData.viewUrl) return fileData.viewUrl;
                        if (fileData.fileUrl) return fileData.fileUrl;
                        if (fileData.legacyFile) return fileData.legacyFile;
                    }
                    
                    return null;
                }
                
                const fileUrl = getFileUrl(file);
                const isGoogleDriveUrl = fileUrl && fileUrl.includes('drive.google.com');
                
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
                            
                            console.log('Google Drive URL:', file);
                            
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
                                    console.log('File ID found:', fileId);
                                    break;
                                }
                            }
                            
                            // If no fileId found in patterns, try to extract from URL path
                            if (!fileId && file.includes('drive.google.com')) {
                                const urlParts = file.split('/');
                                for (let i = 0; i < urlParts.length; i++) {
                                    if (urlParts[i] === 'd' && urlParts[i + 1]) {
                                        fileId = urlParts[i + 1];
                                        console.log('File ID from path:', fileId);
                                        break;
                                    }
                                }
                            }
                            
                            if (isGoogleDriveUrl) {
                                // Clean the fileId (remove query parameters if any)
                                fileId = fileId.split('?')[0].split('&')[0];
                                embedUrl = `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
                                
                                console.log('Final Embed URL:', embedUrl);
                                
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
                                    console.log('Google Drive iframe loaded successfully');
                                    // Remove loading indicator
                                    if (loadingIndicator.parentNode === el) {
                                        el.removeChild(loadingIndicator);
                                    }
                                    
                                    // Don't try to access iframe content due to CORS
                                    // Instead, listen for postMessage from iframe if needed
                                    window.addEventListener('message', (event) => {
                                        // Handle messages from Google Drive iframe if any
                                        console.log('Message from iframe:', event.data);
                                    });
                                };
                                
                                // Handle load error
                                iframe.onerror = () => {
                                    console.log('Google Drive iframe failed to load');
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
                                        console.log('Google Drive iframe loading timeout');
                                        el.removeChild(loadingIndicator);
                                        // Show alternative options
                                        showAlternativeOptions(el, file, fileId);
                                    }
                                }, 10000); // 10 second timeout
                                
                                el.appendChild(iframe);
                                
                            } else {
                                // Invalid Google Drive URL format
                                console.log('Invalid Google Drive URL format:', file);
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
                        }),
                        /*

                        Main({

                            evalName: reviews.evalName,

                            title: title,

                            author: author,

                            campus: '',

                            category: reviews.category,

                            date: '',

                            intro: reviews.intro,

                            abstract: reviews.abstract,

                            objective: reviews.objective,

                            methodology: reviews.methodology,

                            results: reviews.results,

                            recommendation: reviews.recommendation,

                            literature: reviews.literature,

                            other: reviews.other,



                        })

                         */

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
                color: '#bbb',
                margin: '1vh auto auto',
                fontSize: '1.2vw'
            },
            text: 'Accepted Documents'
        })
        const searchInput = (value) => {
            SearchMethod({
                nodeList:researchBody.childNodes,
                textArray:value.target.value.toUpperCase().split(' '),
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
                    justifyContent: 'center'
                },
                elementHandler: (el) => {
                    el.appendChild($({
                        tag: 'div',
                        style: {
                            height: '4vh',
                            width: 'fit-content',
                            margin: '1vh auto auto',
                            marginLeft: '2vw',
                            borderBottom: 'solid thin rgba(100,100,100,0.3)',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            padding: '.2rem',

                            borderRadius: '1vw',

                            display: 'flex',

                            justifyContent: 'center'

                        },

                        child: [

                            $({

                                tag: 'div',

                                style: {

                                    width: 'fit-content',

                                    height: 'fit-content',

                                    margin: 'auto'

                                },

                                child: [

                                    $({

                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-magnifying-glass',
                                            title: 'Search Event Document'
                                        },

                                        style: {

                                            color: 'deepskyblue',

                                            fontSize: '1.5vw'

                                        }

                                    }),

                                    $({

                                        tag: 'input',

                                        att: {
                                            type: 'text',
                                            className: 'searchInput',
                                            placeholder: 'Search Event Document'
                                        },
                                        event: {
                                            type: 'input',
                                            method: searchEvent
                                        },
                                        style: {
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            paddingLeft: '.5vw',
                                            paddingRight: '.5vw',
                                            color: '#bbb',
                                            height: '100%',
                                            fontSize: '1.1vw'
                                        },
                                        elementHandler: (el) => {
                                            serch = el
                                        }
                                    })
                                ]
                            })
                        ]
                    }))
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
                        height: '100%%',
                        backgroundColor: '#555',
                        justifyContent: 'center',
                        display: 'flex'
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
                                        fontFamily: 'arial black,sans-serif',
                                        fontSize: '1.2vw'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '5vh',
                                        margin: 'auto'
                                    },
                                    child: [
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                fontFamily: '1.1vw',
                                                outline: 'none',
                                                textAlign: 'center',
                                                color: '#ddd',
                                                border: 'solid thin rgba(200,200,200,0.5)',
                                                borderRadius: '15px'
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
                                                        backgroundColor: '#333'
                                                        
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
                                                                backgroundColor: '#333',
                                                                color: '#bbb',
                                                                height: '4vh',
                                                                fontSize: '1.1vw'
                                                                
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
                                        height: '5vh',
                                        margin: '1vh auto'
                                    },
                                    child: [
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                fontFamily: '1.1vw',
                                                outline: 'none',
                                                textAlign: 'center',
                                                color: '#ddd',
                                                border: 'solid thin rgba(200,200,200,0.5)',
                                                borderRadius: '15px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'option',
                                                    text: '-- Select Center --',
                                                    att: {
                                                        disabled: true,
                                                        selected: true
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Print All Category',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Crop Science Research & Developement Center (CSRDC)',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Livestock Research & Development Center (LRDC)',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Fisheries Research & Development Center (FRDC)',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Food and Industrial Technology Research & Development Center (FIRDC) ',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Social Science Research & Development Center (SSRDC)',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Machinery and Agricultural Technology Engineering Center (MATEC)     ',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Coconut Research and Development Center (Coco RDC)',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'option',
                                                    text: 'Extension ',
                                                    style: {
                                                        backgroundColor: '#333',
                                                        fontSize: '1.1vw'
                                                    }
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
                                        height: '5vh',
                                        margin: '2vh auto auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
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
                                                fontSize: '1.3vw',
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                                marginLeft: '1vw',
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                height: 'fit-content',
                                                width: '100%',
                                                fontFamily: 'arial  black,sans-serif',
                                                margin: 'auto',
                                                marginLeft: '1vw',
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
                                                    data.forEach(val => {
                                                        if(val.comments.length > 0){
                                                            print.appendChild(Print({
                                                                title: val.title,
                                                                review: val.comments,
                                                                category: val.category,
                                                                campus: val.campus,
                                                                date: val.date.split(' ')[0],
                                                                author: val.author,
                                                                all:true,
                                                                getHandler: (el) => {
                                                                    samp = el
                                                                }
                                                            }))
                                                        }
                                                    })
                                                })
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '5vh',
                                        margin: ' auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
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
                                                fontSize: '1.3vw',
                                                height: 'fit-content',
                                                width: 'fit-content',
                                                margin: 'auto',
                                                marginLeft: '1vw',
                                            }
                                        }),
                                        $({
                                            tag: 'div',

                                            style: {

                                                height: 'fit-content',

                                                width: '100% ',

                                                fontFamily: 'arial  black,sans-serif',

                                                margin: 'auto',

                                                marginLeft: '1vw'

                                            },

                                            text: 'Print'

                                        })

                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            // Get all the printable content
                                            let WinPrint = window.open('', '_blank', 'toolbar=0,scrollbars=0,status=0');
                                            
                                            // Start building the HTML document
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
                                                color-adjust: exact !important;
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
                                            
                                            // Get all the nodes to print
                                            const nodes = print.childNodes;
                                            
                                            // Add each document with its own page container and header
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
                                            
                                            // Close HTML document
                                            htmlContent += `
                                    </body>
                                    </html>`;
                                            
                                            // Write to print window
                                            WinPrint.document.write(htmlContent);
                                            WinPrint.document.close();
                                            
                                            // Wait for images to load, then print
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
                                        height: '5vh',
                                        margin: ' auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
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
                                                marginLeft: '1vw',
                                                marginRight: '.3vw'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                fontFamily: 'arial black,sans-serif',
                                                margin: 'auto',
                                                width: '100%',
                                                marginLeft: '1vw',
                                            },
                                            text: 'Back'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            printerPanel.remove()
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

                        height: '100%%',

                        backgroundColor: '#333',

                        overflowY: 'auto'

                    },

                    att: {

                        className: 'sample'

                    },

                    elementHandler: getPrintable

                })


                return ($({

                    tag: 'div',

                    style: {

                        width: '100%',

                        height: '100%',

                        backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',

                        position: 'absolute',

                        display: 'flex',

                        justifyContent: 'center'

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
                    right: '2vw',
                    top: '0',
                    bottom: '0',
                    margin: 'auto',
                    height: 'fit-content',
                    width: 'fit-content',
                    backgroundColor: '#333',
                    padding: '.3rem',
                    borderRadius: '.5vw'
                },
                elementHandler: (el) => {
                    toolBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '1vw',
                            cursor: 'pointer',
                            fontFamily: 'arial black,sans-serif',
                            color: 'grey'
                        },
                        text: 'Print All Comments',
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        mainFrame.appendChild(printPane())
                    }
                }
            }))
        }
        const Content = () => {
            const Report=()=>{
                const ReportPanel=()=>{
                    let panBo
                    let bodCon
                    let eventTypeName
                    const contain=({category,total,eventType})=>{

                        let dropDownState=false,dropPan

                        return($({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'fit-content',
                                marginTop:'.5vh',
                                marginBottom:'.5vh',
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        display:'flex',
                                        width:'100%',
                                        height:'fit-content',
                                        borderBottom:'solid thin deepskybluee'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            att:{
                                                //<i class="fa-solid fa-square-caret-up"></i>
                                                className:'fa-solid fa-square-caret-up',
                                                
                                            },
                                            style:{
                                                width:'5%',
                                                textAlign:'center',
                                                margin:'auto',
                                                fontSize:'1.2vw',
                                                color:'deepskyblue'
                                            },
                                            elementHandler:(el)=>{
                                            },
                                            event:{
                                                type:'click',
                                                method:(eve)=>{
                                                    dropPan.innerHTML=''
                                                    dropDownState=!dropDownState
                                                    if(dropDownState){
                                                        eve.target.className='fa-solid fa-square-caret-down'
                                                        const req= new Request('/entrycount')
                                                        req.Post([
                                                            {
                                                                name:'perCampReport',
                                                                value:'1'
                                                            },
                                                            {
                                                                name:'category',
                                                                value:category
                                                            },
                                                            {
                                                                name:'eventType',
                                                                value:eventType
                                                            }
                                                        ])
                                                        req.Json()
                                                        req.Send().then(data=>{
                                                            const ul=$({
                                                                tag:'ul',
                                                                style:{
                                                                    userSelect:'text'
                                                                }
                                                            })
                                                            data.forEach(val=>{
                                                                if(val.total>0){
                                                                    ul.appendChild($({
                                                                        tag:'li',
                                                                        style:{
                                                                            display:'flex',
                                                                            width:'100%',
                                                                            borderBottom:'solid thin #999'
                                                                        },
                                                                        child:[
                                                                            $({
                                                                                tag:'div',
                                                                                text:val.name,
                                                                                style:{
                                                                                    width:'50%',
                                                                                    color:'#bbb',
                                                                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'div',
                                                                                text:val.total,
                                                                                style:{
                                                                                    width:'50%',
                                                                                    color:'#bbb',
                                                                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif'
                                                                                }
                                                                            })
                                                                        ]
                                                                    }))
                                                                }
                                                            })
                                                            dropPan.appendChild(ul)
                                                        })
                                                    }else {
                                                        eve.target.className='fa-solid fa-square-caret-up'
                                                    }

                                                }
                                            }
                                        }),
                                        $({
                                            tag:'div',
                                            style:{
                                                width:'45%',
                                                margin:'auto',
                                                fontSize:'1vw',
                                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color:'deepskyblue'
                                            },
                                            text:category
                                        }),
                                        $({
                                            tag:'div',
                                            style:{
                                                width:'50%',
                                                margin:'auto',
                                                fontSize:'1vw',
                                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                color:'deepskyblue'
                                            },
                                            text:total
                                        })
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        width:'100%',
                                    },
                                    elementHandler:(el)=>{
                                        dropPan=el
                                    }
                                })
                            ]
                        }))
                    }
                    const printSummary=(eventDetails)=>{
                        return($({
                            tag:'div',
                            style:{
                                marginTop:'4vh',
                                width:'100%',
                                textAlign:'center',
                                fontSize:'1.1vw',
                                color:'deepskyblue',
                                cursor:'pointer',
                                fontFamily:"Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif"
                            },
                            text:'Print Summary',
                            event:{
                                type:'click',
                                method:()=>{

                                    const req= new Request('/entrycount')
                                    req.Post([
                                        {
                                            name:'printSum',
                                            value:'1'
                                        },
                                        {
                                            name:'eventName',
                                            value:eventDetails.name
                                        },

                                    ])
                                    req.Json()
                                    req.Send().then(data=>{

                                        let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');

                                        WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')

                                        WinPrint.document.write(PrintSummary(data).innerHTML);

                                        WinPrint.document.close();

                                        WinPrint.focus();

                                        WinPrint.print();

                                        WinPrint.close();

                                    })



                                }
                            }
                        }))
                    }
                    const researchEntry=(eventDetails)=>{
                        return($({
                            tag:'div',
                            style:{
                                marginTop:'4vh',
                                width:'100%',
                                textAlign:'center',
                                fontSize:'1.1vw',
                                color:'deepskyblue',
                                cursor:'pointer',
                                fontFamily:"Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif"
                            },
                            text:'Print Reasarch Entry Sumarry',
                            event:{
                                type:'click',
                                method:()=>{

                                    const req= new Request('/entrycount')
                                    req.Post([
                                        {
                                            name:'printEntry',
                                            value:'1'
                                        },
                                        {
                                            name:'eventName',
                                            value:eventDetails.name
                                        },

                                    ])
                                    req.Json()
                                    req.Send().then(data=>{

                                        let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');

                                        WinPrint.document.write('<head><title>Summary</title><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')

                                        WinPrint.document.write(PrintResearch({
                                            eventName:eventDetails.name,
                                            data:data
                                        }).innerHTML);

                                        WinPrint.document.close();

                                        WinPrint.focus();

                                        WinPrint.print();

                                        WinPrint.close();

                                    })



                                }
                            }
                        }))
                    }
                    const SelectEvent=()=>{
                        let selVal
                        return($({
                            tag:'div',
                            style:{
                                width:'70%',
                                marginTop:'1vh',
                                border:'solid thin #999',
                                height:'4vh',
                                display:'flex',
                                margin:'auto',
                                padding:'.5vw',
                                borderRadius:'.5vw',
                                marginLeft:'2vw'
                            },
                            child:[
                                $({
                                    tag:"div",
                                    att:{
                                        className:'fa-solid fa-calendar-check'
                                    },
                                    style:{
                                        color:"deepskyblue",
                                        fontSize:'1.2vw',
                                        margin:'auto'
                                    }
                                }),
                                $({
                                    tag:'select',
                                    style:{
                                        backgroundColor:'transparent',
                                        border:'none',
                                        width:'90%',
                                        height:'100%',
                                        outline:'none',
                                        color:'deepskyblue',
                                        textAlign:'center',
                                        cursor:'pointer',
                                    },
                                    elementHandler:(el)=>{
                                        selVal=el
                                        const req= new Request('/eventRequest')
                                        req.Post([
                                            {
                                                name:'getEventAdmin',
                                                value:'1'
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            el.appendChild($({
                                                tag:'option',
                                                text:'- - Select Event - -',
                                                att:{
                                                    disable:true,
                                                    selected:true
                                                }
                                            }))
                                            data.forEach(val=>{
                                                el.appendChild($({
                                                    tag:'option',
                                                    text:val.name,
                                                    att:{
                                                        id:val.id
                                                    },
                                                    style:{
                                                        backgroundColor:'#222',
                                                        fontSize:'1vw'
                                                    }
                                                }))
                                            })
                                        })
                                    }
                                }),
                                $({
                                    tag:"button",
                                    att:{
                                        className:'fa-solid fa-rotate',
                                        title: 'Refresh'
                                    },
                                    style:{
                                        color:"deepskyblue",
                                        fontSize:'1.2vw',
                                        margin:'auto',
                                        marginLeft:'3vw',
                                        backgroundColor:'#444',
                                        borderRadius:'.5vw',
                                        cursor:'pointer',
                                        border:'solid thin deepskyblue'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            let eventType=selVal.childNodes[selVal.selectedIndex].innerText
                                            eventTypeName={
                                                name:eventType,
                                                eventId:eventType.id
                                            }
                                            bodCon.innerHTML=''
                                            const req= new Request('/entrycount')
                                            req.Post([
                                                {
                                                    name:'entryCounter',
                                                    value:'1',
                                                },
                                                {
                                                    name:'eventType',
                                                    value:eventType
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{

                                                data.forEach(val=>{

                                                    bodCon.appendChild(contain({
                                                        category:val.name,
                                                        total:val.total,
                                                        eventType:eventType
                                                    }))

                                                })
                                                bodCon.appendChild(printSummary(eventTypeName))
                                                bodCon.appendChild(researchEntry(eventTypeName))
                                            })
                                        }
                                    }

                                })
                            ]
                        }))
                    }
                    const bod=()=>{

                        const leb=(text)=>{
                            return($({
                                tag:'div',
                                style:{
                                    width:'50%',
                                    height:'fit-content',
                                    margin:'auto',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    fontSize:'1vw',
                                    color:'#999'
                                },
                                text:text
                            }))
                        }

                        return($({
                            tag:'div',
                            style:{
                                width:'95%',
                                margin:'auto',
                                marginTop:'2vh',
                                border:'solid thin #999',
                                backgroundColor:'#333',
                                height:'82%'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        height:'5%',
                                        width:'100%',
                                        backgroundColor:'#444',
                                        display:'flex'
                                    },
                                    child:[
                                        leb("Category"),
                                        leb("Total Entries"),
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        height:'95%',
                                        width:'100%',
                                        overflowY:'auto',
                                    },
                                    elementHandler:(el)=>{
                                        bodCon=el

                                    }
                                })
                            ]
                        }))
                    }

                    return($({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            position:'absolute',
                            left:'0',
                            top:'0',
                            backgroundColor:'rgba(0,0,0,0.8)'
                        },
                        elementHandler:(el)=>{
                            panBo=el
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    height:'100%',
                                    position:'relative',
                                    display:'flex',
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        att:{
                                            className:'fa-solid fa-circle-xmark'
                                        },
                                        style:{
                                            fontSize:'1.5vw',
                                            color:'deepskyblue',
                                            position:'absolute',
                                            left:'.5vw',
                                            top:'1vh',
                                            cursor:'pointer'
                                        },
                                        event:{
                                            type:'click',
                                            method:()=>{
                                                panBo.remove()
                                            }
                                        }
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            width:'95%',
                                            height:'95%',
                                            overflowY:'auto',
                                            border:'solid thin #999',
                                            margin:'auto',
                                            backgroundColor:'#222'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                style:{
                                                    width:'100%',
                                                    height:'fit-content',
                                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                    color:'#bbb',
                                                    textAlign:'center',
                                                    marginBottom: '2vh',
                                                    marginTop:'1vh'
                                                },
                                                text:'Entries Summary'
                                            }),
                                            SelectEvent(),
                                            bod()
                                        ]
                                    })
                                ]
                            }),

                        ]
                    }))
                }
                return($({
                    tag:'div',
                    style:{
                        margin: 'auto',
                        border:'solid thin rgba(153,153,153)',
                        padding: '.4rem',
                        borderRadius:'1rem',
                        backgroundColor: 'rgba(34,34,34)',
                        width: 'fit-content',
                        height: 'fit-content',
                        marginRight:'3vw'
                    },
                    child:[
                        $({
                            tag:'button',
                            att:{
                                className:'fa-solid fa-chart-bar',
                                title: 'View Summary'
                            },
                            style:{
                                fontSize:'1vw',
                                backgroundColor:'transparent',
                                border:'none',
                                outline: 'none',
                                width: 'fit-content',
                                height: 'fit-content',
                                cursor:'pointer',
                                color:'deepskyblue'
                            },
                            text: 'View Summary',
                            event:{
                                type:'click',
                                method:()=>{
                                    leftPdiv.appendChild(ReportPanel())
                                }
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
                        width: '100%',
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: 'fit-content',
                                height: 'fit-content',
                                border: 'solid thin #555',
                                margin: 'auto',
                                padding: '.3rem',
                                marginLeft: '.56vw',
                                borderRadius: '.5vw',
                                backgroundColor: 'rgba(0,0,0,0.3)'
                            },
                            child: [
                                $({
                                    tag: 'select',
                                    att: {
                                        id: 'eventSelectFilter'
                                    },
                                    style: {
                                        backgroundColor: 'transparent',
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        fontSize: '1.1vw',
                                        border: 'none',
                                        outline: 'none',
                                        color: '#bbb',
                                        width: '17vw',
                                        height: '3vw',
                                        textAlign: 'center'
                                    },
                                    elementHandler: (el) => {
                                        // Add default "All Event" option
                                        el.appendChild($({
                                            tag: 'option',
                                            text: 'All Event',
                                            fontSize: '18px',
                                            style: {
                                                backgroundColor: 'rgba(0,0,0,0.8)',
                                                color: '#bbb'
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
                                            data.forEach(val => {
                                                el.appendChild($({
                                                    tag: 'option',
                                                    text: val.name,
                                                    style: {
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                        color: '#bbb'
                                                    },
                                                    att: {
                                                        value: val.id
                                                    }
                                                }))
                                            })
                                        })
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-arrows-rotate',
                                        title: 'Refresh Event Documents',
                                        id: 'refreshBtn'
                                    },
                                    style: {
                                        margin: 'auto',
                                        marginLeft: '2vw',
                                        marginRight: '1vw',
                                        fontSize: '2vw',
                                        color: 'deepskyblue',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            // Reset to page 1
                                            currentPage = 1;
                                            
                                            console.log('Refresh button clicked');
                                            
                                            // Get the select element by ID
                                            const eventSelect = document.getElementById('eventSelectFilter');
                                            
                                            if (!eventSelect) {
                                                console.error('Could not find event select element!');
                                                return;
                                            }
                                            
                                            // Get the selected value
                                            currentEventId = eventSelect.value || '0';
                                            const selectedText = eventSelect.options[eventSelect.selectedIndex].text;
                                            
                                            console.log('Selected event:', selectedText, 'ID:', currentEventId);
                                            
                                            // Clear search if it exists
                                            if (typeof serch !== 'undefined' && serch) {
                                                serch.value = '';
                                            }
                                            
                                            // Load first page (this will replace any existing content)
                                            loadDocuments(currentEventId, 1);
                                        }
                                    }
                                })
                            ]
                        })
                    ],
                });
                
                function loadDocuments(eventId, page) {
                    if (isLoading) return;
                    
                    isLoading = true;
                    
                    // Always show loading indicator since we're replacing content
                    researchBody.innerHTML = '';
                    researchBody.appendChild($({
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
                        text: 'Loading documents...'
                    }));
                    
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
                        console.log('Response received:', response);
                        
                        // Remove loading indicator
                        const loadingIndicator = document.getElementById('loadingIndicator');
                        if (loadingIndicator) loadingIndicator.remove();
                        
                        if (response.error) {
                            console.error('Server error:', response.error);
                            showError('Server error: ' + response.error);
                            return;
                        }
                        
                        if (!response.data || !Array.isArray(response.data)) {
                            console.error('Invalid response format:', response);
                            showError('Invalid response format from server');
                            return;
                        }
                        
                        const data = response.data;
                        hasMore = response.hasMore;
                        totalDocuments = response.total;
                        currentPage = page; // Update current page
                        
                        // Clear and show new content (REPLACE, not append)
                        researchBody.innerHTML = '';
                        
                        if (data.length === 0) {
                            const eventSelect = document.getElementById('eventSelectFilter');
                            const selectedText = eventSelect ? eventSelect.options[eventSelect.selectedIndex].text : 'Selected event';
                            
                            researchBody.appendChild($({
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
                                text: `No documents found for "${selectedText}"`
                            }));
                        } else {
                            // Show page navigation info
                            const navDiv = $({
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
                                        text: `Page ${page} of ${response.totalPages || '?'}`
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Total: ${totalDocuments} document(s)`
                                    }),
                                    $({
                                        tag: 'div',
                                        text: `Showing documents ${((page - 1) * 10) + 1} to ${Math.min(page * 10, totalDocuments)}`
                                    })
                                ]
                            });
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
                                    endorseId: val.endorsId
                                }));
                            });
                            
                            // Add pagination controls
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
                            if (page > 1) {
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
                                            loadDocuments(currentEventId, page - 1);
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
                            
                            // Page indicator
                            const pageIndicator = $({
                                tag: 'div',
                                style: {
                                    padding: '10px 20px',
                                    color: '#bbb',
                                    fontSize: '1vw'
                                },
                                text: `Page ${page}`
                            });
                            paginationDiv.appendChild(pageIndicator);
                            
                            // Next button
                            if (hasMore) {
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
                                            loadDocuments(currentEventId, page + 1);
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
                            
                            researchBody.appendChild(paginationDiv);
                            
                            // Add page number input for direct navigation (optional)
                            if (response.totalPages > 5) {
                                const pageNavDiv = $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginTop: '10px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            style: { color: '#bbb', fontSize: '0.9vw' },
                                            text: 'Go to page:'
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'number',
                                                min: '1',
                                                max: response.totalPages,
                                                value: page
                                            },
                                            style: {
                                                width: '60px',
                                                padding: '5px',
                                                backgroundColor: 'rgba(0,0,0,0.3)',
                                                color: '#bbb',
                                                border: '1px solid #555',
                                                borderRadius: '3px',
                                                textAlign: 'center'
                                            },
                                            event: {
                                                type: 'change',
                                                method: (e) => {
                                                    const goToPage = parseInt(e.target.value);
                                                    if (goToPage >= 1 && goToPage <= response.totalPages) {
                                                        loadDocuments(currentEventId, goToPage);
                                                    } else {
                                                        e.target.value = page;
                                                    }
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            style: { color: '#888', fontSize: '0.9vw' },
                                            text: `of ${response.totalPages}`
                                        })
                                    ]
                                });
                                researchBody.appendChild(pageNavDiv);
                            }
                        }
                        
                        isLoading = false;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        
                        // Remove loading indicator
                        const loadingIndicator = document.getElementById('loadingIndicator');
                        if (loadingIndicator) loadingIndicator.remove();
                        
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
                                padding: '20px',
                                color: '#ff4444',
                                fontSize: '1.2vw'
                            },
                            text: message
                        }));
                    }
                }
                
                // Add scroll event listener for infinite scroll (optional)
                function setupInfiniteScroll() {
                    window.addEventListener('scroll', () => {
                        if (isLoading || !hasMore) return;
                        
                        const scrollPosition = window.innerHeight + window.scrollY;
                        const pageHeight = document.documentElement.scrollHeight;
                        const threshold = 100; // pixels from bottom
                        
                        if (scrollPosition >= pageHeight - threshold) {
                            currentPage++;
                            loadDocuments(currentEventId, currentPage);
                        }
                    });
                }
                
                // Initialize scroll listener
                setTimeout(setupInfiniteScroll, 1000);
            }
            const Score=()=>{
                return($({
                    tag:'div',
                    style:{
                        margin: 'auto',
                        border:'solid thin rgba(153,153,153)',
                        padding: '.5rem',
                        borderRadius:'1rem',
                        backgroundColor: 'rgba(34,34,34)',
                        width: 'fit-content',
                        height: 'fit-content',
                        marginRight:'1vw'
                    },
                    child:[
                        $({
                            tag:'a',
                            att:{
                                className:'fa-solid fa-ranking-star',
                                name: 'Score Summary',
                                title: 'View Score Summary',
                                href:'/rdeOffice/research/scoreSummary'
                            },
                            style:{
                                fontSize:'1vw',
                                backgroundColor:'transparent',
                                border:'none',
                                outline: 'none',
                                width: 'fit-content',
                                textDecoration: 'none',
                                height: 'fit-content',
                                color:'deepskyblue',
                                cursor:'pointer',
                                
                            },
                            text: ' Score Summary'
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
                                        
                                        console.log('Google Drive URL:', fileUrl);
                                        
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
                                                console.log('File ID found:', fileId);
                                                break;
                                            }
                                        }
                                        
                                        // If no fileId found in patterns, try to extract from URL path
                                        if (!fileId && fileUrl.includes('drive.google.com')) {
                                            const urlParts = fileUrl.split('/');
                                            for (let i = 0; i < urlParts.length; i++) {
                                                if (urlParts[i] === 'd' && urlParts[i + 1]) {
                                                    fileId = urlParts[i + 1];
                                                    console.log('File ID from path:', fileId);
                                                    break;
                                                }
                                            }
                                        }
                                        
                                        if (fileId) {
                                            // Clean the fileId (remove query parameters if any)
                                            fileId = fileId.split('?')[0].split('&')[0];
                                            embedUrl = `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
                                            
                                            console.log('Final Embed URL:', embedUrl);
                                            
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
                                                console.log('Google Drive iframe loaded successfully');
                                                // Remove loading indicator
                                                if (loadingIndicator.parentNode === el) {
                                                    el.removeChild(loadingIndicator);
                                                }
                                            };
                                            
                                            // Handle load error
                                            iframe.onerror = () => {
                                                console.log('Google Drive iframe failed to load');
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
                                                    console.log('Google Drive iframe loading timeout');
                                                    el.removeChild(loadingIndicator);
                                                    // Show alternative options
                                                    showAlternativeOptions(el, fileUrl, fileId);
                                                }
                                            }, 10000); // 10 second timeout
                                            
                                            el.appendChild(iframe);
                                            
                                        } else {
                                            // Invalid Google Drive URL format
                                            console.log('Invalid Google Drive URL format:', fileUrl);
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
                                                    console.error('Error saving research documents:', err)
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
                        console.error('Error loading endorsements:', error);
                        
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
                                        endorseId:val.endorsId
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
            const bot = ({label, Method, getEl}) => {
                return ($({
                    tag: 'div',
                    style: {
                        cursor: 'pointer',
                        width: 'fit-content',
                        paddingRight: '1vw',
                        paddingLeft: '1vw',
                        display: 'flex',
                        justifyContent: 'center'
                    },
                    elementHandler: getEl,
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: 'arial black,sans-serif',
                                fontSize: '1vw',
                                margin: 'auto',
                            },
                            text: label
                        })
                    ],
                    event: {
                        type: 'click',
                        method: Method
                    }
                }))
            }
            ButtonsTabs.push({
                button: bot({
                    label: "Entry List",
                    getEl: getBot.getResdoc,
                    Method: () => {
                        Bod.innerHTML = ''
                        Bod.appendChild(search({
                            tools: tools(),
                            searchEvent: searchInput
                        }))
                        Bod.appendChild($({
                            tag:'div',
                            style:{
                                display:'flex',
                                width:'100%',
                                height:'fit-content',
                                marginTop: '1vh',
                            },
                            child:[
                                Filter(),
                                Score(),
                                Report()
                            ]
                        }))
                        Bod.appendChild(ResearchPanel())
                        resBot.style.backgroundColor = 'rgba(0,0,0,0.1)'
                        resBot.style.color = 'deepskyblue'
                        enBot.style.color = '#999'
                        enBot.style.backgroundColor = 'transparent'
                    }
                }),
            })
            ButtonsTabs.push({
                button: bot({
                    label: "Endorsement", // here were the gdrive view will change
                    getEl: getBot.getEndorse,
                    Method: () => {
                        Bod.innerHTML = ''
                        Bod.appendChild(search({
                            searchEvent: (value) => {
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
                        enBot.style.backgroundColor = 'rgba(0,0,0,0.1)'
                        enBot.style.color = 'deepskyblue'
                        resBot.style.color = '#999'
                        resBot.style.backgroundColor = 'transparent'
                    }
                }),
            })
            const Tabs = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '5%',
                        backgroundColor: '#444',
                        display: 'flex',
                    },
                    elementHandler: (el) => {
                        ButtonsTabs.forEach(val => {
                            el.appendChild(val.button)
                        })
                    }
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    height: '95%',
                    width: '100%',
                },
                child: [
                    Tabs(),
                    $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '94%',
                        },
                        elementHandler: (el) => {
                            Bod = el
                            el.appendChild(search({
                                tools: tools(),
                                searchEvent: searchInput
                            }))
                            el.appendChild($({
                                tag:'div',
                                style:{
                                    display:'flex',
                                    width:'100%',
                                    height:'fit-content',
                                    marginTop: '1vh',
                                },
                                child:[
                                    Filter(),
                                    Score(),
                                    Report()
                                ]
                            }))
                            el.appendChild(ResearchPanel())
                            resBot.style.backgroundColor = 'rgba(0,0,0,0.1)'
                            resBot.style.color = 'deepskyblue'
                            enBot.style.color = '#999'
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
                backgroundColor: 'rgba(100,100,100,0.2)',
                margin: 'auto',
                marginRight: '0',
                position:'relative'
            },
            elementHandler:(el)=>{
                leftPdiv=el
            },
            child: [
                label,
                Content(),
            ]
        }))
    }
    const ScoreSummary=()=>{
        let Anchor,EventName
        // Add validation for Path()
        const safePath = (index) => {
            const path = Path(index);
            return path && path !== 'undefined' ? path : null;
        };
        
        const ChangeId=(id,name)=>{
            if (id) {
                Anchor.href='/rdeOffice/research/scoreSummary/'+id
            } else {
                // Handle the case where id is undefined
                console.error('Event ID is undefined');
                Anchor.href='/rdeOffice/research/scoreSummary';
            }
        }

        const Top=()=>{
            const FilterEvent=()=>{
                return($({
                    tag:'div',
                    style:{
                        margin:'auto',
                        marginRight:'1vw',
                        marginLeft:'auto',
                        width:'fit-content',
                        height:'fit-content',
                        position:'relative',
                        display:'flex'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                marginRight:'1vw',
                                fontSize:'1.5vw',
                                color:'deepskyblue',
                                cursor: 'pointer'
                            },
                            child:[
                                $({
                                    tag:'a',
                                    style:{
                                        textDecoration:'none',
                                        color:'deepskyblue',
                                    },
                                    att:{
                                        className:'fa-solid fa-rotate',
                                        href:'/rdeOffice/research/scoreSummary',
                                        title: 'Refresh'
                                    },
                                    elementHandler:(el)=>{
                                        Anchor=el
                                    }
                                })
                            ]

                        }),
                        $({
                            tag:'select',
                            style:{
                                width:'20vw',
                                height:'3vh',
                                fontSize:'1vw',
                                backgroundColor:'transparent',
                                border:'none',
                                color:'#bbb',
                                outLine: 'none',
                                borderBottom: 'solid thin #999',
                            },
                            event:{
                                type:'change',
                                method:(ev)=>{
                                    ChangeId(ev.target.childNodes[ev.target.selectedIndex].id,ev.target.value)
                                }
                            },
                            child:[
                                $({
                                    tag:'option',
                                    att:{
                                        selected:true,
                                        disabled:true,
                                    },
                                    text:'Select Event' //this is my problem here
                                })
                            ],
                            elementHandler:(el)=>{
                                const req= new Request('/eventRequest')
                                req.Post([
                                    {
                                        name:'getEventAdmin',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    data.forEach(val=>{
                                        el.appendChild($({
                                            tag:'option',
                                            att: {
                                                id:val.id
                                            },
                                            text:val.name,
                                            style:{
                                                backgroundColor: '#222',
                                                color:'deepskyblue',
                                                fontSize:'1vw',
                                            }
                                        }))
                                    })
                                })
                            }
                        })
                    ]
                }))
            }
            return($({
                tag: 'div',
                style: {
                    width: '100%',
                    height:'fit-content',
                    paddingTop:'.5rem',
                    paddingBottom:'.3rem',
                    backgroundColor:'rgba(100,100,100,0.34)',
                    display:'flex'
                },
                child:[
                    $({
                        tag:'a',
                        style:{
                            width:'fit-content',
                            height:'fit-content',
                            marginRight:'2vw',
                            marginLeft:'1vw',
                            border:'solid thin #bbb',
                            paddingLeft:'.5vw',
                            paddingRight:'.5vw',
                            borderRadius:'.5rem',
                            backgroundColor: '#222',
                            cursor: 'pointer'
                        },
                        child:[
                            $({
                                tag:'div',
                                text:'Back',
                                style:{
                                    fontSize:'1vw',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color: '#bbb'
                                }
                            }),
                            $({
                                tag:'div',
                                att:{
                                    className:'fa-solid fa-left-long'
                                },
                                style:{
                                    margin:'auto',
                                    textAlign:'center',
                                    width:'100%',
                                    fontSize:'1.2vw',
                                    color: 'deepskyblue'
                                }
                            })
                        ],
                        att:{
                            href:'/rdeOffice/research/research'
                        }
                    }),
                    $({
                        tag:'div',
                        text:'Score Summary and Ranking',// here the summary and ranking page
                        style:{
                            margin:'auto',
                            marginLeft:'1vw',
                            color:'#bbb',
                            width:'fit-content',
                            height:'fit-content',
                            fontSize:'1.2vw',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontWeight:'bolder'
                        }
                    }),
                    FilterEvent()
                ]
            }))
        }

        const BodySum=()=>{
            const LabelEvent=(text,url)=>{
                return($({
                    tag:'div',
                    style: {
                        width:'fit-content',
                        height: 'fit-content',
                        fontSize:'1.5vw',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        margin:'2vh auto'
                    },
                    child:[
                        $({
                            tag:'a',
                            att: {
                                href: `/rdeOffice/research/scoreSummary/${Path(4)}/category/${url}`
                            },
                            text:text,
                            style:{
                                textDecoration:'none',
                                color: 'deepskyblue',
                                padding: '10px 20px',
                                border: 'solid 1px deepskyblue',
                                borderRadius: '5px',
                                display: 'inline-block',
                                transition: 'all 0.3s'
                            }
                        })
                    ]
                }))
            }
            
            const SummaryPanel=(text)=>{
                let Report,ReportData
                
                const getReport=({scoreRank,rankAve,RankPerCrit})=>{
                    Report.addEventListener('click',()=>{
                        mainFrame.appendChild(Summary({
                            scoreRank:scoreRank,
                            rankAve:rankAve,
                            RankPerCrit:RankPerCrit,
                        }))
                    })
                }

                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                    },
                    child:[
                        $({
                            tag:'div',
                            style: {
                                width:'100%',
                                height:'fit-content',
                                backgroundColor:'#2c3e50',
                                fontFamily:'Helvetica',
                                display:'flex',
                                padding: '10px',
                                alignItems: 'center'
                            },
                            elementHandler:(el)=>{
                                // Get event and category/center info
                                const req= new Request('/score_rank')
                                req.Post([
                                    {
                                        name:'getCatIdName',
                                        value:text
                                    },
                                    {
                                        name: 'eventId',
                                        value: Path(4) || '0'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    // Create back button
                                    const backBtn = $({
                                        tag:'a',
                                        att:{
                                            href:Current().replace(Base(),'').split('/').slice(0,5).join('/'),
                                            className:'fa-solid fa-arrow-left',
                                            title: 'Back'
                                        },
                                        style:{
                                            color:'deepskyblue',
                                            textDecoration:'none',
                                            marginRight:'20px',
                                            fontSize: '1.2vw',
                                            padding: '5px 10px',
                                            border: 'solid 1px deepskyblue',
                                            borderRadius: '3px'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:' Back',
                                                style:{
                                                    fontFamily:'Helvetica',
                                                    fontWeight:'normal',
                                                    fontSize: '1vw'
                                                }
                                            })
                                        ]
                                    });
                                    
                                    // Get event name
                                    const getEventNameReq = new Request('/score_rank');
                                    getEventNameReq.Post([
                                        {
                                            name: 'getEventName',
                                            value: '1'
                                        },
                                        {
                                            name: 'eventId',
                                            value: Path(4)
                                        }
                                    ]);
                                    getEventNameReq.Json();
                                    getEventNameReq.Send().then(eventData => {
                                        const eventName = eventData.length > 0 ? eventData[0].name : 'Unknown Event';
                                        
                                        // Create header
                                        const headerText = $({
                                            tag:'div',
                                            style:{
                                                fontSize: '1.2vw',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                marginLeft: '20px'
                                            },
                                            child:[
                                                $({
                                                    tag:'span',
                                                    text: eventName + ' - ',
                                                    style: {
                                                        color: '#bbb'
                                                    }
                                                }),
                                                $({
                                                    tag:'span',
                                                    text: data.length > 0 ? `"${data[0]['name']}"` : 'Unknown Category/Center',
                                                    style: {
                                                        color: 'deepskyblue'
                                                    }
                                                })
                                            ]
                                        });
                                        
                                        el.appendChild(backBtn);
                                        el.appendChild(headerText);
                                    });
                                });
                            }
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'87%',
                                overflowY:'auto',
                                backgroundColor:'#767575'
                            },
                            elementHandler:(el)=>{
                                const request = new Request('/ranking')
                                request.Post([
                                    {
                                        name: 'getEval',
                                        value: '1'
                                    },
                                    {
                                        name: 'eventId',
                                        value: Path(4) ? parseInt(Path(4)) : 0
                                    },
                                    {
                                        name: 'categoryId',
                                        value: Path(6) ? Path(6) : '0'
                                    }
                                ])
                                request.Json()
                                request.Send().then((data)=>{
                                    console.log('Received evaluator data for category/center:', data);
                                    
                                    let Titles = []
                                    let docSet = []
                                    let allDocs = [] // Collect all documents for this category/center
                                    
                                    // First, display each evaluator's scores
                                    data.forEach(val => {
                                        if (val.docs && val.docs.length > 0) {
                                            console.log(`Evaluator ${val.evaluator?.fullname} has ${val.docs.length} documents`);
                                            
                                            // Sort documents by TotalScore descending
                                            const Order = val.docs.sort((a,b) => {
                                                const scoreA = parseFloat(a.TotalScore) || 0;
                                                const scoreB = parseFloat(b.TotalScore) || 0;
                                                return scoreB - scoreA; // Descending
                                            })

                                            // Rank per evaluator within this category/center
                                            let SortCrit = RankPerCriteria(Order, val.evaluator.fullname)
                                            Titles.push(SortCrit)
                                            
                                            // Collect unique documents for this category/center
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
                                                        })
                                                    }
                                                    
                                                    // Add to docSet for this evaluator
                                                    docSet.push({
                                                        docId: doc.file.id,
                                                        title: doc.file.title,
                                                        author: doc.file.author,
                                                        campus: doc.file.campus,
                                                        totalScore: doc.TotalScore,
                                                        evaluatorName: val.evaluator.fullname
                                                    })
                                                }
                                            })
                                            
                                            // Display this evaluator's scores
                                            el.appendChild(RankDocs({
                                                evalName: val.evaluator.fullname,
                                                docList: Order
                                            }))
                                        }
                                    })

                                    // Calculate ranking ONLY within this category/center
                                    if (allDocs.length > 0) {
                                        console.log(`Total unique documents in this category/center: ${allDocs.length}`);
                                        
                                        // Calculate average scores per document across all evaluators
                                        const docAverages = allDocs.map(doc => {
                                            // Get all scores for this document from all evaluators
                                            const docScores = docSet.filter(d => d.docId === doc.docId);
                                            const totalScore = docScores.reduce((sum, d) => sum + (parseFloat(d.totalScore) || 0), 0);
                                            const averageScore = docScores.length > 0 ? totalScore / docScores.length : 0;
                                            
                                            return {
                                                ...doc,
                                                averageScore: averageScore,
                                                totalEvaluators: docScores.length
                                            }
                                        })
                                        
                                        // Calculate ranking based on average score (descending)
                                        const rankedByScore = docAverages
                                            .sort((a, b) => b.averageScore - a.averageScore)
                                            .map((doc, index) => ({
                                                ...doc,
                                                scoreRank: index + 1
                                            }))
                                        
                                        // Prepare data for summary display
                                        const FinalRank = rankedByScore.map(doc => ({
                                            title: doc,
                                            averageScore: doc.averageScore,
                                            rankAverage: doc.scoreRank
                                        }))
                                        
                                        const RankAve = FinalRanking(FinalRank);
                                        const ScoreRank = ScoreRankAVe(FinalRank);
                                        
                                        getReport({
                                            scoreRank: ScoreRank,
                                            rankAve: RankAve,
                                            RankPerCrit: Titles
                                        })
                                    } else {
                                        // No documents found for this category/center
                                        el.appendChild($({
                                            tag: 'div',
                                            style: {
                                                padding: '20px',
                                                backgroundColor: '#fff3cd',
                                                color: '#856404',
                                                borderRadius: '5px',
                                                margin: '20px',
                                                textAlign: 'center'
                                            },
                                            text: 'No documents found for this category/center. Please select a different category/center or check if documents have been scored.'
                                        }))
                                        
                                        // Still create empty report
                                        getReport({
                                            scoreRank: [],
                                            rankAve: [],
                                            RankPerCrit: []
                                        })
                                    }
                                }).catch(error => {
                                    console.error('Error fetching ranking data:', error);
                                    el.appendChild($({
                                        tag: 'div',
                                        style: {
                                            padding: '20px',
                                            backgroundColor: '#ffe6e6',
                                            color: '#cc0000',
                                            borderRadius: '5px',
                                            margin: '20px'
                                        },
                                        text: `Error loading ranking data: ${error.message}`
                                    }));
                                    
                                    getReport({
                                        scoreRank: [],
                                        rankAve: [],
                                        RankPerCrit: []
                                    })
                                })
                            },
                        }),
                        $({
                            tag:'div',
                            style:{
                                height:'7vh',
                                width:'100%',
                                backgroundColor:'#2c3e50',
                                display:'flex',
                                justifyContent:'center'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'fit-content',
                                        height:'fit-content',
                                        margin:'auto'
                                    },
                                    child:[
                                        $({
                                            tag:'button',
                                            style:{
                                                width:'fit-content',
                                                height:'fit-content',
                                                fontSize:'1.2vw',
                                                borderRadius:'.5rem',
                                                border:'none',
                                                cursor:'pointer',
                                                color:'white',
                                                backgroundColor:'#3498db',
                                                padding: '10px 20px',
                                                fontWeight: 'bold'
                                            },
                                            text:'Generate Summary Report',
                                            elementHandler:(el)=>{
                                                Report=el
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }))
            }

            return($({
                tag:'div',
                style:{
                    width:'100%',
                    height:'92%',
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            height:'fit-content',
                            width:'100%',
                            padding:'1.5vh',
                            fontSize:'1.5vw',
                            color:'white',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            backgroundColor:'#2c3e50',
                            textAlign: 'center',
                            borderBottom: 'solid 2px deepskyblue'
                        },
                        elementHandler:(el)=>{
                            const req  = new Request('/score_rank')
                            req.Post([
                                {
                                    name:'scoreRank',
                                    value:'1'
                                },
                                {
                                    name:'getEventId',
                                    value:Path(4)+''
                                }
                            ])
                            req.Json()
                            req.Send().then(data=>{
                                if (data && data.event) {
                                    // Show event name from the new response format
                                    el.innerText = data.event.name;
                                    el.style.fontWeight = 'bold';
                                } else {
                                    el.innerText = 'Event Not Found';
                                }
                            }).catch(err => {
                                console.error('Error loading event:', err);
                                el.innerText = 'Error Loading Event';
                                el.style.color = '#e74c3c';
                            });
                        },
                    }),
                    $({
                        tag:'div',
                        style:{
                            height:'80vh',
                            width:'83vw',
                            margin:'auto',
                            backgroundColor: '#d6d7d8',
                            padding: '20px'
                        },
                        child:[
                            Router({
                                indexPath:5,
                                components:[
                                    Route('index', $({
                                        tag:'div',
                                        style: {
                                            width: '100%',
                                            height:'100%',
                                            margin:'auto',
                                        },
                                        elementHandler:(el)=>{
                                            // Create container for categories/centers
                                            const container = $({
                                                tag:'div',
                                                style: {
                                                    width: '90%',
                                                    margin: 'auto',
                                                    padding: '20px'
                                                }
                                            });
                                            
                                            // Create header
                                            const header = $({
                                                tag:'div',
                                                style: {
                                                    textAlign: 'center',
                                                    marginBottom: '30px',
                                                    color: '#2c3e50'
                                                },
                                                child: [
                                                    $({
                                                        tag:'h2',
                                                        style: {
                                                            fontSize: '1.8vw',
                                                            marginBottom: '10px'
                                                        },
                                                        text: 'Select Category/Center'
                                                    }),
                                                    $({
                                                        tag:'p',
                                                        style: {
                                                            fontSize: '1vw',
                                                            color: '#7f8c8d'
                                                        },
                                                        text: 'Click on a category or center to view scores and rankings'
                                                    })
                                                ]
                                            });
                                            
                                            container.appendChild(header);
                                            
                                            const req  = new Request('/score_rank')
                                            req.Post([
                                                {
                                                    name:'scoreRank',
                                                    value:'1'
                                                },
                                                {
                                                    name:'getEventId',
                                                    value:Path(4)+''
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                if (data && data.items && data.items.length > 0) {
                                                    const itemsContainer = $({
                                                        tag:'div',
                                                        style: {
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            justifyContent: 'center',
                                                            gap: '20px'
                                                        }
                                                    });
                                                    
                                                    data.items.forEach(val=>{
                                                        itemsContainer.appendChild(LabelEvent(val.name, val.id));
                                                    });
                                                    
                                                    container.appendChild(itemsContainer);
                                                } else {
                                                    // Show message if no categories/centers found
                                                    container.appendChild($({
                                                        tag: 'div',
                                                        style: {
                                                            textAlign: 'center',
                                                            color: '#7f8c8d',
                                                            fontSize: '1.2vw',
                                                            padding: '40px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '5px',
                                                            border: 'dashed 2px #bdc3c7'
                                                        },
                                                        child: [
                                                            $({
                                                                tag:'div',
                                                                att: {
                                                                    className: 'fa-solid fa-folder-open'
                                                                },
                                                                style: {
                                                                    fontSize: '3vw',
                                                                    color: '#bdc3c7',
                                                                    marginBottom: '20px'
                                                                }
                                                            }),
                                                            $({
                                                                tag:'h3',
                                                                text: 'No Data Available',
                                                                style: {
                                                                    marginBottom: '10px'
                                                                }
                                                            }),
                                                            $({
                                                                tag:'p',
                                                                text: data && data.isNewSystem ? 
                                                                    'No centers found for this event.' : 
                                                                    'No categories found for this event.'
                                                            })
                                                        ]
                                                    }));
                                                }
                                                el.appendChild(container);
                                            }).catch(err => {
                                                console.error('Error loading categories:', err);
                                                container.appendChild($({
                                                    tag: 'div',
                                                    style: {
                                                        textAlign: 'center',
                                                        color: '#e74c3c',
                                                        fontSize: '1.2vw',
                                                        padding: '40px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '5px',
                                                        border: 'solid 2px #e74c3c'
                                                    },
                                                    text: 'Error loading data. Please try again.'
                                                }));
                                                el.appendChild(container);
                                            });
                                        }
                                    })),
                                    Route('category',SummaryPanel(Path(6))),
                                ]
                            })
                        ]
                    }),
                ],
            }))
        }

        return($({
            tag:'div',
            style:{
                width:'100%',
                height:'100%',
                backgroundColor: '#333',
                position:'absolute',
                left: '0',
                top: '0',
                display: (Path(3)==='scoreSummary')? 'block' : 'none'
            },
            elementHandler:(el)=> {
                setTimeout(()=>{
                    const path=Path(3);
                    if(path===undefined){
                        el.remove()
                    }
                },50)
            },
            child: [
                Top(),
                BodySum()
            ]
        }))
    }
    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative'
        },
        elementHandler: getMainFrame,
        child: [
            Incoming(),
            Forwarded(),
            ScoreSummary()
        ]
    }))
}
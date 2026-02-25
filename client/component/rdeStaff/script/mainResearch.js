import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting } from "../../../lib/lib.js";

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
    const Incoming = () => { //left side panel were the submitted documents
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
                let category, titleEntry
                research.forEach(val=>{
                    category=val.category
                    titleEntry=val.title
                })
                const viewDocs = () => {
                    let frm, viewerPanel
                    const getViewer = (el) => {
                        viewerPanel = el
                    }
                    // Parse the file data - it could be JSON string or direct URL
                    let fileData = file;
                    let driveViewUrl = '';
                    
                    // Handle different formats
                    if (typeof fileData === 'object' && fileData !== null) {
                        // Object format - check for various possible fields
                        if (fileData.drive_view_url) {
                            driveViewUrl = fileData.drive_view_url;
                        } else if (fileData.viewUrl) {
                            driveViewUrl = fileData.viewUrl;
                        } else if (fileData.fileUrl) {
                            driveViewUrl = fileData.fileUrl;
                        } else if (fileData.file) {
                            driveViewUrl = fileData.file;
                        } else if (fileData.legacyFile) {
                            driveViewUrl = fileData.legacyFile;
                        }
                        
                        // Also store the full object for reference
                        fileData = fileData;
                    } else if (typeof fileData === 'string') {
                        // String format - could be JSON or direct URL
                        try {
                            if (fileData.includes('{') && fileData.includes('}')) {
                                // Try to parse as JSON
                                const parsed = JSON.parse(fileData);
                                if (parsed.drive_view_url) {
                                    driveViewUrl = parsed.drive_view_url;
                                } else if (parsed.viewUrl) {
                                    driveViewUrl = parsed.viewUrl;
                                } else if (parsed.fileUrl) {
                                    driveViewUrl = parsed.fileUrl;
                                } else if (parsed.file) {
                                    driveViewUrl = parsed.file;
                                } else {
                                    driveViewUrl = fileData; // Use as-is if can't extract
                                }
                                fileData = parsed; // Store parsed object
                            } else {
                                // Direct URL
                                driveViewUrl = fileData;
                            }
                        } catch (e) {
                            //console.log("Could not parse as JSON, using as direct URL:", e);
                            driveViewUrl = fileData;
                        }
                    }
                    
                    // Clean up the URL (remove escaped slashes)
                    if (typeof driveViewUrl === 'string') {
                        driveViewUrl = driveViewUrl.replace(/\\\//g, '/').replace('https:/drive.google.com', 'https://drive.google.com');
                    }
                    //console.log('Final driveViewUrl:', driveViewUrl);

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
                    const frameView = $({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '100%',
                        },
                        elementHandler: async (el) => {
                            frm = el;
                            
                            let fileId = null;
                            
                            if (driveViewUrl && driveViewUrl.includes('drive.google.com')) {
                                // Try different patterns to extract file ID
                                const patterns = [
                                    /\/d\/([a-zA-Z0-9_-]+)/,                     // /d/FILE_ID/
                                    /\/file\/d\/([a-zA-Z0-9_-]+)/,               // /file/d/FILE_ID/
                                    /id=([a-zA-Z0-9_-]+)/,                       // id=FILE_ID
                                    /open\?id=([a-zA-Z0-9_-]+)/,                 // open?id=FILE_ID
                                    /([a-zA-Z0-9_-]{25,})/                       // Any long ID
                                ];
                                
                                for (let pattern of patterns) {
                                    const match = driveViewUrl.match(pattern);
                                    if (match && match[1]) {
                                        fileId = match[1];
                                        //console.log('File ID found:', fileId);
                                        break;
                                    }
                                }
                                
                                // If still no file ID, check if it's already a preview URL
                                if (!fileId && driveViewUrl.includes('/preview')) {
                                    // Extract from preview URL
                                    const previewMatch = driveViewUrl.match(/\/([a-zA-Z0-9_-]+)\/preview/);
                                    if (previewMatch) {
                                        fileId = previewMatch[1];
                                    }
                                }
                            }
                            
                            if (fileId) {
                                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                //console.log("Loading:", embedUrl);
                                
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
                        const researchBot = ({id, dataURLResearch, title, category, author, presenter,coAuthor, center, programFile, programDriveViewUrl}) => {
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
                            
                            const openDriveFile = (fileData, fileTitle) => {
                                    let embedUrl = '';
                                    
                                    // Check the type of fileData
                                    //console.log('openDriveFile received:', fileData, 'Type:', typeof fileData);
                                    
                                    // Handle different formats
                                    if (typeof fileData === 'string') {
                                        // String format
                                        embedUrl = fileData;
                                    } else if (typeof fileData === 'object' && fileData !== null) {
                                        // Object format - check for various possible fields
                                        if (fileData.drive_view_url) {
                                            embedUrl = fileData.drive_view_url;
                                        } else if (fileData.viewUrl) {
                                            embedUrl = fileData.viewUrl;
                                        } else if (fileData.fileUrl) {
                                            embedUrl = fileData.fileUrl;
                                        } else if (fileData.file) {
                                            embedUrl = fileData.file;
                                        } else if (fileData.legacyFile) {
                                            embedUrl = fileData.legacyFile;
                                        }
                                    }
                                    
                                    // If we have a URL, check if it's Google Drive and format it properly
                                    if (embedUrl) {
                                        // If it's a Google Drive URL, ensure it's a preview URL
                                        if (embedUrl.includes && embedUrl.includes('drive.google.com')) {
                                            // If it's already a preview URL, use it directly
                                            if (embedUrl.includes('/preview')) {
                                                // Already a preview URL
                                            } 
                                            // If it's a file URL, convert to preview
                                            else if (embedUrl.includes('/d/')) {
                                                const fileIdMatch = embedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                                if (fileIdMatch && fileIdMatch[1]) {
                                                    embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                                                }
                                            }
                                            // If it's just a file ID (like "1YckxqYaHiBZmqs3s1jTZ20JLhtGIrU4-")
                                            else if (embedUrl.match(/^[a-zA-Z0-9_-]{25,}$/)) {
                                                embedUrl = `https://drive.google.com/file/d/${embedUrl}/preview`;
                                            }
                                        }
                                        
                                        if (embedUrl) {
                                            mainFrame.appendChild(object({dataURL: embedUrl, title: fileTitle}));
                                        } else {
                                            alert('No valid file URL available');
                                        }
                                    } else {
                                        alert('No file data available to open');
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
                                    labelDetails("Presenter :", presenter),
                                    labelDetails("Center : ", center),
                                    labelDetails("Category : ", category),

                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'row', // Align horizontally
                                            gap: '1vw', // Space between buttons
                                            marginTop: '1vh',
                                            marginBottom: '1vh',
                                            marginLeft: '1.2vw',
                                            marginRight: '.5vw'
                                        },
                                        child: [
                                            // Research Entry Button
                                            $({
                                                tag: 'div',
                                                att: {
                                                    className: 'botRes',
                                                    innerHTML: '<span class="fa fa-file-pdf-o" style="margin-right: 0.2vw;"></span> Docs entry'
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
                                                    backgroundColor: 'rgba(0, 191, 255, 0.1)',
                                                    alignItems: 'right'
                                                },
                                                event: { //here open the research entry file in a new viewer
                                                    type: 'click',
                                                    method: () => {
                                                        //console.log('Open entry clicked, dataURLResearch:', dataURLResearch);
                                                        openDriveFile(dataURLResearch, title);
                                                    }
                                                },
                                            }),
                                            
                                            // Open Program Button (conditionally shown)
                                            ...(programDriveViewUrl ? [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        className: 'botRes',
                                                        innerHTML: '<span class="fa fa-file-pdf-o" style="margin-right: 0.2vw;"></span> Open program'
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
                                                    event: { // here open the program file in a new viewer
                                                        type: 'click',
                                                        method: () => {
                                                            //console.log('Open program clicked, programDriveViewUrl:', programDriveViewUrl);
                                                            openDriveFile(programDriveViewUrl, `Program: ${title}`);
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
                                                                    form.append('fileUrl', driveViewUrl || file)
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
                                    presenter: val.presenter,
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
                            details("Title: ", titleEntry),
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
                                        borderBottom: '1px solid #444',
                                        cursor: 'pointer',
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: '5px',
                                        marginBottom: '2px',
                                        transition: 'all 0.3s'
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
                                marginBottom: '5px',
                                backgroundColor: '#222',
                                borderRadius: '3px'
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
                                marginTop: '4vh',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '1.1vw',
                                color: 'deepskyblue',
                                cursor: 'pointer',
                                fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif"
                            },
                            text: 'Print Summary',
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
                                        console.log('Print summary data:', data)
                                        
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
                                                    ${PrintSummary(data).innerHTML}
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
                                        console.error('Error loading summary data:', error);
                                        alert('Error loading summary data. Please try again.');
                                    })
                                }
                            }
                        }))
                    }
                    const researchEntry = (eventDetails) => {
                        // Create modal container
                        const createModal = () => {
                            console.log('Creating modal...');
                            
                            const modalOverlay = $({
                                tag: 'div',
                                att: { className: 'modal-overlay' }
                            });

                            const modalContent = $({
                                tag: 'div',
                                att: { className: 'modal-content' }
                            });

                            const modalHeader = $({
                                tag: 'h2',
                                text: 'Print Research Entry Summary'
                            });

                            // Form fields
                            const dateField = createFormField('dateToBeHeld', 'Date to be held:', 'text', 'March 2-3, 2026');
                            const venueField = createFormField('venue', 'Venue:', 'text', 'Roxas City Campus, Fuentes Drive, Roxas City, Capiz');
                            const pptDeadlineField = createFormField('pptDeadline', 'PPT Deadline:', 'text', 'March 01, 2026, 3:00 p.m.');
                            const driveLinkField = createFormField('driveLink', 'Drive link:', 'text', 'https://bit.ly/38thIHR_PPTs');

                            const buttonContainer = $({
                                tag: 'div',
                                att: { className: 'button-container' }
                            });

                            const cancelBtn = $({
                                tag: 'button',
                                att: { className: 'cancel-btn' },
                                text: 'Cancel',
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation();
                                        if (document.body.contains(modalOverlay)) {
                                            document.body.removeChild(modalOverlay);
                                        }
                                    }
                                }
                            });

                            const printBtn = $({
                                tag: 'button',
                                att: { className: 'print-btn' },
                                text: 'Print',
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation();
                                        
                                        const formData = {
                                            dateToBeHeld: document.getElementById('dateToBeHeld')?.value || 'March 2-3, 2026',
                                            venue: document.getElementById('venue')?.value || 'Roxas City Campus, Fuentes Drive, Roxas City, Capiz',
                                            pptDeadline: document.getElementById('pptDeadline')?.value || 'March 01, 2026, 3:00 p.m.',
                                            driveLink: document.getElementById('driveLink')?.value || 'https://bit.ly/38thIHR_PPTs'
                                        };
                                        
                                        if (document.body.contains(modalOverlay)) {
                                            document.body.removeChild(modalOverlay);
                                        }
                                        
                                        printResearchSummary(formData);
                                    }
                                }
                            });

                            buttonContainer.child = [cancelBtn, printBtn];
                            
                            modalContent.child = [
                                modalHeader,
                                dateField,
                                venueField,
                                pptDeadlineField,
                                driveLinkField,
                                buttonContainer
                            ];
                            
                            modalOverlay.child = [modalContent];
                            
                            // Close on overlay click
                            modalOverlay.event = {
                                type: 'click',
                                method: (e) => {
                                    if (e.target === modalOverlay) {
                                        document.body.removeChild(modalOverlay);
                                    }
                                }
                            };
                            
                            return modalOverlay;
                        }

                        const createFormField = (id, label, type, placeholder) => {
                            const container = $({
                                tag: 'div',
                                att: { className: 'form-field' }
                            });

                            const labelEl = $({
                                tag: 'label',
                                att: { for: id },
                                text: label
                            });

                            const input = $({
                                tag: 'input',
                                att: {
                                    type: type,
                                    id: id,
                                    placeholder: placeholder,
                                    value: placeholder
                                }
                            });

                            container.child = [labelEl, input];
                            return container;
                        }

                        const printResearchSummary = (formData) => {
                            const req = new Request('/entrycount');
                            req.Post([
                                {
                                    name: 'printEntry',
                                    value: '1'
                                },
                                {
                                    name: 'eventName',
                                    value: eventDetails.name
                                }
                            ]);
                            req.Json();
                            req.Send().then(data => {
                                console.log('Research entry data:', data);
                                
                                let WinPrint = window.open('', '_blank', 'width=1200,height=800,toolbar=0,scrollbars=1,status=0');
                                
                                WinPrint.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <title>Research Entries - ${eventDetails.name}</title>
                                        <link rel="stylesheet" href="/client/component/otherComponent/style/review.css">
                                        <style>
                                            @page {
                                                size: A4;
                                                margin: 0;
                                            }
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
                                console.error('Error loading research entries:', error);
                                alert('Error loading research entries. Please try again.');
                            })
                        }

                        return ($({
                            tag: 'div',
                            style: {
                                marginTop: '4vh',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '1.1vw',
                                color: 'deepskyblue',
                                cursor: 'pointer',
                                fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif"
                            },
                            text: 'Print Research Entry Summary',
                            event: {
                                type: 'click',
                                method: () => {
                                    const modal = createModal();
                                    document.body.appendChild(modal);
                                }
                            }
                        }))
                    }
                    const SelectEvent = () => {
                        let selVal
                        
                        return ($({
                            tag: 'div',
                            style: {
                                width: '70%',
                                marginTop: '1vh',
                                border: 'solid thin #999',
                                height: '4vh',
                                display: 'flex',
                                margin: 'auto',
                                padding: '.5vw',
                                borderRadius: '.5vw',
                                marginLeft: '2vw'
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
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        width: '90%',
                                        height: '100%',
                                        outline: 'none',
                                        color: 'deepskyblue',
                                        textAlign: 'center',
                                        cursor: 'pointer',
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
                                        className: 'fa-solid fa-rotate',
                                        title: 'Load Event Data'
                                    },
                                    style: {
                                        color: "deepskyblue",
                                        fontSize: '1.2vw',
                                        margin: 'auto',
                                        marginLeft: '3vw',
                                        backgroundColor: '#444',
                                        borderRadius: '.5vw',
                                        cursor: 'pointer',
                                        border: 'solid thin deepskyblue'
                                    },
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
                                                console.log('Center data received:', data)
                                                
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
                                                
                                                // Add ALL centers (including zeros) - NO FILTERING
                                                data.forEach(center => {
                                                    console.log(`Adding center: ${center.name}, total: ${center.total}`)
                                                    bodCon.appendChild(contain({
                                                        center: center.name,
                                                        total: center.total,
                                                        categories: center.categories || [],
                                                        eventType: eventType
                                                    }))
                                                })
                                                
                                                // Add print buttons
                                                bodCon.appendChild(printSummary(eventTypeName))
                                                bodCon.appendChild(researchEntry(eventTypeName))
                                            }).catch(error => {
                                                console.error('Error loading data:', error)
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
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    fontSize: '1vw',
                                    color: '#999',
                                    fontWeight: 'bold'
                                },
                                text: text
                            }))
                        }

                        return ($({
                            tag: 'div',
                            style: {
                                width: '95%',
                                margin: 'auto',
                                marginTop: '2vh',
                                border: 'solid thin #444',
                                backgroundColor: '#1e1e1e',
                                height: '70vh',
                                borderRadius: '10px',
                                overflow: 'hidden'
                            },
                            child: [
                                // Header
                                $({
                                    tag: 'div',
                                    style: {
                                        height: '40px',
                                        width: '100%',
                                        backgroundColor: '#333',
                                        display: 'flex',
                                        borderBottom: '2px solid #444'
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
                                        padding: '10px 0'
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
                            width: '80%',
                            height: '90%',
                            position: 'absolute',
                            left: '10%',
                            top: '5%',
                            backgroundColor: '#2a2a2a',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            zIndex: 1000
                        },
                        elementHandler: (el) => {
                            panBo = el
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    display: 'flex',
                                    borderRadius: '15px',
                                    overflow: 'hidden'
                                },
                                child: [
                                    // Close Button
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-circle-xmark'
                                        },
                                        style: {
                                            fontSize: '1.8vw',
                                            color: '#ff4444',
                                            position: 'absolute',
                                            right: '15px',
                                            top: '15px',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            transition: 'transform 0.3s',
                                            ':hover': {
                                                transform: 'scale(1.1)'
                                            }
                                        },
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                panBo.remove()
                                            }
                                        }
                                    }),
                                    // Main Content
                                    $({
                                        tag: 'div',
                                        style: {
                                            width: '100%',
                                            height: '100%',
                                            overflowY: 'auto',
                                            backgroundColor: '#222',
                                            padding: '20px'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    width: '100%',
                                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                    color: '#fff',
                                                    textAlign: 'center',
                                                    fontSize: '1.5vw',
                                                    fontWeight: 'bold',
                                                    marginBottom: '20px',
                                                    marginTop: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '10px'
                                                },
                                                child: [
                                                    // Icon as separate element
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-regular fa-chart-bar'
                                                        },
                                                        style: {
                                                            fontSize: '1.8vw',
                                                            color: 'deepskyblue'
                                                        }
                                                    }),
                                                    // Text as separate element
                                                    $({
                                                        tag: 'span',
                                                        text: 'Entries Summary By Center',
                                                        style: {
                                                            color: '#fff'
                                                        }
                                                    })
                                                ]
                                            }),
                                            SelectEvent(),
                                            bod()
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
                        margin: 'auto',
                        border: '1px solid #444',
                        padding: '8px 15px',
                        borderRadius: '15px',
                        backgroundColor: '#2a2a2a',
                        width: 'fit-content',
                        height: 'fit-content',
                        marginRight: '3vw',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        ':hover': {
                            backgroundColor: '#333',
                            transform: 'translateY(-2px)'
                        }
                    },
                    child: [
                        $({
                            tag: 'button',
                            att: {
                                className: 'fa-solid fa-chart-pie',
                                title: 'View Summary by Center'
                            },
                            style: {
                                fontSize: '1vw',
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: 'fit-content',
                                height: 'fit-content',
                                cursor: 'pointer',
                                color: 'deepskyblue',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Center Summary',
                                    style: {
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        fontSize: '0.9vw'
                                    }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
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
                        border: '1px solid #444',
                        padding: '8px 15px',
                        borderRadius: '15px',
                        backgroundColor: '#2a2a2a',
                        width: 'fit-content',
                        height: 'fit-content',
                        marginRight: '1vw',
                        marginLeft: '1vw',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        ':hover': {
                            backgroundColor: '#333',
                            transform: 'translateY(-2px)'
                        }
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
        
        function ChangeId(eventId, eventName) {
            // Get current URL path
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            
            // Find the position of 'scoreSummary' in the path
            const scoreSummaryIndex = pathParts.indexOf('scoreSummary');
            
            if (scoreSummaryIndex !== -1) {
                // Update event ID at position scoreSummaryIndex + 1
                pathParts[scoreSummaryIndex + 1] = eventId;
                
                // Remove any category/center ID that follows
                if (pathParts.length > scoreSummaryIndex + 2) {
                    pathParts.splice(scoreSummaryIndex + 2, pathParts.length - (scoreSummaryIndex + 2));
                }
                
                // Navigate to new URL
                window.location.href = pathParts.join('/');
            } else {
                // If not on scoreSummary page, navigate to it
                window.location.href = `/rdeOffice/research/scoreSummary/${eventId}`;
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
                                    const eventId = ev.target.value;
                                    const eventOption = ev.target.childNodes[ev.target.selectedIndex];
                                    
                                    if (eventId && eventId !== 'Select Event') {
                                        // Update the URL to include the event ID
                                        const currentPath = window.location.pathname;
                                        const pathParts = currentPath.split('/');
                                        
                                        // If we're already on a scoreSummary page with an event ID
                                        if (pathParts.includes('scoreSummary')) {
                                            // Update the event ID in the URL (position 4)
                                            pathParts[4] = eventId;
                                            
                                            // If there's a category/center after the event ID, remove it
                                            // to go back to the main categories/centers view
                                            if (pathParts.length > 5) {
                                                pathParts.splice(5, pathParts.length - 5);
                                            }
                                            
                                            const newUrl = pathParts.join('/');
                                            window.location.href = newUrl;
                                        } else {
                                            // If not on scoreSummary page, navigate to it
                                            window.location.href = `/rdeOffice/research/scoreSummary/${eventId}`;
                                        }
                                    }
                                }
                            },
                            child:[
                                $({
                                    tag:'option',
                                    att:{
                                        selected:true,
                                        disabled:true,
                                        value: ''
                                    },
                                    text:'Select Event'
                                })
                            ],
                            elementHandler:(el)=>{
                                const req = new Request('/eventRequest')
                                req.Post([
                                    {
                                        name:'getEventAdmin',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    data.forEach(val=>{
                                        const option = $({
                                            tag:'option',
                                            att: {
                                                value: val.id
                                            },
                                            text: val.name,
                                            style:{
                                                backgroundColor: '#222',
                                                color:'deepskyblue',
                                                fontSize:'1vw',
                                            }
                                        })
                                        
                                        // If this option matches the current event ID in the URL, select it
                                        const currentPath = window.location.pathname;
                                        const pathParts = currentPath.split('/');
                                        if (pathParts.includes('scoreSummary') && pathParts[4]) {
                                            const currentEventId = pathParts[4];
                                            if (currentEventId == val.id) {
                                                option.selected = true;
                                            }
                                        }
                                        
                                        el.appendChild(option);
                                    })
                                }).catch(err => {
                                    console.error('Error loading events:', err);
                                    el.appendChild($({
                                        tag:'option',
                                        att: {
                                            disabled: true
                                        },
                                        text: 'Error loading events'
                                    }));
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
                
                const getReport = ({ scoreRank, rankAve, RankPerCrit }) => {
                    Report.addEventListener('click', () => {
                        mainFrame.appendChild(Summary());
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
                                    //console.log('Received evaluator data for category/center:', data);
                                    
                                    let Titles = []
                                    let docSet = []
                                    let allDocs = [] // Collect all documents for this category/center
                                    
                                    // First, display each evaluator's scores
                                    data.forEach(val => {
                                        if (val.docs && val.docs.length > 0) {
                                            //console.log(`Evaluator ${val.evaluator?.fullname} has ${val.docs.length} documents`);
                                            
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
                                        //console.log(`Total unique documents in this category/center: ${allDocs.length}`);
                                        
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
                                width:'1256px',
                                backgroundColor:'#2c3e50',
                                display:'flex',
                                justifyContent:'center',
                                position: 'fixed',   
                                bottom: '0',          
                                left: '238px',   
                                zIndex: '10',       
                                padding: '10px 0'  
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
                            height:'10%',
                            width:'100%',
                            padding:'1.5vh',
                            fontSize:'1.5vw',
                            color:'white',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            backgroundColor:'#2c3e50',
                            textAlign: 'center',
                            borderBottom: 'solid 2px deepskyblue'
                        }
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
                                                //console.error('Error loading categories:', err);
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
            Forwarded(),
            ScoreSummary()
        ]
    }))
}
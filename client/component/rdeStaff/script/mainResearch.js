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
                    let driveViewUrl = file;
                    
                    // Try to parse as JSON first
                    try {
                        if (typeof file === 'string' && file.includes('{')) {
                            const parsed = JSON.parse(file);
                            if (parsed.drive_view_url) {
                                fileData = parsed;
                                driveViewUrl = parsed.drive_view_url;
                            }
                        }
                    } catch (e) {
                        console.log("Could not parse file as JSON, using as direct URL:", e);
                    }
                    
                    // If it's already an object with drive_view_url
                    if (typeof file === 'object' && file.drive_view_url) {
                        fileData = file;
                        driveViewUrl = file.drive_view_url;
                    }
                    
                    // Clean up the URL (remove double slashes from your example)
                    driveViewUrl = driveViewUrl.replace(/\/\//g, '/').replace('https:/drive.google.com', 'https://drive.google.com');

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
                        const researchBot = ({id, dataURLResearch, title, category, author, coAuthor}) => {
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

                                    labelDetails("Category : ", category),

                                    $({

                                        tag: 'div',

                                        text: 'Open document',

                                        att: {

                                            className: 'botRes'

                                        },

                                        style: {

                                            fontSize: '1vw',

                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                            marginLeft: '1.2vw',

                                            width: 'fit-content',

                                            marginBottom: '1vh',

                                            marginTop: '1vh',

                                            fontWeight: 'bold',

                                            color: 'deepskyblue',

                                            cursor: 'pointer',

                                            paddingLeft: '1vw',

                                            paddingRight: '1vw',

                                            userSelect: 'none'

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
                                                                    form.append('fileUrl', drive_view_url)
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
                                    coAuthor: val.coauthor
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
    const Forwarded = () => {
        let researchBody, endorseBody
        const ResearchDocs = ({category, file, docId, title, author, eventTYpe, deleteRequest, campus,endorseId}) => {
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

                                /*

                                 $({

                                     tag: 'div',

                                     style: {

                                         width: 'fit-content',

                                         paddingRight: '1vw',

                                         paddingLeft: '1vw',

                                         fontFamily: 'arial black,sans-serif',

                                         cursor: 'pointer'

                                     },

                                     att: {

                                         className: 'botMe',

                                     },

                                     event: {

                                         type: 'click',

                                         method: async () => {

                                             if (confirm("Are you sure you want to delete this document?")) {

                                                 const form = new FormData()

                                                 form.append("getDeleteRequest", "true")

                                                 form.append("docId", docId)

                                                 await fetch("/uploadResearchFile", {

                                                     method: 'POST',

                                                     body: form

                                                 }).then(res => res.json())

                                                     .then(data => {

                                                         if(data.message!==null){

                                                             mainFrame.appendChild(deletePanel())

                                                         }



                                                     })

                                             }



                                         }

                                     },

                                     elementHandler: getDel,

                                     text: 'Delete Documents'



                                 })

                                 */
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
                const isGoogleDriveUrl = file && file.includes('drive.google.com')
                
                let frame
                
                if (isGoogleDriveUrl) {
                    // Create a container for the viewer
                    frame = $({
                        tag: 'div',
                        style: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            marginTop: '1vh'
                        },
                        elementHandler: (el) => {
                            // Create the embed URL properly
                            const fileIdMatch = file.match(/\/d\/([a-zA-Z0-9_-]+)/)
                            
                            if (fileIdMatch && fileIdMatch[1]) {
                                const fileId = fileIdMatch[1]
                                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
                                
                                // Create iframe with proper attributes
                                const iframe = document.createElement('iframe')
                                iframe.src = embedUrl
                                iframe.style.width = '100%'
                                iframe.style.height = '100%'
                                iframe.style.border = 'none'
                                iframe.allow = 'autoplay'
                                iframe.title = 'Google Drive Document Viewer'
                                
                                // Add error handling
                                iframe.onload = () => {
                                    console.log('Google Drive iframe loaded')
                                }
                                
                                iframe.onerror = () => {
                                    // If iframe fails, show alternative options
                                    el.innerHTML = `
                                        <div style="
                                            color: white; 
                                            font-family: Arial, sans-serif; 
                                            padding: 20px;
                                            text-align: center;
                                            background: rgba(0,0,0,0.7);
                                            border-radius: 10px;
                                            margin: 20px;
                                        ">
                                            <h3>Document Access Required</h3>
                                            <p>This Google Drive document requires permission to view.</p>
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
                                                <button onclick="location.reload()" 
                                                        style="
                                                            padding: 10px 20px;
                                                            background: #555;
                                                            color: white;
                                                            border: none;
                                                            border-radius: 5px;
                                                            margin: 5px;
                                                            cursor: pointer;
                                                        ">
                                                    Try Again
                                                </button>
                                            </div>
                                            <p><small>You may need to request access or sign in with the appropriate account</small></p>
                                        </div>
                                    `
                                }
                                
                                el.appendChild(iframe)
                            } else {
                                // Invalid Google Drive URL format
                                el.innerHTML = `
                                    <div style="
                                        color: white; 
                                        text-align: center;
                                        padding: 20px;
                                    ">
                                        <p>Invalid Google Drive URL format</p>
                                        <a href="${file}" 
                                        target="_blank" 
                                        style="color: deepskyblue;">
                                            Open link directly
                                        </a>
                                    </div>
                                `
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

                                                border: 'solid thin rgba(200,200,200,0.5)'

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

                                                        backgroundColor: '#333',

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

                                                border: 'solid thin rgba(200,200,200,0.5)'

                                            },

                                            child: [

                                                $({

                                                    tag: 'option',

                                                    text: '-- Select Category --',

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

                                                    text: 'Social Science',

                                                    style: {

                                                        backgroundColor: '#333',

                                                        fontSize: '1.1vw'

                                                    }

                                                }),

                                                $({

                                                    tag: 'option',

                                                    text: 'Natural / Biological',

                                                    style: {

                                                        backgroundColor: '#333',

                                                        fontSize: '1.1vw'

                                                    }

                                                }),

                                                $({

                                                    tag: 'option',

                                                    text: 'Food',

                                                    style: {

                                                        backgroundColor: '#333',

                                                        fontSize: '1.1vw'

                                                    }

                                                }),

                                                $({

                                                    tag: 'option',

                                                    text: 'Development',

                                                    style: {

                                                        backgroundColor: '#333',

                                                        fontSize: '1.1vw'

                                                    }

                                                }),

                                                $({

                                                    tag: 'option',

                                                    text: 'Extension',

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
                                                title: 'Refresh'

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

                                                className: 'fa-solid fa-print'

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

                                            const printPage = document.getElementById('commentPDF')

                                            let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');

                                            WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')


                                            const nodes = print.childNodes

                                            for (let x = 0; x < nodes.length; x++) {

                                                const frag = document.createDocumentFragment()

                                                WinPrint.document.write(nodes[x].innerHTML);

                                            }


                                            WinPrint.document.close();

                                            WinPrint.focus();

                                            WinPrint.print();

                                            WinPrint.close();

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
                                                title: 'Refresh'

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
                        padding: '.2rem',
                        borderRadius:'.2rem',
                        backgroundColor: 'rgba(34,34,34)',
                        width: 'fit-content',
                        height: 'fit-content',
                        marginRight:'1vw'
                    },
                    child:[
                        $({
                            tag:'button',
                            att:{
                                className:'fa-solid fa-chart-bar',
                                title: 'View Summary'
                            },
                            style:{
                                fontSize:'1.4vw',
                                backgroundColor:'transparent',
                                border:'none',
                                outline: 'none',
                                width: 'fit-content',
                                height: 'fit-content',
                                cursor:'pointer',
                                color:'deepskyblue'
                            },
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
                let request
                return ($({
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

                                    style: {

                                        backgroundColor: 'transparent',

                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                        fontSize: '1vw',

                                        border: 'none',

                                        outline: 'none',

                                        color: '#bbb',

                                        width: '25vw',

                                        textAlign: 'center'

                                    },

                                    elementHandler: (el) => {


                                        el.appendChild($({

                                            tag: 'option',

                                            text: 'All Event',

                                            style: {

                                                backgroundColor: 'rgba(0,0,0,0.8)',

                                                color: '#bbb'

                                            },

                                            att: {

                                                id: '0'

                                            }

                                        }))

                                        const req = new Request('/eventRequest')

                                        req.Post([
                                            {
                                                name: 'getEventAdmin',
                                                value: '1'
                                            }
                                        ])
                                        req.Json()
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

                                                        id: val.id

                                                    }

                                                }))

                                            })

                                        })

                                    },

                                    event: {

                                        type: 'change',

                                        method: (eve) => {

                                            request = eve.target.childNodes[eve.target.selectedIndex].id

                                        }

                                    }

                                }),

                                $({

                                    tag: 'div',

                                    att: {

                                        className: 'fa-solid fa-arrows-rotate',
                                        title: 'Refresh Event Documents'

                                    },

                                    style: {

                                        margin: 'auto',

                                        marginLeft: '2vw',

                                        marginRight: '1vw',

                                        fontSize: '1.2vw',

                                        color: 'deepskyblue',

                                        cursor: 'pointer'

                                    },

                                    event: {

                                        type: 'click',

                                        method: () => {

                                            serch.value = ''

                                            const req = new Request('/eventRequest')

                                            req.Post([
                                                {
                                                    name: 'requestEventRDE',
                                                    value: '0'
                                                },
                                                {
                                                    name: 'eventId',
                                                    value: request
                                                }
                                            ])
                                            req.Json()

                                            req.Send().then(data => {

                                                researchBody.innerHTML = ''

                                                data.forEach(val => {

                                                    researchBody.appendChild(ResearchDocs({

                                                        category: val.category,

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

                                        }

                                    }

                                })

                            ]


                        })

                    ],


                }))

            }
            const Score=()=>{
                return($({
                    tag:'div',
                    style:{
                        margin: 'auto',
                        border:'solid thin rgba(153,153,153)',
                        padding: '.3rem',
                        borderRadius:'.2rem',
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
                                title: 'View Score Summary',
                                href:'/rdeOffice/research/scoreSummary'
                            },
                            style:{
                                fontSize:'1.4vw',
                                backgroundColor:'transparent',
                                border:'none',
                                outline: 'none',
                                width: 'fit-content',
                                height: 'fit-content',
                                color:'deepskyblue',
                                cursor:'pointer',
                            },

                        })
                    ]
                }))
            }

            const EndorsementPanel = () => {


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

                            // Check if it's a Google Drive URL
                            const isGoogleDriveUrl = src && (src.includes('drive.google.com') || (typeof src === 'object' && src.drive_view_url));
                            
                            let fileViewer;
                            
                            if (isGoogleDriveUrl) {
                                let embedUrl = src;
                                
                                // Handle both string URL and object format
                                if (typeof src === 'object' && src.drive_view_url) {
                                    embedUrl = src.drive_view_url;
                                } else if (typeof src === 'string' && src.includes('{')) {
                                    try {
                                        const parsed = JSON.parse(src);
                                        if (parsed.drive_view_url) {
                                            embedUrl = parsed.drive_view_url;
                                        }
                                    } catch (e) {
                                        console.log("JSON parse error:", e);
                                    }
                                }
                                
                                // Ensure it's an embed URL
                                if (embedUrl.includes('drive.google.com') && !embedUrl.includes('/preview')) {
                                    const fileIdMatch = embedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                                    if (fileIdMatch && fileIdMatch[1]) {
                                        embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                                    }
                                }
                                
                                // Clean URL
                                embedUrl = embedUrl.replace(/\/\//g, '/').replace('https:/drive.google.com', 'https://drive.google.com');
                                
                                fileViewer = $({
                                    tag: 'iframe',
                                    att: {
                                        src: embedUrl,
                                        type: 'application/pdf',
                                        sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                        allow: 'autoplay'
                                    },
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }
                                });
                            } else {
                                // Local file fallback (for old files)
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


                    elementHandler: async (el) => {
                        endorseBody = el

                        const form = new FormData()

                        form.append('endorsementList', 'true')

                        await fetch('/endorsement', {

                            method: 'POST',

                            body: form

                        }).then(res => res.json())

                            .then(data => {

                                data.forEach(val => {
                                    if(val.resStat*1===0){
                                        el.insertBefore(File({

                                            camp: val.campus,

                                            eventName: val.event,

                                            date: val.date.split(' ')[0],

                                            id: val.id,
                                            research: val.research,
                                            resStat:val.resStat

                                        }), el.childNodes[0])
                                    }else {
                                        el.appendChild(File({

                                            camp: val.campus,

                                            eventName: val.event,

                                            date: val.date.split(' ')[0],

                                            id: val.id,
                                            research: val.research,
                                            resStat:val.resStat

                                        }))
                                    }




                                })


                            })

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
                        fontSize:'2vw',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        margin:'3vh auto auto'
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
                                color: 'deepskyblue'
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
                                backgroundColor:'#555',
                                fontFamily:'Helvetica',
                                display:'flex'
                            },
                            elementHandler:(el)=>{
                                const req= new Request('/score_rank')
                                req.Post([
                                    {
                                        name:'getCatIdName',
                                        value:text
                                    },
                                    {
                                        name: 'eventId',
                                        value: Path(4) || '0' // Pass the event ID to determine new/old system
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{

                                    el.appendChild($({
                                        tag:'a',
                                        att:{
                                            href:Current().replace(Base(),'').split('/').slice(0,5).join('/'),
                                            className:'fa-solid fa-arrow-left',
                                            title: 'Refresh'
                                        },
                                        style:{
                                            color:'deepskyblue',
                                            textDecoration:'none',
                                            marginLeft:'1vw',
                                            fontSize: '1vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:'Back',
                                                style:{
                                                    fontFamily:'Helvetica',
                                                    fontWeight:'normal',
                                                    marginLeft:'.5vw',
                                                    fontSize: '1vw'
                                                }
                                            })
                                        ]
                                    }))
                                    el.appendChild($({
                                        tag:'div',
                                        text:`"${data.length>0 &&data[0]['name']}"`,
                                        style:{
                                            marginLeft:'4.5vw',
                                            fontSize: '1vw'
                                        }
                                    }))
                                })
                            }
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'87%',
                                overflowY:'auto',
                                backgroundColor:'#222'
                            },
                            elementHandler:(el)=>{

                                const request= new Request('/ranking')
                                request.Post([
                                    {
                                        name:'getEval',
                                        value:'1'
                                    },
                                    {
                                        name:'eventId',
                                        value:Path(4)+''
                                    },
                                    {
                                        name:'categoryId',
                                        value:Path(6)+''
                                    }
                                ])
                                request.Json()
                                request.Send().then((data)=>{
                                    let Titles=[]
                                    let docSet
                                    data.forEach(val => {
                                        console.log('Evaluator data:', val.evaluator?.fullname);
                                        console.log('Docs count:', val.docs?.length);
                                        const Order=val.docs.sort((a,b)=>{
                                            if ( a.TotalScore > b.TotalScore ){
                                                return -1;
                                            }
                                            if ( a.TotalScore < b.TotalScore ){
                                                return 1;
                                            }
                                            return 0;
                                        })

                                        let SortCrit=RankPerCriteria(Order,val.evaluator.fullname)
                                        Titles.push(SortCrit)
                                        docSet=Order.map(val => {
                                            return{
                                                title:val.file.title,
                                                docId:val.file.id,
                                                author:val.file.author,
                                                campus:val.file.campus
                                            }
                                        })
                                        el.appendChild(RankDocs({
                                            evalName:val.evaluator.fullname,
                                            docList:Order
                                        }))
                                    })

                                    const FinalRank=  SummaryDocs(Titles,docSet).sort((a,b)=>{
                                        if ( a.rankAverage > b.rankAverage ){
                                            return -1;
                                        }
                                        if ( a.rankAverage < b.rankAverage ){
                                            return 1;
                                        }
                                        return 0;
                                    })
                                    const RankAve=FinalRanking(FinalRank.reverse())
                                    const ScoreRank=ScoreRankAVe(FinalRank.sort((a,b)=>{
                                        if ( a.averageScore > b.averageScore ){
                                            return -1;
                                        }
                                        if ( a.averageScore < b.averageScore ){
                                            return 1;
                                        }
                                        return 0;
                                    }))
                                    getReport({
                                        scoreRank:ScoreRank,
                                        rankAve:RankAve,
                                        RankPerCrit:Titles
                                    })
                                })
                                /*
                                 const req= new Request('/score_rank')
                                   req.Post([
                                       {
                                           name:'eventId',
                                           value:Path(4)
                                       },
                                       {
                                           name:'categoryId',
                                           value:Path(6)
                                       },
                                       {
                                           name:'getDocPerRank',
                                           value:'1'
                                       }
                                   ])
                                  req.Json()
                                   req.Send().then(data=>{
                                       data.forEach(val=>{
                                         //  el.appendChild(TableScore(val.name,val.criteria))
                                       })
                                   })

                                 */


                            },

                        }),
                        $({
                            tag:'div',
                            style:{
                                height:'7vh',
                                width:'100%',
                                backgroundColor:'#555',
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
                                                fontSize:'1.5vw',
                                                borderRadius:'.5rem',
                                                border:'none',
                                                cursor:'pointer',
                                                color:'deepskyblue',
                                                backgroundColor:'#333'
                                            },
                                            text:'Generate Summary',
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
                            paddingTop:'2.5vh',
                            fontSize:'1.2vw',
                            textIndent:'7.5vw',
                            color:'#bbb',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            borderBottom: 'solid thin rgba(100,100,100,0.9)'
                        },
                        text:'No event selected ...',
                        elementHandler:(el)=>{

                            const req= new Request('/score_rank')
                            req.Post([
                                {
                                    name:'getEventName',
                                    value:Path(4)+""
                                }
                            ])
                            req.Json()
                            req.Send().then(data=>{

                                el.innerText=data[0]['name']
                            })
                        },


                    }),
                    $({
                        tag:'div',
                        style:{
                            height:'80vh',
                            width:'83vw',
                            margin:'auto',
                            borderLeft:  'solid thin rgba(100,100,100,0.9)',
                            borderRight: 'solid thin rgba(100,100,100,0.9)'
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
                                            display: 'flex',
                                        },
                                        elementHandler:(el)=>{
                                            const div=$({
                                                tag:'div',
                                                style: {
                                                    width: 'fit-content',
                                                    height:  'fit-content',
                                                    margin:'auto',
                                                }
                                            })
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
                                                data.forEach(val=>{
                                                    div.appendChild(LabelEvent(val.name,val.id))
                                                })
                                                el.appendChild(div)
                                            })
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


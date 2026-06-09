import { $, Base, ConfirmationAlert, Current, Path, Request, SearchMethod, TimeConvert, Waiting, CustomModal} from "../../../lib/lib.js";
import {Print} from "../../otherComponent/comment.js";
import {PrintSummary} from "../../otherComponent/ReviewTemplate.js";
import {Route, Router} from "../../../lib/Router.js";
import {RankDocs} from "./src/docsRank.js";
import {FinalRanking, RankPerCriteria, ScoreRankAVe} from "./src/rankAlgo.js";
import {Summary} from "./src/Summary.js";
import {PrintResearch} from "../../otherComponent/researchSummary.js";
import { Forwarded } from "./src/forwarded.js";

export const ResearchMain = () => {
    let mainFrame, leftPdiv
    const getMainFrame = (el) => {
        mainFrame = el
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
        let currentTab = 'faculty' // 'faculty', 'undergraduate', 'graduate'
        
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
                        color: currentTab === tab.id ? '#fff' : '#bbb',
                        border: `1px solid ${currentTab === tab.id ? 'deepskyblue' : '#555'}`,
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
                                        btn.style.color = '#bbb'
                                        btn.style.borderColor = '#555'
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
                height: '4vh',
                width: 'fit-content',
                marginLeft: '2vw',
                borderBottom: 'solid thin rgba(100,100,100,0.3)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '.2rem',
                borderRadius: '1vw',
                display: 'flex',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content',
                        height: 'fit-content',
                        margin: 'auto'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-magnifying-glass' },
                            style: { color: 'deepskyblue', fontSize: '1.5vw', marginRight: '0.5vw', cursor: 'pointer' }
                        }),
                        $({
                            tag: 'input',
                            att: { type: 'text', className: 'searchInput', placeholder: 'Search submissions...' },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                paddingLeft: '.5vw',
                                paddingRight: '.5vw',
                                color: '#bbb',
                                width: '200px',
                                height: '100%',
                                fontSize: '1.1vw',
                                transition: 'all 0.3s ease'
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
                                method2: (e) => { e.target.style.width = '250px' },
                                type3: 'blur',
                                method3: (e) => { e.target.style.width = '200px' }
                            }
                        })
                    ]
                }),
            ]
        })

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
                        style: { textAlign: 'center', padding: '40px', color: '#f44' },
                        text: 'Error loading data. Please refresh.'
                    }))
                })
        }

        const showSuccessAndReload = (message) => {
            document.body.appendChild(ConfirmationAlert(message, () => {
                window.location.reload()
            }))
        }

        // Faculty Research Document Component (keep original functionality)
        const docsFaculty = ({ date, eventType, file, research, docId, status, sender, smail, center, campus, locationType }) => {
            let category, titleEntry
            research.forEach(val => {
                category = val.category
                titleEntry = val.title
            })

            const viewDocs = () => {
                let frm, viewerPanel
                const getViewer = (el) => { viewerPanel = el }

                let fileData = file
                let driveViewUrl = ''

                // Parse file data (same as original)
                if (typeof fileData === 'object' && fileData !== null) {
                    if (fileData.drive_view_url) driveViewUrl = fileData.drive_view_url
                    else if (fileData.viewUrl) driveViewUrl = fileData.viewUrl
                    else if (fileData.fileUrl) driveViewUrl = fileData.fileUrl
                    else if (fileData.file) driveViewUrl = fileData.file
                    else if (fileData.legacyFile) driveViewUrl = fileData.legacyFile
                    fileData = fileData
                } else if (typeof fileData === 'string') {
                    try {
                        if (fileData.includes('{') && fileData.includes('}')) {
                            const parsed = JSON.parse(fileData)
                            if (parsed.drive_view_url) driveViewUrl = parsed.drive_view_url
                            else if (parsed.viewUrl) driveViewUrl = parsed.viewUrl
                            else if (parsed.fileUrl) driveViewUrl = parsed.fileUrl
                            else if (parsed.file) driveViewUrl = parsed.file
                            else driveViewUrl = fileData
                            fileData = parsed
                        } else {
                            driveViewUrl = fileData
                        }
                    } catch (e) {
                        driveViewUrl = fileData
                    }
                }

                if (typeof driveViewUrl === 'string') {
                    driveViewUrl = driveViewUrl.replace(/\\\//g, '/').replace('https:/drive.google.com', 'https://drive.google.com')
                }

                const object = ({ dataURL, title }) => {
                    let object
                    const getObject = (el) => { object = el }
                    return ($({
                        tag: 'div',
                        style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '99.5%', textAlign: 'center', backgroundColor: '#222', zIndex: 1000 },
                        elementHandler: getObject,
                        child: [
                            $({
                                tag: 'div',
                                style: { width: '100%', height: '5%', backgroundColor: '#444', justifyContent: 'center', color: '#bbb', display: 'flex' },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: { width: 'fit-content', height: 'fit-content', margin: 'auto', display: 'flex', cursor: 'pointer' },
                                        event: { type: 'click', method: () => object.remove() },
                                        child: [
                                            $({ tag: 'div', att: { className: 'fa-solid fa-caret-left' }, style: { fontSize: '2vw', margin: 'auto', color: 'deepskyblue' } }),
                                            $({ tag: 'div', style: { fontSize: '1.2vw', color: 'deepskyblue', fontFamily: 'arial black,sans-serif', margin: 'auto' }, text: 'Back' })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        style: { margin: 'auto', marginLeft: '2vw', width: '80%', textAlign: 'left', display: 'flex' },
                                        child: [
                                            $({ tag: 'div', style: { fontFamily: 'monospace', fontSize: '1vw', color: 'deepskyblue', fontWeight: 'bold', margin: 'auto' }, text: 'Title: ' }),
                                            $({ tag: 'div', text: `"${title}"`, style: { fontFamily: 'monospace', fontSize: '1vw', color: '#bbb', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', margin: 'auto' } })
                                        ]
                                    })
                                ]
                            }),
                            $({ tag: 'iframe', att: { src: dataURL, type: 'application/pdf', sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms', allow: 'autoplay' }, style: { width: '80%', height: '95%', margin: 'auto', border: 'none' } })
                        ]
                    }))
                }

                const frameView = $({
                    tag: 'div',
                    style: { width: '70%', height: '100%' },
                    elementHandler: async (el) => {
                        frm = el
                        let fileId = null

                        if (driveViewUrl && driveViewUrl.includes('drive.google.com')) {
                            const patterns = [
                                /\/d\/([a-zA-Z0-9_-]+)/,
                                /\/file\/d\/([a-zA-Z0-9_-]+)/,
                                /id=([a-zA-Z0-9_-]+)/,
                                /open\?id=([a-zA-Z0-9_-]+)/,
                                /([a-zA-Z0-9_-]{25,})/
                            ]
                            for (let pattern of patterns) {
                                const match = driveViewUrl.match(pattern)
                                if (match && match[1]) {
                                    fileId = match[1]
                                    break
                                }
                            }
                            if (!fileId && driveViewUrl.includes('/preview')) {
                                const previewMatch = driveViewUrl.match(/\/([a-zA-Z0-9_-]+)\/preview/)
                                if (previewMatch) fileId = previewMatch[1]
                            }
                        }

                        if (fileId) {
                            const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
                            el.appendChild($({
                                tag: 'iframe',
                                att: {
                                    src: embedUrl,
                                    type: 'application/pdf',
                                    sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                    allow: 'autoplay'
                                },
                                style: { width: '98%', height: '99%', border: 'none', backgroundColor: '#fff' }
                            }))
                        } else {
                            el.appendChild($({
                                tag: 'div',
                                style: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' },
                                child: [$({ tag: 'div', text: 'Could not extract Google Drive file ID', style: { fontSize: '1.5vw', color: '#f44' } })]
                            }))
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
                                style: { margin: 'auto', color: 'deepskyblue', display: 'flex', cursor: 'pointer' },
                                child: [
                                    $({ tag: 'div', att: { className: 'fa-solid fa-caret-left' }, style: { fontSize: '1.7vw', margin: 'auto' } }),
                                    $({ tag: 'div', text: 'Back', style: { fontFamily: 'Segoe UI', fontSize: '1.5vw', fontWeight: 'bold', margin: 'auto' } })
                                ],
                                event: { type: 'click', method: () => viewerPanel.remove() }
                            }),
                            $({
                                tag: 'div',
                                text: 'Endorsement Letter',
                                style: { width: 'fit-content', margin: 'auto', fontFamily: 'arial black,san-serif', fontSize: '1.4vw', color: '#bbb' }
                            })
                        ]
                    })

                    const researchBot = ({ id, dataURLResearch, title, category, author, presenter, coAuthor, center, programFile, programDriveViewUrl }) => {
                        const labelDetails = (label, data) => {
                            return ($({
                                tag: 'div',
                                att: { innerHTML: `<span style="font-family: 'Arial Black',sans-serif; color: lightblue">${label}</span> <span>${data}</span>` },
                                style: { fontSize: '1vw', fontFamily: 'monospace', color: '#ccc' }
                            }))
                        }

                        const CoAuthorList = () => {
                            return ($({
                                tag: 'div',
                                style: { width: '100%', height: 'fit-content' },
                                child: [
                                    $({ tag: 'div', text: "Co-Author :", style: { fontFamily: 'arial black,sans-serif', color: 'lightblue', fontSize: '1vw' } }),
                                    $({
                                        tag: 'ul', style: { marginTop: '0' },
                                        elementHandler: (el) => {
                                            try {
                                                JSON.parse(coAuthor).forEach(val => {
                                                    el.appendChild($({ tag: 'li', text: val, style: { color: '#bbb', fontSize: '1vw', fontWeight: 'bolder' } }))
                                                })
                                            } catch (e) { console.error('Error parsing coAuthor:', e) }
                                        }
                                    })
                                ]
                            }))
                        }

                        const openDriveFile = (fileData, fileTitle) => {
                            let embedUrl = ''
                            if (typeof fileData === 'string') embedUrl = fileData
                            else if (typeof fileData === 'object' && fileData !== null) {
                                if (fileData.drive_view_url) embedUrl = fileData.drive_view_url
                                else if (fileData.viewUrl) embedUrl = fileData.viewUrl
                                else if (fileData.fileUrl) embedUrl = fileData.fileUrl
                                else if (fileData.file) embedUrl = fileData.file
                                else if (fileData.legacyFile) embedUrl = fileData.legacyFile
                            }
                            if (embedUrl && embedUrl.includes && embedUrl.includes('drive.google.com')) {
                                if (!embedUrl.includes('/preview') && embedUrl.includes('/d/')) {
                                    const fileIdMatch = embedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
                                    if (fileIdMatch && fileIdMatch[1]) embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
                                } else if (embedUrl.match(/^[a-zA-Z0-9_-]{25,}$/)) {
                                    embedUrl = `https://drive.google.com/file/d/${embedUrl}/preview`
                                }
                            }
                            if (embedUrl) mainFrame.appendChild(object({ dataURL: embedUrl, title: fileTitle }))
                            else alert('No valid file URL available')
                        }

                        return ($({
                            tag: 'div',
                            style: {
                                width: '95%',
                                margin: '1vh auto',
                                padding: '.5rem',
                                backgroundColor: '#555',
                                borderRadius: '.5rem',
                                userSelect: 'text',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer'
                            },
                            att: { className: 'botRes..' },
                            child: [
                                labelDetails("Title : ", title),
                                labelDetails("Author : ", author),
                                CoAuthorList(),
                                labelDetails("Presenter :", presenter),
                                labelDetails("Center : ", center),
                                labelDetails("Category : ", category),
                                $({
                                    tag: 'div',
                                    style: { display: 'flex', gap: '1vw', marginTop: '1vh', marginBottom: '1vh', marginLeft: '1.2vw' },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: { className: 'botRes', innerHTML: '<span class="fa fa-file-pdf-o" style="margin-right: 0.2vw;"></span> Docs entry' },
                                            style: {
                                                fontSize: '1vw', fontFamily: 'Segoe UI', width: 'fit-content', fontWeight: 'bold',
                                                color: 'deepskyblue', cursor: 'pointer', padding: '0.5vh 1vw', userSelect: 'none',
                                                border: 'solid thin deepskyblue', borderRadius: '0.3vw', backgroundColor: 'rgba(0, 191, 255, 0.1)',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click', method: () => openDriveFile(dataURLResearch, title),
                                                type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' },
                                                type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }
                                            }
                                        }),
                                        ...(programDriveViewUrl ? [$({
                                            tag: 'div',
                                            att: { className: 'botRes', innerHTML: '<span class="fa fa-file-pdf-o" style="margin-right: 0.2vw;"></span> Program File' },
                                            style: {
                                                fontSize: '1vw', fontFamily: 'Segoe UI', width: 'fit-content', fontWeight: 'bold',
                                                color: '#FF9800', cursor: 'pointer', padding: '0.5vh 1vw', userSelect: 'none',
                                                border: 'solid thin #FF9800', borderRadius: '0.3vw', backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click', method: () => openDriveFile(programDriveViewUrl, `Program: ${title}`),
                                                type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' },
                                                type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)'; e.currentTarget.style.transform = 'translateY(0)' }
                                            }
                                        })] : [])
                                    ]
                                })
                            ]
                        }))
                    }

                    const Button = ({ Label, Event, isAccept = false }) => {
                        const colors = isAccept 
                            ? { bg: 'rgba(76, 175, 80, 0.2)', border: '#4CAF50', hover: 'rgba(76, 175, 80, 0.4)' }
                            : { bg: 'rgba(244, 67, 54, 0.2)', border: '#f44336', hover: 'rgba(244, 67, 54, 0.4)' }
                        
                        return ($({
                            tag: 'div',
                            style: {
                                height: '99%',
                                width: '49%',
                                display: 'flex',
                                justifyContent: 'center',
                                margin: 'auto',
                                backgroundColor: colors.bg,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            att: { className: 'botControllStaff' },
                            event: {
                                type: 'click', method: Event,
                                type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = colors.hover; e.currentTarget.style.transform = 'scale(1.02)' },
                                type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = colors.bg; e.currentTarget.style.transform = 'scale(1)' }
                            },
                            child: [$({ tag: 'div', text: Label, style: { margin: 'auto', fontFamily: 'arial black,sans-serif', color: colors.border, fontSize: '1.1vw' } })]
                        }))
                    }

                    const Controller = () => {
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
                                                    style: { color: '#ddd', fontSize: '14px', fontWeight: '500' }
                                                }),
                                                $({
                                                    tag: 'textarea',
                                                    att: { placeholder: 'Please provide a detailed reason for rejecting this document...' },
                                                    style: {
                                                        width: '100%',
                                                        minHeight: '150px',
                                                        padding: '12px',
                                                        backgroundColor: '#2a2a2a',
                                                        border: '1px solid #444',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        fontFamily: 'monospace',
                                                        resize: 'vertical',
                                                        outline: 'none',
                                                        transition: 'border-color 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'input', method: (e) => { rejectReason = e.target.value },
                                                        type2: 'focus', method2: (e) => { e.target.style.borderColor = 'deepskyblue' },
                                                        type3: 'blur', method3: (e) => { e.target.style.borderColor = '#444' }
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
                                                backgroundColor: '#444',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#bbb',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click', method: closeModal,
                                                type2: 'mouseenter', method2: (e) => { e.target.style.backgroundColor = '#555' },
                                                type3: 'mouseleave', method3: (e) => { e.target.style.backgroundColor = '#444' }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            text: 'Submit Rejection',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#f44336',
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
                                                    const remove = () => loading.remove()
                                                    
                                                    const form = new FormData()
                                                    form.append('docId', docId)
                                                    form.append('fileUrl', driveViewUrl || file)
                                                    form.append('reasonEnd', rejectReason)
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
                                                    }).then(dat => {
                                                        if (dat?.status) {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => window.location.reload()))
                                                        } else {
                                                            document.body.appendChild(ConfirmationAlert(dat?.message || 'Error processing request', () => window.location.reload()))
                                                        }
                                                    }).catch(err => {
                                                        remove()
                                                        alert('Error submitting rejection. Please try again.')
                                                    })
                                                },
                                                type2: 'mouseenter', method2: (e) => { e.target.style.backgroundColor = '#d32f2f' },
                                                type3: 'mouseleave', method3: (e) => { e.target.style.backgroundColor = '#f44336' }
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

                        return ($({
                            tag: 'div',
                            style: { width: '100%', height: '20%', position: 'absolute', bottom: '0', backgroundColor: '#1a1a1a', borderTop: '1px solid #444' },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { width: '100%', height: '50%', display: 'flex', justifyContent: 'center', padding: '10px' },
                                    child: [
                                        Button({ 
                                            Label: 'ACCEPT', 
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
                                                            showSuccessAndReload("Document Accepted Successfully!")
                                                        } else {
                                                            alert(data.message || "Failed to accept document")
                                                        }
                                                    }).catch(() => loading.remove())
                                                }
                                            }, 
                                            isAccept: true 
                                        }),
                                        Button({ 
                                            Label: 'REJECT', 
                                            Event: () => {
                                                if (confirm("Are you sure you want to reject this document?")) showRejectModal()
                                            }, 
                                            isAccept: false 
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: { height: '50%', width: '100%', display: 'flex', justifyContent: 'center' },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: { className: 'botControllStaff' },
                                            style: { width: '99%', height: '90%', display: 'flex', justifyContent: 'center', margin: 'auto', cursor: 'pointer', backgroundColor: '#333', borderRadius: '8px', transition: 'all 0.2s ease' },
                                            event: {
                                                type: 'click', method: () => viewerPanel.remove(),
                                                type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = '#444' },
                                                type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = '#333' }
                                            },
                                            child: [$({ tag: 'div', text: 'Close', style: { margin: 'auto', fontFamily: 'arial black,sans-serif', fontSize: '1.4vw', color: 'deepskyblue' } })]
                                        })
                                    ]
                                })
                            ]
                        }))
                    }

                    const getClickBot = (el) => {
                        const holder = $({
                            tag: 'div',
                            style: { width: '100%', height: '65%', overflowY: 'auto', backgroundColor: '#333', padding: '10px' }
                        })
                        el.appendChild(endorsement)
                        el.appendChild($({ tag: 'div', text: 'Documents', style: { margin: '1vh auto', fontFamily: 'arial black, sans-serif', fontSize: '1.2vw', color: '#bbb' } }))
                        el.appendChild($({ tag: 'div', style: { color: '#bbb', fontWeight: 'bold' }, att: { innerHTML: `<span style="font-size:1vw;color:deepskyblue">Entries:</span> ${research.length}` } }))
                        
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
                        style: { width: '29.5%', height: '100%', margin: 'auto', borderRight: 'solid thin #bbb', position: 'relative' },
                        elementHandler: getClickBot
                    }))
                }

                return ($({
                    tag: 'div',
                    style: { width: '100%', height: '100%', position: 'absolute', left: '0', top: '0', display: 'flex', justifyContent: 'center', backgroundColor: '#555', zIndex: 100 },
                    elementHandler: getViewer,
                    child: [DetailsViewer(), frameView]
                }))
            }

            const icon = $({ tag: 'div', att: { className: 'fa-solid fa-file-pdf' }, style: { fontSize: '3vw', margin: 'auto', color: '#999', textShadow: '-.2vw .5vh .5vw black' } })

            const leftBox = () => {
                const details = (label, data) => $({ tag: 'div', style: { width: 'fit-content', marginBottom: '4px' }, child: [$({ tag: 'span', text: label, style: { color: 'lightskyblue', fontSize: '1vw', fontFamily: 'arial black' } }), $({ tag: 'span', text: data, style: { color: '#bbb', fontSize: '1vw', fontFamily: 'arial,sans-serif', marginLeft: '5px' } })] })
                
                let [datePart, timePart] = date.split(' ')
                let timeFormat = TimeConvert(timePart.split(":"))
                const isExtension = !center || center === '' || center === 'Extension (Extension)' || center === 'Extension'
                let locationLabel = isExtension ? 'Campus: ' : 'Center: '
                let locationValue = isExtension ? (campus || 'N/A') : (research.length > 0 ? research[0].center : center || 'N/A')
                                
                return ($({ 
                    tag: 'div', 
                    style: { margin: 'auto', width: '90%' }, 
                    child: [
                        details("Title: ", titleEntry), 
                        details("Sender: ", sender),
                        details("Category: ", category),
                        details(locationLabel, locationValue), 
                        details("Event type: ", eventType), 
                        details("Sender email: ", smail), 
                        details("Date Submitted: ", formatDate(datePart) + " at " + timeFormat)
                    ] 
                }))
            }

            return ($({
                tag: 'button',
                style: { width: '95%', margin: '.5vw auto', padding: '.3rem', display: 'flex', justifyContent: 'center', border: 'solid thin #999', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' },
                att: { className: 'endorseIncoming' },
                child: [icon, leftBox()],
                event: {
                    type: 'click', method: () => mainFrame.appendChild(viewDocs()),
                    type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' },
                    type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }
                }
            }))
        }

        // Student Research Document Component (for both undergraduate and graduate)
        const docsStudent = ({ id, title, author, coauthor, presenter, category, campus, event, paper_type, created_at, sender_type, sender_email, research_file, endorsement_file }) => {
            
            const viewStudentDocs = () => {
                let viewerPanel
                const getViewer = (el) => { viewerPanel = el }

                const object = ({ dataURL, title, fileType }) => {
                    let object
                    const getObject = (el) => { object = el }
                    return ($({
                        tag: 'div',
                        style: { position: 'absolute', left: '0', top: '0', width: '100%', height: '99.5%', textAlign: 'center', backgroundColor: '#222', zIndex: 1000 },
                        elementHandler: getObject,
                        child: [
                            $({
                                tag: 'div',
                                style: { width: '100%', height: '5%', backgroundColor: '#444', justifyContent: 'center', color: '#bbb', display: 'flex' },
                                child: [
                                    $({ tag: 'div', style: { width: 'fit-content', height: 'fit-content', margin: 'auto', display: 'flex', cursor: 'pointer' }, event: { type: 'click', method: () => object.remove() }, child: [$({ tag: 'div', att: { className: 'fa-solid fa-caret-left' }, style: { fontSize: '2vw', margin: 'auto', color: 'deepskyblue' } }), $({ tag: 'div', style: { fontSize: '1.2vw', color: 'deepskyblue', fontFamily: 'arial black,sans-serif', margin: 'auto' }, text: 'Back' })] }),
                                    $({ tag: 'div', style: { margin: 'auto', marginLeft: '2vw', width: '80%', textAlign: 'left', display: 'flex' }, child: [$({ tag: 'div', style: { fontFamily: 'monospace', fontSize: '1vw', color: 'deepskyblue', fontWeight: 'bold', margin: 'auto' }, text: `${fileType}: ` }), $({ tag: 'div', text: `"${title}"`, style: { fontFamily: 'monospace', fontSize: '1vw', color: '#bbb', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '100%', margin: 'auto' } })] })
                                ]
                            }),
                            $({ tag: 'iframe', att: { src: dataURL, type: 'application/pdf', sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms', allow: 'autoplay' }, style: { width: '80%', height: '95%', margin: 'auto', border: 'none' } })
                        ]
                    }))
                }

                // Right side panel for endorsement letter viewer (similar to faculty)
                const RightPanel = () => {
                    let endorsementUrl = endorsement_file?.viewUrl || null
                    
                    const getFilePanel = (el) => {
                        if (endorsementUrl) {
                            let fileId = null
                            let embedUrl = endorsementUrl
                            
                            if (endorsementUrl.includes('drive.google.com')) {
                                const patterns = [
                                    /\/d\/([a-zA-Z0-9_-]+)/,
                                    /\/file\/d\/([a-zA-Z0-9_-]+)/,
                                    /id=([a-zA-Z0-9_-]+)/,
                                    /open\?id=([a-zA-Z0-9_-]+)/,
                                    /([a-zA-Z0-9_-]{25,})/
                                ]
                                for (let pattern of patterns) {
                                    const match = endorsementUrl.match(pattern)
                                    if (match && match[1]) {
                                        fileId = match[1]
                                        break
                                    }
                                }
                                if (fileId) {
                                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
                                }
                            }
                            
                            el.appendChild($({
                                tag: 'iframe',
                                att: {
                                    src: embedUrl,
                                    type: 'application/pdf',
                                    sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                    allow: 'autoplay'
                                },
                                style: { width: '98%', height: '99%', border: 'none', backgroundColor: '#fff' }
                            }))
                        } else {
                            el.appendChild($({
                                tag: 'div',
                                style: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' },
                                child: [$({ tag: 'div', text: 'No endorsement letter available', style: { fontSize: '1.5vw', color: '#f44' } })]
                            }))
                        }
                    }
                    
                    return ($({
                        tag: 'div',
                        style: { width: '70%', height: '100%', backgroundColor: '#f5f5f5' },
                        child: [
                            $({
                                tag: 'div',
                                style: { width: '100%', height: '5%', backgroundColor: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' },
                                child: [
                                    $({ tag: 'div', text: 'Endorsement Letter', style: { color: '#fff', fontSize: '1vw', fontWeight: 'bold' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: { width: '100%', height: '95%' },
                                elementHandler: getFilePanel
                            })
                        ]
                    }))
                }

                // Button component matching faculty style
                const Button = ({ Label, Event, isAccept = false }) => {
                    const colors = isAccept 
                        ? { bg: 'rgba(76, 175, 80, 0.2)', border: '#4CAF50', hover: 'rgba(76, 175, 80, 0.4)' }
                        : { bg: 'rgba(244, 67, 54, 0.2)', border: '#f44336', hover: 'rgba(244, 67, 54, 0.4)' }
                    
                    return ($({
                        tag: 'div',
                        style: {
                            height: '99%',
                            width: '49%',
                            display: 'flex',
                            justifyContent: 'center',
                            margin: 'auto',
                            backgroundColor: colors.bg,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        att: { className: 'botControllStaff' },
                        event: {
                            type: 'click', method: Event,
                            type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = colors.hover; e.currentTarget.style.transform = 'scale(1.02)' },
                            type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = colors.bg; e.currentTarget.style.transform = 'scale(1)' }
                        },
                        child: [$({ tag: 'div', text: Label, style: { margin: 'auto', fontFamily: 'arial black,sans-serif', color: colors.border, fontSize: '1.1vw' } })]
                    }))
                }

                const DetailsViewer = () => {
                    const header = $({
                        tag: 'div',
                        style: { display: 'flex', justifyContent: 'center', height: '5%', width: '100%', backgroundColor: '#666', borderBottom: 'solid thin #999' },
                        child: [
                            $({ tag: 'div', style: { margin: 'auto', color: 'deepskyblue', display: 'flex', cursor: 'pointer' }, child: [$({ tag: 'div', att: { className: 'fa-solid fa-caret-left' }, style: { fontSize: '1.7vw', margin: 'auto' } }), $({ tag: 'div', text: 'Back', style: { fontFamily: 'Segoe UI', fontSize: '1.5vw', fontWeight: 'bold', margin: 'auto' } })], event: { type: 'click', method: () => viewerPanel.remove() } }),
                            $({ tag: 'div', text: `${paper_type === 'undergraduate' ? 'Undergraduate' : 'Graduate'} Research Submission`, style: { width: 'fit-content', margin: 'auto', fontFamily: 'arial black,san-serif', fontSize: '1.4vw', color: '#bbb' } })
                        ]
                    })

                    const contentPanel = $({
                        tag: 'div',
                        style: { width: '100%', height: '65%', overflowY: 'auto', backgroundColor: '#333', padding: '10px' },
                        child: [
                            $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Title: ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: title, style: { color: '#bbb', fontSize: '1vw' } })] }),
                            $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Author: ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: author, style: { color: '#bbb', fontSize: '1vw' } })] }),
                            coauthor && coauthor !== '[]' && coauthor !== 'null' ? $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Co-author(s): ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: coauthor.replace(/[\[\]"]/g, ''), style: { color: '#bbb', fontSize: '1vw' } })] }) : null,
                            $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Presenter: ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: presenter, style: { color: '#bbb', fontSize: '1vw' } })] }),
                            $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Category: ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: category, style: { color: '#bbb', fontSize: '1vw' } })] }),
                            $({ tag: 'div', style: { marginBottom: '10px' }, child: [$({ tag: 'span', text: 'Campus: ', style: { color: 'lightblue', fontSize: '1vw' } }), $({ tag: 'span', text: campus, style: { color: '#bbb', fontSize: '1vw' } })] }),
                            // View Research Paper Button
                            research_file && research_file.hasFile ? $({
                                tag: 'div',
                                style: { marginTop: '15px', textAlign: 'center' },
                                child: [
                                    $({
                                        tag: 'button',
                                        style: { 
                                            padding: '10px 20px', 
                                            backgroundColor: 'deepskyblue', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer', 
                                            color: '#fff', 
                                            fontSize: '0.9vw', 
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s ease',
                                            width: '100%'
                                        },
                                        child: [$({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' }, style: { marginRight: '8px' } }), $({ tag: 'span', text: 'View Research Paper' })],
                                        event: { 
                                            type: 'click', 
                                            method: () => { 
                                                if (research_file.viewUrl) {
                                                    mainFrame.appendChild(object({ dataURL: research_file.viewUrl, title: title, fileType: 'Research Paper' }))
                                                }
                                            },
                                            type2: 'mouseenter', 
                                            method2: (e) => { e.target.style.backgroundColor = '#0a7cb5' },
                                            type3: 'mouseleave', 
                                            method3: (e) => { e.target.style.backgroundColor = 'deepskyblue' }
                                        }
                                    })
                                ]
                            }) : null
                        ]
                    })

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
                                                style: { color: '#ddd', fontSize: '14px', fontWeight: '500' }
                                            }),
                                            $({
                                                tag: 'textarea',
                                                att: { placeholder: 'Please provide a detailed reason for rejecting this document...' },
                                                style: {
                                                    width: '100%',
                                                    minHeight: '150px',
                                                    padding: '12px',
                                                    backgroundColor: '#2a2a2a',
                                                    border: '1px solid #444',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease'
                                                },
                                                event: {
                                                    type: 'input', method: (e) => { rejectReason = e.target.value },
                                                    type2: 'focus', method2: (e) => { e.target.style.borderColor = 'deepskyblue' },
                                                    type3: 'blur', method3: (e) => { e.target.style.borderColor = '#444' }
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
                                            backgroundColor: '#444',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#bbb',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click', method: closeModal,
                                            type2: 'mouseenter', method2: (e) => { e.target.style.backgroundColor = '#555' },
                                            type3: 'mouseleave', method3: (e) => { e.target.style.backgroundColor = '#444' }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Submit Rejection',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#f44336',
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
                                            type2: 'mouseenter', method2: (e) => { e.target.style.backgroundColor = '#d32f2f' },
                                            type3: 'mouseleave', method3: (e) => { e.target.style.backgroundColor = '#f44336' }
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

                    const actionButtons = $({
                        tag: 'div',
                        style: { width: '100%', height: '20%', position: 'absolute', bottom: '0', backgroundColor: '#1a1a1a', borderTop: '1px solid #444' },
                        child: [
                            $({
                                tag: 'div',
                                style: { width: '100%', height: '50%', display: 'flex', justifyContent: 'center', padding: '10px' },
                                child: [
                                    Button({ 
                                        Label: 'ACCEPT', 
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
                                                        showSuccessAndReload("Research paper accepted successfully!")
                                                    } else {
                                                        alert(data.message || "Failed to accept research paper")
                                                    }
                                                }).catch(() => loading.remove())
                                            }
                                        }, 
                                        isAccept: true 
                                    }),
                                    Button({ 
                                        Label: 'REJECT', 
                                        Event: () => {
                                            if (confirm("Are you sure you want to reject this document?")) showRejectModal()
                                        }, 
                                        isAccept: false 
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: { height: '50%', width: '100%', display: 'flex', justifyContent: 'center' },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: { className: 'botControllStaff' },
                                        style: { width: '99%', height: '90%', display: 'flex', justifyContent: 'center', margin: 'auto', cursor: 'pointer', backgroundColor: '#333', borderRadius: '8px', transition: 'all 0.2s ease' },
                                        event: {
                                            type: 'click', method: () => viewerPanel.remove(),
                                            type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = '#444' },
                                            type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = '#333' }
                                        },
                                        child: [$({ tag: 'div', text: 'Close', style: { margin: 'auto', fontFamily: 'arial black,sans-serif', fontSize: '1.4vw', color: 'deepskyblue' } })]
                                    })
                                ]
                            })
                        ]
                    })

                    return ($({
                        tag: 'div',
                        style: { width: '29.5%', height: '100%', margin: 'auto', borderRight: 'solid thin #bbb', position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#333' },
                        child: [header, contentPanel, actionButtons]
                    }))
                }

                return ($({
                    tag: 'div',
                    style: { width: '100%', height: '100%', position: 'absolute', left: '0', top: '0', display: 'flex', justifyContent: 'center', backgroundColor: '#555', zIndex: 100 },
                    elementHandler: getViewer,
                    child: [DetailsViewer(), RightPanel()]
                }))
            }

            const icon = $({ tag: 'div', att: { className: paper_type === 'undergraduate' ? 'fa-solid fa-graduation-cap' : 'fa-solid fa-user-graduate' }, style: { fontSize: '3vw', margin: 'auto', color: paper_type === 'undergraduate' ? '#4CAF50' : '#FF9800', textShadow: '-.2vw .5vh .5vw black' } })

            const leftBox = () => {
                const details = (label, data) => $({ tag: 'div', style: { width: 'fit-content', marginBottom: '4px' }, child: [$({ tag: 'span', text: label, style: { color: 'lightskyblue', fontSize: '1vw', fontFamily: 'arial black' } }), $({ tag: 'span', text: data, style: { color: '#bbb', fontSize: '1vw', fontFamily: 'arial,sans-serif', marginLeft: '5px' } })] })
                return ($({
                    tag: 'div',
                    style: { margin: 'auto', width: '90%' },
                    child: [
                        details("Title: ", title.substring(0, 50) + (title.length > 50 ? '...' : '')), 
                        details("Sender: ", sender_type), 
                        details("Category: ", category), 
                        details("Campus: ", campus), 
                        details("Event: ", event),
                        details("Email: ", sender_email || 'N/A'),
                        details("Date Submitted: ", formatDateTime(created_at))
                    ]
                }))
            }

            return ($({
                tag: 'button',
                style: { width: '95%', margin: '.5vw auto', padding: '.3rem', display: 'flex', justifyContent: 'center', border: `solid thin ${paper_type === 'undergraduate' ? '#4CAF50' : '#FF9800'}`, borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' },
                att: { className: 'studentResearchItem' },
                child: [icon, leftBox()],
                event: { type: 'click', method: () => mainFrame.appendChild(viewStudentDocs()), type2: 'mouseenter', method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)' }, type3: 'mouseleave', method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)' } }
            }))
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
                backgroundColor: 'rgba(100,100,100,0.2)',
                margin: 'auto',
                marginLeft: '0',
                borderRadius: '16px',
                overflow: 'hidden'
            },
            child: [
                label,
                createTabs(),
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        height: 'fit-content',
                        marginTop: '1vh',
                        alignItems: 'center'
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
                                $({ tag: 'span', text: 'Pending submission(s):', style: { fontSize: '1.2vw' } }),
                                $({ tag: 'span', style: { color: '#bbb', fontWeight: 'bold', marginLeft: '5px' }, elementHandler: (el) => { docQue = el } })
                            ]
                        })
                    ]
                }),
                bodyPanel()
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
                        tag: 'button',
                        style: {
                            width:'fit-content',
                            height:'fit-content',
                            marginRight:'2vw',
                            marginLeft:'1vw',
                            border:'solid thin deepskyblue',
                            paddingLeft:'.5vw',
                            paddingRight:'.5vw',
                            borderRadius:'.5rem',
                            backgroundColor: '#222',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column', 
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        child:[
                            $({
                                tag:'div',
                                text:'Back',
                                style:{
                                    fontSize:'1vw',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color: 'deepskyblue',
                                    textDecoration: 'hidden'
                                }
                            }),
                            $({
                                tag:'div',
                                att:{
                                    className:'fa fa-arrow-left'
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
                        event: {  // Add click event instead of href
                            type: 'click',
                            method: () => {
                                window.location.href = '/rdeOffice/research/research';
                            }
                        }
                    }),
                    $({
                        tag:'div',
                        text:'Score Summary and Ranking',
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
                                width:'100%',
                                maxWidth: 'auto',
                                backgroundColor:'#2c3e50',
                                display:'flex',
                                justifyContent:'center',
                                position: 'fixed',   
                                bottom: '0',            
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
            Forwarded(mainFrame, leftPdiv),
            ScoreSummary()
        ]
    }))
}
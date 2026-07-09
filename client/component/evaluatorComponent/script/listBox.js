import { $, ConfirmationAlert, Request, Waiting } from '../../../lib/lib.js'
import { EntryList } from "./EntryList.js";

export const Search = (method) => {
    return ($({
        tag: 'div',
        att: { className: 'searchBarEval' },
        child: [
            $({
                tag: 'div',
                att: { className: 'searchBox' },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-magnifying-glass searchIcEval'
                        },
                        style: {
                            color: '#94a3b8',
                            fontSize: '14px',
                            marginRight: '10px',
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'search',
                            placeholder: 'Search research papers...',
                            className: 'searchInputEval',
                            id: 'search-input-evaluation',
                            name: 'searchInputEvaluation'
                        },
                        style: { height: 'auto' },
                        event: {
                            type: 'input',
                            method: method
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                att: { className: 'entriesCounter' },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-chart-simple'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#3b82f6'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Total Entries:'
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'countNumber' },
                        elementHandler: async (el) => {
                            try {
                                const req = new Request('/eventRequest')
                                req.Post([{ name: 'collectEntries', value: '1' }])
                                const data = await req.Send()
                                el.textContent = data || '0'
                            } catch (err) {
                                console.error('Error loading entry count:', err)
                                el.textContent = '0'
                            }
                        }
                    })
                ]
            })
        ]
    }))
}

export const Box = (getBody) => {
    let panelBox

    const viewResearch = (file, fileId, comments, title) => {
        let com = comments || { intro: '', abstract: '', objective: '', methodology: '', results: '', recommendation: '', literature: '', other: '' }
        let viewPanel
        let categoryPanel
        let commentState = false

        const getPanel = (panel) => { viewPanel = panel }
        const getCat = (cath) => { categoryPanel = cath }

        const toggleComments = (event) => {
            commentState = !commentState
            if (commentState) {
                categoryPanel.classList.add('showContent')
                event.target.style.color = '#ef4444'
            } else {
                categoryPanel.classList.remove('showContent')
                event.target.style.color = '#3b82f6'
            }
        }

        const data = { ...com }
        const baseData = { ...com }

        const baseCheck = () => {
            const keys = Object.keys(data)
            return keys.some(key => data[key] !== baseData[key])
        }

        const CommentContain = ({ labelButton, Get, comment, id }) => {
            let isOpen = false
            let textEd, txtInp, saveIndicator

            const toggleOpen = () => {
                isOpen = !isOpen
                if (txtInp) {
                    txtInp.classList.toggle('open')
                }
                if (textEd) {
                    textEd.classList.toggle('open')
                }
            }

            const Editor = () => {
                const controlIcon = ({ icon, event, text }) => {
                    return ($({
                        tag: 'button',
                        style: {
                            padding: '4px 10px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '4px',
                            color: '#475569',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s ease',
                        },
                        att: { className: icon },
                        text: text || '',
                        event: {
                            type: 'click',
                            method: event
                        }
                    }))
                }

                const ColorPicker = () => {
                    let input
                    return ($({
                        tag: 'div',
                        att: { className: 'color-picker' },
                        child: [
                            $({
                                tag: 'input',
                                att: { type: 'color' },
                                event: {
                                    type: 'change',
                                    method: (eve) => {
                                        document.execCommand('foreColor', true, eve.target.value)
                                    }
                                },
                                elementHandler: (el) => { input = el }
                            }),
                            $({
                                tag: 'button',
                                text: '🎨',
                                style: { padding: '4px 10px' },
                                event: {
                                    type: 'click',
                                    method: () => { input.click() }
                                }
                            })
                        ]
                    }))
                }

                return ($({
                    tag: 'div',
                    att: { className: 'comment-content' },
                    elementHandler: (el) => { textEd = el },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'editor-toolbar' },
                            child: [
                                controlIcon({ icon: 'fa-solid fa-list-ul', event: () => document.execCommand('insertUnorderedList') }),
                                controlIcon({ icon: 'fa-solid fa-list-ol', event: () => document.execCommand('insertOrderedList') }),
                                controlIcon({ icon: 'fa-solid fa-bold', event: () => document.execCommand('bold') }),
                                controlIcon({ icon: 'fa-solid fa-italic', event: () => document.execCommand('italic') }),
                                controlIcon({ icon: 'fa-solid fa-underline', event: () => document.execCommand('underline') }),
                                ColorPicker(),
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'editor-input',
                                contentEditable: true,
                                'data-placeholder': 'Enter your comments here...',
                            },
                            elementHandler: (el) => {
                                txtInp = el
                                if (comment) el.innerHTML = comment
                            },
                            style: {
                                minHeight: '60px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: '12px',
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                outline: 'none',
                            },
                            event: {
                                type: 'input',
                                method: (event) => {
                                    Get(event.target.innerHTML)
                                    if (saveIndicator) {
                                        saveIndicator.style.visibility = event.target.innerText ? 'visible' : 'hidden'
                                    }
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'save-indicator' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'check' },
                                    text: '✓',
                                    elementHandler: (el) => { saveIndicator = el }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Content saved',
                                    style: { color: '#94a3b8' }
                                })
                            ]
                        })
                    ]
                }))
            }

            return ($({
                tag: 'div',
                att: { className: 'comment-section' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'comment-toggle' },
                        child: [
                            $({
                                tag: 'span',
                                text: labelButton,
                                style: { fontWeight: '500' }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'toggle-icon' },
                                text: '▼',
                                style: { transition: 'transform 0.3s ease' }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.toggle-icon')
                                icon.classList.toggle('open')
                                const content = e.currentTarget.parentElement.querySelector('.comment-content')
                                content.classList.toggle('open')
                            }
                        }
                    }),
                    Editor()
                ]
            }))
        }

        const Submit = () => {
            return ($({
                tag: 'div',
                att: { className: 'comment-actions' },
                child: [
                    $({
                        tag: 'button',
                        att: { className: 'btn btn-primary' },
                        text: '💾 Save Comments',
                        event: {
                            type: 'click',
                            method: async () => {
                                data.intro = document.getElementById('introDiv')?.innerHTML || ''
                                const keys = Object.keys(data)
                                const hasContent = keys.some(key => data[key] && data[key] !== '')

                                if (!hasContent) {
                                    alert('No new comments added...!')
                                    return
                                }

                                const loading = Waiting()
                                document.body.appendChild(loading)

                                try {
                                    const form = new FormData()
                                    form.append('comment', 'true')
                                    form.append('intro', data.intro || '')
                                    form.append('abstract', data.abstract || '')
                                    form.append('objective', data.objective || '')
                                    form.append('methodology', data.methodology || '')
                                    form.append('results', data.results || '')
                                    form.append('recommendation', data.recommendation || '')
                                    form.append('literature', data.literature || '')
                                    form.append('other', data.other || '')
                                    form.append('docsId', fileId)
                                    form.append('updateReview', 'true')

                                    const res = await fetch('/uploadResearchFile', {
                                        method: 'POST',
                                        body: form
                                    })

                                    loading.remove()

                                    if (res.ok) {
                                        const result = await res.json()
                                        document.body.appendChild(ConfirmationAlert(
                                            result.message || 'Comments saved successfully!',
                                            () => window.location.reload()
                                        ))
                                    }
                                } catch (err) {
                                    loading.remove()
                                    console.error('Error saving comments:', err)
                                    alert('Error saving comments. Please try again.')
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { className: 'btn btn-danger' },
                        text: '🗑️ Reset All',
                        event: {
                            type: 'click',
                            method: () => {
                                if (confirm('Do you want to delete all of your comments for this document?')) {
                                    const req = new Request('/uploadResearchFile')
                                    req.Post([
                                        { name: 'resetComments', value: '1' },
                                        { name: 'docId', value: fileId }
                                    ])
                                    req.Json()
                                    req.Send().then(data => {
                                        if (data.status) {
                                            alert('Comments deleted successfully!')
                                            window.location.reload()
                                        } else {
                                            alert(data.message || 'Error deleting comments')
                                        }
                                    }).catch(err => {
                                        console.error('Error deleting comments:', err)
                                        alert('Error deleting comments. Please try again.')
                                    })
                                }
                            }
                        }
                    })
                ]
            }))
        }

        const Category = () => {
            return ($({
                tag: 'div',
                att: { className: 'categoryCon' },
                style: {
                    height: 'fit-content',
                    maxHeight: '90vh',
                    border: '1px solid #e8ecf1',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    background: '#ffffff',
                    borderRadius: '12px',
                    overflowY: 'auto',
                    padding: '16px',
                },
                elementHandler: getCat,
                child: [
                    $({
                        tag: 'div',
                        style: {
                            padding: '12px',
                            marginBottom: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#0f172a',
                            border: '1px solid #e8ecf1',
                            fontSize: '14px',
                        },
                        text: `📄 ${title || 'Document'}`
                    }),
                    CommentContain({
                        labelButton: 'Abstract',
                        Get: (v) => { data.abstract = v },
                        comment: data.abstract,
                        id: 'abstractDiv'
                    }),
                    CommentContain({
                        labelButton: 'Introduction',
                        Get: (v) => { data.intro = v },
                        comment: data.intro,
                        id: 'introDiv'
                    }),
                    CommentContain({
                        labelButton: 'Objectives',
                        Get: (v) => { data.objective = v },
                        comment: data.objective,
                        id: 'objectiveDiv'
                    }),
                    CommentContain({
                        labelButton: 'Methodology',
                        Get: (v) => { data.methodology = v },
                        comment: data.methodology,
                        id: 'methodDiv'
                    }),
                    CommentContain({
                        labelButton: 'Results & Discussion',
                        Get: (v) => { data.results = v },
                        comment: data.results,
                        id: 'resultDiv'
                    }),
                    CommentContain({
                        labelButton: 'Conclusions & Recommendations',
                        Get: (v) => { data.recommendation = v },
                        comment: data.recommendation,
                        id: 'recomDiv'
                    }),
                    CommentContain({
                        labelButton: 'References',
                        Get: (v) => { data.literature = v },
                        comment: data.literature,
                        id: 'litDiv'
                    }),
                    CommentContain({
                        labelButton: 'Other',
                        Get: (v) => { data.other = v },
                        comment: data.other,
                        id: 'otherDiv'
                    }),
                    Submit()
                ]
            }))
        }

        const ControlViewer = () => {
            return ($({
                tag: 'div',
                att: { className: 'view-sidebar' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'sidebar-header' },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'doc-title' },
                                text: title || 'Document Viewer'
                            }),
                            $({
                                tag: 'button',
                                att: { className: 'close-btn' },
                                text: '✕',
                                event: {
                                    type: 'click',
                                    method: () => {
                                        if (baseCheck() && !confirm('Do you want to exit without saving your data?')) {
                                            return
                                        }
                                        viewPanel.remove()
                                    }
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'comments-area' },
                        child: [Category()]
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            att: { className: 'viewPanel' },
            elementHandler: getPanel,
            child: [
                $({
                    tag: 'div',
                    att: { className: 'view-container' },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'pdf-viewer' },
                            child: [
                                $({
                                    tag: 'object',
                                    att: {
                                        className: 'frameViewerEval',
                                        data: file,
                                        type: 'application/pdf'
                                    },
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }
                                })
                            ]
                        }),
                        ControlViewer()
                    ]
                })
            ]
        }))
    }

    const getListPanel = async (panel) => {
        getBody(panel)
        panelBox = panel

        try {
            // Get category and event
            const evalReq = new FormData()
            evalReq.append('evalLeb', '1')
            const evalRes = await fetch('/evaluatorReg', { method: 'POST', body: evalReq })
            const evalData = await evalRes.json()

            // Get research list
            const form = new FormData()
            form.append('researchSubmit', 'true')
            form.append('center', evalData.center)
            form.append('event', evalData.event)

            const res = await fetch('/uploadResearchFile', { method: 'POST', body: form })
            const data = await res.json()

            if (data.list && data.list.length) {
                data.list.forEach((val) => {
                    // Parse coauthors if it's a string representation of an array
                    let coAuthors = val.coauthor || val.coAuthors || null
                    if (typeof coAuthors === 'string' && coAuthors.startsWith('[') && coAuthors.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(coAuthors)
                            if (Array.isArray(parsed)) {
                                coAuthors = parsed.join(', ')
                            }
                        } catch (e) {
                            // If parsing fails, keep as is
                        }
                    }
                    if (Array.isArray(coAuthors)) {
                        coAuthors = coAuthors.join(', ')
                    }

                    panel.appendChild(EntryList({
                        title: val.title,
                        author: val.author,
                        coAuthors: coAuthors,
                        presenter: val.presenter,
                        center: val.center,
                        docId: val.id,
                        eventId: val.eventId || val.event_id,
                        centerId: val.centerId,
                        hasScore: val.hasScore || false,
                        hasComment: val.hasComment || false,
                        status: val.status || false,
                    }))
                })
            } else {
                panel.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                        <div style="font-size:48px;margin-bottom:16px;">📭</div>
                        <h3 style="color:#475569;margin-bottom:8px;">No entries found</h3>
                        <p style="color:#94a3b8;font-size:14px;">There are no research papers submitted for this event yet.</p>
                    </div>
                `
            }
        } catch (err) {
            console.error('Error loading research list:', err)
            panel.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#ef4444;">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <h3 style="margin-bottom:8px;">Error loading entries</h3>
                    <p style="font-size:14px;color:#94a3b8;">Please refresh the page to try again.</p>
                </div>
            `
        }
    }

    return ($({
        tag: 'div',
        att: { className: 'listBox' },
        elementHandler: getListPanel
    }))
}
import { $, ConfirmationAlert, Waiting, DeleteConfirmModal, FileViewerModal, CustomModal, AlertModal } from '../../../../lib/lib.js'

let currentPaperType = 'undergraduate';
let formData = {};

// ============== HELPER FUNCTIONS ==============
const undergraduateCategories = ['Social Science', 'Natural / Biological', 'Food', 'Development']
const graduateCategories = ['Social Science', 'Natural / Biological', 'Food', 'Development']
const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']

const capitalizeFirstLetter = (str) => {
    if (!str) return str
    return str.split(' ').map(word => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }).join(' ')
}

// ============== OPEN VIEW RESEARCHES MODAL ==============
const openViewResearchesModal = () => {
    let currentModal = null
    let eventSelect, searchInput, tableBody, paperTypeSelect
    let loadResearchDataFn

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '500px'
            }
        })

        const searchContainer = $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                flexShrink: 0,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
            }
        })

        const paperTypeWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '8px 16px',
                gap: '10px',
                minWidth: '180px',
                flex: '0 0 auto'
            }
        })

        const paperTypeIcon = $({
            tag: 'i',
            att: { className: 'fas fa-graduation-cap' },
            style: { color: '#666', fontSize: '16px' }
        })

        paperTypeSelect = $({
            tag: 'select',
            style: {
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#6d6d6dff',
                fontSize: '14px',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
            },
            event: {
                type: 'change',
                method: (e) => {
                    const selectedEventId = eventSelect?.value
                    const searchTerm = searchInput?.value.trim() || ''
                    if (selectedEventId) {
                        loadResearchDataFn(selectedEventId, searchTerm, e.target.value)
                    }
                }
            }
        })

        paperTypeSelect.appendChild($({ tag: 'option', text: '🎓 Undergraduate', att: { value: 'undergraduate', selected: true } }))
        paperTypeSelect.appendChild($({ tag: 'option', text: '🎓 Graduate', att: { value: 'graduate' } }))

        paperTypeWrapper.appendChild(paperTypeIcon)
        paperTypeWrapper.appendChild(paperTypeSelect)

        const eventFilterWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '8px 16px',
                gap: '10px',
                minWidth: '260px',
                flex: '1'
            }
        })

        const filterIcon = $({
            tag: 'i',
            att: { className: 'fas fa-calendar-alt' },
            style: { color: '#666', fontSize: '16px' }
        })

        eventSelect = $({
            tag: 'select',
            style: {
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#6d6d6dff',
                fontSize: '14px',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
            }
        })

        const placeholderOption = $({
            tag: 'option',
            text: 'Select an event...',
            att: { value: '', disabled: true, selected: true }
        })
        eventSelect.appendChild(placeholderOption)

        eventFilterWrapper.appendChild(filterIcon)
        eventFilterWrapper.appendChild(eventSelect)

        const searchWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '8px 16px',
                gap: '12px',
                flex: 2
            }
        })

        const searchIcon = $({
            tag: 'i',
            att: { className: 'fas fa-search' },
            style: { color: '#666', fontSize: '16px' }
        })

        const debounce = (func, delay) => {
            let timeoutId
            return function (...args) {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => func.apply(this, args), delay)
            }
        }

        searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                placeholder: 'Search by event name, campus, author, co-author, presenter, or title...'
            },
            style: {
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: debounce((e) => {
                    const searchTerm = e.target.value.trim()
                    const selectedEventId = eventSelect.value
                    const paperType = paperTypeSelect.value
                    if (selectedEventId) {
                        loadResearchDataFn(selectedEventId, searchTerm, paperType)
                    }
                }, 500)
            }
        })

        searchWrapper.appendChild(searchIcon)
        searchWrapper.appendChild(searchInput)

        searchContainer.appendChild(paperTypeWrapper)
        searchContainer.appendChild(eventFilterWrapper)
        searchContainer.appendChild(searchWrapper)

        const tableContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                padding: '0 24px 24px 24px'
            }
        })

        const table = $({
            tag: 'table',
            style: {
                width: '100%',
                borderCollapse: 'collapse'
            }
        })

        const thead = $({ tag: 'thead', style: { position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 1 } })
        const headerRow = $({ tag: 'tr', style: { borderBottom: '2px solid #333' } })
        const columns = ['Event Name', 'Campus', 'Author', 'Title', 'Paper Type', 'Files']

        columns.forEach(col => {
            headerRow.appendChild($({
                tag: 'th',
                text: col,
                style: {
                    padding: '16px 12px',
                    textAlign: 'left',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: '#1a1a1a'
                }
            }))
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        tableBody = $({ tag: 'tbody' })
        table.appendChild(tableBody)
        tableContainer.appendChild(table)

        container.appendChild(searchContainer)
        container.appendChild(tableContainer)

        return container
    }

    const setTableMessage = (iconClass, mainText, subText = '') => {
        if (!tableBody) return
        tableBody.innerHTML = ''
        const row = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 6 },
                    style: { padding: '60px', textAlign: 'center', color: '#666' },
                    child: [
                        $({ tag: 'i', att: { className: iconClass }, style: { fontSize: '40px', display: 'block', marginBottom: '14px' } }),
                        $({ tag: 'div', text: mainText, style: { fontSize: '16px', marginBottom: '6px', color: '#888' } }),
                        ...(subText ? [$({ tag: 'div', text: subText, style: { fontSize: '13px', color: '#555' } })] : [])
                    ]
                })
            ]
        })
        tableBody.appendChild(row)
    }

    const createFileTag = (fileInfo, docId, fileType, fileUrl, presenter) => {
        const fileName = fileInfo.title || fileInfo.name || 'Untitled'
        const isDriveFile = fileUrl && (fileUrl.includes('drive.google.com') || fileUrl.includes('drive.google.com/file/d/'));
        const iconClass = isDriveFile ? 'fab fa-google-drive' : 'fas fa-file-pdf';
        const iconColor = isDriveFile ? '#0F9D58' : '#f44336';

        const tag = $({
            tag: 'div',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2a2a2a',
                padding: '6px 12px',
                borderRadius: '6px',
                margin: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            att: {
                title: `${fileName} | Presenter: ${presenter || 'Not specified'} | Type: ${isDriveFile ? 'Google Drive' : 'Local PDF'}`
            },
            event: {
                type: 'click',
                method: async () => {
                    let loading = Waiting()
                    document.body.appendChild(loading)
                    const remove = () => {
                        if (loading && loading.remove) loading.remove()
                    }

                    const form = new FormData()
                    form.append("checkAccess", "true")
                    form.append("docId", docId)

                    try {
                        const response = await fetch('/requestDocs', {
                            method: 'POST',
                            body: form
                        })

                        if (response.ok) {
                            const dat = await response.json()
                            remove()

                            if (dat.status === 'allowed') {
                                if (fileUrl && (fileUrl.includes('drive.google.com') || fileUrl.includes('drive.google.com/file/d/'))) {
                                    let embedUrl = fileUrl
                                    if (fileUrl.includes('/file/d/')) {
                                        const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
                                        if (fileIdMatch && fileIdMatch[1]) {
                                            embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
                                        }
                                    }
                                    FileViewerModal(embedUrl, fileName, '#ff9800', { showOpenDrive: true })
                                } else if (fileUrl) {
                                    FileViewerModal(fileUrl, fileName, '#ff9800', { showOpenDrive: false })
                                } else {
                                    AlertModal({ title: 'Error', message: 'File URL not available' })
                                }
                            } else if (dat.status === 'requested') {
                                document.body.appendChild(ConfirmationAlert("Request was sent. Please wait for the response..!", () => {
                                    window.location.reload()
                                }))
                            } else {
                                setTimeout(() => {
                                    if (confirm("You don't have permission to open this file.\nDo you want to send a request?")) {
                                        const req = new Request('/requestDocs')
                                        const formReq = []
                                        formReq.push({ name: 'sendRequest', value: 'true' })
                                        formReq.push({ name: 'docId', value: docId })
                                        req.Post(formReq)
                                        req.Json()
                                        req.Send().then(data => {
                                            document.body.appendChild(ConfirmationAlert(data.message, () => {
                                                window.location.reload()
                                            }))
                                        })
                                    }
                                }, 50)
                            }
                        } else {
                            remove()
                            AlertModal({ title: 'Error', message: 'Error checking access. Please try again.' })
                        }
                    } catch (error) {
                        remove()
                        console.error('Error checking access:', error)
                        AlertModal({ title: 'Error', message: 'Error checking file access. Please try again.' })
                    }
                }
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: iconClass },
                    style: { color: iconColor, fontSize: '14px' }
                }),
                $({
                    tag: 'span',
                    text: fileName.length > 50 ? fileName.substring(0, 47) + '...' : fileName,
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                })
            ]
        })

        return tag
    }

    const loadEventList = async (paperType = '') => {
        if (!eventSelect) return

        eventSelect.disabled = true
        eventSelect.innerHTML = ''

        const loadingOption = $({
            tag: 'option',
            text: 'Loading events...',
            att: { value: '', disabled: true }
        })
        eventSelect.appendChild(loadingOption)

        try {
            const formData = new FormData()
            formData.append('getStudentResearchPapersByEvent', 'true')
            formData.append('paper_type', paperType)

            const response = await fetch('/uploadResearchChair', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const data = await response.json()
            eventSelect.innerHTML = ''

            let events = []
            if (data.events && Array.isArray(data.events)) {
                events = data.events
            } else if (data.list && Array.isArray(data.list)) {
                events = data.list
            } else if (Array.isArray(data)) {
                events = data
            }

            if (!Array.isArray(events) || events.length === 0) {
                const noEventsOption = $({
                    tag: 'option',
                    text: `No ${paperType === 'undergraduate' ? 'Undergraduate' : 'Graduate'} symposium events available`,
                    att: { value: '', disabled: true }
                })
                eventSelect.appendChild(noEventsOption)
                setTableMessage('fas fa-calendar-times', `No ${paperType === 'undergraduate' ? 'Undergraduate' : 'Graduate'} symposium events found`)
                return
            }

            const defaultOption = $({
                tag: 'option',
                text: `-- Select ${paperType === 'undergraduate' ? 'Undergraduate' : 'Graduate'} Symposium Event --`,
                att: { value: '', disabled: true, selected: true }
            })
            eventSelect.appendChild(defaultOption)

            events.forEach(ev => {
                let optionText = ev.name
                if (ev.dead_line) {
                    const deadlineDate = new Date(ev.dead_line)
                    const today = new Date()
                    const isExpired = deadlineDate < today
                    optionText += isExpired ? ' (Expired)' : ` (Deadline: ${deadlineDate.toLocaleDateString()})`
                }

                const option = $({
                    tag: 'option',
                    text: optionText,
                    att: {
                        value: ev.id,
                        'data-deadline': ev.dead_line || '',
                        'data-expired': ev.dead_line && new Date(ev.dead_line) < new Date() ? 'true' : 'false'
                    }
                })

                if (ev.dead_line && new Date(ev.dead_line) < new Date()) {
                    option.style.color = '#f44336'
                }

                eventSelect.appendChild(option)
            })

            const firstActiveEvent = events.find(ev => {
                if (!ev.dead_line) return true
                return new Date(ev.dead_line) >= new Date()
            })

            if (firstActiveEvent) {
                eventSelect.value = firstActiveEvent.id
                const changeEvent = new Event('change')
                eventSelect.dispatchEvent(changeEvent)
            }

        } catch (err) {
            eventSelect.innerHTML = ''
            const errOption = $({
                tag: 'option',
                text: 'Failed to load events',
                att: { value: '', disabled: true }
            })
            eventSelect.appendChild(errOption)
            setTableMessage('fas fa-exclamation-triangle', 'Could not load event list', err.message)
        } finally {
            eventSelect.disabled = false
        }
    }

    const loadResearchData = async (eventId, searchTerm = '', paperType = 'undergraduate') => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        const loadingRow = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 6 },
                    style: { padding: '40px', textAlign: 'center', color: '#666' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                        $({ tag: 'div', text: searchTerm ? `Searching for "${searchTerm}"...` : `Loading ${paperType === 'undergraduate' ? 'Undergraduate' : 'Graduate'} research papers...`, style: { fontSize: '14px' } })
                    ]
                })
            ]
        })
        tableBody.appendChild(loadingRow)

        try {
            const formData = new FormData()
            formData.append('getStudentResearchPapersByEvent', 'true')
            formData.append('eventId', eventId)
            formData.append('paper_type', paperType)
            if (searchTerm) {
                formData.append('search', searchTerm)
            }

            const response = await fetch('/uploadResearchChair', {
                method: 'POST',
                body: formData
            })

            loadingRow.remove()

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const data = await response.text().then(text => text ? JSON.parse(text) : {})

            if (data.status === false && (!data.list || data.list.length === 0)) {
                throw new Error(data.message || 'Server returned an error')
            }

            if (data.list && data.list.length > 0) {
                data.list.forEach(research => {
                    const row = $({
                        tag: 'tr',
                        style: { borderBottom: '1px solid rgba(255,255,255,0.05)' }
                    })

                    const eventCell = $({
                        tag: 'td',
                        text: research.eventName || research.event || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top', fontWeight: '500' }
                    })

                    const campusCell = $({
                        tag: 'td',
                        text: research.campus || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    const authorCell = $({
                        tag: 'td',
                        text: research.author || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    const titleCell = $({
                        tag: 'td',
                        text: research.title || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    const paperTypeCell = $({
                        tag: 'td',
                        style: { padding: '16px 12px', verticalAlign: 'top' }
                    })

                    const paperTypeBadge = $({
                        tag: 'span',
                        text: research.paper_type === 'undergraduate' ? '🎓 Undergraduate' : '🎓 Graduate',
                        style: {
                            backgroundColor: research.paper_type === 'undergraduate' ? '#2196F3' : '#9C27B0',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '500',
                            display: 'inline-block'
                        }
                    })
                    paperTypeCell.appendChild(paperTypeBadge)

                    const filesCell = $({
                        tag: 'td',
                        style: { padding: '16px 12px', verticalAlign: 'top' }
                    })

                    const researchTag = createFileTag(
                        research.researchFile,
                        'Research Paper',
                        'research',
                        '#2196F3'
                    )
                    if (researchTag) filesCell.appendChild(researchTag)

                    const endorsementTag = createFileTag(
                        research.endorsementFile,
                        'Endorsement Letter',
                        'endorsement',
                        '#ff9800'
                    )
                    if (endorsementTag) filesCell.appendChild(endorsementTag)

                    if (!researchTag && !endorsementTag) {
                        filesCell.appendChild($({ tag: 'span', text: 'No files', style: { color: '#666', fontSize: '12px' } }))
                    }

                    row.appendChild(eventCell)
                    row.appendChild(campusCell)
                    row.appendChild(authorCell)
                    row.appendChild(titleCell)
                    row.appendChild(paperTypeCell)
                    row.appendChild(filesCell)
                    tableBody.appendChild(row)
                })

                if (searchTerm && data.list.length === 0) {
                    setTableMessage('fas fa-search', 'No matching results found', `No documents match "${searchTerm}"`)
                }
            } else {
                if (searchTerm) {
                    setTableMessage('fas fa-search', 'No matching results found', `No documents match "${searchTerm}"`)
                } else {
                    setTableMessage('fas fa-folder-open', `No ${paperType === 'undergraduate' ? 'Undergraduate' : 'Graduate'} research papers available`, 'Student papers will appear here once submitted')
                }
            }

        } catch (error) {
            console.error('Error loading research data:', error)
            loadingRow.remove && loadingRow.remove()

            tableBody.innerHTML = ''
            const errorRow = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        att: { colSpan: 6 },
                        style: { padding: '40px', textAlign: 'center', color: '#ff6b6b' },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                            $({ tag: 'div', text: 'Failed to load research papers', style: { fontSize: '16px', marginBottom: '8px' } }),
                            $({ tag: 'div', text: error.message, style: { fontSize: '12px', opacity: 0.7 } }),
                            $({
                                tag: 'button',
                                text: 'Retry',
                                style: { marginTop: '16px', padding: '8px 16px', backgroundColor: '#444', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        tableBody.innerHTML = ''
                                        loadResearchData(eventId, searchTerm, paperType)
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
            tableBody.appendChild(errorRow)
        }
    }

    loadResearchDataFn = loadResearchData

    const wireEvents = () => {
        if (eventSelect) {
            eventSelect.addEventListener('change', (e) => {
                const selectedId = parseInt(e.target.value)
                if (!selectedId) return
                if (searchInput) searchInput.value = ''
                const paperType = paperTypeSelect?.value || 'undergraduate'
                loadResearchDataFn(selectedId, '', paperType)
            })
        }

        if (paperTypeSelect) {
            paperTypeSelect.addEventListener('change', async (e) => {
                const paperType = e.target.value
                await loadEventList(paperType)
            })
        }
    }

    const content = buildContent()
    wireEvents()

    currentModal = CustomModal({
        title: 'Student Research Papers from All Campuses',
        content: content,
        size: 'large',
        onClose: () => {
            currentModal = null
        }
    })

    setTimeout(() => {
        loadEventList('undergraduate')
    }, 100)
}

// ============== RESEARCH CHAIR SUBMISSION MODAL ==============
export const ResearchChairSubmissionModal = (options = {}) => {
    const { eventName, eventId, paperType, onClose, onSuccess } = options

    // Set the current paper type
    currentPaperType = paperType || 'undergraduate'

    // Reset form data
    formData = {
        eventName: eventName || '',
        title: '',
        campus: '',
        category: '',
        presenter: '',
        author: '',
        coAuthors: [],
        paperType: currentPaperType,
        researchFile: null,
        endorsementFile: null
    }

    // Create the modal
    const modalElement = $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }
    })

    const modalContent = $({
        tag: 'div',
        style: {
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '95%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
        }
    })

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '20px 28px',
            borderBottom: '1px solid #e8ecf0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            backgroundColor: '#ffffff'
        },
        child: [
            $({
                tag: 'div',
                child: [
                    $({
                        tag: 'h2',
                        text: paperType === 'undergraduate'
                            ? `Undergraduate Symposium: ${eventName || 'Submission'}`
                            : `Graduate Symposium: ${eventName || 'Submission'}`,
                        style: { color: '#1a2a3a', margin: 0, fontSize: '20px', fontWeight: '600' }
                    }),
                    $({
                        tag: 'span',
                        text: paperType === 'undergraduate' ? '🎓 Undergraduate Level' : '🎓 Graduate Level',
                        style: {
                            display: 'inline-block',
                            backgroundColor: paperType === 'undergraduate' ? '#E3F2FD' : '#F3E5F5',
                            color: paperType === 'undergraduate' ? '#1976D2' : '#7B1FA2',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            marginTop: '4px',
                            fontWeight: '500'
                        }
                    })
                ]
            }),
            $({
                tag: 'i',
                att: { className: 'fas fa-times' },
                style: { color: '#94a3b8', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s ease' },
                event: {
                    type: 'click',
                    method: () => {
                        modalElement.remove()
                        if (onClose) onClose()
                    },
                    type2: 'mouseenter',
                    method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                    type3: 'mouseleave',
                    method3: (e) => { e.currentTarget.style.color = '#94a3b8' }
                }
            })
        ]
    })

    // Body - contains the form
    const body = $({
        tag: 'div',
        style: {
            flex: 1,
            overflow: 'auto',
            padding: '0'
        },
        att: { id: 'researchChairModalBody' }
    })

    // Build the form content
    const formContent = createStudentSymposiumFormContent()
    body.appendChild(formContent)

    // Footer
    const footer = $({
        tag: 'div',
        style: {
            padding: '16px 28px',
            borderTop: '1px solid #e8ecf0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexShrink: 0,
            backgroundColor: '#ffffff'
        }
    })

    const cancelBtn = $({
        tag: 'button',
        text: 'Cancel',
        style: {
            padding: '10px 24px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '10px',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'click',
            method: () => {
                modalElement.remove()
                if (onClose) onClose()
            },
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e8ecf0';
            }
        }
    })

    const submitBtn = $({
        tag: 'button',
        text: 'Submit Paper',
        style: {
            padding: '10px 28px',
            backgroundColor: currentPaperType === 'undergraduate' ? '#1976D2' : '#7B1FA2',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        event: {
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.backgroundColor = currentPaperType === 'undergraduate' ? '#1565C0' : '#6A1B9A';
                e.currentTarget.style.transform = 'translateY(-1px)';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.backgroundColor = currentPaperType === 'undergraduate' ? '#1976D2' : '#7B1FA2';
                e.currentTarget.style.transform = 'translateY(0)';
            }
        }
    })

    submitBtn.addEventListener('click', async () => {
        // Validate required fields
        if (!formData.eventName) {
            AlertModal({ title: 'Required', message: 'Please select an event' })
            return
        }
        if (!formData.title) {
            AlertModal({ title: 'Required', message: 'Please enter a research title' })
            return
        }
        if (!formData.campus) {
            AlertModal({ title: 'Required', message: 'Please select a campus' })
            return
        }
        if (!formData.category) {
            AlertModal({ title: 'Required', message: 'Please select a category' })
            return
        }
        if (!formData.author) {
            AlertModal({ title: 'Required', message: 'Please enter main author' })
            return
        }
        if (!formData.presenter) {
            AlertModal({ title: 'Required', message: 'Please enter presenter' })
            return
        }
        if (!formData.researchFile) {
            AlertModal({ title: 'Required', message: 'Please upload the research paper (PDF)' })
            return
        }
        if (!formData.endorsementFile) {
            AlertModal({ title: 'Required', message: 'Please upload the endorsement letter (PDF)' })
            return
        }

        const submitFormData = new FormData()
        if (formData.paperType === 'graduate') {
            submitFormData.append('uploadGraduateSymposium', 'true')
        } else {
            submitFormData.append('uploadUndergraduateSymposium', 'true')
        }
        submitFormData.append('eventType', formData.eventName)
        submitFormData.append('title', formData.title)
        submitFormData.append('author', formData.author)
        submitFormData.append('category', formData.category)
        submitFormData.append('campus', formData.campus)
        submitFormData.append('coAuthor', JSON.stringify(formData.coAuthors))
        submitFormData.append('presenter', formData.presenter)
        submitFormData.append('paper_type', formData.paperType)

        if (formData.researchFile) {
            submitFormData.append('researchDoc', formData.researchFile)
        }
        if (formData.endorsementFile) {
            submitFormData.append('endorsementDoc', formData.endorsementFile)
        }

        const loading = Waiting()
        document.body.appendChild(loading)

        try {
            const response = await fetch('/uploadResearchChair', {
                method: 'POST',
                body: submitFormData
            })

            const result = await response.json()

            if (loading && loading.remove) loading.remove()

            if (result.status) {
                modalElement.remove()
                const alertResult = ConfirmationAlert(result.message || 'Paper submitted successfully!', () => {
                    if (onSuccess) onSuccess()
                    if (window.refreshDocumentsTable) {
                        window.refreshDocumentsTable()
                    }
                })
                document.body.appendChild(alertResult.element)
            } else {
                AlertModal({ title: 'Submission Failed', message: result.message || 'An error occurred during submission.' })
            }
        } catch (error) {
            if (loading && loading.remove) loading.remove()
            console.error('Submission error:', error)
            AlertModal({ title: 'Error', message: 'Error submitting form: ' + error.message })
        }
    })

    footer.appendChild(cancelBtn)
    footer.appendChild(submitBtn)

    modalContent.appendChild(header)
    modalContent.appendChild(body)
    modalContent.appendChild(footer)
    modalElement.appendChild(modalContent)
    document.body.appendChild(modalElement)

    // Return the modal element
    return modalElement
}

// ============== CREATE STUDENT SYMPOSIUM FORM CONTENT ==============
function createStudentSymposiumFormContent() {
    let titleInput, categorySelect, authorInput, presenterInput, coAuthorInput, coAuthorList, campusSelect, paperTypeDisplay

    const container = $({ tag: 'div', style: { display: 'block' }, att: { id: 'studentSymposiumFormContainer' } })

    const formBody = $({
        tag: 'div',
        style: { padding: '28px' }
    })

    // Event selection - Display only (read-only)
    const eventField = $({ tag: 'div', style: { marginBottom: '20px' } })
    eventField.appendChild($({
        tag: 'label',
        text: 'Event Name *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))

    const eventDisplayContainer = $({
        tag: 'div',
        style: {
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }
    })

    const eventIcon = $({
        tag: 'i',
        att: { className: 'fas fa-calendar-alt' },
        style: { color: '#1976D2', fontSize: '16px' }
    })

    const eventNameSpan = $({
        tag: 'span',
        text: formData.eventName || 'Loading...',
        att: { id: 'selectedEventName' },
        style: { flex: 1, fontWeight: '500' }
    })

    eventDisplayContainer.appendChild(eventIcon)
    eventDisplayContainer.appendChild(eventNameSpan)
    eventField.appendChild(eventDisplayContainer)

    formBody.appendChild(eventField)

    // Two column layout
    const twoColumnLayout = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
        }
    })

    // Title field
    const titleField = $({ tag: 'div', style: { marginBottom: '0' } })
    titleField.appendChild($({
        tag: 'label',
        text: 'Research Title *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    titleInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter research title' },
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'focus',
            method: (e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.outline = 'none';
            },
            type2: 'blur',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'input',
            method3: (e) => {
                formData.title = capitalizeFirstLetter(e.target.value)
                e.target.value = formData.title
            }
        }
    })
    titleField.appendChild(titleInput)

    // Campus field
    const campusField = $({ tag: 'div', style: { marginBottom: '0' } })
    campusField.appendChild($({
        tag: 'label',
        text: 'Campus *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    campusSelect = $({
        tag: 'select',
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'mouseenter',
            method: (e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f1f5f9';
            },
            type2: 'mouseleave',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'change',
            method3: (e) => { formData.campus = e.target.value }
        },
        elementHandler: (el) => {
            el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
            campuses.forEach(campus => {
                el.appendChild($({ tag: 'option', text: campus, att: { value: campus }, style: { color: '#1a2a3a' } }))
            })
        }
    })
    campusField.appendChild(campusSelect)

    // Category field
    const categoryField = $({ tag: 'div', style: { marginBottom: '0' } })
    categoryField.appendChild($({
        tag: 'label',
        text: 'Research Category *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    categorySelect = $({
        tag: 'select',
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'mouseenter',
            method: (e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f1f5f9';
            },
            type2: 'mouseleave',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'change',
            method3: (e) => { formData.category = e.target.value }
        },
        elementHandler: (el) => {
            el.innerHTML = ''
            el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
            const categories = currentPaperType === 'undergraduate' ? undergraduateCategories : graduateCategories
            categories.forEach(cat => {
                el.appendChild($({ tag: 'option', text: cat, att: { value: cat }, style: { color: '#1a2a3a' } }))
            })
        }
    })
    categoryField.appendChild(categorySelect)

    // Paper Type display (read-only)
    const paperTypeField = $({ tag: 'div', style: { marginBottom: '0' } })
    paperTypeField.appendChild($({
        tag: 'label',
        text: 'Paper Type',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    paperTypeDisplay = $({
        tag: 'div',
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: currentPaperType === 'undergraduate' ? '#E3F2FD' : '#F3E5F5',
            border: `1px solid ${currentPaperType === 'undergraduate' ? '#1976D2' : '#7B1FA2'}`,
            borderRadius: '12px',
            color: currentPaperType === 'undergraduate' ? '#1976D2' : '#7B1FA2',
            fontSize: '14px',
            fontWeight: '600'
        },
        text: currentPaperType === 'undergraduate' ? '🎓 Undergraduate' : '🎓 Graduate'
    })
    paperTypeField.appendChild(paperTypeDisplay)

    // Author field
    const authorField = $({ tag: 'div', style: { marginBottom: '0' } })
    authorField.appendChild($({
        tag: 'label',
        text: 'Main Author *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    authorInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter main author name' },
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'focus',
            method: (e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.outline = 'none';
            },
            type2: 'blur',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'input',
            method3: (e) => {
                formData.author = capitalizeFirstLetter(e.target.value)
                e.target.value = formData.author
            }
        }
    })
    authorField.appendChild(authorInput)

    // Presenter field
    const presenterField = $({ tag: 'div', style: { marginBottom: '0' } })
    presenterField.appendChild($({
        tag: 'label',
        text: 'Presenter *',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))
    presenterInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter presenter name' },
        style: {
            width: '100%',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'focus',
            method: (e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.outline = 'none';
            },
            type2: 'blur',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'input',
            method3: (e) => {
                formData.presenter = capitalizeFirstLetter(e.target.value)
                e.target.value = formData.presenter
            }
        }
    })
    presenterField.appendChild(presenterInput)

    // Co-authors field
    const coAuthorField = $({ tag: 'div', style: { marginBottom: '0' } })
    coAuthorField.appendChild($({
        tag: 'label',
        text: 'Co-Authors',
        style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))

    const coAuthorInputGroup = $({
        tag: 'div',
        style: { display: 'flex', gap: '10px', marginBottom: '12px' }
    })

    coAuthorInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter co-author name' },
        style: {
            flex: 1,
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'focus',
            method: (e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.outline = 'none';
            },
            type2: 'blur',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            },
            type3: 'input',
            method3: (e) => {
                e.target.value = capitalizeFirstLetter(e.target.value)
            }
        }
    })

    const addCoAuthorBtn = $({
        tag: 'button',
        text: 'Add',
        style: {
            padding: '8px 20px',
            backgroundColor: '#1976D2',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        event: {
            type: 'click',
            method: () => {
                const name = coAuthorInput.value.trim()
                if (name) {
                    formData.coAuthors.push(name)
                    updateCoAuthorList()
                    coAuthorInput.value = ''
                }
            },
            type2: 'mouseenter',
            method2: (e) => { e.currentTarget.style.backgroundColor = '#1565C0' },
            type3: 'mouseleave',
            method3: (e) => { e.currentTarget.style.backgroundColor = '#1976D2' }
        }
    })

    coAuthorInputGroup.appendChild(coAuthorInput)
    coAuthorInputGroup.appendChild(addCoAuthorBtn)

    coAuthorList = $({
        tag: 'div',
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }
    })

    const updateCoAuthorList = () => {
        coAuthorList.innerHTML = ''
        formData.coAuthors.forEach((author, idx) => {
            const tag = $({
                tag: 'div',
                style: {
                    backgroundColor: '#E8F5E9',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                },
                child: [
                    $({ tag: 'span', text: author, style: { color: '#2E7D32', fontWeight: '500' } }),
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-times' },
                        style: { color: '#64748b', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
                        event: {
                            type: 'click',
                            method: () => {
                                formData.coAuthors.splice(idx, 1)
                                updateCoAuthorList()
                            },
                            type2: 'mouseenter',
                            method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                            type3: 'mouseleave',
                            method3: (e) => { e.currentTarget.style.color = '#64748b' }
                        }
                    })
                ]
            })
            coAuthorList.appendChild(tag)
        })
    }

    coAuthorField.appendChild(coAuthorInputGroup)
    coAuthorField.appendChild(coAuthorList)

    // Add fields to two column layout
    twoColumnLayout.appendChild(titleField)
    twoColumnLayout.appendChild(campusField)
    twoColumnLayout.appendChild(categoryField)
    twoColumnLayout.appendChild(paperTypeField)
    twoColumnLayout.appendChild(authorField)
    twoColumnLayout.appendChild(presenterField)
    twoColumnLayout.appendChild(coAuthorField)

    formBody.appendChild(twoColumnLayout)

    // File upload sections
    const fileSection = $({
        tag: 'div',
        style: {
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e8ecf0'
        }
    })

    fileSection.appendChild($({
        tag: 'h4',
        text: 'Attachments',
        style: { color: '#1a2a3a', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }
    }))

    const fileGrid = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
        }
    })

    fileGrid.appendChild(FileUploadField({ label: 'Research Paper (PDF) *', fieldName: 'researchFile' }))
    fileGrid.appendChild(FileUploadField({ label: 'Endorsement Letter (PDF) *', fieldName: 'endorsementFile' }))
    fileSection.appendChild(fileGrid)

    formBody.appendChild(fileSection)
    container.appendChild(formBody)

    return container
}

// ============== FILE UPLOAD FIELD HELPER ==============
function FileUploadField({ label, fieldName }) {
    const container = $({ tag: 'div', style: { marginBottom: '0' } })
    container.appendChild($({
        tag: 'label', text: label, style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
    }))

    const uploadArea = $({
        tag: 'div',
        style: {
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: '#f8fafc'
        },
        event: {
            type: 'click',
            method: () => fileInput.click(),
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#1976D2';
                e.currentTarget.style.backgroundColor = '#f1f5f9';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
            }
        }
    })

    uploadArea.appendChild($({ tag: 'i', att: { className: 'fas fa-cloud-upload-alt' }, style: { fontSize: '36px', color: '#1976D2', marginBottom: '12px', display: 'block' } }))
    uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' } }))
    uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#64748b', fontSize: '12px', marginTop: '6px' } }))

    const fileNameDisplay = $({ tag: 'div', style: { marginTop: '12px', fontSize: '13px', color: '#2E7D32', textAlign: 'center', fontWeight: '500' } })

    const fileInput = $({
        tag: 'input',
        att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
        event: {
            type: 'change',
            method: (e) => {
                const file = e.target.files[0]
                if (file) {
                    if (file.type !== 'application/pdf') {
                        AlertModal({ title: 'Invalid File', message: 'Please select a valid PDF file' })
                        fileInput.value = ''
                        return
                    }
                    if (file.size > 10 * 1024 * 1024) {
                        AlertModal({ title: 'File Too Large', message: 'File size exceeds 10MB limit' })
                        fileInput.value = ''
                        return
                    }
                    formData[fieldName] = file
                    fileNameDisplay.innerText = `✓ ${file.name}`
                }
            }
        }
    })

    container.appendChild(uploadArea)
    container.appendChild(fileNameDisplay)
    container.appendChild(fileInput)

    return container
}

// ============== ORIGINAL FULL PAGE VERSION (for backward compatibility) ==============
export const ResearchChairSubmission = () => {
    // This is the original full page version
    const container = $({
        tag: 'div',
        att: { className: 'research-chair-main-container' },
        style: {
            padding: '0',
            backgroundColor: 'transparent',
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }
    })

    // Paper Type Tabs
    const tabsContainer = $({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e8ecf0',
            padding: '6px',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }
    })

    const undergraduateTab = $({
        tag: 'button',
        style: {
            flex: 1,
            padding: '12px 24px',
            backgroundColor: currentPaperType === 'undergraduate' ? '#2196F3' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: currentPaperType === 'undergraduate' ? '#fff' : '#888',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-user-graduate' }, style: { fontSize: '16px' } }),
            $({ tag: 'span', text: 'Undergraduate' })
        ],
        event: {
            type: 'click',
            method: () => {
                currentPaperType = 'undergraduate'
                // Re-render
                const mainContainer = document.querySelector('.research-chair-main-container')
                if (mainContainer) {
                    mainContainer.innerHTML = ''
                    const newUI = ResearchChairSubmission()
                    mainContainer.appendChild(newUI)
                }
                if (window.refreshDocumentsTable) {
                    window.refreshDocumentsTable()
                }
            }
        }
    })

    const graduateTab = $({
        tag: 'button',
        style: {
            flex: 1,
            padding: '12px 24px',
            backgroundColor: currentPaperType === 'graduate' ? '#9C27B0' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: currentPaperType === 'graduate' ? '#fff' : '#888',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
        },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-graduation-cap' }, style: { fontSize: '16px' } }),
            $({ tag: 'span', text: 'Graduate' })
        ],
        event: {
            type: 'click',
            method: () => {
                currentPaperType = 'graduate'
                const mainContainer = document.querySelector('.research-chair-main-container')
                if (mainContainer) {
                    mainContainer.innerHTML = ''
                    const newUI = ResearchChairSubmission()
                    mainContainer.appendChild(newUI)
                }
                if (window.refreshDocumentsTable) {
                    window.refreshDocumentsTable()
                }
            }
        }
    })

    tabsContainer.appendChild(undergraduateTab)
    tabsContainer.appendChild(graduateTab)
    container.appendChild(tabsContainer)

    // Add a "Submit Paper" button that opens the modal
    const header = $({
        tag: 'div',
        style: {
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
        }
    })

    const titleSection = $({
        tag: 'div',
        child: [
            $({ tag: 'h1', text: currentPaperType === 'undergraduate' ? 'Undergraduate Research Papers' : 'Graduate Research Papers', style: { color: '#1a2a3a', fontSize: '30px', margin: 0, marginBottom: '8px', fontWeight: '700' } }),
            $({ tag: 'p', text: currentPaperType === 'undergraduate' ? 'Submit and track undergraduate student research papers for symposium events' : 'Submit and track graduate student research papers for symposium events', style: { color: '#64748b', fontSize: '14px', margin: 0 } })
        ]
    })

    const buttonGroup = $({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '12px'
        }
    })

    const uploadBtn = $({
        tag: 'button',
        style: {
            backgroundColor: '#ffffff',
            border: '1px solid #e8ecf0',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#1a2a3a',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-plus' }, style: { fontSize: '14px', color: currentPaperType === 'undergraduate' ? '#1976D2' : '#7B1FA2' } }),
            $({ tag: 'span', text: 'Submit Paper' })
        ],
        event: {
            type: 'click',
            method: () => {
                // Open the modal version
                ResearchChairSubmissionModal({
                    eventName: 'Select Event',
                    eventId: null,
                    paperType: currentPaperType,
                    onSuccess: () => {
                        if (window.refreshDocumentsTable) {
                            window.refreshDocumentsTable()
                        }
                    }
                })
            },
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(-2px)';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e8ecf0';
                e.currentTarget.style.transform = 'translateY(0)';
            }
        }
    })

    const viewResearchesBtn = $({
        tag: 'button',
        style: {
            backgroundColor: '#1976D2',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
        },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-table-list' }, style: { fontSize: '14px' } }),
            $({ tag: 'span', text: 'View All Papers' })
        ],
        event: {
            type: 'click',
            method: () => openViewResearchesModal(),
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.backgroundColor = '#1565C0';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(25, 118, 210, 0.3)';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.backgroundColor = '#1976D2';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(25, 118, 210, 0.2)';
            }
        }
    })

    buttonGroup.appendChild(uploadBtn)
    buttonGroup.appendChild(viewResearchesBtn)
    header.appendChild(titleSection)
    header.appendChild(buttonGroup)
    container.appendChild(header)

    // Stats cards
    const statsContainer = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
        },
        att: { className: 'stats-container' }
    })

    const stats = [
        { label: 'Total Papers', value: '0', icon: 'fa-file-alt', color: '#2196F3' },
        { label: 'Pending Review', value: '0', icon: 'fa-clock', color: '#FF9800' },
        { label: 'Approved', value: '0', icon: 'fa-check-circle', color: '#4CAF50' },
        { label: 'Rejected', value: '0', icon: 'fa-times-circle', color: '#f44336' }
    ]

    stats.forEach((stat, index) => {
        const card = $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px 20px',
                border: '1px solid #e8ecf0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = stat.color;
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#e8ecf0';
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
                    child: [
                        $({ tag: 'span', text: stat.label, style: { color: '#475569', fontSize: '14px', fontWeight: '500' } }),
                        $({
                            tag: 'div',
                            style: {
                                backgroundColor: `${stat.color}10`,
                                borderRadius: '12px',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            child: [
                                $({ tag: 'i', att: { className: `fas ${stat.icon}` }, style: { color: stat.color, fontSize: '20px' } })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: stat.value,
                    style: { color: '#1a2a3a', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' },
                    att: { className: 'stat-value' }
                }),
                $({
                    tag: 'div',
                    style: { marginTop: '12px' },
                    child: [
                        $({
                            tag: 'span',
                            text: index === 0 ? 'Total submissions' : index === 1 ? 'Awaiting review' : index === 2 ? 'Approved papers' : 'Returned for revision',
                            style: { color: '#94a3b8', fontSize: '12px', fontWeight: '400' }
                        })
                    ]
                })
            ]
        })
        statsContainer.appendChild(card)
    })
    container.appendChild(statsContainer)

    // Table
    const tableContainer = $({
        tag: 'div',
        style: {
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            overflow: 'auto',
            border: '1px solid #e8ecf0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }
    })

    const table = $({
        tag: 'table',
        style: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1400px'
        },
        elementHandler: (el) => { documentsTable = el }
    })

    const thead = $({ tag: 'thead' })
    const headerRow = $({ tag: 'tr', style: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf0' } })
    const columns = ['Event', 'Status', 'Title', 'Category', 'Presenter', 'Author', 'Co-Authors', 'Campus', 'Type', 'Attachments', 'Actions']

    columns.forEach(col => {
        headerRow.appendChild($({
            tag: 'th',
            text: col,
            style: {
                padding: '18px 16px',
                textAlign: 'left',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
            }
        }))
    })

    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = $({ tag: 'tbody' })
    table.appendChild(tbody)

    tableContainer.appendChild(table)
    container.appendChild(tableContainer)

    // Load documents
    const loadDocuments = async () => {
        try {
            tbody.innerHTML = ''
            const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } })
            const loadingCell = $({
                tag: 'td',
                att: { colSpan: columns.length },
                style: { padding: '60px', textAlign: 'center', color: '#64748b' }
            })
            loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px', color: '#1976D2' } }))
            loadingCell.appendChild($({ tag: 'div', text: `Loading ${currentPaperType === 'undergraduate' ? 'undergraduate' : 'graduate'} research papers...`, style: { fontSize: '14px' } }))
            loadingRow.appendChild(loadingCell)
            tbody.appendChild(loadingRow)

            const form = new FormData()
            form.append('getStudentResearchPapers', 'true')
            form.append('paper_type', currentPaperType)

            const response = await fetch('/uploadResearchChair', {
                method: 'POST',
                body: form
            })

            if (response.ok) {
                const data = await response.text().then(text => text ? JSON.parse(text) : {})
                tbody.innerHTML = ''

                if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                    let totalDocs = data.list.length
                    let pendingCount = 0
                    let approvedCount = 0
                    let rejectedCount = 0

                    data.list.forEach(research => {
                        let coAuthors = research.coAuthors || []
                        if (typeof coAuthors === 'string') {
                            try {
                                coAuthors = JSON.parse(coAuthors)
                            } catch (e) {
                                coAuthors = []
                            }
                        }

                        const status = (research.status || '').toLowerCase()
                        if (status === 'pending') pendingCount++
                        else if (status === 'approved') approvedCount++
                        else if (status === 'rejected') rejectedCount++

                        const row = createTableRow({
                            id: research.id,
                            eventName: research.eventName || research.event,
                            title: research.title,
                            category: research.category,
                            presenter: research.presenter,
                            author: research.author,
                            coAuthors: coAuthors,
                            campus: research.campus,
                            paper_type: research.paper_type,
                            status: research.status,
                            researchFile: research.researchFile,
                            researchDownloadUrl: research.researchDownloadUrl,
                            endorsementFile: research.endorsementFile,
                            endorsementDownloadUrl: research.endorsementDownloadUrl
                        })
                        tbody.appendChild(row)
                    })

                    updateStatsFromData(totalDocs, pendingCount, approvedCount, rejectedCount)
                } else {
                    showEmptyState()
                    updateStatsFromData(0, 0, 0, 0)
                }
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
        } catch (error) {
            console.error('Error loading documents:', error)
            tbody.innerHTML = ''
            const errorRow = $({ tag: 'tr' })
            const errorCell = $({
                tag: 'td',
                att: { colSpan: columns.length },
                style: { padding: '60px', textAlign: 'center', color: '#f44336' }
            })
            errorCell.appendChild($({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px' } }))
            errorCell.appendChild($({ tag: 'div', text: 'Error loading documents', style: { fontSize: '16px', marginBottom: '8px' } }))
            errorCell.appendChild($({ tag: 'div', text: error.message, style: { fontSize: '14px' } }))
            errorRow.appendChild(errorCell)
            tbody.appendChild(errorRow)
        }
    }

    const showEmptyState = () => {
        tbody.innerHTML = ''
        const emptyRow = $({ tag: 'tr', att: { className: 'empty-state-row' } })
        const emptyCell = $({
            tag: 'td',
            att: { colSpan: columns.length },
            style: { padding: '60px', textAlign: 'center', color: '#94a3b8' }
        })
        emptyCell.appendChild($({ tag: 'i', att: { className: 'fas fa-folder-open' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px', color: '#cbd5e1' } }))
        emptyCell.appendChild($({ tag: 'div', text: `No ${currentPaperType === 'undergraduate' ? 'undergraduate' : 'graduate'} research papers submitted yet`, style: { fontSize: '16px', marginBottom: '8px' } }))
        emptyCell.appendChild($({ tag: 'div', text: 'Click the "Submit Paper" button to submit your student research paper', style: { fontSize: '14px' } }))
        emptyRow.appendChild(emptyCell)
        tbody.appendChild(emptyRow)
    }

    const updateStatsFromData = (total, pending, approved, rejected) => {
        const statsContainer = document.querySelector('.stats-container')
        if (!statsContainer) return
        const statValues = statsContainer.querySelectorAll('.stat-value')
        if (statValues.length >= 4) {
            statValues[0].innerText = total
            statValues[1].innerText = pending
            statValues[2].innerText = approved
            statValues[3].innerText = rejected
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#FF9800', text: 'Pending Paper Review', icon: 'fa-clock' },
            approved: { bg: '#4CAF50', text: 'Paper Approved', icon: 'fa-check-circle' },
            rejected: { bg: '#f44336', text: 'Paper Rejected', icon: 'fa-times-circle' }
        }
        const normalizedStatus = (status || '').toLowerCase()
        const config = styles[normalizedStatus] || styles.pending

        return $({
            tag: 'span',
            style: {
                backgroundColor: config.bg,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            },
            child: [
                $({ tag: 'i', att: { className: `fas ${config.icon}` }, style: { fontSize: '11px' } }),
                $({ tag: 'span', text: config.text })
            ]
        })
    }

    const createActionButtons = (rowData) => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }
        })

        const currentStatus = (rowData.status || '').toLowerCase()
        const showDelete = currentStatus === 'pending'

        if (showDelete) {
            const deleteBtn = $({
                tag: 'button',
                att: { className: 'action-btn delete-btn', title: 'Delete Document' },
                style: {
                    background: '#f44336',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-trash-alt' }, style: { color: 'white', fontSize: '14px' } })
                ],
                event: {
                    type: 'click',
                    method: () => deleteStudentResearch(rowData)
                }
            })
            container.appendChild(deleteBtn)
        }

        return container
    }

    const deleteStudentResearch = (research) => {
        DeleteConfirmModal('Delete Research Paper', `Are you sure you want to delete "${research.title}"? This action cannot be undone.`).then(async (confirmed) => {
            if (confirmed) {
                try {
                    let loading = Waiting()
                    document.body.appendChild(loading)

                    const form = new FormData()
                    form.append('deleteStudentResearch', 'true')
                    form.append('research_id', research.id)

                    const response = await fetch('/uploadResearchChair', {
                        method: 'POST',
                        body: form
                    })

                    const result = await response.json()

                    if (loading && loading.remove) {
                        loading.remove()
                    }

                    if (result.status) {
                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                            if (window.refreshDocumentsTable) {
                                window.refreshDocumentsTable()
                            }
                        }))
                    } else {
                        AlertModal({ title: 'Delete Failed', message: result.message })
                    }
                } catch (error) {
                    if (loading && loading.remove) loading.remove()
                    console.error('Delete error:', error)
                    AlertModal({ title: 'Error', message: 'Error deleting document: ' + error.message })
                }
            }
        })
    }

    const viewFileInModal = (fileUrl, fileName, accentColor) => {
        if (!fileUrl) return
        FileViewerModal(fileUrl, fileName, accentColor, { showOpenDrive: true })
    }

    const createTableRow = (research) => {
        const row = $({ tag: 'tr', style: { borderBottom: '1px solid rgba(255,255,255,0.1)' } })

        const createFileList = () => {
            const container = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }
            })

            const createFileRow = (label, fileUrl, downloadUrl, fileType, iconColor) => {
                if (!fileUrl) return null

                const row = $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '12px'
                    }
                })

                row.appendChild($({
                    tag: 'span',
                    text: label + ':',
                    style: {
                        minWidth: '100px',
                        color: '#252525',
                        fontWeight: '500'
                    }
                }))

                const fileElement = $({
                    tag: 'a',
                    att: { href: '#', title: 'View file' },
                    style: {
                        color: iconColor,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                    },
                    child: [
                        $({ tag: 'i', att: { className: 'fab fa-google-drive' }, style: { fontSize: '14px' } }),
                        $({ tag: 'span', text: 'View', style: { fontSize: '12px' } })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            viewFileInModal(fileUrl, label, iconColor)
                        }
                    }
                })

                row.appendChild(fileElement)
                return row
            }

            const researchRow = createFileRow('Research Paper', research.researchFile, research.researchDownloadUrl, 'research', '#2196F3')
            if (researchRow) container.appendChild(researchRow)

            const endorsementRow = createFileRow('Endorsement', research.endorsementFile, research.endorsementDownloadUrl, 'endorsement', '#ff9800')
            if (endorsementRow) container.appendChild(endorsementRow)

            if (container.children.length === 0) {
                container.appendChild($({
                    tag: 'span',
                    text: '—',
                    style: { color: '#666' }
                }))
            }

            return container
        }

        const actionButtons = createActionButtons(research)

        const actionsCell = $({
            tag: 'td',
            style: { padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }
        })
        actionsCell.appendChild(actionButtons)

        const paperTypeBadge = $({
            tag: 'span',
            text: research.paper_type === 'undergraduate' ? '🎓 Undergraduate' : '🎓 Graduate',
            style: {
                backgroundColor: research.paper_type === 'undergraduate' ? '#2196F3' : '#9C27B0',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500',
                display: 'inline-block'
            }
        })

        const cells = [
            research.eventName || research.event || '—',
            getStatusBadge(research.status),
            research.title || '—',
            research.category || '—',
            research.presenter || '—',
            research.author || '—',
            (research.coAuthors || []).join(', ') || '—',
            research.campus || '—',
            paperTypeBadge,
            createFileList(),
            actionsCell
        ]

        cells.forEach((content, index) => {
            const td = $({
                tag: 'td',
                style: {
                    padding: '16px 12px',
                    color: '#3a3a3a',
                    fontSize: '14px',
                    verticalAlign: 'center'
                }
            })

            if (typeof content === 'object' && content.tagName) {
                td.appendChild(content)
            } else {
                td.innerText = content
            }

            row.appendChild(td)
        })

        return row
    }

    setTimeout(() => {
        loadDocuments()
    }, 100)

    window.refreshDocumentsTable = loadDocuments

    return container
}
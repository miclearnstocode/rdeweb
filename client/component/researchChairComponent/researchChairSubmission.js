import { $, ConfirmationAlert, Waiting, DeleteConfirmModal, FileViewerModal, CustomModal, AlertModal } from '../../lib/lib.js'

// View Researches Modal (for viewing other campuses' papers)
const openViewResearchesModal = () => {
    let currentModal = null
    let eventSelect, searchInput, tableBody
    let loadResearchDataFn

    // Build the content for the modal
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

        // Search + Filter Bar
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

        // Event Filter Dropdown
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
                flex: '0 0 auto'
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

        // Search Bar
        const searchWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '8px 16px',
                gap: '12px',
                flex: 1
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
                    if (selectedEventId) {
                        loadResearchDataFn(selectedEventId, searchTerm)
                    }
                }, 500)
            }
        })

        searchWrapper.appendChild(searchIcon)
        searchWrapper.appendChild(searchInput)

        searchContainer.appendChild(eventFilterWrapper)
        searchContainer.appendChild(searchWrapper)

        // Table Container
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

        // Table Header
        const thead = $({ tag: 'thead', style: { position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 1 } })
        const headerRow = $({ tag: 'tr', style: { borderBottom: '2px solid #333' } })
        const columns = ['Event Name', 'Campus', 'Author', 'Title', 'Files']

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

        // Table Body
        tableBody = $({ tag: 'tbody' })
        table.appendChild(tableBody)
        tableContainer.appendChild(table)

        container.appendChild(searchContainer)
        container.appendChild(tableContainer)

        return container
    }

    // Show a placeholder message in the table body
    const setTableMessage = (iconClass, mainText, subText = '') => {
        if (!tableBody) return
        tableBody.innerHTML = ''
        const row = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 5 },
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

    // Create file tag with access control
    const createFileTag = (fileUrl, fileName, fileType, accentColor) => {
        if (!fileUrl) return null

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
            event: {
                type: 'click',
                method: () => {
                    FileViewerModal(fileUrl, fileName, accentColor, { showOpenDrive: true })
                }
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fab fa-google-drive' },
                    style: { color: accentColor, fontSize: '14px' }
                }),
                $({
                    tag: 'span',
                    text: fileName.length > 40 ? fileName.substring(0, 37) + '...' : fileName,
                    style: {
                        color: '#fff',
                        fontSize: '12px',
                        maxWidth: '180px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                })
            ]
        })

        return tag
    }

    // Load event list into the dropdown
    const loadEventList = async () => {
        if (!eventSelect) return

        eventSelect.disabled = true
        const loadingOption = $({
            tag: 'option',
            text: 'Loading events...',
            att: { value: '', disabled: true }
        })
        eventSelect.appendChild(loadingOption)

        try {
            const formData = new FormData()
            formData.append('getEventList', 'true')

            const response = await fetch('/eventRequest', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const data = await response.text().then(text => text ? JSON.parse(text) : {})
            loadingOption.remove()

            // Filter only Student Symposium events
            let events = data.events || data.list || data || []
            events = events.filter(event => 
                event.name && 
                event.name.toLowerCase().includes('student') && 
                event.name.toLowerCase().includes('symposium')
            )

            if (!Array.isArray(events) || events.length === 0) {
                const noEventsOption = $({
                    tag: 'option',
                    text: 'No student symposium events available',
                    att: { value: '', disabled: true }
                })
                eventSelect.appendChild(noEventsOption)
                setTableMessage('fas fa-calendar-times', 'No student symposium events found')
                return
            }

            events.forEach(ev => {
                const option = $({
                    tag: 'option',
                    text: ev.name,
                    att: { value: ev.id }
                })
                eventSelect.appendChild(option)
            })

        } catch (err) {
            console.error('Failed to load event list:', err)
            loadingOption && loadingOption.remove()
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

    // Load research data for viewing
    const loadResearchData = async (eventId, searchTerm = '') => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        const loadingRow = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 5 },
                    style: { padding: '40px', textAlign: 'center', color: '#666' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                        $({ tag: 'div', text: searchTerm ? `Searching for "${searchTerm}"...` : 'Loading student research papers...', style: { fontSize: '14px' } })
                    ]
                })
            ]
        })
        tableBody.appendChild(loadingRow)

        try {
            const formData = new FormData()
            formData.append('getStudentResearchPapersByEvent', 'true')
            formData.append('eventId', eventId)
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

                    // Event Name cell
                    const eventCell = $({
                        tag: 'td',
                        text: research.eventName || research.event || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top', fontWeight: '500' }
                    })

                    // Campus cell
                    const campusCell = $({
                        tag: 'td',
                        text: research.campus || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    // Author cell
                    const authorCell = $({
                        tag: 'td',
                        text: research.author || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    // Title cell
                    const titleCell = $({
                        tag: 'td',
                        text: research.title || '—',
                        style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
                    })

                    // Files cell
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
                    setTableMessage('fas fa-folder-open', 'No research papers available', 'Student papers will appear here once submitted')
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
                        att: { colSpan: 5 },
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
                                        loadResearchData(eventId, searchTerm)
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

    // Assign functions to outer variables
    loadResearchDataFn = loadResearchData

    // Wire up dropdown change event
    const wireEvents = () => {
        if (eventSelect) {
            eventSelect.addEventListener('change', (e) => {
                const selectedId = parseInt(e.target.value)
                if (!selectedId) return
                if (searchInput) searchInput.value = ''
                loadResearchDataFn(selectedId)
            })
        }
    }

    // Create the modal
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

    // Load events after modal is open
    setTimeout(() => {
        loadEventList()
    }, 100)
}

export const ResearchChairSubmission = () => {
    // Utility to update stats cards
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

    let documentsTable
    let uploadModal
    let formData = {
        eventName: '',
        title: '',
        campus: '',
        category: '',
        presenter: '',
        author: '',
        coAuthors: [],
        paperType: 'undergraduate',
        researchFile: null,
        endorsementFile: null
    }

    // Categories list
    const categories = ['Social Science', 'Natural/Biological', 'Food', 'Developmental']

    // Campuses list
    const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#FF9800', text: 'Pending Review', icon: 'fa-clock' },
            approved: { bg: '#4CAF50', text: 'Approved', icon: 'fa-check-circle' },
            rejected: { bg: '#f44336', text: 'Rejected', icon: 'fa-times-circle' }
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

    // Create action buttons for table row
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

        // Delete button (only for pending)
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

    // Delete student research
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

    // View file in modal
    const viewFileInModal = (fileUrl, fileName, accentColor) => {
        if (!fileUrl) return
        FileViewerModal(fileUrl, fileName, accentColor, { showOpenDrive: true })
    }

    // Create table row
    const createTableRow = (research) => {
        const row = $({ tag: 'tr', style: { borderBottom: '1px solid rgba(255,255,255,0.1)' } })

        // Create file list display
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
                        color: '#888',
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

        const cells = [
            research.eventName || research.event || '—',
            getStatusBadge(research.status),
            research.paper_trail_no || '—',
            research.title || '—',
            research.category || '—',
            research.presenter || '—',
            research.author || '—',
            (research.coAuthors || []).join(', ') || '—',
            research.campus || '—',
            research.paper_type === 'undergraduate' ? 'Undergraduate' : 'Graduate',
            createFileList(),
            actionsCell
        ]

        cells.forEach((content, index) => {
            const td = $({
                tag: 'td',
                style: {
                    padding: '16px 12px',
                    color: '#e0e0e0',
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

    // Open upload modal for student symposium
    const openUploadModal = () => {
        let titleInput, categorySelect, authorInput, presenterInput, coAuthorInput, coAuthorList, campusSelect, paperTypeSelect
        let eventSelect

        formData = {
            eventName: '',
            title: '',
            campus: '',
            category: '',
            presenter: '',
            author: '',
            coAuthors: [],
            paperType: 'undergraduate',
            researchFile: null,
            endorsementFile: null,
        }

        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 101,
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease'
            },
            elementHandler: (el) => { uploadModal = el }
        })

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease'
            }
        })

        // Header
        const header = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                backgroundColor: '#1a1a1a',
                zIndex: 1
            },
            child: [
                $({
                    tag: 'h3',
                    text: 'Submit Student Symposium Paper',
                    style: { color: '#fff', margin: 0, fontSize: '20px' },
                    att: { id: 'modalTitle' }
                }),
                $({
                    tag: 'i',
                    att: { className: 'fas fa-times' },
                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: () => modal.remove()
                    }
                })
            ]
        })

        // Main content container
        const mainContentContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                transition: 'all 0.3s ease',
                padding: '24px'
            }
        })

        // Create Student Symposium Form Content
        const symposiumFormContent = createStudentSymposiumFormContent()
        mainContentContainer.appendChild(symposiumFormContent)

        // Footer
        const footer = $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                flexShrink: 0,
                backgroundColor: '#1a1a1a'
            },
            att: { id: 'modalFooter' }
        })

        const cancelBtn = $({
            tag: 'button',
            text: 'Cancel',
            style: {
                padding: '10px 24px',
                backgroundColor: '#444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            event: {
                type: 'click',
                method: () => modal.remove()
            }
        })

        const submitBtn = $({
            tag: 'button',
            text: 'Submit Paper',
            style: {
                padding: '10px 28px',
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block'
            },
            att: { id: 'submitBtn' }
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

            // Create FormData for submission
            const submitFormData = new FormData()
            submitFormData.append('uploadStudentSymposium', 'true')
            submitFormData.append('eventType', formData.eventName)
            submitFormData.append('title', formData.title)
            submitFormData.append('author', formData.author)
            submitFormData.append('category', formData.category)
            submitFormData.append('campus', formData.campus)
            submitFormData.append('coAuthor', JSON.stringify(formData.coAuthors))
            submitFormData.append('presenter', formData.presenter)
            submitFormData.append('paper_type', formData.paperType)

            // Append files
            if (formData.researchFile) {
                submitFormData.append('researchDoc', formData.researchFile)
            }
            if (formData.endorsementFile) {
                submitFormData.append('endorsementDoc', formData.endorsementFile)
            }

            // Show loading
            const loading = Waiting()
            document.body.appendChild(loading)

            try {
                const response = await fetch('/uploadResearchChair', {
                    method: 'POST',
                    body: submitFormData
                })

                const result = await response.json()

                // Remove loading
                if (loading && loading.remove) loading.remove()

                if (result.status) {
                    // Close modal
                    modal.remove()
                    // Show success message
                    document.body.appendChild(ConfirmationAlert(result.message, () => {
                        if (window.refreshDocumentsTable) {
                            window.refreshDocumentsTable()
                        }
                    }))
                } else {
                    AlertModal({ title: 'Submission Failed', message: result.message })
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
        modalContent.appendChild(mainContentContainer)
        modalContent.appendChild(footer)
        modal.appendChild(modalContent)
        document.body.appendChild(modal)

        function capitalizeFirstLetter(str) {
            if (!str) return str
            return str.split(' ').map(word => {
                if (word.length === 0) return word
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            }).join(' ')
        }

        function createStudentSymposiumFormContent() {
            const container = $({ tag: 'div', style: { display: 'block' }, att: { id: 'studentSymposiumFormContainer' } })

            // Form body
            const formBody = $({
                tag: 'div',
                style: { padding: '0' }
            })

            // Event selection
            const eventField = $({ tag: 'div', style: { marginBottom: '20px' } })
            eventField.appendChild($({ tag: 'label', text: 'Event Name *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            eventSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'change',
                    method: (e) => {
                        const selectedEventName = e.target.value
                        formData.eventName = selectedEventName
                        
                        // Auto-set paper type based on event name
                        if (selectedEventName && selectedEventName.toLowerCase().includes('undergraduate')) {
                            formData.paperType = 'undergraduate'
                            if (paperTypeSelect) paperTypeSelect.value = 'undergraduate'
                        } else if (selectedEventName && selectedEventName.toLowerCase().includes('graduate')) {
                            formData.paperType = 'graduate'
                            if (paperTypeSelect) paperTypeSelect.value = 'graduate'
                        }
                    }
                },
                elementHandler: async (el) => {
                    if (!el) return
                    el.innerHTML = ''

                    const defaultOption = $({
                        tag: 'option',
                        text: '-- Select Student Symposium Event --',
                        att: { disabled: true, selected: true, value: '' }
                    })
                    el.appendChild(defaultOption)

                    const form = new FormData()
                    form.append('getEvent', 'true')

                    try {
                        const response = await fetch('/eventRequest', {
                            method: 'POST',
                            body: form
                        })

                        if (response.ok) {
                            const data = await response.json()
                            // Filter only Student Symposium events
                            const studentSymposiumEvents = data.filter(event =>
                                event.name &&
                                event.name.toLowerCase().includes('student') &&
                                event.name.toLowerCase().includes('symposium')
                            )

                            if (studentSymposiumEvents.length > 0) {
                                studentSymposiumEvents.forEach(val => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: val.name,
                                        style: { backgroundColor: '#2a2a2a', fontSize: '14px' },
                                        att: { id: val.id, value: val.name }
                                    }))
                                })
                            } else {
                                // If no specific student symposium events, show all symposium events
                                const symposiumEvents = data.filter(event =>
                                    event.name && event.name.toLowerCase().includes('symposium')
                                )
                                symposiumEvents.forEach(val => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: val.name,
                                        style: { backgroundColor: '#2a2a2a', fontSize: '14px' },
                                        att: { id: val.id, value: val.name }
                                    }))
                                })
                            }
                        } else {
                            console.error('Failed to fetch events:', response.status)
                        }
                    } catch (error) {
                        console.error('Error fetching events:', error)
                    }
                }
            })
            eventField.appendChild(eventSelect)
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
            titleField.appendChild($({ tag: 'label', text: 'Research Title *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            titleInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter research title' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        formData.title = capitalizeFirstLetter(e.target.value)
                        e.target.value = formData.title
                    }
                }
            })
            titleField.appendChild(titleInput)

            // Campus field
            const campusField = $({ tag: 'div', style: { marginBottom: '0' } })
            campusField.appendChild($({ tag: 'label', text: 'Campus *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            campusSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'change',
                    method: (e) => { formData.campus = e.target.value }
                },
                elementHandler: (el) => {
                    el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true } }))
                    campuses.forEach(campus => {
                        el.appendChild($({ tag: 'option', text: campus, att: { value: campus } }))
                    })
                }
            })
            campusField.appendChild(campusSelect)

            // Category field
            const categoryField = $({ tag: 'div', style: { marginBottom: '0' } })
            categoryField.appendChild($({ tag: 'label', text: 'Research Category *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            categorySelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'change',
                    method: (e) => { formData.category = e.target.value }
                },
                elementHandler: (el) => {
                    el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true } }))
                    categories.forEach(cat => {
                        el.appendChild($({ tag: 'option', text: cat, att: { value: cat } }))
                    })
                }
            })
            categoryField.appendChild(categorySelect)

            // Paper Type field
            const paperTypeField = $({ tag: 'div', style: { marginBottom: '0' } })
            paperTypeField.appendChild($({ tag: 'label', text: 'Paper Type (Auto-set based on event)', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            paperTypeSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'not-allowed' 
                },
                att: {
                    disabled: true 
                },
                event: {
                    type: 'change',
                    method: (e) => { formData.paperType = e.target.value }
                },
                elementHandler: (el) => {
                    el.appendChild($({ tag: 'option', text: 'Undergraduate', att: { value: 'undergraduate', selected: true } }))
                    el.appendChild($({ tag: 'option', text: 'Graduate', att: { value: 'graduate' } }))
                }
            })
            paperTypeField.appendChild(paperTypeSelect)

            // Author field
            const authorField = $({ tag: 'div', style: { marginBottom: '0' } })
            authorField.appendChild($({ tag: 'label', text: 'Main Author (Student) *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            authorInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter main author name' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        formData.author = capitalizeFirstLetter(e.target.value)
                        e.target.value = formData.author
                    }
                }
            })
            authorField.appendChild(authorInput)

            // Presenter field
            const presenterField = $({ tag: 'div', style: { marginBottom: '0' } })
            presenterField.appendChild($({ tag: 'label', text: 'Presenter (Student) *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
            presenterInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter presenter name' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        formData.presenter = capitalizeFirstLetter(e.target.value)
                        e.target.value = formData.presenter
                    }
                }
            })
            presenterField.appendChild(presenterInput)

            // Co-authors field
            const coAuthorField = $({ tag: 'div', style: { marginBottom: '0' } })
            coAuthorField.appendChild($({ tag: 'label', text: 'Co-Authors (Students)', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

            const coAuthorInputGroup = $({
                tag: 'div',
                style: { display: 'flex', gap: '10px', marginBottom: '12px' }
            })

            coAuthorInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter co-author name' },
                style: {
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        e.target.value = capitalizeFirstLetter(e.target.value)
                    }
                }
            })

            const addCoAuthorBtn = $({
                tag: 'button',
                text: 'Add',
                style: {
                    padding: '8px 20px',
                    backgroundColor: '#2196F3',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
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
                    }
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
                            backgroundColor: '#2a2a2a',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                        },
                        child: [
                            $({ tag: 'span', text: author, style: { color: '#fff' } }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#999', fontSize: '10px', cursor: 'pointer' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        formData.coAuthors.splice(idx, 1)
                                        updateCoAuthorList()
                                    }
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
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }
            })

            fileSection.appendChild($({ tag: 'h4', text: 'Attachments', style: { color: '#fff', marginBottom: '16px', fontSize: '16px' } }))

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

        // FileUploadField helper
        function FileUploadField({ label, fieldName }) {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({ tag: 'label', text: label, style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #444',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                },
                event: {
                    type: 'click',
                    method: () => fileInput.click()
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '32px', color: '#666', marginBottom: '8px', display: 'block' }
            }))
            uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#888', fontSize: '14px' } }))
            uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#666', fontSize: '12px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '8px', fontSize: '12px', color: '#4caf50', textAlign: 'center' } })

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
                            fileNameDisplay.innerText = `✓ Selected: ${file.name}`
                        }
                    }
                }
            })

            container.appendChild(uploadArea)
            container.appendChild(fileNameDisplay)
            container.appendChild(fileInput)

            return container
        }
    }

    // Create the main UI
    const createResearchChairMain = () => {
        const container = $({
            tag: 'div',
            style: {
                padding: '24px',
                backgroundColor: 'transparent',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }
        })

        // Header
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
                $({ tag: 'h1', text: 'Student Research Papers', style: { color: '#fff', fontSize: '30px', margin: 0, marginBottom: '8px' } }),
                $({ tag: 'p', text: 'Submit and track your student research papers for symposium events', style: { color: '#888', fontSize: '14px', margin: 0 } })
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
                backgroundColor: '#2196F3',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-plus' }, style: { fontSize: '14px' } }),
                $({ tag: 'span', text: 'Submit Paper' })
            ],
            event: {
                type: 'click',
                method: () => openUploadModal()
            }
        })

        const viewResearchesBtn = $({
            tag: 'button',
            style: {
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-table-list' }, style: { fontSize: '14px' } }),
                $({ tag: 'span', text: 'View All Papers' })
            ],
            event: {
                type: 'click',
                method: () => openViewResearchesModal()
            }
        })

        buttonGroup.appendChild(uploadBtn)
        buttonGroup.appendChild(viewResearchesBtn)
        header.appendChild(titleSection)
        header.appendChild(buttonGroup)

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
                    backgroundColor: '#1e1e1e',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.05)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
                        child: [
                            $({ tag: 'span', text: stat.label, style: { color: '#888', fontSize: '14px' } }),
                            $({ tag: 'i', att: { className: `fas ${stat.icon}` }, style: { color: stat.color, fontSize: '20px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        text: stat.value,
                        style: { color: '#fff', fontSize: '28px', fontWeight: 'bold' },
                        att: { className: 'stat-value' }
                    })
                ]
            })
            statsContainer.appendChild(card)
        })

        // Table container
        const tableContainer = $({
            tag: 'div',
            style: {
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                overflow: 'auto',
                border: '1px solid rgba(255,255,255,0.05)'
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

        // Table header
        const thead = $({ tag: 'thead' })
        const headerRow = $({ tag: 'tr', style: { backgroundColor: '#717171', borderBottom: '2px solid #333' } })
        const columns = ['Event', 'Status', 'Paper Trail No.', 'Title', 'Category', 'Presenter', 'Author', 'Co-Authors', 'Campus', 'Type', 'Attachments', 'Actions']

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
                    whiteSpace: 'nowrap'
                }
            }))
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        const tbody = $({ tag: 'tbody' })
        table.appendChild(tbody)

        tableContainer.appendChild(table)

        container.appendChild(header)
        container.appendChild(statsContainer)
        container.appendChild(tableContainer)

        const showEmptyState = () => {
            const emptyRow = $({ tag: 'tr', att: { className: 'empty-state-row' } })
            const emptyCell = $({
                tag: 'td',
                att: { colSpan: columns.length },
                style: { padding: '60px', textAlign: 'center', color: '#666' }
            })
            emptyCell.appendChild($({ tag: 'i', att: { className: 'fas fa-folder-open' }, style: { fontSize: '48px', display: 'block', marginBottom: '16px' } }))
            emptyCell.appendChild($({ tag: 'div', text: 'No research papers submitted yet', style: { fontSize: '16px', marginBottom: '8px' } }))
            emptyCell.appendChild($({ tag: 'div', text: 'Click the "Submit Paper" button to submit your student research paper', style: { fontSize: '14px' } }))
            emptyRow.appendChild(emptyCell)
            tbody.appendChild(emptyRow)
        }

        const loadDocuments = async () => {
            try {
                tbody.innerHTML = ''
                const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } })
                const loadingCell = $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { padding: '60px', textAlign: 'center', color: '#666' }
                })
                loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px' } }))
                loadingCell.appendChild($({ tag: 'div', text: 'Loading your research papers...', style: { fontSize: '14px' } }))
                loadingRow.appendChild(loadingCell)
                tbody.appendChild(loadingRow)

                const form = new FormData()
                form.append('getStudentResearchPapers', 'true')

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
                            // Parse coauthors if needed
                            let coAuthors = research.coAuthors || []
                            if (typeof coAuthors === 'string') {
                                try {
                                    coAuthors = JSON.parse(coAuthors)
                                } catch (e) {
                                    coAuthors = []
                                }
                            }

                            const researchObj = {
                                id: research.id,
                                paper_trail_no: research.paper_trail_no,
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
                            }

                            // Count status
                            const status = (research.status || '').toLowerCase()
                            if (status === 'pending') pendingCount++
                            else if (status === 'approved') approvedCount++
                            else if (status === 'rejected') rejectedCount++

                            const row = createTableRow(researchObj)
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

        // Load documents when component mounts
        setTimeout(() => {
            loadDocuments()
        }, 100)

        // Store loadDocuments function globally for refresh capability
        window.refreshDocumentsTable = loadDocuments

        return container
    }

    return createResearchChairMain()
}
import { $, ConfirmationAlert, Waiting, DeleteConfirmModal, FileViewerModal, CustomModal } from '../../../lib/lib.js'
import { handleResubmit } from './resubmit.js'
import { Print } from "../../otherComponent/comment.js"


// View Researches Modal
const openViewResearchesModal = () => {
    let currentModal = null
    let eventSelect, searchInput, tableBody
    let loadResearchDataFn, addResearchToTableFn

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
                placeholder: 'Search by event name, campus/center, author, co-author, presenter, or file name...'
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
        const columns = ['Event Name', 'Campus/Center', 'Files']

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

    // Helper: show a placeholder message in the table body
    const setTableMessage = (iconClass, mainText, subText = '') => {
        if (!tableBody) return
        tableBody.innerHTML = ''
        const row = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 3 },
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

    // Function to create file tag with access control using FileViewerModal
    const createFileTag = (fileInfo, docId, fileType, fileUrl, presenter) => {
        const fileName = fileInfo.title || fileInfo.name || 'Untitled'

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
                title: `${fileName} | Presenter: ${presenter || 'Not specified'}`
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
                                    // Use FileViewerModal instead of window.open
                                    FileViewerModal(embedUrl, fileName, '#ff9800', { showOpenDrive: true })
                                } else if (fileUrl) {
                                    FileViewerModal(fileUrl, fileName, '#ff9800', { showOpenDrive: true })
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
                    att: { className: 'fab fa-google-drive' },
                    style: { color: '#0F9D58', fontSize: '14px' }
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

            const events = data.events || data.list || data || []

            if (!Array.isArray(events) || events.length === 0) {
                const noEventsOption = $({
                    tag: 'option',
                    text: 'No events available',
                    att: { value: '', disabled: true }
                })
                eventSelect.appendChild(noEventsOption)
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

            const preselect = window.currentEventId || parseInt(localStorage.getItem('currentEventId'))
            if (preselect) {
                eventSelect.value = preselect
                loadResearchDataFn(preselect)
            } else {
                setTableMessage('fas fa-hand-pointer', 'Select an event above to view its research documents')
            }

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

    // Add research to table
    const addResearchToTable = (eventName, location, files) => {
        if (!tableBody) return

        const row = $({
            tag: 'tr',
            att: { 'data-event': `${eventName} ${location} ${files.map(f => f.title || '').join(' ')}` },
            style: { borderBottom: '1px solid rgba(255,255,255,0.05)' }
        })

        const eventCell = $({
            tag: 'td',
            text: eventName,
            style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top', fontWeight: '500' }
        })

        const locationCell = $({
            tag: 'td',
            text: location,
            style: { padding: '16px 12px', color: '#e0e0e0', fontSize: '14px', verticalAlign: 'top' }
        })

        const filesCell = $({
            tag: 'td',
            att: { className: 'files-cell' },
            style: { padding: '16px 12px', verticalAlign: 'top' }
        })

        if (files.length === 0) {
            filesCell.appendChild($({ tag: 'span', text: 'No files', style: { color: '#666', fontSize: '12px' } }))
        } else {
            files.forEach(file => {
                const fileTag = createFileTag(
                    { title: file.title, name: file.title },
                    file.id,
                    file.file_type,
                    file.file,
                    file.author
                )
                filesCell.appendChild(fileTag)
            })
        }

        row.appendChild(eventCell)
        row.appendChild(locationCell)
        row.appendChild(filesCell)
        tableBody.appendChild(row)
    }

    // Load research data
    const loadResearchData = async (eventId, searchTerm = '') => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        const loadingRow = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 3 },
                    style: { padding: '40px', textAlign: 'center', color: '#666' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                        $({ tag: 'div', text: searchTerm ? `Searching for "${searchTerm}"...` : 'Loading research documents...', style: { fontSize: '14px' } })
                    ]
                })
            ]
        })
        tableBody.appendChild(loadingRow)

        try {
            const formData = new FormData()
            formData.append('researchFile', 'true')
            formData.append('eventId', eventId)
            if (searchTerm) {
                formData.append('search', searchTerm)
            }

            const response = await fetch('/uploadResearchFile', {
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
                data.list.forEach(group => {
                    if (group.list && group.list.length > 0) {
                        addResearchToTable(
                            group.name,
                            group.location,
                            group.list
                        )
                    }
                })

                if (searchTerm && data.list.length === 0) {
                    setTableMessage('fas fa-search', 'No matching results found', `No documents match "${searchTerm}"`)
                }
            } else {
                if (searchTerm) {
                    setTableMessage('fas fa-search', 'No matching results found', `No documents match "${searchTerm}"`)
                } else {
                    setTableMessage('fas fa-folder-open', 'No research documents available', 'Upload documents to view them here')
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
                        att: { colSpan: 3 },
                        style: { padding: '40px', textAlign: 'center', color: '#ff6b6b' },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '32px', display: 'block', marginBottom: '12px' } }),
                            $({ tag: 'div', text: 'Failed to load research documents', style: { fontSize: '16px', marginBottom: '8px' } }),
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
    addResearchToTableFn = addResearchToTable

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
        title: 'Research Documents',
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
// Modern Document Management Component
export const Research = () => {
    // Utility to update stats cards
    const updateStatsFromData = (total, pending, accepted, rejected) => {
        const statsContainer = document.querySelector('.stats-container')
        if (!statsContainer) return

        const statValues = statsContainer.querySelectorAll('.stat-value')
        if (statValues.length >= 4) {
            statValues[0].innerText = total
            statValues[1].innerText = pending
            statValues[2].innerText = accepted
            statValues[3].innerText = rejected
        }
    }

    // Recalculate stats from the current table rows
    const refreshStats = () => {
        if (!documentsTable) return
        const rows = documentsTable.querySelectorAll('tbody tr:not(.empty-state-row):not(.loading-row)')
        let total = rows.length
        let pending = 0
        let accepted = 0
        let rejected = 0

        rows.forEach(row => {
            const statusCell = row.cells[1]
            if (statusCell) {
                const statusText = statusCell.innerText.toLowerCase()
                if (statusText.includes('pending')) pending++
                else if (statusText.includes('accepted') || statusText.includes('accepted')) accepted++
                else if (statusText.includes('rejected')) rejected++
            }
        })

        updateStatsFromData(total, pending, accepted, rejected)
    }

    let documentsTable
    let uploadModal
    let formData = {
        eventName: '',
        title: '',
        category: '',
        presenter: '',
        author: '',
        coAuthors: [],
        researchFile: null,
        programFile: null,
        endorsementFile: null,
        date_started: null,
        date_completed: null
    }

    // Center categories mapping
    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
        "Extension (Extension)": ["Extension"]
    }

    // Build reverse mapping
    const categoryToCenters = {}
    Object.entries(centerCategoryMapping).forEach(([center, categories]) => {
        categories.forEach(category => {
            if (!categoryToCenters[category]) categoryToCenters[category] = []
            categoryToCenters[category].push(center)
        })
    })

    // Categories list
    const categories = [
        "Social Science", "Natural / Biological", "Food", "Development",
        "Extension", "Agricultural Machinery", "Industrial", "Engineering", "Information Technology"
    ]

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#FF9800', text: 'Pending', icon: 'fa-clock' },
            accepted: { bg: '#4CAF50', text: 'Accepted', icon: 'fa-check-circle' },
            rejected: { bg: '#f44336', text: 'Rejected', icon: 'fa-times-circle' },
            review: { bg: '#2196F3', text: 'Under Review', icon: 'fa-eye' },
            revision_pending: { bg: '#9C27B0', text: 'Revision Pending', icon: 'fa-exclamation-circle' },
            revision_submitted: { bg: '#673AB7', text: 'Revision Submitted', icon: 'fa-paper-plane' },
            revision_accepted: { bg: '#009688', text: 'Revision Accepted', icon: 'fa-check-double' },
            revision_rejected: { bg: '#E91E63', text: 'Revision Rejected', icon: 'fa-times-circle' }
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

    const createActionButtons = (rowData, hideEditDelete = false) => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
            }
        })

        // View Comments button (always show)
        const viewCommentsBtn = $({
            tag: 'button',
            att: { className: 'action-btn view-comments-btn', title: 'View Comments' },
            style: {
                background: '#4caf50',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-comment-dots' }, style: { color: 'white', fontSize: '14px' } })
            ],
            event: {
                type: 'click',
                method: () => viewComments(rowData)
            }
        })

        // Edit button (show for most statuses except rejected, revision_accepted, revision_rejected)
        const currentStatus = (rowData.status || '').toLowerCase()
        const showEdit = !['rejected', 'revision_accepted', 'revision_rejected'].includes(currentStatus)

        const editBtn = $({
            tag: 'button',
            att: { className: 'action-btn edit-btn', title: 'Edit Document' },
            style: {
                background: '#FF9800',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-edit' }, style: { color: 'white', fontSize: '14px' } })
            ],
            event: {
                type: 'click',
                method: () => editDocument(rowData)
            }
        })

        // Delete button (show for most statuses)
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
                method: () => deleteDocument(rowData)
            }
        })

        // Resubmit button (show only if rejected)
        if (currentStatus === 'rejected') {
            const resubmitBtn = $({
                tag: 'button',
                att: { className: 'action-btn resubmit-btn', title: 'Resubmit Document' },
                style: {
                    background: '#2196F3',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-redo' }, style: { color: 'white', fontSize: '14px' } })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation()
                        handleResubmit(rowData.endorsement_id)
                    }
                }
            })
            container.appendChild(resubmitBtn)
        }

        // Add standard buttons
        container.appendChild(viewCommentsBtn)

        if (!hideEditDelete) {
            if (showEdit) {
                container.appendChild(editBtn)
            }
            container.appendChild(deleteBtn)
        }

        return container
    }

    // View Comments Modal with Print functionality
    const viewComments = (doc) => {
        let commentsBody
        let commentsData = []

        // Build the content for the modal
        const buildContent = () => {
            const container = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: '400px'
                }
            })

            // Comments Body Container
            commentsBody = $({
                tag: 'div',
                style: {
                    flex: 1,
                    overflow: 'auto',
                    minHeight: '300px'
                }
            })

            // Show loading state
            commentsBody.appendChild($({
                tag: 'div',
                style: { textAlign: 'center', padding: '40px', color: '#888' },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '24px', marginBottom: '12px', display: 'block' } }),
                    $({ tag: 'div', text: 'Loading comments...' })
                ]
            }))

            container.appendChild(commentsBody)
            return container
        }

        // Build footer with Print and Close buttons
        const buildFooter = ({ closeModal }) => {
            const footerContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    width: '100%'
                }
            });

            const printBtn = $({
                tag: 'button',
                style: {
                    padding: '8px 20px',
                    backgroundColor: '#2196F3',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-print' }, style: { fontSize: '14px' } }),
                    $({ tag: 'span', text: 'Print Comments' })
                ],
                event: {
                    type: 'click',
                    method: () => printComments()
                }
            });

            const closeBtn = $({
                tag: 'button',
                text: 'Close',
                style: {
                    padding: '8px 24px',
                    backgroundColor: '#444',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer'
                },
                event: {
                    type: 'click',
                    method: () => closeModal()
                }
            });

            footerContainer.appendChild(printBtn);
            footerContainer.appendChild(closeBtn);
            return footerContainer;
        };

        // Create individual comment card
        const createCommentCard = (comment) => {
            const card = $({
                tag: 'div',
                style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    borderLeft: `4px solid ${comment.evalName ? '#2196F3' : '#FF9800'}`
                }
            });

            // Evaluator info
            const evaluatorInfo = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', gap: '8px' },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-user-circle' }, style: { color: '#2196F3', fontSize: '16px' } }),
                            $({ tag: 'span', text: comment.evalName || 'Evaluator', style: { color: '#fff', fontWeight: '500' } })
                        ]
                    }),
                    comment.date ? $({
                        tag: 'span',
                        text: new Date(comment.date).toLocaleDateString(),
                        style: { color: '#888', fontSize: '12px' }
                    }) : null
                ]
            });

            card.appendChild(evaluatorInfo);

            // Comment sections
            const sections = [
                { title: 'Title', content: comment.title, icon: 'fa-heading' },
                { title: 'Introduction', content: comment.intro, icon: 'fa-book-open' },
                { title: 'Abstract', content: comment.abstract, icon: 'fa-paragraph' },
                { title: 'Objective', content: comment.objective, icon: 'fa-bullseye' },
                { title: 'Methodology', content: comment.methodology, icon: 'fa-flask' },
                { title: 'Results and Discussion', content: comment.results, icon: 'fa-chart-line' },
                { title: 'Recommendation and Conclusion', content: comment.recommendation, icon: 'fa-lightbulb' },
                { title: 'Literature', content: comment.literature, icon: 'fa-book' },
                { title: 'Other Comments', content: comment.other, icon: 'fa-comment' }
            ];

            sections.forEach(section => {
                if (section.content && section.content.trim() !== '') {
                    const sectionEl = $({
                        tag: 'div',
                        style: { marginBottom: '12px' },
                        child: [
                            $({
                                tag: 'div',
                                style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
                                child: [
                                    $({ tag: 'i', att: { className: `fas ${section.icon}` }, style: { color: '#FF9800', fontSize: '12px' } }),
                                    $({ tag: 'span', text: section.title, style: { color: '#FF9800', fontSize: '13px', fontWeight: '500' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: { color: '#ccc', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
                                text: section.content
                            })
                        ]
                    });
                    card.appendChild(sectionEl);
                }
            });

            return card;
        };

        // Display comments
        const displayComments = (commentsData, docInfo) => {
            commentsBody.innerHTML = '';

            if (!commentsData || commentsData.length === 0) {
                commentsBody.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '40px', color: '#888' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-comments' }, style: { fontSize: '32px', marginBottom: '12px', display: 'block' } }),
                        $({ tag: 'div', text: 'No comments available for this document' })
                    ]
                }));
                return;
            }

            commentsData.forEach(comment => {
                const commentCard = createCommentCard(comment);
                commentsBody.appendChild(commentCard);
            });
        };

        // Print comments
        const printComments = () => {
            if (!commentsData || commentsData.length === 0) {
                AlertModal({
                    title: 'No Comments',
                    message: 'No comments available to print'
                });
                return;
            }

            // Build print HTML
            let printHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Review Comments - ${doc.title}</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            margin: 40px;
                            background: white;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #333;
                        }
                        .comment-card {
                            margin-bottom: 30px;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            page-break-inside: avoid;
                        }
                        .eval-header {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 15px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #eee;
                        }
                        .eval-name {
                            font-weight: bold;
                            color: #2196F3;
                        }
                        .section {
                            margin-bottom: 15px;
                        }
                        .section-title {
                            font-weight: bold;
                            color: #FF9800;
                            margin-bottom: 5px;
                        }
                        .section-content {
                            margin-left: 10px;
                        }
                        @media print {
                            body {
                                margin: 20px;
                            }
                            .comment-card {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Review Comments</h1>
                        <p><strong>Document:</strong> ${doc.title}</p>
                        <p><strong>Author:</strong> ${doc.author} | <strong>Event:</strong> ${doc.eventName}</p>
                    </div>
            `;

            commentsData.forEach(comment => {
                printHtml += `
                    <div class="comment-card">
                        <div class="eval-header">
                            <div class="eval-name">${comment.evalName || 'Evaluator'}</div>
                            <div>${comment.date ? new Date(comment.date).toLocaleDateString() : ''}</div>
                        </div>
                `;

                const sections = [
                    { title: 'Title', content: comment.title },
                    { title: 'Introduction', content: comment.intro },
                    { title: 'Abstract', content: comment.abstract },
                    { title: 'Objective', content: comment.objective },
                    { title: 'Methodology', content: comment.methodology },
                    { title: 'Results and Discussion', content: comment.results },
                    { title: 'Recommendation and Conclusion', content: comment.recommendation },
                    { title: 'Literature', content: comment.literature },
                    { title: 'Other Comments', content: comment.other }
                ];

                sections.forEach(section => {
                    if (section.content && section.content.trim() !== '') {
                        printHtml += `
                            <div class="section">
                                <div class="section-title">${section.title}</div>
                                <div class="section-content">${section.content}</div>
                            </div>
                        `;
                    }
                });

                printHtml += `</div>`;
            });

            printHtml += `</body></html>`;

            const printWindow = window.open('', '_blank', 'width=800,height=600,toolbar=yes,scrollbars=yes');
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        };

        // Load comments from API
        const loadComments = async () => {
            try {
                const form = new FormData();
                form.append('commentRequest', 'true');
                form.append('docId', doc.id);

                const response = await fetch('/uploadResearchFile', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    commentsData = data;
                    displayComments(data, doc);
                } else {
                    throw new Error('Failed to load comments');
                }
            } catch (error) {
                console.error('Error loading comments:', error);
                commentsBody.innerHTML = '';
                commentsBody.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '40px', color: '#f44336' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '32px', marginBottom: '12px', display: 'block' } }),
                        $({ tag: 'div', text: 'Error loading comments: ' + error.message })
                    ]
                }));
            }
        };

        // Create and open the modal
        CustomModal({
            title: doc.title,
            content: buildContent,
            footer: buildFooter,
            size: 'large',
            onClose: () => {
                commentsData = [];
            }
        });

        // Load comments after modal is open
        setTimeout(() => {
            loadComments();
        }, 100);
    }
    // Create table row
    const createTableRow = (doc) => {
        const row = $({ tag: 'tr', style: { borderBottom: '1px solid rgba(255,255,255,0.1)' } })

        // Get document data
        let originalStatus = doc.status || 'pending'
        const presentationDate = doc.date_of_presentation ? new Date(doc.date_of_presentation) : null
        const currentDate = new Date()

        // Dynamic status logic
        let status
        if (originalStatus === 'rejected') {
            status = 'rejected'
        } else if (presentationDate && presentationDate < currentDate) {
            // Presentation has passed - show revision status
            status = doc.revision_status || 'revision_pending'
        } else {
            // No presentation date or future date - show original status
            status = originalStatus
        }

        // Clean up NULL values
        if (status === 'NULL' || status === 'null') {
            status = 'pending'
        }

        // Handle file display with proper icons for Google Drive files
        const getFileIcon = (fileUrl, fileType = 'research') => {
            if (!fileUrl || fileUrl === '—') return '—'
            if (fileUrl.includes('drive.google.com')) {
                return $({
                    tag: 'i',
                    att: { className: 'fab fa-google-drive' },
                    style: { color: '#0F9D58', fontSize: '18px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            viewFileInModal(fileUrl, fileType)
                        }
                    }
                })
            }
            return $({
                tag: 'i',
                att: { className: 'fas fa-file-pdf' },
                style: { color: '#f44336', fontSize: '18px', cursor: 'pointer' },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation()
                        viewFileInModal(fileUrl, fileType)
                    }
                }
            })
        }

        const researchFileDisplay = doc.researchFile && doc.researchFile !== '—' ? getFileIcon(doc.researchFile) : '—'
        const programFileDisplay = doc.programFile && doc.programFile !== '—' ? getFileIcon(doc.programFile) : '—'
        const endorsementFileDisplay = doc.endorsementFile && doc.endorsementFile !== '—' ? getFileIcon(doc.endorsementFile) : '—'
        const reviseButton = createReviseButton(doc)
        const actionButtons = createActionButtons(doc, !!reviseButton)

        const actionsCell = $({
            tag: 'td',
            style: { padding: '16px 12px', verticalAlign: 'middle' }
        })

        // Create container for buttons
        const buttonContainer = $({
            tag: 'div',
            style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }
        })

        // Put Revise button first if it exists
        if (reviseButton) {
            buttonContainer.appendChild(reviseButton)
        }
        buttonContainer.appendChild(actionButtons)

        actionsCell.appendChild(buttonContainer)

        // Then in your cells array, use actionsCell as the 11th element
        const cells = [
            doc.eventName || '—',
            getStatusBadge(status),
            doc.title || '—',
            doc.category || '—',
            doc.presenter || '—',
            doc.author || '—',
            (doc.coAuthors || []).join(', ') || '—',
            researchFileDisplay,
            programFileDisplay,
            endorsementFileDisplay,
            actionsCell
        ]

        cells.forEach((content, index) => {
            const td = $({
                tag: 'td',
                style: {
                    padding: '16px 12px',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    verticalAlign: 'middle'
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

    const createReviseButton = (doc) => {
        // Get the current display status
        const currentStatus = (doc.status || '').toLowerCase()

        // Only show if status is revision_pending or revision_rejected
        const isEligible = currentStatus === 'revision_pending' || currentStatus === 'revision_rejected'

        if (!isEligible) return null

        const reviseBtn = $({
            tag: 'button',
            att: { className: 'action-btn revise-btn', title: 'Submit Revised Paper/Proposal' },
            style: {
                background: '#9C27B0',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-upload' }, style: { color: 'white', fontSize: '14px' } }),
                $({ tag: 'span', text: 'Update Revision', style: { marginLeft: '6px', fontSize: '12px', color: 'white', fontWeight: 'bold' } })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation()
                    openRevisionModal(doc)
                }
            }
        })

        return reviseBtn
    }

    // Open Revision Modal
    const openRevisionModal = async (doc) => {
        let fileInput, fileNameDisplay, fileError
        let selectedFile = null

        // Build the content for the modal
        const buildContent = () => {
            const container = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }
            })

            // Document Title (readonly)
            const titleField = $({ tag: 'div', style: { marginBottom: '0px' } });
            titleField.appendChild($({
                tag: 'label',
                text: 'Document Title',
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }
            }));

            const titleInput = $({
                tag: 'input',
                att: { type: 'text', value: doc.title || '', disabled: true },
                style: {
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#aaa',
                    fontSize: '14px',
                    cursor: 'not-allowed'
                }
            })
            titleField.appendChild(titleInput)
            container.appendChild(titleField)

            // File upload section
            const fileSection = $({
                tag: 'div',
                style: {
                    backgroundColor: '#2a2a2a',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '0px'
                }
            })

            fileSection.appendChild($({
                tag: 'div',
                style: { fontSize: '12px', color: '#9C27B0', marginBottom: '16px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
                text: 'REVISED DOCUMENT'
            }))

            // File upload area
            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #9C27B0',
                    borderRadius: '10px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(156, 39, 176, 0.05)'
                },
                event: {
                    type: 'click',
                    method: () => fileInput.click(),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(156, 39, 176, 0.1)';
                        e.currentTarget.style.borderColor = '#9C27B0';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(156, 39, 176, 0.05)';
                        e.currentTarget.style.borderColor = '#9C27B0';
                    }
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '40px', color: '#9C27B0', marginBottom: '12px', display: 'block' }
            }))

            uploadArea.appendChild($({
                tag: 'div',
                text: 'Click to upload revised document',
                style: { color: '#9C27B0', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }
            }))

            uploadArea.appendChild($({
                tag: 'div',
                text: 'PDF only (Max 10MB)',
                style: { color: '#888', fontSize: '12px' }
            }))

            fileNameDisplay = $({
                tag: 'div',
                style: { marginTop: '12px', fontSize: '12px', color: '#4caf50', textAlign: 'center' }
            })

            fileError = $({
                tag: 'div',
                style: { marginTop: '8px', fontSize: '12px', color: '#f44336', textAlign: 'center' }
            })

            fileInput = $({
                tag: 'input',
                att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
                event: {
                    type: 'change',
                    method: (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            if (file.type !== 'application/pdf') {
                                fileError.innerText = 'Please select a valid PDF file';
                                fileNameDisplay.innerText = '';
                                fileInput.value = '';
                                selectedFile = null;
                            } else if (file.size > 10 * 1024 * 1024) {
                                fileError.innerText = 'File size exceeds 10MB limit';
                                fileNameDisplay.innerText = '';
                                fileInput.value = '';
                                selectedFile = null;
                            } else {
                                fileError.innerText = '';
                                fileNameDisplay.innerText = `✓ Selected: ${file.name}`;
                                selectedFile = file;
                            }
                        }
                    }
                }
            })

            fileSection.appendChild(uploadArea);
            fileSection.appendChild(fileNameDisplay);
            fileSection.appendChild(fileError);
            fileSection.appendChild(fileInput);
            container.appendChild(fileSection);

            // Info notice
            const infoNotice = $({
                tag: 'div',
                style: {
                    padding: '14px',
                    backgroundColor: 'rgba(156, 39, 176, 0.08)',
                    borderRadius: '10px',
                    borderLeft: '4px solid #9C27B0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-info-circle' }, style: { color: '#9C27B0', fontSize: '16px', marginTop: '2px' } }),
                    $({
                        tag: 'div',
                        style: { flex: 1 },
                        child: [
                            $({
                                tag: 'div',
                                text: 'Revision Guidelines:',
                                style: { color: '#9C27B0', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }
                            }),
                            $({
                                tag: 'div',
                                text: 'Please upload your revised research document where evaluator comments and suggestions are applied. The original document will remain along with the new version with revised tag.',
                                style: { color: '#bbb', fontSize: '12px', lineHeight: '1.4' }
                            })
                        ]
                    })
                ]
            })
            container.appendChild(infoNotice);

            return container
        }

        // Build the footer with action buttons
        const buildFooter = ({ closeModal }) => {
            const footerContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    width: '100%'
                }
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
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: () => closeModal(),
                    type2: 'mouseenter',
                    method2: (e) => { e.currentTarget.style.backgroundColor = '#555'; },
                    type3: 'mouseleave',
                    method3: (e) => { e.currentTarget.style.backgroundColor = '#444'; }
                }
            })

            const submitBtn = $({
                tag: 'button',
                text: 'Submit Revision',
                style: {
                    padding: '10px 28px',
                    backgroundColor: '#9C27B0',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: async () => {
                        if (!selectedFile) {
                            AlertModal({
                                title: 'File Required',
                                message: 'Please select the revised research file (PDF)'
                            });
                            return;
                        }

                        if (selectedFile.type !== 'application/pdf') {
                            AlertModal({
                                title: 'Invalid File',
                                message: 'Research file must be a valid PDF file'
                            });
                            return;
                        }

                        if (selectedFile.size > 10 * 1024 * 1024) {
                            AlertModal({
                                title: 'File Too Large',
                                message: 'File size exceeds 10MB limit'
                            });
                            return;
                        }

                        // Show loading modal
                        const loadingModal = LoadingModal({
                            title: 'Submitting Revision',
                            message: 'Please wait while we submit your revision...'
                        });

                        const formData = new FormData();
                        formData.append('submitRevision', 'true');
                        formData.append('original_research_id', doc.id);
                        formData.append('original_title', doc.title);
                        formData.append('researchDoc', selectedFile);

                        try {
                            const response = await fetch('/uploadResearchFile', {
                                method: 'POST',
                                body: formData
                            });

                            const result = await response.json();

                            // Close loading modal
                            if (loadingModal && loadingModal.closeModal) {
                                loadingModal.closeModal();
                            }

                            if (result.status) {
                                AlertModal({
                                    title: 'Success',
                                    message: result.message || 'Revision submitted successfully!',
                                    onClose: () => {
                                        closeModal();
                                        if (window.refreshDocumentsTable) {
                                            window.refreshDocumentsTable();
                                        }
                                    }
                                });
                            } else {
                                AlertModal({
                                    title: 'Submission Failed',
                                    message: 'Failed to submit revision: ' + result.message
                                });
                            }
                        } catch (error) {
                            if (loadingModal && loadingModal.closeModal) {
                                loadingModal.closeModal();
                            }
                            console.error('Revision submission error:', error);
                            AlertModal({
                                title: 'Error',
                                message: 'Error submitting revision: ' + error.message
                            });
                        }
                    }
                }
            })

            // Add hover effect for submit button
            submitBtn.addEventListener('mouseenter', () => { submitBtn.style.backgroundColor = '#7B1FA2'; })
            submitBtn.addEventListener('mouseleave', () => { submitBtn.style.backgroundColor = '#9C27B0'; })

            footerContainer.appendChild(cancelBtn);
            footerContainer.appendChild(submitBtn);

            return footerContainer;
        }

        // Create and open the modal
        CustomModal({
            title: 'Submit Revised Paper/Proposal', content: buildContent,
            footer: buildFooter, size: 'small', onClose: () => {
                if (fileInput) fileInput.value = '';
                selectedFile = null
            }
        });
    }

    // View file in modal (for research, program, endorsement files)
    const viewFileInModal = (fileUrl, fileType = 'research') => {
        // Determine file type display name
        const typeNames = {
            research: 'Research Document',
            program: 'Program File',
            endorsement: 'Endorsement Letter'
        }
        const displayName = typeNames[fileType] || 'Document'

        // Determine accent color
        const accentColors = {
            research: '#2196F3',
            program: '#4caf50',
            endorsement: '#ff9800'
        }
        const accentColor = accentColors[fileType] || '#2196F3'

        // Format URL for preview
        let finalUrl = fileUrl
        if (fileUrl.includes('drive.google.com') && fileUrl.includes('/file/d/')) {
            const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
            if (fileIdMatch && fileIdMatch[1]) {
                finalUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`
            }
        } else if (!fileUrl.includes('http') && !fileUrl.startsWith('/')) {
            finalUrl = '/' + fileUrl
        }

        // Use the reusable modal from lib.js (hide Open Drive as requested)
        FileViewerModal(finalUrl, displayName, accentColor, { showOpenDrive: false })
    }

    // Edit document
    const editDocument = (doc) => {
        // Pre-fill form data
        formData = {
            eventName: doc.eventName || '',
            title: doc.title || '',
            category: doc.category || '',
            presenter: doc.presenter || '',
            author: doc.author || '',
            center: doc.center,
            dateStarted: doc.dateStarted,
            dateCompleted: doc.dateCompleted,
            researchFile: null,
            programFile: null,
            endorsementFile: null,
            localProgramFiles: [],
            localEndorsementFiles: [],
            localEntryFiles: []
        }

        // Open modal with pre-filled data
        openUploadModal(true, doc)
    }

    // Delete document
    const deleteDocument = (doc) => {
        DeleteConfirmModal('Delete Document', `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`).then(async (confirmed) => {
            if (confirmed) {
                try {
                    // Show loading indicator
                    let loading = Waiting()
                    document.body.appendChild(loading)

                    const form = new FormData()
                    form.append('deleteEndorsement', 'true')
                    form.append('docId', doc.endorsement_id || doc.id)

                    const response = await fetch('/uploadResearchFile', {
                        method: 'POST',
                        body: form
                    })

                    const result = await response.json()

                    // Remove loading indicator
                    if (loading && loading.remove) {
                        loading.remove()
                    }

                    if (result.status) {
                        // Remove from table
                        const rows = documentsTable.querySelectorAll('tr')
                        for (let i = 1; i < rows.length; i++) {
                            if (rows[i].cells[2]?.innerText === doc.title) {
                                rows[i].remove()
                                break
                            }
                        }

                        // Update stats after deletion
                        refreshStats()

                        // Show success message
                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                            loadDocuments()
                        }))
                    } else {
                        alert('Failed to delete: ' + result.message)
                    }
                } catch (error) {
                    console.error('Delete error:', error)
                    alert('Error deleting document: ' + error.message)
                }
            }
        })
    }

    // File upload input component
    const FileUploadField = ({ label, fieldName, accept = '.pdf,application/pdf' }) => {
        let fileInput, fileLabel, fileNameDisplay

        const container = $({
            tag: 'div',
            style: { marginBottom: '20px' }
        })

        const labelEl = $({
            tag: 'label',
            text: label,
            style: {
                display: 'block',
                color: '#bbb',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
            }
        })

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

        fileNameDisplay = $({
            tag: 'div',
            style: { marginTop: '8px', fontSize: '12px', color: '#888' }
        })

        fileInput = $({
            tag: 'input',
            att: { type: 'file', accept, style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        if (file.type !== 'application/pdf') {
                            alert('Please select a PDF file')
                            fileInput.value = ''
                            return
                        }
                        fileNameDisplay.innerText = `Selected: ${file.name}`
                        fileNameDisplay.style.color = '#4caf50'
                        formData[fieldName] = file
                    } else {
                        fileNameDisplay.innerText = ''
                        formData[fieldName] = null
                    }
                }
            }
        })

        uploadArea.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '32px', color: '#666', marginBottom: '8px', display: 'block' }
        }))
        uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#888', fontSize: '14px' } }))
        uploadArea.appendChild($({ tag: 'div', text: '(PDF only)', style: { color: '#666', fontSize: '12px', marginTop: '4px' } }))

        container.appendChild(labelEl)
        container.appendChild(uploadArea)
        container.appendChild(fileNameDisplay)
        container.appendChild(fileInput)

        return container
    }

    // Local Files Upload Component (Multiple PDFs)
    const LocalFilesUploadField = ({ label, fieldName }) => {
        let fileInput, fileNameDisplay

        const container = $({
            tag: 'div',
            style: { marginBottom: '20px' }
        })

        const labelEl = $({
            tag: 'label',
            text: label,
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        })

        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #4caf50',
                borderRadius: '8px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(76, 175, 80, 0.05)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click()
            }
        })

        fileNameDisplay = $({
            tag: 'div',
            style: { marginTop: '12px', fontSize: '13px', color: '#888', textAlign: 'left' }
        })

        fileInput = $({
            tag: 'input',
            att: { type: 'file', accept: '.pdf', multiple: true, style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const files = Array.from(e.target.files)
                    if (files.length > 0) {
                        const invalidFiles = files.filter(f => f.type !== 'application/pdf')
                        if (invalidFiles.length > 0) {
                            alert('All files must be PDF format.')
                            fileInput.value = ''
                            formData[fieldName] = []
                            fileNameDisplay.innerHTML = ''
                            return
                        }
                        formData[fieldName] = files
                        fileNameDisplay.innerHTML = files.map(f => `<div style="margin-bottom: 4px color: #4caf50"><i class="fas fa-file-pdf"></i> ${f.name} (${(f.size / 1024).toFixed(1)} KB)</div>`).join('')
                    } else {
                        fileNameDisplay.innerHTML = ''
                        formData[fieldName] = []
                    }
                }
            }
        })

        uploadArea.appendChild($({ tag: 'i', att: { className: 'fas fa-file-upload' }, style: { fontSize: '40px', color: '#4caf50', marginBottom: '12px', display: 'block' } }))
        uploadArea.appendChild($({ tag: 'div', text: 'Select multiple PDF files', style: { color: '#fff', fontSize: '15px', fontWeight: '500' } }))
        uploadArea.appendChild($({ tag: 'div', text: 'Only PDF files are allowed', style: { color: '#666', fontSize: '12px', marginTop: '6px' } }))

        container.appendChild(labelEl)
        container.appendChild(uploadArea)
        container.appendChild(fileNameDisplay)
        container.appendChild(fileInput)

        return container
    }

    // Open upload modal
    const openUploadModal = (isEdit = false, editData = null) => {
        let titleInput, categorySelect, centerSelect, authorInput, presenterInput, coAuthorInput, coAuthorList
        let eventSelect
        let dateStartedField, dateCompletedField
        let dateFieldsContainer
        let programFileContainer
        let standardProgramFile // To store reference
        let localFilesSection, localFilesTitle // For dynamic 

        formData = {
            eventName: isEdit ? editData?.eventName || '' : '',
            title: isEdit ? editData?.title || '' : '',
            category: isEdit ? editData?.category || '' : '',
            center: isEdit ? editData?.center || '' : '',
            presenter: isEdit ? editData?.presenter || '' : '',
            author: isEdit ? editData?.author || '' : '',
            coAuthors: isEdit ? (Array.isArray(editData?.coAuthors) ? editData.coAuthors : JSON.parse(editData?.coAuthors || '[]')) : [],
            researchFile: null,
            programFile: null,
            endorsementFile: null,
            localProgramFiles: [],
            localEndorsementFiles: [],
            localEntryFiles: [],
            date_started: isEdit ? editData?.date_started || '' : '',
            date_completed: isEdit ? editData?.date_completed || '' : ''
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
                backdropFilter: 'blur(5px)'
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
                overflow: 'auto',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
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
                $({ tag: 'h3', text: isEdit ? 'Edit Entry' : 'Submit New Entry', style: { color: '#fff', margin: 0, fontSize: '20px' } }),
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

        // Form body
        const formBody = $({
            tag: 'div',
            style: { padding: '24px' }
        })

        // Two column layout for form fields
        const twoColumnLayout = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }
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
                    if (e && e.target) {
                        const selectedEventName = e.target.value
                        formData.eventName = selectedEventName

                        // Check event types
                        const isSymposium = selectedEventName.toLowerCase().includes('symposium')
                        const isInHouse = selectedEventName.toLowerCase().includes('in house review') || selectedEventName.toLowerCase().includes('in-house review')

                        // Update layout
                        fileGrid.style.gridTemplateColumns = (isSymposium || isInHouse) ? '1fr 1fr' : '1fr 1fr 1fr'

                        if (searchFieldContainer) {
                            searchFieldContainer.style.display = isSymposium ? 'block' : 'none'
                        }
                        // Hide/Show standard program file
                        if (standardProgramFile) {
                            standardProgramFile.style.display = (isSymposium || isInHouse) ? 'none' : 'block'
                        }

                        // Hide/Show dynamic local files section
                        if (localFilesSection) {
                            if (isSymposium || isInHouse) {
                                localFilesSection.style.display = 'block'
                                localFilesTitle.innerText = isSymposium ? 'Local Symposium Files' : 'Local In-House Files'
                            } else {
                                localFilesSection.style.display = 'none'
                                formData.localProgramFiles = []
                                formData.localEndorsementFiles = []
                                formData.localEntryFiles = []
                            }
                        }

                        // Show/hide date fields
                        if (dateFieldsContainer) {
                            dateFieldsContainer.style.display = isSymposium ? 'grid' : 'none'
                        }

                        // Show/hide program file upload
                        if (programFileContainer) {
                            programFileContainer.style.display = (isSymposium || isInHouse) ? 'none' : 'block'
                        }
                    }
                }
            },
            elementHandler: async (el) => {
                if (!el) return
                el.innerHTML = ''

                const defaultOption = $({
                    tag: 'option',
                    text: '-- Select Event Name --',
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
                        data.forEach(val => {
                            el.appendChild($({
                                tag: 'option',
                                text: val.name,
                                style: { backgroundColor: '#2a2a2a', fontSize: '14px' },
                                att: { id: val.id, value: val.name }
                            }))
                        })
                    } else {
                        console.error('Failed to fetch events:', response.status)
                    }
                } catch (error) {
                    console.error('Error fetching events:', error)
                }

                if (isEdit && editData?.eventName) {
                    el.value = editData.eventName
                    // Trigger change event to set initial state
                    const changeEvent = new Event('change')
                    el.dispatchEvent(changeEvent)
                }
            }
        })
        eventField.appendChild(eventSelect)

        // Title field
        const titleField = $({ tag: 'div', style: { marginBottom: '20px' } })
        titleField.appendChild($({ tag: 'label', text: 'Research Title *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        titleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter document title', value: isEdit ? editData?.title || '' : '' },
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
                method: (e) => { formData.title = e.target.value }
            }
        })
        titleField.appendChild(titleInput)

        const searchFieldContainer = $({ tag: 'div', style: { marginBottom: '20px', display: 'none' } })

        searchFieldContainer.appendChild($({
            tag: 'label',
            text: 'Search Research Proposal Title',
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))

        const searchWrapper = $({
            tag: 'div',
            style: { position: 'relative' }
        })

        const searchInputField = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Type to search title, author, or presenter...' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            }
        })

        const resultsDropdown = $({
            tag: 'div',
            style: {
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                maxHeight: '250px',
                overflowY: 'auto',
                zIndex: 1000,
                display: 'none',
                marginTop: '4px'
            }
        })

        searchWrapper.appendChild(searchInputField)
        searchWrapper.appendChild(resultsDropdown)
        searchFieldContainer.appendChild(searchWrapper)

        // Debounced search function
        let searchTimeout
        searchInputField.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const term = e.target.value.trim()

            if (term.length < 2) {
                resultsDropdown.style.display = 'none'
                return
            }

            searchTimeout = setTimeout(() => performTitleSearch(term), 500)
        })

        const performTitleSearch = async (term) => {
            resultsDropdown.innerHTML = '<div style="padding: 12px; color: #888; text-align: center;">Searching...</div>'
            resultsDropdown.style.display = 'block'

            const form = new FormData()
            form.append('searchInhouseTitles', 'true')
            form.append('search', term)

            try {
                const response = await fetch('/uploadResearchFile', { method: 'POST', body: form })
                const data = await response.json()

                if (data.list && data.list.length > 0) {
                    resultsDropdown.innerHTML = ''
                    data.list.forEach(item => {
                        const resultItem = $({
                            tag: 'div',
                            style: {
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #444',
                                transition: 'background 0.2s'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    // Fill the title field only (don't auto-fill other fields)
                                    titleInput.value = item.title
                                    formData.title = item.title
                                    resultsDropdown.style.display = 'none'
                                    searchInputField.value = ''
                                },
                                type2: 'mouseenter',
                                method2: (e) => { e.currentTarget.style.backgroundColor = '#3a3a3a' },
                                type3: 'mouseleave',
                                method3: (e) => { e.currentTarget.style.backgroundColor = 'transparent' }
                            },
                            child: [
                                $({ tag: 'div', text: item.title, style: { color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '4px' } }),
                                $({ tag: 'div', text: `Author: ${item.author || 'N/A'}`, style: { color: '#888', fontSize: '11px' } }),
                                item.presenter ? $({ tag: 'div', text: `Presenter: ${item.presenter}`, style: { color: '#888', fontSize: '11px' } }) : null
                            ]
                        })
                        resultsDropdown.appendChild(resultItem)
                    })
                } else {
                    resultsDropdown.innerHTML = '<div style="padding: 12px; color: #888; text-align: center;">No results found</div>'
                }
            } catch (error) {
                resultsDropdown.innerHTML = '<div style="padding: 12px; color: #f44336; text-align: center;">Error searching</div>'
            }
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchWrapper.contains(e.target)) {
                resultsDropdown.style.display = 'none'
            }
        })

        searchFieldContainer.appendChild(searchWrapper)

        // Category field
        const categoryField = $({ tag: 'div', style: { marginBottom: '20px' } })
        categoryField.appendChild($({ tag: 'label', text: 'Category *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
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
                method: (e) => {
                    formData.category = e.target.value
                    if (centerSelect) {
                        const centers = categoryToCenters[e.target.value] || Object.keys(centerCategoryMapping)
                        centerSelect.innerHTML = ''
                        centerSelect.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                        centers.forEach(center => {
                            centerSelect.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                        })
                    }
                }
            },
            elementHandler: (el) => {
                el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true } }))
                categories.forEach(cat => {
                    el.appendChild($({ tag: 'option', text: cat, att: { value: cat } }))
                })
                if (isEdit && editData?.category) el.value = editData.category
            }
        })
        categoryField.appendChild(categorySelect)

        // Center field
        const centerField = $({ tag: 'div', style: { marginBottom: '20px' } })
        centerField.appendChild($({ tag: 'label', text: 'Center *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        centerSelect = $({
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
                method: (e) => { formData.center = e.target.value }
            },
            elementHandler: (el) => {
                el.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                Object.keys(centerCategoryMapping).forEach(center => {
                    el.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                })
                if (isEdit && editData?.center) el.value = editData.center
            }
        })
        centerField.appendChild(centerSelect)

        // Author field
        const authorField = $({ tag: 'div', style: { marginBottom: '20px' } })
        authorField.appendChild($({ tag: 'label', text: 'Main Author *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        authorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter main author name', value: isEdit ? editData?.author || '' : '' },
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
                method: (e) => { formData.author = e.target.value }
            }
        })
        authorField.appendChild(authorInput)

        // Presenter field
        const presenterField = $({ tag: 'div', style: { marginBottom: '20px' } })
        presenterField.appendChild($({ tag: 'label', text: 'Presenter *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        presenterInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter presenter name', value: isEdit ? editData?.presenter || '' : '' },
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
                method: (e) => { formData.presenter = e.target.value }
            }
        })
        presenterField.appendChild(presenterInput)

        // Co-authors field
        const coAuthorField = $({ tag: 'div', style: { marginBottom: '20px' } })
        coAuthorField.appendChild($({ tag: 'label', text: 'Co-Authors', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

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

        if (isEdit && editData?.coAuthors) {
            formData.coAuthors = [...editData.coAuthors]
            updateCoAuthorList()
        }

        coAuthorField.appendChild(coAuthorInputGroup)
        coAuthorField.appendChild(coAuthorList)

        // Date fields (only shown for Symposium events)
        dateFieldsContainer = $({
            tag: 'div',
            style: {
                display: 'none',  // Hidden by default
                gridColumn: '1 / -1',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }
        })

        // Date Started field
        const dateStartedWrapper = $({ tag: 'div' })
        dateStartedWrapper.appendChild($({ tag: 'label', text: 'Date Started *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        dateStartedField = $({
            tag: 'input',
            att: { type: 'date', value: isEdit ? (editData?.date_started || '') : '' },
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
                method: (e) => { formData.date_started = e.target.value }
            }
        })
        dateStartedWrapper.appendChild(dateStartedField)

        // Date Completed field
        const dateCompletedWrapper = $({ tag: 'div' })
        dateCompletedWrapper.appendChild($({ tag: 'label', text: 'Date Completed *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        dateCompletedField = $({
            tag: 'input',
            att: { type: 'date', value: isEdit ? (editData?.date_completed || '') : '' },
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
                method: (e) => { formData.date_completed = e.target.value }
            }
        })
        dateCompletedWrapper.appendChild(dateCompletedField)

        dateFieldsContainer.appendChild(dateStartedWrapper)
        dateFieldsContainer.appendChild(dateCompletedWrapper)

        //two-column layout
        twoColumnLayout.appendChild(titleField)
        twoColumnLayout.appendChild(searchFieldContainer)
        twoColumnLayout.appendChild(categoryField)
        twoColumnLayout.appendChild(centerField)
        twoColumnLayout.appendChild(authorField)
        twoColumnLayout.appendChild(presenterField)
        twoColumnLayout.appendChild(coAuthorField)
        twoColumnLayout.appendChild(dateFieldsContainer)

        formBody.appendChild(eventField)
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
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px'
            }
        })

        fileGrid.appendChild(FileUploadField({ label: 'Research Entry File', fieldName: 'researchFile' }))
        fileGrid.appendChild(FileUploadField({ label: 'Endorsement Letter', fieldName: 'endorsementFile' }))
        standardProgramFile = FileUploadField({ label: 'Program File', fieldName: 'programFile' })
        fileGrid.appendChild(standardProgramFile)

        fileSection.appendChild(fileGrid)

        // Dynamic Program File section for In-House / Symposium
        localFilesSection = $({
            tag: 'div',
            style: {
                marginTop: '20px',
                padding: '20px',
                backgroundColor: 'rgba(76, 175, 80, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                display: 'none'
            }
        })
        localFilesTitle = $({ tag: 'h4', text: 'Local Files', style: { color: '#4caf50', marginBottom: '16px', fontSize: '16px' } })
        localFilesSection.appendChild(localFilesTitle)

        const localFieldsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }
        })

        localFieldsGrid.appendChild(LocalFilesUploadField({ label: 'Program File *', fieldName: 'localProgramFiles' }))
        localFieldsGrid.appendChild(LocalFilesUploadField({ label: 'Certificate', fieldName: 'localEntryFiles' }))

        localFilesSection.appendChild(localFieldsGrid)

        fileSection.appendChild(localFilesSection)
        formBody.appendChild(fileSection)

        // Form actions
        const actions = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#1a1a1a'
            }
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
            text: isEdit ? 'Submit Edited Entry' : 'Submit New Entry',
            style: {
                padding: '10px 28px',
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            event: {
                type: 'click',
                method: async () => {
                    const isSymposium = formData.eventName.toLowerCase().includes('symposium')
                    const isInHouse = formData.eventName.toLowerCase().includes('in house review') || formData.eventName.toLowerCase().includes('in-house review')

                    // Validate required fields
                    if (!formData.eventName || !formData.title || !formData.category || !formData.center || !formData.author || !formData.presenter) {
                        alert('Please fill in all required fields (*)')
                        return
                    }

                    // File validations for new uploads
                    if (!isEdit) {
                        if (!formData.researchFile || !formData.endorsementFile) {
                            alert('Please upload Research File and Endorsement Letter')
                            return
                        }

                        // Program file validation logic
                        if (isInHouse || isSymposium) {
                            if (!formData.localProgramFiles || formData.localProgramFiles.length === 0 ||
                                !formData.localEndorsementFiles || formData.localEndorsementFiles.length === 0 ||
                                !formData.localEntryFiles || formData.localEntryFiles.length === 0) {
                                alert(`Program File, Endorsement, and Research Entry are all required in the local files section for ${isSymposium ? 'Symposium' : 'In House Review'}`)
                                return
                            }
                        } else {
                            // For other events, program file is optional (as per requirement "becomes required ONLY for...")
                            // But if they did upload one, validate it
                            if (formData.programFile && formData.programFile.type !== 'application/pdf') {
                                alert('Program file must be a valid PDF file')
                                return
                            }
                        }

                        // Validate PDF files
                        if (formData.researchFile && formData.researchFile.type !== 'application/pdf') {
                            alert('Research file must be a valid PDF file')
                            return
                        }
                        if (formData.endorsementFile && formData.endorsementFile.type !== 'application/pdf') {
                            alert('Endorsement letter must be a valid PDF file')
                            return
                        }
                    }

                    // Validate co-authors if any
                    if (formData.coAuthors && formData.coAuthors.length > 0) {
                        const invalidCoAuthors = formData.coAuthors.filter(coAuth => !coAuth.trim())
                        if (invalidCoAuthors.length > 0) {
                            alert("Some co-authors have empty names. Please fix or remove them.")
                            return
                        }
                    }

                    // Validate date fields for Symposium
                    if (isSymposium) {
                        if (!formData.date_started || !formData.date_completed) {
                            alert('Please fill in Date Started and Date Completed for Symposium events')
                            return
                        }
                    }

                    // Show loading indicator
                    let loading = Waiting()
                    document.body.appendChild(loading)

                    const removeLoading = () => {
                        if (loading && loading.remove) {
                            loading.remove()
                        }
                    }

                    try {
                        const form = new FormData()

                        if (isEdit) {
                            form.append('updateResearch', 'true')
                            form.append('docId', editData.id)
                        } else {
                            form.append('uploadResearch', 'true')
                        }

                        // Append all form data
                        form.append('eventType', formData.eventName)
                        form.append('title', formData.title)
                        form.append('category', formData.category)
                        form.append('center', formData.center)
                        form.append('author', formData.author)
                        form.append('presenter', formData.presenter)
                        form.append('coAuthor', JSON.stringify(formData.coAuthors || []))

                        // Append date fields only for Symposium
                        if (isSymposium) {
                            form.append('date_started', formData.date_started)
                            form.append('date_completed', formData.date_completed)
                        }

                        // Append files
                        if (formData.endorsementFile) {
                            form.append('uploadedFileEndorsement', formData.endorsementFile)
                        }
                        if (formData.researchFile) {
                            form.append('researchDoc', formData.researchFile)
                        }
                        // Only append program file if not Symposium and not In-House
                        if (!isSymposium && !isInHouse && formData.programFile) {
                            form.append('programFile', formData.programFile)
                        }

                        // Append multiple local files (Program, Endorsement, Entry)
                        const localFileCategories = [
                            { name: 'localProgramFiles[]', files: formData.localProgramFiles },
                            { name: 'localEndorsementFiles[]', files: formData.localEndorsementFiles },
                            { name: 'localEntryFiles[]', files: formData.localEntryFiles }
                        ]

                        if (isInHouse || isSymposium) {
                            localFileCategories.forEach(cat => {
                                if (cat.files && cat.files.length > 0) {
                                    cat.files.forEach(file => {
                                        form.append(cat.name, file)
                                    })
                                }
                            })
                        }

                        const response = await fetch('/getresearch', {
                            method: 'POST',
                            body: form
                        })

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`)
                        }

                        const dat = await response.json()
                        removeLoading()

                        if (dat.status) {
                            const newDoc = {
                                id: isEdit ? editData.id : (dat.docId || Date.now()),
                                eventName: formData.eventName,
                                title: formData.title,
                                category: formData.category,
                                center: formData.center,
                                author: formData.author,
                                presenter: formData.presenter,
                                coAuthors: formData.coAuthors,
                                researchFile: formData.researchFile ? formData.researchFile.name : (editData?.researchFile || '—'),
                                programFile: formData.programFile ? formData.programFile.name : (editData?.programFile || '—'),
                                endorsementFile: formData.endorsementFile ? formData.endorsementFile.name : (editData?.endorsementFile || '—'),
                                status: isEdit ? (editData.status || 'pending') : 'pending',
                                date: new Date().toISOString(),
                                date_started: formData.date_started,
                                date_completed: formData.date_completed
                            }

                            if (isEdit) {
                                const rows = documentsTable.querySelectorAll('tr')
                                for (let i = 1; i < rows.length; i++) {
                                    if (rows[i].cells[2]?.innerText === editData.title) {
                                        const newRow = createTableRow(newDoc)
                                        rows[i].parentNode.replaceChild(newRow, rows[i])
                                        break
                                    }
                                }
                            } else {
                                const newRow = createTableRow(newDoc)
                                const tbody = documentsTable.querySelector('tbody')
                                const emptyState = tbody.querySelector('.empty-state-row')
                                if (emptyState) emptyState.remove()

                                if (tbody.firstChild) {
                                    tbody.insertBefore(newRow, tbody.firstChild)
                                } else {
                                    tbody.appendChild(newRow)
                                }
                                refreshStats()
                            }

                            document.body.appendChild(ConfirmationAlert(dat.message || (isEdit ? 'Document updated successfully!' : 'Document uploaded successfully!'), () => {
                                modal.remove()
                                if (!isEdit) {
                                    formData = {
                                        eventName: '',
                                        eventId: '',
                                        title: '',
                                        category: '',
                                        center: '',
                                        presenter: '',
                                        author: '',
                                        coAuthors: [],
                                        researchFile: null,
                                        programFile: null,
                                        endorsementFile: null,
                                        localProgramFiles: [],
                                        localEndorsementFiles: [],
                                        localEntryFiles: [],
                                        date_started: null,
                                        date_completed: null
                                    }
                                }
                            }))
                        } else {
                            document.body.appendChild(ConfirmationAlert(dat.message || 'Upload failed. Please try again.', () => { }))
                        }
                    } catch (err) {
                        removeLoading()
                        console.error('Error uploading document:', err)
                        alert('Error uploading document: ' + (err.message || 'Unknown error. Please try again.'))
                    }
                }
            }
        })

        actions.appendChild(cancelBtn)
        actions.appendChild(submitBtn)

        modalContent.appendChild(header)
        modalContent.appendChild(formBody)
        modalContent.appendChild(actions)
        modal.appendChild(modalContent)
        document.body.appendChild(modal)
    }

    // Create the main UI
    const createMainUI = () => {
        const container = $({
            tag: 'div',
            style: {
                padding: '24px',
                backgroundColor: '#121212',
                minHeight: '100vh'
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
                $({ tag: 'h1', text: 'Research Documents', style: { color: '#fff', fontSize: '28px', margin: 0, marginBottom: '8px' } }),
                $({ tag: 'p', text: 'Manage and track all research submissions of this center', style: { color: '#888', fontSize: '14px', margin: 0 } })
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
                $({ tag: 'span', text: 'Submit Entry' })
            ],
            event: {
                type: 'click',
                method: () => openUploadModal(false)
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
                $({ tag: 'span', text: 'View Researches' })
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
            { label: 'Total Documents', value: '0', icon: 'fa-file-alt', color: '#2196F3' },
            { label: 'Pending Review', value: '0', icon: 'fa-clock', color: '#FF9800' },
            { label: 'Accepted', value: '0', icon: 'fa-check-circle', color: '#4CAF50' },
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
                minWidth: '1200px'
            },
            elementHandler: (el) => { documentsTable = el }
        })

        // Table header
        const thead = $({ tag: 'thead' })
        const headerRow = $({ tag: 'tr', style: { backgroundColor: '#2a2a2a', borderBottom: '2px solid #333' } })
        const columns = ['Event Name', 'Status', 'Title', 'Category', 'Presenter', 'Author', 'Co-Authors', 'Research', 'Program', 'Endorsement', 'Actions']

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

        // Loading state
        const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } })
        const loadingCell = $({
            tag: 'td',
            att: { colSpan: columns.length },
            style: { padding: '60px', textAlign: 'center', color: '#666' }
        })
        loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px' } }))
        loadingCell.appendChild($({ tag: 'div', text: 'Loading documents...', style: { fontSize: '14px' } }))
        loadingRow.appendChild(loadingCell)
        tbody.appendChild(loadingRow)

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
            emptyCell.appendChild($({ tag: 'div', text: 'No documents yet', style: { fontSize: '16px', marginBottom: '8px' } }))
            emptyCell.appendChild($({ tag: 'div', text: 'Click the "Upload Document" button to get started', style: { fontSize: '14px' } }))
            emptyRow.appendChild(emptyCell)
            tbody.appendChild(emptyRow)
        }

        const loadDocuments = async () => {
            try {
                // Show loading state
                tbody.innerHTML = ''
                const loadingRow = $({ tag: 'tr', att: { className: 'loading-row' } })
                const loadingCell = $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: { padding: '60px', textAlign: 'center', color: '#666' }
                })
                loadingCell.appendChild($({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '32px', display: 'block', marginBottom: '16px' } }))
                loadingCell.appendChild($({ tag: 'div', text: 'Loading documents...', style: { fontSize: '14px' } }))
                loadingRow.appendChild(loadingCell)
                tbody.appendChild(loadingRow)

                // Use the endpoint that returns user-specific documents by senderid
                const form = new FormData()
                form.append('researchReviewed', 'true')

                const response = await fetch('/uploadResearchFile', {
                    method: 'POST',
                    body: form
                })

                if (response.ok) {
                    const data = await response.text().then(text => text ? JSON.parse(text) : {})

                    // Clear loading state
                    tbody.innerHTML = ''

                    // The researchReviewed endpoint returns an object with a 'list' property
                    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                        let totalDocs = 0
                        let pendingCount = 0
                        let acceptedCount = 0
                        let rejectedCount = 0

                        // Process each endorsement (each contains ResearchDocs)
                        data.list.forEach(endorsement => {
                            // Process each research document under this endorsement
                            if (endorsement.ResearchDocs && Array.isArray(endorsement.ResearchDocs)) {
                                endorsement.ResearchDocs.forEach(researchDoc => {
                                    totalDocs++

                                    // Count status from the endorsement level
                                    const status = (endorsement.status || '').toLowerCase()
                                    if (status === 'rejected') {
                                        rejectedCount++
                                    } else if (status === 'accepted') {
                                        acceptedCount++
                                    } else {
                                        pendingCount++
                                    }

                                    // Parse coauthors if present
                                    let coAuthors = []
                                    if (researchDoc.coauthor) {
                                        try {
                                            coAuthors = JSON.parse(researchDoc.coauthor)
                                        } catch (e) {
                                            coAuthors = []
                                        }
                                    }


                                    // Create document object for table
                                    const documentObj = {
                                        id: researchDoc.docId,
                                        eventName: endorsement.eventType || '—',
                                        title: researchDoc.title || '—',
                                        category: researchDoc.category || '—',
                                        presenter: researchDoc.presenter || '—',
                                        author: researchDoc.author || '—',
                                        coAuthors: coAuthors,
                                        status: researchDoc.status || 'pending',
                                        revision_status: endorsement.revision_status || researchDoc.revision_status || null,
                                        revision_count: endorsement.revision_count || researchDoc.revision_count || 0,
                                        revised_title: endorsement.revised_title || researchDoc.revised_title || null,
                                        title_changed: endorsement.title_changed || researchDoc.title_changed || 0,
                                        researchFile: researchDoc.drive_view_url || researchDoc.researchFile || '—',
                                        programFile: researchDoc.program_drive_view_url || researchDoc.program_drive_file_id || '—',
                                        endorsementFile: endorsement.drive_view_url || endorsement.endorsementFile || '—',
                                        drive_file_id: researchDoc.drive_file_id,
                                        drive_view_url: researchDoc.drive_view_url,
                                        endorsement_id: endorsement.id,
                                        campus: endorsement.campus || researchDoc.campus,
                                        center: endorsement.center || researchDoc.center,
                                        date: endorsement.date,
                                        date_started: researchDoc.date_started || null,
                                        date_completed: researchDoc.date_completed || null,
                                        program_drive_view_url: researchDoc.program_drive_view_url
                                    }
                                    const row = createTableRow(documentObj)
                                    tbody.appendChild(row)
                                })
                            }
                        })

                        // Update stats
                        updateStatsFromData(totalDocs, pendingCount, acceptedCount, rejectedCount)

                        if (totalDocs === 0) {
                            showEmptyState()
                        }
                    } else {
                        showEmptyState()
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

    return createMainUI()
}
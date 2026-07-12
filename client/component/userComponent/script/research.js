import { $, ConfirmationAlert, Waiting, DeleteConfirmModal, FileViewerModal, CustomModal, AlertModal } from '../../../lib/lib.js'
import { handleResubmit } from './resubmit.js'
import { Print } from "../../otherComponent/comment.js"
import { SymposiumModal } from './userUploadComponent/symposiumModal.js'


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
                minHeight: '500px',
                backgroundColor: '#ffffff'
            }
        })

        // Search + Filter Bar
        const searchContainer = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid #e8ecf0',
                flexShrink: 0,
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
                backgroundColor: '#ffffff'
            }
        })

        // Event Filter Dropdown
        const eventFilterWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '10px 16px',
                gap: '10px',
                minWidth: '260px',
                flex: '0 0 auto',
                border: '1px solid #e8ecf0',
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
                }
            }
        })

        const filterIcon = $({
            tag: 'i',
            att: { className: 'fas fa-calendar-alt' },
            style: { color: '#1976D2', fontSize: '16px' }
        })

        eventSelect = $({
            tag: 'select',
            style: {
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#1a2a3a',
                fontSize: '14px',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                fontWeight: '500'
            }
        })

        const placeholderOption = $({
            tag: 'option',
            text: 'Select an event...',
            att: { value: '', disabled: true, selected: true },
            style: { color: '#94a3b8' }
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
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '10px 16px',
                gap: '12px',
                flex: 1,
                border: '1px solid #e8ecf0',
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
                }
            }
        })

        const searchIcon = $({
            tag: 'i',
            att: { className: 'fas fa-search' },
            style: { color: '#94a3b8', fontSize: '16px' }
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
                color: '#1a2a3a',
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
                borderCollapse: 'collapse',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden'
            }
        })

        // Table Header
        const thead = $({ tag: 'thead' })
        const headerRow = $({
            tag: 'tr',
            style: {
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e8ecf0'
            }
        })

        // Updated columns for the research view modal
        const columns = ['Event Name', 'Campus/Center', 'Files']

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
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    backgroundColor: '#f8fafc'
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

    // show a placeholder message in the table body
    const setTableMessage = (iconClass, mainText, subText = '') => {
        if (!tableBody) return
        tableBody.innerHTML = ''
        const row = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 3 },
                    style: { padding: '60px', textAlign: 'center' },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: iconClass },
                            style: { fontSize: '48px', display: 'block', marginBottom: '16px', color: '#94a3b8' }
                        }),
                        $({
                            tag: 'div',
                            text: mainText,
                            style: { fontSize: '16px', marginBottom: '8px', color: '#64748b', fontWeight: '500' }
                        }),
                        ...(subText ? [$({
                            tag: 'div',
                            text: subText,
                            style: { fontSize: '13px', color: '#94a3b8' }
                        })] : [])
                    ]
                })
            ]
        })
        tableBody.appendChild(row)
    }

    // Function to create file tag with modern styling
    const createFileTag = (fileInfo, docId, fileType, fileUrl, presenter) => {
        const fileName = fileInfo.title || fileInfo.name || 'Untitled'
        const isDriveFile = fileUrl && (fileUrl.includes('drive.google.com') || fileUrl.includes('drive.google.com/file/d/'));
        const iconClass = isDriveFile ? 'fab fa-google-drive' : 'fas fa-file-pdf';
        const iconColor = isDriveFile ? '#0F9D58' : '#f44336';
        const bgColor = isDriveFile ? '#E8F5E9' : '#FFEBEE';

        const tag = $({
            tag: 'div',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: bgColor,
                padding: '6px 12px',
                borderRadius: '8px',
                margin: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
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
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.borderColor = iconColor;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
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
                        color: '#1a2a3a',
                        fontSize: '12px',
                        fontWeight: '500',
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
            att: { value: '', disabled: true },
            style: { color: '#94a3b8' }
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
                    att: { value: '', disabled: true },
                    style: { color: '#94a3b8' }
                })
                eventSelect.appendChild(noEventsOption)
                return
            }

            events.forEach(ev => {
                const option = $({
                    tag: 'option',
                    text: ev.name,
                    att: { value: ev.id },
                    style: { color: '#1a2a3a' }
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
                att: { value: '', disabled: true },
                style: { color: '#ef4444' }
            })
            eventSelect.appendChild(errOption)
            setTableMessage('fas fa-exclamation-triangle', 'Could not load event list', err.message)
        } finally {
            eventSelect.disabled = false
        }
    }

    const addResearchToTable = (eventName, location, files) => {
        if (!tableBody) return

        const row = $({
            tag: 'tr',
            att: { 'data-event': `${eventName} ${location} ${files.map(f => f.title || '').join(' ')}` },
            style: {
                borderBottom: '1px solid #f0f2f5',
                transition: 'background-color 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#fafbfc';
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }
        })

        const eventCell = $({
            tag: 'td',
            text: eventName,
            style: {
                padding: '16px 16px',
                color: '#1a2a3a',
                fontSize: '14px',
                verticalAlign: 'top',
                fontWeight: '600'
            }
        })

        const locationCell = $({
            tag: 'td',
            text: location,
            style: {
                padding: '16px 16px',
                color: '#475569',
                fontSize: '14px',
                verticalAlign: 'top'
            }
        })

        const filesCell = $({
            tag: 'td',
            att: { className: 'files-cell' },
            style: { padding: '16px 16px', verticalAlign: 'top' }
        })

        if (files.length === 0) {
            filesCell.appendChild($({
                tag: 'span',
                text: 'No files',
                style: { color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }
            }))
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
                    style: { padding: '60px', textAlign: 'center' },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-spinner fa-pulse' },
                            style: { fontSize: '40px', display: 'block', marginBottom: '16px', color: '#1976D2' }
                        }),
                        $({
                            tag: 'div',
                            text: searchTerm ? `Searching for "${searchTerm}"...` : 'Loading research documents...',
                            style: { fontSize: '14px', color: '#64748b' }
                        })
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

            const response = await fetch('/uploadFacultyDocs', {
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
                        style: { padding: '60px', textAlign: 'center' },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-exclamation-triangle' },
                                style: { fontSize: '40px', display: 'block', marginBottom: '16px', color: '#ef4444' }
                            }),
                            $({
                                tag: 'div',
                                text: 'Failed to load research documents',
                                style: { fontSize: '16px', marginBottom: '8px', color: '#1a2a3a', fontWeight: '500' }
                            }),
                            $({
                                tag: 'div',
                                text: error.message,
                                style: { fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }
                            }),
                            $({
                                tag: 'button',
                                text: 'Retry',
                                style: {
                                    marginTop: '8px',
                                    padding: '10px 24px',
                                    backgroundColor: '#1976D2',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        tableBody.innerHTML = ''
                                        loadResearchData(eventId, searchTerm)
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1565C0';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1976D2';
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
    addResearchToTableFn = addResearchToTable

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
        title: 'Research Document of other Campuses',
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
        campus: '',
        category: '',
        presenter: '',
        author: '',
        coAuthors: [],
        researchFile: null,
        programFile: null,
        endorsementFile: null,
        certificateFile: null,
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
            pending: { bg: '#E6A017', text: 'Pending Proposal', icon: 'fa-clock' },
            accepted: { bg: '#2E7D32', text: 'Proposal Accepted', icon: 'fa-check-circle' },
            rejected: { bg: '#D32F2F', text: 'Rejected Proposal', icon: 'fa-times-circle' },
            review: { bg: '#1976D2', text: 'Under Review', icon: 'fa-eye' },
            revision_pending: { bg: '#7B1FA2', text: 'Waiting for Revised Paper', icon: 'fa-exclamation-circle' },
            revision_submitted: { bg: '#4527A0', text: 'Revised Paper Submitted', icon: 'fa-paper-plane' },
            revision_accepted: { bg: '#00695C', text: 'Revised Paper Accepted', icon: 'fa-check-double' },
            revision_rejected: { bg: '#C2185B', text: 'Rejected Revised Paper', icon: 'fa-times-circle' }
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
                justifyContent: 'center',
                flexWrap: 'wrap'
            }
        })

        // Get current status
        const currentStatus = (rowData.status || '').toLowerCase()

        // Define visibility rules based on your table
        const showComments = !['pending', 'revision_pending'].includes(currentStatus)
        const showEdit = ['pending', 'revision_pending', 'revision_submitted', 'revision_rejected'].includes(currentStatus)
        const showDelete = ['pending', 'revision_pending', 'revision_submitted', 'revision_rejected'].includes(currentStatus)
        const showResubmit = currentStatus === 'rejected'

        // Button style configurations
        const buttonConfigs = {
            comments: {
                background: '#E8F5E9',
                hover: '#C8E6C9',
                icon: '#2E7D32',
                iconClass: 'fa-comment-dots'
            },
            edit: {
                background: '#FFF3E0',
                hover: '#FFE0B2',
                icon: '#E6A017',
                iconClass: 'fa-edit'
            },
            delete: {
                background: '#FFEBEE',
                hover: '#FFCDD2',
                icon: '#D32F2F',
                iconClass: 'fa-trash-alt'
            },
            resubmit: {
                background: '#E3F2FD',
                hover: '#BBDEFB',
                icon: '#1976D2',
                iconClass: 'fa-redo'
            }
        }

        const addTooltip = (element, text) => {
            element.style.position = 'relative';
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.textContent = text;
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1a2a3a;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                    white-space: nowrap;
                    margin-bottom: 8px;
                    z-index: 1000;
                    pointer-events: none;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                `;
                e.currentTarget.style.position = 'relative';
                e.currentTarget.appendChild(tooltip);

                e.currentTarget.addEventListener('mouseleave', () => {
                    if (tooltip && tooltip.remove) tooltip.remove();
                }, { once: true });
            });
            return element;
        };

        // View Comments button
        if (showComments) {
            const viewCommentsBtn = $({
                tag: 'button',
                att: { className: 'action-btn view-comments-btn', title: 'View Comments' },
                style: {
                    background: buttonConfigs.comments.background,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: `fas ${buttonConfigs.comments.iconClass}` },
                        style: { color: buttonConfigs.comments.icon, fontSize: '15px' }
                    })
                ],
                event: {
                    type: 'click',
                    method: () => viewComments(rowData),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.background = buttonConfigs.comments.hover;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.background = buttonConfigs.comments.background;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            });
            addTooltip(viewCommentsBtn, 'View Comments');
            container.appendChild(viewCommentsBtn);
        }

        // Edit button
        if (!hideEditDelete && showEdit) {
            const editBtn = $({
                tag: 'button',
                att: { className: 'action-btn edit-btn', title: 'Edit Document' },
                style: {
                    background: buttonConfigs.edit.background,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: `fas ${buttonConfigs.edit.iconClass}` },
                        style: { color: buttonConfigs.edit.icon, fontSize: '15px' }
                    })
                ],
                event: {
                    type: 'click',
                    method: () => editDocument(rowData),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.background = buttonConfigs.edit.hover;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.background = buttonConfigs.edit.background;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            });
            addTooltip(editBtn, 'Edit Document');
            container.appendChild(editBtn);
        }

        // Delete button
        if (!hideEditDelete && showDelete) {
            const deleteBtn = $({
                tag: 'button',
                att: { className: 'action-btn delete-btn', title: 'Delete Document' },
                style: {
                    background: buttonConfigs.delete.background,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: `fas ${buttonConfigs.delete.iconClass}` },
                        style: { color: buttonConfigs.delete.icon, fontSize: '15px' }
                    })
                ],
                event: {
                    type: 'click',
                    method: () => deleteDocument(rowData),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.background = buttonConfigs.delete.hover;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.background = buttonConfigs.delete.background;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            });
            addTooltip(deleteBtn, 'Delete Document');
            container.appendChild(deleteBtn);
        }

        // Resubmit button (only for rejected)
        if (showResubmit) {
            const resubmitBtn = $({
                tag: 'button',
                att: { className: 'action-btn resubmit-btn', title: 'Resubmit Document' },
                style: {
                    background: buttonConfigs.resubmit.background,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: `fas ${buttonConfigs.resubmit.iconClass}` },
                        style: { color: buttonConfigs.resubmit.icon, fontSize: '15px' }
                    })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation();
                        handleResubmit(rowData.endorsement_id);
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.background = buttonConfigs.resubmit.hover;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.background = buttonConfigs.resubmit.background;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }
                }
            });
            addTooltip(resubmitBtn, 'Resubmit Document');
            container.appendChild(resubmitBtn);
        }

        return container;
    }


    // View Comments Modal with Print functionality
    const viewComments = (doc) => {
        let commentsBody
        let commentsData = []
        let modalInstance = null
        let isRejected = false

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
                    $({ tag: 'div', text: 'Loading...' })
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

            // Only show print button if it's not rejected
            if (!isRejected) {
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
                        method: () => {
                            if (modalInstance) {
                                modalInstance.close();
                            }
                            printComments()
                        }
                    }
                });
                footerContainer.appendChild(printBtn);
            }

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

            footerContainer.appendChild(closeBtn);
            return footerContainer;
        };

        // Create individual comment card for modal display
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

        // Display rejection reason
        const displayRejectionReason = (data) => {
            commentsBody.innerHTML = '';

            const container = $({
                tag: 'div',
                style: {
                    padding: '20px'
                },
                child: [
                    // Warning banner
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '8px',
                            borderLeft: '4px solid #ffc107'
                        },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { color: '#856404', fontSize: '24px' } }),
                            $({ tag: 'span', text: 'This document has been rejected', style: { color: '#856404', fontWeight: 'bold', fontSize: '16px' } })
                        ]
                    }),
                    // Rejection reason
                    $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#2a2a2a',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '16px',
                            borderLeft: '4px solid #dc3545'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    paddingBottom: '8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                                },
                                child: [
                                    $({ tag: 'i', att: { className: 'fas fa-times-circle' }, style: { color: '#dc3545', fontSize: '18px' } }),
                                    $({ tag: 'span', text: 'Rejection Reason', style: { color: '#dc3545', fontWeight: 'bold', fontSize: '15px' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    color: '#ddd',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    padding: '8px 12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px'
                                },
                                text: data.reason || 'No reason provided'
                            })
                        ]
                    }),
                    // Rejection details
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '20px',
                            fontSize: '13px',
                            color: '#888',
                            padding: '8px 4px'
                        },
                        child: [
                            data.date ? $({
                                tag: 'span',
                                child: [
                                    $({ tag: 'strong', text: 'Date: ', style: { color: '#aaa' } }),
                                    $({ tag: 'span', text: new Date(data.date).toLocaleString() })
                                ]
                            }) : null
                        ]
                    })
                ]
            });

            commentsBody.appendChild(container);
        };

        // Display comments in modal
        const displayComments = (data, docInfo) => {
            commentsBody.innerHTML = '';

            if (!data || data.length === 0) {
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

            data.forEach(comment => {
                const commentCard = createCommentCard(comment);
                commentsBody.appendChild(commentCard);
            });
        };

        // Print comments using the Print component
        const printComments = () => {
            if (!commentsData || commentsData.length === 0) {
                AlertModal({
                    title: 'No Comments',
                    message: 'No comments available to print'
                });
                return;
            }

            const printContainer = $({
                tag: 'div',
                style: {
                    padding: '20px',
                    backgroundColor: 'white'
                }
            });

            const headerInfo = $({
                tag: 'div',
                style: {
                    textAlign: 'center',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '2px solid #333'
                },
                child: [
                    $({ tag: 'h1', text: 'Review Comments', style: { marginBottom: '10px' } }),
                    $({ tag: 'p', text: `Document: ${doc.title}`, style: { fontSize: '14px', margin: '5px 0' } }),
                    $({ tag: 'p', text: `Author: ${doc.author} | Campus: ${doc.campus || 'N/A'} | Category: ${doc.category || 'N/A'}`, style: { fontSize: '14px', margin: '5px 0' } })
                ]
            });
            printContainer.appendChild(headerInfo);

            commentsData.forEach((comment, index) => {
                if (index > 0) {
                    printContainer.appendChild($({
                        tag: 'div',
                        style: { pageBreakBefore: 'always' }
                    }));
                }

                const commentDiv = $({
                    tag: 'div',
                    style: {
                        marginBottom: '25px',
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        pageBreakInside: 'avoid'
                    }
                });

                if (comment.evalName) {
                    commentDiv.appendChild($({
                        tag: 'div',
                        style: {
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2196F3',
                            marginBottom: '10px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #eee'
                        },
                        text: `Evaluator: ${comment.evalName}`
                    }));
                }

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
                        const sectionEl = $({
                            tag: 'div',
                            style: { marginBottom: '12px' },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { fontWeight: 'bold', color: '#FF9800', marginBottom: '3px' },
                                    text: section.title + ':'
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        marginLeft: '10px',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.6'
                                    },
                                    text: section.content
                                })
                            ]
                        });
                        commentDiv.appendChild(sectionEl);
                    }
                });

                printContainer.appendChild(commentDiv);
            });

            const printComponent = Print({
                title: doc.title,
                category: doc.category || 'N/A',
                campus: doc.campus || 'N/A',
                author: doc.author || 'N/A',
                date: doc.date || new Date().toLocaleDateString(),
                review: commentsData,
                all: true,
                getHandler: (el) => {
                    const style = document.createElement('style');
                    style.textContent = `
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                                background: white;
                            }
                            .comment-card {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                        }
                    `;
                    if (el.querySelector('head')) {
                        el.querySelector('head').appendChild(style);
                    } else {
                        el.appendChild(style);
                    }
                }
            });

            const printWindow = window.open('', '_blank', 'width=800,height=600,toolbar=yes,scrollbars=yes');
            if (!printWindow) {
                alert('Please allow popups to print comments.');
                return;
            }

            const tempDiv = document.createElement('div');
            tempDiv.appendChild(printComponent);
            const printHtml = tempDiv.innerHTML;

            printWindow.document.write('<!DOCTYPE html><html><head><title>Review Comments - ' + doc.title + '</title></head><body>');
            printWindow.document.write(printHtml);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };

        // Load rejection reason
        const loadRejectionReason = async () => {
            try {
                const form = new FormData();
                form.append('rejectedComments', 'true');
                form.append('docId', doc.id);

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        isRejected = true;
                        displayRejectionReason(data);
                    } else {
                        // No rejection found, try loading comments instead
                        loadComments();
                    }
                } else {
                    throw new Error('Failed to load rejection reason');
                }
            } catch (error) {
                console.error('Error loading rejection reason:', error);
                // Fallback to loading comments
                loadComments();
            }
        };

        // Load comments from API
        const loadComments = async () => {
            try {
                const form = new FormData();
                form.append('commentRequest', 'true');
                form.append('docId', doc.id);

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    commentsData = data;
                    isRejected = false;
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
                        $({ tag: 'div', text: 'Error loading data: ' + error.message })
                    ]
                }));
            }
        };

        // Check if document is rejected first
        const checkDocumentStatus = async () => {
            try {
                const form = new FormData();
                form.append('rejectedComments', 'true');
                form.append('docId', doc.id);

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        isRejected = true;
                        displayRejectionReason(data);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking rejection status:', error);
            }

            // Not rejected or error - load comments
            loadComments();
        };

        // Create and open the modal
        modalInstance = CustomModal({
            title: isRejected ? 'Rejection Reason' : doc.title,
            content: buildContent,
            footer: buildFooter,
            size: 'large',
            onClose: () => {
                commentsData = [];
                isRejected = false;
                modalInstance = null;
            }
        });

        // Load data after modal is open
        setTimeout(() => {
            checkDocumentStatus();
        }, 100);
    }

    const createTableRow = (doc) => {
        const row = $({ tag: 'tr', style: { borderBottom: '1px solid rgba(255,255,255,0.1)' } })
        let status = doc.status || 'pending'
        if (status === 'NULL' || status === 'null' || status === null) {
            status = 'pending'
        }

        const createFileList = () => {
            const container = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }
            })

            const createFileRow = (label, fileUrl, fileType, iconColor) => {
                if (!fileUrl || fileUrl === '—' || fileUrl === null) return null

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
                        color: '#000000',
                        fontWeight: '500'
                    }
                }))

                let fileElement
                if (fileUrl.includes('drive.google.com')) {
                    fileElement = $({
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
                                viewFileInModal(fileUrl, fileType)
                            }
                        }
                    })
                } else {
                    fileElement = $({
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
                            $({ tag: 'i', att: { className: 'fas fa-file-pdf' }, style: { fontSize: '14px' } }),
                            $({ tag: 'span', text: 'View', style: { fontSize: '12px' } })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                viewFileInModal(fileUrl, fileType)
                            }
                        }
                    })
                }

                row.appendChild(fileElement)
                return row
            }

            // Regular files (for all submissions)
            const researchRow = createFileRow('Research', doc.researchFile, 'research', '#2196F3')
            if (researchRow) container.appendChild(researchRow)

            const programRow = createFileRow('Program', doc.programFile, 'program', '#4caf50')
            if (programRow) container.appendChild(programRow)

            const endorsementRow = createFileRow('Endorsement', doc.endorsementFile, 'endorsement', '#ff9800')
            if (endorsementRow) container.appendChild(endorsementRow)

            const certificateRow = createFileRow('Certificate', doc.certificateFile, 'certificate', '#9C27B0')
            if (certificateRow) container.appendChild(certificateRow)

            // Title Change Certificate (from title_certificate_view_url)
            const titleCertificateRow = createFileRow('Title Certificate', doc.title_certificate_view_url, 'title_certificate', '#E91E63')
            if (titleCertificateRow) container.appendChild(titleCertificateRow)

            // Local In-House specific files (Program and Certificate from local_inhouse table)
            if (doc.local_inhouse === 1 || doc.local_inhouse === '1') {
                const localProgramRow = createFileRow('Local Program', doc.local_program_file_view_url, 'program', '#4caf50')
                if (localProgramRow) container.appendChild(localProgramRow)

                const localCertificateRow = createFileRow('Local Certificate', doc.local_certificate_file_view_url, 'certificate', '#9C27B0')
                if (localCertificateRow) container.appendChild(localCertificateRow)
            }

            // If no files
            if (container.children.length === 0) {
                container.appendChild($({
                    tag: 'span',
                    text: '—',
                    style: { color: '#666' }
                }))
            }

            return container
        }

        const reviseButton = createReviseButton(doc)
        const actionButtons = createActionButtons(doc, !!reviseButton)

        const actionsCell = $({
            tag: 'td',
            style: { padding: '16px 12px', verticalAlign: 'middle', textAlign: 'center' }
        })

        // Create container for buttons
        const buttonContainer = $({
            tag: 'div',
            style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }
        })

        if (reviseButton) {
            buttonContainer.appendChild(reviseButton)
        }
        buttonContainer.appendChild(actionButtons)
        actionsCell.appendChild(buttonContainer)

        // ===== TITLE DISPLAY WITH CHANGE FLAG =====
        let titleDisplay

        // Check if title was changed (title_changed == 1 from backend)
        const isTitleChanged = parseInt(doc.title_changed) === 1

        if (isTitleChanged && doc.final_symposium_title) {
            // Title was changed - show both original and new with flag
            titleDisplay = $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                child: [
                    // Original title with strikethrough
                    $({
                        tag: 'div',
                        style: {
                            color: '#94a3b8',
                            fontSize: '11px',
                            textDecoration: 'line-through',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        child: [
                            $({ tag: 'span', text: doc.original_title || '—' }),
                            $({
                                tag: 'span',
                                text: '(Original)',
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '9px',
                                    fontStyle: 'italic'
                                }
                            })
                        ]
                    }),
                    // New title with CHANGE FLAG
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: doc.title || '—',
                                style: {
                                    color: '#1976D2',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }
                            }),
                            // ===== CHANGE FLAG BADGE =====
                            $({
                                tag: 'span',
                                style: {
                                    backgroundColor: '#FFF3E0',
                                    color: '#E65100',
                                    padding: '2px 10px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    border: '1px solid #FFCC80',
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase'
                                },
                                child: [
                                    $({
                                        tag: 'i',
                                        att: { className: 'fas fa-pen' },
                                        style: { fontSize: '9px' }
                                    }),
                                    $({ tag: 'span', text: 'Title Changed' })
                                ],
                                att: { title: 'This title was changed from the original In-House Review title' }
                            })
                        ]
                    })
                ]
            })
        } else {
            // No title change - display normally
            titleDisplay = $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '6px' },
                child: [
                    $({ tag: 'span', text: doc.title || '—' })
                ]
            })
        }

        const cells = [
            doc.eventName || '—',
            getStatusBadge(status),
            titleDisplay,
            doc.category || '—',
            doc.presenter || '—',
            doc.author || '—',
            (doc.coAuthors || []).join(', ') || '—',
            createFileList(),
            actionsCell
        ]

        cells.forEach((content, index) => {
            const td = $({
                tag: 'td',
                style: {
                    padding: '16px 16px',
                    color: '#334155',
                    fontSize: '14px',
                    verticalAlign: 'middle',
                    fontWeight: index === 2 ? '500' : '400'
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
        const currentStatus = (doc.status || '').toLowerCase()

        // Show revise button only for revision_pending or revision_rejected
        const showRevise = currentStatus === 'revision_pending' || currentStatus === 'revision_rejected'

        if (!showRevise) return null

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
                $({ tag: 'span', text: 'Update Revision', style: { marginLeft: '6px', fontSize: '11px', color: 'white', fontWeight: 'bold' } })
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
                        const localFileCategories = [
                            { name: 'programFile', files: formData.programFile },
                            { name: 'certificateFile', files: formData.certificateFile },
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
                        const formData = new FormData();
                        formData.append('submitRevision', 'true');
                        formData.append('original_research_id', doc.id);
                        formData.append('original_title', doc.title);
                        formData.append('researchDoc', selectedFile);

                        try {
                            const response = await fetch('/uploadFacultyDocs', {
                                method: 'POST',
                                body: formData
                            });

                            const result = await response.json();

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

            //hover effect for submit button
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
        const typeNames = {
            research: 'Research Document',
            program: 'Program File',
            endorsement: 'Endorsement Letter',
            certificate: 'Certificate File',
            title_certificate: 'Title Change Certificate'  // <-- ADD THIS
        }
        const displayName = typeNames[fileType] || 'Document'

        // Determine accent color
        const accentColors = {
            research: '#2196F3',
            program: '#4caf50',
            endorsement: '#ff9800',
            certificate: '#9C27B0',
            title_certificate: '#E91E63'  // <-- ADD THIS
        }
        const accentColor = accentColors[fileType] || '#2196F3'

        FileViewerModal(fileUrl, displayName, accentColor, { showOpenDrive: true })
    }

    const editDocument = (doc) => {
        // Extract just the filename from Google Drive URL
        const getFileNameFromUrl = (url) => {
            if (!url || url === '—') return null;
            if (url.includes('drive.google.com')) {
                return 'Google Drive File (kept as is)';
            }
            return url.split('/').pop();
        }

        formData = {
            eventName: doc.eventName || '',
            title: doc.title || '',
            campus: doc.campus || '',
            category: doc.category || '',
            center: doc.center || '',
            presenter: doc.presenter || '',
            author: doc.author || '',
            coAuthors: doc.coAuthors || [],
            researchFile: null,
            programFile: null,
            endorsementFile: null,
            certificateFile: null,
            // Store existing file info for display
            existingResearchFile: getFileNameFromUrl(doc.researchFile),
            existingProgramFile: getFileNameFromUrl(doc.programFile),
            existingEndorsementFile: getFileNameFromUrl(doc.endorsementFile),
            date_started: doc.date_started || '',
            date_completed: doc.date_completed || ''
        }

        openUploadModal(true, doc)
    }

    const deleteDocument = (doc) => {
        DeleteConfirmModal('Delete Document', `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`).then(async (confirmed) => {
            if (confirmed) {
                let loading = null
                try {
                    loading = Waiting()
                    document.body.appendChild(loading)

                    await new Promise(resolve => setTimeout(resolve, 50))

                    const form = new FormData()
                    form.append('deleteEndorsement', 'true')
                    form.append('docId', doc.endorsement_id || doc.id)

                    const response = await fetch('/uploadFacultyDocs', {
                        method: 'POST',
                        body: form
                    })

                    const result = await response.json()

                    if (loading && loading.remove) {
                        loading.remove()
                    }

                    if (result.status) {
                        const rows = documentsTable.querySelectorAll('tr')
                        for (let i = 1; i < rows.length; i++) {
                            if (rows[i].cells[2]?.innerText === doc.title) {
                                rows[i].remove()
                                break
                            }
                        }
                        refreshStats()

                        // FIX: Use AlertModal instead of ConfirmationAlert for success message
                        AlertModal({
                            title: 'Success',
                            message: result.message || 'Document deleted successfully',
                            onClose: () => {
                                if (window.refreshDocumentsTable) {
                                    window.refreshDocumentsTable()
                                }
                            }
                        })
                    } else {
                        AlertModal({
                            title: 'Delete Failed',
                            message: result.message || 'Failed to delete document'
                        })
                    }
                } catch (error) {
                    console.error('Delete error:', error)
                    if (loading && loading.remove) {
                        loading.remove()
                    }
                    AlertModal({
                        title: 'Error',
                        message: 'Error deleting document: ' + error.message
                    })
                }
            }
        })
    }

    // Local Files Upload Component
    const LocalFilesUploadField = ({ label, fieldName }) => {
        let fileInput, fileNameDisplay

        const container = $({
            tag: 'div',
            style: { marginBottom: '10px' }
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
        let titleInput, categorySelect, centerSelect, authorInput, presenterInput, coAuthorInput, coAuthorList, campusSelect
        let eventSelect
        let programFileContainer
        let standardProgramFile
        let localFilesSection, localFilesTitle
        let isSymposiumMode = false
        let symposiumModalActive = false
        let modalContentBody

        formData = {
            eventName: isEdit ? editData?.eventName || '' : '',
            title: isEdit ? editData?.title || '' : '',
            campus: isEdit ? editData?.campus || '' : '',
            category: isEdit ? editData?.category || '' : '',
            center: isEdit ? editData?.center || '' : '',
            presenter: isEdit ? editData?.presenter || '' : '',
            author: isEdit ? editData?.author || '' : '',
            coAuthors: isEdit ? (Array.isArray(editData?.coAuthors) ? editData.coAuthors : JSON.parse(editData?.coAuthors || '[]')) : [],
            researchFile: null,
            programFile: null,
            endorsementFile: null,
            certificateFile: null
        }

        const modal = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 101,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.3s ease'
            },
            elementHandler: (el) => { uploadModal = el }
        })

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #e8ecf0',
                transition: 'all 0.3s ease'
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
                position: 'sticky',
                top: 0,
                backgroundColor: '#ffffff',
                zIndex: 1
            },
            child: [
                $({
                    tag: 'h3',
                    text: isEdit ? 'Edit Entry' : 'Submit New Entry',
                    style: { color: '#1a2a3a', margin: 0, fontSize: '20px', fontWeight: '600' },
                    att: { id: 'modalTitle' }
                }),
                $({
                    tag: 'i',
                    att: { className: 'fas fa-times' },
                    style: { color: '#94a3b8', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s ease' },
                    event: {
                        type: 'click',
                        method: () => modal.remove(),
                        type2: 'mouseenter',
                        method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                        type3: 'mouseleave',
                        method3: (e) => { e.currentTarget.style.color = '#94a3b8' }
                    }
                })
            ]
        })

        // Main content container that will be dynamically swapped
        const mainContentContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                transition: 'all 0.3s ease'
            }
        })

        // Normal Form Content
        const normalFormContent = createNormalFormContent()

        const symposiumPlaceholder = $({
            tag: 'div',
            style: { display: 'none', padding: '24px' },
            att: { id: 'symposiumPlaceholder' }
        })

        mainContentContainer.appendChild(normalFormContent)
        mainContentContainer.appendChild(symposiumPlaceholder)

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
            },
            att: { id: 'modalFooter' }
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
                method: () => modal.remove(),
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
            text: isEdit ? 'Submit Edited Entry' : 'Submit New Entry',
            style: {
                padding: '10px 28px',
                backgroundColor: '#1976D2',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                transition: 'all 0.2s ease'
            },
            att: { id: 'submitBtn' },
            event: {
                type2: 'mouseenter',
                method2: (e) => { e.currentTarget.style.backgroundColor = '#1565C0' },
                type3: 'mouseleave',
                method3: (e) => { e.currentTarget.style.backgroundColor = '#1976D2' }
            }
        })

        submitBtn.addEventListener('click', async () => {
            // Validate required fields
            if (!formData.eventName) {
                alert('Please select an event');
                return;
            }
            if (!formData.title) {
                alert('Please enter a document title');
                return;
            }
            if (!formData.campus) {
                alert('Please select a campus');
                return;
            }
            if (!formData.category) {
                alert('Please select a category');
                return;
            }
            if (!formData.center) {
                alert('Please select a center');
                return;
            }
            if (!formData.author) {
                alert('Please enter main author');
                return;
            }
            if (!formData.presenter) {
                alert('Please enter presenter');
                return;
            }
            if (!formData.researchFile) {
                alert('Please upload the research file');
                return;
            }
            if (!formData.endorsementFile) {
                alert('Please upload the endorsement letter');
                return;
            }

            // Check for In-House event - require program file
            const isInHouse = formData.eventName && formData.eventName.toLowerCase().includes('in-house');
            if (isInHouse && (!formData.programFile || formData.programFile.length === 0)) {
                alert('Program file is required for In-House Review events');
                return;
            }

            // Create FormData for submission
            const submitFormData = new FormData();
            submitFormData.append('uploadResearch', 'true');
            submitFormData.append('eventType', formData.eventName);
            submitFormData.append('title', formData.title);
            submitFormData.append('author', formData.author);
            submitFormData.append('category', formData.category);
            submitFormData.append('center', formData.center);
            submitFormData.append('campus', formData.campus);
            submitFormData.append('coAuthor', JSON.stringify(formData.coAuthors));
            submitFormData.append('presenter', formData.presenter);

            // Append files
            if (formData.researchFile) {
                submitFormData.append('researchDoc', formData.researchFile);
            }
            if (formData.endorsementFile) {
                submitFormData.append('uploadedFileEndorsement', formData.endorsementFile);
            }

            // For In-House events, append program and certificate files
            if (isInHouse) {
                if (formData.programFile && formData.programFile.length > 0) {
                    formData.programFile.forEach(file => {
                        submitFormData.append('programFile', file);
                    });
                }
                if (formData.certificateFile && formData.certificateFile.length > 0) {
                    formData.certificateFile.forEach(file => {
                        submitFormData.append('certificateFile', file);
                    });
                }
            }

            // Show loading
            const loading = Waiting();
            document.body.appendChild(loading);

            try {
                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: submitFormData
                });

                const result = await response.json();

                // Remove loading
                if (loading && loading.remove) loading.remove();

                if (result.status) {
                    // Close modal
                    modal.remove();
                    // Show success message
                    document.body.appendChild(ConfirmationAlert(result.message, () => {
                        if (window.refreshDocumentsTable) {
                            window.refreshDocumentsTable();
                        }
                    }));
                } else {
                    document.body.appendChild(ConfirmationAlert('Submission failed: ' + result.message));
                }
            } catch (error) {
                if (loading && loading.remove) loading.remove();
                console.error('Submission error:', error);
                document.body.appendChild(ConfirmationAlert('Error submitting form: ' + error.message));
            }
        });

        footer.appendChild(cancelBtn)
        footer.appendChild(submitBtn)

        modalContent.appendChild(header)
        modalContent.appendChild(mainContentContainer)
        modalContent.appendChild(footer)
        modal.appendChild(modalContent)
        document.body.appendChild(modal)

        function createNormalFormContent() {
            const container = $({ tag: 'div', style: { display: 'block' }, att: { id: 'normalFormContainer' } })

            // Form body
            const formBody = $({
                tag: 'div',
                style: { padding: '28px' }
            })

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

            // Event selection
            const eventField = $({ tag: 'div', style: { marginBottom: '10px' } })
            eventField.appendChild($({
                tag: 'label',
                text: 'Event Name *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))
            eventSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
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
                    method3: async (e) => {
                        if (e && e.target) {
                            const selectedEventName = e.target.value
                            const selectedOption = e.target.options[e.target.selectedIndex]
                            const selectedEventId = selectedOption ? selectedOption.getAttribute('id') : null

                            // Check if selected event is In-House Review (not Symposium)
                            const isInHouse = selectedEventName && selectedEventName.toLowerCase().includes('in-house')

                            // Check if selected event is Symposium
                            const isSymposium = selectedEventName && selectedEventName.toLowerCase().includes('symposium')

                            if (isSymposium && !isEdit && !symposiumModalActive) {
                                // Animate out normal form
                                normalFormContent.style.opacity = '0'
                                normalFormContent.style.transform = 'translateX(-20px)'

                                setTimeout(() => {
                                    normalFormContent.style.display = 'none'

                                    // Create and show Symposium modal inside the container
                                    showSymposiumInContainer(selectedEventName, selectedEventId)

                                    symposiumPlaceholder.style.display = 'block'
                                    symposiumPlaceholder.style.opacity = '0'
                                    symposiumPlaceholder.style.transform = 'translateX(20px)'

                                    setTimeout(() => {
                                        symposiumPlaceholder.style.opacity = '1'
                                        symposiumPlaceholder.style.transform = 'translateX(0)'
                                    }, 50)

                                    // Update header and footer
                                    const modalTitle = document.querySelector('#modalTitle')
                                    if (modalTitle) modalTitle.innerText = 'Symposium Submission (In-House Review Required)'

                                    submitBtn.style.display = 'none'
                                    isSymposiumMode = true
                                    symposiumModalActive = true
                                }, 300)
                                return
                            }

                            // For non-Symposium events, continue with normal form
                            formData.eventName = selectedEventName
                            formData.eventId = selectedEventId

                            // Show/hide local files section for In-House events only
                            if (localFilesSection) {
                                localFilesSection.style.display = isInHouse ? 'block' : 'none'
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
                        att: { disabled: true, selected: true, value: '' },
                        style: { color: '#94a3b8' }
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
                                    style: { backgroundColor: '#ffffff', fontSize: '14px', color: '#1a2a3a' },
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
                        const changeEvent = new Event('change')
                        el.dispatchEvent(changeEvent)
                    }
                }
            })
            eventField.appendChild(eventSelect)

            // Title field
            const titleField = $({ tag: 'div', style: { marginBottom: '0' } })
            titleField.appendChild($({
                tag: 'label',
                text: 'Document Title *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))
            titleInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter document title', value: isEdit ? capitalizeFirstLetter(editData?.title || '') : '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        formData.title = capitalizeFirstLetter(e.target.value);
                        e.target.value = formData.title;
                    }
                }
            })
            titleField.appendChild(titleInput)

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
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
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
                    const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']
                    const defaultOption = $({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } })
                    el.appendChild(defaultOption)
                    campuses.forEach(campus => {
                        el.appendChild($({ tag: 'option', text: campus, att: { value: campus }, style: { color: '#1a2a3a' } }))
                    })
                    if (isEdit && editData?.campus) el.value = editData.campus
                }
            })
            campusField.appendChild(campusSelect)

            // Category field
            const categoryField = $({ tag: 'div', style: { marginBottom: '0' } })
            categoryField.appendChild($({
                tag: 'label',
                text: 'Category *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))
            categorySelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
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
                    method3: (e) => {
                        formData.category = e.target.value
                        if (centerSelect) {
                            const centers = categoryToCenters[e.target.value] || Object.keys(centerCategoryMapping)
                            centerSelect.innerHTML = ''
                            const defaultOption = $({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } })
                            centerSelect.appendChild(defaultOption)
                            centers.forEach(center => {
                                centerSelect.appendChild($({ tag: 'option', text: center, att: { value: center }, style: { color: '#1a2a3a' } }))
                            })
                        }
                    }
                },
                elementHandler: (el) => {
                    const defaultOption = $({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } })
                    el.appendChild(defaultOption)
                    categories.forEach(cat => {
                        el.appendChild($({ tag: 'option', text: cat, att: { value: cat }, style: { color: '#1a2a3a' } }))
                    })
                    if (isEdit && editData?.category) el.value = editData.category
                }
            })
            categoryField.appendChild(categorySelect)

            // Center field
            const centerField = $({ tag: 'div', style: { marginBottom: '0' } })
            centerField.appendChild($({
                tag: 'label',
                text: 'Center *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))
            centerSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
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
                    method3: (e) => { formData.center = e.target.value }
                },
                elementHandler: (el) => {
                    const defaultOption = $({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } })
                    el.appendChild(defaultOption)
                    Object.keys(centerCategoryMapping).forEach(center => {
                        el.appendChild($({ tag: 'option', text: center, att: { value: center }, style: { color: '#1a2a3a' } }))
                    })
                    if (isEdit && editData?.center) el.value = editData.center
                }
            })
            centerField.appendChild(centerSelect)

            // Author field
            const authorField = $({ tag: 'div', style: { marginBottom: '0' } })
            authorField.appendChild($({
                tag: 'label',
                text: 'Main Author *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))
            authorInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter main author name', value: isEdit ? capitalizeFirstLetter(editData?.author || '') : '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        formData.author = capitalizeFirstLetter(e.target.value);
                        e.target.value = formData.author;
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
                att: { type: 'text', placeholder: 'Enter presenter name', value: isEdit ? capitalizeFirstLetter(editData?.presenter || '') : '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        formData.presenter = capitalizeFirstLetter(e.target.value);
                        e.target.value = formData.presenter;
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
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        e.target.value = capitalizeFirstLetter(e.target.value);
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
                    color: '#fff',
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
                            backgroundColor: '#e8f5e9',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                        },
                        child: [
                            $({ tag: 'span', text: author, style: { color: '#2e7d32' } }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#666', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        formData.coAuthors.splice(idx, 1)
                                        updateCoAuthorList()
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                                    type3: 'mouseleave',
                                    method3: (e) => { e.currentTarget.style.color = '#666' }
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

            twoColumnLayout.appendChild(titleField)
            twoColumnLayout.appendChild(campusField)
            twoColumnLayout.appendChild(categoryField)
            twoColumnLayout.appendChild(centerField)
            twoColumnLayout.appendChild(authorField)
            twoColumnLayout.appendChild(presenterField)
            twoColumnLayout.appendChild(coAuthorField)
            formBody.appendChild(eventField)
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

            fileGrid.appendChild(FileUploadField({ label: 'Research Entry File', fieldName: 'researchFile' }))
            fileGrid.appendChild(FileUploadField({ label: 'Endorsement Letter', fieldName: 'endorsementFile' }))

            fileSection.appendChild(fileGrid)

            // Dynamic Program File section for In-House only (not Symposium)
            localFilesSection = $({
                tag: 'div',
                style: {
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'none'
                }
            })
            localFilesTitle = $({
                tag: 'h4',
                text: 'Local Files',
                style: { color: '#1976D2', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }
            })
            localFilesSection.appendChild(localFilesTitle)

            const localFieldsGrid = $({
                tag: 'div',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                }
            })

            localFieldsGrid.appendChild(LocalFilesUploadField({ label: 'Program File *', fieldName: 'programFile' }))
            localFieldsGrid.appendChild(LocalFilesUploadField({ label: 'Certificate', fieldName: 'certificateFile' }))

            localFilesSection.appendChild(localFieldsGrid)

            fileSection.appendChild(localFilesSection)
            formBody.appendChild(fileSection)

            container.appendChild(formBody)

            return container
        }

        function showSymposiumInContainer(eventName, eventId) {
            // Store current modal for cleanup
            const currentModal = modal;

            // Close the current modal
            currentModal.remove();

            // Create and show the Symposium modal as a standalone modal
            const symposiumModal = SymposiumModal({
                eventName: eventName,
                eventId: eventId,
                onClose: () => {
                    if (window.refreshDocumentsTable) {
                        window.refreshDocumentsTable();
                    }
                },
                onSuccess: () => {
                    if (window.refreshDocumentsTable) {
                        window.refreshDocumentsTable();
                    }
                }
            });

            document.body.appendChild(symposiumModal);
        }

        // FileUploadField
        function FileUploadField({ label, fieldName }) {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }
            }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '24px',
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

            uploadArea.appendChild($({
                tag: 'i', att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '32px', color: '#1976D2', marginBottom: '12px', display: 'block' }
            }))
            uploadArea.appendChild($({
                tag: 'div', text: `Click to upload ${label}`,
                style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' }
            }))
            uploadArea.appendChild($({
                tag: 'div', text: '(PDF only, Max 10MB)',
                style: { color: '#64748b', fontSize: '12px', marginTop: '6px' }
            }))

            const fileNameDisplay = $({
                tag: 'div', style: { marginTop: '12px', fontSize: '13px', color: '#2e7d32', textAlign: 'center', fontWeight: '500' }
            })

            const fileInput = $({
                tag: 'input',
                att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
                event: {
                    type: 'change',
                    method: (e) => {
                        const file = e.target.files[0]
                        if (file) {
                            if (file.type !== 'application/pdf') {
                                alert('Please select a valid PDF file')
                                fileInput.value = ''
                                return
                            }
                            if (file.size > 10 * 1024 * 1024) {
                                alert('File size exceeds 10MB limit')
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
    }

    function capitalizeFirstLetter(str) {
        if (!str) return str;
        return str.split(' ').map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Create the main UI
    const createMainUI = () => {
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
                $({ tag: 'h1', text: 'Research Documents', style: { color: '#3b3b3b', fontSize: '30px', margin: 0, marginBottom: '8px' } }),
                $({ tag: 'p', text: 'Manage and track all research submissions of this center', style: { color: '#3b3b3b', fontSize: '14px', margin: 0 } })
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
                padding: '12px 28px',
                color: '#1a2a3a',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-plus-circle' },
                    style: { color: '#1976D2', fontSize: '16px' }
                }),
                $({ tag: 'span', text: 'Submit Entry', style: { fontWeight: '600' } })
            ],
            event: {
                type: 'click',
                method: () => openUploadModal(false),
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                }
            }
        })

        const viewResearchesBtn = $({
            tag: 'button',
            style: {
                backgroundColor: '#1976D2',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 28px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-table-list' },
                    style: { fontSize: '15px' }
                }),
                $({ tag: 'span', text: 'View Researches' })
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
            { label: 'Pending Proposal/Paper', value: '0', icon: 'fa-clock', color: '#FF9800' },
            { label: 'Accepted Proposal/Paper', value: '0', icon: 'fa-check-circle', color: '#4CAF50' },
            { label: 'Rejected Proposal/Paper', value: '0', icon: 'fa-times-circle', color: '#f44336' }
        ]

        stats.forEach((stat, index) => {
            const card = $({
                tag: 'div',
                style: {
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px 20px',
                    border: '1px solid #e8ecf0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)';
                        e.currentTarget.style.borderColor = stat.color;
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)';
                        e.currentTarget.style.borderColor = '#e8ecf0';
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
                        child: [
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: { color: '#5a6874', fontSize: '14px', fontWeight: '500', letterSpacing: '0.3px' }
                            }),
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
                                    $({
                                        tag: 'i',
                                        att: { className: `fas ${stat.icon}` },
                                        style: { color: stat.color, fontSize: '20px' }
                                    })
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
                                text: index === 0 ? 'Total submissions' : index === 1 ? 'Awaiting review' : index === 2 ? 'Approved documents' : 'Returned for revision',
                                style: { color: '#8a9aa8', fontSize: '12px', fontWeight: '400' }
                            })
                        ]
                    })
                ]
            })
            statsContainer.appendChild(card)
        })

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
                minWidth: '1200px'
            },
            elementHandler: (el) => { documentsTable = el }
        })

        // Table header
        const thead = $({ tag: 'thead' })
        const headerRow = $({
            tag: 'tr',
            style: {
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e8ecf0'
            }
        })

        const columns = ['Event Name', 'Status', 'Title', 'Category', 'Presenter', 'Author', 'Co-Authors', 'Attachments', 'Actions']

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

                const response = await fetch('/uploadFacultyDocs', {
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

                                    // ===== CRITICAL: Capture title_changed and related fields =====
                                    // Get title_changed from researchDoc (backend sends it)
                                    const titleChanged = parseInt(researchDoc.title_changed) === 1
                                    const finalSymposiumTitle = researchDoc.final_symposium_title || null
                                    const originalTitle = researchDoc.original_title || researchDoc.title || '—'

                                    // Determine which title to display
                                    let displayTitle = researchDoc.title || '—'

                                    // If title was changed and we have a final_symposium_title, use it
                                    if (titleChanged && finalSymposiumTitle) {
                                        displayTitle = finalSymposiumTitle
                                    }

                                    // Create document object for table
                                    const documentObj = {
                                        id: researchDoc.docId,
                                        eventName: endorsement.eventType || '—',
                                        // ===== TITLE FIELDS =====
                                        title: displayTitle,
                                        original_title: originalTitle,
                                        final_symposium_title: finalSymposiumTitle,
                                        title_changed: titleChanged ? 1 : 0,
                                        // ===== END TITLE FIELDS =====
                                        category: researchDoc.category || '—',
                                        presenter: researchDoc.presenter || '—',
                                        author: researchDoc.author || '—',
                                        coAuthors: coAuthors,
                                        status: researchDoc.status,
                                        revision_status: endorsement.revision_status || researchDoc.revision_status || null,
                                        revision_count: endorsement.revision_count || researchDoc.revision_count || 0,
                                        revised_title: endorsement.revised_title || researchDoc.revised_title || null,
                                        researchFile: researchDoc.drive_view_url || researchDoc.researchFile || '—',
                                        programFile: researchDoc.program_drive_view_url || researchDoc.program_drive_file_id || '—',
                                        endorsementFile: endorsement.drive_view_url || endorsement.endorsementFile || '—',
                                        certificateFile: researchDoc.certificate_drive_view_url || '—',
                                        title_certificate_view_url: researchDoc.title_certificate_view_url || null,
                                        drive_file_id: researchDoc.drive_file_id,
                                        drive_view_url: researchDoc.drive_view_url,
                                        endorsement_id: endorsement.id,
                                        campus: endorsement.campus || researchDoc.campus,
                                        center: endorsement.center || researchDoc.center,
                                        date: endorsement.date,
                                        date_started: researchDoc.date_started || null,
                                        date_completed: researchDoc.date_completed || null,
                                        program_drive_view_url: researchDoc.program_drive_view_url,
                                        local_inhouse: researchDoc.local_inhouse,
                                        local_program_file_view_url: researchDoc.local_program_file_view_url,
                                        local_certificate_file_view_url: researchDoc.local_certificate_file_view_url
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
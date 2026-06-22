import { $, Waiting, FileViewerModal } from "../../../../lib/lib.js"

export const conductedResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let conductedData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false
    let resourcePersons = []
    let currentStats = {
        totalTrainings: 0,
        totalAttendees: 0
    }

    // Campus options
    const campuses = [
        'All Campuses',
        'Roxas City Main',
        'Tapaz',
        'Burias',
        'Dumarao',
        'Pontevedra',
        'Mambusao',
        'Sigma',
        'Pilar',
        'Dayao'
    ]

    // Center options
    const centers = [
        'All Centers',
        'Crop Science Research & Development Center (CSRDC)',
        'Livestock Research & Development Center (LRDC)',
        'Fisheries Research & Development Center (FRDC)',
        'Food and Industrial Technology Research & Development Center (FITRDC)',
        'Social Science Research & Development Center (SSRDC)',
        'Machinery and Agricultural Technology Engineering Center (MATEC)',
        'Coconut Research and Development Center (Coco RDC)',
        'Extension'
    ]

    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting()
            document.body.appendChild(loadingElement)
        }
    }

    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove()
            loadingElement = null
        }
    }

    const fetchConductedData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            conductedData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_conducted')

            if (cursor) {
                formData.append('cursor', cursor)
            }

            // Add filters
            if (currentCampus !== 'All Campuses') {
                formData.append('filter_type', 'campus')
                formData.append('filter_location', currentCampus)
            }
            if (currentCenter !== 'All Centers') {
                formData.append('filter_type', 'center')
                formData.append('filter_location', currentCenter)
            }

            const response = await fetch('/trainingActivitiesResearch', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const text = await response.text()

            if (!text || text.trim() === '') {
                console.warn('Empty response from server')
                if (!cursor) {
                    showEmptyState()
                }
                return
            }

            let result
            try {
                result = JSON.parse(text)
            } catch (e) {
                console.error('Failed to parse JSON:', text.substring(0, 200))
                throw new Error('Invalid JSON response from server')
            }

            if (result.success) {
                const newData = result.data || []

                if (!cursor) {
                    conductedData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats from summary
                    if (result.summary) {
                        currentStats = {
                            totalTrainings: result.summary.totalTrainings || 0,
                            totalAttendees: result.summary.totalAttendees || 0
                        }
                        totalCount = result.summary.totalTrainings || 0
                        updateStats()
                        console.log('Stats updated:', currentStats) // Debug log
                    }
                } else {
                    conductedData = [...conductedData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                updateTableWithData()
                updateRecordCount()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching conducted data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchConductedData(nextCursor)
        }
    }

    const updateStats = () => {
        // Directly get elements by ID (more reliable)
        const totalTrainingsSpan = document.getElementById('stat-total-trainings-value')
        const totalAttendeesSpan = document.getElementById('stat-total-attendees-value')

        if (totalTrainingsSpan) {
            totalTrainingsSpan.textContent = currentStats.totalTrainings || '0'
        }

        if (totalAttendeesSpan) {
            totalAttendeesSpan.textContent = currentStats.totalAttendees || '0'
        }
    }

    const formatCurrency = (amount) => {
        if (!amount) return '₱0'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const updateRecordCount = () => {
        const recordCount = document.querySelector('.record-count')
        if (recordCount) {
            recordCount.textContent = `${filteredData.length} of ${totalCount} records`
        }
    }

    const updateTableWithData = () => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        if (filteredData.length === 0) {
            showEmptyState()
            return
        }

        filteredData.forEach((item, index) => {
            tableBody.appendChild(createDataRow(item, index + 1))
        })
    }

    const showEmptyState = () => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        // Get the actual column count from the table header
        const headerRow = document.querySelector('.training-conducted-container thead tr')
        let columnCount = 1 // Default fallback
        
        if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th')
            if (headerCells.length > 0) {
                columnCount = headerCells.length
            }
        }

        const emptyState = $({
            tag: 'tr',
            style: {
                backgroundColor: '#ffffff'
            },
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columnCount },
                    style: {
                        padding: '0',
                        border: 'none',
                        backgroundColor: '#ffffff',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: '400px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'empty-state' },
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                color: '#6c757d',
                                fontFamily: 'Segoe UI, sans-serif'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chalkboard-teacher' },
                                    style: {
                                        fontSize: '64px',
                                        marginBottom: '20px',
                                        opacity: 0.2,
                                        color: '#fd7e14'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Training/Activity Records Found',
                                    style: {
                                        fontSize: '20px',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#212529'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Click "Add Training/Activity" to add conducted training records',
                                    style: {
                                        fontSize: '14px',
                                        color: '#6c757d'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    const formatDate = (dateString) => {
        if (!dateString || dateString === '—' || dateString === '0000-00-00') return '—'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    const renderLinks = (links) => {
        if (!links || links === '—') {
            return '—'
        }

        let fileData = {}
        try {
            if (typeof links === 'string') {
                fileData = JSON.parse(links)
            } else if (typeof links === 'object') {
                fileData = links
            } else {
                return '—'
            }
        } catch (e) {
            return '—'
        }

        // Define file sections in order
        const fileSections = [
            { key: 'activityProposal', label: 'Activity Proposal', icon: 'fa-solid fa-file-pdf', color: '#dc3545' },
            { key: 'attendanceSheet', label: 'Attendance Sheet', icon: 'fa-solid fa-users', color: '#28a745' },
            { key: 'activityReport', label: 'Activity Report', icon: 'fa-solid fa-chart-line', color: '#0d6efd' },
            { key: 'program', label: 'Program', icon: 'fa-solid fa-calendar-alt', color: '#6f42c1' }
        ]

        // Check if there are any files
        const hasAnyFile = fileSections.some(section => fileData[section.key]) ||
            (fileData.photos && fileData.photos.length > 0)

        if (!hasAnyFile) {
            return '—'
        }

        // Create a grid layout for files
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '4px 0'
            }
        })

        // Helper to create a file link
        const createFileLink = (url, label, icon, color) => {
            if (!url) return null

            return $({
                tag: 'a',
                att: {
                    href: '#',
                    title: `View ${label}`
                },
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: color,
                    textDecoration: 'none',
                    fontSize: '12px',
                    padding: '8px 10px',
                    backgroundColor: `${color}08`,
                    borderRadius: '6px',
                    border: `1px solid ${color}15`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: icon },
                        style: { fontSize: '13px', width: '18px', color: color }
                    }),
                    $({
                        tag: 'span',
                        text: label,
                        style: {
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#212529',
                            fontWeight: '500'
                        }
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-chevron-right' },
                        style: {
                            fontSize: '10px',
                            color: color,
                            opacity: '0.5',
                            transition: 'opacity 0.2s ease'
                        }
                    })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        FileViewerModal(url, label, color)
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = `${color}12`
                        e.currentTarget.style.borderColor = `${color}30`
                        const arrow = e.currentTarget.querySelector('.fa-chevron-right')
                        if (arrow) arrow.style.opacity = '1'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = `${color}08`
                        e.currentTarget.style.borderColor = `${color}15`
                        const arrow = e.currentTarget.querySelector('.fa-chevron-right')
                        if (arrow) arrow.style.opacity = '0.5'
                    }
                }
            })
        }

        // Add PDF documents in a grid (2 columns)
        const pdfContainer = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px'
            }
        })

        fileSections.forEach(section => {
            const url = fileData[section.key]
            if (url) {
                const link = createFileLink(url, section.label, section.icon, section.color)
                if (link) pdfContainer.appendChild(link)
            }
        })

        if (pdfContainer.children.length > 0) {
            container.appendChild(pdfContainer)
        }

        // Add Photos section (if any)
        if (fileData.photos && fileData.photos.length > 0) {
            const photosLabel = $({
                tag: 'div',
                style: {
                    fontSize: '11px',
                    color: '#6c757d',
                    marginTop: '8px',
                    marginBottom: '4px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-images' },
                        style: { fontSize: '12px', color: '#0d6efd' }
                    }),
                    $({
                        tag: 'span',
                        text: `Photos (${fileData.photos.length})`
                    })
                ]
            })
            container.appendChild(photosLabel)

            const photosContainer = $({
                tag: 'div',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px'
                }
            })

            fileData.photos.forEach((photo, idx) => {
                const photoLink = createFileLink(photo, `Photo ${idx + 1}`, 'fa-solid fa-image', '#28a745')
                if (photoLink) photosContainer.appendChild(photoLink)
            })

            container.appendChild(photosContainer)
        }

        return container
    }

    const renderResourcePersons = (resourcePersons) => {
        if (!resourcePersons || resourcePersons === '—') return '—'

        let persons = []
        try {
            if (typeof resourcePersons === 'string') {
                persons = JSON.parse(resourcePersons)
            } else if (Array.isArray(resourcePersons)) {
                persons = resourcePersons
            } else {
                return resourcePersons
            }
        } catch (e) {
            return resourcePersons
        }

        if (persons.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '4px 0'
            },
            child: persons.map(person => {
                const name = typeof person === 'string' ? person : person.name || 'Unknown'
                const topic = typeof person === 'object' ? person.topic : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '6px 8px',
                        backgroundColor: 'rgba(255, 152, 0, 0.06)',
                        borderRadius: '6px',
                        borderBottom: '1px solid #f1f3f5',
                        transition: 'background 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#212529',
                                fontWeight: '500',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }
                        }),
                        ...(topic ? [
                            $({
                                tag: 'div',
                                text: `Topic: ${topic}`,
                                style: {
                                    color: '#6c757d',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.4',
                                    marginTop: '2px'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    const renderParticipants = (participants) => {
        if (!participants || participants === '—') return '—'

        let parts = []
        try {
            if (typeof participants === 'string') {
                parts = JSON.parse(participants)
            } else if (Array.isArray(participants)) {
                parts = participants
            } else {
                return participants
            }
        } catch (e) {
            return participants
        }

        if (parts.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '4px 0'
            },
            child: parts.map(participant => {
                const name = typeof participant === 'string' ? participant : participant.name || 'Unknown'
                const role = typeof participant === 'object' ? participant.role : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '6px 8px',
                        backgroundColor: 'rgba(111, 66, 193, 0.06)',
                        borderRadius: '6px',
                        borderBottom: '1px solid #f1f3f5',
                        transition: 'background 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#212529',
                                fontWeight: '500',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }
                        }),
                        ...(role ? [
                            $({
                                tag: 'div',
                                text: role,
                                style: {
                                    color: '#6c757d',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.4',
                                    marginTop: '2px'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    const createDataRow = (item, rowNumber) => {
        const cells = []

        // Fixed columns
        const fixedValues = [
            rowNumber.toString(),
            item.title || '—',
            formatDate(item.date),
            item.budgetFundSource || '—',
            item.topics_discussed || '—'
        ]

        fixedValues.forEach((value, index) => {
            const align = index === 0 ? 'center' : 'left'
            cells.push(
                $({
                    tag: 'td',
                    style: {
                        padding: '12px 8px',
                        fontSize: '13px',
                        color: '#212529',
                        border: '1px solid #f1f3f5',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        fontFamily: 'Segoe UI, sans-serif',
                        lineHeight: '1.5',
                        verticalAlign: 'top',
                        textAlign: align,
                        backgroundColor: '#ffffff'
                    },
                    text: value
                })
            )
        })

        // Helper to ensure render functions return a DOM node
        const safeRender = (renderedValue) => {
            return typeof renderedValue === 'string' ? $({ tag: 'span', text: renderedValue }) : renderedValue
        }

        // Resource Persons
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #f1f3f5',
                    verticalAlign: 'top',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [safeRender(renderResourcePersons(item.resourcePersons))]
            })
        )

        // Participants
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #f1f3f5',
                    verticalAlign: 'top',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [safeRender(renderParticipants(item.participants))]
            })
        )

        // Number of Attendees
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #f1f3f5',
                    color: '#28a745',
                    fontWeight: '600',
                    fontSize: '15px',
                    backgroundColor: '#ffffff'
                },
                text: item.attendees || '0'
            })
        )

        // Paper Trail Links
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #f1f3f5',
                    verticalAlign: 'top',
                    maxWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [safeRender(renderLinks(item.paperTrailLinks))]
            })
        )

        // Actions cell
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #f1f3f5',
                    verticalAlign: 'middle',
                    backgroundColor: '#ffffff'
                },
                child: [createActionButtons(item)]
            })
        )

        return $({
            tag: 'tr',
            att: { className: 'data-row' },
            style: {
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease'
            },
            child: cells
        })
    }

    const createActionButtons = (item) => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
            },
            child: [
                // Edit button
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-pen' },
                    style: {
                        color: '#6c757d',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        fontSize: '15px',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'transparent',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Edit',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        }
                    },
                    event2: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.backgroundColor = '#f8f9fa'
                            e.target.style.color = '#0d6efd'
                            e.target.style.border = '1px solid #dee2e6'
                        }
                    },
                    event3: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.target.style.backgroundColor = 'transparent'
                            e.target.style.color = '#6c757d'
                            e.target.style.border = 'none'
                        }
                    }
                }),
                // Delete button
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-trash' },
                    style: {
                        color: '#6c757d',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        fontSize: '15px',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'transparent',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Delete',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteTraining(item)
                        }
                    },
                    event2: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.backgroundColor = '#fff5f5'
                            e.target.style.color = '#dc3545'
                            e.target.style.border = '1px solid #fcc'
                        }
                    },
                    event3: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.target.style.backgroundColor = 'transparent'
                            e.target.style.color = '#6c757d'
                            e.target.style.border = 'none'
                        }
                    }
                })
            ]
        })
    }

    const openAddModal = () => {
        renderModal(null)
    }

    const openEditModal = (item) => {
        renderModal(item)
    }

    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
        }
    }

    const deleteTraining = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this training/activity record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_conducted')
            formData.append('id', item.id)

            const response = await fetch('/trainingActivitiesResearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Training/Activity record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete training/activity record', 'error')
            }
        } catch (error) {
            console.error('Error deleting training:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const renderModal = (item = null) => {
        if (modalElement) {
            modalElement.remove()
        }

        const isEditing = item !== null


        let paperTrailFiles = {
            activityProposal: null,
            attendanceSheet: null,
            activityReport: null,
            program: null,
            photos: []  
        }

        let existingFiles = {
            activityProposal: null,
            attendanceSheet: null,
            activityReport: null,
            program: null,
            photos: []
        }

        if (isEditing && item.paperTrailLinks) {
            try {
                const parsed = typeof item.paperTrailLinks === 'string' ? JSON.parse(item.paperTrailLinks) : item.paperTrailLinks
                if (parsed && typeof parsed === 'object') {
                    if (parsed.activityProposal) existingFiles.activityProposal = parsed.activityProposal
                    if (parsed.attendanceSheet) existingFiles.attendanceSheet = parsed.attendanceSheet
                    if (parsed.activityReport) existingFiles.activityReport = parsed.activityReport
                    if (parsed.program) existingFiles.program = parsed.program

                    if (parsed.photos) {
                        if (Array.isArray(parsed.photos)) {
                            existingFiles.photos = parsed.photos
                        } else if (parsed.photos.urls && Array.isArray(parsed.photos.urls)) {
                            existingFiles.photos = parsed.photos.urls
                        } else if (typeof parsed.photos === 'string') {
                            try {
                                const photoObj = JSON.parse(parsed.photos)
                                if (photoObj.urls && Array.isArray(photoObj.urls)) {
                                    existingFiles.photos = photoObj.urls
                                } else {
                                    existingFiles.photos = []
                                }
                            } catch (e) {
                                existingFiles.photos = []
                            }
                        } else {
                            existingFiles.photos = []
                        }
                        console.log('Loaded photos URLs:', existingFiles.photos) 
                    }
                }
            } catch (e) {
                console.error('Error parsing paper trail files:', e)
            }
        }

        let participants = []
        if (isEditing && item.participants) {
            try {
                participants = typeof item.participants === 'string' ? JSON.parse(item.participants) : item.participants
                if (!Array.isArray(participants)) participants = []
            } catch (e) {
                participants = []
            }
        }

        let resourcePersonsContainer
        let participantsContainer

        const addPhotoPreview = (file, previewContainer, isExisting = false, existingUrl = null) => {
            const photoId = Date.now() + Math.random()

            const extractGoogleDriveFileId = (url) => {
                if (!url) return null

                let match = url.match(/\/file\/d\/([^\/]+)/)
                if (match && match[1]) return match[1]

                match = url.match(/[?&]id=([^&]+)/)
                if (match && match[1]) return match[1]

                match = url.match(/\/uc\?id=([^&]+)/)
                if (match && match[1]) return match[1]

                return null
            }

            let imageUrl = null
            let fileId = null

            if (isExisting && existingUrl) {
                fileId = extractGoogleDriveFileId(existingUrl)
                if (fileId) {
                    // Use proxy endpoint to avoid CORS issues
                    imageUrl = `../../api/get_image.php?fileId=${fileId}&size=400`
                } else {
                    // If it's not a Google Drive URL, use it directly
                    imageUrl = existingUrl
                }
            }

            const photoDiv = $({
                tag: 'div',
                att: { className: 'photo-preview-item', 'data-photo-id': photoId },
                style: {
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                    paddingBottom: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #e8eaed',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }
            })

            photoDiv.addEventListener('mouseenter', () => {
                photoDiv.style.transform = 'scale(1.03)'
                photoDiv.style.borderColor = '#1a73e8'
                photoDiv.style.boxShadow = '0 8px 24px rgba(26,115,232,0.15)'
            })
            photoDiv.addEventListener('mouseleave', () => {
                photoDiv.style.transform = 'scale(1)'
                photoDiv.style.borderColor = '#e8eaed'
                photoDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
            })

            const imgWrapper = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa'
                }
            })

            const img = $({
                tag: 'img',
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                },
                att: {
                    loading: 'lazy',
                    alt: 'Event photo'
                }
            })

            // Loading indicator
            const loadingIndicator = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '28px',
                    height: '28px',
                    border: '3px solid #e8eaed',
                    borderTopColor: '#1a73e8',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'none',
                    zIndex: '1'
                }
            })

            // Error placeholder
            const errorPlaceholder = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#5f6368',
                    display: 'none',
                    zIndex: '1',
                    pointerEvents: 'none'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-image' },
                        style: { fontSize: '32px', display: 'block', marginBottom: '6px', opacity: '0.4' }
                    }),
                    $({
                        tag: 'span',
                        text: 'Failed to load',
                        style: { fontSize: '11px', fontWeight: '500' }
                    }),
                    $({
                        tag: 'div',
                        style: { fontSize: '10px', color: '#9aa0a6', marginTop: '4px' },
                        text: 'Click to retry'
                    })
                ]
            })

            const removeBtn = $({
                tag: 'button',
                att: { type: 'button' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-times' },
                        style: { fontSize: '12px' }
                    })
                ],
                style: {
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(234, 67, 53, 0.92)',
                    border: '2px solid #ffffff',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '2',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(234,67,53,0.3)'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation()
                        photoDiv.remove()
                        if (isExisting) {
                            const index = existingFiles.photos.findIndex(p => p === existingUrl)
                            if (index !== -1) existingFiles.photos.splice(index, 1)
                        } else {
                            const fileIndex = paperTrailFiles.photos.findIndex(f => f === file)
                            if (fileIndex !== -1) paperTrailFiles.photos.splice(fileIndex, 1)
                        }
                        const photoCount = document.getElementById('photo-count')
                        if (photoCount) {
                            photoCount.textContent = `${paperTrailFiles.photos.length + existingFiles.photos.length}`
                        }
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.transform = 'scale(1.15)'
                        e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 1)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,67,53,0.4)'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.92)'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(234,67,53,0.3)'
                    }
                }
            })

            const viewHint = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#fff',
                    fontSize: '11px',
                    textAlign: 'center',
                    padding: '6px',
                    opacity: '0',
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    fontWeight: '500',
                    letterSpacing: '0.3px',
                    zIndex: '1'
                },
                text: '🔍 Click to view'
            })

            imgWrapper.appendChild(img)
            imgWrapper.appendChild(loadingIndicator)
            imgWrapper.appendChild(errorPlaceholder)
            photoDiv.appendChild(imgWrapper)
            photoDiv.appendChild(removeBtn)
            photoDiv.appendChild(viewHint)

            // Show hint on hover
            photoDiv.addEventListener('mouseenter', () => {
                viewHint.style.opacity = '1'
            })
            photoDiv.addEventListener('mouseleave', () => {
                viewHint.style.opacity = '0'
            })

            // Click to retry on error
            errorPlaceholder.addEventListener('click', (e) => {
                e.stopPropagation()
                retryLoadImage()
            })

            // Function to retry loading image
            const retryLoadImage = () => {
                loadingIndicator.style.display = 'block'
                errorPlaceholder.style.display = 'none'
                img.style.display = 'block'
                
                if (isExisting && existingUrl) {
                    loadExistingImage()
                } else if (file) {
                    loadFileImage()
                }
            }

            // Function to load existing image
            const loadExistingImage = () => {
                loadingIndicator.style.display = 'block'
                errorPlaceholder.style.display = 'none'
                img.style.display = 'block'

                // Try different URL formats with proxy
                const urlsToTry = []
                
                if (fileId) {
                    // Use proxy endpoint with different sizes
                    urlsToTry.push(
                        `../../api/get_image.php?fileId=${fileId}&size=400`,
                        `../../api/get_image.php?fileId=${fileId}&size=800`,
                        `../../api/get_image.php?fileId=${fileId}`
                    )
                } else if (existingUrl) {
                    urlsToTry.push(existingUrl)
                    // If it's a direct image URL, try with cache-busting
                    if (existingUrl.startsWith('http')) {
                        urlsToTry.push(`${existingUrl}?t=${Date.now()}`)
                    }
                }

                let currentTry = 0

                const tryNextUrl = () => {
                    if (currentTry >= urlsToTry.length) {
                        // All URLs failed - try direct Google Drive as last resort
                        if (fileId) {
                            const fallbackUrls = [
                                `https://drive.google.com/thumbnail?id=${fileId}&sz=400`,
                                `https://drive.google.com/uc?id=${fileId}&export=view`,
                                `https://drive.google.com/uc?export=view&id=${fileId}`
                            ]
                            
                            let fallbackIndex = 0
                            const tryFallback = () => {
                                if (fallbackIndex >= fallbackUrls.length) {
                                    loadingIndicator.style.display = 'none'
                                    errorPlaceholder.style.display = 'block'
                                    img.style.display = 'none'
                                    return
                                }
                                img.src = fallbackUrls[fallbackIndex]
                                fallbackIndex++
                            }
                            
                            img.onload = () => {
                                loadingIndicator.style.display = 'none'
                                errorPlaceholder.style.display = 'none'
                                img.style.display = 'block'
                            }
                            
                            img.onerror = tryFallback
                            tryFallback()
                        } else {
                            loadingIndicator.style.display = 'none'
                            errorPlaceholder.style.display = 'block'
                            img.style.display = 'none'
                        }
                        return
                    }

                    const url = urlsToTry[currentTry]
                    img.src = url
                    currentTry++
                }

                img.onload = () => {
                    loadingIndicator.style.display = 'none'
                    errorPlaceholder.style.display = 'none'
                    img.style.display = 'block'
                }

                img.onerror = () => {
                    // Try next URL
                    tryNextUrl()
                }

                // Start loading
                tryNextUrl()
            }

            // Function to load file image
            const loadFileImage = () => {
                if (!file) return
                
                const reader = new FileReader()
                reader.onload = (e) => {
                    img.src = e.target.result
                    loadingIndicator.style.display = 'none'
                    errorPlaceholder.style.display = 'none'
                    img.style.display = 'block'
                }
                reader.onerror = () => {
                    loadingIndicator.style.display = 'none'
                    errorPlaceholder.style.display = 'block'
                    img.style.display = 'none'
                }
                reader.readAsDataURL(file)
            }

            // Click handler for viewing full image
            photoDiv.addEventListener('click', (e) => {
                if (e.target === removeBtn || removeBtn.contains(e.target)) {
                    return
                }

                let viewUrl = null
                let viewTitle = 'Event Photo'
                
                if (isExisting && existingUrl) {
                    // Use the original Google Drive URL for viewing
                    viewUrl = existingUrl
                } else if (file) {
                    viewUrl = URL.createObjectURL(file)
                }

                if (viewUrl && typeof FileViewerModal === 'function') {
                    FileViewerModal(viewUrl, viewTitle, '#1a73e8')
                }
            })

            // Load the image based on type
            if (isExisting && existingUrl) {
                loadExistingImage()
            } else if (file) {
                loadFileImage()
            }

            previewContainer.appendChild(photoDiv)
            return photoDiv
        }

        const addResourcePersonField = (name = '', topic = '') => {
            const personIndex = resourcePersons.length
            resourcePersons.push({ name, topic })

            const personRow = $({
                tag: 'div',
                att: { className: 'resource-person-row', 'data-person-index': personIndex },
                style: {
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                    alignItems: 'center',
                    padding: '4px 0'
                },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Resource person name',
                            value: name,
                            className: 'resource-person-name-input'
                        },
                        style: {
                            flex: '1',
                            padding: '10px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '8px',
                            color: '#202124',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        },
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (resourcePersons[personIndex]) {
                                    resourcePersons[personIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '8px 14px',
                            backgroundColor: '#f1f3f4',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#5f6368',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                resourcePersons.splice(personIndex, 1)
                                personRow.remove()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#ea4335'
                                e.currentTarget.style.color = '#ffffff'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f3f4'
                                e.currentTarget.style.color = '#5f6368'
                            }
                        }
                    })
                ]
            })

            return personRow
        }

        const addParticipantField = (name = '', role = '') => {
            const participantIndex = participants.length
            participants.push({ name, role })

            const participantRow = $({
                tag: 'div',
                att: { className: 'participant-row', 'data-participant-index': participantIndex },
                style: {
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                    alignItems: 'center',
                    padding: '4px 0'
                },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Participant name',
                            value: name,
                            className: 'participant-name-input'
                        },
                        style: {
                            flex: '1',
                            padding: '10px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '8px',
                            color: '#202124',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        },
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (participants[participantIndex]) {
                                    participants[participantIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'select',
                        att: { className: 'participant-role-select' },
                        style: {
                            flex: '1.5',
                            padding: '10px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '8px',
                            color: '#202124',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        },
                        child: [
                            $({ tag: 'option', att: { value: '' }, text: '-- Select Role --' }),
                            $({ tag: 'option', att: { value: 'Research Chair', selected: role === 'Research Chair' }, text: 'Research Chair' }),
                            $({ tag: 'option', att: { value: 'Research Coordinator', selected: role === 'Research Coordinator' }, text: 'Research Coordinator' }),
                            $({ tag: 'option', att: { value: 'Faculty', selected: role === 'Faculty' }, text: 'Faculty' }),
                            $({ tag: 'option', att: { value: 'Student', selected: role === 'Student' }, text: 'Student' }),
                            $({ tag: 'option', att: { value: 'Staff', selected: role === 'Staff' }, text: 'Staff' }),
                            $({ tag: 'option', att: { value: 'Extensionist', selected: role === 'Extensionist' }, text: 'Extensionist' }),
                            $({ tag: 'option', att: { value: 'Other', selected: role === 'Other' }, text: 'Other' })
                        ],
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'change',
                            method3: (e) => {
                                if (participants[participantIndex]) {
                                    participants[participantIndex].role = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '8px 14px',
                            backgroundColor: '#f1f3f4',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#5f6368',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                participants.splice(participantIndex, 1)
                                participantRow.remove()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#ea4335'
                                e.currentTarget.style.color = '#ffffff'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f3f4'
                                e.currentTarget.style.color = '#5f6368'
                            }
                        }
                    })
                ]
            })

            return participantRow
        }

        const createFileUploadSection = (label, fileKey, acceptedTypes = '.pdf', required = false, multiple = false) => {
            const container = $({
                tag: 'div',
                style: {
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '2px solid #e8eaed',
                    transition: 'all 0.2s ease'
                }
            })

            const labelElement = $({
                tag: 'label',
                text: label + (required ? ' *' : ''),
                style: {
                    display: 'block',
                    marginBottom: '10px',
                    color: '#202124',
                    fontSize: '14px',
                    fontWeight: '600'
                }
            })

            const fileInput = $({
                tag: 'input',
                att: {
                    type: 'file',
                    accept: acceptedTypes,
                    multiple: multiple
                },
                style: {
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dadce0',
                    borderRadius: '8px',
                    color: '#202124',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'change',
                    method: (e) => {
                        if (multiple) {
                            const files = Array.from(e.target.files)
                            files.forEach(file => {
                                if (file.type.startsWith('image/')) {
                                    paperTrailFiles.photos.push(file)
                                    const previewContainer = container.querySelector('.photo-previews-container')
                                    if (previewContainer) {
                                        addPhotoPreview(file, previewContainer)
                                    }
                                }
                            })
                        } else {
                            const file = e.target.files[0]
                            if (file) {
                                if (acceptedTypes === '.pdf' && file.type !== 'application/pdf') {
                                    showNotification('Please select a PDF file', 'error')
                                    e.target.value = ''
                                    return
                                }
                                paperTrailFiles[fileKey] = file
                                const fileNameSpan = container.querySelector('.file-name')
                                if (fileNameSpan) {
                                    fileNameSpan.textContent = `✓ ${file.name}`
                                    fileNameSpan.style.color = '#1e8e3e'
                                    fileNameSpan.style.fontWeight = '500'
                                }
                            }
                        }
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#1a73e8'
                        e.currentTarget.style.backgroundColor = '#f1f8fe'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.borderColor = '#dadce0'
                        e.currentTarget.style.backgroundColor = '#f8f9fa'
                    }
                }
            })

            container.appendChild(labelElement)
            container.appendChild(fileInput)

            if (!multiple) {
                const fileNameSpan = $({
                    tag: 'span',
                    att: { className: 'file-name' },
                    style: {
                        display: 'block',
                        marginTop: '10px',
                        fontSize: '13px',
                        color: '#5f6368'
                    },
                    text: existingFiles[fileKey] ? `📄 ${existingFiles[fileKey].split('/').pop() || existingFiles[fileKey]}` : 'No file selected'
                })
                container.appendChild(fileNameSpan)
            } else {
                const previewContainer = $({
                    tag: 'div',
                    att: { className: 'photo-previews-container' },
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        marginTop: '16px',
                        gap: '12px'
                    }
                })
                container.appendChild(previewContainer)

                if (isEditing && existingFiles.photos.length > 0) {
                    existingFiles.photos.forEach(photoUrl => {
                        addPhotoPreview(null, previewContainer, true, photoUrl)
                    })
                }
            }

            return container
        }

        modalElement = $({
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
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '900px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid #e9ecef',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#ffffff',
                                zIndex: '1'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: isEditing ? 'Edit Trainings/Activity Conducted/Facilitated' : 'Add Trainings/Activity Conducted/Facilitated',
                                    style: {
                                        margin: '0',
                                        fontSize: '20px',
                                        fontWeight: '500',
                                        color: '#212529'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#6c757d',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#f8f9fa'
                                            e.target.style.color = '#212529'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#888'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Modal body
                        $({
                            tag: 'form',
                            att: { id: 'trainingActivitiesResearch-form' },
                            style: {
                                padding: '24px',
                                overflowY: 'auto'
                            },
                            child: [
                                ...(isEditing ? [
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'hidden',
                                            name: 'id',
                                            value: item.id || ''
                                        }
                                    })
                                ] : []),

                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        // Type selection
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Type *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'select',
                                                    att: {
                                                        name: 'type',
                                                        id: 'training-type-select'
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit',
                                                        appearance: 'none',
                                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'right 14px center',
                                                        paddingRight: '40px'
                                                    },
                                                    child: [
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Type --' }),
                                                        $({ tag: 'option', att: { value: 'campus' }, text: '🏫 Campus' }),
                                                        $({ tag: 'option', att: { value: 'center' }, text: '🏢 Center' })
                                                    ],
                                                    event: {
                                                        type: 'change',
                                                        method: (e) => {
                                                            toggleLocationSelect(e.target.value)
                                                        },
                                                        type2: 'focus',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#1a73e8'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                        },
                                                        type3: 'blur',
                                                        method3: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // Campus/Center selection (dynamic)
                                        $({
                                            tag: 'div',
                                            att: { id: 'location-select-container' },
                                            style: { marginBottom: '24px' }
                                        }),

                                        // Training/Activity Title
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Training/Activity Title *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'text',
                                                        name: 'title',
                                                        value: isEditing ? (item.title || '') : '',
                                                        placeholder: 'Enter training/activity title...',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#1a73e8'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // Date
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Date *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'date',
                                                        name: 'date',
                                                        value: isEditing ? (item.date || '') : '',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit',
                                                        cursor: 'pointer'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#1a73e8'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // Budget & Fund Source
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Budget & Fund Source',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '12px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                position: 'relative'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    text: '₱',
                                                                    style: {
                                                                        position: 'absolute',
                                                                        left: '14px',
                                                                        top: '50%',
                                                                        transform: 'translateY(-50%)',
                                                                        color: '#5f6368',
                                                                        fontSize: '14px',
                                                                        fontWeight: '500'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'input',
                                                                    att: {
                                                                        type: 'number',
                                                                        name: 'budget',
                                                                        value: isEditing ? (item.budget || '') : '',
                                                                        placeholder: '0.00',
                                                                        step: '0.01',
                                                                        min: '0'
                                                                    },
                                                                    style: {
                                                                        width: '100%',
                                                                        padding: '12px 14px 12px 30px',
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '2px solid #e8eaed',
                                                                        borderRadius: '10px',
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        outline: 'none',
                                                                        transition: 'all 0.2s ease',
                                                                        fontFamily: 'inherit'
                                                                    },
                                                                    event: {
                                                                        type: 'focus',
                                                                        method: (e) => {
                                                                            e.target.style.borderColor = '#1a73e8'
                                                                            e.target.style.backgroundColor = '#ffffff'
                                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                                        },
                                                                        type2: 'blur',
                                                                        method2: (e) => {
                                                                            e.target.style.borderColor = '#e8eaed'
                                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                                            e.target.style.boxShadow = 'none'
                                                                        }
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: { 
                                                                name: 'fundSource', 
                                                                placeholder: 'Fund Source (e.g., GAA, STF, TF)', 
                                                                value: isEditing ? (item.fund_source || '') : '' 
                                                            },
                                                            style: {
                                                                padding: '12px 14px',
                                                                backgroundColor: '#f8f9fa',
                                                                border: '2px solid #e8eaed',
                                                                borderRadius: '10px',
                                                                color: '#202124',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                transition: 'all 0.2s ease',
                                                                fontFamily: 'inherit'
                                                            },
                                                            event: {
                                                                type: 'focus',
                                                                method: (e) => {
                                                                    e.target.style.borderColor = '#1a73e8'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                                },
                                                                type2: 'blur',
                                                                method2: (e) => {
                                                                    e.target.style.borderColor = '#e8eaed'
                                                                    e.target.style.backgroundColor = '#f8f9fa'
                                                                    e.target.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        marginTop: '6px',
                                                        fontSize: '12px',
                                                        color: '#5f6368'
                                                    },
                                                    text: '💡 GAA - General Appropriations Act, STF - Special Trust Fund, TF - Trust Fund'
                                                })
                                            ]
                                        }),

                                        // Topics Discussed
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Topics Discussed *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'textarea',
                                                    att: {
                                                        name: 'topics_discussed',
                                                        placeholder: 'Enter topics discussed...',
                                                        rows: '3',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s ease',
                                                        minHeight: '80px'
                                                    },
                                                    text: isEditing ? (item.topics_discussed || '') : '',
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#1a73e8'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                // Resource Persons and Participants section
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '20px',
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        // Resource Persons Column
                                        $({
                                            tag: 'div',
                                            style: {
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                border: '2px solid #e8eaed',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.currentTarget.style.borderColor = '#1a73e8'
                                                    e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.currentTarget.style.borderColor = '#e8eaed'
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                }
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        marginBottom: '16px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                backgroundColor: '#e8f0fe',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-user-tie' },
                                                                    style: { color: '#1a73e8', fontSize: '18px' }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                flex: 1
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Resource Person(s)',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        margin: 0,
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Separate multiple names with commas',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#5f6368',
                                                                        display: 'block',
                                                                        marginTop: '2px'
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            text: 'Required',
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#ea4335',
                                                                backgroundColor: '#fce8e6',
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                fontWeight: '600'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'textarea',
                                                    att: {
                                                        id: 'resource-persons-input',
                                                        name: 'resourcePersons',
                                                        placeholder: 'Enter names separated by commas (e.g., John Doe, Jane Smith)',
                                                        rows: '4'
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#ffffff',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s ease',
                                                        minHeight: '100px'
                                                    },
                                                    text: isEditing && resourcePersons.length > 0 ?
                                                        resourcePersons.map(p => p.name || p).join(', ') : '',
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#1a73e8'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        marginTop: '10px',
                                                        padding: '10px 14px',
                                                        backgroundColor: '#f1f8fe',
                                                        borderRadius: '8px',
                                                        borderLeft: '3px solid #1a73e8'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            style: {
                                                                fontSize: '12px',
                                                                color: '#1a73e8',
                                                                fontWeight: '500'
                                                            },
                                                            text: '💡 Example: Dr. Maria Santos, Prof. Juan Dela Cruz, Engr. Robert Reyes'
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Participants Column
                                        $({
                                            tag: 'div',
                                            style: {
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                border: '2px solid #e8eaed',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.currentTarget.style.borderColor = '#7c3aed'
                                                    e.currentTarget.style.backgroundColor = '#f5f0ff'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.currentTarget.style.borderColor = '#e8eaed'
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                }
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        marginBottom: '16px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                backgroundColor: '#f3e8f9',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-users' },
                                                                    style: { color: '#7c3aed', fontSize: '18px' }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                flex: 1
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Participant(s)',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        margin: 0,
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Separate multiple names with commas',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#5f6368',
                                                                        display: 'block',
                                                                        marginTop: '2px'
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            text: 'Required',
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#ea4335',
                                                                backgroundColor: '#fce8e6',
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                fontWeight: '600'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'textarea',
                                                    att: {
                                                        id: 'participants-input',
                                                        name: 'participants',
                                                        placeholder: 'Enter names separated by commas (e.g., John Doe, Jane Smith)',
                                                        rows: '4'
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        backgroundColor: '#ffffff',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        transition: 'all 0.2s ease',
                                                        minHeight: '100px'
                                                    },
                                                    text: isEditing && participants.length > 0 ?
                                                        participants.map(p => p.name || p).join(', ') : '',
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#7c3aed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        marginTop: '10px',
                                                        padding: '10px 14px',
                                                        backgroundColor: '#f5f0ff',
                                                        borderRadius: '8px',
                                                        borderLeft: '3px solid #7c3aed'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            style: {
                                                                fontSize: '12px',
                                                                color: '#7c3aed',
                                                                fontWeight: '500'
                                                            },
                                                            text: '💡 Example: Dr. Ana Cruz, Prof. Carlos Garcia, 50 Students'
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Number of Attendees
                                $({
                                    tag: 'div',
                                    style: { 
                                        marginBottom: '24px',
                                        padding: '20px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '12px',
                                        border: '2px solid #e8eaed',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#34a853'
                                            e.currentTarget.style.backgroundColor = '#e6f4ea'
                                        },
                                        type2: 'mouseleave',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8eaed'
                                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '12px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#e6f4ea',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            att: { className: 'fa-solid fa-users' },
                                                            style: { color: '#34a853', fontSize: '18px' }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        flex: 1
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'label',
                                                            text: 'Number of Attendees *',
                                                            style: {
                                                                color: '#202124',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                margin: 0,
                                                                display: 'block'
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            text: 'Total number of participants who attended',
                                                            style: {
                                                                fontSize: '12px',
                                                                color: '#5f6368',
                                                                display: 'block',
                                                                marginTop: '2px'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Required',
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#ea4335',
                                                        backgroundColor: '#fce8e6',
                                                        padding: '2px 10px',
                                                        borderRadius: '12px',
                                                        fontWeight: '600'
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'relative'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    text: '👥',
                                                    style: {
                                                        position: 'absolute',
                                                        left: '14px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        fontSize: '16px',
                                                        zIndex: '1'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'number',
                                                        name: 'attendees',
                                                        value: isEditing ? (item.attendees || '') : '',
                                                        placeholder: 'Enter number of attendees...',
                                                        min: '0',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '12px 14px 12px 44px',
                                                        backgroundColor: '#ffffff',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#202124',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#34a853'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(52,168,83,0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e8eaed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = 'none'
                                                        },
                                                        type3: 'input',
                                                        method3: (e) => {
                                                    
                                                            if (e.target.value < 0) {
                                                                e.target.value = 0
                                                            }
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                marginTop: '8px',
                                                display: 'flex',
                                                gap: '16px',
                                                flexWrap: 'wrap'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    style: {
                                                        fontSize: '12px',
                                                        color: '#5f6368',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            text: '📊',
                                                            style: { fontSize: '14px' }
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            text: 'Minimum: 1'
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'span',
                                                    style: {
                                                        fontSize: '12px',
                                                        color: '#5f6368',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            text: '✅',
                                                            style: { fontSize: '14px' }
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            text: 'Must be a positive number'
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                // Paper Trail Files section
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px',
                                        border: '2px solid #e8eaed',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        backgroundColor: '#fafbfc',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1a73e8'
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,115,232,0.08)'
                                        },
                                        type2: 'mouseleave',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8eaed'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '24px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '12px',
                                                        backgroundColor: '#e8f0fe',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'span',
                                                            att: { className: 'fa-solid fa-folder-open' },
                                                            style: { color: '#1a73e8', fontSize: '20px' }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        flex: 1
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'h3',
                                                            style: {
                                                                margin: '0',
                                                                fontSize: '18px',
                                                                color: '#202124',
                                                                fontWeight: '600',
                                                                letterSpacing: '-0.3px'
                                                            },
                                                            text: 'Paper Trail Documents'
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            style: {
                                                                fontSize: '13px',
                                                                color: '#5f6368'
                                                            },
                                                            text: 'Upload supporting documents for this activity'
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Required',
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#ea4335',
                                                        backgroundColor: '#fce8e6',
                                                        padding: '2px 10px',
                                                        borderRadius: '12px',
                                                        fontWeight: '600'
                                                    }
                                                })
                                            ]
                                        }),

                                        // Two column grid layout
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '20px',
                                                alignItems: 'start'
                                            },
                                            child: [
                                                // Left Column - PDF Documents
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '16px'
                                                    },
                                                    child: [
                                                        // Activity Proposal Card
                                                        createModernDocumentCard(
                                                            'Activity Proposal',
                                                            'file-pdf',
                                                            '#ea4335',
                                                            'activity-proposal-input',
                                                            'activity-proposal-filename',
                                                            'activityProposal',
                                                            existingFiles.activityProposal,
                                                            isEditing
                                                        ),
                                                        // Attendance Sheet Card
                                                        createModernDocumentCard(
                                                            'Attendance Sheet',
                                                            'users',
                                                            '#34a853',
                                                            'attendance-sheet-input',
                                                            'attendance-sheet-filename',
                                                            'attendanceSheet',
                                                            existingFiles.attendanceSheet,
                                                            isEditing
                                                        ),
                                                        // Activity Report Card
                                                        createModernDocumentCard(
                                                            'Activity Report',
                                                            'chart-line',
                                                            '#1a73e8',
                                                            'activity-report-input',
                                                            'activity-report-filename',
                                                            'activityReport',
                                                            existingFiles.activityReport,
                                                            isEditing
                                                        ),
                                                        // Program Card
                                                        createModernDocumentCard(
                                                            'Program',
                                                            'calendar-alt',
                                                            '#7c3aed',
                                                            'program-input',
                                                            'program-filename',
                                                            'program',
                                                            existingFiles.program,
                                                            isEditing
                                                        )
                                                    ]
                                                }),

                                                // Right Column - Photos section
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '12px',
                                                        padding: '20px',
                                                        border: '2px solid #e8eaed',
                                                        height: 'fit-content',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'mouseenter',
                                                        method: (e) => {
                                                            e.currentTarget.style.borderColor = '#34a853'
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(52,168,83,0.08)'
                                                        },
                                                        type2: 'mouseleave',
                                                        method2: (e) => {
                                                            e.currentTarget.style.borderColor = '#e8eaed'
                                                            e.currentTarget.style.boxShadow = 'none'
                                                        }
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                marginBottom: '16px'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '10px',
                                                                        backgroundColor: '#e6f4ea',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-images' },
                                                                            style: { color: '#34a853', fontSize: '18px' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        flex: 1
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Event Photos',
                                                                            style: {
                                                                                color: '#202124',
                                                                                fontSize: '14px',
                                                                                fontWeight: '600',
                                                                                margin: 0,
                                                                                display: 'block'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Upload event documentation photos',
                                                                            style: {
                                                                                fontSize: '12px',
                                                                                color: '#5f6368',
                                                                                display: 'block',
                                                                                marginTop: '2px'
                                                                            }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Multiple',
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        color: '#5f6368',
                                                                        backgroundColor: '#f1f3f4',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '12px',
                                                                        fontWeight: '500'
                                                                    }
                                                                })
                                                            ]
                                                        }),

                                                        // Photo upload area
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                marginBottom: '16px'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'input',
                                                                    att: {
                                                                        type: 'file',
                                                                        accept: 'image/jpeg,image/png,image/jpg,image/gif,image/webp',
                                                                        multiple: true,
                                                                        id: 'photos-input'
                                                                    },
                                                                    style: {
                                                                        display: 'none'
                                                                    },
                                                                    event: {
                                                                        type: 'change',
                                                                        method: (e) => {
                                                                            const files = Array.from(e.target.files)
                                                                            files.forEach(file => {
                                                                                if (file.type.startsWith('image/')) {
                                                                                    paperTrailFiles.photos.push(file)
                                                                                    const previewContainer = document.getElementById('photos-preview-container')
                                                                                    if (previewContainer) {
                                                                                        addPhotoPreview(file, previewContainer, false, null)
                                                                                    }
                                                                                }
                                                                            })
                                                                            const photoCount = document.getElementById('photo-count')
                                                                            if (photoCount) {
                                                                                photoCount.textContent = `${paperTrailFiles.photos.length + existingFiles.photos.length}`
                                                                            }
                                                                            showNotification(`${files.length} photo(s) selected. Click "Update Training/Activity" to save changes.`, 'info')
                                                                            e.target.value = ''
                                                                        }
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '2px dashed #dadce0',
                                                                        borderRadius: '12px',
                                                                        padding: '28px',
                                                                        textAlign: 'center',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        marginBottom: '16px'
                                                                    },
                                                                    event: {
                                                                        type: 'click',
                                                                        method: (e) => {
                                                                            const fileInput = document.getElementById('photos-input')
                                                                            if (fileInput) fileInput.click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.borderColor = '#1a73e8'
                                                                            e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.borderColor = '#dadce0'
                                                                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                                        }
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { fontSize: '36px', color: '#1a73e8', display: 'block', marginBottom: '12px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'Click or drag to upload photos',
                                                                            style: { fontSize: '14px', color: '#202124', marginBottom: '4px', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'JPG, PNG, GIF, WEBP supported',
                                                                            style: { fontSize: '12px', color: '#5f6368' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        marginBottom: '12px'
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Uploaded Photos:',
                                                                            style: { fontSize: '13px', color: '#5f6368', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { id: 'photo-count' },
                                                                            text: `${existingFiles.photos.length}`,
                                                                            style: {
                                                                                fontSize: '13px',
                                                                                color: '#1a73e8',
                                                                                fontWeight: '600',
                                                                                backgroundColor: '#e8f0fe',
                                                                                padding: '2px 14px',
                                                                                borderRadius: '12px'
                                                                            }
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),

                                                        // Photos preview grid
                                                        $({
                                                            tag: 'div',
                                                            att: { id: 'photos-preview-container' },
                                                            style: {
                                                                display: 'grid',
                                                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                                gap: '10px',
                                                                maxHeight: '350px',
                                                                overflowY: 'auto',
                                                                padding: '4px'
                                                            },
                                                            elementHandler: (el) => {
                                                                el.innerHTML = ''
                                                                if (isEditing && existingFiles.photos && existingFiles.photos.length > 0) {
                                                                    existingFiles.photos.forEach((photoUrl, index) => {
                                                                        addPhotoPreview(null, el, true, photoUrl, index)
                                                                    })
                                                                }
                                                                if ((!isEditing || !existingFiles.photos || existingFiles.photos.length === 0) && paperTrailFiles.photos.length === 0) {
                                                                    const emptyMessage = $({
                                                                        tag: 'div',
                                                                        text: 'No photos uploaded yet',
                                                                        style: {
                                                                            gridColumn: '1 / -1',
                                                                            textAlign: 'center',
                                                                            padding: '30px',
                                                                            color: '#9aa0a6',
                                                                            fontSize: '13px'
                                                                        }
                                                                    })
                                                                    el.appendChild(emptyMessage)
                                                                }
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                // Modal footer
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        marginTop: '24px',
                                        borderTop: '1px solid #444',
                                        paddingTop: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            att: { type: 'button' },
                                            text: 'Cancel',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#aaa',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: closeModal,
                                                type2: 'mouseenter',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#333'
                                                },
                                                type3: 'mouseleave',
                                                method3: (e) => {
                                                    e.target.style.backgroundColor = 'transparent'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            att: { type: 'submit' },
                                            text: isEditing ? 'Update Training/Activity' : 'Add Training/Activity',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#ff9800',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.target.style.backgroundColor = '#e68900'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#ff9800'
                                                }
                                            }
                                        })
                                    ]
                                })
                            ],
                            event: {
                                type: 'submit',
                                method: async (e) => {
                                    e.preventDefault()
                                    const submitBtn = e.target.querySelector('button[type="submit"]')
                                    if (submitBtn) {
                                        if (submitBtn.disabled) return
                                        submitBtn.disabled = true
                                        submitBtn.style.opacity = '0.7'
                                        submitBtn.style.cursor = 'wait'
                                    }
                                    await saveTrainingData(isEditing, paperTrailFiles, existingFiles)
                                    if (submitBtn) {
                                        submitBtn.disabled = false
                                        submitBtn.style.opacity = '1'
                                        submitBtn.style.cursor = 'pointer'
                                    }
                                }
                            }
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(modalElement)
        // Helper function to create modern document cards
        function createModernDocumentCard(title, icon, color, inputId, fileNameId, fileKey, existingFile, isEditing) {
            const iconMap = {
                'file-pdf': 'fa-solid fa-file-pdf',
                'users': 'fa-solid fa-users',
                'chart-line': 'fa-solid fa-chart-line',
                'calendar-alt': 'fa-solid fa-calendar-alt'
            };
            
            const colorMap = {
                '#ea4335': { bg: '#fce8e6', border: '#f5c6cb' },
                '#34a853': { bg: '#e6f4ea', border: '#b7e1cd' },
                '#1a73e8': { bg: '#e8f0fe', border: '#c5d8f9' },
                '#7c3aed': { bg: '#f3e8f9', border: '#e0c4f4' }
            };

            return $({
                tag: 'div',
                style: {
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '2px solid #e8eaed',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.borderColor = color
                        e.currentTarget.style.boxShadow = `0 4px 12px ${color}25`
                        e.currentTarget.style.transform = 'translateY(-2px)'
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8eaed'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }
                },
                child: [
                    // Header
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '14px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: colorMap[color].bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: iconMap[icon] },
                                        style: { color: color, fontSize: '16px' }
                                    })
                                ]
                            }),
                            $({
                                tag: 'label',
                                text: title,
                                style: {
                                    flex: 1,
                                    color: '#202124',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    margin: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-cloud-upload-alt' },
                                style: { color: '#9aa0a6', fontSize: '14px' }
                            })
                        ]
                    }),

                    // Hidden file input
                    $({
                        tag: 'input',
                        att: {
                            type: 'file',
                            accept: '.pdf',
                            id: inputId
                        },
                        style: {
                            display: 'none'
                        },
                        event: {
                            type: 'change',
                            method: (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    if (file.type !== 'application/pdf') {
                                        showNotification('Please select a PDF file', 'error')
                                        e.target.value = ''
                                        return
                                    }
                                    paperTrailFiles[fileKey] = file
                                    const fileNameSpan = document.getElementById(fileNameId)
                                    if (fileNameSpan) {
                                        fileNameSpan.textContent = `✅ ${file.name}`
                                        fileNameSpan.style.color = '#1e8e3e'
                                    }
                                    showNotification('New file selected. Click "Update Training/Activity" to save changes.', 'info')
                                }
                            }
                        }
                    }),

                    // Upload button
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        style: {
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '10px',
                            color: '#202124',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontFamily: 'inherit'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-upload' },
                                style: { fontSize: '14px', color: color }
                            }),
                            $({
                                tag: 'span',
                                text: 'Upload Document'
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                const fileInput = document.getElementById(inputId)
                                if (fileInput) fileInput.click()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = color
                                e.currentTarget.style.borderColor = color
                                e.currentTarget.style.color = '#ffffff'
                                e.currentTarget.querySelector('.fa-upload').style.color = '#ffffff'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa'
                                e.currentTarget.style.borderColor = '#e8eaed'
                                e.currentTarget.style.color = '#202124'
                                e.currentTarget.querySelector('.fa-upload').style.color = color
                            }
                        }
                    }),

                    // File name display
                    $({
                        tag: 'div',
                        att: { id: fileNameId },
                        style: {
                            marginTop: '10px',
                            fontSize: '12px',
                            color: '#5f6368',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                            fontWeight: '500'
                        },
                        text: existingFile ?
                            `📄 ${existingFile.split('/').pop() || 'Document'}` :
                            'No file selected'
                    }),

                    // View Document button (only if file exists in edit mode)
                    ...(existingFile && isEditing ? [
                        $({
                            tag: 'button',
                            att: { type: 'button' },
                            style: {
                                marginTop: '8px',
                                width: '100%',
                                padding: '8px',
                                backgroundColor: 'transparent',
                                border: '2px solid #e8eaed',
                                borderRadius: '8px',
                                color: '#1a73e8',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontFamily: 'inherit'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-eye' },
                                    style: { fontSize: '12px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'View Document'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    FileViewerModal(existingFile, title, color)
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f8fe'
                                    e.currentTarget.style.borderColor = '#1a73e8'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.borderColor = '#e8eaed'
                                }
                            }
                        })
                    ] : [])
                ]
            });
        }
        // Initialize location select based on existing data
        setTimeout(() => {
            const typeSelect = document.getElementById('training-type-select')
            if (isEditing && item.type) {
                typeSelect.value = item.type
                toggleLocationSelect(item.type, item.location)
            } else {
                toggleLocationSelect('', '')
            }
        }, 100)
    }

    const toggleLocationSelect = (type, selectedValue = '') => {
        const container = document.getElementById('location-select-container')
        if (!container) return

        container.innerHTML = ''

        if (!type) {
            container.appendChild(
                $({
                    tag: 'p',
                    text: 'Please select a type first',
                    style: {
                        color: '#6c757d',
                        fontSize: '13px',
                        fontStyle: 'italic'
                    }
                })
            )
            return
        }

        const options = type === 'campus' ? campuses.filter(c => c !== 'All Campuses') : centers.filter(c => c !== 'All Centers')
        const labelText = type === 'campus' ? 'Select Campus *' : 'Select Center *'

        container.appendChild(
            $({
                tag: 'div',
                child: [
                    $({
                        tag: 'label',
                        text: labelText,
                        style: {
                            display: 'block',
                            marginBottom: '6px',
                            color: '#202124',
                            fontSize: '14px',
                            fontWeight: '600'
                        }
                    }),
                    $({
                        tag: 'select',
                        att: {
                            name: 'location',
                            required: true
                        },
                        style: {
                            width: '100%',
                            padding: '12px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '10px',
                            color: '#202124',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            // Remove default chevron
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none'
                        },
                        child: [
                            $({ tag: 'option', att: { value: '' }, text: `-- Select ${type === 'campus' ? 'Campus' : 'Center'} --` }),
                            ...options.map(opt =>
                                $({
                                    tag: 'option',
                                    att: { value: opt, selected: opt === selectedValue },
                                    text: opt
                                })
                            )
                        ],
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            }
                        }
                    })
                ]
            })
        )
    }

    const saveTrainingData = async (isEditing, paperTrailFiles, existingFiles) => {
        const form = document.getElementById('trainingActivitiesResearch-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_conducted' : 'add_conducted')

        const resourcePersonsText = document.getElementById('resource-persons-input')?.value || ''
        const participantsText = document.getElementById('participants-input')?.value || ''

        formData.append('resourcePersons', resourcePersonsText)
        formData.append('participants', participantsText)

        if (paperTrailFiles.activityProposal) {
            formData.append('activity_proposal', paperTrailFiles.activityProposal)
        } else if (existingFiles.activityProposal) {
            formData.append('existing_activity_proposal', existingFiles.activityProposal)
        }

        if (paperTrailFiles.attendanceSheet) {
            formData.append('attendance_sheet', paperTrailFiles.attendanceSheet)
        } else if (existingFiles.attendanceSheet) {
            formData.append('existing_attendance_sheet', existingFiles.attendanceSheet)
        }

        if (paperTrailFiles.activityReport) {
            formData.append('activity_report', paperTrailFiles.activityReport)
        } else if (existingFiles.activityReport) {
            formData.append('existing_activity_report', existingFiles.activityReport)
        }

        if (paperTrailFiles.program) {
            formData.append('program', paperTrailFiles.program)
        } else if (existingFiles.program) {
            formData.append('existing_program', existingFiles.program)
        }

        if (paperTrailFiles.photos && paperTrailFiles.photos.length > 0) {
            paperTrailFiles.photos.forEach((photo, index) => {
                formData.append(`photos[]`, photo)
            })
        }
        if (existingFiles.photos && existingFiles.photos.length > 0) {
            formData.append('existing_photos', JSON.stringify(existingFiles.photos))
        }

        showLoading()
        try {
            const response = await fetch('/trainingActivitiesResearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Training/Activity updated successfully' : 'Training/Activity added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving training/activity data', 'error')
            }
        } catch (error) {
            console.error('Error saving training data:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const refreshData = async () => {
        conductedData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        initialLoadDone = false
        currentStats = {
            totalTrainings: 0,
            totalAttendees: 0
        }

        // Reset stats display immediately
        const statValues = document.querySelectorAll('.stat-value')
        if (statValues.length >= 2) {
            statValues[0].textContent = '0'
            statValues[1].textContent = '0'
        }

        // Fetch fresh data
        await fetchConductedData()
    }

    const FilterBar = () => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
                flexWrap: 'wrap',
                gap: '15px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chalkboard-teacher' },
                                    style: { color: '#fd7e14', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Research Related -Trainings/Activity Conducted/Facilitated',
                                    style: {
                                        color: '#212529',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        margin: '0',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'record-count' },
                                    style: {
                                        backgroundColor: '#f1f3f5',
                                        color: '#6c757d',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #dee2e6'
                                    },
                                    text: '0 of 0 records'
                                })
                            ]
                        }),
                        // Filters
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '12px',
                                backgroundColor: '#f8f9fa',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                border: '1px solid #dee2e6'
                            },
                            child: [
                                // Campus filter
                                $({
                                    tag: 'select',
                                    att: { className: 'campus-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '160px',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    },
                                    child: campuses.map(c =>
                                        $({
                                            tag: 'option',
                                            att: { value: c },
                                            text: c,
                                            selected: c === currentCampus
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: async (e) => {
                                            currentCampus = e.target.value
                                            await refreshData()
                                        }
                                    },
                                    event2: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.target.style.border = '1px solid #0d6efd'
                                            e.target.style.borderRadius = '8px'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                        }
                                    },
                                    event3: {
                                        type: 'blur',
                                        method: (e) => {
                                            e.target.style.border = 'none'
                                            e.target.style.boxShadow = 'none'
                                        }
                                    }
                                }),
                                // Center filter
                                $({
                                    tag: 'select',
                                    att: { className: 'center-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '250px',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    },
                                    child: centers.map(c =>
                                        $({
                                            tag: 'option',
                                            att: { value: c },
                                            text: c.length > 40 ? c.substring(0, 40) + '...' : c,
                                            selected: c === currentCenter
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: async (e) => {
                                            currentCenter = e.target.value
                                            await refreshData()
                                        }
                                    },
                                    event2: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.target.style.border = '1px solid #0d6efd'
                                            e.target.style.borderRadius = '8px'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                        }
                                    },
                                    event3: {
                                        type: 'blur',
                                        method: (e) => {
                                            e.target.style.border = 'none'
                                            e.target.style.boxShadow = 'none'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Add Training button
                $({
                    tag: 'button',
                    text: '+ Add Training/Activity',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#0d6efd',
                        border: 'none',
                        borderRadius: '25px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
                    },
                    event: {
                        type: 'click',
                        method: openAddModal
                    },
                    event2: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.backgroundColor = '#0b5ed7'
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.4)'
                        }
                    },
                    event3: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.target.style.backgroundColor = '#0d6efd'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 2px 8px rgba(13, 110, 253, 0.3)'
                        }
                    }
                })
            ]
        })
    }

    const StatsCards = () => {
        const container = $({
            tag: 'div',
            att: { className: 'stats-cards' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e8eaed'
            },
            child: [
                // Total Trainings
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '2px solid #e8eaed',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(253, 126, 20, 0.10)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(253, 126, 20, 0.15)',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chalkboard-teacher' },
                                    style: { color: '#fd7e14', fontSize: '26px', transition: 'all 0.3s ease' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-value', id: 'stat-total-trainings-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#202124',
                                        lineHeight: '1.2',
                                        transition: 'color 0.3s ease'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Trainings',
                                    style: {
                                        fontSize: '13px',
                                        color: '#5f6368',
                                        fontWeight: '500',
                                        transition: 'color 0.3s ease'
                                    }
                                })
                            ]
                        })
                    ],
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            const card = e.currentTarget
                            card.style.transform = 'translateY(-4px)'
                            card.style.borderColor = '#fd7e14'
                            card.style.boxShadow = '0 8px 24px rgba(253, 126, 20, 0.15)'
                            card.style.backgroundColor = '#f8f9fa'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            const card = e.currentTarget
                            card.style.transform = 'translateY(0)'
                            card.style.borderColor = '#e8eaed'
                            card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)'
                            card.style.backgroundColor = '#ffffff'
                        }
                    }
                }),
                // Total Attendees
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '2px solid #e8eaed',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(40, 167, 69, 0.10)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(40, 167, 69, 0.15)',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-users' },
                                    style: { color: '#28a745', fontSize: '26px', transition: 'all 0.3s ease' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-value', id: 'stat-total-attendees-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#202124',
                                        lineHeight: '1.2',
                                        transition: 'color 0.3s ease'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Attendees',
                                    style: {
                                        fontSize: '13px',
                                        color: '#5f6368',
                                        fontWeight: '500',
                                        transition: 'color 0.3s ease'
                                    }
                                })
                            ]
                        })
                    ],
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            const card = e.currentTarget
                            card.style.transform = 'translateY(-4px)'
                            card.style.borderColor = '#28a745'
                            card.style.boxShadow = '0 8px 24px rgba(40, 167, 69, 0.15)'
                            card.style.backgroundColor = '#f8f9fa'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            const card = e.currentTarget
                            card.style.transform = 'translateY(0)'
                            card.style.borderColor = '#e8eaed'
                            card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)'
                            card.style.backgroundColor = '#ffffff'
                        }
                    }
                })
            ]
        })

        // Store references for direct updates
        container.totalTrainingsSpan = container.querySelector('#stat-total-trainings-value')
        container.totalAttendeesSpan = container.querySelector('#stat-total-attendees-value')

        return container
    }

    const TableHeader = () => {
        const headers = [
            'NO.',
            'Training/Activity Title',
            'Date',
            'Budget & Fund Source\n(GAA/STF/TF/etc)',
            'Topic Discussed',
            'Resource Person\nper Topic',
            'Participants\n(Research Chair or Coordinator/\nFaculty/Students/etc)',
            'No. of\nAttendees',
            'Link to the Paper Trail\n(Activity proposal, attendance sheet,\nphoto, activity report, program)',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'Date', 'No. of\nAttendees', 'ACTIONS'].includes(header)

            const th = $({
                tag: 'th',
                text: header,
                style: {
                    padding: '12px 8px',
                    textAlign: isCenter ? 'center' : 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#495057',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    position: 'sticky',
                    top: '0',
                    zIndex: '10'
                }
            })
            row.appendChild(th)
        })

        return $({
            tag: 'thead',
            child: [row]
        })
    }

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 280px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e9ecef'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchConductedData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '2000px',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: (el) => {
                                tableBody = el
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Show notification
    const showNotification = (message, type = 'info') => {
        const notification = $({
            tag: 'div',
            text: message,
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: type === 'error' ? '#e91e63' : '#4caf50',
                color: '#fff',
                fontSize: '14px',
                zIndex: '1040',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'slideIn 0.3s ease'
            }
        })

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transition = 'opacity 0.3s'
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }

    // Return main container
    return $({
        tag: 'div',
        att: { className: 'trainingActivitiesResearch-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/conducted.css',
        elementHandler: (el) => {
            mainContainer = el
        },
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

export default conductedResearch
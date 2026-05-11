import { $, Waiting } from "../../../../lib/lib.js"

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

    // Stats state
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

    // Show loading
    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting()
            document.body.appendChild(loadingElement)
        }
    }

    // Hide loading
    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove()
            loadingElement = null
        }
    }

    // Fetch conducted training data
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
                formData.append('campus', currentCampus)
            }
            if (currentCenter !== 'All Centers') {
                formData.append('center', currentCenter)
            }

            const response = await fetch('/api/conducted-research', {
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

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalTrainings
                        updateStats()
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

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchConductedData(nextCursor)
        }
    }

    // Update statistics
    const updateStats = () => {
        const statValues = document.querySelectorAll('.stat-value')
        if (statValues.length >= 2) {
            statValues[0].textContent = currentStats.totalTrainings
            statValues[1].textContent = currentStats.totalAttendees2
        }
    }

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '₱0'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    // Update record count
    const updateRecordCount = () => {
        const recordCount = document.querySelector('.record-count')
        if (recordCount) {
            recordCount.textContent = `${filteredData.length} of ${totalCount} records`
        }
    }

    // Update table with data
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

    // Show empty state
    const showEmptyState = () => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        const emptyState = $({
            tag: 'div',
            att: { className: 'empty-state' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '350px',
                marginLeft: '90%',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif',
                gridColumn: '1 / -1'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-chalkboard-teacher' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#ff9800'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Training/Activity Records Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add Training/Activity" to add conducted training records',
                    style: {
                        fontSize: '14px',
                        opacity: 0.7
                    }
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    // Format date
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

    // Render links as clickable elements (updated for file structure)
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

        // Create sections for different file types
        const sections = []
        
        // Helper to create file links
        const createFileLink = (url, label, icon) => {
            if (!url) return null
            return $({
                tag: 'a',
                att: {
                    href: url,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                },
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ff9800',
                    textDecoration: 'none',
                    fontSize: '12px',
                    padding: '6px 10px',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                    marginBottom: '6px',
                    transition: 'all 0.2s ease'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: icon },
                        style: { fontSize: '12px' }
                    }),
                    $({
                        tag: 'span',
                        text: label
                    })
                ],
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.2)'
                        e.currentTarget.style.textDecoration = 'underline'
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 152, 0, 0.1)'
                        e.currentTarget.style.textDecoration = 'none'
                    }
                }
            })
        }

        // Activity Proposal
        if (fileData.activityProposal) {
            const link = createFileLink(fileData.activityProposal, 'Activity Proposal', 'fa-solid fa-file-pdf')
            if (link) sections.push(link)
        }

        // Attendance Sheet
        if (fileData.attendanceSheet) {
            const link = createFileLink(fileData.attendanceSheet, 'Attendance Sheet', 'fa-solid fa-file-pdf')
            if (link) sections.push(link)
        }

        // Activity Report
        if (fileData.activityReport) {
            const link = createFileLink(fileData.activityReport, 'Activity Report', 'fa-solid fa-file-pdf')
            if (link) sections.push(link)
        }

        // Program
        if (fileData.program) {
            const link = createFileLink(fileData.program, 'Program', 'fa-solid fa-file-pdf')
            if (link) sections.push(link)
        }

        // Photos
        if (fileData.photos && fileData.photos.length > 0) {
            sections.push(
                $({
                    tag: 'div',
                    style: {
                        marginTop: '8px',
                        marginBottom: '4px',
                        fontSize: '11px',
                        color: '#aaa',
                        fontWeight: '500'
                    },
                    text: '📸 Photos:'
                })
            )
            
            fileData.photos.forEach((photo, idx) => {
                const link = createFileLink(photo, `Photo ${idx + 1}`, 'fa-solid fa-image')
                if (link) sections.push(link)
            })
        }

        if (sections.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            },
            child: sections
        })
    }

    // Render resource persons
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
                gap: '4px'
            },
            child: persons.map(person => {
                const name = typeof person === 'string' ? person : person.name || 'Unknown'
                const topic = typeof person === 'object' ? person.topic : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '4px 0',
                        borderBottom: '1px solid #444',
                        fontSize: '12px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#ddd',
                                fontWeight: '500',
                                lineHeight: '1.4'
                            }
                        }),
                        ...(topic ? [
                            $({
                                tag: 'div',
                                text: `Topic: ${topic}`,
                                style: {
                                    color: '#888',
                                    fontSize: '11px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.3'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    // Render participants
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
                gap: '4px'
            },
            child: parts.map(participant => {
                const name = typeof participant === 'string' ? participant : participant.name || 'Unknown'
                const role = typeof participant === 'object' ? participant.role : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '4px 0',
                        borderBottom: '1px solid #444',
                        fontSize: '12px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#ddd',
                                fontWeight: '500',
                                lineHeight: '1.4'
                            }
                        }),
                        ...(role ? [
                            $({
                                tag: 'div',
                                text: role,
                                style: {
                                    color: '#888',
                                    fontSize: '11px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.3'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    // Create data row
    const createDataRow = (item, rowNumber) => {
        const cells = []

        // Fixed columns
        const fixedValues = [
            rowNumber.toString(),
            item.title || '—',
            formatDate(item.date),
            item.venue || '—',
            item.budgetFundSource || '—',
            item.topicsDiscussed || '—'
        ]

        fixedValues.forEach((value, index) => {
            const align = index === 0 ? 'center' : 'left'
            cells.push(
                $({
                    tag: 'td',
                    style: {
                        padding: '12px 8px',
                        fontSize: '12px',
                        color: '#ddd',
                        border: '1px solid #444',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        fontFamily: 'Segoe UI, sans-serif',
                        lineHeight: '1.4',
                        verticalAlign: 'top',
                        textAlign: align
                    },
                    text: value
                })
            )
        })

        // Resource Persons
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '200px'
                },
                child: [renderResourcePersons(item.resourcePersons)]
            })
        )

        // Participants
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '200px'
                },
                child: [renderParticipants(item.participants)]
            })
        )

        // Number of Attendees
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    color: '#4caf50',
                    fontWeight: '600',
                    fontSize: '14px'
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
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '200px'
                },
                child: [renderLinks(item.paperTrailLinks)]
            })
        )

        // Actions cell
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'middle'
                },
                child: [createActionButtons(item)]
            })
        )

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#2d2d2d',
                transition: 'all 0.2s ease'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#333'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                }
            }
        })
    }

    // Create action buttons
    const createActionButtons = (item) => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-pen' },
                    style: {
                        color: '#ffb347',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    },
                    title: 'Edit',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        }
                    }
                }),
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-trash' },
                    style: {
                        color: '#f44336',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    },
                    title: 'Delete',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteTraining(item)
                        }
                    }
                })
            ]
        })
    }

    // Open modal for adding/editing
    const openAddModal = () => {
        renderModal(null)
    }

    const openEditModal = (item) => {
        renderModal(item)
    }

    // Close modal
    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
        }
    }

    // Delete training
    const deleteTraining = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this training/activity record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_conducted')
            formData.append('id', item.id)

            const response = await fetch('/api/conducted-research', {
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

    // Render modal for add/edit
    const renderModal = (item = null) => {
        if (modalElement) {
            modalElement.remove()
        }

        const isEditing = item !== null

        // Paper trail files state (separate categories)
        let paperTrailFiles = {
            activityProposal: null,
            attendanceSheet: null,
            activityReport: null,
            program: null,
            photos: []  // Array for multiple photos
        }
        
        // Store existing files info for editing
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
                    if (parsed.photos && Array.isArray(parsed.photos)) existingFiles.photos = parsed.photos
                }
            } catch (e) {
                console.error('Error parsing paper trail files:', e)
            }
        }

        // Resource persons state
        let resourcePersons = []
        if (isEditing && item.resourcePersons) {
            try {
                resourcePersons = typeof item.resourcePersons === 'string' ? JSON.parse(item.resourcePersons) : item.resourcePersons
                if (!Array.isArray(resourcePersons)) resourcePersons = []
            } catch (e) {
                resourcePersons = []
            }
        }

        // Participants state
        let participants = []
        if (isEditing && item.participants) {
            try {
                participants = typeof item.participants === 'string' ? JSON.parse(item.participants) : item.participants
                if (!Array.isArray(participants)) participants = []
            } catch (e) {
                participants = []
            }
        }

        // Containers for dynamic fields
        let photosContainer
        let resourcePersonsContainer
        let participantsContainer

        // Function to add a photo preview element
        const addPhotoPreview = (file, previewContainer, isExisting = false, existingUrl = null) => {
            const photoId = Date.now() + Math.random()
            const photoDiv = $({
                tag: 'div',
                att: { className: 'photo-preview-item', 'data-photo-id': photoId },
                style: {
                    position: 'relative',
                    display: 'inline-block',
                    width: '100%',
                    paddingBottom: '100%', // Makes it square
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #444',
                    backgroundColor: '#333',
                    cursor: 'pointer'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        // Open full-size image in new tab on click
                        const img = photoDiv.querySelector('img')
                        if (img && img.src) {
                            window.open(img.src, '_blank')
                        }
                    }
                }
            })

            const imgWrapper = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%'
                }
            })

            const img = $({
                tag: 'img',
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }
            })

            const removeBtn = $({
                tag: 'button',
                att: { type: 'button' },
                text: '×',
                style: {
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(244, 67, 54, 0.9)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '2',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation()
                        photoDiv.remove()
                        // Remove from files array
                        if (isExisting) {
                            const index = existingFiles.photos.findIndex(p => p === existingUrl)
                            if (index !== -1) existingFiles.photos.splice(index, 1)
                        } else {
                            const fileIndex = paperTrailFiles.photos.findIndex(f => f === file)
                            if (fileIndex !== -1) paperTrailFiles.photos.splice(fileIndex, 1)
                        }
                        // Update count
                        const photoCount = document.getElementById('photo-count')
                        if (photoCount) {
                            photoCount.textContent = `${paperTrailFiles.photos.length + existingFiles.photos.length}`
                        }
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.target.style.transform = 'scale(1.1)'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.target.style.transform = 'scale(1)'
                    }
                }
            })

            imgWrapper.appendChild(img)
            photoDiv.appendChild(imgWrapper)
            photoDiv.appendChild(removeBtn)

            if (isExisting && existingUrl) {
                img.src = existingUrl
            } else if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    img.src = e.target.result
                }
                reader.readAsDataURL(file)
            }

            previewContainer.appendChild(photoDiv)
            return photoDiv
        }

        // Function to add a resource person field
        const addResourcePersonField = (name = '', topic = '') => {
            const personIndex = resourcePersons.length
            resourcePersons.push({ name, topic })

            const personRow = $({
                tag: 'div',
                att: { className: 'resource-person-row', 'data-person-index': personIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center'
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
                            padding: '10px',
                            backgroundColor: '#333',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        },
                        event: {
                            type: 'input',
                            method: (e) => {
                                if (resourcePersons[personIndex]) {
                                    resourcePersons[personIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Topic discussed',
                            value: topic,
                            className: 'resource-person-topic-input'
                        },
                        style: {
                            flex: '2',
                            padding: '10px',
                            backgroundColor: '#333',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        },
                        event: {
                            type: 'input',
                            method: (e) => {
                                if (resourcePersons[personIndex]) {
                                    resourcePersons[personIndex].topic = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '8px 12px',
                            backgroundColor: '#f44336',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                resourcePersons.splice(personIndex, 1)
                                personRow.remove()
                            }
                        }
                    })
                ]
            })

            return personRow
        }

        // Function to add a participant field
        const addParticipantField = (name = '', role = '') => {
            const participantIndex = participants.length
            participants.push({ name, role })

            const participantRow = $({
                tag: 'div',
                att: { className: 'participant-row', 'data-participant-index': participantIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center'
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
                            padding: '10px',
                            backgroundColor: '#333',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                        },
                        event: {
                            type: 'input',
                            method: (e) => {
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
                            flex: '2',
                            padding: '10px',
                            backgroundColor: '#333',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer'
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
                            type: 'change',
                            method: (e) => {
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
                            padding: '8px 12px',
                            backgroundColor: '#f44336',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                participants.splice(participantIndex, 1)
                                participantRow.remove()
                            }
                        }
                    })
                ]
            })

            return participantRow
        }

        // Create file upload section for a specific type
        const createFileUploadSection = (label, fileKey, acceptedTypes = '.pdf', required = false, multiple = false) => {
            const container = $({
                tag: 'div',
                style: {
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    border: '1px solid #444'
                }
            })

            const labelElement = $({
                tag: 'label',
                text: label + (required ? ' *' : ''),
                style: {
                    display: 'block',
                    marginBottom: '8px',
                    color: '#aaa',
                    fontSize: '13px',
                    fontWeight: '500'
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
                    padding: '8px',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer'
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
                                // Show file name
                                const fileNameSpan = container.querySelector('.file-name')
                                if (fileNameSpan) {
                                    fileNameSpan.textContent = `Selected: ${file.name}`
                                    fileNameSpan.style.color = '#4caf50'
                                }
                            }
                        }
                    }
                }
            })

            container.appendChild(labelElement)
            container.appendChild(fileInput)

            // Add file name display for single file uploads
            if (!multiple) {
                const fileNameSpan = $({
                    tag: 'span',
                    att: { className: 'file-name' },
                    style: {
                        display: 'block',
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#888'
                    },
                    text: existingFiles[fileKey] ? `Current: ${existingFiles[fileKey].split('/').pop() || existingFiles[fileKey]}` : 'No file selected'
                })
                container.appendChild(fileNameSpan)
            } else {
                // Add photo previews container
                const previewContainer = $({
                    tag: 'div',
                    att: { className: 'photo-previews-container' },
                    style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        marginTop: '12px',
                        gap: '8px'
                    }
                })
                container.appendChild(previewContainer)

                // Add existing photos
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
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Segoe UI, sans-serif'
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target === e.currentTarget) {
                        closeModal()
                    }
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        width: '900px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        border: '1px solid #444'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid #444',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#2d2d2d',
                                zIndex: '1'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: isEditing ? 'Edit Training/Activity' : 'Add Training/Activity',
                                    style: {
                                        margin: '0',
                                        fontSize: '20px',
                                        fontWeight: '500',
                                        color: '#fff'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#888',
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
                                            e.target.style.backgroundColor = '#444'
                                            e.target.style.color = '#fff'
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
                            att: { id: 'conducted-research-form' },
                            style: {
                                padding: '24px'
                            },
                            child: [
                                // Hidden ID field for editing
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

                                // Type selection (Campus or Center)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Type *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
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
                                                padding: '10px',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Type --' }),
                                                $({ tag: 'option', att: { value: 'campus' }, text: 'Campus' }),
                                                $({ tag: 'option', att: { value: 'center' }, text: 'Center' })
                                            ],
                                            event: {
                                                type: 'change',
                                                method: (e) => {
                                                    toggleLocationSelect(e.target.value)
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Campus/Center selection (dynamic)
                                $({
                                    tag: 'div',
                                    att: { id: 'location-select-container' },
                                    style: { marginBottom: '20px' }
                                }),

                                // Training/Activity Title
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Training/Activity Title *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
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
                                                padding: '10px',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        })
                                    ]
                                }),

                                // Date and Venue row
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px',
                                        marginBottom: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Date *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
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
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #444',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        outline: 'none'
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Venue *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'text',
                                                        name: 'venue',
                                                        value: isEditing ? (item.venue || '') : '',
                                                        placeholder: 'Enter venue...',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #444',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        outline: 'none'
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Budget & Fund Source
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Budget & Fund Source (GAA/STF/TF/etc)',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
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
                                                    tag: 'input',
                                                    att: {
                                                        type: 'number',
                                                        name: 'budget',
                                                        value: isEditing ? (item.budget || '') : '',
                                                        placeholder: 'Budget amount (₱)',
                                                        step: '0.01',
                                                        min: '0'
                                                    },
                                                    style: {
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #444',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        outline: 'none'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: { name: 'fundSource', placeholder: 'Fund Source (e.g., GAA, STF,TF, etc' },
                                                    style: {
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #444',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Topics Discussed
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Topics Discussed *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'textarea',
                                            att: {
                                                name: 'topicsDiscussed',
                                                placeholder: 'Enter topics discussed...',
                                                rows: '3',
                                                required: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            },
                                            text: isEditing ? (item.topicsDiscussed || '') : ''
                                        })
                                    ]
                                }),

                                // Resource Persons section
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Resource Person per Topic',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Resource Person',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#2196f3',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            const newRow = addResourcePersonField()
                                                            resourcePersonsContainer.appendChild(newRow)
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#1976d2'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#2196f3'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'resource-persons-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                resourcePersonsContainer = el
                                                if (isEditing && resourcePersons.length > 0) {
                                                    resourcePersons.forEach(person => {
                                                        resourcePersonsContainer.appendChild(
                                                            addResourcePersonField(person.name, person.topic)
                                                        )
                                                    })
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Participants section
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Participants (Research Chair or Coordinator/Faculty/Students/etc)',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Participant',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#9c27b0',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            const newRow = addParticipantField()
                                                            participantsContainer.appendChild(newRow)
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#7b1fa2'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#9c27b0'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'participants-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                participantsContainer = el
                                                if (isEditing && participants.length > 0) {
                                                    participants.forEach(participant => {
                                                        participantsContainer.appendChild(
                                                            addParticipantField(participant.name, participant.role)
                                                        )
                                                    })
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Number of Attendees
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'No. of Attendees *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
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
                                                padding: '10px',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        })
                                    ]
                                }),

                                // Paper Trail Files section
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '20px',
                                        border: '1px solid #444',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        backgroundColor: '#252525',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    },
                                    child: [
                                        $({
                                            tag: 'h3',
                                            style: {
                                                margin: '0 0 20px 0',
                                                fontSize: '18px',
                                                color: '#ff9800',
                                                borderLeft: '3px solid #ff9800',
                                                paddingLeft: '12px',
                                                fontWeight: '600'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-folder-open' },
                                                    style: { marginRight: '10px', fontSize: '16px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Paper Trail Documents'
                                                })
                                            ]
                                        }),
                                        
                                        // Two column grid layout
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
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
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#2a2a2a',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                border: '1px solid #3a3a3a',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            event: {
                                                                type: 'mouseenter',
                                                                method: (e) => {
                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                                },
                                                                type2: 'mouseleave',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#3a3a3a'
                                                                    e.currentTarget.style.transform = 'translateY(0)'
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
                                                                                width: '36px',
                                                                                height: '36px',
                                                                                borderRadius: '8px',
                                                                                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-file-pdf' },
                                                                                    style: { color: '#f44336', fontSize: '18px' }
                                                                                })
                                                                            ]
                                                                        }),
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Activity Proposal',
                                                                            style: {
                                                                                flex: 1,
                                                                                color: '#ddd',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                margin: 0
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { color: '#666', fontSize: '14px' }
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
                                                                            tag: 'input',
                                                                            att: {
                                                                                type: 'file',
                                                                                accept: '.pdf',
                                                                                id: 'activity-proposal-input'
                                                                            },
                                                                            style: {
                                                                                position: 'absolute',
                                                                                opacity: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                cursor: 'pointer',
                                                                                zIndex: 1
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
                                                                                        paperTrailFiles.activityProposal = file
                                                                                        const fileNameSpan = e.target.parentElement.parentElement.querySelector('.file-name-display')
                                                                                        if (fileNameSpan) {
                                                                                            fileNameSpan.textContent = file.name
                                                                                            fileNameSpan.style.color = '#4caf50'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                backgroundColor: '#333',
                                                                                border: '1px dashed #555',
                                                                                borderRadius: '8px',
                                                                                padding: '10px 12px',
                                                                                textAlign: 'center',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease'
                                                                            },
                                                                            event: {
                                                                                type: 'click',
                                                                                method: (e) => {
                                                                                    const fileInput = e.currentTarget.parentElement.querySelector('input[type="file"]')
                                                                                    if (fileInput) fileInput.click()
                                                                                },
                                                                                type2: 'mouseenter',
                                                                                method2: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                                    e.currentTarget.style.backgroundColor = '#3a3a3a'
                                                                                },
                                                                                type3: 'mouseleave',
                                                                                method3: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#555'
                                                                                    e.currentTarget.style.backgroundColor = '#333'
                                                                                }
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'file-name-display' },
                                                                                    style: {
                                                                                        fontSize: '12px',
                                                                                        color: '#888',
                                                                                        display: 'block',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    },
                                                                                    text: existingFiles.activityProposal ? 
                                                                                        `📄 ${existingFiles.activityProposal.split('/').pop() || 'Current file'}` : 
                                                                                        'Click or drag to upload PDF'
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        
                                                        // Attendance Sheet Card
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#2a2a2a',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                border: '1px solid #3a3a3a',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            event: {
                                                                type: 'mouseenter',
                                                                method: (e) => {
                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                                },
                                                                type2: 'mouseleave',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#3a3a3a'
                                                                    e.currentTarget.style.transform = 'translateY(0)'
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
                                                                                width: '36px',
                                                                                height: '36px',
                                                                                borderRadius: '8px',
                                                                                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-users' },
                                                                                    style: { color: '#4caf50', fontSize: '18px' }
                                                                                })
                                                                            ]
                                                                        }),
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Attendance Sheet',
                                                                            style: {
                                                                                flex: 1,
                                                                                color: '#ddd',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                margin: 0
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { color: '#666', fontSize: '14px' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: { position: 'relative' },
                                                                    child: [
                                                                        $({
                                                                            tag: 'input',
                                                                            att: {
                                                                                type: 'file',
                                                                                accept: '.pdf',
                                                                                id: 'attendance-sheet-input'
                                                                            },
                                                                            style: {
                                                                                position: 'absolute',
                                                                                opacity: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                cursor: 'pointer',
                                                                                zIndex: 1
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
                                                                                        paperTrailFiles.attendanceSheet = file
                                                                                        const fileNameSpan = e.target.parentElement.parentElement.querySelector('.file-name-display')
                                                                                        if (fileNameSpan) {
                                                                                            fileNameSpan.textContent = file.name
                                                                                            fileNameSpan.style.color = '#4caf50'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                backgroundColor: '#333',
                                                                                border: '1px dashed #555',
                                                                                borderRadius: '8px',
                                                                                padding: '10px 12px',
                                                                                textAlign: 'center',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease'
                                                                            },
                                                                            event: {
                                                                                type: 'click',
                                                                                method: (e) => {
                                                                                    const fileInput = e.currentTarget.parentElement.querySelector('input[type="file"]')
                                                                                    if (fileInput) fileInput.click()
                                                                                },
                                                                                type2: 'mouseenter',
                                                                                method2: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                                    e.currentTarget.style.backgroundColor = '#3a3a3a'
                                                                                },
                                                                                type3: 'mouseleave',
                                                                                method3: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#555'
                                                                                    e.currentTarget.style.backgroundColor = '#333'
                                                                                }
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'file-name-display' },
                                                                                    style: {
                                                                                        fontSize: '12px',
                                                                                        color: '#888',
                                                                                        display: 'block',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    },
                                                                                    text: existingFiles.attendanceSheet ? 
                                                                                        `📄 ${existingFiles.attendanceSheet.split('/').pop() || 'Current file'}` : 
                                                                                        'Click or drag to upload PDF'
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        
                                                        // Activity Report Card
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#2a2a2a',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                border: '1px solid #3a3a3a',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            event: {
                                                                type: 'mouseenter',
                                                                method: (e) => {
                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                                },
                                                                type2: 'mouseleave',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#3a3a3a'
                                                                    e.currentTarget.style.transform = 'translateY(0)'
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
                                                                                width: '36px',
                                                                                height: '36px',
                                                                                borderRadius: '8px',
                                                                                backgroundColor: 'rgba(33, 150, 243, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-chart-line' },
                                                                                    style: { color: '#2196f3', fontSize: '18px' }
                                                                                })
                                                                            ]
                                                                        }),
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Activity Report',
                                                                            style: {
                                                                                flex: 1,
                                                                                color: '#ddd',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                margin: 0
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { color: '#666', fontSize: '14px' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: { position: 'relative' },
                                                                    child: [
                                                                        $({
                                                                            tag: 'input',
                                                                            att: {
                                                                                type: 'file',
                                                                                accept: '.pdf',
                                                                                id: 'activity-report-input'
                                                                            },
                                                                            style: {
                                                                                position: 'absolute',
                                                                                opacity: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                cursor: 'pointer',
                                                                                zIndex: 1
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
                                                                                        paperTrailFiles.activityReport = file
                                                                                        const fileNameSpan = e.target.parentElement.parentElement.querySelector('.file-name-display')
                                                                                        if (fileNameSpan) {
                                                                                            fileNameSpan.textContent = file.name
                                                                                            fileNameSpan.style.color = '#4caf50'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                backgroundColor: '#333',
                                                                                border: '1px dashed #555',
                                                                                borderRadius: '8px',
                                                                                padding: '10px 12px',
                                                                                textAlign: 'center',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease'
                                                                            },
                                                                            event: {
                                                                                type: 'click',
                                                                                method: (e) => {
                                                                                    const fileInput = e.currentTarget.parentElement.querySelector('input[type="file"]')
                                                                                    if (fileInput) fileInput.click()
                                                                                },
                                                                                type2: 'mouseenter',
                                                                                method2: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                                    e.currentTarget.style.backgroundColor = '#3a3a3a'
                                                                                },
                                                                                type3: 'mouseleave',
                                                                                method3: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#555'
                                                                                    e.currentTarget.style.backgroundColor = '#333'
                                                                                }
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'file-name-display' },
                                                                                    style: {
                                                                                        fontSize: '12px',
                                                                                        color: '#888',
                                                                                        display: 'block',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    },
                                                                                    text: existingFiles.activityReport ? 
                                                                                        `📄 ${existingFiles.activityReport.split('/').pop() || 'Current file'}` : 
                                                                                        'Click or drag to upload PDF'
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        
                                                        // Program Card
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#2a2a2a',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                border: '1px solid #3a3a3a',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            event: {
                                                                type: 'mouseenter',
                                                                method: (e) => {
                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                                },
                                                                type2: 'mouseleave',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#3a3a3a'
                                                                    e.currentTarget.style.transform = 'translateY(0)'
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
                                                                                width: '36px',
                                                                                height: '36px',
                                                                                borderRadius: '8px',
                                                                                backgroundColor: 'rgba(156, 39, 176, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-calendar-alt' },
                                                                                    style: { color: '#9c27b0', fontSize: '18px' }
                                                                                })
                                                                            ]
                                                                        }),
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Program',
                                                                            style: {
                                                                                flex: 1,
                                                                                color: '#ddd',
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                margin: 0
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { color: '#666', fontSize: '14px' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: { position: 'relative' },
                                                                    child: [
                                                                        $({
                                                                            tag: 'input',
                                                                            att: {
                                                                                type: 'file',
                                                                                accept: '.pdf',
                                                                                id: 'program-input'
                                                                            },
                                                                            style: {
                                                                                position: 'absolute',
                                                                                opacity: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                cursor: 'pointer',
                                                                                zIndex: 1
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
                                                                                        paperTrailFiles.program = file
                                                                                        const fileNameSpan = e.target.parentElement.parentElement.querySelector('.file-name-display')
                                                                                        if (fileNameSpan) {
                                                                                            fileNameSpan.textContent = file.name
                                                                                            fileNameSpan.style.color = '#4caf50'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                backgroundColor: '#333',
                                                                                border: '1px dashed #555',
                                                                                borderRadius: '8px',
                                                                                padding: '10px 12px',
                                                                                textAlign: 'center',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease'
                                                                            },
                                                                            event: {
                                                                                type: 'click',
                                                                                method: (e) => {
                                                                                    const fileInput = e.currentTarget.parentElement.querySelector('input[type="file"]')
                                                                                    if (fileInput) fileInput.click()
                                                                                },
                                                                                type2: 'mouseenter',
                                                                                method2: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#ff9800'
                                                                                    e.currentTarget.style.backgroundColor = '#3a3a3a'
                                                                                },
                                                                                type3: 'mouseleave',
                                                                                method3: (e) => {
                                                                                    e.currentTarget.style.borderColor = '#555'
                                                                                    e.currentTarget.style.backgroundColor = '#333'
                                                                                }
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'file-name-display' },
                                                                                    style: {
                                                                                        fontSize: '12px',
                                                                                        color: '#888',
                                                                                        display: 'block',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    },
                                                                                    text: existingFiles.program ? 
                                                                                        `📄 ${existingFiles.program.split('/').pop() || 'Current file'}` : 
                                                                                        'Click or drag to upload PDF'
                                                                                })
                                                                            ]
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                
                                                // Right Column - Photos section
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#2a2a2a',
                                                        borderRadius: '10px',
                                                        padding: '16px',
                                                        border: '1px solid #3a3a3a',
                                                        height: 'fit-content'
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
                                                                        width: '36px',
                                                                        height: '36px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-images' },
                                                                            style: { color: '#4caf50', fontSize: '18px' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Event Photos',
                                                                    style: {
                                                                        flex: 1,
                                                                        color: '#ddd',
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        margin: 0
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Multiple files allowed',
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        color: '#666',
                                                                        backgroundColor: '#333',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px'
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
                                                                        accept: 'image/jpeg,image/png,image/jpg',
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
                                                                                        addPhotoPreview(file, previewContainer)
                                                                                    }
                                                                                }
                                                                            })
                                                                            // Update count
                                                                            const photoCount = document.getElementById('photo-count')
                                                                            if (photoCount) {
                                                                                photoCount.textContent = `${paperTrailFiles.photos.length + existingFiles.photos.length}`
                                                                            }
                                                                        }
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        backgroundColor: '#333',
                                                                        border: '2px dashed #555',
                                                                        borderRadius: '10px',
                                                                        padding: '20px',
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
                                                                            e.currentTarget.style.borderColor = '#ff9800'
                                                                            e.currentTarget.style.backgroundColor = '#3a3a3a'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.borderColor = '#555'
                                                                            e.currentTarget.style.backgroundColor = '#333'
                                                                        }
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-camera' },
                                                                            style: { fontSize: '32px', color: '#ff9800', display: 'block', marginBottom: '12px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'Click to upload photos',
                                                                            style: { fontSize: '13px', color: '#aaa', marginBottom: '8px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'JPG, PNG supported',
                                                                            style: { fontSize: '11px', color: '#666' }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        marginBottom: '12px',
                                                                        padding: '0 4px'
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Uploaded Photos:',
                                                                            style: { fontSize: '12px', color: '#aaa' }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { id: 'photo-count' },
                                                                            text: `${existingFiles.photos.length}`,
                                                                            style: {
                                                                                fontSize: '12px',
                                                                                color: '#ff9800',
                                                                                fontWeight: '600',
                                                                                backgroundColor: 'rgba(255,152,0,0.2)',
                                                                                padding: '2px 8px',
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
                                                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                                gap: '10px',
                                                                maxHeight: '300px',
                                                                overflowY: 'auto',
                                                                padding: '4px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#222',
                                                                minHeight: '100px'
                                                            },
                                                            elementHandler: (el) => {
                                                                // Add existing photos
                                                                if (isEditing && existingFiles.photos.length > 0) {
                                                                    existingFiles.photos.forEach(photoUrl => {
                                                                        addPhotoPreview(null, el, true, photoUrl)
                                                                    })
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
                                    await saveTrainingData(isEditing, paperTrailFiles, existingFiles)
                                }
                            }
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(modalElement)

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

    // Toggle location select between campus and center
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
                        color: '#666',
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
                            marginBottom: '8px',
                            color: '#aaa',
                            fontSize: '13px',
                            fontWeight: '500'
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
                            padding: '10px',
                            backgroundColor: '#333',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer'
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
                        ]
                    })
                ]
            })
        )
    }

    // Save training data
    const saveTrainingData = async (isEditing, paperTrailFiles, existingFiles) => {
        const form = document.getElementById('conducted-research-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_conducted' : 'add_conducted')

        // Add dynamic arrays as JSON
        formData.append('resourcePersons', JSON.stringify(resourcePersons))
        formData.append('participants', JSON.stringify(participants))

        // Handle file uploads
        // Activity Proposal
        if (paperTrailFiles.activityProposal) {
            formData.append('activity_proposal', paperTrailFiles.activityProposal)
        } else if (existingFiles.activityProposal) {
            formData.append('existing_activity_proposal', existingFiles.activityProposal)
        }

        // Attendance Sheet
        if (paperTrailFiles.attendanceSheet) {
            formData.append('attendance_sheet', paperTrailFiles.attendanceSheet)
        } else if (existingFiles.attendanceSheet) {
            formData.append('existing_attendance_sheet', existingFiles.attendanceSheet)
        }

        // Activity Report
        if (paperTrailFiles.activityReport) {
            formData.append('activity_report', paperTrailFiles.activityReport)
        } else if (existingFiles.activityReport) {
            formData.append('existing_activity_report', existingFiles.activityReport)
        }

        // Program
        if (paperTrailFiles.program) {
            formData.append('program', paperTrailFiles.program)
        } else if (existingFiles.program) {
            formData.append('existing_program', existingFiles.program)
        }

        // Photos (multiple)
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
            const response = await fetch('/api/conducted-research', {
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

    // Refresh data
    const refreshData = async () => {
        conductedData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchConductedData()
    }

    // Filter bar component
    const FilterBar = () => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444',
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
                                    style: { color: '#ff9800', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Research Related -Trainings/Activity Conducted/Facilitated',
                                    style: {
                                        color: '#fff',
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
                                        backgroundColor: '#333',
                                        color: '#aaa',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #444'
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
                                backgroundColor: '#333',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                border: '1px solid #444'
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
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '160px'
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
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '250px'
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
                        backgroundColor: '#ff9800',
                        border: 'none',
                        borderRadius: '25px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: openAddModal,
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.target.style.backgroundColor = '#e68900'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#ff9800'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                        }
                    }
                })
            ]
        })
    }

    // Statistics cards
    const StatsCards = () => {
        return $({
            tag: 'div',
            att: { className: 'stats-cards' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            child: [
                // Total Trainings
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '16px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 152, 0, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chalkboard-teacher' },
                                    style: { color: '#ff9800', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Trainings',
                                    style: {
                                        fontSize: '13px',
                                        color: '#aaa',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Total Attendees
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '16px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(76, 175, 80, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-users' },
                                    style: { color: '#4caf50', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Attendees',
                                    style: {
                                        fontSize: '13px',
                                        color: '#aaa',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Table header
    const TableHeader = () => {
        const headers = [
            'NO.',
            'Training/Activity Title',
            'Date',
            'Venue',
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
                    padding: '14px 8px',
                    textAlign: isCenter ? 'center' : 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #444',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    letterSpacing: '0.5px'
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
                backgroundColor: '#2a2a2a',
                position: 'relative'
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
                        borderCollapse: 'collapse'
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
        att: { className: 'conducted-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
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
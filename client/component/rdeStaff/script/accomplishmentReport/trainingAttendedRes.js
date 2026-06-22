import { $, Waiting } from "../../../../lib/lib.js"

export const trainingsAttended = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let attendedData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let currentCategory = 'All Categories'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false
    let attendees = []

    // Stats state
    let currentStats = {
        totalTrainings: 0,
        totalAttendees: 0,
        institutional: 0,
        national: 0,
        regional: 0,
        local: 0
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

    // Category options
    const categories = [
        'All Categories',
        'Institutional',
        'National',
        'Regional',
        'Local'
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

    const fetchAttendedData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            attendedData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_attended')

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
            if (currentCategory !== 'All Categories') {
                formData.append('category', currentCategory)
            }

            const response = await fetch('/attendedResearch', {  // Updated endpoint
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                const newData = result.data || []

                if (!cursor) {
                    attendedData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = {
                            totalTrainings: result.summary.totalTrainings || 0,
                            totalAttendees: result.summary.totalAttendees || 0,
                            institutional: result.summary.institutional || 0,
                            national: result.summary.national || 0,
                            regional: result.summary.regional || 0,
                            local: result.summary.local || 0
                        }
                        totalCount = result.summary.totalTrainings || 0
                        updateStats()
                    }
                } else {
                    attendedData = [...attendedData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                applyCategoryFilter()
                updateRecordCount()
                updateTableWithData()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
                showNotification(result.message || 'Failed to load data', 'error')
            }
        } catch (error) {
            console.error('Error fetching attended data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    const applyCategoryFilter = () => {
        if (currentCategory === 'All Categories') {
            filteredData = [...attendedData]
        } else {
            filteredData = attendedData.filter(item => item.category === currentCategory)
        }
        updateTableWithData()
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchAttendedData(nextCursor)
        }
    }

    const updateStats = () => {
        const statTotalTrainings = document.querySelector('.stat-total-trainings')
        const statTotalAttendees = document.querySelector('.stat-total-attendees')
        const statInstitutional = document.querySelector('.stat-institutional')
        const statNational = document.querySelector('.stat-national')
        const statRegional = document.querySelector('.stat-regional')
        const statLocal = document.querySelector('.stat-local')

        if (statTotalTrainings) statTotalTrainings.textContent = currentStats.totalTrainings
        if (statTotalAttendees) statTotalAttendees.textContent = currentStats.totalAttendees
        if (statInstitutional) statInstitutional.textContent = currentStats.institutional
        if (statNational) statNational.textContent = currentStats.national
        if (statRegional) statRegional.textContent = currentStats.regional
        if (statLocal) statLocal.textContent = currentStats.local
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
        const headerRow = document.querySelector('.training-attended-container thead tr')
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
                                    att: { className: 'fa-solid fa-user-graduate' },
                                    style: {
                                        fontSize: '64px',
                                        marginBottom: '20px',
                                        opacity: 0.2,
                                        color: '#6f42c1'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Training/Seminar Attended Records Found',
                                    style: {
                                        fontSize: '20px',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#212529'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Click "Add Training/Seminar" to add attended training records',
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

    const renderAttendees = (attendees) => {
        if (!attendees || attendees === '—') return '—'

        let attendeeList = []
        try {
            if (typeof attendees === 'string') {
                attendeeList = JSON.parse(attendees)
            } else if (Array.isArray(attendees)) {
                attendeeList = attendees
            } else {
                return attendees
            }
        } catch (e) {
            return attendees
        }

        if (attendeeList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '4px 0'
            },
            child: attendeeList.map((attendee, idx) => {
                const name = typeof attendee === 'string' ? attendee : attendee.name || 'Unknown'
                const position = typeof attendee === 'object' ? attendee.position : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '6px 10px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(111, 66, 193, 0.06)' : 'transparent',
                        borderRadius: '6px',
                        borderBottom: idx < attendeeList.length - 1 ? '1px solid #f1f3f5' : 'none'
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
                        ...(position ? [
                            $({
                                tag: 'div',
                                text: position,
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

    const renderDocumentLinks = (item) => {
        const documents = [
            {
                type: 'Memorandum to Attend',
                fileId: item.memorandum_drive_file_id,
                viewUrl: item.memorandum_drive_view_url,
                icon: 'fa-file-pdf',
                color: '#dc3545',
                bgColor: 'rgba(220, 53, 69, 0.06)'
            },
            {
                type: 'Invitation',
                fileId: item.invitation_drive_file_id,
                viewUrl: item.invitation_drive_view_url,
                icon: 'fa-file-pdf',
                color: '#fd7e14',
                bgColor: 'rgba(253, 126, 20, 0.06)'
            },
            {
                type: 'Certificate',
                fileId: item.certificate_drive_file_id,
                viewUrl: item.certificate_drive_view_url,
                icon: 'fa-file-pdf',
                color: '#28a745',
                bgColor: 'rgba(40, 167, 69, 0.06)'
            },
            {
                type: 'Program',
                fileId: item.program_drive_file_id,
                viewUrl: item.program_drive_view_url,
                icon: 'fa-file-pdf',
                color: '#0d6efd',
                bgColor: 'rgba(13, 110, 253, 0.06)'
            }
        ]

        const uploadedDocs = documents.filter(doc => doc.viewUrl || doc.fileId)

        if (uploadedDocs.length === 0) {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    color: '#6c757d',
                    fontSize: '13px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px dashed #dee2e6'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-regular fa-file' },
                        style: { marginRight: '10px', fontSize: '16px', color: '#adb5bd' }
                    }),
                    $({
                        tag: 'span',
                        text: 'No documents uploaded'
                    })
                ]
            })
        }

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '4px 0'
            },
            child: uploadedDocs.map(doc => {
                const fileUrl = doc.viewUrl || `https://drive.google.com/file/d/${doc.fileId}/preview`

                return $({
                    tag: 'a',
                    att: {
                        href: fileUrl,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    },
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        backgroundColor: doc.bgColor,
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: `1px solid ${doc.color}20`,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateX(4px)'
                            e.currentTarget.style.backgroundColor = `${doc.color}12`
                            e.currentTarget.style.borderColor = `${doc.color}40`
                            e.currentTarget.style.boxShadow = `0 2px 8px ${doc.color}15`
                        }
                    },
                    event2: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateX(0)'
                            e.currentTarget.style.backgroundColor = doc.bgColor
                            e.currentTarget.style.borderColor = `${doc.color}20`
                            e.currentTarget.style.boxShadow = 'none'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: `${doc.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: '0'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: `fa-solid ${doc.icon}` },
                                    style: { color: doc.color, fontSize: '17px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { flex: '1', minWidth: '0' },
                            child: [
                                $({
                                    tag: 'div',
                                    text: doc.type,
                                    style: {
                                        color: '#212529',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'View Document →',
                                    style: {
                                        color: doc.color,
                                        fontSize: '11px',
                                        marginTop: '2px',
                                        opacity: '0.8',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-arrow-up-right-from-square' },
                            style: {
                                color: doc.color,
                                fontSize: '12px',
                                opacity: '0.5',
                                transition: 'opacity 0.2s ease'
                            },
                            event: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.opacity = '1'
                                }
                            },
                            event2: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.opacity = '0.5'
                                }
                            }
                        })
                    ]
                })
            })
        })
    }

    const renderCategoryBadge = (category) => {
        if (!category || category === '—') return '—'

        const categoryColors = {
            'Institutional': { bg: 'rgba(13, 110, 253, 0.08)', color: '#0d6efd', border: 'rgba(13, 110, 253, 0.2)' },
            'National': { bg: 'rgba(40, 167, 69, 0.08)', color: '#28a745', border: 'rgba(40, 167, 69, 0.2)' },
            'Regional': { bg: 'rgba(253, 126, 20, 0.08)', color: '#fd7e14', border: 'rgba(253, 126, 20, 0.2)' },
            'Local': { bg: 'rgba(111, 66, 193, 0.08)', color: '#6f42c1', border: 'rgba(111, 66, 193, 0.2)' },
            'International': { bg: 'rgba(220, 53, 69, 0.08)', color: '#dc3545', border: 'rgba(220, 53, 69, 0.2)' },
            'University': { bg: 'rgba(32, 201, 151, 0.08)', color: '#20c997', border: 'rgba(32, 201, 151, 0.2)' },
            'Extension': { bg: 'rgba(255, 193, 7, 0.08)', color: '#d39e00', border: 'rgba(255, 193, 7, 0.2)' }
        }

        const colors = categoryColors[category] || { 
            bg: 'rgba(108, 117, 125, 0.08)', 
            color: '#6c757d', 
            border: 'rgba(108, 117, 125, 0.2)' 
        }

        return $({
            tag: 'span',
            text: category,
            style: {
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = `0 2px 8px ${colors.color}25`
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = 'none'
                }
            }
        })
    }

    // Create data row
    const createDataRow = (item, rowNumber) => {
        const cells = []

        // Row number
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#888',
                    border: '1px solid #444',
                    fontFamily: 'monospace'
                },
                text: rowNumber.toString()
            })
        )

        // Helper to ensure render functions return a DOM node
        const safeRender = (renderedValue) => {
            return typeof renderedValue === 'string' ? $({ tag: 'span', text: renderedValue }) : renderedValue
        }

        // Attendees
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '200px'
                },
                child: [safeRender(renderAttendees(item.attendees))]
            })
        )

        // Training/Seminar Title
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontWeight: '500',
                    lineHeight: '1.4'
                },
                text: item.title || '—'
            })
        )

        // Category
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top'
                },
                child: [safeRender(renderCategoryBadge(item.category))]
            })
        )

        // Date
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap'
                },
                text: formatDate(item.date)
            })
        )

        // Venue
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4'
                },
                text: item.venue || '—'
            })
        )

        // Sponsoring Agency
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4'
                },
                text: item.sponsoring_agency || '—'
            })
        )

        // Paper Trail Links - Updated to use renderDocumentLinks
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '250px'
                },
                child: [safeRender(renderDocumentLinks(item))]
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
        const confirmed = confirm('Are you sure you want to delete this training/seminar record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_attended')
            formData.append('id', item.id)

            const response = await fetch('/attendedResearch', {  // Updated endpoint
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Training/Seminar record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification(result.message || 'Failed to delete training/seminar record', 'error')
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

        if (isEditing && item.attendees) {
            try {
                attendees = typeof item.attendees === 'string' ? JSON.parse(item.attendees) : item.attendees
                if (!Array.isArray(attendees)) attendees = []
            } catch (e) {
                attendees = []
            }
        }
        if (attendees.length === 0) {
            attendees = [{ name: '', position: '' }]
        }
        let attendeesContainer

        // Function to add an attendee field
        const addAttendeeField = (name = '', position = '') => {
            const attendeeIndex = attendees.length
            attendees.push({ name, position })

            const attendeeRow = $({
                tag: 'div',
                att: { className: 'attendee-row', 'data-attendee-index': attendeeIndex },
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
                            placeholder: 'Attendee name',
                            value: name,
                            className: 'attendee-name-input'
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
                                if (attendees[attendeeIndex]) {
                                    attendees[attendeeIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Position/Designation (optional)',
                            value: position,
                            className: 'attendee-position-input'
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
                                if (attendees[attendeeIndex]) {
                                    attendees[attendeeIndex].position = e.target.value
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
                                attendees.splice(attendeeIndex, 1)
                                attendeeRow.remove()
                            }
                        }
                    })
                ]
            })

            return attendeeRow
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
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        width: '800px',
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
                                    text: isEditing ? 'Edit Training/Seminar Attended' : 'Add Training/Seminar Attended',
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
                            att: { id: 'attended-training-form', enctype: 'multipart/form-data' },
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
                                                id: 'attended-type-select'
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

                                // Attendees section
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
                                                    text: 'Name/s of Attendee/s *',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Attendee',
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
                                                            const newRow = addAttendeeField()
                                                            attendeesContainer.appendChild(newRow)
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
                                            att: { id: 'attendees-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                attendeesContainer = el
                                                // Populate existing attendees
                                                attendees.forEach(attendee => {
                                                    attendeesContainer.appendChild(addAttendeeField(attendee.name, attendee.position))
                                                })
                                            }
                                        })
                                    ]
                                }),

                                // Training/Seminar Title
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Training/Seminar Title *',
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
                                                placeholder: 'Enter training/seminar title...',
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

                                // Category and Date row
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
                                                    text: 'Category *',
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
                                                        name: 'category',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Category --' }),
                                                        $({ tag: 'option', att: { value: 'Institutional', selected: isEditing && item.category === 'Institutional' }, text: 'Institutional' }),
                                                        $({ tag: 'option', att: { value: 'National', selected: isEditing && item.category === 'National' }, text: 'National' }),
                                                        $({ tag: 'option', att: { value: 'Regional', selected: isEditing && item.category === 'Regional' }, text: 'Regional' }),
                                                        $({ tag: 'option', att: { value: 'Local', selected: isEditing && item.category === 'Local' }, text: 'Local' })
                                                    ]
                                                })
                                            ]
                                        }),
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
                                        })
                                    ]
                                }),

                                // Venue and Sponsoring Agency row
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
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Sponsoring Agency *',
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
                                                        name: 'sponsoringAgency',
                                                        value: isEditing ? (item.sponsoringAgency || '') : '',
                                                        placeholder: 'Enter sponsoring agency...',
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

                                // Paper Trail Documents section with modern file upload
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            style: {
                                                display: 'block',
                                                marginBottom: '12px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    text: 'Paper Trail Documents',
                                                    style: { display: 'block', marginBottom: '4px' }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Upload supporting documents (PDF format only)',
                                                    style: { fontSize: '11px', color: '#666', fontWeight: 'normal' }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                                gap: '16px'
                                            },
                                            child: [
                                                createModernFileUpload('Memorandum to Attend', 'memorandum_file', '📋', isEditing ? item.memorandum_file : null),
                                                createModernFileUpload('Invitation', 'invitation_file', '📧', isEditing ? item.invitation_file : null),
                                                createModernFileUpload('Certificate', 'certificate_file', '🏆', isEditing ? item.certificate_file : null),
                                                createModernFileUpload('Program', 'program_file', '📅', isEditing ? item.program_file : null)
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
                                            text: isEditing ? 'Update Training/Seminar' : 'Add Training/Seminar',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#9c27b0',
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
                                                    e.target.style.backgroundColor = '#7b1fa2'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#9c27b0'
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
                                    await saveTrainingData(isEditing)
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

        // Initialize location select based on existing data
        setTimeout(() => {
            const typeSelect = document.getElementById('attended-type-select')
            if (isEditing && item.type) {
                typeSelect.value = item.type
                toggleLocationSelect(item.type, item.location)
            } else {
                toggleLocationSelect('', '')
            }
        }, 100)
    }

    const createModernFileUpload = (label, fieldName, icon, existingFile = null) => {
        let fileInputRef = null
        let fileInfoContainer = null
        let currentFile = null

        const container = $({
            tag: 'div',
            style: {
                position: 'relative',
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #333',
                transition: 'all 0.3s ease'
            }
        })

        // Header with icon and label
        const header = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(156, 39, 176, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                    },
                    text: icon
                }),
                $({
                    tag: 'span',
                    text: label,
                    style: {
                        color: '#ddd',
                        fontSize: '13px',
                        fontWeight: '500',
                        flex: '1'
                    }
                }),
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-file-pdf' },
                    style: {
                        color: '#f44336',
                        fontSize: '14px',
                        opacity: '0.6'
                    }
                })
            ]
        })

        // File input
        const fileInput = $({
            tag: 'input',
            att: {
                type: 'file',
                name: fieldName,
                accept: '.pdf',
                id: `${fieldName}-input`
            },
            style: {
                display: 'none'
            },
            event: {
                type: 'change',
                method: (e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0])
                    }
                }
            }
        })

        // File info container
        fileInfoContainer = $({
            tag: 'div',
            style: {
                marginTop: '12px'
            }
        })

        // Handle file selection
        const handleFileSelect = (file) => {
            if (file.type !== 'application/pdf') {
                showNotification('Please upload only PDF files', 'error')
                if (fileInputRef) fileInputRef.value = ''
                return
            }

            currentFile = file
            updateFileDisplay(file)
        }

        // Update file display
        const updateFileDisplay = (file) => {
            const fileSize = (file.size / 1024).toFixed(2)
            const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name

            fileInfoContainer.innerHTML = ''

            const fileCard = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    animation: 'fadeIn 0.3s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#f44336',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '16px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-file-pdf' }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            flex: '1',
                            minWidth: '0'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: fileName,
                                style: {
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }
                            }),
                            $({
                                tag: 'div',
                                text: `${fileSize} KB • PDF`,
                                style: {
                                    color: '#888',
                                    fontSize: '10px',
                                    marginTop: '2px'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#f44336',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            transition: 'all 0.2s ease'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-times' },
                                style: { fontSize: '12px' }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                currentFile = null
                                if (fileInputRef) fileInputRef.value = ''
                                fileInfoContainer.innerHTML = ''

                                // Show upload prompt again
                                const uploadPrompt = createUploadPrompt()
                                fileInfoContainer.appendChild(uploadPrompt)
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.1)'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }
                    })
                ]
            })

            fileInfoContainer.appendChild(fileCard)
        }

        // Create upload prompt
        const createUploadPrompt = () => {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '20px',
                    border: '2px dashed #444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'transparent'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-cloud-upload-alt' },
                        style: {
                            fontSize: '24px',
                            color: '#666',
                            marginBottom: '4px'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'Click or drag PDF here',
                        style: {
                            color: '#888',
                            fontSize: '11px'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'Max file size: 10MB',
                        style: {
                            color: '#555',
                            fontSize: '9px'
                        }
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        if (fileInputRef) fileInputRef.click()
                    }
                }
            })
        }

        // Build the component
        container.appendChild(header)
        container.appendChild(fileInput)
        container.appendChild(fileInfoContainer)

        // Store reference
        fileInputRef = fileInput

        // Initialize based on existing file
        if (existingFile && (existingFile.drive_view_url || existingFile.drive_file_id)) {
            const fileInfo = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.2)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#4caf50',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '16px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-check' }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { flex: '1' },
                        child: [
                            $({
                                tag: 'div',
                                text: existingFile.file_name || `${label} uploaded`,
                                style: {
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }
                            }),
                            $({
                                tag: 'div',
                                text: 'Previously uploaded',
                                style: {
                                    color: '#888',
                                    fontSize: '10px',
                                    marginTop: '2px'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'a',
                        att: {
                            href: existingFile.drive_view_url || `https://drive.google.com/file/d/${existingFile.drive_file_id}/preview`,
                            target: '_blank'
                        },
                        style: {
                            color: '#2196f3',
                            marginRight: '8px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-eye' },
                                style: { fontSize: '12px' }
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-check-circle' },
                        style: { color: '#4caf50', fontSize: '14px' }
                    })
                ]
            })
            fileInfoContainer.appendChild(fileInfo)

            // Add replace note
            const replaceNote = $({
                tag: 'div',
                style: {
                    marginTop: '8px',
                    fontSize: '10px',
                    color: '#ff9800',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '4px'
                },
                text: 'Click to replace file',
                event: {
                    type: 'click',
                    method: () => {
                        if (fileInputRef) fileInputRef.click()
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.target.style.textDecoration = 'underline'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.target.style.textDecoration = 'none'
                    }
                }
            })
            fileInfoContainer.appendChild(replaceNote)
        } else {
            // Show upload prompt for new files
            const uploadPrompt = createUploadPrompt()
            fileInfoContainer.appendChild(uploadPrompt)
        }

        return container
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

    // Save training data with file uploads
    const saveTrainingData = async (isEditing) => {
        const form = document.getElementById('attended-training-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_attended' : 'add_attended')

        if (typeof attendees !== 'undefined') {
            formData.append('attendees', JSON.stringify(attendees))
        } else if (window.currentAttendees) {
            formData.append('attendees', JSON.stringify(window.currentAttendees))
        }

        showLoading()
        try {
            const response = await fetch('/attendedResearch', {  // Updated endpoint
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Training/Seminar updated successfully' : 'Training/Seminar added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving training/seminar data', 'error')
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
        attendedData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchAttendedData()
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
                                    att: { className: 'fa-solid fa-user-graduate' },
                                    style: { color: '#9c27b0', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Faculty Research Related Trainings/ Seminars Attended',
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
                                }),
                                // Category filter
                                $({
                                    tag: 'select',
                                    att: { className: 'category-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '150px'
                                    },
                                    child: categories.map(cat =>
                                        $({
                                            tag: 'option',
                                            att: { value: cat },
                                            text: cat,
                                            selected: cat === currentCategory
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentCategory = e.target.value
                                            applyCategoryFilter()
                                            updateRecordCount()
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
                    text: '+ Add Training/Seminar',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#9c27b0',
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
                            e.target.style.backgroundColor = '#7b1fa2'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(156, 39, 176, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#9c27b0'
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            child: [
                // Total Trainings Attended
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
                                backgroundColor: 'rgba(156, 39, 176, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(156, 39, 176, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user-graduate' },
                                    style: { color: '#9c27b0', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-total-trainings stat-value' },
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
                                    att: { className: 'stat-total-attendees stat-value' },
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
                }),
                // Category breakdown
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '16px',
                        padding: '18px 22px',
                        border: '1px solid #444',
                        gridColumn: 'span 2'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Category Breakdown',
                            style: {
                                fontSize: '13px',
                                color: '#888',
                                fontWeight: '500',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createCategoryStat('Institutional', '#2196f3', 'stat-institutional'),
                                createCategoryStat('National', '#4caf50', 'stat-national'),
                                createCategoryStat('Regional', '#ff9800', 'stat-regional'),
                                createCategoryStat('Local', '#9c27b0', 'stat-local')
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create category stat item
    const createCategoryStat = (label, color, className) => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: `${color}10`,
                borderRadius: '12px',
                border: `1px solid ${color}30`
            },
            child: [
                $({
                    tag: 'span',
                    att: { className },
                    text: '0',
                    style: {
                        fontSize: '24px',
                        fontWeight: '700',
                        color: color,
                        lineHeight: '1.2'
                    }
                }),
                $({
                    tag: 'span',
                    text: label,
                    style: {
                        fontSize: '11px',
                        color: '#aaa',
                        fontWeight: '500',
                        marginTop: '4px'
                    }
                })
            ]
        })
    }

    // Table header
    const TableHeader = () => {
        const headers = [
            'NO.',
            'Name/s of Attendee/s',
            'Training/Seminar Title',
            'Category\n(Int\'l, Nat\'l, Reg\'l, Local)',
            'Date',
            'Venue',
            'Sponsoring Agency',
            'Link of the Paper Trail\n(Memorandum to attend, Invitation,\nCertificate, & Program)',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'Category\n(Int\'l, Nat\'l, Reg\'l, Local)', 'Date', 'ACTIONS'].includes(header)

            const th = $({
                tag: 'th',
                text: header,
                style: {
                    padding: '14px 8px',
                    textAlign: isCenter ? 'center' : 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#fff',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #444',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
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
                height: 'calc(100% - 320px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchAttendedData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '1800px',
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
                zIndex: '1001',
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
        att: { className: 'trainings-attended-container' },
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

export default trainingsAttended
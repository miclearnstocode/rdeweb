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
        const headerRow = document.querySelector('.trainings-attended-container thead tr')
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
                    att: { 
                        colSpan: columnCount,
                        align: 'center'
                    },
                    style: {
                        padding: '60px 20px',
                        border: 'none',
                        backgroundColor: '#ffffff',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        width: '100%'
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
                                maxWidth: '500px',
                                margin: '0 auto',
                                padding: '40px 20px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '12px',
                                border: '2px dashed #e8eaed'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f1f8fe',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-user-graduate' },
                                            style: {
                                                fontSize: '36px',
                                                color: '#1a73e8',
                                                opacity: 0.6
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Training/Seminar Attended Records Found',
                                    style: {
                                        fontSize: '20px',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#202124',
                                        letterSpacing: '-0.3px',
                                        textAlign: 'center'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Click "Add Training/Seminar" to add attended training records',
                                    style: {
                                        fontSize: '14px',
                                        color: '#5f6368',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    att: {
                                        type: 'button',
                                        className: 'btn-add-training'
                                    },
                                    style: {
                                        padding: '10px 28px',
                                        backgroundColor: '#1a73e8',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-plus' },
                                            style: { fontSize: '12px' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Add Training/Seminar'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            openAddModal()
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.currentTarget.style.backgroundColor = '#1557b0'
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,115,232,0.3)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.currentTarget.style.backgroundColor = '#1a73e8'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }
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
        const links = item.paperTrailLinks || {}
        const hasLinks = Object.values(links).some(val => val && val.length > 0)
        
        if (!hasLinks) {
            return $({
                tag: 'span',
                text: 'No documents',
                style: {
                    color: '#9aa0a6',
                    fontSize: '12px',
                    fontStyle: 'italic'
                }
            })
        }
        
        const linkContainer = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }
        })
        
        // Map of link types to display names and icons
        const linkMap = [
            { key: 'activityProposal', label: 'Activity Proposal', icon: 'fa-solid fa-file-pdf', color: '#ea4335' },
            { key: 'attendanceSheet', label: 'Attendance Sheet', icon: 'fa-solid fa-users', color: '#34a853' },
            { key: 'activityReport', label: 'Activity Report', icon: 'fa-solid fa-chart-line', color: '#1a73e8' },
            { key: 'program', label: 'Program', icon: 'fa-solid fa-calendar-alt', color: '#7c3aed' },
            { key: 'photos', label: 'Photos', icon: 'fa-solid fa-images', color: '#fbbc04' }
        ]
        
        linkMap.forEach(({ key, label, icon, color }) => {
            const value = links[key]
            if (value && value.length > 0) {
                const link = $({
                    tag: 'a',
                    att: {
                        href: value,
                        target: '_blank',
                        title: label
                    },
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: color,
                        textDecoration: 'none',
                        fontSize: '12px',
                        padding: '2px 6px',
                        borderRadius: '4px',
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
                            e.currentTarget.style.backgroundColor = '#f1f3f4'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }
                    }
                })
                linkContainer.appendChild(link)
            }
        })
        
        return linkContainer
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
                    color: '#5f6368',
                    border: '1px solid #e8eaed',
                    fontFamily: 'monospace',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#ffffff'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    backgroundColor: '#ffffff'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    maxWidth: '250px',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    backgroundColor: '#ffffff'
                },
                child: [createActionButtons(item)]
            })
        )

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    const row = e.currentTarget
                    row.style.backgroundColor = '#f8f9fa'
                    // Add subtle highlight effect to all cells
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                        cell.style.backgroundColor = '#f8f9fa'
                    })
                },
                type2: 'mouseleave',
                method2: (e) => {
                    const row = e.currentTarget
                    row.style.backgroundColor = '#ffffff'
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                        cell.style.backgroundColor = '#ffffff'
                    })
                }
            }
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
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#1a73e8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Edit',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-pen' },
                            style: { fontSize: '14px' }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#e8f0fe'
                            e.currentTarget.style.transform = 'scale(1.1)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                        }
                    }
                }),
                // Delete button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ea4335',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Delete',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-trash' },
                            style: { fontSize: '14px' }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteTraining(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#fce8e6'
                            e.currentTarget.style.transform = 'scale(1.1)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
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
                                e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
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
                                e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
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
                                attendees.splice(attendeeIndex, 1)
                                attendeeRow.remove()
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                padding: '20px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '20px',
                        width: '900px',
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 32px',
                                borderBottom: '1px solid #e8eaed',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#ffffff',
                                flexShrink: 0
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
                                            tag: 'div',
                                            style: {
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-user-graduate' },
                                                    style: { color: '#ffffff', fontSize: '18px' }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'h2',
                                            text: isEditing ? 'Edit Training/Seminar Attended' : 'Add Training/Seminar Attended',
                                            style: {
                                                margin: '0',
                                                fontSize: '22px',
                                                fontWeight: '600',
                                                color: '#202124',
                                                letterSpacing: '-0.3px'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'button',
                                    att: { type: 'button' },
                                    style: {
                                        background: 'none',
                                        border: 'none',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        color: '#5f6368',
                                        cursor: 'pointer',
                                        fontSize: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: 'transparent'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-times' },
                                            style: { fontSize: '20px' }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f3f4'
                                            e.currentTarget.style.color = '#202124'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                            e.currentTarget.style.color = '#5f6368'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Modal body with scroll
                        $({
                            tag: 'div',
                            style: {
                                overflowY: 'auto',
                                flex: 1,
                                padding: '0 32px 32px 32px'
                            },
                            child: [
                                $({
                                    tag: 'form',
                                    att: { id: 'attended-training-form', enctype: 'multipart/form-data' },
                                    style: {
                                        paddingTop: '24px'
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
                                                        id: 'attended-type-select'
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
                                                        WebkitAppearance: 'none',
                                                        MozAppearance: 'none',
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

                                        // Attendees section
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
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
                                                            tag: 'div',
                                                            child: [
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Name/s of Attendee/s *',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Add all attendees who participated',
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
                                                            tag: 'button',
                                                            att: { type: 'button' },
                                                            style: {
                                                                padding: '8px 16px',
                                                                backgroundColor: '#7c3aed',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                color: '#ffffff',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontFamily: 'inherit'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-plus' },
                                                                    style: { fontSize: '12px' }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Add Attendee'
                                                                })
                                                            ],
                                                            event: {
                                                                type: 'click',
                                                                method: () => {
                                                                    const newRow = addAttendeeField()
                                                                    attendeesContainer.appendChild(newRow)
                                                                },
                                                                type2: 'mouseenter',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.backgroundColor = '#6d28d9'
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'
                                                                },
                                                                type3: 'mouseleave',
                                                                method3: (e) => {
                                                                    e.currentTarget.style.backgroundColor = '#7c3aed'
                                                                    e.currentTarget.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    att: { id: 'attendees-container' },
                                                    style: {
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '2px solid #e8eaed',
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
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Training/Seminar Title *',
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
                                                        placeholder: 'Enter training/seminar title...',
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

                                        // Category and Date row
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '16px',
                                                marginBottom: '24px'
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
                                                                color: '#202124',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
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
                                                                WebkitAppearance: 'none',
                                                                MozAppearance: 'none',
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'right 14px center',
                                                                paddingRight: '40px'
                                                            },
                                                            child: [
                                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Category --' }),
                                                                $({ tag: 'option', att: { value: 'Institutional', selected: isEditing && item.category === 'Institutional' }, text: '🏛️ Institutional' }),
                                                                $({ tag: 'option', att: { value: 'National', selected: isEditing && item.category === 'National' }, text: '🇵🇭 National' }),
                                                                $({ tag: 'option', att: { value: 'Regional', selected: isEditing && item.category === 'Regional' }, text: '📍 Regional' }),
                                                                $({ tag: 'option', att: { value: 'Local', selected: isEditing && item.category === 'Local' }, text: '🏘️ Local' })
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
                                                marginBottom: '24px'
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
                                                                color: '#202124',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
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
                                                    child: [
                                                        $({
                                                            tag: 'label',
                                                            text: 'Sponsoring Agency *',
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
                                                                name: 'sponsoringAgency',
                                                                value: isEditing ? (item.sponsoringAgency || '') : '',
                                                                placeholder: 'Enter sponsoring agency...',
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
                                                })
                                            ]
                                        }),

                                        // Paper Trail Documents section with modern file upload
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
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
                                                                borderRadius: '10px',
                                                                backgroundColor: '#e8f0fe',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-folder-open' },
                                                                    style: { color: '#1a73e8', fontSize: '16px' }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            child: [
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Paper Trail Documents',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        display: 'block',
                                                                        margin: 0
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Upload supporting documents (PDF, JPEG, PNG, GIF, WEBP)',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#5f6368',
                                                                        display: 'block',
                                                                        marginTop: '2px'
                                                                    }
                                                                })
                                                            ]
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
                                                        createModernFileUpload('Memorandum to Attend', 'memorandum_file', 'fa-solid fa-file-pdf', '#ea4335', isEditing ? item.memorandum_file : null),
                                                        createModernFileUpload('Invitation', 'invitation_file', 'fa-solid fa-envelope', '#1a73e8', isEditing ? item.invitation_file : null),
                                                        createModernFileUpload('Certificate', 'certificate_file', 'fa-solid fa-award', '#34a853', isEditing ? item.certificate_file : null),
                                                        createModernFileUpload('Program', 'program_file', 'fa-solid fa-calendar-alt', '#7c3aed', isEditing ? item.program_file : null)
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
                                                borderTop: '1px solid #e8eaed',
                                                paddingTop: '20px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: 'Cancel',
                                                    style: {
                                                        padding: '12px 28px',
                                                        backgroundColor: 'transparent',
                                                        border: '2px solid #e8eaed',
                                                        borderRadius: '10px',
                                                        color: '#5f6368',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: closeModal,
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.currentTarget.style.backgroundColor = '#f1f3f4'
                                                            e.currentTarget.style.borderColor = '#dadce0'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                            e.currentTarget.style.borderColor = '#e8eaed'
                                                        }
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'submit' },
                                                    text: isEditing ? 'Update Training/Seminar' : 'Add Training/Seminar',
                                                    style: {
                                                        padding: '12px 32px',
                                                        backgroundColor: '#7c3aed',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s ease',
                                                        fontFamily: 'inherit',
                                                        letterSpacing: '0.3px'
                                                    },
                                                    event: {
                                                        type: 'mouseenter',
                                                        method: (e) => {
                                                            e.currentTarget.style.backgroundColor = '#6d28d9'
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'
                                                        },
                                                        type2: 'mouseleave',
                                                        method2: (e) => {
                                                            e.currentTarget.style.backgroundColor = '#7c3aed'
                                                            e.currentTarget.style.boxShadow = 'none'
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

    const createModernFileUpload = (label, name, icon, color, existingFile, required = false) => {
        return $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: `2px solid ${required ? color : '#e8eaed'}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.borderColor = color
                    e.currentTarget.style.boxShadow = `0 4px 16px ${color}25`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.borderColor = required ? color : '#e8eaed'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            },
            child: [
                // Header with icon and label
                $({
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
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                backgroundColor: `${color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: icon },
                                    style: { 
                                        color: color, 
                                        fontSize: '16px' 
                                    }
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
                                    text: label,
                                    style: {
                                        color: '#202124',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        margin: 0,
                                        display: 'block'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: existingFile ? 'File attached' : 'No file attached',
                                    style: {
                                        fontSize: '11px',
                                        color: existingFile ? '#34a853' : '#9aa0a6',
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
                                fontSize: '10px',
                                color: '#ea4335',
                                backgroundColor: '#fce8e6',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                flexShrink: 0
                            }
                        })
                    ]
                }),
                
                // File input area
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        marginBottom: '10px'
                    },
                    child: [
                        // Hidden file input
                        $({
                            tag: 'input',
                            att: {
                                type: 'file',
                                name: name,
                                id: `${name}-input`,
                                accept: '.pdf,.jpg,.jpeg,.png,.gif,.webp',
                                ...(required ? { required: 'required' } : {})
                            },
                            style: {
                                display: 'none'
                            },
                            event: {
                                type: 'change',
                                method: (e) => {
                                    const file = e.target.files[0]
                                    if (file) {
                                        const fileNameSpan = document.getElementById(`${name}-filename`)
                                        const statusSpan = e.currentTarget.closest('.modern-upload-card').querySelector('.upload-status')
                                        if (fileNameSpan) {
                                            fileNameSpan.textContent = file.name
                                            fileNameSpan.style.color = '#1e8e3e'
                                        }
                                        if (statusSpan) {
                                            statusSpan.textContent = '✅ File selected'
                                            statusSpan.style.color = '#1e8e3e'
                                        }
                                        // Update the file attached text
                                        const attachText = e.currentTarget.closest('.modern-upload-card').querySelector('.file-attached-text')
                                        if (attachText) {
                                            attachText.textContent = 'File ready to upload'
                                            attachText.style.color = '#1e8e3e'
                                        }
                                        showNotification(`${file.name} selected successfully`, 'success')
                                    }
                                }
                            }
                        }),
                        
                        // Custom upload button
                        $({
                            tag: 'button',
                            att: { type: 'button' },
                            style: {
                                width: '100%',
                                padding: '10px 14px',
                                backgroundColor: '#f8f9fa',
                                border: `2px dashed ${existingFile ? '#34a853' : '#dadce0'}`,
                                borderRadius: '8px',
                                color: '#202124',
                                fontSize: '13px',
                                cursor: 'pointer',
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
                                    att: { className: 'fa-solid fa-cloud-upload-alt' },
                                    style: { 
                                        fontSize: '16px', 
                                        color: existingFile ? '#34a853' : color 
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: existingFile ? 'Replace File' : 'Choose File'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.preventDefault()
                                    const fileInput = document.getElementById(`${name}-input`)
                                    if (fileInput) fileInput.click()
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f8fe'
                                    e.currentTarget.style.borderColor = color
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                    e.currentTarget.style.borderColor = existingFile ? '#34a853' : '#dadce0'
                                }
                            }
                        })
                    ]
                }),
                
                // File name display
                $({
                    tag: 'div',
                    att: { id: `${name}-filename` },
                    style: {
                        fontSize: '12px',
                        color: '#5f6368',
                        textAlign: 'center',
                        padding: '4px',
                        marginBottom: '8px',
                        wordBreak: 'break-all',
                        minHeight: '20px'
                    },
                    text: existingFile ? existingFile.split('/').pop() || 'Document' : ''
                }),
                
                // Status indicator
                $({
                    tag: 'div',
                    att: { className: 'upload-status' },
                    style: {
                        fontSize: '11px',
                        color: existingFile ? '#34a853' : '#9aa0a6',
                        textAlign: 'center',
                        marginBottom: '8px',
                        fontWeight: '500'
                    },
                    text: existingFile ? '✅ File attached' : '📎 No file selected'
                }),
                
                // Action buttons (if file exists)
                ...(existingFile ? [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '8px',
                            marginTop: '4px'
                        },
                        child: [
                            // View button
                            $({
                                tag: 'button',
                                att: { type: 'button' },
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e8eaed',
                                    borderRadius: '8px',
                                    color: '#1a73e8',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-eye' },
                                        style: { fontSize: '12px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'View'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.preventDefault()
                                        window.open(existingFile, '_blank')
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
                            }),
                            // Download button
                            $({
                                tag: 'button',
                                att: { type: 'button' },
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e8eaed',
                                    borderRadius: '8px',
                                    color: '#34a853',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-download' },
                                        style: { fontSize: '12px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Download'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.preventDefault()
                                        window.open(existingFile, '_blank')
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#e6f4ea'
                                        e.currentTarget.style.borderColor = '#34a853'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.borderColor = '#e8eaed'
                                    }
                                }
                            })
                        ]
                    })
                ] : [])
            ]
        })
    }

    const toggleLocationSelect = (type, selectedValue = '') => {
        const container = document.getElementById('location-select-container')
        if (!container) return

        container.innerHTML = ''

        if (!type) {
            container.appendChild(
                $({
                    tag: 'div',
                    style: {
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        border: '2px dashed #e8eaed',
                        textAlign: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: '👆',
                            style: { fontSize: '24px', display: 'block', marginBottom: '8px' }
                        }),
                        $({
                            tag: 'p',
                            text: 'Please select a type first',
                            style: {
                                color: '#5f6368',
                                fontSize: '14px',
                                margin: 0,
                                fontWeight: '500'
                            }
                        })
                    ]
                })
            )
            return
        }

        const options = type === 'campus' ? campuses.filter(c => c !== 'All Campuses') : centers.filter(c => c !== 'All Centers')
        const labelText = type === 'campus' ? 'Select Campus *' : 'Select Center *'

        container.appendChild(
            $({
                tag: 'div',
                style: {
                    animation: 'fadeIn 0.3s ease'
                },
                child: [
                    $({
                        tag: 'label',
                        text: labelText,
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
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235f6368' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 14px center',
                            paddingRight: '40px'
                        },
                        child: [
                            $({ 
                                tag: 'option', 
                                att: { value: '' }, 
                                text: `-- Select ${type === 'campus' ? 'Campus' : 'Center'} --` 
                            }),
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

    const refreshData = async () => {
        attendedData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchAttendedData()
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
                borderBottom: '2px solid #e8eaed',
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
                        flexWrap: 'wrap',
                        flex: '1'
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
                                    tag: 'div',
                                    style: {
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-user-graduate' },
                                            style: { color: '#ffffff', fontSize: '20px' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column'
                                    },
                                    child: [
                                        $({
                                            tag: 'h2',
                                            text: 'Summary List of Faculty Research Related Trainings/ Seminars Attended',
                                            style: {
                                                color: '#202124',
                                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '20px',
                                                fontWeight: '600',
                                                margin: '0',
                                                letterSpacing: '-0.3px',
                                                lineHeight: '1.3'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            style: {
                                                fontSize: '13px',
                                                color: '#5f6368',
                                                marginTop: '2px'
                                            },
                                            text: 'Manage and track all training and seminar records'
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'record-count' },
                                    style: {
                                        backgroundColor: '#f1f3f4',
                                        color: '#5f6368',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        fontWeight: '500',
                                        border: '1px solid #e8eaed',
                                        whiteSpace: 'nowrap'
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
                                gap: '8px',
                                backgroundColor: '#f8f9fa',
                                padding: '4px',
                                borderRadius: '10px',
                                border: '2px solid #e8eaed',
                                flexWrap: 'wrap'
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
                                        padding: '8px 14px',
                                        color: '#202124',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '160px',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%235f6368' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        paddingRight: '30px'
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
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#ffffff'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
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
                                        padding: '8px 14px',
                                        color: '#202124',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '250px',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%235f6368' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        paddingRight: '30px'
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
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#ffffff'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.boxShadow = 'none'
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
                                        padding: '8px 14px',
                                        color: '#202124',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '150px',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%235f6368' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 10px center',
                                        paddingRight: '30px'
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
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#ffffff'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
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
                    style: {
                        padding: '10px 24px',
                        backgroundColor: '#7c3aed',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.3px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-plus' },
                            style: { fontSize: '12px' }
                        }),
                        $({
                            tag: 'span',
                            text: 'Add Training/Seminar'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: openAddModal,
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#6d28d9'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#7c3aed'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                        }
                    }
                })
            ]
        })
    }

    const StatsCards = () => {
        return $({
            tag: 'div',
            att: { className: 'stats-cards' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e8eaed'
            },
            child: [
                // Total Trainings Attended
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '2px solid #e8eaed',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#7c3aed'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.borderColor = '#e8eaed'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#f3e8f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #e8d5f5'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user-graduate' },
                                    style: { color: '#7c3aed', fontSize: '26px' }
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
                                        color: '#202124',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Trainings',
                                    style: {
                                        fontSize: '13px',
                                        color: '#5f6368',
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
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '2px solid #e8eaed',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#34a853'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(52,168,83,0.12)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.borderColor = '#e8eaed'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#e6f4ea',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #b7e1cd'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-users' },
                                    style: { color: '#34a853', fontSize: '26px' }
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
                                        color: '#202124',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Attendees',
                                    style: {
                                        fontSize: '13px',
                                        color: '#5f6368',
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
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        border: '2px solid #e8eaed',
                        gridColumn: 'span 2',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.borderColor = '#1a73e8'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,115,232,0.08)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.borderColor = '#e8eaed'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '16px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chart-pie' },
                                    style: { color: '#1a73e8', fontSize: '18px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Category Breakdown',
                                    style: {
                                        fontSize: '14px',
                                        color: '#202124',
                                        fontWeight: '600'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createCategoryStat('Institutional', '#1a73e8', 'stat-institutional'),
                                createCategoryStat('National', '#34a853', 'stat-national'),
                                createCategoryStat('Regional', '#fbbc04', 'stat-regional'),
                                createCategoryStat('Local', '#7c3aed', 'stat-local')
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const createCategoryStat = (label, color, className) => {
        return $({
            tag: 'div',
            style: {
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '14px 16px',
                textAlign: 'center',
                border: '2px solid #e8eaed',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = color
                    e.currentTarget.style.boxShadow = `0 4px 12px ${color}25`
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#e8eaed'
                    e.currentTarget.style.boxShadow = 'none'
                }
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `stat-${label.toLowerCase()} ${className}` },
                    text: '0',
                    style: {
                        display: 'block',
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
                        display: 'block',
                        fontSize: '12px',
                        color: '#5f6368',
                        fontWeight: '500',
                        marginTop: '4px'
                    }
                })
            ]
        })
    }
    
    const TableHeader = () => {
        const headers = [
            { key: 'NO.', align: 'center', width: '50px' },
            { key: 'Name/s of Attendee/s', align: 'left', width: '180px' },
            { key: 'Training/Seminar Title', align: 'left', width: '200px' },
            { key: 'Category\n(Int\'l, Nat\'l, Reg\'l, Local)', align: 'center', width: '120px' },
            { key: 'Date', align: 'center', width: '100px' },
            { key: 'Venue', align: 'left', width: '150px' },
            { key: 'Sponsoring Agency', align: 'left', width: '150px' },
            { key: 'Link of the Paper Trail\n(Memorandum to attend, Invitation,\nCertificate, & Program)', align: 'left', width: '250px' },
            { key: 'ACTIONS', align: 'center', width: '80px' }
        ]

        const row = $({ tag: 'tr' })

        headers.forEach(({ key, align, width }) => {
            const th = $({
                tag: 'th',
                style: {
                    padding: '14px 16px',
                    textAlign: align,
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1a73e8',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e8eaed',
                    borderBottom: '3px solid #1a73e8',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    width: width || 'auto',
                    minWidth: width || 'auto',
                    position: 'sticky',
                    top: '0',
                    zIndex: '2',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                },
                child: [
                    // Add icon based on header
                    $({
                        tag: 'span',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: align === 'center' ? 'center' : 'flex-start'
                        },
                        child: [
                            ...(key === 'NO.' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-hashtag' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key.includes('Attendee') ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key.includes('Training') ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-graduation-cap' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key.includes('Category') ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-tag' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Date' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-calendar-alt' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Venue' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-map-pin' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key.includes('Sponsoring') ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key.includes('Paper Trail') ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-link' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'ACTIONS' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-tools' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            $({
                                tag: 'span',
                                text: key
                            })
                        ]
                    })
                ]
            })
            row.appendChild(th)
        })

        return $({
            tag: 'thead',
            child: [row]
        })
    }

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 320px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderRadius: '12px',
                border: '2px solid #e8eaed',
                margin: '0 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                        minWidth: '1400px',
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

    const showNotification = (message, type = 'info') => {
        // Define colors based on type
        const colors = {
            info: {
                bg: '#ffffff',
                border: '#1a73e8',
                icon: '#1a73e8',
                text: '#202124',
                shadow: 'rgba(26,115,232,0.15)'
            },
            success: {
                bg: '#ffffff',
                border: '#34a853',
                icon: '#34a853',
                text: '#202124',
                shadow: 'rgba(52,168,83,0.15)'
            },
            error: {
                bg: '#ffffff',
                border: '#ea4335',
                icon: '#ea4335',
                text: '#202124',
                shadow: 'rgba(234,67,53,0.15)'
            },
            warning: {
                bg: '#ffffff',
                border: '#fbbc04',
                icon: '#fbbc04',
                text: '#202124',
                shadow: 'rgba(251,188,4,0.15)'
            }
        }

        const color = colors[type] || colors.info
        
        // Icon mapping
        const icons = {
            info: 'fa-solid fa-info-circle',
            success: 'fa-solid fa-check-circle',
            error: 'fa-solid fa-exclamation-circle',
            warning: 'fa-solid fa-exclamation-triangle'
        }

        const notification = $({
            tag: 'div',
            style: {
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                padding: '16px 20px',
                backgroundColor: color.bg,
                borderLeft: `4px solid ${color.border}`,
                borderRadius: '12px',
                color: color.text,
                fontSize: '14px',
                zIndex: '1001',
                boxShadow: `0 8px 32px ${color.shadow}`,
                animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                maxWidth: '420px',
                minWidth: '300px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                border: '1px solid #e8eaed'
            },
            child: [
                // Icon
                $({
                    tag: 'div',
                    style: {
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color.border + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: icons[type] || icons.info },
                            style: {
                                color: color.border,
                                fontSize: '16px'
                            }
                        })
                    ]
                }),
                // Message
                $({
                    tag: 'div',
                    style: {
                        flex: 1,
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: color.text,
                        fontWeight: '500'
                    },
                    text: message
                }),
                // Close button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        flexShrink: 0,
                        background: 'none',
                        border: 'none',
                        color: '#9aa0a6',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-times' },
                            style: { fontSize: '14px' }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            notification.style.opacity = '0'
                            notification.style.transform = 'translateX(20px)'
                            notification.style.transition = 'all 0.3s ease'
                            setTimeout(() => notification.remove(), 300)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#f1f3f4'
                            e.currentTarget.style.color = '#202124'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#9aa0a6'
                        }
                    }
                })
            ]
        })

        document.body.appendChild(notification)

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0'
                notification.style.transform = 'translateX(20px)'
                notification.style.transition = 'all 0.3s ease'
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove()
                    }
                }, 300)
            }
        }, 4000)
    }

    // Return main container
    return $({
        tag: 'div',
        att: { className: 'trainings-attended-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
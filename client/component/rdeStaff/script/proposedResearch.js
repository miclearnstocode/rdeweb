import { $, Waiting, RejectCommentModal } from "../../../lib/lib.js"

export const ProposedResearch = () => {
    let mainTableContainer
    let tableBody
    let scrollContainer
    let researchData = []
    let filteredData = []
    let activeFilter = 'all'
    let activeStatusFilter = ''
    let currentEditItem = null
    let facultyPositions = []
    let modalElement = null
    let loadingElement = null
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let loadedCount = 0
    let revisionModalElement = null
    let currentRevisionItem = null
    let revisionComments = []
    let stats = {
        total: 0,
        inHouseReview: 0,
        symposium: 0,
        thisYear: 0
    }

    // Columns for proposed research
    const columns = [
        { field: 'year', header: 'YEAR', width: '70px' },
        { field: 'paperTrailNo', header: 'PAPER TRAIL NO.', width: '100px' },
        { field: 'campus', header: 'CAMPUS/CENTER', width: '120px' },
        { field: 'category', header: 'CATEGORY', width: '120px' },
        { field: 'title', header: 'TITLE', width: '300px' },
        { field: 'authors', header: 'AUTHOR/S', width: '250px' },
        { field: 'facultyResearcher', header: 'FACULTY RESEARCHER', width: '250px' },
        { field: 'academicRank', header: 'Academic Rank', width: '100px' },
        { field: 'nonAcademicRank', header: 'Non-Academic Rank', width: '120px' },
        { field: 'jobOrder', header: 'Job Order', width: '80px' },
        { field: 'inhouseLocal', header: 'In-house Review Local (Campus/Satellite College)', width: '200px' },
        { field: 'inhouseUniversity', header: 'In-house Review University Level', width: '200px' },
        { field: 'symposiumLocal', header: 'Symposium Local (Campus/Satellite College)', width: '200px' },
        { field: 'symposiumUniversity', header: 'Symposium University Level', width: '200px' },
        { field: 'dateStarted', header: 'Date Started (MMM-DD-YYYY)', width: '150px' },
        { field: 'actions', header: 'ACTIONS', width: '80px' }
    ]
    const fetchRevisionComments = async (researchId, eventType) => {
        try {
            const formData = new FormData()
            formData.append('action', 'get_comments')
            formData.append('research_id', researchId)
            formData.append('event_type', eventType)

            const response = await fetch('/proposedresearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.status) {
                return result.data || []
            }
            return []
        } catch (error) {
            console.error('Error fetching comments:', error)
            return []
        }
    }
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

    // Show loading indicator at bottom
    const showBottomLoading = () => {
        if (!tableBody) return

        const loadingRow = document.createElement('tr')
        loadingRow.id = 'loading-row'
        loadingRow.style.backgroundColor = '#2d2d2d'

        const loadingCell = document.createElement('td')
        loadingCell.colSpan = columns.length
        loadingCell.style.padding = '20px'
        loadingCell.style.textAlign = 'center'
        loadingCell.style.color = '#aaa'
        loadingCell.innerHTML = '<span class="fa-solid fa-spinner fa-spin"></span> Loading more...'

        loadingRow.appendChild(loadingCell)
        tableBody.appendChild(loadingRow)
    }

    // Remove bottom loading indicator
    const removeBottomLoading = () => {
        const loadingRow = document.getElementById('loading-row')
        if (loadingRow) {
            loadingRow.remove()
        }
    }

    // Fetch data
    const fetchProposedResearch = async (cursor = null) => {
        if (isLoading || (!cursor && !hasMore && researchData.length > 0)) return

        isLoading = true

        if (!cursor) {
            showLoading()
        } else {
            showBottomLoading()
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch')
            if (cursor) {
                formData.append('cursor', cursor)
            }

            const response = await fetch('/proposedresearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.status) {
                const newData = result.data || []

                if (!cursor) {
                    // First page - replace data
                    researchData = newData
                    stats = result.stats || {
                        total: 0,
                        inHouseReview: 0,
                        symposium: 0,
                        thisYear: 0
                    }

                    // IMPORTANT: Update totalCount from stats.total
                    totalCount = stats.total || 0
                } else {
                    // Subsequent pages - append data
                    researchData = [...researchData, ...newData]
                }

                // Update pagination info
                if (result.pagination) {
                    nextCursor = result.pagination.next_cursor
                    hasMore = result.pagination.has_more
                    loadedCount = result.pagination.loaded + (cursor ? researchData.length : 0)
                }

                // Apply current filters
                applyFilters()

                // Update stats cards only on first load
                if (!cursor) {
                    updateStatsCards()
                }

                // Update the count display
                if (window.updateFilterCount) {
                    window.updateFilterCount()
                }
            } else {
                console.error('Failed to fetch data:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching proposed research:', error)
            if (!cursor) {
                showEmptyState()
            }
        } finally {
            isLoading = false
            removeBottomLoading()
            hideLoading()
        }
    }

    // Apply current filters to data
    const applyFilters = () => {
        // Start with all research data
        let filtered = [...researchData]

        // Apply type filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(item => item.eventType === activeFilter)
        }

        // Apply status filter
        if (activeStatusFilter) {
            filtered = filtered.filter(item => {
                if (activeStatusFilter === 'waiting_for_revised') {
                    return (item.inhouseUniversity === 'waiting for revised proposal' ||
                        item.symposiumUniversity === 'waiting for revised proposal')
                } else if (activeStatusFilter === 'submitted_revised') {
                    return (item.inhouseUniversity === 'submitted revised proposal' ||
                        item.symposiumUniversity === 'submitted revised proposal')
                }
                return true
            })
        }

        filteredData = filtered
        updateTableWithData()

        // Update the count display after filtering
        if (window.updateFilterCount) {
            window.updateFilterCount()
        }
    }

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const threshold = 200 // Load more when 200px from bottom

        if (scrollHeight - scrollTop - clientHeight < threshold) {
            fetchProposedResearch(nextCursor)
        }
    }
    // Open revision modal
    const openRevisionModal = async (item) => {
        currentRevisionItem = item
        showLoading()

        // Fetch comments for this research paper using the full event name to match database
        revisionComments = await fetchRevisionComments(item.id, item.eventName)

        hideLoading()
        renderRevisionModal()
    }

    // Close revision modal
    const closeRevisionModal = () => {
        if (revisionModalElement) {
            revisionModalElement.remove()
            revisionModalElement = null
            currentRevisionItem = null
            revisionComments = []
        }
    }

    // Handle accept revision
    const handleAcceptRevision = async () => {
        if (!currentRevisionItem) return

        showLoading()

        try {
            const response = await fetch('/proposedresearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_revision_status',
                    research_id: currentRevisionItem.id,
                    status: 'revision_accepted'
                })
            })

            const result = await response.json()

            if (result.status) {
                // Refresh data
                researchData = []
                filteredData = []
                hasMore = true
                nextCursor = null
                await fetchProposedResearch()
                closeRevisionModal()
            } else {
                alert('Error updating status: ' + result.message)
            }
        } catch (error) {
            console.error('Error accepting revision:', error)
            alert('Error: ' + error.message)
        } finally {
            hideLoading()
        }
    }

    // Handle reject revision
    const handleRejectRevision = async () => {
        if (!currentRevisionItem) return

        const modalResult = await RejectCommentModal('Reject Revised Submission');
        if (!modalResult.confirmed) return;

        showLoading()

        try {
            const response = await fetch('/proposedresearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'reject_revised',
                    doc_id: currentRevisionItem.endorsement_id,
                    reason: modalResult.reason,
                    type: `Rejected Revised Submission: ${currentRevisionItem.eventName || ''}`,
                    url: currentRevisionItem.revised_drive_view_url || ''
                })
            })

            const apiResult = await response.json()

            if (apiResult.status) {
                researchData = []
                filteredData = []
                hasMore = true
                nextCursor = null
                await fetchProposedResearch()
                closeRevisionModal()
            } else {
                alert('Error: ' + apiResult.message)
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error: ' + error.message)
        } finally {
            hideLoading()
        }
    }

    // Format comment text for display
    const formatCommentText = (label, text) => {
        if (!text || text.trim() === '') return null

        return $({
            tag: 'div',
            style: {
                marginBottom: '12px',
                padding: '10px',
                backgroundColor: '#333',
                borderRadius: '6px',
                border: '1px solid #444'
            },
            child: [
                $({
                    tag: 'div',
                    text: label,
                    style: {
                        fontWeight: '600',
                        color: 'deepskyblue',
                        marginBottom: '4px',
                        fontSize: '12px',
                        textTransform: 'uppercase'
                    }
                }),
                $({
                    tag: 'div',
                    text: text,
                    style: {
                        color: '#ddd',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                    }
                })
            ]
        })
    }

    // Render revision modal with file viewer and comments
    const renderRevisionModal = () => {
        if (revisionModalElement) {
            revisionModalElement.remove()
        }

        const item = currentRevisionItem
        if (!item) return

        const hasRevisedFile = item.revised_drive_view_url && item.revised_drive_view_url.trim() !== ''
        const currentStatus = item.revision_status || 'revision_pending'
        const canAcceptReject = currentStatus === 'revision_submitted'

        // Build comments sections
        const commentSections = []

        if (revisionComments.length > 0) {
            revisionComments.forEach((comment, index) => {
                const commentDiv = $({
                    tag: 'div',
                    style: {
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: index < revisionComments.length - 1 ? '1px solid #444' : 'none'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: `Evaluator: ${comment.evaluator_name || 'Unknown'}`,
                            style: {
                                fontWeight: '600',
                                color: '#ffb347',
                                marginBottom: '8px',
                                fontSize: '13px'
                            }
                        })
                    ]
                })

                // Add each comment section
                const titleSection = formatCommentText('Title', comment.title)
                if (titleSection) commentDiv.appendChild(titleSection)

                const introSection = formatCommentText('Introduction', comment.intro)
                if (introSection) commentDiv.appendChild(introSection)

                const abstractSection = formatCommentText('Abstract', comment.abstract)
                if (abstractSection) commentDiv.appendChild(abstractSection)

                const objectiveSection = formatCommentText('Objective', comment.objective)
                if (objectiveSection) commentDiv.appendChild(objectiveSection)

                const methodologySection = formatCommentText('Methodology', comment.methodology)
                if (methodologySection) commentDiv.appendChild(methodologySection)

                const resultsSection = formatCommentText('Results', comment.results)
                if (resultsSection) commentDiv.appendChild(resultsSection)

                const recommendationSection = formatCommentText('Recommendation', comment.recommendation)
                if (recommendationSection) commentDiv.appendChild(recommendationSection)

                const literatureSection = formatCommentText('Literature Review', comment.literature)
                if (literatureSection) commentDiv.appendChild(literatureSection)

                const otherSection = formatCommentText('Other Comments', comment.other)
                if (otherSection) commentDiv.appendChild(otherSection)

                commentSections.push(commentDiv)
            })
        } else {
            commentSections.push(
                $({
                    tag: 'div',
                    text: 'No evaluator comments available.',
                    style: {
                        color: '#888',
                        fontStyle: 'italic',
                        padding: '20px',
                        textAlign: 'center'
                    }
                })
            )
        }

        revisionModalElement = $({
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
                    if (e.target === revisionModalElement) {
                        closeRevisionModal()
                    }
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '12px',
                        width: '95%',
                        maxWidth: '1400px',
                        maxHeight: '90%',
                        overflow: 'auto',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        border: '1px solid #444',
                        display: 'flex',
                        flexDirection: 'column'
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
                                    text: 'Revision Review',
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
                                        method: closeRevisionModal
                                    }
                                })
                            ]
                        }),

                        // Content area - split into two columns
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flex: '1',
                                overflow: 'hidden',
                                minHeight: '500px'
                            },
                            child: [
                                // Left side - File viewer
                                $({
                                    tag: 'div',
                                    style: {
                                        flex: '1',
                                        padding: '20px',
                                        borderRight: '1px solid #444',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    },
                                    child: [
                                        // Research info
                                        $({
                                            tag: 'div',
                                            style: {
                                                marginBottom: '16px',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                borderRadius: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    text: item.title || 'No Title',
                                                    style: {
                                                        fontWeight: '600',
                                                        color: '#fff',
                                                        fontSize: '15px',
                                                        marginBottom: '8px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: `Event: ${item.eventName || 'N/A'}`,
                                                    style: { color: '#aaa', fontSize: '12px', marginBottom: '4px' }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: `Status: ${item.revision_status_display || 'Pending'}`,
                                                    style: {
                                                        color: item.revision_status === 'revision_accepted' ? '#4caf50' :
                                                            item.revision_status === 'revision_rejected' ? '#f44336' :
                                                                item.revision_status === 'revision_submitted' ? '#2196f3' : '#ff9800',
                                                        fontSize: '12px',
                                                        fontWeight: '600'
                                                    }
                                                })
                                            ]
                                        }),

                                        // File viewer or no file message
                                        hasRevisedFile ?
                                            $({
                                                tag: 'iframe',
                                                att: {
                                                    src: item.revised_drive_view_url,
                                                    width: '100%',
                                                    height: '100%',
                                                    frameborder: '0'
                                                },
                                                style: {
                                                    flex: '1',
                                                    borderRadius: '8px',
                                                    border: '1px solid #444',
                                                    minHeight: '400px'
                                                }
                                            }) :
                                            $({
                                                tag: 'div',
                                                style: {
                                                    flex: '1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#888',
                                                    fontSize: '16px',
                                                    backgroundColor: '#333',
                                                    borderRadius: '8px',
                                                    minHeight: '400px'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'div',
                                                        style: { textAlign: 'center' },
                                                        child: [
                                                            $({
                                                                tag: 'span',
                                                                att: { className: 'fa-solid fa-file-pdf' },
                                                                style: { fontSize: '48px', marginBottom: '16px', display: 'block', color: '#666' }
                                                            }),
                                                            $({
                                                                tag: 'div',
                                                                text: 'No revised file available',
                                                                style: { color: '#aaa' }
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                    ]
                                }),

                                // Right side - Evaluator comments
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '400px',
                                        minWidth: '350px',
                                        padding: '20px',
                                        overflow: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    },
                                    child: [
                                        $({
                                            tag: 'h3',
                                            text: 'Evaluator Comments',
                                            style: {
                                                margin: '0 0 16px 0',
                                                color: '#fff',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                paddingBottom: '12px',
                                                borderBottom: '1px solid #444'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: { flex: '1', overflow: 'auto' },
                                            child: commentSections
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Footer with action buttons
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px 24px',
                                borderTop: '1px solid #444',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#2d2d2d'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        padding: '10px 24px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        color: '#aaa',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeRevisionModal
                                    }
                                }),
                                ...(canAcceptReject ? [
                                    $({
                                        tag: 'button',
                                        text: 'Reject Revision',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#dc3545',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        },
                                        event: {
                                            type: 'click',
                                            method: handleRejectRevision
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Accept Revision',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#28a745',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        },
                                        event: {
                                            type: 'click',
                                            method: handleAcceptRevision
                                        }
                                    })
                                ] : [
                                    // Show current status if not in submitted state
                                    $({
                                        tag: 'div',
                                        text: `Status: ${item.revision_status_display || 'Pending'}`,
                                        style: {
                                            padding: '10px 24px',
                                            color: item.revision_status === 'revision_accepted' ? '#4caf50' : '#ff9800',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }
                                    })
                                ])
                            ]
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(revisionModalElement)
    }

    // Update table with filtered data
    const updateTableWithData = () => {
        if (!tableBody) return

        // Clear table body
        tableBody.innerHTML = ''

        if (filteredData.length === 0) {
            showEmptyState()
            return
        }

        // Remove empty state if it exists
        const emptyState = tableBody.querySelector('.empty-state')
        if (emptyState) {
            emptyState.remove()
        }

        // Add data rows
        filteredData.forEach(item => {
            tableBody.appendChild(createDataRow(item))
        })

        // Update loaded count display
        updateLoadedCount()
    }

    // Update loaded count
    const updateLoadedCount = () => {
        if (window.updateFilterCount) {
            window.updateFilterCount()
        }
    }

    // Format faculty researcher to display each on new line with proper wrapping
    const formatFacultyResearcher = (facultyResearcher) => {
        if (!facultyResearcher || facultyResearcher === '—') return '—'

        // Split by ' & ' and ',' to get individual names
        let names = []

        // Handle the case with ' & ' (last name)
        if (facultyResearcher.includes(' & ')) {
            const parts = facultyResearcher.split(' & ')
            // Add all parts, but we need to split the first part by commas
            const firstPart = parts[0]
            if (firstPart.includes(', ')) {
                names = [...firstPart.split(', '), parts[1]]
            } else {
                names = [firstPart, parts[1]]
            }
        } else if (facultyResearcher.includes(', ')) {
            // Just comma-separated
            names = facultyResearcher.split(', ')
        } else {
            // Single name
            names = [facultyResearcher]
        }

        // Create a div with each name on a new line, with proper wrapping
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                width: '100%',
                maxWidth: '100%'
            },
            child: names.map(name =>
                $({
                    tag: 'span',
                    text: name.trim(),
                    style: {
                        display: 'block',
                        lineHeight: '1.4',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        wordWrap: 'break-word',
                        width: '100%',
                        padding: '2px 0'
                    }
                })
            )
        })
    }

    // Open edit modal
    const openEditModal = async (item) => {
        currentEditItem = item
        showLoading()

        // Fetch latest data including academic positions
        try {
            const formData = new FormData()
            formData.append('action', 'get')
            formData.append('id', item.edit_id || item.id) // Use edit_id from mapping

            const response = await fetch('/proposedresearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.status) {
                const academic_positions = result.data.academic_positions || []
                const all_researchers = result.data.all_researchers || []

                console.log('All researchers:', all_researchers)
                console.log('Academic positions:', academic_positions)

                if (all_researchers.length > 0) {
                    // Create a map of existing positions by faculty name
                    const positionsMap = {}
                    academic_positions.forEach(pos => {
                        positionsMap[pos.faculty_name] = pos
                    })

                    // Build facultyPositions array with all researchers
                    facultyPositions = all_researchers.map(faculty_name => {
                        const existing = positionsMap[faculty_name]
                        return {
                            faculty_name: faculty_name,
                            academic_rank: existing?.academic_rank || '',
                            non_academic_rank: existing?.non_academic_rank || '',
                            job_order: existing?.job_order || ''
                        }
                    })
                } else {
                    facultyPositions = academic_positions
                }

                console.log('Faculty positions after mapping:', facultyPositions)
            }
        } catch (error) {
            console.error('Error fetching research details:', error)
            // Parse from the facultyResearcher string as fallback
            if (item.facultyResearcher && item.facultyResearcher !== '—') {
                let all_researchers = []
                if (item.facultyResearcher.includes(' & ')) {
                    const parts = item.facultyResearcher.split(' & ')
                    const firstPart = parts[0]
                    if (firstPart.includes(', ')) {
                        all_researchers = [...firstPart.split(', '), parts[1]]
                    } else {
                        all_researchers = [firstPart, parts[1]]
                    }
                } else if (item.facultyResearcher.includes(', ')) {
                    all_researchers = item.facultyResearcher.split(', ')
                } else {
                    all_researchers = [item.facultyResearcher]
                }

                facultyPositions = all_researchers.map(faculty_name => ({
                    faculty_name: faculty_name,
                    academic_rank: '',
                    non_academic_rank: '',
                    job_order: ''
                }))
            }
        } finally {
            hideLoading()
        }

        renderModal()
    }

    // Close modal
    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
            currentEditItem = null
            facultyPositions = []
        }
    }

    // Save changes
    const saveChanges = async () => {
        if (!currentEditItem) return

        showLoading()

        // Collect data from form
        const facultyData = []
        const facultyRows = document.querySelectorAll('.faculty-row')

        console.log('Found faculty rows:', facultyRows.length)

        facultyRows.forEach((row, index) => {
            const faculty_name = row.dataset.facultyName
            const academic_rank = row.querySelector('.academic-rank-input')?.value || ''
            const non_academic_rank = row.querySelector('.non-academic-rank-input')?.value || ''
            const job_order = row.querySelector('.job-order-input')?.value || ''

            console.log(`Faculty ${index + 1}:`, {
                faculty_name,
                academic_rank,
                non_academic_rank,
                job_order
            })

            // Include all faculty
            facultyData.push({
                faculty_name: faculty_name,
                academic_rank: academic_rank,
                non_academic_rank: non_academic_rank,
                job_order: job_order
            })
        })

        console.log('Sending faculty data:', facultyData)

        try {
            // Send as JSON
            const response = await fetch('/proposedresearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save_positions',
                    research_id: currentEditItem.edit_id || currentEditItem.id,
                    duplicate_group_id: currentEditItem.duplicate_group_id
                })
            })

            const result = await response.json()
            console.log('Save response:', result)

            if (result.status) {
                // Refresh data
                researchData = [] // Clear data
                filteredData = []
                hasMore = true
                nextCursor = null
                await fetchProposedResearch() // Reload from first page
                closeModal()
            } else {
                alert('Error saving data: ' + result.message)
            }
        } catch (error) {
            console.error('Error saving data:', error)
            alert('Error saving data: ' + error.message)
        } finally {
            hideLoading()
        }
    }

    // Render modal (same as before)
    const renderModal = () => {
        if (modalElement) {
            modalElement.remove()
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
                        width: '900px',
                        maxWidth: '95%',
                        maxHeight: '90%',
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
                                    text: 'Edit Academic Positions',
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
                                        method: closeModal
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#444'
                                            e.target.style.color = '#fff'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#888'
                                        }
                                    }
                                })
                            ]
                        }),

                        // Research info
                        $({
                            tag: 'div',
                            style: {
                                padding: '16px 24px',
                                backgroundColor: '#333',
                                borderBottom: '1px solid #444'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '14px',
                                        color: '#aaa',
                                        marginBottom: '4px'
                                    },
                                    text: 'Research Title:'
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '16px',
                                        color: '#fff',
                                        fontWeight: '500',
                                        wordBreak: 'break-word'
                                    },
                                    text: currentEditItem?.title || ''
                                })
                            ]
                        }),

                        // Faculty rows
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '250px 180px 180px 100px',
                                        gap: '12px',
                                        padding: '10px 0',
                                        borderBottom: '1px solid #444',
                                        marginBottom: '10px',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        color: '#aaa',
                                        textTransform: 'uppercase'
                                    },
                                    child: [
                                        $({ tag: 'div', text: 'Faculty Name' }),
                                        $({ tag: 'div', text: 'Academic Rank' }),
                                        $({ tag: 'div', text: 'Non-Academic Rank' }),
                                        $({ tag: 'div', text: 'Job Order' })
                                    ]
                                }),
                                ...facultyPositions.map(faculty => {
                                    // Create the div element
                                    const rowDiv = document.createElement('div')
                                    rowDiv.className = 'faculty-row'
                                    rowDiv.setAttribute('data-faculty-name', faculty.faculty_name)

                                    // Set styles
                                    Object.assign(rowDiv.style, {
                                        display: 'grid',
                                        gridTemplateColumns: '250px 180px 180px 100px',
                                        gap: '12px',
                                        marginBottom: '10px',
                                        alignItems: 'center'
                                    })

                                    // Create and append children
                                    const nameDiv = document.createElement('div')
                                    nameDiv.style.cssText = 'color: #ddd; font-size: 14px; word-break: break-word;'
                                    nameDiv.textContent = faculty.faculty_name

                                    const academicInput = document.createElement('input')
                                    academicInput.type = 'text'
                                    academicInput.className = 'academic-rank-input'
                                    academicInput.placeholder = 'e.g., Professor 1'
                                    academicInput.value = faculty.academic_rank || ''
                                    Object.assign(academicInput.style, {
                                        padding: '8px 10px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    academicInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = 'deepskyblue'
                                        e.target.style.backgroundColor = '#3d3d3d'
                                    })
                                    academicInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#444'
                                        e.target.style.backgroundColor = '#333'
                                    })

                                    const nonAcademicInput = document.createElement('input')
                                    nonAcademicInput.type = 'text'
                                    nonAcademicInput.className = 'non-academic-rank-input'
                                    nonAcademicInput.placeholder = 'e.g., Admin Staff'
                                    nonAcademicInput.value = faculty.non_academic_rank || ''
                                    Object.assign(nonAcademicInput.style, {
                                        padding: '8px 10px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    nonAcademicInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = 'deepskyblue'
                                        e.target.style.backgroundColor = '#3d3d3d'
                                    })
                                    nonAcademicInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#444'
                                        e.target.style.backgroundColor = '#333'
                                    })

                                    const jobOrderInput = document.createElement('input')
                                    jobOrderInput.type = 'text'
                                    jobOrderInput.className = 'job-order-input'
                                    jobOrderInput.placeholder = 'e.g., JO-001'
                                    jobOrderInput.value = faculty.job_order || ''
                                    Object.assign(jobOrderInput.style, {
                                        padding: '8px 10px',
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    jobOrderInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = 'deepskyblue'
                                        e.target.style.backgroundColor = '#3d3d3d'
                                    })
                                    jobOrderInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#444'
                                        e.target.style.backgroundColor = '#333'
                                    })

                                    rowDiv.appendChild(nameDiv)
                                    rowDiv.appendChild(academicInput)
                                    rowDiv.appendChild(nonAcademicInput)
                                    rowDiv.appendChild(jobOrderInput)

                                    return rowDiv
                                })
                            ]
                        }),

                        // Modal footer with buttons
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 24px',
                                borderTop: '1px solid #444',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                position: 'sticky',
                                bottom: '0',
                                backgroundColor: '#2d2d2d'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        padding: '10px 24px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '6px',
                                        color: '#aaa',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#333'
                                            e.target.style.borderColor = '#666'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.borderColor = '#444'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Save Changes',
                                    style: {
                                        padding: '10px 24px',
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: saveChanges
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#00a6d1'
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 5px 15px rgba(0, 191, 255, 0.3)'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'deepskyblue'
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = 'none'
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
                        color: 'deepskyblue',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    },
                    title: 'Edit academic positions',
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
                            e.target.style.backgroundColor = 'rgba(0, 191, 255, 0.2)'
                        }
                    },
                    event3: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.target.style.backgroundColor = 'transparent'
                        }
                    }
                })
            ]
        })
    }

    // Create a data row
    const createDataRow = (item) => {
        const cells = columns.map(col => {
            let cellContent = item[col.field] || '—'
            let cellStyle = {
                padding: '14px 8px',
                fontSize: '13px',
                color: '#ddd',
                borderBottom: '1px solid #444',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                wordWrap: 'break-word',
                fontFamily: 'Segoe UI, sans-serif',
                lineHeight: '1.4',
                verticalAlign: 'top',
                maxWidth: col.width || 'auto'
            }

            // For the status columns, create badges if there's a value
            if (col.field === 'inhouseUniversity' && item.inhouseUniversity) {
                return createStatusCell(item.inhouseUniversity, 'inhouse', item, cellStyle)
            }
            if (col.field === 'symposiumUniversity' && item.symposiumUniversity) {
                return createStatusCell(item.symposiumUniversity, 'symposium', item, cellStyle)
            }

            // For actions column
            if (col.field === 'actions') {
                return $({
                    tag: 'td',
                    style: { ...cellStyle, textAlign: 'center' },
                    child: [createActionButtons(item)]
                })
            }

            // For academic rank, non-academic rank, and job order columns
            if (['academicRank', 'nonAcademicRank', 'jobOrder'].includes(col.field)) {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            },
                            child: (item.all_researchers || []).map((name, index) => {
                                const pos = item.academic_positions?.[index]
                                let value = '—'

                                if (pos) {
                                    if (col.field === 'academicRank') value = pos.academic_rank || '—'
                                    if (col.field === 'nonAcademicRank') value = pos.non_academic_rank || '—'
                                    if (col.field === 'jobOrder') value = pos.job_order || '—'
                                }

                                return $({
                                    tag: 'div',
                                    text: value,
                                    style: {
                                        minHeight: '22px',
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        padding: '2px 0'
                                    }
                                })
                            })
                        })
                    ]
                })
            }

            // For authors field, use all_researchers to display all authors
            if (col.field === 'authors' && item.all_researchers && item.all_researchers.length > 0) {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [formatAuthors(item.all_researchers)]
                })
            }

            // For faculty researcher field, format with line breaks and proper wrapping
            if (col.field === 'facultyResearcher' && item.facultyResearcher && item.facultyResearcher !== '—') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [formatFacultyResearcher(item.facultyResearcher)]
                })
            }

            // For all other fields
            return $({
                tag: 'td',
                style: cellStyle,
                text: cellContent
            })
        })

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
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                }
            }
        })
    }

    // Format authors to display each on new line with proper wrapping
    const formatAuthors = (allResearchers) => {
        if (!allResearchers || allResearchers.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                width: '100%',
                maxWidth: '100%'
            },
            child: allResearchers.map(name =>
                $({
                    tag: 'span',
                    text: name.trim(),
                    style: {
                        display: 'block',
                        lineHeight: '1.4',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        wordWrap: 'break-word',
                        width: '100%',
                        padding: '2px 0'
                    }
                })
            )
        })
    }

    const createStatusCell = (status, type, item, baseStyle) => {
        let color = type === 'inhouse' ? '#ffb347' : '#7ccf7c'
        let bgColor = type === 'inhouse' ? '#3a2d1a' : '#1a3a2d'

        // Determine status color based on revision status
        const revisionStatus = item.revision_status || 'revision_pending'
        if (revisionStatus === 'revision_accepted') {
            color = '#4caf50'
            bgColor = '#1a3a2d'
        } else if (revisionStatus === 'revision_rejected') {
            color = '#f44336'
            bgColor = '#2d1a1a'
        } else if (revisionStatus === 'revision_submitted') {
            color = '#2196f3'
            bgColor = '#1a2a3a'
        }

        let displayText = status || '—'
        if (displayText !== '—') {
            displayText = displayText.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }

        return $({
            tag: 'td',
            style: { ...baseStyle, backgroundColor: bgColor, cursor: 'pointer' },
            child: [
                $({
                    tag: 'span',
                    style: {
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        backgroundColor: `${color}20`,
                        color: color,
                        border: `1px solid ${color}40`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    text: displayText,
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openRevisionModal(item)
                        }
                    },
                    event2: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.backgroundColor = `${color}40`
                        }
                    },
                    event3: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.target.style.backgroundColor = `${color}20`
                        }
                    }
                })
            ]
        })
    }

    // Update statistics cards
    const updateStatsCards = () => {
        const statsContainer = document.querySelector('.stats-cards-container')
        if (!statsContainer) return

        statsContainer.innerHTML = ''

        const statElements = [
            { label: 'Total Proposed', value: stats.total, icon: 'fa-file-lines', color: 'deepskyblue' },
            { label: 'In-House Review', value: stats.inHouseReview, icon: 'fa-users', color: '#ff9800' },
            { label: 'Symposium', value: stats.symposium, icon: 'fa-microphone', color: '#4caf50' },
            { label: 'This Year', value: stats.thisYear, icon: 'fa-calendar', color: '#00bcd4' }
        ]

        statElements.forEach(stat => {
            const statCard = $({
                tag: 'div',
                style: {
                    backgroundColor: '#333',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flex: '1',
                    minWidth: '160px',
                    border: '1px solid #444',
                    transition: 'transform 0.2s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: `${stat.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: `fa-solid ${stat.icon}` },
                                style: { color: stat.color, fontSize: '24px' }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: { display: 'flex', flexDirection: 'column' },
                        child: [
                            $({
                                tag: 'span',
                                text: stat.value,
                                style: {
                                    fontSize: '28px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    lineHeight: '1.2'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '12px',
                                    color: '#aaa',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }
                            })
                        ]
                    })
                ]
            })

            statsContainer.appendChild(statCard)
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
                height: '300px',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-flask' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.5,
                        color: 'deepskyblue'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Proposed Research Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Research papers presented in in-house review or symposium will appear here',
                    style: {
                        fontSize: '14px',
                        opacity: 0.7,
                        maxWidth: '500px',
                        textAlign: 'center',
                        lineHeight: '1.6'
                    }
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    // Filter functions with highlighting
    const filterByType = (type) => {
        activeFilter = type
        applyFilters()
        updateFilterButtons()
    }

    const filterByStatus = (status) => {
        activeStatusFilter = status
        applyFilters()
    }

    const searchResearch = (searchTerm) => {
        if (!searchTerm) {
            applyFilters()
        } else {
            const term = searchTerm.toLowerCase()
            filteredData = researchData.filter(item =>
                item.title?.toLowerCase().includes(term) ||
                item.authors?.toLowerCase().includes(term) ||
                item.facultyResearcher?.toLowerCase().includes(term) ||
                item.paperTrailNo?.toLowerCase().includes(term) ||
                item.category?.toLowerCase().includes(term) ||
                item.campus?.toLowerCase().includes(term) ||
                item.center?.toLowerCase().includes(term)
            )
            updateTableWithData()

            // Update the count display after search
            if (window.updateFilterCount) {
                window.updateFilterCount()
            }
        }
    }

    // Update filter button styles based on active filter
    const updateFilterButtons = () => {
        const filterContainer = document.querySelector('.filter-buttons-container')
        if (!filterContainer) return

        const buttons = filterContainer.children
        for (let button of buttons) {
            const buttonText = button.textContent.toLowerCase()
            if ((activeFilter === 'all' && buttonText === 'all') ||
                (activeFilter === 'inhouse' && buttonText.includes('in-house')) ||
                (activeFilter === 'symposium' && buttonText.includes('symposium'))) {
                button.style.backgroundColor = 'deepskyblue'
                button.style.color = '#fff'
            } else {
                button.style.backgroundColor = 'transparent'
                button.style.color = '#aaa'
            }
        }
    }

    const getMainContainer = (el) => {
        mainTableContainer = el
    }

    const getTableBody = (el) => {
        tableBody = el
    }

    const getScrollContainer = (el) => {
        scrollContainer = el
        // Add scroll event listener
        scrollContainer.addEventListener('scroll', handleScroll)
        // Fetch data when scroll container is ready
        fetchProposedResearch()
    }

    // Filter and search bar
    const FilterBar = () => {
        // Create a reference to the count span
        let countSpan

        const updateCount = () => {
            if (countSpan) {
                countSpan.textContent = `Showing ${filteredData.length} of ${totalCount} records`
            }
        }

        // Expose updateCount to parent scope
        window.updateFilterCount = updateCount

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
                        gap: '15px',
                        flexWrap: 'wrap'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-lines' },
                                    style: { color: 'deepskyblue', fontSize: '20px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Proposed Research',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: '500',
                                        margin: '0'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'filter-buttons-container' },
                            style: {
                                display: 'flex',
                                gap: '10px',
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'All',
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => filterByType('all')
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'In-House Review',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => filterByType('inhouse')
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Symposium',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => filterByType('symposium')
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'loaded-count' },
                            style: {
                                fontSize: '12px',
                                color: '#888',
                                marginLeft: '10px'
                            },
                            text: `Showing 0 of 0 records`, // Initial text
                            elementHandler: (el) => {
                                countSpan = el // Store reference to the span
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-magnifying-glass' },
                                    style: {
                                        position: 'absolute',
                                        left: '12px',
                                        color: '#666',
                                        fontSize: '14px'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search proposed research...',
                                        className: 'research-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '20px',
                                        padding: '10px 16px 10px 40px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '250px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            searchResearch(e.target.value)
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'select',
                            style: {
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '20px',
                                padding: '10px 32px 10px 16px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                minWidth: '180px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Status' }),
                                $({ tag: 'option', att: { value: 'waiting_for_revised' }, text: 'Waiting for Revised Proposal' }),
                                $({ tag: 'option', att: { value: 'submitted_revised' }, text: 'Submitted Revised Proposal' })
                            ],
                            event: {
                                type: 'change',
                                method: (e) => {
                                    filterByStatus(e.target.value)
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Statistics cards
    const StatsCards = () => {
        return $({
            tag: 'div',
            att: { className: 'stats-cards-container' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            }
        })
    }

    // Table header component
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            let backgroundColor = '#2d2d2d'
            let textColor = '#bbb'

            if (col.field.includes('inhouse')) {
                backgroundColor = '#3a2d1a'
                textColor = '#ffb347'
            } else if (col.field.includes('symposium')) {
                backgroundColor = '#1a3a2d'
                textColor = '#7ccf7c'
            }

            return $({
                tag: 'th',
                style: {
                    padding: '14px 8px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: textColor,
                    backgroundColor: backgroundColor,
                    borderBottom: col.field.includes('inhouse') || col.field.includes('symposium') ? '2px solid #666' : '2px solid #444',
                    whiteSpace: 'nowrap',
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-sort' },
                                style: {
                                    fontSize: '10px',
                                    color: textColor,
                                    opacity: '0.5'
                                }
                            })
                        ]
                    })
                ]
            })
        })

        return $({
            tag: 'thead',
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        })
    }

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 220px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            elementHandler: getScrollContainer,
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        minWidth: 'max-content'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: getTableBody
                        })
                    ]
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'proposed-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/proposedResearch.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

// Utility functions for later use
export const formatProposedDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).replace(/,/g, '')
}

export const getProposedResearchStats = (data) => {
    return {
        total: data.length,
        inHouseReview: data.filter(item => item.eventType === 'inhouse').length,
        symposium: data.filter(item => item.eventType === 'symposium').length,
        thisYear: data.filter(item => item.year === new Date().getFullYear().toString()).length
    }
}
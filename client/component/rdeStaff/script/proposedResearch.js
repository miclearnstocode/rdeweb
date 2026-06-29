import { $, Waiting, RejectCommentModal } from "../../../lib/lib.js"
import { InhouseConfirmationModal } from './helperComponents/InhouseConfirmationModal.js';

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

    const removeBottomLoading = () => {
        const loadingRow = document.getElementById('loading-row')
        if (loadingRow) {
            loadingRow.remove()
        }
    }


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
                // Check both inhouseUniversity and symposiumUniversity for the status
                const inhouseStatus = item.inhouseUniversity?.toLowerCase() || ''
                const symposiumStatus = item.symposiumUniversity?.toLowerCase() || ''
                const filterValue = activeStatusFilter.toLowerCase()

                // Map filter values to their corresponding display strings (from API)
                const statusMap = {
                    'revision_pending': 'Pending Paper Revision',
                    'revision_submitted': 'Revision Paper Submitted',
                    'revision_accepted': 'Accepted Paper Revision',
                    'revision_rejected': 'Paper Revision Rejected'
                }

                // Get the display string for this status
                const targetStatus = statusMap[filterValue] || filterValue
                const targetStatusLower = targetStatus.toLowerCase()

                // Check if either field contains this status
                return inhouseStatus.includes(targetStatusLower) ||
                    symposiumStatus.includes(targetStatusLower)
            })
        }

        filteredData = filtered
        updateTableWithData()

        // Update the count display after filtering
        if (window.updateFilterCount) {
            window.updateFilterCount()
        }
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const threshold = 200

        if (scrollHeight - scrollTop - clientHeight < threshold) {
            fetchProposedResearch(nextCursor)
        }
    }

    const openRevisionModal = async (item) => {
        currentRevisionItem = item
        showLoading()

        revisionComments = await fetchRevisionComments(item.id, item.eventName)

        hideLoading()
        renderRevisionModal()
    }

    const closeRevisionModal = () => {
        if (revisionModalElement) {
            revisionModalElement.remove()
            revisionModalElement = null
            currentRevisionItem = null
            revisionComments = []
        }
    }

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

    const formatCommentText = (label, text) => {
        if (!text || text.trim() === '') return null

        return $({
            tag: 'div',
            style: {
                marginBottom: '12px',
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            },
            child: [
                $({
                    tag: 'div',
                    text: label,
                    style: {
                        fontWeight: '600',
                        color: '#0d6efd',
                        marginBottom: '4px',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }
                }),
                $({
                    tag: 'div',
                    text: text,
                    style: {
                        color: '#212529',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                    }
                })
            ]
        })
    }

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
                        borderBottom: index < revisionComments.length - 1 ? '1px solid #e9ecef' : 'none'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: `Evaluator: ${comment.evaluator_name || 'Unknown'}`,
                            style: {
                                fontWeight: '600',
                                color: '#0d6efd',
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
                        color: '#6c757d',
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Segoe UI, sans-serif',
                backdropFilter: 'blur(4px)'
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
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '95%',
                        maxWidth: '1400px',
                        maxHeight: '90%',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e9ecef',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 28px',
                                borderBottom: '1px solid #e9ecef',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#ffffff',
                                zIndex: '1',
                                borderRadius: '16px 16px 0 0'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: 'Revision Review',
                                    style: {
                                        margin: '0',
                                        fontSize: '20px',
                                        fontWeight: '600',
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
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeRevisionModal
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#f8f9fa'
                                            e.target.style.color = '#212529'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#6c757d'
                                        }
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
                                        padding: '24px',
                                        borderRight: '1px solid #e9ecef',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    },
                                    child: [
                                        // Research info
                                        $({
                                            tag: 'div',
                                            style: {
                                                marginBottom: '16px',
                                                padding: '16px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '12px',
                                                border: '1px solid #e9ecef'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    text: item.title || 'No Title',
                                                    style: {
                                                        fontWeight: '600',
                                                        color: '#212529',
                                                        fontSize: '15px',
                                                        marginBottom: '8px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: `Event: ${item.eventName || 'N/A'}`,
                                                    style: { color: '#6c757d', fontSize: '13px', marginBottom: '4px' }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: `Status: ${item.revision_status_display || 'Pending'}`,
                                                    style: {
                                                        color: item.revision_status === 'revision_accepted' ? '#2e7d32' :
                                                            item.revision_status === 'revision_rejected' ? '#c62828' :
                                                                item.revision_status === 'revision_submitted' ? '#0d47a1' : '#e65100',
                                                        fontSize: '13px',
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
                                                    borderRadius: '12px',
                                                    border: '1px solid #e9ecef',
                                                    minHeight: '400px',
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }) :
                                            $({
                                                tag: 'div',
                                                style: {
                                                    flex: '1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#6c757d',
                                                    fontSize: '16px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '12px',
                                                    minHeight: '400px',
                                                    border: '2px dashed #dee2e6'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'div',
                                                        style: { textAlign: 'center' },
                                                        child: [
                                                            $({
                                                                tag: 'span',
                                                                att: { className: 'fab fa-google-drive' },
                                                                style: { fontSize: '48px', marginBottom: '16px', display: 'block', color: '#adb5bd' }
                                                            }),
                                                            $({
                                                                tag: 'div',
                                                                text: 'No revised file available',
                                                                style: { color: '#6c757d' }
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
                                        padding: '24px',
                                        overflow: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: '#f8f9fa'
                                    },
                                    child: [
                                        $({
                                            tag: 'h3',
                                            text: 'Evaluator Comments',
                                            style: {
                                                margin: '0 0 16px 0',
                                                color: '#212529',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                paddingBottom: '12px',
                                                borderBottom: '2px solid #e9ecef'
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
                                padding: '20px 28px',
                                borderTop: '1px solid #e9ecef',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: '#ffffff',
                                borderRadius: '0 0 16px 16px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Close',
                                    style: {
                                        padding: '10px 24px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#6c757d',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeRevisionModal
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#f8f9fa'
                                            e.target.style.borderColor = '#0d6efd'
                                            e.target.style.color = '#212529'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.borderColor = '#dee2e6'
                                            e.target.style.color = '#6c757d'
                                        }
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
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                                        },
                                        event: {
                                            type: 'click',
                                            method: handleRejectRevision
                                        },
                                        event2: {
                                            type: 'mouseenter',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#c82333'
                                                e.target.style.transform = 'translateY(-2px)'
                                                e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.4)'
                                            }
                                        },
                                        event3: {
                                            type: 'mouseleave',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#dc3545'
                                                e.target.style.transform = 'translateY(0)'
                                                e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)'
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Accept Revision',
                                        style: {
                                            padding: '10px 24px',
                                            backgroundColor: '#28a745',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                                        },
                                        event: {
                                            type: 'click',
                                            method: handleAcceptRevision
                                        },
                                        event2: {
                                            type: 'mouseenter',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#218838'
                                                e.target.style.transform = 'translateY(-2px)'
                                                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)'
                                            }
                                        },
                                        event3: {
                                            type: 'mouseleave',
                                            method: (e) => {
                                                e.target.style.backgroundColor = '#28a745'
                                                e.target.style.transform = 'translateY(0)'
                                                e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)'
                                            }
                                        }
                                    })
                                ] : [
                                    // Show current status if not in submitted state
                                    $({
                                        tag: 'div',
                                        text: `Status: ${item.revision_status_display || 'Pending'}`,
                                        style: {
                                            padding: '10px 24px',
                                            color: item.revision_status === 'revision_accepted' ? '#2e7d32' : 
                                                item.revision_status === 'revision_rejected' ? '#c62828' : '#e65100',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '1px solid #e9ecef'
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

    const updateLoadedCount = () => {
        if (window.updateFilterCount) {
            window.updateFilterCount()
        }
    }

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

    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
            currentEditItem = null
            facultyPositions = []
        }
    }

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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Segoe UI, sans-serif',
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        width: '900px',
                        maxWidth: '95%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e9ecef'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 28px',
                                borderBottom: '1px solid #e9ecef',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#ffffff',
                                zIndex: '1',
                                borderRadius: '16px 16px 0 0'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: 'Edit Academic Positions',
                                    style: {
                                        margin: '0',
                                        fontSize: '20px',
                                        fontWeight: '600',
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
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.backgroundColor = '#f8f9fa'
                                            e.target.style.color = '#212529'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#6c757d'
                                        }
                                    }
                                })
                            ]
                        }),

                        // Research info
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 28px',
                                backgroundColor: '#f8f9fa',
                                borderBottom: '1px solid #e9ecef'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        marginBottom: '6px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    },
                                    text: 'Research Title'
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '16px',
                                        color: '#212529',
                                        fontWeight: '500',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.5'
                                    },
                                    text: currentEditItem?.title || ''
                                })
                            ]
                        }),

                        // Faculty rows
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 28px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '250px 180px 180px 100px',
                                        gap: '12px',
                                        padding: '12px 0',
                                        borderBottom: '2px solid #e9ecef',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        color: '#6c757d',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
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
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    })

                                    // Hover effect for row
                                    rowDiv.addEventListener('mouseenter', () => {
                                        rowDiv.style.backgroundColor = '#f8f9fa'
                                        rowDiv.style.padding = '8px 12px'
                                        rowDiv.style.marginLeft = '-12px'
                                        rowDiv.style.marginRight = '-12px'
                                    })
                                    rowDiv.addEventListener('mouseleave', () => {
                                        rowDiv.style.backgroundColor = 'transparent'
                                        rowDiv.style.padding = '8px 0'
                                        rowDiv.style.marginLeft = '0'
                                        rowDiv.style.marginRight = '0'
                                    })

                                    // Create and append children
                                    const nameDiv = document.createElement('div')
                                    nameDiv.style.cssText = 'color: #212529; font-size: 14px; word-break: break-word; font-weight: 500;'
                                    nameDiv.textContent = faculty.faculty_name

                                    const academicInput = document.createElement('input')
                                    academicInput.type = 'text'
                                    academicInput.className = 'academic-rank-input'
                                    academicInput.placeholder = 'e.g., Professor 1'
                                    academicInput.value = faculty.academic_rank || ''
                                    Object.assign(academicInput.style, {
                                        padding: '8px 12px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    academicInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = '#0d6efd'
                                        e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                        e.target.style.backgroundColor = '#ffffff'
                                    })
                                    academicInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#dee2e6'
                                        e.target.style.boxShadow = 'none'
                                        e.target.style.backgroundColor = '#ffffff'
                                    })

                                    const nonAcademicInput = document.createElement('input')
                                    nonAcademicInput.type = 'text'
                                    nonAcademicInput.className = 'non-academic-rank-input'
                                    nonAcademicInput.placeholder = 'e.g., Admin Staff'
                                    nonAcademicInput.value = faculty.non_academic_rank || ''
                                    Object.assign(nonAcademicInput.style, {
                                        padding: '8px 12px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    nonAcademicInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = '#0d6efd'
                                        e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                        e.target.style.backgroundColor = '#ffffff'
                                    })
                                    nonAcademicInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#dee2e6'
                                        e.target.style.boxShadow = 'none'
                                        e.target.style.backgroundColor = '#ffffff'
                                    })

                                    const jobOrderInput = document.createElement('input')
                                    jobOrderInput.type = 'text'
                                    jobOrderInput.className = 'job-order-input'
                                    jobOrderInput.placeholder = 'e.g., JO-001'
                                    jobOrderInput.value = faculty.job_order || ''
                                    Object.assign(jobOrderInput.style, {
                                        padding: '8px 12px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        width: '100%'
                                    })
                                    jobOrderInput.addEventListener('focus', (e) => {
                                        e.target.style.borderColor = '#0d6efd'
                                        e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                        e.target.style.backgroundColor = '#ffffff'
                                    })
                                    jobOrderInput.addEventListener('blur', (e) => {
                                        e.target.style.borderColor = '#dee2e6'
                                        e.target.style.boxShadow = 'none'
                                        e.target.style.backgroundColor = '#ffffff'
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
                                padding: '20px 28px',
                                borderTop: '1px solid #e9ecef',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                position: 'sticky',
                                bottom: '0',
                                backgroundColor: '#ffffff',
                                borderRadius: '0 0 16px 16px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        padding: '10px 24px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '8px',
                                        color: '#6c757d',
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
                                            e.target.style.backgroundColor = '#f8f9fa'
                                            e.target.style.borderColor = '#0d6efd'
                                            e.target.style.color = '#212529'
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.borderColor = '#dee2e6'
                                            e.target.style.color = '#6c757d'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    text: 'Save Changes',
                                    style: {
                                        padding: '10px 28px',
                                        backgroundColor: '#0d6efd',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
                                    },
                                    event: {
                                        type: 'click',
                                        method: saveChanges
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
                    ]
                })
            ]
        })

        document.body.appendChild(modalElement)
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

    const createDataRow = (item) => {
        const cells = columns.map(col => {
            let cellContent = item[col.field] || '—'
            let cellStyle = {
                padding: '14px 8px',
                fontSize: '13px',
                color: '#2d3436', 
                borderBottom: '1px solid #f1f3f5',  
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
            att: { className: 'data-row' },
            style: {
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease'
            },
            child: cells
        })
    }

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
        let bgColor = type === 'inhouse' ? '#fff8e1' : '#e8f5e9'

        // Determine status color based on revision status
        const revisionStatus = item.revision_status || 'revision_pending'
        if (revisionStatus === 'revision_accepted') {
            color = '#2e7d32'
            bgColor = '#e8f5e9'
        } else if (revisionStatus === 'revision_rejected') {
            color = '#c62828'
            bgColor = '#ffebee'
        } else if (revisionStatus === 'revision_submitted') {
            color = '#0d47a1'
            bgColor = '#e3f2fd'
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
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flex: '1',
                    minWidth: '160px',
                    border: '1px solid #ececec',
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
                                    color: '#272727',
                                    lineHeight: '1.2'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '12px',
                                    color: '#636e72',
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
                        color: '#444444'
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
        scrollContainer.addEventListener('scroll', handleScroll)
        fetchProposedResearch()
    }

    const FilterBar = () => {
        let countSpan

        const updateCount = () => {
            if (countSpan) {
                countSpan.textContent = `Showing ${filteredData.length} of ${totalCount} records`
            }
        }
        const confirmModal = InhouseConfirmationModal();
        window.updateFilterCount = updateCount

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
                                        color: '#1e1e1e',
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
                                backgroundColor: '#f1f3f5',
                                padding: '4px',
                                borderRadius: '8px'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    text: 'All',
                                    style: {
                                        backgroundColor: '#0d6efd',
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
                                        color: '#495057',
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
                                        color: '#495057',
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
                                color: '#495057',
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
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #dee2e6',   
                                        borderRadius: '20px',
                                        padding: '10px 16px 10px 40px',
                                        color: '#2d3436',   
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
                                backgroundColor: '#ffffff',  // Change from '#333'
                                border: '1px solid #dee2e6',  // Change from '#444'
                                borderRadius: '20px',
                                padding: '10px 32px 10px 16px',
                                color: '#2d3436',  // Change from '#fff'
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23495057\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 10px center',
                                backgroundSize: '16px',
                                minWidth: '180px'
                            },
                            child: [
                                $({ tag: 'option', att: { value: '' }, text: 'All Status' }),
                                $({ tag: 'option', att: { value: 'revision_pending' }, text: 'Pending Paper Revision' }),
                                $({ tag: 'option', att: { value: 'revision_submitted' }, text: 'Revision Paper Submitted' }),
                                $({ tag: 'option', att: { value: 'revision_accepted' }, text: 'Accepted Paper Revision' }),
                                $({ tag: 'option', att: { value: 'revision_rejected' }, text: 'Paper Revision Rejected' })
                            ],
                            event: {
                                type: 'change',
                                method: (e) => {
                                    filterByStatus(e.target.value)
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 20px',
                                backgroundColor: '#0d6efd',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-check-circle' },
                                    style: {
                                        fontSize: '14px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Confirm Presentations'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    confirmModal.openModal();
                                }
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#0b5ed7';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#0d6efd';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

    const StatsCards = () => {
        return $({
            tag: 'div',
            att: { className: 'stats-cards-container' },
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flex: '1',
                minWidth: '160px',
                border: '1px solid #e9ecef', 
                transition: 'transform 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }
        })
    }

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
                    color: '#495057',  
                    backgroundColor: '#f8f9fa', 
                    borderBottom: col.field.includes('inhouse') || col.field.includes('symposium') ? '2px solid #e9ecef' : '2px solid #dee2e6',
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

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 220px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
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
            backgroundColor: '#f8f9fa',
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
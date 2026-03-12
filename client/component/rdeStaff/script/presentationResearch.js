import { $, Waiting } from "../../../lib/lib.js"

export const PresentationResearch = () => {
    let mainTableContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let researchData = []
    let filteredData = []
    let researchOptions = []
    let selectedResearch = null
    let currentFilter = 'All' // Track current active filter
    
    // Pagination state
    let loadedCount = 0 
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let cursorStack = [] 
    let currentDirection = 'next'
    let isLoadingMore = false
    let isLoadingPrev = false
    
    // Stats state
    let currentStats = {
        total: 0,
        university: 0,
        international: 0,
        national: 0,
        regional: 0
    }
    
    // Columns for presentation research
    const columns = [
        { field: 'date_completed', header: 'Date of Completion (MMM-DD-YYYY)', width: '150px' },
        { field: 'title', header: 'Title of Research', width: '300px' },
        { field: 'forum_title', header: 'Title of Forum', width: '250px' },
        { field: 'venue', header: 'Venue', width: '200px' },
        { field: 'university', header: 'University', width: '120px' },
        { field: 'international', header: 'International', width: '120px' },
        { field: 'national', header: 'National', width: '120px' },
        { field: 'regional', header: 'Regional', width: '120px' },
        { field: 'presentation_date', header: 'Date of Presentation', width: '150px' },
        { field: 'presentor', header: 'Presentor', width: '250px' },
        { field: 'campus', header: 'Campus/Center', width: '120px' },
        { field: 'category', header: 'Category', width: '120px' },
        { field: 'actions', header: 'ACTIONS', width: '100px' }
    ]

    // Forum type options
    const forumTypes = [
        'International',
        'National',
        'Regional'
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

    // Fetch research papers for dropdown
    const fetchResearchPapers = async () => {
        try {
            const formData = new FormData()
            formData.append('action', 'get_research_papers')
            
            const response = await fetch('/presentedresearch', {
                method: 'POST',
                body: formData
            })
            
            const result = await response.json()
            
            if (result.status) {
                researchOptions = result.data || []
            }
        } catch (error) {
            console.error('Error fetching research papers:', error)
        }
    }

    // Fetch presentation data with cursor pagination
    const fetchPresentations = async (cursor = null, direction = 'next') => {
        if (isLoading) return
        
        isLoading = true
        
        if (!cursor) {
            showLoading()
            // Reset on first load
            cursorStack = []
        }
        
        try {
            const formData = new FormData()
            formData.append('action', 'fetch')
            if (cursor) {
                formData.append('cursor', cursor)
                formData.append('direction', direction)
            }
            
            const response = await fetch('/presentedresearch', {
                method: 'POST',
                body: formData
            })
            
            const result = await response.json()
            
            if (result.status) {
                const newData = result.data || []
                
                if (!cursor) {
                    // First page - replace data
                    researchData = newData
                    filteredData = [...researchData]
                    
                    // Update stats
                    if (result.stats) {
                        currentStats = result.stats
                        totalCount = result.stats.total || 0
                        updateStats()
                    }
                } else {
                    if (direction === 'next') {
                        // Append to bottom
                        researchData = [...researchData, ...newData]
                    } else {
                        // Prepend to top
                        researchData = [...newData, ...researchData]
                    }
                    
                    // Reapply current filter after adding new data
                    applyFilter(currentFilter)
                }
                
                // Update pagination info
                if (result.pagination) {
                    nextCursor = result.pagination.next_cursor
                    hasMore = result.pagination.has_more
                }
                
                updateTableWithData()
                updateRecordCount()
                
                // Maintain scroll position when loading previous
                if (direction === 'prev' && cursor) {
                    setTimeout(() => {
                        const firstRow = tableBody?.firstChild
                        if (firstRow) {
                            firstRow.scrollIntoView({ behavior: 'auto', block: 'start' })
                        }
                    }, 100)
                }
            } else {
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching presentations:', error)
            if (!cursor) {
                showEmptyState()
            }
        } finally {
            isLoading = false
            isLoadingMore = false
            isLoadingPrev = false
            hideLoading()
        }
    }

    // Apply filter based on selected type
    const applyFilter = (filterType) => {
        currentFilter = filterType
        
        if (filterType === 'All') {
            filteredData = [...researchData]
        } else {
            const filterField = filterType.toLowerCase()
            filteredData = researchData.filter(item => {
                // Check if the item has a checkmark (✓) for this filter type
                return item[filterField] === '✓' || item[filterField] === 1 || item[filterField] === '1'
            })
        }
        
        updateFilterButtons(filterType)
        updateTableWithData()
        updateRecordCount()
    }

    // Handle scroll for infinite loading (both directions)
    const handleScroll = () => {
        if (!scrollContainer || isLoading) return
        
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        
        // Load more when scrolling down (near bottom)
        if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
            isLoadingMore = true
            currentDirection = 'next'
            if (nextCursor) {
                cursorStack.push(nextCursor)
                fetchPresentations(nextCursor, 'next')
            }
        }
        
        // Load previous when scrolling up (near top)
        if (scrollTop < 200 && cursorStack.length > 0 && !isLoadingPrev) {
            isLoadingPrev = true
            currentDirection = 'prev'
            const prevCursor = cursorStack.pop()
            fetchPresentations(prevCursor, 'prev')
        }
    }

    // Update statistics
    const updateStats = () => {
        const statValues = document.querySelectorAll('.stat-value')
        if (statValues.length >= 5) {
            statValues[0].textContent = currentStats.total || 0
            statValues[1].textContent = currentStats.university || 0
            statValues[2].textContent = currentStats.international || 0
            statValues[3].textContent = currentStats.national || 0
            statValues[4].textContent = currentStats.regional || 0
        }
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
        
        filteredData.forEach(item => {
            tableBody.appendChild(createDataRow(item))
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
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        marginBottom: '24px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-chalkboard-user' },
                            style: { 
                                fontSize: '80px', 
                                color: 'deepskyblue',
                                opacity: 0.3,
                                position: 'absolute',
                                left: '0',
                                top: '0'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-earth-asia' },
                            style: { 
                                fontSize: '50px', 
                                color: '#4caf50',
                                opacity: 0.4,
                                position: 'absolute',
                                right: '-10px',
                                bottom: '-10px'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-location-dot' },
                            style: { 
                                fontSize: '40px', 
                                color: '#ff9800',
                                opacity: 0.4,
                                position: 'absolute',
                                left: '-15px',
                                bottom: '0'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'No Presented Research Found',
                    style: { 
                        fontSize: '24px', 
                        marginBottom: '12px',
                        fontWeight: '600',
                        color: '#fff',
                        letterSpacing: '0.5px'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click the Actions to edit presentation of research',
                    style: { 
                        fontSize: '14px', 
                        opacity: 0.7,
                        marginBottom: '30px',
                        textAlign: 'center'
                    }
                })
            ]
        })
        
        tableBody.appendChild(emptyState)
    }

    // Create data row
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
                fontFamily: 'Segoe UI, sans-serif',
                lineHeight: '1.4',
                verticalAlign: 'top'
            }

            // Special styling for forum type columns
            if (['university', 'international', 'national', 'regional'].includes(col.field)) {
                if (cellContent === '✓') {
                    cellStyle.backgroundColor = 'rgba(0, 191, 255, 0.1)'
                    cellStyle.color = 'deepskyblue'
                    cellStyle.fontWeight = '500'
                    cellStyle.textAlign = 'center'
                } else {
                    cellStyle.textAlign = 'center'
                }
            }

            if (col.field === 'actions') {
                return $({
                    tag: 'td',
                    style: { ...cellStyle, textAlign: 'center' },
                    child: [createActionButtons(item)]
                })
            }

            if (col.field === 'date_completed' || col.field === 'presentation_date') {
                cellContent = formatDate(item[col.field])
            }

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
                    att: { className: 'fa-solid fa-eye' },
                    style: {
                        color: 'deepskyblue',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    },
                    title: 'View details',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            viewPresentation(item)
                        }
                    }
                }),
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
                            editPresentation(item)
                        }
                    }
                })
            ]
        })
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === '—') return '—'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
        }).replace(/,/g, '')
    }

    // View presentation
    const viewPresentation = (item) => {
        selectedResearch = item
        renderModal('view')
    }

    // Edit presentation
    const editPresentation = (item) => {
        selectedResearch = item
        renderModal('edit')
    }

    // Handle research selection
    const handleResearchSelect = (researchId) => {
        const research = researchOptions.find(r => r.id == researchId)
        if (research) {
            selectedResearch = research
            
            // Update campus and category fields
            const campusInput = document.querySelector('input[name="campus"]')
            const categoryInput = document.querySelector('input[name="category"]')
            const presentorSelect = document.querySelector('select[name="presentor"]')
            
            if (campusInput) campusInput.value = research.campus || ''
            if (categoryInput) categoryInput.value = research.category || ''
            
            // Update presentor dropdown
            if (presentorSelect) {
                presentorSelect.innerHTML = '<option value="">Select Presentor</option>'
                
                // Add all researchers as options
                if (research.all_researchers && Array.isArray(research.all_researchers)) {
                    research.all_researchers.forEach(name => {
                        if (name && name !== 'NULL') {
                            const option = document.createElement('option')
                            option.value = name
                            option.textContent = name
                            presentorSelect.appendChild(option)
                        }
                    })
                }
            }
        }
    }

    // Close modal
    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
        }
    }

    // Render modal
    const renderModal = (mode) => {
        if (modalElement) {
            modalElement.remove()
        }
        
        const isViewMode = mode === 'view'
        const isEditMode = mode === 'edit'
        const isAddMode = mode === 'add'
        
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
                                    text: isViewMode ? 'View Presentation' : (isEditMode ? 'Edit Presentation' : 'Add New Presentation'),
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
                                    }
                                })
                            ]
                        }),
                        // Modal body - Form
                        $({
                            tag: 'form',
                            att: { id: 'presentation-form' },
                            style: {
                                padding: '24px'
                            },
                            child: [
                                // Title of Research with search (for add mode)
                                ...(isAddMode ? [
                                    $({
                                        tag: 'div',
                                        style: { marginBottom: '20px' },
                                        child: [
                                            $({
                                                tag: 'label',
                                                text: 'Title of Research *',
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
                                                    position: 'relative'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'input',
                                                        att: {
                                                            type: 'text',
                                                            id: 'research-search',
                                                            placeholder: 'Type to search research papers...',
                                                            autocomplete: 'off',
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
                                                        },
                                                        event: {
                                                            type: 'input',
                                                            method: (e) => {
                                                                const searchTerm = e.target.value.toLowerCase()
                                                                const suggestionsContainer = document.getElementById('research-suggestions')
                                                                
                                                                if (searchTerm.length < 2) {
                                                                    suggestionsContainer.style.display = 'none'
                                                                    return
                                                                }
                                                                
                                                                const filtered = researchOptions.filter(r => 
                                                                    r.title?.toLowerCase().includes(searchTerm) ||
                                                                    r.author?.toLowerCase().includes(searchTerm)
                                                                ).slice(0, 10)
                                                                
                                                                if (filtered.length === 0) {
                                                                    suggestionsContainer.innerHTML = '<div style="padding: 10px; color: #888;">No results found</div>'
                                                                    suggestionsContainer.style.display = 'block'
                                                                    return
                                                                }
                                                                
                                                                suggestionsContainer.innerHTML = ''
                                                                filtered.forEach(r => {
                                                                    const item = document.createElement('div')
                                                                    item.style.cssText = `
                                                                        padding: 12px 15px;
                                                                        cursor: pointer;
                                                                        border-bottom: 1px solid #444;
                                                                        transition: all 0.2s ease;
                                                                        color: #fff;
                                                                    `
                                                                    item.innerHTML = `
                                                                        <div style="font-weight: 500; margin-bottom: 4px;">${escapeHtml(r.title)}</div>
                                                                        <div style="font-size: 12px; color: #aaa;">Author: ${escapeHtml(r.author || 'N/A')} | Campus: ${escapeHtml(r.campus || 'N/A')}</div>
                                                                    `
                                                                    item.addEventListener('mouseenter', () => {
                                                                        item.style.backgroundColor = '#3a3a3a'
                                                                    })
                                                                    item.addEventListener('mouseleave', () => {
                                                                        item.style.backgroundColor = 'transparent'
                                                                    })
                                                                    item.addEventListener('click', () => {
                                                                        document.getElementById('research-search').value = r.title
                                                                        suggestionsContainer.style.display = 'none'
                                                                        handleResearchSelect(r.id)
                                                                    })
                                                                    suggestionsContainer.appendChild(item)
                                                                })
                                                                suggestionsContainer.style.display = 'block'
                                                            }
                                                        },
                                                        event2: {
                                                            type: 'blur',
                                                            method: (e) => {
                                                                setTimeout(() => {
                                                                    document.getElementById('research-suggestions').style.display = 'none'
                                                                }, 200)
                                                            }
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'div',
                                                        att: { id: 'research-suggestions' },
                                                        style: {
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: '0',
                                                            right: '0',
                                                            maxHeight: '300px',
                                                            overflowY: 'auto',
                                                            backgroundColor: '#2d2d2d',
                                                            border: '1px solid #444',
                                                            borderRadius: '6px',
                                                            marginTop: '4px',
                                                            display: 'none',
                                                            zIndex: '1000',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ] : [
                                    // Hidden research_id for edit/view
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'hidden',
                                            name: 'research_id',
                                            value: selectedResearch?.research_id || selectedResearch?.id || ''
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'hidden',
                                            name: 'id',
                                            value: selectedResearch?.id || ''
                                        }
                                    }),
                                    // Title of Research (read-only for edit/view)
                                    $({
                                        tag: 'div',
                                        style: { marginBottom: '20px' },
                                        child: [
                                            $({
                                                tag: 'label',
                                                text: 'Title of Research',
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
                                                    value: selectedResearch?.title || '',
                                                    readonly: true
                                                },
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: '#2a2a2a',
                                                    border: '1px solid #444',
                                                    borderRadius: '6px',
                                                    color: '#aaa',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }
                                            })
                                        ]
                                    })
                                ]),
                                
                                // Presentor Selection
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Presentor *',
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
                                                name: 'presentor',
                                                required: true,
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: isViewMode ? 'default' : 'pointer'
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Presentor --' })
                                            ]
                                        })
                                    ]
                                }),
                                
                                // Date Completed
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Date of Completion *',
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
                                                name: 'date_completed',
                                                required: true,
                                                value: selectedResearch?.date_completed || '',
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        })
                                    ]
                                }),
                                
                                // Forum Title - Input field with existing value as placeholder
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Title of Forum *',
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
                                                name: 'forum_title',
                                                placeholder: selectedResearch?.forum_title || 'Enter forum title',
                                                required: true,
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        }),
                                        // Show existing value as hint
                                        ...(!isViewMode && selectedResearch?.forum_title ? [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    marginTop: '4px',
                                                    fontSize: '11px',
                                                    color: '#888',
                                                    fontStyle: 'italic'
                                                },
                                                text: `Previous: ${selectedResearch.forum_title}`
                                            })
                                        ] : [])
                                    ]
                                }),
                                
                                // Venue - Input field with existing value as placeholder
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
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
                                                placeholder: selectedResearch?.venue || 'Enter venue',
                                                required: true,
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        }),
                                        // Show existing value as hint
                                        ...(!isViewMode && selectedResearch?.venue && selectedResearch.venue !== '—' ? [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    marginTop: '4px',
                                                    fontSize: '11px',
                                                    color: '#888',
                                                    fontStyle: 'italic'
                                                },
                                                text: `Previous: ${selectedResearch.venue}`
                                            })
                                        ] : [])
                                    ]
                                }),
                                
                                // Forum Type Selection
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Forum Type *',
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
                                                name: 'forum_type',
                                                required: true,
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Forum Type --' }),
                                                ...forumTypes.map(type => 
                                                    $({ 
                                                        tag: 'option', 
                                                        att: { 
                                                            value: type,
                                                            selected: selectedResearch?.forum_type === type
                                                        },
                                                        text: type 
                                                    })
                                                )
                                            ]
                                        })
                                    ]
                                }),
                                
                                // Presentation Date
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Date of Presentation *',
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
                                                name: 'presentation_date',
                                                required: true,
                                                value: selectedResearch?.presentation_date || '',
                                                disabled: isViewMode
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: isViewMode ? '#2a2a2a' : '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        })
                                    ]
                                }),
                                
                                // Campus (auto-filled)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Campus/Center',
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
                                                name: 'campus',
                                                value: selectedResearch?.campus || '',
                                                readonly: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#2a2a2a',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#aaa',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
                                        })
                                    ]
                                }),
                                
                                // Category (auto-filled)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Category',
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
                                                name: 'category',
                                                value: selectedResearch?.category || '',
                                                readonly: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#2a2a2a',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#aaa',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }
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
                                                cursor: 'pointer'
                                            },
                                            event: {
                                                type: 'click',
                                                method: closeModal
                                            }
                                        }),
                                        ...(!isViewMode ? [
                                            $({
                                                tag: 'button',
                                                att: { type: 'button' },
                                                text: isEditMode ? 'Update' : 'Save',
                                                style: {
                                                    padding: '10px 24px',
                                                    backgroundColor: 'deepskyblue',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    cursor: 'pointer'
                                                },
                                                event: {
                                                    type: 'click',
                                                    method: savePresentation
                                                }
                                            })
                                        ] : [])
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
        
        document.body.appendChild(modalElement)
        
        // If in add mode, fetch research papers
        if (isAddMode) {
            fetchResearchPapers()
        }
        
        // If in edit/view mode, populate form
        if (selectedResearch && (isEditMode || isViewMode)) {
            // Populate presentor dropdown
            const presentorSelect = document.querySelector('select[name="presentor"]')
            if (presentorSelect && selectedResearch.all_researchers) {
                presentorSelect.innerHTML = '<option value="">-- Select Presentor --</option>'
                selectedResearch.all_researchers.forEach(name => {
                    const option = document.createElement('option')
                    option.value = name
                    option.textContent = name
                    if (name === selectedResearch.presentor) {
                        option.selected = true
                    }
                    presentorSelect.appendChild(option)
                })
            }
        }
    }

    // Save presentation - NOTE: This is disabled since we're not using presentation_research table
    const savePresentation = async () => {
        alert('Presentations are managed through the endorsement system. Please use the endorsement module to update presentation details.')
        closeModal()
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
        fetchPresentations()
    }

    // Update filter button styles with hover effects
    const updateFilterButtons = (active) => {
        const filterButtons = document.querySelectorAll('.filter-btn')
        
        filterButtons.forEach(button => {
            const buttonText = button.textContent.trim()
            
            if (buttonText === active) {
                button.style.backgroundColor = 'deepskyblue'
                button.style.color = '#fff'
                button.style.opacity = '1'
            } else {
                button.style.backgroundColor = 'transparent'
                button.style.color = '#aaa'
                button.style.opacity = '0.8'
            }
            
            // Add hover effect
            button.addEventListener('mouseenter', () => {
                if (buttonText !== active) {
                    button.style.backgroundColor = '#3a3a3a'
                    button.style.color = '#fff'
                }
            })
            
            button.addEventListener('mouseleave', () => {
                if (buttonText !== active) {
                    button.style.backgroundColor = 'transparent'
                    button.style.color = '#aaa'
                }
            })
        })
    }

    // Filter and search bar
    const FilterBar = () => {
        return $({
            tag: 'div',
            att: { className: 'filter-bar' },
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
                                    att: { className: 'fa-solid fa-person-chalkboard' },
                                    style: { color: 'deepskyblue', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Presented Research',
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
                        $({
                            tag: 'div',
                            att: { className: 'filter-buttons-container' },
                            style: {
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #444'
                            },
                            child: [
                                // All button
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'All',
                                    style: {
                                        backgroundColor: 'deepskyblue', // Active by default
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '1'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => applyFilter('All')
                                    }
                                }),
                                // University button
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'University',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '0.8'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => applyFilter('University')
                                    }
                                }),
                                // International button
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'International',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '0.8'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => applyFilter('International')
                                    }
                                }),
                                // National button
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'National',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '0.8'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => applyFilter('National')
                                    }
                                }),
                                // Regional button
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'Regional',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#aaa',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '0.8'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => applyFilter('Regional')
                                    }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
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
                                        left: '14px',
                                        color: '#666',
                                        fontSize: '14px',
                                        zIndex: '1'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search presentations...',
                                        className: 'presentation-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '260px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            const term = e.target.value.toLowerCase()
                                            filteredData = researchData.filter(item => 
                                                item.title?.toLowerCase().includes(term) ||
                                                item.forum_title?.toLowerCase().includes(term) ||
                                                item.presentor?.toLowerCase().includes(term) ||
                                                item.venue?.toLowerCase().includes(term)
                                            )
                                            updateTableWithData()
                                            updateRecordCount()
                                        }
                                    }
                                })
                            ]
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
                // Total Presentations
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
                                backgroundColor: 'rgba(0, 191, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(0, 191, 255, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chalkboard-user' },
                                    style: { color: 'deepskyblue', fontSize: '26px' }
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
                                    text: 'Total',
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
                // University
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
                                    att: { className: 'fa-solid fa-building-columns' },
                                    style: { color: '#ff9800', fontSize: '26px' }
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
                                    text: 'University',
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
                // International
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
                                    att: { className: 'fa-solid fa-earth-asia' },
                                    style: { color: '#4caf50', fontSize: '26px' }
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
                                    text: 'International',
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
                // National
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
                                backgroundColor: 'rgba(233, 30, 99, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(233, 30, 99, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-flag' },
                                    style: { color: '#e91e63', fontSize: '26px' }
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
                                    text: 'National',
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
                // Regional
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
                                    att: { className: 'fa-solid fa-location-dot' },
                                    style: { color: '#9c27b0', fontSize: '26px' }
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
                                    text: 'Regional',
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

    // Table header component
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '16px 10px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#aaa',
                    backgroundColor: '#2d2d2d',
                    borderBottom: '2px solid #444',
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
                            gap: '8px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
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
                height: 'calc(100% - 300px)',
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
        att: { className: 'presentation-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/presentationResearch.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return ''
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}
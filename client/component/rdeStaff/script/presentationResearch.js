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
    let currentFilter = 'All'
    
    // Pagination state - FIXED
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false
    
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
        { field: 'university', header: 'University/Local', width: '140px' },
        { field: 'regional', header: 'Regional', width: '120px' },
        { field: 'national', header: 'National', width: '120px' },
        { field: 'international', header: 'International', width: '120px' },
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

    // Fetch presentation data with cursor pagination - FIXED
    const fetchPresentations = async (cursor = null, direction = 'next') => {
        if (isLoading) return
        
        isLoading = true
        
        if (!cursor) {
            showLoading()
            // Reset on first load
            researchData = []
            filteredData = []
            hasMore = true
            nextCursor = null
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
                }
                
                // Update pagination info
                if (result.pagination) {
                    nextCursor = result.pagination.next_cursor
                    hasMore = result.pagination.has_more
                }
                
                // Apply current filter
                applyFilter(currentFilter, false) // Don't re-fetch, just filter existing data
                
                // Maintain scroll position when loading previous
                if (direction === 'prev' && cursor && tableBody?.firstChild) {
                    setTimeout(() => {
                        tableBody.firstChild.scrollIntoView({ behavior: 'auto', block: 'start' })
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
            hideLoading()
            initialLoadDone = true
        }
    }

    // Apply filter based on selected type - FIXED
    const applyFilter = (filterType, shouldFetch = true) => {
        currentFilter = filterType
        
        if (filterType === 'All') {
            filteredData = [...researchData]
        } else {
            const filterField = filterType.toLowerCase()
            
            filteredData = researchData.filter(item => {
                // Check if the item has a checkmark for this filter type
                if (filterField === 'university') {
                    return item.university === '✓' || item.level === 'university'
                } else if (filterField === 'international') {
                    return item.international === '✓' || item.level === 'international'
                } else if (filterField === 'national') {
                    return item.national === '✓' || item.level === 'national'
                } else if (filterField === 'regional') {
                    return item.regional === '✓' || item.level === 'regional'
                }
                return false
            })
        }
        
        updateFilterButtons(filterType)
        updateTableWithData()
        updateRecordCount()
    }

    // Handle scroll for infinite loading - FIXED
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return
        
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        
        // Load more when scrolling down (near bottom) - with 300px threshold
        if (scrollHeight - scrollTop - clientHeight < 300 && hasMore && !isLoading) {
            if (nextCursor) {
                fetchPresentations(nextCursor, 'next')
            }
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
            
            // Special handling for forum_title column
            if (col.field === 'forum_title') {
                let forumTitles = []
                
                if (Array.isArray(item.forum_title)) {
                    forumTitles = item.forum_title.filter(title => title && title !== '—' && title !== 'NULL')
                } else if (item.forum_title && item.forum_title !== '—' && item.forum_title !== 'NULL') {
                    forumTitles = [item.forum_title]
                }
                
                if (forumTitles.length === 0) {
                    return $({
                        tag: 'td',
                        style: cellStyle,
                        text: '—'
                    })
                } else {
                    const bulletListHtml = '<ul style="margin:0; padding-left:20px; list-style-type:disc; color:#ddd;">' + 
                        forumTitles.map(title => `<li style="margin-bottom:4px; font-size:12px;">${escapeHtml(title)}</li>`).join('') + 
                        '</ul>'
                    
                    return $({
                        tag: 'td',
                        style: { ...cellStyle, verticalAlign: 'top' },
                        html: bulletListHtml
                    })
                }
            }
            
            // Special styling for forum type columns
            if (['university', 'international', 'national', 'regional'].includes(col.field)) {
                if (col.field === 'university') {
                    if (item.university === '✓' || item.level === 'university') {
                        cellContent = '✓'
                        cellStyle.backgroundColor = 'rgba(0, 191, 255, 0.1)'
                        cellStyle.color = 'deepskyblue'
                        cellStyle.fontWeight = '500'
                        cellStyle.textAlign = 'center'
                    } else {
                        cellContent = '—'
                        cellStyle.textAlign = 'center'
                    }
                } else if (col.field === 'international') {
                    if (item.international === '✓' || item.level === 'international') {
                        cellContent = '✓'
                        cellStyle.backgroundColor = 'rgba(76, 175, 80, 0.1)'
                        cellStyle.color = '#4caf50'
                        cellStyle.fontWeight = '500'
                        cellStyle.textAlign = 'center'
                    } else {
                        cellContent = '—'
                        cellStyle.textAlign = 'center'
                    }
                } else if (col.field === 'national') {
                    if (item.national === '✓' || item.level === 'national') {
                        cellContent = '✓'
                        cellStyle.backgroundColor = 'rgba(233, 30, 99, 0.1)'
                        cellStyle.color = '#e91e63'
                        cellStyle.fontWeight = '500'
                        cellStyle.textAlign = 'center'
                    } else {
                        cellContent = '—'
                        cellStyle.textAlign = 'center'
                    }
                } else if (col.field === 'regional') {
                    if (item.regional === '✓' || item.level === 'regional') {
                        cellContent = '✓'
                        cellStyle.backgroundColor = 'rgba(156, 39, 176, 0.1)'
                        cellStyle.color = '#9c27b0'
                        cellStyle.fontWeight = '500'
                        cellStyle.textAlign = 'center'
                    } else {
                        cellContent = '—'
                        cellStyle.textAlign = 'center'
                    }
                }
                
                return $({
                    tag: 'td',
                    style: cellStyle,
                    text: cellContent
                })
            }

            if (col.field === 'actions') {
                return $({
                    tag: 'td',
                    style: { ...cellStyle, textAlign: 'center' },
                    child: [createActionButtons(item)]
                })
            }
            
            // Special handling for date_completed
            if (col.field === 'date_completed') {
                let completionDates = []
                
                if (Array.isArray(item.date_completed)) {
                    completionDates = item.date_completed
                        .filter(date => date && date !== '—')
                        .map(date => formatDate(date))
                } else if (item.date_completed && item.date_completed !== '—') {
                    completionDates = [formatDate(item.date_completed)]
                }
                
                if (completionDates.length === 0) {
                    return $({
                        tag: 'td',
                        style: cellStyle,
                        text: '—'
                    })
                } else if (completionDates.length === 1) {
                    return $({
                        tag: 'td',
                        style: cellStyle,
                        text: completionDates[0]
                    })
                } else {
                    const bulletList = $({
                        tag: 'ul',
                        style: {
                            margin: '0',
                            padding: '0',
                            paddingLeft: '20px',
                            listStyleType: 'disc',
                            color: '#ddd'
                        },
                        child: completionDates.map(date => 
                            $({
                                tag: 'li',
                                text: date,
                                style: {
                                    marginBottom: '4px',
                                    fontSize: '12px'
                                }
                            })
                        )
                    })
                    
                    return $({
                        tag: 'td',
                        style: { ...cellStyle, verticalAlign: 'top' },
                        child: [bulletList]
                    })
                }
            }

            // Special handling for presentation_date
            if (col.field === 'presentation_date') {
                let presentationDates = []
                
                if (Array.isArray(item.presentation_date)) {
                    presentationDates = item.presentation_date
                        .filter(date => date && date !== '—')
                        .map(date => formatDate(date))
                } else if (item.presentation_date && item.presentation_date !== '—') {
                    presentationDates = [formatDate(item.presentation_date)]
                }
                
                if (presentationDates.length === 0) {
                    return $({
                        tag: 'td',
                        style: cellStyle,
                        text: '—'
                    })
                } else if (presentationDates.length === 1) {
                    return $({
                        tag: 'td',
                        style: cellStyle,
                        text: presentationDates[0]
                    })
                } else {
                    const bulletList = $({
                        tag: 'ul',
                        style: {
                            margin: '0',
                            padding: '0',
                            paddingLeft: '20px',
                            listStyleType: 'disc',
                            color: '#ddd'
                        },
                        child: presentationDates.map(date => 
                            $({
                                tag: 'li',
                                text: date,
                                style: {
                                    marginBottom: '4px',
                                    fontSize: '12px'
                                }
                            })
                        )
                    })
                    
                    return $({
                        tag: 'td',
                        style: { ...cellStyle, verticalAlign: 'top' },
                        child: [bulletList]
                    })
                }
            }
            
            if (col.field === 'presentor') {
                let presentors = []

                if (Array.isArray(item.presentor)) {
                    presentors = item.presentor.map(p => {
                        if (!p || p === 'NULL') {
                            return '—'
                        }
                        return p
                    })
                } else if (item.presentor && item.presentor !== 'NULL') {
                    presentors = [item.presentor]
                } else {
                    presentors = ['—']
                }
                
                presentors = [...new Set(presentors)]
                
                const bulletListHtml = '<ul style="margin:0; padding-left:20px; list-style-type:disc; color:#ddd;">' + 
                    presentors.map(name => {
                        const safeName = escapeHtml(name)
                        return `<li style="margin-bottom:4px; font-size:12px;">${safeName}</li>`
                    }).join('') + 
                    '</ul>'
                
                return $({
                    tag: 'td',
                    style: { ...cellStyle, verticalAlign: 'top' },
                    html: bulletListHtml
                })
            }
            
            // For regular text fields
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
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return '—'
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
            }).replace(/,/g, '')
        } catch (e) {
            return '—'
        }
    }

    // Edit presentation
    const editPresentation = (item) => {
        selectedResearch = item
        renderModal('edit')
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
        
        const isEditMode = mode === 'edit'
        
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
                                    text: 'Edit Presentation',
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
                                // Hidden fields
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
                                        name: 'presentation_id',
                                        value: selectedResearch?.pr_id || selectedResearch?.presentation_id || ''
                                    }
                                }),
                                // Title of Research
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
                                }),
                                
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
                                                name: 'presentor_select',
                                                id: 'presentor-select'
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
                                                cursor: 'pointer',
                                                marginBottom: '10px',
                                                display: 'block'
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Presentor --' }),
                                                ...(selectedResearch?.all_researchers?.map(name => 
                                                    $({ 
                                                        tag: 'option', 
                                                        att: { value: name },
                                                        text: name 
                                                    })
                                                ) || []),
                                                $({ tag: 'option', att: { value: 'others' }, text: '-- Others (Enter manually) --' })
                                            ],
                                            event: {
                                                type: 'change',
                                                method: (e) => {
                                                    const select = e.target
                                                    const customInput = document.getElementById('presentor-custom')
                                                    
                                                    if (select.value === 'others') {
                                                        select.style.display = 'none'
                                                        customInput.style.display = 'block'
                                                        customInput.focus()
                                                        select.value = ''
                                                    }
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'text',
                                                name: 'presentor',
                                                id: 'presentor-custom',
                                                placeholder: 'Enter presentor name'
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
                                                display: 'none'
                                            }
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
                                
                                // Forum Title
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
                                        ...(selectedResearch?.forum_title && selectedResearch.forum_title !== '—' ? [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    marginBottom: '8px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#2a2a2a',
                                                    border: '1px solid #444',
                                                    borderRadius: '6px',
                                                    color: '#888',
                                                    fontSize: '13px',
                                                    fontStyle: 'italic',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: { className: 'fa-solid fa-history' },
                                                        style: { color: '#666', fontSize: '12px' }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: `Previous: ${selectedResearch.forum_title}`
                                                    })
                                                ]
                                            })
                                        ] : []),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'text',
                                                name: 'forum_title',
                                                placeholder: 'Enter new forum title',
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
                                
                                // Venue
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
                                                placeholder: 'Enter venue',
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
                                
                                // Forum Type
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
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Forum Type --' }),
                                                ...forumTypes.map(type => 
                                                    $({ 
                                                        tag: 'option', 
                                                        att: { value: type },
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
                                
                                // Campus
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
                                
                                // Category
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
                                        $({
                                            tag: 'button',
                                            att: { type: 'button' },
                                            text: 'Update',
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
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
        
        document.body.appendChild(modalElement)
        
        // Populate form with selectedResearch data
        if (selectedResearch) {
            const presentorSelect = document.getElementById('presentor-select')
            const customInput = document.getElementById('presentor-custom')
            
            if (presentorSelect) {
                // Clear existing options except the first placeholder
                while (presentorSelect.options.length > 1) {
                    presentorSelect.remove(1)
                }
                
                // Add researchers if available
                if (selectedResearch.all_researchers && Array.isArray(selectedResearch.all_researchers)) {
                    selectedResearch.all_researchers.forEach(name => {
                        if (name && name !== 'NULL' && name !== '—') {
                            const option = document.createElement('option')
                            option.value = name
                            option.textContent = name
                            presentorSelect.appendChild(option)
                        }
                    })
                }
                
                // Add "Others" option
                const othersOption = document.createElement('option')
                othersOption.value = 'others'
                othersOption.textContent = '-- Others (Enter manually) --'
                presentorSelect.appendChild(othersOption)
                
                // Handle presentor selection
                let currentPresentor = ''
                if (Array.isArray(selectedResearch.presentor) && selectedResearch.presentor.length > 0) {
                    currentPresentor = selectedResearch.presentor[0]
                } else if (typeof selectedResearch.presentor === 'string') {
                    currentPresentor = selectedResearch.presentor
                }
                
                if (currentPresentor && currentPresentor !== '—' && currentPresentor !== 'NULL') {
                    const researchers = selectedResearch.all_researchers || []
                    const isInList = researchers.some(name => name === currentPresentor)
                    
                    if (isInList) {
                        presentorSelect.value = currentPresentor
                        presentorSelect.style.display = 'block'
                        customInput.style.display = 'none'
                        customInput.value = ''
                    } else {
                        presentorSelect.style.display = 'none'
                        customInput.style.display = 'block'
                        customInput.value = currentPresentor
                        presentorSelect.value = ''
                    }
                } else {
                    presentorSelect.value = ''
                    presentorSelect.style.display = 'block'
                    customInput.style.display = 'none'
                    customInput.value = ''
                }
            }
            
            // Set date fields
            setTimeout(() => {
                // Date Completed
                let dateCompleted = ''
                if (Array.isArray(selectedResearch.date_completed) && selectedResearch.date_completed.length > 0) {
                    dateCompleted = selectedResearch.date_completed[0]
                } else if (typeof selectedResearch.date_completed === 'string') {
                    dateCompleted = selectedResearch.date_completed
                }
                
                if (dateCompleted && dateCompleted !== '—') {
                    const dateCompletedInput = document.querySelector('input[name="date_completed"]')
                    if (dateCompletedInput) {
                        dateCompletedInput.value = dateCompleted
                    }
                }
                
                // Presentation Date
                let presentationDate = ''
                if (Array.isArray(selectedResearch.presentation_date) && selectedResearch.presentation_date.length > 0) {
                    presentationDate = selectedResearch.presentation_date[0]
                } else if (typeof selectedResearch.presentation_date === 'string') {
                    presentationDate = selectedResearch.presentation_date
                }
                
                if (presentationDate && presentationDate !== '—') {
                    const presentationDateInput = document.querySelector('input[name="presentation_date"]')
                    if (presentationDateInput) {
                        presentationDateInput.value = presentationDate
                    }
                }
                
                // Venue
                let venue = ''
                if (Array.isArray(selectedResearch.venue) && selectedResearch.venue.length > 0) {
                    venue = selectedResearch.venue[0]
                } else if (typeof selectedResearch.venue === 'string') {
                    venue = selectedResearch.venue
                }
                
                if (venue && venue !== '—') {
                    const venueInput = document.querySelector('input[name="venue"]')
                    if (venueInput) {
                        venueInput.value = venue
                    }
                }
                
                // Forum Type
                if (selectedResearch.presentation_type) {
                    const forumTypeSelect = document.querySelector('select[name="forum_type"]')
                    if (forumTypeSelect) {
                        forumTypeSelect.value = selectedResearch.presentation_type
                    }
                }
            }, 100)
        }
    }

    // Save presentation
    const savePresentation = async () => {
        const form = document.getElementById('presentation-form')
        const formData = new FormData(form)
        const researchId = selectedResearch?.research_id || selectedResearch?.id
        const presentationId = selectedResearch?.pr_id || selectedResearch?.presentation_id || null
        
        if (!researchId) {
            alert('Please select a research paper')
            return
        }
        
        // Get presentor value
        const presentorSelect = document.getElementById('presentor-select')
        const customInput = document.getElementById('presentor-custom')
        let presentor = ''
        
        if (presentorSelect.style.display !== 'none' && presentorSelect.value) {
            presentor = presentorSelect.value
        } else if (customInput.style.display !== 'none' && customInput.value) {
            presentor = customInput.value
        }
        
        if (!presentor) {
            alert('Please select or enter a presentor')
            return
        }
        
        // Get other form values
        const dateCompleted = document.querySelector('input[name="date_completed"]').value
        const forumTitle = document.querySelector('input[name="forum_title"]').value
        const venue = document.querySelector('input[name="venue"]').value
        const forumType = document.querySelector('select[name="forum_type"]').value
        const presentationDate = document.querySelector('input[name="presentation_date"]').value
        
        if (!dateCompleted || !forumTitle || !venue || !forumType || !presentationDate) {
            alert('Please fill in all required fields')
            return
        }
        
        const saveData = new FormData()
        saveData.append('action', 'save')
        saveData.append('research_id', researchId)
        saveData.append('presentor', presentor)
        saveData.append('date_completed', dateCompleted)
        saveData.append('forum_title', forumTitle)
        saveData.append('venue', venue)
        saveData.append('forum_type', forumType)
        saveData.append('presentation_date', presentationDate)
        
        if (presentationId) {
            saveData.append('id', presentationId)
        }
        
        showLoading()
        try {
            const response = await fetch('/presentedresearch', {
                method: 'POST',
                body: saveData
            })
            
            const result = await response.json()
            
            if (result.status) {
                closeModal()
                // Reset and reload data
                researchData = []
                filteredData = []
                hasMore = true
                nextCursor = null
                await fetchPresentations()
            } else {
                alert('Error saving presentation: ' + (result.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error saving presentation:', error)
            alert('Error saving presentation')
        } finally {
            hideLoading()
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
        fetchPresentations()
        fetchResearchPapers()
    }

    // Update filter button styles
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
            
            // Remove existing event listeners to avoid duplicates
            const newButton = button.cloneNode(true)
            button.parentNode.replaceChild(newButton, button)
            
            // Add hover effect to new button
            newButton.addEventListener('mouseenter', () => {
                if (newButton.textContent.trim() !== active) {
                    newButton.style.backgroundColor = '#3a3a3a'
                    newButton.style.color = '#fff'
                }
            })
            
            newButton.addEventListener('mouseleave', () => {
                if (newButton.textContent.trim() !== active) {
                    newButton.style.backgroundColor = 'transparent'
                    newButton.style.color = '#aaa'
                }
            })
            
            // Add click handler
            newButton.addEventListener('click', () => applyFilter(newButton.textContent.trim()))
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
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'All',
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 20px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: '1'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn' },
                                    text: 'University/Local',
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
                                    }
                                }),
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
                                    }
                                }),
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
                                    }
                                }),
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
                                                (item.title && item.title.toLowerCase().includes(term)) ||
                                                (item.forum_title && Array.isArray(item.forum_title) && 
                                                 item.forum_title.some(title => title.toLowerCase().includes(term))) ||
                                                (typeof item.forum_title === 'string' && item.forum_title.toLowerCase().includes(term)) ||
                                                (item.presentor && Array.isArray(item.presentor) && 
                                                 item.presentor.some(p => p.toLowerCase().includes(term))) ||
                                                (typeof item.presentor === 'string' && item.presentor.toLowerCase().includes(term)) ||
                                                (item.venue && Array.isArray(item.venue) && 
                                                 item.venue.some(v => v.toLowerCase().includes(term))) ||
                                                (typeof item.venue === 'string' && item.venue.toLowerCase().includes(term))
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
                // Total
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
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}
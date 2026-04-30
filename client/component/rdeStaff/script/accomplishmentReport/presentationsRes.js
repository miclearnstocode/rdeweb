import { $, Waiting } from "../../../../lib/lib.js"

export const facultyPresentation = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let presentationsData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let currentScope = 'All Scopes'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    // Stats state
    let currentStats = {
        totalPresentations: 0,
        totalPresenters: 0,
        withAwards: 0,
        local: 0,
        institutional: 0,
        regional: 0,
        national: 0,
        international: 0
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

    // Scope options
    const scopes = [
        'All Scopes',
        'Local',
        'Institutional',
        'Regional',
        'National',
        'International'
    ]

    // Award options
    const awardOptions = [
        'None',
        'Best Paper',
        'Best Presenter',
        'Best Poster',
        '1st Place',
        '2nd Place',
        '3rd Place',
        'Honorable Mention',
        'Special Citation',
        'People\'s Choice',
        'Best Research Award',
        'Excellence Award',
        'Innovation Award',
        'Others'
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

    // Fetch presentations data
    const fetchPresentationsData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            presentationsData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_presentations')

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
            if (currentScope !== 'All Scopes') {
                formData.append('scope', currentScope)
            }

            const response = await fetch('/api/presentations-research', {
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
                    presentationsData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalPresentations
                        updateStats()
                    }
                } else {
                    presentationsData = [...presentationsData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                applyScopeFilter()
                updateRecordCount()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching presentations data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    // Apply scope filter locally
    const applyScopeFilter = () => {
        if (currentScope === 'All Scopes') {
            filteredData = [...presentationsData]
        } else {
            filteredData = presentationsData.filter(item => item.scope === currentScope)
        }
        updateTableWithData()
    }

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchPresentationsData(nextCursor)
        }
    }

    // Update statistics
    const updateStats = () => {
        const statTotalPresentations = document.querySelector('.stat-total-presentations')
        const statTotalPresenters = document.querySelector('.stat-total-presenters')
        const statWithAwards = document.querySelector('.stat-with-awards')
        const statLocal = document.querySelector('.stat-local')
        const statInstitutional = document.querySelector('.stat-institutional')
        const statRegional = document.querySelector('.stat-regional')
        const statNational = document.querySelector('.stat-national')
        const statInternational = document.querySelector('.stat-international')

        if (statTotalPresentations) statTotalPresentations.textContent = currentStats.totalPresentations
        if (statTotalPresenters) statTotalPresenters.textContent = currentStats.totalPresenters
        if (statWithAwards) statWithAwards.textContent = currentStats.withAwards
        if (statLocal) statLocal.textContent = currentStats.local
        if (statInstitutional) statInstitutional.textContent = currentStats.institutional
        if (statRegional) statRegional.textContent = currentStats.regional
        if (statNational) statNational.textContent = currentStats.national
        if (statInternational) statInternational.textContent = currentStats.international
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
                display: 'absolute',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '20%',
                marginLeft: '100%',
                height: '350px',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif',
                gridColumn: '1 / -1'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-presentation-screen' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#9c27b0'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Faculty Presentations Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add Presentation" to add faculty research presentation records',
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

    // Render scope badge
    const renderScopeBadge = (scope) => {
        if (!scope || scope === '—') return '—'

        const scopeColors = {
            'Local': { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)', icon: 'fa-map-pin' },
            'Institutional': { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)', icon: 'fa-building-columns' },
            'Regional': { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)', icon: 'fa-map' },
            'National': { bg: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)', icon: 'fa-flag' },
            'International': { bg: 'rgba(233, 30, 99, 0.15)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)', icon: 'fa-globe' }
        }

        const colors = scopeColors[scope] || { bg: 'rgba(158, 158, 158, 0.15)', color: '#9e9e9e', border: 'rgba(158, 158, 158, 0.3)', icon: 'fa-circle' }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${colors.icon}` },
                    style: { fontSize: '10px' }
                }),
                $({ tag: 'span', text: scope })
            ]
        })
    }

    // Render award badge
    const renderAwardBadge = (award) => {
        if (!award || award === '—' || award === 'None') return '—'

        const awardColors = {
            'Best Paper': { bg: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', border: 'rgba(255, 215, 0, 0.3)' },
            'Best Presenter': { bg: 'rgba(0, 188, 212, 0.15)', color: '#00bcd4', border: 'rgba(0, 188, 212, 0.3)' },
            '1st Place': { bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: 'rgba(255, 215, 0, 0.4)' },
            '2nd Place': { bg: 'rgba(192, 192, 192, 0.2)', color: '#c0c0c0', border: 'rgba(192, 192, 192, 0.4)' },
            '3rd Place': { bg: 'rgba(205, 127, 50, 0.2)', color: '#cd7f32', border: 'rgba(205, 127, 50, 0.4)' }
        }

        const colors = awardColors[award] || { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-trophy' },
                    style: { fontSize: '10px' }
                }),
                $({ tag: 'span', text: award })
            ]
        })
    }

    // Render researchers list
    const renderResearchers = (researchers) => {
        if (!researchers || researchers === '—') return '—'

        let researcherList = []
        try {
            if (typeof researchers === 'string') {
                researcherList = JSON.parse(researchers)
            } else if (Array.isArray(researchers)) {
                researcherList = researchers
            } else {
                return researchers
            }
        } catch (e) {
            return researchers
        }

        if (researcherList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            },
            child: researcherList.map((researcher, idx) => {
                const name = typeof researcher === 'string' ? researcher : researcher.name || 'Unknown'

                return $({
                    tag: 'div',
                    style: {
                        padding: '4px 8px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(156, 39, 176, 0.05)' : 'transparent',
                        borderRadius: '4px',
                        borderBottom: '1px solid #444',
                        fontSize: '12px',
                        color: '#ddd',
                        lineHeight: '1.4'
                    },
                    text: name
                })
            })
        })
    }

    // Render paper trail links
    const renderLinks = (links) => {
        if (!links || links === '—' || (Array.isArray(links) && links.length === 0)) {
            return '—'
        }

        let linkArray = []
        try {
            if (typeof links === 'string') {
                linkArray = JSON.parse(links)
            } else if (Array.isArray(links)) {
                linkArray = links
            }
        } catch (e) {
            return links
        }

        if (linkArray.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            },
            child: linkArray.map((link, idx) => {
                const url = typeof link === 'string' ? link : link.url || link
                const label = typeof link === 'string' ? `Document ${idx + 1}` : (link.label || `Document ${idx + 1}`)

                return $({
                    tag: 'a',
                    att: {
                        href: url,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    },
                    style: {
                        color: '#9c27b0',
                        textDecoration: 'none',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                        padding: '6px 10px',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        transition: 'all 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-external-link-alt' },
                            style: { fontSize: '10px', opacity: 0.7 }
                        }),
                        $({ tag: 'span', text: label })
                    ],
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.backgroundColor = 'rgba(156, 39, 176, 0.2)'
                            e.target.style.borderColor = 'rgba(156, 39, 176, 0.4)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.backgroundColor = 'rgba(156, 39, 176, 0.1)'
                            e.target.style.borderColor = 'rgba(156, 39, 176, 0.2)'
                        }
                    }
                })
            })
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
                    fontFamily: 'monospace',
                    verticalAlign: 'top'
                },
                text: rowNumber.toString()
            })
        )

        // Title of Paper Presented
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
                    lineHeight: '1.4',
                    minWidth: '250px'
                },
                text: item.title || '—'
            })
        )

        // Presenter
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#9c27b0',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    minWidth: '150px',
                    backgroundColor: 'rgba(156, 39, 176, 0.05)'
                },
                text: item.presenter || '—'
            })
        )

        // Researcher/s
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '180px'
                },
                child: [renderResearchers(item.researchers)]
            })
        )

        // Date & Venue
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '180px'
                },
                child: [
                    $({
                        tag: 'div',
                        text: formatDate(item.date),
                        style: {
                            color: '#ddd',
                            fontSize: '12px',
                            fontWeight: '500',
                            marginBottom: '4px'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: item.venue || '—',
                        style: {
                            color: '#888',
                            fontSize: '11px',
                            fontStyle: 'italic'
                        }
                    })
                ]
            })
        )

        // Title of Forum/Symposium
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '200px'
                },
                text: item.forumTitle || '—'
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
                    lineHeight: '1.4',
                    minWidth: '150px'
                },
                text: item.sponsoringAgency || '—'
            })
        )

        // Award Received
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '140px'
                },
                child: [renderAwardBadge(item.award)]
            })
        )

        // Scope
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '120px'
                },
                child: [renderScopeBadge(item.scope)]
            })
        )

        // Link of the Paper Trail
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '250px'
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
                            deletePresentation(item)
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

    // Delete presentation
    const deletePresentation = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this presentation record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_presentation')
            formData.append('id', item.id)

            const response = await fetch('/api/presentations-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Presentation record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete presentation record', 'error')
            }
        } catch (error) {
            console.error('Error deleting presentation:', error)
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

        // Paper trail links state
        let paperTrailLinks = []
        if (isEditing && item.paperTrailLinks) {
            try {
                paperTrailLinks = typeof item.paperTrailLinks === 'string' ? JSON.parse(item.paperTrailLinks) : item.paperTrailLinks
                if (!Array.isArray(paperTrailLinks)) paperTrailLinks = []
            } catch (e) {
                paperTrailLinks = []
            }
        }

        // Researchers state
        let researchers = []
        if (isEditing && item.researchers) {
            try {
                researchers = typeof item.researchers === 'string' ? JSON.parse(item.researchers) : item.researchers
                if (!Array.isArray(researchers)) researchers = []
            } catch (e) {
                researchers = []
            }
        }

        // Containers for dynamic fields
        let linksContainer
        let researchersContainer

        // Function to add a new paper trail link
        const addLinkField = (url = '', label = '') => {
            const linkIndex = paperTrailLinks.length
            paperTrailLinks.push({ url, label })

            const linkRow = $({
                tag: 'div',
                att: { className: 'link-row', 'data-link-index': linkIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center'
                },
                child: [
                    $({
                        tag: 'select',
                        att: { className: 'link-label-select' },
                        style: {
                            flex: '1',
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
                            $({ tag: 'option', att: { value: '' }, text: '-- Document Type --' }),
                            $({ tag: 'option', att: { value: 'Presentation Slides', selected: label === 'Presentation Slides' }, text: 'Presentation Slides' }),
                            $({ tag: 'option', att: { value: 'Certificate', selected: label === 'Certificate' }, text: 'Certificate' }),
                            $({ tag: 'option', att: { value: 'Photo Documentation', selected: label === 'Photo Documentation' }, text: 'Photo Documentation' }),
                            $({ tag: 'option', att: { value: 'Symposium Program', selected: label === 'Symposium Program' }, text: 'Symposium Program' }),
                            $({ tag: 'option', att: { value: 'Invitation', selected: label === 'Invitation' }, text: 'Invitation' }),
                            $({ tag: 'option', att: { value: 'Abstract', selected: label === 'Abstract' }, text: 'Abstract' }),
                            $({ tag: 'option', att: { value: 'Full Paper', selected: label === 'Full Paper' }, text: 'Full Paper' }),
                            $({ tag: 'option', att: { value: 'Other', selected: label === 'Other' }, text: 'Other' })
                        ],
                        event: {
                            type: 'change',
                            method: (e) => {
                                if (paperTrailLinks[linkIndex]) {
                                    paperTrailLinks[linkIndex].label = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'url',
                            placeholder: 'https://...',
                            value: url,
                            className: 'link-url-input'
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
                                if (paperTrailLinks[linkIndex]) {
                                    paperTrailLinks[linkIndex].url = e.target.value
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
                                paperTrailLinks.splice(linkIndex, 1)
                                linkRow.remove()
                            }
                        }
                    })
                ]
            })

            return linkRow
        }

        // Function to add a researcher field
        const addResearcherField = (name = '') => {
            const researcherIndex = researchers.length
            researchers.push({ name })

            const researcherRow = $({
                tag: 'div',
                att: { className: 'researcher-row', 'data-researcher-index': researcherIndex },
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
                            placeholder: 'Researcher name',
                            value: name,
                            className: 'researcher-name-input'
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
                                if (researchers[researcherIndex]) {
                                    researchers[researcherIndex].name = e.target.value
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
                                researchers.splice(researcherIndex, 1)
                                researcherRow.remove()
                            }
                        }
                    })
                ]
            })

            return researcherRow
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
                                    text: isEditing ? 'Edit Faculty Presentation' : 'Add Faculty Presentation',
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
                            att: { id: 'presentation-form' },
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
                                                id: 'presentation-type-select'
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

                                // Title of Paper Presented
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Title of Paper Presented *',
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
                                                name: 'title',
                                                placeholder: 'Enter title of paper presented...',
                                                rows: '2',
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
                                            text: isEditing ? (item.title || '') : ''
                                        })
                                    ]
                                }),

                                // Presenter
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Presenter *',
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
                                                name: 'presenter',
                                                value: isEditing ? (item.presenter || '') : '',
                                                placeholder: 'Enter presenter name...',
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

                                // Researcher/s section
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
                                                    text: 'Researcher/s',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Researcher',
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
                                                            const newRow = addResearcherField()
                                                            researchersContainer.appendChild(newRow)
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
                                            att: { id: 'researchers-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                researchersContainer = el
                                                if (isEditing && researchers.length > 0) {
                                                    researchers.forEach(researcher => {
                                                        researchersContainer.appendChild(
                                                            addResearcherField(researcher.name)
                                                        )
                                                    })
                                                }
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

                                // Title of Forum/Symposium and Sponsoring Agency row
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
                                                    text: 'Title of Forum/Symposium & Similar Activities *',
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
                                                        name: 'forumTitle',
                                                        value: isEditing ? (item.forumTitle || '') : '',
                                                        placeholder: 'Enter forum/symposium title...',
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

                                // Award Received and Scope row
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
                                                    text: 'Award Received (if any)',
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
                                                    att: { name: 'award' },
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
                                                    child: awardOptions.map(award =>
                                                        $({
                                                            tag: 'option',
                                                            att: { value: award, selected: isEditing && item.award === award },
                                                            text: award
                                                        })
                                                    )
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Scope *',
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
                                                        name: 'scope',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Scope --' }),
                                                        $({ tag: 'option', att: { value: 'Local', selected: isEditing && item.scope === 'Local' }, text: 'Local' }),
                                                        $({ tag: 'option', att: { value: 'Institutional', selected: isEditing && item.scope === 'Institutional' }, text: 'Institutional' }),
                                                        $({ tag: 'option', att: { value: 'Regional', selected: isEditing && item.scope === 'Regional' }, text: 'Regional' }),
                                                        $({ tag: 'option', att: { value: 'National', selected: isEditing && item.scope === 'National' }, text: 'National' }),
                                                        $({ tag: 'option', att: { value: 'International', selected: isEditing && item.scope === 'International' }, text: 'International' })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Paper Trail Links section
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
                                                    text: 'Link of the Paper Trail (Presentation Slides, Certificate, Photo Documentation, etc.)',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        flex: '1'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Paper Trail',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#2196f3',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        whiteSpace: 'nowrap'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            const newRow = addLinkField()
                                                            linksContainer.appendChild(newRow)
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
                                            att: { id: 'links-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                linksContainer = el
                                                if (isEditing && paperTrailLinks.length > 0) {
                                                    paperTrailLinks.forEach(link => {
                                                        linksContainer.appendChild(addLinkField(link.url, link.label))
                                                    })
                                                }
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
                                            text: isEditing ? 'Update Presentation' : 'Add Presentation',
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
                                    await savePresentationData(isEditing)
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
            const typeSelect = document.getElementById('presentation-type-select')
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

    // Save presentation data
    const savePresentationData = async (isEditing) => {
        const form = document.getElementById('presentation-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_presentation' : 'add_presentation')

        // Add dynamic arrays as JSON
        formData.append('researchers', JSON.stringify(researchers))
        formData.append('paperTrailLinks', JSON.stringify(paperTrailLinks))

        showLoading()
        try {
            const response = await fetch('/api/presentations-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Presentation updated successfully' : 'Presentation added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving presentation data', 'error')
            }
        } catch (error) {
            console.error('Error saving presentation:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Refresh data
    const refreshData = async () => {
        presentationsData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchPresentationsData()
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
                                    att: { className: 'fa-solid fa-presentation-screen' },
                                    style: { color: '#9c27b0', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Faculty Research Results Presented',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '18px',
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
                                // Scope filter
                                $({
                                    tag: 'select',
                                    att: { className: 'scope-select' },
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
                                    child: scopes.map(s =>
                                        $({
                                            tag: 'option',
                                            att: { value: s },
                                            text: s,
                                            selected: s === currentScope
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentScope = e.target.value
                                            applyScopeFilter()
                                            updateRecordCount()
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Add Presentation button
                $({
                    tag: 'button',
                    text: '+ Add Presentation',
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
                                backgroundColor: 'rgba(156, 39, 176, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(156, 39, 176, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-presentation-screen' },
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
                                    att: { className: 'stat-total-presentations stat-value' },
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
                                    text: 'Total Presentations',
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
                // Total Presenters
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
                                backgroundColor: 'rgba(0, 188, 212, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(0, 188, 212, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user-tie' },
                                    style: { color: '#00bcd4', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-total-presenters stat-value' },
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
                                    text: 'Total Presenters',
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
                // With Awards
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
                                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 215, 0, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-trophy' },
                                    style: { color: '#ffd700', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-with-awards stat-value' },
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
                                    text: 'With Awards',
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
                // Scope Breakdown
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
                            text: 'Scope Breakdown',
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
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createScopeStat('Local', '#4caf50', 'stat-local', 'fa-map-pin'),
                                createScopeStat('Institutional', '#2196f3', 'stat-institutional', 'fa-building-columns'),
                                createScopeStat('Regional', '#ff9800', 'stat-regional', 'fa-map'),
                                createScopeStat('National', '#9c27b0', 'stat-national', 'fa-flag'),
                                createScopeStat('International', '#e91e63', 'stat-international', 'fa-globe')
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create scope stat item
    const createScopeStat = (label, color, className, icon) => {
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
                    att: { className: `fa-solid ${icon}` },
                    style: {
                        fontSize: '20px',
                        color: color,
                        marginBottom: '8px',
                        opacity: 0.7
                    }
                }),
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
            'Title of Paper\nPresented',
            'Presenter',
            'Researcher/s',
            'Date & Venue',
            'Title of Forum/Symposium\n& Similar Activities',
            'Sponsoring\nAgency',
            'Award Received\n(if any)',
            'Scope\n(Local, Institutional,\nRegional, National,\nInternational)',
            'Link of the\nPaper Trail',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'Award Received\n(if any)', 'Scope\n(Local, Institutional,\nRegional, National,\nInternational)', 'ACTIONS'].includes(header)

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
                height: 'calc(100% - 340px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchPresentationsData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '2200px',
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
        att: { className: 'presentations-research-container' },
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

export default facultyPresentation
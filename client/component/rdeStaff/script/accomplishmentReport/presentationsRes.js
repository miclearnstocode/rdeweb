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

            const response = await fetch('/presentationResearch', {
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

    const applyScopeFilter = () => {
        if (currentScope === 'All Scopes') {
            filteredData = [...presentationsData]
        } else {
            filteredData = presentationsData.filter(item => item.scope === currentScope)
        }
        updateTableWithData()
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchPresentationsData(nextCursor)
        }
    }

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
        const headerRow = document.querySelector('.presentations-container thead tr')
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
                        padding: '80px 20px',
                        border: '1px solid #e8eaed',
                        backgroundColor: '#ffffff',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        height: '400px',
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
                                maxWidth: '520px',
                                margin: '0 auto',
                                padding: '50px 30px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '16px',
                                border: '2px dashed #e8eaed',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        backgroundColor: '#f5f0ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-presentation-screen' },
                                            style: {
                                                fontSize: '36px',
                                                color: '#7c3aed',
                                                opacity: 0.6
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Faculty Presentations Found',
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
                                    text: 'Click "Add Presentation" to add faculty research presentation records',
                                    style: {
                                        fontSize: '14px',
                                        color: '#5f6368',
                                        marginBottom: '24px',
                                        textAlign: 'center',
                                        lineHeight: '1.5'
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    att: {
                                        type: 'button',
                                        className: 'btn-add-presentation'
                                    },
                                    style: {
                                        padding: '12px 32px',
                                        backgroundColor: '#7c3aed',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontFamily: 'inherit',
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
                                            text: 'Add Presentation'
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
                                            e.currentTarget.style.backgroundColor = '#6d28d9'
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'
                                            e.currentTarget.style.transform = 'translateY(-2px)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.currentTarget.style.backgroundColor = '#7c3aed'
                                            e.currentTarget.style.boxShadow = 'none'
                                            e.currentTarget.style.transform = 'translateY(0)'
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

    const renderScopeBadge = (scope) => {
        if (!scope || scope === '—') return '—'

        const scopeColors = {
            'Local': { 
                bg: '#e8f5e9', 
                color: '#2d7d46', 
                border: '#a5d6a7', 
                hoverBg: '#c8e6c9',
                icon: 'fa-map-pin' 
            },
            'Institutional': { 
                bg: '#e8f0fe', 
                color: '#0d47a1', 
                border: '#90caf9', 
                hoverBg: '#bbdefb',
                icon: 'fa-building-columns' 
            },
            'Regional': { 
                bg: '#fff8e1', 
                color: '#cc7b00', 
                border: '#ffe082', 
                hoverBg: '#ffecb3',
                icon: 'fa-map' 
            },
            'National': { 
                bg: '#f5f0ff', 
                color: '#7c3aed', 
                border: '#dcc8ff', 
                hoverBg: '#ede8fd',
                icon: 'fa-flag' 
            },
            'International': { 
                bg: '#fce8e6', 
                color: '#c62828', 
                border: '#ef9a9a', 
                hoverBg: '#ffcdd2',
                icon: 'fa-globe' 
            }
        }

        const colors = scopeColors[scope] || { 
            bg: '#f1f3f4', 
            color: '#5f6368', 
            border: '#dadce0', 
            hoverBg: '#e8eaed',
            icon: 'fa-circle' 
        }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: colors.color,
                border: `2px solid ${colors.border}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
                cursor: 'default',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
            },
            child: [
                // Colored circle background for icon
                $({
                    tag: 'span',
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: colors.bg,
                        flexShrink: 0,
                        transition: 'all 0.25s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${colors.icon}` },
                            style: { 
                                fontSize: '11px',
                                color: colors.color,
                                transition: 'all 0.25s ease'
                            }
                        })
                    ]
                }),
                $({ 
                    tag: 'span', 
                    text: scope,
                    style: {
                        fontWeight: '600'
                    }
                })
            ],
            event: {
                type: 'mouseenter',
                method: (e) => {
                    const badge = e.currentTarget
                    badge.style.transform = 'translateY(-2px)'
                    badge.style.boxShadow = `0 4px 16px ${colors.color}25`
                    badge.style.borderColor = colors.color
                    
                    // Animate the icon circle
                    const iconCircle = badge.querySelector('span:first-child')
                    if (iconCircle) {
                        iconCircle.style.backgroundColor = colors.hoverBg
                        iconCircle.style.transform = 'scale(1.1)'
                    }
                    
                    // Animate the icon
                    const icon = badge.querySelector('.fa-solid')
                    if (icon) {
                        icon.style.transform = 'scale(1.1)'
                    }
                },
                type2: 'mouseleave',
                method2: (e) => {
                    const badge = e.currentTarget
                    badge.style.transform = 'translateY(0)'
                    badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    badge.style.borderColor = colors.border
                    
                    const iconCircle = badge.querySelector('span:first-child')
                    if (iconCircle) {
                        iconCircle.style.backgroundColor = colors.bg
                        iconCircle.style.transform = 'scale(1)'
                    }
                    
                    const icon = badge.querySelector('.fa-solid')
                    if (icon) {
                        icon.style.transform = 'scale(1)'
                    }
                }
            }
        })
    }

    const renderAwardBadge = (award) => {
        if (!award || award === '—' || award === 'None') return '—'

        const awardColors = {
            'Best Paper': { 
                bg: '#fff8e1', 
                color: '#f9a825', 
                border: '#ffe082', 
                hoverBg: '#ffecb3',
                icon: 'fa-award'
            },
            'Best Presenter': { 
                bg: '#e8f8fa', 
                color: '#00838f', 
                border: '#b2ebf2', 
                hoverBg: '#b2ebf2',
                icon: 'fa-microphone'
            },
            '1st Place': { 
                bg: '#fff8e1', 
                color: '#f9a825', 
                border: '#ffd54f', 
                hoverBg: '#ffe082',
                icon: 'fa-medal'
            },
            '2nd Place': { 
                bg: '#f5f5f5', 
                color: '#78909c', 
                border: '#cfd8dc', 
                hoverBg: '#e0e0e0',
                icon: 'fa-medal'
            },
            '3rd Place': { 
                bg: '#fbe9e7', 
                color: '#bf6a30', 
                border: '#ffab91', 
                hoverBg: '#ffccbc',
                icon: 'fa-medal'
            },
            'Best Research': {
                bg: '#e8f5e9',
                color: '#2d7d46',
                border: '#a5d6a7',
                hoverBg: '#c8e6c9',
                icon: 'fa-flask'
            },
            'Outstanding': {
                bg: '#fce4ec',
                color: '#c62828',
                border: '#ef9a9a',
                hoverBg: '#ffcdd2',
                icon: 'fa-star'
            }
        }

        const colors = awardColors[award] || { 
            bg: '#f1f3f4', 
            color: '#5f6368', 
            border: '#dadce0', 
            hoverBg: '#e8eaed',
            icon: 'fa-trophy' 
        }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: colors.color,
                border: `2px solid ${colors.border}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
                cursor: 'default',
                letterSpacing: '0.3px'
            },
            child: [
                // Colored circle background for icon
                $({
                    tag: 'span',
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: colors.bg,
                        flexShrink: 0,
                        transition: 'all 0.25s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${colors.icon}` },
                            style: { 
                                fontSize: '11px',
                                color: colors.color,
                                transition: 'all 0.25s ease'
                            }
                        })
                    ]
                }),
                $({ 
                    tag: 'span', 
                    text: award,
                    style: {
                        fontWeight: '600'
                    }
                })
            ],
            event: {
                type: 'mouseenter',
                method: (e) => {
                    const badge = e.currentTarget
                    badge.style.transform = 'translateY(-2px)'
                    badge.style.boxShadow = `0 4px 16px ${colors.color}25`
                    badge.style.borderColor = colors.color
                    
                    // Animate the icon circle
                    const iconCircle = badge.querySelector('span:first-child')
                    if (iconCircle) {
                        iconCircle.style.backgroundColor = colors.hoverBg
                        iconCircle.style.transform = 'scale(1.1)'
                    }
                    
                    // Animate the icon
                    const icon = badge.querySelector('.fa-solid')
                    if (icon) {
                        icon.style.transform = 'scale(1.1)'
                    }
                },
                type2: 'mouseleave',
                method2: (e) => {
                    const badge = e.currentTarget
                    badge.style.transform = 'translateY(0)'
                    badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    badge.style.borderColor = colors.border
                    
                    const iconCircle = badge.querySelector('span:first-child')
                    if (iconCircle) {
                        iconCircle.style.backgroundColor = colors.bg
                        iconCircle.style.transform = 'scale(1)'
                    }
                    
                    const icon = badge.querySelector('.fa-solid')
                    if (icon) {
                        icon.style.transform = 'scale(1)'
                    }
                }
            }
        })
    }

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
                gap: '6px',
                padding: '4px 0'
            },
            child: researcherList.map((researcher, idx) => {
                const name = typeof researcher === 'string' ? researcher : researcher.name || 'Unknown'
                const role = typeof researcher === 'object' ? researcher.role : ''
                const affiliation = typeof researcher === 'object' ? researcher.affiliation : ''

                // Generate a consistent color based on name
                const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const colors = [
                    { border: '#7c3aed', bg: '#f5f0ff', lightBg: '#ede8fd' },
                    { border: '#1a73e8', bg: '#e8f0fe', lightBg: '#d2e3fc' },
                    { border: '#00838f', bg: '#f0fafc', lightBg: '#b2ebf2' },
                    { border: '#2d7d46', bg: '#f0faf0', lightBg: '#c8e6c9' },
                    { border: '#cc7b00', bg: '#fff8f0', lightBg: '#ffe082' },
                    { border: '#c62828', bg: '#fce8e6', lightBg: '#ffcdd2' }
                ]
                const colorIndex = hash % colors.length
                const color = colors[colorIndex]

                return $({
                    tag: 'div',
                    style: {
                        padding: '8px 12px',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        borderRadius: '8px',
                        border: `1px solid ${idx % 2 === 0 ? '#e8eaed' : '#f1f3f4'}`,
                        borderLeft: `3px solid ${color.border}`,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.backgroundColor = color.lightBg
                            e.currentTarget.style.borderColor = color.border
                            e.currentTarget.style.transform = 'translateX(4px)'
                            e.currentTarget.style.boxShadow = `0 2px 8px ${color.border}20`
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f9fa'
                            e.currentTarget.style.borderColor = idx % 2 === 0 ? '#e8eaed' : '#f1f3f4'
                            e.currentTarget.style.transform = 'translateX(0)'
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'
                        }
                    },
                    child: [
                        // Name with icon
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: color.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-user' },
                                            style: {
                                                fontSize: '12px',
                                                color: color.border
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '1'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: name,
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#202124',
                                                lineHeight: '1.4'
                                            }
                                        }),
                                        ...(role ? [
                                            $({
                                                tag: 'span',
                                                text: role,
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5f6368',
                                                    fontStyle: 'italic',
                                                    lineHeight: '1.3'
                                                }
                                            })
                                        ] : []),
                                        ...(affiliation ? [
                                            $({
                                                tag: 'span',
                                                text: affiliation,
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#9aa0a6',
                                                    lineHeight: '1.3'
                                                }
                                            })
                                        ] : [])
                                    ]
                                })
                            ]
                        }),
                        // Researcher badge/indicator
                        ...(idx === 0 ? [
                            $({
                                tag: 'div',
                                style: {
                                    marginTop: '6px',
                                    paddingTop: '6px',
                                    borderTop: '1px solid #f1f3f4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-user-check' },
                                        style: {
                                            fontSize: '10px',
                                            color: '#7c3aed'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Lead Researcher',
                                        style: {
                                            fontSize: '10px',
                                            color: '#5f6368',
                                            fontWeight: '500'
                                        }
                                    })
                                ]
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    const renderLinks = (links) => {
        if (!links || links === '—' || (Array.isArray(links) && links.length === 0)) {
            return '—'
        }

        let linkData = {}
        try {
            if (typeof links === 'string') {
                linkData = JSON.parse(links)
            } else if (typeof links === 'object' && !Array.isArray(links)) {
                linkData = links
            } else {
                return links
            }
        } catch (e) {
            return links
        }

        const hasLinks = Object.values(linkData).some(val => val && val.length > 0)
        if (!hasLinks) {
            return $({
                tag: 'span',
                text: 'No attachments',
                style: {
                    color: '#9aa0a6',
                    fontSize: '12px',
                    fontStyle: 'italic'
                }
            })
        }

        const attachmentTypes = [
            { 
                key: 'presentationSlides', 
                label: 'Slides', 
                icon: 'fa-solid fa-file-powerpoint', 
                color: '#d24726',
                bg: '#fbe9e7',
                border: '#ffab91'
            },
            { 
                key: 'certificate', 
                label: 'Certificate', 
                icon: 'fa-solid fa-certificate', 
                color: '#1a73e8',
                bg: '#e8f0fe',
                border: '#90caf9'
            },
            { 
                key: 'photoDocumentation', 
                label: 'Photos', 
                icon: 'fa-solid fa-images', 
                color: '#34a853',
                bg: '#e6f4ea',
                border: '#a5d6a7'
            }
        ]

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            },
            child: attachmentTypes
                .filter(type => linkData[type.key] && linkData[type.key].length > 0)
                .map((type) => {
                    const urls = Array.isArray(linkData[type.key]) ? linkData[type.key] : [linkData[type.key]]
                    
                    return urls.map((url, idx) => {
                        const fileName = url.split('/').pop() || `${type.label} ${idx + 1}`
                        
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
                                gap: '6px',
                                padding: '4px 10px',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                border: `1px solid ${type.border}`,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '11px',
                                color: '#202124',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: type.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: type.icon },
                                            style: {
                                                fontSize: '10px',
                                                color: type.color
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        flex: '1',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    },
                                    text: fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-external-link-alt' },
                                    style: {
                                        fontSize: '9px',
                                        color: '#9aa0a6'
                                    }
                                })
                            ],
                            event: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.currentTarget.style.backgroundColor = type.bg
                                    e.currentTarget.style.borderColor = type.color
                                    e.currentTarget.style.transform = 'translateX(2px)'
                                },
                                type2: 'mouseleave',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                    e.currentTarget.style.borderColor = type.border
                                    e.currentTarget.style.transform = 'translateX(0)'
                                }
                            }
                        })
                    })
                })
                .flat()
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
                    backgroundColor: '#ffffff',
                    fontWeight: '500'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    minWidth: '250px',
                    backgroundColor: '#ffffff'
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
                    color: '#7c3aed',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    minWidth: '150px',
                    backgroundColor: '#faf5ff'
                },
                child: item.presenter ? [
                    $({
                        tag: 'span',
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-user' },
                                style: {
                                    fontSize: '11px',
                                    color: '#7c3aed',
                                    opacity: 0.6
                                }
                            }),
                            $({
                                tag: 'span',
                                text: item.presenter
                            })
                        ]
                    })
                ] : [
                    $({
                        tag: 'span',
                        text: '—',
                        style: {
                            color: '#9aa0a6'
                        }
                    })
                ]
            })
        )

        // Researcher/s
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-regular fa-calendar' },
                                style: {
                                    fontSize: '11px',
                                    color: '#9aa0a6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: formatDate(item.date),
                                style: {
                                    color: '#202124',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-location-dot' },
                                style: {
                                    fontSize: '10px',
                                    color: '#9aa0a6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: item.venue || '—',
                                style: {
                                    color: '#5f6368',
                                    fontSize: '11px',
                                    fontStyle: 'italic'
                                }
                            })
                        ]
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
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
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '150px',
                    backgroundColor: '#ffffff'
                },
                child: item.sponsoringAgency ? [
                    $({
                        tag: 'span',
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-regular fa-building' },
                                style: {
                                    fontSize: '11px',
                                    color: '#9aa0a6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: item.sponsoringAgency
                            })
                        ]
                    })
                ] : [
                    $({
                        tag: 'span',
                        text: '—',
                        style: {
                            color: '#9aa0a6'
                        }
                    })
                ]
            })
        )

        // Award Received
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    minWidth: '140px',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    minWidth: '120px',
                    backgroundColor: '#ffffff'
                },
                child: [renderScopeBadge(item.scope)]
            })
        )

        // Link of the Paper Trail - Updated with separate attachments
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
                        if (!cell.style.backgroundColor.includes('#faf5ff') && 
                            !cell.style.backgroundColor.includes('#f8f9fa')) {
                            cell.style.backgroundColor = '#f8f9fa'
                        }
                    })
                },
                type2: 'mouseleave',
                method2: (e) => {
                    const row = e.currentTarget
                    row.style.backgroundColor = '#ffffff'
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                        const currentBg = cell.style.backgroundColor
                        // Reset only if it was changed by hover
                        if (currentBg === 'rgb(248, 249, 250)' || currentBg === '#f8f9fa') {
                            cell.style.backgroundColor = '#ffffff'
                        }
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
                gap: '6px',
                justifyContent: 'center',
                alignItems: 'center'
            },
            child: [
                // Edit button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        border: '1px solid #e8eaed',
                        backgroundColor: '#ffffff',
                        color: '#1a73e8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    },
                    title: 'Edit',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-pen' },
                            style: { 
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                            }
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
                            const btn = e.currentTarget
                            btn.style.backgroundColor = '#e8f0fe'
                            btn.style.borderColor = '#1a73e8'
                            btn.style.transform = 'translateY(-2px)'
                            btn.style.boxShadow = '0 4px 12px rgba(26,115,232,0.2)'
                            const icon = btn.querySelector('.fa-solid')
                            if (icon) {
                                icon.style.transform = 'scale(1.1)'
                            }
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            const btn = e.currentTarget
                            btn.style.backgroundColor = '#ffffff'
                            btn.style.borderColor = '#e8eaed'
                            btn.style.transform = 'translateY(0)'
                            btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                            const icon = btn.querySelector('.fa-solid')
                            if (icon) {
                                icon.style.transform = 'scale(1)'
                            }
                        }
                    }
                }),
                // Delete button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        border: '1px solid #e8eaed',
                        backgroundColor: '#ffffff',
                        color: '#ea4335',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    },
                    title: 'Delete',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-trash' },
                            style: { 
                                fontSize: '13px',
                                transition: 'all 0.2s ease'
                            }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deletePresentation(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            const btn = e.currentTarget
                            btn.style.backgroundColor = '#fce8e6'
                            btn.style.borderColor = '#ea4335'
                            btn.style.transform = 'translateY(-2px)'
                            btn.style.boxShadow = '0 4px 12px rgba(234,67,53,0.2)'
                            const icon = btn.querySelector('.fa-solid')
                            if (icon) {
                                icon.style.transform = 'scale(1.1)'
                            }
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            const btn = e.currentTarget
                            btn.style.backgroundColor = '#ffffff'
                            btn.style.borderColor = '#e8eaed'
                            btn.style.transform = 'translateY(0)'
                            btn.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                            const icon = btn.querySelector('.fa-solid')
                            if (icon) {
                                icon.style.transform = 'scale(1)'
                            }
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

    const renderModal = (item = null) => {
        if (modalElement) {
            modalElement.remove()
        }

        const isEditing = item !== null

        // Paper trail files state
        let paperTrailFiles = {
            presentationSlides: [],
            certificate: [],
            photoDocumentation: []
        }
        
        // Existing files for display
        let existingFiles = {
            presentationSlides: [],
            certificate: [],
            photoDocumentation: []
        }

        if (isEditing && item.paperTrailLinks) {
            try {
                const links = typeof item.paperTrailLinks === 'string' ? JSON.parse(item.paperTrailLinks) : item.paperTrailLinks
                if (typeof links === 'object' && !Array.isArray(links)) {
                    // New format with separate sections
                    existingFiles.presentationSlides = links.presentationSlides || []
                    existingFiles.certificate = links.certificate || []
                    existingFiles.photoDocumentation = links.photoDocumentation || []
                } else if (Array.isArray(links)) {
                    // Legacy format - convert to new format
                    links.forEach(link => {
                        if (link.label && link.url) {
                            if (link.label === 'Presentation Slides') {
                                existingFiles.presentationSlides.push(link.url)
                            } else if (link.label === 'Certificate') {
                                existingFiles.certificate.push(link.url)
                            } else if (link.label === 'Photo Documentation') {
                                existingFiles.photoDocumentation.push(link.url)
                            }
                        }
                    })
                }
            } catch (e) {
                console.error('Error parsing paper trail links:', e)
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
        let researchersContainer

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
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e8eaed',
                            borderRadius: '8px',
                            color: '#202124',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        },
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
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (researchers[researcherIndex]) {
                                    researchers[researcherIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        style: {
                            padding: '8px 12px',
                            backgroundColor: '#fce8e6',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ea4335',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px'
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
                                researchers.splice(researcherIndex, 1)
                                researcherRow.remove()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#ea4335'
                                e.currentTarget.style.color = '#ffffff'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#fce8e6'
                                e.currentTarget.style.color = '#ea4335'
                            }
                        }
                    })
                ]
            })

            return researcherRow
        }

        const addPhotoPreview = (file, container, isExisting, photoUrl, index) => {
            const preview = $({
                tag: 'div',
                style: {
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#f8f9fa',
                    aspectRatio: '1'
                },
                child: [
                    // Image
                    $({
                        tag: 'img',
                        att: {
                            src: isExisting ? photoUrl : URL.createObjectURL(file),
                            alt: `Photo ${index + 1}`
                        },
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }
                    }),
                    // Remove button
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        style: {
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
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
                            method: () => {
                                if (isExisting) {
                                    // Remove existing photo
                                    const existingIndex = existingFiles.photoDocumentation.indexOf(photoUrl)
                                    if (existingIndex > -1) {
                                        existingFiles.photoDocumentation.splice(existingIndex, 1)
                                    }
                                } else {
                                    // Remove new photo
                                    const fileIndex = paperTrailFiles.photoDocumentation.indexOf(file)
                                    if (fileIndex > -1) {
                                        paperTrailFiles.photoDocumentation.splice(fileIndex, 1)
                                    }
                                }
                                preview.remove()
                                // Update photo count
                                const photoCount = document.getElementById('photo-count')
                                if (photoCount) {
                                    photoCount.textContent = `${paperTrailFiles.photoDocumentation.length + existingFiles.photoDocumentation.length}`
                                }
                                // Update photo container empty state
                                updatePhotoContainer()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#ea4335'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'
                            }
                        }
                    })
                ]
            })
            
            // Remove empty message if it exists
            const emptyMessage = container.querySelector('div[style*="gridColumn: 1 / -1"]')
            if (emptyMessage) {
                emptyMessage.remove()
            }
            
            container.appendChild(preview)
        }

        // Function to update photo container
        const updatePhotoContainer = () => {
            const container = document.getElementById('photos-preview-container')
            if (!container) return
            
            const totalPhotos = paperTrailFiles.photoDocumentation.length + existingFiles.photoDocumentation.length
            
            if (totalPhotos === 0) {
                container.innerHTML = ''
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
                container.appendChild(emptyMessage)
            }
            
            // Update photo count
            const photoCount = document.getElementById('photo-count')
            if (photoCount) {
                photoCount.textContent = `${totalPhotos}`
            }
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
                                borderBottom: '2px solid #e8eaed',
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
                                                    att: { className: 'fa-solid fa-presentation-screen' },
                                                    style: { color: '#ffffff', fontSize: '18px' }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'h2',
                                            text: isEditing ? 'Edit Faculty Presentation' : 'Add Faculty Presentation',
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
                                    att: { id: 'presentation-form' },
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
                                                        id: 'presentation-type-select'
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
                                                            e.target.style.borderColor = '#7c3aed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
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

                                        // Title of Paper Presented
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Title of Paper Presented *',
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
                                                        name: 'title',
                                                        placeholder: 'Enter title of paper presented...',
                                                        rows: '2',
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
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    text: isEditing ? (item.title || '') : '',
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
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // Presenter
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Presenter *',
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
                                                        name: 'presenter',
                                                        value: isEditing ? (item.presenter || '') : '',
                                                        placeholder: 'Enter presenter name...',
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
                                                            e.target.style.borderColor = '#7c3aed'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
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

                                        // Researcher/s section
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
                                                                    text: 'Researcher/s',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Add all researchers involved',
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
                                                                    text: 'Add Researcher'
                                                                })
                                                            ],
                                                            event: {
                                                                type: 'click',
                                                                method: () => {
                                                                    const newRow = addResearcherField()
                                                                    researchersContainer.appendChild(newRow)
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
                                                    att: { id: 'researchers-container' },
                                                    style: {
                                                        backgroundColor: '#fafafa',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '2px solid #e8eaed',
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
                                                marginBottom: '24px'
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
                                                                fontFamily: 'inherit'
                                                            },
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
                                                                    e.target.style.borderColor = '#7c3aed'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
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

                                        // Title of Forum/Symposium and Sponsoring Agency row
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
                                                            text: 'Forum/Symposium Title *',
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
                                                                name: 'forumTitle',
                                                                value: isEditing ? (item.forumTitle || '') : '',
                                                                placeholder: 'Enter forum/symposium title...',
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
                                                                    e.target.style.borderColor = '#7c3aed'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
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
                                                                    e.target.style.borderColor = '#7c3aed'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
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

                                        // Award Received and Scope row
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
                                                            text: 'Award Received',
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
                                                            att: { name: 'award' },
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
                                                                $({ tag: 'option', att: { value: 'None' }, text: 'None' }),
                                                                $({ tag: 'option', att: { value: 'Best Paper', selected: isEditing && item.award === 'Best Paper' }, text: '🏆 Best Paper' }),
                                                                $({ tag: 'option', att: { value: 'Best Presenter', selected: isEditing && item.award === 'Best Presenter' }, text: '🎤 Best Presenter' }),
                                                                $({ tag: 'option', att: { value: '1st Place', selected: isEditing && item.award === '1st Place' }, text: '🥇 1st Place' }),
                                                                $({ tag: 'option', att: { value: '2nd Place', selected: isEditing && item.award === '2nd Place' }, text: '🥈 2nd Place' }),
                                                                $({ tag: 'option', att: { value: '3rd Place', selected: isEditing && item.award === '3rd Place' }, text: '🥉 3rd Place' }),
                                                                $({ tag: 'option', att: { value: 'Best Research', selected: isEditing && item.award === 'Best Research' }, text: '🔬 Best Research' }),
                                                                $({ tag: 'option', att: { value: 'Outstanding', selected: isEditing && item.award === 'Outstanding' }, text: '⭐ Outstanding' })
                                                            ],
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
                                                            text: 'Scope *',
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
                                                                name: 'scope',
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
                                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Scope --' }),
                                                                $({ tag: 'option', att: { value: 'Local', selected: isEditing && item.scope === 'Local' }, text: '📍 Local' }),
                                                                $({ tag: 'option', att: { value: 'Institutional', selected: isEditing && item.scope === 'Institutional' }, text: '🏛️ Institutional' }),
                                                                $({ tag: 'option', att: { value: 'Regional', selected: isEditing && item.scope === 'Regional' }, text: '🗺️ Regional' }),
                                                                $({ tag: 'option', att: { value: 'National', selected: isEditing && item.scope === 'National' }, text: '🇵🇭 National' }),
                                                                $({ tag: 'option', att: { value: 'International', selected: isEditing && item.scope === 'International' }, text: '🌍 International' })
                                                            ],
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
                                                                    e.target.style.backgroundColor = '#f8f9fa'
                                                                    e.target.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        // Paper Trail Links - Two Column Grid Layout
                                        $({
                                            tag: 'div',
                                            style: { 
                                                marginBottom: '24px',
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '20px'
                                            },
                                            child: [
                                                // Column 1: Presentation Slides
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#fafafa',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        border: '1px solid #e8eaed'
                                                    },
                                                    child: [
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
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#fbe9e7',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-file-powerpoint' },
                                                                            style: { color: '#d24726', fontSize: '14px' }
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
                                                                            text: 'Presentation Slides',
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
                                                                            text: 'PDF, PPT, PPTX',
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: '#5f6368',
                                                                                display: 'block'
                                                                            }
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'file',
                                                                accept: '.pdf,.ppt,.pptx',
                                                                id: 'slides-input'
                                                            },
                                                            style: { display: 'none' },
                                                            event: {
                                                                type: 'change',
                                                                method: (e) => {
                                                                    const file = e.target.files[0]
                                                                    if (file) {
                                                                        paperTrailFiles.presentationSlides.push(file)
                                                                        showNotification(`"${file.name}" selected for upload`, 'info')
                                                                        // Update the file name display
                                                                        const fileNameDisplay = document.getElementById('slides-file-name')
                                                                        if (fileNameDisplay) {
                                                                            fileNameDisplay.textContent = file.name
                                                                            fileNameDisplay.style.color = '#1e8e3e'
                                                                        }
                                                                    }
                                                                    e.target.value = ''
                                                                }
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                display: 'flex',
                                                                gap: '8px',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'button',
                                                                    att: { type: 'button' },
                                                                    style: {
                                                                        padding: '6px 14px',
                                                                        backgroundColor: '#fbe9e7',
                                                                        border: '2px dashed #d24726',
                                                                        borderRadius: '8px',
                                                                        color: '#d24726',
                                                                        fontSize: '12px',
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
                                                                            att: { className: 'fa-solid fa-upload' },
                                                                            style: { fontSize: '11px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Choose File'
                                                                        })
                                                                    ],
                                                                    event: {
                                                                        type: 'click',
                                                                        method: () => {
                                                                            document.getElementById('slides-input').click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.backgroundColor = '#ffccbc'
                                                                            e.currentTarget.style.borderColor = '#d24726'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.backgroundColor = '#fbe9e7'
                                                                            e.currentTarget.style.borderColor = '#d24726'
                                                                        }
                                                                    }
                                                                }),
                                                                ...(isEditing && existingFiles.presentationSlides.length > 0 ? [
                                                                    $({
                                                                        tag: 'a',
                                                                        att: {
                                                                            href: existingFiles.presentationSlides[0],
                                                                            target: '_blank',
                                                                            rel: 'noopener noreferrer'
                                                                        },
                                                                        style: {
                                                                            padding: '6px 14px',
                                                                            backgroundColor: '#e8f0fe',
                                                                            borderRadius: '8px',
                                                                            color: '#1a73e8',
                                                                            textDecoration: 'none',
                                                                            fontSize: '12px',
                                                                            fontWeight: '500',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            transition: 'all 0.2s ease'
                                                                        },
                                                                        child: [
                                                                            $({
                                                                                tag: 'span',
                                                                                att: { className: 'fa-solid fa-eye' },
                                                                                style: { fontSize: '11px' }
                                                                            }),
                                                                            $({
                                                                                tag: 'span',
                                                                                text: 'View'
                                                                            })
                                                                        ],
                                                                        event: {
                                                                            type: 'mouseenter',
                                                                            method: (e) => {
                                                                                e.currentTarget.style.backgroundColor = '#d2e3fc'
                                                                            },
                                                                            type2: 'mouseleave',
                                                                            method2: (e) => {
                                                                                e.currentTarget.style.backgroundColor = '#e8f0fe'
                                                                            }
                                                                        }
                                                                    })
                                                                ] : [])
                                                            ]
                                                        }),
                                                        ...(isEditing && existingFiles.presentationSlides.length > 0 ? [
                                                            $({
                                                                tag: 'div',
                                                                style: {
                                                                    marginTop: '8px',
                                                                    padding: '6px 10px',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e8eaed',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                },
                                                                child: [
                                                                    $({
                                                                        tag: 'span',
                                                                        att: { className: 'fa-solid fa-file' },
                                                                        style: { fontSize: '11px', color: '#d24726' }
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        id: 'slides-file-name',
                                                                        text: existingFiles.presentationSlides[0].split('/').pop() || 'Current file',
                                                                        style: {
                                                                            fontSize: '11px',
                                                                            color: '#202124',
                                                                            flex: '1',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        text: '✓',
                                                                        style: {
                                                                            fontSize: '12px',
                                                                            color: '#34a853'
                                                                        }
                                                                    })
                                                                ]
                                                            })
                                                        ] : [
                                                            $({
                                                                tag: 'div',
                                                                id: 'slides-file-name',
                                                                style: {
                                                                    marginTop: '8px',
                                                                    fontSize: '11px',
                                                                    color: '#9aa0a6',
                                                                    fontStyle: 'italic'
                                                                },
                                                                text: 'No file selected'
                                                            })
                                                        ])
                                                    ]
                                                }),

                                                // Column 2: Certificate
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#fafafa',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        border: '1px solid #e8eaed'
                                                    },
                                                    child: [
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
                                                                        width: '32px',
                                                                        height: '32px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#e8f0fe',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-certificate' },
                                                                            style: { color: '#1a73e8', fontSize: '14px' }
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
                                                                            text: 'Certificate',
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
                                                                            text: 'PDF, JPG, PNG',
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: '#5f6368',
                                                                                display: 'block'
                                                                            }
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'file',
                                                                accept: '.pdf,.jpg,.jpeg,.png',
                                                                id: 'certificate-input'
                                                            },
                                                            style: { display: 'none' },
                                                            event: {
                                                                type: 'change',
                                                                method: (e) => {
                                                                    const file = e.target.files[0]
                                                                    if (file) {
                                                                        paperTrailFiles.certificate.push(file)
                                                                        showNotification(`"${file.name}" selected for upload`, 'info')
                                                                        const fileNameDisplay = document.getElementById('certificate-file-name')
                                                                        if (fileNameDisplay) {
                                                                            fileNameDisplay.textContent = file.name
                                                                            fileNameDisplay.style.color = '#1e8e3e'
                                                                        }
                                                                    }
                                                                    e.target.value = ''
                                                                }
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                display: 'flex',
                                                                gap: '8px',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'button',
                                                                    att: { type: 'button' },
                                                                    style: {
                                                                        padding: '6px 14px',
                                                                        backgroundColor: '#e8f0fe',
                                                                        border: '2px dashed #1a73e8',
                                                                        borderRadius: '8px',
                                                                        color: '#1a73e8',
                                                                        fontSize: '12px',
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
                                                                            att: { className: 'fa-solid fa-upload' },
                                                                            style: { fontSize: '11px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Choose File'
                                                                        })
                                                                    ],
                                                                    event: {
                                                                        type: 'click',
                                                                        method: () => {
                                                                            document.getElementById('certificate-input').click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.backgroundColor = '#d2e3fc'
                                                                            e.currentTarget.style.borderColor = '#1a73e8'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.backgroundColor = '#e8f0fe'
                                                                            e.currentTarget.style.borderColor = '#1a73e8'
                                                                        }
                                                                    }
                                                                }),
                                                                ...(isEditing && existingFiles.certificate.length > 0 ? [
                                                                    $({
                                                                        tag: 'a',
                                                                        att: {
                                                                            href: existingFiles.certificate[0],
                                                                            target: '_blank',
                                                                            rel: 'noopener noreferrer'
                                                                        },
                                                                        style: {
                                                                            padding: '6px 14px',
                                                                            backgroundColor: '#e8f0fe',
                                                                            borderRadius: '8px',
                                                                            color: '#1a73e8',
                                                                            textDecoration: 'none',
                                                                            fontSize: '12px',
                                                                            fontWeight: '500',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px',
                                                                            transition: 'all 0.2s ease'
                                                                        },
                                                                        child: [
                                                                            $({
                                                                                tag: 'span',
                                                                                att: { className: 'fa-solid fa-eye' },
                                                                                style: { fontSize: '11px' }
                                                                            }),
                                                                            $({
                                                                                tag: 'span',
                                                                                text: 'View'
                                                                            })
                                                                        ],
                                                                        event: {
                                                                            type: 'mouseenter',
                                                                            method: (e) => {
                                                                                e.currentTarget.style.backgroundColor = '#d2e3fc'
                                                                            },
                                                                            type2: 'mouseleave',
                                                                            method2: (e) => {
                                                                                e.currentTarget.style.backgroundColor = '#e8f0fe'
                                                                            }
                                                                        }
                                                                    })
                                                                ] : [])
                                                            ]
                                                        }),
                                                        ...(isEditing && existingFiles.certificate.length > 0 ? [
                                                            $({
                                                                tag: 'div',
                                                                style: {
                                                                    marginTop: '8px',
                                                                    padding: '6px 10px',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #e8eaed',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                },
                                                                child: [
                                                                    $({
                                                                        tag: 'span',
                                                                        att: { className: 'fa-solid fa-file' },
                                                                        style: { fontSize: '11px', color: '#1a73e8' }
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        id: 'certificate-file-name',
                                                                        text: existingFiles.certificate[0].split('/').pop() || 'Current file',
                                                                        style: {
                                                                            fontSize: '11px',
                                                                            color: '#202124',
                                                                            flex: '1',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        text: '✓',
                                                                        style: {
                                                                            fontSize: '12px',
                                                                            color: '#34a853'
                                                                        }
                                                                    })
                                                                ]
                                                            })
                                                        ] : [
                                                            $({
                                                                tag: 'div',
                                                                id: 'certificate-file-name',
                                                                style: {
                                                                    marginTop: '8px',
                                                                    fontSize: '11px',
                                                                    color: '#9aa0a6',
                                                                    fontStyle: 'italic'
                                                                },
                                                                text: 'No file selected'
                                                            })
                                                        ])
                                                    ]
                                                }),

                                                // Column 3: Event Photos (spans full width)
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        gridColumn: '1 / -1',
                                                        backgroundColor: '#fafafa',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        border: '1px solid #e8eaed'
                                                    },
                                                    child: [
                                                        // Header
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
                                                                            style: { color: '#34a853', fontSize: '16px' }
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
                                                                                fontSize: '13px',
                                                                                fontWeight: '600',
                                                                                margin: 0,
                                                                                display: 'block'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Upload event documentation photos (JPG, PNG, GIF, WEBP)',
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: '#5f6368',
                                                                                display: 'block'
                                                                            }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Multiple',
                                                                    style: {
                                                                        fontSize: '10px',
                                                                        color: '#5f6368',
                                                                        backgroundColor: '#f1f3f4',
                                                                        padding: '3px 10px',
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
                                                                            const container = document.getElementById('photos-preview-container')
                                                                            files.forEach(file => {
                                                                                if (file.type.startsWith('image/')) {
                                                                                    paperTrailFiles.photoDocumentation.push(file)
                                                                                    if (container) {
                                                                                        const totalPhotos = paperTrailFiles.photoDocumentation.length + existingFiles.photoDocumentation.length
                                                                                        addPhotoPreview(file, container, false, null, totalPhotos - 1)
                                                                                    }
                                                                                }
                                                                            })
                                                                            const photoCount = document.getElementById('photo-count')
                                                                            if (photoCount) {
                                                                                photoCount.textContent = `${paperTrailFiles.photoDocumentation.length + existingFiles.photoDocumentation.length}`
                                                                            }
                                                                            showNotification(`${files.length} photo(s) selected`, 'info')
                                                                            e.target.value = ''
                                                                        }
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '2px dashed #dadce0',
                                                                        borderRadius: '10px',
                                                                        padding: '20px',
                                                                        textAlign: 'center',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        marginBottom: '12px'
                                                                    },
                                                                    event: {
                                                                        type: 'click',
                                                                        method: (e) => {
                                                                            const fileInput = document.getElementById('photos-input')
                                                                            if (fileInput) fileInput.click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.borderColor = '#34a853'
                                                                            e.currentTarget.style.backgroundColor = '#e6f4ea'
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
                                                                            style: { fontSize: '28px', color: '#34a853', display: 'block', marginBottom: '8px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'Click to upload photos',
                                                                            style: { fontSize: '13px', color: '#202124', marginBottom: '2px', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'JPG, PNG, GIF, WEBP supported',
                                                                            style: { fontSize: '11px', color: '#5f6368' }
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
                                                                            style: { fontSize: '12px', color: '#5f6368', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { id: 'photo-count' },
                                                                            text: `${existingFiles.photoDocumentation.length}`,
                                                                            style: {
                                                                                fontSize: '12px',
                                                                                color: '#1a73e8',
                                                                                fontWeight: '600',
                                                                                backgroundColor: '#e8f0fe',
                                                                                padding: '2px 12px',
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
                                                                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                                                gap: '8px',
                                                                maxHeight: '280px',
                                                                overflowY: 'auto',
                                                                padding: '2px'
                                                            },
                                                            elementHandler: (el) => {
                                                                el.innerHTML = ''
                                                                if (isEditing && existingFiles.photoDocumentation && existingFiles.photoDocumentation.length > 0) {
                                                                    existingFiles.photoDocumentation.forEach((photoUrl, index) => {
                                                                        addPhotoPreview(null, el, true, photoUrl, index)
                                                                    })
                                                                }
                                                                if ((!isEditing || !existingFiles.photoDocumentation || existingFiles.photoDocumentation.length === 0) && paperTrailFiles.photoDocumentation.length === 0) {
                                                                    const emptyMessage = $({
                                                                        tag: 'div',
                                                                        text: 'No photos uploaded yet',
                                                                        style: {
                                                                            gridColumn: '1 / -1',
                                                                            textAlign: 'center',
                                                                            padding: '20px',
                                                                            color: '#9aa0a6',
                                                                            fontSize: '12px'
                                                                        }
                                                                    })
                                                                    el.appendChild(emptyMessage)
                                                                }
                                                            }
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
                                                marginTop: '8px',
                                                borderTop: '2px solid #e8eaed',
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
                                                    text: isEditing ? 'Update Presentation' : 'Add Presentation',
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
                                            await savePresentationData(isEditing)
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
            const typeSelect = document.getElementById('presentation-type-select')
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
                    tag: 'div',
                    style: {
                        padding: '24px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '2px dashed #e8eaed',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#f1f3f4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-hand-pointer' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#7c3aed',
                                        opacity: 0.6
                                    }
                                })
                            ]
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
                        }),
                        $({
                            tag: 'p',
                            text: 'Choose "Campus" or "Center" from the dropdown above',
                            style: {
                                color: '#9aa0a6',
                                fontSize: '12px',
                                margin: '4px 0 0 0'
                            }
                        })
                    ]
                })
            )
            return
        }

        const options = type === 'campus' ? campuses.filter(c => c !== 'All Campuses') : centers.filter(c => c !== 'All Centers')
        const labelText = type === 'campus' ? 'Select Campus' : 'Select Center'
        const icon = type === 'campus' ? 'fa-solid fa-university' : 'fa-solid fa-building'
        const iconColor = type === 'campus' ? '#7c3aed' : '#1a73e8'
        const bgColor = type === 'campus' ? '#f5f0ff' : '#e8f0fe'

        container.appendChild(
            $({
                tag: 'div',
                style: {
                    animation: 'fadeIn 0.3s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: bgColor,
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
                                            fontSize: '16px',
                                            color: iconColor
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({
                                        tag: 'label',
                                        text: `${labelText} *`,
                                        style: {
                                            display: 'block',
                                            color: '#202124',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            lineHeight: '1.3'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: `Select the ${type === 'campus' ? 'campus' : 'center'} for this record`,
                                        style: {
                                            fontSize: '12px',
                                            color: '#5f6368',
                                            display: 'block'
                                        }
                                    })
                                ]
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
                                att: { className: icon },
                                style: {
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9aa0a6',
                                    fontSize: '14px',
                                    zIndex: '1',
                                    pointerEvents: 'none'
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
                                    padding: '12px 14px 12px 42px',
                                    backgroundColor: '#ffffff',
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
                                    paddingRight: '40px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                },
                                child: [
                                    $({ 
                                        tag: 'option', 
                                        att: { value: '' }, 
                                        text: `-- Select ${type === 'campus' ? 'Campus' : 'Center'} --`,
                                        style: { color: '#9aa0a6' }
                                    }),
                                    ...options.map(opt =>
                                        $({
                                            tag: 'option',
                                            att: { 
                                                value: opt, 
                                                selected: opt === selectedValue 
                                            },
                                            text: opt,
                                            style: { color: '#202124' }
                                        })
                                    )
                                ],
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.target.style.borderColor = iconColor
                                        e.target.style.backgroundColor = '#ffffff'
                                        e.target.style.boxShadow = `0 0 0 4px ${iconColor}15`
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.target.style.borderColor = '#e8eaed'
                                        e.target.style.backgroundColor = '#ffffff'
                                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                                    }
                                }
                            })
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
                                            att: { className: 'fa-solid fa-presentation-screen' },
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
                                            text: 'Summary List of Faculty Research Results Presented',
                                            style: {
                                                color: '#202124',
                                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '18px',
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
                                            text: 'Track and manage faculty research presentations'
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
                                            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
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
                                            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.boxShadow = 'none'
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
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#ffffff'
                                            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
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
                // Add Presentation button
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
                            text: 'Add Presentation'
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

    const createScopeStat = (label, color, className, icon) => {
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
                    style: {
                        display: 'block',
                        fontSize: '24px',
                        fontWeight: '700',
                        color: color,
                        lineHeight: '1.2'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `stat-${label.toLowerCase()} ${className}` },
                            text: '0'
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#5f6368',
                        fontWeight: '500',
                        marginTop: '4px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${icon}` },
                            style: { fontSize: '10px', color: color, opacity: 0.6 }
                        }),
                        $({
                            tag: 'span',
                            text: label
                        })
                    ]
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e8eaed'
            },
            child: [
                // Total Presentations
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden'
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
                        // Gradient accent bar
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '4px',
                                background: 'linear-gradient(90deg, #7c3aed, #4f46e5)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-presentation-screen' },
                                    style: { color: '#ffffff', fontSize: '26px' }
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
                                        color: '#202124',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Presentations',
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
                // Total Presenters
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#00bcd4'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,188,212,0.12)'
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
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '4px',
                                background: 'linear-gradient(90deg, #00bcd4, #26c6da)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #00bcd4, #26c6da)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user-tie' },
                                    style: { color: '#ffffff', fontSize: '26px' }
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
                                        color: '#202124',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Presenters',
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
                // With Awards
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#f9a825'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,168,37,0.12)'
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
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '4px',
                                background: 'linear-gradient(90deg, #f9a825, #ffd54f)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #f9a825, #ffd54f)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-trophy' },
                                    style: { color: '#ffffff', fontSize: '26px' }
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
                                        color: '#202124',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'With Awards',
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
                // Scope Breakdown - spans 2 columns
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        border: '2px solid #e8eaed',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        gridColumn: 'span 2'
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
                                    text: 'Scope Breakdown',
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
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createScopeStat('Local', '#4caf50', 'stat-local', 'fa-map-pin'),
                                createScopeStat('Institutional', '#2196f3', 'stat-institutional', 'fa-building-columns'),
                                createScopeStat('Regional', '#ff9800', 'stat-regional', 'fa-map'),
                                createScopeStat('National', '#7c3aed', 'stat-national', 'fa-flag'),
                                createScopeStat('International', '#e91e63', 'stat-international', 'fa-globe')
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const TableHeader = () => {
        const headers = [
            { key: 'NO.', align: 'center', width: '30px', icon: 'fa-solid fa-hashtag' },
            { key: 'Title of Paper Presented', align: 'left', width: '200px', icon: 'fa-regular fa-file-lines' },
            { key: 'Presenter', align: 'left', width: '150px', icon: 'fa-solid fa-user' },
            { key: 'Researcher/s', align: 'left', width: '180px', icon: 'fa-solid fa-users' },
            { key: 'Date & Venue', align: 'left', width: '180px', icon: 'fa-regular fa-calendar' },
            { key: 'Forum/Symposium Title', align: 'left', width: '200px', icon: 'fa-solid fa-chalkboard-user' },
            { key: 'Sponsoring Agency', align: 'left', width: '150px', icon: 'fa-regular fa-building' },
            { key: 'Award Received', align: 'center', width: '140px', icon: 'fa-solid fa-trophy' },
            { key: 'Scope', align: 'center', width: '120px', icon: 'fa-solid fa-globe' },
            { key: 'Paper Trail', align: 'left', width: '180px', icon: 'fa-solid fa-link' },
            { key: 'Actions', align: 'center', width: '120px', icon: 'fa-solid fa-tools' }
        ]

        const row = $({ tag: 'tr' })

        headers.forEach(({ key, align, width, icon }) => {
            const th = $({
                tag: 'th',
                style: {
                    padding: '14px 16px',
                    textAlign: align,
                    fontSize: '11px',
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
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: align === 'center' ? 'center' : 'flex-start'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: icon },
                                style: {
                                    fontSize: '11px',
                                    opacity: '0.6',
                                    color: '#1a73e8'
                                }
                            }),
                            $({
                                tag: 'span',
                                style: {
                                    whiteSpace: 'pre-line',
                                    lineHeight: '1.3'
                                },
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
                width: 'calc(100% - 48px)', 
                height: 'calc(100% - 340px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderRadius: '12px',
                border: '2px solid #e8eaed',
                margin: '0 24px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                alignSelf: 'center' 
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
                        minWidth: '1600px',
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
            backgroundColor: '#ffffff',
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
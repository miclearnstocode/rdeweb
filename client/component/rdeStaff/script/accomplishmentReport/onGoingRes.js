import { $, Waiting } from "../../../../lib/lib.js"

export const onGoingResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let loadingElement = null
    let monitoringData = []
    let filteredData = []
    let currentQuarter = 'Q1'
    let currentYear = '2026'
    let currentCategory = 'All Categories'
    let currentCenter = 'All Centers'
    let currentCampus = 'All Campuses'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false
    let searchMode = false
    let searchTerm = ''
    let searchCursor = null
    let searchHasMore = true

    // Stats state
    let currentStats = {
        totalOngoing: 0,
        completed: 0,
    }

    // Quarter options
    const quarters = [
        { value: 'Q1', label: 'Q1 (Jan-Mar)' },
        { value: 'Q2', label: 'Q2 (Apr-Jun)' },
        { value: 'Q3', label: 'Q3 (Jul-Sep)' },
        { value: 'Q4', label: 'Q4 (Oct-Dec)' }
    ]

    // Year options
    let years = []

    // Fetch available years from database
    const fetchAvailableYears = async () => {
        try {
            const formData = new FormData()
            formData.append('action', 'fetch_years')
            const response = await fetch('/ongoingresearch', {
                method: 'POST',
                body: formData
            })
            const result = await response.json()
            if (result.success && result.years && result.years.length > 0) {
                years = result.years
                // If currentYear is not in the list, pick the latest
                if (!years.includes(currentYear)) {
                    currentYear = years[0]
                }
                updateYearSelect()
            }
        } catch (error) {
            console.error('Error fetching years:', error)
        }
    }

    const updateYearSelect = () => {
        const yearSelect = document.querySelector('.year-select')
        if (yearSelect) {
            yearSelect.innerHTML = ''
            years.forEach(y => {
                const opt = document.createElement('option')
                opt.value = y
                opt.text = y
                opt.selected = (y === currentYear)
                yearSelect.appendChild(opt)
            })
        }
    }

    // Category options
    const categories = [
        'All Categories',
        'Social Science',
        'Natural / Biological',
        'Food',
        'Development',
        'Extension',
        'Agricultural Machinery',
        'Industrial',
        'Engineering',
        'Information Technology'
    ]

    // Center options
    const centers = [
        'All Centers',
        'Crop Science Research & Developement Center (CSRDC)',
        'Livestock Research & Development Center (LRDC)',
        'Fisheries Research & Development Center (FRDC)',
        'Food and Industrial Technology Research & Development Center (FIRDC)',
        'Social Science Research & Development Center (SSRDC)',
        'Machinery and Agricultural Technology Engineering Center (MATEC)',
        'Coconut Research and Development Center (Coco RDC)',
        'Extension (Extension)'
    ]

    // Campus options
    const campuses = [
        'All Campuses',
        'Roxas City Main',
        'Pilar',
        'Pontevedra',
        'Sigma',
        'Mambusao',
        'Burias',
        'Tapaz',
        'Dayao',
        'Dumarao'
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

    // Fetch monitoring data
    const fetchMonitoringData = async (cursor = null, direction = 'next', search = null, category = null, quarter = null, year = null, center = null, campus = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            await fetchAvailableYears()
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            if (!searchMode) {
                monitoringData = []
                filteredData = []
                hasMore = true
                nextCursor = null
            }
        }

        try {
            const formData = new FormData()

            // Determine which action to use
            if (searchMode || search) {
                formData.append('action', 'search_monitoring')
                if (search) {
                    formData.append('search', search)
                } else if (searchTerm) {
                    formData.append('search', searchTerm)
                }
            } else {
                formData.append('action', 'fetch')
            }

            if (cursor) {
                formData.append('cursor', cursor)
                formData.append('direction', direction)
            }

            // Add filters
            const effectiveQuarter = quarter || currentQuarter
            const effectiveYear = year || currentYear
            const effectiveCategory = category || (currentCategory === 'All Categories' ? null : currentCategory)
            const effectiveCenter = center || (currentCenter === 'All Centers' ? null : currentCenter)
            const effectiveCampus = campus || (currentCampus === 'All Campuses' ? null : currentCampus)

            formData.append('quarter', effectiveQuarter)
            formData.append('year', effectiveYear)
            if (effectiveCategory) formData.append('category', effectiveCategory)
            if (effectiveCenter) formData.append('center', effectiveCenter)
            if (effectiveCampus) formData.append('campus', effectiveCampus)

            const response = await fetch('/ongoingresearch', {
                method: 'POST',
                body: formData
            })

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const text = await response.text()

            // Check if response is empty
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
                    // First page - replace data
                    if (searchMode) {
                        monitoringData = newData
                        filteredData = newData
                        searchCursor = result.pagination?.next_cursor || null
                        searchHasMore = result.pagination?.has_more || false
                    } else {
                        monitoringData = newData
                        filteredData = newData
                        nextCursor = result.pagination?.next_cursor || null
                        hasMore = result.pagination?.has_more || false
                    }

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalOngoing
                        updateStats()
                    }
                } else {
                    if (direction === 'next') {
                        monitoringData = [...monitoringData, ...newData]
                        filteredData = [...filteredData, ...newData]
                    } else {
                        monitoringData = [...newData, ...monitoringData]
                        filteredData = [...newData, ...filteredData]
                    }

                    if (searchMode) {
                        searchCursor = result.pagination?.next_cursor || null
                        searchHasMore = result.pagination?.has_more || false
                    } else {
                        nextCursor = result.pagination?.next_cursor || null
                        hasMore = result.pagination?.has_more || false
                    }
                }

                updateTableWithData()
                updateRecordCount()

                // Maintain scroll position when loading previous
                if (direction === 'prev' && cursor && tableBody?.firstChild) {
                    setTimeout(() => {
                        tableBody.firstChild.scrollIntoView({ behavior: 'auto', block: 'start' })
                    }, 100)
                }
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching monitoring data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
            initialLoadDone = true
        }
    }

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            if (searchMode && searchHasMore && !isLoading && searchCursor) {
                fetchMonitoringData(searchCursor, 'next', searchTerm, null, null, null)
            } else if (!searchMode && hasMore && !isLoading && nextCursor) {
                const category = currentCategory === 'All Categories' ? null : currentCategory
                fetchMonitoringData(nextCursor, 'next', null, category, currentQuarter, currentYear)
            }
        }
    }

    // Update statistics
    const updateStats = () => {
        const ongoingEl = document.getElementById('ongoing-stat-value')
        const completedEl = document.getElementById('completed-stat-value')
        if (ongoingEl) ongoingEl.textContent = currentStats.totalOngoing ?? 0
        if (completedEl) completedEl.textContent = currentStats.completed ?? 0
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


    const showEmptyState = () => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        // Get the actual column count from the table header
        const headerRow = document.querySelector('.summary-accomplishment-container thead tr')
        let columnCount = 12 // Default fallback
        
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
                                // Icon container with multiple icons
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'relative',
                                        width: '120px',
                                        height: '120px',
                                        marginBottom: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-chart-line' },
                                            style: {
                                                fontSize: '80px',
                                                color: '#0d6efd',
                                                opacity: 0.15,
                                                position: 'absolute',
                                                left: '0',
                                                top: '0'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-clipboard-list' },
                                            style: {
                                                fontSize: '50px',
                                                color: '#28a745',
                                                opacity: 0.2,
                                                position: 'absolute',
                                                right: '-10px',
                                                bottom: '-10px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-chart-simple' },
                                            style: {
                                                fontSize: '40px',
                                                color: '#fd7e14',
                                                opacity: 0.2,
                                                position: 'absolute',
                                                left: '-15px',
                                                bottom: '0'
                                            }
                                        })
                                    ]
                                }),
                                // Title
                                $({
                                    tag: 'div',
                                    text: 'No Monitoring Data Found',
                                    style: {
                                        fontSize: '24px',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#212529',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                // Subtitle
                                $({
                                    tag: 'div',
                                    text: 'Click the Actions to edit project monitoring details',
                                    style: {
                                        fontSize: '14px',
                                        color: '#6c757d',
                                        textAlign: 'center',
                                        maxWidth: '500px',
                                        lineHeight: '1.6'
                                    }
                                }),
                                // Helpful tips
                                $({
                                    tag: 'div',
                                    style: {
                                        marginTop: '20px',
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            style: {
                                                display: 'inline-block',
                                                padding: '4px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                color: '#6c757d'
                                            },
                                            text: '💡 Tip: Try adjusting your filters'
                                        }),
                                        $({
                                            tag: 'span',
                                            style: {
                                                display: 'inline-block',
                                                padding: '4px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                color: '#6c757d'
                                            },
                                            text: '📋 Select a different quarter or year'
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    const getQuarterData = (item, quarter) => {
        const quartersMap = item.quarters || {}
        return quartersMap[quarter.toLowerCase()] || {}
    }

    const formatDate = (dateString) => {
        if (!dateString || dateString === '—' || dateString === '0000-00-00') return '—'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return dateString
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    const createDataRow = (item, rowNumber) => {
        const cells = []

        // Fixed columns (6 columns)
        const fixedValues = [
            rowNumber.toString(),
            item.title || '—',
            item.researchers || '—',
            formatDate(item.startDate),
            item.fundSource || '—',
            item.location || '—'
        ]

        fixedValues.forEach((value, index) => {
            const align = index === 0 ? 'center' : (index === 1 || index === 2 || index === 4 || index === 5 ? 'left' : 'center')
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

        // Quarter data - show selected quarter
        const displayQuarters = [currentQuarter.toLowerCase()]
        const subFields = [
            { key: 'completion', align: 'center' },
            { key: 'status', align: 'center' },
            { key: 'remarks', align: 'left' },
            { key: 'measures', align: 'left' }
        ]

        displayQuarters.forEach(quarter => {
            const quarterData = getQuarterData(item, quarter.toUpperCase())

            subFields.forEach(field => {
                let value = '—'
                let cellStyle = {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#212529',
                    border: '1px solid #f1f3f5',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    fontFamily: 'Segoe UI, sans-serif',
                    lineHeight: '1.5',
                    verticalAlign: 'top',
                    textAlign: field.align,
                    backgroundColor: '#ffffff'
                }

                if (field.key === 'completion') {
                    value = quarterData.completion ? `${quarterData.completion}%` : '—'
                    if (quarterData.completion) {
                        const completion = parseFloat(quarterData.completion)
                        if (completion >= 80) {
                            cellStyle.backgroundColor = '#e8f5e9'
                            cellStyle.color = '#2e7d32'
                            cellStyle.fontWeight = '600'
                        } else if (completion >= 50) {
                            cellStyle.backgroundColor = '#fff3e0'
                            cellStyle.color = '#e65100'
                        } else if (completion >= 25) {
                            cellStyle.backgroundColor = '#fce4ec'
                            cellStyle.color = '#c62828'
                        } else if (completion > 0) {
                            cellStyle.backgroundColor = '#f5f5f5'
                            cellStyle.color = '#6c757d'
                        }
                    }
                } else if (field.key === 'status') {
                    value = quarterData.status || '—'
                    if (quarterData.status) {
                        const statusColors = {
                            'Completed': '#2e7d32',
                            'On Track': '#0d6efd',
                            'Delayed': '#c62828',
                            'Not Started': '#6c757d',
                            'On Hold': '#e65100'
                        }
                        cellStyle.color = statusColors[quarterData.status] || '#212529'
                        cellStyle.fontWeight = '600'
                    }
                } else if (field.key === 'remarks') {
                    value = quarterData.remarks || '—'
                } else if (field.key === 'measures') {
                    value = quarterData.measures || '—'
                }

                cells.push($({ tag: 'td', style: cellStyle, text: value }))
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

    const refreshData = async () => {
        monitoringData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        const category = currentCategory === 'All Categories' ? null : currentCategory
        const center = currentCenter === 'All Centers' ? null : currentCenter
        const campus = currentCampus === 'All Campuses' ? null : currentCampus
        await fetchMonitoringData(null, 'next', null, category, currentQuarter, currentYear, center, campus)
    }

    const updateFilterButtons = (activeFilter) => {
        const filterButtons = document.querySelectorAll('.filter-btn')

        filterButtons.forEach(button => {
            const buttonText = button.textContent.trim()

            if (buttonText === activeFilter) {
                button.style.backgroundColor = 'deepskyblue'
                button.style.color = '#fff'
                button.style.opacity = '1'
            } else {
                button.style.backgroundColor = 'transparent'
                button.style.color = '#aaa'
                button.style.opacity = '0.8'
            }
        })
    }

    const updateQuarterButtons = (activeQuarter) => {
        const quarterButtons = document.querySelectorAll('.quarter-btn')
        quarterButtons.forEach(button => {
            const buttonText = button.textContent.trim()
            if (buttonText === activeQuarter) {
                button.style.backgroundColor = 'deepskyblue'
                button.style.color = '#fff'
                button.style.opacity = '1'
            } else {
                button.style.backgroundColor = 'transparent'
                button.style.color = '#aaa'
                button.style.opacity = '0.8'
            }
        })
    }

    const FilterBar = () => {
        return $({
            tag: 'div',
            att: { className: 'filter-bar' },
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
                                    att: { className: 'fa-solid fa-chart-line' },
                                    style: { color: '#0d6efd', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Internally Funded Research Monitoring - On-going',
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
                        // Quarter and Year selects
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '16px',
                                backgroundColor: '#f8f9fa',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                border: '1px solid #dee2e6'
                            },
                            child: [
                                $({
                                    tag: 'select',
                                    att: { className: 'year-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 24px 8px 12px',
                                        color: '#212529',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    },
                                    child: years.map(y =>
                                        $({
                                            tag: 'option',
                                            att: { value: y },
                                            text: y,
                                            selected: y === currentYear
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: async (e) => {
                                            currentYear = e.target.value
                                            await refreshData()
                                        }
                                    }
                                }),
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
                                        maxWidth: '200px',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
                                    },
                                    child: centers.map(c =>
                                        $({
                                            tag: 'option',
                                            att: { value: c },
                                            text: c,
                                            selected: c === currentCenter
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: async (e) => {
                                            const selectedCenter = e.target.value
                                            currentCenter = selectedCenter

                                            const centerToCategory = {
                                                "Crop Science Research & Developement Center (CSRDC)": "Natural / Biological",
                                                "Livestock Research & Development Center (LRDC)": "Natural / Biological",
                                                "Fisheries Research & Development Center (FRDC)": "Natural / Biological",
                                                "Food and Industrial Technology Research & Development Center (FITRDC)": "Food",
                                                "Social Science Research & Development Center (SSRDC)": "Social Science",
                                                "Machinery and Agricultural Technology Engineering Center (MATEC)": "Industrial",
                                                "Coconut Research and Development Center (Coco RDC)": "Natural / Biological",
                                                "Extension (Extension)": "Extension"
                                            }

                                            if (selectedCenter === 'All Centers') {
                                                currentCategory = 'All Categories'
                                            } else if (centerToCategory[selectedCenter]) {
                                                currentCategory = centerToCategory[selectedCenter]
                                            } else {
                                                currentCategory = 'All Categories'
                                            }

                                            await refreshData()
                                            updateFilterButtons(currentCategory)
                                        }
                                    }
                                }),
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
                                        maxWidth: '150px',
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
                                    }
                                })
                            ]
                        }),
                        // Category filter buttons
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#f1f3f5',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #dee2e6'
                            },
                            child: categories.map(cat =>
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn', 'data-filter': cat },
                                    text: cat,
                                    style: {
                                        backgroundColor: cat === currentCategory ? '#0d6efd' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        color: cat === currentCategory ? '#ffffff' : '#495057',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: cat === currentCategory ? '1' : '0.8',
                                        whiteSpace: 'nowrap'
                                    },
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            currentCategory = cat
                                            await refreshData()
                                            updateFilterButtons(cat)
                                        }
                                    },
                                    event2: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            if (cat !== currentCategory) {
                                                e.target.style.backgroundColor = '#e9ecef'
                                                e.target.style.color = '#212529'
                                            }
                                        }
                                    },
                                    event3: {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            if (cat !== currentCategory) {
                                                e.target.style.backgroundColor = 'transparent'
                                                e.target.style.color = '#495057'
                                            }
                                        }
                                    }
                                })
                            )
                        })
                    ]
                }),
                // Search input
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
                                color: '#6c757d',
                                fontSize: '14px',
                                zIndex: '1'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'text',
                                placeholder: 'Search by title or researcher...',
                                className: 'monitoring-search-input'
                            },
                            style: {
                                backgroundColor: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '30px',
                                padding: '10px 16px 10px 42px',
                                color: '#212529',
                                fontSize: '14px',
                                width: '260px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            },
                            event: {
                                type: 'focus',
                                method: (e) => {
                                    e.target.style.borderColor = '#0d6efd'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                }
                            },
                            event2: {
                                type: 'blur',
                                method: (e) => {
                                    e.target.style.borderColor = '#dee2e6'
                                    e.target.style.boxShadow = 'none'
                                }
                            },
                            event3: {
                                type: 'input',
                                method: debounce(async (e) => {
                                    const term = e.target.value.trim()

                                    if (term === '') {
                                        searchMode = false
                                        searchTerm = ''
                                        searchCursor = null
                                        searchHasMore = true
                                        await refreshData()
                                    } else {
                                        searchMode = true
                                        searchTerm = term
                                        searchCursor = null
                                        searchHasMore = true

                                        monitoringData = []
                                        filteredData = []
                                        updateTableWithData()

                                        await fetchMonitoringData(null, 'next', term, null, null, null)
                                    }
                                }, 300)
                            }
                        })
                    ]
                }),
                // Quarter Filter Buttons
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '8px',
                        backgroundColor: '#f1f3f5',
                        padding: '4px',
                        borderRadius: '12px',
                        border: '1px solid #dee2e6'
                    },
                    child: quarters.map(q =>
                        $({
                            tag: 'button',
                            att: { className: 'quarter-btn' },
                            text: q.value,
                            style: {
                                backgroundColor: q.value === currentQuarter ? '#0d6efd' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                color: q.value === currentQuarter ? '#ffffff' : '#495057',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: q.value === currentQuarter ? '1' : '0.8',
                                whiteSpace: 'nowrap'
                            },
                            event: {
                                type: 'click',
                                method: async () => {
                                    currentQuarter = q.value
                                    await refreshData()
                                    updateQuarterButtons(q.value)
                                }
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    if (q.value !== currentQuarter) {
                                        e.target.style.backgroundColor = '#e9ecef'
                                        e.target.style.color = '#212529'
                                    }
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    if (q.value !== currentQuarter) {
                                        e.target.style.backgroundColor = 'transparent'
                                        e.target.style.color = '#495057'
                                    }
                                }
                            }
                        })
                    )
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
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef'
            },
            child: [
                // Total On-Going Projects
                $({
                    tag: 'div',
                    att: { className: 'stat-card-ongoing' },  // ← ADD THIS CLASS
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(13, 110, 253, 0.10)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(13, 110, 253, 0.15)',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-diagram-project' },
                                    style: { color: '#0d6efd', fontSize: '26px', transition: 'all 0.3s ease' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-value', id: 'ongoing-stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#212529',
                                        lineHeight: '1.2',
                                        transition: 'color 0.3s ease'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'On-Going',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        fontWeight: '500',
                                        transition: 'color 0.3s ease'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Completed Research
                $({
                    tag: 'div',
                    att: { className: 'stat-card-completed' },  // ← ADD THIS CLASS
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s ease',
                        cursor: 'default'
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
                                    att: { className: 'fa-solid fa-check-circle' },
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
                                    att: { className: 'stat-value', id: 'completed-stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#212529',
                                        lineHeight: '1.2',
                                        transition: 'color 0.3s ease'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Completed',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        fontWeight: '500',
                                        transition: 'color 0.3s ease'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const DataTable = () => {
        const colgroup = $({ tag: 'colgroup' })
        const fixedWidths = ['50px', '280px', '160px', '90px', '110px', '120px']
        fixedWidths.forEach(w => {
            colgroup.appendChild($({ tag: 'col', style: { width: w } }))
        })
        const subWidths = ['100px', '160px', '220px', '220px']
        subWidths.forEach(w => {
            colgroup.appendChild($({ tag: 'col', style: { width: w } }))
        })
        
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 280px)',
                overflowX: 'auto',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchMonitoringData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: 'max-content',
                        minWidth: '100%',
                        tableLayout: 'fixed',
                        borderCollapse: 'collapse'
                    },
                    child: [
                        colgroup,
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

    const TableHeader = () => {
        const row1 = $({ tag: 'tr' })

        const fixedHeaders = [
            'NO.',
            'PROGRAM/PROJECT/STUDY TITLE',
            'RESEARCHER/S',
            'START DATE',
            'FUND SOURCE',
            'LOCATION',
            '% of Completion',
            'Status',
            'Remarks',
            'Measures'
        ]

        fixedHeaders.forEach(header => {
            const isCenter = ['NO.', '% of Completion', 'Status'].includes(header)

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
                    borderBottom: '2px solid #dee2e6',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    position: 'sticky',
                    top: '0',
                    zIndex: '10'
                }
            })
            row1.appendChild(th)
        })

        return $({
            tag: 'thead',
            child: [row1]
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

    // Debounce helper
    function debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    return $({
        tag: 'div',
        att: { className: 'monitoring-container' },
        externalStyle: '/client/component/rdeStaff/style/accomplishment.css',
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

export default onGoingResearch
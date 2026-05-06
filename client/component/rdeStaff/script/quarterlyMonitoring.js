import { $, Waiting } from "../../../lib/lib.js"
import { Publication } from "./publication.js";
import { PresentationResearch } from "./presentationResearch.js";
import { PatentUM } from "./patentUM.js";

export const QuarterlyMonitoringComponent = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
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

    // Stats state - Updated to match onGoingResearch structure
    let currentStats = {
        totalOngoing: 0,
        completed: 0,
        publications: 0,
        presentations: 0,
        assets: 0,
        collaborations: 0,
        activityConducted: 0
    }

    // Quarter options
    const quarters = [
        { value: 'Q1', label: 'Q1 (Jan-Mar)' },
        { value: 'Q2', label: 'Q2 (Apr-Jun)' },
        { value: 'Q3', label: 'Q3 (Jul-Sep)' },
        { value: 'Q4', label: 'Q4 (Oct-Dec)' }
    ]

    // Year options
    let years = ['2023', '2024', '2025', '2026']

    // Fetch available years from database
    const fetchAvailableYears = async () => {
        try {
            const formData = new FormData()
            formData.append('action', 'fetch_years')
            const response = await fetch('/quarterlyMonitoring', {
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

            const response = await fetch('/quarterlyMonitoring', {
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

                    // Update stats - include both summary and ongoing/completed
                    if (result.summary) {
                        currentStats = {
                            ...currentStats,
                            publications: result.summary.publications || 0,
                            presentations: result.summary.presentations || 0,
                            assets: result.summary.assets || 0,
                            collaborations: result.summary.collaborations || 0,
                            activityConducted: result.summary.activityConducted || 0,
                            totalOngoing: result.summary.totalOngoing || 0,
                            completed: result.summary.completed || 0
                        }
                        totalCount = result.summary.totalOngoing || 0
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

    // Update statistics - Updated to handle both stat cards
    const updateStats = () => {
        if (!mainContainer) return

        // Update the 5 main stat cards (publications, presentations, assets, collaborations, activityConducted)
        const statValues = mainContainer.querySelectorAll('.stat-value')
        if (statValues.length >= 5) {
            statValues[0].textContent = currentStats.publications || 0
            statValues[1].textContent = currentStats.presentations || 0
            statValues[2].textContent = currentStats.assets || 0
            statValues[3].textContent = currentStats.collaborations || 0
            statValues[4].textContent = currentStats.activityConducted || 0
        }

        // Update the ongoing and completed stat cards (using IDs)
        const ongoingEl = document.getElementById('ongoing-stat-value')
        const completedEl = document.getElementById('completed-stat-value')
        if (ongoingEl) ongoingEl.textContent = currentStats.totalOngoing ?? 0
        if (completedEl) completedEl.textContent = currentStats.completed ?? 0
    }

    // Update record count
    const updateRecordCount = () => {
        if (!mainContainer) return
        const recordCount = mainContainer.querySelector('.record-count')
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
                        marginBottom: '24px',
                        position: 'absolute',
                        left: '60%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
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
                                color: 'deepskyblue',
                                opacity: 0.3,
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
                                color: '#4caf50',
                                opacity: 0.4,
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
                    text: 'No Monitoring Data Found',
                    style: {
                        fontSize: '24px',
                        marginBottom: '12px',
                        fontWeight: '600',
                        color: '#fff',
                        letterSpacing: '0.5px',
                        position: 'absolute',
                        left: '60%',
                        top: '70%',
                        transform: 'translate(-50%, -50%)'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click the Actions to edit project monitoring details',
                    style: {
                        fontSize: '14px',
                        opacity: 0.7,
                        marginBottom: '30px',
                        textAlign: 'center',
                        position: 'absolute',
                        left: '60%',
                        top: '75%',
                        transform: 'translate(-50%, -50%)'
                    }
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    // Get quarter data for a specific quarter
    const getQuarterData = (item, quarter) => {
        const quartersMap = item.quarters || {}
        return quartersMap[quarter.toLowerCase()] || {}
    }

    // Format date to words (e.g., April 30, 2026)
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

    // Create data row - SIMPLE VERSION
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
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    fontFamily: 'Segoe UI, sans-serif',
                    lineHeight: '1.4',
                    verticalAlign: 'top',
                    textAlign: field.align
                }

                if (field.key === 'completion') {
                    value = quarterData.completion ? `${quarterData.completion}%` : '—'
                    if (quarterData.completion) {
                        const completion = parseFloat(quarterData.completion)
                        if (completion >= 80) {
                            cellStyle.backgroundColor = 'rgba(76, 175, 80, 0.15)'
                            cellStyle.color = '#4caf50'
                            cellStyle.fontWeight = '500'
                        } else if (completion >= 50) {
                            cellStyle.backgroundColor = 'rgba(255, 152, 0, 0.15)'
                            cellStyle.color = '#ff9800'
                        } else if (completion >= 25) {
                            cellStyle.backgroundColor = 'rgba(233, 30, 99, 0.15)'
                            cellStyle.color = '#e91e63'
                        } else if (completion > 0) {
                            cellStyle.backgroundColor = 'rgba(158, 158, 158, 0.15)'
                            cellStyle.color = '#aaa'
                        }
                    }
                } else if (field.key === 'status') {
                    value = quarterData.status || '—'
                    if (quarterData.status) {
                        const statusColors = {
                            'Completed': '#4caf50',
                            'On Track': 'deepskyblue',
                            'Delayed': '#e91e63',
                            'Not Started': '#aaa',
                            'On Hold': '#ff9800'
                        }
                        cellStyle.color = statusColors[quarterData.status] || '#ddd'
                        cellStyle.fontWeight = '500'
                    }
                } else if (field.key === 'remarks') {
                    value = quarterData.remarks || '—'
                } else if (field.key === 'measures') {
                    value = quarterData.measures || '—'
                }

                cells.push($({ tag: 'td', style: cellStyle, text: value }))
            })
        })

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

        // Remarks / Official Completion button cell
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'middle'
                },
                child: [
                    $({
                        tag: 'button',
                        text: item.readyForSymposium ? 'Ready for Official Completion' : 'Mark as Ready',
                        style: {
                            padding: '6px 12px',
                            backgroundColor: item.readyForSymposium ? '#4caf50' : 'transparent',
                            border: item.readyForSymposium ? 'none' : '1px solid #4caf50',
                            borderRadius: '4px',
                            color: item.readyForSymposium ? '#fff' : '#4caf50',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                markReadyForSymposium(item)
                            }
                        }
                    })
                ]
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
                            openEditModal(item)
                        }
                    }
                })
            ]
        })
    }

    // Mark ready for symposium
    const markReadyForSymposium = async (item) => {
        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'markReadyForSymposium')
            formData.append('projectId', item.id)
            formData.append('isReady', !item.readyForSymposium)

            const response = await fetch('/quarterlyMonitoring', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                // Refresh data
                await refreshData()
                showNotification('Symposium status updated', 'success')
            } else {
                showNotification('Failed to update symposium status', 'error')
            }
        } catch (error) {
            console.error('Error updating symposium status:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Open edit modal
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

    // Render modal
    const renderModal = (item) => {
        if (modalElement) {
            modalElement.remove()
        }

        // Get current quarter data
        const currentQData = getQuarterData(item, currentQuarter)

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
                        width: '700px',
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
                                    text: `Edit Quarterly Report - ${currentQuarter} ${currentYear}`,
                                    style: {
                                        margin: '0',
                                        fontSize: '18px',
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
                                    // Hover effect for close button
                                    externalStyle: null,
                                    elementHandler: (el) => {
                                        el.addEventListener('mouseenter', () => {
                                            el.style.color = '#fff';
                                            el.style.backgroundColor = '#3a3a3a';
                                        });
                                        el.addEventListener('mouseleave', () => {
                                            el.style.color = '#888';
                                            el.style.backgroundColor = 'transparent';
                                        });
                                    }
                                })
                            ]
                        }),
                        // Modal body
                        $({
                            tag: 'form',
                            att: { id: 'monitoring-form' },
                            style: {
                                padding: '24px'
                            },
                            child: [
                                // Hidden fields
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'hidden',
                                        name: 'project_id',
                                        value: item.id || ''
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'hidden',
                                        name: 'quarter',
                                        value: currentQuarter
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'hidden',
                                        name: 'year',
                                        value: currentYear
                                    }
                                }),

                                // Project Title (readonly)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Project Title',
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
                                                value: item.title || '',
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

                                // Researchers (readonly)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Researchers',
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
                                                value: item.researchers || '',
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

                                // Start Date
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Start Date',
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
                                                name: 'startDate',
                                                value: item.startDate || ''
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
                                                transition: 'all 0.2s ease'
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // Fund Source
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Fund Source',
                                            style: {
                                                display: 'block',
                                                marginBottom: '10px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                gap: '20px',
                                                marginBottom: '12px',
                                                flexWrap: 'wrap'
                                            },
                                            child: ['Campus', 'University', 'Others'].map(type => {
                                                const isOthers = type === 'Others'
                                                const currentValue = item.fundSource && item.fundSource !== '—' ? item.fundSource : ''
                                                const isChecked = isOthers
                                                    ? (currentValue && currentValue !== 'Campus' && currentValue !== 'University')
                                                    : (currentValue === type)

                                                return $({
                                                    tag: 'label',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        transition: 'all 0.2s ease',
                                                        backgroundColor: isChecked ? 'rgba(0, 191, 255, 0.2)' : 'transparent'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                width: '18px',
                                                                height: '18px',
                                                                borderRadius: '50%',
                                                                border: `2px solid ${isChecked ? 'deepskyblue' : '#666'}`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            child: isChecked ? [
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        width: '10px',
                                                                        height: '10px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: 'deepskyblue'
                                                                    }
                                                                })
                                                            ] : []
                                                        }),
                                                        $({ tag: 'span', text: type }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'radio',
                                                                name: 'fundSourceType',
                                                                value: type,
                                                                checked: isChecked,
                                                                style: 'display: none'
                                                            },
                                                            event: {
                                                                type: 'change',
                                                                method: (e) => {
                                                                    const othersInput = document.getElementById('fund-source-others')
                                                                    const hiddenInput = document.getElementById('fund-source-hidden')
                                                                    // Update radio button visual styling
                                                                    const allLabels = document.querySelectorAll('#monitoring-form label[style*="cursor: pointer"]')
                                                                    allLabels.forEach(label => {
                                                                        label.style.backgroundColor = 'transparent'
                                                                        const radioDiv = label.querySelector('div:first-child')
                                                                        if (radioDiv) {
                                                                            radioDiv.style.borderColor = '#666'
                                                                            const innerDot = radioDiv.querySelector('div')
                                                                            if (innerDot) innerDot.remove()
                                                                        }
                                                                    })
                                                                    // Style the selected radio
                                                                    const parentLabel = e.target.closest('label')
                                                                    if (parentLabel) {
                                                                        parentLabel.style.backgroundColor = 'rgba(0, 191, 255, 0.2)'
                                                                        const radioDiv = parentLabel.querySelector('div:first-child')
                                                                        if (radioDiv) {
                                                                            radioDiv.style.borderColor = 'deepskyblue'
                                                                            if (!radioDiv.querySelector('div')) {
                                                                                const dot = document.createElement('div')
                                                                                dot.style.cssText = 'width: 10px; height: 10px; border-radius: 50%; background-color: deepskyblue;'
                                                                                radioDiv.appendChild(dot)
                                                                            }
                                                                        }
                                                                    }
                                                                    if (e.target.value === 'Others') {
                                                                        othersInput.style.display = 'block'
                                                                        hiddenInput.value = othersInput.value
                                                                    } else {
                                                                        othersInput.style.display = 'none'
                                                                        hiddenInput.value = e.target.value
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    ],
                                                    elementHandler: (el) => {
                                                        el.addEventListener('mouseenter', () => {
                                                            if (!el.querySelector('input').checked) {
                                                                el.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                                            }
                                                        });
                                                        el.addEventListener('mouseleave', () => {
                                                            if (!el.querySelector('input').checked) {
                                                                el.style.backgroundColor = 'transparent';
                                                            }
                                                        });
                                                    }
                                                })
                                            })
                                        }),
                                        // Hidden input to hold the actual value sent to server
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'hidden',
                                                id: 'fund-source-hidden',
                                                name: 'fundSource',
                                                value: item.fundSource && item.fundSource !== '—' ? item.fundSource : ''
                                            }
                                        }),
                                        // Conditional text input for "Others"
                                        $({
                                            tag: 'input',
                                            att: {
                                                id: 'fund-source-others',
                                                type: 'text',
                                                placeholder: 'Please specify...',
                                                value: (item.fundSource && item.fundSource !== '—' && item.fundSource !== 'Campus' && item.fundSource !== 'University') ? item.fundSource : ''
                                            },
                                            style: {
                                                display: (item.fundSource && item.fundSource !== '—' && item.fundSource !== 'Campus' && item.fundSource !== 'University') ? 'block' : 'none',
                                                width: '100%',
                                                padding: '10px',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                outline: 'none',
                                                marginTop: '5px',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'input',
                                                method: (e) => {
                                                    document.getElementById('fund-source-hidden').value = e.target.value
                                                }
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // Location
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Location',
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
                                                name: 'location',
                                                placeholder: 'Enter location...',
                                                value: item.location && item.location !== '—' ? item.location : ''
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
                                                transition: 'all 0.2s ease'
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // % of Completion
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: '% of Completion',
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
                                                name: 'completion',
                                                step: '0.01',
                                                min: '0',
                                                max: '100',
                                                placeholder: '0.00',
                                                value: currentQData.completion || ''
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
                                                transition: 'all 0.2s ease'
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // Status
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Status',
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
                                                name: 'status'
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
                                                transition: 'all 0.2s ease'
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Status --' }),
                                                $({ tag: 'option', att: { value: 'Not Started' }, text: 'Not Started' }),
                                                $({ tag: 'option', att: { value: 'On Track' }, text: 'On Track' }),
                                                $({ tag: 'option', att: { value: 'Delayed' }, text: 'Delayed' }),
                                                $({ tag: 'option', att: { value: 'On Hold' }, text: 'On Hold' }),
                                                $({ tag: 'option', att: { value: 'Completed' }, text: 'Completed' })
                                            ],
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // Remarks (Problems Encountered)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Remarks (Problems Encountered)',
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
                                                name: 'remarks',
                                                placeholder: 'Enter any problems encountered...',
                                                rows: '3'
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
                                                fontFamily: 'inherit',
                                                transition: 'all 0.2s ease'
                                            },
                                            text: currentQData.remarks || '',
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
                                            }
                                        })
                                    ]
                                }),

                                // Preventive/Corrective Measures
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Preventive/Corrective Measures',
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
                                                name: 'measures',
                                                placeholder: 'Enter preventive or corrective measures...',
                                                rows: '3'
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
                                                fontFamily: 'inherit',
                                                transition: 'all 0.2s ease'
                                            },
                                            text: currentQData.measures || '',
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                });
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
                                                method: closeModal
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.borderColor = 'deepskyblue';
                                                    el.style.color = 'deepskyblue';
                                                    el.style.backgroundColor = 'rgba(0, 191, 255, 0.05)';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.borderColor = '#444';
                                                    el.style.color = '#aaa';
                                                    el.style.backgroundColor = 'transparent';
                                                });
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            att: { type: 'button' },
                                            text: 'Save Changes',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: 'deepskyblue',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: saveMonitoringData
                                            },
                                            elementHandler: (el) => {
                                                el.addEventListener('mouseenter', () => {
                                                    el.style.backgroundColor = '#00bfff';
                                                    el.style.transform = 'translateY(-1px)';
                                                    el.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                                                });
                                                el.addEventListener('mouseleave', () => {
                                                    el.style.backgroundColor = 'deepskyblue';
                                                    el.style.transform = 'translateY(0)';
                                                    el.style.boxShadow = 'none';
                                                });
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

        // Set status select value
        setTimeout(() => {
            const statusSelect = document.querySelector('select[name="status"]')
            if (statusSelect && currentQData.status) {
                statusSelect.value = currentQData.status
            }
        }, 100)
    }

    // Save monitoring data
    const saveMonitoringData = async () => {
        const form = document.getElementById('monitoring-form')
        const formData = new FormData(form)
        formData.append('action', 'save')

        showLoading()
        try {
            const response = await fetch('/quarterlyMonitoring', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification('Monitoring data saved successfully', 'success')
                await refreshData()
            } else {
                showNotification('Error saving monitoring data', 'error')
            }
        } catch (error) {
            console.error('Error saving monitoring data:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Refresh data
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

    // Update filter buttons styles
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

    // Update quarter buttons styles
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

    // Filter bar component
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
                                    att: { className: 'fa-solid fa-chart-line' },
                                    style: { color: 'deepskyblue', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Quarterly Monitoring',
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
                        // Quarter and Year selects
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

                                $({
                                    tag: 'select',
                                    att: { className: 'year-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none'
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
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '200px'
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

                                            // Mapping for UI highlight
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

                                            // Update category active state based on center
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
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '150px'
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
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #444'
                            },
                            child: categories.map(cat =>
                                $({
                                    tag: 'button',
                                    att: { className: 'filter-btn', 'data-filter': cat },
                                    text: cat,
                                    style: {
                                        backgroundColor: cat === currentCategory ? 'deepskyblue' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        color: cat === currentCategory ? '#fff' : '#aaa',
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
                                    }
                                })
                            )
                        })
                    ]
                }),
                // Search input only
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
                                placeholder: 'Search by title or researcher...',
                                className: 'monitoring-search-input'
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
                        backgroundColor: '#333',
                        padding: '4px',
                        borderRadius: '12px',
                        border: '1px solid #444'
                    },
                    child: quarters.map(q =>
                        $({
                            tag: 'button',
                            att: { className: 'quarter-btn' },
                            text: q.value,
                            style: {
                                backgroundColor: q.value === currentQuarter ? 'deepskyblue' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                color: q.value === currentQuarter ? '#fff' : '#aaa',
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
                            }
                        })
                    )
                })
            ]
        })
    }

    // Statistics cards - Combined: 5 main stats + Ongoing & Completed
    const StatsCards = () => {
        // Helper function to convert hex color to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
        };

        // Helper function to open a component in a modal
        const openComponentModal = (title, ComponentFn) => {
            const modal = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '5000',
                    fontFamily: 'Segoe UI, sans-serif',
                    backdropFilter: 'blur(8px)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#1a1a1a',
                            borderRadius: '20px',
                            width: '95vw',
                            height: '92vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                            border: '1px solid #333'
                        },
                        child: [
                            // Header
                            $({
                                tag: 'div',
                                style: {
                                    padding: '18px 28px',
                                    borderBottom: '1px solid #333',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: '#222'
                                },
                                child: [
                                    $({
                                        tag: 'h2',
                                        text: title,
                                        style: {
                                            margin: '0',
                                            fontSize: '22px',
                                            fontWeight: '600',
                                            color: '#fff',
                                            letterSpacing: '-0.5px'
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        style: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: 'none',
                                            color: '#aaa',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        },
                                        child: [$({ tag: 'i', att: { className: 'fa-solid fa-xmark' }, style: { fontSize: '20px' } })],
                                        event: {
                                            type: 'click',
                                            method: () => modal.remove()
                                        },
                                        event2: {
                                            type: 'mouseenter',
                                            method: (e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(244, 67, 54, 0.2)'
                                                e.currentTarget.style.color = '#f44336'
                                            }
                                        },
                                        event3: {
                                            type: 'mouseleave',
                                            method: (e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                                                e.currentTarget.style.color = '#aaa'
                                            }
                                        }
                                    })
                                ]
                            }),
                            // Content
                            $({
                                tag: 'div',
                                style: {
                                    flex: '1',
                                    overflow: 'hidden',
                                    backgroundColor: '#2a2a2a'
                                },
                                child: [ComponentFn()]
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modal)
        }

        // Helper function to create a stat card with hover effects
        const createStatCard = (iconClass, iconColor, label, onClick = null, value = '0', id = null) => {
            // Convert color to RGB values for rgba manipulation
            const rgbValues = hexToRgb(iconColor);

            const card = $({
                tag: 'div',
                att: { className: 'stat-card' },
                style: {
                    backgroundColor: '#2d2d2d',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: '1px solid #444',
                    cursor: onClick ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                },
                child: [
                    // Background glow effect
                    $({
                        tag: 'div',
                        att: { className: 'card-glow' },
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            background: `radial-gradient(circle at 70% 30%, rgba(${rgbValues}, 0.08) 0%, transparent 70%)`,
                            opacity: '0',
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none'
                        }
                    }),
                    // Icon container
                    $({
                        tag: 'div',
                        att: { className: 'stat-icon-container' },
                        style: {
                            width: '54px',
                            height: '54px',
                            borderRadius: '16px',
                            backgroundColor: `rgba(${rgbValues}, 0.15)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid rgba(${rgbValues}, 0.3)`,
                            transition: 'all 0.3s ease',
                            flexShrink: '0'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: iconClass },
                                style: {
                                    color: iconColor,
                                    fontSize: '26px',
                                    transition: 'all 0.3s ease'
                                }
                            })
                        ]
                    }),
                    // Text content
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                            minWidth: '0'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'stat-value', id: id },
                                text: value,
                                style: {
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    lineHeight: '1.2',
                                    transition: 'color 0.3s ease'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'stat-label' },
                                text: label,
                                style: {
                                    fontSize: '13px',
                                    color: '#aaa',
                                    fontWeight: '500',
                                    transition: 'color 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }
                            })
                        ]
                    })
                ]
            });

            if (onClick) {
                card.addEventListener('click', onClick);
            }

            // Add hover effects only if clickable or always for visual feedback
            card.addEventListener('mouseenter', function (e) {
                card.style.transform = 'translateY(-4px)';
                card.style.borderColor = iconColor;
                card.style.boxShadow = `0 8px 24px rgba(${rgbValues}, 0.15)`;
                card.style.backgroundColor = '#363636';

                const glow = card.querySelector('.card-glow');
                if (glow) glow.style.opacity = '1';

                const iconContainer = card.querySelector('.stat-icon-container');
                if (iconContainer) {
                    iconContainer.style.transform = 'scale(1.1)';
                    iconContainer.style.backgroundColor = `rgba(${rgbValues}, 0.25)`;
                    iconContainer.style.borderColor = `rgba(${rgbValues}, 0.5)`;

                    const icon = iconContainer.querySelector('span');
                    if (icon) {
                        icon.style.transform = 'scale(1.15) rotate(5deg)';
                    }
                }

                const statValue = card.querySelector('.stat-value');
                if (statValue) statValue.style.color = iconColor;

                const statLabel = card.querySelector('.stat-label');
                if (statLabel) statLabel.style.color = '#ccc';
            });

            card.addEventListener('mouseleave', function (e) {
                card.style.transform = 'translateY(0)';
                card.style.borderColor = '#444';
                card.style.boxShadow = 'none';
                card.style.backgroundColor = '#2d2d2d';

                const glow = card.querySelector('.card-glow');
                if (glow) glow.style.opacity = '0';

                const iconContainer = card.querySelector('.stat-icon-container');
                if (iconContainer) {
                    iconContainer.style.transform = 'scale(1)';
                    iconContainer.style.backgroundColor = `rgba(${rgbValues}, 0.15)`;
                    iconContainer.style.borderColor = `rgba(${rgbValues}, 0.3)`;

                    const icon = iconContainer.querySelector('span');
                    if (icon) {
                        icon.style.transform = 'scale(1) rotate(0deg)';
                    }
                }

                const statValue = card.querySelector('.stat-value');
                if (statValue) statValue.style.color = '#fff';

                const statLabel = card.querySelector('.stat-label');
                if (statLabel) statLabel.style.color = '#aaa';
            });

            return card;
        };

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
                // Total On-Going Projects
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
                                    att: { className: 'fa-solid fa-diagram-project' },
                                    style: { color: 'deepskyblue', fontSize: '26px' }
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
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'On-Going',
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
                // Completed Research
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
                                    att: { className: 'fa-solid fa-check-circle' },
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
                                    att: { className: 'stat-value', id: 'completed-stat-value' },
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
                                    text: 'Completed',
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
                // Publications
                createStatCard('fa-solid fa-book-open', '#ff9800', 'Publications', () => openComponentModal('Publications', Publication), currentStats.publications || 0),

                // Presentations
                createStatCard('fa-solid fa-chalkboard-user', '#e91e63', 'Presentations', () => openComponentModal('Presentations', PresentationResearch), currentStats.presentations || 0),

                // IP Assets
                createStatCard('fa-solid fa-trophy', '#9c27b0', 'IP Assets', () => openComponentModal('IP Assets', PatentUM), currentStats.assets || 0),

                // Collaborations
                createStatCard('fa-solid fa-handshake', '#009688', 'Collaborations', null, currentStats.collaborations || 0),

                // Research Activity Conducted
                createStatCard('fa-solid fa-flask', '#3f51b5', 'Research Activity Conducted', null, currentStats.activityConducted || 0)
            ]
        });
    };

    // Main table component
    const DataTable = () => {
        // Create colgroup
        const colgroup = $({ tag: 'colgroup' })

        // 6 fixed columns
        const fixedWidths = ['50px', '280px', '160px', '90px', '110px', '120px']
        fixedWidths.forEach(w => {
            colgroup.appendChild($({ tag: 'col', style: { width: w } }))
        })

        // 1 quarter × 4 sub-columns = 4 columns
        const subWidths = ['100px', '160px', '220px', '220px']
        subWidths.forEach(w => {
            colgroup.appendChild($({ tag: 'col', style: { width: w } }))
        })

        // 1 actions column
        colgroup.appendChild($({ tag: 'col', style: { width: '80px' } }))

        // 1 remarks/completion column
        colgroup.appendChild($({ tag: 'col', style: { width: '180px' } }))

        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 280px)',
                overflowX: 'auto',
                overflowY: 'auto',
                backgroundColor: '#2a2a2a',
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
        // ROW 1 - Single row header
        const row1 = $({ tag: 'tr' })

        // All table headers
        const fixedHeaders = [
            'NO.',
            'PROGRAM/PROJECT/STUDY TITLE\n(under each program, indicate project components, & under each project, indicate study components)',
            'RESEARCHER/S',
            'START DATE',
            'FUND SOURCE',
            'LOCATION',
            '% of Completion',
            'Status of the program/project/study',
            'Remarks (Problems Encountered)',
            'Preventive/Corrective Measures to address problems',
            'ACTIONS',
            'REMARKS / OFFICIAL COMPLETION'
        ]

        fixedHeaders.forEach(header => {
            const isCenter = ['NO.', '% of Completion', 'Status of the program/project/study', 'ACTIONS', 'REMARKS / OFFICIAL COMPLETION'].includes(header)

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
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle'
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

    // Main container
    return $({
        tag: 'div',
        att: { className: 'monitoring-container' },
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

export default QuarterlyMonitoringComponent
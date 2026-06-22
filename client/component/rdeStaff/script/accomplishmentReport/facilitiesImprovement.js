import { $, Waiting } from "../../../../lib/lib.js"

export const facilitiesImprovement = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let facilitiesData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let currentFundingType = 'All Funding'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    // Stats state
    let currentStats = {
        totalFacilities: 0,
        totalEquipment: 0,
        internalFunding: 0,
        externalFunding: 0,
        totalUnits: 0
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

    // Funding type options
    const fundingTypes = [
        'All Funding',
        'Internal',
        'External'
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

    const fetchFacilitiesData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            facilitiesData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_facilities')

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
            if (currentFundingType !== 'All Funding') {
                formData.append('fundingType', currentFundingType)
            }

            const response = await fetch('/facilitiesImprovement', {
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
                    facilitiesData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalFacilities
                        updateStats()
                    }
                } else {
                    facilitiesData = [...facilitiesData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                applyFundingFilter()
                updateRecordCount()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching facilities data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    const applyFundingFilter = () => {
        if (currentFundingType === 'All Funding') {
            filteredData = [...facilitiesData]
        } else {
            filteredData = facilitiesData.filter(item => item.fundingType === currentFundingType)
        }
        updateTableWithData()
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchFacilitiesData(nextCursor)
        }
    }

    const updateStats = () => {
        const statTotalFacilities = document.querySelector('.stat-total-facilities')
        const statTotalEquipment = document.querySelector('.stat-total-equipment')
        const statInternalFunding = document.querySelector('.stat-internal-funding')
        const statExternalFunding = document.querySelector('.stat-external-funding')
        const statTotalUnits = document.querySelector('.stat-total-units')

        if (statTotalFacilities) statTotalFacilities.textContent = currentStats.totalFacilities
        if (statTotalEquipment) statTotalEquipment.textContent = currentStats.totalEquipment
        if (statInternalFunding) statInternalFunding.textContent = currentStats.internalFunding
        if (statExternalFunding) statExternalFunding.textContent = currentStats.externalFunding
        if (statTotalUnits) statTotalUnits.textContent = currentStats.totalUnits
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
        const headerRow = document.querySelector('.facilities-improvement-container thead tr')
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
                                position: 'relative',
                                top: '50%',
                                transform: 'translateY(-50%)'
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
                                            att: { className: 'fa-solid fa-microscope' },
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
                                    text: 'No Facilities & Equipment Records Found',
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
                                    text: 'Click "Add Facility/Equipment" to add facilities and equipment records',
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
                                        className: 'btn-add-facility'
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
                                            text: 'Add Facility/Equipment'
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

    const renderLabTypeBadge = (labType) => {
        if (!labType || labType === '—') return '—'

        const colors = [
            { bg: '#e8f4fd', color: '#0066cc' },
            { bg: '#e8edfd', color: '#4a6cf7' },
            { bg: '#ede8fd', color: '#7c3aed' },
            { bg: '#e8f5e9', color: '#2d7d46' },
            { bg: '#fef3e8', color: '#cc7b00' },
            { bg: '#fde8e8', color: '#cc3333' }
        ]

        const hash = labType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const colorIndex = hash % colors.length
        const selectedColor = colors[colorIndex]

        return $({
            tag: 'span',
            style: {
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                color: selectedColor.color,
                border: `1px solid ${selectedColor.bg}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
            },
            text: labType,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = selectedColor.bg
                    e.currentTarget.style.transform = 'scale(1.05)'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.transform = 'scale(1)'
                }
            }
        })
    }

    const renderFundingBadge = (fundingType) => {
        if (!fundingType || fundingType === '—') return '—'

        const isInternal = fundingType === 'Internal'
        const colors = isInternal
            ? { bg: '#e8f5e9', color: '#2d7d46', border: '#a5d6a7', hoverBg: '#c8e6c9' }
            : { bg: '#e3f2fd', color: '#0d47a1', border: '#90caf9', hoverBg: '#bbdefb' }

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
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: colors.bg,
                        flexShrink: 0,
                        transition: 'all 0.25s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${isInternal ? 'fa-building' : 'fa-globe'}` },
                            style: { 
                                fontSize: '10px',
                                color: colors.color,
                                transition: 'all 0.25s ease'
                            }
                        })
                    ]
                }),
                $({ 
                    tag: 'span', 
                    text: fundingType,
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

    const renderFacilities = (facilities) => {
        if (!facilities || facilities === '—') return '—'

        let facilityList = []
        try {
            if (typeof facilities === 'string') {
                facilityList = JSON.parse(facilities)
            } else if (Array.isArray(facilities)) {
                facilityList = facilities
            } else {
                return facilities
            }
        } catch (e) {
            return facilities
        }

        if (facilityList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '4px 0'
            },
            child: facilityList.map((facility, idx) => {
                const name = typeof facility === 'string' ? facility : facility.name || 'Unknown'
                const units = typeof facility === 'object' ? facility.units : ''
                const description = typeof facility === 'object' ? facility.description : ''

                // Generate a consistent color based on facility name
                const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                const colors = [
                    { border: '#4a6cf7', bg: '#f0f4ff' },
                    { border: '#7c3aed', bg: '#f5f0ff' },
                    { border: '#00838f', bg: '#f0fafc' },
                    { border: '#2d7d46', bg: '#f0faf0' },
                    { border: '#cc7b00', bg: '#fff8f0' },
                    { border: '#cc3333', bg: '#fff0f0' }
                ]
                const colorIndex = hash % colors.length
                const color = colors[colorIndex]

                return $({
                    tag: 'div',
                    style: {
                        padding: '10px 14px',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: `2px solid ${idx % 2 === 0 ? color.border : '#e8eaed'}`,
                        borderLeft: `4px solid ${color.border}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.backgroundColor = color.bg
                            e.currentTarget.style.transform = 'translateX(4px)'
                            e.currentTarget.style.boxShadow = `0 4px 12px ${color.border}25`
                            e.currentTarget.style.borderColor = color.border
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.transform = 'translateX(0)'
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                            e.currentTarget.style.borderColor = idx % 2 === 0 ? color.border : '#e8eaed'
                        }
                    },
                    child: [
                        // Header row with name and units
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '12px'
                            },
                            child: [
                                // Name with icon
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flex: '1'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-microscope' },
                                            style: {
                                                color: color.border,
                                                fontSize: '12px',
                                                opacity: 0.7
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: name,
                                            style: {
                                                color: '#202124',
                                                fontWeight: '500',
                                                fontSize: '13px',
                                                lineHeight: '1.4',
                                                wordBreak: 'break-word'
                                            }
                                        })
                                    ]
                                }),
                                ...(units ? [
                                    $({
                                        tag: 'span',
                                        style: {
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '3px 12px',
                                            borderRadius: '12px',
                                            backgroundColor: color.bg,
                                            color: color.border,
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            border: `1px solid ${color.border}40`
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-cube' },
                                                style: { fontSize: '10px' }
                                            }),
                                            $({
                                                tag: 'span',
                                                text: `${units} unit${units > 1 ? 's' : ''}`
                                            })
                                        ]
                                    })
                                ] : [])
                            ]
                        }),
                        // Description (if exists)
                        ...(description ? [
                            $({
                                tag: 'div',
                                style: {
                                    marginTop: '6px',
                                    paddingTop: '6px',
                                    borderTop: '1px solid #f1f3f4',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-align-left' },
                                        style: {
                                            color: '#9aa0a6',
                                            fontSize: '10px',
                                            marginTop: '2px'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: description,
                                        style: {
                                            color: '#5f6368',
                                            fontSize: '12px',
                                            lineHeight: '1.4',
                                            flex: '1'
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

        // Type of Laboratory
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '160px',
                    backgroundColor: '#ffffff'
                },
                child: [renderLabTypeBadge(item.laboratoryType)]
            })
        )

        // Facilities/Equipment
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '250px',
                    backgroundColor: '#ffffff'
                },
                child: [renderFacilities(item.facilities)]
            })
        )

        // Unit/Pcs Available
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#202124',
                    fontWeight: '600',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    backgroundColor: '#f8f9fa'
                },
                child: item.totalUnits ? [
                    $({
                        tag: 'span',
                        style: {
                            display: 'inline-block',
                            padding: '2px 12px',
                            backgroundColor: '#e8f0fe',
                            color: '#1a73e8',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '600'
                        },
                        text: item.totalUnits
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

        // Date Acquired
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#ffffff'
                },
                child: [
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
                                att: { className: 'fa-regular fa-calendar' },
                                style: {
                                    fontSize: '11px',
                                    color: '#9aa0a6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: formatDate(item.dateAcquired)
                            })
                        ]
                    })
                ]
            })
        )

        // Funding Internal
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#1e8e3e',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    textAlign: 'right',
                    fontFamily: "'Courier New', monospace",
                    backgroundColor: item.internalFunding && parseFloat(item.internalFunding) > 0 ? '#f0faf0' : '#ffffff',
                    fontWeight: '500'
                },
                child: item.internalFunding && parseFloat(item.internalFunding) > 0 ? [
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
                                att: { className: 'fa-solid fa-building' },
                                style: {
                                    fontSize: '11px',
                                    color: '#1e8e3e',
                                    opacity: 0.6
                                }
                            }),
                            $({
                                tag: 'span',
                                text: formatCurrency(item.internalFunding)
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

        // Funding External
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#0d47a1',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'middle',
                    textAlign: 'right',
                    fontFamily: "'Courier New', monospace",
                    backgroundColor: item.externalFunding && parseFloat(item.externalFunding) > 0 ? '#f0f4ff' : '#ffffff',
                    fontWeight: '500'
                },
                child: item.externalFunding && parseFloat(item.externalFunding) > 0 ? [
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
                                att: { className: 'fa-solid fa-globe' },
                                style: {
                                    fontSize: '11px',
                                    color: '#0d47a1',
                                    opacity: 0.6
                                }
                            }),
                            $({
                                tag: 'span',
                                text: formatCurrency(item.externalFunding)
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

        // Purpose/Services Offered
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#3c4043',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    lineHeight: '1.5',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: item.purpose ? [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '4px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-regular fa-file-lines' },
                                style: {
                                    fontSize: '11px',
                                    color: '#9aa0a6',
                                    marginTop: '1px'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: item.purpose,
                                style: {
                                    flex: '1'
                                }
                            })
                        ]
                    })
                ] : [
                    $({
                        tag: 'span',
                        text: '—',
                        style: {
                            color: '#9aa0a6',
                            fontStyle: 'italic'
                        }
                    })
                ]
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
                        if (!cell.style.backgroundColor.includes('#f0faf0') && 
                            !cell.style.backgroundColor.includes('#f0f4ff') &&
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

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '₱0.00'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
                            deleteFacility(item)
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

    const deleteFacility = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this facility/equipment record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_facility')
            formData.append('id', item.id)

            const response = await fetch('/api/facilities-improvement', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Facility/Equipment record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete facility/equipment record', 'error')
            }
        } catch (error) {
            console.error('Error deleting facility:', error)
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

        // Facilities/Equipment state
        let facilities = []
        if (isEditing && item.facilities) {
            try {
                facilities = typeof item.facilities === 'string' ? JSON.parse(item.facilities) : item.facilities
                if (!Array.isArray(facilities)) facilities = []
            } catch (e) {
                facilities = []
            }
        }

        // Container for facility fields
        let facilitiesContainer

        // Function to add a facility field
        const addFacilityField = (name = '', units = '', description = '') => {
            const facilityIndex = facilities.length
            facilities.push({ name, units, description })

            const facilityRow = $({
                tag: 'div',
                att: { className: 'facility-row', 'data-facility-index': facilityIndex },
                style: {
                    backgroundColor: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    border: '2px solid #e8eaed',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                },
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.1)'
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8eaed'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '10px',
                            alignItems: 'center'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    flex: '3',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-microscope' },
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9aa0a6',
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            placeholder: 'Equipment/Facility name *',
                                            value: name,
                                            className: 'facility-name-input'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 10px 10px 38px',
                                            backgroundColor: '#ffffff',
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
                                                e.target.style.borderColor = '#7c3aed'
                                                e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
                                            },
                                            type2: 'blur',
                                            method2: (e) => {
                                                e.target.style.borderColor = '#e8eaed'
                                                e.target.style.boxShadow = 'none'
                                            },
                                            type3: 'input',
                                            method3: (e) => {
                                                if (facilities[facilityIndex]) {
                                                    facilities[facilityIndex].name = e.target.value
                                                }
                                            }
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    position: 'relative',
                                    width: '120px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-cube' },
                                        style: {
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9aa0a6',
                                            fontSize: '13px'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'number',
                                            placeholder: 'Units',
                                            value: units,
                                            className: 'facility-units-input',
                                            min: '1'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 10px 10px 36px',
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #e8eaed',
                                            borderRadius: '8px',
                                            color: '#202124',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            fontFamily: 'inherit',
                                            textAlign: 'center'
                                        },
                                        event: {
                                            type: 'focus',
                                            method: (e) => {
                                                e.target.style.borderColor = '#7c3aed'
                                                e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
                                            },
                                            type2: 'blur',
                                            method2: (e) => {
                                                e.target.style.borderColor = '#e8eaed'
                                                e.target.style.boxShadow = 'none'
                                            },
                                            type3: 'input',
                                            method3: (e) => {
                                                if (facilities[facilityIndex]) {
                                                    facilities[facilityIndex].units = e.target.value
                                                }
                                                updateTotalUnits()
                                            }
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'button',
                                att: { type: 'button' },
                                style: {
                                    padding: '8px 14px',
                                    backgroundColor: '#fce8e6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#ea4335',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    lineHeight: '1',
                                    width: '38px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-times' },
                                        style: { fontSize: '16px' }
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: () => {
                                        facilities.splice(facilityIndex, 1)
                                        facilityRow.remove()
                                        updateTotalUnits()
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#ea4335'
                                        e.currentTarget.style.color = '#ffffff'
                                        e.currentTarget.style.transform = 'scale(1.05)'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#fce8e6'
                                        e.currentTarget.style.color = '#ea4335'
                                        e.currentTarget.style.transform = 'scale(1)'
                                    }
                                }
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
                                att: { className: 'fa-solid fa-align-left' },
                                style: {
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9aa0a6',
                                    fontSize: '13px'
                                }
                            }),
                            $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    placeholder: 'Brief description (optional)',
                                    value: description,
                                    className: 'facility-description-input'
                                },
                                style: {
                                    width: '100%',
                                    padding: '10px 10px 10px 38px',
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #e8eaed',
                                    borderRadius: '8px',
                                    color: '#202124',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.target.style.borderColor = '#7c3aed'
                                        e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.1)'
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.target.style.borderColor = '#e8eaed'
                                        e.target.style.boxShadow = 'none'
                                    },
                                    type3: 'input',
                                    method3: (e) => {
                                        if (facilities[facilityIndex]) {
                                            facilities[facilityIndex].description = e.target.value
                                        }
                                    }
                                }
                            })
                        ]
                    })
                ]
            })

            return facilityRow
        }

        // Update total units display
        const updateTotalUnits = () => {
            const totalUnitsEl = document.getElementById('total-units-display')
            if (totalUnitsEl) {
                const total = facilities.reduce((sum, f) => sum + (parseInt(f.units) || 0), 0)
                totalUnitsEl.textContent = `Total: ${total} units`
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
                                                    att: { className: 'fa-solid fa-microscope' },
                                                    style: { color: '#ffffff', fontSize: '18px' }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'h2',
                                            text: isEditing ? 'Edit Facility/Equipment' : 'Add Facility/Equipment',
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
                                    att: { id: 'facilities-form' },
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
                                                        id: 'facility-type-select'
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

                                        // Type of Laboratory
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Types of Laboratory',
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
                                                        name: 'laboratoryType',
                                                        value: isEditing ? (item.laboratoryType || '') : '',
                                                        placeholder: 'e.g. Food Laboratory, Research Laboratory'
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

                                        // Facilities/Equipment section
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
                                                        marginBottom: '12px',
                                                        flexWrap: 'wrap',
                                                        gap: '12px'
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
                                                                    child: [
                                                                        $({
                                                                            tag: 'label',
                                                                            text: 'Facilities/Equipment *',
                                                                            style: {
                                                                                color: '#202124',
                                                                                fontSize: '14px',
                                                                                fontWeight: '600',
                                                                                display: 'block'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Add equipment and facilities',
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
                                                                    tag: 'span',
                                                                    att: { id: 'total-units-display' },
                                                                    text: 'Total: 0 units',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#1a73e8',
                                                                        fontWeight: '600',
                                                                        backgroundColor: '#e8f0fe',
                                                                        padding: '4px 14px',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid #d2e3fc'
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'button',
                                                            att: { type: 'button' },
                                                            style: {
                                                                padding: '8px 20px',
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
                                                                    text: 'Add Equipment'
                                                                })
                                                            ],
                                                            event: {
                                                                type: 'click',
                                                                method: () => {
                                                                    const newRow = addFacilityField()
                                                                    facilitiesContainer.appendChild(newRow)
                                                                    updateTotalUnits()
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
                                                    att: { id: 'facilities-container' },
                                                    style: {
                                                        backgroundColor: '#fafafa',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '2px solid #e8eaed',
                                                        minHeight: '50px'
                                                    },
                                                    elementHandler: (el) => {
                                                        facilitiesContainer = el
                                                        if (isEditing && facilities.length > 0) {
                                                            facilities.forEach(facility => {
                                                                facilitiesContainer.appendChild(
                                                                    addFacilityField(facility.name, facility.units, facility.description)
                                                                )
                                                            })
                                                            setTimeout(updateTotalUnits, 100)
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // Date Acquired
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Date Acquired',
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
                                                        name: 'dateAcquired',
                                                        value: isEditing ? (item.dateAcquired || '') : ''
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

                                        // Funding row
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
                                                            style: {
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                color: '#1e8e3e',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-building' },
                                                                    style: { marginRight: '6px', fontSize: '12px' }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Funding Internal (₱)'
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'number',
                                                                name: 'internalFunding',
                                                                value: isEditing ? (item.internalFunding || '') : '',
                                                                placeholder: '0.00',
                                                                step: '0.01',
                                                                min: '0'
                                                            },
                                                            style: {
                                                                width: '100%',
                                                                padding: '12px 14px',
                                                                backgroundColor: '#f0faf0',
                                                                border: '2px solid #a5d6a7',
                                                                borderRadius: '10px',
                                                                color: '#1e8e3e',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                transition: 'all 0.2s ease',
                                                                fontFamily: "'Courier New', monospace",
                                                                fontWeight: '500'
                                                            },
                                                            event: {
                                                                type: 'focus',
                                                                method: (e) => {
                                                                    e.target.style.borderColor = '#1e8e3e'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(30,142,62,0.1)'
                                                                },
                                                                type2: 'blur',
                                                                method2: (e) => {
                                                                    e.target.style.borderColor = '#a5d6a7'
                                                                    e.target.style.backgroundColor = '#f0faf0'
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
                                                            style: {
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                color: '#0d47a1',
                                                                fontSize: '14px',
                                                                fontWeight: '600'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-globe' },
                                                                    style: { marginRight: '6px', fontSize: '12px' }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Funding External (₱)'
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'number',
                                                                name: 'externalFunding',
                                                                value: isEditing ? (item.externalFunding || '') : '',
                                                                placeholder: '0.00',
                                                                step: '0.01',
                                                                min: '0'
                                                            },
                                                            style: {
                                                                width: '100%',
                                                                padding: '12px 14px',
                                                                backgroundColor: '#f0f4ff',
                                                                border: '2px solid #90caf9',
                                                                borderRadius: '10px',
                                                                color: '#0d47a1',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                transition: 'all 0.2s ease',
                                                                fontFamily: "'Courier New', monospace",
                                                                fontWeight: '500'
                                                            },
                                                            event: {
                                                                type: 'focus',
                                                                method: (e) => {
                                                                    e.target.style.borderColor = '#0d47a1'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(13,71,161,0.1)'
                                                                },
                                                                type2: 'blur',
                                                                method2: (e) => {
                                                                    e.target.style.borderColor = '#90caf9'
                                                                    e.target.style.backgroundColor = '#f0f4ff'
                                                                    e.target.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),

                                        // Sponsoring Agency
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Sponsoring Agency',
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
                                                        placeholder: 'Enter sponsoring agency...'
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

                                        // Purpose/Services Offered
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Purpose/Services Offered *',
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
                                                        name: 'purpose',
                                                        placeholder: 'Enter purpose or services offered by this facility/equipment...',
                                                        rows: '3',
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
                                                    text: isEditing ? (item.purpose || '') : '',
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
                                                    text: isEditing ? 'Update Facility' : 'Add Facility',
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
                                            await saveFacilityData(isEditing)
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
            const typeSelect = document.getElementById('facility-type-select')
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
                                    backgroundColor: type === 'campus' ? '#f5f0ff' : '#e8f0fe',
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
                                        text: `Select the ${type === 'campus' ? 'campus' : 'center'} where this facility is located`,
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

    const saveFacilityData = async (isEditing) => {
        const form = document.getElementById('facilities-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_facility' : 'add_facility')

        // Add facilities as JSON
        formData.append('facilities', JSON.stringify(facilities))

        showLoading()
        try {
            const response = await fetch('/api/facilities-improvement', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Facility/Equipment updated successfully' : 'Facility/Equipment added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving facility data', 'error')
            }
        } catch (error) {
            console.error('Error saving facility:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const refreshData = async () => {
        facilitiesData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchFacilitiesData()
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
                                            att: { className: 'fa-solid fa-microscope' },
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
                                            text: 'Summary List of Facilities and Equipment',
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
                                            text: 'Relevant to the Conduct of Research'
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
                                    child: [
                                        ...campuses.map(c =>
                                            $({
                                                tag: 'option',
                                                att: { value: c },
                                                text: c,
                                                selected: c === currentCampus
                                            })
                                        )
                                    ],
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
                                    child: [
                                        ...centers.map(c =>
                                            $({
                                                tag: 'option',
                                                att: { value: c },
                                                text: c.length > 40 ? c.substring(0, 40) + '...' : c,
                                                selected: c === currentCenter
                                            })
                                        )
                                    ],
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
                                // Funding type filter
                                $({
                                    tag: 'select',
                                    att: { className: 'funding-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 14px',
                                        color: '#202124',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '140px',
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
                                    child: [
                                        ...fundingTypes.map(ft =>
                                            $({
                                                tag: 'option',
                                                att: { value: ft },
                                                text: ft,
                                                selected: ft === currentFundingType
                                            })
                                        )
                                    ],
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentFundingType = e.target.value
                                            applyFundingFilter()
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
                // Add Facility button
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
                            text: 'Add Facility/Equipment'
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e8eaed'
            },
            child: [
                // Total Facilities
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
                            e.currentTarget.style.borderColor = '#607d8b'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(96,125,139,0.15)'
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
                                background: 'linear-gradient(90deg, #607d8b, #78909c)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #607d8b, #78909c)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building' },
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
                                    att: { className: 'stat-total-facilities stat-value' },
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
                                    text: 'Total Facilities',
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
                // Total Equipment
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
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,188,212,0.15)'
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
                                    att: { className: 'fa-solid fa-microscope' },
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
                                    att: { className: 'stat-total-equipment stat-value' },
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
                                    text: 'Equipment Count',
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
                // Internal Funding
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
                            e.currentTarget.style.borderColor = '#34a853'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(52,168,83,0.15)'
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
                                background: 'linear-gradient(90deg, #34a853, #66bb6a)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #34a853, #66bb6a)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building-columns' },
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
                                    att: { className: 'stat-internal-funding stat-value' },
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
                                    text: 'Internal Funded',
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
                // External Funding
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
                            e.currentTarget.style.borderColor = '#1a73e8'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,115,232,0.15)'
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
                                background: 'linear-gradient(90deg, #1a73e8, #4285f4)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1a73e8, #4285f4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-globe' },
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
                                    att: { className: 'stat-external-funding stat-value' },
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
                                    text: 'External Funded',
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
                // Total Units
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
                        gridColumn: 'span 1',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#fbbc04'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,188,4,0.15)'
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
                                background: 'linear-gradient(90deg, #fbbc04, #fdd835)'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #fbbc04, #fdd835)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-boxes-stacked' },
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
                                    att: { className: 'stat-total-units stat-value' },
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
                                    text: 'Total Units/Pcs',
                                    style: {
                                        fontSize: '13px',
                                        color: '#5f6368',
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

    const TableHeader = () => {
        const headers = [
            { key: '#', align: 'center', width: '40px' },
            { key: 'Laboratory Type', align: 'center', width: '150px' },
            { key: 'Facilities/Equipment', align: 'left', width: '220px' },
            { key: 'Units', align: 'center', width: '80px' },
            { key: 'Date Acquired', align: 'center', width: '110px' },
            { key: 'Internal', align: 'right', width: '100px' },
            { key: 'External', align: 'right', width: '100px' },
            { key: 'Sponsoring Agency', align: 'left', width: '140px' },
            { key: 'Purpose/Services', align: 'left', width: '180px' },
            { key: 'Actions', align: 'center', width: '70px' }
        ]

        const row = $({ tag: 'tr' })

        headers.forEach(({ key, align, width }) => {
            const th = $({
                tag: 'th',
                style: {
                    padding: '10px 12px',
                    textAlign: align,
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#5f6368',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e8eaed',
                    borderBottom: '2px solid #dadce0',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    width: width || 'auto',
                    minWidth: width || 'auto',
                    position: 'sticky',
                    top: '0',
                    zIndex: '2'
                },
                text: key
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
                height: 'calc(100% - 340px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                margin: '0 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchFacilitiesData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '1300px',
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
        att: { className: 'facilities-improvement-container' },
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

export default facilitiesImprovement
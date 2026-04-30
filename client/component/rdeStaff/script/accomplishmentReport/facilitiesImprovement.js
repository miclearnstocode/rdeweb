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

    // Fetch facilities data
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

            const response = await fetch('/api/facilities-improvement', {
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

    // Apply funding type filter locally
    const applyFundingFilter = () => {
        if (currentFundingType === 'All Funding') {
            filteredData = [...facilitiesData]
        } else {
            filteredData = facilitiesData.filter(item => item.fundingType === currentFundingType)
        }
        updateTableWithData()
    }

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchFacilitiesData(nextCursor)
        }
    }

    // Update statistics
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
                height: '350px',
                marginLeft: '100%',
                marginTop: '10%',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif',
                gridColumn: '1 / -1'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-flask' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#607d8b'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Facilities & Equipment Records Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add Facility/Equipment" to add facilities and equipment records',
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

    // Render laboratory type badge
    const renderLabTypeBadge = (labType) => {
        if (!labType || labType === '—') return '—'

        const colors = [
            { bg: 'rgba(0, 188, 212, 0.15)', color: '#00bcd4', border: 'rgba(0, 188, 212, 0.3)' },
            { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)' },
            { bg: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)' },
            { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' },
            { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' }
        ]

        // Use hash of string to pick a consistent color
        const hash = labType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const colorIndex = hash % colors.length
        const selectedColor = colors[colorIndex]

        return $({
            tag: 'span',
            style: {
                display: 'inline-block',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: selectedColor.bg,
                color: selectedColor.color,
                border: `1px solid ${selectedColor.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            text: labType
        })
    }

    // Render funding badge
    const renderFundingBadge = (fundingType) => {
        if (!fundingType || fundingType === '—') return '—'

        const isInternal = fundingType === 'Internal'
        const colors = isInternal
            ? { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' }
            : { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)' }

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
                    att: { className: `fa-solid ${isInternal ? 'fa-building' : 'fa-globe'}` },
                    style: { fontSize: '10px' }
                }),
                $({ tag: 'span', text: fundingType })
            ]
        })
    }

    // Render facilities/equipment list
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
                gap: '6px'
            },
            child: facilityList.map((facility, idx) => {
                const name = typeof facility === 'string' ? facility : facility.name || 'Unknown'
                const units = typeof facility === 'object' ? facility.units : ''
                const description = typeof facility === 'object' ? facility.description : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '8px 10px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(96, 125, 139, 0.05)' : 'transparent',
                        borderRadius: '6px',
                        borderLeft: '3px solid #607d8b',
                        borderBottom: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: name,
                                    style: {
                                        color: '#ddd',
                                        fontWeight: '500',
                                        fontSize: '12px',
                                        lineHeight: '1.4',
                                        flex: '1'
                                    }
                                }),
                                ...(units ? [
                                    $({
                                        tag: 'span',
                                        text: `${units} unit/s`,
                                        style: {
                                            color: '#607d8b',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: 'rgba(96, 125, 139, 0.15)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap'
                                        }
                                    })
                                ] : [])
                            ]
                        }),
                        ...(description ? [
                            $({
                                tag: 'div',
                                text: description,
                                style: {
                                    color: '#888',
                                    fontSize: '11px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.3',
                                    marginTop: '3px'
                                }
                            })
                        ] : [])
                    ]
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

        // Type of Laboratory
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '160px'
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
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '250px'
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
                    fontSize: '13px',
                    color: '#607d8b',
                    fontWeight: '600',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    backgroundColor: 'rgba(96, 125, 139, 0.1)'
                },
                text: item.totalUnits || '—'
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
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap'
                },
                text: formatDate(item.dateAcquired)
            })
        )

        // Funding Internal
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#4caf50',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    textAlign: 'right',
                    fontFamily: "'Courier New', monospace",
                    backgroundColor: item.internalFunding && parseFloat(item.internalFunding) > 0 ? 'rgba(76, 175, 80, 0.05)' : 'transparent'
                },
                text: item.internalFunding ? formatCurrency(item.internalFunding) : '—'
            })
        )

        // Funding External
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#2196f3',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    textAlign: 'right',
                    fontFamily: "'Courier New', monospace",
                    backgroundColor: item.externalFunding && parseFloat(item.externalFunding) > 0 ? 'rgba(33, 150, 243, 0.05)' : 'transparent'
                },
                text: item.externalFunding ? formatCurrency(item.externalFunding) : '—'
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

        // Purpose/Services Offered
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#bbb',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    minWidth: '200px'
                },
                text: item.purpose || '—'
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

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '₱0.00'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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
                            deleteFacility(item)
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

    // Delete facility
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

    // Render modal for add/edit
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
                    backgroundColor: '#333',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #444'
                },
                child: [
                    $({
                        tag: 'div',
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
                                    placeholder: 'Equipment/Facility name *',
                                    value: name,
                                    className: 'facility-name-input'
                                },
                                style: {
                                    flex: '3',
                                    padding: '10px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none'
                                },
                                event: {
                                    type: 'input',
                                    method: (e) => {
                                        if (facilities[facilityIndex]) {
                                            facilities[facilityIndex].name = e.target.value
                                        }
                                    }
                                }
                            }),
                            $({
                                tag: 'input',
                                att: {
                                    type: 'number',
                                    placeholder: 'Units/Pcs',
                                    value: units,
                                    className: 'facility-units-input',
                                    min: '1'
                                },
                                style: {
                                    width: '100px',
                                    padding: '10px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none',
                                    textAlign: 'center'
                                },
                                event: {
                                    type: 'input',
                                    method: (e) => {
                                        if (facilities[facilityIndex]) {
                                            facilities[facilityIndex].units = e.target.value
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
                                        facilities.splice(facilityIndex, 1)
                                        facilityRow.remove()
                                        updateTotalUnits()
                                    }
                                }
                            })
                        ]
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
                            padding: '10px',
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #444',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        },
                        event: {
                            type: 'input',
                            method: (e) => {
                                if (facilities[facilityIndex]) {
                                    facilities[facilityIndex].description = e.target.value
                                }
                            }
                        }
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
                totalUnitsEl.textContent = `Total Units: ${total}`
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
                                    text: isEditing ? 'Edit Facility/Equipment' : 'Add Facility/Equipment',
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
                            att: { id: 'facilities-form' },
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
                                                id: 'facility-type-select'
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

                                // Type of Laboratory
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Types of Laboratory',
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
                                                name: 'laboratoryType',
                                                value: isEditing ? (item.laboratoryType || '') : '',
                                                placeholder: 'e.g. Food Laboratory'
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

                                // Facilities/Equipment section
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
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'label',
                                                            text: 'Facilities/Equipment',
                                                            style: {
                                                                color: '#aaa',
                                                                fontSize: '13px',
                                                                fontWeight: '500'
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            att: { id: 'total-units-display' },
                                                            text: 'Total Units: 0',
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#607d8b',
                                                                fontWeight: '600',
                                                                backgroundColor: 'rgba(96, 125, 139, 0.1)',
                                                                padding: '3px 10px',
                                                                borderRadius: '12px',
                                                                border: '1px solid rgba(96, 125, 139, 0.2)'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Equipment',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#607d8b',
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
                                                            const newRow = addFacilityField()
                                                            facilitiesContainer.appendChild(newRow)
                                                            updateTotalUnits()
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#546e7a'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#607d8b'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'facilities-container' },
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
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Date Acquired',
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
                                                name: 'dateAcquired',
                                                value: isEditing ? (item.dateAcquired || '') : ''
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

                                // Funding row
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
                                                    text: 'Funding Internal (₱)',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#4caf50',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
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
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #4caf5040',
                                                        borderRadius: '6px',
                                                        color: '#4caf50',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        fontFamily: "'Courier New', monospace"
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Funding External (₱)',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#2196f3',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
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
                                                        padding: '10px',
                                                        backgroundColor: '#333',
                                                        border: '1px solid #2196f340',
                                                        borderRadius: '6px',
                                                        color: '#2196f3',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        fontFamily: "'Courier New', monospace"
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Sponsoring Agency
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Sponsoring Agency',
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
                                                placeholder: 'Enter sponsoring agency...'
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

                                // Purpose/Services Offered
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Purpose/Services Offered *',
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
                                                name: 'purpose',
                                                placeholder: 'Enter purpose or services offered by this facility/equipment...',
                                                rows: '3',
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
                                            text: isEditing ? (item.purpose || '') : ''
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
                                            text: isEditing ? 'Update Facility' : 'Add Facility',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#607d8b',
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
                                                    e.target.style.backgroundColor = '#546e7a'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#607d8b'
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
                                    await saveFacilityData(isEditing)
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
            const typeSelect = document.getElementById('facility-type-select')
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

    // Save facility data
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

    // Refresh data
    const refreshData = async () => {
        facilitiesData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchFacilitiesData()
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
                                    att: { className: 'fa-solid fa-flask' },
                                    style: { color: '#607d8b', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Facilities and Equipment Relevant to the Conduct of Research',
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
                                // Funding type filter
                                $({
                                    tag: 'select',
                                    att: { className: 'funding-select' },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#a1a1a1ff',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '140px'
                                    },
                                    child: fundingTypes.map(ft =>
                                        $({
                                            tag: 'option',
                                            att: { value: ft },
                                            text: ft,
                                            selected: ft === currentFundingType
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentFundingType = e.target.value
                                            applyFundingFilter()
                                            updateRecordCount()
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
                    text: '+ Add Facility/Equipment',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#607d8b',
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
                            e.target.style.backgroundColor = '#546e7a'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(96, 125, 139, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#607d8b'
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
                // Total Facilities
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
                                backgroundColor: 'rgba(96, 125, 139, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(96, 125, 139, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building' },
                                    style: { color: '#607d8b', fontSize: '26px' }
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
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Facilities',
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
                // Total Equipment
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
                                    att: { className: 'fa-solid fa-microscope' },
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
                                    att: { className: 'stat-total-equipment stat-value' },
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
                                    text: 'Equipment Count',
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
                // Internal Funding
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
                                    att: { className: 'fa-solid fa-building-columns' },
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
                                    att: { className: 'stat-internal-funding stat-value' },
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
                                    text: 'Internal Funded',
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
                // External Funding
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
                                backgroundColor: 'rgba(33, 150, 243, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(33, 150, 243, 0.3)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-globe' },
                                    style: { color: '#2196f3', fontSize: '26px' }
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
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'External Funded',
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
                // Total Units
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#2d2d2d',
                        borderRadius: '16px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #444',
                        gridColumn: 'span 1'
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
                                    att: { className: 'fa-solid fa-boxes-stacked' },
                                    style: { color: '#ff9800', fontSize: '26px' }
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
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Units/Pcs',
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

    // Table header
    const TableHeader = () => {
        const headers = [
            'NO.',
            'Type of Laboratory',
            'Facilities/\nEquipment',
            'Unit/Pcs\nAvailable',
            'Date\nAcquired',
            'Funding\nInternal',
            'Funding\nExternal',
            'Sponsoring\nAgency',
            'Purpose/\nServices Offered',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'Type of Laboratory', 'Unit/Pcs\nAvailable', 'Date\nAcquired', 'Funding\nInternal', 'Funding\nExternal', 'ACTIONS'].includes(header)

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
                fetchFacilitiesData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '2000px',
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
        att: { className: 'facilities-improvement-container' },
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

export default facilitiesImprovement
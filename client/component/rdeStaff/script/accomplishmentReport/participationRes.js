import { $, Waiting } from "../../../../lib/lib.js"

export const participationResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let participationData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    // Stats state
    let currentStats = {
        totalActivities: 0,
        totalProducts: 0,
        fairs: 0,
        exhibits: 0,
        techPitching: 0
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

    const fetchParticipationData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            participationData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_participation')

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

            const response = await fetch('/participationResearch', {
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
                    participationData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalActivities
                        updateStats()
                    }
                } else {
                    participationData = [...participationData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                updateTableWithData()
                updateRecordCount()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching participation data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchParticipationData(nextCursor)
        }
    }

    const updateStats = () => {
        const statTotalActivities = document.querySelector('.stat-total-activities')
        const statTotalProducts = document.querySelector('.stat-total-products')
        const statFairs = document.querySelector('.stat-fairs')
        const statExhibits = document.querySelector('.stat-exhibits')
        const statTechPitching = document.querySelector('.stat-tech-pitching')

        if (statTotalActivities) statTotalActivities.textContent = currentStats.totalActivities
        if (statTotalProducts) statTotalProducts.textContent = currentStats.totalProducts
        if (statFairs) statFairs.textContent = currentStats.fairs
        if (statExhibits) statExhibits.textContent = currentStats.exhibits
        if (statTechPitching) statTechPitching.textContent = currentStats.techPitching
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
        const headerRow = document.querySelector('.participation-container thead tr')
        let columnCount = 9 // Default to 9 columns for this table
        
        if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th')
            if (headerCells.length > 0) {
                columnCount = headerCells.length
            }
        }

        // Create a single row with one cell that spans all columns
        const tr = document.createElement('tr')
        tr.style.backgroundColor = '#ffffff'

        const td = document.createElement('td')
        td.setAttribute('colspan', columnCount)
        td.style.padding = '60px 20px'
        td.style.border = 'none'
        td.style.backgroundColor = '#ffffff'
        td.style.textAlign = 'center'
        td.style.verticalAlign = 'middle'
        td.style.width = '100%'

        // Create the empty state content
        const emptyStateDiv = document.createElement('div')
        emptyStateDiv.className = 'empty-state'
        emptyStateDiv.style.display = 'flex'
        emptyStateDiv.style.flexDirection = 'column'
        emptyStateDiv.style.alignItems = 'center'
        emptyStateDiv.style.justifyContent = 'center'
        emptyStateDiv.style.width = '100%'
        emptyStateDiv.style.maxWidth = '500px'
        emptyStateDiv.style.margin = '0 auto'
        emptyStateDiv.style.padding = '40px 20px'
        emptyStateDiv.style.backgroundColor = '#f8f9fa'
        emptyStateDiv.style.borderRadius = '12px'
        emptyStateDiv.style.border = '2px dashed #e8eaed'

        // Build the content using your $ function
        const content = $({
            tag: 'div',
            style: { width: '100%' },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#e6f7f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-flag' },
                            style: {
                                fontSize: '36px',
                                color: '#00bcd4',
                                opacity: 0.6
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'No Participation Records Found',
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
                    text: 'Click "Add Participation" to add participation to fairs, exhibits & technology pitching records',
                    style: {
                        fontSize: '14px',
                        color: '#5f6368',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }
                }),
                $({
                    tag: 'button',
                    att: {
                        type: 'button',
                        className: 'btn-add-participation'
                    },
                    style: {
                        padding: '10px 28px',
                        backgroundColor: '#00bcd4',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-plus' },
                            style: { fontSize: '12px' }
                        }),
                        $({
                            tag: 'span',
                            text: 'Add Participation'
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
                            e.currentTarget.style.backgroundColor = '#0097a7'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#00bcd4'
                            e.currentTarget.style.boxShadow = 'none'
                        }
                    }
                })
            ]
        })

        emptyStateDiv.appendChild(content)
        td.appendChild(emptyStateDiv)
        tr.appendChild(td)
        tableBody.appendChild(tr)
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

    const renderProducts = (products) => {
        if (!products || products === '—') return '—'

        let productList = []
        try {
            if (typeof products === 'string') {
                productList = JSON.parse(products)
            } else if (Array.isArray(products)) {
                productList = products
            } else {
                return products
            }
        } catch (e) {
            return products
        }

        if (productList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            },
            child: productList.map((product, idx) => {
                const name = typeof product === 'string' ? product : product.name || 'Unknown'
                const description = typeof product === 'object' ? product.description : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '8px 12px',
                        backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'transparent',
                        borderRadius: '6px',
                        borderLeft: `3px solid #1a73e8`,
                        borderBottom: '1px solid #e8eaed'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#202124',
                                fontWeight: '500',
                                fontSize: '12px',
                                lineHeight: '1.4'
                            }
                        }),
                        ...(description ? [
                            $({
                                tag: 'div',
                                text: description,
                                style: {
                                    color: '#5f6368',
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

    const renderLinks = (links) => {
        if (!links || links === '—' || (Array.isArray(links) && links.length === 0)) {
            return $({
                tag: 'span',
                text: '—',
                style: {
                    color: '#9aa0a6',
                    fontSize: '12px',
                    fontStyle: 'italic'
                }
            })
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

        if (linkArray.length === 0) {
            return $({
                tag: 'span',
                text: '—',
                style: {
                    color: '#9aa0a6',
                    fontSize: '12px',
                    fontStyle: 'italic'
                }
            })
        }

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
                        color: '#1a73e8',
                        textDecoration: 'none',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                        padding: '6px 10px',
                        backgroundColor: '#f1f8fe',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid #d2e3fc',
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
                            e.currentTarget.style.backgroundColor = '#e8f0fe'
                            e.currentTarget.style.borderColor = '#1a73e8'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,115,232,0.15)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#f1f8fe'
                            e.currentTarget.style.borderColor = '#d2e3fc'
                            e.currentTarget.style.boxShadow = 'none'
                        }
                    }
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
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
                },
                text: rowNumber.toString()
            })
        )

        // Title of Activity (with type badge)
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '250px',
                    backgroundColor: '#ffffff'
                },
                child: [
                    $({
                        tag: 'div',
                        text: item.title || '—',
                        style: {
                            color: '#202124',
                            fontWeight: '500',
                            fontSize: '13px',
                            lineHeight: '1.4',
                            marginBottom: '8px'
                        }
                    }),
                    renderActivityTypeBadge(item.activityType)
                ]
            })
        )

        // Products Exhibited
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    minWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [renderProducts(item.products)]
            })
        )

        // In-charge
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
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
                },
                text: item.inCharge || '—'
            })
        )

        // Venue
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
                text: item.venue || '—'
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
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
                },
                text: item.sponsoringAgency || '—'
            })
        )

        // Date
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#202124',
                    border: '1px solid #e8eaed',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#ffffff'
                },
                text: formatDate(item.date)
            })
        )

        // Link of the Paper Trail
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
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                        cell.style.backgroundColor = '#f8f9fa'
                    })
                },
                type2: 'mouseleave',
                method2: (e) => {
                    const row = e.currentTarget
                    row.style.backgroundColor = '#ffffff'
                    const cells = row.querySelectorAll('td')
                    cells.forEach(cell => {
                        cell.style.backgroundColor = '#ffffff'
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
                gap: '8px',
                justifyContent: 'center'
            },
            child: [
                // Edit button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#1a73e8',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Edit',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-pen' },
                            style: { fontSize: '14px' }
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
                            e.currentTarget.style.backgroundColor = '#e8f0fe'
                            e.currentTarget.style.transform = 'scale(1.1)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                        }
                    }
                }),
                // Delete button
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ea4335',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    title: 'Delete',
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-trash' },
                            style: { fontSize: '14px' }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteActivity(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#fce8e6'
                            e.currentTarget.style.transform = 'scale(1.1)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                        }
                    }
                })
            ]
        })
    }

    const renderActivityTypeBadge = (type) => {
        if (!type) return '—'

        const typeColors = {
            'Research Exhibit': { bg: '#e8f0fe', color: '#1a73e8', border: '#d2e3fc' },
            'Product Launch': { bg: '#e6f4ea', color: '#34a853', border: '#b7e1cd' },
            'Training': { bg: '#fef7e8', color: '#f5a623', border: '#fde8c8' },
            'Seminar': { bg: '#f3e8f9', color: '#7c3aed', border: '#e8d5f5' },
            'Conference': { bg: '#fce8e6', color: '#ea4335', border: '#f5c6cb' }
        }

        const colors = typeColors[type] || { 
            bg: '#f1f3f4', 
            color: '#5f6368', 
            border: '#e8eaed' 
        }

        return $({
            tag: 'span',
            text: type,
            style: {
                display: 'inline-block',
                padding: '3px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                letterSpacing: '0.3px'
            }
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

    const deleteActivity = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this participation record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_participation')
            formData.append('id', item.id)

            const response = await fetch('/api/participation-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Participation record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete participation record', 'error')
            }
        } catch (error) {
            console.error('Error deleting participation:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const createModernFileUpload = (label, name, icon, color, existingFile, accept = '.pdf', multiple = false) => {
        // State for preview images
        let previewImages = []
        
        // If editing and existing files exist, populate preview
        if (existingFile && multiple && Array.isArray(existingFile)) {
            previewImages = existingFile
        } else if (existingFile && !multiple) {
            previewImages = [existingFile]
        }

        const container = $({
            tag: 'div',
            att: {className: 'modern-upload-card'},
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #e8eaed',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.borderColor = color
                    e.currentTarget.style.boxShadow = `0 4px 16px ${color}25`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8eaed'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            },
            child: [
                // Header with icon and label
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
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                backgroundColor: `${color}15`,
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
                                        color: color, 
                                        fontSize: '16px' 
                                    }
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
                                    text: label,
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
                                    text: existingFile ? (multiple ? `${existingFile.length} files attached` : 'File attached') : (multiple ? '' : 'No file attached'),
                                    style: {
                                        fontSize: '11px',
                                        color: existingFile ? '#34a853' : (multiple ? 'transparent' : '#9aa0a6'),
                                        display: 'block',
                                        marginTop: '2px'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'span',
                            text: multiple ? 'Multiple' : 'Required',
                            style: {
                                fontSize: '10px',
                                color: multiple ? '#1a73e8' : '#ea4335',
                                backgroundColor: multiple ? '#e8f0fe' : '#fce8e6',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontWeight: '600',
                                flexShrink: 0
                            }
                        })
                    ]
                }),
                
                // File input area
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        marginBottom: '10px'
                    },
                    child: [
                        // Hidden file input
                        $({
                            tag: 'input',
                            att: {
                                type: 'file',
                                name: name,
                                id: `${name}-input`,
                                accept: accept,
                                multiple: multiple
                            },
                            style: {
                                display: 'none'
                            },
                            event: {
                                type: 'change',
                                method: (e) => {
                                    const files = e.target.files
                                    if (files && files.length > 0) {
                                        const fileNameSpan = document.getElementById(`${name}-filename`)
                                        const statusSpan = e.currentTarget.closest('.modern-upload-card').querySelector('.upload-status')
                                        const previewContainer = document.getElementById(`${name}-preview-container`)
                                        const fileCountSpan = document.getElementById(`${name}-file-count`)
                                        
                                        if (multiple) {
                                            // Multiple files - add to preview
                                            Array.from(files).forEach(file => {
                                                if (file.type.startsWith('image/')) {
                                                    const reader = new FileReader()
                                                    reader.onload = (event) => {
                                                        const imgPreview = createImagePreview(event.target.result, file.name, true)
                                                        if (previewContainer) {
                                                            previewContainer.appendChild(imgPreview)
                                                        }
                                                        // Update file count
                                                        if (fileCountSpan) {
                                                            const currentCount = previewContainer ? previewContainer.children.length : 0
                                                            fileCountSpan.textContent = currentCount
                                                        }
                                                    }
                                                    reader.readAsDataURL(file)
                                                }
                                            })
                                            
                                            // For images, just show a simple notification - NO "file(s) selected" text
                                            if (accept.includes('image')) {
                                                // Only show notification
                                                showNotification(`${files.length} photo(s) added`, 'success')
                                                // Clear the file name display for images
                                                if (fileNameSpan) {
                                                    fileNameSpan.textContent = ''
                                                }
                                                if (statusSpan) {
                                                    statusSpan.textContent = ''
                                                }
                                            } else {
                                                // For non-image multiple files
                                                if (fileNameSpan) {
                                                    fileNameSpan.textContent = `${files.length} file(s) selected`
                                                    fileNameSpan.style.color = '#1e8e3e'
                                                }
                                                if (statusSpan) {
                                                    statusSpan.textContent = `✅ ${files.length} file(s) selected`
                                                    statusSpan.style.color = '#1e8e3e'
                                                }
                                                showNotification(`${files.length} file(s) selected successfully`, 'success')
                                            }
                                        } else {
                                            // Single file
                                            const file = files[0]
                                            if (fileNameSpan) {
                                                fileNameSpan.textContent = file.name
                                                fileNameSpan.style.color = '#1e8e3e'
                                            }
                                            if (statusSpan) {
                                                statusSpan.textContent = '✅ File selected'
                                                statusSpan.style.color = '#1e8e3e'
                                            }
                                            
                                            // Show preview if image
                                            if (file.type.startsWith('image/')) {
                                                const reader = new FileReader()
                                                reader.onload = (event) => {
                                                    const previewContainer = document.getElementById(`${name}-preview-container`)
                                                    if (previewContainer) {
                                                        previewContainer.innerHTML = ''
                                                        const imgPreview = createImagePreview(event.target.result, file.name, false)
                                                        previewContainer.appendChild(imgPreview)
                                                    }
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                            
                                            showNotification(`${file.name} selected successfully`, 'success')
                                        }
                                        
                                        // Update the file attached text
                                        const attachText = e.currentTarget.closest('.modern-upload-card').querySelector('.file-attached-text')
                                        if (attachText) {
                                            attachText.textContent = multiple && accept.includes('image') ? '' : (multiple ? 'Files ready to upload' : 'File ready to upload')
                                            attachText.style.color = '#1e8e3e'
                                        }
                                        
                                        // Reset input to allow re-selecting same files
                                        e.target.value = ''
                                    }
                                }
                            }
                        }),
                        
                        // Custom upload button
                        $({
                            tag: 'button',
                            att: { type: 'button' },
                            style: {
                                width: '100%',
                                padding: '10px 14px',
                                backgroundColor: '#f8f9fa',
                                border: `2px dashed ${existingFile ? '#34a853' : color}`,
                                borderRadius: '8px',
                                color: '#202124',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontFamily: 'inherit'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-cloud-upload-alt' },
                                    style: { 
                                        fontSize: '16px', 
                                        color: existingFile ? '#34a853' : color 
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: existingFile ? (multiple ? 'Add More Files' : 'Replace File') : (multiple ? 'Choose Files' : 'Choose File')
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.preventDefault()
                                    const fileInput = document.getElementById(`${name}-input`)
                                    if (fileInput) fileInput.click()
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f8fe'
                                    e.currentTarget.style.borderColor = color
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                    e.currentTarget.style.borderColor = existingFile ? '#34a853' : color
                                }
                            }
                        })
                    ]
                }),
                
                // File name display - hidden for image uploads
                $({
                    tag: 'div',
                    att: { id: `${name}-filename` },
                    style: {
                        fontSize: '12px',
                        color: '#5f6368',
                        textAlign: 'center',
                        padding: '4px',
                        marginBottom: '8px',
                        wordBreak: 'break-all',
                        minHeight: '20px',
                        display: accept.includes('image') ? 'none' : 'block'
                    },
                    text: existingFile ? (multiple ? `${existingFile.length} file(s)` : existingFile.split('/').pop() || 'Document') : ''
                }),
                
                // Status indicator - hidden for image uploads
                $({
                    tag: 'div',
                    att: { className: 'upload-status' },
                    style: {
                        fontSize: '11px',
                        color: existingFile ? '#34a853' : (multiple ? 'transparent' : '#ea4335'),
                        textAlign: 'center',
                        marginBottom: '8px',
                        fontWeight: '500',
                        display: accept.includes('image') ? 'none' : 'block'
                    },
                    text: existingFile ? (multiple ? '✅ Files attached' : '✅ File attached') : (multiple ? '' : '⚠️ File required')
                }),
                
                // Image preview container (only for image uploads)
                ...(accept.includes('image') ? [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: 'Uploaded Images:',
                                style: {
                                    fontSize: '12px',
                                    color: '#5f6368',
                                    fontWeight: '500'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { id: `${name}-file-count` },
                                text: existingFile ? (Array.isArray(existingFile) ? existingFile.length : 1) : '0',
                                style: {
                                    fontSize: '12px',
                                    color: '#1a73e8',
                                    fontWeight: '600',
                                    backgroundColor: '#e8f0fe',
                                    padding: '2px 10px',
                                    borderRadius: '12px'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { id: `${name}-preview-container` },
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: '8px',
                            marginBottom: '12px',
                            minHeight: '50px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '8px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e8eaed'
                        },
                        elementHandler: (el) => {
                            // Load existing previews from database
                            if (existingFile && multiple && Array.isArray(existingFile)) {
                                existingFile.forEach(url => {
                                    const imgPreview = createImagePreview(url, 'Existing image', false)
                                    el.appendChild(imgPreview)
                                })
                                // Update file count
                                const fileCountSpan = document.getElementById(`${name}-file-count`)
                                if (fileCountSpan) {
                                    fileCountSpan.textContent = existingFile.length
                                }
                            } else if (existingFile && !multiple) {
                                const imgPreview = createImagePreview(existingFile, 'Existing image', false)
                                el.appendChild(imgPreview)
                                const fileCountSpan = document.getElementById(`${name}-file-count`)
                                if (fileCountSpan) {
                                    fileCountSpan.textContent = '1'
                                }
                            }
                            
                            // Update file count whenever children change
                            const observer = new MutationObserver(() => {
                                const fileCountSpan = document.getElementById(`${name}-file-count`)
                                if (fileCountSpan) {
                                    fileCountSpan.textContent = el.children.length
                                }
                            })
                            observer.observe(el, { childList: true, subtree: true })
                        }
                    })
                ] : []),
                
                // Action buttons (if file exists)
                ...(existingFile ? [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '8px',
                            marginTop: '4px'
                        },
                        child: [
                            // View button
                            $({
                                tag: 'button',
                                att: { type: 'button' },
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e8eaed',
                                    borderRadius: '8px',
                                    color: '#1a73e8',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-eye' },
                                        style: { fontSize: '12px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: multiple ? 'View Files' : 'View'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.preventDefault()
                                        if (multiple && Array.isArray(existingFile)) {
                                            window.open(existingFile[0], '_blank')
                                        } else {
                                            window.open(existingFile, '_blank')
                                        }
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f8fe'
                                        e.currentTarget.style.borderColor = '#1a73e8'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.borderColor = '#e8eaed'
                                    }
                                }
                            }),
                            // Download button
                            $({
                                tag: 'button',
                                att: { type: 'button' },
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e8eaed',
                                    borderRadius: '8px',
                                    color: '#34a853',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-download' },
                                        style: { fontSize: '12px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: multiple ? 'Download All' : 'Download'
                                    })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.preventDefault()
                                        if (multiple && Array.isArray(existingFile)) {
                                            existingFile.forEach(file => window.open(file, '_blank'))
                                        } else {
                                            window.open(existingFile, '_blank')
                                        }
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#e6f4ea'
                                        e.currentTarget.style.borderColor = '#34a853'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.borderColor = '#e8eaed'
                                    }
                                }
                            })
                        ]
                    })
                ] : [])
            ]
        })

        return container
    }

    const createImagePreviewWithRemove = (src, alt, isNew = false, onRemove = null) => {
        const container = $({
            tag: 'div',
            style: {
                position: 'relative',
                width: '100%',
                paddingBottom: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                border: isNew ? '2px solid #34a853' : '2px solid #e8eaed',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.2s ease',
                boxShadow: isNew ? '0 0 0 2px rgba(52,168,83,0.2)' : 'none'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1a73e8'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,115,232,0.2)'
                    e.currentTarget.style.zIndex = '2'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.borderColor = isNew ? '#34a853' : '#e8eaed'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = isNew ? '0 0 0 2px rgba(52,168,83,0.2)' : 'none'
                    e.currentTarget.style.zIndex = '1'
                }
            },
            child: [
                // Image
                $({
                    tag: 'img',
                    att: {
                        src: src,
                        alt: alt || 'Image preview'
                    },
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    },
                    event: {
                        type: 'error',
                        method: (e) => {
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            const placeholder = $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: '#9aa0a6',
                                    fontSize: '24px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-image' }
                                    })
                                ]
                            })
                            parent.appendChild(placeholder)
                        }
                    }
                }),
                // Remove button (X)
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(234, 67, 53, 0.9)',
                        border: '2px solid #ffffff',
                        color: '#ffffff',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        zIndex: '3',
                        padding: '0',
                        lineHeight: '1'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: '×',
                            style: { fontSize: '12px', fontWeight: '700' }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            if (onRemove) {
                                onRemove()
                            }
                            container.remove()
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 1)'
                            e.currentTarget.style.transform = 'scale(1.15)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.9)'
                            e.currentTarget.style.transform = 'scale(1)'
                        }
                    }
                }),
                // New badge for newly uploaded images
                ...(isNew ? [
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            bottom: '4px',
                            left: '4px',
                            backgroundColor: '#34a853',
                            color: '#ffffff',
                            fontSize: '7px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px'
                        },
                        text: 'NEW'
                    })
                ] : [])
            ]
        })

        return container
    }

    const renderModal = (item = null) => {
        if (modalElement) {
            modalElement.remove()
        }

        const isEditing = item !== null

        // Products state
        let products = []
        if (isEditing && item.products) {
            try {
                products = typeof item.products === 'string' ? JSON.parse(item.products) : item.products
                if (!Array.isArray(products)) products = []
            } catch (e) {
                products = []
            }
        }

        // Paper trail files state
        let paperTrailFiles = {
            activityProposal: null,
            photoDocumentation: [],
            activityReport: null
        }

        let existingFiles = {
            activityProposal: null,
            photoDocumentation: [],
            activityReport: null
        }

        if (isEditing && item.paperTrailLinks) {
            try {
                const parsed = typeof item.paperTrailLinks === 'string' ? JSON.parse(item.paperTrailLinks) : item.paperTrailLinks
                if (parsed && typeof parsed === 'object') {
                    if (parsed.activityProposal) existingFiles.activityProposal = parsed.activityProposal
                    if (parsed.activityReport) existingFiles.activityReport = parsed.activityReport
                    
                    if (parsed.photoDocumentation) {
                        if (Array.isArray(parsed.photoDocumentation)) {
                            existingFiles.photoDocumentation = parsed.photoDocumentation
                        } else {
                            existingFiles.photoDocumentation = []
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing paper trail files:', e)
            }
        }

        // Container for products
        let productsContainer

        // Function to add a product field
        const addProductField = (name = '', description = '') => {
            const productIndex = products.length
            products.push({ name, description })

            const productRow = $({
                tag: 'div',
                att: { className: 'product-row', 'data-product-index': productIndex },
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
                            placeholder: 'Product/Technology name',
                            value: name,
                            className: 'product-name-input'
                        },
                        style: {
                            flex: '1',
                            padding: '10px 14px',
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
                                e.target.style.borderColor = '#00bcd4'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (products[productIndex]) {
                                    products[productIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Brief description (optional)',
                            value: description,
                            className: 'product-description-input'
                        },
                        style: {
                            flex: '2',
                            padding: '10px 14px',
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
                                e.target.style.borderColor = '#00bcd4'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e8eaed'
                                e.target.style.backgroundColor = '#f8f9fa'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (products[productIndex]) {
                                    products[productIndex].description = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '8px 14px',
                            backgroundColor: '#f1f3f4',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#5f6368',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                products.splice(productIndex, 1)
                                productRow.remove()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#ea4335'
                                e.currentTarget.style.color = '#ffffff'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f3f4'
                                e.currentTarget.style.color = '#5f6368'
                            }
                        }
                    })
                ]
            })

            return productRow
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
                        width: '850px',
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
                                borderBottom: '1px solid #e8eaed',
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
                                                background: 'linear-gradient(135deg, #00bcd4, #00838f)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-flag' },
                                                    style: { color: '#ffffff', fontSize: '18px' }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'h2',
                                            text: isEditing ? 'Edit Participation Record' : 'Add Participation to Fair/Exhibit/Technology Pitching',
                                            style: {
                                                margin: '0',
                                                fontSize: '20px',
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
                                    att: { id: 'participation-form' },
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
                                                        id: 'participation-type-select'
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
                                                        $({ tag: 'option', att: { value: 'campus' }, text: 'Campus' }),
                                                        $({ tag: 'option', att: { value: 'center' }, text: 'Center' })
                                                    ],
                                                    event: {
                                                        type: 'change',
                                                        method: (e) => {
                                                            toggleLocationSelect(e.target.value)
                                                        },
                                                        type2: 'focus',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#00bcd4'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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

                                        // Title of Activity
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Title of Activity *',
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
                                                        name: 'title',
                                                        value: isEditing ? (item.title || '') : '',
                                                        placeholder: 'Enter title of activity...',
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
                                                            e.target.style.borderColor = '#00bcd4'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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

                                        // Products Exhibited section
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
                                                                    text: 'Product/Technology Exhibited',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Add products or technologies exhibited',
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
                                                                backgroundColor: '#00bcd4',
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
                                                                    text: 'Add Product'
                                                                })
                                                            ],
                                                            event: {
                                                                type: 'click',
                                                                method: () => {
                                                                    const newRow = addProductField()
                                                                    productsContainer.appendChild(newRow)
                                                                },
                                                                type2: 'mouseenter',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.backgroundColor = '#0097a7'
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)'
                                                                },
                                                                type3: 'mouseleave',
                                                                method3: (e) => {
                                                                    e.currentTarget.style.backgroundColor = '#00bcd4'
                                                                    e.currentTarget.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    att: { id: 'products-container' },
                                                    style: {
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: '2px solid #e8eaed',
                                                        minHeight: '50px'
                                                    },
                                                    elementHandler: (el) => {
                                                        productsContainer = el
                                                        if (isEditing && products.length > 0) {
                                                            products.forEach(product => {
                                                                productsContainer.appendChild(
                                                                    addProductField(product.name, product.description)
                                                                )
                                                            })
                                                        }
                                                    }
                                                })
                                            ]
                                        }),

                                        // In-charge
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'In-charge *',
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
                                                        name: 'inCharge',
                                                        value: isEditing ? (item.inCharge || '') : '',
                                                        placeholder: 'Enter person/s in-charge...',
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
                                                            e.target.style.borderColor = '#00bcd4'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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

                                        // Venue and Sponsoring Agency row
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
                                                                    e.target.style.borderColor = '#00bcd4'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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
                                                                    e.target.style.borderColor = '#00bcd4'
                                                                    e.target.style.backgroundColor = '#ffffff'
                                                                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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

                                        // Date
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
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
                                                        fontFamily: 'inherit',
                                                        cursor: 'pointer'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#00bcd4'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 188, 212, 0.1)'
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

                                        // Paper Trail Attachments section with modern file upload
                                        $({
                                            tag: 'div',
                                            style: { marginBottom: '24px' },
                                            child: [
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
                                                                backgroundColor: '#e6f7f9',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-paperclip' },
                                                                    style: { color: '#00bcd4', fontSize: '16px' }
                                                                })
                                                            ]
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            child: [
                                                                $({
                                                                    tag: 'label',
                                                                    text: 'Paper Trail Attachments',
                                                                    style: {
                                                                        color: '#202124',
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        display: 'block',
                                                                        margin: 0
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Upload supporting documents for this activity',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#5f6368',
                                                                        display: 'block',
                                                                        marginTop: '2px'
                                                                    }
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                // Three attachment fields in a grid
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                                        gap: '16px'
                                                    },
                                                    child: [
                                                        // Activity Proposal (PDF)
                                                        createModernFileUpload('Activity Proposal', 'activity_proposal', 'fa-solid fa-file-pdf', '#ea4335', isEditing ? existingFiles.activityProposal : null, '.pdf'),
                                                        
                                                        // Photo Documentation (Multiple Images) - Updated with remove button
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#ffffff',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                                border: '2px solid #e8eaed',
                                                                transition: 'all 0.3s ease',
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            },
                                                            event: {
                                                                type: 'mouseenter',
                                                                method: (e) => {
                                                                    e.currentTarget.style.borderColor = '#00bcd4'
                                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 188, 212, 0.25)'
                                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                                },
                                                                type2: 'mouseleave',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#e8eaed'
                                                                    e.currentTarget.style.boxShadow = 'none'
                                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                                }
                                                            },
                                                            child: [
                                                                // Header with icon and label
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
                                                                                width: '36px',
                                                                                height: '36px',
                                                                                borderRadius: '10px',
                                                                                backgroundColor: 'rgba(0, 188, 212, 0.15)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                flexShrink: 0
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-images' },
                                                                                    style: { 
                                                                                        color: '#00bcd4', 
                                                                                        fontSize: '16px' 
                                                                                    }
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
                                                                                    text: 'Photo Documentation',
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
                                                                                    text: isEditing && existingFiles.photoDocumentation ? `${existingFiles.photoDocumentation.length} files attached` : 'No files attached',
                                                                                    style: {
                                                                                        fontSize: '11px',
                                                                                        color: isEditing && existingFiles.photoDocumentation ? '#34a853' : '#9aa0a6',
                                                                                        display: 'block',
                                                                                        marginTop: '2px'
                                                                                    }
                                                                                })
                                                                            ]
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Multiple',
                                                                            style: {
                                                                                fontSize: '10px',
                                                                                color: '#1a73e8',
                                                                                backgroundColor: '#e8f0fe',
                                                                                padding: '2px 10px',
                                                                                borderRadius: '12px',
                                                                                fontWeight: '600',
                                                                                flexShrink: 0
                                                                            }
                                                                        })
                                                                    ]
                                                                }),
                                                                
                                                                // File input area
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        position: 'relative',
                                                                        marginBottom: '10px'
                                                                    },
                                                                    child: [
                                                                        // Hidden file input
                                                                        $({
                                                                            tag: 'input',
                                                                            att: {
                                                                                type: 'file',
                                                                                name: 'photo_documentation',
                                                                                id: 'photo_documentation-input',
                                                                                accept: '.jpg,.jpeg,.png,.gif,.webp',
                                                                                multiple: true
                                                                            },
                                                                            style: {
                                                                                display: 'none'
                                                                            },
                                                                            event: {
                                                                                type: 'change',
                                                                                method: (e) => {
                                                                                    const files = e.target.files
                                                                                    if (files && files.length > 0) {
                                                                                        const previewContainer = document.getElementById('photo_documentation-preview-container')
                                                                                        const fileCountSpan = document.getElementById('photo_documentation-file-count')
                                                                                        
                                                                                        // Add files to paperTrailFiles
                                                                                        Array.from(files).forEach(file => {
                                                                                            if (file.type.startsWith('image/')) {
                                                                                                paperTrailFiles.photoDocumentation.push(file)
                                                                                            }
                                                                                        })
                                                                                        
                                                                                        // Add to preview
                                                                                        Array.from(files).forEach(file => {
                                                                                            if (file.type.startsWith('image/')) {
                                                                                                const reader = new FileReader()
                                                                                                reader.onload = (event) => {
                                                                                                    const imgPreview = createImagePreviewWithRemove(
                                                                                                        event.target.result, 
                                                                                                        file.name, 
                                                                                                        true,
                                                                                                        () => {
                                                                                                            // Remove from paperTrailFiles
                                                                                                            const index = paperTrailFiles.photoDocumentation.findIndex(f => f.name === file.name && f.size === file.size)
                                                                                                            if (index !== -1) {
                                                                                                                paperTrailFiles.photoDocumentation.splice(index, 1)
                                                                                                            }
                                                                                                            // Update file count
                                                                                                            if (fileCountSpan) {
                                                                                                                const currentCount = previewContainer ? previewContainer.children.length : 0
                                                                                                                fileCountSpan.textContent = currentCount
                                                                                                            }
                                                                                                            // Update attached text
                                                                                                            const attachText = document.querySelector('.photo-attach-text')
                                                                                                            if (attachText) {
                                                                                                                const remaining = paperTrailFiles.photoDocumentation.length + (existingFiles.photoDocumentation ? existingFiles.photoDocumentation.length : 0)
                                                                                                                attachText.textContent = remaining > 0 ? `${remaining} files attached` : 'No files attached'
                                                                                                                attachText.style.color = remaining > 0 ? '#34a853' : '#9aa0a6'
                                                                                                            }
                                                                                                        }
                                                                                                    )
                                                                                                    if (previewContainer) {
                                                                                                        previewContainer.appendChild(imgPreview)
                                                                                                    }
                                                                                                    // Update file count
                                                                                                    if (fileCountSpan) {
                                                                                                        const currentCount = previewContainer ? previewContainer.children.length : 0
                                                                                                        fileCountSpan.textContent = currentCount
                                                                                                    }
                                                                                                }
                                                                                                reader.readAsDataURL(file)
                                                                                            }
                                                                                        })
                                                                                        
                                                                                        showNotification(`${files.length} photo(s) added`, 'success')
                                                                                        e.target.value = ''
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        
                                                                        // Custom upload button
                                                                        $({
                                                                            tag: 'button',
                                                                            att: { type: 'button' },
                                                                            style: {
                                                                                width: '100%',
                                                                                padding: '10px 14px',
                                                                                backgroundColor: '#f8f9fa',
                                                                                border: '2px dashed #00bcd4',
                                                                                borderRadius: '8px',
                                                                                color: '#202124',
                                                                                fontSize: '13px',
                                                                                cursor: 'pointer',
                                                                                transition: 'all 0.2s ease',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gap: '8px',
                                                                                fontFamily: 'inherit'
                                                                            },
                                                                            child: [
                                                                                $({
                                                                                    tag: 'span',
                                                                                    att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                                    style: { 
                                                                                        fontSize: '16px', 
                                                                                        color: isEditing && existingFiles.photoDocumentation ? '#34a853' : '#00bcd4' 
                                                                                    }
                                                                                }),
                                                                                $({
                                                                                    tag: 'span',
                                                                                    text: isEditing && existingFiles.photoDocumentation ? 'Add More Files' : 'Choose Files'
                                                                                })
                                                                            ],
                                                                            event: {
                                                                                type: 'click',
                                                                                method: (e) => {
                                                                                    e.preventDefault()
                                                                                    const fileInput = document.getElementById('photo_documentation-input')
                                                                                    if (fileInput) fileInput.click()
                                                                                },
                                                                                type2: 'mouseenter',
                                                                                method2: (e) => {
                                                                                    e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                                                    e.currentTarget.style.borderColor = '#00bcd4'
                                                                                },
                                                                                type3: 'mouseleave',
                                                                                method3: (e) => {
                                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                                                    e.currentTarget.style.borderColor = '#00bcd4'
                                                                                }
                                                                            }
                                                                        })
                                                                    ]
                                                                }),
                                                                
                                                                // Image preview container with remove buttons
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'space-between',
                                                                        marginBottom: '8px'
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Uploaded Images:',
                                                                            style: {
                                                                                fontSize: '12px',
                                                                                color: '#5f6368',
                                                                                fontWeight: '500'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { id: 'photo_documentation-file-count' },
                                                                            text: isEditing && existingFiles.photoDocumentation ? existingFiles.photoDocumentation.length : '0',
                                                                            style: {
                                                                                fontSize: '12px',
                                                                                color: '#1a73e8',
                                                                                fontWeight: '600',
                                                                                backgroundColor: '#e8f0fe',
                                                                                padding: '2px 10px',
                                                                                borderRadius: '12px'
                                                                            }
                                                                        })
                                                                    ]
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    att: { id: 'photo_documentation-preview-container' },
                                                                    style: {
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                                        gap: '8px',
                                                                        marginBottom: '12px',
                                                                        minHeight: '50px',
                                                                        maxHeight: '200px',
                                                                        overflowY: 'auto',
                                                                        padding: '8px',
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: '8px',
                                                                        border: '1px solid #e8eaed'
                                                                    },
                                                                    elementHandler: (el) => {
                                                                        // Load existing previews from database
                                                                        if (isEditing && existingFiles.photoDocumentation && Array.isArray(existingFiles.photoDocumentation)) {
                                                                            existingFiles.photoDocumentation.forEach((url, index) => {
                                                                                const imgPreview = createImagePreviewWithRemove(
                                                                                    url, 
                                                                                    `Image ${index + 1}`, 
                                                                                    false,
                                                                                    () => {
                                                                                        // Remove from existingFiles
                                                                                        const idx = existingFiles.photoDocumentation.indexOf(url)
                                                                                        if (idx !== -1) {
                                                                                            existingFiles.photoDocumentation.splice(idx, 1)
                                                                                            // Update file count
                                                                                            const fileCountSpan = document.getElementById('photo_documentation-file-count')
                                                                                            if (fileCountSpan) {
                                                                                                fileCountSpan.textContent = existingFiles.photoDocumentation.length
                                                                                            }
                                                                                            // Update attached text
                                                                                            const attachText = document.querySelector('.photo-attach-text')
                                                                                            if (attachText) {
                                                                                                const remaining = paperTrailFiles.photoDocumentation.length + existingFiles.photoDocumentation.length
                                                                                                attachText.textContent = remaining > 0 ? `${remaining} files attached` : 'No files attached'
                                                                                                attachText.style.color = remaining > 0 ? '#34a853' : '#9aa0a6'
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                )
                                                                                el.appendChild(imgPreview)
                                                                            })
                                                                            // Update file count
                                                                            const fileCountSpan = document.getElementById('photo_documentation-file-count')
                                                                            if (fileCountSpan) {
                                                                                fileCountSpan.textContent = existingFiles.photoDocumentation.length
                                                                            }
                                                                        }
                                                                        
                                                                        // Update file count whenever children change
                                                                        const observer = new MutationObserver(() => {
                                                                            const fileCountSpan = document.getElementById('photo_documentation-file-count')
                                                                            if (fileCountSpan) {
                                                                                fileCountSpan.textContent = el.children.length
                                                                            }
                                                                            // Update attached text
                                                                            const attachText = document.querySelector('.photo-attach-text')
                                                                            if (attachText) {
                                                                                const remaining = paperTrailFiles.photoDocumentation.length + (existingFiles.photoDocumentation ? existingFiles.photoDocumentation.length : 0)
                                                                                attachText.textContent = remaining > 0 ? `${remaining} files attached` : 'No files attached'
                                                                                attachText.style.color = remaining > 0 ? '#34a853' : '#9aa0a6'
                                                                            }
                                                                        })
                                                                        observer.observe(el, { childList: true, subtree: true })
                                                                    }
                                                                }),
                                                                
                                                                // Action buttons (if files exist)
                                                                ...(isEditing && existingFiles.photoDocumentation && existingFiles.photoDocumentation.length > 0 ? [
                                                                    $({
                                                                        tag: 'div',
                                                                        style: {
                                                                            display: 'flex',
                                                                            gap: '8px',
                                                                            marginTop: '4px'
                                                                        },
                                                                        child: [
                                                                            // View button
                                                                            $({
                                                                                tag: 'button',
                                                                                att: { type: 'button' },
                                                                                style: {
                                                                                    flex: 1,
                                                                                    padding: '8px 12px',
                                                                                    backgroundColor: 'transparent',
                                                                                    border: '1px solid #e8eaed',
                                                                                    borderRadius: '8px',
                                                                                    color: '#1a73e8',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer',
                                                                                    fontWeight: '500',
                                                                                    transition: 'all 0.2s ease',
                                                                                    fontFamily: 'inherit',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    gap: '6px'
                                                                                },
                                                                                child: [
                                                                                    $({
                                                                                        tag: 'span',
                                                                                        att: { className: 'fa-solid fa-eye' },
                                                                                        style: { fontSize: '12px' }
                                                                                    }),
                                                                                    $({
                                                                                        tag: 'span',
                                                                                        text: 'View Files'
                                                                                    })
                                                                                ],
                                                                                event: {
                                                                                    type: 'click',
                                                                                    method: (e) => {
                                                                                        e.preventDefault()
                                                                                        if (existingFiles.photoDocumentation && existingFiles.photoDocumentation.length > 0) {
                                                                                            window.open(existingFiles.photoDocumentation[0], '_blank')
                                                                                        }
                                                                                    },
                                                                                    type2: 'mouseenter',
                                                                                    method2: (e) => {
                                                                                        e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                                                        e.currentTarget.style.borderColor = '#1a73e8'
                                                                                    },
                                                                                    type3: 'mouseleave',
                                                                                    method3: (e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                                                        e.currentTarget.style.borderColor = '#e8eaed'
                                                                                    }
                                                                                }
                                                                            }),
                                                                            // Download button
                                                                            $({
                                                                                tag: 'button',
                                                                                att: { type: 'button' },
                                                                                style: {
                                                                                    flex: 1,
                                                                                    padding: '8px 12px',
                                                                                    backgroundColor: 'transparent',
                                                                                    border: '1px solid #e8eaed',
                                                                                    borderRadius: '8px',
                                                                                    color: '#34a853',
                                                                                    fontSize: '12px',
                                                                                    cursor: 'pointer',
                                                                                    fontWeight: '500',
                                                                                    transition: 'all 0.2s ease',
                                                                                    fontFamily: 'inherit',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    gap: '6px'
                                                                                },
                                                                                child: [
                                                                                    $({
                                                                                        tag: 'span',
                                                                                        att: { className: 'fa-solid fa-download' },
                                                                                        style: { fontSize: '12px' }
                                                                                    }),
                                                                                    $({
                                                                                        tag: 'span',
                                                                                        text: 'Download All'
                                                                                    })
                                                                                ],
                                                                                event: {
                                                                                    type: 'click',
                                                                                    method: (e) => {
                                                                                        e.preventDefault()
                                                                                        if (existingFiles.photoDocumentation && existingFiles.photoDocumentation.length > 0) {
                                                                                            existingFiles.photoDocumentation.forEach(file => window.open(file, '_blank'))
                                                                                        }
                                                                                    },
                                                                                    type2: 'mouseenter',
                                                                                    method2: (e) => {
                                                                                        e.currentTarget.style.backgroundColor = '#e6f4ea'
                                                                                        e.currentTarget.style.borderColor = '#34a853'
                                                                                    },
                                                                                    type3: 'mouseleave',
                                                                                    method3: (e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                                                        e.currentTarget.style.borderColor = '#e8eaed'
                                                                                    }
                                                                                }
                                                                            })
                                                                        ]
                                                                    })
                                                                ] : [])
                                                            ]
                                                        }),
                                                        
                                                        // Activity Report (PDF)
                                                        createModernFileUpload('Activity Report', 'activity_report', 'fa-solid fa-file-alt', '#1a73e8', isEditing ? existingFiles.activityReport : null, '.pdf')
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
                                                marginTop: '24px',
                                                borderTop: '1px solid #e8eaed',
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
                                                    text: isEditing ? 'Update Participation' : 'Add Participation',
                                                    style: {
                                                        padding: '12px 32px',
                                                        backgroundColor: '#00bcd4',
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
                                                            e.currentTarget.style.backgroundColor = '#0097a7'
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)'
                                                        },
                                                        type2: 'mouseleave',
                                                        method2: (e) => {
                                                            e.currentTarget.style.backgroundColor = '#00bcd4'
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
                                            await saveParticipationData(isEditing)
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

        setTimeout(() => {
            const typeSelect = document.getElementById('participation-type-select')
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
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        border: '2px dashed #e8eaed',
                        textAlign: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: '👆',
                            style: { fontSize: '24px', display: 'block', marginBottom: '8px' }
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
                        })
                    ]
                })
            )
            return
        }

        const options = type === 'campus' ? campuses.filter(c => c !== 'All Campuses') : centers.filter(c => c !== 'All Centers')
        const labelText = type === 'campus' ? 'Select Campus *' : 'Select Center *'

        container.appendChild(
            $({
                tag: 'div',
                style: {
                    animation: 'fadeIn 0.3s ease'
                },
                child: [
                    $({
                        tag: 'label',
                        text: labelText,
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
                            name: 'location',
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
                            $({ 
                                tag: 'option', 
                                att: { value: '' }, 
                                text: `-- Select ${type === 'campus' ? 'Campus' : 'Center'} --` 
                            }),
                            ...options.map(opt =>
                                $({
                                    tag: 'option',
                                    att: { value: opt, selected: opt === selectedValue },
                                    text: opt
                                })
                            )
                        ],
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#f5a623'
                                e.target.style.backgroundColor = '#ffffff'
                                e.target.style.boxShadow = '0 0 0 4px rgba(245,166,35,0.1)'
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
        )
    }

    const saveParticipationData = async (isEditing) => {
        const form = document.getElementById('participation-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_participation' : 'add_participation')

        // Add dynamic arrays as JSON
        formData.append('products', JSON.stringify(products))
        formData.append('paperTrailLinks', JSON.stringify(paperTrailLinks))

        showLoading()
        try {
            const response = await fetch('/api/participation-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Participation record updated successfully' : 'Participation record added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving participation data', 'error')
            }
        } catch (error) {
            console.error('Error saving participation:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const refreshData = async () => {
        participationData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchParticipationData()
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
                                        background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-flag' },
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
                                            text: 'Summary List of Participation to Fairs, Exhibits & Technology Pitching',
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
                                            text: 'Manage and track all fair, exhibit, and technology pitching participations'
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
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)'
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
                                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 188, 212, 0.1)'
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
                // Add Participation button
                $({
                    tag: 'button',
                    style: {
                        padding: '10px 24px',
                        backgroundColor: '#00bcd4',
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
                            text: 'Add Participation'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: openAddModal,
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#0097a7'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 188, 212, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#00bcd4'
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
                // Total Activities
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#00bcd4'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 188, 212, 0.12)'
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
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#e6f7f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #b3e8f0'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-flag' },
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
                                    att: { className: 'stat-total-activities stat-value' },
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
                                    text: 'Total Activities',
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
                // Total Products
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.borderColor = '#7c3aed'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.12)'
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
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#f3e8f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #e8d5f5'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-boxes-stacked' },
                                    style: { color: '#7c3aed', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-total-products stat-value' },
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
                                    text: 'Products Exhibited',
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

    const createTypeStat = (label, color, className, icon) => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: `2px solid #e8eaed`,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = color
                    e.currentTarget.style.boxShadow = `0 4px 12px ${color}25`
                    e.currentTarget.style.backgroundColor = `${color}08`
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#e8eaed'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'
                    e.currentTarget.style.backgroundColor = '#ffffff'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        border: `2px solid ${color}25`
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${icon}` },
                            style: {
                                fontSize: '20px',
                                color: color,
                                opacity: 0.8
                            }
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { className },
                    text: '0',
                    style: {
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#202124',
                        lineHeight: '1.2'
                    }
                }),
                $({
                    tag: 'span',
                    text: label,
                    style: {
                        fontSize: '12px',
                        color: '#5f6368',
                        fontWeight: '500',
                        marginTop: '4px'
                    }
                })
            ]
        })
    }

    const TableHeader = () => {
        const headers = [
            { key: 'NO.', align: 'center', width: '70px' },
            { key: 'Title of Activity', align: 'left', width: '200px' },
            { key: 'Product/Technology\nExhibited', align: 'left', width: '180px' },
            { key: 'In-charge', align: 'left', width: '150px' },
            { key: 'Venue', align: 'left', width: '150px' },
            { key: 'Sponsoring Agency', align: 'left', width: '180px' },
            { key: 'Date', align: 'center', width: '100px' },
            { key: 'Link of the Paper Trail', align: 'left', width: '200px' },
            { key: 'ACTIONS', align: 'center', width: '80px' }
        ]

        const row = $({ tag: 'tr' })

        headers.forEach(({ key, align, width }) => {
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
                    borderBottom: '3px solid #00bcd4',
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
                        tag: 'span',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: align === 'center' ? 'center' : 'flex-start'
                        },
                        child: [
                            ...(key === 'NO.' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-hashtag' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Title of Activity' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-flag' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Product/Technology\nExhibited' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-boxes-stacked' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'In-charge' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-user' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Venue' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-location-dot' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Sponsoring Agency' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-building' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Date' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-calendar' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'Link of the Paper Trail' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-link' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            ...(key === 'ACTIONS' ? [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-tools' },
                                    style: { fontSize: '11px', opacity: '0.6' }
                                })
                            ] : []),
                            $({
                                tag: 'span',
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
                height: '100%',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderRadius: '12px',
                border: '2px solid #e8eaed',
                margin: '0 24px 24px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                overflowX: 'scroll',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px'
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#a8a8a8'
                }
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchParticipationData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '1600px',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff',
                        tableLayout: 'fixed'
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
        att: { className: 'participation-research-container' },
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

export default participationResearch
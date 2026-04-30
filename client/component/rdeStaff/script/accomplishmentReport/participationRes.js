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

    // Fetch participation data
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

            const response = await fetch('/api/participation-research', {
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

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchParticipationData(nextCursor)
        }
    }

    // Update statistics
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
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
                    att: { className: 'fa-solid fa-flag' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#00bcd4'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Participation Records Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add Participation" to add participation to fairs, exhibits & technology pitching records',
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


    // Render products exhibited
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
                        padding: '8px 10px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(0, 188, 212, 0.05)' : 'transparent',
                        borderRadius: '6px',
                        borderLeft: '3px solid #00bcd4',
                        borderBottom: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                color: '#ddd',
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
                        color: '#00bcd4',
                        textDecoration: 'none',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                        padding: '6px 10px',
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(0, 188, 212, 0.2)',
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
                            e.target.style.backgroundColor = 'rgba(0, 188, 212, 0.2)'
                            e.target.style.borderColor = 'rgba(0, 188, 212, 0.4)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.backgroundColor = 'rgba(0, 188, 212, 0.1)'
                            e.target.style.borderColor = 'rgba(0, 188, 212, 0.2)'
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

        // Title of Activity (with type badge)
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '250px'
                },
                child: [
                    $({
                        tag: 'div',
                        text: item.title || '—',
                        style: {
                            color: '#ddd',
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
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '200px'
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
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '180px'
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
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '150px'
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
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    lineHeight: '1.4',
                    minWidth: '180px'
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
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap'
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
                            deleteActivity(item)
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

    // Delete activity
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

        // Containers for dynamic fields
        let linksContainer
        let productsContainer

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
                            $({ tag: 'option', att: { value: 'Activity Proposal', selected: label === 'Activity Proposal' }, text: 'Activity Proposal' }),
                            $({ tag: 'option', att: { value: 'Invitation Letter', selected: label === 'Invitation Letter' }, text: 'Invitation Letter' }),
                            $({ tag: 'option', att: { value: 'Certificate', selected: label === 'Certificate' }, text: 'Certificate' }),
                            $({ tag: 'option', att: { value: 'Photo Documentation', selected: label === 'Photo Documentation' }, text: 'Photo Documentation' }),
                            $({ tag: 'option', att: { value: 'Activity Report', selected: label === 'Activity Report' }, text: 'Activity Report' }),
                            $({ tag: 'option', att: { value: 'Program', selected: label === 'Program' }, text: 'Program' }),
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
                                products.splice(productIndex, 1)
                                productRow.remove()
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
                        width: '800px',
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
                                    text: isEditing ? 'Edit Participation Record' : 'Add Participation to Fair/Exhibit/Technology Pitching',
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
                            att: { id: 'participation-form' },
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
                                                id: 'participation-type-select'
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

                                // Title of Activity
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'absolute',
                                        gridTemplateColumns: '2fr 1fr',
                                        gap: '16px',
                                        marginBottom: '20px',
                                        width: '100%'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Title of Activity *',
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
                                                        name: 'title',
                                                        value: isEditing ? (item.title || '') : '',
                                                        placeholder: 'Enter title of activity...',
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
                                // Products Exhibited section
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
                                                    text: 'Product/Technology Exhibited',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Product',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#00bcd4',
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
                                                            const newRow = addProductField()
                                                            productsContainer.appendChild(newRow)
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#0097a7'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#00bcd4'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'products-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
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
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'In-charge *',
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
                                                name: 'inCharge',
                                                value: isEditing ? (item.inCharge || '') : '',
                                                placeholder: 'Enter person/s in-charge...',
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

                                // Venue and Sponsoring Agency row
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

                                // Date
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
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
                                                    text: 'Link of the Paper Trail (Activity Proposal, Photo Documentation, Activity Report, etc.)',
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
                                            text: isEditing ? 'Update Participation' : 'Add Participation',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#00bcd4',
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
                                                    e.target.style.backgroundColor = '#0097a7'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#00bcd4'
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

        document.body.appendChild(modalElement)

        // Initialize location select based on existing data
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

    // Save participation data
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

    // Refresh data
    const refreshData = async () => {
        participationData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchParticipationData()
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
                                    att: { className: 'fa-solid fa-flag' },
                                    style: { color: '#00bcd4', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Participation to Fairs, Exhibits & Technology Pitching',
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
                                })
                            ]
                        })
                    ]
                }),
                // Add Participation button
                $({
                    tag: 'button',
                    text: '+ Add Participation',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#00bcd4',
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
                            e.target.style.backgroundColor = '#0097a7'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 188, 212, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#00bcd4'
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
                // Total Activities
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
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Activities',
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
                // Total Products
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
                                    att: { className: 'fa-solid fa-boxes-stacked' },
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
                                    att: { className: 'stat-total-products stat-value' },
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
                                    text: 'Products Exhibited',
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
            ]
        })
    }

    // Create type stat item
    const createTypeStat = (label, color, className, icon) => {
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
            'Title of Activity',
            'Product/Technology\nExhibited',
            'In-charge',
            'Venue',
            'Sponsoring Agency',
            'Date',
            'Link of the Paper Trail',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'Date', 'ACTIONS'].includes(header)

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
                height: 'calc(100% - 300px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
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
                        minWidth: '1800px',
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
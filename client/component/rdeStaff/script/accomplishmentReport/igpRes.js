import { $, Waiting } from "../../../../lib/lib.js"

export const igpResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let igpData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let activeFilter = 'all'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    // Stats state
    let currentStats = {
        totalProjects: 0,
        totalIncome: 0,
        q1Income: 0,
        q2Income: 0,
        q3Income: 0,
        q4Income: 0
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

    // Fetch IGP data
    const fetchIgpData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            igpData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_igp')

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

            const response = await fetch('/api/igp-research', {
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
                    igpData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalProjects
                        updateStats()
                    }
                } else {
                    igpData = [...igpData, ...newData]
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
            console.error('Error fetching IGP data:', error)
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
            fetchIgpData(nextCursor)
        }
    }

    // Update statistics
    const updateStats = () => {
        const statValues = document.querySelectorAll('.stat-value')
        const statLabels = document.querySelectorAll('.stat-label')

        // Update total projects
        if (statValues[0]) statValues[0].textContent = currentStats.totalProjects

        // Update total income
        if (statValues[1]) statValues[1].textContent = formatCurrency(currentStats.totalIncome)

        // Update quarter incomes
        const quarterStats = document.querySelectorAll('.quarter-stat-value')
        if (quarterStats.length >= 4) {
            quarterStats[0].textContent = formatCurrency(currentStats.q1Income)
            quarterStats[1].textContent = formatCurrency(currentStats.q2Income)
            quarterStats[2].textContent = formatCurrency(currentStats.q3Income)
            quarterStats[3].textContent = formatCurrency(currentStats.q4Income)
        }
    }

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '₱0.00'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
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
                marginLeft: '90%',
                height: '350px',
                width: '100%',
                color: '#888',
                fontFamily: 'Segoe UI, sans-serif',
                gridColumn: '1 / -1'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-coins' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#ff9800'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Income Generated Projects Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add IGP Project" to add income generated project records',
                    style: {
                        fontSize: '14px',
                        opacity: 0.7
                    }
                })
            ]
        })

        tableBody.appendChild(emptyState)
    }

    // Render clients list
    const renderClients = (clients) => {
        if (!clients || clients === '—') return '—'

        let clientList = []
        try {
            if (typeof clients === 'string') {
                clientList = JSON.parse(clients)
            } else if (Array.isArray(clients)) {
                clientList = clients
            } else {
                return clients
            }
        } catch (e) {
            return clients
        }

        if (clientList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            },
            child: clientList.map((client, idx) => {
                const name = typeof client === 'string' ? client : client.name || 'Unknown'
                const type = typeof client === 'object' ? client.type : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '6px 8px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
                        borderRadius: '4px',
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
                        ...(type ? [
                            $({
                                tag: 'div',
                                text: type,
                                style: {
                                    color: '#ff9800',
                                    fontSize: '10px',
                                    fontStyle: 'italic',
                                    lineHeight: '1.3',
                                    marginTop: '2px',
                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-block'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    // Render income cell with color
    const renderIncomeCell = (amount) => {
        const value = amount || 0

        let bgColor = 'transparent'
        let textColor = '#ddd'

        if (value > 100000) {
            bgColor = 'rgba(76, 175, 80, 0.1)'
            textColor = '#4caf50'
        } else if (value > 50000) {
            bgColor = 'rgba(33, 150, 243, 0.1)'
            textColor = '#2196f3'
        } else if (value > 10000) {
            bgColor = 'rgba(255, 152, 0, 0.1)'
            textColor = '#ff9800'
        } else if (value > 0) {
            bgColor = 'rgba(158, 158, 158, 0.1)'
            textColor = '#9e9e9e'
        }

        return $({
            tag: 'td',
            style: {
                padding: '12px 8px',
                textAlign: 'right',
                fontSize: '13px',
                fontWeight: value > 0 ? '600' : 'normal',
                color: textColor,
                backgroundColor: bgColor,
                border: '1px solid #444',
                whiteSpace: 'nowrap',
                fontFamily: "'Courier New', monospace"
            },
            text: formatCurrency(value)
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

        // Research Program/Project Title
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

        // Researchers/Project In-Charge
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
                text: item.researchers || '—'
            })
        )

        // Description
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
                text: item.description || '—'
            })
        )

        // Technology/Product/Commodity Generated and Commercialized
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
                text: item.technology || '—'
            })
        )

        // Clients
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '180px'
                },
                child: [renderClients(item.clients)]
            })
        )

        // Quarter incomes
        const quarters = ['q1Income', 'q2Income', 'q3Income', 'q4Income']
        quarters.forEach(q => {
            cells.push(renderIncomeCell(item[q]))
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
                            deleteProject(item)
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

    // Delete project
    const deleteProject = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this IGP project record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_igp')
            formData.append('id', item.id)

            const response = await fetch('/api/igp-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('IGP Project record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete IGP project record', 'error')
            }
        } catch (error) {
            console.error('Error deleting IGP project:', error)
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

        // Clients state
        let clients = []
        if (isEditing && item.clients) {
            try {
                clients = typeof item.clients === 'string' ? JSON.parse(item.clients) : item.clients
                if (!Array.isArray(clients)) clients = []
            } catch (e) {
                clients = []
            }
        }

        // Container for client fields
        let clientsContainer

        // Function to add a client field
        const addClientField = (name = '', type = '') => {
            const clientIndex = clients.length
            clients.push({ name, type })

            const clientRow = $({
                tag: 'div',
                att: { className: 'client-row', 'data-client-index': clientIndex },
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
                            placeholder: 'Client name',
                            value: name,
                            className: 'client-name-input'
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
                                if (clients[clientIndex]) {
                                    clients[clientIndex].name = e.target.value
                                }
                            }
                        }
                    }),
                    $({
                        tag: 'select',
                        att: { className: 'client-type-select' },
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
                            $({ tag: 'option', att: { value: '' }, text: '-- Client Type --' }),
                            $({ tag: 'option', att: { value: 'Farmers', selected: type === 'Farmers' }, text: 'Farmers' }),
                            $({ tag: 'option', att: { value: 'Association', selected: type === 'Association' }, text: 'Association' }),
                            $({ tag: 'option', att: { value: 'Faculty', selected: type === 'Faculty' }, text: 'Faculty' }),
                            $({ tag: 'option', att: { value: 'Students', selected: type === 'Students' }, text: 'Students' }),
                            $({ tag: 'option', att: { value: 'LGU', selected: type === 'LGU' }, text: 'LGU' }),
                            $({ tag: 'option', att: { value: 'NGA', selected: type === 'NGA' }, text: 'NGA' }),
                            $({ tag: 'option', att: { value: 'Private Sector', selected: type === 'Private Sector' }, text: 'Private Sector' }),
                            $({ tag: 'option', att: { value: 'Other', selected: type === 'Other' }, text: 'Other' })
                        ],
                        event: {
                            type: 'change',
                            method: (e) => {
                                if (clients[clientIndex]) {
                                    clients[clientIndex].type = e.target.value
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
                                clients.splice(clientIndex, 1)
                                clientRow.remove()
                            }
                        }
                    })
                ]
            })

            return clientRow
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
                                    text: isEditing ? 'Edit IGP Project' : 'Add IGP Project',
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
                            att: { id: 'igp-research-form' },
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
                                                id: 'igp-type-select'
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

                                // No. (auto-generated, hidden)
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'hidden',
                                        name: 'number',
                                        value: isEditing ? (item.number || '') : ''
                                    }
                                }),

                                // Research Program/Project Title
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Research Program/Project Title *',
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
                                                placeholder: 'Enter research program/project title...',
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

                                // Researchers/Project In-Charge
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Researchers/ Project In-Charge *',
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
                                                name: 'researchers',
                                                value: isEditing ? (item.researchers || '') : '',
                                                placeholder: 'Enter researchers or project in-charge...',
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

                                // Description
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Description',
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
                                                name: 'description',
                                                placeholder: 'Enter project description...',
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
                                                fontFamily: 'inherit'
                                            },
                                            text: isEditing ? (item.description || '') : ''
                                        })
                                    ]
                                }),

                                // Technology/Product/Commodity Generated and Commercialized
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Technology/Product/Commodity Generated and Commercialized',
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
                                                name: 'technology',
                                                placeholder: 'Enter technology, product, or commodity generated and commercialized...',
                                                rows: '2'
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
                                            text: isEditing ? (item.technology || '') : ''
                                        })
                                    ]
                                }),

                                // Clients section
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
                                                    text: 'Clients (Farmers, Association, Faculty, etc.)',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Client',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#ff9800',
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
                                                            const newRow = addClientField()
                                                            clientsContainer.appendChild(newRow)
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#e68900'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#ff9800'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'clients-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                clientsContainer = el
                                                if (isEditing && clients.length > 0) {
                                                    clients.forEach(client => {
                                                        clientsContainer.appendChild(
                                                            addClientField(client.name, client.type)
                                                        )
                                                    })
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Quarter Income
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Income Generated per Quarter (₱)',
                                            style: {
                                                display: 'block',
                                                marginBottom: '12px',
                                                color: '#aaa',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(4, 1fr)',
                                                gap: '12px'
                                            },
                                            child: [
                                                createQuarterIncomeField('q1Income', '1st Quarter', isEditing ? item?.q1Income : ''),
                                                createQuarterIncomeField('q2Income', '2nd Quarter', isEditing ? item?.q2Income : ''),
                                                createQuarterIncomeField('q3Income', '3rd Quarter', isEditing ? item?.q3Income : ''),
                                                createQuarterIncomeField('q4Income', '4th Quarter', isEditing ? item?.q4Income : '')
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
                                            text: isEditing ? 'Update IGP Project' : 'Add IGP Project',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#ff9800',
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
                                                    e.target.style.backgroundColor = '#e68900'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#ff9800'
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
                                    await saveProjectData(isEditing)
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
            const typeSelect = document.getElementById('igp-type-select')
            if (isEditing && item.type) {
                typeSelect.value = item.type
                toggleLocationSelect(item.type, item.location)
            } else {
                toggleLocationSelect('', '')
            }
        }, 100)
    }

    // Create quarter income field
    const createQuarterIncomeField = (name, label, value) => {
        return $({
            tag: 'div',
            child: [
                $({
                    tag: 'label',
                    text: label,
                    style: {
                        display: 'block',
                        marginBottom: '6px',
                        color: '#888',
                        fontSize: '11px',
                        textAlign: 'center',
                        fontWeight: '500'
                    }
                }),
                $({
                    tag: 'input',
                    att: {
                        type: 'number',
                        name: name,
                        value: value || '',
                        placeholder: '0.00',
                        step: '0.01',
                        min: '0'
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
                        textAlign: 'center',
                        fontFamily: "'Courier New', monospace"
                    }
                })
            ]
        })
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

    // Save project data
    const saveProjectData = async (isEditing) => {
        const form = document.getElementById('igp-research-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_igp' : 'add_igp')

        // Add clients as JSON
        formData.append('clients', JSON.stringify(clients))

        showLoading()
        try {
            const response = await fetch('/api/igp-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'IGP Project updated successfully' : 'IGP Project added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving IGP project data', 'error')
            }
        } catch (error) {
            console.error('Error saving IGP project:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Refresh data
    const refreshData = async () => {
        igpData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchIgpData()
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
                                    att: { className: 'fa-solid fa-coins' },
                                    style: { color: '#ff9800', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Research Income Generated Projects Maintained',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '20px',
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
                // Add Project button
                $({
                    tag: 'button',
                    text: '+ Add IGP Project',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#ff9800',
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
                            e.target.style.backgroundColor = '#e68900'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#ff9800'
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            child: [
                // Total Projects
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
                                    att: { className: 'fa-solid fa-project-diagram' },
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
                                    text: 'Total Projects',
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
                // Total Income Generated
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
                                    att: { className: 'fa-solid fa-peso-sign' },
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
                                    att: { className: 'stat-value' },
                                    text: '₱0.00',
                                    style: {
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Income',
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
                // Quarter Breakdown
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
                            text: 'Quarter Income Breakdown',
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
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createQuarterStat('1st Qtr', '#2196f3', 0),
                                createQuarterStat('2nd Qtr', '#4caf50', 1),
                                createQuarterStat('3rd Qtr', '#ff9800', 2),
                                createQuarterStat('4th Qtr', '#9c27b0', 3)
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create quarter stat item
    const createQuarterStat = (label, color, index) => {
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
                    att: { className: 'quarter-stat-value' },
                    text: '₱0.00',
                    style: {
                        fontSize: '18px',
                        fontWeight: '700',
                        color: color,
                        lineHeight: '1.2',
                        fontFamily: "'Courier New', monospace"
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
            'Research Program/\nProject Title',
            'Researchers/\nProject In-Charge',
            'Description',
            'Technology/Product/Commodity\nGenerated and Commercialized',
            'Clients\n(Farmers, Association,\nFaculty, etc.)',
            'Income generated\nfor the 1st Qtr',
            'Income generated\nfor the 2nd Qtr',
            'Income generated\nfor the 3rd Qtr',
            'Income generated\nfor the 4th Qtr',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', ...Array.from({ length: 4 }, (_, i) => i + 6), 10].includes(index)

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
                    letterSpacing: '0.7px'
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
                height: 'calc(100% - 320px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchIgpData()
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
        att: { className: 'igp-research-container' },
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

export default igpResearch
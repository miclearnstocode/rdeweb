import { $, Waiting, DragDropUpload } from "../../../../lib/lib.js"

/** What I need to do when getting data from the local symposium add a inhouse proposal, program and symposium paper **/
export const completedResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let completedData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    let currentStats = {
        totalCompleted: 0,
        totalBudget: 0
    }

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

    const fetchCompletedData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            completedData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_completed')

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

            const response = await fetch('/completedResesearch', {
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
                    completedData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalCompleted
                        updateStats()
                    }
                } else {
                    completedData = [...completedData, ...newData]
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
            console.error('Error fetching completed research:', error)
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
            fetchCompletedData(nextCursor)
        }
    }

    const updateStats = () => {
        const statValues = document.querySelectorAll('.stat-value')
        if (statValues.length >= 2) {
            statValues[0].textContent = currentStats.totalCompleted
            statValues[1].textContent = formatCurrency(currentStats.totalBudget)
        }
    }

    const formatCurrency = (amount) => {
        if (!amount) return '₱0'
        return '₱' + Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
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

        // Create a single cell that spans all columns
        const emptyCell = $({
            tag: 'td',
            att: { colSpan: '14' }, // Adjust this number to match your total columns
            style: {
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent'
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
                        minHeight: '400px',
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        fontFamily: 'Segoe UI, sans-serif',
                        padding: '40px 20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        margin: '20px 0'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-check-circle' },
                            style: {
                                fontSize: '72px',
                                marginBottom: '20px',
                                color: '#4caf50',
                                opacity: 0.4
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'No Completed Research Found',
                            style: {
                                fontSize: '22px',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#1a1a1a',
                                letterSpacing: '-0.3px'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Start tracking your completed research projects',
                            style: {
                                fontSize: '15px',
                                color: '#6b7280',
                                marginBottom: '28px',
                                fontWeight: '400'
                            }
                        }),
                        $({
                            tag: 'button',
                            text: '+ Add Research',
                            style: {
                                padding: '12px 32px',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                borderRadius: '25px',
                                color: '#ffffff',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                            },
                            event: {
                                type: 'click',
                                method: openAddModal,
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.target.style.backgroundColor = '#45a049'
                                    e.target.style.transform = 'translateY(-2px)'
                                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.target.style.backgroundColor = '#4caf50'
                                    e.target.style.transform = 'translateY(0)'
                                    e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)'
                                }
                            }
                        })
                    ]
                })
            ]
        })

        // Create a row with the empty cell
        const emptyRow = $({
            tag: 'tr',
            style: {
                backgroundColor: 'transparent'
            },
            child: [emptyCell]
        })

        tableBody.appendChild(emptyRow)
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
                gap: '4px'
            },
            child: linkArray.map((link, idx) => {
                const url = typeof link === 'string' ? link : link.url || link
                const label = typeof link === 'string' ? `Link ${idx + 1}` : (link.label || `Link ${idx + 1}`)

                return $({
                    tag: 'a',
                    att: {
                        href: url,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    },
                    text: label,
                    style: {
                        color: 'deepskyblue',
                        textDecoration: 'none',
                        fontSize: '12px',
                        wordBreak: 'break-all'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.textDecoration = 'underline'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.textDecoration = 'none'
                        }
                    }
                })
            })
        })
    }

    const createDataRow = (item, rowNumber) => {
        const cells = []

        // Fixed columns
        const fixedValues = [
            rowNumber.toString(),
            item.title || '—',
            item.researchers || '—',
            formatDate(item.dateStarted),
            formatDate(item.dateCompleted),
            item.duration || '—',
            formatCurrency(item.budget),
            item.fundSource || '—'
        ]

        fixedValues.forEach((value, index) => {
            const align = index === 0 ? 'center' : (index === 1 || index === 2 ? 'left' : 'center')
            cells.push(
                $({
                    tag: 'td',
                    style: {
                        padding: '14px 12px',
                        fontSize: '13px',
                        color: '#1a1a1a',
                        border: '1px solid #e5e7eb',
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

        // Links column
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 10px',
                    border: '1px solid #e5e7eb',
                    verticalAlign: 'top',
                    maxWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [renderLinks(item.links)]
            })
        )

        // Quarter percentages
        const quarters = ['q1', 'q2', 'q3', 'q4']
        quarters.forEach(q => {
            const value = item[q] || item[`${q}Percentage`] || 0
            let bgColor = '#ffffff'
            let textColor = '#1a1a1a'

            if (value >= 80) {
                bgColor = '#e8f5e9'
                textColor = '#2e7d32'
            } else if (value >= 50) {
                bgColor = '#fff3e0'
                textColor = '#e65100'
            } else if (value > 0) {
                bgColor = '#fce4ec'
                textColor = '#c62828'
            }

            cells.push(
                $({
                    tag: 'td',
                    style: {
                        padding: '14px 10px',
                        textAlign: 'center',
                        border: '1px solid #e5e7eb',
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: value > 0 ? '600' : '400',
                        fontSize: '14px'
                    },
                    text: value > 0 ? `${value}%` : '—'
                })
            )
        })

        // Actions cell
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 10px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb',
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
                transition: 'all 0.15s ease',
                borderBottom: '1px solid #f3f4f6'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.boxShadow = 'none'
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
                $({
                    tag: 'button',
                    att: { 
                        className: 'fa-solid fa-pen',
                        title: 'Edit'
                    },
                    style: {
                        color: '#ffffff',
                        backgroundColor: '#3b82f6',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        minHeight: '32px'
                    },
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.target.style.backgroundColor = '#2563eb'
                            e.target.style.transform = 'scale(1.05)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#3b82f6'
                            e.target.style.transform = 'scale(1)'
                        }
                    }
                }),
                $({
                    tag: 'button',
                    att: { 
                        className: 'fa-solid fa-trash',
                        title: 'Delete'
                    },
                    style: {
                        color: '#ffffff',
                        backgroundColor: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        minHeight: '32px'
                    },
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteResearch(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.target.style.backgroundColor = '#dc2626'
                            e.target.style.transform = 'scale(1.05)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#ef4444'
                            e.target.style.transform = 'scale(1)'
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

    const deleteResearch = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this research record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_completed')
            formData.append('id', item.id)

            const response = await fetch('/completedResesearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Research record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete research record', 'error')
            }
        } catch (error) {
            console.error('Error deleting research:', error)
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

        // Link management state (now for file uploads)
        let researchFiles = []
        if (isEditing && item.files) {
            try {
                researchFiles = typeof item.files === 'string' ? JSON.parse(item.files) : item.files
                if (!Array.isArray(researchFiles)) researchFiles = []
            } catch (e) {
                researchFiles = []
            }
        }

        // File upload component reference
        let fileUploadComponent = null

        // Create drag and drop upload component
        const createFileUpload = () => {
            const upload = DragDropUpload({
                label: 'Research Paper Files',
                accept: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png',
                multiple: true,
                currentFiles: researchFiles,
                maxSizeMB: 20,
                description: 'Drag & drop research paper files here or click to browse',
                showPreview: true,
                className: 'research-file-upload',
                onFileSelect: (newFiles, allFiles) => {
                    researchFiles = allFiles
                    // Update the hidden input value
                    const fileDataInput = document.getElementById('research-files-data')
                    if (fileDataInput) {
                        fileDataInput.value = JSON.stringify(researchFiles.map(f => ({
                            name: f.name,
                            size: f.size,
                            type: f.type
                        })))
                    }
                },
                onFileRemove: (removedFile, index, allFiles) => {
                    researchFiles = allFiles
                    const fileDataInput = document.getElementById('research-files-data')
                    if (fileDataInput) {
                        fileDataInput.value = JSON.stringify(researchFiles.map(f => ({
                            name: f.name,
                            size: f.size,
                            type: f.type
                        })))
                    }
                },
                onFileView: (file, fileName) => {
                    // Handle file preview - open in new tab or modal
                    if (typeof file === 'string') {
                        window.open(file, '_blank')
                    } else {
                        // For File objects, create a URL and open it
                        const url = URL.createObjectURL(file)
                        window.open(url, '_blank')
                        // Clean up URL after a delay
                        setTimeout(() => URL.revokeObjectURL(url), 10000)
                    }
                }
            })
            return upload
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1020',
                fontFamily: 'Segoe UI, sans-serif',
                backdropFilter: 'blur(4px)'
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
                        borderRadius: '16px',
                        width: '800px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: 'none'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '24px 28px',
                                borderBottom: '1px solid #f3f4f6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#ffffff',
                                zIndex: '1'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: isEditing ? 'Edit Completed Research' : 'Add Completed Research',
                                    style: {
                                        margin: '0',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        color: '#1a1a1a',
                                        letterSpacing: '-0.3px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#f3f4f6'
                                            e.target.style.color = '#1a1a1a'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#9ca3af'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Modal body
                        $({
                            tag: 'form',
                            att: { id: 'completed-research-form' },
                            style: {
                                padding: '28px'
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

                                // Hidden field for files data
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'hidden',
                                        name: 'files',
                                        id: 'research-files-data',
                                        value: JSON.stringify(researchFiles.map(f => ({
                                            name: f.name || f,
                                            size: f.size || 0,
                                            type: f.type || 'application/octet-stream'
                                        })))
                                    }
                                }),

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
                                                color: '#374151',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            att: {
                                                name: 'type',
                                                id: 'research-type-select'
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none'
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
                                                    e.target.style.borderColor = '#3b82f6'
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                },
                                                type3: 'blur',
                                                method3: (e) => {
                                                    e.target.style.borderColor = '#e5e7eb'
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
                                    style: { marginBottom: '20px' }
                                }),

                                // Program/Project/Study Title
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Program/Project/Study Title *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#374151',
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
                                                placeholder: 'Enter research title...',
                                                required: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'focus',
                                                method: (e) => {
                                                    e.target.style.borderColor = '#3b82f6'
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                },
                                                type2: 'blur',
                                                method2: (e) => {
                                                    e.target.style.borderColor = '#e5e7eb'
                                                    e.target.style.boxShadow = 'none'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Researchers
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Researchers *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '8px',
                                                color: '#374151',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'text',
                                                name: 'researchers',
                                                value: isEditing ? (item.researchers || '') : '',
                                                placeholder: 'Enter researchers (comma separated)...',
                                                required: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'focus',
                                                method: (e) => {
                                                    e.target.style.borderColor = '#3b82f6'
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                },
                                                type2: 'blur',
                                                method2: (e) => {
                                                    e.target.style.borderColor = '#e5e7eb'
                                                    e.target.style.boxShadow = 'none'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Date Started and Date Completed row
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
                                                    text: 'Date Started *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#374151',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'date',
                                                        name: 'dateStarted',
                                                        value: isEditing ? (item.dateStarted || '') : '',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        backgroundColor: '#f9fafb',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#3b82f6'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e5e7eb'
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
                                                    text: 'Date Completed *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#374151',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'date',
                                                        name: 'dateCompleted',
                                                        value: isEditing ? (item.dateCompleted || '') : '',
                                                        required: true
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        backgroundColor: '#f9fafb',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#3b82f6'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e5e7eb'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Duration and Budget row
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
                                                    text: 'Duration',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#374151',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'text',
                                                        name: 'duration',
                                                        value: isEditing ? (item.duration || '') : '',
                                                        placeholder: 'e.g., 6 months, 1 year'
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        backgroundColor: '#f9fafb',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#3b82f6'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e5e7eb'
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
                                                    text: 'Budget (₱)',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '8px',
                                                        color: '#374151',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'input',
                                                    att: {
                                                        type: 'number',
                                                        name: 'budget',
                                                        value: isEditing ? (item.budget || '') : '',
                                                        placeholder: 'Enter budget amount...',
                                                        step: '0.01',
                                                        min: '0'
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        backgroundColor: '#f9fafb',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#3b82f6'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                        },
                                                        type2: 'blur',
                                                        method2: (e) => {
                                                            e.target.style.borderColor = '#e5e7eb'
                                                            e.target.style.boxShadow = 'none'
                                                        }
                                                    }
                                                })
                                            ]
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
                                                marginBottom: '8px',
                                                color: '#374151',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'text',
                                                name: 'fundSource',
                                                value: isEditing ? (item.fundSource || '') : '',
                                                placeholder: 'Enter funding source...'
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'focus',
                                                method: (e) => {
                                                    e.target.style.borderColor = '#3b82f6'
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                },
                                                type2: 'blur',
                                                method2: (e) => {
                                                    e.target.style.borderColor = '#e5e7eb'
                                                    e.target.style.boxShadow = 'none'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // File upload section (replacing links)
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    elementHandler: (el) => {
                                        // Create and mount the drag and drop upload component
                                        fileUploadComponent = createFileUpload()
                                        el.appendChild(fileUploadComponent.element)
                                    }
                                }),

                                // Quarter Percentages
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Completion Percentage per Quarter',
                                            style: {
                                                display: 'block',
                                                marginBottom: '12px',
                                                color: '#374151',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }
                                        }),
                                        // Quarter input fields
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                                gap: '12px'
                                            },
                                            child: ['q1', 'q2', 'q3', 'q4'].map(q => {
                                                const value = isEditing ? (item[q] || item[`${q}Percentage`] || '') : ''
                                                return $({
                                                    tag: 'div',
                                                    child: [
                                                        $({
                                                            tag: 'label',
                                                            text: q.toUpperCase(),
                                                            style: {
                                                                display: 'block',
                                                                marginBottom: '4px',
                                                                color: '#6b7280',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                textTransform: 'uppercase'
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'number',
                                                                name: q,
                                                                value: value,
                                                                placeholder: '0-100',
                                                                min: '0',
                                                                max: '100'
                                                            },
                                                            style: {
                                                                width: '100%',
                                                                padding: '8px 10px',
                                                                backgroundColor: '#f9fafb',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                color: '#1a1a1a',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                transition: 'all 0.2s ease'
                                                            },
                                                            event: {
                                                                type: 'focus',
                                                                method: (e) => {
                                                                    e.target.style.borderColor = '#3b82f6'
                                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                                                },
                                                                type2: 'blur',
                                                                method2: (e) => {
                                                                    e.target.style.borderColor = '#e5e7eb'
                                                                    e.target.style.boxShadow = 'none'
                                                                }
                                                            }
                                                        })
                                                    ]
                                                })
                                            })
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
                                        borderTop: '1px solid #f3f4f6',
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
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                color: '#6b7280',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: closeModal,
                                                type2: 'mouseenter',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#f3f4f6'
                                                    e.target.style.borderColor = '#d1d5db'
                                                },
                                                type3: 'mouseleave',
                                                method3: (e) => {
                                                    e.target.style.backgroundColor = 'transparent'
                                                    e.target.style.borderColor = '#e5e7eb'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            att: { type: 'submit' },
                                            text: isEditing ? 'Update Research' : 'Add Research',
                                            style: {
                                                padding: '10px 28px',
                                                backgroundColor: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.target.style.backgroundColor = '#2563eb'
                                                    e.target.style.transform = 'translateY(-1px)'
                                                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#3b82f6'
                                                    e.target.style.transform = 'translateY(0)'
                                                    e.target.style.boxShadow = 'none'
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
                                    
                                    // Ensure files data is up to date before submitting
                                    const fileDataInput = document.getElementById('research-files-data')
                                    if (fileDataInput && fileUploadComponent) {
                                        const files = fileUploadComponent.getFiles()
                                        fileDataInput.value = JSON.stringify(files.map(f => ({
                                            name: f.name,
                                            size: f.size,
                                            type: f.type
                                        })))
                                    }
                                    
                                    await saveResearchData(isEditing)
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
            const typeSelect = document.getElementById('research-type-select')
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
                    tag: 'p',
                    text: 'Please select a type first',
                    style: {
                        color: '#9ca3af',
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
                            color: '#374151',
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
                            padding: '10px 12px',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                        ],
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#3b82f6'
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#e5e7eb'
                                e.target.style.boxShadow = 'none'
                            }
                        }
                    })
                ]
            })
        )
    }

    const saveResearchData = async (isEditing) => {
        const form = document.getElementById('completed-research-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_completed' : 'add_completed')

        // Add files as JSON (instead of links)
        const fileDataInput = document.getElementById('research-files-data')
        if (fileDataInput) {
            formData.append('files', fileDataInput.value)
        }

        showLoading()
        try {
            const response = await fetch('/completedResesearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Research updated successfully' : 'Research added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving research data', 'error')
            }
        } catch (error) {
            console.error('Error saving research data:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const refreshData = async () => {
        completedData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchCompletedData()
    }

    const FilterBar = () => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 28px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #eef2f6',
                flexWrap: 'wrap',
                gap: '15px',
                borderRadius: '12px 12px 0 0'
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
                                gap: '14px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-check-double' },
                                    style: { 
                                        color: '#4caf50', 
                                        fontSize: '24px',
                                        background: 'rgba(76, 175, 80, 0.1)',
                                        padding: '10px',
                                        borderRadius: '12px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'h2',
                                            text: 'Completed Research',
                                            style: {
                                                color: '#1a2332',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                margin: '0',
                                                letterSpacing: '-0.3px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Summary list of completed research projects',
                                            style: {
                                                color: '#6b7a8f',
                                                fontSize: '13px',
                                                display: 'block',
                                                marginTop: '2px'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'record-count' },
                                    style: {
                                        backgroundColor: '#f0f4f8',
                                        color: '#4a5a6e',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #e2e8f0',
                                        fontWeight: '500'
                                    },
                                    text: '0 records'
                                })
                            ]
                        }),
                        // Filters
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '10px',
                                backgroundColor: '#f8fafc',
                                padding: '4px 6px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0'
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
                                        color: '#1a2332',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '160px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
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
                                        },
                                        type2: 'focus',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#f0f4f8'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                        }
                                    }
                                }),
                                // Separator
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '1px',
                                        backgroundColor: '#e2e8f0',
                                        margin: '4px 0'
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
                                        color: '#1a2332',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '250px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none'
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
                                            e.target.style.backgroundColor = '#f0f4f8'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Add Research button
                $({
                    tag: 'button',
                    text: '+ Add Research',
                    style: {
                        padding: '10px 24px',
                        backgroundColor: '#4caf50',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
                    },
                    event: {
                        type: 'click',
                        method: openAddModal,
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.target.style.backgroundColor = '#43a047'
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#4caf50'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.2)'
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                padding: '20px 28px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #eef2f6'
            },
            child: [
                // Total Completed
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                        border: '1px solid #eef2f6',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.borderColor = '#4caf50'
                            e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.08)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.borderColor = '#eef2f6'
                            e.target.style.boxShadow = 'none'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-check-circle' },
                                    style: { color: '#4caf50', fontSize: '28px' }
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
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#1a2332',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Completed',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7a8f',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Total Budget
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                        border: '1px solid #eef2f6',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.borderColor = '#ff9800'
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 152, 0, 0.08)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.borderColor = '#eef2f6'
                            e.target.style.boxShadow = 'none'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-peso-sign' },
                                    style: { color: '#ff9800', fontSize: '28px' }
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
                                    text: '₱0',
                                    style: {
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: '#1a2332',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Budget',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7a8f',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Total Researchers
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                        border: '1px solid #eef2f6',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.target.style.borderColor = '#3b82f6'
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.08)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.borderColor = '#eef2f6'
                            e.target.style.boxShadow = 'none'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-users' },
                                    style: { color: '#3b82f6', fontSize: '28px' }
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
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#1a2332',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Researchers',
                                    style: {
                                        fontSize: '13px',
                                        color: '#6b7a8f',
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
            { key: 'no', label: 'No.', align: 'center', width: '60px' },
            { key: 'title', label: 'Program/Project/Study Title', align: 'left', width: 'auto' },
            { key: 'researchers', label: 'Researchers', align: 'left', width: 'auto' },
            { key: 'dateStarted', label: 'Date Started', align: 'center', width: '120px' },
            { key: 'dateCompleted', label: 'Date Completed', align: 'center', width: '120px' },
            { key: 'duration', label: 'Duration', align: 'center', width: '100px' },
            { key: 'budget', label: 'Budget', align: 'right', width: '120px' },
            { key: 'fundSource', label: 'Fund Source', align: 'left', width: 'auto' },
            { key: 'files', label: 'Files', align: 'center', width: '100px' },
            { key: 'actions', label: 'Actions', align: 'center', width: '150px' }
        ]

        return $({
            tag: 'thead',
            style: {
                position: 'sticky',
                top: '0',
                zIndex: '10'
            },
            child: [
                $({
                    tag: 'tr',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0'
                    },
                    child: headers.map(header => 
                        $({
                            tag: 'th',
                            text: header.label,
                            style: {
                                padding: '14px 16px',
                                textAlign: header.align || 'left',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#475569',
                                backgroundColor: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0',
                                whiteSpace: 'nowrap',
                                verticalAlign: 'middle',
                                letterSpacing: '0.3px',
                                textTransform: 'uppercase',
                                minWidth: header.width || 'auto',
                                position: 'sticky',
                                top: '0',
                                zIndex: '10'
                            }
                        })
                    )
                })
            ]
        })
    }

    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 320px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderRadius: '0 0 12px 12px',
                border: '1px solid #eef2f6',
                borderTop: 'none'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchCompletedData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '1400px',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: (el) => {
                                tableBody = el
                            },
                            style: {
                                backgroundColor: '#ffffff'
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
                zIndex: '1020',
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
        att: { className: 'completed-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#fefefe',
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

export default completedResearch
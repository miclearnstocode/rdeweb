import { $, Waiting } from "../../../../lib/lib.js"

export const citationsResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let citationsData = []
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
        totalResearch: 0,
        totalCitations: 0,
        highestCitations: 0,
        averageCitations: 0,
        withCitations: 0,
        withoutCitations: 0
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

    // Sort options
    const sortOptions = [
        { value: 'citations_desc', label: 'Most Cited' },
        { value: 'citations_asc', label: 'Least Cited' },
        { value: 'title_asc', label: 'Title A-Z' },
        { value: 'title_desc', label: 'Title Z-A' },
        { value: 'recent', label: 'Most Recent' }
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

    const fetchCitationsData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            citationsData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_citations')

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

            const response = await fetch('/citationResearch', {
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
                    citationsData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalResearch
                        updateStats()
                    }
                } else {
                    citationsData = [...citationsData, ...newData]
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
            console.error('Error fetching citations data:', error)
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
            fetchCitationsData(nextCursor)
        }
    }

    const updateStats = () => {
        const statTotalResearch = document.querySelector('.stat-total-research')
        const statTotalCitations = document.querySelector('.stat-total-citations')
        const statHighestCitations = document.querySelector('.stat-highest-citations')
        const statAverageCitations = document.querySelector('.stat-average-citations')
        const statWithCitations = document.querySelector('.stat-with-citations')
        const statWithoutCitations = document.querySelector('.stat-without-citations')

        if (statTotalResearch) statTotalResearch.textContent = currentStats.totalResearch
        if (statTotalCitations) statTotalCitations.textContent = currentStats.totalCitations
        if (statHighestCitations) statHighestCitations.textContent = currentStats.highestCitations
        if (statAverageCitations) statAverageCitations.textContent = currentStats.averageCitations
        if (statWithCitations) statWithCitations.textContent = currentStats.withCitations
        if (statWithoutCitations) statWithoutCitations.textContent = currentStats.withoutCitations
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

        // Create a single row that spans all columns
        const emptyRow = $({
            tag: 'tr',
            style: {
                width: '100%'
            },
            child: [
                $({
                    tag: 'td',
                    att: {
                        colSpan: 7 // Match the number of columns in your table
                    },
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
                                height: '400px',
                                width: '100%',
                                color: '#333',
                                fontFamily: 'Segoe UI, sans-serif',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                                padding: '40px 20px',
                                boxSizing: 'border-box',
                                margin: '0 auto'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-quote-right' },
                                    style: {
                                        fontSize: '64px',
                                        marginBottom: '20px',
                                        opacity: 0.3,
                                        color: '#1a73e8'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Research Citations Found',
                                    style: {
                                        fontSize: '20px',
                                        marginBottom: '12px',
                                        fontWeight: '500',
                                        color: '#1a1a1a'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Get started by adding your first research citation',
                                    style: {
                                        fontSize: '14px',
                                        opacity: 0.6,
                                        color: '#5f6368',
                                        marginBottom: '20px'
                                    }
                                }),
                                // Add Citation Button
                                $({
                                    tag: 'button',
                                    text: '+ Add Citation',
                                    style: {
                                        padding: '12px 32px',
                                        backgroundColor: '#1a73e8',
                                        border: 'none',
                                        borderRadius: '25px',
                                        color: '#fff',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            openAddModal()
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#1557b0'
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 6px 16px rgba(26, 115, 232, 0.3)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = '#1a73e8'
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 2px 4px rgba(26, 115, 232, 0.2)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        tableBody.appendChild(emptyRow)
    }

    const renderCitationBadge = (count) => {
        if (count === undefined || count === null) return '—'

        let bgColor, textColor, borderColor

        if (count >= 50) {
            bgColor = 'rgba(76, 175, 80, 0.15)'
            textColor = '#4caf50'
            borderColor = 'rgba(76, 175, 80, 0.3)'
        } else if (count >= 20) {
            bgColor = 'rgba(33, 150, 243, 0.15)'
            textColor = '#2196f3'
            borderColor = 'rgba(33, 150, 243, 0.3)'
        } else if (count >= 5) {
            bgColor = 'rgba(255, 152, 0, 0.15)'
            textColor = '#ff9800'
            borderColor = 'rgba(255, 152, 0, 0.3)'
        } else if (count > 0) {
            bgColor = 'rgba(158, 158, 158, 0.15)'
            textColor = '#9e9e9e'
            borderColor = 'rgba(158, 158, 158, 0.3)'
        } else {
            bgColor = 'rgba(244, 67, 54, 0.1)'
            textColor = '#f44336'
            borderColor = 'rgba(244, 67, 54, 0.2)'
        }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '700',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-quote-right' },
                    style: { fontSize: '10px', opacity: 0.7 }
                }),
                $({ tag: 'span', text: count })
            ]
        })
    }

    const renderCampusBadge = (campus) => {
        if (!campus || campus === '—') return '—'

        const campusColors = {
            'Roxas City Main': { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)' },
            'Tapaz': { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' },
            'Burias': { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' },
            'Dumarao': { bg: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)' },
            'Pontevedra': { bg: 'rgba(0, 188, 212, 0.15)', color: '#00bcd4', border: 'rgba(0, 188, 212, 0.3)' },
            'Mambusao': { bg: 'rgba(233, 30, 99, 0.15)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)' },
            'Sigma': { bg: 'rgba(96, 125, 139, 0.15)', color: '#607d8b', border: 'rgba(96, 125, 139, 0.3)' },
            'Pilar': { bg: 'rgba(121, 85, 72, 0.15)', color: '#795548', border: 'rgba(121, 85, 72, 0.3)' },
            'Dayao': { bg: 'rgba(63, 81, 181, 0.15)', color: '#3f51b5', border: 'rgba(63, 81, 181, 0.3)' }
        }

        const colors = campusColors[campus] || { bg: 'rgba(158, 158, 158, 0.15)', color: '#9e9e9e', border: 'rgba(158, 158, 158, 0.3)' }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-location-dot' },
                    style: { fontSize: '9px' }
                }),
                $({ tag: 'span', text: campus })
            ]
        })
    }

    const renderCitingResearch = (citingResearch) => {
        if (!citingResearch || citingResearch === '—') return '—'

        let researchList = []
        try {
            if (typeof citingResearch === 'string') {
                researchList = JSON.parse(citingResearch)
            } else if (Array.isArray(citingResearch)) {
                researchList = citingResearch
            } else {
                return citingResearch
            }
        } catch (e) {
            return citingResearch
        }

        if (researchList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            },
            child: researchList.map((research, idx) => {
                const title = typeof research === 'string' ? research : research.title || 'Unknown'
                const authors = typeof research === 'object' ? research.authors : ''
                const year = typeof research === 'object' ? research.year : ''

                return $({
                    tag: 'div',
                    style: {
                        padding: '8px 10px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(63, 81, 181, 0.05)' : 'transparent',
                        borderRadius: '6px',
                        borderLeft: '3px solid #3f51b5',
                        borderBottom: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: title,
                            style: {
                                color: '#ddd',
                                fontWeight: '500',
                                fontSize: '12px',
                                lineHeight: '1.4',
                                fontStyle: 'italic'
                            }
                        }),
                        ...(authors ? [
                            $({
                                tag: 'div',
                                text: authors,
                                style: {
                                    color: '#888',
                                    fontSize: '11px',
                                    lineHeight: '1.3',
                                    marginTop: '3px'
                                }
                            })
                        ] : []),
                        ...(year ? [
                            $({
                                tag: 'span',
                                text: year,
                                style: {
                                    color: '#3f51b5',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    marginTop: '4px'
                                }
                            })
                        ] : [])
                    ]
                })
            })
        })
    }

    const renderAuthors = (authors) => {
        if (!authors || authors === '—') return '—'

        let authorList = []
        try {
            if (typeof authors === 'string') {
                authorList = JSON.parse(authors)
            } else if (Array.isArray(authors)) {
                authorList = authors
            } else {
                return authors
            }
        } catch (e) {
            return authors
        }

        if (authorList.length === 0) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '3px'
            },
            child: authorList.map((author, idx) => {
                const name = typeof author === 'string' ? author : author.name || 'Unknown'

                return $({
                    tag: 'div',
                    style: {
                        padding: '3px 6px',
                        fontSize: '11px',
                        color: '#ccc',
                        lineHeight: '1.3'
                    },
                    text: name
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
                    border: '1px solid #e0e0e0',
                    fontFamily: 'monospace',
                    verticalAlign: 'top',
                    backgroundColor: '#fafafa'
                },
                text: rowNumber.toString()
            })
        )

        // Title of Research
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '13px',
                    color: '#1a1a1a',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    minWidth: '300px',
                    backgroundColor: '#ffffff'
                },
                text: item.title || '—'
            })
        )

        // Author/s
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
                },
                child: [renderAuthors(item.authors)]
            })
        )

        // Campus
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    minWidth: '130px',
                    backgroundColor: '#ffffff'
                },
                child: [renderCampusBadge(item.campus)]
            })
        )

        // No. of Citations
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    minWidth: '120px',
                    backgroundColor: '#ffffff'
                },
                child: [renderCitationBadge(item.citations)]
            })
        )

        // Title of research
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    minWidth: '300px',
                    maxWidth: '400px',
                    backgroundColor: '#ffffff'
                },
                child: [renderCitingResearch(item.citingResearch)]
            })
        )

        // Actions cell
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'middle',
                    backgroundColor: '#fafafa'
                },
                child: [createActionButtons(item)]
            })
        )

        return $({
            tag: 'tr',
            style: {
                backgroundColor: rowNumber % 2 === 0 ? '#ffffff' : '#f8f9fa',
                transition: 'all 0.2s ease'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f3f4'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = rowNumber % 2 === 0 ? '#ffffff' : '#f8f9fa'
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
                justifyContent: 'center'
            },
            child: [
                $({
                    tag: 'button',
                    style: {
                        backgroundColor: '#e3f2fd',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#1565c0'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-pen' },
                            style: { fontSize: '12px' }
                        })
                    ],
                    title: 'Edit',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#bbdefb'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 115, 232, 0.15)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#e3f2fd'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                        }
                    }
                }),
                $({
                    tag: 'button',
                    style: {
                        backgroundColor: '#fce4ec',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#c62828'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-trash' },
                            style: { fontSize: '12px' }
                        })
                    ],
                    title: 'Delete',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deleteCitation(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#ef9a9a'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(198, 40, 40, 0.15)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#fce4ec'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
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

    const deleteCitation = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this citation record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_citation')
            formData.append('id', item.id)

            const response = await fetch('/citationsResearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Citation record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete citation record', 'error')
            }
        } catch (error) {
            console.error('Error deleting citation:', error)
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

        // Authors state
        let authors = []
        if (isEditing && item.authors) {
            try {
                authors = typeof item.authors === 'string' ? JSON.parse(item.authors) : item.authors
                if (!Array.isArray(authors)) authors = []
            } catch (e) {
                authors = []
            }
        }

        // Citing research state
        let citingResearch = []
        if (isEditing && item.citingResearch) {
            try {
                citingResearch = typeof item.citingResearch === 'string' ? JSON.parse(item.citingResearch) : item.citingResearch
                if (!Array.isArray(citingResearch)) citingResearch = []
            } catch (e) {
                citingResearch = []
            }
        }

        // Containers for dynamic fields
        let authorsContainer
        let citingResearchContainer

        // Function to add an author field
        const addAuthorField = (name = '') => {
            const authorIndex = authors.length
            authors.push({ name })

            const authorRow = $({
                tag: 'div',
                att: { className: 'author-row', 'data-author-index': authorIndex },
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
                            placeholder: 'Author name',
                            value: name,
                            className: 'author-name-input'
                        },
                        style: {
                            flex: '1',
                            padding: '10px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'focus',
                            method: (e) => {
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#dadce0'
                                e.target.style.boxShadow = 'none'
                            },
                            type3: 'input',
                            method3: (e) => {
                                if (authors[authorIndex]) {
                                    authors[authorIndex].name = e.target.value
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
                            backgroundColor: '#fce8e6',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#d93025',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                authors.splice(authorIndex, 1)
                                authorRow.remove()
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.target.style.backgroundColor = '#fad2cf'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.target.style.backgroundColor = '#fce8e6'
                            }
                        }
                    })
                ]
            })

            return authorRow
        }

        // Function to add a citing research field
        const addCitingResearchField = (title = '', authorsText = '', year = '') => {
            const researchIndex = citingResearch.length
            citingResearch.push({ title, authors: authorsText, year })

            const researchRow = $({
                tag: 'div',
                att: { className: 'citing-research-row', 'data-research-index': researchIndex },
                style: {
                    backgroundColor: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    border: '1px solid #e8eaed',
                    transition: 'all 0.2s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '10px',
                            alignItems: 'center'
                        },
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    placeholder: 'Title of citing research *',
                                    value: title,
                                    className: 'citing-title-input'
                                },
                                style: {
                                    flex: '3',
                                    padding: '10px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '8px',
                                    color: '#1a1a1a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.target.style.borderColor = '#1a73e8'
                                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.target.style.borderColor = '#dadce0'
                                        e.target.style.boxShadow = 'none'
                                    },
                                    type3: 'input',
                                    method3: (e) => {
                                        if (citingResearch[researchIndex]) {
                                            citingResearch[researchIndex].title = e.target.value
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
                                    backgroundColor: '#fce8e6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#d93025',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease',
                                    lineHeight: '1'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        citingResearch.splice(researchIndex, 1)
                                        researchRow.remove()
                                        updateCitationCount()
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.target.style.backgroundColor = '#fad2cf'
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.target.style.backgroundColor = '#fce8e6'
                                    }
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 100px',
                            gap: '10px'
                        },
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    placeholder: 'Authors of citing research (optional)',
                                    value: authorsText,
                                    className: 'citing-authors-input'
                                },
                                style: {
                                    padding: '10px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '8px',
                                    color: '#1a1a1a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.target.style.borderColor = '#1a73e8'
                                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.target.style.borderColor = '#dadce0'
                                        e.target.style.boxShadow = 'none'
                                    },
                                    type3: 'input',
                                    method3: (e) => {
                                        if (citingResearch[researchIndex]) {
                                            citingResearch[researchIndex].authors = e.target.value
                                        }
                                    }
                                }
                            }),
                            $({
                                tag: 'input',
                                att: {
                                    type: 'text',
                                    placeholder: 'Year',
                                    value: year,
                                    className: 'citing-year-input'
                                },
                                style: {
                                    padding: '10px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '8px',
                                    color: '#1a1a1a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.target.style.borderColor = '#1a73e8'
                                        e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.target.style.borderColor = '#dadce0'
                                        e.target.style.boxShadow = 'none'
                                    },
                                    type3: 'input',
                                    method3: (e) => {
                                        if (citingResearch[researchIndex]) {
                                            citingResearch[researchIndex].year = e.target.value
                                        }
                                    }
                                }
                            })
                        ]
                    })
                ]
            })

            return researchRow
        }

        // Update citation count display
        const updateCitationCount = () => {
            const countEl = document.getElementById('citation-count-display')
            if (countEl) {
                countEl.textContent = `Citing Research Count: ${citingResearch.length}`
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
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
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
                        width: '850px',
                        maxWidth: '95%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e8eaed'
                    },
                    child: [
                        // Modal header
                        $({
                            tag: 'div',
                            style: {
                                padding: '20px 28px',
                                borderBottom: '1px solid #e8eaed',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: '0',
                                backgroundColor: '#ffffff',
                                zIndex: '1',
                                borderRadius: '16px 16px 0 0'
                            },
                            child: [
                                $({
                                    tag: 'h2',
                                    text: isEditing ? 'Edit Citation Record' : 'Add Citation Record',
                                    style: {
                                        margin: '0',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        color: '#1a1a1a'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-times' },
                                    style: {
                                        fontSize: '20px',
                                        color: '#5f6368',
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
                                            e.target.style.backgroundColor = '#f1f3f4'
                                            e.target.style.color = '#1a1a1a'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#5f6368'
                                        }
                                    }
                                })
                            ]
                        }),
                        // Modal body
                        $({
                            tag: 'form',
                            att: { id: 'citation-form' },
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
                                                marginBottom: '6px',
                                                color: '#5f6368',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            att: {
                                                name: 'type',
                                                id: 'citation-type-select'
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dadce0',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
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
                                                    e.target.style.borderColor = '#1a73e8'
                                                    e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                                },
                                                type3: 'blur',
                                                method3: (e) => {
                                                    e.target.style.borderColor = '#dadce0'
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

                                // Title of Research
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Title of Research *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '6px',
                                                color: '#5f6368',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'textarea',
                                            att: {
                                                name: 'title',
                                                placeholder: 'Enter title of research...',
                                                rows: '2',
                                                required: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dadce0',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
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
                                                    e.target.style.borderColor = '#1a73e8'
                                                    e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                                },
                                                type2: 'blur',
                                                method2: (e) => {
                                                    e.target.style.borderColor = '#dadce0'
                                                    e.target.style.boxShadow = 'none'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Author(s) section
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
                                                    text: 'Author/s *',
                                                    style: {
                                                        color: '#5f6368',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Author',
                                                    style: {
                                                        padding: '6px 16px',
                                                        backgroundColor: '#1a73e8',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            const newRow = addAuthorField()
                                                            authorsContainer.appendChild(newRow)
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.backgroundColor = '#1557b0'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.backgroundColor = '#1a73e8'
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: { id: 'authors-container' },
                                            style: {
                                                backgroundColor: '#fafafa',
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: '1px solid #e8eaed',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                authorsContainer = el
                                                if (isEditing && authors.length > 0) {
                                                    authors.forEach(author => {
                                                        authorsContainer.appendChild(addAuthorField(author.name))
                                                    })
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Campus field
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Campus *',
                                            style: {
                                                display: 'block',
                                                marginBottom: '6px',
                                                color: '#5f6368',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            att: {
                                                name: 'campus',
                                                required: true
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dadce0',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                            },
                                            child: [
                                                $({ tag: 'option', att: { value: '' }, text: '-- Select Campus --' }),
                                                ...campuses.filter(c => c !== 'All Campuses').map(c =>
                                                    $({
                                                        tag: 'option',
                                                        att: { value: c, selected: isEditing && item.campus === c },
                                                        text: c
                                                    })
                                                )
                                            ],
                                            event: {
                                                type: 'focus',
                                                method: (e) => {
                                                    e.target.style.borderColor = '#1a73e8'
                                                    e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                                },
                                                type2: 'blur',
                                                method2: (e) => {
                                                    e.target.style.borderColor = '#dadce0'
                                                    e.target.style.boxShadow = 'none'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Citing Research section
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
                                                marginBottom: '10px',
                                                flexWrap: 'wrap',
                                                gap: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        flexWrap: 'wrap'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'label',
                                                            text: 'Title of Research Which Cited',
                                                            style: {
                                                                color: '#5f6368',
                                                                fontSize: '13px',
                                                                fontWeight: '500'
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'span',
                                                            att: { id: 'citation-count-display' },
                                                            text: `Citing Research Count: ${citingResearch.length}`,
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#1a73e8',
                                                                fontWeight: '600',
                                                                backgroundColor: '#e8f0fe',
                                                                padding: '3px 12px',
                                                                borderRadius: '12px',
                                                                border: '1px solid #d2e3fc'
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Citing Research',
                                                    style: {
                                                        padding: '6px 16px',
                                                        backgroundColor: '#ff9800',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            const newRow = addCitingResearchField()
                                                            citingResearchContainer.appendChild(newRow)
                                                            updateCitationCount()
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
                                            att: { id: 'citing-research-container' },
                                            style: {
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                citingResearchContainer = el
                                                if (isEditing && citingResearch.length > 0) {
                                                    citingResearch.forEach(research => {
                                                        citingResearchContainer.appendChild(
                                                            addCitingResearchField(research.title, research.authors, research.year)
                                                        )
                                                    })
                                                    setTimeout(updateCitationCount, 100)
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
                                        borderTop: '1px solid #e8eaed',
                                        paddingTop: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            att: { type: 'button' },
                                            text: 'Cancel',
                                            style: {
                                                padding: '10px 28px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #dadce0',
                                                borderRadius: '8px',
                                                color: '#5f6368',
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
                                                    e.target.style.backgroundColor = '#f8f9fa'
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
                                            text: isEditing ? 'Update Citation' : 'Add Citation',
                                            style: {
                                                padding: '10px 32px',
                                                backgroundColor: '#1a73e8',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.target.style.backgroundColor = '#1557b0'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#1a73e8'
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
                                    await saveCitationData(isEditing)
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
            const typeSelect = document.getElementById('citation-type-select')
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
                        color: '#5f6368',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        padding: '8px 0'
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
                            marginBottom: '6px',
                            color: '#5f6368',
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
                            padding: '10px 14px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
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
                                e.target.style.borderColor = '#1a73e8'
                                e.target.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.1)'
                                e.target.style.backgroundColor = '#ffffff'
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#dadce0'
                                e.target.style.boxShadow = 'none'
                                e.target.style.backgroundColor = '#f8f9fa'
                            },
                            type3: 'mouseenter',
                            method3: (e) => {
                                e.target.style.backgroundColor = '#f1f3f4'
                            },
                            type4: 'mouseleave',
                            method4: (e) => {
                                if (document.activeElement !== e.target) {
                                    e.target.style.backgroundColor = '#f8f9fa'
                                }
                            }
                        }
                    })
                ]
            })
        )
    }

    const saveCitationData = async (isEditing) => {
        const form = document.getElementById('citation-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_citation' : 'add_citation')
        formData.append('authors', JSON.stringify(authors))
        formData.append('citingResearch', JSON.stringify(citingResearch))
        formData.append('citations', citingResearch.length.toString())

        showLoading()
        try {
            const response = await fetch('/citationsResearch', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Citation record updated successfully' : 'Citation record added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving citation data', 'error')
            }
        } catch (error) {
            console.error('Error saving citation:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    const refreshData = async () => {
        citationsData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchCitationsData()
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
                borderBottom: '1px solid #e8eaed',
                flexWrap: 'wrap',
                gap: '15px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
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
                                    att: { className: 'fa-solid fa-quote-right' },
                                    style: { color: '#1a73e8', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Research Citations',
                                    style: {
                                        color: '#1a1a1a',
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
                                        backgroundColor: '#f1f3f4',
                                        color: '#5f6368',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #e8eaed',
                                        fontWeight: '500'
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
                                gap: '10px',
                                backgroundColor: '#f8f9fa',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                border: '1px solid #e8eaed',
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
                                        padding: '8px 12px',
                                        color: '#1a1a1a',
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
                                            e.target.style.backgroundColor = '#f1f3f4'
                                        },
                                        type3: 'blur',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                        }
                                    }
                                }),
                                // Divider
                                $({
                                    tag: 'span',
                                    text: '|',
                                    style: {
                                        color: '#dadce0',
                                        fontSize: '18px',
                                        lineHeight: '1',
                                        padding: '0 2px'
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
                                        color: '#1a1a1a',
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
                                            e.target.style.backgroundColor = '#f1f3f4'
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
                // Add Citation button
                $({
                    tag: 'button',
                    text: '+ Add Citation',
                    style: {
                        padding: '10px 24px',
                        backgroundColor: '#1a73e8',
                        border: 'none',
                        borderRadius: '25px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)'
                    },
                    event: {
                        type: 'click',
                        method: openAddModal,
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.target.style.backgroundColor = '#1557b0'
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 6px 16px rgba(26, 115, 232, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#1a73e8'
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 2px 4px rgba(26, 115, 232, 0.2)'
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
                borderBottom: '1px solid #e8eaed'
            },
            child: [
                // Total Research
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e8eaed',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#e8f0fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-book' },
                                    style: { color: '#1a73e8', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-total-research stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Research',
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
                // Total Citations
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e8eaed',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#e8f5e9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-quote-right' },
                                    style: { color: '#2e7d32', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-total-citations stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Citations',
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
                // Highest Citations
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e8eaed',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#fff8e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-trophy' },
                                    style: { color: '#f9a825', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-highest-citations stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Highest Citations',
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
                // Average Citations
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e8eaed',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                            e.currentTarget.style.transform = 'translateY(0)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '54px',
                                height: '54px',
                                borderRadius: '16px',
                                backgroundColor: '#e0f7fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chart-line' },
                                    style: { color: '#00838f', fontSize: '26px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', flexDirection: 'column' },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'stat-average-citations stat-value' },
                                    text: '0',
                                    style: {
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1a1a1a',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Average Citations',
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
                // Citation Status
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        border: '1px solid #e8eaed',
                        gridColumn: 'span 2',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Citation Status',
                            style: {
                                fontSize: '12px',
                                color: '#5f6368',
                                fontWeight: '600',
                                marginBottom: '14px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createStatusStat('With Citations', '#2e7d32', 'stat-with-citations', 'fa-check-circle'),
                                createStatusStat('Without Citations', '#c62828', 'stat-without-citations', 'fa-circle-xmark')
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const createStatusStat = (label, color, className, icon) => {
        return $({
            tag: 'div',
            style: {
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '14px 16px',
                border: `1px solid ${color}20`,
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = `${color}10`
                    e.currentTarget.style.borderColor = `${color}40`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${color}15`
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                    e.currentTarget.style.borderColor = `${color}20`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${icon}` },
                            style: { color: color, fontSize: '14px' }
                        }),
                        $({
                            tag: 'span',
                            text: label,
                            style: {
                                fontSize: '12px',
                                color: '#5f6368',
                                fontWeight: '500'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { className: `stat-${className.split('-')[1] || className}` },
                    text: '0',
                    style: {
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        display: 'block'
                    }
                })
            ]
        })
    }

    const TableHeader = () => {
        const headers = [
            { label: 'NO.', align: 'center', width: '50px' },
            { label: 'Title of Research', align: 'left', width: '250px' },
            { label: 'Author/s', align: 'left', width: '180px' },
            { label: 'Campus', align: 'left', width: '130px' },
            { label: 'No. of Citations', align: 'left', width: '100px' },
            { label: 'Title of Research Which Cited', align: 'left', width: '300px' },
            { label: 'ACTIONS', align: 'center', width: '100px' }
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const th = $({
                tag: 'th',
                text: header.label,
                style: {
                    padding: '14px 10px',
                    textAlign: header.align,
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    backgroundColor: '#f1f3f4',
                    border: '1px solid #e8eaed',
                    borderBottom: '2px solid #dadce0',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    verticalAlign: 'middle',
                    letterSpacing: '0.3px',
                    minWidth: header.width,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    textTransform: 'uppercase'
                }
            })
            row.appendChild(th)
        })

        return $({
            tag: 'thead',
            style: {
                position: 'sticky',
                top: 0,
                zIndex: 3
            },
            child: [row]
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
                borderTop: '1px solid #e8eaed'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchCitationsData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '1500px',
                        borderCollapse: 'collapse',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            style: {
                                backgroundColor: '#ffffff'
                            },
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

    return $({
        tag: 'div',
        att: { className: 'citations-research-container' },
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

export default citationsResearch
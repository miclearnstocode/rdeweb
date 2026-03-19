import { $ } from "../../../lib/lib.js"

export const Publication = () => {
    let tableBody
    let modalOverlay
    let statsContainer // Dynamic stats container
    let publications = [] // Store publications data
    let currentFilter = 'all' // Current active filter
    let currentSearch = '' // Current search term
    let mainTableContainer
    let indexFilterContainer // Container for dynamic filter buttons
    let mainSearchTimeout // Timeout for search debouncing

    // Close modal helper
    function closeModal() {
        if (modalOverlay) {
            modalOverlay.style.opacity = '0'
            setTimeout(() => {
                if (modalOverlay && modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay)
                }
            }, 300)
        }
    }

    // Open edit publication modal
    function openEditPublicationModal(publication) {
        const modal = createPublicationModal(publication)
        document.body.appendChild(modal)
        setTimeout(() => {
            modalOverlay.style.opacity = '1'
        }, 10)
    }

    // Search research titles from the database
    const searchResearchTitles = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) return []

        try {
            const formData = new FormData()
            formData.append('action', 'search')
            formData.append('search', searchTerm)

            const response = await fetch('/publish', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                return result.data
            } else {
                console.error('Search failed:', result.message)
                return []
            }
        } catch (error) {
            console.error('Error searching titles:', error)
            return []
        }
    }

    // Load all publications from database with filter and search options
    const loadPublications = async (filter = currentFilter, search = currentSearch) => {
        try {
            currentFilter = filter
            currentSearch = search
            
            const formData = new FormData()
            formData.append('action', 'getAll')

            if (currentFilter !== 'all') {
                formData.append('index_filter', currentFilter.toLowerCase())
            }
            
            if (currentSearch) {
                formData.append('search', currentSearch)
            }

            const response = await fetch('/publish', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                publications = result.data
                updateTableDisplay()
                updateFilterUI()
            }
        } catch (error) {
            console.error('Error loading publications:', error)
        }
    }

    // Export current filtered publications to Excel
    const exportToExcel = () => {
        if (typeof XLSX === 'undefined') {
            alert('Excel export library (SheetJS) is not loaded.')
            return
        }

        // Apply current filter to our local publications list
        const dataToExport = currentFilter.toLowerCase() === 'all'
            ? publications
            : publications.filter(p => (p.index || '').toLowerCase() === currentFilter.toLowerCase())

        if (dataToExport.length === 0) {
            alert(`No publications found for filter: ${currentFilter}`)
            return
        }

        // Prepare the workbook data
        const worksheetData = [
            columns.map(col => col.header), // Headers
            ...dataToExport.map(pub => columns.map(col => {
                let value = pub[col.field]
                if (col.field === 'publicationDate' && value) {
                    value = formatPublicationDate(value)
                }
                return value || '—'
            }))
        ]

        // Create workbook and sheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(worksheetData)

        // Basic styling: Column widths
        ws['!cols'] = columns.map(col => ({ wch: 25 }))

        XLSX.utils.book_append_sheet(wb, ws, 'Publications')

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const fileName = `Publications_${currentFilter.toUpperCase()}_${timestamp}.xlsx`

        // Save file
        XLSX.writeFile(wb, fileName)
    }

    setTimeout(() => {
        loadPublications()
    }, 100)
    // Create title search field
    const createTitleSearchField = (column, inputBaseStyle) => {
        const containerId = 'title-search-container'
        const inputId = 'title-search-input'
        const resultsId = 'title-search-results'
        const hiddenResearchId = 'selected-research-id'
        const hiddenEndorsementId = 'selected-endorsement-id'

        // Create container div
        const container = $({
            tag: 'div',
            style: {
                position: 'relative',
                width: '100%'
            }
        })

        // Create hidden inputs for storing selected research data
        const hiddenResearchInput = $({
            tag: 'input',
            att: {
                type: 'hidden',
                id: hiddenResearchId,
                name: 'selected_research_id'
            }
        })

        const hiddenEndorsementInput = $({
            tag: 'input',
            att: {
                type: 'hidden',
                id: hiddenEndorsementId,
                name: 'selected_endorsement_id'
            }
        })

        // Create search input
        const searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                id: inputId,
                placeholder: 'Search completed research titles...',
                autocomplete: 'off'
            },
            style: {
                ...inputBaseStyle,
                width: '100%'
            }
        })

        // Create results dropdown
        const resultsDropdown = $({
            tag: 'div',
            att: { id: resultsId },
            style: {
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '4px',
                marginTop: '4px',
                display: 'none',
                zIndex: '1000',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }
        })

        // Add event listener for search input
        let searchTimeout
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout)
            const searchTerm = e.target.value

            if (searchTerm.length < 2) {
                resultsDropdown.style.display = 'none'
                return
            }

            searchTimeout = setTimeout(async () => {
                const results = await searchResearchTitles(searchTerm)

                // Clear previous results
                resultsDropdown.innerHTML = ''

                if (results.length === 0) {
                    const noResult = $({
                        tag: 'div',
                        style: {
                            padding: '10px',
                            color: '#aaa',
                            textAlign: 'center'
                        },
                        text: 'No matching research found'
                    })
                    resultsDropdown.appendChild(noResult)
                } else {
                    results.forEach(result => {
                        const resultItem = $({
                            tag: 'div',
                            style: {
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #444',
                                transition: 'background 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: { color: '#fff', fontWeight: '500', marginBottom: '4px' },
                                    text: result.title
                                }),
                                $({
                                    tag: 'div',
                                    style: { color: '#aaa', fontSize: '12px' },
                                    text: `${Array.isArray(result.author) ? result.author.join(', ') : (result.author || 'No author')} • ${result.event || ''}`
                                })
                            ]
                        })

                        // Add click event to select this research
                        resultItem.addEventListener('click', () => {
                            // Set the search input value
                            searchInput.value = result.title

                            // Set hidden fields
                            document.getElementById(hiddenResearchId).value = result.id
                            document.getElementById(hiddenEndorsementId).value = result.endorsement_id

                            // Hide dropdown
                            resultsDropdown.style.display = 'none'


                        })

                        resultItem.addEventListener('mouseenter', (e) => {
                            e.currentTarget.style.backgroundColor = '#444'
                        })

                        resultItem.addEventListener('mouseleave', (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        })

                        resultsDropdown.appendChild(resultItem)
                    })
                }

                resultsDropdown.style.display = 'block'
            }, 300)
        })

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                resultsDropdown.style.display = 'none'
            }
        })

        // Assemble the container
        container.appendChild(hiddenResearchInput)
        container.appendChild(hiddenEndorsementInput)
        container.appendChild(searchInput)
        container.appendChild(resultsDropdown)

        return container
    }
    // Columns for publication research
    const columns = [
        { field: 'title', header: 'Title of Completed Research', width: '350px', type: 'text', required: true },
        { field: 'publishedTitle', header: 'Published Title', width: '350px', type: 'text', required: true },
        { field: 'publicationDate', header: 'Date of Publication', width: '150px', type: 'date', required: true },
        { field: 'journalTitle', header: 'Title of Journal / Publication', width: '300px', type: 'text', required: true },
        { field: 'volume', header: 'Volume', width: '100px', type: 'text', required: true },
        { field: 'issue', header: 'Issue', width: '100px', type: 'text', required: true },
        { field: 'issn', header: 'ISSN / ISBN', width: '130px', type: 'text', required: true },
        { field: 'index', header: 'Index', width: '100px', type: 'text', required: true, placeholder: 'Scopus, WOS, & etc.' },
        { field: 'doi', header: 'DOI', width: '200px', type: 'text', required: false },
        { field: 'publication_link', header: 'Link / Site of Publication', width: '220px', type: 'text', required: true },
        { field: 'actions', header: 'Actions', width: '100px', type: 'actions' }
    ]

    // Index types with their colors
    const indexTypes = [
        { value: 'refereed', label: 'Refereed', color: '#ffffff', bgColor: '#2a2a2a' },
        { value: 'scopus', label: 'Scopus', color: '#000000', bgColor: '#ffd700' },
        { value: 'wos', label: 'WOS', color: '#ffffff', bgColor: '#4caf50' }
    ]





    const getMainContainer = (el) => {
        mainTableContainer = el
    }

    const getTableBody = (el) => {
        tableBody = el
        updateTableDisplay()
    }

    // Individual stat card factory
    const createSingleStatCard = (stat) => {
        return $({
            tag: 'div',
            att: { className: 'stat-card' },
            style: {
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flex: '1',
                minWidth: '220px',
                border: `1px solid ${stat.borderColor || '#444'}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '100px',
                        height: '100px',
                        background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)`,
                        borderRadius: '50%',
                        zIndex: '0'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        backgroundColor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${stat.color}30`,
                        position: 'relative',
                        zIndex: '1'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: `fa-solid ${stat.icon}` },
                            style: {
                                color: stat.color,
                                fontSize: '28px',
                                textShadow: stat.textColor === '#000000' ? 'none' : '0 2px 4px rgba(0,0,0,0.2)'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        zIndex: '1'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { id: stat.id },
                                    text: stat.value,
                                    style: {
                                        fontSize: '34px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        lineHeight: '1.2',
                                        letterSpacing: '-1px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: stat.subtext,
                                    style: {
                                        fontSize: '11px',
                                        color: '#666',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'span',
                            text: stat.label,
                            style: {
                                color: '#aaa',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginTop: '4px'
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Refresh stats cards to reflect current publications data
    const refreshStats = () => {
        if (!statsContainer) return

        // Clear current stats
        statsContainer.innerHTML = ''

        // 1. Total Publications (Always first)
        const baseStats = [
            {
                label: 'Total Publications',
                id: 'stat-total',
                value: publications.length.toString(),
                icon: 'fa-book',
                color: 'deepskyblue',
                subtext: 'All time'
            }
        ]

        // 2. Base index-based stats (Always show Scopus and WOS)
        const fixedIndices = ['scopus', 'wos']

        // Find all unique indices from data
        const dataIndices = [...new Set(publications
            .map(p => (p.index || '').toLowerCase())
            .filter(idx => idx !== ''))]

        // Combine fixed and dynamic, ensuring Scopus and WOS are always present
        const allIndicesToShow = [...new Set([...fixedIndices, ...dataIndices])].sort()

        const dynamicStats = allIndicesToShow.map(idx => {
            const count = publications.filter(p => (p.index || '').toLowerCase() === idx).length
            const config = indexTypes.find(i => i.value === idx) || {
                label: formatIndexLabel(idx),
                color: '#ffffff'
            }

            return {
                label: config.label,
                id: `stat-${idx}`,
                value: count.toString(),
                icon: idx === 'scopus' ? 'fa-magnifying-glass' : (idx === 'wos' ? 'fa-globe' : 'fa-check-circle'),
                color: idx === 'scopus' ? '#ffd700' : (idx === 'wos' ? '#4caf50' : '#ffffff'),
                subtext: idx,
                textColor: idx === 'scopus' ? '#000000' : '#ffffff'
            }
        })

        // Combine and render
        const allStats = [...baseStats, ...dynamicStats]

        allStats.forEach(stat => {
            const card = createSingleStatCard(stat)
            statsContainer.appendChild(card)
        })

        const recCount = document.querySelector('.record-count')
        if (recCount) recCount.textContent = `${publications.length} publication${publications.length !== 1 ? 's' : ''}`
    }

    // Helper to format index labels nicely
    const formatIndexLabel = (idx) => {
        if (!idx) return ''
        const val = idx.trim().toLowerCase()
        if (val === 'all') return 'All'
        if (val === 'scopus') return 'Scopus'
        if (val === 'wos') return 'WOS'

        const config = indexTypes.find(i => i.value === val)
        if (config) return config.label

        // Try to find the original casing from the publications data
        const match = publications.find(p => (p.index || '').toLowerCase() === val)
        if (match && match.index) return match.index

        // Default to Title Case
        return val.charAt(0).toUpperCase() + val.slice(1)
    }

    // Function to update table display based on publications data
    const updateTableDisplay = () => {
        if (!tableBody) return

        // Refresh stats to reflect live data
        refreshStats()

        // Clear table body
        tableBody.innerHTML = ''

        if (publications.length === 0) {
            // Show empty state
            const emptyState = createEmptyState()
            tableBody.appendChild(emptyState)
        } else {
            // Populate table with publications
            publications.forEach(pub => {
                const row = createPublicationRow(pub)
                tableBody.appendChild(row)
            })
        }
    }

    // Helper to update filter buttons dynamically
    const updateFilterUI = () => {
        if (!indexFilterContainer) return

        // Clear current buttons
        indexFilterContainer.innerHTML = ''

        // Base filter types
        const baseTypes = ['All', 'Scopus', 'WOS']

        // Get dynamic types from data that aren't in baseTypes
        const dynamicTypesFromData = [...new Set(publications
            .map(p => p.index)
            .filter(idx => {
                if (!idx) return false
                const normalized = idx.toLowerCase()
                return !baseTypes.some(b => b.toLowerCase() === normalized)
            })
        )].sort()

        const allTypes = [...baseTypes, ...dynamicTypesFromData]

        allTypes.forEach(type => {
            const isActive = currentFilter.toLowerCase() === type.toLowerCase()
            const btn = $({
                tag: 'button',
                text: formatIndexLabel(type),
                att: {
                    className: `filter-btn filter-${type.toLowerCase()}`,
                    'data-type': type.toLowerCase()
                },
                style: {
                    backgroundColor: isActive ? 'deepskyblue' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    color: isActive ? '#fff' : '#aaa',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: (e) => loadPublications(type.toLowerCase())
                },
                event2: {
                    type: 'mouseenter',
                    method: (e) => {
                        if (currentFilter.toLowerCase() !== type.toLowerCase()) {
                            e.target.style.backgroundColor = '#444'
                            e.target.style.color = '#fff'
                        }
                    }
                },
                event3: {
                    type: 'mouseleave',
                    method: (e) => {
                        if (currentFilter.toLowerCase() !== type.toLowerCase()) {
                            e.target.style.backgroundColor = 'transparent'
                            e.target.style.color = '#aaa'
                        }
                    }
                }
            })
            indexFilterContainer.appendChild(btn)
        })
    }

    // Refresh stat card numbers and generate new ones for unique index types

    // Create empty state
    const createEmptyState = () => {
        return $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: columns.length },
                    style: {
                        padding: '0'
                    },
                    child: [
                        $({
                            tag: 'div',
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
                                        width: '160px',
                                        height: '160px',
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-book-open' },
                                            style: {
                                                fontSize: '100px',
                                                color: 'deepskyblue',
                                                opacity: 0.2,
                                                position: 'absolute',
                                                left: '0',
                                                top: '0',
                                                transform: 'rotate(-5deg)'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-scroll' },
                                            style: {
                                                fontSize: '70px',
                                                color: '#ffd700',
                                                opacity: 0.25,
                                                position: 'absolute',
                                                right: '-10px',
                                                bottom: '0',
                                                transform: 'rotate(10deg)'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-award' },
                                            style: {
                                                fontSize: '50px',
                                                color: '#4caf50',
                                                opacity: 0.3,
                                                position: 'absolute',
                                                left: '-15px',
                                                bottom: '10px',
                                                transform: 'rotate(-15deg)'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No Published Research Found',
                                    style: {
                                        fontSize: '26px',
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#fff',
                                        letterSpacing: '-0.5px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Published research papers in refereed journals, Scopus, WOS, and other',
                                    style: {
                                        fontSize: '15px',
                                        opacity: 0.7,
                                        textAlign: 'center',
                                        lineHeight: '1.6'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'indexed publications will be displayed here',
                                    style: {
                                        fontSize: '15px',
                                        opacity: 0.7,
                                        marginBottom: '30px',
                                        textAlign: 'center'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        gap: '15px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    // Create publication row
    const createPublicationRow = (publication) => {
        const cells = columns.map(col => {
            let cellContent = publication[col.field] || '—'
            let cellStyle = {
                padding: '16px 12px',
                fontSize: '13px',
                color: '#ddd',
                borderBottom: '1px solid #444',
                whiteSpace: 'nowrap',
                fontFamily: 'Segoe UI, sans-serif'
            }

            if (col.field === 'index') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [createIndexBadge(cellContent)]
                })
            }

            if (col.field === 'publication_link' && cellContent !== '—') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [
                        $({
                            tag: 'a',
                            text: cellContent,
                            att: {
                                href: cellContent.startsWith('http') ? cellContent : `https://${cellContent}`,
                                target: '_blank',
                                title: 'Open publication link'
                            },
                            style: {
                                color: 'deepskyblue',
                                textDecoration: 'none',
                                fontWeight: '500'
                            },
                            event: {
                                type: 'mouseenter',
                                method: (e) => e.target.style.textDecoration = 'underline'
                            },
                            event2: {
                                type: 'mouseleave',
                                method: (e) => e.target.style.textDecoration = 'none'
                            }
                        })
                    ]
                })
            }

            if (col.field === 'publicationDate' && cellContent !== '—') {
                cellContent = formatPublicationDate(cellContent)
            }

            if (col.field === 'actions') {
                return $({
                    tag: 'td',
                    style: cellStyle,
                    child: [
                        $({
                            tag: 'button',
                            att: { title: 'Edit Publication' },
                            style: {
                                backgroundColor: 'transparent',
                                border: '1px solid deepskyblue',
                                color: 'deepskyblue',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-pen-to-square' }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: (e) => {
                                    e.stopPropagation()
                                    openEditPublicationModal(publication)
                                }
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = 'deepskyblue'
                                    e.target.style.color = '#fff'
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'deepskyblue'
                                }
                            }
                        })
                    ]
                })
            }

            return $({
                tag: 'td',
                style: cellStyle,
                text: cellContent
            })
        })

        return $({
            tag: 'tr',
            style: {
                backgroundColor: '#2d2d2d',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
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

    // Function to create index badge with color coding
    const createIndexBadge = (indexType) => {
        const val = indexType ? indexType.toLowerCase() : ''
        const indexConfig = indexTypes.find(i => i.value === val) || {
            label: indexType,
            bgColor: '#2a2a2a',
            color: '#ffffff'
        }

        return $({
            tag: 'span',
            att: { className: `index-badge index-${val}` },
            style: {
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                backgroundColor: indexConfig.bgColor,
                color: indexConfig.color,
                border: (val === 'refereed' || !indexTypes.some(i => i.value === val)) ? '1px solid #444' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            },
            text: indexConfig.label
        })
    }

    // Open add publication modal
    const openAddPublicationModal = () => {
        const modal = createPublicationModal()
        document.body.appendChild(modal)
        setTimeout(() => {
            modalOverlay.style.opacity = '1'
        }, 10)
    }


    // Create publication modal
    function createPublicationModal(editData = null) {
        const isEdit = !!editData

        // Create form fields grid children
        const formFieldsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
            },
            child: [
                // Hidden ID field for editing
                isEdit ? $({
                    tag: 'input',
                    att: { type: 'hidden', id: 'field-id', value: editData.id }
                }) : null,
                // Hidden research/endorsement IDs for editing (needed if we don't change them)
                isEdit ? $({
                    tag: 'input',
                    att: { type: 'hidden', id: 'selected-research-id', value: editData.research_id }
                }) : null,
                isEdit ? $({
                    tag: 'input',
                    att: { type: 'hidden', id: 'selected-endorsement-id', value: editData.endorsement_id }
                }) : null,
                
                ...columns
                    .filter(col => col.field !== 'actions')
                    .map(col => createFormField(col, editData))
            ].filter(Boolean)
        })

        // Create form actions
        const formActions = $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
                borderTop: '1px solid #444',
                paddingTop: '24px'
            },
            child: [
                $({
                    tag: 'button',
                    att: { type: 'button' },
                    style: {
                        backgroundColor: 'transparent',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        color: '#aaa',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    text: 'Cancel',
                    event: {
                        type: 'click',
                        method: closeModal
                    }
                }),
                $({
                    tag: 'button',
                    att: { type: 'submit' },
                    style: {
                        backgroundColor: 'deepskyblue',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 32px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-save' }
                        }),
                        $({
                            tag: 'span',
                            text: isEdit ? 'Update Publication' : 'Save Publication'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.preventDefault()
                            savePublication()
                        }
                    }
                })
            ]
        })

        // Create form
        const form = $({
            tag: 'form',
            att: { id: 'publicationForm' },
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            },
            child: [
                formFieldsGrid,
                formActions
            ]
        })

        // Create modal header close button
        const closeButton = $({
            tag: 'button',
            style: {
                background: 'none',
                border: 'none',
                color: '#aaa',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 8px',
                transition: 'color 0.2s ease'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-times' }
                })
            ],
            event: {
                type: 'click',
                method: closeModal
            }
        })

        // Create modal header
        const modalHeader = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderBottom: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#2a2a2a'
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
                            att: { className: isEdit ? 'fa-solid fa-edit' : 'fa-solid fa-plus-circle' },
                            style: { color: 'deepskyblue', fontSize: '24px' }
                        }),
                        $({
                            tag: 'h2',
                            text: isEdit ? 'Edit Publication' : 'Add New Publication',
                            style: {
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: '600',
                                margin: '0',
                                letterSpacing: '-0.5px'
                            }
                        })
                    ]
                }),
                closeButton
            ]
        })

        // Create modal body
        const modalBody = $({
            tag: 'div',
            style: {
                padding: '24px',
                overflow: 'auto',
                maxHeight: 'calc(90vh - 140px)'
            },
            child: [form]
        })

        // Create modal content
        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#2d2d2d',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '1000px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                border: '1px solid #444',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                modalHeader,
                modalBody
            ]
        })

        modalOverlay = $({
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
                zIndex: '9999',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                backdropFilter: 'blur(5px)'
            },
            child: [modalContent]
        })

        return modalOverlay
    }

    // Create form field based on column type
    function createFormField(column, editData = null) {
        const isEdit = !!editData
        const fieldId = `field-${column.field}`
        const initialValue = isEdit ? (editData[column.field] || '') : ''
        let inputElement

        // Common label style
        const labelStyle = {
            display: 'block',
            marginBottom: '8px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.3px'
        }

        // Common input style
        const inputBaseStyle = {
            width: '100%',
            padding: '12px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
        }

        if (column.field === 'title') {
            if (isEdit) {
                // Return read-only version for edit mode
                return $({
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column' },
                    child: [
                        $({
                            tag: 'label',
                            style: labelStyle,
                            text: column.header
                        }),
                        $({
                            tag: 'div',
                            style: {
                                ...inputBaseStyle,
                                backgroundColor: '#222',
                                color: '#888',
                                borderStyle: 'dashed'
                            },
                            text: initialValue
                        }),
                        $({
                            tag: 'input',
                            att: { type: 'hidden', id: 'title-search-input', value: initialValue }
                        })
                    ]
                })
            }
            // Build the autocomplete search container and return early
            // so the generic input branches below don't overwrite it.
            const searchContainer = createTitleSearchField(column, inputBaseStyle)

            const labelChildren = [
                $({
                    tag: 'span',
                    text: column.header
                }),
                $({
                    tag: 'span',
                    text: ' *',
                    style: { color: 'deepskyblue', marginLeft: '4px' }
                })
            ]

            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column'
                },
                child: [
                    $({
                        tag: 'label',
                        att: { for: 'title-search-input' },
                        style: labelStyle,
                        child: labelChildren
                    }),
                    searchContainer
                ]
            })
        }
        // Create different input types
        if (column.type === 'select') {
            let options = []

            if (column.field === 'index') {
                options = indexTypes
            } else if (column.field === 'quartile') {
                options = quartileOptions.map(q => ({ value: q, label: q }))
            } else if (column.field === 'campus') {
                options = campusOptions.map(c => ({ value: c, label: c }))
            } else if (column.field === 'category') {
                options = categoryOptions.map(c => ({ value: c, label: c }))
            }

            inputElement = $({
                tag: 'select',
                att: {
                    id: fieldId,
                    name: fieldId,
                    required: column.required ? true : undefined
                },
                style: {
                    ...inputBaseStyle,
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                },
                child: [
                    $({
                        tag: 'option',
                        att: { value: '', disabled: true, selected: !initialValue },
                        text: `Select ${column.header}`
                    }),
                    ...options.map(opt => {
                        const val = opt.value || opt
                        return $({
                            tag: 'option',
                            att: { value: val, selected: val === initialValue },
                            text: opt.label || opt
                        })
                    })
                ]
            })
        } else if (column.type === 'date') {
            inputElement = $({
                tag: 'input',
                att: {
                    type: 'date',
                    id: fieldId,
                    name: fieldId,
                    value: initialValue,
                    required: column.required ? true : undefined
                },
                style: inputBaseStyle
            })
        } else {
            inputElement = $({
                tag: 'input',
                att: {
                    type: column.type || 'text',
                    id: fieldId,
                    name: fieldId,
                    value: initialValue,
                    placeholder: column.placeholder || `${column.header}`,
                    required: column.required ? true : undefined
                },
                style: inputBaseStyle
            })
        }

        // Create label with optional asterisk
        const labelChildren = [
            $({
                tag: 'span',
                text: column.header
            })
        ]

        if (column.required) {
            labelChildren.push(
                $({
                    tag: 'span',
                    text: ' *',
                    style: { color: 'deepskyblue', marginLeft: '4px' }
                })
            )
        }

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                $({
                    tag: 'label',
                    att: { for: fieldId },
                    style: labelStyle,
                    child: labelChildren
                }),
                inputElement
            ]
        })
    }

    // Save publication to database
    const savePublication = async () => {
        // Check if we are editing
        const editId = document.getElementById('field-id')?.value
        const isEdit = !!editId

        // Get the selected research data from hidden fields
        const researchId = document.getElementById('selected-research-id')?.value
        const endorsementId = document.getElementById('selected-endorsement-id')?.value
        const titleValue = document.getElementById('title-search-input')?.value

        if (!researchId || !endorsementId) {
            alert('Please select a research title from the suggestions first')
            return
        }

        // Build FormData with the exact POST keys PHP expects
        const formData = new FormData()
        formData.append('action', isEdit ? 'update' : 'add')
        
        if (isEdit) {
            formData.append('id', editId)
        }

        formData.append('research_id', researchId)
        formData.append('endorsement_id', endorsementId)
        formData.append('title', titleValue || '')
        formData.append('publishedTitle', document.getElementById('field-publishedTitle')?.value || '')
        formData.append('publicationDate', document.getElementById('field-publicationDate')?.value || '')
        formData.append('journalTitle', document.getElementById('field-journalTitle')?.value || '')
        formData.append('volume', document.getElementById('field-volume')?.value || '')
        formData.append('issue', document.getElementById('field-issue')?.value || '')
        formData.append('issn', document.getElementById('field-issn')?.value || '')
        formData.append('index_type', document.getElementById('field-index')?.value || '')
        formData.append('doi', document.getElementById('field-doi')?.value || '')
        formData.append('publication_link', document.getElementById('field-publication_link')?.value || '')

        try {
            const response = await fetch('/publish', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                // Refresh publications list
                await loadPublications()

                // Close modal
                closeModal()

                // Show success message
                alert(isEdit ? 'Publication updated successfully!' : 'Publication added successfully!')
            } else {
                alert('Error: ' + result.message)
            }
        } catch (error) {
            console.error('Error saving publication:', error)
            alert('Failed to save publication')
        }
    }

    // Filter and search bar with index filter
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
                // Left section - Title and filter buttons
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
                                    att: { className: 'fa-solid fa-book' },
                                    style: { color: 'deepskyblue', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Publications',
                                    style: {
                                        color: '#fff',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '24px',
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
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontFamily: 'monospace',
                                        border: '1px solid #444'
                                    },
                                    text: `${publications.length} publication${publications.length !== 1 ? 's' : ''}`
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'index-filters' },
                            style: {
                                display: 'flex',
                                gap: '8px',
                                backgroundColor: '#333',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid #444'
                            },
                            elementHandler: (el) => {
                                indexFilterContainer = el
                                updateFilterUI()
                            }
                        })
                    ]
                }),

                // Right section - Search, filters, and action buttons
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
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
                                        color: '#666',
                                        fontSize: '14px',
                                        zIndex: '1'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        placeholder: 'Search completed research',
                                        className: 'publication-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '220px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            const term = e.target.value
                                            clearTimeout(mainSearchTimeout)
                                            mainSearchTimeout = setTimeout(() => {
                                                loadPublications(currentFilter, term)
                                            }, 400)
                                        }
                                    }
                                })
                            ]
                        }),

                        // Action buttons group
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                borderLeft: '1px solid #444',
                                paddingLeft: '12px',
                                marginLeft: '4px'
                            },
                            child: [
                                // Add Publication button
                                $({
                                    tag: 'button',
                                    att: { className: 'add-publication-btn' },
                                    style: {
                                        backgroundColor: 'deepskyblue',
                                        border: 'none',
                                        borderRadius: '30px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0, 191, 255, 0.3)'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-plus-circle' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Add Publication'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: openAddPublicationModal
                                    }
                                }),

                                // Export button
                                $({
                                    tag: 'button',
                                    att: { className: 'export-btn' },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 20px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-download' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Export'
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: exportToExcel
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }


    // Statistics cards for publication metrics
    const StatsCards = () => {
        return $({
            tag: 'div',
            att: { className: 'stats-cards-wrapper' },
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #444'
            },
            elementHandler: (el) => {
                statsContainer = el
                refreshStats()
            }
        })
    }



    // Table header component
    const TableHeader = () => {
        const headerCells = columns.map(col => {
            return $({
                tag: 'th',
                style: {
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#aaa',
                    backgroundColor: '#2d2d2d',
                    borderBottom: '2px solid #444',
                    whiteSpace: 'nowrap',
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            userSelect: 'none'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: col.header
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-arrow-up-wide-short' },
                                style: {
                                    fontSize: '11px',
                                    color: '#555',
                                    opacity: '0.5',
                                    transition: 'all 0.2s ease'
                                }
                            })
                        ],
                        event: {
                            type: 'mouseenter',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = 'deepskyblue'
                            }
                        },
                        event2: {
                            type: 'mouseleave',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid')
                                if (icon) icon.style.color = '#555'
                            }
                        }
                    })
                ]
            })
        })

        return $({
            tag: 'thead',
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        })
    }

    // Main table component
    const DataTable = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 200px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'separate',
                        borderSpacing: '0',
                        minWidth: 'max-content'
                    },
                    child: [
                        TableHeader(),
                        $({
                            tag: 'tbody',
                            elementHandler: getTableBody
                        })
                    ]
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'publication-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/publication.css',
        elementHandler: getMainContainer,
        child: [
            StatsCards(),
            FilterBar(),
            DataTable()
        ]
    })
}

// Utility functions for publications
export const formatPublicationDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export const getIndexColor = (indexType) => {
    const colors = {
        'refereed': { bg: '#2a2a2a', text: '#ffffff', border: '#444' },
        'scopus': { bg: '#ffd700', text: '#000000' },
        'wos': { bg: '#4caf50', text: '#ffffff' }
    }
    return colors[indexType] || colors.refereed
}

export const createIndexBadgeElement = (indexType) => {
    const config = getIndexColor(indexType)
    const label = indexType.charAt(0).toUpperCase() + indexType.slice(1)

    return $({
        tag: 'span',
        att: { className: `index-badge index-${indexType}` },
        style: {
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'inline-block',
            backgroundColor: config.bg,
            color: config.text,
            border: config.border ? `1px solid ${config.border}` : 'none'
        },
        text: label
    })
}
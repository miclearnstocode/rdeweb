import { $, Waiting } from "../../../../lib/lib.js"

export const publicationResearch = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let modalElement = null
    let loadingElement = null
    let publicationData = []
    let filteredData = []
    let currentCampus = 'All Campuses'
    let currentCenter = 'All Centers'
    let currentPublicationType = 'All Types'
    let currentRefereeStatus = 'All Status'
    let isLoading = false
    let hasMore = true
    let nextCursor = null
    let totalCount = 0
    let initialLoadDone = false

    // Stats state
    let currentStats = {
        totalPublications: 0,
        totalAuthors: 0,
        national: 0,
        international: 0,
        refereed: 0,
        nonRefereed: 0,
        scopusIndexed: 0,
        wosIndexed: 0
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

    // Publication type options
    const publicationTypes = [
        'All Types',
        'National',
        'International'
    ]

    // Referee status options
    const refereeStatuses = [
        'All Status',
        'Refereed',
        'Non-refereed'
    ]

    // Indexing body options
    const indexingBodies = [
        'None',
        'Scopus',
        'Web of Science (WOS)',
        'Scopus & WOS',
        'Google Scholar',
        'ASEAN Citation Index (ACI)',
        'Philippine E-Journals',
        'CrossRef',
        'DOAJ',
        'PubMed',
        'Others'
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

    // Fetch publication data
    const fetchPublicationData = async (cursor = null) => {
        if (isLoading) return

        if (!initialLoadDone) {
            initialLoadDone = true
        }

        isLoading = true

        if (!cursor) {
            showLoading()
            publicationData = []
            filteredData = []
            hasMore = true
            nextCursor = null
        }

        try {
            const formData = new FormData()
            formData.append('action', 'fetch_publications')

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
            if (currentPublicationType !== 'All Types') {
                formData.append('publicationType', currentPublicationType)
            }
            if (currentRefereeStatus !== 'All Status') {
                formData.append('refereeStatus', currentRefereeStatus)
            }

            const response = await fetch('/api/publication-research', {
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
                    publicationData = newData
                    filteredData = newData
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false

                    // Update stats
                    if (result.summary) {
                        currentStats = result.summary
                        totalCount = result.summary.totalPublications
                        updateStats()
                    }
                } else {
                    publicationData = [...publicationData, ...newData]
                    filteredData = [...filteredData, ...newData]
                    nextCursor = result.pagination?.next_cursor || null
                    hasMore = result.pagination?.has_more || false
                }

                applyLocalFilters()
                updateRecordCount()
            } else {
                console.error('Server returned error:', result.message)
                if (!cursor) {
                    showEmptyState()
                }
            }
        } catch (error) {
            console.error('Error fetching publication data:', error)
            if (!cursor) {
                showEmptyState()
                showNotification('Failed to load data. Please check your connection.', 'error')
            }
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    // Apply local filters
    const applyLocalFilters = () => {
        let filtered = [...publicationData]

        if (currentPublicationType !== 'All Types') {
            filtered = filtered.filter(item => item.publicationType === currentPublicationType)
        }
        if (currentRefereeStatus !== 'All Status') {
            filtered = filtered.filter(item => item.refereeStatus === currentRefereeStatus)
        }

        filteredData = filtered
        updateTableWithData()
    }

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchPublicationData(nextCursor)
        }
    }

    // Update statistics
    const updateStats = () => {
        const statTotalPublications = document.querySelector('.stat-total-publications')
        const statTotalAuthors = document.querySelector('.stat-total-authors')
        const statNational = document.querySelector('.stat-national')
        const statInternational = document.querySelector('.stat-international')
        const statRefereed = document.querySelector('.stat-refereed')
        const statNonRefereed = document.querySelector('.stat-non-refereed')
        const statScopus = document.querySelector('.stat-scopus')
        const statWos = document.querySelector('.stat-wos')

        if (statTotalPublications) statTotalPublications.textContent = currentStats.totalPublications
        if (statTotalAuthors) statTotalAuthors.textContent = currentStats.totalAuthors
        if (statNational) statNational.textContent = currentStats.national
        if (statInternational) statInternational.textContent = currentStats.international
        if (statRefereed) statRefereed.textContent = currentStats.refereed
        if (statNonRefereed) statNonRefereed.textContent = currentStats.nonRefereed
        if (statScopus) statScopus.textContent = currentStats.scopusIndexed
        if (statWos) statWos.textContent = currentStats.wosIndexed
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
                marginTop: '20%',
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
                    att: { className: 'fa-solid fa-book-open' },
                    style: {
                        fontSize: '64px',
                        marginBottom: '20px',
                        opacity: 0.3,
                        color: '#2196f3'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No Published Articles Found',
                    style: {
                        fontSize: '20px',
                        marginBottom: '12px',
                        fontWeight: '500',
                        color: '#fff'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'Click "Add Publication" to add published research articles',
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

    // Render publication type badge
    const renderPublicationTypeBadge = (type) => {
        if (!type || type === '—') return '—'

        const colors = type === 'International'
            ? { bg: 'rgba(233, 30, 99, 0.15)', color: '#e91e63', border: 'rgba(233, 30, 99, 0.3)', icon: 'fa-globe' }
            : { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)', icon: 'fa-flag' }

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
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${colors.icon}` },
                    style: { fontSize: '10px' }
                }),
                $({ tag: 'span', text: type })
            ]
        })
    }

    // Render referee status badge
    const renderRefereeBadge = (status) => {
        if (!status || status === '—') return '—'

        const colors = status === 'Refereed'
            ? { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' }
            : { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' }

        return $({
            tag: 'span',
            style: {
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase'
            },
            text: status
        })
    }

    // Render indexing body badge
    const renderIndexingBadge = (indexing) => {
        if (!indexing || indexing === '—' || indexing === 'None') return '—'

        const indexingColors = {
            'Scopus': { bg: 'rgba(255, 152, 0, 0.15)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' },
            'Web of Science (WOS)': { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)' },
            'Scopus & WOS': { bg: 'rgba(156, 39, 176, 0.15)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)' }
        }

        const colors = indexingColors[indexing] || { bg: 'rgba(96, 125, 139, 0.15)', color: '#607d8b', border: 'rgba(96, 125, 139, 0.3)' }

        return $({
            tag: 'span',
            style: {
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`
            },
            text: indexing
        })
    }

    // Render authors list
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
                gap: '4px'
            },
            child: authorList.map((author, idx) => {
                const name = typeof author === 'string' ? author : author.name || 'Unknown'

                return $({
                    tag: 'div',
                    style: {
                        padding: '4px 8px',
                        backgroundColor: idx % 2 === 0 ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#ddd',
                        lineHeight: '1.4'
                    },
                    text: name
                })
            })
        })
    }

    // Render DOI as link
    const renderDOI = (doi) => {
        if (!doi || doi === '—') return '—'

        return $({
            tag: 'a',
            att: {
                href: doi.startsWith('http') ? doi : `https://doi.org/${doi}`,
                target: '_blank',
                rel: 'noopener noreferrer'
            },
            text: doi,
            style: {
                color: '#2196f3',
                textDecoration: 'none',
                fontSize: '11px',
                wordBreak: 'break-all',
                fontFamily: 'monospace'
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
    }

    // Render links
    const renderLinks = (links, type = 'default') => {
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

        const linkColor = type === 'paperTrail' ? '#ff9800' : '#2196f3'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            },
            child: linkArray.map((link, idx) => {
                const url = typeof link === 'string' ? link : link.url || link
                const label = typeof link === 'string' ? `${type === 'paperTrail' ? 'Document' : 'Link'} ${idx + 1}` : (link.label || `${type === 'paperTrail' ? 'Document' : 'Link'} ${idx + 1}`)

                return $({
                    tag: 'a',
                    att: {
                        href: url,
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    },
                    style: {
                        color: linkColor,
                        textDecoration: 'none',
                        fontSize: '11px',
                        wordBreak: 'break-all',
                        padding: '6px 10px',
                        backgroundColor: `${linkColor}15`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: `1px solid ${linkColor}30`,
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
                            e.target.style.backgroundColor = `${linkColor}25`
                        },
                        type2: 'mouseleave',
                        method2: (e) => {
                            e.target.style.backgroundColor = `${linkColor}15`
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

        // Title of Article
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

        // Author(s)
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    minWidth: '180px'
                },
                child: [renderAuthors(item.authors)]
            })
        )

        // Name of Book/Journal
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    minWidth: '180px'
                },
                text: item.journalName || '—'
            })
        )

        // ISSN/ISBN
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#bbb',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontFamily: 'monospace'
                },
                text: item.issn || '—'
            })
        )

        // Vol.No/Issue No.
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#bbb',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontFamily: 'monospace'
                },
                text: item.volumeIssue || '—'
            })
        )

        // Number of Pages
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#ddd',
                    border: '1px solid #444',
                    verticalAlign: 'top'
                },
                text: item.pages || '—'
            })
        )

        // Date of Publication
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
                text: formatDate(item.publicationDate)
            })
        )

        // DOI
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '150px'
                },
                child: [renderDOI(item.doi)]
            })
        )

        // Publication National or International
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top'
                },
                child: [renderPublicationTypeBadge(item.publicationType)]
            })
        )

        // Refereed/Non-refereed
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top'
                },
                child: [renderRefereeBadge(item.refereeStatus)]
            })
        )

        // Indexing Body
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: '1px solid #444',
                    verticalAlign: 'top'
                },
                child: [renderIndexingBadge(item.indexingBody)]
            })
        )

        // Link of Website/Article Published
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '200px'
                },
                child: [renderLinks(item.websiteLinks, 'website')]
            })
        )

        // Link of Paper Trail Folder
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    maxWidth: '250px',
                    backgroundColor: 'rgba(255, 152, 0, 0.03)'
                },
                child: [renderLinks(item.paperTrailLinks, 'paperTrail')]
            })
        )

        // Remarks
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#bbb',
                    border: '1px solid #444',
                    verticalAlign: 'top',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    minWidth: '150px'
                },
                text: item.remarks || '—'
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
                            deletePublication(item)
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

    // Delete publication
    const deletePublication = async (item) => {
        const confirmed = confirm('Are you sure you want to delete this publication record?')
        if (!confirmed) return

        try {
            showLoading()
            const formData = new FormData()
            formData.append('action', 'delete_publication')
            formData.append('id', item.id)

            const response = await fetch('/api/publication-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                showNotification('Publication record deleted successfully', 'success')
                await refreshData()
            } else {
                showNotification('Failed to delete publication record', 'error')
            }
        } catch (error) {
            console.error('Error deleting publication:', error)
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

        // Website links state
        let websiteLinks = []
        if (isEditing && item.websiteLinks) {
            try {
                websiteLinks = typeof item.websiteLinks === 'string' ? JSON.parse(item.websiteLinks) : item.websiteLinks
                if (!Array.isArray(websiteLinks)) websiteLinks = []
            } catch (e) {
                websiteLinks = []
            }
        }

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

        // Containers for dynamic fields
        let authorsContainer
        let websiteLinksContainer
        let paperTrailLinksContainer

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
                                authors.splice(authorIndex, 1)
                                authorRow.remove()
                            }
                        }
                    })
                ]
            })

            return authorRow
        }

        // Function to add a website link
        const addWebsiteLinkField = (url = '', label = '') => {
            const linkIndex = websiteLinks.length
            websiteLinks.push({ url, label })

            const linkRow = $({
                tag: 'div',
                att: { className: 'website-link-row', 'data-link-index': linkIndex },
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
                            placeholder: 'Link label (e.g., Journal page)',
                            value: label,
                            className: 'website-link-label-input'
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
                                if (websiteLinks[linkIndex]) {
                                    websiteLinks[linkIndex].label = e.target.value
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
                            className: 'website-link-url-input'
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
                                if (websiteLinks[linkIndex]) {
                                    websiteLinks[linkIndex].url = e.target.value
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
                                websiteLinks.splice(linkIndex, 1)
                                linkRow.remove()
                            }
                        }
                    })
                ]
            })

            return linkRow
        }

        // Function to add a paper trail link
        const addPaperTrailLinkField = (url = '', label = '') => {
            const linkIndex = paperTrailLinks.length
            paperTrailLinks.push({ url, label })

            const linkRow = $({
                tag: 'div',
                att: { className: 'paper-trail-link-row', 'data-link-index': linkIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center'
                },
                child: [
                    $({
                        tag: 'select',
                        att: { className: 'paper-trail-label-select' },
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
                            $({ tag: 'option', att: { value: 'Certificate of Completion', selected: label === 'Certificate of Completion' }, text: 'Certificate of Completion' }),
                            $({ tag: 'option', att: { value: 'Certificate of Presentation', selected: label === 'Certificate of Presentation' }, text: 'Certificate of Presentation' }),
                            $({ tag: 'option', att: { value: 'Symposium Program', selected: label === 'Symposium Program' }, text: 'Symposium Program' }),
                            $({ tag: 'option', att: { value: 'Published Paper', selected: label === 'Published Paper' }, text: 'Published Paper' }),
                            $({ tag: 'option', att: { value: 'Acceptance Letter', selected: label === 'Acceptance Letter' }, text: 'Acceptance Letter' }),
                            $({ tag: 'option', att: { value: 'Review Report', selected: label === 'Review Report' }, text: 'Review Report' }),
                            $({ tag: 'option', att: { value: 'Other Document', selected: label === 'Other Document' }, text: 'Other Document' })
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
                            className: 'paper-trail-url-input'
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
                        width: '950px',
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
                                    text: isEditing ? 'Edit Publication' : 'Add Publication',
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
                            att: { id: 'publication-form' },
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
                                                id: 'publication-type-select'
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

                                // Title of Article
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Title of Article *',
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
                                                name: 'title',
                                                placeholder: 'Enter title of article...',
                                                rows: '2',
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
                                            text: isEditing ? (item.title || '') : ''
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
                                                    text: 'Author(s) *',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Author',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#2196f3',
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
                                                            const newRow = addAuthorField()
                                                            authorsContainer.appendChild(newRow)
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
                                            att: { id: 'authors-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
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

                                // Name of Book/Journal and ISSN/ISBN row
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
                                                    text: 'Name of Book/Journal *',
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
                                                        name: 'journalName',
                                                        value: isEditing ? (item.journalName || '') : '',
                                                        placeholder: 'Enter book/journal name...',
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
                                                    text: 'ISSN/ISBN',
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
                                                        name: 'issn',
                                                        value: isEditing ? (item.issn || '') : '',
                                                        placeholder: 'e.g., 1234-5678'
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
                                                        fontFamily: 'monospace'
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Vol.No/Issue No., Number of Pages, Date of Publication row
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: '16px',
                                        marginBottom: '20px'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Vol.No/Issue No.',
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
                                                        name: 'volumeIssue',
                                                        value: isEditing ? (item.volumeIssue || '') : '',
                                                        placeholder: 'e.g., Vol.5 No.2'
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
                                                        fontFamily: 'monospace'
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Number of Pages',
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
                                                        name: 'pages',
                                                        value: isEditing ? (item.pages || '') : '',
                                                        placeholder: 'e.g., 1-15'
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
                                                    text: 'Date of Publication *',
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
                                                        name: 'publicationDate',
                                                        value: isEditing ? (item.publicationDate || '') : '',
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

                                // DOI
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'DOI (if any)',
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
                                                name: 'doi',
                                                value: isEditing ? (item.doi || '') : '',
                                                placeholder: 'e.g., 10.1234/example'
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
                                                fontFamily: 'monospace'
                                            }
                                        })
                                    ]
                                }),

                                // Publication Type and Referee Status row
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
                                                    text: 'Publication National or International *',
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
                                                        name: 'publicationType',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Type --' }),
                                                        $({ tag: 'option', att: { value: 'National', selected: isEditing && item.publicationType === 'National' }, text: 'National' }),
                                                        $({ tag: 'option', att: { value: 'International', selected: isEditing && item.publicationType === 'International' }, text: 'International' })
                                                    ]
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Refereed/Non-refereed *',
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
                                                        name: 'refereeStatus',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Status --' }),
                                                        $({ tag: 'option', att: { value: 'Refereed', selected: isEditing && item.refereeStatus === 'Refereed' }, text: 'Refereed' }),
                                                        $({ tag: 'option', att: { value: 'Non-refereed', selected: isEditing && item.refereeStatus === 'Non-refereed' }, text: 'Non-refereed' })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // Indexing Body
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Indexing Body (Scopus/WOS, etc.)',
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
                                            att: { name: 'indexingBody' },
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
                                            child: indexingBodies.map(ib =>
                                                $({
                                                    tag: 'option',
                                                    att: { value: ib, selected: isEditing && item.indexingBody === ib },
                                                    text: ib
                                                })
                                            )
                                        })
                                    ]
                                }),

                                // Website Links section
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
                                                    text: 'Link of Website/Article Published',
                                                    style: {
                                                        color: '#aaa',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Link',
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
                                                            const newRow = addWebsiteLinkField()
                                                            websiteLinksContainer.appendChild(newRow)
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
                                            att: { id: 'website-links-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #444',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                websiteLinksContainer = el
                                                if (isEditing && websiteLinks.length > 0) {
                                                    websiteLinks.forEach(link => {
                                                        websiteLinksContainer.appendChild(addWebsiteLinkField(link.url, link.label))
                                                    })
                                                }
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
                                                    text: 'IMPORTANT! Link of Paper Trail Folder (certificate of completion/presentation, program of symposium, & other related documents)',
                                                    style: {
                                                        color: '#ff9800',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        flex: '1'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Paper Trail',
                                                    style: {
                                                        padding: '6px 14px',
                                                        backgroundColor: '#ff9800',
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
                                                            const newRow = addPaperTrailLinkField()
                                                            paperTrailLinksContainer.appendChild(newRow)
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
                                            att: { id: 'paper-trail-links-container' },
                                            style: {
                                                backgroundColor: '#2a2a2a',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #ff980040',
                                                minHeight: '50px'
                                            },
                                            elementHandler: (el) => {
                                                paperTrailLinksContainer = el
                                                if (isEditing && paperTrailLinks.length > 0) {
                                                    paperTrailLinks.forEach(link => {
                                                        paperTrailLinksContainer.appendChild(addPaperTrailLinkField(link.url, link.label))
                                                    })
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Remarks
                                $({
                                    tag: 'div',
                                    style: { marginBottom: '20px' },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'Remarks',
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
                                                placeholder: 'Enter any remarks or notes...',
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
                                            text: isEditing ? (item.remarks || '') : ''
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
                                            text: isEditing ? 'Update Publication' : 'Add Publication',
                                            style: {
                                                padding: '10px 24px',
                                                backgroundColor: '#2196f3',
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
                                                    e.target.style.backgroundColor = '#1976d2'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.backgroundColor = '#2196f3'
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
                                    await savePublicationData(isEditing)
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
            const typeSelect = document.getElementById('publication-type-select')
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

    // Save publication data
    const savePublicationData = async (isEditing) => {
        const form = document.getElementById('publication-form')
        const formData = new FormData(form)
        formData.append('action', isEditing ? 'update_publication' : 'add_publication')

        // Add dynamic arrays as JSON
        formData.append('authors', JSON.stringify(authors))
        formData.append('websiteLinks', JSON.stringify(websiteLinks))
        formData.append('paperTrailLinks', JSON.stringify(paperTrailLinks))

        showLoading()
        try {
            const response = await fetch('/api/publication-research', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success) {
                closeModal()
                showNotification(
                    isEditing ? 'Publication updated successfully' : 'Publication added successfully',
                    'success'
                )
                await refreshData()
            } else {
                showNotification(result.message || 'Error saving publication data', 'error')
            }
        } catch (error) {
            console.error('Error saving publication:', error)
            showNotification('Error connecting to server', 'error')
        } finally {
            hideLoading()
        }
    }

    // Refresh data
    const refreshData = async () => {
        publicationData = []
        filteredData = []
        hasMore = true
        nextCursor = null
        await fetchPublicationData()
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
                                    att: { className: 'fa-solid fa-book-open' },
                                    style: { color: '#2196f3', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Research Articles Published',
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
                                // Publication type filter
                                $({
                                    tag: 'select',
                                    att: { className: 'pub-type-select' },
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
                                    child: publicationTypes.map(pt =>
                                        $({
                                            tag: 'option',
                                            att: { value: pt },
                                            text: pt,
                                            selected: pt === currentPublicationType
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentPublicationType = e.target.value
                                            applyLocalFilters()
                                            updateRecordCount()
                                        }
                                    }
                                }),
                                // Referee status filter
                                $({
                                    tag: 'select',
                                    att: { className: 'referee-select' },
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
                                    child: refereeStatuses.map(rs =>
                                        $({
                                            tag: 'option',
                                            att: { value: rs },
                                            text: rs,
                                            selected: rs === currentRefereeStatus
                                        })
                                    ),
                                    event: {
                                        type: 'change',
                                        method: (e) => {
                                            currentRefereeStatus = e.target.value
                                            applyLocalFilters()
                                            updateRecordCount()
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                // Add Publication button
                $({
                    tag: 'button',
                    text: '+ Add Publication',
                    style: {
                        padding: '10px 20px',
                        backgroundColor: '#2196f3',
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
                            e.target.style.backgroundColor = '#1976d2'
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.target.style.backgroundColor = '#2196f3'
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
                // Total Publications
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
                                    att: { className: 'fa-solid fa-book-open' },
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
                                    att: { className: 'stat-total-publications stat-value' },
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
                                    text: 'Total Publications',
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
                // Total Authors
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
                                    att: { className: 'fa-solid fa-users' },
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
                                    att: { className: 'stat-total-authors stat-value' },
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
                                    text: 'Total Authors',
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
                // Publication Type Breakdown
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
                            text: 'Publication Type Breakdown',
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
                                createTypeStat('National', '#2196f3', 'stat-national', 'fa-flag'),
                                createTypeStat('International', '#e91e63', 'stat-international', 'fa-globe'),
                                createTypeStat('Refereed', '#4caf50', 'stat-refereed', 'fa-check-circle'),
                                createTypeStat('Non-refereed', '#ff9800', 'stat-non-refereed', 'fa-circle')
                            ]
                        })
                    ]
                }),
                // Indexing Breakdown
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
                            text: 'Indexing Breakdown',
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
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createTypeStat('Scopus Indexed', '#ff9800', 'stat-scopus', 'fa-database'),
                                createTypeStat('WOS Indexed', '#2196f3', 'stat-wos', 'fa-globe')
                            ]
                        })
                    ]
                })
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
            'Title of\nArticle',
            'Author(s)',
            'Name of\nBook/Journal',
            'ISSN/\nISBN',
            'Vol.No/\nIssue No.',
            'Number\nof Pages',
            'Date of\nPublication',
            'DOI\n(if any)',
            'Publication\nNational or\nInternational',
            'Refereed/\nNon-refereed',
            'Indexing Body\n(Scopus/WOS,\netc.)',
            'Link of Website/\nArticle Published',
            'IMPORTANT!\nLink of Paper Trail\nFolder',
            'Remarks',
            'ACTIONS'
        ]

        const row = $({ tag: 'tr' })

        headers.forEach((header, index) => {
            const isCenter = ['NO.', 'ISSN/\nISBN', 'Vol.No/\nIssue No.', 'Number\nof Pages', 'Date of\nPublication', 'Publication\nNational or\nInternational', 'Refereed/\nNon-refereed', 'Indexing Body\n(Scopus/WOS,\netc.)', 'ACTIONS'].includes(header)

            const th = $({
                tag: 'th',
                text: header,
                style: {
                    padding: '14px 8px',
                    textAlign: isCenter ? 'center' : 'left',
                    fontSize: '13px',
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
                height: 'calc(100% - 380px)',
                overflow: 'auto',
                backgroundColor: '#2a2a2a',
                position: 'relative'
            },
            elementHandler: (el) => {
                scrollContainer = el
                scrollContainer.addEventListener('scroll', handleScroll)
                fetchPublicationData()
            },
            child: [
                $({
                    tag: 'table',
                    style: {
                        width: '100%',
                        minWidth: '2800px',
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
        att: { className: 'publication-research-container' },
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

export default publicationResearch
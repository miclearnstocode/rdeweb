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

    const publicationTypes = [
        'All Types',
        'National',
        'International'
    ]

    const refereeStatuses = [
        'All Status',
        'Refereed',
        'Non-refereed'
    ]

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

            const response = await fetch('/publication', {
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

    const handleScroll = () => {
        if (!scrollContainer || isLoading || !hasMore) return

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer

        if (scrollHeight - scrollTop - clientHeight < 300) {
            fetchPublicationData(nextCursor)
        }
    }

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
                        colSpan: 16 // Match the number of columns in your table
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
                                        color: '#1a1a1a'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Click "Add Publication" to add published research articles',
                                    style: {
                                        fontSize: '14px',
                                        opacity: 0.6,
                                        color: '#666'
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

    const renderPublicationTypeBadge = (type) => {
        if (!type || type === '—') return '—'

        const colors = type === 'International'
            ? { 
                bg: '#fce4ec', 
                color: '#c62828', 
                border: '#ef9a9a', 
                icon: 'fa-globe',
                shadow: 'rgba(198, 40, 40, 0.08)'
            }
            : { 
                bg: '#e3f2fd', 
                color: '#0d47a1', 
                border: '#90caf9', 
                icon: 'fa-flag',
                shadow: 'rgba(13, 71, 161, 0.08)'
            }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: `0 2px 4px ${colors.shadow}`,
                transition: 'all 0.2s ease',
                cursor: 'default',
                backdropFilter: 'blur(4px)'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${colors.icon}` },
                    style: { 
                        fontSize: '10px',
                        opacity: 0.7
                    }
                }),
                $({ tag: 'span', text: type })
            ]
        })
    }

    const renderRefereeBadge = (status) => {
        if (!status || status === '—') return '—'

        const colors = status === 'Refereed'
            ? { 
                bg: '#e8f5e9', 
                color: '#1b5e20', 
                border: '#a5d6a7',
                shadow: 'rgba(27, 94, 32, 0.08)',
                icon: 'fa-check-circle'
            }
            : { 
                bg: '#fff3e0', 
                color: '#bf360c', 
                border: '#ffcc80',
                shadow: 'rgba(191, 54, 12, 0.08)',
                icon: 'fa-clock'
            }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                boxShadow: `0 2px 4px ${colors.shadow}`,
                transition: 'all 0.2s ease',
                cursor: 'default'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${colors.icon}` },
                    style: { 
                        fontSize: '10px',
                        opacity: 0.7
                    }
                }),
                $({ tag: 'span', text: status })
            ]
        })
    }

    const renderIndexingBadge = (indexing) => {
        if (!indexing || indexing === '—' || indexing === 'None') return '—'

        const indexingColors = {
            'Scopus': { 
                bg: '#fff3e0', 
                color: '#e65100', 
                border: '#ffcc80',
                shadow: 'rgba(230, 81, 0, 0.08)',
                icon: 'fa-graduation-cap'
            },
            'Web of Science (WOS)': { 
                bg: '#e3f2fd', 
                color: '#0d47a1', 
                border: '#90caf9',
                shadow: 'rgba(13, 71, 161, 0.08)',
                icon: 'fa-globe-americas'
            },
            'Scopus & WOS': { 
                bg: '#f3e5f5', 
                color: '#4a148c', 
                border: '#ce93d8',
                shadow: 'rgba(74, 20, 140, 0.08)',
                icon: 'fa-star'
            }
        }

        const colors = indexingColors[indexing] || { 
            bg: '#f5f5f5', 
            color: '#424242', 
            border: '#bdbdbd',
            shadow: 'rgba(66, 66, 66, 0.06)',
            icon: 'fa-circle'
        }

        return $({
            tag: 'span',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '600',
                backgroundColor: colors.bg,
                color: colors.color,
                border: `1px solid ${colors.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                boxShadow: `0 2px 4px ${colors.shadow}`,
                transition: 'all 0.2s ease',
                cursor: 'default'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: `fa-solid ${colors.icon}` },
                    style: { 
                        fontSize: '10px',
                        opacity: 0.7
                    }
                }),
                $({ tag: 'span', text: indexing })
            ]
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
                gap: '3px',
                padding: '2px 0'
            },
            child: authorList.map((author, idx) => {
                const name = typeof author === 'string' ? author : author.name || 'Unknown'
                
                // Check if this is the first author (corresponding author indicator)
                const isCorresponding = idx === 0 && authorList.length > 1

                return $({
                    tag: 'div',
                    style: {
                        padding: '4px 10px',
                        backgroundColor: idx % 2 === 0 ? '#f8faff' : 'transparent',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#1a1a1a',
                        lineHeight: '1.5',
                        fontWeight: isCorresponding ? '600' : '400',
                        borderLeft: isCorresponding ? '3px solid #2196f3' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: name
                        }),
                        isCorresponding && $({
                            tag: 'span',
                            style: {
                                fontSize: '9px',
                                color: '#2196f3',
                                backgroundColor: '#e3f2fd',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            },
                            text: 'Corresponding'
                        })
                    ]
                })
            })
        })
    }

    const renderDOI = (doi) => {
        if (!doi || doi === '—') return '—'
        
        return $({
            tag: 'a',
            att: {
                href: `https://doi.org/${doi}`,
                target: '_blank',
                rel: 'noopener noreferrer'
            },
            style: {
                color: '#1a73e8',
                textDecoration: 'none',
                fontSize: '11px',
                wordBreak: 'break-all',
                padding: '4px 8px',
                backgroundColor: '#e8f0fe',
                borderRadius: '4px',
                display: 'inline-block',
                transition: 'all 0.2s ease'
            },
            text: doi,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.target.style.backgroundColor = '#d2e3fc'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.target.style.backgroundColor = '#e8f0fe'
                }
            }
        })
    }

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

    const renderPaperTrailLinks = (paperTrailData) => {
        if (!paperTrailData || paperTrailData === '—') return '—'

        let paperTrail = {}
        try {
            if (typeof paperTrailData === 'string') {
                paperTrail = JSON.parse(paperTrailData)
            } else if (typeof paperTrailData === 'object') {
                paperTrail = paperTrailData
            } else {
                return '—'
            }
        } catch (e) {
            return '—'
        }

        const hasCertificate = paperTrail.certificate && paperTrail.certificate.length > 0
        const hasProgram = paperTrail.program && paperTrail.program.length > 0
        const hasPhotos = paperTrail.photos && paperTrail.photos.length > 0

        if (!hasCertificate && !hasProgram && !hasPhotos) return '—'

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '4px 0'
            },
            child: [
                // Certificate Section - PDF files
                hasCertificate && $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f1f8fe',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        borderLeft: '3px solid #1a73e8'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-certificate' },
                                    style: { color: '#1a73e8', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Certificate/Completion',
                                    style: { 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#1a73e8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: `(${paperTrail.certificate.length})`,
                                    style: { 
                                        fontSize: '10px', 
                                        color: '#1a73e8',
                                        backgroundColor: '#e3f2fd',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            },
                            child: paperTrail.certificate.map((file, index) => {
                                // Check if it's a file object or string
                                const fileName = typeof file === 'object' ? file.name || `Certificate_${index + 1}.pdf` : `Certificate_${index + 1}.pdf`
                                const filePath = typeof file === 'object' ? file.path || file : file
                                
                                return $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '6px',
                                        border: '1px solid #e3f2fd',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-file-pdf' },
                                            style: { 
                                                color: '#d32f2f', 
                                                fontSize: '16px',
                                                flexShrink: 0
                                            }
                                        }),
                                        $({
                                            tag: 'a',
                                            att: {
                                                href: filePath,
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                                download: fileName
                                            },
                                            style: {
                                                color: '#1565c0',
                                                textDecoration: 'none',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                flex: 1,
                                                wordBreak: 'break-all',
                                                transition: 'color 0.2s ease'
                                            },
                                            text: fileName,
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.target.style.color = '#0d47a1'
                                                    e.target.style.textDecoration = 'underline'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.color = '#1565c0'
                                                    e.target.style.textDecoration = 'none'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-download' },
                                            style: {
                                                color: '#1a73e8',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                opacity: 0.6,
                                                transition: 'opacity 0.2s ease',
                                                padding: '4px'
                                            },
                                            title: 'Download file',
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation()
                                                    // Trigger download
                                                    const link = document.createElement('a')
                                                    link.href = filePath
                                                    link.download = fileName
                                                    document.body.appendChild(link)
                                                    link.click()
                                                    document.body.removeChild(link)
                                                },
                                                type2: 'mouseenter',
                                                method2: (e) => {
                                                    e.target.style.opacity = '1'
                                                },
                                                type3: 'mouseleave',
                                                method3: (e) => {
                                                    e.target.style.opacity = '0.6'
                                                }
                                            }
                                        })
                                    ]
                                })
                            })
                        })
                    ]
                }),

                // Program Section - PDF files
                hasProgram && $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#fef3e0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        borderLeft: '3px solid #f57c00'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-file-alt' },
                                    style: { color: '#f57c00', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Program Document',
                                    style: { 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#f57c00',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: `(${paperTrail.program.length})`,
                                    style: { 
                                        fontSize: '10px', 
                                        color: '#f57c00',
                                        backgroundColor: '#fff3e0',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            },
                            child: paperTrail.program.map((file, index) => {
                                const fileName = typeof file === 'object' ? file.name || `Program_${index + 1}.pdf` : `Program_${index + 1}.pdf`
                                const filePath = typeof file === 'object' ? file.path || file : file
                                
                                return $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '6px',
                                        border: '1px solid #fff3e0',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-file-pdf' },
                                            style: { 
                                                color: '#d32f2f', 
                                                fontSize: '16px',
                                                flexShrink: 0
                                            }
                                        }),
                                        $({
                                            tag: 'a',
                                            att: {
                                                href: filePath,
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                                download: fileName
                                            },
                                            style: {
                                                color: '#e65100',
                                                textDecoration: 'none',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                flex: 1,
                                                wordBreak: 'break-all',
                                                transition: 'color 0.2s ease'
                                            },
                                            text: fileName,
                                            event: {
                                                type: 'mouseenter',
                                                method: (e) => {
                                                    e.target.style.color = '#bf360c'
                                                    e.target.style.textDecoration = 'underline'
                                                },
                                                type2: 'mouseleave',
                                                method2: (e) => {
                                                    e.target.style.color = '#e65100'
                                                    e.target.style.textDecoration = 'none'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-download' },
                                            style: {
                                                color: '#f57c00',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                opacity: 0.6,
                                                transition: 'opacity 0.2s ease',
                                                padding: '4px'
                                            },
                                            title: 'Download file',
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation()
                                                    const link = document.createElement('a')
                                                    link.href = filePath
                                                    link.download = fileName
                                                    document.body.appendChild(link)
                                                    link.click()
                                                    document.body.removeChild(link)
                                                },
                                                type2: 'mouseenter',
                                                method2: (e) => {
                                                    e.target.style.opacity = '1'
                                                },
                                                type3: 'mouseleave',
                                                method3: (e) => {
                                                    e.target.style.opacity = '0.6'
                                                }
                                            }
                                        })
                                    ]
                                })
                            })
                        })
                    ]
                }),

                // Photos Section - Image files (JPEG, JPG, PNG)
                hasPhotos && $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        borderLeft: '3px solid #43a047'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '10px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-images' },
                                    style: { color: '#43a047', fontSize: '14px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Event Photos',
                                    style: { 
                                        fontSize: '12px', 
                                        fontWeight: '600', 
                                        color: '#43a047',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: `(${paperTrail.photos.length})`,
                                    style: { 
                                        fontSize: '10px', 
                                        color: '#43a047',
                                        backgroundColor: '#c8e6c9',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: '500'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: '8px',
                                maxHeight: '250px',
                                overflowY: 'auto',
                                padding: '2px'
                            },
                            child: paperTrail.photos.map((photo, index) => {
                                const photoName = typeof photo === 'object' ? photo.name || `Photo_${index + 1}` : `Photo_${index + 1}`
                                const photoPath = typeof photo === 'object' ? photo.path || photo : photo
                                
                                return $({
                                    tag: 'div',
                                    style: {
                                        position: 'relative',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        aspectRatio: '1/1',
                                        backgroundColor: '#f5f5f5',
                                        border: '2px solid #e0e0e0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    },
                                    child: [
                                        $({
                                            tag: 'img',
                                            att: {
                                                src: photoPath,
                                                alt: `Event photo ${index + 1}`,
                                                loading: 'lazy'
                                            },
                                            style: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease'
                                            },
                                            event: {
                                                type: 'error',
                                                method: (e) => {
                                                    // Fallback if image fails to load
                                                    e.target.style.display = 'none'
                                                    const parent = e.target.parentElement
                                                    const fallback = document.createElement('div')
                                                    fallback.style.cssText = `
                                                        display: flex;
                                                        align-items: center;
                                                        justify-content: center;
                                                        width: 100%;
                                                        height: 100%;
                                                        background: #f5f5f5;
                                                        color: #9e9e9e;
                                                        font-size: 24px;
                                                    `
                                                    fallback.innerHTML = '<i class="fa-solid fa-image"></i>'
                                                    parent.appendChild(fallback)
                                                }
                                            }
                                        }),
                                        // Overlay with photo info
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                bottom: '0',
                                                left: '0',
                                                right: '0',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                padding: '4px 6px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                opacity: '0',
                                                transition: 'opacity 0.2s ease'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    style: {
                                                        color: '#fff',
                                                        fontSize: '8px',
                                                        opacity: 0.8,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '60px'
                                                    },
                                                    text: photoName.length > 15 ? photoName.substring(0, 12) + '...' : photoName
                                                }),
                                                $({
                                                    tag: 'span',
                                                    att: { className: 'fa-solid fa-expand' },
                                                    style: { 
                                                        color: '#fff', 
                                                        fontSize: '10px',
                                                        cursor: 'pointer'
                                                    },
                                                    title: 'View full size'
                                                })
                                            ]
                                        }),
                                        // Download button overlay (top-right)
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-download' },
                                            style: {
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                color: '#fff',
                                                fontSize: '10px',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                padding: '4px',
                                                borderRadius: '4px',
                                                opacity: '0',
                                                transition: 'opacity 0.2s ease',
                                                cursor: 'pointer'
                                            },
                                            title: 'Download photo',
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    e.stopPropagation()
                                                    const link = document.createElement('a')
                                                    link.href = photoPath
                                                    link.download = photoName
                                                    document.body.appendChild(link)
                                                    link.click()
                                                    document.body.removeChild(link)
                                                }
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#43a047'
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.2)'
                                            e.currentTarget.style.transform = 'scale(1.02)'
                                            // Show overlays
                                            const overlays = e.currentTarget.querySelectorAll('div:last-child, span:last-child')
                                            overlays.forEach(el => el.style.opacity = '1')
                                        },
                                        type2: 'mouseleave',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e0e0e0'
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                                            e.currentTarget.style.transform = 'scale(1)'
                                            const overlays = e.currentTarget.querySelectorAll('div:last-child, span:last-child')
                                            overlays.forEach(el => el.style.opacity = '0')
                                        },
                                        type3: 'click',
                                        method3: (e) => {
                                            // Open photo in lightbox/modal
                                            openPhotoViewer(photoPath, photoName)
                                        }
                                    }
                                })
                            })
                        })
                    ]
                })
            ]
        })
    }

    // Photo Viewer Modal
    const openPhotoViewer = (photoPath, photoName) => {
        // Create modal overlay
        const modal = document.createElement('div')
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
            padding: 20px;
        `
        
        // Close button
        const closeBtn = document.createElement('button')
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 30px;
            background: none;
            border: none;
            cursor: pointer;
            transition: transform 0.2s ease;
            z-index: 10001;
        `
        closeBtn.innerHTML = '✕'
        closeBtn.onmouseenter = () => closeBtn.style.transform = 'scale(1.2)'
        closeBtn.onmouseleave = () => closeBtn.style.transform = 'scale(1)'
        closeBtn.onclick = () => document.body.removeChild(modal)
        
        // Image container
        const imgContainer = document.createElement('div')
        imgContainer.style.cssText = `
            max-width: 90vw;
            max-height: 85vh;
            position: relative;
        `
        
        const img = document.createElement('img')
        img.src = photoPath
        img.alt = photoName || 'Event photo'
        img.style.cssText = `
            max-width: 100%;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        `
        
        // Photo info
        const info = document.createElement('div')
        info.style.cssText = `
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 12px;
            font-family: 'Segoe UI', sans-serif;
        `
        info.textContent = photoName || 'Event Photo'
        
        imgContainer.appendChild(img)
        imgContainer.appendChild(info)
        modal.appendChild(closeBtn)
        modal.appendChild(imgContainer)
        
        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal)
            }
        }
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.contains(modal)) {
                document.body.removeChild(modal)
            }
        })
        
        document.body.appendChild(modal)
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

        // Title of Article
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
                    minWidth: '250px',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
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
                    color: '#1a1a1a',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    minWidth: '180px',
                    backgroundColor: '#ffffff'
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
                    color: '#5f6368',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    fontFamily: 'monospace',
                    backgroundColor: '#ffffff'
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
                    color: '#5f6368',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    fontFamily: 'monospace',
                    backgroundColor: '#ffffff'
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
                    color: '#1a1a1a',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
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
                    color: '#1a1a1a',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    maxWidth: '150px',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    backgroundColor: '#ffffff'
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
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    maxWidth: '200px',
                    backgroundColor: '#ffffff'
                },
                child: [renderLinks(item.websiteLinks, 'website')]
            })
        )

        // Link of Paper Trail Folder - Updated with categories
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    maxWidth: '250px',
                    backgroundColor: '#fafffe'
                },
                child: [renderPaperTrailLinks(item.paperTrailLinks)]
            })
        )

        // Remarks
        cells.push(
            $({
                tag: 'td',
                style: {
                    padding: '12px 8px',
                    fontSize: '12px',
                    color: '#5f6368',
                    border: '1px solid #e0e0e0',
                    verticalAlign: 'top',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    minWidth: '150px',
                    backgroundColor: '#ffffff'
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
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease'
            },
            child: cells,
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
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
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-pen' },
                    style: {
                        color: '#1a73e8',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#e8f0fe'
                    },
                    title: 'Edit',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            openEditModal(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#d2e3fc'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#e8f0fe'
                        }
                    }
                }),
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-trash' },
                    style: {
                        color: '#d93025',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#fce8e6'
                    },
                    title: 'Delete',
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            deletePublication(item)
                        },
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.backgroundColor = '#fad2cf'
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.backgroundColor = '#fce8e6'
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

        // Paper trail files state - Now storing actual File objects and existing file paths
        let paperTrailFiles = {
            certificates: [], // Will store { file: File, name: string, path: string (if existing) }
            programs: [],     // Will store { file: File, name: string, path: string (if existing) }
            photos: []        // Will store { file: File, name: string, path: string (if existing) }
        }
        
        if (isEditing && item.paperTrailLinks) {
            try {
                const parsed = typeof item.paperTrailLinks === 'string' ? JSON.parse(item.paperTrailLinks) : item.paperTrailLinks
                if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                    // Convert existing files to display objects
                    if (parsed.certificates && Array.isArray(parsed.certificates)) {
                        paperTrailFiles.certificates = parsed.certificates.map(path => ({
                            file: null,
                            name: path.split('/').pop() || 'Certificate.pdf',
                            path: path,
                            isExisting: true
                        }))
                    }
                    if (parsed.programs && Array.isArray(parsed.programs)) {
                        paperTrailFiles.programs = parsed.programs.map(path => ({
                            file: null,
                            name: path.split('/').pop() || 'Program.pdf',
                            path: path,
                            isExisting: true
                        }))
                    }
                    if (parsed.photos && Array.isArray(parsed.photos)) {
                        paperTrailFiles.photos = parsed.photos.map(path => ({
                            file: null,
                            name: path.split('/').pop() || 'Photo.jpg',
                            path: path,
                            isExisting: true
                        }))
                    }
                }
            } catch (e) {
                paperTrailFiles = { certificates: [], programs: [], photos: [] }
            }
        }

        // Containers for dynamic fields
        let authorsContainer
        let websiteLinksContainer
        let certificatesContainer
        let programsContainer
        let photosContainer

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
                            padding: '10px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
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
                            padding: '6px 12px',
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
                            padding: '10px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
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
                            padding: '10px 12px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
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
                            padding: '6px 12px',
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
                                websiteLinks.splice(linkIndex, 1)
                                linkRow.remove()
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

            return linkRow
        }

        const addCertificateFile = (fileData = null) => {
            const certIndex = paperTrailFiles.certificates.length
            const fileObj = fileData || { file: null, name: '', path: '', isExisting: false }
            paperTrailFiles.certificates.push(fileObj)

            const row = $({
                tag: 'div',
                att: { className: 'certificate-row', 'data-cert-index': certIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center',
                    backgroundColor: '#f8fff8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e8f5e9'
                },
                child: [
                    // File input for certificate
                    $({
                        tag: 'input',
                        att: {
                            type: 'file',
                            accept: '.pdf,.doc,.docx',
                            className: 'certificate-file-input'
                        },
                        style: {
                            flex: '2',
                            padding: '6px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        },
                        event: {
                            type: 'change',
                            method: (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    paperTrailFiles.certificates[certIndex].file = file
                                    paperTrailFiles.certificates[certIndex].name = file.name
                                    paperTrailFiles.certificates[certIndex].isExisting = false
                                    // Update label display
                                    const labelDisplay = row.querySelector('.cert-file-name')
                                    if (labelDisplay) {
                                        labelDisplay.textContent = file.name
                                        labelDisplay.style.color = '#1b5e20'
                                    }
                                }
                            }
                        }
                    }),
                    // Display file name
                    $({
                        tag: 'span',
                        att: { className: 'cert-file-name' },
                        text: fileObj.isExisting ? fileObj.name : (fileObj.name || 'No file selected'),
                        style: {
                            flex: '1',
                            fontSize: '12px',
                            color: fileObj.isExisting ? '#1b5e20' : '#5f6368',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }),
                    // Remove button
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '4px 10px',
                            backgroundColor: '#fce8e6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#d93025',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                paperTrailFiles.certificates.splice(certIndex, 1)
                                row.remove()
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

            return row
        }

        const addProgramFile = (fileData = null) => {
            const progIndex = paperTrailFiles.programs.length
            const fileObj = fileData || { file: null, name: '', path: '', isExisting: false }
            paperTrailFiles.programs.push(fileObj)

            const row = $({
                tag: 'div',
                att: { className: 'program-row', 'data-prog-index': progIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center',
                    backgroundColor: '#f8faff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e3f2fd'
                },
                child: [
                    // File input for program
                    $({
                        tag: 'input',
                        att: {
                            type: 'file',
                            accept: '.pdf,.doc,.docx',
                            className: 'program-file-input'
                        },
                        style: {
                            flex: '2',
                            padding: '6px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        },
                        event: {
                            type: 'change',
                            method: (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    paperTrailFiles.programs[progIndex].file = file
                                    paperTrailFiles.programs[progIndex].name = file.name
                                    paperTrailFiles.programs[progIndex].isExisting = false
                                    const labelDisplay = row.querySelector('.prog-file-name')
                                    if (labelDisplay) {
                                        labelDisplay.textContent = file.name
                                        labelDisplay.style.color = '#0d47a1'
                                    }
                                }
                            }
                        }
                    }),
                    // Display file name
                    $({
                        tag: 'span',
                        att: { className: 'prog-file-name' },
                        text: fileObj.isExisting ? fileObj.name : (fileObj.name || 'No file selected'),
                        style: {
                            flex: '1',
                            fontSize: '12px',
                            color: fileObj.isExisting ? '#0d47a1' : '#5f6368',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }),
                    // Remove button
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '4px 10px',
                            backgroundColor: '#fce8e6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#d93025',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                paperTrailFiles.programs.splice(progIndex, 1)
                                row.remove()
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

            return row
        }

        const addPhotoFile = (fileData = null) => {
            const photoIndex = paperTrailFiles.photos.length
            const fileObj = fileData || { file: null, name: '', path: '', isExisting: false }
            paperTrailFiles.photos.push(fileObj)

            const row = $({
                tag: 'div',
                att: { className: 'photo-row', 'data-photo-index': photoIndex },
                style: {
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    alignItems: 'center',
                    backgroundColor: '#fff8f0',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ffe0b2'
                },
                child: [
                    // File input for photo
                    $({
                        tag: 'input',
                        att: {
                            type: 'file',
                            accept: 'image/jpeg,image/png,image/jpg,image/gif,image/webp',
                            className: 'photo-file-input'
                        },
                        style: {
                            flex: '2',
                            padding: '6px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        },
                        event: {
                            type: 'change',
                            method: (e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    paperTrailFiles.photos[photoIndex].file = file
                                    paperTrailFiles.photos[photoIndex].name = file.name
                                    paperTrailFiles.photos[photoIndex].isExisting = false
                                    const labelDisplay = row.querySelector('.photo-file-name')
                                    if (labelDisplay) {
                                        labelDisplay.textContent = file.name
                                        labelDisplay.style.color = '#bf360c'
                                    }
                                    // Show preview if image
                                    if (file.type.startsWith('image/')) {
                                        const preview = row.querySelector('.photo-preview')
                                        if (preview) {
                                            const reader = new FileReader()
                                            reader.onload = (e) => {
                                                preview.src = e.target.result
                                                preview.style.display = 'block'
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }
                                }
                            }
                        }
                    }),
                    // Photo preview
                    $({
                        tag: 'img',
                        att: { className: 'photo-preview' },
                        style: {
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: fileObj.isExisting ? 'block' : 'none',
                            border: '1px solid #e0e0e0'
                        },
                        ...(fileObj.isExisting && fileObj.path ? { att: { src: fileObj.path } } : {})
                    }),
                    // Display file name
                    $({
                        tag: 'span',
                        att: { className: 'photo-file-name' },
                        text: fileObj.isExisting ? fileObj.name : (fileObj.name || 'No file selected'),
                        style: {
                            flex: '1',
                            fontSize: '12px',
                            color: fileObj.isExisting ? '#bf360c' : '#5f6368',
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }),
                    // Remove button
                    $({
                        tag: 'button',
                        att: { type: 'button' },
                        text: '×',
                        style: {
                            padding: '4px 10px',
                            backgroundColor: '#fce8e6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#d93025',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            lineHeight: '1'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                paperTrailFiles.photos.splice(photoIndex, 1)
                                row.remove()
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

            return row
        }

        const addPhotoPreview = (file, container, isExisting = false, existingUrl = null, index = 0, photoData = null) => {
            // If photoData is provided, use it; otherwise create from parameters
            const data = photoData || {
                file: file,
                name: isExisting ? `Photo ${index + 1}` : (file ? file.name : ''),
                path: isExisting ? existingUrl : '',
                isExisting: isExisting,
                index: index
            }

            const previewDiv = $({
                tag: 'div',
                style: {
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '1/1',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                },
                child: [
                    // Image
                    $({
                        tag: 'img',
                        att: {
                            src: isExisting ? existingUrl : (file ? URL.createObjectURL(file) : ''),
                            alt: isExisting ? `Photo ${index + 1}` : (file ? file.name : 'Photo'),
                            loading: 'lazy'
                        },
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        },
                        event: {
                            type: 'error',
                            method: (e) => {
                                e.target.style.display = 'none'
                                const parent = e.target.parentElement
                                const fallback = document.createElement('div')
                                fallback.style.cssText = `
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 100%;
                                    height: 100%;
                                    background: #f5f5f5;
                                    color: #9e9e9e;
                                    font-size: 24px;
                                `
                                fallback.innerHTML = '<i class="fa-solid fa-image"></i>'
                                parent.appendChild(fallback)
                            }
                        }
                    }),
                    // Overlay
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: '4px 6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: '0',
                            transition: 'opacity 0.2s ease'
                        },
                        child: [
                            $({
                                tag: 'span',
                                style: {
                                    color: '#fff',
                                    fontSize: '8px',
                                    opacity: 0.8,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '60px'
                                },
                                text: isExisting ? `Photo ${index + 1}` : (file ? file.name.substring(0, 15) + (file.name.length > 15 ? '...' : '') : 'Photo')
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-expand' },
                                style: {
                                    color: '#fff',
                                    fontSize: '10px',
                                    cursor: 'pointer'
                                },
                                title: 'View full size',
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.stopPropagation()
                                        const src = isExisting ? existingUrl : (file ? URL.createObjectURL(file) : '')
                                        if (src) {
                                            openPhotoViewer(src, isExisting ? `Photo ${index + 1}` : (file ? file.name : 'Photo'))
                                        }
                                    }
                                }
                            })
                        ]
                    }),
                    // Remove button
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-times' },
                        style: {
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: '3px 6px',
                            borderRadius: '50%',
                            opacity: '0',
                            transition: 'opacity 0.2s ease',
                            cursor: 'pointer'
                        },
                        title: 'Remove photo',
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                // Find and remove the photo from paperTrailFiles.photos
                                const photoIndex = paperTrailFiles.photos.findIndex(p => {
                                    if (isExisting && p.isExisting) {
                                        return p.path === existingUrl
                                    }
                                    if (file && !p.isExisting) {
                                        return p.name === file.name && p.file === file
                                    }
                                    return false
                                })
                                
                                if (photoIndex > -1) {
                                    paperTrailFiles.photos.splice(photoIndex, 1)
                                } else if (data && data.index !== undefined) {
                                    // Fallback: use stored index
                                    const idx = data.index
                                    if (idx < paperTrailFiles.photos.length) {
                                        paperTrailFiles.photos.splice(idx, 1)
                                    }
                                }
                                
                                // Remove the preview div
                                previewDiv.remove()
                                
                                // Update count
                                const photoCount = document.getElementById('photo-count')
                                if (photoCount) {
                                    photoCount.textContent = paperTrailFiles.photos.length
                                }
                                
                                // Check if no photos left and show empty message
                                const previewContainer = document.getElementById('photos-preview-container')
                                if (previewContainer && paperTrailFiles.photos.length === 0) {
                                    // Clear container and show empty message
                                    previewContainer.innerHTML = ''
                                    const emptyMessage = $({
                                        tag: 'div',
                                        text: 'No photos uploaded yet',
                                        style: {
                                            gridColumn: '1 / -1',
                                            textAlign: 'center',
                                            padding: '30px',
                                            color: '#9aa0a6',
                                            fontSize: '13px'
                                        }
                                    })
                                    previewContainer.appendChild(emptyMessage)
                                }
                                
                                showNotification('Photo removed', 'info')
                            },
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.target.style.backgroundColor = 'rgba(211, 47, 47, 0.8)'
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.target.style.backgroundColor = 'rgba(0,0,0,0.6)'
                            }
                        }
                    })
                ],
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#f57c00'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 124, 0, 0.2)'
                        e.currentTarget.style.transform = 'scale(1.02)'
                        const overlays = e.currentTarget.querySelectorAll('div:last-child, span:last-child')
                        overlays.forEach(el => el.style.opacity = '1')
                    },
                    type2: 'mouseleave',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                        e.currentTarget.style.transform = 'scale(1)'
                        const overlays = e.currentTarget.querySelectorAll('div:last-child, span:last-child')
                        overlays.forEach(el => el.style.opacity = '0')
                    }
                }
            })

            container.appendChild(previewDiv)
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
                        width: '1000px',
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
                                    text: isEditing ? 'Edit Publication' : 'Add Publication',
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
                            att: { id: 'publication-form' },
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
                                                id: 'publication-type-select'
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
                                                placeholder: 'Enter title of article...',
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
                                                    text: 'Author(s) *',
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
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                    text: 'ISSN/ISBN',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                        padding: '10px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '1px solid #dadce0',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        fontFamily: 'monospace',
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
                                                        }
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
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                        padding: '10px 14px',
                                                        backgroundColor: '#f8f9fa',
                                                        border: '1px solid #dadce0',
                                                        borderRadius: '8px',
                                                        color: '#1a1a1a',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        fontFamily: 'monospace',
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
                                                    text: 'Number of Pages',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                    text: 'Date of Publication *',
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                        }
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
                                                marginBottom: '6px',
                                                color: '#5f6368',
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
                                                padding: '10px 14px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dadce0',
                                                borderRadius: '8px',
                                                color: '#1a1a1a',
                                                fontSize: '14px',
                                                outline: 'none',
                                                fontFamily: 'monospace',
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
                                                }
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
                                                        marginBottom: '6px',
                                                        color: '#5f6368',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Type --' }),
                                                        $({ tag: 'option', att: { value: 'National', selected: isEditing && item.publicationType === 'National' }, text: 'National' }),
                                                        $({ tag: 'option', att: { value: 'International', selected: isEditing && item.publicationType === 'International' }, text: 'International' })
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
                                        $({
                                            tag: 'div',
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Refereed/Non-refereed *',
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
                                                        name: 'refereeStatus',
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
                                                        $({ tag: 'option', att: { value: '' }, text: '-- Select Status --' }),
                                                        $({ tag: 'option', att: { value: 'Refereed', selected: isEditing && item.refereeStatus === 'Refereed' }, text: 'Refereed' }),
                                                        $({ tag: 'option', att: { value: 'Non-refereed', selected: isEditing && item.refereeStatus === 'Non-refereed' }, text: 'Non-refereed' })
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
                                                marginBottom: '6px',
                                                color: '#5f6368',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            att: { name: 'indexingBody' },
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
                                            child: indexingBodies.map(ib =>
                                                $({
                                                    tag: 'option',
                                                    att: { value: ib, selected: isEditing && item.indexingBody === ib },
                                                    text: ib
                                                })
                                            ),
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

                                // Website Links section
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
                                                marginBottom: '8px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: 'Link of Website/Article Published',
                                                    style: {
                                                        color: '#5f6368',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'button',
                                                    att: { type: 'button' },
                                                    text: '+ Add Link',
                                                    style: {
                                                        padding: '6px 16px',
                                                        backgroundColor: '#00bcd4',
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
                                                backgroundColor: '#fafafa',
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: '1px solid #e8eaed',
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

                                // Paper trail
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px',
                                        backgroundColor: '#fafffe',
                                        border: '2px solid #ff980040',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '16px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'label',
                                                    text: '📁 Paper Trail Files (Certificate, Program & Photos)',
                                                    style: {
                                                        color: '#e65100',
                                                        fontSize: '14px',
                                                        fontWeight: '600'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: 'Upload PDFs and Images',
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#5f6368',
                                                        fontStyle: 'italic'
                                                    }
                                                })
                                            ]
                                        }),

                                        // Two column grid for Certificates and Programs
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '16px'
                                            },
                                            child: [
                                                // LEFT COLUMN - Certificates
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#f8fff8',
                                                        border: '1px solid #c8e6c9',
                                                        borderRadius: '10px',
                                                        padding: '14px'
                                                    },
                                                    child: [
                                                        // Certificate header with icon
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
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '10px',
                                                                        backgroundColor: '#e6f4ea',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-certificate' },
                                                                            style: { color: '#34a853', fontSize: '18px' }
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
                                                                            text: 'Certificates',
                                                                            style: {
                                                                                color: '#202124',
                                                                                fontSize: '14px',
                                                                                fontWeight: '600',
                                                                                margin: 0,
                                                                                display: 'block'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Upload certificate/completion documents (PDF)',
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

                                                        // Certificate upload area
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                marginBottom: '12px'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'input',
                                                                    att: {
                                                                        type: 'file',
                                                                        accept: '.pdf,.doc,.docx',
                                                                        id: 'certificates-input' 
                                                                    },
                                                                    style: {
                                                                        display: 'none'
                                                                    },
                                                                    event: {
                                                                        type: 'change',
                                                                        method: (e) => {
                                                                            const file = e.target.files[0]
                                                                            if (file) {
                                                                                if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                                                                    const fileData = {
                                                                                        file: file,
                                                                                        name: file.name,
                                                                                        path: '',
                                                                                        isExisting: false
                                                                                    }
                                                                                    paperTrailFiles.certificates.push(fileData)
                                                                                    const newRow = addCertificateFile(fileData)
                                                                                    certificatesContainer.appendChild(newRow)
                                                                                    const certCount = document.getElementById('cert-count')
                                                                                    if (certCount) {
                                                                                        certCount.textContent = paperTrailFiles.certificates.length
                                                                                    }
                                                                                    showNotification(`Certificate "${file.name}" selected.`, 'info')
                                                                                }
                                                                            }
                                                                            e.target.value = ''
                                                                        }
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '2px dashed #dadce0',
                                                                        borderRadius: '12px',
                                                                        padding: '20px',
                                                                        textAlign: 'center',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        marginBottom: '12px'
                                                                    },
                                                                    event: {
                                                                        type: 'click',
                                                                        method: (e) => {
                                                                            const fileInput = document.getElementById('certificates-input')
                                                                            if (fileInput) fileInput.click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.borderColor = '#34a853'
                                                                            e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.borderColor = '#dadce0'
                                                                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                                        }
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { fontSize: '28px', color: '#34a853', display: 'block', marginBottom: '8px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'Click or drag to upload certificate',
                                                                            style: { fontSize: '13px', color: '#202124', marginBottom: '2px', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'PDF, DOC, DOCX supported',
                                                                            style: { fontSize: '11px', color: '#5f6368' }
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),

                                                        // Certificate files container
                                                        $({
                                                            tag: 'div',
                                                            att: { id: 'certificates-container' },
                                                            style: {
                                                                minHeight: '30px',
                                                                maxHeight: '100px',
                                                                overflowY: 'auto'
                                                            },
                                                            elementHandler: (el) => {
                                                                certificatesContainer = el
                                                                if (isEditing && paperTrailFiles.certificates.length > 0) {
                                                                    paperTrailFiles.certificates.forEach(cert => {
                                                                        certificatesContainer.appendChild(addCertificateFile(cert))
                                                                    })
                                                                }
                                                                // Update count
                                                                const certCount = document.getElementById('cert-count')
                                                                if (certCount) {
                                                                    certCount.textContent = paperTrailFiles.certificates.length
                                                                }
                                                            }
                                                        })
                                                    ]
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        backgroundColor: '#f8faff',
                                                        border: '1px solid #bbdefb',
                                                        borderRadius: '10px',
                                                        padding: '14px'
                                                    },
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
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '10px',
                                                                        backgroundColor: '#e3f2fd',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-file-alt' },
                                                                            style: { color: '#1a73e8', fontSize: '18px' }
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
                                                                            text: 'Programs',
                                                                            style: {
                                                                                color: '#202124',
                                                                                fontSize: '14px',
                                                                                fontWeight: '600',
                                                                                margin: 0,
                                                                                display: 'block'
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'span',
                                                                            text: 'Upload program/activity documents (PDF)',
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

                                                        // Program upload area
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                marginBottom: '12px'
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'input',
                                                                    att: {
                                                                        type: 'file',
                                                                        accept: '.pdf,.doc,.docx',
                                                                        id: 'programs-input'
                                                                    },
                                                                    style: {
                                                                        display: 'none'
                                                                    },
                                                                    event: {
                                                                        type: 'change',
                                                                        method: (e) => {
                                                                            const file = e.target.files[0]
                                                                            if (file) {
                                                                                if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                                                                    const fileData = {
                                                                                        file: file,
                                                                                        name: file.name,
                                                                                        path: '',
                                                                                        isExisting: false
                                                                                    }
                                                                                    paperTrailFiles.programs.push(fileData)
                                                                                    const newRow = addProgramFile(fileData)
                                                                                    programsContainer.appendChild(newRow)
                                                                                    const progCount = document.getElementById('prog-count')
                                                                                    if (progCount) {
                                                                                        progCount.textContent = paperTrailFiles.programs.length
                                                                                    }
                                                                                    showNotification(`Program "${file.name}" selected.`, 'info')
                                                                                }
                                                                            }
                                                                            e.target.value = ''
                                                                        }
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    style: {
                                                                        backgroundColor: '#f8f9fa',
                                                                        border: '2px dashed #dadce0',
                                                                        borderRadius: '12px',
                                                                        padding: '20px',
                                                                        textAlign: 'center',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.2s ease',
                                                                        marginBottom: '12px'
                                                                    },
                                                                    event: {
                                                                        type: 'click',
                                                                        method: (e) => {
                                                                            const fileInput = document.getElementById('programs-input')
                                                                            if (fileInput) fileInput.click()
                                                                        },
                                                                        type2: 'mouseenter',
                                                                        method2: (e) => {
                                                                            e.currentTarget.style.borderColor = '#1a73e8'
                                                                            e.currentTarget.style.backgroundColor = '#f1f8fe'
                                                                        },
                                                                        type3: 'mouseleave',
                                                                        method3: (e) => {
                                                                            e.currentTarget.style.borderColor = '#dadce0'
                                                                            e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                                        }
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'span',
                                                                            att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                            style: { fontSize: '28px', color: '#1a73e8', display: 'block', marginBottom: '8px' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'Click or drag to upload program',
                                                                            style: { fontSize: '13px', color: '#202124', marginBottom: '2px', fontWeight: '500' }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            text: 'PDF, DOC, DOCX supported',
                                                                            style: { fontSize: '11px', color: '#5f6368' }
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        }),

                                                        // Program files container
                                                        $({
                                                            tag: 'div',
                                                            att: { id: 'programs-container' },
                                                            style: {
                                                                minHeight: '30px',
                                                                maxHeight: '100px',
                                                                overflowY: 'auto'
                                                            },
                                                            elementHandler: (el) => {
                                                                programsContainer = el
                                                                if (isEditing && paperTrailFiles.programs.length > 0) {
                                                                    paperTrailFiles.programs.forEach(prog => {
                                                                        programsContainer.appendChild(addProgramFile(prog))
                                                                    })
                                                                }
                                                                // Update count
                                                                const progCount = document.getElementById('prog-count')
                                                                if (progCount) {
                                                                    progCount.textContent = paperTrailFiles.programs.length
                                                                }
                                                            }
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
          
                                        $({
                                            tag: 'div',
                                            style: {
                                                marginTop: '16px',
                                                backgroundColor: '#fff8f0',
                                                border: '1px solid #ffe0b2',
                                                borderRadius: '10px',
                                                padding: '14px'
                                            },
                                            child: [
                                                // Photo header with icon
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
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                backgroundColor: '#fff3e0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-images' },
                                                                    style: { color: '#f57c00', fontSize: '18px' }
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
                                                                        fontSize: '14px',
                                                                        fontWeight: '600',
                                                                        margin: 0,
                                                                        display: 'block'
                                                                    }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    text: 'Upload event documentation photos',
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
                                                            text: 'Multiple',
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#5f6368',
                                                                backgroundColor: '#f1f3f4',
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                fontWeight: '500'
                                                            }
                                                        })
                                                    ]
                                                }),

                                                // Photo upload area
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        marginBottom: '12px'
                                                    },
                                                    child: [
                                                        $({
                                                            tag: 'input',
                                                            att: {
                                                                type: 'file',
                                                                accept: 'image/jpeg,image/png,image/jpg,image/gif,image/webp',
                                                                multiple: true,
                                                                id: 'photos-input'
                                                            },
                                                            style: {
                                                                display: 'none'
                                                            },
                                                            event: {
                                                                type: 'change',
                                                                method: (e) => {
                                                                    const files = Array.from(e.target.files)
                                                                    const previewContainer = document.getElementById('photos-preview-container')
                                                                    files.forEach(file => {
                                                                        if (file.type.startsWith('image/')) {
                                                                            // Store file data
                                                                            const fileData = {
                                                                                file: file,
                                                                                name: file.name,
                                                                                path: '',
                                                                                isExisting: false
                                                                            }
                                                                            paperTrailFiles.photos.push(fileData)
                                                                            // Add preview
                                                                            if (previewContainer) {
                                                                                addPhotoPreview(file, previewContainer, false, null)
                                                                            }
                                                                        }
                                                                    })
                                                                    const photoCount = document.getElementById('photo-count')
                                                                    if (photoCount) {
                                                                        photoCount.textContent = paperTrailFiles.photos.length
                                                                    }
                                                                    showNotification(`${files.length} photo(s) selected.`, 'info')
                                                                    e.target.value = ''
                                                                }
                                                            }
                                                        }),
                                                        $({
                                                            tag: 'div',
                                                            style: {
                                                                backgroundColor: '#f8f9fa',
                                                                border: '2px dashed #dadce0',
                                                                borderRadius: '12px',
                                                                padding: '20px',
                                                                textAlign: 'center',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                marginBottom: '12px'
                                                            },
                                                            event: {
                                                                type: 'click',
                                                                method: (e) => {
                                                                    const fileInput = document.getElementById('photos-input')
                                                                    if (fileInput) fileInput.click()
                                                                },
                                                                type2: 'mouseenter',
                                                                method2: (e) => {
                                                                    e.currentTarget.style.borderColor = '#f57c00'
                                                                    e.currentTarget.style.backgroundColor = '#fff3e0'
                                                                },
                                                                type3: 'mouseleave',
                                                                method3: (e) => {
                                                                    e.currentTarget.style.borderColor = '#dadce0'
                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                                                                }
                                                            },
                                                            child: [
                                                                $({
                                                                    tag: 'span',
                                                                    att: { className: 'fa-solid fa-cloud-upload-alt' },
                                                                    style: { fontSize: '28px', color: '#f57c00', display: 'block', marginBottom: '8px' }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    text: 'Click or drag to upload photos',
                                                                    style: { fontSize: '13px', color: '#202124', marginBottom: '2px', fontWeight: '500' }
                                                                }),
                                                                $({
                                                                    tag: 'div',
                                                                    text: 'JPG, PNG, GIF, WEBP supported',
                                                                    style: { fontSize: '11px', color: '#5f6368' }
                                                                })
                                                            ]
                                                        }),
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
                                                                    tag: 'span',
                                                                    text: 'Uploaded Photos:',
                                                                    style: { fontSize: '12px', color: '#5f6368', fontWeight: '500' }
                                                                }),
                                                                $({
                                                                    tag: 'span',
                                                                    att: { id: 'photo-count' },
                                                                    text: isEditing ? paperTrailFiles.photos.length : '0',
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        color: '#f57c00',
                                                                        fontWeight: '600',
                                                                        backgroundColor: '#fff3e0',
                                                                        padding: '2px 12px',
                                                                        borderRadius: '12px'
                                                                    }
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),

                                                // Photos preview grid
                                                $({
                                                    tag: 'div',
                                                    att: { id: 'photos-preview-container' },
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                                        gap: '10px',
                                                        maxHeight: '250px',
                                                        overflowY: 'auto',
                                                        padding: '4px'
                                                    },
                                                    elementHandler: (el) => {
                                                        // Clear container
                                                        el.innerHTML = ''
                                                        
                                                        // Add existing photos if editing
                                                        if (isEditing && paperTrailFiles.photos.length > 0) {
                                                            paperTrailFiles.photos.forEach((photo, index) => {
                                                                if (photo.isExisting && photo.path) {
                                                                    addPhotoPreview(null, el, true, photo.path, index)
                                                                } else if (photo.file) {
                                                                    addPhotoPreview(photo.file, el, false, null, index)
                                                                }
                                                            })
                                                        }
                                                        
                                                        // Show empty message if no photos
                                                        if (paperTrailFiles.photos.length === 0) {
                                                            const emptyMessage = $({
                                                                tag: 'div',
                                                                text: 'No photos uploaded yet',
                                                                style: {
                                                                    gridColumn: '1 / -1',
                                                                    textAlign: 'center',
                                                                    padding: '30px',
                                                                    color: '#9aa0a6',
                                                                    fontSize: '13px'
                                                                }
                                                            })
                                                            el.appendChild(emptyMessage)
                                                        }
                                                    }
                                                })
                                            ]
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
                                                marginBottom: '6px',
                                                color: '#5f6368',
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
                                            text: isEditing ? (item.remarks || '') : '',
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
                                            text: isEditing ? 'Update Publication' : 'Add Publication',
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
                            marginBottom: '8px',
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
                            WebkitAppearance: 'none'
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
                            },
                            type2: 'blur',
                            method2: (e) => {
                                e.target.style.borderColor = '#dadce0'
                                e.target.style.boxShadow = 'none'
                            }
                        }
                    })
                ]
            })
        )
    }

    const savePublicationData = async (isEditing) => {
        const form = document.getElementById('publication-form')
        const formData = new FormData(form)

        const authorNames = authors.map(a => a.name).filter(name => name.trim() !== '')
        formData.set('authors', JSON.stringify(authorNames))
        const validLinks = websiteLinks.filter(link => link.url && link.url.trim() !== '')
        formData.set('websiteLinks', JSON.stringify(validLinks))

        const certificateFiles = paperTrailFiles.certificates
            .filter(cert => cert.file || cert.path)
            .map(cert => ({
                file: cert.file || null,
                path: cert.path || null,
                name: cert.name,
                isExisting: cert.isExisting || false
            }))
        
        // Programs
        const programFiles = paperTrailFiles.programs
            .filter(prog => prog.file || prog.path)
            .map(prog => ({
                file: prog.file || null,
                path: prog.path || null,
                name: prog.name,
                isExisting: prog.isExisting || false
            }))
        
        // Photos
        const photoFiles = paperTrailFiles.photos
            .filter(photo => photo.file || photo.path)
            .map(photo => ({
                file: photo.file || null,
                path: photo.path || null,
                name: photo.name,
                isExisting: photo.isExisting || false
            }))

        // Create paper trail data object
        const paperTrailData = {
            certificates: certificateFiles.map(c => c.path || c.file?.name || ''),
            programs: programFiles.map(p => p.path || p.file?.name || ''),
            photos: photoFiles.map(p => p.path || p.file?.name || '')
        }
        formData.set('paperTrailLinks', JSON.stringify(paperTrailData))

        // Append actual files to FormData for upload
        // Certificates
        certificateFiles.forEach(cert => {
            if (cert.file) {
                formData.append('certificates[]', cert.file)
            }
        })
        
        // Programs
        programFiles.forEach(prog => {
            if (prog.file) {
                formData.append('programs[]', prog.file)
            }
        })
        
        // Photos
        photoFiles.forEach(photo => {
            if (photo.file) {
                formData.append('photos[]', photo.file)
            }
        })

        try {
            const endpoint = isEditing ? `/api/publications/${formData.get('id')}` : '/api/publications'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(endpoint, {
                method: method,
                body: formData
            })

            if (!response.ok) {
                throw new Error('Failed to save publication')
            }

            const result = await response.json()
            showNotification(isEditing ? 'Publication updated successfully!' : 'Publication added successfully!', 'success')
            closeModal()
            loadPublications()
        } catch (error) {
            console.error('Error saving publication:', error)
            showNotification('Failed to save publication. Please try again.', 'error')
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
                                    att: { className: 'fa-solid fa-book-open' },
                                    style: { color: '#1a73e8', fontSize: '22px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Summary List of Research Articles Published',
                                    style: {
                                        color: '#1a1a1a',
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
                                        fontSize: '20px',
                                        lineHeight: '2',
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
                                }),
                                // Divider
                                $({
                                    tag: 'span',
                                    text: '|',
                                    style: {
                                        color: '#dadce0',
                                        fontSize: '20px',
                                        lineHeight: '2',
                                        padding: '0 2px'
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
                                        color: '#1a1a1a',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        maxWidth: '150px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        appearance: 'none',         
                                        WebkitAppearance: 'none',   
                                        MozAppearance: 'none'  
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
                                        fontSize: '20px',
                                        lineHeight: '2',
                                        padding: '0 2px'
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
                // Add Publication button
                $({
                    tag: 'button',
                    text: '+ Add Publication',
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
                // Total Publications
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
                                backgroundColor: '#e3f2fd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-book-open' },
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
                                    att: { className: 'stat-total-publications stat-value' },
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
                                    text: 'Total Publications',
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
                // Total Authors
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
                                backgroundColor: '#f3e5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-users' },
                                    style: { color: '#7b1fa2', fontSize: '26px' }
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
                                        color: '#1a1a1a',
                                        lineHeight: '1.2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Total Authors',
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
                // Publication Type Breakdown
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
                            text: 'Publication Type Breakdown',
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
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '12px'
                            },
                            child: [
                                createTypeStat('National', '#1a73e8', 'stat-national', 'fa-flag'),
                                createTypeStat('International', '#d32f2f', 'stat-international', 'fa-globe'),
                                createTypeStat('Refereed', '#2e7d32', 'stat-refereed', 'fa-check-circle'),
                                createTypeStat('Non-refereed', '#e65100', 'stat-non-refereed', 'fa-circle')
                            ]
                        })
                    ]
                }),
                // Indexing Breakdown
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
                            text: 'Indexing Breakdown',
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
                                createTypeStat('Scopus Indexed', '#e65100', 'stat-scopus', 'fa-database'),
                                createTypeStat('WOS Indexed', '#0d47a1', 'stat-wos', 'fa-globe')
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
            { label: 'Title of\nArticle', align: 'left', width: '250px' },
            { label: 'Author(s)', align: 'left', width: '180px' },
            { label: 'Name of\nBook/Journal', align: 'left', width: '180px' },
            { label: 'ISSN/\nISBN', align: 'center', width: '100px' },
            { label: 'Vol.No/\nIssue No.', align: 'center', width: '100px' },
            { label: 'Number\nof Pages', align: 'center', width: '80px' },
            { label: 'Date of\nPublication', align: 'center', width: '120px' },
            { label: 'DOI\n(if any)', align: 'left', width: '150px' },
            { label: 'Publication\nNational or\nInternational', align: 'center', width: '140px' },
            { label: 'Refereed/\nNon-refereed', align: 'center', width: '140px' },
            { label: 'Indexing Body\n(Scopus/WOS,\netc.)', align: 'center', width: '140px' },
            { label: 'Link of Website/\nArticle Published', align: 'left', width: '200px' },
            { label: 'IMPORTANT!\nLink of Paper Trail\nFolder', align: 'left', width: '300px' },
            { label: 'Remarks', align: 'left', width: '150px' },
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
                    fontSize: '12px',
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
                    textTransform: 'uppercase',
                    fontSize: '11px'
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
                height: 'calc(100% - 380px)',
                overflow: 'auto',
                backgroundColor: '#ffffff',
                position: 'relative',
                borderTop: '1px solid #e8eaed'
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

    return $({
        tag: 'div',
        att: { className: 'publication-research-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif'
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
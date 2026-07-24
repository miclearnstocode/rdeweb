import { $, Waiting, ConfirmationAlert, FileViewerModal, CustomModal } from '../../../../lib/lib.js'

export const PosterForwarded = (mainFrame, leftPDiv = null) => {
    let posterBody, serch, currentPage = 1, totalPages = 1, totalItems = 0
    const itemsPerPage = 10

    const searchInput = (value) => {
        currentPage = 1
        loadPosters(value.target.value.trim(), currentPage)
    }

    const search = ({ tools, searchEvent }) => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: 'fit-content',
                display: 'flex',
                position: 'relative',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                padding: '0 20px',
                marginBottom: '20px'
            },
            elementHandler: (el) => {
                const searchContainer = $({
                    tag: 'div',
                    style: {
                        height: '46px',
                        width: '100%',
                        maxWidth: '400px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        cursor: 'text'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-magnifying-glass',
                                        title: 'Search Posters'
                                    },
                                    style: {
                                        color: '#adb5bd',
                                        fontSize: '16px',
                                        flexShrink: '0',
                                        transition: 'color 0.2s ease'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'text',
                                        className: 'searchInput',
                                        placeholder: 'Search by title, author, or paper trail...'
                                    },
                                    event: {
                                        type: 'input',
                                        method: searchEvent
                                    },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        padding: '0',
                                        color: '#2c3e50',
                                        height: '100%',
                                        width: '100%',
                                        fontSize: '14px',
                                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontWeight: '400'
                                    },
                                    elementHandler: (el) => {
                                        serch = el
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-circle-xmark',
                                        title: 'Clear search'
                                    },
                                    style: {
                                        color: '#adb5bd',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'none',
                                        transition: 'color 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            if (serch) {
                                                serch.value = ''
                                                const inputEvent = new Event('input', { bubbles: true })
                                                serch.dispatchEvent(inputEvent)
                                            }
                                            e.target.style.display = 'none'
                                        }
                                    }
                                })
                            ]
                        })
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            if (serch) serch.focus()
                        }
                    }
                })

                const searchInputField = searchContainer.querySelector('.searchInput')
                if (searchInputField) {
                    searchInputField.addEventListener('focus', () => {
                        searchContainer.style.borderColor = '#0d6efd'
                        searchContainer.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.1)'
                        const searchIcon = searchContainer.querySelector('.fa-magnifying-glass')
                        if (searchIcon) searchIcon.style.color = '#0d6efd'
                    })

                    searchInputField.addEventListener('blur', () => {
                        searchContainer.style.borderColor = '#e9ecef'
                        searchContainer.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'
                        const searchIcon = searchContainer.querySelector('.fa-magnifying-glass')
                        if (searchIcon) searchIcon.style.color = '#adb5bd'
                    })
                }

                el.appendChild(searchContainer)

                if (tools) {
                    el.appendChild(tools)
                }
            }
        })
    }

    const PosterCard = ({ poster }) => {
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A'
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        }

        const formatCoauthors = (coauthorStr) => {
            if (!coauthorStr) return null
            
            try {
                const parsed = JSON.parse(coauthorStr)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.join(', ')
                }
                return coauthorStr
            } catch (e) {
                if (coauthorStr.includes(',')) {
                    return coauthorStr.split(',').map(name => name.trim()).join(', ')
                }
                return coauthorStr
            }
        }

        const openPosterViewer = () => {
            if (poster.poster_drive_view_url) {
                FileViewerModal(
                    poster.poster_drive_view_url,
                    poster.poster_file_name || 'Poster',
                    '#E91E63',
                    { showOpenDrive: true }
                )
            } else {
                ConfirmationAlert('No poster file available', null, {
                    title: 'Not Available',
                    icon: 'fa-circle-xmark',
                    iconColor: '#ef4444',
                    type: 'error',
                    duration: 3000
                })
            }
        }

        const formattedCoauthors = formatCoauthors(poster.coauthor)

        return $({
            tag: 'div',
            style: {
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                marginBottom: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            },
            elementHandler: (card) => {
                card.addEventListener('mouseenter', () => {
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                    card.style.transform = 'translateY(-2px)'
                })
                card.addEventListener('mouseleave', () => {
                    card.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'
                    card.style.transform = 'translateY(0)'
                })
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        padding: '16px',
                        display: 'flex',
                        gap: '16px'
                    },
                    child: [
                        // Left side - Poster Icon
                        $({
                            tag: 'div',
                            style: {
                                flexShrink: '0'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '56px',
                                        height: '56px',
                                        background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    },
                                    event: {
                                        type: 'click',
                                        method: openPosterViewer
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-image' },
                                            style: {
                                                fontSize: '28px',
                                                color: '#E91E63'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Right side - Content
                        $({
                            tag: 'div',
                            style: {
                                flex: '1',
                                minWidth: '0'
                            },
                            child: [
                                // Title
                                $({
                                    tag: 'h4',
                                    text: poster.title || 'Untitled Poster',
                                    style: {
                                        margin: '0 0 8px 0',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1a1a2e',
                                        lineHeight: '1.4'
                                    }
                                }),

                                // Author, Co-author, Presenter row
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        flexWrap: 'wrap',
                                        marginBottom: '12px'
                                    },
                                    child: [
                                        // Author
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-regular fa-user' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                $({ tag: 'span', text: poster.author || 'Unknown', style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#495057' } })
                                            ]
                                        }),
                                        // Co-author - formatted without brackets
                                        formattedCoauthors ? $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-solid fa-users' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                $({ 
                                                    tag: 'span', 
                                                    text: `Coauthor: ${formattedCoauthors}`, 
                                                    style: { 
                                                        fontFamily: 'Inter, sans-serif', 
                                                        fontSize: '13px', 
                                                        color: '#495057' 
                                                    } 
                                                })
                                            ]
                                        }) : null,
                                        // Presenter
                                        poster.presenter ? $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-solid fa-microphone' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                $({ tag: 'span', text: `Presenter: ${poster.presenter}`, style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#495057' } })
                                            ]
                                        }) : null,
                                        // Paper Trail No
                                        poster.paper_trail_no ? $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-solid fa-hashtag' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                $({ tag: 'span', text: `Paper Trail: ${poster.paper_trail_no}`, style: { fontFamily: 'monospace', fontSize: '12px', color: '#1976D2' } })
                                            ]
                                        }) : null
                                    ]
                                }),

                                // Tags and Event
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        marginBottom: '12px'
                                    },
                                    child: [
                                        poster.category ? $({
                                            tag: 'span',
                                            text: poster.category,
                                            style: {
                                                padding: '4px 10px',
                                                backgroundColor: '#e7f1ff',
                                                borderRadius: '20px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                color: '#0d6efd'
                                            }
                                        }) : null,
                                        poster.campus ? $({
                                            tag: 'span',
                                            text: poster.campus,
                                            style: {
                                                padding: '4px 10px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '20px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                color: '#6c757d'
                                            }
                                        }) : null,
                                        poster.center ? $({
                                            tag: 'span',
                                            text: poster.center,
                                            style: {
                                                padding: '4px 10px',
                                                backgroundColor: '#e8f5e9',
                                                borderRadius: '20px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                color: '#28a745'
                                            }
                                        }) : null,
                                        poster.event_name || poster.event ? $({
                                            tag: 'span',
                                            text: poster.event_name || poster.event,
                                            style: {
                                                padding: '4px 10px',
                                                backgroundColor: '#fef3e2',
                                                borderRadius: '20px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                color: '#e65100'
                                            }
                                        }) : null,
                                        $({
                                            tag: 'span',
                                            text: `Submitted: ${formatDate(poster.created_at)}`,
                                            style: {
                                                padding: '4px 10px',
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: '20px',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                color: '#6b7280'
                                            }
                                        })
                                    ]
                                }),

                                // Action Buttons
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    },
                                    child: [
                                        // View Poster Button
                                        $({
                                            tag: 'button',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 14px',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #E91E63',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                color: '#E91E63',
                                                transition: 'all 0.2s ease'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-regular fa-eye' }, style: { fontSize: '12px' } }),
                                                $({ tag: 'span', text: 'View Poster' })
                                            ],
                                            event: {
                                                type: 'click',
                                                method: openPosterViewer
                                            },
                                            mouseenter: (e) => {
                                                e.target.style.backgroundColor = '#fce4ec'
                                                e.target.style.borderColor = '#E91E63'
                                            },
                                            mouseleave: (e) => {
                                                e.target.style.backgroundColor = '#ffffff'
                                                e.target.style.borderColor = '#E91E63'
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    }

    const loadPosters = (searchTerm = '', page = 1) => {
        if (!posterBody) return

        // Show loading state
        posterBody.innerHTML = ''
        const loadingRow = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                padding: '60px',
                color: '#94a3b8'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-spinner fa-pulse' },
                    style: { fontSize: '32px', display: 'block', marginBottom: '16px', color: '#1976D2' }
                }),
                $({
                    tag: 'div',
                    text: 'Loading posters...',
                    style: { fontSize: '14px' }
                })
            ]
        })
        posterBody.appendChild(loadingRow)

        const form = new FormData()
        form.append('getAllPosters', 'true')
        if (searchTerm) {
            form.append('search', searchTerm)
        }
        form.append('page', page)
        form.append('limit', itemsPerPage)

        fetch('/getresearch', {
            method: 'POST',
            body: form
        })
        .then(async res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            
            const text = await res.text()
            
            if (!text || text.trim() === '') {
                throw new Error('Empty response from server')
            }
            
            try {
                return JSON.parse(text)
            } catch (e) {
                console.error('Invalid JSON response:', text.substring(0, 200))
                throw new Error('Invalid response from server: ' + e.message)
            }
        })
        .then(data => {
            posterBody.innerHTML = ''

            if (!data) {
                throw new Error('No data received from server')
            }

            if (data.status && data.data && data.data.length > 0) {
                totalPages = data.total_pages || 1
                totalItems = data.total || data.data.length
                currentPage = page

                data.data.forEach(poster => {
                    const card = PosterCard({ poster })
                    posterBody.appendChild(card)
                })

                if (totalPages > 1) {
                    posterBody.appendChild(createPagination(page, totalPages, searchTerm))
                }

                const countEl = document.querySelector('.poster-count')
                if (countEl) {
                    countEl.textContent = `Showing ${data.data.length} of ${totalItems} posters`
                }
            } else {
                const emptyRow = $({
                    tag: 'div',
                    style: {
                        textAlign: 'center',
                        padding: '60px',
                        color: '#94a3b8'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-images' },
                            style: { fontSize: '48px', display: 'block', marginBottom: '16px', color: '#cbd5e1' }
                        }),
                        $({
                            tag: 'div',
                            text: searchTerm ? 'No posters match your search' : 'No submitted posters found',
                            style: { fontSize: '16px', color: '#64748b', fontWeight: '500' }
                        }),
                        $({
                            tag: 'div',
                            text: searchTerm ? 'Try adjusting your search terms' : 'Submitted posters will appear here',
                            style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                        })
                    ]
                })
                posterBody.appendChild(emptyRow)
                totalItems = 0
                totalPages = 1
                const countEl = document.querySelector('.poster-count')
                if (countEl) {
                    countEl.textContent = 'No posters found'
                }
            }
        })
        .catch(err => {
            console.error('Error loading posters:', err)
            posterBody.innerHTML = ''
            const errorRow = $({
                tag: 'div',
                style: {
                    textAlign: 'center',
                    padding: '60px',
                    color: '#ef4444'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-exclamation-triangle' },
                        style: { fontSize: '32px', display: 'block', marginBottom: '16px' }
                    }),
                    $({
                        tag: 'div',
                        text: 'Failed to load posters',
                        style: { fontSize: '16px', fontWeight: '500' }
                    }),
                    $({
                        tag: 'div',
                        text: err.message || 'Please try again later',
                        style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                    }),
                    $({
                        tag: 'button',
                        text: 'Retry',
                        style: {
                            marginTop: '16px',
                            padding: '8px 24px',
                            backgroundColor: '#1976D2',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                loadPosters(searchTerm, page)
                            }
                        },
                        mouseenter: (e) => {
                            e.target.style.backgroundColor = '#1565C0'
                        },
                        mouseleave: (e) => {
                            e.target.style.backgroundColor = '#1976D2'
                        }
                    })
                ]
            })
            posterBody.appendChild(errorRow)
        })
    }

    const createPagination = (currentPage, totalPages, searchTerm) => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '20px 0',
                marginTop: '12px',
                borderTop: '1px solid #e9ecef'
            }
        })

        const prevBtn = $({
            tag: 'button',
            text: '‹',
            style: {
                padding: '8px 14px',
                backgroundColor: currentPage > 1 ? '#ffffff' : '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                cursor: currentPage > 1 ? 'pointer' : 'not-allowed',
                color: currentPage > 1 ? '#2c3e50' : '#adb5bd',
                fontSize: '16px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: () => {
                    if (currentPage > 1) {
                        loadPosters(searchTerm, currentPage - 1)
                    }
                }
            },
            mouseenter: currentPage > 1 ? (e) => {
                e.target.style.backgroundColor = '#f1f5f9'
            } : null,
            mouseleave: currentPage > 1 ? (e) => {
                e.target.style.backgroundColor = '#ffffff'
            } : null
        })

        container.appendChild(prevBtn)

        const startPage = Math.max(1, currentPage - 2)
        const endPage = Math.min(totalPages, currentPage + 2)

        if (startPage > 1) {
            const firstBtn = createPageButton(1, currentPage, searchTerm)
            container.appendChild(firstBtn)
            if (startPage > 2) {
                container.appendChild($({
                    tag: 'span',
                    text: '…',
                    style: { color: '#6c757d', padding: '0 8px' }
                }))
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i, currentPage, searchTerm)
            container.appendChild(pageBtn)
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                container.appendChild($({
                    tag: 'span',
                    text: '…',
                    style: { color: '#6c757d', padding: '0 8px' }
                }))
            }
            const lastBtn = createPageButton(totalPages, currentPage, searchTerm)
            container.appendChild(lastBtn)
        }

        const nextBtn = $({
            tag: 'button',
            text: '›',
            style: {
                padding: '8px 14px',
                backgroundColor: currentPage < totalPages ? '#ffffff' : '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                cursor: currentPage < totalPages ? 'pointer' : 'not-allowed',
                color: currentPage < totalPages ? '#2c3e50' : '#adb5bd',
                fontSize: '16px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: () => {
                    if (currentPage < totalPages) {
                        loadPosters(searchTerm, currentPage + 1)
                    }
                }
            },
            mouseenter: currentPage < totalPages ? (e) => {
                e.target.style.backgroundColor = '#f1f5f9'
            } : null,
            mouseleave: currentPage < totalPages ? (e) => {
                e.target.style.backgroundColor = '#ffffff'
            } : null
        })

        container.appendChild(nextBtn)

        container.appendChild($({
            tag: 'span',
            text: `Page ${currentPage} of ${totalPages}`,
            style: {
                fontSize: '13px',
                color: '#6c757d',
                marginLeft: '12px'
            }
        }))

        return container
    }

    const createPageButton = (pageNum, currentPage, searchTerm) => {
        return $({
            tag: 'button',
            text: pageNum,
            style: {
                padding: '8px 14px',
                backgroundColor: pageNum === currentPage ? '#0d6efd' : '#ffffff',
                border: pageNum === currentPage ? '1px solid #0d6efd' : '1px solid #e9ecef',
                borderRadius: '8px',
                cursor: 'pointer',
                color: pageNum === currentPage ? '#ffffff' : '#2c3e50',
                fontSize: '14px',
                fontWeight: pageNum === currentPage ? '600' : '400',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: () => {
                    if (pageNum !== currentPage) {
                        loadPosters(searchTerm, pageNum)
                    }
                }
            },
            mouseenter: pageNum !== currentPage ? (e) => {
                e.target.style.backgroundColor = '#f1f5f9'
            } : null,
            mouseleave: pageNum !== currentPage ? (e) => {
                e.target.style.backgroundColor = '#ffffff'
            } : null
        })
    }

    const bodyPanel = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                minHeight: '300px',
                backgroundColor: '#f8f9fa',
                overflowY: 'auto',
                padding: '16px',
                borderRadius: '0'
            },
            elementHandler: (el) => {
                posterBody = el
                loadPosters('', 1)
            }
        })
    }

    const refreshPosters = (searchTerm = '', page = 1) => {
        loadPosters(searchTerm, page)
    }

    return $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            minHeight: '400px',
            backgroundColor: '#f8f9fa',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 20px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e9ecef'
                },
                child: [
                    search({
                        searchEvent: (e) => searchInput(e),
                        tools: null
                    }),
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
                                att: { className: 'fa-regular fa-images' },
                                style: { color: '#E91E63', fontSize: '16px' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Submitted Posters',
                                style: {
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#2c3e50'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: { className: 'poster-count' },
                                text: 'Loading...',
                                style: {
                                    fontSize: '12px',
                                    color: '#6c757d',
                                    marginLeft: '4px'
                                }
                            })
                        ]
                    })
                ]
            }),
            $({
                tag: 'div',
                style: {
                    flex: '1',
                    overflowY: 'auto',
                    padding: '16px',
                    minHeight: '300px'
                },
                elementHandler: (el) => {
                    posterBody = el
                    loadPosters('', 1)
                }
            })
        ]
    })
}
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
                                        placeholder: 'Search by title, author, or event...'
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

        const getStatusBadge = (status) => {
            const styles = {
                pending: { bg: '#FFF3E0', text: '#E65100', label: 'Pending', icon: 'fa-clock' },
                accepted: { bg: '#E8F5E9', text: '#2E7D32', label: 'Accepted', icon: 'fa-check-circle' },
                rejected: { bg: '#FFEBEE', text: '#C62828', label: 'Rejected', icon: 'fa-times-circle' }
            }
            const config = styles[status] || styles.pending

            return $({
                tag: 'span',
                style: {
                    backgroundColor: config.bg,
                    color: config.text,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                },
                child: [
                    $({ tag: 'i', att: { className: `fas ${config.icon}` }, style: { fontSize: '11px' } }),
                    $({ tag: 'span', text: config.label })
                ]
            })
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

                                // Author and Event row
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
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-regular fa-calendar' }, style: { fontSize: '12px', color: '#6c757d' } }),
                                                $({ tag: 'span', text: poster.event_name || poster.event || 'N/A', style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#495057' } })
                                            ]
                                        }),
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
                                                $({ tag: 'span', text: poster.paper_trail_no, style: { fontFamily: 'monospace', fontSize: '12px', color: '#1976D2' } })
                                            ]
                                        }) : null
                                    ]
                                }),

                                // Tags and Status
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
                                        $({
                                            tag: 'div',
                                            style: { marginLeft: 'auto' },
                                            child: [
                                                getStatusBadge(poster.status || 'pending')
                                            ]
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
                                        }),
                                        // View Comments Button
                                        $({
                                            tag: 'button',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 14px',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #0d6efd',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                color: '#0d6efd',
                                                transition: 'all 0.2s ease'
                                            },
                                            child: [
                                                $({ tag: 'span', att: { className: 'fa-regular fa-comment' }, style: { fontSize: '12px' } }),
                                                $({ tag: 'span', text: 'Comments' })
                                            ],
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    viewPosterComments(poster)
                                                }
                                            },
                                            mouseenter: (e) => {
                                                e.target.style.backgroundColor = '#e7f1ff'
                                                e.target.style.borderColor = '#0d6efd'
                                            },
                                            mouseleave: (e) => {
                                                e.target.style.backgroundColor = '#ffffff'
                                                e.target.style.borderColor = '#0d6efd'
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

    const viewPosterComments = (poster) => {
        // Show a modal with poster information and comments placeholder
        const modalContent = () => {
            const container = $({
                tag: 'div',
                style: {
                    padding: '20px'
                }
            })

            container.appendChild($({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Paper Trail No', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'div', text: poster.paper_trail_no || 'N/A', style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500', fontFamily: 'monospace' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Status', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'span', text: poster.status || 'pending', style: { fontSize: '14px', color: poster.status === 'accepted' ? '#2E7D32' : poster.status === 'rejected' ? '#C62828' : '#E65100', fontWeight: '500', textTransform: 'capitalize' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Title', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'div', text: poster.title || 'N/A', style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Author', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'div', text: poster.author || 'N/A', style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Event', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'div', text: poster.event_name || poster.event || 'N/A', style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500' } })
                                ]
                            }),
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'div', text: 'Submitted', style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' } }),
                                    $({ tag: 'div', text: poster.created_at ? new Date(poster.created_at).toLocaleDateString() : 'N/A', style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500' } })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            padding: '16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e8ecf0',
                            textAlign: 'center'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-comment-dots' },
                                style: { fontSize: '24px', color: '#94a3b8', display: 'block', marginBottom: '8px' }
                            }),
                            $({
                                tag: 'div',
                                text: 'Comments feature coming soon for posters.',
                                style: { color: '#64748b', fontSize: '14px' }
                            })
                        ]
                    })
                ]
            }))

            return container
        }

        const modalFooter = ({ closeModal }) => {
            return $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    width: '100%'
                },
                child: [
                    $({
                        tag: 'button',
                        text: 'Close',
                        style: {
                            padding: '10px 28px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e8ecf0',
                            borderRadius: '10px',
                            color: '#475569',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'click',
                            method: closeModal,
                            mouseenter: (e) => {
                                e.target.style.backgroundColor = '#f1f5f9'
                                e.target.style.borderColor = '#cbd5e1'
                            },
                            mouseleave: (e) => {
                                e.target.style.backgroundColor = '#f8fafc'
                                e.target.style.borderColor = '#e8ecf0'
                            }
                        }
                    })
                ]
            })
        }

        CustomModal({
            title: 'Poster Details',
            content: modalContent,
            footer: modalFooter,
            size: 'medium',
            closeOnOverlayClick: true,
            showCloseButton: true
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
        form.append('getAcceptedPosters', 'true')
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
            // Check if response is ok
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }
            
            // Get the response text first
            const text = await res.text()
            
            // Check if response is empty
            if (!text || text.trim() === '') {
                throw new Error('Empty response from server')
            }
            
            // Try to parse JSON
            try {
                return JSON.parse(text)
            } catch (e) {
                console.error('Invalid JSON response:', text.substring(0, 200))
                throw new Error('Invalid response from server: ' + e.message)
            }
        })
        .then(data => {
            posterBody.innerHTML = ''

            // Check if data is valid
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

                // Add pagination
                if (totalPages > 1) {
                    posterBody.appendChild(createPagination(page, totalPages, searchTerm))
                }

                // Update item count
                const countEl = document.querySelector('.poster-count')
                if (countEl) {
                    countEl.textContent = `Showing ${data.data.length} of ${totalItems} posters`
                }
            } else {
                // Check if there's an error message from the server
                if (data.message) {
                    console.warn('Server message:', data.message)
                }
                
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
                            text: searchTerm ? 'No posters match your search' : 'No accepted posters found',
                            style: { fontSize: '16px', color: '#64748b', fontWeight: '500' }
                        }),
                        $({
                            tag: 'div',
                            text: searchTerm ? 'Try adjusting your search terms' : 'Accepted posters will appear here',
                            style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                        }),
                        ...(data.message ? [
                            $({
                                tag: 'div',
                                text: data.message,
                                style: { fontSize: '12px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }
                            })
                        ] : [])
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

        // Previous button
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

        // Page numbers
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

        // Next button
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

        // Page info
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

    // Refresh function to be called from parent
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
                                text: 'Accepted Posters',
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
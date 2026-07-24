import { $, Waiting, ConfirmationAlert, FileViewerModal, CustomModal } from '../../../lib/lib.js'
import { createPosterActionButtons } from './posterActions.js'

export const PosterViewModel = ({ onClose }) => {
    let searchInput, tableBody
    let modalRef = null

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '400px',
                backgroundColor: '#ffffff'
            }
        })

        // Search Section (no filter)
        const searchContainer = $({
            tag: 'div',
            style: {
                padding: '16px 20px',
                borderBottom: '1px solid #e8ecf0',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '12px 12px 0 0'
            }
        })

        // Search Bar
        const searchWrapper = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '8px 14px',
                gap: '10px',
                flex: 1,
                minWidth: '200px',
                border: '1px solid #e8ecf0',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0'
                }
            }
        })

        const searchIcon = $({
            tag: 'i',
            att: { className: 'fas fa-search' },
            style: { color: '#94a3b8', fontSize: '15px' }
        })

        searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                placeholder: 'Search by title, author, or event...'
            },
            style: {
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#1a2a3a',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => {
                    loadPosters(e.target.value.trim())
                }
            }
        })

        searchWrapper.appendChild(searchIcon)
        searchWrapper.appendChild(searchInput)
        searchContainer.appendChild(searchWrapper)

        container.appendChild(searchContainer)

        // Table Container
        const tableContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                padding: '16px 20px'
            }
        })

        const table = $({
            tag: 'table',
            style: {
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e8ecf0'
            }
        })

        // Table Header
        const thead = $({ tag: 'thead' })
        const headerRow = $({
            tag: 'tr',
            style: {
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e8ecf0'
            }
        })

        // Removed 'Status' column
        const columns = ['Poster', 'Title', 'Author', 'Event', 'Submitted', 'Actions']

        columns.forEach(col => {
            headerRow.appendChild($({
                tag: 'th',
                text: col,
                style: {
                    padding: '14px 16px',
                    textAlign: 'left',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    backgroundColor: '#f8fafc'
                }
            }))
        })

        thead.appendChild(headerRow)
        table.appendChild(thead)

        tableBody = $({ tag: 'tbody' })
        table.appendChild(tableBody)

        tableContainer.appendChild(table)
        container.appendChild(tableContainer)

        return container
    }

    const createPosterRow = (poster, onSuccess) => {
        const row = $({
            tag: 'tr',
            style: {
                borderBottom: '1px solid #f0f2f5',
                transition: 'background-color 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#fafbfc'
                },
                type2: 'mouseleave',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                }
            }
        })

        // Poster thumbnail / icon
        const posterCell = $({
            tag: 'td',
            style: {
                padding: '12px 16px',
                verticalAlign: 'middle'
            }
        })

        const posterLink = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: () => {
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
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#fce4ec',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-file-pdf' },
                            style: { color: '#E91E63', fontSize: '18px' }
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    text: 'View Poster',
                    style: {
                        color: '#1976D2',
                        fontSize: '13px',
                        fontWeight: '500'
                    }
                })
            ]
        })

        posterCell.appendChild(posterLink)

        // Title
        const titleCell = $({
            tag: 'td',
            text: poster.title || '—',
            style: {
                padding: '12px 16px',
                color: '#1a2a3a',
                fontSize: '14px',
                fontWeight: '500',
                verticalAlign: 'middle'
            }
        })

        // Author
        const authorCell = $({
            tag: 'td',
            text: poster.author || '—',
            style: {
                padding: '12px 16px',
                color: '#475569',
                fontSize: '13px',
                verticalAlign: 'middle'
            }
        })

        // Event
        const eventCell = $({
            tag: 'td',
            text: poster.event_name || '—',
            style: {
                padding: '12px 16px',
                color: '#64748b',
                fontSize: '13px',
                verticalAlign: 'middle'
            }
        })

        // Date
        const dateCell = $({
            tag: 'td',
            text: poster.created_at ? new Date(poster.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : '—',
            style: {
                padding: '12px 16px',
                color: '#94a3b8',
                fontSize: '12px',
                verticalAlign: 'middle'
            }
        })

        // Actions
        const actionsCell = $({
            tag: 'td',
            style: {
                padding: '8px 16px',
                verticalAlign: 'middle',
                textAlign: 'center'
            }
        })

        const actionButtons = createPosterActionButtons(poster, () => {
            // Refresh the poster list after action
            const searchTerm = searchInput?.value?.trim() || ''
            loadPosters(searchTerm)
        })
        actionsCell.appendChild(actionButtons)

        row.appendChild(posterCell)
        row.appendChild(titleCell)
        row.appendChild(authorCell)
        row.appendChild(eventCell)
        row.appendChild(dateCell)
        row.appendChild(actionsCell)

        return row
    }

    const loadPosters = async (searchTerm = '') => {
        if (!tableBody) return

        tableBody.innerHTML = ''

        const loadingRow = $({
            tag: 'tr',
            child: [
                $({
                    tag: 'td',
                    att: { colSpan: 6 },
                    style: { padding: '40px', textAlign: 'center' },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-spinner fa-pulse' },
                            style: { fontSize: '32px', display: 'block', marginBottom: '12px', color: '#1976D2' }
                        }),
                        $({
                            tag: 'div',
                            text: 'Loading posters...',
                            style: { fontSize: '14px', color: '#64748b' }
                        })
                    ]
                })
            ]
        })
        tableBody.appendChild(loadingRow)

        try {
            const form = new FormData()
            form.append('getUserPosters', 'true')
            if (searchTerm) {
                form.append('search', searchTerm)
            }

            const response = await fetch('/uploadExtensionDocs', {
                method: 'POST',
                body: form
            })

            loadingRow.remove()

            if (!response.ok) {
                throw new Error('Server error: ' + response.status)
            }

            const data = await response.json()

            if (data.status && data.data && data.data.length > 0) {
                data.data.forEach(poster => {
                    const row = createPosterRow(poster, () => {
                        // Refresh after action
                        const currentSearch = searchInput?.value?.trim() || ''
                        loadPosters(currentSearch)
                    })
                    tableBody.appendChild(row)
                })
            } else {
                const emptyRow = $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: { colSpan: 6 },
                            style: { padding: '60px', textAlign: 'center' },
                            child: [
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-images' },
                                    style: { fontSize: '48px', display: 'block', marginBottom: '16px', color: '#cbd5e1' }
                                }),
                                $({
                                    tag: 'div',
                                    text: searchTerm ? 'No posters match your search' : 'No posters submitted yet',
                                    style: { fontSize: '16px', color: '#64748b', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: searchTerm ? 'Try adjusting your search terms' : 'Submit a poster to see it here',
                                    style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                                })
                            ]
                        })
                    ]
                })
                tableBody.appendChild(emptyRow)
            }

        } catch (error) {
            console.error('Error loading posters:', error)
            loadingRow.remove()

            const errorRow = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        att: { colSpan: 6 },
                        style: { padding: '40px', textAlign: 'center' },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-exclamation-triangle' },
                                style: { fontSize: '32px', display: 'block', marginBottom: '12px', color: '#ef4444' }
                            }),
                            $({
                                tag: 'div',
                                text: 'Failed to load posters',
                                style: { fontSize: '14px', color: '#1a2a3a', fontWeight: '500' }
                            }),
                            $({
                                tag: 'div',
                                text: error.message,
                                style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                            })
                        ]
                    })
                ]
            })
            tableBody.appendChild(errorRow)
        }
    }

    const buildFooter = ({ closeModal }) => {
        const footerContainer = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                width: '100%'
            }
        })

        return footerContainer
    }

    // Create the modal
    const content = buildContent()

    modalRef = CustomModal({
        title: 'Submitted Posters',
        content: content,
        footer: buildFooter,
        size: 'large',
        onClose: () => {
            if (onClose) onClose()
            modalRef = null
        },
        closeOnOverlayClick: true,
        showCloseButton: true
    })

    // Load posters after modal is open
    setTimeout(() => {
        loadPosters('')
    }, 200)

    return modalRef
}
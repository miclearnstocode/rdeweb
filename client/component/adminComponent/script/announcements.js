import { $, CustomModal, DragDropUpload, Toast, Waiting } from '../../../lib/lib.js'

export const Announcements = () => {
    let contentContainer

    const fetchAnnouncements = async (container) => {
        const loader = Waiting()
        document.body.appendChild(loader)

        try {
            const formData = new FormData()
            formData.append('action', 'getAll')

            const res = await fetch('/announcements', { method: 'POST', body: formData })
            const json = await res.json()

            if (json.status) {
                container.innerHTML = ''
                renderTable(container, json.data)
            }
        } catch (error) {
            console.error("Error fetching announcements:", error)
            Toast.error("Failed to load announcements.")
        }
    }

    // Toggle visibility handler
    const toggleVisibility = async (id, currentStatus, container) => {
        const loader = Waiting()
        document.body.appendChild(loader)

        try {
            const fd = new FormData()
            fd.append('action', 'toggleVisibility')
            fd.append('id', id)
            fd.append('currentStatus', currentStatus)

            const res = await fetch('/announcements', { method: 'POST', body: fd })
            const json = await res.json()

            if (json.status) {
                fetchAnnouncements(container)
            } else {
                Toast.error(json.message || "Failed to update visibility.")
            }
        } catch (error) {
            console.error("Error toggling visibility:", error)
            Toast.error("An error occurred while updating visibility.")
        }
    }

    const renderTable = (container, data) => {
        const tableWrapper = $({
            tag: 'div',
            style: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }
        })

        // Header Row
        const headerRow = $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: '30px 2fr 1fr 1fr 100px 120px', background: 'var(--light-bg)', padding: '14px 20px', fontWeight: '600', borderBottom: '1px solid #e8ecf0', color: 'var(--text-dark)' },
            child: [
                $({ tag: 'span', text: '#', style: { textAlign: 'center' } }),
                $({ tag: 'span', text: 'Title' }),
                $({ tag: 'span', text: 'Date' }),
                $({ tag: 'span', text: 'Venue' }),
                $({ tag: 'span', text: 'Status', style: { textAlign: 'center' } }),
                $({ tag: 'span', text: 'Visible', style: { textAlign: 'center' } })
            ]
        })
        tableWrapper.appendChild(headerRow)

        // Data Rows
        data.forEach((ann, index) => {
            let badgeColor = '#6c757d'
            if (ann.status === 'Upcoming') badgeColor = '#0d6efd'
            if (ann.status === 'Ongoing') badgeColor = '#198754'

            const row = $({
                tag: 'div',
                style: { display: 'grid', gridTemplateColumns: '30px 2fr 1fr 1fr 100px 120px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', transition: 'var(--transition)' },
                child: [
                    $({ tag: 'span', text: index + 1, style: { color: 'var(--text-gray)', textAlign: 'center' } }),
                    $({ tag: 'span', text: ann.title, style: { fontWeight: '500' } }),
                    $({ tag: 'span', text: ann.event_date, style: { color: 'var(--text-gray)', fontSize: '0.9rem' } }),
                    $({ tag: 'span', text: ann.venue, style: { color: 'var(--text-gray)', fontSize: '0.9rem' } }),
                    $({ 
                        tag: 'span', 
                        text: ann.status, 
                        style: { background: badgeColor, color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', display: 'inline-block', width: 'fit-content', justifySelf: 'center' }
                    }),
                    // Modern Toggle Switch
                    $({
                        tag: 'div',
                        style: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                        child: [
                            $({
                                tag: 'label',
                                style: { position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' },
                                child: [
                                    $({
                                        tag: 'input',
                                        att: { type: 'checkbox', checked: ann.is_visible == 1 },
                                        style: { opacity: '0', width: '0', height: '0' },
                                        event: {
                                            type: 'change',
                                            method: (e) => {
                                                toggleVisibility(ann.id, ann.is_visible, container)
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            position: 'absolute',
                                            cursor: 'pointer',
                                            top: '0', left: '0', right: '0', bottom: '0',
                                            backgroundColor: ann.is_visible == 1 ? '#0d6efd' : '#ccc',
                                            transition: '.4s',
                                            borderRadius: '24px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                style: {
                                                    position: 'absolute',
                                                    content: '""',
                                                    height: '18px',
                                                    width: '18px',
                                                    left: ann.is_visible == 1 ? '22px' : '3px',
                                                    bottom: '3px',
                                                    backgroundColor: 'white',
                                                    transition: '.4s',
                                                    borderRadius: '50%'
                                                }
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ],
                event: {
                    type: 'mouseenter',
                    method: (e) => { e.currentTarget.style.backgroundColor = '#f8fafc' }
                },
                event2: {
                    type: 'mouseleave',
                    method: (e) => { e.currentTarget.style.backgroundColor = 'transparent' }
                }
            })
            tableWrapper.appendChild(row)
        })

        container.appendChild(tableWrapper)
    }

    const openCreateModal = () => {
        let hashtags = []
        let fileUploadComponent = null

        // Build the form content
        const formContent = $({
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '15px' },
            child: [
                // --- HEADLINE / SHORT TITLE ---
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Headline / Short Title', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. CAPSU Advances Research Excellence', 'modal-title')
                    ]
                }),

                // --- VENUE ---
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Venue', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. Via Zoom Teleconference', 'modal-venue')
                    ]
                }),

                // --- DATE ---
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Date', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. August 11, 2026', 'modal-date')
                    ]
                }),

                // --- FULL ARTICLE BODY ---
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Full Article Body / Description', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('textarea', 'Write the full details of the announcement here...', 'modal-body', 6)
                    ]
                }),
                
                // --- HASHTAGS ---
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'label', text: 'Hashtags (Press Enter to add)', style: { display: 'block', fontWeight: '600', marginBottom: '8px' } }),
                        $({
                            tag: 'input',
                            att: { type: 'text', id: 'modal-hashtag', placeholder: '#Example' },
                            style: { width: '100%', padding: '10px', border: '1px solid #e8ecf0', borderRadius: '8px', fontFamily: 'inherit' },
                            event: {
                                type: 'keydown',
                                method: (e) => {
                                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                        const tag = e.target.value.trim()
                                        if (!hashtags.includes(tag)) {
                                            hashtags.push(tag)
                                            const display = document.getElementById('modal-hashtag-display')
                                            display.appendChild($({
                                                tag: 'span',
                                                text: tag,
                                                style: { background: '#e7f1ff', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginRight: '8px' }
                                            }))
                                        }
                                        e.target.value = ''
                                    }
                                }
                            }
                        }),
                        $({ tag: 'div', att: { id: 'modal-hashtag-display' }, style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' } })
                    ]
                }),
                
                // --- FACEBOOK LINK ---
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Facebook Link', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. https://www.facebook.com/share/...', 'modal-fb')
                    ]
                }),

                // --- PHOTO UPLOAD ---
                $({
                    tag: 'div',
                    att: { id: 'photo-upload-wrapper' },
                    style: { marginTop: '5px' },
                    elementHandler: (el) => {
                        fileUploadComponent = DragDropUpload({
                            label: 'Upload Photos',
                            accept: 'image/*',
                            multiple: true,
                            description: 'Drag & drop images here or click to browse',
                            showPreview: true,
                            maxSizeMB: 10
                        })
                        el.appendChild(fileUploadComponent.element)
                    }
                })
            ]
        })

        // Open the CustomModal
        CustomModal({
            title: 'New Announcement',
            content: formContent,
            size: 'medium',
            footer: ({ closeModal }) => {
                return $({
                    tag: 'div',
                    style: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: { padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
                            event: { type: 'click', method: closeModal }
                        }),
                        $({
                            tag: 'button',
                            text: 'Publish',
                            style: { padding: '8px 24px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
                            event: {
                                type: 'click',
                                method: async () => {
                                    // Grab the distinct fields
                                    const title = document.getElementById('modal-title').value
                                    const venue = document.getElementById('modal-venue').value
                                    const date = document.getElementById('modal-date').value
                                    const body = document.getElementById('modal-body').value
                                    const fb = document.getElementById('modal-fb').value

                                    if (!title || !date) {
                                        Toast.error("Headline and Date are required.")
                                        return
                                    }

                                    const loader = Waiting()
                                    document.body.appendChild(loader)

                                    try {
                                        const fd = new FormData()
                                        fd.append('action', 'create')
                                        fd.append('title', title)
                                        fd.append('event_date', date)
                                        fd.append('venue', venue)
                                        fd.append('short_description', body)
                                        fd.append('body', body)
                                        fd.append('hashtags', hashtags.join(','))
                                        fd.append('facebook_link', fb)

                                        // Get files from DragDropUpload
                                        if (fileUploadComponent) {
                                            const files = fileUploadComponent.getFiles()
                                            if (files.length > 0) {
                                                files.forEach(file => {
                                                    fd.append('photos[]', file)
                                                })
                                            }
                                        }

                                        const res = await fetch('/announcements', { method: 'POST', body: fd })
                                        const json = await res.json()

                                        if (loader.parentNode) {
                                            loader.parentNode.removeChild(loader)
                                        }

                                        if (json.status) {
                                            Toast.success(json.message || "Announcement created successfully!")
                                            closeModal()
                                            fetchAnnouncements(contentContainer)
                                        } else {
                                            Toast.error(json.message || "Failed to create announcement.")
                                        }
                                    } catch (error) {
                                        if (loader.parentNode) {
                                            loader.parentNode.removeChild(loader)
                                        }
                                        console.error("Error creating announcement:", error)
                                        Toast.error("An error occurred while creating the announcement.")
                                    }
                                }
                            }
                        })
                    ]
                })
            }
        })
    }

    return $({
        tag: 'div',
        style: { padding: '20px' },
        child: [
            $({
                tag: 'div',
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
                child: [
                    $({ tag: 'h2', text: 'Announcements', style: { margin: '0' } }),
                    $({
                        tag: 'button',
                        text: '+ New Announcement',
                        style: { padding: '10px 20px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
                        event: { type: 'click', method: openCreateModal }
                    })
                ]
            }),
            $({
                tag: 'div',
                elementHandler: async (el) => {
                    contentContainer = el
                    fetchAnnouncements(el)
                }
            })
        ]
    })
}

const modalInput = (type, placeholder, id, rows) => {
    const commonStyle = { width: '100%', padding: '10px', border: '1px solid #e8ecf0', borderRadius: '8px', fontFamily: 'inherit', marginBottom: '10px' }
    if (type === 'textarea') {
        return $({
            tag: 'textarea',
            att: { id: id, placeholder: placeholder, rows: rows || 4 },
            style: commonStyle
        })
    }
    return $({
        tag: 'input',
        att: { type: type, id: id, placeholder: placeholder },
        style: commonStyle
    })
}
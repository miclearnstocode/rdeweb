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

            // REMOVE LOADER HERE (BEFORE updating the UI)
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader)
            }

            if (json.status) {
                container.innerHTML = ''
                renderTable(container, json.data)
            }
        } catch (error) {
            // ALSO REMOVE LOADER HERE (if there's an error)
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader)
            }
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

    const fetchAnnouncementById = async (id) => {
        try {
            const formData = new FormData();
            formData.append('action', 'getById');
            formData.append('id', id);

            const res = await fetch('/announcements', { method: 'POST', body: formData });
            const json = await res.json();

            if (json.status && json.data) {
                return json.data;
            } else {
                Toast.error(json.message || "Failed to fetch announcement data.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching announcement by ID:", error);
            Toast.error("An error occurred while fetching announcement data.");
            return null;
        }
    };

    const renderTable = (container, data) => {
        const tableWrapper = $({
            tag: 'div',
            style: { background: 'var(--white)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }
        })

        // Header Row (Added Actions column)
        const headerRow = $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: '30px 2fr 1fr 1fr 100px 100px 140px', background: 'var(--light-bg)', padding: '14px 20px', fontWeight: '600', borderBottom: '1px solid #e8ecf0', color: 'var(--text-dark)' },
            child: [
                $({ tag: 'span', text: '#', style: { textAlign: 'center' } }),
                $({ tag: 'span', text: 'Title' }),
                $({ tag: 'span', text: 'Date' }),
                $({ tag: 'span', text: 'Venue' }),
                $({ tag: 'span', text: 'Status', style: { textAlign: 'center' } }),
                $({ tag: 'span', text: 'Visible', style: { textAlign: 'center' } }),
                $({ tag: 'span', text: 'Actions', style: { textAlign: 'center' } })
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
                style: { display: 'grid', gridTemplateColumns: '30px 2fr 1fr 1fr 100px 100px 140px', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', transition: 'var(--transition)' },
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
                    }),
                    // --- ACTION BUTTONS (EDIT & DELETE) ---
                    $({
                        tag: 'div',
                        style: { display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' },
                        child: [
                            // Edit Button
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-pen-to-square' },
                                style: {
                                    padding: '6px 10px',
                                    backgroundColor: '#ffc107',
                                    color: '#212529',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => openEditModal(ann.id)
                                },
                                mouseenter: (e) => { e.target.style.transform = 'scale(1.1)'; e.target.style.backgroundColor = '#e0a800'; },
                                mouseleave: (e) => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = '#ffc107'; }
                            }),
                            // Delete Button
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-trash-can' },
                                style: {
                                    padding: '6px 10px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => deleteAnnouncement(ann.id, container)
                                },
                                mouseenter: (e) => { e.target.style.transform = 'scale(1.1)'; e.target.style.backgroundColor = '#c82333'; },
                                mouseleave: (e) => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = '#dc3545'; }
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

    // --- DELETE ANNOUNCEMENT ---
    const deleteAnnouncement = async (id, container) => {
        if (!confirm('Are you sure you want to permanently delete this announcement? This action cannot be undone.')) {
            return;
        }

        const loader = Waiting();
        document.body.appendChild(loader);

        try {
            const fd = new FormData();
            fd.append('action', 'delete');
            fd.append('id', id);

            const res = await fetch('/announcements', { method: 'POST', body: fd });
            const json = await res.json();

            if (loader.parentNode) loader.parentNode.removeChild(loader);

            if (json.status) {
                Toast.success('Announcement deleted successfully!');
                fetchAnnouncements(container);
            } else {
                Toast.error(json.message || 'Failed to delete announcement.');
            }
        } catch (error) {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
            console.error('Error deleting announcement:', error);
            Toast.error('An error occurred while deleting the announcement.');
        }
    };

    const openEditModal = async (id) => {
        const loader = Waiting();
        document.body.appendChild(loader);

        const announcement = await fetchAnnouncementById(id);

        if (loader.parentNode) loader.parentNode.removeChild(loader);

        if (!announcement) return;

        let editHashtags = announcement.hashtags ? announcement.hashtags.split(',').filter(t => t.trim() !== '') : [];
        let fileUploadComponent = null;
        let existingGalleryImages = announcement.gallery_images || [];
        let imagesToDelete = [];

        const getCleanPreviewUrl = (url) => {
            if (!url) return '';
            let previewSrc = url;
            if (url.includes('drive.google.com')) {
                let fileId = null;
                const patterns = [
                    /\/d\/([a-zA-Z0-9_-]+)/,
                    /id=([a-zA-Z0-9_-]+)/,
                    /open\?id=([a-zA-Z0-9_-]+)/,
                    /\/file\/d\/([a-zA-Z0-9_-]+)/,
                    /([a-zA-Z0-9_-]{25,})/
                ];
                for (let pattern of patterns) {
                    const match = url.match(pattern);
                    if (match && match[1]) {
                        fileId = match[1];
                        break;
                    }
                }
                if (fileId) {
                    fileId = fileId.split('?')[0].split('&')[0];
                    previewSrc = `https://drive.google.com/file/d/${fileId}/preview`;
                }
            }
            return previewSrc;
        };

        // Build the form content
        const formContent = $({
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '15px' },
            child: [
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Headline / Short Title', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. CAPSU Advances Research Excellence', 'edit-modal-title', 1, announcement.title)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Venue', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. Via Zoom Teleconference', 'edit-modal-venue', 1, announcement.venue)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Date', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. August 11, 2026', 'edit-modal-date', 1, announcement.event_date)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Full Article Body / Description', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('textarea', 'Write the full details of the announcement here...', 'edit-modal-body', 6, announcement.body || announcement.short_description)
                    ]
                }),
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'label', text: 'Hashtags (Press Enter to add)', style: { display: 'block', fontWeight: '600', marginBottom: '8px' } }),
                        $({
                            tag: 'input',
                            att: { type: 'text', id: 'edit-modal-hashtag', placeholder: 'e.g. #RiseCAPSU' },
                            style: { width: '100%', padding: '10px', border: '1px solid #e8ecf0', borderRadius: '8px', fontFamily: 'inherit' },
                            event: {
                                type: 'keydown',
                                method: (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const rawTag = e.target.value.trim();
                                        if (rawTag !== '') {
                                            const formattedTag = rawTag.startsWith('#') ? rawTag : '#' + rawTag;
                                            if (!editHashtags.includes(formattedTag)) {
                                                editHashtags.push(formattedTag);
                                                const display = document.getElementById('edit-modal-hashtag-display');
                                                if (display) {
                                                    display.appendChild($({
                                                        tag: 'span',
                                                        text: formattedTag,
                                                        style: { background: '#e7f1ff', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginRight: '8px' }
                                                    }));
                                                }
                                            }
                                            e.target.value = '';
                                        }
                                    }
                                }
                            }
                        }),
                        $({ tag: 'div', att: { id: 'edit-modal-hashtag-display' }, style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' } })
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Facebook Link', style: { display: 'block', fontWeight: '600', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. https://www.facebook.com/share/...', 'edit-modal-fb', 1, announcement.facebook_link || '')
                    ]
                }),
                $({
                    tag: 'div',
                    att: { id: 'edit-photo-upload-wrapper' },
                    style: { marginTop: '5px' },
                    elementHandler: (el) => {
                        fileUploadComponent = DragDropUpload({
                            label: 'Replace Photos (Leave empty to keep existing)',
                            accept: 'image/*',
                            multiple: true,
                            description: 'Drag & drop images here or click to browse',
                            showPreview: true,
                            maxSizeMB: 10,
                            existingImages: existingGalleryImages,
                            // <--- NEW: Handle removal of existing images
                            onFileRemove: (removedImage, index, newSavedImages) => {
                                // Add the ID of the removed image to the delete list
                                if (removedImage && removedImage.id) {
                                    imagesToDelete.push(removedImage.id);
                                }
                                // Update the local array
                                existingGalleryImages = newSavedImages;
                            }
                        });
                        el.appendChild(fileUploadComponent.element);
                    }
                })
            ]
        });

        // Pre-populate existing hashtags into the display
        setTimeout(() => {
            const display = document.getElementById('edit-modal-hashtag-display');
            if (display) {
                editHashtags.forEach(tag => {
                    display.appendChild($({
                        tag: 'span',
                        text: tag,
                        style: { background: '#e7f1ff', color: 'var(--primary-blue)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginRight: '8px' }
                    }));
                });
            }
        }, 100);

        // Open the CustomModal
        CustomModal({
            title: 'Edit Announcement',
            content: formContent,
            size: 'medium',
            closeOnOverlayClick: false,
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
                            text: 'Save Changes',
                            style: { padding: '8px 24px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
                            event: {
                                type: 'click',
                                method: async () => {
                                    const title = document.getElementById('edit-modal-title').value;
                                    const venue = document.getElementById('edit-modal-venue').value;
                                    const date = document.getElementById('edit-modal-date').value;
                                    const body = document.getElementById('edit-modal-body').value;
                                    const fb = document.getElementById('edit-modal-fb').value;
                                    const hashtag = document.getElementById('edit-modal-hashtag').value;

                                    if (!title || !date) {
                                        Toast.error("Headline and Date are required.");
                                        return;
                                    }

                                    const loader = Waiting();
                                    document.body.appendChild(loader);

                                    try {
                                        const fd = new FormData();
                                        fd.append('action', 'update');
                                        fd.append('id', announcement.id);
                                        fd.append('title', title);
                                        fd.append('event_date', date);
                                        fd.append('venue', venue);
                                        fd.append('short_description', body);
                                        fd.append('body', body);
                                        fd.append('hashtags', hashtag);
                                        fd.append('facebook_link', fb);

                                        if (imagesToDelete.length > 0) {
                                                fd.append('delete_image_ids', JSON.stringify(imagesToDelete));
                                            }

                                        if (fileUploadComponent) {
                                            const newFiles = fileUploadComponent.getFiles();
                                            const savedImages = fileUploadComponent.getSavedImages();

                                            if (newFiles.length > 0) {
                                                newFiles.forEach(file => {
                                                    fd.append('photos[]', file);
                                                });
                                            }
                                            
                                            // Update the existing images JSON array (exclude deleted ones)
                                            fd.append('existing_images_json', JSON.stringify(savedImages));
                                        }

                                        const res = await fetch('/announcements', { method: 'POST', body: fd });
                                        const json = await res.json();

                                        if (loader.parentNode) loader.parentNode.removeChild(loader);

                                        if (json.status) {
                                            Toast.success('Announcement updated successfully!');
                                            closeModal();
                                            fetchAnnouncements(contentContainer);
                                        } else {
                                            Toast.error(json.message || 'Failed to update announcement.');
                                        }
                                    } catch (error) {
                                        if (loader.parentNode) loader.parentNode.removeChild(loader);
                                        console.error("Error updating announcement:", error);
                                        Toast.error("An error occurred while updating the announcement.");
                                    }
                                }
                            }
                        })
                    ]
                })
            }
        });
    };

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
                        $({ tag: 'label', text: 'Hashtags (Press Enter to add, Click to remove)', style: { display: 'block', fontWeight: '600', marginBottom: '8px' } }),
                        $({
                            tag: 'input',
                            att: { type: 'text', id: 'modal-hashtag', placeholder: 'e.g. #RiseCAPSU' },
                            style: { width: '100%', padding: '10px', border: '1px solid #e8ecf0', borderRadius: '8px', fontFamily: 'inherit' },
                            event: {
                                type: 'keydown',
                                method: (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent form submission

                                        const rawTag = e.target.value.trim()
                                        if (rawTag !== '') {
                                            // Ensure the tag starts with a '#' symbol
                                            const formattedTag = rawTag.startsWith('#') ? rawTag : '#' + rawTag

                                            // Prevent duplicate tags
                                            if (!hashtags.includes(formattedTag)) {
                                                hashtags.push(formattedTag)
                                                
                                                const display = document.getElementById('modal-hashtag-display')
                                                if (display) {
                                                    display.appendChild($({
                                                        tag: 'span',
                                                        text: formattedTag,
                                                        style: { 
                                                            background: '#e7f1ff', 
                                                            color: 'var(--primary-blue)', 
                                                            padding: '4px 12px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.85rem', 
                                                            marginRight: '8px',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            transition: 'all 0.2s ease'
                                                        }
                                                    }))
                                                }
                                            }
                                            e.target.value = '' // Clear input field
                                        }
                                    }
                                }
                            }
                        }),
                        $({ 
                            tag: 'div', 
                            att: { id: 'modal-hashtag-display' }, 
                            style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' } 
                        })
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

        // ADD EVENT DELEGATION: Clicking a pill removes it
        setTimeout(() => {
            const display = document.getElementById('modal-hashtag-display');
            if (display) {
                display.addEventListener('click', (e) => {
                    const target = e.target;
                    // Check if the clicked element is a tag span
                    if (target.tagName === 'SPAN' && target.textContent.startsWith('#')) {
                        const tagToRemove = target.textContent;
                        // Remove from the DOM
                        target.remove();
                        // Remove from the hashtags array
                        hashtags = hashtags.filter(t => t !== tagToRemove);
                    }
                });
            }
        }, 100);

        // Open the CustomModal
        CustomModal({
            title: 'New Announcement',
            content: formContent,
            size: 'medium',
            closeOnOverlayClick: false,
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
                                    const hashtag = document.getElementById('modal-hashtag').value

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
                                        fd.append('hashtags', hashtag)
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

const modalInput = (type, placeholder, id, rows, value = '') => {
    const commonStyle = { width: '100%', padding: '10px', border: '1px solid #e8ecf0', borderRadius: '8px', fontFamily: 'inherit', marginBottom: '10px' }
    if (type === 'textarea') {
        return $({
            tag: 'textarea',
            att: { id: id, placeholder: placeholder, rows: rows || 4, value: value },
            style: commonStyle
        })
    }
    return $({
        tag: 'input',
        att: { type: type, id: id, placeholder: placeholder, value: value },
        style: commonStyle
    })
}
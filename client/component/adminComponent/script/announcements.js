import { $, CustomModal, DragDropUpload, Toast, Waiting } from '../../../lib/lib.js'

export const Announcements = () => {
    let contentContainer
    let currentType = 'announcement' // 'announcement' or 'news'
    let addButton
    let tabButtons = [] 

    const fetchData = async (container, type = currentType) => {
        const loader = Waiting()
        document.body.appendChild(loader)

        if (addButton) {
            addButton.textContent = type === 'news' ? '+ Add News/Update' : '+ New Announcement'
        }

        if (tabButtons.length === 2) {
            const [announcementBtn, newsBtn] = tabButtons;
            
            if (type === 'announcement') {
                announcementBtn.style.backgroundColor = '#f8fafc';
                announcementBtn.style.color = '#1e293b';
                announcementBtn.style.borderColor = '#cbd5e1';
                announcementBtn.style.fontWeight = '600';
                
                newsBtn.style.backgroundColor = 'transparent';
                newsBtn.style.color = '#64748b';
                newsBtn.style.borderColor = 'transparent';
                newsBtn.style.fontWeight = '500';
            } 
            else if (type === 'news') {
                newsBtn.style.backgroundColor = '#f8fafc';
                newsBtn.style.color = '#1e293b';
                newsBtn.style.borderColor = '#cbd5e1';
                newsBtn.style.fontWeight = '600';
                
                announcementBtn.style.backgroundColor = 'transparent';
                announcementBtn.style.color = '#64748b';
                announcementBtn.style.borderColor = 'transparent';
                announcementBtn.style.fontWeight = '500';
            }
        }

        try {
            const formData = new FormData()
            formData.append('action', 'getAll')
            formData.append('type', type)

            const res = await fetch('/announcements', { method: 'POST', body: formData })
            const json = await res.json()

            if (loader.parentNode) {
                loader.parentNode.removeChild(loader)
            }

            if (json.status) {
                container.innerHTML = ''
                renderTable(container, json.data)
            }
        } catch (error) {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader)
            }
            console.error("Error fetching data:", error)
            Toast.error("Failed to load data.")
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
                fetchData(container, currentType)
            } else {
                Toast.error(json.message || "Failed to update visibility.")
            }
        } catch (error) {
            console.error("Error toggling visibility:", error)
            Toast.error("An error occurred while updating visibility.")
        }
    }

    const fetchById = async (id) => {
        try {
            const formData = new FormData();
            formData.append('action', 'getById');
            formData.append('id', id);

            const res = await fetch('/announcements', { method: 'POST', body: formData });
            const json = await res.json();

            if (json.status && json.data) {
                return json.data;
            } else {
                Toast.error(json.message || "Failed to fetch data.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching by ID:", error);
            Toast.error("An error occurred while fetching data.");
            return null;
        }
    };

    const renderTable = (container, data) => {
        const tableWrapper = $({
            tag: 'div',
            style: { 
                background: '#ffffff',
                borderRadius: '14px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
                border: '1px solid #e2e8f0',
                overflow: 'hidden' 
            }
        })

        const headerRow = $({
            tag: 'div',
            style: { 
                display: 'grid', 
                gridTemplateColumns: '30px 2fr 1fr 1fr 100px 100px 140px', 
                background: '#f8fafc', 
                padding: '12px 20px', 
                fontWeight: '600', 
                borderBottom: '1px solid #e2e8f0', 
                color: '#475569',
                fontSize: '0.8rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
            },
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

        data.forEach((ann, index) => {
            let badgeColor = '#64748b'
            let badgeBg = '#f1f5f9'
            
            if (ann.status === 'Upcoming') { 
                badgeColor = '#0ea5e9'; 
                badgeBg = '#f0f9ff'; 
            }
            if (ann.status === 'Ongoing') { 
                badgeColor = '#22c55e'; 
                badgeBg = '#f0fdf4'; 
            }

            const row = $({
                tag: 'div',
                style: { 
                    display: 'grid', 
                    gridTemplateColumns: '30px 2fr 1fr 1fr 100px 100px 140px', 
                    padding: '12px 20px', 
                    borderBottom: '1px solid #f1f5f9', 
                    alignItems: 'center', 
                    transition: 'all 0.15s ease',
                    fontSize: '0.9rem'
                },
                child: [
                    $({ tag: 'span', text: index + 1, style: { color: '#94a3b8', textAlign: 'center', fontSize: '0.8rem' } }),
                    $({ tag: 'span', text: ann.title, style: { fontWeight: '500', color: '#1e293b' } }),
                    $({ tag: 'span', text: ann.event_date, style: { color: '#64748b' } }),
                    $({ tag: 'span', text: ann.venue, style: { color: '#64748b' } }),
                    $({ 
                        tag: 'span', 
                        text: ann.status, 
                        style: { 
                            background: badgeBg, 
                            color: badgeColor, 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.7rem', 
                            fontWeight: '600', 
                            textAlign: 'center', 
                            display: 'inline-block', 
                            width: 'fit-content', 
                            justifySelf: 'center',
                            letterSpacing: '0.3px'
                        }
                    }),
                    // Modern Toggle Switch (Simplified minimalist)
                    $({
                        tag: 'div',
                        style: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
                        child: [
                            $({
                                tag: 'label',
                                style: { position: 'relative', display: 'inline-block', width: '40px', height: '22px', cursor: 'pointer' },
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
                                            backgroundColor: ann.is_visible == 1 ? '#0ea5e9' : '#cbd5e1',
                                            transition: '.25s ease',
                                            borderRadius: '22px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                style: {
                                                    position: 'absolute',
                                                    content: '""',
                                                    height: '16px',
                                                    width: '16px',
                                                    left: ann.is_visible == 1 ? '20px' : '3px',
                                                    bottom: '3px',
                                                    backgroundColor: 'white',
                                                    transition: '.25s ease',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        style: { display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' },
                        child: [
                            // Edit Button (Minimalist)
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-pen-to-square' },
                                style: {
                                    padding: '6px',
                                    backgroundColor: 'transparent',
                                    color: '#94a3b8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.15s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => openEditModal(ann.id)
                                },
                                mouseenter: (e) => { e.target.style.color = '#0ea5e9'; e.target.style.backgroundColor = '#f0f9ff'; },
                                mouseleave: (e) => { e.target.style.color = '#94a3b8'; e.target.style.backgroundColor = 'transparent'; }
                            }),
                            // Delete Button (Minimalist)
                            $({
                                tag: 'button',
                                att: { className: 'fa-solid fa-trash-can' },
                                style: {
                                    padding: '6px',
                                    backgroundColor: 'transparent',
                                    color: '#94a3b8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.15s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: () => deleteRecord(ann.id, container)
                                },
                                mouseenter: (e) => { e.target.style.color = '#ef4444'; e.target.style.backgroundColor = '#fef2f2'; },
                                mouseleave: (e) => { e.target.style.color = '#94a3b8'; e.target.style.backgroundColor = 'transparent'; }
                            })
                        ]
                    })
                ],
                event: {
                    type: 'mouseenter',
                    method: (e) => { e.currentTarget.style.backgroundColor = '#fafbfc'; e.currentTarget.style.borderColor = '#e2e8f0'; }
                },
                event2: {
                    type: 'mouseleave',
                    method: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }
                }
            })
            tableWrapper.appendChild(row)
        })

        container.appendChild(tableWrapper)
    }

    // --- DELETE RECORD ---
    const deleteRecord = async (id, container) => {
        if (!confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
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
                Toast.success('Record deleted successfully!');
                fetchData(container, currentType);
            } else {
                Toast.error(json.message || 'Failed to delete record.');
            }
        } catch (error) {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
            console.error('Error deleting record:', error);
            Toast.error('An error occurred while deleting the record.');
        }
    };

    const openEditModal = async (id) => {
        const loader = Waiting();
        document.body.appendChild(loader);

        const record = await fetchById(id);

        if (loader.parentNode) loader.parentNode.removeChild(loader);

        if (!record) return;

        let editHashtags = record.hashtags ? record.hashtags.split(',').filter(t => t.trim() !== '') : [];
        let fileUploadComponent = null;
        let existingGalleryImages = record.gallery_images || [];
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

        const formContent = $({
            tag: 'div',
            style: { 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                padding: '4px 0'
            },
            child: [
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Headline / Short Title', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. CAPSU Advances Research Excellence', 'edit-modal-title', 1, record.title)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Venue', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. Via Zoom Teleconference', 'edit-modal-venue', 1, record.venue)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Date', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. August 11, 2026', 'edit-modal-date', 1, record.event_date)
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Full Article Body / Description', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('textarea', 'Write the full details here...', 'edit-modal-body', 6, record.body)
                    ]
                }),
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'label', text: 'Hashtags (Press Enter to add)', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '8px' } }),
                        $({
                            tag: 'input',
                            att: { type: 'text', id: 'edit-modal-hashtag', placeholder: 'e.g. #RiseCAPSU' },
                            style: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit', transition: 'border-color 0.15s ease' },
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
                                                        style: { background: '#f1f5f9', color: '#0ea5e9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginRight: '8px', fontWeight: '500' }
                                                    }));
                                                }
                                            }
                                            e.target.value = '';
                                        }
                                    }
                                },
                                focus: (e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; },
                                blur: (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
                            }
                        }),
                        $({ tag: 'div', att: { id: 'edit-modal-hashtag-display' }, style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' } })
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Facebook Link', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. https://www.facebook.com/share/...', 'edit-modal-fb', 1, record.facebook_link || '')
                    ]
                }),
                $({
                    tag: 'div',
                    att: { id: 'edit-photo-upload-wrapper' },
                    style: { marginTop: '8px', border: '1px dashed #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fafbfc' },
                    elementHandler: (el) => {
                        fileUploadComponent = DragDropUpload({
                            label: 'Replace Photos (Leave empty to keep existing)',
                            accept: 'image/*',
                            multiple: true,
                            description: 'Drag & drop images here or click to browse',
                            showPreview: true,
                            maxSizeMB: 10,
                            existingImages: existingGalleryImages,
                            onFileRemove: (removedImage, index, newSavedImages) => {
                                if (removedImage && removedImage.id) {
                                    imagesToDelete.push(removedImage.id);
                                }
                                existingGalleryImages = newSavedImages;
                            }
                        });
                        el.appendChild(fileUploadComponent.element);
                    }
                })
            ]
        });

        setTimeout(() => {
            const display = document.getElementById('edit-modal-hashtag-display');
            if (display) {
                editHashtags.forEach(tag => {
                    display.appendChild($({
                        tag: 'span',
                        text: tag,
                        style: { background: '#f1f5f9', color: '#0ea5e9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginRight: '8px', fontWeight: '500' }
                    }));
                });
            }
        }, 100);

        CustomModal({
            title: 'Edit Record',
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
                            style: { padding: '8px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease' },
                            event: { type: 'click', method: closeModal },
                            mouseenter: (e) => { e.target.style.backgroundColor = '#e2e8f0'; },
                            mouseleave: (e) => { e.target.style.backgroundColor = '#f1f5f9'; }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save Changes',
                            style: { padding: '8px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease' },
                            event: {
                                type: 'click',
                                method: async () => {
                                    const title = document.getElementById('edit-modal-title').value;
                                    const venue = document.getElementById('edit-modal-venue').value;
                                    const date = document.getElementById('edit-modal-date').value;
                                    const body = document.getElementById('edit-modal-body').value;
                                    const fb = document.getElementById('edit-modal-fb').value;
                                    const editHashtag = document.getElementById('edit-modal-hashtag').value
                                    
                                    if (!title || !date) {
                                        Toast.error("Headline and Date are required.");
                                        return;
                                    }

                                    const loader = Waiting();
                                    document.body.appendChild(loader);

                                    try {
                                        const fd = new FormData();
                                        fd.append('action', 'update');
                                        fd.append('id', record.id);
                                        fd.append('title', title);
                                        fd.append('event_date', date);
                                        fd.append('venue', venue);
                                        fd.append('body', body);
                                        fd.append('hashtags', editHashtags);
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
                                            fd.append('existing_images_json', JSON.stringify(savedImages));
                                        }

                                        const res = await fetch('/announcements', { method: 'POST', body: fd });
                                        const json = await res.json();

                                        if (loader.parentNode) loader.parentNode.removeChild(loader);

                                        if (json.status) {
                                            Toast.success('Record updated successfully!');
                                            closeModal();
                                            fetchData(contentContainer, currentType);
                                        } else {
                                            Toast.error(json.message || 'Failed to update record.');
                                        }
                                    } catch (error) {
                                        if (loader.parentNode) loader.parentNode.removeChild(loader);
                                        console.error("Error updating record:", error);
                                        Toast.error("An error occurred while updating the record.");
                                    }
                                }
                            },
                            mouseenter: (e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(14,165,233,0.25)'; e.target.style.backgroundColor = '#0284c7'; },
                            mouseleave: (e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#0ea5e9'; }
                        })
                    ]
                })
            }
        });
    };

    const openCreateModal = (type) => {
        let hashtags = []
        let fileUploadComponent = null

        const label = type === 'news' ? 'New News/Update' : 'New Announcement';
        const titlePlaceholder = type === 'news' ? 'e.g. CAPSU RDE Launches New Grant Cycle' : 'e.g. CAPSU Advances Research Excellence';
        const venuePlaceholder = type === 'news' ? 'e.g. CAPSU Main Campus' : 'e.g. Via Zoom Teleconference';
        const datePlaceholder = type === 'news' ? 'e.g. September 15, 2026' : 'e.g. August 11, 2026';

        const formContent = $({
            tag: 'div',
            style: { 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                padding: '4px 0'
            },
            child: [
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Headline / Short Title', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', titlePlaceholder, 'modal-title')
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Venue', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', venuePlaceholder, 'modal-venue')
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Date', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', datePlaceholder, 'modal-date')
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Full Article Body / Description', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('textarea', 'Write the full details here...', 'modal-body', 6)
                    ]
                }),
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'label', text: 'Hashtags (Press Enter to add, Click to remove)', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '8px' } }),
                        $({
                            tag: 'input',
                            att: { type: 'text', id: 'modal-hashtag', placeholder: 'e.g. #RiseCAPSU' },
                            style: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit', transition: 'border-color 0.15s ease' },
                            event: {
                                type: 'keydown',
                                method: (e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const rawTag = e.target.value.trim()
                                        if (rawTag !== '') {
                                            const formattedTag = rawTag.startsWith('#') ? rawTag : '#' + rawTag
                                            if (!hashtags.includes(formattedTag)) {
                                                hashtags.push(formattedTag)
                                                const display = document.getElementById('modal-hashtag-display')
                                                if (display) {
                                                    display.appendChild($({
                                                        tag: 'span',
                                                        text: formattedTag,
                                                        style: { 
                                                            background: '#f1f5f9', 
                                                            color: '#0ea5e9', 
                                                            padding: '4px 12px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.85rem', 
                                                            marginRight: '8px',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            transition: 'all 0.15s ease',
                                                            fontWeight: '500'
                                                        }
                                                    }))
                                                }
                                            }
                                            e.target.value = ''
                                        }
                                    }
                                },
                                focus: (e) => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; },
                                blur: (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }
                            }
                        }),
                        $({ 
                            tag: 'div', 
                            att: { id: 'modal-hashtag-display' }, 
                            style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' } 
                        })
                    ]
                }),
                $({
                    tag: 'div', child: [
                        $({ tag: 'label', text: 'Facebook Link', style: { display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '6px' } }),
                        modalInput('text', 'e.g. https://www.facebook.com/share/...', 'modal-fb')
                    ]
                }),
                $({
                    tag: 'div',
                    att: { id: 'photo-upload-wrapper' },
                    style: { marginTop: '8px', border: '1px dashed #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fafbfc' },
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

        setTimeout(() => {
            const display = document.getElementById('modal-hashtag-display');
            if (display) {
                display.addEventListener('click', (e) => {
                    const target = e.target;
                    if (target.tagName === 'SPAN' && target.textContent.startsWith('#')) {
                        const tagToRemove = target.textContent;
                        target.remove();
                        hashtags = hashtags.filter(t => t !== tagToRemove);
                    }
                });
            }
        }, 100);

        CustomModal({
            title: label,
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
                            style: { padding: '8px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease' },
                            event: { type: 'click', method: closeModal },
                            mouseenter: (e) => { e.target.style.backgroundColor = '#e2e8f0'; },
                            mouseleave: (e) => { e.target.style.backgroundColor = '#f1f5f9'; }
                        }),
                        $({
                            tag: 'button',
                            text: 'Publish',
                            style: { padding: '8px 24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s ease' },
                            event: {
                                type: 'click',
                                method: async () => {
                                    const title = document.getElementById('modal-title').value
                                    const venue = document.getElementById('modal-venue').value
                                    const date = document.getElementById('modal-date').value
                                    const body = document.getElementById('modal-body').value
                                    const fb = document.getElementById('modal-fb').value
                                    const hashtagsInput = document.getElementById('modal-hashtag').value

                                    if (!title || !date) {
                                        Toast.error("Headline and Date are required.")
                                        return
                                    }

                                    const loader = Waiting()
                                    document.body.appendChild(loader)

                                    try {
                                        const fd = new FormData()
                                        fd.append('action', 'create')
                                        fd.append('type', type) 
                                        fd.append('title', title)
                                        fd.append('event_date', date)
                                        fd.append('venue', venue)
                                        fd.append('body', body)
                                        fd.append('hashtags', hashtagsInput)
                                        fd.append('facebook_link', fb)

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
                                            Toast.success(json.message || "Created successfully!")
                                            closeModal()
                                            fetchData(contentContainer, currentType)
                                        } else {
                                            Toast.error(json.message || "Failed to create record.")
                                        }
                                    } catch (error) {
                                        if (loader.parentNode) {
                                            loader.parentNode.removeChild(loader)
                                        }
                                        console.error("Error creating record:", error)
                                        Toast.error("An error occurred while creating the record.")
                                    }
                                }
                            },
                            mouseenter: (e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(14,165,233,0.25)'; e.target.style.backgroundColor = '#0284c7'; },
                            mouseleave: (e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#0ea5e9'; }
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
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '12px' },
                child: [
                    // Modern Pill Tabs
                    $({
                        tag: 'div',
                        style: { display: 'flex', gap: '4px', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '12px' },
                        child: [
                            $({
                                tag: 'button',
                                text: '📢 Announcements',
                                style: { 
                                    padding: '8px 16px', 
                                    backgroundColor: currentType === 'announcement' ? '#f8fafc' : 'transparent',
                                    color: currentType === 'announcement' ? '#1e293b' : '#64748b',
                                    border: currentType === 'announcement' ? '1px solid #cbd5e1' : '1px solid transparent',
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.15s ease',
                                    boxShadow: currentType === 'announcement' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                },
                                elementHandler: (el) => {
                                    tabButtons[0] = el; 
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        if (currentType !== 'announcement') {
                                            currentType = 'announcement';
                                            fetchData(contentContainer, currentType);
                                        }
                                    }
                                }
                            }),
                            $({
                                tag: 'button',
                                text: '📰 News & Updates',
                                style: { 
                                    padding: '8px 16px', 
                                    backgroundColor: currentType === 'news' ? '#f8fafc' : 'transparent',
                                    color: currentType === 'news' ? '#1e293b' : '#64748b',
                                    border: currentType === 'news' ? '1px solid #cbd5e1' : '1px solid transparent',
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.15s ease',
                                    boxShadow: currentType === 'news' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                },
                                elementHandler: (el) => {
                                    tabButtons[1] = el; 
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        if (currentType !== 'news') {
                                            currentType = 'news';
                                            fetchData(contentContainer, currentType);
                                        }
                                    }
                                }
                            })
                        ]
                    }),

                    $({
                        tag: 'button',
                        text: currentType === 'news' ? '+ Add News/Update' : '+ New Announcement',
                        style: { 
                            padding: '8px 18px', 
                            background: '#0ea5e9', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: '500',
                            fontSize: '0.85rem',
                            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                        },
                        elementHandler: (el) => {
                            addButton = el;
                            
                            el.addEventListener('mouseenter', () => {
                                el.style.transform = 'translateY(-1px)';
                                el.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.25)';
                                el.style.backgroundColor = '#0284c7';
                            });
                            
                            el.addEventListener('mouseleave', () => {
                                el.style.transform = 'translateY(0)';
                                el.style.boxShadow = 'none';
                                el.style.backgroundColor = '#0ea5e9';
                            });
                        },
                        event: { type: 'click', method: () => openCreateModal(currentType) }
                    })
                ]
            }),
            $({
                tag: 'div',
                elementHandler: async (el) => {
                    contentContainer = el
                    fetchData(el, currentType)
                }
            })
        ]
    })
}

const modalInput = (type, placeholder, id, rows, value = '') => {
    const commonStyle = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit', marginBottom: '10px' }
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
import { $, DeleteConfirmModal } from "../../../lib/lib.js";

export const Utilization = () => {
    let mainTableContainer;
    let tableBody;

    // Columns for utilization and extension programs
    const columns = [
        { field: 'researchTitle', header: 'Research Title', width: '250px', type: 'search', required: false },
        { field: 'programTitle', header: 'Program Title', width: '300px', type: 'text', required: true },
        { field: 'dateConducted', header: 'Date Conducted', width: '150px', type: 'date', required: true },
        { field: 'traineesCount', header: 'No. of Trainees/Beneficiaries', width: '180px', type: 'number', required: true },
        { field: 'supportLinks', header: 'Link to Support Documents', width: '160px', type: 'url', required: false },
        { field: 'supportDocs', header: 'Upload Support Documents', width: '160px', type: 'file', required: false },
        { field: 'actions', header: 'Actions', width: '80px', type: 'actions', required: false }
    ];

    let selectedResearchId = null;
    let selectedEndorsementId = null;
    let selectedResearchTitle = '';

    let modalOverlay;
    let searchTimeout;
    const getMainContainer = (el) => {
        mainTableContainer = el;
    };

    // Modal Helpers
    const closeModal = () => {
        if (modalOverlay) {
            modalOverlay.style.opacity = '0';
            setTimeout(() => {
                if (modalOverlay && modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300);
        }
    };

    const openProgramModal = (data = null) => {
        if (data) {
            selectedResearchId = data.research_id;
            selectedEndorsementId = data.endorsement_id;
            selectedResearchTitle = data.research_title || '';
        } else {
            selectedResearchId = null;
            selectedEndorsementId = null;
            selectedResearchTitle = '';
        }
        const modal = createProgramModal(data);
        document.body.appendChild(modal);
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    };

    const openAddProgramModal = () => openProgramModal();

    const openEditProgramModal = (data) => openProgramModal(data);

    const createFormField = (column, initialValue = null) => {
        const fieldId = `field-${column.field}`;
        const labelStyle = {
            display: 'block',
            marginBottom: '8px',
            color: '#aaa',
            fontSize: '13px',
            fontWeight: '500'
        };

        const inputBaseStyle = {
            width: '100%',
            padding: '12px',
            backgroundColor: '#333',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'borderColor 0.2s ease'
        };

        const label = $({
            tag: 'label',
            att: { htmlFor: fieldId },
            style: labelStyle,
            child: [
                $({ tag: 'span', text: column.header })
            ]
        });

        // Add asterisk if required
        if (column.required) {
            label.appendChild($({ tag: 'span', text: ' *', style: { color: 'deepskyblue', marginLeft: '4px' } }));
        }

        // Special handling for research title search
        if (column.field === 'researchTitle') {
            const resultsDropdown = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    width: '100%',
                    backgroundColor: '#333',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: '1000',
                    display: 'none',
                    marginTop: '4px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
                }
            });

            const searchInput = $({
                tag: 'input',
                att: {
                    type: 'text',
                    id: fieldId,
                    placeholder: 'Search for accepted research title...',
                    autoComplete: 'off',
                    value: initialValue || selectedResearchTitle
                },
                style: inputBaseStyle
            });

            searchInput.addEventListener('focus', () => { searchInput.style.borderColor = 'deepskyblue'; });
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.trim();
                if (term.length < 2) {
                    resultsDropdown.style.display = 'none';
                    return;
                }

                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const body = new FormData();
                    body.append('action', 'search_research');
                    body.append('search', term);

                    fetch('/utilization', { method: 'POST', body })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.data.length > 0) {
                                resultsDropdown.innerHTML = '';
                                data.data.forEach(res => {
                                    const item = $({
                                        tag: 'div',
                                        style: {
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #3a3a3a',
                                            fontSize: '13px',
                                            color: '#ddd',
                                            transition: 'background 0.2s'
                                        },
                                        child: [
                                            $({ tag: 'div', text: res.title, style: { fontWeight: '600', marginBottom: '4px' } }),
                                            $({ tag: 'div', text: res.author, style: { fontSize: '11px', color: '#888' } })
                                        ]
                                    });

                                    item.addEventListener('mouseenter', () => { item.style.backgroundColor = '#444'; });
                                    item.addEventListener('mouseleave', () => { item.style.backgroundColor = 'transparent'; });
                                    item.addEventListener('click', () => {
                                        searchInput.value = res.title;
                                        selectedResearchId = res.id;
                                        selectedEndorsementId = res.endorsement_id;
                                        selectedResearchTitle = res.title;
                                        resultsDropdown.style.display = 'none';
                                        searchInput.style.borderColor = '#4caf50';
                                    });
                                    resultsDropdown.appendChild(item);
                                });
                                resultsDropdown.style.display = 'block';
                            } else {
                                resultsDropdown.style.display = 'none';
                            }
                        });
                }, 400);
            });

            // Close dropdown on click outside
            document.addEventListener('click', (e) => {
                if (!searchContainer.contains(e.target)) resultsDropdown.style.display = 'none';
            });

            const searchContainer = $({
                tag: 'div',
                style: { position: 'relative', display: 'flex', flexDirection: 'column' },
                child: [searchInput, resultsDropdown]
            });

            return $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                child: [label, searchContainer]
            });
        }

        // Special handling for multiple support document links
        if (column.field === 'supportLinks') {
            const linksContainer = $({
                tag: 'div',
                att: { id: 'support-links-container' },
                style: { display: 'flex', flexDirection: 'column', gap: '8px' }
            });

            const createLinkInputRow = (value = '') => {
                const input = $({
                    tag: 'input',
                    att: {
                        type: 'url',
                        className: 'support-doc-link-input',
                        placeholder: 'https://...',
                        value: value
                    },
                    style: { ...inputBaseStyle, flex: '1' }
                });

                input.addEventListener('focus', () => { input.style.borderColor = 'deepskyblue'; });
                input.addEventListener('blur', () => { input.style.borderColor = '#444'; });

                const removeBtn = $({
                    tag: 'button',
                    style: {
                        backgroundColor: 'transparent', border: 'none',
                        color: '#666', cursor: 'pointer', padding: '8px',
                        fontSize: '14px', transition: 'color 0.2s ease'
                    },
                    child: [$({ tag: 'span', att: { className: 'fa-solid fa-trash-can' } })]
                });
                removeBtn.addEventListener('click', () => {
                    const rows = linksContainer.querySelectorAll('.link-input-row');
                    if (rows.length > 1) {
                        removeBtn.closest('.link-input-row').remove();
                    } else {
                        removeBtn.closest('.link-input-row').querySelector('input').value = '';
                    }
                });
                removeBtn.addEventListener('mouseenter', () => { removeBtn.style.color = '#ff4d4d'; });
                removeBtn.addEventListener('mouseleave', () => { removeBtn.style.color = '#666'; });

                return $({
                    tag: 'div',
                    att: { className: 'link-input-row' },
                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                    child: [input, removeBtn]
                });
            };

            const addLinkBtn = $({
                tag: 'button',
                style: {
                    alignSelf: 'flex-start', backgroundColor: 'transparent',
                    border: '1px dashed #555', borderRadius: '8px',
                    color: '#888', padding: '8px 16px', fontSize: '12px',
                    cursor: 'pointer', marginTop: '4px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                },
                child: [
                    $({ tag: 'span', att: { className: 'fa-solid fa-plus-circle' } }),
                    $({ tag: 'span', text: 'Add another link' })
                ]
            });
            addLinkBtn.addEventListener('click', () => { linksContainer.appendChild(createLinkInputRow()); });
            addLinkBtn.addEventListener('mouseenter', () => {
                addLinkBtn.style.borderColor = 'deepskyblue';
                addLinkBtn.style.color = 'deepskyblue';
                addLinkBtn.style.backgroundColor = 'rgba(0,191,255,0.05)';
            });
            addLinkBtn.addEventListener('mouseleave', () => {
                addLinkBtn.style.borderColor = '#555';
                addLinkBtn.style.color = '#888';
                addLinkBtn.style.backgroundColor = 'transparent';
            });

            if (initialValue) {
                const existingLinks = initialValue.split(',').map(l => l.trim()).filter(l => l && l.startsWith('http') && !l.includes('drive.google.com'));
                if (existingLinks.length > 0) {
                    existingLinks.forEach(link => {
                        linksContainer.appendChild(createLinkInputRow(link));
                    });
                } else {
                    linksContainer.appendChild(createLinkInputRow());
                }
            } else {
                linksContainer.appendChild(createLinkInputRow());
            }

            return $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                child: [label, linksContainer, addLinkBtn]
            });
        }

        // Special handling for support document file uploads
        if (column.field === 'supportDocs') {
            const fileList = [];
            let existingFiles = initialValue ? JSON.parse(initialValue) : [];
            let keptFiles = [...existingFiles];
            let deletedFileIds = [];

            const fileListContainer = $({
                tag: 'div',
                att: { id: 'support-docs-file-list' },
                style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }
            });

            const updateFileListUI = () => {
                fileListContainer.innerHTML = '';

                // Show kept existing files
                keptFiles.forEach((fileMeta, idx) => {
                    const row = $({
                        tag: 'div',
                        att: { className: 'file-list-row existing-file' },
                        style: {
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', backgroundColor: 'rgba(76, 175, 80, 0.05)',
                            borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.2)'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-cloud' }, style: { color: '#4caf50', fontSize: '16px' } }),
                            $({
                                tag: 'div', style: { flex: '1', overflow: 'hidden' },
                                child: [
                                    $({ tag: 'div', text: fileMeta.original_name || fileMeta.file_name, style: { color: '#ddd', fontSize: '13px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } }),
                                    $({ tag: 'div', text: 'Existing Document (Stored in Cloud)', style: { color: '#666', fontSize: '10px', marginTop: '2px' } })
                                ]
                            })
                        ]
                    });

                    const removeBtn = $({
                        tag: 'button',
                        style: {
                            backgroundColor: 'transparent', border: 'none',
                            color: '#666', cursor: 'pointer', padding: '6px', fontSize: '13px',
                            transition: 'color 0.2s'
                        },
                        child: [$({ tag: 'span', att: { className: 'fa-solid fa-trash-can' } })]
                    });
                    removeBtn.addEventListener('click', () => {
                        deletedFileIds.push(fileMeta.file_id);
                        keptFiles.splice(idx, 1);
                        updateFileListUI();
                    });
                    removeBtn.addEventListener('mouseenter', () => { removeBtn.style.color = '#ff4d4d'; });
                    removeBtn.addEventListener('mouseleave', () => { removeBtn.style.color = '#666'; });
                    row.appendChild(removeBtn);

                    fileListContainer.appendChild(row);
                });

                // Show newly added files
                fileList.forEach((file, idx) => {
                    const row = $({
                        tag: 'div',
                        att: { className: 'file-list-row new-file' },
                        style: {
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', backgroundColor: 'rgba(0, 191, 255, 0.05)',
                            borderRadius: '8px', border: '1px solid rgba(0, 191, 255, 0.2)'
                        },
                        child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' }, style: { color: '#e74c3c', fontSize: '16px' } }),
                            $({
                                tag: 'div', style: { flex: '1', overflow: 'hidden' },
                                child: [
                                    $({ tag: 'div', text: file.name, style: { color: '#ddd', fontSize: '13px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } }),
                                    $({ tag: 'div', text: `${(file.size / 1024).toFixed(1)} KB - New Upload`, style: { color: '#888', fontSize: '11px', marginTop: '2px' } })
                                ]
                            })
                        ]
                    });

                    const removeBtn = $({
                        tag: 'button',
                        style: {
                            backgroundColor: 'transparent', border: 'none',
                            color: '#666', cursor: 'pointer', padding: '6px', fontSize: '13px'
                        },
                        child: [$({ tag: 'span', att: { className: 'fa-solid fa-xmark' } })]
                    });
                    removeBtn.addEventListener('click', () => {
                        fileList.splice(idx, 1);
                        updateFileListUI();
                    });
                    removeBtn.addEventListener('mouseenter', () => { removeBtn.style.color = '#ff4d4d'; });
                    removeBtn.addEventListener('mouseleave', () => { removeBtn.style.color = '#666'; });
                    row.appendChild(removeBtn);

                    fileListContainer.appendChild(row);
                });
            };

            const hiddenInput = $({
                tag: 'input',
                att: { type: 'file', id: fieldId, accept: '.pdf', multiple: true },
                style: { display: 'none' }
            });
            hiddenInput.addEventListener('change', (e) => {
                Array.from(e.target.files).forEach(f => {
                    if (f.type === 'application/pdf') fileList.push(f);
                });
                updateFileListUI();
                hiddenInput.value = '';
            });

            const dropZone = $({
                tag: 'div',
                att: { id: 'support-docs-drop-zone' },
                style: {
                    border: '2px dashed #444', borderRadius: '12px',
                    padding: '30px 20px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.3s ease',
                    backgroundColor: '#2d2d2d'
                },
                child: [
                    $({ tag: 'span', att: { className: 'fa-solid fa-cloud-arrow-up' }, style: { fontSize: '32px', color: '#555', marginBottom: '10px', display: 'block' } }),
                    $({ tag: 'div', text: initialValue ? 'Click or drag PDF files to add/replace support documents' : 'Click or drag PDF files here', style: { color: '#888', fontSize: '14px', marginBottom: '4px' } }),
                    $({ tag: 'div', text: 'You can upload multiple documents', style: { color: '#555', fontSize: '12px' } })
                ]
            });

            dropZone.addEventListener('click', () => hiddenInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'deepskyblue';
                dropZone.style.backgroundColor = 'rgba(0,191,255,0.05)';
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = '#444';
                dropZone.style.backgroundColor = '#2d2d2d';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#444';
                dropZone.style.backgroundColor = '#2d2d2d';
                Array.from(e.dataTransfer.files).forEach(f => {
                    if (f.type === 'application/pdf') fileList.push(f);
                });
                updateFileListUI();
            });

            dropZone._getFiles = () => fileList;
            dropZone._getKeptMetadata = () => JSON.stringify(keptFiles);

            // Initial UI update if there are existing files
            if (existingFiles.length > 0) {
                setTimeout(updateFileListUI, 10);
            }

            return $({
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                child: [label, hiddenInput, dropZone, fileListContainer]
            });
        }


        const input = $({
            tag: 'input',
            att: {
                type: column.type || 'text',
                id: fieldId,
                placeholder: `Enter ${column.header.toLowerCase()}...`,
                required: !!column.required,
                value: initialValue || ''
            },
            style: inputBaseStyle
        });

        // Add event listeners directly as lib.js only supports one 'event' object
        input.addEventListener('focus', () => { input.style.borderColor = 'deepskyblue'; });
        input.addEventListener('blur', () => { input.style.borderColor = '#444'; });

        return $({
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column' },
            child: [label, input]
        });
    };


    const createProgramModal = (programData = null) => {
        const isEdit = !!programData;
        const fieldsContainer = $({
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '20px' }
        });

        columns.forEach(col => {
            if (col.type !== 'actions') {
                let initialValue = programData ? programData[col.field] : null;
                // Field mapping for researchTitle/research_title
                if (col.field === 'researchTitle' && programData) {
                    initialValue = programData.research_title || '';
                }
                // For supportDocs, we provide metadata for pre-filling
                if (col.field === 'supportDocs' && programData) {
                    initialValue = programData.supportDocsMetadata || null;
                }
                // For supportLinks, we might have merged URLs (manual + drive) in programData.supportDocs
                if (col.field === 'supportLinks' && programData) {
                    initialValue = programData['supportDocs'] || '';
                }
                fieldsContainer.appendChild(createFormField(col, initialValue));
            }
        });

        const modalHeader = $({
            tag: 'div',
            style: {
                padding: '24px',
                borderBottom: '1px solid #3a3a3a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-circle-plus' },
                            style: { color: isEdit ? '#f39c12' : 'deepskyblue', fontSize: '24px' }
                        }),
                        $({
                            tag: 'h2',
                            text: isEdit ? 'Edit Utilization Program' : 'Add Utilization Program',
                            style: { color: '#fff', margin: '0', fontSize: '20px', fontWeight: '600' }
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-times' },
                    style: { cursor: 'pointer', color: '#666', fontSize: '20px' },
                    event: {
                        type: 'click',
                        method: closeModal
                    }
                })
            ]
        });

        const cancelBtn = $({
            tag: 'button',
            text: 'Cancel',
            style: {
                padding: '10px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                color: '#aaa',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            event: { type: 'click', method: closeModal }
        });

        const saveBtn = $({
            tag: 'button',
            text: isEdit ? 'Update Program' : 'Save Program',
            style: {
                padding: '10px 32px',
                backgroundColor: isEdit ? '#f39c12' : 'deepskyblue',
                border: 'none',
                color: '#fff',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: isEdit ? '0 4px 12px rgba(243, 156, 18, 0.2)' : '0 4px 12px rgba(0, 191, 255, 0.2)'
            },
            event: {
                type: 'click',
                method: () => {
                    const formData = {};
                    let hasError = false;

                    columns.forEach(col => {
                        if (col.field === 'supportDocs') {
                            // Files are handled separately via FormData below
                        } else if (col.field === 'supportLinks') {
                            const linkInputs = document.querySelectorAll('.support-doc-link-input');
                            const links = Array.from(linkInputs)
                                .map(input => input.value.trim())
                                .filter(val => val !== '');
                            formData['supportLinks'] = links.join(', ');
                        } else if (col.field === 'researchTitle') {
                            formData['research_id'] = selectedResearchId;
                            formData['endorsement_id'] = selectedEndorsementId;
                        } else {
                            const input = document.getElementById(`field-${col.field}`);
                            if (input) {
                                formData[col.field] = input.value;
                                if (col.required && !input.value.trim()) {
                                    input.style.borderColor = '#ff4d4d';
                                    hasError = true;
                                }
                            }
                        }
                    });

                    if (hasError) {
                        console.warn('Please fill in all required fields');
                        return;
                    }

                    // Save to backend
                    const fetchBody = new FormData();
                    fetchBody.append('action', isEdit ? 'update' : 'add');
                    if (isEdit) fetchBody.append('id', programData.id);
                    Object.keys(formData).forEach(key => {
                        fetchBody.append(key, formData[key]);
                    });

                    // Append support document files
                    const dropZoneEl = document.getElementById('support-docs-drop-zone');
                    if (dropZoneEl) {
                        if (dropZoneEl._getFiles) {
                            const files = dropZoneEl._getFiles();
                            files.forEach(file => {
                                fetchBody.append('supportDocs[]', file);
                            });
                        }
                        if (isEdit && dropZoneEl._getKeptMetadata) {
                            fetchBody.append('keptFilesMetadata', dropZoneEl._getKeptMetadata());
                        }
                    }

                    saveBtn.disabled = true;
                    saveBtn.innerText = isEdit ? 'Updating...' : 'Saving...';

                    fetch('/utilization', {
                        method: 'POST',
                        body: fetchBody
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                closeModal();
                                fetchPrograms();
                            } else {
                                alert('Error: ' + data.message);
                                saveBtn.disabled = false;
                                saveBtn.innerText = isEdit ? 'Update Program' : 'Save Program';
                            }
                        })
                        .catch(err => {
                            alert('Failed to save program');
                            saveBtn.disabled = false;
                            saveBtn.innerText = isEdit ? 'Update Program' : 'Save Program';
                        });
                }
            }
        });

        const modalFooter = $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                borderTop: '1px solid #3a3a3a',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#252525'
            },
            child: [cancelBtn, saveBtn]
        });

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#2a2a2a',
                width: '90%',
                maxWidth: '500px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                overflow: 'hidden',
                border: '1px solid #3a3a3a'
            },
            child: [
                modalHeader,
                $({
                    tag: 'div',
                    style: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' },
                    child: [fieldsContainer]
                }),
                modalFooter
            ]
        });

        modalOverlay = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10000',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                backdropFilter: 'blur(8px)'
            },
            child: [modalContent]
        });

        return modalOverlay;
    };


    const getTableBody = (el) => {
        tableBody = el;
        fetchPrograms();
    };

    const fetchPrograms = (searchTerm = '') => {
        const body = new FormData();
        body.append('action', 'getAll');
        if (searchTerm) body.append('search', searchTerm);

        fetch('/utilization', {
            method: 'POST',
            body: body
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderTable(data.data);
                }
            })
            .catch(err => console.error('Fetch error:', err));
    };

    const renderTable = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        // Update record count in UI if it exists
        const countEl = document.querySelector('.record-count');
        if (countEl) countEl.innerText = `${data.length} programs`;

        if (data.length === 0) {
            // Create empty state row with proper colSpan
            const emptyStateRow = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        att: { colSpan: columns.length },
                        style: { border: 'none', padding: '0' },
                        child: [
                            $({
                                tag: 'div',
                                att: { className: 'empty-state' },
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '450px',
                                    width: '100%',
                                    color: '#888',
                                    fontFamily: 'Segoe UI, sans-serif',
                                    textAlign: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'relative',
                                            width: '200px',
                                            height: '200px',
                                            marginBottom: '24px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-hand-holding-heart' },
                                                style: {
                                                    fontSize: '100px',
                                                    color: 'deepskyblue',
                                                    opacity: 0.2,
                                                    position: 'absolute',
                                                    left: '0',
                                                    top: '20px',
                                                    transform: 'rotate(-5deg)'
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-people-arrows' },
                                                style: {
                                                    fontSize: '90px',
                                                    color: '#4caf50',
                                                    opacity: 0.2,
                                                    position: 'absolute',
                                                    right: '0',
                                                    bottom: '20px',
                                                    transform: 'rotate(10deg)'
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-seedling' },
                                                style: {
                                                    fontSize: '70px',
                                                    color: '#ff9800',
                                                    opacity: 0.25,
                                                    position: 'absolute',
                                                    left: '20px',
                                                    bottom: '0',
                                                    transform: 'rotate(-15deg)'
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-building' },
                                                style: {
                                                    fontSize: '60px',
                                                    color: '#e91e63',
                                                    opacity: 0.2,
                                                    position: 'absolute',
                                                    right: '30px',
                                                    top: '0',
                                                    transform: 'rotate(20deg)'
                                                }
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '80px',
                                                    height: '80px',
                                                    backgroundColor: 'rgba(0,191,255,0.1)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed deepskyblue',
                                                    animation: 'pulse 2s infinite'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: { className: 'fa-solid fa-chart-line' },
                                                        style: { fontSize: '30px', color: 'deepskyblue' }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'No Utilization / Extension Programs',
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
                                        text: 'Training programs, extension services, technology transfer, and community',
                                        style: {
                                            fontSize: '15px',
                                            opacity: 0.7,
                                            textAlign: 'center',
                                            lineHeight: '1.6'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'outreach activities benefiting industry and communities will be displayed here',
                                        style: {
                                            fontSize: '15px',
                                            opacity: 0.7,
                                            marginBottom: '30px',
                                            textAlign: 'center'
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
            tableBody.appendChild(emptyStateRow);
            return;
        }

        data.forEach(item => {
            tableBody.appendChild(DataRow(item));
        });
    };


    // Filter and search bar
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
                                    att: { className: 'fa-solid fa-hands-helping' },
                                    style: { color: 'deepskyblue', fontSize: '24px' }
                                }),
                                $({
                                    tag: 'h2',
                                    text: 'Utilization & Extension',
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
                                    text: '0 programs'
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    },
                    child: [
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
                                        placeholder: 'Search programs...',
                                        className: 'utilization-search-input'
                                    },
                                    style: {
                                        backgroundColor: '#333',
                                        border: '1px solid #444',
                                        borderRadius: '30px',
                                        padding: '10px 16px 10px 42px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        width: '260px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (e) => {
                                            clearTimeout(searchTimeout);
                                            searchTimeout = setTimeout(() => {
                                                fetchPrograms(e.target.value);
                                            }, 350);
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'button',
                            att: { className: 'add-program-btn' },
                            style: {
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '10px 20px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0, 191, 255, 0.2)'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-circle-plus' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add Program'
                                })
                            ],
                            event: {
                                type: 'click',
                                method: openAddProgramModal
                            }
                        })
                    ]
                })
            ]
        });
    };


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
                    whiteSpace: 'normal',
                    width: col.width,
                    minWidth: col.width,
                    position: 'sticky',
                    top: '0',
                    zIndex: '10',
                    fontFamily: 'Segoe UI, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    verticalAlign: 'middle'
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
                                const icon = e.currentTarget.querySelector('.fa-solid');
                                if (icon) icon.style.color = 'deepskyblue';
                            }
                        },
                        event2: {
                            type: 'mouseleave',
                            method: (e) => {
                                const icon = e.currentTarget.querySelector('.fa-solid');
                                if (icon) icon.style.color = '#555';
                            }
                        }
                    })
                ]
            });
        });

        return $({
            tag: 'thead',
            att: { className: 'utilization-table-header' },
            child: [
                $({
                    tag: 'tr',
                    child: headerCells
                })
            ]
        });
    };

    // Function to create document links (handles multiple)
    const createDocLinks = (linksStr) => {
        if (!linksStr || linksStr === '—') return $({ tag: 'span', text: '—' });

        const links = linksStr.split(',').map(l => l.trim()).filter(l => l !== '');
        if (links.length === 0) return $({ tag: 'span', text: '—' });

        return $({
            tag: 'div',
            style: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
            child: links.map((url, idx) => {
                let label = 'Doc';
                try {
                    const u = new URL(url);
                    label = u.hostname.replace('www.', '').split('.')[0];
                } catch (e) { }

                return $({
                    tag: 'a',
                    att: {
                        href: url,
                        target: '_blank',
                        className: 'doc-link',
                        title: url
                    },
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        backgroundColor: '#333',
                        borderRadius: '12px',
                        color: 'deepskyblue',
                        textDecoration: 'none',
                        fontSize: '11px',
                        border: '1px solid #444',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-file-pdf' },
                            style: { fontSize: '10px' }
                        }),
                        $({
                            tag: 'span',
                            text: links.length > 1 ? `${label} ${idx + 1}` : label
                        })
                    ],
                    event: {
                        type: 'mouseenter',
                        method: (e) => {
                            e.currentTarget.style.backgroundColor = '#404040';
                            e.currentTarget.style.borderColor = 'deepskyblue';
                        }
                    },
                    event2: {
                        type: 'mouseleave',
                        method: (e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.borderColor = '#444';
                        }
                    }
                });
            })
        });
    };

    // Dynamic data row
    const DataRow = (item) => {
        const cells = columns.map(col => {
            let cellContent = item[col.field] || '—';
            let cellStyle = {
                padding: '16px 12px',
                fontSize: '13px',
                color: '#ddd',
                borderBottom: '1px solid #444',
                whiteSpace: 'normal',
                width: col.width,
                minWidth: col.width,
                fontFamily: 'Segoe UI, sans-serif',
                verticalAlign: 'middle',
                wordBreak: 'break-word'
            };

            if (col.field === 'supportLinks') {
                const linksContainer = $({
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                });

                const linksStr = item.supportDocs || '';
                if (linksStr) {
                    const urls = linksStr.split(',').map(u => u.trim()).filter(u => u && u.startsWith('http'));
                    if (urls.length > 0) {
                        urls.forEach((url, idx) => {
                            const link = $({
                                tag: 'a',
                                att: { href: url, target: '_blank' },
                                style: {
                                    color: 'deepskyblue', textDecoration: 'none',
                                    fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '2px 0', transition: 'color 0.2s'
                                },
                                child: [
                                    $({ tag: 'span', att: { className: 'fa-solid fa-arrow-up-right-from-square' }, style: { fontSize: '10px' } }),
                                    $({ tag: 'span', text: `Link ${idx + 1}` })
                                ]
                            });
                            link.addEventListener('mouseenter', () => { link.style.color = '#fff'; });
                            link.addEventListener('mouseleave', () => { link.style.color = 'deepskyblue'; });
                            linksContainer.appendChild(link);
                        });
                    } else {
                        linksContainer.appendChild($({ tag: 'span', text: '—', style: { color: '#666' } }));
                    }
                } else {
                    linksContainer.appendChild($({ tag: 'span', text: '—', style: { color: '#666' } }));
                }

                return $({
                    tag: 'td',
                    style: { ...cellStyle, whiteSpace: 'normal', display: 'table-cell', verticalAlign: 'middle' },
                    child: [linksContainer]
                });
            }

            if (col.field === 'supportDocs') {
                const docsContainer = $({
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                });

                let metadata = [];
                try {
                    if (item.supportDocsMetadata) {
                        metadata = JSON.parse(item.supportDocsMetadata);
                    }
                } catch (e) { /* ignore parse errors */ }

                if (metadata.length > 0) {
                    metadata.forEach((fileMeta, idx) => {
                        const link = $({
                            tag: 'a',
                            att: { href: fileMeta.view_url, target: '_blank' },
                            style: {
                                color: 'deepskyblue', textDecoration: 'none',
                                fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '4px 0', transition: 'color 0.2s'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-file-pdf' }, style: { color: '#e74c3c', fontSize: '12px' } }),
                                $({ tag: 'span', text: fileMeta.file_name || `Document ${idx + 1}` })
                            ]
                        });
                        link.addEventListener('mouseenter', () => { link.style.color = '#fff'; });
                        link.addEventListener('mouseleave', () => { link.style.color = 'deepskyblue'; });
                        docsContainer.appendChild(link);
                    });
                } else if (item.supportDocs) {
                    // Fallback: render old comma-separated URLs
                    const urls = item.supportDocs.split(',').map(u => u.trim()).filter(u => u);
                    urls.forEach((url, idx) => {
                        const link = $({
                            tag: 'a',
                            att: { href: url, target: '_blank' },
                            style: { color: 'deepskyblue', textDecoration: 'none', fontSize: '12px' },
                            text: `Doc ${idx + 1}`
                        });
                        docsContainer.appendChild(link);
                    });
                } else {
                    docsContainer.appendChild($({ tag: 'span', text: '—', style: { color: '#666' } }));
                }

                return $({
                    tag: 'td',
                    style: { ...cellStyle, whiteSpace: 'normal', display: 'table-cell', verticalAlign: 'middle' },
                    child: [docsContainer]
                });
            }


            if (col.field === 'researchTitle') {
                cellContent = item['research_title'] || '—';
                cellStyle.color = cellContent === '—' ? '#666' : 'deepskyblue';
                cellStyle.fontSize = '12px';
            }

            if (col.field === 'dateConducted') {
                cellContent = formatUtilizationDate(item[col.field]);
            }

            if (col.field === 'traineesCount') {
                cellContent = `${item[col.field]} participants`;
            }

            if (col.field === 'actions') {
                const editBtn = $({
                    tag: 'button',
                    style: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f39c12',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [$({ tag: 'span', att: { className: 'fa-solid fa-pen-to-square' } })],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation();
                            openEditProgramModal(item);
                        }
                    }
                });

                editBtn.addEventListener('mouseenter', () => {
                    editBtn.style.backgroundColor = 'rgba(243, 156, 18, 0.1)';
                    editBtn.style.transform = 'scale(1.1)';
                });
                editBtn.addEventListener('mouseleave', () => {
                    editBtn.style.backgroundColor = 'transparent';
                    editBtn.style.transform = 'scale(1)';
                });

                const deleteBtn = $({
                    tag: 'button',
                    style: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f44336',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [$({ tag: 'span', att: { className: 'fa-solid fa-trash-can' } })],
                    event: {
                        type: 'click',
                        method: async (e) => {
                            e.stopPropagation();
                            const confirmed = await DeleteConfirmModal(
                                "Delete Program",
                                `Are you sure you want to delete the program "${item.programTitle}"?`
                            );

                            if (confirmed) {
                                const body = new FormData();
                                body.append('action', 'delete');
                                body.append('id', item.id);

                                try {
                                    const res = await fetch('/utilization', {
                                        method: 'POST',
                                        body: body
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        fetchPrograms();
                                    } else {
                                        alert('Delete failed: ' + data.message);
                                    }
                                } catch (err) {
                                    alert('Failed to delete program');
                                }
                            }
                        }
                    }
                });

                deleteBtn.addEventListener('mouseenter', () => {
                    deleteBtn.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
                    deleteBtn.style.transform = 'scale(1.1)';
                });
                deleteBtn.addEventListener('mouseleave', () => {
                    deleteBtn.style.backgroundColor = 'transparent';
                    deleteBtn.style.transform = 'scale(1)';
                });

                return $({
                    tag: 'td',
                    style: {
                        ...cellStyle,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        borderBottom: '1px solid #444'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center',
                                alignItems: 'center'
                            },
                            child: [editBtn, deleteBtn]
                        })
                    ]
                });
            }

            return $({
                tag: 'td',
                style: cellStyle,
                text: cellContent
            });
        });

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
                    e.currentTarget.style.backgroundColor = '#333';
                }
            },
            event2: {
                type: 'mouseleave',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#2d2d2d';
                }
            }
        });
    };

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
                        tableLayout: 'fixed'
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
        });
    };

    return $({
        tag: 'div',
        att: { className: 'utilization-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Segoe UI, sans-serif'
        },
        externalStyle: '/client/component/rdeStaff/style/utilization.css',
        elementHandler: getMainContainer,
        child: [
            FilterBar(),
            DataTable()
        ]
    });
};

// Utility functions for utilization/extension
export const formatUtilizationDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '—';
    if (!endDate) return formatUtilizationDate(startDate);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const getBeneficiaryColor = (type) => {
    const colors = {
        'industry': '#4caf50',
        'community': '#2196f3',
        'extension': '#ff9800',
        'academic': '#9c27b0',
        'government': '#e91e63',
        'private': '#00bcd4'
    };
    return colors[type] || '#9e9e9e';
};

export const getUtilizationStats = (data) => {
    // This function will calculate statistics from the data
    // Will be implemented when backend data is available
    return {
        totalPrograms: 0,
        totalBeneficiaries: 0,
        industryPartners: 0,
        communitiesServed: 0,
        byType: {
            industry: 0,
            community: 0,
            extension: 0,
            academic: 0,
            government: 0,
            private: 0
        }
    };
};
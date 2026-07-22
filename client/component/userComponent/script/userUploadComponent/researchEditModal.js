// researchEditModal.js
import { $, ConfirmationAlert, Waiting, AlertModal, CustomModal, FileViewerModal } from '../../../../lib/lib.js';

export const ResearchEditModal = {
    open: async (doc, onSuccess) => {
        // Initialize formData with current values
        let formData = {
            eventName: doc.eventName || '',
            title: doc.title || '',
            campus: doc.campus || '',
            category: doc.category || '',
            center: doc.center || '',
            presenter: doc.presenter || '',
            author: doc.author || '',
            coAuthors: Array.isArray(doc.coAuthors) ? [...doc.coAuthors] : [],
            researchFile: null,
            programFile: null,
            endorsementFile: null,
            certificateFile: null,
            docId: doc.id || doc.docId,
            endorsementId: doc.endorsement_id,
            isLocalInhouse: !!doc.local_inhouse,
            localInhouseId: doc.local_inhouse_id || null,
            date_started: doc.date_started || '',
            date_completed: doc.date_completed || '',
            existingResearchFile: doc.researchFile || doc.drive_view_url || null,
            existingEndorsementFile: doc.endorsementFile || null,
            existingProgramFile: doc.program_drive_view_url || doc.programFile || null,
            existingCertificateFile: doc.certificate_drive_view_url || doc.certificateFile || null,
        };

        // Fetch local in-house data if this is a local in-house document
        let localData = null;
        if (doc.local_inhouse) {
            try {
                const form = new FormData();
                form.append('getLocalInhouse', 'true');
                form.append('research_id', doc.docId || doc.id);

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: form
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.data) {
                        localData = data.data;
                        formData.localEventName = localData.local_eventname || '';
                        formData.localDocumentTitle = localData.document_title || '';
                        formData.localCampus = localData.campus || '';
                        formData.localCategory = localData.category || '';
                        formData.localCenter = localData.center || '';
                        formData.localMainAuthor = localData.main_author || '';
                        formData.localCoAuthors = Array.isArray(localData.co_authors) ? [...localData.co_authors] : [];
                        formData.localProgramFile = localData.program_file_view_url || null;
                        formData.localCertificateFile = localData.certificate_file_view_url || null;
                        formData.localInhouseId = localData.id || null;
                    }
                }
            } catch (error) {
                console.error('Error fetching local in-house data:', error);
            }
        }

        // Center categories mapping
        const centerCategoryMapping = {
            "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
            "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
            "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
            "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
            "Social Science Research & Development Center (SSRDC)": ["Social Science"],
            "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Development"],
            "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
            "Extension (Extension)": ["Extension"]
        };

        const categoryToCenters = {};
        Object.entries(centerCategoryMapping).forEach(([center, categories]) => {
            categories.forEach(category => {
                if (!categoryToCenters[category]) categoryToCenters[category] = [];
                categoryToCenters[category].push(center);
            });
        });

        const categories = ["Social Science", "Natural / Biological", "Food", "Development", "Extension"];

        const capitalizeFirstLetter = (str) => {
            if (!str) return str;
            return str.split(' ').map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
        };

        // Build the modal content
        const buildContent = () => {
            const container = $({
                tag: 'div',
                style: {
                    padding: '20px 0',
                    maxHeight: '70vh',
                    overflow: 'auto'
                }
            });

            // Helper function to create file upload field
            const createFileUploadField = (label, fieldName, existingUrl, existingName, isRequired = false, isOptional = false) => {
                const wrapper = $({
                    tag: 'div',
                    style: {
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e8ecf0'
                    }
                });

                const labelText = isRequired ? `${label} *` : (isOptional ? `${label} (Optional)` : label);
                
                const labelEl = $({
                    tag: 'label',
                    text: labelText,
                    style: {
                        display: 'block',
                        color: '#475569',
                        marginBottom: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                    }
                });
                wrapper.appendChild(labelEl);

                // Display existing file if available
                if (existingUrl && existingUrl !== '—' && existingUrl !== null && existingUrl !== '' && existingUrl !== 'null') {
                    const existingContainer = $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '8px',
                            border: '1px solid #bbdefb',
                            marginBottom: '10px',
                            flexWrap: 'wrap'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-file-pdf' },
                                style: { color: '#1976D2', fontSize: '16px' }
                            }),
                            $({
                                tag: 'span',
                                text: `Existing: ${existingName || 'File'}`,
                                style: { color: '#1a2a3a', fontSize: '13px', flex: 1 }
                            }),
                            $({
                                tag: 'span',
                                style: {
                                    color: '#1976D2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: '#bbdefb',
                                    transition: 'all 0.2s ease'
                                },
                                child: [
                                    $({ tag: 'i', att: { className: 'fas fa-eye' }, style: { fontSize: '12px' } }),
                                    $({ tag: 'span', text: 'View' })
                                ],
                                event: {
                                    type: 'click',
                                    method: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        let fileType = 'research';
                                        if (fieldName === 'researchFile') fileType = 'research';
                                        else if (fieldName === 'endorsementFile') fileType = 'endorsement';
                                        else if (fieldName === 'programFile') fileType = 'program';
                                        else if (fieldName === 'certificateFile') fileType = 'certificate';
                                        FileViewerModal(existingUrl, label, '#1976D2', { showOpenDrive: true });
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#90caf9';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#bbdefb';
                                    }
                                }
                            }),
                            $({
                                tag: 'span',
                                text: '(Upload new to replace)',
                                style: { color: '#64748b', fontSize: '11px', fontStyle: 'italic' }
                            })
                        ]
                    });
                    wrapper.appendChild(existingContainer);
                }

                // Upload area
                const uploadArea = $({
                    tag: 'div',
                    style: {
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#ffffff'
                    },
                    event: {
                        type: 'click',
                        method: () => fileInput.click(),
                        type2: 'mouseenter',
                        method2: (e) => {
                            e.currentTarget.style.borderColor = '#1976D2';
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                        },
                        type3: 'mouseleave',
                        method3: (e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.backgroundColor = '#ffffff';
                        }
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-cloud-upload-alt' },
                            style: { fontSize: '28px', color: '#1976D2', display: 'block', marginBottom: '8px' }
                        }),
                        $({
                            tag: 'div',
                            text: `Click to upload ${label}`,
                            style: { color: '#1a2a3a', fontSize: '13px', fontWeight: '500' }
                        }),
                        $({
                            tag: 'div',
                            text: '(PDF only, Max 10MB)',
                            style: { color: '#64748b', fontSize: '11px', marginTop: '4px' }
                        })
                    ]
                });
                wrapper.appendChild(uploadArea);

                const fileNameDisplay = $({
                    tag: 'div',
                    style: { marginTop: '10px', fontSize: '13px', color: '#2e7d32', textAlign: 'center' }
                });
                wrapper.appendChild(fileNameDisplay);

                const fileInput = $({
                    tag: 'input',
                    att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
                    event: {
                        type: 'change',
                        method: (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (file.type !== 'application/pdf') {
                                    alert('Please select a valid PDF file');
                                    fileInput.value = '';
                                    return;
                                }
                                if (file.size > 10 * 1024 * 1024) {
                                    alert('File size exceeds 10MB limit');
                                    fileInput.value = '';
                                    return;
                                }
                                formData[fieldName] = file;
                                fileNameDisplay.innerText = `✓ Selected: ${file.name}`;
                            }
                        }
                    }
                });
                wrapper.appendChild(fileInput);

                return wrapper;
            };

            // Event name (read-only)
            const eventField = $({ tag: 'div', style: { marginBottom: '16px' } });
            eventField.appendChild($({
                tag: 'label',
                text: 'Event Name',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            eventField.appendChild($({
                tag: 'input',
                att: { type: 'text', value: formData.eventName || '', disabled: true },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '14px',
                    cursor: 'not-allowed'
                }
            }));
            container.appendChild(eventField);

            // Two column layout for editable fields
            const grid = $({
                tag: 'div',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }
            });

            // Title
            const titleField = $({ tag: 'div', style: { marginBottom: '0' } });
            titleField.appendChild($({
                tag: 'label',
                text: 'Research/Extension Title *',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const titleInput = $({
                tag: 'input',
                att: { type: 'text', value: formData.title || '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        // Update formData on every keystroke
                        const value = e.target.value;
                        formData.title = value;
                        e.target.value = value;
                    }
                }
            });
            titleField.appendChild(titleInput);
            grid.appendChild(titleField);

            // Campus
            const campusField = $({ tag: 'div', style: { marginBottom: '0' } });
            campusField.appendChild($({
                tag: 'label',
                text: 'Campus *',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const campusSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                elementHandler: (el) => {
                    const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz'];
                    campuses.forEach(campus => {
                        const option = $({ tag: 'option', text: campus, att: { value: campus } });
                        el.appendChild(option);
                    });
                    if (formData.campus) {
                        el.value = formData.campus;
                    }
                },
                event: {
                    type: 'change',
                    method: (e) => { 
                        formData.campus = e.target.value; 
                    }
                }
            });
            campusField.appendChild(campusSelect);
            grid.appendChild(campusField);

            // Category
            const categoryField = $({ tag: 'div', style: { marginBottom: '0' } });
            categoryField.appendChild($({
                tag: 'label',
                text: 'Category *',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const categorySelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                elementHandler: (el) => {
                    categories.forEach(cat => {
                        const option = $({ tag: 'option', text: cat, att: { value: cat } });
                        el.appendChild(option);
                    });
                    if (formData.category) {
                        el.value = formData.category;
                    }
                },
                event: {
                    type: 'change',
                    method: (e) => {
                        formData.category = e.target.value;
                        // Update center options
                        if (centerSelect) {
                            const centers = categoryToCenters[e.target.value] || Object.keys(centerCategoryMapping);
                            centerSelect.innerHTML = '';
                            const defaultOption = $({ tag: 'option', text: '-- Select Center --', att: { value: '' } });
                            centerSelect.appendChild(defaultOption);
                            centers.forEach(center => {
                                const option = $({ tag: 'option', text: center, att: { value: center } });
                                centerSelect.appendChild(option);
                            });
                            if (formData.center) {
                                centerSelect.value = formData.center;
                            }
                        }
                    }
                }
            });
            categoryField.appendChild(categorySelect);
            grid.appendChild(categoryField);

            // Center
            const centerField = $({ tag: 'div', style: { marginBottom: '0' } });
            centerField.appendChild($({
                tag: 'label',
                text: 'Center (Optional for edit)',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const centerSelect = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                elementHandler: (el) => {
                    const centers = categoryToCenters[formData.category] || Object.keys(centerCategoryMapping);
                    const defaultOption = $({ tag: 'option', text: '-- Select Center --', att: { value: '' } });
                    el.appendChild(defaultOption);
                    centers.forEach(center => {
                        const option = $({ tag: 'option', text: center, att: { value: center } });
                        el.appendChild(option);
                    });
                    if (formData.center) {
                        el.value = formData.center;
                    }
                },
                event: {
                    type: 'change',
                    method: (e) => { 
                        formData.center = e.target.value; 
                    }
                }
            });
            centerField.appendChild(centerSelect);
            grid.appendChild(centerField);

            // Author
            const authorField = $({ tag: 'div', style: { marginBottom: '0' } });
            authorField.appendChild($({
                tag: 'label',
                text: 'Main Author *',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const authorInput = $({
                tag: 'input',
                att: { type: 'text', value: formData.author || '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        const value = e.target.value;
                        formData.author = value;
                        e.target.value = value;
                    }
                }
            });
            authorField.appendChild(authorInput);
            grid.appendChild(authorField);

            // Presenter
            const presenterField = $({ tag: 'div', style: { marginBottom: '0' } });
            presenterField.appendChild($({
                tag: 'label',
                text: 'Presenter *',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));
            const presenterInput = $({
                tag: 'input',
                att: { type: 'text', value: formData.presenter || '' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'input',
                    method: (e) => {
                        const value = e.target.value;
                        formData.presenter = value;
                        e.target.value = value;
                    }
                }
            });
            presenterField.appendChild(presenterInput);
            grid.appendChild(presenterField);

            // Co-authors
            const coAuthorField = $({ tag: 'div', style: { marginBottom: '0' } });
            coAuthorField.appendChild($({
                tag: 'label',
                text: 'Co-Authors',
                style: { display: 'block', color: '#475569', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }
            }));

            const coAuthorInputGroup = $({
                tag: 'div',
                style: { display: 'flex', gap: '8px', marginBottom: '8px' }
            });

            const coAuthorInput = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter co-author name' },
                style: {
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ecf0',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                }
            });

            const addCoAuthorBtn = $({
                tag: 'button',
                text: 'Add',
                style: {
                    padding: '8px 16px',
                    backgroundColor: '#1976D2',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: () => {
                        const name = coAuthorInput.value.trim();
                        if (name) {
                            formData.coAuthors.push(name);
                            updateCoAuthorList();
                            coAuthorInput.value = '';
                        }
                    }
                }
            });

            coAuthorInputGroup.appendChild(coAuthorInput);
            coAuthorInputGroup.appendChild(addCoAuthorBtn);
            coAuthorField.appendChild(coAuthorInputGroup);

            const coAuthorList = $({
                tag: 'div',
                style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }
            });

            const updateCoAuthorList = () => {
                coAuthorList.innerHTML = '';
                formData.coAuthors.forEach((author, idx) => {
                    const tag = $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#e8f5e9',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px'
                        },
                        child: [
                            $({ tag: 'span', text: author, style: { color: '#2e7d32' } }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#666', fontSize: '10px', cursor: 'pointer' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        formData.coAuthors.splice(idx, 1);
                                        updateCoAuthorList();
                                    }
                                }
                            })
                        ]
                    });
                    coAuthorList.appendChild(tag);
                });
            };
            updateCoAuthorList();
            coAuthorField.appendChild(coAuthorList);

            // Place co-author field in the grid (spans 2 columns)
            const coAuthorWrapper = $({ tag: 'div', style: { gridColumn: '1 / -1' } });
            coAuthorWrapper.appendChild(coAuthorField);
            grid.appendChild(coAuthorWrapper);

            container.appendChild(grid);

            // File upload section
            const fileSection = $({
                tag: 'div',
                style: {
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e8ecf0'
                }
            });

            fileSection.appendChild($({
                tag: 'h4',
                text: 'Attachments (Optional - Upload new to replace existing)',
                style: { color: '#1a2a3a', marginBottom: '16px', fontSize: '15px', fontWeight: '600' }
            }));

            const fileGrid = $({
                tag: 'div',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                }
            });

            // Get file names
            const getFileName = (url) => {
                if (!url || url === '—' || url === null) return null;
                if (url.includes('drive.google.com')) {
                    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    if (match) return 'Google Drive File (ID: ' + match[1].substring(0, 8) + '...)';
                    return 'Google Drive File';
                }
                return url.split('/').pop();
            };

            fileGrid.appendChild(createFileUploadField(
                'Research File',
                'researchFile',
                formData.existingResearchFile,
                getFileName(formData.existingResearchFile) || 'Research File'
            ));

            fileGrid.appendChild(createFileUploadField(
                'Endorsement Letter',
                'endorsementFile',
                formData.existingEndorsementFile,
                getFileName(formData.existingEndorsementFile) || 'Endorsement Letter'
            ));

            // Local In-House specific fields
            if (formData.isLocalInhouse) {
                const localSection = $({
                    tag: 'div',
                    style: {
                        gridColumn: '1 / -1',
                        marginTop: '8px',
                        padding: '16px',
                        backgroundColor: '#f0f7ff',
                        borderRadius: '10px',
                        border: '1px solid #b3d4fc'
                    }
                });

                localSection.appendChild($({
                    tag: 'h5',
                    text: 'Local In-House Files',
                    style: { color: '#1976D2', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }
                }));

                const localGrid = $({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px'
                    }
                });

                localGrid.appendChild(createFileUploadField(
                    'Local Program File',
                    'programFile',
                    formData.localProgramFile || formData.existingProgramFile,
                    getFileName(formData.localProgramFile || formData.existingProgramFile) || 'Program File',
                    false,
                    true
                ));

                localGrid.appendChild(createFileUploadField(
                    'Local Certificate',
                    'certificateFile',
                    formData.localCertificateFile || formData.existingCertificateFile,
                    getFileName(formData.localCertificateFile || formData.existingCertificateFile) || 'Certificate File',
                    false,
                    true
                ));

                localSection.appendChild(localGrid);
                fileGrid.appendChild(localSection);
            }

            fileSection.appendChild(fileGrid);
            container.appendChild(fileSection);

            // Info notice about partial updates
            const infoNotice = $({
                tag: 'div',
                style: {
                    marginTop: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#FFF8E1',
                    borderRadius: '8px',
                    borderLeft: '4px solid #FF9800',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-info-circle' },
                        style: { color: '#FF9800', fontSize: '16px', marginTop: '2px' }
                    }),
                    $({
                        tag: 'div',
                        style: { flex: 1 },
                        child: [
                            $({
                                tag: 'div',
                                text: 'Partial Updates Supported',
                                style: { color: '#795548', fontSize: '13px', fontWeight: '600' }
                            }),
                            $({
                                tag: 'div',
                                text: 'Only fields you change will be updated. Existing files will be kept unless you upload new ones.',
                                style: { color: '#795548', fontSize: '12px', lineHeight: '1.4' }
                            })
                        ]
                    })
                ]
            });
            container.appendChild(infoNotice);

            return container;
        };

        // Build footer
        const buildFooter = ({ closeModal }) => {
            const footerContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    width: '100%'
                }
            });

            const cancelBtn = $({
                tag: 'button',
                text: 'Cancel',
                style: {
                    padding: '10px 24px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: () => closeModal(),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }
                }
            });

            const submitBtn = $({
                tag: 'button',
                text: 'Save Changes',
                style: {
                    padding: '10px 28px',
                    backgroundColor: '#1976D2',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'click',
                    method: async () => {
                        // Validate required fields
                        if (!formData.title || formData.title.trim() === '') {
                            AlertModal({ title: 'Validation Error', message: 'Please enter a research/extension title' });
                            return;
                        }
                        if (!formData.campus) {
                            AlertModal({ title: 'Validation Error', message: 'Please select a campus' });
                            return;
                        }
                        if (!formData.category) {
                            AlertModal({ title: 'Validation Error', message: 'Please select a category' });
                            return;
                        }
                        if (!formData.author || formData.author.trim() === '') {
                            AlertModal({ title: 'Validation Error', message: 'Please enter main author' });
                            return;
                        }
                        if (!formData.presenter || formData.presenter.trim() === '') {
                            AlertModal({ title: 'Validation Error', message: 'Please enter presenter' });
                            return;
                        }

                        // Build FormData for submission
                        const submitFormData = new FormData();
                        submitFormData.append('editResearch', 'true');
                        submitFormData.append('docId', formData.docId);
                        submitFormData.append('endorsementId', formData.endorsementId);
                        submitFormData.append('eventType', formData.eventName);
                        submitFormData.append('title', formData.title.trim());
                        submitFormData.append('author', formData.author.trim());
                        submitFormData.append('category', formData.category);
                        if (formData.center) {
                            submitFormData.append('center', formData.center);
                        }
                        submitFormData.append('campus', formData.campus);
                        submitFormData.append('coAuthor', JSON.stringify(formData.coAuthors));
                        submitFormData.append('presenter', formData.presenter.trim());

                        // Append files only if they exist (new uploads)
                        if (formData.researchFile) {
                            submitFormData.append('researchDoc', formData.researchFile);
                        }
                        if (formData.endorsementFile) {
                            submitFormData.append('uploadedFileEndorsement', formData.endorsementFile);
                        }
                        if (formData.programFile) {
                            submitFormData.append('programFile', formData.programFile);
                        }
                        if (formData.certificateFile) {
                            submitFormData.append('certificateFile', formData.certificateFile);
                        }

                        // Local in-house specific data
                        if (formData.isLocalInhouse && formData.localInhouseId) {
                            submitFormData.append('localInhouseId', formData.localInhouseId);
                            submitFormData.append('isLocalInhouse', '1');
                        }

                        const loading = Waiting();
                        if (loading && typeof loading === 'object' && loading.nodeType) {
                            document.body.appendChild(loading);
                        }

                        try {
                            const response = await fetch('/uploadFacultyDocs', {
                                method: 'POST',
                                body: submitFormData
                            });

                            const result = await response.json();

                            if (loading && loading.remove) {
                                loading.remove();
                            }

                            if (result.status) {
                                closeModal();
                                AlertModal({
                                    title: 'Success',
                                    message: result.message || 'Document updated successfully!',
                                    onClose: () => {
                                        if (onSuccess) onSuccess();
                                        if (window.refreshDocumentsTable) {
                                            window.refreshDocumentsTable();
                                        }
                                    }
                                });
                            } else {
                                AlertModal({
                                    title: 'Update Failed',
                                    message: result.message || 'Failed to update document'
                                });
                            }
                        } catch (error) {
                            if (loading && loading.remove) loading.remove();
                            console.error('Update error:', error);
                            AlertModal({
                                title: 'Error',
                                message: 'Error updating document: ' + error.message
                            });
                        }
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#1565C0';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#1976D2';
                    }
                }
            });

            footerContainer.appendChild(cancelBtn);
            footerContainer.appendChild(submitBtn);
            return footerContainer;
        };

        // Open the modal
        CustomModal({
            title: 'Edit Document',
            content: buildContent,
            footer: buildFooter,
            size: 'large',
            onClose: () => {
                // Cleanup
            }
        });
    }
};
import { $, ConfirmationAlert, Waiting, Request } from '../../../../lib/lib.js';

export const handleResubmit = async (endorsementId, endorsementUrl) => {
    let resubmitModal;

    // Show loading indicator
    const loading = Waiting()
    document.body.appendChild(loading)

    try {
        const formData = new FormData();
        formData.append('getRejectedForResubmit', 'true');
        formData.append('docId', endorsementId);

        const response = await fetch('/uploadFacultyDocs', {
            method: 'POST',
            body: formData
        });

        loading.remove()

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }

        const textResponse = await response.text();

        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw response:', textResponse);
            throw new Error('Invalid JSON response from server');
        }

        if (!data || !data.status) {
            throw new Error(data?.message || 'Failed to load document data');
        }

        if (!data.data) {
            throw new Error(data.message || 'No document data found');
        }

        const currentDoc = data.data;

        // ===== SYMPOSIUM DATA =====
        const updatedValues = {
            title: currentDoc.title || '',
            author: currentDoc.author || '',
            presenter: currentDoc.presenter || '',
            category: currentDoc.category || '',
            center: currentDoc.center || '',
            coAuthors: []
        };

        if (currentDoc.coauthor) {
            if (Array.isArray(currentDoc.coauthor)) {
                updatedValues.coAuthors = currentDoc.coauthor;
            } else if (typeof currentDoc.coauthor === 'string') {
                try {
                    const parsed = JSON.parse(currentDoc.coauthor);
                    updatedValues.coAuthors = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    updatedValues.coAuthors = currentDoc.coauthor.split(',').map(s => s.trim()).filter(s => s);
                }
            }
        }

        // ===== SYMPOSIUM FILES (Only Research + Endorsement) =====
        const researchFileUrl = currentDoc.research_file?.url || '';
        const endorsementFileUrl = currentDoc.endorsement_file?.url || endorsementUrl || '';

        // ===== LOCAL IN-HOUSE DATA =====
        const localInhouseData = currentDoc.local_inhouse_data || null;
        let localValues = null;
        let localFiles = {};

        if (localInhouseData) {
            localValues = {
                document_title: localInhouseData.document_title || '',
                campus: localInhouseData.campus || '',
                category: localInhouseData.category || '',
                center: localInhouseData.center || '',
                main_author: localInhouseData.main_author || '',
                presenter: localInhouseData.presenter || '',
                co_authors: localInhouseData.co_authors || []
            };

            localFiles = {
                program: localInhouseData.program_file?.url || '',
                certificate: localInhouseData.certificate_file?.url || ''
            };
        }

        const closeModal = () => {
            if (resubmitModal) resubmitModal.remove();
        };

        resubmitModal = createResubmitModal({
            docId: endorsementId,
            currentDoc,
            updatedValues,
            symposiumFiles: {
                researchFileUrl,
                endorsementFileUrl
            },
            localInhouseData: {
                data: localValues,
                files: localFiles,
                exists: !!localInhouseData
            },
            comments: currentDoc.comments || [],
            closeModal
        });

        if (resubmitModal && resubmitModal.nodeType) {
            document.body.appendChild(resubmitModal);
        } else {
            console.error('Failed to create modal');
            alert('Error: Could not create resubmit modal');
        }

    } catch (error) {
        loading.remove();
        console.error('Error fetching document data:', error);
        alert('Error loading document information: ' + error.message);
    }
}

// Helper function to open file in modal
const openFileInModal = (fileUrl, fileLabel) => {
    const displayName = fileLabel || 'Document';

    const fileViewer = () => {
        if (fileUrl.includes('drive.google.com')) {
            let embedUrl = fileUrl;
            if (fileUrl.includes('/file/d/')) {
                const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (fileIdMatch && fileIdMatch[1]) {
                    embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
                }
            }

            return $({
                tag: 'iframe',
                att: {
                    src: embedUrl,
                    title: displayName
                },
                style: {
                    width: '100%',
                    height: '500px',
                    border: 'none',
                    borderRadius: '8px'
                }
            });
        } else {
            return $({
                tag: 'object',
                att: {
                    data: fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl,
                    type: 'application/pdf'
                },
                style: {
                    width: '100%',
                    height: '500px',
                    border: 'none',
                    borderRadius: '8px'
                }
            });
        }
    };

    const modal = $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 102,
            backdropFilter: 'blur(8px)'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                },
                child: [
                    // Header
                    $({
                        tag: 'div',
                        style: {
                            padding: '20px 24px',
                            borderBottom: '1px solid #e8ecf0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#ffffff'
                        },
                        child: [
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h3', text: displayName, style: { color: '#1a2a3a', margin: 0, fontSize: '18px', fontWeight: '600' } }),
                                    $({
                                        tag: 'div',
                                        style: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
                                        text: fileUrl.split('/').pop() || 'Document'
                                    })
                                ]
                            }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#94a3b8', fontSize: '20px', cursor: 'pointer', transition: 'color 0.2s' },
                                event: {
                                    type: 'click',
                                    method: () => modal.remove(),
                                    type2: 'mouseenter',
                                    method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                                    type3: 'mouseleave',
                                    method3: (e) => { e.currentTarget.style.color = '#94a3b8' }
                                }
                            })
                        ]
                    }),
                    // Content
                    $({
                        tag: 'div',
                        style: { padding: '20px', flex: 1, overflow: 'auto', backgroundColor: '#f8fafc' },
                        child: [fileViewer()]
                    }),
                    // Footer
                    $({
                        tag: 'div',
                        style: {
                            padding: '16px 24px',
                            borderTop: '1px solid #e8ecf0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#ffffff'
                        },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Close',
                                style: {
                                    padding: '8px 24px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                },
                                event: {
                                    type: 'click',
                                    method: () => modal.remove(),
                                    type2: 'mouseenter',
                                    method2: (e) => { e.currentTarget.style.backgroundColor = '#e2e8f0' },
                                    type3: 'mouseleave',
                                    method3: (e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }
                                }
                            })
                        ]
                    })
                ]
            })
        ]
    });

    document.body.appendChild(modal);
}

function createResubmitModal(params) {
    const {
        docId,
        currentDoc,
        updatedValues,
        symposiumFiles,
        localInhouseData,
        comments,
        closeModal
    } = params;

    // Create local variables for file inputs
    let researchFile, endorsementFile;
    let localProgramFile, localCertificateFile;
    let coAuthorInput, coAuthorList;

    // Co-authors management
    const updateCoAuthorList = () => {
        coAuthorList.innerHTML = ''
        updatedValues.coAuthors.forEach((author, idx) => {
            const tag = $({
                tag: 'div',
                style: {
                    backgroundColor: '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    border: '1px solid #e2e8f0'
                },
                child: [
                    $({ tag: 'span', text: author, style: { color: '#1a2a3a' } }),
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-times' },
                        style: { color: '#94a3b8', fontSize: '10px', cursor: 'pointer', transition: 'color 0.2s' },
                        event: {
                            type: 'click',
                            method: () => {
                                updatedValues.coAuthors.splice(idx, 1)
                                updateCoAuthorList()
                            },
                            type2: 'mouseenter',
                            method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                            type3: 'mouseleave',
                            method3: (e) => { e.currentTarget.style.color = '#94a3b8' }
                        }
                    })
                ]
            })
            coAuthorList.appendChild(tag)
        })
    }

    const modal = $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
            backdropFilter: 'blur(6px)'
        }
    })

    const modalContent = $({
        tag: 'div',
        style: {
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '92%',
            maxWidth: '1000px',
            maxHeight: '88vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }
    })

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '20px 28px',
            borderBottom: '1px solid #e8ecf0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#ffffff',
            zIndex: 1,
            borderRadius: '20px 20px 0 0'
        },
        child: [
            $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '12px' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fas fa-pen-to-square' },
                        style: { color: '#3b82f6', fontSize: '20px' }
                    }),
                    $({ tag: 'h3', text: 'Resubmit Document', style: { color: '#1a2a3a', margin: 0, fontSize: '20px', fontWeight: '600' } })
                ]
            }),
            $({
                tag: 'i',
                att: { className: 'fas fa-times' },
                style: { color: '#94a3b8', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s', padding: '4px' },
                event: {
                    type: 'click',
                    method: closeModal,
                    type2: 'mouseenter',
                    method2: (e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'rotate(90deg)' },
                    type3: 'mouseleave',
                    method3: (e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'rotate(0deg)' }
                }
            })
        ]
    })

    // Form body
    const formBody = $({
        tag: 'div',
        style: { padding: '28px' }
    })

    // Rejection Reason Section
    const rejectionSection = $({
        tag: 'div',
        style: {
            marginBottom: '28px',
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px'
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
                    $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { color: '#ef4444', fontSize: '16px' } }),
                    $({ tag: 'span', text: 'Rejection Reason', style: { color: '#dc2626', fontSize: '14px', fontWeight: '600' } })
                ]
            }),
            $({
                tag: 'div',
                text: currentDoc.rejection_reason || 'No reason provided',
                style: { color: '#475569', fontSize: '14px', lineHeight: '1.6' }
            })
        ]
    })

    // ===== SYMPOSIUM SECTION =====
    const symposiumSection = $({
        tag: 'div',
        style: {
            marginBottom: '28px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e8ecf0'
        },
        child: [
            $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fas fa-file-lines' },
                        style: { color: '#3b82f6', fontSize: '18px' }
                    }),
                    $({
                        tag: 'h4',
                        text: 'Symposium Details',
                        style: { color: '#1a2a3a', margin: 0, fontSize: '16px', fontWeight: '600' }
                    })
                ]
            })
        ]
    })

    // Two column layout for form fields
    const twoColumnLayout = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '4px'
        }
    })

    // Create modern input field helper
    const createInputField = (label, value, placeholder, onChange, required = true) => {
        const field = $({ tag: 'div', style: { marginBottom: '4px' } })
        field.appendChild($({
            tag: 'label',
            text: label + (required ? ' *' : ''),
            style: {
                display: 'block',
                color: '#475569',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500'
            }
        }))
        const input = $({
            tag: 'input',
            att: { type: 'text', placeholder: placeholder, value: value },
            style: {
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
            },
            event: {
                type: 'input',
                method: (e) => { onChange(e.target.value) },
                type2: 'focus',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                },
                type3: 'blur',
                method3: (e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }
        })
        field.appendChild(input)
        return field
    }

    // Title field
    const titleField = createInputField('Symposium Title', updatedValues.title, 'Enter symposium title', (val) => { updatedValues.title = val })

    // Category field
    const categoryField = createInputField('Category', updatedValues.category, 'Enter category', (val) => { updatedValues.category = val })

    // Center field
    const centerField = createInputField('Center', updatedValues.center, 'Enter center', (val) => { updatedValues.center = val })

    // Author field
    const authorField = createInputField('Main Author', updatedValues.author, 'Enter main author name', (val) => { updatedValues.author = val })

    // Presenter field
    const presenterField = createInputField('Presenter', updatedValues.presenter, 'Enter presenter name', (val) => { updatedValues.presenter = val })

    // Co-authors field (custom)
    const coAuthorField = $({ tag: 'div', style: { marginBottom: '4px' } })
    coAuthorField.appendChild($({
        tag: 'label',
        text: 'Co-Authors',
        style: {
            display: 'block',
            color: '#475569',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: '500'
        }
    }))

    const coAuthorInputGroup = $({
        tag: 'div',
        style: { display: 'flex', gap: '10px', marginBottom: '10px' }
    })

    coAuthorInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter co-author name' },
        style: {
            flex: 1,
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#1a2a3a',
            fontSize: '14px',
            transition: 'all 0.2s',
            outline: 'none',
            boxSizing: 'border-box'
        },
        event: {
            type: 'focus',
            method: (e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            },
            type2: 'blur',
            method2: (e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
            },
            type3: 'keydown',
            method3: (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const name = e.currentTarget.value.trim()
                    if (name) {
                        updatedValues.coAuthors.push(name)
                        updateCoAuthorList()
                        e.currentTarget.value = ''
                    }
                }
            }
        }
    })

    const addCoAuthorBtn = $({
        tag: 'button',
        text: 'Add',
        style: {
            padding: '8px 20px',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
        },
        event: {
            type: 'click',
            method: () => {
                const name = coAuthorInput.value.trim()
                if (name) {
                    updatedValues.coAuthors.push(name)
                    updateCoAuthorList()
                    coAuthorInput.value = ''
                }
            },
            type2: 'mouseenter',
            method2: (e) => { e.currentTarget.style.backgroundColor = '#2563eb' },
            type3: 'mouseleave',
            method3: (e) => { e.currentTarget.style.backgroundColor = '#3b82f6' }
        }
    })

    coAuthorInputGroup.appendChild(coAuthorInput)
    coAuthorInputGroup.appendChild(addCoAuthorBtn)

    coAuthorList = $({
        tag: 'div',
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '30px' }
    })

    // Initialize co-author list
    updateCoAuthorList()

    coAuthorField.appendChild(coAuthorInputGroup)
    coAuthorField.appendChild(coAuthorList)

    // Add fields to two-column layout
    twoColumnLayout.appendChild(titleField)
    twoColumnLayout.appendChild(categoryField)
    twoColumnLayout.appendChild(centerField)
    twoColumnLayout.appendChild(authorField)
    twoColumnLayout.appendChild(presenterField)
    twoColumnLayout.appendChild(coAuthorField)

    symposiumSection.appendChild(twoColumnLayout)

    // ===== SYMPOSIUM FILE UPLOADS =====
    const symposiumFileSection = $({
        tag: 'div',
        style: {
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e8ecf0'
        },
        child: [
            $({
                tag: 'div',
                style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'fas fa-cloud-upload-alt' },
                        style: { color: '#64748b', fontSize: '16px' }
                    }),
                    $({
                        tag: 'h4',
                        text: 'Symposium Files',
                        style: { color: '#475569', margin: 0, fontSize: '14px', fontWeight: '500' }
                    })
                ]
            }),
            $({
                tag: 'div',
                text: 'Leave empty to keep current files',
                style: { color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }
            })
        ]
    })

    const symposiumFileGrid = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
        }
    })

    const createModernFileUpload = (label, fieldName, currentFileUrl, color = '#3b82f6', icon = 'fa-file-pdf') => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }
        })

        // File info row
        const infoRow = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e8ecf0'
            }
        })

        const iconEl = $({
            tag: 'span',
            att: { className: `fas ${icon}` },
            style: { color: color, fontSize: '18px' }
        })

        const labelEl = $({
            tag: 'span',
            text: label,
            style: { color: '#475569', fontSize: '13px', fontWeight: '500', flex: '1' }
        })

        infoRow.appendChild(iconEl)
        infoRow.appendChild(labelEl)

        // Show current file status
        if (currentFileUrl) {
            const viewBtn = $({
                tag: 'button',
                style: {
                    padding: '4px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid ' + color,
                    borderRadius: '6px',
                    color: color,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                },
                text: 'View',
                event: {
                    type: 'click',
                    method: () => { openFileInModal(currentFileUrl, label) },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = color;
                        e.currentTarget.style.color = '#ffffff';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = color;
                    }
                }
            })
            infoRow.appendChild(viewBtn)
        }

        container.appendChild(infoRow)

        // File upload area
        const uploadArea = $({
            tag: 'div',
            style: {
                border: `2px dashed #d1d5db`,
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#fafbfc',
                position: 'relative'
            },
            event: {
                type: 'click',
                method: () => fileInput.click(),
                type2: 'dragover',
                method2: (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = color;
                    uploadArea.style.backgroundColor = '#f0f7ff';
                },
                type3: 'dragleave',
                method3: (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#d1d5db';
                    uploadArea.style.backgroundColor = '#fafbfc';
                },
                type4: 'drop',
                method4: (e) => {
                    e.preventDefault();
                    uploadArea.style.borderColor = '#d1d5db';
                    uploadArea.style.backgroundColor = '#fafbfc';
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                        handleFileSelect(files[0]);
                    }
                }
            }
        })

        const fileInput = $({
            tag: 'input',
            att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        handleFileSelect(file)
                    }
                }
            }
        })

        const uploadIcon = $({
            tag: 'span',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '28px', color: '#94a3b8', display: 'block', marginBottom: '6px' }
        })

        const uploadText = $({
            tag: 'div',
            text: 'Click or drag to upload',
            style: { color: '#94a3b8', fontSize: '13px' }
        })

        const fileHint = $({
            tag: 'div',
            text: 'PDF only',
            style: { color: '#cbd5e1', fontSize: '11px', marginTop: '2px' }
        })

        const fileNameDisplay = $({
            tag: 'div',
            style: {
                marginTop: '8px',
                fontSize: '12px',
                color: '#22c55e',
                fontWeight: '500'
            }
        })

        uploadArea.appendChild(uploadIcon)
        uploadArea.appendChild(uploadText)
        uploadArea.appendChild(fileHint)
        uploadArea.appendChild(fileNameDisplay)
        uploadArea.appendChild(fileInput)

        container.appendChild(uploadArea)

        // Handle file selection
        const handleFileSelect = (file) => {
            if (file.type !== 'application/pdf') {
                alert('Please select a PDF file')
                fileInput.value = ''
                return
            }
            fileNameDisplay.innerText = `✓ ${file.name}`
            fileNameDisplay.style.color = '#22c55e'
            
            // Store the file
            const fileMap = {
                'researchFile': 'researchFile',
                'endorsementFile': 'endorsementFile',
                'localProgramFile': 'localProgramFile',
                'localCertificateFile': 'localCertificateFile'
            };
            const varName = fileMap[fieldName];
            if (varName) {
                if (!window._resubmitFiles) {
                    window._resubmitFiles = {};
                }
                window._resubmitFiles[varName] = file;
                window[varName] = file;
            }
            // Update UI - show remove option
            const removeBtn = $({
                tag: 'button',
                text: 'Remove',
                style: {
                    padding: '2px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#ef4444',
                    fontSize: '11px',
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'all 0.2s'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation();
                        fileNameDisplay.innerText = '';
                        const varName = fileMap[fieldName];
                        if (varName) {
                            if (window._resubmitFiles) {
                                delete window._resubmitFiles[varName];
                            }
                            window[varName] = null;
                        }
                        fileInput.value = '';
                        removeBtn.remove();
                    }
                }
            })
            // Remove any existing remove button
            const existingRemove = uploadArea.querySelector('.remove-file-btn');
            if (existingRemove) existingRemove.remove();
            removeBtn.className = 'remove-file-btn';
            uploadArea.appendChild(removeBtn);
        }

        return container
    }

    // Symposium Files (Research + Endorsement)
    const researchField = createModernFileUpload('Research Paper', 'researchFile', symposiumFiles.researchFileUrl, '#22c55e', 'fa-file-pdf')
    const endorsementField = createModernFileUpload('Endorsement Letter', 'endorsementFile', symposiumFiles.endorsementFileUrl, '#f59e0b', 'fa-file-pen')

    symposiumFileGrid.appendChild(researchField)
    symposiumFileGrid.appendChild(endorsementField)

    symposiumFileSection.appendChild(symposiumFileGrid)

    // ===== LOCAL IN-HOUSE SECTION (conditional) =====
    let localSection = null;

    if (localInhouseData.exists) {
        localSection = $({
            tag: 'div',
            style: {
                marginTop: '28px',
                padding: '20px',
                backgroundColor: '#fefce8',
                borderRadius: '12px',
                border: '1px solid #fde68a'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fas fa-folder-open' },
                            style: { color: '#f59e0b', fontSize: '18px' }
                        }),
                        $({
                            tag: 'h4',
                            text: 'Local In-House Details',
                            style: { color: '#92400e', margin: 0, fontSize: '16px', fontWeight: '600' }
                        })
                    ]
                })
            ]
        })

        // Local In-House fields
        const localFields = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
            }
        })

        // Create local input fields
        const createLocalInput = (label, value, onChange, placeholder = '') => {
            const field = $({ tag: 'div' })
            field.appendChild($({
                tag: 'label',
                text: label,
                style: {
                    display: 'block',
                    color: '#78350f',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                }
            }))
            const input = $({
                tag: 'input',
                att: { type: 'text', placeholder: placeholder || 'Enter ' + label.toLowerCase(), value: value || '' },
                style: {
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                },
                event: {
                    type: 'input',
                    method: (e) => { onChange(e.target.value) },
                    type2: 'focus',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#f59e0b';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                    },
                    type3: 'blur',
                    method3: (e) => {
                        e.currentTarget.style.borderColor = '#fde68a';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }
            })
            field.appendChild(input)
            return field
        }

        const localTitleField = createLocalInput('Local Title', localInhouseData.data.document_title, (val) => { localInhouseData.data.document_title = val })
        const localAuthorField = createLocalInput('Local Author', localInhouseData.data.main_author, (val) => { localInhouseData.data.main_author = val })
        const localPresenterField = createLocalInput('Local Presenter', localInhouseData.data.presenter, (val) => { localInhouseData.data.presenter = val })
        const localCategoryField = createLocalInput('Local Category', localInhouseData.data.category, (val) => { localInhouseData.data.category = val })

        localFields.appendChild(localTitleField)
        localFields.appendChild(localAuthorField)
        localFields.appendChild(localPresenterField)
        localFields.appendChild(localCategoryField)

        localSection.appendChild(localFields)

        // Local In-House Files
        const localFileSection = $({
            tag: 'div',
            style: {
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #fde68a'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
                    child: [
                        $({
                            tag: 'span',
                            att: { className: 'fas fa-file' },
                            style: { color: '#f59e0b', fontSize: '16px' }
                        }),
                        $({
                            tag: 'h4',
                            text: 'Local Files',
                            style: { color: '#78350f', margin: 0, fontSize: '14px', fontWeight: '500' }
                        })
                    ]
                })
            ]
        })

        const localFileGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }
        })

        const localProgramField = createModernFileUpload('Program File', 'localProgramFile', localInhouseData.files.program, '#f59e0b', 'fa-file-lines')
        const localCertificateField = createModernFileUpload('Certificate File', 'localCertificateFile', localInhouseData.files.certificate, '#f59e0b', 'fa-file-certificate')

        localFileGrid.appendChild(localProgramField)
        localFileGrid.appendChild(localCertificateField)

        localFileSection.appendChild(localFileGrid)
        localSection.appendChild(localFileSection)
    }

    // ===== BUILD THE FORM =====
    formBody.appendChild(rejectionSection)
    formBody.appendChild(symposiumSection)
    formBody.appendChild(symposiumFileSection)
    if (localSection) {
        formBody.appendChild(localSection)
    }

    // Form actions
    const actions = $({
        tag: 'div',
        style: {
            padding: '20px 28px',
            borderTop: '1px solid #e8ecf0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#ffffff',
            borderRadius: '0 0 20px 20px'
        }
    })

    const cancelBtn = $({
        tag: 'button',
        text: 'Cancel',
        style: {
            padding: '10px 28px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
        },
        event: {
            type: 'click',
            method: closeModal,
            type2: 'mouseenter',
            method2: (e) => { e.currentTarget.style.backgroundColor = '#e2e8f0' },
            type3: 'mouseleave',
            method3: (e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }
        }
    })

    const submitBtn = $({
        tag: 'button',
        text: 'Submit Resubmission',
        style: {
            padding: '10px 32px',
            backgroundColor: '#22c55e',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
        },
        event: {
            type: 'click',
            method: async () => {
                await submitResubmit({
                    docId,
                    updatedValues,
                    researchFile: window.researchFile,
                    endorsementFile: window.endorsementFile,
                    localProgramFile: window.localProgramFile,
                    localCertificateFile: window.localCertificateFile,
                    currentDoc,
                    localInhouseData,
                    closeModal
                });
            },
            type2: 'mouseenter',
            method2: (e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            },
            type3: 'mouseleave',
            method3: (e) => {
                e.currentTarget.style.backgroundColor = '#22c55e';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }
        }
    })

    actions.appendChild(cancelBtn)
    actions.appendChild(submitBtn)

    modalContent.appendChild(header)
    modalContent.appendChild(formBody)
    modalContent.appendChild(actions)
    modal.appendChild(modalContent)

    return modal;
}

export async function submitResubmit(params) {
    const {
        docId,
        updatedValues,
        researchFile,
        endorsementFile,
        localProgramFile,
        localCertificateFile,
        currentDoc,
        localInhouseData,
        closeModal
    } = params;

    // Check if any changes were made
    const originalCoauthorStr = JSON.stringify(updatedValues.coAuthors);
    const currentCoauthorStr = JSON.stringify(currentDoc.coauthor ?
        (Array.isArray(currentDoc.coauthor) ? currentDoc.coauthor :
            (typeof currentDoc.coauthor === 'string' ?
                (() => {
                    try {
                        const parsed = JSON.parse(currentDoc.coauthor);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return currentDoc.coauthor.split(',').map(s => s.trim()).filter(s => s);
                    }
                })() : [])) : []);

    const hasChanges = researchFile || endorsementFile || localProgramFile || localCertificateFile ||
        updatedValues.title !== currentDoc.title ||
        updatedValues.author !== currentDoc.author ||
        updatedValues.presenter !== currentDoc.presenter ||
        updatedValues.category !== currentDoc.category ||
        updatedValues.center !== currentDoc.center ||
        originalCoauthorStr !== currentCoauthorStr;

    if (!hasChanges) {
        if (window.showNotification) {
            window.showNotification('No changes made. Please update at least one field or file.', 'warning');
        } else {
            alert('No changes made. Please update at least one field or file.');
        }
        return;
    }

    if (!confirm('Are you sure you want to resubmit this document?')) {
        return;
    }

    const submitLoading = Waiting();
    if (submitLoading && submitLoading.nodeType) {
        document.body.appendChild(submitLoading);
    }

    try {
        const formData = new FormData();
        formData.append('resubmitDocument', 'true');
        formData.append('docId', docId);

        // Add updated metadata
        formData.append('title', updatedValues.title || '');
        formData.append('author', updatedValues.author || '');
        formData.append('presenter', updatedValues.presenter || '');
        formData.append('category', updatedValues.category || '');
        formData.append('center', updatedValues.center || '');
        formData.append('coauthor', JSON.stringify(updatedValues.coAuthors || []));

        // Add local in-house data if exists
        if (localInhouseData && localInhouseData.exists) {
            formData.append('local_title', localInhouseData.data.document_title || '');
            formData.append('local_author', localInhouseData.data.main_author || '');
            formData.append('local_presenter', localInhouseData.data.presenter || '');
            formData.append('local_category', localInhouseData.data.category || '');
            formData.append('local_center', localInhouseData.data.center || '');
            formData.append('local_campus', localInhouseData.data.campus || '');
            formData.append('local_coauthors', JSON.stringify(localInhouseData.data.co_authors || []));
        }

        // Add symposium files
        if (researchFile) formData.append('researchDoc', researchFile);
        if (endorsementFile) formData.append('endorsementFile', endorsementFile);

        // Add local in-house files
        if (localProgramFile) formData.append('localProgramFile', localProgramFile);
        if (localCertificateFile) formData.append('localCertificateFile', localCertificateFile);

        const response = await fetch('/uploadFacultyDocs', {
            method: 'POST',
            body: formData
        });

        if (submitLoading && submitLoading.remove) {
            submitLoading.remove();
        }
        closeModal();

        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                document.body.appendChild(ConfirmationAlert(data.message, () => {
                    window.location.reload();
                }));
            } else {
                if (window.showNotification) {
                    window.showNotification(data.message || 'Error resubmitting document', 'error');
                } else {
                    alert('Error: ' + data.message);
                }
            }
        } else {
            if (window.showNotification) {
                window.showNotification('Failed to resubmit document', 'error');
            } else {
                alert('Failed to resubmit document');
            }
        }
    } catch (error) {
        if (submitLoading && submitLoading.remove) {
            submitLoading.remove();
        }
        if (window.showNotification) {
            window.showNotification('An error occurred during resubmission', 'error');
        }
    }
}
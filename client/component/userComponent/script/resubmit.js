import { $, ConfirmationAlert, Waiting, Request } from '../../../lib/lib.js';

export const handleResubmit = async (endorsementId, endorsementUrl) => {
    let resubmitModal;

    // Show loading indicator
    const loading = Waiting()
    document.body.appendChild(loading)

    try {
        // Fetch the specific document data from the server by ID
        const formData = new FormData();
        formData.append('getRejectedForResubmit', 'true');
        formData.append('docId', endorsementId);

        const response = await fetch('/getresearch', {
            method: 'POST',
            body: formData
        });

        loading.remove()

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Check if we have data
        if (!data || !data.data) {
            throw new Error('Unable to load document data');
        }

        // Get the document - handle both array and single object
        let currentDoc;
        if (Array.isArray(data.data) && data.data.length > 0) {
            currentDoc = data.data[0];
        } else if (typeof data.data === 'object') {
            currentDoc = data.data;
        } else {
            throw new Error('Document data format is invalid');
        }

        // Create an object to hold updated values that can be modified
        const updatedValues = {
            title: currentDoc.title || '',
            author: currentDoc.author || '',
            presenter: currentDoc.presenter || '',
            category: currentDoc.category || '',
            center: currentDoc.center || '',
            coAuthors: []
        };

        // Parse coauthors - handle both array and string
        if (currentDoc.coauthor) {
            if (Array.isArray(currentDoc.coauthor)) {
                updatedValues.coAuthors = currentDoc.coauthor;
            } else if (typeof currentDoc.coauthor === 'string') {
                try {
                    const parsed = JSON.parse(currentDoc.coauthor);
                    updatedValues.coAuthors = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    // If it's not JSON, treat as comma-separated string
                    updatedValues.coAuthors = currentDoc.coauthor.split(',').map(s => s.trim()).filter(s => s);
                }
            }
        }

        // Get file URLs with proper fallbacks
        const researchFileUrl = currentDoc.research_file?.url ||
            currentDoc.drive_view_url ||
            '';

        const programFileUrl = currentDoc.program_file?.url ||
            currentDoc.program_drive_view_url ||
            '';

        const endorsementFileUrl = currentDoc.endorsement_file?.url ||
            currentDoc.endorsement_url ||
            endorsementUrl ||
            '';

        const closeModal = () => {
            if (resubmitModal) resubmitModal.remove();
        };

        // Create the modal with the data
        resubmitModal = createResubmitModal({
            docId: endorsementId,
            currentDoc,
            updatedValues,
            researchFileUrl,
            programFileUrl,
            endorsementFileUrl,
            comments: currentDoc.comments || [],
            closeModal
        });

        document.body.appendChild(resubmitModal);

    } catch (error) {
        loading.remove();
        console.error('Error fetching document data:', error);
        alert('Error loading document information: ' + error.message);
    }
}

// Helper function to open file in modal
const openFileInModal = (fileUrl, fileLabel) => {
    // Determine file type for display
    const displayName = fileLabel || 'Document';

    // Create file viewer based on file type
    const fileViewer = () => {
        if (fileUrl.includes('drive.google.com')) {
            // Google Drive file - extract file ID for embed
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
            // Local file
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
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 102,
            backdropFilter: 'blur(4px)'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    backgroundColor: '#1e1e1e',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                },
                child: [
                    // Header
                    $({
                        tag: 'div',
                        style: {
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#1e1e1e'
                        },
                        child: [
                            $({
                                tag: 'div',
                                child: [
                                    $({ tag: 'h3', text: displayName, style: { color: '#fff', margin: 0, fontSize: '18px' } }),
                                    $({
                                        tag: 'div',
                                        style: { fontSize: '12px', color: '#888', marginTop: '4px' },
                                        text: fileUrl.split('/').pop() || 'Document'
                                    })
                                ]
                            }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                                event: {
                                    type: 'click',
                                    method: () => modal.remove()
                                }
                            })
                        ]
                    }),
                    // Content
                    $({
                        tag: 'div',
                        style: { padding: '20px', flex: 1, overflow: 'auto' },
                        child: [fileViewer()]
                    }),
                    // Footer
                    $({
                        tag: 'div',
                        style: {
                            padding: '16px 24px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Close',
                                style: {
                                    padding: '8px 24px',
                                    backgroundColor: '#444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: 'pointer'
                                },
                                event: {
                                    type: 'click',
                                    method: () => modal.remove()
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
        researchFileUrl,
        programFileUrl,
        endorsementFileUrl,
        comments,
        closeModal
    } = params;

    // Create local variables for file inputs and co-authors
    let researchFile, programFile, endorsementFile;
    let coAuthorInput, coAuthorList;

    // Co-authors management
    const updateCoAuthorList = () => {
        coAuthorList.innerHTML = ''
        updatedValues.coAuthors.forEach((author, idx) => {
            const tag = $({
                tag: 'div',
                style: {
                    backgroundColor: '#2a2a2a',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px'
                },
                child: [
                    $({ tag: 'span', text: author, style: { color: '#fff' } }),
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-times' },
                        style: { color: '#999', fontSize: '10px', cursor: 'pointer' },
                        event: {
                            type: 'click',
                            method: () => {
                                updatedValues.coAuthors.splice(idx, 1)
                                updateCoAuthorList()
                            }
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
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
            backdropFilter: 'blur(5px)'
        }
    })

    const modalContent = $({
        tag: 'div',
        style: {
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }
    })

    // Header
    const header = $({
        tag: 'div',
        style: {
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#1a1a1a',
            zIndex: 1
        },
        child: [
            $({ tag: 'h3', text: 'Resubmit Document', style: { color: '#fff', margin: 0, fontSize: '20px' } }),
            $({
                tag: 'i',
                att: { className: 'fas fa-times' },
                style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                event: {
                    type: 'click',
                    method: closeModal
                }
            })
        ]
    })

    // Form body
    const formBody = $({
        tag: 'div',
        style: { padding: '24px' }
    })

    // Rejection Reason Section
    const rejectionSection = $({
        tag: 'div',
        style: {
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderLeft: '4px solid #e74c3c',
            borderRadius: '8px'
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
                    $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { color: '#e74c3c', fontSize: '16px' } }),
                    $({ tag: 'span', text: 'Rejection Reason', style: { color: '#e74c3c', fontSize: '14px', fontWeight: 'bold' } })
                ]
            }),
            $({
                tag: 'div',
                text: currentDoc.rejection_reason || 'No reason provided',
                style: { color: '#bbb', fontSize: '14px', lineHeight: '1.5' }
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
            marginBottom: '20px'
        }
    })

    // Title field
    const titleField = $({ tag: 'div', style: { marginBottom: '20px' } })
    titleField.appendChild($({ tag: 'label', text: 'Document Title *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
    const titleInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter document title', value: updatedValues.title },
        style: {
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => { updatedValues.title = e.target.value }
        }
    })
    titleField.appendChild(titleInput)

    // Category field
    const categoryField = $({ tag: 'div', style: { marginBottom: '20px' } })
    categoryField.appendChild($({ tag: 'label', text: 'Category *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
    const categoryInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter category', value: updatedValues.category },
        style: {
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => { updatedValues.category = e.target.value }
        }
    })
    categoryField.appendChild(categoryInput)

    // Center field
    const centerField = $({ tag: 'div', style: { marginBottom: '20px' } })
    centerField.appendChild($({ tag: 'label', text: 'Center *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
    const centerInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter center', value: updatedValues.center },
        style: {
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => { updatedValues.center = e.target.value }
        }
    })
    centerField.appendChild(centerInput)

    // Author field
    const authorField = $({ tag: 'div', style: { marginBottom: '20px' } })
    authorField.appendChild($({ tag: 'label', text: 'Main Author *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
    const authorInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter main author name', value: updatedValues.author },
        style: {
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => { updatedValues.author = e.target.value }
        }
    })
    authorField.appendChild(authorInput)

    // Presenter field
    const presenterField = $({ tag: 'div', style: { marginBottom: '20px' } })
    presenterField.appendChild($({ tag: 'label', text: 'Presenter *', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
    const presenterInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter presenter name', value: updatedValues.presenter },
        style: {
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        event: {
            type: 'input',
            method: (e) => { updatedValues.presenter = e.target.value }
        }
    })
    presenterField.appendChild(presenterInput)

    // Co-authors field
    const coAuthorField = $({ tag: 'div', style: { marginBottom: '20px' } })
    coAuthorField.appendChild($({ tag: 'label', text: 'Co-Authors', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

    const coAuthorInputGroup = $({
        tag: 'div',
        style: { display: 'flex', gap: '10px', marginBottom: '12px' }
    })

    coAuthorInput = $({
        tag: 'input',
        att: { type: 'text', placeholder: 'Enter co-author name' },
        style: {
            flex: 1,
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        }
    })

    const addCoAuthorBtn = $({
        tag: 'button',
        text: 'Add',
        style: {
            padding: '8px 20px',
            backgroundColor: '#2196F3',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
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
            }
        }
    })

    coAuthorInputGroup.appendChild(coAuthorInput)
    coAuthorInputGroup.appendChild(addCoAuthorBtn)

    coAuthorList = $({
        tag: 'div',
        style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }
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

    formBody.appendChild(rejectionSection)
    formBody.appendChild(twoColumnLayout)

    // File upload sections - UPDATED LAYOUT
    const fileSection = $({
        tag: 'div',
        style: {
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }
    })

    fileSection.appendChild($({
        tag: 'h4',
        text: 'Upload New Files (leave empty to keep current)',
        style: { color: '#fff', marginBottom: '16px', fontSize: '16px' }
    }))

    const fileGrid = $({
        tag: 'div',
        style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px'
        }
    })

    // Helper function to create file upload field with view current button above
    const createFileUploadField = (label, fieldName, currentFileUrl) => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }
        })

        // View Current button (if file exists)
        if (currentFileUrl) {
            const viewCurrentBtn = $({
                tag: 'button',
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #2196F3',
                    borderRadius: '8px',
                    color: '#2196F3',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: 'fit-content'
                },
                child: [
                    $({ tag: 'i', att: { className: 'fas fa-eye' }, style: { fontSize: '12px' } }),
                    $({ tag: 'span', text: 'View Current' })
                ],
                event: {
                    type: 'mouseenter',
                    method: (e) => {
                        e.target.style.backgroundColor = '#2196F3';
                        e.target.style.color = '#fff';
                    },
                    type: 'mouseleave',
                    method: (e) => {
                        e.target.style.backgroundColor = '#2a2a2a';
                        e.target.style.color = '#2196F3';
                    },
                    type: 'click',
                    method: () => {
                        // Open file in modal instead of new tab
                        openFileInModal(currentFileUrl, label);
                    }
                }
            })
            container.appendChild(viewCurrentBtn)
        }

        // File upload area
        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #444',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(255,255,255,0.03)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click()
            }
        })

        // File input (hidden)
        const fileInput = $({
            tag: 'input',
            att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        if (file.type !== 'application/pdf') {
                            alert('Please select a PDF file')
                            fileInput.value = ''
                            return
                        }
                        // Update the file display text
                        fileNameDisplay.innerText = `Selected: ${file.name}`
                        fileNameDisplay.style.color = '#4caf50'
                        // Store the file in the appropriate variable
                        if (fieldName === 'researchFile') {
                            window.researchFile = file
                        } else if (fieldName === 'programFile') {
                            window.programFile = file
                        } else if (fieldName === 'endorsementFile') {
                            window.endorsementFile = file
                        }
                    } else {
                        fileNameDisplay.innerText = ''
                        if (fieldName === 'researchFile') {
                            window.researchFile = null
                        } else if (fieldName === 'programFile') {
                            window.programFile = null
                        } else if (fieldName === 'endorsementFile') {
                            window.endorsementFile = null
                        }
                    }
                }
            }
        })

        // Icon
        const icon = $({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '36px', color: '#666', marginBottom: '12px', display: 'block' }
        })

        // Label text
        const labelText = $({
            tag: 'div',
            text: `Upload ${label}`,
            style: { color: '#888', fontSize: '14px', marginBottom: '4px' }
        })

        // PDF hint
        const pdfHint = $({
            tag: 'div',
            text: '(PDF only)',
            style: { color: '#666', fontSize: '12px' }
        })

        // File name display
        const fileNameDisplay = $({
            tag: 'div',
            style: {
                marginTop: '12px',
                fontSize: '12px',
                color: '#888',
                wordBreak: 'break-all'
            }
        })

        uploadArea.appendChild(icon)
        uploadArea.appendChild(labelText)
        uploadArea.appendChild(pdfHint)
        uploadArea.appendChild(fileNameDisplay)
        uploadArea.appendChild(fileInput)

        container.appendChild(uploadArea)

        return container
    }

    // Create file upload fields
    const researchFileField = createFileUploadField('Research File', 'researchFile', researchFileUrl)
    const programFileField = createFileUploadField('Program File', 'programFile', programFileUrl)
    const endorsementFileField = createFileUploadField('Endorsement Letter', 'endorsementFile', endorsementFileUrl)

    fileGrid.appendChild(researchFileField)
    fileGrid.appendChild(programFileField)
    fileGrid.appendChild(endorsementFileField)

    fileSection.appendChild(fileGrid)
    formBody.appendChild(fileSection)

    // Form actions
    const actions = $({
        tag: 'div',
        style: {
            padding: '20px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#1a1a1a'
        }
    })

    const cancelBtn = $({
        tag: 'button',
        text: 'Cancel',
        style: {
            padding: '10px 24px',
            backgroundColor: '#444',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        event: {
            type: 'click',
            method: closeModal
        }
    })

    const submitBtn = $({
        tag: 'button',
        text: 'Submit Resubmission',
        style: {
            padding: '10px 28px',
            backgroundColor: '#4caf50',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        event: {
            type: 'click',
            method: async () => {
                await submitResubmit({
                    docId,
                    updatedValues,
                    researchFile: window.researchFile,
                    programFile: window.programFile,
                    endorsementFile: window.endorsementFile,
                    currentDoc,
                    closeModal
                });
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
        programFile,
        endorsementFile,
        currentDoc,
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

    if (!researchFile && !programFile && !endorsementFile &&
        updatedValues.title === currentDoc.title &&
        updatedValues.author === currentDoc.author &&
        updatedValues.presenter === currentDoc.presenter &&
        updatedValues.category === currentDoc.category &&
        updatedValues.center === currentDoc.center &&
        originalCoauthorStr === currentCoauthorStr) {
        alert('No changes made. Please update at least one field or file.');
        return;
    }

    if (!confirm('Are you sure you want to resubmit this document?')) {
        return;
    }

    const submitLoading = Waiting();
    document.body.appendChild(submitLoading);

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

        // Add files if changed
        if (researchFile) {
            formData.append('researchDoc', researchFile);
        }
        if (programFile) {
            formData.append('programFile', programFile);
        }
        if (endorsementFile) {
            formData.append('endorsementFile', endorsementFile);
        }

        const response = await fetch('/getresearch', {
            method: 'POST',
            body: formData
        });

        submitLoading.remove();
        closeModal();

        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                document.body.appendChild(ConfirmationAlert(data.message, () => {
                    window.location.reload();
                }));
            } else {
                alert('Error: ' + data.message);
            }
        } else {
            alert('Failed to resubmit document');
        }
    } catch (error) {
        submitLoading.remove();
        console.error('Resubmit error:', error);
        alert('Error resubmitting document: ' + error.message);
    }
}
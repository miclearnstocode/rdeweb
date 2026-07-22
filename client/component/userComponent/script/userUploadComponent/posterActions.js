import { $, Waiting, ConfirmationAlert, AlertModal, DeleteConfirmModal, FileViewerModal, CustomModal, DragDropUpload, ValidatePDF } from '../../../../lib/lib.js'

// View Comments for Poster
export const viewPosterComments = (poster) => {
    // Show loading state
    let modalRef = null;
    let contentContainer = null;

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '4px 0',
                minHeight: '200px'
            }
        });

        // Show loading state
        const loadingDiv = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                padding: '40px',
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
                    text: 'Loading rejection details...',
                    style: { fontSize: '14px' }
                })
            ]
        });
        container.appendChild(loadingDiv);

        contentContainer = container;
        return container;
    };

    const loadRejectionData = async () => {
        try {
            const form = new FormData();
            form.append('getPosterRejection', 'true');
            form.append('posterId', poster.id);

            const response = await fetch('/uploadFacultyDocs', {
                method: 'POST',
                body: form
            });

            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }

            const data = await response.json();

            // Update content
            if (contentContainer) {
                contentContainer.innerHTML = '';

                if (data.status && data.reason) {
                    // Display rejection reason
                    contentContainer.appendChild(createRejectionDisplay(data));
                } else {
                    // No rejection found - show poster details
                    contentContainer.appendChild(createPosterDetailsDisplay(poster));
                }
            }

        } catch (error) {
            console.error('Error loading rejection data:', error);
            if (contentContainer) {
                contentContainer.innerHTML = '';
                contentContainer.appendChild($({
                    tag: 'div',
                    style: {
                        textAlign: 'center',
                        padding: '40px',
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
                            text: 'Failed to load rejection details',
                            style: { fontSize: '16px', fontWeight: '500' }
                        }),
                        $({
                            tag: 'div',
                            text: error.message || 'Please try again later',
                            style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                        })
                    ]
                }));
            }
        }
    };

    const createRejectionDisplay = (data) => {
        return $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            },
            child: [
                // Warning banner
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: '#FFF3E0',
                        borderRadius: '12px',
                        borderLeft: '4px solid #FF9800'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-exclamation-triangle' },
                            style: { color: '#E65100', fontSize: '20px' }
                        }),
                        $({
                            tag: 'div',
                            style: { flex: 1 },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Poster Rejected',
                                    style: { color: '#E65100', fontWeight: '600', fontSize: '15px' }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'This poster has been rejected by the RDE staff.',
                                    style: { color: '#795548', fontSize: '13px' }
                                })
                            ]
                        })
                    ]
                }),

                // Poster Info
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e8ecf0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px 16px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Status',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Rejected',
                                            style: { fontSize: '13px', color: '#C62828', fontWeight: '600', textTransform: 'capitalize' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Title',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.title || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Author',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.author || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Event',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.event_name || poster.event || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Rejected On',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: data.date ? new Date(data.date).toLocaleDateString() : 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),

                // Rejection Reason
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#FFEBEE',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #FFCDD2',
                        borderLeft: '4px solid #D32F2F'
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
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-times-circle' },
                                    style: { color: '#D32F2F', fontSize: '16px' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Rejection Reason',
                                    style: { color: '#C62828', fontSize: '14px', fontWeight: '600' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                color: '#1a2a3a',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                padding: '8px 12px',
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: '6px'
                            },
                            text: data.reason || 'No reason provided'
                        })
                    ]
                })
            ]
        });
    };

    const createPosterDetailsDisplay = (poster) => {
        return $({
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
                        textAlign: 'center',
                        padding: '20px',
                        color: '#94a3b8'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-comment-dots' },
                            style: { fontSize: '32px', display: 'block', marginBottom: '12px', color: '#cbd5e1' }
                        }),
                        $({
                            tag: 'div',
                            text: 'No rejection record found for this poster.',
                            style: { fontSize: '14px' }
                        }),
                        $({
                            tag: 'div',
                            text: 'This poster may not have been rejected yet.',
                            style: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' }
                        })
                    ]
                }),
                // Poster details
                $({
                    tag: 'div',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e8ecf0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px 16px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Paper Trail No',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.paper_trail_no || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500', fontFamily: 'monospace' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Status',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: poster.status || 'pending',
                                            style: { fontSize: '13px', color: poster.status === 'accepted' ? '#2E7D32' : poster.status === 'rejected' ? '#C62828' : '#E65100', fontWeight: '600', textTransform: 'capitalize' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Title',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.title || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Author',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.author || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Event',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.event_name || poster.event || 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Submitted',
                                            style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: poster.created_at ? new Date(poster.created_at).toLocaleDateString() : 'N/A',
                                            style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    };

    const buildFooter = ({ closeModal }) => {
        const footerContainer = $({
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
        });

        return footerContainer;
    };

    // Build content
    const content = buildContent();

    // Create modal
    modalRef = CustomModal({
        title: 'Poster Rejection Details',
        content: content,
        footer: buildFooter,
        size: 'medium',
        onClose: () => {
            modalRef = null;
        },
        closeOnOverlayClick: true,
        showCloseButton: true
    });

    // Load rejection data after modal is open
    setTimeout(() => {
        loadRejectionData();
    }, 100);

    return modalRef;
};

// Edit Poster - Open modal to upload new poster file
export const editPoster = (poster, onSuccess) => {
    let selectedFile = null
    let fileInput, fileNameDisplay, fileError
    let modalRef = null

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }
        })

        // Display current poster info
        const infoSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e8ecf0'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px 16px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Title',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.title || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Author',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.author || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Event',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.event_name || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Status',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'span',
                                    text: poster.status || 'pending',
                                    style: {
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: poster.status === 'accepted' ? '#2E7D32' : 
                                               poster.status === 'rejected' ? '#C62828' : '#E65100',
                                        textTransform: 'capitalize'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
        container.appendChild(infoSection)

        // File upload section
        const fileSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e8ecf0'
            }
        })

        fileSection.appendChild($({
            tag: 'div',
            style: {
                fontSize: '12px',
                color: '#E91E63',
                marginBottom: '16px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            text: 'REPLACE POSTER FILE'
        }))

        // Show current file
        if (poster.poster_drive_view_url) {
            const currentFile = $({
                tag: 'div',
                style: {
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e8ecf0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-file-pdf' },
                        style: { color: '#E91E63', fontSize: '20px' }
                    }),
                    $({
                        tag: 'span',
                        text: 'Current Poster: ' + (poster.poster_file_name || 'Poster'),
                        style: { flex: 1, fontSize: '13px', color: '#1a2a3a' }
                    }),
                    $({
                        tag: 'button',
                        text: 'View',
                        style: {
                            padding: '4px 12px',
                            backgroundColor: '#E3F2FD',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#1976D2',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                        },
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                FileViewerModal(
                                    poster.poster_drive_view_url,
                                    poster.poster_file_name || 'Poster',
                                    '#E91E63',
                                    { showOpenDrive: true }
                                )
                            }
                        }
                    })
                ]
            })
            fileSection.appendChild(currentFile)
        }

        // Upload area for new file
        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #E91E63',
                borderRadius: '10px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(233, 30, 99, 0.05)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click(),
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'
                    e.currentTarget.style.borderColor = '#E91E63'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.05)'
                    e.currentTarget.style.borderColor = '#E91E63'
                }
            }
        })

        uploadArea.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '40px', color: '#E91E63', marginBottom: '12px', display: 'block' }
        }))

        uploadArea.appendChild($({
            tag: 'div',
            text: 'Click to upload new poster file',
            style: { color: '#E91E63', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }
        }))

        uploadArea.appendChild($({
            tag: 'div',
            text: 'PDF only (Max 10MB)',
            style: { color: '#888', fontSize: '12px' }
        }))

        fileNameDisplay = $({
            tag: 'div',
            style: { marginTop: '12px', fontSize: '12px', color: '#4caf50', textAlign: 'center' }
        })

        fileError = $({
            tag: 'div',
            style: { marginTop: '8px', fontSize: '12px', color: '#f44336', textAlign: 'center' }
        })

        fileInput = $({
            tag: 'input',
            att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        if (file.type !== 'application/pdf') {
                            fileError.innerText = 'Please select a valid PDF file'
                            fileNameDisplay.innerText = ''
                            fileInput.value = ''
                            selectedFile = null
                        } else if (file.size > 10 * 1024 * 1024) {
                            fileError.innerText = 'File size exceeds 10MB limit'
                            fileNameDisplay.innerText = ''
                            fileInput.value = ''
                            selectedFile = null
                        } else {
                            fileError.innerText = ''
                            fileNameDisplay.innerText = `✓ Selected: ${file.name}`
                            selectedFile = file
                        }
                    }
                }
            }
        })

        fileSection.appendChild(uploadArea)
        fileSection.appendChild(fileNameDisplay)
        fileSection.appendChild(fileError)
        fileSection.appendChild(fileInput)
        container.appendChild(fileSection)

        // Warning notice
        const warningNotice = $({
            tag: 'div',
            style: {
                padding: '12px 16px',
                backgroundColor: '#FFF3E0',
                borderRadius: '8px',
                borderLeft: '4px solid #FF9800',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-exclamation-triangle' },
                    style: { color: '#FF9800', fontSize: '16px', marginTop: '2px' }
                }),
                $({
                    tag: 'div',
                    style: { flex: 1 },
                    child: [
                        $({
                            tag: 'div',
                            text: 'This will replace the existing poster file.',
                            style: { color: '#E65100', fontSize: '13px', fontWeight: '500' }
                        }),
                        $({
                            tag: 'div',
                            text: 'The old file will be moved to trash in Google Drive.',
                            style: { color: '#795548', fontSize: '12px' }
                        })
                    ]
                })
            ]
        })
        container.appendChild(warningNotice)

        return container
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

        const cancelBtn = $({
            tag: 'button',
            text: 'Cancel',
            style: {
                padding: '10px 24px',
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
                method: () => {
                    if (modalRef && modalRef.closeModal) {
                        modalRef.closeModal()
                    }
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e8ecf0'
                }
            }
        })

        const submitBtn = $({
            tag: 'button',
            text: 'Update Poster',
            style: {
                padding: '10px 28px',
                backgroundColor: '#E91E63',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: async () => {
                    if (!selectedFile) {
                        AlertModal({
                            title: 'File Required',
                            message: 'Please select a new poster file to upload.'
                        })
                        return
                    }

                    const loading = Waiting()
                    document.body.appendChild(loading)

                    try {
                        const form = new FormData()
                        form.append('updatePoster', 'true')
                        form.append('poster_id', poster.id)
                        form.append('research_id', poster.research_id)
                        form.append('posterFile', selectedFile)

                        const response = await fetch('/uploadFacultyDocs', {
                            method: 'POST',
                            body: form
                        })

                        const result = await response.json()

                        if (loading && loading.remove) loading.remove()

                        if (result.status) {
                            if (closeModal) closeModal()
                            const alertResult = ConfirmationAlert(
                                result.message || 'Poster updated successfully!',
                                () => {
                                    if (onSuccess) onSuccess()
                                },
                                {
                                    title: 'Success',
                                    icon: 'fa-circle-check',
                                    iconColor: '#22c55e',
                                    type: 'success',
                                    duration: 4000
                                }
                            )
                            document.body.appendChild(alertResult.element)
                        } else {
                            AlertModal({
                                title: 'Update Failed',
                                message: result.message || 'Failed to update poster.'
                            })
                        }
                    } catch (error) {
                        if (loading && loading.remove) loading.remove()
                        AlertModal({
                            title: 'Error',
                            message: 'Error updating poster: ' + error.message
                        })
                    }
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#C2185B'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#E91E63'
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })

        footerContainer.appendChild(cancelBtn)
        footerContainer.appendChild(submitBtn)

        return footerContainer
    }

    modalRef = CustomModal({
        title: 'Edit Poster',
        content: buildContent,
        footer: buildFooter,
        size: 'medium',
        onClose: () => {
            modalRef = null
        },
        closeOnOverlayClick: false,
        showCloseButton: true
    })

    return modalRef
}

// Resubmit Poster (for rejected posters)
export const resubmitPoster = (poster, onSuccess) => {
    let selectedFile = null
    let fileInput, fileNameDisplay, fileError
    let modalRef = null

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }
        })

        // Info section with rejection reason
        const infoSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#FFF3E0',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #FFE0B2'
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
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-info-circle' },
                            style: { color: '#FF9800', fontSize: '16px' }
                        }),
                        $({
                            tag: 'span',
                            text: 'Resubmit Poster',
                            style: { color: '#E65100', fontSize: '15px', fontWeight: '600' }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    text: 'Your poster was rejected. Please upload a revised version.',
                    style: { color: '#795548', fontSize: '13px' }
                })
            ]
        })
        container.appendChild(infoSection)

        // Display current poster info
        const posterInfo = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e8ecf0'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px 16px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Title',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.title || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Author',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.author || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Event',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.event_name || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Status',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Rejected',
                                    style: {
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#C62828',
                                        textTransform: 'capitalize'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })
        container.appendChild(posterInfo)

        // File upload section
        const fileSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e8ecf0'
            }
        })

        fileSection.appendChild($({
            tag: 'div',
            style: {
                fontSize: '12px',
                color: '#E91E63',
                marginBottom: '16px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            },
            text: 'UPLOAD REVISED POSTER'
        }))

        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #E91E63',
                borderRadius: '10px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(233, 30, 99, 0.05)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click(),
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'
                    e.currentTarget.style.borderColor = '#E91E63'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.05)'
                    e.currentTarget.style.borderColor = '#E91E63'
                }
            }
        })

        uploadArea.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '40px', color: '#E91E63', marginBottom: '12px', display: 'block' }
        }))

        uploadArea.appendChild($({
            tag: 'div',
            text: 'Click to upload revised poster',
            style: { color: '#E91E63', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }
        }))

        uploadArea.appendChild($({
            tag: 'div',
            text: 'PDF only (Max 10MB)',
            style: { color: '#888', fontSize: '12px' }
        }))

        fileNameDisplay = $({
            tag: 'div',
            style: { marginTop: '12px', fontSize: '12px', color: '#4caf50', textAlign: 'center' }
        })

        fileError = $({
            tag: 'div',
            style: { marginTop: '8px', fontSize: '12px', color: '#f44336', textAlign: 'center' }
        })

        fileInput = $({
            tag: 'input',
            att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
            event: {
                type: 'change',
                method: (e) => {
                    const file = e.target.files[0]
                    if (file) {
                        if (file.type !== 'application/pdf') {
                            fileError.innerText = 'Please select a valid PDF file'
                            fileNameDisplay.innerText = ''
                            fileInput.value = ''
                            selectedFile = null
                        } else if (file.size > 10 * 1024 * 1024) {
                            fileError.innerText = 'File size exceeds 10MB limit'
                            fileNameDisplay.innerText = ''
                            fileInput.value = ''
                            selectedFile = null
                        } else {
                            fileError.innerText = ''
                            fileNameDisplay.innerText = `✓ Selected: ${file.name}`
                            selectedFile = file
                        }
                    }
                }
            }
        })

        fileSection.appendChild(uploadArea)
        fileSection.appendChild(fileNameDisplay)
        fileSection.appendChild(fileError)
        fileSection.appendChild(fileInput)
        container.appendChild(fileSection)

        return container
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

        const cancelBtn = $({
            tag: 'button',
            text: 'Cancel',
            style: {
                padding: '10px 24px',
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
                method: () => {
                    if (modalRef && modalRef.closeModal) {
                        modalRef.closeModal()
                    }
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e8ecf0'
                }
            }
        })

        const submitBtn = $({
            tag: 'button',
            text: 'Resubmit Poster',
            style: {
                padding: '10px 28px',
                backgroundColor: '#1976D2',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'click',
                method: async () => {
                    if (!selectedFile) {
                        AlertModal({
                            title: 'File Required',
                            message: 'Please select a revised poster file to upload.'
                        })
                        return
                    }

                    const loading = Waiting()
                    document.body.appendChild(loading)

                    try {
                        const form = new FormData()
                        form.append('resubmitPoster', 'true')
                        form.append('poster_id', poster.id)
                        form.append('research_id', poster.research_id)
                        form.append('posterFile', selectedFile)

                        const response = await fetch('/uploadFacultyDocs', {
                            method: 'POST',
                            body: form
                        })

                        const result = await response.json()

                        if (loading && loading.remove) loading.remove()

                        if (result.status) {
                            if (closeModal) closeModal()
                            const alertResult = ConfirmationAlert(
                                result.message || 'Poster resubmitted successfully!',
                                () => {
                                    if (onSuccess) onSuccess()
                                },
                                {
                                    title: 'Success',
                                    icon: 'fa-circle-check',
                                    iconColor: '#22c55e',
                                    type: 'success',
                                    duration: 4000
                                }
                            )
                            document.body.appendChild(alertResult.element)
                        } else {
                            AlertModal({
                                title: 'Resubmit Failed',
                                message: result.message || 'Failed to resubmit poster.'
                            })
                        }
                    } catch (error) {
                        if (loading && loading.remove) loading.remove()
                        AlertModal({
                            title: 'Error',
                            message: 'Error resubmitting poster: ' + error.message
                        })
                    }
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#1565C0'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#1976D2'
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })

        footerContainer.appendChild(cancelBtn)
        footerContainer.appendChild(submitBtn)

        return footerContainer
    }

    modalRef = CustomModal({
        title: 'Resubmit Poster',
        content: buildContent,
        footer: buildFooter,
        size: 'medium',
        onClose: () => {
            modalRef = null
        },
        closeOnOverlayClick: false,
        showCloseButton: true
    })

    return modalRef
}

// Delete Poster
export const deletePoster = (poster, onSuccess) => {
    DeleteConfirmModal('Delete Poster', `Are you sure you want to delete the poster for "${poster.title}"? This action cannot be undone and the file will be moved to trash.`).then(async (confirmed) => {
        if (confirmed) {
            const loading = Waiting()
            document.body.appendChild(loading)

            try {
                const form = new FormData()
                form.append('deletePoster', 'true')
                form.append('poster_id', poster.id)
                form.append('research_id', poster.research_id)

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: form
                })

                const result = await response.json()

                if (loading && loading.remove) loading.remove()

                if (result.status) {
                    const alertResult = ConfirmationAlert(
                        result.message || 'Poster deleted successfully!',
                        () => {
                            if (onSuccess) onSuccess()
                        },
                        {
                            title: 'Success',
                            icon: 'fa-circle-check',
                            iconColor: '#22c55e',
                            type: 'success',
                            duration: 4000
                        }
                    )
                    document.body.appendChild(alertResult.element)
                } else {
                    AlertModal({
                        title: 'Delete Failed',
                        message: result.message || 'Failed to delete poster.'
                    })
                }
            } catch (error) {
                if (loading && loading.remove) loading.remove()
                AlertModal({
                    title: 'Error',
                    message: 'Error deleting poster: ' + error.message
                })
            }
        }
    })
}

// Create action buttons for poster row
export const createPosterActionButtons = (poster, onSuccess) => {
    const container = $({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '6px',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            alignItems: 'center'
        }
    })

    const status = poster.status || 'pending'

    const buttonConfigs = {
        edit: {
            background: '#FFF3E0',
            hover: '#FFE0B2',
            icon: '#E65100',
            iconClass: 'fa-edit',
            tooltip: 'Edit Poster',
            show: status === 'pending'
        },
        comments: {
            background: '#E8F5E9',
            hover: '#C8E6C9',
            icon: '#2E7D32',
            iconClass: 'fa-comment-dots',
            tooltip: 'View Comments',
            show: status === 'rejected'
        },
        resubmit: {
            background: '#E3F2FD',
            hover: '#BBDEFB',
            icon: '#1976D2',
            iconClass: 'fa-redo',
            tooltip: 'Resubmit Poster',
            show: status === 'rejected'
        },
        delete: {
            background: '#FFEBEE',
            hover: '#FFCDD2',
            icon: '#D32F2F',
            iconClass: 'fa-trash-alt',
            tooltip: 'Delete Poster',
            show: status === 'pending' || status === 'rejected'
        }
    }

    const addTooltip = (element, text) => {
        element.style.position = 'relative'
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div')
            tooltip.textContent = text
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: #1a2a3a;
                color: white;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                white-space: nowrap;
                margin-bottom: 8px;
                z-index: 1000;
                pointer-events: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            `
            e.currentTarget.style.position = 'relative'
            e.currentTarget.appendChild(tooltip)

            e.currentTarget.addEventListener('mouseleave', () => {
                if (tooltip && tooltip.remove) tooltip.remove()
            }, { once: true })
        })
        return element
    }

    // Edit button
    if (buttonConfigs.edit.show) {
        const editBtn = $({
            tag: 'button',
            style: {
                background: buttonConfigs.edit.background,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: `fas ${buttonConfigs.edit.iconClass}` },
                    style: { color: buttonConfigs.edit.icon, fontSize: '14px' }
                })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation()
                    editPoster(poster, onSuccess)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.background = buttonConfigs.edit.hover
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.background = buttonConfigs.edit.background
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })
        addTooltip(editBtn, buttonConfigs.edit.tooltip)
        container.appendChild(editBtn)
    }

    // Comments button
    if (buttonConfigs.comments.show) {
        const commentsBtn = $({
            tag: 'button',
            style: {
                background: buttonConfigs.comments.background,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: `fas ${buttonConfigs.comments.iconClass}` },
                    style: { color: buttonConfigs.comments.icon, fontSize: '14px' }
                })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation()
                    viewPosterComments(poster)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.background = buttonConfigs.comments.hover
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.background = buttonConfigs.comments.background
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })
        addTooltip(commentsBtn, buttonConfigs.comments.tooltip)
        container.appendChild(commentsBtn)
    }

    // Resubmit button
    if (buttonConfigs.resubmit.show) {
        const resubmitBtn = $({
            tag: 'button',
            style: {
                background: buttonConfigs.resubmit.background,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: `fas ${buttonConfigs.resubmit.iconClass}` },
                    style: { color: buttonConfigs.resubmit.icon, fontSize: '14px' }
                })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation()
                    resubmitPoster(poster, onSuccess)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.background = buttonConfigs.resubmit.hover
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.background = buttonConfigs.resubmit.background
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })
        addTooltip(resubmitBtn, buttonConfigs.resubmit.tooltip)
        container.appendChild(resubmitBtn)
    }

    // Delete button
    if (buttonConfigs.delete.show) {
        const deleteBtn = $({
            tag: 'button',
            style: {
                background: buttonConfigs.delete.background,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: `fas ${buttonConfigs.delete.iconClass}` },
                    style: { color: buttonConfigs.delete.icon, fontSize: '14px' }
                })
            ],
            event: {
                type: 'click',
                method: (e) => {
                    e.stopPropagation()
                    deletePoster(poster, onSuccess)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.background = buttonConfigs.delete.hover
                    e.currentTarget.style.transform = 'translateY(-1px)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.background = buttonConfigs.delete.background
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            }
        })
        addTooltip(deleteBtn, buttonConfigs.delete.tooltip)
        container.appendChild(deleteBtn)
    }

    return container
}
import { $, Waiting, ConfirmationAlert, AlertModal, DeleteConfirmModal, FileViewerModal, CustomModal, DragDropUpload, ValidatePDF } from '../../../../lib/lib.js'

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
                                    text: 'Paper Trail No',
                                    style: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'div',
                                    text: poster.paper_trail_no || '—',
                                    style: { fontSize: '13px', color: '#1a2a3a', fontWeight: '500', fontFamily: 'monospace' }
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

// Create action buttons for poster row - ALL buttons shown regardless of status
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

    // All buttons are always shown - no status filtering
    const buttonConfigs = {
        edit: {
            background: '#FFF3E0',
            hover: '#FFE0B2',
            icon: '#E65100',
            iconClass: 'fa-edit',
            tooltip: 'Edit Poster'
        },
        delete: {
            background: '#FFEBEE',
            hover: '#FFCDD2',
            icon: '#D32F2F',
            iconClass: 'fa-trash-alt',
            tooltip: 'Delete Poster'
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

    // Edit button - always shown
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

    // Delete button - always shown
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

    return container
}
// posterModal.js
import { $, Waiting, ConfirmationAlert, AlertModal, CustomModal, DragDropUpload, ValidatePDF } from '../../../../lib/lib.js'

export const PosterSubmissionModal = ({ onSuccess, onClose }) => {
    let searchInput, searchResultsContainer, selectedPaperDisplay
    let selectedResearch = null
    let formData = {
        research_id: null,
        title: '',
        author: '',
        coAuthors: [],
        campus: '',
        center: '',
        category: '',
        event_name: '',
        event_id: null,
        posterFile: null
    }
    let paperSearchResults = []
    let modalRef = null

    // Build the main content
    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                padding: '4px 0'
            }
        })

        // Search Section
        const searchSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e8ecf0'
            }
        })

        // Section header
        const searchHeader = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-search' },
                    style: { color: '#1976D2', fontSize: '20px' }
                }),
                $({
                    tag: 'span',
                    text: 'Search Accepted Papers',
                    style: {
                        color: '#1a2a3a',
                        fontSize: '16px',
                        fontWeight: '600'
                    }
                }),
                $({
                    tag: 'span',
                    style: {
                        backgroundColor: '#e3f2fd',
                        color: '#1976D2',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                    },
                    text: 'Required'
                })
            ]
        })
        searchSection.appendChild(searchHeader)
        
        const infoBanner = $({
            tag: 'div',
            style: {
                backgroundColor: '#E3F2FD',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                borderLeft: '4px solid #1976D2'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-info-circle' },
                    style: { color: '#1976D2', fontSize: '16px', marginTop: '2px' }
                }),
                $({
                    tag: 'div',
                    style: { flex: 1 },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Only one poster per paper is allowed.',
                            style: {
                                color: '#0D47A1',
                                fontSize: '13px',
                                fontWeight: '600',
                                marginBottom: '2px'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Papers that already have a submitted poster will not appear in the search results.',
                            style: {
                                color: '#1565C0',
                                fontSize: '12px'
                            }
                        })
                    ]
                })
            ]
        })
        searchSection.appendChild(infoBanner)

        // Search input wrapper
        const searchWrapper = $({
            tag: 'div',
            style: {
                position: 'relative',
                width: '100%'
            }
        })

        searchInput = $({
            tag: 'input',
            att: {
                type: 'text',
                placeholder: 'Search by title, author',
                autocomplete: 'off'
            },
            style: {
                width: '100%',
                padding: '14px 16px',
                paddingRight: '48px',
                backgroundColor: '#ffffff',
                border: '2px solid #e8ecf0',
                borderRadius: '12px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                outline: 'none'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(25, 118, 210, 0.1)'
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0'
                    e.currentTarget.style.boxShadow = 'none'
                },
                type3: 'input',
                method3: (e) => {
                    const searchTerm = e.target.value.trim()
                    if (searchTerm.length >= 2) {
                        searchPapers(searchTerm)
                    } else {
                        searchResultsContainer.style.display = 'none'
                        searchResultsContainer.innerHTML = ''
                    }
                }
            }
        })

        const searchIcon = $({
            tag: 'i',
            att: { className: 'fas fa-search' },
            style: {
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '18px',
                pointerEvents: 'none'
            }
        })

        searchWrapper.appendChild(searchInput)
        searchWrapper.appendChild(searchIcon)
        searchSection.appendChild(searchWrapper)

        // Search results container
        searchResultsContainer = $({
            tag: 'div',
            style: {
                marginTop: '12px',
                maxHeight: '280px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e8ecf0',
                display: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }
        })
        searchSection.appendChild(searchResultsContainer)

        container.appendChild(searchSection)

        // Selected Paper Display
        selectedPaperDisplay = $({
            tag: 'div',
            style: {
                display: 'none',
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                padding: '20px 24px',
                border: '1px solid #bbf7d0'
            }
        })

        const selectedHeader = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-check-circle' },
                    style: { color: '#22c55e', fontSize: '20px' }
                }),
                $({
                    tag: 'span',
                    text: 'Selected Paper',
                    style: {
                        color: '#15803d',
                        fontSize: '15px',
                        fontWeight: '600'
                    }
                })
            ]
        })
        selectedPaperDisplay.appendChild(selectedHeader)

        // Paper details container
        const detailsContainer = $({
            tag: 'div',
            att: { id: 'selectedPaperDetails' },
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e8ecf0'
            }
        })
        selectedPaperDisplay.appendChild(detailsContainer)

        container.appendChild(selectedPaperDisplay)

        // Poster Upload Section
        const uploadSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e8ecf0'
            }
        })

        const uploadHeader = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-file-pdf' },
                    style: { color: '#ef4444', fontSize: '20px' }
                }),
                $({
                    tag: 'span',
                    text: 'Poster Attachment',
                    style: {
                        color: '#1a2a3a',
                        fontSize: '16px',
                        fontWeight: '600'
                    }
                }),
                $({
                    tag: 'span',
                    style: {
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                    },
                    text: 'Required'
                })
            ]
        })
        uploadSection.appendChild(uploadHeader)

        // Description
        uploadSection.appendChild($({
            tag: 'div',
            text: 'Upload your poster in PDF format. Maximum file size is 30MB.',
            style: {
                color: '#64748b',
                fontSize: '13px',
                marginBottom: '16px'
            }
        }))

        // Drag and Drop Upload
        let posterUpload = null
        const uploadContainer = $({
            tag: 'div',
            style: { marginBottom: '0' }
        })

        const uploadElement = DragDropUpload({
            label: '',
            accept: '.pdf,application/pdf',
            multiple: false,
            required: true,
            maxSizeMB: 10,
            description: 'Drag & drop your poster PDF here or click to browse',
            onFileSelect: async (files, allFiles) => {
                if (files && files.length > 0) {
                    const file = files[0]
                    const validation = await ValidatePDF(file, 10)
                    if (validation.valid) {
                        formData.posterFile = file
                    } else {
                        ConfirmationAlert('Invalid PDF: ' + validation.error, null, {
                            title: 'Invalid File',
                            icon: 'fa-circle-xmark',
                            iconColor: '#ef4444',
                            type: 'error',
                            duration: 4000
                        })
                        if (posterUpload && posterUpload.clearFiles) {
                            posterUpload.clearFiles()
                        }
                        formData.posterFile = null
                    }
                }
            },
            onFileRemove: () => {
                formData.posterFile = null
            }
        })

        posterUpload = uploadElement
        uploadContainer.appendChild(uploadElement.element)
        uploadSection.appendChild(uploadContainer)

        container.appendChild(uploadSection)

        return container
    }

    // Build footer with action buttons
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
                    if (onClose) onClose()
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
            text: 'Submit Poster',
            style: {
                padding: '10px 28px',
                backgroundColor: '#1976D2',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
            },
            event: {
                type: 'click',
                method: () => handleSubmit(closeModal),
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#1565C0'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.3)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#1976D2'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.2)'
                }
            }
        })

        footerContainer.appendChild(cancelBtn)
        footerContainer.appendChild(submitBtn)

        return footerContainer
    }

    // Search papers from database
    const searchPapers = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) {
            searchResultsContainer.style.display = 'none'
            searchResultsContainer.innerHTML = ''
            return
        }

        // Show loading state
        searchResultsContainer.style.display = 'block'
        searchResultsContainer.innerHTML = ''
        const loadingDiv = $({
            tag: 'div',
            style: {
                padding: '24px',
                textAlign: 'center',
                color: '#94a3b8'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-spinner fa-pulse' },
                    style: { fontSize: '24px', display: 'block', marginBottom: '8px', color: '#1976D2' }
                }),
                $({ tag: 'span', text: 'Searching...' })
            ]
        })
        searchResultsContainer.appendChild(loadingDiv)

        try {
            const form = new FormData()
            form.append('searchAcceptedPapers', 'true')
            form.append('searchTerm', searchTerm)

            const response = await fetch('/uploadFacultyDocs', {
                method: 'POST',
                body: form
            })

            if (!response.ok) {
                throw new Error('Server error: ' + response.status)
            }

            const data = await response.json()

            searchResultsContainer.innerHTML = ''

            if (data.status && data.data && data.data.length > 0) {
                paperSearchResults = data.data
                paperSearchResults.forEach(paper => {
                    const resultItem = createResultItem(paper)
                    searchResultsContainer.appendChild(resultItem)
                })
            } else {
                const noResult = $({
                    tag: 'div',
                    style: {
                        padding: '32px',
                        textAlign: 'center',
                        color: '#94a3b8'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-inbox' },
                            style: { fontSize: '32px', display: 'block', marginBottom: '12px', color: '#cbd5e1' }
                        }),
                        $({
                            tag: 'span',
                            text: 'No accepted papers found matching your search.'
                        })
                    ]
                })
                searchResultsContainer.appendChild(noResult)
            }

        } catch (error) {
            console.error('Search error:', error)
            searchResultsContainer.innerHTML = ''
            const errorDiv = $({
                tag: 'div',
                style: {
                    padding: '24px',
                    textAlign: 'center',
                    color: '#ef4444'
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-exclamation-triangle' },
                        style: { fontSize: '24px', display: 'block', marginBottom: '8px' }
                    }),
                    $({ tag: 'span', text: 'Error searching papers. Please try again.' })
                ]
            })
            searchResultsContainer.appendChild(errorDiv)
        }
    }

    // Create result item
    const createResultItem = (paper) => {
        const item = $({
            tag: 'div',
            style: {
                padding: '14px 18px',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
            },
            event: {
                type: 'click',
                method: () => selectPaper(paper),
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                }
            }
        })

        const info = $({
            tag: 'div',
            style: { flex: 1, minWidth: 0 }
        })

        info.appendChild($({
            tag: 'div',
            text: paper.title || 'Untitled',
            style: {
                color: '#1a2a3a',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }
        }))

        const meta = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: '#64748b'
            }
        })

        meta.appendChild($({
            tag: 'span',
            text: `Author: ${paper.author || '—'}`
        }))

        if (paper.event_name) {
            meta.appendChild($({
                tag: 'span',
                text: `Event: ${paper.event_name}`
            }))
        }

        info.appendChild(meta)
        item.appendChild(info)

        // Select indicator
        item.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-chevron-right' },
            style: {
                color: '#94a3b8',
                fontSize: '14px',
                flexShrink: 0
            }
        }))

        return item
    }

    // Select a paper
    const selectPaper = (paper) => {
        selectedResearch = paper
        formData.research_id = paper.id
        formData.title = paper.title || ''
        formData.author = paper.author || ''
        formData.coAuthors = paper.coauthors || []
        formData.campus = paper.campus || ''
        formData.center = paper.center || ''
        formData.category = paper.category || ''
        formData.event_name = paper.event_name || ''
        formData.event_id = paper.event_id || null

        // Update selected display
        searchResultsContainer.style.display = 'none'
        searchResultsContainer.innerHTML = ''
        searchInput.value = `${paper.title} (${paper.author})`
        selectedPaperDisplay.style.display = 'block'

        const detailsContainer = document.getElementById('selectedPaperDetails')
        if (detailsContainer) {
            detailsContainer.innerHTML = ''

            const fields = [
                { label: 'Title', value: paper.title || '—' },
                { label: 'Author', value: paper.author || '—' },
                { label: 'Co-Authors', value: Array.isArray(paper.coauthors) && paper.coauthors.length > 0 ? paper.coauthors.join(', ') : '—' },
                { label: 'Campus / Center', value: paper.campus || paper.center || '—' },
                { label: 'Category', value: paper.category || '—' },
                { label: 'Event', value: paper.event_name || '—' }
            ]

            fields.forEach(field => {
                const fieldDiv = $({
                    tag: 'div',
                    style: {
                        padding: '6px 0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: field.label,
                            style: {
                                fontSize: '11px',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: field.value,
                            style: {
                                fontSize: '13px',
                                color: '#1a2a3a',
                                fontWeight: '500',
                                wordBreak: 'break-word'
                            }
                        })
                    ]
                })
                detailsContainer.appendChild(fieldDiv)
            })
        }

        // Scroll to selected paper display
        selectedPaperDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Handle form submission
    const handleSubmit = async (closeModal) => {
        // Validate
        if (!selectedResearch) {
            ConfirmationAlert('Please search and select an accepted paper.', null, {
                title: 'Required',
                icon: 'fa-circle-xmark',
                iconColor: '#ef4444',
                type: 'error',
                duration: 4000
            })
            return
        }

        if (!formData.posterFile) {
            ConfirmationAlert('Please upload your poster file.', null, {
                title: 'Required',
                icon: 'fa-circle-xmark',
                iconColor: '#ef4444',
                type: 'error',
                duration: 4000
            })
            return
        }

        const loading = Waiting()
        document.body.appendChild(loading)

        try {
            const submitForm = new FormData()
            submitForm.append('submitPoster', 'true')
            submitForm.append('research_id', formData.research_id)
            submitForm.append('event_id', formData.event_id || '')
            submitForm.append('event_name', formData.event_name)
            submitForm.append('title', formData.title)
            submitForm.append('author', formData.author)
            submitForm.append('coAuthors', JSON.stringify(formData.coAuthors))
            submitForm.append('campus', formData.campus)
            submitForm.append('center', formData.center)
            submitForm.append('category', formData.category)

            if (formData.posterFile) {
                submitForm.append('posterFile', formData.posterFile)
            }

            const response = await fetch('/uploadFacultyDocs', {
                method: 'POST',
                body: submitForm
            })

            const result = await response.json()

            if (loading && loading.remove) loading.remove()

            if (result.status) {
                if (closeModal) closeModal()

                const alertResult = ConfirmationAlert(
                    result.message || 'Poster submitted successfully!',
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

                // Reset form
                resetForm()
            } else {
                ConfirmationAlert(
                    result.message || 'Failed to submit poster. Please try again.',
                    null,
                    {
                        title: 'Submission Failed',
                        icon: 'fa-circle-xmark',
                        iconColor: '#ef4444',
                        type: 'error',
                        duration: 4000
                    }
                )
            }
        } catch (error) {
            if (loading && loading.remove) loading.remove()
            console.error('Poster submission error:', error)
            ConfirmationAlert(
                'Error submitting poster: ' + error.message,
                null,
                {
                    title: 'Error',
                    icon: 'fa-circle-xmark',
                    iconColor: '#ef4444',
                    type: 'error',
                    duration: 5000
                }
            )
        }
    }

    // Reset form
    const resetForm = () => {
        selectedResearch = null
        formData = {
            research_id: null,
            title: '',
            author: '',
            coAuthors: [],
            campus: '',
            center: '',
            category: '',
            event_name: '',
            event_id: null,
            posterFile: null
        }
        searchInput.value = ''
        selectedPaperDisplay.style.display = 'none'
        const detailsContainer = document.getElementById('selectedPaperDetails')
        if (detailsContainer) detailsContainer.innerHTML = ''
        searchResultsContainer.style.display = 'none'
        searchResultsContainer.innerHTML = ''
    }

    // Create and open the modal
    modalRef = CustomModal({
        title: 'Submit Poster',
        content: buildContent,
        footer: buildFooter,
        size: 'large',
        onClose: () => {
            if (onClose) onClose()
            modalRef = null
        },
        closeOnOverlayClick: false,
        showCloseButton: true
    })

    return modalRef
}
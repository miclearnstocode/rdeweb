import { $, Waiting, ConfirmationAlert, DragDropUpload, ValidatePDF, CustomModal } from '../../../lib/lib.js'

export const SymposiumModal = ({ eventName, eventId, onClose, onSuccess, embedded = false }) => {
    let currentStep = 1
    let modalContainer
    let stepIndicators
    let stepContents
    let inhouseReviewsList = []

    let formData = {
        presentation_type: null,

        // Local In-House Review fields
        local_title: '',
        local_campus: '',
        local_category: '',
        local_center: '',
        local_author: '',
        local_presenter: '',
        local_coAuthors: [],
        local_researchFile: null,
        local_endorsementFile: null,
        local_program: null,
        local_certificateFile: null,

        // Title change fields
        title_changed: false,
        new_title: '',
        title_certificate_file: null,

        // University In-House Review fields
        selected_inhouse_id: null,
        selected_university_review: null,
        university_title: '',
        university_author: '',
        university_category: '',
        university_center: '',
        university_coauthors: [],

        // Symposium fields
        title: '',
        category: '',
        center: '',
        author: '',
        presenter: '',
        coAuthors: [],
        date_started: '',
        date_completed: '',
        campus: '',
        researchFile: null,
        endorsementFile: null
    }

    const centerCategoryMapping = {
        "Extension (Extension)": ["Extension"]
    }

    const categoryToCenters = {}
    Object.entries(centerCategoryMapping).forEach(([center, categories]) => {
        categories.forEach(category => {
            if (!categoryToCenters[category]) categoryToCenters[category] = []
            categoryToCenters[category].push(center)
        })
    })

    const categories = [
        "Extension"
    ]

    const createModal = () => {
        let modalRef = null

        const buildContent = ({ closeModal }) => {
            const container = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    minHeight: '400px'
                }
            })

            const stepWrapper = $({
                tag: 'div',
                style: {
                    padding: '0 0 20px 0',
                    borderBottom: '1px solid #e8ecf0',
                    flexShrink: 0
                }
            })

            stepIndicators = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    position: 'relative'
                }
            })

            const steps = [
                { number: 1, title: 'In-House Review' },
                { number: 2, title: 'Title Change' },
                { number: 3, title: 'Symposium Details' }
            ]

            steps.forEach((step, index) => {
                const stepItem = $({
                    tag: 'div',
                    style: {
                        flex: 1,
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: step.number.toString(),
                            style: {
                                width: '34px',
                                height: '34px',
                                backgroundColor: index === 0 ? '#1976D2' : '#e8ecf0',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: index === 0 ? '#fff' : '#94a3b8',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '8px',
                                transition: 'all 0.3s ease'
                            },
                            att: { className: `step-circle-${step.number}` }
                        }),
                        $({
                            tag: 'div',
                            text: step.title,
                            style: {
                                color: index === 0 ? '#1976D2' : '#94a3b8',
                                fontSize: '12px',
                                fontWeight: index === 0 ? '600' : '400',
                                transition: 'all 0.3s ease'
                            },
                            att: { className: `step-text-${step.number}` }
                        })
                    ]
                })
                stepIndicators.appendChild(stepItem)
            })

            const progressLineBg = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '17px',
                    left: '0',
                    right: '0',
                    height: '3px',
                    backgroundColor: '#e8ecf0',
                    zIndex: 1,
                    borderRadius: '2px'
                }
            })

            const progressFill = $({
                tag: 'div',
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    height: '100%',
                    width: '33.33%',
                    backgroundColor: '#1976D2',
                    transition: 'width 0.4s ease',
                    zIndex: 2,
                    borderRadius: '2px'
                },
                att: { className: 'progress-fill' }
            })

            progressLineBg.appendChild(progressFill)
            stepIndicators.appendChild(progressLineBg)
            stepWrapper.appendChild(stepIndicators)

            const stepsContainer = $({
                tag: 'div',
                style: {
                    flex: 1,
                    overflow: 'auto',
                    padding: '24px 0 0 0',
                    minHeight: '300px'
                }
            })

            stepContents = []

            const step1Content = createStep1Content()
            stepContents.push(step1Content)

            const step2Content = createStep2Content()
            stepContents.push(step2Content)

            const step3Content = createStep3Content()
            stepContents.push(step3Content)

            stepContents.forEach((content, idx) => {
                content.style.display = idx === 0 ? 'block' : 'none'
                stepsContainer.appendChild(content)
            })

            container.appendChild(stepWrapper)
            container.appendChild(stepsContainer)

            return container
        }

        const buildFooter = ({ closeModal }) => {
            const footerContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: '12px'
                }
            })

            const leftDiv = $({ tag: 'div' })

            const rightDiv = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px'
                }
            })

            // Previous button
            const prevBtn = $({
                tag: 'button',
                text: 'Previous',
                style: {
                    padding: '10px 24px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'none',
                    transition: 'all 0.2s ease'
                },
                att: { className: 'footer-prev', type: 'button' },
                event: {
                    type: 'click',
                    method: () => navigateStep(-1),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e8ecf0';
                    }
                }
            })

            // Next button
            const nextBtn = $({
                tag: 'button',
                text: 'Next',
                style: {
                    padding: '10px 28px',
                    backgroundColor: '#1976D2',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                },
                att: { className: 'footer-next', type: 'button' },
                event: {
                    type: 'click',
                    method: () => handleNext(),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#1565C0';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#1976D2';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }
            })

            // Submit button
            const submitBtn = $({
                tag: 'button',
                text: 'Submit Symposium Entry',
                style: {
                    padding: '10px 28px',
                    backgroundColor: '#4caf50',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'none',
                    transition: 'all 0.2s ease'
                },
                att: { className: 'footer-submit', type: 'button', disabled: false },
                event: {
                    type: 'click',
                    method: () => submitSymposium(),
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#388E3C';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#4caf50';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }
            })

            rightDiv.appendChild(prevBtn)
            rightDiv.appendChild(nextBtn)
            rightDiv.appendChild(submitBtn)

            footerContainer.appendChild(leftDiv)
            footerContainer.appendChild(rightDiv)

            return footerContainer
        }

        const navigateStep = (delta) => {
            const newStep = currentStep + delta
            if (newStep < 1 || newStep > 3) return

            // Validate current step before proceeding
            if (delta === 1) {
                const currentStepContent = stepContents[currentStep - 1]
                if (currentStepContent && currentStepContent.__validate) {
                    if (!currentStepContent.__validate()) return
                }
            }

            // Update step 2 reference if coming from step 1
            if (delta === 1 && currentStep === 1 && stepContents[1] && stepContents[1].__updateReference) {
                stepContents[1].__updateReference()
            }

            // Hide current step
            const currentContent = stepContents[currentStep - 1]
            if (currentContent) {
                currentContent.style.display = 'none'
            }

            currentStep = newStep

            // Show new step
            const newContent = stepContents[currentStep - 1]
            if (newContent) {
                newContent.style.display = 'block'
            }

            // Update step indicators
            for (let i = 1; i <= 3; i++) {
                const circle = document.querySelector(`.step-circle-${i}`)
                const text = document.querySelector(`.step-text-${i}`)
                if (circle) {
                    circle.style.backgroundColor = i <= currentStep ? '#1976D2' : '#e8ecf0'
                    circle.style.color = i <= currentStep ? '#fff' : '#94a3b8'
                }
                if (text) {
                    text.style.color = i <= currentStep ? '#1976D2' : '#94a3b8'
                    text.style.fontWeight = i <= currentStep ? '600' : '400'
                }
            }

            // Update progress line fill
            const progressFill = document.querySelector('.progress-fill')
            if (progressFill) {
                const progressPercentage = (currentStep / 3) * 100
                progressFill.style.width = `${progressPercentage}%`
            }

            // Update buttons
            const prevBtn = document.querySelector('.footer-prev')
            const nextBtn = document.querySelector('.footer-next')
            const submitBtn = document.querySelector('.footer-submit')

            if (prevBtn) {
                prevBtn.style.display = currentStep === 1 ? 'none' : 'block'
            }
            if (nextBtn) {
                nextBtn.style.display = currentStep === 3 ? 'none' : 'block'
            }
            if (submitBtn) {
                submitBtn.style.display = currentStep === 3 ? 'block' : 'none'
                submitBtn.disabled = false
            }

            // Auto-fill Step 3 when navigating to it
            if (currentStep === 3 && stepContents[2] && stepContents[2].syncFromLocalReview) {
                setTimeout(() => {
                    stepContents[2].syncFromLocalReview()
                }, 100)
            }
        }

        const handleNext = () => navigateStep(1)

        modalRef = CustomModal({
            title: `Symposium Submission: ${eventName}`,
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

        modalContainer = modalRef?.element

        return modalRef?.element
    }

    const createStep1Content = () => {
        const container = $({ tag: 'div' })

        // Store references
        let searchInput = null
        let searchResultsContainer = null
        let selectedInhouseId = null
        let filteredReviewsList = []

        // File display references
        let programFileNameDisplay, programFileInput
        let certificateFileNameDisplay, certificateFileInput

        // Local form field references
        let localTitleInput, localCampusInput, localCategorySelect, localCenterSelect
        let localAuthorInput, localPresenterInput, localCoAuthorListContainer

        const createLocalFileUploadField = (label, fieldName, onFileSelect) => {
            const containerDiv = $({ tag: 'div' })
            containerDiv.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '32px',
                    minHeight: '130px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc'
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
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '28px', color: '#1976D2', marginBottom: '6px', display: 'block' }
            }))
            uploadArea.appendChild($({ tag: 'div', text: 'Click to upload', style: { color: '#64748b', fontSize: '13px', fontWeight: '500' } }))
            uploadArea.appendChild($({ tag: 'div', text: 'PDF only, Max 10MB', style: { color: '#94a3b8', fontSize: '11px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '6px', fontSize: '12px', color: '#2e7d32', textAlign: 'center', fontWeight: '500' } })

            const fileInput = $({
                tag: 'input',
                att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
                event: {
                    type: 'change',
                    method: (e) => {
                        const file = e.target.files[0]
                        if (file) {
                            const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                            if (!isPdfFile) {
                                ConfirmationAlert('Please select a valid PDF file', () => { })
                                fileInput.value = ''
                                return
                            }
                            if (file.size > 10 * 1024 * 1024) {
                                ConfirmationAlert('File size exceeds 10MB limit', () => { })
                                fileInput.value = ''
                                return
                            }
                            onFileSelect(file)
                            fileNameDisplay.innerText = `✓ ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}`
                        }
                    }
                }
            })

            containerDiv.appendChild(uploadArea)
            containerDiv.appendChild(fileNameDisplay)
            containerDiv.appendChild(fileInput)

            // Store references for reset
            if (fieldName === 'local_programFile') {
                programFileNameDisplay = fileNameDisplay
                programFileInput = fileInput
            } else if (fieldName === 'local_certificateFile') {
                certificateFileNameDisplay = fileNameDisplay
                certificateFileInput = fileInput
            }

            return containerDiv
        }

        const updateLocalCoAuthorList = () => {
            if (!localCoAuthorListContainer) return
            localCoAuthorListContainer.innerHTML = ''
                ; (formData.local_coAuthors || []).forEach((author, idx) => {
                    const tag = $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#e8f5e9',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px'
                        },
                        child: [
                            $({ tag: 'span', text: author, style: { color: '#2e7d32' } }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#666', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        formData.local_coAuthors.splice(idx, 1)
                                        updateLocalCoAuthorList()
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                                    type3: 'mouseleave',
                                    method3: (e) => { e.currentTarget.style.color = '#666' }
                                }
                            })
                        ]
                    })
                    localCoAuthorListContainer.appendChild(tag)
                })
        }

        // Info box
        const infoBox = $({
            tag: 'div',
            style: {
                backgroundColor: '#e3f2fd',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                borderLeft: '4px solid #1976D2'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-info-circle' }, style: { color: '#1976D2', fontSize: '18px', marginTop: '2px' } }),
                        $({
                            tag: 'div',
                            style: { flex: 1 },
                            child: [
                                $({ tag: 'div', text: 'In-House Review Required', style: { color: '#1976D2', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'This symposium requires that your paper was first presented in an In-House Review.', style: { color: '#475569', fontSize: '13px' } })
                            ]
                        })
                    ]
                })
            ]
        })
        container.appendChild(infoBox)

        // ========== PRESENTATION TYPE SELECTION ==========
        const typeSection = $({ tag: 'div', style: { marginBottom: '24px' } })
        typeSection.appendChild($({
            tag: 'label',
            text: 'Where was the paper presented for In-House Review? *',
            style: { display: 'block', color: '#334155', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }
        }))

        const typeOptions = $({ tag: 'div', style: { display: 'flex', gap: '16px' } })

        // Local option container
        const localContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                border: '2px solid #e8ecf0',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                },
                type2: 'mouseleave',
                method2: (e) => {
                    if (e.currentTarget.style.borderColor !== '#1976D2') {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e8ecf0';
                    }
                }
            }
        })

        const localRadio = $({
            tag: 'input',
            att: { type: 'radio', name: 'presentation_type', value: 'local' },
            style: { marginRight: '12px', cursor: 'pointer', accentColor: '#1976D2' },
            event: {
                type: 'change',
                method: (e) => {
                    if (e.target.checked) {
                        formData.presentation_type = 'local'
                        localContainer.style.borderColor = '#1976D2'
                        localContainer.style.backgroundColor = '#e3f2fd'
                        universityContainer.style.borderColor = '#e8ecf0'
                        universityContainer.style.backgroundColor = '#f8fafc'
                        localFieldsContainer.style.display = 'block'
                        universityFields.style.display = 'none'
                        formData.university_title = ''
                        formData.selected_inhouse_id = null
                    }
                }
            }
        })

        const localTitleSpan = $({ tag: 'span', text: 'Local In-House Review', style: { fontWeight: '600', color: '#1a2a3a' } })
        const localDescSpan = $({ tag: 'div', text: 'Presented at campus/center level', style: { fontSize: '12px', color: '#64748b', marginTop: '8px', marginLeft: '28px' } })
        const localRadioLabel = $({ tag: 'label', style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, child: [localRadio, localTitleSpan] })

        localContainer.appendChild(localRadioLabel)
        localContainer.appendChild(localDescSpan)

        localContainer.addEventListener('click', () => {
            localRadio.checked = true
            formData.presentation_type = 'local'
            // Ensure these are always set
            formData.local_category = 'Extension'
            formData.local_center = 'Extension (Extension)'
            localContainer.style.borderColor = '#1976D2'
            localContainer.style.backgroundColor = '#e3f2fd'
            universityContainer.style.borderColor = '#e8ecf0'
            universityContainer.style.backgroundColor = '#f8fafc'
            localFieldsContainer.style.display = 'block'
            universityFields.style.display = 'none'
            formData.university_title = ''
            formData.selected_inhouse_id = null

            // Reset the auto-fill flag in step 3 so it can be re-applied
            if (stepContents[2] && stepContents[2].resetAutoFill) {
                stepContents[2].resetAutoFill()
            }
        })

        // University option container
        const universityContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                border: '2px solid #e8ecf0',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'mouseenter',
                method: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                },
                type2: 'mouseleave',
                method2: (e) => {
                    if (e.currentTarget.style.borderColor !== '#1976D2') {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e8ecf0';
                    }
                }
            }
        })

        const universityRadio = $({
            tag: 'input',
            att: { type: 'radio', name: 'presentation_type', value: 'university' },
            style: { marginRight: '12px', cursor: 'pointer', accentColor: '#1976D2' },
            event: {
                type: 'change',
                method: (e) => {
                    if (e.target.checked) {
                        formData.presentation_type = 'university'
                        universityContainer.style.borderColor = '#1976D2'
                        universityContainer.style.backgroundColor = '#e3f2fd'
                        localContainer.style.borderColor = '#e8ecf0'
                        localContainer.style.backgroundColor = '#f8fafc'
                        localFieldsContainer.style.display = 'none'
                        universityFields.style.display = 'block'

                        // Reset local form data
                        formData.local_title = ''
                        formData.local_campus = ''
                        formData.local_category = ''
                        formData.local_center = 'Extension (Extension)'
                        formData.local_author = ''
                        formData.local_presenter = ''
                        formData.local_coAuthors = []
                        formData.local_program = null
                        formData.local_certificateFile = null

                        // Clear local fields
                        if (localTitleInput) localTitleInput.value = ''
                        if (localCampusInput) localCampusInput.value = ''
                        if (localCategorySelect) localCategorySelect.value = ''
                        if (localCenterSelect) localCenterSelect.innerHTML = ''
                        if (localAuthorInput) localAuthorInput.value = ''
                        if (localPresenterInput) localPresenterInput.value = ''
                        if (localCoAuthorListContainer) localCoAuthorListContainer.innerHTML = ''
                        if (programFileNameDisplay) programFileNameDisplay.innerText = ''
                        if (programFileInput) programFileInput.value = ''
                        if (certificateFileNameDisplay) certificateFileNameDisplay.innerText = ''
                        if (certificateFileInput) certificateFileInput.value = ''

                        // Load in-house reviews when university is selected
                        if (inhouseReviewsList.length === 0) {
                            loadInhouseReviews()
                        }
                    }
                }
            }
        })

        const universityTitleSpan = $({ tag: 'span', text: 'University In-House Review', style: { fontWeight: '600', color: '#1a2a3a' } })
        const universityDescSpan = $({ tag: 'div', text: 'Presented at university level', style: { fontSize: '12px', color: '#64748b', marginTop: '8px', marginLeft: '28px' } })
        const universityRadioLabel = $({ tag: 'label', style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, child: [universityRadio, universityTitleSpan] })

        universityContainer.appendChild(universityRadioLabel)
        universityContainer.appendChild(universityDescSpan)

        universityContainer.addEventListener('click', () => {
            universityRadio.checked = true
            formData.presentation_type = 'university'
            universityContainer.style.borderColor = '#1976D2'
            universityContainer.style.backgroundColor = '#e3f2fd'
            localContainer.style.borderColor = '#e8ecf0'
            localContainer.style.backgroundColor = '#f8fafc'
            localFieldsContainer.style.display = 'none'
            universityFields.style.display = 'block'

            // Reset local form data
            formData.local_title = ''
            formData.local_campus = ''
            formData.local_category = ''
            formData.local_center = 'Extension (Extension)'
            formData.local_author = ''
            formData.local_presenter = ''
            formData.local_coAuthors = []
            formData.local_program = null
            formData.local_certificateFile = null

            // Clear local fields
            if (localTitleInput) localTitleInput.value = ''
            if (localCampusInput) localCampusInput.value = ''
            if (localCategorySelect) localCategorySelect.value = ''
            if (localCenterSelect) localCenterSelect.innerHTML = ''
            if (localAuthorInput) localAuthorInput.value = ''
            if (localPresenterInput) localPresenterInput.value = ''
            if (localCoAuthorListContainer) localCoAuthorListContainer.innerHTML = ''
            if (programFileNameDisplay) programFileNameDisplay.innerText = ''
            if (programFileInput) programFileInput.value = ''
            if (certificateFileNameDisplay) certificateFileNameDisplay.innerText = ''
            if (certificateFileInput) certificateFileInput.value = ''

            if (inhouseReviewsList.length === 0) {
                loadInhouseReviews()
            }
        })

        typeOptions.appendChild(localContainer)
        typeOptions.appendChild(universityContainer)
        typeSection.appendChild(typeOptions)
        container.appendChild(typeSection)

        // ========== LOCAL FIELDS CONTAINER (Hidden by default) ==========
        const localFieldsContainer = $({ tag: 'div', style: { display: 'none' } })

        // Two column grid for local fields
        const localGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }
        })

        // --- Left Column ---
        const leftColumn = $({ tag: 'div', style: { display: 'flex', flexDirection: 'column', gap: '20px' } })

        // Document Title
        const localTitleSection = $({ tag: 'div' })
        localTitleSection.appendChild($({
            tag: 'label',
            text: 'Document Title *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        localTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Exact title presented in Local In-House Review' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value

                    let words = value.split(' ')
                    let capitalized = words.map(word => {
                        if (word.length === 0) return word
                        return word.charAt(0).toUpperCase() + word.slice(1)
                    }).join(' ')

                    if (capitalized !== value) {
                        input.value = capitalized
                        input.setSelectionRange(start, end)
                        formData.local_title = capitalized
                    } else {
                        formData.local_title = value
                    }
                    formData.selected_inhouse_id = null

                    // Sync to step 3 if local is selected
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            }
        })
        localTitleSection.appendChild(localTitleInput)
        leftColumn.appendChild(localTitleSection)

        // Campus
        const localCampusSection = $({ tag: 'div' })
        localCampusSection.appendChild($({
            tag: 'label',
            text: 'Campus *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        localCampusInput = $({
            tag: 'select',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'change',
                method3: (e) => {
                    formData.local_campus = e.target.value
                    // Sync to step 3 if local is selected
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            },
            elementHandler: (el) => {
                const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']
                el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                campuses.forEach(campus => {
                    el.appendChild($({ tag: 'option', text: campus, att: { value: campus }, style: { color: '#1a2a3a' } }))
                })
            }
        })
        localCampusSection.appendChild(localCampusInput)
        leftColumn.appendChild(localCampusSection)

        // Category - Fixed to Extension
        const localCategorySection = $({ tag: 'div' })
        localCategorySection.appendChild($({
            tag: 'label',
            text: 'Category *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        const categoryDisplay = $({
            tag: 'div',
            text: 'Extension',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px'
            }
        })

        const categoryHidden = $({
            tag: 'input',
            att: { type: 'hidden', value: 'Extension' }
        })

        localCategorySection.appendChild(categoryHidden)
        localCategorySection.appendChild(categoryDisplay)
        formData.local_category = 'Extension'
        leftColumn.appendChild(localCategorySection)
        formData.local_center = 'Extension (Extension)'

        // --- Right Column ---
        const rightColumn = $({ tag: 'div', style: { display: 'flex', flexDirection: 'column', gap: '20px' } })

        // Main Author
        const localAuthorSection = $({ tag: 'div' })
        localAuthorSection.appendChild($({
            tag: 'label',
            text: 'Main Author *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        localAuthorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter main author name' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value

                    let words = value.split(' ')
                    let capitalized = words.map(word => {
                        if (word.length === 0) return word
                        return word.charAt(0).toUpperCase() + word.slice(1)
                    }).join(' ')

                    if (capitalized !== value) {
                        input.value = capitalized
                        input.setSelectionRange(start, end)
                        formData.local_author = capitalized
                    } else {
                        formData.local_author = value
                    }
                    // Sync to step 3 if local is selected
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            }
        })
        localAuthorSection.appendChild(localAuthorInput)
        rightColumn.appendChild(localAuthorSection)

        // Presenter
        const localPresenterSection = $({ tag: 'div' })
        localPresenterSection.appendChild($({
            tag: 'label',
            text: 'Presenter *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        localPresenterInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter presenter name' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value

                    let words = value.split(' ')
                    let capitalized = words.map(word => {
                        if (word.length === 0) return word
                        return word.charAt(0).toUpperCase() + word.slice(1)
                    }).join(' ')

                    if (capitalized !== value) {
                        input.value = capitalized
                        input.setSelectionRange(start, end)
                        formData.local_presenter = capitalized
                    } else {
                        formData.local_presenter = value
                    }
                    // Sync to step 3 if local is selected
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            }
        })
        localPresenterSection.appendChild(localPresenterInput)
        rightColumn.appendChild(localPresenterSection)

        // Co-Authors section
        const localCoAuthorSection = $({ tag: 'div' })
        localCoAuthorSection.appendChild($({
            tag: 'label',
            text: 'Co-Authors',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        const localCoAuthorInputGroup = $({ tag: 'div', style: { display: 'flex', gap: '10px', marginBottom: '12px' } })
        const localCoAuthorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter co-author name' },
            style: {
                flex: 1,
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value

                    let words = value.split(' ')
                    let capitalized = words.map(word => {
                        if (word.length === 0) return word
                        return word.charAt(0).toUpperCase() + word.slice(1)
                    }).join(' ')

                    if (capitalized !== value) {
                        input.value = capitalized
                        input.setSelectionRange(start, end)
                    }
                }
            }
        })

        const localCoAuthorAddBtn = $({
            tag: 'button',
            text: 'Add',
            style: {
                padding: '8px 20px',
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
                method: () => {
                    const name = localCoAuthorInput.value.trim()
                    if (name) {
                        if (!formData.local_coAuthors) formData.local_coAuthors = []
                        formData.local_coAuthors.push(name)
                        updateLocalCoAuthorList()
                        localCoAuthorInput.value = ''
                        if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                            setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                        }
                    }
                },
                type2: 'mouseenter',
                method2: (e) => { e.currentTarget.style.backgroundColor = '#1565C0' },
                type3: 'mouseleave',
                method3: (e) => { e.currentTarget.style.backgroundColor = '#1976D2' }
            }
        })

        localCoAuthorInputGroup.appendChild(localCoAuthorInput)
        localCoAuthorInputGroup.appendChild(localCoAuthorAddBtn)

        localCoAuthorListContainer = $({
            tag: 'div',
            style: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
            att: { className: 'local-coauthor-list' }
        })

        localCoAuthorSection.appendChild(localCoAuthorInputGroup)
        localCoAuthorSection.appendChild(localCoAuthorListContainer)
        rightColumn.appendChild(localCoAuthorSection)
        localGrid.appendChild(leftColumn)
        localGrid.appendChild(rightColumn)
        localFieldsContainer.appendChild(localGrid)

        const localFileUploadsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e8ecf0'
            }
        })
        localFileUploadsGrid.appendChild(createLocalFileUploadField('Program File *', 'local_programFile', (file) => { formData.local_program = file }))
        localFileUploadsGrid.appendChild(createLocalFileUploadField('Certificate File *', 'local_certificateFile', (file) => { formData.local_certificateFile = file }))

        localFieldsContainer.appendChild(localFileUploadsGrid)

        // ========== UNIVERSITY FIELDS ==========
        const universityFields = $({ tag: 'div', style: { display: 'none' } })

        // Loading indicator
        const loadingDiv = $({
            tag: 'div',
            style: { textAlign: 'center', padding: '20px', color: '#64748b' },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '24px', marginBottom: '10px', display: 'block', color: '#1976D2' } }),
                $({ tag: 'div', text: 'Loading your accepted in-house reviews...' })
            ]
        })

        // Search input for university in-house review
        const searchSection = $({ tag: 'div', style: { marginBottom: '24px' } })
        searchSection.appendChild($({
            tag: 'label',
            text: 'Search Accepted University In-House Review *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        const searchWrapper = $({
            tag: 'div',
            style: { position: 'relative', width: '100%' }
        })

        searchInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Type to search by title or author...' },
            style: {
                width: '100%',
                padding: '12px 14px',
                paddingRight: '40px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    const searchTerm = e.target.value.toLowerCase()
                    filterAndDisplayResults(searchTerm)
                }
            }
        })

        const searchIcon = $({
            tag: 'i',
            att: { className: 'fas fa-search' },
            style: {
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '16px'
            }
        })

        searchWrapper.appendChild(searchInput)
        searchWrapper.appendChild(searchIcon)
        searchSection.appendChild(searchWrapper)

        searchResultsContainer = $({
            tag: 'div',
            style: {
                marginTop: '12px',
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e8ecf0',
                display: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }
        })

        searchSection.appendChild(searchResultsContainer)
        universityFields.appendChild(searchSection)

        const selectedReviewSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#e8f5e9',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'none',
                border: '1px solid #c8e6c9'
            },
            att: { id: 'selectedReviewDisplay' }
        })

        const selectedReviewContent = $({
            tag: 'div',
            style: { fontSize: '13px' },
            child: []
        })
        selectedReviewSection.appendChild(selectedReviewContent)
        universityFields.appendChild(selectedReviewSection)

        const filterAndDisplayResults = (searchTerm) => {
            if (!searchTerm || searchTerm.trim() === '') {
                searchResultsContainer.style.display = 'none'
                searchResultsContainer.innerHTML = ''
                return
            }

            filteredReviewsList = inhouseReviewsList.filter(review =>
                review.title.toLowerCase().includes(searchTerm) ||
                review.author.toLowerCase().includes(searchTerm)
            )

            if (filteredReviewsList.length === 0) {
                searchResultsContainer.style.display = 'block'
                searchResultsContainer.innerHTML = ''
                const noResult = $({
                    tag: 'div',
                    style: { padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' },
                    text: 'No matching in-house reviews found'
                })
                searchResultsContainer.appendChild(noResult)
                return
            }

            searchResultsContainer.style.display = 'block'
            searchResultsContainer.innerHTML = ''

            filteredReviewsList.forEach(review => {
                const resultItem = $({
                    tag: 'div',
                    style: {
                        padding: '12px 16px',
                        borderBottom: '1px solid #e8ecf0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: '#ffffff'
                    },
                    event: {
                        type: 'click',
                        method: () => selectInhouseReview(review),
                        type2: 'mouseenter',
                        method2: (e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' },
                        type3: 'mouseleave',
                        method3: (e) => { e.currentTarget.style.backgroundColor = '#ffffff' }
                    },
                    child: [
                        $({ tag: 'div', style: { color: '#1a2a3a', fontWeight: '500', marginBottom: '4px' }, text: review.title }),
                        $({ tag: 'div', style: { color: '#64748b', fontSize: '12px' }, text: `Author: ${review.author}` }),
                        review.event_name ? $({ tag: 'div', style: { color: '#94a3b8', fontSize: '11px', marginTop: '4px' }, text: `Event: ${review.event_name}` }) : null
                    ]
                })
                searchResultsContainer.appendChild(resultItem)
            })
        }

        const selectInhouseReview = (selected) => {
            formData.university_title = selected.title
            formData.selected_inhouse_id = selected.id
            formData.university_author = selected.author
            formData.university_category = selected.category
            formData.university_center = 'Extension (Extension)'
            formData.university_coauthors = selected.coauthors || []
            formData.selected_university_review = selected

            searchInput.value = `${selected.title} (${selected.author})`
            searchResultsContainer.style.display = 'none'
            searchResultsContainer.innerHTML = ''
            selectedReviewSection.style.display = 'block'
            selectedReviewContent.innerHTML = ''

            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#2e7d32', marginBottom: '8px', fontWeight: 'bold' }, text: '✓ Presented in In-House Review:' }))
            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#1a2a3a', marginBottom: '4px' }, text: `Title: ${selected.title}` }))
            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#475569', fontSize: '12px', marginBottom: '4px' }, text: `Author: ${selected.author}` }))

            if (selected.coauthors && selected.coauthors.length > 0) {
                const coauthorsText = selected.coauthors.join(', ')
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#475569', fontSize: '12px', marginBottom: '4px' }, text: `Co-Authors: ${coauthorsText}` }))
            }

            if (selected.category) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#475569', fontSize: '12px', marginBottom: '4px' }, text: `Category: ${selected.category}` }))
            }
            if (selected.center) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#475569', fontSize: '12px', marginBottom: '4px' }, text: `Center: ${selected.center}` }))
            }
            if (selected.event_name) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#64748b', fontSize: '11px', marginTop: '4px' }, text: `Event: ${selected.event_name}` }))
            }

            const changeLink = $({
                tag: 'div',
                style: { marginTop: '12px', textAlign: 'right' },
                child: [
                    $({
                        tag: 'span',
                        text: 'Change Selection',
                        style: { color: '#1976D2', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.2s ease' },
                        event: {
                            type: 'click',
                            method: () => {
                                selectedReviewSection.style.display = 'none'
                                searchInput.value = ''
                                formData.selected_inhouse_id = null
                                formData.selected_university_review = null
                                formData.university_title = ''
                                formData.university_coauthors = []
                            },
                            type2: 'mouseenter',
                            method2: (e) => { e.currentTarget.style.color = '#1565C0' },
                            type3: 'mouseleave',
                            method3: (e) => { e.currentTarget.style.color = '#1976D2' }
                        }
                    })
                ]
            })
            selectedReviewContent.appendChild(changeLink)

            if (stepContents[2] && stepContents[2].autoFillFromUniversityReview) {
                stepContents[2].autoFillFromUniversityReview(selected)
            }
        }

        const loadInhouseReviews = async () => {
            loadingDiv.style.display = 'block'
            searchInput.disabled = true
            searchInput.placeholder = 'Loading reviews...'

            try {
                const formDataReq = new FormData()
                formDataReq.append('getAcceptedInhouseReviews', 'true')

                const response = await fetch('/uploadExtensionDocs', {
                    method: 'POST',
                    body: formDataReq
                })

                const result = await response.json()

                searchInput.disabled = false
                searchInput.placeholder = 'Type to search by title or author...'

                if (result.status && result.data && result.data.length > 0) {
                    inhouseReviewsList = result.data
                    loadingDiv.style.display = 'none'
                } else {
                    loadingDiv.innerHTML = ''
                    loadingDiv.appendChild($({
                        tag: 'div',
                        style: { textAlign: 'center', padding: '20px', color: '#ef4444' },
                        child: [
                            $({ tag: 'i', att: { className: 'fas fa-exclamation-circle' }, style: { fontSize: '24px', display: 'block', marginBottom: '10px' } }),
                            $({ tag: 'div', text: 'No accepted in-house reviews found. Please complete an in-house review first.' })
                        ]
                    }))
                    searchInput.disabled = true
                }
            } catch (error) {
                console.error('Error loading in-house reviews:', error)
                searchInput.disabled = false
                loadingDiv.innerHTML = ''
                loadingDiv.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '20px', color: '#ef4444' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-exclamation-triangle' }, style: { fontSize: '24px', display: 'block', marginBottom: '10px' } }),
                        $({ tag: 'div', text: 'Error loading in-house reviews. Please refresh and try again.' })
                    ]
                }))
            }
        }

        universityFields.appendChild(loadingDiv)

        // Append local and university fields to container
        container.appendChild(localFieldsContainer)
        container.appendChild(universityFields)

        // Click outside to close results
        document.addEventListener('click', (e) => {
            if (searchResultsContainer && !searchResultsContainer.contains(e.target) && e.target !== searchInput) {
                searchResultsContainer.style.display = 'none'
            }
        })

        container.__validate = () => {
            if (!formData.presentation_type) {
                ConfirmationAlert('Please select where the paper was presented for In-House Review', () => { })
                return false
            }

            if (formData.presentation_type === 'local') {
                // Ensure category and center are always set
                formData.local_category = 'Extension'
                formData.local_center = 'Extension (Extension)'

                if (!formData.local_title || formData.local_title.trim() === '') {
                    ConfirmationAlert('Please enter the Document Title', () => { })
                    return false
                }
                if (!formData.local_campus || formData.local_campus.trim() === '') {
                    ConfirmationAlert('Please select the Campus', () => { })
                    return false
                }
                // Category is now always set, but check just in case
                if (!formData.local_category || formData.local_category.trim() === '') {
                    formData.local_category = 'Extension'
                }
                // Center is now always set, but check just in case
                if (!formData.local_center || formData.local_center.trim() === '') {
                    formData.local_center = 'Extension (Extension)'
                }
                if (!formData.local_author || formData.local_author.trim() === '') {
                    ConfirmationAlert('Please enter the Main Author', () => { })
                    return false
                }
                if (!formData.local_presenter || formData.local_presenter.trim() === '') {
                    ConfirmationAlert('Please enter the Presenter', () => { })
                    return false
                }
                if (!formData.local_program) {
                    ConfirmationAlert('Please upload the Program File', () => { })
                    return false
                }
                if (!formData.local_certificateFile) {
                    ConfirmationAlert('Please upload the Certificate File', () => { })
                    return false
                }
            } else if (formData.presentation_type === 'university') {
                if (!formData.selected_inhouse_id) {
                    ConfirmationAlert('Please search and select an accepted University In-House Review', () => { })
                    return false
                }
            }

            return true
        }

        return container
    }

    const createStep2Content = () => {
        const container = $({ tag: 'div' })

        // Info box
        const infoBox = $({
            tag: 'div',
            style: {
                backgroundColor: '#fff3e0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                borderLeft: '4px solid #FF9800'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-pen' }, style: { color: '#FF9800', fontSize: '18px', marginTop: '2px' } }),
                        $({
                            tag: 'div',
                            style: { flex: 1 },
                            child: [
                                $({ tag: 'div', text: 'Title Change Tracking', style: { color: '#E65100', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'If the symposium title differs from the In-House Review title, please indicate the new title below.', style: { color: '#475569', fontSize: '13px' } })
                            ]
                        })
                    ]
                })
            ]
        })
        container.appendChild(infoBox)

        // Display In-House title for reference (dynamic based on selection)
        const refSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '24px',
                border: '1px solid #e8ecf0'
            },
            child: [
                $({ tag: 'div', text: 'In-House Review Title:', style: { color: '#64748b', fontSize: '12px', marginBottom: '4px' } }),
                $({ tag: 'div', text: '—', style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' }, att: { id: 'refInhouseTitle' } })
            ]
        })
        container.appendChild(refSection)

        // Title change checkbox
        const checkboxSection = $({ tag: 'div', style: { marginBottom: '24px' } })

        const checkboxLabel = $({
            tag: 'label',
            style: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
            child: [
                $({
                    tag: 'input',
                    att: { type: 'checkbox' },
                    style: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1976D2' },
                    event: {
                        type: 'change',
                        method: (e) => {
                            formData.title_changed = e.target.checked
                            newTitleContainer.style.display = formData.title_changed ? 'block' : 'none'
                            certificateAttachmentContainer.style.display = formData.title_changed ? 'block' : 'none'
                            if (!formData.title_changed) {
                                formData.new_title = ''
                                formData.title_certificate_file = null
                                if (certificateUpload && certificateUpload.clearFiles) {
                                    certificateUpload.clearFiles()
                                }
                            }
                        }
                    }
                }),
                $({ tag: 'span', text: 'Has the research title changed for the Symposium?', style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' } })
            ]
        })
        checkboxSection.appendChild(checkboxLabel)
        container.appendChild(checkboxSection)

        // New title field
        const newTitleContainer = $({ tag: 'div', style: { display: 'none', marginBottom: '24px' } })
        newTitleContainer.appendChild($({
            tag: 'label',
            text: 'New Research Title for Symposium *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        newTitleContainer.appendChild($({
            tag: 'div',
            text: 'This will be saved as the Final Symposium Title',
            style: { color: '#64748b', fontSize: '12px', marginBottom: '8px' }
        }))

        const newTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'New symposium title' },
            style: {
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e8ecf0',
                borderRadius: '10px',
                color: '#1a2a3a',
                fontSize: '14px',
                transition: 'all 0.2s ease'
            },
            event: {
                type: 'focus',
                method: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                },
                type2: 'blur',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                },
                type3: 'input',
                method3: (e) => {
                    formData.new_title = e.target.value
                }
            }
        })
        newTitleContainer.appendChild(newTitleInput)
        container.appendChild(newTitleContainer)

        // ===== CERTIFICATE ATTACHMENT SECTION =====
        const certificateAttachmentContainer = $({
            tag: 'div',
            style: {
                display: 'none',
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e8ecf0'
            }
        })

        // Header for certificate section
        const certHeader = $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-certificate' },
                    style: { color: '#1976D2', fontSize: '20px' }
                }),
                $({
                    tag: 'span',
                    text: 'Certificate of Title Change (Optional)',
                    style: { color: '#1a2a3a', fontSize: '16px', fontWeight: '600' }
                })
            ]
        })
        certificateAttachmentContainer.appendChild(certHeader)

        // Description
        certificateAttachmentContainer.appendChild($({
            tag: 'div',
            text: 'Please upload the Certificate of Title Change as proof of the research title change.',
            style: { color: '#64748b', fontSize: '13px', marginBottom: '16px' }
        }))

        // Drag and Drop Upload for Certificate
        let certificateUpload = null
        const uploadContainer = $({
            tag: 'div',
            style: { marginBottom: '12px' }
        })

        const uploadElement = DragDropUpload({
            accept: '.pdf',
            multiple: false,
            required: false,
            maxSizeMB: 10,
            description: 'Upload the certificate of title change (PDF only)',
            onFileSelect: async (files, allFiles) => {
                if (files && files.length > 0) {
                    const file = files[0]
                    const validation = await ValidatePDF(file, 10)
                    if (validation.valid) {
                        formData.title_certificate_file = file
                    } else {
                        ConfirmationAlert('Invalid Certificate: ' + validation.error, () => { })
                        if (certificateUpload && certificateUpload.clearFiles) {
                            certificateUpload.clearFiles()
                        }
                        formData.title_certificate_file = null
                    }
                }
            },
            onFileRemove: (file, index, allFiles) => {
                formData.title_certificate_file = null
            }
        })

        certificateUpload = uploadElement
        uploadContainer.appendChild(uploadElement.element)
        certificateAttachmentContainer.appendChild(uploadContainer)

        // Validation note
        certificateAttachmentContainer.appendChild($({
            tag: 'div',
            style: {
                fontSize: '12px',
                color: '#64748b',
                padding: '8px 12px',
                backgroundColor: '#fff8e1',
                borderRadius: '8px',
                borderLeft: '3px solid #FFC107'
            },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-info-circle' }, style: { color: '#FFC107', marginRight: '8px' } }),
                $({ tag: 'span', text: 'Only PDF files are accepted. Maximum file size: 10MB.' })
            ]
        }))

        container.appendChild(certificateAttachmentContainer)

        // Store reference for validation
        container.__validate = () => {
            if (formData.title_changed) {
                if (!formData.new_title || formData.new_title.trim() === '') {
                    ConfirmationAlert('Please enter the new research title for the Symposium', () => { })
                    return false
                }
            }
            return true
        }

        const updateReference = () => {
            const refEl = refSection.querySelector('#refInhouseTitle')
            if (refEl) {
                if (formData.presentation_type === 'local') {
                    refEl.innerText = (formData.local_title && formData.local_title.trim() !== '') ? formData.local_title : '—'
                } else if (formData.presentation_type === 'university') {
                    if (formData.selected_university_review && formData.selected_university_review.title) {
                        refEl.innerText = formData.selected_university_review.title
                    } else if (formData.university_title && formData.university_title.trim() !== '') {
                        refEl.innerText = formData.university_title
                    } else {
                        refEl.innerText = '—'
                    }
                } else {
                    refEl.innerText = '—'
                }
            }
        }

        container.__updateReference = updateReference

        return container
    }

    const createStep3Content = () => {
        const container = $({ tag: 'div' })

        // Store references to elements
        let categorySelectEl = null
        let centerSelectEl = null
        let campusSelectEl = null
        let authorInputEl = null
        let presenterInputEl = null
        let coAuthorListContainer = null
        let dateStartedEl = null
        let dateCompletedEl = null

        let syncAttempts = 0
        const MAX_SYNC_ATTEMPTS = 20

        const syncFromLocalReview = () => {
            syncAttempts++

            // Check if we have local in-house data
            if (formData.presentation_type !== 'local') {
                return
            }

            // Get current local data from Step 1
            const localData = {
                campus: formData.local_campus || '',
                category: formData.local_category || 'Extension',
                center: formData.local_center || '',
                author: formData.local_author || '',
                coAuthors: formData.local_coAuthors || []
            }

            // Only sync if we have data
            if (!localData.author && !localData.category && !localData.campus && !localData.center && localData.coAuthors.length === 0) {
                return
            }

            // Check if elements are ready - if not, retry
            if (!categorySelectEl || !centerSelectEl || !campusSelectEl || !coAuthorListContainer) {
                if (syncAttempts < MAX_SYNC_ATTEMPTS) {
                    setTimeout(syncFromLocalReview, 300)
                }
                return
            }

            // Set Category
            if (localData.category && categorySelectEl) {
                const options = Array.from(categorySelectEl.options).map(opt => opt.value)
                if (options.includes(localData.category)) {
                    categorySelectEl.value = localData.category
                    formData.category = localData.category
                    // Trigger change event to populate centers
                    const changeEvent = new Event('change', { bubbles: true })
                    categorySelectEl.dispatchEvent(changeEvent)
                }
            }

            // Set Campus
            if (localData.campus && campusSelectEl) {
                const options = Array.from(campusSelectEl.options).map(opt => opt.value)
                if (options.includes(localData.campus)) {
                    campusSelectEl.value = localData.campus
                    formData.campus = localData.campus
                }
            }

            // Set Author
            if (localData.author && authorInputEl) {
                authorInputEl.value = localData.author
                formData.author = localData.author
            }

            // Set Co-Authors
            if (localData.coAuthors && coAuthorListContainer) {
                formData.coAuthors = [...localData.coAuthors]
                coAuthorListContainer.innerHTML = ''
                if (localData.coAuthors.length > 0) {
                    localData.coAuthors.forEach((author, idx) => {
                        const tag = $({
                            tag: 'div',
                            style: {
                                backgroundColor: '#e8f5e9',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                margin: '2px'
                            },
                            child: [
                                $({ tag: 'span', text: author, style: { color: '#2e7d32' } }),
                                $({
                                    tag: 'i',
                                    att: { className: 'fas fa-times' },
                                    style: { color: '#666', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            formData.coAuthors.splice(idx, 1)
                                            updateCoAuthorList()
                                        },
                                        type2: 'mouseenter',
                                        method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                                        type3: 'mouseleave',
                                        method3: (e) => { e.currentTarget.style.color = '#666' }
                                    }
                                })
                            ]
                        })
                        coAuthorListContainer.appendChild(tag)
                    })
                }
            }

            // Set Center - after centers are populated
            setTimeout(() => {
                if (localData.center && centerSelectEl) {
                    const options = Array.from(centerSelectEl.options).map(opt => opt.value)

                    if (options.includes(localData.center)) {
                        centerSelectEl.value = localData.center
                        formData.center = localData.center
                    } else {
                        // Manually populate centers if needed
                        const category = localData.category || formData.category
                        if (category) {
                            const centers = categoryToCenters[category] || Object.keys(centerCategoryMapping)
                            centerSelectEl.innerHTML = ''
                            const defaultOpt = $({
                                tag: 'option',
                                att: { value: '', disabled: true, selected: true },
                                text: '-- Select Center --',
                                style: { color: '#94a3b8' }
                            })
                            centerSelectEl.appendChild(defaultOpt)
                            centers.forEach(center => {
                                const opt = $({
                                    tag: 'option',
                                    att: { value: center },
                                    text: center,
                                    style: { color: '#1a2a3a' }
                                })
                                centerSelectEl.appendChild(opt)
                            })
                            if (centers.includes(localData.center)) {
                                centerSelectEl.value = localData.center
                                formData.center = localData.center
                            }
                        }
                    }
                }
            }, 500)
        }

        const autoFillFromUniversityReview = (selectedReview) => {
            if (!selectedReview) return

            if (selectedReview.category && categorySelectEl) {
                const options = Array.from(categorySelectEl.options).map(opt => opt.value)
                if (options.includes(selectedReview.category)) {
                    categorySelectEl.value = selectedReview.category
                    formData.category = selectedReview.category
                    const changeEvent = new Event('change', { bubbles: true })
                    categorySelectEl.dispatchEvent(changeEvent)
                }
            }

            setTimeout(() => {
                if (selectedReview.center && centerSelectEl) {
                    const options = Array.from(centerSelectEl.options).map(opt => opt.value)
                    if (options.includes(selectedReview.center)) {
                        centerSelectEl.value = selectedReview.center
                        formData.center = selectedReview.center
                    }
                }
            }, 150)

            if (selectedReview.author && authorInputEl) {
                authorInputEl.value = selectedReview.author
                formData.author = selectedReview.author
            }

            if (selectedReview.coauthors && selectedReview.coauthors.length > 0 && coAuthorListContainer) {
                formData.coAuthors = [...selectedReview.coauthors]
                updateCoAuthorList()
            }

            if (selectedReview.campus && campusSelectEl) {
                const options = Array.from(campusSelectEl.options).map(opt => opt.value)
                if (options.includes(selectedReview.campus)) {
                    campusSelectEl.value = selectedReview.campus
                    formData.campus = selectedReview.campus
                }
            }

            if (selectedReview.date_started && dateStartedEl) {
                dateStartedEl.value = selectedReview.date_started
                formData.date_started = selectedReview.date_started
            }

            if (selectedReview.date_completed && dateCompletedEl) {
                dateCompletedEl.value = selectedReview.date_completed
                formData.date_completed = selectedReview.date_completed
            }
        }

        const updateCoAuthorList = () => {
            if (!coAuthorListContainer) return
            coAuthorListContainer.innerHTML = ''
                ; (formData.coAuthors || []).forEach((author, idx) => {
                    const tag = $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#e8f5e9',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            margin: '2px'
                        },
                        child: [
                            $({ tag: 'span', text: author, style: { color: '#2e7d32' } }),
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-times' },
                                style: { color: '#666', fontSize: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        formData.coAuthors.splice(idx, 1)
                                        updateCoAuthorList()
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => { e.currentTarget.style.color = '#ef4444' },
                                    type3: 'mouseleave',
                                    method3: (e) => { e.currentTarget.style.color = '#666' }
                                }
                            })
                        ]
                    })
                    coAuthorListContainer.appendChild(tag)
                })
        }

        const updateCenters = (category) => {
            const centers = categoryToCenters[category] || Object.keys(centerCategoryMapping)
            if (centerSelectEl) {
                const localCenterValue = formData.local_center || ''

                centerSelectEl.innerHTML = ''
                const defaultOpt = $({
                    tag: 'option',
                    att: { value: '', disabled: true, selected: true },
                    text: '-- Select Center --',
                    style: { color: '#94a3b8' }
                })
                centerSelectEl.appendChild(defaultOpt)
                centers.forEach(center => {
                    const opt = $({
                        tag: 'option',
                        att: { value: center },
                        text: center,
                        style: { color: '#1a2a3a' }
                    })
                    centerSelectEl.appendChild(opt)
                })

                if (localCenterValue && centers.includes(localCenterValue)) {
                    centerSelectEl.value = localCenterValue
                    formData.center = localCenterValue
                } else {
                    formData.center = ''
                }
            }
        }

        // ===== CREATE FORM FIELDS using the $ library =====
        const createCampusDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Campus *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const select = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'change',
                    method3: (e) => {
                        formData.campus = e.target.value
                    }
                },
                elementHandler: (el) => {
                    const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']
                    el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                    campuses.forEach(campus => {
                        el.appendChild($({ tag: 'option', text: campus, att: { value: campus }, style: { color: '#1a2a3a' } }))
                    })
                    campusSelectEl = el
                }
            })

            container.appendChild(select)
            return container
        }

        const createCategoryDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Category *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const select = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'change',
                    method3: (e) => {
                        const selectedCategory = e.target.value
                        formData.category = selectedCategory
                        updateCenters(selectedCategory)
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                    categories.forEach(cat => {
                        el.appendChild($({ tag: 'option', text: cat, att: { value: cat }, style: { color: '#1a2a3a' } }))
                    })
                    categorySelectEl = el
                }
            })

            container.appendChild(select)
            return container
        }

        const createCenterDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Center *',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const select = $({
                tag: 'select',
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'change',
                    method3: (e) => {
                        formData.center = e.target.value
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                    centerSelectEl = el
                }
            })

            container.appendChild(select)
            return container
        }

        const createTextField = (label, placeholder, onInput) => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const input = $({
                tag: 'input',
                att: { type: 'text', placeholder: placeholder },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        const inputEl = e.target;
                        const start = inputEl.selectionStart;
                        const end = inputEl.selectionEnd;
                        let value = inputEl.value;

                        let words = value.split(' ');
                        let capitalized = words.map(word => {
                            if (word.length === 0) return word;
                            return word.charAt(0).toUpperCase() + word.slice(1);
                        }).join(' ');

                        if (capitalized !== value) {
                            inputEl.value = capitalized;
                            inputEl.setSelectionRange(start, end);
                            if (onInput) onInput(capitalized);
                        } else {
                            if (onInput) onInput(value);
                        }
                    }
                }
            })

            // Store reference
            if (label.includes('Main Author')) {
                authorInputEl = input
            } else if (label.includes('Presenter')) {
                presenterInputEl = input
            }

            container.appendChild(input)
            return container
        }

        const createDateField = (label, onChange) => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const input = $({
                tag: 'input',
                att: { type: 'date' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'change',
                    method3: (e) => {
                        onChange(e)
                    }
                }
            })

            if (label.includes('Started')) {
                dateStartedEl = input
            } else if (label.includes('Completed')) {
                dateCompletedEl = input
            }

            container.appendChild(input)
            return container
        }

        const createFileUploadField = (label, fieldName) => {
            const container = $({ tag: 'div' })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc'
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
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '32px', color: '#1976D2', marginBottom: '8px', display: 'block' }
            }))
            uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' } }))
            uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#64748b', fontSize: '12px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '8px', fontSize: '12px', color: '#2e7d32', textAlign: 'center', fontWeight: '500' } })

            const fileInput = $({
                tag: 'input',
                att: { type: 'file', accept: '.pdf,application/pdf', style: 'display: none' },
                event: {
                    type: 'change',
                    method: (e) => {
                        const file = e.target.files[0]
                        if (file) {
                            const isPdfFile = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                            if (!isPdfFile) {
                                ConfirmationAlert('Please select a valid PDF file', () => { })
                                fileInput.value = ''
                                return
                            }
                            if (file.size > 10 * 1024 * 1024) {
                                ConfirmationAlert('File size exceeds 10MB limit', () => { })
                                fileInput.value = ''
                                return
                            }
                            formData[fieldName] = file
                            fileNameDisplay.innerText = `✓ Selected: ${file.name}`
                        }
                    }
                }
            })

            container.appendChild(uploadArea)
            container.appendChild(fileNameDisplay)
            container.appendChild(fileInput)

            return container
        }

        const createCoAuthorField = (updateCoAuthorListFn) => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Co-Authors',
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const inputGroup = $({ tag: 'div', style: { display: 'flex', gap: '10px', marginBottom: '12px' } })
            const input = $({
                tag: 'input',
                att: { type: 'text', placeholder: 'Enter co-author name' },
                style: {
                    flex: 1,
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#1a2a3a',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                },
                event: {
                    type: 'focus',
                    method: (e) => {
                        e.currentTarget.style.borderColor = '#1976D2';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    },
                    type2: 'blur',
                    method2: (e) => {
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                    },
                    type3: 'input',
                    method3: (e) => {
                        const inputEl = e.target
                        const start = inputEl.selectionStart
                        const end = inputEl.selectionEnd
                        let value = inputEl.value

                        let words = value.split(' ')
                        let capitalized = words.map(word => {
                            if (word.length === 0) return word
                            return word.charAt(0).toUpperCase() + word.slice(1)
                        }).join(' ')

                        if (capitalized !== value) {
                            inputEl.value = capitalized
                            inputEl.setSelectionRange(start, end)
                        }
                    }
                }
            })
            const addBtn = $({
                tag: 'button',
                text: 'Add',
                style: {
                    padding: '8px 20px',
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
                    method: () => {
                        const name = input.value.trim()
                        if (name) {
                            formData.coAuthors.push(name)
                            updateCoAuthorListFn()
                            input.value = ''
                        }
                    },
                    type2: 'mouseenter',
                    method2: (e) => { e.currentTarget.style.backgroundColor = '#1565C0' },
                    type3: 'mouseleave',
                    method3: (e) => { e.currentTarget.style.backgroundColor = '#1976D2' }
                }
            })

            const listContainer = $({
                tag: 'div',
                style: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
                att: { className: 'coauthor-list' }
            })

            inputGroup.appendChild(input)
            inputGroup.appendChild(addBtn)
            container.appendChild(inputGroup)
            container.appendChild(listContainer)

            coAuthorListContainer = listContainer
            return container
        }

        // ===== BUILD THE FORM =====
        // Add info box showing source of data
        const sourceInfo = $({
            tag: 'div',
            style: {
                backgroundColor: formData.presentation_type === 'local' ? '#e3f2fd' : '#e8f5e9',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                borderLeft: `4px solid ${formData.presentation_type === 'local' ? '#1976D2' : '#4caf50'}`
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '10px', alignItems: 'center' },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: formData.presentation_type === 'local' ? 'fas fa-building' : 'fas fa-university' },
                            style: { color: formData.presentation_type === 'local' ? '#1976D2' : '#4caf50', fontSize: '16px' }
                        }),
                        $({
                            tag: 'span',
                            text: formData.presentation_type === 'local'
                                ? 'Data synced from Local In-House Review. Edits here will NOT affect Step 1.'
                                : 'Data pre-filled from University In-House Review. Edits here will NOT affect Step 1.',
                            style: { color: '#1a2a3a', fontSize: '13px' }
                        })
                    ]
                })
            ]
        })
        container.appendChild(sourceInfo)

        const twoColumnLayout = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }
        })

        const campusDropdown = createCampusDropdown()
        const categoryDropdown = createCategoryDropdown()
        const centerDropdown = createCenterDropdown()
        const authorField = createTextField('Main Author *', 'Author Name', (value) => { formData.author = value })
        const presenterField = createTextField('Presenter *', 'Presenter name', (value) => { formData.presenter = value })
        const coAuthorField = createCoAuthorField(updateCoAuthorList)
        const dateStarted = createDateField('Date Started *', (e) => { formData.date_started = e.target.value })
        const dateCompleted = createDateField('Date Completed *', (e) => { formData.date_completed = e.target.value })

        twoColumnLayout.appendChild(campusDropdown)
        twoColumnLayout.appendChild(categoryDropdown)
        twoColumnLayout.appendChild(centerDropdown)
        twoColumnLayout.appendChild(authorField)
        twoColumnLayout.appendChild(presenterField)
        twoColumnLayout.appendChild(coAuthorField)
        twoColumnLayout.appendChild(dateStarted)
        twoColumnLayout.appendChild(dateCompleted)
        container.appendChild(twoColumnLayout)

        const fileSection = $({
            tag: 'div',
            style: {
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e8ecf0'
            }
        })

        fileSection.appendChild($({ tag: 'h4', text: 'Attachments', style: { color: '#1a2a3a', marginBottom: '16px', fontSize: '16px', fontWeight: '600' } }))

        const fileGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
            }
        })

        const researchFileField = createFileUploadField('Completed Research File *', 'researchFile')
        const endorsementFileField = createFileUploadField('Endorsement Letter *', 'endorsementFile')

        fileGrid.appendChild(researchFileField)
        fileGrid.appendChild(endorsementFileField)
        fileSection.appendChild(fileGrid)
        container.appendChild(fileSection)

        // ===== STORE REFERENCES =====
        container.fields = {
            campusSelect: campusDropdown, categorySelect: categoryDropdown, centerSelect: centerDropdown,
            authorInput: authorField, presenterInput: presenterField,
            dateStartedField: dateStarted, dateCompletedField: dateCompleted,
            researchFileField, endorsementFileField, coAuthorContainer: coAuthorField
        }

        // ===== EXPOSE FUNCTIONS =====
        container.autoFillFromUniversityReview = autoFillFromUniversityReview
        container.syncFromLocalReview = syncFromLocalReview

        // ===== RESET =====
        container.resetAutoFill = () => {
            syncAttempts = 0
            setTimeout(() => {
                if (formData.presentation_type === 'local') {
                    syncFromLocalReview()
                }
            }, 300)
        }

        // ===== VALIDATION =====
        container.__validate = () => {
            if (!formData.campus || formData.campus.trim() === '') {
                ConfirmationAlert('Please select the campus/location', () => { })
                return false
            }
            if (!formData.category) {
                ConfirmationAlert('Please select a category', () => { })
                return false
            }
            if (!formData.center) {
                ConfirmationAlert('Please select a center', () => { })
                return false
            }
            if (!formData.author || formData.author.trim() === '') {
                ConfirmationAlert('Please enter the main author name', () => { })
                return false
            }
            if (!formData.presenter || formData.presenter.trim() === '') {
                ConfirmationAlert('Please enter the presenter name', () => { })
                return false
            }
            if (!formData.date_started) {
                ConfirmationAlert('Please select the date started', () => { })
                return false
            }
            if (!formData.date_completed) {
                ConfirmationAlert('Please select the date completed', () => { })
                return false
            }
            if (!formData.researchFile) {
                ConfirmationAlert('Please upload the completed research file', () => { })
                return false
            }
            if (!formData.endorsementFile) {
                ConfirmationAlert('Please upload the endorsement letter', () => { })
                return false
            }
            return true
        }

        // Trigger sync with multiple attempts
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 300)
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 600)
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 1000)
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 1500)
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 2000)

        return container
    }

    const submitSymposium = async () => {
        // Validate final step for all presentation types before submitting
        if (stepContents[2] && stepContents[2].__validate) {
            if (!stepContents[2].__validate()) return
        }

        let loading = Waiting()
        document.body.appendChild(loading)

        try {
            // ===== FOR LOCAL PRESENTATION TYPE =====
            if (formData.presentation_type === 'local') {
                // Validate required files
                if (!formData.local_program) throw new Error('Program file is required')
                if (!formData.local_certificateFile) throw new Error('Certificate file is required')

                const researchTitle = formData.title_changed ? formData.new_title : formData.local_title

                // Use uploadSymposium endpoint for ALL symposium submissions
                const symposiumFormData = new FormData()
                symposiumFormData.append('uploadSymposium', 'true')
                symposiumFormData.append('eventType', eventName)
                symposiumFormData.append('eventId', eventId)
                symposiumFormData.append('presentation_type', 'local')

                // Local In-House fields
                symposiumFormData.append('local_title', formData.local_title)
                symposiumFormData.append('original_title', formData.local_title)
                symposiumFormData.append('local_campus', formData.local_campus)
                symposiumFormData.append('local_category', 'Extension')
                symposiumFormData.append('local_center', 'Extension (Extension)')
                symposiumFormData.append('local_author', formData.local_author)
                symposiumFormData.append('local_presenter', formData.local_presenter)
                symposiumFormData.append('local_coAuthors', JSON.stringify(formData.local_coAuthors || []))

                if (formData.local_program) {
                    symposiumFormData.append('programFile', formData.local_program)
                }
                if (formData.local_certificateFile) {
                    symposiumFormData.append('certificateFile', formData.local_certificateFile)
                }

                // Title change info
                symposiumFormData.append('title_changed', formData.title_changed ? '1' : '0')
                if (formData.title_changed && formData.new_title) {
                    symposiumFormData.append('final_symposium_title', formData.new_title)
                } else {
                    symposiumFormData.append('final_symposium_title', '')
                }

                if (formData.title_changed && formData.title_certificate_file) {
                    symposiumFormData.append('titleCertificateFile', formData.title_certificate_file)
                }

                // Symposium fields (Step 3)
                symposiumFormData.append('category', formData.category)
                symposiumFormData.append('center', formData.center)
                symposiumFormData.append('author', formData.author)
                symposiumFormData.append('presenter', formData.presenter)
                symposiumFormData.append('coAuthor', JSON.stringify(formData.coAuthors))
                symposiumFormData.append('campus', formData.campus)
                symposiumFormData.append('date_started', formData.date_started)
                symposiumFormData.append('date_completed', formData.date_completed)

                if (formData.researchFile) {
                    symposiumFormData.append('researchDoc', formData.researchFile)
                }
                if (formData.endorsementFile) {
                    symposiumFormData.append('endorsementFile', formData.endorsementFile)
                }

                const response = await fetch('/uploadExtensionDocs', {
                    method: 'POST',
                    body: symposiumFormData
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('Server error:', errorText)
                    throw new Error(`Server error: ${response.status}`)
                }

                const result = await response.json()

                if (!result.status) {
                    throw new Error(result.message || 'Symposium submission failed')
                }

                if (loading && loading.remove) loading.remove()

                // Close the current modal
                if (modalContainer) modalContainer.remove()

                // Show success message
                ConfirmationAlert('Paper successfully submitted! Paper status is currently pending', () => {
                    if (onSuccess) onSuccess()
                })

                return

            } else if (formData.presentation_type === 'university') {
                // ===== FOR UNIVERSITY PRESENTATION TYPE =====
                if (stepContents[1] && stepContents[1].__validate && !stepContents[1].__validate()) {
                    throw new Error('Please complete the title change section')
                }

                const selectedReview = inhouseReviewsList.find(r => r.id == formData.selected_inhouse_id)

                const symposiumFormData = new FormData()
                symposiumFormData.append('uploadSymposium', 'true')
                symposiumFormData.append('eventType', eventName)
                symposiumFormData.append('eventId', eventId)
                symposiumFormData.append('presentation_type', 'university')
                symposiumFormData.append('selected_inhouse_id', formData.selected_inhouse_id)

                // Only append original_title ONCE
                symposiumFormData.append('original_title', selectedReview ? selectedReview.title : '')

                if (selectedReview) {
                    symposiumFormData.append('original_author', selectedReview.author)
                    symposiumFormData.append('original_category', selectedReview.category || '')
                    symposiumFormData.append('original_center', selectedReview.center || '')
                    symposiumFormData.append('original_coauthors', JSON.stringify(selectedReview.coauthors || []))
                }

                // Title change info
                symposiumFormData.append('title_changed', formData.title_changed ? '1' : '0')
                if (formData.title_changed && formData.new_title) {
                    symposiumFormData.append('final_symposium_title', formData.new_title)
                } else {
                    symposiumFormData.append('final_symposium_title', '')
                }

                if (formData.title_changed && formData.title_certificate_file) {
                    symposiumFormData.append('titleCertificateFile', formData.title_certificate_file)
                }

                // Symposium fields (Step 3)
                symposiumFormData.append('category', formData.category)
                symposiumFormData.append('center', formData.center)
                symposiumFormData.append('author', formData.author)
                symposiumFormData.append('presenter', formData.presenter)
                symposiumFormData.append('coAuthor', JSON.stringify(formData.coAuthors))
                symposiumFormData.append('campus', formData.campus)
                symposiumFormData.append('date_started', formData.date_started)
                symposiumFormData.append('date_completed', formData.date_completed)

                if (formData.researchFile) {
                    symposiumFormData.append('researchDoc', formData.researchFile)
                }
                if (formData.endorsementFile) {
                    symposiumFormData.append('endorsementFile', formData.endorsementFile)
                }

                const response = await fetch('/uploadExtensionDocs', {
                    method: 'POST',
                    body: symposiumFormData
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    console.error('Server error:', errorText)
                    throw new Error(`Server error: ${response.status}`)
                }

                const result = await response.json()

                if (!result.status) {
                    throw new Error(result.message || 'Symposium submission failed')
                }

                console.log('University Symposium submission successful')
            }

            if (loading && loading.remove) loading.remove()

            // Close the current modal and notify success
            if (modalContainer) modalContainer.remove()

            ConfirmationAlert('Paper and Local Proposal have been successfully uploaded!', () => {
                if (onSuccess) onSuccess()
            })

        } catch (error) {
            if (loading && loading.remove) loading.remove()
            console.error('Submission error:', error)

            // Show error modal
            ConfirmationAlert({
                title: 'Submission Failed',
                message: error.message || 'An error occurred during submission. Please try again.',
                confirmText: 'OK',
                cancelText: ''
            })
        }
    }

    const style = $({
        tag: 'style',
        text: `
            @keyframes fadeIn {
                from { opacity: 0 }
                to { opacity: 1 }
            }
            @keyframes slideUp {
                from {
                    opacity: 0
                    transform: translateY(30px)
                }
                to {
                    opacity: 1
                    transform: translateY(0)
                }
            }
        `
    })

    const addProgressAnimation = () => {
        if (!document.querySelector('#progress-animation-style')) {
            const style = document.createElement('style')
            style.id = 'progress-animation-style'
            style.textContent = `
                @keyframes shrinkProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `
            document.head.appendChild(style)
        }
    }
    addProgressAnimation()
    return createModal()
}
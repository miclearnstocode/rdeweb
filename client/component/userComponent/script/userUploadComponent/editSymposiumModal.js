import { $, Waiting, ConfirmationAlert, DragDropUpload, ValidatePDF, CustomModal } from '../../../../lib/lib.js'

export const EditSymposiumModal = ({ eventName, eventId, existingData, onClose, onSuccess, embedded = false }) => {
    let currentStep = 1
    let modalContainer
    let closeModalFn = null
    let stepIndicators
    let stepContents
    let inhouseReviewsList = []


    let formData = {
        presentation_type: existingData?.presentation_type || null,
        // Local fields
        local_eventname: existingData?.local_eventname || '',
        local_title: existingData?.local_title || existingData?.original_title || '',
        local_campus: existingData?.local_campus || '',
        local_category: existingData?.local_category || '',
        local_center: existingData?.local_center || '',
        local_author: existingData?.local_author || '',
        local_coAuthors: existingData?.local_coAuthors || [],
        local_program: null, // New file will replace
        local_certificateFile: null, // New file will replace
        local_program_existing: existingData?.program_drive_view_url || null,
        local_certificate_existing: existingData?.local_certificate_file_view_url || null,

        // Title change
        title_changed: existingData?.title_changed === 1 || existingData?.title_changed === true || false,
        new_title: existingData?.final_symposium_title || '',
        title_certificate_file: null,
        title_certificate_existing: existingData?.title_certificate_view_url || null,

        // University fields
        selected_inhouse_id: existingData?.selected_inhouse_id || null,
        selected_university_review: existingData?.selected_university_review || null,
        university_title: existingData?.university_title || '',
        university_author: existingData?.university_author || '',
        university_category: existingData?.university_category || '',
        university_center: existingData?.university_center || '',
        university_coauthors: existingData?.university_coauthors || [],

        // Symposium details
        title: existingData?.title || existingData?.final_symposium_title || existingData?.original_title || '',
        category: existingData?.category || '',
        center: existingData?.center || '',
        author: existingData?.author || '',
        presenter: existingData?.presenter || '',
        coAuthors: existingData?.coAuthors || [],
        date_started: existingData?.date_started || '',
        date_completed: existingData?.date_completed || '',
        campus: existingData?.campus || '',
        researchFile: null,
        researchFile_existing: existingData?.researchFile || existingData?.drive_view_url || null,
        endorsementFile: null,
        endorsementFile_existing: existingData?.endorsementFile || null,
        fundSource: existingData?.fundSource || '',
        fundSourceOther: existingData?.fundSourceOther || '',
        campusCenterType: existingData?.campusCenterType || '',
        campusCenterId: existingData?.campusCenterId || '',
        docId: existingData?.id || existingData?.docId || null,
        endorsementId: existingData?.endorsement_id || null,
        original_title: existingData?.original_title || existingData?.local_title || '',
        paper_trail_no: existingData?.paper_trail_no || '',
        eventId: existingData?.event_id || eventId || null,
    }

    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
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
        "Social Science", "Natural / Biological", "Food", "Development",
        "Extension"
    ]

    const resetFormData = () => {
        Object.assign(formData, {
            presentation_type: existingData?.presentation_type || null,
            local_eventname: existingData?.local_eventname || '',
            local_title: existingData?.local_title || existingData?.original_title || '',
            local_campus: existingData?.local_campus || '',
            local_category: existingData?.local_category || '',
            local_center: existingData?.local_center || '',
            local_author: existingData?.local_author || '',
            local_coAuthors: existingData?.local_coAuthors || [],
            local_program: null,
            local_certificateFile: null,
            local_program_existing: existingData?.program_drive_view_url || null,
            local_certificate_existing: existingData?.local_certificate_file_view_url || null,
            title_changed: existingData?.title_changed === 1 || existingData?.title_changed === true || false,
            new_title: existingData?.final_symposium_title || '',
            title_certificate_file: null,
            title_certificate_existing: existingData?.title_certificate_view_url || null,
            selected_inhouse_id: existingData?.selected_inhouse_id || null,
            selected_university_review: existingData?.selected_university_review || null,
            university_title: existingData?.university_title || '',
            university_author: existingData?.university_author || '',
            university_category: existingData?.university_category || '',
            university_center: existingData?.university_center || '',
            university_coauthors: existingData?.university_coauthors || [],
            title: existingData?.title || existingData?.final_symposium_title || existingData?.original_title || '',
            category: existingData?.category || '',
            center: existingData?.center || '',
            author: existingData?.author || '',
            presenter: existingData?.presenter || '',
            coAuthors: existingData?.coAuthors || [],
            date_started: existingData?.date_started || '',
            date_completed: existingData?.date_completed || '',
            campus: existingData?.campus || '',
            researchFile: null,
            researchFile_existing: existingData?.researchFile || existingData?.drive_view_url || null,
            endorsementFile: null,
            endorsementFile_existing: existingData?.endorsementFile || null,
            fundSource: existingData?.fundSource || '',
            fundSourceOther: existingData?.fundSourceOther || '',
            campusCenterType: existingData?.campusCenterType || '',
            campusCenterId: existingData?.campusCenterId || '',
            docId: existingData?.id || existingData?.docId || null,
            endorsementId: existingData?.endorsement_id || null,
            original_title: existingData?.original_title || existingData?.local_title || '',
            paper_trail_no: existingData?.paper_trail_no || '',
            eventId: existingData?.event_id || eventId || null,
        });

        currentStep = 1;

        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.value = '';
        });

        // Clear file name displays
        document.querySelectorAll('[style*="color: #2e7d32"]').forEach(el => {
            if (el.innerText && el.innerText.includes('✓')) {
                el.innerText = '';
            }
        });

        // Clear co-author lists
        document.querySelectorAll('.coauthor-list, .local-coauthor-list').forEach(list => {
            list.innerHTML = '';
        });

        // Reset step indicators
        for (let i = 1; i <= 3; i++) {
            const circle = document.querySelector(`.step-circle-${i}`);
            const text = document.querySelector(`.step-text-${i}`);
            if (circle) {
                circle.style.backgroundColor = i === 1 ? '#1976D2' : '#e8ecf0';
                circle.style.color = i === 1 ? '#fff' : '#94a3b8';
            }
            if (text) {
                text.style.color = i === 1 ? '#1976D2' : '#94a3b8';
                text.style.fontWeight = i === 1 ? '600' : '400';
            }
        }

        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '33.33%';
        }

        const prevBtn = document.querySelector('.footer-prev');
        const nextBtn = document.querySelector('.footer-next');
        const submitBtn = document.querySelector('.footer-submit');

        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'block';
        if (submitBtn) submitBtn.style.display = 'none';

        if (stepContents) {
            stepContents.forEach((content, idx) => {
                if (content) {
                    content.style.display = idx === 0 ? 'block' : 'none';
                }
            });
        }

        const selectedReviewSection = document.getElementById('selectedReviewDisplay');
        if (selectedReviewSection) {
            selectedReviewSection.style.display = 'none';
            const contentEl = selectedReviewSection.querySelector('#selectedReviewContent');
            if (contentEl) contentEl.innerHTML = '';
        }

        const searchInput = document.querySelector('input[placeholder*="search"]');
        if (searchInput) {
            searchInput.value = '';
        }

        const searchResults = document.querySelector('[style*="max-height: 300px"]');
        if (searchResults) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
        }
    };

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

            const submitBtn = $({
                tag: 'button',
                text: 'Update Symposium Entry',
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

            if (delta === 1) {
                const currentStepContent = stepContents[currentStep - 1]
                if (currentStepContent && currentStepContent.__validate) {
                    if (!currentStepContent.__validate()) return
                }
            }

            if (delta === 1 && currentStep === 1 && stepContents[1] && stepContents[1].__updateReference) {
                stepContents[1].__updateReference()
            }

            const currentContent = stepContents[currentStep - 1]
            if (currentContent) {
                currentContent.style.display = 'none'
            }

            currentStep = newStep

            const newContent = stepContents[currentStep - 1]
            if (newContent) {
                newContent.style.display = 'block'
            }

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

            const progressFill = document.querySelector('.progress-fill')
            if (progressFill) {
                const progressPercentage = (currentStep / 3) * 100
                progressFill.style.width = `${progressPercentage}%`
            }

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

            if (currentStep === 3 && stepContents[2] && stepContents[2].syncFromLocalReview) {
                setTimeout(() => {
                    stepContents[2].syncFromLocalReview()
                }, 100)
            }
        }

        const handleNext = () => navigateStep(1)

        modalRef = CustomModal({
            title: `Edit Symposium Submission: ${eventName}`,
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

        if (modalRef && modalRef.closeModal) {
            closeModalFn = modalRef.closeModal
        }

        modalContainer = modalRef?.element

        return modalRef?.element
    }

    const createStep1Content = () => {
        const container = $({ tag: 'div' })

        let searchInput = null
        let searchResultsContainer = null
        let selectedInhouseId = null
        let filteredReviewsList = []
        let programFileNameDisplay, programFileInput
        let certificateFileNameDisplay, certificateFileInput
        let localEventNameInput, localTitleInput, localCampusInput, localCategorySelect, localCenterSelect
        let localAuthorInput, localCoAuthorListContainer
        let reviewsLoaded = false
        let isLoadingReviews = false

        // Determine if we're in edit mode with local data
        const isLocalEdit = existingData?.presentation_type === 'local' || 
                            (existingData?.local_title && existingData?.local_title.trim() !== '')

        const isUniversityEdit = existingData?.presentation_type === 'university' || 
                                (existingData?.selected_inhouse_id && !isLocalEdit)


        const createLocalFileUploadField = (label, fieldName, onFileSelect, existingFileUrl = null) => {
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
            uploadArea.appendChild($({ tag: 'div', text: 'Click to upload (replace existing)', style: { color: '#64748b', fontSize: '13px', fontWeight: '500' } }))
            uploadArea.appendChild($({ tag: 'div', text: 'PDF only, Max 10MB', style: { color: '#94a3b8', fontSize: '11px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '6px', fontSize: '12px', color: '#2e7d32', textAlign: 'center', fontWeight: '500' } })

            if (existingFileUrl && existingFileUrl !== '—' && existingFileUrl !== null && existingFileUrl !== '') {
                fileNameDisplay.innerHTML = `
                    <div style="display:flex;align-items:center;gap:8px;justify-content:center;color:#1976D2;font-weight:400;">
                        <i class="fas fa-file-pdf"></i>
                        <span>Existing file available</span>
                        <span style="font-size:11px;color:#94a3b8;">(Upload new to replace)</span>
                    </div>
                `
            }

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
                            fileNameDisplay.innerHTML = `
                                <div style="color:#2e7d32;">
                                    <i class="fas fa-check-circle"></i>
                                    ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}
                                </div>
                            `
                        }
                    }
                }
            })

            containerDiv.appendChild(uploadArea)
            containerDiv.appendChild(fileNameDisplay)
            containerDiv.appendChild(fileInput)

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
            ;(formData.local_coAuthors || []).forEach((author, idx) => {
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

        const updateLocalCenters = (category) => {
            const centers = categoryToCenters[category] || Object.keys(centerCategoryMapping)
            if (localCenterSelect) {
                const currentValue = localCenterSelect.value
                localCenterSelect.innerHTML = ''
                localCenterSelect.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                centers.forEach(center => {
                    localCenterSelect.appendChild($({ tag: 'option', text: center, att: { value: center }, style: { color: '#1a2a3a' } }))
                })
                if (existingData?.local_center && centers.includes(existingData.local_center)) {
                    localCenterSelect.value = existingData.local_center
                    formData.local_center = existingData.local_center
                } else if (currentValue && centers.includes(currentValue)) {
                    localCenterSelect.value = currentValue
                    formData.local_center = currentValue
                }
            }
        }

        // ===== FILTER AND DISPLAY RESULTS =====
        const filterAndDisplayResults = (searchTerm) => {
            if (!searchResultsContainer) return

            if (!searchTerm || searchTerm.trim() === '') {
                searchResultsContainer.style.display = 'none'
                searchResultsContainer.innerHTML = ''
                return
            }

            const filtered = inhouseReviewsList.filter(review =>
                review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (review.paper_trail_no && review.paper_trail_no.toLowerCase().includes(searchTerm.toLowerCase()))
            )

            if (filtered.length === 0) {
                searchResultsContainer.style.display = 'block'
                searchResultsContainer.innerHTML = `
                    <div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No matching in-house reviews found</div>
                `
                return
            }

            searchResultsContainer.style.display = 'block'
            searchResultsContainer.innerHTML = ''

            filtered.forEach(review => {
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
                        $({ tag: 'div', style: { color: '#1a2a3a', fontWeight: '500', marginBottom: '4px' }, text: review.title || 'Untitled' }),
                        $({ tag: 'div', style: { color: '#64748b', fontSize: '12px' }, text: `Author: ${review.author || 'Unknown'}` }),
                        review.paper_trail_no ? $({ tag: 'div', style: { color: '#94a3b8', fontSize: '11px', marginTop: '4px' }, text: `Paper Trail: ${review.paper_trail_no}` }) : null,
                        review.event_name ? $({ tag: 'div', style: { color: '#94a3b8', fontSize: '11px', marginTop: '4px' }, text: `Event: ${review.event_name}` }) : null
                    ]
                })
                searchResultsContainer.appendChild(resultItem)
            })
        }

        // ===== SELECT INHOUSE REVIEW =====
        const selectInhouseReview = (selected) => {
            formData.university_title = selected.title
            formData.selected_inhouse_id = selected.id
            formData.university_author = selected.author
            formData.university_category = selected.category || ''
            formData.university_center = selected.center || ''
            formData.university_coauthors = selected.coauthors || []
            formData.selected_university_review = selected

            if (searchInput) {
                searchInput.value = `${selected.title} (${selected.author})`
            }

            if (searchResultsContainer) {
                searchResultsContainer.style.display = 'none'
                searchResultsContainer.innerHTML = ''
            }

            const selectedReviewSection = document.getElementById('selectedReviewDisplay')
            const selectedReviewContent = document.getElementById('selectedReviewContent')
            
            if (selectedReviewSection) {
                selectedReviewSection.style.display = 'block'
            }
            
            if (selectedReviewContent) {
                let coauthorsText = ''
                if (selected.coauthors && selected.coauthors.length > 0) {
                    coauthorsText = selected.coauthors.join(', ')
                }

                selectedReviewContent.innerHTML = `
                    <div style="color:#2e7d32;margin-bottom:8px;font-weight:bold;">✓ Presented in In-House Review:</div>
                    <div style="color:#1a2a3a;margin-bottom:4px;">Title: ${selected.title}</div>
                    <div style="color:#475569;font-size:12px;margin-bottom:4px;">Author: ${selected.author}</div>
                    ${selected.coauthors && selected.coauthors.length > 0 ? `<div style="color:#475569;font-size:12px;margin-bottom:4px;">Co-Authors: ${coauthorsText}</div>` : ''}
                    ${selected.category ? `<div style="color:#475569;font-size:12px;margin-bottom:4px;">Category: ${selected.category}</div>` : ''}
                    ${selected.center ? `<div style="color:#475569;font-size:12px;margin-bottom:4px;">Center: ${selected.center}</div>` : ''}
                    ${selected.paper_trail_no ? `<div style="color:#64748b;font-size:11px;margin-top:4px;">Paper Trail: ${selected.paper_trail_no}</div>` : ''}
                    ${selected.event_name ? `<div style="color:#64748b;font-size:11px;margin-top:4px;">Event: ${selected.event_name}</div>` : ''}
                    <div style="margin-top:12px;text-align:right;">
                        <span style="color:#1976D2;cursor:pointer;font-size:12px;font-weight:500;" onclick="document.getElementById('selectedReviewDisplay').style.display='none';document.querySelector('.university-search-input').value='';">
                            Change Selection
                        </span>
                    </div>
                `
            }

            if (stepContents[2] && stepContents[2].autoFillFromUniversityReview) {
                stepContents[2].autoFillFromUniversityReview(selected)
            }
        }

        // ===== LOAD INHOUSE REVIEWS =====
        const loadInhouseReviews = async (searchTerm = '', centerFilter = '', categoryFilter = '') => {
            // Prevent multiple simultaneous loads
            if (isLoadingReviews) {
                return
            }
            if (reviewsLoaded && !searchTerm && !centerFilter && !categoryFilter) {
                return
            }

            isLoadingReviews = true
            const loadingDiv = document.querySelector('.university-loading-div')
            const searchInputEl = document.querySelector('.university-search-input')
            
            if (loadingDiv) {
                loadingDiv.style.display = 'block'
                loadingDiv.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <i class="fas fa-spinner fa-pulse" style="font-size:24px;color:#1976D2;display:block;margin-bottom:10px;"></i>
                        <div style="color:#64748b;">Loading your accepted in-house reviews...</div>
                    </div>
                `
            }
            
            if (searchInputEl) {
                searchInputEl.disabled = true
                searchInputEl.placeholder = 'Loading reviews...'
            }

            try {
                const formDataReq = new FormData()
                formDataReq.append('getAcceptedInhouseReviews', 'true')

                if (formData.paper_trail_no) {
                    formDataReq.append('paper_trail_no', formData.paper_trail_no)
                }

                if (searchTerm && searchTerm.trim() !== '') {
                    formDataReq.append('search', searchTerm.trim())
                }
                if (centerFilter && centerFilter.trim() !== '') {
                    formDataReq.append('center', centerFilter.trim())
                }
                if (categoryFilter && categoryFilter.trim() !== '') {
                    formDataReq.append('category', categoryFilter.trim())
                }

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: formDataReq
                })

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }

                const result = await response.json()

                if (searchInputEl) {
                    searchInputEl.disabled = false
                    searchInputEl.placeholder = 'Type to search by title or author...'
                }

                if (result.status && result.data && result.data.length > 0) {
                    inhouseReviewsList = result.data
                    reviewsLoaded = true
                    
                    if (loadingDiv) {
                        loadingDiv.style.display = 'none'
                    }

                    if (searchTerm && searchTerm.trim() !== '') {
                        filterAndDisplayResults(searchTerm)
                    }

                    // If we have a selected_inhouse_id from existing data, auto-select it
                    if (existingData?.selected_inhouse_id && !formData.selected_inhouse_id) {
                        const matchingReview = inhouseReviewsList.find(r => r.id == existingData.selected_inhouse_id)
                        if (matchingReview) {
                            selectInhouseReview(matchingReview)
                        }
                    }
                    
                    // If we have a paper_trail_no but no selected_inhouse_id, auto-select the matching review
                    if (formData.paper_trail_no && !formData.selected_inhouse_id) {
                        // Try to find by paper_trail_no
                        const matchingByTrail = inhouseReviewsList.find(r => r.paper_trail_no === formData.paper_trail_no)
                        if (matchingByTrail) {
                            selectInhouseReview(matchingByTrail)
                        } else if (inhouseReviewsList.length === 1) {
                            // If only one review matches, select it automatically
                            selectInhouseReview(inhouseReviewsList[0])
                        }
                    }
                } else {
                    const message = result.message || 'No accepted in-house reviews found.'
                    if (loadingDiv) {
                        loadingDiv.innerHTML = `
                            <div style="text-align:center;padding:20px;color:#ef4444;">
                                <i class="fas fa-exclamation-circle" style="font-size:24px;display:block;margin-bottom:10px;"></i>
                                <div>${message}</div>
                                ${formData.paper_trail_no ? `<div style="font-size:12px;margin-top:8px;color:#64748b;">Paper Trail: ${formData.paper_trail_no}</div>` : ''}
                            </div>
                        `
                    }
                    if (searchInputEl) {
                        searchInputEl.disabled = true
                    }
                }
            } catch (error) {
                console.error('Error loading in-house reviews:', error)
                if (searchInputEl) {
                    searchInputEl.disabled = false
                }
                if (loadingDiv) {
                    loadingDiv.innerHTML = `
                        <div style="text-align:center;padding:20px;color:#ef4444;">
                            <i class="fas fa-exclamation-triangle" style="font-size:24px;display:block;margin-bottom:10px;"></i>
                            <div>Error loading in-house reviews: ${error.message || 'Please refresh and try again.'}</div>
                        </div>
                    `
                }
            } finally {
                isLoadingReviews = false
            }
        }

        // ===== INFO BOX =====
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
                        $({ tag: 'i', att: { className: 'fas fa-edit' }, style: { color: '#FF9800', fontSize: '18px', marginTop: '2px' } }),
                        $({
                            tag: 'div',
                            style: { flex: 1 },
                            child: [
                                $({ tag: 'div', text: 'Edit In-House Review Information', style: { color: '#E65100', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'Update the in-house review details below. Changes will be reflected in the symposium entry.', style: { color: '#475569', fontSize: '13px' } })
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
                backgroundColor: isLocalEdit ? '#e3f2fd' : '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                border: isLocalEdit ? '2px solid #1976D2' : '2px solid #e8ecf0',
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
                        
                        if (existingData?.local_title) {
                            if (localTitleInput) localTitleInput.value = existingData.local_title
                            formData.local_title = existingData.local_title
                        }
                        if (existingData?.local_eventname) {
                            if (localEventNameInput) localEventNameInput.value = existingData.local_eventname
                            formData.local_eventname = existingData.local_eventname
                        }
                        if (existingData?.local_campus) {
                            if (localCampusInput) localCampusInput.value = existingData.local_campus
                            formData.local_campus = existingData.local_campus
                        }
                        if (existingData?.local_category) {
                            if (localCategorySelect) localCategorySelect.value = existingData.local_category
                            formData.local_category = existingData.local_category
                            updateLocalCenters(existingData.local_category)
                        }
                        if (existingData?.local_center) {
                            if (localCenterSelect) localCenterSelect.value = existingData.local_center
                            formData.local_center = existingData.local_center
                        }
                        if (existingData?.local_author) {
                            if (localAuthorInput) localAuthorInput.value = existingData.local_author
                            formData.local_author = existingData.local_author
                        }
                        if (existingData?.local_coAuthors && existingData.local_coAuthors.length > 0) {
                            formData.local_coAuthors = [...existingData.local_coAuthors]
                            updateLocalCoAuthorList()
                        }
                    }
                }
            }
        })

        if (isLocalEdit) {
            localRadio.checked = true
        }

        const localTitleSpan = $({ tag: 'span', text: 'Local In-House Review for Proposal', style: { fontWeight: '600', color: '#1a2a3a' } })
        const localDescSpan = $({ tag: 'div', text: 'Presented at campus/center level', style: { fontSize: '12px', color: '#64748b', marginTop: '8px', marginLeft: '28px' } })
        const localRadioLabel = $({ tag: 'label', style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, child: [localRadio, localTitleSpan] })

        localContainer.appendChild(localRadioLabel)
        localContainer.appendChild(localDescSpan)

        localContainer.addEventListener('click', () => {
            localRadio.checked = true
            formData.presentation_type = 'local'
            localContainer.style.borderColor = '#1976D2'
            localContainer.style.backgroundColor = '#e3f2fd'
            universityContainer.style.borderColor = '#e8ecf0'
            universityContainer.style.backgroundColor = '#f8fafc'
            localFieldsContainer.style.display = 'block'
            universityFields.style.display = 'none'
            formData.university_title = ''
            formData.selected_inhouse_id = null

            if (stepContents[2] && stepContents[2].resetAutoFill) {
                stepContents[2].resetAutoFill()
            }
        })

        // University option container
        const universityContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                backgroundColor: isUniversityEdit ? '#e3f2fd' : '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                border: isUniversityEdit ? '2px solid #1976D2' : '2px solid #e8ecf0',
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

                        formData.local_eventname = ''
                        formData.local_title = ''
                        formData.local_campus = ''
                        formData.local_category = ''
                        formData.local_center = ''
                        formData.local_author = ''
                        formData.local_coAuthors = []
                        formData.local_program = null
                        formData.local_certificateFile = null

                        if (localEventNameInput) localEventNameInput.value = ''
                        if (localTitleInput) localTitleInput.value = ''
                        if (localCampusInput) localCampusInput.value = ''
                        if (localCategorySelect) localCategorySelect.value = ''
                        if (localCenterSelect) localCenterSelect.innerHTML = ''
                        if (localAuthorInput) localAuthorInput.value = ''
                        if (localCoAuthorListContainer) localCoAuthorListContainer.innerHTML = ''
                        if (programFileNameDisplay) programFileNameDisplay.innerText = ''
                        if (programFileInput) programFileInput.value = ''
                        if (certificateFileNameDisplay) certificateFileNameDisplay.innerText = ''
                        if (certificateFileInput) certificateFileInput.value = ''

                        loadInhouseReviews()
                    }
                }
            }
        })

        if (isUniversityEdit) {
            universityRadio.checked = true
        }

        const universityTitleSpan = $({ tag: 'span', text: 'University In-House Review for Proposal', style: { fontWeight: '600', color: '#1a2a3a' } })
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
            formData.local_eventname = ''
            formData.local_title = ''
            formData.local_campus = ''
            formData.local_category = ''
            formData.local_center = ''
            formData.local_author = ''
            formData.local_coAuthors = []
            formData.local_program = null
            formData.local_certificateFile = null

            if (localTitleInput) localTitleInput.value = ''
            if (localCampusInput) localCampusInput.value = ''
            if (localCategorySelect) localCategorySelect.value = ''
            if (localCenterSelect) localCenterSelect.innerHTML = ''
            if (localAuthorInput) localAuthorInput.value = ''
            if (localCoAuthorListContainer) localCoAuthorListContainer.innerHTML = ''
            if (programFileNameDisplay) programFileNameDisplay.innerText = ''
            if (programFileInput) programFileInput.value = ''
            if (certificateFileNameDisplay) certificateFileNameDisplay.innerText = ''
            if (certificateFileInput) certificateFileInput.value = ''

            loadInhouseReviews()
        })

        typeOptions.appendChild(localContainer)
        typeOptions.appendChild(universityContainer)
        typeSection.appendChild(typeOptions)
        container.appendChild(typeSection)

        // ========== LOCAL FIELDS CONTAINER ==========
        const localFieldsContainer = $({ tag: 'div', style: { display: isLocalEdit ? 'block' : 'none' } })

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

        const localTitleSection = $({ tag: 'div' })
        localTitleSection.appendChild($({
            tag: 'label',
            text: 'Proposal Title *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        localTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'title presented in Local In-House Review', value: existingData?.local_title || existingData?.original_title || '' },
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

                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            }
        })
        localTitleSection.appendChild(localTitleInput)
        leftColumn.appendChild(localTitleSection)

        const localEventNameSection = $({ tag: 'div' })
        localEventNameSection.appendChild($({
            tag: 'label',
            text: 'Local In-House Event Title *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        localEventNameInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Local In-House Event Title', value: existingData?.local_eventname || '' },
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
                        formData.local_eventname = capitalized
                    } else {
                        formData.local_eventname = value
                    }
                }
            }
        })
        localEventNameSection.appendChild(localEventNameInput)
        leftColumn.appendChild(localEventNameSection)

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
                if (existingData?.local_campus) {
                    el.value = existingData.local_campus
                    formData.local_campus = existingData.local_campus
                }
            }
        })
        localCampusSection.appendChild(localCampusInput)
        leftColumn.appendChild(localCampusSection)

        // Category
        const localCategorySection = $({ tag: 'div' })
        localCategorySection.appendChild($({
            tag: 'label',
            text: 'Category *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        localCategorySelect = $({
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
                    formData.local_category = e.target.value
                    updateLocalCenters(e.target.value)
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            },
            elementHandler: (el) => {
                el.innerHTML = ''
                el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                categories.forEach(cat => {
                    el.appendChild($({ tag: 'option', text: cat, att: { value: cat }, style: { color: '#1a2a3a' } }))
                })
                if (existingData?.local_category) {
                    el.value = existingData.local_category
                    formData.local_category = existingData.local_category
                    updateLocalCenters(existingData.local_category)  
                }
            }
        })
        localCategorySection.appendChild(localCategorySelect)
        leftColumn.appendChild(localCategorySection)

        // Center
        const localCenterSection = $({ tag: 'div', style: { gridColumn: '1 / -1' } })
        localCenterSection.appendChild($({
            tag: 'label',
            text: 'Center *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        localCenterSelect = $({
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
                    formData.local_center = e.target.value
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            },
            elementHandler: (el) => {
                el.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                if (existingData?.local_center) {
                    // Will be populated by updateLocalCenters
                }
            }
        })
        localCenterSection.appendChild(localCenterSelect)

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
            att: { type: 'text', placeholder: 'Enter main author name', value: existingData?.local_author || '' },
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
                    if (formData.presentation_type === 'local' && stepContents[2] && stepContents[2].syncFromLocalReview) {
                        setTimeout(() => stepContents[2].syncFromLocalReview(), 50)
                    }
                }
            }
        })
        localAuthorSection.appendChild(localAuthorInput)
        rightColumn.appendChild(localAuthorSection)

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
        rightColumn.appendChild(localCenterSection)
        localFieldsContainer.appendChild(localGrid)

        // --- File Uploads Section ---
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
        localFileUploadsGrid.appendChild(createLocalFileUploadField(
            'Program File *', 
            'local_programFile', 
            (file) => { formData.local_program = file },
            existingData?.program_drive_view_url || existingData?.local_program_file_view_url || null
        ))
        localFileUploadsGrid.appendChild(createLocalFileUploadField(
            'Certificate File (Optional)', 
            'local_certificateFile', 
            (file) => { formData.local_certificateFile = file },
            existingData?.local_certificate_file_view_url || null
        ))

        localFieldsContainer.appendChild(localFileUploadsGrid)

        // Initialize co-author list with existing data
        if (existingData?.local_coAuthors && existingData.local_coAuthors.length > 0) {
            formData.local_coAuthors = [...existingData.local_coAuthors]
            setTimeout(() => updateLocalCoAuthorList(), 100)
        }

        // ========== UNIVERSITY FIELDS ==========
        const universityFields = $({ tag: 'div', style: { display: isUniversityEdit ? 'block' : 'none' } })

        // Loading indicator
        const loadingDiv = $({
            tag: 'div',
            style: { textAlign: 'center', padding: '20px', color: '#64748b' },
            att: { className: 'university-loading-div' },
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
            att: { className: 'university-search-input' },
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
            },
            att: { className: 'search-results-container' }
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
                display: isUniversityEdit ? 'block' : 'none',
                border: '1px solid #c8e6c9'
            },
            att: { id: 'selectedReviewDisplay' }
        })

        const selectedReviewContent = $({
            tag: 'div',
            style: { fontSize: '13px' },
            att: { id: 'selectedReviewContent' },
            child: []
        })
        selectedReviewSection.appendChild(selectedReviewContent)
        universityFields.appendChild(selectedReviewSection)

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

        // Store references for validation
        container.__validate = () => {
            if (!formData.presentation_type) {
                ConfirmationAlert('Please select where the paper was presented for In-House Review', () => { })
                return false
            }

            if (formData.presentation_type === 'local') {
                if (!formData.local_eventname || formData.local_eventname.trim() === '') {
                    ConfirmationAlert('Please enter the Local In-House Event Proposal Title', () => { })
                    return false
                }
                if (!formData.local_title || formData.local_title.trim() === '') {
                    ConfirmationAlert('Please enter the Document Title', () => { })
                    return false
                }
                if (!formData.local_campus || formData.local_campus.trim() === '') {
                    ConfirmationAlert('Please enter the Campus', () => { })
                    return false
                }
                if (!formData.local_category) {
                    ConfirmationAlert('Please select a Category', () => { })
                    return false
                }
                if (!formData.local_center) {
                    ConfirmationAlert('Please select a Center', () => { })
                    return false
                }
                if (!formData.local_author || formData.local_author.trim() === '') {
                    ConfirmationAlert('Please enter the Main Author', () => { })
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

        // If local is the default, pre-fill fields
        if (isLocalEdit) {
            setTimeout(() => {
                if (localTitleInput && existingData?.local_title) {
                    localTitleInput.value = existingData.local_title
                }
                if (localEventNameInput && existingData?.local_eventname) {
                    localEventNameInput.value = existingData.local_eventname
                }
                if (localCampusInput && existingData?.local_campus) {
                    localCampusInput.value = existingData.local_campus
                }
                if (localCategorySelect && existingData?.local_category) {
                    localCategorySelect.value = existingData.local_category
                    updateLocalCenters(existingData.local_category)
                }
                if (localAuthorInput && existingData?.local_author) {
                    localAuthorInput.value = existingData.local_author
                }
                if (existingData?.local_coAuthors && existingData.local_coAuthors.length > 0) {
                    formData.local_coAuthors = [...existingData.local_coAuthors]
                    updateLocalCoAuthorList()
                }
            }, 200)
        }

        if (isUniversityEdit) {
            setTimeout(() => {
                loadInhouseReviews()
            }, 300)
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
                                $({ tag: 'div', text: 'Edit Title Change', style: { color: '#E65100', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'Update the symposium title if it differs from the In-House Review title.', style: { color: '#475569', fontSize: '13px' } })
                            ]
                        })
                    ]
                })
            ]
        })
        container.appendChild(infoBox)

        // Display In-House title for reference
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
                $({ tag: 'div', text: formData.original_title || '—', style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' }, att: { id: 'refInhouseTitle' } })
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
        const newTitleContainer = $({ tag: 'div', style: { display: formData.title_changed ? 'block' : 'none', marginBottom: '24px' } })
        newTitleContainer.appendChild($({
            tag: 'label',
            text: 'New Research Title for Symposium *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))
        newTitleContainer.appendChild($({
            tag: 'div',
            text: 'This will be saved as the Final Research/Extension Title',
            style: { color: '#64748b', fontSize: '12px', marginBottom: '8px' }
        }))

        const newTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'New symposium title', value: formData.new_title || '' },
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

        // If title_changed is true, check the checkbox
        if (formData.title_changed) {
            const checkbox = checkboxLabel.querySelector('input[type="checkbox"]')
            if (checkbox) checkbox.checked = true
        }

        container.appendChild(newTitleContainer)

        // ===== CERTIFICATE ATTACHMENT SECTION =====
        const certificateAttachmentContainer = $({
            tag: 'div',
            style: {
                display: formData.title_changed ? 'block' : 'none',
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e8ecf0'
            }
        })

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

        // Description with existing file info
        let descText = 'Please upload the Certificate of Title Change as proof of the research title change.'
        if (formData.title_certificate_existing) {
            descText += ' Existing certificate is available. Upload a new one to replace it.'
        }
        certificateAttachmentContainer.appendChild($({
            tag: 'div',
            text: descText,
            style: { color: '#64748b', fontSize: '13px', marginBottom: '16px' }
        }))

        let certificateUpload = null
        const uploadContainer = $({
            tag: 'div',
            style: { marginBottom: '12px' }
        })

        const uploadElement = DragDropUpload({
            label: 'Certificate of Title Change (Optional)',
            accept: '.pdf',
            multiple: false,
            required: false,
            maxSizeMB: 10,
            description: 'Upload the certificate of title change (PDF only)',
            currentFiles: formData.title_certificate_existing ? [formData.title_certificate_existing] : [],
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
                formData.title_certificate_existing = null
            }
        })

        certificateUpload = uploadElement
        uploadContainer.appendChild(uploadElement.element)
        certificateAttachmentContainer.appendChild(uploadContainer)

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
                    refEl.innerText = (formData.local_title && formData.local_title.trim() !== '') ? formData.local_title : (formData.original_title || '—')
                } else if (formData.presentation_type === 'university') {
                    if (formData.selected_university_review && formData.selected_university_review.title) {
                        refEl.innerText = formData.selected_university_review.title
                    } else if (formData.university_title && formData.university_title.trim() !== '') {
                        refEl.innerText = formData.university_title
                    } else {
                        refEl.innerText = formData.original_title || '—'
                    }
                } else {
                    refEl.innerText = formData.original_title || '—'
                }
            }
        }

        container.__updateReference = updateReference

        return container
    }

    const createStep3Content = () => {
        const container = $({ tag: 'div' })

        let categorySelectEl = null
        let fundSourceSelectEl = null
        let fundSourceOtherInputEl = null
        let campusCenterSelectEl = null
        let authorInputEl = null
        let presenterInputEl = null
        let coAuthorListContainer = null
        let dateStartedEl = null
        let dateCompletedEl = null
        let researchFileNameDisplay = null
        let endorsementFileNameDisplay = null

        let syncAttempts = 0
        const MAX_SYNC_ATTEMPTS = 20

        const fundingSources = [
            "Crop Science Research & Developement Center (CSRDC)",
            "Livestock Research & Development Center (LRDC)",
            "Fisheries Research & Development Center (FRDC)",
            "Food and Industrial Technology Research & Development Center (FITRDC)",
            "Social Science Research & Development Center (SSRDC)",
            "Machinery and Agricultural Technology Engineering Center (MATEC)",
            "Coconut Research and Development Center (Coco RDC)",
            "Extension (IGF/GAA)",
            "Campus/Satellite College",
            "Others"
        ]

        const campusCenterOptions = [
            { id: 1, value: 'Roxas City Main', type: 'campus' },
            { id: 2, value: 'Sigma', type: 'campus' },
            { id: 3, value: 'Dayao', type: 'campus' },
            { id: 4, value: 'Dumarao', type: 'campus' },
            { id: 5, value: 'Burias', type: 'campus' },
            { id: 6, value: 'Mambusao', type: 'campus' },
            { id: 7, value: 'Pontevedra', type: 'campus' },
            { id: 8, value: 'Pilar', type: 'campus' },
            { id: 9, value: 'Tapaz', type: 'campus' },
            { id: 10, value: 'Crop Science Research & Developement Center (CSRDC)', type: 'center' },
            { id: 11, value: 'Livestock Research & Development Center (LRDC)', type: 'center' },
            { id: 12, value: 'Fisheries Research & Development Center (FRDC)', type: 'center' },
            { id: 13, value: 'Food and Industrial Technology Research & Development Center (FITRDC)', type: 'center' },
            { id: 14, value: 'Social Science Research & Development Center (SSRDC)', type: 'center' },
            { id: 15, value: 'Machinery and Agricultural Technology Engineering Center (MATEC)', type: 'center' },
            { id: 16, value: 'Coconut Research and Development Center (Coco RDC)', type: 'center' },
            { id: 17, value: 'Extension (Extension)', type: 'center' }
        ]

        const fetchResearchDataByPaperTrail = async (paperTrailNo) => {
            if (!paperTrailNo) {
                return null
            }

            try {
                const formData = new FormData()
                formData.append('getResearchByPaperTrail', 'true')
                formData.append('paper_trail_no', paperTrailNo)

                const response = await fetch('/uploadFacultyDocs', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`)
                }
                const result = await response.json()
                if (result.status && result.data) {
                    return result.data
                }
                return null
            } catch (error) {
                console.error('Error fetching research data:', error)
                return null
            }
        }

        const loadExistingDataByPaperTrail = async () => {
            if (!formData.paper_trail_no) {
                return
            }

            try {
                const data = await fetchResearchDataByPaperTrail(formData.paper_trail_no)
                
                if (data) {
                    if (data.category) formData.category = data.category
                    if (data.author) formData.author = data.author
                    if (data.presenter) formData.presenter = data.presenter
                    if (data.coAuthors && data.coAuthors.length > 0) {
                        formData.coAuthors = data.coAuthors
                    }
                    if (data.campus) formData.campus = data.campus
                    if (data.center) formData.center = data.center
                    if (data.date_started) formData.date_started = data.date_started
                    if (data.date_completed) formData.date_completed = data.date_completed
                    if (data.fundSource) formData.fundSource = data.fundSource
                    
                    // ===== SET EXISTING FILE URLs =====
                    // Research File
                    if (data.researchFile) {
                        formData.researchFile_existing = data.researchFile
                    }
                    if (data.research_download_url) {
                        formData.researchFile_existing_download = data.research_download_url
                    }
                    
                    // Endorsement File
                    if (data.endorsementFile) {
                        formData.endorsementFile_existing = data.endorsementFile
                    }
                    if (data.endorsement_download_url) {
                        formData.endorsementFile_existing_download = data.endorsement_download_url
                    }
                    
                    // Program File
                    if (data.program_drive_view_url) {
                        formData.program_drive_view_url = data.program_drive_view_url
                    }
                    
                    // Certificate File
                    if (data.certificate_drive_view_url) {
                        formData.certificate_drive_view_url = data.certificate_drive_view_url
                    }
                    
                    // Title Certificate
                    if (data.title_certificate_view_url) {
                        formData.title_certificate_view_url = data.title_certificate_view_url
                    }

                    // Update UI elements
                    updateUIElements(data)
                }
            } catch (error) {
                console.error('Error loading existing data:', error)
            }
        }

        const updateUIElements = (data) => {
            // Update Campus/Center dropdown
            if (campusCenterSelectEl) {
                if (data.campus && data.campus !== 'null') {
                    campusCenterSelectEl.value = data.campus
                } else if (data.center && data.center !== 'null') {
                    campusCenterSelectEl.value = data.center
                }
            }

            // Update Category dropdown
            if (categorySelectEl && data.category) {
                const options = Array.from(categorySelectEl.options).map(opt => opt.value)
                if (options.includes(data.category)) {
                    categorySelectEl.value = data.category
                }
            }

            // Update Funding Source dropdown
            if (fundSourceSelectEl && data.fundSource) {
                const options = Array.from(fundSourceSelectEl.options).map(opt => opt.value)
                if (options.includes(data.fundSource)) {
                    fundSourceSelectEl.value = data.fundSource
                    // Trigger change to show/hide other field
                    const changeEvent = new Event('change')
                    fundSourceSelectEl.dispatchEvent(changeEvent)
                }
            }

            // Update Funding Source Other input
            if (fundSourceOtherInputEl && data.fundSourceOther) {
                fundSourceOtherInputEl.value = data.fundSourceOther
            }

            // Update Author field
            if (authorInputEl && data.author) {
                authorInputEl.value = data.author
            }

            // Update Presenter field
            if (presenterInputEl && data.presenter) {
                presenterInputEl.value = data.presenter
            }

            // Update Co-Authors list
            if (coAuthorListContainer && data.coAuthors && data.coAuthors.length > 0) {
                formData.coAuthors = [...data.coAuthors]
                updateCoAuthorList()
            }

            // Update Date fields
            if (dateStartedEl && data.date_started) {
                dateStartedEl.value = data.date_started
            }
            if (dateCompletedEl && data.date_completed) {
                dateCompletedEl.value = data.date_completed
            }

            // Update file displays to show existing files
            if (researchFileNameDisplay && data.researchFile) {
                researchFileNameDisplay.innerHTML = `
                    <div style="color:#1976D2;font-weight:400;display:flex;align-items:center;gap:8px;justify-content:center;">
                        <i class="fas fa-file-pdf"></i>
                        <span>Existing file available</span>
                        <a href="${data.researchFile}" target="_blank" style="color:#1976D2;text-decoration:underline;font-size:11px;">View</a>
                        <span style="font-size:11px;color:#94a3b8;">(Upload new to replace)</span>
                    </div>
                `
            }
            
            if (endorsementFileNameDisplay && data.endorsementFile) {
                endorsementFileNameDisplay.innerHTML = `
                    <div style="color:#1976D2;font-weight:400;display:flex;align-items:center;gap:8px;justify-content:center;">
                        <i class="fas fa-file-pdf"></i>
                        <span>Existing file available</span>
                        <a href="${data.endorsementFile}" target="_blank" style="color:#1976D2;text-decoration:underline;font-size:11px;">View</a>
                        <span style="font-size:11px;color:#94a3b8;">(Upload new to replace)</span>
                    </div>
                `
            }

        }

        const syncFromLocalReview = () => {
            syncAttempts++

            if (formData.presentation_type !== 'local') {
                return
            }

            const localData = {
                category: formData.local_category || '',
                author: formData.local_author || '',
                coAuthors: formData.local_coAuthors || []
            }

            if (!localData.author && !localData.category && localData.coAuthors.length === 0) {
                return
            }

            if (!categorySelectEl || !fundSourceSelectEl || !campusCenterSelectEl || !coAuthorListContainer) {
                if (syncAttempts < MAX_SYNC_ATTEMPTS) {
                    setTimeout(syncFromLocalReview, 300)
                }
                return
            }

            if (localData.category && categorySelectEl) {
                const options = Array.from(categorySelectEl.options).map(opt => opt.value)
                if (options.includes(localData.category)) {
                    categorySelectEl.value = localData.category
                    formData.category = localData.category
                }
            }

            if (localData.author && authorInputEl) {
                authorInputEl.value = localData.author
                formData.author = localData.author
            }

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
        }

        const autoFillFromUniversityReview = (selectedReview) => {
            if (!selectedReview) return

            if (selectedReview.category && categorySelectEl) {
                const options = Array.from(categorySelectEl.options).map(opt => opt.value)
                if (options.includes(selectedReview.category)) {
                    categorySelectEl.value = selectedReview.category
                    formData.category = selectedReview.category
                }
            }

            if (selectedReview.author && authorInputEl) {
                authorInputEl.value = selectedReview.author
                formData.author = selectedReview.author
            }

            if (selectedReview.coauthors && selectedReview.coauthors.length > 0 && coAuthorListContainer) {
                formData.coAuthors = [...selectedReview.coauthors]
                updateCoAuthorList()
            }
        }

        const updateCoAuthorList = () => {
            if (!coAuthorListContainer) return
            coAuthorListContainer.innerHTML = ''
            ;(formData.coAuthors || []).forEach((author, idx) => {
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

        const createCampusCenterDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Campus / Center *',
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
                        const selectedValue = e.target.value
                        const selectedOption = campusCenterOptions.find(opt => opt.value === selectedValue)

                        if (selectedOption) {
                            formData.campusCenterType = selectedOption.type
                            formData.campusCenterId = selectedOption.id

                            if (selectedOption.type === 'campus') {
                                formData.campus = selectedOption.value
                                formData.center = 'null'
                            } else {
                                formData.center = selectedOption.value
                                formData.campus = 'null'
                            }
                        }
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''

                    el.appendChild($({
                        tag: 'option',
                        text: '-- Select Campus or Center --',
                        att: { value: '', disabled: true, selected: true },
                        style: { color: '#94a3b8' }
                    }))

                    const campusGroup = $({
                        tag: 'optgroup',
                        att: { label: '── Campuses ──' },
                        style: { fontWeight: '600', color: '#1976D2' }
                    })
                    campusCenterOptions
                        .filter(opt => opt.type === 'campus')
                        .forEach(opt => {
                            campusGroup.appendChild($({
                                tag: 'option',
                                text: opt.value,
                                att: { value: opt.value },
                                style: { color: '#1a2a3a' }
                            }))
                        })
                    el.appendChild(campusGroup)

                    const centerGroup = $({
                        tag: 'optgroup',
                        att: { label: '── Centers ──' },
                        style: { fontWeight: '600', color: '#1976D2' }
                    })
                    campusCenterOptions
                        .filter(opt => opt.type === 'center')
                        .forEach(opt => {
                            centerGroup.appendChild($({
                                tag: 'option',
                                text: opt.value,
                                att: { value: opt.value },
                                style: { color: '#1a2a3a' }
                            }))
                        })
                    el.appendChild(centerGroup)

                    // Set existing value
                    if (formData.campus && formData.campus !== 'null') {
                        el.value = formData.campus
                    } else if (formData.center && formData.center !== 'null') {
                        el.value = formData.center
                    }

                    campusCenterSelectEl = el
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
                        formData.category = e.target.value
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                    categories.forEach(cat => {
                        el.appendChild($({ tag: 'option', text: cat, att: { value: cat }, style: { color: '#1a2a3a' } }))
                    })
                    if (formData.category) {
                        el.value = formData.category
                    }
                    categorySelectEl = el
                }
            })

            container.appendChild(select)
            return container
        }

        const createFundSourceDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Funding Source *',
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
                        const selectedValue = e.target.value
                        formData.fundSource = selectedValue

                        if (selectedValue === 'Others') {
                            fundSourceOtherContainer.style.display = 'block'
                            fundSourceOtherInputEl.required = true
                            if (formData.fundSourceOther) {
                                fundSourceOtherInputEl.value = formData.fundSourceOther
                            }
                        } else {
                            fundSourceOtherContainer.style.display = 'none'
                            fundSourceOtherInputEl.required = false
                            fundSourceOtherInputEl.value = ''
                            formData.fundSourceOther = ''
                        }
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Funding Source --', att: { value: '', disabled: true, selected: true }, style: { color: '#94a3b8' } }))
                    fundingSources.forEach(source => {
                        el.appendChild($({ tag: 'option', text: source, att: { value: source }, style: { color: '#1a2a3a' } }))
                    })
                    if (formData.fundSource) {
                        el.value = formData.fundSource
                        // Trigger change event to show/hide other field
                        const changeEvent = new Event('change')
                        el.dispatchEvent(changeEvent)
                    }
                    fundSourceSelectEl = el
                }
            })

            container.appendChild(select)
            return container
        }

        // Funding Source "Other" input field
        const fundSourceOtherContainer = $({
            tag: 'div',
            style: {
                display: formData.fundSource === 'Others' ? 'block' : 'none',
                marginTop: '10px'
            }
        })

        fundSourceOtherContainer.appendChild($({
            tag: 'label',
            text: 'Please specify other funding source *',
            style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
        }))

        fundSourceOtherInputEl = $({
            tag: 'input',
            att: {
                type: 'text',
                placeholder: 'Enter other funding source',
                required: false,
                value: formData.fundSourceOther || ''
            },
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
                    formData.fundSourceOther = e.target.value
                }
            }
        })
        fundSourceOtherContainer.appendChild(fundSourceOtherInputEl)

        const createTextField = (label, placeholder, onInput, value = '') => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const input = $({
                tag: 'input',
                att: { type: 'text', placeholder: placeholder, value: value },
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

            if (label.includes('Main Author')) {
                authorInputEl = input
            } else if (label.includes('Presenter')) {
                presenterInputEl = input
            }

            container.appendChild(input)
            return container
        }

        const createDateField = (label, onChange, value = '') => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#475569', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
            }))

            const input = $({
                tag: 'input',
                att: { type: 'date', value: value },
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
            } else if (label.includes('Ended')) {
                dateCompletedEl = input
            }

            container.appendChild(input)
            return container
        }

        const createFileUploadField = (label, fieldName, existingFileUrl = null) => {
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
            uploadArea.appendChild($({ tag: 'div', text: `Click to upload (replace existing)`, style: { color: '#1a2a3a', fontSize: '14px', fontWeight: '500' } }))
            uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#64748b', fontSize: '12px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '8px', fontSize: '12px', color: '#2e7d32', textAlign: 'center', fontWeight: '500' } })

            // Show existing file if available
            if (existingFileUrl && existingFileUrl !== '—' && existingFileUrl !== null && existingFileUrl !== '') {
                fileNameDisplay.innerHTML = `
                    <div style="color:#1976D2;font-weight:400;">
                        <i class="fas fa-file-pdf"></i>
                        Existing file available
                        <span style="font-size:11px;color:#94a3b8;">(Upload new to replace)</span>
                    </div>
                `
            }

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
                            fileNameDisplay.innerHTML = `
                                <div style="color:#2e7d32;">
                                    <i class="fas fa-check-circle"></i>
                                    ${file.name.substring(0, 30)}${file.name.length > 30 ? '...' : ''}
                                </div>
                            `
                        }
                    }
                }
            })

            container.appendChild(uploadArea)
            container.appendChild(fileNameDisplay)
            container.appendChild(fileInput)

            // Store reference for file name display
            if (fieldName === 'researchFile') {
                researchFileNameDisplay = fileNameDisplay
            } else if (fieldName === 'endorsementFile') {
                endorsementFileNameDisplay = fileNameDisplay
            }

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
            
            // Initialize co-author list with existing data
            if (formData.coAuthors && formData.coAuthors.length > 0) {
                setTimeout(() => updateCoAuthorListFn(), 100)
            }

            return container
        }

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
                                ? 'Category, Author, and Co-Authors synced from Step 1. Campus/Center, Funding Source, Presenter, and Dates can be updated below.'
                                : 'Category, Author, and Co-Authors synced from Step 1. Campus/Center, Funding Source, Presenter, and Dates can be updated below.',
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

        const campusCenterDropdown = createCampusCenterDropdown()
        const categoryDropdown = createCategoryDropdown()

        const fundSourceContainer = $({ tag: 'div', style: { marginBottom: '0' } })
        const fundSourceDropdown = createFundSourceDropdown()
        fundSourceContainer.appendChild(fundSourceDropdown)
        fundSourceContainer.appendChild(fundSourceOtherContainer)

        const authorField = createTextField('Main Author *', 'Author Name', (value) => { formData.author = value }, formData.author || '')
        const presenterField = createTextField('Presenter *', 'Presenter name', (value) => { formData.presenter = value }, formData.presenter || '')
        const coAuthorField = createCoAuthorField(updateCoAuthorList)
        const dateStarted = createDateField('Date Started *', (e) => { formData.date_started = e.target.value }, formData.date_started || '')
        const dateCompleted = createDateField('Date Ended *', (e) => { formData.date_completed = e.target.value }, formData.date_completed || '')

        twoColumnLayout.appendChild(campusCenterDropdown)
        twoColumnLayout.appendChild(categoryDropdown)
        twoColumnLayout.appendChild(fundSourceContainer)
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

        const researchFileField = createFileUploadField('Completed Research File *', 'researchFile', formData.researchFile_existing)
        const endorsementFileField = createFileUploadField('Endorsement Letter *', 'endorsementFile', formData.endorsementFile_existing)

        fileGrid.appendChild(researchFileField)
        fileGrid.appendChild(endorsementFileField)
        fileSection.appendChild(fileGrid)
        container.appendChild(fileSection)

        if (formData.paper_trail_no) {
            setTimeout(() => {
                loadExistingDataByPaperTrail()
            }, 300)
        }
        container.fields = {
            campusCenterSelect: campusCenterDropdown,
            categorySelect: categoryDropdown,
            fundSourceSelect: fundSourceDropdown,
            fundSourceOtherInput: fundSourceOtherInputEl,
            authorInput: authorField,
            presenterInput: presenterField,
            dateStartedField: dateStarted,
            dateCompletedField: dateCompleted,
            researchFileField,
            endorsementFileField,
            coAuthorContainer: coAuthorField
        }

        container.autoFillFromUniversityReview = autoFillFromUniversityReview
        container.syncFromLocalReview = syncFromLocalReview

        container.resetAutoFill = () => {
            syncAttempts = 0
            setTimeout(() => {
                if (formData.presentation_type === 'local') {
                    syncFromLocalReview()
                }
            }, 300)
        }

        container.__validate = () => {
            if (!formData.campus && !formData.center) {
                ConfirmationAlert('Please select a campus or center', () => { })
                return false
            }
            if (!formData.category) {
                ConfirmationAlert('Please select a category', () => { })
                return false
            }

            if (!formData.fundSource || formData.fundSource.trim() === '') {
                ConfirmationAlert('Please select a funding source', () => { })
                return false
            }

            if (formData.fundSource === 'Others') {
                if (!formData.fundSourceOther || formData.fundSourceOther.trim() === '') {
                    ConfirmationAlert('Please specify the other funding source', () => { })
                    return false
                }
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
            // In edit mode, files are only required if they were never uploaded
            if (!formData.researchFile && !formData.researchFile_existing) {
                ConfirmationAlert('Please upload the completed research file', () => { })
                return false
            }
            if (!formData.endorsementFile && !formData.endorsementFile_existing) {
                ConfirmationAlert('Please upload the endorsement letter', () => { })
                return false
            }
            return true
        }

        // Auto-sync if local
        setTimeout(() => {
            if (formData.presentation_type === 'local') {
                syncFromLocalReview()
            }
        }, 300)

        return container
    }

    const submitSymposium = async () => {
        if (stepContents[2] && stepContents[2].__validate) {
            if (!stepContents[2].__validate()) return
        }

        let loading = Waiting()
        document.body.appendChild(loading)

        try {
            let finalFundSource = formData.fundSource
            if (formData.fundSource === 'Others' && formData.fundSourceOther) {
                finalFundSource = formData.fundSourceOther
            }

            const symposiumFormData = new FormData()
            symposiumFormData.append('editResearch', 'true')
            symposiumFormData.append('docId', formData.docId)
            symposiumFormData.append('endorsementId', formData.endorsementId)
            symposiumFormData.append('eventType', eventName)
            symposiumFormData.append('eventId', formData.eventId || eventId || null)
            symposiumFormData.append('presentation_type', formData.presentation_type)
            symposiumFormData.append('original_title', formData.original_title || formData.local_title || '')

            if (formData.presentation_type === 'local') {
                symposiumFormData.append('local_eventname', formData.local_eventname)
                symposiumFormData.append('local_title', formData.local_title)
                symposiumFormData.append('local_campus', formData.local_campus)
                symposiumFormData.append('local_category', formData.local_category)
                symposiumFormData.append('local_center', formData.local_center)
                symposiumFormData.append('local_author', formData.local_author)
                symposiumFormData.append('local_coAuthors', JSON.stringify(formData.local_coAuthors || []))

                if (formData.local_program) {
                    symposiumFormData.append('programFile', formData.local_program)
                }
                if (formData.local_certificateFile) {
                    symposiumFormData.append('local_certificateFile', formData.local_certificateFile)
                }
            } else if (formData.presentation_type === 'university') {
                symposiumFormData.append('selected_inhouse_id', formData.selected_inhouse_id)

                if (formData.selected_university_review) {
                    symposiumFormData.append('original_author', formData.selected_university_review.author)
                    symposiumFormData.append('original_category', formData.selected_university_review.category || '')
                    symposiumFormData.append('original_center', formData.selected_university_review.center || '')
                    symposiumFormData.append('original_coauthors', JSON.stringify(formData.selected_university_review.coauthors || []))
                }
            }

            // Title change
            symposiumFormData.append('title_changed', formData.title_changed ? '1' : '0')
            if (formData.title_changed && formData.new_title) {
                symposiumFormData.append('final_symposium_title', formData.new_title)
            } else {
                symposiumFormData.append('final_symposium_title', '')
            }

            if (formData.title_changed && formData.title_certificate_file) {
                symposiumFormData.append('titleCertificateFile', formData.title_certificate_file)
            }

            // Symposium details
            symposiumFormData.append('category', formData.category)
            symposiumFormData.append('author', formData.author)
            symposiumFormData.append('presenter', formData.presenter)
            symposiumFormData.append('coAuthor', JSON.stringify(formData.coAuthors))
            symposiumFormData.append('campus', formData.campus || '')
            symposiumFormData.append('fundSource', finalFundSource)
            symposiumFormData.append('date_started', formData.date_started)
            symposiumFormData.append('date_completed', formData.date_completed)

            if (formData.researchFile) {
                symposiumFormData.append('researchDoc', formData.researchFile)
            }
            if (formData.endorsementFile) {
                symposiumFormData.append('endorsementFile', formData.endorsementFile)
            }

            for (let [key, value] of symposiumFormData.entries()) {
            }

            const response = await fetch('/uploadFacultyDocs', {
                method: 'POST',
                body: symposiumFormData
            })

            if (!response.ok) {
                const text = await response.text();
                console.error('Server response error:', text);
                throw new Error(`Server error: ${response.status} - ${text}`);
            }

            const result = await response.json()
            if (loading && loading.remove) loading.remove()

            if (!result.status) {
                throw new Error(result.message || 'Symposium update failed')
            }

            // ===== CLOSE MODAL FIRST =====
            if (closeModalFn) {
                closeModalFn();
            } else if (modalContainer && modalContainer.remove) {
                modalContainer.remove();
            }

            // Reset form data
            resetFormData()

            // ===== SHOW SUCCESS ALERT AFTER MODAL CLOSES =====
            // Use setTimeout to ensure modal is fully closed before showing alert
            setTimeout(() => {
                const alertResult = ConfirmationAlert(
                    result.message || 'Symposium entry updated successfully!',
                    () => {
                        if (onSuccess) onSuccess()
                    },
                    {
                        title: 'Success',
                        icon: 'fa-circle-check',
                        iconColor: '#4caf50',
                        type: 'success',
                        duration: 4000
                    }
                )
                document.body.appendChild(alertResult.element)
            }, 300)

        } catch (error) {
            if (loading && loading.remove) loading.remove()
            console.error('Update error:', error)

            // Show error alert
            const alertResult = ConfirmationAlert(
                error.message || 'An error occurred during update. Please try again.',
                null,
                {
                    title: 'Update Failed',
                    icon: 'fa-circle-xmark',
                    iconColor: '#f44336',
                    type: 'error',
                    duration: 5000
                }
            )
            document.body.appendChild(alertResult.element)
        }
    }

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
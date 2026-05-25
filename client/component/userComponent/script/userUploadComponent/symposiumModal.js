import { $, Waiting, ConfirmationAlert} from '../../../../lib/lib.js'

export const SymposiumModal = ({ eventName, eventId, onClose, onSuccess, embedded = false }) => {
    let currentStep = 1
    let modalContainer
    let stepIndicators
    let stepContents
    let inhouseReviewsList = []

    // Form data
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

    // File upload states
    let programFileInput, programFileNameDisplay
    let researchFileInput, researchFileNameDisplay
    let endorsementFileInput, endorsementFileNameDisplay

    // Center categories mapping (from existing)
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
        "Extension", "Agricultural Machinery", "Industrial", "Engineering", "Information Technology"
    ]

    const createModal = () => {
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
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.3s ease'
            },
            elementHandler: (el) => { modalContainer = el }
        })

        const modalContent = $({
            tag: 'div',
            style: {
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '900px',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s ease'
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
                flexShrink: 0
            },
            child: [
                $({
                    tag: 'div',
                    child: [
                        $({ tag: 'h3', text: 'Symposium Submission', style: { color: '#fff', margin: 0, fontSize: '20px' } }),
                        $({ tag: 'p', text: eventName, style: { color: '#888', margin: '4px 0 0', fontSize: '13px' } })
                    ]
                }),
                $({
                    tag: 'i',
                    att: { className: 'fas fa-times' },
                    style: { color: '#999', fontSize: '20px', cursor: 'pointer' },
                    event: {
                        type: 'click',
                        method: () => {
                            if (modalContainer) modalContainer.remove()
                            if (onClose) onClose()
                        }
                    }
                })
            ]
        })

        // Step indicators
        const stepWrapper = $({
            tag: 'div',
            style: {
                padding: '20px 24px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
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
                            width: '32px',
                            height: '32px',
                            backgroundColor: index === 0 ? '#2196F3' : '#333',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
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
                            color: index === 0 ? '#2196F3' : '#666',
                            fontSize: '12px',
                            transition: 'all 0.3s ease'
                        },
                        att: { className: `step-text-${step.number}` }
                    })
                ]
            })
            stepIndicators.appendChild(stepItem)
        })

        // Progress line - background (gray)
        const progressLineBg = $({
            tag: 'div',
            style: {
                position: 'absolute',
                top: '16px',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: '#333',
                zIndex: 1
            }
        })

        // Progress line - fill (blue)
        const progressFill = $({
            tag: 'div',
            style: {
                position: 'absolute',
                top: '0',
                left: '0',
                height: '100%',
                width: '33.33%',  // Start at 33.33% for step 1
                backgroundColor: '#2196F3',
                transition: 'width 0.3s ease',
                zIndex: 2,
                borderRadius: '2px'
            },
            att: { className: 'progress-fill' }
        })

        progressLineBg.appendChild(progressFill)
        stepIndicators.appendChild(progressLineBg)
        stepWrapper.appendChild(stepIndicators)

        // Step contents container
        const stepsContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                overflow: 'auto',
                padding: '24px'
            }
        })

        stepContents = []

        // Step 1: In-House Review Selection
        const step1Content = createStep1Content()
        stepContents.push(step1Content)

        // Step 2: Title Change
        const step2Content = createStep2Content()
        stepContents.push(step2Content)

        // Step 3: Symposium Details
        const step3Content = createStep3Content()
        stepContents.push(step3Content)

        stepContents.forEach((content, idx) => {
            content.style.display = idx === 0 ? 'block' : 'none'
            stepsContainer.appendChild(content)
        })

        // Footer with navigation buttons
        const footer = $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0
            }
        })

        const prevBtn = $({
            tag: 'button',
            text: 'Previous',
            style: {
                padding: '10px 24px',
                backgroundColor: '#444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'none'
            },
            att: { className: 'footer-prev', type: 'button' },
            event: {
                type: 'click',
                method: () => navigateStep(-1)
            }
        })

        const nextBtn = $({
            tag: 'button',
            text: 'Next',
            style: {
                padding: '10px 28px',
                backgroundColor: '#2196F3',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            },
            att: { className: 'footer-next', type: 'button' },
            event: {
                type: 'click',
                method: () => handleNext()
            }
        })

        const submitBtn = $({
            tag: 'button',
            text: 'Submit Symposium Entry',
            style: {
                padding: '10px 28px',
                backgroundColor: '#4caf50',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'none'
            },
            att: { className: 'footer-submit', type: 'button', disabled: false },
            event: {
                type: 'click',
                method: () => submitSymposium()
            }
        })

        const leftDiv = $({ tag: 'div' })
        const rightDiv = $({ tag: 'div', style: { display: 'flex', gap: '12px' } })

        rightDiv.appendChild(prevBtn)
        rightDiv.appendChild(nextBtn)
        rightDiv.appendChild(submitBtn)

        footer.appendChild(leftDiv)
        footer.appendChild(rightDiv)

        modalContent.appendChild(header)
        modalContent.appendChild(stepWrapper)
        modalContent.appendChild(stepsContainer)
        modalContent.appendChild(footer)
        modal.appendChild(modalContent)

        return modal
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
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #444',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                },
                event: {
                    type: 'click',
                    method: () => fileInput.click()
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '28px', color: '#666', marginBottom: '6px', display: 'block' }
            }))
            uploadArea.appendChild($({ tag: 'div', text: `Click to upload`, style: { color: '#888', fontSize: '12px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '6px', fontSize: '11px', color: '#4caf50', textAlign: 'center' } })

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
            ;(formData.local_coAuthors || []).forEach((author, idx) => {
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
                                    formData.local_coAuthors.splice(idx, 1)
                                    updateLocalCoAuthorList()
                                }
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
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
                borderLeft: '4px solid #2196F3'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
                    child: [
                        $({ tag: 'i', att: { className: 'fas fa-info-circle' }, style: { color: '#2196F3', fontSize: '18px', marginTop: '2px' } }),
                        $({
                            tag: 'div',
                            style: { flex: 1 },
                            child: [
                                $({ tag: 'div', text: 'In-House Review Required', style: { color: '#2196F3', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'This symposium requires that your paper was first presented in an In-House Review.', style: { color: '#ccc', fontSize: '13px' } })
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
            style: { display: 'block', color: '#bbb', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }
        }))

        const typeOptions = $({ tag: 'div', style: { display: 'flex', gap: '16px' } })

        // Local option container
        const localContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                backgroundColor: '#2a2a2a',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s'
            }
        })

        const localRadio = $({
            tag: 'input',
            att: { type: 'radio', name: 'presentation_type', value: 'local' },
            style: { marginRight: '12px', cursor: 'pointer' },
            event: {
                type: 'change',
                method: (e) => {
                    if (e.target.checked) {
                        formData.presentation_type = 'local'
                        localContainer.style.borderColor = '#2196F3'
                        universityContainer.style.borderColor = 'transparent'
                        localFieldsContainer.style.display = 'block'
                        universityFields.style.display = 'none'
                        formData.university_title = ''
                        formData.selected_inhouse_id = null
                    }
                }
            }
        })

        const localTitleSpan = $({ tag: 'span', text: 'Local In-House Review', style: { fontWeight: '600', color: '#fff' } })
        const localDescSpan = $({ tag: 'div', text: 'Presented at campus/center level', style: { fontSize: '12px', color: '#888', marginTop: '8px', marginLeft: '28px' } })
        const localRadioLabel = $({ tag: 'label', style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, child: [localRadio, localTitleSpan] })

        localContainer.appendChild(localRadioLabel)
        localContainer.appendChild(localDescSpan)

        localContainer.addEventListener('click', () => {
            localRadio.checked = true
            formData.presentation_type = 'local'
            localContainer.style.borderColor = '#2196F3'
            universityContainer.style.borderColor = 'transparent'
            localFieldsContainer.style.display = 'block'
            universityFields.style.display = 'none'
            formData.university_title = ''
            formData.selected_inhouse_id = null
        })

        // University option container
        const universityContainer = $({
            tag: 'div',
            style: {
                flex: 1,
                backgroundColor: '#2a2a2a',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s'
            }
        })

        const universityRadio = $({
            tag: 'input',
            att: { type: 'radio', name: 'presentation_type', value: 'university' },
            style: { marginRight: '12px', cursor: 'pointer' },
            event: {
                type: 'change',
                method: (e) => {
                    if (e.target.checked) {
                        formData.presentation_type = 'university'
                        universityContainer.style.borderColor = '#2196F3'
                        localContainer.style.borderColor = 'transparent'
                        localFieldsContainer.style.display = 'none'
                        universityFields.style.display = 'block'

                        // Reset local form data
                        formData.local_title = ''
                        formData.local_campus = ''
                        formData.local_category = ''
                        formData.local_center = ''
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

        const universityTitleSpan = $({ tag: 'span', text: 'University In-House Review', style: { fontWeight: '600', color: '#fff' } })
        const universityDescSpan = $({ tag: 'div', text: 'Presented at university level', style: { fontSize: '12px', color: '#888', marginTop: '8px', marginLeft: '28px' } })
        const universityRadioLabel = $({ tag: 'label', style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, child: [universityRadio, universityTitleSpan] })

        universityContainer.appendChild(universityRadioLabel)
        universityContainer.appendChild(universityDescSpan)

        universityContainer.addEventListener('click', () => {
            universityRadio.checked = true
            formData.presentation_type = 'university'
            universityContainer.style.borderColor = '#2196F3'
            localContainer.style.borderColor = 'transparent'
            localFieldsContainer.style.display = 'none'
            universityFields.style.display = 'block'

            // Reset local form data
            formData.local_title = ''
            formData.local_campus = ''
            formData.local_category = ''
            formData.local_center = ''
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
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))

        // Create input
        localTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Exact title presented in Local In-House Review' },
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
                method: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value
                    
                    // Capitalize first letter of each word
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
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        localCampusInput = $({
            tag: 'select',
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
                type: 'change',
                method: (e) => { formData.local_campus = e.target.value }
            },
            elementHandler: (el) => {
                const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']
                el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true } }))
                campuses.forEach(campus => {
                    el.appendChild($({ tag: 'option', text: campus, att: { value: campus } }))
                })
            }
        })
        localCampusSection.appendChild(localCampusInput)
        leftColumn.appendChild(localCampusSection)

        // Category
        const localCategorySection = $({ tag: 'div' })
        localCategorySection.appendChild($({
            tag: 'label',
            text: 'Category *',
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        localCategorySelect = $({
            tag: 'select',
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
                type: 'change',
                method: (e) => {
                    formData.local_category = e.target.value
                    updateLocalCenters(e.target.value)
                }
            },
            elementHandler: (el) => {
                el.innerHTML = ''
                el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true } }))
                categories.forEach(cat => {
                    el.appendChild($({ tag: 'option', text: cat, att: { value: cat } }))
                })
            }
        })
        localCategorySection.appendChild(localCategorySelect)
        leftColumn.appendChild(localCategorySection)

        // Center
        const localCenterSection = $({ tag: 'div', style: { gridColumn: '1 / -1' } })
        localCenterSection.appendChild($({
            tag: 'label',
            text: 'Center *',
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        localCenterSelect = $({
            tag: 'select',
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
                type: 'change',
                method: (e) => { formData.local_center = e.target.value }
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
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        localAuthorInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter main author name' },
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
                method: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value
                    
                    // Capitalize first letter of each word
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
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        localPresenterInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter presenter name' },
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
                method: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value
                    
                    // Capitalize first letter of each word
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
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))

        const localCoAuthorInputGroup = $({ tag: 'div', style: { display: 'flex', gap: '10px', marginBottom: '12px' } })
        const localCoAuthorInput = $({
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
            },
            event: {
                type: 'input',
                method: (e) => {
                    const input = e.target
                    const start = input.selectionStart
                    const end = input.selectionEnd
                    let value = input.value
                    
                    // Capitalize first letter of each word
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
                    const name = localCoAuthorInput.value.trim()
                    if (name) {
                        if (!formData.local_coAuthors) formData.local_coAuthors = []
                        formData.local_coAuthors.push(name)
                        updateLocalCoAuthorList() // Now this function is defined
                        localCoAuthorInput.value = ''
                    }
                }
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
        localGrid.appendChild(localCenterSection)
        localFieldsContainer.appendChild(localGrid)

        // --- File Uploads Section (Full Width) - ONLY Program and Certificate Files ---
        const localFileUploadsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }
        })
        localFileUploadsGrid.appendChild(createLocalFileUploadField('Program File *', 'local_programFile', (file) => { formData.local_program = file }))
        localFileUploadsGrid.appendChild(createLocalFileUploadField('Certificate File *', 'local_certificateFile', (file) => { formData.local_certificateFile = file }))

        localFieldsContainer.appendChild(localFileUploadsGrid)

        // Function to update local centers based on category
        const updateLocalCenters = (category) => {
            const centers = categoryToCenters[category] || Object.keys(centerCategoryMapping)
            if (localCenterSelect) {
                const currentValue = localCenterSelect.value
                localCenterSelect.innerHTML = ''
                localCenterSelect.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                centers.forEach(center => {
                    localCenterSelect.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                })
                if (currentValue && centers.includes(currentValue)) {
                    localCenterSelect.value = currentValue
                }
            }
        }

        // ========== UNIVERSITY FIELDS ==========
        const universityFields = $({ tag: 'div', style: { display: 'none' } })

        // Loading indicator
        const loadingDiv = $({
            tag: 'div',
            style: { textAlign: 'center', padding: '20px', color: '#888' },
            child: [
                $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '24px', marginBottom: '10px', display: 'block' } }),
                $({ tag: 'div', text: 'Loading your accepted in-house reviews...' })
            ]
        })

        // Search input for university in-house review
        const searchSection = $({ tag: 'div', style: { marginBottom: '24px' } })
        searchSection.appendChild($({
            tag: 'label',
            text: 'Search Accepted University In-House Review *',
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => {
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
                color: '#666',
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
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #444',
                display: 'none'
            }
        })

        searchSection.appendChild(searchResultsContainer)
        universityFields.appendChild(searchSection)

        const selectedReviewSection = $({
            tag: 'div',
            style: {
                backgroundColor: '#1a5c2e',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '24px',
                display: 'none'
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
                    style: { padding: '16px', textAlign: 'center', color: '#888', fontSize: '13px' },
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
                    style: { padding: '12px 16px', borderBottom: '1px solid #444', cursor: 'pointer', transition: 'all 0.2s' },
                    event: {
                        type: 'click',
                        method: () => selectInhouseReview(review)
                    },
                    child: [
                        $({ tag: 'div', style: { color: '#fff', fontWeight: '500', marginBottom: '4px' }, text: review.title }),
                        $({ tag: 'div', style: { color: '#888', fontSize: '12px' }, text: `Author: ${review.author}` }),
                        review.event_name ? $({ tag: 'div', style: { color: '#666', fontSize: '11px', marginTop: '4px' }, text: `Event: ${review.event_name}` }) : null
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
            formData.university_center = selected.center
            formData.university_coauthors = selected.coauthors || []
            formData.selected_university_review = selected

            searchInput.value = `${selected.title} (${selected.author})`
            searchResultsContainer.style.display = 'none'
            searchResultsContainer.innerHTML = ''
            selectedReviewSection.style.display = 'block'
            selectedReviewContent.innerHTML = ''

            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#4caf50', marginBottom: '8px', fontWeight: 'bold' }, text: '✓ Presented in In-House Review:' }))
            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#fff', marginBottom: '4px' }, text: `Title: ${selected.title}` }))
            selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#ccc', fontSize: '12px', marginBottom: '4px' }, text: `Author: ${selected.author}` }))

            if (selected.coauthors && selected.coauthors.length > 0) {
                const coauthorsText = selected.coauthors.join(', ')
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#ccc', fontSize: '12px', marginBottom: '4px' }, text: `Co-Authors: ${coauthorsText}` }))
            }

            if (selected.category) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#ccc', fontSize: '12px', marginBottom: '4px' }, text: `Category: ${selected.category}` }))
            }
            if (selected.center) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#ccc', fontSize: '12px', marginBottom: '4px' }, text: `Center: ${selected.center}` }))
            }
            if (selected.event_name) {
                selectedReviewContent.appendChild($({ tag: 'div', style: { color: '#888', fontSize: '11px', marginTop: '4px' }, text: `Event: ${selected.event_name}` }))
            }

            const changeLink = $({
                tag: 'div',
                style: { marginTop: '12px', textAlign: 'right' },
                child: [
                    $({
                        tag: 'span',
                        text: 'Change Selection',
                        style: { color: '#2196F3', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' },
                        event: {
                            type: 'click',
                            method: () => {
                                selectedReviewSection.style.display = 'none'
                                searchInput.value = ''
                                formData.selected_inhouse_id = null
                                formData.selected_university_review = null
                                formData.university_title = ''
                                formData.university_coauthors = []
                            }
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

                const response = await fetch('/uploadResearchFile', {
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
                        style: { textAlign: 'center', padding: '20px', color: '#f44336' },
                        text: 'No accepted in-house reviews found. Please complete an in-house review first.'
                    }))
                    searchInput.disabled = true
                }
            } catch (error) {
                console.error('Error loading in-house reviews:', error)
                searchInput.disabled = false
                loadingDiv.innerHTML = ''
                loadingDiv.appendChild($({
                    tag: 'div',
                    style: { textAlign: 'center', padding: '20px', color: '#f44336' },
                    text: 'Error loading in-house reviews. Please refresh and try again.'
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

        // Store references for validation
        container.__validate = () => {

            if (!formData.presentation_type) {
                ConfirmationAlert('Please select where the paper was presented for In-House Review', () => { })
                return false
            }

            if (formData.presentation_type === 'local') {
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
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderRadius: '10px',
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
                                $({ tag: 'div', text: 'Title Change Tracking', style: { color: '#FF9800', fontWeight: '600', marginBottom: '4px' } }),
                                $({ tag: 'div', text: 'If the symposium title differs from the In-House Review title, please indicate the new title below.', style: { color: '#ccc', fontSize: '13px' } })
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
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px'
            },
            child: [
                $({ tag: 'div', text: 'In-House Review Title:', style: { color: '#888', fontSize: '12px', marginBottom: '4px' } }),
                $({ tag: 'div', text: '—', style: { color: '#fff', fontSize: '14px', fontWeight: '500' }, att: { id: 'refInhouseTitle' } })
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
                    style: { width: '18px', height: '18px', cursor: 'pointer' },
                    event: {
                        type: 'change',
                        method: (e) => {
                            formData.title_changed = e.target.checked
                            newTitleContainer.style.display = formData.title_changed ? 'block' : 'none'
                        }
                    }
                }),
                $({ tag: 'span', text: 'Has the research title changed for the Symposium?', style: { color: '#fff', fontSize: '14px' } })
            ]
        })
        checkboxSection.appendChild(checkboxLabel)
        container.appendChild(checkboxSection)

        // New title field
        const newTitleContainer = $({ tag: 'div', style: { display: 'none', marginBottom: '24px' } })
        newTitleContainer.appendChild($({
            tag: 'label',
            text: 'New Research Title for Symposium *',
            style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
        }))
        newTitleContainer.appendChild($({
            tag: 'div',
            text: 'This will be saved as the Final Symposium Title',
            style: { color: '#888', fontSize: '12px', marginBottom: '8px' }
        }))

        const newTitleInput = $({
            tag: 'input',
            att: { type: 'text', placeholder: 'Enter the new symposium title' },
            style: {
                width: '100%',
                padding: '12px 14px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: {
                type: 'input',
                method: (e) => { formData.new_title = e.target.value }
            }
        })
        newTitleContainer.appendChild(newTitleInput)
        container.appendChild(newTitleContainer)

        container.__validate = () => {
            if (formData.title_changed && (!formData.new_title || formData.new_title.trim() === '')) {
                ConfirmationAlert('Please enter the new research title for the Symposium', () => { })
                return false
            }
            return true
        }

        const updateReference = () => {
            const refEl = refSection.querySelector('#refInhouseTitle')
            if (refEl) {
                if (formData.presentation_type === 'local') {
                    // Add null check and default value
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

        // Store references to fields for dynamic updates
        let categorySelect, centerSelect, authorInput, presenterInput, coAuthorContainer
        let dateStartedField, dateCompletedField
        let campusSelect // Changed from campusField to campusSelect

        // Function to auto-fill from selected university in-house review
        const autoFillFromUniversityReview = (selectedReview) => {
            if (!selectedReview) return

            // Auto-fill Category
            if (selectedReview.category && categorySelect) {
                const categorySelectEl = categorySelect.querySelector('select')
                if (categorySelectEl) {
                    categorySelectEl.value = selectedReview.category
                    formData.category = selectedReview.category
                    // Trigger change to update centers
                    const changeEvent = new Event('change')
                    categorySelectEl.dispatchEvent(changeEvent)
                }
            }

            // Auto-fill Center (need to wait for category change to populate centers)
            setTimeout(() => {
                if (selectedReview.center && centerSelect) {
                    const centerSelectEl = centerSelect.querySelector('select')
                    if (centerSelectEl) {
                        centerSelectEl.value = selectedReview.center
                        formData.center = selectedReview.center
                    }
                }
            }, 100)

            // Auto-fill Author
            if (selectedReview.author && authorInput) {
                const authorInputEl = authorInput.querySelector('input')
                if (authorInputEl) {
                    authorInputEl.value = selectedReview.author
                    formData.author = selectedReview.author
                }
            }

            // Auto-fill Co-authors
            if (selectedReview.coauthors && selectedReview.coauthors.length > 0 && coAuthorContainer) {
                formData.coAuthors = [...selectedReview.coauthors]
                updateCoAuthorList()
                console.log('Auto-filled co-authors:', formData.coAuthors)
            }

            // Auto-fill Campus if available
            if (selectedReview.campus && campusSelect) {
                const campusSelectEl = campusSelect.querySelector('select')
                if (campusSelectEl) {
                    campusSelectEl.value = selectedReview.campus
                    formData.campus = selectedReview.campus
                }
            }

            // Auto-fill Date Started if available
            if (selectedReview.date_started && dateStartedField) {
                const dateStartedEl = dateStartedField.querySelector('input')
                if (dateStartedEl) {
                    dateStartedEl.value = selectedReview.date_started
                    formData.date_started = selectedReview.date_started
                }
            }

            // Auto-fill Date Completed if available
            if (selectedReview.date_completed && dateCompletedField) {
                const dateCompletedEl = dateCompletedField.querySelector('input')
                if (dateCompletedEl) {
                    dateCompletedEl.value = selectedReview.date_completed
                    formData.date_completed = selectedReview.date_completed
                }
            }
        }

        // Function to update co-author list display
        const updateCoAuthorList = () => {
            if (!coAuthorContainer) return
            const listContainer = coAuthorContainer.querySelector('.coauthor-list')
            if (!listContainer) return
            listContainer.innerHTML = ''
            formData.coAuthors.forEach((author, idx) => {
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
                                    formData.coAuthors.splice(idx, 1)
                                    updateCoAuthorList()
                                }
                            }
                        })
                    ]
                })
                listContainer.appendChild(tag)
            })
        }

        // Function to update centers based on selected category
        const updateCenters = (category) => {
            const centers = categoryToCenters[category] || Object.keys(centerCategoryMapping)
            const selectEl = centerSelect.querySelector('select')
            if (selectEl) {
                const currentValue = selectEl.value
                selectEl.innerHTML = ''
                selectEl.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
                centers.forEach(center => {
                    selectEl.appendChild($({ tag: 'option', text: center, att: { value: center } }))
                })
                if (currentValue && centers.includes(currentValue)) {
                    selectEl.value = currentValue
                    formData.center = currentValue
                } else {
                    formData.center = ''
                }
            }
        }

        // ========== CREATE CAMPUS DROPDOWN (matching Step 1) ==========
        const createCampusDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Campus *',
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))

            const select = $({
                tag: 'select',
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
                    type: 'change',
                    method: (e) => {
                        formData.campus = e.target.value
                    }
                },
                elementHandler: (el) => {
                    const campuses = ['Roxas City Main', 'Sigma', 'Dayao', 'Dumarao', 'Burias', 'Mambusao', 'Pontevedra', 'Pilar', 'Tapaz']
                    el.appendChild($({ tag: 'option', text: '-- Select Campus --', att: { value: '', disabled: true, selected: true } }))
                    campuses.forEach(campus => {
                        el.appendChild($({ tag: 'option', text: campus, att: { value: campus } }))
                    })
                }
            })

            container.appendChild(select)
            return container
        }

        // ========== CREATE CATEGORY DROPDOWN ==========
        const createCategoryDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Category *',
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))

            const select = $({
                tag: 'select',
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
                    type: 'change',
                    method: (e) => {
                        formData.category = e.target.value
                        updateCenters(e.target.value)
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Category --', att: { value: '', disabled: true, selected: true } }))
                    categories.forEach(cat => {
                        el.appendChild($({ tag: 'option', text: cat, att: { value: cat } }))
                    })
                }
            })

            container.appendChild(select)
            return container
        }

        // ========== CREATE CENTER DROPDOWN ==========
        const createCenterDropdown = () => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: 'Center *',
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))

            const select = $({
                tag: 'select',
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
                    type: 'change',
                    method: (e) => {
                        formData.center = e.target.value
                    }
                },
                elementHandler: (el) => {
                    el.innerHTML = ''
                    el.appendChild($({ tag: 'option', text: '-- Select Center --', att: { value: '', disabled: true, selected: true } }))
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
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } 
            }))
            const input = $({
                tag: 'input',
                att: { type: 'text', placeholder: placeholder },
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
                    method: (e) => {
                        const inputEl = e.target;
                        const start = inputEl.selectionStart;
                        const end = inputEl.selectionEnd;
                        let value = inputEl.value;
                        
                        // Capitalize first letter of each word
                        let words = value.split(' ');
                        let capitalized = words.map(word => {
                            if (word.length === 0) return word;
                            return word.charAt(0).toUpperCase() + word.slice(1);
                        }).join(' ');
                        
                        if (capitalized !== value) {
                            inputEl.value = capitalized;
                            inputEl.setSelectionRange(start, end);
                            // Pass the VALUE (string), not the event
                            if (onInput) onInput(capitalized);
                        } else {
                            // Pass the VALUE (string), not the event
                            if (onInput) onInput(value);
                        }
                    }
                }
            })
            container.appendChild(input)
            return container
        }
        const createDateField = (label, onChange) => {
            const container = $({ tag: 'div', style: { marginBottom: '0' } })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))
            const input = $({
                tag: 'input',
                att: { type: 'date' },
                style: {
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                },
                event: { type: 'change', method: onChange }
            })
            container.appendChild(input)
            return container
        }

        const createFileUploadField = (label, fieldName) => {
            const container = $({ tag: 'div' })
            container.appendChild($({
                tag: 'label',
                text: label,
                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
            }))

            const uploadArea = $({
                tag: 'div',
                style: {
                    border: '2px dashed #444',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                },
                event: {
                    type: 'click',
                    method: () => fileInput.click()
                }
            })

            uploadArea.appendChild($({
                tag: 'i',
                att: { className: 'fas fa-cloud-upload-alt' },
                style: { fontSize: '32px', color: '#666', marginBottom: '8px', display: 'block' }
            }))
            uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#888', fontSize: '14px' } }))
            uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#666', fontSize: '12px', marginTop: '4px' } }))

            const fileNameDisplay = $({ tag: 'div', style: { marginTop: '8px', fontSize: '12px', color: '#4caf50', textAlign: 'center' } })

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

        const formBody = $({
            tag: 'div',
            style: { padding: '24px' }
        })

        // Two column layout
        const twoColumnLayout = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
            }
        })

        // Create all fields
        campusSelect = createCampusDropdown()
        categorySelect = createCategoryDropdown()
        centerSelect = createCenterDropdown()
        authorInput = createTextField('Main Author *', 'Author Name', (value) => { formData.author = value })
        presenterInput = createTextField('Presenter *', 'Presenter name', (value) => { formData.presenter = value })
        coAuthorContainer = createCoAuthorField(updateCoAuthorList)
        dateStartedField = createDateField('Date Started *', (e) => { formData.date_started = e.target.value })
        dateCompletedField = createDateField('Date Completed *', (e) => { formData.date_completed = e.target.value })

        twoColumnLayout.appendChild(campusSelect)
        twoColumnLayout.appendChild(categorySelect)
        twoColumnLayout.appendChild(centerSelect)
        twoColumnLayout.appendChild(authorInput)
        twoColumnLayout.appendChild(presenterInput)
        twoColumnLayout.appendChild(coAuthorContainer)
        twoColumnLayout.appendChild(dateStartedField)
        twoColumnLayout.appendChild(dateCompletedField)
        container.appendChild(twoColumnLayout)

        // File upload sections
        const fileSection = $({
            tag: 'div',
            style: {
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }
        })

        fileSection.appendChild($({ tag: 'h4', text: 'Attachments', style: { color: '#fff', marginBottom: '16px', fontSize: '16px' } }))

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

        // Store field references
        container.fields = {
            campusSelect, categorySelect, centerSelect, authorInput, presenterInput,
            dateStartedField, dateCompletedField, researchFileField, endorsementFileField, coAuthorContainer
        }

        // Store auto-fill function for external access
        container.autoFillFromUniversityReview = autoFillFromUniversityReview

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

        return container
    }

    const createSelectField = (label, options, onChange) => {
        const container = $({ tag: 'div', style: { marginBottom: '0' } })
        container.appendChild($({ tag: 'label', text: label, style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        const select = $({
            tag: 'select',
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: { type: 'change', method: onChange },
            elementHandler: (el) => {
                el.innerHTML = ''
                el.appendChild($({ tag: 'option', text: `-- Select ${label.replace('*', '').trim()} --`, att: { value: '', disabled: true, selected: true } }))
                options.forEach(opt => {
                    el.appendChild($({ tag: 'option', text: opt, att: { value: opt } }))
                })
            }
        })
        container.appendChild(select)
        return container
    }

    const createDateField = (label, onChange) => {
        const container = $({ tag: 'div', style: { marginBottom: '0' } })
        container.appendChild($({ tag: 'label', text: label, style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))
        const input = $({
            tag: 'input',
            att: { type: 'date' },
            style: {
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
            },
            event: { type: 'change', method: onChange }
        })
        container.appendChild(input)
        return container
    }

    const createCoAuthorField = (updateCoAuthorListFn) => {
        const container = $({ tag: 'div', style: { marginBottom: '0' } })
        container.appendChild($({ tag: 'label', text: 'Co-Authors', style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

        const inputGroup = $({ tag: 'div', style: { display: 'flex', gap: '10px', marginBottom: '12px' } })
        const input = $({
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
            },
            event: {
                type: 'input',
                method: (e) => {
                    const inputEl = e.target
                    const start = inputEl.selectionStart
                    const end = inputEl.selectionEnd
                    let value = inputEl.value
                    
                    // Capitalize first letter of each word
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
                    const name = input.value.trim()
                    if (name) {
                        formData.coAuthors.push(name)
                        updateCoAuthorListFn()
                        input.value = ''
                    }
                }
            }
        })

        // Add class to list container for easy selection
        const listContainer = $({
            tag: 'div',
            style: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
            att: { className: 'coauthor-list' }
        })

        inputGroup.appendChild(input)
        inputGroup.appendChild(addBtn)
        container.appendChild(inputGroup)
        container.appendChild(listContainer)

        return container
    }

    const createFileUploadField = (label, fieldName) => {
        const container = $({ tag: 'div' })
        container.appendChild($({ tag: 'label', text: label, style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } }))

        const uploadArea = $({
            tag: 'div',
            style: {
                border: '2px dashed #444',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(255,255,255,0.05)'
            },
            event: {
                type: 'click',
                method: () => fileInput.click()
            }
        })

        uploadArea.appendChild($({
            tag: 'i',
            att: { className: 'fas fa-cloud-upload-alt' },
            style: { fontSize: '32px', color: '#666', marginBottom: '8px', display: 'block' }
        }))
        uploadArea.appendChild($({ tag: 'div', text: `Click to upload ${label}`, style: { color: '#888', fontSize: '14px' } }))
        uploadArea.appendChild($({ tag: 'div', text: '(PDF only, Max 10MB)', style: { color: '#666', fontSize: '12px', marginTop: '4px' } }))

        const fileNameDisplay = $({ tag: 'div', style: { marginTop: '8px', fontSize: '12px', color: '#4caf50', textAlign: 'center' } })

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
                circle.style.backgroundColor = i <= currentStep ? '#2196F3' : '#333'
            }
            if (text) {
                text.style.color = i <= currentStep ? '#2196F3' : '#666'
            }
        }
        
        // Update progress line fill - Each step = 33.33%
        const progressFill = document.querySelector('.progress-fill')
        if (progressFill) {
            const progressPercentage = (currentStep / 3) * 100
            progressFill.style.width = `${progressPercentage}%`
        }

        // Update buttons - FIX HERE
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
            // Always ensure submit button is visible only on step 3
            submitBtn.style.display = currentStep === 3 ? 'block' : 'none'
            // Remove any disabled attribute if it exists
            submitBtn.disabled = false
        }
    }

    const handleNext = () => navigateStep(1)

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
                symposiumFormData.append('local_campus', formData.local_campus)
                symposiumFormData.append('local_category', formData.local_category)
                symposiumFormData.append('local_center', formData.local_center)
                symposiumFormData.append('local_author', formData.local_author)
                symposiumFormData.append('local_presenter', formData.local_presenter)
                symposiumFormData.append('local_coAuthors', JSON.stringify(formData.local_coAuthors || []))
                
                // Program and certificate files
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
                
                // Step 3 files
                if (formData.researchFile) {
                    symposiumFormData.append('researchDoc', formData.researchFile)
                }
                if (formData.endorsementFile) {
                    symposiumFormData.append('endorsementFile', formData.endorsementFile)
                }

                const response = await fetch('/uploadResearchFile', {
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

                console.log('Local In-House Symposium submission successful')

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
                symposiumFormData.append('original_title', selectedReview ? selectedReview.title : '')
                
                if (selectedReview) {
                    symposiumFormData.append('original_author', selectedReview.author)
                    symposiumFormData.append('original_category', selectedReview.category || '')
                    symposiumFormData.append('original_center', selectedReview.center || '')
                    symposiumFormData.append('original_coauthors', JSON.stringify(selectedReview.coauthors || []))
                }
                
                symposiumFormData.append('title_changed', formData.title_changed ? '1' : '0')
                
                if (formData.title_changed && formData.new_title) {
                    symposiumFormData.append('final_symposium_title', formData.new_title)
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
                
                // Step 3 files
                if (formData.researchFile) {
                    symposiumFormData.append('researchDoc', formData.researchFile)
                }
                if (formData.endorsementFile) {
                    symposiumFormData.append('endorsementFile', formData.endorsementFile)
                }

                const response = await fetch('/uploadResearchFile', {
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

            resetFormData()
            ConfirmationAlert('Symposium submission saved successfully!', () => {
                if (modalContainer) modalContainer.remove()
                if (onSuccess) onSuccess()
            })

        } catch (error) {
            if (loading && loading.remove) loading.remove()
            console.error('Submission error:', error)
            ConfirmationAlert(error.message || 'An error occurred during submission. Please try again.', () => { })
        }
    }

    // Function to reset all form data after successful submission
    const resetFormData = () => {
        // Reset main form data object
        formData = {
            presentation_type: null,
            local_title: '',
            local_program: null,
            title_changed: false,
            new_title: '',
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
            endorsementFile: null,
            university_title: '',
            selected_inhouse_id: null,
            university_author: '',
            university_category: '',
            university_center: '',
            university_coauthors: [],
            selected_university_review: null
        }

        // Clear step 3 fields if they exist
        if (stepContents[2] && stepContents[2].fields) {
            const fields = stepContents[2].fields

            if (fields.campusField) {
                const campusInput = fields.campusField.querySelector('input')
                if (campusInput) campusInput.value = ''
            }

            if (fields.categorySelect) {
                const categorySelectEl = fields.categorySelect.querySelector('select')
                if (categorySelectEl) categorySelectEl.value = ''
            }

            if (fields.centerSelect) {
                const centerSelectEl = fields.centerSelect.querySelector('select')
                if (centerSelectEl) centerSelectEl.value = ''
            }

            if (fields.authorInput) {
                const authorInputEl = fields.authorInput.querySelector('input')
                if (authorInputEl) authorInputEl.value = ''
            }

            if (fields.presenterInput) {
                const presenterInputEl = fields.presenterInput.querySelector('input')
                if (presenterInputEl) presenterInputEl.value = ''
            }

            if (fields.dateStartedField) {
                const dateStartedEl = fields.dateStartedField.querySelector('input')
                if (dateStartedEl) dateStartedEl.value = ''
            }

            if (fields.dateCompletedField) {
                const dateCompletedEl = fields.dateCompletedField.querySelector('input')
                if (dateCompletedEl) dateCompletedEl.value = ''
            }

            // Clear co-authors list
            if (fields.coAuthorContainer) {
                const listContainer = fields.coAuthorContainer.querySelector('.coauthor-list')
                if (listContainer) listContainer.innerHTML = ''
            }
        }

        // Reset step indicators to step 1
        currentStep = 1
        if (stepContents) {
            stepContents.forEach((content, idx) => {
                content.style.display = idx === 0 ? 'block' : 'none'
            })

            // Update step indicators UI
            for (let i = 1; i <= 3; i++) {
                const circle = document.querySelector(`.step-circle-${i}`)
                const text = document.querySelector(`.step-text-${i}`)
                if (circle) {
                    circle.style.backgroundColor = i === 1 ? '#2196F3' : '#333'
                }
                if (text) {
                    text.style.color = i === 1 ? '#2196F3' : '#666'
                }
            }
            
            // Reset progress fill to 33.33% (Step 1)
            const progressFill = document.querySelector('.progress-fill')
            if (progressFill) {
                progressFill.style.width = '33.33%'
            }

            // Reset buttons
            const prevBtn = document.querySelector('.footer-prev')
            const nextBtn = document.querySelector('.footer-next')
            const submitBtn = document.querySelector('.footer-submit')

            if (prevBtn) prevBtn.style.display = 'none'
            if (nextBtn) nextBtn.style.display = 'block'
            if (submitBtn) {
                    submitBtn.style.display = 'none'
                    submitBtn.disabled = false
                }
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

    return createModal()
}
import { $, ConfirmationAlert, Request, SpecialChar, Waiting, ConfirmationModal } from '../../../lib/lib.js'


const createInput = ({ placeholder, type = 'text', getDataMethod, filter, id }) => {
    const inputEl = $({
        tag: 'input',
        att: {
            type: type,
            placeholder: placeholder,
            className: 'modern-input',
            id: id || ''
        },
        event: {
            type: 'input',
            method: (event) => {
                if (getDataMethod) {
                    getDataMethod(event.target.value)
                }
            }
        },
        elementHandler: (el) => {
            if (filter) {
                el.addEventListener('keypress', (event) => {
                    if (event.keyCode === 32) {
                        event.preventDefault()
                        return false
                    }
                })
            }
        }
    })
    return inputEl
}


const createSelect = ({ options, placeholder, getDataMethod, id, className = '' }) => {
    const selectEl = $({
        tag: 'select',
        att: {
            className: `modern-select ${className}`,
            id: id || ''
        },
        event: {
            type: 'change',
            method: (event) => {
                if (getDataMethod) {
                    getDataMethod(event.target.value)
                }
            }
        },
        child: [
            $({
                tag: 'option',
                text: placeholder || '-- Select --',
                att: {
                    disabled: true,
                    selected: true,
                    value: ''
                }
            }),
            ...options.map(opt =>
                $({
                    tag: 'option',
                    text: opt.label,
                    att: { value: opt.value }
                })
            )
        ]
    })
    return selectEl
}


const createUserTypeDisplay = (id, initialText = '-- Select Options First --') => {
    return $({
        tag: 'div',
        att: {
            className: 'user-type-display-modern',
            id: id
        },
        child: [
            $({
                tag: 'span',
                text: 'Role to be created: ',
                att: { className: 'user-type-label-modern' }
            }),
            $({
                tag: 'span',
                text: initialText,
                att: {
                    className: 'user-type-value-modern',
                    id: `${id}Value`
                }
            })
        ]
    })
}

const updateUserTypeDisplay = (id, value) => {
    const span = document.getElementById(`${id}Value`)
    if (span) {
        span.textContent = value || '-- Select Options First --'
        span.style.color = value ? '#2e7d32' : '#f57c00'
        span.style.fontWeight = value ? 'bold' : 'normal'
    }
}

// Center Chair Registration
const encodeCenterChair = () => {
    const accountData = {
        center: '',
        gmail: '',
        userType: '',
        campus: ''
    }

    const generateUserType = (centerValue, campusValue = '') => {
        if (centerValue === 'Extension') {
            if (campusValue && campusValue.trim() !== '') {
                return `${campusValue} Extension Chair`
            }
            return ''
        }

        const centerMap = {
            'CSRDC': 'CSRDC Chair',
            'LRDC': 'LRDC Chair',
            'FRDC': 'FRDC Chair',
            'FITRDC': 'FITRDC Chair',
            'SSRDC': 'SSRDC Chair',
            'MATEC': 'MATEC Chair',
            'Coco RDC': 'Coco RDC Chair'
        }
        return centerMap[centerValue] || 'Center Chair'
    }

    // Center options with emoji icons
    const centerOptions = [
        { label: 'Crop Science Research & Development Center (CSRDC)', value: 'CSRDC', icon: '🌱' },
        { label: 'Livestock Research & Development Center (LRDC)', value: 'LRDC', icon: '🐄' },
        { label: 'Fisheries Research & Development Center (FRDC)', value: 'FRDC', icon: '🐟' },
        { label: 'Food and Industrial Technology Research & Development Center (FITRDC)', value: 'FITRDC', icon: '🏭' },
        { label: 'Social Science Research & Development Center (SSRDC)', value: 'SSRDC', icon: '👥' },
        { label: 'Machinery and Agricultural Technology Engineering Center (MATEC)', value: 'MATEC', icon: '⚙️' },
        { label: 'Coconut Research and Development Center (Coco RDC)', value: 'Coco RDC', icon: '🥥' },
        { label: 'Extension', value: 'Extension', icon: '🤝' }
    ]

    const campusOptions = [
        'Roxas City Main', 'Burias', 'Mambusao', 'Dayao', 'Pilar',
        'Pontevedra', 'Sigma', 'Sapian', 'Tapaz', 'Dumarao'
    ].map(c => ({ label: c, value: c }))

    // Helper function to update user type display
    const updateUserTypeDisplay = (id, value) => {
        const span = document.getElementById(`${id}Value`)
        if (span) {
            span.textContent = value || '-- Select Center First --'
            span.style.color = value ? '#2e7d32' : '#f57c00'
            span.style.fontWeight = value ? 'bold' : 'normal'
        }
    }

    let campusSelectContainer = null

    const validateForm = () => {
        const submitBtn = document.getElementById('centerChairSubmitBtn')
        if (!submitBtn) return

        let isValid = accountData.center.trim() !== '' && accountData.gmail.trim() !== ''
        if (accountData.center === 'Extension') {
            isValid = isValid && accountData.campus && accountData.campus.trim() !== ''
        }

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.background = isValid ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' : '#cccccc'
        submitBtn.style.boxShadow = isValid ? '0 4px 15px rgba(25, 118, 210, 0.3)' : 'none'
    }

    const getData = {
        getCenter: (value) => {
            accountData.center = value
            accountData.campus = ''
            accountData.userType = value !== 'Extension' ? generateUserType(value) : ''
            updateUserTypeDisplay('centerChairUserTypeDisplay', accountData.userType)
            updateCampusField(value)
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        }
    }

    // Create campus select
    const createCampusSelect = () => {
        return $({
            tag: 'div',
            att: { className: 'form-group-modern campus-select-group' },
            child: [
                $({ 
                    tag: 'label', 
                    text: '📍 Select Campus', 
                    att: { className: 'form-label-modern' }
                }),
                $({
                    tag: 'select',
                    att: {
                        className: 'modern-select',
                        id: 'centerChairCampusSelect'
                    },
                    event: {
                        type: 'change',
                        method: (event) => {
                            const value = event.target.value
                            accountData.campus = value
                            if (accountData.center === 'Extension') {
                                accountData.userType = generateUserType(accountData.center, value)
                                updateUserTypeDisplay('centerChairUserTypeDisplay', accountData.userType)
                            }
                            validateForm()
                        }
                    },
                    child: [
                        $({
                            tag: 'option',
                            text: '-- Select Campus --',
                            att: {
                                disabled: true,
                                selected: true,
                                value: ''
                            }
                        }),
                        ...campusOptions.map(opt => {
                            return $({
                                tag: 'option',
                                text: opt.label,
                                att: { value: opt.value }
                            })
                        })
                    ]
                })
            ]
        })
    }

    const updateCampusField = (centerValue) => {
        const displayEl = document.getElementById('centerChairUserTypeDisplay')

        if (campusSelectContainer) {
            campusSelectContainer.remove()
            campusSelectContainer = null
        }

        if (centerValue === 'Extension') {
            campusSelectContainer = createCampusSelect()
            if (displayEl && displayEl.parentNode) {
                displayEl.parentNode.insertBefore(campusSelectContainer, displayEl.nextSibling)
            }
        }
    }

    // Create form container
    const formContainer = $({
        tag: 'div',
        att: { className: 'form-container center-chair-form-modern' },
        child: [
            // Header
            $({
                tag: 'div',
                att: { className: 'form-header-modern' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'form-header-icon' },
                        child: [
                            $({
                                tag: 'span',
                                att: { 
                                    className: 'header-emoji'
                                },
                                text: '🏢'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'form-header-text' },
                        child: [
                            $({ 
                                tag: 'h3', 
                                text: 'Center Chair Registration', 
                                att: { className: 'form-title-modern' } 
                            }),
                            $({
                                tag: 'p',
                                text: 'Register a center chair for research and development centers',
                                att: { className: 'form-subtitle' }
                            })
                        ]
                    })
                ]
            }),

            // Center Selection
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: '🏗️ Select Center', 
                        att: { className: 'form-label-modern' }
                    }),
                    $({
                        tag: 'select',
                        att: {
                            className: 'modern-select',
                            id: 'centerChairCenterSelect'
                        },
                        event: {
                            type: 'change',
                            method: (event) => {
                                const value = event.target.value
                                getData.getCenter(value)
                            }
                        },
                        child: [
                            $({
                                tag: 'option',
                                text: '-- Select Center --',
                                att: {
                                    disabled: true,
                                    selected: true,
                                    value: ''
                                }
                            }),
                            ...centerOptions.map(opt => {
                                return $({
                                    tag: 'option',
                                    text: `${opt.icon} ${opt.label}`,
                                    att: { value: opt.value }
                                })
                            })
                        ]
                    })
                ]
            }),

            // User Type Display
            $({
                tag: 'div',
                att: {
                    className: 'user-type-display-modern',
                    id: 'centerChairUserTypeDisplay'
                },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'user-type-icon' },
                        child: [
                            $({
                                tag: 'span',
                                text: '👔'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'user-type-content' },
                        child: [
                            $({
                                tag: 'span',
                                text: 'Role to be created: ',
                                att: { className: 'user-type-label-modern' }
                            }),
                            $({
                                tag: 'span',
                                text: '-- Select Center First --',
                                att: {
                                    className: 'user-type-value-modern',
                                    id: 'centerChairUserTypeDisplayValue'
                                }
                            })
                        ]
                    })
                ]
            }),

            // Email Input
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: '✉️ Gmail Address', 
                        att: { className: 'form-label-modern' }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'email',
                            placeholder: 'example@gmail.com',
                            className: 'modern-input',
                            id: 'centerChairGmailInput'
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                                const value = event.target.value
                                getData.getGmail(value)
                            }
                        }
                    })
                ]
            }),

            // Submit Button
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit-modern',
                    id: 'centerChairSubmitBtn',
                    disabled: true
                },
                child: [
                    $({
                        tag: 'span',
                        text: '➕ '
                    }),
                    $({
                        tag: 'span',
                        text: 'Register Account'
                    })
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        const submitBtn = document.getElementById('centerChairSubmitBtn')
                        if (submitBtn.disabled) return

                        if (!accountData.center || !accountData.gmail) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select a center and enter Gmail address!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        if (accountData.center === 'Extension' && !accountData.campus) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select a campus for Extension Chair!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        if (!emailRegex.test(accountData.gmail)) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please enter a valid email address!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        const load = Waiting()
                        document.body.appendChild(load)
                        load.offsetHeight
                        await new Promise(resolve => setTimeout(resolve, 50))
                        submitBtn.disabled = true

                        try {
                            const formData = [
                                { name: 'registerAccount', value: 'true' },
                                { name: 'email', value: accountData.gmail },
                                { name: 'accountName', value: accountData.userType },
                                { name: 'center', value: accountData.center === 'Extension' ? accountData.campus : accountData.center },
                                { name: 'campus', value: accountData.center === 'Extension' ? accountData.campus : '' }
                            ]

                            const req = new Request('/addcapaccount')
                            req.Post(formData)
                            req.Json()
                            const data = await req.Send()
                            load.remove()

                            if (data.status) {
                                ConfirmationModal({
                                    title: 'Success',
                                    message: `Successfully registered ${accountData.userType} account!`,
                                    type: 'success',
                                    confirmText: 'OK',
                                    onConfirm: () => window.location.replace('/account/Login')
                                })
                            } else {
                                ConfirmationModal({
                                    title: 'Registration Failed',
                                    message: data.message || 'Failed to register account',
                                    type: 'error',
                                    confirmText: 'OK',
                                    onConfirm: () => {
                                        submitBtn.disabled = false
                                        validateForm()
                                    }
                                })
                            }
                        } catch (error) {
                            load.remove()
                            console.error('Error:', error)
                            ConfirmationModal({
                                title: 'Error',
                                message: 'An error occurred during submission',
                                type: 'error',
                                confirmText: 'OK',
                                onConfirm: () => {
                                    submitBtn.disabled = false
                                    validateForm()
                                }
                            })
                        }
                    }
                }
            }),

            // Footer
            $({
                tag: 'div',
                att: { className: 'form-footer' },
                child: [
                    $({
                        tag: 'span',
                        att: { className: 'footer-item' },
                        child: [
                            $({
                                tag: 'span',
                                text: '🔬 '
                            }),
                            $({
                                tag: 'span',
                                text: 'R&D Center role'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'footer-item' },
                        child: [
                            $({
                                tag: 'span',
                                text: '🛡️ '
                            }),
                            $({
                                tag: 'span',
                                text: 'Secure registration'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'footer-item' },
                        child: [
                            $({
                                tag: 'span',
                                text: '⏱️ '
                            }),
                            $({
                                tag: 'span',
                                text: 'Quick setup'
                            })
                        ]
                    })
                ]
            })
        ]
    })

    return formContainer
}

// Research Chair Registration
const encodeResearchChair = () => {
    const accountData = {
        campus: '',
        gmail: '',
        userType: ''
    }

    const campusOptions = [
        'Roxas City Main', 'Burias', 'Mambusao', 'Dayao', 'Pilar',
        'Pontevedra', 'Sigma', 'Sapian', 'Tapaz', 'Dumarao'
    ].map(c => ({ label: c, value: c }))

    // Helper function to create input with icon
    const createInputWithIcon = ({ placeholder, type, getDataMethod, id, icon }) => {
        return $({
            tag: 'div',
            att: { className: 'input-with-icon-modern' },
            child: [
                $({
                    tag: 'i',
                    att: { 
                        className: `fas ${icon} input-icon-modern`,
                        style: 'position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; z-index: 1; font-size: 16px;'
                    }
                }),
                $({
                    tag: 'input',
                    att: {
                        type: type,
                        placeholder: placeholder,
                        className: 'modern-input with-icon-modern',
                        id: id,
                        style: 'padding-left: 44px;'
                    },
                    event: {
                        type: 'input',
                        method: (event) => {
                            const value = event.target.value
                            getDataMethod(value)
                        }
                    }
                })
            ]
        })
    }

    // Helper function to create select with icon
    const createSelectWithIcon = ({ options, placeholder, getDataMethod, id, icon }) => {
        return $({
            tag: 'div',
            att: { className: 'select-with-icon-modern' },
            child: [
                $({
                    tag: 'i',
                    att: { 
                        className: `fas ${icon} select-icon-modern`,
                        style: 'position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; z-index: 1; font-size: 16px;'
                    }
                }),
                $({
                    tag: 'select',
                    att: {
                        className: 'modern-select with-icon-modern',
                        id: id,
                        style: 'padding-left: 44px;'
                    },
                    event: {
                        type: 'change',
                        method: (event) => {
                            const value = event.target.value
                            if (getDataMethod) {
                                getDataMethod(value)
                            }
                        }
                    },
                    child: [
                        $({
                            tag: 'option',
                            text: placeholder || '-- Select --',
                            att: {
                                disabled: true,
                                selected: true,
                                value: ''
                            }
                        }),
                        ...options.map(opt =>
                            $({
                                tag: 'option',
                                text: opt.label,
                                att: { value: opt.value }
                            })
                        )
                    ]
                })
            ]
        })
    }

    // Helper function to update user type display
    const updateUserTypeDisplay = (id, value) => {
        const span = document.getElementById(`${id}Value`)
        if (span) {
            span.textContent = value || '-- Select Campus First --'
            span.style.color = value ? '#2e7d32' : '#f57c00'
            span.style.fontWeight = value ? 'bold' : 'normal'
        }
    }

    const validateForm = () => {
        const submitBtn = document.getElementById('researchChairSubmitBtn')
        if (!submitBtn) return

        const isValid = accountData.campus.trim() !== '' &&
            accountData.gmail.trim() !== '' &&
            accountData.userType !== ''

        submitBtn.disabled = !isValid
        if (isValid) {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
            submitBtn.style.background = 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
            submitBtn.style.boxShadow = '0 4px 15px rgba(25, 118, 210, 0.3)'
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.background = '#cccccc'
            submitBtn.style.boxShadow = 'none'
        }
    }

    const getData = {
        getCampus: (value) => {
            accountData.campus = value
            accountData.userType = value ? `${value} Research Chair` : ''
            updateUserTypeDisplay('researchChairUserTypeDisplay', accountData.userType)
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        }
    }

    // Create user type display with icon
    const createUserTypeDisplayWithIcon = (id, initialText = '-- Select Campus First --') => {
        return $({
            tag: 'div',
            att: {
                className: 'user-type-display-modern',
                id: id,
                style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8f9fa; border-radius: 10px; border: 2px solid #e9ecef; margin: 8px 0 16px 0;'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'user-type-icon',
                        style: 'width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #e3f2fd; border-radius: 8px; flex-shrink: 0;'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: {
                                className: 'fas fa-user-tie',
                                style: 'font-size: 20px; color: #1976d2;'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    att: {
                        className: 'user-type-content',
                        style: 'flex: 1;'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: 'Role to be created: ',
                            att: { 
                                className: 'user-type-label-modern',
                                style: 'font-weight: 500; color: #1a2332;'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: initialText,
                            att: {
                                className: 'user-type-value-modern',
                                id: `${id}Value`,
                                style: 'color: #f57c00; font-weight: normal; margin-left: 4px;'
                            }
                        })
                    ]
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'form-container research-chair-form-modern' },
        child: [
            // Header with icon
            $({
                tag: 'div',
                att: { className: 'form-header-modern' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'form-header-icon' },
                        child: [
                            $({
                                tag: 'i',
                                att: { 
                                    className: 'fas fa-user-graduate',
                                    style: 'font-size: 28px; color: #1976d2;'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'form-header-text' },
                        child: [
                            $({ 
                                tag: 'h3', 
                                text: 'Research Chair Registration', 
                                att: { className: 'form-title-modern' } 
                            }),
                            $({
                                tag: 'p',
                                text: 'Register a research chair for a specific campus',
                                att: { className: 'form-subtitle' }
                            })
                        ]
                    })
                ]
            }),

            // Campus Selection with icon
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Select Campus', 
                        att: { 
                            className: 'form-label-modern',
                            style: 'display: flex; align-items: center; gap: 8px;'
                        }
                    }),
                    createSelectWithIcon({
                        options: campusOptions,
                        placeholder: '-- Select Campus --',
                        getDataMethod: getData.getCampus,
                        id: 'researchChairCampusSelect',
                        icon: 'fa-university'
                    })
                ]
            }),

            // User Type Display
            createUserTypeDisplayWithIcon('researchChairUserTypeDisplay'),

            // Gmail Input with icon
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Gmail Address', 
                        att: { 
                            className: 'form-label-modern',
                            style: 'display: flex; align-items: center; gap: 8px;'
                        }
                    }),
                    createInputWithIcon({
                        placeholder: 'example@gmail.com',
                        type: 'email',
                        getDataMethod: getData.getGmail,
                        id: 'researchChairGmailInput',
                        icon: 'fa-envelope'
                    })
                ]
            }),

            // Register Button
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit-modern',
                    id: 'researchChairSubmitBtn',
                    disabled: true
                },
                child: [
                    $({
                        tag: 'i',
                        att: { 
                            className: 'fas fa-user-plus',
                            style: 'font-size: 18px;'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Register Account'
                    })
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        const submitBtn = document.getElementById('researchChairSubmitBtn')
                        if (submitBtn.disabled) return

                        if (!accountData.campus || !accountData.gmail) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select a campus and enter Gmail address!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        if (!emailRegex.test(accountData.gmail)) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please enter a valid email address!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        const load = Waiting()
                        document.body.appendChild(load)
                        load.offsetHeight
                        await new Promise(resolve => setTimeout(resolve, 50))
                        submitBtn.disabled = true

                        try {
                            const formData = [
                                { name: 'registerAccount', value: 'true' },
                                { name: 'email', value: accountData.gmail },
                                { name: 'accountName', value: accountData.userType },
                                { name: 'center', value: accountData.campus },
                                { name: 'campus', value: accountData.campus }
                            ]

                            const req = new Request('/addcapaccount')
                            req.Post(formData)
                            req.Json()
                            const data = await req.Send()
                            load.remove()

                            if (data.status) {
                                ConfirmationModal({
                                    title: 'Success',
                                    message: `Successfully registered ${accountData.userType} account!`,
                                    type: 'success',
                                    confirmText: 'OK',
                                    onConfirm: () => {
                                        accountData.campus = ''
                                        accountData.gmail = ''
                                        accountData.userType = ''
                                        const campusSelect = document.getElementById('researchChairCampusSelect')
                                        const gmailInput = document.getElementById('researchChairGmailInput')
                                        if (campusSelect) campusSelect.value = ''
                                        if (gmailInput) gmailInput.value = ''
                                        updateUserTypeDisplay('researchChairUserTypeDisplay', '')
                                        validateForm()
                                    }
                                })
                            } else {
                                ConfirmationModal({
                                    title: 'Registration Failed',
                                    message: data.message || 'Failed to register account',
                                    type: 'error',
                                    confirmText: 'OK',
                                    onConfirm: () => {
                                        submitBtn.disabled = false
                                        validateForm()
                                    }
                                })
                            }
                        } catch (error) {
                            load.remove()
                            console.error('Error:', error)
                            ConfirmationModal({
                                title: 'Error',
                                message: 'An error occurred during submission',
                                type: 'error',
                                confirmText: 'OK',
                                onConfirm: () => {
                                    submitBtn.disabled = false
                                    validateForm()
                                }
                            })
                        }
                    }
                }
            }),

            // Footer info
            $({
                tag: 'div',
                att: { 
                    className: 'form-footer',
                    style: 'margin-top: 16px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-building', style: 'color: #1976d2;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Campus-based role'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-shield-alt', style: 'color: #28a745;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Secure registration'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-clock', style: 'color: #ffc107;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Instant activation'
                            })
                        ]
                    })
                ]
            })
        ]
    })
}

// RDE Staff Registration
const rdeUser = () => {
    const data = { email: '', userName: '', password: '' }

    // Helper function to create input with icon
    const createInputWithIcon = ({ placeholder, type, getDataMethod, id, icon, filter = false }) => {
        return $({
            tag: 'div',
            att: { className: 'input-with-icon-modern' },
            child: [
                $({
                    tag: 'i',
                    att: { 
                        className: `fas ${icon} input-icon-modern`,
                        style: 'position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; z-index: 1; font-size: 16px;'
                    }
                }),
                $({
                    tag: 'input',
                    att: {
                        type: type,
                        placeholder: placeholder,
                        className: 'modern-input with-icon-modern',
                        id: id,
                        style: 'padding-left: 44px;'
                    },
                    event: {
                        type: 'input',
                        method: (event) => {
                            const value = event.target.value
                            getDataMethod(value)
                            
                            // If this is the password input, update strength indicators
                            if (id === 'rdePasswordInput') {
                                updatePasswordStrength(value)
                            }
                        }
                    },
                    elementHandler: (el) => {
                        if (filter) {
                            el.addEventListener('keypress', (event) => {
                                if (event.keyCode === 32) {
                                    event.preventDefault()
                                    return false
                                }
                            })
                        }
                    }
                })
            ]
        })
    }

    // Password strength update function
    const updatePasswordStrength = (password) => {
        // Update requirements
        const reqLength = document.getElementById('reqLength')
        const reqLetter = document.getElementById('reqLetter')
        const reqNumber = document.getElementById('reqNumber')
        const reqSpecial = document.getElementById('reqSpecial')
        
        if (reqLength) {
            if (password.length >= 8) {
                reqLength.style.color = '#28a745'
                reqLength.querySelector('i').className = 'fas fa-check-circle'
            } else {
                reqLength.style.color = '#dc3545'
                reqLength.querySelector('i').className = 'fas fa-circle'
            }
        }
        
        if (reqLetter) {
            if (/[a-zA-Z]/.test(password)) {
                reqLetter.style.color = '#28a745'
                reqLetter.querySelector('i').className = 'fas fa-check-circle'
            } else {
                reqLetter.style.color = '#dc3545'
                reqLetter.querySelector('i').className = 'fas fa-circle'
            }
        }
        
        if (reqNumber) {
            if (/[0-9]/.test(password)) {
                reqNumber.style.color = '#28a745'
                reqNumber.querySelector('i').className = 'fas fa-check-circle'
            } else {
                reqNumber.style.color = '#dc3545'
                reqNumber.querySelector('i').className = 'fas fa-circle'
            }
        }
        
        if (reqSpecial) {
            if (/[^a-zA-Z0-9]/.test(password)) {
                reqSpecial.style.color = '#28a745'
                reqSpecial.querySelector('i').className = 'fas fa-check-circle'
            } else {
                reqSpecial.style.color = '#dc3545'
                reqSpecial.querySelector('i').className = 'fas fa-circle'
            }
        }

        // Update strength bar
        const fill = document.getElementById('passwordStrengthFill')
        const text = document.getElementById('passwordStrengthText')
        
        if (fill && text) {
            let strength = 0
            if (password.length >= 8) strength += 25
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
            if (/[0-9]/.test(password)) strength += 25
            if (/[^a-zA-Z0-9]/.test(password)) strength += 25
            
            fill.style.width = strength + '%'
            
            if (strength === 0) {
                fill.style.background = '#dc3545'
                text.textContent = 'Password strength: Weak'
                text.style.color = '#dc3545'
            } else if (strength <= 25) {
                fill.style.background = '#dc3545'
                text.textContent = 'Password strength: Weak'
                text.style.color = '#dc3545'
            } else if (strength <= 50) {
                fill.style.background = '#ffc107'
                text.textContent = 'Password strength: Fair'
                text.style.color = '#ffc107'
            } else if (strength <= 75) {
                fill.style.background = '#17a2b8'
                text.textContent = 'Password strength: Good'
                text.style.color = '#17a2b8'
            } else {
                fill.style.background = '#28a745'
                text.textContent = 'Password strength: Strong'
                text.style.color = '#28a745'
            }
        }

        // Update form validation
        validateForm()
    }

    const validateForm = () => {
        const submitBtn = document.getElementById('rdeSubmitBtn')
        if (!submitBtn) return

        const isValid = data.email.trim() !== '' &&
            data.userName.trim() !== '' &&
            data.password.trim() !== '' &&
            data.password.length >= 8

        submitBtn.disabled = !isValid
        if (isValid) {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
            submitBtn.style.background = 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
            submitBtn.style.boxShadow = '0 4px 15px rgba(25, 118, 210, 0.3)'
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.background = '#cccccc'
            submitBtn.style.boxShadow = 'none'
        }
    }

    const getData = {
        getEmail: (value) => { 
            data.email = value; 
            validateForm() 
        },
        getUserName: (value) => { 
            data.userName = value; 
            validateForm() 
        },
        getPassword: (value) => { 
            data.password = value; 
            validateForm() 
        }
    }

    // Create password requirements with all checks
    const createPasswordRequirements = () => {
        return $({
            tag: 'div',
            att: { 
                className: 'password-requirements',
                id: 'passwordRequirements',
                style: 'margin-top: 8px; display: flex; gap: 16px; flex-wrap: wrap;'
            },
            child: [
                $({
                    tag: 'span',
                    att: { 
                        className: 'req-item',
                        id: 'reqLength',
                        style: 'font-size: 12px; color: #dc3545; display: flex; align-items: center; gap: 4px;'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { 
                                className: 'fas fa-circle',
                                style: 'font-size: 8px;'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Min 8 characters'
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { 
                        className: 'req-item',
                        id: 'reqLetter',
                        style: 'font-size: 12px; color: #dc3545; display: flex; align-items: center; gap: 4px;'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { 
                                className: 'fas fa-circle',
                                style: 'font-size: 8px;'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Contains letter'
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { 
                        className: 'req-item',
                        id: 'reqNumber',
                        style: 'font-size: 12px; color: #dc3545; display: flex; align-items: center; gap: 4px;'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { 
                                className: 'fas fa-circle',
                                style: 'font-size: 8px;'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Contains number'
                        })
                    ]
                }),
                $({
                    tag: 'span',
                    att: { 
                        className: 'req-item',
                        id: 'reqSpecial',
                        style: 'font-size: 12px; color: #dc3545; display: flex; align-items: center; gap: 4px;'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { 
                                className: 'fas fa-circle',
                                style: 'font-size: 8px;'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Contains special character'
                        })
                    ]
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'form-container rde-form-modern' },
        child: [
            // Header with icon
            $({
                tag: 'div',
                att: { className: 'form-header-modern' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'form-header-icon' },
                        child: [
                            $({
                                tag: 'i',
                                att: { 
                                    className: 'fas fa-user-cog',
                                    style: 'font-size: 28px; color: #1976d2;'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'form-header-text' },
                        child: [
                            $({ 
                                tag: 'h3', 
                                text: 'RDE Staff Registration', 
                                att: { className: 'form-title-modern' } 
                            }),
                            $({
                                tag: 'p',
                                text: 'Create a new RDE staff account with administrative privileges',
                                att: { className: 'form-subtitle' }
                            })
                        ]
                    })
                ]
            }),

            // Full Name
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Full Name', 
                        att: { 
                            className: 'form-label-modern',
                            style: 'display: flex; align-items: center; gap: 8px;'
                        }
                    }),
                    createInputWithIcon({
                        placeholder: 'Enter full name (e.g., Juan Dela Cruz)',
                        type: 'text',
                        getDataMethod: getData.getEmail,
                        id: 'rdeNameInput',
                        icon: 'fa-user'
                    })
                ]
            }),

            // Username
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Username', 
                        att: { 
                            className: 'form-label-modern',
                            style: 'display: flex; align-items: center; gap: 8px;'
                        }
                    }),
                    createInputWithIcon({
                        placeholder: 'Create a unique username (no spaces)',
                        type: 'text',
                        getDataMethod: getData.getUserName,
                        filter: true,
                        id: 'rdeUsernameInput',
                        icon: 'fa-user-circle'
                    })
                ]
            }),

            // Password with strength indicator
            $({
                tag: 'div',
                att: { className: 'form-group-modern' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Password', 
                        att: { 
                            className: 'form-label-modern',
                            style: 'display: flex; align-items: center; gap: 8px;'
                        }
                    }),
                    createInputWithIcon({
                        placeholder: 'Enter password (minimum 8 characters)',
                        type: 'password',
                        getDataMethod: getData.getPassword,
                        filter: true,
                        id: 'rdePasswordInput',
                        icon: 'fa-lock'
                    }),
                    // Password requirements - Now properly attached
                    createPasswordRequirements(),
                    // Password strength bar
                    $({
                        tag: 'div',
                        att: { 
                            className: 'password-strength-container',
                            id: 'passwordStrengthContainer',
                            style: 'margin-top: 4px;'
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: { 
                                    className: 'password-strength-bar',
                                    id: 'passwordStrengthBar',
                                    style: 'height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: { 
                                            id: 'passwordStrengthFill',
                                            style: 'height: 100%; width: 0%; background: #dc3545; transition: all 0.3s ease; border-radius: 2px;'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                att: { 
                                    id: 'passwordStrengthText',
                                    style: 'font-size: 11px; color: #6c757d; margin-top: 4px; text-align: right;'
                                },
                                text: 'Password strength: Weak'
                            })
                        ]
                    })
                ]
            }),

            // Register Button
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit-modern',
                    id: 'rdeSubmitBtn',
                    disabled: true
                },
                child: [
                    $({
                        tag: 'i',
                        att: { 
                            className: 'fas fa-user-plus',
                            style: 'font-size: 18px;'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Register Staff'
                    })
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        const submitBtn = document.getElementById('rdeSubmitBtn')
                        if (submitBtn.disabled) return

                        // Validate all fields
                        if (!data.email || !data.userName || !data.password) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'All fields are required!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        // Validate password length
                        if (data.password.length < 8) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Password must be at least 8 characters long!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        // Validate username (no spaces)
                        if (/\s/.test(data.userName)) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Username cannot contain spaces!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        // Show loading
                        const load = Waiting()
                        document.body.appendChild(load)
                        load.offsetHeight
                        await new Promise(resolve => setTimeout(resolve, 50))

                        const form = new FormData()
                        form.append('submitStaff', 'true')
                        form.append('staffEmail', data.email)
                        form.append('staffUserName', data.userName)
                        form.append('staffPassword', data.password)
                        submitBtn.disabled = true

                        try {
                            const res = await fetch('/rdeStaff', { method: 'POST', body: form })
                            const responseData = await res.json()
                            load.remove()

                            if (responseData.status) {
                                // Reset form
                                data.email = ''
                                data.userName = ''
                                data.password = ''
                                
                                const nameInput = document.getElementById('rdeNameInput')
                                const usernameInput = document.getElementById('rdeUsernameInput')
                                const passwordInput = document.getElementById('rdePasswordInput')
                                
                                if (nameInput) nameInput.value = ''
                                if (usernameInput) usernameInput.value = ''
                                if (passwordInput) passwordInput.value = ''
                                
                                // Reset password strength
                                const fill = document.getElementById('passwordStrengthFill')
                                const text = document.getElementById('passwordStrengthText')
                                if (fill) fill.style.width = '0%'
                                if (text) {
                                    text.textContent = 'Password strength: Weak'
                                    text.style.color = '#6c757d'
                                }
                                
                                // Reset requirements
                                ['reqLength', 'reqLetter', 'reqNumber', 'reqSpecial'].forEach(id => {
                                    const el = document.getElementById(id)
                                    if (el) {
                                        el.style.color = '#dc3545'
                                        const icon = el.querySelector('i')
                                        if (icon) icon.className = 'fas fa-circle'
                                    }
                                })
                                
                                validateForm()
                                
                                ConfirmationModal({
                                    title: 'Success',
                                    message: 'RDE Staff account successfully registered!',
                                    type: 'success',
                                    confirmText: 'OK',
                                    onConfirm: () => window.location.reload()
                                })
                            } else {
                                ConfirmationModal({
                                    title: 'Registration Failed',
                                    message: responseData.message || 'Failed to register staff account',
                                    type: 'error',
                                    confirmText: 'OK',
                                    onConfirm: () => {
                                        submitBtn.disabled = false
                                        validateForm()
                                    }
                                })
                            }
                        } catch (error) {
                            load.remove()
                            console.error('Error:', error)
                            ConfirmationModal({
                                title: 'Error',
                                message: 'An error occurred during submission',
                                type: 'error',
                                confirmText: 'OK',
                                onConfirm: () => {
                                    submitBtn.disabled = false
                                    validateForm()
                                }
                            })
                        }
                    }
                }
            }),

            // Footer info
            $({
                tag: 'div',
                att: { 
                    className: 'form-footer',
                    style: 'margin-top: 16px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;'
                },
                child: [
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-shield-alt', style: 'color: #28a745;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Secure registration'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-clock', style: 'color: #ffc107;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Takes less than 2 minutes'
                            })
                        ]
                    }),
                    $({
                        tag: 'span',
                        att: { 
                            style: 'font-size: 12px; color: #6c757d; display: flex; align-items: center; gap: 6px;'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-check-circle', style: 'color: #17a2b8;' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Admin access granted'
                            })
                        ]
                    })
                ]
            })
        ]
    })
}

// Evaluator Registration
const encodeEvaluator = () => {
    const data = {
        eventIds: [], // Store multiple event IDs
        center: '',
        fullname: '',
        username: '',
        password: '',
        confirmPass: '',
        registrationType: 'center',
        categories: [] // Will store category IDs
    }

    // Category mapping - name to ID with icons
    const categoryMap = {
        "Social Science": 1,
        "Natural / Biological": 2,
        "Food": 3,
        "Development": 4,
        "Extension": 5
    }

    // Category list for display with icons
    const categories = [
        { name: "Social Science", icon: "fa-users", color: "#4CAF50" },
        { name: "Natural / Biological", icon: "fa-leaf", color: "#2196F3" },
        { name: "Food", icon: "fa-utensils", color: "#FF9800" },
        { name: "Development", icon: "fa-chart-line", color: "#9C27B0" },
        { name: "Extension", icon: "fa-handshake", color: "#F44336" }
    ]

    // Event type icons mapping
    const getEventIcon = (eventName) => {
        const name = eventName.toLowerCase()
        if (name.includes('symposium')) {
            return { icon: 'fa-microphone', color: '#1976d2' }
        } else if (name.includes('review') || name.includes('in-house')) {
            return { icon: 'fa-clipboard-check', color: '#FF6F00' }
        } else if (name.includes('conference')) {
            return { icon: 'fa-users', color: '#388E3C' }
        } else if (name.includes('workshop')) {
            return { icon: 'fa-tools', color: '#C62828' }
        } else if (name.includes('seminar')) {
            return { icon: 'fa-chalkboard-teacher', color: '#6A1B9A' }
        } else {
            return { icon: 'fa-calendar-alt', color: '#455A64' }
        }
    }

    // Helper function to update the selected events display
    const updateSelectedEventsDisplay = (eventNames) => {
        const displayElement = document.getElementById('selectedEventValues')
        if (displayElement) {
            if (eventNames && eventNames.length > 0) {
                displayElement.textContent = eventNames.join(', ')
                displayElement.style.color = '#1976d2'
            } else {
                displayElement.textContent = 'None selected'
                displayElement.style.color = '#9ca3af'
            }
        }
    }

    // Helper function to update selected categories display
    const updateSelectedCategoriesDisplay = (categoryNames) => {
        const displayElement = document.getElementById('selectedCategoryValues')
        if (displayElement) {
            if (categoryNames && categoryNames.length > 0) {
                displayElement.textContent = categoryNames.join(', ')
                displayElement.style.color = '#1976d2'
            } else {
                displayElement.textContent = 'None'
                displayElement.style.color = '#9ca3af'
            }
        }
    }

    const validateForm = () => {
        const submitBtn = document.getElementById('submitEvalBtn')
        if (!submitBtn) return

        let isValid = false
        if (data.registrationType === 'center') {
            isValid = data.center.trim() !== '' && 
                data.eventIds.length > 0 &&
                data.fullname.trim() !== '' && 
                data.username.trim() !== '' &&
                data.password.trim() !== '' && 
                data.confirmPass.trim() !== '' &&
                data.password === data.confirmPass
        } else {
            isValid = data.categories.length > 0 && 
                data.eventIds.length > 0 &&
                data.fullname.trim() !== '' && 
                data.username.trim() !== '' &&
                data.password.trim() !== '' && 
                data.confirmPass.trim() !== '' &&
                data.password === data.confirmPass
        }

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.backgroundColor = isValid ? '#1976d2' : '#cccccc'
    }

    const getData = {
        getEventIds: (value) => {
            // value is the event ID from checkbox
            const checkbox = document.getElementById(`event_${value}`)
            if (checkbox.checked) {
                if (!data.eventIds.includes(value)) {
                    data.eventIds.push(value)
                }
            } else {
                data.eventIds = data.eventIds.filter(id => id !== value)
            }
            
            // Get selected event names for display
            const selectedNames = []
            document.querySelectorAll('input[name="evalEvent"]:checked').forEach(cb => {
                const label = cb.parentElement.querySelector('.event-radio-text')
                if (label) selectedNames.push(label.textContent)
            })
            updateSelectedEventsDisplay(selectedNames)
            validateForm()
        },
        getCenter: (value) => { 
            data.center = value; 
            validateForm() 
        },
        getFullname: (value) => { 
            data.fullname = value; 
            validateForm() 
        },
        getUsername: (value) => { 
            data.username = value; 
            validateForm() 
        },
        getPassword: (value) => { 
            data.password = value; 
            validateForm() 
        },
        getConfirmPass: (value) => { 
            data.confirmPass = value; 
            validateForm() 
        },
        getRegistrationType: (value) => {
            data.registrationType = value
            data.categories = []
            data.center = ''

            const centerGroup = document.getElementById('evalCenterGroup')
            const categoryGroup = document.getElementById('evalCategoryGroup')

            if (value === 'center') {
                if (centerGroup) centerGroup.style.display = 'block'
                if (categoryGroup) categoryGroup.style.display = 'none'

                document.querySelectorAll('input[name="evalCategory"]').forEach(checkbox => {
                    checkbox.checked = false
                })

                const centerSelect = document.getElementById('evalCenterSelect')
                if (centerSelect) {
                    centerSelect.disabled = false
                    centerSelect.value = ''
                }

                updateSelectedCategoriesDisplay([])
            } else {
                if (centerGroup) centerGroup.style.display = 'none'
                if (categoryGroup) categoryGroup.style.display = 'block'

                const centerSelect = document.getElementById('evalCenterSelect')
                if (centerSelect) {
                    centerSelect.disabled = true
                    centerSelect.value = ''
                }
            }

            validateForm()
        },
        getCategories: (value) => {
            // Get all checked checkboxes
            const checkedBoxes = document.querySelectorAll('input[name="evalCategory"]:checked')
            data.categories = Array.from(checkedBoxes).map(cb => {
                const categoryName = cb.value
                return categoryMap[categoryName]
            }).filter(id => id !== undefined)

            const categoryNames = Array.from(checkedBoxes).map(cb => cb.value)
            updateSelectedCategoriesDisplay(categoryNames)
            validateForm()
        }
    }

    // Create event checkboxes with icons and modern design
    const createEventCheckboxes = (events) => {
        if (!events || events.length === 0) {
            return [
                $({
                    tag: 'div',
                    att: { className: 'event-option empty' },
                    child: [
                        $({
                            tag: 'span',
                            text: 'No events available',
                            att: { className: 'text-muted' }
                        })
                    ]
                })
            ]
        }

        return events.map(event => {
            const eventIcon = getEventIcon(event.name)
            return $({
                tag: 'label',
                att: { 
                    className: 'event-radio-label',
                    style: `--event-color: ${eventIcon.color}`
                },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'checkbox',
                            name: 'evalEvent',
                            value: event.id,
                            className: 'event-radio-input',
                            id: `event_${event.id}`
                        },
                        event: {
                            type: 'change',
                            method: (e) => {
                                getData.getEventIds(event.id)
                            }
                        }
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'event-item-content' },
                        child: [
                            $({
                                tag: 'div',
                                att: { className: 'event-icon-wrapper' },
                                child: [
                                    $({
                                        tag: 'i',
                                        att: { 
                                            className: `fas ${eventIcon.icon} event-icon`,
                                            style: `color: ${eventIcon.color}`
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                att: { className: 'event-info' },
                                child: [
                                    $({
                                        tag: 'span', 
                                        text: event.name, 
                                        att: { className: 'event-radio-text' }
                                    }),
                                    $({
                                        tag: 'span',
                                        att: { className: 'event-badge' },
                                        text: event.name.toLowerCase().includes('symposium') ? 'Symposium' : 
                                               event.name.toLowerCase().includes('review') ? 'Review' : 'Event'
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        })
    }

    // Create category checkboxes with icons and modern design
    const createCategoryCheckboxes = () => {
        return categories.map(category =>
            $({
                tag: 'label',
                att: { 
                    className: 'category-radio-label',
                    style: `--category-color: ${category.color}`
                },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'checkbox',
                            name: 'evalCategory',
                            value: category.name,
                            className: 'category-radio-input'
                        },
                        event: {
                            type: 'change',
                            method: () => getData.getCategories()
                        }
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'category-item-content' },
                        child: [
                            $({
                                tag: 'div',
                                att: { className: 'category-icon-wrapper' },
                                child: [
                                    $({
                                        tag: 'i',
                                        att: { 
                                            className: `fas ${category.icon} category-icon`,
                                            style: `color: ${category.color}`
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'span', 
                                text: category.name, 
                                att: { className: 'category-radio-text' }
                            })
                        ]
                    })
                ]
            })
        )
    }

    // Helper function to create input fields
    const createInput = ({ placeholder, type, getDataMethod, id, icon }) => {
        return $({
            tag: 'div',
            att: { className: 'input-with-icon' },
            child: [
                $({
                    tag: 'i',
                    att: { 
                        className: `fas ${icon} input-icon`,
                        style: 'position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;'
                    }
                }),
                $({
                    tag: 'input',
                    att: {
                        type: type,
                        placeholder: placeholder,
                        className: 'modern-input with-icon',
                        id: id,
                        style: 'padding-left: 40px;'
                    },
                    event: {
                        type: 'input',
                        method: (event) => getDataMethod(event.target.value)
                    }
                })
            ]
        })
    }

    return $({
        tag: 'div',
        att: { className: 'form-container evaluator-form' },
        child: [
            $({ 
                tag: 'h3', 
                text: 'Evaluator Registration', 
                att: { className: 'form-title' } 
            }),

            // Registration Type
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Registration Type', 
                        att: { className: 'form-label-modern' } 
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'radio-group-modern' },
                        child: [
                            $({
                                tag: 'label',
                                att: { className: 'radio-card' },
                                child: [
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'radio',
                                            name: 'evalRegistrationType',
                                            value: 'center',
                                            checked: true
                                        },
                                        event: {
                                            type: 'change',
                                            method: () => getData.getRegistrationType('center')
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        att: { className: 'radio-card-content' },
                                        child: [
                                            $({
                                                tag: 'i',
                                                att: { className: 'fas fa-building radio-card-icon' }
                                            }),
                                            $({ 
                                                tag: 'span', 
                                                text: 'Center-based Evaluator',
                                                att: { className: 'radio-card-label' }
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag: 'label',
                                att: { className: 'radio-card' },
                                child: [
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'radio',
                                            name: 'evalRegistrationType',
                                            value: 'category'
                                        },
                                        event: {
                                            type: 'change',
                                            method: () => getData.getRegistrationType('category')
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        att: { className: 'radio-card-content' },
                                        child: [
                                            $({
                                                tag: 'i',
                                                att: { className: 'fas fa-tags radio-card-icon' }
                                            }),
                                            $({ 
                                                tag: 'span', 
                                                text: 'Category-based Evaluator',
                                                att: { className: 'radio-card-label' }
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),

            // Multi-Event Selection with checkboxes
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({
                        tag: 'label',
                        text: 'Select Events (Select one or multiple)',
                        att: { className: 'form-label-modern' }
                    }),
                    $({
                        tag: 'div',
                        att: { 
                            className: 'event-grid-modern',
                            id: 'eventCheckboxContainer'
                        },
                        elementHandler: async (el) => {
                            try {
                                const req = new Request('/eventRequest')
                                req.Post([{ name: 'getEvent', value: '0' }])
                                req.Json()
                                const events = await req.Send()
                                
                                const checkboxElements = createEventCheckboxes(events)
                                checkboxElements.forEach(checkboxEl => {
                                    el.appendChild(checkboxEl)
                                })
                            } catch (error) {
                                console.error('Error loading events:', error)
                                el.innerHTML = '<div class="text-danger">Failed to load events</div>'
                            }
                        }
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'selected-events-display-modern',
                            id: 'selectedEventsDisplay'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-check-circle selected-icon' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Selected Events: ',
                                att: { className: 'selected-label' }
                            }),
                            $({
                                tag: 'span',
                                text: 'None selected',
                                att: {
                                    className: 'selected-values',
                                    id: 'selectedEventValues'
                                }
                            })
                        ]
                    })
                ]
            }),

            // Center Selection Group (visible by default)
            $({
                tag: 'div',
                att: {
                    className: 'form-group',
                    id: 'evalCenterGroup',
                    style: 'display: block;'
                },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Select Center', 
                        att: { className: 'form-label-modern' } 
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'select-with-icon' },
                        child: [
                            $({
                                tag: 'i',
                                att: { 
                                    className: 'fas fa-university select-icon',
                                    style: 'position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;'
                                }
                            }),
                            $({
                                tag: 'select',
                                att: {
                                    className: 'modern-select with-icon',
                                    id: 'evalCenterSelect',
                                    disabled: false,
                                    style: 'padding-left: 40px;'
                                },
                                event: {
                                    type: 'change',
                                    method: (event) => getData.getCenter(event.target.value)
                                },
                                elementHandler: async (el) => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: '-- Select Center --',
                                        att: { selected: true, value: '' }
                                    }))
                                    try {
                                        const req = new Request('/evaluatorReg')
                                        req.Post([{ name: 'getCenters', value: 'true' }])
                                        req.Json()
                                        const data = await req.Send()
                                        data.forEach(center => {
                                            el.appendChild($({
                                                tag: 'option',
                                                text: center.name || center.code,
                                                att: { value: center.id }
                                            }))
                                        })
                                    } catch (error) {
                                        console.error('Error loading centers:', error)
                                    }
                                }
                            })
                        ]
                    })
                ]
            }),

            // Category Selection Group (hidden by default)
            $({
                tag: 'div',
                att: {
                    className: 'form-group',
                    id: 'evalCategoryGroup',
                    style: 'display: none;'
                },
                child: [
                    $({
                        tag: 'label',
                        text: 'Select Categories (Check all that apply)',
                        att: { className: 'form-label-modern' }
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'category-grid-modern' },
                        child: createCategoryCheckboxes()
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'selected-categories-display-modern',
                            id: 'selectedCategoriesDisplay'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: { className: 'fas fa-tag selected-icon' }
                            }),
                            $({
                                tag: 'span',
                                text: 'Selected: ',
                                att: { className: 'selected-label' }
                            }),
                            $({
                                tag: 'span',
                                text: 'None',
                                att: {
                                    className: 'selected-values',
                                    id: 'selectedCategoryValues'
                                }
                            })
                        ]
                    })
                ]
            }),

            // Full Name
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Evaluator Full Name', 
                        att: { className: 'form-label-modern' } 
                    }),
                    createInput({
                        placeholder: 'Enter full name',
                        type: 'text',
                        getDataMethod: getData.getFullname,
                        id: 'evalNameInput',
                        icon: 'fa-user'
                    })
                ]
            }),

            // Username
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Username', 
                        att: { className: 'form-label-modern' } 
                    }),
                    createInput({
                        placeholder: 'Create username',
                        type: 'text',
                        getDataMethod: getData.getUsername,
                        id: 'evalUsernameInput',
                        icon: 'fa-user-circle'
                    })
                ]
            }),

            // Password
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Password', 
                        att: { className: 'form-label-modern' } 
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'input-with-icon' },
                        child: [
                            $({
                                tag: 'i',
                                att: { 
                                    className: 'fas fa-lock input-icon',
                                    style: 'position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;'
                                }
                            }),
                            $({
                                tag: 'input',
                                att: {
                                    type: 'password',
                                    placeholder: 'Enter password (max 20 chars)',
                                    className: 'modern-input with-icon',
                                    id: 'evalPasswordInput',
                                    maxLength: '20',
                                    style: 'padding-left: 40px;'
                                },
                                event: {
                                    type: 'input',
                                    method: (event) => getData.getPassword(event.target.value)
                                },
                                elementHandler: SpecialChar
                            })
                        ]
                    })
                ]
            }),

            // Confirm Password
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ 
                        tag: 'label', 
                        text: 'Confirm Password', 
                        att: { className: 'form-label-modern' } 
                    }),
                    $({
                        tag: 'div',
                        att: { className: 'input-with-icon' },
                        child: [
                            $({
                                tag: 'i',
                                att: { 
                                    className: 'fas fa-check-circle input-icon',
                                    style: 'position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;'
                                }
                            }),
                            $({
                                tag: 'input',
                                att: {
                                    type: 'password',
                                    placeholder: 'Re-type password',
                                    className: 'modern-input with-icon',
                                    id: 'evalConfirmInput',
                                    maxLength: '20',
                                    style: 'padding-left: 40px;'
                                },
                                event: {
                                    type: 'input',
                                    method: (event) => getData.getConfirmPass(event.target.value)
                                },
                                elementHandler: (el) => {
                                    el.addEventListener('keypress', (event) => {
                                        if (!((event.keyCode >= 65 && event.keyCode <= 90) ||
                                            (event.keyCode >= 97 && event.keyCode <= 122) ||
                                            (event.keyCode >= 48 && event.keyCode <= 57))) {
                                            ConfirmationModal({
                                                title: 'Invalid Character',
                                                message: 'Special character is not allowed!',
                                                type: 'error',
                                                confirmText: 'OK'
                                            })
                                            event.preventDefault()
                                        }
                                    })
                                }
                            })
                        ]
                    })
                ]
            }),

            // Submit
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit-modern',
                    id: 'submitEvalBtn',
                    disabled: true
                },
                child: [
                    $({
                        tag: 'i',
                        att: { className: 'fas fa-user-plus submit-icon' }
                    }),
                    $({
                        tag: 'span',
                        text: 'Register Evaluator'
                    })
                ],
                event: {
                    type: 'click',
                    method: async () => {
                        const submitBtn = document.getElementById('submitEvalBtn')
                        if (submitBtn.disabled) return

                        if (data.password !== data.confirmPass) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Passwords do not match!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        if (data.eventIds.length === 0) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select at least one event!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        if (data.registrationType === 'center' && !data.center) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select a center!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        if (data.registrationType === 'category' && data.categories.length === 0) {
                            ConfirmationModal({
                                title: 'Validation Error',
                                message: 'Please select at least one category!',
                                type: 'error',
                                confirmText: 'OK'
                            })
                            return
                        }

                        // Convert event IDs to comma-separated string
                        const eventIdsString = data.eventIds.join(',')

                        console.log('Submitting registration:', {
                            registrationType: data.registrationType,
                            eventIds: data.eventIds,
                            eventIdsString: eventIdsString,
                            categories: data.categories,
                            center: data.center
                        })

                        const load = Waiting()
                        document.body.appendChild(load)
                        load.offsetHeight
                        await new Promise(resolve => setTimeout(resolve, 50))

                        const form = new FormData()
                        form.append('evaluatorRegister', 'true')
                        form.append('username', data.username.toUpperCase())
                        form.append('password', data.password)
                        form.append('fullname', data.fullname.toUpperCase())
                        form.append('registrationType', data.registrationType)
                        form.append('center', data.center || '')
                        form.append('eventIds', eventIdsString)
                        form.append('categories', JSON.stringify(data.categories))

                        submitBtn.disabled = true

                        try {
                            const res = await fetch('/evaluatorReg', {
                                method: 'POST',
                                body: form
                            })
                            load.remove()

                            if (res.ok) {
                                const dat = await res.json()
                                if (dat.status) {
                                    ConfirmationModal({
                                        title: 'Success',
                                        message: dat.message || 'Evaluator successfully registered!',
                                        type: 'success',
                                        confirmText: 'OK',
                                        onConfirm: () => window.location.reload()
                                    })
                                } else {
                                    console.error('Registration failed:', dat.message)
                                    ConfirmationModal({
                                        title: 'Registration Failed',
                                        message: dat.message || 'Failed to register evaluator',
                                        type: 'error',
                                        confirmText: 'OK',
                                        onConfirm: () => {
                                            submitBtn.disabled = false
                                            validateForm()
                                        }
                                    })
                                }
                            } else {
                                const errorText = await res.text()
                                console.error('Server error:', errorText)
                                ConfirmationModal({
                                    title: 'Error',
                                    message: 'Server error occurred: ' + res.status,
                                    type: 'error',
                                    confirmText: 'OK',
                                    onConfirm: () => {
                                        submitBtn.disabled = false
                                        validateForm()
                                    }
                                })
                            }
                        } catch (error) {
                            load.remove()
                            console.error('Error:', error)
                            ConfirmationModal({
                                title: 'Error',
                                message: 'An error occurred during submission: ' + error.message,
                                type: 'error',
                                confirmText: 'OK',
                                onConfirm: () => {
                                    submitBtn.disabled = false
                                    validateForm()
                                }
                            })
                        }
                    }
                }
            })
        ]
    })
}


export const AddUser = () => {
    document.head.append($({
        tag: 'link',
        att: {
            rel: 'stylesheet',
            href: '/client/component/adminComponent/componentStyle/adduser.css'
        }
    }))

    const tabs = [
        { id: 'centerChair', label: 'Center Chair', component: encodeCenterChair },
        { id: 'researchChair', label: 'Research Chair', component: encodeResearchChair },
        { id: 'rdeStaff', label: 'RDE Staff', component: rdeUser },
        { id: 'evaluator', label: 'Evaluator', component: encodeEvaluator }
    ]

    let currentTab = 'centerChair'
    const tabContents = {}
    const tabContainer = $({
        tag: 'div',
        att: { className: 'tab-container' }
    })

    const contentContainer = $({
        tag: 'div',
        att: { className: 'tab-content' }
    })

    const showTab = (tabId) => {
        Object.keys(tabContents).forEach(id => {
            tabContents[id].style.display = 'none'
        })

        if (tabContents[tabId]) {
            tabContents[tabId].style.display = 'block'
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabId
            if (isActive) {
                btn.classList.add('active')
            } else {
                btn.classList.remove('active')
            }
        })

        currentTab = tabId
    }

    tabs.forEach(tab => {
        const btn = document.createElement('button')
        btn.className = `tab-btn ${tab.id === currentTab ? 'active' : ''}`
        btn.setAttribute('data-tab', tab.id)
        btn.textContent = tab.label

        btn.addEventListener('click', function (e) {
            const tabId = this.getAttribute('data-tab')
            showTab(tabId)
        })

        tabContainer.appendChild(btn)

        const contentDiv = document.createElement('div')
        contentDiv.className = 'tab-content-item'
        contentDiv.style.display = tab.id === currentTab ? 'block' : 'none'
        contentDiv.id = `tab-${tab.id}`
        contentDiv.appendChild(tab.component())
        contentContainer.appendChild(contentDiv)
        tabContents[tab.id] = contentDiv
    })

    return $({
        tag: 'div',
        att: { className: 'add-user-modern' },
        child: [
            $({
                tag: 'div',
                att: { className: 'header-modern' },
                child: [
                    $({ tag: 'h1', text: 'Account Registration', att: { className: 'main-title' } }),
                    $({ tag: 'p', text: 'Register new accounts for different user roles', att: { className: 'subtitle' } })
                ]
            }),
            tabContainer,
            contentContainer
        ]
    })
}
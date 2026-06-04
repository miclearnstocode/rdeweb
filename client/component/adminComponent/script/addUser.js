import {$, ConfirmationAlert, Request, SpecialChar, Waiting, ConfirmationModal} from '../../../lib/lib.js'

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
        
        // Map center values to user types
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

    const getData = {
        getCenter: (value) => {
            accountData.center = value
            accountData.campus = '' // Reset campus when center changes
            
            // Update user type based on center (without campus for Extension)
            if (value !== 'Extension') {
                accountData.userType = generateUserType(value)
            } else {
                accountData.userType = generateUserType(value, '') // Show placeholder
            }
            
            updateCampusField(value) // Show/hide campus field based on selection
            updateUserTypeDisplay() // Update display immediately
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        },
        getCampus: (value) => {
            accountData.campus = value
            // Update user type to include campus name for Extension
            if (accountData.center === 'Extension') {
                accountData.userType = generateUserType(accountData.center, value)
                updateUserTypeDisplay() // Update display when campus is selected
            }
            validateForm()
        }
    }

    // Validation function
    const validateForm = () => {
        const submitBtn = document.getElementById('centerDirectorSubmitBtn')
        if (!submitBtn) return
        
        let isValid = 
            accountData.center.trim() !== '' &&
            accountData.gmail.trim() !== ''
        
        // Add campus validation if Extension is selected
        if (accountData.center === 'Extension') {
            isValid = isValid && accountData.campus && accountData.campus.trim() !== ''
        }
        
        // Also check that user type is valid (not placeholder)
        if (accountData.center === 'Extension' && (!accountData.campus || accountData.campus.trim() === '')) {
            isValid = false
        }
        
        submitBtn.disabled = !isValid
        if (submitBtn.disabled) {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
        } else {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
        }
    }

    const label = $({
        tag: 'div',
        text: 'Center Chair Account Registration',
        att: {
            className: 'form-label'
        }
    })

    // Custom select component
    const select = ({ getDataMethod }) => {
        const selectEl = $({
            tag: 'select',
            event: {
                type: 'change',
                method: (event) => {
                    if (getDataMethod) {
                        getDataMethod(event.target.value)
                    }
                }
            },
            att: {
                className: 'selectAddUser',
                id: 'centerSelection'
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
                $({
                    tag: 'option',
                    text: 'Crop Science Research & Development Center (CSRDC)',
                    att: { value: 'CSRDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Livestock Research & Development Center (LRDC)',
                    att: { value: 'LRDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Fisheries Research & Development Center (FRDC)',
                    att: { value: 'FRDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Food and Industrial Technology Research & Development Center (FITRDC)',
                    att: { value: 'FITRDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Social Science Research & Development Center (SSRDC)',
                    att: { value: 'SSRDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Machinery and Agricultural Technology Engineering Center (MATEC)',
                    att: { value: 'MATEC' }
                }),
                $({
                    tag: 'option',
                    text: 'Coconut Research and Development Center (Coco RDC)',
                    att: { value: 'Coco RDC' }
                }),
                $({
                    tag: 'option',
                    text: 'Extension',
                    att: { value: 'Extension' }
                }),
            ]
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container'
            },
            child: [selectEl]
        }))
    }

    // Input component
    const input = ({ getDataMethod, prop, filter }) => {
        const inputEl = $({
            tag: 'input',
            att: prop,
            elementHandler: (el) => {
                if (filter) {
                    el.addEventListener('keypress', (event) => {
                        if (event.keyCode === 32) {
                            alert("Invalid Character")
                            return event.returnValue = false
                        }
                    })
                }
            },
            event: {
                type: 'input',
                method: (event) => {
                    if (getDataMethod) {
                        getDataMethod(event.target.value)
                    }
                }
            }
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container'
            },
            child: [inputEl]
        }))
    }

    // Campus select component (dropdown for Extension campuses)
    const campusSelect = () => {
        const campuses = [
            'Roxas City Main',
            'Burias',
            'Mambusao',
            'Dayao',
            'Pilar',
            'Pontevedra',
            'Sigma',
            'Sapian',
            'Tapaz',
            'Dumarao'
        ]

        const selectEl = $({
            tag: 'select',
            event: {
                type: 'change',
                method: (event) => {
                    getData.getCampus(event.target.value)
                }
            },
            att: {
                className: 'selectAddUser',
                id: 'campusSelect'
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
                ...campuses.map(campus => 
                    $({
                        tag: 'option',
                        text: campus,
                        att: { value: campus }
                    })
                )
            ]
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container',
                id: 'campusSelectContainer'
            },
            child: [selectEl]
        }))
    }

    // User type display (shows what role will be created)
    let userTypeDisplayElement = null
    
    const createUserTypeDisplay = () => {
        const displayEl = $({
            tag: 'div',
            att: {
                className: 'user-type-display',
                id: 'userTypeDisplay'
            },
            child: [
                $({
                    tag: 'span',
                    text: 'Role to be created: ',
                    att: {
                        className: 'user-type-label'
                    }
                }),
                $({
                    tag: 'span',
                    text: accountData.userType,
                    att: {
                        className: 'user-type-value',
                        id: 'userTypeValue'
                    }
                })
            ]
        })
        return displayEl
    }
    
    // Function to update user type display
    const updateUserTypeDisplay = () => {
        const userTypeValueSpan = document.getElementById('userTypeValue')
        if (userTypeValueSpan) {
            userTypeValueSpan.textContent = accountData.userType
            
            // Change color based on whether it's a placeholder or actual role
            if (accountData.userType && accountData.userType.includes('Chair')) {
                userTypeValueSpan.style.color = '#4CAF50' // Green for valid role
                userTypeValueSpan.style.fontWeight = 'bold'
            } else if (accountData.userType) {
                userTypeValueSpan.style.color = '#ff9800' // Orange for waiting
                userTypeValueSpan.style.fontWeight = 'normal'
            } else {
                userTypeValueSpan.style.color = '#cccccc' // Gray for not selected
                userTypeValueSpan.style.fontWeight = 'normal'
            }
        }
    }

    // Store reference to campus field container
    let campusFieldContainer = null

    // Function to update campus field visibility
    const updateCampusField = (centerValue) => {
        const container = document.querySelector('.encodeCenterChair-container')
        if (!container) return
        
        // Find the position after the user type display
        let insertAfterElement = document.getElementById('userTypeDisplay')
        
        // Remove existing campus field if any
        const existingCampus = document.getElementById('campusSelectContainer')
        if (existingCampus) {
            existingCampus.remove()
            campusFieldContainer = null
        }
        
        // Add campus dropdown if Extension is selected
        if (centerValue === 'Extension') {
            campusFieldContainer = campusSelect()
            campusFieldContainer.id = 'campusSelectContainer'
            
            // Insert campus field after the user type display
            if (insertAfterElement && insertAfterElement.parentNode) {
                if (insertAfterElement.nextSibling) {
                    insertAfterElement.parentNode.insertBefore(campusFieldContainer, insertAfterElement.nextSibling)
                } else {
                    insertAfterElement.parentNode.appendChild(campusFieldContainer)
                }
            } else if (container) {
                container.appendChild(campusFieldContainer)
            }
        }
    }

    const Submit = () => {
        return ($({
            tag: 'button',
            att: {
                className: 'submitAddUser',
                id: 'centerDirectorSubmitBtn',
                disabled: true
            },
            text: 'Submit',
            event: {
                type: 'click',
                method: async (event) => {
                    const submitBtn = document.getElementById('centerDirectorSubmitBtn')
                    
                    if (submitBtn.disabled) {
                        event.preventDefault()
                        return
                    }
                    
                    // Validation
                    if (accountData.center.trim() === '' || accountData.gmail.trim() === '') {
                        ConfirmationModal({
                            title: 'Validation Error',
                            message: 'Please select a center and enter Gmail address!',
                            type: 'error',
                            confirmText: 'OK'
                        })
                        return
                    }
                    
                    // Validate campus for Extension
                    if (accountData.center === 'Extension' && (!accountData.campus || accountData.campus.trim() === '')) {
                        ConfirmationModal({
                            title: 'Validation Error',
                            message: 'Please select a campus for Extension Chair!',
                            type: 'error',
                            confirmText: 'OK'
                        })
                        return
                    }
                    
                    // Validate email format
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
                    
                    // Force reflow and give time for DOM update
                    load.offsetHeight;
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                    submitBtn.disabled = true
                    
                    try {
                        // Determine the final center value to send
                        let centerValue = accountData.center
                        let campusValue = ''
                        
                        if (accountData.center === 'Extension') {
                            campusValue = accountData.campus
                            centerValue = accountData.campus
                        }
                        
                        // Prepare form data
                        const formData = [
                            { name: 'registerAccount', value: 'true' },
                            { name: 'email', value: accountData.gmail },
                            { name: 'accountName', value: accountData.userType },
                            { name: 'center', value: centerValue },
                            { name: 'campus', value: campusValue }
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
                                    window.location.replace('/account/Login')
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
        }))
    }

    // Create the main container
    const container = $({
        tag: 'div',
        att: {
            className: 'encodeCenterChair-container'
        },
        child: [
            label,
            select({ getDataMethod: getData.getCenter }),
            createUserTypeDisplay(),
            input({
                prop: {
                    type: 'email',
                    placeholder: 'example@gmail.com',
                    className: 'inputAddUser',
                    id: 'gmailInput'
                },
                getDataMethod: getData.getGmail
            }),
            Submit()
        ]
    })

    return container
}

const encodeResearchChair = () => {
    const accountData = {
        campus: '',
        gmail: '',
        userType: ''
    }

    // Helper function to generate user type based on campus selection
    const generateUserType = (campusValue) => {
        if (campusValue && campusValue.trim() !== '') {
            return `${campusValue} Research Chair`
        }
        return ''
    }

    const getData = {
        getCampus: (value) => {
            accountData.campus = value
            // Update user type when campus is selected
            accountData.userType = generateUserType(value)
            updateUserTypeDisplay()
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        }
    }

    // Validation function
    const validateForm = () => {
        const submitBtn = document.getElementById('researchChairSubmitBtn')
        if (!submitBtn) return
        
        const isValid = 
            accountData.campus.trim() !== '' &&
            accountData.gmail.trim() !== '' &&
            accountData.userType !== '' // Check if userType is not empty
        
        submitBtn.disabled = !isValid
        if (submitBtn.disabled) {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
        } else {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
        }
    }

    // Function to update user type display
    const updateUserTypeDisplay = () => {
        const userTypeValueSpan = document.getElementById('researchChairUserTypeValue')
        if (userTypeValueSpan) {
            if (accountData.userType && accountData.userType !== '') {
                userTypeValueSpan.textContent = accountData.userType
                userTypeValueSpan.style.color = '#4CAF50' // Green for valid role
                userTypeValueSpan.style.fontWeight = 'bold'
            } else {
                userTypeValueSpan.textContent = '-- Select Campus First --'
                userTypeValueSpan.style.color = '#ff9800' // Orange for waiting
                userTypeValueSpan.style.fontWeight = 'normal'
            }
        }
    }

    const label = $({
        tag: 'div',
        text: 'Research Chair Account Registration',
        att: {
            className: 'form-label'
        }
    })

    // Campus dropdown component
    const campusSelect = () => {
        const campuses = [
            'Roxas City Main',
            'Burias',
            'Mambusao',
            'Dayao',
            'Pilar',
            'Pontevedra',
            'Sigma',
            'Sapian',
            'Tapaz',
            'Dumarao'
        ]

        const selectEl = $({
            tag: 'select',
            event: {
                type: 'change',
                method: (event) => {
                    getData.getCampus(event.target.value)
                }
            },
            att: {
                className: 'selectAddUser',
                id: 'researchChairCampusSelect'
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
                ...campuses.map(campus => 
                    $({
                        tag: 'option',
                        text: campus,
                        att: { value: campus }
                    })
                )
            ]
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container'
            },
            child: [selectEl]
        }))
    }

    // User type display component
    const userTypeDisplay = () => {
        const displayEl = $({
            tag: 'div',
            att: {
                className: 'user-type-display',
                id: 'researchChairUserTypeDisplay'
            },
            child: [
                $({
                    tag: 'span',
                    text: 'Role to be created: ',
                    att: {
                        className: 'user-type-label'
                    }
                }),
                $({
                    tag: 'span',
                    text: '-- Select Campus First --',
                    att: {
                        className: 'user-type-value',
                        id: 'researchChairUserTypeValue'
                    }
                })
            ]
        })
        return displayEl
    }

    // Email input component
    const emailInput = () => {
        const inputEl = $({
            tag: 'input',
            att: {
                type: 'email',
                placeholder: 'Enter Gmail account',
                className: 'inputAddUser',
                id: 'researchChairGmailInput'
            },
            event: {
                type: 'input',
                method: (event) => {
                    getData.getGmail(event.target.value)
                }
            }
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container'
            },
            child: [inputEl]
        }))
    }

    const Submit = () => {
        return ($({
            tag: 'button',
            att: {
                className: 'submitAddUser researchChairSubmit',
                id: 'researchChairSubmitBtn',
                disabled: true
            },
            text: 'Submit',
            event: {
                type: 'click',
                method: async (event) => {
                    const submitBtn = document.getElementById('researchChairSubmitBtn')
                    
                    if (submitBtn.disabled) {
                        event.preventDefault()
                        return
                    }
                    
                    // Validation
                    if (accountData.campus.trim() === '' || accountData.gmail.trim() === '') {
                        ConfirmationModal({
                            title: 'Validation Error',
                            message: 'Please select a campus and enter Gmail address!',
                            type: 'error',
                            confirmText: 'OK'
                        })
                        return
                    }
                    
                    // Validate that user type is valid (not empty)
                    if (!accountData.userType || accountData.userType === '') {
                        ConfirmationModal({
                            title: 'Validation Error',
                            message: 'Please select a campus first!',
                            type: 'error',
                            confirmText: 'OK'
                        })
                        return
                    }
                    
                    // Validate email format
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
                    
                    // Force reflow and give time for DOM update
                    load.offsetHeight;
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                    submitBtn.disabled = true
                    
                    try {
                        // Prepare form data
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
                                    // Reset form after successful submission
                                    accountData.campus = ''
                                    accountData.gmail = ''
                                    accountData.userType = ''
                                    const campusSelectEl = document.getElementById('researchChairCampusSelect')
                                    const gmailInputEl = document.getElementById('researchChairGmailInput')
                                    if (campusSelectEl) campusSelectEl.value = ''
                                    if (gmailInputEl) gmailInputEl.value = ''
                                    updateUserTypeDisplay()
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
        }))
    }

    // Create the main container
    return $({
        tag: 'div',
        att: {
            className: 'encodeCenterChair-container researchChairContainer'
        },
        child: [
            label,
            campusSelect(),
            userTypeDisplay(),
            emailInput(),
            Submit()
        ]
    })
}

const encodeEvaluator = () => {
    const data = {
        eventType: '',
        center: '',
        fullname: '',
        username: '',
        password: '',
        confirmPass: ''
    }
    
    const getData = {
        getEventType: (value) => {
            data.eventType = value
            validateForm()
        },
        getCenter: (value) => {
            data.center = value
            validateForm()
        },
        getFullname: (value) => {
            data.fullname = value
            validateForm()
        },
        getUsername: (value) => {
            data.username = value
            validateForm()
        },
        getPassword: (value) => {
            data.password = value
            validateForm()
        },
        getConfirmPass: (value) => {
            data.confirmPass = value
            validateForm()
        },
    }

    // Validation function
    const validateForm = () => {
        const submitBtn = document.getElementById('submitEvalBtn')
        if (!submitBtn) return
        
        const isValid = 
            data.center.trim() !== '' &&
            data.eventType.trim() !== '' &&
            data.fullname.trim() !== '' &&
            data.username.trim() !== '' &&
            data.password.trim() !== '' &&
            data.confirmPass.trim() !== '' &&
            data.password === data.confirmPass
        
        submitBtn.disabled = !isValid
        
        // Also update styles
        if (isValid) {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
            submitBtn.style.backgroundColor = '#4CAF50'
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc'
        }
    }

    return ($({
        tag: 'div',
        att: {
            className: 'encodeP rightP'
        },
        child: [
            $({
                tag: 'table',
                att: {
                    className: 'addUserTable rightT'
                },
                child: [
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Center'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        tag: 'select',
                                        event: {
                                            type: 'change',
                                            method: async (event) => {
                                                getData.getCenter(event.target.value)
                                            }
                                        },
                                        att: {
                                            className: 'selectAddUser',
                                            id: 'centerSelect'
                                        },
                                        elementHandler: async (el) => {
                                            el.appendChild($({
                                                tag: 'option',
                                                text: '-- Select Center --',
                                                att: {
                                                    disabled: true,
                                                    selected: true,
                                                    value: ''
                                                }
                                            }))
                                            // Load all centers initially
                                            const req = new Request('/evaluatorReg')
                                            req.Post([
                                                { name: 'getCenters', value: 'true' }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                if (data && data.length > 0) {
                                                    data.forEach(center => {
                                                        el.appendChild($({
                                                            tag: 'option',
                                                            text: center.name || center.code,
                                                            att: {
                                                                value: center.id
                                                            }
                                                        }))
                                                    })
                                                }
                                            }).catch(err => {
                                                console.error('Error loading centers:', err)
                                            })
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Event Type'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        tag: 'select',
                                        event: {
                                            type: 'change',
                                            method: (event) => {
                                                getData.getEventType(event.target.options[event.target.selectedIndex].id)
                                            }
                                        },
                                        att: {
                                            className: 'selectAddUser'
                                        },
                                        elementHandler: async (el) => {
                                            el.appendChild($({
                                                tag: 'option',
                                                text: '-- Select Event type --',
                                                att: {
                                                    disabled: true,
                                                    selected: true
                                                }
                                            }))
                                            const req = new Request('/eventRequest')
                                            req.Post([
                                                { name: 'getEvent', value: '0' }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                data.forEach(val => {
                                                    el.appendChild($({
                                                        tag: 'option',
                                                        text: val.name,
                                                        att: {
                                                            id: val.id
                                                        }
                                                    }))
                                                })
                                            })
                                        },
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: '\n'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Evaluators name'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        event: {
                                            type: 'input',
                                            method: (event) => {
                                                getData.getFullname(event.target.value)
                                            }
                                        },
                                        tag: 'input',
                                        att: {
                                            type: 'text', // Changed from 'email' to 'text'
                                            placeholder: 'Evaluators full name',
                                            className: 'inputAddUser'
                                        },
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: '\n'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Create Username'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        event: {
                                            type: 'input',
                                            method: (event) => {
                                                getData.getUsername(event.target.value)
                                            }
                                        },
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            placeholder: 'Username',
                                            className: 'inputAddUser'
                                        },
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: '\n'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Create Password'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        event: {
                                            type: 'input',
                                            method: (event) => {
                                                getData.getPassword(event.target.value)
                                            }
                                        },
                                        elementHandler: SpecialChar,
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            placeholder: 'Enter password',
                                            className: 'inputAddUser',
                                            maxLength: '20'
                                        },
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: '\n'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'labelAdmin ev'
                                },
                                text: 'Re-type Password'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        event: {
                                            type: 'input',
                                            method: (event) => {
                                                getData.getConfirmPass(event.target.value)
                                            }
                                        },
                                        elementHandler: (userInput) => {
                                            userInput.addEventListener('keypress', (event) => {
                                                if (!((event.keyCode >= 65) && (event.keyCode <= 90) || (event.keyCode >= 97) && (event.keyCode <= 122) || (event.keyCode >= 48) && (event.keyCode <= 57))) {
                                                    ConfirmationModal({
                                                        title: 'Invalid Character',
                                                        message: 'Special character is not allowed!',
                                                        type: 'error',
                                                        confirmText: 'OK'
                                                    })
                                                    event.returnValue = false
                                                }
                                            })
                                        },
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            placeholder: 'Re-type password',
                                            className: 'inputAddUser',
                                            maxLength: '20'
                                        },
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: '\n'
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        tag: 'button',
                                        att: {
                                            className: 'submitEval',
                                            id: 'submitEvalBtn',
                                            disabled: true
                                        },
                                        text: 'Submit',
                                        event: {
                                            type: 'click',
                                            method: async (event) => {
                                                const submitBtn = document.getElementById('submitEvalBtn')
                                                
                                                if (submitBtn.disabled) {
                                                    event.preventDefault()
                                                    return
                                                }
                                                
                                                if (data.password !== data.confirmPass) {
                                                    ConfirmationModal({
                                                        title: 'Validation Error',
                                                        message: 'Passwords do not match!',
                                                        type: 'error',
                                                        confirmText: 'OK'
                                                    })
                                                    return
                                                }
                                                
                                                const load = Waiting()
                                                document.body.appendChild(load)
                                                load.offsetHeight;
                                                await new Promise(resolve => setTimeout(resolve, 50));
                                                const form = new FormData();
                                                form.append('evaluatorRegister', 'true')
                                                form.append('username', data.username.toUpperCase())
                                                form.append('password', data.password)
                                                form.append('fullname', data.fullname.toUpperCase())
                                                form.append('category', '') // Send empty string or default value
                                                form.append('center', data.center)
                                                form.append('eventTYpe', data.eventType)
                                                
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
                                                                message: dat.message || 'Evaluator account successfully registered!',
                                                                type: 'success',
                                                                confirmText: 'OK',
                                                                onConfirm: () => {
                                                                    window.location.reload()
                                                                }
                                                            })
                                                        } else {
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
                                                        ConfirmationModal({
                                                            title: 'Error',
                                                            message: 'Server error occurred',
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
                                    })
                                ]
                            })
                        ]
                    }),
                ]
            })
        ]
    }))
}

const rdeUser = () => {
    const data = {
        email: '',
        userName: '',
        password: ''
    }

    const getData = {
        getEmail: (value) => {
            data.email = value
            validateForm()
        },
        getUserName: (value) => {
            data.userName = value
            validateForm()
        },
        getPassword: (value) => {
            data.password = value
            validateForm()
        }
    }

    // Validation function
    const validateForm = () => {
        const submitBtn = document.getElementById('rdeSubmitBtn')
        if (!submitBtn) return
        
        const isValid = 
            data.email.trim() !== '' &&
            data.userName.trim() !== '' &&
            data.password.trim() !== ''
        
        submitBtn.disabled = !isValid
        if (submitBtn.disabled) {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
        } else {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
        }
    }

    const label = $({
        tag: 'div',
        text: 'RDE Staff Account Registration',
        att: {
            className: 'form-label'
        }
    })

    const getInput = (inputUser) => {
        inputUser.addEventListener('keypress', (event) => {
            if (event.keyCode === 32) {
                ConfirmationModal({
                    title: 'Invalid Character',
                    message: 'Space is not allowed!',
                    type: 'error',
                    confirmText: 'OK'
                })
                return event.returnValue = false
            }
        })
    }

    const input = ({ getDataMethod, prop, filter }) => {
        const inputEl = $({
            tag: 'input',
            att: prop,
            elementHandler: (el) => {
                if (filter) {
                    getInput(el)
                }
            },
            event: {
                type: 'input',
                method: (event) => {
                    if (getDataMethod) {
                        getDataMethod(event.target.value)
                    }
                }
            }
        })
        
        return ($({
            tag: 'div',
            att: {
                className: 'input-container'
            },
            child: [inputEl]
        }))
    }
    
    const Submit = () => {
        return ($({
            tag: 'button',
            att: {
                className: 'subStaff',
                id: 'rdeSubmitBtn',
                disabled: true
            },
            text: 'Submit',
            event: {
                type: 'click',
                method: async (event) => {
                    const submitBtn = document.getElementById('rdeSubmitBtn')
                    
                    if (submitBtn.disabled) {
                        event.preventDefault()
                        return
                    }
                    
                    if (!data.email.trim() || !data.userName.trim() || !data.password.trim()) {
                        ConfirmationModal({
                            title: 'Validation Error',
                            message: 'All fields are required!',
                            type: 'error',
                            confirmText: 'OK'
                        })
                        return
                    }
                    
                    const load = Waiting()
                    document.body.appendChild(load)
                    
                    // Force reflow and give time for DOM update
                    load.offsetHeight;
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                    const form = new FormData()
                    form.append('submitStaff', 'true')
                    form.append('staffEmail', data.email)
                    form.append('staffUserName', data.userName)
                    form.append('staffPassword', data.password)
                    
                    submitBtn.disabled = true
                    
                    try {
                        const res = await fetch('/rdeStaff', {
                            method: 'POST',
                            body: form,
                        })
                        const responseData = await res.json()
                        load.remove()
                        
                        if (responseData.status) {
                            ConfirmationModal({
                                title: 'Success',
                                message: 'RDE Staff account successfully registered!',
                                type: 'success',
                                confirmText: 'OK',
                                onConfirm: () => {
                                    window.location.reload()
                                }
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
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'rdeUser-container'
        },
        child: [
            label,
            input({
                prop: {
                    placeholder: 'Juan Dela Cruz',
                    className: 'inputRDE',
                    type: 'text'
                },
                getDataMethod: getData.getEmail,
            }),
            input({
                prop: {
                    placeholder: 'Enter User Name',
                    className: 'inputRDE',
                    type: 'text',
                },
                getDataMethod: getData.getUserName,
                filter: true
            }),
            input({
                prop: {
                    placeholder: 'Enter Password',
                    className: 'inputRDE',
                    maxLength: '20',
                    minLength: '8',
                    type: 'password',
                },
                getDataMethod: getData.getPassword,
                filter: true
            }),
            Submit()
        ]
    }))
}

// Initialize validation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure elements are rendered
    setTimeout(() => {
        const submitBtn = document.getElementById('submitEvalBtn')
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
        }
    }, 100)

    // Small delay to ensure elements are rendered
    setTimeout(() => {
        const submitBtn = document.getElementById('rdeSubmitBtn')
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc'
        }
    }, 100)

    // Small delay to ensure elements are rendered
    setTimeout(() => {
        const submitBtn = document.getElementById('centerChairSubmitBtn')
        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc'
        }
        
        // Add input event listener to gmail field for realtime email validation
        const gmailInput = document.getElementById('gmailInput')
        if (gmailInput) {
            gmailInput.addEventListener('blur', (event) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (event.target.value && !emailRegex.test(event.target.value)) {
                    event.target.style.border = '2px solid red'
                } else {
                    event.target.style.border = ''
                }
            })
            
            gmailInput.addEventListener('input', () => {
                gmailInput.style.border = ''
            })
        }

        // Research Chair form validation
        const researchChairSubmitBtn = document.getElementById('researchChairSubmitBtn')
        if (researchChairSubmitBtn) {
            researchChairSubmitBtn.disabled = true
            researchChairSubmitBtn.style.opacity = '0.5'
            researchChairSubmitBtn.style.cursor = 'not-allowed'
        }
        
        const researchChairGmailInput = document.getElementById('researchChairGmailInput')
        if (researchChairGmailInput) {
            researchChairGmailInput.addEventListener('blur', (event) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (event.target.value && !emailRegex.test(event.target.value)) {
                    event.target.style.border = '2px solid red'
                } else {
                    event.target.style.border = ''
                }
            })
            
            researchChairGmailInput.addEventListener('input', () => {
                researchChairGmailInput.style.border = ''
            })
        }
    }, 100)
})

export const AddUser=()=>{
    document.head.append($({
        tag:'link',
        att:{
            rel:'stylesheet',
            href:'/client/component/adminComponent/componentStyle/adduser.css'
        }
    }))
    return($({
        tag:'div',
        att:{
            className:'mainFrame addUserPanel'
        },
        child:[
            $({
                tag:'div',
                att:{
                    className: 'addCapUserPan'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'adminLabel'
                        },
                        text:'Register New Accounts'
                    }),
                    encodeCenterChair(),
                    encodeResearchChair(),
                    rdeUser()
                ]
            }),
            $({
                tag:'div',
                att:{
                    className: 'addEvalPan'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'evalAdminLabel'
                        },
                        text:'Register Evaluators Account',
                        event:{
                            type:'click',
                            method:()=>{
                                const req= new Request('/generateZip')
                                req.Post([
                                    {
                                        name:'backupAll',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                })
                            }
                        }
                    }),
                    encodeEvaluator()
                ]
            })
        ]
    }))
}
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

    const centerOptions = [
        { label: 'Crop Science Research & Development Center (CSRDC)', value: 'CSRDC' },
        { label: 'Livestock Research & Development Center (LRDC)', value: 'LRDC' },
        { label: 'Fisheries Research & Development Center (FRDC)', value: 'FRDC' },
        { label: 'Food and Industrial Technology Research & Development Center (FITRDC)', value: 'FITRDC' },
        { label: 'Social Science Research & Development Center (SSRDC)', value: 'SSRDC' },
        { label: 'Machinery and Agricultural Technology Engineering Center (MATEC)', value: 'MATEC' },
        { label: 'Coconut Research and Development Center (Coco RDC)', value: 'Coco RDC' },
        { label: 'Extension', value: 'Extension' }
    ]

    const campusOptions = [
        'Roxas City Main', 'Burias', 'Mambusao', 'Dayao', 'Pilar',
        'Pontevedra', 'Sigma', 'Sapian', 'Tapaz', 'Dumarao'
    ].map(c => ({ label: c, value: c }))

    let campusSelectContainer = null

    const validateForm = () => {
        const submitBtn = document.getElementById('centerChairSubmitBtn')
        if (!submitBtn) return

        let isValid = accountData.center.trim() !== '' && accountData.gmail.trim() !== ''
        if (accountData.center === 'Extension') {
            isValid = isValid && accountData.campus && accountData.campus.trim() !== ''
        }
        if (accountData.center === 'Extension' && (!accountData.campus || accountData.campus.trim() === '')) {
            isValid = false
        }

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.backgroundColor = isValid ? '#1976d2' : '#cccccc'
    }

    const updateCampusField = (centerValue) => {
        const container = document.getElementById('centerChairForm')
        const displayEl = document.getElementById('centerChairUserTypeDisplay')

        if (campusSelectContainer) {
            campusSelectContainer.remove()
            campusSelectContainer = null
        }

        if (centerValue === 'Extension') {
            campusSelectContainer = $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Select Campus', att: { className: 'form-label-modern' } }),
                    createSelect({
                        options: campusOptions,
                        placeholder: '-- Select Campus --',
                        getDataMethod: (value) => {
                            accountData.campus = value
                            if (accountData.center === 'Extension') {
                                accountData.userType = generateUserType(accountData.center, value)
                                updateUserTypeDisplay('centerChairUserTypeDisplay', accountData.userType)
                            }
                            validateForm()
                        },
                        id: 'centerChairCampusSelect'
                    })
                ]
            })
            if (displayEl && displayEl.parentNode) {
                displayEl.parentNode.insertBefore(campusSelectContainer, displayEl.nextSibling)
            }
        }
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

    // Create form container
    const formContainer = $({
        tag: 'div',
        att: { className: 'form-container', id: 'centerChairForm' },
        child: [
            $({ tag: 'h3', text: 'Center Chair Registration', att: { className: 'form-title' } }),

            // Center Selection
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Select Center', att: { className: 'form-label-modern' } }),
                    createSelect({
                        options: centerOptions,
                        placeholder: '-- Select Center --',
                        getDataMethod: getData.getCenter,
                        id: 'centerChairCenterSelect'
                    })
                ]
            }),

            // User Type Display
            createUserTypeDisplay('centerChairUserTypeDisplay'),

            // Email Input
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Gmail Address', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'example@gmail.com',
                        type: 'email',
                        getDataMethod: getData.getGmail,
                        id: 'centerChairGmailInput'
                    })
                ]
            }),

            // Submit Button
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit',
                    id: 'centerChairSubmitBtn',
                    disabled: true
                },
                text: 'Register Account',
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

    const validateForm = () => {
        const submitBtn = document.getElementById('researchChairSubmitBtn')
        if (!submitBtn) return

        const isValid = accountData.campus.trim() !== '' &&
            accountData.gmail.trim() !== '' &&
            accountData.userType !== ''

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.backgroundColor = isValid ? '#1976d2' : '#cccccc'
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

    return $({
        tag: 'div',
        att: { className: 'form-container' },
        child: [
            $({ tag: 'h3', text: 'Research Chair Registration', att: { className: 'form-title' } }),

            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Select Campus', att: { className: 'form-label-modern' } }),
                    createSelect({
                        options: campusOptions,
                        placeholder: '-- Select Campus --',
                        getDataMethod: getData.getCampus,
                        id: 'researchChairCampusSelect'
                    })
                ]
            }),

            createUserTypeDisplay('researchChairUserTypeDisplay'),

            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Gmail Address', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'example@gmail.com',
                        type: 'email',
                        getDataMethod: getData.getGmail,
                        id: 'researchChairGmailInput'
                    })
                ]
            }),

            $({
                tag: 'button',
                att: {
                    className: 'btn-submit',
                    id: 'researchChairSubmitBtn',
                    disabled: true
                },
                text: 'Register Account',
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
            })
        ]
    })
}

// RDE Staff Registration
const rdeUser = () => {
    const data = { email: '', userName: '', password: '' }

    const validateForm = () => {
        const submitBtn = document.getElementById('rdeSubmitBtn')
        if (!submitBtn) return

        const isValid = data.email.trim() !== '' &&
            data.userName.trim() !== '' &&
            data.password.trim() !== ''

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.backgroundColor = isValid ? '#1976d2' : '#cccccc'
    }

    const getData = {
        getEmail: (value) => { data.email = value; validateForm() },
        getUserName: (value) => { data.userName = value; validateForm() },
        getPassword: (value) => { data.password = value; validateForm() }
    }

    return $({
        tag: 'div',
        att: { className: 'form-container' },
        child: [
            $({ tag: 'h3', text: 'RDE Staff Registration', att: { className: 'form-title' } }),

            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Full Name', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'Juan Dela Cruz',
                        type: 'text',
                        getDataMethod: getData.getEmail,
                        id: 'rdeNameInput'
                    })
                ]
            }),

            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Username', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'Enter Username',
                        type: 'text',
                        getDataMethod: getData.getUserName,
                        filter: true,
                        id: 'rdeUsernameInput'
                    })
                ]
            }),

            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Password', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'Enter Password (min 8 chars)',
                        type: 'password',
                        getDataMethod: getData.getPassword,
                        filter: true,
                        id: 'rdePasswordInput'
                    })
                ]
            }),

            $({
                tag: 'button',
                att: {
                    className: 'btn-submit',
                    id: 'rdeSubmitBtn',
                    disabled: true
                },
                text: 'Register Staff',
                event: {
                    type: 'click',
                    method: async () => {
                        const submitBtn = document.getElementById('rdeSubmitBtn')
                        if (submitBtn.disabled) return

                        if (!data.email || !data.userName || !data.password) {
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
            })
        ]
    })
}

// Evaluator Registration - Fixed with proper category ID handling
const encodeEvaluator = () => {
    const data = {
        eventType: '',
        center: '',
        fullname: '',
        username: '',
        password: '',
        confirmPass: '',
        registrationType: 'center',
        categories: [] // Will store category IDs
    }

    // Category mapping - name to ID
    const categoryMap = {
        "Social Science": 1,
        "Natural / Biological": 2,
        "Food": 3,
        "Development": 4,
        "Extension": 5
    }

    // Category list for display
    const categories = [
        "Social Science", "Natural / Biological", "Food", "Development", "Extension"
    ]

    // Helper function to update the selected categories display
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
            isValid = data.center.trim() !== '' && data.eventType.trim() !== '' &&
                data.fullname.trim() !== '' && data.username.trim() !== '' &&
                data.password.trim() !== '' && data.confirmPass.trim() !== '' &&
                data.password === data.confirmPass
        } else {
            isValid = data.categories.length > 0 && data.eventType.trim() !== '' &&
                data.fullname.trim() !== '' && data.username.trim() !== '' &&
                data.password.trim() !== '' && data.confirmPass.trim() !== '' &&
                data.password === data.confirmPass
        }

        submitBtn.disabled = !isValid
        submitBtn.style.opacity = isValid ? '1' : '0.5'
        submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed'
        submitBtn.style.backgroundColor = isValid ? '#1976d2' : '#cccccc'
    }

    const getData = {
        getEventType: (value) => { data.eventType = value; validateForm() },
        getCenter: (value) => { data.center = value; validateForm() },
        getFullname: (value) => { data.fullname = value; validateForm() },
        getUsername: (value) => { data.username = value; validateForm() },
        getPassword: (value) => { data.password = value; validateForm() },
        getConfirmPass: (value) => { data.confirmPass = value; validateForm() },
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
            // Store category IDs, not names
            data.categories = Array.from(checkedBoxes).map(cb => {
                const categoryName = cb.value
                return categoryMap[categoryName] // Convert name to ID
            }).filter(id => id !== undefined) // Remove any undefined values

            // Get the category names for display
            const categoryNames = Array.from(checkedBoxes).map(cb => cb.value)
            updateSelectedCategoriesDisplay(categoryNames)

            console.log('Selected Category IDs:', data.categories) // Debug log
            validateForm()
        }
    }

    // Create category checkboxes with proper event handling
    const createCategoryRadios = () => {
        return categories.map(category =>
            $({
                tag: 'label',
                att: { className: 'category-radio-label' },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'checkbox',
                            name: 'evalCategory',
                            value: category, // Store name as value for display
                            className: 'category-radio-input'
                        },
                        event: {
                            type: 'change',
                            method: (event) => {
                                // Get all checked checkboxes
                                const checkedBoxes = document.querySelectorAll('input[name="evalCategory"]:checked')
                                // Store category IDs
                                data.categories = Array.from(checkedBoxes).map(cb => {
                                    const categoryName = cb.value
                                    return categoryMap[categoryName]
                                }).filter(id => id !== undefined)

                                // Get category names for display
                                const categoryNames = Array.from(checkedBoxes).map(cb => cb.value)
                                updateSelectedCategoriesDisplay(categoryNames)

                                console.log('Selected Category IDs:', data.categories)
                                validateForm()
                            }
                        }
                    }),
                    $({ tag: 'span', text: category, att: { className: 'category-radio-text' } })
                ]
            })
        )
    }

    // Helper function to create input fields
    const createInput = ({ placeholder, type, getDataMethod, id }) => {
        return $({
            tag: 'input',
            att: {
                type: type,
                placeholder: placeholder,
                className: 'modern-input',
                id: id
            },
            event: {
                type: 'input',
                method: (event) => getDataMethod(event.target.value)
            }
        })
    }

    return $({
        tag: 'div',
        att: { className: 'form-container evaluator-form' },
        child: [
            $({ tag: 'h3', text: 'Evaluator Registration', att: { className: 'form-title' } }),

            // Registration Type
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Registration Type', att: { className: 'form-label-modern' } }),
                    $({
                        tag: 'div',
                        att: { className: 'radio-group' },
                        child: [
                            $({
                                tag: 'label',
                                att: { className: 'radio-label' },
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
                                    $({ tag: 'span', text: 'Center-based Evaluator' })
                                ]
                            }),
                            $({
                                tag: 'label',
                                att: { className: 'radio-label' },
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
                                    $({ tag: 'span', text: 'Category-based Evaluator' })
                                ]
                            })
                        ]
                    })
                ]
            }),

            // Event Type
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Event Type', att: { className: 'form-label-modern' } }),
                    $({
                        tag: 'select',
                        att: { className: 'modern-select', id: 'evalEventSelect' },
                        event: {
                            type: 'change',
                            method: (event) => {
                                const selected = event.target.options[event.target.selectedIndex]
                                getData.getEventType(selected.id || selected.value)
                            }
                        },
                        elementHandler: async (el) => {
                            el.appendChild($({
                                tag: 'option',
                                text: '-- Select Event --',
                                att: { disabled: true, selected: true, value: '' }
                            }))
                            try {
                                const req = new Request('/eventRequest')
                                req.Post([{ name: 'getEvent', value: '0' }])
                                req.Json()
                                const data = await req.Send()
                                data.forEach(val => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: val.name,
                                        att: { id: val.id, value: val.id }
                                    }))
                                })
                            } catch (error) {
                                console.error('Error loading events:', error)
                            }
                        }
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
                    $({ tag: 'label', text: 'Select Center', att: { className: 'form-label-modern' } }),
                    $({
                        tag: 'select',
                        att: {
                            className: 'modern-select',
                            id: 'evalCenterSelect',
                            disabled: false
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
            }),

            // Category Selection Group (hidden by default) - Modern Radio Buttons
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
                        att: { className: 'category-grid' },
                        child: createCategoryRadios()
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'selected-categories-display',
                            id: 'selectedCategoriesDisplay'
                        },
                        child: [
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
                    $({ tag: 'label', text: 'Evaluator Full Name', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'Enter full name',
                        type: 'text',
                        getDataMethod: getData.getFullname,
                        id: 'evalNameInput'
                    })
                ]
            }),

            // Username
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Username', att: { className: 'form-label-modern' } }),
                    createInput({
                        placeholder: 'Create username',
                        type: 'text',
                        getDataMethod: getData.getUsername,
                        id: 'evalUsernameInput'
                    })
                ]
            }),

            // Password
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Password', att: { className: 'form-label-modern' } }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'password',
                            placeholder: 'Enter password (max 20 chars)',
                            className: 'modern-input',
                            id: 'evalPasswordInput',
                            maxLength: '20'
                        },
                        event: {
                            type: 'input',
                            method: (event) => getData.getPassword(event.target.value)
                        },
                        elementHandler: SpecialChar
                    })
                ]
            }),

            // Confirm Password
            $({
                tag: 'div',
                att: { className: 'form-group' },
                child: [
                    $({ tag: 'label', text: 'Confirm Password', att: { className: 'form-label-modern' } }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'password',
                            placeholder: 'Re-type password',
                            className: 'modern-input',
                            id: 'evalConfirmInput',
                            maxLength: '20'
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
            }),

            // Submit
            $({
                tag: 'button',
                att: {
                    className: 'btn-submit',
                    id: 'submitEvalBtn',
                    disabled: true
                },
                text: 'Register Evaluator',
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

                        // Log what we're sending
                        console.log('Submitting registration:', {
                            registrationType: data.registrationType,
                            categories: data.categories, // This should now be IDs like [3, 4]
                            eventType: data.eventType,
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
                        form.append('eventTYpe', data.eventType) // Note: This should match your backend
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
import {$, ConfirmationAlert, Request, SpecialChar, Waiting} from '../../../lib/lib.js'

const encodeUser = () => {
    const accountData = {
        center: '',
        gmail: '',
        userType: 'Center Director', // Default user type
        campus: ''
    }

    const getData = {
        getCenter: (value) => {
            accountData.center = value
            
            // Set userType based on center selection
            if (value === 'Extension') {
                accountData.userType = 'Extension Campus Chair'
            } else {
                accountData.userType = 'Center Director'
                // Clear campus when switching from Extension to other centers
                accountData.campus = ''
            }
            
            updateCampusField(value) // Show/hide campus field based on selection
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        },
        getCampus: (value) => {
            accountData.campus = value
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
        
        submitBtn.disabled = !isValid
    }

    const label = $({
        tag: 'div',
        text: 'Center Director / Extension Campus Chair Account Registration',
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
                    text: '-- Select Center--',
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

    // Campus input component (only shown for Extension)
    const campusInput = () => {
        return input({
            prop: {
                type: 'text',
                placeholder: 'Enter Campus Name (e.g., Burias, Pontevedra, Roxas City Main, etc.)',
                className: 'inputAddUser',
                id: 'campusInput'
            },
            getDataMethod: getData.getCampus,
            filter: true
        })
    }

    // Store reference to campus field container
    let campusFieldContainer = null

    // Function to create campus field
    const createCampusField = () => {
        return campusInput()
    }

    // Function to update campus field visibility
    const updateCampusField = (centerValue) => {
        const container = document.querySelector('.encodeUser-container')
        if (!container) return
        
        // Find the position after the select element
        const selectContainer = container.querySelector('.input-container')
        
        // Remove existing campus field if any
        const existingCampus = document.getElementById('campusFieldContainer')
        if (existingCampus) {
            existingCampus.remove()
            campusFieldContainer = null
        }
        
        // Add campus field if Extension is selected (right after the select)
        if (centerValue === 'Extension') {
            campusFieldContainer = createCampusField()
            campusFieldContainer.id = 'campusFieldContainer'
            
            // Insert campus field after the select container
            if (selectContainer && selectContainer.nextSibling) {
                selectContainer.parentNode.insertBefore(campusFieldContainer, selectContainer.nextSibling)
            } else if (selectContainer) {
                selectContainer.parentNode.appendChild(campusFieldContainer)
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
                        alert("Please select a center/campus and enter Gmail address!")
                        return
                    }
                    
                    // Validate campus for Extension
                    if (accountData.center === 'Extension' && (!accountData.campus || accountData.campus.trim() === '')) {
                        alert("Please enter campus name for Extension Campus Chair!")
                        return
                    }
                    
                    // Validate email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(accountData.gmail)) {
                        alert("Please enter a valid email address!")
                        return
                    }
                    
                    const load = Waiting()
                    document.body.appendChild(load)
                    
                    submitBtn.disabled = true
                    
                    try {
                        // Prepare form data
                        const formData = [
                            { name: 'registerAccount', value: 'true' },
                            { name: 'email', value: accountData.gmail },
                            { name: 'accountName', value: accountData.userType },
                            { name: 'center', value: accountData.center }
                        ]
                        
                        // Add campus to form data if Extension
                        if (accountData.center === 'Extension' && accountData.campus) {
                            formData.push({ name: 'campus', value: accountData.campus })
                        } else {
                            // For non-Extension centers, set campus to empty string or null
                            formData.push({ name: 'campus', value: '' })
                        }
                        
                        const req = new Request('/addcapaccount')
                        req.Post(formData)
                        req.Json()
                        
                        const data = await req.Send()
                        load.remove()
                        
                        if (data.status) {
                            setTimeout(() => {
                                alert(data.message)
                                window.location.replace('/account/Login')
                            }, 100)
                        } else {
                            alert(data.message)
                            submitBtn.disabled = false
                            validateForm()
                        }
                    } catch (error) {
                        load.remove()
                        console.error('Error:', error)
                        alert('An error occurred during submission')
                        submitBtn.disabled = false
                        validateForm()
                    }
                }
            }
        }))
    }

    // Create the main container
    const container = $({
        tag: 'div',
        att: {
            className: 'encodeUser-container'
        },
        child: [
            label,
            select({ getDataMethod: getData.getCenter }),
            input({
                prop: {
                    type: 'email',
                    placeholder: 'Enter Gmail account',
                    className: 'inputAddUser',
                    id: 'gmailInput'
                },
                getDataMethod: getData.getGmail
            }),
            Submit()
        ]
    })

    // Store reference to the container for later use
    setTimeout(() => {
        // If Extension was previously selected (e.g., on page load), show campus field
        if (accountData.center === 'Extension') {
            updateCampusField('Extension')
        }
    }, 100)

    return container
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
                                                    alert("Special character is not allowed..!")
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
                                                    alert("Password not match..!")
                                                    return
                                                }
                                                
                                                const form = new FormData();
                                                form.append('evaluatorRegister', 'true')
                                                form.append('username', data.username.toUpperCase())
                                                form.append('password', data.password)
                                                form.append('fullname', data.fullname.toUpperCase())
                                                form.append('category', '') // Send empty string or default value
                                                form.append('center', data.center)
                                                form.append('eventTYpe', data.eventType)
                                                
                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                const remove = () => {
                                                    loading.remove()
                                                }
                                                
                                                try {
                                                    const res = await fetch('/evaluatorReg', {
                                                        method: 'POST',
                                                        body: form
                                                    })
                                                    
                                                    if (res.ok) {
                                                        remove()
                                                        const dat = await res.json()
                                                        if (dat.status) {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                window.location.reload()
                                                            }))
                                                        } else {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                window.location.reload()
                                                            }))
                                                        }
                                                    }
                                                } catch (error) {
                                                    remove()
                                                    console.error('Error:', error)
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
                alert("Invalid Character")
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
                        alert('All fields are required!')
                        return
                    }
                    
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
                        
                        if (responseData.status) {
                            window.location.reload()
                        } else {
                            alert(responseData.message)
                            submitBtn.disabled = false
                            validateForm()
                        }
                    } catch (error) {
                        console.error('Error:', error)
                        alert('An error occurred during submission')
                        submitBtn.disabled = false
                        validateForm()
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
                    placeholder: 'Full name',
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
                        text:'Register new Account'
                    }),
                    encodeUser(),
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
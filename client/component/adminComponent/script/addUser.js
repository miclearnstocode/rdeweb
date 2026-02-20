import {$, ConfirmationAlert, Request, SpecialChar, Waiting} from '../../../lib/lib.js'

const encodeUser = () => {
    const accountData = {
        center: '',
        gmail: '',
        userType: 'Center Director'
    }

    const getData = {
        getCenter: (value) => {
            accountData.center = value
            validateForm()
        },
        getGmail: (value) => {
            accountData.gmail = value
            validateForm()
        }
    }

    // Validation function
    const validateForm = () => {
        const submitBtn = document.getElementById('centerDirectorSubmitBtn')
        if (!submitBtn) return
        
        const isValid = 
            accountData.center.trim() !== '' &&
            accountData.gmail.trim() !== ''
        
        submitBtn.disabled = !isValid
    }

    const label = $({
        tag: 'div',
        text: 'Center Director Account Registration',
        att: {
            className: 'form-label' // Add class instead of inline style
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
                className: 'selectAddUser', // Use class only
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
                    text: 'Food and Industrial Technology Research & Development Center (FIRDC)',
                    att: { value: 'FIRDC' }
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
                className: 'input-container' // Add class
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
                    
                    if (accountData.center.trim() === '' || accountData.gmail.trim() === '') {
                        alert("Please select a center and enter Gmail address!")
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
                        const req = new Request('/addcapaccount')
                        req.Post([
                            { name: 'registerAccount', value: 'true' },
                            { name: 'email', value: accountData.gmail },
                            { name: 'accountName', value: accountData.userType },
                            { name: 'center', value: accountData.center }
                        ])
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

    return ($({
        tag: 'div',
        att: {
            className: 'encodeUser-container' // Add class
        },
        child: [
            label,
            select({ getDataMethod: getData.getCenter }),
            input({
                prop: {
                    type: 'email',
                    placeholder: 'Enter Center Director Gmail account',
                    className: 'inputAddUser',
                    id: 'gmailInput'
                },
                getDataMethod: getData.getGmail
            }),
            Submit()
        ]
    }))
}

const encodeEvaluator = () => {
    const data = {
        eventType: '',
        category: '',
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
        getCategory: (value) => {
            data.category = value
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
            data.category.trim() !== '' &&
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
            submitBtn.style.backgroundColor = '#4CAF50' // Optional: add a color
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc' // Optional: gray out
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
                    }), //label
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
                                                // Load categories for selected center
                                                const center = event.target.value
                                                const categorySelect = document.getElementById('categorySelect')
                                                if (categorySelect && center) {
                                                    // Clear existing options except the first one
                                                    while (categorySelect.children.length > 1) {
                                                        categorySelect.removeChild(categorySelect.lastChild)
                                                    }
                                                    // Fetch categories for this center
                                                    const req = new Request('/evaluatorReg')
                                                    req.Post([
                                                        { name: 'getCategoriesByCenter', value: 'true' },
                                                        { name: 'center', value: center }
                                                    ])
                                                    req.Json()
                                                    req.Send().then(data => {
                                                        if (data && data.length > 0) {
                                                            data.forEach(category => {
                                                                categorySelect.appendChild($({
                                                                    tag: 'option',
                                                                    text: category.name || category.id,
                                                                    att: {
                                                                        value: category.name || category.id
                                                                    }
                                                                }))
                                                            })
                                                        }
                                                    }).catch(err => {
                                                        console.error('Error loading categories:', err)
                                                    })
                                                } else if (categorySelect) {
                                                    // Clear categories if no center selected
                                                    while (categorySelect.children.length > 1) {
                                                        categorySelect.removeChild(categorySelect.lastChild)
                                                    }
                                                    categorySelect.value = ''
                                                }
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
                                text: 'Category'
                            })
                        ]
                    }), //label
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
                                                getData.getCategory(event.target.value)
                                            }
                                        },
                                        att: {
                                            className: 'selectAddUser',
                                            id: 'categorySelect'
                                        },
                                        elementHandler: (el) => {
                                            el.appendChild($({
                                                tag: 'option',
                                                text: '-- Select Category --',
                                                att: {
                                                    disabled: true,
                                                    selected: true,
                                                    value: ''
                                                }
                                            }))
                                        },
                                        child: []
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
                    }), //label
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
                    }), //break
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
                    }), //label
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
                                            type: 'email',
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
                    }), //break
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
                    }), //label
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
                    }), //break
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
                    }), //label
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
                    }), //break
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
                    }), //label
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
                    }), //break
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                child: [
                                    $({
                                        tag: 'button', // Changed from td to button
                                        att: {
                                            className: 'submitEval',
                                            id: 'submitEvalBtn',
                                            disabled: true // Initially disabled
                                        },
                                        text: 'Submit',
                                        event: {
                                            type: 'click',
                                            method: async (event) => {
                                                const submitBtn = document.getElementById('submitEvalBtn')
                                                
                                                // Double-check if button is disabled
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
                                                form.append('category', data.category.toUpperCase())
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
                    }), //submission
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
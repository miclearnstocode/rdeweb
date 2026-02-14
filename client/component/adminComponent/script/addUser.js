import {$, ConfirmationAlert, Request, SpecialChar, Waiting} from '../../../lib/lib.js'

const encodeUser = () => {
    const accountData = {
        center: '',
        gmail: '',
        userType: 'Center Director' // Changed to match the display text
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
        
        // Update styles based on validation state
        if (isValid) {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
            submitBtn.style.backgroundColor = '#4CAF50'
            submitBtn.style.pointerEvents = 'auto'
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc'
            submitBtn.style.pointerEvents = 'auto'
        }
    }

    const label = $({
        tag: 'div',
        text: 'Center Director Account Registration',
        style: {
            fontFamily: 'Quattrocento sans, sans-serif',
            color: 'rgb(211, 211, 211)',
            fontSize: '1.2vw',
            margin: '.5vw auto auto',
            width: 'fill-content',
            padding: '5px'
        },
    })

    // Custom select component (since rdeUser doesn't have a select, we create one)
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
            style: {
                width: '100%',
                height: '50px',
                maxWidth: '500px',
                minWidth: '250px',
                padding: '12px 16px', // Match input padding
                fontSize: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'Quattrocento sans, sans-serif',
                color: '#fffbfb',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                outline: 'none',
                backgroundColor: '#3a3a3a', // Dark background for select
                transition: 'border-color 0.3s ease',
            },
            elementHandler: (el) => {
                // Add focus effect
                el.addEventListener('focus', () => {
                    el.style.borderColor = '#4CAF50'
                    el.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)'
                })
                el.addEventListener('blur', () => {
                    el.style.borderColor = '#ccc'
                    el.style.boxShadow = 'none'
                })
            },
            child: [
                $({
                    tag: 'option',
                    text: '-- Select Center --',
                    att: {
                        disabled: true,
                        selected: true,
                        value: ''
                    },
                    style: {
                        color: '#999',
                        backgroundColor: '#3a3a3a'
                    }
                }),
                $({
                    tag: 'option',
                    text: 'Crop Science Research & Development Center (CSRDC)',
                    att: { value: 'CSRDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Livestock Research & Development Center (LRDC)',
                    att: { value: 'LRDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Fisheries Research & Development Center (FRDC)',
                    att: { value: 'FRDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Food and Industrial Technology Research & Development Center (FIRDC)',
                    att: { value: 'FIRDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Social Science Research & Development Center (SSRDC)',
                    att: { value: 'SSRDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Machinery and Agricultural Technology Engineering Center (MATEC)',
                    att: { value: 'MATEC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Coconut Research and Development Center (Coco RDC)',
                    att: { value: 'Coco RDC' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
                $({
                    tag: 'option',
                    text: 'Extension',
                    att: { value: 'Extension' },
                    style: { backgroundColor: '#3a3a3a' }
                }),
            ]
        })
        
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                maxWidth: '500px',
                margin: '12px auto',
                display: 'flex',
                justifyContent: 'center',
            },
            child: [
                selectEl,
            ]
        }))
    }

    // Input component (matching rdeUser style)
    const input = ({ getDataMethod, prop, filter }) => {
        const inputEl = $({
            tag: 'input',
            att: prop,
            style: {
                width: '100%',
                height: '50px',
                maxWidth: '500px',
                minWidth: '250px',
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'Quattrocento sans, sans-serif',
                color: '#fffbfb',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s ease',
            },
            elementHandler: (el) => {
                if (filter) {
                    el.addEventListener('keypress', (event) => {
                        if (event.keyCode === 32) {
                            alert("Invalid Character")
                            return event.returnValue = false
                        }
                    })
                }
                // Add focus effect
                el.addEventListener('focus', () => {
                    el.style.borderColor = '#4CAF50'
                    el.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)'
                })
                el.addEventListener('blur', () => {
                    el.style.borderColor = '#ccc'
                    el.style.boxShadow = 'none'
                })
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
            style: {
                width: '100%',
                maxWidth: '500px',
                margin: '12px auto',
                display: 'flex',
                justifyContent: 'center',
            },
            child: [
                inputEl,
            ]
        }))
    }

    const Submit = () => {
        return ($({
            tag: 'button',
            style: {
                width: '100%',
                height: '50px',
                maxWidth: '500px',
                padding: '12px 16px',
                fontFamily: 'Quattrocento sans, sans-serif',
                margin: '20px auto',
                fontSize: '18px',
                textAlign: 'center',
                borderRadius: '10px',
                cursor: 'not-allowed',
                border: 'none',
                opacity: '0.5',
                backgroundColor: '#cccccc',
                color: '#7e7e7e',
                display: 'block',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
            },
            text: 'Submit',
            att: {
                className: 'submitAddUser',
                id: 'centerDirectorSubmitBtn',
                disabled: true
            },
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
                    submitBtn.style.opacity = '0.5'
                    submitBtn.style.cursor = 'not-allowed'
                    
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
        style: {
            height: '300px',
            width: '100%',
            maxWidth: '600px',
            marginBottom: '2vh',
            marginTop: '5vh',
            backgroundColor: 'rgba(205, 205, 205, 0.2)',
            border: 'solid thin rgba(100,100,100,.5)',
            borderRadius: '10px',
            padding: '20px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
                                        style: {
                                            paddingRight: '20vw',
                                            paddingLeft: '15vw',
                                            paddingTop: '.5vh',
                                            paddingBottom: '5vh',
                                            borderRadius: '10px',
                                            opacity: '0.5',
                                            cursor: 'not-allowed',
                                            backgroundColor: '#cccccc',
                                            fontFamily: 'Quattrocento sans, sans-serif',
                                            color: '#ffffff',
                                            border: 'none',
                                            fontSize: '25px',
                                            width: '70px',
                                            height: '50px'
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
        
        // Update styles based on validation state
        if (isValid) {
            submitBtn.style.opacity = '1'
            submitBtn.style.cursor = 'pointer'
            submitBtn.style.backgroundColor = '#4CAF50'
            submitBtn.style.pointerEvents = 'auto'
        } else {
            submitBtn.style.opacity = '0.5'
            submitBtn.style.cursor = 'not-allowed'
            submitBtn.style.backgroundColor = '#cccccc'
            submitBtn.style.pointerEvents = 'auto'
        }
    }

    const label = $({
        tag: 'div',
        text: 'RDE Staff Account Registration',
        style: {
            fontFamily: 'Quattrocento sans, sans-serif',
            color: 'rgb(211, 211, 211)',
            fontSize: '1.2vw',
            margin: '1vw auto auto',
            width: 'fit-content',
            padding: '0 20px' // Added padding to label
        },
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
            style: {
                width: '100%', // Take full width of container
                maxWidth: '500px', // Maximum width
                minWidth: '250px', // Minimum width
                padding: '12px 16px', // Consistent padding (top/bottom: 12px, left/right: 16px)
                fontSize: '16px', // Slightly larger font
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: 'Quattrocento sans, sans-serif',
                color: '#fffbfb',
                border: '1px solid #ccc', // Added border for better definition
                boxSizing: 'border-box', // Ensures padding doesn't affect width
                outline: 'none', // Remove default outline
                transition: 'border-color 0.3s ease', // Smooth transition for focus
            },
            elementHandler: (el) => {
                if (filter) {
                    getInput(el)
                }
                // Add focus effect
                el.addEventListener('focus', () => {
                    el.style.borderColor = '#4CAF50'
                    el.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)'
                })
                el.addEventListener('blur', () => {
                    el.style.borderColor = '#ccc'
                    el.style.boxShadow = 'none'
                })
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
            style: {
                width: '100%', // Full width container
                maxWidth: '500px', // Consistent max width
                margin: '12px auto', // Consistent vertical margin
                display: 'flex',
                justifyContent: 'center',
            },
            child: [
                inputEl,
            ]
        }))
    }
    
    const Submit = () => {
        return ($({
            tag: 'button',
            style: {
                width: '100%',
                maxWidth: '500px', // Match input field width
                padding: '12px 16px', // Consistent padding with inputs
                fontFamily: 'Quattrocento sans, sans-serif',
                margin: '20px auto', // Center with auto margins
                fontSize: '18px', // Slightly larger font
                textAlign: 'center',
                borderRadius: '10px', // Match input border radius
                cursor: 'not-allowed',
                border: 'none',
                opacity: '0.5',
                backgroundColor: '#cccccc',
                color: '#7e7e7e',
                display: 'block',
                fontWeight: 'bold', // Make text stand out
                transition: 'all 0.3s ease', // Smooth transitions
            },
            text: 'Submit',
            att: {
                className: 'subStaff',
                id: 'rdeSubmitBtn',
                disabled: true
            },
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
                    submitBtn.style.opacity = '0.5'
                    submitBtn.style.cursor = 'not-allowed'
                    
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
        style: {
            height: 'auto', // Auto height to accommodate content
            minHeight: '50%',
            width: '100%',
            maxWidth: '600px', // Max width for the entire form
            margin: '0 auto', // Center the form
            backgroundColor: 'rgba(205, 205, 205, 0.2)',
            border: 'solid thin rgba(100,100,100,.5)',
            borderRadius: '10px', // Add border radius to container
            padding: '20px 0', // Add padding top and bottom
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center all children horizontally
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
                            className:'labelAdmin'
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
                            className:'labelAdmin'
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
import {$, CapsuOffice, ConfirmationAlert, Request, SpecialChar, Waiting, CustomModal} from '../lib/lib.js'
import { showPasswordResetModal } from "./../AccountRetrival/Code.js"

const LoginPanel = (prop) => {
    let username
    let password
    let usertype
    let form
    let formUserType
    let UserTypeStat = true
    let selType

    const getUserType = (value) => {
        usertype = value
    }

    const getUserName = (value) => {
        username = value
    }

    const getPassword = (value) => {
        password = value
    }

    const togglePasswordVisibility = (inputId, iconId) => {
        const input = document.getElementById(inputId)
        const icon = document.getElementById(iconId)
        
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text'
                icon.className = 'fa-solid fa-eye-slash'
            } else {
                input.type = 'password'
                icon.className = 'fa-solid fa-eye'
            }
        }
    }

    const detectUserType = (username) => {
        if (!username) return null
        
        const userLower = username.toLowerCase()
        
        if (userLower.includes('admin') || userLower.includes('administrator')) {
            return 'ADMIN'
        }
        
        if (userLower.includes('@capsu.edu.ph')) {
            return 'CAPSUUSERS'
        }
        
        if (userLower.includes('eval') || userLower.includes('evaluator')) {
            return 'EVALUATOR'
        }
        
        if (userLower.includes('rde') || userLower.includes('office') || userLower.includes('staff')) {
            return 'RDEOFFICE'
        }
        
        if (userLower.includes('chair') || userLower.includes('research')) {
            return 'RESEARCH_CHAIR'
        }
        
        return null
    }

    const autoSelectUserType = (username) => {
        if (!username || !selType) return
        
        const detectedType = detectUserType(username)
        if (detectedType && selType) {
            selType.value = detectedType
            
            if (prop.onAutoDetect) {
                prop.onAutoDetect(detectedType)
            }
        }
    }

    const sel = () => {
        return $({
            tag: 'div',
            att: {
                className: 'dropdown-wrapper mb-2'
            },
            style: {
                position: 'relative',
                width: '100%',
                marginBottom: '1rem'
            },
            child: [
                $({
                    tag: 'select',
                    att: {
                        className: 'form-select mb-2 text-center',
                        name: 'userType',
                        required: true,
                        id: 'userTypeSelect'
                    },
                    style: {
                        backgroundColor: 'rgba(10, 20, 40, 0.8)',
                        color: '#fff',
                        padding: '12px 40px 12px 16px',
                        cursor: 'pointer',
                        appearance: 'none',
                        width: '100%',
                        border: '2px solid rgba(0, 150, 255, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                    },
                    elementHandler: (el) => {
                        selType = el
                    },
                    child: [
                        $({
                            tag: 'option',
                            text: 'Select User Type',
                            att: {
                                disabled: true,
                                selected: true,
                                value: ''
                            }
                        }),
                        $({ tag: 'option', text: 'Admin', att: { value: 'ADMIN' } }),
                        $({ tag: 'option', text: 'CAPSU Center Users', att: { value: 'CAPSUUSERS' } }),
                        $({ tag: 'option', text: 'CAPSU Research Chair User', att: { value: 'RESEARCH_CHAIR' } }),
                        $({ tag: 'option', text: 'Evaluators', att: { value: 'EVALUATOR' } }),
                        $({ tag: 'option', text: 'RDE Office', att: { value: 'RDEOFFICE' } })
                    ]
                })
            ]
        })
    }

    // Function to setup floating label
    const setupFloatingLabel = (inputId, labelId) => {
        setTimeout(() => {
            const input = document.getElementById(inputId)
            const label = document.getElementById(labelId)
            
            if (input && label) {
                const updateLabel = () => {
                    if (input.value && input.value !== '') {
                        label.style.top = '0px'
                        label.style.transform = 'translateY(-50%)'
                        label.style.fontSize = '0.7rem'
                        label.style.color = '#00aaff'
                        label.style.backgroundColor = '#0a1628'
                        label.style.padding = '0 4px'
                    } else {
                        label.style.top = '50%'
                        label.style.transform = 'translateY(-50%)'
                        label.style.fontSize = '0.95rem'
                        label.style.color = '#6688aa'
                        label.style.backgroundColor = 'transparent'
                        label.style.padding = '0 4px'
                    }
                }
                
                input.addEventListener('input', updateLabel)
                input.addEventListener('focus', () => {
                    label.style.top = '0px'
                    label.style.transform = 'translateY(-50%)'
                    label.style.fontSize = '0.7rem'
                    label.style.color = '#00aaff'
                    label.style.backgroundColor = '#0a1628'
                    label.style.padding = '0 4px'
                })
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.style.top = '50%'
                        label.style.transform = 'translateY(-50%)'
                        label.style.fontSize = '0.95rem'
                        label.style.color = '#6688aa'
                        label.style.backgroundColor = 'transparent'
                        label.style.padding = '0 4px'
                    }
                })
                
                // Initial check
                updateLabel()
            }
        }, 100)
    }

    return $({
        tag: 'div',
        att: {
            className: 'logInDiv'
        },
        style: {
            width: '100%'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'col-md-12'
                },
                style: {
                    width: '100%'
                },
                child: [
                    $({
                        tag: 'form',
                        att: {
                            method: 'POST'
                        },
                        style: {
                            width: '100%'
                        },
                        event: {
                            type: 'submit',
                            method: async (ev) => {
                                ev.preventDefault()

                                if (!selType.value && ev.target.username.value) {
                                    const detectedType = detectUserType(ev.target.username.value)
                                    if (detectedType) {
                                        selType.value = detectedType
                                    }
                                }

                                if (selType.value === '') {
                                    let form = new FormData(ev.target)
                                    form.append('auth', 'login')
                                    await fetch('/server/visitorAuth.php', {
                                        method: 'POST',
                                        body: form,
                                    }).then(res => res.json())
                                        .then(data => {
                                            if (data.status) {
                                                window.location.replace(data.message)
                                            } else {
                                                window.location.replace('/')
                                            }
                                        })
                                } else {
                                    let form = new FormData(ev.target)
                                    form.append('auth', 'login')
                                    
                                    if (selType.value === 'EVALUATOR') {
                                        await fetch('/server/evalReg.php', {
                                            method: 'POST',
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                if (data.status) {
                                                    window.location.replace(data.message)
                                                } else {
                                                    alert(data.message)
                                                }
                                            })
                                    } else if (selType.value === 'CAPSUUSERS' || selType.value === 'ADMIN') {
                                        await fetch('/server/authToken.php', {
                                            method: 'POST',
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                if (data.status) {
                                                    window.location.replace(data.message)
                                                } else {
                                                    alert(data.message)
                                                }
                                            })
                                    } else if (selType.value === 'RESEARCH_CHAIR') {
                                        await fetch('/server/researchChairAuth.php', {
                                            method: 'POST',
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                if (data.status) {
                                                    window.location.replace(data.message)
                                                } else {
                                                    alert(data.message)
                                                }
                                            })
                                    } else if (selType.value === "RDEOFFICE") {
                                        await fetch('/server/rdeStaff.php', {
                                            method: 'POST',
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                if (data.status) {
                                                    window.location.replace(data.message)
                                                } else {
                                                    alert(data.message)
                                                }
                                            })
                                    }
                                }
                            }
                        },
                        child: [
                            // External Users Checkbox
                            $({
                                tag: 'div',
                                att: {
                                    className: 'form-check text-start my-2'
                                },
                                style: {
                                    textAlign: 'left',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                },
                                child: [
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'checkbox',
                                            name: 'isExternal',
                                            className: 'form-check-input',
                                            id: 'externalId'
                                        },
                                        style: {
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        },
                                        event: {
                                            type: 'input',
                                            method: () => {
                                                if (UserTypeStat) {
                                                    const selectWrapper = document.querySelector('.dropdown-wrapper')
                                                    if (selectWrapper) selectWrapper.remove()
                                                } else {
                                                    const container = document.querySelector('.logInDiv form > div:nth-child(2)')
                                                    if (container) {
                                                        const newSelect = sel()
                                                        container.appendChild(newSelect)
                                                    }
                                                }
                                                UserTypeStat = !UserTypeStat
                                            }
                                        },
                                    }),
                                    $({
                                        tag: 'label',
                                        att: {
                                            className: 'form-check-label',
                                        },
                                        elementHandler: (el) => {
                                            el.setAttribute('for', 'externalId')
                                        },
                                        text: 'External users?',
                                        style: {
                                            color: '#00aaff',
                                            cursor: 'pointer'
                                        }
                                    }),
                                ]
                            }),
                            // User Type Select Container
                            $({
                                tag: 'div',
                                elementHandler: (el) => {
                                    formUserType = el
                                },
                                style: {
                                    width: '100%',
                                    marginBottom: '1rem'
                                },
                                child: [sel()]
                            }),
                            // Username Field
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            backgroundColor: 'rgba(10, 20, 40, 0.8)',
                                            color: '#00aaff',
                                            fontSize: '1.2rem',
                                            border: '2px solid rgba(0, 150, 255, 0.2)',
                                            borderRight: 'none',
                                            borderRadius: '12px 0 0 12px',
                                            padding: '0 15px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        },
                                        child: [
                                            $({
                                                tag: 'i',
                                                att: {
                                                    className: 'fa-solid fa-user'
                                                }
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'relative',
                                            flex: 1
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'text',
                                                    className: 'form-control',
                                                    name: 'username',
                                                    id: 'userNid',
                                                    placeholder: ' ',
                                                    required: true,
                                                    autocomplete: 'username'
                                                },
                                                event: {
                                                    type: 'input',
                                                    method: (event) => {
                                                        if (event.target.value && !selType.value) {
                                                            setTimeout(() => {
                                                                autoSelectUserType(event.target.value)
                                                            }, 500)
                                                        }
                                                    }
                                                },
                                                style: {
                                                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                                                    color: '#fff',
                                                    border: '2px solid rgba(0, 150, 255, 0.2)',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    height: '52px',
                                                    width: '100%',
                                                    padding: '0 15px',
                                                    fontSize: '0.95rem',
                                                    boxSizing: 'border-box'
                                                }
                                            }),
                                            $({
                                                tag: 'label',
                                                att: {
                                                    for: 'userNid',
                                                    id: 'usernameLabel'
                                                },
                                                text: 'Username or email address',
                                                style: {
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'transparent',
                                                    fontSize: '0.95rem',
                                                    pointerEvents: 'none',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: 'transparent',
                                                    padding: '0 4px',
                                                    zIndex: 5
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                            // Password Field
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            backgroundColor: 'rgba(10, 20, 40, 0.8)',
                                            color: '#00aaff',
                                            fontSize: '1.2rem',
                                            border: '2px solid rgba(0, 150, 255, 0.2)',
                                            borderRight: 'none',
                                            borderRadius: '12px 0 0 12px',
                                            padding: '0 15px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        },
                                        child: [
                                            $({
                                                tag: 'i',
                                                att: {
                                                    className: 'fa-solid fa-lock'
                                                }
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'relative',
                                            flex: 1
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'password',
                                                    className: 'form-control password-input',
                                                    name: 'password',
                                                    id: 'userPid',
                                                    placeholder: ' ',
                                                    required: true,
                                                    autocomplete: 'current-password'
                                                },
                                                style: {
                                                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                                                    color: '#fff',
                                                    border: '2px solid rgba(0, 150, 255, 0.2)',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    height: '52px',
                                                    width: '100%',
                                                    padding: '0 45px 0 15px',
                                                    fontSize: '0.95rem',
                                                    boxSizing: 'border-box'
                                                }
                                            }),
                                            $({
                                                tag: 'label',
                                                att: {
                                                    for: 'userPid',
                                                    id: 'passwordLabel'
                                                },
                                                text: 'Password',
                                                style: {
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'transparent',
                                                    fontSize: '0.95rem',
                                                    pointerEvents: 'none',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: 'transparent',
                                                    padding: '0 4px',
                                                    zIndex: 5
                                                }
                                            }),
                                            $({
                                                tag: 'span',
                                                att: {
                                                    className: 'password-toggle',
                                                    id: 'toggle-login-password'
                                                },
                                                style: {
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    color: 'transparent',
                                                    zIndex: '10',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.3s ease'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'i',
                                                        att: {
                                                            className: 'fa-solid fa-eye',
                                                            id: 'login-password-eye-icon'
                                                        },
                                                        style: {
                                                            color: '#fbfbfb',
                                                        }
                                                    })
                                                ],
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        togglePasswordVisibility('userPid', 'login-password-eye-icon')
                                                    }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                            // Submit Button
                            $({
                                tag: 'button',
                                att: {
                                    className: 'btn btn-primary submitLog',
                                    type: 'submit'
                                },
                                style: {
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
                                    border: 'none',
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    borderRadius: '40px',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    transition: 'all 0.3s ease'
                                },
                                text: 'Submit'
                            })
                        ]
                    })
                ]
            })
        ]
    })
}
const Signup = (prop) => {
    let email
    let center
    let campus
    let username
    let password
    let conPass
    let fullName
    let userRole

    const get = {
        email: (value) => { email = value },
        fullName: (value) => { fullName = value },
        center: (value) => { center = value },
        campus: (value) => { campus = value },
        username: (value) => { username = value },
        password: (value) => { password = value },
        conPass: (value) => { conPass = value },
        userRole: (value) => { userRole = value }
    }

    const togglePasswordVisibility = (inputId, iconId) => {
        const input = document.getElementById(inputId)
        const icon = document.getElementById(iconId)
        
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text'
                icon.className = 'fa-solid fa-eye-slash'
            } else {
                input.type = 'password'
                icon.className = 'fa-solid fa-eye'
            }
        }
    }

    const TableCont = ({label, element}) => {
        return $({
            tag: 'table',
            att: { className: 'logTable sign' },
            style: { width: '100%', marginBottom: '1rem' },
            child: [
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: { className: 'labelTDSign' },
                            style: { textAlign: 'left', paddingBottom: '0.5rem' },
                            text: label
                        })
                    ]
                }),
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            style: { width: '100%' },
                            child: [element]
                        })
                    ]
                })
            ]
        })
    }

    const getContainer = (container) => {
        const form = $({
            tag: 'form',
            att: { id: 'signup-form', autocomplete: 'on' },
            style: { width: '100%' },
            event: {
                type: 'submit',
                method: (event) => {
                    event.preventDefault()
                    const submitBtn = document.getElementById('signup-submit-btn')
                    if (submitBtn) submitBtn.click()
                }
            }
        })
        
        const option = ({label, placeholder, value}) => {
            const getOpt = (opt) => {
                if (label) opt.innerText = label
                if (placeholder) {
                    opt.disabled = true
                    opt.selected = true
                }
                if (value) opt.value = value
            }
            return $({ tag: 'option', elementHandler: getOpt })
        }
        
        const campuses = [
            "Roxas City Main", "Pilar", "Pontevedra", "Mambusao", "Burias",
            "Sigma", "Sapian", "Tapaz", "Dumarao", "Dayao"
        ]
        
        const getRoleSelect = (select) => {
            select.appendChild(option({ label: '-- Select Role --', placeholder: true }))
            const roles = [
                { label: 'Research Chair', value: 'research_chair' },
                { label: 'Research Center Chair', value: 'research_center_chair' }
            ]
            roles.forEach(role => {
                select.appendChild($({
                    tag: 'option',
                    text: role.label,
                    att: { value: role.value }
                }))
            })
        }

        form.appendChild(TableCont({
            label: 'Register as',
            element: $({
                tag: 'select',
                elementHandler: getRoleSelect,
                event: {
                    type: 'change',
                    method: (event) => {
                        const selectedRole = event.target.value
                        get.userRole(selectedRole)
                        
                        const campusContainer = document.getElementById('campus-container')
                        const centerContainer = document.getElementById('center-container')
                        const extensionCampusContainer = document.getElementById('extension-campus-container')
                        
                        if (selectedRole === 'research_chair') {
                            if (campusContainer) campusContainer.style.display = 'block'
                            if (centerContainer) centerContainer.style.display = 'none'
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            get.center(undefined)
                            const centerSelect = document.getElementById('select-sign')
                            if (centerSelect) centerSelect.selectedIndex = 0
                        } else if (selectedRole === 'research_center_chair') {
                            if (campusContainer) campusContainer.style.display = 'none'
                            if (centerContainer) centerContainer.style.display = 'block'
                            get.campus(undefined)
                            const campusSelect = document.getElementById('select-campus')
                            if (campusSelect) campusSelect.selectedIndex = 0
                            const centerSelect = document.getElementById('select-sign')
                            if (centerSelect && centerSelect.value === 'Extension') {
                                if (extensionCampusContainer) extensionCampusContainer.style.display = 'block'
                            } else {
                                if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            }
                        } else {
                            if (campusContainer) campusContainer.style.display = 'none'
                            if (centerContainer) centerContainer.style.display = 'none'
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                        }
                    }
                },
                att: { id: 'select-role', className: 'selectSign' },
                style: { width: '100%', padding: '12px', borderRadius: '12px' }
            })
        }))
        
        const getSelect = (select) => {
            select.appendChild(option({ label: '-- Select Research Center --', placeholder: true }))
            CapsuOffice.forEach(val => {
                let code = val
                const match = val.match(/\(([^)]+)\)/)
                if (match) {
                    code = match[1]
                } else if (val === "Extension") {
                    code = "Extension"
                }
                select.appendChild($({
                    tag: 'option',
                    text: val,
                    att: { value: code }
                }))
            })
        }

        const centerTable = TableCont({
            label: 'Research Center',
            element: $({
                tag: 'select',
                elementHandler: getSelect,
                event: {
                    type: 'change',
                    method: (event) => {
                        const selectedCenter = event.target.value
                        get.center(selectedCenter)
                        const extensionCampusContainer = document.getElementById('extension-campus-container')
                        if (selectedCenter === 'Extension' && userRole === 'research_center_chair') {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'block'
                        } else {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            if (selectedCenter !== 'Extension') {
                                get.campus(undefined)
                                const extensionCampusSelect = document.getElementById('select-extension-campus')
                                if (extensionCampusSelect) extensionCampusSelect.selectedIndex = 0
                            }
                        }
                    }
                },
                att: { id: 'select-sign', className: 'selectSign' },
                style: { width: '100%', padding: '12px', borderRadius: '12px' }
            })
        })
        
        const centerWrapper = $({
            tag: 'div',
            att: { id: 'center-container', style: 'display: none width: 100%' },
            child: [centerTable]
        })
        form.appendChild(centerWrapper)
        
        const getExtensionCampusSelect = (select) => {
            select.appendChild(option({ label: '-- Select Extension Campus --', placeholder: true }))
            campuses.forEach(val => {
                select.appendChild($({
                    tag: 'option',
                    text: val,
                    att: { value: val }
                }))
            })
        }
        
        const extensionCampusTable = TableCont({
            label: 'Extension Campus',
            element: $({
                tag: 'select',
                elementHandler: getExtensionCampusSelect,
                event: {
                    type: 'change',
                    method: (event) => { get.campus(event.target.value) }
                },
                att: { id: 'select-extension-campus', className: 'selectSign' },
                style: { width: '100%', padding: '12px', borderRadius: '12px' }
            })
        })
        
        const extensionCampusWrapper = $({
            tag: 'div',
            att: { id: 'extension-campus-container', style: 'display: none width: 100%' },
            child: [extensionCampusTable]
        })
        form.appendChild(extensionCampusWrapper)
        
        const getCampusSelect = (select) => {
            select.appendChild(option({ label: '-- Select Campus --', placeholder: true }))
            campuses.forEach(val => {
                select.appendChild($({
                    tag: 'option',
                    text: val,
                    att: { value: val }
                }))
            })
        }
        
        const campusTable = TableCont({
            label: 'Campus',
            element: $({
                tag: 'select',
                elementHandler: getCampusSelect,
                event: {
                    type: 'change',
                    method: (event) => { get.campus(event.target.value) }
                },
                att: { id: 'select-campus', className: 'selectSign' },
                style: { width: '100%', padding: '12px', borderRadius: '12px' }
            })
        })
        
        const campusWrapper = $({
            tag: 'div',
            att: { id: 'campus-container', style: 'display: none width: 100%' },
            child: [campusTable]
        })
        form.appendChild(campusWrapper)

        form.appendChild(TableCont({
            label: 'Email address',
            element: $({
                tag: 'input',
                att: {
                    type: 'email',
                    className: 'signInput',
                    placeholder: 'xxxx@capsu.edu.ph',
                    id: 'signup-email',
                    name: 'email',
                    autocomplete: 'email'
                },
                style: { width: '100%', padding: '12px', borderRadius: '12px', boxSizing: 'border-box' },
                event: { type: 'input', method: (event) => { get.email(event.target.value) } }
            })
        }))

        form.appendChild(TableCont({
            label: 'Full name',
            element: $({
                tag: 'input',
                att: {
                    type: 'text',
                    id: 'signinput-fullname',
                    name: 'fullname',
                    className: 'signInput',
                    placeholder: 'Enter full name',
                    autocomplete: 'name'
                },
                style: { width: '100%', padding: '12px', borderRadius: '12px', boxSizing: 'border-box' },
                event: { type: 'input', method: (event) => { get.fullName(event.target.value) } }
            })
        }))

        form.appendChild(TableCont({
            label: 'Username',
            element: $({
                tag: 'input',
                att: {
                    type: 'text',
                    id: 'signinput-Username',
                    name: 'username',
                    className: 'signInput',
                    placeholder: 'Enter username',
                    autocomplete: 'username'
                },
                style: { width: '100%', padding: '12px', borderRadius: '12px', boxSizing: 'border-box' },
                event: { type: 'input', method: (event) => { get.username(event.target.value) } },
                elementHandler: SpecialChar
            })
        }))

        form.appendChild(TableCont({
            label: 'Password',
            element: $({
                tag: 'div',
                att: { className: 'password-container' },
                style: { position: 'relative', width: '100%' },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'password',
                            className: 'signInput password-input',
                            placeholder: 'Create 8 to 20 characters password',
                            maxLength: '20',
                            minLength: '8',
                            id: 'signup-password',
                            name: 'password',
                            autocomplete: 'new-password'
                        },
                        style: { width: '100%', padding: '12px 45px 12px 12px', borderRadius: '12px', boxSizing: 'border-box' },
                        event: { type: 'input', method: (event) => { get.password(event.target.value) } },
                        elementHandler: SpecialChar
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'password-toggle', id: 'toggle-password' },
                        style: {
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#6688aa',
                            zIndex: '10'
                        },
                        child: [$({ tag: 'i', att: { className: 'fa-solid fa-eye', id: 'password-eye-icon' } })],
                        event: { type: 'click', method: () => { togglePasswordVisibility('signup-password', 'password-eye-icon') } }
                    })
                ]
            })
        }))

        form.appendChild(TableCont({
            label: 'Re-type Password',
            element: $({
                tag: 'div',
                att: { className: 'password-container' },
                style: { position: 'relative', width: '100%' },
                child: [
                    $({
                        tag: 'input',
                        att: {
                            type: 'password',
                            className: 'signInput password-input',
                            placeholder: 'Re-enter password',
                            maxLength: '20',
                            id: 'signup-confirm-password',
                            name: 'confirmPassword',
                            autocomplete: 'new-password'
                        },
                        style: { width: '100%', padding: '12px 45px 12px 12px', borderRadius: '12px', boxSizing: 'border-box' },
                        event: { type: 'input', method: (event) => { get.conPass(event.target.value) } },
                        elementHandler: SpecialChar
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'password-toggle', id: 'toggle-confirm-password' },
                        style: {
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#6688aa',
                            zIndex: '10'
                        },
                        child: [$({ tag: 'i', att: { className: 'fa-solid fa-eye', id: 'confirm-password-eye-icon' } })],
                        event: { type: 'click', method: () => { togglePasswordVisibility('signup-confirm-password', 'confirm-password-eye-icon') } }
                    })
                ]
            })
        }))

        form.appendChild(TableCont({
            label: '',
            element: $({
                tag: 'input',
                att: {
                    type: 'submit',
                    className: 'submit',
                    value: 'Submit',
                    id: 'signup-submit-btn'
                },
                style: {
                    width: '100%',
                    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
                    border: 'none',
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    color: '#fff',
                    marginTop: '1rem'
                },
                event: {
                    type: 'click',
                    method: async (event) => {
                        event.preventDefault()
                        
                        if (userRole === undefined) {
                            alert("Please select a role (Research Chair or Research Center Chair)..!")
                            return
                        }
                        
                        if (userRole === 'research_chair') {
                            if (campus === undefined) {
                                alert("Please select a Campus..!")
                                return
                            }
                        } else if (userRole === 'research_center_chair') {
                            if (center === undefined) {
                                alert("Please select a Research Center..!")
                                return
                            }
                            if (center === 'Extension' && campus === undefined) {
                                alert("Please select an Extension Campus..!")
                                return
                            }
                        }
                        
                        if (email === undefined) { alert("E-Mail is missing..!"); return; }
                        if (fullName === undefined) { alert("Full name is missing..!"); return; }
                        if (username === undefined) { alert("Username is missing..!"); return; }
                        if (password === undefined) { alert("Password is missing..!"); return; }
                        if (password.length < 8) { alert("Please provide at least 8 characters password...!"); return; }
                        if (password !== conPass) { alert("Passwords do not match!"); return; }

                        const formData = new FormData()
                        formData.append('auth', 'signup')
                        
                        if (userRole === 'research_chair') {
                            formData.append('campus', campus.toUpperCase())
                        } else if (userRole === 'research_center_chair') {
                            formData.append('cName', center.toUpperCase())
                            if (center === 'Extension' && campus) {
                                formData.append('campus', campus.toUpperCase())
                            }
                        }
                        
                        formData.append('userEmail', email)
                        formData.append('fullName', fullName)
                        formData.append('username', username)
                        formData.append('password', password)
                        
                        let loading = Waiting()
                        document.body.appendChild(loading)
                        
                        const remove = () => { loading.remove() }

                        try {
                            const res = await fetch('/server/authToken.php', {
                                method: "POST",
                                body: formData
                            })
                            
                            if (res.ok) {
                                remove()
                                const dat = await res.json()
                                
                                if (dat.status) {
                                    document.body.appendChild(ConfirmationAlert(
                                        "Your account has been successfully created!\nPlease check your email to verify your account.", 
                                        () => { window.location.replace('/account/Login?') }
                                    ))
                                } else {
                                    document.body.appendChild(ConfirmationAlert(dat.message, () => { window.location.reload() }))
                                }
                            } else {
                                remove()
                                alert("Server error. Please try again later.")
                            }
                        } catch (error) {
                            remove()
                            console.error('Signup error:', error)
                            alert("An error occurred during registration. Please try again.")
                        }
                    }
                }
            })
        }))
        
        container.appendChild(form)
    }

    return $({
        tag: 'div',
        att: { className: 'logInDiv signIn' },
        style: { width: '100%' },
        elementHandler: getContainer
    })
}

const logo = () => {
    return $({
        tag: 'div',
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #0a1628, #0d1f3c)',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)'
        },
        child: [
            // Logo Image
            $({
                tag: 'img',
                att: {
                    src: '/client/images/cap.png',
                    alt: 'CAPSU Logo',
                    style: 'width: 60px height: 60px object-fit: contain'
                },
                style: {
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain'
                }
            }),
            // Text Container
            $({
                tag: 'div',
                style: {
                    flex: 1,
                    textAlign: 'center'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'CAPIZ STATE UNIVERSITY',
                        style: {
                            color: '#00aaff',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            textShadow: '0 2px 5px rgba(0, 150, 255, 0.3)',
                            padding: '0.25rem 0',
                            borderBottom: '2px solid rgba(0, 150, 255, 0.5)',
                            fontFamily: 'Segoe UI, Poppins, system-ui, sans-serif'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'Center of Academic Excellence Delivering Quality Service to All',
                        style: {
                            color: '#88aaff',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.5rem 0 0.25rem',
                            fontFamily: 'Segoe UI, system-ui, sans-serif',
                            letterSpacing: '0.3px'
                        }
                    })
                ]
            })
        ]
    })
}

export const LoginPage = () => {
    let logState = true
    let clsObj

    const getBot = (val) => {
        switch (window.location.href.replace(window.location.origin, '')) {
            case '/account/Login?':
                // Create a clickable link instead of button-like text
                val.innerHTML = `<a href="/account/Signup?" style="
                    color: #00aaff;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-family: 'Segoe UI', sans-serif;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    display: inline-block;
                " onmouseover="this.style.color='#22bbff'; this.style.textDecoration='underline';" 
                onmouseout="this.style.color='#00aaff'; this.style.textDecoration='none';">Create an account?</a>
                <i style='font-size:0.85rem;color: #88aaff;font-family: Segoe UI, sans-serif;'>( for Capsu Research & Extension user's only )</i>`
                break;
            case '/account/Signup?':
                val.innerHTML = `<a href="/account/Login?" style="
                    color: #00aaff;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-family: 'Segoe UI', sans-serif;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    display: inline-block;
                " onmouseover="this.style.color='#22bbff'; this.style.textDecoration='underline';" 
                onmouseout="this.style.color='#00aaff'; this.style.textDecoration='none';">Log in</a>`
                break;
        }
    }

    const getCLS = (cls) => {
        clsObj = cls
        switch (window.location.href.replace(window.location.origin, '')) {
            case '/account/Login?':
                clsObj.appendChild(LoginPanel())
                // Setup floating labels after DOM is ready
                setTimeout(() => {
                    setupFloatingLabel('userNid', 'usernameLabel')
                    setupFloatingLabel('userPid', 'passwordLabel')
                }, 100)
                break
            case '/account/Signup?':
                clsObj.appendChild(Signup())
                break
        }
    }

    // Define setupFloatingLabel function here
    const setupFloatingLabel = (inputId, labelId) => {
        const input = document.getElementById(inputId)
        const label = document.getElementById(labelId)
        
        if (input && label) {
            const updateLabel = () => {
                if (input.value && input.value !== '') {
                    label.style.top = '0px'
                    label.style.transform = 'translateY(-50%)'
                    label.style.fontSize = '0.7rem'
                    label.style.color = '#00aaff'
                    label.style.backgroundColor = '#0a1628'
                    label.style.padding = '0 4px'
                } else {
                    label.style.top = '50%'
                    label.style.transform = 'translateY(-50%)'
                    label.style.fontSize = '0.95rem'
                    label.style.color = '#6688aa'
                    label.style.backgroundColor = 'transparent'
                    label.style.padding = '0 4px'
                }
            }
            
            input.addEventListener('input', updateLabel)
            input.addEventListener('focus', () => {
                label.style.top = '0px'
                label.style.transform = 'translateY(-50%)'
                label.style.fontSize = '0.7rem'
                label.style.color = '#00aaff'
                label.style.backgroundColor = '#0a1628'
                label.style.padding = '0 4px'
            })
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.style.top = '50%'
                    label.style.transform = 'translateY(-50%)'
                    label.style.fontSize = '0.95rem'
                    label.style.color = '#6688aa'
                    label.style.backgroundColor = 'transparent'
                    label.style.padding = '0 4px'
                }
            })
            
            updateLabel()
        }
    }

    const ChangePanel = () => {
        return $({
            tag: 'div',
            elementHandler: getBot,
            att: { className: 'butDiv' },
            style: {
                marginBottom: '2vh',
                textAlign: 'center'
            },
            text: 'Login?',
            event: {
                type: 'click',
                method: () => {
                    if (window.location.href.replace(window.location.origin, '') === '/account/Login?') {
                        window.location.assign('/account/Signup?')
                    } else {
                        window.location.assign('/account/Login?')
                    }
                }
            }
        })
    }

    return $({
        tag: 'div',
        att: { className: 'LoginPanel' },
        child: [
            logo(),
            $({ tag: 'div', elementHandler: getCLS, att: { className: "clogOrSig" } }),
            ChangePanel(),
            $({
                tag: 'a',
                style: {
                    fontFamily: 'Segoe UI, sans-serif',
                    color: '#00aaff',
                    fontSize: '0.85rem',
                    fontWeight: 'bolder',
                    marginTop: '1.5rem',
                    borderBottom: 'solid thin #00aaff',
                    width: 'fit-content',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                },
                text: 'Forgot password?',
                event: {
                    type: 'click',
                    method: (e) => {
                        e.preventDefault()
                        // Open the password reset modal
                        showPasswordResetModal()
                    }
                }
            })
        ]
    })
}
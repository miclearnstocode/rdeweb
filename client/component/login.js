import { $, CapsuOffice, ConfirmationAlert, Request, SpecialChar, Waiting, CustomModal } from '../lib/lib.js'
import { showPasswordResetModal } from "./../AccountRetrival/Code.js"

const LoginPanel = (prop) => {
    let username
    let password
    let form
    let UserTypeStat = true
    let selType
    let isSubmitting = false

    const getUserName = (value) => {
        username = value
    }

    const getPassword = (value) => {
        password = value
    }

    const detectUserTypeAndAuthenticate = async (username, password) => {
        const authEndpoints = [
            {
                name: 'ADMIN/CAPSUUSERS',
                endpoint: '/loginAuth',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass,
                    userType: ''
                })
            },
            {
                name: 'RESEARCH_CHAIR',
                endpoint: '/researchChairAuth',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass
                })
            },
            {
                name: 'EXTENSION_CHAIR',
                endpoint: '/extensionChairAuth',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass
                })
            },
            {
                name: 'EVALUATOR',
                endpoint: '/evaluatorReg',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass,
                    userType: 'EVALUATOR'
                })
            },
            {
                name: 'RDEOFFICE',
                endpoint: '/rdeStaff',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass
                })
            },
            {
                name: 'EXTERNAL',
                endpoint: '/externalauth',
                checkEndpoint: true,
                body: (user, pass) => new URLSearchParams({
                    auth: 'login',
                    username: user,
                    password: pass
                })
            }
        ]

        for (const authConfig of authEndpoints) {
            try {
                const formData = authConfig.body(username, password)

                const response = await fetch(authConfig.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData
                })

                if (!response.ok) {
                    continue
                }

                const data = await response.json()

                if (data.status === true) {
                    return {
                        success: true,
                        endpoint: authConfig.endpoint,
                        userType: authConfig.name,
                        redirectUrl: data.message,
                        rawResponse: data
                    }
                }
            } catch (error) {
                continue
            }
        }

        return {
            success: false,
            message: 'Invalid username or password. Please check your credentials.'
        }
    }

    return $({
        tag: 'div',
        att: {
            className: 'logInDiv'
        },
        style: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'col-md-12'
                },
                style: {
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    backgroundColor: 'transparent'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            marginBottom: '2rem',
                            width: '100%'
                        },
                        child: [
                            $({
                                tag: 'h2',
                                style: {
                                    color: '#2c3e50',
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Inter, Segoe UI, sans-serif',
                                    letterSpacing: '-0.5px'
                                },
                                text: 'Welcome Back, Researcher & Extensionist!'
                            }),
                            $({
                                tag: 'p',
                                style: {
                                    color: '#6c757d',
                                    fontSize: '0.95rem',
                                    marginTop: '0',
                                    fontFamily: 'Inter, Segoe UI, sans-serif'
                                },
                                text: 'Sign in to access your dashboard'
                            })
                        ]
                    }),
                    $({
                        tag: 'form',
                        att: {
                            method: 'POST',
                            id: 'loginForm'
                        },
                        style: {
                            width: '100%'
                        },
                        event: {
                            type: 'submit',
                            method: async (ev) => {
                                ev.preventDefault()

                                if (isSubmitting) return
                                isSubmitting = true

                                const usernameValue = ev.target.username?.value || ''
                                const passwordValue = ev.target.password?.value || ''

                                if (!usernameValue || !passwordValue) {
                                    alert('Please enter both username and password')
                                    isSubmitting = false
                                    return
                                }

                                const submitBtn = ev.target.querySelector('.submitLog')
                                const originalBtnText = submitBtn?.innerHTML || 'Submit'
                                if (submitBtn) {
                                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...'
                                    submitBtn.disabled = true
                                }

                                try {
                                    const result = await detectUserTypeAndAuthenticate(usernameValue, passwordValue)

                                    if (result.success) {
                                        window.location.replace(result.redirectUrl)
                                    } else {
                                        alert(result.message || 'Authentication failed. Please check your credentials.')
                                        if (submitBtn) {
                                            submitBtn.innerHTML = originalBtnText
                                            submitBtn.disabled = false
                                        }
                                    }
                                } catch (error) {
                                    console.error('Login error:', error)
                                    alert('An error occurred during login. Please try again.')
                                    if (submitBtn) {
                                        submitBtn.innerHTML = originalBtnText
                                        submitBtn.disabled = false
                                    }
                                } finally {
                                    isSubmitting = false
                                }
                            }
                        },
                        child: [
                            // Username Field - Centered
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    position: 'relative',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            backgroundColor: '#f8f9fa',
                                            color: '#6c757d',
                                            fontSize: '1.2rem',
                                            border: '1px solid #dee2e6',
                                            borderRight: 'none',
                                            borderRadius: '10px 0 0 10px',
                                            padding: '0 15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            minWidth: '48px',
                                            justifyContent: 'center'
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
                                                    placeholder: 'Username/Email',
                                                    required: true,
                                                    autocomplete: 'username'
                                                },
                                                style: {
                                                    backgroundColor: '#ffffff',
                                                    color: '#2c3e50',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '0 10px 10px 0',
                                                    height: '52px',
                                                    width: '100%',
                                                    padding: '0 15px',
                                                    fontSize: '0.95rem',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                },
                                                event: [
                                                    {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#0d6efd'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                                            const icon = e.target.parentElement.parentElement.querySelector('span')
                                                            if (icon) {
                                                                icon.style.borderColor = '#0d6efd'
                                                                icon.style.color = '#0d6efd'
                                                            }
                                                        }
                                                    },
                                                    {
                                                        type: 'blur',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#dee2e6'
                                                            e.target.style.boxShadow = 'none'
                                                            const icon = e.target.parentElement.parentElement.querySelector('span')
                                                            if (icon) {
                                                                icon.style.borderColor = '#dee2e6'
                                                                icon.style.color = '#6c757d'
                                                            }
                                                        }
                                                    }
                                                ]
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
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    position: 'relative',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            backgroundColor: '#f8f9fa',
                                            color: '#6c757d',
                                            fontSize: '1.2rem',
                                            border: '1px solid #dee2e6',
                                            borderRight: 'none',
                                            borderRadius: '10px 0 0 10px',
                                            padding: '0 15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            minWidth: '48px',
                                            justifyContent: 'center'
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
                                                    placeholder: '*****************',
                                                    required: true,
                                                    autocomplete: 'current-password'
                                                },
                                                style: {
                                                    backgroundColor: '#ffffff',
                                                    color: '#2c3e50',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '0 10px 10px 0',
                                                    height: '52px',
                                                    width: '100%',
                                                    padding: '0 45px 0 15px',
                                                    fontSize: '0.95rem',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                },
                                                event: [
                                                    {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#0d6efd'
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                                            const icon = e.target.parentElement.parentElement.querySelector('span')
                                                            if (icon) {
                                                                icon.style.borderColor = '#0d6efd'
                                                                icon.style.color = '#0d6efd'
                                                            }
                                                        }
                                                    },
                                                    {
                                                        type: 'blur',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#dee2e6'
                                                            e.target.style.boxShadow = 'none'
                                                            const icon = e.target.parentElement.parentElement.querySelector('span')
                                                            if (icon) {
                                                                icon.style.borderColor = '#dee2e6'
                                                                icon.style.color = '#6c757d'
                                                            }
                                                        }
                                                    }
                                                ]
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
                                                    color: '#adb5bd',
                                                    zIndex: '10',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.3s ease',
                                                    background: 'transparent'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'i',
                                                        att: {
                                                            className: 'fa-solid fa-eye',
                                                            id: 'login-password-eye-icon'
                                                        },
                                                        style: {
                                                            color: '#adb5bd',
                                                            transition: 'all 0.3s ease',
                                                            pointerEvents: 'none'
                                                        }
                                                    })
                                                ],
                                                event: {
                                                    type: 'click',
                                                    method: function (e) {
                                                        e.stopPropagation()
                                                        const input = document.getElementById('userPid')
                                                        const icon = document.getElementById('login-password-eye-icon')

                                                        if (input && icon) {
                                                            if (input.type === 'password') {
                                                                input.type = 'text'
                                                                icon.className = 'fa-solid fa-eye-slash'
                                                                icon.style.color = '#0d6efd'
                                                                this.style.color = '#0d6efd'
                                                            } else {
                                                                input.type = 'password'
                                                                icon.className = 'fa-solid fa-eye'
                                                                icon.style.color = '#adb5bd'
                                                                this.style.color = '#adb5bd'
                                                            }
                                                        }
                                                    }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag: 'button',
                                att: {
                                    className: 'btn btn-primary submitLog',
                                    type: 'submit'
                                },
                                style: {
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                                    border: 'none',
                                    padding: '14px 24px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    borderRadius: '10px',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)',
                                    textAlign: 'center'
                                },
                                text: 'Sign In',
                                event: [
                                    {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.4)'
                                        }
                                    },
                                    {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 2px 8px rgba(13, 110, 253, 0.3)'
                                        }
                                    }
                                ]
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

    const option = ({ label, placeholder, value }) => {
        const getOpt = (opt) => {
            if (label) opt.innerText = label
            if (placeholder) {
                opt.disabled = true
                opt.selected = true
            }
            if (value) opt.value = value
            opt.style.color = '#2c3e50'
            opt.style.backgroundColor = '#ffffff'
        }
        return $({ tag: 'option', elementHandler: getOpt })
    }

    const campuses = [
        "Roxas City Main", "Pilar", "Pontevedra", "Mambusao", "Burias",
        "Sigma", "Sapian", "Tapaz", "Dumarao", "Dayao"
    ]

    // Modern Select Component
    const ModernSelect = ({ label, id, options, onchange }) => {
        return $({
            tag: 'div',
            style: {
                marginBottom: '1.25rem',
                width: '100%'
            },
            child: [
                $({
                    tag: 'label',
                    att: { for: id },
                    text: label,
                    style: {
                        display: 'block',
                        color: '#2c3e50',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        fontFamily: 'Inter, Segoe UI, sans-serif'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        width: '100%'
                    },
                    child: [
                        $({
                            tag: 'select',
                            att: { id: id, className: 'selectSign' },
                            style: {
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '10px',
                                color: '#2c3e50',
                                fontSize: '0.95rem',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                boxSizing: 'border-box',
                                height: '52px',
                                lineHeight: '1.2',
                                transition: 'all 0.3s ease'
                            },
                            event: {
                                type: 'change',
                                method: onchange
                            },
                            child: options
                        })
                    ]
                })
            ]
        })
    }

    // Modern Input without label (just placeholder)
    const ModernInput = ({ type, id, placeholder, icon, onInput, required = true }) => {
        return $({
            tag: 'div',
            style: {
                marginBottom: '1.25rem',
                width: '100%'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        width: '100%'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#6c757d',
                                fontSize: '1rem',
                                zIndex: '2'
                            },
                            child: [
                                $({
                                    tag: 'i',
                                    att: { className: icon }
                                })
                            ]
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: type,
                                id: id,
                                name: id,
                                placeholder: placeholder,
                                required: required,
                                autocomplete: 'off'
                            },
                            elementHandler: (el) => {
                                el.addEventListener('input', (e) => {
                                    if (onInput) onInput(e.target.value)
                                })
                            },
                            style: {
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '10px',
                                color: '#2c3e50',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            },
                            event: {
                                type: 'focus',
                                method: (e) => {
                                    e.target.style.borderColor = '#0d6efd'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                    const icon = e.target.parentElement.querySelector('span')
                                    if (icon) icon.style.color = '#0d6efd'
                                }
                            },
                            event: {
                                type: 'blur',
                                method: (e) => {
                                    e.target.style.borderColor = '#dee2e6'
                                    e.target.style.boxShadow = 'none'
                                    const icon = e.target.parentElement.querySelector('span')
                                    if (icon) icon.style.color = '#6c757d'
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Modern Password Input without label (just placeholder)
    const ModernPasswordInput = ({ id, placeholder, icon, onInput, required = true }) => {
        let inputElement = null

        return $({
            tag: 'div',
            style: {
                marginBottom: '1.25rem',
                width: '100%'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        position: 'relative',
                        width: '100%'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#6c757d',
                                fontSize: '1rem',
                                zIndex: '2'
                            },
                            child: [
                                $({
                                    tag: 'i',
                                    att: { className: icon }
                                })
                            ]
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'password',
                                id: id,
                                name: id,
                                placeholder: placeholder,
                                required: required,
                                autocomplete: 'new-password'
                            },
                            elementHandler: (el) => {
                                inputElement = el
                                el.addEventListener('input', (e) => {
                                    if (onInput) onInput(e.target.value)
                                })
                            },
                            style: {
                                width: '100%',
                                padding: '12px 45px 12px 40px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '10px',
                                color: '#2c3e50',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            },
                            event: {
                                type: 'focus',
                                method: (e) => {
                                    e.target.style.borderColor = '#0d6efd'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                                }
                            },
                            event: {
                                type: 'blur',
                                method: (e) => {
                                    e.target.style.borderColor = '#dee2e6'
                                    e.target.style.boxShadow = 'none'
                                }
                            }
                        }),
                        $({
                            tag: 'span',
                            style: {
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#adb5bd',
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
                                    att: { className: 'fa-solid fa-eye' }
                                })
                            ],
                            elementHandler: (el) => {
                                let isVisible = false
                                const icon = el.querySelector('i')

                                el.addEventListener('click', (e) => {
                                    e.stopPropagation()
                                    isVisible = !isVisible
                                    if (inputElement) {
                                        inputElement.type = isVisible ? 'text' : 'password'
                                        if (icon) {
                                            icon.className = isVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
                                        }
                                        el.style.color = isVisible ? '#0d6efd' : '#adb5bd'
                                    }
                                })

                                el.addEventListener('mouseenter', () => {
                                    el.style.color = '#0d6efd'
                                    el.style.backgroundColor = 'rgba(13, 110, 253, 0.05)'
                                })

                                el.addEventListener('mouseleave', () => {
                                    el.style.color = isVisible ? '#0d6efd' : '#adb5bd'
                                    el.style.backgroundColor = 'transparent'
                                })
                            }
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

        const infoText = $({
            tag: 'div',
            style: {
                backgroundColor: '#e7f1ff',
                borderLeft: '4px solid #0d6efd',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontFamily: 'Inter, Segoe UI, sans-serif',
                fontSize: '0.85rem',
                color: '#0d5a8a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-info-circle' },
                    style: {
                        fontSize: '18px',
                        color: '#0d6efd',
                        flexShrink: '0'
                    }
                }),
                $({
                    tag: 'span',
                    text: 'Sign up is available only for users whose email addresses have been registered by the RDE Office Admin. If you have not received a registration email, please contact the RDE Office.',
                    style: {
                        lineHeight: '1.5'
                    }
                })
            ]
        })

        form.appendChild(infoText)

        // Role Selection
        const roleOptions = [
            option({ label: '-- Select Role --', placeholder: true }),
            option({ label: 'Research Campus Chair', value: 'research_chair' }),
            option({ label: 'Research Center or Extension Chair', value: 'research_center_chair' })
        ]

        form.appendChild(ModernSelect({
            label: 'Select Role',
            id: 'select-role',
            options: roleOptions,
            onchange: (event) => {
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
                } else if (selectedRole === 'research_center_chair') {
                    if (campusContainer) campusContainer.style.display = 'none'
                    if (centerContainer) centerContainer.style.display = 'block'
                    get.campus(undefined)
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
        }))

        // Research Center Options
        const centerOptions = [option({ label: '-- Select Research Center or Extension --', placeholder: true })]
        CapsuOffice.forEach(val => {
            let code = val
            const match = val.match(/\(([^)]+)\)/)
            if (match) {
                code = match[1]
            } else if (val === "Extension") {
                code = "Extension"
            }
            centerOptions.push(option({ label: val, value: code }))
        })

        const centerWrapper = $({
            tag: 'div',
            att: { id: 'center-container', style: 'display: none; width: 100%;' },
            child: [
                ModernSelect({
                    label: 'Select Research Center',
                    id: 'select-sign',
                    options: centerOptions,
                    onchange: (event) => {
                        const selectedCenter = event.target.value
                        get.center(selectedCenter)
                        const extensionCampusContainer = document.getElementById('extension-campus-container')
                        if (selectedCenter === 'Extension' && userRole === 'research_center_chair') {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'block'
                        } else {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            if (selectedCenter !== 'Extension') {
                                get.campus(undefined)
                            }
                        }
                    }
                })
            ]
        })
        form.appendChild(centerWrapper)

        // Extension Campus Options
        const extensionOptions = [option({ label: '-- Select Campus --', placeholder: true })]
        campuses.forEach(val => {
            extensionOptions.push(option({ label: val, value: val }))
        })

        const extensionCampusWrapper = $({
            tag: 'div',
            att: { id: 'extension-campus-container', style: 'display: none; width: 100%;' },
            child: [
                ModernSelect({
                    label: 'Select Extension Campus',
                    id: 'select-extension-campus',
                    options: extensionOptions,
                    onchange: (event) => { get.campus(event.target.value) }
                })
            ]
        })
        form.appendChild(extensionCampusWrapper)

        // Campus Options
        const campusOptions = [option({ label: '-- Select Campus --', placeholder: true })]
        campuses.forEach(val => {
            campusOptions.push(option({ label: val, value: val }))
        })

        const campusWrapper = $({
            tag: 'div',
            att: { id: 'campus-container', style: 'display: none; width: 100%;' },
            child: [
                ModernSelect({
                    label: 'Select Campus',
                    id: 'select-campus',
                    options: campusOptions,
                    onchange: (event) => { get.campus(event.target.value) }
                })
            ]
        })
        form.appendChild(campusWrapper)

        // ============ FORM FIELDS (No Labels) ============

        // 1. Full Name - Full width (above the two columns)
        form.appendChild(ModernInput({
            type: 'text',
            id: 'signinput-fullname',
            placeholder: 'Full name',
            icon: 'fa-solid fa-user-circle',
            onInput: (val) => get.fullName(val)
        }))

        // 2. Two column layout for remaining fields
        const twoColumnContainer = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '0.5rem'
            },
            child: [
                // Left column
                $({
                    tag: 'div',
                    style: { width: '100%' },
                    child: [
                        ModernInput({
                            type: 'email',
                            id: 'signup-email',
                            placeholder: 'Email Address',
                            icon: 'fa-solid fa-envelope',
                            onInput: (val) => get.email(val)
                        }),
                        ModernInput({
                            type: 'text',
                            id: 'signinput-Username',
                            placeholder: 'Username',
                            icon: 'fa-solid fa-user',
                            onInput: (val) => get.username(val)
                        })
                    ]
                }),
                // Right column
                $({
                    tag: 'div',
                    style: { width: '100%' },
                    child: [
                        ModernPasswordInput({
                            id: 'signup-password',
                            placeholder: 'Password',
                            icon: 'fa-solid fa-lock',
                            onInput: (val) => get.password(val)
                        }),
                        ModernPasswordInput({
                            id: 'signup-confirm-password',
                            placeholder: 'Re-enter password',
                            icon: 'fa-solid fa-lock',
                            onInput: (val) => get.conPass(val)
                        })
                    ]
                })
            ]
        })

        form.appendChild(twoColumnContainer)
        // Submit Button
        form.appendChild($({
            tag: 'button',
            att: {
                type: 'submit',
                id: 'signup-submit-btn'
            },
            text: 'Create Account',
            style: {
                width: '100%',
                background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                border: 'none',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#fff',
                marginTop: '1.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
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

                    const remove = () => {
                        if (loading && loading.parentNode) {
                            loading.remove()
                        }
                    }

                    try {
                        const res = await fetch('/loginAuth', {
                            method: "POST",
                            body: formData
                        });

                        const rawText = await res.text();
                        console.log('Raw server response:', rawText);

                        let dat;
                        try {
                            dat = JSON.parse(rawText);
                        } catch (parseError) {
                            console.error('Failed to parse JSON:', parseError);
                            remove();
                            alert("Server returned an invalid response. Please check the console.");
                            return;
                        }

                        remove();

                        if (dat.status === true) {
                            // SUCCESS - Show confirmation
                            document.body.appendChild(ConfirmationAlert(
                                "Your account has been successfully created!\nPlease check your email to verify your account.",
                                () => {
                                    window.location.replace('/account/Login')
                                }
                            ))
                        } else {
                            // ERROR - Show the error message
                            document.body.appendChild(ConfirmationAlert(
                                dat.message || "Registration failed. Please try again.",
                                () => {
                                    window.location.reload()
                                }
                            ))
                        }
                    } catch (error) {
                        remove()
                        console.error('Signup error:', error)
                        alert("An error occurred during registration. Please try again.")
                    }
                }
            }
        }))

        container.appendChild(form)
    }

    return $({
        tag: 'div',
        att: { className: 'logInDiv signIn' },
        style: { width: '100%', maxWidth: '800px', margin: '0 auto' },
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
            marginBottom: '0.5rem',
            padding: '0.5rem 0',
            backgroundColor: 'transparent'
        },
        child: [
            // Logo Image
            $({
                tag: 'img',
                att: {
                    src: '/client/images/cap.png',
                    alt: 'CAPSU Logo'
                },
                style: {
                    width: '64px',
                    height: '64px',
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
                            color: '#1a2a3a',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            fontFamily: 'Inter, Segoe UI, Poppins, system-ui, sans-serif',
                            padding: '0.25rem 0',
                            borderBottom: '2px solid #0d6efd'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'Center of Academic Excellence Delivering Quality Service to All',
                        style: {
                            color: '#6c757d',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.5rem 0 0.25rem',
                            fontFamily: 'Inter, Segoe UI, system-ui, sans-serif',
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
        const currentPath = window.location.href.replace(window.location.origin, '');

        if (currentPath === '/account/Login?' || currentPath === '/account/Login') {
            // Use a span with click handler instead of static HTML
            val.innerHTML = '';

            const linkSpan = document.createElement('span');
            linkSpan.style.cssText = `
                color: #0d6efd;
                text-decoration: none;
                font-size: 0.85rem;
                font-family: 'Inter', 'Segoe UI', sans-serif;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
            `;
            linkSpan.textContent = 'Create an account';

            linkSpan.addEventListener('mouseenter', () => {
                linkSpan.style.color = '#0a58ca';
                linkSpan.style.backgroundColor = '#f8f9fa';
            });

            linkSpan.addEventListener('mouseleave', () => {
                linkSpan.style.color = '#0d6efd';
                linkSpan.style.backgroundColor = 'transparent';
            });

            linkSpan.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.assign('/account/Signup?');
            });

            val.appendChild(linkSpan);

            const noteSpan = document.createElement('span');
            noteSpan.style.cssText = `
                font-size: 0.85rem;
                color: #6c757d;
                font-family: Inter, Segoe UI, sans-serif;
                margin-left: 4px;
            `;
            noteSpan.textContent = ' (for CAPSU Research & Extension users only)';
            val.appendChild(noteSpan);

        } else if (currentPath === '/account/Signup?' || currentPath === '/account/Signup') {
            val.innerHTML = `<a href="/account/Login?" style="
                color: #0d6efd;
                text-decoration: none;
                font-size: 0.85rem;
                font-family: 'Inter', 'Segoe UI', sans-serif;
                font-weight: 600;
                transition: all 0.3s ease;
                cursor: pointer;
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
            " onmouseover="this.style.color='#0a58ca'; this.style.backgroundColor='#f8f9fa';" 
            onmouseout="this.style.color='#0d6efd'; this.style.backgroundColor='transparent';">Log in</a>`
        }
    }

    const getCLS = (cls) => {
        clsObj = cls
        clsObj.style.backgroundColor = 'transparent'
        clsObj.style.borderRadius = '16px'
        clsObj.style.padding = '2rem'

        const currentPath = window.location.href.replace(window.location.origin, '');

        if (currentPath === '/account/Login?' || currentPath === '/account/Login') {
            clsObj.appendChild(LoginPanel())
        } else if (currentPath === '/account/Signup?' || currentPath === '/account/Signup') {
            clsObj.appendChild(Signup())
        }
    }

    const ChangePanel = () => {
        return $({
            tag: 'div',
            elementHandler: getBot,
            att: { className: 'butDiv' },
            style: {
                marginBottom: '2vh',
                textAlign: 'center',
                color: '#0d6efd',
                fontFamily: 'Inter, Segoe UI, sans-serif',
                fontSize: '0.85rem',
                fontWeight: '500'
            },
            text: 'Login?',
            event: {
                type: 'click',
                method: () => {
                    const currentPath = window.location.href.replace(window.location.origin, '');
                    if (currentPath === '/account/Login?' || currentPath === '/account/Login') {
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
            $({
                tag: 'div',
                elementHandler: getCLS,
                att: { className: "clogOrSig" }
            }),
            ChangePanel(),
            $({
                tag: 'a',
                style: {
                    fontFamily: 'Inter, Segoe UI, sans-serif',
                    color: '#0d6efd',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    marginTop: '1rem',
                    width: 'fit-content',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'block',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                },
                text: 'Forgot password?',
                event: {
                    type: 'click',
                    method: (e) => {
                        e.preventDefault()
                        showPasswordResetModal()
                    }
                },
                mouseenter: (e) => {
                    e.target.style.backgroundColor = '#f8f9fa'
                    e.target.style.color = '#0a58ca'
                },
                mouseleave: (e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#0d6efd'
                }
            })
        ]
    })
}
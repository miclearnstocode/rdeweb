import { $, CapsuOffice, ConfirmationAlert, Request, SpecialChar, Waiting, CustomModal } from '../lib/lib.js'
import { showPasswordResetModal } from "./../AccountRetrival/Code.js"
import { SplashScreen } from '../component/SplashScreen.js';

const LoginPanel = (prop) => {
    let username
    let password
    let form
    let UserTypeStat = true
    let selType
    let isSubmitting = false
    let rememberMe = false

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
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'col-md-12'
                },
                style: {
                    width: '100%',
                    maxWidth: '440px',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '40px 36px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)'
                },
                child: [
                    // Welcome Section (LEFT ALIGNED)
                    $({
                        tag: 'div',
                        style: {
                            textAlign: 'left',
                            marginBottom: '32px',
                            width: '100%'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'h2',
                                        style: {
                                            color: '#1a2a3a',
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            margin: '0',
                                            fontFamily: 'Inter, Segoe UI, sans-serif',
                                            letterSpacing: '-0.5px',
                                            borderLeft: '4px solid #0d6efd',
                                            borderRadius: '6px', 
                                            paddingLeft: '12px' 
                                        },
                                        text: 'Welcome Back'
                                    }),
                                ]
                            }),
                            $({
                                tag: 'p',
                                style: {
                                    color: '#6c757d',
                                    fontSize: '14px',
                                    marginTop: '0',
                                    marginBottom: '0',
                                    fontFamily: 'Inter, Segoe UI, sans-serif',
                                    fontWeight: '400',
                                    lineHeight: '1.5'
                                },
                                text: 'Researcher, Innovators, Extension Implementer & Evaluators sign in to access your account.'
                            })
                        ]
                    }),
                    // Form
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
                                const originalBtnText = submitBtn?.innerHTML || 'Sign In'
                                if (submitBtn) {
                                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...'
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
                            // Username Field
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    marginBottom: '20px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        att: {
                                            for: 'userNid'
                                        },
                                        text: 'Email or Username',
                                        style: {
                                            display: 'block',
                                            color: '#1a2a3a',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            marginBottom: '6px',
                                            fontFamily: 'Inter, Segoe UI, sans-serif',
                                            textAlign: 'left' // Force left alignment
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
                                                tag: 'input',
                                                att: {
                                                    type: 'text',
                                                    className: 'form-control',
                                                    name: 'username',
                                                    id: 'userNid',
                                                    placeholder: 'Enter your email or username',
                                                    required: true,
                                                    autocomplete: 'username'
                                                },
                                                style: {
                                                    backgroundColor: '#f8f9fa',
                                                    color: '#1a2a3a',
                                                    border: '1.5px solid #e8ecf0',
                                                    borderRadius: '12px',
                                                    height: '48px',
                                                    width: '100%',
                                                    padding: '0 16px',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none',
                                                    fontFamily: 'Inter, Segoe UI, sans-serif'
                                                },
                                                event: [
                                                    {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#0d6efd'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(13, 110, 253, 0.08)'
                                                        }
                                                    },
                                                    {
                                                        type: 'blur',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#e8ecf0'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
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
                                    marginBottom: '16px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        att: {
                                            for: 'userPid'
                                        },
                                        text: 'Password',
                                        style: {
                                            display: 'block',
                                            color: '#1a2a3a',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            marginBottom: '6px',
                                            fontFamily: 'Inter, Segoe UI, sans-serif',
                                            textAlign: 'left' // Force left alignment
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
                                                tag: 'input',
                                                att: {
                                                    type: 'password',
                                                    className: 'form-control password-input',
                                                    name: 'password',
                                                    id: 'userPid',
                                                    placeholder: 'Enter your password',
                                                    required: true,
                                                    autocomplete: 'current-password'
                                                },
                                                style: {
                                                    backgroundColor: '#f8f9fa',
                                                    color: '#1a2a3a',
                                                    border: '1.5px solid #e8ecf0',
                                                    borderRadius: '12px',
                                                    height: '48px',
                                                    width: '100%',
                                                    padding: '0 48px 0 16px',
                                                    fontSize: '14px',
                                                    boxSizing: 'border-box',
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none',
                                                    fontFamily: 'Inter, Segoe UI, sans-serif'
                                                },
                                                event: [
                                                    {
                                                        type: 'focus',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#0d6efd'
                                                            e.target.style.backgroundColor = '#ffffff'
                                                            e.target.style.boxShadow = '0 0 0 4px rgba(13, 110, 253, 0.08)'
                                                        }
                                                    },
                                                    {
                                                        type: 'blur',
                                                        method: (e) => {
                                                            e.target.style.borderColor = '#e8ecf0'
                                                            e.target.style.backgroundColor = '#f8f9fa'
                                                            e.target.style.boxShadow = 'none'
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
                                                            pointerEvents: 'none',
                                                            fontSize: '16px'
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
                            // Remember Me & Forgot Password
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between', // Changed from 'flex-start' to 'space-between'
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                    width: '100%'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'checkbox',
                                                    id: 'rememberMe',
                                                    name: 'rememberMe'
                                                },
                                                style: {
                                                    width: '16px',
                                                    height: '16px',
                                                    accentColor: '#0d6efd',
                                                    cursor: 'pointer'
                                                },
                                                event: {
                                                    type: 'change',
                                                    method: (e) => {
                                                        rememberMe = e.target.checked
                                                    }
                                                }
                                            }),
                                            $({
                                                tag: 'label',
                                                att: {
                                                    for: 'rememberMe'
                                                },
                                                text: 'Remember me',
                                                style: {
                                                    color: '#495057',
                                                    fontSize: '13px',
                                                    fontFamily: 'Inter, Segoe UI, sans-serif',
                                                    cursor: 'pointer',
                                                    fontWeight: '400'
                                                }
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'a',
                                        style: {
                                            fontFamily: 'Inter, Segoe UI, sans-serif',
                                            color: '#0d6efd',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
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
                                            e.target.style.color = '#0a58ca'
                                            e.target.style.backgroundColor = '#f0f7ff'
                                        },
                                        mouseleave: (e) => {
                                            e.target.style.color = '#0d6efd'
                                            e.target.style.backgroundColor = 'transparent'
                                        }
                                    })
                                ]
                            }),
                            // Sign In Button
                            $({
                                tag: 'button',
                                att: {
                                    className: 'btn btn-primary submitLog',
                                    type: 'submit'
                                },
                                style: {
                                    width: '100%',
                                    background: '#0d6efd',
                                    border: 'none',
                                    padding: '14px 24px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 14px rgba(13, 110, 253, 0.3)',
                                    textAlign: 'center',
                                    fontFamily: 'Inter, Segoe UI, sans-serif'
                                },
                                text: 'Sign In',
                                event: [
                                    {
                                        type: 'mouseenter',
                                        method: (e) => {
                                            e.target.style.transform = 'translateY(-2px)'
                                            e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)'
                                            e.target.style.background = '#0a58ca'
                                        }
                                    },
                                    {
                                        type: 'mouseleave',
                                        method: (e) => {
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 4px 14px rgba(13, 110, 253, 0.3)'
                                            e.target.style.background = '#0d6efd'
                                        }
                                    }
                                ]
                            }),
                            // Sign Up Link
                            $({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    marginTop: '20px',
                                    fontFamily: 'Inter, Segoe UI, sans-serif'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: "Don't have an account? ",
                                        style: {
                                            color: '#6c757d',
                                            fontSize: '14px'
                                        }
                                    }),
                                    $({
                                        tag: 'a',
                                        text: 'Sign up',
                                        style: {
                                            color: '#0d6efd',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                e.preventDefault()
                                                window.location.assign('/account/Signup?')
                                            }
                                        },
                                        mouseenter: (e) => {
                                            e.target.style.color = '#0a58ca'
                                            e.target.style.textDecoration = 'underline'
                                        },
                                        mouseleave: (e) => {
                                            e.target.style.color = '#0d6efd'
                                            e.target.style.textDecoration = 'none'
                                        }
                                    })
                                ]
                            }),
                            // Copyright Footer
                            $({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    marginTop: '24px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #e8ecf0',
                                    fontFamily: 'Inter, Segoe UI, sans-serif',
                                    fontSize: '12px',
                                    color: '#adb5bd'
                                },
                                text: '© 2026 Capiz State University. All rights reserved.'
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
    let isSubmitting = false

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

    // Modern Select Component (Used in Modal and Main Form)
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

    // ------- CREATE ROLE MODAL FUNCTION -------
    const createRoleModal = (onConfirm) => {
        let selectedRole = '';
        let selectedCampus = '';
        let selectedCenter = '';

        // Native CSS Toggle Helper
        const modalAnimateToggle = (element, show) => {
            if (!element) return;
            if (show) {
                element.style.display = 'block';
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    element.style.maxHeight = '200px';
                });
            } else {
                element.style.opacity = '0';
                element.style.transform = 'translateY(-10px)';
                element.style.maxHeight = '0px';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 300);
            }
        };

        // Build the Modal Content
        const modalWrapper = $({
            tag: 'div',
            style: {
                position: 'fixed',
                top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: '9999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            },
            event: {
                type: 'click',
                method: (e) => { if (e.target === e.currentTarget) e.currentTarget.remove(); }
            }
        });

        const modalCard = $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '40px 36px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                transform: 'scale(0.9)',
                transition: 'transform 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                $({
                    tag: 'h2',
                    text: 'Select Your Role',
                    style: { marginBottom: '20px', color: '#1a2a3a', fontFamily: 'Inter, Segoe UI, sans-serif', textAlign: 'center' }
                }),
                
                // 1. Role Selection
                ModernSelect({
                    label: 'Select Role',
                    id: 'modal-role',
                    options: [
                        option({ label: '-- Select Role --', placeholder: true }),
                        option({ label: 'Research Campus Chair', value: 'research_chair' }),
                        option({ label: 'Research Center or Extension Chair', value: 'research_center_chair' })
                    ],
                    onchange: (e) => {
                        selectedRole = e.target.value;
                        const campusEl = document.getElementById('modal-campus-container');
                        const centerEl = document.getElementById('modal-center-container');
                        const extEl = document.getElementById('modal-extension-container');

                        // Reset Hidden
                        if(campusEl) { campusEl.style.display = 'none'; campusEl.style.opacity = '0'; }
                        if(centerEl) { centerEl.style.display = 'none'; centerEl.style.opacity = '0'; }
                        if(extEl) { extEl.style.display = 'none'; extEl.style.opacity = '0'; }
                        
                        selectedCampus = '';
                        selectedCenter = '';
                        if(document.getElementById('modal-campus')) document.getElementById('modal-campus').value = '';
                        if(document.getElementById('modal-center')) document.getElementById('modal-center').value = '';
                        if(document.getElementById('modal-extension')) document.getElementById('modal-extension').value = '';

                        if (selectedRole === 'research_chair') {
                            modalAnimateToggle(campusEl, true);
                        } else if (selectedRole === 'research_center_chair') {
                            modalAnimateToggle(centerEl, true);
                        }
                    }
                }),

                // 2. Campus (Hidden by default)
                $({
                    tag: 'div',
                    att: { id: 'modal-campus-container' },
                    style: { display: 'none', opacity: '0', transform: 'translateY(-10px)', transition: 'all 0.3s ease', maxHeight: '0', overflow: 'hidden' },
                    child: [
                        ModernSelect({
                            label: 'Select Campus',
                            id: 'modal-campus',
                            options: [option({ label: '-- Select Campus --', placeholder: true }), ...campuses.map(val => option({ label: val, value: val }))],
                            onchange: (e) => { selectedCampus = e.target.value; }
                        })
                    ]
                }),

                // 3. Center (Hidden by default)
                $({
                    tag: 'div',
                    att: { id: 'modal-center-container' },
                    style: { display: 'none', opacity: '0', transform: 'translateY(-10px)', transition: 'all 0.3s ease', maxHeight: '0', overflow: 'hidden' },
                    child: [
                        ModernSelect({
                            label: 'Select Research Center or Extension',
                            id: 'modal-center',
                            options: [option({ label: '-- Select Research Center or Extension --', placeholder: true }), ...CapsuOffice.map(val => {
                                let code = val; const match = val.match(/\(([^)]+)\)/); if(match) code = match[1]; else if(val === "Extension") code = "Extension";
                                return option({ label: val, value: code });
                            })],
                            onchange: (e) => {
                                selectedCenter = e.target.value;
                                const extEl = document.getElementById('modal-extension-container');
                                if(extEl) { extEl.style.display = 'none'; extEl.style.opacity = '0'; }
                                selectedCampus = '';
                                if(document.getElementById('modal-extension')) document.getElementById('modal-extension').value = '';
                                if (selectedCenter === 'Extension') {
                                    modalAnimateToggle(extEl, true);
                                }
                            }
                        })
                    ]
                }),

                // 4. Extension Campus (Hidden by default)
                $({
                    tag: 'div',
                    att: { id: 'modal-extension-container' },
                    style: { display: 'none', opacity: '0', transform: 'translateY(-10px)', transition: 'all 0.3s ease', maxHeight: '0', overflow: 'hidden' },
                    child: [
                        ModernSelect({
                            label: 'Select Extension Campus',
                            id: 'modal-extension',
                            options: [option({ label: '-- Select Campus --', placeholder: true }), ...campuses.map(val => option({ label: val, value: val }))],
                            onchange: (e) => { selectedCampus = e.target.value; }
                        })
                    ]
                }),

                // Action Buttons
                $({
                    tag: 'div',
                    style: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 20px', borderRadius: '8px', border: '1px solid #e8ecf0', 
                                backgroundColor: '#ffffff', color: '#6c757d', cursor: 'pointer', fontFamily: 'Inter, Segoe UI, sans-serif'
                            },
                            event: {
                                type: 'click',
                                method: () => { modalWrapper.remove(); }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Confirm Role',
                            style: {
                                padding: '10px 20px', borderRadius: '8px', border: 'none',
                                backgroundColor: '#0d6efd', color: '#ffffff', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, Segoe UI, sans-serif'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    if (!selectedRole) { alert("Please select a role."); return; }
                                    if (selectedRole === 'research_chair' && !selectedCampus) { alert("Please select a Campus."); return; }
                                    if (selectedRole === 'research_center_chair') {
                                        if (!selectedCenter) { alert("Please select a Research Center or Extension."); return; }
                                        if (selectedCenter === 'Extension' && !selectedCampus) { alert("Please select an Extension Campus."); return; }
                                    }
                                    modalWrapper.remove();
                                    onConfirm(selectedRole, selectedCenter, selectedCampus);
                                }
                            }
                        })
                    ]
                })
            ]
        });

        modalWrapper.appendChild(modalCard);
        document.body.appendChild(modalWrapper);

        // Animate In
        setTimeout(() => {
            modalWrapper.style.opacity = '1';
            modalCard.style.transform = 'scale(1)';
        }, 50);
    };

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
                textAlign: 'left',
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

        // Main UI - Display selected role and a button to change it
        const roleDisplayContainer = $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '1.5rem'
            },
            child: [
                $({
                    tag: 'div',
                    style: { display: 'flex', flexDirection: 'column' },
                    child: [
                        $({
                            tag: 'span',
                            text: 'Selected Role',
                            style: { fontSize: '12px', color: '#6c757d', fontFamily: 'Inter, Segoe UI, sans-serif' }
                        }),
                        $({
                            tag: 'span',
                            att: { id: 'displayed-role-text' },
                            text: 'None selected',
                            style: { fontWeight: '600', fontSize: '15px', color: '#1a2a3a', fontFamily: 'Inter, Segoe UI, sans-serif' }
                        })
                    ]
                }),
                $({
                    tag: 'button',
                    att: { id: 'open-role-modal-btn' },
                    text: 'Choose Role',
                    style: {
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#0d6efd', color: '#ffffff', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, Segoe UI, sans-serif',
                        transition: 'all 0.3s ease'
                    },
                    event: {
                        type: 'click',
                        method: (e) => {
                            createRoleModal((role, centerVal, campusVal) => {
                                userRole = role;
                                center = centerVal;
                                campus = campusVal;
                                
                                const displayText = document.getElementById('displayed-role-text');
                                if(displayText) {
                                    let text = role === 'research_chair' ? 'Research Campus Chair' : 'Research Center or Extension Chair';
                                    if(campusVal) text += ` (${campusVal})`;
                                    if(centerVal && centerVal !== 'Extension') text += ` (${centerVal})`;
                                    if(centerVal === 'Extension') text += ` (Extension - ${campusVal})`;
                                    displayText.innerText = text;
                                }
                            });
                        }
                    },
                    mouseenter: (e) => { e.target.style.backgroundColor = '#0a58ca'; },
                    mouseleave: (e) => { e.target.style.backgroundColor = '#0d6efd'; }
                })
            ]
        });

        form.appendChild(roleDisplayContainer);

        // 1. Full Name - Full width
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

                    // IDEMPOTENCY LOCK: Check if a request is already ongoing
                    if (isSubmitting) {
                        console.warn("Request already in progress. Dropping duplicate click.");
                        return;
                    }
                    isSubmitting = true; // Lock it

                    // Save reference to the button to restore it later
                    const submitBtn = document.getElementById('signup-submit-btn');
                    const originalBtnText = submitBtn ? submitBtn.innerText : 'Create Account';
                    
                    if (submitBtn) {
                        submitBtn.innerText = 'Creating...';
                        submitBtn.style.opacity = '0.7';
                        submitBtn.style.cursor = 'not-allowed';
                    }

                    if (userRole === undefined) {
                        alert("Please select a role by clicking the 'Choose Role' button.")
                        isSubmitting = false;
                        if (submitBtn) {
                            submitBtn.innerText = originalBtnText;
                            submitBtn.style.opacity = '1';
                            submitBtn.style.cursor = 'pointer';
                        }
                        return
                    }

                    if (userRole === 'research_chair') {
                        if (campus === undefined) {
                            alert("Please select a Campus inside the Role Selection modal.")
                            isSubmitting = false;
                            if (submitBtn) {
                                submitBtn.innerText = originalBtnText;
                                submitBtn.style.opacity = '1';
                                submitBtn.style.cursor = 'pointer';
                            }
                            return
                        }
                    } else if (userRole === 'research_center_chair') {
                        if (center === undefined) {
                            alert("Please select a Research Center inside the Role Selection modal.")
                            isSubmitting = false;
                            if (submitBtn) {
                                submitBtn.innerText = originalBtnText;
                                submitBtn.style.opacity = '1';
                                submitBtn.style.cursor = 'pointer';
                            }
                            return
                        }
                        if (center === 'Extension' && campus === undefined) {
                            alert("Please select an Extension Campus inside the Role Selection modal.")
                            isSubmitting = false;
                            if (submitBtn) {
                                submitBtn.innerText = originalBtnText;
                                submitBtn.style.opacity = '1';
                                submitBtn.style.cursor = 'pointer';
                            }
                            return
                        }
                    }

                    if (email === undefined) { alert("E-Mail is missing..!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }
                    if (fullName === undefined) { alert("Full name is missing..!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }
                    if (username === undefined) { alert("Username is missing..!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }
                    if (password === undefined) { alert("Password is missing..!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }
                    if (password.length < 8) { alert("Please provide at least 8 characters password...!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }
                    if (password !== conPass) { alert("Passwords do not match!"); isSubmitting = false; if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; } return; }

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
                            isSubmitting = false; // UNLOCK on error
                            if(submitBtn){ submitBtn.innerText=originalBtnText; submitBtn.style.opacity='1'; submitBtn.style.cursor='pointer'; }
                            alert("Server returned an invalid response. Please check the console.");
                            return;
                        }

                        remove();

                        if (dat.status === true) {
                            document.body.appendChild(ConfirmationAlert(
                                "Your account has been successfully created!\nPlease check your email to verify your account.",
                                () => {
                                    window.location.replace('/account/Login')
                                }
                            ))
                        } else {
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
                    } finally {
                        isSubmitting = false; // UNLOCK finally
                        if(submitBtn){ 
                            submitBtn.innerText = originalBtnText; 
                            submitBtn.style.opacity = '1'; 
                            submitBtn.style.cursor = 'pointer'; 
                        }
                    }
                }
            }
        }))

        // Login Link
        form.appendChild($({
            tag: 'div',
            style: {
                textAlign: 'center',
                marginTop: '16px',
                fontFamily: 'Inter, Segoe UI, sans-serif'
            },
            child: [
                $({
                    tag: 'span',
                    text: "Already have an account? ",
                    style: {
                        color: '#6c757d',
                        fontSize: '14px'
                    }
                }),
                $({
                    tag: 'a',
                    text: 'Sign in',
                    style: {
                        color: '#0d6efd',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.preventDefault()
                            window.location.assign('/account/Login?')
                        }
                    },
                    mouseenter: (e) => {
                        e.target.style.color = '#0a58ca'
                        e.target.style.textDecoration = 'underline'
                    },
                    mouseleave: (e) => {
                        e.target.style.color = '#0d6efd'
                        e.target.style.textDecoration = 'none'
                    }
                })
            ]
        }))

        // --- Append only the card WITH THE HEADER ---
        container.appendChild($({
            tag: 'div',
            style: {
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '40px 36px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)'
            },
            child: [
                // Welcome Header (RESTORED)
                $({
                    tag: 'div',
                    style: {
                        textAlign: 'left',
                        marginBottom: '24px',
                        width: '100%'
                    },
                    child: [
                        $({
                            tag: 'h2',
                            style: {
                                color: '#1a2a3a',
                                fontSize: '24px',
                                fontWeight: '700',
                                marginBottom: '6px',
                                fontFamily: 'Inter, Segoe UI, sans-serif',
                                letterSpacing: '-0.5px'
                            },
                            text: 'Create Account'
                        }),
                        $({
                            tag: 'p',
                            style: {
                                color: '#6c757d',
                                fontSize: '14px',
                                marginTop: '0',
                                marginBottom: '0',
                                fontFamily: 'Inter, Segoe UI, sans-serif',
                                fontWeight: '400',
                                lineHeight: '1.5'
                            },
                            text: 'Register as a Research or Extension Chair to access RDE services.'
                        })
                    ]
                }),
                form
            ]
        }))
    }

    return $({
        tag: 'div',
        att: { className: 'logInDiv signIn' },
        style: {             
            width: '100%', 
            height: '100%', 
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center' },
        elementHandler: getContainer
    })
}

const logo = () => {
    return $({
        tag: 'div',
        style: {
            display: 'none'
        }
    })
}

export const LoginPage = () => {
    let clsObj

    const getCLS = (cls) => {
        clsObj = cls
        clsObj.style.width = '100%'
        clsObj.style.height = '100%'
        clsObj.style.display = 'flex'
        clsObj.style.justifyContent = 'center'
        clsObj.style.alignItems = 'center'
        
        const currentPath = window.location.href.replace(window.location.origin, '');

        // Determine which component to render
        const isLogin = currentPath === '/account/Login?' || currentPath === '/account/Login';
        const isSignup = currentPath === '/account/Signup?' || currentPath === '/account/Signup';

        if (isLogin || isSignup) {
            clsObj.style.maxWidth = '100%'
            clsObj.style.padding = '0'
            clsObj.style.backgroundColor = '#ffffff'
            
            // Create Split Container
            const splitContainer = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    height: '100vh',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    borderRadius: '0'
                },
                child: [
                    // LEFT PANEL
                    $({
                        tag: 'div',
                        style: {
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '40px',
                            position: 'relative',
                            opacity: '0.70',
                            backgroundImage: 'url("/client/images/building.png")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.85) 100%), url("/client/images/building.png") center/cover no-repeat',
                            height: '100%',
                            '@media (max-width: 992px)': {
                                display: 'none'
                            }
                        },
                        child: [
                            // Logo & Title Section (Centered perfectly)
                            $({
                                tag: 'div',
                                style: {
                                    textAlign: 'center',
                                    marginBottom: '40px',
                                    zIndex: '2',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    width: '100%'
                                },
                                child: [
                                    // Floating Logo
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'relative',
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '-10px'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '120px',
                                                    height: '120px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                    borderRadius: '50%',
                                                    zIndex: '1',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                                }
                                            }),
                                            $({
                                                tag: 'img',
                                                att: {
                                                    src: '/client/images/cap.png',
                                                    alt: 'CAPSU Logo',
                                                    width: '100',
                                                    height: '100'
                                                },
                                                style: {
                                                    width: '110px',
                                                    height: '110px',
                                                    objectFit: 'contain',
                                                    position: 'relative',
                                                    zIndex: '2'
                                                }
                                            })
                                        ]
                                    }),
                                    // CAPSU Title
                                    $({
                                        tag: 'h2',
                                        text: 'CAPSU',
                                        style: {
                                            color: '#1a2a3a',
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            marginTop: '50px',
                                            marginBottom: '0',
                                            fontFamily: 'Inter, Segoe UI, sans-serif'
                                        }
                                    }),
                                    // Full University Name
                                    $({
                                        tag: 'h1',
                                        text: 'Capiz State University',
                                        style: {
                                            color: '#1a2a3a',
                                            fontSize: '32px',
                                            fontWeight: '700',
                                            marginTop: '0',
                                            fontFamily: 'Inter, Segoe UI, sans-serif'
                                        }
                                    }),
                                    // Tagline
                                    $({
                                        tag: 'p',
                                        text: 'Public · Intellectual · Creative · Innovative',
                                        style: {
                                            color: '#495057',
                                            fontSize: '14px',
                                            marginTop: '4px',
                                            marginBottom: '10px',
                                            fontFamily: 'Inter, Segoe UI, sans-serif'
                                        }
                                    })
                                ]
                            }),
                            // Conference Room Image Box (Better spacing and alignment)
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    maxWidth: '420px',
                                    height: '240px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                                    position: 'relative',
                                    zIndex: '2',
                                    backgroundImage: 'url("/client/images/gerry.png")',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '0'
                                },
                                child: [
                                    // Dark gradient overlay for better text readability
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            bottom: '0',
                                            left: '0',
                                            width: '100%',
                                            padding: '24px 28px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                                            color: '#ffffff'
                                        },
                                        child: [
                                            $({
                                                tag: 'h3',
                                                text: 'Research',
                                                style: { margin: '0', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }
                                            }),
                                            $({
                                                tag: 'h3',
                                                text: 'Development &',
                                                style: { margin: '0', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }
                                            }),
                                            $({
                                                tag: 'h3',
                                                text: 'Extension',
                                                style: { margin: '0', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    // RIGHT PANEL
                    $({
                        tag: 'div',
                        style: {
                            flex: '1',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa',
                            padding: '40px',
                            height: '100vh',
                            '@media (max-width: 992px)': {
                                flex: '1 1 100%',
                                padding: '20px',
                                height: 'auto',
                                minHeight: '100vh'
                            }
                        },
                        child: [
                            isLogin ? LoginPanel() : Signup()
                        ]
                    })
                ]
            });
            
            clsObj.appendChild(splitContainer);
        }
    }

    // --- START: SPLASH SCREEN LOGIC ---
    const currentPath = window.location.href.replace(window.location.origin, '');
    const isLogin = currentPath === '/account/Login?' || currentPath === '/account/Login';

    if (isLogin && !sessionStorage.getItem('splash_shown')) {
        const splash = SplashScreen(() => {
            sessionStorage.setItem('splash_shown', 'true');
        });
        document.body.appendChild(splash);
    }
    // --- END: SPLASH SCREEN LOGIC ---

    return $({
        tag: 'div',
        att: { className: 'LoginPageWrapper' },
        style: {
            width: '100%',
            height: '100vh',
            margin: '0',
            padding: '0',
            overflow: 'hidden'
        },
        child: [
            $({
                tag: 'div',
                elementHandler: getCLS,
                att: { className: "clogOrSig" }
            })
        ]
    })
}
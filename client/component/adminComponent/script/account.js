import { $, ConfirmationAlert, Request, Waiting } from '../../../lib/lib.js'
import { Error } from "../../../error.js";

// Tab cache - prevent recreation
let tabCache = new Map();
let activePageInstance = null;

const capUser = () => {
    const mainPan = () => {
        let bo // For search functionality

        const Label = $({
            tag: 'div',
            style: {
                width: '100%',
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                color: '#1e293b',
                marginBottom: '16px',
                fontSize: '18px',
                letterSpacing: '-0.3px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-building'
                    },
                    style: {
                        fontSize: '20px',
                        color: '#3b82f6'
                    }
                }),
                $({
                    tag: 'span',
                    text: 'CAPSU Account Management'
                })
            ]
        })

        const showPasswordReset = (id, username) => {
            const modal = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '420px',
                            maxWidth: '92%',
                            height: 'fit-content',
                            backgroundColor: '#ffffff',
                            margin: 'auto',
                            padding: '32px',
                            borderRadius: '12px',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '20px',
                                    transition: 'all 0.2s ease',
                                    padding: '8px',
                                    borderRadius: '8px'
                                },
                                att: {
                                    className: 'fa-solid fa-times'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        modal.remove()
                                    },
                                    mouseover: (e) => {
                                        e.target.style.color = '#1e293b'
                                        e.target.style.backgroundColor = '#f1f5f9'
                                    },
                                    mouseout: (e) => {
                                        e.target.style.color = '#94a3b8'
                                        e.target.style.backgroundColor = 'transparent'
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '20px',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '-0.3px'
                                },
                                text: 'Reset Password'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    padding: '8px 0',
                                    borderBottom: '1px solid #f1f5f9'
                                },
                                text: `Reset password for: ${username}`
                            }),

                            // New Password Field with Eye Icon
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '16px',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            zIndex: '1'
                                        },
                                        att: {
                                            className: 'fa-solid fa-lock'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            id: 'newPassword',
                                            placeholder: 'Enter new password'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 12px 10px 40px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#1e293b',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                        },
                                        event: {
                                            focus: (e) => {
                                                e.target.style.borderColor = '#3b82f6'
                                                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                                e.target.style.backgroundColor = '#ffffff'
                                            },
                                            blur: (e) => {
                                                e.target.style.borderColor = '#e2e8f0'
                                                e.target.style.boxShadow = 'none'
                                                e.target.style.backgroundColor = '#f8fafc'
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            zIndex: '1',
                                            transition: 'color 0.2s ease'
                                        },
                                        att: {
                                            className: 'fa-solid fa-eye-slash toggle-password',
                                            'data-target': 'newPassword'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                const target = document.getElementById('newPassword')
                                                const icon = e.target
                                                if (target.type === 'password') {
                                                    target.type = 'text'
                                                    icon.className = 'fa-solid fa-eye'
                                                } else {
                                                    target.type = 'password'
                                                    icon.className = 'fa-solid fa-eye-slash'
                                                }
                                            },
                                            mouseover: (e) => {
                                                e.target.style.color = '#3b82f6'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.color = '#94a3b8'
                                            }
                                        }
                                    })
                                ]
                            }),

                            // Confirm Password Field with Eye Icon
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '24px',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            zIndex: '1'
                                        },
                                        att: {
                                            className: 'fa-solid fa-lock'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            id: 'confirmPassword',
                                            placeholder: 'Confirm new password'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 12px 10px 40px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#1e293b',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                        },
                                        event: {
                                            focus: (e) => {
                                                e.target.style.borderColor = '#3b82f6'
                                                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                                e.target.style.backgroundColor = '#ffffff'
                                            },
                                            blur: (e) => {
                                                e.target.style.borderColor = '#e2e8f0'
                                                e.target.style.boxShadow = 'none'
                                                e.target.style.backgroundColor = '#f8fafc'
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            zIndex: '1',
                                            transition: 'color 0.2s ease'
                                        },
                                        att: {
                                            className: 'fa-solid fa-eye-slash toggle-password',
                                            'data-target': 'confirmPassword'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                const target = document.getElementById('confirmPassword')
                                                const icon = e.target
                                                if (target.type === 'password') {
                                                    target.type = 'text'
                                                    icon.className = 'fa-solid fa-eye'
                                                } else {
                                                    target.type = 'password'
                                                    icon.className = 'fa-solid fa-eye-slash'
                                                }
                                            },
                                            mouseover: (e) => {
                                                e.target.style.color = '#3b82f6'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.color = '#94a3b8'
                                            }
                                        }
                                    })
                                ]
                            }),

                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px'
                                },
                                child: [
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '8px 24px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            flex: '1'
                                        },
                                        text: 'Cancel',
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                modal.remove()
                                            },
                                            mouseover: (e) => {
                                                e.target.style.backgroundColor = '#f1f5f9'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.backgroundColor = 'transparent'
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '8px 24px',
                                            backgroundColor: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            flex: '1'
                                        },
                                        text: 'Reset Password',
                                        event: {
                                            type: 'click',
                                            method: async () => {
                                                const newPass = document.getElementById('newPassword').value
                                                const confirmPass = document.getElementById('confirmPassword').value

                                                if (!newPass || !confirmPass) {
                                                    alert('Please fill in both password fields')
                                                    return
                                                }

                                                if (newPass !== confirmPass) {
                                                    alert('Passwords do not match')
                                                    return
                                                }

                                                if (newPass.length < 6) {
                                                    alert('Password must be at least 6 characters long')
                                                    return
                                                }

                                                const form = new FormData()
                                                form.append('resetCapsuPassword', 'true')
                                                form.append('userID', id)
                                                form.append('newPassword', newPass)

                                                let loading = Waiting()
                                                document.body.appendChild(loading)

                                                try {
                                                    const response = await fetch('/deleteUser', {
                                                        method: 'POST',
                                                        body: form
                                                    })
                                                    const data = await response.json()

                                                    loading.remove()

                                                    if (data.status) {
                                                        modal.remove()
                                                        document.body.appendChild(ConfirmationAlert('Password reset successfully!', () => { }))
                                                    } else {
                                                        alert(data.message || 'Failed to reset password')
                                                    }
                                                } catch (error) {
                                                    loading.remove()
                                                    alert('An error occurred')
                                                }
                                            },
                                            mouseover: (e) => {
                                                e.target.style.backgroundColor = '#2563eb'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.backgroundColor = '#3b82f6'
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modal)
        }

        const container = () => {
            const list = ({ campusN, name, id, designation, email, username }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'transparent'
                    },
                    att: {
                        className: 'list-row'
                    },
                    event: {
                        mouseover: (e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: campusN || 'N/A',
                            style: {
                                width: '14%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#1e293b',
                                paddingLeft: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: designation || 'N/A',
                            style: {
                                width: '12%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: username,
                            style: {
                                width: '12%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '22%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-user-circle',
                                    },
                                    style: {
                                        color: '#3b82f6',
                                        fontSize: '14px',
                                        flexShrink: 0
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: name,
                                    style: {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            text: email,
                            style: {
                                width: '20%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '24%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                paddingRight: '12px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(59,130,246,0.06)',
                                        border: '1px solid rgba(59,130,246,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-key'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Reset Password',
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '12px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            showPasswordReset(id, username)
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(239,68,68,0.06)',
                                        border: '1px solid rgba(239,68,68,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-trash-can'
                                            },
                                            style: {
                                                color: '#ef4444',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Delete',
                                            style: {
                                                color: '#ef4444',
                                                fontSize: '12px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            if (confirm('Are you sure you want to delete this account?')) {
                                                const form = new FormData()
                                                form.append('deleteUser', 'true')
                                                form.append('userID', id)

                                                let loading = Waiting()
                                                document.body.appendChild(loading)

                                                try {
                                                    const response = await fetch('/deleteUser', {
                                                        method: 'POST',
                                                        body: form
                                                    })
                                                    const data = await response.json()

                                                    loading.remove()

                                                    if (data.status) {
                                                        document.body.appendChild(ConfirmationAlert('Account deleted successfully!', () => {
                                                            window.location.reload()
                                                        }))
                                                    } else {
                                                        alert(data.messages || 'Failed to delete account')
                                                    }
                                                } catch (error) {
                                                    loading.remove()
                                                    alert('An error occurred')
                                                }
                                            }
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }

            const getContainer = async (panel) => {
                bo = panel
                const req = new Request('/loader')
                req.Post([
                    {
                        name: 'allUserAdmin',
                        value: '0'
                    }
                ])
                req.Json()
                req.Send().then(data => {
                    data.reverse().forEach(val => {
                        panel.appendChild(list({
                            name: (val.fullName !== null) ? val.fullName : 'Name is empty',
                            campusN: val.center || 'N/A',
                            id: val.id,
                            designation: val.usertype || 'N/A',
                            email: val.email || 'N/A',
                            username: val.username
                        }))
                    })
                })
            }

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'calc(100% - 12vh)',
                    backgroundColor: '#ffffff',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    borderRadius: '0 0 8px 8px',
                    border: '1px solid #f1f5f9',
                    padding: '0 4px'
                },
                elementHandler: getContainer
            }))
        }

        const SearchBar = () => {
            return ($({
                tag: 'div',
                style: {
                    height: '38px',
                    border: '1px solid #e2e8f0',
                    width: '250px',
                    borderRadius: '8px',
                    display: 'flex',
                    padding: '0 12px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                },
                event: {
                    focusin: (e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                        e.currentTarget.style.backgroundColor = '#ffffff'
                    },
                    focusout: (e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-search'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#94a3b8',
                            marginRight: '8px'
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Search accounts...'
                        },
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            height: '100%',
                            width: '100%',
                            color: '#1e293b',
                            fontSize: '14px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                        },
                        event: {
                            type: 'input',
                            method: (ev) => {
                                let list = bo.children
                                for (let val of list) {
                                    if (!val.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                        val.style.display = 'none'
                                    } else {
                                        val.style.display = 'flex'
                                    }
                                }
                            }
                        }
                    })
                ]
            }))
        }

        const Head = () => {
            const Leb = ({ label, width, align = 'left' }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: width,
                        textAlign: align,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '0 8px'
                    },
                    text: label
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    padding: '10px 0',
                    marginBottom: '4px',
                    borderBottom: '1px solid #e2e8f0',
                    minWidth: 'fit-content',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px 8px 0 0'
                },
                child: [
                    Leb({ label: 'CAMPUS/CENTER', width: '14%' }),
                    Leb({ label: 'USER TYPE', width: '12%' }),
                    Leb({ label: 'USERNAME', width: '12%' }),
                    Leb({ label: 'FULL NAME', width: '22%' }),
                    Leb({ label: 'EMAIL', width: '20%' }),
                    Leb({ label: '', width: '24%', align: 'center' })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '95%',
                margin: '1% auto',
                height: '98%',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '1400px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                    },
                    child: [
                        Label,
                        SearchBar()
                    ]
                }),
                Head(),
                container()
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'capAccPage'
        },
        style: {
            background: '#f8fafc',
            height: '100%',
            width: '100%'
        },
        child: [
            mainPan()
        ]
    }))
}

const evalPage = () => {
    const mainPan = () => {
        let bo
        const Label = $({
            tag: 'div',
            style: {
                width: '100%',
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                color: '#1e293b',
                marginBottom: '16px',
                fontSize: '18px',
                letterSpacing: '-0.3px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-users'
                    },
                    style: {
                        fontSize: '20px',
                        color: '#3b82f6'
                    }
                }),
                $({
                    tag: 'span',
                    text: 'Evaluators Account'
                })
            ]
        })

        const showPasswordReset = (id, username) => {
            const modal = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '420px',
                            maxWidth: '92%',
                            height: 'fit-content',
                            backgroundColor: '#ffffff',
                            margin: 'auto',
                            padding: '32px',
                            borderRadius: '12px',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '20px',
                                    transition: 'all 0.2s ease',
                                    padding: '8px',
                                    borderRadius: '8px'
                                },
                                att: {
                                    className: 'fa-solid fa-times'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        modal.remove()
                                    },
                                    mouseover: (e) => {
                                        e.target.style.color = '#1e293b'
                                        e.target.style.backgroundColor = '#f1f5f9'
                                    },
                                    mouseout: (e) => {
                                        e.target.style.color = '#94a3b8'
                                        e.target.style.backgroundColor = 'transparent'
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '20px',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '-0.3px'
                                },
                                text: 'Reset Password'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginBottom: '24px',
                                    textAlign: 'center',
                                    padding: '8px 0',
                                    borderBottom: '1px solid #f1f5f9'
                                },
                                text: `Reset password for: ${username}`
                            }),
                            // Password fields (same as capUser)
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '16px',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            zIndex: '1'
                                        },
                                        att: {
                                            className: 'fa-solid fa-lock'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            id: 'newPassword',
                                            placeholder: 'Enter new password'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 12px 10px 40px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#1e293b',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            zIndex: '1',
                                            transition: 'color 0.2s ease'
                                        },
                                        att: {
                                            className: 'fa-solid fa-eye-slash toggle-password',
                                            'data-target': 'newPassword'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                const target = document.getElementById('newPassword')
                                                const icon = e.target
                                                if (target.type === 'password') {
                                                    target.type = 'text'
                                                    icon.className = 'fa-solid fa-eye'
                                                } else {
                                                    target.type = 'password'
                                                    icon.className = 'fa-solid fa-eye-slash'
                                                }
                                            }
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '24px',
                                    position: 'relative'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            zIndex: '1'
                                        },
                                        att: {
                                            className: 'fa-solid fa-lock'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'password',
                                            id: 'confirmPassword',
                                            placeholder: 'Confirm new password'
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '10px 12px 10px 40px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#1e293b',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            zIndex: '1',
                                            transition: 'color 0.2s ease'
                                        },
                                        att: {
                                            className: 'fa-solid fa-eye-slash toggle-password',
                                            'data-target': 'confirmPassword'
                                        },
                                        event: {
                                            type: 'click',
                                            method: (e) => {
                                                const target = document.getElementById('confirmPassword')
                                                const icon = e.target
                                                if (target.type === 'password') {
                                                    target.type = 'text'
                                                    icon.className = 'fa-solid fa-eye'
                                                } else {
                                                    target.type = 'password'
                                                    icon.className = 'fa-solid fa-eye-slash'
                                                }
                                            }
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px'
                                },
                                child: [
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '8px 24px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            flex: '1'
                                        },
                                        text: 'Cancel',
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                modal.remove()
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '8px 24px',
                                            backgroundColor: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            flex: '1'
                                        },
                                        text: 'Reset Password',
                                        event: {
                                            type: 'click',
                                            method: async () => {
                                                const newPass = document.getElementById('newPassword').value
                                                const confirmPass = document.getElementById('confirmPassword').value

                                                if (!newPass || !confirmPass) {
                                                    alert('Please fill in both password fields')
                                                    return
                                                }

                                                if (newPass !== confirmPass) {
                                                    alert('Passwords do not match')
                                                    return
                                                }

                                                if (newPass.length < 6) {
                                                    alert('Password must be at least 6 characters long')
                                                    return
                                                }

                                                const form = new FormData()
                                                form.append('resetEvaluatorPassword', 'true')
                                                form.append('id', id)
                                                form.append('newPassword', newPass)

                                                let loading = Waiting()
                                                document.body.appendChild(loading)

                                                try {
                                                    const response = await fetch('/evaluatorReg', {
                                                        method: 'POST',
                                                        body: form
                                                    })
                                                    const data = await response.json()

                                                    loading.remove()

                                                    if (data.status) {
                                                        modal.remove()
                                                        document.body.appendChild(ConfirmationAlert('Password reset successfully!', () => { }))
                                                    } else {
                                                        alert(data.message || 'Failed to reset password')
                                                    }
                                                } catch (error) {
                                                    loading.remove()
                                                    alert('An error occurred')
                                                }
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modal)
        }

        const container = () => {
            const list = ({ fullName, category, username, id }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'transparent'
                    },
                    att: {
                        className: 'list-row'
                    },
                    event: {
                        mouseover: (e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '5%',
                                textAlign: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-user-circle',
                                    },
                                    style: {
                                        color: '#3b82f6',
                                        fontSize: '18px'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            text: fullName,
                            style: {
                                width: '30%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#1e293b',
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '12px'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: username,
                            style: {
                                width: '15%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#64748b'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: category,
                            style: {
                                width: '15%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#64748b'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '25%',
                                textAlign: 'left'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: 'rgba(59,130,246,0.06)',
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(59,130,246,0.12)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-key'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Reset Password',
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '12px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            showPasswordReset(id, username)
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                                        }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '10%',
                                textAlign: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'inline-flex',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(239,68,68,0.06)',
                                        border: '1px solid rgba(239,68,68,0.12)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-trash-can'
                                            },
                                            style: {
                                                color: '#ef4444',
                                                fontSize: '12px'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            if (confirm('Are you sure you want to delete this evaluator?')) {
                                                const form = new FormData()
                                                form.append('deleteEval', 'true')
                                                form.append('id', id)
                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                await fetch('/evaluatorReg', {
                                                    body: form,
                                                    method: 'POST',
                                                }).then(res => {
                                                    if (res.ok) {
                                                        loading.remove()
                                                        return res.json()
                                                    }
                                                }).then(dat => {
                                                    if (dat.status) {
                                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                            window.location.reload()
                                                        }))
                                                    } else {
                                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                            window.location.reload()
                                                        }))
                                                    }
                                                })
                                            }
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }

            const getContainer = async (panel) => {
                bo = panel
                const form = new FormData()
                form.append('evaluatorsList', 'true')
                await fetch('/evaluatorReg', {
                    body: form,
                    method: 'POST',
                }).then(res => res.json())
                    .then(data => {
                        data.reverse().forEach(val => {
                            panel.appendChild(list({
                                fullName: val.fullname,
                                category: val.category,
                                id: val.id,
                                username: val.username
                            }))
                        })
                    })
            }

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'calc(100% - 12vh)',
                    backgroundColor: '#ffffff',
                    overflowY: 'auto',
                    borderRadius: '0 0 8px 8px',
                    border: '1px solid #f1f5f9',
                    padding: '0 4px'
                },
                elementHandler: getContainer
            }))
        }

        const SearchBar = () => {
            return ($({
                tag: 'div',
                style: {
                    height: '38px',
                    border: '1px solid #e2e8f0',
                    width: '250px',
                    borderRadius: '8px',
                    display: 'flex',
                    padding: '0 12px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                },
                event: {
                    focusin: (e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                        e.currentTarget.style.backgroundColor = '#ffffff'
                    },
                    focusout: (e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-search'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#94a3b8',
                            marginRight: '8px'
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            placeholder: 'Search evaluators...'
                        },
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            height: '100%',
                            width: '100%',
                            color: '#1e293b',
                            fontSize: '14px',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                        },
                        event: {
                            type: 'input',
                            method: (ev) => {
                                let list = bo.children
                                for (let val of list) {
                                    if (!val.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                        val.style.display = 'none'
                                    } else {
                                        val.style.display = 'flex'
                                    }
                                }
                            }
                        }
                    })
                ]
            }))
        }

        const Head = () => {
            const Leb = ({ label, width, align = 'left' }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: width,
                        textAlign: align,
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '0 8px'
                    },
                    text: label
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '100%',
                    padding: '10px 0',
                    marginBottom: '4px',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px 8px 0 0'
                },
                child: [
                    Leb({ label: '', width: '5%', align: 'center' }),
                    Leb({ label: 'FULL NAME', width: '30%' }),
                    Leb({ label: 'USERNAME', width: '15%' }),
                    Leb({ label: 'CATEGORY', width: '15%' }),
                    Leb({ label: '', width: '25%' }),
                    Leb({ label: '', width: '10%', align: 'center' }),
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '90%',
                margin: '1% auto',
                height: '98%',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '1400px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                    },
                    child: [
                        Label,
                        SearchBar()
                    ]
                }),
                Head(),
                container()
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'capAccPage'
        },
        style: {
            background: '#f8fafc',
            height: '100%',
            width: '100%'
        },
        child: [
            mainPan()
        ]
    }))
}

const rdePage = () => {
    let mainPan

    const FullList = (url) => {
        let bodyPan

        const SearchInput = () => {
            return ($({
                tag: 'div',
                style: {
                    height: '38px',
                    border: '1px solid #e2e8f0',
                    width: '250px',
                    borderRadius: '8px',
                    display: 'flex',
                    padding: '0 12px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                },
                event: {
                    focusin: (e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                        e.currentTarget.style.backgroundColor = '#ffffff'
                    },
                    focusout: (e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.backgroundColor = '#f8fafc'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-search'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#94a3b8',
                            marginRight: '8px'
                        }
                    }),
                    $({
                        tag: 'input',
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '14px',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                        },
                        att: {
                            placeholder: 'Search RDE staff...'
                        },
                        event: {
                            type: 'input',
                            method: (eve) => {
                                const child = bodyPan.childNodes
                                for (let val of child) {
                                    if (!val.innerText.toUpperCase().includes(eve.target.value.toUpperCase())) {
                                        val.style.display = 'none'
                                    } else {
                                        val.style.display = 'flex'
                                    }
                                }
                            }
                        }
                    })
                ]
            }))
        }

        const Body = () => {
            const PasswordResetCell = ({ accountID, email }) => {
                return ($({
                    tag: 'div',
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.12)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-key'
                            },
                            style: {
                                color: '#3b82f6',
                                fontSize: '12px'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Reset Password',
                            style: {
                                color: '#3b82f6',
                                fontSize: '12px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: '500'
                            }
                        })
                    ],
                    event: {
                        type: 'click',
                        method: (e) => {
                            e.stopPropagation()
                            showPasswordReset(accountID, email)
                        },
                        mouseover: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                        }
                    }
                }))
            }

            const list = (userName, email, accountID) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    },
                    att: {
                        className: 'listRde'
                    },
                    event: {
                        mouseover: (e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: userName,
                            style: {
                                width: '15%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#1e293b',
                                paddingLeft: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: email,
                            style: {
                                width: '40%',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '12px'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '20%',
                                display: 'flex',
                                justifyContent: 'center'
                            },
                            child: [
                                PasswordResetCell({ accountID, email: userName })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '25%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                paddingRight: '12px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(245,158,11,0.06)',
                                        border: '1px solid rgba(245,158,11,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-user-pen'
                                            },
                                            style: {
                                                color: '#f59e0b',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Edit',
                                            style: {
                                                color: '#f59e0b',
                                                fontSize: '12px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            if (typeof (history.pushState) !== 'undefined') {
                                                let obj = {
                                                    Title: 'RDE',
                                                    Url: url.replace('list', 'account/') + accountID
                                                }
                                                history.pushState(obj, obj.Title, obj.Url)
                                                mainPan.innerHTML = ''
                                                mainPan.appendChild(account())
                                            } else {
                                                window.location.assign(url.replace('list', 'account/') + accountID)
                                            }
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(239,68,68,0.06)',
                                        border: '1px solid rgba(239,68,68,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-trash-can'
                                            },
                                            style: {
                                                color: '#ef4444',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Delete',
                                            style: {
                                                color: '#ef4444',
                                                fontSize: '12px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: (e) => {
                                            e.stopPropagation()
                                            if (confirm("This operation cannot be undone. Would you like to proceed?")) {
                                                const req = new Request('/rdeaccreq')
                                                req.Post([
                                                    { name: 'deleteRDEaccount', value: '0' },
                                                    { name: 'userId', value: accountID }
                                                ])
                                                req.Json()
                                                req.Send().then(data => {
                                                    if (data.status) {
                                                        window.location.reload()
                                                    } else {
                                                        alert(data.message)
                                                    }
                                                })
                                            }
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }

            const showPasswordReset = (id, username) => {
                const modal = $({
                    tag: 'div',
                    style: {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(15,23,42,0.6)',
                        display: 'flex',
                        zIndex: '9999',
                        backdropFilter: 'blur(4px)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '420px',
                                maxWidth: '92%',
                                height: 'fit-content',
                                backgroundColor: '#ffffff',
                                margin: 'auto',
                                padding: '32px',
                                borderRadius: '12px',
                                position: 'relative',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        fontSize: '20px',
                                        transition: 'all 0.2s ease',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    att: {
                                        className: 'fa-solid fa-times'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            modal.remove()
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: '20px',
                                        color: '#1e293b',
                                        textAlign: 'center',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    },
                                    text: 'Reset Password'
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: '14px',
                                        color: '#64748b',
                                        marginBottom: '24px',
                                        textAlign: 'center',
                                        padding: '8px 0',
                                        borderBottom: '1px solid #f1f5f9'
                                    },
                                    text: `Reset password for: ${username}`
                                }),
                                // Password fields (simplified - reuse from above)
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '16px',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#94a3b8',
                                                fontSize: '14px',
                                                zIndex: '1'
                                            },
                                            att: {
                                                className: 'fa-solid fa-lock'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'password',
                                                id: 'newPassword',
                                                placeholder: 'Enter new password'
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px 10px 40px',
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                color: '#1e293b',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#94a3b8',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                zIndex: '1'
                                            },
                                            att: {
                                                className: 'fa-solid fa-eye-slash toggle-password',
                                                'data-target': 'newPassword'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    const target = document.getElementById('newPassword')
                                                    const icon = e.target
                                                    if (target.type === 'password') {
                                                        target.type = 'text'
                                                        icon.className = 'fa-solid fa-eye'
                                                    } else {
                                                        target.type = 'password'
                                                        icon.className = 'fa-solid fa-eye-slash'
                                                    }
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#94a3b8',
                                                fontSize: '14px',
                                                zIndex: '1'
                                            },
                                            att: {
                                                className: 'fa-solid fa-lock'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'password',
                                                id: 'confirmPassword',
                                                placeholder: 'Confirm new password'
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '10px 12px 10px 40px',
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                color: '#1e293b',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.2s ease',
                                                boxSizing: 'border-box',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#94a3b8',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                zIndex: '1'
                                            },
                                            att: {
                                                className: 'fa-solid fa-eye-slash toggle-password',
                                                'data-target': 'confirmPassword'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    const target = document.getElementById('confirmPassword')
                                                    const icon = e.target
                                                    if (target.type === 'password') {
                                                        target.type = 'text'
                                                        icon.className = 'fa-solid fa-eye'
                                                    } else {
                                                        target.type = 'password'
                                                        icon.className = 'fa-solid fa-eye-slash'
                                                    }
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '12px'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            style: {
                                                padding: '8px 24px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease',
                                                flex: '1'
                                            },
                                            text: 'Cancel',
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    modal.remove()
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            style: {
                                                padding: '8px 24px',
                                                backgroundColor: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease',
                                                flex: '1'
                                            },
                                            text: 'Reset Password',
                                            event: {
                                                type: 'click',
                                                method: async () => {
                                                    const newPass = document.getElementById('newPassword').value
                                                    const confirmPass = document.getElementById('confirmPassword').value

                                                    if (!newPass || !confirmPass) {
                                                        alert('Please fill in both password fields')
                                                        return
                                                    }

                                                    if (newPass !== confirmPass) {
                                                        alert('Passwords do not match')
                                                        return
                                                    }

                                                    if (newPass.length < 6) {
                                                        alert('Password must be at least 6 characters long')
                                                        return
                                                    }

                                                    const form = new FormData()
                                                    form.append('editPass', 'true')
                                                    form.append('userID', id)
                                                    form.append('changePassInput', newPass)

                                                    let loading = Waiting()
                                                    document.body.appendChild(loading)

                                                    try {
                                                        const response = await fetch('/rdeaccreq', {
                                                            method: 'POST',
                                                            body: form
                                                        })
                                                        const data = await response.json()

                                                        loading.remove()

                                                        if (data.status) {
                                                            modal.remove()
                                                            document.body.appendChild(ConfirmationAlert('Password reset successfully!', () => { }))
                                                        } else {
                                                            alert(data.message || 'Failed to reset password')
                                                        }
                                                    } catch (error) {
                                                        loading.remove()
                                                        alert('An error occurred')
                                                    }
                                                }
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })

                document.body.appendChild(modal)
            }

            return ($({
                tag: 'div',
                style: {
                    height: '90%',
                    width: '90%',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    overflowY: 'auto',
                    borderRadius: '0 0 8px 8px',
                    border: '1px solid #f1f5f9',
                    padding: '0 4px'
                },
                elementHandler: (el) => {
                    bodyPan = el
                    const req = new Request('/rdeaccreq')
                    req.Post([
                        { name: 'rdeAccReq', value: '0' }
                    ])
                    req.Json()
                    req.Send().then(data => {
                        data.reverse().forEach(val => {
                            el.appendChild(list(val.username, val.email, val.id))
                        })
                    })
                }
            }))
        }

        const TableHeader = () => {
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    width: '90%',
                    margin: '0 auto 4px auto',
                    padding: '10px 0',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px 8px 0 0'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'USERNAME',
                        style: {
                            width: '15%',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            paddingLeft: '12px'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'EMAIL',
                        style: {
                            width: '40%',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'PASSWORD',
                        style: {
                            width: '20%',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'ACTIONS',
                        style: {
                            width: '25%',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'right',
                            paddingRight: '12px'
                        }
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#f8fafc'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '10%',
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#ffffff'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '90%',
                                margin: '0 auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        color: '#1e293b',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        letterSpacing: '-0.3px'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-users'
                                            },
                                            style: {
                                                fontSize: '20px',
                                                color: '#3b82f6'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'RDE Staff Management'
                                        })
                                    ]
                                }),
                                SearchInput()
                            ]
                        })
                    ]
                }),
                TableHeader(),
                Body()
            ]
        }))
    }

    const account = () => {
        let acBody
        const current = window.location.href
        const origin = window.location.origin
        const userID = current.replace(origin, '').split('/')[5]

        let fName, uName

        const EditName = ({ reqUrl, reqName, label, placeHolder }) => {
            let mainBox
            let inputName
            const input = $({
                tag: 'div',
                style: {
                    width: '100%',
                    marginBottom: '16px',
                    position: 'relative'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                            fontSize: '14px',
                            zIndex: '1'
                        },
                        att: {
                            className: 'fa-solid fa-user'
                        }
                    }),
                    $({
                        tag: 'input',
                        style: {
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#1e293b',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                        },
                        att: {
                            placeholder: placeHolder,
                            value: placeHolder === 'Fullname' ? fName?.innerText : uName?.innerText
                        },
                        elementHandler: (el) => {
                            setTimeout(() => {
                                el.focus()
                            }, 50)
                        },
                        event: {
                            input: (ev) => {
                                inputName = ev.target.value
                            },
                            focus: (e) => {
                                e.target.style.borderColor = '#3b82f6'
                                e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                e.target.style.backgroundColor = '#ffffff'
                            },
                            blur: (e) => {
                                e.target.style.borderColor = '#e2e8f0'
                                e.target.style.boxShadow = 'none'
                                e.target.style.backgroundColor = '#f8fafc'
                            }
                        }
                    })
                ]
            })
            const submit = $({
                tag: 'div',
                style: {
                    background: '#3b82f6',
                    padding: '8px 24px',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                },
                text: 'Save Changes',
                event: {
                    type: 'click',
                    method: () => {
                        if (confirm("Save Changes?")) {
                            const req = new Request(reqUrl)
                            req.Post([
                                { name: 'userID', value: userID },
                                { name: reqName, value: '0' },
                                { name: 'fullNameInput', value: inputName }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                if (!data.status) {
                                    alert(data.messages)
                                } else {
                                    window.location.reload()
                                }
                            })
                        }
                    }
                }
            })

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                elementHandler: (el) => {
                    mainBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '420px',
                            maxWidth: '92%',
                            height: 'fit-content',
                            backgroundColor: '#ffffff',
                            margin: 'auto',
                            padding: '32px',
                            borderRadius: '12px',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '20px',
                                    transition: 'all 0.2s ease',
                                    padding: '8px',
                                    borderRadius: '8px'
                                },
                                att: {
                                    className: 'fa-solid fa-times'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        mainBox.remove()
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                text: label,
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '20px',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                    fontWeight: '600',
                                    letterSpacing: '-0.3px'
                                }
                            }),
                            input,
                            submit
                        ]
                    })
                ]
            }))
        }

        const ChangePassRde = ({ reqUrl, reqName, label }) => {
            let mainBox

            const PasswordField = ({ id, placeholder }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        marginBottom: '16px',
                        position: 'relative'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                                fontSize: '14px',
                                zIndex: '1'
                            },
                            att: {
                                className: 'fa-solid fa-lock'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'password',
                                id: id,
                                placeholder: placeholder
                            },
                            style: {
                                width: '100%',
                                padding: '10px 12px 10px 40px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                            },
                            event: {
                                focus: (e) => {
                                    e.target.style.borderColor = '#3b82f6'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                    e.target.style.backgroundColor = '#ffffff'
                                },
                                blur: (e) => {
                                    e.target.style.borderColor = '#e2e8f0'
                                    e.target.style.boxShadow = 'none'
                                    e.target.style.backgroundColor = '#f8fafc'
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8',
                                fontSize: '14px',
                                cursor: 'pointer',
                                zIndex: '1'
                            },
                            att: {
                                className: 'fa-solid fa-eye-slash toggle-password',
                                'data-target': id
                            },
                            event: {
                                type: 'click',
                                method: (e) => {
                                    const target = document.getElementById(id)
                                    const icon = e.target
                                    if (target.type === 'password') {
                                        target.type = 'text'
                                        icon.className = 'fa-solid fa-eye'
                                    } else {
                                        target.type = 'password'
                                        icon.className = 'fa-solid fa-eye-slash'
                                    }
                                }
                            }
                        })
                    ]
                }))
            }

            const submit = $({
                tag: 'div',
                style: {
                    background: '#3b82f6',
                    padding: '8px 24px',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                },
                text: 'Change Password',
                event: {
                    type: 'click',
                    method: () => {
                        const newPass = document.getElementById('newPassword').value
                        const confirmPass = document.getElementById('confirmPassword').value

                        if (!newPass || !confirmPass) {
                            alert('Please fill in both password fields')
                            return
                        }

                        if (newPass !== confirmPass) {
                            alert('Passwords do not match')
                            return
                        }

                        if (newPass.length < 6) {
                            alert('Password must be at least 6 characters long')
                            return
                        }

                        if (confirm("Save Changes?")) {
                            const req = new Request(reqUrl)
                            req.Post([
                                { name: 'userID', value: userID },
                                { name: reqName, value: '0' },
                                { name: 'changePassInput', value: newPass }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                if (!data.status) {
                                    alert(data.messages)
                                } else {
                                    window.location.reload()
                                }
                            })
                        }
                    }
                }
            })

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                elementHandler: (el) => {
                    mainBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '420px',
                            maxWidth: '92%',
                            height: 'fit-content',
                            backgroundColor: '#ffffff',
                            margin: 'auto',
                            padding: '32px',
                            borderRadius: '12px',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '20px',
                                    transition: 'all 0.2s ease',
                                    padding: '8px',
                                    borderRadius: '8px'
                                },
                                att: {
                                    className: 'fa-solid fa-times'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        mainBox.remove()
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                text: label,
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '20px',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                    fontWeight: '600',
                                    letterSpacing: '-0.3px'
                                }
                            }),
                            PasswordField({ id: 'newPassword', placeholder: 'Enter new password' }),
                            PasswordField({ id: 'confirmPassword', placeholder: 'Confirm new password' }),
                            submit
                        ]
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                position: 'relative',
                backgroundColor: '#f8fafc'
            },
            elementHandler: (el) => {
                acBody = el
                const req = new Request('/rdeaccreq')
                req.Post([
                    { name: 'accountIdRde', value: '0' },
                    { name: 'userID', value: userID }
                ])
                req.Json()
                req.Send().then(data => {
                    fName.innerText = data.fullname
                    uName.innerText = data.username
                })
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        marginLeft: '2vw',
                        position: 'absolute',
                        top: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.12)',
                        transition: 'all 0.2s ease',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                    },
                    att: {
                        className: 'backRdeAc'
                    },
                    child: [
                        $({
                            tag: "div",
                            att: {
                                className: 'fa-solid fa-arrow-left'
                            },
                            style: {
                                fontSize: '14px',
                                color: '#3b82f6'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontSize: '13px',
                                color: '#1e293b',
                                fontWeight: '500'
                            },
                            text: 'Back to List'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            window.location.assign('/admin/accountList/rdestaff/list')
                        },
                        mouseover: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                        }
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '40%',
                        maxWidth: '500px',
                        height: 'fit-content',
                        margin: 'auto',
                        backgroundColor: '#ffffff',
                        padding: '32px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                textAlign: 'center',
                                marginBottom: '24px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-user-circle'
                                    },
                                    style: {
                                        fontSize: '64px',
                                        color: '#3b82f6',
                                        opacity: '0.8'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'RDE Staff Details',
                                    style: {
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: '20px',
                                        color: '#1e293b',
                                        fontWeight: '600',
                                        marginTop: '8px',
                                        letterSpacing: '-0.3px'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #f1f5f9'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-user'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '14px',
                                                width: '24px'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Full Name:',
                                            style: {
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px',
                                                color: '#64748b',
                                                width: '100px'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                flex: '1',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px',
                                                color: '#1e293b',
                                                fontWeight: '500'
                                            },
                                            elementHandler: (el) => {
                                                fName = el
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-pen-to-square'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    acBody.appendChild(EditName({
                                                        reqUrl: '/rdeaccreq',
                                                        reqName: 'editNameRde',
                                                        label: 'Edit Full Name',
                                                        placeHolder: 'Fullname'
                                                    }))
                                                },
                                                mouseover: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                                                },
                                                mouseout: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent'
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #f1f5f9'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-at'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '14px',
                                                width: '24px'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Username:',
                                            style: {
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px',
                                                color: '#64748b',
                                                width: '100px'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                flex: '1',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px',
                                                color: '#1e293b',
                                                fontWeight: '500'
                                            },
                                            elementHandler: (el) => {
                                                uName = el
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-pen-to-square'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    acBody.appendChild(EditName({
                                                        reqUrl: '/rdeaccreq',
                                                        reqName: 'editUserNameRde',
                                                        label: 'Edit Username',
                                                        placeHolder: 'username'
                                                    }))
                                                }
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(59,130,246,0.06)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(59,130,246,0.12)',
                                        marginTop: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        className: 'fa-solid fa-key'
                                                    },
                                                    style: {
                                                        color: '#3b82f6',
                                                        fontSize: '16px'
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: 'Change Password',
                                                    style: {
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                        fontSize: '14px',
                                                        color: '#1e293b',
                                                        fontWeight: '500'
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-chevron-right'
                                            },
                                            style: {
                                                color: '#94a3b8',
                                                fontSize: '14px'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            acBody.appendChild(ChangePassRde({
                                                reqUrl: '/rdeaccreq',
                                                reqName: 'editPass',
                                                label: 'Change Password'
                                            }))
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            height: '100%',
            width: '100%',
            background: '#f8fafc'
        },
        elementHandler: (el) => {
            mainPan = el
            const origin = window.location.origin
            const current = window.location.href.replace(origin, '')
            const route = current.split('/')[4]
            switch (route) {
                case 'list':
                    el.appendChild(FullList(current))
                    break
                case 'account':
                    el.appendChild(account())
                    break
                default:
                    el.appendChild(Error())
            }
        }
    }))
}

// Tab Button with caching
const TabButton = ({ label, url }) => {
    const getActive = (button) => {
        if (url.split('/')[3] === window.location.href.replace(window.location.origin, '').split('/')[3]) {
            button.className += ' tabsAccountActive'
        }
    }

    return ($({
        tag: 'div',
        style: {
            padding: '8px 24px',
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '13px',
            fontWeight: '500',
            color: '#64748b',
            borderBottom: '2px solid transparent',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
        },
        att: {
            className: 'tabsAccount'
        },
        elementHandler: getActive,
        text: label,
        event: {
            type: 'click',
            method: () => {
                window.location.assign(url)
            },
            mouseover: (e) => {
                if (!e.currentTarget.className.includes('tabsAccountActive')) {
                    e.currentTarget.style.color = '#1e293b'
                    e.currentTarget.style.borderBottomColor = '#3b82f6'
                }
            },
            mouseout: (e) => {
                if (!e.currentTarget.className.includes('tabsAccountActive')) {
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.borderBottomColor = 'transparent'
                }
            }
        }
    }))
}

const page = [];
page.push({
    url: '/admin/accountList/CapsuUser',
    tab: TabButton({ label: "CAPSU Account", url: '/admin/accountList/CapsuUser' }),
    page: capUser
})

page.push({
    url: '/admin/accountList/Evaluator',
    tab: TabButton({ label: "Evaluators Account", url: '/admin/accountList/Evaluator' }),
    page: evalPage
})

page.push({
    url: '/admin/accountList/rdestaff/list',
    tab: TabButton({ label: "RDE Staff", url: '/admin/accountList/rdestaff/list' }),
    page: rdePage
})

const Tabs = () => {
    // Check if we have cached tabs
    let cachedTabs = tabCache.get('accountTabs')

    if (!cachedTabs) {
        const tabContainer = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '4px',
                padding: '0 16px',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                height: '48px',
                alignItems: 'center'
            },
            att: {
                className: 'accountTabsContainer'
            },
            child: page.map(val => val.tab)
        })

        cachedTabs = tabContainer
        tabCache.set('accountTabs', cachedTabs)
    }

    return cachedTabs
}

const pageFrame = () => {
    const getFrame = (frame) => {
        let frameState = true
        const current = window.location.href
        const origin = window.location.origin
        const rout = current.replace(origin, '')

        // Check if we have a cached page instance
        const activePage = page.find(val => val.url.split('/')[3] === rout.split('/')[3])

        if (activePage) {
            // Check cache for this page
            let pageInstance = tabCache.get(activePage.url)
            if (!pageInstance) {
                pageInstance = activePage.page()
                tabCache.set(activePage.url, pageInstance)
            }
            frame.appendChild(pageInstance)
            frameState = false
        }

        if (frameState) {
            frame.appendChild(Error())
        }
    }

    return ($({
        tag: 'div',
        elementHandler: getFrame,
        att: {
            className: 'pageFrameAdmin'
        },
        style: {
            height: 'calc(100% - 48px)',
            width: '100%',
            overflow: 'hidden'
        }
    }))
}

export const AccountList = () => {
    return ($({
        externalStyle: '/client/component/adminComponent/componentStyle/account.css',
        tag: 'div',
        att: {
            className: 'accountList'
        },
        style: {
            height: '100%',
            width: '100%',
            background: '#f8fafc'
        },
        child: [
            Tabs(),
            pageFrame(),
        ]
    }))
}
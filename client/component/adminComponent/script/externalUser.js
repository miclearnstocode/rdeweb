import { $, Request, SpecialChar, Waiting, ConfirmationAlert } from '../../../lib/lib.js'

export const ExternalAccount = () => {
    let passA, passB
    let tableBody // Reference for search functionality

    const Label = $({
        tag: 'div',
        style: {
            width: '100%',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            color: '#1e293b',
            marginBottom: '2vh',
            fontSize: '20px',
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
                    className: 'fa-solid fa-globe'
                },
                style: {
                    fontSize: '22px',
                    color: '#3b82f6'
                }
            }),
            $({
                tag: 'span',
                text: 'External Accounts Management'
            })
        ]
    })

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
                        placeholder: 'Search external accounts...'
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
                            if (tableBody) {
                                let rows = tableBody.children
                                for (let row of rows) {
                                    if (!row.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                        row.style.display = 'none'
                                    } else {
                                        row.style.display = 'flex'
                                    }
                                }
                            }
                        }
                    }
                })
            ]
        }))
    }

    const TableHeader = () => {
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
                Leb({ label: 'ID', width: '10%' }),
                Leb({ label: 'Account Name', width: '25%' }),
                Leb({ label: 'Email', width: '35%' }),
                Leb({ label: 'Actions', width: '30%', align: 'center' })
            ]
        }))
    }

    const showDeleteConfirmation = (id, accountName) => {
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
                        maxWidth: '90%',
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
                                color: '#ef4444',
                                textAlign: 'center',
                                marginBottom: '8px',
                                fontWeight: '600',
                                letterSpacing: '-0.3px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-triangle-exclamation me-2'
                                    },
                                    style: {
                                        marginRight: '8px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Delete Account'
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '14px',
                                color: '#64748b',
                                marginBottom: '20px',
                                textAlign: 'center',
                                padding: '8px 0'
                            },
                            text: 'Are you sure you want to delete this account? This action cannot be undone.'
                        }),
                        $({
                            tag: 'div',
                            style: {
                                backgroundColor: '#f8fafc',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                textAlign: 'center',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '15px',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                fontWeight: '500'
                            },
                            text: accountName
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
                                        backgroundColor: '#ef4444',
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
                                    text: 'Delete',
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            const form = new FormData()
                                            form.append('deleteExternal', 'true')
                                            form.append('accountId', id)

                                            let loading = Waiting()
                                            document.body.appendChild(loading)

                                            try {
                                                const response = await fetch('/externalauth', {
                                                    method: 'POST',
                                                    body: form
                                                })
                                                const data = await response.json()

                                                loading.remove()
                                                modal.remove()

                                                if (data.status) {
                                                    document.body.appendChild(ConfirmationAlert('Account deleted successfully!', () => {
                                                        window.location.reload()
                                                    }))
                                                } else {
                                                    alert(data.message || 'Failed to delete account')
                                                }
                                            } catch (error) {
                                                loading.remove()
                                                alert('An error occurred')
                                            }
                                        },
                                        mouseover: (e) => {
                                            e.target.style.backgroundColor = '#dc2626'
                                        },
                                        mouseout: (e) => {
                                            e.target.style.backgroundColor = '#ef4444'
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

    const showAddModal = () => {
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
                        width: '480px',
                        maxWidth: '92%',
                        height: 'fit-content',
                        backgroundColor: '#ffffff',
                        margin: 'auto',
                        padding: '32px',
                        borderRadius: '12px',
                        position: 'relative',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
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
                                marginBottom: '24px',
                                fontWeight: '600',
                                letterSpacing: '-0.3px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-user-plus me-2'
                                    },
                                    style: {
                                        color: '#3b82f6',
                                        marginRight: '8px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Add External Account'
                                })
                            ]
                        }),
                        $({
                            tag: 'form',
                            child: [
                                // Email Field
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '20px',
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
                                                className: 'fa-solid fa-envelope'
                                            }
                                        }),
                                        $({
                                            tag: 'input',
                                            att: {
                                                type: 'email',
                                                id: 'emailInp',
                                                name: 'accountEmail',
                                                placeholder: 'Email Address',
                                                required: true
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
                                        })
                                    ]
                                }),

                                // Account Name Field
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '20px',
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
                                            att: {
                                                type: 'text',
                                                id: 'acNem',
                                                name: 'accountName',
                                                placeholder: 'Account Name',
                                                required: true
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
                                        })
                                    ]
                                }),

                                // Password Field with Eye Icon
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
                                                id: 'exPass',
                                                name: 'accountPass',
                                                placeholder: 'Password (8-20 characters)',
                                                required: true,
                                                minLength: '8',
                                                maxLength: '20'
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
                                            elementHandler: (el) => {
                                                passA = el
                                                SpecialChar(el)
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
                                                'data-target': 'exPass'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    const target = document.getElementById('exPass')
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
                                        marginBottom: '12px',
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
                                                id: 'acPass',
                                                name: 'reAccountPass',
                                                placeholder: 'Confirm Password',
                                                required: true,
                                                minLength: '8',
                                                maxLength: '20'
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
                                            elementHandler: (el) => {
                                                passB = el
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
                                                },
                                                input: (ev) => {
                                                    let me = ev.target
                                                    if (passB.value.length >= 8) {
                                                        if (passA.value === me.value) {
                                                            me.style.borderColor = '#22c55e'
                                                            passA.style.borderColor = '#22c55e'
                                                        } else {
                                                            me.style.borderColor = '#ef4444'
                                                        }
                                                    }
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
                                                'data-target': 'acPass'
                                            },
                                            event: {
                                                type: 'click',
                                                method: (e) => {
                                                    const target = document.getElementById('acPass')
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

                                // Password Match Indicator
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '12px',
                                        marginTop: '4px',
                                        marginBottom: '20px',
                                        color: '#94a3b8',
                                        textAlign: 'center',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-info-circle me-1'
                                            },
                                            style: {
                                                color: '#3b82f6',
                                                fontSize: '12px'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Password must be 8-20 characters long'
                                        })
                                    ]
                                }),

                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        marginTop: '8px'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            att: {
                                                type: 'button'
                                            },
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
                                            att: {
                                                type: 'submit'
                                            },
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
                                            text: 'Save Account',
                                            event: {
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
                            ],
                            event: {
                                type: 'submit',
                                method: async (ev) => {
                                    ev.preventDefault()

                                    if (passA.value === passB.value) {
                                        let form = new FormData(ev.target)
                                        form.append('addExtern', 'true')

                                        let loading = Waiting()
                                        document.body.appendChild(loading)

                                        try {
                                            const response = await fetch('/externalauth', {
                                                method: 'POST',
                                                body: form
                                            })
                                            const data = await response.json()

                                            loading.remove()
                                            modal.remove()

                                            if (data.status) {
                                                document.body.appendChild(ConfirmationAlert('Account added successfully!', () => {
                                                    window.location.reload()
                                                }))
                                            } else {
                                                alert(data.message || 'Failed to add account')
                                            }
                                        } catch (error) {
                                            loading.remove()
                                            alert('An error occurred')
                                        }
                                    } else {
                                        passA.style.borderColor = '#ef4444'
                                        passB.style.borderColor = '#ef4444'
                                        alert('Passwords do not match!')
                                    }
                                }
                            }
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(modal)
    }

    const AccountRow = ({ id, account_name, email }) => {
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
                className: 'account-row'
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
                    text: id,
                    style: {
                        width: '10%',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '13px',
                        color: '#94a3b8',
                        paddingLeft: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '25%',
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
                                className: 'fa-solid fa-building'
                            },
                            style: {
                                color: '#3b82f6',
                                fontSize: '14px',
                                flexShrink: 0
                            }
                        }),
                        $({
                            tag: 'span',
                            text: account_name,
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
                    style: {
                        width: '35%',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '13px',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-envelope'
                            },
                            style: {
                                color: '#94a3b8',
                                fontSize: '13px',
                                flexShrink: 0
                            }
                        }),
                        $({
                            tag: 'span',
                            text: email
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '30%',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        paddingRight: '12px'
                    },
                    child: [
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
                                method: () => {
                                    showDeleteConfirmation(id, account_name)
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

    const TableBody = () => {
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                height: 'calc(100% - 20vh)',
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                overflowX: 'auto',
                borderRadius: '0 0 8px 8px',
                border: '1px solid #f1f5f9',
                minHeight: '200px',
                padding: '0 4px'
            },
            elementHandler: (el) => {
                tableBody = el
                const req = new Request('/externalauth')
                req.Post([
                    {
                        name: 'get_umd_user',
                        value: 'true'
                    }
                ])
                req.Json()
                req.Send().then(data => {
                    if (data && data.length > 0) {
                        data.forEach(val => {
                            el.appendChild(AccountRow({
                                id: val.id,
                                account_name: val.account_name,
                                email: val.email
                            }))
                        })
                    } else {
                        el.appendChild($({
                            tag: 'div',
                            style: {
                                width: '100%',
                                padding: '40px',
                                textAlign: 'center',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '14px',
                                color: '#94a3b8'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-database mb-2'
                                    },
                                    style: {
                                        fontSize: '48px',
                                        color: '#e2e8f0',
                                        marginBottom: '12px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No external accounts found',
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#64748b'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'Click "Add New Account" to create one',
                                    style: {
                                        fontSize: '13px',
                                        marginTop: '4px',
                                        color: '#94a3b8'
                                    }
                                })
                            ]
                        }))
                    }
                })
            }
        }))
    }

    const AddButton = () => {
        return ($({
            tag: 'button',
            style: {
                padding: '8px 20px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                whiteSpace: 'nowrap'
            },
            child: [
                $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-plus-circle'
                    },
                    style: {
                        fontSize: '16px'
                    }
                }),
                $({
                    tag: 'span',
                    text: 'Add New Account'
                })
            ],
            event: {
                type: 'click',
                method: showAddModal,
                mouseover: (e) => {
                    e.target.style.backgroundColor = '#2563eb'
                },
                mouseout: (e) => {
                    e.target.style.backgroundColor = '#3b82f6'
                }
            }
        }))
    }

    const MainPanel = () => {
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
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            },
                            child: [
                                SearchBar(),
                                AddButton()
                            ]
                        })
                    ]
                }),
                TableHeader(),
                TableBody()
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'externalAccountPage'
        },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8fafc'
        },
        child: [
            MainPanel()
        ]
    }))
}
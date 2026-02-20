import {$, Request, SpecialChar, Waiting, ConfirmationAlert} from '../../../lib/lib.js'

export const ExternalAccount = () => {
    let passA, passB
    let tableBody // Reference for search functionality

    const Label = $({
        tag: 'div',
        style: {
            width: '100%',
            textAlign: 'center',
            fontFamily: 'arial black, san-serif',
            color: 'rgba(200,200,200,0.5)',
            marginBottom: '2vh',
            fontSize: '1.5vw',
            letterSpacing: '0.1vw',
            textTransform: 'uppercase',
            textShadow: '0 0 10px rgba(0,191,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            gap: '1vw'
        },
        child: [
            $({
                tag: 'span',
                att: {
                    className: 'fa-solid fa-globe'
                },
                style: {
                    fontSize: '1.8vw',
                    color: '#00bcd4'
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
                height: '5vh',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '25vw',
                marginBottom: '2vh',
                borderRadius: '2vw',
                display: 'flex',
                padding: '0 1vw',
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#bbb',
                alignItems: 'center',
                transition: 'all 0.3s ease'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-search'
                    },
                    style: {
                        fontSize: '1vw',
                        color: '#666',
                        marginRight: '0.5vw'
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
                        color: '#e0e0e0',
                        fontSize: '0.95vw',
                        fontFamily: 'Segoe UI, sans-serif'
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
                    fontFamily: 'Segoe UI, sans-serif',
                    fontSize: '0.9vw',
                    color: '#888',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05vw'
                },
                text: label
            }))
        }

        return ($({
            tag: 'div',
            style: {
                display: 'flex',
                width: '100%',
                padding: '1vh 0',
                marginBottom: '0.5vh',
                borderBottom: '2px solid rgba(255,255,255,0.1)',
                minWidth: 'fit-content'
            },
            child: [
                Leb({ label: 'ID', width: '10%' }),
                Leb({ label: 'ACCOUNT NAME', width: '25%' }),
                Leb({ label: 'EMAIL', width: '35%' }),
                Leb({ label: 'ACTIONS', width: '30%', align: 'center' })
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
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                zIndex: '9999',
                backdropFilter: 'blur(5px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '32%',
                        height: 'fit-content',
                        background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                        margin: 'auto',
                        padding: '2.5rem',
                        borderRadius: '1vw',
                        position: 'relative',
                        border: '1px solid #333',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '1.5vh',
                                right: '1.5vw',
                                cursor: 'pointer',
                                color: '#666',
                                fontSize: '1.5vw',
                                transition: 'all 0.3s ease'
                            },
                            att: {
                                className: 'fa-solid fa-circle-xmark'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    modal.remove()
                                },
                                mouseover: (e) => {
                                    e.target.style.color = '#00bcd4'
                                },
                                mouseout: (e) => {
                                    e.target.style.color = '#666'
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '1.8vw',
                                color: '#f44336',
                                textAlign: 'center',
                                marginBottom: '1vh',
                                fontWeight: '600',
                                letterSpacing: '0.1vw'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-triangle-exclamation me-2'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Warning !'
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '1vw',
                                color: '#888',
                                marginBottom: '3vh',
                                textAlign: 'center',
                                padding: '0.5vh 0',
                                borderBottom: '1px solid #333'
                            },
                            text: 'Are you sure you want to delete this account?'
                        }),
                        $({
                            tag: 'div',
                            style: {
                                backgroundColor: '#333',
                                padding: '1rem',
                                borderRadius: '0.5vw',
                                marginBottom: '2vh',
                                textAlign: 'center',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '1.1vw',
                                color: '#e0e0e0',
                                border: '1px solid #444'
                            },
                            text: accountName
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1vw',
                                marginTop: '2vh'
                            },
                            child: [
                                $({
                                    tag: 'button',
                                    style: {
                                        padding: '0.8rem 2rem',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #444',
                                        borderRadius: '2vw',
                                        color: '#999',
                                        cursor: 'pointer',
                                        fontSize: '1vw',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        transition: 'all 0.3s ease',
                                        flex: '1'
                                    },
                                    text: 'Cancel',
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            modal.remove()
                                        },
                                        mouseover: (e) => {
                                            e.target.style.backgroundColor = '#333'
                                            e.target.style.color = '#fff'
                                        },
                                        mouseout: (e) => {
                                            e.target.style.backgroundColor = 'transparent'
                                            e.target.style.color = '#999'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'button',
                                    style: {
                                        padding: '0.8rem 2rem',
                                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                                        border: 'none',
                                        borderRadius: '2vw',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '1vw',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
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
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                zIndex: '9999',
                backdropFilter: 'blur(5px)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '40%',
                        height: 'fit-content',
                        background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                        margin: 'auto',
                        padding: '2.5rem',
                        borderRadius: '1vw',
                        position: 'relative',
                        border: '1px solid #333',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '1.5vh',
                                right: '1.5vw',
                                cursor: 'pointer',
                                color: '#666',
                                fontSize: '1.5vw',
                                transition: 'all 0.3s ease'
                            },
                            att: {
                                className: 'fa-solid fa-circle-xmark'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    modal.remove()
                                },
                                mouseover: (e) => {
                                    e.target.style.color = '#00bcd4'
                                },
                                mouseout: (e) => {
                                    e.target.style.color = '#666'
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '1.8vw',
                                color: '#00bcd4',
                                textAlign: 'center',
                                marginBottom: '3vh',
                                fontWeight: '600',
                                letterSpacing: '0.1vw'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-plus-circle me-2'
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
                                        marginBottom: '2.5vh',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
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
                                                padding: '0.8rem 2.5rem',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '0.5vw',
                                                color: '#fff',
                                                fontSize: '1vw',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                boxSizing: 'border-box'
                                            },
                                            event: {
                                                focus: (e) => {
                                                    e.target.style.borderColor = '#00bcd4'
                                                    e.target.style.backgroundColor = '#3a3a3a'
                                                },
                                                blur: (e) => {
                                                    e.target.style.borderColor = '#444'
                                                    e.target.style.backgroundColor = '#333'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Account Name Field
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '2.5vh',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
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
                                                padding: '0.8rem 2.5rem',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '0.5vw',
                                                color: '#fff',
                                                fontSize: '1vw',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                boxSizing: 'border-box'
                                            },
                                            event: {
                                                focus: (e) => {
                                                    e.target.style.borderColor = '#00bcd4'
                                                    e.target.style.backgroundColor = '#3a3a3a'
                                                },
                                                blur: (e) => {
                                                    e.target.style.borderColor = '#444'
                                                    e.target.style.backgroundColor = '#333'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Password Field with Eye Icon
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '2.5vh',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
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
                                                padding: '0.8rem 2.5rem',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '0.5vw',
                                                color: '#fff',
                                                fontSize: '1vw',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                passA = el
                                                SpecialChar(el)
                                            },
                                            event: {
                                                focus: (e) => {
                                                    e.target.style.borderColor = '#00bcd4'
                                                    e.target.style.backgroundColor = '#3a3a3a'
                                                },
                                                blur: (e) => {
                                                    e.target.style.borderColor = '#444'
                                                    e.target.style.backgroundColor = '#333'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                right: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
                                                cursor: 'pointer',
                                                zIndex: '1',
                                                transition: 'color 0.3s ease'
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
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Confirm Password Field with Eye Icon
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '3vh',
                                        position: 'relative'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                left: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
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
                                                padding: '0.8rem 2.5rem',
                                                backgroundColor: '#333',
                                                border: '1px solid #444',
                                                borderRadius: '0.5vw',
                                                color: '#fff',
                                                fontSize: '1vw',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                boxSizing: 'border-box'
                                            },
                                            elementHandler: (el) => {
                                                passB = el
                                            },
                                            event: {
                                                focus: (e) => {
                                                    e.target.style.borderColor = '#00bcd4'
                                                    e.target.style.backgroundColor = '#3a3a3a'
                                                },
                                                blur: (e) => {
                                                    e.target.style.borderColor = '#444'
                                                    e.target.style.backgroundColor = '#333'
                                                },
                                                input: (ev) => {
                                                    let me = ev.target
                                                    if (passB.value.length >= 8) {
                                                        if (passA.value === me.value) {
                                                            me.style.borderColor = '#4caf50'
                                                            passA.style.borderColor = '#4caf50'
                                                        } else {
                                                            me.style.borderColor = '#f44336'
                                                        }
                                                    }
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                position: 'absolute',
                                                right: '1vw',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#666',
                                                fontSize: '1vw',
                                                cursor: 'pointer',
                                                zIndex: '1',
                                                transition: 'color 0.3s ease'
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
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Password Match Indicator
                                $({
                                    tag: 'div',
                                    style: {
                                        fontSize: '0.9vw',
                                        marginTop: '-1vh',
                                        marginBottom: '2vh',
                                        color: '#888',
                                        textAlign: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: {
                                                className: 'fa-solid fa-circle-info me-1'
                                            },
                                            style: {
                                                color: '#00bcd4',
                                                fontSize: '0.9vw'
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
                                        gap: '1vw',
                                        marginTop: '2vh'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            att: {
                                                type: 'button'
                                            },
                                            style: {
                                                padding: '0.8rem 2rem',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #444',
                                                borderRadius: '2vw',
                                                color: '#999',
                                                cursor: 'pointer',
                                                fontSize: '1vw',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                transition: 'all 0.3s ease',
                                                flex: '1'
                                            },
                                            text: 'Cancel',
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    modal.remove()
                                                },
                                                mouseover: (e) => {
                                                    e.target.style.backgroundColor = '#333'
                                                    e.target.style.color = '#fff'
                                                },
                                                mouseout: (e) => {
                                                    e.target.style.backgroundColor = 'transparent'
                                                    e.target.style.color = '#999'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            att: {
                                                type: 'submit'
                                            },
                                            style: {
                                                padding: '0.8rem 2rem',
                                                background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                                                border: 'none',
                                                borderRadius: '2vw',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '1vw',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease',
                                                flex: '1'
                                            },
                                            text: 'Save Account',
                                            event: {
                                                mouseover: (e) => {
                                                    e.target.style.opacity = '0.9'
                                                },
                                                mouseout: (e) => {
                                                    e.target.style.opacity = '1'
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
                                        passA.style.borderColor = '#f44336'
                                        passB.style.borderColor = '#f44336'
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
                padding: '0.8vh 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent'
            },
            att: {
                className: 'account-row'
            },
            event: {
                mouseover: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
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
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '0.95vw',
                        color: '#888',
                        paddingLeft: '1vw',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '25%',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '0.95vw',
                        color: '#e0e0e0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingRight: '1vw',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-building'
                            },
                            style: {
                                color: 'rgba(0,188,212,0.6)',
                                fontSize: '1.2vw',
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
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '0.95vw',
                        color: '#aaa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-envelope'
                            },
                            style: {
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '1vw',
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
                        gap: '0.8vw',
                        paddingRight: '1vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                padding: '0.3vw 1vw',
                                borderRadius: '1vw',
                                backgroundColor: 'rgba(244,67,54,0.1)',
                                border: '1px solid rgba(244,67,54,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3vw',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-trash-can'
                                    },
                                    style: {
                                        color: '#f44336',
                                        fontSize: '0.9vw'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Delete',
                                    style: {
                                        color: '#f44336',
                                        fontSize: '0.85vw',
                                        fontFamily: 'Segoe UI, sans-serif'
                                    }
                                })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    showDeleteConfirmation(id, account_name)
                                },
                                mouseover: (e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.2)'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.1)'
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
                backgroundColor: 'rgba(0,0,0,0.3)',
                overflowY: 'auto',
                overflowX: 'auto',
                borderRadius: '0.5vw',
                border: '1px solid rgba(255,255,255,0.05)',
                minHeight: '200px'
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
                                padding: '2rem',
                                textAlign: 'center',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '1vw',
                                color: '#888'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-database mb-2'
                                    },
                                    style: {
                                        fontSize: '2vw',
                                        color: '#333',
                                        marginBottom: '1vh'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'No external accounts found'
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
                padding: '0.2rem 2rem',
                background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                border: 'none',
                borderRadius: '2vw',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'Segoe UI, sans-serif',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5vw',
                width: 'auto',
                height: 'auto'
            },
            child: [
                $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-plus-circle'
                    },
                    style: {
                        fontSize: '1.2vw'
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
                    e.target.style.opacity = '0.9'
                    e.target.style.transform = 'translateY(-1px)'
                },
                mouseout: (e) => {
                    e.target.style.opacity = '1'
                    e.target.style.transform = 'translateY(0)'
                }
            }
        }))
    }

    const MainPanel = () => {
        return ($({
            tag: 'div',
            style: {
                width: '95%',
                margin: '2% auto',
                height: '96%',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1vh'
                    },
                    child: [
                        Label,
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '1vw',
                                alignItems: 'center'
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
            backgroundColor: '#1a1a1a'
        },
        child: [
            MainPanel()
        ]
    }))
}
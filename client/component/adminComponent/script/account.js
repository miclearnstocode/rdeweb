import {$, ConfirmationAlert, Request, Waiting} from '../../../lib/lib.js'
import {Error} from "../../../error.js";

const capUser = () => {
    const mainPan = () => {
        let bo // For search functionality
        
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
                        className: 'fa-solid fa-building'
                    },
                    style: {
                        fontSize: '1.8vw',
                        color: '#00bcd4'
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
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginBottom: '1vh',
                                    fontWeight: '600',
                                    letterSpacing: '0.1vw'
                                },
                                text: 'Reset Password'
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
                                text: `Reset password for: ${username}`
                            }),

                            // New Password Field with Eye Icon
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
                                            id: 'newPassword',
                                            placeholder: 'Enter new password'
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
                                            id: 'confirmPassword',
                                            placeholder: 'Confirm new password'
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
                                                        document.body.appendChild(ConfirmationAlert('Password reset successfully!', () => {
                                                            // Just close the alert
                                                        }))
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
            const list = ({ campusN, name, id, designation, email, username }) => {
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
                        className: 'list-row'
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
                            text: campusN || 'N/A',
                            style: {
                                width: '14%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#e0e0e0',
                                paddingLeft: '1vw',
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
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#e0e0e0',
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
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#aaa',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: name,
                            style: {
                                width: '22%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#e0e0e0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '1vw'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: email,
                            style: {
                                width: '20%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#aaa',
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
                                gap: '0.5vw',
                                paddingRight: '1vw'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '0.3vw 0.8vw',
                                        borderRadius: '1vw',
                                        backgroundColor: 'rgba(0,188,212,0.1)',
                                        border: '1px solid rgba(0,188,212,0.2)',
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
                                                className: 'fa-solid fa-key'
                                            },
                                            style: {
                                                color: '#00bcd4',
                                                fontSize: '0.9vw'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Reset Password',
                                            style: {
                                                color: '#00bcd4',
                                                fontSize: '0.85vw',
                                                fontFamily: 'Segoe UI, sans-serif'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            showPasswordReset(id, username)
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.2)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.1)'
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '0.3vw 0.8vw',
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
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    borderRadius: '0.5vw',
                    border: '1px solid rgba(255,255,255,0.05)'
                },
                elementHandler: getContainer
            }))
        }

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
                            placeholder: 'Search accounts...'
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
                    Leb({ label: 'CAMPUS/CENTER', width: '14%' }),
                    Leb({ label: 'USER TYPE', width: '12%' }),
                    Leb({ label: 'USERNAME', width: '12%' }),
                    Leb({ label: 'FULL NAME', width: '22%' }),
                    Leb({ label: 'EMAIL', width: '20%' }),
                    Leb({ label: 'PASSWORD', width: '10%', align: 'center' }),
                    Leb({ label: 'ACTIONS', width: '10%', align: 'center' })
                ]
            }))
        }

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
        child: [
            mainPan()
        ]
    }))
}

const evalPage = () => {
    const mainPan=()=>{
        let bo
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
                        className: 'fa-solid fa-users'
                    },
                    style: {
                        fontSize: '1.8vw',
                        color: '#00bcd4'
                    }
                }),
                $({
                    tag: 'span',
                    text: 'Evaluators Account'
                })
            ]
        })
        
        const container=()=>{
            const PasswordCell = ({id, username}) => {
                return($({
                    tag:'td',
                    style:{
                        width:'10%',
                        textAlign: 'center'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                display:'flex',
                                justifyContent:'center',
                                gap:'0.5vw'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-key'
                                    },
                                    style:{
                                        color: '#00bcd4',
                                        cursor: 'pointer',
                                        fontSize: '1.2vw',
                                        transition:'all 0.3s ease',
                                        padding:'0.3vw',
                                        borderRadius:'0.2vw',
                                        backgroundColor:'rgba(0,188,212,0.1)'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            showPasswordReset(id, username);
                                        },
                                        mouseover:(e)=>{
                                            e.target.style.color = '#fff';
                                            e.target.style.backgroundColor = '#00bcd4';
                                        },
                                        mouseout:(e)=>{
                                            e.target.style.color = '#00bcd4';
                                            e.target.style.backgroundColor = 'rgba(0,188,212,0.1)';
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }
            
            const list=({fullName,category,username,id})=>{
                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        display:'flex',
                        alignItems:'center',
                        padding:'0.8vh 0',
                        borderBottom:'1px solid rgba(255,255,255,0.1)',
                        transition:'all 0.3s ease',
                        backgroundColor:'transparent',
                        cursor:'pointer'
                    },
                    att:{
                        className:'list-row'
                    },
                    event:{
                        mouseover:(e)=>{
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        },
                        mouseout:(e)=>{
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'5%',
                                textAlign: 'center'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-user-circle',
                                    },
                                    style:{
                                        color: 'rgba(0,188,212,0.6)',
                                        fontSize:'1.2vw'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag:'div',
                            text:fullName,
                            style:{
                                width:'30%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize:'0.95vw',
                                color:'#e0e0e0',
                                fontWeight:'400',
                                whiteSpace:'nowrap',
                                overflow:'hidden',
                                textOverflow:'ellipsis',
                                paddingRight:'1vw'
                            }
                        }),
                        $({
                            tag:'div',
                            text:username,
                            style:{
                                width:'15%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize:'0.95vw',
                                color:'#aaa',
                                fontWeight:'400'
                            }
                        }),
                        $({
                            tag:'div',
                            text:category,
                            style:{
                                width:'15%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize:'0.95vw',
                                color:'#aaa',
                                fontWeight:'400'
                            }
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'25%',
                                textAlign: 'left'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        display:'inline-flex',
                                        alignItems:'center',
                                        gap:'0.5vw',
                                        backgroundColor:'rgba(0,188,212,0.1)',
                                        padding:'0.3vw 0.8vw',
                                        borderRadius:'1vw',
                                        border:'1px solid rgba(0,188,212,0.2)'
                                    },
                                    child:[
                                        $({
                                            tag:'span',
                                            att:{
                                                className:'fa-solid fa-key'
                                            },
                                            style:{
                                                color:'#00bcd4',
                                                fontSize:'0.9vw'
                                            }
                                        }),
                                        $({
                                            tag:'span',
                                            text:'Reset Password',
                                            style:{
                                                color:'#00bcd4',
                                                fontSize:'0.85vw',
                                                fontFamily:'Segoe UI, sans-serif',
                                                cursor:'pointer'
                                            },
                                            event:{
                                                type:'click',
                                                method:()=>{
                                                    showPasswordReset(id, username);
                                                }
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'10%',
                                textAlign:'center'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        display:'flex',
                                        justifyContent:'center',
                                        gap:'0.5vw'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            att:{
                                                className:'fa-solid fa-trash-can'
                                            },
                                            style:{
                                                color:'#f44336',
                                                cursor:'pointer',
                                                fontSize:'1.2vw',
                                                transition:'all 0.3s ease',
                                                padding:'0.3vw',
                                                borderRadius:'0.2vw',
                                                backgroundColor:'rgba(244,67,54,0.1)'
                                            },
                                            event:{
                                                type:'click',
                                                method:async ()=>{
                                                    if(confirm('Are you sure you want to delete this evaluator?')){
                                                        const form=new FormData()
                                                        form.append('deleteEval','true')
                                                        form.append('id',id)
                                                        let loading = Waiting()
                                                        document.body.appendChild(loading)
                                                        const remove = () => {
                                                            loading.remove()
                                                        }
                                                        await fetch('/evaluatorReg',{
                                                            body:form,
                                                            method:'POST',
                                                        }).then(res => {
                                                            if (res.ok) {
                                                                remove()
                                                                return res.json()
                                                            }
                                                        })
                                                        .then(dat => {
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
                                                },
                                                mouseover:(e)=>{
                                                    e.target.style.color = '#fff';
                                                    e.target.style.backgroundColor = '#f44336';
                                                },
                                                mouseout:(e)=>{
                                                    e.target.style.color = '#f44336';
                                                    e.target.style.backgroundColor = 'rgba(244,67,54,0.1)';
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
            
            const showPasswordReset = (id, username) => {
                const modal = $({
                    tag:'div',
                    style:{
                        position:'fixed',
                        top:'0',
                        left:'0',
                        width:'100%',
                        height:'100%',
                        backgroundColor:'rgba(0,0,0,0.9)',
                        display:'flex',
                        zIndex:'9999',
                        backdropFilter:'blur(5px)'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'32%',
                                height:'fit-content',
                                background:'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                                margin:'auto',
                                padding:'2.5rem',
                                borderRadius:'1vw',
                                position:'relative',
                                border:'1px solid #333',
                                boxShadow:'0 20px 40px rgba(0,0,0,0.5)'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        position:'absolute',
                                        top:'1.5vh',
                                        right:'1.5vw',
                                        cursor:'pointer',
                                        color:'#666',
                                        fontSize:'1.5vw',
                                        transition:'all 0.3s ease'
                                    },
                                    att:{
                                        className:'fa-solid fa-circle-xmark'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            modal.remove()
                                        },
                                        mouseover:(e)=>{
                                            e.target.style.color = '#00bcd4';
                                        },
                                        mouseout:(e)=>{
                                            e.target.style.color = '#666';
                                        }
                                    }
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        fontFamily:'Segoe UI, sans-serif',
                                        fontSize:'1.8vw',
                                        color:'#fff',
                                        textAlign:'center',
                                        marginBottom:'1vh',
                                        fontWeight:'600',
                                        letterSpacing:'0.1vw'
                                    },
                                    text:'Reset Password'
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        fontFamily:'Segoe UI, sans-serif',
                                        fontSize:'1vw',
                                        color:'#888',
                                        marginBottom:'3vh',
                                        textAlign:'center',
                                        padding:'0.5vh 0',
                                        borderBottom:'1px solid #333'
                                    },
                                    text:`Reset password for: ${username}`
                                }),
                                
                                // New Password Field with Eye Icon
                                $({
                                    tag:'div',
                                    style:{
                                        marginBottom:'2.5vh',
                                        position:'relative'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            style:{
                                                position:'absolute',
                                                left:'1vw',
                                                top:'50%',
                                                transform:'translateY(-50%)',
                                                color:'#666',
                                                fontSize:'1vw',
                                                zIndex:'1'
                                            },
                                            att:{
                                                className:'fa-solid fa-lock'
                                            }
                                        }),
                                        $({
                                            tag:'input',
                                            att:{
                                                type:'password',
                                                id:'newPassword',
                                                placeholder:'Enter new password'
                                            },
                                            style:{
                                                width:'100%',
                                                padding:'0.8rem 2.5rem',
                                                backgroundColor:'#333',
                                                border:'1px solid #444',
                                                borderRadius:'0.5vw',
                                                color:'#fff',
                                                fontSize:'1vw',
                                                outline:'none',
                                                transition:'all 0.3s ease',
                                                boxSizing:'border-box'
                                            },
                                            event:{
                                                focus:(e)=>{
                                                    e.target.style.borderColor = '#00bcd4';
                                                    e.target.style.backgroundColor = '#3a3a3a';
                                                },
                                                blur:(e)=>{
                                                    e.target.style.borderColor = '#444';
                                                    e.target.style.backgroundColor = '#333';
                                                }
                                            }
                                        }),
                                        $({
                                            tag:'div',
                                            style:{
                                                position:'absolute',
                                                right:'1vw',
                                                top:'50%',
                                                transform:'translateY(-50%)',
                                                color:'#666',
                                                fontSize:'1vw',
                                                cursor:'pointer',
                                                zIndex:'1',
                                                transition:'color 0.3s ease'
                                            },
                                            att:{
                                                className:'fa-solid fa-eye-slash toggle-password',
                                                'data-target':'newPassword'
                                            },
                                            event:{
                                                type:'click',
                                                method:(e)=>{
                                                    const target = document.getElementById('newPassword');
                                                    const icon = e.target;
                                                    if(target.type === 'password'){
                                                        target.type = 'text';
                                                        icon.className = 'fa-solid fa-eye';
                                                    } else {
                                                        target.type = 'password';
                                                        icon.className = 'fa-solid fa-eye-slash';
                                                    }
                                                }
                                            }
                                        })
                                    ]
                                }),
                                
                                // Confirm Password Field with Eye Icon
                                $({
                                    tag:'div',
                                    style:{
                                        marginBottom:'3vh',
                                        position:'relative'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            style:{
                                                position:'absolute',
                                                left:'1vw',
                                                top:'50%',
                                                transform:'translateY(-50%)',
                                                color:'#666',
                                                fontSize:'1vw',
                                                zIndex:'1'
                                            },
                                            att:{
                                                className:'fa-solid fa-lock'
                                            }
                                        }),
                                        $({
                                            tag:'input',
                                            att:{
                                                type:'password',
                                                id:'confirmPassword',
                                                placeholder:'Confirm new password'
                                            },
                                            style:{
                                                width:'100%',
                                                padding:'0.8rem 2.5rem',
                                                backgroundColor:'#333',
                                                border:'1px solid #444',
                                                borderRadius:'0.5vw',
                                                color:'#fff',
                                                fontSize:'1vw',
                                                outline:'none',
                                                transition:'all 0.3s ease',
                                                boxSizing:'border-box'
                                            },
                                            event:{
                                                focus:(e)=>{
                                                    e.target.style.borderColor = '#00bcd4';
                                                    e.target.style.backgroundColor = '#3a3a3a';
                                                },
                                                blur:(e)=>{
                                                    e.target.style.borderColor = '#444';
                                                    e.target.style.backgroundColor = '#333';
                                                }
                                            }
                                        }),
                                        $({
                                            tag:'div',
                                            style:{
                                                position:'absolute',
                                                right:'1vw',
                                                top:'50%',
                                                transform:'translateY(-50%)',
                                                color:'#666',
                                                fontSize:'1vw',
                                                cursor:'pointer',
                                                zIndex:'1',
                                                transition:'color 0.3s ease'
                                            },
                                            att:{
                                                className:'fa-solid fa-eye-slash toggle-password',
                                                'data-target':'confirmPassword'
                                            },
                                            event:{
                                                type:'click',
                                                method:(e)=>{
                                                    const target = document.getElementById('confirmPassword');
                                                    const icon = e.target;
                                                    if(target.type === 'password'){
                                                        target.type = 'text';
                                                        icon.className = 'fa-solid fa-eye';
                                                    } else {
                                                        target.type = 'password';
                                                        icon.className = 'fa-solid fa-eye-slash';
                                                    }
                                                }
                                            }
                                        })
                                    ]
                                }),
                                
                                $({
                                    tag:'div',
                                    style:{
                                        display:'flex',
                                        justifyContent:'center',
                                        gap:'1vw',
                                        marginTop:'2vh'
                                    },
                                    child:[
                                        $({
                                            tag:'button',
                                            style:{
                                                padding:'0.8rem 2rem',
                                                backgroundColor:'transparent',
                                                border:'1px solid #444',
                                                borderRadius:'2vw',
                                                color:'#999',
                                                cursor:'pointer',
                                                fontSize:'1vw',
                                                fontFamily:'Segoe UI, sans-serif',
                                                transition:'all 0.3s ease',
                                                flex:'1'
                                            },
                                            text:'Cancel',
                                            event:{
                                                type:'click',
                                                method:()=>{
                                                    modal.remove()
                                                },
                                                mouseover:(e)=>{
                                                    e.target.style.backgroundColor = '#333';
                                                    e.target.style.color = '#fff';
                                                },
                                                mouseout:(e)=>{
                                                    e.target.style.backgroundColor = 'transparent';
                                                    e.target.style.color = '#999';
                                                }
                                            }
                                        }),
                                        $({
                                            tag:'button',
                                            style:{
                                                padding:'0.8rem 2rem',
                                                background:'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                                                border:'none',
                                                borderRadius:'2vw',
                                                color:'#fff',
                                                cursor:'pointer',
                                                fontSize:'1vw',
                                                fontFamily:'Segoe UI, sans-serif',
                                                fontWeight:'600',
                                                transition:'all 0.3s ease',
                                                flex:'1'
                                            },
                                            text:'Reset Password',
                                            event:{
                                                type:'click',
                                                method:async ()=>{
                                                    const newPass = document.getElementById('newPassword').value
                                                    const confirmPass = document.getElementById('confirmPassword').value
                                                    
                                                    if(!newPass || !confirmPass){
                                                        alert('Please fill in both password fields')
                                                        return
                                                    }
                                                    
                                                    if(newPass !== confirmPass){
                                                        alert('Passwords do not match')
                                                        return
                                                    }
                                                    
                                                    if(newPass.length < 6){
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
                                                        
                                                        if(data.status){
                                                            modal.remove()
                                                            document.body.appendChild(ConfirmationAlert('Password reset successfully!', ()=>{
                                                                // Just close the alert
                                                            }))
                                                        } else {
                                                            alert(data.message || 'Failed to reset password')
                                                        }
                                                    } catch(error) {
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
            
            const getContainer=async (panel)=>{
                bo=panel
                const form=new FormData()
                form.append('evaluatorsList','true')
                await fetch('/evaluatorReg',{
                    body:form,
                    method:'POST',
                }).then(res=>res.json())
                    .then(data=>{
                        data.reverse().forEach(val=>{
                            panel.appendChild(list({
                                fullName:val.fullname,
                                category:val.category,
                                id:val.id,
                                username:val.username
                            }))
                        })
                    })
            }
            
            return($({
                tag:'div',
                style:{
                    width:'100%',
                    height: 'calc(100% - 12vh)',
                    backgroundColor:'rgba(0,0,0,0.3)',
                    overflowY:'auto',
                    borderRadius:'0.5vw',
                    border:'1px solid rgba(255,255,255,0.05)'
                },
                elementHandler:getContainer
            }))
        }
        
        const SearchBar=()=>{
            return($({
                tag:'div',
                style:{
                    height:'5vh',
                    border:'1px solid rgba(255,255,255,0.1)',
                    width:'25vw',
                    marginBottom: '2vh',
                    borderRadius:'2vw',
                    display:'flex',
                    padding:'0 1vw',
                    backgroundColor:'rgba(0,0,0,0.4)',
                    color:'#bbb',
                    alignItems:'center',
                    transition:'all 0.3s ease'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'fa-solid fa-search'
                        },
                        style:{
                            fontSize:'1vw',
                            color:'#666',
                            marginRight:'0.5vw'
                        }
                    }),
                    $({
                        tag:'input',
                        att:{
                            type:'text',
                            placeholder:'Search evaluators...'
                        },
                        style:{
                            backgroundColor:'transparent',
                            border:'none',
                            outline:'none',
                            height:'100%',
                            width:'100%',
                            color:'#e0e0e0',
                            fontSize:'0.95vw',
                            fontFamily:'Segoe UI, sans-serif'
                        },
                        event:{
                            type:'input',
                            method:(ev)=>{
                                let list=bo.children
                                for(let val of list){
                                    if(!val.innerText.toUpperCase().includes(ev.target.value.toUpperCase())){
                                        val.style.display='none'
                                    }else {
                                        val.style.display='flex'
                                    }
                                }
                            }
                        }
                    })
                ]
            }))
        }
        
        const Head=()=>{
            const Leb=({label,width,align='left'})=>{
                return($({
                    tag:'div',
                    style:{
                        width:width,
                        textAlign:align,
                        fontFamily:'Segoe UI, sans-serif',
                        fontSize:'0.9vw',
                        color:'#888',
                        fontWeight:'600',
                        textTransform:'uppercase',
                        letterSpacing:'0.05vw'
                    },
                    text:label
                }))
            }
            
            return($({
                tag:'div',
                style:{
                    display:'flex',
                    width:'100%',
                    padding:'1vh 0',
                    marginBottom:'0.5vh',
                    borderBottom:'2px solid rgba(255,255,255,0.1)'
                },
                child:[
                    Leb({label:'',width:'5%',align:'center'}),
                    Leb({label:'FULL NAME',width:'30%'}),
                    Leb({label:'USERNAME',width:'15%'}),
                    Leb({label:'CATEGORY',width:'15%'}),
                    Leb({label:'PASSWORD',width:'25%'}),
                    Leb({label:'ACTIONS',width:'10%',align:'center'}),
                ]
            }))
        }
        
        return($({
            tag:'div',
            style:{
                width:'90%',
                margin:'2% auto',
                height:'96%',
                display:'flex',
                flexDirection:'column'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        display:'flex',
                        justifyContent:'space-between',
                        alignItems:'center',
                        marginBottom:'1vh'
                    },
                    child:[
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
        child:[
            mainPan()
        ]
    }))
}

const rdePage = () => {
    let mainPan

    const FullList = (url) => {
        let bodyPan

        // Define SearchInput as a separate function
        const SearchInput = () => {
            return ($({
                tag: 'div',
                style: {
                    height: '5vh',
                    width: '25vw',
                    display: 'flex',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '2vw',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    padding: '0 1vw',
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
                        style: {
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '0.95vw',
                            color: '#e0e0e0',
                            fontFamily: 'Segoe UI, sans-serif'
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

        // You can remove the Head function since we're not using it anymore
        // Or keep it if needed elsewhere

        const Body = () => {
            const PasswordResetCell = ({ accountID, email }) => {
                return ($({
                    tag: 'div',
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3vw',
                        padding: '0.3vw 0.8vw',
                        borderRadius: '1vw',
                        backgroundColor: 'rgba(0,188,212,0.1)',
                        border: '1px solid rgba(0,188,212,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-key'
                            },
                            style: {
                                color: '#00bcd4',
                                fontSize: '0.9vw'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Reset Password',
                            style: {
                                color: '#00bcd4',
                                fontSize: '0.85vw',
                                fontFamily: 'Segoe UI, sans-serif'
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
                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.2)'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.1)'
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
                        padding: '1vh 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    },
                    att: {
                        className: 'listRde'
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
                            text: userName,
                            style: {
                                width: '15%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#e0e0e0',
                                paddingLeft: '1vw',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: email,
                            style: {
                                width: '40%',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#aaa',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '1vw'
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
                                gap: '0.5vw',
                                paddingRight: '1vw'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        padding: '0.3vw 0.8vw',
                                        borderRadius: '1vw',
                                        backgroundColor: 'rgba(255,193,7,0.1)',
                                        border: '1px solid rgba(255,193,7,0.2)',
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
                                                className: 'fa-solid fa-user-pen'
                                            },
                                            style: {
                                                color: '#ffc107',
                                                fontSize: '0.9vw'
                                            }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: 'Edit',
                                            style: {
                                                color: '#ffc107',
                                                fontSize: '0.85vw',
                                                fontFamily: 'Segoe UI, sans-serif'
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
                                        padding: '0.3vw 0.8vw',
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
                                        method: (e) => {
                                            e.stopPropagation()
                                            if (confirm("This operation cannot be undone. Would you like to proceed?")) {
                                                const req = new Request('/rdeaccreq')
                                                req.Post([
                                                    {
                                                        name: 'deleteRDEaccount',
                                                        value: '0'
                                                    },
                                                    {
                                                        name: 'userId',
                                                        value: accountID
                                                    }
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
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        zIndex: '9',
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
                                        color: '#fff',
                                        textAlign: 'center',
                                        marginBottom: '1vh',
                                        fontWeight: '600',
                                        letterSpacing: '0.1vw'
                                    },
                                    text: 'Reset Password'
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
                                    text: `Reset password for: ${username}`
                                }),

                                // New Password Field with Eye Icon
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
                                                id: 'newPassword',
                                                placeholder: 'Enter new password'
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
                                                id: 'confirmPassword',
                                                placeholder: 'Confirm new password'
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
                                                            document.body.appendChild(ConfirmationAlert('Password reset successfully!', () => {
                                                                // Just close the alert
                                                            }))
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
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    overflowY: 'auto',
                    borderRadius: '0.5vw',
                    border: '1px solid rgba(255,255,255,0.05)'
                },
                elementHandler: (el) => {
                    bodyPan = el
                    const req = new Request('/rdeaccreq')
                    req.Post([
                        {
                            name: 'rdeAccReq',
                            value: '0'
                        }
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
                    margin: '0 auto 1vh auto',
                    padding: '1vh 0',
                    borderBottom: '2px solid rgba(255,255,255,0.1)'
                },
                child: [
                    $({
                        tag: 'div',
                        text: 'USERNAME',
                        style: {
                            width: '15%',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '0.9vw',
                            color: '#888',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05vw',
                            paddingLeft: '1vw'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'EMAIL',
                        style: {
                            width: '40%',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '0.9vw',
                            color: '#888',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05vw'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'PASSWORD',
                        style: {
                            width: '20%',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '0.9vw',
                            color: '#888',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05vw',
                            textAlign: 'center'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: 'ACTIONS',
                        style: {
                            width: '25%',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontSize: '0.9vw',
                            color: '#888',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05vw',
                            textAlign: 'right',
                            paddingRight: '1vw'
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
                flexDirection: 'column'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '10%',
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                                        gap: '1vw'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-users'
                                            },
                                            style: {
                                                fontSize: '1.5vw',
                                                color: '#00bcd4'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'RDE Staff Management',
                                            style: {
                                                width: '100%',
                                                textAlign:'center',
                                                fontFamily:'arial black, san-serif',
                                                color:'rgba(200,200,200,0.5)',
                                                marginBottom:'2vh',
                                                fontSize:'1.5vw',
                                                letterSpacing:'0.1vw',
                                                textTransform:'uppercase',
                                                textShadow:'0 0 10px rgba(0,191,255,0.3)'
                                            }
                                        })
                                    ]
                                }),
                                SearchInput() // Now SearchInput is defined and can be called
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
                    marginBottom: '2vh',
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
            })
            const submit = $({
                tag: 'div',
                style: {
                    background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                    padding: '0.8rem 2rem',
                    borderRadius: '2vw',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1vw',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    marginTop: '1vh'
                },
                text: 'Save Changes',
                event: {
                    type: 'click',
                    method: () => {
                        if (confirm("Save Changes?")) {
                            const req = new Request(reqUrl)
                            req.Post([
                                {
                                    name: 'userID',
                                    value: userID
                                },
                                {
                                    name: reqName,
                                    value: '0'
                                },
                                {
                                    name: 'fullNameInput',
                                    value: inputName
                                }
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
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(5px)'
                },
                elementHandler: (el) => {
                    mainBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '35%',
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
                                        mainBox.remove()
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
                                text: label,
                                style: {
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontSize: '1.8vw',
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginBottom: '3vh',
                                    fontWeight: '600',
                                    letterSpacing: '0.1vw'
                                }
                            }),
                            input,
                            submit
                        ]
                    })
                ]
            }))
        }

        const ChangePassRde = ({ reqUrl, reqName, label, placeHolder }) => {
            let mainBox
            let inputName

            const PasswordField = ({ id, placeholder }) => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        marginBottom: '2vh',
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
                                id: id,
                                placeholder: placeholder
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
                                input: (ev) => {
                                    if (id === 'newPassword') {
                                        inputName = ev.target.value
                                    }
                                },
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
                    background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                    padding: '0.8rem 2rem',
                    borderRadius: '2vw',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1vw',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    marginTop: '1vh'
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
                                {
                                    name: 'userID',
                                    value: userID
                                },
                                {
                                    name: reqName,
                                    value: '0'
                                },
                                {
                                    name: 'changePassInput',
                                    value: newPass
                                }
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
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(5px)'
                },
                elementHandler: (el) => {
                    mainBox = el
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '35%',
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
                                        mainBox.remove()
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
                                text: label,
                                style: {
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontSize: '1.8vw',
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginBottom: '3vh',
                                    fontWeight: '600',
                                    letterSpacing: '0.1vw'
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
                backgroundColor: 'rgba(0,0,0,0.3)'
            },
            elementHandler: (el) => {
                acBody = el
                const req = new Request('/rdeaccreq')
                req.Post([
                    {
                        name: 'accountIdRde',
                        value: '0',
                    },
                    {
                        name: 'userID',
                        value: userID
                    }
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
                        top: '2vh',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5vw',
                        cursor: 'pointer',
                        padding: '0.5vh 1vw',
                        borderRadius: '2vw',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s ease'
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
                                fontSize: '1vw',
                                color: '#00bcd4'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                fontFamily: 'Segoe UI, sans-serif',
                                fontSize: '0.95vw',
                                color: '#e0e0e0'
                            },
                            text: 'Back to List'
                        })
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            window.location.assign('/admin/accountList/rdestaff/list')
                        }
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '40%',
                        height: 'fit-content',
                        margin: 'auto',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: '2rem',
                        borderRadius: '1vw',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                textAlign: 'center',
                                marginBottom: '3vh'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-user-circle'
                                    },
                                    style: {
                                        fontSize: '4vw',
                                        color: '#00bcd4',
                                        opacity: '0.8'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: 'RDE Staff Details',
                                    style: {
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '1.5vw',
                                        color: '#fff',
                                        fontWeight: '600',
                                        marginTop: '1vh'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5vh'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '0.5vw',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-user'
                                            },
                                            style: {
                                                color: '#00bcd4',
                                                fontSize: '1vw',
                                                width: '2vw'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Full Name:',
                                            style: {
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontSize: '0.95vw',
                                                color: '#888',
                                                width: '8vw'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                flex: '1',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontSize: '0.95vw',
                                                color: '#e0e0e0'
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
                                                color: '#00bcd4',
                                                cursor: 'pointer',
                                                fontSize: '1vw',
                                                padding: '0.3vw',
                                                borderRadius: '0.2vw',
                                                transition: 'all 0.3s ease'
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
                                        padding: '1rem',
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: '0.5vw',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-at'
                                            },
                                            style: {
                                                color: '#00bcd4',
                                                fontSize: '1vw',
                                                width: '2vw'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Username:',
                                            style: {
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontSize: '0.95vw',
                                                color: '#888',
                                                width: '8vw'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            style: {
                                                flex: '1',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                fontSize: '0.95vw',
                                                color: '#e0e0e0'
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
                                                color: '#00bcd4',
                                                cursor: 'pointer',
                                                fontSize: '1vw',
                                                padding: '0.3vw',
                                                borderRadius: '0.2vw',
                                                transition: 'all 0.3s ease'
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
                                        padding: '1rem',
                                        backgroundColor: 'rgba(0,188,212,0.1)',
                                        borderRadius: '0.5vw',
                                        border: '1px solid rgba(0,188,212,0.3)',
                                        marginTop: '1vh',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1vw'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        className: 'fa-solid fa-key'
                                                    },
                                                    style: {
                                                        color: '#00bcd4',
                                                        fontSize: '1.2vw'
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    text: 'Change Password',
                                                    style: {
                                                        fontFamily: 'Segoe UI, sans-serif',
                                                        fontSize: '1vw',
                                                        color: '#00bcd4',
                                                        fontWeight: '600'
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
                                                color: '#00bcd4',
                                                fontSize: '1vw'
                                            }
                                        })
                                    ],
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            acBody.appendChild(ChangePassRde({
                                                reqUrl: '/rdeaccreq',
                                                reqName: 'editPass',
                                                label: 'Change Password',
                                                placeHolder: 'New Password'
                                            }))
                                        },
                                        mouseover: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.15)'
                                        },
                                        mouseout: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.1)'
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

const TabButton = ({label, url}) => {



    const getActive = (button) => {

        if (url.split('/')[3] === window.location.href.replace(window.location.origin, '').split('/')[3]) {

            button.className += ' tabsAccountActive'

        }

    }



    return ($({

        tag: 'td',

        att: {

            className: 'tabsAccount'

        },

        elementHandler: getActive,

        text: label,

        event: {

            type: 'click',

            method: () => {

                window.location.assign(url)

            }

        }

    }))

}



const page = [];
page.push({
    url: '/admin/accountList/CapsuUser',
    tab: TabButton({label: "CAPSU Account", url: '/admin/accountList/CapsuUser'}),
    page: capUser
})

page.push({
    url: '/admin/accountList/Evaluator',
    tab: TabButton({label: "Evaluators Account", url: '/admin/accountList/Evaluator'}),
    page: evalPage
})

page.push({
    url: '/admin/accountList/rdestaff/list',
    tab: TabButton({label: "RDE Staff", url: '/admin/accountList/rdestaff/list'}),
    page: rdePage
})



const Tabs = () => {
    const getTable = (table) => {
        page.forEach(val => {
            table.appendChild(val.tab)
        })
    }
    return ($({
        tag: 'table',
        att: {
            className: 'accountTabsTable'
        },
        child: [
            $({
                tag: 'tr',
                elementHandler: getTable
            })
        ]
    }))
}

const pageFrame = () => {
    const getFrame = (frame) => {
        let frameState = true
        page.forEach(val => {
            const current=window.location.href
            const origin=window.location.origin
            const rout=current.replace(origin,'')
            if (val.url.split('/')[3] === rout.split('/')[3]) {
                frame.appendChild(val.page())
                frameState = false
            }
        })
        if (frameState) {
            frame.appendChild(Error())
        }
    }
    return ($({
        tag: 'div',
        elementHandler: getFrame,
        att: {
            className: 'pageFrameAdmin'
        }
    }))
}

export const AccountList = () => {
    return ($({
        externalStyle: '/client/component/adminComponent/componentStyle/account.css',
        tag: 'div',
        att: {
            className: 'accountList '
        },
        child: [
            Tabs(),
            pageFrame(),
        ]
    }))
}
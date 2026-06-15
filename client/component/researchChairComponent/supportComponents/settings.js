import { $, ConfirmationAlert, Waiting, SpecialChar, CustomModal, AlertModal } from '../../../lib/lib.js'

const userInfo = () => {
    const left = () => {
        let leftMain = null
        const LabelTop = $({
            tag: 'div',
            att: {
                className: 'usersLabel'
            },
            text: "Research Chair Information",
        })
        
        const container = ({child, buttonEvent}) => {
            const getbod = (bod) => {
                if (child) {
                    bod.append(child)
                }
            }
            const leftPart = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '85%',
                        height: '100%',
                        margin: 'auto',
                    },
                    elementHandler: getbod
                }))
            }
            const getBot = (bot) => {
                bot.addEventListener('click', () => buttonEvent())
            }
            const rightBot = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '40px',
                        height: '40px',
                        margin: 'auto',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        fontSize: '18px',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa fa-edit pointerUser',
                            },
                            style: {
                                color: '#64748b',
                                fontSize: '18px',
                                transition: 'all 0.2s ease'
                            },
                            elementHandler: getBot,
                            event: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.currentTarget.style.color = '#1976D2';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    if (e.currentTarget.parentElement) {
                                        e.currentTarget.parentElement.style.backgroundColor = '#f1f5f9';
                                    }
                                },
                                type2: 'mouseleave',
                                method2: (e) => {
                                    e.currentTarget.style.color = '#64748b';
                                    e.currentTarget.style.transform = 'scale(1)';
                                    if (e.currentTarget.parentElement) {
                                        e.currentTarget.parentElement.style.backgroundColor = 'transparent';
                                    }
                                }
                            }
                        })
                    ]
                }))
            }
            return ($({
                tag: 'div',
                att: {
                    className: 'perInfo'
                },
                child: [
                    leftPart(),
                    rightBot()
                ]
            }))
        }

        const UserInfo = ({data, label}) => {
            const Name = $({
                tag: 'td',
                style: {
                    color: '#1a2a3a'
                },
                text: data || 'Loading...'
            })
            return ($({
                tag: 'table',
                att: {
                    className: 'tableUser'
                },
                child: [
                    Name,
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                style: {
                                    color: '#999',
                                    fontSize: '1vw'
                                },
                                text: label
                            })
                        ]
                    })
                ]
            }))
        }
        
        // Create a wrapper div to hold all content
        const wrapperDiv = $({ 
            tag: 'div',
            att: {
                className: 'leftUserInfo'
            }
        })
        
        // Add label first
        wrapperDiv.appendChild(LabelTop)
        leftMain = wrapperDiv
        
        // Store references to containers for updates
        let fullNameContainer = null
        let designationContainer = null
        let emailContainer = null
        
        // Function to refresh the data display
        const refreshData = async () => {
            try {
                const form = new FormData()
                form.append('getResearchChairSettings', 'true')
                const response = await fetch('/researchChairSettings', {
                    method: 'POST',
                    body: form
                })
                const data = await response.json()
                
                if (data.status && data.data) {
                    if (fullNameContainer) {
                        const nameCell = fullNameContainer.querySelector('.tableUser td:first-child')
                        if (nameCell) nameCell.innerText = data.data.fullName || 'Not set'
                    }
                    if (designationContainer) {
                        const desigCell = designationContainer.querySelector('.tableUser td:first-child')
                        if (desigCell) desigCell.innerText = data.data.designation || 'Not set'
                    }
                    if (emailContainer) {
                        const emailCell = emailContainer.querySelector('.tableUser td:first-child')
                        if (emailCell) emailCell.innerText = data.data.email || 'Not set'
                    }
                }
            } catch (error) {
                console.error('Error refreshing data:', error)
            }
        }
        
        const showEditNameModal = () => {
            let currentData = ''
            const modalContent = $({
                tag: 'div',
                style: { padding: '10px 0' },
                child: [
                    $({
                        tag: 'div',
                        style: { marginBottom: '20px' },
                        child: [
                            $({
                                tag: 'label',
                                text: 'Full Name',
                                style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                            }),
                            $({
                                tag: 'input',
                                att: { 
                                    type: 'text', 
                                    placeholder: 'Enter full name',
                                    className: 'nameField'
                                },
                                style: {
                                    width: '100%',
                                    padding: '12px 14px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e8ecf0',
                                    borderRadius: '10px',
                                    color: '#1a2a3a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.currentTarget.style.borderColor = '#1976D2';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.currentTarget.style.borderColor = '#e8ecf0';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    },
                                    type3: 'input',
                                    method3: (el) => { currentData = el.target.value }
                                }
                            })
                        ]
                    })
                ]
            })
            
            const footer = ({ closeModal }) => {
                return $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e8ecf0',
                                borderRadius: '10px',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: { 
                                type: 'click', 
                                method: () => closeModal(),
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e8ecf0';
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#1976D2',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: async () => {
                                    if (!currentData) {
                                        AlertModal({ title: 'Error', message: 'Please enter a name' })
                                        return
                                    }
                                    closeModal()
                                    let loading = Waiting()
                                    document.body.appendChild(loading)
                                    const form = new FormData()
                                    form.append('changeResearchChairName', 'true')
                                    form.append('data', currentData)
                                    try {
                                        const response = await fetch('/researchChairSettings', {
                                            method: 'POST',
                                            body: form
                                        })
                                        const result = await response.json()
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                                            refreshData()
                                        }))
                                    } catch (error) {
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert('Error: ' + error.message))
                                    }
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1565C0';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1976D2';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }
                        })
                    ]
                })
            }
            
            CustomModal({
                title: 'Edit Full Name',
                content: modalContent,
                footer: footer,
                size: 'small'
            })
        }

        const showEditDesignationModal = () => {
            let currentData = ''
            const modalContent = $({
                tag: 'div',
                style: { padding: '10px 0' },
                child: [
                    $({
                        tag: 'div',
                        style: { marginBottom: '20px' },
                        child: [
                            $({
                                tag: 'label',
                                text: 'Designation',
                                style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                            }),
                            $({
                                tag: 'input',
                                att: { 
                                    type: 'text', 
                                    placeholder: 'Enter designation',
                                    className: 'nameField'
                                },
                                style: {
                                    width: '100%',
                                    padding: '12px 14px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e8ecf0',
                                    borderRadius: '10px',
                                    color: '#1a2a3a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.currentTarget.style.borderColor = '#1976D2';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.currentTarget.style.borderColor = '#e8ecf0';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    },
                                    type3: 'input',
                                    method3: (el) => { currentData = el.target.value }
                                }
                            })
                        ]
                    })
                ]
            })
            
            const footer = ({ closeModal }) => {
                return $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e8ecf0',
                                borderRadius: '10px',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: { 
                                type: 'click', 
                                method: () => closeModal(),
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e8ecf0';
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#1976D2',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: async () => {
                                    if (!currentData) {
                                        AlertModal({ title: 'Error', message: 'Please enter a designation' })
                                        return
                                    }
                                    closeModal()
                                    let loading = Waiting()
                                    document.body.appendChild(loading)
                                    const form = new FormData()
                                    form.append('changeResearchChairDesignation', 'true')
                                    form.append('data', currentData)
                                    try {
                                        const response = await fetch('/researchChairSettings', {
                                            method: 'POST',
                                            body: form
                                        })
                                        const result = await response.json()
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                                            refreshData()
                                        }))
                                    } catch (error) {
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert('Error: ' + error.message))
                                    }
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1565C0';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1976D2';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }
                        })
                    ]
                })
            }
            
            CustomModal({
                title: 'Edit Designation',
                content: modalContent,
                footer: footer,
                size: 'small'
            })
        }

        const showEditEmailModal = () => {
            let currentData = ''
            const modalContent = $({
                tag: 'div',
                style: { padding: '10px 0' },
                child: [
                    $({
                        tag: 'div',
                        style: { marginBottom: '20px' },
                        child: [
                            $({
                                tag: 'label',
                                text: 'Email Address',
                                style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                            }),
                            $({
                                tag: 'input',
                                att: { 
                                    type: 'email', 
                                    placeholder: 'Enter email address',
                                    className: 'nameField'
                                },
                                style: {
                                    width: '100%',
                                    padding: '12px 14px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e8ecf0',
                                    borderRadius: '10px',
                                    color: '#1a2a3a',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'focus',
                                    method: (e) => {
                                        e.currentTarget.style.borderColor = '#1976D2';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                    },
                                    type2: 'blur',
                                    method2: (e) => {
                                        e.currentTarget.style.borderColor = '#e8ecf0';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    },
                                    type3: 'input',
                                    method3: (el) => { currentData = el.target.value }
                                }
                            })
                        ]
                    })
                ]
            })
            
            const footer = ({ closeModal }) => {
                return $({
                    tag: 'div',
                    style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Cancel',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e8ecf0',
                                borderRadius: '10px',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: { 
                                type: 'click', 
                                method: () => closeModal(),
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e8ecf0';
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#1976D2',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: async () => {
                                    if (!currentData) {
                                        AlertModal({ title: 'Error', message: 'Please enter an email address' })
                                        return
                                    }
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                    if (!emailRegex.test(currentData)) {
                                        AlertModal({ title: 'Error', message: 'Please enter a valid email address' })
                                        return
                                    }
                                    closeModal()
                                    let loading = Waiting()
                                    document.body.appendChild(loading)
                                    const form = new FormData()
                                    form.append('changeResearchChairEmail', 'true')
                                    form.append('data', currentData)
                                    try {
                                        const response = await fetch('/researchChairSettings', {
                                            method: 'POST',
                                            body: form
                                        })
                                        const result = await response.json()
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert(result.message, () => {
                                            refreshData()
                                        }))
                                    } catch (error) {
                                        loading.remove()
                                        document.body.appendChild(ConfirmationAlert('Error: ' + error.message))
                                    }
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1565C0';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.currentTarget.style.backgroundColor = '#1976D2';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }
                        })
                    ]
                })
            }
            
            CustomModal({
                title: 'Edit Email Address',
                content: modalContent,
                footer: footer,
                size: 'small'
            })
        }
        
        const createFullNameContainer = () => {
            const cont = container({
                child: UserInfo({ data: 'Loading...', label: 'Full Name' }),
                buttonEvent: showEditNameModal
            })
            fullNameContainer = cont
            return cont
        }
        
        const createDesignationContainer = () => {
            const cont = container({
                child: UserInfo({ data: 'Loading...', label: 'Designation' }),
                buttonEvent: showEditDesignationModal
            })
            designationContainer = cont
            return cont
        }
        
        const createEmailContainer = () => {
            const cont = container({
                child: UserInfo({ data: 'Loading...', label: 'Email address' }),
                buttonEvent: showEditEmailModal
            })
            emailContainer = cont
            return cont
        }
        
        // Add containers to wrapper
        wrapperDiv.appendChild(createFullNameContainer())
        wrapperDiv.appendChild(createDesignationContainer())
        wrapperDiv.appendChild(createEmailContainer())
        
        // Load initial data
        refreshData()
        
        return wrapperDiv
    }

    const right = () => {
        let mainRight
        const getMain = (element) => {
            mainRight = element
        }

        const label = $({
            tag: 'div',
            att: {
                className: 'rightLabel'
            },
            text: 'Account Security'
        })

        const UserName = () => {
            const usernameCell = $({
                tag: 'td',
                style: { textAlign: 'center' },
                text: 'Loading...'
            })
            
            const loadUsername = async () => {
                try {
                    const form = new FormData()
                    form.append('getResearchChairSettings', 'true')
                    const response = await fetch('/researchChairSettings', {
                        method: 'POST',
                        body: form
                    })
                    const data = await response.json()
                    usernameCell.innerText = data.data?.username || 'Not set'
                } catch (error) {
                    usernameCell.innerText = 'Error loading'
                }
            }
            loadUsername()
            
            return ($({
                tag: 'table',
                att: { className: 'userLabel' },
                child: [
                    $({ tag: 'tr', child: [usernameCell] }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: 'Username',
                                style: { fontWeight: 'normal', color: '#0b0b0b', fontSize: '1vw', textAlign: 'center' }
                            })
                        ]
                    })
                ]
            }))
        }

        const Container = () => {
            // Edit Username Modal
            const showEditUsernameModal = () => {
                let newUsername = ''
                let password = ''
                
                const modalContent = $({
                    tag: 'div',
                    style: { padding: '10px 0' },
                    child: [
                        $({
                            tag: 'div',
                            style: { marginBottom: '20px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'New Username',
                                    style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { 
                                        type: 'text', 
                                        placeholder: 'Enter new username',
                                        maxLength: '20'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e8ecf0',
                                        borderRadius: '10px',
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1976D2';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        },
                                        type2: 'blur',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8ecf0';
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                        },
                                        type3: 'input',
                                        method3: (el) => { newUsername = el.target.value }
                                    },
                                    elementHandler: SpecialChar
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { marginBottom: '10px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'Password',
                                    style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { 
                                        type: 'password', 
                                        placeholder: 'Enter your password to confirm',
                                        maxLength: '20'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e8ecf0',
                                        borderRadius: '10px',
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1976D2';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        },
                                        type2: 'blur',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8ecf0';
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                        },
                                        type3: 'input',
                                        method3: (el) => { password = el.target.value }
                                    }
                                })
                            ]
                        })
                    ]
                })
                
                const footer = ({ closeModal }) => {
                    return $({
                        tag: 'div',
                        style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Cancel',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e8ecf0',
                                    borderRadius: '10px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                },
                                event: { 
                                    type: 'click', 
                                    method: () => closeModal(),
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#e8ecf0';
                                    }
                                }
                            }),
                            $({
                                tag: 'button',
                                text: 'Update Username',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#1976D2',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: async () => {
                                        if (!newUsername) {
                                            AlertModal({ title: 'Error', message: 'Please enter a new username' })
                                            return
                                        }
                                        if (!password) {
                                            AlertModal({ title: 'Error', message: 'Please enter your password' })
                                            return
                                        }
                                        closeModal()
                                        let loading = Waiting()
                                        document.body.appendChild(loading)
                                        const form = new FormData()
                                        form.append('editResearchChairUserName', 'true')
                                        form.append('userNameUpdate', newUsername)
                                        form.append('password', password)
                                        try {
                                            const response = await fetch('/researchChairSettings', {
                                                method: 'POST',
                                                body: form
                                            })
                                            const result = await response.json()
                                            loading.remove()
                                            document.body.appendChild(ConfirmationAlert(result.message, () => {
                                                window.location.reload()
                                            }))
                                        } catch (error) {
                                            loading.remove()
                                            document.body.appendChild(ConfirmationAlert('Error: ' + error.message))
                                        }
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1565C0';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1976D2';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }
                            })
                        ]
                    })
                }
                
                CustomModal({
                    title: 'Change Username',
                    content: modalContent,
                    footer: footer,
                    size: 'small'
                })
            }
            
            // Edit Password Modal
            const showEditPasswordModal = () => {
                let oldPass = ''
                let newPass = ''
                let confirmPass = ''
                
                const modalContent = $({
                    tag: 'div',
                    style: { padding: '10px 0' },
                    child: [
                        $({
                            tag: 'div',
                            style: { marginBottom: '20px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'Current Password',
                                    style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Enter current password' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e8ecf0',
                                        borderRadius: '10px',
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: { 
                                        type: 'focus',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1976D2';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        },
                                        type2: 'blur',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8ecf0';
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                        },
                                        type3: 'input',
                                        method3: (el) => { oldPass = el.target.value }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { marginBottom: '20px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'New Password',
                                    style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Enter new password (min. 8 characters)', maxLength: '20' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e8ecf0',
                                        borderRadius: '10px',
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1976D2';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        },
                                        type2: 'blur',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8ecf0';
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                        },
                                        type3: 'input',
                                        method3: (el) => { newPass = el.target.value }
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { marginBottom: '10px' },
                            child: [
                                $({
                                    tag: 'label',
                                    text: 'Confirm New Password',
                                    style: { display: 'block', color: '#1a2a3a', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Confirm new password' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e8ecf0',
                                        borderRadius: '10px',
                                        color: '#1a2a3a',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'focus',
                                        method: (e) => {
                                            e.currentTarget.style.borderColor = '#1976D2';
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        },
                                        type2: 'blur',
                                        method2: (e) => {
                                            e.currentTarget.style.borderColor = '#e8ecf0';
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                        },
                                        type3: 'input',
                                        method3: (el) => { confirmPass = el.target.value }
                                    }
                                })
                            ]
                        })
                    ]
                })
                
                const footer = ({ closeModal }) => {
                    return $({
                        tag: 'div',
                        style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
                        child: [
                            $({
                                tag: 'button',
                                text: 'Cancel',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e8ecf0',
                                    borderRadius: '10px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                },
                                event: { 
                                    type: 'click', 
                                    method: () => closeModal(),
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#e8ecf0';
                                    }
                                }
                            }),
                            $({
                                tag: 'button',
                                text: 'Update Password',
                                style: {
                                    padding: '10px 24px',
                                    backgroundColor: '#1976D2',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                },
                                event: {
                                    type: 'click',
                                    method: async () => {
                                        if (!oldPass || !newPass || !confirmPass) {
                                            AlertModal({ title: 'Error', message: 'Please fill in all fields' })
                                            return
                                        }
                                        if (newPass !== confirmPass) {
                                            AlertModal({ title: 'Error', message: 'New passwords do not match' })
                                            return
                                        }
                                        if (newPass.length < 8) {
                                            AlertModal({ title: 'Error', message: 'Password must be at least 8 characters' })
                                            return
                                        }
                                        closeModal()
                                        let loading = Waiting()
                                        document.body.appendChild(loading)
                                        const form = new FormData()
                                        form.append('editResearchChairPassword', 'true')
                                        form.append('oldPass', oldPass)
                                        form.append('newPass', newPass)
                                        form.append('retypePass', confirmPass)
                                        try {
                                            const response = await fetch('/researchChairSettings', {
                                                method: 'POST',
                                                body: form
                                            })
                                            const result = await response.json()
                                            loading.remove()
                                            document.body.appendChild(ConfirmationAlert(result.message, () => {
                                                window.location.reload()
                                            }))
                                        } catch (error) {
                                            loading.remove()
                                            document.body.appendChild(ConfirmationAlert('Error: ' + error.message))
                                        }
                                    },
                                    type2: 'mouseenter',
                                    method2: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1565C0';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    },
                                    type3: 'mouseleave',
                                    method3: (e) => {
                                        e.currentTarget.style.backgroundColor = '#1976D2';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }
                            })
                        ]
                    })
                }
                
                CustomModal({
                    title: 'Change Password',
                    content: modalContent,
                    footer: footer,
                    size: 'small'
                })
            }
            
            return ($({
                tag: 'table',
                att: { className: 'rightClass' },
                child: [
                    $({
                        tag: 'tr',
                        att: { className: 'trBot' },
                        event: { 
                            type: 'click', 
                            method: showEditUsernameModal,
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateX(5px)';
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        },
                        child: [
                            $({ 
                                tag: 'td', 
                                att: { className: 'acBot' }, 
                                style: { width: '50px' },
                                child: [
                                    $({ 
                                        tag: 'span', 
                                        att: { className: 'fa-solid fa-user-pen' }, 
                                        style: { color: '#1976D2', fontSize: '18px' }
                                    })
                                ] 
                            }),
                            $({ 
                                tag: 'td', 
                                text: 'Change Username',
                                style: { color: '#1a2a3a', fontWeight: '500' }
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        att: { className: 'trBot' },
                        event: { 
                            type: 'click', 
                            method: showEditPasswordModal,
                            type2: 'mouseenter',
                            method2: (e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.transform = 'translateX(5px)';
                            },
                            type3: 'mouseleave',
                            method3: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        },
                        child: [
                            $({ 
                                tag: 'td', 
                                att: { className: 'acBot' }, 
                                style: { width: '50px' },
                                child: [
                                    $({ 
                                        tag: 'span', 
                                        att: { className: 'fa-solid fa-key' }, 
                                        style: { color: '#1976D2', fontSize: '18px' }
                                    })
                                ] 
                            }),
                            $({ 
                                tag: 'td', 
                                text: 'Change Password',
                                style: { color: '#1a2a3a', fontWeight: '500' }
                            })
                        ]
                    })
                ]
            }))
        }
        
        return ($({
            tag: 'div',
            att: { className: 'rightUserInfo' },
            elementHandler: getMain,
            child: [label, UserName(), Container()]
        }))
    }
    
    return ($({
        tag: 'div',
        att: { className: 'userInfoDiv' },
        child: [left(), right()]
    }))
}

const Tabs = ({getHeader}) => {
    return ($({
        tag: 'table',
        att: { className: 'tabsSettings' },
        child: [$({ tag: 'tr', elementHandler: getHeader })]
    }))
}

const FrameBody = ({getFrameBody}) => {
    return ($({
        tag: 'div',
        att: { className: 'settingsFrame' },
        elementHandler: getFrameBody
    }))
}

export const ResearchChairSettings = () => {
    const TabButton = ({url, label, state}) => {
        const getBot = (bot) => {
            if (state) {
                bot.className += ' setBotActive'
            }
            // Make it non-clickable
            bot.style.cursor = 'default'
            bot.style.pointerEvents = 'none'
        }
        return ($({
            tag: 'td',
            att: { className: 'settingsBot' },
            text: label,
            elementHandler: getBot,
            // Remove the click event entirely
        }))
    }
    
    const link = []
    link.push({
        button: (url) => {
            return (TabButton({
                url: '#',
                label: 'Research Chair Information',
                state: true 
            }))
        },
        page: userInfo,
    })

    const frameHolder = (frameBody) => {
        // Always show the userInfo page
        frameBody.appendChild(userInfo())
    }

    const getTabHeader = (tabHeader) => {
        link.forEach(val => {
            tabHeader.appendChild(val.button())
        })
        tabHeader.appendChild($({ tag: 'td', style: { width: 'auto' } }))
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/component/userComponent/userComponentStyle/settings.css',
        att: { className: 'settingsDiv' },
        child: [
            Tabs({ getHeader: getTabHeader }),
            FrameBody({ getFrameBody: frameHolder })
        ]
    }))
}
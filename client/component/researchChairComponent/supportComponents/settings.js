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
                        width: '10%',
                        height: '100%',
                        margin: 'auto',
                        justifyContent: 'center',
                        display: 'flex',
                        fontSize: '2vw',
                        color: 'deepskyblue'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa fa-edit pointerUser',
                            },
                            elementHandler: getBot
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
                    color: 'ghostwhite'
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
        
        // Edit Modal for Full Name
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
                                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                },
                                event: {
                                    type: 'input',
                                    method: (el) => { currentData = el.target.value }
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
                                padding: '8px 20px',
                                backgroundColor: '#444',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            },
                            event: { type: 'click', method: () => closeModal() }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '8px 24px',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
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
        
        // Edit Modal for Designation
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
                                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                },
                                event: {
                                    type: 'input',
                                    method: (el) => { currentData = el.target.value }
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
                                padding: '8px 20px',
                                backgroundColor: '#444',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            },
                            event: { type: 'click', method: () => closeModal() }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '8px 24px',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
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
        
        // Edit Modal for Email
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
                                style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                },
                                event: {
                                    type: 'input',
                                    method: (el) => { currentData = el.target.value }
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
                                padding: '8px 20px',
                                backgroundColor: '#444',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            },
                            event: { type: 'click', method: () => closeModal() }
                        }),
                        $({
                            tag: 'button',
                            text: 'Save',
                            style: {
                                padding: '8px 24px',
                                backgroundColor: '#4caf50',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
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
        
        // Create and store containers
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
                                style: { fontWeight: 'normal', color: '#bbb', fontSize: '1vw', textAlign: 'center' }
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
                                    style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (el) => { newUsername = el.target.value }
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
                                    style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
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
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (el) => { password = el.target.value }
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
                                    padding: '8px 20px',
                                    backgroundColor: '#444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                },
                                event: { type: 'click', method: () => closeModal() }
                            }),
                            $({
                                tag: 'button',
                                text: 'Update Username',
                                style: {
                                    padding: '8px 24px',
                                    backgroundColor: '#2196F3',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
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
                                    style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Enter current password' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    },
                                    event: { type: 'input', method: (el) => { oldPass = el.target.value } }
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
                                    style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Enter new password', maxLength: '20', minLength: '8' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    },
                                    event: { type: 'input', method: (el) => { newPass = el.target.value } }
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
                                    style: { display: 'block', color: '#bbb', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }
                                }),
                                $({
                                    tag: 'input',
                                    att: { type: 'password', placeholder: 'Confirm new password' },
                                    style: {
                                        width: '100%',
                                        padding: '12px 14px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    },
                                    event: { type: 'input', method: (el) => { confirmPass = el.target.value } }
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
                                    padding: '8px 20px',
                                    backgroundColor: '#444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                },
                                event: { type: 'click', method: () => closeModal() }
                            }),
                            $({
                                tag: 'button',
                                text: 'Update Password',
                                style: {
                                    padding: '8px 24px',
                                    backgroundColor: '#2196F3',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
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
                        event: { type: 'click', method: showEditUsernameModal },
                        child: [
                            $({ tag: 'td', att: { className: 'acBot' }, child: [$({ tag: 'span', att: { className: 'fa-solid fa-user-pen acBotUser' } })] }),
                            $({ tag: 'td', text: 'Change Username' })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        att: { className: 'trBot' },
                        event: { type: 'click', method: showEditPasswordModal },
                        child: [
                            $({ tag: 'td', att: { className: 'acBot' }, child: [$({ tag: 'span', att: { className: 'fa-solid fa-key acBotUser' } })] }),
                            $({ tag: 'td', text: 'Change Password' })
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
                state: true // Always active
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
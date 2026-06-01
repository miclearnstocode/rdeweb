import {$, CapsuOffice, ConfirmationAlert, Request, SpecialChar, Waiting} from '../lib/lib.js'

/**

 * It creates a login panel

 * @param prop - the props that you want to pass to the component

 * @returns A function that returns a div element with a table element inside it.

 */

const LoginPanel = (prop) => {

    let username
    let password
    let usertype
    let form
    let formUserType
    let UserTypeStat=true
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

    // Toggle password visibility function
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
        if (!username) return null;
        
        const userLower = username.toLowerCase();
        
        // Detect admin users
        if (userLower.includes('admin') || userLower.includes('administrator')) {
            return 'ADMIN';
        }
        
        // Detect CAPSU users (capsu.edu.ph domain)
        if (userLower.includes('@capsu.edu.ph')) {
            return 'CAPSUUSERS';
        }
        
        // Detect evaluators
        if (userLower.includes('eval') || userLower.includes('evaluator')) {
            return 'EVALUATOR';
        }
        
        // Detect RDE office
        if (userLower.includes('rde') || userLower.includes('office') || userLower.includes('staff')) {
            return 'RDEOFFICE';
        }
        
        // Detect Research Chair
        if (userLower.includes('chair') || userLower.includes('research')) {
            return 'RESEARCH_CHAIR';
        }
        
        return null;
    }

    const autoSelectUserType = (username) => {
        if (!username || !selType) return;
        
        const detectedType = detectUserType(username);
        if (detectedType && selType) {
            selType.value = detectedType;
            
            if (prop.onAutoDetect) {
                prop.onAutoDetect(detectedType);
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
                position: 'relative'
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
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        color: '#ddd',
                        paddingRight: '2.5rem',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'none'
                    },
                    elementHandler: (el) => {
                        selType = el;
                    },
                    child: [
                        $({
                            tag: 'option',
                            text: 'Select User Type',
                            att: {
                                disabled: true,
                                selected: true,
                                value: '',
                                className: 'bg-dark text-muted'
                            }
                        }),
                        $({
                            tag: 'option',
                            text: 'Admin',
                            att: {
                                value: 'ADMIN',
                                className: 'bg-dark'
                            },
                        }),
                        $({
                            tag: 'option',
                            text: 'CAPSU Center Users',
                            att: {
                                value: 'CAPSUUSERS',
                                className: 'bg-dark'
                            },
                        }),
                        $({
                            tag: 'option',
                            text: 'CAPSU Research Chair User',
                            att: {
                                value: 'RESEARCH_CHAIR',
                                className: 'bg-dark'
                            },
                        }),
                        $({
                            tag: 'option',
                            text: 'Evaluators',
                            att: {
                                value: 'EVALUATOR',
                                className: 'bg-dark'
                            },
                        }),
                        $({
                            tag: 'option',
                            text: 'RDE Office',
                            att: {
                                value: 'RDEOFFICE',
                                className: 'bg-dark'
                            },
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    att: {
                        className: 'dropdown-indicator'
                    },
                    style: {
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#999',
                        fontSize: '1.2rem'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: {
                                className: 'fa-solid fa-chevron-down'
                            }
                        })
                    ]
                })
            ]
        })
    }

    return ($({

        tag: 'div',

        att: {

            className: 'logInDiv'

        },

        child: [
            $({
                tag:'div',
                att:{
                    className:' col-md-12',
                },
                child:[
                    $({
                        tag:'form',
                        att:{
                            method:'POST',
                        },
                        event:{
                            type:'submit',
                            method:async (ev)=>{
                                ev.preventDefault()

                                // Auto-detect if no selection made
                                if (!selType.value && ev.target.username.value) {
                                    const detectedType = detectUserType(ev.target.username.value);
                                    if (detectedType) {
                                        selType.value = detectedType;
                                    }
                                }

                                if(selType.value===''){
                                    let form= new FormData(ev.target)
                                    form.append('auth','login')
                                    await fetch('/server/visitorAuth.php',{
                                        method:'POST',
                                        body:form,
                                    }).then(res=>res.json())
                                        .then(data=>{
                                            if(data.status){
                                                window.location.replace(data.message)
                                            }else {
                                                window.location.replace('/')
                                            }
                                        })
                                }else {
                                    let form= new FormData(ev.target)
                                    form.append('auth','login')
                                    
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
                                        // Use the research chair auth endpoint
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
                        child:[
                            $({
                                tag:'div',
                                att:{
                                    className:'form-check text-start my-2'
                                },
                                child:[
                                    $({
                                        tag:'input',
                                        att:{
                                            type:'checkbox',
                                            name:'isExternal',
                                            className:'form-check-input',
                                            id:'externalId'
                                        },
                                        event:{
                                            type:'input',
                                            method:()=>{
                                                if(UserTypeStat){
                                                    selType.remove()
                                                }else {
                                                    formUserType.appendChild(sel())
                                                }
                                                UserTypeStat=!UserTypeStat
                                            }
                                        },
                                    }),
                                    $({
                                        tag:'label',
                                        att:{
                                            className:'form-check-label',
                                        },
                                        elementHandler:(el)=>{
                                            el.setAttribute('for','externalId')
                                        },
                                        text:'External users?',
                                        style:{
                                            color:'deepskyblue'
                                        }
                                    }),
                                ]
                            }),
                            $({
                                tag:'div',
                                elementHandler:(el)=>{
                                    formUserType=el
                                },
                                child:[
                                    sel()
                                ]
                            }),

                            $({
                                tag:'div',
                                att:{
                                    className:'input-group mb-3 input-group-floating'
                                },
                                child:[
                                    $({
                                        tag:'span',
                                        att:{
                                            className:'input-group-text'
                                        },
                                        child:[
                                            $({
                                                tag:'i',
                                                att:{
                                                    className:'fa-solid fa-user'
                                                }
                                            })
                                        ],
                                        style:{
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            color:'black',
                                            fontSize: '1.7rem'
                                        }
                                    }),
                                    $({
                                        tag:'input',
                                        att:{
                                            type:'text',
                                            className:'form-control',
                                            name:'username',
                                            id:'userNid',
                                            placeholder:' ',
                                            required:true,
                                            autocomplete: 'username'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (event) => {
                                                // Auto-detect user type when typing
                                                if (event.target.value && !selType.value) {
                                                    setTimeout(() => {
                                                        autoSelectUserType(event.target.value);
                                                    }, 500);
                                                }
                                            }
                                        },
                                        style:{
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            color:'#ddd',
                                            border: 'none'
                                        }
                                    }),
                                    $({
                                        tag:'username-label',
                                        att:{
                                            for: 'userNid'
                                        },
                                        text:'Username or email address',
                                        style:{
                                            color:'#999',
                                            backgroundColor: 'transparent'
                                        }
                                    })
                                ]
                            }),

                            // Password field with eye icon
                            $({
                                tag:'div',
                                att:{
                                    className:'input-group mb-3 input-group-floating password-container'
                                },
                                style:{
                                    position: 'relative'
                                },
                                child:[
                                    $({
                                        tag:'span',
                                        att:{
                                            className:'input-group-text'
                                        },
                                        child:[
                                            $({
                                                tag:'i',
                                                att:{
                                                    className:'fa-solid fa-lock'
                                                }
                                            })
                                        ],
                                        style:{
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            color:'black',
                                            fontSize: '1.7rem'
                                        }
                                    }),
                                    $({
                                        tag:'input',
                                        att:{
                                            type:'password',
                                            className:'form-control password-input',
                                            name:'password',
                                            id:'userPid',
                                            placeholder:' ',
                                            required:true,
                                            autocomplete: 'current-password'
                                        },
                                        style:{
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            color:'#ddd',
                                            border: 'none',
                                            paddingRight: '40px'
                                        }
                                    }),
                                    $({
                                        tag:'password-label',
                                        att:{
                                            for: 'userPid'
                                        },
                                        text:'Password',
                                        style:{
                                            color:'#999',
                                            backgroundColor: 'transparent'
                                        }
                                    }),
                                    // Eye icon for password visibility toggle
                                    $({
                                        tag:'span',
                                        att:{
                                            className: 'password-toggle',
                                            id: 'toggle-login-password'
                                        },
                                        style: {
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            color: '#999',
                                            zIndex: '10',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            transition: 'all 0.3s ease'
                                        },
                                        child: [
                                            $({
                                                tag: 'i',
                                                att: {
                                                    className: 'fa-solid fa-eye',
                                                    id: 'login-password-eye-icon'
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
                            }),

                            $({
                                tag:'button',
                                att:{
                                    className:'btn btn-primary',
                                },
                                text:'Submit'
                            })
                        ]
                    })
                ]
            })
        ]

    }))

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
        email: (value) => {
            email = value
        },
        fullName: (value) => {
            fullName = value
        },
        center: (value) => {
            center = value
        },
        campus: (value) => {
            campus = value
        },
        username: (value) => {
            username = value
        },
        password: (value) => {
            password = value
        },
        conPass: (value) => {
            conPass = value
        },
        userRole: (value) => {
            userRole = value
        }
    }

    // Toggle password visibility function
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
            att: {
                className: 'logTable sign'
            },
            child: [
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                className: 'labelTDSign'
                            },
                            text: label
                        }),
                    ]
                }),
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            child: [element]
                        }),
                    ]
                }),
            ]
        })
    }

    const getContainer = (container) => {
        // Create form element to wrap all inputs
        const form = $({
            tag: 'form',
            att: {
                id: 'signup-form',
                autocomplete: 'on'
            },
            event: {
                type: 'submit',
                method: (event) => {
                    event.preventDefault() // Prevent default form submission
                    // Trigger the submit button click programmatically
                    const submitBtn = document.getElementById('signup-submit-btn')
                    if (submitBtn) submitBtn.click()
                }
            }
        })
        
        const option = ({label, placeholder, value}) => {
            const getOpt = (opt) => {
                if (label) {
                    opt.innerText = label
                }
                if (placeholder) {
                    opt.disabled = true
                    opt.selected = true
                }
                if (value) {
                    opt.value = value
                }
            }
            return ($({
                tag: 'option',
                elementHandler: getOpt
            }))
        }
        
        // Campus list for reuse
        const campuses = [
            "Roxas City Main",
            "Pilar",
            "Pontevedra",
            "Mambusao",
            "Burias",
            "Sigma",
            "Sapian",
            "Tapaz",
            "Dumarao",
            "Dayao"
        ];
        
        // Role Selection Dropdown (UI only - not saved to database)
        const getRoleSelect = (select) => {
            select.appendChild(option({
                label: '-- Select Role --',
                placeholder: true,
            }))
            
            const roles = [
                { label: 'Research Chair', value: 'research_chair' },
                { label: 'Research Center Chair', value: 'research_center_chair' }
            ];
            
            roles.forEach(role => {
                select.appendChild($({
                    tag: 'option',
                    text: role.label,
                    att: {
                        value: role.value
                    }
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
                        
                        // Show/hide appropriate dropdowns based on role selection
                        const campusContainer = document.getElementById('campus-container')
                        const centerContainer = document.getElementById('center-container')
                        const extensionCampusContainer = document.getElementById('extension-campus-container')
                        
                        if (selectedRole === 'research_chair') {
                            // Research Chair - Show Campus, Hide Center and Extension Campus
                            if (campusContainer) campusContainer.style.display = 'block'
                            if (centerContainer) centerContainer.style.display = 'none'
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            // Reset center value
                            get.center(undefined)
                            // Reset the center select element
                            const centerSelect = document.getElementById('select-sign')
                            if (centerSelect) centerSelect.selectedIndex = 0
                        } else if (selectedRole === 'research_center_chair') {
                            // Research Center Chair - Show Center, Hide Campus
                            if (campusContainer) campusContainer.style.display = 'none'
                            if (centerContainer) centerContainer.style.display = 'block'
                            // Reset campus value
                            get.campus(undefined)
                            // Reset the campus select element
                            const campusSelect = document.getElementById('select-campus')
                            if (campusSelect) campusSelect.selectedIndex = 0
                            // Check if Extension is currently selected
                            const centerSelect = document.getElementById('select-sign')
                            if (centerSelect && centerSelect.value === 'Extension') {
                                if (extensionCampusContainer) extensionCampusContainer.style.display = 'block'
                            } else {
                                if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            }
                        } else {
                            // No selection - Hide all
                            if (campusContainer) campusContainer.style.display = 'none'
                            if (centerContainer) centerContainer.style.display = 'none'
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                        }
                    }
                },
                att: {
                    id: 'select-role',
                    className: 'selectSign'
                },
            })
        }))
        
        // Research Center Selection Dropdown
        const getSelect = (select) => {
            select.appendChild(option({
                label: '-- Select Research Center --',
                placeholder: true,
            }))
            
            CapsuOffice.forEach(val => {
                // Extract the code from parentheses or use the whole string if no parentheses
                let code = val;
                const match = val.match(/\(([^)]+)\)/);
                if (match) {
                    code = match[1]; // Gets "CSRDC", "LRDC", etc.
                } else if (val === "Extension") {
                    code = "Extension"; // Match your database value
                }
                
                select.appendChild($({
                    tag: 'option',
                    text: val,  // Display full name
                    att: {
                        value: code  // Send just the code to backend
                    }
                }))
            })
        }

        // Center container
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
                        
                        // Show/hide extension campus dropdown based on selection
                        const extensionCampusContainer = document.getElementById('extension-campus-container')
                        
                        if (selectedCenter === 'Extension' && userRole === 'research_center_chair') {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'block'
                        } else {
                            if (extensionCampusContainer) extensionCampusContainer.style.display = 'none'
                            // Reset campus if not extension
                            if (selectedCenter !== 'Extension') {
                                get.campus(undefined)
                                const extensionCampusSelect = document.getElementById('select-extension-campus')
                                if (extensionCampusSelect) extensionCampusSelect.selectedIndex = 0
                            }
                        }
                    }
                },
                att: {
                    id: 'select-sign',
                    className: 'selectSign'
                },
            })
        })
        
        // Wrap in a div for easy show/hide
        const centerWrapper = $({
            tag: 'div',
            att: {
                id: 'center-container',
                style: 'display: none;'
            },
            child: [centerTable]
        })
        form.appendChild(centerWrapper)
        
        // Extension Campus Selection Dropdown (shown only when Extension is selected)
        const getExtensionCampusSelect = (select) => {
            select.appendChild(option({
                label: '-- Select Extension Campus --',
                placeholder: true,
            }))
            
            campuses.forEach(val => {
                select.appendChild($({
                    tag: 'option',
                    text: val,
                    att: {
                        value: val
                    }
                }))
            })
        }
        
        // Extension Campus container (initially hidden)
        const extensionCampusTable = TableCont({
            label: 'Extension Campus',
            element: $({
                tag: 'select',
                elementHandler: getExtensionCampusSelect,
                event: {
                    type: 'change',
                    method: (event) => {
                        get.campus(event.target.value)
                    }
                },
                att: {
                    id: 'select-extension-campus',
                    className: 'selectSign'
                },
            })
        })
        
        // Wrap in a div for easy show/hide
        const extensionCampusWrapper = $({
            tag: 'div',
            att: {
                id: 'extension-campus-container',
                style: 'display: none;'
            },
            child: [extensionCampusTable]
        })
        form.appendChild(extensionCampusWrapper)
        
        // Campus Selection Dropdown (for Research Chair role)
        const getCampusSelect = (select) => {
            select.appendChild(option({
                label: '-- Select Campus --',
                placeholder: true,
            }))
            
            campuses.forEach(val => {
                select.appendChild($({
                    tag: 'option',
                    text: val,
                    att: {
                        value: val
                    }
                }))
            })
        }
        
        // Campus container (initially hidden)
        const campusTable = TableCont({
            label: 'Campus',
            element: $({
                tag: 'select',
                elementHandler: getCampusSelect,
                event: {
                    type: 'change',
                    method: (event) => {
                        get.campus(event.target.value)
                    }
                },
                att: {
                    id: 'select-campus',
                    className: 'selectSign'
                },
            })
        })
        
        // Wrap in a div for easy show/hide
        const campusWrapper = $({
            tag: 'div',
            att: {
                id: 'campus-container',
                style: 'display: none;'
            },
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
                event: {
                    type: 'input',
                    method: (event) => {
                        get.email(event.target.value)
                    }
                }
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
                event: {
                    type: 'input',
                    method: (event) => {
                        get.fullName(event.target.value)
                    }
                }
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
                event: {
                    type: 'input',
                    method: (event) => {
                        get.username(event.target.value)
                    }
                },
                elementHandler: SpecialChar
            })
        }))

        // Password field with eye icon
        form.appendChild(TableCont({
            label: 'Password',
            element: $({
                tag: 'div',
                att: {
                    className: 'password-container'
                },
                style: {
                    position: 'relative',
                    width: '100%'
                },
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
                        style: {
                            width: '100%',
                            paddingRight: '40px' // Make space for the eye icon
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                                get.password(event.target.value)
                            }
                        },
                        elementHandler: SpecialChar
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'password-toggle',
                            id: 'toggle-password'
                        },
                        style: {
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            zIndex: '10'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: {
                                    className: 'fa-solid fa-eye',
                                    id: 'password-eye-icon'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                togglePasswordVisibility('signup-password', 'password-eye-icon')
                            }
                        }
                    })
                ]
            })
        }))

        // Confirm Password field with eye icon
        form.appendChild(TableCont({
            label: 'Re-type Password',
            element: $({
                tag: 'div',
                att: {
                    className: 'password-container'
                },
                style: {
                    position: 'relative',
                    width: '100%'
                },
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
                        style: {
                            width: '100%',
                            paddingRight: '40px' // Make space for the eye icon
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                                get.conPass(event.target.value)
                            }
                        },
                        elementHandler: SpecialChar
                    }),
                    $({
                        tag: 'span',
                        att: {
                            className: 'password-toggle',
                            id: 'toggle-confirm-password'
                        },
                        style: {
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            color: '#999',
                            zIndex: '10'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: {
                                    className: 'fa-solid fa-eye',
                                    id: 'confirm-password-eye-icon'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                togglePasswordVisibility('signup-confirm-password', 'confirm-password-eye-icon')
                            }
                        }
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
                event: {
                    type: 'click',
                    method: async (event) => {
                        event.preventDefault() // Prevent form from submitting traditionally
                        
                        // Validate role selection first (UI only)
                        if (userRole === undefined) {
                            alert("Please select a role (Research Chair or Research Center Chair)..!")
                            return
                        }
                        
                        // Validate based on role
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
                            // If Extension is selected, campus is required
                            if (center === 'Extension' && campus === undefined) {
                                alert("Please select an Extension Campus..!")
                                return
                            }
                        }
                        
                        if (email === undefined) {
                            alert("E-Mail is missing..!")
                            return
                        }
                        if (fullName === undefined) {
                            alert("Full name is missing..!")
                            return
                        }
                        if (username === undefined) {
                            alert("Username is missing..!")
                            return
                        }
                        if (password === undefined) {
                            alert("Password is missing..!")
                            return
                        }
                        if (password.length < 8) {
                            alert("Please provide at least 8 characters password...!")
                            return
                        }

                        if (password !== conPass) {
                            alert("Passwords do not match!")
                            return
                        }

                        const formData = new FormData();
                        formData.append('auth', 'signup')
                        // NOTE: role is NOT sent to backend - it's UI only
                        
                        // Append appropriate field based on role
                        if (userRole === 'research_chair') {
                            // Research Chair sends campus
                            formData.append('campus', campus.toUpperCase())
                        } else if (userRole === 'research_center_chair') {
                            // Research Center Chair sends center name
                            formData.append('cName', center.toUpperCase())
                            // If Extension is selected, also send campus
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
                            loading.remove()
                        }

                        try {
                            const res = await fetch('/server/authToken.php', {
                                method: "POST",
                                body: formData
                            })
                            
                            if (res.ok) {
                                remove()
                                const dat = await res.json()
                                
                                if (dat.status) {
                                    // Show success message and redirect to login page
                                    document.body.appendChild(ConfirmationAlert(
                                        "Your account has been successfully created!\nPlease check your email to verify your account.", 
                                        () => {
                                            // Redirect to login page after user clicks OK
                                            window.location.replace('/account/Login?')
                                        }
                                    ))
                                } else {
                                    document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                        // Stay on signup page on error
                                        window.location.reload()
                                    }))
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
        
        // Append the form to the container
        container.appendChild(form)
    }

    return ($({
        tag: 'div',
        att: {
            className: 'logInDiv signIn'
        },
        elementHandler: getContainer
    }))
}

const logo = () => {

    return ($({

        tag: 'table',

        att: {

            className: 'logoTable'

        },

        child: [

            $({

                tag: 'tr',

                child: [

                    $({

                        att: {

                            className: 'schlName'

                        },

                        tag: 'td',

                        text: 'CAPIZ STATE UNIVERSITY'

                    })

                ]

            }),

            $({

                tag: 'tr',

                child: [

                    $({

                        att: {

                            className: 'schlDet'

                        },

                        tag: 'td',

                        text: 'Center of Academic Excellence Delivering Quality Service to All'

                    })

                ]

            })

        ]

    }))

}

export const LoginPage = () => {


    let logState = true

    let clsObj

    // CheckLogIn() is not needed - index.js already handles session verification before showing login page



    const getBot = (val) => {


        switch (window.location.href.replace(window.location.origin, '')) {

            case '/account/Login?':

                val.innerHTML = "<span>Create an account?&nbsp&nbsp</span><i style='font-size:1vw;color: deepskyblue;font-family: Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif;font-weight: bold'>( for Capsu Center user's only )</i>"

                break;

            case '/account/Signup?':



                val.innerText = 'Log in'

                break;

        }

    }

    const getCLS = (cls) => {

        clsObj = cls

        switch (window.location.href.replace(window.location.origin, '')) {

            case '/account/Login?':

                clsObj.appendChild(LoginPanel())



                break;

            case '/account/Signup?':

                clsObj.appendChild(Signup())



                break;

        }

    };



    const ChangePanel = () => {

        return ($({

            tag: 'div',

            elementHandler: getBot,

            att: {

                className: 'butDiv'

            },

            style:{

                borderBottom: 'solid thin #bbb',

                marginBottom:'2vh'

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

        }))

    }



    return ($({

        tag: 'div',

        att: {

            className: 'LoginPanel'

        },



        child: [

            logo(),

            $({

                tag: 'div',

                elementHandler: getCLS,

                att: {

                    className: "clogOrSig"

                },



            }),

            ChangePanel(),

            $({

                tag:'a',

                style:{

                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                    color:'deepskyblue',

                    fontSize:'1vw',

                    fontWeight:'bolder',

                    textShadow:'0 0 .5vw black',

                    marginTop:'5vh',

                    borderBottom:'solid thin deepskyblue',

                    width:'fit-content',

                    paddingLeft:'.5vw',

                    paddingRight:'.5vw',

                    cursor:'pointer',

                },

                text:'Forgot password?',

                att:{

                    href: '/accountSupport'

                }



            })

        ]
    }))

}
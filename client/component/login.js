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

    const getSubmit = (bot) => {

        /* The above code is listening to the keypress event. If the key pressed is the enter key, it will check if the

        usertype is not undefined. If it is not undefined, it will create a formdata object and append the usertype,

        username, password and the auth type. It will then check the usertype and if it is equal to evaluator, it will

        send a post request to the evaluatorReg route. If it is equal to capsusers or admin, it will send a post request

        to the loginAuth route. If it is equal to rdeoffice, */

        bot.addEventListener('keypress', async (event) => {

            if (event.keyCode === 13) {

                if (usertype !== undefined) {

                    const form = new FormData();

                    form.append('auth', 'login')

                    form.append('userType', usertype.toUpperCase())

                    form.append('username', username)

                    form.append('password', password)

                    let type = usertype.replace(" ", "").toUpperCase()



                    if (type === 'EVALUATOR') {

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



                    } else if (type === 'CAPSUUSERS' || type === 'ADMIN') {

                        await fetch('/loginAuth', {

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

                    } else if (type==="RDEOFFICE") {

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

                    } else {

                        alert('asdkjasldkj')

                    }

                } else {

                    alert("Please select type of user.")

                }



            }





        })

    }

    const detectUserType = (username) => {
        if (!username) return null;
        
        const userLower = username.toLowerCase();
        
        // Detect admin users (could be based on pattern or common admin emails)
        if (userLower.includes('admin') || userLower.includes('administrator')) {
            return 'ADMIN';
        }
        
        // Detect CAPSU users (capsu.edu.ph domain)
        if (userLower.includes('@capsu.edu.ph')) {
            return 'CAPSUUSERS';
        }
        
        // Detect evaluators (could be based on pattern)
        if (userLower.includes('eval') || userLower.includes('evaluator')) {
            return 'EVALUATOR';
        }
        
        // Detect RDE office
        if (userLower.includes('rde') || userLower.includes('office') || userLower.includes('staff')) {
            return 'RDEOFFICE';
        }
        
        return null; // Couldn't detect
    }

    // Function to auto-select based on username input
    const autoSelectUserType = (username) => {
        if (!username || !selType) return;
        
        const detectedType = detectUserType(username);
        if (detectedType && selType) {
            selType.value = detectedType;
            
            // Show a subtle notification that we auto-selected
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
                        paddingRight: '2.5rem', // Space for icon
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'none' // Remove default arrow
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
                        }),
                    ]
                }),
                // Dropdown indicator icon
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
                                    selType.removeAttribute
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


                                    } else if (selType.value === 'CAPSUUSERS' || selType.value === 'ADMIN' || !selType.value) {
                                        let form= new FormData(ev.target)
                                        form.append('auth','login')
                                        
                                        // Auto-detect user type if not selected
                                        if (!selType.value) {
                                            const detectedType = detectUserType(ev.target.username.value);
                                            if (detectedType) {
                                                form.append('userType', detectedType);
                                            } else {
                                                // Default to CAPSUUSERS if no detection
                                                form.append('userType', 'CAPSUUSERS');
                                            }
                                        }
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

                                    } else if (selType.value==="RDEOFFICE") {
                                        let form= new FormData(ev.target)
                                        form.append('auth','login')

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
                                                    }, 500); // Delay to avoid frequent updates
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
                                            className:'form-control',
                                            name:'password',
                                            id:'userPid',
                                            placeholder:' ',
                                            required:true,
                                            autocomplete: 'current-password'
                                        },
                                        style:{
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            color:'#ddd',
                                            border: 'none'
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

    let officeC

    let username

    let password

    let conPass

    let fullName



    const get = {

        email: (value) => {

            email = value

        },

        fullName: (value) => {

            fullName = value

        },



        office: (value) => {

            officeC = value

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

        const option = ({label, placeholder}) => {

            const getOpt = (opt) => {

                if (label) {

                    opt.innerText = label

                }

                if (placeholder) {

                    opt.disabled = true

                    opt.selected = true

                }

            }

            return ($({

                tag: 'option',

                elementHandler: getOpt

            }))

        }

        const getSelect = (select) => {

            select.appendChild(option({

                label: 'Select Office / Campus',

                placeholder: true,

            }),)

            CapsuOffice.forEach(val => {

                select.appendChild(option({

                    label: val

                }))

            })

        }







        container.appendChild(TableCont({

            label: 'Office/Campus',

            element: $({

                tag: 'select',

                elementHandler: getSelect,

                event: {

                    type: 'change',

                    method: (event) => {

                        get.office(event.target.value)

                    }

                },

                att: {
                    id: 'select-sign',
                    className: 'selectSign'

                },

            })

        }))

        container.appendChild(TableCont({

            label: 'Email address',

            element: $({

                tag: 'input',

                att: {
                    className: 'signInput',
                    placeholder: 'xxxx@capsu.edu.ph',
                    id: 'signup-email',
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

        container.appendChild(TableCont({

            label: 'Full name',

            element: $({

                tag: 'input',

                att: {
                    id: 'signinput-fullname',
                    className: 'signInput',
                    placeholder: 'Enter full name'

                },

                event: {

                    type: 'input',

                    method: (event) => {

                        get.fullName(event.target.value)

                    }

                }

            })

        }))

        container.appendChild(TableCont({

            label: 'Username',

            element: $({

                tag: 'input',

                att: {
                    id: 'signinput-Username',
                    className: 'signInput',
                    placeholder: 'Enter username'

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





        container.appendChild(TableCont({

            label: 'Password',

            element: $({

                tag: 'input',

                att: {

                    type: 'password',

                    className: 'signInput',

                    placeholder: 'Create  8 to 20 characters password',

                    maxLength: '20',

                    minLength:'8',
                    id: 'signup-password',
                    name: 'password',
                    autocomplete: 'new-password'

                },

                event: {

                    type: 'input',

                    method: (event) => {

                        get.password(event.target.value)

                    }

                },

                elementHandler: SpecialChar

            })

        }))

        container.appendChild(TableCont({

            label: 'Re-type Password',

            element: $({

                tag: 'input',

                att: {

                    type: 'password',

                    className: 'signInput',

                    placeholder: 'Re-enter password',

                    maxLength: '20',
                    id: 'signup-confirm-password',
                    name: 'confirmPasswod',
                    autocomplete: 'new-password'

                },

                event: {

                    type: 'input',

                    method: (event) => {

                        get.conPass(event.target.value)

                    }

                },

                elementHandler: SpecialChar

            })

        }))

        container.appendChild(TableCont({

            label: '',

            element: $({

                tag: 'input',

                att: {

                    type: 'button',

                    className: 'submit',

                    value: 'Submit'

                },

                event: {

                    type: 'click',

                    method: async () => {

                        if (officeC === undefined) {

                            alert("Office/Campus is missing..!")

                            return

                        }

                        if (email === undefined) {

                            alert("E-Mailer is missing..!")

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

                        if (password.split('').length < 8) {

                            alert("please provide at least 8 characters password...!")

                            return

                        }



                        if (password === conPass) {

                            const form = new FormData();

                            form.append('auth', 'signup')

                            form.append('cName', officeC.toUpperCase())

                            form.append('userEmail', email)

                            form.append('fullName', fullName)

                            form.append('username', username)

                            form.append('password', password)

                            let loading = Waiting()

                            document.body.appendChild(loading)

                            const remove = () => {

                                loading.remove()

                            }

                            await fetch('/server/authToken.php', {

                                method: "POST",

                                body: form

                            }).then(res => {

                                if (res.ok) {

                                    remove()

                                    return res.json()

                                }

                            }).then(dat => {

                                if (dat.status) {

                                    document.body.appendChild(ConfirmationAlert("Your account has been successfully created...!\n please check your email..!", () => {

                                        window.location.replace(dat.message)

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

        }))

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

            text: 'Logg in?',



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
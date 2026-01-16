import {$, ConfirmationAlert, Request, SpecialChar, Waiting} from '../../../lib/lib.js'





const encodeUser=()=>{

    let gmail

    let campus

    let adminPassword

    let tableAcc

    let userType



    const accountData={

        gmail:'',

        campus:'',

 //       adminPassword:'',

        userType:''

    }



    let useTypeEl

    let useTypeInput

    const getUseType=(el)=>{

        useTypeEl=el

    }

    const getData={

        getGmail:(value)=>{accountData.gmail=value},

        getCampus:(value)=>{accountData.campus=value},

   //     getAminPass:(value)=>{accountData.adminPassword=value},

        getUserType:(value)=>{accountData.userType=value},

    }

    const getuserTypeInput=(el)=>{

        useTypeInput=el

    }





    const userTYpeInput=()=>{



        return($({

            tag:'tr',

            elementHandler:getUseType,

            child:[

                $({

                    tag:'td',

                    child:[

                        $({

                            tag:'input',

                            att:{

                                className:'inputAddUser',

                                placeholder:'Specify user type'

                            },



                            event:{

                                type:'input',

                                method:(event)=>{

                                    getData.getUserType(event.target.value)

                                }

                            },

                            elementHandler:getuserTypeInput

                        })

                    ]

                })

            ]

        }))

    }

    const selectUserType=()=>{



        return($({

            tag:'tr',

            child:[

                $({

                    tag:'td',

                    child:[

                        $({

                            tag:'select',

                            event:{

                                type:'change',

                                method:(event)=>{

                                    if(event.target.value==='Others'){

                                        getData.getUserType('')

                                        tableAcc.insertBefore(userTYpeInput(),tableAcc.childNodes[3])

                                    }else {

                                        if(useTypeEl!==undefined){

                                            useTypeEl.remove()

                                        }

                                        getData.getUserType(event.target.value)

                                    }

                                }

                            },

                            att:{

                                className:'selectAddUser'

                            },

                            child:[

                                $({

                                    tag:'option',

                                    text:'Select User Type',

                                    att:{

                                        disabled:true,

                                        selected:true

                                    }

                                }),

                                $({

                                    tag:'option',

                                    att:{

                                        innerText:`Research Chair`

                                    }

                                }),

                                $({

                                    tag:'option',

                                    att:{

                                        innerText:`Extension Chair`

                                    }

                                }),

                                $({

                                    tag:'option',

                                    att:{

                                        innerText:`Extension Chair`

                                    }

                                }),

                                $({

                                    tag:'option',

                                    att:{

                                        innerText:`Others`

                                    }

                                })

                            ]



                        })

                    ]

                })

            ]

        }))

    }









    const getTableAc=(el)=>{

        tableAcc=el

    }



    return($({

        tag:'div',

        att:{

            className:'encodeP'

        },

        child:[

            $({

                tag:'table',

                att:{

                    className:'addUserTable leftT'

                },

                elementHandler:getTableAc,

                child:[

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:`CAPSU User's`,

                                style:{

                                    fontFamily:'arial black,sans-serif',

                                    color:'#bbb',

                                    fontSize:'1.1vw'

                                }

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        tag:'select',

                                        event:{

                                            type:'change',

                                            method:(event)=>{

                                                getData.getCampus(event.target.value)

                                            }

                                        },

                                        att:{



                                            className:'selectAddUser'

                                        },

                                        child:[

                                            $({

                                                tag:'option',

                                                text:'Select Office/Campus',

                                                att:{

                                                    disabled:true,

                                                    selected:true

                                                }

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Central Office'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Roxas City Main'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Dayao'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Pontevedra'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Pilar'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Dumarao'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Burias'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Mambusao'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Tapaz'

                                            }),

                                            $({

                                                tag:'option',

                                                text:'Sigma'

                                            }),

                                        ]



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        event:{

                                            type:'input',

                                            method:(event)=>{

                                                getData.getGmail(event.target.value)

                                            }

                                        },

                                        tag:'input',

                                        att:{

                                            type:'email',

                                            placeholder:'Enter CAPSU Gmail account',

                                            className:'inputAddUser'

                                        },



                                    })

                                ]

                            })

                        ]

                    }),

                    selectUserType(),



                    $({

                        tag:'tr',

                        child:[

                            $({

                                event:{

                                    type:'click',

                                    method: ()=>{

                                        let dataState=true;

                                        for (const val of Object.keys(accountData)) {

                                            if(accountData[val]===''){

                                                dataState=false

                                                break;

                                            }

                                        }

                                        if(dataState||true){



                                            const load=Waiting()

                                            document.body.appendChild(load)





                                            const req= new Request('/addcapaccount')

                                            req.Post([

                                                {

                                                    name:'registerAccount',

                                                    value:'true'

                                                },

                                                {

                                                    name:'email',

                                                    value:accountData.gmail

                                                },

                                                {

                                                    name:'accountName',

                                                    value:accountData.userType,

                                                },

                                                {

                                                    name:'office',

                                                    value:accountData.campus

                                                }

                                            ])

                                            req.Json()

                                            req.Send().then(data=>{

                                                load.remove()

                                                if(data.status){

                                                    setTimeout(()=>{

                                                        alert(data.message)

                                                        window.location.replace('/account/Login')

                                                    },100)



                                                }else {

                                                    window.location.reload()

                                                }

                                            })





                                        }else {

                                            alert("Data provided is incomplete..!")

                                        }









                                    }

                                },

                                tag:'td',

                                text:'Submit',

                                att:{

                                    className:'submitAddUser'

                                }

                            })

                        ]

                    }),



                ]

            })

        ]

    }))

}





const encodeEvaluator=()=>{



    const data={

        eventType:'',

        category:'',

        center:'',

        fullname:'',

        username:'',

        password:'',

        confirmPass:''

    }

    const getData={

        getEventType:(value)=>{

            data.eventType=value

        },

        getCategory:(value)=>{data.category=value},

        getCenter:(value)=>{data.center=value},

        getFullname:(value)=>{data.fullname=value},

        getUsername:(value)=>{data.username=value},

        getPassword:(value)=>{data.password=value},

        getConfirmPass:(value)=>{data.confirmPass=value},

    }



    return ($({

        tag:'div',

        att:{

            className:'encodeP rightP'

        },

        child:[

            $({

                tag: 'table',

                att: {

                    className: 'addUserTable rightT'

                },

                child: [

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Center'

                            })

                        ]

                    }),//label

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                child: [

                                    $({

                                        tag: 'select',

                                        event: {

                                            type: 'change',

                                            method: async (event) => {

                                                getData.getCenter(event.target.value)

                                                // Load categories for selected center

                                                const center = event.target.value

                                                const categorySelect = document.getElementById('categorySelect')

                                                if (categorySelect && center) {

                                                    // Clear existing options except the first one

                                                    while (categorySelect.children.length > 1) {

                                                        categorySelect.removeChild(categorySelect.lastChild)

                                                    }

                                                    // Fetch categories for this center

                                                    const req = new Request('/evaluatorReg')

                                                    req.Post([

                                                        {name: 'getCategoriesByCenter', value: 'true'},

                                                        {name: 'center', value: center}

                                                    ])

                                                    req.Json()

                                                    req.Send().then(data => {

                                                        if (data && data.length > 0) {

                                                            data.forEach(category => {

                                                                categorySelect.appendChild($({

                                                                    tag: 'option',

                                                                    text: category.name || category.id,

                                                                    att: {

                                                                        value: category.name || category.id

                                                                    }

                                                                }))

                                                            })

                                                        }

                                                    }).catch(err => {

                                                        console.error('Error loading categories:', err)

                                                    })

                                                } else if (categorySelect) {

                                                    // Clear categories if no center selected

                                                    while (categorySelect.children.length > 1) {

                                                        categorySelect.removeChild(categorySelect.lastChild)

                                                    }

                                                    categorySelect.value = ''

                                                }

                                            }

                                        },

                                        att: {

                                            className: 'selectAddUser',

                                            id: 'centerSelect'

                                        },

                                        elementHandler:async (el)=>{

                                            el.appendChild($({

                                                tag: 'option',

                                                text: '-- Select Center --',

                                                att: {

                                                    disabled: true,

                                                    selected: true,

                                                    value: ''

                                                }

                                            }))

                                            // Load all centers initially

                                            const req = new Request('/evaluatorReg')

                                            req.Post([

                                                {name: 'getCenters', value: 'true'}

                                            ])

                                            req.Json()

                                            req.Send().then(data => {

                                                if (data && data.length > 0) {

                                                    data.forEach(center => {

                                                        el.appendChild($({

                                                            tag: 'option',

                                                            text: center.name || center.code,

                                                            att: {

                                                                value: center.id

                                                            }

                                                        }))

                                                    })

                                                }

                                            }).catch(err => {

                                                console.error('Error loading centers:', err)

                                            })

                                        }

                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Category'

                            })

                        ]

                    }),//label

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                child: [

                                    $({

                                        tag: 'select',

                                        event: {

                                            type: 'change',

                                            method: (event) => {

                                                getData.getCategory(event.target.value)

                                            }

                                        },

                                        att: {

                                            className: 'selectAddUser',

                                            id: 'categorySelect'

                                        },

                                        elementHandler: (el) => {

                                            el.appendChild($({

                                                tag: 'option',

                                                text: '-- Select Category --',

                                                att: {

                                                    disabled: true,

                                                    selected: true,

                                                    value: ''

                                                }

                                            }))

                                        },

                                        child: [





                                        ]



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Event Type'

                            })

                        ]

                    }),//label

                    $({

                        tag: 'tr',

                        child: [

                            $({

                                tag: 'td',

                                child: [

                                    $({

                                        tag: 'select',

                                        event: {

                                            type: 'change',

                                            method: (event) => {

                                                getData.getEventType(event.target.options[event.target.selectedIndex].id)

                                            }

                                        },

                                        att: {

                                            className: 'selectAddUser'

                                        },

                                        elementHandler:async (el)=>{

                                            el.appendChild(  $({

                                                tag: 'option',

                                                text: '-- Select Event type --',

                                                att: {

                                                    disabled: true,

                                                    selected: true

                                                }

                                            }))



                                            const req= new Request('/eventRequest')

                                            req.Post([

                                                {name:'getEvent',value:'0'}

                                            ])

                                            req.Json()

                                            req.Send().then(data=>{

                                                data.forEach(val=>{

                                                    el.appendChild($({

                                                        tag: 'option',

                                                        text:val.name,

                                                        att:{

                                                            id:val.id

                                                        }

                                                    }))

                                                })

                                            })

                                        },





                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:'\n'

                            })

                        ]

                    }),//break

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Evaluators name'

                            })

                        ]

                    }),//label

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        event:{

                                            type:'input',

                                            method:(event)=>{

                                                getData.getFullname(event.target.value)

                                            }

                                        },

                                        tag:'input',

                                        att:{

                                            type:'email',

                                            placeholder:'Evaluators full name',

                                            className:'inputAddUser'

                                        },



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:'\n'

                            })

                        ]

                    }),//break

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Create Username'

                            })

                        ]

                    }),//label

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        event:{

                                            type:'input',

                                            method:(event)=>{

                                                getData.getUsername(event.target.value)

                                            }

                                        },

                                        tag:'input',

                                        att:{

                                            type:'text',

                                            placeholder:'Username',

                                            className:'inputAddUser'

                                        },



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:'\n'

                            })

                        ]

                    }),//break

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Create Password'

                            })

                        ]

                    }),//label

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        event:{

                                            type:'input',

                                            method:(event)=>{

                                                getData.getPassword(event.target.value)

                                            }

                                        },

                                        elementHandler: SpecialChar,

                                        tag:'input',

                                        att:{

                                            type:'password',

                                            placeholder:'Enter password',

                                            className:'inputAddUser',

                                            maxLength: '20'

                                        },



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:'\n'

                            })

                        ]

                    }),//break

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'labelAdmin ev'

                                },

                                text:'Re-type Password'

                            })

                        ]

                    }),//label

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                child:[

                                    $({

                                        event:{

                                            type:'input',

                                            method:(event)=>{

                                                getData.getConfirmPass(event.target.value)

                                            }

                                        },

                                        elementHandler: (userInput) => {

                                            userInput.addEventListener('keypress', (event) => {

                                                if (!((event.keyCode >= 65) && (event.keyCode <= 90) || (event.keyCode >= 97) && (event.keyCode <= 122) || (event.keyCode >= 48) && (event.keyCode <= 57))) {

                                                    alert("Special character is not allowed..!")

                                                    event.returnValue = false

                                                }



                                            })

                                        },

                                        tag:'input',

                                        att:{

                                            type:'password',

                                            placeholder:'Re-type password',

                                            className:'inputAddUser',

                                            maxLength: '20'

                                        },



                                    })

                                ]

                            })

                        ]

                    }),

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                text:'\n'

                            })

                        ]

                    }),//break

                    $({

                        tag:'tr',

                        child:[

                            $({

                                tag:'td',

                                att:{

                                    className:'submitEval'

                                },

                                text:'Submit',

                                event:{

                                    type:'click',

                                    method:async ()=>{

                                        if(data.password===data.confirmPass){

                                            const form = new FormData();

                                            form.append('evaluatorRegister', 'true')

                                            form.append('username', data.username.toUpperCase())

                                            form.append('password', data.password)

                                            form.append('fullname', data.fullname.toUpperCase())

                                            form.append('category', data.category.toUpperCase())

                                            form.append('center', data.center)

                                            form.append('eventTYpe',data.eventType)

                                            let loading = Waiting()

                                            document.body.appendChild(loading)

                                            const remove = () => {

                                                loading.remove()

                                            }

                                            await fetch('/evaluatorReg', {

                                                method: 'POST',

                                                body: form

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

                                        }else {

                                            alert("Password not match..!")

                                        }



                                    }

                                }

                            })

                        ]

                    }),//submission

                ]

            })



        ]

    }))

}



const rdeUser=()=>{



    const data={

        email:'',

        userName:'',

        password:''

    }



    const getData={

        getEmail:(value)=>{

            data.email=value

        },

        getUserName:(value)=>{

            data.userName=value

        },

        getPassword:(value)=>{

            data.password=value

        }

    }







    const label=$({

        tag:'div',

        text:'RDE Staff',

        style:{

            fontFamily: 'arial black,sans-serif',

            color:'#bbb',

            fontSize: '1.1vw',

            margin: '1vw auto auto',

            width: 'fit-content'

        },



    })



    const getInput=(inputUser)=>{

        inputUser.addEventListener('keypress',(event)=>{

            if(event.keyCode===32){

                alert("Invalid Character")

                return event.returnValue=false

            }

        })

    }



    const input=({getDataMethod,prop,filter})=>{

        const inputEl=$({

            tag:'input',

            att:prop,

            style:{

                outline:'none',

                width:'93%',

                height: '4vh',

                borderRadius:'.5vw',

                fontSize:'1vw',

                paddingLeft:'1vw',



                paddingRight:'1vw',

                color:'#bbb'

            },

            elementHandler:(el)=>{

                if(filter){

                    getInput(el)

                }

            },

            event:{

                type:'input',

                method:(event)=>{

                    if(getDataMethod){

                        getDataMethod(event.target.value)

                    }

                }

            }

        })

        return($({

            tag:'div',

            style:{

                width:'89%',

                height: '4.5vh',

                margin:'1vh auto auto',

            },

            child:[

                inputEl,

            ]

        }))

    }

    const Submit=()=>{



        return($({

            tag:'div',

            style:{

                width:'86%',

                paddingRight: '.5vw',

                paddingLeft: '.5vw',

                paddingTop:'.5vh',

                paddingBottom:'.5vh',

                fontFamily:'arial black,sans-serf',

                margin:'.3vw auto auto',

                fontSize:'1.5vw',

                height:'5vh',

                textAlign:'center',

                cursor:'pointer'

            },

            text:'Submit',

            att:{

                className:'subStaff'

            },

            event:{

                type:'click',

                method:async ()=>{

                    let subState=true;



                    const form=new FormData();

                    form.append('submitStaff','true')

                    form.append('staffEmail',data.email)

                    form.append('staffUserName',data.userName)

                    form.append('staffPassword',data.password)

                    for (const val of Object.keys(data)) {

                       if( data[val]===''){

                           alert(val+' is empty')

                           subState=false;

                           break;

                       }

                    }

                    if(subState){

                        await fetch('/rdeStaff',{

                            method:'POST',

                            body:form,

                        }).then(res=>res.json())

                            .then(data=>{

                                if(data.status){

                                    window.location.reload();

                                }else {

                                    alert(data.message)

                                }



                            })

                    }



                }

            }

        }))

    }



    return($({

        tag:'div',

        style:{

            height:'48%',

            width:'98%',

            margin:'auto',

            backgroundColor:'rgba(100,100,100,0.2)',

            border:'solid thin rgba(100,100,100,.5)'

        },

        child:[

            label,

            input({

                prop:{

                    placeholder:'Full name',

                    className:'inputRDE',

                    type:'text'

                },

                getDataMethod:getData.getEmail,

            }),

            input({

                prop:{

                    placeholder:'Enter User Name',

                    className:'inputRDE',

                    type:'text',

                },

                getDataMethod:getData.getUserName,

                filter:true

            }),

            input({

                prop:{

                    placeholder:'Enter Password',

                    className:'inputRDE',

                    maxLength:'20',

                    minLength:'8',

                    type:'password',

                },

                getDataMethod:getData.getPassword,

                filter:true

            }),

            Submit()

        ]

    }))

}





export const AddUser=()=>{

    document.head.append($({

        tag:'link',

        att:{

            rel:'stylesheet',

            href:'/client/component/adminComponent/componentStyle/adduser.css'

        }

    }))







    return($({

        tag:'div',

        att:{

            className:'mainFrame addUserPanel'

        },

        child:[

            $({

                tag:'div',

                att:{

                    className: 'addCapUserPan'

                },

                child:[

                    $({

                        tag:'div',

                        att:{

                            className:'labelAdmin'

                        },

                        text:'Register new Account'

                    }),

                    encodeUser(),

                    rdeUser()

                ]

            }),

            $({

                tag:'div',

                att:{

                    className: 'addEvalPan'

                },

                child:[

                    $({

                        tag:'div',

                        att:{

                            className:'labelAdmin'

                        },

                        text:'Register Evaluators Account',

                        event:{

                            type:'click',

                            method:()=>{

                                const req= new Request('/generateZip')

                                req.Post([

                                    {

                                        name:'backupAll',

                                        value:'1'

                                    }

                                ])

                                req.Json()

                                req.Send().then(data=>{



                                })

                            }

                        }

                    }),

                    encodeEvaluator()

                ]

            })

        ]



    }))

}






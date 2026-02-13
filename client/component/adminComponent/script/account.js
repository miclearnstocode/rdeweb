import {$, ConfirmationAlert, Request, Waiting} from '../../../lib/lib.js'

import {Error} from "../../../error.js";







const capUser=()=>{
    const AccountList=()=>{

        let mainListBod

        const head=({text,width})=>{

            return($({

                tag:'div',

                style:{

                    width:width,

                    margin:'auto',

                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                    fontSize:'1vw',

                    color:'#888',

                    textIndent:'.5vw',

                },

                text:text,



            }))

        }

        const listAc=({campusN,name,id,designation,email,username})=>{

            return($({

                tag:'div',

                style:{

                    width:'100%',

                    display:'flex',

                    height:'fit-content',

                    paddingTop:'1vh',

                    paddingBottom:'1vh',

                    fontFamily:'Helvetica',

                    fontSize:'1vw',

                    textIndent: '.5vw',

                    borderBottom:'solid thin #999'

                },

                att:{

                    className:'acListCap'

                },

                child:[

                    $({

                        tag:'div',

                        text:campusN,

                        style:{

                            width:'15%'

                        }

                    }),

                    $({

                        tag:'div',

                        text:designation,

                        style:{

                            width:'15%'

                        }

                    }),

                    $({

                        tag:'div',

                        text:username,

                        style:{

                            width:'15%'

                        }

                    }),

                    $({

                        tag:'div',

                        text:name,

                        style:{

                            width:'30%',
                            whiteSpace:'nowrap',
                            overflow:'hidden',
                            textOverflow:'ellipsis'

                        }

                    }),

                    $({

                        tag:'div',

                        text:email,

                        style:{

                            width:'25%'

                        }

                    }),

                    $({

                        tag:'div',

                        style:{

                            width:'10%',

                            display:"flex",



                        },

                        child:[

                            $({

                                tag:'div',

                                att:{

                                    className:'fa-solid fa-user-pen'

                                },

                                style:{

                                    margin:'auto',

                                    textAlign:'center',

                                    width:'fit-content',

                                    cursor:'pointer'

                                },

                                event:{

                                    type:'click',

                                    method:()=>{

                                        alert("This feature is unavailable.")

                                    }

                                }

                            }),

                            $({

                                tag:'div',

                                att:{

                                    className:'fa-solid fa-trash-can'

                                },

                                style:{

                                    margin:'auto',

                                    textAlign:'center',

                                    width:'fit-content',

                                    cursor:'pointer'

                                },

                                event:{

                                    type:'click',

                                    method:async ()=>{

                                        if(confirm('Are you sure you want to delete this account?')){

                                            const form=new FormData()

                                            form.append('deleteUser','true')

                                            form.append('userID',id)

                                            await fetch('/deleteUser',{

                                                method:'POST',

                                                body:form

                                            }).then(res=>res.json())

                                                .then(data=>{

                                                    if(data.status){

                                                        window.location.reload()

                                                    }else {

                                                        alert(data.messages)

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





        return($({

            tag:'div',

            style:{

                width:'100%',

                margin:'auto',

                height:'100%',

                backgroundColor:'rgba(0,0,0,0.1)'

            },

            child:[

                $({

                    tag:'div',

                    style:{

                        height:'10vh',

                        borderBottom:'solid thin rgba(100,100,100,0.3)',

                        display:'flex',

                        justifyContent:'center',

                    },

                    child:[

                        $({

                            tag:'div',

                            style:{

                                width:'fit-content',

                                height:'Fit-content',

                                padding:'.5rem',

                                display:'flex',

                                border:'solid thin rgba(100,100,100,0.5)',

                                margin:'auto',

                                marginLeft:'.5vw',

                                borderRadius:'.5vw',

                                backgroundColor:'rgba(0,0,0,0.2)'

                            },

                            child:[

                                $({

                                    tag:'div',

                                    att:{

                                        className:'fa-solid fa-magnifying-glass'

                                    },

                                    style:{

                                        fontSize:'1.2vw',

                                        color:'#999'

                                    }

                                }),

                                $({

                                    tag:'input',

                                    style:{

                                        border:'none',

                                        outline:'none',

                                        backgroundColor:'transparent',

                                        width:'25vw',

                                        paddingLeft:'.5vw',

                                        paddingRight:'.5vw',

                                        color:'#bbb'

                                    },

                                    att:{

                                        placeholder:'Enter text here...'

                                    },

                                    event:{

                                        type:'input',

                                        method:(ev)=>{

                                            let list=mainListBod.childNodes

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

                        })

                    ]

                }),

                $({

                    tag:'div',

                    style:{

                        height:'5vh',

                        borderBottom:'solid thin rgba(100,100,100,0.3)',

                        display:'flex'

                    },

                    child:[

                        head({

                            text:'Campus',

                            width:'15%',

                        }),

                        head({

                            text:'User type',

                            width:'15%',

                        }),

                        head({

                            text:'Username',

                            width:'15%',

                        }),

                        head({

                            text:'Full name',

                            width:'30%',

                        }),

                        head({

                            text:'Email',

                            width:'25%',



                        }),

                    ]

                }),



                $({

                    tag:'div',

                    style:{

                        height:'82%',

                        backgroundColor:'rgba(0,0,0,0.2)',

                        overflowY:'auto'

                    },

                    elementHandler:(el)=>{

                        mainListBod=el

                        const req= new Request('/loader')

                        req.Post([

                            {

                                name:'allUserAdmin',

                                value:'0'

                            }

                        ])

                        req.Json()

                        req.Send().then(data=>{

                            data.forEach(val=>{

                                el.appendChild(listAc({

                                    name:(val.fullName!==null)? val.fullName:'Name is empty',

                                    campusN:val.campus,

                                    id:val.id,

                                    designation:val.usertype,

                                    email:val.email,

                                    username:val.username

                                }))

                            })

                        })

                    }



                })

            ]

        }))

    }

    const RequestList=()=>{

        return($({

            tag:'div',

            style:{

                width:'20%',

                margin:'auto',

                height:'100%',

                backgroundColor:'rgba(0,0,0,0.1)'

            }

        }))

    }



    return($({

        tag:'div',

        style:{

            width:'100%',

            height:'100%',

            display:'flex',

            position:'relative'

        },

        child:[

            AccountList(),

        //    RequestList()

        ]

    }))

}



const capsuAccountPage = () => {



    const topBar = () => {

        const searcBar = $({

            tag: 'td',

            att: {

                className: 'searchTd'

            },

            child: [

                $({

                    tag: 'span',

                    att: {

                        className: 'fa fa-search searchIconT'

                    }

                }),

                $({

                    tag: 'input',

                    att: {

                        type: 'text',

                        className: 'inpuTDsearch',

                        placeholder: 'Search name'

                    }

                })

            ]

        })

        const sortBar = $({

            tag: 'td',

            att: {

                className: 'searchTd'

            },

            child: [

                $({

                    tag: 'select',

                    att: {

                        className: 'selectSort',

                    },

                    child: [

                        $({

                            tag: 'option',

                            text: '- - Sort by - -',

                            att: {

                                selected: true,

                                disabled: true

                            }

                        }),

                        $({

                            tag: 'option',

                            text: 'Full name',

                        }),

                        $({

                            tag: 'option',

                            text: 'Campus/Office',

                        }),

                    ]

                })

            ]

        })

        const searchRow = $({

            tag: 'tr',

            child: [

                searcBar,

                sortBar,

                $({

                    tag: 'td',

                    att: {

                        className: 'expandTD'

                    }

                })

            ]

        })

        return ($({

            tag: 'table',

            att: {

                className: 'tapBar'

            },

            child: [searchRow]

        }))

    }

    const listHead = ()=>{

        const getRow=(row)=>{

            row.appendChild($({

                tag:'td',

                att:{

                    className:'listUserName hed',

                },

                text:'UserName'

            }))

            row.appendChild($({

                tag:'td',

                att:{

                    className:'listFullName hed',

                },

                text:'Full name'

            }))

            row.appendChild($({

                tag:'td',

                att:{

                    className:'listEmail hed',

                },

                text:'Email'

            }))

            row.appendChild($({

                tag:'td',

                att:{

                    className:'deleteList',

                },

            }))



        }

        return($({

            tag: 'table',

            att: {

                className: 'listHead'

            },

            child:[

                $({

                    tag:'tr',

                    elementHandler:getRow

                })

            ]

        }))

    }



    const getContainer= async (panel)=>{

        const listTable=({username,fullName,email,id,directory})=>{

            const data=({className,label})=>{

                return($({

                    tag:'td',

                    att:{

                        className:className

                    },

                    text:label

                }))

            }

            const deleteButton=()=>{

                return($({

                    tag:'td',

                    att:{

                        className:'deleteList'

                    },

                    child:[

                        $({

                            tag:'span',

                            att:{

                                className:'fa fa-trash delI'

                            },

                            event:{

                                type:'click',

                                method:async ()=>{

                                    if(confirm('Are you sure you want to delete this account?')){

                                        const form=new FormData()

                                        form.append('deleteUser','true')

                                        form.append('userID',id)

                                        form.append('directory',directory)

                                        await fetch('/deleteUser',{

                                            method:'POST',

                                            body:form

                                        }).then(res=>res.json())

                                            .then(data=>{

                                                if(data.status){

                                                    window.location.reload()

                                                }else {

                                                    alert(data.messages)

                                                }

                                            })

                                    }

                                }

                            }

                        }),

                        $({

                            tag:'div',

                            att:{

                                className:'space'

                            }

                        }),

                        $({

                            tag:'span',

                            att:{

                                className:'fa fa-edit delI'

                            },

                            event:{

                                type:'click',

                                method:()=>{

                                    alert('edit')

                                }

                            }

                        })

                    ]

                }))

            }

            return($({

                tag:'table',

                att:{

                    className:'listTable'

                },

                child:[

                    $({

                        tag:'tr',

                        child:[

                            data({

                                className:'listUserName',

                                label:username

                            }),

                            data({

                                className:'listFullName',

                                label:fullName

                            }),

                            data({

                                className:'listEmail',

                                label:email

                            }),

                            deleteButton()

                        ]

                    })

                ]

            }))

        }

        const form = new FormData();

        form.append('allUserAdmin','true')

        return await fetch('/loader', {

            method: 'POST',

            body: form

        }).then(res=>res.json())

            .then(data=>{

                data.forEach(val=>{

                    panel.appendChild(listTable({

                        username:val.username,

                        fullName:(val.fullname!==null)? val.fullname:'Name is empty',

                        email:val.email,

                        id:val.id,

                        directory:val.directory

                    }))

                })

            })





    }



    const listBar = () => {

        return ($({

            tag: 'div',

            att: {

                className: 'listDiv'

            },

            elementHandler:getContainer

        }))

    }

    return ($({

        tag: 'div',

        att: {

            className: 'capAccPage'

        },

        child: [

            topBar(),

            listHead(),

            listBar()

        ]



    }))

}

const evalPage = () => {



    const mainPan=()=>{

        let bo

        const Label=$({

            tag:'div',

            text:'Evaluators Account',

            style:{

                width: '100%',

                textAlign:'center',

                fontFamily:'arial black, san-serif',

                color:'rgba(200,200,200,0.5)',

                marginBottom:'2vh'

            }

        })

        const container=()=>{



            const list=({fullName,category,username,id})=>{



                return($({

                    tag:'table',

                    att:{

                        className:'listEvalTab'

                    },

                    child:[

                        $({

                            tag:'tr',

                            child:[

                                $({

                                    tag:'td',

                                    style:{

                                        textAlign: 'center',

                                        width:'5%'

                                    },

                                    child:[

                                        $({

                                            tag:'div',

                                            att:{

                                                className:'fa-solid fa-user',



                                            },

                                            style:{

                                                color: 'rgba(200,200,200,0.5)'

                                            }

                                        })

                                    ]

                                }),

                                $({

                                    tag:'td',

                                    text:fullName,

                                    style:{

                                        width:'45%',

                                        fontFamily: 'arial,san-serif',

                                        fontSize:'1vw',

                                        color:'ghostwhite'

                                    }

                                }),

                                $({

                                    tag:'td',

                                    text:username,

                                    style:{

                                        width:'20%',

                                        fontFamily: 'arial,san-serif',

                                        fontSize:'1vw',

                                        color:'rgba(200,200,200,0.5)'

                                    },

                                }),

                                $({

                                    tag:'td',

                                    text:category,

                                    style:{

                                        width:'20%',

                                        fontFamily: 'arial,san-serif',

                                        fontSize:'1vw',

                                        color:'rgba(200,200,200,0.5)'

                                    },

                                }),





                                $({

                                    tag:'td',



                                    att:{

                                      className:"delBotEval"

                                    },

                                    event:{

                                        type:'click',

                                        method:async ()=>{

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

                                    child:[

                                        $({

                                            tag:'div',

                                            att:{

                                                className:'fa-solid fa-trash-can deleteEval'

                                            },



                                        })

                                    ]

                                })

                            ]

                        }),



                    ]

                }))

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

                        data.forEach(val=>{


                            panel.insertBefore(list({

                                fullName:val.fullname,

                                category:val.category,

                                id:val.id,

                                username:val.username

                            }),panel.childNodes[0])

                        })

                    })



            }

            return($({

                tag:'div',

                style:{

                    width:'100%',

                    height: '80%',

                    borderLeft:'solid thin #555',

                    borderRight:'solid thin #555',

                    backgroundColor:'rgba(0,0,0,0.2)',

                    overflowY:'auto'

                },

                elementHandler:getContainer

            }))

        }

        const SearchBar=()=>{

            return($({

                tag:'div',

                style:{

                    height:'4vh',

                    border:'solid thin #999',

                    width:'20vw',

                    marginBottom: '1vh',

                    borderRadius:'.5vw',

                    display:'flex',

                    padding:'.3rem',

                    backgroundColor:'rgba(0,0,0,0.3)',

                    color:'#bbb'

                },

                child:[

                    $({

                        tag:'div',

                        att:{

                            className:'fa-solid fa-magnifying-glass'

                        },

                        style:{

                            margin:'auto',

                            marginLeft:'1vw',

                            fontSize:'1vw'

                        }



                    }),

                    $({

                        tag:'input',

                        att:{

                            type:'text',

                            placeholder:'Search'

                        },

                        style:{

                            backgroundColor:'transparent',

                            border:'none',

                            outline:'none',

                            height:'100%',

                            width:'100%',

                            paddingLeft:'1vw',

                            color:'#bbb',

                            fontSize:'1vw'

                        },

                        event:{

                            type:'input',

                            method:(ev)=>{

                                let list=bo.childNodes

                                for(let val of list){

                                    if(!val.innerText.toUpperCase().includes(ev.target.value.toUpperCase())){

                                        val.style.display='none'

                                    }else {

                                        val.style.display='table'

                                    }

                                }

                            }

                        }

                    })

                ]

            }))

        }

        const Head=()=>{

            const Leb=({label,width,indent})=>{

                return($({

                    tag:'div',

                    style:{

                        width:width,

                        textIndent:indent,

                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                        fontSize:'1.3vw',

                        color:'#bbb',



                    },

                    text:label

                }))

            }

            return($({

                tag:'div',

                style:{

                    display:'flex',

                    width:'100%',

                    backgroundColor:'#444'

                },

                child:[

                    Leb({label:'Fullname',width:'50%',indent:'3vw'}),

                    Leb({label:'username',width:'20%'}),

                    Leb({label:'Category',width:'20%'}),

                ]

            }))

        }

        return($({

            tag:'div',

            style:{

                width:'80%',

                margin:'1% auto',

                height:'98%'

            },

            child:[

                Label,

                SearchBar(),

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

const rdePage=()=>{

    let mainPan

    const FullList=(url)=>{

        let bodyPan

        const Head=()=>{



            const searchInput=()=>{

                return($({

                    tag:'div',

                    style:{

                        height:'fit-content',

                        width:'fit-content',

                        padding:'.5rem',

                        display:'flex',

                        border:'solid thin rgba(200,200,200,0.4)',

                        margin:'auto',

                        marginLeft:'.5vw',

                        backgroundColor:'rgba(0,0,0,0.3)',

                        borderRadius:'.5vw'

                    },

                    child:[

                        $({

                            tag:'div',

                            att:{

                                className:'fa-solid fa-magnifying-glass'

                            },

                            style:{

                                fontSize:'1.3vw',

                                color:'#888'

                            }

                        }),

                        $({

                            tag:'input',

                            style:{

                                marginLeft:'.5vw',

                                width:'25vw',

                                fontSize:'1.1vw',

                                border:'none',

                                outline:'none',

                                backgroundColor:'transparent',

                                color:'#bbb'

                            },

                            att:{

                                placeholder:'Enter text here...'

                            },

                            event:{

                                type:'input',

                                method:(eve)=>{



                                    //bodyPan

                                    const child=bodyPan.childNodes

                                    for(let val of child){

                                        if(!val.innerText.toUpperCase().includes(eve.target.value.toUpperCase())){

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



            return($({

                tag:'div',

                style:{

                    height:'10%',

                    width:'80%',

                    backgroundColor: 'rgba(0,0,0,0.2)',

                    margin: 'auto',

                    display:'flex'

                },

                child:[

                    searchInput()

                ]

            }))

        }

        const Body=()=>{



            const list=(userName,name,accountID)=>{

                return($({

                    tag:'div',

                    att:{

                        className:'listRde'

                    },

                    style:{

                        width:'98%',

                        margin:'.5vh auto auto',

                        height:'fit-content',

                        display:'flex',

                        paddingLeft:'.5vw',

                        paddingRight:'.5vw'

                    },

                    child:[

                        $({

                            tag:'div',

                            text:userName,

                            style:{

                                marginLeft:'0',

                                fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',



                                width:'20vw'

                            }

                        }),

                        $({

                            tag:'div',

                            text:name,

                            style:{

                                marginLeft:'0',

                                fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                width:'40vw',

                            }

                        }),

                        $({

                            tag:'div',

                            att:{

                                className:'fa-solid fa-user-pen openDet',

                            },

                            style:{

                                margin:'auto',

                                marginRight:'.5vw'

                            },

                            event:{

                                type:'click',

                                method:()=>{

                                    if(typeof (history.pushState)!==undefined){

                                        let obj={

                                            Title:'RDE',

                                            Url:url.replace('list','account/')+accountID

                                        }

                                        /* Pushing a new state to the history object. */

                                        history.pushState(obj,obj.Title,obj.Url)

                                        mainPan.innerHTML=''

                                        mainPan.appendChild(account())

                                    }else {

                                        window.location.assign(url.replace('list','account/')+accountID)

                                    }



                                }

                            }

                        }),

                        $({

                            tag:'div',

                            att:{

                                className:'fa-solid fa-trash-can openDet',

                            },

                            style:{

                                margin:'auto',

                                marginLeft:'.5vw'

                            },

                            event:{

                                type:'click',

                                method:()=>{

                                    if(confirm("This operation cannot be undone. Would you like to proceed?")){

                                        const req= new Request('/rdeaccreq')

                                        req.Post([

                                            {

                                                name:'deleteRDEaccount',

                                                value:'0'

                                            },

                                            {

                                                name:'userId',

                                                value:accountID

                                            }

                                        ])

                                        req.Json()

                                        req.Send().then(data=>{

                                            if(data.status){

                                                window.location.reload()

                                            }else {

                                                alert(data.message)

                                            }

                                        })

                                    }

                                }

                            }

                        }),

                    ],



                }))

            }



            return($({

                tag:'div',

                style:{

                    height:'90%',

                    width:'80%',

                    margin:'auto',

                    backgroundColor:'rgba(0,0,0,0.5)',

                    overflowY: 'auto',

                },

                elementHandler:(el)=>{

                    bodyPan=el

                    /* Sending a POST request to the server with the data rdeAccReq=0 */

                    const req=new Request('/rdeaccreq')

                    req.Post([

                        {

                            name:'rdeAccReq',

                            value:'0'

                        }

                    ])

                    req.Json()

                    req.Send().then(data=>{

                        data.forEach(val=>{

                          el.appendChild(list(val.username,val.email,val.id))

                        })

                    })

                }

            }))

        }

        return($({

            tag:'div',

            style:{

                width:'100%',

                height:'100%'

            },



           child:[

               Head(),

               Body()

           ]



        }))

    }



    const account=()=>{

        let acBody



        const current= window.location.href

        const origin=window.location.origin

        /* Getting the userID from the current URL. */

        const userID=current.replace(origin,'').split('/')[5]



        let fName,uName, pass



        const EditName=({reqUrl,reqName,label,placeHolder})=>{

            let mainBox

            let inputName

            const input=$({

                tag:'div',

                style:{

                    width:'fit-content',

                    height:'fit-content',

                    margin:'auto',

                    border:'solid thin rgba(200,200,200,0.3)',

                },

                child:[

                    $({

                        tag:'input',

                        style:{

                            backgroundColor:'transparent',

                            width:'30vw',

                            border:'none',

                            outline:'none',

                            padding:'.5rem',

                            fontSize:'1vw',

                            color:'#bbb'

                        },

                        att:{

                            placeholder: placeHolder

                        },

                        elementHandler:(el)=>{

                            setTimeout(()=>{

                                el.focus()

                            },50)

                        },

                        event:{

                            type:'input',

                            method:(ev)=>{

                                inputName=ev.target.value

                            }

                        }

                    })

                ]

            })

            const submit=$({

                tag:'div',

                style:{

                    fontFamily:'arial black, sans-serif',

                    fontSize:'1.5vw',

                    textAlign:'center',

                    margin:'2vh auto',

                    color:'deepskyblue',

                    cursor:'pointer',

                },

                text:'Save',

                event:{

                    type:'click',

                    method:()=>{

                        if(confirm("Save Changes?")){

                            const req= new Request(reqUrl)

                           // const req= new Request('/rdeaccreq')

                            //editNameRde

                            req.Post([

                                {

                                    name:'userID',

                                    value:userID

                                },

                                {

                                    name:reqName,

                                    value:'0'

                                },

                                {

                                    name:'fullNameInput',

                                    value:inputName

                                }

                            ])

                            req.Json()

                            req.Send().then(data=>{

                                if(!data.status){

                                    alert(data.messages)

                                }else {

                                    window.location.reload()

                                }

                            })

                        }





                    }

                }



            })







            return($({

                tag:'div',

                style:{

                    width:'100%',

                    height:'100%',

                    position: 'absolute',

                    top:'0',

                    left:'0',

                    backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',

                    display:'flex',

                },

                elementHandler:(el)=>{

                    mainBox=el

                },

                child:[

                    $({

                        tag:'div',

                        style:{

                            width:'50%',

                            height:'fit-content',

                            backgroundColor:'#222',

                            margin:'auto',

                            padding:'1rem',

                            border:'solid thin #999',

                            borderRadius:'.5vw',

                            position:'relative'

                        },

                        child:[

                            $({

                                tag:'div',

                                att:{

                                    className:'fa-solid fa-circle-xmark'

                                },

                                style:{

                                    position:'absolute',

                                    right: '.5vw',

                                    top: '1vh',

                                    color:'deepskyblue',

                                    cursor:'pointer',



                                },

                                event:{

                                    type:'click',

                                    method:()=>{

                                        mainBox.remove()

                                    }

                                }

                            }),

                            $({

                                tag:'div',

                                text:label,

                                style:{

                                    margin:'1vh auto',

                                    fontFamily:'arial black,sans-serif',

                                    fontWeight:"bold",

                                    color:'#999'

                                }

                            }),

                            input,

                            submit

                        ]

                    })

                ]

            }))

        }
        const ChangePassRde=({reqUrl,reqName,label,placeHolder})=>{
            let mainBox
            let inputName

            const input=$({

                tag:'div',

                style:{

                    width:'fit-content',

                    height:'fit-content',

                    margin:'auto',

                    border:'solid thin rgba(200,200,200,0.3)',

                },

                child:[

                    $({

                        tag:'input',

                        style:{

                            backgroundColor:'transparent',

                            width:'30vw',

                            border:'none',

                            outline:'none',

                            padding:'.5rem',

                            fontSize:'1vw',

                            color:'#bbb'

                        },

                        att:{

                            placeholder: placeHolder

                        },

                        elementHandler:(el)=>{

                            setTimeout(()=>{

                                el.focus()

                            },50)

                        },

                        event:{

                            type:'input',

                            method:(ev)=>{

                                inputName=ev.target.value

                            }

                        }

                    })

                ]

            })
            const submit=$({

                tag:'div',

                style:{

                    fontFamily:'arial black, sans-serif',

                    fontSize:'1.5vw',

                    textAlign:'center',

                    margin:'2vh auto',

                    color:'deepskyblue',

                    cursor:'pointer',

                },

                text:'Save',

                event:{

                    type:'click',

                    method:()=>{

                        if(confirm("Save Changes?")){

                            const req= new Request(reqUrl)

                            // const req= new Request('/rdeaccreq')

                            //editNameRde

                            req.Post([

                                {

                                    name:'userID',

                                    value:userID

                                },

                                {

                                    name:reqName,

                                    value:'0'

                                },

                                {

                                    name:'changePassInput',

                                    value:inputName

                                }

                            ])

                            req.Json()

                            req.Send().then(data=>{

                                if(!data.status){

                                    alert(data.messages)

                                }else {

                                    window.location.reload()

                                }

                            })

                        }





                    }

                }



            })
            return($({

                tag:'div',

                style:{

                    width:'100%',

                    height:'100%',

                    position: 'absolute',

                    top:'0',

                    left:'0',

                    backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',

                    display:'flex',

                },

                elementHandler:(el)=>{

                    mainBox=el

                },

                child:[

                    $({

                        tag:'div',

                        style:{

                            width:'50%',

                            height:'fit-content',

                            backgroundColor:'#222',

                            margin:'auto',

                            padding:'1rem',

                            border:'solid thin #999',

                            borderRadius:'.5vw',

                            position:'relative'

                        },

                        child:[

                            $({

                                tag:'div',

                                att:{

                                    className:'fa-solid fa-circle-xmark'

                                },

                                style:{

                                    position:'absolute',

                                    right: '.5vw',

                                    top: '1vh',

                                    color:'deepskyblue',

                                    cursor:'pointer',



                                },

                                event:{

                                    type:'click',

                                    method:()=>{

                                        mainBox.remove()

                                    }

                                }

                            }),

                            $({

                                tag:'div',

                                text:label,

                                style:{

                                    margin:'1vh auto',

                                    fontFamily:'arial black,sans-serif',

                                    fontWeight:"bold",

                                    color:'#999'

                                }

                            }),

                            input,

                            submit

                        ]

                    })

                ]

            }))
        }





        return($({

            tag:'div',

            style:{

                width:'100%',

                height:'100%',

                display: 'flex',

                position:'relative',

            },

            elementHandler:(el)=>{

                acBody=el

                const req= new Request('/rdeaccreq')

                req.Post([

                    {

                        name:'accountIdRde',

                        value:'0',

                    },

                    {

                        name: 'userID',

                        value:userID

                    }

                ])

                req.Json()

                req.Send().then(data=>{

                    fName.innerText=data.fullname

                    uName.innerText=data.username

                })

            },

            child:[

                $({

                    tag:'div',

                    style:{

                        marginLeft:'1vw',

                        position:'absolute',

                        top:'2vh',

                        display:'flex',

                        width:'5vw',

                    },

                    att:{

                        className:'backRdeAc'

                    },

                    child:[

                        $({

                            tag:"div",

                            att:{

                                className:'fa-solid fa-square-caret-left'

                            },

                            style:{

                                fontSize:'1.2vw',

                                margin:'auto'

                            }

                        }),

                        $({

                            tag:'div',

                            style:{

                                fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                fontSize:'1.1vw',

                                margin:'auto',

                                height:'fit-content',

                                fontWeight:'bold'

                            },

                            text:'Back'

                        })

                    ],

                    event:{

                        type:'click',

                        method:()=>{

                            window.location.assign('/admin/accountList/rdestaff/list')

                        }

                    },

                }),

                $({

                    tag:'div',

                    style:{

                        width:'40%',

                        height:'fit-content',

                        margin:'auto'

                    },

                    child:[

                        $({

                            tag:'div',

                            style:{

                                height:'fit-content',

                                width:'98%',

                                border: 'solid thin grey',

                                padding:'.5rem',

                                display:'flex'

                            },

                            child:[

                                $({

                                    tag:'div',

                                    text:'Full Name : ',

                                    style:{

                                        whiteSpace:'nowrap',

                                        fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                        fontSize:'1vw',

                                        fontWeight:'bolder',

                                        color:'deepskyblue'

                                    }

                                }),

                               $({

                                   tag:'div',

                                   style:{

                                       width:'100%',

                                       marginLeft: '.5vw',

                                       fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                       fontSize:'1vw',

                                       color:'#bbb'

                                   },

                                   elementHandler:(el)=>{

                                       fName=el

                                   }

                               }),

                                $({

                                    tag:'div',

                                    att:{

                                        className:'fa-solid fa-pen-to-square'

                                    },

                                    style:{

                                        width:'fit-content',

                                        whiteSpace:'nowrap',

                                        cursor:'pointer',

                                        color:'deepskyblue'

                                    },

                                    event:{

                                        type:'click',

                                        method:()=>{

                                            acBody.appendChild(EditName({

                                                reqUrl:'/rdeaccreq',

                                                reqName:'editNameRde',

                                                label:'Edit Full name',

                                                placeHolder:'Fullname'

                                            }))

                                        }

                                    }

                                }),

                            ]

                        }),
                        $({

                            tag:'div',

                            style:{

                                height:'fit-content',

                                width:'98%',

                                border: 'solid thin grey',

                                padding:'.5rem',

                                display:'flex',

                                margin:'1vh auto auto'

                            },

                            child:[

                                $({

                                    tag:'div',

                                    text:'Username : ',

                                    style:{

                                        whiteSpace:'nowrap',

                                        fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                        fontSize:'1vw',

                                        fontWeight:'bolder',

                                        color:'deepskyblue'

                                    }

                                }),

                                $({

                                    tag:'div',

                                    style:{

                                        width:'100%',

                                        marginLeft:'.5vw',

                                        fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                        fontSize:'1vw',

                                        color:'#bbb'



                                    },

                                    elementHandler:(el)=>{

                                        uName=el

                                    }

                                }),

                                $({

                                    tag:'div',

                                    att:{

                                        className:'fa-solid fa-pen-to-square'

                                    },

                                    style:{

                                        width:'fit-content',

                                        whiteSpace:'nowrap',

                                        cursor:'pointer',

                                        color:'deepskyblue'

                                    },

                                    event:{

                                        type:'click',

                                        method:()=>{

                                            acBody.appendChild(EditName({

                                                reqUrl:'/rdeaccreq',

                                                reqName:'editUserNameRde',

                                                label:'Edit Username',

                                                placeHolder:'username'

                                            }))

                                        }

                                    }

                                }),

                            ]

                        }),
                        $({

                            tag:'div',

                            style:{

                                height:'fit-content',

                                width:'98%',

                                border: 'solid thin grey',

                                padding:'.5rem',

                                display:'flex',

                                margin:'1vh auto auto'

                            },

                            child:[



                                $({

                                    tag:'div',

                                    style:{

                                        width:'100%',

                                        marginLeft:'.5vw',

                                        fontFamily:' Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',



                                        color:'#bbb',
                                        textAlign:'center',
                                        fontStyle:'2vw'



                                    },

                                    text:'Change Password'

                                }),

                                $({

                                    tag:'div',

                                    att:{

                                        className:'fa-solid fa-pen-to-square'

                                    },

                                    style:{

                                        width:'fit-content',

                                        whiteSpace:'nowrap',

                                        cursor:'pointer',

                                        color:'deepskyblue'

                                    },

                                    event:{

                                        type:'click',

                                        method:()=>{

                                            acBody.appendChild(ChangePassRde({

                                                reqUrl:'/rdeaccreq',

                                                reqName:'editPass',

                                                label:'Change Password',

                                                placeHolder:'New Password'

                                            }))

                                        }

                                    }

                                }),

                            ]

                        }),


                    ]

                })

            ]

        }))

    }



    return($({

        tag:'div',

        style:{

            height:'100%',

            width:'100%',

        },



        elementHandler:(el)=>{

            mainPan=el

            const origin=window.location.origin

            const current= window.location.href.replace(origin,'')

            const route=current.split('/')[4]

            switch (route){

                case 'list':

                    el.appendChild(FullList(current))

                    break;

                case 'account':

                    el.appendChild(account())

                    break;

                default: el.appendChild(Error())

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


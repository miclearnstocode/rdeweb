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
                            text:'Campus/Center',
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
                                    campusN:val.center,  // Changed from val.campus to val.center
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
                marginBottom:'2vh',
                fontSize:'1.5vw',
                letterSpacing:'0.1vw',
                textTransform:'uppercase',
                textShadow:'0 0 10px rgba(0,191,255,0.3)'
            }
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
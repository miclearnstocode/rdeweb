import {$,TextAreaExpand} from '../../../lib/lib.js'

const ComposedBox=()=>{
    let box
    const getBox=(element)=>{
        box=element
    }
    const getClose=(cls)=>{
        cls.addEventListener('click',()=>{
            sessionStorage.removeItem('create')
            box.remove()
        })

    }
    const header=()=>{

        const Expand=()=>{
            return($({
                tag:'td',
                att:{
                    className:'closeTd'
                },
                event:{
                    type:'click',
                    method:()=>{
                        alert("No script...")
                    }
                },
                child:[
                    $({
                        tag:'span',
                        att:{
                            className:'fa fa-expand'
                        }
                    })
                ]
            }))
        }
        const Minimize=()=>{
            return($({
                tag:'td',
                att:{
                    className:'closeTd'
                },event:{
                    type:'click',
                    method:()=>{
                        alert("No script...")
                    }
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'min'
                        }
                    })
                ]
            }))
        }
        const Close=()=>{
            return($({
                tag:'td',
                att:{
                    className:'closeTd'
                },
                elementHandler:getClose,
                child:[
                    $({
                        tag:'span',
                        att:{
                            className:'fa fa-close'
                        }
                    })
                ]
            }))
        }
        const Row=()=>{
            return ($({
                tag:'tr',
                child:[
                    $({
                        tag:'td',
                        style:{
                            width:'100%'
                        }
                    }),
                    Minimize(),
                    Expand(),
                    Close()
                ]
            }))
        }

        return($({
            tag:'table',
            att:{
                className:'compHeader'
            },
            child:[
                Row()
            ]
        }))
    }
    let recEl
    let userList=[]
    const  getListCon =(element)=>{
        recEl=element
    }

    const data={
        recipient:[],
        textMessage:'',
        files:[]
    }

    const getData={
        getReceiver:(value)=>{
            data.recipient.push(value)
        },
        getFile:(value)=>{
            data.files.push(value)
        },
        getText:(value)=>{
            data.textMessage=value
        }
    }
    const UserReceiver=(account)=>{
        let m
        const getmain=(element)=>{
            m=element
        }
        const nem=$({
            tag:'span',
            text:account
        })
        const x=$({
            tag:'span',
            att:{
                className:'fa fa-times'
            },
            style:{
                marginLeft:'1vw',
                cursor:'pointer'
            },
            event:{
                type:'click',
                method:()=>{
                    for(let x=0;x<data.recipient.length;x++){
                        if(data.recipient[x].email===account){
                            data.recipient.splice(x,1)
                        }
                    }

                    m.remove()
                }
            }

        })
        return($({
            tag:'span',
            att:{
                className:'userRec'
            },
            elementHandler:getmain,
            child:[
                nem,
                x,
            ]
        }))
    }


    const Recipient=()=>{

        const inputTag= ()=>{
            let inputUs
            const getInputSearch=(input)=>{
                inputUs=input
                input.setAttribute('list','dataListRec')
            }
            const addIcon=$({
                tag:'span',
                att:{
                    className:'fa fa-user-plus addRece'
                },
                event:{
                    type:'click',
                    method:()=>{
                        recEl.innerHTML=''
                        for(let x=0;x<userList.length;x++){
                            if(userList[x].email===inputUs.value){
                                getData.getReceiver({
                                    email:userList[x].email,
                                    id:userList[x].id
                                })
                            }
                        }

                        inputUs.value=''
                        data.recipient.forEach(val=>{
                            recEl.appendChild(UserReceiver(val.email))
                        })
                    }
                }
            })

            const getDataList=async (dtList)=>{
                const op=({value,id})=>{
                    return($({
                        tag:'option',
                        att:{
                            value:value,
                            id:id
                        }
                    }))
                }
                const form=new FormData()
                form.append('allUser','true')

                await fetch('/loader',{
                    method:'POST',
                    body:form
                }).then(res=>res.json())
                    .then(data=>{
                        data.forEach(val=>{
                            userList.push({
                                email:val.email,
                                id:val.id
                            })
                            dtList.appendChild(op({
                                value:val.email,
                                id:val.id
                            }))
                        })
                    })
            }


            const dataList=$({
                tag:'datalist',
                att:{
                    id:'dataListRec'
                },
                elementHandler:getDataList

            })
            const input=$({
                tag:'input',
                att:{
                    className:'inputAd',
                    type: 'search'
                },
                elementHandler:getInputSearch
            })
            return($({
                tag:'div',
                att:{
                    className:'addInputBox'
                },
                child:[
                    dataList,
                    addIcon,
                    input,
                ]
            }))
        }

        return($({
            tag:'div',
            att:{
                className:'recipt'
            },
            child:[
                inputTag(),
            ]
        }))
    }

    const overFlow=()=>{
        const listUser=()=>{
            return($({
                tag:'div',
                att:{
                    className:'listUser'
                },
                elementHandler:getListCon
            }))
        }

        const textInput=()=>{

            return($({
                tag:'textarea',
                att:{
                    className:'textAreaCom',
                    placeholder:'Insert text here...',

                },
                event:{
                    type:'input',
                    method:(event)=>{
                        getData.getText(event.target.value)
                        event.target.style.height=TextAreaExpand(event.target.value)+'vh'
                        event.target.style.padding='.5vh'
                    }
                }
            }))
        }

        const uploadContainer=()=>{

            const uploadInput=()=>{
                let listCon
                const getListCon=(obj)=>{
                    listCon=obj
                }

                const getNameList=(data)=>{
                    listCon.innerHTML=''

                    for(let x=0;x<data.length;x++){
                        getData.getFile(data[x])
                        listCon.appendChild($({
                            tag:'div',
                            text:data[x].name
                        }))
                    }

                }

                const inputFile=()=>{
                    const inputFile=$({
                        tag:'input',
                        att:{
                            type:'file',
                            className:'fileInputCom',
                            multiple:true
                        },
                        event:{
                            type:'input',
                            method:(event)=>{
                                data.files=[]
                                getNameList(event.target.files)

                            }
                        }
                    })
                    const labelDisplay=$({
                        tag:'label',
                        att:{
                            className:'labelDisp'
                        },
                        text:'Insert PDF file'
                    })
                    return($({
                        tag:'div',
                        att:{
                            className:'inputDivFile'
                        },
                        child:[
                            labelDisplay,
                            inputFile
                        ]
                    }))
                }
                const fileCon=()=>{

                    return($({
                        tag:'div',
                        att:{
                            className:'fileContCom'
                        },
                        elementHandler:getListCon

                    }))
                }
                return($({
                    tag:'div',
                    child:[
                        inputFile(),
                        fileCon()
                    ]
                }))
            }

            return($({
                tag:'div',
                att:{
                    className:'uploadCon'
                },
                child:[
                    uploadInput(),

                ]
            }))
        }

        return($({
            tag:'div',
            att:{
                className:'overFlowMid'
            },
            child:[
                listUser(),
                textInput(),
                uploadContainer()
            ]
        }))
    }

    const SendCon=()=>{

        const sendBot=$({
            tag:'div',
            att:{
                className: 'sendIconBox'
            },
            event:{
                type:'click',
                method:async ()=>{
                    const form=new FormData()
                    form.append('sendFile','true')

                    data.files.forEach(val=>{
                        form.append('file[]',val)
                    })
                    data.recipient.forEach(val=>{

                        form.append('receiver[]',val.id)
                        form.append('receiverEmail[]',val.email)
                    })
                    form.append('textMessage',data.textMessage)

                    await fetch('/filesSend',{
                        method:'POST',
                        body:form
                    }).then(res=>res.json())
                        .then(data=>{
                            if(data.status)
                            {
                                alert(data.message);
                                window.location.reload()
                            }else{
                                alert('Error: ' + (data.message || 'Failed to send file'))
                            }
                        }).catch(err=>{
                            console.error('Error sending file:', err)
                            alert('Error sending file. Please try again.')
                        })
                }
            },
            child:[
                $({
                    tag:'span',
                    att:{
                        className:'fa fa-paper-plane'
                    },
                }),
                $({
                    tag:'span',
                    text:'Send'
                })
            ]
        })
        return($({
            tag:'div',
            att:{
                className:'sendCon'
            },
            child:[
                sendBot
            ]
        }))
    }

    return($({
        tag:'div',
        att:{
            className: "composedBox"
        },
        elementHandler:getBox,
        child:[
            header(),
            Recipient(),
            overFlow(),
            SendCon()
        ]
    }))
}


export const Composed=()=>{


    const compBox=ComposedBox()

    if(sessionStorage.getItem('create')!==null){
        document.body.appendChild(compBox)
    }
    return($({
        event:{
            type:'click',
            method:()=>{
                if(sessionStorage.getItem('create')===null){
                    sessionStorage.setItem('create','true')
                    document.body.appendChild(compBox)

                }else {
                    sessionStorage.removeItem('create')
                    compBox.remove()
                }

            }
        },
        tag:'div',
        att:{
            className:'composePanel'
        },
        externalStyle:'/client/component/userComponent/userComponentStyle/compose.css',
        child:[
            $({
                tag:'div',
                att:{
                    className:'holdIcon'
                },
                child:[
                    $({
                        tag:'span',
                        att:{
                            className:'fa fa-pencil icon'
                        },
                    }),
                    $({
                        tag:'span',
                        text:'Compose'
                    }),
                ]
            })
        ],

    }))
}

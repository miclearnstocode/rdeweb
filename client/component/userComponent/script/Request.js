import {$, ConfirmationAlert, Request, Waiting} from '../../../lib/lib.js'

export const ReqButton = () => {
    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '5vh',
            marginBottom: '3vh',
            marginTop: '3vh',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer'
        },
        att: {
            className: 'reqBot'
        },
        externalStyle: '/client/component/userComponent/userComponentStyle/request.css',
        child: [
            $({
                tag: 'div',
                att: {
                    className: "fa-solid fa-circle-exclamation",
                },
                style: {
                    margin: 'auto',
                    fontSize: '1.5vw',
                    width: 'fit-content',
                    height: 'fit-content',
                    marginRight: '0',
                    marginLeft: 'auto'
                }
            }),
            $({
                tag: 'div',

                style: {
                    margin: 'auto',
                    height: 'fit-content',
                    width: 'fit-content',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                    marginLeft: '1vw',
                    marginRight: 'auto'

                },
                text: "User's Request"
            })
        ],
        event: {
            type: 'click',
            method: () => {
                document.body.appendChild(UserRequest())
            }
        }
    }))
}

const UserRequest = () => {
    let main
    const Holder = () => {

        const Close = () => {
            return ($({
                tag: 'div',
                att: {
                    className: 'fa-solid fa-circle-xmark'
                },
                style: {
                    position: 'absolute',
                    left: '-5vw',
                    top: '-2vw',
                    color: 'deepskyblue',
                    fontSize: '2.5vw',
                    cursor: 'pointer'
                },
                event: {
                    type: 'click',
                    method: () => {
                        main.remove()
                    }
                }
            }))
        }
        const Label = (leb) => {
            return ($({
                tag: 'div',
                text: leb,
                style: {
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize: '1.1vw',
                    fontWeight: 'bolder',
                    textAlign: 'center',
                    marginTop: '1vh',
                    marginBottom: '1vh',
                    color: '#bbb'
                }
            }))
        }
        const requestPanel = () => {

            const RequestList = ({user, fileName, fileType, id, campus, date,reqId}) => {
                let getMainReq
                const Name = $({
                    tag: 'div',
                    text: user,
                    att: {
                        title: campus,
                    },
                    style: {
                        color: '#bbb',
                        width: '60%'
                    }
                })
                const file = $({
                    tag: 'div',
                    text: fileName,
                    att: {
                        title: fileType
                    },
                    style: {
                        color: '#bbb',
                        width: '40%'
                    }
                })
                const dateTime = $({
                    tag: 'div',
                    text: date,
                    style: {
                        fontSize: '1vw',
                        color: '#999'
                    }
                })
                const control = () => {
                    const Icon = ({clsName, style, method}) => {
                        return ($({
                            tag: 'div',
                            style: style,
                            att: {
                                className: clsName + ' iconLog'
                            },
                            event:{
                                type:'click',
                                method:method
                            }
                        }))
                    }

                    const fileViewer=(url)=>{
                        let flV
                        return($({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'100%',
                                position:'absolute',
                                left:'0',
                                right:'0',
                                backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                display:'flex'
                            },
                            elementHandler:(el)=>{
                                flV=el
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'80%',
                                        height:'96%',
                                        margin:'auto',
                                        border:'solid thin rgba(100,100,100,0.5)',
                                        borderRadius: '.5vw',
                                        padding: '.5rem',
                                        position:'relative'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            att:{
                                                className:'fa-solid fa-circle-xmark'
                                            },
                                            style:{
                                                fontSize:'3vw',
                                                position:'absolute',
                                                left:'-4vw',
                                                color:'deepskyblue',
                                                cursor:'pointer'
                                            },
                                            event:{
                                                type:'click',
                                                method:()=>{
                                                    flV.remove()
                                                }
                                            },
                                        }),
                                        $({
                                            tag:'object',
                                            att:{
                                                data:url,
                                                type:'application/pdf'
                                            },
                                            style:{
                                                width:'100%',
                                                height:'100%',
                                            }
                                        })
                                    ]
                                })
                            ]
                        }))
                    }
                    return ($({
                        tag: 'div',
                        style: {
                            width: '30%',
                            display: 'flex',
                            justifyContent: 'center',
                            position: 'relative',

                        },

                        child: [
                            Icon({
                                clsName: 'fa-solid fa-thumbs-up',
                                style: {
                                    left: '0',
                                    top: '0',
                                    bottom: '0',
                                    right: 'auto',
                                    margin: 'auto'
                                },
                                method:async ()=>{
                                    if(confirm("Allow this user to access this file?")){
                                        let loading = Waiting()
                                        document.body.appendChild(loading)
                                        const remove = () => {
                                            loading.remove()
                                        }
                                        const form= new FormData()
                                        form.append('allowAccess','true')
                                        form.append('requestId',reqId)
                                        await fetch('/requestDocs',{
                                            method:'POST',
                                            body:form
                                        }).then(res => {
                                            if (res.ok) {
                                                remove()
                                                return res.json()
                                            }
                                        })
                                            .then(dat => {
                                                if (dat.status) {
                                                    document.body.appendChild(ConfirmationAlert("Success..!", () => {
                                                        window.location.reload()
                                                    }))
                                                } else {
                                                    document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                        window.location.reload()
                                                    }))
                                                }
                                            })
                                    }
                                }
                            }),
                            Icon({
                                clsName: 'fa-solid fa-trash-can',
                                style: {
                                    left: 'auto',
                                    top: '0',
                                    bottom: '0',
                                    right: 'auto',
                                    margin: 'auto'
                                },
                                method:()=>{
                                    if(confirm("This operation cannot be undone. Would you like to proceed? ")){
                                        const req=new Request('/requestDocs')
                                        req.Post([
                                            {name:'declinedFileRequest',value:'0'},
                                            {name:'reqId',value:reqId}
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            if(data.status){
                                                getMainReq.remove()
                                            }else {
                                                alert(data.message)
                                            }
                                        })
                                    }
                                }
                            }),
                            Icon({
                                clsName: 'fa-solid fa-folder-open',
                                style: {
                                    left: 'auto',
                                    top: '0',
                                    bottom: '0',
                                    right: '0',
                                    margin: 'auto'
                                },
                                method:()=>{

                                    const req= new Request('/uploadResearchFile')
                                    req.Post([
                                        {name:'viewDocReq',value:'true'},
                                        {name:'docId',value:id},
                                    ])
                                    req.Json()
                                    req.Send().then(data=>{
                                        if(data.status){
                                            main.appendChild(fileViewer('/'+data.data))
                                        }else {
                                            alert("File not found..!")
                                        }
                                    })



                                }
                            })
                        ]
                    }))
                }
                return ($({
                    tag: 'div',
                    style: {
                        width: '97%%',
                        margin: '1vh auto',
                        height: 'fit-content',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        padding: '.5rem',
                        borderRadius: '.5rem',
                    },
                    att: {
                        className: 'listReq'
                    },
                    elementHandler:(el)=>{
                        getMainReq=el
                    },
                    child: [
                        $({
                            tag: 'div',
                            child: [
                                dateTime
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                width: '100%'
                            },
                            child: [
                                Name,
                                control()
                            ]
                        })
                    ]
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    width: '50%',
                    height: '100%',
                    border: 'solid thin rgba(100,100,100,0.5)',
                    backgroundColor: '#333',

                },
                child: [
                    Label("User's Request"),
                    $({
                        tag: 'div',
                        style: {
                            height: '93%',
                            width: '95%',
                            margin: 'auto',
                            overflowY: 'auto',
                        },
                        elementHandler: (el) => {
                            const request = new Request('/requestDocs')
                            const reqForm = []
                            reqForm.push({
                                name: 'getDocRequest',
                                value: 'true'
                            })
                            request.Post(reqForm)
                            request.Json()
                            request.Send().then(data => {
                                data.forEach(val => {
                                    el.appendChild(RequestList({
                                        user: val.fullName,
                                        fileName: 'Something',
                                        fileType: 'Symposium',
                                        date: val.date.split(' ')[0],
                                        campus: val.campus,
                                        id:val.docId,
                                        reqId:val.id
                                    }))
                                })
                            })
                        },


                    })
                ]
            }))
        }
        const GrantUser = () => {
            const Filter=()=>{
                return($({
                    tag:'div',
                    style:{
                        height:'5vh',
                        width:'98%',
                        border:'solid thin rgba(100,100,100,0.5)',
                        margin:'auto'
                    }
                }))
            }
            const containBody=()=>{

                const allowedList=({fileType,fileName,userList,fileUrl,fileId})=>{
                    let mainListBody
                    let useHold
                    let stateUse=false
                    const UserListBox=(label)=>{
                        return($({
                            tag:'div',
                            text:label,
                            style:{
                                fontSize:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontsize:'1vw'
                            }
                        }))
                    }
                    const vieFile=(url)=>{
                        let viewMain
                        return($({
                            tag:'div',
                            style:{
                                height:'100%',
                                width:'100%',
                                position:'absolute',
                                left:'0',
                                top:'0',
                                display:'flex',
                                justifyContent:'center',
                                backgroundColor:'#333'
                            },
                            elementHandler:(el)=>{
                                viewMain=el
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'80%',
                                        height:'97%',
                                        border:'solid thin #999',
                                        display:'flex',
                                        justifyContent:'center',
                                        margin:'auto',
                                        position:'relative',
                                        padding:'.5rem',
                                        borderRadius:'.5vw',
                                        backgroundColor:'#222'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            att:{
                                                className:'fa-solid fa-circle-xmark'
                                            },
                                            style:{
                                                position:'absolute',
                                                left:'-4vw',
                                                fontSize:'2vw',
                                                color:'deepskyblue',
                                                cursor:'pointer'
                                            },
                                            event:{
                                                type:'click',
                                                method:()=>{
                                                    viewMain.remove()
                                                }
                                            }
                                        }),
                                        $({
                                            tag:'object',
                                            style:{
                                                margin:'auto',
                                                width:'100%',
                                                height:'100%',
                                            },
                                            att:{
                                                type:'application/pdf',
                                                data:'/'+url
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
                            height:'fit-content',
                            width:'95%',
                            margin:'1vh auto auto',
                            border:'solid thin #444',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize:'1vw',
                            padding:'.2rem'
                        },
                        elementHandler:(el)=>{
                            mainListBody=el
                        },
                        att:{
                            className:'reqListPan'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    marginLeft:'0',
                                    marginRight:'auto',
                                    fontFamily:'box-shadow: black 0.3vw 0.3vw 2vh 0.1vh inset'
                                },
                                text:fileType
                            }),
                            $({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    display:'flex'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            marginLeft:'0',
                                            marginRight:'auto',
                                            fontFamily:'box-shadow: black 0.3vw 0.3vw 2vh 0.1vh inset',
                                            width:'80%',
                                            textOverflow:'ellipsis',
                                            overflow:'hidden',
                                            whiteSpace:'nowrap'
                                        },
                                        text:fileName
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            marginLeft:'0',
                                            marginRight:'auto',
                                            fontFamily:'box-shadow: black 0.3vw 0.3vw 2vh 0.1vh inset',
                                            width:'20%',
                                            display:'flex',
                                            justifyContent:'center'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                att:{
                                                    className:'fa-solid fa-square-caret-down alListBot'
                                                },
                                                style:{
                                                    fontSize:'1.1vw',
                                                    width:'fit-content',
                                                    margin:'auto'
                                                },
                                                event:{
                                                    type:'click',
                                                    method:()=>{
                                                        stateUse=!stateUse
                                                        if(stateUse){
                                                            userList.forEach(val=>{
                                                                useHold.appendChild(UserListBox(val))
                                                            })
                                                        }else {
                                                            useHold.innerHTML=''
                                                        }
                                                    }
                                                }
                                            }),

                                            $({
                                                tag:'div',
                                                att:{
                                                    className:'fa-solid fa-folder-open alListBot'
                                                },
                                                style:{
                                                    fontSize:'1.1vw',
                                                    width:'fit-content',
                                                    margin:'auto'
                                                },
                                                event:{
                                                    type:'click',
                                                    method:()=>{
                                                        document.body.appendChild(vieFile(fileUrl))
                                                    }
                                                }
                                            }),
                                            $({
                                                tag:'div',
                                                att:{
                                                    className:'fa-solid fa-trash-can alListBot'
                                                },
                                                style:{
                                                    fontSize:'1.1vw',
                                                    width:'fit-content',
                                                    margin:'auto'
                                                },
                                                event:{
                                                    type:'click',
                                                    method:()=>{
                                                        if(confirm("This operation cannot be undone. Would you like to proceed? ")){
                                                            const req= new Request('/requestDocs')
                                                            req.Post([
                                                                {name:'deleteFileAccess',value:'0'},
                                                                {name:'docId',value:fileId},
                                                            ])
                                                            req.Json()
                                                            req.Send().then(data=>{
                                                                if(data.status){
                                                                    mainListBody.remove()
                                                                }else {
                                                                    alert(data.message)
                                                                }

                                                            })
                                                        }

                                                    }
                                                }
                                            }),
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag:'div',
                                style:{
                                    width:'97%',
                                    height:'fit-content',
                                    backgroundColor:'rgba(0,0,0,0.5)',
                                    margin:'1vh .5vh auto',
                                    paddingLeft:'.5vw'
                                },
                                elementHandler:(el)=>{
                                    useHold=el
                                }
                            })
                        ]
                    }))
                }

                return($({
                    tag:'div',
                    style:{
                        height:'86%',
                        width:'98%',
                        backgroundColor:'rgba(0,0,0,0.1)',
                        margin:'1vh auto auto',
                        boxShadow:' black 0.3vw 0.3vw 2vh 0.1vh inset',
                        overflowY: 'auto'
                    },
                    elementHandler:(el)=>{
                        const req= new Request('/requestDocs')
                        req.Post([
                            {name:'reqAllowedList',value:'true'}
                        ])
                       req.Json()
                        /*
                        $document->reqId=$val['id'];
            $document->event=$val['event'];
            $document->title=$val['title'];
            $document->file=$val['file'];
            $document->docId=$val['docId'];
                         */
                        req.Send().then(data=>{
                            data.docs.forEach(val=>{
                                el.appendChild(allowedList({
                                    fileType:val.event,
                                    fileName:val.title,
                                    userList:val.allowedUser,
                                    fileUrl:val.file,
                                    fileId:val.docId
                                }))
                            })
                        })
                    },
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    width: '50%',
                    height: '100%',
                    border: 'solid thin rgba(100,100,100,0.5)',
                    backgroundColor: '#333'
                },
                child: [
                    Label("Shared Documents"),
                    Filter(),
                    containBody()
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '70%',
                height: '90%',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
            },

            child: [
                Close(),
                requestPanel(),
                GrantUser()
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
            position: 'absolute',
            left: '0',
            top: '0',
            display: 'flex',
            justifyContent: 'center'
        },
        elementHandler: (el) => {
            main = el
        },
        child: [
            Holder()
        ]
    }))
}
 import {$, ConfirmationAlert, Request, Waiting} from '../../lib/lib.js'
import {Logout} from "./Logout.js";
import {Chat, ChatBoxDisplay} from "./chat.js";
 import {Update} from "./update.js";



export const Header = () => {

    let mainHeader,chatContainer,listContainer
    localStorage.setItem("Chat",JSON.stringify([]))
    // sessionStorage.setItem('convoId',data.data.convoID)
    //         sessionStorage.setItem('sessionId',data.data.sessionId)


    document.body.appendChild($({
        tag:'div',
        style:{
            position:'absolute',
            bottom:'0',
            right:'1vw',
            left:'auto',
            height:'fit-content',
            width:'fit-content',
            color:'yellow',
            display:'flex',
            justifyContent:'center',
            zIndex:'10'
        },


        child:[

            $({
                tag:'div',
                style:{
                    height:'fit-content',
                    margin:'auto'
                },
                elementHandler:(el)=>{
                    chatContainer=el
                    if(sessionStorage.getItem('convoDetails')!==null){
                        const det=JSON.parse(sessionStorage.getItem('convoDetails'))
                        el.appendChild(ChatBoxDisplay({
                            convoID:det.convoID,
                            sessionID:det.sessionId,
                            user:det.name,
                            office:det.office,
                        }))
                    }
                }
            }),
            $({
                tag:'div',
                style:{

                    height:'fit-content',
                    margin:'auto',
                },
                elementHandler:(el)=>{
                    listContainer=el
                    if(sessionStorage.getItem('chatBoxList')!==null){
                        el.appendChild(Chat({
                            chatContainer:chatContainer
                        }))
                    }
                }
            }),
        ],

    }))


    document.head.append($({
        tag: 'link',
        att: {
            rel: 'stylesheet',

            href: '/client/style/header.css'
        }
    }))
    const getUserName=async (el)=>{
        const form=new FormData()
        form.append('getUserName','true')
        await fetch('/sessionCheck',{
            method:'POST',
            body:form
        }).then(res=>res.json())
            .then(data=>{
                el.innerText=data.username || 'UNKNOWN'
            })
    }




    const ToolBox=()=>{

        //<i class="fa-solid fa-message"></i>
        let toolState=false,holder,pan

        const iconHolder=()=>{
            const ToolIcon=({iconClass,event,toolTip})=>{
                return($({
                    tag:'div',
                    att:{
                        className:iconClass+' iconClass'
                    },
                    event:{
                        type: 'click',
                        method:event
                    },
                    style:{
                        position:'relative'
                    },
                    elementHandler:(el)=>{
                        let tip
                        el.addEventListener('mouseenter',function (){
                            this.style.color='deepskyblue'
                            this.appendChild($({
                                tag:'div',
                                text:toolTip,
                                style:{
                                    position:'absolute',
                                    top: '3vh',
                                    right: '-4',
                                    fontSize:'1vw',
                                    backgroundColor: '#555',
                                    fontFamily: 'monospace',
                                    padding: '.5rem',
                                    color:'#ddd',
                                    borderRadius:'.5vw',
                                    whiteSpace:'nowrap',
                                    border:'solid thin deepskyblue',
                                    boxShadow:'-.5vw .5vh .5vw black',
                                    zIndex:'99999'
                                },
                                elementHandler:(e)=>{
                                    tip=e
                                }
                            }))
                        })
                        el.addEventListener('mouseleave',function (){
                            this.style.color='#bbb'
                            tip.remove()
                        })
                    }
                }))
            }
            const getme=(tool)=> {
                holder=tool
                let chatbox,mmainScan

                const root= window.location.href
                const qrCodeScanner=()=>{


                    let html5QrcodeScanner
                    setTimeout(()=>{
                        html5QrcodeScanner= new Html5QrcodeScanner(
                            mmainScan.id, { fps: 10, qrbox: 250 });
                        html5QrcodeScanner.render(onScanSuccess, onScanError);
                    },100)

                    function onScanSuccess(qrCodeMessage) {

                       const docId=JSON.parse(qrCodeMessage).fileId
                        const req= new Request('/scanDocs')
                        req.Post([
                            {
                                name:'qrchecker',
                                value:'1'
                            },
                            {
                                name:'docId',
                                value:docId
                            }
                        ])
                        req.Json()
                        req.Send().then(data=>{
                            
                            let sc
                            document.body.appendChild($({
                                tag:'div',
                                style:{
                                    position:'absolute',
                                    width:'100%',
                                    height:'100%',
                                    left:'0',
                                    top:'0',
                                    display:'flex',
                                    backgroundColor:'grey',
                                    zIndex:'99999'
                                },
                                elementHandler:(el)=>{
                                    sc=el
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            height:'90%',
                                            width:'80%',
                                            margin:'auto',
                                            position:'relative'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                att:{
                                                    className:'fa-solid fa-circle-xmark'
                                                },
                                                style:{
                                                    fontSize:'2vw',
                                                    position:'absolute',
                                                    left:'-5vw',
                                                    top:'0',
                                                    width:'fit-content',
                                                    height:'fit-content',
                                                    cursor:'pointer'
                                                },
                                                event:{
                                                    type:'click',
                                                    method:()=>{
                                                        window.location.assign(root)
                                                    }
                                                }
                                            }),
                                            $({
                                                tag:'iframe',
                                                att:{
                                                    src:data.replace('..','')
                                                },
                                                style:{
                                                    width:'100%',
                                                    height:'100%'
                                                }
                                            }),

                                        ]
                                    })
                                ]
                            }))

                        })
                        html5QrcodeScanner.clear()
                    }

                    function onScanError(errorMessage) {
                        //handle scan error
                    }


                    return($({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            left:'0',
                            top:'0',
                            position:'absolute',
                            display:'flex',
                            justifyContent:'center',
                            backgroundColor:'black'
                        },
                        child:[

                            $({
                                tag:'div',
                                style:{
                                    width:'50vw',
                                    margin:'auto'
                                },
                                att:{
                                    id:'row'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        att:{
                                            className:'col'
                                        },
                                        style:{
                                            width:'100%',
                                            height:'50vh',
                                            backgroundColor:'ghostwhite',

                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                att:{
                                                    id:'reader'
                                                },
                                                elementHandler: (el)=>{
                                                    mmainScan=el
                                                },
                                                style:{
                                                    width:'100%',
                                                    height:'100%',
                                                    color:'#bbb'
                                                }

                                            })
                                        ]

                                    }),


                                ]

                            })
                        ],

                    }))
                }

                const suggestion=()=>{
                    let me, inputValue='';

                    const button=({text,methodEvent})=>{
                        return($({
                            tag:'div',
                            att:{
                                className:'recomBot'
                            },
                            event:{
                                type:'click',
                                method:methodEvent
                            },
                            child:[
                                $({
                                    tag:'div',
                                    text:text,
                                    style:{
                                        margin:'auto'
                                    }
                                })
                            ]
                        }))
                    }

                    const textBox=$({
                        tag:'div',
                        style:{
                            width:'fit-content',
                            height:'fit-content',
                            backgroundColor:'#555',
                            margin:'auto',
                            display:'auto',
                            justifyContent:'center',
                            padding:'.5rem',
                            border:'solid thin #bbb',
                            boxShadow: '-.5vw 1vh .5vw black'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'fit-content',
                                    height:'fit-content',
                                    margin:'auto',
                                    textAlign: 'center'
                                },
                                child:[
                                    $({
                                        tag:'textarea',
                                        style:{
                                            width:'50vw',
                                            height:'40vh',
                                            border:'none',
                                            backgroundColor:'rgba(0,0,0,0.3)',
                                            resize:'none',
                                            outline:'none',
                                            padding:'.5rem',
                                            color:'#bbb',
                                            fontSize:'1.2vw',
                                            fontFamily:'monospace'
                                        },
                                        att:{
                                            placeholder:'Insert text here..!'
                                        },
                                        event:{
                                            type:'input',
                                            method:(ev)=>{
                                                inputValue=ev.target.value
                                            }
                                        }
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            height:'5vh',
                                            width:'51.1vw',
                                            display:'flex',
                                            justifyContent:'center'
                                        },
                                        child:[
                                            button({
                                                text:'Cancel',
                                                methodEvent:()=>{
                                                    me.remove()
                                                }
                                            }),
                                            button({
                                                text:'Submit',
                                                methodEvent:async ()=>{
                                                    if(inputValue!==''){
                                                        if(confirm("Click ok to confirm")){
                                                            me.remove()
                                                            let loading = Waiting()
                                                            document.body.appendChild(loading)
                                                            const remove = () => {
                                                                loading.remove()
                                                            }
                                                            const form= new FormData()
                                                            form.append('recommendContent',inputValue)
                                                            form.append('recommend','true')
                                                            await fetch('/recommendation',{
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
                                                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                            window.location.reload()
                                                                        }))
                                                                    } else {
                                                                        alert(dat.message)
                                                                    }
                                                                })
                                                        }
                                                    }else {
                                                        alert("Empty data..!")
                                                    }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                        ]
                    })

                    return($({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            position:'absolute',
                            zIndex: '5',
                            top:'0',
                            left: '0',
                            backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',
                            display:'flex',
                            justifyContent:'center',

                        },
                        elementHandler:(el)=>{
                            me=el
                        },
                        child:[
                            textBox
                        ]
                    }))
                }
                tool.appendChild(ToolIcon({
                    iconClass:"fa-solid fa-bell",
                    event:()=>{
                     //   document.body.appendChild(Update())
                    },
                    toolTip:'Update'
                }))
                tool.appendChild(ToolIcon({
                    iconClass:"fa-solid fa-qrcode",
                    event:()=>{

                        document.body.appendChild(qrCodeScanner())
                    },
                    toolTip:'Scanner'
                }))
                tool.appendChild(ToolIcon({
                    iconClass:"fa-solid fa-message",
                    toolTip:'Chat',
                    event:()=>{

                        if(sessionStorage.getItem('chatBoxList')===null){
                            sessionStorage.setItem('chatBoxList','true')
                            listContainer.appendChild(Chat({chatContainer:chatContainer}))

                        }else {
                            sessionStorage.removeItem('chatBoxList')
                            sessionStorage.removeItem('convoDetails')
                            listContainer.innerHTML=''
                            chatContainer.innerHTML=''

                        }

                    }
                }))
                tool.appendChild(ToolIcon({
                    iconClass: "fa-solid fa-lightbulb",
                    toolTip:'Suggestion/Recommendation',
                    event:()=>{
                        document.body.appendChild(suggestion())
                    }
                }))
            }
            //<i class="fa-solid fa-clipboard-list"></i>

            return($({
                tag:'div',
                style:{
                    height:'100%',
                    marginLeft:'1vw',
                    display:'flex',
                    justifyContent:'center',
                    paddingLeft:'1vw',
                    borderRadius:'.5vw 0 0 .5vw',
                    width:'fit-content',
                    backgroundColor:'rgba(0,0,0,0.4)',
                    position:'relative'
                },

                elementHandler:getme
            }))
        }

        const openTool=(el)=>{
            pan=el
            pan.appendChild(iconHolder())
        }
        return( $({
            tag:'div',
            style:{
                width:'fit-content',
                margin:'auto',
                cursor:'pointer',
                fontSize:'1.5vw',
                color:'deepskyblue',
                display:'flex',
                justifyContent:'center',
                height:'100%',
                textAlign:'center',
                position:'absolute',
                right:'1vw'
            },
            child:[
              /*
                $({
                    tag:'div',
                    att:{
                        className:'fa-solid fa-screwdriver-wrench'
                    },
                    style:{
                        margin:'auto',
                    },
                    event:{
                        type:'click',
                        method:()=>{
                            toolState=!toolState
                            if(toolState){

                            }else {
                                holder.remove()
                            }

                        }
                    }
                })
               */
            ],
           elementHandler:openTool
        }))
    }

    return ($({
        tag: 'header',
        att: {
            className: 'headerDiv'
        },
        child: [
            $({
                tag: 'table',
                att: {
                    className: 'headerTable'
                },
                child: [
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                att: {
                                    className: 'headerTD'
                                },
                                style:{
                                    cursor: 'pointer'
                                },
                                text: 'RDE',
                                event:{
                                    type:'click',
                                    method:()=>{
                                        window.location.assign('/admin/addAccount')
                                    }
                                }
                            }),
                            $({
                                tag: 'td',
                                att: {
                                    className: 'headerTDdetails'
                                },
                                text: 'Research, Development, and Extension '
                            }),
                            $({
                                tag: 'td',
                                att: {
                                    className: 'headerTDLogout'
                                },
                                child: [
                                    $({
                                        tag:'div',
                                        style:{
                                            width: '100%',
                                            justifyContent: 'center',
                                            display:'flex',
                                            height:'100%',
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                style:{
                                                    height: '100%',
                                                    width:'fit-content',
                                                    backgroundImage: 'yellow',
                                                    margin:'auto',
                                                    display:'flex',
                                                    justifyContent:'center',
                                                    paddingLeft:'1vw',
                                                    paddingRight: '1vw',
                                                    position: 'relative'
                                                },
                                                child:[
                                                    ToolBox()
                                                ],

                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    margin: 'auto',
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    border: 'solid thin rgba(200,200,200,0.6)',
                                                    borderRight:'none',
                                                    paddingLeft:'1vw',
                                                    borderRadius: '.5vw 0 0 1vw',
                                                    height:'100%',
                                                    backgroundImage:'linear-gradient(to right, black,rgba(0,0,0,0.5),transparent)',
                                                    width:'100%'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'div',
                                                        style: {
                                                            margin: 'auto',
                                                            marginLeft: '0',
                                                            fontSize: '1.5vw',
                                                            display: 'flex',
                                                            color:'deepskyblue'
                                                        },
                                                        att: {
                                                            className: 'fa-solid fa-user'
                                                        },
                                                        child: [
                                                            $({
                                                                tag: 'div',
                                                                style: {
                                                                    border: 'solid thin #555',
                                                                    margin: 'auto',
                                                                    marginLeft: '.5vw',
                                                                    fontFamily: 'arial black, sans-serif',
                                                                    fontSize: '1vw',
                                                                    padding: '.2rem',
                                                                    borderRadius: '.5vw',
                                                                    color: '#bbb',
                                                                    textShadow:'0 0 .4vw black',
                                                                    paddingLeft: '.5vw',
                                                                    paddingRight:'.5vw',
                                                                    backgroundColor:'#555'
                                                                },

                                                                elementHandler:getUserName
                                                            })
                                                        ]
                                                    }),
                                                    Logout()
                                                ]
                                            })
                                        ]
                                    }),

                                ]
                            })
                        ]
                    })
                ]
            })
        ],
        elementHandler:(el)=>{
            mainHeader=el
        }
    }))
}

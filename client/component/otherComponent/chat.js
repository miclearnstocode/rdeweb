import {$} from '../../lib/lib.js'

const Convo = ({convoId, messages}) => {
    return {convoId, messages}
}
const Messages = ({type, chatID, message, date}) => {
    return {type, chatID, message, date}
}

export const ChatBoxDisplay = ({close, convoID, user, office}) => {
    const imageViewer=(srcFile)=>{
        let viewIm
        return($({
            tag:'div',
            style:{
                position:'absolute',
                height:'100%',
                width:'100%',
                backgroundColor:'rgba(20,20,20,0.8)',
                justifyContent:'center',
                display:'flex',
                top:'0',
                left:'0',
                zIndex: '99',
            },
            elementHandler:(el)=>{
                viewIm=el
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        height:'90%',
                        border:'solid thin #999',
                        margin:'auto',
                        backgroundColor:'#333',
                        borderRadius:'1vw',
                        overflow:'hidden',
                        position:'relative',
                        padding:'1rem'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                fontSize:'2vw',
                                position:'absolute',
                                left:'0',
                                borderRadius:'50vw',
                                overflow:'hidden',
                                top:'0',
                                cursor:'pointer',
                                backgroundColor:'#333',
                                padding:'.7rem'
                            },
                            att:{
                                className:'fa-solid fa-circle-xmark closeImage'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    viewIm.remove()
                                }
                            }
                        }),
                        $({
                            tag:'img',
                            att:{
                                src:srcFile
                            },
                            style:{
                                height:'100%'
                            }
                        })
                    ]
                })
            ]
        }))
    }
    const chatMessageSender = ({content, id,fileData}) => {

        const image=(src)=>{

            return($({
                tag:'div',
                style:{
                    width:'fit-content',
                    height:'fit-content',
                    display:'flex',
                    userSelect:'none',
                    cursor:'pointer',
                },
                event:{
                    type:'click',
                    method:()=>{
                        document.body.appendChild(imageViewer(src))
                    }
                },
                child:[
                    $({
                        tag:'div',
                        style:{

                        },
                        att:{
                            className:''
                        }
                    }),
                    $({
                        tag:'img',
                        style:{
                            width:'15.5vw',
                        },
                        att:{
                            src:src
                        }
                    })
                ]
            }))
        }
        const file=(src,type,fileName)=>{

            const fileViewer=(fileUrl)=>{
                let me
                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                        position:'absolute',
                        display:'flex',
                        justifyContent:'center',
                        top:'0',
                        left:'0',
                        zIndex:'99',
                        backgroundColor:'rgba(20,20,20,0.8)'
                    },
                    elementHandler:(el)=>{
                        me=el
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'70vw',
                                height:'90vh',
                                padding:'1rem',
                                border:'solid thin grey',
                                margin:'auto',
                                backgroundColor:'#333',
                                position:'relative'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-circle-xmark closeImage'
                                    },
                                    style:{
                                        position:'absolute',
                                        left:'0',
                                        top:'0',
                                        padding:'.5rem',
                                        backgroundColor:'#333',
                                        width:'fit-content',
                                        height:'fit-content',
                                        borderRadius:'50vw',
                                        fontSize:'2vw',
                                        cursor:'pointer'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            me.remove()
                                        }
                                    }
                                }),
                                $({
                                    tag:'object',
                                    style:{
                                        width:'100%',
                                        height:'100%',
                                    },
                                    att:{
                                        data:fileUrl.replace('..',''),
                                        type:'application/pdf'
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }

            return($({
                tag:'div',
                att:{
                    className:(type==='application/pdf')? 'fa-solid fa-file-pdf':'fa-solid fa-file-lines',
                },
                style:{
                    fontSize:'2vw',
                    textAlign:'left',
                    width:'100%',
                    cursor:'pointer',
                    userSelect:'none',
                    borderTop:'solid thin rgba(200,200,200,0.3)',
                    paddingTop:'1vh',
                    paddingBottom:'1vh',
                    borderBottom:'solid thin rgba(200,200,200,0.3)',
                    display:'flex',
                    color:'#bbb'
                },
                event: {
                    type: 'click',
                    method: (event) => {

                       document.body.appendChild(fileViewer(src))
                    }
                },

                child:[
                    $({
                        tag:'div',
                        text:fileName,
                        style:{
                            fontSize:'1vw',
                            fontFamily:'arial,sans-serif',
                            fontWeight:'normal',
                            marginLeft:'2vw',
                            margin:'auto',
                            overflow:'hidden',
                            textOverflow:'ellipsis',
                            whiteSpace:'nowrap',
                            width:'80%'
                        }
                    })
                ]
            }))
        }

        const message = $({
            tag: 'div',
            style: {
                margin: 'auto',
                maxWidth: '60%',
                height: 'fit-content',
                paddingTop: '1vh',
                paddingBottom: '1vh',
                paddingLeft: '.5vw',
                paddingRight: '1vw',
                marginRight: '1vw',
                marginLeft: 'auto',
                backgroundColor: 'rgba(100,100,100,0.5)',
                borderRadius: '.5vw',
                color: '#ddd',
                userSelect: 'text',
                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                fontSize: '1vw'
            },

            child:[
                $({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        height:'fit-content',
                    },
                    elementHandler:(el)=>{

                        fileData.forEach(val=> {
                            if (val.fileType === 'image/jpeg' || val.fileType === 'image/png') {
                                el.appendChild(image('/'+val.fileUrl))
                            }
                        })
                    }
                }),
                $({
                    tag:'div',
                    style:{
                        width:'100%',
                        maxWidth:'15.5vw',
                        height:'fit-content',

                    },
                    elementHandler:(el)=>{
                        fileData.forEach(val=>{
                            if(val.fileType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'||val.fileType==='application/pdf'){
                                el.appendChild(file(val.fileUrl,val.fileType,val.fileName))
                            }
                        })

                    }
                }),
                $({
                    tag:'div',
                    style:{
                        overflowWrap:'break-word',
                        margin:'1vh auto',
                        fontSize:'1.1vw',
                    },
                    text:content
                })
            ]
        })
        const profInde = $({
            tag: 'div',
            style: {
                margin: 'auto',
                width: '2vw',
                height: '3.5vh',
                marginRight: '.5vw',
                marginLeft: '.5vw',
                color: 'deepskyblue',
                borderRadius: '45vw',
                border: 'solid thin deepskyblue',
                padding: '.2rem',
                overflowY: 'hidden'
            },
            child: [
                $({
                    tag: 'img',
                    att: {
                        src: '/client/images/cap.png'
                    },
                    style: {
                        width: '90%'
                    }
                })
            ]

        })
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                paddingTop: '.5vh',
                paddingBottom: '.5vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            },
            att: {
                id: id
            },
            child: [
                message,
                //   profInde
            ]

        }))
    }
    const chatMessageOwen = ({content, id,fileData}) => {
        const image=(src)=>{

            return($({
                tag:'div',
                style:{
                    width:'fit-content',
                    height:'fit-content',
                    display:'flex',
                    userSelect:'none',
                    cursor:'pointer',
                },
                event:{
                    type:'click',
                    method:()=>{
                        document.body.appendChild(imageViewer(src))
                    }
                },
                child:[
                    $({
                        tag:'div',
                        style:{

                        },
                        att:{
                            className:''
                        }
                    }),
                    $({
                        tag:'img',
                        style:{
                            width:'15.5vw',
                        },
                        att:{
                            src:src
                        }
                    })
                ]
            }))
        }
        const file=(src,type,fileName)=>{
            const fileViewer=(fileUrl)=>{
                let me
                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                        position:'absolute',
                        display:'flex',
                        justifyContent:'center',
                        top:'0',
                        left:'0',
                        zIndex:'99',
                        backgroundColor:'rgba(20,20,20,0.8)'
                    },
                    elementHandler:(el)=>{
                        me=el
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'70vw',
                                height:'90vh',
                                padding:'1rem',
                                border:'solid thin grey',
                                margin:'auto',
                                backgroundColor:'#333',
                                position:'relative'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-circle-xmark closeImage'
                                    },
                                    style:{
                                        position:'absolute',
                                        left:'0',
                                        top:'0',
                                        padding:'.5rem',
                                        backgroundColor:'#333',
                                        width:'fit-content',
                                        height:'fit-content',
                                        borderRadius:'50vw',
                                        fontSize:'2vw',
                                        cursor:'pointer'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            me.remove()
                                        }
                                    }
                                }),
                                $({
                                    tag:'object',
                                    style:{
                                        width:'100%',
                                        height:'100%',
                                    },
                                    att:{
                                        data:fileUrl.replace('..',''),
                                        type:'application/pdf'
                                    }
                                })
                            ]
                        })
                    ]
                }))
            }
            return($({
                tag:'a',
                att:{
                    className:(type==='application/pdf')? 'fa-solid fa-file-pdf':'fa-solid fa-file-lines',
                },
                style:{
                    fontSize:'2vw',
                    textAlign:'left',
                    width:'100%',
                    cursor:'pointer',
                    userSelect:'none',
                    borderTop:'solid thin rgba(200,200,200,0.3)',
                    paddingTop:'1vh',
                    paddingBottom:'1vh',
                    borderBottom:'solid thin rgba(200,200,200,0.3)',
                    display:'flex',
                    color:'#bbb'
                },
                event: {
                    type: 'click',
                    method: (event) => {

                        fetch(src.replace('..',''),{
                            method:'GET',
                            credentials:'include',
                        }).then(res=>res.blob())
                            .then(data=>{
                                let url=window.URL.createObjectURL(data)
                                event.target.download=fileName
                                event.target.href=url

                            })
                        document.body.appendChild(fileViewer(src))
                    }
                },

                child:[
                    $({
                        tag:'div',
                        text:fileName,
                        style:{
                            fontSize:'1vw',
                            fontFamily:'arial,sans-serif',
                            fontWeight:'normal',
                            marginLeft:'2vw',
                            margin:'auto',
                            overflow:'hidden',
                            textOverflow:'ellipsis',
                            whiteSpace:'nowrap',
                            width:'80%'
                        }
                    })
                ]
            }))
        }
        const message = $({
            tag: 'div',
            style: {
                margin: 'auto',
                maxWidth: '60%',
                height: 'fit-content',
                paddingTop: '1vh',
                paddingBottom: '1vh',
                paddingRight: '.5vw',
                paddingLeft: '1vw',
                marginLeft: '0',
                marginRight: 'auto',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '.5vw',
                color: '#bbb',
                userSelect: 'text',
                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                fontSize: '1vw'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        height:'fit-content',
                    },
                    elementHandler:(el)=>{

                        fileData.forEach(val=> {
                            if (val.fileType === 'image/jpeg' || val.fileType === 'image/png') {
                                el.appendChild(image('/'+val.fileUrl))
                            }
                        })
                    }
                }),
                $({
                    tag:'div',
                    style:{
                        width:'100%',
                        maxWidth:'15.5vw',
                        height:'fit-content',

                    },
                    elementHandler:(el)=>{
                        fileData.forEach(val=>{
                            if(val.fileType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'||val.fileType==='application/pdf'){
                                el.appendChild(file(val.fileUrl,val.fileType,val.fileName))
                            }
                        })

                    }
                }),
                $({
                    tag:'div',
                    style:{
                        inlineSize:'15.5vw',
                        overflowWrap:'break-word',
                        margin:'1vh  auto',
                        fontSize:'1.1vw',
                    },
                    text:content
                })
            ]
        })
        const profInde = $({
            tag: 'div',

            style: {
                margin: 'auto',
                fontSize: '1vw',
                marginRight: '.5vw',
                marginLeft: '.5vw',
                color: '#ddd',
                border: 'solid thin grey',
                padding: '.3rem',
                borderRadius: '45vw',
                width: '2vw',
                height: '3.5vh',
            },
            child: [
                $({
                    tag: 'img',
                    att: {
                        src: '/client/images/cap.png'
                    },
                    style: {
                        width: '90%'
                    }
                })
            ]

        })
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                paddingTop: '.5vh',
                paddingBottom: '.5vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            },
            att: {
                id: id
            },
            child: [
                profInde,
                message,
            ]

        }))
    }
    let inputChat, imgHolder, addFile,inputFileDiv,fileHolderEl,fileData=[]
    const imageHolder = (src,fileName,type,index) => {
        let bod
        return ($({
            tag: 'span',
            elementHandler: (el) => {
                bod = el
            },
            child: [
                $({
                    tag:'div',
                    style:{
                        overflow: 'hidden',
                        height: '7vh',
                        width: '4vw',
                        backgroundColor: '#555',
                        border: 'solid thin deepskyblue',
                        borderRadius: '.5vw',
                        position: 'relative',
                        marginRight: '.5vw',
                    },
                    child:[
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                width: 'fit-content',
                                height: 'fit-content',
                                padding: '2px',
                                right: '0',
                                top: '0',
                                fontSize: '1.2vw',
                                color: 'deepskyblue',
                                cursor: 'pointer'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    fileData.splice(index,1)
                                    bod.remove()
                                }
                            },
                            att: {
                                className: 'fa-solid fa-circle-xmark'
                            }
                        }),
                        $({
                            tag: 'img',
                            style: {
                                width: '100%',
                                objectFit: 'fill'
                            },
                            att: {
                                src: src
                            }
                        })
                    ]
                })
            ]
        }))
    }
    const fileHolder=(src,fileName,type,index)=>{
        let fl
        return($({
            tag:'div',
            style:{
                height:'4vh',
                width:'90%',
                marginTop:'.5vh',
                marginBottom:'.5vh',
                display:'flex',
            },
            elementHandler:(el)=>{
                fl=el
            },
            child:[
                $({
                    tag:'div',
                    att:{
                        className:(type==='application/pdf')? 'fa-solid fa-file-pdf':'fa-solid fa-file-lines '
                    },
                    style:{
                        fontSize:'2vw',
                        margin:'auto',
                        marginLeft:'.5vw',
                        marginRight:'.auto',
                        width:'fit-content',
                        color:'#999'
                    }
                }),
                $({
                    tag:'div',
                    style:{
                        fontFamily:'arial,sans-serif',
                        fontSize:'1vw',
                        color:'#999',
                        margin:'auto',
                        marginLeft:'.5vw',
                        marginRight:'.auto',
                        width:'100%'
                    },
                    text:fileName
                }),
                $({
                    tag:'div',
                    att:{
                        className:'fa-solid fa-xmark'
                    },
                    style:{
                        fontSize:'1.5vw',
                        color:'#999'
                    },
                    event:{
                        type:'click',
                        method:()=>{
                            fileData.splice(index,1)
                            fl.remove()
                        }
                    }
                })
            ]
        }))
    }

    let bodyMain
    return ($({
        tag: 'div',
        att: {
            id: convoID
        },
        style: {
            //       width:'fit-content',
            width: '26vw',
            height: '71.5vh',
            backgroundColor: '#222',
            borderRadius: '.5vw .5vw 0 0',
            boxShadow: '-.5vw -.5vh 1vw rgba(0,0,0,0.3)',
            zIndex: '2',
            paddingLeft: '.5vw',
            paddingRight: '.5vw',
            border: 'solid thin #999',
        },
        elementHandler: (el) => {
            bodyMain = el

        },
        child: [

            $({
                tag: 'div',
                style: {
                    height: '6vh',
                    width: '100%',
                    borderBottom: 'solid thin rgba(100,100,100,0.5)',
                    display: 'flex',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '100%',
                            display:'flex'
                        },
                        child: [
                            $({
                                tag:'div',
                                style:{
                                    borderRadius:'100%$',
                                    height:'fit-content',
                                    margin:'auto',
                                    width:'fit-content',
                                    marginLeft:'.5vw',
                                    marginRight:'.5v',
                                    fontSize:'2.5vw',
                                    color:'#999'
                                },
                                att:{
                                    className:'fa-solid fa-circle-user'
                                }
                            }),
                            $({
                                tag:'div',
                                style:{
                                    marginLeft:'1vw',
                                    width:'100%'
                                },
                                child:[
                                    $({
                                        tag: 'div',
                                        style: {
                                            borderBottom: 'solid thin rgba(200,200,200,0.4)',
                                            height: '50%',
                                            color:'#bbb',
                                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            fontSize:'1vw',
                                            fontWeight:'bold'
                                        },
                                        text: user
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            height: '50%',
                                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            fontSize:'1vw',
                                            fontWeight:'bold',
                                            color:'#bbb',
                                        },
                                        text: office
                                    })
                                ]
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '5vw'
                        },
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-xmark'
                        },
                        style: {
                            width: 'fir-content',
                            display: 'flex',
                            justifyContent: 'space-around',
                            margin: 'auto',
                            color: '#999',
                            fontSize: '1.5vw'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                sessionStorage.removeItem('convoDetails')
                                bodyMain.remove()
                            }
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                style: {
                    height: '53vh',
                    width: '100%',
                    overflowY: 'auto',
                },
                elementHandler:  (el) => {
                    const getDocs = async () => {
                        const form = new FormData()
                        form.append('chatMessages', 'true')
                        form.append('convoId', convoID)
                        let response = await fetch("/chat", {
                            method: 'POST',
                            body: form
                        });

                        if (response.status === 502) {
                            await getDocs();
                        } else if (response.status !== 200) {
                            alert(response.statusText)
                            // Reconnect in one second
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            await getDocs();
                        } else {
                            let data = await response.json();
                            data.reverse()
                            for(let x=0;x<data.length;x++){
                                const chatChild=el.childNodes
                                let chatState=true;
                                for(let a=0;a<chatChild.length;a++){
                                    if(chatChild[a].id===data[x].chatID){
                                        chatState=false;
                                        break;
                                    }
                                }
                                if(chatState){

                                    if(data[x].type==='sent'){
                                        el.appendChild(chatMessageSender({
                                            content:data[x].message,
                                            id:data[x].chatID+'',
                                            fileData:data[x].files
                                        }))
                                    }else {
                                        el.appendChild(chatMessageOwen({
                                            content:data[x].message,
                                            id:data[x].chatID+'',
                                            fileData:data[x].files
                                        }))
                                    }
                                    el.scrollTop=el.scrollHeight
                                }

                            }
                            setTimeout(async () => {
                                await getDocs();
                            }, 1000)
                        }
                        let mes=JSON.parse(sessionStorage.getItem(convoID))
                    }
                    getDocs()
                }
            }),
            $({
                tag: 'div',
                style: {
                    height: '7.5vh',
                    width: '100%',
                    position: 'relative',
                    disable: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#222',
                },
                child: [
                    $({
                       tag:'div',
                       style:{
                           width:'4vw',
                           height:'4vh',
                           margin:'auto',
                           position:'absolute',
                           left:'0',
                           top: '2vh',
                           display:'flex',
                           justifyContent:'center'
                       },
                        child:[
                            $({
                               tag:'input',
                               style:{
                                   display:'none',
                               },
                                att:{
                                    type:'file',
                                    accept:'.pdf,.jpeg,.png',
                                    multiple:true,
                                },
                                elementHandler:(el)=>{
                                   inputFileDiv=el
                                },
                                event:{
                                   type:'input',
                                    method:(ev)=>{
                                        fileData=[];
                                        fileHolderEl.innerHTML=''
                                       let file=ev.target.files;
                                        for(let x=0;x<file.length;x++){
                                            fileData.push({
                                                name:file[x].name,
                                                type:file[x].type,
                                                file:file[x]
                                            })

                                        }
                                        fileData.forEach((val,index)=>{
                                            if(val.type==='image/jpeg'||val.type==='image/png'){
                                                const read= new FileReader()
                                                read.onload=function (event){
                                                    imgHolder.appendChild(imageHolder(event.target.result,'','',''))
                                                }
                                                read.readAsDataURL(val.file)
                                            }
                                            if(val.type==='application/pdf'||val.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
                                                fileHolderEl.appendChild(fileHolder('',val.name,val.type,index))
                                            }
                                        })
                                        inputFileDiv.value=''
                                    }
                                }
                            }),
                            $({
                                tag:'div',
                                style:{
                                    color:'deepskyblue',
                                    fontSize:'2vw',
                                    margin:'auto',
                                    cursor:'pointer',
                                    overflow:'hidden'
                                },
                                att:{
                                    className:'fa-solid fa-file-circle-plus'
                                },
                                elementHandler:(el)=>{
                                    addFile=el
                                },
                                event:{
                                    type:'click',
                                    method:()=>{
                                        inputFileDiv.click()
                                    }
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            height: 'fit-content',
                            width: 'fit-content',
                            maxWidth:'89%',
                            position: 'absolute',
                            bottom: '.5vh',
                            margin: 'auto',
                            paddingTop: '1vh',
                            paddingBottom: '.5vh',
                            borderRadius: '1vw',
                            backgroundColor:'#333',
                            right: '0'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '90%',
                                    height: 'fit-content',
                                    paddingLeft: '.5vw',
                                    paddingRight: '.5vw',
                                    margin: 'auto',
                                    display: 'flex',
                                    overflow: 'auto',
                                    minHeight: '0',
                                },
                                elementHandler: (el) => {
                                    imgHolder = el
                                },

                            }),
                            $({
                                tag:'div',
                                style:{
                                    width: '90%',
                                    height: 'fit-content',
                                    paddingLeft: '.5vw',
                                    paddingRight: '.5vw',
                                    margin: 'auto',
                                    minHeight: '0',
                                },
                                elementHandler:(el)=>{
                                    fileHolderEl=el
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    height: 'fit-content',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    margin: 'auto',

                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            width: '80%',
                                            height: 'fit-content',
                                            paddingTop: '.5vh',
                                            paddingBottom: '.5vh',

                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    margin: 'auto',
                                                    minHeight: '2vh',
                                                    maxHeight: '15vh',
                                                    overflowY: 'auto',
                                                    border: 'none',
                                                    outline: 'none',
                                                    paddingLeft: '1vw',
                                                    paddingRight: '1vw',
                                                    width: '16vw',
                                                    color: '#bbb',
                                                    fontFamily: 'arial,sans-serif',
                                                    fontSize: '1vw',
                                                    position: 'relative',
                                                },
                                                att: {
                                                    contentEditable: true,
                                                },
                                                elementHandler: (el) => {
                                                    inputChat = el
                                                    el.addEventListener('paste',(event)=>{
                                                        let n=(new Date().getTime() / 1000)+''
                                                        let items = event.clipboardData.items;
                                                        let blob = items[items.length - 1].getAsFile();
                                                        fileData.push({
                                                            name:`image.jpeg`,
                                                            type:'image/jpeg',
                                                            file:blob
                                                        })
                                                    })
                                                    setTimeout(()=>{
                                                        el.focus()
                                                    },0)
                                                    el.addEventListener('keypress',async (eve)=>{
                                                        if(!eve.shiftKey){
                                                            if(eve.keyCode===13){
                                                                if(inputChat.innerText.replace(/\s/g,'')===''){
                                                                    inputChat.innerText=''
                                                                }
                                                                if((eve.keyCode===13&&inputChat.innerText.replace(/\s/g,'')!=='')||fileData.length>0){
                                                                    eve.returnValue=false
                                                                    const form = new FormData()
                                                                    form.append('sendChat', 'true');
                                                                    form.append('chatMessage', inputChat.innerText);
                                                                    form.append('convoID', convoID);
                                                                    fileData.forEach(val=>{
                                                                        form.append('fileDocs[]',val.file)
                                                                    })
                                                                    await fetch('/chat', {
                                                                        method: 'POST',
                                                                        body: form
                                                                    }).then(res => res.json())
                                                                        .then(data => {
                                                                            if (!data.status) {
                                                                                alert(data.message)
                                                                            } else {
                                                                                fileData=[]
                                                                                inputChat.innerText = ''
                                                                                fileHolderEl.innerHTML=''
                                                                                imgHolder.innerHTML=''
                                                                                if(el.innerText===''){
                                                                                    addFile.className='fa-solid fa-file-circle-plus';
                                                                                    el.style.width='16vw'
                                                                                    addFile.style.marginLeft=''
                                                                                    addFile.style.margin='auto'
                                                                                }else {
                                                                                    el.style.width='18vw'
                                                                                    addFile.className='fa-solid fa-circle-plus'
                                                                                    addFile.style.marginLeft='0'
                                                                                }
                                                                            }
                                                                        })
                                                                }
                                                            }
                                                        }

                                                    })
                                                },
                                                event: {
                                                    type: 'input',
                                                    method: (el) => {
                                                        if(el.target.innerText===''){
                                                            addFile.className='fa-solid fa-file-circle-plus';
                                                            el.target.style.width='16vw';
                                                            addFile.style.marginLeft='';
                                                            addFile.style.margin='auto';
                                                        }else {
                                                            el.target.style.width='18vw';
                                                            addFile.className='fa-solid fa-circle-plus';
                                                            addFile.style.marginLeft='0';
                                                        }
                                                        const child = el.target.getElementsByTagName('img');
                                                        for (let x = 0; x < child.length; x++) {
                                                            if (child[x].tagName === 'IMG') {
                                                                imgHolder.appendChild(imageHolder(child[x].src))
                                                                child[x].remove();
                                                            }
                                                        }
                                                    }
                                                },
                                            }),
                                            $({
                                                tag: 'div',
                                                att: {
                                                    className: 'fa-solid fa-face-grin'
                                                },
                                                style: {
                                                    fontSize: '2vw',
                                                    color: 'deepskyblue',
                                                    margin: 'auto',
                                                    width: 'fit-content',
                                                    head: 'fit-content',
                                                    marginTop: 'auto',
                                                    marginBottom: '0',
                                                    cursor: 'pointer',
                                                },
                                                event:{
                                                    type:'click',
                                                    method:()=>{

                                                    }
                                                }

                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-paper-plane'
                                        },
                                        style: {
                                            fontSize: '2vw',
                                            margin: 'auto',
                                            width: 'fit-content',
                                            height: 'fit-content',
                                            color: 'deepskyblue',
                                            marginTop: 'auto',
                                            marginBottom: '1vh',
                                            cursor: 'pointer'
                                        },
                                        event: {
                                            type: 'click',
                                            method: async () => {

                                                if(inputChat.innerText!==''||fileData.length>0){
                                                    const form = new FormData()
                                                    form.append('sendChat', 'true')
                                                    form.append('chatMessage', inputChat.innerText)
                                                    form.append('convoID', convoID)
                                                    fileData.forEach(val=>{
                                                        form.append('fileDocs[]',val.file)
                                                    })
                                                    await fetch('/chat', {
                                                        method: 'POST',
                                                        body: form
                                                    }).then(res => res.json())
                                                        .then(data => {
                                                            if (!data.status) {
                                                                alert(data.message)
                                                            } else {
                                                                fileData=[]
                                                                inputChat.innerText = ''
                                                                fileHolderEl.innerHTML=''
                                                                imgHolder.innerHTML=''
                                                            }
                                                        })
                                                }
                                            }
                                        }
                                    })
                                ]
                            }),
                        ]
                    })
                ]
            })
        ]
    }))
}

export const Chat = ({get, chatContainer}) => {
    let chatBody,chatList
    const chatHeads = ({fullName, office, id}) => {

        const profile = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '4vw',
                    margin: 'auto',
                    marginLeft: '0',
                    height: '7vh',
                    borderRadius: '40vw',
                    border: 'solid thin rgba(100,100,100,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#111'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-user'
                        },
                        style: {
                            margin: 'auto',
                            fontSize: '1.2vw'
                        }
                    })
                ]
            }))
        }
        const profDetail = () => {
            return ($({
                tag: 'div',
                style: {
                    height: '6vh',
                    width: '90%',
                    margin: 'auto'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            borderBottom: 'solid thin rgba(100,100,100,0.3)',
                            width: '100%',
                            height: '50%',
                            fontFamily: 'monospace',
                            fontSize: '1vw',
                            textIndent: '1vw',
                            textAlign: 'left',
                            color: '#bbb'
                        },
                        text: fullName
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '50%',
                            fontFamily: 'monospace',
                            fontSize: '1vw',
                            textIndent: '1vw',
                            textAlign: 'left',
                            color: '#999'
                        },
                        text: office
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '98%',
                height: '8vh',
                cursor: 'pointer',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '1vh',
                paddingBottom: '1vh'
            },
            att: {
                className: 'chatHeads'
            },
            child: [
                profile(),
                profDetail()
            ],
            event: {
                type: 'click',
                method: async () => {
                    const form = new FormData()
                    form.append('chatIdRequest', 'true')
                    form.append('receiverID', id)
                    await fetch('/chat', {
                        method: 'POST',
                        body: form
                    }).then(res => res.json())
                        .then(data => {
                            const chldContainer = chatContainer.childNodes;
                            let chatState = true
                            for (let x = 0; x < chldContainer.length; x++) {
                                if (chldContainer[x].id === data.data.convoId) {
                                    chatState = false
                                    break;
                                }

                            }
                            if (chatState) {
                                chatContainer.innerHTML = ''
                                sessionStorage.removeItem('convoDetails')
                                sessionStorage.setItem('convoDetails', JSON.stringify({
                                    convoID: data.data.convoId,
                                    name: fullName,
                                    office: office
                                }))
                                chatContainer.appendChild(ChatBoxDisplay({
                                    convoID: data.data.convoId,
                                    user: fullName,
                                    office: office,
                                }))

                            }

                        })
                }
            },
        }))
    }
    return ($({
        tag: 'div',
        style: {
            width: '30vw',
            height: '70vh',
            padding: '.5rem',
            backgroundColor: '#222',
            borderRadius: '.5vw .5vw 0 0',
            cursor: 'auto',
            border:'solid thin #777',
        },

        elementHandler: (el)=>{
            chatBody=el
        },
        child: [
            $({
                tag: 'div',
                style: {
                    height: '5vh',
                    width: '100%',
                    borderBottom: 'solid thin rgba(100,100,100,0.5)',
                    margin: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    position:'relative'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            fontFamily: 'arial black,sans-serif',
                            fontSize: '1.3vw',
                            width: 'fit-content',
                            color: 'deepskyblue',
                            height: 'fit-content',
                            margin: 'auto',
                            marginLeft: '0',
                            marginRight: 'auto'
                        },
                        text: 'Chat'
                    }),
                    $({
                        tag:'div',
                        att:{
                            className:'fa-solid fa-xmark'
                        },
                        style:{
                            fontSize:'1.3vw',
                            margin:'auto',
                            marginRight:'.5vw',
                            cursor:'pointer'
                        },
                        event:{
                            type:'click',
                            method:()=>{
                                sessionStorage.removeItem('chatBoxList')
                                chatBody.remove()
                            }
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                style: {
                    height: '6vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            height: '5vh',
                            width: '100%',
                            margin: 'auto',
                        },
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'search',
                                    placeholder: 'Search',
                                    id: 'search-input',
                                    name: 'searchInput'
                                },
                                style: {
                                    border: 'none',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    height: '100%',
                                    width: '100%',
                                    outline: 'none',
                                    borderRadius: '1vw',
                                    paddingLeft: '1vw',
                                    paddingRight: '1vw',
                                    color: '#bbb',
                                    fontFamily: 'monospace',
                                    fontSize: '1vw'
                                },
                                event:{
                                    type:'input',
                                    method:(eve)=>{
                                        const list=chatList.childNodes
                                        for(const val of list){
                                            if(val.innerText.toUpperCase().includes(eve.target.value.toUpperCase())){
                                                val.style.display='flex';
                                            }else {
                                                val.style.display='none';
                                            }
                                            if(eve.target.value===''){
                                                val.style.display='flex';
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
                tag: 'div',
                style: {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    paddingTop: '1vh'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '98%',
                            height: '8vh',
                            cursor: 'pointer',
                            margin: 'auto',
                            display: 'flex',
                            justifyContent: 'center',
                            paddingTop: '1vh',
                            paddingBottom: '1vh'
                        },
                        att: {
                            className: 'chatHeads'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '4vw',
                                    margin: 'auto',
                                    marginLeft: '0',
                                    height: '7vh',
                                    borderRadius: '40vw',
                                    border: 'solid thin rgba(100,100,100,0.5)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    backgroundColor: '#111'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-users'
                                        },
                                        style: {
                                            margin: 'auto',
                                            fontSize: '2vw'
                                        }
                                    }),
                                ]
                            }),
                            $({
                                tag: 'div',
                                text: 'CAPSU User',
                                style: {
                                    margin: 'auto',
                                    fontFamily: 'arial black,sans-serif',
                                    fontSize: '2vw',
                                    width: '100%',
                                    borderBottom: 'solid thin deepskyblue',
                                    textIndent: '1.5vw',
                                    color: 'deepskyblue'

                                }
                            })
                        ]
                    })
                ]

            }),
            $({
                tag: 'div',
                style: {
                    height: '48vh',
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    overflowY: 'auto'
                },
                elementHandler: async (el) => {
                    chatList=el
                    const form = new FormData()
                    form.append('systemaccount', 'true')
                    await fetch('/chat', {
                        method: 'POST',
                        body: form
                    }).then(res => res.json())
                        .then(data => {
                            data.forEach(val => {
                                el.appendChild(chatHeads({
                                    fullName: val.Name,
                                    office: val.office,
                                    id: val.id
                                }))
                            })
                        })
                }
            })
        ]
    }))
}



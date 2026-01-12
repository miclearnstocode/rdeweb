import {$} from '../../../lib/lib.js'

const SearchBar=()=>{

    return($({
        tag:'table',
        att:{
            className: 'searchDiv'
        },
        child:[
            $({
                tag:'tr',
                child:[
                    $({
                        tag:'td',
                        style:{
                            width:'fit-content'
                        },
                        att:{
                            className:'searchIconInbox'
                        },
                        child:[
                            $({
                                tag:'span',
                                att:{
                                    className:'fa fa-search'
                                }
                            })
                        ]
                    }),
                    $({
                        tag:'td',
                        style:{
                            width:'fit-content'
                        },
                        child:[
                            $({
                                tag:'input',
                                att:{
                                    className:'searchInboxInput',
                                    type:'search'
                                }
                            }),
                        ]
                    })
                ]
            })
        ]
    }))
}

const Td=({className,text,element})=>{
    const getTd=(td)=>{
        if(className){
            td.className=className
        }
        if(text){
            td.appendChild(document.createTextNode(text))
        }
        if(element){
            td.appendChild(element)
        }
    }
    return($({
        tag:'td',
        elementHandler:getTd,
    }))

}

const InboxHead=()=>{

    const tdTabs=[]
    tdTabs.push(Td({
        className:'allTabs tabsDate',
        text:'Date',
    }))
    tdTabs.push(Td({
        className:'allTabs tabsSender',
        text:'Sender',
    }))
    tdTabs.push(Td({
        className:'allTabs tabsTitle',
        text:'Title',
    }))
    tdTabs.push(Td({
        className:'allTabs tabsDelete',
        element:$({
            tag:'span',
            att:{

            }
        })
    }))
    const getTr=(tr)=>{
        tdTabs.forEach(val=>{
            tr.appendChild(val)
        })
    }

    return($({
        tag:'table',
        att:{
            className:'inboxHead'
        },
        child:[
            $({
                tag:'tr',
                elementHandler:getTr,
            })
        ]
    }))
}
//.tabsDate{
//     width: 10%;
// }
// .tabsSender{
//     width:30% ;
// }
// .tabsTitle{
//     width:50%
// }
const MessageTab=()=>{

    const inboxViewer=({file})=>{
        let main

        const getMainPan=(el)=>{
            main=el
        }
        const Close=()=>{
            return($({
                tag:'div',
                event:{
                    type:'click',
                    method:()=>{
                        main.remove()
                    }
                },
                att:{
                    className:'closeInboxView'
                },
                child:[
                    $({
                        tag:'span',
                        text:'Close'

                    }),
                    $({
                        tag:'span',
                        att:{
                            className:'fa fa-times'
                        }
                    })
                ]
            }))
        }

        const frame=({url})=>{
            return($({
                tag:'object',
                att:{
                    className:'inboxFrameViewer',
                    data:url.replace('..',''),
                    type:'application/pdf'
                }
            }))
        }

        return($({
            tag:'div',
            att:{
                className:'inboxView'
            },
            elementHandler:getMainPan,
            child:[
                Close(),
                frame({url:file})
            ]
        }))
    }

    const List=({date,sender,title,file})=>{
        const TD=(data,width)=>{
            return $({
                tag:'td',
                att:{
                    className:'allTabs'
                },
                style:{
                    width:width
                },
                text:data
            })
        }
        return($({
            tag:'table',
            att:{
                className:'listMessage'
            },

            child:[
                $({
                    tag:'tr',
                    child:[
                        TD(date,"10%"),
                        TD(sender,"30%"),
                        TD(title,"50%"),
                        TD("","")
                    ]
                })
            ],
            event:{
                type: 'click',
                method:()=>{
                    document.body.appendChild(inboxViewer({
                        file:file
                    }))
                }
            }
        }))
    }

    const getmesCon=async (messageCont)=>{
        const form= new FormData();
        form.append('view','true')
        await fetch("/inboxFile",{
            method:'POST',
            body:form
        }).then(res=>res.json())
            .then(data=>{

                data.forEach(val=>{
                    messageCont.appendChild(List({
                        date:val.date,
                        sender:val.sender,
                        title:val.description,
                        file:val.url
                    }))
                })

            })
    }


    return($({
        tag:'div',
        att:{
            className:'messageContainer'
        },
        elementHandler:getmesCon
    }))
}

export const InboxPanel=()=>{
    return($({
        tag:'div',
        att:{
            className:'inboxPanel'
        },
        child:[
            SearchBar(),
            InboxHead(),
            MessageTab()
        ]

    }))
}

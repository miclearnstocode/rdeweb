import {$, Request, SearchMethod} from "../../../lib/lib.js";


export const Override=()=>{

    let docsBody,eventSelection

    const SearchFilter=()=>{
        return($({
            tag:'div',
            style:{
                width:'fit-content',
                height:'fit-content',
                margin:'auto',
                border:'solid thin',
                borderRadius:'.5rem',
                color:'#bbb',
                backgroundColor:'#333'
            },
            child:[
                $({
                    tag:'span',
                    att:{
                        className:'fa-solid fa-magnifying-glass',
                    },
                    style:{
                        marginLeft:'1vw',
                        fontSize: '1vw'
                    }
                }),
                $({
                    tag:'input',
                    style:{
                        backgroundColor: 'transparent',
                        height:'4vh',
                        paddingLeft:'1vw',
                        paddingRight:'1vw',
                        color:'#bbb',
                        width:'25vw',
                        border:'none',
                        outline:'none',
                        fontSize: '1vw'
                    },
                    event:{
                        type:'input',
                        method:(ev)=>{
                            SearchMethod({
                                nodeList:docsBody.childNodes,
                                textArray:ev.target.value.toUpperCase().split(' '),
                                display:'block'
                            })
                        }
                    }
                })
            ]
        }))
    }
    const Docs=({title,author,id,campus,category})=>{

        const details=({label,data})=>{
            return($({
                tag:'div',
                child:[
                    $({
                        tag:'span',
                        text:label,
                        style:{
                            color:'deepskyblue',
                            fontWeight:'bold'
                        }
                    }),
                    $({
                        tag:'span',
                        text:data,
                        style:{
                            color:'#999',
                        }
                    }),
                ]
            }))
        }
        const EditButton=()=>{
            const EditPan=()=>{
                let catSel
                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                        backgroundColor:'rgba(0,0,0,0.9)',
                        position:'absolute',
                        zIndex:'99',
                        left:'0',
                        top:'0',
                        display: 'flex'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'40vw',
                                height: '40vh',
                                backgroundColor:'#555',
                                margin:'auto'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        margin:'5vh auto auto',
                                        textAlign:'center'
                                    },
                                    child:[
                                        $({
                                            tag:'span',
                                            text:'Current : ',
                                            style:{
                                                fontFamily:'Helvetica',
                                                fontSize:'1vw',
                                                color:'deepskyblue'
                                            }
                                        }),
                                        $({
                                            tag:'span',
                                            text:category,
                                            style:{
                                                fontFamily:'Helvetica',
                                                fontSize:'1vw',
                                                color:'#bbb'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        margin:'5vh auto auto',
                                        textAlign:'center'
                                    },
                                    child:[
                                        $({
                                            tag:'span',
                                            text:'Change To',
                                            style:{
                                                fontFamily:'Helvetica',
                                                fontSize:'1vw',
                                                color:'deepskyblue'
                                            }
                                        }),
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        margin:'3vh auto auto',
                                        height:'fit-content',
                                        width:'fit-content'
                                    },
                                    child:[
                                        $({
                                            tag:'select',
                                            style:{
                                                height:'4vh',
                                                width:'30vw',
                                                backgroundColor:'rgba(0,0,0,0.5)',
                                                color:'#bbb',
                                                borderRadius:'.5rem',
                                                fontSize:'1.1vw'
                                            },
                                            elementHandler:(el)=>{
                                                catSel=el
                                                const req= new Request('/requestcat')
                                                req.Post([
                                                    {
                                                        name:'requestCat'
                                                    }
                                                ])
                                                req.Json()
                                                req.Send()
                                                    .then(data=>{
                                                       data.forEach(val=>{
                                                           el.appendChild($({
                                                               tag: 'option',
                                                               text:val.name,
                                                               att:{
                                                                   id:val.id
                                                               },
                                                               style:{
                                                                   backgroundColor:'#444',
                                                                   fontSize:'1.2rem'
                                                               }
                                                           }))
                                                       })
                                                    })
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        width:'80%',
                                        height:'fit-content',
                                        margin:'2vh auto',
                                        display:'flex'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            style:{
                                                height:'fit-content',
                                                width:'fit-content',
                                                margin:'auto'
                                            },
                                            child:[
                                                $({
                                                    tag:'button',
                                                    text:'Save Changes',
                                                    style:{
                                                        fontSize:'1.2rem'
                                                    },
                                                    event:{
                                                        type:'click',
                                                        method:()=>{

                                                            const req= new Request('/requestcat')
                                                            req.Post([
                                                                {
                                                                    name:'changeCat',
                                                                    value:'1'
                                                                },
                                                                {
                                                                    name:'docId',
                                                                    value:id
                                                                },
                                                                {
                                                                    name:'newCategory',
                                                                    value:catSel.childNodes[catSel.selectedIndex].innerText
                                                                }
                                                            ])
                                                            req.Json()
                                                            req.Send().then(data=>{
                                                                if(data.status){
                                                                    window.location.reload();
                                                                }else{
                                                                    alert(data.message);
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            ]
                                        }),
                                        $({
                                            tag:'div',
                                            style:{
                                                height:'fit-content',
                                                width:'fit-content',
                                                margin:'auto'
                                            },
                                            child:[
                                                $({
                                                    tag:'button',
                                                    text:'Cancel',
                                                    style:{
                                                        fontSize:'1.2rem'
                                                    },
                                                    event: {
                                                        type:'click',
                                                        method:()=>{
                                                            window.location.reload()
                                                        }
                                                    }

                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]

                }))
            }
            return($({
                tag:'div',
                style:{
                    position:'absolute',
                    right:'.5rem',
                    top:'.5rem',
                    cursor: 'pointer',
                    color: 'deepskyblue'
                },
                text:'Edit Category',
                event:{
                    type: 'click',
                    method:()=>{
                        document.body.appendChild(EditPan())
                      /*

                       */
                    }
                }
            }))
        }

        return($({
            tag:'div',
            style:{
                width:'95%',
                margin:'1vh auto',
                fontFamily: 'Helvetica',
                border:'solid thin #888',
                padding:'.5rem',
                fontSize:'1vw',
                position:'relative',
                backgroundColor:'#444'
            },
            child:[
                details({
                    label:"Campus : ",
                    data:campus,
                }),
                details({
                    label:"Authos : ",
                    data:author,
                }),
                details({
                    label:"Category : ",
                    data:category,
                }),
                $({
                    tag:'div',
                    style:{
                        marginTop: '2vh'
                    }
                }),
                $({
                    tag:'i',
                    text:`" ${title} "`,
                    style:{
                        marginTop:'.5rem',
                        color:'#bbb'
                    }
                }),
                EditButton()
            ]
        }))
    }
    const Event=()=>{
        return($({
            tag:'div',
            style:{
                width:'fit-content',
                height:'fit-content',
                margin:'auto',
                border:'solid thin',
                borderRadius:'.5rem',
                color:'#bbb',
                backgroundColor:'#333'
            },
            child:[
                $({
                    tag:'span',
                    text:'Events Filter : ',
                    style:{
                        marginLeft:'1vw',
                        fontSize: '1vw',
                        fontFamily:'Helvetica'
                    }
                }),
                $({
                    tag:'select',
                    style:{
                        backgroundColor: 'transparent',
                        height:'4vh',
                        paddingLeft:'1vw',
                        paddingRight:'1vw',
                        color:'#bbb',
                        width:'25vw',
                        border:'none',
                        outline:'none',
                        fontSize: '1vw',
                        textAlign:'center',
                    },
                    elementHandler:async (el)=>{
                        eventSelection=el
                        el.appendChild(  $({
                            tag: 'option',
                            text: '-- Select Event type --',
                            att: {
                                disabled: true,
                                selected: true,
                                id:'0'
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
                                    },
                                    style:{
                                        backgroundColor:'#444'
                                    }
                                }))
                            })
                        })
                    },
                }),
                $({
                    tag:'button',
                    att:{
                        className: 'fa-solid fa-rotate'
                    },
                    style:{
                        marginLeft:'1vw',
                        marginRight:'1vw',
                        borderRadius:'30vw',
                        padding:'.2rem',
                        fontSize:'1rem',
                        cursor:'pointer',
                        color:'deepskyblue',
                        backgroundColor:'#444',
                        borderColor:'deepskyblue',
                    },
                    event:{
                        type:'click',
                        method:()=>{
                            docsBody.innerHTML=''

                            const req= new Request('/overridedocs')
                            req.Post([
                                {
                                    name:'docsAll',
                                    value:'1'
                                },
                                {
                                    name: 'eventName',
                                    value:eventSelection.childNodes[eventSelection.selectedIndex].innerText
                                }
                            ])
                            req.Json()
                            req.Send().then(data=>{
                                data.forEach(val=>{

                                    docsBody.appendChild(Docs({
                                        title:val.title,
                                        author:val.author,
                                        id:val.id,
                                        campus:val.campus,
                                        category:val.category
                                    }))
                                })
                            })
                        }
                    }
                })
            ]

        }))
    }

    return ($({
        tag:'div',
        style:{
            width:'100%',
            height: '100%'
        },
        child:[
            $({
                tag:'div',
                style:{
                    backgroundColor:'#555',
                    width:'100%',
                    display:'flex',
                   height:'7vh'
                },
                child:[
                    SearchFilter(),
                    Event()
                ]

            }),
            $({
                tag:'div',
                style:{
                    height:'92%',
                    width:'100%',
                    overflowY:'auto',
                    backgroundColor:'rgba(0,0,0,0.5)',
                    position:'relative',
                },
                elementHandler:(el)=>{
                    docsBody=el

                }
            })
        ]
    }))
}
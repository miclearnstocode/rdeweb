import {$,Request} from '../../../lib/lib.js'

export const Files=()=>{

    const docsViewer=({file,date,campus})=>{
        let docs
        const getDocs=(el)=>{
            docs=el
        }
        const exit=$({
            tag:'div',

            style:{
                margin:'auto',
                cursor: 'pointer',
                display:'flex',
                justifyContent:'center',
                color:'deepskyblue'
            },
            event:{
                type:'click',
                method:()=>{
                    docs.remove()
                }
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        fontSize:'2vw',
                    },
                    att:{
                        className:'fa-solid fa-right-from-bracket'
                    },
                }),
                $({
                    tag:'div',
                    style:{
                        fontFamily:'arial black,sans-serif',
                        fontSize:'1.3vw',
                        margin:'auto',
                        marginLeft:'.5vw'
                    },
                    text:'EXIT'
                })
            ]
        })

        return($({
            tag:'div',
            style:{
                position:'absolute',
                left:'0',
                top:'0',
                backgroundColor:'#555',
                height:'100%',
                width:'100%',
            },
            elementHandler:getDocs,
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'90%',
                        margin:'auto',
                        backgroundColor:'#333',
                    },
                    child:[
                        $({
                            tag:'object',
                            style:{
                                width:'100%',
                                height:'100%'
                            },
                            att:{
                                type:'application/pdf',
                                data:file.replace('..','')
                            }
                        }),
                        $({
                            tag:'div',
                            style:{
                                height:'10%',
                                width:'100%',
                                display:'flex',
                                justifyContent: 'center'
                            },
                            child:[
                                exit,
                            ]
                        })
                    ]
                })
            ]
        }))
    }
    let fileFrameBody

    const getFramFile=(el)=>{
        fileFrameBody=el
    }


    const Owned=()=>{


        const File=({title,date,campus,docId,file})=>{
            return($({
                tag:'span',
                att:{
                    className:'filesPdf'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            fontSize: '3vw',
                            width:'fit-content ',
                            textAlign:'center',
                            margin:'auto',
                            height:'fit-content',
                            marginBottom:'.5vh',
                            whiteSpace: 'nowrap',
                            color:'grey',
                            textShadow:'-.1vw .1vh .3vw black, -.1vw .1vh .3vw #444'
                        },
                        att:{
                            className:'fa-solid fa-file-pdf'
                        },

                    }),
                    $({
                        tag:'div',
                        style:{
                            borderBottom:'solid thin lightskyblue',
                            borderTop:'solid thin lightskyblue ',
                            color:'lightskyblue',
                            fontFamily:'monospace',
                            fontSize:'1vw'
                        },
                        text:`Date: ${date.split(' ')[0]}`,
                    }),
                    $({
                        tag:'div',
                        att:{
                            className:'contentFileText'
                        },
                        text:(title)? title:"No title attached"
                    })
                ],
                event:{
                    type:'click',
                    method:()=>{
                        fileFrameBody.appendChild(docsViewer({
                            file:file
                        }))
                    }
                }
            }))
        }
        /*
         date:val.date,
                              file:val.file,
                              campus:val.campus,
                              docId:val.docId,
                              title:val.title
         */
        const FileV2=({date,docType,docId,title})=>{

            const Date=$({
                tag:'div',
                text:date.split(' ')[0],
                style:{

                    width:'15%',
                    textIndent:'.5vw'
                }
            })
            const Title=$({
                tag:'div',
                text:title,
                style:{
                    width:'55%',
                    textOverflow:'ellipsis',
                    whiteSpace:'nowrap',
                    overflow:'hidden'
                }
            })
            const DocType=$({
                tag:'div',
                text:docType,
                style:{
                    width:'30%'
                }
            })

            return($({
                tag:'div',
                style:{
                    width:'98%',
                    margin:'1vh auto',
                    height:'fit-content',
                    paddingBottom:'1vh',
                    paddingTop:'1vh',
                    position:'relative',
                    display:'flex',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize:'1vw',
                },
                att:{
                    className:'comListClas'
                },
                child:[
                    Date,
                    DocType,
                    Title
                ],
                event:{
                    type:'click',
                    method:()=>{
                        const req= new Request('/communication')
                        req.Post([
                            {
                                name:'fileReq',
                                value:'1'
                            },
                            {
                                name:'docId',
                                value:docId
                            }
                        ])
                        req.Json()
                        req.Send().then(data=>{
                            fileFrameBody.appendChild(docsViewer({
                                file:data.file,

                            }))
                        })
                    }
                }
            }))
        }

        const headTab=()=>{

            return($({
                tag:'div',
                style:{
                    height:'5%',
                    width:'100%',
                    backgroundColor:'#444',
                    margin:'auto',
                    display: 'flex',
                },
                child:[
                    $({
                        tag:'div',
                        text:'Document',
                        style:{
                            margin:'auto',
                            fontFamily:'arial black, sans-serif',
                            color:'#bbb',
                            fontSize:'1.4vw'
                        }
                    })
                ]
            }))
        }
        const contentBody=()=>{

            let filter='commu',bodyPCon
            const getData=(value)=>{
                filter=value
            }

            const RequestTF=async ({typeFile})=>{
                const form= new FormData()
                form.append('allFile','true')
                form.append("typeFile",typeFile)
               return  await fetch('/approval',{
                    method:"POST",
                    body:form
                }).then(res=>res.json())
            }



            const headContent=()=>{

                const SearchBox=$({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        height:'fit-content',
                        border:'solid thin #999',
                        margin:'auto',
                        marginLeft:'1vw',
                        display:'flex',
                        backgroundColor:'#111',
                        borderRadius:'.5vw'

                    },
                    child:[

                        $({
                            tag:'input',
                            style:{
                                height:'4vh',
                                width:'20vw',
                                backgroundColor:'transparent',
                                border:'none',
                                outline:'none',
                                paddingRight:'1vw',
                                paddingLeft:'1vw',
                                borderRadius: '1vw',
                                color:'#bbb',
                                fontSize:'1.2vw'
                            },
                            att:{
                                placeholder:'Enter text here'
                            },
                            event:{
                                type:'input',
                                method:(ev)=>{
                                    const child=bodyPCon.childNodes
                                    for(let x=0;x<child.length;x++){
                                        if(child[x].innerText.toUpperCase().replace(' ','').includes(ev.target.value.toUpperCase().replace(' ',''))){
                                            child[x].style.display='block'
                                        }else {
                                            child[x].style.display='none'
                                        }
                                    }
                                }
                            }
                        })
                    ]
                })
                const ComboBox=()=>{

                    return($({
                        tag:'div',
                        style:{
                            width:'fit-content',
                            height:'fit-content',
                            border:'solid thin #999',
                            margin:'auto',
                            marginLeft:'1vw',
                            display:'flex',
                            backgroundColor:'#111',
                            borderRadius:'.5vw'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    margin:'auto',
                                    fontSize:'1.5vw',
                                    marginLeft:'1vw',
                                    marginRight:'1vw',
                                    color:'#999',
                                },
                                att:{
                                    className:'fa-solid fa-file-circle-exclamation'
                                }
                            }),

                            $({
                                tag:'select',
                                style:{
                                    height:'4vh',
                                    width:'15vw',
                                    margin:'auto',
                                    border:'none',
                                    outline:'none',
                                    backgroundColor:'transparent',
                                    color:'#bbb',
                                    fontSize:'1vw'
                                },
                                event:{
                                    type:'change',
                                    method:(event)=>{
                                        getData(event.target.id)
                                    }
                                },
                                elementHandler:(el)=>{
                                    el.appendChild($({
                                        tag:'option',
                                        text:"All Document",
                                        style:{
                                            backgroundColor:'#222'
                                        }
                                    }))
                                    const req=new Request('/getDocType')
                                    req.Post([
                                        {
                                            name:'getDoctype',
                                            value:'1'
                                        },
                                    ])
                                    req.Json()
                                    req.Send().then(data=>{
                                        data.forEach(val=>{
                                            el.appendChild($({
                                                tag:'option',
                                                text:val.name,
                                                style:{
                                                    backgroundColor:'#222'
                                                }
                                            }))
                                        })
                                    })
                                }

                                /*
                                \child:[
                                    $({
                                        tag:'option',
                                        text:'Communication',
                                        style:{
                                            backgroundColor:'grey',
                                            color:'black'
                                        },
                                        att:{
                                            id:'commu'
                                        }
                                    }),
                                    $({
                                        tag:'option',
                                        text:'In-house Review',
                                        style:{
                                            backgroundColor:'grey',
                                            color:'black'
                                        },
                                        att:{
                                            id:'inHouse'
                                        }
                                    }),
                                    $({
                                        tag:'option',
                                        text:'Symposium',
                                        style:{
                                            backgroundColor:'grey',
                                            color:'black'
                                        },
                                        att:{
                                            id:'sympo'
                                        }
                                    }),
                                    $({
                                        tag:'option',
                                        text:'All Documents',
                                        style:{
                                            backgroundColor:'grey',
                                            color:'black'
                                        },
                                        att:{
                                            id:'allDocs'
                                        }
                                    }),
                                ]
                                 */
                            }),
                            $({
                                tag:'div',
                                att:{
                                    className:'fa-solid fa-rotate'
                                },
                                style:{
                                    margin:'auto',
                                    fontSize:'1.5vw',
                                    marginBottom:'auto',
                                    marginLeft:'1vw',
                                    marginRight:'1vw',
                                    color:'lightskyblue',
                                    cursor: 'pointer'
                                }
                            }),
                        ]
                    }))
                }

                return($({
                    tag:'div',
                    style:{
                        height:'10%',
                        width:'100%',
                        display:'flex',
                    },
                    child:[
                        SearchBox,
                        ComboBox(),
                    ]
                }))
            }
            const Personal=()=>{

                const getFileHolder= (el)=>{
                    bodyPCon=el
                    /*
                          form.append('allFile','true')
                form.append("typeFile",typeFile)
               return  await fetch('/approval',{
                     */

                    const req=new Request('/communication')
                    req.Post([
                        {
                            name:'perUserCom',
                            value:'1'
                        }
                    ])
                    req.Json()
                    req.Send().then(data=>{
                        data.forEach(val=>{

                            el.insertBefore(FileV2({
                                date:val.date,
                                campus:val.campus,
                                docId:val.docid,
                                title:val.title,
                             //   docType:val.doc_type
                                docType:"Sample document Type",
                            }),el.childNodes[0])
                            /*
                            el.insertBefore(File({
                                date:val.date,
                                file:val.file,
                                campus:val.campus,
                                docId:val.docId,
                                title:val.title
                            }),el.childNodes[0])
                             */
                        })
                    })
                }

                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'90%',
                        backgroundColor:'rgba(100,100,100,0.3)',
                        boxShadow: 'inset .3vw .3vw 2vh .1vh black',
                        overflowY:'auto',
                    },
                    elementHandler:getFileHolder,

                }))
            }
            return($({
                tag:'div',
                style:{
                    height:'95%',
                    width:'100%',
                    margin:'auto',
                    backgroundColor:'rgba(0,0,0,0.2)',
                },
                child:[

                    headContent(),
                    Personal()
                ]
            }))
        }

        return($({
            tag:'div',
            style:{
                width:'59%',
                height: '98%',
                margin: 'auto',
                border:'solid thin #444',
            },
            child:[
                headTab(),
                contentBody()
            ]

        }))
    }
    const OtherFile=()=>{

        const docTypeGroup=({label,docNum})=>{
            return($({
                tag:'div'
            }))
        }

        return($({
            tag:'div',
            style:{
                width:'39%',
                height: '98%',
                border:'solid thin rgba(200,200,200,0.2)',
                margin:'auto',
                backgroundColor: 'rgba(0,0,0,0.2)'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1vw',
                        fontWeight:'bold',
                        color:'#999',
                        margin:'1vh auto',
                        textAlign:'center'
                    },
                    text:'All Communication Files'
                })
            ]

        }))
    }

    return($({
        tag:'div',
        style:{
            height:'100%',
            width: '100%',
            display:'flex',
            justifyContent:'center',
            backgroundColor:'#333',
            position: 'relative'
        },
        elementHandler:getFramFile,
        externalStyle:'/client/component/userComponent/userComponentStyle/Files.css',
        child:[
            Owned(),
            OtherFile()
        ]
    }))
}

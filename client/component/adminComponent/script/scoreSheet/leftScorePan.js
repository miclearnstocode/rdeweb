import {$, Base, Current, Path, Request} from '../../../../lib/lib.js'


export const LeftScore=(eventId,scId)=>{

    let listBodyDom,Total=0,totalP=0
    const dataList=[]
    const Enqueue=(val)=>{
        dataList.push(val)
    }
    const Update=()=>{
        listBodyDom.innerHTML=''
        Total=0
        dataList.forEach(val=>{
            listBodyDom.appendChild(Criteria({
                name:val.name,
                description:val.description,
                percentage:val.percentage
            }))
            Total+=(val.percentage*1)
        })
        totalP.innerText=Total+' %'
    }
    const Criteria=({name,description,percentage})=>{
        return($({
            tag:'div',
            style:{
                height:'fit-content',
                width:'98%',
                border:'solid thin #555',
                borderRadius:'.3rem',
                textAlign:'left',
                margin:'1vh auto',
                backgroundColor:'#111',
                display:'flex',
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'90%'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                height:'fit-contetn',
                                width:'100%',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'deepskyblue',
                                textIndent:'1vw',
                                borderBottom:'solid thin #555'
                            },
                            text:name
                        }),
                        $({
                            tag:'div',
                            style:{
                                height:'fit-contetn',
                                width:'100%',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'#999',
                                textIndent:'1vw'
                            },
                            text:`"${description}"`
                        }),
                        $({
                            tag:'div',
                            style:{
                                height:'fit-contetn',
                                width:'100%',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'#999',
                                textIndent:'1vw',
                                borderTop:'solid thin #555'
                            },
                            child:[
                                $({
                                    tag:'span',
                                    text:'Percentage : ',
                                    style:{
                                        color:'deepskyblue'
                                    }
                                }),
                                $({
                                    tag:'span',
                                    text:percentage,
                                    style:{
                                        color:'#bbb'
                                    }
                                })
                            ]
                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        width:'10%',
                        display:'flex'
                    },
                    child:[
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-trash-can'
                            },
                            style:{
                                margin:'auto',
                                fontSize:'1.5vw',
                                color:'deepskyblue',
                                cursor:'pointer'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    dataList.forEach((val,i)=>{
                                        if (name===val.name){
                                            dataList.splice(i,1)
                                            Update()
                                        }
                                    })

                                }
                            }
                        })
                    ]
                })
            ]
        }))
    }





    let mainPanel
    const AddPop=()=>{
        let popMain
        const data={
            name:'',
            description:'',
            percentage:'',
        }
        const Submit=(event)=>{
            event.preventDefault()
            let state= true

            for (let val of Object.keys(data)) {
                if(data[val]===''){
                    state=false
                    break
                }
            }
            if(state){
                if(Total<=100){
                    Enqueue(data)
                    Update()
                    popMain.remove()
                }else {
                    alert("You reach the maximum percentage.")
                }

            }
        }

        const Close=()=>{

            return($({
                tag:'div',
                style:{
                    width:'98%',
                    height:'fit-content',
                    textAlign:'right',
                    marginBottom:'1vh'
                },
                child:[
                    $({
                        tag:'button',
                        text:'Close',
                        att:{
                            className:'botCrtv2'
                        },
                        style:{
                            cursor:'pointer',
                            border:'none',
                            height:'5vh',
                            paddingLeft:'1vw',
                            paddingRight:'1vw'
                        },
                        event:{
                            type:'click',
                            method:(eve)=>{
                                popMain.remove()
                            }
                        }
                    })
                ]
            }))
        }
        const Criteria=()=>{
            return($({
                tag:'div',
                style:{
                    width:'98%',
                    height: 'fit-content',
                    margin:'auto',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontWeight:'bold',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Criteria",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'input',
                        att:{
                            placeholder:"Enter text here...",
                            required:true
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            fontSize: '1vw',
                            padding:'1%'
                        },
                        event:{
                            type:'change',
                            method:(eve)=>{
                                data.name=eve.target.value
                            }
                        },
                        elementHandler:(el)=>{
                            el.addEventListener('keypress',(event)=>{
                                if(event.keyCode===13){
                                    event.preventDefault()
                                }
                            })
                        }
                    })
                ]
            }))
        }
        const Discrep=()=>{
            return($({
                tag:'div',
                style:{
                    width:'98%',
                    margin:'auto',
                    height: 'fit-content',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Description",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontWeight:'bold',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'textarea',
                        att:{
                            placeholder:"Enter text here...",
                            required:true
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            height:'15vh',
                            fontSize: '1vw',
                            padding:'1%'

                        },
                        event:{
                            type:'change',
                            method:(eve)=>{

                                data.description=eve.target.value
                            }
                        }
                    })
                ]
            }))
        }
        const Percentage=()=>{
            return($({
                tag:'div',
                style:{
                    width:'50%',
                    height: 'fit-content',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Percentage",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontWeight:'bold',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'input',
                        att:{
                            placeholder:"Enter numeric value",
                            type:'number',
                            min:0,
                            max:100,
                            required:true
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            fontSize: '1vw',
                            padding:'1%',
                            textAlign: 'center'
                        },
                        event:{
                            type:'change',
                            method:(eve)=>{

                                if((Total*1)+(eve.target.value*1)<=100){
                                    data.percentage=eve.target.value
                                }else {
                                    alert("Exceeding the maximum percentage")
                                    eve.target.value=0

                                }

                            }
                        },
                        elementHandler:(el)=>{
                            el.addEventListener('keypress',(event)=>{
                                if(event.keyCode===13){
                                    event.preventDefault()
                                }
                            })
                        }

                    })
                ]
            }))
        }
        const Add=()=>{
            return($({
                tag:'div',
                style:{
                    height:'fit-content',
                    width:'98%',
                    margin:'4vh auto',
                    textAlign:'center',
                },
                child:[
                    $({
                        tag:'input',
                        text:'Add Criteria',
                        att:{
                            className:'botCrtv2',
                            type:'submit'
                        },
                        style:{
                            height:'5vh',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize:'1.3vw',
                            border:'none',
                            borderRadius:'.4rem'
                        },

                    })
                ]
            }))
        }

        return($({
            tag:'div',
            style:{
                position:'absolute',
                left:'0',
                top:'0',
                width:'100%',
                height:'100%',
                backgroundColor:'#222',
                zIndex: '9999'
            },
            elementHandler:(el)=>{
                popMain=el
            },
            child:[
                $({
                    tag:'form',
                    child:[
                        $({
                            tag:'div',
                            style:{
                                height:'5vh',
                                width:'100%'
                            }
                        }),
                        Close(),
                        Criteria(),
                        Discrep(),
                        Percentage(),
                        Add()
                    ],
                    event:{
                        type:'submit',
                        method:Submit
                    }
                })
            ]
        }))
    }

    const Panel=(name,catId)=>{

        const AddNew=()=>{
            return($({
                tag:'div',
                style:{
                    height:'fit-content',
                    width:'95%',
                    marginTop:'.5vw',
                    textAlign:'left'
                },
                child:[
                    $({
                        tag:'button',
                        att:{
                            className:'fa-solid fa-square-plus'
                        },
                        style:{
                            backgroundColor:'deepskyblue',
                            borderRadius:'.3rem',
                            border:'none',
                            outline:'none',
                            height:'4vh',
                            width:'15vw',
                            marginLeft:'1vw',
                            fontSize:'1.3vw',
                            cursor:'pointer'
                        },
                        child:[
                            $({
                                tag:'span',
                                text:'Add new Criteria',
                                style:{
                                    fontSize:'1vw',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    marginLeft:'1vw'
                                }
                            })
                        ],
                        event:{
                            type:'click',
                            method:()=>{
                                if(Total*1<100){
                                    mainPanel.appendChild(AddPop())
                                }else {
                                    alert("Cannot add new Criteria")
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
                width:'100%',
                position: 'absolute',
                height:'100%',
                top:'0',
                left:'0',
                backgroundColor:'#222',
                zIndex:'999',
                textAlign:'center',
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'fit-content',
                        textAlign:'right',
                        marginTop:'1vh',
                        display:'flex',
                        borderBottom:'solid thin #333'
                    },
                    child:[
                        $({
                            tag:'div',
                            text:name,
                            style:{
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                marginLeft:'1vw',
                                color:'#bbb'
                            }
                        }),
                        $({
                            tag:'a',
                            text:'back to category',
                            att:{
                                href: '/admin/events/scoreBoard/'+eventId
                            },
                            style:{
                                marginRight:'1vw',
                                marginLeft:'auto',
                                textDecoration:'none',
                                color:'deepskyblue',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw'
                            }
                        })
                    ]
                }),
                AddNew(),
                $({
                    tag:'div',
                    style:{
                        width:'95%',
                        height:'5vh',
                        backgroundColor:'#333',
                        margin:'auto',
                        marginTop:'2vh',
                        display:'flex'
                    },
                    child:[
                        $({
                            tag:'div',
                            text:'List of criteria',
                            style:{
                                margin:'auto',
                                marginLeft:'1vw',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'#bbb',
                                fontWeight:'bold'
                            }
                        })
                    ]
                }),//Label
                $({
                    tag:'div',
                    style:{
                        width:'95%',
                        height:'50vh',
                        backgroundColor:'#333',
                        margin:'auto',
                        marginTop:'1vh',
                        overflowY:'auto',
                    },

                    elementHandler:(el)=>{
                        listBodyDom=el
                    }

                }),
                $({
                    tag:'div',
                    style:{
                        width:'95%',
                        margin:'auto',
                        height:'5vh',
                        backgroundColor:'#333',
                        marginTop:'2vh',
                        display:'flex'
                    },
                    child:[
                        $({
                            tag:'div',
                            text:'Total : ',
                            style:{
                                margin:'auto',
                                marginLeft:'1vw',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'#bbb',
                                fontWeight:'bold'
                            },
                            child:[
                                $({
                                    tag:'span',
                                    text:Total+' %',
                                    elementHandler:(el)=>{
                                        totalP=el
                                    }
                                })
                            ]
                        })
                    ]
                }),// total label
                $({
                    tag:'button',
                    style:{
                        width:'80%',
                        height:'7vh',
                        margin:'auto',
                        marginTop:'2vh',
                        border:'none',
                        outline:'none',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1.2vw',
                        color:'deepskyblue',
                        fontWeight:'bold',

                    },
                    att:{
                        className:'saveCrit'
                    },
                    text:'Save Criteria',
                    event:{
                        type:'click',
                        method:async ()=>{


                            if(dataList.length>0){
                                let Total=0;
                                dataList.forEach(val=>{
                                    Total+=val.percentage*1
                                })
                                if(Total===100){
                                    const form= new FormData()
                                    form.append('addCriteriaV2','1')
                                    form.append('eventId',eventId)
                                    form.append('scoreId',scId)
                                    form.append('category',catId)

                                    dataList.forEach(val=>{
                                        form.append('name[]',val.name)
                                        form.append('description[]',val.description)
                                        form.append('percentage[]',val.percentage)
                                    })
                                    await fetch('/scoreSheet',{
                                        method:'POST',
                                        body:form
                                    }).then(res=>res.json())
                                        .then(data=>{
                                            if(data.status){
                                                window.location.replace('/admin/events/scoreBoard/'+eventId)
                                            }else {
                                                alert(data.message);
                                            }
                                        })
                                }else {
                                    alert("Total percentage is below 100%")
                                }
                            }

                        }
                    }

                }) // Save button
            ]
        }))
    }


    const CategoryPanel=({name,url})=>{
        return($({
            tag:'div',
            style:{
                width:'100%',
                height:'fit-content',
                margin:'1vh auto'
            },
            child:[
                $({
                    tag:'a',
                    child:[
                        $({
                            tag:'button',
                            style:{
                                height:'10vh',
                                width:'100%',
                                borderRadius:'.5rem',
                                border:'none',
                                fontWeight:'bold',
                                cursor: 'pointer'
                            },
                            att:{
                                className: 'catBot'
                            },
                            text:name,

                        })
                    ],
                    att:{
                        href:url
                    }
                })
            ]
        }))
    }


    return($({
        tag:'div',
        style:{
            width:'50%',
            height:'100%',
            backgroundColor:'rgba(0,0,0,0.1)',
            display:'flex',
            justifyContent:'center',
            position:'relative',
        },
        child:[
            $({
                tag:'div',
                style:{
                    width:'90%',
                    height:'fit-content',
                    margin: 'auto'
                },
                elementHandler:(el)=>{

                    const req= new Request('/requestcat')
                    req.Post([
                        {
                            name:'requestCat',
                            value:'1'
                        }
                    ])
                    req.Json()
                    req.Send().then(data=>{

                        data.forEach(val=>{
                            el.appendChild(CategoryPanel({
                                name:val.name,
                                url:Current().replace(Base(),'')+'/'+val.id
                            }))
                            console.log(val.id+''===Path(5))
                            if(val.id===Path(5)*1){
                                el.appendChild(Panel(val.name,Path(5)))
                            }
                        })
                    })
                }
            })
        ],
        elementHandler:(el)=>{
            mainPanel=el
        }
    }))
}
export const LeftScorev1=(eventId)=>{
    const data={
        name:'',
        description:'',
        percentage:0
    }
    const Submit=()=>{
        const req= new Request('/scoreSheet')
        req.Post([
            {
                name:'addCriteria',
                value:'1'
            },
            {
                name:'eventId',
                value:eventId
            },
            {
                name:'name',
                value:data.name
            },
            {
                name:'description',
                value:data.description
            },
            {
                name:'percentage',
                value:data.percentage
            }

        ])
        req.Json()
        req.Send().then(data=>{
            setTimeout(()=>{
                if(data.status){
                    window.location.reload()
                }else {
                    alert(data.message)
                }
            },100)
        })
    }

    const Form=()=>{
        const Criteria=()=>{
            return($({
                tag:'div',
                style:{
                    width:'99.8%',
                    height: 'fit-content',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontWeight:'bold',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Criteria",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'input',
                        att:{
                            placeholder:"Enter text here..."
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            fontSize: '1vw',
                            padding:'1%'
                        },
                        event:{
                            type:'change',
                            method:(eve)=>{
                                data.name=eve.target.value
                            }
                        }
                    })
                ]
            }))
        }
        const Discrep=()=>{
            return($({
                tag:'div',
                style:{
                    width:'99.8%',
                    height: 'fit-content',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Description",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontWeight:'bold',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'textarea',
                        att:{
                            placeholder:"Enter text here..."
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            height:'15vh',
                            fontSize: '1vw',
                            padding:'1%'

                        },
                        event:{
                            type:'change',
                            method:(eve)=>{
                                data.description=eve.target.value
                            }
                        }
                    })
                ]
            }))
        }
        const Percentage=()=>{
            return($({
                tag:'div',
                style:{
                    width:'50%',
                    height: 'fit-content',
                    marginBottom:'2vh',
                    border:'solid thin #999',
                    backgroundColor:'#111',
                    borderRadius:'.5rem',
                    fontSize: '1vw'
                },
                child:[
                    $({
                        tag:'div',
                        text:"Percentage",
                        style:{
                            color: 'deepskyblue',
                            borderBottom:'solid thin deepskyblue',
                            width:'fit-content',
                            marginBottom: '1vh',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontWeight:'bold',
                            marginLeft:'1vw',
                            marginTop:'1vh'
                        },
                    }),
                    $({
                        tag:'input',
                        att:{
                            placeholder:"Enter numeric value",
                            type:'number',
                            value:0,
                            min:0,
                            max:100
                        },
                        style:{
                            border:'none',
                            width:'98%',
                            backgroundColor: 'transparent',
                            outline:'none',
                            resize:'none',
                            color:'#bbb',
                            fontSize: '1vw',
                            padding:'1%',
                            textAlign: 'center'
                        },
                        event:{
                            type:'change',
                            method:(eve)=>{
                                data.percentage=eve.target.value
                            }
                        }

                    })
                ]
            }))
        }
        return($({
            tag:"form",
            style:{
                width: '90%',
                margin:'auto',

            },
            event:{
                type:'submit',
                method:(eve)=>{
                    eve.preventDefault()
                    Submit()
                }
            },
            child:[
                $({
                    tag:'div',
                    text:'Add new Criteria',
                    style:{
                        fontSize:'1.5vw',
                        width:'100%',
                        textAlign:'center',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        marginBottom:'2vh',
                        color:'#bbb'
                    }
                }),
                Criteria(),
                Discrep(),
                Percentage(),
                $({
                    tag:'input',
                    att:{
                        type: 'submit',
                        className:'addCrit'
                    },
                    event:{
                        type:'submit',
                    },
                    style:{
                        width:'100%',
                        height:'8vh',
                        fontSize:'2vw',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        cursor:'pointer',
                        borderRadius:'.5rem',
                    }
                })
            ]
        }))
    }

    return($({
        tag:'div',
        style:{
            width:'50%',
            height:'100%',
            backgroundColor:'rgba(0,0,0,0.1)',
            display:'flex',
            justifyContent:'center'
        },
        child:[
            Form()
        ]

    }))
}
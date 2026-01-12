import {$, Request} from '../../../../lib/lib.js'

export const RightScore=(eventId,id)=>{

    const head=()=>{
        return($({
            tag:'div',
            text:'List of criteria',
            style:{
                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                color:'#bbb',
                fontSize:'1vw',
                fontWeight:'bold',
                textAlign:'center',
                marginTop:'2vh'
            }

        }))
    }

    const Body=()=>{
        const List=({name,catId})=>{
            let dropPanel,drp
            let dropState=false
            const dropChild=()=>{

                const ListTable=({name,description,percentage})=>{
                    return($({
                        tag:'table',
                        style:{
                            width:'100%',
                            fontSize:'1vw',
                            border:'solid thin #999',
                            marginTop:'1vh',
                            backgroundColor:'#222'
                        },
                        child:[
                            $({
                                tag:'tr',
                                child:[
                                    $({
                                        tag:'td',
                                        style:{
                                            width:'80%',
                                            paddingLeft:'.2rem',
                                            borderBottom:'solid thin #999'
                                        },
                                        text:name
                                    }),
                                    $({
                                        tag:'td',
                                        att:{
                                            rowSpan:'2'
                                        },
                                        style:{
                                            width:'10%',
                                            paddingLeft:'.2rem',
                                            border:'solid thin #999'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                style:{
                                                    width:'100%',
                                                    height:'100%',
                                                    margin:'auto',
                                                    display: 'flex'
                                                },
                                                child:[
                                                    $({
                                                        tag:'div',
                                                        style:{
                                                            margin:'auto',
                                                            fontSize:'1vw',
                                                            width:'fit-content',
                                                            height:'fit-content'
                                                        },
                                                        text:percentage
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    $({
                                        tag:'td',
                                        att:{
                                            rowSpan:'2'
                                        },
                                        style:{
                                            width:'10%',
                                            paddingLeft:'.2rem',
                                            border:'solid thin #999'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                style:{
                                                    width:'100%',
                                                    height:'100%',
                                                    margin:'auto',
                                                    display: 'flex'
                                                },
                                                child:[
                                                    $({
                                                        tag:'div',
                                                        att:{
                                                            className:'fa-solid fa-pen-to-square'
                                                        },
                                                        style:{
                                                            margin:'auto',
                                                            fontSize:'1.2vw',
                                                            cursor: 'pointer'
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                ]
                            }),
                            $({
                                tag:'tr',
                                child:[
                                    $({
                                        tag:'td',
                                        text:description,
                                        style:{
                                            paddingLeft:'.2rem',
                                            color:'#999'
                                        }
                                    }),

                                ]
                            })
                        ]
                    }))
                }

                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        paddingTop:'1vh'
                    },
                    elementHandler:(el)=>{
                        drp=el
                    },
                    child:[
                        $({
                            tag:'div',
                            text:'Criteria',
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'fit-content',
                                backgroundColor:'black'
                            },
                            elementHandler:(el)=>{
                                const req=new Request('/criteria')
                                req.Post([
                                    {
                                        name:'criteriaRequest',
                                        value:'1'
                                    },
                                    {
                                        name:'eventId',
                                        value:eventId
                                    },
                                    {
                                        name:'catId',
                                        value:catId
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    data.forEach(val=>{
                                        el.appendChild(ListTable({
                                            name:val.name,
                                            description:val.description,
                                            percentage:val.percentage+'%'
                                        }))
                                    })
                                })

                            },

                        })
                    ]
                }))
            }
            return($({
                tag:'div',
                att:{
                    className:'critList'
                },
                style:{
                    width:'100%',
                    fontSize: '1.2vw',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    marginTop:'1vh',
                    marginBottom:'1vh',
                    color: '#bbb',

                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            display: 'flex',
                        },
                        child:[
                            $({
                                tag:'div',

                                style:{
                                    width:'10%',
                                    textAlign: 'center',
                                    margin:'auto'
                                },
                                child:[
                                    $({
                                        tag:'button',
                                        att:{
                                            className:'fa-solid fa-square-caret-down  dropDown'
                                        },
                                        style:{
                                            width:'fit-content',
                                            height:'fit-content',
                                            fontSize:'1.2vw',
                                            cursor:'pointer',
                                            backgroundColor: 'black'
                                        },
                                        event:{
                                            type:'click',
                                            method:()=>{
                                                dropState=!dropState
                                                if(dropState){
                                                    dropPanel.appendChild(dropChild())
                                                }else {
                                                    drp.remove()
                                                }
                                            }
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag:'div',
                                text:name,
                                style:{
                                    width:'90%',
                                    margin: 'auto',
                                    textIndent:'1vw',
                                }
                            }),
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            backgroundColor:'rgba(0,0,0,0.3)',
                            height:'fit-content',
                        },
                        elementHandler:(el)=>{
                            dropPanel=el
                        }
                    })
                ]
            }))
        }


        return($({
            tag:'div',
            style:{
                width: '98%',
                margin:'auto',
                height: '90%',
                marginTop: '2vh',
                borderTop:'solid thin #555',
                overflowY:'auto'
            },
            elementHandler:(el)=>{
                let total=0
                const req= new Request('/criteria')
                req.Post([
                    {
                        name:'criteriaList',
                        value:'1'
                    },
                    {
                        name:'scr_id',
                        value:eventId
                    }
                ])
                req.Json()
                req.Send().then(data=>{
                    data.forEach(val=>{
                        el.appendChild(List({
                            name:val.name,
                            catId:val.id
                        }))

                    })

                })

            },
        }))
    }

    return($({
        tag:'div',
        style:{
            width:'50%',
            height:'100%',
            backgroundColor:'rgba(0,0,0,0.2)'
        },

        child:[
            head(),
            Body()
        ]
    }))
}
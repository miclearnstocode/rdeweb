import {$, Path, Request} from "../../../../lib/lib.js";
import {PrintWindow} from "../../../evaluatorComponent/script/PrintOut.js";



export const Summary=({scoreRank,rankAve,RankPerCrit})=>{
    let CategoryName
    let panel
    const RankList=rankAve.map(val=>{
        return $({
            tag:'div',
            style:{
                borderBottom:'solid thin rgba(0,0,0,0.2)',
                paddingTop:'1vh',
                paddingBottom:'1vh'
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        borderRadius:'.5rem',
                       backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                        width:'fit-content',
                        padding: '.3rem 1rem'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank # :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.rank,
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        display:'flex',
                        textIndent:'3vw',
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank average : ",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.data.rankAverage,
                            style:{
                                marginLeft:'1vw'
                            }

                        }),

                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Author :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.author
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Campus :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.campus
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Title :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:`" <i>${val.data.title.title}</i> "`
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),


            ]
        })
    })
    RankList.unshift($({
        tag:'div',
        style:{
            height:'5%',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Rank based on Ranking average',
                style:{
                    margin:'auto',
                    fontWeight:'bold'
                },
            })
        ]
    }))


    RankList.push($({
        tag:'div',
        style:{
            height:'5vh',
            width:'100%',
            backgroundColor: 'skyblue',
            marginTop:'5vh',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Click',
                style:{
                    margin:'auto',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:()=>{
                        const Printable=rankAve.map(val=>{
                            return $({
                                tag:'div',
                                style:{
                                    borderBottom:'solid thin rgba(0,0,0,0.2)',
                                    paddingTop:'1vh',
                                    paddingBottom:'1vh'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            borderRadius:'.5rem',
                                            backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                                            width:'fit-content',
                                            padding: '.3rem 1rem'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank # :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.rank,
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            display:'flex',
                                            textIndent:'3vw',
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank average : ",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.data.rankAverage,
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),

                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Author :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.author
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Campus :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.campus
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Title :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:`" <i>${val.data.title.title}</i> "`
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),


                                ]
                            })
                        })
                        Printable.unshift($({
                            tag:'div',
                            style:{
                                fontFamily:'Helvetica',
                                textAlign:'center',
                                fontWeight:'bold',
                                marginTop: '5vh'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    elementHandler:(el)=>{
                                        const req= new Request('/eventRequest')
                                        req.Post([
                                            {
                                                name:'getEventName',
                                                value:'1'
                                            },
                                            {
                                                name:'eventId',
                                                value:Path(4)
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            data.forEach(val=>{
                                                el.innerText=val.name
                                            })
                                        })
                                    }
                                }),
                                $({
                                    tag:'div',
                                    text:'Entry summary for '+CategoryName
                                }),
                                $({
                                    tag:'div',
                                    text:'Ranking based on Score Ranking Average'
                                })
                            ]

                        }))
                        PrintWindow(Printable)

                    }
                }
            })
        ]
    }))

    const RankScore=scoreRank.map(val=>{
        return $({
            tag:'div',
            style:{
                paddingTop:'1vh',
                paddingBottom:'1vh',
                borderBottom:'solid thin rgba(0,0,0,0.2)',
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        borderRadius:'.5rem',
                        backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                        width:'fit-content',
                        padding: '.3rem 1rem'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Rank # :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.rank,
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        display:'flex',
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Score average : ",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            text: val.data.averageScore,
                            style:{
                                marginLeft:'1vw'
                            }

                        }),

                    ]

                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Author :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.author
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Campus :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:val.data.title.campus
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        textIndent:'3vw'
                    },
                    child:[
                        $({
                            tag:'span',
                            text:"Title :",
                            style:{
                                fontWeight: 'bold'
                            }
                        }),
                        $({
                            tag:'span',
                            att:{
                                innerHTML:`" <i>${val.data.title.title}</i> "`
                            },
                            style:{
                                marginLeft:'1vw'
                            }

                        }),
                    ]
                }),


            ]
        })
    })
    RankScore.unshift($({
        tag:'div',
        style:{
            height:'5%',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Rank based on Score Average',
                style:{
                    margin:'auto',
                    fontWeight:'bold'
                }
,            })
        ]
    }))
    RankScore.push($({
        tag:'div',
        style:{
            height:'5vh',
            width:'100%',
            backgroundColor: 'skyblue',
            marginTop:'5vh',
            display:'flex',
        },
        child:[
            $({
                tag:'div',
                text:'Click',
                style:{
                    margin:'auto',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:()=>{
                        const Printable=scoreRank.map(val=>{
                            return $({
                                tag:'div',
                                style:{
                                    borderBottom:'solid thin rgba(0,0,0,0.2)',
                                    paddingTop:'1vh',
                                    paddingBottom:'1vh'
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        style:{
                                            borderRadius:'.5rem',
                                            backgroundImage: 'linear-gradient(to right,skyblue,ghostwhite)',
                                            width:'fit-content',
                                            padding: '.3rem 1rem'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Rank # :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.rank,
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            display:'flex',
                                            textIndent:'3vw',
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Total score average : ",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                text: val.data.averageScore,
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),

                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Author :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.author
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Campus :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:val.data.title.campus
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            textIndent:'3vw'
                                        },
                                        child:[
                                            $({
                                                tag:'span',
                                                text:"Title :",
                                                style:{
                                                    fontWeight: 'bold'
                                                }
                                            }),
                                            $({
                                                tag:'span',
                                                att:{
                                                    innerHTML:`" <i>${val.data.title.title}</i> "`
                                                },
                                                style:{
                                                    marginLeft:'1vw'
                                                }

                                            }),
                                        ]
                                    }),


                                ]
                            })
                        })
                        Printable.unshift($({
                            tag:'div',
                            style:{
                                fontFamily:'Helvetica',
                                textAlign:'center',
                                fontWeight:'bold',
                                marginTop: '5vh'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    elementHandler:(el)=>{
                                        const req= new Request('/eventRequest')
                                        req.Post([
                                            {
                                                name:'getEventName',
                                                value:'1'
                                            },
                                            {
                                                name:'eventId',
                                                value:Path(4)
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            data.forEach(val=>{
                                                el.innerText=val.name
                                            })
                                        })
                                    }
                                }),
                                $({
                                    tag:'div',
                                    text:'Entry summary for '+CategoryName
                                }),
                                $({
                                    tag:'div',
                                    text:'Ranking based on Total Score Average'
                                })
                            ]

                        }))
                        PrintWindow(Printable)

                    }
                }
            })
        ]
    }))

    const PerCriteria=RankPerCrit.map(val=>{
        return val.map(v=>{
            return{
                evalName:v.evalName,
                rank:v.rank,
                totalScore:v.data.TotalScore,
                title:v.data.file.title,
                author:v.data.file.author,
                campus:v.data.file.campus
            }
        })
    })

    const botSum=PerCriteria.map((val,index)=>{
        const List=val.map(v=>{
            return $({
                tag:'div',
                style:{
                    margin:'2vh auto',
                    marginLeft:'2vw',

                },
                child:[
                    $({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Rank #: ',
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                            $({
                                tag:'span',
                                text:v.rank,
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Total Score : ',
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                            $({
                                tag:'span',
                                text:v.totalScore
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Author : ',
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                            $({
                                tag:'span',
                                text:v.author
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Campus : ',
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                            $({
                                tag:'span',
                                text:v.campus
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Title : ',
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                            $({
                                tag:'span',
                                att:{
                                    innerHTML:`" <i>${v.title}</i> "`
                                }
                            })
                        ]
                    })
                ]
            })
        })
        List.unshift( $({
            tag:'div',
            child:[
                $({
                    tag:'span',
                    text:'Evaluator : ',
                    style:{
                        fontWeight:'bold',
                    }
                }),
                $({
                    tag:'span',
                    text:val[0].evalName,
                }),
            ]
        }),)

        return $({
            tag:'div',
            style:{
                border:'solid thin #888',
                margin:'1vh auto',
                width:'80%',
                padding:'.5rem',
                fontFamily: 'Helvetica',
                fontSize: '1vw',
                boxShadow:'-.3rem .3rem .5rem rgba(0,0,0,0.2)'
            },
            child:List
        })
    })


    botSum.unshift($({
        tag:'div',
        text:'Summary of Score',
        style:{
            textAlign:'center',
            margin:'5vh 1vh auto',
            fontSize:'1.3vw',
            fontFamily:'Helvetica',
            fontWeight:'bold',
        }
    }))


    return ($({
        tag:'div',
        style:{
            position:'absolute',
            zIndex:9999,
            width:'100%',
            height:'100%',
            backgroundColor:'white',
            userSelect:'text'
        },
        elementHandler:(el)=>{
            panel=el
        },
        child:[
            $({
                tag:'div',
                style:{
                    height: '5%',
                    width: '100%',
                    display:'flex',
                    borderBottom:'solid thin black',
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width: 'fit-content',
                            margin:'auto',
                            marginLeft:'2vw',
                            marginRight:'0',
                            padding:'.2rem',
                            fontSize:'1.3vw',
                            fontFamily:'Helvetica',
                            fontWeight:'bold',
                            backgroundColor:'#555',
                            color:'deepskyblue',
                            borderRadius:'.5rem',
                            cursor:'pointer'
                        },
                        text:'Back',
                        event:{
                            type:'click',
                            method:()=>{
                                panel.remove()
                            }
                        }
                    }),
                    $({
                        tag:'div',
                        style:{
                            margin:'auto',
                            fontSize:'1.6vw',
                            fontFamily:'Helvetica',
                            fontWeight:'bold'
                        },
                        elementHandler:(el)=>{
                            const req= new Request('/requestcat')
                            req.Post([
                                {
                                    name:'getCatName',
                                    value:'1'
                                },
                                {
                                    name:'catId',
                                    value:Path(6)+''
                                }
                            ])

                            req.Send().then(data=>{
                                CategoryName=data
                                el.innerText=`Ranking Result for ${data}`
                            })
                        }
                    })
                ]
            }),
            $({
                tag:'div',
                style:{
                    width: '100%',
                    height: '95%',
                    overflowY:'auto'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            display:'flex',
                            fontFamily: 'Helvetica',
                            fontSize: '1vw'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'48%',
                                    height: '100%',
                                    overflowY:'auto',
                                    margin:'auto',
                                    borderRight:'solid thin black',
                                    paddingRight:'.5vw'
                                },
                                child:RankList
                            }),
                            $({
                                tag:'div',
                                style:{
                                    width:'48%',
                                    height: '100%',
                                    overflowY:'auto',
                                    margin:'auto',
                                    borderLeft:'solid thin black',
                                    paddingLeft:'.5vw'
                                },
                                child:RankScore
                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'fit-content'
                        },
                        child:botSum
                    })
                ]
            })

        ]
    }))
}
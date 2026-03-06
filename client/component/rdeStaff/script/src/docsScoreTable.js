import {$, Fragment} from "../../../../lib/lib.js";

export const TableScore=(name,criteria)=>{
    const List=()=>{
        const tableField=({evalName,criteria,score,percentage,scorePercentage,descrip})=>{
            return $({
                tag:'table',
                style:{
                    width: '95%',
                    borderCollapse:'collapse',
                    fontSize:'1vw',
                    fontFamily:'Helvetica',
                    color:'#bbb',
                    userSelect:'text'
                },
                child:[
                    $({
                        tag:'tr',
                        child:[
                        
                            $({
                                tag:'td',
                                text:criteria+'\n'+descrip,
                                att:{
                                    innerHTML:`<span>${criteria}</span><div style="color: #777">" <i>${descrip}</i> "</div>`
                                },
                                style:{
                                    border:'solid thin #888',
                                    width:'80%'
                                }
                            }),
                            $({
                                tag:'td',
                                text:percentage,
                                style:{
                                    border:'solid thin #888',
                                    width:'10%',
                                    textAlign:'center',
                                }
                            }),
                            $({
                                tag:'td',
                                text:score,
                                style:{
                                    border:'solid thin #888',
                                    width:'10%',
                                    textAlign:'center'
                                }
                            })
                        ]
                    })
                ]
            })
        }
        const ListCrit=(criteriaList)=>{
            let fullList=[]
            const segregate=(evalName)=>{
                let list=[]
                let pointIndex
                let total=0
                criteria.forEach((val,index)=>{
                    if(val.fullname===evalName){
                        list.push(val)
                        pointIndex=index
                        total+=val.score*1
                    }
                })
                return [list,pointIndex,total]
            }
            for(let x=0;x<criteriaList.length;x++){
                let list=[]
                list.push(criteriaList[x])
                let name=criteriaList[x].fullname
                const [subList,indexPoint,TotalScore]=segregate(name)
                fullList.push({
                    evalName:name,
                    criteria:subList,
                    totalScore:TotalScore,
                })
                x=indexPoint
            }
            let totalG=0
            let average=0
            fullList.forEach(val=>{
                totalG+=val.totalScore
            })
            average=totalG/fullList.length
            return {List:fullList,AverageScore:average}
        }
        let SubDocsList=ListCrit(criteria).List.map(val=>{
            const Sublist=val.criteria.map(v=>{
                return tableField({
                    score:v.score,
                    criteria:v.name,
                    descrip:v.description,
                    percentage:v.percentage
                })
            })
            Sublist.push($({
                tag:'div',
                style:{
                    display:'flex',
                    width:'fit-content',
                    marginRight:'5%',
                    marginLeft:'auto',
                    marginTop:'1vh'
                },
                child:[
                    $({
                        tag:'div',
                        text:'Total Score:',
                        style:{
                            width:'10vw',
                            textAlign:'right',
                            fontFamily:'Helvetica',
                            color:'#bbb'
                        }
                    }),
                    $({
                        tag:'div',
                        text:val.totalScore,
                        style:{
                            width:'11vw',
                            textAlign:'center',
                            fontFamily:'Helvetica',
                            color:'#bbb',
                            borderBottom:'solid thin deepskyblue'
                        }
                    })
                ]
            }))
            return $({
                tag:'li',
                style:{
                    listStyleType: 'none'
                },
                elementHandler:(el)=>{
                    el.appendChild($({
                        tag:'div',
                        child:[
                            $({
                                tag:'span',
                                text:'Evaluator: ',
                                style:{
                                    fontWeight: 'bold',
                                    color:'#ddd'
                                }
                            })  ,
                            $({
                                tag:'span',
                                text:val.evalName,
                                style:{
                                    color:'#bbb'
                                }
                            })
                        ],
                        style:{
                            margin: '2vh .5vh auto',
                            fontSize:'1vw',
                            fontFamily:'Helvetica'
                        }
                    }))
                },
                child:Sublist
            })
        })
        SubDocsList.push($({
            tag:'div',
            style:{
                display:'flex',
                width:'fit-content',
                marginRight:'5%',
                marginLeft:'auto',
                marginTop:'5vh'
            },
            child:[
                $({
                    tag:'div',
                    text:'Average Score:',
                    style:{
                        width:'10vw',
                        textAlign:'right',
                        fontFamily:'Helvetica',
                        color:'#bbb'
                    }
                }),
                $({
                    tag:'div',
                    text:ListCrit(criteria).AverageScore,
                    style:{
                        width:'11vw',
                        textAlign:'center',
                        fontFamily:'Helvetica',
                        color:'#bbb',
                        borderBottom:'solid thin deepskyblue'
                    }
                })
            ]
        }))
        return $({
            tag:'ul',
            elementHandler:(el)=>{
                el.insertBefore($({
                    tag:'li',
                    style:{
                        listStyleType:'none'
                    },
                    child:[
                        $({
                            tag:'table',
                            style:{
                                width:'95%',
                                borderCollapse:'collapse',
                                fontSize:'1vw',
                                fontFamily:'Helvetica',
                                color:'#bbb',
                                backgroundColor:'#555',
                                fontWeight:'bold',
                            },
                            child:[
                                $({
                                    tag:'tr',
                                    style:{
                                        width: '95%',
                                        borderCollapse:'collapse',
                                    },
                                    child:[
                                        $({
                                            tag:'td',
                                            style:{
                                                border:'solid thin #888',
                                                width:'80%',
                                                textAlign:'center'
                                            },
                                            text:'CRITERIA',
                                        }),
                                        $({
                                            tag:'td',
                                            style:{
                                                border:'solid thin #888',
                                                width:'10%',
                                                textAlign:'center'
                                            },
                                            text:'PERCENTAGE',
                                        }),
                                        $({
                                            tag:'td',
                                            style:{
                                                border:'solid thin #888',
                                                width:'10%',
                                                textAlign:'center'
                                            },
                                            text:"SCORE"
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),el.childNodes[0])
            },
            child:SubDocsList
        })
    }
    return ($({
        tag:'div',
        style:{
            width:'95%',
            border:'solid thin deepskyblue',
            margin:'1vh auto',
            backgroundColor: '#333'
        },
        child:[
            $({
                tag:'div',
                style:{
                    margin:'1vh auto auto',
                    textIndent:'2.5vw',
                    fontSize:'1.1vw',
                    color:'#bbb',
                    fontFamily:'Helvetica',
                },
                child:[
                    $({
                        tag:'span',
                        text:'Title : '
                    }),
                    $({
                        tag:'span',
                        text:`"${name}"`
                    })
                ]
            }),
            List()
        ]
    }))
}
import {$, Request} from '../../../lib/lib.js'


export const ScoreBoard=({resId,eventId,category})=>{
    let AbstainState=false;

    let panelPer
    const changeAbstain=()=>{
        AbstainState=!AbstainState
    }
    const dataArray=[]
/*
criteriaId:val.criteria_id,
 name:val.name,
description:val.percentage,
score:0
 */
    const Submit= ()=>{
        setTimeout(async ()=>{
            const form= new FormData()
            form.append('category',category)
            form.append('docId',resId)
            form.append('scoreSave','1')
            dataArray.forEach(val=>{
                form.append('criteriaId[]',val.criteriaId)
                form.append('Score[]',val.score)
            })
            await fetch('/scoreboard',{
                method:'POST',
                body:form
            })
                .then(res=>res.json())
                .then(data=>{
                    alert(data.message);
                })
        },100)
    }
    const InputEvent=({id,value})=>{
        for(let x=0;x<dataArray.length;x++){
            if(dataArray[x].criteriaId==id){
                dataArray[x].score=value
            }
        }
    }
    const scoreBoardCriPanel=()=>{
        const PerCritScore=({name,description,percentage,crit_id})=>{
            const Name=()=>{
                return($({
                    tag:'div',
                    text:name,
                    style:{
                        color: 'deepskyblue',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1vw'
                    }
                }))
            }
            const descr=()=>{
                return($({
                    tag:'div',
                    att:{
                        innerHTML:`<i>" ${description} " </i>`
                    },
                    style:{
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1vw',
                        color:'#777'
                    }
                }))
            }
            const percent=()=>{
                return($({
                    tag:'div',
                    style:{
                        display: 'flex',
                        width:'80%'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw',
                                color:'#777',
                                fontWeight:'bold'
                            },
                            text:'Percentage : '+percentage+'%'
                        }),
                        $({
                            tag:'div',
                            style:{
                                margin:'auto'
                            },
                            child:[
                                $({
                                    tag:'span',
                                    text:'Score:',
                                    style:{
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        fontSize:'1vw',
                                        color:'#777',
                                        fontWeight:'bold',
                                        required:true
                                    }
                                }),
                                $({
                                    tag:'input',
                                    att:{
                                        type:'number',
                                        min:0,
                                        max:percentage,
                                        maxValue:percentage,
                                        placeholder:`max value ${percentage}`,
                                        maxLength:'3',
                                        id:crit_id+'',
                                        readOnly:AbstainState
                                       // pattern:'\d*',
                                    },
                                    event:{
                                        type:'change',
                                        method:function (){
                                            this.value=this.value.slice(0,this.maxLength)
                                            if(this.value>100){
                                                this.value=this.value.slice(0,2)
                                            }
                                            InputEvent(this)
                                        }
                                    },
                                    style:{
                                        marginLeft:'1vw',
                                        border:'none',
                                        outline:'none',
                                        height:'3.5vh',
                                        width:'10vw',
                                        textAlign: 'center',
                                        backgroundColor:'rgba(50,50,50,0.5)',
                                        color:'white'
                                    },
                                    elementHandler:(el)=>{
                                        setTimeout(()=>{
                                            el.value=0
                                            const req= new Request('/scoreboard')
                                            req.Post([
                                                {
                                                    name:'scoreReq',
                                                    value:'1'
                                                },
                                                {
                                                    name:'docId',
                                                    value:resId
                                                },
                                                {
                                                    name:'criteria_id',
                                                    value:crit_id
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                data.forEach((val)=>{
                                                    for(let x=0;x<dataArray.length;x++){
                                                        if(val.criteria_id===dataArray[x].criteriaId){
                                                            dataArray[x].score=val.score
                                                        }
                                                    }
                                                    setTimeout(()=>{
                                                        el.value=val.score*1
                                                    },100)
                                                })
                                            })
                                                .catch(err=>{
                                                    console.log(err)
                                                })
                                        },100)
                                    }
                                }),
                                $({
                                    tag:'span',
                                    style:{
                                        marginLeft:'1vw',
                                        color:'deepskyblue'
                                    },
                                })
                            ]
                        })
                    ]
                }))
            }
            return($({
                tag:'div',
                style:{
                    width:'95%',
                    margin:'auto',
                    marginTop:'1vh',
                    fontSize: '1vw',
                    border:'solid thin rgba(100,100,100,0.5)',
                    padding:'.5rem'
                },
                elementHandler:(el)=>{panelPer=el},
                child:[
                    Name(),
                    descr(),
                    percent()
                ]
            }))
        }
        return($({
            tag:'div',
            style:{
                height:'87%',
                width:'95%',
                margin:'auto',
                borderTop: 'solid thin #666',
                borderBottom: 'solid thin #666',
                overflow:'auto'
            },
            elementHandler:async (el)=>{
                let form= new FormData();
                form.append('scoreboard_req','1')
                form.append('docId', resId)
                await fetch('/scoreboard',{
                    method:'post',
                    body:form
                }).then(res=>res.json())
                    .then(data=>{
                        data.forEach(val=>{
                            dataArray.push({
                                criteriaId:val.criteria_id,
                                name:val.name,
                                description:val.percentage,
                                score:0
                            })
                            el.appendChild(PerCritScore({
                                name:val.name,
                                description:val.description,
                                percentage:val.percentage,
                                crit_id:val.criteria_id,
                            }))
                        })
                    })
            }
        }))
    }
    return($({
        tag:'div',
        style:{
            width:'100%',
            height:'100%',
            backgroundColor: '#111',
        },
        child:[
            $({
                tag:'form',
                style:{
                    width:'100%',
                    height:'100%',
                },
                event:{
                    type: 'submit',
                    method:(event)=>{
                        event.preventDefault()
                        Submit()
                    }
                },
                child:[
                    $({
                        tag:'div',
                        text:'Score Board ',
                        style:{
                            textAlign:'center',
                            fontSize:'1vw',
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            margin:'auto',
                            color:'#999',
                            paddingTop:'2vh',

                        }
                    }),
                    scoreBoardCriPanel(),
                    $({
                        tag:'div',

                        style:{
                            width:'98%',
                            margin:'auto',
                            height:'5vh',
                            display:'flex',
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    margin:'auto',
                                    width:'fit-content',
                                    height:'fit-content',
                                },
                                child:[
                                    $({
                                        tag:'button',
                                        text:'Save Score',
                                        style:{
                                            width:'100%',
                                            height:'4vh'
                                        },
                                    })
                                ]
                            }),
                            $({
                                tag:'div',
                                style:{
                                    margin:'auto',
                                    width:'fit-content',
                                    height:'fit-content',
                                },
                                child:[
                                    $({
                                        tag:'input',
                                        att:{
                                            type:'button',
                                            value:'Abstain'
                                        },
                                        style:{
                                            width:'100%',
                                            height:'4vh'
                                        },
                                        event:{
                                            type:'click',
                                            method:()=>{
                                                let promp
                                                if(AbstainState){
                                                    promp=confirm("You will be remove from being abstain for this document. Do you want to proceed?")
                                                }else{
                                                    promp=confirm("Your score for this document will not be include for computation. Do you want to proceed?")
                                                }
                                                if(promp){
                                                    const req= new Request('/abstain')
                                                    if(AbstainState){
                                                        // Delete Abstain
                                                        req.Post([
                                                            {
                                                                name:'removeAbstain',
                                                                value:'1',
                                                            },
                                                            {
                                                                name:'docId',
                                                                value: resId
                                                            },
                                                        ])
                                                    }else {
                                                        // Upload Abstain
                                                        req.Post([
                                                            {
                                                                name:'UpdateAbstain',
                                                                value:'1'
                                                            },
                                                            {
                                                                name:'docId',
                                                                value: resId
                                                            },
                                                            {
                                                                name:'reason',
                                                                value:''
                                                            }
                                                        ])
                                                    }
                                                    req.Json()
                                                    req.Send().then(data=>{
                                                        if(data.status){
                                                            window.location.reload()
                                                        }
                                                    }).catch(err=>{
                                                        console.error('Error submitting score:', err)
                                                        alert('Error submitting score. Please try again.')
                                                    })
                                                }
                                            }
                                        },
                                        elementHandler:(el)=>{
                                            const req= new Request('/abstain')
                                            req.Post([
                                                {
                                                    name:'checkAbstain',
                                                    value:'1',
                                                },
                                                {
                                                    name:'docId',
                                                    value:resId
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                AbstainState=(data.status !== 0)
                                                if(AbstainState){
                                                    el.style.backgroundColor='red'
                                                }else {
                                                    el.style.backgroundColor='#aaa'
                                                }
                                            }).catch(err=>{
                                                console.error('Error checking abstain status:', err)
                                            })
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                ]
            })
        ]
    }))
}

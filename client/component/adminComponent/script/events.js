import {$, ConfirmationAlert, MONTHS, Request, Waiting} from '../../../lib/lib.js'
import {AddScoreSheet} from "./scoreSheet/scoreSheet.js";

export const Events = () => {
    let mainFrame
    const eventBox = () => {
        const data = {
            eventName: ''
        }
        const getData = {
            getEventName: (value) => {
                data.eventName = value
            }
        }
        const addBox = $({
            tag: 'div',
            style: {
                height: '5vh',
                border: 'solid thin #999',
                borderRadius: '.5vw',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(to left, rgba(0,0,0,0.5) ,#333)'
            },
            child: [
                $({
                    tag: 'div',
                    text: 'Event Name:',
                    style: {
                        width: '20%',
                        height: 'fit-content',
                        margin: 'auto',
                        whiteSpace: 'nowrap',
                        color: '#999',
                        fontFamily: 'arial black, sans-serif',
                        fontSize:'1vw'
                    }
                }),
                $({
                    tag: 'input',
                    style: {
                        height: '100%',
                        width: '80%',
                        border: 'none',
                        outline: 'none',
                        paddingRight: '1vw',
                        paddingLeft: '1vw',
                        fontFamily: 'monospace',
                        fontSize: '1vw',
                        color: '#ddd'
                    },
                    event: {
                        type: 'input',
                        method: (event) => {
                            getData.getEventName(event.target.value)
                        }
                    },
                    att: {
                        placeholder: 'Enter text here..',
                        className: 'inputEv'
                    }
                })
            ]
        })
        const Date = $({
            tag: 'div',
            style: {
                height: '5vh',
                border: 'solid thin #999',
                borderRadius: '.5vw',
                width: 'fit-content',
                display: 'flex',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(to left, rgba(0,0,0,0.5) ,#333)',
                margin: '1vh auto'
            },
            child: [
                $({
                    tag: 'input',
                    att: {
                        type: 'date',
                    },
                    style: {
                        backgroundColor: 'transparent',
                        color: '#bbb',
                        outline: 'none',
                        border: 'none'
                    }
                })
            ]
        })
        const submit = $({
            tag: 'div',
            style: {
                height: '4vh',
                margin: '1vh  auto',
                marginBottom:'2vh',
                fontFamily: 'arial black,san-serif',
                display:'flex',
                border: ' solid thin',

            },
            event: {
                type: 'click',
                method: async () => {
                    if (data.eventName !== '') {
                        const Load=Waiting()
                        document.body.appendChild(Load)
                        const req=new Request('/register')
                        req.Post([
                            {
                                name:'eventReg',
                                value:'true'
                            },
                            {
                                name:'eventName',
                                value:data.eventName
                            },
                        ])
                        req.Json()
                        req.Send().then(data=>{
                            Load.remove()
                            setTimeout(()=>{
                                if (data.status) {
                                    alert("Saved successfully...!")
                                    window.location.reload()
                                } else {
                                    alert(data.message)
                                    window.location.reload()
                                }
                            },100)
                        })




                    } else {
                        alert("No data Provided..!")
                    }
                }
            },
            child:[
                $({
                    tag:'div',
                    text:'Save',
                    style:{
                        margin:'auto',
                        width:'fit-content',
                        height:'fit-content',
                        fontSize:'1.3vw'

                    }
                })
            ],
            att:{
                className:'subEv'
            }
        })

        return ($({
            tag: 'div',
            style: {
                width: '98%',
                margin: 'auto',
                height: '100%',
                cursor: 'pointer',
            },
            child: [
                $({
                    tag:'div',
                    style:{
                        height:'fit-content',
                        width:'100%',
                        paddingTop: '1%',
                    },
                    child:[
                        $({
                            tag:"div",
                            text:'Add Event',
                            style:{
                                marginBottom:'2%',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                color:'#999',
                                fontWeight:'bold'
                            },
                        }),
                        addBox,
                        submit
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        height:'80%',
                        width:'100%',
                        backgroundColor:'#222'
                    },

                }),

            ]
        }))
    }

    const eventList = () => {
        let dateMain
        const eventObject = ({Evename, status, deadline, eventID,scoreId}) => {
            const close = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        fontSize: '1.5vw',
                        position: 'absolute',
                        color: 'deepskyblue',
                        cursor: 'pointer',
                        top: '1vh',
                        left: '.5vw'
                    },
                    att: {
                        className: 'fa-solid fa-circle-xmark'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            dateMain.remove()
                        }
                    }
                }))
            }
            const dateHolder = () => {
                let timeIn = '';

                const date = () => {

                    let dateInput

                    return ($({
                        tag: 'div',
                        style: {
                            width: '70%',
                            height: '5vh',
                            margin: 'auto',
                            backgroundColor: '#333',
                            border: 'solid thin rgba(200,200,200,0.5)',
                            display: 'flex'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '10%',
                                    position: 'relative',
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            position: 'absolute',
                                            left: '0',
                                            top: '0',
                                            width: 'fit-content',
                                            height: 'fit-content',
                                            color: 'deepskyblue',
                                            fontSize: '1.8vw',
                                            right: '0',
                                            bottom: '0',
                                            margin: 'auto',
                                            cursor: 'pointer'
                                        },
                                        att: {
                                            className: 'fa-solid fa-calendar-days'
                                        }
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'datetime-local'
                                        },
                                        style: {
                                            width: '99%',
                                            fontSize: '2vw',
                                            border: 'none',
                                            outline: 'none',
                                            height: '100%',
                                            opacity: '0',
                                            backgroundColor: 'transparent',
                                            position: 'absolute'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (ev) => {
                                                timeIn = ev.target.value
                                                let date = ev.target.value.split('T')[0]
                                                let Time = ev.target.value.split('T')[1]
                                                dateInput.innerText = `Date : ${date} Time :${Time}`
                                            }
                                        }
                                    }),

                                ]

                            }),
                            $({
                                tag: 'div',
                                elementHandler: (el) => {
                                    dateInput = el
                                },
                                style: {
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    fontSize: '1.1vw',
                                    margin: 'auto',
                                    color: '#bbb',
                                    fontWeight: 'bold'
                                }
                            })
                        ]
                    }))
                }
                const Submit = () => {
                    return ($({
                        tag: 'div',
                        style: {
                            fontSize: '1.3vw',
                            fontFamily: 'arial black,sans-serif',
                            width: 'fit-content',
                            paddingLeft: '1vw',
                            paddingRight: '1vw',
                            margin: 'auto',
                            marginTop: '2vh',
                            border: 'solid thin rgba(200,200,200,0.5)',
                            borderRadius: '.5vw'
                        },
                        att: {
                            className: 'sub'
                        },
                        text: 'Submit',
                        event: {
                            type: 'click',
                            method: () => {
                                if (timeIn !== '') {
                                    if (confirm("Update deadline? ")) {
                                        const req = new Request('/deadline')
                                        req.Post([
                                            {
                                                name: 'updateDeadline',
                                                value: '1'
                                            },
                                            {
                                                name: 'newDate',
                                                value: timeIn
                                            },
                                            {
                                                name: 'eventId',
                                                value: eventID
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            if (data.status) {
                                                alert(data.message)
                                                window.location.reload()
                                            } else {
                                                alert(data.message)
                                            }
                                        })
                                    }
                                } else {
                                    alert('Please select a date...!')
                                }

                            }
                        }
                    }))
                }

                return ($({
                    tag: 'div',
                    style: {
                        width: '50%',
                        height: 'fit-content',
                        margin: 'auto',
                        backgroundColor: '#222',
                        border: 'solid thin rgba(200,200,200,0.5)',
                        padding: '1rem',
                        borderRadius: '1vw',
                        position: 'relative'
                    },
                    child: [
                        close(),
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                textAlign: 'center',
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize: '2vw',
                                margin: '2vh auto',
                                color: "deepskyblue",
                                fontWeight: 'bolder'
                            },
                            text: 'Update Deadline'
                        }),
                        date(),
                        Submit()
                    ]
                }))
            }


            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    height: 'fit-content',
                    width: '100%',
                    margin: '1vh auto',
                    paddingBottom: '1vh',
                    paddingTop: '1vh',
                    borderRadius: '.5vw',
                    position: 'relative'
                },
                att: {
                    className: 'eventDet'
                },
                child: [
                    $({
                        tag:'a',
                        att:{
                            className:'fa-solid fa-folder-open',
                            href:'/admin/events/scoreBoard/'+eventID
                        },
                        style:{
                            margin:'auto',
                            width:'fit-content',
                            height:'fit-content',
                            marginLeft:'1vw',
                            cursor:'pointer',
                            color:'deepskyblue',
                            backgroundColor:'transparent',
                            border:'none',
                            fontSize:'1.1vw',
                            textDecoration:'none'
                        },


                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '40%',
                            fontFamily: 'arial,sans-serif',
                            fontSize: '1vw',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            color: '#bbb',
                            textIndent: '1vw',
                            margin: 'auto'
                        },
                        text: Evename
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '10%',
                            fontFamily: 'arial,sans-serif',
                            textAlign: 'center',
                            height: '100%',
                            margin: 'auto',
                            marginRight: '.5vw',
                            fontSize: '1vw'
                        },
                        elementHandler: (el) => {

                            const req = new Request('/eventState')
                            req.Post([
                                {
                                    name: 'checkDeadLine',
                                    value: '0',
                                },
                                {
                                    name: 'eventId',
                                    value: eventID
                                }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                el.innerText = (data.status) ? "Active" : 'Close';
                                el.style.color = (data.status) ? "deepskyblue" : "red";
                            })
                        },
                        text: (status) ? "Active" : "Close",

                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '30%',
                            height: 'fit-content',
                            borderLeft: 'solid thin deepskyblue',
                            borderRight: 'solid thin deepskyblue',
                            padding: '.2rem',
                            textAlign: "center",
                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            fontSize: '1vw'
                        },
                        att: {
                            className: 'deadDate'
                        },
                        text: deadline,
                        event: {
                            type: 'click',
                            method: () => {

                                mainFrame.appendChild($({
                                    tag: 'div',
                                    style: {
                                        height: '100%',
                                        width: '100%',
                                        backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    },
                                    child: [
                                        dateHolder()
                                    ],
                                    elementHandler: (el) => {
                                        dateMain = el
                                    }
                                }))
                            }
                        }
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-trash-can delEv'
                        },
                        style: {
                            width: '10%',
                            textAlign: 'center',
                            height: '100%',
                            margin: 'auto',
                            fontSize: '1vw'
                        },
                        event:{
                            type:'click',
                            method:()=>{
                                if(confirm("Do you want to delete this event?")){
                                    const req= new Request('/eventRequest')
                                    req.Post([
                                        {
                                            name:'deleteEvent',
                                            value:'1'
                                        },
                                        {
                                            name:'eventId',
                                            value:eventID
                                        }
                                    ])
                                    req.Json()
                                    req.Send().then(data=>{
                                        if(data.status){
                                            alert(data.message)
                                            window.location.reload()

                                        }
                                    })
                                }
                            }
                        }
                    })

                ],
                elementHandler:()=>{

                    const base=window.location.href
                    const url=base.replace(window.location.origin, '').split('/')
                    if(url[3]==='scoreBoard'){
                        if(url[4]===eventID){
                            mainFrame.appendChild(AddScoreSheet({id:scoreId,eventID:eventID,name:Evename}))
                        }
                    }
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
            },
            child: [
                $({
                    tag: 'div',
                    text: 'Event List',
                    style: {
                        fontFamily: 'arial black,sans-serif',
                        fontSize: '1.2vw',
                        textAlign: 'center',
                        color: '#888',
                        height: '4vh',
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        height: '4%',
                        width: '98%',
                        margin: 'auto',
                        borderBottom: 'solid thin rgba(100,100,100,0.3)',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(100,100,100,0.3)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Event Types',
                            style: {
                                width: '45%',
                                fontFamily: 'arial,sans-serif',
                                fontWeight: 'bold',
                                fontSize: '1.2vw',
                                color: '#888',
                                height: 'fit-content',
                                margin: 'auto',
                                marginLeft: '0',
                                textIndent: '1vw',
                                marginRight: 'auto'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Status',
                            style: {
                                width: '15%',
                                fontFamily: 'arial,sans-serif',
                                fontWeight: 'bold',
                                fontSize: '1.2vw',
                                color: '#888',
                                height: 'fit-content',
                                margin: 'auto',
                                textAlign: 'center',
                                marginLeft: '0',

                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Dead Line',
                            style: {
                                width: '35%',
                                fontFamily: 'arial,sans-serif',
                                fontWeight: 'bold',
                                fontSize: '1.2vw',
                                color: '#888',
                                height: 'fit-content',
                                margin: 'auto',
                                textAlign: 'center',
                                marginLeft: '0',
                                marginRight: '8%'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        height: '92%',
                        width: '98%',
                        overflowY: 'auto',
                        margin: 'auto'
                    },
                    elementHandler: async (el) => {
                        const form = new FormData()
                        form.append('getEventAdmin', 'true')
                        await fetch('/eventRequest', {
                            method: 'POST',
                            body: form
                        }).then(res => res.json())
                            .then(data => {
                                data.forEach(val => {
                                    const date = val.dead_line.split(' ')[0].split('-')
                                    const month = MONTHS[(date[1] - 1)]
                                    const day = date[2]
                                    const year = date[0]
                                    el.appendChild(eventObject({
                                        Evename: val.name,
                                        status: Boolean(val.status * 1),
                                        eventID: val.id,
                                        deadline: `${year} - ${month} - ${day}`,
                                        scoreId:val.scID
                                    }))
                                })
                            })
                    }
                })
            ]
        }))
    }


    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        externalStyle: '/client/component/adminComponent/componentStyle/event.css',
        elementHandler: (el) => {
            mainFrame = el
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            borderLeft: 'solid thin #444',
                            textAlign: 'center',
                            width: '50%',
                            justifyContent: 'center',
                            display: 'flex'
                        },
                        child: [
                            eventBox()
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            borderLeft: 'solid thin #444',
                            width: '50%'
                        },
                        child: [
                            eventList()
                        ]
                    })
                ]
            })
        ]
    }))
}
/*
Events

for database


(table)
event Id
event Name
event Date (initial)

(table)
evaluator for that event
" please add evaluator for specific event for future functionalities"

events mus have trigger button to become active
"allowed only documents to submit for that event"

 */

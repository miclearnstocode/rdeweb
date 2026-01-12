import {$, Base, Current, LoadLocation, Path, Request, TimeConvert} from '../../../lib/lib.js'
import {Error} from "../../../error.js";

export const DocumentLog = () => {
    const Bot = ({label, url}) => {

        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '50%',
                display: 'flex',
                cursor: 'pointer'
            },
            elementHandler: (el) => {
                if (url.split('/')[3] === Path(3)) {
                    Object.assign(el.style, {
                        color: 'deepskyblue',
                        backgroundImage: 'linear-gradient(black,transparent)',
                        pointerEvents: 'none'
                    })
                }
            },
            att: {
                className: 'docLogBot'
            },
            event: {
                type: 'click',
                method: () => {
                    LoadLocation(url)
                }
            },
            child: [
                $({
                    tag: 'div',
                    text: label,
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        fontFamily: 'arial black,sans-serif',
                        fontSize: '1vw',
                        margin: 'auto'
                    }
                })
            ]
        }))
    }

    const communication = () => {
        let bodyMainList
        const Logs = ({date, time, rdeName, details, id}) => {

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '100%',
                    paddingTop: '1vh',
                    paddingBottom: '1vh',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    margin: '1vh auto',
                    display: 'flex',
                    textIndent: '.5vw',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize: '1vw',

                },
                att:{
                    className:'logList'
                },
                child: [
                    $({
                        tag: 'div',
                        text: date,
                        style: {
                            width: '15%'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: time,
                        style: {
                            width: '15%'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: rdeName,
                        style: {
                            width: '25%'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: details,
                        style: {
                            width: '45%',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            userSelect:'none',
                            cursor: 'pointer'
                        },
                        event:{
                            type:'click',
                            method:()=>{
                                alert(details)
                            }
                        }
                    }),
                ]
            }))
        }

        let iconOrder = {
            date: false,
            time: false,
            rde: false,
            details: false
        }
        let elOrder = {
            date: '',
            time: '',
            rde: '',
            details: '',
        }

        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '100%',
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        height: '10%',
                        width: '100%',
                        display: 'flex',
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                height: 'fit-content',
                                width: 'fit-content',
                                padding: '.5rem',
                                display: 'flex',
                                border: 'solid thin #555',
                                borderRadius: '.5vw',
                                margin: ' auto',
                                marginLeft: '1vw',
                                backgroundColor: 'rgba(0,0,0,0.3)'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-magnifying-glass'
                                    },
                                    style: {
                                        fontSize: '1.2vw',
                                        margin: 'auto',
                                        height: 'fit-content',
                                        width: 'fit-content',
                                        marginRight: '.5vw',
                                        color: '#555'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        fontSize: '1vw',
                                        margin: 'auto',
                                        width: '25vw',
                                        color: '#999'
                                    },
                                    att: {
                                        placeholder: 'Enter text here...',
                                        type: 'text'
                                    },
                                    event:{
                                        type:'input',
                                        method:(ev)=>{
                                            const list=bodyMainList.childNodes
                                            for(const v of list) {
                                                if(v.innerText.toUpperCase().includes(ev.target.value.toUpperCase())){
                                                    v.style.display='flex'
                                                }else {
                                                    v.style.display='none'
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
                        width: '100%',
                        height: '5%',
                        borderTop: 'solid thin rgba(100,100,100,0.3)',
                        borderBottom: 'solid thin rgba(100,100,100,0.3)',
                        display: 'flex',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontWeight: 'bold',
                        fontSize: '1vw'
                    },

                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '15%',
                                height: '100%',
                                margin: 'auto',
                                display: 'flex'
                            },
                            att: {
                                className: 'sortHead'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Date',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        marginLeft: '.5vw'
                                    }
                                })
                            ],

                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '15%',
                                height: '100%',
                                margin: 'auto',
                                borderLeft: 'solid thin rgba(100,100,100,0.3)',
                                display: 'flex'
                            },
                            att: {
                                className: 'sortHead'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Time',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        marginLeft: '.5vw'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '25%',
                                height: '100%',
                                margin: 'auto',
                                borderLeft: 'solid thin rgba(100,100,100,0.3)',
                                display: 'flex'
                            },
                            att: {
                                className: 'sortHead'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'RDE Staff',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        marginLeft: '.5vw'
                                    }
                                })
                            ]

                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '45%  ',
                                height: '100%',
                                margin: 'auto',
                                borderLeft: 'solid thin rgba(100,100,100,0.3)',
                                display: 'flex'
                            },
                            att: {
                                className: 'sortHead'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    iconOrder.details = !iconOrder.details
                                    if (iconOrder.details) {
                                        iconOrder.details.className = 'fa-solid fa-arrow-down'
                                        iconOrder.details.style.color = 'deepskyblue'
                                    } else {
                                        iconOrder.details.className = ''
                                        iconOrder.details.style.color = ''
                                    }
                                }
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'Details',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        marginLeft: '.5vw'
                                    },
                                    elementHandler: (el) => {
                                        elOrder.details = el
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: 'fit-content',
                                        height: 'fit-content',
                                        margin: 'auto',
                                        marginRight: '.5vw',
                                    },
                                    elementHandler: (el) => {
                                        iconOrder.details = el
                                    }
                                })
                            ]

                        }),
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        height: '84%',
                        width: '100%',
                        overflowY: 'auto',
                    },
                    elementHandler: (el) => {
                        bodyMainList=el
                        const req = new Request('/documentLog');
                        req.Post([
                            {
                                name: 'logRequest',
                                value: '1'
                            }
                        ])
                        req.Json()
                        req.Send().then(data => {
                            data.forEach(val=>{
                                let name=val.rdeName
                                if(val.rdeName===null){
                                    name='ADMIN'
                                }
                                el.appendChild(Logs({
                                    rdeName:name,
                                    details:val.details,
                                    id:val.id,
                                    date:val.date.split(" ")[0],
                                    time:TimeConvert(val.date.split(" ")[1].split(":")),
                                }))
                            })

                        })
                    }
                })
            ]
        }))
    }

    const events = () => {
        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '100%',
            },
            text: 'Events',
            elementHandler: (el) => {

            }
        }))
    }
    const Top = () => {

        return ($({
            tag: 'div',
            style: {
                height: '5vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            },
            child: [
                Bot({
                    label: 'Communication',
                    url: '/admin/document_logs/communication'
                }),
                Bot({
                    label: 'Events Document',
                    url: '/admin/document_logs/events'
                }),

            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            height: '100%',
            width: '100%',
        },
        externalStyle: '/client/component/adminComponent/componentStyle/docLogStyle.css',
        child: [
            Top(),
            $({
                tag: 'div',
                style: {
                    height: '95%',
                    width: '100%',
                },
                elementHandler: (el) => {
                    switch (Path(3)) {
                        case 'communication':
                            el.appendChild(communication())
                            break;
                        case 'events':
                            el.appendChild(events())
                            break;
                        default:
                            el.appendChild(Error())
                    }
                }
            })
        ]
    }))
}

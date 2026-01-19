import {$, CapsuOffice, ConfirmationAlert, SpecialChar, Waiting} from '../../../lib/lib.js'


export const Dashboard = () => {
    let mainFrame
    const Label = (leb) => {
        return ($({
            tag: 'div',
            style: {
                fontSize: '1.3vw',
                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                color: 'lightskyblue',
                fontWeight: "bold",
                textIndent: '1vw'
            },
            text: leb
        }))
    }

    const SubLabel = (val) => {
        return ($({
            tag: 'div',
            style: {
                fontSize: '1vw',
                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                fontWeight: "bold",
                textIndent: '1vw',
                width: '100%'
            },
            text: val
        }))
    }
    const PerCampus = ({label, total,method}) => {
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                display: 'flex',
                width: '95%',
                borderBottom: 'solid thin rgba(100,100,100,0.5)',
                marginBottom: '.5vh',
                cursor: 'pointer',
            },

            att: {
                className: 'perCamp'
            },
            event: {
                type: 'click',
                method: method
            },
            child: [
                SubLabel(label),
                $({
                    tag: 'div',
                    style: {
                        fontSize: '1vw',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    },
                    text: total
                })
            ]
        }))
    }
    const Left = () => {

        const panel = () => {



            return ($({
                tag: "div",
                style: {
                    width: '100%',
                    paddingLeft: '.5vw',
                    paddingRight: '.5vw',
                    marginTop: '1.5vh',
                },
                elementHandler: async (el) => {
                    const form = new FormData()
                    form.append('getTotalUser', 'true')
                    CapsuOffice.forEach(v => {
                        form.append('campusName[]', v)
                    })
                    await fetch('/loader', {
                        method: 'POST',
                        body: form
                    }).then(res => res.json())
                        .then(data => {
                            data.list.forEach(val => {
                                el.appendChild(PerCampus({
                                    label:val.CampusName,
                                    total:val.Total
                                }))
                            })
                            el.appendChild($({
                                tag: 'div',
                                style: {
                                    width: '50%',
                                    marginRight: '0',
                                    display: 'flex',
                                    marginLeft: 'auto'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        text: 'TOTAL USERS',
                                        style: {
                                            fontSize: '1vw',
                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            color: 'deepskyblue',
                                            fontWeight: 'bolder',
                                            width: '70%'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: data.total,
                                        style: {
                                            fontSize: '1vw',
                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                            color: '#bbb',
                                            fontWeight: 'bolder',
                                        }
                                    }),
                                ]
                            }))
                        })


                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                width: '32%',
                margin: 'auto',
                marginTop: '.5vh',
                borderRadius: '.5vw',
                paddingBottom:'2vh',
                backgroundColor: 'rgba(0,0,0,0.1)'
            },
            child: [
                Label("System users"),
                panel()
            ]

        }))
    }
    const Center = () => {

        const Content = () => {
            const viewFilesDash=(CampusName)=>{
                let viewF
                const Close=$({
                    tag:'div',
                    style:{
                        color:'deepskyblue',
                        fontSize:'3vw',
                        left: '-4vw',
                        position:'absolute',
                        cursor: 'pointer'
                    },
                    att:{
                        className: 'fa-solid fa-circle-xmark'
                    },
                    event:{
                        type: 'click',
                        method: ()=>{
                            viewF.remove()
                        }
                    }
                })
                const MainPanel=()=>{

                    const Top=$({
                        tag:'div',
                        style:{
                            height:'10%',
                            width:'100%',
                            backgroundColor:'#222',
                            display:'flex',
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    margin:'auto',
                                    height:'fit-content',
                                    width:'fit-content',
                                    marginLeft: '5vw',
                                    marginRight: '0',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color:'#bbb',
                                    fontSize:'2vw',
                                    fontWeight:'bold'
                                },
                                text:'Campus/Office : '
                            }),
                            $({
                                tag:'div',
                                style:{
                                    margin:'auto',
                                    height:'fit-content',
                                    width:'fit-content',
                                    marginLeft: '1vw',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color:'#bbb',
                                    fontSize:'2vw',
                                    fontWeight:'bold'
                                },
                                text:CampusName
                            }),
                        ]
                    })
                    const Header=()=>{
                        const LabelHead=({width,label})=>{
                            return($({
                                tag:'div',
                                style:{
                                    width:width,
                                    height:'fit-content',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    margin:'auto',
                                    color:'#bbb',
                                    textOverflow:'ellipsis',
                                    whiteSpace:'nowrap',
                                    overflowY:'hidden'
                                },
                                text:label
                            }))
                        }
                        return($({
                            tag:'div',
                            style:{
                                height:'4%',
                                width:'98%',
                                border: 'solid thin rgba(200,200,200,0.3)',
                                borderLeft:'none',
                                borderRight:'none',
                                display:'flex',
                                margin:'auto'
                            },
                            child:[
                                LabelHead({
                                    width:'12%',
                                    label:'Date'
                                }),
                                LabelHead({
                                    width:'33%',
                                    label:'Sender'
                                }),
                                LabelHead({
                                    width:'55%',
                                    label:'Title'
                                }),

                            ]
                        }))
                    }
                    return($({
                        tag:'div',
                        style:{
                            width:'100%',
                            height:'100%',
                            backgroundColor:'rgba(0,0,0,0.3)',
                        },
                        child:[
                            Top,
                            Header(),
                            $({
                                tag:'div',
                                style:{
                                    height:'86%',
                                    width:'100%',
                                    overflowY: 'auto',

                                },
                                elementHandler:async (el)=>{
                                    const form= new FormData()
                                    form.append('getFiles','true')
                                    form.append('campusName',CampusName)
                                    await fetch('/loader',{
                                        method:'POST',
                                        body:form
                                    }).then(res=>res.json())
                                        .then(data=>{
                                            data.list.forEach(val=>{
                                                el.appendChild($({
                                                    tag:'div',
                                                    style:{
                                                        width:'98%',
                                                        margin:'auto',
                                                        display:'flex'
                                                    },
                                                    child:[
                                                        $({
                                                            tag:'div',
                                                            style:{
                                                                width:'12%',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            text:val.date
                                                        }),
                                                        $({
                                                            tag:'div',
                                                            style:{
                                                                width:'33%',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            text:val.sender
                                                        }),
                                                        $({
                                                            tag:'div',
                                                            style:{
                                                                width:'55%',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            text:val.name
                                                        })
                                                    ]
                                                }))
                                            })
                                        })
                                }
                            })
                        ],

                    }))
                }
                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                        position: 'absolute',
                        backgroundColor:'rgba(0,0,0,0.5)',
                        left:'0',
                        top:'0',
                        display:'flex',
                        justifyContent:'center'
                    },
                    elementHandler:(el)=>{
                        viewF=el
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                width:'80%',
                                height:'98%',
                                position:'relative',
                                backgroundColor:'#555'
                            },
                            child:[
                                Close,
                                MainPanel()
                            ],

                        })
                    ]
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    margin:'auto',
                    width: '100%',
                    height: 'fit-content',
                    marginTop: '2vh'
                },
                child: [
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                            display:'flex',
                        },
                        child:[
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '1vw',
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color: '#bbb',
                                    fontWeight: "bold",
                                    textIndent: '1vw',
                                    width:'75%',
                                },
                                text: 'Campus Origin'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '1vw',
                                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color: '#bbb',
                                    fontWeight: "bold",
                                    textIndent: '1vw',
                                    width:'25%'
                                },
                                text: 'Total Files'
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            margin:'auto',
                            marginTop: '1vh',
                            width: '95%',
                            marginBottom: '2vh'
                        },
                        elementHandler:async (el)=>{
                            const form= new FormData()
                            form.append('communication','true')
                            CapsuOffice.forEach(val=>{
                                form.append('campusName[]',val)
                            })

                            await fetch('/loader',{
                                method:'POST',
                                body:form
                            }).then(res=>res.json())
                                .then(data=>{
                                    data.list.forEach(val=>{
                                        el.appendChild(PerCampus({
                                            label:val.CampusName,
                                            total:val.Total,
                                            method:async ()=>{
                                                    mainFrame.appendChild(viewFilesDash(val.CampusName))
                                            }
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
                height: 'fit-content',
                width: '32%',
                margin: 'auto',
                marginTop: '.5vh',
                borderRadius: '.5vw',
                backgroundColor: 'rgba(0,0,0,0.1)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '100%'
                    },
                    child: [
                        Label("Communication"),
                        Content()
                    ]
                })
            ]
        }))
    }
    const Right = () => {
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                width: '32%',
                margin: 'auto',
                marginTop: '.5vh',
                borderRadius: '.5vw',
                border: 'solid thin rgba(200,200,200,0.2)',
                backgroundColor: 'rgba(0,0,0,0.1)'
            },
            child: [
                Label("Event Document")
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            position: 'relative',

        },
        elementHandler:(el)=>{
            mainFrame=el
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'fit-content',
                    display: 'flex'
                },

                child: [
                    Left(),
                    Center(),
                    Right()
                ]
            })
        ],
        externalStyle: '/client/component/adminComponent/componentStyle/dashBoard.css'
    }))
}

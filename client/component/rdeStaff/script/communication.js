    import {

    $,

    base64ToArrayBuffer,

    ConfirmationAlert,

    dataURLtoFile,

    TextToBase64Barcode, TimeConvert,

    Waiting

} from "../../../lib/lib.js";





export const Communication = () => {

    let mainComPanel

    const getComPanel = (el) => {

        mainComPanel = el

    }

    let bodyDocs





    const Incoming = () => {

        let bodyContent

        const label = $({

            tag: 'div',

            style: {

                height: 'fit-content',

                width: 'fit-content',

                fontFamily: 'arial black,sans-serif',

                color: '#bbb',

                margin: '1vh auto auto',

                fontSize: '1.2vw'

            },

            text: 'Incoming Documents'

        })

        const search = $({

            tag: 'div',

            style: {

                height: '4vh',

                width: 'fit-content',

                margin: '2vh auto auto',

                marginLeft: '2vw',

                borderBottom: 'solid thin rgba(100,100,100,0.3)',

                backgroundColor: 'rgba(0,0,0,0.2)',

                padding: '.2rem',

                borderRadius: '1vw',

                display: 'flex',

                justifyContent: 'center'

            },

            child: [

                $({

                    tag: 'div',

                    style: {

                        width: 'fit-content',

                        height: 'fit-content',

                        margin: 'auto'

                    },

                    child: [

                        $({

                            tag: 'span',

                            att: {

                                className: 'fa-solid fa-magnifying-glass'

                            },

                            style: {

                                color: 'deepskyblue',

                                fontSize: '1.5vw'

                            }

                        }),

                        $({

                            tag: 'input',

                            att: {

                                type: 'text',

                                className: 'searchInput',

                                placeholder: 'Search docs',
                                id: 'incoming-search-input',
                                name: 'incoming_search'

                            },



                            style: {

                                backgroundColor: 'transparent',



                                border: 'none',

                                outline: 'none',

                                paddingLeft: '.5vw',

                                paddingRight: '.5vw',

                                color: '#bbb',

                                height: '100%',

                                fontSize: '1.1vw'

                            },

                            event: {

                                type: 'input',

                                method: (event) => {

                                    const list = bodyContent.childNodes

                                    list.forEach(val => {



                                        if (!val.innerText.includes(event.target.value)) {

                                            val.style.display = 'none'

                                        } else {

                                            val.style.display = ''

                                        }

                                    })

                                }

                            }

                        })

                    ]

                })

            ]

        })

        const bodyPanel = () => {

            //className:'fa-solid fa-file-pdf'`

            const File = ({date,docType ,title, file, docId, signatureList, finalApp}) => {

                const month=new Date(date.split(' ')[0]).toLocaleString('default', { month: 'long' });

                const dt=date.split(' ')[0].split('-')

                const timeFormat=date.split(' ')[1].split(':')





                const DatePanel = $({

                    tag: 'div',

                    text: dt[0]+' '+month+', '+dt[2]+' | '+TimeConvert(timeFormat),

                    style: {

                        fontFamily: 'monospace',

                        fontSize: '1.1vw',

                        paddingLeft: '1vw',

                        paddingBottom: '.5vh',

                        paddingTop: '.5vh',

                        color: 'deepskyblue'

                    }

                })

                const Details = $({

                    tag: 'div',

                    style: {

                        width: '100%',

                        display: 'flex',

                        justifyContent: 'center',

                        paddingBottom: '.5vh',

                        paddingTop: '.5vh'

                    },

                    child: [

                        $({

                            tag: 'div',

                            att: {

                                className: 'fa-solid fa-file-pdf'

                            },

                            style: {

                                width: '4vw',

                                fontSize: '4vw',

                                textAlign: 'center',

                                color: 'grey'

                            }

                        }),

                        $({

                            tag: 'div',

                            style: {

                                width: '100%',

                                fontSize: '1vw',

                                fontFamily: 'arial,sans-serif',

                                fontWeight: 'bolder',

                                textIndent: "3vw",

                                height: 'fit-content',

                                margin: 'auto',

                                color: '#bbb'

                            },

                            att: {

                                innerHTML: `<i>" ${title} "</i>`

                            }

                        })

                    ]

                })

                const Controller = () => {

                    const buttonCont = ({text, event, style}) => {

                        return ($({

                            tag: 'div',

                            style: style,

                            att: {

                                className: 'botConFile',

                                innerHTML: `<div style="margin: auto;height: fit-content">${text}</div>`

                            },

                            event: {

                                type: 'click',

                                method: () => {

                                    if (event) {

                                        event()

                                    }

                                }

                            }

                        }))

                    }

                    const viewPanel = () => {



                        let viewP

                        const getViewPan = (el) => {

                            viewP = el

                        }



                        const ControlPart = () => {

                            const fileName = $({

                                tag: 'div',

                                style: {

                                    margin: '2vh  auto',

                                    width: '95%',

                                    borderBottom:'solid thin rgba(100,100,100,0.5)',

                                    paddingTop:'1vh',

                                    paddingBottom:'1vh'

                                },

                                child: [



                                    $({

                                        tag: 'div',

                                        style: {

                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                            color: 'lightskyblue',

                                            fontSize: '1vw',

                                        },

                                        text: "Document Type"

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                            color: '#ddd',

                                            fontSize: '1vw',

                                        },

                                        text: `" ${docType} "`

                                    }),

                                    $({

                                        tag:'div',

                                        style:{

                                            height:'1vh'

                                        }

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                            color: 'lightskyblue',

                                            fontSize: '1vw',

                                        },

                                        text: "Document Title"

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                            color: '#ddd',

                                            fontSize: '1vw',

                                        },

                                        text: `" ${title} "`

                                    }),



                                ]



                            })

                            const Signatures = () => {

                                const Label = $({

                                    tag: 'div',

                                    style: {

                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                        color: 'lightskyblue',

                                        fontSize: '1vw',

                                    },

                                    text: 'Signatures Required'

                                })

                                const getSig = (el) => {

                                    const name = (nem) => {

                                        return ($({

                                            tag: 'li',

                                            style: {

                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                                color: '#bbb'

                                            },

                                            text: nem

                                        }))

                                    }

                                    signatureList.forEach(val => {

                                        el.appendChild(name(val))

                                    })

                                }



                                return ($({

                                    tag: 'div',

                                    style: {

                                        marginTop: '1vh',

                                        height: 'fit-content',

                                        paddingTop: '.5vh',

                                        paddingBottom: '.5vh',

                                        width: '95%',

                                        margin: 'auto',

                                    },

                                    child: [

                                        Label,

                                        $({

                                            tag: 'ul',

                                            style: {

                                                width: '100%',

                                                marginTop: '.5vh'

                                            },

                                            elementHandler: getSig

                                        })

                                    ]

                                }))

                            }



                            const Recommending = () => {

                                return ($({

                                    tag: 'div',

                                    style: {

                                        margin: '2vh auto auto',

                                        width: '95%'

                                    },

                                    child: [

                                        $({

                                            tag: 'div',

                                            style: {

                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                                color: 'lightskyblue',

                                                fontSize: '1vw',

                                            },

                                            text: "Recomending Approval"

                                        }),

                                        $({

                                            tag: 'div',

                                            style: {

                                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                                                color: '#ddd',

                                                fontSize: '1vw',

                                            },

                                            text: finalApp

                                        })

                                    ]



                                }))

                            }



                            const returnBox = () => {

                                let retBox

                                const getRetBox = (el) => {

                                    retBox = el

                                }

                                let txt

                                const getTXT = (el) => {

                                    txt = el

                                }



                                const inputBox = $({

                                    tag: 'textarea',

                                    style: {

                                        height: '30vh',

                                        width: '95.5%',

                                        margin: 'auto',

                                        backgroundColor: 'rgba(0,0,0,0.5)',

                                        border: 'none',

                                        outline: 'none',

                                        padding: '.5rem',

                                        fontFamily: 'monospace',

                                        fontSize: '1.2vw',

                                        color: '#ccc',

                                        resize: 'none',

                                        textAlign: 'left',

                                        textIndent: '3vw',

                                        boxShadow: 'inset 0 0 .5vw black'

                                    },

                                    att: {

                                        placeholder: 'Enter text here..'

                                    },

                                    elementHandler: getTXT

                                })

                                const botC = () => {

                                    return ($({

                                        tag: 'div',

                                        style: {

                                            height: '5vh',

                                            width: '98%',

                                            margin: 'auto',

                                            marginBottom: '.5vh',

                                            display: 'flex',

                                            justifyContent: 'center'

                                        },

                                        child: [



                                            buttonCont({

                                                text: 'Cancel',

                                                style: {

                                                    width: '50%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: () => {

                                                    retBox.remove()

                                                }

                                            }),

                                            buttonCont({

                                                text: 'Clear',

                                                style: {

                                                    width: '50%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: () => {

                                                    txt.value = ''

                                                }

                                            }),

                                            buttonCont({

                                                text: 'Submit',

                                                style: {

                                                    width: '50%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: async () => {

                                                    let loading = Waiting()

                                                    document.body.appendChild(loading)

                                                    const remove = () => {

                                                        loading.remove()

                                                    }

                                                    const form = new FormData()

                                                    form.append('correction', 'true')

                                                    form.append('docId', docId)

                                                    form.append('noteCorrection', txt.value)

                                                    await fetch('/approval', {

                                                        method: 'POST',

                                                        body: form

                                                    }).then(res => {

                                                        if (res.ok) {

                                                            remove()

                                                            return res.json()

                                                        }

                                                    })

                                                        .then(dat => {

                                                            if (dat.status) {

                                                                document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                                    window.location.reload()

                                                                }))

                                                            } else {

                                                                document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                                    window.location.reload()

                                                                }))

                                                            }

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

                                        backgroundImage: ' radial-gradient(rgba(100,100,100,0.5),black)',

                                        height: '100%',

                                        position: 'absolute',

                                        left: '0',

                                        top: '0',

                                        display: 'flex',

                                        justifyContent: 'center'

                                    },

                                    elementHandler: getRetBox,

                                    child: [

                                        $({

                                            tag: 'div',

                                            style: {

                                                width: '50%',

                                                height: 'fit-content',

                                                margin: 'auto',

                                                backgroundColor: '#555',

                                                border: 'solid thin deepskyblue',

                                                textAlign: 'center',

                                                boxShadow: '-.5vw 1vh .5vw black'

                                            },

                                            child: [

                                                $({

                                                    tag: 'div',

                                                    style: {

                                                        height: 'fit-content',

                                                        paddingTop: '1vh',

                                                        paddingBottom: '1vh',

                                                        width: '98%',

                                                        margin: 'auto',

                                                        fontFamily: 'arial black, sans-serif',

                                                        color: 'lightskyblue',

                                                        textAlign: 'left'

                                                    },

                                                    text: '" Specify the part of document that needs to be corrected "'

                                                }),

                                                inputBox,

                                                botC()

                                            ]

                                        })

                                    ]

                                }))

                            }



                            return ($({

                                tag: 'div',

                                style: {

                                    width: '30%',

                                    height: '100%',

                                    margin: 'auto',

                                },

                                child: [

                                    $({

                                        tag: 'div',

                                        style: {

                                            height: '75%',

                                            width: '100%',

                                            backgroundColor: 'rgba(0,0,0,0.3)',

                                            marginTop: '5%',

                                        },

                                        child: [

                                            fileName,

                                            Signatures(),

                                            Recommending()

                                        ]

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            height: '8%',

                                            width: '100%',

                                            backgroundColor: 'rgba(0,0,0,0.3)',

                                            marginTop: '5%',

                                            display: 'flex',

                                            justifyContent: 'center'

                                        },

                                        child: [

                                            buttonCont({

                                                text: 'ACCEPT',

                                                style: {

                                                    width: '50%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: async () => {

                                                    let loading = Waiting()

                                                    document.body.appendChild(loading)

                                                    const remove = () => {

                                                        loading.remove()

                                                    }

                                                    const form = new FormData()

                                                    form.append('forward', 'true')

                                                    form.append('docId', docId)

                                                    await fetch('/approval', {

                                                        method: 'POST',

                                                        body: form

                                                    }).then(res => {

                                                        if (res.ok) {

                                                            remove()

                                                            return res.json()

                                                        }

                                                    })

                                                        .then(dat => {

                                                            if (dat.status) {

                                                                document.body.appendChild(ConfirmationAlert("Saved successfully...!", () => {

                                                                    window.location.reload()

                                                                }))

                                                            } else {

                                                                document.body.appendChild(ConfirmationAlert("Saved successfully...!", () => {

                                                                    window.location.reload()

                                                                }))

                                                            }

                                                        })



                                                }

                                            }),

                                            buttonCont({

                                                text: 'RETURN',

                                                style: {

                                                    width: '50%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: () => {

                                                    viewP.appendChild(returnBox())

                                                }

                                            })

                                        ]

                                    }),

                                    $({

                                        tag: 'div',

                                        style: {

                                            height: '8%',

                                            width: '100%',

                                            marginTop: '5%',

                                            display: 'flex',

                                            justifyContent: 'center',

                                            cursor: 'pointer',

                                        },

                                        att: {

                                            className: 'closeCont botConFile',

                                        },

                                        child: [

                                            $({

                                                tag: 'div',

                                                style: {

                                                    fontSize: '1vw',

                                                    margin: 'auto'

                                                },

                                                att: {

                                                    className: 'fa-solid fa-right-from-bracket'

                                                },

                                                child: [

                                                    $({

                                                        tag: 'span',

                                                        style: {

                                                            fontFamily: 'arial black,sans-serif',

                                                        },

                                                        text: ' CLOSE'

                                                    })

                                                ]

                                            })

                                        ],

                                        event: {

                                            type: 'click',

                                            method: () => {

                                                viewP.remove()

                                            }

                                        }



                                    })

                                ]

                            }))

                        }

                        const Display = () => {

                            return ($({

                                tag: 'div',

                                style: {

                                    width: '68%',

                                    height: '99%',

                                    margin: 'auto',

                                    display: 'flex',

                                    justifyContent: 'cennter'

                                },

                                child: [

                                    $({

                                        tag: 'object',

                                        att: {

                                            type: 'application/pdf',

                                            data: file,

                                        },

                                        style: {

                                            width: '98%',

                                            height: '98%',

                                            margin: 'auto',

                                            toolbar: 'none'

                                        },

                                    })

                                ]

                            }))

                        }

                        return ($({

                            tag: 'div',

                            style: {

                                position: 'absolute',

                                width: '100%',

                                height: '100%',

                                top: '0',

                                left: '0',

                                backgroundColor: '#555',

                                justifyContent: 'center',

                                display: 'flex'

                            },

                            elementHandler: getViewPan,

                            child: [

                                ControlPart(),

                                Display()

                            ]

                        }))



                    }





                    return ($({

                        tag: 'div',

                        style: {

                            width: '100%',

                            height: '5vh',

                            backgroundColor: 'grey',

                            borderRadius: '0 0 .2vw .2vw',

                            display: 'flex',

                            justifyContent: 'center'

                        },

                        child: [

                            buttonCont({

                                text: 'View Document',

                                style: {

                                    width: 'fit-content',

                                    paddingLeft: '1vw',

                                    paddingRight: '1vw',

                                    fontFamily: 'arial black, sans-serif',

                                    margin: 'auto',

                                    marginLeft: '0',

                                    height: '100%',

                                    display: 'flex',

                                    justifyContent: 'center',

                                    borderRadius: '0 0 0 .2vw'

                                },

                                event: () => {

                                    mainComPanel.appendChild(viewPanel())

                                }

                            }),



                        ]

                    }))

                }

                return ($({

                    tag: 'div',

                    att: {

                        className: 'comFile',

                        id: docId

                    },

                    child: [

                        DatePanel,

                        Details,

                        Controller()

                    ]

                }))

            }



            const getBod = (body) => {

                bodyContent = body

                let receive = [];

                const checkId = (base, newResposeId) => {

                    for (const val of base) {

                        if (val === newResposeId) {

                            return false

                        }

                    }

                    return true

                }

                const getDocs = async () => {

                    const form = new FormData()

                    form.append('communication', 'true')

                    form.append('idList', JSON.stringify(receive))

                    let response = await fetch("/approval", {

                        method: 'POST',

                        body: form

                    });



                    if (response.status === 502) {

                        await getDocs();

                    } else if (response.status !== 200) {

                        alert(response.statusText)

                        // Reconnect in one second

                        await new Promise(resolve => setTimeout(resolve, 1000));

                        await getDocs();

                    } else {



                        let data = await response.json();

                        if (receive.length > 0) {

                            data.forEach(val => {

                                receive.push(val.id)

                                body.insertBefore(File({

                                    date: val.date,

                                    title: val.info,

                                    file: val.file,

                                    signatureList: val.signature,

                                    finalApp: val.approvalName,

                                    docType:val.docType

                                }), body.childNodes[0])



                            })

                        } else {

                            data.forEach(val => {

                                receive.push(val.id)

                                body.insertBefore(File({

                                    date: val.date,

                                    title: val.info,

                                    file: val.file,

                                    signatureList: val.signature,

                                    finalApp: val.approvalName,

                                    docType:val.docType,

                                    docId: val.id

                                }), body.childNodes[0])



                            })

                        }

                        setTimeout(async () => {

                            await getDocs();

                        }, 3000)

                    }



                }

                getDocs()



            }



            return ($({

                tag: 'div',

                style: {

                    width: '98%',

                    margin: '1vh auto auto',

                    height: '86%',

                    backgroundColor: 'rgb(10,10,10,0.3)',

                    overflowY: 'auto',

                    boxShadow: 'inset .3vw .3vw 2vh .5vh black'

                },

                elementHandler: getBod

            }))

        }



        return ($({

            tag: 'div',

            style: {

                width: '49.9%',

                height: '100%',

                backgroundColor: 'rgba(100,100,100,0.2)',

                margin: 'auto',

                marginLeft: '0',

            },

            child: [

                label,

                search,

                bodyPanel()

            ]



        }))

    }

    const Forwarded = () => {

        const label = $({

            tag: 'div',

            style: {

                height: 'fit-content',

                width: 'fit-content',

                fontFamily: 'arial black,sans-serif',

                color: '#bbb',

                margin: '1vh auto auto',

                fontSize: '1.2vw'

            },

            text: 'On Process Documents'

        })

        const searchEvent=(inputValue)=>{



        }

        const search = $({

            tag: 'div',

            style: {

                height: '4vh',

                width: 'fit-content',

                margin: '2vh auto auto',

                marginLeft: '2vw',

                borderBottom: 'solid thin rgba(100,100,100,0.3)',

                backgroundColor: 'rgba(0,0,0,0.2)',

                padding: '.2rem',

                borderRadius: '1vw',

                display: 'flex',

                justifyContent: 'center'

            },

            child: [

                $({

                    tag: 'div',

                    style: {

                        width: 'fit-content',

                        height: 'fit-content',

                        margin: 'auto'

                    },

                    child: [

                        $({

                            tag: 'span',

                            att: {

                                className: 'fa-solid fa-magnifying-glass'

                            },

                            style: {

                                color: 'deepskyblue',

                                fontSize: '1.5vw'

                            }

                        }),

                        $({

                            tag: 'input',

                            att: {

                                type: 'text',

                                className: 'searchInput',

                                placeholder: 'Search docs',
                                id: 'forwarded-search-input',
                                name: 'forwarded_search'

                            },

                            event:{

                                type:'input',

                                method:(event)=>{



                                    const child=bodyDocs.childNodes

                                    for(let x=0;x<child.length;x++){

                                        if((child[x].innerText.includes(event.target.value))||(child[x].id.includes(event.target.value))){

                                            child[x].style.display=''

                                        }else {

                                            child[x].style.display='none'

                                        }

                                    }

                                }

                            },

                            style: {

                                backgroundColor: 'transparent',

                                border: 'none',

                                outline: 'none',

                                paddingLeft: '.5vw',

                                paddingRight: '.5vw',

                                color: '#bbb',

                                height: '100%',

                                fontSize: '1.1vw'

                            }

                        })

                    ]

                })

            ]

        })

        const bodyPanel = () => {

            let idList = []

            const File = ({date, title, status, docState, file, signature, docId,office,senderId,docType}) => {

                const getFi=(el)=>{

                    if(status==='rejected'){

                        el.style.backgroundColor='rgba(50,0,0,0.3)',

                            el.style.borderColor='#500'

                    }

                    if(status==='approved'){

                        el.style.backgroundColor='rgba(0,0,0,0.5)',

                            el.style.borderColor='deepskyblue'

                    }

                }

                const buttonCont = ({text, event, style}) => {

                    return ($({

                        tag: 'div',

                        style: style,

                        att: {

                            className: 'botConFile',

                            innerHTML: `<div style="margin: auto;height: fit-content">${text}</div>`

                        },

                        event: {

                            type: 'click',

                            method: () => {

                                if (event) {

                                    event()

                                }

                            }

                        }

                    }))

                }

                const Date = $({

                    tag: 'div',

                    style: {

                        fontFamily: 'monospace',

                        color: 'deepskyblue',

                        margin: '1vh 1vh auto',

                        fontSize: '1.1vw'

                    },

                    text: date

                })

                const Title = () => {

                    const Icon = $({

                        tag: 'div',

                        att: {

                            className: 'fa-solid fa-file-pdf'

                        },

                        style: {

                            fontSize: '3vw',

                            margin: 'auto',

                            width: '10%',

                            textAlign: 'center'

                        }

                    })

                    const titleString = $({

                        tag: 'div',

                        style: {

                            fontFamily: 'arial,sans-serif',

                            color: '#ddd',

                            fontSize: '1vw',

                            margin: 'auto',

                            height: 'fit-content',

                            width: '88%',



                        },

                        text: `" ${title} "`

                    })

                    return ($({

                        tag: 'div',

                        style: {

                            width: '100%',

                            height: '10vh',

                            display: 'flex',

                            justifyContent: 'center',



                        },

                        child: [

                            Icon,

                            titleString

                        ]

                    }))

                }

                const Control = () => {

                    let up, viewD, notes,showState=false,elNote,content

                    const getUploader = (el) => {

                        up = el

                    }

                    const getViewDocs = (el) => {

                        viewD = el

                    }



                    const UploadResponse = () => {



                        const data={

                            fileName:'',

                            barcode:'',

                            file:''

                        }

                        const getData={

                            getFileName:(value)=>{

                                data.fileName=value

                            },

                            getFile:(value)=>{

                                data.file=value

                            },

                            getBarCode:(value)=>{

                                data.barcode=value

                            },

                        }



                        const uploadBox = () => {

                            const label = $({

                                tag: 'div',

                                text: 'Upload sign document',

                                style: {

                                    fontFamily: 'arial black, sans-serif',

                                    fontSize: '1.1vw',

                                    color: 'lightskyblue',

                                    width:'90%',

                                    margin:'1vh auto auto'

                                }

                            })

                            let leb

                            const getLe = (el) => [

                                leb = el

                            ]

                            let dataObject

                            const getObjectData=(el)=>{

                                dataObject=el

                            }





                            const upInput = $({

                                tag: 'div',

                                style: {

                                    width: '100%',

                                    height: 'fit-content',

                                    display:'flex',

                                    justifyContent:'center',

                                    margin:'auto'

                                },



                                child: [

                                    $({

                                        tag:'div',

                                        style:{

                                            position:'relative',

                                            height:'5vh',

                                            width:'45%',

                                            display:'flex',

                                            justifyContent:'center',

                                        },

                                        att:{

                                            className: 'uploadDiv'

                                        },

                                        child:[

                                            $({

                                                tag: 'div',

                                                text: 'Choose your file:   Upload scanned document for response',

                                                style: {

                                                    fontFamily: 'arial,sans-serif',

                                                    color: '#bbb',

                                                    fontSize: '1vw',

                                                    margin:'auto',

                                                },

                                                elementHandler: getLe

                                            }),

                                            $({

                                                tag: 'input',

                                                att: {

                                                    type: 'file',

                                                    accept:'application/pdf'

                                                },

                                                style: {

                                                    position: 'absolute',

                                                    opacity: '0',

                                                    left: '0',

                                                    top: '0',

                                                    width: '100%',

                                                    height: '100%',

                                                    cursor:'pointer'

                                                },

                                                event: {

                                                    type: 'input',

                                                    method: async (event) => {

                                                        //    alert(URL.createObjectURL(event.target.files[0]))

                                                        //   dataObject.data=URL.createObjectURL(event.target.files[0])

                                                        leb.innerText = event.target.files[0].name

                                                        leb.style.color='deepskyblue'

                                                        const div=$({tag:'div'})



                                                        const jsonData={

                                                            fileId:docId

                                                        }









                                                        new QRCode(div,{

                                                            correctLevel : QRCode.CorrectLevel.H,

                                                            text:'rde.capsu.edu.ph/view/'+docId

                                                        });





                                                        setTimeout(async ()=>{

                                                            let src=div.getElementsByTagName('img')[0]

                                                            //   alert(base64ToArrayBuffer(src.src.split(',')[1]))



                                                            getData.getFileName(event.target.value)

                                                            getData.getFile(event.target.files[0])





                                                            const pdf = PDFLib.PDFDocument;

                                                            let buffer = await fetch(URL.createObjectURL(event.target.files[0])).then((res) => res.arrayBuffer());

                                                            let pdfDoc = await pdf.load(buffer)





                                                            const pages = pdfDoc.getPages()



                                                            let barcodeBuffer = await pdfDoc.embedPng(src.src)



                                                            barcodeBuffer.width = 50

                                                            barcodeBuffer.height = 50

                                                            const firstPage = pages[0]

                                                            const {w,h}=firstPage.getSize()



                                                            firstPage.drawImage(barcodeBuffer, {

                                                                x: 430,

                                                                y: 5,

                                                            })

                                                            //firstPage.drawImage(barcodeBuffer, {

                                                            //                                                                 x: 7,

                                                            //                                                                 y: 25,

                                                            //                                                             })

                                                            let buffDocs=await pdfDoc.saveAsBase64({dataUri: true})



                                                            getData.getFile(dataURLtoFile(buffDocs,`${office}.pdf`))

                                                            dataObject.data = buffDocs



                                                        },500)





                                                    }

                                                }

                                            }),

                                        ]

                                    }),

                                    $({

                                        tag:'div',

                                        style:{

                                            width:'45%',

                                            margin:'auto',

                                            height:'5vh',

                                            display:'flex',

                                            justifyContent:'center'

                                        },

                                        att:{

                                            className: 'uploadDiv'

                                        },

                                        child:[

                                            $({

                                                tag:'div',

                                                att:{

                                                    className:'fa-solid fa-barcode'

                                                },

                                                style:{

                                                    margin:'auto',

                                                    color:'deepskyblue',

                                                    fontSize:'1.5vw',

                                                    paddingLeft:'1vw',

                                                }

                                            }),

                                            $({

                                                tag:'input',

                                                att:{

                                                    type:'text',

                                                    placeholder:'Enter Barcode'

                                                },

                                                style:{

                                                    width:'100%',

                                                    backgroundColor:'transparent',

                                                    border:'none',

                                                    outline:'none',

                                                    height:'100%',

                                                    fontSize:'1.3vw',

                                                    textAlign:'center',

                                                    paddingLeft:'1vw',

                                                    paddingRight:'1vw',

                                                    color:'#bbb'

                                                },

                                                event:{

                                                    type:'input',

                                                    method:(event)=>{

                                                        getData.getBarCode(event.target.value)

                                                    }

                                                }

                                            })

                                        ]

                                    })

                                ]

                            })

                            const docViewer=()=>{

                                return($({

                                    tag:'div',

                                    style:{

                                        height:'72vh',

                                        width:'98%',

                                        backgroundColor:'#444',

                                        margin:'auto'

                                    },

                                    child:[

                                        $({

                                            tag:'object',

                                            att:{

                                                type:'application/pdf'

                                            },

                                            elementHandler:getObjectData,

                                            style:{

                                                width:'100%',

                                                height:'100%'

                                            }

                                        })

                                    ]

                                }))

                            }

                            return ($({

                                tag: 'div',

                                style: {

                                    width: '90%',

                                    height: 'fit-content',

                                    backgroundColor: '#555',

                                    border: 'solid thin deepskyblue',

                                    margin: 'auto',

                                    boxShadow: '-.5vw 1vh .5vw black',

                                    paddingTop:'.5rem',

                                },

                                child: [

                                    docViewer(),

                                    label,

                                    upInput,

                                    $({

                                        tag: 'div',

                                        style: {

                                            height: '5vh',

                                            backgroundColor: 'grey',

                                            width: '100%',

                                            display: 'flex',

                                            justifyContent: 'center'

                                        },

                                        child: [

                                            buttonCont({

                                                text: 'CANCEL',

                                                style: {

                                                    width: '100%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: () => {

                                                    up.remove()

                                                }

                                            }),

                                            buttonCont({

                                                text: 'SUBMIT',

                                                style: {

                                                    width: '100%',

                                                    paddingLeft: '1vw',

                                                    paddingRight: '1vw',

                                                    fontFamily: 'arial black, sans-serif',

                                                    margin: 'auto',

                                                    height: '100%',

                                                    display: 'flex',

                                                    justifyContent: 'center',

                                                    fontSize: '1vw'

                                                },

                                                event: async ()=>{

                                                    alert(docType)

                                                    if(data.barcode===docId){

                                                        if(confirm(`Upload this file: ${data.fileName}`)){

                                                            let loading = Waiting()

                                                            document.body.appendChild(loading)

                                                            const remove = () => {

                                                                loading.remove()

                                                            }

                                                            const form= new FormData()

                                                            form.append('responseDocument','true')

                                                            form.append('title',title)

                                                            form.append('fileName',data.fileName)

                                                            form.append('file',data.file)

                                                            form.append('docId',docId)

                                                            form.append('campus',office)

                                                            form.append('sender',senderId)

                                                            form.append('docuType',docType)

                                                            await fetch('/approval',{

                                                                method:'POST',

                                                                body:form

                                                            }).then(res => {

                                                                if (res.ok) {

                                                                    remove()

                                                                    return res.json()

                                                                }

                                                            }).then(dat => {

                                                                if (dat.status) {

                                                                    document.body.appendChild(ConfirmationAlert("Responded successful..!", () => {

                                                                        window.location.reload()

                                                                    }))

                                                                } else {

                                                                    document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                                        window.location.reload()

                                                                    }))

                                                                }

                                                            })

                                                        }

                                                    }else {

                                                        alert("Barcode not match...!")

                                                    }

                                                }

                                            })

                                        ]

                                    })

                                ]

                            }))

                        }



                        return ($({

                            tag: 'div',

                            style: {

                                width: '100%',

                                height: '100%',

                                position: 'absolute',

                                left: '0',

                                top: '0',

                                backgroundImage: ' radial-gradient(rgba(100,100,100,0.5),black)',

                                display: 'flex',

                                justifyContent: 'center'

                            },

                            child: [

                                uploadBox()

                            ],

                            elementHandler: getUploader

                        }))

                    }



                    const getNotePerUser=(notePerUserEl)=>{

                        elNote=notePerUserEl

                    }



                    const getNote = (el) => {

                        notes = el

                    }

                    const getnoteContent=(el)=>{

                        content=el

                    }



                    const ViewDocs = () => {



                        let bitMap

                        const notePerUser = ({name, noteText}) => {



                            const noteName = $({

                                tag: 'div',

                                text: name,

                                style: {

                                    fontFamily: 'arial,sans-serif',

                                    fontSize: '1vw',

                                    color: 'deepskyblue',

                                    textAlign:'left',

                                }

                            })



                            const text = $({

                                tag: 'div',

                                style: {

                                    fontFamily: 'monospace',

                                    fontSize: '1vw',

                                    textAlign:'left',

                                    textIndent:'1vw'

                                },

                                text: (noteText !== '') ? `" ${noteText} "` : 'No Comments...!'

                            })







                            return ($({

                                tag: 'div',

                                style: {

                                    margin:'auto',

                                    backgroundColor: '#444',

                                    marginTop:'1vh',

                                    marginBottom: '1vh',

                                    padding:'.3rem',

                                },

                                elementHandler:getNotePerUser,

                                child: [

                                    noteName,

                                    text,

                                ]

                            }))

                        }









                        const getObject = async (object) => {

                            const pdf = PDFLib.PDFDocument;



                            let buffer = await fetch('/' + file).then((res) => res.arrayBuffer());



                            let pdfDoc = await pdf.load(buffer)



                            const pages = pdfDoc.getPages()

                            let barcode=TextToBase64Barcode(docId,{

                                format:'code128',

                                displayValue:false

                            })

                            let barcodeBuffer = await pdfDoc.embedPng(barcode)



                            barcodeBuffer.width = 100

                            barcodeBuffer.height = 15

                            const firstPage = pages[0]



                            firstPage.drawImage(barcodeBuffer, {

                                x: 5,

                                y: 5,

                            })

                            for (const val of signature) {



                                if (val.note !== null || val !== '') {

                                    notes.appendChild(notePerUser({

                                        name: val.fullName,

                                        noteText: val.note

                                    }))

                                }

                                if (val.signUrl!==null) {

                                    let signatuireBuffer = await fetch(val.signUrl.replace('..', '')).then((res) => res.arrayBuffer());



                                    let eSign = await pdfDoc.embedPng(signatuireBuffer)



                                    eSign.width = val.scale

                                    eSign.height = val.scale

                                    const firstPage = pages[val.signPage * 1 - 1]

                                    const {width, height} = firstPage.getSize()

                                    firstPage.drawImage(eSign, {

                                        x: width * val.signLeft - (eSign.width / 2),

                                        y: height - (height * val.signTop) - (eSign.height / 2),

                                    })

                                }

                            }

                            bitMap = await pdfDoc.saveAsBase64({dataUri: true})

                            object.data = bitMap

                        }







                        return ($({

                            tag: 'div',

                            style: {

                                position: 'absolute',

                                left: '0',

                                top: '0',

                                height: '100%',

                                width: '100%',

                                textAlign: 'center',

                                display: 'flex',

                                justifyContent: 'center',

                                backgroundColor: '#333',

                            },

                            elementHandler: getViewDocs,

                            child: [

                                $({

                                    tag: 'div',

                                    style: {

                                        height: '100%',

                                        width: '9%',

                                        position: 'relative',

                                    },

                                    child: [

                                        $({

                                            tag: 'div',

                                            style: {

                                                width:'100%',

                                                maxHeight: '70vh',

                                                backgroundColor: '#555',

                                                paddingTop: '1vh',

                                                paddingBottom: '1vh',

                                                position: 'absolute',

                                                margin:'auto',

                                            },

                                            elementHandler:getnoteContent,



                                            child:[

                                                $({

                                                    tag:'div',

                                                    style:{

                                                        width:'100%',

                                                        height:'100%',

                                                        margin:'auto'

                                                    },

                                                    child:[

                                                        $({

                                                            tag:'div',

                                                            style:{

                                                                marginLeft:'0',

                                                                cursor:'pointer',

                                                                fontSize:'2vw',

                                                                display:'block',

                                                                width:'fit-content',

                                                                height:'100%',

                                                                textAlign:'center',

                                                                margin:'auto',

                                                                padding:'.2rem'

                                                            },

                                                            att:{

                                                                className:'fa-solid fa-bars barmenu'

                                                            },

                                                            event:{

                                                                type:'click',

                                                                method:()=>{



                                                                    showState=!showState

                                                                    if(showState){

                                                                        notes.className+=" showStateHide";

                                                                        content.style.width='fit-content'

                                                                    }else {

                                                                        notes.className= notes.className.replace(" showStateHide","")

                                                                        content.style.width='100%'

                                                                    }

                                                                }

                                                            }

                                                        })

                                                    ]

                                                }),

                                                $({

                                                    tag:'div',

                                                    att:{

                                                        className:'burger'

                                                    },

                                                    elementHandler: getNote,

                                                })

                                            ],





                                        }),

                                        $({

                                            tag: 'a',

                                            style: {

                                                fontFamily: 'arial black,sans-serif',

                                                fontSize: '1.3vw',

                                                color: 'deepskyblue',

                                                margin: 'auto',

                                                cursor: 'pointer',

                                                backgroundColor: '#555',

                                                position: 'absolute',

                                                bottom: '11vh',

                                                width: '100%',

                                                display: 'flex',

                                                justifyContent: 'center',

                                                height: '10vh'

                                            },

                                            event: {

                                                type: 'click',

                                                method: (event) => {

                                                    event.target.download = `[${date}-title].pdf`

                                                    event.target.href = bitMap

                                                }

                                            },

                                            child: [

                                                $({

                                                    tag: 'div',

                                                    style: {

                                                        margin: 'auto'

                                                    },

                                                    att: {

                                                        className: "fa-solid fa-print",

                                                        innerHTML: `<span style="font-family: 'Arial Black', sans-serif"> Print</span>`

                                                    },

                                                }),



                                            ]

                                        }),

                                        $({

                                            tag: 'div',

                                            style: {

                                                fontFamily: 'arial black,sans-serif',

                                                fontSize: '1.3vw',

                                                color: 'deepskyblue',

                                                margin: 'auto',

                                                cursor: 'pointer',

                                                backgroundColor: '#555',

                                                position: 'absolute',

                                                bottom: '0',

                                                width: '100%',

                                                display: 'flex',

                                                justifyContent: 'center',

                                                height: '10vh'

                                            },

                                            att: {

                                                innerHTML: '<div style="margin: auto">CLOSE</div>'

                                            },

                                            event: {

                                                type: 'click',

                                                method: () => {

                                                    viewD.remove()

                                                }

                                            }

                                        }),



                                    ]

                                }),

                                $({

                                    tag: 'object',

                                    style: {

                                        width: '90%',

                                        height: '100%',

                                        margin: 'auto',

                                        borderLeft: 'solid thin rgba(200,200,200,0.3)'

                                    },



                                    elementHandler: getObject,

                                    att: {

                                        id: docId,

                                        type: 'application/pdf'

                                    },



                                })

                            ]

                        }))

                    }



                    return ($({

                        tag: 'div',

                        style: {

                            height: '5vh',

                            width: '100%',

                            justifyContent: 'center',

                            display: 'flex',

                            borderRadius: '0 0 .5vw .5vw'

                        },

                        child: [

                            buttonCont({

                                text: 'View Docs',

                                style: {

                                    width: '100%',

                                    paddingLeft: '1vw',

                                    paddingRight: '1vw',

                                    fontFamily: 'arial black, sans-serif',

                                    margin: 'auto',

                                    height: '100%',

                                    display: 'flex',

                                    justifyContent: 'center',

                                    fontSize: '1vw',

                                    borderRadius: '0 0 0 .5vw'

                                },

                                event: () => {

                                    mainComPanel.appendChild(ViewDocs())

                                }

                            }),

                            buttonCont({

                                text: (status === 'rejected') ? 'Delete' : 'Response',

                                style: {

                                    width: '100%',

                                    paddingLeft: '1vw',

                                    paddingRight: '1vw',

                                    fontFamily: 'arial black, sans-serif',

                                    margin: 'auto',

                                    height: '100%',

                                    display: 'flex',

                                    justifyContent: 'center',

                                    fontSize: '1vw'

                                },

                                event: async () => {

                                    if (status === 'approved') {

                                        mainComPanel.appendChild(UploadResponse())

                                    }

                                    if (status === 'rejected') {

                                        if (confirm("Are you sure you want to delete this file? ")){

                                            let loading = Waiting()

                                            document.body.appendChild(loading)

                                            const remove = () => {

                                                loading.remove()

                                            }

                                            const form=new FormData();

                                            form.append('deleteApprovalFile', 'true')

                                            form.append('docId',docId)

                                            form.append('fileUrl',file)

                                            await fetch('/sampUp', {

                                                method:"POST",

                                                body:form

                                            }).then(res => {

                                                if (res.ok) {

                                                    remove()

                                                    return res.json()

                                                }

                                            }).then(dat => {

                                                    if (dat.status) {

                                                        document.body.appendChild(ConfirmationAlert("Deleted..!", () => {

                                                            window.location.reload()

                                                        }))

                                                    } else {

                                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                            window.location.reload()

                                                        }))

                                                    }

                                                })

                                        }

                                    }

                                    if(status==='forwarded'){

                                        alert("Still on process..")

                                    }



                                }

                            }),

                            buttonCont({

                                text: 'Remove',

                                style: {

                                    width: '100%',

                                    paddingLeft: '1vw',

                                    paddingRight: '1vw',

                                    fontFamily: 'arial black, sans-serif',

                                    margin: 'auto',

                                    height: '100%',

                                    display: 'flex',

                                    justifyContent: 'center',

                                    fontSize: '1vw',

                                    borderRadius: '0 0 .5vw 0'

                                },

                                event: async () => {

                                    const reqForm=new FormData()

                                    reqForm.append('checkState',docId)

                                    await fetch('/approval',{

                                        method:'POST',

                                        body:reqForm

                                    }).then(res=>res.json())

                                        .then(async data=>{

                                            if(data.status){

                                                if(confirm("Do you want to remove this document..?")){

                                                    let loading = Waiting()

                                                    document.body.appendChild(loading)

                                                    const remove = () => {

                                                        loading.remove()

                                                    }

                                                    const form = new FormData();

                                                    form.append('docId',docId)

                                                    form.append('removeQueDocs', 'true')



                                                    await fetch('/approval', {

                                                        method: 'POST',

                                                        body: form

                                                    }).then(res => {

                                                        if (res.ok) {

                                                            remove()

                                                            return res.json()

                                                        }

                                                    }).then(dat => {

                                                        if (dat.status) {

                                                            document.body.appendChild(ConfirmationAlert("Document was successfully removed..!", () => {

                                                                window.location.reload()

                                                            }))

                                                        } else {

                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                                window.location.reload()

                                                            }))

                                                        }

                                                    })

                                                }

                                            }else {

                                                alert(data.message)

                                            }

                                        })



                                }

                            }),

                            buttonCont({

                                text: 'Cancel',

                                style: {

                                    width: '100%',

                                    paddingLeft: '1vw',

                                    paddingRight: '1vw',

                                    fontFamily: 'arial black, sans-serif',

                                    margin: 'auto',

                                    height: '100%',

                                    display: 'flex',

                                    justifyContent: 'center',

                                    fontSize: '1vw',

                                    borderRadius: '0 0 .5vw 0'

                                },

                                event:async ()=>{

                                    if(confirm("Are you want to cancel this document?")){

                                        let loading = Waiting()

                                        document.body.appendChild(loading)

                                        const remove = () => {

                                            loading.remove()

                                        }

                                        const form= new FormData()

                                        form.append('docsCancel','true')

                                        form.append('docId',docId)

                                        await fetch('/approval',{

                                            method:'POST',

                                            body:form

                                        }).then(res => {

                                            if (res.ok) {

                                                remove()

                                                return res.json()

                                            }

                                        }).then(dat => {

                                            if (dat.status) {

                                                document.body.appendChild(ConfirmationAlert("Document Canceled..!", () => {

                                                    window.location.reload()

                                                }))

                                            } else {

                                                document.body.appendChild(ConfirmationAlert(dat.message, () => {

                                                    window.location.reload()

                                                }))

                                            }

                                        })

                                    }

                                }

                            }),

                        ]

                    }))

                }

                return ($({

                    tag: 'div',

                    att: {

                        className: 'comFile',

                        id:docId

                    },

                    style: {

                        width: '95%',

                        color: '#888',

                        margin: '1vh auto',

                        borderRadius: '.5vw',

                    },

                    elementHandler:getFi,

                    child: [

                        Date,

                        Title(),

                        Control()

                    ]

                }))

            }



            const getBody = async (bodEl) => {

                bodyDocs=bodEl

                const form = new FormData()

                form.append('idList', JSON.stringify(idList))

                form.append('responseUpload', 'true')

                await fetch('/approval', {

                    method: 'POST',

                    body: form

                }).then(res => res.json())

                    .then(data => {

                        data.forEach(val => {

                            bodEl.appendChild(File({

                                date: val.date,

                                status: val.status,

                                title: val.info,

                                docId: val.id,

                                signature: val.signature,

                                file: val.file,

                                office:val.office,

                                senderId:val.senderId,

                                docType:val.docType

                            }))

                        })

                    })

            }

            return ($({

                tag: 'div',

                style: {

                    width: '98%',

                    margin: '1vh auto auto',

                    height: '86%',

                    backgroundColor: 'rgb(10,10,10,0.3)',

                    overflowY: 'auto',

                    boxShadow: 'inset .3vw .3vw 2vh .1vh black'

                },

                elementHandler: getBody

            }))

        }

        return ($({

            tag: 'div',

            style: {

                width: '49.9%',

                height: '100%',

                backgroundColor: 'rgba(100,100,100,0.2)',

                margin: 'auto',

                marginRight: '0'

            },

            child: [

                label,

                search,

                bodyPanel()

            ]

        }))

    }



    return ($({

        tag: 'div',

        style: {

            width: '100%',

            height: '100%',

            margin: 'auto',

            display: 'flex',

            justifyContent: 'center',

            position: 'relative'

        },

        elementHandler: getComPanel,

        child: [

            Incoming(),

            Forwarded()

        ]



    }))

}


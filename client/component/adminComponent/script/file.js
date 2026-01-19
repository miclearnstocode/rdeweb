import {$, CapsuOffice, MONTHS, Request, TimeConvert, Waiting} from '../../../lib/lib.js'
import {Error} from "../../../error.js";


const Communication = () => {
    let mainListBod,mainCon
    let docType='All Documents'
    const fileRes = ({id, campus, title, date,fileUrl}) => {

        const mnth = MONTHS
        let dateFull = ''
        let arrayDate = date.split('-')
        for (let x = 0; x < mnth.length; x++) {
            if (x === (arrayDate[1] - 1)) {
                dateFull = `${mnth[x]} - ${arrayDate[2]} - ${arrayDate[0]}`
                break;
            }
        }


        const log = ({text, width, textDir}) => {
            return ($({
                tag: 'div',
                style: {
                    width: width,
                    display: 'flex',
                    justifyContent: 'center',
                    height: '95%',
                    margin: 'auto',
                },
                child: [
                    $({
                        tag: 'div',
                        text: text,
                        style: {
                            fontFamily: "arial,sans-serif",
                            fontSize: '1vw',
                            margin: 'auto',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '100%',
                        },
                        elementHandler: (el) => {
                            if (textDir) {
                                el.style.textAlign = textDir
                                el.style.textIndent = '1vw'
                            } else {
                                el.style.textAlign = 'center'
                            }
                        }
                    })
                ]
            }))
        }

        const FileView=(url)=>{
            let me
            const Close=()=>{
                return($({
                    tag:'div',
                    style:{
                        height:'fit-content',
                        width:'fit-content',
                        padding:'.5rem',
                        position:'absolute',
                        left:'-3.5vw',
                        top:'-.5vh',
                        fontSize:'2vw',
                        color:'deepskyblue',
                        borderRadius:'50%',
                        cursor:'pointer'
                    },
                    att:{
                        className:'fa-solid fa-circle-xmark'
                    },
                    event:{
                        type:'click',
                        method:()=>{
                            me.remove()
                        }
                    }
                }))
            }
            return($({
                tag:'div',
                style:{
                    width:'100%',
                    height:'100%',
                    position:'absolute',
                    left:'0',
                    top: '0',
                    backgroundImage:' radial-gradient(rgba(100,100,100,0.5),black)',
                    display:'flex',
                    justifyContent:'center'
                },
                child:[
                    $({
                        tag:'div',
                        style:{
                            width:'fit-content',
                            height:'fit-content',
                            position:'relative',
                            padding:'.5rem',
                            border:'solid thin #666',
                            margin:'auto'
                        },
                        child:[
                            $({
                                tag:'object',
                                att:{
                                    type:'application/pdf',
                                    data:'/'+url
                                },
                                style:{
                                    width:'70vw',
                                    height:'80vh'
                                },

                            }),
                            Close()
                        ]
                    })
                ],
                elementHandler:(el)=>{
                    me=el
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '1vw',
                fontFamily: 'arial,sans-serif',
                paddingTop: '1vh',
                paddingBottom: '1vh',
                marginTop: '.5vh',
                marginBottom: '.5vh'
            },
            att: {
                id: id
            },
            elementHandler: (el) => {
                el.style.color = '#bbb'
                el.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = 'rgba(0,0,0,0.3)'
                    this.style.transition = '.3s'
                    this.style.color = 'deepskyblue'
                })
                el.addEventListener('mouseleave', function () {
                    this.style.backgroundColor = 'transparent'
                    this.style.transition = '.3s'
                    this.style.color = '#bbb'
                })
            },
            child: [
                log({
                    text: dateFull,
                    width: '12%',
                }),
                log({
                    text: campus,
                    width: '20%'
                }),
                log({
                    text: title,
                    width: '60%',
                    textDir: 'left'
                }),
                $({
                    tag:'div',
                    style:{
                        width:'9%',
                        display:'flex',
                        justifyContent:'center'
                    },
                    child:[
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-trash-can'
                            },
                            style:{
                                margin:'auto',
                                cursor:'pointer'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    if(confirm("Do you want to delete this file?\n This process cannot be undone.")){
                                        const req= new Request('/communication')
                                        req.Post([
                                            {
                                                name:'deleteapprovalDocs',
                                                value:'0'
                                            },
                                            {
                                                name:'docId',
                                                value:id
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            if(data.status){
                                                window.location.reload()
                                            }else {
                                                alert(data.message)
                                            }
                                        })
                                    }


                                }
                            }
                        }),
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-folder-open'
                            },
                            style:{
                                margin:'auto',
                                cursor:'pointer',
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    mainCon.appendChild(FileView(fileUrl))
                                }
                            }
                        })
                    ]
                })
            ]
        }))
    }
    const headFilter = () => {
        return ($({
            tag: 'div',
            style: {
                height: '10vh',
                width: '100%',
                display:'flex',
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        height:'fit-content',
                        display:'flex',
                        border:'solid thin rgba(100,100,100,0.8)',
                        borderRadius:'.5vw',
                        padding:'.5rem',
                        margin:'auto',
                        marginLeft:'2vw',
                        backgroundColor:'rgba(0,0,0,0.2)'
                    },
                    child:[
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-magnifying-glass'
                            },
                            style:{
                                color:'#888',
                                fontSize:'1.4vw'
                            }
                        }),
                        $({
                            tag:'input',
                            style:{
                                width:'25vw',
                                border:'none',
                                outline:'none',
                                backgroundColor:'transparent',
                                marginLeft:'.5vw',
                                color:'#bbb',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw'
                            },
                            att:{
                                placeholder:'Enter text here...'
                            },
                            elementHandler:(el)=>{
                                setTimeout(()=>{
                                    el.focus()
                                },50)
                            },
                            event:{
                                type:'input',
                                method:(eve)=>{
                                   const list=mainListBod.childNodes
                                    for (const val of list) {
                                        if(!val.innerText.toUpperCase().includes(eve.target.value.toUpperCase())){
                                            val.style.display='flex'
                                        }else {
                                            val.style.display='none'
                                        }
                                    }
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag:'div',
                    style:{
                        width:'fit-content',
                        height:'fit-content',
                        display:'flex',
                        border:'solid thin rgba(100,100,100,0.8)',
                        borderRadius:'.5vw',
                        padding:'.5rem',
                        margin:'auto',
                        backgroundColor:'rgba(0,0,0,0.2)'
                    },
                    child:[
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-file-zipper',
                                title:'Download all'
                            },
                            style:{
                                color:'#888',
                                fontSize:'1.4vw',
                                cursor:'pointer',
                                marginRight:'1.5vw',
                                marginLeft:'1vw',
                                border:'solid thin rgba(100,100,100,0.8)',
                                padding:'.2rem'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    if(confirm("Download all documents?")){

                                    }
                                }
                            }
                        }),
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-arrows-rotate'
                            },
                            style:{
                                color:'#888',
                                fontSize:'1.4vw',
                                cursor:'pointer',
                                margin:'auto'
                            },
                            event:{
                                type:'click',
                                method:async ()=>{
                                    mainListBod.innerHTML=''
                                    const req= new Request('/communication')

                                    if(docType!=='All Documents'){
                                        req.Post([
                                            {
                                                name:'communicationFilter',
                                                value:'1'
                                            },
                                            {
                                                name:'docType',
                                                value: docType
                                            }
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            data.reverse().forEach(val => {
                                                mainListBod.appendChild(fileRes({
                                                    id: val.docid,
                                                    campus: val.campus,
                                                    title: val.title,
                                                    date: val.date.split(' ')[0],
                                                    fileUrl:val.file
                                                }))
                                            })
                                        })
                                    }else {
                                        req.Post([
                                            {
                                                name:'communicationRequest',
                                                value:'1'
                                            },
                                        ])
                                        req.Json()
                                        req.Send().then(data=>{
                                            data.reverse().forEach(val => {
                                                mainListBod.appendChild(fileRes({
                                                    id: val.docid,
                                                    campus: val.campus,
                                                    title: val.title,
                                                    date: val.date.split(' ')[0],
                                                    fileUrl:val.file
                                                }))
                                            })
                                        })
                                    }
                                }
                            }
                        }),
                        $({
                            tag:'select',
                            style:{
                                width:'25vw',
                                border:'none',
                                outline:'none',
                                backgroundColor:'transparent',
                                marginLeft:'.5vw',
                                color:'#bbb',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontSize:'1vw'
                            },
                            elementHandler:(el)=>{
                                el.appendChild($({
                                    tag:'option',
                                    text:'All Documents',
                                    att:{
                                        selected:true,
                                        id:'0'
                                    },
                                    style:{
                                        backgroundColor:'#333'
                                    }
                                }))
                                const req= new Request('/getDocType')
                                req.Post([
                                    {
                                        name:'getDoctype',
                                        value:'1'
                                    }
                                ])
                                req.Json()
                                req.Send().then(data =>{
                                    data.forEach(val=>{
                                        el.appendChild($({
                                            tag:'option',
                                            att:{
                                                id:val.id,
                                                innerText:val.name
                                            },
                                            style:{
                                                backgroundColor:'#333'
                                            }
                                        }))
                                    })
                                })
                            },
                            event:{
                                type:'change',
                                method:(eve)=>{
                                    docType=eve.target.value
                                }
                            }
                        })
                    ]
                })
            ]

        }))
    }


    const fileBody = () => {

        const label = (text, width) => {
            return ($({
                tag: 'div',
                style: {
                    width: width,
                    display: 'flex',
                    justifyContent: 'center',
                    height: '95%',
                    border: 'solid thin rgba(100,100,100,0.8)',
                    margin: 'auto'
                },
                child: [
                    $({
                        tag: 'div',
                        text: text,
                        style: {
                            color: '#888',
                            fontFamily: "arial,sans-serif",
                            fontSize: '1vw',
                            fontWeight: 'bolder',
                            margin: 'auto'
                        }
                    })
                ]
            }))
        }
        const headLabel = $({
            tag: 'div',
            style: {
                width: '95%',
                height: '5vh',
                backgroundColor: '#333',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'center'
            },
            child: [
                label("Date", '12%'),
                label("Campus/Office", '20%'),
                label("Title", '68%'),
            ]
        })



        const bodContent = $({
            tag: 'div',
            style: {
                height: '74vh',
                width: '95%',
                margin: 'auto',
                backgroundColor: '#222',
                overflowY: 'auto',

            },
            elementHandler: async (el) => {
                mainListBod=el
                const form = new FormData()
                form.append('communicationRequest', 'true')
                await fetch('/communication', {
                    method: 'POST',
                    body: form
                }).then(res => res.json())
                    .then(data => {

                        data.reverse().forEach(val => {
                            el.appendChild(fileRes({
                                id: val.docid,
                                campus: val.campus,
                                title: val.title,
                                date: val.date.split(' ')[0],
                                fileUrl:val.file
                            }))
                        })
                    })
            }
        })
        return ($({
            tag: 'div',
            style: {
                height: '78vh',
                width: '100%',
                position:'relative'
            },
            child: [
                headLabel,
                bodContent
            ],
            elementHandler:(el)=>{

            }
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            position:'relative',
        },
        elementHandler:(el)=>{
            mainCon=el
        },
        child: [
            headFilter(),
            fileBody()
        ]
    }))
}


///=================================================================================================================================


const SystemFile = () => {
    let main

    const viewDoc=({fileUrl})=>{
        let mainView
        return($({
            tag:'div',
            style:{
                position: 'absolute',
                width:'100%',
                height:'100%',
                left:'0',
                top:'0',
                zIndex:'9999',
                backgroundColor:'#222',
                display:'flex',
                justifyContent:'center'
            },
            elementHandler:(el)=>{
                mainView=el
            },
            child:[
                $({
                    tag:'div',
                    style:{
                        width:'80%',
                        height:'95%',
                        margin:'auto',
                        border:'solid thin deepskyblue',
                        position:'relative',
                        display:'flex',
                        padding:'1rem'
                    },
                    child:[
                        $({
                            tag:"div",
                            att:{
                                className:'fa-solid fa-circle-xmark'
                            },
                            style:{
                                fontSize:'1.5vw',
                                position:'absolute',
                                border:'solid thin deepskyblue',
                                padding:'.5rem',
                                borderRadius:'.5vw',
                                cursor:'pointer',
                                left: '-3vw',
                                color:'deepskyblue'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    mainView.remove()
                                }
                            }
                        }),
                        $({
                            tag:'object',
                            att:{
                                type:'application/pdf',
                                data:'/'+fileUrl
                            },
                            style:{
                                width:'100%',
                                height:'100%'
                            }
                        })
                    ]

                })
            ]
        }))
    }
    const docListView = (id) => {
        let scrollBody

        const document=(campus,author,category,docId)=>{
            const content=(label,width)=>{
                return($({
                    tag:'div',
                    style:{
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1vw',
                        color:'#bbb',
                        width:width,
                        height:'fit-content',
                        display:'flex',
                        paddingTop:'.5rem',
                        paddingBottom:'.5rem'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                margin:'auto',
                                textAlign:'left',
                                marginLeft:'.5vw'
                            },
                            text:label
                        })
                    ]
                }))
            }
            return($({
                tag:'div',
                style:{
                    display:'flex',
                    width:'100%',
                    margin:'.5vh auto',
                    cursor:'pointer'
                },
                att:{
                    className:'docsList'
                },
                child:[
                    content(campus,'30%'),
                    content(author,'40%'),
                    content(category,'30%')
                ],
                event:{
                    type:'click',
                    method:()=>{
                        const req= new Request('/loader')
                        req.Post([
                            {name:'docViewRequest',value:'0'},
                            {name:'docId',value:docId}
                        ])
                        req.Json()
                        req.Send().then(data=>{
                            main.appendChild(viewDoc({
                                fileUrl:data.file
                            }))
                        })
                            .catch(err=>{
                                console.log(err)
                            })
                    }
                }
            }))
        }

        const scrollList = () => {

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '86%',
                    overflowY: 'auto',
                },
                elementHandler: (el) => {
                    scrollBody=el
                    const req = new Request('/loader')
                    req.Post([
                        {name: 'docPerEvent', value: '0'},
                        {name: 'eventId', value: id}
                    ])
                    req.Json()
                    req.Send().then(data => {
                        data.forEach(val=>{
                            el.appendChild(document(val.campus,val.author,val.category,val.docid))
                        })
                    })
                        .catch(err => {
                            console.log(err)
                        })
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                height: '69vh',
                width: '100%',
                backgroundColor: '#333'
            },
            elementHandler: (el) => {
                el.appendChild($({
                    tag: 'div',
                    style: {
                        height: 'fit-content',
                        width: '100%',
                        display: 'flex',
                        borderBottom: 'solid thin rgba(200,200,200,0.2)',
                        paddingBottom: '1vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                height: 'fit-content',
                                padding: '.5rem',
                                border: 'solid thin g#555',
                                display: 'flex',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                marginLeft: '1vw',
                                marginTop: '1vh',

                                borderRadius: '.5vw'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-magnifying-glass'
                                    },
                                    style: {
                                        fontSize: '1.2vw',
                                        color: '#bbb',
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'search',
                                        placeholder: 'Search document'
                                    },
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        width: '20vw',
                                        fontSize: '1vw',
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        marginLeft: '.5vw',
                                        color: '#bbb',

                                    },
                                    event:{
                                        type:'input',
                                        method:(event)=>{
                                            scrollBody.childNodes.forEach(val=>{
                                                let child=val.innerText.toUpperCase()
                                                let inputChar=event.target.value.toUpperCase()
                                                if(child.includes(inputChar)){
                                                    val.style.display='flex'
                                                } else {
                                                    val.style.display='none'
                                                }
                                                if(event.target.value===''){
                                                    val.style.display='flex'
                                                }
                                            })
                                        }
                                    },
                                    elementHandler: (el) => {
                                        setTimeout(() => {
                                            el.focus()
                                        }, 50)
                                    }
                                })
                            ]
                        }),
                    ]
                }))
                el.appendChild($({
                    tag:'div',
                    style:{
                        display:'flex',
                        height:'4%',
                        width:'100%',
                        borderBottom:'solid thin rgba(200,200,200,0.2)',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontWeight:'bold',
                        color:'#888',
                        fontSize:'1vw'
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'30%',
                                display:'flex'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    text:'Campus',
                                    style:{
                                        margin:'auto',
                                        marginLeft:'.5vw'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'40%',
                                display:'flex'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    text:'Author',
                                    style:{
                                        margin:'auto',
                                        marginLeft:'.5vw'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag:'div',
                            style:{
                                width:'30%',
                                display:'flex'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    text:'Category',
                                    style:{
                                        margin:'auto',
                                        marginLeft:'.5vw'
                                    }
                                })
                            ]
                        }),
                    ]
                }))
                el.appendChild(scrollList())
            }
        }))
    }
    const fileContent = () => {
        let inputSearch
        let bodyContent
        const head = () => {
            const eventDiv = () => {
                let dl
                return ($({
                    tag: 'div',
                    style: {
                        height: 'fit-content',
                        width: '25vw',
                        padding: '.2rem',
                        margin: 'auto',
                        marginLeft: '.5vw',
                    },
                    child: [
                        $({
                            tag: 'datalist',
                            att: {
                                id: 'eventList'
                            },
                            elementHandler: (el) => {
                                dl = el
                            }
                        }),
                        $({
                            tag: 'input',
                            style: {
                                width: '98%',
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: '1.2vw',
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                fontWeight: 'bold',
                                color: '#bbb'
                            },
                            att: {
                                type: 'search',
                                placeholder: 'Select event'
                            },
                            elementHandler: (el) => {
                                inputSearch = el
                                setTimeout(() => {
                                    el.focus()
                                }, 100)
                                el.appendChild($({
                                    tag: 'option',
                                    att: {
                                        innerText: '- - All Events - -',
                                        id: '0'
                                    },
                                    style: {
                                        backgroundColor: 'rgba(0,0,0,0.7)'
                                    }
                                }))

                                const req = new Request('/loadUser')
                                req.Post([
                                    {name: 'eventRequest', value: '1'}
                                ])
                                req.Json()
                                req.Send().then(data => {
                                    data.forEach(val => {
                                        dl.appendChild($({
                                            tag: 'option',
                                            att: {
                                                value: val.name
                                            },
                                            style: {
                                                fontSize: '1vw'
                                            }
                                        }))
                                    })
                                })
                                el.setAttribute('list', 'eventList')
                            },
                            event: {
                                type: 'input',
                                method: (event) => {

                                }
                            }
                        })
                    ]
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    width: 'fit-content',
                    display: 'flex',
                    marginLeft: '1vw',
                    padding: '.5rem',
                    marginTop: '1vh',
                    borderRadius: '.5vw',
                },
                att: {
                    className: 'selectEvent'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-magnifying-glass'
                        },
                        style: {
                            fontSize: '1.5vw',
                            margin: 'auto',
                            marginRight: 'auto',
                            color: 'deepskyblue',
                            border: 'solid thin deepskyblue',
                            padding: '.2rem',
                            borderRadius: '.5vw',
                            cursor: 'pointer'
                        }
                    }),
                    eventDiv()
                ]
            }))
        }

        const container = () => {

            const eventPanel = (eventTYpe, totalDocs, eventId) => {
                let perListPan
                let statePer = false
                let mainBod
                return ($({
                    tag: 'div',
                    style: {

                        height: 'fit-content',
                        width: '100%',
                        margin: '1vh auto'
                    },
                    elementHandler: (el) => {
                        mainBod = el
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '98.5%',
                                display: 'flex',
                                padding: '.5rem',
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                                        color: '#bbb',
                                        fontSize: '1vw',
                                        width: '80%'
                                    },
                                    text: eventTYpe
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                                        color: '#bbb',
                                        fontSize: '1vw',
                                        width: '20%',
                                        textAlign: 'center'
                                    },
                                    text: totalDocs
                                })
                            ],
                            att: {
                                className: 'perList'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    statePer = !statePer
                                    if (statePer) {
                                        bodyContent.childNodes.forEach(val => {
                                            val.style.display = 'none'
                                        })
                                        mainBod.style.display = 'block'
                                        perListPan.style.borderTop = 'solid thin grey'
                                        perListPan.appendChild(docListView(eventId))
                                    } else {
                                        bodyContent.childNodes.forEach(val => {
                                            val.style.display = 'block'
                                        })
                                        perListPan.innerText = ''
                                        perListPan.style.borderTop = ''
                                        perListPan.innerHTML = ''
                                    }
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                height: 'fit-content',
                                width: '100%',
                            },
                            elementHandler: (el) => {
                                perListPan = el
                            }
                        })
                    ],

                }))
            }

            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '90%',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    marginTop: '.9%',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            height: '4%',
                            width: '80%',
                            borderLeft: 'solid thin rgba(200,200,200,.1)',
                            borderRight: 'solid thin rgba(200,200,200,.1)',
                            margin: 'auto',
                            display: 'flex',
                            paddingTop: '1%',
                            backgroundColor: 'rgba(100,100,100,0.4)'

                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                                    color: 'deepskyblue',
                                    fontSize: '1vw',
                                    width: '80%',
                                    textIndent: '.5vw'
                                },
                                text: "Event"
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: "Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif",
                                    color: 'deepskyblue',
                                    fontSize: '1vw',
                                    width: '20%',
                                    textAlign: 'center'
                                },
                                text: "Total Document"
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            height: '93%',
                            width: '80%',
                            borderLeft: 'solid thin rgba(200,200,200,.1)',
                            borderRight: 'solid thin rgba(200,200,200,.1)',
                            margin: 'auto',
                        },
                        elementHandler: (el) => {
                            bodyContent = el
                            const req = new Request('/loader')
                            req.Post([
                                {name: 'documentRequest', value: '0'}
                            ])
                            req.Json()
                            req.Send().then(data => {
                                data.forEach(val => {
                                    el.appendChild(eventPanel(val.event, val.total, val.id))
                                })
                            })
                                .catch(err => {
                                    console.log(err)
                                })
                        }
                    })
                ]

            }))
        }

        return ($({
            tag: 'dv',
            style: {
                margin: 'auto',
                height: '100%',
                width: '100%'
            },
            child: [
                head(),
                container()
            ]
        }))
    }


    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '99%',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',

        },
        elementHandler: (el)=>{
            main=el
        },
        child: [
            fileContent()
        ]
    }))
}

const AddDocType=()=>{

    const Add=()=>{
        let docName="";

        return($({
            tag:'div',
            style:{
                height:'10vh',
                width:'100%',
                display:'flex',
                borderBottom:'solid thin rgba(100,100,100,0.5)'
            },
            child:[
                $({
                    tag: 'div',
                    text: 'Add Document Type',
                    style: {
                        margin: 'auto',
                        height: 'fit-content',
                        width: 'fit-content',
                        marginLeft:'.5vw',
                        marginRight: '0',
                        fontSize:'1.5vw',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontWeight:'bold',
                        color:'#888',
                        textDecoration:'underline',
                    }
                }),
                $({
                    tag:'div',
                    style:{
                        height:'fit-content',
                        width:'fit-content',
                        padding:'.5rem',
                        margin:'auto',
                        marginLeft:'.5vw',
                        border:'solid thin #555',
                        borderRadius:'.5vw',
                        backgroundColor:'rgba(0,0,0,0.2)',
                        display:'flex'
                    },
                    child:[

                        $({
                            tag:'input',
                            att:{
                                placeholder:'Enter text here'
                            },
                            style:{
                                backgroundColor:'transparent',
                                border:'none',
                                outline:'none',
                                fontSize:'1vw',
                                color:'#bbb',
                                width:'25vw'
                            },
                            elementHandler:(el)=>{
                                setTimeout(()=>{el.focus()},100)
                            },
                            event:{
                                type:'input',
                                method:(ev)=>{
                                    docName=ev.target.value;
                                }
                            }
                        }),
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-file-circle-plus'
                            },
                            style:{
                                margin:'auto',
                                fontSize:'1.2vw',
                                height:'fit-content',
                                width:'fit-content',
                                border:'1px solid rgba(100,100,100,0.5)',
                                padding:'.2rem',
                                color:'deepskyblue',
                                borderRadius:'.5vw',
                                cursor:'pointer'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    if(docName.trim()===''){
                                        alert("No data available");
                                    }else {
                                        if(confirm("Do you want to save this data?")){
                                            const load= Waiting()
                                            document.body.appendChild(load)
                                            const req= new Request('/getDocType')
                                            req.Post([
                                                {
                                                    name:'doctype',
                                                    value:docName,
                                                },
                                                {
                                                    name:'addDoctype',
                                                    value:'1'
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                load.remove();
                                                setTimeout(()=>{
                                                    alert(data.message);
                                                    window.location.reload()
                                                },100)
                                            })
                                        }
                                    }
                                }
                            }
                        }),
                    ]
                })
            ]
        }))
    }
    const body=()=>{

        const typeList=(id,name,date)=>{
            const label=({name,time},width)=>{
                const month=new Date(date.split(' ')[0]).toLocaleString('default', { month: 'long' });
                const dt=date.split(' ')[0].split('-')
                const timeFormat=date.split(' ')[1].split(':')
                return($({
                    tag:'div',
                    style:{
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        width:width,
                        color:'#bbb'

                    },
                    elementHandler:(el)=>{
                        if(name){
                            el.innerText=name
                        }
                        if(time){
                            el.innerText=dt[0]+' '+month+', '+dt[2]+' | '+TimeConvert(timeFormat)
                        }
                    }
                }))
            }
            const Remover=()=>{
                return($({
                    tag:'div',
                    style:{
                        width:'5%',
                        textAlign:'center',
                        margin:'auto',
                        border:'solid thin deepskyblue',
                        padding:'.2rem',
                        color:'deepskyblue',
                        cursor:'pointer',
                        borderRadius:'.5vw'
                    },
                    att:{
                        className:'fa-solid fa-trash-can'
                    },
                    event:{
                        type:'click',
                        method:()=>{
                            if(confirm("Are you sure you want to delete this file? \n This process  cannot be undone.")){
                                const loading= Waiting()
                                document.body.appendChild(loading)
                                const req= new Request('/getDocType')
                                req.Post([
                                    {
                                        name:'deletedocType',
                                        value:'1'
                                    },
                                    {
                                        name:'doctypeId',
                                        value:id
                                    }
                                ])
                                req.Json()
                                req.Send().then(data=>{
                                    loading.remove()
                                    setTimeout(()=>{
                                        if(data.status){
                                            alert(data.message)
                                            window.location.reload()
                                        }else {
                                            alert(data.message)
                                        }
                                    },100)

                                })
                            }
                        }
                    }

                }))
            }
            return($({
                tag:'div',
                style:{
                    height:'fit-content',
                    display:'flex',
                    marginTop:'.5vh',
                    marginBottom:'.5vh'
                },
                child:[
                    label({name:name},'65%'),
                    label({time:date},'30%'),
                    Remover()
                ],
                att:{
                    className:'typeList'
                }

            }))
        }

        return($({
            tag:'div',
            style:{
                width:'80%',
                height:'89%',
                margin:'auto',
                overflowY:'auto'
            },
            elementHandler:(el)=>{
               const req= new Request('/getDocType')
                req.Post([
                    {
                        name:'getDoctype',
                        value:'1'
                    }
                ])
                req.Json()
                req.Send().then(data=>{
                    data.forEach(val=>{
                        el.appendChild(typeList(val.id,val.name,val.date))
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
        },
        child:[
            Add(),
            body()
        ]

    }))
}
const DownloadBackup =()=>{
    const Comm=()=>{
        return($({
            tag:'div',
            style:{
                width:'50%',
                height:'100%',
            }
        }))
    }
    const EventDoc=()=>{
        let eventName=''
        const SelectFile=(event,req)=>{
            return($({
                tag:"div",
                style:{
                    border:'solid thin deepskyblue',
                    padding:'.5rem',
                    margin:'5vh auto',
                    width:'80%'
                },
                child:[
                    $({
                        tag:'select',
                        style:{
                            width:'100%',
                            backgroundColor:"transparent",
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            border:'none',
                            outline:'none',
                            textAlign:'center',
                            fontSize:'1.1vw',
                            fontWeight:'bold',
                            color:'#bbb'
                        },
                        event:event,
                        elementHandler:req
                    })
                ]

            }))
        }
        const getCampus={
            type:'change',
            method:(event)=>{


            }
        }
        const getEvent={
            type:'change',
            method:(val)=>{
                eventName=val.target.value;
            }
        }
        const Zip=()=>{
            return($({
                tag:'div',
                style:{
                    border:'solid thin #999',
                    borderRadius:'.5vw',
                    padding:'.5rem',
                    margin:'5vh auto',
                    width:'fit-content',
                    display:'flex',
                    justifyContent:'center',
                    paddingLeft:'1vw',
                    paddingRight:'1vw',
                    cursor:'pointer',
                    color:'deepskyblue',
                    fontSize:'1.5vw'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'fa-solid fa-file-zipper'
                        },
                        child:[
                            $({
                                tag:'span',
                                text: 'Download zip file',
                                style:{
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    marginLeft:'1vw',
                                    color:'#bbb'
                                }
                            })
                        ]
                    })
                ],
                event:{
                    type:'click',
                    method:()=>{

                        const req=new Request('/generateZip')
                        req.Post([
                            {
                                name:'backup',
                                value:'1'
                            },
                            {
                                name:'eventName',
                                value:eventName
                            }
                        ])
                        req.Json()
                        req.Send().then(data=>{
                            console.log(data)

                            let campusFolder="";
                            let entriesFolder="";
                            let categoryFolder="";
                            data.campus.forEach(val=>{



                                const zip=new JSZip();
                                campusFolder=val.campusName+'/'
                                val.campusFiles.forEach(v=>{

                                    const dataUri=fetch(v.endorsementFile.replace('..','')).then(rr=>rr.arrayBuffer())
                                    entriesFolder=campusFolder+'entries/'
                                    zip.folder(campusFolder).file('endorsement.pdf',dataUri)
                                    zip.folder(entriesFolder)
                                    v.entries.forEach(vv=>{
                                        let cat=vv.category.replace('/','-')
                                        categoryFolder=entriesFolder+cat+'/'
                                        vv.filesDocs.forEach((vfile,i)=>{
                                            const dat=fetch(vfile.file.replace('..','')).then(rr=>rr.arrayBuffer())
                                            zip.folder(categoryFolder).file(`${vfile.author}-${vfile.docId}.pdf`,dat)
                                        })



                                    })

                                })
                                zip.generateAsync({type:"base64"}).then(function (base64) {
                                    let a = document.createElement("a"); //Create <a>
                                    a.href = "data:application/zip;base64," + base64; //Image Base64 Goes here
                                    a.download = `${val.campusName}.zip`; //File name Here
                                    a.click();
                                }, function (err) {
                                    console.log(err)
                                });
                            })


                           /*


                            */
                            /*
                            const zip=new JSZip();
                            zip.file("hello.txt", "Hello[p my)6cxsw2q");
                            zip.generateAsync({type:"base64"}).then(function (base64) {
                                window.location = "data:application/zip;base64," + base64;
                            }, function (err) {
                                console.log(err)
                            });
                             */
                        })
                    }
                }


            }))
        }
        return($({
            tag:'div',
            style:{
                width:'50%',
                height:'100%',
                borderRight:'solid thin #555'
            },
            child:[
                $({
                    tag:'div',
                    text:'Download files for Backup',
                    style:{
                        textAlign:'center',
                        marginTop:'5vh',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        color:'#bbb',
                        fontSize:'1.5vw'
                    }
                }),
                SelectFile(getEvent,(el)=>{
                    el.appendChild($({
                        tag:'option',
                        text:'- - Select Event - -',
                        style:{
                            backgroundColor:'#222'
                        }
                    }))
                    const req= new Request('/eventRequest')
                    req.Post([
                        {
                            name:'getEvent',
                            value:'1'
                        }
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
                }),
               /*
                SelectFile(getCampus,(el)=>{
                    el.appendChild($({
                        tag:'option',
                        text:'- - Select Campus - -',
                        style:{
                            backgroundColor:'#222'
                        }
                    }))
                    CapsuOffice.forEach(val=>{
                        el.appendChild($({
                            tag:'option',
                            style:{
                                backgroundColor:'#222'
                            },
                            text:val
                        }))
                    })


                }),
                */
                Zip()
            ]
        }))
    }

    return($({
        tag:'div',
        style:{
            width:'100%',
            height:'100%',
            display:'flex'
        },
        child:[
            EventDoc(),
            Comm(),

        ]
    }))
}

const TabButton = ({label, url}) => {
    const getBot = (bot) => {
        if (url.split('/')[3] === window.location.href.replace(window.location.origin, '').split('/')[3]) {
            bot.className += ' botTFilesActive'
        }
    }



    return ($({
        tag: 'td',
        att: {
            className: 'botTFiles'
        },
        style:{
            width:'25%',
        },
        text: label,
        elementHandler: getBot,
        event: {
            type: 'click',
            method: () => {
                window.location.assign(url)
            }
        }

    }))
}


export const Files = () => {
    const buttons = []
    buttons.push({
        url: '/admin/files/endorsement',
        name: 'Communication',
        page: Communication
    })
    //  buttons.push({
    //         url: '/admin/files/research',
    //         name: 'Research Paper',
    //         page: ResearchFile
    //     })
    buttons.push({
        url: '/admin/files/systemfiles/allevents',
        name: 'Symposium/In-house Review',
        page: SystemFile
    })
    buttons.push({
        url: '/admin/files/add_docType',
        name: 'DocTypes',
        page: AddDocType
    })
    buttons.push({
        url: '/admin/files/backup',
        name: 'Backup',
        page: DownloadBackup
    })



    const tabHolder = () => {
        const getRow = (row) => {
            buttons.forEach(val => {
                row.appendChild(TabButton({
                    label: val.name,
                    url: val.url,
                }))
            })
        }
        return ($({
            tag: 'table',
            att: {
                className: 'tabHolder'
            },
            child: [
                $({
                    tag: 'tr',
                    elementHandler: getRow
                })
            ]
        }))
    }
    const filePanel = () => {
        const getPanel = (pan) => {
            let pageState = false
            buttons.forEach(val => {
                if (val.url.split('/')[3] === window.location.href.replace(window.location.origin, '').split('/')[3]) {
                    pan.appendChild(val.page())
                    pageState = true
                }

            })
            if (!pageState) {
                pan.appendChild(Error())
            }
        }
        return ($({
            tag: 'div',
            att: {
                className: 'fileContainer'
            },
            elementHandler: getPanel
        }))
    }


    return ($({
        externalStyle: '/client/component/adminComponent/componentStyle/file.css',
        tag: 'div',
        att: {
            className: 'filePanel'
        },
        child: [
            tabHolder(),
            filePanel()
        ]
    }))
}

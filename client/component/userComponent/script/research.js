import {$, CapsuOffice, ConfirmationAlert, Request, TimeConvert, Waiting} from '../../../lib/lib.js'
import {Error} from "../../../error.js";
import {Print} from "../../otherComponent/comment.js";


const getUrl = (url) => {
    sessionStorage.setItem('viewFile', '/' + url)
}


const CreateNew = () => {

    const data = {
        endorsement: '',
        event: '',
        research: []
    }
    const getDataMethod = {
        getEndorsement: (value) => {
            data.endorsement = value
        },
        getResearch: (value) => {
            data.research.push(value)
        },
        getEvent: (value) => {
            data.event = value
        }
    }

    let Temp = {
        title: '',
        category: '',
        author: '',
        attachment: '',
        coAuhtor:[]
    }


    let TitleEl, SelCat, getAuth, attache,coAuth,coAuthList
    const getAttache = (el) => {
        attache = el
    }
    const getTitle = (el) => {
        TitleEl = el
    }
    const getAuthor = (el) => {
        getAuth = el
    }
    const getcoAuth=(el)=>{
        coAuth=el
    }

    let cove
    const getCo = (el) => {
        cove = el
    }
    const getListTab = (tab) => {
        listTableRes = tab
    }

    const labelRes = $({
        tag: 'div',
        style: {
            fontFamily: 'arial black,sans-serif',
            color: '#bbb',
            textAlign: 'center',
            marginTop: '1vh',
            fontSize: '1.3vw'
        },
        text: 'Add Document'
    })
    const addResearch = () => {
        const Title = () => {
            const leb = $({
                tag: 'div',
                text: 'Document Title',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    margin: 'auto 0 auto auto',
                    fontSize: '1.1vw',

                }
            })
            const input = $({
                tag: 'textarea',
                style: {
                    height: '6vh',
                    width: '99%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    color: '#bbb',
                    resize: 'none',
                    fontSize: "1vw",
                },
                att: {
                    placeholder: 'Insert text here',
                    required: true
                },
                event: {
                    type: 'input',
                    method: (event) => {
                        Temp.title = event.target.value
                    }
                },
                elementHandler: getTitle
            })
            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: 'auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw'
                },
                child: [
                    leb,
                    input
                ]
            }))
        }
        const Category = () => {
            const getSelect = (el) => {
                SelCat = el
                const option = (val) => {
                    return ($({
                        tag: 'option',
                        text: val,
                        style: {
                            color: 'black',
                            fontSize: '1.1vw',
                            backgroundColor: 'grey'
                        }
                    }))
                }
                el.append($({
                    tag: 'option',
                    text: '- - Select Center - -',
                    style: {
                        color: 'black',
                        fontSize: '1.1vw',
                    },
                    att: {
                        disabled: true,
                        selected: true
                    }
                }))
                el.append(option("Crop Science Research & Developement Center (CSRDC)"))
                el.append(option("Livestock Research & Development Center (LRDC)"))
                el.append(option("Fisheries Research & Development Center (FRDC)"))
                el.append(option("Food and Industrial Technology Research & Development Center (FITRDC)"))
                el.append(option("Social Science Research & Development Center (SSRDC)"))
                el.append(option("Machinery and Agricultural Technology Engineering Center (MATEC)"))
                el.append(option("Coconut Research and Development Center (Coco RDC)"))
                el.append(option("Extension Office"))


            }
            const select = $({
                tag: 'select',
                style: {
                    width: '60%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    marginTop: '1vh',
                    cursor: 'pointer'
                },
                att: {
                    required: true
                },
                elementHandler: getSelect,
                event: {
                    type: 'change',
                    method: (event) => {
                        Temp.category = event.target.value
                    }
                }
            })
            const leb = $({
                tag: 'div',
                text: 'Select Center',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    margin: 'auto 0 auto auto',
                    fontSize: '1.1vw',
                }
            })
            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center'
                },
                child: [
                    leb,
                    select
                ]
            }))
        }
        const Author = () => {
            const leb = $({
                tag: 'div',
                text: 'Main Author : ',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    fontSize: '1.2vw',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                }
            })

            const authorInput = $({
                tag: 'input',
                style: {
                    height: '4vh',
                    marginLeft: '.5vw',
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    fontSize: '1vw',
                    color: '#bbb',
                    paddingLeft: '1vw'
                },
                att: {
                    placeholder: 'Enter text here',
                    required: true
                },
                event: {
                    type: 'input',
                    method: (event) => {
                        Temp.author = event.target.value
                    }
                },
                elementHandler: getAuthor
            })
            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center',
                    display: 'flex',
                    whiteSpace: 'nowrap'
                },
                child: [
                    leb,
                    authorInput
                ]
            }))
        }
        const CoAuthor=()=>{
            let listCo,coInput
            const perListCo=(val)=>{

                let main

                return($({
                    tag:'div',
                    style:{
                        margin:'1vh auto auto',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize:'1.3vw',
                        color:'#bbb',
                        width:'90%',
                        textAlign:'left',
                        display:'flex',
                        border:'solid thin rgba(200,200,200,0.3)',
                        paddingRight:'.5vw',
                        paddingLeft:'.5vw',
                        height:'fit-content'
                    },
                    elementHandler:(el)=>{
                        main=el
                    },
                    child:[
                        $({
                            tag:'div',
                            text:val,
                            style:{
                                width:'100%',
                                textAlign:'left',
                                margin:'auto'
                            }
                        }),
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-trash-can',
                                required: true
                            },
                            style:{
                                margin:'auto',
                                cursor:'pointer'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    main.remove()
                                    Temp.coAuhtor=Temp.coAuhtor.filter((item)=>{return item!==val})
                                }
                            }
                        }),

                    ]
                }))
            }
            const leb = $({
                tag: 'div',
                text: 'Co-Author : ',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    fontSize: '1.2vw',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                }
            })
            const bot=$({
                tag:'div',
                att:{
                    className:'fa-solid fa-user-plus addCo',
                    title: 'Add as co-author?'
                },
                style:{
                    fontSize:'1.2vw',
                    margin:'auto',
                    marginLeft:'1vw',
                    border:'solid thin deepskyblue',
                    padding:'.3rem',
                    cursor:'pointer'
                },
                event:{
                    type:'click',
                    method:()=>{

                       Temp.coAuhtor.push(coInput.value)
                        listCo.innerHTML=''
                        Temp.coAuhtor.forEach(val=>{
                            listCo.appendChild(perListCo(val))
                        })
                        coInput.value=''
                    }
                }
            })
            const CoauthorInput = $({
                tag: 'input',
                style: {
                    height: '4vh',
                    marginLeft: '.5vw',
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    fontSize: '1vw',
                    color: '#bbb',
                    paddingLeft: '1vw'
                },
                att: {
                    placeholder: 'Input all authors here',
                    title: 'To add more authors click the add icon'
                },
                elementHandler: (el)=>{
                    coInput=el
                }
            })
            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                },
                child: [
                    $({
                        tag:'div',
                        style:{
                            display:'flex',
                            width:'100%',
                            borderBottom:'solid thin grey',
                            paddingBottom:'.5vw'
                        },
                        child:[
                            leb,
                            CoauthorInput,
                            bot
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            width:'100%',
                        },
                        elementHandler:(el)=>{
                            listCo=el
                            coAuthList=el
                        }
                    })
                ]
            }))
        }

        const Attachment = () => {


            const file = $({
                tag: 'input',
                att: {
                    type: 'file',
                    accept: '.pdf',
                    required: true
                },
                style: {
                    opacity: '0',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                },
                event: {
                    type: 'input',
                    /* A function that is called when a file is selected. It sets the attachment to the file selected and
                    displays the file name. */
                    method: (event) => {
                        Temp.attachment = event.target.files[0]
                        cove.innerHTML = `<div style="margin: auto;  font-family: monospace" class="fa-solid fa-file-pdf"> ${event.target.files[0].name}</div>`
                    }
                },
                elementHandler: getAttache
            })
            const cover = $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    fontFamily: 'monospace',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                },
                att: {
                    innerHTML: `<div style="margin: auto; font-family: monospace" class="fa-solid fa-file-pdf"> upload research or extension proposal/paper in pdf format</div>`
                },
                elementHandler: getCo

            })

            return ($({
                tag: 'div',
                att: {
                    className: 'resAtt'
                },
                style: {
                    height: '6vh',
                    width: '70%',
                    margin: ' 2vh auto',
                    borderRadius: '.5vw',
                    position: 'relative',
                    backgroundColor:'#333'
                },
                child: [
                    cover,
                    file
                ]
            }))
        }


        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                paddingTop: '1vh',
                paddingBottom: '1vh',
                width: '80%',
                border: 'solid thin deepskyblue',
                margin: 'auto',
                borderRadius: '.5vw'
            },
            child: [
                Title(),
                Category(),
                Author(),
                CoAuthor(),
                Attachment(),
            ]
        }))
    }
    let listTableRes
    const listAuthor = (name, category, title) => {
        let mainListPan
        /**
         * It returns the mainListPan element.
         * @param el - the element that is being dragged
         */
        const getMain = (el) => {
            mainListPan = el
        }

        const nameList = $({
            tag: 'div',
            text: name,
            style: {
                fontSize: '1vw',
                fontFamily: 'arial,sans-serif',
                width: '30%',
                margin: 'auto',
                fontWeight: 'bolder'
            }

        })
        const categoryList = $({
            tag: 'div',
            text: category,
            style: {
                fontSize: '1vw',
                fontFamily: 'arial,sans-serif',
                width: '20%',
                margin: 'auto',
                fontWeight: 'bolder',
                borderLeft:'solid thin rgba(100,100,100,0.5)'
            }
        })
        const TitleList = $({
            tag: 'div',
            text: title,
            style: {
                fontSize: '1vw',
                fontFamily: 'arial,sans-serif',
                width: '43%',
                margin: 'auto',
                fontWeight: 'bolder',
                whiteSpace:'nowrap',
                textOverflow:'ellipsis',
                overflow: 'hidden',
                borderLeft:'solid thin rgba(100,100,100,0.5)',
                borderRight:'solid thin rgba(100,100,100,0.5)'
            }
        })
        const deleteBot = $({
            tag: 'div',
            style: {
                fontSize: '1vw',
                width: '5%',
                textAlign: 'center',
                margin: 'auto'
            },
            att: {
                className: 'fa-solid fa-trash-can'
            },
            event: {
                type: 'click',
                method: () => {
                    for (let x = 0; x < data.research.length; x++) {
                        if (data.research[x].author === name && data.research[x].title === title) {
                            data.research.splice(x, 1)
                            break;
                        }
                    }
                    mainListPan.remove()
                }
            }
        })
        return ($({
            tag: 'div',
            style: {
                height: '4vh',
                justifyContent: 'center',
                display: 'flex',
                paddingRight: '1vw',
                paddingLeft: '1vw',
                backgroundColor: 'rgba(0,0,0,0.2)',
                margin: '.5vh auto auto'
            },
            elementHandler: getMain,
            child: [
                nameList,
                categoryList,
                TitleList,
                deleteBot
            ]
        }))
    }
    const addMethod = () => {

       // getDataMethod.getResearch(Temp)

        /* Appending the listAuthor function to the listTableRes variable.
        listTableRes.appendChild(listAuthor(Temp.author, Temp.category, Temp.title))
         */
        /*
        cove.innerHTML = `<div style="margin: auto;  font-family: monospace" class="fa-solid fa-file-pdf"> upload attachment in pdf format</div>`
        Temp = {
            title: '',
            category: '',
            author: '',
            attachment: '',
            coAuhtor: []
        }
        TitleEl.value = ''
        SelCat.selectedIndex = 0
        getAuth.value = ''
        attache.value = ''
        coAuthList.innerHTML=''
         */

    }
    const AddBot = () => {
        return ($({
            tag: 'div',
            style: {
                fontSize: '1.2vw',
                margin: '1vh  auto',
                width: 'fit-content',
                height: '4vh',
                paddingLeft: '1vw',
                paddingRight: '1vw',
            },
            att: {
                className: 'addBotRes'
            },
            text: 'Add to List',
            event: {
                type: 'click',
                method: () => {

                    /* The above code is checking if the title, category, author and attachment are empty. If they are
                    empty, it will alert the user that the title, category, author and attachment are missing. */
                    if (Temp.title === '') {

                        alert("Title is missing..!")
                        return;
                    }
                    if (Temp.category === '') {

                        alert("Category is missing..!")
                        return;
                    }
                    if (Temp.author === '') {

                        alert("Author is missing..!")
                        return;
                    }
                    if (Temp.attachment === '') {

                        alert("Attachment is missing..!")
                        return;
                    }
                    /* Adding a method to the Array object. */
                    addMethod();

                }
            }

        }))
    }


    const ListTable = () => {
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                backgroundColor: '#222',
                width: '80%',
                margin: 'auto',
                overflowY: 'auto',
                border:'solid thin deepskyblue',
                color:'deepskyblue'
            },
            elementHandler: getListTab
        }))
    }

    const attachContainer = () => {
        let cov
        let getcover = (el) => {
            cov = el
        }
        const file = $({
            tag: 'input',
            att: {
                type: 'file',
                accept: '.pdf',
                required: true
            },
            style: {
                opacity: '0',
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: '2',
                cursor: 'pointer'
            },
            event: {
                type: 'input',
                method: (event) => {
                    cov.innerHTML = `<div style="margin: auto;  font-family: monospace" class="fa-solid fa-file-pdf"> ${event.target.files[0].name}</div>`
                    getDataMethod.getEndorsement(event.target.files[0])
                }
            }
        })
        const cover = $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                fontFamily: 'monospace',
                color: 'deepskyblue',
                fontSize: '1vw',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor:'#333',
                borderRadius: '.5vw'
            },
            att: {
                innerHTML: `<div style="margin: auto;  font-family: monospace" class="fa-solid fa-file-pdf"> upload attachment in pdf format</div>`,


            },
            elementHandler: getcover
        })
        const label = $({
            tag: 'div',
            att: {
                className: 'fa-solid fa-file-lines',
            },
            style: {
                color: '#bbb',
                margin: 'auto',
                width: 'fit-content ',
                display: 'flex',
                justifyContent: 'center',
                marginLeft: '1vw',
                marginRight: '.5vw'
            },
            child: [
                $({
                    tag: 'div',
                    text: ' Endorsement Letter: ',
                    style: {
                        whiteSpace: 'nowrap',
                        fontSize: '1vw',
                        margin: 'auto',
                        marginLeft: '.5vw',
                        height: 'fit-content',
                        fontFamily: 'arial ,sans-serif',
                        color: '#bbb'
                    }
                })
            ]

        })
        return ($({
            tag: 'div',
            style: {
                display: 'flex',
                width: '80%',
                margin: '2vh auto auto',
                borderRadius: '.5vw'
            },
            att: {
                className: 'cover'
            },
            child: [
                label,
                $({
                    tag: 'div',
                    style: {

                        height: '4vh',
                        width: '100%',
                        margin: ' auto',
                        marginLeft: '0',
                        position: 'relative',
                        backgroundImage: 'linear-gradient(to right,transparent,rgba(0,0,0,0.5),black)'
                    },
                    child: [
                        cover,
                        file
                    ]
                }),


            ]
        }))
    }
    const EventType = () => {
        return ($({
            tag: 'div',
            style: {
                margin: '2vh auto auto',
                width: '40%',
                borderRadius: '.5vw',
                cursor: 'pointer',
                height: '4vh',
                display: 'flex',
                justifyContent: 'center'
            },
            att: {
                className: 'selectEv'
            },
            child: [
                $({
                    tag: 'select',
                    style: {
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        color: 'deepskyblue',
                        backgroundColor: 'transparent',
                        textAlign: 'center',
                        margin: 'auto',
                        fontSize: '1vw',
                        cursor: 'pointer'
                    },
                    att: {
                        required: true
                    },
                    event: {
                        type: 'change',
                        method: (event) => {
                            getDataMethod.getEvent(event.target.value)
                        }
                    },
                    elementHandler:async (el)=>{
                        el.appendChild(  $({
                            tag: 'option',
                            text: '-- Select Event Name --',
                            att: {
                                disabled: true,
                                selected: true
                            }
                        }))
                        const form=new FormData()
                        // former   getEvent
                        //getEventAdmin
                        form.append('getEvent','true')
                        await fetch('/eventRequest',{
                            method:'POST',
                            body:form
                        }).then(res=>res.json())
                            .then(data=>{

                                data.forEach(val=>{
                                    el.appendChild($({
                                        tag: 'option',
                                        text:val.name,
                                        style:{
                                            backgroundColor:'#222',
                                            fontSize:'1.4vw'
                                        },
                                        att:{
                                            id:val.id
                                        }
                                    }))
                                })
                            })
                    },

                })
            ]
        }))
    }
    const Filter=(dataM)=>{
        const fil={
            message:'',
            state:true
        }
        if(dataM.endorsement===null||dataM.endorsement===''){
            fil.message="Endorsement is missing..!"
            fil.state=false
            return fil
        }
        if(dataM.event===null||dataM.event===''){
            fil.message="Event Type is missing..!"
            fil.state=false
            return fil
        }
       /*
        if(attachment.length===0){
            fil.message="No Entries found..!"
            fil.state=false
            return fil
        }
        */
        return fil
    }

    const Submit = () => {
        return ($({
            tag: 'div',
            style: {
                height: 'fit-content',
                padding: '.2rem',
                fontSize: '1.2vw',
                paddingLeft: '1vw',
                paddingRight: '1vw',
                borderRadius: '1vw',
                fontFamily: 'arial black,sans-serif',
                margin: '2vh auto',
                width: 'fit-content',
                cursor: 'pointer'
            },
            att: {
                className: 'subEn'
            },
            text: 'Submit',
            event: {
                type: 'click',
                method: async () => {
                                        // Get all required fields
                    const requiredInputs = document.querySelectorAll('[required]');
                    let isValid = true;
                    let firstInvalidField = null;

                    // Check each required field
                    requiredInputs.forEach(field => {
                        if (!field.value || (field.type === 'file' && !field.files.length)) {
                            isValid = false;
                            if (!firstInvalidField) {
                                firstInvalidField = field;
                            }
                            
                            // Add visual feedback
                            field.style.border = '1px solid red';
                            field.style.boxShadow = '0 0 5px red';
                            
                            // Add input event to remove error styling
                            const removeError = () => {
                                field.style.border = '';
                                field.style.boxShadow = '';
                                field.removeEventListener('input', removeError);
                            };
                            field.addEventListener('input', removeError);
                        }
                    });

                    if (!isValid) {
                        // Focus on first invalid field
                        if (firstInvalidField) {
                            firstInvalidField.focus();
                        }
                        
                        alert("Please fill all required fields!");
                        return;
                    }
                    if (Temp.title === '') {

                        alert("Title is missing..!")
                        return;
                    }
                    if (Temp.category === '') {

                        alert("Category is missing..!")
                        return;
                    }
                    if (Temp.author === '') {

                        alert("Author is missing..!")
                        return;
                    }
                    if (Temp.attachment === '') {

                        alert("Attachment is missing..!")
                        return;
                    }
                    
                    /* Adding a method to the Array object. */
                    addMethod()
                    const fl=Filter(data)
                    if(fl.state){
                        data.research.push(Temp)
                        const form = new FormData();
                        form.append('uploadedFileEndorsement', data.endorsement)
                        form.append('eventType', data.event)

                        data.research.forEach(val => {
                            form.append('researchDocs[]', val.attachment)
                            form.append('title[]', val.title)
                            form.append('category[]', val.category)
                            form.append('author[]', val.author)
                            form.append('coAuthor[]',JSON.stringify(val.coAuhtor))
                        })


                        form.append('uploadResearch', 'true')
                        let loading = Waiting()
                        document.body.appendChild(loading)
                        const remove = () => {
                            loading.remove()
                        }
                        await fetch('/getresearch', {
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
                            }).catch(err => {
                                remove()
                                console.error('Error uploading research:', err)
                                alert('Error uploading document. Please try again.')
                            })
                    }else{
                        alert(fl.message)
                    }

                }
            }
        }))
    }
    const newContent = () => {
        return ($({
            tag: 'div',
            style: {
                width: '80%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                margin: 'auto',
                overflowY:'auto',
            },
            child: [
                labelRes,
                addResearch(),
                /*
                AddBot(),
                ListTable(),
                 */
                attachContainer(),
                EventType(),
                Submit()
            ]
        }))
    }


    return ($({
        tag: 'div',
        att: {
            className: 'createPan'
        },
        child: [newContent()]


    }))
}

const Submitted = () => {
    let mainPanel
    const getMain = (mainElement) => {
        mainPanel = mainElement
        const url = window.location.href.replace(window.location.origin, '')

        /* Checking the url and appending the appropriate panel to the mainPanel. */
        switch (url.split('/')[4]) {
            case 'submittedFiles':
                mainPanel.appendChild(MessagePanel())
                break;
            case 'viewFile=':
                mainPanel.appendChild(FilePanel(sessionStorage.getItem('viewFile')))
                break;
            default:
                mainPanel.appendChild(Error())
        }
    }

    //for viewing submitted files and display comment
    const FilePanel = (fileUrl) => {

        const controlBar = () => {
            return ($({
                tag: 'div',
                att: {
                    className: 'viewerTool'
                }
            }))
        }

        const frame = $({
            tag: 'object',
            att: {
                className: 'frameViewer',
                data: fileUrl,
                type: 'application/pdf'
            }
        })

        return ($({
            tag: 'div',
            att: {
                className: 'fileViewerPanelRes'
            },
            child: [
                frame,
                controlBar()
            ]

        }))
    }



    // For submitted files list
    const MessagePanel = () => {
        let bodCo
        const searchBox = () => {

            const searchInput = $({
                tag: 'td',
                att: {
                    className: 'searchBoxTd'
                },
                child: [
                    $({
                            tag: 'span',
                            att: {
                                className: 'fa fa-search serIc'
                            },
                            style: {verticalAlign: 'middle'}
                        }
                    ),
                    $({
                        tag: 'input',
                        att: {
                            type: 'search',
                            className: 'searchInputRes',
                            placeholder:'Search documents'
                        },
                        event:{
                            type:'input',
                            method:(ev)=>{
                                const child=bodCo.childNodes
                                let hasVisibleResults = false;
                                
                                /* Check if child nodes exist */
                                if (!child || child.length === 0) {
                                    // Show "no results" message
                                    showNoResultsMessage();
                                    return;
                                }
                                
                                /* Searching for the value of the input field and displaying the results. */
                                for(let x = 0; x < child.length; x++){ // Fixed: Added condition x < child.length
                                    if(child[x] && child[x].innerText){ // Added check for element existence
                                        const text = child[x].innerText || '';
                                        if(!text.toUpperCase().replace(' ','').includes(ev.target.value.toUpperCase().replace(' ',''))){
                                            child[x].style.display='none'
                                        }else {
                                            child[x].style.display='block'
                                        }
                                    }
                                }
                                // Show/hide "no results" message
                                if (!hasVisibleResults && ev.target.value.trim() !== '') {
                                    showNoResultsMessage();
                                } else {
                                    hideNoResultsMessage();
                                }
                            }
                        }
                    })
                ]
            })
            //"no results" message element
            let noResultsMessage;
            const showNoResultsMessage = () => {
                if (!noResultsMessage) {
                    noResultsMessage = $({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            color: '#999',
                            fontSize: '1.2vw',
                            fontFamily: 'arial, sans-serif',
                            marginTop: '2vh',
                            padding: '2vh',
                            display: 'none'
                        },
                        text: 'No matching documents found'
                    });
                    bodCo.appendChild(noResultsMessage);
                }
                noResultsMessage.style.display = 'block';
            };
            
            const hideNoResultsMessage = () => {
                if (noResultsMessage) {
                    noResultsMessage.style.display = 'none';
                }
            };

            return ($({
                tag: 'table',
                att: {
                    className: 'searchBoxRes'
                },
                child: [
                    $({
                        tag: 'tr',
                        child: [
                            searchInput,
                            $({
                                tag: 'td',
                                style: {
                                    width: '100%',
                                }
                            })
                        ]
                    })
                ]
            }))
        }
        const listDiv = ({date, author, category, title, status, file, id, eventType}) => {
            const Row = ({span, label, text}) => {
                const getRowmin = (rw) => {
                    if (span) {
                        rw.appendChild($({
                            tag: 'td',
                            att: {
                                rowSpan: '2'
                            },
                            style: {
                                width: '5vw',
                                textAlign: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-file-pdf'
                                    },
                                    style: {
                                        fontSize: '3vw',
                                        textShadow: '-.2vw -.2vh .2vw #888,.2vw .2vh .2vw #444',
                                        color: '#333'
                                    }
                                })
                            ]
                        }))
                    }
                    rw.appendChild($({
                        tag: 'td',
                        style: {
                            fontWeight: 'bold',
                            fontFamily: 'arial,sanserif',
                            color: 'deepskyblue',
                            width: '5vw',
                            textAlign: 'right',
                            fontSize: '1vw'
                        },
                        text: label
                    }))
                    rw.appendChild($({
                        tag: 'td',
                        text: text,
                        style: {
                            fontFamily: 'arial,sanserif',
                            color: '#bbb',
                            paddingLeft: '1vw',
                            fontSize: '1vw'
                        }
                    }))
                }
                return ($({
                    tag: 'tr',
                    elementHandler: getRowmin
                }))
            }
            const Title = () => {
                return ($({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                colSpan: '3',
                                innerHTML: `<i>" ${title} "</i>`
                            },
                            style: {
                                fontFamily: 'monospace',
                                color: '#bbb',
                                fontSize: '1vw',
                                textDecoration: 'underline',
                                textDecorationColor: 'deepskyblue',
                                textAlign: 'center'
                            },

                        })
                    ]
                }))
            }


            const Viewer = () => {
                let viewerMain
                const getViewer = (el) => {
                    viewerMain = el
                }

                const closeView = $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        margin: 'auto',
                        marginTop: '1vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: ' Close',
                            att: {
                                className: 'fa-solid fa-right-from-bracket',
                            },
                            style: {
                                fontSize: '2vw',
                                cursor: 'pointer',
                                color: 'deepskyblue'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    viewerMain.remove()
                                }
                            }
                        })
                    ],

                })
                const frame = $({
                    tag: 'iframe',
                    att: {
                        src: '/' + file
                    },
                    style: {
                        width: '80%',
                        height: '90%',
                        margin: 'auto',
                        marginTop: '1vh'
                    }
                })
                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        zIndex: '3',
                        backgroundColor: '#333',
                        top: '0',
                        left: '0',
                        textAlign: 'center'
                    },
                    elementHandler: getViewer,
                    child: [
                        frame,
                        closeView,
                    ]
                }))
            }
            const Controller = () => {
                const Status = $({
                    tag: 'div',
                    att: {
                        className: "fa-solid fa-comments viewListRes"
                    },
                    style: {
                        fontSize: '1vw',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor:'pointer'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                fontFamily: 'arial,sanserif',
                                fontWeight: 'bold',
                                margin:'auto',
                                marginLeft:'.5vw'
                            },
                            text: 'Comments'
                        }),
                    ]
                })
                const View = $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-eye  viewListRes'
                    },
                    style:{
                        fontSize: '1vw',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor:'pointer'
                    },
                    child:[
                        $({
                            tag: 'span',
                            style: {
                                fontFamily: 'arial,sanserif',
                                fontWeight: 'bold',
                                margin:'auto',
                                marginLeft:'.5vw'
                            },
                            text: 'View Docs'
                        }),
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            mainPanel.appendChild(Viewer())
                        }
                    }

                })
                const Delete = $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-trash-can delRes'
                    },
                    style: {
                        paddingLeft: '1vw',
                        paddingRight: '1vw',
                        cursor: 'pointer'
                    },
                    event: {
                        type: 'click',
                        method: async () => {

                            if (confirm("Delete this File?")) {
                                const form = new FormData()
                                form.append('delResearch', 'true')
                                form.append('docId', id)
                                form.append('fileUrl', file)
                                let loading = Waiting()
                                document.body.appendChild(loading)
                                const remove = () => {
                                    loading.remove()
                                }
                                await fetch('/uploadResearchFile', {
                                    method: 'POST',
                                    body: form
                                }).then(res => {
                                    if (res.ok) {
                                        remove()
                                        return res.json()
                                    }
                                }).then(dat => {
                                    alert(dat)
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

                        }
                    }
                })

                return ($({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                colSpan: '3'
                            },

                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width:'30vw',
                                        margin:'auto',
                                        marginTop:'1vh'
                                    },
                                    child: [
                                        Status,
                                        View,
                                        Delete
                                    ]
                                })
                            ]
                        })
                    ]
                }))
            }
            return ($({
                tag: 'table',
                style: {
                    borderBottom: `solid thin ${(status) ? "ghostwhite" : "deepskyblue"}`,
                    width: '99%',
                    margin: 'auto'
                },
                att: {
                    className: 'listRes'
                },
                child: [
                    Row({
                        span: true,
                        label: 'Author: ',
                        text: author
                    }),
                    Row({
                        label: 'Category: ',
                        text: category
                    }),
                    Title(),
                    Controller()
                ]
            }))
        }
        let panelAlllist
        const Endorsement=({date,researchPaper,endorsement,docId,eventType,status})=>{

            let getResPanelHideEl
            const getResPanelHide=(el)=>{
                getResPanelHideEl=el
            }
            let endo

            const getEnd=(el)=>{
                endo=el
            }

            const month=new Date(date.split(' ')[0]).toLocaleString('default', { month: 'long' });
            const dt=date.split(' ')[0].split('-')
            const time=date.split(' ')[1].split(':')



            const ViewEn=()=>{

                const endorsementFile=(file)=>{

                    return($({
                        tag:'div',
                        style:{
                            margin:'1vh auto',
                            width:'80%',
                            height:'90%',
                        },
                        child:[
                            $({
                                tag:'object',
                                att:{
                                    data:'/'+file,
                                    type:'application/pdf'
                                },
                                style:{
                                    width:'100%',
                                    height:'100%',
                                }
                            })
                        ]
                    }))
                }
                let endorseBody,resb,resState=false

                const reason=({message,by})=>{
                    return($({
                        tag:'div',
                        style:{
                            width:'40vw',
                            height:'70vh',
                            backgroundColor:'#444',
                            position:'absolute',
                            top:'-70vh',
                            left:'0',
                            borderRadius:'0 .5vw .5vw 0',
                            boxShadow:'.3vw -.8vh 1vw rgba(0,0,0,0.5)',
                            display:'flex',
                            justifyContent:'center'
                        },
                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'90%',
                                    margin:'auto',
                                    height:'fit-content',
                                    maxHeight:'80%',
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        text:'Correction',
                                        style:{
                                            fontFamily:'arial black, sans-serif',
                                            fontSize:'2vw',
                                            color:'#999',
                                            textDecoration: 'underline'
                                        }
                                    }),
                                    $({
                                        tag:'div',
                                        style:{
                                            height:'fit-content',
                                            maxHeight: '55vh',
                                            margin:'uto',
                                            overflowY:'auto',
                                            fontSize:'1.2w',
                                            color:'#bbb',
                                            fontFamily:'arial black, sans-serif',
                                        },
                                        text:(message!=='')?  message:'No Data available'
                                    })
                                ]
                            })
                        ],
                        elementHandler:(el)=>{
                            resb=el
                        }
                    }))
                }
                const Contrl=$({
                    tag:'div',
                    style:{
                        height:'8%',
                        width:'100%',
                        backgroundColor:'grey',
                        justifyContent:'center',
                        display:'flex',
                        position:'relative'
                    },
                    elementHandler:(el)=>{
                        endorseBody=el
                    },
                    child:[
                        $({
                            tag:'div',
                            style:{
                                width:'50%',
                                height:'100%',
                                margin:'auto',
                                display:'flex',
                                justifyContent:'center',
                                marginLeft:'0',
                                backgroundColor:'#222'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'40%',
                                        height:'90%',
                                        margin:'auto',
                                        paddingRight:'1vw',
                                        paddingLeft:'1vw',
                                        display:'flex',
                                        justifyContent:'center',
                                        cursor:'pointer',
                                        borderRadius:'.5vw'
                                    },
                                    att:{
                                        className:'endorsCnt'
                                    },
                                    event:{
                                        type:'click',
                                        method: async ()=>{
                                            const form= new FormData()
                                            form.append('rejectRequest','true')
                                            form.append('dicId',docId)
                                            await fetch('/getresearch',{
                                                method:'POST',
                                                body:form
                                            }).then(res=>res.json())
                                                .then(data=>{
                                                    resState=!resState
                                                    if(resState){
                                                        endorseBody.appendChild(reason({message:data.message}))
                                                    }else {
                                                        resb.remove()

                                                    }

                                                })
                                        }
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            text:'View Correction',
                                            style:{
                                                fontFamily:'arial black,sans-serif',
                                                fontSize:'1.3vw',
                                                width:'fit-content',
                                                height:'fit-content',
                                                margin:'auto'
                                            }
                                        }),

                                    ]
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        width:'40%',
                                        height:'90%',
                                        margin:'auto',
                                        paddingRight:'1vw',
                                        paddingLeft:'1vw',
                                        display:'flex',
                                        justifyContent:'center',
                                        cursor:'pointer',
                                        borderRadius:'.5vw'
                                    },
                                    att:{
                                        className:'endorsCnt'
                                    },
                                    event:{
                                        type:'click',
                                        method:async ()=>{
                                            if(confirm("Are you sure you want to delete this file?")){
                                                const filrUrl=[];
                                                researchPaper.forEach(val=>{
                                                    filrUrl.push(val.researchFile)
                                                })
                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                const remove = () => {
                                                    loading.remove()
                                                }
                                                const form= new FormData()
                                                form.append('docId',docId)
                                                form.append('fileUrl',endorsement)
                                                form.append('researchFileUrl',JSON.stringify(filrUrl))
                                                form.append('deleteEndorsement','true')
                                                await fetch('/getresearch',{
                                                    method:'POST',
                                                    body:form
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
                                        }
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            text:'Delete',
                                            style:{
                                                fontFamily:'arial black,sans-serif',
                                                fontSize:'1.3vw',
                                                width:'fit-content',
                                                height:'fit-content',
                                                margin:'auto'
                                            }
                                        }),

                                    ]
                                }),
                            ]
                        }),
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-right-from-bracket'
                            },
                            style:{
                                fontSize:'2vw',
                                width:'fit-content',
                                margin:'auto'
                            },
                            event:{
                                type:'click',
                                method:()=>{
                                    endo.remove()
                                }
                            },
                            child:[
                                $({
                                    tag:'span',
                                    text:'Exit',
                                    style:{
                                        fontFamily:'arial black,sans-serif'
                                    }
                                })
                            ]
                        })
                    ]
                })

                return($({
                    tag:'div',
                    style:{
                        width:'100%',
                        height:'100%',
                        backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',
                        position:'absolute',
                        top:'0',
                        left:'0',
                    },
                    elementHandler:getEnd,
                    child:[
                        endorsementFile(endorsement),
                        Contrl,
                    ]
                }))
            }

            const DateFormat=$({
                tag:'div',
                style:{
                    color:'#bbb',
                    textShadow:'-.1vw .1vh .1vw black',
                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize:'1vw',
                    margin:'auto',
                    marginLeft:'1vw',
                    fontWeight:'bold'

                },
                text:dt[0]+' '+month+', '+dt[2]+' | '+TimeConvert(time)
            })
            const EventType=$({
                tag:'div',
                style:{
                    color:'black',
                    textShadow:'0 0 .5vw white',
                    fontFamily:'arial black,sans-serif',
                    fontSize:'1.3vw',
                },
                text:eventType
            })


            const ViewEndorsement=$({
                tag:'div',
                att:{
                    className:'fa-solid fa-eye viewerBotEndorseMain'
                },
                style:{
                    fontSize:'1vw',
                    justifyContent:'center',
                    display:'flex',
                },
                event:{
                    type:'click',
                    method:()=>{
                        mainPanel.appendChild(ViewEn())
                    }
                },
                child:[
                    $({
                        tag:'div',
                        text:(status!=='rejected')?'View Endorsement':"View Correction",
                        style:{
                            fontFamily:'arial,sans-serif',
                            marginLeft:'.5vw',
                        },
                        elementHandler:(el)=>{
                            if(status==='rejected'){
                                el.style.color='#f33'
                            }
                        }
                    })
                ]
            })




            const researchDocs=({resTitle,author,coAuthor,category,file,resId})=>{

                let mainIndiv
                const getlistIndiv=(el)=>{
                    mainIndiv=el

                    el.appendChild(label("Title: ",resTitle))
                    el.append(label("Category: ",category))
                    el.append(label("Author: ",author))
                    el.append(label("Co-Author(s) ",""))
                    JSON.parse(coAuthor).forEach((val,i)=>{
                        el.appendChild(label(`${i+1}.)`,val))
                    })
                    el.append(control())
                }
                const label=(label,text)=>{
                    return($({
                        tag:'div',
                        style:{
                            paddingRight:'.5vw',
                            paddingLeft:'.5vw',
                        },
                        att:{
                            innerHTML:`<span style="font-weight: bold; font-family: Arial,sans-serif;color: deepskyblue;font-size: 1vw">${label}</span> <span style="font-family: Arial,sans-serif;color: #bbb;font-size: 1vw; user-select: text">${text}</span>`
                        }
                    }))
                }
                let resDo

                const getResDo=async (el)=>{

                    resDo=el
                }

                const control=()=>{
                    let resNode
                    const getResason=(el)=>{
                        resNode=el
                    }


                    const button=({icon,text,method})=>{
                        return($({
                            tag:'div',
                            att:{
                                className:icon,
                            },
                            style:{
                                fontSize:'1vw',
                                justifyContent:'flex',
                                whiteSpace:'nowrap',
                                margin:'auto',
                                cursor:'pointer',
                            },
                            event:method,
                            child:[
                                $({
                                    tag:'span',
                                    text:text,
                                    style:{
                                        fontFamily:'arial,sans-serif'
                                    }
                                })
                            ]
                        }))
                    }

                    const ResearchDocPan=(fileHolder)=>{

                        return($({
                            tag:'div',
                            style:{
                                margin:'1vh auto',
                                width:'100%',
                                height:'90%',
                                display:'flex',
                                justifyContent:'center'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'35%',
                                        height:'100%',
                                        overflowY:'auto',
                                        backgroundColor:'#222'
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            style:{
                                                width:'98%',
                                                margin:'auto',
                                                height:'fit-content',
                                                overflowWrap:'break-word'
                                            },
                                            elementHandler: (el)=>{

                                                const comment=(data)=>{

                                                    return($({
                                                        tag:'div',
                                                        elementHandler:(elCom)=>{
                                                            const evalName=$({
                                                                tag:'div',
                                                                style:{
                                                                  color:'black',
                                                                    marginTop:'2vh',
                                                                    marginBottom:'1vh',
                                                                    borderBottom:'solid thin rgba(200,200,200,0.5)',
                                                                    width:'50%'
                                                                },
                                                                child:[
                                                                    $({
                                                                        tag:'span',
                                                                        style:{
                                                                            fontFamily:'arial ,sans-serif',
                                                                            fontSize:'1.1vw',
                                                                        },
                                                                        text:"Evaluator :"
                                                                    }),
                                                                    $({
                                                                        tag:'span',
                                                                        style:{
                                                                            fontFamily:'arial ,sans-serif',
                                                                            fontSize:'1.1vw'
                                                                        },
                                                                        text:data.evalName
                                                                    })
                                                                ]
                                                            })
                                                            const perCommentBody=(title,textContent)=>{
                                                                return($({
                                                                    tag:'div',
                                                                    style:{
                                                                        width:'95%',
                                                                        margin:'auto',
                                                                    },
                                                                    child:[
                                                                        $({
                                                                            tag:'div',
                                                                            text:title+' :',
                                                                            style:{
                                                                                fontFamily:'arial black, sans-serif',
                                                                                fontSize:'1vw',
                                                                                color:'black',
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag:'div',
                                                                            att:{
                                                                                innerHTML:textContent+'\n\n',
                                                                            },
                                                                            style:{
                                                                                fontFamily:'monospace',
                                                                                fontSize:'1vw',
                                                                                color:'black'
                                                                            }
                                                                        })
                                                                    ]
                                                                }))
                                                            }
                                                            elCom.appendChild(evalName)
                                                            if(typeof data==='object'){
                                                                if(data.intro!==null&&data.intro!==''){
                                                                    elCom.appendChild(perCommentBody("Introduction",data.intro.replace('<br>','')))
                                                                }
                                                                if(data.abstract!==null&&data.abstract!==''){
                                                                    elCom.appendChild(perCommentBody("Abstract",data.abstract))
                                                                }
                                                                if(data.objective!==null&&data.objective!==''){
                                                                    elCom.appendChild(perCommentBody("Objective",data.objective))
                                                                }
                                                                if(data.methodology!==null&&data.methodology!==''){
                                                                    elCom.appendChild(perCommentBody("Methodology",data.methodology))
                                                                }
                                                                if(data.results!==null&&data.results!==''){
                                                                    elCom.appendChild(perCommentBody("Result and Discussion",data.results))
                                                                }
                                                                if(data.recommendation!==null&&data.recommendation!==''){
                                                                    elCom.appendChild(perCommentBody("Recommendation and Conclusion",data.recommendation))
                                                                }
                                                                if(data.literature!==null&&data.literature!==''){
                                                                    elCom.appendChild(perCommentBody("Literature",data.literature))
                                                                }
                                                                if(data.other!==null&&data.other!==''){
                                                                    elCom.appendChild(perCommentBody("Other Comments",data.other))
                                                                }
                                                            }

                                                        },
                                                        style:{
                                                            borderBottom: 'solid thin grey',
                                                            marginBottom: '1vh',
                                                            backgroundColor:'white'
                                                        }
                                                    }))
                                                }

                                                const form=new FormData()
                                                form.append('commentRequest','true')
                                                form.append('docId',resId)
                                                 fetch('/uploadResearchFile',{
                                                    method:'POST',
                                                    body:form
                                                }).then(res=>res.json())
                                                    .then(data=>{
                                                        if(data.length>0){
                                                            data.forEach(val=>{
                                                                el.appendChild(comment(val))
                                                            })
                                                        }else {
                                                            el.appendChild($({
                                                                tag:'div',
                                                                style:{
                                                                    width:'100%',
                                                                    height:'50vh',
                                                                    display:'flex',
                                                                    justifyContent:'center',
                                                                },
                                                                child:[
                                                                    $({
                                                                        tag:'div',
                                                                        text:'No comment/reviews available...',
                                                                        style:{
                                                                            margin:'auto',
                                                                            width:'fit-content',
                                                                            height:'ft-content',
                                                                            color:'#999',
                                                                            fontSize:'1.3vw',
                                                                            fontFamily:'monospace ',
                                                                        }
                                                                    })
                                                                ]
                                                            }))
                                                        }

                                                    })
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag:'object',
                                    att:{
                                        data:'/'+fileHolder,
                                        type:'application/pdf'
                                    },
                                    style:{
                                        width:'65%',
                                        height:'100%',
                                    }
                                })
                            ]
                        }))
                    }
                    const comments = (Review) => {

                        let comm
                        const getComment = (el) => {
                            comm = el
                        }
                        let printBody


                        const Controller = () => {

                            const bot = ({label, eventHandler, style,icon}) => {
                                return ($({
                                    tag: 'div',
                                    style: style,
                                    event: {
                                        type: 'click',
                                        method: eventHandler
                                    },
                                    att: {
                                        className: 'botPr'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                margin: 'auto',
                                                color:'deepskyblue',
                                                fontSize:'1.1vw',
                                                display:'flex',
                                                width:'100%',
                                                height:'100%'
                                            },
                                            child:[
                                                $({
                                                    tag:'div',
                                                    style:{
                                                        margin:'auto',
                                                        width:'fit-content',
                                                        height:'fit-content',
                                                        marginLeft:'.5vw',
                                                        marginRight:'auto'
                                                    },
                                                    att:{
                                                        className:icon
                                                    }
                                                }),
                                                $({
                                                    tag:'div',
                                                    style:{
                                                        margin:'auto',
                                                        width:'fit-content',
                                                        height:'fit-content',
                                                        marginLeft:'.5vw',
                                                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                        marginRight:'100%'
                                                    },
                                                    text:label
                                                })
                                            ]
                                        })
                                    ]
                                }))
                            }

                            return ($({
                                tag: 'div',
                                style: {
                                    backgroundColor: '#555',
                                    width: '10%',
                                    height: '100%',
                                    margin: 'auto',
                                    marginLeft: '0',
                                    position: 'relative'
                                },
                                child: [
                                    bot({
                                        icon:'fa-solid fa-print',
                                        label:'Print',
                                        eventHandler: () => {
                                            const printPage = document.getElementById('commentPDF')
                                            let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');
                                            WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')
                                            WinPrint.document.write(printPage.innerHTML);
                                            WinPrint.document.close();
                                            WinPrint.focus();
                                            WinPrint.print();
                                            WinPrint.close();
                                        },
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: '5vh',
                                            top: 'auto',
                                            height: '5vh',
                                            backgroundColor: '#444',
                                            width: '100%',
                                            cursor: 'pointer'
                                        }

                                    }),
                                    bot({
                                        icon: "fa-solid fa-rectangle-xmark",
                                        label:'Close',
                                        eventHandler: () => {
                                            comm.remove()
                                        },
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: '0',
                                            top: 'auto',
                                            height: '5vh',
                                            backgroundColor: '#444',
                                            width: '100%',
                                            cursor: 'pointer'
                                        },
                                    })
                                ]
                            }))
                        }


                        const print = $({
                            tag: 'div',
                            style: {
                                height: '100%',
                                justifyContent: 'center',
                                display: 'flex',
                                width: '100%',
                                overflowY: 'auto',
                                userSelect: 'text'
                            },


                            child: [
                                Print({
                                    title: resTitle,
                                    campus: "",
                                    author: author,
                                    category: category,
                                    date: '1-21-2022',
                                    review: Review,
                                    getHandler: (el) => {
                                        printBody = el
                                    }
                                }),
                                /*
                                Main({
                                    evalName: reviews.evalName,
                                    title: title,
                                    author: author,
                                    campus: '',
                                    category: reviews.category,
                                    date: '',
                                    intro: reviews.intro,
                                    abstract: reviews.abstract,
                                    objective: reviews.objective,
                                    methodology: reviews.methodology,
                                    results: reviews.results,
                                    recommendation: reviews.recommendation,
                                    literature: reviews.literature,
                                    other: reviews.other,

                                })
                                 */
                            ]
                        })
                        return ($({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                left: '0',
                                top: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#333',
                                justifyContent: 'center',
                                display: 'flex',
                                zIndex:'9999999'
                            },
                            elementHandler: getComment,
                            child: [
                                Controller(),
                                print
                            ]
                        }))
                    }
                    const resBody=()=>{
                        const remover=$({
                            tag:'div',
                            style:{
                                height:'8%',
                                width:'100%',
                                backgroundColor:'#333',
                                justifyContent:'center',
                                display:'flex'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-right-from-bracket comP'
                                    },
                                    style:{

                                        fontSize:'1.2vw',
                                        width:'fit-content',
                                        margin:'auto',
                                        cursor:'pointer',
                                        marginLeft:'.5vw'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            resDo.remove()
                                        }
                                    },
                                    child:[
                                        $({
                                            tag:'span',
                                            text:'Exit',
                                            style:{
                                                fontFamily:'arial black,sans-serif'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag:'div',
                                    att:{
                                        className:'fa-solid fa-print comP'
                                    },
                                    style:{
                                        fontSize:'1.2vw',
                                        width:'fit-content',
                                        margin:'auto',
                                        cursor:'pointer',
                                        marginLeft:'.5vw',
                                        marginRight:'70%'
                                    },
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            /*
                                            const form = new FormData()
                                        form.append('commentRequest', 'true')
                                        form.append('docId', docId)
                                        fetch('/uploadResearchFile', {
                                            method: "POST",
                                            body: form
                                        }).then(res => res.json())
                                            .then(data => {
                                                mainFrame.appendChild(comments(data))
                                            })
                                             */
                                            const req= new Request('/uploadResearchFile')
                                            req.Post([
                                                {
                                                    name:'commentRequest',
                                                    value:'true'
                                                },
                                                {
                                                    name:'docId',
                                                    value:resId
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                bodCo.appendChild(comments(data))
                                            })
                                        }
                                    },
                                    child:[
                                        $({
                                            tag:'span',
                                            text:'Print Comments',
                                            style:{
                                                fontFamily:'arial black,sans-serif'
                                            }
                                        })
                                    ]
                                }),

                            ]
                        })
                        return($({
                            tag:'div',
                            style:{
                                width:'100%',
                                height:'100%',
                                backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',
                                position:'absolute',
                                top:'0',
                                left:'0',
                            },
                            elementHandler:getResDo,
                            child:[
                                ResearchDocPan(file),
                                remover,
                            ]
                        }))
                    }

                    return($({
                        tag:'div',
                        style:{
                            height:'4vh',
                            width:'95%',
                        //    backgroundColor:'grey',
                            margin:'1vh auto auto resBotIndi',
                            display:'flex',
                            justifyContent:'center',

                        },
                        child:[
                            button({
                                icon:'fa-solid fa-file resBotIndi contr',
                                text:'View Document',
                                method:{
                                    type:'click',
                                    method:()=>{
                                        mainPanel.appendChild(resBody())
                                    }
                                }
                            }),
                        ]
                    }))
                }

                return($({
                    tag:'div',
                    style:{
                        width:'95%',
                        height:'fit-content',
                        margin:'1vh auto',
                        border:'solid thin rgba(200,200,200,0.3)',
                        padding:'.2rem',
                        borderRadius:'.5vw'
                    },
                    elementHandler:getlistIndiv,
                    att:{
                        className:'resListInn'
                    },

                }))
            }

            const OpenResearchers=()=>{
                return($({
                    tag:'div',
                    att:{
                        className:'fa-solid fa-eye viewerBotEndorseMain'
                    },
                    style:{
                        fontSize:'1vw',
                        justifyContent:'center',
                        display:'flex',
                        margin:'auto'
                    },
                    event:{
                        type:'click',
                        method:(event)=>{
                            if(!getResPanelHideEl.className.includes('resHiderOpen')){
                                getResPanelHideEl.className+=' resHiderOpen'
                                researchPaper.forEach(val=>{
                                    getResPanelHideEl.appendChild(researchDocs({
                                        resTitle:val.title,
                                        author:val.author,
                                        coAuthor:val.coauthor,
                                        category:val.category,
                                        resId:val.docId,
                                        file:val.researchFile
                                    }))
                                })
                                event.target.style.color='red'
                            }else {
                                getResPanelHideEl.className=getResPanelHideEl.className.replace(' resHiderOpen','')
                                getResPanelHideEl.innerHTML=''
                                event.target.style.removeProperty('color')
                            }

                        }
                    },
                    child:[
                        $({
                            tag:'div',
                            text:'Open Entry list',
                            style:{
                                fontFamily:'arial,sans-serif',
                                marginLeft:'.5vw'
                            }
                        })
                    ]
                }))
            }

            const ResearchPanelHide=()=>{
                return($({
                    tag:'div',
                    att:{
                        className:'resHiderclose'
                    },
                    elementHandler:getResPanelHide,


                }))
            }

            return($({
                tag:'div',
                style:{
                    paddingTop: '1vh',
                    paddingBottom: '1vh',
                    margin:'.5vw auto',
                    paddingLeft:'1vw',
                    paddingRight:'1vw',
                    border:'solid thin rgba(100,100,100,0.3)',
                    width:'90%',
                    cursor:'pointer',
                    borderRadius:'.5vw'
                },
                elementHandler:(el)=>{
                    el.addEventListener('mouseenter',function (){
                        this.style.backgroundColor='rgba(0,0,0,0.5)'
                        this.style.transition='.3s'
                    })
                    el.addEventListener('mouseleave',function (){
                        this.style.backgroundColor='transparent'
                    })
                },

                child:[
                    $({
                        tag:'div',
                        style:{
                            display:'flex',
                            width:'fit-content',
                          //  backgroundImage:'linear-gradient(to right,grey,transparent)',
                            padding:'.2rem',
                            borderRadius:'1vw 0 0 1vw',
                            paddingLeft:'1vw',
                            paddingRight:'1vw'
                        },
                        elementHandler:(el)=>{
                            if(status!=='rejected'){
                                el.style.backgroundImage='linear-gradient(to right,grey,transparent)'
                            }else {
                                el.style.backgroundImage='linear-gradient(to right,#faa,transparent)'
                            }
                        },
                        child:[
                            EventType,
                            DateFormat,
                        ]
                    }),
                    $({
                        tag:'div',
                        style:{
                            display:'flex',
                            justifyContent:'center',
                            marginTop:'1vh',

                        },
                        child:[
                            ViewEndorsement,
                            OpenResearchers(),

                        ]
                    }),
                    ResearchPanelHide()
                ]
            }))
        }
        const getListPanel = async (panel) => {
            bodCo=panel
            panelAlllist=panel
            const form = new FormData()
            form.append('researchReviewed', 'true')
            await fetch('/uploadResearchFile', {
                method: 'POST',
                body: form
            }).then(res => res.json())
                .then(data => {

                    data.list.forEach(val => {

                        panel.insertBefore(Endorsement({
                            date:val.date,
                            eventType:val.eventType,
                            researchPaper:val.ResearchDocs,
                            status:val.status,
                            endorsement:val.endorsementFile,
                            docId:val.id,
                        }), panel.childNodes[0])


                    })
                })
        }

        const listPanel = () => {

            return ($({
                tag: 'div',
                att: {
                    className: 'listPRes'
                },
                elementHandler: getListPanel
            }))
        }

        const ownPanel = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '60%',
                    height: '100%',
                    margin: 'auto'
                },
                child: [
                    searchBox(),
                    listPanel()
                ]
            }))
        }
        const allPanel = () => {

            let MainBody

            const Files=$({
                tag:'div',
                style:{

                }
            })

            const search = () => {
                const searchBox = $({
                    tag: 'div',
                    style: {
                        margin: 'auto',
                        marginLeft: '0',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '1vw',
                        display: 'flex',
                        justifyContent: 'center',
                        paddingLeft: '.5vw',
                        paddingRight: '.5vw'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-magnifying-glass',
                            },
                            style: {
                                fontSize: '1.5vw',
                                height: 'fit-content',
                                margin: 'auto',
                                color: 'deepskyblue'
                            }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                className: 'searchAll',
                                placeholder: 'search file name'
                            },
                        })
                    ]
                })
                return ($({
                    tag: 'div',
                    style: {
                        height: '10%',
                        width: '100%',
                        backgroundColor: '#333',
                        display: 'flex'
                    },
                    child: [
                        searchBox
                    ]
                }))
            }
            const Select=()=>{
                return($({
                    tag:'div',
                    style:{
                        height:'fit-content',
                        width:'70%',
                        display:'flex',
                        justifyContent:'center',

                    },
                    child:[
                        $({
                            tag:'select',
                            style:{
                                height:'5vh',
                                width:'100%',
                                fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                border:'solid thin gba(200,200,200,0.3)',
                                outline:'none',
                                backgroundColor:'rgba(0,0,0,0.1)',
                                marginLeft:'0',
                                marginRight:'auto',
                                textAlign:'center',
                                fontSize:'1.3vw',
                                color:'#bbb',
                                borderRadius:'.5vw',
                                cursor:'pointer'
                            },
                            elementHandler:async (el)=>{
                                el.appendChild($({
                                    tag:'option',
                                    att:{
                                        innerText:'- - Select Event - -',
                                        disabled:true,
                                        selected:true
                                    },
                                    style:{
                                        backgroundColor:'#333'
                                    }
                                }))
                                el.appendChild($({
                                    tag:'option',
                                    att:{
                                        innerText:'All Events',
                                    },
                                    style:{
                                        backgroundColor:'#333'
                                    }
                                }))

                            },
                            event:{
                                type:'change',
                                method:async ()=>{
                                    const form = new FormData();
                                    form.append('researchFile', 'true')
                                    await fetch('/getresearch', {
                                        method: 'POST',
                                        body: form
                                    }).then(res => res.json())
                                        .then(data => {

                                        })
                                }
                            }
                        })
                    ]
                }))
            }
            const Load=()=>{
                return($({
                    tag:'div',
                    style:{
                        fontSize:'2vw',
                        color:'deepskyblue',
                        height:'5vh',
                        width:'30%',
                        display:'flex',
                        justifyContent:'center',
                    },
                    child:[
                        $({
                            tag:'div',
                            att:{
                                className:'fa-solid fa-arrows-rotate'
                            },
                            style:{
                                width:'fit-content',
                                height:'fit-content',
                                margin:'auto'
                            }
                        })
                    ]
                }))
            }

            const bodyContainer = () => {

                const group=({text,id})=>{
                    let StateBot=false,lebBot,bod

                    const ListCampus=(content,resList)=>{
                        const Panel=(docID)=>{
                            let mainP
                            const file=(url)=>{
                                return($({
                                    tag:'div',
                                    style:{
                                        margin:'auto',
                                        width:'80%',
                                        height:'98%',
                                        position:'relative',
                                    },
                                    child:[
                                        $({
                                            tag:'div',
                                            att:{
                                                className:'fa-solid fa-circle-xmark'
                                            },
                                            style:{
                                                fontSize:'3vw',
                                                position:'absolute',
                                                left:'-4vw',
                                                color:'deepskyblue',
                                                cursor:'pointer'
                                            },
                                            event:{
                                                type:'click',
                                                method:()=>{
                                                    mainP.remove()
                                                }
                                            },
                                        }),
                                        $({
                                            tag:'object',
                                            att:{
                                                data:'/'+url,
                                                type:'application/pdf'
                                            },
                                            style:{
                                                width:'100%',
                                                height:'100%'
                                            }
                                        })
                                    ]
                                }))
                            }

                            return($({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    height:'100%',
                                    position:'absolute',
                                    top:'0',
                                    left:'0',
                                    backgroundImage:'radial-gradient(rgba(100,100,100,0.5),black)',
                                    display:'flex',
                                    justifyContent:'center'
                                },
                                elementHandler:(el)=>{
                                    mainP=el
                                    const req=new Request('/uploadResearchFile')
                                    const reqList=[]
                                    reqList.push({
                                        name:'fileReqRes',
                                        value:'true'
                                    })
                                    reqList.push({
                                        name:'docId',
                                        value:docID
                                    })
                                    req.Post(reqList)

                                    /* Sending a request to the server and then appending the response to the DOM. */
                                    req.Send().then(data=>{
                                        el.appendChild(file(data))
                                    }).catch(res=>{
                                        console.log(res)
                                    })
                                }

                            }))
                        }

                        let bodEl,campState=false
                        const fileListName=({author,name,id})=>{
                            return($({
                                tag:'div',
                                style:{
                                    textAlign:'left',
                                    width:'98%',
                                    margin:'auto',
                                    whiteSpace:'nowrap',
                                    textOverflow:'ellipsis',
                                    overflow:'hidden',
                                    paddingTop:'.5vh',
                                    paddingBottom:'.5vh'
                                },
                                att:{
                                    title:author,
                                    className:'perRes',
                                    innerHTML:'<span style="font-size: 1.4vw" class="fa-solid fa-file-pdf"> &nbsp</span> '+name
                                },
                                event:{
                                    type:'click',
                                    method:async ()=>{
                                        let loading = Waiting()
                                        bodEl.appendChild(loading)
                                        const remove = () => {
                                            loading.remove()
                                        }
                                        const form= new FormData()
                                        form.append("checkAccess","true")
                                        form.append("docId",id)
                                        await fetch('/requestDocs',{
                                            method:'POST',
                                            body:form
                                        }).then(res => {
                                            if (res.ok) {
                                                remove()
                                                return res.json()
                                            }
                                        }).then(dat => {

                                            if (dat.status==='allowed') {
                                                bodEl.appendChild(Panel(id))
                                            } else if(dat.status==='requested'){
                                                bodEl.appendChild(ConfirmationAlert("Request was sent. please wait for the respond..!", () => {
                                                    window.location.reload()
                                                }))
                                            }
                                            else {
                                                remove()
                                                setTimeout( ()=>{
                                                    if(confirm("You don't have permission to open this file.\n Do you want to send a request?")){
                                                        /* Creating a new request object. */
                                                        const req= new Request('/requestDocs')
                                                        const formReq=[]
                                                        formReq.push({
                                                            name:'sendRequest',
                                                            value:'true'
                                                        })
                                                        formReq.push({
                                                            name:'docId',
                                                            value:id
                                                        })
                                                        req.Post(formReq)
                                                        req.Json()
                                                        req.Send().then(data=>{
                                                            bodEl.appendChild(ConfirmationAlert(data.message, () => {
                                                                window.location.reload()
                                                            }))
                                                        })
                                                    }
                                                },50)
                                            }
                                        })

                                    }
                                }
                            }))
                        }
                        return($({
                            tag:'div',
                            att:{
                                className:'listCampEv'
                            },
                            child:[
                                $({
                                    tag:'div',
                                    style:{
                                        width:'100%',
                                    },
                                    text:content,
                                    event:{
                                        type:'click',
                                        method:()=>{
                                            campState=!campState
                                            if(campState){
                                                resList.forEach(val=>{
                                                    bodEl.appendChild(fileListName({
                                                        author:val.author,
                                                        id:val.id,
                                                        name:val.title
                                                    }))
                                                })
                                            }else {
                                                bodEl.innerHTML=''
                                            }

                                        }
                                    }
                                }),
                                $({
                                    tag:'div',
                                    style:{
                                        width:'100%',
                                        height:'fit-content',
                                    },
                                    elementHandler:(el)=>{
                                        bodEl=el
                                    },
                                })
                            ],
                            event:{
                                type:'click',
                                method:()=>{

                                }
                            }

                        }))
                    }


                    return($({
                        tag:'div',
                        style:{
                            fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                            width:'95%',
                            paddingBottom:'1vh',
                            paddingTop:'1vh',
                            border:'solid thin grey',
                            margin:'auto',
                            marginTop:'2vh', borderRadius: '.5vw'
                            
                        },
                        att:{
                            className:'campDivBot'
                        },

                        child:[
                            $({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    height:'100%',
                                    textAlign:'center',
                                    fontSize:'1vw',
                                    
                                },
                                text:text,
                                elementHandler:(el)=>{
                                    lebBot=el
                                },
                                event:{
                                    type:'click',
                                    method:(event)=>{

                                        StateBot=!StateBot
                                        const me= new Request('/uploadResearchFile')
                                        const req=[];
                                        req.push({
                                            name:'researchFile',
                                            value:'true'
                                        })
                                        req.push({
                                            name:'eventType',
                                            value:text
                                        })
                                        CapsuOffice.forEach(val=>{
                                            req.push({
                                                name:'capName[]',
                                                value:val
                                            })
                                        })
                                        me.Post(req)
                                        me.Json()
                                        me.Send().then(data=>{
                                            if(StateBot){
                                                data.list.forEach(val=>{
                                                    bod.style.marginTop='2vh'
                                                    bod.appendChild(ListCampus(val.name,val.list))
                                                })
                                            }else {
                                                bod.innerHTML=''
                                                bod.style.marginTop='0'
                                            }
                                        })


                                    }
                                },
                            }),
                            $({
                                tag:'div',
                                style:{
                                    width:'100%',
                                    height:'fit-content',
                                    fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                    color:'#bbb'
                                },
                                elementHandler:(el)=>{
                                    bod=el
                                }
                            })
                        ]
                    }))
                }

                return ($({
                    tag: 'div',
                    style: {
                        height: '94%',
                        width: '100%',
                        overflowY: 'auto',
                        textAlign: 'center',
                        backgroundColor:'rgba(0,0,0,0.2)'
                    },
                    elementHandler: async (el)=>{
                        MainBody=el
                        const form= new FormData()
                        //getEvent
                        //getEventAdmin
                        form.append('getEventAdmin','true')
                        await fetch('/eventRequest',{
                            method:'POST',
                            body:form
                        }).then(res=>res.json())
                            .then(data=>{
                                data.forEach(val=>{
                                    el.appendChild(group({text:val.name,id:val.id}))
                                })
                            })
                    }
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    width: '49%',
                    height: '100%',
                    margin: 'auto',

                },
                child: [

                    $({
                        tag:'div',
                        style:{
                            height:'5vh',
                            width:'100%'
                        },
                        child:[
                            search()
                        ]
                    }),
                    bodyContainer()
                ]
            }))
        }

        return ($({
            tag: 'div',
            att: {
                className: 'messagePanelRes'
            },
            child: [
                ownPanel(),
                allPanel()
            ]
        }))
    }

    return ($({
        tag: 'div',
        style:{
            position:'relative'
        },
        att: {
            className: 'createPan sumittedPan'
        },
        elementHandler: getMain
    }))
}



export const Research = () => {

    const tabButton = ({label, url}) => {
        const current = window.location.href
        const isActive = url.split('/')[3] === current.replace(window.location.origin, '').split('/')[3]
        const getBot = (bot) => {
            if (isActive) {
                bot.className += ' tabActive'
            }
        }
        return ($({
            tag: 'td',
            att: {
                className: 'tabsres'
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
    const tabsPage = []
    tabsPage.push({
        url: '/user/research/submittedDocs/submittedFiles',
        tab: tabButton({
            label: 'Documents',
            url: '/user/research/submittedDocs/submittedFiles'
        }),
        page: Submitted
    })
    tabsPage.push({
        url: '/user/research/createNewFle',
        tab: tabButton({
            label: 'Upload File',
            url: '/user/research/createNewFle'
        }),
        page: CreateNew
    })

    /*
     tabsPage.push({
         url: '/user/research/Endorsement',
         tab: tabButton({
             label: 'Endorsement Letter',
             url: '/user/research/Endorsement'
         }),
         page: Endorsement
     })
     */


    const tabs = ({getRow}) => {
        return ($({
            tag: 'table',
            att: {
                className: 'tabsHeader'
            },
            child: [
                $({
                    tag: 'tr',
                    elementHandler: getRow
                })
            ]
        }))
    }

    const tabFrame = ({getFrame}) => {

        return ($({
            tag: 'div',
            att: {
                className: 'tabFrame'
            },
            elementHandler: getFrame
        }))
    }
    const getTabsTable = (table) => {
        tabsPage.forEach(val => {
            table.appendChild(val.tab)
        })
        table.appendChild($({
            tag: 'td',
            style: {
                width: 'auto'
            }
        }))
    }
    const getResFrame = (frame) => {
        tabsPage.forEach(val => {
            const current = window.location.href
            const isActive = val.url.split('/')[3] === current.replace(window.location.origin, '').split('/')[3]
            if (isActive) {
                frame.appendChild(val.page())
            }

        })
    }
    return ($({
        externalStyle: '/client/component/userComponent/userComponentStyle/researchStyle.css',
        tag: 'div',
        att: {
            className: 'researchPanel'
        },
        child: [
            tabs({getRow: getTabsTable}),
            tabFrame({getFrame: getResFrame})
        ]

    }))
}

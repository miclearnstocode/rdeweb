import {
    $,
    CapsuOffice,
    ConfirmationAlert,
    dataURLtoFile,
    Dim, Move,
    ResizeImage,
    SpecialChar,
    Waiting
} from '../../../lib/lib.js'
import {Error} from "../../../error.js";


const userInfo = () => {
    const left = () => {
        let leftMain
        const LabelTop = $({
            tag: 'div',
            style: {
                fontFamily: 'Arial,sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '1vh',
                fontSize: '1.4vw',
                color: 'rgba(200,200,200,0.6)',

            },
            text: "User's Information",
        })

        const container = ({child, buttonEvent}) => {
            const getbod = (bod) => {
                if (child) {
                    bod.append(child)
                }
            }
            const leftPart = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '85%',
                        height: '100%',
                        margin: 'auto',
                    },
                    elementHandler: getbod
                }))
            }
            const getBot = (bot) => {
                bot.addEventListener('click', buttonEvent)
            }
            const rightBot = () => {

                return ($({
                    tag: 'div',
                    style: {
                        width: '10%',
                        height: '100%',
                        margin: 'auto',
                        justifyContent: 'center',
                        display: 'flex',
                        fontSize: '2vw',
                        color: 'deepskyblue'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa fa-edit pointerUser',
                            },
                            elementHandler: getBot
                        })
                    ]
                }))
            }
            return ($({
                tag: 'div',
                att: {
                    className: 'perInfo'
                },
                child: [
                    leftPart(),
                    rightBot()
                ]

            }))
        }

        const UserInfo = ({data, label}) => {
            const Name = $({
                tag: 'td',
                style: {
                    color: 'ghostwhite'
                },
                text: data
            })
            return ($({
                tag: 'table',
                att: {
                    className: 'tableUser'
                },
                child: [
                    Name,
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                style: {
                                    color: '#999',
                                    fontSize: '1vw'
                                },
                                text: label
                            })
                        ]
                    })
                ]
            }))
        }

        const buttonEvent = ({component}) => {
            let content
            const Close = () => {
                return ($({
                    tag: 'div',
                    att: {
                        className: 'fa fa-close closeBotUser',
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            content.remove()
                        }
                    }
                }))
            }
            const getfloater = (element) => {
                content = element
                if (component) {
                    element.appendChild(component)
                }
            }
            leftMain.appendChild($({
                tag: 'div',
                att: {
                    className: 'editUserDiv'
                }, elementHandler: getfloater,
                child: [Close()]
            }))

        }

        const nameField = () => {
            let data=''

            const inputField = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    className: 'nameField',
                                    placeholder: 'Enter full name'
                                },
                                event:{
                                    type:'input',
                                    method:(el)=>{
                                        data=el.target.value
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
            const save = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        style: {textAlign: 'center'},
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'saveDivEdit'
                                },
                                text: 'Save',
                                event:{
                                    type:'click',
                                    method:async ()=>{
                                        if(confirm("Click ok to CONFIRM")){
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const remove = () => {
                                                loading.remove()
                                            }
                                            const form= new FormData();
                                            form.append('changeName','true')
                                            form.append('data',data)
                                            await fetch('/settings',{
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
                                }
                            })
                        ]
                    })
                ]
            })


            buttonEvent({
                component: $({
                    tag: 'table',
                    att: {
                        className: 'fieldEditor'
                    },
                    child: [
                        inputField,
                        save
                    ]
                })
            })
        }


        const designation = () => {
            let data
            const textInput = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    className: 'nameField',
                                    placeholder: 'Enter Designation'
                                },
                                event:{
                                    type:'input',
                                    method:(el)=>{
                                        data=el.target.value
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
            const Save = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        style: {textAlign: 'center'},
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'saveDivEdit'
                                },
                                style:{
                                    pointerEvents:'none'
                                },
                                text: 'Save',
                                event:{
                                    type:'click',
                                    method:async ()=>{

                                        if(confirm("Click ok to CONFIRM")){
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const remove = () => {
                                                loading.remove()
                                            }
                                            const form= new FormData();
                                            form.append('changeDesignation','true')
                                            form.append('data',data)
                                            await fetch('/settings',{
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
                                }

                            })
                        ]
                    })
                ]
            })

            buttonEvent({
                component: $({
                    tag: 'table',
                    att: {
                        className: 'fieldEditor'
                    },
                    child: [
                        textInput,
                        Save
                    ]
                })
            })
        }

        const email = () => {
            let data
            const textInput = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        child: [
                            $({
                                tag: 'input',
                                att: {
                                    type: 'email',
                                    className: 'nameField',
                                    placeholder: 'Enter new E-Mailer address'
                                },
                                event:{
                                    type:'input',
                                    method:(el)=>{
                                        data=el.target.value
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
            const Save = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        style: {textAlign: 'center'},
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'saveDivEdit'
                                },
                                text: 'Save',
                                event:{
                                    type:'click',
                                    method:async ()=>{

                                        if(confirm("Click ok to CONFIRM")){
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const remove = () => {
                                                loading.remove()
                                            }
                                            const form= new FormData();
                                            form.append('changeEmail','true')
                                            form.append('data',data)
                                            await fetch('/settings',{
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
                                }
                            })
                        ]
                    })
                ]
            })
            buttonEvent({
                component: $({
                    tag: 'table',
                    att: {
                        className: 'fieldEditor'
                    },
                    child: [
                        textInput,
                        Save
                    ]
                })
            })
        }

        const office = () => {
            let data
            const getCampus = (select) => {
                select.appendChild($({
                    tag:'option',
                    att:{
                        selected:true,
                        innerText   :'Select Campus/Office',
                        disabled:true
                    }
                }))
                CapsuOffice.forEach(val => {
                    select.appendChild($({
                        tag: 'option',
                        att: {
                            innerText: val
                        },
                        style: {
                            color: 'black'
                        }
                    }))
                })
            }

            const textInput = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        child: [
                            $({
                                tag: 'select',
                                att: {
                                    className: 'nameField',
                                },
                                elementHandler: getCampus,
                                event:{
                                    type:'change',
                                    method:(el)=>{
                                        data=el.target.value
                                    }
                                }
                            })
                        ]
                    })
                ]
            })
            const Save = $({
                tag: 'tr',
                child: [
                    $({
                        tag: 'td',
                        style: {textAlign: 'center'},
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'saveDivEdit'
                                },
                                text: 'Save',
                                event:{
                                    type:'click',
                                    method:async ()=>{

                                        if(confirm("Click ok to CONFIRM")){
                                            let loading = Waiting()
                                            document.body.appendChild(loading)
                                            const remove = () => {
                                                loading.remove()
                                            }
                                            const form= new FormData();
                                            form.append('changeCampus','true')
                                            form.append('data',data)
                                            await fetch('/settings',{
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
                                }
                            })
                        ]
                    })
                ]
            })
            buttonEvent({

                component: $({
                    tag: 'table',
                    att: {
                        className: 'fieldEditor'
                    },
                    child: [
                        textInput,
                        Save
                    ]
                })
            })
        }


        return ($({
            tag: 'div',
            att: {
                className: 'leftUserInfo'
            },
            elementHandler: async (el)=>{
                el.appendChild(LabelTop)
                leftMain=el
                const form=new FormData()
                form.append('settingsInfo','true')
                await fetch('/settings', {
                    method:'POST',
                    body:form
                }).then(res=>res.json())
                    .then(data=>{
                       el.appendChild(container({
                           child:UserInfo({
                               data:data.data.fullName,
                               label:'Full Name'
                           }),
                           buttonEvent:nameField
                       }))
                        el.appendChild(container({
                            child:UserInfo({
                                data:data.data.userType,
                                label:'Designation'
                            }),
                            buttonEvent:designation
                        }))
                        el.appendChild(container({
                            child:UserInfo({
                                data:data.data.email,
                                label:'Email address'
                            }),
                            buttonEvent:email
                        }))
                        el.appendChild(container({
                            child:UserInfo({
                                data:data.data.campus,
                                label:'Office/Campus'
                            }),
                            buttonEvent:office
                        }))
                    })

            },


        }))
    }

    const right = () => {
        let mainRight
        const getMain = (element) => {
            mainRight = element
        }

        const label = $({
            tag: 'div',
            att: {
                className: 'rightLabel'
            },
            text: 'User,s name and Password'
        })

        const UserName = () => {
            return ($({
                tag: 'table',
                att: {
                    className: 'userLabel'
                },
                child: [
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                style:{
                                    textAlign:'center'
                                },
                                elementHandler:async (el)=>{
                                    const form=new FormData()
                                    form.append('settingsInfo','true')
                                    await fetch('/settings', {
                                        method:'POST',
                                        body:form
                                    }).then(res=>res.json())
                                        .then(data=>{
                                            el.innerText=data.data.username
                                        })
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'tr',
                        child: [
                            $({
                                tag: 'td',
                                text: 'User Name',
                                style: {
                                    fontWeight: 'normal',
                                    color: '#bbb',
                                    fontSize: '1vw',
                                    textAlign: 'center'
                                }
                            })
                        ]
                    })
                ]
            }))
        }

        const Container = () => {

            const accBot = ({name, button}) => {

                const getBot = (element) => {
                    if (button) {
                        element.appendChild($({
                            tag: 'span',
                            att: {
                                className: `${button.class} acBotUser`
                            },
                        }))
                    }
                }

                return ($({
                    tag: 'tr',
                    att: {
                        className: 'trBot'
                    },
                    event: {
                        type: 'click',
                        method: button.method
                    },
                    child: [

                        $({
                            tag: 'td',
                            att: {
                                className: 'acBot'
                            },
                            elementHandler: getBot
                        }),
                        $({
                            tag: 'td',
                            att: {
                                className: ''
                            },
                            text: name
                        }),
                    ]
                }))
            }

            const Password = ({placeholder,eventMethod}) => {

                return ($({
                    tag: 'div',
                    att: {
                        className: 'passCont'
                    },
                    child: [
                        $({
                            tag: 'input',
                            att: {
                                type: 'password',
                                placeholder:placeholder,
                                maxLength: '20',
                                minLength:'8'
                            },
                            event: {
                                type: 'input',
                                method: eventMethod
                            },
                            style: {
                                backgroundColor: 'transparent',
                                height: '100%',
                                width: '95%',
                                border: 'none',
                                outline: 'none',
                                paddingRight: '1vw',
                                paddingLeft: '1vw',
                                fontFamily: 'monospace',
                                fontSize: '1.5vw',
                                color: '#bbb'
                            },
                            elementHandler:SpecialChar
                        })
                    ]
                }))
            }

            const mainEditorContainer = ({content}) => {
                let contain
                const getContain = (elem) => {
                    contain = elem
                    elem.appendChild(Close)
                    content.forEach(val => {
                        contain.appendChild(val())
                    })
                }
                const Close = $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-rectangle-xmark closeRight'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            contain.remove()
                        }
                    }
                })


                return ($({
                    tag: 'div',
                    att: {
                        className: 'editorCont'
                    },
                    elementHandler: getContain,

                }))
            }

            const SaveButton = ({Method, url}) => {
                let request=[]

                const getSaveBot = (save) => {

                    save.addEventListener('click', async () => {
                        Method(request)
                        if (request && url) {
                            alert(JSON.stringify(request))
                            let loading = Waiting()
                            document.body.appendChild(loading)
                            const remove = () => {
                                loading.remove()
                            }
                            const form = new FormData()
                            request.forEach(val => {
                                form.append(val.reqName, val.reqVal)
                            })
                            await fetch(url, {
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
                        request=[]
                    })
                }

                return ($({
                    tag: 'div',
                    att: {
                        className: 'saveBotAcc'
                    },
                    text: 'Apply Changes',
                    elementHandler: getSaveBot
                }))
            }



            const changeUserName = () => {
                let userName=''
                let password=''
                const EditUserName = () => {

                    const inputUser = () => {
                        return ($({
                            tag: 'div',
                            att: {
                                className: 'userEdit'
                            },
                            child: [
                                $({
                                    tag: 'input',
                                    att: {
                                        placeholder: 'Enter new Username'
                                    },
                                    style: {
                                        backgroundColor: 'transparent',
                                        height: '100%',
                                        width: '95%',
                                        border: 'none',
                                        outline: 'none',
                                        paddingRight: '1vw',
                                        paddingLeft: '1vw',
                                        fontFamily: 'monospace',
                                        fontSize: '1.5vw',
                                        color: '#bbb'
                                    },
                                    event:{
                                        type:'input',
                                        method:(ev)=>{
                                            userName=ev.target.value
                                        }
                                    },
                                    elementHandler:SpecialChar
                                })
                            ]
                        }))
                    }


                    return ($({
                        tag: 'div',
                        att: {
                            className: 'editConField'
                        },
                        child: [
                            inputUser(),
                            Password({
                                placeholder:'Enter Password',
                                eventMethod:(eve)=>{
                                    password=eve.target.value
                                }
                            }),
                            SaveButton({
                                url: '/settings',
                                Method:(request)=>{
                                    request.push({
                                        reqName: 'editUserName',
                                        reqVal: 'true'
                                    })
                                    request.push({
                                        reqName: 'userNameUpdate',
                                        reqVal: userName
                                    })
                                    request.push({
                                        reqName: 'password',
                                        reqVal: password
                                    })
                                }
                            })
                        ]
                    }))
                }

                mainRight.appendChild(mainEditorContainer({content: [EditUserName]}))
            }
            const changePassword = () => {

                let prevPass,newPassw,reType

                const EditPassword = () => {


                    const newPass=()=>{

                        const passA=$({
                            tag:'tr',
                            child:[
                                $({
                                    tag:'td',
                                    child:[
                                        $({
                                            tag:'input',
                                            att:{
                                                type:'password',
                                                placeholder:'Enter new Password',
                                                maxLength: '20',
                                                minLength:'8'
                                            },
                                            style:{
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                width: '95%',
                                                border: 'none',
                                                outline: 'none',
                                                paddingRight: '1vw',
                                                paddingLeft: '1vw',
                                                fontFamily: 'monospace',
                                                fontSize: '1.5vw',
                                                color: '#bbb'
                                            },
                                            event:{
                                                type:'input',
                                                method:(eve)=>{
                                                    newPassw=eve.target.value
                                                }
                                            },
                                            elementHandler:SpecialChar
                                        })
                                    ]
                                })
                            ]
                        })
                        const passB=$({
                            tag:'tr',
                            child:[
                                $({
                                    tag:'td',
                                    child:[
                                        $({
                                            tag:'input',
                                            att:{
                                                type:'password',
                                                placeholder:'Re-type Password',
                                                maxLength: '20',
                                                minLength:'8'
                                            },
                                            style:{
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                width: '95%',
                                                border: 'none',
                                                outline: 'none',
                                                paddingRight: '1vw',
                                                paddingLeft: '1vw',
                                                fontFamily: 'monospace',
                                                fontSize: '1.5vw',
                                                color: '#bbb'
                                            },
                                            event:{
                                                type:'input',
                                                method:(eve)=>{
                                                    reType=eve.target.value
                                                }
                                            },
                                            elementHandler:SpecialChar
                                        })
                                    ]
                                })
                            ]
                        })
                        return ($({
                            tag:'table',
                            att:{
                                className:'editPass'
                            },
                            child:[
                                passA,
                                passB
                            ]
                        }))
                    }



                    return ($({
                        tag: 'div',
                        att: {
                            className: 'editConField'
                        },
                        child: [
                            Password({
                                placeholder:'Enter old Password',
                                eventMethod:(eve)=>{
                                    prevPass=eve.target.value
                                }
                            }),
                            newPass(),
                            SaveButton({
                                Method:(request)=>{

                                    request.push({
                                        reqName: 'editPassword',
                                        reqVal: 'true'
                                    })
                                    request.push({
                                        reqName: 'oldPass',
                                        reqVal: prevPass
                                    })
                                    request.push({
                                        reqName: 'newPass',
                                        reqVal: newPassw
                                    })
                                    request.push({
                                        reqName: 'retypePass',
                                        reqVal: reType
                                    })
                                },
                                url:'/settings'
                            })
                        ]
                    }))
                }

                mainRight.appendChild(mainEditorContainer({content: [EditPassword]}))
            }

            return ($({
                tag: 'table',
                att: {
                    className: 'rightClass'
                },
                child: [

                    accBot({
                        name: 'Change Username',
                        button: {
                            class: 'fa-solid fa-user-pen',
                            method: changeUserName
                        }
                    }),
                    accBot({
                        name: 'Change Password',
                        button: {
                            class: 'fa-solid fa-key',
                            method: changePassword
                        }
                    }),
                ]
            }))
        }

        return ($({
            tag: 'div',
            att: {
                className: 'rightUserInfo',
            },
            elementHandler: getMain,
            child: [
                label,
                UserName(),
                Container()
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'userInfoDiv'
        },
        child: [
            left(),
            right()
        ]

    }))
}


const signature = () => {

    const centerContainer = () => {
        let nameBase
        let imgHolder
        let viewerSig
        let labelRange
        let imageRes=50;
        let image
        const getImgHolder = (imgH) => {
            imgHolder = imgH
        }
        const getViewerSig = (v) => {
            viewerSig = v
            //================================================

            Move({
                panel:viewerSig,
                object:imgHolder
            })

            //==============================================

        }
        const getlabelRange = (element) => {
            labelRange = element
        }
        const getImageResize = (value) => {
            if(value===''||value===undefined){
                value=50
            }
            let currentWidth = imgHolder.naturalWidth
            let currentHeight = imgHolder.naturalHeight
            imgHolder.style.width = currentWidth * value / 50 + 'px'
            imgHolder.style.height = currentHeight * value / 50 + 'px'

            labelRange.innerText = value + '%'
            imageRes = (value / 50)*100
        }



        const getNameBase = (element) => {
            nameBase = element
        }
        const getInput = (value) => {
            if (value !== '') {
                nameBase.innerText = value
            } else {
                nameBase.innerText = "Full name"
            }

        }


        const getSave = (saveButton) => {
            saveButton.addEventListener('click', async () => {
                const form = new FormData()
                form.append('saveEsign', 'true')
                form.append('signatureIMG', image)
                form.append("imageRes", imageRes)
                await fetch("/signature", {
                    method: 'POST',
                    body: form
                }).then(res => res.json())
                    .then(data => {
                        if (data.status) {
                            setTimeout(()=>{window.location.reload()},100)
                        } else {
                            alert(data.message)
                        }
                    })
            })

        }

        const getChanger = (change) => {
            nameBase.style.fontSize = `${change.value}px`
            change.addEventListener('change', (event) => {
                nameBase.style.fontSize = `${event.target.value}px`
            })
            change.addEventListener('input', (event) => {
                if (event.target.value * 1 <= 30 && event.target.value * 1 >= 2) {
                    nameBase.style.fontSize = `${event.target.value}px`
                } else {
                    event.target.value = '23'
                }
            })
        }


        const viewer = () => {

            const img = () => {
                return ($({
                    tag: 'img',
                    att: {
                        className: 'sigIm',
                        alt: 'Uploaded Signature',
                    },
                    style:{
                        border:'solid thin ',
                        fontFamily:'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',

                        borderRadius:'1vw',
                        padding:'.5rem'
                    },
                    elementHandler: getImgHolder
                }))
            }
            const baseFont = () => {
                return ($({
                    tag: 'div',
                    att: {
                        className: 'baseFont'
                    },
                    style:{
                        fontSize:'16px'
                    },
                    text: 'Full name',
                    elementHandler: getNameBase
                }))
            }

            return ($({
                tag: 'div',
                att: {
                    className: 'viewerSig'
                },
                style:{
                  overflow:'hidden'
                },
                elementHandler: getViewerSig,
                child: [
                    baseFont(),
                    img(),
                ]
            }))
        }
        const controller = () => {

            const tabLayout = () => {

                const uploadPic = () => {
                    return ($({
                        tag: 'input',
                        att: {
                            className: 'uploadEsig',
                            type: 'file',
                            accept: 'image/png'
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                               // image=event.target.files[0]
                                const getMe=(val)=>{
                                    imgHolder.src=val
                                    image=dataURLtoFile(val,"sig.png")
                                }
                                ResizeImage(event.target.files[0],getMe)
                            }
                        }
                    }))
                }
                const enterName = () => {
                    return ($({
                        tag: 'input',
                        att: {
                            type: 'text',
                            className: 'entryName',
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                                getInput(event.target.value)
                            }
                        }
                    }))
                }
                const fontSize = () => {
                    return ($({
                        tag: 'input',
                        att: {
                            type: 'number',
                            className: 'fontSizeSig',
                            min:2,
                            max: 30,
                            value: 16
                        },
                        elementHandler: getChanger
                    }))
                }
                const imageResize = () => {
                    return ($({
                        tag: 'input',
                        att: {
                            className: 'imageResize',
                            type: 'range',
                            min: 1,
                            max: 100,
                            value: 50
                        },
                        event: {
                            type: 'input',
                            method: (event) => {
                                getImageResize(event.target.value)
                            }
                        }
                    }))
                }
                const labelRes = () => {
                    return ($({
                        tag: 'div',
                        att: {
                            className: 'resizeGuide'
                        },
                        elementHandler: getlabelRange,
                        text: '50%'

                    }))
                }

                return ($({
                    tag: 'table',
                    att: {
                        className: 'tableLayoutSig'
                    },
                    child: [
                        $({
                            tag: 'tr',
                            child: [
                                $({
                                    tag: 'td',
                                    style: {
                                        width: '30%',
                                        cursor: 'pointer',
                                    },
                                    child: [
                                        uploadPic()
                                    ]

                                }),
                                $({
                                    tag: 'td',
                                    style: {
                                        width: '70%',
                                        textAlign: 'center'
                                    },
                                    child: [
                                        enterName()
                                    ]
                                })
                            ]
                        }),
                        $({
                            tag: 'tr',
                            child: [
                                $({
                                    tag: 'td',
                                    style: {
                                        width: '30%'
                                    },
                                    child: [
                                        fontSize()
                                    ]
                                }),
                                $({
                                    tag: 'td',
                                    style: {
                                        display: 'flex',
                                        height: '6vh',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        imageResize(),
                                        labelRes()
                                    ]
                                })
                            ]
                        })
                    ]
                }))
            }

            const Save = () => {

                return ($({
                    tag: 'div',
                    att: {
                        className: 'saveSig'
                    },
                    text: 'SAVE',
                    elementHandler: getSave
                }))
            }

            return ($({
                tag: 'div',
                att: {
                    className: 'sigControl',
                },
                child: [
                    tabLayout(),
                    Save()
                ]
            }))
        }


        return ($({
            tag: 'div',
            att: {
                className: 'centerCont'
            },
            child: [
                viewer(),
                controller()
            ]
        }))
    }
    const preview = () => {



        return ($({
            tag: 'table',
            att: {
                className: 'previewSig'
            },
            child: [
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            elementHandler:  (element)=>{
                                setTimeout(async()=>{
                                    const form = new FormData()
                                    form.append('getSig', 'true')
                                    await fetch('/signature', {
                                        method: 'POST',
                                        body: form
                                    }).then(res => res.json())
                                        .then(data => {
                                            if(data.esign!==''){
                                                let url=data.esign.url.replace('..', '')
                                                element.appendChild($({
                                                    tag: 'img',
                                                    att: {
                                                        className: 'prevSig',
                                                        src: url,
                                                        draggable: false
                                                    },
                                                    style:{
                                                        height:'fit-content',
                                                        width:'fit-content',
                                                        margin:'auto'
                                                    },
                                                    elementHandler: (img)=>{
                                                        let height = img.naturalHeight * (data.esign.scale / 100) + 'px'
                                                        let width = img.naturalWidth * (data.esign.scale / 100) + 'px'
                                                        img.style.height = height
                                                        img.style.width = width
                                                    }

                                                }))
                                            }
                                        })
                                },500)
                            }
                        }),

                    ]
                }),
                $({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            text: 'Electronic Signature',
                            att: {
                                className: 'esign'
                            }
                        }),

                    ]
                })
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'sigContainer'
        },
        child: [
            centerContainer(),
            preview()
        ]
    }))
}


const Tabs = ({getHeader}) => {


    return ($({
        tag: 'table',
        att: {
            className: 'tabsSettings'
        },
        child: [
            $({
                tag: 'tr',
                elementHandler: getHeader
            })
        ]
    }))
}

const FrameBody = ({getFrameBody}) => {
    return ($({
        tag: 'div',
        att: {
            className: 'settingsFrame'
        },
        elementHandler: getFrameBody
    }))
}

export const Settings = () => {
    const TabButton = ({url, label, state}) => {
        const getBot = (bot) => {
            if (state) {
                bot.className += ' setBotActive'
            }
        }

        return ($({
            tag: 'td',
            att: {
                className: 'settingsBot'
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
    const link = []
    link.push({
        button: (url) => {
            const current = window.location.href.replace(window.location.origin, '').split('/')[3]
            return (TabButton({
                url: '/user/settings/userInfo',
                label: 'Edit User information',
                state: (url === current)
            }))
        },
        url: '/user/settings/userInfo',
        page: userInfo,
    })
    link.push({
        button: (url) => {
            const current = window.location.href.replace(window.location.origin, '').split('/')[3]
            return (
                TabButton({
                    url: '/user/settings/signature',
                    label: 'Upload E-signature',
                    state: (url === current)
                })
            )
        },
        url: '/user/settings/signature',
        page: signature,
    })

    const frameHolder = (frameBody) => {
        const url = window.location.href.replace(window.location.origin, '').split('/')[3]
        link.forEach(val => {
            const isActive = val.url.split('/')[3] === url
            if (isActive) {
                frameBody.appendChild(val.page())
            }
        })
    }

    const getTabHeader = (tabHeader) => {

        link.forEach(val => {
            tabHeader.appendChild(val.button(val.url.split('/')[3]))
        })
        tabHeader.appendChild($({
            tag: 'td',
            style: {
                width: 'auto'
            }
        }))
    }


    return ($({
        tag: 'div',
        externalStyle: '/client/component/userComponent/userComponentStyle/settings.css',
        att: {
            className: 'settingsDiv'
        },
        child: [
            Tabs({getHeader: getTabHeader}),
            FrameBody({getFrameBody: frameHolder})
        ]
    }))
}

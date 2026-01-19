import {$, Request, SpecialChar} from '../../../lib/lib.js'

export const ExternalAccount=()=>{
    let passA,passB

    return($({
        tag:'div',
        att:{
            className:'container-fluid m-auto bg-light'
        },
        style:{
            height:'100%',
            overflowY:'auto'
        },
        child:[
            $({
                tag:'div',
                att:{
                    className:'card p-2 mx-2 mt-4'
                },
                child:[
                    $({
                        tag:'div',
                        att:{
                            className:'card-header bg-dark bg-opacity-25'
                        },
                        child:[
                            $({
                                tag:'label',
                                text:'External Accounts',
                                att:{
                                    className:'form-label'
                                },
                                style:{
                                    fontWeight:'bold'
                                }
                            }),
                        ]
                    }),
                    $({
                        tag:'div',
                        att:{
                            className:'card-body'
                        },
                        child:[
                            $({
                                tag:'table',
                                att:{
                                    className:'table table-hover table-group-divider display compact',
                                    id:'myTab'
                                },
                                style:{width:'100%'},
                                child:[
                                    $({
                                        tag:'thead',
                                        att:{
                                            className:'table-info bg-opacity-25 border-bottom'
                                        },
                                        child:[
                                            $({
                                                tag:'tr',
                                                child:[
                                                    $({
                                                        tag:'th',
                                                        text:'ID'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Account Name'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Email'
                                                    }),

                                                    $({
                                                        tag:'th',
                                                        text:'Action'
                                                    }),

                                                ]
                                            }),
                                        ]
                                    }),
                                    $({
                                        tag:'tbody',
                                        elementHandler:(el)=>{
                                            const req= new Request('/externalauth')
                                            req.Post([
                                                {
                                                    name:'get_umd_user',
                                                    value:'true'
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data=>{
                                                data.forEach(val=>{

                                                    el.appendChild($({
                                                        tag:'tr',
                                                        child:[

                                                            $({
                                                                tag:'td',
                                                                text:val.id
                                                            }),
                                                            $({
                                                                tag:'td',
                                                                text:val.account_name
                                                            }),
                                                            $({
                                                                tag:'td',
                                                                text:val.email,
                                                                style:{
                                                                    whiteSpace:'nowrap',
                                                                    overflow:'hidden',
                                                                    textOverflow:'ellipsis',
                                                                },
                                                            }),

                                                            $({
                                                                tag:'td',
                                                                child:[

                                                                    $({
                                                                        tag:'span',
                                                                        att:{
                                                                            className:'btn bg-dark bg-opacity-25 p-1 ms-3'
                                                                        },
                                                                        elementHandler:(el)=>{
                                                                            el.setAttribute('data-bs-toggle','modal')
                                                                            el.setAttribute('data-bs-target','#mod'+val.id)
                                                                        },
                                                                        child:[
                                                                            $({
                                                                                tag:'i',
                                                                                att:{
                                                                                    className:'fa-solid fa-trash'
                                                                                }
                                                                            }),
                                                                        ]
                                                                    }),
                                                                    $({
                                                                        tag:'span',
                                                                        att:{
                                                                            className:'btn bg-dark bg-opacity-25 p-1 ms-3'
                                                                        },
                                                                        elementHandler:(el)=>{
                                                                            el.setAttribute('data-bs-toggle','modal')
                                                                            el.setAttribute('data-bs-target','#mod'+val.id)
                                                                        },
                                                                        child:[
                                                                            $({
                                                                                tag:'i',
                                                                                att:{
                                                                                    className:'fa-solid fa-edit'
                                                                                }
                                                                            }),
                                                                        ]
                                                                    }),
                                                                    $({
                                                                        tag:'div',
                                                                        att:{
                                                                            className:'modal fade',
                                                                            tabIndex:'-1',
                                                                            id:'mod'+val.id
                                                                        },
                                                                        elementHandler:(el)=>{
                                                                            el.setAttribute('aria-labelledby','modlabel'+val.id)
                                                                            el.setAttribute('aria-hidden','true')
                                                                        },
                                                                        child:[
                                                                            $({
                                                                                tag:'div',
                                                                                att:{
                                                                                    className:'modal-dialog modal-dialog-centered'
                                                                                },
                                                                                child:[
                                                                                    $({
                                                                                        tag:'div',
                                                                                        att:{
                                                                                            className:'modal-content'
                                                                                        },
                                                                                        child:[
                                                                                            $({
                                                                                                tag:'form',
                                                                                                event:{
                                                                                                    type:'submit',
                                                                                                    method:(eve)=>{
                                                                                                        eve.preventDefault()
                                                                                                        fetch('/externalauth',{
                                                                                                            method:'POST',
                                                                                                            body:new FormData(eve.target)
                                                                                                        }).then(res=>res.json())
                                                                                                            .then(data=>{
                                                                                                                if(data.status){
                                                                                                                    window.location.reload()
                                                                                                                }else {
                                                                                                                    alert(data.message)
                                                                                                                }
                                                                                                            })
                                                                                                    }
                                                                                                },
                                                                                                child:[
                                                                                                    $({
                                                                                                        tag:'div',
                                                                                                        att:{
                                                                                                            className:'modal-header'
                                                                                                        },
                                                                                                        child:[
                                                                                                            $({
                                                                                                                tag:'h1',
                                                                                                                att:{
                                                                                                                    className:'modal-title fs-5 text-warning',
                                                                                                                    innerText:'Warning !',
                                                                                                                    id:'modlabel'+val.id
                                                                                                                }
                                                                                                            }),
                                                                                                            $({
                                                                                                                tag:'button',
                                                                                                                elementHandler:(el)=>{
                                                                                                                    el.setAttribute('data-bs-dismiss','modal')
                                                                                                                    el.setAttribute('aria-label','Close')
                                                                                                                },
                                                                                                                att:{
                                                                                                                    className:'btn-close'
                                                                                                                }
                                                                                                            })
                                                                                                        ]
                                                                                                    }),
                                                                                                    $({
                                                                                                        tag:'div',
                                                                                                        att:{
                                                                                                            className:'modal-body'
                                                                                                        },
                                                                                                        child:[
                                                                                                            $({
                                                                                                                tag:'div',
                                                                                                                att:{
                                                                                                                    className:'mt-3 form label t'
                                                                                                                },
                                                                                                                text:'Are you sure you want to delete this account?'
                                                                                                            }),
                                                                                                            $({
                                                                                                                tag:'div',
                                                                                                                att:{
                                                                                                                    className:'p-2 form label  card'
                                                                                                                },
                                                                                                                text:val.account_name
                                                                                                            }),
                                                                                                            $({
                                                                                                                tag:'input',
                                                                                                                att:{
                                                                                                                    className:'form-control',
                                                                                                                    type:'hidden',
                                                                                                                    value:val.id,
                                                                                                                    name:'accountIdDel'
                                                                                                                }
                                                                                                            }),
                                                                                                        ]
                                                                                                    }),
                                                                                                    $({
                                                                                                        tag:'div',
                                                                                                        att:{
                                                                                                            className:'modal-footer'
                                                                                                        },
                                                                                                        child:[
                                                                                                            $({
                                                                                                                tag:'button',
                                                                                                                elementHandler:(el)=>{
                                                                                                                    el.setAttribute('data-bs-dismiss','modal')
                                                                                                                },
                                                                                                                att:{
                                                                                                                    className:'btn btn-secondary',
                                                                                                                    type:'button'
                                                                                                                },
                                                                                                                text:'Cancel'
                                                                                                            }),
                                                                                                            $({
                                                                                                                tag:'button',

                                                                                                                att:{
                                                                                                                    className:'btn btn-primary',
                                                                                                                    type:'submit'
                                                                                                                },
                                                                                                                text:'confirm'
                                                                                                            })
                                                                                                        ]
                                                                                                    }),
                                                                                                ]
                                                                                            }),
                                                                                        ]
                                                                                    }),
                                                                                ]
                                                                            })
                                                                        ]
                                                                    }),

                                                                ]
                                                            }),

                                                        ]
                                                    }))
                                                })

                                            })
                                        }
                                    }),
                                    $({
                                        tag:'tfoot',
                                        att:{
                                            className:'table-info bg-opacity-25 border-bottom'
                                        },
                                        child:[
                                            $({
                                                tag:'tr',
                                                child:[
                                                    $({
                                                        tag:'th',
                                                        text:'ID'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Account Name'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Email'
                                                    }),

                                                    $({
                                                        tag:'th',
                                                        text:'Action'
                                                    }),

                                                ]
                                            }),
                                        ]
                                    })
                                ],

                            })
                        ]
                    }),
                    $({
                        tag:'div',
                        att:{
                            className:'card-footer bg-dark bg-opacity-25'
                        },
                        child:[
                            $({
                                tag:'div',
                                att:{
                                    className:'modal fade',
                                    tabIndex:'-1',
                                    id:'addModal'
                                },
                                elementHandler:(el)=>{
                                    el.setAttribute('data-bs-backdrop','static')
                                    el.setAttribute('data-bs-keyboard','false')
                                },
                                child:[
                                    $({
                                        tag:'div',
                                        att:{
                                            className:'modal-dialog modal-dialog-centered'
                                        },
                                        child:[
                                            $({
                                                tag:'div',
                                                att:{
                                                    className:'modal-content'
                                                },
                                                child:[
                                                    $({
                                                        tag:'form',
                                                        child:[
                                                            $({
                                                                tag:'div',
                                                                att:{
                                                                    className:'modal-header'
                                                                },
                                                                child:[
                                                                    $({
                                                                        tag:'h1',
                                                                        att:{
                                                                            className:'modal-title fs-5',
                                                                            innerText:"Add new External users account",
                                                                            id:'addExLeb'
                                                                        }
                                                                    }),
                                                                    $({
                                                                        tag:'button',
                                                                        elementHandler:(el)=>{
                                                                            el.setAttribute('data-bs-dismiss','modal')
                                                                            el.setAttribute('aria-label','Close')
                                                                        },
                                                                        att:{
                                                                            className:'btn-close'
                                                                        }
                                                                    })
                                                                ]
                                                            }),
                                                            $({
                                                                tag:'div',
                                                                att:{
                                                                    className:'modal-body'
                                                                },
                                                                child:[
                                                                    $({
                                                                        tag:'div',
                                                                        att:{
                                                                            className:'form-floating mb-3'
                                                                        },
                                                                        child:[

                                                                            $({
                                                                                tag:'input',
                                                                                att:{
                                                                                    className:'form-control ',
                                                                                    type:'email',
                                                                                    placeholder:'example@mail.com',
                                                                                    id:'emailInp',
                                                                                    name:'accountEmail',
                                                                                    required: true
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'label',
                                                                                text:'example@mail.com',
                                                                                att:{
                                                                                    for:'emailInp',
                                                                                }
                                                                            }),

                                                                        ]
                                                                    }),
                                                                    $({
                                                                        tag:'div',
                                                                        att:{
                                                                            className:'form-floating mb-3'
                                                                        },
                                                                        child:[

                                                                            $({
                                                                                tag:'input',
                                                                                att:{
                                                                                    className:'form-control',
                                                                                    type:'text',
                                                                                    placeholder:'Account Name',
                                                                                    id:'acNem',
                                                                                    name:'accountName'
                                                                                },
                                                                            }),
                                                                            $({
                                                                                tag:'label',
                                                                                text:'Account Name',
                                                                                att:{
                                                                                    for:'acNem',
                                                                                }
                                                                            }),
                                                                        ]
                                                                    }),
                                                                    $({
                                                                        tag:'label',
                                                                        att:{
                                                                            className:'mt-3 form-label'
                                                                        },
                                                                        text:'Password'
                                                                    }),
                                                                    $({
                                                                        tag:'div',
                                                                        att:{
                                                                            className:'form-floating mb-3'
                                                                        },
                                                                        child:[

                                                                            $({
                                                                                tag:'input',
                                                                                att:{
                                                                                    className:'form-control',
                                                                                    type:'password',
                                                                                    placeholder:'Account Password',
                                                                                    id:'exPass',
                                                                                    name:'accountPass',
                                                                                    required:true,
                                                                                    minLength:'8',
                                                                                    maxLength:'20'
                                                                                },
                                                                                elementHandler:(el)=>{
                                                                                    passA=el
                                                                                    SpecialChar(el)
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'label',
                                                                                text:'Enter at least 8 char password',
                                                                                att:{
                                                                                    for:'exPass'
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'div',
                                                                                att:{
                                                                                    className:'invalid-feedback'
                                                                                },
                                                                                text:'Password do not match'
                                                                            }),

                                                                        ]
                                                                    }),
                                                                    $({
                                                                        tag:'div',
                                                                        att:{
                                                                            className:'form-floating mb-3'
                                                                        },
                                                                        child:[

                                                                            $({
                                                                                tag:'input',
                                                                                att:{
                                                                                    className:'form-control',
                                                                                    type:'password',
                                                                                    placeholder:'Account Password',
                                                                                    id:'acPass',
                                                                                    name:'reAccountPass',
                                                                                    required:true,
                                                                                    minLength:'8',
                                                                                    maxLength:'20'
                                                                                },
                                                                                elementHandler:(el)=>{
                                                                                    passB=el

                                                                                },
                                                                                event:{
                                                                                    type:'input',
                                                                                    method:(ev)=>{

                                                                                        let me= ev.target
                                                                                        if(passB.value.length>8){
                                                                                            if(passA.value===me.value){
                                                                                                me.className+=' is-valid'
                                                                                                passA.className=passA.className.replace('is-invalid','is-valid')
                                                                                            }else {
                                                                                                me.className=me.className.replace(' is-valid','')
                                                                                            }
                                                                                        }

                                                                                    }
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'label',
                                                                                text:'Re enter your password',
                                                                                att:{
                                                                                    for:'acPass'
                                                                                }
                                                                            }),
                                                                            $({
                                                                                tag:'div',
                                                                                att:{
                                                                                    className:'valid-feedback'
                                                                                },
                                                                                text:'Password match'
                                                                            }),
                                                                        ]
                                                                    }),

                                                                ]
                                                            }),

                                                            $({
                                                                tag:'div',
                                                                att:{
                                                                    className:'modal-footer'
                                                                },
                                                                child:[
                                                                    $({
                                                                        tag:'button',
                                                                        elementHandler:(el)=>{
                                                                            el.setAttribute('data-bs-dismiss','modal')
                                                                        },
                                                                        att:{
                                                                            className:'btn btn-secondary',
                                                                            type: 'button'
                                                                        },
                                                                        text:'Cancel'
                                                                    }),
                                                                    $({
                                                                        tag:'button',
                                                                        att:{
                                                                            className:'btn btn-primary',
                                                                            type: 'submit'
                                                                        },
                                                                        text:'Save'
                                                                    })
                                                                ]
                                                            }),

                                                        ],
                                                        event:{
                                                            type:'submit',
                                                            method:(ev)=>{
                                                                ev.preventDefault()

                                                                if(passA.value===passB.value){
                                                                    let form=new FormData(ev.target)
                                                                    form.append('addExtern','true')
                                                                    fetch('/externalauth',{
                                                                        method:'POST',
                                                                        body:form
                                                                    }).then(res=>res.json())
                                                                        .then(data=>{
                                                                            if(data.status){
                                                                               window.location.reload()
                                                                            }else {
                                                                                alert(data.message)
                                                                            }
                                                                        })
                                                                }else {
                                                                    passA.className=passA.className.replace(' is-valid','')
                                                                    passA.className+=' is-invalid'
                                                                }


                                                            }
                                                        }
                                                    })
                                                ]
                                            }),
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag:'button',
                                att:{
                                    className:'btn btn-primary'
                                },
                                text:'Add new account',
                                elementHandler:(el)=>{
                                    el.setAttribute('data-bs-toggle','modal')
                                    el.setAttribute('data-bs-target','#addModal')
                                }
                            })
                        ]
                    }),

                ]
            })
        ]

    }))
}
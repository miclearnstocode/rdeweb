import {$, Request} from "../../../lib/lib.js";


export const ExternalDocs=()=>{
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
                                text:'Submitted Files from external users',
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
                                                        text:'User'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Email'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Title'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Category'
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
                                            const req= new Request('/filesUmd')
                                            req.Post([
                                                {
                                                    name:'get_umd_file',
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
                                                                text:val.account_name
                                                            }),
                                                            $({
                                                                tag:'td',
                                                                text:val.email
                                                            }),
                                                            $({
                                                                tag:'td',
                                                                text:val.title,
                                                                style:{
                                                                    whiteSpace:'nowrap',
                                                                    overflow:'hidden',
                                                                    textOverflow:'ellipsis',
                                                                },
                                                            }),
                                                            $({
                                                                tag:'td',
                                                                text:val.category
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
                                                                                    className:'fa-solid fa-folder-open'
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
                                                                                    className:'modal-dialog modal-fullscreen'
                                                                                },
                                                                                child:[
                                                                                    $({
                                                                                        tag:'div',
                                                                                        att:{
                                                                                            className:'modal-content'
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
                                                                                                            className:'modal-title fs-5',
                                                                                                            innerText:val.account_name,
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
                                                                                                        tag:'iframe',
                                                                                                        att:{
                                                                                                            className:'container-fluid h-100',
                                                                                                            type:'application/pdf',
                                                                                                            src:val.file_url.replace('..','')
                                                                                                        },

                                                                                                    })
                                                                                                ]
                                                                                            })
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
                                                        text:'User'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Email'
                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Title',

                                                    }),
                                                    $({
                                                        tag:'th',
                                                        text:'Category'
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

                ]
            })
        ]

    }))
}
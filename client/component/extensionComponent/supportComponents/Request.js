import {$, ConfirmationAlert, Request, Waiting, UnderConstruction} from '../../../lib/lib.js'

export const ReqButton = () => {
    return ($({
        tag: 'div',
        att: {
            className: 'reqBot'
        },
        externalStyle: '/client/component/userComponent/userComponentStyle/request.css',
        child: [
            $({
                tag: 'div',
                att: {
                    className: "fa-solid fa-circle-exclamation req-icon",
                }
            }),
            $({
                tag: 'div',
                att: {
                    className: 'req-text'
                },
                text: "User's Request"
            })
        ],
        event: {
            type: 'click',
            method: () => {
                document.body.appendChild(UserRequest())
                // Show under construction notification
                document.body.appendChild(UnderConstruction({
                    message: "User's Request feature is currently under construction",
                }))
            }
        }
    }))
}

const UserRequest = () => {
    let main
    const Holder = () => {

        const Close = () => {
            return ($({
                tag: 'div',
                att: {
                    className: 'fa-solid fa-circle-xmark close-request'
                },
                event: {
                    type: 'click',
                    method: () => {
                        main.remove()
                    }
                }
            }))
        }
        
        const Label = (leb) => {
            return ($({
                tag: 'div',
                att: {
                    className: 'request-label'
                },
                text: leb
            }))
        }
        
        const requestPanel = () => {

            const RequestList = ({user, fileName, fileType, id, campus, date, reqId}) => {
                let getMainReq
                
                const Name = $({
                    tag: 'div',
                    text: user,
                    att: {
                        title: campus,
                    },
                    att: {
                        className: 'request-user-name'
                    }
                })
                
                const file = $({
                    tag: 'div',
                    text: fileName,
                    att: {
                        title: fileType,
                        className: 'request-file-name'
                    }
                })
                
                const dateTime = $({
                    tag: 'div',
                    att: {
                        className: 'request-date'
                    },
                    text: date
                })
                
                const control = () => {
                    const Icon = ({clsName, method}) => {
                        return ($({
                            tag: 'div',
                            att: {
                                className: clsName + ' icon-log'
                            },
                            event: {
                                type: 'click',
                                method: method
                            }
                        }))
                    }

                    const fileViewer = (url) => {
                        let flV
                        return($({
                            tag: 'div',
                            att: {
                                className: 'request-file-viewer'
                            },
                            elementHandler: (el) => {
                                flV = el
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'request-viewer-container'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-circle-xmark viewer-close'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    flV.remove()
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'object',
                                            att: {
                                                data: url,
                                                type: 'application/pdf',
                                                className: 'request-pdf-viewer'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }))
                    }
                    
                    return ($({
                        tag: 'div',
                        att: {
                            className: 'request-controls'
                        },
                        child: [
                            Icon({
                                clsName: 'fa-solid fa-thumbs-up approve-icon',
                                method: async () => {
                                    if(confirm("Allow this user to access this file?")){
                                        let loading = Waiting()
                                        document.body.appendChild(loading)
                                        const remove = () => {
                                            loading.remove()
                                        }
                                        const form = new FormData()
                                        form.append('allowAccess','true')
                                        form.append('requestId', reqId)
                                        await fetch('/requestDocs', {
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
                                                document.body.appendChild(ConfirmationAlert("Success..!", () => {
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
                            Icon({
                                clsName: 'fa-solid fa-trash-can delete-icon',
                                method: () => {
                                    if(confirm("This operation cannot be undone. Would you like to proceed? ")){
                                        const req = new Request('/requestDocs')
                                        req.Post([
                                            {name: 'declinedFileRequest', value: '0'},
                                            {name: 'reqId', value: reqId}
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            if(data.status){
                                                getMainReq.remove()
                                            } else {
                                                alert(data.message)
                                            }
                                        })
                                    }
                                }
                            }),
                            Icon({
                                clsName: 'fa-solid fa-folder-open view-icon',
                                method: () => {
                                    const req = new Request('/uploadResearchFile')
                                    req.Post([
                                        {name: 'viewDocReq', value: 'true'},
                                        {name: 'docId', value: id},
                                    ])
                                    req.Json()
                                    req.Send().then(data => {
                                        if(data.status){
                                            main.appendChild(fileViewer('/' + data.data))
                                        } else {
                                            alert("File not found..!")
                                        }
                                    })
                                }
                            })
                        ]
                    }))
                }
                
                return ($({
                    tag: 'div',
                    att: {
                        className: 'request-list-item'
                    },
                    elementHandler: (el) => {
                        getMainReq = el
                    },
                    child: [
                        $({
                            tag: 'div',
                            child: [dateTime]
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'request-item-content'
                            },
                            child: [
                                Name,
                                control()
                            ]
                        })
                    ]
                }))
            }

            return ($({
                tag: 'div',
                att: {
                    className: 'request-panel-left'
                },
                child: [
                    Label("User's Request"),
                    $({
                        tag: 'div',
                        att: {
                            className: 'request-list-container'
                        },
                        elementHandler: (el) => {
                            const request = new Request('/requestDocs')
                            const reqForm = []
                            reqForm.push({
                                name: 'getDocRequest',
                                value: 'true'
                            })
                            request.Post(reqForm)
                            request.Json()
                            request.Send().then(data => {
                                data.forEach(val => {
                                    el.appendChild(RequestList({
                                        user: val.fullName,
                                        fileName: 'Something',
                                        fileType: 'Symposium',
                                        date: val.date.split(' ')[0],
                                        campus: val.campus,
                                        id: val.docId,
                                        reqId: val.id
                                    }))
                                })
                            })
                        }
                    })
                ]
            }))
        }
        
        const GrantUser = () => {
            const Filter = () => {
                return ($({
                    tag: 'div',
                    att: {
                        className: 'grant-filter'
                    }
                }))
            }
            
            const containBody = () => {

                const allowedList = ({fileType, fileName, userList, fileUrl, fileId}) => {
                    let mainListBody
                    let useHold
                    let stateUse = false
                    
                    const UserListBox = (label) => {
                        return ($({
                            tag: 'div',
                            att: {
                                className: 'user-list-item'
                            },
                            text: label
                        }))
                    }
                    
                    const vieFile = (url) => {
                        let viewMain
                        return($({
                            tag: 'div',
                            att: {
                                className: 'file-viewer-overlay'
                            },
                            elementHandler: (el) => {
                                viewMain = el
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'file-viewer-container'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-circle-xmark viewer-close'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    viewMain.remove()
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'object',
                                            att: {
                                                type: 'application/pdf',
                                                data: '/' + url,
                                                className: 'file-viewer-object'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }))
                    }

                    return($({
                        tag: 'div',
                        att: {
                            className: 'allowed-list-item'
                        },
                        elementHandler: (el) => {
                            mainListBody = el
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'file-type'
                                },
                                text: fileType
                            }),
                            $({
                                tag: 'div',
                                att: {
                                    className: 'file-info-row'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'file-name'
                                        },
                                        text: fileName
                                    }),
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'file-actions'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                att: {
                                                    className: 'fa-solid fa-square-caret-down action-icon toggle-users'
                                                },
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        stateUse = !stateUse
                                                        if(stateUse){
                                                            userList.forEach(val => {
                                                                useHold.appendChild(UserListBox(val))
                                                            })
                                                        } else {
                                                            useHold.innerHTML = ''
                                                        }
                                                    }
                                                }
                                            }),
                                            $({
                                                tag: 'div',
                                                att: {
                                                    className: 'fa-solid fa-folder-open action-icon view-file'
                                                },
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        document.body.appendChild(vieFile(fileUrl))
                                                    }
                                                }
                                            }),
                                            $({
                                                tag: 'div',
                                                att: {
                                                    className: 'fa-solid fa-trash-can action-icon delete-file'
                                                },
                                                event: {
                                                    type: 'click',
                                                    method: () => {
                                                        if(confirm("This operation cannot be undone. Would you like to proceed? ")){
                                                            const req = new Request('/requestDocs')
                                                            req.Post([
                                                                {name: 'deleteFileAccess', value: '0'},
                                                                {name: 'docId', value: fileId},
                                                            ])
                                                            req.Json()
                                                            req.Send().then(data => {
                                                                if(data.status){
                                                                    mainListBody.remove()
                                                                } else {
                                                                    alert(data.message)
                                                                }
                                                            })
                                                        }
                                                    }
                                                }
                                            }),
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                att: {
                                    className: 'users-list-container'
                                },
                                elementHandler: (el) => {
                                    useHold = el
                                }
                            })
                        ]
                    }))
                }

                return($({
                    tag: 'div',
                    att: {
                        className: 'grant-body-container'
                    },
                    elementHandler: (el) => {
                        const req = new Request('/requestDocs')
                        req.Post([
                            {name: 'reqAllowedList', value: 'true'}
                        ])
                        req.Json()
                        req.Send().then(data => {
                            data.docs.forEach(val => {
                                el.appendChild(allowedList({
                                    fileType: val.event,
                                    fileName: val.title,
                                    userList: val.allowedUser,
                                    fileUrl: val.file,
                                    fileId: val.docId
                                }))
                            })
                        })
                    }
                }))
            }
            
            return ($({
                tag: 'div',
                att: {
                    className: 'request-panel-right'
                },
                child: [
                    Label("Shared Documents"),
                    Filter(),
                    containBody()
                ]
            }))
        }

        return ($({
            tag: 'div',
            att: {
                className: 'request-holder'
            },
            child: [
                Close(),
                requestPanel(),
                GrantUser()
            ]
        }))
    }

    return ($({
        tag: 'div',
        att: {
            className: 'request-modal-overlay'
        },
        elementHandler: (el) => {
            main = el
        },
        child: [
            Holder()
        ]
    }))
}
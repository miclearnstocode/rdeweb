import {$, ConfirmationAlert, Request, Waiting} from '../../lib/lib.js'
import {Logout} from "./Logout.js";
import {Chat, ChatBoxDisplay} from "./chat.js";
import {Update} from "./update.js";

export const Header = () => {

    let mainHeader, chatContainer, listContainer
    localStorage.setItem("Chat", JSON.stringify([]))

    document.body.appendChild($({
        tag: 'div',
        style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            left: 'auto',
            height: 'fit-content',
            width: 'fit-content',
            display: 'flex',
            justifyContent: 'center',
            zIndex: '1000',
            gap: '12px'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    margin: 'auto'
                },
                elementHandler: (el) => {
                    chatContainer = el
                    if (sessionStorage.getItem('convoDetails') !== null) {
                        const det = JSON.parse(sessionStorage.getItem('convoDetails'))
                        el.appendChild(ChatBoxDisplay({
                            convoID: det.convoID,
                            sessionID: det.sessionId,
                            user: det.name,
                            office: det.office,
                        }))
                    }
                }
            }),
            $({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    margin: 'auto',
                },
                elementHandler: (el) => {
                    listContainer = el
                    if (sessionStorage.getItem('chatBoxList') !== null) {
                        el.appendChild(Chat({
                            chatContainer: chatContainer
                        }))
                    }
                }
            }),
        ],
    }))

    document.head.append($({
        tag: 'link',
        att: {
            rel: 'stylesheet',
            href: '/client/style/header.css'
        }
    }))

    const getUserName = async (el) => {
        const form = new FormData()
        form.append('getUserName', 'true')
        try {
            const response = await fetch('/sessionCheck', {
                method: 'POST',
                body: form
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            el.innerText = data.username || 'UNKNOWN'
        } catch (error) {
            console.error('Error fetching username:', error)
            el.innerText = 'UNKNOWN'
        }
    }

    const ToolBox = () => {
        let toolState = false, holder, pan

        const iconHolder = () => {
            const ToolIcon = ({ iconClass, event, toolTip }) => {
                return ($({
                    tag: 'div',
                    att: {
                        className: iconClass + ' iconClass'
                    },
                    event: {
                        type: 'click',
                        method: event
                    },
                    style: {
                        position: 'relative',
                        cursor: 'pointer'
                    },
                    elementHandler: (el) => {
                        let tip
                        el.addEventListener('mouseenter', function () {
                            this.style.color = '#1976D2'
                            this.style.transform = 'scale(1.1)'
                            this.appendChild($({
                                tag: 'div',
                                text: toolTip,
                                style: {
                                    position: 'absolute',
                                    top: '45px',
                                    right: '0',
                                    fontSize: '12px',
                                    backgroundColor: '#1e293b',
                                    fontFamily: 'Inter, monospace',
                                    padding: '6px 12px',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    whiteSpace: 'nowrap',
                                    border: '1px solid #1976D2',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: '99999',
                                    backdropFilter: 'blur(8px)',
                                    fontWeight: '500'
                                },
                                elementHandler: (e) => {
                                    tip = e
                                }
                            }))
                        })
                        el.addEventListener('mouseleave', function () {
                            this.style.color = '#64748b'
                            this.style.transform = 'scale(1)'
                            if (tip && tip.remove) tip.remove()
                        })
                    }
                }))
            }

            const getme = (tool) => {
                holder = tool
                let chatbox, mmainScan
                let currentScanner = null

                const root = window.location.href
                const qrCodeScanner = () => {
                    let html5QrcodeScanner
                    let scannerModal = null

                    setTimeout(() => {
                        if (mmainScan && mmainScan.id) {
                            html5QrcodeScanner = new Html5QrcodeScanner(
                                mmainScan.id, { fps: 10, qrbox: 250 });
                            html5QrcodeScanner.render(onScanSuccess, onScanError);
                        }
                    }, 100)

                    function onScanSuccess(qrCodeMessage) {
                        try {
                            const parsedData = JSON.parse(qrCodeMessage)
                            const docId = parsedData.fileId
                            const req = new Request('/scanDocs')
                            req.Post([
                                { name: 'qrchecker', value: '1' },
                                { name: 'docId', value: docId }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                let sc
                                const iframeModal = $({
                                    tag: 'div',
                                    style: {
                                        position: 'fixed',
                                        width: '100%',
                                        height: '100%',
                                        left: '0',
                                        top: '0',
                                        display: 'flex',
                                        backgroundColor: 'rgba(0,0,0,0.85)',
                                        zIndex: '99999',
                                        backdropFilter: 'blur(8px)'
                                    },
                                    elementHandler: (el) => {
                                        sc = el
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                height: '90%',
                                                width: '80%',
                                                margin: 'auto',
                                                position: 'relative',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    att: {
                                                        className: 'fa-solid fa-circle-xmark'
                                                    },
                                                    style: {
                                                        fontSize: '28px',
                                                        position: 'absolute',
                                                        left: '-40px',
                                                        top: '-40px',
                                                        width: 'fit-content',
                                                        height: 'fit-content',
                                                        cursor: 'pointer',
                                                        color: '#fff',
                                                        transition: 'all 0.2s',
                                                        zIndex: '100000'
                                                    },
                                                    event: {
                                                        type: 'click',
                                                        method: () => {
                                                            if (sc && sc.remove) sc.remove()
                                                            if (html5QrcodeScanner) html5QrcodeScanner.clear()
                                                        },
                                                        type2: 'mouseenter',
                                                        method2: (e) => {
                                                            e.target.style.color = '#ef4444'
                                                            e.target.style.transform = 'scale(1.1)'
                                                        },
                                                        type3: 'mouseleave',
                                                        method3: (e) => {
                                                            e.target.style.color = '#fff'
                                                            e.target.style.transform = 'scale(1)'
                                                        }
                                                    }
                                                }),
                                                $({
                                                    tag: 'iframe',
                                                    att: {
                                                        src: data.replace('..', '')
                                                    },
                                                    style: {
                                                        width: '100%',
                                                        height: '100%',
                                                        border: 'none'
                                                    }
                                                }),
                                            ]
                                        })
                                    ]
                                })
                                document.body.appendChild(iframeModal)
                                if (html5QrcodeScanner) html5QrcodeScanner.clear()
                            }).catch(err => {
                                console.error('Error fetching document:', err)
                                document.body.appendChild(ConfirmationAlert('Error opening document', null, {
                                    title: 'Error',
                                    icon: 'error',
                                    iconColor: '#ef4444'
                                }))
                            })
                        } catch (err) {
                            console.error('Error parsing QR code:', err)
                            document.body.appendChild(ConfirmationAlert('Invalid QR code format', null, {
                                title: 'Error',
                                icon: 'error',
                                iconColor: '#ef4444'
                            }))
                        }
                    }

                    function onScanError(errorMessage) {
                        console.warn('QR Scan error:', errorMessage)
                    }

                    scannerModal = $({
                        tag: 'div',
                        att: { className: 'qr-scanner-modal' },
                        style: {
                            width: '100%',
                            height: '100%',
                            left: '0',
                            top: '0',
                            position: 'fixed',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(8px)',
                            zIndex: '10000'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '50vw',
                                    maxWidth: '500px',
                                    margin: 'auto',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                                },
                                child: [
                                    $({
                                        tag: 'h3',
                                        text: 'Scan QR Code',
                                        style: {
                                            color: '#1a2a3a',
                                            marginBottom: '20px',
                                            fontSize: '20px',
                                            textAlign: 'center',
                                            fontWeight: '600'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        att: {
                                            id: 'reader'
                                        },
                                        elementHandler: (el) => {
                                            mmainScan = el
                                        },
                                        style: {
                                            width: '100%',
                                            minHeight: '300px',
                                            color: '#64748b'
                                        }
                                    }),
                                    $({
                                        tag: 'button',
                                        text: 'Close',
                                        style: {
                                            marginTop: '20px',
                                            padding: '10px 24px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e8ecf0',
                                            borderRadius: '10px',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            width: '100%',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                if (html5QrcodeScanner) {
                                                    html5QrcodeScanner.clear()
                                                }
                                                if (scannerModal && scannerModal.remove) {
                                                    scannerModal.remove()
                                                }
                                            },
                                            type2: 'mouseenter',
                                            method2: (e) => {
                                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                            },
                                            type3: 'mouseleave',
                                            method3: (e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                                e.currentTarget.style.borderColor = '#e8ecf0';
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })

                    document.body.appendChild(scannerModal)
                    return scannerModal
                }

                const suggestion = () => {
                    let me, inputValue = '';

                    const button = ({ text, methodEvent }) => {
                        return ($({
                            tag: 'div',
                            att: {
                                className: 'recomBot'
                            },
                            event: {
                                type: 'click',
                                method: methodEvent
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: text,
                                    style: {
                                        margin: 'auto'
                                    }
                                })
                            ]
                        }))
                    }

                    const textBox = $({
                        tag: 'div',
                        style: {
                            width: 'fit-content',
                            height: 'fit-content',
                            backgroundColor: '#ffffff',
                            margin: 'auto',
                            display: 'auto',
                            justifyContent: 'center',
                            padding: '28px',
                            borderRadius: '20px',
                            border: '1px solid #e8ecf0',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'h3',
                                text: 'Submit Suggestion',
                                style: {
                                    color: '#1a2a3a',
                                    marginBottom: '20px',
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: 'fit-content',
                                    height: 'fit-content',
                                    margin: 'auto',
                                    textAlign: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'textarea',
                                        style: {
                                            width: '50vw',
                                            maxWidth: '500px',
                                            height: '40vh',
                                            border: '1px solid #e8ecf0',
                                            backgroundColor: '#f8fafc',
                                            resize: 'none',
                                            outline: 'none',
                                            padding: '12px',
                                            color: '#1a2a3a',
                                            fontSize: '14px',
                                            fontFamily: 'Inter, monospace',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s ease'
                                        },
                                        att: {
                                            placeholder: 'Insert text here..!',
                                            id: 'insert-text',
                                            name: 'insertText'
                                        },
                                        event: {
                                            type: 'focus',
                                            method: (e) => {
                                                e.currentTarget.style.borderColor = '#1976D2';
                                                e.currentTarget.style.backgroundColor = '#ffffff';
                                            },
                                            type2: 'blur',
                                            method2: (e) => {
                                                e.currentTarget.style.borderColor = '#e8ecf0';
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            },
                                            type3: 'input',
                                            method3: (ev) => {
                                                inputValue = ev.target.value
                                            }
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            height: 'auto',
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            marginTop: '20px'
                                        },
                                        child: [
                                            button({
                                                text: 'Cancel',
                                                methodEvent: () => {
                                                    if (me && me.remove) me.remove()
                                                }
                                            }),
                                            button({
                                                text: 'Submit',
                                                methodEvent: async () => {
                                                    if (inputValue !== '') {
                                                        if (confirm("Click ok to confirm")) {
                                                            if (me && me.remove) me.remove()
                                                            let loading = Waiting()
                                                            document.body.appendChild(loading)
                                                            const remove = () => {
                                                                if (loading && loading.remove) loading.remove()
                                                            }
                                                            const form = new FormData()
                                                            form.append('recommendContent', inputValue)
                                                            form.append('recommend', 'true')
                                                            try {
                                                                const response = await fetch('/recommendation', {
                                                                    method: 'POST',
                                                                    body: form
                                                                })
                                                                if (!response.ok) {
                                                                    throw new Error(`HTTP error! status: ${response.status}`)
                                                                }
                                                                remove()
                                                                const dat = await response.json()
                                                                if (dat.status) {
                                                                    document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                        window.location.reload()
                                                                    }))
                                                                } else {
                                                                    document.body.appendChild(ConfirmationAlert(dat.message, null, {
                                                                        title: 'Error',
                                                                        icon: 'error',
                                                                        iconColor: '#ef4444'
                                                                    }))
                                                                }
                                                            } catch (err) {
                                                                remove()
                                                                console.error('Error submitting suggestion:', err)
                                                                document.body.appendChild(ConfirmationAlert('Error submitting suggestion', null, {
                                                                    title: 'Error',
                                                                    icon: 'error',
                                                                    iconColor: '#ef4444'
                                                                }))
                                                            }
                                                        }
                                                    } else {
                                                        document.body.appendChild(ConfirmationAlert('Please enter text', null, {
                                                            title: 'Error',
                                                            icon: 'error',
                                                            iconColor: '#ef4444'
                                                        }))
                                                    }
                                                }
                                            })
                                        ]
                                    })
                                ]
                            }),
                        ]
                    })

                    const modalContainer = $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: '100%',
                            position: 'fixed',
                            zIndex: '10000',
                            top: '0',
                            left: '0',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        },
                        elementHandler: (el) => {
                            me = el
                        },
                        child: [
                            textBox
                        ]
                    })

                    document.body.appendChild(modalContainer)
                    return modalContainer
                }

                tool.appendChild(ToolIcon({
                    iconClass: "fa-solid fa-bell",
                    event: () => {
                        // document.body.appendChild(Update())
                    },
                    toolTip: 'Notifications'
                }))
                tool.appendChild(ToolIcon({
                    iconClass: "fa-solid fa-qrcode",
                    event: () => {
                        qrCodeScanner()
                    },
                    toolTip: 'Scan QR Code'
                }))
                tool.appendChild(ToolIcon({
                    iconClass: "fa-solid fa-message",
                    toolTip: 'Chat',
                    event: () => {
                        if (sessionStorage.getItem('chatBoxList') === null) {
                            sessionStorage.setItem('chatBoxList', 'true')
                            if (listContainer) {
                                listContainer.appendChild(Chat({ chatContainer: chatContainer }))
                            }
                        } else {
                            sessionStorage.removeItem('chatBoxList')
                            sessionStorage.removeItem('convoDetails')
                            if (listContainer) listContainer.innerHTML = ''
                            if (chatContainer) chatContainer.innerHTML = ''
                        }
                    }
                }))
                tool.appendChild(ToolIcon({
                    iconClass: "fa-solid fa-lightbulb",
                    toolTip: 'Suggestion',
                    event: () => {
                        suggestion()
                    }
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    height: '100%',
                    marginLeft: '1vw',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingLeft: '1vw',
                    borderRadius: '.5vw 0 0 .5vw',
                    width: 'fit-content',
                    backgroundColor: 'transparent',
                    position: 'relative',
                    gap: '8px'
                },
                elementHandler: getme
            }))
        }

        const openTool = (el) => {
            pan = el
            pan.appendChild(iconHolder())
        }

        return ($({
            tag: 'div',
            style: {
                width: 'fit-content',
                margin: 'auto',
                cursor: 'pointer',
                fontSize: '1.5vw',
                color: '#1976D2',
                display: 'flex',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                position: 'relative'
            },
            elementHandler: openTool
        }))
    }

    return ($({
        tag: 'header',
        att: {
            className: 'headerDiv'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'headerLeftContainer'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'logo'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: {
                                    className: 'fas fa-flask'
                                },
                                style: {
                                    fontSize: '28px',
                                    color: '#1976D2'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'RDE',
                                style: {
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginLeft: '10px',
                                    background: 'linear-gradient(135deg, #1976D2, #42a5f5)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'title'
                        },
                        text: 'Research, Development, and Extension'
                    })
                ]
            }),
            $({
                tag: 'div',
                att: {
                    className: 'headerRightContainer'
                },
                child: [
                    ToolBox(),
                    $({
                        tag: 'div',
                        att: {
                            className: 'userInfo'
                        },
                        child: [
                            $({
                                tag: 'i',
                                att: {
                                    className: 'fas fa-user-circle'
                                },
                                style: {
                                    fontSize: '20px',
                                    color: '#1976D2'
                                }
                            }),
                            $({
                                tag: 'span',
                                att: {
                                    className: 'username'
                                },
                                elementHandler: getUserName
                            })
                        ]
                    }),
                    Logout()
                ]
            })
        ],
        elementHandler: (el) => {
            mainHeader = el
        }
    }))
}
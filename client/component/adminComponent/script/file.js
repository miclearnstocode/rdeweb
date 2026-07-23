import { $, CapsuOffice, MONTHS, Request, TimeConvert, Waiting } from '../../../lib/lib.js'
import { Error } from "../../../error.js";

// Cache for tab instances
const tabCache = new Map();

const Communication = () => {
    let mainListBod, mainCon
    let docType = 'All Documents'

    const fileRes = ({ id, campus, title, date, fileUrl }) => {
        const mnth = MONTHS
        let dateFull = ''
        let arrayDate = date.split('-')
        for (let x = 0; x < mnth.length; x++) {
            if (x === (arrayDate[1] - 1)) {
                dateFull = `${mnth[x]} - ${arrayDate[2]} - ${arrayDate[0]}`
                break;
            }
        }

        const log = ({ text, width, textDir }) => {
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
                            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '0.85vw',
                            margin: 'auto',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '100%',
                            color: '#1e293b'
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

        const FileView = (url) => {
            let me
            const Close = () => {
                return ($({
                    tag: 'div',
                    style: {
                        height: 'fit-content',
                        width: 'fit-content',
                        padding: '.5rem',
                        position: 'absolute',
                        left: '-3.5vw',
                        top: '-.5vh',
                        fontSize: '1.8vw',
                        color: '#3b82f6',
                        borderRadius: '50%',
                        cursor: 'pointer'
                    },
                    att: {
                        className: 'fa-solid fa-circle-xmark'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            me.remove()
                        }
                    }
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
                    backgroundImage: 'radial-gradient(rgba(100,100,100,0.5), rgba(0,0,0,0.8))',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: '9999'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: 'fit-content',
                            height: 'fit-content',
                            position: 'relative',
                            padding: '.5rem',
                            border: '1px solid #e2e8f0',
                            margin: 'auto',
                            background: '#fff',
                            borderRadius: '0.5vw',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                        },
                        child: [
                            $({
                                tag: 'object',
                                att: {
                                    type: 'application/pdf',
                                    data: '/' + url
                                },
                                style: {
                                    width: '70vw',
                                    height: '80vh'
                                },
                            }),
                            Close()
                        ]
                    })
                ],
                elementHandler: (el) => {
                    me = el
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
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                paddingTop: '0.8vh',
                paddingBottom: '0.8vh',
                marginTop: '.3vh',
                marginBottom: '.3vh',
                background: '#ffffff',
                borderRadius: '0.4vw',
                borderBottom: '1px solid #f1f5f9',
                transition: 'all 0.2s ease'
            },
            att: {
                id: id
            },
            elementHandler: (el) => {
                el.addEventListener('mouseenter', function () {
                    this.style.backgroundColor = '#f8fafc'
                    this.style.transition = '.2s'
                })
                el.addEventListener('mouseleave', function () {
                    this.style.backgroundColor = '#ffffff'
                    this.style.transition = '.2s'
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
                    tag: 'div',
                    style: {
                        width: '8%',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-eye'
                            },
                            style: {
                                margin: 'auto',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                fontSize: '0.9vw',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.3vw',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                mouseover: (e) => {
                                    e.currentTarget.style.background = '#eff6ff'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.background = 'transparent'
                                },
                                type: 'click',
                                method: () => {
                                    mainCon.appendChild(FileView(fileUrl))
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-trash-can'
                            },
                            style: {
                                margin: 'auto',
                                cursor: 'pointer',
                                color: '#ef4444',
                                fontSize: '0.9vw',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.3vw',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                mouseover: (e) => {
                                    e.currentTarget.style.background = '#fef2f2'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.background = 'transparent'
                                },
                                type: 'click',
                                method: () => {
                                    if (confirm("Do you want to delete this file?\nThis process cannot be undone.")) {
                                        const req = new Request('/communication')
                                        req.Post([
                                            { name: 'deleteapprovalDocs', value: '0' },
                                            { name: 'docId', value: id }
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            if (data.status) {
                                                window.location.reload()
                                            } else {
                                                alert(data.message)
                                            }
                                        })
                                    }
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
                height: '8vh',
                width: '100%',
                display: 'flex',
                gap: '1vw',
                padding: '0.5vh 1vw',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        display: 'flex',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5vw',
                        padding: '0.4rem 0.8rem',
                        margin: 'auto',
                        marginLeft: '0',
                        background: '#ffffff'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-search'
                            },
                            style: {
                                color: '#94a3b8',
                                fontSize: '1vw'
                            }
                        }),
                        $({
                            tag: 'input',
                            style: {
                                width: '20vw',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                marginLeft: '0.5vw',
                                color: '#1e293b',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '0.85vw'
                            },
                            att: {
                                placeholder: 'Search files...'
                            },
                            elementHandler: (el) => {
                                setTimeout(() => {
                                    el.focus()
                                }, 50)
                            },
                            event: {
                                type: 'input',
                                method: (eve) => {
                                    const list = mainListBod.childNodes
                                    for (const val of list) {
                                        if (val.innerText.toUpperCase().includes(eve.target.value.toUpperCase())) {
                                            val.style.display = 'flex'
                                        } else {
                                            val.style.display = 'none'
                                        }
                                    }
                                }
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        display: 'flex',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5vw',
                        padding: '0.4rem 0.8rem',
                        margin: 'auto',
                        background: '#ffffff',
                        gap: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-arrows-rotate'
                            },
                            style: {
                                color: '#64748b',
                                fontSize: '1vw',
                                cursor: 'pointer',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.3vw',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                mouseover: (e) => {
                                    e.currentTarget.style.background = '#f1f5f9'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.background = 'transparent'
                                },
                                type: 'click',
                                method: async () => {
                                    mainListBod.innerHTML = ''
                                    const req = new Request('/communication')
                                    if (docType !== 'All Documents') {
                                        req.Post([
                                            { name: 'communicationFilter', value: '1' },
                                            { name: 'docType', value: docType }
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            data.reverse().forEach(val => {
                                                mainListBod.appendChild(fileRes({
                                                    id: val.docid,
                                                    campus: val.campus,
                                                    title: val.title,
                                                    date: val.date.split(' ')[0],
                                                    fileUrl: val.file
                                                }))
                                            })
                                        })
                                    } else {
                                        req.Post([
                                            { name: 'communicationRequest', value: '1' },
                                        ])
                                        req.Json()
                                        req.Send().then(data => {
                                            data.reverse().forEach(val => {
                                                mainListBod.appendChild(fileRes({
                                                    id: val.docid,
                                                    campus: val.campus,
                                                    title: val.title,
                                                    date: val.date.split(' ')[0],
                                                    fileUrl: val.file
                                                }))
                                            })
                                        })
                                    }
                                }
                            }
                        }),
                        $({
                            tag: 'select',
                            style: {
                                width: '20vw',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                color: '#1e293b',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '0.85vw',
                                cursor: 'pointer'
                            },
                            elementHandler: (el) => {
                                el.appendChild($({
                                    tag: 'option',
                                    text: 'All Documents',
                                    att: {
                                        selected: true,
                                        id: '0'
                                    },
                                    style: {
                                        background: '#fff'
                                    }
                                }))
                                const req = new Request('/getDocType')
                                req.Post([
                                    { name: 'getDoctype', value: '1' }
                                ])
                                req.Json()
                                req.Send().then(data => {
                                    data.forEach(val => {
                                        el.appendChild($({
                                            tag: 'option',
                                            att: {
                                                id: val.id,
                                                innerText: val.name
                                            },
                                            style: {
                                                background: '#fff'
                                            }
                                        }))
                                    })
                                })
                            },
                            event: {
                                type: 'change',
                                method: (eve) => {
                                    docType = eve.target.value
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
                    margin: 'auto'
                },
                child: [
                    $({
                        tag: 'div',
                        text: text,
                        style: {
                            color: '#64748b',
                            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '0.75vw',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            margin: 'auto'
                        }
                    })
                ]
            }))
        }

        const headLabel = $({
            tag: 'div',
            style: {
                width: '100%',
                height: '4vh',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '1px solid #e2e8f0'
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
                height: 'calc(100% - 4vh)',
                width: '100%',
                background: '#ffffff',
                overflowY: 'auto',
                padding: '0.5vw'
            },
            elementHandler: async (el) => {
                mainListBod = el
                const req = new Request('/communication')
                req.Post([
                    { name: 'communicationRequest', value: '1' },
                ])
                req.Json()
                req.Send().then(data => {
                    data.reverse().forEach(val => {
                        el.appendChild(fileRes({
                            id: val.docid,
                            campus: val.campus,
                            title: val.title,
                            date: val.date.split(' ')[0],
                            fileUrl: val.file
                        }))
                    })
                })
            }
        })

        return ($({
            tag: 'div',
            style: {
                height: 'calc(100% - 8vh)',
                width: '100%',
                position: 'relative',
                background: '#ffffff'
            },
            child: [
                headLabel,
                bodContent
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            position: 'relative',
            background: '#ffffff'
        },
        elementHandler: (el) => {
            mainCon = el
        },
        child: [
            headFilter(),
            fileBody()
        ]
    }))
}

const SystemFile = () => {
    let main
    let filterSelect
    let tableBody
    let allData = []
    let totalCountEl = null // Reference to the total count element

    const viewDoc = ({ fileUrl }) => {
        let mainView
        return ($({
            tag: 'div',
            style: {
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: '0',
                top: '0',
                zIndex: '9999',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
            },
            elementHandler: (el) => {
                mainView = el
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        height: '95%',
                        margin: 'auto',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        display: 'flex',
                        padding: '1rem',
                        background: '#ffffff',
                        borderRadius: '0.5vw',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    },
                    child: [
                        $({
                            tag: "div",
                            att: {
                                className: 'fa-solid fa-circle-xmark'
                            },
                            style: {
                                fontSize: '1.5vw',
                                position: 'absolute',
                                border: '1px solid #e2e8f0',
                                padding: '.5rem',
                                borderRadius: '.5vw',
                                cursor: 'pointer',
                                left: '-3vw',
                                color: '#64748b',
                                background: '#fff'
                            },
                            event: {
                                mouseover: (e) => {
                                    e.currentTarget.style.color = '#3b82f6'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.color = '#64748b'
                                },
                                type: 'click',
                                method: () => {
                                    mainView.remove()
                                }
                            }
                        }),
                        $({
                            tag: 'object',
                            att: {
                                type: 'application/pdf',
                                data: '/' + fileUrl
                            },
                            style: {
                                width: '100%',
                                height: '100%'
                            }
                        })
                    ]
                })
            ]
        }))
    }

    const renderTableRows = (data) => {
        tableBody.innerHTML = ''
        
        // Update total count
        if (totalCountEl) {
            totalCountEl.textContent = data.length
        }
        
        if (data.length === 0) {
            const emptyRow = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem',
                    color: '#94a3b8',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '0.85vw',
                    height: '100%'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '2rem',
                            marginBottom: '0.5rem',
                            color: '#cbd5e1'
                        },
                        text: '📄'
                    }),
                    $({
                        tag: 'div',
                        text: 'No accepted entries found'
                    })
                ]
            })
            tableBody.appendChild(emptyRow)
            return
        }

        data.forEach((val, index) => {
            const row = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    background: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                    padding: '0.2rem 0',
                    minHeight: '3rem'
                },
                event: {
                    mouseenter: (e) => {
                        e.currentTarget.style.background = '#f1f5f9'
                        e.currentTarget.style.transition = 'all 0.2s ease'
                    },
                    mouseleave: (e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafbfc'
                        e.currentTarget.style.transition = 'all 0.2s ease'
                    },
                    type: 'click',
                    method: () => {
                        if (val.file) {
                            main.appendChild(viewDoc({ fileUrl: val.file }))
                        }
                    }
                },
                child: [
                    // Event Name - 16% (with text wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '16%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: '500',
                            flexShrink: 0,
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.4',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.event || '-'
                    }),
                    // Title - 20% (with text wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '20%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            flexShrink: 0,
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.4',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.title || '-'
                    }),
                    // Presenter - 14% (no wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '14%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.presenter || '-'
                    }),
                    // Author - 14% (no wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '14%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.author || '-'
                    }),
                    // Co-Author - 14% (with text wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '14%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            flexShrink: 0,
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.4',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.coauthor || '-'
                    }),
                    // Date - 14% (no wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '14%',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.78vw',
                            color: '#1e293b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center'
                        },
                        text: val.date ? val.date.split(' ')[0] : '-'
                    }),
                    // Status - 8% (no wrap)
                    $({
                        tag: 'div',
                        style: {
                            width: '8%',
                            padding: '0.6rem 0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        },
                        child: [
                            $({
                                tag: 'span',
                                style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.2rem 0.6rem',
                                    background: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '20px',
                                    fontSize: '0.65vw',
                                    fontWeight: '600',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    whiteSpace: 'nowrap'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            display: 'inline-block',
                                            width: '6px',
                                            height: '6px',
                                            background: '#22c55e',
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Accepted'
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
            tableBody.appendChild(row)
        })
    }

    const filterData = (eventName) => {
        let filteredData
        if (eventName === 'All Events') {
            filteredData = allData
        } else {
            filteredData = allData.filter(val => val.event === eventName)
        }
        renderTableRows(filteredData)
    }

    const fileContent = () => {
        const head = () => {
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem 1.5rem',
                    background: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    flexShrink: 0
                },
                child: [
                    // Left side - Filter
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        },
                        child: [
                            $({
                                tag: 'span',
                                style: {
                                    fontSize: '0.75vw',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                },
                                text: 'Filter by:'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.3rem 0.8rem',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.4vw'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-filter'
                                        },
                                        style: {
                                            fontSize: '0.8vw',
                                            color: '#3b82f6'
                                        }
                                    }),
                                    $({
                                        tag: 'select',
                                        style: {
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '0.8vw',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            color: '#1e293b',
                                            cursor: 'pointer',
                                            padding: '0.2rem 0.3rem',
                                            minWidth: '180px'
                                        },
                                        elementHandler: (el) => {
                                            filterSelect = el
                                            el.appendChild($({
                                                tag: 'option',
                                                text: 'All Events',
                                                att: {
                                                    value: 'All Events',
                                                    selected: true
                                                },
                                                style: {
                                                    background: '#ffffff',
                                                    color: '#1e293b'
                                                }
                                            }))
                                        },
                                        event: {
                                            type: 'change',
                                            method: (eve) => {
                                                filterData(eve.target.value)
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    // Right side - Status indicator and count
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        },
                        child: [
                            // Total count
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.3rem 0.8rem',
                                    background: '#f1f5f9',
                                    borderRadius: '0.4vw',
                                    fontSize: '0.75vw',
                                    color: '#475569',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontWeight: '600'
                                        },
                                        text: 'Total:'
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontWeight: '700',
                                            color: '#1e293b'
                                        },
                                        elementHandler: (el) => {
                                            totalCountEl = el
                                            el.textContent = '0'
                                        }
                                    })
                                ]
                            }),
                            // All Accepted indicator
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.3rem 1rem',
                                    background: '#dcfce7',
                                    border: '1px solid #86efac',
                                    borderRadius: '20px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        style: {
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            background: '#22c55e',
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontSize: '0.7vw',
                                            fontWeight: '600',
                                            color: '#166534',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px'
                                        },
                                        text: 'All Accepted ✓'
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }))
        }

        const tableContainer = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '100%',
                    height: 'calc(100% - 60px)',
                    padding: '0 1rem 0.5rem 1rem',
                    background: '#ffffff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                },
                child: [
                    // Table Header
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            background: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            padding: '0.6rem 0',
                            flexShrink: 0,
                            borderRadius: '0.4vw 0.4vw 0 0',
                            minHeight: '2.5rem'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '16%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Event Name'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '20%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Title'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '14%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Presenter'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '14%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Author'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '14%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Co-Author(s)'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '14%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                text: 'Date'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '8%',
                                    padding: '0 0.8rem',
                                    fontSize: '0.65vw',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                },
                                text: 'Status'
                            })
                        ]
                    }),
                    // Table Body (scrollable)
                    $({
                        tag: 'div',
                        style: {
                            flex: '1',
                            overflowY: 'auto',
                            background: '#ffffff',
                            borderRadius: '0 0 0.4vw 0.4vw'
                        },
                        elementHandler: (el) => {
                            tableBody = el
                            // Fetch data using the correct endpoint
                            const req = new Request('/filesSend')
                            req.Post([
                                { name: 'getResearchData', value: '1' }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                allData = data
                                // Populate filter dropdown with unique event names
                                const uniqueEvents = [...new Set(data.map(val => val.event))].filter(Boolean)
                                uniqueEvents.forEach(eventName => {
                                    filterSelect.appendChild($({
                                        tag: 'option',
                                        text: eventName,
                                        att: {
                                            value: eventName
                                        },
                                        style: {
                                            background: '#ffffff',
                                            color: '#1e293b'
                                        }
                                    }))
                                })
                                renderTableRows(data)
                            }).catch(err => {
                                console.log('Error fetching research data:', err)
                                tableBody.innerHTML = ''
                                const errorDiv = $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '3rem',
                                        color: '#ef4444',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        fontSize: '0.85vw',
                                        height: '100%'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                fontSize: '2rem',
                                                marginBottom: '0.5rem'
                                            },
                                            text: '⚠️'
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Error loading data. Please try again.'
                                        })
                                    ]
                                })
                                tableBody.appendChild(errorDiv)
                            })
                        }
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                margin: 'auto',
                height: '100%',
                width: '100%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column'
            },
            child: [
                head(),
                tableContainer()
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
            background: '#ffffff'
        },
        child: [
            $({
                tag: 'style',
                text: `
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(0.9); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    
                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #f1f5f9;
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 10px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `
            }),
            $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                },
                elementHandler: (el) => {
                    main = el
                },
                child: [
                    fileContent()
                ]
            })
        ]
    }))
}

const AddDocType = () => {
    const Add = () => {
        let docName = "";

        return ($({
            tag: 'div',
            style: {
                height: '10vh',
                width: '100%',
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.5vh 1vw',
                background: '#f8fafc'
            },
            child: [
                $({
                    tag: 'div',
                    text: 'Add Document Type',
                    style: {
                        margin: 'auto',
                        height: 'fit-content',
                        width: 'fit-content',
                        marginLeft: '.5vw',
                        marginRight: '0',
                        fontSize: '1.2vw',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: '600',
                        color: '#1e293b'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        height: 'fit-content',
                        width: 'fit-content',
                        padding: '.4rem .8rem',
                        margin: 'auto',
                        marginLeft: '.5vw',
                        border: '1px solid #e2e8f0',
                        borderRadius: '.5vw',
                        background: '#ffffff',
                        display: 'flex',
                        gap: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'input',
                            att: {
                                placeholder: 'Enter document type name...'
                            },
                            style: {
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.85vw',
                                color: '#1e293b',
                                width: '20vw',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                            },
                            elementHandler: (el) => {
                                setTimeout(() => { el.focus() }, 100)
                            },
                            event: {
                                type: 'input',
                                method: (ev) => {
                                    docName = ev.target.value;
                                }
                            }
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-plus'
                            },
                            style: {
                                margin: 'auto',
                                fontSize: '1vw',
                                height: 'fit-content',
                                width: 'fit-content',
                                padding: '0.3rem 0.8rem',
                                background: '#3b82f6',
                                color: '#fff',
                                borderRadius: '.3vw',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                mouseover: (e) => {
                                    e.currentTarget.style.background = '#2563eb'
                                },
                                mouseout: (e) => {
                                    e.currentTarget.style.background = '#3b82f6'
                                },
                                type: 'click',
                                method: () => {
                                    if (docName.trim() === '') {
                                        alert("Please enter a document type name");
                                    } else {
                                        if (confirm("Do you want to save this data?")) {
                                            const load = Waiting()
                                            document.body.appendChild(load)
                                            const req = new Request('/getDocType')
                                            req.Post([
                                                { name: 'doctype', value: docName },
                                                { name: 'addDoctype', value: '1' }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                load.remove();
                                                setTimeout(() => {
                                                    alert(data.message);
                                                    window.location.reload()
                                                }, 100)
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

    const body = () => {
        const typeList = (id, name, date) => {
            const label = ({ name, time }, width) => {
                const month = new Date(date.split(' ')[0]).toLocaleString('default', { month: 'long' });
                const dt = date.split(' ')[0].split('-')
                const timeFormat = date.split(' ')[1].split(':')
                return ($({
                    tag: 'div',
                    style: {
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        width: width,
                        color: '#1e293b',
                        fontSize: '0.85vw'
                    },
                    elementHandler: (el) => {
                        if (name) {
                            el.innerText = name
                        }
                        if (time) {
                            el.innerText = dt[0] + ' ' + month + ', ' + dt[2] + ' | ' + TimeConvert(timeFormat)
                        }
                    }
                }))
            }

            const Remover = () => {
                return ($({
                    tag: 'div',
                    style: {
                        width: '5%',
                        textAlign: 'center',
                        margin: 'auto',
                        padding: '.2rem .5rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '.3vw',
                        transition: 'all 0.2s ease'
                    },
                    att: {
                        className: 'fa-solid fa-trash-can'
                    },
                    event: {
                        mouseover: (e) => {
                            e.currentTarget.style.background = '#fef2f2'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.background = 'transparent'
                        },
                        type: 'click',
                        method: () => {
                            if (confirm("Are you sure you want to delete this file?\nThis process cannot be undone.")) {
                                const loading = Waiting()
                                document.body.appendChild(loading)
                                const req = new Request('/getDocType')
                                req.Post([
                                    { name: 'deletedocType', value: '1' },
                                    { name: 'doctypeId', value: id }
                                ])
                                req.Json()
                                req.Send().then(data => {
                                    loading.remove()
                                    setTimeout(() => {
                                        if (data.status) {
                                            alert(data.message)
                                            window.location.reload()
                                        } else {
                                            alert(data.message)
                                        }
                                    }, 100)
                                })
                            }
                        }
                    }
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    display: 'flex',
                    marginTop: '.3vh',
                    marginBottom: '.3vh',
                    padding: '.5rem .8rem',
                    background: '#ffffff',
                    borderBottom: '1px solid #f1f5f9',
                    borderRadius: '0.3vw',
                    transition: 'all 0.2s ease'
                },
                att: {
                    className: 'typeList'
                },
                event: {
                    mouseenter: (e) => {
                        e.currentTarget.style.background = '#f8fafc'
                    },
                    mouseleave: (e) => {
                        e.currentTarget.style.background = '#ffffff'
                    }
                },
                child: [
                    label({ name: name }, '65%'),
                    label({ time: date }, '30%'),
                    Remover()
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '80%',
                height: '89%',
                margin: 'auto',
                overflowY: 'auto',
                padding: '0.5vw',
                background: '#ffffff'
            },
            elementHandler: (el) => {
                const req = new Request('/getDocType')
                req.Post([
                    { name: 'getDoctype', value: '1' }
                ])
                req.Json()
                req.Send().then(data => {
                    data.forEach(val => {
                        el.appendChild(typeList(val.id, val.name, val.date))
                    })
                })
            }
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            background: '#ffffff'
        },
        child: [
            Add(),
            body()
        ]
    }))
}

const DownloadBackup = () => {
    const Comm = () => {
        return ($({
            tag: 'div',
            style: {
                width: '50%',
                height: '100%',
                background: '#ffffff'
            }
        }))
    }

    const EventDoc = () => {
        let eventName = ''

        const SelectFile = (event, req) => {
            return ($({
                tag: "div",
                style: {
                    border: '1px solid #e2e8f0',
                    padding: '.5rem',
                    margin: '3vh auto',
                    width: '80%',
                    borderRadius: '0.5vw',
                    background: '#ffffff'
                },
                child: [
                    $({
                        tag: 'select',
                        style: {
                            width: '100%',
                            background: "transparent",
                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontSize: '0.95vw',
                            fontWeight: '500',
                            color: '#1e293b',
                            cursor: 'pointer'
                        },
                        event: event,
                        elementHandler: req
                    })
                ]
            }))
        }

        const getEvent = {
            type: 'change',
            method: (val) => {
                eventName = val.target.value;
            }
        }

        const Zip = () => {
            return ($({
                tag: 'div',
                style: {
                    border: '1px solid #e2e8f0',
                    borderRadius: '.5vw',
                    padding: '.6rem 1.2rem',
                    margin: '3vh auto',
                    width: 'fit-content',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#3b82f6',
                    transition: 'all 0.2s ease'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-file-zipper'
                        },
                        style: {
                            color: '#fff',
                            fontSize: '0.95vw'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: ' Download Zip File',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    marginLeft: '0.8vw',
                                    color: '#fff',
                                    fontWeight: '500'
                                }
                            })
                        ]
                    })
                ],
                event: {
                    mouseover: (e) => {
                        e.currentTarget.style.background = '#2563eb'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.background = '#3b82f6'
                    },
                    type: 'click',
                    method: () => {
                        if (!eventName || eventName === '- - Select Event - -') {
                            alert('Please select an event first')
                            return
                        }
                        const req = new Request('/generateZip')
                        req.Post([
                            { name: 'backup', value: '1' },
                            { name: 'eventName', value: eventName }
                        ])
                        req.Json()
                        req.Send().then(data => {
                            let campusFolder = "";
                            let entriesFolder = "";
                            let categoryFolder = "";
                            data.campus.forEach(val => {
                                const zip = new JSZip();
                                campusFolder = val.campusName + '/'
                                val.campusFiles.forEach(v => {
                                    const dataUri = fetch(v.endorsementFile.replace('..', '')).then(rr => rr.arrayBuffer())
                                    entriesFolder = campusFolder + 'entries/'
                                    zip.folder(campusFolder).file('endorsement.pdf', dataUri)
                                    zip.folder(entriesFolder)
                                    v.entries.forEach(vv => {
                                        let cat = vv.category.replace('/', '-')
                                        categoryFolder = entriesFolder + cat + '/'
                                        vv.filesDocs.forEach((vfile, i) => {
                                            const dat = fetch(vfile.file.replace('..', '')).then(rr => rr.arrayBuffer())
                                            zip.folder(categoryFolder).file(`${vfile.author}-${vfile.docId}.pdf`, dat)
                                        })
                                    })
                                })
                                zip.generateAsync({ type: "base64" }).then(function (base64) {
                                    let a = document.createElement("a");
                                    a.href = "data:application/zip;base64," + base64;
                                    a.download = `${val.campusName}.zip`;
                                    a.click();
                                }, function (err) {
                                    console.log(err)
                                });
                            })
                        })
                    }
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '50%',
                height: '100%',
                borderRight: '1px solid #e2e8f0',
                background: '#f8fafc'
            },
            child: [
                $({
                    tag: 'div',
                    text: 'Download Files for Backup',
                    style: {
                        textAlign: 'center',
                        marginTop: '4vh',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        color: '#1e293b',
                        fontSize: '1.2vw',
                        fontWeight: '600'
                    }
                }),
                SelectFile(getEvent, (el) => {
                    el.appendChild($({
                        tag: 'option',
                        text: '- - Select Event - -',
                        style: {
                            background: '#ffffff',
                            color: '#64748b'
                        }
                    }))
                    const req = new Request('/eventRequest')
                    req.Post([
                        { name: 'getEvent', value: '1' }
                    ])
                    req.Json()
                    req.Send().then(data => {
                        data.forEach(val => {
                            el.appendChild($({
                                tag: 'option',
                                text: val.name,
                                style: {
                                    background: '#ffffff',
                                    color: '#1e293b'
                                }
                            }))
                        })
                    })
                }),
                Zip()
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            background: '#ffffff'
        },
        child: [
            EventDoc(),
            Comm(),
        ]
    }))
}

// Tab button component - cached
let tabCacheInstance = null

const TabButton = ({ label, url, isActive, onClick }) => {
    return ($({
        tag: 'div',
        style: {
            padding: '0.6rem 1.5rem',
            cursor: 'pointer',
            color: isActive ? '#3b82f6' : '#64748b',
            fontWeight: isActive ? '600' : '500',
            fontSize: '0.85vw',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.2s ease',
            background: isActive ? '#f8fafc' : 'transparent',
            borderRadius: '0.4vw 0.4vw 0 0',
            position: 'relative',
            userSelect: 'none'
        },
        event: {
            mouseenter: (e) => {
                if (!isActive) {
                    e.currentTarget.style.color = '#1e293b'
                    e.currentTarget.style.background = '#f1f5f9'
                }
            },
            mouseleave: (e) => {
                if (!isActive) {
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = 'transparent'
                }
            },
            type: 'click',
            method: onClick
        },
        child: [
            $({
                tag: 'span',
                text: label
            })
        ]
    }))
}

const TabHolder = ({ buttons, activeUrl }) => {
    return ($({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '0.2vw',
            padding: '0 1vw',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            height: '6vh',
            alignItems: 'center',
            flexShrink: 0
        },
        child: buttons.map(val => {
            const isActive = val.url.split('/')[3] === activeUrl.split('/')[3]
            return TabButton({
                label: val.name,
                url: val.url,
                isActive: isActive,
                onClick: () => {
                    window.location.assign(val.url)
                }
            })
        })
    }))
}

export const Files = () => {
    const buttons = [
        { url: '/admin/files/endorsement', name: 'Communication', page: Communication },
        { url: '/admin/files/systemfiles/allevents', name: 'Symposium/In-house Review', page: SystemFile },
        { url: '/admin/files/add_docType', name: 'DocTypes', page: AddDocType },
        { url: '/admin/files/backup', name: 'Backup', page: DownloadBackup }
    ]

    // Get current URL path
    const currentUrl = window.location.href.replace(window.location.origin, '')
    const currentPath = currentUrl.split('/')[3] || 'endorsement'

    // Find the active button
    const activeButton = buttons.find(val => {
        const buttonPath = val.url.split('/')[3]
        return buttonPath === currentPath
    }) || buttons[0]

    // Initialize cache if not exists
    if (!tabCacheInstance) {
        tabCacheInstance = new Map()
    }

    // Get or create page instance
    let pageInstance = tabCacheInstance.get(activeButton.url)
    if (!pageInstance) {
        pageInstance = activeButton.page()
        tabCacheInstance.set(activeButton.url, pageInstance)
    }

    return ($({
        externalStyle: '/client/component/adminComponent/componentStyle/file.css',
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
        },
        child: [
            TabHolder({
                buttons: buttons,
                activeUrl: currentUrl
            }),
            $({
                tag: 'div',
                style: {
                    flex: '1',
                    overflow: 'hidden',
                    background: '#ffffff'
                },
                child: [pageInstance]
            })
        ]
    }))
}
import { $, Base, Current, LoadLocation, Path, Request, TimeConvert } from '../../../lib/lib.js'
import { Error } from "../../../error.js";

export const DocumentLog = () => {
    const Bot = ({ label, url }) => {
        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '50%',
                display: 'flex',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            },
            att: {
                className: 'docLogBot'
            },
            elementHandler: (el) => {
                if (url.split('/')[3] === Path(3)) {
                    Object.assign(el.style, {
                        color: '#3b82f6',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.03) 100%)',
                        borderBottom: '2px solid #3b82f6',
                        pointerEvents: 'none'
                    })
                }
            },
            event: {
                type: 'click',
                method: () => {
                    LoadLocation(url)
                }
            },
            child: [
                $({
                    tag: 'div',
                    text: label,
                    style: {
                        width: 'fit-content',
                        height: 'fit-content',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontSize: '0.85vw',
                        margin: 'auto',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                    }
                })
            ]
        }))
    }

    const systemLogs = () => {
        let bodyMainList
        let currentSort = { column: null, ascending: true }

        const Logs = ({ date, time, rdeName, details, id }) => {
            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '100%',
                    padding: '1vh 0',
                    background: '#ffffff',
                    margin: '0.5vh auto',
                    display: 'flex',
                    borderRadius: '0.5vw',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontSize: '0.85vw',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                },
                att: {
                    className: 'logList'
                },
                event: {
                    mouseover: (e) => {
                        e.currentTarget.style.transform = 'translateX(4px)'
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.08)'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: date || 'N/A',
                        style: {
                            width: '15%',
                            paddingLeft: '1vw',
                            color: '#1e293b',
                            fontWeight: '500'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: time || 'N/A',
                        style: {
                            width: '15%',
                            color: '#1e293b'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '25%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-user-circle'
                                },
                                style: {
                                    color: '#3b82f6',
                                    fontSize: '0.9vw'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: rdeName || 'SYSTEM',
                                style: {
                                    color: '#3b82f6',
                                    fontWeight: '600'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '45%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw',
                            paddingRight: '1vw',
                            cursor: 'pointer'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-message'
                                },
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '0.8vw'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: details || 'No details',
                                style: {
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    color: '#475569',
                                    flex: '1'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                showSystemDetailsModal(details, rdeName, date, time)
                            }
                        }
                    })
                ]
            }))
        }

        const showSystemDetailsModal = (details, rdeName, date, time) => {
            const modal = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '50%',
                            height: 'fit-content',
                            background: '#ffffff',
                            margin: 'auto',
                            padding: '2rem',
                            borderRadius: '0.8vw',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '1.5vh',
                                    right: '1.5vw',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '1.5vw',
                                    transition: 'all 0.2s ease'
                                },
                                att: {
                                    className: 'fa-solid fa-circle-xmark'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        modal.remove()
                                    },
                                    mouseover: (e) => {
                                        e.target.style.color = '#3b82f6'
                                    },
                                    mouseout: (e) => {
                                        e.target.style.color = '#94a3b8'
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontSize: '1.4vw',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '2vh',
                                    fontWeight: '700'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-file-lines me-2'
                                        },
                                        style: {
                                            color: '#3b82f6',
                                            marginRight: '0.5vw'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'System Log Details'
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    background: '#f8fafc',
                                    borderRadius: '0.6vw',
                                    padding: '1.5rem',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '2vh'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            gap: '2vw',
                                            marginBottom: '1.5vh',
                                            paddingBottom: '1vh',
                                            borderBottom: '1px solid #e2e8f0'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-calendar'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: date,
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-clock'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: time,
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-user'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: rdeName || 'SYSTEM',
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontWeight: '600',
                                                            fontSize: '0.9vw'
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            fontFamily: 'Segoe UI, sans-serif',
                                            fontSize: '0.95vw',
                                            color: '#334155',
                                            lineHeight: '1.7',
                                            maxHeight: '40vh',
                                            overflowY: 'auto',
                                            padding: '1rem',
                                            background: '#ffffff',
                                            borderRadius: '0.4vw',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            border: '1px solid #e2e8f0'
                                        },
                                        text: details || 'No details available'
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '0.6rem 2rem',
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '2vw',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '0.9vw',
                                            fontFamily: 'Segoe UI, sans-serif',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            minWidth: '150px'
                                        },
                                        text: 'Close',
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                modal.remove()
                                            },
                                            mouseover: (e) => {
                                                e.target.style.background = '#2563eb'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.background = '#3b82f6'
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modal)
        }

        const sortData = (column, data) => {
            const sorted = [...data]
            const ascending = currentSort.column === column ? !currentSort.ascending : true

            sorted.sort((a, b) => {
                let valA, valB

                switch (column) {
                    case 'date':
                        valA = new Date(a.date)
                        valB = new Date(b.date)
                        break
                    case 'time':
                        valA = a.date.split(" ")[1]
                        valB = b.date.split(" ")[1]
                        break
                    case 'rde':
                        valA = (a.rdeName || 'SYSTEM').toLowerCase()
                        valB = (b.rdeName || 'SYSTEM').toLowerCase()
                        break
                    case 'details':
                        valA = (a.details || '').toLowerCase()
                        valB = (b.details || '').toLowerCase()
                        break
                    default:
                        return 0
                }

                if (valA < valB) return ascending ? -1 : 1
                if (valA > valB) return ascending ? 1 : -1
                return 0
            })

            currentSort = { column, ascending }
            return sorted
        }

        const SortHeader = ({ label, width, column }) => {
            return ($({
                tag: 'div',
                style: {
                    width: width,
                    height: '100%',
                    margin: 'auto',
                    borderLeft: 'solid thin #e2e8f0',
                    display: 'flex',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    alignItems: 'center'
                },
                att: {
                    className: 'sortHead'
                },
                event: {
                    type: 'click',
                    method: (event) => {
                        const headers = document.querySelectorAll('.sortHead')
                        headers.forEach(header => {
                            const icon = header.querySelector('.sort-icon')
                            if (icon) {
                                icon.className = 'fa-solid fa-sort sort-icon'
                                icon.style.color = '#94a3b8'
                            }
                        })

                        const currentIcon = event.currentTarget.querySelector('.sort-icon')
                        if (currentIcon) {
                            if (currentSort.column === column) {
                                currentIcon.className = currentSort.ascending ?
                                    'fa-solid fa-sort-up sort-icon' :
                                    'fa-solid fa-sort-down sort-icon'
                            } else {
                                currentIcon.className = 'fa-solid fa-sort-up sort-icon'
                            }
                            currentIcon.style.color = '#3b82f6'
                        }

                        const req = new Request('/documentLog');
                        req.Post([{ name: 'logRequest', value: '1' }])
                        req.Json()
                        req.Send().then(data => {
                            const sortedData = sortData(column, data)
                            while (bodyMainList.firstChild) {
                                bodyMainList.removeChild(bodyMainList.firstChild)
                            }
                            sortedData.forEach(val => {
                                let name = val.rdeName
                                if (val.rdeName === null) {
                                    name = 'SYSTEM'
                                }
                                bodyMainList.appendChild(Logs({
                                    rdeName: name,
                                    details: val.details,
                                    id: val.id,
                                    date: val.date.split(" ")[0],
                                    time: TimeConvert(val.date.split(" ")[1].split(":")),
                                }))
                            })
                        })
                    },
                    mouseover: (e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: label,
                        style: {
                            width: 'fit-content',
                            height: 'fit-content',
                            margin: 'auto',
                            marginLeft: '1vw',
                            color: '#64748b',
                            fontWeight: '600',
                            fontSize: '0.75vw',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: 'fit-content',
                            height: 'fit-content',
                            margin: 'auto',
                            marginRight: '1vw',
                        },
                        att: {
                            className: 'fa-solid fa-sort sort-icon'
                        },
                        style: {
                            color: '#94a3b8',
                            fontSize: '0.8vw',
                            transition: 'color 0.2s ease'
                        }
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        height: '8%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 1vw',
                        marginBottom: '0.5vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                height: '4vh',
                                border: '1px solid #e2e8f0',
                                width: '30vw',
                                borderRadius: '2vw',
                                display: 'flex',
                                padding: '0 1vw',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                alignItems: 'center',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                focusin: (e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                },
                                focusout: (e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.backgroundColor = '#f8fafc'
                                }
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-search'
                                    },
                                    style: {
                                        fontSize: '0.8vw',
                                        color: '#94a3b8',
                                        marginRight: '0.5vw'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        height: '100%',
                                        width: '100%',
                                        color: '#1e293b',
                                        fontSize: '0.8vw',
                                        fontFamily: 'Segoe UI, sans-serif'
                                    },
                                    att: {
                                        placeholder: 'Search system logs...',
                                        type: 'text'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (ev) => {
                                            if (bodyMainList) {
                                                const list = bodyMainList.children
                                                for (const v of list) {
                                                    if (v.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                                        v.style.display = 'flex'
                                                    } else {
                                                        v.style.display = 'none'
                                                    }
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
                                marginLeft: 'auto',
                                display: 'flex',
                                gap: '0.5vw',
                                color: '#94a3b8',
                                fontSize: '0.75vw'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-info-circle'
                                    },
                                    style: {
                                        color: '#3b82f6'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Click on any log to view full details'
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '6%',
                        borderTop: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        fontFamily: 'Segoe UI, sans-serif',
                        background: '#f8fafc'
                    },
                    child: [
                        SortHeader({ label: 'DATE', width: '15%', column: 'date' }),
                        SortHeader({ label: 'TIME', width: '15%', column: 'time' }),
                        SortHeader({ label: 'USER', width: '25%', column: 'rde' }),
                        SortHeader({ label: 'DETAILS', width: '45%', column: 'details' })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        height: '85%',
                        width: '100%',
                        overflowY: 'auto',
                        padding: '0.5vw',
                        background: '#ffffff'
                    },
                    elementHandler: (el) => {
                        bodyMainList = el
                        const req = new Request('/documentLog');
                        req.Post([
                            {
                                name: 'logRequest',
                                value: '1'
                            }
                        ])
                        req.Json()
                        req.Send().then(data => {
                            if (data && data.length > 0) {
                                data.sort((a, b) => new Date(b.date) - new Date(a.date))

                                data.forEach(val => {
                                    let name = val.rdeName
                                    if (val.rdeName === null) {
                                        name = 'SYSTEM'
                                    }
                                    el.appendChild(Logs({
                                        rdeName: name,
                                        details: val.details,
                                        id: val.id,
                                        date: val.date.split(" ")[0],
                                        time: TimeConvert(val.date.split(" ")[1].split(":")),
                                    }))
                                })
                            } else {
                                el.appendChild($({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        padding: '4rem 2rem',
                                        textAlign: 'center',
                                        color: '#94a3b8'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-folder-open'
                                            },
                                            style: {
                                                fontSize: '3vw',
                                                color: '#e2e8f0',
                                                marginBottom: '1vh'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'No system logs found',
                                            style: {
                                                fontSize: '1vw',
                                                color: '#64748b'
                                            }
                                        })
                                    ]
                                }))
                            }
                        }).catch(error => {
                            console.error('Error loading system logs:', error)
                            el.appendChild(Error({ message: 'Failed to load system logs' }))
                        })
                    }
                })
            ]
        }))
    }

    const emailLogs = () => {
        let bodyMainList
        let currentSort = { column: null, ascending: true }

        const EmailLogItem = ({ id, document_id, evaluator_id, author_email, sent_date, email_type, status }) => {
            const date = sent_date ? sent_date.split(" ")[0] : 'N/A'
            const time = sent_date ? TimeConvert(sent_date.split(" ")[1].split(":")) : 'N/A'

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '100%',
                    padding: '1vh 0',
                    background: '#ffffff',
                    margin: '0.5vh auto',
                    display: 'flex',
                    borderRadius: '0.5vw',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontSize: '0.85vw',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    boxSizing: 'border-box'
                },
                att: {
                    className: 'logList'
                },
                event: {
                    mouseover: (e) => {
                        e.currentTarget.style.transform = 'translateX(4px)'
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.08)'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: date,
                        style: {
                            width: '12%',
                            paddingLeft: '1vw',
                            color: '#1e293b',
                            fontWeight: '500',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }),
                    $({
                        tag: 'div',
                        text: time,
                        style: {
                            width: '10%',
                            color: '#1e293b',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '20%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw',
                            boxSizing: 'border-box',
                            paddingRight: '0.5vw'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-envelope'
                                },
                                style: {
                                    color: '#3b82f6',
                                    fontSize: '0.9vw',
                                    flexShrink: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                text: author_email || 'N/A',
                                style: {
                                    color: '#3b82f6',
                                    fontWeight: '500',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '15%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw',
                            boxSizing: 'border-box',
                            paddingRight: '0.5vw'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-tag'
                                },
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '0.8vw',
                                    flexShrink: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                text: email_type || 'N/A',
                                style: {
                                    color: '#475569',
                                    textTransform: 'capitalize',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '10%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw',
                            boxSizing: 'border-box'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: `fa-solid ${status ? 'fa-check-circle' : 'fa-clock'}`
                                },
                                style: {
                                    color: status ? '#22c55e' : '#f59e0b',
                                    fontSize: '0.8vw',
                                    flexShrink: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                text: status ? 'Sent' : 'Pending',
                                style: {
                                    color: status ? '#22c55e' : '#f59e0b',
                                    fontWeight: '500',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '15%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5vw',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            paddingRight: '0.5vw'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-eye'
                                },
                                style: {
                                    color: '#3b82f6',
                                    fontSize: '0.8vw',
                                    flexShrink: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                text: `Doc #${document_id || 'N/A'}`,
                                style: {
                                    color: '#3b82f6',
                                    fontWeight: '500',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }
                            })
                        ],
                        event: {
                            type: 'click',
                            method: () => {
                                showEmailDetailsModal({
                                    id, document_id, evaluator_id, author_email, sent_date, email_type, status
                                })
                            }
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '8%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3vw',
                            boxSizing: 'border-box'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-id-card'
                                },
                                style: {
                                    color: '#cbd5e1',
                                    fontSize: '0.8vw',
                                    flexShrink: 0
                                }
                            }),
                            $({
                                tag: 'span',
                                text: `E-${id}`,
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '0.75vw',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden'
                                }
                            })
                        ]
                    })
                ]
            }))
        }

        const showEmailDetailsModal = (data) => {
            const modal = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    zIndex: '9999',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '50%',
                            height: 'fit-content',
                            background: '#ffffff',
                            margin: 'auto',
                            padding: '2rem',
                            borderRadius: '0.8vw',
                            position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '1.5vh',
                                    right: '1.5vw',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    fontSize: '1.5vw',
                                    transition: 'all 0.2s ease'
                                },
                                att: {
                                    className: 'fa-solid fa-circle-xmark'
                                },
                                event: {
                                    type: 'click',
                                    method: () => {
                                        modal.remove()
                                    },
                                    mouseover: (e) => {
                                        e.target.style.color = '#3b82f6'
                                    },
                                    mouseout: (e) => {
                                        e.target.style.color = '#94a3b8'
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontSize: '1.4vw',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    marginBottom: '2vh',
                                    fontWeight: '700'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-envelope'
                                        },
                                        style: {
                                            color: '#3b82f6',
                                            marginRight: '0.5vw'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Email Log Details'
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    background: '#f8fafc',
                                    borderRadius: '0.6vw',
                                    padding: '1.5rem',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '2vh'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '1.5vh 2vw',
                                            marginBottom: '1.5vh',
                                            paddingBottom: '1vh',
                                            borderBottom: '1px solid #e2e8f0'
                                        },
                                        child: [
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-calendar'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: data.sent_date ? data.sent_date.split(" ")[0] : 'N/A',
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-clock'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: data.sent_date ? TimeConvert(data.sent_date.split(" ")[1].split(":")) : 'N/A',
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-user'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: data.author_email || 'N/A',
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-tag'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: data.email_type || 'N/A',
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500',
                                                            textTransform: 'capitalize'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: `fa-solid ${data.status ? 'fa-check-circle' : 'fa-clock'}`
                                                        },
                                                        style: {
                                                            color: data.status ? '#22c55e' : '#f59e0b',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: data.status ? 'Sent' : 'Pending',
                                                        style: {
                                                            color: data.status ? '#22c55e' : '#f59e0b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            }),
                                            $({
                                                tag: 'div',
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'span',
                                                        att: {
                                                            className: 'fa-solid fa-file'
                                                        },
                                                        style: {
                                                            color: '#3b82f6',
                                                            fontSize: '0.9vw'
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'span',
                                                        text: `Document #${data.document_id || 'N/A'}`,
                                                        style: {
                                                            color: '#1e293b',
                                                            fontSize: '0.9vw',
                                                            fontWeight: '500'
                                                        }
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.5rem 0',
                                            fontSize: '0.85vw',
                                            color: '#64748b'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                text: `Log ID: E-${data.id}`
                                            }),
                                            $({
                                                tag: 'span',
                                                text: `Evaluator ID: ${data.evaluator_id || 'N/A'}`
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'center'
                                },
                                child: [
                                    $({
                                        tag: 'button',
                                        style: {
                                            padding: '0.6rem 2rem',
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '2vw',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '0.9vw',
                                            fontFamily: 'Segoe UI, sans-serif',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease',
                                            minWidth: '150px'
                                        },
                                        text: 'Close',
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                modal.remove()
                                            },
                                            mouseover: (e) => {
                                                e.target.style.background = '#2563eb'
                                            },
                                            mouseout: (e) => {
                                                e.target.style.background = '#3b82f6'
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modal)
        }

        const sortEmailData = (column, data) => {
            const sorted = [...data]
            const ascending = currentSort.column === column ? !currentSort.ascending : true

            sorted.sort((a, b) => {
                let valA, valB

                switch (column) {
                    case 'date':
                        valA = new Date(a.sent_date)
                        valB = new Date(b.sent_date)
                        break
                    case 'time':
                        valA = a.sent_date ? a.sent_date.split(" ")[1] : ''
                        valB = b.sent_date ? b.sent_date.split(" ")[1] : ''
                        break
                    case 'email':
                        valA = (a.author_email || '').toLowerCase()
                        valB = (b.author_email || '').toLowerCase()
                        break
                    case 'type':
                        valA = (a.email_type || '').toLowerCase()
                        valB = (b.email_type || '').toLowerCase()
                        break
                    case 'status':
                        valA = a.status ? 1 : 0
                        valB = b.status ? 1 : 0
                        break
                    case 'document':
                        valA = a.document_id || 0
                        valB = b.document_id || 0
                        break
                    default:
                        return 0
                }

                if (valA < valB) return ascending ? -1 : 1
                if (valA > valB) return ascending ? 1 : -1
                return 0
            })

            currentSort = { column, ascending }
            return sorted
        }

        const EmailSortHeader = ({ label, width, column }) => {
            return ($({
                tag: 'div',
                style: {
                    width: width,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: 'solid thin #e2e8f0',
                    boxSizing: 'border-box'
                },
                att: {
                    className: 'sortHead'
                },
                event: {
                    type: 'click',
                    method: (event) => {
                        const headers = document.querySelectorAll('.sortHead')
                        headers.forEach(header => {
                            const icon = header.querySelector('.sort-icon')
                            if (icon) {
                                icon.className = 'fa-solid fa-sort sort-icon'
                                icon.style.color = '#94a3b8'
                            }
                        })

                        const currentIcon = event.currentTarget.querySelector('.sort-icon')
                        if (currentIcon) {
                            if (currentSort.column === column) {
                                currentIcon.className = currentSort.ascending ?
                                    'fa-solid fa-sort-up sort-icon' :
                                    'fa-solid fa-sort-down sort-icon'
                            } else {
                                currentIcon.className = 'fa-solid fa-sort-up sort-icon'
                            }
                            currentIcon.style.color = '#3b82f6'
                        }

                        const req = new Request('/documentLog');
                        req.Post([{ name: 'emailLogRequest', value: '1' }])
                        req.Json()
                        req.Send().then(data => {
                            if (Array.isArray(data) && data.length > 0) {
                                const sortedData = sortEmailData(column, data)
                                while (bodyMainList.firstChild) {
                                    bodyMainList.removeChild(bodyMainList.firstChild)
                                }
                                sortedData.forEach(val => {
                                    bodyMainList.appendChild(EmailLogItem({
                                        id: val.id,
                                        document_id: val.document_id,
                                        evaluator_id: val.evaluator_id,
                                        author_email: val.author_email,
                                        sent_date: val.sent_date,
                                        email_type: val.email_type,
                                        status: val.status
                                    }))
                                })
                            }
                        }).catch(error => {
                            console.error('Error sorting email logs:', error)
                        })
                    },
                    mouseover: (e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: label,
                        style: {
                            marginLeft: '1vw',
                            color: '#64748b',
                            fontWeight: '600',
                            fontSize: '0.75vw',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            flex: 1
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            marginRight: '1vw',
                            display: 'flex',
                            alignItems: 'center'
                        },
                        att: {
                            className: 'fa-solid fa-sort sort-icon'
                        },
                        style: {
                            color: '#94a3b8',
                            fontSize: '0.8vw',
                            transition: 'color 0.2s ease'
                        }
                    })
                ]
            }))
        }

        return ($({
            tag: 'div',
            style: {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        height: '8%',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 1vw',
                        marginBottom: '0.5vh',
                        boxSizing: 'border-box'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                height: '4vh',
                                border: '1px solid #e2e8f0',
                                width: '30vw',
                                borderRadius: '2vw',
                                display: 'flex',
                                padding: '0 1vw',
                                backgroundColor: '#f8fafc',
                                color: '#334155',
                                alignItems: 'center',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            },
                            event: {
                                focusin: (e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                },
                                focusout: (e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.backgroundColor = '#f8fafc'
                                }
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-search'
                                    },
                                    style: {
                                        fontSize: '0.8vw',
                                        color: '#94a3b8',
                                        marginRight: '0.5vw'
                                    }
                                }),
                                $({
                                    tag: 'input',
                                    style: {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        height: '100%',
                                        width: '100%',
                                        color: '#1e293b',
                                        fontSize: '0.8vw',
                                        fontFamily: 'Segoe UI, sans-serif'
                                    },
                                    att: {
                                        placeholder: 'Search email logs...',
                                        type: 'text'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (ev) => {
                                            if (bodyMainList) {
                                                const list = bodyMainList.children
                                                for (const v of list) {
                                                    if (v.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                                        v.style.display = 'flex'
                                                    } else {
                                                        v.style.display = 'none'
                                                    }
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
                                marginLeft: 'auto',
                                display: 'flex',
                                gap: '0.5vw',
                                color: '#94a3b8',
                                fontSize: '0.75vw'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-info-circle'
                                    },
                                    style: {
                                        color: '#3b82f6'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    text: 'Click on document ID to view details'
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '6%',
                        borderTop: '1px solid #e2e8f0',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        fontFamily: 'Segoe UI, sans-serif',
                        background: '#f8fafc',
                        boxSizing: 'border-box'
                    },
                    child: [
                        EmailSortHeader({ label: 'DATE', width: '12%', column: 'date' }),
                        EmailSortHeader({ label: 'TIME', width: '10%', column: 'time' }),
                        EmailSortHeader({ label: 'RECIPIENT', width: '20%', column: 'email' }),
                        EmailSortHeader({ label: 'TYPE', width: '15%', column: 'type' }),
                        EmailSortHeader({ label: 'STATUS', width: '10%', column: 'status' }),
                        EmailSortHeader({ label: 'DOCUMENT', width: '15%', column: 'document' }),
                        $({
                            tag: 'div',
                            style: {
                                width: '8%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                borderLeft: 'solid thin #e2e8f0',
                                boxSizing: 'border-box'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: 'LOG ID',
                                    style: {
                                        marginLeft: '1vw',
                                        color: '#64748b',
                                        fontWeight: '600',
                                        fontSize: '0.75vw',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        height: '85%',
                        width: '100%',
                        overflowY: 'auto',
                        padding: '0.5vw',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                    },
                    elementHandler: (el) => {
                        bodyMainList = el
                        const req = new Request('/documentLog');
                        req.Post([
                            {
                                name: 'emailLogRequest',
                                value: '1'
                            }
                        ])
                        req.Json()
                        req.Send().then(data => {
                            if (Array.isArray(data) && data.length > 0) {
                                data.sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))

                                data.forEach(val => {
                                    el.appendChild(EmailLogItem({
                                        id: val.id,
                                        document_id: val.document_id,
                                        evaluator_id: val.evaluator_id,
                                        author_email: val.author_email,
                                        sent_date: val.sent_date,
                                        email_type: val.email_type,
                                        status: val.status
                                    }))
                                })
                            } else {
                                el.appendChild($({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        padding: '4rem 2rem',
                                        textAlign: 'center',
                                        color: '#94a3b8'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-envelope-open'
                                            },
                                            style: {
                                                fontSize: '3vw',
                                                color: '#e2e8f0',
                                                marginBottom: '1vh'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'No email logs found',
                                            style: {
                                                fontSize: '1vw',
                                                color: '#64748b'
                                            }
                                        })
                                    ]
                                }))
                            }
                        }).catch(error => {
                            console.error('Error loading email logs:', error)
                            el.appendChild($({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    padding: '4rem 2rem',
                                    textAlign: 'center',
                                    color: '#ef4444'
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        att: {
                                            className: 'fa-solid fa-exclamation-triangle'
                                        },
                                        style: {
                                            fontSize: '3vw',
                                            color: '#ef4444',
                                            marginBottom: '1vh'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'Failed to load email logs',
                                        style: {
                                            fontSize: '1vw',
                                            color: '#ef4444'
                                        }
                                    })
                                ]
                            }))
                        })
                    }
                })
            ]
        }))
    }

    const Top = () => {
        return ($({
            tag: 'div',
            style: {
                height: '6vh',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5vw',
                padding: '0 1vw',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0'
            },
            child: [
                Bot({
                    label: 'System Logs',
                    url: '/admin/document_logs/system'
                }),
                Bot({
                    label: 'Email Logs',
                    url: '/admin/document_logs/email'
                })
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            height: '100%',
            width: '100%',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
        },
        externalStyle: '/client/component/adminComponent/componentStyle/docLogStyle.css',
        child: [
            Top(),
            $({
                tag: 'div',
                style: {
                    height: 'calc(100% - 6vh)',
                    width: '100%',
                    padding: '1vh 1vw',
                    boxSizing: 'border-box'
                },
                elementHandler: (el) => {
                    switch (Path(3)) {
                        case 'system':
                            el.appendChild(systemLogs())
                            break
                        case 'email':
                            el.appendChild(emailLogs())
                            break
                        default:
                            el.appendChild(Error({ message: 'Page not found' }))
                    }
                }
            })
        ]
    }))
}
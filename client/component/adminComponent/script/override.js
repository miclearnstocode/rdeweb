import { $, Request, SearchMethod } from "../../../lib/lib.js";

export const Override = () => {

    let docsBody, eventSelection

    const SearchFilter = () => {
        return ($({
            tag: 'div',
            style: {
                width: 'fit-content',
                height: 'fit-content',
                margin: 'auto 0',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'span',
                    att: {
                        className: 'fa-solid fa-search',
                    },
                    style: {
                        marginRight: '8px',
                        fontSize: '14px',
                        color: '#94a3b8'
                    }
                }),
                $({
                    tag: 'input',
                    style: {
                        backgroundColor: 'transparent',
                        height: '36px',
                        color: '#1e293b',
                        width: '250px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                    },
                    att: {
                        placeholder: 'Search documents...'
                    },
                    event: {
                        type: 'input',
                        method: (ev) => {
                            SearchMethod({
                                nodeList: docsBody.childNodes,
                                textArray: ev.target.value.toUpperCase().split(' '),
                                display: 'block'
                            })
                        }
                    }
                })
            ]
        }))
    }

    const Docs = ({ title, author, id, campus, category }) => {

        const details = ({ label, data }) => {
            return ($({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '8px',
                    padding: '2px 0',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '13px'
                },
                child: [
                    $({
                        tag: 'span',
                        text: label,
                        style: {
                            color: '#64748b',
                            fontWeight: '600',
                            minWidth: '80px'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: data || '—',
                        style: {
                            color: '#1e293b',
                        }
                    }),
                ]
            }))
        }

        const EditButton = () => {
            const EditPan = () => {
                let catSel

                const closeModal = () => {
                    const modal = document.querySelector('.override-modal')
                    if (modal) modal.remove()
                }

                return ($({
                    tag: 'div',
                    att: {
                        className: 'override-modal'
                    },
                    style: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(15,23,42,0.6)',
                        position: 'fixed',
                        zIndex: '9999',
                        left: '0',
                        top: '0',
                        display: 'flex',
                        backdropFilter: 'blur(4px)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '450px',
                                maxWidth: '90%',
                                height: 'fit-content',
                                backgroundColor: '#ffffff',
                                margin: 'auto',
                                borderRadius: '12px',
                                padding: '32px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                                border: '1px solid #e2e8f0',
                                position: 'relative'
                            },
                            child: [
                                // Close button
                                $({
                                    tag: 'span',
                                    att: {
                                        className: 'fa-solid fa-times'
                                    },
                                    style: {
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        color: '#94a3b8',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: closeModal
                                    },
                                    elementHandler: (el) => {
                                        el.addEventListener('mouseenter', () => {
                                            el.style.color = '#1e293b'
                                            el.style.backgroundColor = '#f1f5f9'
                                        })
                                        el.addEventListener('mouseleave', () => {
                                            el.style.color = '#94a3b8'
                                            el.style.backgroundColor = 'transparent'
                                        })
                                    }
                                }),

                                // Header
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        $({
                                            tag: 'h2',
                                            text: 'Edit Category',
                                            style: {
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                margin: '0 0 4px 0',
                                                letterSpacing: '-0.3px'
                                            }
                                        }),
                                        $({
                                            tag: 'p',
                                            text: 'Change the category for this document',
                                            style: {
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px',
                                                color: '#94a3b8',
                                                margin: '0'
                                            }
                                        })
                                    ]
                                }),

                                // Current Category
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '20px',
                                        padding: '12px 16px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                fontSize: '13px'
                                            },
                                            child: [
                                                $({
                                                    tag: 'span',
                                                    text: 'Current Category:',
                                                    style: {
                                                        color: '#64748b',
                                                        fontWeight: '500'
                                                    }
                                                }),
                                                $({
                                                    tag: 'span',
                                                    text: category || 'None',
                                                    style: {
                                                        color: '#3b82f6',
                                                        fontWeight: '600'
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),

                                // New Category Select
                                $({
                                    tag: 'div',
                                    style: {
                                        marginBottom: '24px'
                                    },
                                    child: [
                                        $({
                                            tag: 'label',
                                            text: 'New Category',
                                            style: {
                                                display: 'block',
                                                marginBottom: '6px',
                                                color: '#64748b',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                            }
                                        }),
                                        $({
                                            tag: 'select',
                                            style: {
                                                width: '100%',
                                                height: '40px',
                                                backgroundColor: '#f8fafc',
                                                color: '#1e293b',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                border: '1px solid #e2e8f0',
                                                padding: '0 12px',
                                                outline: 'none',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            elementHandler: (el) => {
                                                catSel = el
                                                const req = new Request('/requestcat')
                                                req.Post([
                                                    { name: 'requestCat' }
                                                ])
                                                req.Json()
                                                req.Send()
                                                    .then(data => {
                                                        data.forEach(val => {
                                                            el.appendChild($({
                                                                tag: 'option',
                                                                text: val.name,
                                                                att: {
                                                                    id: val.id
                                                                },
                                                                style: {
                                                                    backgroundColor: '#ffffff',
                                                                    fontSize: '14px',
                                                                    padding: '8px'
                                                                }
                                                            }))
                                                        })
                                                    })
                                            },
                                            event: {
                                                focus: (e) => {
                                                    e.currentTarget.style.borderColor = '#3b82f6'
                                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                                },
                                                blur: (e) => {
                                                    e.currentTarget.style.borderColor = '#e2e8f0'
                                                    e.currentTarget.style.boxShadow = 'none'
                                                    e.currentTarget.style.backgroundColor = '#f8fafc'
                                                }
                                            }
                                        })
                                    ]
                                }),

                                // Buttons
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        gap: '12px',
                                        justifyContent: 'flex-end'
                                    },
                                    child: [
                                        $({
                                            tag: 'button',
                                            text: 'Cancel',
                                            style: {
                                                padding: '8px 20px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                color: '#64748b',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: closeModal,
                                                mouseenter: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#f1f5f9'
                                                },
                                                mouseleave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent'
                                                }
                                            }
                                        }),
                                        $({
                                            tag: 'button',
                                            text: 'Save Changes',
                                            style: {
                                                padding: '8px 20px',
                                                backgroundColor: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#ffffff',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                                transition: 'all 0.2s ease'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    const selectedOption = catSel.childNodes[catSel.selectedIndex]
                                                    if (selectedOption && selectedOption.innerText) {
                                                        const req = new Request('/requestcat')
                                                        req.Post([
                                                            {
                                                                name: 'changeCat',
                                                                value: '1'
                                                            },
                                                            {
                                                                name: 'docId',
                                                                value: id
                                                            },
                                                            {
                                                                name: 'newCategory',
                                                                value: selectedOption.innerText
                                                            }
                                                        ])
                                                        req.Json()
                                                        req.Send().then(data => {
                                                            if (data.status) {
                                                                window.location.reload();
                                                            } else {
                                                                alert(data.message);
                                                            }
                                                        })
                                                    }
                                                },
                                                mouseenter: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#2563eb'
                                                },
                                                mouseleave: (e) => {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6'
                                                }
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }))
            }

            return ($({
                tag: 'div',
                style: {
                    cursor: 'pointer',
                    color: '#3b82f6',
                    fontSize: '12px',
                    fontWeight: '500',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.12)',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                    marginTop: '8px'
                },
                text: 'Edit Category',
                event: {
                    type: 'click',
                    method: () => {
                        document.body.appendChild(EditPan())
                    },
                    mouseenter: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                    },
                    mouseleave: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                    }
                }
            }))
        }

        return ($({
            tag: 'div',
            style: {
                width: '100%',
                margin: '4px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                border: '1px solid #f1f5f9',
                padding: '16px 20px',
                fontSize: '14px',
                position: 'relative',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            },
            elementHandler: (el) => {
                el.addEventListener('mouseenter', () => {
                    el.style.borderColor = '#e2e8f0'
                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'
                })
                el.addEventListener('mouseleave', () => {
                    el.style.borderColor = '#f1f5f9'
                    el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'
                })
            },
            child: [
                details({
                    label: "Campus:",
                    data: campus,
                }),
                details({
                    label: "Author:",
                    data: author,
                }),
                details({
                    label: "Category:",
                    data: category,
                }),
                $({
                    tag: 'div',
                    style: {
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #f1f5f9'
                    }
                }),
                $({
                    tag: 'div',
                    style: {
                        color: '#475569',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        fontWeight: '400'
                    },
                    text: `"${title}"`
                }),
                $({
                    tag: 'div',
                    style: {
                        marginTop: '8px'
                    },
                    child: [
                        EditButton()
                    ]
                })
            ]
        }))
    }

    const Event = () => {
        return ($({
            tag: 'div',
            style: {
                width: 'fit-content',
                height: 'fit-content',
                margin: 'auto 0',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px 0 12px',
                transition: 'all 0.2s ease'
            },
            child: [
                $({
                    tag: 'span',
                    text: 'Filter:',
                    style: {
                        fontSize: '13px',
                        color: '#64748b',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: '500',
                        marginRight: '8px'
                    }
                }),
                $({
                    tag: 'select',
                    style: {
                        backgroundColor: 'transparent',
                        height: '36px',
                        padding: '0 8px',
                        color: '#1e293b',
                        width: '200px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '13px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        cursor: 'pointer'
                    },
                    elementHandler: async (el) => {
                        eventSelection = el
                        el.appendChild($({
                            tag: 'option',
                            text: 'All Events',
                            att: {
                                id: '0',
                                selected: true
                            },
                            style: {
                                backgroundColor: '#ffffff'
                            }
                        }))

                        const req = new Request('/eventRequest')
                        req.Post([
                            { name: 'getEvent', value: '0' }
                        ])
                        req.Json()
                        req.Send().then(data => {
                            data.forEach(val => {
                                el.appendChild($({
                                    tag: 'option',
                                    text: val.name,
                                    att: {
                                        id: val.id
                                    },
                                    style: {
                                        backgroundColor: '#ffffff'
                                    }
                                }))
                            })
                        })
                    },
                }),
                $({
                    tag: 'button',
                    att: {
                        className: 'fa-solid fa-rotate'
                    },
                    style: {
                        marginLeft: '4px',
                        marginRight: '6px',
                        borderRadius: '50%',
                        padding: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.12)',
                        transition: 'all 0.2s ease',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    event: {
                        mouseenter: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.12)'
                            e.currentTarget.style.transform = 'rotate(45deg)'
                        },
                        mouseleave: (e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.06)'
                            e.currentTarget.style.transform = 'rotate(0deg)'
                        },
                        type: 'click',
                        method: () => {
                            docsBody.innerHTML = ''

                            const selectedOption = eventSelection.childNodes[eventSelection.selectedIndex]
                            const eventName = selectedOption ? selectedOption.innerText : 'All Events'

                            const req = new Request('/overridedocs')
                            req.Post([
                                {
                                    name: 'docsAll',
                                    value: '1'
                                },
                                {
                                    name: 'eventName',
                                    value: eventName
                                }
                            ])
                            req.Json()
                            req.Send().then(data => {
                                if (data && data.length > 0) {
                                    data.forEach(val => {
                                        docsBody.appendChild(Docs({
                                            title: val.title,
                                            author: val.author,
                                            id: val.id,
                                            campus: val.campus,
                                            category: val.category
                                        }))
                                    })
                                } else {
                                    docsBody.appendChild($({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100%',
                                            color: '#94a3b8',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                            padding: '40px'
                                        },
                                        child: [
                                            $({
                                                tag: 'span',
                                                att: { className: 'fa-solid fa-file' },
                                                style: {
                                                    fontSize: '48px',
                                                    color: '#e2e8f0',
                                                    marginBottom: '16px'
                                                }
                                            }),
                                            $({
                                                tag: 'div',
                                                text: 'No documents found',
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    color: '#64748b'
                                                }
                                            }),
                                            $({
                                                tag: 'div',
                                                text: 'Try selecting a different event',
                                                style: {
                                                    fontSize: '13px',
                                                    marginTop: '4px',
                                                    color: '#94a3b8'
                                                }
                                            })
                                        ]
                                    }))
                                }
                            })
                        }
                    }
                })
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8fafc'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    backgroundColor: '#ffffff',
                    width: '100%',
                    display: 'flex',
                    height: '64px',
                    padding: '0 20px',
                    borderBottom: '1px solid #e2e8f0',
                    gap: '16px',
                    alignItems: 'center'
                },
                child: [
                    SearchFilter(),
                    Event()
                ]
            }),
            $({
                tag: 'div',
                style: {
                    height: 'calc(100% - 64px)',
                    width: '100%',
                    overflowY: 'auto',
                    backgroundColor: '#f8fafc',
                    position: 'relative',
                    padding: '12px 20px'
                },
                elementHandler: (el) => {
                    docsBody = el

                    // Load initial documents
                    const req = new Request('/overridedocs')
                    req.Post([
                        {
                            name: 'docsAll',
                            value: '1'
                        },
                        {
                            name: 'eventName',
                            value: 'All Events'
                        }
                    ])
                    req.Json()
                    req.Send().then(data => {
                        if (data && data.length > 0) {
                            data.forEach(val => {
                                el.appendChild(Docs({
                                    title: val.title,
                                    author: val.author,
                                    id: val.id,
                                    campus: val.campus,
                                    category: val.category
                                }))
                            })
                        } else {
                            el.appendChild($({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#94a3b8',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    padding: '40px'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-inbox' },
                                        style: {
                                            fontSize: '48px',
                                            color: '#e2e8f0',
                                            marginBottom: '16px'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'No documents available',
                                        style: {
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: '#64748b'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        text: 'Documents will appear here when they are submitted',
                                        style: {
                                            fontSize: '13px',
                                            marginTop: '4px',
                                            color: '#94a3b8'
                                        }
                                    })
                                ]
                            }))
                        }
                    })
                }
            })
        ]
    }))
}
import { $, Request, MONTHS, Waiting } from '../../../lib/lib.js'
import { Error } from "../../../error.js";
import { Main } from "../../otherComponent/ReviewTemplate.js";

export const Recommendation = () => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 60) {
                return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
            } else if (diffHours < 24) {
                return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            } else if (diffDays < 7) {
                return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (e) {
            return 'Invalid date';
        }
    }

    const Response = ({ user, date, message, id }) => {
        let mesState = false, spanCon, fullMessage = message;

        const Reply = () => {
            return ($({
                tag: 'div',
                style: {
                    padding: '0.3vw 1vw',
                    borderRadius: '2vw',
                    backgroundColor: '#f0f7ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4vw',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-reply'
                        },
                        style: {
                            color: '#3b82f6',
                            fontSize: '0.7vw'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Reply',
                        style: {
                            color: '#3b82f6',
                            fontSize: '0.7vw',
                            fontFamily: 'Segoe UI, sans-serif',
                            fontWeight: '500'
                        }
                    })
                ],
                event: {
                    mouseover: (e) => {
                        e.currentTarget.style.backgroundColor = '#dbeafe'
                        e.currentTarget.style.borderColor = '#93c5fd'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.backgroundColor = '#f0f7ff'
                        e.currentTarget.style.borderColor = '#dbeafe'
                    },
                    click: () => {
                        console.log('Reply to:', id)
                    }
                }
            }))
        }

        const messageContent = [
            $({
                tag: 'span',
                text: message && message.length > 150 ? message.substring(0, 150) : (message || ''),
            }),
            $({
                tag: 'span',
                elementHandler: (el) => {
                    spanCon = el
                }
            })
        ];

        if (message && message.length > 150) {
            messageContent.push($({
                tag: 'span',
                text: mesState ? ' See less' : ' ...Read more',
                style: {
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#3b82f6',
                    fontWeight: '600',
                    marginLeft: '0.3vw',
                    fontSize: '0.75vw'
                },
                event: {
                    type: 'click',
                    method: (el) => {
                        mesState = !mesState
                        if (mesState) {
                            if (spanCon) spanCon.innerText = message.substring(150)
                            el.target.innerText = ' See less'
                        } else {
                            el.target.innerText = ' ...Read more'
                            if (spanCon) spanCon.innerText = ''
                        }
                    }
                }
            }));
        }

        const element = $({
            tag: 'div',
            style: {
                width: '100%',
                marginBottom: '1.5vh',
                animation: 'fadeIn 0.4s ease',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1.5vh'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8vw',
                        marginBottom: '0.5vh',
                        paddingLeft: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '2vw',
                                height: '2vw',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '0.9vw',
                                fontWeight: 'bold'
                            },
                            text: user && user.charAt ? user.charAt(0).toUpperCase() : '?'
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.1vh'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: user || 'Anonymous',
                                    style: {
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '0.85vw',
                                        color: '#1e293b',
                                        fontWeight: '600'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: formatDate(date),
                                    style: {
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '0.65vw',
                                        color: '#94a3b8'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        borderRadius: '0.6vw',
                        background: '#f8fafc',
                        padding: '1rem',
                        marginLeft: '3vw',
                        position: 'relative',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '-0.4vw',
                                left: '-0.4vw',
                                width: '0.6vw',
                                height: '0.6vw',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                borderRadius: '0.15vw',
                                transform: 'rotate(45deg)',
                                border: '1px solid #e2e8f0',
                                borderRight: 'none',
                                borderBottom: 'none'
                            }
                        }),
                        $({
                            tag: "div",
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                fontFamily: 'Segoe UI, sans-serif',
                                color: '#334155',
                                fontSize: '0.8vw',
                                userSelect: 'text',
                                lineHeight: '1.6'
                            },
                            child: messageContent
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '0.5vh',
                        marginRight: '0.5vw',
                        gap: '0.6vw'
                    },
                    child: [
                        Reply()
                    ]
                })
            ]
        })

        return element
    }

    const Header = () => {
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                padding: '1.5vh 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '1.5vh'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8vw'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-comments'
                            },
                            style: {
                                fontSize: '1.2vw',
                                color: '#3b82f6'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Recommendations',
                            style: {
                                fontSize: '1.1vw',
                                fontFamily: 'arial black, san-serif',
                                color: '#1e293b',
                                letterSpacing: '0.08vw',
                                textTransform: 'uppercase'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        padding: '0.3vh 1vw',
                        borderRadius: '2vw',
                        background: '#f0f7ff',
                        border: '1px solid #dbeafe',
                        color: '#3b82f6',
                        fontSize: '0.7vw',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    },
                    text: 'Latest first',
                    event: {
                        mouseover: (e) => {
                            e.currentTarget.style.background = '#dbeafe'
                        },
                        mouseout: (e) => {
                            e.currentTarget.style.background = '#f0f7ff'
                        },
                        type: 'click',
                        method: () => {
                            const req = new Request('/dbderect')
                            req.Post([
                                {
                                    name: 'umdUpdate',
                                    value: '1'
                                }
                            ])
                            req.Send().then(data => {
                                console.log(data)
                            })
                        }
                    }
                })
            ]
        }))
    }

    const StatsCard = ({ icon, label, value, color }) => {
        return ($({
            tag: 'div',
            style: {
                background: '#ffffff',
                borderRadius: '0.6vw',
                padding: '0.8rem 1.2rem',
                border: '1px solid #e2e8f0',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8vw',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease'
            },
            event: {
                mouseover: (e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                },
                mouseout: (e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
                    e.currentTarget.style.transform = 'translateY(0)'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '2.2vw',
                        height: '2.2vw',
                        borderRadius: '0.6vw',
                        background: `rgba(${color},0.08)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: `fa-solid fa-${icon}`
                            },
                            style: {
                                fontSize: '1vw',
                                color: `rgb(${color})`
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.1vh'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: label,
                            style: {
                                fontSize: '0.6vw',
                                color: '#94a3b8',
                                fontFamily: 'Segoe UI, sans-serif',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: {
                                className: 'stats-value'
                            },
                            text: value,
                            style: {
                                fontSize: '1.3vw',
                                color: '#1e293b',
                                fontFamily: 'arial black, san-serif',
                                fontWeight: 'bold'
                            }
                        })
                    ]
                })
            ]
        }))
    }

    const StatsBar = () => {
        return ($({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '0.8vw',
                marginBottom: '1.5vh',
                padding: '0 0.5vw'
            },
            child: [
                StatsCard({ icon: 'message', label: 'Total Recommendations', value: '0', color: '59,130,246' }),
                StatsCard({ icon: 'users', label: 'Unique Users', value: '0', color: '16,185,129' }),
                StatsCard({ icon: 'calendar-week', label: 'This Week', value: '0', color: '245,158,11' })
            ]
        }))
    }

    const SearchBar = () => {
        return ($({
            tag: 'div',
            style: {
                height: '3.5vh',
                border: '1px solid #e2e8f0',
                width: '18vw',
                borderRadius: '2vw',
                display: 'flex',
                padding: '0 0.8vw',
                backgroundColor: '#f8fafc',
                color: '#334155',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                marginLeft: 'auto',
                marginRight: '0.5vw'
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
                        fontSize: '0.7vw',
                        color: '#94a3b8',
                        marginRight: '0.4vw'
                    }
                }),
                $({
                    tag: 'input',
                    att: {
                        type: 'text',
                        placeholder: 'Search recommendations...'
                    },
                    style: {
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        height: '100%',
                        width: '100%',
                        color: '#1e293b',
                        fontSize: '0.7vw',
                        fontFamily: 'Segoe UI, sans-serif'
                    },
                    event: {
                        type: 'input',
                        method: (ev) => {
                            const container = document.getElementById('recommendations-container')
                            if (container) {
                                const items = container.children
                                for (let item of items) {
                                    if (!item.innerText.toUpperCase().includes(ev.target.value.toUpperCase())) {
                                        item.style.display = 'none'
                                    } else {
                                        item.style.display = 'block'
                                    }
                                }
                            }
                        }
                    }
                })
            ]
        }))
    }

    const EmptyState = () => {
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                padding: '3rem 2rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '0.8vw',
                border: '2px dashed #e2e8f0'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-comment-slash'
                    },
                    style: {
                        fontSize: '2.5vw',
                        color: '#cbd5e1',
                        marginBottom: '1.5vh'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No recommendations yet',
                    style: {
                        fontSize: '0.9vw',
                        color: '#475569',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontWeight: '600',
                        marginBottom: '0.5vh'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'When users submit recommendations, they will appear here',
                    style: {
                        fontSize: '0.75vw',
                        color: '#94a3b8',
                        fontFamily: 'Segoe UI, sans-serif'
                    }
                })
            ]
        }))
    }

    const SimpleError = ({ message }) => {
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                padding: '1.5rem',
                textAlign: 'center',
                background: '#fef2f2',
                borderRadius: '0.8vw',
                border: '1px solid #fca5a5',
                color: '#dc2626'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-exclamation-triangle'
                    },
                    style: {
                        fontSize: '1.5vw',
                        marginBottom: '0.5vh',
                        color: '#dc2626'
                    }
                }),
                $({
                    tag: 'div',
                    text: message || 'An error occurred',
                    style: {
                        fontSize: '0.8vw',
                        fontFamily: 'Segoe UI, sans-serif',
                        fontWeight: '500'
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
            backgroundColor: '#ffffff',
            overflow: 'hidden'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '90%',
                    margin: '0 auto',
                    padding: '1.5vh 0',
                    height: '100%'
                },
                child: [
                    Header(),
                    StatsBar(),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '1.5vh'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: 'All Recommendations',
                                style: {
                                    fontSize: '0.85vw',
                                    color: '#1e293b',
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontWeight: '600'
                                }
                            }),
                            SearchBar()
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: 'calc(100% - 20vh)',
                            overflowY: 'auto',
                            padding: '0 0.5vw'
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    id: 'recommendations-container'
                                },
                                style: {
                                    width: '100%'
                                },
                                elementHandler: (el) => {
                                    while (el.firstChild) {
                                        el.removeChild(el.firstChild);
                                    }

                                    const req = new Request('/recommendation')
                                    req.Post([
                                        { name: 'recommendationRequest', value: '0' }
                                    ])
                                    req.Json()
                                    req.Send().then(data => {
                                        if (data && data.length > 0) {
                                            data.sort((a, b) => new Date(b.date) - new Date(a.date))

                                            data.forEach(val => {
                                                try {
                                                    const responseElement = Response({
                                                        user: val.username || 'Anonymous',
                                                        date: val.date,
                                                        message: val.recom || '',
                                                        id: val.id
                                                    })
                                                    el.appendChild(responseElement)
                                                } catch (err) {
                                                    console.error('Error creating response element:', err)
                                                }
                                            })

                                            setTimeout(() => {
                                                try {
                                                    const statsValues = document.querySelectorAll('.stats-value')
                                                    if (statsValues.length >= 3) {
                                                        statsValues[0].textContent = data.length

                                                        const oneWeekAgo = new Date()
                                                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                                                        const thisWeek = data.filter(item => {
                                                            try {
                                                                return new Date(item.date) > oneWeekAgo
                                                            } catch {
                                                                return false
                                                            }
                                                        }).length

                                                        const uniqueUsers = new Set(data.map(item => item.username).filter(Boolean)).size

                                                        statsValues[1].textContent = uniqueUsers
                                                        statsValues[2].textContent = thisWeek
                                                    }
                                                } catch (err) {
                                                    console.error('Error updating stats:', err)
                                                }
                                            }, 100)
                                        } else {
                                            try {
                                                const emptyElement = EmptyState()
                                                el.appendChild(emptyElement)
                                            } catch (err) {
                                                console.error('Error creating empty state:', err)
                                            }
                                        }
                                    }).catch(error => {
                                        console.error('Error loading recommendations:', error)
                                        try {
                                            const errorElement = SimpleError({ message: 'Failed to load recommendations' })
                                            el.appendChild(errorElement)
                                        } catch (err) {
                                            console.error('Error creating error element:', err)
                                        }
                                    })
                                }
                            })
                        ]
                    })
                ]
            })
        ],
        externalStyle: '/client/component/adminComponent/componentStyle/recomendation.css'
    }))
}
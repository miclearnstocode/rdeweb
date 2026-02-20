import {$, Request, MONTHS, Waiting} from '../../../lib/lib.js'
import {Error} from "../../../error.js";
import {Main} from "../../otherComponent/ReviewTemplate.js";

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
                    padding: '0.5vw 1.2vw',
                    borderRadius: '2vw',
                    backgroundColor: 'rgba(0,188,212,0.1)',
                    border: '1px solid rgba(0,188,212,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5vw',
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
                            color: '#00bcd4',
                            fontSize: '0.9vw'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Reply',
                        style: {
                            color: '#00bcd4',
                            fontSize: '0.85vw',
                            fontFamily: 'Segoe UI, sans-serif'
                        }
                    })
                ],
                event: {
                    mouseover: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.2)'
                    },
                    mouseout: (e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,188,212,0.1)'
                    },
                    click: () => {
                        // Handle reply functionality
                        console.log('Reply to:', id)
                    }
                }
            }))
        }

        // Create message content array without null values
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

        // Only add "Read more" span if message is long enough
        if (message && message.length > 150) {
            messageContent.push($({
                tag: 'span',
                text: mesState ? ' See less' : ' ...Read more',
                style: {
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#00bcd4',
                    fontWeight: '500',
                    marginLeft: '0.3vw'
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

        // Create the element
        const element = $({
            tag: 'div',
            style: {
                width: '100%',
                marginBottom: '2vh',
                animation: 'fadeIn 0.5s ease',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '2vh'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1vw',
                        marginBottom: '0.8vh',
                        paddingLeft: '0.5vw'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '2.5vw',
                                height: '2.5vw',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '1.2vw',
                                fontWeight: 'bold'
                            },
                            text: user && user.charAt ? user.charAt(0).toUpperCase() : '?'
                        }),
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2vh'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    text: user || 'Anonymous',
                                    style: {
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '1.1vw',
                                        color: '#e0e0e0',
                                        fontWeight: '500'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    text: formatDate(date),
                                    style: {
                                        fontFamily: 'Segoe UI, sans-serif',
                                        fontSize: '0.8vw',
                                        color: '#888'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        borderRadius: '0.8vw',
                        background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                        padding: '1.5rem',
                        marginLeft: '3.5vw',
                        position: 'relative',
                        border: '1px solid #333',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                top: '-0.5vw',
                                left: '-0.5vw',
                                width: '1vw',
                                height: '1vw',
                                background: 'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',
                                borderRadius: '0.2vw',
                                transform: 'rotate(45deg)',
                                border: '1px solid #333'
                            }
                        }),
                        $({
                            tag: "div",
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                fontFamily: 'Segoe UI, sans-serif',
                                color: '#bbb',
                                fontSize: '1vw',
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
                        marginTop: '1vh',
                        marginRight: '1vw',
                        gap: '0.8vw'
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
                padding: '2vh 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '2vh'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1vw'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa-solid fa-comments'
                            },
                            style: {
                                fontSize: '1.8vw',
                                color: '#00bcd4'
                            }
                        }),
                        $({
                            tag: 'span',
                            text: 'Recommendations',
                            style: {
                                fontSize: '1.5vw',
                                fontFamily: 'arial black, san-serif',
                                color: 'rgba(200,200,200,0.5)',
                                letterSpacing: '0.1vw',
                                textTransform: 'uppercase'
                            }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        padding: '0.5vh 1vw',
                        borderRadius: '2vw',
                        background: 'rgba(0,188,212,0.1)',
                        border: '1px solid rgba(0,188,212,0.2)',
                        color: '#00bcd4',
                        fontSize: '0.9vw',
                        fontFamily: 'Segoe UI, sans-serif'
                    },
                    text: 'Latest first',
                    event: {
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
                background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderRadius: '0.8vw',
                padding: '1.5rem',
                border: '1px solid #333',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '1vw'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '3vw',
                        height: '3vw',
                        borderRadius: '0.8vw',
                        background: `rgba(${color},0.1)`,
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
                                fontSize: '1.5vw',
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
                        gap: '0.3vh'
                    },
                    child: [
                        $({
                            tag: 'span',
                            text: label,
                            style: {
                                fontSize: '0.9vw',
                                color: '#888',
                                fontFamily: 'Segoe UI, sans-serif'
                            }
                        }),
                        $({
                            tag: 'span',
                            att: {
                                className: 'stats-value'
                            },
                            text: value,
                            style: {
                                fontSize: '1.8vw',
                                color: '#e0e0e0',
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
                gap: '1vw',
                marginBottom: '2vh',
                padding: '0 0.5vw'
            },
            child: [
                StatsCard({ icon: 'message', label: 'Total Recommendations', value: '0', color: '0,188,212' })
            ]
        }))
    }

    const SearchBar = () => {
        return ($({
            tag: 'div',
            style: {
                height: '5vh',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '20vw',
                borderRadius: '2vw',
                display: 'flex',
                padding: '0 1vw',
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#bbb',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                marginLeft: 'auto',
                marginRight: '0.5vw'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-search'
                    },
                    style: {
                        fontSize: '1vw',
                        color: '#666',
                        marginRight: '0.5vw'
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
                        color: '#e0e0e0',
                        fontSize: '0.95vw',
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
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderRadius: '1vw',
                border: '1px solid #333'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-comment-slash'
                    },
                    style: {
                        fontSize: '3vw',
                        color: '#333',
                        marginBottom: '2vh'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'No recommendations yet',
                    style: {
                        fontSize: '1.2vw',
                        color: '#888',
                        fontFamily: 'Segoe UI, sans-serif',
                        marginBottom: '1vh'
                    }
                }),
                $({
                    tag: 'div',
                    text: 'When users submit recommendations, they will appear here',
                    style: {
                        fontSize: '0.9vw',
                        color: '#666',
                        fontFamily: 'Segoe UI, sans-serif'
                    }
                })
            ]
        }))
    }

    // Simple error component
    const SimpleError = ({ message }) => {
        return ($({
            tag: 'div',
            style: {
                width: '100%',
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                borderRadius: '1vw',
                border: '1px solid #f44336',
                color: '#f44336'
            },
            child: [
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-exclamation-triangle'
                    },
                    style: {
                        fontSize: '2vw',
                        marginBottom: '1vh',
                        color: '#f44336'
                    }
                }),
                $({
                    tag: 'div',
                    text: message || 'An error occurred',
                    style: {
                        fontSize: '1vw',
                        fontFamily: 'Segoe UI, sans-serif'
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
            backgroundColor: '#1a1a1a',
            overflowY: 'auto'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '90%',
                    margin: '0 auto',
                    padding: '2vh 0',
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
                            marginBottom: '2vh'
                        },
                        child: [
                            $({
                                tag: 'div',
                                text: 'All Recommendations',
                                style: {
                                    fontSize: '1.1vw',
                                    color: '#e0e0e0',
                                    fontFamily: 'Segoe UI, sans-serif',
                                    fontWeight: '500'
                                }
                            }),
                            SearchBar()
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '100%',
                            height: 'calc(100% - 25vh)',
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
                                    // Clear any existing content
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
                                            // Sort by date (newest first)
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
                                            
                                            // Update stats after all elements are added
                                            setTimeout(() => {
                                                try {
                                                    const statsValues = document.querySelectorAll('.stats-value')
                                                    if (statsValues.length >= 3) {
                                                        statsValues[0].textContent = data.length
                                                        
                                                        // Count this week
                                                        const oneWeekAgo = new Date()
                                                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                                                        const thisWeek = data.filter(item => {
                                                            try {
                                                                return new Date(item.date) > oneWeekAgo
                                                            } catch {
                                                                return false
                                                            }
                                                        }).length
                                                        
                                                        // Count unique users
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
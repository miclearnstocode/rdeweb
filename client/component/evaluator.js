import { $, Request } from '../lib/lib.js';
import { Header } from "./otherComponent/header.js";
import { Box, Search } from "./evaluatorComponent/script/listBox.js";

export const Evaluator = () => {
    document.getElementById('root').appendChild(Header())

    // Store user data for reuse
    let userData = null;
    let eventNames = [];

    const fetchEventNames = async (eventIds) => {
        if (!eventIds || eventIds.length === 0) return 'No events assigned';
        
        try {
            // Fetch all events
            const req = new Request('/eventRequest');
            req.Post([{ name: 'getEventList'}]);
            req.Json();
            const events = await req.Send();
            
            // Map event IDs to names
            const eventNamesList = events
                .filter(event => eventIds.includes(parseInt(event.id)))
                .map(event => event.name);
            
            if (eventNamesList.length === 0) return 'No events found';
            if (eventNamesList.length === 1) return eventNamesList[0];
            
            // For multiple events, join with commas and "and"
            const lastEvent = eventNamesList.pop();
            return eventNamesList.join(', ') + ' and ' + lastEvent;
            
        } catch (err) {
            console.error('Error fetching event names:', err);
            return 'Error loading events';
        }
    };

    const Label = $({
        tag: 'div',
        style: {
            padding: '20px 28px',
            background: '#ffffff',
            borderBottom: '1px solid #f0f2f5',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexShrink: 0,
        },
        child: [
            // Left side - Title
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-file-lines'
                                },
                                style: {
                                    fontSize: '20px',
                                    color: '#3b82f6'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: 'Submitted Entries',
                                style: {
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    letterSpacing: '-0.3px',
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Research papers assigned for evaluation',
                                style: {
                                    fontSize: '13px',
                                    color: '#94a3b8',
                                    fontWeight: '400',
                                }
                            })
                        ]
                    })
                ]
            }),
            // Right side - Info badges
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                },
                child: [
                    // Category/Center Badge
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f8fafc',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e8ecf1',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-tag'
                                },
                                style: {
                                    fontSize: '13px',
                                    color: '#8b5cf6'
                                }
                            }),
                            $({
                                tag: 'span',
                                style: {
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#0f172a'
                                },
                                elementHandler: async (ev) => {
                                    try {
                                        const req = new Request('/evaluatorReg')
                                        req.Post([{ name: 'evalLeb', value: '1' }])
                                        req.Json()
                                        const data = await req.Send()
                                        userData = data;

                                        if (data.userType === 'category' && data.categories && data.categories.length > 0) {
                                            const categoryNames = data.categories.map(cat => cat.name).join(', ');
                                            ev.textContent = categoryNames;
                                            ev.style.color = '#0f172a';
                                        } else if (data.userType === 'center' && data.displayCenter) {
                                            ev.textContent = data.displayCenter;
                                            ev.style.color = '#0f172a';
                                        } else {
                                            ev.textContent = 'No Access';
                                            ev.style.color = '#ef4444';
                                        }
                                    } catch (err) {
                                        console.error('Error loading user info:', err)
                                        ev.textContent = 'Error loading'
                                        ev.style.color = '#ef4444';
                                    }
                                }
                            })
                        ]
                    }),
                    // Event Badge
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            background: '#f8fafc',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e8ecf1',
                            maxWidth: '500px',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-calendar-days'
                                },
                                style: {
                                    fontSize: '13px',
                                    color: '#3b82f6',
                                    marginTop: '2px',
                                    flexShrink: 0,
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    flex: '1',
                                    minWidth: '0',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        text: 'Event',
                                        style: { 
                                            color: '#94a3b8',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        style: {
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#0f172a',
                                            lineHeight: '1.4',
                                            wordBreak: 'break-word',
                                        },
                                        elementHandler: async (ev) => {
                                            try {
                                                const req = new Request('/evaluatorReg')
                                                req.Post([{ name: 'evalLeb', value: '1' }])
                                                req.Json()
                                                const data = await req.Send()
                                                
                                                const eventIds = data.eventIds || [];
                                                
                                                if (eventIds.length === 0) {
                                                    ev.textContent = 'No events assigned';
                                                    return;
                                                }
                                                
                                                const eventNamesStr = await fetchEventNames(eventIds);
                                                ev.textContent = eventNamesStr;
                                                ev.title = eventNamesStr;
                                                
                                            } catch (err) {
                                                console.error('Error loading event info:', err)
                                                ev.textContent = 'Error loading events'
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }),
        ]
    })

    let boxBody
    const getBox = (el) => {
        boxBody = el
    }

    const searchMethod = (ev) => {
        const searchTerm = ev.target.value.trim().toUpperCase()

        if (!boxBody) return

        const children = boxBody.childNodes

        children.forEach(val => {
            if (val.nodeType !== 1) return

            const textContent = val.textContent?.toUpperCase() || ''

            if (searchTerm === '' || textContent.includes(searchTerm)) {
                val.style.display = ''
                val.style.visibility = ''
                val.style.opacity = ''
            } else {
                val.style.display = 'none'
            }
        })
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/component/evaluatorComponent/style/evaluator.css',
        att: {
            className: 'evalPanel'
        },
        child: [
            Label,
            Search(searchMethod),
            Box(getBox)
        ]
    }))
}
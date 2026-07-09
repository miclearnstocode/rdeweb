import { $, Request } from '../lib/lib.js';
import { Header } from "./otherComponent/header.js";
import { Box, Search } from "./evaluatorComponent/script/listBox.js";

export const Evaluator = () => {
    document.getElementById('root').appendChild(Header())

    const Label = $({
        tag: 'div',
        style: {
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e8ecf1',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
        },
        child: [
            $({
                tag: 'div',
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: 'clamp(18px, 1.5vw, 24px)',
                    fontWeight: '700',
                    color: '#0f172a',
                    letterSpacing: '-0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-file-lines'
                        },
                        style: {
                            fontSize: 'clamp(20px, 1.8vw, 28px)',
                            color: '#3b82f6'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Submitted Entries',
                    })
                ]
            }),
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f1f5f9',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            color: '#475569',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-building-columns'
                                },
                                style: {
                                    fontSize: '14px',
                                    color: '#3b82f6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Center:',
                                style: { color: '#64748b' }
                            }),
                            $({
                                tag: 'span',
                                style: {
                                    fontWeight: '600',
                                    color: '#0f172a'
                                },
                                elementHandler: (ev) => {
                                    (async function () {
                                        try {
                                            const req = new Request('/evaluatorReg')
                                            req.Post([{ name: 'evalLeb', value: '1' }])
                                            req.Json()
                                            const data = await req.Send()
                                            ev.textContent = data.center || 'Not assigned'
                                        } catch (err) {
                                            console.error('Error loading center info:', err)
                                            ev.textContent = 'Error loading'
                                        }
                                    })()
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f1f5f9',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            color: '#475569',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-calendar-days'
                                },
                                style: {
                                    fontSize: '14px',
                                    color: '#8b5cf6'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'Event:',
                                style: { color: '#64748b' }
                            }),
                            $({
                                tag: 'span',
                                style: {
                                    fontWeight: '600',
                                    color: '#0f172a'
                                },
                                elementHandler: (ev) => {
                                    (async function () {
                                        try {
                                            const req = new Request('/evaluatorReg')
                                            req.Post([{ name: 'evalLeb', value: '1' }])
                                            req.Json()
                                            const data = await req.Send()
                                            ev.textContent = data.event || 'Not assigned'
                                        } catch (err) {
                                            console.error('Error loading event info:', err)
                                            ev.textContent = 'Error loading'
                                        }
                                    })()
                                }
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
import { $, ConfirmationAlert, Request, Waiting } from '../../../lib/lib.js'
import { EntryList } from "./EntryList.js";

export const Search = (method) => {
    // Load user data to display dynamic categories
    const loadUserInfo = async () => {
        try {
            const evalReq = new FormData()
            evalReq.append('evalLeb', '1')
            const evalRes = await fetch('/evaluatorReg', { method: 'POST', body: evalReq })
            const evalData = await evalRes.json()

            const centerLabel = document.getElementById('centerLabel')
            if (centerLabel) {
                if (evalData.userType === 'category' && evalData.categoryNames) {
                    centerLabel.textContent = 'Categories: ' + evalData.categoryNames.join(', ')
                } else if (evalData.userType === 'center' && evalData.displayCenter) {
                    centerLabel.textContent = 'Center: ' + evalData.displayCenter
                } else {
                    centerLabel.textContent = 'No Access'
                }
            }

            const eventLabel = document.getElementById('eventLabel')
            if (eventLabel && evalData.event) {
                eventLabel.textContent = 'Event: ' + evalData.event
            }
        } catch (err) {
            console.error('Error loading user info:', err)
        }
    }
    setTimeout(loadUserInfo, 100)

    return ($({
        tag: 'div',
        att: { className: 'searchBarEval' },
        child: [
            $({
                tag: 'div',
                att: { className: 'searchBox' },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-magnifying-glass searchIcEval'
                        },
                        style: {
                            color: '#94a3b8',
                            fontSize: '14px',
                            marginRight: '10px',
                        }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'search',
                            placeholder: 'Search research papers...',
                            className: 'searchInputEval',
                            id: 'search-input-evaluation',
                            name: 'searchInputEvaluation'
                        },
                        style: { height: 'auto' },
                        event: {
                            type: 'input',
                            method: method
                        }
                    })
                ]
            }),
            $({
                tag: 'div',
                att: { className: 'entriesCounter' },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa-solid fa-chart-simple'
                        },
                        style: {
                            fontSize: '14px',
                            color: '#3b82f6'
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Total Entries:'
                    }),
                    $({
                        tag: 'span',
                        att: { className: 'countNumber' },
                        elementHandler: async (el) => {
                            try {
                                const req = new Request('/eventRequest')
                                req.Post([{ name: 'collectEntries', value: '1' }])
                                const data = await req.Send()
                                el.textContent = data || '0'
                            } catch (err) {
                                console.error('Error loading entry count:', err)
                                el.textContent = '0'
                            }
                        }
                    })
                ]
            })
        ]
    }))
}

export const Box = (getBody) => {
    let panelBox

    const getListPanel = async (panel) => {
        getBody(panel)
        panelBox = panel

        try {
            const evalReq = new FormData()
            evalReq.append('evalLeb', '1')
            const evalRes = await fetch('/evaluatorReg', { method: 'POST', body: evalReq })
            const evalData = await evalRes.json()
            const centerLabel = document.getElementById('centerLabel')
            if (centerLabel) {
                if (evalData.userType === 'category' && evalData.categoryNames) {
                    centerLabel.textContent = 'Categories: ' + evalData.categoryNames.join(', ')
                } else if (evalData.userType === 'center' && evalData.displayCenter) {
                    centerLabel.textContent = 'Center: ' + evalData.displayCenter
                } else {
                    centerLabel.textContent = 'No Access'
                }
            }
            const form = new FormData()
            form.append('researchSubmit', 'true')

            if (evalData.userType === 'center') {
                form.append('center', evalData.centerId || '')
                form.append('filterType', 'center')
            } else if (evalData.userType === 'category') {
                form.append('categoryIds', JSON.stringify(evalData.categoryIds || []))
                form.append('filterType', 'category')
            } else {
                // No access - show nothing
                panel.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#ef4444;">
                        <div style="font-size:48px;margin-bottom:16px;">🚫</div>
                        <h3 style="color:#475569;margin-bottom:8px;">No Access Rights</h3>
                        <p style="color:#94a3b8;font-size:14px;">You don't have permission to view any documents.</p>
                    </div>
                `
                return
            }

            form.append('event', evalData.eventId || '')

            const res = await fetch('/uploadResearchFile', { method: 'POST', body: form })
            const data = await res.json()

            if (data.list && data.list.length) {
                data.list.forEach((val) => {
                    let coAuthors = val.coauthor || val.coAuthors || null
                    if (typeof coAuthors === 'string' && coAuthors.startsWith('[') && coAuthors.endsWith(']')) {
                        try {
                            const parsed = JSON.parse(coAuthors)
                            if (Array.isArray(parsed)) {
                                coAuthors = parsed.join(', ')
                            }
                        } catch (e) {
                            // If parsing fails, keep as is
                        }
                    }
                    if (Array.isArray(coAuthors)) {
                        coAuthors = coAuthors.join(', ')
                    }

                    panel.appendChild(EntryList({
                        title: val.title,
                        author: val.author,
                        coAuthors: coAuthors,
                        presenter: val.presenter,
                        center: val.center,
                        docId: val.id,
                        eventId: val.eventId || val.event_id,
                        centerId: val.centerId,
                        categoryId: val.category_id,
                        categoryName: val.category_name,
                        hasScore: val.hasScore || false,
                        hasComment: val.hasComment || false,
                        status: val.status || false,
                        userType: evalData.userType
                    }))
                })
            } else {
                panel.innerHTML = `
                    <div style="text-align:center;padding:48px 24px;color:#94a3b8;">
                        <div style="font-size:48px;margin-bottom:16px;">📭</div>
                        <h3 style="color:#475569;margin-bottom:8px;">No entries found</h3>
                        <p style="color:#94a3b8;font-size:14px;">There are no research papers submitted for this event yet.</p>
                    </div>
                `
            }
        } catch (err) {
            console.error('Error loading research list:', err)
            panel.innerHTML = `
                <div style="text-align:center;padding:48px 24px;color:#ef4444;">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <h3 style="margin-bottom:8px;">Error loading entries</h3>
                    <p style="font-size:14px;color:#94a3b8;">Please refresh the page to try again.</p>
                </div>
            `
        }
    }

    return ($({
        tag: 'div',
        att: { className: 'listBox' },
        elementHandler: getListPanel
    }))
}
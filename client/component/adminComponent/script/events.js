import { $, ConfirmationAlert, MONTHS, Request, Waiting } from '../../../lib/lib.js'
import { AddScoreSheet } from "./scoreSheet/scoreSheet.js";

export const Events = () => {
    let mainFrame
    let modalElement = null
    let loadingElement = null
    let eventsData = []

    // Show loading
    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting()
            document.body.appendChild(loadingElement)
        }
    }

    // Hide loading
    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove()
            loadingElement = null
        }
    }

    // Close modal
    const closeModal = () => {
        if (modalElement) {
            modalElement.remove()
            modalElement = null
        }
    }

    // Show notification
    const showNotification = (message, type = 'success') => {
        const notification = $({
            tag: 'div',
            text: message,
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: type === 'error' ? '#ef4444' : '#22c55e',
                color: '#fff',
                fontSize: '14px',
                zIndex: '5000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                animation: 'slideIn 0.3s ease'
            }
        })

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transition = 'opacity 0.3s'
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString || dateString === '—' || dateString === '0000-00-00 00:00:00') return '—'
        try {
            const date = new Date(dateString.replace(' ', 'T'))
            if (isNaN(date.getTime())) return dateString
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    // Format date for datetime-local input
    const formatDateForInput = (dateString) => {
        if (!dateString || dateString === '—' || dateString === '0000-00-00 00:00:00') return ''
        try {
            const date = new Date(dateString.replace(' ', 'T'))
            if (isNaN(date.getTime())) return ''
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch (e) {
            return ''
        }
    }

    // Add Event Box Component
    const eventBox = () => {
        const data = {
            eventName: ''
        }

        return $({
            tag: 'div',
            style: {
                width: '100%',
                padding: '24px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        marginBottom: '24px'
                    },
                    child: [
                        $({
                            tag: 'h2',
                            text: 'Add New Event',
                            style: {
                                color: '#1e293b',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '0 0 4px 0',
                                letterSpacing: '-0.3px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: 'Create a new event for research presentations and symposiums',
                            style: {
                                color: '#94a3b8',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '13px',
                                margin: '0'
                            }
                        })
                    ]
                }),

                // Event Name Input
                $({
                    tag: 'div',
                    style: { marginBottom: '20px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Event Name',
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
                            tag: 'input',
                            att: {
                                type: 'text',
                                placeholder: 'Enter event name...',
                                className: 'event-name-input'
                            },
                            style: {
                                width: '100%',
                                padding: '10px 14px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#1e293b',
                                fontSize: '14px',
                                outline: 'none',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                transition: 'all 0.2s ease',
                                boxSizing: 'border-box'
                            },
                            event: {
                                type: 'input',
                                method: (event) => {
                                    data.eventName = event.target.value
                                }
                            },
                            elementHandler: (el) => {
                                el.addEventListener('focus', () => {
                                    el.style.borderColor = '#3b82f6'
                                    el.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                    el.style.backgroundColor = '#ffffff'
                                })
                                el.addEventListener('blur', () => {
                                    el.style.borderColor = '#e2e8f0'
                                    el.style.boxShadow = 'none'
                                    el.style.backgroundColor = '#f8fafc'
                                })
                            }
                        })
                    ]
                }),

                // Save Button
                $({
                    tag: 'button',
                    text: 'Save Event',
                    style: {
                        width: '100%',
                        padding: '10px 24px',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.3px'
                    },
                    event: {
                        type: 'click',
                        method: async () => {
                            if (data.eventName.trim() !== '') {
                                showLoading()
                                const req = new Request('/register')
                                req.Post([
                                    { name: 'eventReg', value: 'true' },
                                    { name: 'eventName', value: data.eventName }
                                ])
                                req.Json()
                                req.Send().then(responseData => {
                                    hideLoading()
                                    if (responseData.status) {
                                        showNotification('Event saved successfully!', 'success')
                                        setTimeout(() => window.location.reload(), 1500)
                                    } else {
                                        showNotification(responseData.message || 'Error saving event', 'error')
                                    }
                                }).catch(() => {
                                    hideLoading()
                                    showNotification('Error connecting to server', 'error')
                                })
                            } else {
                                showNotification('Please enter an event name', 'error')
                            }
                        }
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#2563eb'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#3b82f6'
                        })
                    }
                })
            ]
        })
    }

    // Date Holder Modal for Update Deadline ONLY
    const dateHolderDeadline = ({ eventID, eventName, currentDeadline }) => {
        let timeIn = ''

        return $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '500px',
                maxWidth: '95%',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                position: 'relative'
            },
            child: [
                // Close button
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-times' },
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
                    style: { marginBottom: '24px' },
                    child: [
                        $({
                            tag: 'h2',
                            text: 'Update Submission Deadline',
                            style: {
                                color: '#1e293b',
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '0 0 4px 0',
                                letterSpacing: '-0.3px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: eventName || 'Event',
                            style: {
                                color: '#3b82f6',
                                fontSize: '14px',
                                margin: '0',
                                fontWeight: '500'
                            }
                        })
                    ]
                }),

                // Submission Deadline
                $({
                    tag: 'div',
                    style: { marginBottom: '24px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Submission Deadline',
                            style: {
                                display: 'block',
                                marginBottom: '6px',
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#3b82f6',
                                        fontSize: '18px',
                                        zIndex: '1'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-calendar-days' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'datetime-local',
                                        id: 'deadline-input'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '10px 14px 10px 48px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        transition: 'all 0.2s ease',
                                        boxSizing: 'border-box'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (ev) => {
                                            timeIn = ev.target.value
                                        }
                                    },
                                    elementHandler: (el) => {
                                        const formattedDate = formatDateForInput(currentDeadline)
                                        if (formattedDate) {
                                            el.value = formattedDate
                                            timeIn = formattedDate
                                        }
                                        el.addEventListener('focus', () => {
                                            el.style.borderColor = '#3b82f6'
                                            el.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                                            el.style.backgroundColor = '#ffffff'
                                        })
                                        el.addEventListener('blur', () => {
                                            el.style.borderColor = '#e2e8f0'
                                            el.style.boxShadow = 'none'
                                            el.style.backgroundColor = '#f8fafc'
                                        })
                                    }
                                })
                            ]
                        })
                    ]
                }),

                // Submit Button
                $({
                    tag: 'button',
                    text: 'Update Deadline',
                    style: {
                        width: '100%',
                        padding: '10px 24px',
                        backgroundColor: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            if (timeIn !== '') {
                                if (confirm('Are you sure you want to update the submission deadline?')) {
                                    showLoading()
                                    const req = new Request('/eventRequest')
                                    req.Post([
                                        { name: 'updateDeadline', value: '1' },
                                        { name: 'newDate', value: timeIn },
                                        { name: 'eventId', value: eventID }
                                    ])
                                    req.Json()
                                    req.Send().then(responseData => {
                                        hideLoading()
                                        if (responseData.status) {
                                            showNotification('Deadline updated successfully!', 'success')
                                            setTimeout(() => window.location.reload(), 1500)
                                        } else {
                                            showNotification(responseData.message, 'error')
                                        }
                                    }).catch(() => {
                                        hideLoading()
                                        showNotification('Error updating deadline', 'error')
                                    })
                                }
                            } else {
                                showNotification('Please select a deadline date', 'error')
                            }
                        }
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#2563eb'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#3b82f6'
                        })
                    }
                })
            ]
        })
    }

    // Date Holder Modal for Update Presentation Date ONLY
    const dateHolderPresentation = ({ eventID, eventName, currentPresentation }) => {
        let presentationDate = ''

        return $({
            tag: 'div',
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '500px',
                maxWidth: '95%',
                padding: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                position: 'relative'
            },
            child: [
                // Close button
                $({
                    tag: 'span',
                    att: { className: 'fa-solid fa-times' },
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
                    style: { marginBottom: '24px' },
                    child: [
                        $({
                            tag: 'h2',
                            text: 'Update Presentation Date',
                            style: {
                                color: '#1e293b',
                                fontSize: '18px',
                                fontWeight: '600',
                                margin: '0 0 4px 0',
                                letterSpacing: '-0.3px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: eventName || 'Event',
                            style: {
                                color: '#f59e0b',
                                fontSize: '14px',
                                margin: '0',
                                fontWeight: '500'
                            }
                        })
                    ]
                }),

                // Date of Presentation
                $({
                    tag: 'div',
                    style: { marginBottom: '24px' },
                    child: [
                        $({
                            tag: 'label',
                            text: 'Date of Presentation',
                            style: {
                                display: 'block',
                                marginBottom: '6px',
                                color: '#64748b',
                                fontSize: '13px',
                                fontWeight: '500'
                            }
                        }),
                        $({
                            tag: 'div',
                            style: {
                                position: 'relative'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#f59e0b',
                                        fontSize: '18px',
                                        zIndex: '1'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-calendar-alt' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'input',
                                    att: {
                                        type: 'datetime-local',
                                        id: 'presentation-input'
                                    },
                                    style: {
                                        width: '100%',
                                        padding: '10px 14px 10px 48px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        color: '#1e293b',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        transition: 'all 0.2s ease',
                                        boxSizing: 'border-box'
                                    },
                                    event: {
                                        type: 'input',
                                        method: (ev) => {
                                            presentationDate = ev.target.value
                                        }
                                    },
                                    elementHandler: (el) => {
                                        const formattedDate = formatDateForInput(currentPresentation)
                                        if (formattedDate) {
                                            el.value = formattedDate
                                            presentationDate = formattedDate
                                        }
                                        el.addEventListener('focus', () => {
                                            el.style.borderColor = '#f59e0b'
                                            el.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)'
                                            el.style.backgroundColor = '#ffffff'
                                        })
                                        el.addEventListener('blur', () => {
                                            el.style.borderColor = '#e2e8f0'
                                            el.style.boxShadow = 'none'
                                            el.style.backgroundColor = '#f8fafc'
                                        })
                                    }
                                })
                            ]
                        })
                    ]
                }),

                // Submit Button
                $({
                    tag: 'button',
                    text: 'Update Presentation Date',
                    style: {
                        width: '100%',
                        padding: '10px 24px',
                        backgroundColor: '#f59e0b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            if (presentationDate !== '') {
                                if (confirm('Are you sure you want to update the presentation date?')) {
                                    showLoading()
                                    const req = new Request('/eventRequest')
                                    req.Post([
                                        { name: 'updatePresentationDate', value: '1' },
                                        { name: 'presentationDate', value: presentationDate },
                                        { name: 'eventId', value: eventID }
                                    ])
                                    req.Json()
                                    req.Send().then(responseData => {
                                        hideLoading()
                                        if (responseData.status) {
                                            showNotification('Presentation date updated successfully!', 'success')
                                            setTimeout(() => window.location.reload(), 1500)
                                        } else {
                                            showNotification(responseData.message, 'error')
                                        }
                                    }).catch(() => {
                                        hideLoading()
                                        showNotification('Error updating presentation date', 'error')
                                    })
                                }
                            } else {
                                showNotification('Please select a presentation date', 'error')
                            }
                        }
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#d97706'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#f59e0b'
                        })
                    }
                })
            ]
        })
    }

    // Event Object - Single event row
    const eventObject = ({ Evename, status, deadline, presentationDate, eventID, scoreId }) => {
        // Open deadline update modal
        const openDeadlineModal = () => {
            if (modalElement) modalElement.remove()

            modalElement = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '4000',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    dateHolderDeadline({
                        eventID: eventID,
                        eventName: Evename,
                        currentDeadline: deadline
                    })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        if (e.target === e.currentTarget) {
                            closeModal()
                        }
                    }
                }
            })

            document.body.appendChild(modalElement)
        }

        // Open presentation date update modal
        const openPresentationModal = () => {
            if (modalElement) modalElement.remove()

            modalElement = $({
                tag: 'div',
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15,23,42,0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '4000',
                    backdropFilter: 'blur(4px)'
                },
                child: [
                    dateHolderPresentation({
                        eventID: eventID,
                        eventName: Evename,
                        currentPresentation: presentationDate
                    })
                ],
                event: {
                    type: 'click',
                    method: (e) => {
                        if (e.target === e.currentTarget) {
                            closeModal()
                        }
                    }
                }
            })

            document.body.appendChild(modalElement)
        }

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'fit-content',
                width: '100%',
                margin: '4px 0',
                padding: '12px 12px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9',
                transition: 'all 0.2s ease',
                gap: '8px'
            },
            att: {
                className: 'eventDet'
            },
            child: [
                // Score Board Link
                $({
                    tag: 'a',
                    att: {
                        className: 'fa-solid fa-folder-open',
                        href: '/admin/events/scoreBoard/' + eventID
                    },
                    style: {
                        margin: 'auto',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        flexShrink: '0'
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(59,130,246,0.15)'
                            el.style.transform = 'scale(1.05)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(59,130,246,0.08)'
                            el.style.transform = 'scale(1)'
                        })
                    }
                }),

                // Event Name
                $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '13px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        color: '#1e293b',
                        margin: 'auto',
                        minWidth: '0',
                        fontWeight: '500'
                    },
                    text: Evename,
                    title: Evename
                }),

                // Status Badge
                $({
                    tag: 'div',
                    style: {
                        width: '80px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        textAlign: 'center',
                        height: 'fit-content',
                        margin: 'auto',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        flexShrink: '0'
                    },
                    elementHandler: async (el) => {
                        try {
                            const req = new Request('/eventState')
                            req.Post([
                                { name: 'checkDeadLine', value: '0' },
                                { name: 'eventId', value: eventID }
                            ])
                            req.Json()
                            req.Send().then(responseData => {
                                el.innerText = (responseData.status) ? "Active" : 'Closed'
                                el.style.color = (responseData.status) ? '#22c55e' : '#ef4444'
                                el.style.backgroundColor = (responseData.status) ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'
                                el.style.border = (responseData.status) ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(239,68,68,0.15)'
                            }).catch(() => {
                                el.innerText = "Unknown"
                                el.style.color = '#94a3b8'
                                el.style.backgroundColor = 'rgba(148,163,184,0.08)'
                                el.style.border = '1px solid rgba(148,163,184,0.15)'
                            })
                        } catch (e) {
                            el.innerText = "Error"
                            el.style.color = '#94a3b8'
                        }
                    },
                    text: (status) ? "Active" : "Closed"
                }),

                // Presentation Date - Click to update presentation date only
                $({
                    tag: 'div',
                    style: {
                        width: '140px',
                        height: 'fit-content',
                        padding: '5px 10px',
                        textAlign: "center",
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        backgroundColor: 'rgba(245,158,11,0.06)',
                        borderRadius: '6px',
                        color: '#f59e0b',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: '0',
                        border: '1px solid rgba(245,158,11,0.12)'
                    },
                    text: presentationDate && presentationDate !== '0000-00-00 00:00:00' ? formatDate(presentationDate) : 'Set Date',
                    title: 'Click to update Presentation Date',
                    event: {
                        type: 'click',
                        method: openPresentationModal
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(245,158,11,0.12)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(245,158,11,0.06)'
                        })
                    }
                }),

                // Deadline Date - Click to update deadline only
                $({
                    tag: 'div',
                    style: {
                        width: '140px',
                        height: 'fit-content',
                        padding: '5px 10px',
                        textAlign: "center",
                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: '12px',
                        backgroundColor: 'rgba(59,130,246,0.06)',
                        borderRadius: '6px',
                        color: '#3b82f6',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: '0',
                        border: '1px solid rgba(59,130,246,0.12)'
                    },
                    text: deadline && deadline !== '0000-00-00 00:00:00' ? formatDate(deadline) : 'Set Date',
                    title: 'Click to update Submission Deadline',
                    event: {
                        type: 'click',
                        method: openDeadlineModal
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(59,130,246,0.12)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(59,130,246,0.06)'
                        })
                    }
                }),

                // Delete Button
                $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-trash-can'
                    },
                    style: {
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 'auto',
                        fontSize: '13px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        flexShrink: '0'
                    },
                    title: 'Delete Event',
                    event: {
                        type: 'click',
                        method: () => {
                            if (confirm("Do you want to delete this event? This action cannot be undone.")) {
                                showLoading()
                                const req = new Request('/eventRequest')
                                req.Post([
                                    { name: 'deleteEvent', value: '1' },
                                    { name: 'eventId', value: eventID }
                                ])
                                req.Json()
                                req.Send().then(responseData => {
                                    hideLoading()
                                    if (responseData.status) {
                                        showNotification('Event deleted successfully!', 'success')
                                        setTimeout(() => window.location.reload(), 1500)
                                    } else {
                                        showNotification(responseData.message || 'Error deleting event', 'error')
                                    }
                                }).catch(() => {
                                    hideLoading()
                                    showNotification('Error connecting to server', 'error')
                                })
                            }
                        }
                    },
                    elementHandler: (el) => {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = 'rgba(239,68,68,0.12)'
                            el.style.transform = 'scale(1.05)'
                        })
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = 'rgba(239,68,68,0.06)'
                            el.style.transform = 'scale(1)'
                        })
                    }
                })
            ],
            elementHandler: () => {
                const base = window.location.href
                const url = base.replace(window.location.origin, '').split('/')
                if (url[3] === 'scoreBoard') {
                    if (url[4] === eventID) {
                        const isInHouse = Evename.toLowerCase().includes('in-house') || 
                                        Evename.toLowerCase().includes('inhouse');
                        
                        if (isInHouse) {
                            import('./scoreSheet/scoreSheetInHouse.js').then(module => {
                                mainFrame.appendChild(module.AddScoreSheetInHouse({
                                    id: scoreId,
                                    eventID: eventID,
                                    name: Evename
                                }))
                            })
                        } else {
                            mainFrame.appendChild(AddScoreSheet({
                                id: scoreId,
                                eventID: eventID,
                                name: Evename
                            }))
                        }
                    }
                }
            }
        })
    }

    // Event List Component
    const eventList = () => {
        return $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff'
            },
            child: [
                // Header
                $({
                    tag: 'div',
                    style: {
                        padding: '16px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: '#ffffff'
                    },
                    child: [
                        $({
                            tag: 'h2',
                            text: 'Event List',
                            style: {
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '16px',
                                color: '#1e293b',
                                margin: '0',
                                fontWeight: '600',
                                letterSpacing: '-0.3px'
                            }
                        }),
                        $({
                            tag: 'p',
                            text: 'Manage existing events, update deadlines, and create criteria',
                            style: {
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: '12px',
                                color: '#94a3b8',
                                margin: '2px 0 0 0'
                            }
                        })
                    ]
                }),

                // Column Headers
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        gap: '8px',
                        position: 'sticky',
                        top: '0',
                        zIndex: '1'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: '',
                            style: {
                                width: '32px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Event Name',
                            style: {
                                flex: '1',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: '600',
                                fontSize: '11px',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                minWidth: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Status',
                            style: {
                                width: '80px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: '600',
                                fontSize: '11px',
                                color: '#94a3b8',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Presentation',
                            style: {
                                width: '140px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: '600',
                                fontSize: '11px',
                                color: '#94a3b8',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: 'Deadline',
                            style: {
                                width: '140px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: '600',
                                fontSize: '11px',
                                color: '#94a3b8',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: '0'
                            }
                        }),
                        $({
                            tag: 'div',
                            text: '',
                            style: {
                                width: '32px',
                                flexShrink: '0'
                            }
                        })
                    ]
                }),

                // Scrollable Event List
                $({
                    tag: 'div',
                    style: {
                        flex: '1',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '6px 12px',
                        backgroundColor: '#fafafa'
                    },
                    elementHandler: async (el) => {
                        showLoading()

                        const form = new FormData()
                        form.append('getEventAdmin', 'true')

                        try {
                            const response = await fetch('/eventRequest', {
                                method: 'POST',
                                body: form
                            })

                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`)
                            }

                            const data = await response.json()

                            if (data && data.length > 0) {
                                data.forEach(val => {
                                    const rawDeadline = val.dead_line || null
                                    let displayDeadline = '—'
                                    if (rawDeadline && rawDeadline !== '0000-00-00 00:00:00') {
                                        const dateParts = rawDeadline.split(' ')[0].split('-')
                                        const month = MONTHS[(parseInt(dateParts[1]) - 1)]
                                        const day = dateParts[2]
                                        const year = dateParts[0]
                                        displayDeadline = `${year} - ${month} - ${day}`
                                    }

                                    el.appendChild(eventObject({
                                        Evename: val.name,
                                        status: Boolean(val.status * 1),
                                        eventID: val.id,
                                        deadline: rawDeadline,
                                        presentationDate: val.date_of_presentation || null,
                                        scoreId: val.scID
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
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: 'fa-solid fa-calendar-xmark' },
                                            style: {
                                                fontSize: '48px',
                                                marginBottom: '16px',
                                                color: '#e2e8f0'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'No Events Found',
                                            style: {
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#64748b'
                                            }
                                        }),
                                        $({
                                            tag: 'div',
                                            text: 'Create your first event to get started',
                                            style: {
                                                fontSize: '13px',
                                                marginTop: '4px',
                                                color: '#94a3b8'
                                            }
                                        })
                                    ]
                                }))
                            }
                        } catch (error) {
                            console.error('Error fetching events:', error)
                            el.appendChild($({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#ef4444',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: '14px'
                                },
                                text: 'Failed to load events. Please try again.'
                            }))
                        } finally {
                            hideLoading()
                        }
                    }
                })
            ]
        })
    }

    // Main Container
    return $({
        tag: 'div',
        style: {
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#f8fafc'
        },
        externalStyle: '/client/component/adminComponent/componentStyle/event.css',
        elementHandler: (el) => {
            mainFrame = el
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0'
                },
                child: [
                    // Left Panel - Add Event
                    $({
                        tag: 'div',
                        style: {
                            width: '38%',
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            borderRight: '1px solid #f1f5f9',
                            overflowY: 'auto'
                        },
                        child: [
                            eventBox()
                        ]
                    }),
                    // Right Panel - Event List
                    $({
                        tag: 'div',
                        style: {
                            width: '62%',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden'
                        },
                        child: [
                            eventList()
                        ]
                    })
                ]
            })
        ]
    })
}